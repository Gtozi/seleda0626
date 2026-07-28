# SELEDA ERP — Remediation Roadmap to 8+/10

**Date:** July 16, 2026
**Current Score:** 4.1/10 | **Target:** 8+/10 | **Timeline:** 23 weeks

## Scorecard

| Dimension | Current | Target |
|-----------|---------|--------|
| Security | 3/10 | 9/10 |
| Administration | 5/10 | 8/10 |
| Permissions | 4/10 | 9/10 |
| Scalability | 3/10 | 8/10 |
| Auditability | 4/10 | 9/10 |
| Compliance | 2/10 | 8/10 |
| Configuration | 6/10 | 9/10 |
| Reporting | 6/10 | 8/10 |
| Data Integrity | 4/10 | 9/10 |
| UI/UX Cohesion | 5/10 | 8/10 |
| **Overall** | **4.1** | **8.5** |

---

## Phase 1 — Critical Security Remediation (Weeks 1-3)

**Goal:** Close all critical security vulnerabilities. Security: 3 -> 7. **STATUS: COMPLETE**

### Step 1.1 — Row Level Security (RLS) on All Tables ✅ DONE

**Problem:** Most tables have no RLS policies. The anon key can read/write `system_users`, `roles`, `permissions`, `global_settings`, `reservations`, `folios`, and all operational tables.

**Actions:**
1. Create migration `100_rls_policies_comprehensive.sql`:
   - Enable RLS on every table in the `public` schema.
   - **Public read-only:** `rooms`, `room_types`, `rate_plans`, `packages`, `seasons`, `page_blocks`, `page_content`, `guest_services`, `testimonials` — anon SELECT only.
   - **Admin-only (service role):** `system_users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `global_settings`, `audit_events`, `custom_roles` — block anon entirely.
   - `REVOKE UPDATE, DELETE ON audit_events FROM anon, authenticated;` — append-only.
2. Replace all direct Supabase writes in `supabaseService.ts` with `fetch('/api/...')` calls to Express endpoints.
3. Test: anon-key INSERT on `system_users` must fail. anon-key SELECT on `global_settings` must fail.

**Files:**
- `supabase/migrations/100_rls_policies_comprehensive.sql` (NEW)
- `src/services/supabaseService.ts` — replace direct writes with API calls

### Step 1.2 — Remove Dev Backdoor ✅ DONE

**Problem:** Any email + `admin123` logs in as executive when Supabase is unconfigured.

**Actions:**
1. In `server.ts` `authenticateUser`, wrap the `admin123` fallback in `if (process.env.NODE_ENV === 'development')`.
2. Add startup check: if `SUPABASE_URL` or `SUPABASE_SERVICE_ROLE_KEY` is missing and `NODE_ENV !== 'development'`, refuse to start.
3. In production, return `503` if Supabase env vars are missing.

**Files:** `server.ts`

### Step 1.3 — Block Privilege Self-Escalation ✅ DONE

**Problem:** Users can edit their own `role` or `allowedTabs` via the anon key.

**Actions:**
1. Create `PUT /api/admin/users/:id` with `requirePermission('users:manage')`.
2. Reject if `req.user.id === req.params.id` and request modifies `role`, `allowedTabs`, or `permissions` — require maker-checker (second admin approval).
3. Strip `role`, `allowedTabs`, `allowedSettings` from self-update requests.
4. Remove `supabaseService.updateSystemUser()` direct Supabase calls — route through API.

**Files:**
- `server.ts` — new `PUT /api/admin/users/:id` endpoint
- `src/services/supabaseService.ts` — remove direct user update
- `src/context/SystemContext.tsx` — use API
- `src/components/Executive/SystemAdmin.tsx` — use API

### Step 1.4 — Implement Missing Auth Endpoints ✅ DONE

**Problem:** `auth.ts` calls `/api/auth/verify-mfa`, `/api/auth/request-reset`, `/api/auth/reset-password`, `/api/auth/change-password` — none exist in `server.ts`.

**Actions:**
1. **`POST /api/auth/request-reset`**: Generate reset token, store in `system_users.reset_token` + `reset_token_expires`, send email with reset link.
2. **`POST /api/auth/reset-password`**: Validate token + expiry, enforce password policy, hash with bcrypt, clear token, audit log.
3. **`POST /api/auth/change-password`**: Verify current password, enforce policy, clear `force_password_change`, audit log.
4. **`POST /api/auth/verify-mfa`**: Verify TOTP code against `mfa_secrets` table, issue session on success, lock after 5 failures.

**Migration `101_auth_security_columns.sql`:**
```sql
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS reset_token TEXT;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS force_password_change BOOLEAN DEFAULT false;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS mfa_secret_encrypted TEXT;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE system_users ADD COLUMN IF NOT EXISTS failed_mfa_count INTEGER DEFAULT 0;

CREATE TABLE IF NOT EXISTS mfa_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES system_users(id) ON DELETE CASCADE,
  secret_encrypted TEXT NOT NULL,
  backup_codes JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Files:**
- `server.ts` — add 4 new endpoints
- `supabase/migrations/101_auth_security_columns.sql` (NEW)
- `src/lib/auth.ts` — update calls to match real endpoints

### Step 1.5 — Enforce Account Lockout ✅ DONE

**Problem:** `failed_login_count` is incremented but `locked_until` is never set.

**Actions:**
1. In `server.ts` `authenticateUser`:
   - After each failed attempt, increment `failed_login_count`.
   - If `failed_login_count >= 5`, set `locked_until = now() + 30 minutes`.
   - On successful login, reset `failed_login_count = 0` and `locked_until = null`.
   - Before accepting login, check `locked_until > now()` — reject with `423 Locked`.
2. Add admin unlock endpoint: `POST /api/admin/users/:id/unlock` with `requirePermission('users:manage')`.

**Files:** `server.ts`

### Step 1.6 — Enforce Password Policy ✅ DONE

**Problem:** `passwordComplexity` stored in `global_settings` but no validation logic exists.

**Actions:**
1. Create `src/lib/passwordPolicy.ts` with `validatePassword(password, policy)` — check min length, uppercase, lowercase, digit, special char, password history.
2. Call `validatePassword` in `/api/auth/reset-password`, `/api/auth/change-password`, `POST /api/admin/users`.
3. Read policy from `global_settings.password_complexity` JSONB column.

**Files:**
- `src/lib/passwordPolicy.ts` (NEW)
- `server.ts` — call validator in all password-setting endpoints

### Step 1.7 — Encrypt Secrets at Rest ✅ DONE

**Problem:** `apiIntegrations[].apiKey` and bank details stored in plaintext in `global_settings`.

**Actions:**
1. Create `src/lib/crypto.ts` with AES-256-GCM encrypt/decrypt using `ENCRYPTION_KEY` env var.
2. Migration `102_encrypt_existing_secrets.sql`: Add `encrypted_api_integrations JSONB`, move plaintext to encrypted, null old column.
3. In `server.ts`, decrypt on read (mask API keys as `****1234`), encrypt on write.
4. Apply same to `invoice_bank_details` if sensitive.

**Files:**
- `src/lib/crypto.ts` (NEW)
- `supabase/migrations/102_encrypt_existing_secrets.sql` (NEW)
- `server.ts` — settings read/write endpoints

