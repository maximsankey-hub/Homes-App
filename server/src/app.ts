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
import { clientDistDir } from './lib/paths.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

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

// Local-only convenience: `npm run build && npm start` previews the production
// client build without Vercel. On Vercel, static hosting is handled separately
// and this branch never runs (no client/dist next to the deployed function).
if (process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1') {
  app.use(express.static(clientDistDir));
  app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(clientDistDir, 'index.html'));
  });
}
