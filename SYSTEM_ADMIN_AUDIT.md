# SELEDA Hotel ERP/PMS — System Administration Audit

> Senior Hotel Technology / Enterprise Architecture / PMS / Cybersecurity / Operations review of the SELEDA Hotel ERP codebase, with primary focus on the **System Administration module**.
> Findings are grounded in the actual source (`src/`, `server.ts`, `supabase/`), not assumptions.

---

# PHASE 1 — SYSTEM DISCOVERY

## 1.1 System Architecture (as built)

```
┌─────────────────────────────────────────────────────────────────────┐
│  CLIENT (React 19 + Vite + TS, react-router, TailwindCSS, lucide)     │
│                                                                       │
│  App.tsx ──> Master shell, dept switcher (activeDept), auth gate      │
│   ├─ Context Providers: ERP, System, Reservation, Finance, Group,     │
│   │                     Guest, Inventory  (src/context/*)             │
│   └─ Portals (12): FrontDesk, Housekeeping, F&B, Engineering,         │
│                    Inventory, Finance, HR, Executive, Admin,          │
│                    Procurement, Settings, Public/Guest                │
│                                                                       │
│  TWO data paths:                                                      │
│   (A) Browser ──(anon key)──> Supabase  (supabaseService.ts)  ← most  │
│   (B) Browser ──(fetch /api)──> Express server.ts ── service role ──> │
│       Supabase   (auth, audit, reports, group bookings only)          │
└─────────────────────────────────────────────────────────────────────┘
                              │                       │
            httpOnly session cookie            service-role key
                              ▼                       ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Express server.ts  (session auth, RBAC check `userCan`, audit_events)│
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│  Supabase (Postgres): rooms, guests, reservations, folios,            │
│   system_users, roles, permissions, role_permissions, user_roles,     │
│   user_sessions, audit_events, custom_roles, global_settings, etc.    │
└─────────────────────────────────────────────────────────────────────┘
```

**Critical architectural observation:** The system has **two parallel, partially-disconnected backends**. Operational/admin data (users, roles, settings, reservations, inventory) is written **directly from the browser using the public anon key** via `supabaseService.ts`. Only authentication, audit retrieval, reports, and group bookings flow through the trusted Express server with the service-role key and `userCan` permission enforcement.

## 1.2 Module / Sub-module Map

| Module | Sub-modules (from `App.tsx` nav) |
|---|---|
| **Front Office** | Dashboard, Reservations, Folio (Check-in/out), CRM Board, Reports & Audit, Gift Shop POS, Office Inventory |
| **Housekeeping** | Command Center, Room Board, Task Mgmt, Laundry & Valet, Supplies & Linen, Guest Amenities, Lost & Found, Team, Intelligence |
| **F&B** | Dashboard, POS per outlet (dynamic), Bar Store, Restaurant Store, In-House Meals, Kitchen/KDS, Menu Mgmt, Banquets, Reports |
| **Engineering/Maintenance** | Dashboard, Work Orders, Preventive Maintenance, Asset Register, Guest Rooms, Utilities & Plant, Spare Parts, Technicians, Safety & Compliance, Reports |
| **Inventory** | Dashboard, Item Master, Stores & Transfers, Requisitions, Goods Receiving, Stock Counting, Suppliers, Reports |
| **Procurement** | Procurement Portal (requisitions, POs, approvals) |
| **Finance** | Finance Portal (folios, journals, fiscal periods, posting rules) |
| **HR** | Human Resources Portal + Admin/HRPayroll |
| **Executive** | Exec Dashboard, Owner Dashboard, Strategic BI, Finance Command, Ops Center, Risk & Compliance, Budget, Approval Center, **SystemAdmin**, **BusinessAdmin** |
| **System Admin** (`Admin/AdminPortal`) | SystemAdmin, BusinessAdmin, GlobalConfig, MasterData, Audit & Compliance, HR/Payroll, Integrations Center, Backup & Recovery, Workflow Engine |
| **Mobile / Public** | GuestMobilePortal |

## 1.3 System Administration internal structure (`Executive/SystemAdmin.tsx`)

Tabs: `Security Dashboard | User Profiles | Roles & Matrix | Security Protocols | System Config | Integrations | Audit Trails | Emergency`.

