import { Router } from 'express';
import type { BuyersData, ImprovePlan, Listing, MarketData } from 'shared';
import { prisma } from '../lib/prisma.js';
import { getListingDashboardInsights } from '../services/aiInsights.js';

export const listingRouter = Router();

async function getOrCreateListing() {
  const existing = await prisma.listing.findFirst();
  if (existing) return existing;
  return prisma.listing.create({
    data: {
      address: '',
      city: '',
      state: '',
      listPrice: 0,
      sqft: 0,
      beds: 0,
      baths: 0,
      estValueLow: 0,
      estValueHigh: 0,
      confidenceScore: 0,
      avgDaysOnMarket: 0,
      pricePerSqft: 0,
      buyerEmotionalAvg: 0,
      buyerFunctionalAvg: 0,
      marketStatus: 'Unknown',
      buyerViewsCount: 0,
      walkabilityScore: 0,
      parkAccessScore: 0,
      privacyScore: 0,
      schoolQualityScore: 0,
      noiseLevelScore: 0,
      buyerPriorityLight: 0,
      buyerPriorityKitchen: 0,
      buyerPriorityStorage: 0,
      buyerPriorityLayout: 0,
      fitHosting: 0,
      fitWFH: 0,
      fitOrganization: 0,
      fitFamily: 0,
    },
  });
}

listingRouter.get('/', async (_req, res) => {
  const listing = await getOrCreateListing();
  const topImprovement = await prisma.improvementIdea.findFirst({
    where: { listingId: listing.id },
    orderBy: { valueLift: 'desc' },
  });

  const result: Listing = {
    id: listing.id,
    address: listing.address,
    city: listing.city,
    state: listing.state,
    listPrice: listing.listPrice,
    sqft: listing.sqft,
    beds: listing.beds,
    baths: listing.baths,
    estValueLow: listing.estValueLow,
    estValueHigh: listing.estValueHigh,
    confidenceScore: listing.confidenceScore,
    avgDaysOnMarket: listing.avgDaysOnMarket,
    pricePerSqft: listing.pricePerSqft,
    buyerEmotionalAvg: listing.buyerEmotionalAvg,
    buyerFunctionalAvg: listing.buyerFunctionalAvg,
    marketStatus: listing.marketStatus,
    buyerViewsCount: listing.buyerViewsCount,
    aiInsights: getListingDashboardInsights(listing, topImprovement),
  };

  res.json(result);
});

listingRouter.get('/market', async (_req, res) => {
  const listing = await getOrCreateListing();
  const comps = await prisma.marketComp.findMany({ where: { listingId: listing.id }, orderBy: { saleDate: 'desc' } });

  const tradeoffs = [
    { label: 'Walkability', value: listing.walkabilityScore },
    { label: 'Park access', value: listing.parkAccessScore },
    { label: 'Privacy / lot', value: listing.privacyScore },
    { label: 'School quality', value: listing.schoolQualityScore },
    { label: 'Noise level', value: listing.noiseLevelScore },
  ];

  let warningChip: string | null = null;
  if (listing.noiseLevelScore < 5 || listing.privacyScore < 6) {
    warningChip =
      'Noise and privacy score below local buyer expectations. A privacy fence or added landscaping could meaningfully improve buyer perception.';
  }

  const result: MarketData = {
    listing: {
      id: listing.id,
      address: listing.address,
      city: listing.city,
      state: listing.state,
      listPrice: listing.listPrice,
      sqft: listing.sqft,
      beds: listing.beds,
      baths: listing.baths,
      estValueLow: listing.estValueLow,
      estValueHigh: listing.estValueHigh,
      confidenceScore: listing.confidenceScore,
      avgDaysOnMarket: listing.avgDaysOnMarket,
      pricePerSqft: listing.pricePerSqft,
      buyerEmotionalAvg: listing.buyerEmotionalAvg,
      buyerFunctionalAvg: listing.buyerFunctionalAvg,
      marketStatus: listing.marketStatus,
      buyerViewsCount: listing.buyerViewsCount,
      aiInsights: [],
    },
    comps: comps.map((c) => ({
      id: c.id,
      address: c.address,
      sqft: c.sqft,
      saleDate: c.saleDate.toISOString(),
      price: c.price,
      diffType: c.diffType,
      diffAmount: c.diffAmount,
      note: c.note,
    })),
    tradeoffs,
    warningChip,
  };

  res.json(result);
});

