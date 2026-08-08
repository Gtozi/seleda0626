# SELEDA ERP — Convert to 100% Route-Driven Architecture

**Status:** PLAN — awaiting approval before any code changes.
**Scope:** Frontend (`src/App.tsx` + 17 portal components) AND Backend (`server.ts` → `src/server/routes/*`).
**URL scheme:** Full nested tree — every navigable department + tab (and sub-screen where applicable) gets its own URL.

---

## 1. Current State (verified)

### Frontend
- `src/main.tsx` wraps `<App/>` in `BrowserRouter`.
- `App.tsx` defines top-level `<Route>`s: `/login`, `/booking`, `/public-portal`, `/guest-portal`, `/guest`, `/pos/login`, `/pos`, `/kds`, `/kds-management`, and a catch-all `/erp/*`.
- Inside `/erp/*`, navigation is **state-driven**, not route-driven:
  - `activeDept` state (17 values: `frontoffice`, `housekeeping`, `f&b`, `maintenance`, `inventory`, `finance`, `hr`, `security`, `executive`, `admin`, `procurement`, `operations`, `sales`, `transportation`, `concierge`, `spa-wellness`, `settings`) — declared at `App.tsx:299`.
  - Per-department tab state: `frontDir`, `hkDir`, `fbDir`, `engDir`, `invDir`, `finDir`, `hrDir`, `secDir`, `transDir`, `adminDir`, `procDir`, `salesDir`, `execDir`, `conciergeDir`, `spaWellnessDir` — declared at `App.tsx:593-608`.
  - `handleSubItemClick` (`App.tsx:1067-1088`) maps a sub-item id to the correct `set*Dir` setter for the *current* department.
  - A giant conditional render block (`App.tsx:1338-1434`) picks the portal via `{activeDept === 'frontoffice' && <FrontOfficePortal activeTab={frontDir} .../>}` etc.
- **Department switching has NO in-app UI today.** `setActiveDept` is only called from `handleLoginSuccess` (role-based, lines 395 & 566) and `ForcedPasswordChangeScreen` (line 1306). `SideNavigation` only *displays* `activeDeptLabel`; it has no switcher. So users are locked into the department chosen at login. **This is a latent UX gap the route conversion will fix.**
- Several portals bypass parent state:
  - `HotelOperationsPortal` uses internal `activeView` (ignores `activeTab` prop). `opsDir` is referenced at `App.tsx:1417` but never declared — a pre-existing bug.
  - `ConciergePortal` and `SpaWellnessPortal` fall back to internal state if the prop is absent.
  - `BanquetEventsPortal` receives no props from `App.tsx`.
- Access control is state-coupled:
  - `useEffect` at `App.tsx:647-672` auto-redirects the tab when the current tab isn't in the user's `moduleAccess`.
  - `isModuleDisabled` check at `App.tsx:689-692` renders a "Module Unavailable" screen when `moduleToggles[activeDept] === false`.
  - Admin module-toggle effect at `App.tsx:679-687` auto-switches admin tab when its module is toggled off.
  - `subNavItems` memo (`App.tsx:695-1042`) builds the sub-nav from `activeDept` + `moduleAccess` + `moduleToggles`.

### Backend
- `server.ts` (7,244 lines, ~323KB) mixes:
  - **65 `app.use()` mounts** of external routers under `src/server/routes/*.routes.ts` (lines 3524-3585, plus middleware/static mounts).
  - **~200 inline `app.get/post/put/patch/delete` handlers** scattered across lines 875-7212.
  - **~30 helper functions** defined in `server.ts` module scope (lines 106-858) that the inline handlers close over — e.g. `createSession`, `getRequestUser`, `authenticateUser`, `writeAuditEvent`, `findOpenFolio`, `ensureFolio`, `filterKnownColumns`, `camelToSnakeRecord`, etc.
  - Fallback-mode constants/users (`FALLBACK_USERS`, `IS_FALLBACK_MODE`, `fallbackSessions`) used by auth helpers.
