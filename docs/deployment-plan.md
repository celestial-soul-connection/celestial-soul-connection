# App Store Deployment Plan — Celestial Soul Connection

Status: planning. This maps the path from the current state (mobile app + a partial
FastAPI backend, with most app state still local AsyncStorage mocks) to a live
iOS App Store + Google Play release.

---

## 1. Backend: keep it in THIS repo, deploy it separately

**Yes, keep the backend in this monorepo** (`apps/api/`). One codebase, two *deploy
targets*:

- `apps/mobile/` → built with **EAS** and submitted to the stores.
- `apps/api/` → deployed to a **server/cloud** (it cannot live "inside" the app —
  the phone is untrusted; sensitive data, payments, matching, and the consent
  ledger must be server-authoritative).

Monorepo ≠ one deployment. The code stays together (shared types, one PR), but the
API runs on a host with its own URL the app calls.

**Recommended hosting (India residency for DPDP → `ap-south`):**
- API: Render / Railway / Fly.io (simple) or AWS ECS/Fargate (scale).
- DB: managed **Postgres** (swap from dev SQLite). Add **Alembic** migrations.
- Photos/KYC: **S3 / GCS** + CDN, with image moderation (AWS Rekognition / Hive).
- Secrets: a real secrets manager (not `.env` in prod).

---

## 2. ⚠️ Store-compliance gotchas that change the architecture

These are not optional — they cause **rejection** if missed:

1. **Sign in with Apple is REQUIRED** once you offer Google login (Apple Guideline
   4.8). Adding Google OAuth obligates adding Apple sign-in on iOS. → add `/auth/apple`.
2. **Subscriptions must use Apple IAP / Google Play Billing**, NOT Razorpay
   (Guideline 3.1.1). The current `billing.ts`/Razorpay plan will be **rejected on
   iOS**. Re-architect billing to **StoreKit / Play Billing** — easiest via
   **RevenueCat** (one SDK for both) + server receipt validation.
3. **In-app account deletion** is required (Apple 5.1.1(v)). We have `DELETE /me`;
   wire a Settings → "Delete account" flow to it.
4. **Dating/UGC safety** (Apple 1.2): report + **block**, a EULA with zero tolerance
   for abuse, content moderation, and ability to act within 24h. We have reports;
   need **block**, photo moderation, and chat filtering enforced server-side.
5. **Privacy**: hosted Privacy Policy + Terms URLs, iOS **App Privacy nutrition
   labels**, Play **Data Safety** form, and `Info.plist`/manifest **permission
   usage strings** (location, camera, photos, notifications).
6. **Age**: 18+ dating → 17+ rating + age gate (we enforce 18+ at signup) + Apple
   "dating" category review nuances.

---

## 3. API endpoints required for launch

Legend: ✅ exists · 🔶 partial · ❌ to build. Anything backed by a local mock today
(`store`, `slots`, `billing`, `session`) must move server-side.

### Auth & account
- `POST /auth/signup` ✅ · `POST /auth/login` ✅
- `POST /auth/google` 🔶 (built on `feat/auth-monetization-profile-redesign` — **port/merge here**)
- `POST /auth/apple` ❌ (compliance — required with Google)
- `POST /auth/phone/start` + `/auth/phone/verify` ❌ (OTP via Twilio/Firebase, if keeping phone login)
- `POST /auth/refresh`, `POST /auth/logout` ❌ · `GET /me` ❌

### Profile & onboarding
- `PUT /me/profile` ❌ (name, bio, photo refs) — replaces local `store`
- `POST /me/birth` ❌ (encrypted birth date/time/place)
- `POST /me/psych` ❌ (questionnaire → psych profile; today in `store`/`questionnaire`)
- `POST /me/photos` ❌ (presigned upload to S3 + verification status)
- `GET /profiles/{id}` ❌

### Location (see §5.2)
- `POST /me/location` ❌ (store coarse city/geohash from device GPS)
- `GET /places/search?q=` 🔶 (today proxied to the Karmian API in `placeSearch.ts`; route via our backend so the key stays server-side)
- `GET /geo/reverse?lat&lng` ❌ (reverse geocode)

### Matching & connection slots (move off local `slots`/`store`)
- `GET /slots` ❌ (slot view: open/active, weekly cap)
- `POST /slots/deliver` · `/slots/optin` · `/slots/decline` ❌
- `GET /candidates` ❌ (ranked deck, past pairs excluded)
- `GET /matches` 🔶 (`/matches/daily/{user_id}` exists)
- `GET /compatibility/{otherId}` ❌ (the report: psych + astro fused; today computed on-device)

### Chat
- `GET /threads` · `GET /threads/{id}/messages` ❌
- `POST /messages` 🔶 (`/chat/send` exists; enforce contact-filter server-side)
- `POST /contact-unlock` 🔶 (`/matches/unlock-contact` exists — must gate behind IAP)
- Realtime: WebSocket/SSE (or polling for v1) ❌

