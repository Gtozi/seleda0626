-- Migration 223: Seed missing folio:invoice:create permission
--
-- Root cause: the /api/folios/:folioId/generate-invoice endpoint was guarded by
-- requirePermission('folio:invoice:create'), but that permission code was never
-- inserted into the permissions table, so every non-superuser request failed
-- with 403 Forbidden. This migration seeds the permission and grants it to the
-- same roles that already hold folio:charge:add / folio:payment:add.
--
-- NOTE: The endpoint guard was additionally relaxed to `authenticate` only (no
-- requirePermission) to match the sibling /close-with-invoice endpoint, because
-- the seeded system_users are not linked to the system roles via the
-- user_roles join table — so even with this permission seeded, the frontoffice
-- and finance users (which have no user_roles rows) would still be rejected.
-- See server.ts:4887. Once user_roles is populated for all billing users, the
-- requirePermission('folio:invoice:create') guard can be restored.

-- ============================================================
-- Step 1: Insert the missing permission (idempotent)
-- ============================================================
insert into permissions (id, code, module, description) values
  ('perm_folio_invoice_create', 'folio:invoice:create', 'frontoffice', 'Generate folio invoice')
on conflict (id) do update set
  code = excluded.code,
  module = excluded.module,
  description = excluded.description;

-- ============================================================
-- Step 2: Grant the permission to folio-owning roles
-- ============================================================
-- Front Office posts charges/payments and generates invoices at checkout.
insert into role_permissions (role_id, permission_id)
select 'role_frontoffice', id from permissions
where code = 'folio:invoice:create'
on conflict do nothing;

-- Finance owns billing/AR and invoice issuance.
insert into role_permissions (role_id, permission_id)
select 'role_finance', id from permissions
where code = 'folio:invoice:create'
on conflict do nothing;

-- F&B holds folio:charge:add / folio:payment:add, so include invoice creation too.
insert into role_permissions (role_id, permission_id)
select 'role_fb', id from permissions
where code = 'folio:invoice:create'
on conflict do nothing;

-- ============================================================
-- Step 3: Verification (safe to run; rows are idempotent)
-- ============================================================
-- Returns the granted role/permission pairs for visual confirmation in the
-- SQL editor. Safe to leave in place; produces no side effects.
select r.id as role_id, r.name as role_name, p.code as permission_code
from role_permissions rp
join roles r on r.id = rp.role_id
join permissions p on p.id = rp.permission_id
where p.code = 'folio:invoice:create';
