import path from 'node:path';
import cors from 'cors';
import express from 'express';
import { propertiesRouter } from './routes/properties.js';
import { roomsRouter } from './routes/rooms.js';
import { mediaRouter } from './routes/media.js';
import { profileRouter } from './routes/profile.js';
import { scorersRouter } from './routes/scorers.js';
import { renovationsRouter } from './routes/renovations.js';
import { nearbyRouter } from './routes/nearby.js';
import { compareRouter } from './routes/compare.js';
import { listingRouter } from './routes/listing.js';
import { neighborhoodScoreRouter } from './routes/neighborhoodScore.js';
import { householdRouter } from './routes/household.js';
import { customMetricsRouter } from './routes/customMetrics.js';
import { requireAuth, requireHousehold } from './middleware/auth.js';
import { clientDistDir } from './lib/paths.js';
import { prisma } from './lib/prisma.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Touches the DB so scheduled keep-alive pings actually count as Supabase activity
// (Supabase free-tier projects auto-pause after 7 days with no API/DB activity).
app.get('/api/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (err) {
    console.error('DB health check failed:', err);
    res.status(503).json({ ok: false });
  }
});

app.use('/api', requireAuth);
// POST /household/join runs before a household membership exists, so it's mounted
// ahead of the blanket requireHousehold below (GET /household applies it itself).
app.use('/api/household', householdRouter);
app.use('/api', requireHousehold);

// Mounted before propertiesRouter's GET /:id so "/compare" isn't swallowed as an id param.
app.use('/api/properties/compare', compareRouter);
app.use('/api/properties', propertiesRouter);
app.use('/api', roomsRouter);
app.use('/api', mediaRouter);
app.use('/api', nearbyRouter);
app.use('/api/profile', profileRouter);
app.use('/api/scorers', scorersRouter);
app.use('/api', renovationsRouter);
app.use('/api', neighborhoodScoreRouter);
app.use('/api/listing', listingRouter);
app.use('/api/custom-metrics', customMetricsRouter);

// Local-only convenience: `npm run build && npm start` previews the production
// client build without Vercel. On Vercel, static hosting is handled separately
// and this branch never runs (no client/dist next to the deployed function).
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  app.use(express.static(clientDistDir));
  app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}