### Step 1.8 — Force First-Login Password Change ✅ DONE

**Problem:** All new users created with shared `DEFAULT_PASSWORD_HASH`. No forced change.

**Actions:**
1. In `POST /api/admin/users`, set `force_password_change = true`.
2. In `authenticateUser`, after login check `force_password_change` — if true, return `{ mustChangePassword: true }` instead of full session.
3. Frontend: redirect to password change screen when `mustChangePassword` is true.
4. After successful password change, clear `force_password_change`.

**Files:**
- `server.ts` — user creation + login response
- `src/lib/auth.ts` — handle `mustChangePassword` response
- `src/App.tsx` — redirect to change-password screen

### Step 1.9 — Enforce Session Timeout & Concurrent Session Limits ✅ DONE

**Problem:** `sessionTimeout` setting stored but never enforced. No idle timeout. No concurrent session limit.

**Actions:**
1. Add session activity check middleware in `server.ts`:
   - On each authenticated request, check `user_sessions.last_activity < now() - sessionTimeout` — if expired, revoke session and return `401`.
   - Update `last_activity` on each request.
2. On login, check active sessions count for user — if exceeds `maxConcurrentSessions` from settings, revoke oldest session.
3. Add `max_concurrent_sessions INTEGER` column to `global_settings` via migration.

**Files:**
- `server.ts` — session middleware + login logic
- `supabase/migrations/101_auth_security_columns.sql` — add `max_concurrent_sessions` column

### Step 1.10 — Enforce IP/Device Allowlists ✅ DONE

**Problem:** `allowedIps` and `deviceRestrictions` stored in settings but never checked.

**Actions:**
1. In `authenticateUser`, after password verification, check `req.ip` against `allowedIps` array from settings — reject if not in list and list is non-empty.
2. Log device fingerprint (User-Agent + IP) to `user_sessions`.
3. If `deviceRestrictions.enabled`, compare against known devices list — reject unknown devices with optional email approval flow.

**Files:**
- `server.ts` — `authenticateUser` + session creation

---

## Phase 2 — Unify Data Model & Ledger (Weeks 4-7)

**Goal:** Eliminate folio discrepancies and establish canonical data ownership. Data Integrity: 4 -> 8.

### Step 2.1 — Deprecate Frontend JSONB Ledger ✅ DONE

**Problem:** `reservation.charges` (JSONB) and `reservation.payments` (JSONB) are a parallel ledger to `folios`/`folio_lines`/`folio_payments`. They diverge, causing balance discrepancies.

**Actions:**
1. Create server endpoint `GET /api/reservations/:id/folio` returning `folioId`, `lines[]`, `payments[]`, `balance`, `breakdown{subtotal, discount, fees[], tax, total}`.
2. In `CheckInOutModule.tsx`, replace all reads from `reservation.charges`/`reservation.payments` with a `useEffect` fetching `/api/reservations/:id/folio`.
3. Remove the sync effect that writes `adjustedTotal` to `reservation.total_amount`.
4. Migration `103_deprecate_jsonb_ledger.sql`: Add `reservations.ledger_migrated BOOLEAN DEFAULT false`; create backfill function to post missing JSONB charges to `folio_lines`, set `ledger_migrated = true`.
5. After all clients migrated, mark `charges`/`payments` JSONB columns as deprecated (add comment, stop writing).

**Files:**
- `server.ts` — `GET /api/reservations/:id/folio` endpoint (existing, verified)
- `src/components/FrontDesk/CheckInOutModule.tsx` — folio API fetch via useEffect, JSONB reads replaced with `folioLines`/`folioPayments` ✅
- `supabase/migrations/104_deprecate_jsonb_ledger.sql` (NEW) — `ledger_migrated` column + deprecation comments ✅
- `src/utils/billing.ts` — `calculateFolioComponents` marked `@deprecated` with console warning ✅

### Step 2.2 — Single Billing RPC ✅ DONE

**Problem:** Billing calculation duplicated in frontend (`billing.ts`) and backend RPCs (`check_in_reservation`, `post_folio_charge`). Discount application mismatch: `post_folio_charge` does not apply discounts.

**Actions:**
1. Create `calculate_billing_breakdown(reservationId)` RPC in migration `104_unified_billing_rpc.sql`:
   - Reads `folio_lines` + `folio_payments` + `global_settings.fee_components`.
   - Returns JSON: `{subtotal, discount_amount, discount_percent, fees[], tax_amount, total, balance, payments[]}`.
   - Single source of truth for both frontend display and backend validation.
2. Add optional `p_discount_percent` parameter to `post_folio_charge` RPC.
3. Update `server.ts` `/api/reservations/:id/folio` to call `calculate_billing_breakdown`.
4. Frontend: call the API endpoint, remove local calculation in `billing.ts`.

**Files:**
- `supabase/migrations/105_unified_billing_rpc.sql` (NEW) — `get_reservation_billing` RPC + `post_folio_charge` with `p_discount_percent` ✅
- `server.ts` — folio endpoint calls `get_reservation_billing` RPC, returns `billingBreakdown` in response ✅
- `src/components/FrontDesk/CheckInOutModule.tsx` — uses `billingBreakdown` from API for consolidated math, falls back to deprecated `calculateFolioComponents` ✅
- `src/utils/billing.ts` — `calculateFolioComponents` retained as fallback, deprecated in Step 2.1 ✅

### Step 2.3 — Canonical Data Mapper ✅ DONE

**Problem:** Data mapping scattered across `supabaseService.ts`, `server.ts` inline mappings, and frontend types. Field naming inconsistent (camelCase vs snake_case).

**Actions:**
1. Create `src/services/dataMapper.ts` with canonical mappers:
   - `mapRoomFromDb`, `mapGuestFromDb`, `mapReservationFromDb`, `mapFolioFromDb`, `mapFolioLineFromDb`, `mapPaymentFromDb`.
   - All mappers: snake_case DB -> camelCase frontend, handle nulls, type coercion.
2. Replace inline mappings in `server.ts` and `supabaseService.ts` with imports from `dataMapper.ts`.
3. Add Zod schemas for each entity in `src/schemas/` for runtime validation on API boundaries.

**Files:**
- `src/services/dataMapper.ts` — canonical mappers for Room, Guest, Reservation, Folio, FolioLine, FolioPayment, RatePlan, Season, Package, GroupBooking, CorporateAccount ✅
- `src/schemas/entitySchemas.ts` (NEW) — Zod schemas for all entity types for runtime validation on API boundaries ✅
- `src/schemas/reservationSchema.ts` — existing reservation form validation ✅
- `src/schemas/validationSchemas.ts` — existing input validation schemas ✅
- `src/services/supabaseService.ts` — inline mappers replaced with imports from `dataMapper.ts` ✅
- `server.ts` — folio endpoint already uses `dataMapper.ts` mappers ✅

### Step 2.4 — Normalize Room Entity ✅ DONE

**Problem:** `rooms.type` (string) vs `rooms.room_type_id` (FK) dual usage. `server.ts` filters with `r.room_type_id === rt.id || r.type === rt.name`.

