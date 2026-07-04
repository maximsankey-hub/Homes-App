import { prisma } from './prisma.js';

let cachedSelfScorerId: string | null = null;

/** Returns the single local household's "self" scorer, creating it if it doesn't exist yet. */
export async function getSelfScorerId(): Promise<string> {
  if (cachedSelfScorerId) return cachedSelfScorerId;

  const existing = await prisma.scorer.findFirst({ where: { role: 'SELF' } });
  if (existing) {
    cachedSelfScorerId = existing.id;
    return existing.id;
  }

  const created = await prisma.scorer.create({
    data: { name: 'Jordan', role: 'SELF', initials: 'JL', colorHex: '#1D9E75' },
  });
  cachedSelfScorerId = created.id;
  return created.id;
}