- **SecurityDashboard** — counts active users, concurrent logins (heuristic: lastLogin < 30 min), failed attempts, permission violations (derived from logs).
- **UserManagement** — list/search/filter; create user; per-user permission matrix modal; profile editor.
- **RoleManagement** — CRUD over `customRoles` (module/tab/button/field permissions).
- **SecurityProtocols** — edits `globalHotelSettings` (sessionTimeout, passwordComplexity, forceMfa, allowedIps, etc.).
- **SystemConfiguration / ApiIntegrations** — edit global settings + `apiIntegrations[]`.
- **AuditTrails** — renders `structuredAuditLogs`.
- **EmergencyControls** — bulk lock/suspend users.

## 1.4 Database Entities (from `supabase/schema.sql` + migrations)

`rooms, guests, reservations, group_bookings, corporate_accounts, rate_plans, seasons, packages, inventory_stores, inventory_items, system_users, custom_roles, roles, permissions, user_roles, role_permissions, user_sessions, audit_events, audit_exceptions, report_schedules, report_versions, historical_stats, folios, folio_lines, folio_payments, invoice_documents, fiscal_periods, journal_batches, journal_lines, posting_rules, business_dates, global_settings, gift_shop_sales, gift_shop_issues, group_profiles, guest_group_relationships` (+ group-linking migration tables).

## 1.5 User Roles (`UserRole` in `types/erp.ts`)

`frontoffice, housekeeping, f&b, maintenance, inventory, finance, hr, executive, procurement` — `executive` is effectively superuser everywhere. Admin tab access is granted via `allowedTabs` containing `'admin'`.

## 1.6 Integrations

`global_settings.apiIntegrations[]` = `{serviceName, apiKey, status}` (free-form, stored in plaintext). SMTP for report email (`/api/reports/email`, real send when `SMTP_*` env present). No channel manager, no payment gateway, no accounting export, no SMS — UI placeholders only.

## 1.7 Module Dependency / Relationship Diagram

```
            ┌──────────────── System Admin (config, users, roles) ───────────────┐
            │ globalHotelSettings drives: tax%, service charge, POS outlets,      │
            │ room types, fee components, fiscal, security, integrations          │
            ▼                                                                     ▼
 Front Office ─reservations─> Folios ─charges─> Finance (journals/posting rules)
     │  CRM/guests                 ▲                    ▲
     ▼                             │ F&B/POS charges    │ revenueMappings (settings)
 Housekeeping <─room status─ Rooms ┘                    │
 Inventory ─issues/transfers─> F&B & Housekeeping ─> Procurement (PO/requisition)
 Engineering ─work orders─> Rooms (Out of Order)
 HR ─employees─> System Users (NOT linked: no FK between HR staff & system_users)
```

## 1.8 User Permission Matrix (current effective)

| Capability | frontoffice | housekeeping | f&b | maint | inventory | finance | hr | procurement | executive |
|---|---|---|---|---|---|---|---|---|---|
| Own dept tab | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | all |
| Admin tab | — | — | — | — | — | — | — | — | ✓ (or allowedTabs) |
| Manage users | — | — | — | — | — | — | ✓ | — | ✓ |
| Adjust taxes | — | — | — | — | — | ✓ | — | — | ✓ |
| Void txns | — | — | — | — | — | ✓ | — | — | ✓ |
| Audit logs | — | — | — | — | — | ✓ | ✓ | — | ✓ |
| Reports export | partial | — | — | — | ✓ | ✓ | — | ✓ | ✓ |

*(Server `fallbackRolePermissions` + `hasPermission` in `lib/permissions.ts`. Note client UI matrix is far more granular than what the server actually enforces — see Phase 3.)*

---

# PHASE 2 — SYSTEM ADMIN ANALYSIS

Legend: ✅ Implemented & enforced · 🟡 Partial / UI-only / not enforced · ❌ Missing/non-functional

