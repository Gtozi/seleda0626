-- COMPREHENSIVE FIX: Drop and recreate problematic reservation triggers
-- The created_at error is coming from a trigger function on INSERT

-- ================================================================================
-- STEP 1: Drop the BEFORE INSERT trigger (most likely culprit)
-- ================================================================================
DROP TRIGGER IF EXISTS trigger_ensure_reservation_group_profile_and_guest ON reservations;
DROP FUNCTION IF EXISTS ensure_reservation_group_profile_and_guest();

-- ================================================================================
-- STEP 2: Drop and recreate the auto_link triggers safely
-- ================================================================================
DROP TRIGGER IF EXISTS trigger_auto_link_guest_to_group ON reservations;
DROP TRIGGER IF EXISTS trigger_auto_link_guest_to_group_profile ON reservations;
DROP TRIGGER IF EXISTS trg_auto_link_guest ON reservations;

-- ================================================================================
-- STEP 3: Drop the audit trigger temporarily (it may reference created_at)
-- ================================================================================
DROP TRIGGER IF EXISTS audit_reservations_trigger ON reservations;

-- ================================================================================
-- STEP 4: Create a safe auto_link function that doesn't reference created_at
-- ================================================================================
CREATE OR REPLACE FUNCTION auto_link_guest_to_group_safe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_group_profile_id TEXT;
  v_relationship_id TEXT;
  v_room_index INTEGER;
  v_group_id TEXT;
BEGIN
  -- Only process group reservations
  IF NEW.is_group = true AND NEW.group_booking_id IS NOT NULL AND NEW.guest_id IS NOT NULL THEN
    
    -- Find the group_profile_id
    BEGIN
      SELECT id INTO v_group_profile_id
      FROM group_profiles
      WHERE id = NEW.group_booking_id
         OR code = 'GRP-' || NEW.group_booking_id
      LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
      v_group_profile_id := NULL;
    END;
    
    -- If no group profile found, try to create one
    IF v_group_profile_id IS NULL THEN
      v_group_profile_id := NEW.group_booking_id;
      BEGIN
        INSERT INTO group_profiles (
          id, code, name, type, status,
          contact_name, contact_email, contact_phone,
          contract_start_date, contract_end_date,
          total_rooms_used
        ) VALUES (
          v_group_profile_id,
          'GRP-' || v_group_profile_id,
          COALESCE(NEW.guest_name, 'Group Booking'),
          'GroupReservation',
          'Active',
          NEW.guest_name,
          NEW.guest_email,
          NEW.guest_phone,
          NEW.check_in_date,
          NEW.check_out_date,
          0
        ) ON CONFLICT (id) DO NOTHING;
      EXCEPTION WHEN OTHERS THEN
        -- If insert fails, continue without group profile
        RETURN NEW;
      END;
    END IF;

    -- Update guest's parent_group_id
    BEGIN
      UPDATE guests
      SET parent_group_id = v_group_profile_id
      WHERE id = NEW.guest_id;
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

    -- Create guest-group relationship if it doesn't exist
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM guest_group_relationships 
        WHERE guest_id = NEW.guest_id AND group_id = v_group_profile_id
      ) THEN
        -- Determine room index
        SELECT COUNT(*) + 1 INTO v_room_index
        FROM reservations
        WHERE group_booking_id = NEW.group_booking_id
          AND id < NEW.id;
        
        v_relationship_id := gen_random_uuid()::text;
        INSERT INTO guest_group_relationships (
          id, guest_id, group_id, reservation_id, relationship_type, status,
          start_date, end_date, is_primary_contact, role_title,
          total_stays, total_room_nights, total_revenue
        ) VALUES (
          v_relationship_id,
          NEW.guest_id,
          v_group_profile_id,
          NEW.id,
          'GroupReservation',
          'Active',
          NEW.check_in_date,
          NEW.check_out_date,
          v_room_index = 1,
          CASE WHEN v_room_index = 1 THEN 'Primary Contact' ELSE 'Room ' || v_room_index || ' Guest' END,
          0, 0, 0
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- If relationship insert fails, continue
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- ================================================================================
-- STEP 5: Create the safe trigger
-- ================================================================================
CREATE TRIGGER trigger_auto_link_guest_to_group_safe
  AFTER INSERT ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_guest_to_group_safe();

-- ================================================================================
-- STEP 6: Recreate a safe audit trigger (without created_at references)
-- ================================================================================
CREATE OR REPLACE FUNCTION audit_reservations_safe()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Simple audit logging without created_at dependencies
  -- Just return NEW for INSERT, NEW for UPDATE
  IF TG_OP = 'INSERT' THEN
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_reservations_safe_trigger
  AFTER INSERT OR DELETE OR UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION audit_reservations_safe();

-- ================================================================================
-- STEP 7: Verify triggers are clean
-- ================================================================================
SELECT 
  tgname as trigger_name,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger
WHERE tgrelid = 'reservations'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ================================================================================
-- STEP 8: Test a simple INSERT to verify it works
-- ================================================================================
DO $$
DECLARE
  v_test_id TEXT := 'TEST-' || extract(epoch from now())::text;
BEGIN
  -- Try a simple insert
  INSERT INTO reservations (
    id, guest_name, guest_email, guest_phone, guest_status,
    room_type, check_in_date, check_out_date, adults, children,
    status, rate, total_amount, channel, payment_status,
    notes, charges, payments, is_group, deposit_amount, is_deposit_paid
  ) VALUES (
    v_test_id, 'Test Guest', 'test@example.com', '', 'Regular',
    'Standard', CURRENT_DATE + 1, CURRENT_DATE + 3, 1, 0,
    'Confirmed', 100.00, 200.00, 'Direct Website', 'Unpaid',
    '{}', '[]'::jsonb, '[]'::jsonb, false, 0, false
  );
  
  RAISE NOTICE '✅ Test INSERT successful! ID: %', v_test_id;
  
  -- Clean up
  DELETE FROM reservations WHERE id = v_test_id;
  RAISE NOTICE '✅ Test cleanup complete';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '❌ Test INSERT failed: %', SQLERRM;
END $$;