# SELEDA ERP — Consolidated Architecture Alignment Roadmap

**Date:** July 15, 2026  
**Scope:** Full-stack React + Express + Supabase hotel ERP  
**Inputs reviewed:**
- `Arcticture/` — 13 module/portal architecture base prompts
- `ERP_AUDIT_REPORT.md`
- `SYSTEM_ADMIN_AUDIT.md`
- `FOLIO_DISCREPANCY_ANALYSIS.md`
- `GROUP_LINKING_GAP_ANALYSIS.md`
- `ACTION_ITEMS_SUMMARY.md`, `IMPROVEMENTS.md`, `IMPLEMENTATION_GUIDE.md`
- Current source tree (`src/`, `server.ts`, `supabase/migrations/`)

---

## 1. Executive Summary

The SELEDA ERP has a **broad, attractive UI surface** across every hotel department but an **under-enforced, fragmented foundation**. The 13 architecture documents describe a single, integrated system with clear data ownership, defense-in-depth security, and shared operational services. The current implementation is close to that vision in places (public booking portal, folio fixes, USALI COA seed, B2B operator/allotment engine) but still has major architectural drift:

1. **Two-backend problem:** most operational/admin writes go directly from the browser to Supabase via the public `anon` key, bypassing the Express server and its permission checks.
2. **Cosmetic security:** MFA, lockout, IP/device restrictions, password policy, and granular RBAC are configurable in the UI but not enforced.
3. **Dual ledger:** guest billing is calculated independently in the frontend (`reservation.charges/payments` JSONB) and backend (`folios/folio_lines/folio_payments`).
4. **Monolithic backend:** `server.ts` carries 60+ routes and thousands of lines with duplicated auth, mapping, and query logic.
5. **God context / duplicated state:** `ERPContext` (42KB+) overlaps with `ReservationContext`, `GuestContext`, etc.; dashboards, tables, and modals are re-implemented per portal.

This roadmap consolidates the architecture documents and audit findings into one actionable plan. It is ordered to **secure the foundation first**, then **unify data**, then **refactor UI/UX**, and finally **complete each module** against its architecture spec.

---

## 2. Reference Architecture Summary

### 2.1 Modules & Portals

| # | Module / Portal | Type | Owns | Key Consumers |
|---|-----------------|------|------|---------------|
| 1 | **System Admin Portal** | Admin | Users, roles, permissions, property/dept structure, reference data, audit trail viewer | All |
| 2 | **Executive Portal** | Executive | Read-only KPI tiles, P&L snapshot, scheduled reports | All (pulls only) |
| 3 | **Finance & Accounting** | Operational + Executive hybrid | GL/COA, AP, AR/city ledger, bank rec, fixed assets, tax/ERCA, statements, budget, period close | Front Office, F&B, Procurement, HR, Executive |
| 4 | **Front Office / PMS** | Operational | Reservations, rooms, rate plans, check-in/out, guest folio, group blocks | Housekeeping, F&B, Finance, Executive |
| 5 | **Housekeeping** | Operational | Room status, task assignments, linen/amenity par, lost & found, maintenance flags | Front Office, Maintenance, Executive |
| 6 | **F&B** | Operational | Outlets, POS, recipes, inventory/stores, BEO, waste/void tracking | Front Office, Finance, Procurement, Executive |
| 7 | **Maintenance / Engineering** | Operational | Work orders, PM schedules, equipment register, spare parts, OOO/OOS | Front Office, Housekeeping, Executive |
| 8 | **HR & Payroll** | Operational + feed | Employee records, attendance/shifts, leave, payroll gross-to-net, payslips | Finance (GL batch), Executive |
| 9 | **Procurement & Stores** | Operational | Requisitions, POs, goods receipt, main store, supplier master (shared with AP) | Finance AP, F&B, Maintenance, Housekeeping |
| 10 | **Sales & Events** | Operational | Leads, proposals, contracts, corporate accounts, group blocks, BEO handoff | Front Office, F&B, Finance AR, Executive |
| 11 | **Public Page Editor** | Admin / Content | Pages, blocks, media, SEO, legal review gate | Guest Portal |
| 12 | **Guest Portal** | Public | Public site render, booking engine, manage-my-booking, in-stay requests, folio view | Front Office, Housekeeping, F&B, Maintenance, Finance |
| 13 | **B2B / Operator Portal** *(emerged)* | Operational | Tour operators, allotments, contracts, operator rates, AR ledger | Executive, Finance |