- **Path-collision risk:** several inline routes share prefixes with already-mounted routers — `/api/auth/*`, `/api/admin/*`, `/api/public/*`, `/api/finance/*`, `/api/fb/*`, `/api/engineering/*`, `/api/sales/*`. Today this works only because inline handlers are registered *before* the `app.use()` mounts in some cases and Express matches in order; it's fragile and must be resolved by merging inline handlers into the corresponding router files.
- Large inline handlers that are deeply coupled to server.ts helpers: `POST /api/public/bookings` (~300 lines), `POST /api/reservations/:id/payments` (~280 lines), `POST /api/reservations/:id/check-in` (~150 lines), `POST /api/hr/payroll-runs` (~80 lines).

---

## 2. Target Architecture

### Frontend URL scheme
```
/login
/booking
/public-portal
/guest-portal
/guest
/pos/login
/pos
/kds
/kds-management
/erp                              → redirect to user's default dept/tab
/erp/:department                  → department default tab
/erp/:department/:tab             → specific tab
/erp/:department/:tab/*           → sub-screen / detail (e.g. /erp/frontoffice/reservations/:id)
```
- `:department` ∈ the 17 values above (URL-safe: `f&b` → `fb`, `spa-wellness` stays).
- `:tab` ∈ each portal's tab set (enumerated in §3 of the frontend subagent report).
- Deep detail state (e.g. `selectedGuestId` in FrontOfficePortal) moves to route params or `useSearchParams` where it represents a navigable screen; ephemeral UI state (modal open/closed) stays in component state.

### Frontend component model
- `App.tsx` keeps the outer layout (header, side nav, theme, currency, property switcher) and renders `<Routes>` with nested `<Route>` elements under `/erp/*`.
- A new `<ErpLayout>` component owns the auth/session/forced-password-change/module-disabled guards and renders an `<Outlet/>` for the matched department route.
- Each department gets a thin route wrapper (e.g. `<FrontOfficeRoute>`) that reads `useParams()`, applies per-tab access checks, and renders the existing portal component with `activeTab` derived from the URL. **Portals keep their `activeTab` prop API** — we do NOT rewrite every portal's internals in this pass; we only feed the prop from the URL instead of from App.tsx state. This keeps the blast radius manageable while making navigation 100% route-driven.
- The internal-state portals (`HotelOperationsPortal`, `ConciergePortal`, `SpaWellnessPortal`, `BanquetEventsPortal`) get a small change: accept `activeTab`/`onTabChange` from the route wrapper and remove the fallback internal state (or sync it to the URL).
- A new `<DepartmentSwitcher>` (dropdown in the header) lets users change department — this fills the existing UX gap and is required for the route model to be useful. It calls `navigate('/erp/:department')`.
- `SideNavigation` switches from `onSubItemClick(id)` to either `<Link>`s or `navigate('/erp/:dept/:tab')`. The `subNavItems` memo still computes the visible items, but each item carries a `to` path.

### Frontend access control
- Replace the `useEffect` auto-redirect with a `<RouteGuard>` wrapper that, on mount/param change, checks `moduleAccess` and `moduleToggles` and either renders the portal or `<Navigate>`s to the first accessible tab (or to a "Module Unavailable" route for disabled modules).
- Login redirect: after login, compute the user's default `:department`/`:tab` and `navigate('/erp/:dept/:tab')` instead of `setActiveDept(...)` + `navigate('/erp')`.

