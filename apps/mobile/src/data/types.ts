/**
 * Shared data types for the app. These mirror what the real FastAPI backend
 * will return, so swapping the mock store for real API calls later needs no
 * screen changes.
 */

/** The psychological dimensions we measure (see docs/research/compatibility-psychology.md). */
export interface PsychProfile {
  // Attachment (0..1 each; from ECR-style items)
  attachmentSecure: number;
  attachmentAnxious: number;
  attachmentAvoidant: number;
  // Big Five (0..1 each)
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  // Values & life goals (0..1; higher = stronger endorsement)
  wantsKids: number;          // 0 no … 1 yes
  religiousImportance: number;
  ambition: number;
  familyOrientation: number;
  adventurousness: number;    // feeds self-expansion
  // Conflict & communication quality (0..1; higher = healthier)
  conflictRepair: number;
  // Serious intent (0..1; higher = more serious)
  intent: number;
}

/** Birth details — mirrors Karmian BirthDataRequest (date,time,lat,long,timezone). */
export interface BirthData {
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  latitude: number;
  longitude: number;
  timezone: string;    // e.g. "Asia/Kolkata"
  place: string;       // human-readable, for display
}

/** Selectable interest tags — shared ones add a small weight to compatibility. */
export const INTEREST_TAGS = [
  'Travel', 'Fitness', 'Spirituality', 'Food & Cooking', 'Arts & Music',
  'Family time', 'Career & ambition', 'Reading', 'Nature & outdoors',
  'Movies & series', 'Fitness & sport', 'Volunteering', 'Entrepreneurship', 'Pets',
] as const;
export type Interest = string;

/** Structured marriage-intent / life-logistics intentions (serious-intent clarity). */
export interface LifeIntentions {
  household?: 'shared' | 'i_lead' | 'partner_leads' | 'flexible';
  careers?: 'both_continue' | 'one_focuses_home' | 'flexible';
  kids?: 'yes' | 'maybe_later' | 'no' | 'open';
  kidsCare?: 'shared' | 'i_lead' | 'partner_leads' | 'support_help';
  finances?: 'joint' | 'separate' | 'split_shared' | 'flexible';
  acknowledgedSelfManage?: boolean; // "we've discussed & agree to manage these ourselves"
}

export type Gender = 'woman' | 'man' | 'nonbinary';
/** Who the user wants to be shown. */
export type SeekingPref = 'women' | 'men' | 'everyone';

/** Marital status — first-class for a second-chance / serious-intent audience. */
export type MaritalStatus = 'unmarried' | 'divorced' | 'awaiting_divorce' | 'widowed' | 'separated';
export const MARITAL_OPTIONS: { v: MaritalStatus; label: string }[] = [
  { v: 'unmarried', label: 'Unmarried' },
  { v: 'divorced', label: 'Divorced' },
  { v: 'awaiting_divorce', label: 'Awaiting divorce' },
  { v: 'separated', label: 'Separated' },
  { v: 'widowed', label: 'Widowed' },
];
export function maritalLabel(s?: MaritalStatus): string {
  return MARITAL_OPTIONS.find((o) => o.v === s)?.label ?? '';
}

/**
 * How the user wants compatibility computed. This is a first-class CHOICE — it
 * drives the fusion weights AND lets us map people who chose the same lens.
 *  - psychological: 100% psychology model
 *  - astrological:  100% astrology (Karmian)
 *  - balanced:      the average of both (default)
 */
export type CompatibilityMode = 'psychological' | 'astrological' | 'balanced';
export const COMPAT_MODE_OPTIONS: { v: CompatibilityMode; label: string; help: string; icon: string }[] = [
  { v: 'psychological', label: 'Psychological', help: 'Match purely on attachment, values & life goals.', icon: '✶' },
  { v: 'balanced', label: 'Balanced', help: 'An even blend of psychology and the stars.', icon: '⚖' },
  { v: 'astrological', label: 'Astrological', help: 'Match purely on celestial compatibility.', icon: '☾' },
];
export const DEFAULT_COMPAT_MODE: CompatibilityMode = 'balanced';
/** Resolve a mode to fusion weights (psych + astro sum to 1). */
export function weightsForMode(mode: CompatibilityMode): { psych: number; astro: number } {
  switch (mode) {
    case 'psychological': return { psych: 1, astro: 0 };
    case 'astrological': return { psych: 0, astro: 1 };
    default: return { psych: 0.5, astro: 0.5 };
  }
}
export function compatModeLabel(m?: CompatibilityMode): string {
  return COMPAT_MODE_OPTIONS.find((o) => o.v === m)?.label ?? '';
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender?: Gender;
  seeking?: SeekingPref;   // who THEY want to see (used for mutual filtering)
  maritalStatus?: MaritalStatus;
  city: string;
  photo: string;
  photos?: string[];        // additional photos (profile gallery)
  bio?: string;
  blurb: string;          // short tagline incl. a celestial touch (cosmetic)
  interests?: Interest[];
  intentions?: LifeIntentions;
  psych: PsychProfile;
  birth?: BirthData;
  dealbreakers?: string[];
  verified?: { phone: boolean; photo: boolean };
}

/** Astrology compatibility from the Karmian /compatibility/full endpoint. */
export interface AstroResult {
  compositePct: number;     // 0..100 overall (API's composite_pct)
  level: string;            // e.g. "Acceptable with reservations"
  ashtakootPoints: number;  // 0..36 Guna Milan total
  ashtakootMax: number;     // 36
  areas: { label: string; pct: number }[]; // per-area name + 0..100
  doshas: string[];         // active doshas, human-readable
  strengths: string[];
  concerns: string[];
  recommendation: string;   // narrative verdict
  estimated?: boolean;      // true if from local fallback (API asleep)
}

/** Psychology dimension breakdown (also produced by scoring.ts). */
export interface Breakdown {
  score: number;            // 0..100
  dims: { key: string; label: string; pct: number; tone: 'primary' | 'success' | 'accent' | 'neutral' }[];
}

/** One explainable, fused score combining psychology + astrology. */
export interface FusedResult {
  score: number;            // 0..100 final
  psych: Breakdown;
  astro: AstroResult | null;
  astroAvailable: boolean;
  agreement: 'aligned' | 'mixed' | 'divergent';
  weights: { psych: number; astro: number };
}

/** A computed, explainable match. */
export interface MatchResult {
  profile: Profile;
  score: number;                 // 0..100 (fused if astro available, else psych)
  reasons: { dim: string; pct: number; tone: 'primary' | 'success' | 'accent' | 'neutral' }[];
  probe: string;
  fused?: FusedResult;
}

export interface Message {
  id: string;
  matchId: string;
  fromMe: boolean;
  text: string;
  redacted: boolean;     // contact info was filtered
  ts: number;
}

export interface Session {
  phone: string;
  userId: string;
  onboarded: boolean;    // finished the questionnaire
  psych?: PsychProfile;
  createdAt: number;
}