**Actions:**
1. Migration `106_normalize_room_entity.sql`:
   - Backfill `room_type_id` from `type` where `room_type_id IS NULL` (match by name).
   - Set `room_type_id` as NOT NULL after backfill.
   - Add FK constraint: `rooms.room_type_id REFERENCES room_types(id)`.
   - Deprecate `type` column with comment.
   - Create `rooms_with_type_name` view for backward compatibility.
2. Remove `type` column usage from all code — use `room_type_id` exclusively.
3. Update `dataMapper.ts` to resolve `room_type_id` -> join `room_types` for display name.

**Files:**
- `supabase/migrations/106_normalize_room_entity.sql` (NEW) — backfill, NOT NULL, FK, deprecate type, create view ✅
- `src/services/dataMapper.ts` — prefer `type_name` from join, fallback to `type` column ✅
- `server.ts` — `getTypeAvailability` and `findAvailableRoomForReservation` use `room_type_id` ✅
- `server.ts` — `/api/public/rooms` filter uses `room_type_id` only ✅
- `src/types/erp.ts` — `Room.roomTypeId` required, `Reservation.roomTypeId` added ✅
- `src/services/allocationService.ts` — prefer `roomTypeId` matching, fallback to `type` ✅

### Step 2.5 — Settings Version & Checksum ✅ DONE

**Problem:** Manual column list in `server.ts` can desync from DB schema. Frontend context can drift from DB.

**Actions:**
1. Add `settings_version INTEGER` and `settings_checksum TEXT` columns to `global_settings` (migration `107_settings_versioning.sql`).
2. On every settings update, increment version and compute MD5 checksum of JSON payload.
3. `GET /api/settings` returns `version` + `checksum` in response headers.
4. Frontend `SystemContext` stores version; on each fetch, compares — warns if stale.
5. Replace manual `KNOWN_GLOBAL_SETTINGS_COLUMNS` set with `get_table_columns()` RPC.

**Files:**
- `supabase/migrations/107_settings_versioning.sql` (NEW) — version/checksum columns, trigger, helper function ✅
- `server.ts` — `GET /api/settings` returns version/checksum headers ✅
- `server.ts` — dynamic `filterKnownColumns()` using `get_table_columns()` RPC ✅
- `src/context/SystemContext.tsx` — stores version/checksum, warns if stale ✅

### Step 2.6 — Link HR Employees to System Users ✅ DONE

**Problem:** No FK between HR staff records and `system_users`. HR employees and login accounts are disconnected.

**Actions:**
1. Migration `108_link_hr_to_system_users.sql`:
   - Add `system_users.linked_employee_id UUID REFERENCES employees(id)`.
   - Backfill by matching email.
   - Create trigger to auto-link on user creation.
2. In user creation flow, optionally link to existing HR employee record.

**Files:**
- `supabase/migrations/108_link_hr_to_system_users.sql` (NEW) — FK, backfill, auto-link trigger ✅
- `server.ts` — user creation endpoint uses `linked_employee_id` field ✅

---

## Phase 3 — Server-Side RBAC & Audit Unification (Weeks 8-11)

**Goal:** Enforce permissions server-side on every mutation, unify audit trail. Permissions: 4 -> 9. Auditability: 4 -> 9.

### Step 3.1 — Extract Auth Middleware ✅ DONE

**Problem:** `getRequestUser()` called inline 50+ times in `server.ts`. Easy to miss on new endpoints. ~200 lines of duplicated auth checks.

**Actions:**
1. Create `src/server/middleware/auth.ts` with `authenticate`, `requirePermission`, `requireRole`, `requireActiveAccount` middleware.
2. Refactor all routes in `server.ts` to use middleware imports.

**Files:**
- `src/server/middleware/auth.ts` (NEW) — centralized auth middleware ✅
- `server.ts` — imports and uses middleware ✅

### Step 3.2 — Enforce Granular RBAC Server-Side ✅ DONE

**Problem:** `permissionMatrix` (view/create/edit/delete/approve/export/print) defined in UI but never enforced server-side. `userCan` ignores it. Department and field-level permissions not enforced.

**Actions:**
1. Extended `userCan` in `authHelpers.ts` to accept `PermissionContext` with scope dimensions (module, department, record-owner, field).
2. Updated `requirePermission` middleware to accept optional context parameter.
3. Created `sensitiveFields.ts` to define sensitive fields per endpoint for field-level permission enforcement.

**Files:**
- `src/server/authHelpers.ts` — added `PermissionContext` interface and extended `userCan` with scope checks ✅
- `src/server/middleware/auth.ts` — updated `requirePermission` to accept context ✅
- `src/server/sensitiveFields.ts` (NEW) — sensitive field definitions per endpoint ✅

### Step 3.3 — Unify Audit Trail ✅ DONE

**Problem:** `audit_events` (DB) only covers auth/permission/report events. Most data mutations via anon key are not audited. `structuredAuditLogs` in localStorage is tamperable.

**Actions:**
1. Created migration `109_audit_triggers.sql` with audit triggers on operational tables (reservations, folios, rooms, guests, users, settings, inventory, etc.).
2. Added `set_config()` helper function to set session variables for audit context.
3. Updated `authenticate` middleware to set `app.user_id` session variable for DB triggers.

**Files:**
- `supabase/migrations/109_audit_triggers.sql` (NEW) — audit triggers on operational tables ✅
- `src/server/authHelpers.ts` — added `setAuditContext()` and `clearAuditContext()` ✅
- `src/server/middleware/auth.ts` — sets audit context on authentication ✅

### Step 3.4 — Migrate All Mutations to Express ✅ DONE

**Problem:** Most operational/admin writes go directly from browser to Supabase via anon key, bypassing Express and its permission checks.

**Actions:**
1. Inventoried direct Supabase writes: `airport_shuttle_requests`, `room_types`, `yield_policies`.
2. Created Express endpoints with auth + permission + audit for all three tables (POST, PATCH, DELETE).
3. Updated frontend contexts to use `fetch('/api/...')` instead of direct Supabase calls.

**Files:**
- `server.ts` — new endpoints for airport_shuttle_requests, room_types, yield_policies mutations ✅
- `src/context/ERPContext.tsx` — uses API for airport_shuttle_requests CRUD ✅
- `src/context/OperationsContext.tsx` — uses API for airport_shuttle_requests CRUD ✅
- `src/context/PricingContext.tsx` — uses API for room_types and yield_policies CRUD ✅

### Step 3.5 — Remove Dual Role Stores ✅ DONE

**Problem:** Client `customRoles` (localStorage/anon) vs server `roles/permissions` (DB). Not synchronized.

**Actions:**
1. Updated `GET /api/admin/roles` to fetch from server-side `roles` + `role_permissions` + `permissions` tables as single source of truth, with `custom_roles` for backward compatibility.
2. Updated `SystemContext.tsx` to fetch roles from `/api/admin/roles` API instead of `supabaseService.fetchCustomRoles()`.
3. Updated `addCustomRole`, `updateCustomRole`, `deleteCustomRole` and batch handlers to use API endpoints instead of direct `supabaseService` calls.
4. Confirmed `enrichUserWithDerivedPermissions` already derives `allowedTabs`/`allowedSettings` from `role_permissions` server-side via `deriveLegacyPermissions()`.

