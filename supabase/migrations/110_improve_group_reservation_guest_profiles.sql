-- Migration 110: Improve Group Reservation - Auto-create Guest Profiles and Link to Group Profile
--
-- This migration enhances group reservation functionality by:
-- 1. Ensuring guest profiles are automatically created for each room in a group booking
-- 2. Properly linking guest profiles to the group profile via parent_group_id
-- 3. Creating comprehensive entries in guest_group_relationships table
-- 4. Marking the first room's guest as primary contact
-- 5. Updating create_booking_atomic to handle group_profile creation
--
-- This addresses the gap where group bookings created guest profiles but didn't
-- properly integrate with the group_profiles CRM system.

-- ================================================================================
-- STEP 1: Ensure all required columns exist
-- ================================================================================

-- Add missing columns to guests table if they don't exist
DO $$
BEGIN
  -- Check and add parent_group_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'parent_group_id'
  ) THEN
    ALTER TABLE guests ADD COLUMN parent_group_id text REFERENCES group_profiles(id) ON DELETE SET NULL;
    CREATE INDEX idx_guests_parent_group_id ON guests(parent_group_id);
  END IF;

  -- Check and add parent_corporate_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'parent_corporate_id'
  ) THEN
    ALTER TABLE guests ADD COLUMN parent_corporate_id text REFERENCES group_profiles(id) ON DELETE SET NULL;
    CREATE INDEX idx_guests_parent_corporate_id ON guests(parent_corporate_id);
  END IF;

  -- Check and add is_primary_contact
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'is_primary_contact'
  ) THEN
    ALTER TABLE guests ADD COLUMN is_primary_contact boolean NOT NULL DEFAULT false;
  END IF;

  -- Check and add billing_routing_profile_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guests' AND column_name = 'billing_routing_profile_id'
  ) THEN
    ALTER TABLE guests ADD COLUMN billing_routing_profile_id text;
  END IF;
END $$;

-- Add missing columns to group_profiles table if they don't exist
DO $$
BEGIN
  -- Check and add room_type_breakdown
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'group_profiles' AND column_name = 'room_type_breakdown'
  ) THEN
    ALTER TABLE group_profiles ADD COLUMN room_type_breakdown jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add missing columns to guest_group_relationships table if they don't exist
DO $$
BEGIN
  -- Check and add average_daily_rate
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guest_group_relationships' AND column_name = 'average_daily_rate'
  ) THEN
    ALTER TABLE guest_group_relationships ADD COLUMN average_daily_rate numeric DEFAULT 0.00;
  END IF;
END $$;

-- Add missing columns to reservations table if they don't exist
DO $$
BEGIN
  -- Check and add created_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  -- Check and add updated_at  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- ================================================================================
-- STEP 2: Update create_booking_atomic to create group_profiles and link guests
-- ================================================================================

DROP FUNCTION IF EXISTS public.create_booking_atomic(
  text, text, text, text, text, text, date, date, jsonb,
  text[], text[], numeric, numeric, numeric, numeric, text, uuid, numeric, numeric, numeric, text, text
);

