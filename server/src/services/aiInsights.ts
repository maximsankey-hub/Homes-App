import type { AIInsight } from 'shared';
import type { PropertyAggregate } from './scoreAggregation.js';

interface PropertyLike {
  address: string;
  status: string;
}

/**
 * Mock AI insight generator. Each exported function corresponds to one wireframe
 * screen's "AI insights" card and returns the same shape a real Claude API call
 * would — swapping in a real call later only requires editing these bodies.
 */
export function getPropertyOverviewInsights(property: PropertyLike, agg: PropertyAggregate): AIInsight[] {
  if (property.status === 'NOT_VISITED' || agg.factorBreakdown.length === 0) {
    return [
      {
        label: 'Pre-visit note',
        icon: 'ti-info-circle',
        text: 'Visit this home to generate personalized lifestyle fit insights.',
      },
    ];
  }

  const sorted = [...agg.factorBreakdown].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const insights: AIInsight[] = [
    {
      label: 'Lifestyle match',
      icon: 'ti-sparkles',
      text: `Strong alignment on ${strongest.label.toLowerCase()} (${strongest.value.toFixed(1)}/10) — one of this home's clearest strengths for you.`,
    },
  ];

  if (weakest.value < 7) {
    insights.push({
      label: 'Watch out',
      icon: 'ti-alert-triangle',
      text: `${weakest.label} is the softest factor so far (${weakest.value.toFixed(1)}/10) — worth budgeting for improvements if this is a priority for you.`,
    });
  }

  return insights;
}

interface ListingLike {
  buyerEmotionalAvg: number;
  buyerFunctionalAvg: number;
  fitHosting: number;
  fitWFH: number;
  fitOrganization: number;
  fitFamily: number;
}

interface TopImprovementLike {
  title: string;
  costLow: number;
  costHigh: number;
  valueLift: number;
}

export function getListingDashboardInsights(listing: ListingLike, topImprovement: TopImprovementLike | null): AIInsight[] {
  const insights: AIInsight[] = [
    {
      label: 'Positioning',
      icon: 'ti-sparkles',
      text: `Your home performs well emotionally (${listing.buyerEmotionalAvg.toFixed(1)}/10). Functional scores (${listing.buyerFunctionalAvg.toFixed(1)}/10) trail behind — that gap is worth closing before you list.`,
    },
  ];

  const fits = [
    { label: 'hosting-oriented buyers', value: listing.fitHosting },
    { label: 'work-from-home buyers', value: listing.fitWFH },
    { label: 'organization-focused buyers', value: listing.fitOrganization },
    { label: 'families', value: listing.fitFamily },
  ].sort((a, b) => b.value - a.value);
  insights.push({
    label: 'Buyer match',
    icon: 'ti-users',
    text: `Strongest fit for ${fits[0].label} (${fits[0].value.toFixed(1)}/10). Lower alignment with ${fits[fits.length - 1].label} (${fits[fits.length - 1].value.toFixed(1)}/10).`,
  });

  if (topImprovement) {
    insights.push({
      label: 'Top opportunity',
      icon: 'ti-hammer',
      text: `${topImprovement.title} ($${(topImprovement.costLow / 1000).toFixed(0)}–${(topImprovement.costHigh / 1000).toFixed(0)}K) could increase perceived value by ~$${(topImprovement.valueLift / 1000).toFixed(0)}K.`,
    });
  }

  return insights;
}