**Files:**
- `server.ts` — `GET /api/admin/roles` now fetches from `roles` + `role_permissions` + `permissions` ✅
- `src/context/SystemContext.tsx` — fetches roles from API, CRUD via API endpoints ✅
- `src/lib/permissions.ts` — `canAccessTab` uses server-derived `allowedTabs` (already wired via `enrichUserWithDerivedPermissions`) ✅

---

## Phase 4 — Backend Refactoring & Shared UI Kit (Weeks 12-15)

**Goal:** Break monolithic backend into route modules, build shared component kit, reduce duplication from 35-40% to <10%. UI/UX: 5 -> 8. Configuration: 6 -> 9.

### Step 4.1 — Split server.ts into Route Modules ✅ IN PROGRESS

**Problem:** `server.ts` is 4,192 lines, 60+ routes, 50+ helper functions, all in one file.

**Actions:**
1. Create `src/server/routes/` directory with modules:
   - `auth.routes.ts` — login, logout, MFA, password reset, session verify
   - `admin.routes.ts` — users, roles, settings, audit
   - `reservations.routes.ts` — CRUD, check-in/out, folio, charges, payments
   - `public.routes.ts` — public booking, settings, availability
   - `b2b.routes.ts` — operators, allotments, contracts, vouchers, AR ledger
   - `finance.routes.ts` — journals, periods, reports, GL
   - `reports.routes.ts` — scheduled reports, versions, email
   - `inventory.routes.ts` — items, stores, transfers, requisitions
   - `hr.routes.ts` — employees, shifts, leave, payroll
2. Each route module imports `authenticate` and `requirePermission` from middleware.
3. `server.ts` becomes ~100 lines: imports, middleware setup, route mounting, listen.
4. Create `src/server/services/` for shared query logic (settings fetch, user enrichment).

**Files:**
- `src/server/routes/*.routes.ts` (NEW, ~9 files)
- `src/server/services/settingsService.ts`, `userService.ts` (NEW)
- `server.ts` — reduce to mounting file

**Completed so far:**
- `src/server/services/sharedServices.ts` — `enrichUserWithDerivedPermissions`, `fetchPasswordPolicy`, `writeAuditEvent`, `mapSystemUserFromDb`, `filterKnownColumns`, `getGlobalSettingsColumns`, `rangesOverlap`, `getTypeAvailability`, `getRoomImageUrl`, `findAvailableRoomForReservation`
- `auth.routes.ts` — verify, validate-permission (mounted at `/api/auth`)
- `admin.routes.ts` — users CRUD, roles CRUD (mounted at `/api/admin`)
- `reservations.routes.ts` — rooms, guests, reservations, rate plans, room types, seasons, packages, yield policies, shuttle (mounted at `/api`)
- `inventory.routes.ts` — stores, items, suppliers, requisitions, stock movements, GRNs (mounted at `/api/inventory`)
- `public.routes.ts` — public settings, rooms, rate-plans, packages, guest-services (mounted at `/api/public`)
- `reports.routes.ts` — report email dispatch, historical stats (mounted at `/api/reports`)
- `giftShop.routes.ts` — gift shop sales and issues (mounted at `/api/gift-shop`)
- `groupProfiles.routes.ts` — group bookings, group profiles, guest-group relationships (mounted at `/api`)
- Inline duplicates removed from `server.ts`; zero TypeScript errors.
- `server.ts` reduced from ~5447 to ~3607 lines (~1840 lines removed).

**Remaining:**
- Extract `public.routes.ts` bookings POST and confirm-payment (complex, 300+ lines with pricing dependencies)
- Move `createSession`/`clearSessionCookie` to shared services, then extract remaining auth routes (login, logout, refresh, MFA, password reset)
- Continue extracting remaining inline routes (settings, folio, admin changes, etc.)

### Step 4.2 — Add Zod Validation on All Routes ✅ DONE

**Problem:** No input validation. Manual type casting throughout. No OpenAPI/Swagger.

**Actions:**
1. ✅ Created Zod schemas in `src/schemas/`:
   - `common.ts` — reusable id, date, email, phone, pagination schemas
   - `backendSchemas.ts` — room, guest, reservation, room type, rate plan, season, package, yield policy, airport shuttle
   - `userSchema.ts` — user, role, permission, password change/reset
   - `inventorySchema.ts` — stores, items, suppliers, requisitions, stock movements, GRNs
   - `bookingSchema.ts` — public booking items, bookings, payment confirmation
   - `giftShopSchema.ts` — gift shop sales and issues
   - `reportsSchema.ts` — report email dispatch and historical stats
   - `groupProfileSchema.ts` — group bookings, profiles, guest-group relationships
2. ✅ In each route handler, validate `req.body` (or `req.query` for GET) against schema using `safeParse` before processing.
3. ✅ Return `400` with field-level error details on validation failure.
4. Generate OpenAPI spec from Zod schemas using `zod-to-openapi`. *(Future enhancement)*

**Files modified:**
- `src/schemas/*.ts` (8 new files)
- `src/server/routes/giftShop.routes.ts` — Zod validation added
- `src/server/routes/reports.routes.ts` — Zod validation added
- `src/server/routes/inventory.routes.ts` — Zod validation added
- `src/server/routes/admin.routes.ts` — Zod validation added
- `src/server/routes/groupProfiles.routes.ts` — Zod validation added
- `src/server/routes/reservations.routes.ts` — Zod validation added
- `src/server/routes/public.routes.ts` — Zod validation added

### Step 4.3 — Shared Dashboard Template ✅ DONE

**Problem:** 6+ custom dashboard implementations with 65% code similarity. Each implements KPI card grids, Recharts, metric calculation independently.

**Actions:**
1. ✅ Created `src/components/Shared/DashboardTemplate.tsx`:
   - Props: `title`, `subtitle`, `id`, `kpiTiles: KpiTile[]`, `kpiColumns`, `loading`, `error`, `onRetry`, `actions`, `children`.
   - Exports `KpiGrid`, `ChartCard`, `TableCard` reusable wrappers.
   - Supports loading/error states via `LoadingStates` (MetricsSkeleton, error with retry).
2. ✅ Migrated `FinanceDashboard.tsx` as pilot.
3. ✅ Migrated all remaining dashboards: `FrontDesk/DashboardModule.tsx`, `FoodBeverage/FBDashboard.tsx`, `Housekeeping/HKDashboard.tsx`, `Inventory/InventoryDashboard.tsx`, `Procurement/ProcurementDashboard.tsx`, `HumanResources/HRDashboard.tsx`.

**Files:**
- `src/components/Shared/DashboardTemplate.tsx` ✅
- `src/components/Finance/FinanceDashboard.tsx` ✅
- `src/components/FrontDesk/DashboardModule.tsx` ✅
- `src/components/FoodBeverage/FBDashboard.tsx` ✅
- `src/components/Housekeeping/HKDashboard.tsx` ✅
- `src/components/Inventory/InventoryDashboard.tsx` ✅
- `src/components/Procurement/ProcurementDashboard.tsx` ✅
- `src/components/HumanResources/HRDashboard.tsx` ✅

### Step 4.4 — Shared Modal/Dialog System ✅ DONE

**Problem:** Multiple custom modal implementations: `AirportShuttleModal`, `TermsAndConditionsModal`, inline modals in Inventory, etc.

