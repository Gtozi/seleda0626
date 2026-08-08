-- Debug Migration: Enhanced create_booking_atomic with logging
-- This version adds RAISE NOTICE statements to help debug the group booking flow

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
  RAISE NOTICE '=== create_booking_atomic called ===';
  RAISE NOTICE 'Guest name: %, Email: %', p_guest_name, p_guest_email;
  RAISE NOTICE 'Items: %', p_items;
  
  -- ── Idempotency guard ──────────────────────────────────────────
  SELECT ARRAY_AGG(id) INTO v_existing_ids
  FROM reservations
  WHERE idempotency_key = p_idempotency_key;

  IF v_existing_ids IS NOT NULL AND array_length(v_existing_ids, 1) > 0 THEN
    RAISE NOTICE 'Idempotent booking found, returning existing';
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
  RAISE NOTICE 'Nights: %', v_nights;

  -- ── Calculate total rooms and check availability ─────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    RAISE NOTICE 'Processing item: %', v_item;
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
  
  RAISE NOTICE 'Total qty: %, Is group: %', v_total_qty, v_is_group;

  -- ── Insert group booking and group_profile (if multi-room) ──────────────────────
  IF v_is_group THEN
    v_group_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
    v_group_profile_id := 'GP-' || v_group_id;
    
    RAISE NOTICE 'Creating group booking: %, group profile: %', v_group_id, v_group_profile_id;
    
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
    
    RAISE NOTICE 'Group booking and profile created successfully';
  END IF;

  -- ── Insert reservations per item × qty with per-room guest profiles ────────────────────────
  RAISE NOTICE 'Starting room loop for % items', jsonb_array_length(p_items);
  
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    DECLARE v_i INTEGER;
    BEGIN
      RAISE NOTICE 'Processing item: %, qty: %', v_item->>'roomTypeName', v_item->>'qty';
      
      FOR v_i IN 1..(v_item->>'qty')::INTEGER LOOP
        RAISE NOTICE 'Creating room % of % for room type %', v_i, v_item->>'qty', v_item->>'roomTypeName';
        
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
        RAISE NOTICE 'Room index: %, Is group: %', v_room_index, v_is_group;
        
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
          
          RAISE NOTICE 'Creating guest profile: %, %, parent_group: %', v_room_guest_id, v_room_guest_name, v_group_profile_id;
          
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

          RAISE NOTICE 'Guest profile created successfully';

          -- Create guest-group relationship entry
          v_relationship_id := gen_random_uuid()::text;
          RAISE NOTICE 'Creating guest-group relationship: %', v_relationship_id;
          
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
            v_room_index = 1,
            CASE WHEN v_room_index = 1 THEN 'Primary Contact' ELSE 'Room ' || v_room_index || ' Guest' END,
            0, 0, 0, 0
          );

          RAISE NOTICE 'Guest-group relationship created successfully';

          v_guest_ids := v_guest_ids || v_room_guest_id;
        ELSE
          -- Single room booking - use existing guest or create new one
          RAISE NOTICE 'Single room booking, checking for existing guest';
          
          -- Check if guest with same email exists
          SELECT id INTO v_guest_id FROM guests WHERE email = p_guest_email LIMIT 1;
          
          IF v_guest_id IS NULL THEN
            v_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
            RAISE NOTICE 'Creating new guest: %', v_guest_id;
            
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
          ELSE
            RAISE NOTICE 'Using existing guest: %', v_guest_id;
          END IF;
          
          v_guest_ids := v_guest_ids || v_guest_id;
        END IF;

        -- Insert reservation
        v_reservation_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
        RAISE NOTICE 'Creating reservation: %', v_reservation_id;
        
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

        RAISE NOTICE 'Reservation created successfully';

        v_reservation_ids := v_reservation_ids || v_reservation_id;
        v_first_res := FALSE;
      END LOOP;
    END;
  END LOOP;

  RAISE NOTICE 'Booking completed. Total reservations: %, Total guests: %', array_length(v_reservation_ids, 1), array_length(v_guest_ids, 1);
  RAISE NOTICE 'Group ID: %, Group Profile ID: %', v_group_id, v_group_profile_id;

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

-- Add missing column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'guest_group_relationships' AND column_name = 'average_daily_rate'
  ) THEN
    ALTER TABLE guest_group_relationships ADD COLUMN average_daily_rate numeric DEFAULT 0.00;
  END IF;

  -- Add missing columns to reservations table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'reservations' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE reservations ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Add a comment to indicate this is the debug version
COMMENT ON FUNCTION public.create_booking_atomic IS 'Debug version with extensive logging for troubleshooting group bookings';