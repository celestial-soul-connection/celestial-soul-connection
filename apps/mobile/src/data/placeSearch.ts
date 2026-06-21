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

/**
 * Offline fallback so onboarding NEVER dead-ends when the live geocoder is down
 * or returns empty. `aliases` capture common alternate spellings (Bangalore →
 * Bengaluru, Bombay → Mumbai, etc.) so a user's natural spelling still matches.
 * Live API results always take precedence; this only fills gaps.
 */
type FallbackPlace = Place & { aliases?: string[] };
const FALLBACK: FallbackPlace[] = [
  // --- India: metros + major cities (covers the large majority of users) ---
  { place: 'Mumbai, India', latitude: 19.076, longitude: 72.8777, timezone: 'Asia/Kolkata', aliases: ['bombay'] },
  { place: 'Delhi, India', latitude: 28.6139, longitude: 77.209, timezone: 'Asia/Kolkata', aliases: ['new delhi'] },
  { place: 'Bengaluru, India', latitude: 12.9716, longitude: 77.5946, timezone: 'Asia/Kolkata', aliases: ['bangalore', 'bengalore'] },
  { place: 'Hyderabad, India', latitude: 17.385, longitude: 78.4867, timezone: 'Asia/Kolkata' },
  { place: 'Chennai, India', latitude: 13.0827, longitude: 80.2707, timezone: 'Asia/Kolkata', aliases: ['madras'] },
  { place: 'Kolkata, India', latitude: 22.5726, longitude: 88.3639, timezone: 'Asia/Kolkata', aliases: ['calcutta'] },
  { place: 'Pune, India', latitude: 18.5204, longitude: 73.8567, timezone: 'Asia/Kolkata', aliases: ['poona'] },
  { place: 'Ahmedabad, India', latitude: 23.0225, longitude: 72.5714, timezone: 'Asia/Kolkata', aliases: ['amdavad'] },
  { place: 'Surat, India', latitude: 21.1702, longitude: 72.8311, timezone: 'Asia/Kolkata' },
  { place: 'Jaipur, India', latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata' },
  { place: 'Lucknow, India', latitude: 26.8467, longitude: 80.9462, timezone: 'Asia/Kolkata' },
  { place: 'Kanpur, India', latitude: 26.4499, longitude: 80.3319, timezone: 'Asia/Kolkata' },
  { place: 'Nagpur, India', latitude: 21.1458, longitude: 79.0882, timezone: 'Asia/Kolkata' },
  { place: 'Indore, India', latitude: 22.7196, longitude: 75.8577, timezone: 'Asia/Kolkata' },
  { place: 'Bhopal, India', latitude: 23.2599, longitude: 77.4126, timezone: 'Asia/Kolkata' },
  { place: 'Patna, India', latitude: 25.5941, longitude: 85.1376, timezone: 'Asia/Kolkata' },
  { place: 'Vadodara, India', latitude: 22.3072, longitude: 73.1812, timezone: 'Asia/Kolkata', aliases: ['baroda'] },
  { place: 'Visakhapatnam, India', latitude: 17.6868, longitude: 83.2185, timezone: 'Asia/Kolkata', aliases: ['vizag'] },
  { place: 'Ludhiana, India', latitude: 30.901, longitude: 75.8573, timezone: 'Asia/Kolkata' },
  { place: 'Agra, India', latitude: 27.1767, longitude: 78.0081, timezone: 'Asia/Kolkata' },
  { place: 'Nashik, India', latitude: 19.9975, longitude: 73.7898, timezone: 'Asia/Kolkata' },
  { place: 'Coimbatore, India', latitude: 11.0168, longitude: 76.9558, timezone: 'Asia/Kolkata' },
  { place: 'Kochi, India', latitude: 9.9312, longitude: 76.2673, timezone: 'Asia/Kolkata', aliases: ['cochin'] },
  { place: 'Thiruvananthapuram, India', latitude: 8.5241, longitude: 76.9366, timezone: 'Asia/Kolkata', aliases: ['trivandrum'] },
  { place: 'Chandigarh, India', latitude: 30.7333, longitude: 76.7794, timezone: 'Asia/Kolkata' },
  { place: 'Guwahati, India', latitude: 26.1445, longitude: 91.7362, timezone: 'Asia/Kolkata' },
  { place: 'Bhubaneswar, India', latitude: 20.2961, longitude: 85.8245, timezone: 'Asia/Kolkata' },
  { place: 'Dehradun, India', latitude: 30.3165, longitude: 78.0322, timezone: 'Asia/Kolkata' },
  { place: 'Amritsar, India', latitude: 31.634, longitude: 74.8723, timezone: 'Asia/Kolkata' },
  { place: 'Varanasi, India', latitude: 25.3176, longitude: 82.9739, timezone: 'Asia/Kolkata', aliases: ['benares', 'kashi'] },
  { place: 'Ranchi, India', latitude: 23.3441, longitude: 85.3096, timezone: 'Asia/Kolkata' },
  { place: 'Raipur, India', latitude: 21.2514, longitude: 81.6296, timezone: 'Asia/Kolkata' },
  { place: 'Jodhpur, India', latitude: 26.2389, longitude: 73.0243, timezone: 'Asia/Kolkata' },
  { place: 'Madurai, India', latitude: 9.9252, longitude: 78.1198, timezone: 'Asia/Kolkata' },
  { place: 'Mysuru, India', latitude: 12.2958, longitude: 76.6394, timezone: 'Asia/Kolkata', aliases: ['mysore'] },
  { place: 'Goa (Panaji), India', latitude: 15.4909, longitude: 73.8278, timezone: 'Asia/Kolkata', aliases: ['goa', 'panjim'] },
  { place: 'Porbandar, India', latitude: 21.6417, longitude: 69.6293, timezone: 'Asia/Kolkata' },
  { place: 'Srinagar, India', latitude: 34.0837, longitude: 74.7973, timezone: 'Asia/Kolkata' },
  { place: 'Jammu, India', latitude: 32.7266, longitude: 74.857, timezone: 'Asia/Kolkata' },
  { place: 'Shimla, India', latitude: 31.1048, longitude: 77.1734, timezone: 'Asia/Kolkata' },
  { place: 'Gurugram, India', latitude: 28.4595, longitude: 77.0266, timezone: 'Asia/Kolkata', aliases: ['gurgaon'] },
  { place: 'Noida, India', latitude: 28.5355, longitude: 77.391, timezone: 'Asia/Kolkata' },
  // --- diaspora hubs / common world cities ---
  { place: 'London, UK', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
  { place: 'New York, USA', latitude: 40.7128, longitude: -74.006, timezone: 'America/New_York' },
  { place: 'San Francisco, USA', latitude: 37.7749, longitude: -122.4194, timezone: 'America/Los_Angeles' },
  { place: 'Chicago, USA', latitude: 41.8781, longitude: -87.6298, timezone: 'America/Chicago' },
  { place: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708, timezone: 'Asia/Dubai' },
  { place: 'Abu Dhabi, UAE', latitude: 24.4539, longitude: 54.3773, timezone: 'Asia/Dubai' },
  { place: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezone: 'Asia/Singapore' },
  { place: 'Toronto, Canada', latitude: 43.6532, longitude: -79.3832, timezone: 'America/Toronto' },
  { place: 'Sydney, Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  { place: 'Kathmandu, Nepal', latitude: 27.7172, longitude: 85.324, timezone: 'Asia/Kathmandu' },
  { place: 'Colombo, Sri Lanka', latitude: 6.9271, longitude: 79.8612, timezone: 'Asia/Colombo' },
  { place: 'Dhaka, Bangladesh', latitude: 23.8103, longitude: 90.4125, timezone: 'Asia/Dhaka' },
];

function fromFallback(q: string): Place[] {
  const s = q.trim().toLowerCase();
  if (s.length < 2) return [];
  const matches = FALLBACK.filter(
    (p) => p.place.toLowerCase().includes(s) || (p.aliases ?? []).some((a) => a.includes(s)),
  );
  // Strip the internal `aliases` field from what we return.
  return matches.slice(0, 8).map(({ aliases, ...place }) => place);
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
