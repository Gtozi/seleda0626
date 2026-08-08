/**
 * Apply migration 219: Temporarily open all permissions for anon role
 * Run: npx tsx supabase/run-migration-219.ts
 * 
 * WARNING: This is a TEMPORARY measure for development while admin portal is not yet set up
 * TODO: Revert this migration once admin portal is properly configured
 */
import dotenv from 'dotenv';
dotenv.config();
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const sql = `
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
`;

let result;
try {
  result = await (supabase as any).rpc('exec_sql', { query: sql });
} catch (e) {
  // Fallback: execute via raw SQL using the REST API
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  result = res.ok ? { error: null } : { error: await res.text() };
}

if (result.error) {
  console.error('Could not auto-apply migration. Please run the following SQL in your Supabase SQL Editor:\n');
  console.log(sql);
  process.exit(1);
}

console.log('✓ Migration 219 applied: All permissions temporarily opened for anon role.');
console.log('⚠️  WARNING: This is a temporary development measure. Revert once admin portal is configured.');