### 2.2 Core Data-Ownership Rules (from architecture docs)

- **Front Office owns the guest folio**; every revenue module (F&B, POS, gift shop, spa) posts charges *to* it, never maintains its own copy.
- **Finance owns the General Ledger**; other modules post journal batches (F&B COGS/revenue, HR labor, bank, POS) but do not own COA.
- **System Admin owns users, roles, departments, room types, tax codes, currencies**; all other modules read-only.
- **Sales & Events owns the commercial pipeline**; accepted contracts create Group Blocks in Front Office and BEOs in F&B.
- **Guest Portal is a booking *channel***, not a reservation store; bookings become Front Office reservations.
- **Public Page Editor owns published content**; Guest Portal renders it.
- **Procurement & Stores owns supplier master and main store**; Finance AP shares the supplier record.
- **HR owns payroll calculation**; posts a labor-cost journal batch to Finance.
- **Executive Portal computes nothing** — it aggregates read-only KPIs from each module's own reporting layer.

### 2.3 Cross-Cutting Non-Functional Requirements

Every module is expected to support:
- **Auditability:** append-only mutation log with actor, timestamp, before/after state.
- **Localization:** English default + Amharic/Tigrinya on guest/staff-facing documents and UI.
- **Currency precision:** integer minor units or fixed-decimal; never floating point for money.
- **Offline/connectivity resilience:** POS, check-in/out, and housekeeping must queue locally and sync on reconnect.
- **Performance:** near-real-time status boards; on-demand financial statements without pre-aggregation lag.
- **RBAC:** role/permission/scope matrix enforced server-side.

---

## 3. Current Codebase State

### 3.1 Repository Footprint

| Layer | File/Folder | Size / Count | Note |
|-------|-------------|--------------|------|
| Frontend components | `src/components/*` | 10 top-level + 10 portal folders, ~160 components | Heavy duplication across dashboards, tables, modals |
| Frontend contexts | `src/context/*.tsx` | 10 contexts | `ERPContext` 42KB+, `ReservationContext` 32KB+; overlapping state |
| Shared components | `src/components/Shared/` | 6 items | Under-utilized (<5% of component base) |
| Backend | `server.ts` | ~3,200 lines, 60+ routes | Monolithic, repeated auth/mapping |
| Migrations | `supabase/migrations/` | 74 files | Good coverage but no dependency graph; some drift (e.g., duplicate `063_*`, `064_*`) |
| Audit/Architecture docs | Root `.md` files + `Arcticture/` | 13 architecture + 5 audit/gap docs | The single source for this roadmap |

### 3.2 What Is Already Well-Aligned

| Area | Evidence | Architecture Fit |
|------|----------|------------------|
| Public booking engine | `BookingPage.tsx`, migrations 042–043, 048 | Guest Portal architecture: availability search → create Front Office reservation; waitlisted checkout; dynamic bank details; policy integration |
| B2B operator engine | Migrations 044–047, `B2BOperatorPortal.tsx`, `/api/b2b/*` | Sales & Events / Finance overlap: tour operators, allotments, contracts, AR ledger |
| USALI COA seed | Migration 055, `usali_chart_of_accounts` | Finance architecture: hierarchical COA, control-account flags, normal balance |
| Finance core schema | Migration 074 (`journal_entries`, `journal_lines`) | Finance architecture: GL posting engine, period-aware, source-tagged |
| Folio integrity fixes | Migrations 057–062, `ensureFolio()` fixes | Front Office/Finance integration: single folio per reservation, unified billing calculation |
| Smart Bank Accounts editor | `BusinessAdmin.tsx` parse/serialize pattern | Finance/Admin architecture: configurable bank details without schema change |

