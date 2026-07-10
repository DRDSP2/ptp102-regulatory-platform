# ECC Repo Audit: ptp102-regulatory-platform

## 1. Repo Identity
- **Path:** `~/Documents/ptp102-regulatory-platform`
- **Remote:** `https://github.com/DRDSP2/ptp102-regulatory-platform.git`
- **Language:** TypeScript 6 + React 19
- **Framework:** Vite 8 + TailwindCSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Total commits:** 26
- **Maturity:** ~3 months old (init Jun 22, last commit Jun 24)
- **Authors:** DRDSP2 (16 commits), Daniel Shanahan-Prendergast (10 commits)
- **Branches:** `main` only; no tags
- **License:** Unlicense / private (no LICENSE file present)

## 2. CI/CD and Automation Surface

| Type | Path | Trigger | Recurrence | Representative Commands | Approval Gated |
|------|------|---------|------------|------------------------|----------------|
| CI workflow | `.github/workflows/ci.yml` | push to main/develop, PR, manual | Every push | `npm ci`, `npm run typecheck`, `npm run lint`, `npm run build`, `supabase migration list` | No |
| 4Everland deploy | `4everland.json` | On every push to main (auto) | Continuous | `npm run build`, output `dist/` | No |
| Lint | `eslint.config.js` | On demand / CI | Per commit | `eslint .` | No |
| Typecheck | `tsconfig*.json` | On demand / CI | Per commit | `tsc --noEmit` | No (continue-on-error) |
| Supabase migration check | `.github/workflows/ci.yml` job `database-migration` | PR / push to main | Per commit | `supabase migration list`, `supabase db diff` | No (continue-on-error) |

**Missing automations found:**
- No pre-commit hooks (`.husky/`, `.pre-commit-config.yaml`, `lefthook.yml` all absent)
- No dependency scanning (no Snyk, Dependabot, `npm audit` in CI)
- No secret scanning in CI
- No branch protection rules encoded in repo
- No codeowners file
- No Dockerfile / container config

## 3. Domain Skills Matrix

| Skill ID | Name | Trigger | Artifacts to Read |
|----------|------|---------|-------------------|
| S1 | **Supabase Auth + RLS** | Any write to patients, treatments, assessments, labs, AEs, audit_logs | `supabase/schema.sql`, `src/lib/api.ts`, `src/hooks/use-auth.tsx` |
| S2 | **21 CFR Part 11 Audit Trail** | Any data mutation (create/update/delete on clinical tables) | `supabase/functions/audit-webhook/index.ts`, `supabase/complete_setup.sql`, `src/features/audit/AuditLogs.tsx` |
| S3 | **Data Lock Workflow** | Transitioning patient record state: Open → Locked → Frozen | `supabase/schema.sql` (patient status enum + audit insert), `src/lib/api.ts` (lockPatient, freezePatient) |
| S4 | **Consent + PDF Generation** | Creating or signing informed consent | `supabase/functions/generate-consent-pdf/index.ts`, `supabase/schema.sql` (informed_consents table) |
| S5 | **FDA Adverse Event Reporting** | Submitting or updating an AE | `supabase/functions/fda-report/index.ts`, `src/lib/api.ts` (submitFdaReport) |
| S6 | **Drug Shipment + Bottle Inventory** | Creating shipments, updating bottle tracking, storage confirmation | `supabase/schema.sql` (drug_shipments, bottle_inventory, storage_confirmations), `src/features/shipments/Shipments.tsx` |
| S7 | **Veterinarian Onboarding** | Registering a new vet user | `supabase/functions/create-vet-profile/index.ts`, `supabase/schema.sql` (veterinarians table) |
| S8 | **Deal Room (commercial)** | Admin or vet accessing deal room | `src/features/dealroom/DealRoom.tsx`, `src/app/App.tsx` (role guards) |

## 4. Commands

