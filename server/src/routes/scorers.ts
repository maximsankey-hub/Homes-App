import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const scorersRouter = Router();

scorersRouter.get('/', async (req, res) => {
  const scorers = await prisma.scorer.findMany({ where: { householdId: req.householdId } });
  res.json(scorers);
});