### Backend target
- `server.ts` shrinks to: imports, constants, helper extraction, `startServer()`, middleware, **one `app.use('/api', apiRouter)`**, static serving, SPA fallback, listen, scheduler.
- A new `src/server/routes/index.ts` composes a single root `apiRouter` that mounts every domain sub-router.
- All ~200 inline handlers move into route files. Where a router file already exists for the prefix, the inline handlers are **merged** into it. Where none exists, a new file is created.
- The ~30 server.ts-scoped helpers move into shared modules so route files can import them:
  - Session/auth helpers → `src/server/services/sessionService.ts` (new) or extend `authHelpers.ts`.
  - Folio helpers (`findOpenFolio`, `ensureFolio`) → `src/server/services/folioService.ts` (new).
  - Settings column helpers → extend `settingsService.ts`.
  - Data transforms (`camelToSnakeRecord`, `snakeToCamelRecord`, `rangesOverlap`, etc.) → `src/server/utils/dataTransform.ts` (new).
  - `writeAuditEvent` → already effectively shared; formalize in `sharedServices.ts`.
  - Fallback-mode state → `src/server/services/fallbackStore.ts` (new) holding `IS_FALLBACK_MODE`, `FALLBACK_USERS`, `fallbackSessions`.
- Large handlers get extracted to service functions first (e.g. `publicBookingService.createBooking`, `folioService.postPayment`, `frontOfficeService.checkIn`, `payrollService.runPayroll`), then the route file calls the service.

---

## 3. Migration Plan — Phased

Each phase is independently shippable and verifiable (build + typecheck + manual smoke). No phase breaks existing URLs because we keep all current paths working.

### Phase 0 — Scaffolding & route registry (no behavior change)
**Frontend**
1. Create `src/config/departments.ts`: single source of truth listing the 17 departments → `{ key, label, urlSegment, defaultTab, portalComponent }`.
2. Create `src/config/departmentTabs.ts`: per-department tab registry (id → `{ label, urlSegment }`) sourced from the portal components' existing tab lists. This replaces the implicit knowledge in `subNavItems`.
3. Create `src/components/Shared/RouteGuard.tsx` (stub) and `src/components/Shared/ErpLayout.tsx` (stub).
4. Add `DepartmentSwitcher.tsx` (stub).

**Backend**
5. Create `src/server/routes/index.ts` that re-exports a composed `apiRouter` mounting all *existing* routers (no inline handlers moved yet). Mount it via `app.use('/api', apiRouter)` in server.ts **alongside** the existing inline handlers and per-prefix `app.use` mounts — verify nothing breaks, then remove the old per-prefix mounts in a follow-up commit. (This is a no-op refactor that just centralizes mounting.)

**Verify:** `npm run build` + `npx tsc --noEmit` + start server, hit a few endpoints.

### Phase 1 — Backend helper extraction (no route movement)
1. Move the ~30 server.ts-scoped helpers into the shared modules listed in §2. server.ts imports them back. No route changes.
2. Extract the 4 large handler bodies into service functions (`publicBookingService`, `folioService.postPayment`, `frontOfficeService.checkIn`, `payrollService.runPayroll`). server.ts inline handlers call the services.
3. **Verify:** build, typecheck, run any existing tests, smoke-test the 4 endpoints.

### Phase 2 — Backend route extraction (mechanical move)
Move inline handlers into route files in **collision-safe order** (merge into existing routers where prefixes overlap; create new files otherwise). After each group, run build + smoke.

