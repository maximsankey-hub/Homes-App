import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { supabase, MEDIA_BUCKET } from '../src/lib/supabase.js';

const prisma = new PrismaClient();

const PHOTOS_PER_STYLE = 3;

// Room type strings match ROOM_OPTIONS names on the client (client/src/features/visitMode/roomOptions.ts)
// so a style-swipe result can later target a matching room via CustomMetric.targetRoomName.
const TAXONOMY: { roomType: string; styles: { name: string; query: string }[] }[] = [
  {
    roomType: 'Kitchen',
    styles: [
      { name: 'Modern', query: 'modern kitchen interior' },
      { name: 'Farmhouse', query: 'farmhouse kitchen interior' },
      { name: 'Traditional', query: 'traditional kitchen interior' },
    ],
  },
  {
    roomType: 'Bathroom',
    styles: [
      { name: 'Modern', query: 'modern bathroom interior' },
      { name: 'Spa-like', query: 'spa bathroom interior' },
      { name: 'Traditional', query: 'traditional bathroom interior' },
    ],
  },
  {
    roomType: 'Primary bed',
    styles: [
      { name: 'Modern', query: 'modern bedroom interior' },
      { name: 'Cozy traditional', query: 'cozy traditional bedroom interior' },
      { name: 'Bohemian', query: 'bohemian bedroom interior' },
    ],
  },
  {
    roomType: 'Backyard',
    styles: [
      { name: 'Modern minimalist', query: 'modern minimalist backyard patio' },
      { name: 'Cottage garden', query: 'cottage garden backyard' },
      { name: 'Lush tropical', query: 'lush tropical backyard garden' },
    ],
  },
];

interface PexelsPhoto {
  src: { large: string };
}

async function searchPexels(query: string, count: number): Promise<PexelsPhoto[]> {
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) throw new Error('PEXELS_API_KEY is not set');

  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(count));
  url.searchParams.set('orientation', 'landscape');

  const res = await fetch(url, { headers: { Authorization: apiKey } });
  if (!res.ok) throw new Error(`Pexels search failed for "${query}": ${res.status}`);
  const data = (await res.json()) as { photos?: PexelsPhoto[] };
  return data.photos ?? [];
}

async function downloadAndStore(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`Failed to download ${imageUrl}: ${res.status}`);
  const buffer = Buffer.from(await res.arrayBuffer());

  const key = `style-photos/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(key, buffer, { contentType: 'image/jpeg' });
  if (error) throw new Error(`Supabase upload failed for ${key}: ${error.message}`);

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

async function main() {
  if (!process.env.PEXELS_API_KEY) {
    console.log('PEXELS_API_KEY is not set — add it to server/.env (see .env.example) and rerun.');
    console.log('Get a free key at https://www.pexels.com/api/');
    return;
  }

  for (const { roomType, styles } of TAXONOMY) {
    for (const style of styles) {
      const existing = await prisma.stylePhoto.count({ where: { roomType, styleName: style.name } });
      if (existing > 0) {
        console.log(`Skipping ${roomType} / ${style.name} — already has ${existing} photo(s)`);
        continue;
      }

      console.log(`Fetching ${roomType} / ${style.name}...`);
      const photos = await searchPexels(style.query, PHOTOS_PER_STYLE);
      if (photos.length === 0) {
        console.log(`  No Pexels results for "${style.query}", skipping`);
        continue;
      }

      for (const photo of photos) {
        const imageUrl = await downloadAndStore(photo.src.large);
        await prisma.stylePhoto.create({ data: { roomType, styleName: style.name, imageUrl } });
        console.log(`  Stored 1 photo`);
      }
    }
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
