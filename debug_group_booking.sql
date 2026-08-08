-- Debug script to test group booking functionality
-- This will help identify why only one guest profile is being created

-- ================================================================================
-- TEST 1: Check if create_booking_atomic is updated
-- ================================================================================

SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'create_booking_atomic';

-- ================================================================================
-- TEST 2: Check current group_bookings and group_profiles
-- ================================================================================

SELECT 'Group Bookings' as table_name, COUNT(*) as count FROM group_bookings
UNION ALL
SELECT 'Group Profiles', COUNT(*) FROM group_profiles
UNION ALL  
SELECT 'Guest Group Relationships', COUNT(*) FROM guest_group_relationships
UNION ALL
SELECT 'Guests with parent_group_id', COUNT(*) FROM guests WHERE parent_group_id IS NOT NULL;

-- ================================================================================
-- TEST 3: Check recent group bookings
-- ================================================================================

SELECT 
  gb.id,
  gb.group_name,
  gb.room_count,
  gb.contact_email,
  gb.status
FROM group_bookings gb
ORDER BY gb.id DESC
LIMIT 5;

-- ================================================================================
-- TEST 4: Check guests created for group bookings
-- ================================================================================

SELECT 
  g.id,
  g.name,
  g.email,
  g.is_primary_contact,
  g.parent_group_id,
  g.notes
FROM guests g
WHERE g.notes LIKE '%Group booking%'
ORDER BY g.id DESC
LIMIT 10;

-- ================================================================================
-- TEST 5: Check reservations for group bookings
-- ================================================================================

SELECT 
  r.id,
  r.guest_name,
  r.guest_email,
  r.group_booking_id,
  r.is_group,
  r.guest_id,
  r.status
FROM reservations r
WHERE r.is_group = true OR r.group_booking_id IS NOT NULL
ORDER BY r.id DESC
LIMIT 10;

-- ================================================================================
-- TEST 6: Simple test of the group booking logic
-- ================================================================================

-- First, let's test with a simple group booking call
-- This mimics what the booking engine would do

-- Check if the function signature matches what we expect
SELECT 
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'create_booking_atomic';

-- ================================================================================
-- TEST 7: Add missing column if needed
-- ================================================================================

-- Add average_daily_rate column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guest_group_relationships' AND column_name = 'average_daily_rate'
  ) THEN
    ALTER TABLE guest_group_relationships ADD COLUMN average_daily_rate numeric DEFAULT 0.00;
    RAISE NOTICE 'Added average_daily_rate column to guest_group_relationships';
  ELSE
    RAISE NOTICE 'average_daily_rate column already exists';
  END IF;
END $$;

-- Add created_at and updated_at to reservations table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN created_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added created_at column to reservations';
  ELSE
    RAISE NOTICE 'created_at column already exists in reservations';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column to reservations';
  ELSE
    RAISE NOTICE 'updated_at column already exists in reservations';
  END IF;
END $$;

-- ================================================================================
-- TEST 8: Manual test of group profile creation
-- ================================================================================

-- Create a test group profile manually
DO $$
DECLARE
  v_test_group_id TEXT := 'TEST-GROUP-' || extract(epoch from now())::text;
  v_test_profile_id TEXT := 'GP-' || v_test_group_id;
BEGIN
  -- Insert test group booking
  INSERT INTO group_bookings (
    id, group_name, contact_name, contact_email, contact_phone,
    room_type_needed, room_count, check_in_date, check_out_date,
    discount_percent, status
  ) VALUES (
    v_test_group_id,
    'Test Group Booking',
    'Test Contact',
    'test@example.com',
    '+1234567890',
    'Double',
    3,
    CURRENT_DATE + 7,
    CURRENT_DATE + 10,
    0,
    'Pending'
  );

  -- Insert test group profile
  INSERT INTO group_profiles (
    id, code, name, type, status,
    contact_name, contact_email, contact_phone,
    contract_start_date, contract_end_date,
    total_rooms_used, room_type_breakdown
  ) VALUES (
    v_test_profile_id,
    'GRP-' || v_test_group_id,
    'Test Group Booking',
    'GroupReservation',
    'Active',
    'Test Contact',
    'test@example.com',
    '+1234567890',
    CURRENT_DATE + 7,
    CURRENT_DATE + 10,
    0,
    jsonb_build_array(
      jsonb_build_object('roomType', 'Double', 'count', 3)
    )
  );

  -- Create 3 test guest profiles linked to the group
  FOR i IN 1..3 LOOP
    INSERT INTO guests (
      id, name, email, phone, nationality, status,
      loyalty_points, special_requests, notes, total_spend, preferences,
      identification_doc, is_primary_contact, parent_group_id
    ) VALUES (
      'TEST-GUEST-' || i || '-' || extract(epoch from now())::text,
      CASE WHEN i = 1 THEN 'Test Contact' ELSE 'Test Contact (Room ' || i || ')' END,
      CASE WHEN i = 1 THEN 'test@example.com' ELSE 'test+room' || i || '@example.com' END,
      '+1234567890',
      'US',
      'Regular',
      0,
      '',
      'Test group booking — Room ' || i,
      0,
      '{}'::jsonb,
      '{}'::jsonb,
      i = 1,  -- First guest is primary
      v_test_profile_id
    );

    -- Create guest-group relationship
    INSERT INTO guest_group_relationships (
      id, guest_id, group_id, relationship_type, status,
      start_date, end_date, is_primary_contact, role_title,
      total_stays, total_room_nights, total_revenue, average_daily_rate
    ) VALUES (
      gen_random_uuid()::text,
      (SELECT id FROM guests WHERE email = CASE WHEN i = 1 THEN 'test@example.com' ELSE 'test+room' || i || '@example.com' END ORDER BY id DESC LIMIT 1),
      v_test_profile_id,
      'GroupReservation',
      'Active',
      CURRENT_DATE + 7,
      CURRENT_DATE + 10,
      i = 1,
      CASE WHEN i = 1 THEN 'Primary Contact' ELSE 'Room ' || i || ' Guest' END,
      0, 0, 0, 0
    );
  END LOOP;

  RAISE NOTICE 'Test group booking created successfully: %', v_test_group_id;
END $$;

-- ================================================================================
-- TEST 8: Verify the test data
-- ================================================================================

SELECT 
  gp.id as group_profile_id,
  gp.name as group_name,
  COUNT(DISTINCT g.id) as guest_count,
  COUNT(DISTINCT ggr.id) as relationship_count,
  string_agg(DISTINCT g.name, ', ') as guest_names
FROM group_profiles gp
LEFT JOIN guests g ON g.parent_group_id = gp.id
LEFT JOIN guest_group_relationships ggr ON ggr.group_id = gp.id
WHERE gp.name = 'Test Group Booking'
GROUP BY gp.id, gp.name;

-- ================================================================================
-- CLEANUP (Uncomment to remove test data)
-- ================================================================================

-- DELETE FROM guest_group_relationships WHERE group_id IN (SELECT id FROM group_profiles WHERE name = 'Test Group Booking');
-- DELETE FROM guests WHERE notes LIKE 'Test group booking%';
-- DELETE FROM group_profiles WHERE name = 'Test Group Booking';
-- DELETE FROM group_bookings WHERE group_name = 'Test Group Booking';