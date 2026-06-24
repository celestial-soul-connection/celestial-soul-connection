# All-in Supabase — migration plan

Decision: go **all-in on Supabase** — Auth, Postgres + Row-Level Security (RLS),
Storage, Realtime, and **Edge Functions** for trusted server logic. The FastAPI
app (`apps/api/`) is **retired** once parity is reached.

Good news on effort: the heavy logic (scoring, matching, contact-filter, fusion)
is **already TypeScript** in `apps/mobile/src/data/`. Edge Functions are Deno/TS,
so that logic **ports almost as-is** — this is not a Python rewrite, it's a move
of TS into Supabase functions + replacing AsyncStorage/REST calls with `supabase-js`.

---

## 1. Target architecture

| Concern | Today | All-in Supabase |
|---|---|---|
| Auth | FastAPI JWT + custom Google verify | **Supabase Auth** (email, Google, Apple, phone OTP) |
| DB | SQLite/Postgres via SQLAlchemy | **Supabase Postgres + RLS** |
| Reads/writes | FastAPI endpoints / local AsyncStorage | **`supabase-js`** direct queries (RLS-guarded) |
| Photos/KYC | (none) | **Supabase Storage** (private buckets + signed URLs) |
| Chat realtime | (none) | **Supabase Realtime** |
| Trusted logic | FastAPI routers | **Edge Functions** (Deno/TS) + DB triggers |
| Region | — | **Mumbai (ap-south-1)** for DPDP |

**What stays client-trusted vs server-trusted:** plain profile reads/writes go
direct via `supabase-js` under RLS. Anything that must not be tampered with —
consent ledger, encryption, matching/slots, chat contact-filter, IAP verification,
astrology key, account deletion — runs in **Edge Functions** (or DB triggers), never
the client.

---

## 2. Database schema + RLS

Port the SQLAlchemy models → SQL migrations (Supabase migrations / SQL editor).
Tables key off `auth.users.id` (Supabase Auth owns the user row).

- `profiles` (1:1 auth.users): name, bio, photo refs, city, geohash, push token, verified flags
- `psych_profiles`, `birth_data` (encrypted columns), `consent_events` (append-only),
  `connection_slots`, `matches`, `messages` (encrypted body), `subscriptions`,
  `reports`, `access_logs` (append-only), `blocks`

**RLS policies (security-critical — a dating app leaks if these are wrong):**
- `profiles`: a user `select/update` only their own row; other users' profiles are
  read only via a **`discover` view / Edge Function** that returns curated, limited fields.
- `birth_data`, `psych_profiles`: owner-only; never selectable by others (only derived
  match explanations are exposed).
- `consent_events`, `access_logs`: **INSERT-only** (no `update`/`delete` policy) → append-only ledger.
- `messages`: select/insert limited to the two participants of the match.
- `subscriptions`: owner read; writes only by the billing Edge Function (service role).
- Storage `photos`/`kyc`: owner-write, and read via signed URLs only.

A `handle_new_user()` **trigger** on `auth.users` insert creates the `profiles`
row and logs `account_core` consent.

---

## 3. Auth migration (Supabase Auth)

- **Providers** (configure in Supabase dashboard): Email/password, **Google**
  (reuse your existing client IDs + add the secret), **Apple** (required alongside
  Google for iOS — Service ID + key), **Phone OTP** (needs an SMS provider; costs).
- **Mobile:** replace `authApi.ts`/`session.ts`/`googleAuth.ts` with `supabase-js`:
  - email: `supabase.auth.signInWithPassword`
  - Google/Apple: `supabase.auth.signInWithIdToken({ provider, token })`
  - phone: `supabase.auth.signInWithOtp` + `verifyOtp`
  - session + refresh handled by `supabase-js` with a **SecureStore** storage adapter.
- **18+ / DOB:** Supabase Auth doesn't capture DOB → collect in onboarding, store in
  `birth_data`/`profiles`, enforce 18+ in the onboarding Edge Function before matching.
- **Obsolete after this:** `apps/api/app/routers/auth.py` (incl. `/auth/google`),
  mobile `googleAuth.ts`, `GoogleSignInButton`'s exchange logic, custom JWT in
  `core/security.py`. (The Google *Cloud Console* client IDs are still used — by
  Supabase now.)

