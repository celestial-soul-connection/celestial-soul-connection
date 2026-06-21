# Data Privacy & Compliance Playbook — Celestial Soul Connection

**Scope:** A dating / matrimonial mobile app using astrology (Kundali) matching. It processes **highly sensitive personal data**: full birth details (date, **exact time**, and **place of birth**), sexual orientation, religion, photos, chat messages, precise location, KYC documents, and payment data. Primary market: **India**. Secondary goal: compliance for **EU/UK and US (California)** users.

**Last updated:** 2026-06-21 · **Status:** Living document; backbone for a reusable compliance skill.

> **Legal disclaimer:** This is an engineering/compliance reference, not legal advice. The DPDP Rules, 2025 were notified on **13–14 November 2025** with **phased deadlines into May 2027**; several mechanics (Consent Manager registration, SDF designation, localisation "negative list") are still being operationalised. Validate against the official Gazette text and obtain Indian + EU counsel sign-off before launch.

---

## 0. TL;DR — What makes THIS app high-risk

1. **Birth date + exact birth time + birth place** is effectively a quasi-identifier and reveals **age, religion/culture, and location** — treat as sensitive.
2. **Sexual orientation + religion** are **GDPR Article 9 "special category" data** and **CCPA "sensitive personal information"** → require **explicit, opt-in** consent and use-limitation.
3. **Dating apps targeting intimate/marginalised data have a record of regulator action** (Grindr: €6.5M/$7.1M GDPR fine + FTC scrutiny for sharing sexual-orientation/HIV data). Bar is higher, not lower.
4. **Dating apps must be 18+**, which neatly **side-steps DPDP's hardest problem** (verifiable parental consent for minors) — *if and only if* you enforce real age-gating. See §1.7.
5. India's DPDP doesn't have a "sensitive data" tier, but you should **voluntarily treat birth/orientation/religion data as sensitive** and apply field-level encryption + strict access control (§6).

---

# PART A — JURISDICTIONAL REQUIREMENTS

## 1. INDIA — Digital Personal Data Protection (DPDP) Act, 2023 + DPDP Rules, 2025

**Statute:** The Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023). Official text (MeitY): https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
**Rules:** Digital Personal Data Protection Rules, 2025 — **notified 13–14 Nov 2025**. PIB notification PDF: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf

Your role under the Act: you are a **Data Fiduciary** (determine purpose & means of processing). Your users are **Data Principals**. Any cloud/SMS/analytics vendor acting on your instructions is a **Data Processor**.

