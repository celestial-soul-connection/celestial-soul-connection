# Product Requirements Document (PRD)

## Working title: a focused, conversation-first dating app

> **Status:** Draft v1 — for engineering kickoff
> **Owner:** Founder
> **Audience:** Engineering (incl. Claude Code), design, future investors

---

## 1. The problem

Mainstream dating apps optimize for engagement (swipes, sessions, time-in-app),
and that optimization produces the experience users actually complain about:

- **Gender imbalance + flooding.** Most large apps skew heavily male (e.g. Tinder
  ~78% male, Hinge ~64%, Bumble ~62.5%). The result: women are flooded with likes
  and become hyper-selective, while men grind for almost no matches. This is a
  self-reinforcing doom loop — women have a bad experience and leave, the ratio
  worsens, the remaining women get flooded harder.
- **Choice overload / no decision.** Endless options let people talk to many
  candidates and commit to none ("paradox of choice"). Connections stay shallow.
- **Burnout.** ~79% of Gen Z report dating-app burnout.
- **Looks-only matching.** Photo-first, Elo-style ranking reduces people to
  appearance and pushes the experience toward the superficial.
- **Safety.** Women report harassment at roughly 2.4x the rate of men; unwanted
  explicit content, persistent contact after a "no", and threats are common.
  Scams, bots, and fake profiles affect everyone (bots ~10% of profiles by some
  estimates; ~54% of online dating scams happen on dating apps). Men are
  disproportionately targeted by financial/romance scams.
- **Deception.** Attached/married people misrepresenting availability is a real
  honesty + safety harm.

## 2. The thesis

Solve the flooding problem at its root with **enforced scarcity and a
conversation-first flow**, and most of the downstream problems (harassment volume,
burnout, indecision, superficiality) ease at once. Trade raw engagement for
**connection quality and retention** — which, for a burned-out audience, is the
product, not a sacrifice.

**If women have a good, safe, low-pressure experience, they stay. If they stay,
the ratio balances. If the ratio balances, men get real matches. Win-win.**

## 3. Goals and non-goals

### Goals
- G1. Prevent flooding via hard caps on concurrent active connections.
- G2. Force intentional decisions (you can't hoard options).
- G3. Make a real conversation the default, rewarded path — never the coerced one.
- G4. Deliver matches at a guaranteed *cadence* (process guarantee, not outcome).
- G5. Be meaningfully safer for women and minority users than incumbents.
- G6. Detect and reduce deception (married-as-single) and extraction (scams).

### Non-goals
- N1. Maximizing time-in-app, swipes, or session count.
- N2. Filtering people by *preference* or *perceived motive* (explicitly: no
  "gold digger" detection — that encodes a stereotype and drives women off).
  We police **behaviors that deceive or extract**, never preferences.
- N3. Penalizing people for declining. Declining is a feature, not a violation.
- N4. Guaranteeing chemistry or a successful relationship.

## 4. Core mechanic — "Connection Slots"

### 4.1 Slots
- A **man** has **1 active slot**.
- A **woman** has **2 active slots**.
- A slot holds one **active connection**: a mutually opted-in pair who can chat.
- *(The 1 vs 2 split is a starting hypothesis — must be configurable and A/B
  testable. Could become 2/2 or 1/1 after testing.)*

### 4.2 Mutual opt-in (no one-sided pursuit)
- The system surfaces a **candidate** into an open slot.
- A connection (and chat) only **opens when both people opt in** to the
  suggested match. Until both say yes, there is no pending suitor to "reject" —
  this removes the "she declined me" resentment loop by design.

### 4.3 Decline-to-free (forward-only)
- Either party may **decline** an active connection at any time.
- Declining **frees that slot** and **permanently loses** that person
  (no back-burner, no re-queue of the same pair). This is the structural cost
  that forces a real decision instead of option-hoarding.
- Declining carries **no reputational penalty and no tag**. Losing the slot is
  consequence enough.

### 4.4 Why this beats the alternatives
- Scarcity on the **initiation/slot** side does the work; we never need to police
  the *receiver's* right to say no.
- Conversations that happen are authentic *because they were chosen*, not forced.

## 5. The delivery guarantee (member promise)

- We guarantee to **deliver** curated, verified candidates into open slots at a
  defined cadence — **a process guarantee, not an outcome guarantee.**
- Cadence: present a fresh candidate when a slot is open, capped at
  **a maximum of 2 new connections delivered per week** per member.
- **The cap is on new matches delivered, NOT on declines.** Members may decline
  freely; we simply don't flood replacements. (Capping declines would quietly
  reintroduce the pressure problem and is explicitly forbidden — see N3.)
