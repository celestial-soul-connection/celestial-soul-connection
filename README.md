# Celestial Soul Connection

An intentional-relationship mobile app for meaningful, lasting connections — a
"soul alignment" experience (not explicitly marriage-branded) for serious singles,
including divorced / second-chance users. Matching is grounded in **psychology**;
the celestial / karmic layer is the soul of the *experience*, not the algorithm.

> More secure than typical dating apps. Privacy-first by construction. Built to
> discourage time-pass and reward genuine intent.

## What's here

```
apps/
  mobile/   Expo + React Native (TypeScript) — the app. Mobile only.
  api/      FastAPI (Python) — consent ledger, matching, chat, reporting, data-rights.
docs/
  research/compatibility-psychology.md              Research-backed matching model (cited).
  compliance/privacy-compliance-india-global.md     DPDP 2023 + GDPR/CCPA reference (cited).
.claude/skills/
  celestial-design-system/   ONE-theme design system (3 palettes, tokens, primitives).
  privacy-compliance/        Privacy-by-design guardrails (per-feature checklist).
  ui-ux-pro-max/             UI/UX quality & review checklist.
```

## Highlights

- **One design system, three palettes.** Default **Warm Dusk Romance** (couple-warm),
  plus **Cosmic Twilight** (dark) and **Sunrise Teal** (fresh). Users switch in Settings;
  the whole app restyles with zero per-screen code. New features can never invent a new theme.
- **Explainable matching.** One meaningful match/day (free: 5 over 5 days). The score is a
  weighted blend of values/goals, attachment, conflict style, self-expansion, and intent —
  and the app shows *why* you aligned. Astrology is cosmetic framing only.
- **Privacy-first.** Granular, withdrawable consent; append-only consent ledger + access log;
  field-level encryption of birth/chat/KYC; 18+ gate; export & delete; no number-sharing in chat.
- **Safety.** Report + audited offboarding for defaulters. Contact details unlock only on a
  mutual match, for a nominal fee, with logged consent.
- **Reuses your astrology engine.** Birth charts & synastry come from the existing
  astral-knowledge API (`apps/api/app/services/astrology_client.py`) — not reimplemented.

## Quick start

**Backend**
```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill secrets
uvicorn app.main:app --reload
```

**Mobile**
```bash
cd apps/mobile
npm install
# add brand fonts: see assets/fonts/README.md
npx expo start
```

See [CLAUDE.md](CLAUDE.md) for architecture, the mandatory skills, and product rules.
