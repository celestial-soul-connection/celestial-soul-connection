/**
 * placeSearch.ts — resolve a birthplace string → coordinates + timezone.
 *
 * Consumes the founder's existing Karmian place-search service
 * (GET /places/search?q=&limit=). That service may be asleep (Render) or return
 * empty (upstream geocoder), so we degrade to a small built-in city list as a
 * fallback — the birthplace step must NEVER hard-block onboarding.
 *
 * When the upstream geocoder is fixed, the live results take precedence
 * automatically; the fallback only fills in when the API yields nothing.
 */
import { ASTRO_BASE_URL, ASTRO_API_KEY, PLACE_SEARCH_PATH } from '../config';

export interface Place {
  place: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/** Minimal offline fallback so onboarding always works. Extend freely. */
const FALLBACK: Place[] = [
  { place: 'Mumbai, India', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata' },
  { place: 'Delhi, India', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata' },
  { place: 'Bengaluru, India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata' },
  { place: 'Pune, India', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata' },
  { place: 'Hyderabad, India', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { place: 'Chennai, India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata' },
  { place: 'Kolkata, India', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata' },
  { place: 'Ahmedabad, India', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata' },
  { place: 'Jaipur, India', latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata' },
  { place: 'Lucknow, India', latitude: 26.8467, longitude: 80.9462, timezone: 'Asia/Kolkata' },
  { place: 'Porbandar, India', latitude: 21.6417, longitude: 69.6293, timezone: 'Asia/Kolkata' },
  { place: 'London, UK', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { place: 'New York, USA', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { place: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { place: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { place: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
];

function fromFallback(q: string): Place[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  return FALLBACK.filter((p) => p.place.toLowerCase().includes(s)).slice(0, 8);
}

/** Map a single API result object (shape tolerant) to our Place. */
function mapResult(r: any): Place | null {
  const lat = r.latitude ?? r.lat ?? r.coordinates?.latitude;
  const lon = r.longitude ?? r.lon ?? r.lng ?? r.coordinates?.longitude;
  if (typeof lat !== 'number' || typeof lon !== 'number') return null;
  return {
    place: r.place ?? r.name ?? r.display_name ?? r.label ?? 'Unknown',
    latitude: lat,
    longitude: lon,
    timezone: r.timezone ?? r.tz ?? 'Asia/Kolkata',
  };
}

export async function searchPlaces(query: string): Promise<Place[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url = `${ASTRO_BASE_URL}${PLACE_SEARCH_PATH}?q=${encodeURIComponent(q)}&limit=8`;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { headers: { 'X-API-Key': ASTRO_API_KEY }, signal: ctrl.signal });
    clearTimeout(timer);
    if (res.ok) {
      const data = await res.json();
      const results: any[] = data.results ?? data ?? [];
      const mapped = results.map(mapResult).filter((x): x is Place => !!x);
      if (mapped.length) return mapped;
    }
  } catch {
    // fall through to offline fallback
  }
  return fromFallback(q);
}