- Copy must promise *delivery of a verified candidate at cadence X*, never
  "you will have a real conversation" or any outcome we can't control.

## 6. Encouraging conversation WITHOUT penalties

- Conversation-first: matches open into a chat; getting to know someone precedes
  any deeper commitment.
- Low-pressure nudges only (e.g. "You matched — say hi when you're ready").
  **No deadlines, no "moody/not serious" tags for declining.**
- **Reward engagement** (good standing → e.g. eligible for full cadence) rather
  than punishing its absence.

### 6.1 Seriousness signal — symmetric and behavioral
- The ONLY low-seriousness signal we track is **ghosting after engaging**:
  opening a chat, getting the other person invested, then going silent /
  abandoning repeatedly.
- Applied **identically to men and women.** Gender must never be an input.
- **Declining before a conversation is NOT a negative signal** for anyone — it
  may be sound judgment (and, for safety, often is).

## 7. Safety, verification, anti-scam

- **Verification:** photo and/or ID verification to raise the cost of fake and
  deceptive profiles. Verified status should be visible.
- **Relationship-status honesty:** collect status; provide a clear path to report
  someone discovered to be married/attached while presenting as single. Treat
  proven deception as a serious violation.
- **Off-platform red flag:** detect/flag/warn on requests to move the chat
  off-app (e.g. to WhatsApp) within the first few messages — this is the single
  fastest-growing scam vector and strips every safety layer.
- **Reporting + moderation:** easy in-app reporting; preserve the in-app evidence
  chain. Low volume makes each report higher-signal and moderation cheaper.
- **Anti-extraction (not anti-preference):** flag/report behaviors — soliciting
  money, gift cards, "emergency" funds, sugar-arrangement solicitation, spam.
  **Never** flag someone for *wanting* a wealthy/attractive partner. (See N2.)
- **Receiver control:** the recipient controls whether a conversation opens
  (via mutual opt-in) and can one-tap close it.

## 8. Metrics

### North-star
- **% of delivered matches that reach a real conversation** (and, downstream,
  that lead to a first date). Connection quality — not time-in-app.

### Supporting
- Retention (esp. **female retention** — the leverage point for the ratio).
- Gender ratio over time (target: trending toward balance).
- Reports per 1,000 connections; time-to-moderation.
- Decline reasons (for product learning only — NEVER used to penalize).
- Ghost-after-engage rate (the one seriousness signal), by behavior not gender.

### Watch-outs / explicitly NOT optimized
- DAU, swipes/session, session length. Expect these to be **lower by design**;
  do not let a growth team steer toward them.

## 9. Key risks
- R1. Investors/growth trained on DAU push back on low engagement. → Commit to
  the connection-quality north-star up front.
- R2. Delivery guarantee over-promises. → Word as process guarantee (§5).
- R3. Cold-start / liquidity: scarcity needs enough verified users per area to
  deliver cadence. → Launch geo-by-geo; gate growth on supply balance.
- R4. People game any signal. → Keep signals behavioral + symmetric; avoid
  chat-content grading (privacy + gameability — see Technical doc).

## 10. Open decisions
- Exact slot split (1/2 vs 2/2 vs 1/1) — decide via A/B.
- Who, if anyone, "initiates" beyond mutual opt-in, or is opt-in the only path.
- Free vs paid tiering (and ensuring paywalls don't recreate the male
  pay-to-be-seen problem).
- Launch market(s).
