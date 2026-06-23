# PTP-102 DEAL ROOM — USER FLOW & OPERATIONAL PLAYBOOK
**Version:** Draft v1.0  
**Date:** June 2026  
**Purpose:** End-to-end user journeys from public signup through licence execution, plus operational runbook for Byrock deal team  
**App:** Byrock Licensing & Investor Deal Room  
**Reference:** `Platform_Architecture.md` for system design; `18_Term_Sheet.md` for term sheet template schema

---

## 0. ROLE QUICK-REFERENCE

| Role | Company Type | Primary Path |
|------|--------------|--------------|
| **Prospective Licensee** | Vetpharma / big pharma | Signup → NDA → Evaluation → Due Diligence → Exclusive → Execute |
| **Investor** | VC / family office / HNW | Signup → NDA → Evaluation (investor view) |
| **Regulatory Viewer** | CRO / consultant | Invited by Byrock → NDA → Diligence view |
| **Auditor** | Legal / compliance | Invited by Byrock → NDA → Audit view |
| **Byrock Admin** | Byrock Technologies | Super-admin (manage users, upload docs, approve payments, assign tiers) |

---

## 1. PROSPECTIVE LICENSEE FLOW (PRIMARY)

### 1.1 Public Signup → NDA Gate
**Entry Point:** `byrockclinical.com/dealroom/signup`  
**App State:** `profiles.tier = none`

Step | User Action | System Response | Database Writes
-----|-------------|-----------------|----------------
1 | Enter work email + company name | Check against known vetpharma domains; manual review if unknown | `profiles` (created)
2 | Select role = Prospective Licensee | — | —
3 | Redirected to NDA screen | NDA rendered from `7_Non_Disclosure_Agreement.md`; company name pre-filled | —
4 | Sign NDA (DocuSign / OpenSign) | Callback from e-signature provider | `profiles.nda_signed_at`, `profiles.nda_expires_at`, `access_logs` (event = NDA signed)
5 | Welcome email + onboarding guide | Resend / Postmark email | —

**Eligibility Rule:** Only corporate emails accepted (no Gmail / Yahoo / Hotmail for licence flow). Exception by Byrock Admin override.

### 1.2 Evaluation Tier (€5k–€15k/year)
**Entry Condition:** NDA signed  
**App State:** `profiles.tier = evaluation`

**Onboarding (automatic on NDA):**
- Enrol in `evaluation` Stripe subscription (billed annually)
- Stripe webhook → `profiles.tier` updated
- Welcome email with credentials to Deal Room

**Dashboard Access:**

| Section | Content | Source Document(s) |
|---------|---------|---------------------|
| **Deal Overview** | Auto-advancing pitch deck with placeholder audio overlay | `16_Pitch_Deck.md` |
| **Cap Table Summary** | Anonymised: shareholder count, employee pool %, key investor names | `5_Cap_Table.md` |
| **Trial Summary** | Aggregated efficacy signals (n = X, Grade 3 → Grade 1 response rate, no adverse events) | Derived from `TRIAL_LAM-*` |
| **IP Portfolio** | Patent numbers, biomarker names, trademark class list | `8_IP_Assignment_Agreement.md`, `9_Trademark_IP_Documents.md` |
| **Financial Snapshot** | Year 1–4 revenue forecast (~$599M–$916M), gross margin ~96.5%, WACC 50%, base-case EV ~$141.7M | `MASTER_Financial_Parameters.md`, `17_Financial_Model.md` |
| **Term Sheet Templates** | View-only standard term sheet | `18_Term_Sheet.md` |
| **CMC Overview** | One-page summary: formulation (5 mg/mL, 0.2 μm), regulatory path (3Q28 conditional approval), manufacturing network (Langhua / Viva / EUROAPI) | `CMC.md` (condensed) |

**Watermarking:** Every document view/download carries watermark: `{user_name} | {company} | {timestamp} | CONFIDENTIAL — BYROCK DEAL ROOM`

**Audit:** `access_logs` records every view, download, share.

**Upgrade Trigger:** “Upgrade to Due Diligence” CTA → Stripe Checkout.

### 1.3 Due Diligence Tier (€25k–€50k/year)
**Entry Condition:** Stripe payment confirmed  
**App State:** `profiles.tier = diligence`

**Unlocked Features:**

