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

export interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  photo: string;
  blurb: string;          // short tagline incl. a celestial touch (cosmetic)
  psych: PsychProfile;
  dealbreakers?: string[];
}

/** A computed, explainable match. */
export interface MatchResult {
  profile: Profile;
  score: number;                 // 0..100
  reasons: { dim: string; pct: number; tone: 'primary' | 'success' | 'accent' | 'neutral' }[];
  probe: string;
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
