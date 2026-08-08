-- Migration 230: assign_room RPC + fix change_room to check date overlaps
--
-- Problem: Multiple room-assignment paths (assignRoomToReservation, check-in,
-- change_room RPC) did NOT perform overlap-based conflict checking against
-- Confirmed reservations. The change_room RPC only checked for CheckedIn
-- occupancy, ignoring Confirmed bookings for the same dates. This allowed
-- double-booking (e.g. two Confirmed reservations on the same room for the
-- same dates).
--
-- Fix:
-- 1. New assign_room RPC — atomically assigns a room to a reservation after
--    verifying no other Confirmed/CheckedIn reservation overlaps on the same
--    room for the same dates. Uses SELECT ... FOR UPDATE to prevent races.
-- 2. Fix change_room RPC — replace the CheckedIn-only check with a proper
--    date-overlap check against both Confirmed and CheckedIn reservations.

-- ── 1. New: assign_room RPC ──────────────────────────────────────────────

create or replace function assign_room(
  p_reservation_id text,
  p_room_number text,
  p_user_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_room rooms%rowtype;
  v_conflict reservations%rowtype;
begin
  -- Lock the reservation row
  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  -- Lock and validate the room
  select * into v_room
  from rooms
  where number = p_room_number
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Room not found');
  end if;

  if v_room.status in ('Out of Order', 'Out of Service', 'Maintenance') then
    return jsonb_build_object('success', false, 'error', 'Room ' || p_room_number || ' is ' || v_room.status);
  end if;

  -- No-op if already assigned to the same room
  if v_reservation.room_number = p_room_number then
    return jsonb_build_object('success', true, 'reservationId', p_reservation_id, 'roomNumber', p_room_number, 'noop', true);
  end if;

  -- Check for overlapping Confirmed/CheckedIn reservation on the same room.
  -- Half-open interval: existing.check_in < new.check_out AND existing.check_out > new.check_in
  select * into v_conflict
  from reservations
  where room_number = p_room_number
    and id != p_reservation_id
    and status in ('Confirmed', 'CheckedIn')
    and check_in_date < v_reservation.check_out_date
    and check_out_date > v_reservation.check_in_date
  limit 1
  for update;

  if found then
    return jsonb_build_object(
      'success', false,
      'error', 'Room ' || p_room_number || ' is already booked by reservation ' || v_conflict.id ||
               ' (' || coalesce(v_conflict.guest_name, 'unknown') || ') for ' ||
               v_conflict.check_in_date::text || ' to ' || v_conflict.check_out_date::text
    );
  end if;

  -- Assign the room
  update reservations
  set room_number = p_room_number,
      updated_at = now()
  where id = p_reservation_id;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, coalesce(p_user_id, 'system'),
    'reservation.room.assign', 'reservation', p_reservation_id, 'frontoffice',
    jsonb_build_object('roomNumber', p_room_number, 'previousRoom', v_reservation.room_number)
  );

  return jsonb_build_object(
    'success', true,
    'reservationId', p_reservation_id,
    'roomNumber', p_room_number
  );
end;
$$;

-- ── 2. Fix change_room RPC: replace CheckedIn-only check with overlap check ──

create or replace function change_room(
  p_reservation_id text,
  p_new_room_number text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_new_room rooms%rowtype;
  v_old_room_number text;
  v_conflict reservations%rowtype;
  v_now timestamp with time zone := now();
  v_business_date date;
  v_folio_id text;
  v_next_line integer;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock reservation
  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  v_old_room_number := v_reservation.room_number;

  if v_old_room_number = p_new_room_number then
    return jsonb_build_object('success', false, 'error', 'New room is the same as the current room');
  end if;

  -- Lock and validate new room
  select * into v_new_room
  from rooms
  where number = p_new_room_number
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'New room not found');
  end if;

  if v_new_room.status = 'Out of Order' then
    return jsonb_build_object('success', false, 'error', 'New room is Out of Order');
  end if;

  -- Check new room is not booked by a different Confirmed/CheckedIn reservation
  -- for overlapping dates (half-open interval).
  select * into v_conflict
  from reservations
  where room_number = p_new_room_number
    and id != p_reservation_id
    and status in ('Confirmed', 'CheckedIn')
    and check_in_date < v_reservation.check_out_date
    and check_out_date > v_reservation.check_in_date
  limit 1
  for update;

  if found then
    return jsonb_build_object(
      'success', false,
      'error', 'Room ' || p_new_room_number || ' is already booked by reservation ' || v_conflict.id ||
               ' (' || coalesce(v_conflict.guest_name, 'unknown') || ') for ' ||
               v_conflict.check_in_date::text || ' to ' || v_conflict.check_out_date::text
    );
  end if;

  -- Update reservation room number
  update reservations
  set room_number = p_new_room_number
  where id = p_reservation_id;

  -- Update room statuses only when reservation is checked in
  if v_reservation.status = 'CheckedIn' then
    if v_old_room_number is not null then
      update rooms set status = 'Vacant Dirty' where number = v_old_room_number;
    end if;
    update rooms set status = 'Occupied Clean' where number = p_new_room_number;

    -- Post an informational Transfer line to the open folio (zero amount)
    select id into v_folio_id
    from folios
    where reservation_id = p_reservation_id and status = 'Open'
    order by case folio_type when 'Master' then 0 when 'Guest' then 1 else 2 end
    limit 1;

    if v_folio_id is not null then
      select coalesce(max(line_number), 0) + 1 into v_next_line
      from folio_lines where folio_id = v_folio_id;

      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, source_module, created_by
      ) values (
        gen_random_uuid()::text, v_folio_id, v_next_line, v_business_date,
        'Room transfer: ' || coalesce(v_old_room_number, 'unassigned') || ' -> ' || p_new_room_number,
        0.00, 1, 0.00, 'Transfer', 'frontoffice', p_user_id
      );
    end if;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'reservation.room.change', 'reservation', p_reservation_id, 'frontoffice',
    jsonb_build_object('fromRoom', v_old_room_number, 'toRoom', p_new_room_number, 'status', v_reservation.status)
  );

  return jsonb_build_object(
    'success', true,
    'reservationId', p_reservation_id,
    'fromRoom', v_old_room_number,
    'toRoom', p_new_room_number
  );
end;
$$;