| Section | Content | Source Document(s) |
|---------|---------|---------------------|
| **Live Trial Dashboard** | Individual LAM-* trial feeds (anonymised horse IDs, dosing, outcomes, adverse events) | `TRIAL_LAM-00007_Silver_Moon_20251107_060015.pdf` and future LAM-* protocol outputs |
| **CMC Data Room (Full)** | Manufacturing network table, formulation spec, CMC research gap list, regulatory timeline | `CMC.md`, `CMC_Development_Plan.md`, `PTP-102 Regulatory Plan-Timelines.docx` |
| **Full Financial Model** | Income statement, sensitive tables, valuation sensitivities | `17_Financial_Model.md`, `MASTER_Financial_Parameters.md` |
| **Full Cap Table** | Names, percentages, vesting schedules | `5_Cap_Table.md`, `6_ESOP_Incentive_Agreement.md` |
| **Term Sheet Builder** | Editable fields: territory, upfront, milestones, royalty, sublicensing | `18_Term_Sheet.md` (template schema) |
| **Q&A Channel** | Threaded questions → Byrock deal team / regulatory consultant | Not document-sourced; app feature |

**Term Sheet Builder Flow:**
1. Licensee selects region from world map
2. Auto-populated proposal: upfront = TBD, milestones = template, royalty = 5%, territory = selected region
3. Licensee edits → saves draft
4. Proposes to Byrock (email notification)
5. Byrock reviews → counters or accepts
6. Versioned redlines shown side-by-side (v1 vs v2 vs v3)
7. Both parties sign via DocuSign / OpenSign
8. `term_sheets.status` → `signed`

**Data Room Features (Diligence+):**
- Request additional documents (ticket to Byrock Admin)
- In-app document preview without download (reduces leak risk)
- Selective redaction: Licensee can request Byrock to redact certain commercially sensitive sections

### 1.4 Exclusive Negotiation Tier (€75k–€150k/year)
**Entry Condition:** Stripe payment confirmed + Byrock Admin approval  
**App State:** `profiles.tier = exclusive`  
**Concurrent State:** `region_marketplace[region] = under_negotiation`

**Access Upgrades vs. Diligence:**

| New Feature | Description |
|-------------|-------------|
| **Early Efficacy Data** | Unblinded / pre-publication efficacy signals (e.g., unaggregated LAM-* outcomes) |
| **Region Lock** | Selected territory is locked in marketplace; no other prospect can evaluate that region |
| **CMC Scoping Calls** | Direct calendar booking with Byrock regulatory team + engineering contacts (Langhua / Viva) |
| **Dedicated Deal Channel** | Slack or MS Teams channel with Byrock deal team |
| **Manufacturing Site Dossiers** | Full site master files, DECRS certificates, GMP audit reports |
| **Regulatory Submission Package** | Module 3 CMC technical section drafts, DMFs, CTD structure |

**Exclusivity Clock:**
- Starts on `term_sheets.status = signed`
- Default: 180 days (6 months)
- Extendable by mutual agreement
- Expiry:
  - Auto-release region back to `Available`
  - Email alert to Licensee + Byrock
  - Option to extend (Stripe payment for extension period)

**Term Sheet → Licence Execution:**
1. Signed term sheet → Stripe payment intent created for upfront fee
2. Payment succeeded → `licences.status = active`
3. Region locked permanently in marketplace
4. Milestone tracker activated:
   - Milestone 1: Regulatory approval
   - Milestone 2: First commercial sale / trial activation
   - Milestone 3: Sales threshold
5. Royalty dashboard enabled: Licensee logs net sales → Company validates → royalty payment automated or invoiced

---

## 2. INVESTOR FLOW (PARALLEL TRACK)

### 2.1 Signup & NDA
Same as Licensee Signup → NDA Gate (Section 1.1), but role = **Investor**.

### 2.2 Investor Tier
**App State:** `profiles.role = investor`

| Section | Content | Source Document(s) |
|---------|---------|---------------------|
| **Full Cap Table** | Shareholder list, percentages, vesting, option pool | `5_Cap_Table.md`, `6_ESOP_Incentive_Agreement.md`, `1_Founder_Agreement.md`, `3_Co_Founder_Exit_Clause.md` |
| **Financial Dashboard** | Income statement, valuation, sensitivity | `17_Financial_Model.md`, `MASTER_Financial_Parameters.md` |
| **Pitch Deck** | Auto-play | `16_Pitch_Deck.md` |
| **Investor Updates** | Board minutes (if applicable), monthly KPI report | Not in 18 docs — new content stream |
| **Term Sheet View (Read-Only)** | View executed term sheets and licence statuses (anonymised if needed) | `18_Term_Sheet.md` + `licences` table |
| **CMC / IP (Read-Only)** | High-level view only | `CMC.md` summary, `IP Portfolio` |

**No deal negotiation access.** Investor role is strictly read-only for deal terms.

---

## 3. REGULATORY VIEWER FLOW