### Billing (re-architected to IAP)
- `GET /billing/products` ❌ · `GET /billing/entitlement` ❌
- `POST /billing/verify` ❌ (Apple/Google receipt validation)
- `POST /webhooks/revenuecat` (or `/apple`, `/google`) ❌

### Consent, data rights, safety
- `POST /consent` ✅ · `GET /consent/{user_id}` ✅
- `GET /{user_id}/export` ✅ · `DELETE /{user_id}` ✅ (wire to in-app delete)
- `POST /reports` ✅ · `POST /offboard` ✅ · `POST /block` ❌

### Astrology (cosmetic layer)
- kundli/synastry proxied via `services/astrology_client.py` ✅ (consumed from the Karmian API)

### Push
- `POST /me/push-token` ❌ (Expo push token) + server send pipeline ❌

**Cross-cutting (mostly present, verify for prod):** field-level encryption ✅,
consent ledger ✅, access log ✅, JWT (add refresh), rate limiting ❌, TLS (host),
S3 photo storage ❌, observability (Sentry) ❌.

---

## 4. The two you called out

### 4.1 Google OAuth
- Backend `POST /auth/google` (verify id_token, audience-checked) is **already built**
  on `feat/auth-monetization-profile-redesign` — **merge it into the launch branch**.
- Mobile flow + button already done there too.
- For stores: register an **iOS OAuth client** + a **dev/prod build** (Expo Go can't
  complete the `csc://` redirect), and **add Sign in with Apple** (Guideline 4.8).
- Setup steps: `docs/google-oauth-setup.md`.

### 4.2 Location API
- **On device:** `expo-location` to read GPS (with `NSLocationWhenInUseUsageDescription`
  / Android `ACCESS_FINE_LOCATION` + clear usage strings) → `POST /me/location`.
- **Autocomplete / reverse geocode:** Google Places (or Mapbox/Nominatim). **Proxy it
  through our backend** (`GET /places/search`, `GET /geo/reverse`) so the provider key
  is never shipped in the app and we can cache + rate-limit.
- **Privacy:** precise location is sensitive → gate behind the `location_matching`
  consent purpose (already in the enum), **store coarse** (city / geohash, not raw
  lat-lng), set a TTL, and never expose another user's precise location.

---

## 5. Path to the stores (phased)

**Phase 0 — Accounts & legal**
- Apple Developer Program ($99/yr) + Google Play Console ($25 once).
- Company/payment entity; hosted **Privacy Policy + Terms + EULA**; grievance contact.

**Phase 1 — Backend productionization**
- Postgres + Alembic migrations; secrets manager; deploy API (ap-south); S3 photos;
  Sentry; rate limiting; JWT refresh; health checks + CI/CD.

**Phase 2 — Replace local mocks with the API**
- Port `store`, `slots`, `billing`, `session` to the endpoints in §3; keep the
  offline-tolerant fallback only for dev.

**Phase 3 — Compliance work**
- Sign in with Apple; IAP via RevenueCat; in-app account deletion; block + photo/chat
  moderation; permission strings; privacy labels / Data Safety.

**Phase 4 — EAS build & test**
- `app.json`: bundle IDs (`com.csc.app`), icons, splash, permission strings, `scheme`.
- `eas.json`: dev / preview / production profiles. `eas build` → `eas submit`.
- TestFlight (iOS) + Play Internal Testing.

**Phase 5 — Store listings & submit**
- Screenshots, descriptions, 17+ age rating, privacy answers, **demo account** for
  reviewers, review notes. Submit; address review feedback.

**Phase 6 — Post-launch**
- EAS Update (OTA JS updates), consented analytics (PostHog), push, monitoring,
  on-call for safety reports (24h SLA).

---

## 6. Recommended stack

| Concern | Choice |
|---|---|
| API host | Render / Fly.io (simple) or AWS (scale), `ap-south` |
| DB | Managed Postgres + Alembic |
| Photos | S3/GCS + CDN + image moderation |
| Payments | **RevenueCat** → Apple IAP + Play Billing |
| Auth | FastAPI JWT + Google + **Apple** verify |
| Location | `expo-location` on device; Google Places/Mapbox via backend proxy |
| Push | Expo Notifications |
| Realtime chat | WebSocket (FastAPI) or polling for v1 |
| Errors/analytics | Sentry + PostHog (consented) |
| Mobile delivery | EAS Build / Submit / Update |

---

## 7. Biggest risks to flag now
1. **Razorpay → must become Apple/Google IAP** for the subscription (or iOS rejects).
2. **Sign in with Apple** is mandatory alongside Google.
3. Most features are **local mocks** — real launch needs the server endpoints in §3.
4. **Content moderation + block** is mandatory for a dating app.
5. **Data residency / DPDP** — host in India region, keep the consent ledger + access
   log authoritative on the server.
