import { getApiUsage, recordApiCall } from './apiUsage.js';

const SERVICE = 'rentcast';

export interface PropertyLookupResult {
  sqft: number | null;
  beds: number | null;
  baths: number | null;
  yearBuilt: number | null;
  estValue: number | null;
}

export interface PropertyLookupResponse {
  result: PropertyLookupResult | null;
  // True when we refused to call RentCast at all because the monthly cap (RENTCAST_MONTHLY_LIMIT,
  // self-enforced via ApiUsage — RentCast's API doesn't expose remaining-quota headers) was
  // already hit. Distinct from `result: null`, which can also mean "we asked, they had nothing."
  limitReached: boolean;
}

// Each call here is a real, billable RentCast request — checked against the cap immediately
// before, and recorded immediately after, so usage stays accurate even if the response body
// parsing fails downstream. The two calls in lookupPropertyDetails race independently (each
// checks the cap for itself), so in the rare case both fire right at the boundary, usage can
// overshoot the cap by at most 1 — acceptable for a single-user app clicking one button at a time.
async function rentcastGet(path: string, params: Record<string, string>): Promise<unknown | null> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) return null;

  const usage = await getApiUsage(SERVICE);
  if (usage.remaining <= 0) return null;

  const url = new URL(`https://api.rentcast.io/v1${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' } });
  await recordApiCall(SERVICE);
  if (!res.ok) return null;
  return res.json();
}

// Best-effort auto-fill for the "add a property" form — structural facts only (list price is
// private MLS data RentCast doesn't have, so that stays a manual field).
export async function lookupPropertyDetails(address: string): Promise<PropertyLookupResponse> {
  if (!process.env.RENTCAST_API_KEY) return { result: null, limitReached: false };

  const usage = await getApiUsage(SERVICE);
  if (usage.remaining <= 0) return { result: null, limitReached: true };

  const [records, avm] = await Promise.all([
    rentcastGet('/properties', { address }) as Promise<
      { bedrooms?: number; bathrooms?: number; squareFootage?: number; yearBuilt?: number }[] | null
    >,
    rentcastGet('/avm/value', { address }) as Promise<{ price?: number } | null>,
  ]);

  const record = Array.isArray(records) ? records[0] : undefined;
  if (!record && !avm) return { result: null, limitReached: false };

  return {
    result: {
      sqft: typeof record?.squareFootage === 'number' ? Math.round(record.squareFootage) : null,
      beds: typeof record?.bedrooms === 'number' ? Math.round(record.bedrooms) : null,
      baths: typeof record?.bathrooms === 'number' ? Math.round(record.bathrooms) : null,
      yearBuilt: typeof record?.yearBuilt === 'number' ? record.yearBuilt : null,
      estValue: typeof avm?.price === 'number' ? Math.round(avm.price) : null,
    },
    limitReached: false,
  };
}

export async function getRentcastUsage() {
  return getApiUsage(SERVICE);
}
