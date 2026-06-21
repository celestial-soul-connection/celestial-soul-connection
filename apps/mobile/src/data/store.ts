/**
 * store.ts — the on-device "backend". Screens call THIS, never the network, so
 * we can later swap the body of each function for a real FastAPI call with zero
 * screen changes. State persists via AsyncStorage.
 *
 * For now the "current user" has a fixed psych profile (until the questionnaire
 * is wired). Matches are computed with the REAL scoring algorithm against the
 * seed-profile pool, so the deck shows genuinely ranked, explainable matches.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, MatchResult, PsychProfile, Message } from './types';
import { SEED_PROFILES, PROBES } from './seedProfiles';
import { scorePair } from './scoring';

const PASSED_KEY = '@csc/passed';
const LIKED_KEY = '@csc/liked';
const MSGS_KEY = '@csc/messages';
const MEPSYCH_KEY = '@csc/me_psych';

/** Default "me" profile until the questionnaire overrides it. */
const DEFAULT_ME: PsychProfile = {
  attachmentSecure: 0.8, attachmentAnxious: 0.25, attachmentAvoidant: 0.2,
  openness: 0.75, conscientiousness: 0.72, extraversion: 0.5, agreeableness: 0.8, neuroticism: 0.3,
  wantsKids: 0.8, religiousImportance: 0.45, ambition: 0.72, familyOrientation: 0.78,
  adventurousness: 0.7, conflictRepair: 0.8, intent: 0.92,
};

async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function getMyPsych(): Promise<PsychProfile> {
  return getJSON(MEPSYCH_KEY, DEFAULT_ME);
}

export async function setMyPsych(p: PsychProfile): Promise<void> {
  await AsyncStorage.setItem(MEPSYCH_KEY, JSON.stringify(p));
}

/** Build the ranked deck: score every not-yet-seen profile, sort high→low. */
export async function getDeck(): Promise<MatchResult[]> {
  const me = await getMyPsych();
  const passed = await getJSON<string[]>(PASSED_KEY, []);
  const liked = await getJSON<string[]>(LIKED_KEY, []);
  const seen = new Set([...passed, ...liked]);

  const ranked = SEED_PROFILES.filter((p) => !seen.has(p.id))
    .map((profile, i) => {
      const b = scorePair(me, profile.psych);
      const reasons = b.dims.slice(0, 4).map((d) => ({ dim: d.label, pct: d.pct, tone: d.tone }));
      return {
        profile,
        score: b.score,
        reasons,
        probe: PROBES[i % PROBES.length],
      } as MatchResult;
    })
    .sort((a, b) => b.score - a.score);

  return ranked;
}

export async function passProfile(id: string): Promise<void> {
  const passed = await getJSON<string[]>(PASSED_KEY, []);
  if (!passed.includes(id)) await AsyncStorage.setItem(PASSED_KEY, JSON.stringify([...passed, id]));
}

export async function likeProfile(id: string): Promise<void> {
  const liked = await getJSON<string[]>(LIKED_KEY, []);
  if (!liked.includes(id)) await AsyncStorage.setItem(LIKED_KEY, JSON.stringify([...liked, id]));
}

/** Reset the deck (handy for demoing). */
export async function resetDeck(): Promise<void> {
  await AsyncStorage.multiRemove([PASSED_KEY, LIKED_KEY]);
}

/* ----- chat ----- */
export async function getMessages(matchId: string): Promise<Message[]> {
  const all = await getJSON<Record<string, Message[]>>(MSGS_KEY, {});
  return all[matchId] ?? [];
}

export async function addMessage(m: Message): Promise<void> {
  const all = await getJSON<Record<string, Message[]>>(MSGS_KEY, {});
  all[m.matchId] = [...(all[m.matchId] ?? []), m];
  await AsyncStorage.setItem(MSGS_KEY, JSON.stringify(all));
}
