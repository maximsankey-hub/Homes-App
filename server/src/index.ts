import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, '../../uploads');

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

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
app.use('/api/listing', listingRouter);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
