# PTP-102 LICENSING & INVESTOR DEAL ROOM — PLATFORM ARCHITECTURE
**Version:** Draft v1.0  
**Date:** June 2026  
**Concept:** B2B licensing data room + real-time trial dashboard for veterinary pharma partners evaluating PTP-102  
**Core Value:** Integrated live clinical data + deal execution in one secure environment — no existing competitor combines these for veterinary pharma

---

## 1. PLATFORM OVERVIEW

### 1.1 What It Is
A **private enterprise platform** where prospective licence partners (vetpharma companies, institutional investors) can:
- Review PTP-102 data room materials under NDA
- Monitor live clinical trial outcomes in real time
- Negotiate and execute global region licence term sheets digitally
- Pay licence fees and track milestone obligations
- View cap table and IP portfolio for investor diligence

### 1.2 What It Is NOT
- Not a farmer-facing subscription tool
- Not a public marketplace
- Not a telemedicine or clinical trial management system for veterinarians

### 1.3 Comparable Platforms
| Platform | What It Does | Gap vs. Byrock |
|----------|-------------|----------------|
| Intralinks / Datasite / DFIN Venue | VDR for pharma M&A and licensing | Static docs only; no live clinical data |
| Medrio / ClinDash | Clinical trial monitoring | No deal room, no term sheet negotiation |
| PitchBook / Crunchbase | Investor data + deal sourcing | No live science or regulatory CMC data |
| Carta / Pulley | Cap table management | No pharma licensing workflow |
| **Byrock Deal Room** | **Live trial dashboard + VDR + term sheet builder + payment** | **Novel integrated stack for veterinary pharma** |

### 1.4 Market Position
- Vertical: Equine / veterinary pharmaceutical licensing
- Comparable precedent: Human biotech VDRs charge €20k–€100k+ per deal
- Pricing model: Tiered annual access fees (Evaluation → Due Diligence → Exclusive Negotiation)
- Geographic focus: Global (US FDA, EU VICH, UAE MOCCAE)

---

## 2. USER PERSONAS & ROLES

| Role | Company Type | Access Level | Primary Use |
|------|-------------|--------------|-------------|
| **Prospective Licensee** | Vetpharma / big pharma | Evaluation → Due Diligence → Exclusive | Review data, negotiate region licence |
| **Investor / Sponsor** | VC, family office, HNW | Full access | Cap table, financials, pipeline |
| **Byrock Admin** | Byrock Technologies | Super admin | Upload docs, manage tiers, approve payments |
| **Regulatory Viewer** | CRO / regulatory consultant | Read-only | CMC docs, trial data, FDA correspondence |
| **Auditor / Compliance** | Legal / auditor | Audit trail | Access logs, NDA status, e-signature chain |
| **Clinical Coordinator** | Byrock / CRO | Data entry | Log trial outcomes into live dashboard |

---

## 3. APP MODULES & EXISTING DOCUMENT MAPPING

### 3.1 Module Map

| Module | Existing Document(s) | Function |
|--------|---------------------|----------|
| **NDA Gate** | `7_Non_Disclosure_Agreement.md` → digital NDA flow | Gate every role until NDA signed |
| **Company Profile** | `2_Incorporation_Documents.md`, `9_Trademark_IP_Documents.md` | Legal entity, IP portfolio, trademarks |
| **Live R&D / CMC Data Room** | `CMC.md`, `CMC_Development_Plan.md`, `PTP-102 Regulatory Plan-Timelines.docx` | Manufacturing network, formulation specs, regulatory timeline, cost estimates |
| **IP Portfolio** | `8_IP_Assignment_Agreement.md`, `9_Trademark_IP_Documents.md` | Patents, biomarkers, assignment chain |
| **Cap Table & Finance** | `5_Cap_Table.md`, `MASTER_Financial_Parameters.md`, `17_Financial_Model.md` | Ownership, dilution, revenue model, unit economics |
| **Investor Deck** | `16_Pitch_Deck.md` | Auto-play deal overview inside app |
| **Term Sheet Engine** | `18_Term_Sheet.md` → reusable template | Build, negotiate, e-sign term sheets |
| **Region Licensing Marketplace** | Derived from `18_Term_Sheet.md` + `MASTER_Financial_Parameters.md` | Map of available territories, status, pricing |
| **Live Trial Dashboard** | `TRIAL_LAM-00007_Silver_Moon_20251107_060015.pdf` and future LAM-* protocol outputs | Real-time efficacy signals, enrollment, adverse events |
| **Compliance & Audit** | `15_Legal_Compliance_Document.md`, `12_HR_Policies.md` | Audit trail, role permissions, regulatory compliance |
| **Payment Gateway** | Derived from `18_Term_Sheet.md` fee structure | Licence fee payment, milestone tracking |
| **User Management** | `1_Founder_Agreement.md`, `3_Co_Founder_Exit_Clause.md`, `4_Shareholders_Agreement.md` | Role assignment, vesting, access revocation |

