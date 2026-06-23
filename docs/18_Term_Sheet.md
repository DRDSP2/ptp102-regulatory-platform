# PTP-102 TERM SHEET — REUSABLE APP TEMPLATE
**Version:** 2.0  
**Date:** June 2026  
**Purpose:** Master term sheet template for the Byrock Licensing & Investor Deal Room app. This document is the source of truth for the Term Sheet Builder engine. All variable fields map directly to database columns in `term_sheets` and `term_sheet_versions` in the app.  
**Legal Status:** Non-binding summary of principal terms; subject to mutual execution of definitive Licence Agreement.  
**App Integration:** See `Platform_Architecture.md` Section 3 (`Term Sheet Engine`) and Section 6 (`Core User Flow — Exclusive Negotiation Tier`).

---

## TERM SHEET METADATA (App Payload)

```json
{
  "template_id": "ts-ptp102-v1",
  "template_name": "PTP-102 Global Region Licence",
  "status": "draft | proposed | negotiated | signed | executed",
  "prospect_company": "[LICENSEE LEGAL NAME]",
  "prospect_user_id": "[UUID]",
  "region": "north_america | eu | uk | uae | apac | global",
  "upfront_fee": null,
  "milestone_schedule": [
    { "event": "Regulatory approval", "amount": null },
    { "event": "First commercial sale / trial activation", "amount": null },
    { "event": "Sales milestone ($10M net sales)", "amount": null }
  ],
  "royalty_rate": 0.05,
  "minimum_annual_royalty": null,
  "exclusivity_months": 30,
  "sublicensing_allowed": false,
  "created_by": "[BYROCK ADMIN UUID]",
  "version": 1,
  "parent_term_sheet_id": null
}
```

---

## 1. LICENCE SUMMARY

> This Term Sheet summarises the principal terms under which **BYROCK CLINICAL LTD** (the “Company”) proposes to licence the PTP-102 equine clinical biomarker technology to **[LICENSEE LEGAL NAME]** (the “Licensee”) for the territory defined below. This Term Sheet is non-binding and subject to mutual execution of definitive documents.

| Field | App Variable | Value / Placeholder |
|-------|--------------|---------------------|
| Scope | `licence_scope` | `exclusive` / `non-exclusive` licence to commercialise, distribute, and develop PTP-102 in the territory defined in Section 3. |
| Field of Use | `field_of_use` | Veterinary therapeutics, diagnostics, and clinical monitoring for equine laminitis and inflammatory conditions. |
| Exclusivity Window | `exclusivity_months` | **6 months** from signing of this Term Sheet, unless extended by mutual written agreement. |

---

## 2. LICENCE FEE & ROYALTIES

| Component | App Variable | Formula / Default | Notes |
|-----------|--------------|-------------------|-------|
| Upfront Licence Fee | `upfront_fee` | Negotiated per region | See deal-structure guidance in `MASTER_Financial_Parameters.md` |
| Milestone — Regulatory Approval | `milestone[0]` | TBD | EMA/FDA/___ jurisdiction-specific |
| Milestone — First Commercial Sale | `milestone[1]` | TBD | Trial activation or first dispensation |
| Milestone — Sales Threshold | `milestone[2]` | TBD | E.g., $10M cumulative net sales |
| Running Royalty | `royalty_rate` | **5%** on net sales | Industry benchmark for late-discovery asset with 18–20% operating margin |
| Minimum Annual Royalty | `minimum_annual_royalty` | TBD / optional | Ensures baseline commitment |

*App behaviour: When Licensee selects a region in the Region Marketplace (see `Platform_Architecture.md` Section 8), the Term Sheet Builder auto-populates suggested royalty = 5% and default milestone schedule. Licensee edits fields; Byrock receives proposal notification.*

---

## 3. TERRITORY

| Field | App Variable | Value / Placeholder |
|-------|--------------|---------------------|
| Granted Territory | `region` | Select from: `north_america`, `eu`, `uk`, `uae`, `apac`, `global` |
| Sublicensing Rights | `sublicensing_allowed` | `Yes` or `No`. If `Yes`, subject to Company prior written consent. |
| Reservation of Rights | `reservation` | Company retains all rights outside the granted territory and rights to practise the Technology for non-commercial research. |

*App behaviour: Region selected via world map in Region Marketplace. If `global` selected, all regions lock and `upfront_fee` = premium bundle price.*

---

## 4. DILIGENCE COMMITMENTS

| Commitment | App Variable | Placeholder |
|------------|--------------|-------------|
| Launch Timeline | `launch_months_post_approval` | _____ months from regulatory approval in territory |
| Minimum Annual Spend | `min_annual_spend` | $_________ on marketing / development |
| Reporting Cadence | `reporting_cadence` | _____ / annual sales / development updates |

---

## 5. CONDITIONAL APPROVAL & CMC PATHWAY

