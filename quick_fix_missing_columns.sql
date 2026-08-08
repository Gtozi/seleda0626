-- QUICK FIX: Add missing columns to resolve immediate errors
-- Run this in your Supabase SQL Editor immediately

-- Add created_at column to reservations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN created_at timestamptz DEFAULT now();
    RAISE NOTICE '✅ Added created_at column to reservations';
  ELSE
    RAISE NOTICE '✅ created_at column already exists in reservations';
  END IF;
END $$;

-- Add updated_at column to reservations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE '✅ Added updated_at column to reservations';
  ELSE
    RAISE NOTICE '✅ updated_at column already exists in reservations';
  END IF;
END $$;

-- Add average_daily_rate column to guest_group_relationships table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guest_group_relationships' AND column_name = 'average_daily_rate'
  ) THEN
    ALTER TABLE guest_group_relationships ADD COLUMN average_daily_rate numeric DEFAULT 0.00;
    RAISE NOTICE '✅ Added average_daily_rate column to guest_group_relationships';
  ELSE
    RAISE NOTICE '✅ average_daily_rate column already exists in guest_group_relationships';
  END IF;
END $$;

-- Add room_type_breakdown column to group_profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'group_profiles' AND column_name = 'room_type_breakdown'
  ) THEN
    ALTER TABLE group_profiles ADD COLUMN room_type_breakdown jsonb DEFAULT '[]'::jsonb;
    RAISE NOTICE '✅ Added room_type_breakdown column to group_profiles';
  ELSE
    RAISE NOTICE '✅ room_type_breakdown column already exists in group_profiles';
  END IF;
END $$;

-- Verify the columns were added
SELECT 
  'reservations' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'reservations' 
  AND column_name IN ('created_at', 'updated_at')
UNION ALL
SELECT 
  'guest_group_relationships' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'guest_group_relationships' 
  AND column_name = 'average_daily_rate'
UNION ALL
SELECT 
  'group_profiles' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'group_profiles' 
  AND column_name = 'room_type_breakdown';

-- Quick fix completed - check the results above to verify columns were added successfully