## User Management
| Item | Status | Evidence / Note |
|---|---|---|
| User creation | 🟡 | `addSystemUser` writes via browser anon key; **no server endpoint**, new users get shared `DEFAULT_PASSWORD_HASH` in `supabaseService.ts`. |
| User suspension/activation | 🟡 | `updateSystemUser` sets status; enforced only at login (`status !== 'Active'`) and client re-sync. Done client-side. |
| Password reset | ❌ | `auth.ts` calls `/api/auth/request-reset` & `/reset-password` — **endpoints do not exist** in `server.ts`. `SystemContext.updatePassword` returns `old === 'admin123'` (fake). |
| MFA | ❌ | `forceMfa` flag stored; `verifyMFA()` calls `/api/auth/verify-mfa` — **endpoint missing**. Login never branches to MFA. |
| Session control | ✅/🟡 | Server sessions in `user_sessions`, httpOnly cookie, 8h TTL, revoke on logout. But `sessionTimeout` setting is **not enforced**; no idle timeout. |
| Login restrictions (lockout) | 🟡 | `failed_login_count` incremented; `locked_until` checked — but **nothing ever sets** `locked_until`, so lockout never triggers. |
| Concurrent login control | ❌ | Dashboard *counts* concurrent logins; no limit enforced; multiple sessions allowed. |

## Role Management
| Item | Status | Note |
|---|---|---|
| RBAC | 🟡 | Two systems: server `roles/permissions` (real) vs UI `customRoles` (localStorage/anon). Not synchronized. |
| Granular permissions | 🟡 | `permissionMatrix` (view/create/edit/delete/approve/export/print) defined but **never enforced server-side**; `userCan` ignores it. |
| Department permissions | 🟡 | `dataRestrictions.allowedDepartments` stored, **not enforced** anywhere. |
| Data-level (record/row) permissions | ❌ | No row-level scoping; relies on Supabase RLS not present in schema. |
| Field-level permissions | ❌ | `fieldPermissions` map exists in `CustomRole`, never consumed by UI/server. |
| Approval permissions | 🟡 | WorkflowEngine UI only; approvals operate on hardcoded mock arrays, not persisted. |

## Security Management
| Item | Status | Note |
|---|---|---|
| Audit logs | 🟡 | Server writes `audit_events` for auth/permission/report only. Data mutations (reservations, folios, user edits via anon key) are **not audited**. Client `structuredAuditLogs` lives in localStorage. |
| Activity logs | 🟡 | Same fragmentation; two stores not merged. |
| IP restrictions | ❌ | `allowedIps` / `securitySettings.ipRestrictions` stored, **never checked** at login or per-request. |
| Device restrictions | ❌ | `deviceRestrictions` stored, never enforced. |
| Password policies | ❌ | `passwordComplexity`, `strictPasswordRotation` stored; no validation logic anywhere. |
| Data encryption | ❌ | API keys & bank details stored plaintext in `global_settings`. Passwords are bcrypt-hashed (good) but shared default. |
| Security alerts | 🟡 | Dashboard derives counts; no real-time alerting/notification pipeline. |

## Configuration Management
| Item | Status |
|---|---|
| Property setup / hotel info | ✅ (single property only) |
| Room types | ✅ `globalHotelSettings.roomTypes` + `roomTypeMetadata` |
| Market segments | ❌ (no entity) |
| Rate codes / rate plans | ✅ `rate_plans`, seasons, packages, promotions |
| Taxes / service charge | ✅ `feeComponents[]`, tax%, service% |
| Currency settings | 🟡 USD/ETB toggle + `exchangeRate`; not a managed multi-currency table |
| Fiscal settings | ✅ `fiscal_periods`, `business_dates`, posting rules, night audit time |

## Operational Controls
| Item | Status |
|---|---|
| Night Audit settings | 🟡 `autoNightAuditTime` stored; audit exceptions API exists; automation not scheduled |
| Reservation controls | 🟡 cancellation grace/penalty, credit limit defaults in settings |
| Housekeeping controls | 🟡 `bypassHousekeepingLock` permission only |
| Inventory controls | 🟡 categories/locations/units configurable |
| POS controls | ✅ outlets/categories/printers configurable |
| Financial controls | ✅ revenue mappings, void permission, period close |

