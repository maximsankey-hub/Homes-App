import { prisma } from '../lib/prisma.js';

export interface ApiUsageStatus {
  count: number;
  limit: number;
  remaining: number;
  period: string;
}

function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

function limitFor(service: string): number {
  if (service === 'rentcast') return Number(process.env.RENTCAST_MONTHLY_LIMIT ?? 50);
  return Infinity;
}

// Read-only — does not count as a call itself, safe to poll from the client.
export async function getApiUsage(service: string): Promise<ApiUsageStatus> {
  const period = currentPeriod();
  const limit = limitFor(service);
  const row = await prisma.apiUsage.findUnique({ where: { service } });
  const count = row && row.period === period ? row.count : 0;
  return { count, limit, remaining: Math.max(0, limit - count), period };
}

// Call this immediately after actually making a real request to the metered API (regardless of
// whether that request succeeded) — it's tracking calls made, not results returned. Returns the
// updated status so callers don't need a second read.
export async function recordApiCall(service: string): Promise<ApiUsageStatus> {
  const period = currentPeriod();
  const limit = limitFor(service);
  const existing = await prisma.apiUsage.findUnique({ where: { service } });

  const row =
    existing && existing.period === period
      ? await prisma.apiUsage.update({ where: { service }, data: { count: { increment: 1 } } })
      : await prisma.apiUsage.upsert({
          where: { service },
          update: { period, count: 1 },
          create: { service, period, count: 1 },
        });

  return { count: row.count, limit, remaining: Math.max(0, limit - row.count), period };
}