> This section aligns the licence terms with the regulatory timeline and CMC scope defined in `CMC.md` and `CMC_Development_Plan.md`.

| Item | Value / Placeholder |
|------|---------------------|
| Regulatory Target | FDA CVM Conditional NADA (CNADA) via MUMS; target conditional approval **3Q28** |
| CMC Lead | [Licensee name] or third-party CMO (to be designated during exclusivity) |
| CMC Scope | API manufacturing, formulation lock, stability, QC, scale-up — to be scoped by Licensee during exclusivity period |
| CMC Cost Responsibility | Borne by Licensee unless otherwise agreed in definitive Licence Agreement |
| Data Ownership | Regulatory-grade CMC data generated by Licensee is licensed to Company for global regulatory filings and partner onboarding |
| Exclusivity Deliverable | Licensee to provide CMC cost estimate and manufacturing plan within **6 months** of Term Sheet signing |

*App behaviour: This section auto-injected from `CMC.md` and `CMC_Development_Plan.md` data. Licensee can acknowledge or propose edits during negotiation.*

---

## 6. INTELLECTUAL PROPERTY

| Item | Value / Placeholder |
|------|---------------------|
| Background IP | PTP-102 IP, biomarker methods (oltipraz, zofroxia, mogrosides, camel antibodies/PTP-100, cirsiliol, CB3700/CB3701, BioBarcode/WARF), patents, and trademarks remain owned by Byrock Clinical Ltd. |
| Foreground IP | Improvements made by Licensee in the course of commercialisation may be jointly owned or exclusively licensed back to Company as negotiated. |
| Trademark Licence | Licensee may use BYROCK / PTP-102 trademarks per Company brand guidelines. |

---

## 7. GOVERNANCE

| Item | Value / Placeholder |
|------|---------------------|
| Steering Committee | Monthly / quarterly governance calls for roadmap alignment. |
| Escalation | Disputes escalate from project managers to CEO / sponsor level within 10 business days. |

---

## 8. CONFIDENTIALITY

All commercial terms, clinical data, biomarker assay details, and CMC specifications are confidential until public announcement or regulatory disclosure. This obligation survives termination for **5 years**.

---

## 9. CONDITIONS PRECEDENT

1. Execution of definitive Licence Agreement (including schedules for IP, payments, reporting).
2. Completion of mutually satisfactory due diligence.
3. Regulatory and antitrust consent (if required).

---

## 10. GOVERNING LAW

Republic of Ireland [or applicable jurisdiction agreed during negotiation].

---

## 11. EXCLUSIVITY TERMS

| Field | App Variable | Value / Placeholder |
|-------|--------------|---------------------|
| Exclusivity Period | `exclusivity_months` | **6 months** from signing of this Term Sheet |
| Exclusivity Scope | `exclusivity_scope` | Granted territory only (non-global during exclusivity) |
| Exclusivity Fee (if any) | `exclusivity_fee` | TBD / credited against upfront on execution |

*App behaviour: Clock starts on Term Sheet `signed` status. Region marketplace locks the territory during exclusivity. Overdue exclusivity → auto-release back to Available.*

---

## 12. PAYMENT & EXECUTION

| Step | Trigger | App Action |
|------|---------|-----------|
| Term Sheet Proposed | Licensee submits in negotiation phase | Email to Byrock deal team; `status = proposed` |
| Counter-Signature | Byrock accepts or counters | `status = negotiated` |
| DocuSign / OpenSign | Both parties sign | `status = signed`; audit log updated |
| Payment | Stripe webhook on success | `status = executed`; `licences` record created; region locked |
| Post-Execution Access | Auto | Full data room unlocked for region |

---

## 13. TEMPLATE VERSION CONTROL

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Oct 2024 | Cormac Jones / Byrock Technologies Ltd | Base model from Financial Model — Byrock.xlsx |
| 2.0 | June 2026 | Daniel Shanahan-Prendergast | Converted to app template; added region marketplace, CMC pathway, milestone JSON schema, payment flow, exclusivity automation |

---

## 14. NEXT STEPS (AFTER SIGNING)

1. Conduct mutual due diligence (Company provides additional data room access).
2. Finalise and execute definitive Licence Agreement and schedules.
3. Closing and first licence fee payment (Stripe).
4. Post-signing onboarding and integration (CMC plan kickoff, regulatory handover).
5. Exclusivity period begins — Licensee to deliver CMC cost estimate and manufacturing plan within 6 months.

---

**Prepared by:** _______________________  
**Date:** __________  
**Ref:** BYROCK-TS-PTP102-____  
**App Template ID:** ts-ptp102-v1

*This Term Sheet is confidential and intended solely for the addressee. Financial and deal assumptions are set out in `MASTER_Financial_Parameters.md`. CMC development details and partner manufacturing scope are documented in `CMC.md` and `CMC_Development_Plan.md`.*
