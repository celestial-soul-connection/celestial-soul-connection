"""
Chat safety: enforce NO phone-number / external-contact sharing in messages.
Contact exchange happens ONLY through the paid, consented contact-share flow when
both users are a mutual match (privacy-compliance skill §2).

`scan()` returns (redacted_text, was_redacted). We redact rather than block so the
conversation continues, and flag the attempt for the abuse/intent signals.
"""
import re

# Phone numbers (intl + Indian formats), and common evasions.
_PHONE = re.compile(r"(\+?\d[\d\s\-().]{7,}\d)")
# Emails and social handles / "find me on" patterns.
_EMAIL = re.compile(r"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")
_HANDLE = re.compile(r"(?:insta|instagram|snap|snapchat|whatsapp|wa|telegram|tg)\s*[:@]?\s*\S+", re.I)
# Spelled-out digits ("nine eight seven ...") — common evasion.
_WORD_DIGITS = re.compile(
    r"\b(?:(?:zero|one|two|three|four|five|six|seven|eight|nine|oh|double|triple)\s*){6,}\b", re.I
)

_PATTERNS = [_PHONE, _EMAIL, _HANDLE, _WORD_DIGITS]
_MASK = "•••• [contact details are unlocked only via a confirmed match] ••••"


def scan(text: str) -> tuple[str, bool]:
    redacted = text
    hit = False
    for pat in _PATTERNS:
        if pat.search(redacted):
            redacted = pat.sub(_MASK, redacted)
            hit = True
    return redacted, hit
