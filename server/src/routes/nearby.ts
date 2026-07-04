import { Router } from 'express';
import { prisma } from '../lib/prisma.js';

export const nearbyRouter = Router();

nearbyRouter.get('/properties/:id/nearby', async (req, res) => {
  const { category, q } = req.query;

  const places = await prisma.nearbyPlace.findMany({
    where: {
      propertyId: req.params.id,
      ...(category && category !== 'all' ? { category: String(category).toUpperCase() as never } : {}),
      ...(q ? { name: { contains: String(q) } } : {}),
    },
    orderBy: { score: 'desc' },
  });

  res.json(places);
});
