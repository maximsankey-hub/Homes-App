import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { getSelfScorerId } from '../lib/defaultScorer.js';

export const roomsRouter = Router();

// Nested under /api/properties/:id/rooms — create-or-get a room by name (idempotent).
export async function createOrGetRoom(propertyId: string, name: string, icon: string) {
  const existing = await prisma.room.findUnique({ where: { propertyId_name: { propertyId, name } } });
  if (existing) return existing;
  return prisma.room.create({ data: { propertyId, name, icon } });
}

roomsRouter.post('/properties/:id/rooms', async (req, res) => {
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
  const { layout, storage, light, vibe, feeling, note } = req.body ?? {};
  if ([layout, storage, light, vibe].some((v) => typeof v !== 'number')) {
    res.status(400).json({ error: 'layout, storage, light, vibe must be numbers' });
    return;
  }
  const scorerId = await getSelfScorerId();

  const score = await prisma.roomScore.upsert({
    where: { roomId_scorerId: { roomId: req.params.roomId, scorerId } },
    update: { layout, storage, light, vibe, feeling, note },
    create: { roomId: req.params.roomId, scorerId, layout, storage, light, vibe, feeling, note },
  });

  res.status(201).json({
    ...score,
    emotionalAvg: (score.light + score.vibe) / 2,
    functionalAvg: (score.layout + score.storage) / 2,
  });
});
