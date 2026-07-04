import type { RoomScore } from '@prisma/client';
import { emotionalAvgOf, functionalAvgOf, round1 } from './scoreAggregation.js';

type ScoredRoomWithMeta = RoomScore & { roomId: string };

function overallScore(scores: ScoredRoomWithMeta[]): number {
  if (scores.length === 0) return 0;
  const avg = scores.reduce((sum, s) => sum + (emotionalAvgOf(s) + functionalAvgOf(s)) / 2, 0) / scores.length;
  return round1(avg);
}

function mostCommonFeeling(scores: ScoredRoomWithMeta[]): string {
  if (scores.length === 0) return '—';
  const counts = new Map<string, number>();
  for (const s of scores) counts.set(s.feeling, (counts.get(s.feeling) ?? 0) + 1);
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const label = top[0];
  return label.charAt(0) + label.slice(1).toLowerCase();
}

export interface PartnerComparisonResult {
  self: { score: number; feelingLabel: string };
  partner: { score: number; feelingLabel: string; note: string | null } | null;
  factors: { label: string; selfValue: number; partnerValue: number; agree: boolean }[];
  agreement: { label: string; agree: boolean; note: string }[];
}

export function buildPartnerComparison(
  selfScores: ScoredRoomWithMeta[],
  partnerScores: ScoredRoomWithMeta[],
  roomNamesById: Map<string, string>,
  partnerNote: string | null,
): PartnerComparisonResult {
  const self = { score: overallScore(selfScores), feelingLabel: mostCommonFeeling(selfScores) };

  if (partnerScores.length === 0) {
    return { self, partner: null, factors: [], agreement: [] };
  }

  const partner = { score: overallScore(partnerScores), feelingLabel: mostCommonFeeling(partnerScores), note: partnerNote };

  const selfByRoom = new Map(selfScores.map((s) => [s.roomId, s]));
  const partnerByRoom = new Map(partnerScores.map((s) => [s.roomId, s]));

  const factors: PartnerComparisonResult['factors'] = [];
  for (const [roomId, selfScore] of selfByRoom) {
    const partnerScore = partnerByRoom.get(roomId);
    if (!partnerScore) continue;
    const selfValue = round1((emotionalAvgOf(selfScore) + functionalAvgOf(selfScore)) / 2);
    const partnerValue = round1((emotionalAvgOf(partnerScore) + functionalAvgOf(partnerScore)) / 2);
    factors.push({
      label: roomNamesById.get(roomId) ?? 'Room',
      selfValue,
      partnerValue,
      agree: Math.abs(selfValue - partnerValue) <= 1.5,
    });
  }

  const agreement = factors.map((f) => ({
    label: f.label,
    agree: f.agree,
    note: f.agree ? 'Both agree' : `You: ${f.selfValue} · Partner: ${f.partnerValue}`,
  }));

  return { self, partner, factors, agreement };
}
