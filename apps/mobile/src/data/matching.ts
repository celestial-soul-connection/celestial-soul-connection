/**
 * matching.ts — find & rank the best candidate profiles for the current user.
 * BUILT IN THIS REPO (astrology is consumed, not computed here).
 *
 * Pipeline: hard filters (drop incompatible) → weighted-similarity psychology
 * score → fuse with astrology (lazy/async, never blocks) → sort. Rule-based now
 * (no training data yet = cold start); isolated so a learned ranker can replace
 * the weighting later — see LEARNED-RANKER SEAM.
 */
import { Profile, PsychProfile, BirthData, MatchResult, FusedResult, CompatibilityMode, weightsForMode } from './types';
import { scorePair } from './scoring';
import { fuseScores } from './fusion';
import { getAstroCompatibility } from './astrologyApi';
import { PROBES } from './seedProfiles';

export interface Me {
  psych: PsychProfile;
  birth?: BirthData;
  age?: number;
  wantsKids?: number;
  interests?: string[];
  gender?: import('./types').Gender;
  seeking?: import('./types').SeekingPref;
  /** The user's chosen compatibility lens — drives the fusion weights. */
  compatMode?: CompatibilityMode;
}

/** True if I want to see them AND they want to see me (mutual orientation). */
function orientationMatch(me: Me, c: Profile): boolean {
  const iWantThem =
    !me.seeking || me.seeking === 'everyone' ||
    (me.seeking === 'women' && c.gender === 'woman') ||
    (me.seeking === 'men' && c.gender === 'man');
  const theyWantMe =
    !c.seeking || c.seeking === 'everyone' || !me.gender ||
    (c.seeking === 'women' && me.gender === 'woman') ||
    (c.seeking === 'men' && me.gender === 'man');
  return iWantThem && theyWantMe;
}

/** Shared-interest bonus (0..1) → small weight on the score so it complements. */
function interestOverlap(me: Me, c: Profile): number {
  const a = new Set((me.interests ?? []).map((s) => s.toLowerCase()));
  const b = (c.interests ?? []).map((s) => s.toLowerCase());
  if (!a.size || !b.length) return 0;
  const shared = b.filter((x) => a.has(x)).length;
  return Math.min(1, shared / 4); // 4+ shared interests = full bonus
}
const INTEREST_WEIGHT = 0.06;

/** Hard dealbreaker filters — drop candidates that can't work. */
function passesHardFilters(me: Me, c: Profile): boolean {
  // Orientation: must be a mutual gender/seeking match.
  if (!orientationMatch(me, c)) return false;
  // Kids: if both expressed a strong but opposite stance, drop.
  const meKids = me.psych.wantsKids;
  const themKids = c.psych.wantsKids;
  if (Math.abs(meKids - themKids) > 0.6) return false;
  // Age band (only if we know me.age): within ~12 years for serious intent.
  if (me.age && Math.abs(me.age - c.age) > 12) return false;
  return true;
}

/**
 * LEARNED-RANKER SEAM
 * Today: psychology weighted similarity via scorePair(). Tomorrow: swap this
 * function body for a learned model scoring a feature vector. Inputs/outputs
 * (Me, Profile) → 0..100 stay stable so nothing downstream changes.
 */
function psychologyScore(me: Me, c: Profile) {
  return scorePair(me.psych, c.psych);
}

/**
 * Rank candidates. Astro is fused lazily: if `withAstro` is false we return the
 * psychology ranking immediately (instant deck); call `hydrateAstro` per card
 * to fetch + fuse astrology without blocking the list.
 */
export async function rankCandidates(me: Me, pool: Profile[], opts?: { withAstro?: boolean }): Promise<MatchResult[]> {
  const eligible = pool.filter((c) => passesHardFilters(me, c));

  const base: MatchResult[] = eligible.map((profile, i) => {
    const psych = psychologyScore(me, profile);
    // Small shared-interest bonus added on top of the psychology score.
    const overlap = interestOverlap(me, profile);
    const bonus = overlap * INTEREST_WEIGHT * 100;
    const psychAdj = { ...psych, score: Math.min(100, Math.round(psych.score + bonus)) };
    const reasons = psychAdj.dims.slice(0, 4).map((d) => ({ dim: d.label, pct: d.pct, tone: d.tone }));
    if (overlap > 0) {
      reasons.unshift({ dim: 'Shared interests', pct: Math.round(overlap * 100), tone: 'accent' });
    }
    return {
      profile,
      score: psychAdj.score,
      reasons: reasons.slice(0, 4),
      probe: PROBES[i % PROBES.length],
      fused: { score: psychAdj.score, psych: psychAdj, astro: null, astroAvailable: false, agreement: 'aligned', weights: { psych: 1, astro: 0 } },
    };
  });

  if (opts?.withAstro && me.birth) {
    // Fuse astrology for all (used for small pools / report). Parallel + tolerant.
    await Promise.all(
      base.map(async (m) => {
        const fused = await hydrateAstro(me.birth, m, me.compatMode);
        m.fused = fused;
        m.score = fused.score;
      }),
    );
  }

  return base.sort((a, b) => b.score - a.score);
}

/** Fetch astrology for one match and return the fused result (non-blocking use).
 *  `meBirth` is the current user's birth data; the psychology Breakdown is reused
 *  from the already-ranked match. `mode` is the user's chosen compatibility lens,
 *  which sets the psych/astro weights of the blend. */
export async function hydrateAstro(meBirth: BirthData | undefined, m: MatchResult, mode?: CompatibilityMode): Promise<FusedResult> {
  const astro = await getAstroCompatibility(meBirth, m.profile.birth);
  return fuseScores(m.fused!.psych, astro, mode ? weightsForMode(mode) : undefined);
}
