# Technical Design Document

## Focused, conversation-first dating app — backend + system design

> **Status:** Draft v1 — for engineering kickoff (incl. Claude Code)
> **Companion doc:** PRD.md
> **Scope:** MVP architecture, data model, core state machines, APIs, safety
> systems, and the rules that must be enforced server-side.

This document is written so a coding agent can implement the MVP. Where a product
rule has a subtle reason, it is restated as an **INVARIANT** so it is not
"optimized away." Invariants are non-negotiable and must be enforced on the
**server**, never trusted from the client.

---

## 1. Architecture overview

Recommended MVP stack (adjust to team familiarity — none of the domain logic
depends on these choices):

- **Client:** mobile-first. React Native (iOS + Android from one codebase) or
  native if preferred.
- **API:** REST or GraphQL over HTTPS. Stateless app servers behind a load
  balancer. (Examples below use REST.)
- **Backend language:** team's choice (Node/TypeScript, Go, or Python all fine).
- **Primary DB:** PostgreSQL (relational integrity matters here — slots,
  connections, and the mutual-opt-in handshake need transactions).
- **Cache / ephemeral:** Redis (rate limits, candidate queues, locks).
- **Realtime chat:** WebSocket service (or a managed option) backed by Postgres
  for message persistence.
- **Object storage:** S3-compatible for photos / verification media.
- **Background jobs:** a queue (e.g. Sidekiq/BullMQ/Cloud Tasks) for match
  delivery cadence, moderation scans, notifications.

```
[Mobile app]
    | HTTPS / WSS
[API gateway / LB]
    |
[App servers] --- [Redis: locks, queues, rate limits]
    |
[PostgreSQL: users, slots, connections, messages, reports]
    |
[Workers: match-delivery, moderation, off-platform-detection, notifications]
    |
[S3: media]   [Moderation/3rd-party verification]
```

---

## 2. Core domain model

### 2.1 Entities (Postgres tables)

```sql
-- USERS
users (
  id              uuid primary key,
  created_at      timestamptz not null default now(),
  display_name    text not null,
  gender          text not null,        -- used ONLY for slot count + ratio
                                         -- balancing. NEVER as a seriousness input.
  birthdate       date not null,
  relationship_status text not null,    -- self-declared; verifiable via report
  bio             text,
  verification_status text not null default 'unverified',
                                         -- unverified | photo_verified | id_verified
  standing        text not null default 'good',  -- good | flagged | restricted
  is_active       boolean not null default true
)

-- PHOTOS / MEDIA
media (
  id          uuid primary key,
  user_id     uuid references users(id),
  kind        text not null,           -- profile_photo | verification_selfie | id_doc
  s3_key      text not null,
  created_at  timestamptz not null default now()
)

-- SLOTS  (the heart of the system)
-- A row exists per (user, slot_index). Capacity enforced by count of slots.
slots (
  id           uuid primary key,
  user_id      uuid references users(id),
  slot_index   smallint not null,       -- 0 for men; 0,1 for women
  state        text not null default 'open',  -- open | candidate_pending | active
  connection_id uuid references connections(id),  -- null when open
  updated_at   timestamptz not null default now(),
  unique (user_id, slot_index)
)

-- CANDIDATES (a surfaced suggestion before mutual opt-in)
candidates (
  id            uuid primary key,
  user_a        uuid references users(id),   -- the two people suggested to each other
  user_b        uuid references users(id),
  a_decision    text not null default 'pending',  -- pending | opt_in | declined
  b_decision    text not null default 'pending',
  created_at    timestamptz not null default now(),
  resolved_at   timestamptz,
  unique (user_a, user_b)                     -- normalize so (a,b)==(b,a); see §3.4
)

-- CONNECTIONS (an active, mutually opted-in pair)
connections (
  id          uuid primary key,
  user_a      uuid references users(id),
  user_b      uuid references users(id),
  state       text not null default 'active', -- active | ended
  ended_by    uuid references users(id),      -- who declined (private; not shown)
  ended_reason text,                          -- optional, for product learning only
  created_at  timestamptz not null default now(),
  ended_at    timestamptz
)

-- MESSAGES
messages (
  id            uuid primary key,
  connection_id uuid references connections(id),
  sender_id     uuid references users(id),
  body          text not null,
  created_at    timestamptz not null default now(),
  flags         jsonb default '{}'             -- e.g. off_platform_detected:true
)

-- PAST PAIRINGS (so a declined pair is never re-suggested)
past_pairings (
  user_low   uuid not null,   -- normalized: least(user_a,user_b)
  user_high  uuid not null,
  created_at timestamptz not null default now(),
  primary key (user_low, user_high)
)

-- ENGAGEMENT EVENTS (for the ONE seriousness signal, behavioral + symmetric)
engagement_events (
  id            uuid primary key,
  user_id       uuid references users(id),
  connection_id uuid references connections(id),
  kind          text not null,   -- chat_opened | replied | ghosted_after_engage
  created_at    timestamptz not null default now()
)

-- REPORTS
reports (
  id            uuid primary key,
  reporter_id   uuid references users(id),
  reported_id   uuid references users(id),
  connection_id uuid references connections(id),
  category      text not null,   -- harassment | married_deception | scam_extraction
                                  -- | off_platform | other
  detail        text,
  status        text not null default 'open',  -- open | reviewing | actioned | dismissed
  created_at    timestamptz not null default now()
)

-- DELIVERY LEDGER (enforces the weekly cadence cap)
match_deliveries (
  id          uuid primary key,
  user_id     uuid references users(id),
  candidate_id uuid references candidates(id),
  delivered_at timestamptz not null default now()
)
```

