import { Router } from 'express';
import type { StylePhotoItem, StyleRoomProgress } from 'shared';
import { prisma } from '../lib/prisma.js';

export const stylePhotosRouter = Router();

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

stylePhotosRouter.get('/style-photos', async (req, res) => {
  const roomType = typeof req.query.roomType === 'string' ? req.query.roomType : undefined;
  if (!roomType) {
    res.status(400).json({ error: 'roomType query param is required' });
    return;
  }

  const photos = await prisma.stylePhoto.findMany({ where: { roomType } });
  const result: StylePhotoItem[] = shuffle(photos).map((p) => ({
    id: p.id,
    roomType: p.roomType,
    styleName: p.styleName,
    imageUrl: p.imageUrl,
  }));
  res.json(result);
});

stylePhotosRouter.post('/style-photos/:id/swipe', async (req, res) => {
  const photo = await prisma.stylePhoto.findUnique({ where: { id: req.params.id } });
  if (!photo) {
    res.status(404).json({ error: 'Style photo not found' });
    return;
  }

  const { liked } = req.body ?? {};
  if (typeof liked !== 'boolean') {
    res.status(400).json({ error: 'liked (boolean) is required' });
    return;
  }

  const scorerId = req.scorerId!;
  await prisma.styleSwipe.upsert({
    where: { scorerId_stylePhotoId: { scorerId, stylePhotoId: photo.id } },
    update: { liked },
    create: { scorerId, stylePhotoId: photo.id, liked },
  });
  res.status(201).json({ ok: true });
});

stylePhotosRouter.get('/style-profile', async (req, res) => {
  const scorerId = req.scorerId!;

  const photos = await prisma.stylePhoto.findMany({
    include: { swipes: { where: { scorerId } } },
  });

  const byRoom = new Map<string, typeof photos>();
  for (const photo of photos) {
    const list = byRoom.get(photo.roomType) ?? [];
    list.push(photo);
    byRoom.set(photo.roomType, list);
  }

  const progress: StyleRoomProgress[] = [...byRoom.entries()].map(([roomType, roomPhotos]) => {
    const swipedCount = roomPhotos.filter((p) => p.swipes.length > 0).length;

    const likesByStyle = new Map<string, number>();
    for (const p of roomPhotos) {
      if (p.swipes[0]?.liked) likesByStyle.set(p.styleName, (likesByStyle.get(p.styleName) ?? 0) + 1);
    }
    const ranked = [...likesByStyle.entries()].sort((a, b) => b[1] - a[1]);
    // Only surface a "preferred style" once there's a clear leader (at least 2 likes, and
    // strictly ahead of the runner-up) — otherwise it's just noise from too few swipes.
    const topStyle = ranked.length > 0 && ranked[0][1] >= 2 && (ranked.length === 1 || ranked[0][1] > ranked[1][1]) ? ranked[0][0] : null;

    return { roomType, totalPhotos: roomPhotos.length, swipedCount, topStyle };
  });

  res.json(progress);
});