CREATE OR REPLACE FUNCTION public.create_booking_atomic(
  p_idempotency_key text,
  p_guest_name text,
  p_guest_email text,
  p_guest_phone text,
  p_guest_nationality text,
  p_special_requests text,
  p_check_in date,
  p_check_out date,
  p_items jsonb,
  p_package_ids text[],
  p_guest_service_ids text[],
  p_package_total numeric,
  p_guest_svc_total numeric,
  p_tax_percent numeric,
  p_svc_charge_pct numeric,
  p_group_name text DEFAULT NULL::text,
  p_operator_id uuid DEFAULT NULL::uuid,
  p_tax_amount numeric DEFAULT 0,
  p_svc_amount numeric DEFAULT 0,
  p_addon_amount numeric DEFAULT 0,
  p_channel text DEFAULT 'Direct Website',
  p_status text DEFAULT 'Waitlisted'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_nights            INTEGER;
  v_total_qty         INTEGER := 0;
  v_is_group          BOOLEAN;
  v_guest_id          TEXT;
  v_group_id          TEXT;
  v_group_profile_id  TEXT;
  v_reservation_ids   TEXT[] := '{}';
  v_guest_ids         TEXT[] := '{}';
  v_item              JSONB;
  v_capacity          INTEGER;
  v_booked            INTEGER;
  v_available         INTEGER;
  v_reservation_id    TEXT;
  v_base_amount       NUMERIC;
  v_item_total        NUMERIC;
  v_charges           JSONB;
  v_first_res         BOOLEAN := TRUE;
  v_existing_ids      TEXT[];
  v_subtotal          NUMERIC := 0;
  v_allotment_block   INTEGER := 0;
  v_room_index        INTEGER := 0;
  v_room_guest_id     TEXT;
  v_room_guest_name   TEXT;
  v_room_guest_email  TEXT;
  v_relationship_id   TEXT;
BEGIN
  -- ── Idempotency guard ──────────────────────────────────────────
  SELECT ARRAY_AGG(id) INTO v_existing_ids
  FROM reservations
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_ids IS NOT NULL AND array_length(v_existing_ids, 1) > 0 THEN
    RETURN jsonb_build_object(
      'success',        TRUE,
      'idempotent',     TRUE,
      'reservationIds', v_existing_ids,
      'guestId',        (SELECT guest_id FROM reservations WHERE idempotency_key = p_idempotency_key LIMIT 1),
      'groupProfileId', (SELECT parent_group_id FROM guests WHERE id = (SELECT guest_id FROM reservations WHERE idempotency_key = p_idempotency_key LIMIT 1))
    );
  END IF;

  -- ── Date math ─────────────────────────────────────────────────
  v_nights := GREATEST(1, (p_check_out - p_check_in));

  -- ── Availability check WITH row-level lock ─────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    PERFORM id FROM room_types
      WHERE name = (v_item->>'roomTypeName')
      FOR UPDATE;

    SELECT COUNT(*) INTO v_capacity
    FROM rooms r
    JOIN room_types rt ON r.type = rt.name
    WHERE rt.name = (v_item->>'roomTypeName');

    SELECT COUNT(*) INTO v_booked
    FROM reservations res
    WHERE res.room_type = (v_item->>'roomTypeName')
      AND (
        res.status IN ('Confirmed', 'CheckedIn')
        OR (res.status = 'Waitlisted' AND res.channel = 'Direct Website')
      )
      AND res.check_in_date < p_check_out
      AND res.check_out_date > p_check_in;

    BEGIN
      SELECT COALESCE(SUM(GREATEST(0, a.blocked_qty - a.picked_up_qty)), 0)
      INTO v_allotment_block
      FROM allotments a
      JOIN room_types rt ON a.room_type_id = rt.id
      WHERE rt.name = (v_item->>'roomTypeName')
        AND a.release_date >= CURRENT_DATE
        AND a.stay_date >= p_check_in
        AND a.stay_date < p_check_out;
    EXCEPTION WHEN undefined_table THEN
      v_allotment_block := 0;
    END;

    v_available := GREATEST(0, v_capacity - v_booked - v_allotment_block);

    IF v_available < (v_item->>'qty')::INTEGER THEN
      RAISE EXCEPTION 'AVAILABILITY_ERROR:% room(s) available for %, requested %',
        v_available, v_item->>'roomTypeName', v_item->>'qty';
    END IF;

    v_total_qty := v_total_qty + (v_item->>'qty')::INTEGER;
    v_subtotal  := v_subtotal + ((v_item->>'rate')::NUMERIC * v_nights * (v_item->>'qty')::INTEGER);
  END LOOP;

  v_subtotal := v_subtotal + COALESCE(p_package_total, 0) + COALESCE(p_guest_svc_total, 0);
  v_is_group := v_total_qty > 1;

  -- ── Insert group booking and group_profile (if multi-room) ──────────────────────
  IF v_is_group THEN
    v_group_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
    v_group_profile_id := 'GP-' || v_group_id;
    
    -- Insert operational group_booking record
    INSERT INTO group_bookings (
      id, group_name, contact_name, contact_email, contact_phone,
      room_type_needed, room_count, check_in_date, check_out_date,
      discount_percent, status
    ) VALUES (
      v_group_id,
      COALESCE(p_group_name, p_guest_name),
      p_guest_name, p_guest_email,
      COALESCE(p_guest_phone, ''),
      (p_items->0->>'roomTypeName'),
      v_total_qty, p_check_in, p_check_out,
      0, 'Pending'
    );

    -- Insert CRM group_profile record
    INSERT INTO group_profiles (
      id, code, name, type, status,
      contact_name, contact_email, contact_phone,
      contract_start_date, contract_end_date,
      total_rooms_used, room_type_breakdown
    ) VALUES (
      v_group_profile_id,
      'GRP-' || v_group_id,
      COALESCE(p_group_name, p_guest_name),
      'GroupReservation',
      'Active',
      p_guest_name,
      p_guest_email,
      COALESCE(p_guest_phone, ''),
      p_check_in,
      p_check_out,
      0,  -- Will be updated when rooms are assigned
      jsonb_build_array(
        jsonb_build_object(
          'roomType', (p_items->0->>'roomTypeName'),
          'count', v_total_qty
        )
      )
    );
  END IF;

  -- ── Insert reservations per item × qty with per-room guest profiles ────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    DECLARE v_i INTEGER;
    BEGIN
      FOR v_i IN 1..(v_item->>'qty')::INTEGER LOOP
        v_base_amount := (v_item->>'rate')::NUMERIC * v_nights;
        v_item_total  := v_base_amount;
        v_charges     := jsonb_build_array(
                           jsonb_build_object('description','Room charge','amount',v_base_amount,'date',NOW())
                         );

        IF v_first_res THEN
          IF COALESCE(p_package_total, 0) > 0 THEN
            v_item_total := v_item_total + p_package_total;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Packages & add-ons','amount',p_package_total,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_guest_svc_total, 0) > 0 THEN
            v_item_total := v_item_total + p_guest_svc_total;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Guest services','amount',p_guest_svc_total,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_svc_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_svc_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Service charge','amount',p_svc_amount,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_addon_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_addon_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','Additional fees','amount',p_addon_amount,'date',NOW())
                            );
          END IF;
          IF COALESCE(p_tax_amount, 0) > 0 THEN
            v_item_total := v_item_total + p_tax_amount;
            v_charges    := v_charges || jsonb_build_array(
                              jsonb_build_object('description','VAT / Tax','amount',p_tax_amount,'date',NOW())
                            );
          END IF;
        END IF;

        -- Create per-room guest profile for group bookings
        v_room_index := v_room_index + 1;
        IF v_is_group THEN
          v_room_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
          v_room_guest_name := CASE WHEN v_room_index = 1 
            THEN p_guest_name 
            ELSE p_guest_name || ' (Room ' || v_room_index || ')' 
          END;
          v_room_guest_email := CASE WHEN v_room_index = 1 
            THEN p_guest_email 
            ELSE REPLACE(p_guest_email, '@', '+room' || v_room_index || '@') 
          END;
          
          INSERT INTO guests (
            id, name, email, phone, nationality, status,
            loyalty_points, special_requests, notes, total_spend, preferences,
            identification_doc, is_primary_contact, parent_group_id
          ) VALUES (
            v_room_guest_id, v_room_guest_name, v_room_guest_email,
            COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
            'Regular', 0, COALESCE(p_special_requests, ''),
            'Group booking: ' || COALESCE(p_group_name, p_guest_name) || ' — Room ' || v_room_index, 
            0, '{}'::jsonb, '{}'::jsonb,
            v_room_index = 1,  -- First room is primary contact
            v_group_profile_id  -- Link to group profile
          );

          -- Create guest-group relationship entry
          v_relationship_id := gen_random_uuid()::text;
          INSERT INTO guest_group_relationships (
            id, guest_id, group_id, relationship_type, status,
            start_date, end_date, is_primary_contact, role_title,
            total_stays, total_room_nights, total_revenue, average_daily_rate
          ) VALUES (
            v_relationship_id,
            v_room_guest_id,
            v_group_profile_id,
            'GroupReservation',
            'Active',
            p_check_in,
            p_check_out,
            v_room_index = 1,  -- First room is primary contact
            CASE WHEN v_room_index = 1 THEN 'Primary Contact' ELSE 'Room ' || v_room_index || ' Guest' END,
            0, 0, 0, 0
          );

          v_guest_ids := v_guest_ids || v_room_guest_id;
        ELSE
          -- Single room booking - use existing guest or create new one
          -- Check if guest with same email exists
          SELECT id INTO v_guest_id FROM guests WHERE email = p_guest_email LIMIT 1;
          
          IF v_guest_id IS NULL THEN
            v_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
            INSERT INTO guests (
              id, name, email, phone, nationality, status,
              loyalty_points, special_requests, notes, total_spend, preferences,
              identification_doc, is_primary_contact
            ) VALUES (
              v_guest_id, p_guest_name, p_guest_email,
              COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
              'Regular', 0, COALESCE(p_special_requests, ''),
              'Direct website booking', 0, '{}'::jsonb, '{}'::jsonb,
              TRUE,  -- Single guest is always primary
              NULL
            );
          END IF;
          
          v_guest_ids := v_guest_ids || v_guest_id;
        END IF;

        -- Insert reservation
        v_reservation_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
        INSERT INTO reservations (
          id, guest_name, guest_email, guest_phone, guest_status,
          room_type, check_in_date, check_out_date, adults, children,
          status, rate, total_amount, channel, payment_status,
          notes, charges, payments, early_check_out_requested, late_check_out_requested,
          group_booking_id, is_group, deposit_amount, is_deposit_paid,
          rate_plan_id, package_ids, additional_guest_ids, discount_percent,
          tax_percent, service_charge_percent, custom_hotel_name, custom_hotel_address,
          hotel_tin, hotel_vat_no, hotel_vat_date, guest_tin, guest_vat_no, guest_vat_date,
          routing_profile_id, corporate_account_id, booking_group_id, guest_id,
          idempotency_key
        ) VALUES (
          v_reservation_id,
          v_room_guest_name,  -- Use per-room guest name for groups
          v_room_guest_email, -- Use per-room guest email for groups
          COALESCE(p_guest_phone, ''),
          'Regular',
          (v_item->>'roomTypeName'),
          p_check_in, p_check_out,
          1, 0,  -- Default adults/children
          p_status,
          v_item_total,
          v_item_total,
          p_channel,
          'Unpaid',
          COALESCE(p_special_requests, ''),
          v_charges,
          '[]'::jsonb,
          false, false,
          v_group_id,  -- Link to group_booking for groups
          v_is_group,
          0, false,
          NULL, p_package_ids, '{}'::text[], 0,
          p_tax_percent, p_svc_charge_pct, NULL, NULL,
          NULL, NULL, NULL, NULL, NULL, NULL,
          NULL, NULL, NULL,
          CASE WHEN v_is_group THEN v_room_guest_id ELSE v_guest_id END,  -- Link to per-room guest for groups
          p_idempotency_key
        );

        v_reservation_ids := v_reservation_ids || v_reservation_id;
        v_first_res := FALSE;
      END LOOP;
    END;
  END LOOP;

  -- ── Return success ───────────────────────────────────────────────
  RETURN jsonb_build_object(
    'success', TRUE,
    'reservationIds', v_reservation_ids,
    'guestIds', v_guest_ids,
    'groupId', v_group_id,
    'groupProfileId', v_group_profile_id,
    'isGroup', v_is_group
  );
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_booking_atomic TO anon;
GRANT EXECUTE ON FUNCTION public.create_booking_atomic TO authenticated;

