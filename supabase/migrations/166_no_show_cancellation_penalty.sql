-- Migration 166: No-Show & Cancellation Auto-Charge
-- Adds process_no_show and process_cancellation_penalty RPC functions
-- that post penalty charges to folios based on global settings
-- (cancellation_grace_hours, cancellation_penalty_percent).

-- Function: Process No-Show
-- Marks a reservation as NoShow, creates/gets a folio, and posts a penalty charge.

create or replace function process_no_show(
  p_reservation_id text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_folio_id text;
  v_line_num integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_penalty_percent numeric := 0.0;
  v_base_amount numeric := 0.00;
  v_penalty_amount numeric := 0.00;
  v_revenue_account text;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status not in ('Confirmed', 'Waitlisted') then
    return jsonb_build_object('success', false, 'error', 'Only Confirmed or Waitlisted reservations can be marked as no-show (current: ' || v_reservation.status || ')');
  end if;

  select coalesce(cancellation_penalty_percent, 0) into v_penalty_percent
  from global_settings where id = 'main';

  v_base_amount := coalesce(v_reservation.total_amount, 0);
  if v_base_amount = 0 then v_base_amount := coalesce(v_reservation.rate, 0); end if;

  v_penalty_amount := round(v_base_amount * v_penalty_percent / 100, 2);

  update reservations set status = 'NoShow' where id = p_reservation_id;

  if v_reservation.room_number is not null then
    update rooms set status = 'Vacant Clean' where number = v_reservation.room_number;
  end if;

  if v_penalty_amount > 0 then
    select id into v_folio_id from folios where reservation_id = p_reservation_id and status = 'Open' limit 1;

    if v_folio_id is null then
      v_folio_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, status, balance, total_charges, total_payments, currency, opened_at, created_by)
      values (v_folio_id, p_reservation_id, 'Guest', 'Open', 0, 0, 0, 'USD', v_now, p_user_id);
    end if;

    select coalesce(max(line_number), 0) + 1 into v_line_num from folio_lines where folio_id = v_folio_id;

    select code into v_revenue_account from chart_of_accounts
    where name ilike '%cancellation%' or name ilike '%no-show%' or name ilike '%penalty%' limit 1;

    if v_revenue_account is null then
      select code into v_revenue_account from chart_of_accounts where name ilike '%miscellaneous%' or name ilike '%other revenue%' limit 1;
    end if;

    insert into folio_lines (id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price, line_type, target_folio, revenue_account_code, source_module, source_reference, created_by)
    values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      'No-Show Penalty @ ' || v_penalty_percent || '% of ' || v_base_amount,
      v_penalty_amount, 1, v_penalty_amount, 'Extra', null,
      v_revenue_account, 'frontoffice', 'no_show_penalty', p_user_id
    );

    update folios set balance = balance + v_penalty_amount, total_charges = total_charges + v_penalty_amount, updated_at = v_now where id = v_folio_id;
  end if;

  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'reservation.no_show', 'Reservation', p_reservation_id, 'frontoffice',
    jsonb_build_object('reservationId', p_reservation_id, 'guestName', v_reservation.guest_name, 'penaltyPercent', v_penalty_percent, 'penaltyAmount', v_penalty_amount, 'folioId', v_folio_id)
  );

  return jsonb_build_object('success', true, 'reservationId', p_reservation_id, 'status', 'NoShow', 'penaltyAmount', v_penalty_amount, 'folioId', v_folio_id);
end;
$$;

grant execute on function process_no_show to authenticated;


-- Function: Process Cancellation with Penalty
-- Marks a reservation as Cancelled. If within grace period, no penalty.
-- Otherwise posts a penalty charge to the folio.

create or replace function process_cancellation_penalty(
  p_reservation_id text,
  p_user_id text,
  p_reason text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_folio_id text;
  v_line_num integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_grace_hours numeric := 24;
  v_penalty_percent numeric := 0.0;
  v_base_amount numeric := 0.00;
  v_penalty_amount numeric := 0.00;
  v_hours_until_checkin numeric := 0.0;
  v_is_within_grace boolean := false;
  v_revenue_account text;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  select * into v_reservation from reservations where id = p_reservation_id for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status not in ('Confirmed', 'Waitlisted', 'CheckedIn') then
    return jsonb_build_object('success', false, 'error', 'Reservation cannot be cancelled in current status: ' || v_reservation.status);
  end if;

  select coalesce(cancellation_grace_hours, 24), coalesce(cancellation_penalty_percent, 0)
  into v_grace_hours, v_penalty_percent
  from global_settings where id = 'main';

  v_hours_until_checkin := extract(epoch from (v_reservation.check_in_date::timestamp - v_now)) / 3600;
  v_is_within_grace := v_hours_until_checkin >= v_grace_hours;

  v_base_amount := coalesce(v_reservation.total_amount, 0);
  if v_base_amount = 0 then v_base_amount := coalesce(v_reservation.rate, 0); end if;

  if not v_is_within_grace and v_penalty_percent > 0 then
    v_penalty_amount := round(v_base_amount * v_penalty_percent / 100, 2);
  end if;

  update reservations set status = 'Cancelled' where id = p_reservation_id;

  if v_reservation.room_number is not null then
    update rooms set status = 'Vacant Clean' where number = v_reservation.room_number;
  end if;

  if v_penalty_amount > 0 then
    select id into v_folio_id from folios where reservation_id = p_reservation_id and status = 'Open' limit 1;

    if v_folio_id is null then
      v_folio_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, status, balance, total_charges, total_payments, currency, opened_at, created_by)
      values (v_folio_id, p_reservation_id, 'Guest', 'Open', 0, 0, 0, 'USD', v_now, p_user_id);
    end if;

    select coalesce(max(line_number), 0) + 1 into v_line_num from folio_lines where folio_id = v_folio_id;

    select code into v_revenue_account from chart_of_accounts
    where name ilike '%cancellation%' or name ilike '%penalty%' limit 1;

    if v_revenue_account is null then
      select code into v_revenue_account from chart_of_accounts where name ilike '%miscellaneous%' or name ilike '%other revenue%' limit 1;
    end if;

    insert into folio_lines (id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price, line_type, target_folio, revenue_account_code, source_module, source_reference, created_by)
    values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      'Cancellation Penalty @ ' || v_penalty_percent || '% of ' || v_base_amount,
      v_penalty_amount, 1, v_penalty_amount, 'Extra', null,
      v_revenue_account, 'frontoffice', 'cancellation_penalty', p_user_id
    );

    update folios set balance = balance + v_penalty_amount, total_charges = total_charges + v_penalty_amount, updated_at = v_now where id = v_folio_id;
  end if;

  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'reservation.cancelled', 'Reservation', p_reservation_id, 'frontoffice',
    jsonb_build_object(
      'reservationId', p_reservation_id, 'guestName', v_reservation.guest_name,
      'reason', p_reason, 'withinGrace', v_is_within_grace,
      'hoursUntilCheckin', v_hours_until_checkin, 'graceHours', v_grace_hours,
      'penaltyPercent', v_penalty_percent, 'penaltyAmount', v_penalty_amount, 'folioId', v_folio_id
    )
  );

  return jsonb_build_object(
    'success', true, 'reservationId', p_reservation_id, 'status', 'Cancelled',
    'penaltyAmount', v_penalty_amount, 'withinGrace', v_is_within_grace, 'folioId', v_folio_id
  );
end;
$$;

grant execute on function process_cancellation_penalty to authenticated;
