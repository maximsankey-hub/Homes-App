import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const propertyMetricScoreRouter = Router();

propertyMetricScoreRouter.post('/properties/:id/metric-scores', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { scores } = req.body ?? {};
  const entries: { metricId: string; value: number }[] = Array.isArray(scores)
    ? scores.filter((s) => typeof s?.metricId === 'string' && typeof s?.value === 'number')
    : [];

  const householdMetrics = await prisma.customMetric.findMany({
    where: { householdId: req.householdId, scope: 'PROPERTY', id: { in: entries.map((e) => e.metricId) } },
    select: { id: true },
  });
  const validMetricIds = new Set(householdMetrics.map((m) => m.id));
  const validEntries = entries.filter((e) => validMetricIds.has(e.metricId));

  const scorerId = req.scorerId!;

  await prisma.$transaction([
    prisma.propertyMetricScore.deleteMany({ where: { propertyId: req.params.id, scorerId } }),
    prisma.propertyMetricScore.createMany({
      data: validEntries.map((e) => ({ propertyId: req.params.id, scorerId, metricId: e.metricId, value: e.value })),
    }),
    prisma.property.update({ where: { id: req.params.id }, data: { status: 'VISITED', lastVisitedAt: new Date() } }),
  ]);

  const saved = await prisma.propertyMetricScore.findMany({
    where: { propertyId: req.params.id, scorerId },
    include: { metric: true },
  });

  res.status(201).json(
    saved.map((s) => ({ metricId: s.metricId, label: s.metric.label, category: s.metric.category, value: s.value })),
  );
});
