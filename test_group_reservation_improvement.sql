-- Test Script for Group Reservation Improvement Migration
-- This script tests the new functionality for auto-creating guest profiles
-- and linking them to group profiles

-- ================================================================================
-- TEST 1: Test create_booking_atomic with group reservation
-- ================================================================================

-- Test creating a group booking with 3 rooms
SELECT create_booking_atomic(
  'test-group-booking-' || extract(epoch from now())::text,  -- idempotency_key
  'John Doe',                                               -- guest_name
  'john.doe@example.com',                                   -- guest_email
  '+1234567890',                                            -- guest_phone
  'US',                                                     -- guest_nationality
  'High floor preference',                                  -- special_requests
  CURRENT_DATE + 7,                                         -- check_in
  CURRENT_DATE + 10,                                        -- check_out
  '[{"roomTypeName":"Double","rate":150.00,"qty":3}]'::jsonb, -- items
  ARRAY[]::text[],                                          -- package_ids
  ARRAY[]::text[],                                          -- guest_service_ids
  0.00,                                                     -- package_total
  0.00,                                                     -- guest_svc_total
  10.00,                                                    -- tax_percent
  5.00,                                                     -- svc_charge_pct
  'Acme Corporation Conference',                            -- group_name
  NULL,                                                     -- operator_id
  45.00,                                                    -- tax_amount
  22.50,                                                    -- svc_amount
  0.00,                                                     -- addon_amount
  'Direct Website',                                         -- channel
  'Confirmed'                                               -- status
) as test_result;

-- ================================================================================
-- TEST 2: Verify group profile was created
-- ================================================================================

-- Check if group profile exists for the booking
-- (You'll need to replace GROUP_ID with the actual ID from the test above)
-- SELECT * FROM group_profiles WHERE type = 'GroupReservation' ORDER BY created_at DESC LIMIT 1;

-- ================================================================================
-- TEST 3: Verify guest profiles were created for each room
-- ================================================================================

-- Check if multiple guest profiles were created with parent_group_id
-- SELECT * FROM guests WHERE parent_group_id IS NOT NULL ORDER BY created_at DESC LIMIT 5;

-- ================================================================================
-- TEST 4: Verify guest-group relationships were created
-- ================================================================================

-- Check guest_group_relationships table
-- SELECT * FROM guest_group_relationships WHERE relationship_type = 'GroupReservation' ORDER BY created_at DESC LIMIT 5;

-- ================================================================================
-- TEST 5: Verify primary contact is marked correctly
-- ================================================================================

-- Check that only one guest is marked as primary contact per group
-- SELECT * FROM guests WHERE is_primary_contact = true ORDER BY created_at DESC LIMIT 5;

-- ================================================================================
-- TEST 6: Test get_group_profile_with_guests function
-- ================================================================================

-- Get comprehensive group profile data
-- SELECT get_group_profile_with_guests('YOUR_GROUP_PROFILE_ID');

-- ================================================================================
-- TEST 7: Verify reservations are linked correctly
-- ================================================================================

-- Check reservations for group booking
-- SELECT * FROM reservations WHERE is_group = true ORDER BY created_at DESC LIMIT 5;

-- ================================================================================
-- TEST 8: Test data migration function
-- ================================================================================

-- Test linking existing group guests
-- SELECT link_existing_group_guests_to_group_profile();

-- ================================================================================
-- VERIFICATION QUERIES
-- ================================================================================

-- Count group profiles
-- SELECT COUNT(*) as total_group_profiles FROM group_profiles WHERE type = 'GroupReservation';

-- Count guests linked to groups
-- SELECT COUNT(*) as total_linked_guests FROM guests WHERE parent_group_id IS NOT NULL;

-- Count guest-group relationships
-- SELECT COUNT(*) as total_relationships FROM guest_group_relationships;

-- Check for orphaned guests (guests with group booking but no group profile link)
-- SELECT 
--   g.id,
--   g.name,
--   g.email,
--   r.group_booking_id,
--   g.parent_group_id
-- FROM guests g
-- JOIN reservations r ON g.id = r.guest_id
-- WHERE r.is_group = true 
--   AND (g.parent_group_id IS NULL OR g.parent_group_id = '');

-- ================================================================================
-- CLEANUP (For testing purposes - uncomment to clean test data)
-- ================================================================================

-- DELETE FROM guest_group_relationships WHERE relationship_type = 'GroupReservation';
-- DELETE FROM guests WHERE notes LIKE '%Group booking%';
-- DELETE FROM group_profiles WHERE type = 'GroupReservation';
-- DELETE FROM reservations WHERE is_group = true;
-- DELETE FROM group_bookings WHERE id NOT IN (SELECT DISTINCT group_booking_id FROM reservations WHERE group_booking_id IS NOT NULL);

-- ================================================================================
-- EXPECTED RESULTS
-- ================================================================================

-- 1. create_booking_atomic should return success with:
--    - reservationIds array with 3 reservation IDs
--    - guestIds array with 3 guest IDs  
--    - groupId with the group booking ID
--    - groupProfileId with the group profile ID
--    - isGroup: true

-- 2. group_profiles table should have a new record with:
--    - type: 'GroupReservation'
--    - code starting with 'GRP-'
--    - name matching the group_name parameter
--    - total_rooms_used (will be 0 initially, updated when rooms are assigned)

-- 3. guests table should have 3 new records with:
--    - parent_group_id set to the group profile ID
--    - is_primary_contact = true for only the first guest
--    - Names like 'John Doe (Room 2)', 'John Doe (Room 3)' for additional rooms

-- 4. guest_group_relationships table should have 3 new records with:
--    - relationship_type: 'GroupReservation'
--    - status: 'Active'
--    - is_primary_contact = true for only the first relationship
--    - role_title: 'Primary Contact' for first, 'Room X Guest' for others

-- 5. reservations table should have 3 new records with:
--    - is_group: true
--    - group_booking_id set
--    - guest_id pointing to the respective per-room guest

-- 6. get_group_profile_with_guests should return complete data structure with:
--    - group_profile details
--    - guests array with all linked guests
--    - reservations array with all reservations
--    - accurate counts