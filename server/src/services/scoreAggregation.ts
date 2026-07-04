import type { RoomScore } from '@prisma/client';

export interface ScoredRoom {
  layout: number;
  storage: number;
  light: number;
  vibe: number;
}

export function emotionalAvgOf(r: ScoredRoom): number {
  return (r.light + r.vibe) / 2;
}

export function functionalAvgOf(r: ScoredRoom): number {
  return (r.layout + r.storage) / 2;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export interface PropertyAggregate {
  score: number | null;
  scoreColor: string;
  emotionalAvg: number | null;
  functionalAvg: number | null;
  factorBreakdown: { label: string; value: number }[];
  fitLabel: string;
}

export function aggregateSelfScores(scores: RoomScore[]): PropertyAggregate {
  if (scores.length === 0) {
    return {
      score: null,
      scoreColor: '#888780',
      emotionalAvg: null,
      functionalAvg: null,
      factorBreakdown: [],
      fitLabel: 'Not yet visited',
    };
  }

  const emotionalAvg = round1(scores.reduce((sum, s) => sum + emotionalAvgOf(s), 0) / scores.length);
  const functionalAvg = round1(scores.reduce((sum, s) => sum + functionalAvgOf(s), 0) / scores.length);
  const avgLayout = round1(scores.reduce((sum, s) => sum + s.layout, 0) / scores.length);
  const avgStorage = round1(scores.reduce((sum, s) => sum + s.storage, 0) / scores.length);
  const avgLight = round1(scores.reduce((sum, s) => sum + s.light, 0) / scores.length);
  const avgVibe = round1(scores.reduce((sum, s) => sum + s.vibe, 0) / scores.length);
  const score = round1((emotionalAvg + functionalAvg) / 2);

  return {
    score,
    scoreColor: score >= 8 ? '#1D9E75' : '#534AB7',
    emotionalAvg,
    functionalAvg,
    factorBreakdown: [
      { label: 'Natural light', value: avgLight },
      { label: 'Layout flow', value: avgLayout },
      { label: 'Storage', value: avgStorage },
      { label: 'Vibe / feel', value: avgVibe },
    ],
    fitLabel: score >= 8 ? 'Strong lifestyle fit' : 'Moderate lifestyle fit',
  };
}

export function secondaryInsights(agg: PropertyAggregate): { icon: string; color: string; text: string }[] {
  if (agg.emotionalAvg === null || agg.functionalAvg === null) return [];
  const insights: { icon: string; color: string; text: string }[] = [];
  const gap = agg.emotionalAvg - agg.functionalAvg;
  if (Math.abs(gap) >= 1.5) {
    insights.push({
      icon: 'ti-bulb',
      color: 'var(--text-accent)',
      text:
        gap > 0
          ? 'Emotional scores run notably above functional — check practical needs carefully.'
          : 'Functional scores run notably above emotional — this home may be practical over exciting.',
    });
  }
  const weakest = [...agg.factorBreakdown].sort((a, b) => a.value - b.value)[0];
  if (weakest && weakest.value < 6) {
    insights.push({
      icon: 'ti-alert-triangle',
      color: 'var(--text-warning)',
      text: `${weakest.label} is the weakest scored factor so far.`,
    });
  } else if (weakest) {
    insights.push({
      icon: 'ti-check',
      color: 'var(--text-success)',
      text: `${weakest.label} is consistently strong across scored rooms.`,
    });
  }
  return insights;
}
