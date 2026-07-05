import type { PatternInsight } from 'shared';
import { prisma } from '../lib/prisma.js';
import { emotionalAvgOf, functionalAvgOf, round1, toScoredCustom } from './scoreAggregation.js';

const FACTOR_LABELS: Record<'layout' | 'storage' | 'light' | 'vibe', string> = {
  light: 'Natural light',
  layout: 'Layout flow',
  storage: 'Storage',
  vibe: 'Vibe / feel',
};

export async function getPreferencePatterns(scorerId: string): Promise<PatternInsight[]> {
  const scores = await prisma.roomScore.findMany({
    where: { scorerId },
    include: { room: true, customScores: { include: { metric: true } } },
  });

  if (scores.length === 0) return [];

  const patterns: PatternInsight[] = [];

  const factorAverages = (['light', 'layout', 'storage', 'vibe'] as const).map((key) => ({
    key,
    avg: scores.reduce((sum, s) => sum + s[key], 0) / scores.length,
  }));
  const topFactor = [...factorAverages].sort((a, b) => b.avg - a.avg)[0];

  const byRoomName = new Map<string, number[]>();
  for (const s of scores) {
    const arr = byRoomName.get(s.room.name) ?? [];
    arr.push(s[topFactor.key]);
    byRoomName.set(s.room.name, arr);
  }
  const roomLabels = [...byRoomName.keys()];
  const barValues = roomLabels.map((name) => {
    const vals = byRoomName.get(name)!;
    return round1(vals.reduce((a, b) => a + b, 0) / vals.length);
  });

  patterns.push({
    icon: 'ti-sun',
    iconBg: '#E1F5EE',
    iconColor: '#085041',
    title: `You prioritize ${topFactor.key === 'vibe' ? 'vibe and feel' : FACTOR_LABELS[topFactor.key].toLowerCase()}`,
    subtitle: `Consistent across ${scores.length} room${scores.length > 1 ? 's' : ''} scored`,
    barLabels: roomLabels,
    barValues,
  });

  const emotionalAvg = scores.reduce((sum, s) => sum + emotionalAvgOf({ ...s, customScores: toScoredCustom(s.customScores) }), 0) / scores.length;
  const functionalAvg = scores.reduce((sum, s) => sum + functionalAvgOf({ ...s, customScores: toScoredCustom(s.customScores) }), 0) / scores.length;
  const gap = round1(emotionalAvg - functionalAvg);

  if (Math.abs(gap) >= 1) {
    patterns.push({
      icon: 'ti-heart',
      iconBg: '#FAEEDA',
      iconColor: '#633806',
      title: gap > 0 ? 'Gut feeling leads logic' : 'Logic leads gut feeling',
      subtitle: `Emotional avg ${Math.abs(gap).toFixed(1)} pts ${gap > 0 ? 'above' : 'below'} functional`,
      chip:
        gap > 0
          ? {
              icon: 'ti-alert-triangle',
              color: 'var(--text-warning)',
              text: 'You may be drawn to homes that feel great but have functional gaps. Check practical factors carefully.',
            }
          : {
              icon: 'ti-info-circle',
              color: 'var(--text-muted)',
              text: 'You tend to weigh practicality heavily — make sure homes you shortlist still excite you.',
            },
    });
  }

  return patterns;
}
