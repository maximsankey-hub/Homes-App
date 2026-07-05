import crypto from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { supabase, MEDIA_BUCKET } from '../src/lib/supabase.js';

const prisma = new PrismaClient();

// Minimal valid 1x1 PNG, used as placeholder bytes for all seeded media (photo/video/voice).
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
);

async function uploadPlaceholderMedia(): Promise<{ filePath: string; sizeBytes: number }> {
  const key = `seed/${crypto.randomUUID()}.png`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(key, PLACEHOLDER_PNG, { contentType: 'image/png' });
  if (error) throw new Error(`Seed media upload failed: ${error.message}`);
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(key);
  return { filePath: data.publicUrl, sizeBytes: PLACEHOLDER_PNG.length };
}

const DEMO_ONLY = process.argv.includes('--demo-only');

async function upsertScorer(name: string, role: 'SELF' | 'PARTNER', initials: string, colorHex: string) {
  const existing = await prisma.scorer.findFirst({ where: { name, role } });
  if (existing) return existing;
  return prisma.scorer.create({ data: { name, role, initials, colorHex } });
}

async function main() {
  if (DEMO_ONLY) {
    // Only remove the seeded demo properties (rooms/scores/media/renovations cascade with them) —
    // leaves any properties, scorers, or profile/listing customization added since.
    await prisma.property.deleteMany({ where: { isDemo: true } });
  } else {
    // Clear existing data (idempotent full re-seed)
    await prisma.media.deleteMany();
    await prisma.roomScore.deleteMany();
    await prisma.room.deleteMany();
    await prisma.renovationIdea.deleteMany();
    await prisma.nearbyPlace.deleteMany();
    await prisma.property.deleteMany();
    await prisma.scorer.deleteMany();
    await prisma.preferenceTag.deleteMany();
    await prisma.preferenceProfile.deleteMany();
    await prisma.marketComp.deleteMany();
    await prisma.listingRoomScore.deleteMany();
    await prisma.improvementIdea.deleteMany();
    await prisma.listing.deleteMany();
    await prisma.scorerNote.deleteMany();
  }

  const jordan = await upsertScorer('Jordan', 'SELF', 'JL', '#1D9E75');
  const morgan = await upsertScorer('Morgan', 'PARTNER', 'MK', '#3C3489');

  // ── 2847 Elm Street ──
  const elm = await prisma.property.create({
    data: {
      isDemo: true,
      address: '2847 Elm Street',
      city: 'Denver',
      state: 'CO',
      listingPrice: 685000,
      sqft: 2100,
      beds: 3,
      baths: 2,
      yearBuilt: 1987,
      status: 'VISITED',
      lastVisitedAt: new Date('2026-06-20'),
      walkScore: 78,
      transitScore: 62,
      bikeScore: 45,
      safetyScore: 82,
      noiseScore: 38,
      greenSpaceScore: 70,
      sidewalkScore: 75,
    },
  });

  const elmKitchen = await prisma.room.create({
    data: { propertyId: elm.id, name: 'Kitchen', icon: 'ti-tools-kitchen-2' },
  });
  const elmLiving = await prisma.room.create({
    data: { propertyId: elm.id, name: 'Living room', icon: 'ti-sofa' },
  });

  await prisma.roomScore.create({
    data: {
      roomId: elmKitchen.id,
      scorerId: jordan.id,
      layout: 7,
      storage: 5,
      light: 9,
      vibe: 9,
      feeling: 'EXCITED',
      note: 'Great light, tight storage',
    },
  });
  await prisma.roomScore.create({
    data: {
      roomId: elmLiving.id,
      scorerId: jordan.id,
      layout: 8,
      storage: 6,
      light: 8,
      vibe: 8,
      feeling: 'CALM',
      note: 'Open flow, great for hosting',
    },
  });

  await prisma.roomScore.create({
    data: { roomId: elmKitchen.id, scorerId: morgan.id, layout: 9, storage: 8, light: 9, vibe: 9, feeling: 'CALM' },
  });
  await prisma.roomScore.create({
    data: { roomId: elmLiving.id, scorerId: morgan.id, layout: 7, storage: 6, light: 7, vibe: 7, feeling: 'CALM' },
  });
  await prisma.scorerNote.create({
    data: {
      propertyId: elm.id,
      scorerId: morgan.id,
      text: 'Love the kitchen. Worried about street noise and the small primary closet.',
    },
  });

  for (let i = 0; i < 3; i++) {
    const { filePath, sizeBytes } = await uploadPlaceholderMedia();
    await prisma.media.create({
      data: { propertyId: elm.id, roomId: elmKitchen.id, type: 'PHOTO', filePath, mimeType: 'image/png', sizeBytes },
    });
  }
  for (let i = 0; i < 2; i++) {
    const { filePath, sizeBytes } = await uploadPlaceholderMedia();
    await prisma.media.create({
      data: { propertyId: elm.id, roomId: elmLiving.id, type: 'PHOTO', filePath, mimeType: 'image/png', sizeBytes },
    });
  }
  for (let i = 0; i < 2; i++) {
    const { filePath, sizeBytes } = await uploadPlaceholderMedia();
    await prisma.media.create({
      data: { propertyId: elm.id, roomId: null, type: 'PHOTO', filePath, mimeType: 'image/png', sizeBytes },
    });
  }

  await prisma.renovationIdea.createMany({
    data: [
      {
        propertyId: elm.id,
        title: 'Built-in pantry shelving',
        room: 'Kitchen',
        type: 'COSMETIC',
        costLow: 3000,
        costHigh: 8000,
        feasibility: 92,
        need: 'Addresses visible storage need directly.',
        constraintNote: 'Standard finish carpentry — no structural changes.',
      },
      {
        propertyId: elm.id,
        title: 'Primary closet expansion',
        room: 'Primary bed',
        type: 'STRUCTURAL',
        costLow: 12000,
        costHigh: 30000,
        feasibility: 55,
        need: 'Adds organization system your profile needs.',
        constraintNote: 'Requires moving a wall — check load-bearing status.',
      },
    ],
  });

  await prisma.nearbyPlace.createMany({
    data: [
      { propertyId: elm.id, name: 'King Soopers', category: 'GROCERY', distanceText: '0.4 mi · 8 min', score: 9.2, icon: 'ti-building-store', iconColor: '#0C447C', iconBg: '#E6F1FB' },
      { propertyId: elm.id, name: "Sloan's Lake Park", category: 'PARKS', distanceText: '0.7 mi · 14 min', score: 9.5, icon: 'ti-trees', iconColor: '#27500A', iconBg: '#EAF3DE' },
      { propertyId: elm.id, name: 'Cheltenham Elem.', category: 'SCHOOLS', distanceText: '0.9 mi · 18 min', score: 7.8, icon: 'ti-school', iconColor: '#633806', iconBg: '#FAEEDA' },
      { propertyId: elm.id, name: 'Orangetheory', category: 'GYMS', distanceText: '1.1 mi · 5 min drive', score: 8.0, icon: 'ti-barbell', iconColor: '#72243E', iconBg: '#FBEAF0' },
      { propertyId: elm.id, name: 'Novo Coffee', category: 'COFFEE', distanceText: '0.3 mi · 6 min', score: 9.1, icon: 'ti-coffee', iconColor: '#633806', iconBg: '#FAEEDA' },
    ],
  });

  // ── 512 Maple Avenue ──
  await prisma.property.create({
    data: {
      isDemo: true,
      address: '512 Maple Avenue',
      city: 'Denver',
      state: 'CO',
      listingPrice: 742000,
      sqft: 2450,
      beds: 4,
      baths: 3,
      yearBuilt: 2001,
      status: 'NOT_VISITED',
      walkScore: 65,
      transitScore: 71,
      bikeScore: 38,
      safetyScore: 74,
      noiseScore: 45,
      greenSpaceScore: 80,
      sidewalkScore: 82,
      nearbyPlaces: {
        create: [
          { name: 'Whole Foods', category: 'GROCERY', distanceText: '0.6 mi · 12 min', score: 8.5, icon: 'ti-building-store', iconColor: '#0C447C', iconBg: '#E6F1FB' },
          { name: 'City Park', category: 'PARKS', distanceText: '1.2 mi · 6 min drive', score: 8.8, icon: 'ti-trees', iconColor: '#27500A', iconBg: '#EAF3DE' },
          { name: 'Thump Coffee', category: 'COFFEE', distanceText: '0.4 mi · 8 min', score: 8.3, icon: 'ti-coffee', iconColor: '#633806', iconBg: '#FAEEDA' },
        ],
      },
      renovations: {
        create: [
          {
            title: 'Skylights in rear rooms',
            room: 'Various',
            type: 'STRUCTURAL',
            costLow: 6000,
            costHigh: 16000,
            feasibility: 70,
            need: 'Addresses light deficit.',
            constraintNote: 'Requires roofing coordination and permit.',
          },
        ],
      },
    },
  });

  // ── 1190 Oak Lane ──
  const oak = await prisma.property.create({
    data: {
      isDemo: true,
      address: '1190 Oak Lane',
      city: 'Lakewood',
      state: 'CO',
      listingPrice: 598000,
      sqft: 1850,
      beds: 3,
      baths: 2,
      yearBuilt: 1974,
      status: 'VISITED',
      lastVisitedAt: new Date('2026-06-24'),
      walkScore: 52,
      transitScore: 44,
      bikeScore: 58,
      safetyScore: 75,
      noiseScore: 28,
      greenSpaceScore: 55,
      sidewalkScore: 60,
    },
  });

  const oakKitchen = await prisma.room.create({ data: { propertyId: oak.id, name: 'Kitchen', icon: 'ti-tools-kitchen-2' } });
  const oakLiving = await prisma.room.create({ data: { propertyId: oak.id, name: 'Living room', icon: 'ti-sofa' } });
  const oakBed = await prisma.room.create({ data: { propertyId: oak.id, name: 'Primary bed', icon: 'ti-bed' } });

  await prisma.roomScore.create({
    data: { roomId: oakKitchen.id, scorerId: jordan.id, layout: 7, storage: 9, light: 5, vibe: 7, feeling: 'UNCERTAIN', note: 'Organized, but dim' },
  });
  await prisma.roomScore.create({
    data: { roomId: oakLiving.id, scorerId: jordan.id, layout: 7, storage: 9, light: 6, vibe: 8, feeling: 'CALM', note: 'Good storage, cozy but dark' },
  });
  await prisma.roomScore.create({
    data: { roomId: oakBed.id, scorerId: jordan.id, layout: 6, storage: 8, light: 5, vibe: 7, feeling: 'CALM', note: 'Quiet, decent closet' },
  });

  await prisma.roomScore.create({
    data: { roomId: oakKitchen.id, scorerId: morgan.id, layout: 8, storage: 9, light: 7, vibe: 8, feeling: 'EXCITED' },
  });
  await prisma.scorerNote.create({
    data: {
      propertyId: oak.id,
      scorerId: morgan.id,
      text: 'Love this one more — the quietness and storage are exactly what I need.',
    },
  });

  for (const roomId of [oakKitchen.id, oakLiving.id, oakBed.id]) {
    const { filePath, sizeBytes } = await uploadPlaceholderMedia();
    await prisma.media.create({ data: { propertyId: oak.id, roomId, type: 'PHOTO', filePath, mimeType: 'image/png', sizeBytes } });
  }

  await prisma.renovationIdea.create({
    data: {
      propertyId: oak.id,
      title: 'Skylights in living room',
      room: 'Living room',
      type: 'STRUCTURAL',
      costLow: 5000,
      costHigh: 14000,
      feasibility: 80,
      need: 'Directly addresses light deficit.',
      constraintNote: 'Roof pitch is favorable. Permit required.',
    },
  });

  await prisma.nearbyPlace.createMany({
    data: [
      { propertyId: oak.id, name: 'Sprouts Market', category: 'GROCERY', distanceText: '1.1 mi · 5 min drive', score: 7.8, icon: 'ti-building-store', iconColor: '#0C447C', iconBg: '#E6F1FB' },
      { propertyId: oak.id, name: 'Belmar Park', category: 'PARKS', distanceText: '0.9 mi · 18 min', score: 7.5, icon: 'ti-trees', iconColor: '#27500A', iconBg: '#EAF3DE' },
      { propertyId: oak.id, name: 'Copper Door Coffee', category: 'COFFEE', distanceText: '0.5 mi · 10 min', score: 8.2, icon: 'ti-coffee', iconColor: '#633806', iconBg: '#FAEEDA' },
    ],
  });

  // ── Preference profile ── only seed if none exists yet, so a demo-only reset never overwrites real answers.
  if (!(await prisma.preferenceProfile.findFirst())) {
    await prisma.preferenceProfile.create({
      data: {
        method: 'BOTH',
        weightEmotional: 8,
        weightStorage: 9,
        weightLight: 9,
        aestheticStyle: 'Warm, cozy, traditional',
        tags: {
          create: [
            { label: 'Natural light', source: 'MANUAL' },
            { label: 'Hosting friends', source: 'MANUAL' },
            { label: 'Work from home', source: 'MANUAL' },
            { label: 'Organization', source: 'MANUAL' },
            { label: 'Visible storage', source: 'AI_MAPPED' },
            { label: 'Open layouts', source: 'MANUAL' },
          ],
        },
      },
    });
  }

  // ── Seller listing (the household's own home) ── only seed if none exists yet, for the same reason as the profile above.
  if (!(await prisma.listing.findFirst())) {
    await prisma.listing.create({
      data: {
        address: '2847 Elm Street',
        city: 'Denver',
        state: 'CO',
        listPrice: 685000,
        sqft: 2100,
        beds: 3,
        baths: 2,
        estValueLow: 672000,
        estValueHigh: 701000,
        confidenceScore: 7.6,
        avgDaysOnMarket: 18,
        pricePerSqft: 326,
        buyerEmotionalAvg: 8.1,
        buyerFunctionalAvg: 5.9,
        marketStatus: 'Strong',
        buyerViewsCount: 12,
        walkabilityScore: 7.8,
        parkAccessScore: 9.0,
        privacyScore: 5.5,
        schoolQualityScore: 8.2,
        noiseLevelScore: 3.8,
        buyerPriorityLight: 9.1,
        buyerPriorityKitchen: 8.8,
        buyerPriorityStorage: 8.5,
        buyerPriorityLayout: 8.0,
        fitHosting: 8.2,
        fitWFH: 7.4,
        fitOrganization: 4.2,
        fitFamily: 7.8,
        comps: {
          create: [
            { address: '1842 Maple Drive', sqft: 1980, saleDate: new Date('2026-04-15'), price: 658000, diffType: 'ABOVE', diffAmount: 27000, note: 'Smaller sq ft, no basement. Sold in 14 days.' },
            { address: '3310 Oak Avenue', sqft: 2240, saleDate: new Date('2026-05-10'), price: 712000, diffType: 'BELOW', diffAmount: 27000, note: 'Larger sq ft, updated kitchen. Sold in 9 days with multiple offers.' },
            { address: '776 Cedar Street', sqft: 2120, saleDate: new Date('2026-06-05'), price: 698000, diffType: 'WITHIN', diffAmount: 13000, note: 'Extra bedroom. Sold in 11 days with multiple offers.' },
          ],
        },
        roomScores: {
          create: [
            { roomName: 'Kitchen', score: 8.8 },
            { roomName: 'Living room', score: 8.2 },
            { roomName: 'Primary bedroom', score: 6.4 },
            { roomName: 'Overall', score: 7.6 },
          ],
        },
        improvements: {
          create: [
            {
              title: 'Built-in storage and shelving',
              demandLevel: 'HIGH',
              type: 'COSMETIC',
              valueLift: 20000,
              costLow: 8000,
              costHigh: 12000,
              feasibility: 92,
              supportingNote1: 'Mentioned by 71% of buyers in similar homes. Storage score is 4.2 vs 7.5 local average.',
              supportingNote2: 'Standard finish carpentry — no structural work. Can be done in 1–2 weeks.',
            },
            {
              title: 'Primary closet expansion',
              demandLevel: 'MODERATE',
              type: 'STRUCTURAL',
              valueLift: 25000,
              costLow: 12000,
              costHigh: 22000,
              feasibility: 65,
              supportingNote1: 'Flagged in 6 of 12 buyer visits. Below average for 3bd homes in this zip code.',
              supportingNote2: 'Denver R-1 zone allows interior structural modifications with standard permit.',
            },
            {
              title: 'Backyard privacy fence',
              demandLevel: 'MODERATE',
              type: 'COSMETIC',
              valueLift: 12000,
              costLow: 3000,
              costHigh: 8000,
              feasibility: 75,
              supportingNote1: '44% of buyers flagged backyard privacy. Score is 5.5 vs 7.1 neighborhood average.',
              supportingNote2: 'Denver zoning permits 6ft fences on side and rear lines without a variance.',
            },
          ],
        },
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
