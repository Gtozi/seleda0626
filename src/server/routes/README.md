# Backend Route Conventions

This directory holds modular Express routers that replace the monolithic route
blocks in `server.ts`. The goal is to group routes by domain, make auth and
validation patterns explicit, and keep `server.ts` focused on bootstrapping.

## Conventions

1. **One router per domain.** Name the file `<domain>.routes.ts` and mount it
   under a base path, e.g. `app.use('/api/b2b', b2bRoutes)`.
2. **Route paths are relative to the mount point.** Inside a router prefer
   `router.get('/operators', ...)` over `app.get('/api/b2b/operators', ...)`.
3. **Shared dependencies.** Routers import the same middleware and helpers used
   elsewhere:
   - `authenticate`, `requirePermission` from `../middleware/auth`
   - `hasSupabaseAdminConfig`, `supabaseAdmin` from `../supabaseAdmin`
4. **DB-not-configured guard.** Every route body must early-return
   `503 { error: 'Database not configured' }` when `supabaseAdmin` is not set.
5. **Prefer RPCs over fat controllers.** Business rules live in Postgres RPCs;
   routes validate inputs, call Supabase, and shape responses.
6. **Audit logging.** Mutating routes should call `writeAuditEvent` where available
   (TODO: move `writeAuditEvent` to a shared server helper once extraction work
   reaches that part of `server.ts`).
7. **Types.** Keep route files TypeScript; import domain types from
   `../../types/erp.ts` when needed.

## Current routers

| File             | Mount path   | Scope                          |
|------------------|--------------|--------------------------------|
| `b2b.routes.ts`  | `/api/b2b`   | Tour operators, allotments,    |
|                  |              | contracts, vouchers, AR ledger |