Order (lowest risk first):
1. **New files, no collision:** `audit.routes.ts`, `nightAudit.routes.ts`, `properties.routes.ts`, `cashierShifts.routes.ts`, `guests.routes.ts`, `reservationSeries.routes.ts`, `forecasting.routes.ts`, `preRegistration.routes.ts`, `channels.routes.ts`, `hr.routes.ts`.
2. **Merge into existing routers (resolve collisions):** `auth.routes.ts` (auth inline), `admin.routes.ts` (admin bookings/settings/pending-changes/public-booking-content), `public.routes.ts` (public bookings/billing/pre-registration), `reports.routes.ts` (report-schedules/versions), `finance.routes.ts` (bank-accounts/AR/fixed-assets/tax-codes/budget-actual/period-close), `foodBeverage.routes.ts` (fb outlets/banquet-events), `engineeringPortal.routes.ts` (engineering assets/pm/work-orders/spare-parts), `salesEventsPortal.routes.ts` (sales leads/contracts/proposals/corporate-accounts/analytics), `reservations.routes.ts` (reservation ops: change-room/check-in/no-show/cancel).
3. **Folio cluster (depends on Phase 1 folioService):** new `folio.routes.ts` for all folio/billing/invoice/charges/payments/move/void handlers + `POST /api/folios/:folioId/generate-invoice`.
4. **Settings:** new `settings.routes.ts` for `GET /api/settings`, `GET/PATCH /api/admin/settings`. (Admin settings could also live in `admin.routes.ts`; I'll put user-facing `/api/settings` in `settings.routes.ts` and admin settings in `admin.routes.ts` to keep prefix cohesion — final call during implementation.)
5. **Health:** `GET /api/health` stays in server.ts (it's a bootstrap-level check) OR moves to a tiny `health.routes.ts`. Lean toward keeping in server.ts.
6. Remove all moved inline handlers from server.ts; remove the now-redundant per-prefix `app.use` mounts; keep only `app.use('/api', apiRouter)` + static + SPA fallback.

**Verify after each group:** `npx tsc --noEmit`, `npm run build`, start server, hit representative endpoints from each moved group, check for 404s/collisions.

### Phase 3 — Frontend route wrappers (no UX change yet)
1. Build out `ErpLayout.tsx`: replicates the current `/erp/*` element's auth/session/forced-password-change/module-disabled logic, renders `<Outlet/>`.
2. For each department, create a route wrapper (e.g. `src/components/FrontOffice/FrontOfficeRoute.tsx`) that:
   - reads `:tab` from `useParams` (defaults to department's `defaultTab`),
   - runs the access/module-toggle guard,
   - renders `<FrontOfficePortal activeTab={tab} onTabChange={(t)=>navigate(`/erp/frontoffice/${t}`)} />`.
3. In `App.tsx`, replace the `/erp/*` element with nested `<Route>`s:
   ```
   <Route path="/erp" element={<ErpLayout/>}>
     <Route index element={<Navigate to={defaultForUser} replace/>} />
     <Route path="frontoffice" element={<FrontOfficeRoute/>}>
       <Route path=":tab" element={<FrontOfficeRoute/>} />
     </Route>
     ... (one per department) ...
     <Route path="*" element={<Navigate to={defaultForUser} replace/>} />
   </Route>
   ```
   (Exact nesting shape finalized during implementation — likely a flat `:department/:tab` rather than per-dept wrapper routes, driven by the registry from Phase 0.)
4. Replace `handleSubItemClick` with `navigate(`/erp/${dept}/${tab}`)`. `SideNavigation` items get `to` paths.
5. Replace `setActiveDept` in login handlers with `navigate('/erp/${defaultDept}/${defaultTab}')`.
6. **Keep `activeDept`/`*Dir` state temporarily** as a derived-from-URL value (`activeDept = useParams().department`) so the rest of App.tsx (sub-nav memo, header) keeps working with minimal changes. Remove the raw `useState` declarations.

**Verify:** build, typecheck, click through every department + several tabs, verify URL changes, refresh on a deep URL lands on the right screen, back/forward works.

### Phase 4 — Fix internal-state portals & add DepartmentSwitcher
1. `HotelOperationsPortal`: remove internal `activeView`, accept `activeTab`/`onTabChange` from `OperationsRoute`. Fix the missing `opsDir` bug (now moot — comes from URL).
2. `ConciergePortal`, `SpaWellnessPortal`: remove fallback internal state; always driven by route.
3. `BanquetEventsPortal`: wire up `activeTab`/`onTabChange` from `BanquetEventsRoute`.
4. Implement `DepartmentSwitcher` in the header: lists departments the user has `moduleAccess` to (and not module-disabled), `navigate(`/erp/${seg}`)` on select.
5. Move deep detail state (e.g. `selectedGuestId`) into route params/searchParams where it represents a navigable sub-screen. (Scope this per-portal during implementation; not every piece of state needs to move — only state that should be bookmarkable/back-button-able.)

**Verify:** full click-through again, refresh on deep links, back/forward, department switching via the new dropdown, module-disabled redirect, role-based default landing.

### Phase 5 — Cleanup
1. Remove dead code: old `setActiveDept`/`set*Dir` references, the giant conditional render block, the now-unused `subNavItems` memo pieces that were duplicated by the registry.
2. Update `AGENTS.md` with the new route-driven conventions and the route registry location.
3. Final build + typecheck + smoke.

---

## 4. Risk Register

| # | Risk | Mitigation |
|---|------|------------|
| R1 | Backend path collisions cause 404s after extraction | Move collision-prone groups last; after each move, smoke-test the exact URLs; keep old mounts until the new router is verified. |
| R2 | server.ts helpers close over module state (`fallbackSessions`, `cachedGlobalSettingsColumns`) | Phase 1 moves that state into dedicated modules first; route files import from there. |
| R3 | Large handlers (`/public/bookings`, `/payments`) break when extracted | Phase 1 extracts them as service functions with the same inputs/outputs; route handler becomes a thin adapter. |
| R4 | Frontend portals with internal state desync from URL | Phase 4 explicitly fixes the 4 known portals; guard against regressions with a "refresh on deep URL" smoke test. |
| R5 | Access-control `useEffect`s no longer fire when navigation is route-driven | `RouteGuard` performs the same checks on param change; covered in Phase 3. |
| R6 | No in-app department switcher exists today | Phase 4 adds `DepartmentSwitcher` — required for the route model to be usable, not optional. |
| R7 | `f&b` URL segment is unsafe | Map to `fb` in the registry; translate at the route boundary. |
| R8 | Deep-link refresh on `/erp/:dept/:tab` hits SPA fallback — must serve `index.html` | Already handled by the `app.get('*')` SPA fallback in server.ts; verify during Phase 3. |
| R9 | Pre-existing `opsDir`-undefined bug surfaces once Operations is routed | Phase 4 fixes it; until then Operations route wrapper supplies the default tab. |
| R10 | TypeScript strictness errors from the refactor | Run `npx tsc --noEmit` after every phase; fix incrementally. |

---

## 5. Verification Strategy (per phase)
- **Build:** `npm run build` (Vite production build).
- **Typecheck:** `npx tsc --noEmit` (project already has a `tsconfig.json`).
- **Backend smoke:** start server (`npm run dev` or equivalent), `curl` representative endpoints from each moved group, check status codes + a sample response body.
- **Frontend smoke:** load app, log in, click through each department and at least 3 tabs per department, refresh on a deep URL, use back/forward, switch departments via the new switcher, verify module-disabled redirect and role-based landing.
- **Regression:** any existing tests in `tests/` (check during Phase 0).

---

## 6. Out of Scope (explicit)
- Rewriting portal component *internals* beyond what's needed to feed `activeTab` from the URL. The portals stay as-is internally; only their prop source changes.
- Backend business-logic changes — handlers move verbatim (or via a service-extraction shim) with no behavior change.
- Database/schema changes.
- Mobile app (`seleda-mobile/`).
- The many `tmp-*` and `*.md` audit files in the repo root.

---

## 7. Approval

This plan is **plan-only**. No code has been changed. Please confirm to proceed, and tell me:
1. Which phase to start with (default: Phase 0 → 1 → 2 → 3 → 4 → 5 in order).
2. Whether to commit after each phase or one big commit at the end.
3. Any constraints I missed (e.g. must keep a specific URL backward-compatible, must not touch a given portal).