### 3.2 Document-to-Screen Mapping (Detail)

| Document | App Screen / View | Content Purpose |
|----------|-------------------|-----------------|
| `2_Incorporation_Documents.md` | **Company Profile** | Legal entity, registration, tax IDs |
| `9_Trademark_IP_Documents.md` | **IP Portfolio** | Mark registrations, patent filings |
| `5_Cap_Table.md` | **Cap Table** | Shareholder list, dilution, vesting |
| `MASTER_Financial_Parameters.md` | **Financial Dashboard** | Live pricing, market size, unit economics |
| `17_Financial_Model.md` | **Financial Dashboard** | Income statement, valuation, sensitivity |
| `16_Pitch_Deck.md` | **Deal Overview / Onboarding** | Auto-advancing pitch deck with audio |
| `CMC.md` | **CMC Data Room** | Manufacturing network, formulation, regulatory pathway |
| `CMC_Development_Plan.md` | **R&D Roadmap** | Milestone plan, decision gates, timeline |
| `PTP-102 Regulatory Plan-Timelines.docx` | **Regulatory Timeline** | Gantt chart, ETCR protocols, cost table |
| `TRIAL_LAM-*` | **Live Trial Dashboard** | Per-anonymised-horse outcomes, dosing, assessments |
| `18_Term_Sheet.md` | **Term Sheet Builder / Negotiation** | Template → editable → versioned → signed |
| `7_Non_Disclosure_Agreement.md` | **NDA Gate** | Digital signature before access |
| `15_Legal_Compliance_Document.md` | **Compliance Dashboard** | Self-certification, audit readiness |
| `6_ESOP_Incentive_Agreement.md` | **Cap Table (Employee Pool)** | Option grants, vesting schedules |
| `10_Employment_Agreement.md`, `11_Offer_Letter.md`, `12_HR_Policies.md` | **Team Page / HR** | Public team bios, roles (for investor view) |

---

## 4. OPEN SOURCE INTEGRATION STACK

### 4.1 Recommended Foundation (MVP)

| Layer | Technology | Why | License |
|-------|-----------|-----|---------|
| **Frontend** | React + Vite + shadcn/ui | Already in use; fast, component-rich | MIT |
| **Backend / DB / Auth** | Supabase | PostgreSQL, real-time, auth, storage in one | Apache 2.0 |
| **Real-time Data** | Supabase Realtime | Live trial dashboard without custom WebSocket infra | Apache 2.0 |
| **File Storage / VDR** | Supabase Storage + custom watermarking | Object storage with signed URLs | Apache 2.0 |
| **E-Signature** | DocuSign REST API (or OpenSign self-hosted) | Legal-grade signature; OpenSign if full control needed | OpenSign: MIT |
| **Payments** | Stripe Connect | Multi-tenant split payments (region licence fees) | Proprietary (standard SaaS) |
| **Document Rendering** | OnlyOffice / ONLYOFFICE Docs | In-app doc preview, collaborative redlines | AGPL / commercial |
| **Audit Logging** | Supabase audit + custom event stream | 21 CFR Part 11 / GDPR trail | — |
| **Email / Notifications** | Resend (or self-hosted Postmark) | Transactional emails for NDA, payments, alerts | Resend: proprietary; Postmark: commercial |
| **Deployment** | Vercel (frontend) + Supabase Cloud (backend) | Fastest path to MVP | — |

### 4.2 Enterprise / Self-Hosted Alternatives

