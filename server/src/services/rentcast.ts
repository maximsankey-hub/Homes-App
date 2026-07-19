export interface PropertyLookupResult {
  sqft: number | null;
  beds: number | null;
  baths: number | null;
  yearBuilt: number | null;
  estValue: number | null;
}

async function rentcastGet(path: string, params: Record<string, string>): Promise<unknown | null> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) return null;

  const url = new URL(`https://api.rentcast.io/v1${path}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

  const res = await fetch(url, { headers: { 'X-Api-Key': apiKey, Accept: 'application/json' } });
  if (!res.ok) return null;
  return res.json();
}

// Best-effort auto-fill for the "add a property" form — structural facts only (list price is
// private MLS data RentCast doesn't have, so that stays a manual field). Returns nulls for
// anything missing or if the lookup fails outright, rather than throwing.
export async function lookupPropertyDetails(address: string): Promise<PropertyLookupResult | null> {
  if (!process.env.RENTCAST_API_KEY) return null;

  const [records, avm] = await Promise.all([
    rentcastGet('/properties', { address }) as Promise<
      { bedrooms?: number; bathrooms?: number; squareFootage?: number; yearBuilt?: number }[] | null
    >,
    rentcastGet('/avm/value', { address }) as Promise<{ price?: number } | null>,
  ]);

  const record = Array.isArray(records) ? records[0] : undefined;
  if (!record && !avm) return null;

  return {
    sqft: typeof record?.squareFootage === 'number' ? Math.round(record.squareFootage) : null,
    beds: typeof record?.bedrooms === 'number' ? Math.round(record.bedrooms) : null,
    baths: typeof record?.bathrooms === 'number' ? Math.round(record.bathrooms) : null,
    yearBuilt: typeof record?.yearBuilt === 'number' ? record.yearBuilt : null,
    estValue: typeof avm?.price === 'number' ? Math.round(avm.price) : null,
  };
}
