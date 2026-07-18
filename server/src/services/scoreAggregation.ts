import type { MetricCategory, RoomScore } from '@prisma/client';

// Baseline factors (layout/storage/light/vibe, curbAppeal/streetVibe) aren't backed by a
// CustomMetric, so they get this implicit weight — it matches CustomMetric's own default
// weight, so a household that hasn't customized any weights sees the same numbers as a
// plain unweighted mean.
const BASELINE_WEIGHT = 5;

export interface ScoredCustomValue {
  metricId: string;
  value: number;
  category: MetricCategory;
  label: string;
  weight: number;
}

export interface ScoredRoom {
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  customScores?: ScoredCustomValue[];
}

function weightedMean(parts: { value: number; weight: number }[]): number {
  const totalWeight = parts.reduce((sum, p) => sum + p.weight, 0);
  return parts.reduce((sum, p) => sum + p.value * p.weight, 0) / totalWeight;
}

export function emotionalAvgOf(r: ScoredRoom): number {
  const parts = [
    { value: r.light, weight: BASELINE_WEIGHT },
    { value: r.vibe, weight: BASELINE_WEIGHT },
    ...(r.customScores ?? []).filter((c) => c.category === 'EMOTIONAL').map((c) => ({ value: c.value, weight: c.weight })),
  ];
  return weightedMean(parts);
}

export function functionalAvgOf(r: ScoredRoom): number {
  const parts = [
    { value: r.layout, weight: BASELINE_WEIGHT },
    { value: r.storage, weight: BASELINE_WEIGHT },
    ...(r.customScores ?? []).filter((c) => c.category === 'FUNCTIONAL').map((c) => ({ value: c.value, weight: c.weight })),
  ];
  return weightedMean(parts);
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function toScoredCustom(
  raw: { metricId: string; value: number; metric: { category: MetricCategory; label: string; weight: number } }[],
): ScoredCustomValue[] {
  return raw.map((c) => ({ metricId: c.metricId, value: c.value, category: c.metric.category, label: c.metric.label, weight: c.metric.weight }));
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

export function aggregateSelfScores(
  scores: AggregatableScore[],
  neighborhood?: NeighborhoodScoreLike | null,
  propertyMetrics: ScoredCustomValue[] = [],
): PropertyAggregate {
  if (scores.length === 0 && !neighborhood && propertyMetrics.length === 0) {
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

  // Property-level priority metrics aren't tied to any one room, so they're folded in as a
  // single pseudo-room: one weighted sub-average per category, alongside each room's own average.
  const emotionalPropertyMetrics = propertyMetrics.filter((m) => m.category === 'EMOTIONAL');
  const functionalPropertyMetrics = propertyMetrics.filter((m) => m.category === 'FUNCTIONAL');
  if (emotionalPropertyMetrics.length > 0) {
    emotionalValues.push(weightedMean(emotionalPropertyMetrics.map((m) => ({ value: m.value, weight: m.weight }))));
  }
  if (functionalPropertyMetrics.length > 0) {
    functionalValues.push(weightedMean(functionalPropertyMetrics.map((m) => ({ value: m.value, weight: m.weight }))));
  }

  // Rooms and neighborhood always populate both arrays, but a household that's only scored
  // property-level priorities in one category (before visiting any rooms) can leave the other empty.
  const emotionalAvg = emotionalValues.length > 0 ? round1(emotionalValues.reduce((sum, v) => sum + v, 0) / emotionalValues.length) : null;
  const functionalAvg = functionalValues.length > 0 ? round1(functionalValues.reduce((sum, v) => sum + v, 0) / functionalValues.length) : null;
  const score = emotionalAvg !== null && functionalAvg !== null ? round1((emotionalAvg + functionalAvg) / 2) : emotionalAvg ?? functionalAvg;

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
  for (const m of propertyMetrics) {
    factorBreakdown.push({ label: m.label, value: m.value });
  }

  const strongFit = score !== null && score >= 8;

  return {
    score,
    scoreColor: strongFit ? '#1D9E75' : '#534AB7',
    emotionalAvg,
    functionalAvg,
    factorBreakdown,
    fitLabel: strongFit ? 'Strong lifestyle fit' : 'Moderate lifestyle fit',
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