### 2.2 Slot capacity by gender

| Gender | Slot count (`slot_index` values) |
|--------|----------------------------------|
| man    | 1  (0)                           |
| woman  | 2  (0, 1)                        |

> Make the count a **config value**, e.g. `SLOT_COUNTS = { man: 1, woman: 2 }`,
> so it is A/B testable per the PRD open decision. Do not hardcode `1` / `2`
> across the codebase.

---

## 3. Invariants (enforce server-side, in transactions)

> **INVARIANT-1 — Capacity.** A user can never have more `active` +
> `candidate_pending` slots than their gender's configured slot count. Enforce by
> counting slot rows in state != 'open' inside the same transaction that opens a
> new one. Use row locks (`SELECT ... FOR UPDATE`) to avoid races.

> **INVARIANT-2 — Mutual opt-in only.** A `connection` may be created ONLY when a
> `candidate` has `a_decision = 'opt_in' AND b_decision = 'opt_in'`. No one-sided
> pursuit, ever. There is no "like" that creates a pending suitor on the other
> side before they opt in.

> **INVARIANT-3 — Decline is forward-only and free.** Declining an active
> connection: sets connection.state='ended', frees BOTH users' slots, writes a
> `past_pairings` row so the pair is never re-suggested. It writes **no penalty,
> no tag, no standing change** to the decliner. (See INVARIANT-6.)

> **INVARIANT-4 — Delivery cap is on deliveries, not declines.** A user may
> receive at most `MAX_DELIVERIES_PER_WEEK = 2` new candidates per rolling 7-day
> window (count rows in `match_deliveries`). Declines are **unlimited** and must
> never be rate-limited or capped. Capping declines is forbidden.

> **INVARIANT-5 — No re-pairing.** Never surface a candidate for a pair present in
> `past_pairings`.

> **INVARIANT-6 — Gender is not a behavior input.** `gender` may be used ONLY for
> (a) slot count and (b) ratio balancing in candidate selection. It must NEVER
> feed standing, the seriousness signal, ranking penalties, or moderation
> outcomes.

> **INVARIANT-7 — The only negative behavioral signal is ghost-after-engage.**
> Declining before/without a conversation is NEVER negative. "Ghost after engage"
> = user sent/received messages in a connection (engaged), then went silent past a
> threshold or abandoned, repeatedly. Computed identically regardless of gender.

> **INVARIANT-8 — No chat-content grading.** Do NOT judge "conversation quality"
> from message contents to assign penalties or rewards. It is gameable and a
> privacy hazard. Engagement is measured by behavioral events (opened, replied,
> ghosted), not by reading/scoring content. (Automated safety scanning for
> harassment/scam/off-platform is a separate, narrow exception — §6.)

