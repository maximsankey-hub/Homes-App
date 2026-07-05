import type { MetricCategory, RoomScore } from '@prisma/client';

export interface ScoredCustomValue {
  metricId: string;
  value: number;
  category: MetricCategory;
  label: string;
}

export interface ScoredRoom {
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  customScores?: ScoredCustomValue[];
}

export function emotionalAvgOf(r: ScoredRoom): number {
  const values = [r.light, r.vibe, ...(r.customScores ?? []).filter((c) => c.category === 'EMOTIONAL').map((c) => c.value)];
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function functionalAvgOf(r: ScoredRoom): number {
  const values = [r.layout, r.storage, ...(r.customScores ?? []).filter((c) => c.category === 'FUNCTIONAL').map((c) => c.value)];
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function toScoredCustom(raw: { metricId: string; value: number; metric: { category: MetricCategory; label: string } }[]): ScoredCustomValue[] {
  return raw.map((c) => ({ metricId: c.metricId, value: c.value, category: c.metric.category, label: c.metric.label }));
}

export interface PropertyAggregate {
  score: number | null;
  scoreColor: string;
  emotionalAvg: number | null;
  functionalAvg: number | null;
  factorBreakdown: { label: string; value: number }[];
  fitLabel: string;
}

export interface NeighborhoodScoreLike {
  curbAppeal: number;
  streetVibe: number;
}

type AggregatableScore = RoomScore & { customScores?: ScoredCustomValue[] };

export function aggregateSelfScores(scores: AggregatableScore[], neighborhood?: NeighborhoodScoreLike | null): PropertyAggregate {
  if (scores.length === 0 && !neighborhood) {
    return {
      score: null,
      scoreColor: '#888780',
      emotionalAvg: null,
      functionalAvg: null,
      factorBreakdown: [],
      fitLabel: 'Not yet visited',
    };
  }

  // Curb appeal reads as a "functional" factor (an objective property trait), street vibe as "emotional"
  // (how it feels) — mirrors how room scores split layout/storage vs. light/vibe.
  const emotionalValues = scores.map(emotionalAvgOf);
  const functionalValues = scores.map(functionalAvgOf);
  if (neighborhood) {
    emotionalValues.push(neighborhood.streetVibe);
    functionalValues.push(neighborhood.curbAppeal);
  }

  const emotionalAvg = round1(emotionalValues.reduce((sum, v) => sum + v, 0) / emotionalValues.length);
  const functionalAvg = round1(functionalValues.reduce((sum, v) => sum + v, 0) / functionalValues.length);
  const score = round1((emotionalAvg + functionalAvg) / 2);

  const factorBreakdown: { label: string; value: number }[] = [];
  if (scores.length > 0) {
    const avgLayout = round1(scores.reduce((sum, s) => sum + s.layout, 0) / scores.length);
    const avgStorage = round1(scores.reduce((sum, s) => sum + s.storage, 0) / scores.length);
    const avgLight = round1(scores.reduce((sum, s) => sum + s.light, 0) / scores.length);
    const avgVibe = round1(scores.reduce((sum, s) => sum + s.vibe, 0) / scores.length);
    factorBreakdown.push(
      { label: 'Natural light', value: avgLight },
      { label: 'Layout flow', value: avgLayout },
      { label: 'Storage', value: avgStorage },
      { label: 'Vibe / feel', value: avgVibe },
    );

    const customValuesByLabel = new Map<string, number[]>();
    for (const s of scores) {
      for (const c of s.customScores ?? []) {
        const arr = customValuesByLabel.get(c.label) ?? [];
        arr.push(c.value);
        customValuesByLabel.set(c.label, arr);
      }
    }
    for (const [label, values] of customValuesByLabel) {
      factorBreakdown.push({ label, value: round1(values.reduce((sum, v) => sum + v, 0) / values.length) });
    }
  }
  if (neighborhood) {
    factorBreakdown.push(
      { label: 'Curb appeal', value: neighborhood.curbAppeal },
      { label: 'Street vibe', value: neighborhood.streetVibe },
    );
  }

  return {
    score,
    scoreColor: score >= 8 ? '#1D9E75' : '#534AB7',
    emotionalAvg,
    functionalAvg,
    factorBreakdown,
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
      text: `${weakest.label} is consistently strong so far.`,
    });
  }
  return insights;
}
