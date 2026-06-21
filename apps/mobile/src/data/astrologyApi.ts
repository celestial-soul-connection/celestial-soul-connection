/**
 * astrologyApi.ts — consumes the Karmian /compatibility/full endpoint to get
 * astrological compatibility between two birth charts. THIS REPO DOES NOT COMPUTE
 * ASTROLOGY — it only calls the founder's service and maps the result.
 *
 * Resilience (Render free tier sleeps after ~15 min idle):
 *  - generous timeout + 1 retry so a cold start (server waking) still succeeds
 *  - successful results cached in AsyncStorage keyed by the two birth hashes
 *  - on total failure returns a deterministic local ESTIMATE (estimated:true)
 *    so the UI always shows an astrology layer; never throws, never blocks.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ASTRO_BASE_URL, ASTRO_API_KEY, COMPATIBILITY_PATH, ASTRO_TIMEOUT_MS, ASTRO_RETRIES } from '../config';
import { BirthData, AstroResult } from './types';

const CACHE_PREFIX = '@csc/astro/';

function birthKey(b: BirthData): string {
  return `${b.date}_${b.time}_${b.latitude.toFixed(3)}_${b.longitude.toFixed(3)}`;
}
function pairKey(a: BirthData, b: BirthData): string {
  return CACHE_PREFIX + [birthKey(a), birthKey(b)].sort().join('|');
}

function toPayload(b: BirthData) {
  return { date: b.date, time: b.time, latitude: b.latitude, longitude: b.longitude, timezone: b.timezone };
}

/** Map the rich /compatibility/full response to our compact AstroResult. */
function mapResponse(d: any): AstroResult {
  const areasObj = d.areas ?? {};
  const areas = Object.keys(areasObj).map((label) => ({
    label,
    pct: Math.round(areasObj[label]?.score_pct ?? 0),
  }));
  const ak = d.ashtakoota ?? {};
  // Collect ACTIVE doshas. The API shape is e.g.
  //   mangal_dosha: { person1: bool, person2: bool, compatible: bool, severity: ... }
  // A dosha is "active/concerning" when it affects either person AND is not
  // marked compatible (i.e. not cancelled).
  const doshaKeys = ['mangal_dosha', 'nadi_dosha', 'bhakoot_dosha', 'rajju_dosha', 'stri_dirgha_dosha', 'veda_dosha'];
  const doshas: string[] = [];
  for (const k of doshaKeys) {
    const v = ak[k];
    if (!v) continue;
    let active = false;
    if (typeof v === 'object') {
      const affects = v.person1 || v.person2 || v.present || v.active || v.exists;
      const cancelled = v.compatible === true || v.cancelled === true;
      active = !!affects && !cancelled;
    } else {
      active = !!v;
    }
    if (active) {
      const name = k.replace(/_/g, ' ').replace(/\bdosha\b/, 'Dosha').replace(/^\w/, (c) => c.toUpperCase());
      doshas.push(name);
    }
  }
  return {
    compositePct: Math.round(d.composite_pct ?? ak.percentage ?? 0),
    level: d.final_level ?? ak.compatibility_level ?? 'Unknown',
    ashtakootPoints: Math.round(ak.total_points ?? 0),
    ashtakootMax: ak.max_points ?? 36,
    areas,
    doshas,
    strengths: Array.isArray(d.strengths) ? d.strengths : [],
    concerns: Array.isArray(d.concerns) ? d.concerns : [],
    recommendation: d.recommendation ?? '',
  };
}

async function fetchOnce(a: BirthData, b: BirthData): Promise<AstroResult | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ASTRO_TIMEOUT_MS);
  try {
    const res = await fetch(`${ASTRO_BASE_URL}${COMPATIBILITY_PATH}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': ASTRO_API_KEY },
      body: JSON.stringify({ person1: toPayload(a), person2: toPayload(b) }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.success === false) return null;
    return mapResponse(data);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Deterministic local estimate when the API is unreachable (server asleep). */
function estimate(a: BirthData, b: BirthData): AstroResult {
  // Seeded by birth dates so the same pair always shows the same numbers.
  const seed = (birthKey(a) + birthKey(b)).split('').reduce((s, c) => (s * 31 + c.charCodeAt(0)) % 100000, 7);
  const r = (n: number) => 40 + ((seed >> n) % 55); // 40..94
  const areaLabels = ['Health & Longevity', 'Sexual & Physical Harmony', 'Mental & Emotional', 'Family & Finance', 'Progeny', 'Spiritual & Karmic'];
  const areas = areaLabels.map((label, i) => ({ label, pct: r(i + 1) }));
  const composite = Math.round(areas.reduce((s, x) => s + x.pct, 0) / areas.length);
  return {
    compositePct: composite,
    level: composite >= 70 ? 'Promising' : composite >= 50 ? 'Acceptable' : 'Needs reflection',
    ashtakootPoints: Math.round((composite / 100) * 36),
    ashtakootMax: 36,
    areas,
    doshas: [],
    strengths: areas.filter((x) => x.pct >= 70).map((x) => x.label).slice(0, 2),
    concerns: areas.filter((x) => x.pct < 55).map((x) => x.label).slice(0, 2),
    recommendation: 'Estimated reading — the astrology service was unavailable, so this is a local approximation. Reconnect to refresh with the full chart analysis.',
    estimated: true,
  };
}

/**
 * Public: get astrology compatibility for a pair. Cached → live (with wake retry)
 * → estimate. Never throws. Returns null only if both births are incomplete.
 */
export async function getAstroCompatibility(a?: BirthData, b?: BirthData): Promise<AstroResult | null> {
  if (!a || !b) return null;
  const key = pairKey(a, b);

  // 1) cache
  try {
    const cached = await AsyncStorage.getItem(key);
    if (cached) return JSON.parse(cached) as AstroResult;
  } catch {}

  // 2) live with retries (handles Render cold start)
  for (let attempt = 0; attempt <= ASTRO_RETRIES; attempt++) {
    const live = await fetchOnce(a, b);
    if (live) {
      AsyncStorage.setItem(key, JSON.stringify(live)).catch(() => {});
      return live;
    }
  }

  // 3) graceful estimate (not cached, so a future warm call replaces it)
  return estimate(a, b);
}
