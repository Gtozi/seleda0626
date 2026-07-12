-- 048_booking_atomic_unified_fees.sql
--
-- Unify public-booking fee math with the front desk.
--
-- The previous create_booking_atomic recomputed tax and service charge as flat
-- percentages of the subtotal (non-compounded) and ignored any additional fee
-- components. This meant the total a guest saw on screen could differ from the
-- total the server persisted, and custom fees silently vanished from revenue.
--
-- This version accepts the ABSOLUTE fee amounts already computed by the server's
-- unified pricing engine (src/utils/pricing.ts -> computeFees), which mirrors the
-- front-desk formatTaxesAndFees logic: service charge + additional fees applied
-- to the base, then VAT applied last on (base + service charge + additional fees).
-- Room rates passed in are already adjusted for season + rate plan.

DROP FUNCTION IF EXISTS public.create_booking_atomic(
  text, text, text, text, text, text, date, date, jsonb,
  text[], text[], numeric, numeric, numeric, numeric, text, uuid
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
  p_addon_amount numeric DEFAULT 0
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
  v_reservation_ids   TEXT[] := '{}';
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
      'guestId',        (SELECT guest_id FROM reservations WHERE idempotency_key = p_idempotency_key LIMIT 1)
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

  -- ── Insert guest ──────────────────────────────────────────────
  v_guest_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
  INSERT INTO guests (
    id, name, email, phone, nationality, status,
    loyalty_points, special_requests, notes, total_spend, preferences
  ) VALUES (
    v_guest_id, p_guest_name, p_guest_email,
    COALESCE(p_guest_phone, ''), COALESCE(p_guest_nationality, ''),
    'Regular', 0, COALESCE(p_special_requests, ''),
    'Direct website booking — pending front desk promotion', 0, '{}'::jsonb
  );

  -- ── Insert group booking (if multi-room) ──────────────────────
  IF v_is_group THEN
    v_group_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
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
  END IF;

  -- ── Insert reservations per item × qty ────────────────────────
  -- Fees (service charge, additional fees, VAT) and package/service totals are
  -- attached to the FIRST reservation as itemized folio charges so that the sum
  -- of every reservation's total_amount equals the grand total the guest saw.
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

        v_reservation_id := UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8));
        v_reservation_ids := v_reservation_ids || v_reservation_id;

        INSERT INTO reservations (
          id, idempotency_key, guest_id,
          guest_name, guest_email, guest_phone, guest_status,
          room_type, room_type_id,
          check_in_date, check_out_date,
          adults, children,
          status, rate, total_amount,
          channel, payment_status, notes,
          tax_percent, service_charge_percent,
          package_ids, guest_service_ids,
          charges, payments,
          is_group, group_booking_id, booking_group_id
        ) VALUES (
          v_reservation_id,
          CASE WHEN v_first_res THEN p_idempotency_key ELSE NULL END,
          v_guest_id,
          p_guest_name, p_guest_email, COALESCE(p_guest_phone,''), 'Regular',
          (v_item->>'roomTypeName'), (v_item->>'roomTypeId'),
          p_check_in, p_check_out,
          COALESCE((v_item->>'adults')::INTEGER, 1),
          COALESCE((v_item->>'children')::INTEGER, 0),
          'Waitlisted',
          (v_item->>'rate')::NUMERIC,
          v_item_total,
          'Direct Website', 'Unpaid',
          COALESCE(p_special_requests,''),
          p_tax_percent, p_svc_charge_pct,
          p_package_ids, p_guest_service_ids,
          v_charges, '[]'::jsonb,
          v_is_group,
          v_group_id, v_group_id
        );

        v_first_res := FALSE;
      END LOOP;
    END;
  END LOOP;

  -- ── Audit event ───────────────────────────────────────────────
  INSERT INTO audit_events (id, user_id, action, entity_type, entity_id, module, details)
  VALUES (
    gen_random_uuid()::text, 'public', 'public_booking.atomic_created',
    CASE WHEN v_is_group THEN 'GroupBooking' ELSE 'Reservation' END,
    COALESCE(v_group_id, v_reservation_ids[1]),
    'public_booking',
    jsonb_build_object(
      'guestEmail',       p_guest_email,
      'reservationIds',   v_reservation_ids,
      'groupId',          v_group_id,
      'checkIn',          p_check_in,
      'checkOut',         p_check_out,
      'idempotencyKey',   p_idempotency_key,
      'roomCount',        v_total_qty
    )
  );

  RETURN jsonb_build_object(
    'success',        TRUE,
    'idempotent',     FALSE,
    'reservationIds', v_reservation_ids,
    'guestId',        v_guest_id,
    'groupId',        v_group_id,
    'totalAmount',    v_subtotal + COALESCE(p_tax_amount,0) + COALESCE(p_svc_amount,0) + COALESCE(p_addon_amount,0)
  );

EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$function$;