| Need | Open Source Option | Notes |
|------|-------------------|-------|
| Full VDR replacement | **Mayan EDMS** | Document-centric, metadata, access control, audit |
| Encrypted collaboration | **CryptPad** | Zero-knowledge, real-time collab, not enterprise-grade for pharma |
| Headless CMS for docs | **Directus** | Wraps SQL with API + admin panel; good for structured term sheet data |
| E-signature self-hosted | **OpenSign** | DocuSign-compatible API, self-hostable |
| PDF watermarking / sealing | **pdf-lib** (Node) or **PyMuPDF** | Custom watermark service; generate watermarked PDFs on download |
| Event streaming | **Apache Kafka** or **NATS** | Overkill for MVP; use Supabase Realtime first |
| Compliance audit UI | **OpenAudit** | Generic audit framework; may need customisation for 21 CFR Part 11 |
| Cap table management | **Carta open source alternatives:** Ledgy, Capchase | Likely build custom or use spreadsheets early |

### 4.3 “Rope In” Strategy (Phased)
**Phase A (MVP — 3 months):**
- Supabase auth + storage + real-time
- React frontend with shadcn/ui
- DocuSign API for NDA + term sheets
- Stripe for payments
- Custom watermarking middleware on file downloads

**Phase B (Scale — 3–6 months):**
- Replace DocuSign with **OpenSign** self-hosted if volume justifies
- Add **OnlyOffice** for in-app term sheet redlining
- Build live trial dashboard on Supabase Realtime
- Implement role-based access control (RBAC) with Supabase RLS

**Phase C (Enterprise — 6–12 months):**
- Consider **Mayan EDMS** if document volume exceeds Supabase Storage comfort zone
- Add **Apache Kafka** if trial data throughput exceeds Realtime limits
- Introduce **Directus** as structured CMS for CMC and regulatory content
- Add **blockchain audit trail** (e.g., OpenZeppelin Defender) for immutability if regulator requires

---

## 5. HIGH-LEVEL SYSTEM DESIGN

### 5.1 Architecture Diagram (Text)

```
CLIENT LAYER
  ├── Web App (React + Vite + shadcn/ui)
  ├── Mobile (responsive web; React Native if needed later)
  └── API Clients (Stripe webhooks, DocuSign callbacks)

API / BACKEND LAYER
  ├── Supabase (PostgreSQL + Auth + Storage + Realtime)
  ├── Stripe Connect (payments, split settlements)
  ├── DocuSign / OpenSign (e-signature orchestration)
  └── Custom Next.js API routes (watermarking, webhooks, audit)

DATA LAYER
  ├── `profiles` — user accounts, company, role, tier
  ├── `ndas` — signed NDA records, version, expiry
  ├── `documents` — VDR files, metadata, watermark config
  ├── `access_logs` — view, download, share events
  ├── `trials` — LAM-00007+ protocol headers, anonymised horse IDs
  ├── `trial_events` — real-time outcomes feed
  ├── `term_sheets` — template + negotiated versions + e-sign status
  ├── `licences` — region, fee, milestone, status
  ├── `payments` — Stripe transaction history
  ├── `cap_table` — shareholders, vesting, options
  ├── `ip_portfolio` — patents, trademarks, biomarkers
  └── `audit_trail` — compliance log (append-only)

INTEGRATIONS
  ├── Stripe Connect → payment + invoicing
  ├── DocuSign → NDA + term sheet signature
  ├── Supabase Realtime → trial dashboard live updates
  ├── Email (Resend) → notifications, renewal alerts
  └── IPFS (optional) → immutable document hashing for audit
```

### 5.2 Key Database Tables (Simplified)

**profiles**
- `id` (uuid, FK to auth.users)
- `company` (text)
- `role` (enum: prospect, investor, partner, admin)
- `tier` (enum: evaluation, diligence, exclusive, none)
- `nda_signed_at` (timestamp)
- `nda_expires_at` (timestamp)
- `created_at`, `updated_at`

**documents**
- `id` (uuid)
- `category` (enum: regulatory, cmc, financial, ip, term_sheet, trial)
- `title` (text)
- `file_path` (text, Supabase Storage path)
- `version` (text)
- `watermark_template` (text, e.g., `{user_name} | {company} | {timestamp}`)
- `access_tier_min` (enum: evaluation, diligence, exclusive)
- `uploaded_by` (uuid)
- `created_at`

