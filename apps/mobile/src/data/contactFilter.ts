/**
 * contactFilter — client-side mirror of the backend no-number-sharing rule
 * (apps/api/app/services/contact_filter.py). Redacts phone numbers, emails, and
 * social handles in chat; contact details exchange only via the paid match flow.
 */
const PHONE = /(\+?\d[\d\s\-().]{7,}\d)/g;
const EMAIL = /[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/g;
const HANDLE = /(?:insta|instagram|snap|snapchat|whatsapp|wa|telegram|tg)\s*[:@]?\s*\S+/gi;
const WORD_DIGITS = /\b(?:(?:zero|one|two|three|four|five|six|seven|eight|nine|oh|double|triple)\s*){6,}\b/gi;

const MASK = '•••• [shared only after a confirmed match] ••••';

export function scan(text: string): { text: string; redacted: boolean } {
  let out = text;
  let redacted = false;
  for (const re of [PHONE, EMAIL, HANDLE, WORD_DIGITS]) {
    if (re.test(out)) { out = out.replace(re, MASK); redacted = true; }
    re.lastIndex = 0;
  }
  return { text: out, redacted };
}
