/**
 * store.ts — the on-device "backend". Screens call THIS, never the network, so
 * we can later swap the body of each function with zero screen changes.
 *
 * PERSISTENCE: AsyncStorage for now (local). Planned migration path: local SQLite
 * (expo-sqlite) → hosted (Supabase or similar). Because all reads/writes go
 * through these functions, that swap is contained here — screens never change.
 *
 * Matches are computed with the REAL scoring/matching engine against the
 * seed-profile pool, so the deck shows genuinely ranked, explainable matches.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, MatchResult, PsychProfile, Message, BirthData } from './types';
import { SEED_PROFILES } from './seedProfiles';
import { rankCandidates, Me } from './matching';

const PASSED_KEY = '@csc/passed';
const LIKED_KEY = '@csc/liked';
const REPORTED_KEY = '@csc/reported';
const MSGS_KEY = '@csc/messages';
const MEPSYCH_KEY = '@csc/me_psych';
const MEBIRTH_KEY = '@csc/me_birth';
const MEAGE_KEY = '@csc/me_age';

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

export async function getMyBirth(): Promise<BirthData | undefined> {
  return getJSON<BirthData | undefined>(MEBIRTH_KEY, undefined);
}
export async function setMyBirth(b: BirthData): Promise<void> {
  await AsyncStorage.setItem(MEBIRTH_KEY, JSON.stringify(b));
}
export async function getMyAge(): Promise<number | undefined> {
  return getJSON<number | undefined>(MEAGE_KEY, undefined);
}
export async function setMyAge(age: number): Promise<void> {
  await AsyncStorage.setItem(MEAGE_KEY, JSON.stringify(age));
}

const MEINTERESTS_KEY = '@csc/me_interests';
const MEINTENTIONS_KEY = '@csc/me_intentions';
const MEPROFILE_KEY = '@csc/me_profile'; // name, bio, photos

export async function getMyInterests(): Promise<string[]> {
  return getJSON<string[]>(MEINTERESTS_KEY, []);
}
export async function setMyInterests(v: string[]): Promise<void> {
  await AsyncStorage.setItem(MEINTERESTS_KEY, JSON.stringify(v));
}
export async function getMyIntentions(): Promise<import('./types').LifeIntentions> {
  return getJSON(MEINTENTIONS_KEY, {});
}
export async function setMyIntentions(v: import('./types').LifeIntentions): Promise<void> {
  await AsyncStorage.setItem(MEINTENTIONS_KEY, JSON.stringify(v));
}
export interface MyProfileFields { name?: string; bio?: string; photos?: string[]; }
export async function getMyProfile(): Promise<MyProfileFields> {
  return getJSON<MyProfileFields>(MEPROFILE_KEY, {});
}
export async function setMyProfile(v: MyProfileFields): Promise<void> {
  const cur = await getMyProfile();
  await AsyncStorage.setItem(MEPROFILE_KEY, JSON.stringify({ ...cur, ...v }));
}

const MEGENDER_KEY = '@csc/me_gender';
const MESEEKING_KEY = '@csc/me_seeking';
export async function getMyGender(): Promise<import('./types').Gender | undefined> {
  return getJSON<import('./types').Gender | undefined>(MEGENDER_KEY, undefined);
}
export async function setMyGender(g: import('./types').Gender): Promise<void> {
  await AsyncStorage.setItem(MEGENDER_KEY, JSON.stringify(g));
}
export async function getMySeeking(): Promise<import('./types').SeekingPref> {
  return getJSON<import('./types').SeekingPref>(MESEEKING_KEY, 'everyone');
}
export async function setMySeeking(s: import('./types').SeekingPref): Promise<void> {
  await AsyncStorage.setItem(MESEEKING_KEY, JSON.stringify(s));
}

const MEMARITAL_KEY = '@csc/me_marital';
export async function getMyMaritalStatus(): Promise<import('./types').MaritalStatus | undefined> {
  return getJSON<import('./types').MaritalStatus | undefined>(MEMARITAL_KEY, undefined);
}
export async function setMyMaritalStatus(s: import('./types').MaritalStatus): Promise<void> {
  await AsyncStorage.setItem(MEMARITAL_KEY, JSON.stringify(s));
}

async function buildMe(): Promise<Me> {
  return {
    psych: await getMyPsych(), birth: await getMyBirth(), age: await getMyAge(),
    interests: await getMyInterests(), gender: await getMyGender(), seeking: await getMySeeking(),
  };
}

/**
 * Build the ranked deck via the matching engine. Astro fuses lazily per-card in
 * the UI, so the deck appears instantly with the psychology ranking; pass
 * `withAstro` for small pools (e.g. the report) to fuse eagerly.
 */
export async function getDeck(withAstro = false): Promise<MatchResult[]> {
  const me = await buildMe();
  const passed = await getJSON<string[]>(PASSED_KEY, []);
  const liked = await getJSON<string[]>(LIKED_KEY, []);
  const reported = await getJSON<string[]>(REPORTED_KEY, []);
  const seen = new Set([...passed, ...liked, ...reported]);
  const pool = SEED_PROFILES.filter((p) => !seen.has(p.id));
  return rankCandidates(me, pool, { withAstro });
}