**Actions:**
1. Created `src/components/Shared/ModalSystem.tsx`:
   - Variants: `confirm`, `form`, `info`, `async` (with loading state).
   - Props: `size` (sm/md/lg/xl), `title`, `children`, `onConfirm`, `onCancel`, `loading`.
   - Consistent styling, focus trap, escape-to-close, click-outside-to-close.
2. Replaced all custom modal implementations with `ModalSystem`.

**Files migrated:**
- `src/components/Shared/ModalSystem.tsx` (NEW) — shared modal component with variants, sizes, icons, footer, accessibility
- `src/components/AirportShuttleModal.tsx` — refactored to use ModalSystem
- `src/components/TermsAndConditionsModal.tsx` — refactored to use ModalSystem
- `src/components/FoodBeverage/BanquetModals.tsx` — BEOSheetModal and ForecastRequisitionModal refactored
- `src/components/FrontDesk/DashboardModule.tsx` — Room Console and Night Audit Confirmation modals refactored
- `src/components/FoodBeverage/POSModule.tsx` — Payment, New Tab, Add Item, Split Bill, Merge Bill, Transfer Items, and Shift Management modals refactored
- `src/components/CRM/CRMModule.tsx` — 9 inline modals migrated
- `src/components/Admin/MasterData.tsx` — 4 inline modals migrated
- `src/components/Finance/AccountsPayable.tsx` — 4 inline modals migrated
- `src/components/Inventory/ItemMasterModule.tsx` — 4 inline modals migrated
- `src/components/Inventory/StockCountModule.tsx` — 4 inline modals migrated
- `src/components/Inventory/SupplierModule.tsx` — 4 inline modals migrated
- `src/components/Finance/GeneralLedger.tsx` — 3 inline modals migrated
- `src/components/FoodBeverage/InventoryModule.tsx` — 3 inline modals migrated
- `src/components/FrontDesk/GiftShopPOS.tsx` — 3 inline modals migrated
- `src/components/FrontDesk/NightAuditChecklistModal.tsx` — 3 inline modals migrated
- `src/components/Inventory/StoreManagement.tsx` — 3 inline modals migrated
- `src/components/Inventory/ReceivingModule.tsx` — 3 inline modals migrated
- `src/components/FrontDesk/GroupProfileModule.tsx` — 2 inline modals migrated
- `src/components/FrontDesk/FolioPaymentAudit.tsx` — 2 inline modals migrated
- `src/components/FoodBeverage/RoomServiceModule.tsx` — 2 inline modals migrated
- `src/components/FoodBeverage/MenuManagementModule.tsx` — 2 inline modals migrated
- `src/components/FrontDesk/ReportsAuditModule.tsx` — 2 inline modals migrated
- `src/components/Inventory/RequisitionModule.tsx` — 2 inline modals migrated
- `src/components/Admin/Governance.tsx` — 1 inline modal migrated
- `src/components/Finance/AccountsReceivable.tsx` — 1 inline modal migrated
- `src/components/Finance/BankReconciliation.tsx` — 1 inline modal migrated
- `src/components/Finance/FixedAssets.tsx` — 1 inline modal migrated
- `src/components/Finance/PeriodClose.tsx` — 1 inline modal migrated
- `src/components/Finance/SalesRegistry.tsx` — 1 inline modal migrated
- `src/components/FoodBeverage/BanquetModule.tsx` — 1 inline modal migrated
- `src/components/FoodBeverage/StockCountModal.tsx` — 1 inline modal migrated
- `src/components/FrontDesk/CheckInPrintModal.tsx` — 1 inline modal migrated
- `src/components/FrontDesk/DocumentVerificationModal.tsx` — 1 inline modal migrated
- `src/components/FrontDesk/GroupCheckInPrintModal.tsx` — 1 inline modal migrated
- `src/components/FrontDesk/OfficeInventoryModule.tsx` — 1 inline modal migrated
- `src/components/FrontDesk/ReservationModal.tsx` — 1 inline modal migrated
- `src/components/FrontDesk/ReservationsModule.tsx` — 1 inline modal migrated
- `src/components/Housekeeping/HKReportsModule.tsx` — 1 inline modal migrated
- `src/components/Shared/UnifiedInvoiceTemplate.tsx` — 1 inline modal migrated
- `src/components/Finance/CashManagement.tsx` — 1 inline modal migrated
- `src/components/Procurement/GoodsReceiving.tsx` — 1 inline modal migrated
- `src/components/Finance/Expenses/ExpensePortal.tsx` — 1 inline modal migrated

### Step 4.5 — Shared DataTable Component

**Problem:** Table rendering logic duplicated across `DepartmentReportsModule`, `UnifiedInvoiceTemplate`, `OutletPerformanceReport`, and many inline implementations.

**Actions:**
1. Create `src/components/Shared/DataTable.tsx`:
   - Props: `columns: Column[]`, `data: T[]`, `sortable`, `filterable`, `pagination`, `pageSize`.
   - Generic `<T>` type, supports custom cell renderers.
   - Built-in sort, filter, pagination, empty state.
2. Replace inline table implementations across all portals.

**Files:**
- `src/components/Shared/DataTable.tsx` (NEW)
- Replace inline tables in all portal components

### Step 4.6 — Split ERPContext into Domain Contexts

**Problem:** `ERPContext` is 42KB+ managing rooms, guests, reservations, packages, rate plans, notifications, journals, sales transactions, chart of accounts. Overlaps with `ReservationContext` (32KB+). Causes re-render storms.

**Actions:**
1. Split `ERPContext` into:
   - `RoomContext` — rooms, room types
   - `GuestContext` — guests (already exists, merge ERPContext guest logic)
   - `PackageContext` — packages, rate plans, seasons
   - `NotificationContext` — notifications, alerts
2. Remove room/reservation state from `ERPContext` — already in `ReservationContext`.
3. Use React context selectors (or `useMemo` + `useCallback`) to prevent unnecessary re-renders.
4. Reduce `App.tsx` provider nesting by composing contexts in a single `AppProviders` wrapper.

**Files:**
- `src/context/RoomContext.tsx` (NEW)
- `src/context/PackageContext.tsx` (NEW)
- `src/context/NotificationContext.tsx` (NEW)
- `src/context/ERPContext.tsx` — remove split domains, keep only truly shared state
- `src/App.tsx` — update provider nesting

### Step 4.7 — Optimize Realtime Subscriptions

**Problem:** Full table refresh on every realtime change. `fetchReservations()` and `fetchRooms()` called on every `postgres_changes` event.

**Actions:**
1. In `ReservationContext.tsx`, change realtime handler to use the `payload` delta:
   - On INSERT: append new row to state.
   - On UPDATE: replace matching row in state.
   - On DELETE: remove matching row from state.
2. Only fall back to full refresh if delta is ambiguous or stale.
3. Add debounce (500ms) to batch multiple rapid changes.

**Files:**
- `src/context/ReservationContext.tsx` — delta-based realtime handling
- `src/context/RoomContext.tsx` — same pattern

### Step 4.8 — Add Query Caching & Indexes

**Problem:** No caching layer. Repeated DB hits for same data (e.g., `global_settings` fetched in multiple endpoints). No indexes. Full-table selects (all rooms, all reservations).

