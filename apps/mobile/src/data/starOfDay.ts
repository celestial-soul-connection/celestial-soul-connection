/**
 * starOfDay — the daily celestial moment for the Today home. Self-contained (no
 * API): derives the user's sun sign from their birth date, then picks a calm,
 * on-brand reading deterministically from the day + sign, so it's stable within
 * a day and rotates daily. Astrology here is delight, never a decision (vision §4).
 *
 * This is intentionally cosmetic/reflective — it is NOT a compatibility signal.
 */

export interface StarReading {
  sign: string;
  signGlyph: string;
  title: string;     // short celestial headline
  body: string;      // a reflective line
  intention: string; // a gentle prompt for the day
}

const SIGNS: { name: string; glyph: string; from: [number, number]; to: [number, number] }[] = [
  { name: 'Capricorn', glyph: '♑', from: [12, 22], to: [1, 19] },
  { name: 'Aquarius', glyph: '♒', from: [1, 20], to: [2, 18] },
  { name: 'Pisces', glyph: '♓', from: [2, 19], to: [3, 20] },
  { name: 'Aries', glyph: '♈', from: [3, 21], to: [4, 19] },
  { name: 'Taurus', glyph: '♉', from: [4, 20], to: [5, 20] },
  { name: 'Gemini', glyph: '♊', from: [5, 21], to: [6, 20] },
  { name: 'Cancer', glyph: '♋', from: [6, 21], to: [7, 22] },
  { name: 'Leo', glyph: '♌', from: [7, 23], to: [8, 22] },
  { name: 'Virgo', glyph: '♍', from: [8, 23], to: [9, 22] },
  { name: 'Libra', glyph: '♎', from: [9, 23], to: [10, 22] },
  { name: 'Scorpio', glyph: '♏', from: [10, 23], to: [11, 21] },
  { name: 'Sagittarius', glyph: '♐', from: [11, 22], to: [12, 21] },
];

export function sunSign(isoDate: string): { name: string; glyph: string } {
  const [, m, d] = isoDate.split('-').map(Number);
  if (!m || !d) return { name: 'the cosmos', glyph: '✦' };
  for (const s of SIGNS) {
    const [fm, fd] = s.from;
    const [tm, td] = s.to;
    if (fm === tm) { if (m === fm && d >= fd && d <= td) return { name: s.name, glyph: s.glyph }; }
    else if ((m === fm && d >= fd) || (m === tm && d <= td)) return { name: s.name, glyph: s.glyph };
  }
  return { name: 'Capricorn', glyph: '♑' }; // wrap-around (Dec/Jan)
}

/* A small bank of calm, soul-alignment-flavoured readings. Kept generic & kind —
 * never deterministic claims about events, only gentle reflection. */
const READINGS: { title: string; body: string; intention: string }[] = [
  { title: 'A door opens softly', body: 'The sky favours quiet courage today. The connection you’re seeking rewards honesty over performance.', intention: 'Say one true thing you’d normally hold back.' },
  { title: 'Stillness before alignment', body: 'Not every day is for reaching. Some are for becoming clear about what you truly want.', intention: 'Name one quality that matters more than it used to.' },
  { title: 'Two lights, drawing near', body: 'The patient heart is being met halfway. Trust the slow, real kind of closeness.', intention: 'Reach out to a connection without expectation.' },
  { title: 'Your warmth is the signal', body: 'What you offer freely returns. Kindness today is not weakness — it’s gravity.', intention: 'Offer a genuine compliment, free of agenda.' },
  { title: 'Roots before blossoms', body: 'Lasting bonds are built on the unglamorous days. Tend what’s already growing.', intention: 'Ask a question you actually want the answer to.' },
  { title: 'Clarity arrives quietly', body: 'A small truth about love is settling into place for you. Let it.', intention: 'Notice what you no longer want to repeat.' },
  { title: 'The brave thing is gentleness', body: 'Strength today looks like softness held steady. You don’t have to armour up to be safe.', intention: 'Let yourself be a little more seen.' },
];

/** Deterministic per (day, sign) so it's stable within a day and rotates. */
export function starOfDay(isoBirth: string | undefined, todayIso: string): StarReading {
  const sign = isoBirth ? sunSign(isoBirth) : { name: 'the cosmos', glyph: '✦' };
  // Day index from the date string (no Date.now — keep deterministic & test-safe).
  const [y, m, d] = todayIso.split('-').map(Number);
  const dayNum = (y || 0) * 372 + (m || 0) * 31 + (d || 0);
  const signSeed = sign.name.charCodeAt(0) + sign.name.length;
  const pick = READINGS[(dayNum + signSeed) % READINGS.length];
  return { sign: sign.name, signGlyph: sign.glyph, ...pick };
}