listingRouter.get('/buyers', async (_req, res) => {
  const listing = await getOrCreateListing();
  const roomScores = await prisma.listingRoomScore.findMany({ where: { listingId: listing.id } });

  const nonOverall = roomScores.filter((r) => r.roomName !== 'Overall');
  const strongest = [...nonOverall].sort((a, b) => b.score - a.score)[0];
  const weakest = [...nonOverall].sort((a, b) => a.score - b.score)[0];

  const themeChips = [
    ...(strongest
      ? [{ icon: 'ti-heart', color: '#1D9E75', text: `Buyers respond strongly to the ${strongest.roomName.toLowerCase()} — your highest-rated space.` }]
      : []),
    ...(weakest && weakest.score < 7
      ? [{ icon: 'ti-alert-triangle', color: 'var(--text-warning)', text: `${weakest.roomName} scores lowest with buyers — a common theme in feedback.` }]
      : []),
  ];

  const fits = [
    { label: 'Hosting-friendly', value: listing.fitHosting },
    { label: 'WFH-ready', value: listing.fitWFH },
    { label: 'Organization', value: listing.fitOrganization },
    { label: 'Family-friendly', value: listing.fitFamily },
  ].sort((a, b) => b.value - a.value);

  const result: BuyersData = {
    roomScores: roomScores.map((r) => ({ roomName: r.roomName, score: r.score })),
    emotionalAvg: listing.buyerEmotionalAvg,
    functionalAvg: listing.buyerFunctionalAvg,
    themeChips,
    buyerPriorities: [
      { label: 'Natural light', value: listing.buyerPriorityLight },
      { label: 'Kitchen quality', value: listing.buyerPriorityKitchen },
      { label: 'Storage space', value: listing.buyerPriorityStorage },
      { label: 'Layout flow', value: listing.buyerPriorityLayout },
    ],
    lifestyleFit: fits,
    targetingChip: `Strongest buyer segments: ${fits[0].label.toLowerCase()} and ${fits[1].label.toLowerCase()} buyers.`,
  };

  res.json(result);
});

listingRouter.get('/improvements', async (_req, res) => {
  const listing = await getOrCreateListing();
  const ideas = await prisma.improvementIdea.findMany({ where: { listingId: listing.id }, orderBy: { valueLift: 'desc' } });

  const totalLow = ideas.reduce((sum, i) => sum + i.costLow, 0);
  const totalHigh = ideas.reduce((sum, i) => sum + i.costHigh, 0);
  const totalUplift = ideas.reduce((sum, i) => sum + i.valueLift, 0);

  const result: ImprovePlan = {
    ideas: ideas.map((i) => ({
      id: i.id,
      listingId: i.listingId,
      title: i.title,
      demandLevel: i.demandLevel,
      type: i.type,
      valueLift: i.valueLift,
      costLow: i.costLow,
      costHigh: i.costHigh,
      feasibility: i.feasibility,
      supportingNotes: [i.supportingNote1, i.supportingNote2].filter((n): n is string => !!n),
    })),
    totalLow,
    totalHigh,
    totalUplift,
    summary: `${ideas.length} improvement${ideas.length === 1 ? '' : 's'} flagged by buyer data. Spend: $${(totalLow / 1000).toFixed(0)}K–$${(totalHigh / 1000).toFixed(0)}K. Potential value uplift: ~$${(totalUplift / 1000).toFixed(0)}K.`,
  };

  res.json(result);
});

listingRouter.post('/improvements', async (req, res) => {
  const listing = await getOrCreateListing();
  const { title, demandLevel, type, valueLift, costLow, costHigh, feasibility } = req.body ?? {};
  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const idea = await prisma.improvementIdea.create({
    data: {
      listingId: listing.id,
      title,
      demandLevel: demandLevel ?? 'MODERATE',
      type: type ?? 'COSMETIC',
      valueLift: valueLift ?? 0,
      costLow: costLow ?? 0,
      costHigh: costHigh ?? 0,
      feasibility: feasibility ?? 50,
    },
  });

  res.status(201).json(idea);
});