**Actions:**
1. Add in-memory cache for `global_settings` in `src/server/services/settingsService.ts`:
   - Cache for 60 seconds, invalidate on update.
2. Add date-range filters to reservation queries: `WHERE check_in_date >= $1 AND check_out_date <= $2`.
3. Create indexes (migration `109_performance_indexes.sql`):
   - `reservations(check_in_date, check_out_date)`
   - `reservations(status)`
   - `reservations(group_booking_id)`
   - `folio_lines(folio_id)`
   - `folio_payments(folio_id)`
   - `rooms(room_type_id, status)`
   - `audit_events(created_at DESC)`
   - `system_users(email)`
4. Add connection pooling config to Supabase client.

**Files:**
- `src/server/services/settingsService.ts` — caching
- `supabase/migrations/109_performance_indexes.sql` (NEW)
- `server.ts` / route files — date-range filters

---

## Phase 5 — Module Feature Completeness (Weeks 16-20)

**Goal:** Bring each module to its architecture spec. Administration: 5 -> 8. Reporting: 6 -> 8.

### Step 5.1 — Finance & Accounting Completion

**Gaps:** GL journal entry UI, AP bills/payments, AR aging, bank rec, fixed assets, trial balance/P&L/balance sheet, budget vs actual, ERCA VAT export, period close.

**Actions:**
1. **GL Journal Entry UI:** Create `JournalEntryModule.tsx` with line-item entry, debit/credit validation, period check, post to `journal_entries`/`journal_lines`.
2. **AP Module:** Create `AccountsPayable.tsx` — supplier invoices, bill approval, payment runs, vendor aging report. Link to procurement goods receipt.
3. **AR Aging:** Enhance `AccountsReceivable.tsx` with aging buckets (0-30, 31-60, 61-90, 90+), dunning letters.
4. **Bank Reconciliation:** Create `BankReconciliation.tsx` — import bank statements (CSV), match to payments, reconcile.
5. **Fixed Assets:** Create `FixedAssets.tsx` — asset register, depreciation schedules (straight-line), disposal tracking.
6. **Financial Statements:** Create `FinancialStatements.tsx` — trial balance, P&L, balance sheet, cash flow from `journal_entries`/`journal_lines`.
7. **Budget vs Actual:** Create `BudgetModule.tsx` — budget entry by period/account, variance report.
8. **ERCA VAT Export:** Generate VAT declaration XML/CSV from journal tax lines.
9. **Period Close:** UI for fiscal period close — lock period, post closing entries.

**Files:**
- `src/components/Finance/JournalEntryModule.tsx` (NEW)
- `src/components/Finance/AccountsPayable.tsx` (NEW)
- `src/components/Finance/BankReconciliation.tsx` (NEW)
- `src/components/Finance/FixedAssets.tsx` (NEW)
- `src/components/Finance/FinancialStatements.tsx` (NEW)
- `src/components/Finance/BudgetModule.tsx` (NEW)
- `src/components/Finance/ERCAExport.tsx` (NEW)
- `src/components/Finance/PeriodClose.tsx` (NEW)
- `supabase/migrations/110_finance_ap_bankrec_assets.sql` (NEW)
- `src/server/routes/finance.routes.ts` — new endpoints

### Step 5.2 — F&B Module Completion

**Gaps:** Recipe costing, weighted-average inventory, offline POS queue, BEO builder, waste/void tracking.

**Actions:**
1. **Recipe Costing:** Create `RecipeManager.tsx` — recipes with ingredients, quantities, unit costs, yield. Calculate cost per serving.
2. **Weighted-Average Inventory:** Migration to add `weighted_avg_cost` column to `inventory_items`. Update on each goods receipt: `new_cost = (qty_old * cost_old + qty_received * unit_cost) / (qty_old + qty_received)`.
3. **Offline POS Queue:** In `BarPOSModule.tsx`, add `localStorage` queue for sales when offline. Sync on reconnect with conflict resolution.
4. **BEO Builder:** Create `BanquetEventOrder.tsx` — event details, menu selection, room setup, AV requirements, billing instructions. Handoff to Front Office and Kitchen.
5. **Waste/Void Tracking:** Add waste log and void log to POS — reason code, amount, approval. Report on waste % and void frequency.

**Files:**
- `src/components/FoodBeverage/RecipeManager.tsx` (NEW)
- `src/components/FoodBeverage/BanquetEventOrder.tsx` (NEW)
- `src/components/FoodBeverage/BarPOSModule.tsx` — offline queue + waste/void
- `supabase/migrations/111_fn_recipe_costing_waste.sql` (NEW)
- `src/server/routes/inventory.routes.ts` — recipe endpoints

### Step 5.3 — HR & Payroll Completion

**Gaps:** Payroll calculation engine, Ethiopian tax/pension bands, payslip PDF, GL batch posting, employee <-> system user link.

**Actions:**
1. **Payroll Engine:** Create `PayrollEngine.tsx` — select period, select employees, calculate gross-to-net:
   - Gross = basic + allowances + overtime.
   - Deductions: income tax (Ethiopian bands), pension (11% employee, 7% employer), loan deductions.
   - Net = gross - total deductions.
2. **Tax Bands:** Migration `112_hr_payroll_tables.sql` — `tax_bands` (min, max, rate, deduction), `pension_rates`, `payroll_runs`, `payslips`.
3. **Payslip PDF:** Generate payslip as printable HTML -> PDF. Include earnings, deductions, YTD.
4. **GL Batch Posting:** Post payroll journal: debit salary expense, debit pension expense, credit cash/bank, credit pension payable, credit tax payable.
5. **Employee <-> User Link:** Use `linked_employee_id` from Step 2.6. Show in HR module.

**Files:**
- `src/components/HumanResources/PayrollEngine.tsx` (NEW)
- `src/components/HumanResources/PayslipViewer.tsx` (NEW)
- `supabase/migrations/112_hr_payroll_tables.sql` (NEW)
- `src/server/routes/hr.routes.ts` — payroll endpoints

### Step 5.4 — Procurement & Stores Completion

**Gaps:** Goods receipt -> AP bill draft, discrepancy workflow, physical stock count, store-to-dept requisition.

**Actions:**
1. **Goods Receipt -> AP:** When goods received, auto-create AP bill draft in Finance. Link PO -> GR -> AP bill.
2. **Discrepancy Workflow:** If received qty != ordered qty, create discrepancy record. Route to buyer + supplier for resolution.
3. **Physical Stock Count:** Create `StockCountModule.tsx` — select store, freeze movements, count items, post adjustments with approval.
4. **Store-to-Dept Requisition:** Department creates requisition -> store approves -> transfer out -> department receives.

**Files:**
- `src/components/Procurement/GoodsReceipt.tsx` — enhance with AP link
- `src/components/Inventory/StockCountModule.tsx` (NEW)
- `supabase/migrations/113_procurement_gr_ap_link.sql` (NEW)
- `src/server/routes/inventory.routes.ts` — stock count endpoints

### Step 5.5 — Maintenance & Engineering Completion

**Gaps:** PM scheduler with checklist, asset register full CRUD, spare parts reorder, OOO/OOS automatic release.