---

## 4. Edge Functions (the trusted layer) — maps 1:1 to current logic

| Edge Function | Replaces | Notes |
|---|---|---|
| `on-signup` (trigger) | signup consent logging | create profile + `account_core` consent |
| `set-birth` | `/me/birth` | encrypt (Vault/pgsodium) + 18+ gate + access log |
| `submit-psych` | `/me/psych`, questionnaire | store vector + consent |
| `deliver-slot` / `score` | `/slots/*`, mobile `scoring.ts`/`matching.ts` | **port existing TS**; rank candidates, fill slots, weekly cap |
| `chat-send` | `/chat/send`, `contactFilter.ts` | contact-filter (no number sharing) + encrypt + insert |
| `compatibility` | mobile `fusion.ts` + report | psych + astro fused, explainable |
| `astro` | `astrology_client.py`/`astrologyApi.ts` | proxy Karmian API; key in function secret |
| `billing-verify` + webhook | `/billing/*` | Apple/Google receipt verify → `subscriptions` |
| `account-delete` | `/data_rights` delete | crypto-shred + pseudonymize, audit |
| `export-data` | `/data_rights` export | gather the user's rows |
| `places`/`geo` | `/location/*` | proxy geocoder; key server-side |

Secrets (geocode key, astro key, encryption key, store credentials) live in
**Edge Function secrets / Supabase Vault** — never in the app.

---

## 5. Storage
- Private buckets `photos` and `kyc`. Upload direct from app via `supabase-js`
  (RLS: path prefixed by `auth.uid()`); display via short-lived **signed URLs**.
- KYC docs never returned to other users — verification status only.

---

## 6. Compliance carries over (must-keep)
- Append-only **consent ledger** + **access log** → INSERT-only RLS tables.
- **Field-level encryption** (birth/chat/KYC) → Supabase **Vault/pgsodium** or
  Edge-Function encrypt with a KMS-held key.
- **18+ gate**, **no-number-sharing** chat filter (server-side), **report + block**,
  **export/delete**, **data residency = Mumbai**.
- **Payments** unchanged: Apple IAP / Google Play Billing, verified in `billing-verify`
  (Supabase does not replace store billing). **Sign in with Apple** now via Supabase.

---

## 7. Phased rollout
1. **Foundation:** create project (Mumbai), schema + RLS migrations, buckets, triggers.
2. **Auth:** wire `supabase-js` auth (email/Google/Apple) in mobile; retire FastAPI auth.
3. **Data:** repoint mobile `store`/`session`/`slots`/`billing` to `supabase-js` + tables.
4. **Edge Functions:** port scoring/matching, chat-filter, billing-verify, astro, geo,
   set-birth, account-delete, export.
5. **Storage + Realtime:** photo upload + realtime chat.
6. **Decommission `apps/api/`**; keep `docs/`.
7. **Pro plan** before launch (backups, no project-pausing, 100k MAU).

---

## 8. What I need from you
- Supabase: `SUPABASE_URL`, `anon` key, **`service_role`** key (secret), DB
  `DATABASE_URL` (for running migrations), project **JWT secret**.
- Auth providers configured (or the creds to configure): **Google** client IDs +
  secret (you have the IDs), **Apple** Service ID + key (for iOS), and — if you want
  phone login — an **SMS provider** (Twilio/MessageBird) account.
- Confirm **region = Mumbai** at project creation (can't change later).

## 9. Trade-offs / honest notes
- Real re-architecture: the FastAPI app and the mobile auth/data modules get
  rewritten to Supabase. The **recent FastAPI endpoints + custom Google OAuth become
  reference/obsolete** (the TS logic is reused in Edge Functions).
- **RLS is the security boundary** now — easy to get wrong; needs careful policies +
  tests (a misconfigured policy can expose private data).
- **Vendor lock-in** to Supabase; Edge Function cold starts; Deno runtime.
- Phone OTP and (at scale) MAU/storage/bandwidth cost money beyond Free.

---

## 10. First step once you approve + send creds
Stand up the **schema + RLS + buckets + the `handle_new_user` trigger** on your
Supabase project, then wire **`supabase-js` auth** in the mobile app (email + Google),
so you can sign in against real Supabase end-to-end before we port the rest.
