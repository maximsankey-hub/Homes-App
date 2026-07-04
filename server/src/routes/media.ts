import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { upload } from '../middleware/upload.js';

export const mediaRouter = Router();

mediaRouter.post('/properties/:id/media', upload.single('file'), async (req, res) => {
  const file = req.file;
  if (!file) {
    res.status(400).json({ error: 'file is required' });
    return;
  }
  const { type, roomId } = req.body ?? {};
  if (!['PHOTO', 'VIDEO', 'VOICE'].includes(type)) {
    res.status(400).json({ error: 'type must be PHOTO, VIDEO, or VOICE' });
    return;
  }

  const media = await prisma.media.create({
    data: {
      propertyId: req.params.id,
      roomId: roomId || null,
      type,
      filePath: `/uploads/${file.filename}`,
      mimeType: file.mimetype,
      sizeBytes: file.size,
    },
  });

  res.status(201).json(media);
});

mediaRouter.patch('/media/:mediaId', async (req, res) => {
  const { roomId } = req.body ?? {};
  const media = await prisma.media.update({
    where: { id: req.params.mediaId },
    data: { roomId: roomId ?? null },
  });
  res.json(media);
});
