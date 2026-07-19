import type { MetricCategory, MetricScope, ProfileMethod, TagSource } from '../enums.js';

export interface PreferenceTag {
  id: string;
  label: string;
  source: TagSource;
}

export interface PreferenceProfile {
  id: string;
  method: ProfileMethod;
  freeText: string | null;
  weightEmotional: number;
  weightStorage: number;
  weightLight: number;
  weightNeighborhood: number;
  aestheticStyle: string | null;
  hasPets: boolean;
  petTypes: string[];
  householdComposition: string | null;
  householdCompositionOther: string | null;
  priorityBudgetVsDream: number;
  priorityMoveInReadyVsReno: number;
  tags: PreferenceTag[];
}

export interface CustomMetric {
  id: string;
  label: string;
  category: MetricCategory;
  scope: MetricScope;
  targetRoomName: string | null;
  topicKey: string | null;
  weight: number;
}

export interface PatternInsight {
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  barValues?: number[];
  barLabels?: string[];
  chip?: { icon: string; color: string; text: string };
}
