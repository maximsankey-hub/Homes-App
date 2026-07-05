import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { getSelfScorerId } from '../lib/defaultScorer.js';

export const neighborhoodScoreRouter = Router();

neighborhoodScoreRouter.post('/properties/:id/neighborhood-score', async (req, res) => {
  const { curbAppeal, streetVibe, feeling, note } = req.body ?? {};
  if ([curbAppeal, streetVibe].some((v) => typeof v !== 'number')) {
    res.status(400).json({ error: 'curbAppeal and streetVibe must be numbers' });
    return;
  }
  const scorerId = await getSelfScorerId();

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
