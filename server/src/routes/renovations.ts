import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const renovationsRouter = Router();

renovationsRouter.get('/properties/:id/renovations', async (req, res) => {
  const renovations = await prisma.renovationIdea.findMany({ where: { propertyId: req.params.id } });
  res.json(renovations);
});

renovationsRouter.post('/properties/:id/renovations', async (req, res) => {
  const { title, room, type, costLow, costHigh, feasibility, need, constraintNote } = req.body ?? {};
  if (!title || !room) {
    res.status(400).json({ error: 'title and room are required' });
    return;
  }

  const renovation = await prisma.renovationIdea.create({
    data: {
      propertyId: req.params.id,
      title,
      room,
      type: type ?? 'COSMETIC',
      costLow: costLow ?? 0,
      costHigh: costHigh ?? 0,
      feasibility: feasibility ?? 50,
      need: need ?? null,
      constraintNote: constraintNote ?? null,
    },
  });

  res.status(201).json(renovation);
});

renovationsRouter.delete('/renovations/:id', async (req, res) => {
  await prisma.renovationIdea.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