-- ================================================================================
-- STEP 3: Create helper function to link existing guests to groups
-- ================================================================================

CREATE OR REPLACE FUNCTION link_existing_group_guests_to_group_profile()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_group_booking RECORD;
  v_guest RECORD;
  v_group_profile_id TEXT;
  v_relationship_id TEXT;
  v_room_index INTEGER;
BEGIN
  -- Iterate through all group bookings
  FOR v_group_booking IN 
    SELECT DISTINCT gb.id, gb.group_name, gb.contact_name, gb.contact_email, 
           gb.contact_phone, gb.check_in_date, gb.check_out_date, gb.room_count
    FROM group_bookings gb
    WHERE NOT EXISTS (
      SELECT 1 FROM group_profiles gp 
      WHERE gp.code = 'GRP-' || gb.id
    )
  LOOP
    -- Create group_profile if it doesn't exist
    v_group_profile_id := 'GP-' || v_group_booking.id;
    
    INSERT INTO group_profiles (
      id, code, name, type, status,
      contact_name, contact_email, contact_phone,
      contract_start_date, contract_end_date,
      total_rooms_used, room_type_breakdown
    ) VALUES (
      v_group_profile_id,
      'GRP-' || v_group_booking.id,
      v_group_booking.group_name,
      'GroupReservation',
      'Active',
      v_group_booking.contact_name,
      v_group_booking.contact_email,
      v_group_booking.contact_phone,
      v_group_booking.check_in_date,
      v_group_booking.check_out_date,
      0,
      '[]'::jsonb
    ) ON CONFLICT (id) DO NOTHING;

    -- Find and link guests for this group
    v_room_index := 0;
    FOR v_guest IN
      SELECT DISTINCT g.id, g.name, g.email, r.id as reservation_id
      FROM guests g
      JOIN reservations r ON g.id = r.guest_id
      WHERE r.group_booking_id = v_group_booking.id
        AND (g.parent_group_id IS NULL OR g.parent_group_id != v_group_profile_id)
    LOOP
      v_room_index := v_room_index + 1;
      
      -- Update guest's parent_group_id
      UPDATE guests 
      SET parent_group_id = v_group_profile_id,
          is_primary_contact = (v_room_index = 1)
      WHERE id = v_guest.id;

      -- Create guest-group relationship if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM guest_group_relationships 
        WHERE guest_id = v_guest.id AND group_id = v_group_profile_id
      ) THEN
        v_relationship_id := gen_random_uuid()::text;
        INSERT INTO guest_group_relationships (
          id, guest_id, group_id, reservation_id, relationship_type, status,
          start_date, end_date, is_primary_contact, role_title,
          total_stays, total_room_nights, total_revenue, average_daily_rate
        ) VALUES (
          v_relationship_id,
          v_guest.id,
          v_group_profile_id,
          v_guest.reservation_id,
          'GroupReservation',
          'Active',
          v_group_booking.check_in_date,
          v_group_booking.check_out_date,
          v_room_index = 1,
          CASE WHEN v_room_index = 1 THEN 'Primary Contact' ELSE 'Room ' || v_room_index || ' Guest' END,
          0, 0, 0, 0
        );
      END IF;
    END LOOP;
  END LOOP;

  RETURN jsonb_build_object('success', TRUE, 'message', 'Existing group guests linked to group profiles');
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.link_existing_group_guests_to_group_profile TO authenticated;

