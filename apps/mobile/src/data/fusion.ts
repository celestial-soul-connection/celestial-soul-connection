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

export function fuseScores(psych: Breakdown, astro: AstroResult | null): FusedResult {
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
  const w = FUSION_WEIGHTS;
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
