-- Migration 206: RLS Policies for F&B Tables Missing Policies
-- Phase 4 Item 2: Add RLS policies to all core F&B tables

-- Apply standard service_role + authenticated policies to all fb_ tables missing them

DO $$
DECLARE
  t RECORD;
BEGIN
  FOR t IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND rowsecurity = true
    AND tablename LIKE 'fb_%'
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies p
      WHERE p.tablename = pg_tables.tablename AND p.schemaname = 'public'
    )
  LOOP
    EXECUTE format(
      'CREATE POLICY "service_role all %s" ON public.%I FOR ALL
       USING (auth.role() = ''service_role'')
       WITH CHECK (auth.role() = ''service_role'')',
      t.tablename, t.tablename
    );
    EXECUTE format(
      'CREATE POLICY "authenticated read %s" ON public.%I FOR SELECT
       USING (auth.role() = ''authenticated'')',
      t.tablename, t.tablename
    );
  END LOOP;
END $$;

-- Revoke EXECUTE on manager PIN SECURITY DEFINER functions from authenticated/anon
-- These should only be called via the Express backend using service_role
REVOKE EXECUTE ON FUNCTION public.verify_manager_pin(TEXT, TEXT, UUID, TEXT) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.set_manager_pin(TEXT, TEXT) FROM authenticated, anon;
REVOKE EXECUTE ON FUNCTION public.reset_manager_pin(TEXT, TEXT) FROM authenticated, anon;
