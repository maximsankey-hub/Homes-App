import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const neighborhoodScoreRouter = Router();

neighborhoodScoreRouter.post('/properties/:id/neighborhood-score', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { curbAppeal, streetVibe, feeling, note } = req.body ?? {};
  if ([curbAppeal, streetVibe].some((v) => typeof v !== 'number')) {
    res.status(400).json({ error: 'curbAppeal and streetVibe must be numbers' });
    return;
  }
  const scorerId = req.scorerId!;

  const score = await prisma.neighborhoodScore.upsert({
    where: { propertyId_scorerId: { propertyId: req.params.id, scorerId } },
    update: { curbAppeal, streetVibe, feeling, note },
    create: { propertyId: req.params.id, scorerId, curbAppeal, streetVibe, feeling, note },
  });

  await prisma.property.update({
    where: { id: req.params.id },
    data: { status: 'VISITED', lastVisitedAt: new Date() },
  });

  res.status(201).json(score);
});
