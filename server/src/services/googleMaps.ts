import type { PlaceCategory } from '@prisma/client';

const CATEGORY_META: Record<PlaceCategory, { icon: string; iconColor: string; iconBg: string }> = {
  GROCERY: { icon: 'ti-building-store', iconColor: '#0C447C', iconBg: '#E6F1FB' },
  PARKS: { icon: 'ti-trees', iconColor: '#27500A', iconBg: '#EAF3DE' },
  SCHOOLS: { icon: 'ti-school', iconColor: '#633806', iconBg: '#FAEEDA' },
  COFFEE: { icon: 'ti-coffee', iconColor: '#633806', iconBg: '#FAEEDA' },
  GYMS: { icon: 'ti-barbell', iconColor: '#72243E', iconBg: '#FBEAF0' },
  FITNESS: { icon: 'ti-barbell', iconColor: '#72243E', iconBg: '#FBEAF0' },
  RESTAURANTS: { icon: 'ti-tools-kitchen-2', iconColor: '#8A3B12', iconBg: '#FBE9DD' },
  OTHER: { icon: 'ti-map-pin', iconColor: '#4B4B4B', iconBg: '#EDEDED' },
};

// Google Places (New) primaryType values we search for, mapped to our PlaceCategory enum.
const GOOGLE_TYPE_TO_CATEGORY: Record<string, PlaceCategory> = {
  supermarket: 'GROCERY',
  grocery_store: 'GROCERY',
  park: 'PARKS',
  school: 'SCHOOLS',
  primary_school: 'SCHOOLS',
  secondary_school: 'SCHOOLS',
  cafe: 'COFFEE',
  gym: 'GYMS',
  fitness_center: 'FITNESS',
  restaurant: 'RESTAURANTS',
};

const SEARCH_TYPES = Object.keys(GOOGLE_TYPE_TO_CATEGORY);
const SEARCH_RADIUS_METERS = 3200; // ~2 miles

export interface GeocodedAddress {
  lat: number;
  lng: number;
}

export async function geocodeAddress(address: string): Promise<GeocodedAddress | null> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) return null;

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', apiKey);

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as { results?: { geometry?: { location?: { lat: number; lng: number } } }[] };
  const location = data?.results?.[0]?.geometry?.location;
  if (typeof location?.lat !== 'number' || typeof location?.lng !== 'number') return null;

  return { lat: location.lat, lng: location.lng };
}

export interface FetchedPlace {
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  distanceText: string;
  score: number;
  icon: string;
  iconColor: string;
  iconBg: string;
}

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3958.8;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function fetchNearbyPlaces(lat: number, lng: number): Promise<FetchedPlace[]> {
  const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
  if (!apiKey) return [];

  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.displayName,places.location,places.rating,places.primaryType',
    },
    body: JSON.stringify({
      includedTypes: SEARCH_TYPES,
      maxResultCount: 20,
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius: SEARCH_RADIUS_METERS },
      },
    }),
  });
  if (!res.ok) return [];

  const data = (await res.json()) as {
    places?: { primaryType?: string; location?: { latitude: number; longitude: number }; rating?: number; displayName?: { text?: string } }[];
  };
  const places = Array.isArray(data.places) ? data.places : [];

  return places
    .map((p): FetchedPlace | null => {
      const category = p.primaryType ? GOOGLE_TYPE_TO_CATEGORY[p.primaryType] : undefined;
      const placeLat = p.location?.latitude;
      const placeLng = p.location?.longitude;
      if (!category || typeof placeLat !== 'number' || typeof placeLng !== 'number') return null;

      const miles = haversineMiles(lat, lng, placeLat, placeLng);
      const walkMinutes = Math.max(1, Math.round((miles / 3) * 60));
      const meta = CATEGORY_META[category];

      return {
        name: p.displayName?.text ?? 'Unknown place',
        category,
        lat: placeLat,
        lng: placeLng,
        distanceText: `${miles.toFixed(1)} mi · ${walkMinutes} min`,
        score: p.rating ? Math.round(p.rating * 2 * 10) / 10 : 7,
        ...meta,
      };
    })
    .filter((p: FetchedPlace | null): p is FetchedPlace => p !== null);
}