**Actions:**
1. **PM Scheduler:** Create `PreventiveMaintenanceScheduler.tsx` — recurring PM schedules by asset, checklist templates, auto-generate work orders.
2. **Asset Register:** Enhance existing — full CRUD, depreciation, warranty tracking, location hierarchy.
3. **Spare Parts Reorder:** Min/max levels on spare parts. Auto-create requisition when below min.
4. **OOO/OOS Release:** When maintenance completes on OOO room, auto-set room back to available after housekeeping inspection.

**Files:**
- `src/components/Engineering/PreventiveMaintenanceScheduler.tsx` (NEW)
- `src/components/Engineering/AssetRegister.tsx` — enhance
- `supabase/migrations/114_maintenance_pm_schedules.sql` (NEW)

### Step 5.6 — Sales & Events Completion

**Gaps:** Lead/pipeline CRM, proposal/contract workflow, corporate account master, BEO handoff, group analytics.

**Actions:**
1. **Pipeline CRM:** Create `SalesPipeline.tsx` — leads, opportunities, stages (prospect -> qualified -> proposal -> negotiation -> won/lost).
2. **Proposal/Contract:** Generate proposal from opportunity, convert to contract on acceptance. Contract creates group block in Front Office.
3. **Corporate Account Master:** Centralized corporate account management with credit terms, history, AR balance.
4. **BEO Handoff:** Accepted event -> BEO created in F&B module automatically.
5. **Group Analytics:** Booking pace, conversion rate, revenue per group, attrition.

**Files:**
- `src/components/Sales/SalesPipeline.tsx` (NEW)
- `src/components/Sales/ProposalContract.tsx` (NEW)
- `src/components/Sales/CorporateAccountMaster.tsx` (NEW)
- `supabase/migrations/115_sales_events_tables.sql` (NEW)

### Step 5.7 — Guest Portal In-Stay Features

**Gaps:** In-stay request routing, read-only folio view, locale switcher.

**Actions:**
1. **In-Stay Requests:** Guest can submit requests (housekeeping, maintenance, room service, concierge) from mobile portal. Route to appropriate department dashboard.
2. **Folio View:** Guest can view their folio (charges, payments, balance) read-only via authenticated link.
3. **Locale Switcher:** Toggle between English, Amharic, Tigrinya on guest-facing pages.

**Files:**
- `src/components/BookingPage.tsx` — add in-stay request form + folio view
- `src/components/GuestMobilePortal.tsx` — enhance
- `src/server/routes/public.routes.ts` — request submission + folio view endpoints
- `supabase/migrations/116_guest_in_stay_requests.sql` (NEW)

---

## Phase 6 — Scale, Compliance & Observability (Weeks 21-23)

**Goal:** Multi-property readiness, compliance tooling, enterprise controls. Scalability: 3 -> 8. Compliance: 2 -> 8.

### Step 6.1 — Organization & Property Hierarchy

**Problem:** Single property hardcoded. No org/property hierarchy. Competitors are multi-property/chain-ready.

**Actions:**
1. Migration `117_org_property_hierarchy.sql`:
   ```sql
   CREATE TABLE organizations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT NOT NULL,
     legal_name TEXT,
     tax_id TEXT,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   CREATE TABLE properties (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     org_id UUID REFERENCES organizations(id),
     name TEXT NOT NULL,
     address TEXT, phone TEXT, email TEXT,
     currency TEXT DEFAULT 'ETB',
     fiscal_year_start DATE,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   ALTER TABLE global_settings ADD COLUMN property_id UUID REFERENCES properties(id);
   ALTER TABLE system_users ADD COLUMN property_id UUID REFERENCES properties(id);
   ALTER TABLE rooms ADD COLUMN property_id UUID REFERENCES properties(id);
   ```
2. Update all queries to filter by `property_id` from user session.
3. Settings, users, roles scoped per property. Cross-property view for executive.
4. Add `property_id` to permission scope checks.

**Files:**
- `supabase/migrations/117_org_property_hierarchy.sql` (NEW)
- `server.ts` / route files — property-scoped queries
- `src/lib/permissions.ts` — property-aware permission checks
- `src/context/SystemContext.tsx` — multi-property context

### Step 6.2 — Scheduler & Job Engine

**Problem:** Night audit, report distribution, backups are not automated. No job runner.

**Actions:**
1. Migration `118_scheduler_tables.sql`:
   ```sql
   CREATE TABLE scheduled_jobs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     name TEXT, type TEXT, -- 'night_audit', 'report_email', 'backup', 'allotment_release'
     schedule_cron TEXT, -- e.g. '0 2 * * *'
     config JSONB,
     enabled BOOLEAN DEFAULT true,
     last_run TIMESTAMPTZ, next_run TIMESTAMPTZ,
     created_at TIMESTAMPTZ DEFAULT now()
   );
   CREATE TABLE job_runs (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     job_id UUID REFERENCES scheduled_jobs(id),
     status TEXT, -- 'pending', 'running', 'success', 'failed'
     started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
     result JSONB, error TEXT
   );
   ```
2. Create `src/server/scheduler.ts` — cron-based job runner using `node-cron`.
3. Built-in jobs: night audit (auto-close business date, post room charges, release allotments), report email, backup, audit chain verification.
4. Admin UI: `SchedulerManager.tsx` — view jobs, enable/disable, trigger manual run, view run history.

**Files:**
- `supabase/migrations/118_scheduler_tables.sql` (NEW)
- `src/server/scheduler.ts` (NEW)
- `src/components/Admin/SchedulerManager.tsx` (NEW)
- `src/server/routes/admin.routes.ts` — scheduler endpoints

### Step 6.3 — Compliance Center

**Problem:** No GDPR/PCI tooling, data retention, PII export/erasure, consent. Compliance score: 2/10.

**Actions:**
1. Migration `119_compliance_tables.sql`:
   - `consent_logs` (guest_id, consent_type, granted, timestamp, policy_version).
   - `data_retention_policies` (table_name, retention_days, action).
   - `pii_export_requests` (requested_by, target_entity, status, exported_at).
   - `pii_erasure_requests` (requested_by, target_entity, status, erased_at).
2. Create `ComplianceCenter.tsx`:
   - PII export: generate JSON/CSV of all data for a guest.
   - PII erasure: anonymize guest data (keep financial records for legal, anonymize PII fields).
   - Consent management: view/update consent logs.
   - Data retention: configure retention periods per table, auto-purge expired records via scheduler job.
3. PCI DSS: mask card numbers everywhere (show only last 4). Never store full card numbers. Store only transaction references.

**Files:**
- `supabase/migrations/119_compliance_tables.sql` (NEW)
- `src/components/Admin/ComplianceCenter.tsx` (NEW)
- `src/server/routes/admin.routes.ts` — compliance endpoints

### Step 6.4 — System Health Dashboard

**Problem:** No observability. No DB/API/integration health monitoring. No error log surface.

**Actions:**
1. Migration `120_health_monitoring.sql`:
   - `health_checks` (service, status, latency_ms, checked_at).
   - `error_logs` (level, message, stack_trace, context JSONB, timestamp).
2. Create `SystemHealthDashboard.tsx`:
   - DB health: connection count, slow queries, table sizes.
   - API health: response time, error rate.
   - Integration health: SMTP, payment gateway, channel manager status.
   - Job health: failed `job_runs`, queue depth.
   - Error log viewer with filter/export.
