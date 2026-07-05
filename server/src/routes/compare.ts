import { Router } from 'express';
import type { AIInsight, Badge, CompareResult, PropertySummary } from 'shared';
import { prisma } from '../lib/prisma.js';
import { aggregateSelfScores } from '../services/scoreAggregation.js';

export const compareRouter = Router();

function buildBadges(status: string, score: number | null, roomCount: number, mediaCount: number): Badge[] {
  if (status === 'NOT_VISITED') return [{ text: 'Awaiting visit', variant: 'warning' }];
  const badges: Badge[] = [];
  if (score !== null && score >= 8) badges.push({ text: 'Strong fit', variant: 'success' });
  if (roomCount > 0) badges.push({ text: `${roomCount} rooms`, variant: 'accent' });
  if (mediaCount > 0) badges.push({ text: `${mediaCount} media`, variant: 'purple' });
  return badges;
}

async function loadPropertyWithAggregate(id: string, householdId: string, scorerId: string) {
  const property = await prisma.property.findFirst({
    where: { id, householdId },
    include: { rooms: { include: { scores: true } }, media: true, neighborhoodScores: true },
  });
  if (!property) return null;
  const allScores = property.rooms.flatMap((r) => r.scores);
  const neighborhood = property.neighborhoodScores.find((n) => n.scorerId === scorerId) ?? null;
  const agg = aggregateSelfScores(allScores, neighborhood);
  const summary: PropertySummary = {
    id: property.id,
    address: property.address,
    city: property.city,
    state: property.state,
    listingPrice: property.listingPrice,
    sqft: property.sqft,
    beds: property.beds,
    baths: property.baths,
    status: property.status,
    lastVisitedAt: property.lastVisitedAt ? property.lastVisitedAt.toISOString() : null,
    score: agg.score,
    scoreColor: agg.scoreColor,
    badges: buildBadges(property.status, agg.score, property.rooms.length, property.media.length),
  };
  return { summary, agg };
}

compareRouter.get('/', async (req, res) => {
  const { a, b } = req.query;
  if (!a || !b) {
    res.status(400).json({ error: 'a and b query params are required' });
    return;
  }

  const [propA, propB] = await Promise.all([
    loadPropertyWithAggregate(String(a), req.householdId!, req.scorerId!),
    loadPropertyWithAggregate(String(b), req.householdId!, req.scorerId!),
  ]);
  if (!propA || !propB) {
    res.status(404).json({ error: 'One or both properties not found' });
    return;
  }

  const dimensions = propA.agg.factorBreakdown.map((fa) => {
    const fb = propB.agg.factorBreakdown.find((f) => f.label === fa.label);
    return { label: fa.label, aValue: fa.value, bValue: fb?.value ?? 0 };
  });

  const aiInsights: AIInsight[] = [];
  if (dimensions.length > 0) {
    const biggestGap = [...dimensions].sort((x, y) => Math.abs(y.aValue - y.bValue) - Math.abs(x.aValue - x.bValue))[0];
    const aWins = biggestGap.aValue > biggestGap.bValue;
    aiInsights.push({
      label: 'Tradeoff',
      icon: 'ti-scale',
      text: `${aWins ? propA.summary.address : propB.summary.address} leads on ${biggestGap.label.toLowerCase()} (${Math.max(biggestGap.aValue, biggestGap.bValue).toFixed(1)} vs ${Math.min(biggestGap.aValue, biggestGap.bValue).toFixed(1)}) — your biggest differentiator between these two.`,
    });
  }
  if (propA.agg.score !== null && propB.agg.score !== null) {
    const higher = propA.agg.score >= propB.agg.score ? propA.summary : propB.summary;
    aiInsights.push({
      label: 'Overall fit',
      icon: 'ti-target',
      text: `${higher.address} scores higher overall (${Math.max(propA.agg.score, propB.agg.score).toFixed(1)} vs ${Math.min(propA.agg.score, propB.agg.score).toFixed(1)}), based on your visit scores so far.`,
    });
  }

  const result: CompareResult = { propertyA: propA.summary, propertyB: propB.summary, dimensions, aiInsights };
  res.json(result);
});