-- ================================================================================
-- STEP 4: Create trigger to auto-link guests to group profiles on reservation changes
-- ================================================================================

CREATE OR REPLACE FUNCTION auto_link_guest_to_group_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_group_profile_id TEXT;
  v_relationship_id TEXT;
  v_room_index INTEGER;
BEGIN
  -- Only process if this is a group reservation
  IF NEW.group_booking_id IS NOT NULL AND NEW.is_group = true THEN
    
    -- Find the group_profile_id from the group_booking
    SELECT id INTO v_group_profile_id
    FROM group_profiles
    WHERE code = 'GRP-' || NEW.group_booking_id;
    
    -- If group_profile doesn't exist, create it
    IF v_group_profile_id IS NULL THEN
      v_group_profile_id := 'GP-' || NEW.group_booking_id;
      
      INSERT INTO group_profiles (
        id, code, name, type, status,
        contact_name, contact_email, contact_phone,
        contract_start_date, contract_end_date,
        total_rooms_used, room_type_breakdown
      ) VALUES (
        v_group_profile_id,
        'GRP-' || NEW.group_booking_id,
        COALESCE(NEW.guest_name, 'Group Booking'),
        'GroupReservation',
        'Active',
        NEW.guest_name,
        NEW.guest_email,
        NEW.guest_phone,
        NEW.check_in_date,
        NEW.check_out_date,
        0,
        '[]'::jsonb
      ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Link the guest to the group profile if guest_id exists
    IF NEW.guest_id IS NOT NULL THEN
      -- Update guest's parent_group_id
      UPDATE guests
      SET parent_group_id = v_group_profile_id
      WHERE id = NEW.guest_id;

      -- Create guest-group relationship if it doesn't exist
      IF NOT EXISTS (
        SELECT 1 FROM guest_group_relationships 
        WHERE guest_id = NEW.guest_id AND group_id = v_group_profile_id
      ) THEN
        v_relationship_id := gen_random_uuid()::text;
        
        -- Determine if this is primary contact (first reservation for this group)
        SELECT COUNT(*) INTO v_room_index
        FROM reservations
        WHERE group_booking_id = NEW.group_booking_id
          AND id <= NEW.id;
        
        INSERT INTO guest_group_relationships (
          id, guest_id, group_id, reservation_id, relationship_type, status,
          start_date, end_date, is_primary_contact, role_title,
          total_stays, total_room_nights, total_revenue, average_daily_rate
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
          0, 0, 0, 0
        );
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_link_guest_to_group_profile ON reservations;
CREATE TRIGGER trigger_auto_link_guest_to_group_profile
  AFTER INSERT OR UPDATE OF group_booking_id, guest_id, is_group ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION auto_link_guest_to_group_profile();

-- ================================================================================
-- STEP 5: Create function to get group profile with all linked guests
-- ================================================================================

CREATE OR REPLACE FUNCTION get_group_profile_with_guests(p_group_profile_id TEXT)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_group_profile RECORD;
  v_guests JSONB := '[]'::jsonb;
  v_reservations JSONB := '[]'::jsonb;
  v_result JSONB;
BEGIN
  -- Get group profile
  SELECT * INTO v_group_profile
  FROM group_profiles
  WHERE id = p_group_profile_id;

  IF v_group_profile IS NULL THEN
    RETURN jsonb_build_object('error', 'Group profile not found');
  END IF;

  -- Get all linked guests
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', g.id,
      'name', g.name,
      'email', g.email,
      'phone', g.phone,
      'is_primary_contact', g.is_primary_contact,
      'status', g.status,
      'relationship', gr.role_title,
      'relationship_status', gr.status
    )
  ) INTO v_guests
  FROM guests g
  JOIN guest_group_relationships gr ON g.id = gr.guest_id
  WHERE gr.group_id = p_group_profile_id;

  -- Get all reservations for this group
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', r.id,
      'guest_name', r.guest_name,
      'room_type', r.room_type,
      'room_number', r.room_number,
      'check_in_date', r.check_in_date,
      'check_out_date', r.check_out_date,
      'status', r.status,
      'total_amount', r.total_amount
    )
  ) INTO v_reservations
  FROM reservations r
  WHERE r.group_booking_id = (
    SELECT SUBSTRING(v_group_profile.code FROM 5)  -- Remove 'GRP-' prefix
  );

  -- Build result
  v_result := jsonb_build_object(
    'group_profile', v_group_profile,
    'guests', COALESCE(v_guests, '[]'::jsonb),
    'reservations', COALESCE(v_reservations, '[]'::jsonb),
    'total_guests', COALESCE(jsonb_array_length(v_guests), 0),
    'total_reservations', COALESCE(jsonb_array_length(v_reservations), 0)
  );

  RETURN v_result;
END;
$function$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_group_profile_with_guests TO authenticated;

-- ================================================================================
-- STEP 6: Run data migration for existing group bookings
-- ================================================================================

-- This will link all existing group bookings to group profiles
DO $$
BEGIN
  PERFORM link_existing_group_guests_to_group_profile();
  RAISE NOTICE 'Successfully migrated existing group guests to group profiles';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Warning: Data migration encountered an error: %', SQLERRM;
  -- Continue with migration even if data migration fails
END $$;

-- ================================================================================
-- END OF MIGRATION
-- ================================================================================

-- Migration summary:
-- 1. Ensured all required columns exist in guests table
-- 2. Updated create_booking_atomic to:
--    - Create group_profile records for group bookings
--    - Create per-room guest profiles with proper parent_group_id linkage
--    - Create guest_group_relationships entries for comprehensive tracking
--    - Mark first room's guest as primary contact
-- 3. Created helper function to link existing group guests to group profiles
-- 4. Created trigger to auto-link guests on reservation changes
-- 5. Created function to get group profile with all linked guests
-- 6. Ran data migration for existing group bookings