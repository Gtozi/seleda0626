-- Migration 116: Enable RLS on remaining unprotected tables
-- Tables created in migrations 112-115 were missing RLS policies.
-- This closes the security gap where anon key could read/write:
--   pm_schedules, work_orders, spare_parts (Engineering)
--   sales_leads, sales_proposals, sales_contracts, group_blocks (Sales)
--   payroll_runs, payslips, tax_bands, pension_rates (HR/Payroll)

-- =============================================================
-- 1. Enable RLS on all tables that currently lack it
-- =============================================================

ALTER TABLE public.pm_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spare_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pension_rates ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- 2. Authenticated role gets full CRUD (staff users via Supabase Auth)
--    The Express server uses service_role key which bypasses RLS.
-- =============================================================

DROP POLICY IF EXISTS "authenticated_all_pm_schedules" ON public.pm_schedules;
CREATE POLICY "authenticated_all_pm_schedules" ON public.pm_schedules
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_work_orders" ON public.work_orders;
CREATE POLICY "authenticated_all_work_orders" ON public.work_orders
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_spare_parts" ON public.spare_parts;
CREATE POLICY "authenticated_all_spare_parts" ON public.spare_parts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_sales_leads" ON public.sales_leads;
CREATE POLICY "authenticated_all_sales_leads" ON public.sales_leads
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_sales_proposals" ON public.sales_proposals;
CREATE POLICY "authenticated_all_sales_proposals" ON public.sales_proposals
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_sales_contracts" ON public.sales_contracts;
CREATE POLICY "authenticated_all_sales_contracts" ON public.sales_contracts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_group_blocks" ON public.group_blocks;
CREATE POLICY "authenticated_all_group_blocks" ON public.group_blocks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_payroll_runs" ON public.payroll_runs;
CREATE POLICY "authenticated_all_payroll_runs" ON public.payroll_runs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_payslips" ON public.payslips;
CREATE POLICY "authenticated_all_payslips" ON public.payslips
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_tax_bands" ON public.tax_bands;
CREATE POLICY "authenticated_all_tax_bands" ON public.tax_bands
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_pension_rates" ON public.pension_rates;
CREATE POLICY "authenticated_all_pension_rates" ON public.pension_rates
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- =============================================================
-- 3. Grant DML privileges to authenticated role
-- =============================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.pm_schedules, public.work_orders, public.spare_parts,
  public.sales_leads, public.sales_proposals, public.sales_contracts,
  public.group_blocks,
  public.payroll_runs, public.payslips, public.tax_bands, public.pension_rates
  TO authenticated;

-- =============================================================
-- 4. No anon policies = anon gets no access (RLS enabled + no policy = denied)
-- =============================================================
-- Verification:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false;
-- (should return 0 rows after this migration)
