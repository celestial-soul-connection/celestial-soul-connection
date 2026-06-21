/**
 * intent.ts — anti-time-pass signal. Blends declared intent (questionnaire) +
 * profile completeness + light behavior into a 0..1 score. Used as a ranking
 * NUDGE and a "Serious about connection" badge — never a ban (per the research
 * doc's ethical guardrails).
 */
import { PsychProfile, LifeIntentions } from './types';

export interface IntentInputs {
  psych: PsychProfile;                 // i1 declared intent lives in psych.intent
  hasPhoto: boolean;
  hasBio: boolean;
  hasBirth: boolean;
  interestCount: number;
  intentions: LifeIntentions;
  replyRate?: number;                  // 0..1 (optional behavior)
  reportsAgainst?: number;
}

export function computeIntentSignal(i: IntentInputs): number {
  // Declared intent (strongest input).
  const declared = i.psych.intent; // 0..1

  // Profile completeness — serious users complete their profile.
  const intentionsFilled = Object.values(i.intentions ?? {}).filter((v) => typeof v === 'string').length;
  const completeness =
    (i.hasPhoto ? 0.3 : 0) +
    (i.hasBio ? 0.15 : 0) +
    (i.hasBirth ? 0.2 : 0) +
    Math.min(0.2, i.interestCount * 0.04) +
    Math.min(0.15, intentionsFilled * 0.03);

  // Behavior (optional): good reply rate up, reports down.
  const behavior = (i.replyRate ?? 0.6) * 0.5 - Math.min(0.5, (i.reportsAgainst ?? 0) * 0.25) + 0.5;

  const raw = 0.5 * declared + 0.35 * Math.min(1, completeness) + 0.15 * Math.max(0, Math.min(1, behavior));
  return Math.max(0, Math.min(1, raw));
}

/** Threshold for the visible "Serious about connection" badge. */
export const SERIOUS_THRESHOLD = 0.72;
export function isSerious(signal: number): boolean {
  return signal >= SERIOUS_THRESHOLD;
}
