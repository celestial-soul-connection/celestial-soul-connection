/**
 * questionnaire.ts — the onboarding items that build a user's PsychProfile.
 * Condensed from docs/research/compatibility-psychology.md. Each item is a 1..5
 * Likert; `maps` says which profile field(s) it feeds and whether to reverse.
 * `compute()` turns answers into a normalized 0..1 PsychProfile for scoring.
 */
import { PsychProfile } from './types';

export interface Question {
  id: string;
  text: string;
  dimension: string;                 // shown as context
  maps: { field: keyof PsychProfile; reverse?: boolean }[];
}

export const QUESTIONS: Question[] = [
  { id: 'a1', text: 'I find it easy to depend on a partner and have them depend on me.', dimension: 'Attachment', maps: [{ field: 'attachmentSecure' }] },
  { id: 'a2', text: 'I often worry that a partner doesn’t really love me or will leave.', dimension: 'Attachment', maps: [{ field: 'attachmentAnxious' }] },
  { id: 'a3', text: 'I prefer not to show a partner how I feel deep down.', dimension: 'Attachment', maps: [{ field: 'attachmentAvoidant' }] },
  { id: 'o1', text: 'I love exploring new ideas, places, and experiences.', dimension: 'Openness', maps: [{ field: 'openness' }, { field: 'adventurousness' }] },
  { id: 'c1', text: 'I’m organised, reliable, and follow through on what I commit to.', dimension: 'Conscientiousness', maps: [{ field: 'conscientiousness' }] },
  { id: 'e1', text: 'I feel energised by being around people and social settings.', dimension: 'Extraversion', maps: [{ field: 'extraversion' }] },
  { id: 'g1', text: 'I’m warm, empathetic, and try to understand others’ feelings.', dimension: 'Agreeableness', maps: [{ field: 'agreeableness' }] },
  { id: 'n1', text: 'I often feel anxious, stressed, or emotionally up and down.', dimension: 'Emotional stability', maps: [{ field: 'neuroticism' }] },
  { id: 'v1', text: 'Having children is important to me.', dimension: 'Life goals', maps: [{ field: 'wantsKids' }] },
  { id: 'v2', text: 'Faith or spirituality plays a meaningful role in my life.', dimension: 'Values', maps: [{ field: 'religiousImportance' }] },
  { id: 'v3', text: 'Building a close, committed family life matters deeply to me.', dimension: 'Values', maps: [{ field: 'familyOrientation' }] },
  { id: 'v4', text: 'I’m ambitious and driven about my goals and growth.', dimension: 'Values', maps: [{ field: 'ambition' }] },
  { id: 'k1', text: 'After a disagreement, I try to repair things and reconnect.', dimension: 'Conflict style', maps: [{ field: 'conflictRepair' }] },
  { id: 'i1', text: 'I’m here for a serious, meaningful relationship — not time-pass.', dimension: 'Intent', maps: [{ field: 'intent' }] },
];

export const SCALE = ['Strongly disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly agree'];

/** Convert 1..5 answers into a normalized PsychProfile (0..1 per field). */
export function compute(answers: Record<string, number>): PsychProfile {
  const p: any = {};
  for (const q of QUESTIONS) {
    const raw = answers[q.id] ?? 3;        // default neutral
    const norm = (raw - 1) / 4;            // 0..1
    for (const m of q.maps) {
      const val = m.reverse ? 1 - norm : norm;
      // if multiple questions map to a field, average them
      p[m.field] = p[m.field] == null ? val : (p[m.field] + val) / 2;
    }
  }
  // ensure every field has a value (defaults for any unmapped)
  const fields: (keyof PsychProfile)[] = [
    'attachmentSecure', 'attachmentAnxious', 'attachmentAvoidant', 'openness', 'conscientiousness',
    'extraversion', 'agreeableness', 'neuroticism', 'wantsKids', 'religiousImportance', 'ambition',
    'familyOrientation', 'adventurousness', 'conflictRepair', 'intent',
  ];
  for (const f of fields) if (p[f] == null) p[f] = 0.5;
  return p as PsychProfile;
}
