import { Router } from 'express';
import type { MetricCategory } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const customMetricsRouter = Router();

customMetricsRouter.get('/', async (req, res) => {
  const metrics = await prisma.customMetric.findMany({
    where: { householdId: req.householdId },
    orderBy: { createdAt: 'asc' },
  });
  res.json(metrics);
});

customMetricsRouter.post('/', async (req, res) => {
  const { label, category } = req.body ?? {};
  if (!label || (category !== 'EMOTIONAL' && category !== 'FUNCTIONAL')) {
    res.status(400).json({ error: 'label and category (EMOTIONAL or FUNCTIONAL) are required' });
    return;
  }

  const metric = await prisma.customMetric.create({
    data: { householdId: req.householdId!, label, category: category as MetricCategory },
  });
  res.status(201).json(metric);
});

customMetricsRouter.patch('/:id', async (req, res) => {
  const existing = await prisma.customMetric.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!existing) {
    res.status(404).json({ error: 'Custom metric not found' });
    return;
  }

  const { weight } = req.body ?? {};
  const metric = await prisma.customMetric.update({
    where: { id: existing.id },
    data: { weight: typeof weight === 'number' ? weight : existing.weight },
  });
  res.json(metric);
});

customMetricsRouter.delete('/:id', async (req, res) => {
  const existing = await prisma.customMetric.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!existing) {
    res.status(404).json({ error: 'Custom metric not found' });
    return;
  }

  await prisma.customMetric.delete({ where: { id: existing.id } });
  res.status(204).end();
});