**Entry:** Invited by Byrock Admin (email invite link)  
**NDA:** Still required (regulatory consultants handle sensitive data)  
**App State:** `profiles.role = regulatory_viewer`

| Access | Content |
|--------|---------|
| Full CMC Data Room | `CMC.md`, `CMC_Development_Plan.md`, regulatory timelines |
| Live Trial Dashboard | All LAM-* feeds, protocol documents |
| Regulatory Filings | `PTP-102 Regulatory Plan-Timelines.docx`, `PTP-102 MUMS clearance.pdf` |
| Term Sheets (View Only) | Current term sheets in negotiation (restricted view) |

---

## 4. AUDITOR FLOW

**Entry:** Invited by Byrock Admin  
**App State:** `profiles.role = auditor`

| Access | Content |
|--------|---------|
| Audit Trail | All `access_logs` (who viewed/downloaded what, when, IP, watermark snapshot) |
| NDA Status | All signed NDAs, expiry dates, version history |
| Term Sheet Chain | Full version history, e-signature audit trail |
| Payment Records | Stripe transaction log, licence status |
| Compliance Self-Cert | `15_Legal_Compliance_Document.md` status |

---

## 5. BYROCK ADMIN FLOW

### 5.1 Daily Operations
| Task | UI Location | Backend Action |
|------|-------------|----------------|
| Approve new signup | Admin → Users | `profiles.role` assignment, tier setup |
| Upload new document | Admin → Data Room | `documents` insert + Supabase Storage PUT |
| Set region status | Admin → Marketplace | `region_marketplace` update |
| Counter term sheet | Admin → Term Sheets | `term_sheet_versions` insert with `proposed_by = byrock` |
| Issue invite | Admin → Users | Email invite + `profiles` insert with NDA required flag |
| Review payment | Admin → Payments | Stripe webhook auto-handles; override if needed |

### 5.2 Weekly / Monthly
- Review `access_logs` for unusual download patterns
- Update `CMC.md` and `CMC_Development_Plan.md` as regulatory milestones progress
- Seed new LAM-* trial data into `trial_events` table
- Reconcile cap table if equity events occur (`cap_table_entries` updates)

---

## 6. APP STATE MACHINE (TERM SHEET LIFECYCLE)

```
                    +------------------+
                    |   draft          |<─── Licensee edits in builder
                    +------------------+
                            |
                     [Propose]
                            v
                    +------------------+
                    |   proposed       |<─── Byrock counters or accepts
                    +------------------+
                            |
                     [Accept / Counter]
                            v
                    +------------------+
                    |   negotiated     |<─── Versioned redlines until agreed
                    +------------------+
                            |
                     [Sign — DocuSign]
                            v
                    +------------------+
                    |   signed         |<─── Audit log updated; exclusivity clock starts
                    +------------------+
                            |
                     [Payment — Stripe]
                            v
                    +------------------+
                    |   executed       |<─── Licence record created; region locked
                    +------------------+
                            |
                     [Post-execution]
                            v
                    +------------------+
                    |   active licence |<─── Milestone + royalty tracking active
                    +------------------+
```

---

## 7. APP STATE MACHINE (REGION LICENSING)

```
                    +------------------+
                    |   Available      |
                    +------------------+
                            |
                  [Evaluation tier user views]
                            v
                    +------------------+
                    |   Under Evaluation |
                    +------------------+
                            |
                [Diligence tier user active]
                            v
                    +------------------+
                    |   Under Negotiation |<─── Exclusive tier; term sheet open
                    +------------------+
                            |
                     [Signed + Paid]
                            v
                    +------------------+
                    |   Licensed        |<─── Region locked; access expanded
                    +------------------+
                            |
                     [Licence expires]
                            v
                    +------------------+
                    |   Available      |
                    +------------------+
```

---

## 8. NOTIFICATION & EMAIL TRIGGERS

| Event | Audience | Channel | Timing |
|-------|----------|---------|--------|
| Welcome + onboarding | New user | Email (Resend) | Post-NDA signature |
| Trial outcome published | All active tiers | In-app + email | On each new LAM-* outcome |
| NDA expiry warning | User whose NDA expires in 30 days | Email | T-30, T-7, T-1 |
| Term sheet proposed | Byrock deal team | Email + in-app | On propose |
| Term sheet signed | Both parties | Email + in-app | On DocuSign callback |
| Payment received | Licensee + Byrock | Email | On Stripe webhook |
| Exclusivity reminder | Licensee + Byrock | In-app + email | T-60, T-30, T-7 before expiry |
| Region released | All users | In-app notification | On exclusivity expiry |
| Milestone due | Licensee | Email | 30 days before milestone date |
| Document updated | Tier-appropriate users | In-app | On upload |

