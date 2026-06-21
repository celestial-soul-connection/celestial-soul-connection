# The Psychology of Meaningful Romantic Compatibility

**A research-backed model for scoring and explaining lasting connection in a serious-intent dating/marriage app ("Soul Alignment").**

*Prepared for the product + research team. Last updated: 2026-06-21.*

> **Reading note.** The matching engine described here is grounded in peer-reviewed relationship science. The astrology/"karmic" layer is a *narrative wrapper* for the user-facing experience only — it must never silently change a score. Section 5 explains how to keep that boundary honest.

---

## 1. Executive Summary — What Actually Predicts Long-Term Satisfaction

The single most important finding for a matching company to internalize is humbling:

- **Compatibility is mostly an emergent, dyadic property — not a sum of two profiles.** Joel, Eastwick, and 84 co-authors (2020, *PNAS*) pooled 43 longitudinal datasets (~11,000 couples) and used machine learning to predict relationship quality. **Relationship-specific perceptions** (perceived partner commitment, appreciation, sexual satisfaction, perceived partner satisfaction, low conflict) were the strongest predictors. A **partner's own self-reported individual traits explained only ~5% of the variance** in the other partner's satisfaction. Translation: *who* you are matters far less than *how the relationship feels once it exists* — and the latter cannot be measured at onboarding from two solo questionnaires.
- **Matching algorithms have weak predictive validity for who will thrive together.** Finkel, Eastwick, Karney, Reis, and Sprecher (2012, *Psychological Science in the Public Interest*) reviewed the industry and found **no compelling evidence that any matching algorithm predicts long-term compatibility**, partly because sites optimize what is easy to measure (similarity of traits/attitudes) rather than what relationship science says matters (interaction dynamics, stress, circumstance).
- **What this means for us.** An honest engine should aim to do three achievable things, and stop overclaiming the fourth:
  1. **Filter out predictable misery** — large value/goal/deal-breaker conflicts that reliably erode relationships.
  2. **Screen in shared *intent*** — both people actually want the same kind of relationship.
  3. **Surface raw material for connection** — secure attachment, low contempt-proneness, responsiveness, self-expansion potential.
  4. **(Do NOT claim)** to predict that two specific strangers will fall in lasting love. That is not currently possible.

**What robustly predicts long-term satisfaction (use these):**

| Predictor | Evidence | Direction |
|---|---|---|
| Both partners' **attachment security** (low anxiety, low avoidance) | Hazan & Shaver (1987); Joel et al. (2020) found attachment anxiety/avoidance among top individual predictors | More secure → better |
| **Low Neuroticism** (emotional stability) | Dyrenforth et al. (2010), strongest actor effect (ρ ≈ −0.29) | Lower N → better |
| **Value & life-goal congruence** (kids, religion, money, location) | Schwartz (1992); deal-breaker literature | Aligned → better |
| **Constructive conflict / absence of contempt** | Gottman (e.g., Gottman & Levenson, 1992) | Fewer "Four Horsemen" → better |
| **Perceived partner responsiveness** | Reis, Clark & Holmes (2004); Joel et al. (2020) | Higher → better (but emerges in-relationship) |
| **Self-expansion / shared novelty potential** | Aron et al. (2000) | Higher → better |
| **Shared *intent* and commitment** | Joel et al. (2020): perceived commitment was a top predictor | Matched → better |

**What is over-hyped or non-predictive (down-weight or flag):**

- **Trait *similarity* (Big Five) does not reliably predict satisfaction.** Dyrenforth et al. (2010) found *actor* and *partner* effects but **no consistent similarity effect** across three large national samples. Montoya, Horton & Kirchner (2008) found actual similarity drives *initial* attraction but **its effect vanishes in established relationships**; perceived similarity is what persists.
- **Love Languages matching is popular but empirically weak.** Impett, Park & Muise (2024, *Current Directions in Psychological Science*) found little support for the three core claims (one preferred language; exactly five; matching improves satisfaction). People appreciate *all* expressions of love; **responsiveness**, not language-matching, predicts satisfaction.
- **Complementarity ("opposites attract") has little support** as a satisfaction predictor (Montoya et al., 2008).

---

## 2. Core Dimensions to Measure