---

## 4. Core flows

### 4.1 Match delivery (background worker + on-demand)

Trigger: a user has an `open` slot AND is under the weekly delivery cap.

1. Acquire a per-user lock (Redis) to prevent double-delivery.
2. In a transaction:
   - Re-check `open` slot exists and `match_deliveries` count < cap (7-day window).
   - Select a candidate counterpart via the **selection algorithm** (§5),
     excluding `past_pairings` and anyone already in a candidate/connection
     with this user.
   - Create a `candidate` row (normalized pair), set the user's slot to
     `candidate_pending`, write a `match_deliveries` row.
3. Notify the user: "You have a new match — take a look."

> Both sides must end up with a `candidate_pending` slot for the same candidate
> before chat can open. Implementation choice: surface to both simultaneously, or
> surface to one, and only consume the other's slot upon first opt-in. Simpler &
> recommended for MVP: **surface to both at once**, consuming a slot on each side
> (still bounded by INVARIANT-1 and the delivery cap).

### 4.2 Opt-in / decline of a candidate

- `POST /candidates/{id}/opt_in` → set this user's decision to `opt_in`.
  - If both now `opt_in`: create `connection` (active), set both slots to
    `active` pointing at it, open the chat. Emit `chat_opened` engagement events.
- `POST /candidates/{id}/decline` → set decision `declined`.
  - Resolve candidate; free **this** user's slot back to `open`; write
    `past_pairings`. If the other side had opted in, free their slot too and
    notify neutrally ("This match didn't move forward — a new one is on the way").
  - **No penalty.** (INVARIANT-3, -6, -7.)

### 4.3 Decline an active connection

- `POST /connections/{id}/decline`
  - Transaction: set connection ended (`ended_by` = caller, stored privately),
    free both slots → `open`, write `past_pairings`.
  - No tag/penalty to either party.
  - Trigger match-delivery eligibility check for both (subject to weekly cap).

### 4.4 Chat

- WebSocket channel per `connection_id`; persist to `messages`.
- Only the two members of an `active` connection may read/write.
- Every inbound message runs through the **off-platform detector** and
  **safety scan** (§6) asynchronously; never block send on it except for hard
  blocks (configurable).

### 4.5 State machines

**Slot:** `open → candidate_pending → active → (decline) → open`
(also `candidate_pending → open` on candidate decline.)

**Candidate:** `pending → (both opt_in) resolved→connection`
| `pending → (either declines) resolved→discarded` (+ past_pairings)

**Connection:** `active → ended` (by either party; symmetric).

---

## 5. Candidate selection algorithm (MVP)

Keep it simple and explainable for MVP; do not build Elo / looks-ranking.

Inputs: requesting user U with an open slot.

Filtering (hard):
- Opposite slot availability: counterpart must also be deliverable (open slot +
  under weekly cap) — or will be when surfaced.
- Exclude `past_pairings` with U (INVARIANT-5).
- Exclude existing candidate/connection counterparts.
- Geographic / basic preference filters (age range, distance, stated prefs).
- Verified users preferred/required per launch policy.

Ranking (soft, transparent):
- **Ratio balancing:** prioritize keeping local supply balanced (this is the only
  sanctioned use of `gender` in ranking — INVARIANT-6).
- Mutual stated preferences match.
- Recency/activity (active users first) — NOT an engagement-maximizing score.
- Good `standing` preferred.

Explicitly **NOT** used in ranking: attractiveness scoring, Elo, "desirability,"
decline history, or anything that penalizes saying no.

---

## 6. Safety systems

### 6.1 Verification
- Photo verification (selfie vs profile photos) and optional ID verification.
- Store verification media in restricted S3; surface only a boolean/level.
- Gate features by verification per launch policy (e.g. verified-only matching).

### 6.2 Off-platform contact detection
- Scan messages (esp. first N messages of a connection) for attempts to move to
  external messengers / hand out phone numbers / external handles.
- Action: warn the recipient inline + flag the message (`off_platform_detected`)
  + raise a soft risk signal. Configurable hard-block for egregious/repeat cases.