### 3.3 What Is Drifting

| Drift | Symptom | Risk |
|-------|---------|------|
| **Dual backend** | Browser writes users/roles/settings/reservations directly via `supabaseService.ts` using the anon key | Bypassable RBAC, privilege escalation, audit gaps |
| **Cosmetic security** | `forceMfa`, `allowedIps`, `passwordComplexity`, `sessionTimeout` stored but not enforced | False assurance, critical vulnerabilities |
| **Dual ledger** | Frontend `reservation.charges/payments` JSONB vs backend `folio_lines/folio_payments` tables | Persistent balance discrepancies, blocked payments |
| **God context** | `ERPContext` manages rooms, guests, reservations, packages, rate plans, GL, notifications, etc. | Re-render storms, state divergence, hard to debug |
| **Monolithic backend** | All routes in `server.ts`; repeated `getRequestUser()` calls | Maintenance burden, missing auth on new endpoints |
| **Shared-component gap** | Only 6 shared components; dashboards/tables/modals duplicated per portal | 35–40% estimated code duplication |
| **Migration drift** | Duplicate-numbered migrations (`063_*`, `064_*`, `071_*`) and ad-hoc fixes | Uncertain deploy order, potential schema conflicts |

---

## 4. Per-Module Alignment Matrix

| # | Module | Architecture Intent | Current Status | Key Gaps | Priority |
|---|--------|---------------------|----------------|----------|----------|
| 1 | **System Admin Portal** | Control plane: users, roles, reference data, audit viewer, security center, workflow engine, scheduler, backup, compliance | 🟡 Partial | Security controls cosmetic; dual role stores; missing RLS; dead auth endpoints; no config versioning/health/scheduler; Admin/Business/GlobalConfig overlap | 🔴 P0 |
| 2 | **Executive Portal** | Read-only aggregation of KPIs, P&L snapshot, scheduled reports | 🟡 Partial | Dashboards exist but pull from many local calculations; no generic KPI tile framework; B2B operators recently added; drill-down not standardized | 🟡 P1 |
| 3 | **Finance & Accounting** | GL, AP, AR, bank rec, fixed assets, tax/ERCA, statements, budget, period close | 🟡 Partial | GL tables present (migration 074); AP/AR/Folio integration partly done; fixed assets, bank rec, budget, statements, ERCA exports missing | 🟡 P1 |
| 4 | **Front Office / PMS** | Reservation lifecycle, rooms/rates, check-in/out, folio, group blocks | 🟢 Mostly implemented | Folio duality mostly fixed; group linking exists; per-room guest profiles and per-night assignments done; OTA channel manager deferred (matches architecture) | 🟢 P2 |
| 5 | **Housekeeping** | Room status board, tasks, linen par, lost & found, maintenance flags | 🟢 Mostly implemented | UI exists; real-time sync okay; mobile push deferred (matches architecture); offline resilience needs hardening | 🟢 P2 |
| 6 | **F&B** | POS, menu/recipe, stores, purchasing, BEO, waste/void, KPIs | 🟡 Partial | POS, outlets, stores UI exist; recipe costing, weighted-average COGS, BEO, offline POS queue not complete | 🟡 P1 |
| 7 | **Maintenance / Engineering** | Work orders, PM schedules, asset register, spare parts, OOO/OOS | 🟡 Partial | Work orders, asset register UI exist; PM scheduling, checklist templates, spare parts reorder not fully enforced | 🟡 P1 |
| 8 | **HR & Payroll** | Employee master, attendance/shifts, leave, payroll gross-to-net, payslips, GL batch | 🟡 Partial | Employee master, shifts, leave UI exist; payroll calculation engine, statutory deductions, GL batch posting missing; HR staff not linked to `system_users` | 🟡 P1 |
| 9 | **Procurement & Stores** | Requisition → PO → receipt, supplier master, main store, dept requisitions | 🟡 Partial | Procurement portal, requisitions, POs, suppliers exist; goods-receipt → AP bill draft, discrepancy handling, physical stock count not wired | 🟡 P1 |
| 10 | **Sales & Events** | Leads, proposals, contracts, corporate accounts, group blocks, BEO handoff | 🟡 Partial | Group bookings exist; CRM linking partial; dedicated pipeline, proposal/contract workflow, BEO handoff incomplete | 🟡 P1 |
| 11 | **Public Page Editor** | Block-based page builder, draft/preview/publish, legal review gate, media library, SEO | 🟡 Partial | Page editor schema exists; block builder, legal review gate, media library, rollback not complete | 🟡 P1 |
| 12 | **Guest Portal** | Public site render, booking engine, manage booking, in-stay requests, folio view | 🟢 Mostly implemented | Booking engine, payment, receipt, add-ons, policies all aligned; in-stay requests and folio view need wiring | 🟢 P2 |
| 13 | **B2B / Operator Portal** | Tour operators, allotments, contracts, operator rates, AR ledger | 🟢 Implemented | Matches Finance/Sales crossover; already live in Executive → B2B Operators | 🟢 P2 |