---

## 9. ERROR STATES & EDGE CASES

| Scenario | System Behaviour | Admin Action Required |
|----------|-----------------|----------------------|
| NDA expires mid-diligence | User downgraded to `none`, data room access revoked | Optional: re-engage with renewal offer |
| Stripe payment fails | Term sheet stays `signed` but `licence.status = pending` | Manual retry or suspend access |
| Competing prospects for same region | First to enter `exclusive` tier gets lock | Byrock Admin decides if both qualify |
| User leaves company | Access revoked by Admin; audit log retained | Profile marked `inactive`, licence reassigned |
| DocuSign callback lost | Webhook retry queue; verify via DocuSign console | Manual status update if needed |
| Bulk trial data upload | Backfill `trial_events` via script; Realtime handles live | None if scripted correctly |

---

## 10. SUCCESS METRICS (BYROCK BOARD VIEW)

| Metric | Target (Year 1) | Measurement |
|--------|-----------------|-------------|
| Evaluation signups | 20 | `profiles.tier = evaluation` count |
| Evaluation → Diligence conversion | 30% | Stripe event funnel |
| Diligence → Exclusive conversion | 20% | Stripe upgrade funnel |
| Term sheets proposed | 5 | `term_sheets.status = proposed` count |
| Term sheets executed | 2 | `term_sheets.status = executed` count |
| Regions licensed | 2 | `licences.status = active` count |
| Average days from signup to term sheet | 60 | `created_at` → `proposed_at` |
| NDA completion rate | 90% | Signed / invited |
| Data room page views | 500/mo | `access_logs` count |

---

## 11. PHASED ROLL-OUT CHECKLIST

### Phase 1: Data Room MVP (Internal Use Only)
- [ ] NDA + Evaluation + Diligence tiers
- [ ] Static uploaded documents (CMC, Financial, IP, Cap Table, Pitch Deck)
- [ ] Watermarking + access logs
- [ ] Byrock Admin panel

### Phase 2: Live Trial Dashboard
- [ ] Supabase Realtime schema for `trial_events`
- [ ] Dashboard UI with charts
- [ ] Historical LAM-00007 data seeded

### Phase 3: Term Sheet Engine
- [ ] JSON schema from `18_Term_Sheet.md`
- [ ] Term Sheet Builder UI
- [ ] DocuSign integration
- [ ] Stripe payment flow

### Phase 4: Region Marketplace
- [ ] Interactive map (Mapbox or Leaflet)
- [ ] Region status management
- [ ] Exclusivity clock

### Phase 5: Investor Portal + Compliance
- [ ] Investor-only dashboard
- [ ] Full audit log UI
- [ ] 21 CFR Part 11 gap closure

---

## 12. APPENDIX: DATA ROOM FOLDER STRUCTURE (SOURCE)

This mirrors the content catalogue in `Platform_Architecture.md` Section 7.

```
/data-room/
  /company/
    profile.md ← 2_Incorporation_Documents.md
    trademarks.md ← 9_Trademark_IP_Documents.md
  /ip/
    portfolio.md ← 8_IP_Assignment_Agreement.md
    biomarker-list.md ← derived from multiple docs
  /cmc/
    manufacturing.md ← CMC.md (Section 3)
    regulatory.md ← CMC.md (Section 2) + PTP-102 Regulatory Plan-Timelines.docx
    development-plan.md ← CMC_Development_Plan.md
  /clinical/
    trials/ ← TRIAL_LAM-* outputs
    protocols/ ← PTP102 Protocol.pdf, PTP-102 MUMS clearance.pdf
  /financial/
    model.md ← 17_Financial_Model.md
    parameters.md ← MASTER_Financial_Parameters.md
  /finance/
    cap-table.md ← 5_Cap_Table.md
    esop.md ← 6_ESOP_Incentive_Agreement.md
    founder-agreement.md ← 1_Founder_Agreement.md
    exit-clause.md ← 3_Co_Founder_Exit_Clause.md
  /investor/
    pitch-deck.md ← 16_Pitch_Deck.md
  /legal/
    term-sheet-template.md ← 18_Term_Sheet.md
    term-sheet-v*.json ← term_sheet_versions
    compliance.md ← 15_Legal_Compliance_Document.md
    contracts.md ← 4_Shareholders_Agreement.md
  /legal-forms/
    nda-template.md ← 7_Non_Disclosure_Agreement.md
```

---

*This flow and playbook are current as of June 2026. They should be validated after first 3–5 prospect signups and iterated based on actual pharma partner onboarding friction.*
