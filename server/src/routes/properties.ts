import { Router } from 'express';
import type { Badge, PropertyDetail, PropertySummary } from 'shared';
import { prisma } from '../lib/prisma.js';
import { formatK } from '../lib/format.js';
import { aggregateSelfScores, secondaryInsights } from '../services/scoreAggregation.js';
import { getPropertyOverviewInsights } from '../services/aiInsights.js';
import { buildPartnerComparison } from '../services/partnerComparison.js';

export const propertiesRouter = Router();

function buildBadges(status: string, score: number | null, roomCount: number, mediaCount: number): Badge[] {
  if (status === 'NOT_VISITED') {
    return [{ text: 'Awaiting visit', variant: 'warning' }];
  }
  const badges: Badge[] = [];
  if (score !== null && score >= 8) {
    badges.push({ text: 'Strong fit', variant: 'success' });
  }
  if (roomCount > 0) badges.push({ text: `${roomCount} rooms`, variant: 'accent' });
  if (mediaCount > 0) badges.push({ text: `${mediaCount} media`, variant: 'purple' });
  return badges;
}

propertiesRouter.get('/', async (req, res) => {
  const properties = await prisma.property.findMany({
    where: { householdId: req.householdId },
    include: {
      rooms: { include: { scores: true } },
      media: true,
      neighborhoodScores: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const summaries: PropertySummary[] = properties.map((p) => {
    const allScores = p.rooms.flatMap((r) => r.scores);
    const neighborhood = p.neighborhoodScores.find((n) => n.scorerId === req.scorerId) ?? null;
    const agg = aggregateSelfScores(allScores, neighborhood);
    return {
      id: p.id,
      address: p.address,
      city: p.city,
      state: p.state,
      listingPrice: p.listingPrice,
      sqft: p.sqft,
      beds: p.beds,
      baths: p.baths,
      status: p.status,
      lastVisitedAt: p.lastVisitedAt ? p.lastVisitedAt.toISOString() : null,
      score: agg.score,
      scoreColor: agg.scoreColor,
      badges: buildBadges(p.status, agg.score, p.rooms.length, p.media.length),
    };
  });

  res.json(summaries);
});

propertiesRouter.post('/', async (req, res) => {
  const { address, city, state, listingPrice, sqft, beds, baths, yearBuilt } = req.body ?? {};
  if (!address || typeof listingPrice !== 'number') {
    res.status(400).json({ error: 'address and listingPrice are required' });
    return;
  }

  const property = await prisma.property.create({
    data: {
      householdId: req.householdId!,
      address,
      city: city ?? '',
      state: state ?? '',
      listingPrice,
      sqft: sqft ?? 0,
      beds: beds ?? 0,
      baths: baths ?? 0,
      yearBuilt: yearBuilt ?? null,
    },
  });

  res.status(201).json(property);
});

propertiesRouter.put('/:id', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { address, city, state, listingPrice, sqft, beds, baths, yearBuilt } = req.body ?? {};

  const property = await prisma.property.update({
    where: { id: req.params.id },
    data: {
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(listingPrice !== undefined && { listingPrice }),
      ...(sqft !== undefined && { sqft }),
      ...(beds !== undefined && { beds }),
      ...(baths !== undefined && { baths }),
      ...(yearBuilt !== undefined && { yearBuilt }),
    },
  });

  res.json(property);
});

propertiesRouter.delete('/:id', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }
  await prisma.property.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

propertiesRouter.get('/:id', async (req, res) => {
  const property = await prisma.property.findFirst({
    where: { id: req.params.id, householdId: req.householdId },
    include: {
      rooms: { include: { scores: { include: { scorer: true } }, media: true } },
      media: true,
      nearbyPlaces: true,
      neighborhoodScores: { include: { scorer: true } },
    },
  });

  if (!property) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const myNeighborhoodScore = property.neighborhoodScores.find((n) => n.scorerId === req.scorerId) ?? null;
  const allScores = property.rooms.flatMap((r) => r.scores);
  const agg = aggregateSelfScores(allScores, myNeighborhoodScore);

  const untaggedMedia = property.media.filter((m) => m.roomId === null);
  const mediaCount = property.media.length;

  const rooms = property.rooms.map((r) => ({
    id: r.id,
    propertyId: r.propertyId,
    name: r.name,
    icon: r.icon,
    media: r.media.map((m) => ({
      id: m.id,
      propertyId: m.propertyId,
      roomId: m.roomId,
      type: m.type,
      filePath: m.filePath,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      createdAt: m.createdAt.toISOString(),
    })),
    scores: r.scores.map((s) => ({
      id: s.id,
      roomId: s.roomId,
      scorer: {
        id: s.scorer.id,
        name: s.scorer.name,
        role: s.scorer.role,
        initials: s.scorer.initials,
        colorHex: s.scorer.colorHex,
        contact: s.scorer.contact,
      },
      layout: s.layout,
      storage: s.storage,
      light: s.light,
      vibe: s.vibe,
      feeling: s.feeling,
      note: s.note,
      emotionalAvg: (s.light + s.vibe) / 2,
      functionalAvg: (s.layout + s.storage) / 2,
      createdAt: s.createdAt.toISOString(),
    })),
  }));

  const visitSummary =
    property.status === 'NOT_VISITED'
      ? 'No visit data yet'
      : `Visited ${property.lastVisitedAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} · ${property.rooms.length} rooms · ${mediaCount} media`;

  const detail: PropertyDetail = {
    id: property.id,
    address: property.address,
    city: property.city,
    state: property.state,
    listingPrice: property.listingPrice,
    sqft: property.sqft,
    beds: property.beds,
    baths: property.baths,
    yearBuilt: property.yearBuilt,
    status: property.status,
    lastVisitedAt: property.lastVisitedAt ? property.lastVisitedAt.toISOString() : null,
    score: agg.score,
    scoreColor: agg.scoreColor,
    badges: buildBadges(property.status, agg.score, property.rooms.length, mediaCount),
    fitLabel: agg.fitLabel,
    visitSummary,
    metrics: [
      { value: formatK(property.listingPrice), label: 'List price' },
      { value: property.sqft.toLocaleString(), label: 'Sq ft' },
      { value: `${property.beds}/${property.baths}`, label: 'Beds/baths' },
      { value: property.yearBuilt ? String(property.yearBuilt) : '—', label: 'Year built' },
    ],
    aiInsights: getPropertyOverviewInsights(property, agg),
    rooms,
    neighborhoodScore: myNeighborhoodScore
      ? {
          id: myNeighborhoodScore.id,
          propertyId: myNeighborhoodScore.propertyId,
          scorer: {
            id: myNeighborhoodScore.scorer.id,
            name: myNeighborhoodScore.scorer.name,
            role: myNeighborhoodScore.scorer.role,
            initials: myNeighborhoodScore.scorer.initials,
            colorHex: myNeighborhoodScore.scorer.colorHex,
            contact: myNeighborhoodScore.scorer.contact,
          },
          curbAppeal: myNeighborhoodScore.curbAppeal,
          streetVibe: myNeighborhoodScore.streetVibe,
          feeling: myNeighborhoodScore.feeling,
          note: myNeighborhoodScore.note,
          createdAt: myNeighborhoodScore.createdAt.toISOString(),
        }
      : null,
    untaggedMedia: untaggedMedia.map((m) => ({
      id: m.id,
      propertyId: m.propertyId,
      roomId: m.roomId,
      type: m.type,
      filePath: m.filePath,
      mimeType: m.mimeType,
      sizeBytes: m.sizeBytes,
      createdAt: m.createdAt.toISOString(),
    })),
    factorBreakdown: agg.factorBreakdown,
    emotionalAvg: agg.emotionalAvg,
    functionalAvg: agg.functionalAvg,
    secondaryInsights: secondaryInsights(agg),
    walkScore: property.walkScore,
    transitScore: property.transitScore,
    bikeScore: property.bikeScore,
    neighborhoodCharacter: [
      { label: 'Safety', value: property.safetyScore ?? 0, color: '#1D9E75', textColor: '#085041' },
      { label: 'Noise level', value: property.noiseScore ?? 0, color: '#EF9F27', textColor: '#633806' },
      { label: 'Green space', value: property.greenSpaceScore ?? 0, color: '#1D9E75', textColor: '#085041' },
      { label: 'Sidewalk quality', value: property.sidewalkScore ?? 0, color: '#378ADD', textColor: '#0C447C' },
    ],
  };

  res.json(detail);
});

propertiesRouter.get('/:id/partner-comparison', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const rooms = await prisma.room.findMany({
    where: { propertyId: req.params.id },
    include: { scores: { include: { scorer: true } } },
  });

  // "Partner" here means "whoever else is in the household" from the current
  // viewer's perspective — not the PARTNER role specifically, since either
  // household member can log in and view this comparison from their own side.
  const partnerJoined = await prisma.scorer.findFirst({
    where: { householdId: req.householdId, id: { not: req.scorerId } },
  });

  const roomNamesById = new Map(rooms.map((r) => [r.id, r.name]));
  const selfScores = rooms.flatMap((r) => r.scores.filter((s) => s.scorerId === req.scorerId));
  const partnerScores = rooms.flatMap((r) => r.scores.filter((s) => s.scorerId !== req.scorerId));

  let partnerNote: string | null = null;
  if (partnerScores.length > 0) {
    const note = await prisma.scorerNote.findFirst({
      where: { propertyId: req.params.id, scorerId: partnerScores[0].scorerId },
    });
    partnerNote = note?.text ?? null;
  }

  const comparison = buildPartnerComparison(selfScores, partnerScores, roomNamesById, partnerNote, !!partnerJoined);
  res.json(comparison);
});
