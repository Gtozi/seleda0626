-- Migration 066: Fix check_in_reservation room column / parameter mismatch
-- Migration 064 introduced a broken signature that referenced the non-existent
-- reservations.room_id column and swapped p_user_id / p_room_id semantics so the
-- room number sent by the server was stored as created_by. That caused a 500 on
-- every POST /api/reservations/:id/check-in call.
--
-- This migration drops all overloaded variants of check_in_reservation and
-- recreates it with the corrected signature (p_user_id, p_room_number) using the
-- existing reservations.room_number column.

-- Drop all versions of check_in_reservation by OID to avoid overloading
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT oid FROM pg_proc WHERE proname = 'check_in_reservation'
  LOOP
    EXECUTE 'DROP FUNCTION ' || func_record.oid::regprocedure || ' CASCADE';
  END LOOP;
END $$;

-- Recreate check_in_reservation with the corrected signature
create or replace function check_in_reservation(
  p_reservation_id text,
  p_user_id text,
  p_room_number text default null,
  p_payment_method text default null,
  p_payment_amount numeric default null,
  p_payment_reference text default null
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
  v_base_amount numeric;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.00;
  v_discounted_base numeric;
  v_fee record;
  v_fee_amount numeric;
  v_non_vat_fees numeric := 0.00;
  v_vat_amount numeric := 0.00;
  v_vat_name text := '';
  v_vat_rate numeric := 0;
  v_vat_account text := '';
  v_sc_total numeric := 0.00;
  v_payment_id text;
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

  if v_reservation.status = 'CheckedIn' then
    return jsonb_build_object('success', false, 'error', 'Reservation already checked in');
  end if;

  -- Update reservation status and room assignment
  update reservations
  set status = 'CheckedIn',
      check_in_date = v_now,
      check_out_date = v_reservation.check_out_date,
      room_number = coalesce(p_room_number, room_number)
  where id = p_reservation_id;

  -- Create folio if not exists
  select id into v_folio_id
  from folios
  where reservation_id = p_reservation_id
    and status = 'Open'
  limit 1;

  if v_folio_id is null then
    v_folio_id := gen_random_uuid()::text;
    insert into folios (
      id, reservation_id, folio_type, status, balance, total_charges, total_payments,
      currency, opened_at, created_by
    ) values (
      v_folio_id, p_reservation_id, 'Guest', 'Open', 0, 0, 0,
      'USD', v_now, p_user_id
    );
  end if;

  -- Calculate base amount from reservation charges
  v_base_amount := coalesce(v_reservation.total_amount, 0);
  v_discount_percent := coalesce(v_reservation.discount_percent, 0);

  -- Calculate discount
  if v_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * v_discount_percent / 100, 2);
  end if;
  v_discounted_base := v_base_amount - v_discount_amount;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_line_num
  from folio_lines
  where folio_id = v_folio_id;

  -- Insert base room charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, created_by
  ) values (
    gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
    'Room charge - ' || coalesce(v_reservation.room_type, 'reservation'),
    v_base_amount, 1, v_base_amount, 'Room', null,
    (select code from chart_of_accounts where name ilike '%room revenue%' limit 1),
    'frontoffice', p_user_id
  );

  -- Insert discount line if applicable
  if v_discount_percent > 0 then
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      'Discount @ ' || v_discount_percent || '% on room charge',
      -v_discount_amount, 1, -v_discount_amount, 'Discount', null,
      (select code from chart_of_accounts where name ilike '%discount%' limit 1),
      'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on the discounted base, insert lines
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'accountCode')::text as account_code
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    v_line_num := v_line_num + 1;
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_base * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on room charge' else ' (Fixed) on room charge' end,
      v_fee_amount, 1, v_fee_amount,
      case
        when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
        else 'Extra'
      end,
      null,
      coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
      'frontoffice', p_user_id
    );
  end loop;

  -- Phase 2: Calculate VAT on (discounted base + non-VAT fees), insert last
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric,
    (elem->>'accountCode')::text
  into v_vat_name, v_vat_rate, v_vat_account
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_vat_amount := round((v_discounted_base + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_line_num := v_line_num + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, v_folio_id, v_line_num, v_business_date,
      v_vat_name || ' @ ' || v_vat_rate || '% on room charge',
      v_vat_amount, 1, v_vat_amount, 'Tax', null,
      coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
      'frontoffice', p_user_id
    );
  end if;

  -- Update folio balance
  update folios
  set balance = balance + v_discounted_base + v_non_vat_fees + v_vat_amount,
      total_charges = total_charges + v_discounted_base + v_non_vat_fees + v_vat_amount,
      tax_total = tax_total + v_vat_amount,
      service_charge_total = service_charge_total + v_sc_total,
      updated_at = v_now
  where id = v_folio_id;

  -- Process payment if provided
  if p_payment_amount is not null and p_payment_amount > 0 then
    insert into folio_payments (
      id, folio_id, amount, payment_method, reference_number, user_id, created_at
    ) values (
      gen_random_uuid()::text, v_folio_id, p_payment_amount, p_payment_method, p_payment_reference, p_user_id, v_now
    ) returning id into v_payment_id;

    update folios
    set total_payments = total_payments + p_payment_amount,
        balance = balance - p_payment_amount,
        updated_at = v_now
    where id = v_folio_id;
  end if;

  return jsonb_build_object(
    'success', true,
    'reservationId', p_reservation_id,
    'folioId', v_folio_id,
    'roomNumber', v_reservation.room_number,
    'checkInDate', v_now
  );
end;
$$;

-- Grant execute permission
grant execute on function check_in_reservation to authenticated;