| Cmd ID | Name | Shell Command | Trigger | Prereqs |
|--------|------|---------------|---------|---------|
| C1 | Dev server | `npm run dev` | Local development | `npm install` done, `.env.local` present |
| C2 | Build | `npm run build` | CI and deploy | `npm ci` done |
| C3 | Lint | `npm run lint` | On demand / CI | Dependencies installed |
| C4 | Typecheck | `npm run typecheck` | On demand / CI | Dependencies installed |
| C5 | Preview | `npm run preview` | Post-build verification | `npm run build` done |
| C6 | Supabase migration list | `cd supabase && supabase migration list --linked` | CI database-migration job | Supabase CLI installed |
| C7 | Supabase dry-run diff | `supabase db diff --schema public --use-migra` | CI database-migration job | Supabase project linked |
| C8 | Supabase auth seed | Run `supabase/functions/create-vet-profile` + insert into `admin_users` via SQL | Initial setup | Live Supabase project |
| C9 | 4Everland deploy | Auto-deploy on push to `main` (configured in `4everland.json`) | Push to main | GitHub repo connected to 4Everland |

## 5. Rules

### Structural
| Rule | Evidence | Enforcement | Severity |
|------|----------|-------------|----------|
| Route structure: admin/* and vet/* nested under RequireAuth | `src/app/App.tsx` | Manual code review | Blocking |
| Feature modules live in `src/features/<name>/` | Directory layout | Manual | Advisory |
| All Supabase calls routed through `src/lib/api.ts` | Codebase scan | Manual | Advisory |
| Edge Functions in `supabase/functions/<name>/index.ts` | Directory layout | Manual | Advisory |

### Safety
| Rule | Evidence | Enforcement | Severity |
|------|----------|-------------|----------|
| `.env` not committed (only `.env.example`) | `.gitignore` | Git | Blocking |
| Supabase service-role key NOT in frontend code | `.env.example` + code review | Manual | Blocking (by convention) |
| Patient soft-delete via `deleted_at` (no hard delete) | `api.ts`, `schema.sql` | Manual | Blocking (regulatory) |
| Auth required on all clinical routes | `App.tsx` RequireAuth | Manual | Blocking |
| Role check on admin/vet sections | `App.tsx` RequireRole | Manual | Blocking |

### Quality
| Rule | Evidence | Enforcement | Severity |
|------|----------|-------------|----------|
| `tsc --noEmit` must pass (or be continue-on-error) | CI `ci.yml` | CI | Advisory |
| ESLint must pass with 0 errors | CI `ci.yml` | CI | Blocking |
| Typecheck skipped in `build` script (`skip tsconfig check`) | `package.json` build script | Vite inline | Advisory |

### Rollout
| Rule | Evidence | Enforcement | Severity |
|------|----------|-------------|----------|
| Production deploys on push to main only | `ci.yml` if-condition | CI | Blocking |
| Preview deploys on PR only | `ci.yml` deploy-preview job | CI | Blocking |
| No feature flags or canary stages | Absence in code/CI | N/A | Advisory |

### Performance
| Rule | Evidence | Enforcement | Severity |
|------|----------|-------------|----------|
| Static assets served with 1-year cache via `4everland.json` rewrites | `4everland.json` | 4Everland config | Advisory |
| No bundle size limit encoded | Absent | N/A | Advisory |

## 6. Hooks and Guardrails

| Gate | Location | Type | Notes |
|------|----------|------|-------|
| ESLint 0 errors required | `.github/workflows/ci.yml` → lint-and-test job | CI gate | Blocking |
| TypeScript `tsc --noEmit` | `.github/workflows/ci.yml` → lint-and-test job | CI gate | continue-on-error; not truly blocking |
| Build must succeed | `.github/workflows/ci.yml` | CI gate | Blocking |
| Supabase migration dry-run | `.github/workflows/ci.yml` → database-migration job | CI gate | continue-on-error; not truly blocking |
| Auth guard (RequireAuth) | `src/app/App.tsx` | Application gate | Blocks unauthenticated access |
| Role guard (RequireRole) | `src/app/App.tsx` | Application gate | Blocks unauthorized roles |
| .env exclusion | `.gitignore` | Git guard | Blocks secrets in repo |
| Security headers | `4everland.json` | Platform guard | X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy |

**Missing guardrails found:**
- No pre-commit hooks (lint, typecheck, secrets scan)
- No branch protection rules in repo metadata (unclear if enforced on GitHub)
- No Dependabot / Renovate for dependency updates
- No secret scanning in CI (TruffleHog, gitleaks, GitHub secret-scanning)
- No CSP (Content-Security-Policy) header configured
- No 2FA enforcement in auth flow
- No CSRF token handling visible

## 7. Rollout Plan for AI Coding Agents

### Phase 1 — Read-only agents (Week 1)
- **Scope:** Code review comments, issue triage, security suggestions only
- **Skills loaded:** S1–S8 (domain skills from column 3)
- **Commands allowed:** Read-only inspection (`npm run lint --dry`, `npm run typecheck`, grep-based search)
- **Gate:** Zero unapproved mutations in first 5 PRs; human approval on all suggestions

### Phase 2 — Restricted write (Weeks 2–4)
- **Scope:** Draft PRs, lint fixes, typecheck fixes, non-production scripts, schema migration scripts
- **Skills loaded:** S1–S8, C1–C9, Rules as constraints
- **Commands allowed:** `npm run lint --fix`, `npm run typecheck`, `git commit` on feature branches only, `supabase migration new`
- **Gate:** PR review human-approval rate > 70%; 0 production incidents

### Phase 3 — Guided write (Months 2–3)
- **Scope:** Feature work in owned feature directories under review; Supabase Edge Function fixes
- **Skills loaded:** Full extracted repo skill set (S1–S8, C1–C9, all rules)
- **Commands allowed:** `npm run build`, `npm run dev`, `npm run test` (if added), Supabase migrations on dev/staging
- **Gate:** Rollback plan defined and tested for each area; human sign-off on release trains

### Phase 4 — Autonomous bounded (Month 4+)
- **Scope:** Maintenance, dependency updates, non-breaking refactors, audit log improvements, consent PDF tweaks
- **Skills loaded:** Full + learned patterns from Phase 1–3
- **Commands allowed:** All non-destructive commands above; `npm audit fix` (minor patches), bumping patch versions
- **Gate:** Monthly human audit of agent-authored PRs; rollback SLA < 15 minutes; regression test suite gates merges

---

## Security Audit Summary

### Critical findings
- **Wildcard CORS** in all 4 Edge Functions (`Access-Control-Allow-Origin: *`) — restrict to your domain in production
- **Supabase anon key partially visible** in `.env.example` (eyJhbG...), though truncated
- **No dependency scanning / Snyk / Dependabot** in CI — `npm audit` never runs
- **No secret scanning** in CI — no gitleaks or TruffleHog guardrail

### High findings
- **Missing CSP header** — X-XSS-Protection is set but CSP is absent; add `Content-Security-Policy`
- **No CSRF protection** visible in Supabase client calls or forms
- **No session timeout** logic visible in auth hook
- **Continue-on-error on migration checks** — schema drift passes silently in CI
- **Typecheck set to continue-on-error** — TS errors don't block deploys

### Advisory findings
- **No pre-commit hooks** — lint/typecheck/secrets should run on commit
- **No branch protection rules** encoded in repo — enforce required PR reviews + status checks on GitHub
- **Missing CODEOWNERS** — no automatic reviewer assignment
- **Continue-on-error on typecheck** — change to blocking once ESLint errors are stable
- **No Dockerfile** — local dev environment bootstrapping relies on manual Node/NPM install

### Recommendations (prioritized)
1. Restrict CORS to `byrock.eth.limo` in all Edge Functions
2. Add `npm audit` and gitleaks to CI
3. Add CSP header to `4everland.json`
4. Switch typecheck CI gate from `continue-on-error` to blocking
5. Add `.husky/pre-commit` with `npm run lint && npm run typecheck`
6. Remove the full `eyJhbG...` anon key from `.env.example` even as placeholder — use a value clearly labeled fake
7. Set branch protection rules on GitHub: required PR reviews, required status checks, no force-push
8. Add `Content-Security-Policy` header via `4everland.json` rewrites
9. Consider adding `helmet`-style security headers if you ever move to a Node backend
10. Add 2FA enforcement via Supabase Auth settings (configurable per project)
