-- ============================================================
-- Migration 105: Unified Billing RPC
-- Step 2.2 — Single Billing RPC
--
-- Creates get_reservation_billing(p_reservation_id) that reads
-- actual folio_lines + folio_payments from the database and returns
-- a canonical billing breakdown. This replaces the frontend
-- calculateFolioComponents() function and the existing
-- calculate_billing_breakdown() which only used reservations.total_amount.
--
-- Also adds p_discount_percent to post_folio_charge so discounts
-- can be applied at charge-posting time.
-- ============================================================

-- ============================================================
-- Part 1: get_reservation_billing — canonical billing read RPC
-- ============================================================
create or replace function get_reservation_billing(
  p_reservation_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_reservation record;
  v_folio_ids text[];
  v_base_charges numeric := 0.0;
  v_service_charges numeric := 0.0;
  v_tax_charges numeric := 0.0;
  v_extra_charges numeric := 0.0;
  v_total_charges numeric := 0.0;
  v_total_payments numeric := 0.0;
  v_balance numeric := 0.0;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.0;
  v_lines jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_pay record;
begin
  -- Get reservation
  select id, discount_percent, total_amount
  into v_reservation
  from reservations
  where id = p_reservation_id;

  if v_reservation is null then
    return jsonb_build_object('success', false, 'error', 'Reservation not found');
  end if;

  v_discount_percent := coalesce(v_reservation.discount_percent, 0.0);

  -- Get folio IDs for this reservation
  select array_agg(id) into v_folio_ids
  from folios
  where reservation_id = p_reservation_id;

  if v_folio_ids is null or array_length(v_folio_ids, 1) = 0 then
    return jsonb_build_object(
      'success', true,
      'reservation_id', p_reservation_id,
      'subtotal', 0.0,
      'discount_percent', v_discount_percent,
      'discount_amount', 0.0,
      'service_charges', 0.0,
      'tax_amount', 0.0,
      'extra_charges', 0.0,
      'total_charges', 0.0,
      'total_payments', 0.0,
      'balance', 0.0,
      'lines', '[]'::jsonb,
      'payments', '[]'::jsonb
    );
  end if;

  -- Aggregate charges by line_type from folio_lines (non-voided)
  for v_line in
    select
      id,
      folio_id,
      line_number,
      transaction_date,
      description,
      amount,
      quantity,
      unit_price,
      line_type,
      target_folio,
      revenue_account_code,
      source_module,
      source_reference,
      is_voided,
      created_at
    from folio_lines
    where folio_id = any(v_folio_ids)
    and is_voided = false
    order by line_number asc
  loop
    v_lines := v_lines || jsonb_build_object(
      'id', v_line.id,
      'folioId', v_line.folio_id,
      'lineNumber', v_line.line_number,
      'transactionDate', to_char(v_line.transaction_date, 'YYYY-MM-DD'),
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'targetFolio', v_line.target_folio,
      'revenueAccountCode', v_line.revenue_account_code,
      'sourceModule', v_line.source_module,
      'sourceReference', v_line.source_reference,
      'isVoided', v_line.is_voided,
      'createdAt', to_char(v_line.created_at, 'YYYY-MM-DD"T"HH24:MI:SS')
    );

    -- Categorize by line_type
    if v_line.line_type = 'Tax' then
      v_tax_charges := v_tax_charges + v_line.amount;
    elsif v_line.line_type = 'ServiceCharge' then
      v_service_charges := v_service_charges + v_line.amount;
    elsif v_line.line_type = 'Discount' then
      v_discount_amount := v_discount_amount + abs(v_line.amount);
    else
      v_base_charges := v_base_charges + v_line.amount;
    end if;
  end loop;

  v_total_charges := v_base_charges + v_service_charges + v_tax_charges + v_extra_charges;

  -- Aggregate payments from folio_payments (non-voided)
  for v_pay in
    select
      id,
      folio_id,
      payment_date,
      amount,
      payment_method,
      payment_sub_type,
      reference_number,
      card_last_four,
      is_voided,
      is_refund,
      target_folio,
      notes,
      created_at
    from folio_payments
    where folio_id = any(v_folio_ids)
    and is_voided = false
    order by payment_date asc
  loop
    v_payments := v_payments || jsonb_build_object(
      'id', v_pay.id,
      'folioId', v_pay.folio_id,
      'paymentDate', to_char(v_pay.payment_date, 'YYYY-MM-DD"T"HH24:MI:SS'),
      'amount', v_pay.amount,
      'paymentMethod', v_pay.payment_method,
      'paymentSubType', v_pay.payment_sub_type,
      'referenceNumber', v_pay.reference_number,
      'cardLastFour', v_pay.card_last_four,
      'isVoided', v_pay.is_voided,
      'isRefund', v_pay.is_refund,
      'targetFolio', v_pay.target_folio,
      'notes', v_pay.notes,
      'createdAt', to_char(v_pay.created_at, 'YYYY-MM-DD"T"HH24:MI:SS')
    );

    v_total_payments := v_total_payments + v_pay.amount;
  end loop;

  v_balance := v_total_charges - v_total_payments;

  return jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'subtotal', round(v_base_charges, 2),
    'discount_percent', v_discount_percent,
    'discount_amount', round(v_discount_amount, 2),
    'service_charges', round(v_service_charges, 2),
    'tax_amount', round(v_tax_charges, 2),
    'extra_charges', round(v_extra_charges, 2),
    'total_charges', round(v_total_charges, 2),
    'total_payments', round(v_total_payments, 2),
    'balance', round(v_balance, 2),
    'lines', v_lines,
    'payments', v_payments
  );
