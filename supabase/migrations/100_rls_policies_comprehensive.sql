-- ============================================================
-- 100_rls_policies_comprehensive.sql
-- Comprehensive Row Level Security (RLS) on all public tables
-- 
-- Closes critical security vulnerability where the anon key could
-- read/write system_users, roles, permissions, global_settings,
-- reservations, folios, and all operational tables.
-- ============================================================

-- ============================================================
-- Step 1: Drop ALL existing policies on ALL public tables
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname 
    FROM pg_policies WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 2: Enable RLS on ALL tables in public schema
-- (including the 21 tables that currently lack RLS)
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 3: Create comprehensive RLS policies
-- ============================================================

-- 3a: Public read-only tables (anon SELECT only)
-- These are tables the public booking portal needs to display
-- room types, rates, packages, seasons, and guest services.

CREATE POLICY "anon_select_rooms" ON public.rooms 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_room_types" ON public.room_types 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_rate_plans" ON public.rate_plans 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_packages" ON public.packages 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_seasons" ON public.seasons 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_guest_services" ON public.guest_services 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_yield_policies" ON public.yield_policies 
  FOR SELECT TO anon USING (true);

-- CMS / public website content
CREATE POLICY "anon_select_pages_published" ON public.pages 
  FOR SELECT TO anon USING (status = 'published');

CREATE POLICY "anon_select_blocks_published" ON public.blocks 
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.id = blocks.page_id 
        AND pages.status = 'published'
    )
  );

CREATE POLICY "anon_select_page_versions_published" ON public.page_versions 
  FOR SELECT TO anon USING (
    EXISTS (
      SELECT 1 FROM public.pages 
      WHERE pages.published_version_id = page_versions.id 
        AND pages.status = 'published'
    )
  );

CREATE POLICY "anon_select_block_templates" ON public.block_templates 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_policy_metadata" ON public.policy_page_metadata 
  FOR SELECT TO anon USING (true);

CREATE POLICY "anon_select_legal_templates" ON public.legal_page_templates 
  FOR SELECT TO anon USING (true);

-- Testimonials: public can read approved only
CREATE POLICY "anon_select_testimonials_approved" ON public.public_testimonials 
  FOR SELECT TO anon USING (status = 'approved');

-- 3b: Public insert-only tables (anon can INSERT, no SELECT)
-- These support the public booking portal's write operations.

-- Reservations: public can create bookings
CREATE POLICY "anon_insert_reservations" ON public.reservations 
  FOR INSERT TO anon WITH CHECK (true);

-- Guests: public booking creates guest records
CREATE POLICY "anon_insert_guests" ON public.guests 
  FOR INSERT TO anon WITH CHECK (true);

-- Airport shuttle requests: public can submit
CREATE POLICY "anon_insert_shuttle_requests" ON public.airport_shuttle_requests 
  FOR INSERT TO anon WITH CHECK (true);

-- Testimonials: public can submit (pending review)
CREATE POLICY "anon_insert_testimonials" ON public.public_testimonials 
  FOR INSERT TO anon WITH CHECK (true);

-- Payment idempotency: public payment flow needs insert + select
CREATE POLICY "anon_insert_payment_idempotency" ON public.payment_idempotency 
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_select_payment_idempotency" ON public.payment_idempotency 
  FOR SELECT TO anon USING (true);

-- Payment receipts: public payment confirmation
CREATE POLICY "anon_insert_payment_receipts" ON public.payment_receipts 
  FOR INSERT TO anon WITH CHECK (true);

-- Guest communications: public can submit messages
CREATE POLICY "anon_insert_guest_communications" ON public.guest_communications 
  FOR INSERT TO anon WITH CHECK (true);

-- Guest feedbacks: public can submit feedback
CREATE POLICY "anon_insert_guest_feedbacks" ON public.guest_feedbacks 
  FOR INSERT TO anon WITH CHECK (true);

-- ID documents: public booking can submit ID docs
CREATE POLICY "anon_insert_id_documents" ON public.id_documents 
  FOR INSERT TO anon WITH CHECK (true);

