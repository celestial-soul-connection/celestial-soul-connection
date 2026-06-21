---
name: privacy-compliance
description: Privacy-by-design guardrails for Celestial Soul Connection. Invoke BEFORE building or changing ANY feature that collects, stores, displays, shares, transfers, or deletes personal data — onboarding, birth details, photos/KYC, chat, contact-sharing, payments, reporting/offboarding, analytics, matching. Encodes India DPDP Act 2023 (+Rules 2025) and GDPR/CCPA obligations as concrete, checkable rules. Use whenever a task touches user data, consent, retention, or cross-border transfer.
---

# Privacy & Compliance Guardrails

Full reference: `docs/compliance/privacy-compliance-india-global.md`. This skill is
the enforcement layer — read it before writing data-touching code, and verify
your change against §6 checklist before declaring done.

## 0. Data this app treats as SENSITIVE (high-risk → field-level encryption + strict RBAC)
Birth date/time/place, sexual orientation, religion, KYC identity, precise location,
photos, chat messages, payment data. India's DPDP has no formal "sensitive" tier —
we classify these as sensitive **voluntarily** because GDPR Art. 9 / CCPA do, and the
risk is real (cf. Grindr GDPR fine).

## 1. Consent — the core obligation
DPDP runs almost entirely on consent that is **free, specific, informed, unconditional,
unambiguous, and withdrawable**, with the **burden of proof on us**.

Hard rules:
- **No bundled consent.** Each purpose is a SEPARATE toggle. One "I agree to everything" is illegal.
- **Opt-in, default OFF** for anything not strictly necessary to deliver the core service (marketing, analytics, profile-photo display to others, etc.). Matching on birth data requires its own explicit consent.
- **Withdrawal must be as easy as granting.** Every consent shown in Settings with a one-tap revoke.
- **Consent ledger is mandatory.** Every grant/withdrawal is an append-only audit record (who, which purpose, version of notice, timestamp, method). Never mutate; only append. See backend `consent` model.
- **Notice before/at collection**, in clear language, listing purpose + rights + grievance contact, available in English + (per Rules) Indian languages.
- **GDPR explicit consent** required for special-category data (sexual orientation, religion) for EU users — log lawful basis per purpose.

### Canonical consent purposes (each a separate granular toggle)
`account_core` (required), `birth_data_matching`, `photo_display_to_matches`,
`kyc_verification`, `location_matching`, `chat_processing`, `psychometric_profiling`,
`contact_share` (per-event, paid), `marketing_comms` (default off),
`product_analytics` (default off), `personalization` (default off),
`research_aggregate` (default off). Add new purposes here AND in the backend enum — never reuse an existing purpose for a new use.

## 2. Per-feature rules
- **Onboarding:** granular consent screen, not a wall of legal text. Block under-18 hard (DOB + KYC cross-check) — we are 18+ only, which also sidesteps DPDP's verifiable-parental-consent problem.
- **Birth data:** collect only for matching; encrypt at rest (field-level); never expose raw to other users — only derived match explanations.
- **Photos/KYC:** store KYC separately from profile; never show KYC docs to other users; verification status only.
- **Chat:** enforce **no phone-number / external-contact sharing** (regex + ML filter; redact + warn). Messages encrypted at rest. Contact details are exchanged ONLY through the paid `contact_share` flow, and only when both are a mutual match, charging one party a nominal fee — log explicit consent for that exchange.
- **Reporting / offboarding:** any user can report; reports are auditable; offboarding a defaulter must log reason + actor and follow the deletion/retention workflow (don't hard-delete evidence needed for safety/legal — pseudonymize and retain per policy, document the basis).
- **Payments:** never store raw card data (use a PCI-compliant processor token); link payment to consent for the paid action.
- **Analytics/marketing:** gated behind opt-in consent; respect withdrawal immediately.

## 3. Data-subject rights (must be buildable end-to-end)
Access/export, correction, erasure, grievance, and (DPDP) nomination. Provide a
self-serve **Export my data** and **Delete my account** in Settings. Deletion =
crypto-shred sensitive fields + remove/pseudonymize, honoring legal-hold exceptions;
record the action in the audit log.

## 4. Architecture defaults (apply by default, not on request)
- Encryption in transit (TLS) + at rest; **field-level encryption** for the sensitive set in §0.
- Append-only **consent ledger** + **access audit log** (every read/write of sensitive data).
- **Retention/TTL**: define max retention per data class; auto-expire chat/inactive data per policy. No "keep forever" defaults.
- **Pseudonymization** of analytics; **RBAC** least-privilege for any internal access.
- **Data-residency map**: know where each class is stored; honor cross-border restrictions (DPDP negative list, GDPR SCCs for EU→India).
- **Breach response**: detect → notify users without delay → Data Protection Board initial intimation + 72h report (also GDPR Art. 33/34 72h). Have the runbook wired.

## 5. Framing / anti-pseudoscience tie-in
The astrology/"karmic" layer is cosmetic UX only. Never let it drive consent-relevant
automated decisions or store inferences that could be discriminatory. Matching logic is
the psychology model (see `docs/research/compatibility-psychology.md`), which must be
auditable for disparate impact.

## 6. Pre-merge checklist (run for every data-touching change)
- [ ] New data collected? → mapped to a named consent purpose (separate toggle, correct default).
- [ ] Consent captured BEFORE collection and written to the append-only ledger?
- [ ] Sensitive field (§0)? → field-level encrypted + access logged + not exposed to other users.
- [ ] User can view/export/delete this data from Settings?
- [ ] Retention/TTL defined (no infinite retention)?
- [ ] Cross-border movement checked against residency rules?
- [ ] Withdrawal of consent immediately stops the processing?
- [ ] Notice/UI copy in plain language, lists purpose + rights + grievance contact?
- [ ] Under-18 path blocked?
- [ ] Breach-relevant? → covered by logging + runbook?

When in doubt, choose the more privacy-protective option and flag it for legal review
(rules are still phasing in through ~2027; validate specifics with counsel).
