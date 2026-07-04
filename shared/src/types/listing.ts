import type { CompDiffType, DemandLevel, IdeaType } from '../enums.js';
import type { AIInsight } from './common.js';

export interface Listing {
  id: string;
  address: string;
  city: string;
  state: string;
  listPrice: number;
  sqft: number;
  beds: number;
  baths: number;
  estValueLow: number;
  estValueHigh: number;
  confidenceScore: number;
  avgDaysOnMarket: number;
  pricePerSqft: number;
  buyerEmotionalAvg: number;
  buyerFunctionalAvg: number;
  marketStatus: string;
  buyerViewsCount: number;
  aiInsights: AIInsight[];
}

export interface MarketComp {
  id: string;
  address: string;
  sqft: number;
  saleDate: string;
  price: number;
  diffType: CompDiffType;
  diffAmount: number;
  note: string | null;
}

export interface MarketData {
  listing: Listing;
  comps: MarketComp[];
  tradeoffs: { label: string; value: number }[];
  warningChip: string | null;
}

export interface ListingRoomScore {
  roomName: string;
  score: number;
}

export interface BuyersData {
  roomScores: ListingRoomScore[];
  emotionalAvg: number;
  functionalAvg: number;
  themeChips: { icon: string; color: string; text: string }[];
  buyerPriorities: { label: string; value: number }[];
  lifestyleFit: { label: string; value: number }[];
  targetingChip: string;
}

export interface ImprovementIdea {
  id: string;
  listingId: string;
  title: string;
  demandLevel: DemandLevel;
  type: IdeaType;
  valueLift: number;
  costLow: number;
  costHigh: number;
  feasibility: number;
  supportingNotes: string[];
}

export interface ImprovePlan {
  ideas: ImprovementIdea[];
  totalLow: number;
  totalHigh: number;
  totalUplift: number;
  summary: string;
}
