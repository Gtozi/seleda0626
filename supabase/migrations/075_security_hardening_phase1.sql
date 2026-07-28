-- ============================================================
-- Phase 1 Security Hardening
-- ============================================================
-- Goals:
-- 1. Enable RLS on tables that currently ship without it.
-- 2. Block the public `anon` key from sensitive admin/security/financial tables.
-- 3. Allow `anon` SELECT on operational/public tables so the existing
--    frontend read paths keep working while all writes are forced through
--    the trusted Express backend.
-- 4. Add MFA secret storage to system_users.

-- ----------------------------------------------------------------
-- 1. MFA secret storage
-- ----------------------------------------------------------------
ALTER TABLE system_users
  ADD COLUMN IF NOT EXISTS mfa_secret text;

-- ----------------------------------------------------------------
-- 2. Enable RLS on every public table (idempotent)
-- ----------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
  LOOP
    EXECUTE format('ALTER TABLE IF EXISTS public.%I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- ----------------------------------------------------------------
-- 3. Sensitive tables: anon gets no access at all
--    (admin, security, financial ledger, configuration)
-- ----------------------------------------------------------------
DO $$
DECLARE
  sensitive_tables text[] := ARRAY[
    'system_users',
    'custom_roles',
    'roles',
    'permissions',
    'role_permissions',
    'user_roles',
    'user_sessions',
    'audit_events',
    'pending_admin_changes',
    'risk_compliance',
    'global_settings',
    'folios',
    'folio_lines',
    'folio_payments',
    'invoice_documents',
    'journal_entries',
    'journal_lines',
    'journal_batches',
    'posting_rules',
    'chart_of_accounts',
    'fiscal_periods',
    'business_dates',
    'void_audit_log',
    'audit_logs'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY sensitive_tables
  LOOP
    -- Drop any existing permissive policies first
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_no_access', t);
    -- Deny all anon access (service role bypasses RLS, so Express keeps working)
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO anon USING (false) WITH CHECK (false);',
      t || '_anon_no_access', t
    );
  END LOOP;
END $$;

-- ----------------------------------------------------------------
-- 4. Operational / public-facing tables: anon SELECT allowed,
--    writes blocked by default (no INSERT/UPDATE/DELETE policies)
-- ----------------------------------------------------------------
DO $$
DECLARE
  read_only_tables text[] := ARRAY[
    'rooms',
    'guests',
    'reservations',
    'group_bookings',
    'corporate_accounts',
    'inventory_stores',
    'inventory_items',
    'inventory_requisitions',
    'inventory_suppliers',
    'inventory_stock_movements',
    'inventory_grns',
    'sales_transactions',
    'expense_requests',
    'gift_shop_sales',
    'gift_shop_issues',
    'airport_shuttle_requests',
    'group_profiles',
    'guest_group_relationships',
    'group_audit_log',
    'tour_operators',
    'allotments',
    'allotment_pickup_log',
    'operator_contracts',
    'vouchers',
    'ar_ledger',
    'payment_idempotency',
    'bank_accounts',
    'notifications',
    'dispatched_emails',
    'guest_feedbacks',
    'public_testimonials',
    'pages',
    'page_versions',
    'blocks',
    'block_templates',
    'media_assets',
    'policy_page_metadata',
    'legal_page_templates',
    'legal_review_records',
    'page_audit_log',
    'page_preview_links',
    'id_documents',
    'payment_receipts',
    'document_verifications',
    'room_types',
    'yield_policies',
    'guest_services',
    'usali_chart_of_accounts',
    'usali_item_mappings',
    'tax_codes',
    'rate_plans',
    'seasons',
    'packages',
    'fee_components'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY read_only_tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_all', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_no_access', t);
    -- SELECT allowed; INSERT/UPDATE/DELETE are denied because no policy matches
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR SELECT TO anon USING (true);',
      t || '_anon_select', t
    );
  END LOOP;
END $$;