## Integration Controls
| Item | Status |
|---|---|
| Payment gateways | ❌ none |
| Channel managers | ❌ none |
| Accounting systems | ❌ none (internal GL only) |
| SMS providers | ❌ none |
| Email providers | 🟡 SMTP for report email only |
| Generic API keys | 🟡 free-form list, plaintext, no validation/test/rotation |
| Third-party integrations | ❌ UI placeholders |

---

# PHASE 3 — GAP ANALYSIS

## 3.1 Missing Features (System Admin)
1. Functional **password reset** + self-service flow (endpoints absent).
2. **MFA/2FA** enforcement (TOTP/email/SMS) — stored flag does nothing.
3. **Account lockout** on repeated failures (counter increments, never locks).
4. **IP / device / geo restriction** enforcement.
5. **Idle session timeout** + **concurrent session limit / forced logout**.
6. **Server-side enforcement of granular RBAC** (module/field/record/department permissions).
7. **Centralized, immutable audit trail** covering all data mutations.
8. **Configuration versioning / rollback** (who/what/when, restore).
9. **System Health dashboard** (DB/API/integration/job status, error logs).
10. **Backup & recovery** automation (UI exists, not wired to a real job).
11. **Scheduler / job engine** for night audit, reports, backups.
12. **Approval matrix / workflow engine persistence** (currently mock state).
13. **Multi-property / organization hierarchy** (single property hardcoded).
14. **Notification center** config (channels, templates, routing).
15. **Compliance center** (GDPR/PCI/data-retention, PII export/erase, consent).
16. **API management** (key issuance, scopes, rotation, rate limits, secrets vault).
17. **Market segments / source-of-business** master.

## 3.2 Redundant Features (remove or consolidate)
- **Dual user/role stores**: client `customRoles` (localStorage) vs server `roles/permissions`. Remove the client store as source of truth.
- **Duplicate audit stores**: `structuredAuditLogs` (localStorage) vs `audit_events` (DB).
- **`SystemAdmin` vs `BusinessAdmin` vs `GlobalConfigModule` vs `MasterData`** overlap heavily on configuration editing — consolidate.
- Dead client auth functions (`verifyMFA`, `requestPasswordReset`, `resetPassword`, `changePassword`) calling non-existent endpoints — either implement or remove to avoid false sense of security.

## 3.3 Duplicate Features (merge)
- Merge **Security Protocols + System Config + Integrations + GlobalConfig + MasterData** into one **Property/Configuration** area with sections.
- Merge **Audit Trails (SystemAdmin) + Audit & Compliance (Admin)** into a single **Audit Center**.
- Merge legacy `allowedSettings`/`allowedTabs`/`permissionMatrix` into the normalized `permissions` model.

## 3.4 Security Risks
| Risk | Severity | Detail |
|---|---|---|
| **Anon-key admin writes** | 🔴 Critical | `system_users`, `custom_roles`, `global_settings`, reservations, folios written from browser with public key. Without strict RLS, any client can mutate users/roles/settings. No schema-level RLS present. |
| **Dev auth backdoor** | 🔴 Critical | When Supabase admin not configured, any email + `admin123` logs in as **executive** (`authenticateUser` fallback). Must be impossible in production. |
| **Privilege escalation** | 🔴 Critical | `executive` = unconditional `*`. A user editing their own record (anon key) could set `role: 'executive'` or `allowedTabs:['admin']`. |
| **Shared default password** | 🟠 High | All new users created with hardcoded `DEFAULT_PASSWORD_HASH`; no forced change enforced. |
| **Non-functional MFA / lockout / IP rules** | 🟠 High | Settings imply protection that does not exist — false assurance. |
| **Plaintext secrets** | 🟠 High | `apiIntegrations[].apiKey`, bank details in `global_settings`. |
| **Permission loophole** | 🟠 High | Client `permissionMatrix`/field/record permissions never enforced server-side; security is UI-only and bypassable via direct Supabase calls or API. |
| **Audit gaps** | 🟠 High | Most data mutations are not audited; logs partly in localStorage (tamperable, per-browser). |
| **Session weaknesses** | 🟡 Medium | No idle timeout, no concurrency limit, `sessionTimeout` unused. |

