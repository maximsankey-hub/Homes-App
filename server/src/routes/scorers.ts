import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const scorersRouter = Router();

scorersRouter.get('/', async (_req, res) => {
  const scorers = await prisma.scorer.findMany();
  res.json(scorers);
});

const PARTNER_COLORS = ['#534AB7', '#3C3489', '#0C447C'];

scorersRouter.post('/', async (req, res) => {
  const { name, contact } = req.body ?? {};
  if (!name) {
    res.status(400).json({ error: 'name is required' });
    return;
  }
  const initials = name
    .split(' ')
    .map((part: string) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const scorer = await prisma.scorer.create({
    data: {
      name,
      role: 'PARTNER',
      initials,
      colorHex: PARTNER_COLORS[Math.floor(Math.random() * PARTNER_COLORS.length)],
      contact: contact ?? null,
    },
  });

  res.status(201).json(scorer);
});
