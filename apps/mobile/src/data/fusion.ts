/**
 * fusion.ts — blend the psychology score and the astrology score into ONE
 * explainable number, honestly. Equal weight by default (founder decision),
 * tunable in config. We always keep BOTH breakdowns so the report can show the
 * data and say where the two lenses agree or differ (anti-overclaiming).
 */
import { Breakdown, AstroResult, FusedResult } from './types';
import { FUSION_WEIGHTS } from '../config';

/** Collapse an AstroResult to a single 0..100 number. */
export function astroScoreOf(astro: AstroResult): number {
  // The API's composite_pct already blends ashtakoota + areas + doshas, so trust
  // it, but average with the ashtakoota ratio to stay robust if composite is 0.
  const ak = astro.ashtakootMax ? (astro.ashtakootPoints / astro.ashtakootMax) * 100 : astro.compositePct;
  return Math.round(0.7 * astro.compositePct + 0.3 * ak);
}

/**
 * Fuse psychology + astrology. `weights` defaults to the config blend, but the
 * caller passes the user's CHOSEN compatibility mode weights (see
 * weightsForMode) so the score reflects what they opted into. When astro is
 * unavailable we always fall back to psychology so the deck never breaks — even
 * in 'astrological' mode (flagged via astroAvailable so copy stays honest).
 */
export function fuseScores(
  psych: Breakdown,
  astro: AstroResult | null,
  weights: { psych: number; astro: number } = FUSION_WEIGHTS,
): FusedResult {
  if (!astro) {
    return {
      score: psych.score,
      psych,
      astro: null,
      astroAvailable: false,
      agreement: 'aligned',
      weights: { psych: 1, astro: 0 },
    };
  }

  const aScore = astroScoreOf(astro);
  // Normalize in case a caller passes weights that don't sum to 1.
  const sum = weights.psych + weights.astro || 1;
  const w = { psych: weights.psych / sum, astro: weights.astro / sum };
  const score = Math.round(w.psych * psych.score + w.astro * aScore);

  const gap = Math.abs(psych.score - aScore);
  const agreement: FusedResult['agreement'] = gap < 12 ? 'aligned' : gap < 28 ? 'mixed' : 'divergent';

  return {
    score,
    psych,
    astro,
    astroAvailable: !astro.estimated,
    agreement,
    weights: { psych: w.psych, astro: w.astro },
  };
}

/** One-line honest summary for the report. */
export function agreementCopy(f: FusedResult): string {
  if (!f.astro) return 'Based on psychology & values (astrology unavailable right now).';
  const a = astroScoreOf(f.astro);
  switch (f.agreement) {
    case 'aligned':
      return `The stars and psychology agree — both point to a strong fit (${f.psych.score}% psychological, ${a}% astrological).`;
    case 'mixed':
      return `A nuanced match: ${f.psych.score}% psychological and ${a}% astrological — strong in places, worth exploring in others.`;
    default:
      return `Two lenses differ here: ${f.psych.score}% psychological vs ${a}% astrological. Read both below and trust your own sense.`;
  }
}
