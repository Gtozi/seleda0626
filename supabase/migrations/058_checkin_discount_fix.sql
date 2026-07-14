-- Fix: check_in_reservation() never applied reservations.discount_percent
-- when building the initial folio_lines, while the frontend
-- (calculateFolioComponents / calculateReservationFolioMath) always
-- subtracts the discount BEFORE computing service charge and VAT. For any
-- reservation with a discount, this caused the backend folio balance to be
-- permanently higher than what the frontend displayed to the guest,
-- surfacing as a front-end/back-end balance discrepancy and blocked final
-- settlement ("payment won't post" for the last installment).
--
-- This migration re-creates check_in_reservation with discount applied in
-- the same order as the frontend: subtotal -> discount -> + fees -> + VAT.

create or replace function check_in_reservation(
  p_reservation_id text,
  p_room_number text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation reservations%rowtype;
  v_room rooms%rowtype;
  v_folio_id text;
  v_business_date date;
  v_now timestamp with time zone := now();
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  select * into v_reservation
  from reservations
  where id = p_reservation_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  if v_reservation.status not in ('Confirmed', 'Waitlisted') then
    return jsonb_build_object('success', false, 'error', 'Reservation is not eligible for check-in (status: ' || v_reservation.status || ')');
  end if;

  select * into v_room
  from rooms
  where number = p_room_number
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Room not found');
  end if;

  if v_room.status = 'Out of Order' then
    return jsonb_build_object('success', false, 'error', 'Room is Out of Order');
  end if;

  if exists (
    select 1 from reservations
    where room_number = p_room_number
    and status = 'CheckedIn'
    and id != p_reservation_id
  ) then
    return jsonb_build_object('success', false, 'error', 'Room is already occupied');
  end if;

  declare
    v_is_corporate boolean := v_reservation.channel = 'Corporate' or v_reservation.group_booking_id is not null;
    v_folio_a_id text;
    v_folio_b_id text;
    v_primary_folio_id text;
  begin
    if v_is_corporate then
      v_folio_a_id := gen_random_uuid()::text;
      v_folio_b_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_folio_a_id, p_reservation_id, 'Master', 'A', 'Open', 0.00, 'USD', v_now, p_user_id);
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_folio_b_id, p_reservation_id, 'Guest', 'B', 'Open', 0.00, 'USD', v_now, p_user_id);
      v_primary_folio_id := v_folio_a_id;
    else
      v_primary_folio_id := gen_random_uuid()::text;
      insert into folios (id, reservation_id, folio_type, target_folio, status, balance, currency, opened_at, created_by)
      values (v_primary_folio_id, p_reservation_id, 'Guest', null, 'Open', 0.00, 'USD', v_now, p_user_id);
    end if;

    declare
      v_base_amount numeric := v_reservation.total_amount;
      v_line_num integer := 1;
      v_fee record;
      v_fee_amount numeric;
      v_non_vat_fees numeric := 0.00;
      v_vat_amount numeric := 0.00;
      v_vat_name text := '';
      v_vat_rate numeric := 0;
      v_vat_account text := '';
      v_sc_total numeric := 0.00;
      v_discount_amount numeric := 0.00;
      v_discounted_base numeric;
    begin
      -- Base room charge (goes to corporate folio A if split, else primary)
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
        'Room charge - ' || v_reservation.room_type || ' (' || v_reservation.check_in_date || ' to ' || v_reservation.check_out_date || ')',
        v_base_amount, 1, v_base_amount, 'Room',
        case when v_is_corporate then 'A' else null end,
        (select code from chart_of_accounts where name ilike '%room revenue%' limit 1),
        'frontoffice', p_user_id
      );

      -- Discount, applied BEFORE fees/VAT to match the frontend's
      -- calculateFolioComponents ordering (subtotal -> discount -> fees -> tax).
      if coalesce(v_reservation.discount_percent, 0) > 0 then
        v_discount_amount := round(v_base_amount * v_reservation.discount_percent / 100, 2);
        v_line_num := v_line_num + 1;
        insert into folio_lines (
          id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
          line_type, target_folio, revenue_account_code, source_module, created_by
        ) values (
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          'Discount @ ' || v_reservation.discount_percent || '%',
          -v_discount_amount, 1, -v_discount_amount, 'Discount',
          case when v_is_corporate then 'A' else null end,
          (select code from chart_of_accounts where name ilike '%discount%' limit 1),
          'frontoffice', p_user_id
        );
      end if;

      v_discounted_base := v_base_amount - v_discount_amount;

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
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '%' else ' (Fixed)' end,
          v_fee_amount, 1, v_fee_amount,
          case
            when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
            else 'Extra'
          end,
          case when v_is_corporate then 'A' else null end,
          coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
          'frontoffice', p_user_id
        );
      end loop;

      -- Phase 2: Calculate VAT on (discounted base + non-VAT fees)
      select
        (elem->>'name')::text,
        (elem->>'value')::numeric,
        (elem->>'accountCode')::text
      into v_vat_name, v_vat_rate, v_vat_account
      from global_settings, jsonb_array_elements(fee_components) as elem
      where id = 'main'
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
          gen_random_uuid()::text, v_primary_folio_id, v_line_num, v_business_date,
          v_vat_name || ' @ ' || v_vat_rate || '%',
          v_vat_amount, 1, v_vat_amount, 'Tax',
          case when v_is_corporate then 'A' else null end,
          coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
          'frontoffice', p_user_id
        );
      end if;

      -- Update primary folio balance (net of discount)
      update folios
      set balance = v_discounted_base + v_non_vat_fees + v_vat_amount,
          total_charges = v_discounted_base + v_non_vat_fees + v_vat_amount,
          tax_total = v_vat_amount,
          service_charge_total = v_sc_total,
          updated_at = v_now
      where id = v_primary_folio_id;

      if v_is_corporate then
        update folios
        set balance = 0.00,
            total_charges = 0.00,
            tax_total = 0.00,
            service_charge_total = 0.00,
            updated_at = v_now
        where id = v_folio_b_id;
      end if;
    end;

    -- Preserve the primary folio id for the audit log / response below
    -- (the previous version of this function left the outer v_folio_id
    -- variable unset, so the check-in API response always returned
    -- folioId: null).
    v_folio_id := v_primary_folio_id;
  end;

  update reservations
  set status = 'CheckedIn',
      room_number = p_room_number,
      payment_status = case when v_reservation.is_deposit_paid then 'Partial' else 'Unpaid' end
  where id = p_reservation_id;

  update rooms
  set status = 'Occupied Clean'
  where number = p_room_number;

  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text,
    p_user_id,
    'reservation.check_in',
    'reservation',
    p_reservation_id,
    'frontoffice',
    jsonb_build_object('roomNumber', p_room_number, 'previousStatus', v_reservation.status, 'folioId', v_folio_id)
  );

  return jsonb_build_object('success', true, 'folioId', v_folio_id, 'roomNumber', p_room_number);
end;
$$;

grant execute on function check_in_reservation to authenticated;
