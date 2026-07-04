import type { PropertyStatus, IdeaType, PlaceCategory } from '../enums.js';
import type { AIInsight, Badge } from './common.js';
import type { Room, FactorBreakdown } from './roomScore.js';
import type { Media } from './media.js';

export interface PropertySummary {
  id: string;
  address: string;
  city: string;
  state: string;
  listingPrice: number;
  sqft: number;
  beds: number;
  baths: number;
  status: PropertyStatus;
  lastVisitedAt: string | null;
  score: number | null;
  scoreColor: string;
  badges: Badge[];
}

export interface PropertyMetric {
  value: string;
  label: string;
}

export interface PropertyDetail extends PropertySummary {
  yearBuilt: number | null;
  fitLabel: string;
  visitSummary: string;
  metrics: PropertyMetric[];
  aiInsights: AIInsight[];
  rooms: Room[];
  untaggedMedia: Media[];
  factorBreakdown: FactorBreakdown[];
  emotionalAvg: number | null;
  functionalAvg: number | null;
  secondaryInsights: { icon: string; color: string; text: string }[];
  walkScore: number | null;
  transitScore: number | null;
  bikeScore: number | null;
  neighborhoodCharacter: { label: string; value: number; color: string; textColor: string }[];
}

export interface RenovationIdea {
  id: string;
  propertyId: string;
  title: string;
  room: string;
  type: IdeaType;
  costLow: number;
  costHigh: number;
  feasibility: number;
  need: string | null;
  constraintNote: string | null;
}

export interface NearbyPlace {
  id: string;
  propertyId: string;
  name: string;
  category: PlaceCategory;
  distanceText: string;
  score: number;
  icon: string;
  iconColor: string;
  iconBg: string;
}

export interface CompareLifestyleDimension {
  label: string;
  aValue: number;
  bValue: number;
}

export interface CompareResult {
  propertyA: PropertySummary;
  propertyB: PropertySummary;
  dimensions: CompareLifestyleDimension[];
  aiInsights: AIInsight[];
}