## 3.5 Operational Risks
- **Bottleneck:** single `executive` superuser pattern → over-privileged GM accounts.
- **Workflow weakness:** approvals are mock/non-persistent; no escalation/SLA.
- **Approval weakness:** no maker-checker on user/role/settings changes.
- **Data consistency:** dual write paths (anon client + server) risk divergence; no transactional guarantee across them; HR staff not linked to `system_users`.

---

# PHASE 4 — BEST-PRACTICE COMPARISON

Benchmarked against OPERA Cloud, Mews, Cloudbeds, Stayntouch, Hotelogix.

| Area | Score /10 | Comments |
|---|---:|---|
| **Security** | 3 | bcrypt + httpOnly sessions are good; but MFA/lockout/IP/password-policy non-functional, anon-key admin writes, dev backdoor. Industry leaders enforce MFA, SSO/SAML, RLS, lockout. |
| **Administration** | 5 | Broad admin UI surface and config breadth; but fragmented, partly mock, single-property. |
| **Permissions** | 4 | Good RBAC *model* (roles/permissions tables) but not enforced for granular/field/record/department scopes; UI matrix is cosmetic. OPERA/Mews enforce task-level + property-scoped roles. |
| **Scalability** | 3 | Single property hardcoded; no org/property hierarchy; dual-backend coupling. Competitors are multi-property/chain-ready. |
| **Auditability** | 4 | `audit_events` exists but coverage partial + a parallel localStorage log. Leaders log every mutation immutably with before/after. |
| **Compliance** | 2 | No GDPR/PCI tooling, data retention, PII export/erasure, consent. |
| **Configuration** | 6 | Strong configurable surface (taxes, fees, POS, fiscal, rate plans); lacks versioning/rollback & multi-property. |
| **Reporting** | 6 | Report schedules/versions/email + historical stats are real and permission-gated — relatively strong. |
| **Overall** | **4.1** | Capable UI shell; enforcement, security, and multi-property maturity are the gaps. |

---

# PHASE 5 — IDEAL SYSTEM ADMIN DESIGN

```
System Administration
├── Organization Setup
├── Property Setup
├── User Management
├── Role & Permissions
├── Security Center
├── Audit Center
├── Workflow Engine
├── Approval Matrix
├── Notification Center
├── Integration Hub
├── API Management
├── Data Management
├── Backup & Recovery
├── Scheduler
├── Financial Controls
├── Revenue Controls
├── POS Controls
├── Inventory Controls
├── Housekeeping Controls
├── Reservation Controls
├── Compliance Center
├── Reports & Analytics
└── System Health Dashboard
```

| Menu | Purpose | Key Features | DB tables | Permission | Business justification |
|---|---|---|---|---|---|
| **Organization Setup** | Chain/brand hierarchy above property | brands, regions, cross-property defaults | `organizations`, `org_properties` | `org:manage` | Enables multi-property growth |
| **Property Setup** | Per-property identity & ops params | hotel info, addresses, currencies, fiscal cal | `properties`, `global_settings`(scoped) | `property:manage` | Replaces hardcoded single hotel |
| **User Management** | Lifecycle of accounts | create/suspend/activate, reset, force change, sessions view | `system_users`, `user_sessions` | `users:manage` | Core governance |
| **Role & Permissions** | Single RBAC model | roles, permission grants, scope (property/dept/record/field) | `roles`, `permissions`, `role_permissions`, `user_roles` | `roles:manage` | Eliminates dual model |
| **Security Center** | Enforce security posture | MFA, lockout, password policy, IP/device allowlist, geo | `security_policies`, `mfa_secrets`, `login_attempts` | `security:manage` | Closes biggest gaps |
| **Audit Center** | Immutable, complete trail | every CRUD with before/after, login, deletes, exports | `audit_events`(append-only) | `audit:view` | Compliance + forensics |
| **Workflow Engine** | Configurable processes | approval chains, escalation, automated actions | `workflows`, `workflow_steps`, `workflow_instances` | `workflow:manage` | Replace mock approvals |
| **Approval Matrix** | Authorization thresholds | amount/type → approver chain | `approval_rules`, `approval_requests` | `approvals:manage` | Financial control |
| **Notification Center** | Channels & templates | email/SMS/push routing, templates, subscriptions | `notification_templates`, `notification_rules` | `notify:manage` | Operational comms |
| **Integration Hub** | 3rd-party connectors | channel mgr, payment gw, accounting, SMS | `integrations`, `integration_logs` | `integrations:manage` | Ecosystem connectivity |
| **API Management** | External API governance | key issue/scope/rotate, rate limits, secrets vault | `api_keys`, `api_scopes` | `api:manage` | Secure programmatic access |
| **Data Management** | Master data + import/export | dedupe, bulk ops, PII export/erase | (all masters) | `data:manage` | Data quality + GDPR |
| **Backup & Recovery** | Resilience | scheduled backups, restore, PITR | `backup_jobs` | `backup:manage` | Business continuity |
| **Scheduler** | Job orchestration | night audit, reports, backups, retries | `scheduled_jobs`, `job_runs` | `scheduler:manage` | Automation reliability |
| **Financial/Revenue/POS/Inventory/Housekeeping/Reservation Controls** | Domain policy switches | thresholds, locks, overrides, rate fences | scoped settings | `*:configure` | Centralized ops governance |
| **Compliance Center** | Regulatory tooling | retention, consent, PCI/GDPR, legal holds | `compliance_policies`, `consents` | `compliance:manage` | Legal risk reduction |
| **Reports & Analytics** | Admin reporting | schedules, versions, distribution | `report_schedules`, `report_versions` | `reports:view/export` | Already partly built |
| **System Health Dashboard** | Observability | DB/API/integration status, failed jobs, error logs | `health_checks`, `error_logs`, `job_runs` | `system:monitor` | Uptime + MTTR |

