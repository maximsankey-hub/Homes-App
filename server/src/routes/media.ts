import crypto from 'node:crypto';
import path from 'node:path';
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { upload } from '../middleware/upload.js';
import { supabase, MEDIA_BUCKET } from '../lib/supabase.js';

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

  const ext = path.extname(file.originalname) || '';
  const storageKey = `${req.params.id}/${crypto.randomUUID()}${ext}`;

  const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(storageKey, file.buffer, {
    contentType: file.mimetype,
  });
  if (uploadError) {
    res.status(502).json({ error: `Storage upload failed: ${uploadError.message}` });
    return;
  }

  const { data: publicUrlData } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(storageKey);

  const media = await prisma.media.create({
    data: {
      propertyId: req.params.id,
      roomId: roomId || null,
      type,
      filePath: publicUrlData.publicUrl,
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
