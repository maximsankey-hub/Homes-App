import type { MetricCategory, RoomFeeling, ScorerRole } from '../enums.js';
import type { Media } from './media.js';

export interface Scorer {
  id: string;
  name: string;
  role: ScorerRole;
  initials: string;
  colorHex: string;
  contact: string | null;
}

export interface CustomMetricScore {
  metricId: string;
  label: string;
  category: MetricCategory;
  value: number;
}

export interface RoomScore {
  id: string;
  roomId: string;
  scorer: Scorer;
  layout: number;
  storage: number;
  light: number;
  vibe: number;
  feeling: RoomFeeling;
  note: string | null;
  emotionalAvg: number;
  functionalAvg: number;
  customScores: CustomMetricScore[];
  createdAt: string;
}

export interface Room {
  id: string;
  propertyId: string;
  name: string;
  icon: string;
  scores: RoomScore[];
  media: Media[];
}

export interface NeighborhoodScore {
  id: string;
  propertyId: string;
  scorer: Scorer;
  curbAppeal: number;
  streetVibe: number;
  feeling: RoomFeeling;
  note: string | null;
  createdAt: string;
}

export interface FactorBreakdown {
  label: string;
  value: number;
}

export interface PartnerComparisonRow {
  label: string;
  selfValue: number;
  partnerValue: number;
  agree: boolean;
}

export interface PartnerComparison {
  self: { score: number; feelingLabel: string };
  partner: { score: number; feelingLabel: string; note: string | null } | null;
  partnerJoined: boolean;
  factors: PartnerComparisonRow[];
  agreement: { label: string; agree: boolean; note: string }[];
}

export interface HouseholdMember {
  id: string;
  name: string;
  role: ScorerRole;
  initials: string;
  colorHex: string;
  isYou: boolean;
}

export interface Household {
  id: string;
  inviteCode: string;
  members: HouseholdMember[];
}
