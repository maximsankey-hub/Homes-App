import { Router } from 'express';
import type { MetricCategory, MetricScope } from '@prisma/client';
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
  const { label, category, scope, targetRoomName, weight } = req.body ?? {};
  if (!label || (category !== 'EMOTIONAL' && category !== 'FUNCTIONAL')) {
    res.status(400).json({ error: 'label and category (EMOTIONAL or FUNCTIONAL) are required' });
    return;
  }
  if (scope !== undefined && scope !== 'ROOM' && scope !== 'PROPERTY') {
    res.status(400).json({ error: 'scope must be ROOM or PROPERTY' });
    return;
  }

  const metric = await prisma.customMetric.upsert({
    where: { householdId_label: { householdId: req.householdId!, label } },
    update: {
      category: category as MetricCategory,
      scope: (scope as MetricScope) ?? undefined,
      targetRoomName: targetRoomName ?? null,
      weight: typeof weight === 'number' ? weight : undefined,
    },
    create: {
      householdId: req.householdId!,
      label,
      category: category as MetricCategory,
      scope: (scope as MetricScope) ?? 'ROOM',
      targetRoomName: targetRoomName ?? null,
      weight: typeof weight === 'number' ? weight : undefined,
    },
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