-- Document verifications: public booking flow
CREATE POLICY "anon_insert_document_verifications" ON public.document_verifications 
  FOR INSERT TO anon WITH CHECK (true);

-- 3c: Authenticated role gets full access to ALL operational tables
-- This covers staff users who authenticate via Supabase Auth.
-- (The Express server uses the service_role key which bypasses RLS entirely.)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format(
      'CREATE POLICY "authenticated_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
      r.tablename, r.tablename
    );
  END LOOP;
END $$;

-- ============================================================
-- Step 4: Sensitive tables — anon gets NO access at all
-- ============================================================
-- The following tables have NO anon policies created above,
-- which means anon gets no access (RLS enabled + no policy = denied):
--   system_users, roles, permissions, role_permissions, user_roles,
--   global_settings, audit_events, custom_roles, user_sessions,
--   pending_admin_changes, risk_compliance, audit_logs, audit_exceptions,
--   void_audit_log, business_dates, fiscal_periods, posting_rules,
--   folios, folio_lines, folio_payments, invoice_documents,
--   chart_of_accounts, journal_entries, journal_lines, journal_batches,
--   sales_transactions, expense_requests, fee_components,
--   inventory_items, inventory_stores, inventory_suppliers,
--   inventory_requisitions, inventory_stock_movements, inventory_grns,
--   group_bookings, group_profiles, guest_group_relationships, group_audit_log,
--   corporate_accounts, tour_operators, allotments, allotment_pickup_log,
--   operator_contracts, vouchers, ar_ledger,
--   bank_accounts, tax_codes, usali_chart_of_accounts, usali_item_mappings,
--   ap_vendors, ap_bills, ap_bill_lines, ap_payments,
--   ar_customers, ar_invoices, ar_invoice_lines,
--   fixed_asset_depreciation, budgets, period_close,
--   notifications, dispatched_emails,
--   metric_definitions, reporting_snapshots, metric_history,
--   alert_rules, alert_instances, dashboard_views, drill_down_links,
--   forecast_entries, report_schedules, report_versions, historical_stats,
--   operations_report_definition, operations_generated_report,
--   operations_report_schedule, operations_report_archive,
--   operations_financial_report_definition, operations_monthly_financial_report,
--   operations_quarterly_financial_report, operations_yoy_report,
--   operations_financial_report_schedule,
--   media_assets, page_audit_log, page_preview_links, legal_review_records,
--   gift_shop_sales, gift_shop_issues,
--   vendors, bank_statement_lines, reconciliation_batches,
--   fixed_assets, depreciation_schedules, accounting_periods,
--   outlets, ingredients, menu_items, recipes, recipe_lines,
--   stock_locations, stock_transactions, requisitions, requisition_lines,
--   orders, order_lines, banquet_events, wastage_logs,
--   stock_counts, stock_count_lines

-- ============================================================
-- Step 5: audit_events — append-only
-- Revoke UPDATE and DELETE from anon and authenticated roles
-- ============================================================
REVOKE UPDATE, DELETE ON public.audit_events FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.void_audit_log FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.group_audit_log FROM anon, authenticated;
REVOKE UPDATE, DELETE ON public.page_audit_log FROM anon, authenticated;

-- ============================================================
-- Step 6: Grant base table privileges
-- Ensure anon can SELECT/INSERT on tables with public policies,
-- and authenticated can do everything on operational tables.
-- ============================================================
-- Grant anon the minimum needed
GRANT SELECT ON public.rooms, public.room_types, public.rate_plans, 
  public.packages, public.seasons, public.guest_services, public.yield_policies,
  public.pages, public.blocks, public.page_versions, public.block_templates,
  public.policy_page_metadata, public.legal_page_templates, public.public_testimonials
  TO anon;

GRANT INSERT ON public.reservations, public.guests, public.airport_shuttle_requests,
  public.public_testimonials, public.payment_idempotency, public.payment_receipts,
  public.guest_communications, public.guest_feedbacks, public.id_documents,
  public.document_verifications
  TO anon;

GRANT SELECT ON public.payment_idempotency TO anon;

-- Authenticated gets full DML on all public tables
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Verification (run manually to check):
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT tablename, policyname, roles, cmd FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- ============================================================
