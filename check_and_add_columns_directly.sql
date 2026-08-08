-- Step 1: Check if the columns exist
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('reservations', 'guest_group_relationships', 'group_profiles')
  AND column_name IN ('created_at', 'updated_at', 'average_daily_rate', 'room_type_breakdown')
ORDER BY table_name, column_name;

-- Step 2: If created_at doesn't exist in reservations, add it directly
-- (Run this separately if needed)
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Step 3: If updated_at doesn't exist in reservations, add it directly
ALTER TABLE reservations 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Step 4: If average_daily_rate doesn't exist in guest_group_relationships, add it directly
ALTER TABLE guest_group_relationships 
ADD COLUMN IF NOT EXISTS average_daily_rate numeric DEFAULT 0.00;

-- Step 5: If room_type_breakdown doesn't exist in group_profiles, add it directly
ALTER TABLE group_profiles 
ADD COLUMN IF NOT EXISTS room_type_breakdown jsonb DEFAULT '[]'::jsonb;

-- Step 6: Verify the columns were added
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('reservations', 'guest_group_relationships', 'group_profiles')
  AND column_name IN ('created_at', 'updated_at', 'average_daily_rate', 'room_type_breakdown')
ORDER BY table_name, column_name;