---

## 5. Cross-Cutting Gap Analysis

### 5.1 Security & RBAC

| Item | Current | Target |
|------|---------|--------|
| Auth tokens | `localStorage` still used in places; httpOnly cookie sessions exist but dual path | httpOnly cookies only; no tokens in JS |
| Permission enforcement | Client `hasPermission` + server `userCan` used only on Express routes; most mutations bypass Express | Every mutating request validated server-side |
| Granular permissions | `permissionMatrix`/`fieldPermissions` stored, never enforced | Enforce module × department × record × field scope |
| MFA / lockout / IP / device | Flags in `global_settings`; endpoints `/api/auth/verify-mfa`, etc., missing | Real TOTP/email MFA, account lockout, IP/device allowlists |
| Dev backdoor | `admin123` fallback when Supabase not configured | Removed or guarded by build flag only |
| Self-escalation | Users can edit own role/tabs via anon key | Server rejects own role/permission changes; maker-checker |
| Secrets | API keys, bank details plaintext in `global_settings` | Encrypted at rest; masked in UI |

### 5.2 Data Model & Ledger

| Item | Current | Target |
|------|---------|--------|
| Guest ledger | `reservation.charges/payments` JSONB + `folios/folio_lines/folio_payments` | Single authoritative ledger: `folios/folio_lines/folio_payments`; frontend queries via API |
| Billing calculation | Duplicated in frontend (`billing.ts`) and backend RPCs | One backend RPC (`calculate_billing_breakdown`) used by frontend for display |
| Settings sync | Manual column list in `server.ts`; React context can drift | Schema-driven settings fetch; checksum/version compare |
| Room entity | `type` vs `room_type_id` dual usage | Normalize to `room_type_id`; remove legacy `type` dependency |
| Reservation fields | `guestName`/`guestEmail` vs `guest_name`/`guest_email` | Centralized mapper; snake_case DB, camelCase frontend |
| HR ↔ System Users | No FK | `system_users.linked_employee_id` FK to HR employee |
| Multi-property | Single property hardcoded | Organization → property hierarchy (Phase 3) |

### 5.3 Audit Trail

| Item | Current | Target |
|------|---------|--------|
| Audit store | `audit_events` (DB) + `structuredAuditLogs` (localStorage) | Single `audit_events` table, append-only |
| Coverage | Auth, permission/report events only | Every mutation: before/after, actor, IP, UA, module |
| Tamper evidence | None | Hash chain or DB-trigger-only writes; revoke update/delete |

