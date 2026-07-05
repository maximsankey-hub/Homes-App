/**
 * Mock cost estimator. Returns the same shape a real Claude API call would —
 * swapping in a real call later only requires editing this body.
 */
const BASE_RANGES: Record<'COSMETIC' | 'STRUCTURAL', [number, number]> = {
  COSMETIC: [1500, 6000],
  STRUCTURAL: [8000, 25000],
};

const KEYWORD_MULTIPLIERS: { keyword: string; multiplier: number }[] = [
  { keyword: 'addition', multiplier: 2.5 },
  { keyword: 'kitchen', multiplier: 1.8 },
  { keyword: 'roof', multiplier: 1.6 },
  { keyword: 'bathroom', multiplier: 1.4 },
  { keyword: 'deck', multiplier: 1.3 },
  { keyword: 'floor', multiplier: 1.2 },
  { keyword: 'window', multiplier: 1.1 },
  { keyword: 'landscap', multiplier: 0.8 },
  { keyword: 'paint', multiplier: 0.4 },
];

export function estimateRenovationCost(description: string, type: 'COSMETIC' | 'STRUCTURAL'): { costLow: number; costHigh: number } {
  const [baseLow, baseHigh] = BASE_RANGES[type] ?? BASE_RANGES.COSMETIC;
  const text = description.toLowerCase();
  const multiplier = KEYWORD_MULTIPLIERS.find((k) => text.includes(k.keyword))?.multiplier ?? 1;

  return {
    costLow: Math.round((baseLow * multiplier) / 100) * 100,
    costHigh: Math.round((baseHigh * multiplier) / 100) * 100,
  };
}
