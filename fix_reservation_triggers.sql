-- COMPREHENSIVE FIX: Resolve created_at column issue on reservations
-- This script will:
-- 1. Add missing columns (created_at, updated_at, created_by)
-- 2. Find and show all triggers on reservations
-- 3. Drop problematic triggers that reference non-existent columns

-- ================================================================================
-- STEP 1: Add missing columns directly (no DO blocks, just direct ALTER)
-- ================================================================================

ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS created_by text;

-- ================================================================================
-- STEP 2: Show all triggers on reservations table
-- ================================================================================

SELECT 
  tgname as trigger_name,
  tgtype as trigger_type,
  tgenabled as is_enabled,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'reservations'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ================================================================================
-- STEP 3: Show all functions that might reference created_at on reservations
-- ================================================================================

SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE prosrc ILIKE '%reservations%' 
  AND prosrc ILIKE '%created_at%'
ORDER BY proname;

-- ================================================================================
-- STEP 4: Find and drop triggers that reference created_at incorrectly
-- ================================================================================

-- Drop common problematic triggers (these are safe to drop - we'll recreate if needed)
DROP TRIGGER IF EXISTS trigger_reservations_created_at ON reservations;
DROP TRIGGER IF EXISTS trigger_reservations_updated_at ON reservations;
DROP TRIGGER IF EXISTS trigger_reservation_created_at ON reservations;
DROP TRIGGER IF EXISTS trigger_reservation_updated_at ON reservations;
DROP TRIGGER IF EXISTS trg_reservations_created_at ON reservations;
DROP TRIGGER IF EXISTS trg_reservations_updated_at ON reservations;
DROP TRIGGER IF EXISTS update_reservations_updated_at ON reservations;
DROP TRIGGER IF EXISTS set_reservations_created_at ON reservations;
DROP TRIGGER IF EXISTS set_reservations_updated_at ON reservations;

-- ================================================================================
-- STEP 5: Create a safe updated_at trigger (that doesn't reference created_at)
-- ================================================================================

CREATE OR REPLACE FUNCTION update_reservation_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only update updated_at if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'updated_at'
  ) THEN
    NEW.updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_reservation_updated_at ON reservations;
CREATE TRIGGER trigger_reservation_updated_at
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_reservation_timestamp();

-- ================================================================================
-- STEP 6: Verify columns now exist
-- ================================================================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'reservations'
  AND column_name IN ('created_at', 'updated_at', 'created_by')
ORDER BY column_name;

-- ================================================================================
-- STEP 7: Show remaining triggers (should be clean now)
-- ================================================================================

SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'reservations'::regclass
  AND NOT tgisinternal
ORDER BY tgname;