### 5.4 Shared UI / UX

| Item | Current | Target |
|------|---------|--------|
| Shared components | 6 files (`LoadingStates`, `UnifiedInvoiceTemplate`, etc.) | Shared kit: `DashboardTemplate`, `DataTable`, `ModalSystem`, `KPI tiles`, `FormField` |
| Dashboards | 6+ custom implementations | One `DashboardTemplate` driven by config |
| Modals | Custom per component | `ModalSystem` with size/confirm/async variants |
| Tables | Inline implementations | Reusable `DataTable` with sort/filter/pagination |
| Navigation | Per-portal state | Unified portal shell with role-aware nav |

### 5.5 Backend Architecture

| Item | Current | Target |
|------|---------|--------|
| Route organization | All in `server.ts` | `src/server/routes/{auth,admin,reservations,public,b2b,finance,reports}.ts` |
| Auth middleware | Repeated `getRequestUser()` | `authenticate()` + `requirePermission(perm)` middleware |
| Validation | Manual casting | Zod schemas on every route |
| Data mapping | Inline + `supabaseService.ts` duplicates | `src/services/dataMapper.ts` canonical mappers |
| Query optimization | Full-table selects (e.g., all rooms, all reservations) | Date-range filters, indexes, caching for settings/room types |
| Realtime | Full table refresh on every change | Targeted invalidation or row-level deltas |

---

## 6. Consolidation Strategy

### 6.1 Guiding Principles

1. **Single source of truth:** Each entity is owned by one module and referenced elsewhere.
2. **Trusted backend:** All writes (except anonymous public booking reads) route through Express with server-side validation.
3. **Defense in depth:** Validate at client (UX), server (business rules/RBAC), and database (RLS/checks).
4. **DRY UI:** Build a shared component kit; stop re-implementing dashboards, tables, and modals.
5. **Append-only audit:** Every mutation must leave an immutable trace.
6. **Incremental delivery:** Each phase delivers working, tested value; no big-bang rewrites.

### 6.2 Target Architectural Shape

```
Browser
  │
  ├── Public reads ──► Supabase (RLS, read-only public data)
  │
  └── Authenticated ops ──► Express (httpOnly session + RBAC)
                              │
                              ├── Auth routes
                              ├── Admin / System routes
                              ├── Front Office routes
                              ├── Finance routes
                              ├── F&B / Inventory / Procurement routes
                              ├── HR / Maintenance / Housekeeping routes
                              ├── Sales & Events / B2B routes
                              └── Public booking routes
                              │
                              ▼
                         Supabase (service role)
                              │
                              └── DB triggers ──► audit_events (append-only)
```

---

## 7. Phased Roadmap

### Phase 1 — Secure the Foundation (Weeks 1–3)
**Goal:** Close critical security gaps before any further feature work.

| # | Task | Deliverables | Owner Module |
|---|------|--------------|--------------|
| 1.1 | Add Supabase RLS policies | `rls_policies.sql` migration; anon role read-only for public booking data; admin tables blocked | System Admin |
| 1.2 | Extract auth middleware | `src/server/middleware/auth.ts`: `authenticate`, `requirePermission` | Backend |
| 1.3 | Remove/flag dev backdoor | `admin123` fallback gated by `NODE_ENV=development` only | System Admin |
| 1.4 | Implement missing auth endpoints | `/api/auth/verify-mfa`, `/api/auth/request-reset`, `/api/auth/reset-password`, `/api/auth/change-password` | System Admin |
| 1.5 | Enforce account lockout | Set `locked_until` after N failed attempts; unlock flow | System Admin |
| 1.6 | Migrate critical mutations to Express | User/role/settings/reservation/folio writes behind authenticated routes | Backend |
| 1.7 | Encrypt secrets at rest | `apiIntegrations[].apiKey`, bank details encrypted; mask in responses | System Admin |

