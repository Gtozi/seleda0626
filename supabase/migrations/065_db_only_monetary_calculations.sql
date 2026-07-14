-- Migration 065: Database-Only Monetary Calculations
-- This migration ensures ALL monetary values are calculated and stored in the database,
-- eliminating frontend calculation discrepancies.

-- Part 1: Create function to get reservation balance from folios
create or replace function get_reservation_balance(p_reservation_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_balance numeric := 0;
  v_total_charges numeric := 0;
  v_total_payments numeric := 0;
  v_folio record;
begin
  -- Sum balances from all folios for this reservation
  for v_folio in
    select 
      coalesce(balance, 0) as folio_balance,
      coalesce(total_charges, 0) as folio_charges,
      coalesce(total_payments, 0) as folio_payments
    from folios
    where reservation_id = p_reservation_id
  loop
    v_balance := v_balance + v_folio.folio_balance;
    v_total_charges := v_total_charges + v_folio.folio_charges;
    v_total_payments := v_total_payments + v_folio.folio_payments;
  end loop;

  return jsonb_build_object(
    'reservationId', p_reservation_id,
    'outstandingBalance', v_balance,
    'totalCharges', v_total_charges,
    'totalPayments', v_total_payments,
    'isSettled', v_balance <= 0
  );
end;
$$;

-- Part 2: Create function to get reservation total amount from database
create or replace function get_reservation_total(p_reservation_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_total_amount numeric;
  v_base_amount numeric := 0;
  v_discount_amount numeric := 0;
  v_tax_amount numeric := 0;
  v_service_charge numeric := 0;
  v_other_fees numeric := 0;
begin
  -- Get total_amount from reservations table (authoritative source)
  select coalesce(total_amount, 0) into v_total_amount
  from reservations
  where id = p_reservation_id;

  -- Calculate breakdown from folio_lines
  select
    coalesce(sum(case when line_type = 'RoomRate' then amount else 0 end), 0) +
    coalesce(sum(case when line_type = 'Extra' and description not ilike '%discount%' then amount else 0 end), 0)
  into v_base_amount
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.is_voided = false;

  select coalesce(sum(abs(amount)), 0) into v_discount_amount
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'Discount'
  and fl.is_voided = false;

  select coalesce(sum(amount), 0) into v_tax_amount
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'Tax'
  and fl.is_voided = false;

  select coalesce(sum(amount), 0) into v_service_charge
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'ServiceCharge'
  and fl.is_voided = false;

  select coalesce(sum(amount), 0) into v_other_fees
  from folio_lines fl
  join folios f on f.id = fl.folio_id
  where f.reservation_id = p_reservation_id
  and fl.line_type = 'Extra'
  and fl.is_voided = false
  and fl.description not ilike '%service%';

  return jsonb_build_object(
    'reservationId', p_reservation_id,
    'totalAmount', v_total_amount,
    'baseAmount', v_base_amount,
    'discountAmount', v_discount_amount,
    'taxAmount', v_tax_amount,
    'serviceChargeAmount', v_service_charge,
    'otherFeesAmount', v_other_fees
  );
end;
$$;

-- Part 3: Create function to get effective nightly rate from database
create or replace function get_effective_nightly_rate(
  p_room_type text,
  p_check_in_date date,
  p_rate_plan_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_base_rate numeric;
  v_season_multiplier numeric := 1.0;
  v_rate_plan_modifier numeric := 1.0;
  v_effective_rate numeric;
  v_season_name text := '';
  v_rate_plan_name text := 'Standard Rate';
begin
  -- Get base rate from rooms table (first room of this type)
  select coalesce(rate, 0) into v_base_rate
  from rooms
  where type = p_room_type
  limit 1;

  -- Get seasonal multiplier
  select 
    coalesce(multiplier, 1.0),
    name
  into v_season_multiplier, v_season_name
  from seasons
  where 
    (to_char(p_check_in_date, 'MM')::int = start_month and to_char(p_check_in_date, 'DD')::int >= start_day)
    or
    (to_char(p_check_in_date, 'MM')::int = end_month and to_char(p_check_in_date, 'DD')::int <= end_day)
    or
    (start_month > end_month and (
      (to_char(p_check_in_date, 'MM')::int = start_month and to_char(p_check_in_date, 'DD')::int >= start_day) or
      (to_char(p_check_in_date, 'MM')::int = end_month and to_char(p_check_in_date, 'DD')::int <= end_day)
    ))
  limit 1;

  -- Get rate plan modifier
  if p_rate_plan_id is not null then
    select 
      coalesce(base_modifier, 1.0),
      name
    into v_rate_plan_modifier, v_rate_plan_name
    from rate_plans
    where id = p_rate_plan_id
    and active = true
    limit 1;
  end if;

  v_effective_rate := round(v_base_rate * v_season_multiplier * v_rate_plan_modifier, 2);

  return jsonb_build_object(
    'roomType', p_room_type,
    'baseRate', v_base_rate,
    'seasonMultiplier', v_season_multiplier,
    'seasonName', v_season_name,
    'ratePlanModifier', v_rate_plan_modifier,
    'ratePlanName', v_rate_plan_name,
    'effectiveRate', v_effective_rate
  );
end;
$$;

-- Grant execute permissions
grant execute on function get_reservation_balance(text) to authenticated;
grant execute on function get_reservation_total(text) to authenticated;
grant execute on function get_effective_nightly_rate(text, date, text) to authenticated;
