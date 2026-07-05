import type { MetricCategory, ProfileMethod, TagSource } from '../enums.js';

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
  tags: PreferenceTag[];
}

export interface CustomMetric {
  id: string;
  label: string;
  category: MetricCategory;
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