### Phase 2 — Unify the Ledger & Data Model (Weeks 4–7)
**Goal:** Eliminate folio discrepancies and establish canonical mappers.

| # | Task | Deliverables | Owner Module |
|---|------|--------------|--------------|
| 2.1 | Deprecate `reservation.charges/payments` JSONB | Frontend reads folio via `/api/reservations/:id/folio` only | Front Office / Finance |
| 2.2 | Single billing RPC | `calculate_billing_breakdown(reservationId)` used by frontend | Finance |
| 2.3 | Add `post_folio_charge` discount support | Optional `p_discount_percent` parameter | Front Office |
| 2.4 | Canonical data mapper | `src/services/dataMapper.ts` for rooms, guests, reservations, folio lines | Backend |
| 2.5 | Schema alignment | Normalize `room_type_id`, reservation snake/camel mapping migration | Backend |
| 2.6 | Settings version/checksum | `/api/settings` returns hash; frontend warns on stale context | System Admin |

### Phase 3 — Shared Component & Context Consolidation (Weeks 8–11)
**Goal:** Reduce duplication and re-render overhead.

| # | Task | Deliverables | Owner |
|---|------|--------------|-------|
| 3.1 | Shared dashboard template | `src/components/Shared/DashboardTemplate.tsx` | Frontend |
| 3.2 | Shared modal/dialog system | `src/components/Shared/ModalSystem.tsx` | Frontend |
| 3.3 | Shared data table | `src/components/Shared/DataTable.tsx` with sort/filter/pagination | Frontend |
| 3.4 | Refactor contexts | Split `ERPContext` into domain contexts; use selectors; remove overlap | Frontend |
| 3.5 | Adopt loading/error states | Use `LoadingStates`, `ErrorBoundary` consistently | Frontend |

### Phase 4 — Module Feature Completeness (Weeks 12–17)
**Goal:** Bring each module to its architecture spec.

| Module | Key Deliverables |
|--------|------------------|
| Finance & Accounting | GL journal entry/posting UI, AP bills/payments, AR aging, bank rec import/matching, fixed assets, trial balance/P&L/balance sheet, budget vs. actual, ERCA VAT export, period close |
| F&B | Recipe costing, weighted-average inventory, offline POS queue, BEO builder, waste/void tracking, food/bev cost % |
| Maintenance | PM scheduler with checklist, asset register full CRUD, spare parts reorder, OOO/OOS automatic release |
| HR & Payroll | Payroll gross-to-net engine, Ethiopian tax/pension bands, payslip PDF, GL batch posting, employee ↔ system user link |
| Procurement | Goods receipt → AP bill draft, discrepancy workflow, physical stock count, store-to-dept requisition |
| Sales & Events | Lead/pipeline CRM, proposal/contract workflow, corporate account master, BEO handoff, group analytics |
| Public Page Editor | Drag-and-drop block builder, legal review gate, media library, version rollback |
| Guest Portal | In-stay request routing, read-only folio view, locale switcher |

### Phase 5 — Scale, Compliance & Observability (Weeks 18–23)
**Goal:** Multi-property readiness and enterprise controls.

| # | Task | Deliverables |
|---|------|--------------|
| 5.1 | Organization/property hierarchy | `organizations`, `properties`, scoped settings/users/data |
| 5.2 | Scheduler / job engine | Night audit, report distribution, backups, retries with observability |
| 5.3 | Compliance center | GDPR/PII export & erase, consent log, data retention policies |
| 5.4 | API management | External API keys with scopes, rotation, rate limits |
| 5.5 | System health dashboard | DB/API/integration heartbeats, failed jobs, error logs |
| 5.6 | Migration hygiene | Renumber/merge duplicate migrations; dependency graph; combined baseline |

---