---

# PHASE 6 — ADVANCED RECOMMENDATIONS

**Workflow Engine** — persist `workflows/workflow_steps/workflow_instances`; configurable approval chains, time-based escalation, automated actions (auto-approve under threshold, notify, post journal). Replace `defaultRequests`/`defaultWorkflows` mock state.

**Dynamic Permission Engine** — one model with scope dimensions: `permission_code × (property | department | record-owner | field)`. Evaluate **server-side** on every mutating endpoint; route all admin writes through Express (not anon key). Drop client `permissionMatrix` as authority (keep for UI hints only).

**Audit Center** — append-only `audit_events` with `before/after` JSON, actor, IP, UA, module; DB triggers or a single write gateway so **no mutation bypasses audit**; tamper-evident (hash chain).

**System Health Dashboard** — `/api/health` already exists; extend with DB latency, integration heartbeats, failed `job_runs`, recent `error_logs`; surface in admin UI.

**Configuration Versioning** — version every `global_settings`/role/permission change (`config_versions` with diff + actor + timestamp + rollback action).

---

# PHASE 7 — FINAL DELIVERABLE

## 7.1 Executive Summary
SELEDA is a feature-broad, attractively built hotel ERP with a comprehensive operational UI across all departments and a genuinely good foundation in places (httpOnly server sessions, bcrypt, normalized RBAC tables, real report scheduling/audit-event plumbing). However, **the System Administration module is largely a presentation layer over enforcement that does not exist**. Security controls (MFA, lockout, IP/device restrictions, password policy, granular/field/record permissions) are configurable in the UI but are **not enforced**. Most admin and operational data is written **directly from the browser with the public anon key**, and a **development login backdoor** plus **self-service privilege escalation** create critical exposure. Priorities: route all writes through the trusted server, enforce the RBAC model, implement MFA/lockout/password reset, and unify audit logging.

## 7.2 System Admin Strengths
- Broad, polished admin UI covering users, roles, security, config, integrations, audit, emergency.
- Solid auth primitives: httpOnly cookie sessions, server-side session store with revocation, bcrypt hashing.
- Normalized RBAC schema (`roles/permissions/role_permissions/user_roles`) ready to be the single source of truth.
- Real, permission-gated server features: audit events, report schedules/versions/email, historical stats, group bookings.
- Rich, configurable business settings (taxes, fee components, POS outlets, fiscal periods, posting rules, rate plans).

