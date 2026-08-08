-- Migration 219: Temporarily open all permissions for anon role
-- This is a TEMPORARY measure for development while admin portal is not yet set up
-- TODO: Revert this migration once admin portal is properly configured

-- ============================================================
-- Step 1: Drop existing restrictive anon policies
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname 
    FROM pg_policies WHERE schemaname = 'public' AND policyname LIKE 'anon_%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 2: Grant anon role full access to ALL tables
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    -- Grant SELECT access
    EXECUTE format('DROP POLICY IF EXISTS "anon_select_%s" ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY "anon_select_%s" ON public.%I FOR SELECT TO anon USING (true)', r.tablename, r.tablename);
    
    -- Grant INSERT access
    EXECUTE format('DROP POLICY IF EXISTS "anon_insert_%s" ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY "anon_insert_%s" ON public.%I FOR INSERT TO anon WITH CHECK (true)', r.tablename, r.tablename);
    
    -- Grant UPDATE access
    EXECUTE format('DROP POLICY IF EXISTS "anon_update_%s" ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY "anon_update_%s" ON public.%I FOR UPDATE TO anon USING (true) WITH CHECK (true)', r.tablename, r.tablename);
    
    -- Grant DELETE access
    EXECUTE format('DROP POLICY IF EXISTS "anon_delete_%s" ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY "anon_delete_%s" ON public.%I FOR DELETE TO anon USING (true)', r.tablename, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 3: Ensure authenticated role still has full access
-- ============================================================
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "authenticated_all_%s" ON public.%I', r.tablename, r.tablename);
    EXECUTE format('CREATE POLICY "authenticated_all_%s" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', r.tablename, r.tablename);
  END LOOP;
END $$;

-- ============================================================
-- Step 4: Grant execute permissions on all functions to anon
-- ============================================================
-- Note: Some functions have overloads, so we need to handle them by their full signature
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT p.oid::regprocedure as func_signature
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
  LOOP
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon', r.func_signature);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', r.func_signature);
  END LOOP;
END $$;