## 8. Immediate Next Steps (This Week)

1. **Run `npm run lint` and `npx tsc --noEmit`** to establish a clean TypeScript baseline before large refactors.
2. **Apply Phase 1 RLS migration** — block anon writes to `system_users`, `roles`, `permissions`, `global_settings`, `reservations`, `folios`.
3. **Extract `authenticate` and `requirePermission` middleware** in `src/server/middleware/auth.ts` and convert the 5 highest-traffic mutating routes (`/api/admin/users`, `/api/admin/roles`, `/api/admin/settings`, `/api/reservations/:id/charges`, `/api/reservations/:id/payments`) to use it.
4. **Disable `admin123` dev fallback** outside `NODE_ENV=development`.
5. **Create a single `/api/settings` endpoint** that returns a hashed/validated settings object and update `SystemContext` to consume it.
6. **Write a regression test** for folio balance parity: create reservation → check in → add charge → post payment → assert frontend breakdown equals `folios.balance`.
7. **Start the shared component kit** with `DashboardTemplate.tsx` and migrate one dashboard (`FinanceDashboard.tsx` or `FrontDesk/DashboardModule.tsx`) as a pilot.
8. **Document the new backend route convention** in `src/server/routes/README.md` and begin moving B2B routes into `src/server/routes/b2b.routes.ts`.
9. **Audit all migrations numbered 063, 064, 071** and produce a renumber/merge plan before the next production deploy.
10. **Schedule a 30-minute review** after Phase 1 to re-score the security posture against `SYSTEM_ADMIN_AUDIT.md` section 3.4.

---

## 9. Appendix — Sources & Key Files

### Architecture Base Prompts
- `Arcticture/seleda-department-module-base-template.md`
- `Arcticture/seleda-executive-portal-architecture.md`
- `Arcticture/seleda-finance-accounting-portal-architecture.md`
- `Arcticture/seleda-food-beverage-module-architecture.md`
- `Arcticture/seleda-front-office-module-architecture.md`
- `Arcticture/seleda-guest-portal-architecture.md`
- `Arcticture/seleda-housekeeping-module-architecture.md`
- `Arcticture/seleda-hr-payroll-module-architecture.md`
- `Arcticture/seleda-maintenance-engineering-module-architecture.md`
- `Arcticture/seleda-procurement-stores-module-architecture.md`
- `Arcticture/seleda-public-page-editor-architecture.md`
- `Arcticture/seleda-sales-events-module-architecture.md`
- `Arcticture/seleda-system-admin-portal-architecture.md`

### Audit & Gap Analyses
- `ERP_AUDIT_REPORT.md`
- `SYSTEM_ADMIN_AUDIT.md`
- `FOLIO_DISCREPANCY_ANALYSIS.md`
- `GROUP_LINKING_GAP_ANALYSIS.md`
- `ACTION_ITEMS_SUMMARY.md`
- `IMPROVEMENTS.md`
- `IMPLEMENTATION_GUIDE.md`

### Key Code Files Referenced
- `server.ts` (monolithic backend)
- `src/App.tsx` (context provider nesting, portal switching)
- `src/context/ERPContext.tsx`, `ReservationContext.tsx`, `SystemContext.tsx`
- `src/components/BookingPage.tsx` (public booking portal)
- `src/components/Executive/B2BOperatorPortal.tsx`
- `src/components/Finance/AccountsReceivable.tsx`
- `supabase/migrations/047_persistent_folios_vouchers_ar.sql`
- `supabase/migrations/055_usali_coa_integration.sql`
- `supabase/migrations/057_fix_folio_duplication_and_balance.sql`
- `supabase/migrations/058_checkin_discount_fix.sql`
- `supabase/migrations/060_unified_billing_calculation.sql`
- `supabase/migrations/074_finance_core_architecture.sql`

---

*This roadmap is a living document. Update it as phases complete, constraints change, or new modules are added.*
