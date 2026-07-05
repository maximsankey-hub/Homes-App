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
    },
    include: { media: true },
  });

  res.status(201).json(renovation);
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
