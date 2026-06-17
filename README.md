# PTP-102 Laminitis Trial Platform

FDA 21 CFR Part 11 / ICH-GCP E6(R2) compliant clinical trial management platform for PTP-102 (Canopus BioPharma) equine laminitis study.

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Supabase CLI (`npm i -g supabase`)
- 4Everland CLI (`npm i -g @4everland/cli`)

### 1. Clone & Install
```bash
git clone https://github.com/DRDSP2/ptp102-regulatory-platform.git
cd ptp102-regulatory-platform
npm install
```

### 2. Supabase Setup
```bash
# Link to your Supabase project
supabase link --project-ref vtxrmjuftqtealzymqbk

# Apply complete schema (run in Supabase SQL Editor instead for production)
# Copy contents of supabase/complete_setup.sql → Supabase Dashboard → SQL Editor → Run

# Generate TypeScript types
supabase gen types typescript --project-id vtxrmjuftqtealzymqbk --schema public > src/lib/database.types.ts
```

### 3. Environment
```bash
cp .env.example .env.local
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

### 4. Local Development
```bash
npm run dev
# → http://localhost:5173
```

---

## 🔐 Admin Login Credentials

| Role | Email | Password | UUID |
|------|-------|----------|------|
| **Super Admin** | `drdsp@pm.me` | `PTP102admin!` | `ccb4a074-b438-4cd7-b591-5d0922fff58e` |
| **Veterinarian** | `phyto2002@gmail.com` | `Test123456` | `83ee08a6-9f55-4901-9e2c-1b6572f9160a` |

> ✅ **Both users are pre-created in Supabase Auth** — just run the SQL to create their profile records.

---

## 📋 Complete Supabase Schema

Run `supabase/complete_setup.sql` in **Supabase Dashboard → SQL Editor**. It creates:

### Tables (17)
- `study_settings` — Protocol config (IND, endpoints, enrollment)
- `veterinarians` — Vet profiles + license verification
- `administrators` — Admin roles (super_admin, admin, monitor)
- `sites` — Clinical sites with ICA approval tracking
- `patients` — Equine patients with randomization
- `treatments` — PTP-102 dosing records
- `clinical_assessments` — AAEP grades, lameness scores, imaging
- `lab_results` — JSON-based lab panels
- `videos` — Gait analysis uploads (IPFS-backed)
- `adverse_events` — MedDRA-coded AE/SAE with E2B(R3) export
- `informed_consents` — E-signatures with SHA-256 hashing (21 CFR Part 11)
- `drug_shipments` — Batch tracking + temperature logs
- `drug_bottles` — Bottle-level inventory
- `storage_logs` — 2-8°C monitoring (refrigerator/freezer/ultra-low)
- `protocol_deviations` — Eligibility, procedure, medication, safety
- `monitoring_visits` — Site monitoring (initiation/routine/closeout)
- `audit_logs` — Immutable trail on ALL tables (RLS + triggers)

### Row Level Security
- `admin` = full CRUD on all tables
- `vet` = own patients + assessments/treatments/labs/videos they create
- `patient` data = site-scoped visibility

### Indexes
- Patient lookup by `patient_number` (unique)
- AE by `patient_id` + `onset_date`
- Audit by `table_name` + `record_id` + `created_at`
- Consent by `patient_id` + `consent_date`

### Functions
- `create_vet_profile()` — called by auth trigger on vet signup
- `generate_consent_pdf()` — Edge Function PDF generator
- `fda_e2b_report()` — Edge Function E2B(R3) XML generator
- `get_next_patient_number()` — Auto-increment per site

---

## 🏗️ Project Structure

```
src/
├── app/App.tsx                    # Routing + role guards
├── features/
│   ├── login/Login.tsx            # Supabase Auth UI
│   ├── dashboard/Dashboard.tsx    # Role-based landing
│   ├── patients/Patients.tsx      # Admin: full CRUD + search
│   ├── consent/ConsentWorkflow.tsx# Admin: e-sign + PDF
│   ├── adverse-events/AdverseEvents.tsx # Admin/Vet: AE + SAE
│   ├── shipments/Shipments.tsx    # Admin: drug supply chain
│   ├── reports/Reports.tsx        # Admin: FDA E2B(R3) export
│   ├── settings/Settings.tsx      # Admin: study config + vet mgmt
│   ├── audit/AuditLogs.tsx        # Admin: 21 CFR Part 11 trail
│   └── veterinarians/
│       └── VeterinarianDashboard.tsx # Vet: own patients + data entry
├── hooks/use-auth.tsx             # Auth context + role detection
├── lib/
│   ├── api.ts                     # All CRUD + Edge Function calls
│   ├── supabase.ts                # Supabase client
│   └── database.types.ts          # Generated TS types
└── main.tsx                       # Entry point
```

---

## 🔧 4Everland IPFS Deployment

### Configuration
- **Project ID**: `6a2abe9085252f000741a1de`
- **Domain**: `byrock.eth.limo` (ENS → IPFS gateway)
- **Config**: `4everland.json`

### Auto-Deploy (GitHub Actions)
```yaml
# .github/workflows/ci.yml triggers on push to main
# Requires repository secrets:
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - FOUR_EVERLAND_TOKEN
```

### Manual Deploy
```bash
npm run build
npx 4everland deploy dist --project-id 6a2abe9085252f000741a1de --alias byrock.eth.limo
```

### SPA Routing
- `public/_redirects` handles `/* → /index.html` (200)
- 4Everland `rewrites` in config for IPFS gateway

---

## 📦 Supabase Edge Functions

Deploy via Supabase CLI or Dashboard:

```bash
supabase functions deploy create-vet-profile
supabase functions deploy generate-consent-pdf
supabase functions deploy fda-report
supabase functions deploy audit-webhook
```

| Function | Purpose |
|----------|---------|
| `create-vet-profile` | Auto-create vet record on auth signup |
| `generate-consent-pdf` | PDF with signatures + SHA-256 |
| `fda-report` | E2B(R3) XML for FDA Gateway |
| `audit-webhook` | External SIEM integration |

---

## 📋 Regulatory Compliance Checklist

### FDA 21 CFR Part 11
- ✅ Electronic signatures on consent (SHA-256 hash stored)
- ✅ Audit trail on ALL tables (triggers → `audit_logs`)
- ✅ User access controls (RLS policies by role)
- ✅ Record locking (soft-delete, no hard delete)
- ✅ Timestamped, attributable actions

### ICH-GCP E6(R2)
- ✅ Investigator qualification (license verification)
- ✅ Site monitoring visits (initiation/routine/closeout)
- ✅ Protocol deviation tracking
- ✅ Informed consent workflow (versioned)
- ✅ AE/SAE reporting (15-day serious, 30-day non-serious)

### PTP-102 INAD Specific
- ✅ Drug shipment tracking (batch + temperature)
- ✅ Bottle-level inventory (received → dispensed → returned)
- ✅ Storage monitoring (2-8°C refrigerator, -20°C freezer)
- ✅ Veterinarian credential verification
- ✅ FDA E2B(R3) export ready

---

## 🛠️ Available Scripts

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check
npm run db:types     # Regenerate TS types from Supabase
npm run db:diff      # Check migration diff
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | ✅ | `https://vtxrmjuftqtealzymqbk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Anon key from Supabase dashboard |
| `FOUR_EVERLAND_TOKEN` | CI only | 4Everland API token for auto-deploy |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions | Service role for backend ops |

---

## 📚 Key References

- **Supabase Project**: https://supabase.com/dashboard/project/vtxrmjuftqtealzymqbk
- **4Everland Dashboard**: https://dashboard.4everland.org/projects/6a2abe9085252f000741a1de
- **Production URL**: https://byrock.eth.limo
- **GitHub Repo**: https://github.com/DRDSP2/ptp102-regulatory-platform

---

## 👥 Team

- **Sponsor**: Byrock Technologies Ltd (Canopus BioPharma)
- **Study Director**: Dr. Daniel Shanahan-Prendergast (drdsp@pm.me)
- **Investigator**: Dr. Pamela Tiebler (phyto2002@gmail.com)
- **FDA IND**: See `study_settings.fda_ind_number`

---

## 📄 License

Proprietary — Byrock Technologies Ltd / Canopus BioPharma. All rights reserved.