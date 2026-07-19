import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { estimateRenovationCost } from '../services/costEstimation.js';

export const renovationsRouter = Router();

renovationsRouter.get('/properties/:id/renovations', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const renovations = await prisma.renovationIdea.findMany({
    where: { propertyId: req.params.id },
    include: { media: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json(renovations);
});

renovationsRouter.post('/properties/:id/renovations', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { title, room, type, costLow, costHigh, feasibility, need, constraintNote } = req.body ?? {};
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const count = await prisma.renovationIdea.count({ where: { propertyId: req.params.id } });

  const renovation = await prisma.renovationIdea.create({
    data: {
      propertyId: req.params.id,
      title,
      room: room || null,
      type: type ?? 'COSMETIC',
      costLow: costLow ?? 0,
      costHigh: costHigh ?? 0,
      feasibility: feasibility ?? 50,
      need: need ?? null,
      constraintNote: constraintNote ?? null,
      sortOrder: count,
    },
    include: { media: true },
  });

  res.status(201).json(renovation);
});

renovationsRouter.post('/properties/:id/renovations/reorder', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { orderedIds } = req.body ?? {};
  if (!Array.isArray(orderedIds) || orderedIds.some((id) => typeof id !== 'string')) {
    res.status(400).json({ error: 'orderedIds must be an array of strings' });
    return;
  }

  const owned2 = await prisma.renovationIdea.findMany({ where: { id: { in: orderedIds }, propertyId: req.params.id }, select: { id: true } });
  const ownedIds = new Set(owned2.map((r) => r.id));

  await prisma.$transaction(
    orderedIds
      .filter((id: string) => ownedIds.has(id))
      .map((id: string, index: number) => prisma.renovationIdea.update({ where: { id }, data: { sortOrder: index } })),
  );

  const renovations = await prisma.renovationIdea.findMany({
    where: { propertyId: req.params.id },
    include: { media: true },
    orderBy: { sortOrder: 'asc' },
  });
  res.json(renovations);
});

renovationsRouter.post('/renovations/estimate-cost', (req, res) => {
  const { description, type } = req.body ?? {};
  if (!description) {
    res.status(400).json({ error: 'description is required' });
    return;
  }
  res.json(estimateRenovationCost(description, type === 'STRUCTURAL' ? 'STRUCTURAL' : 'COSMETIC'));
});

renovationsRouter.patch('/renovations/:id', async (req, res) => {
  const owned = await prisma.renovationIdea.findFirst({
    where: { id: req.params.id, property: { householdId: req.householdId } },
  });
  if (!owned) {
    res.status(404).json({ error: 'Renovation idea not found' });
    return;
  }

  const { room } = req.body ?? {};
  const renovation = await prisma.renovationIdea.update({
    where: { id: req.params.id },
    data: { room: room || null },
    include: { media: true },
  });
  res.json(renovation);
});

renovationsRouter.delete('/renovations/:id', async (req, res) => {
  const owned = await prisma.renovationIdea.findFirst({
    where: { id: req.params.id, property: { householdId: req.householdId } },
  });
  if (!owned) {
    res.status(404).json({ error: 'Renovation idea not found' });
    return;
  }
  await prisma.renovationIdea.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
