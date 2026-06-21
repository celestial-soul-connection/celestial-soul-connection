# CLAUDE.md — Celestial Soul Connection

A privacy-first, intentional-relationship mobile app ("soul alignment") for serious
connections, including divorced/second-chance users. Marketed as soul alignment, not
explicitly "marriage". Matching is grounded in **psychology**; astrology is a
**cosmetic celestial layer** on top.

## Architecture
- `apps/mobile/` — **Expo / React Native (TypeScript)** mobile app. Mobile only, no web.
- `apps/api/` — **FastAPI (Python)** backend. SQLite in dev → Postgres in prod.
- `docs/research/compatibility-psychology.md` — the research-backed matching model.
- `docs/compliance/privacy-compliance-india-global.md` — DPDP 2023 + GDPR/CCPA reference.

Stack rationale: reuses your existing React + Python skills/infra; FastAPI suits the
matching logic; Expo gives iOS+Android from one codebase.

## The three project skills (USE THEM — they are mandatory gates)
1. **celestial-design-system** — invoke BEFORE any UI work. Enforces ONE theme: every
   screen reads the same token contract (`apps/mobile/src/theme/`). A new feature must
   never spawn a new palette/font/one-off style. Three user-selectable palettes ship
   (default **Warm Dusk Romance**; also Cosmic Twilight dark, Sunrise Teal).
2. **privacy-compliance** — invoke BEFORE any data-touching work. Granular withdrawable
   consent, append-only consent ledger + access log, field-level encryption of sensitive
   data (birth/chat/KYC), 18+ gate, data export/delete, no phone-number sharing in chat.
3. **ui-ux-pro-max** — UI/UX quality/review checklist (a11y, touch, motion, contrast).
   Defers to celestial-design-system for colours/fonts.

## Core product rules (don't drift from these)
- **Free tier:** at most ONE meaningful match/day, capped at 5 over 5 days.
- **Explainable matches:** always show WHY (psychological dimensions), never a black box.
- **Chat:** no number/contact sharing — filtered & redacted. Contact unlocks ONLY on a
  mutual match, for a nominal fee charged to one party, with logged consent.
- **Reporting/offboarding:** any user can report; defaulters are deactivated with an
  audited reason (evidence pseudonymised, not hard-deleted).
- **Astrology:** consumed from the existing **astral-knowledge** API via
  `apps/api/app/services/astrology_client.py` (kundli + synastry). It is cosmetic and
  NEVER alters the compatibility score or overrides a deal-breaker.

## Run
- API: `cd apps/api && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt && uvicorn app.main:app --reload`
- Mobile: `cd apps/mobile && npm install && npx expo start` (add brand fonts first — see `assets/fonts/README.md`).

## Status
Foundation + design system + two research docs + backend skeleton are in place. Profiles,
real questionnaire scoring, payments, KYC, push, and migrations are still TODO.
