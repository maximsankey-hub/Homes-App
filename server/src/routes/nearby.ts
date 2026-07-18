import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { fetchNearbyPlaces } from '../services/googleMaps.js';

export const nearbyRouter = Router();

const PLACES_CACHE_MS = 24 * 60 * 60 * 1000;

nearbyRouter.get('/properties/:id/nearby', async (req, res) => {
  const owned = await prisma.property.findFirst({ where: { id: req.params.id, householdId: req.householdId } });
  if (!owned) {
    res.status(404).json({ error: 'Property not found' });
    return;
  }

  const forceRefresh = req.query.refresh === 'true';
  const isStale = !owned.placesFetchedAt || Date.now() - owned.placesFetchedAt.getTime() > PLACES_CACHE_MS;

  if (owned.lat !== null && owned.lng !== null && (forceRefresh || isStale)) {
    const fetched = await fetchNearbyPlaces(owned.lat, owned.lng).catch(() => null);
    if (fetched && fetched.length > 0) {
      await prisma.$transaction([
        prisma.nearbyPlace.deleteMany({ where: { propertyId: owned.id } }),
        prisma.nearbyPlace.createMany({ data: fetched.map((p) => ({ ...p, propertyId: owned.id })) }),
        prisma.property.update({ where: { id: owned.id }, data: { placesFetchedAt: new Date() } }),
      ]);
    }
  }

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
