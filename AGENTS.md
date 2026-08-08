# SELEDA ERP — Agent Guidelines

## Architecture: Route-Driven (Phases 0–5 complete)

The system is 100% route-driven. See `ROUTE_DRIVEN_MIGRATION_PLAN.md` for the full migration history.

### Backend

- **`server.ts`** (~90 lines): Only contains `startServer()`, the `/api/health` endpoint, `app.use('/api', apiRouter)`, Vite SPA middleware, and `app.listen()`. No inline route handlers.
- **`src/server/routes/index.ts`**: Composed `apiRouter` — single mount point for all route files. Every API route is mounted here.
- **Route files** (`src/server/routes/*.routes.ts`): Each file exports a `Router()` mounted at a prefix. Handlers are thin — business logic lives in services.
- **Services** (`src/server/services/`):
  - `sessionService.ts` — session/auth helpers (createSession, authenticateUser, writeAuditEvent, etc.)
  - `sharedServices.ts` — data transforms (camelToSnakeRecord, snakeToCamelRecord, autoAssignRoomsForPublicBookings, etc.)
  - `settingsService.ts` — global settings cache + read/write

### Frontend

- **URL scheme**: `/erp/:department/:tab` — every department + tab has its own URL.
- **`src/config/departments.ts`**: Single source of truth for the 18 departments. Each has `key`, `label`, `urlSegment`, `defaultTab`, and `Portal` component. Includes `getDefaultDeptForUser(user)` and `getDefaultErpPath(user)`.
- **`src/config/departmentTabs.ts`**: Per-department tab registry (id, label, modId). Used by `DepartmentRoute` for access control.
- **`src/components/Shared/ErpLayout.tsx`**: Layout route for `/erp` — owns session/auth/forced-password-change guards, renders `<Outlet/>`.
- **`src/components/Shared/DepartmentRoute.tsx`**: Per-department route wrapper — reads `:department`/`:tab` from URL, checks module-disabled + tab-access, renders the portal with `activeTab`/`activeModule` derived from the URL.
- **`src/components/Shared/DepartmentSwitcher.tsx`**: Dropdown in the header for switching departments.
- **`src/components/Shared/ForcedPasswordChangeScreen.tsx`**: Forced password change UI (extracted from App.tsx).
- **`src/App.tsx`** (~930 lines): Outer layout (header, side nav, theme, currency, property switcher) + `<Routes>` for all top-level routes. `activeDept` and `activeTab` are derived from `location.pathname` — no `useState` for department/tab.

### Conventions

- **Adding a new department**: Add to `DEPARTMENTS` in `src/config/departments.ts`, add tabs to `DEPARTMENT_TABS` in `src/config/departmentTabs.ts`, create the portal component, and add sub-nav items to the `subNavItems` memo in `App.tsx`. The route is automatically wired via `DepartmentRoute`.
- **Adding a new tab**: Add to the department's tab list in `departmentTabs.ts` and to the `subNavItems` memo in `App.tsx`. The URL `/erp/:dept/:tab` is automatically handled.
- **Adding a new API route**: Create a route file in `src/server/routes/`, import and mount it in `src/server/routes/index.ts`. Do NOT add inline handlers to `server.ts`.
- **Portal props**: Portals receive `activeTab` (or `activeModule` for finance/hr/admin/procurement) and `onTabChange` from `DepartmentRoute`. Internal state fallbacks exist for backward compatibility but should defer to the URL-driven prop.

## Build & Verification

- **Typecheck**: `npx tsc --noEmit` (7 pre-existing errors in `BusinessIntelligenceDashboard.tsx` — unrelated to the migration)
- **Build**: `npx vite build`
- **Dev server**: `node --import tsx server.ts` (or `npm run dev`)
- **Smoke test**: Start server, hit `GET /api/health` → 200, load `http://localhost:3000/` → SPA served

## Key Files

| File | Purpose |
|------|---------|
| `server.ts` | Entry point — health, apiRouter mount, Vite middleware, listen |
| `src/server/routes/index.ts` | Composed API router — mounts all route files |
| `src/config/departments.ts` | Department registry (18 depts) + role-to-dept mapping |
| `src/config/departmentTabs.ts` | Per-department tab registry with modIds |
| `src/components/Shared/ErpLayout.tsx` | Layout route with auth guards |
| `src/components/Shared/DepartmentRoute.tsx` | Per-department route wrapper + access control |
| `src/components/Shared/DepartmentSwitcher.tsx` | Header dropdown for dept switching |
| `src/App.tsx` | Outer layout + top-level routes |
| `ROUTE_DRIVEN_MIGRATION_PLAN.md` | Full migration plan + history |
