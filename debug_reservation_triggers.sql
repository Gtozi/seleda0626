-- Debug script to find what's causing the created_at error
-- This will identify triggers, RLS policies, or views that might reference created_at

-- Step 1: Check for triggers on reservations table
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE event_object_table = 'reservations';

-- Step 2: Check for RLS policies on reservations table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'reservations';

-- Step 3: Check for views that reference reservations
SELECT 
  schemaname,
  viewname,
  viewowner,
  definition
FROM pg_views
WHERE definition ILIKE '%reservations%';

-- Step 4: Check for functions that reference created_at and reservations
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE prosrc ILIKE '%reservations%' 
  AND prosrc ILIKE '%created_at%';

-- Step 5: Check the actual structure of reservations table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reservations'
ORDER BY ordinal_position;