**access_logs**
- `id` (uuid)
- `user_id` (uuid)
- `document_id` (uuid)
- `action` (enum: view, download, share)
- `ip_address` (inet)
- `user_agent` (text)
- `watermarked_snapshot_path` (text, optional)
- `created_at`

**term_sheets**
- `id` (uuid)
- `template_version` (text)
- `prospect_company` (text)
- `prospect_user` (uuid)
- `region` (enum: north_america, eu, uk, uae, apac, global)
- `upfront_fee` (numeric)
- `milestone_schedule` (jsonb)
- `royalty_rate` (numeric)
- `exclusivity_months` (int)
- `status` (enum: draft, proposed, negotiated, signed, executed)
- `current_version` (int)
- `created_by` (uuid)
- `updated_at`

**term_sheet_versions**
- `id` (uuid)
- `term_sheet_id` (uuid)
- `version` (int)
- `content` (jsonb, structured term sheet fields)
- `proposed_by` (enum: prospect, byrock)
- `created_at`

**licences**
- `id` (uuid)
- `term_sheet_id` (uuid)
- `region` (enum)
- `fee_paid` (boolean)
- `fee_amount` (numeric)
- `stripe_payment_intent_id` (text)
- `status` (enum: pending, active, expired, terminated)
- `starts_at`, `expires_at`

**trial_events**
- `id` (uuid)
- `trial_id` (text)
- `horse_id` (text, anonymised)
- `event_type` (enum: treatment, assessment, lab, adverse_event)
- `data` (jsonb)
- `event_timestamp` (timestamp)
- `recorded_by` (uuid)

**cap_table_entries**
- `id` (uuid)
- `shareholder_name` (text)
- `share_class` (enum: ordinary, preferred, licence_unit, option)
- `shares` (numeric)
- `percentage` (numeric)
- `vesting_schedule` (jsonb)
- `is_employee_pool` (boolean)

**ip_portfolio**
- `id` (uuid)
- `title` (text)
- `type` (enum: patent, trademark, biomarker, trade_secret)
- `jurisdiction` (text)
- `status` (text)
- `filing_date` (date)
- `assignee` (text)

---

## 6. CORE USER FLOW (Chaptered)

### Chapter 1: Sign-Up & Company Verification
1. User lands on byrockclinical.com/dealroom
2. Enters work email + company name
3. System checks company domain against known vetpharma / investor domains (manual override for unknowns)
4. User selects role: **Prospective Licensee**, **Investor**, **Regulatory Viewer**, **Auditor**
5. Account created in `profiles` with `tier = none`

### Chapter 2: NDA Gate
1. User redirected to NDA signing screen
2. Digital NDA rendered from `7_Non_Disclosure_Agreement.md` template with user/company pre-filled
3. DocuSign / OpenSign for legally binding e-signature
4. On signature:
   - `profiles.nda_signed_at` = now
   - `profiles.nda_expires_at` = now + 2 years
   - `access_logs` records NDA event
   - Auto-email confirmation + welcome package

### Chapter 3: Evaluation Tier (€5k–€15k/year)
1. User granted `tier = evaluation`
2. Dashboard shows:
   - **Deal Overview**: auto-play `16_Pitch_Deck.md` with voiceover placeholder
   - **Cap Table Summary**: anonymised shareholder count, employee pool %, key investors
   - **Trial Summary**: aggregated efficacy signals (no animal-level detail)
   - **IP Portfolio**: patent numbers, biomarker names, trademark classes
   - **Term Sheet Templates**: view-only, no edit
3. Watermarks applied to every document view/download
4. `access_logs` captures every view

### Chapter 4: Due Diligence Tier (€25k–€50k/year)
1. User upgrades via Stripe Checkout
2. `profiles.tier` → `diligence`
3. New access unlocked:
   - Full `CMC.md` + `CMC_Development_Plan.md` + regulatory timelines
   - Live Trial Dashboard: individual LAM-* trial feeds (anonymised horse IDs, dosing, outcomes)
   - Full Cap Table with percentages
   - Full Financial Model (Excel export)
   - **Term Sheet Builder**: editable fields, auto-save drafts
   - **Q&A Channel**: threaded questions to Byrock team
4. All downloads watermarked; redaction optional on sensitive docs