## 7.3 System Admin Weaknesses
- Security settings are cosmetic (MFA, lockout, IP/device, password policy not enforced).
- Dual, unsynced user/role and audit stores (DB vs localStorage; server roles vs client customRoles).
- Granular/field/record/department permissions never enforced server-side.
- Admin writes bypass the server (anon key), defeating permission checks.
- Mock/non-persistent workflow & approvals.
- Single-property only; no versioning, health, scheduler, compliance, backup automation.

## 7.4 Missing Features List
Password reset (real), MFA, account lockout, IP/device enforcement, idle/concurrent session control, server-enforced granular RBAC, complete immutable audit, config versioning/rollback, system health, backup automation, scheduler, persistent workflow/approval matrix, multi-property/org, notification center, compliance center, API/secret management, market segments.

## 7.5 Features to Remove
- Client `customRoles` localStorage store as an authority (keep UI, back it with `roles` tables).
- localStorage `structuredAuditLogs` as authority.
- Dead client auth calls to non-existent endpoints (or implement them).
- Dev `admin123` backdoor in any non-dev build.

## 7.6 Features to Merge
- Security Protocols + System Config + Integrations + GlobalConfig + MasterData → **Configuration**.
- SystemAdmin Audit Trails + Admin Audit & Compliance → **Audit Center**.
- `allowedSettings`/`allowedTabs`/`permissionMatrix` → normalized `permissions`.

## 7.7 Security Recommendations
1. Route **all** user/role/settings/operational mutations through Express with `userCan` checks; enable Supabase **RLS** so the anon key cannot write admin tables.
2. Remove the `admin123`/any-email-executive fallback from production builds.
3. Prevent self-escalation: server must reject changes to own `role`/`allowedTabs`/`permissions`; require `users:manage` + maker-checker.
4. Implement MFA (TOTP), account lockout (set `locked_until`), password policy validation, and a real password-reset flow.
5. Enforce IP/device allowlists and idle/concurrent session limits at the session layer.
6. Encrypt secrets (`apiIntegrations`, bank details); never return them to the client in full.
7. Force password change on first login; eliminate shared default hash.

## 7.8 Scalability Recommendations
- Introduce organization → property hierarchy; scope settings, users, roles, and data by property.
- Make all permission checks property-aware.
- Add a scheduler/job runner for night audit, reports, backups with retries and observability.

## 7.9 Database Recommendations
- Add RLS policies to every table; least-privilege anon role (read-only public booking data only).
- Make `audit_events` append-only (revoke update/delete) with before/after payloads; add DB triggers for mutation auditing.
- Add `config_versions`, `scheduled_jobs/job_runs`, `error_logs`, `api_keys`, `mfa_secrets`, `login_attempts`, `organizations/properties`.
- Add FK linking HR employees to `system_users`.

## 7.10 UI/UX Recommendations
- Show enforcement status badges (e.g., "MFA: not enforced") so admins aren't misled.
- Consolidate overlapping admin screens; single left-nav matching Phase 5 structure.
- Add maker-checker review screens for sensitive changes; show config diff/version history.
- Surface System Health and audit search/filter/export prominently.

## 7.11 Priority Matrix
| Priority | Recommendation |
|---|---|
| 🔴 **Critical** | Remove dev login backdoor; route admin writes through server + enable RLS; block self privilege-escalation; implement real password reset; enforce account lockout. |
| 🟠 **High** | MFA enforcement; server-side granular RBAC enforcement; unify & complete audit logging; encrypt stored secrets; force first-login password change; idle/concurrent session control. |
| 🟡 **Medium** | Config versioning/rollback; persistent workflow & approval matrix; scheduler/jobs; System Health dashboard; backup automation; consolidate admin screens. |
| 🟢 **Low** | Multi-property/org hierarchy; notification center; compliance center; API management console; market segments; UI polish & enforcement badges. |

---

### Top 5 immediate actions
1. Disable the `admin123` fallback auth path outside development.
2. Add Supabase RLS and move `system_users`/`custom_roles`/`global_settings` writes behind authenticated server endpoints.
3. Block users from editing their own role/permissions; enforce `userCan` on every mutating route.
4. Implement (or remove) the missing `/api/auth/*` MFA, change-password, and reset endpoints — today they silently fail.
5. Make lockout real (`locked_until`) and force password change for the shared default hash.