end;
$$;

grant execute on function get_reservation_billing(text) to authenticated;
grant execute on function get_reservation_billing(text) to anon;

-- ============================================================
-- Part 2: Add p_discount_percent to post_folio_charge
-- ============================================================

-- Drop all existing versions of post_folio_charge
do $$
declare
  func_record record;
begin
  for func_record in
    select oid from pg_proc where proname = 'post_folio_charge'
  loop
    execute 'drop function if exists ' || func_record.oid::regprocedure || ' cascade';
  end loop;
end $$;

create or replace function post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text default null,
  p_discount_percent numeric default 0.0
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_next_line integer;
  v_business_date date;
  v_now timestamp with time zone := now();
  v_base_amount numeric := p_amount;
  v_discounted_amount numeric;
  v_discount_amount numeric := 0.0;
  v_base_line_id text := gen_random_uuid()::text;
  v_fee record;
  v_fee_amount numeric;
  v_total_fees numeric := 0.00;
  v_tax_amount numeric := 0.00;
  v_non_vat_fees numeric := 0.00;
  v_vat_name text := '';
  v_vat_rate numeric := 0;
  v_vat_account text := '';
  v_sc_total numeric := 0.00;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Lock folio
  select * into v_folio
  from folios
  where id = p_folio_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Folio not found');
  end if;

  if v_folio.status != 'Open' then
    return jsonb_build_object('success', false, 'error', 'Folio is not open');
  end if;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_next_line
  from folio_lines
  where folio_id = p_folio_id;

  -- Apply discount if provided
  if p_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * p_discount_percent / 100, 2);
    v_discounted_amount := v_base_amount - v_discount_amount;
  else
    v_discounted_amount := v_base_amount;
  end if;

  -- Insert base charge line (using discounted amount)
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_discounted_amount, p_quantity,
    case when p_quantity > 0 then round(v_discounted_amount / p_quantity, 2) else v_discounted_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Insert discount line if discount applied
  if v_discount_amount > 0 then
    v_next_line := v_next_line + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      'Discount @ ' || p_discount_percent || '% on ' || p_description,
      -v_discount_amount, 1, -v_discount_amount,
      'Discount', v_folio.target_folio, null, 'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on discounted amount, insert lines
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
    v_next_line := v_next_line + 1;
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_amount * v_fee.value / 100, 2);
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
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      v_fee.name || case when v_fee.fee_type = 'percentage' then ' @ ' || v_fee.value || '% on ' || p_description else ' (Fixed) on ' || p_description end,
      v_fee_amount, 1, v_fee_amount,
      case
        when lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then 'ServiceCharge'
        else 'Extra'
      end,
      v_folio.target_folio,
      coalesce(v_fee.account_code, (select code from chart_of_accounts where name ilike '%miscellaneous%' limit 1)),
      'frontoffice', p_user_id
    );
  end loop;

  -- Phase 2: Calculate VAT on (discounted amount + non-VAT fees), insert last
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
    v_tax_amount := round((v_discounted_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_next_line := v_next_line + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      v_vat_name || ' @ ' || v_vat_rate || '% on ' || p_description,
      v_tax_amount, 1, v_tax_amount, 'Tax',
      v_folio.target_folio,
      coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
      'frontoffice', p_user_id
    );
  end if;

  v_total_fees := v_non_vat_fees + v_tax_amount;

  -- Update folio balance
  update folios
  set balance = balance + v_discounted_amount + v_total_fees,
      total_charges = total_charges + v_discounted_amount + v_total_fees,
      tax_total = tax_total + v_tax_amount,
      service_charge_total = service_charge_total + v_sc_total,
      updated_at = v_now
  where id = p_folio_id;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'folioId', p_folio_id,
    'baseAmount', v_base_amount,
    'discountedAmount', v_discounted_amount,
    'discountAmount', v_discount_amount,
    'feesTotal', v_total_fees,
    'taxAmount', v_tax_amount,
    'serviceChargeTotal', v_sc_total
  );
end;
$$;

grant execute on function post_folio_charge(text, text, numeric, numeric, text, text, text, text, numeric) to authenticated;