### 1.1 Notice (Section 5 + Rules)
Before/at the time of seeking consent you must give a **clear, plain-language notice** that states:
- The **personal data** to be collected and the **specific purpose** of processing.
- **How to exercise rights** (withdraw consent, file a grievance, complain to the Data Protection Board).
- A **dedicated link/means to withdraw consent** — must be **as easy to withdraw as to give**.
- Contact details of the person who can answer questions (DPO/contact).
- Notice should be **available in English and the languages of the Eighth Schedule** of the Constitution where appropriate.
- Notice must be **standalone** and understandable on its own (don't bury it in 40-page T&Cs).

### 1.2 Consent (Section 6)
Consent must be **free, specific, informed, unconditional, unambiguous, with a clear affirmative action**, and **limited to what is necessary** for the stated purpose. Key engineering implications:
- **No pre-ticked boxes, no bundling.** One consent ≠ all purposes. Each purpose needs its own affirmative toggle (see consent model §9).
- **"Unconditional"** = you cannot deny core service for refusing *non-essential* processing (e.g., marketing/analytics).
- **Withdrawable** at any time, as easily as given; on withdrawal you must **stop processing** within a reasonable time and cause your processors to do the same. Withdrawal is **not retroactive** (past lawful processing stays valid).
- **Burden of proof is on you** (the Fiduciary) to show valid notice + consent were obtained → **you must keep a consent ledger** (§6.3).

### 1.3 "Legitimate uses" (Section 7)
A narrow set of consent-exempt grounds (e.g., voluntarily provided data for a requested purpose, legal obligations, medical/disaster). **For a dating app, almost everything runs on consent**, not legitimate use. Do not over-rely on Section 7.

### 1.4 Data Principal rights (Sections 11–14)
You must build self-service flows for:
- **Right to access** (S.11): summary of personal data processed, processing activities, and identities of other Fiduciaries/Processors it was shared with.
- **Right to correction, completion, updating & erasure** (S.12): on request you must correct/complete/update; and **erase** unless retention is legally required or still needed for the consented purpose.
- **Right to grievance redressal** (S.13): a readily available in-app grievance channel with a published response timeline; the Data Protection Board is the escalation, **after** exhausting your channel.
- **Right to nominate** (S.14): user can nominate someone to exercise their rights on **death or incapacity**. Build a "nominee" field + a documented handoff process.

### 1.5 Data Fiduciary obligations (Section 8)
- Maintain **accuracy/completeness** of data used for decisions affecting the principal.
- Implement **reasonable security safeguards** to prevent breach (encryption, access control, logging — see §6).
- **Erase data** when the purpose is served / consent withdrawn, unless legal retention applies.
- **Retention limits (Rules):** personal data should not be retained beyond **purpose fulfilment**; the Rules require erasure when a defined period of **user inactivity** lapses (general benchmark **~1 year of inactivity** for certain classes of fiduciaries, unless legally required), with **advance notice (≈48 hours)** to the user before inactivity-based erasure. Validate the exact class/period against the notified Rules for your category.
- **Grievance redressal** mechanism + published timelines.
- Use **Processors only under contract**.

### 1.6 Consent Managers (Section 6(7)–(9) + Rule 4 / First Schedule)
- A **Consent Manager (CM)** is a Board-registered intermediary that lets users **give/manage/review/withdraw** consent across fiduciaries via an interoperable dashboard.
- CM must be an **India-incorporated company**, **min net worth ₹2 crore**, must keep data **unreadable to itself**, log all consent activity, give users machine-readable access, and **retain records ≥7 years**.
- **Registration framework (Rule 4) commences ~13 Nov 2026.** For now, design your in-app consent so it can **later interoperate** with a CM (stable consent IDs, machine-readable export).

### 1.7 Children's data (Section 9 + Rule 10) — and why it MATTERS for a dating app
- Processing data of anyone **under 18** requires **verifiable parental consent**, and you must **not** do tracking, behavioural monitoring, profiling, or **targeted advertising to children**.
- Approved verification (Rules) leans on **reliable identity documents / DigiLocker-verified credentials** to confirm the parent's identity and the parent–child relationship.
- **Implication for this app:** Verifiable parental consent for under-18s is operationally hard and reputationally toxic for a dating product. **The correct design is to prohibit under-18 use entirely** and enforce **robust 18+ age-gating** (self-declared DOB **plus** birth-date cross-check against KYC, plus blocking/deleting on detection). Document this as your basis for **not** processing children's data. Treat any detected minor account as a **mandatory immediate deletion** event.

### 1.8 Significant Data Fiduciary (SDF) (Section 10 + Rules 12–13)
The Central Government may **designate** you an SDF based on volume + sensitivity of data, risk to principals, etc. Given you process **sexual orientation, religion, precise location, and birth data at scale**, **assume you are a likely SDF candidate** and pre-build:
- Appoint a **Data Protection Officer (DPO) based in India**, reporting to the board/senior management; publish DPO contact.
- **Data Protection Impact Assessment (DPIA)** + **independent data audit**, **every 12 months**, with a report of key findings to the Board.
- **Algorithmic due diligence**: ensure your matching/recommendation systems don't create risks to principals' rights.
- Comply with any **data-localisation** restrictions on specified data classes.
- **SDF obligations are enforceable from ~13 May 2027** — build now, certify later.

### 1.9 Breach notification (Rules)
On becoming aware of a **personal data breach** (DPDP defines breach broadly — any unauthorised processing/loss/disclosure, **regardless of severity**):
- **Notify affected Data Principals "without delay"**, in plain language, including: nature/extent/timing of breach, likely consequences, mitigation taken, recommended user safety steps, and a contact person.
- **Notify the Data Protection Board**: an **initial intimation without delay**, then a **detailed report within 72 hours** (circumstances, who was responsible, remediation, and confirmation that principals were notified).
- **Penalty for breach-notification failure: up to ₹200 crore.**

### 1.10 Cross-border transfer (Section 16 + Rules)
- **"Negative list" / blacklist model**: transfers outside India are **permitted by default**, **except** to countries/territories the Central Government **restricts** by notification.
- **Specified classes** of personal data may be subject to **localisation** (stay in India) — to be notified, and especially relevant to SDFs.
- **Action:** keep a **data-residency map** of every vendor/region; design so sensitive fields can be **pinned to India** if localisation lands.

### 1.11 Penalties (Schedule 1)
Financial penalties imposed by the Data Protection Board, including:
- **Up to ₹250 crore** — failure to take **reasonable security safeguards** to prevent breach.
- **Up to ₹200 crore** — failure of **breach notification**; failure re **children's data** obligations.
- **Up to ₹150 crore** — failure of **SDF** additional obligations.
- Lesser amounts for other breaches; **₹10,000** penalty on a Data Principal for frivolous/false complaints.
- **Full penalties / Schedule-1 enforcement effective ~13 May 2027.**

### 1.12 What's still pending / to watch
- **Consent Manager registration** (Rule 4) live ~Nov 2026; core fiduciary obligations ~18 months from notification (~mid-2027).
- **SDF designation list** and the **localisation "negative list"** of countries / specified data classes are **not yet notified** — monitor.
- Exact **retention periods per class of fiduciary** to be confirmed against the notified Schedule.

---

## 2. Treat birth / orientation / religion as "sensitive" anyway

India's DPDP Act, **unlike GDPR, does NOT create formal "sensitive personal data" categories** — all "digital personal data" is treated under one regime. **However**, for this app you should **voluntarily classify the following as Sensitive** and apply elevated controls (field-level encryption, least-privilege access, no analytics/ad use, explicit opt-in, shortest retention):
- Date/**time**/place of birth (astrology + reveals age, location, often caste/community).
- **Sexual orientation** and partner-preference data.
- **Religion / community / caste / gotra** (common in matrimonial matching).
- **Health-adjacent** fields if collected (e.g., "manglik" status, diet, disability).
- **Precise location**, **chat content**, **KYC/ID documents**, **photos** (biometric-adjacent).

Rationale: (a) GDPR/CCPA *do* treat these as special; if you have any EU/US users you already owe explicit consent; (b) regulator and litigation history for dating apps is harsh; (c) "privacy by design" is cheaper than retrofitting.

---

## 3. EU / UK — GDPR (and UK GDPR)

Applies to **EU/UK users** (extraterritorial, Art. 3). Key obligations:

### 3.1 Lawful basis (Art. 6) + explicit consent for special data (Art. 9)
- Every processing needs an **Art. 6 lawful basis**. For a dating app, **consent** (Art. 6(1)(a)) and **contract** (6(1)(b)) dominate.
- **Sexual orientation, religious/philosophical beliefs, and health** are **Art. 9 "special category" data** → processing is **prohibited unless** an Art. 9 exception applies. The practical one here is **Art. 9(2)(a): explicit consent**. "Explicit" = an **express, affirmative statement** (e.g., a checkbox with specific text, not implied).
  - Art. 9 reference: https://gdpr-info.eu/art-9-gdpr/
  - **Birth date/place** are normal personal data; but birth time + religion + orientation combined can **reveal** special-category data → handle as special.
- **Lawfulness:** Grindr was fined for sharing orientation data without **valid explicit consent** (Norway DPA, ~€6.5M/$7.1M; Arts 6(1) & 9(1)). This is the canonical cautionary tale for your category.

### 3.2 Core principles & rights
- **Data minimisation** (Art. 5(1)(c)): collect only what matching needs. Don't collect birth *time* if you only do sun-sign matching; if you do full Kundali, justify it.
- **Privacy by design & by default** (Art. 25): privacy-protective defaults — non-essential toggles **off**, profiles **not public by default**, precise location **off** by default.
- **DPIA** (Art. 35): **mandatory** — you process special-category data **on a large scale**. Do it before launch and on major changes.
- **DSAR** (Arts 15–22): access, rectification, **erasure ("right to be forgotten")**, restriction, **data portability** (machine-readable export), objection. Respond **within 1 month**.
- **DPO** (Art. 37): likely **required** — core activity = large-scale processing of special categories.
- **Records of processing** (Art. 30).

### 3.3 Breach notification
- **Art. 33:** notify the supervisory authority **without undue delay, ≤72 hours** of awareness (unless unlikely to risk rights/freedoms), including nature of breach, categories/numbers affected, DPO contact, likely consequences, remedial actions. May be phased. https://gdpr-info.eu/art-33-gdpr/
- **Art. 34:** notify affected **data subjects without undue delay** when **high risk** to their rights/freedoms (very likely for orientation/intimate data).

### 3.4 International transfers (Chapter V, Arts 44–50)
- Transfers outside the EEA need a mechanism: **adequacy decision**, **Standard Contractual Clauses (SCCs, 2021 modules)** + **Transfer Impact Assessment**, or BCRs.
- Since your data lives partly in **India** (no EU adequacy decision for India), **EU→India transfers require SCCs + supplementary measures** (encryption, access controls, data-residency options).

---

## 4. US — CCPA / CPRA (California) + dating-app guidance

### 4.1 CCPA/CPRA
- **"Sensitive Personal Information" (SPI)** explicitly includes **sexual orientation, sex life, religious or philosophical beliefs, racial/ethnic origin, precise geolocation, contents of messages, biometric/genetic data, financial account access.** Your app collects most of these.
- Consumers have the **right to Limit Use & Disclosure of SPI** (a "Limit the Use of My Sensitive Personal Information" link/control) and the right to **opt out of sale/sharing** (honour **Global Privacy Control / GPC** signals).
- Other rights: **know/access, delete, correct, opt-out of sale/share, non-discrimination.**
- **New CCPA regs effective 1 Jan 2026** expand compliance (risk assessments, ADMT/automated decision-making, cybersecurity audits). https://oag.ca.gov/privacy/ccpa · https://cppa.ca.gov/faq.html
- Practical stance: **don't "sell" or "share" (cross-context behavioural advertising) any of this data.** That avoids most CCPA friction and aligns with GDPR/DPDP.

### 4.2 Dating-app-specific guidance & enforcement signal
- **FTC Act §5** (unfair/deceptive practices): apps serving intimate/marginalised data bear **heightened responsibility**; deceptive consent flows or undisclosed sharing = enforcement risk.
- **Lessons from Grindr** (GDPR fine + FTC/EPIC scrutiny): the settlement-style expectations are now a de-facto industry bar — **affirmative consent before any sharing of orientation/health data**, **annual third-party security audits**, **delete legacy sensitive datasets**. Bake these in.
- **Never** put orientation/religion/birth data into **ad SDKs, attribution SDKs, or third-party analytics**.

---

# PART B — IMPLEMENTATION (make this actionable)

## 5. Compliance checklist by feature

Legend: **[Consent]** needs explicit opt-in · **[Min]** data-minimisation · **[Sec]** security control · **[Ret]** retention rule · **[Audit]** must be logged.

### 5.1 Onboarding & age-gating
- [ ] Collect **DOB first**; **hard-block under-18** (no account creation). **[Min]**
- [ ] **Layered notice** at signup (plain-language, multilingual) before any consent. **[Consent]**
- [ ] **Cross-check declared DOB against KYC/ID** during verification; mismatch → block + delete. **[Sec][Audit]**
- [ ] Record **policy version + timestamp + consent IDs** at signup. **[Audit]**

### 5.2 Onboarding consent flow
- [ ] **Separate, un-bundled** consents per purpose (see §9). **No pre-ticked boxes.** **[Consent]**
- [ ] **Core service** consent (account, matching) separated from **non-essential** (marketing, analytics).
- [ ] App must **fully function** if user declines all non-essential consents (unconditional consent). **[Consent]**
- [ ] **Explicit** (express checkbox text) consent for **orientation, religion, birth data** — GDPR Art. 9. **[Consent]**
- [ ] Persist every grant/decline to the **consent ledger** (§6.3). **[Audit]**

### 5.3 Granular consent toggles (settings)
- [ ] A **Privacy Center** screen listing every purpose with **independent toggles**, each showing status + last-changed date. **[Consent]**
- [ ] **Withdraw = as easy as grant** (one tap), takes effect promptly, propagates to processors. **[Consent]**
- [ ] Withdrawal triggers downstream **stop-processing + erasure** workflow where applicable. **[Audit]**

### 5.4 Birth-data handling (DOB / time / place — astrology)
- [ ] Collect birth **time/place only if** full Kundali matching is actually used; otherwise omit. **[Min]**
- [ ] Store birth fields with **field-level / application-layer encryption** (separate key). **[Sec]**
- [ ] **Never** send birth data to analytics/ad/3rd-party SDKs. **[Min][Sec]**
- [ ] Astrology compute should run on **pseudonymised** records where possible. **[Sec]**

### 5.5 Photo / KYC verification
- [ ] Treat ID docs + selfies as **sensitive**: encrypted at rest, **strict least-privilege** access, short retention. **[Sec][Ret]**
- [ ] Use KYC **only** for age/identity verification, not marketing. **[Min]**
- [ ] **Delete raw ID documents** once verification status is recorded (keep a verified-flag + hash, not the doc) per a defined TTL. **[Ret]**
- [ ] If face-matching used → that's **biometric** (GDPR Art. 9 / CCPA SPI): explicit consent + clear retention. **[Consent]**
- [ ] Watermark/limit profile-photo download; block screenshot where feasible. **[Sec]**

### 5.6 Chat / messaging
- [ ] **Encrypt messages in transit (TLS) and at rest**; consider **E2E or field-level encryption** for message bodies. **[Sec]**
- [ ] **"No phone-number / external-contact sharing" enforcement**: regex/ML filter for phone numbers, emails, social handles, "WhatsApp me", UPI IDs, etc. → mask/block + warn, until the paid contact-share feature is used. **[Min][Audit]**
- [ ] Log only **metadata needed for safety/abuse** (not full content) for moderation; document retention. **[Ret]**
- [ ] Provide **in-chat report/block**; preserve evidence for reported messages under a defined legal-hold TTL. **[Audit][Ret]**

### 5.7 Contact-sharing paid feature
- [ ] Sharing a user's real contact details requires **explicit, specific consent from BOTH parties** at the moment of share — not a blanket signup consent. **[Consent][Audit]**
- [ ] Log who shared what, with whom, when (consent ledger). **[Audit]**
- [ ] Allow **revocation** of a previously shared contact going forward.
- [ ] Don't expose contact info server-side to staff beyond least-privilege. **[Sec]**

### 5.8 Reporting / offboarding defaulters & abusers
- [ ] When you **ban/offboard** a user (fraud, harassment, payment default), define **what data you keep and why** (fraud-prevention / legal claim) vs. **erase**. Document the lawful basis. **[Ret]**
- [ ] Maintain a **minimal blocklist** (hashed identifiers) to prevent re-registration — store hashes, not full PII. **[Min][Sec]**
- [ ] Honour **erasure requests** even from banned users, except data under legal retention. **[Ret]**

### 5.9 Payments
- [ ] Use a **PCI-DSS-compliant** payment gateway; **never store raw card/UPI data** — tokenise. **[Sec]**
- [ ] Keep **only** transaction metadata required by law/tax (retain per Indian financial-record rules even after account deletion). **[Ret]**
- [ ] Keep payment data **segregated** from profile/sensitive data stores. **[Sec]**

### 5.10 Retention & deletion
- [ ] Define a **retention schedule per data class** (table in §6.4). **[Ret]**
- [ ] Implement **inactivity-based erasure** with **advance notice (~48h)** to user before deletion, per DPDP Rules. **[Ret]**
- [ ] **Self-service account deletion** that cascades to backups within a bounded window; document backup-purge SLA. **[Ret][Audit]**
- [ ] On consent withdrawal for a purpose → erase data tied to that purpose unless legally required. **[Ret]**

### 5.11 Data export / DSAR
- [ ] **Self-service export** in machine-readable format (JSON/CSV) covering all personal data + recipients (S.11 / GDPR portability). **[Audit]**
- [ ] Verify requester identity before fulfilling; **respond ≤30 days** (GDPR) / DPDP timelines. **[Sec][Audit]**

### 5.12 Audit logging
- [ ] **Immutable, append-only** logs for: consent grant/withdraw, sensitive-field access, exports, deletions, breaches, admin access. **[Audit]**
- [ ] Logs must avoid storing the sensitive payload itself; log **who/what/when/why**, reference IDs only. **[Sec]**

### 5.13 Breach response
- [ ] **Incident runbook** with severity triage and a **72-hour clock** to the DPDP Board + **"without delay"** user notice (India), and **72h/Art.33** + Art.34 for EU. **[Audit]**
- [ ] Pre-drafted **user notice templates** (nature, consequences, mitigation, safety steps, contact). **[Audit]**
- [ ] **Annual third-party security audit** (matches SDF + Grindr-style expectations). **[Audit]**

---

## 6. Recommended technical & data-architecture practices

### 6.1 Encryption
- **In transit:** TLS 1.2+ everywhere (app↔API, API↔DB, service↔service). Cert pinning on mobile.
- **At rest:** full-disk/volume + DB encryption (AES-256) **as a baseline**.
- **Field-level / application-layer encryption** for the **sensitive set** (birth data, orientation, religion, message bodies, KYC, location). Encrypt before it hits the DB so DBAs/cloud can't read it.
- **Key management:** envelope encryption with a **KMS/HSM**; per-tenant or per-field-class data keys; rotate keys; separate keys for sensitive classes. Consider **crypto-shredding** (destroy the key) as a deletion primitive.

### 6.2 Pseudonymisation & minimisation
- Replace direct identifiers with **pseudonymous user IDs** in matching/analytics pipelines.
- Keep the **re-identification mapping** in a separate, tightly controlled store.
- Aggregate/bucket where possible (e.g., coarse age band for discovery, exact DOB only for Kundali compute).

### 6.3 Consent ledger / audit table schema (illustrative)
```sql
-- Append-only consent ledger (never UPDATE; new row per change)
CREATE TABLE consent_ledger (
  consent_event_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL,            -- pseudonymous principal id
  purpose_code       TEXT NOT NULL,            -- e.g. 'birth_data_matching' (see §9)
  action             TEXT NOT NULL,            -- 'GRANT' | 'WITHDRAW'
  status             BOOLEAN NOT NULL,         -- TRUE=granted, FALSE=withdrawn
  consent_text_hash  TEXT NOT NULL,            -- hash of exact text shown
  policy_version      TEXT NOT NULL,           -- privacy-policy/notice version
  ui_surface         TEXT,                     -- 'onboarding' | 'privacy_center' | ...
  lawful_basis       TEXT,                     -- 'explicit_consent' | 'contract' | ...
  jurisdiction       TEXT,                     -- 'IN' | 'EU' | 'US-CA'
  source_ip_hash     TEXT,                     -- hashed, for evidence
  app_version        TEXT,
  consent_manager_id TEXT,                     -- nullable; future CM interop
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ix_consent_user_purpose ON consent_ledger(user_id, purpose_code, created_at DESC);

-- Generic sensitive-access / DSAR / deletion audit log (append-only)
CREATE TABLE privacy_audit_log (
  event_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID,
  actor_id     TEXT NOT NULL,                  -- staff/service that acted
  event_type   TEXT NOT NULL,                  -- 'SENSITIVE_READ'|'EXPORT'|'DELETE'|'BREACH'|'CONTACT_SHARE'
  resource     TEXT,                           -- field/record class, no payload
  reason       TEXT,                           -- purpose / ticket id
  jurisdiction TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
Retention of the **consent ledger ≥7 years** (aligns with Consent Manager record rule).

### 6.4 Data retention / TTL schedule (template — confirm against notified Rules)
| Data class | Default retention | Trigger to erase |
|---|---|---|
| Account + profile (active) | While active | Account deletion / inactivity |
| Birth data, orientation, religion | While consent valid | Consent withdrawal / deletion |
| Chat messages | Active + short tail (e.g. 90–180d after match ends) | Deletion / TTL |
| KYC raw documents | Until verification recorded, then short TTL | Verification complete |
| Precise location | Ephemeral / short TTL | Session end |
| Payment metadata | Per tax/financial law (e.g. several years) | Statutory period elapse |
| Inactive accounts | ~1 yr inactivity (per Rules) + ~48h notice | Inactivity erasure |
| Banned-user blocklist | Hashed, minimal | Legal need elapse |
| Consent ledger / audit | ≥7 years | Statutory period elapse |

Implement TTLs natively (e.g., TTL indexes / partitioned tables / scheduled purge jobs) and ensure they **cascade to backups** within a documented window.

### 6.5 Access controls
- **RBAC + least privilege**; sensitive fields gated behind a separate role + **break-glass** with mandatory justification → logged.
- **No standing prod access** to sensitive data; just-in-time, time-boxed, audited.
- Separate environments; **no real sensitive data in dev/test** (use synthetic/anonymised).
- MFA for all staff; device posture for admin tooling.

### 6.6 Deletion workflow
1. User requests deletion (or inactivity TTL fires after notice).
2. Verify identity → enqueue deletion job → write to `privacy_audit_log`.
3. **Crypto-shred** sensitive-field keys (instant logical erasure) + hard-delete rows.
4. Cascade to **search indexes, caches, analytics, backups** within the documented SLA.
5. Instruct **processors/sub-processors** to delete (contractual) + confirm.
6. Retain only legally-required residue (payment/tax, fraud blocklist hash) with documented basis.

### 6.7 Vendor / processor governance
- **Data Processing Agreements** with every processor; data-residency map; **SCCs for EU→India**.
- No sensitive data to ad/attribution SDKs. Vet analytics for on-device/aggregation options.

---

## 7. Consent model — every purpose as a separate toggle

Design principle: **one purpose = one consent record**, **opt-in (default OFF)** wherever law requires it (all special-category / SPI / non-essential processing). Mark which are required to use the core product.

| # | Purpose code | What it covers | Default | Type | Core? | Notes |
|---|---|---|---|---|---|---|
| 1 | `account_core` | Create/maintain account, authentication | OFF→required | Contract/Consent | Yes | Without it, no service. |
| 2 | `birth_data_matching` | Use DOB/time/place for Kundali/astrology matching | **OFF** | **Explicit consent** | Optional* | *If app is astrology-first, you may make a basic version core but still get explicit opt-in for birth **time/place**. |
| 3 | `orientation_matching` | Sexual orientation for match filtering | **OFF** | **Explicit consent (Art.9)** | Optional | Never share externally. |
| 4 | `religion_community_matching` | Religion/community/caste/gotra for matching | **OFF** | **Explicit consent (Art.9)** | Optional | |
| 5 | `photo_display` | Show profile photos to other users | **OFF** | Consent | Optional | Default private; user opts to display. |
| 6 | `kyc_verification` | ID/selfie for age & identity verification | **OFF** | Consent (+biometric if face-match) | Recommended | Delete raw docs post-verify. |
| 7 | `precise_location` | Precise geolocation for nearby matching | **OFF** | Consent | Optional | Offer coarse-location fallback. |
| 8 | `chat_messaging` | Store/transmit messages | OFF→required-for-chat | Consent | Feature | E2E/field-encrypted. |
| 9 | `contact_sharing` | Share real contact details (paid) | **OFF** | **Explicit, per-event, both-party** | Optional | Re-consent at each share. |
| 10 | `marketing_email_push` | Promotional comms | **OFF** | Consent | No | Easy unsubscribe. |
| 11 | `personalised_recommendations` | Profiling for match ranking beyond stated prefs | **OFF** | Consent | No | Disclose ADM logic; SDF algo-due-diligence. |
| 12 | `product_analytics` | Usage analytics/telemetry | **OFF** | Consent | No | No sensitive fields; pseudonymised. |
| 13 | `third_party_sharing` | Any sharing/"sale"/cross-context ads | **OFF** | **Explicit / opt-out (GPC)** | No | **Recommended: never enable for sensitive data.** |
| 14 | `research_improvement` | Use data to improve matching models | **OFF** | Consent | No | Aggregate/anonymise. |

**Rules of the model**
- Toggles **2, 3, 4, 9, 13** are special-category/SPI → **explicit opt-in**, never bundled, never pre-ticked, default **OFF**.
- Declining any non-core toggle must **not** degrade core matching (unconditional consent).
- Each toggle change writes a `consent_ledger` row (§6.3); withdrawal triggers the §6.6 deletion/stop-processing path for that purpose.
- Surface all toggles in a single **Privacy Center**, with last-changed dates and one-tap withdraw.

---

## 8. Pre-launch action list (priority order)
1. **Enforce 18+ age-gating** (DOB block + KYC cross-check) — removes the children's-data problem.
2. **Build the granular consent flow + consent ledger** (§5.2, §6.3, §9).
3. **Field-level encryption** for the sensitive set + KMS (§6.1).
4. **DPIA** (GDPR Art.35; also good for SDF readiness) before launch.
5. **Retention schedule + automated TTL/deletion + 48h inactivity notice** (§6.4, §6.6).
6. **Appoint India-based DPO**, publish contact + grievance channel; stand up grievance SLA.
7. **Breach runbook** (72h Board report, user notice templates) + **annual third-party security audit**.
8. **Block sensitive data from all ad/analytics SDKs**; sign DPAs; SCCs for EU→India; build data-residency map for future localisation.
9. **Self-service DSAR**: access, correction, erasure, export, nominate.
10. Re-validate everything against the **notified DPDP Rules text** + EU/US counsel before go-live.

---

## 9. Sources (official / authoritative)
**India — DPDP Act & Rules**
- DPDP Act, 2023 — MeitY official PDF: https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf
- DPDP Rules, 2025 — PIB notification PDF: https://static.pib.gov.in/WriteReadData/specificdocs/documents/2025/nov/doc20251117695301.pdf
- PIB — Draft DPDP Rules consultation: https://www.pib.gov.in/PressReleasePage.aspx?PRID=2148944
- DLA Piper — Data protection laws in India: https://www.dlapiperdataprotection.com/?t=law&c=IN
- India Briefing — DPDP Rules 2025 operational guide: https://www.india-briefing.com/news/dpdp-rules-2025-india-data-protection-law-compliance-40769.html/
- EY — DPDP Act 2023 & Rules 2025 compliance guide: https://www.ey.com/en_in/insights/cybersecurity/decoding-the-digital-personal-data-protection-act-2023
- Hogan Lovells — India consent management rules: https://www.hoganlovells.com/en/publications/india-publishes-consent-management-rules-under-digital-personal-data-protection-act
- Baker Botts — India notifies final DPDP Rules: https://ourtake.bakerbotts.com/post/102lund/india-notifies-final-rules-for-digital-data-protection-act

**EU/UK — GDPR**
- Art. 9 (special categories): https://gdpr-info.eu/art-9-gdpr/
- Art. 33 (breach → authority, 72h): https://gdpr-info.eu/art-33-gdpr/
- ICO — special category data: https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/lawful-basis/a-guide-to-lawful-basis/special-category-data/

**US — CCPA/CPRA**
- California AG — CCPA: https://oag.ca.gov/privacy/ccpa
- California Privacy Protection Agency (CPPA) FAQ: https://cppa.ca.gov/faq.html
- Akin — California expands SPI definition: https://www.akingump.com/en/insights/blogs/ag-data-dive/california-expands-definition-of-sensitive-personal-information-covered-under-ccpa

**Dating-app enforcement signal**
- TechCrunch — Grindr €/$ GDPR fine (consent breaches): https://techcrunch.com/2021/12/15/grindr-final-gdpr-fine/
- BEUC — Grindr GDPR action: https://www.beuc.eu/press-releases/dating-app-grindr-faces-large-gdpr-fine-following-consumer-groups-eu-wide-action
- EFF — Dating apps and consent: https://www.eff.org/deeplinks/2025/07/dating-apps-need-learn-how-consent-works
- EPIC — FTC investigate Grindr data practices: https://epic.org/press-release-epic-urges-ftc-to-investigate-grindrs-personal-data-practices/
