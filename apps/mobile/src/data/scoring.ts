/**
 * scoring.ts — the REAL, explainable compatibility algorithm.
 *
 * Grounded in docs/research/compatibility-psychology.md. NOT astrology. Produces
 * a 0..100 score AND a per-dimension breakdown so the UI can say WHY two people
 * align. This mirrors the backend services/matching.py weights, so the on-device
 * result matches what the server will eventually return.
 *
 * Dimension bases:
 *  - values/goals  : similarity (shared life direction is the strongest real signal)
 *  - intent        : quality   (both serious)
 *  - attachment    : quality   (combined security beats "matched insecurity")
 *  - conflict/comm : quality   (healthy repair on both sides)
 *  - self-expansion: complementarity-friendly (shared novelty/adventure)
 *  - emotional     : quality   (low neuroticism + high agreeableness ≈ responsiveness)
 */
import { PsychProfile } from './types';

const WEIGHTS = {
  valuesGoals: 0.28,
  intent: 0.18,
  attachment: 0.16,
  conflict: 0.14,
  selfExpansion: 0.12,
  emotional: 0.12,
} as const;

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** similarity score from two 0..1 values: 1 when identical, 0 when far apart */
const sim = (a: number, b: number) => 1 - Math.abs(a - b);

function valuesGoals(a: PsychProfile, b: PsychProfile): number {
  // weighted similarity across the hard life-direction values
  const parts = [
    sim(a.wantsKids, b.wantsKids) * 1.3,
    sim(a.religiousImportance, b.religiousImportance) * 1.1,
    sim(a.familyOrientation, b.familyOrientation),
    sim(a.ambition, b.ambition) * 0.9,
  ];
  const wsum = 1.3 + 1.1 + 1 + 0.9;
  return clamp01(parts.reduce((s, x) => s + x, 0) / wsum);
}

function attachment(a: PsychProfile, b: PsychProfile): number {
  // reward combined security; penalise paired anxiety+avoidance (the classic trap)
  const security = (a.attachmentSecure + b.attachmentSecure) / 2;
  const trap = Math.min(a.attachmentAnxious, b.attachmentAvoidant) +
               Math.min(b.attachmentAnxious, a.attachmentAvoidant);
  return clamp01(security - 0.35 * (trap / 2));
}

function conflict(a: PsychProfile, b: PsychProfile): number {
  return clamp01((a.conflictRepair + b.conflictRepair) / 2);
}

function selfExpansion(a: PsychProfile, b: PsychProfile): number {
  // shared appetite for novelty + combined openness; a little difference is ok
  const shared = (a.adventurousness + b.adventurousness) / 2;
  const openness = (a.openness + b.openness) / 2;
  return clamp01(0.6 * shared + 0.4 * openness);
}

function emotional(a: PsychProfile, b: PsychProfile): number {
  // responsiveness proxy: high agreeableness, lower neuroticism on both sides
  const warmth = (a.agreeableness + b.agreeableness) / 2;
  const calm = 1 - (a.neuroticism + b.neuroticism) / 2;
  return clamp01(0.55 * warmth + 0.45 * calm);
}

function intentScore(a: PsychProfile, b: PsychProfile): number {
  // both must be serious; the lower of the two anchors it (a time-passer drags it down)
  return clamp01(Math.min(a.intent, b.intent) * 0.7 + ((a.intent + b.intent) / 2) * 0.3);
}

export interface Breakdown {
  score: number;
  dims: { key: string; label: string; pct: number; tone: 'primary' | 'success' | 'accent' | 'neutral' }[];
}

export function scorePair(me: PsychProfile, them: PsychProfile): Breakdown {
  const d = {
    valuesGoals: valuesGoals(me, them),
    intent: intentScore(me, them),
    attachment: attachment(me, them),
    conflict: conflict(me, them),
    selfExpansion: selfExpansion(me, them),
    emotional: emotional(me, them),
  };
  const total =
    d.valuesGoals * WEIGHTS.valuesGoals +
    d.intent * WEIGHTS.intent +
    d.attachment * WEIGHTS.attachment +
    d.conflict * WEIGHTS.conflict +
    d.selfExpansion * WEIGHTS.selfExpansion +
    d.emotional * WEIGHTS.emotional;

  const pct = (x: number) => Math.round(x * 100);
  // Show the strongest dimensions first — that's the "why you align" story.
  const dims = [
    { key: 'valuesGoals', label: 'Values & life goals', pct: pct(d.valuesGoals), tone: 'primary' as const },
    { key: 'attachment', label: 'Secure attachment fit', pct: pct(d.attachment), tone: 'success' as const },
    { key: 'conflict', label: 'Conflict & communication', pct: pct(d.conflict), tone: 'accent' as const },
    { key: 'emotional', label: 'Empathy & responsiveness', pct: pct(d.emotional), tone: 'neutral' as const },
    { key: 'selfExpansion', label: 'Shared novelty', pct: pct(d.selfExpansion), tone: 'neutral' as const },
    { key: 'intent', label: 'Serious-intent alignment', pct: pct(d.intent), tone: 'primary' as const },
  ].sort((x, y) => y.pct - x.pct);

  return { score: Math.round(total * 100), dims };
}