For each dimension: definition, why it matters, the research, and how to elicit it in onboarding. Established scales are referenced; we recommend **short, validated subsets** to keep onboarding under ~5–7 minutes.

### 2.1 Attachment Style (secure / anxious / avoidant / disorganized)

**Definition.** A person's characteristic expectations and behaviors regarding intimacy, dependence, and responsiveness, organized along two continuous dimensions: **attachment anxiety** (fear of abandonment, need for reassurance) and **attachment avoidance** (discomfort with closeness/dependence). The four "styles" are quadrants: **secure** (low/low), **anxious-preoccupied** (high anxiety), **dismissive-avoidant** (high avoidance), **fearful-avoidant/disorganized** (high/high).

**Why it matters.** Romantic love operates through the same attachment system as infant–caregiver bonding (Bowlby; Hazan & Shaver, 1987). Secure individuals form more stable, satisfying, longer-lasting relationships. Joel et al. (2020) found attachment anxiety and avoidance among the **strongest individual-difference predictors** of (lower) relationship quality.

**Measurement.** The gold standard is the **Experiences in Close Relationships–Revised (ECR-R; Fraley, Waller & Brennan, 2000)** — 36 items, two 18-item subscales. For onboarding, use a validated short form (e.g., ECR-R-10 or ECR-S, ~10–12 items), 7-point agree/disagree.

**Sample items (1 = strongly disagree … 7 = strongly agree):**
- *Anxiety:* "I worry that romantic partners won't care about me as much as I care about them." / "I need a lot of reassurance that I am loved by my partner."
- *Avoidance:* "I prefer not to show a partner how I feel deep down." / "I find it difficult to allow myself to depend on romantic partners." (reverse-scored security items included)

**Scoring use.** Compute continuous anxiety & avoidance scores per user. **Secure ⨉ secure is the safest pairing.** Two highly anxious, or anxious ⨉ avoidant ("pursue–withdraw"), pairings carry elevated risk and should be *down-weighted or flagged*, not hard-blocked (people grow; framing matters).

### 2.2 Big Five Personality (similarity vs complementarity)

**Definition.** Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism (Costa & McCrae, 1992).