/** Profiles the user has liked → the "Matches" list. */
export async function getLikedProfiles(): Promise<Profile[]> {
  const liked = await getJSON<string[]>(LIKED_KEY, []);
  return SEED_PROFILES.filter((p) => liked.includes(p.id));
}

/** Used by the report screen for a single pair (eager astro fusion). */
export async function getMatchFor(profileId: string): Promise<MatchResult | null> {
  const me = await buildMe();
  const profile = SEED_PROFILES.find((p) => p.id === profileId);
  if (!profile) return null;
  const [m] = await rankCandidates(me, [profile], { withAstro: true });
  return m ?? null;
}

export async function passProfile(id: string): Promise<void> {
  const passed = await getJSON<string[]>(PASSED_KEY, []);
  if (!passed.includes(id)) await AsyncStorage.setItem(PASSED_KEY, JSON.stringify([...passed, id]));
}

export async function likeProfile(id: string): Promise<void> {
  const liked = await getJSON<string[]>(LIKED_KEY, []);
  if (!liked.includes(id)) await AsyncStorage.setItem(LIKED_KEY, JSON.stringify([...liked, id]));
}

/** Report a user → they're filtered out of future decks (local offboard). */
export async function reportProfile(id: string, reason: string): Promise<void> {
  const reported = await getJSON<{ id: string; reason: string; ts: number }[]>(REPORTED_KEY + '_log', []);
  await AsyncStorage.setItem(REPORTED_KEY + '_log', JSON.stringify([...reported, { id, reason, ts: Date.now() }]));
  const ids = await getJSON<string[]>(REPORTED_KEY, []);
  if (!ids.includes(id)) await AsyncStorage.setItem(REPORTED_KEY, JSON.stringify([...ids, id]));
}

/** Reset the deck (handy for demoing). */
export async function resetDeck(): Promise<void> {
  await AsyncStorage.multiRemove([PASSED_KEY, LIKED_KEY, REPORTED_KEY]);
}

/* ----- data rights (DPDP 2023 / GDPR / CCPA) ----- */

/** All AsyncStorage keys this app owns — single source for export/delete. */
const ALL_KEYS = [
  MEPSYCH_KEY, MEBIRTH_KEY, MEAGE_KEY, MEINTERESTS_KEY, MEINTENTIONS_KEY, MEPROFILE_KEY,
  MEGENDER_KEY, MESEEKING_KEY, MEMARITAL_KEY,
  PASSED_KEY, LIKED_KEY, REPORTED_KEY, REPORTED_KEY + '_log', MSGS_KEY,
];

/**
 * Data portability — return everything we hold about the user as one JSON object
 * (the right to access/export under DPDP 2023 / GDPR). Keys are de-prefixed for
 * readability. Caller can share/save the string.
 */
export async function exportMyData(): Promise<string> {
  const entries = await AsyncStorage.multiGet(ALL_KEYS);
  const data: Record<string, unknown> = {};
  for (const [key, value] of entries) {
    if (value == null) continue;
    const label = key.replace(/^@csc\//, '');
    try { data[label] = JSON.parse(value); } catch { data[label] = value; }
  }
  return JSON.stringify(
    { app: 'Celestial Soul Connection', exportedAt: new Date().toISOString(), data },
    null, 2,
  );
}

/**
 * Right to erasure — permanently remove all of the user's local data. (When the
 * backend lands, this also calls the server delete endpoint; today it's local.)
 */
export async function deleteMyAccount(): Promise<void> {
  await AsyncStorage.multiRemove(ALL_KEYS);
}

/* ----- contact unlock (mutual match → nominal fee → logged consent) ----- */
const UNLOCK_KEY = '@csc/contact_unlocks';   // matchId[] that are unlocked
const UNLOCK_LOG_KEY = '@csc/contact_unlock_log';
export const CONTACT_UNLOCK_FEE = 49; // ₹ nominal, charged to the unlocking party

export async function isContactUnlocked(matchId: string): Promise<boolean> {
  const ids = await getJSON<string[]>(UNLOCK_KEY, []);
  return ids.includes(matchId);
}

/**
 * Unlock contact for a mutual match. Records an append-only consent/payment log
 * entry (who paid, the fee, timestamp) — the audit trail required by the product
 * rules. Real payment integration slots in here later; today it logs intent.
 */
export async function unlockContact(matchId: string): Promise<void> {
  const log = await getJSON<{ matchId: string; fee: number; payer: 'me'; ts: number }[]>(UNLOCK_LOG_KEY, []);
  await AsyncStorage.setItem(UNLOCK_LOG_KEY, JSON.stringify([...log, { matchId, fee: CONTACT_UNLOCK_FEE, payer: 'me', ts: Date.now() }]));
  const ids = await getJSON<string[]>(UNLOCK_KEY, []);
  if (!ids.includes(matchId)) await AsyncStorage.setItem(UNLOCK_KEY, JSON.stringify([...ids, matchId]));
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