- Rationale (do not remove): off-platform pivot in the first few messages is the
  top scam vector and strips all safety layers.

### 6.3 Anti-extraction (NOT anti-preference)
- Detect/allow reporting of: requests for money, gift cards, "emergency" funds,
  sugar-arrangement solicitation, promotional spam.
- **Forbidden:** any classifier or filter that flags users for *wanting* a
  wealthy/attractive partner, or any "gold digger" heuristic. This is a
  preference, not a harm. (PRD N2.)

### 6.4 Relationship-status / married-deception
- Report category `married_deception`. On credible/repeat reports → moderation
  review → restricted standing. Verification raises the cost of the lie; we do
  not claim perfect detection.

### 6.5 Reporting + moderation
- One-tap report from any connection/chat. Preserve in-app evidence chain
  (do not push users off-platform to gather evidence).
- Moderation queue with categories above; low volume = high signal per report.
- Receiver can one-tap close/decline any connection at any time.

### 6.6 The seriousness signal (single, symmetric, behavioral)
- Compute `ghosted_after_engage`: in a connection where the user engaged
  (>= 1 reply exchanged), then no activity for `GHOST_THRESHOLD` (e.g. 7 days)
  and/or abandoned, repeatedly across connections.
- Affects standing only above a repeat threshold; identical logic for all genders.
- **Never** counts pre-conversation declines. (INVARIANT-7.)

---

## 7. API surface (MVP, REST sketch)

```
POST   /auth/register
POST   /auth/login
GET    /me
PATCH  /me                       # bio, prefs, relationship_status
POST   /me/photos                # upload; triggers verification flow
POST   /me/verify                # submit verification selfie / id

GET    /slots                    # my slots + states
GET    /candidates/current       # candidate(s) currently in my pending slots
POST   /candidates/{id}/opt_in
POST   /candidates/{id}/decline

GET    /connections              # my active connections
GET    /connections/{id}/messages
POST   /connections/{id}/messages
POST   /connections/{id}/decline

POST   /reports                  # category + detail (+ connection/reported user)
```

Server enforces all invariants regardless of what the client sends. Treat the
client as untrusted.

---

## 8. Notifications
- "New match delivered" (respecting weekly cap).
- "Match opened — say hi when you're ready" (low-pressure, no deadline).
- "This match didn't move forward — a new one is on the way" (neutral, on decline).
- Safety warnings (off-platform attempt detected).
- Never send guilt/pressure notifications about declining or about pending decisions.

---

## 9. Privacy & data
- Store verification media encrypted, access-restricted, retention-limited.
- `ended_by` / `ended_reason` are **private** — never shown to the other party.
- Decline reasons, if collected, are for aggregate product learning only and must
  not feed standing or ranking (INVARIANT-3, -6).
- No personal/sensitive data in URLs or query strings.

---

## 10. MVP build order (suggested for Claude Code)
1. Auth, user, photos, verification stub.
2. Slots table + capacity invariant (INVARIANT-1) with transactional opens.
3. Candidate + mutual opt-in flow (INVARIANT-2) → connection creation.
4. Decline (candidate + connection), past_pairings, slot-freeing (INVARIANT-3/5).
5. Match-delivery worker + weekly cap ledger (INVARIANT-4).
6. Selection algorithm v1 (§5) — simple filters + ratio balancing.
7. Chat (WebSocket + persistence).
8. Off-platform detection + reporting + moderation queue (§6).
9. Engagement events + ghost-after-engage signal (INVARIANT-7).
10. Notifications, metrics instrumentation (north-star = % matches reaching real
    conversation; track female retention + ratio).

## 11. Test cases that encode the invariants (write these)
- A man cannot hold 2 active connections; a woman cannot hold 3.
- A connection cannot be created without both opt-ins.
- Declining frees slots, never re-pairs, never penalizes the decliner.
- Declines are unlimited; deliveries are capped at 2 / rolling 7 days.
- Gender never appears in standing/seriousness computation.
- Pre-conversation decline produces zero negative signal; ghost-after-engage
  (repeat) does, identically across genders.
- No code path scores attractiveness or "desirability."
- Off-platform attempt in first N messages raises a flag + warns recipient.