**Why it matters — and the honest caveat.** What matters is mostly the **level** of certain traits, not the *match*:
- **Actor effect** (your own traits): high Agreeableness, high Conscientiousness, and **low Neuroticism** predict your own satisfaction (Dyrenforth et al., 2010).
- **Partner effect** (your partner's traits): being with a low-Neuroticism, agreeable, conscientious partner predicts *your* satisfaction.
- **Similarity effect: essentially null.** Dyrenforth et al. (2010) found no reliable incremental benefit of personality similarity across three national samples. Do **not** build the core score on "we're so alike."

**Measurement.** **BFI-10** (Rammstedt & John, 2007; 2 items/trait) for speed, or **BFI-2-S** (30 items) for richer Neuroticism/Agreeableness resolution.

**Sample items ("I see myself as someone who…", 1–5):**
- N: "…gets nervous easily" / "…is relaxed, handles stress well" (R)
- A: "…is considerate and kind to almost everyone"
- C: "…tends to be disorganized" (R)

**Scoring use.** Use **partner trait *levels*** (esp. low Neuroticism, high Agreeableness) as a mild *quality* signal, not a *match* signal. Allow modest **complementarity only on Extraversion** if at all (weak evidence) and treat extreme Neuroticism gaps as a stability flag.

### 2.3 Core Values & Life Goals Alignment

**Definition.** Trans-situational guiding principles. Use **Schwartz's (1992) theory of 10 basic values** (self-direction, stimulation, hedonism, achievement, power, security, conformity, tradition, benevolence, universalism), plus **concrete life-goal items** the app cares about: children (want/timing/number), religion & observance, money/lifestyle, geography/relocation, career centrality, family-of-origin closeness.

**Why it matters.** Value and goal *conflict* is a reliable, predictable relationship killer and a classic **deal-breaker** domain (Jonason et al., 2015). Unlike personality, **congruence here genuinely matters** because incompatible concrete goals (kids vs no-kids) cannot be averaged away. This is the most defensible "similarity" dimension.

**Measurement.** Short **PVQ (Portrait Values Questionnaire)** subset for abstract values (~10–15 items), plus a structured **life-goals grid** for concrete items (single-select / sliders), and an explicit **flexibility rating** ("How firm is this for you?" 1 = open … 5 = non-negotiable).

**Sample items:**
- Values (PVQ, "How much is this person like you?"): "It's important to her to have a stable government and safety" (security/tradition) / "She likes surprises and seeks new experiences" (stimulation).
- Goals: "Do you want children?" {Yes / No / Open / Have & want more / Have & done}; "How important is religion in your daily life?" (1–5); "Willing to relocate for a partner?" {No / Within region / Anywhere}.

**Scoring use.** **Hard filters** on declared non-negotiables (Section 2.9). **Soft congruence** score on values + flexible goals. This is the highest-weight *similarity* component.

### 2.4 Conflict Style & Communication (Gottman)

**Definition.** How a person handles disagreement. Gottman's **"Four Horsemen"** — **criticism, contempt, defensiveness, stonewalling** — index destructive conflict; **repair attempts** and a high **positive-to-negative ratio (~5:1)** index constructive conflict.

**Why it matters.** In Gottman & Levenson's observational work, contempt-laden interaction patterns predicted divorce with high accuracy in their samples. **Important honesty caveat:** the famous "90%+ accuracy" figures come from *predicting within already-recruited couples observed interacting*, often with **post-hoc model fitting**, and have been criticized for over-stated predictive power and limited prospective replication. We **cannot** observe two strangers interacting at onboarding, so we measure *self-reported conflict tendencies* as a weak proxy and treat it accordingly.

**Measurement.** A short conflict-tendency self-report; optionally a **scenario/SJT item** ("Your partner forgets something important to you. What's closest to your reaction?").

**Sample items (1–5 frequency):**
- "When we disagree, I tend to point out what's wrong with my partner as a person." (contempt/criticism proxy, R)
- "When things get heated, I shut down or walk away." (stonewalling proxy)
- "After an argument I make an effort to reconnect / smooth things over." (repair, positive)

**Scoring use.** Use as an **individual quality flag**: high contempt/stonewalling proneness lowers an internal "relational readiness" score and can power coaching nudges. Do **not** present as a hard couple-level prediction.

### 2.5 Emotional Intelligence / Empathy & Responsiveness

**Definition.** Ability to perceive, understand, and regulate emotions (one's own and others') and to respond supportively. The relationship-science workhorse is **perceived partner responsiveness (PPR)** — feeling understood, validated, and cared for (Reis, Clark & Holmes, 2004).

**Why it matters.** PPR is a core engine of intimacy and predicts satisfaction, trust, and commitment (Reis et al., 2004; Gable & Reis, 2010). Joel et al. (2020) found appreciation and perceived partner satisfaction among the very top predictors — both downstream of responsiveness. Empathy also underlies the *repair* capacity that buffers conflict.

**Measurement.** Trait empathy/EI short scale + a responsiveness-disposition self-report (since PPR itself only exists inside a relationship).

**Sample items (1–5):**
- "I can usually tell how someone is feeling even when they don't say it." (empathic accuracy)
- "When someone shares good news, I genuinely celebrate with them." (capitalization/responsiveness — Gable et al., 2006)
- "I find it easy to put aside my own view to understand my partner's." (perspective-taking)

**Scoring use.** Feeds the **individual "relational readiness"** signal and pairs well as a *quality* (level) factor rather than a similarity factor.

### 2.6 Self-Expansion Potential & Shared Novelty (Aron)

**Definition.** The motivation to grow the self by including a partner's perspectives, resources, and identities; relationships thrive on **shared novel, exciting activities** (self-expansion model; Aron & Aron, 1986).

**Why it matters.** Aron et al. (2000, *JPSE*) showed couples who did **novel/arousing activities** together reported higher relationship quality immediately after, vs. mundane-activity controls — a rare *experimental* causal demonstration in this field. Self-expansion combats the boredom that erodes long-term satisfaction.

**Measurement.** Personal expansion tendency + overlap of growth-oriented interests.

**Sample items (1–5):**
- "I'm always looking to learn new things and have new experiences." (trait self-expansion)
- "An ideal partner is someone who broadens my horizons and introduces me to new things."
- Interest grid: select novelty-oriented shared activities (travel, learning, adventure, creative pursuits).

**Scoring use.** **Complementarity-friendly**: some *difference* in interests (with overlapping appetite for novelty) is a feature — it creates expansion opportunity. Score on *shared appetite for novelty* + *non-trivial-but-bridgeable interest overlap*.

### 2.7 Love Languages — Include Only With an Explicit Caveat

**Definition.** Chapman's popular framework: words of affirmation, quality time, acts of service, gifts, physical touch.

**The honest verdict.** Impett, Park & Muise (2024) reviewed the evidence and found **weak support** for the core claims. People value *all* five; the categories overlap; and **matching partners' languages does not reliably improve satisfaction** — *responsiveness* does. 

**Recommendation.** Use love languages **only as an engagement/UX feature** ("how you like to give and receive affection"), framed honestly, **not as a scored matching dimension**. If included in onboarding, label it explicitly as preference-sharing, not a compatibility predictor. This protects scientific credibility.

### 2.8 Sexual & Physical Compatibility Expectations (handled tastefully)

**Definition.** Alignment of expectations around physical intimacy, sexual frequency/importance, and affection — at the level of **values and expectations**, not explicit content.

**Why it matters.** **Sexual satisfaction** was among the strongest relationship-specific predictors in Joel et al. (2020); it is the "passion" leg of Sternberg's (1986) **Triangular Theory of Love** (intimacy + passion + commitment = consummate love). Mismatched expectations (e.g., very high vs very low importance) is a known deal-breaker domain (Jonason et al., 2015).

**Measurement (tasteful, expectations-level, 1–5 or categorical):**
- "How important is physical intimacy to you in a committed relationship?"
- "How much physical affection (hugs, hand-holding) do you like day-to-day?"
- "It's important that a partner and I share similar views on intimacy and its role in our relationship." (agree/disagree)

**Scoring use.** **Similarity/expectation-match** on *importance* and *affection style*; large gaps lower compatibility and can trigger gentle disclosure prompts. Keep all copy respectful and non-explicit; this is a serious-intent product.

### 2.9 Deal-Breakers / Non-Negotiables

**Definition.** Traits or circumstances a user will not accept (e.g., wants kids vs doesn't; smoking; core religious requirement; geography).

**Why it matters.** **Negative information is weighted more heavily than positive** in mate choice, especially for **long-term** relationships (Jonason, Garcia, Webster, Li & Fisher, 2015; ~6,500 participants). Honoring deal-breakers prevents predictable mismatches and respects user autonomy.

**Measurement.** An explicit **non-negotiables module**: user selects hard constraints and marks each as hard vs strong-preference.

**Scoring use.** **Hard filters** (exclude from candidate pool) for declared *hard* constraints; **strong penalties** (not exclusion) for strong-preferences. Always make these user-editable and transparent.

---

## 3. Proposed Compatibility Scoring Model

### 3.1 Design principles

1. **Two-stage architecture.** **Stage A — eligibility filter** (hard deal-breakers, intent match). **Stage B — graded compatibility score** on the surviving pool. Never let Stage B "buy back" a hard deal-breaker.
2. **Similarity vs complementarity, assigned per dimension** (per the evidence above), not globally.
3. **Honest weighting.** Heaviest weight on dimensions with the strongest evidence (values/goals, attachment, intent) and *quality/level* effects; light weight on weak ones (trait similarity, love languages = 0).
4. **Explainable by construction.** The score is a transparent weighted sum of named sub-scores, so the UI can say *why*.

### 3.2 Dimension treatment

| Dimension | Treated as | Rationale |
|---|---|---|
| Deal-breakers / non-negotiables | **Hard filter** | Jonason et al. (2015) |
| Core values & life goals | **Similarity (congruence)** | Schwartz (1992); goal conflict is fatal |
| Intent / commitment match | **Similarity (match)** | Joel et al. (2020) |
| Attachment | **Quality + risk pattern** (favor secure; flag anxious⨉avoidant) | Hazan & Shaver (1987) |
| Big Five | **Partner-trait *level*** (low N, high A/C); similarity ≈ 0 | Dyrenforth et al. (2010) |
| Conflict/communication | **Individual quality (level)** | Gottman; treat as proxy |
| EI / empathy / responsiveness | **Individual quality (level)** | Reis et al. (2004) |
| Self-expansion & novelty | **Complementarity + shared appetite** | Aron et al. (2000) |
| Sexual/physical expectations | **Similarity (expectation match)** | Joel et al. (2020); Sternberg (1986) |
| Love languages | **Excluded from score** (UX only) | Impett et al. (2024) |

### 3.3 Suggested pseudo-formula

```text
# ---------- STAGE A: ELIGIBILITY (binary gate) ----------
eligible(A, B) =
      no_hard_dealbreaker_violation(A, B)        # kids, religion-floor, geography, smoking, etc.
  AND intent_compatible(A, B)                    # both serious-intent / same relationship goal
# If not eligible -> not shown as a "match" (may appear with explicit caveat, never scored high)

# ---------- STAGE B: COMPATIBILITY SCORE (0–100) on eligible pairs ----------
Compatibility =
    0.28 * ValuesGoalCongruence(A, B)        # similarity; strongest defensible matcher
  + 0.18 * IntentCommitmentMatch(A, B)       # similarity/match
  + 0.16 * AttachmentSynergy(A, B)           # secure-favoring; penalize anxious×avoidant
  + 0.12 * PartnerQuality(A, B)              # level: low Neuroticism, high Agree/Consc, empathy/EI, low contempt
  + 0.10 * SexualExpectationMatch(A, B)      # similarity of importance/affection style
  + 0.10 * SelfExpansionFit(A, B)            # shared novelty appetite + bridgeable interest diversity
  + 0.06 * SoftPreferenceFit(A, B)           # strong-but-not-hard preferences
#  + 0.00 * LoveLanguageMatch               # intentionally zero-weighted

# Component definitions (illustrative)
ValuesGoalCongruence  = weighted_agreement(values_PVQ, life_goal_grid)        # 1 - normalized distance
AttachmentSynergy     = f(secure_bonus, anxiety_penalty, anxious_x_avoidant_penalty)
PartnerQuality        = mean( z(low_neuroticism), z(agreeableness), z(conscientiousness),
                              z(empathy/EI), z(low_contempt_proneness) )      # symmetric, both directions
SelfExpansionFit      = g( min(novelty_appetite_A, novelty_appetite_B),       # both must want growth
                           interest_overlap ∈ "sweet spot" )                  # not identical, not disjoint
```

**Notes for implementers.**
- Normalize each component to **0–1**, then scale to 0–100. Weights are a **starting hypothesis** — calibrate against real outcome data (mutual likes → conversations → reported satisfaction at 1/3/6 months) and **re-fit honestly**; do not freeze marketing-driven weights.
- **Asymmetry:** some components are directional (A's attachment anxiety affects B differently). Score both directions and combine (e.g., min or mean) so one partner's risk isn't hidden.
- **Confidence band:** attach a confidence to each score based on completeness/consistency of responses. Show wide bands rather than false precision.

### 3.4 Explainability (the "why you matched" layer)

Because the score is a named weighted sum, generate a plain-language rationale from the top contributing components, e.g.:

> "You and Maya align strongly on **what you want from life** (both prioritize family and stability, both want children in the next few years) and on **how you handle closeness** (you're both comfortable depending on a partner). You also share an **appetite for new experiences** while bringing different interests — good fuel for growth together."

And state limits plainly:

> "Compatibility is a starting point, not a guarantee — what matters most is how you treat each other over time."

---

## 4. Detecting Low-Intent ("time-pass") vs Serious-Intent Users

Serious-intent matching depends on *both* people wanting the same thing. Combine **declared**, **questionnaire-consistency**, and **behavioral** signals. Use a continuous **Intent Score**, not a label, and never publicly shame users.

**Declared / questionnaire signals**
- Explicit stated goal (marriage / long-term / exploring / casual) and **timeline**.
- **Completion depth:** serious users complete more of the values/goals/deal-breakers modules; abandoning the non-negotiables module is a soft low-intent signal.
- **Consistency / effort:** straight-lining (all same answer), near-instant completion, contradictory answers (declares "want marriage soon" + "relocation: never" + extremely narrow filters) lower intent confidence.

**Behavioral signals (post-onboarding)**
- **Conversation depth & reciprocity:** initiating, asking questions, sustained threads → high intent; one-word replies, ghosting, mass-identical openers → low.
- **Profile investment:** verified photos, completed prompts, thoughtful free-text.
- **Selectivity vs. spray:** indiscriminate right-swiping/liking everyone correlates with lower serious intent.
- **Off-platform progression:** willingness to schedule calls/dates (a *positive* serious-intent signal) vs. perpetual chat with no progression.
- **Report/block patterns:** received reports for inappropriate/sexual messaging on a serious-intent product → strong low-intent (and safety) signal.

**How to use it**
- Feed Intent Score into **ranking** (boost high-intent matches for high-intent users; matched-intent pairing).
- Trigger **gentle interventions** (re-confirm goals, complete missing modules) rather than bans.
- **Bidirectional matching:** a very serious user should not be flooded with low-intent profiles, and vice versa.
- **Privacy & fairness:** behavioral inference must be transparent in the privacy policy; avoid penalizing slow responders for legitimate reasons (busy, neurodivergent communication styles). Keep humans in the loop for any account action.

---

## 5. Ethical Guardrails

**5.1 Don't over-claim (the core scientific-integrity rule).**
- The evidence (Finkel et al., 2012; Joel et al., 2020) says **we cannot predict that two strangers will have a lasting, satisfying relationship.** Marketing and UI must reflect this. Use language like "**aligned on what matters**" and "**a strong starting point**," never "scientifically guaranteed soulmate" or "98% compatible."
- Show **confidence/uncertainty**, not false precision. Avoid a single magic percentage presented as destiny.

**5.2 Avoid discrimination and bias.**
- **Never** use protected attributes (race, caste, ethnicity, disability, sexual orientation, religion *as a sorting axis beyond user-declared mutual preference*) as engine inputs in ways that produce discriminatory outcomes. Religion can be a *user's own declared non-negotiable*, but the platform must not systemically disadvantage groups.
- **Audit for disparate impact:** regularly check match-rate and visibility distributions across demographic groups; correct algorithmic amplification of bias (e.g., feedback loops from biased swipe data).
- Beware proxies (zip code → race/class). Personality/attachment items must be validated for cross-cultural fairness before weighting heavily — many scales were validated on WEIRD samples.

**5.3 Respect the limits of prediction.**
- Position the engine as a **filter + facilitator**, not an oracle. Most variance in relationship success is **dyadic, circumstantial, and emergent** (stress, life events, growth) — unmeasurable at onboarding.
- Provide **graceful failure** framing: a low score means "less obvious alignment," not "you will fail."

**5.4 Frame astrology responsibly alongside real psychology.**
- **Astrology has no peer-reviewed predictive validity for relationship outcomes.** It is included as **cultural narrative, ritual, and meaning-making**, which users value — but it must be **clearly demarcated** from the psychology-based engine.
- **Hard rule:** the karmic/astrology layer is **cosmetic** — it may theme, narrate, and engage, but it **must not alter the compatibility score or override deal-breakers.** Keep the two pipelines separate in code and explainable in the UI ("Your *Soul Story* is for inspiration; your *Alignment Score* is based on relationship psychology").
- Use honest copy: "for entertainment and reflection." Do not present horoscope-based claims as evidence. This protects vulnerable users from making major life decisions on pseudoscience.

**5.5 Data ethics.** Sensitive data (attachment, sexuality, religion, mental-health-adjacent items) requires explicit consent, minimization, strong security, and the right to delete. Never sell or expose raw psychometric profiles.

---

## 6. Onboarding Questionnaire Blueprint (~32 items)

Target time ~5–7 min. Scales: 7-pt for attachment, 5-pt Likert otherwise, categorical for goals. Each item maps to a dimension and a scoring use. (Reverse-scored items marked R.)

| # | Item (abbreviated) | Dimension | Scoring use |
|---|---|---|---|
| 1 | What kind of relationship are you looking for? {marriage / long-term / exploring} | Intent | Stage A gate + Intent Score |
| 2 | Ideal timeline for a serious commitment? | Intent | Intent Score |
| 3 | "I worry a partner won't care about me as much as I care about them." | Attachment-anxiety | AttachmentSynergy |
| 4 | "I need a lot of reassurance that I'm loved." | Attachment-anxiety | AttachmentSynergy |
| 5 | "I get upset when a partner wants more closeness than I'm comfortable with." | Attachment-avoidance | AttachmentSynergy |
| 6 | "I find it hard to depend on a partner." | Attachment-avoidance | AttachmentSynergy |
| 7 | "I'm comfortable sharing my deep feelings with a partner." (R-avoid) | Attachment-security | AttachmentSynergy |
| 8 | "I'm comfortable having others depend on me." (R-avoid) | Attachment-security | AttachmentSynergy |
| 9 | "I get nervous or anxious easily." | Big Five: Neuroticism | PartnerQuality (level) |
| 10 | "I stay calm under stress." (R) | Big Five: Neuroticism | PartnerQuality |
| 11 | "I'm considerate and kind to almost everyone." | Big Five: Agreeableness | PartnerQuality |
| 12 | "I follow through on my commitments." | Big Five: Conscientiousness | PartnerQuality |
| 13 | "I enjoy new experiences and ideas." | Big Five: Openness / self-expansion | SelfExpansionFit |
| 14 | "I'm outgoing and sociable." | Big Five: Extraversion | mild complementarity (optional) |
| 15 | Do you want children? {yes/no/open/have+want more/have+done} | Values/Goals (deal-breaker) | Stage A filter + congruence |
| 16 | How firm is your answer on children? (1 open – 5 non-negotiable) | Deal-breaker flexibility | Filter vs penalty |
| 17 | Importance of religion/spirituality in daily life (1–5) | Values/Goals | Congruence; possible filter |
| 18 | Need a partner who shares my faith? {no / preferred / required} | Deal-breaker | Filter/penalty |
| 19 | Attitude toward money: {save-focused … spend/experience-focused} (1–5) | Values/Goals | Congruence |
| 20 | Willingness to relocate for a partner? {no / region / anywhere} | Values/Goals (deal-breaker) | Filter + congruence |
| 21 | Career centrality vs. life balance (1–5) | Values/Goals | Congruence |
| 22 | "It's important to me to have stability and security." | Schwartz: security/tradition | Congruence |
| 23 | "I like surprises and seeking out new experiences." | Schwartz: stimulation | Congruence + SelfExpansionFit |
| 24 | "Helping others and fairness guide my choices." | Schwartz: benevolence/universalism | Congruence |
| 25 | "When we disagree, I criticize my partner as a person." (R) | Conflict: contempt/criticism | PartnerQuality (level) |
| 26 | "When things get heated, I shut down or walk away." (R) | Conflict: stonewalling | PartnerQuality |
| 27 | "After a fight, I try to reconnect and repair." | Conflict: repair (positive) | PartnerQuality |
| 28 | "I can usually sense how others feel without being told." | EI / empathy | PartnerQuality |
| 29 | "I find it easy to see a situation from my partner's view." | EI / perspective-taking | PartnerQuality |
| 30 | "An ideal partner broadens my horizons and shares new experiences with me." | Self-expansion | SelfExpansionFit |
| 31 | Interest grid (select activities you'd love to share) | Self-expansion / overlap | SelfExpansionFit (sweet-spot overlap) |
| 32 | Importance of physical intimacy in a committed relationship (1–5) | Sexual/physical expectations | SexualExpectationMatch |
| 33 | Preferred level of everyday affection (1–5) | Sexual/physical expectations | SexualExpectationMatch |
| 34 | Non-negotiables module (multi-select + hard/strong tag) | Deal-breakers | Stage A filter / penalties |
| 35 | *(Optional, UX only)* How do you most like to give/receive affection? | Love languages | **Engagement only — not scored** |

*Consistency items (e.g., attention checks, response-time logging) run silently for the Intent/quality-confidence signal (Section 4).*

---

## 7. References

1. **Aron, A., & Aron, E. N. (1986).** *Love and the Expansion of Self: Understanding Attraction and Satisfaction.* Hemisphere/Harper & Row.
2. **Aron, A., Norman, C. C., Aron, E. N., McKenna, C., & Heyman, R. E. (2000).** Couples' shared participation in novel and arousing activities and experienced relationship quality. *Journal of Personality and Social Psychology, 78*(2), 273–284. https://psycnet.apa.org/record/2000-13327-007
3. **Bowlby, J. (1969/1982).** *Attachment and Loss, Vol. 1: Attachment.* Basic Books.
4. **Costa, P. T., & McCrae, R. R. (1992).** *Revised NEO Personality Inventory (NEO-PI-R).* Psychological Assessment Resources.
5. **Dyrenforth, P. S., Kashy, D. A., Donnellan, M. B., & Lucas, R. E. (2010).** Predicting relationship and life satisfaction from personality in nationally representative samples from three countries: Actor, partner, and similarity effects. *Journal of Personality and Social Psychology, 99*(4), 690–702. https://doi.org/10.1037/a0020385
6. **Finkel, E. J., Eastwick, P. W., Karney, B. R., Reis, H. T., & Sprecher, S. (2012).** Online dating: A critical analysis from the perspective of psychological science. *Psychological Science in the Public Interest, 13*(1), 3–66. https://journals.sagepub.com/doi/abs/10.1177/1529100612436522
7. **Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000).** An item response theory analysis of self-report measures of adult attachment (ECR-R). *Journal of Personality and Social Psychology, 78*(2), 350–365. ECR-R items: https://labs.psychology.illinois.edu/~rcfraley/measures/ecrritems.htm
8. **Gable, S. L., & Reis, H. T. (2010).** Good news! Capitalizing on positive events in an interpersonal context. *Advances in Experimental Social Psychology, 42*, 195–257.
9. **Gottman, J. M., & Levenson, R. W. (1992).** Marital processes predictive of later dissolution. *Journal of Personality and Social Psychology, 63*(2), 221–233. (Overview of "Four Horsemen": https://www.gottman.com/blog/the-four-horsemen-recognizing-criticism-contempt-defensiveness-and-stonewalling/)
10. **Hazan, C., & Shaver, P. (1987).** Romantic love conceptualized as an attachment process. *Journal of Personality and Social Psychology, 52*(3), 511–524. https://psycnet.apa.org/record/1987-19034-001
11. **Impett, E. A., Park, H. G., & Muise, A. (2024).** Popular psychology through a scientific lens: Evaluating love languages from a relationship science perspective. *Current Directions in Psychological Science, 33*(2). https://journals.sagepub.com/doi/10.1177/09637214231217663
12. **Joel, S., Eastwick, P. W., et al. (2020).** Machine learning uncovers the most robust self-report predictors of relationship quality across 43 longitudinal couples studies. *PNAS, 117*(32), 19061–19071. https://www.pnas.org/doi/10.1073/pnas.1917036117
13. **Jonason, P. K., Garcia, J. R., Webster, G. D., Li, N. P., & Fisher, H. E. (2015).** Relationship dealbreakers: Traits people avoid in potential mates. *Personality and Social Psychology Bulletin, 41*(12), 1697–1711. https://journals.sagepub.com/doi/full/10.1177/0146167215609064
14. **Montoya, R. M., Horton, R. S., & Kirchner, J. (2008).** Is actual similarity necessary for attraction? A meta-analysis of actual and perceived similarity. *Journal of Social and Personal Relationships, 25*(6), 889–922. https://journals.sagepub.com/doi/10.1177/0265407508096700
15. **Rammstedt, B., & John, O. P. (2007).** Measuring personality in one minute or less: A 10-item short version of the Big Five Inventory (BFI-10). *Journal of Research in Personality, 41*(1), 203–212.
16. **Reis, H. T., Clark, M. S., & Holmes, J. G. (2004).** Perceived partner responsiveness as an organizing construct in the study of intimacy and closeness. In *Handbook of Closeness and Intimacy.* https://www.sas.rochester.edu/psy/people/faculty/reis_harry/assets/pdf/ReisClarkHolmes_2004.pdf
17. **Schwartz, S. H. (1992).** Universals in the content and structure of values: Theoretical advances and empirical tests in 20 countries. *Advances in Experimental Social Psychology, 25*, 1–65. Overview: https://scholarworks.gvsu.edu/cgi/viewcontent.cgi?article=1116&context=orpc
18. **Sternberg, R. J. (1986).** A triangular theory of love. *Psychological Review, 93*(2), 119–135. http://www.robertjsternberg.com/love

---

*Document maintained by the research team. Treat all weights and thresholds as hypotheses to be validated against real outcome data, and revisit annually as the literature evolves.*