### Chapter 5: Exclusive Negotiation Tier (€75k–€150k/year)
1. User upgrades; exclusivity window timer starts (e.g., 90 days)
2. `profiles.tier` → `exclusive`
3. New access:
   - Early efficacy data (unblinded / pre-publication signals)
   - **Digital Term Sheet Negotiation**: propose region/fee/milestones → Byrock counters → versioned redlines
   - **Region Marketplace**: map of available territories with status (available, under negotiation, licensed)
   - **Dedicated Slack / MS Teams channel** with Byrock deal team
   - **Live CMC scoping calls** with Langhua / Viva if needed
4. Term sheet can progress through:
   - `draft` (prospect edits)
   - `proposed` (submitted to Byrock)
   - `negotiated` (counter-signed)
   - `signed` (DocuSign complete)
   - `executed` (payment received, licence active)

### Chapter 6: Payment & Execution
1. Stripe payment intent created on term sheet finalisation
2. Payment → `licences` record created with `status = active`
3. Region locked in `region_marketplace` table (e.g., `EU → licensed`)
4. Post-payment access:
   - Full regulatory submission package (Module 3 CMC, CTD modules)
   - Manufacturing site dossier
   - LAM-* trial data exports (CSV, REDCap)
   - API transfer playbook
5. Ongoing:
   - Milestone tracker (regulatory approvals, first sale)
   - Royalty dashboard (net sales reporting portal)
   - Annual renewal reminders

### Chapter 6a: Investor-Only Flow (Parallel Track)
- Investor signs NDA
- Tier: `investor` (separate fee or bundled with deal access)
- Access: Cap Table full, Financial Model, Pitch Deck, Board minutes (if applicable)
- No term sheet negotiation; read-only
- Cap table updates pushed via Realtime

---

## 7. DATA ROOM CONTENT CATALOGUE

| Folder | Source Document(s) | Access Tier |
|--------|---------------------|-------------|
| `/company/profile` | `2_Incorporation_Documents.md`, `9_Trademark_IP_Documents.md` | All tiers |
| `/ip/portfolio` | `8_IP_Assignment_Agreement.md`, biomarker list | Diligence+ |
| `/cmc/manufacturing` | `CMC.md` — Section 3 | Diligence+ |
| `/cmc/regulatory` | `CMC.md` — Section 2, `PTP-102 Regulatory Plan-Timelines.docx` | Diligence+ |
| `/cmc/development-plan` | `CMC_Development_Plan.md` | Diligence+ |
| `/clinical/trials` | `TRIAL_LAM-*` outputs (anonymised) | Evaluation+ |
| `/clinical/protocols` | `PTP102 Protocol.pdf`, `PTP-102 MUMS clearance.pdf` | Diligence+ |
| `/financials/model` | `17_Financial_Model.md`, `MASTER_Financial_Parameters.md` | Diligence+ |
| `/financials/cap-table` | `5_Cap_Table.md`, `6_ESOP_Incentive_Agreement.md`, `1_Founder_Agreement.md` | Diligence+ |
| `/investor/deck` | `16_Pitch_Deck.md` | Evaluation+ |
| `/legal/term-sheets` | `18_Term_Sheet.md` (template), executed versions | Exclusive |
| `/legal/compliance` | `15_Legal_Compliance_Document.md` | All tiers |
| `/legal/contracts` | `4_Shareholders_Agreement.md`, `3_Co_Founder_Exit_Clause.md` | Investor+ |

---

## 8. REGION LICENSING MARKETPLACE

### 8.1 Territory Grid

| Region | Status | Base Licence Fee (indicative) | Royalty | Notes |
|--------|--------|------------------------------|---------|-------|
| North America | Available | TBD | 5% net sales | FDA CNADA lead market |
| EU (incl. UK) | Available | TBD | 5% net sales | VICH-aligned; may split UK post-Brexit |
| UAE / MENA | Available | TBD | 5% net sales | Early-access pilot ready |
| APAC (excl. China) | Available | TBD | 5% net sales | To be defined per market |
| Australia / NZ | Available | TBD | 5% net sales | VICH via EU pathway |
| Global | Available only as bundle | Premium | 5% net sales | Requires all regions |

*Status options: Available, Under Evaluation, Under Negotiation, Licensed, Reserved*

### 8.2 Marketplace UX
- World map with colour-coded regions
- Click region → see trial enrollment data for that market, average treatment price, estimated TAM, current status
- Select region → generate term sheet pre-filled with region, royalty, and suggested milestones
- Submit for Byrock approval → enters negotiation state

