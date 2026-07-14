-- Migration 060: Unified Billing Calculation and Single Source of Truth
-- This migration implements long-term architectural changes to eliminate
-- frontend/backend billing discrepancies.

-- Part 1: Add discount_percent parameter to post_folio_charge
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
  v_base_line_id text := gen_random_uuid()::text;
  v_fee record;
  v_fee_amount numeric;
  v_total_fees numeric := 0.00;
  v_tax_amount numeric := 0.00;
  v_discount_percent numeric := 0.0;
  v_discount_amount numeric := 0.00;
  v_discounted_amount numeric;
  v_res_discount_percent numeric := 0.0;
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

  -- Get reservation discount_percent as fallback
  select coalesce(discount_percent, 0.0) into v_res_discount_percent
  from reservations
  where id = v_folio.reservation_id;

  -- Use provided discount_percent or fall back to reservation discount
  if p_discount_percent > 0 then
    v_discount_percent := p_discount_percent;
  elsif v_res_discount_percent > 0 then
    v_discount_percent := v_res_discount_percent;
  else
    v_discount_percent := 0.0;
  end if;

  -- Calculate discount amount
  if v_discount_percent > 0 then
    v_discount_amount := round(v_base_amount * v_discount_percent / 100, 2);
  end if;
  
  v_discounted_amount := v_base_amount - v_discount_amount;

  -- Get next line number
  select coalesce(max(line_number), 0) + 1 into v_next_line
  from folio_lines
  where folio_id = p_folio_id;

  -- Insert base charge line (undiscounted base for transparency)
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_base_amount, p_quantity,
    case when p_quantity > 0 then round(v_base_amount / p_quantity, 2) else v_base_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Insert discount line if applicable
  if v_discount_percent > 0 then
    v_next_line := v_next_line + 1;
    insert into folio_lines (
      id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
      line_type, target_folio, revenue_account_code, source_module, created_by
    ) values (
      gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
      'Discount @ ' || v_discount_percent || '% on ' || p_description,
      -v_discount_amount, 1, -v_discount_amount, 'Discount',
      v_folio.target_folio, (select code from chart_of_accounts where name ilike '%discount%' limit 1),
      'frontoffice', p_user_id
    );
  end if;

  -- Phase 1: Calculate non-VAT fees on DISCOUNTED amount, insert lines
  declare
    v_non_vat_fees numeric := 0.00;
    v_vat_amount numeric := 0.00;
    v_vat_name text := '';
    v_vat_rate numeric := 0;
    v_vat_account text := '';
    v_sc_total numeric := 0.00;
  begin
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
      v_vat_amount := round((v_discounted_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
      v_next_line := v_next_line + 1;
      insert into folio_lines (
        id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
        line_type, target_folio, revenue_account_code, source_module, created_by
      ) values (
        gen_random_uuid()::text, p_folio_id, v_next_line, v_business_date,
        v_vat_name || ' @ ' || v_vat_rate || '% on ' || p_description,
        v_vat_amount, 1, v_vat_amount, 'Tax',
        v_folio.target_folio,
        coalesce(v_vat_account, (select code from chart_of_accounts where name ilike '%tax payable%' limit 1)),
        'frontoffice', p_user_id
      );
    end if;

    v_total_fees := v_non_vat_fees + v_vat_amount;

    -- Update folio balance with separate service charge and tax tracking
    update folios
    set balance = balance + v_discounted_amount + v_total_fees,
        total_charges = total_charges + v_discounted_amount + v_total_fees,
        tax_total = tax_total + v_vat_amount,
        service_charge_total = service_charge_total + v_sc_total,
        updated_at = v_now
    where id = p_folio_id;

    -- Audit
    insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
    values (
      gen_random_uuid()::text, p_user_id, 'folio.charge.add', 'folio', p_folio_id, 'frontoffice',
      jsonb_build_object(
        'baseAmount', v_base_amount, 'discountPercent', v_discount_percent, 'discountAmount', v_discount_amount,
        'discountedAmount', v_discounted_amount, 'nonVatFees', v_non_vat_fees, 'vatAmount', v_vat_amount,
        'scTotal', v_sc_total, 'totalAmount', v_discounted_amount + v_total_fees,
        'description', p_description, 'lineType', p_line_type
      )
    );

    return jsonb_build_object(
      'success', true,
      'folio_id', p_folio_id,
      'base_amount', v_base_amount,
      'discount_percent', v_discount_percent,
      'discount_amount', v_discount_amount,
      'discounted_amount', v_discounted_amount,
      'non_vat_fees', v_non_vat_fees,
      'vat_amount', v_vat_amount,
      'total_amount', v_discounted_amount + v_total_fees,
      'folio_balance', v_folio.balance + v_discounted_amount + v_total_fees
    );
  end;
end;
$$;

-- Part 2: Create unified calculate_billing_breakdown RPC
create or replace function calculate_billing_breakdown(
  p_base_amount numeric,
  p_discount_percent numeric default 0.0,
  p_reservation_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_discount_amount numeric := 0.0;
  v_discounted_amount numeric;
  v_non_vat_fees numeric := 0.00;
  v_vat_amount numeric := 0.00;
  v_sc_total numeric := 0.00;
  v_fee record;
  v_fee_amount numeric;
  v_vat_name text;
  v_vat_rate numeric;
  v_fee_breakdown jsonb := '[]'::jsonb;
  v_effective_discount numeric := 0.0;
  v_res_discount numeric := 0.0;
begin
  -- Resolve effective discount: use provided or fall back to reservation
  if p_discount_percent > 0 then
    v_effective_discount := p_discount_percent;
  elsif p_reservation_id is not null then
    select coalesce(discount_percent, 0.0) into v_res_discount
    from reservations
    where id = p_reservation_id;
    v_effective_discount := v_res_discount;
  end if;

  -- Calculate discount
  if v_effective_discount > 0 then
    v_discount_amount := round(p_base_amount * v_effective_discount / 100, 2);
  end if;
  v_discounted_amount := p_base_amount - v_discount_amount;

  -- Phase 1: non-VAT fees on discounted amount
  for v_fee in
    select
      (elem->>'name')::text as name,
      (elem->>'feeType')::text as fee_type,
      (elem->>'value')::numeric as value,
      (elem->>'displayOrder')::int as display_order
    from global_settings, jsonb_array_elements(fee_components) as elem
    where global_settings.id = 'main'
    and (elem->>'isEnabled')::boolean = true
    and lower((elem->>'name')::text) not like '%vat%'
    and lower((elem->>'name')::text) not like '%tax%'
    order by (elem->>'displayOrder')::int asc
  loop
    if v_fee.fee_type = 'percentage' then
      v_fee_amount := round(v_discounted_amount * v_fee.value / 100, 2);
    else
      v_fee_amount := v_fee.value;
    end if;
    v_non_vat_fees := v_non_vat_fees + v_fee_amount;

    if lower(v_fee.name) like '%service charge%' or lower(v_fee.name) like '%service%' then
      v_sc_total := v_sc_total + v_fee_amount;
    end if;

    v_fee_breakdown := v_fee_breakdown || jsonb_build_object(
      'name', v_fee.name,
      'amount', v_fee_amount,
      'type', v_fee.fee_type,
      'value', v_fee.value,
      'displayOrder', v_fee.display_order
    );
  end loop;

  -- Phase 2: VAT on (discounted amount + non-VAT fees)
  select
    (elem->>'name')::text,
    (elem->>'value')::numeric
  into v_vat_name, v_vat_rate
  from global_settings, jsonb_array_elements(fee_components) as elem
  where global_settings.id = 'main'
  and (elem->>'isEnabled')::boolean = true
  and (lower((elem->>'name')::text) like '%vat%' or lower((elem->>'name')::text) like '%tax%')
  limit 1;

  if v_vat_name is not null and v_vat_rate > 0 then
    v_vat_amount := round((v_discounted_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
    v_fee_breakdown := v_fee_breakdown || jsonb_build_object(
      'name', v_vat_name,
      'amount', v_vat_amount,
      'type', 'percentage',
      'value', v_vat_rate,
      'displayOrder', 9999
    );
  end if;

  return jsonb_build_object(
    'base_amount', p_base_amount,
    'discount_percent', v_effective_discount,
    'discount_amount', v_discount_amount,
    'discounted_amount', v_discounted_amount,
    'non_vat_fees', v_non_vat_fees,
    'service_charge_total', v_sc_total,
    'vat_amount', v_vat_amount,
    'total_amount', v_discounted_amount + v_non_vat_fees + v_vat_amount,
    'fee_breakdown', v_fee_breakdown
  );
end;
$$;

-- Grant execute permissions
grant execute on function post_folio_charge(text, text, numeric, numeric, text, text, text, text, numeric) to authenticated;
grant execute on function calculate_billing_breakdown(numeric, numeric, text) to authenticated;

-- Part 3: Database trigger to sync folio_lines to reservation.charges (backward compatibility)
-- This ensures reservation.charges JSONB stays in sync with folio_lines table during transition

create or replace function sync_folio_lines_to_reservation_charges()
returns trigger
language plpgsql
security definer
as $$
declare
  v_reservation_id text;
  v_folio_id text;
  v_charges jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line record;
  v_payment record;
begin
  -- Determine the folio id based on which table fired the trigger.
  -- folios has id; folio_lines and folio_payments have folio_id.
  if tg_table_name = 'folios' then
    if tg_op = 'DELETE' then
      v_folio_id := old.id;
    else
      v_folio_id := new.id;
    end if;
  else
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  end if;

  -- Get reservation_id from the folio
  select reservation_id into v_reservation_id
  from folios
  where id = v_folio_id;

  if v_reservation_id is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  -- Rebuild charges array from all folio_lines for this reservation
  for v_line in
    select
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type, fl.is_voided, fl.created_at
    from folio_lines fl
    join folios f on f.id = fl.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fl.line_number
  loop
    v_charges := v_charges || jsonb_build_object(
      'id', v_line.id,
      'lineNumber', v_line.line_number,
      'date', v_line.transaction_date,
      'description', v_line.description,
      'amount', v_line.amount,
      'quantity', v_line.quantity,
      'unitPrice', v_line.unit_price,
      'lineType', v_line.line_type,
      'isVoided', v_line.is_voided,
      'createdAt', v_line.created_at
    );
  end loop;

  -- Rebuild payments array from all folio_payments for this reservation
  for v_payment in
    select
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, fp.is_voided, fp.created_at
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fp.payment_date
  loop
    v_payments := v_payments || jsonb_build_object(
      'id', v_payment.id,
      'date', v_payment.payment_date,
      'amount', v_payment.amount,
      'paymentMethod', v_payment.payment_method,
      'reference', v_payment.reference_number,
      'isVoided', v_payment.is_voided,
      'createdAt', v_payment.created_at
    );
  end loop;

  -- Update reservation.charges and reservation.payments
  update reservations
  set charges = v_charges,
      payments = v_payments
  where id = v_reservation_id;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- Create trigger on folio_lines
drop trigger if exists trigger_sync_folio_lines_to_reservation on folio_lines;
create trigger trigger_sync_folio_lines_to_reservation
after insert or update or delete on folio_lines
for each row
execute function sync_folio_lines_to_reservation_charges();

-- Create trigger on folio_payments
drop trigger if exists trigger_sync_folio_payments_to_reservation on folio_payments;
create trigger trigger_sync_folio_payments_to_reservation
after insert or update or delete on folio_payments
for each row
execute function sync_folio_lines_to_reservation_charges();

-- Create trigger on folios (when folio is created/deleted, sync lines)
drop trigger if exists trigger_sync_folio_to_reservation on folios;
create trigger trigger_sync_folio_to_reservation
after insert or delete on folios
for each row
execute function sync_folio_lines_to_reservation_charges();
