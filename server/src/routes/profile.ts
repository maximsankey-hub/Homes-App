import { Router } from 'express';
import type { TagSource } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { getPreferencePatterns } from '../services/patterns.js';

export const profileRouter = Router();

const KEYWORD_MAP: Record<string, string> = {
  office: 'Work from home',
  adhd: 'ADHD — need structure',
  clutter: 'Clutter overwhelms me',
  dogs: 'Pet-friendly',
  yard: 'Outdoor space',
  dark: 'Natural light',
  noise: 'Noise sensitive',
  quiet: 'Quiet and calm',
  cook: 'Hosting friends',
  entertain: 'Hosting friends',
  open: 'Prefer open layouts',
  storage: 'Need visible storage',
};

async function getOrCreateProfile(householdId: string) {
  const existing = await prisma.preferenceProfile.findFirst({ where: { householdId }, include: { tags: true } });
  if (existing) return existing;
  return prisma.preferenceProfile.create({
    data: { householdId, method: 'BOTH', weightEmotional: 5, weightStorage: 5, weightLight: 5, weightNeighborhood: 5 },
    include: { tags: true },
  });
}

profileRouter.get('/', async (req, res) => {
  const profile = await getOrCreateProfile(req.householdId!);
  const patterns = await getPreferencePatterns(req.scorerId!);
  res.json({ ...profile, patterns });
});

profileRouter.put('/', async (req, res) => {
  const profile = await getOrCreateProfile(req.householdId!);
  const { method, freeText, weightEmotional, weightStorage, weightLight, weightNeighborhood, aestheticStyle, tags } = req.body ?? {};

  const updated = await prisma.preferenceProfile.update({
    where: { id: profile.id },
    data: {
      method: method ?? profile.method,
      freeText: freeText ?? profile.freeText,
      weightEmotional: weightEmotional ?? profile.weightEmotional,
      weightStorage: weightStorage ?? profile.weightStorage,
      weightLight: weightLight ?? profile.weightLight,
      weightNeighborhood: weightNeighborhood ?? profile.weightNeighborhood,
      aestheticStyle: aestheticStyle ?? profile.aestheticStyle,
      ...(Array.isArray(tags)
        ? {
            tags: {
              deleteMany: {},
              create: tags.map((t: { label: string; source?: TagSource }) => ({
                label: t.label,
                source: t.source ?? ('MANUAL' as TagSource),
              })),
            },
          }
        : {}),
    },
    include: { tags: true },
  });

  res.json(updated);
});

profileRouter.post('/ai-map', (req, res) => {
  const text: string = (req.body?.text ?? '').toLowerCase();
  const matched: { phrase: string; label: string }[] = [];
  const used = new Set<string>();

  for (const [keyword, label] of Object.entries(KEYWORD_MAP)) {
    if (text.includes(keyword) && !used.has(label)) {
      matched.push({ phrase: keyword, label });
      used.add(label);
    }
  }

  res.json({ matched });
});