3. `/api/health` endpoint extended with detailed checks.
4. Real-time alerts on critical failures (email/SMS via notification center).

**Files:**
- `supabase/migrations/120_health_monitoring.sql` (NEW)
- `src/components/Admin/SystemHealthDashboard.tsx` (NEW)
- `src/server/routes/admin.routes.ts` — health endpoints

### Step 6.5 — Configuration Versioning & Rollback

**Problem:** No config versioning. Cannot see who changed what or rollback.

**Actions:**
1. Migration `121_config_versioning.sql`:
   ```sql
   CREATE TABLE config_versions (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     table_name TEXT, record_id UUID,
     diff JSONB, -- before/after
     changed_by UUID REFERENCES system_users(id),
     changed_at TIMESTAMPTZ DEFAULT now(),
     version INTEGER
   );
   ```
2. DB trigger on `global_settings`, `roles`, `role_permissions` — on UPDATE, insert into `config_versions`.
3. Admin UI: `ConfigHistory.tsx` — view change history, diff viewer, rollback button (creates reverse update).

**Files:**
- `supabase/migrations/121_config_versioning.sql` (NEW)
- `src/components/Admin/ConfigHistory.tsx` (NEW)
- `src/server/routes/admin.routes.ts` — config history + rollback endpoints

### Step 6.6 — API Management

**Problem:** No external API key governance. Keys stored in plaintext. No scopes, rotation, or rate limits.

**Actions:**
1. Migration `122_api_management.sql`:
   - `api_keys` (key_hash, name, scopes[], rate_limit, created_by, created_at, expires_at, last_used, disabled).
2. Create `APIManagement.tsx` — issue keys with scopes, rotate, revoke, view usage.
3. Add API key auth middleware for external integrations (separate from session auth).
4. Rate limiting: `express-rate-limit` per API key.

**Files:**
- `supabase/migrations/122_api_management.sql` (NEW)
- `src/components/Admin/APIManagement.tsx` (NEW)
- `src/server/middleware/apiKeyAuth.ts` (NEW)

### Step 6.7 — Migration Hygiene

**Problem:** Duplicate-numbered migrations (`063_*`, `064_*`, `071_*`). No dependency graph. Potential schema conflicts.

**Actions:**
1. Audit all migrations — identify duplicates and conflicts.
2. Renumber duplicates (e.g., `064_checkin_form_settings.sql` -> `064b_checkin_form_settings.sql`).
3. Create `supabase/migrations/README.md` documenting migration order and dependencies.
4. Generate a combined baseline migration from current schema (`supabase/schema.sql` updated).
5. Add pre-deploy check script: verify all migrations apply cleanly to a fresh database.

**Files:**
- `supabase/migrations/` — renumber duplicates
- `supabase/migrations/README.md` (NEW)
- `supabase/schema.sql` — update to current state
- `scripts/verify-migrations.ts` (NEW)

### Step 6.8 — Consolidate Admin Screens

**Problem:** `SystemAdmin`, `BusinessAdmin`, `GlobalConfig`, `MasterData` overlap heavily. Confusing UX.

**Actions:**
1. Merge into single admin layout with sections:
   - **Security Center** (MFA, lockout, IP, password policy, sessions)
   - **Configuration** (property, taxes, fees, POS, fiscal, integrations)
   - **User & Role Management** (users, roles, permissions)
   - **Audit Center** (audit trails, compliance, config history)
   - **Operations** (scheduler, backup, health, API management)
2. Single left-nav matching `SYSTEM_ADMIN_AUDIT.md` Phase 5 ideal design.
3. Remove redundant components.

**Files:**
- `src/components/Admin/AdminPortal.tsx` — restructure
- `src/components/Executive/SystemAdmin.tsx` — merge into AdminPortal
- `src/components/Executive/BusinessAdmin.tsx` — merge into AdminPortal
- `src/components/Admin/GlobalConfigModule.tsx` — merge
- `src/components/Admin/MasterData.tsx` — merge

---

## Testing & Verification Strategy

### Regression Tests (Per Phase)

| Phase | Test | Command |
|-------|------|---------|
| 1 | RLS policy enforcement | `npm run test:security` |
| 1 | Auth endpoints functional | `npm run test:auth` |
| 1 | Lockout triggers after 5 failures | Manual + automated |
| 1 | Dev backdoor blocked in prod | `NODE_ENV=production npm start` |
| 2 | Folio balance parity | `npm run test:folio` |
| 2 | Data mapper correctness | `npm run test:mapper` |
| 3 | Every endpoint returns 401 without auth | `npm run test:routes` |
| 3 | Audit trigger fires on every mutation | `npm run test:audit` |
| 3 | Permission denied for unauthorized role | `npm run test:rbac` |
| 4 | TypeScript compiles clean | `npx tsc --noEmit` |
| 4 | No duplicate component logic | Manual review |
| 5 | Payroll calculation accuracy | `npm run test:payroll` |
| 5 | GL entries balance | `npm run test:gl` |
| 6 | Multi-property data isolation | `npm run test:multi-property` |
| 6 | Scheduler executes jobs | `npm run test:scheduler` |

### Continuous Verification

1. **Before each phase merge:** `npx tsc --noEmit` + `npm run lint` + `npm test`.
2. **After each phase:** Re-score against `SYSTEM_ADMIN_AUDIT.md` Phase 4 scorecard.
3. **After Phase 3:** Security penetration test (manual + automated).
4. **After Phase 6:** Full audit re-run against all architecture documents.

---

## Expected Score Progression

| After Phase | Security | Admin | Perms | Scale | Audit | Compliance | Config | Report | Data | UI/UX | Overall |
|-------------|----------|-------|-------|-------|-------|------------|--------|--------|------|-------|---------|
| 1 ✅ | 7 | 5 | 4 | 3 | 4 | 2 | 6 | 6 | 4 | 5 | 4.6 |
| 2 | 7 | 5 | 4 | 3 | 4 | 2 | 7 | 6 | 8 | 5 | 5.1 |
| 3 | 8 | 6 | 8 | 3 | 8 | 3 | 7 | 6 | 8 | 5 | 6.2 |
| 4 | 8 | 6 | 8 | 4 | 8 | 3 | 8 | 7 | 8 | 8 | 6.8 |
| 5 | 8 | 8 | 8 | 4 | 8 | 3 | 8 | 8 | 8 | 8 | 7.1 |
| 6 | 9 | 8 | 9 | 8 | 9 | 8 | 9 | 8 | 9 | 8 | **8.5** |

---

## Immediate Actions (This Week)

1. Run `npx tsc --noEmit` to establish TypeScript baseline.
2. Create migration `100_rls_policies_comprehensive.sql` and apply.
3. Disable `admin123` dev fallback outside `NODE_ENV=development`.
4. Extract `authenticate` and `requirePermission` middleware.
5. Create `GET /api/reservations/:id/folio` endpoint.
6. Write folio balance parity regression test.
7. Start `DashboardTemplate.tsx` shared component.
8. Audit duplicate migrations (063, 064, 071).

---

*This roadmap is a living document. Update scores after each phase completion.*
