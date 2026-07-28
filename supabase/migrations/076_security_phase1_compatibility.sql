-- ============================================================
-- Phase 1 Security Hardening — Compatibility Adjustment
-- ============================================================
-- The previous migration enabled RLS broadly. This migration restores
-- permissive anon access on operational and general admin tables so the
-- existing frontend read/write paths keep working while the core
-- sensitive tables remain locked down.
--
-- Next phase: migrate operational writes to Express endpoints and replace
-- these permissive policies with scoped, command-specific policies.

DO $$
DECLARE
  restore_tables text[] := ARRAY[
    -- Operational tables used by front desk, housekeeping, f&b, inventory, etc.
    'rooms', 'guests', 'reservations', 'group_bookings', 'corporate_accounts',
    'inventory_stores', 'inventory_items', 'inventory_requisitions', 'inventory_suppliers',
    'inventory_stock_movements', 'inventory_grns', 'sales_transactions', 'expense_requests',
    'gift_shop_sales', 'gift_shop_issues', 'airport_shuttle_requests',
    'group_profiles', 'guest_group_relationships', 'group_audit_log',
    'tour_operators', 'allotments', 'allotment_pickup_log', 'operator_contracts',
    'vouchers', 'ar_ledger', 'payment_idempotency', 'bank_accounts',
    'notifications', 'dispatched_emails', 'guest_feedbacks', 'public_testimonials',
    'pages', 'page_versions', 'blocks', 'block_templates', 'media_assets',
    'policy_page_metadata', 'legal_page_templates', 'legal_review_records',
    'page_audit_log', 'page_preview_links',
    'id_documents', 'payment_receipts', 'document_verifications',
    'room_types', 'yield_policies', 'guest_services', 'usali_chart_of_accounts',
    'usali_item_mappings', 'tax_codes', 'rate_plans', 'seasons', 'packages',
    'fee_components',
    -- Admin tables whose reads/writes still flow through the frontend supabaseService
    -- during Phase 1. Writes already use Express endpoints; reads will be migrated
    -- in Phase 2.
    'system_users', 'custom_roles', 'roles', 'permissions', 'role_permissions', 'user_roles',
    'global_settings'
  ];
  t text;
BEGIN
  FOREACH t IN ARRAY restore_tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_select', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_no_access', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', t || '_anon_all', t);
    -- Restore permissive anon access to maintain current application behavior.
    -- This will be tightened once all writes are routed through Express.
    EXECUTE format(
      'CREATE POLICY %I ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true);',
      t || '_anon_all', t
    );
  END LOOP;
END $$;
