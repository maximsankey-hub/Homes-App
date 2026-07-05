import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { emotionalAvgOf, functionalAvgOf, toScoredCustom } from '../services/scoreAggregation.js';

export const roomsRouter = Router();

// Nested under /api/properties/:id/rooms — create-or-get a room by name (idempotent).
export async function createOrGetRoom(propertyId: string, name: string, icon: string) {
  const existing = await prisma.room.findUnique({ where: { propertyId_name: { propertyId, name } } });
  if (existing) return existing;
  return prisma.room.create({ data: { propertyId, name, icon } });
}

roomsRouter.post('/properties/:id/rooms', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const { name, icon } = req.body ?? {};
  if (!name || !icon) {
    res.status(400).json({ error: 'name and icon are required' });
    return;
  }
  const room = await createOrGetRoom(req.params.id, name, icon);

  await prisma.property.update({
    where: { id: req.params.id },
    data: { status: 'VISITED', lastVisitedAt: new Date() },
  });

  res.status(201).json(room);
});

roomsRouter.post('/rooms/:roomId/scores', async (req, res) => {
  const room = await prisma.room.findFirst({
    where: { id: req.params.roomId, property: { householdId: req.householdId } },
  });
  if (!room) {
    res.status(404).json({ error: 'Room not found' });
    return;
  }

  const { layout, storage, light, vibe, feeling, note, customScores } = req.body ?? {};
  if ([layout, storage, light, vibe].some((v) => typeof v !== 'number')) {
    res.status(400).json({ error: 'layout, storage, light, vibe must be numbers' });
    return;
  }
  const customEntries: { metricId: string; value: number }[] = Array.isArray(customScores)
    ? customScores.filter((c) => typeof c?.metricId === 'string' && typeof c?.value === 'number')
    : [];
  const scorerId = req.scorerId!;

  const score = await prisma.roomScore.upsert({
    where: { roomId_scorerId: { roomId: req.params.roomId, scorerId } },
    update: {
      layout,
      storage,
      light,
      vibe,
      feeling,
      note,
      customScores: {
        deleteMany: {},
        create: customEntries.map((c) => ({ metricId: c.metricId, value: c.value })),
      },
    },
    create: {
      roomId: req.params.roomId,
      scorerId,
      layout,
      storage,
      light,
      vibe,
      feeling,
      note,
      customScores: { create: customEntries.map((c) => ({ metricId: c.metricId, value: c.value })) },
    },
    include: { customScores: { include: { metric: true } } },
  });

  const mappedCustomScores = toScoredCustom(score.customScores);

  res.status(201).json({
    ...score,
    customScores: mappedCustomScores,
    emotionalAvg: emotionalAvgOf({ ...score, customScores: mappedCustomScores }),
    functionalAvg: functionalAvgOf({ ...score, customScores: mappedCustomScores }),
  });
});