---

## 9. COMPLIANCE & SECURITY MODEL

| Requirement | Implementation |
|-------------|---------------|
| **21 CFR Part 11** (electronic records / signatures) | DocuSign / OpenSign with audit trail; Supabase audit logs; immutable append-only `audit_trail` table |
| **GDPR** | Role-based data minimisation; right to erasure for non-legal records; data processing agreement |
| **Dynamic Watermarking** | PDF watermark service injecting `{user_name} | {company} | {timestamp} | CONFIDENTIAL` on every page on download |
| **Access Control** | Supabase RLS + application-level RBAC |
| ** Encryption at Rest** | Supabase default (AES-256) + application-level encryption for high-sensitivity financials |
| **Encryption in Transit** | TLS 1.3 minimum (Supabase + Vercel default) |
| **Audit Trail** | Every view, download, edit, sign, payment logged to `access_logs` with IP, user agent, timestamp |
| **Retention** | 7 years for deal documents; indefinite for regulatory filings |

---

## 10. DEVELOPMENT ROADMAP

### Phase 0: Foundation (Weeks 1–4)
- [ ] Set up Supabase project, auth, database schema (Section 5.2 tables)
- [ ] Set up React + Vite + shadcn/ui frontend scaffold
- [ ] Deploy Vercel preview environments
- [ ] Configure Stripe Connect + webhooks

### Phase 1: NDA Gate + Document VDR (Weeks 5–10)
- [ ] NDA signing flow (DocuSign API)
- [ ] Document upload + metadata tagging interface (admin)
- [ ] Document list + download with watermarking
- [ ] Role-based access (evaluation / diligence / exclusive)
- [ ] Audit log UI

### Phase 2: Data Room + Trial Dashboard (Weeks 11–16)
- [ ] CMC, IP, Financial, Investor sections
- [ ] Live Trial Dashboard: Supabase Realtime subscriptions for `trial_events`
- [ ] Anonymised LAM-00007 data seeded
- [ ] Pitch Deck viewer with auto-advance

### Phase 3: Term Sheet Engine (Weeks 17–22)
- [ ] `18_Term_Sheet.md` → JSON schema for editable fields
- [ ] Term sheet builder UI (region, upfront, milestones, royalty, territory)
- [ ] Versioned redlines (compare v1 vs v2)
- [ ] DocuSign envelope creation from term sheet
- [ ] Payment trigger on fully signed term sheet

### Phase 4: Region Marketplace + Cap Table (Weeks 23–28)
- [ ] Interactive world map with region status
- [ ] Region selection → term sheet pre-fill
- [ ] Full Cap Table view (investor-only)
- [ ] Real-time cap table updates (Supabase Realtime)
- [ ] Financial dashboard with live charts

### Phase 5: Enterprise Hardening (Weeks 29–36)
- [ ] OpenSign self-hosted evaluation (replace DocuSign)
- [ ] OnlyOffice in-app document preview
- [ ] Advanced audit log + compliance reporting
- [ ] Load testing + security review
- [ ] 21 CFR Part 11 gap analysis with regulatory counsel

---

## 11. OPEN QUESTIONS & DECISIONS

1. **E-Signature vendor:** DocuSign (faster, standard) vs. OpenSign self-hosted (cost, control) — decide before Phase 3
2. **Watermarking:** Generate on download (fast) vs. on-demand rendering with OnlyOffice (richer) — depends on doc volume
3. **Real-time trial data volume:** Supabase Realtime fine for <1k events/hour; budget for NATS/Kafka if scaling beyond
4. **Multi-currency / settlement:** Stripe Connect handles splits; if region licences involve third-party distributors, consider MangoPay
5. **IPFS / document hashing:** Optional immutability layer for regulatory-grade audit; adds complexity
6. **Investor vs. Licensee separation:** Same platform or separate portals? Recommend same auth, different dashboards
7. **Mobile app:** Responsive web first; native iOS/Android only if vets/field staff need it (not primary)
8. **AI assistant:** Add later phase — chat over CMC + trial docs for Q&A (e.g., “What is the formulation lock date?”)

---

*This architecture is current as of June 2026 and should be revisited after first licence term is executed and real partner workflows are observed.*
