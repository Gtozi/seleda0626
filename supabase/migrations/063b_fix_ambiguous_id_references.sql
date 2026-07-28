-- Migration 063: Fix ambiguous id references in post_folio_charge
-- This fixes the "column reference id is ambiguous" error

-- Fix post_folio_charge function
create or replace function post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text default null
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

  -- Insert base charge line
  insert into folio_lines (
    id, folio_id, line_number, transaction_date, description, amount, quantity, unit_price,
    line_type, target_folio, revenue_account_code, source_module, source_reference, created_by
  ) values (
    v_base_line_id, p_folio_id, v_next_line, v_business_date,
    p_description, v_base_amount, p_quantity,
    case when p_quantity > 0 then round(v_base_amount / p_quantity, 2) else v_base_amount end,
    p_line_type, v_folio.target_folio, p_revenue_account_code, 'frontoffice', p_source_reference, p_user_id
  );

  -- Phase 1: Calculate non-VAT fees on base amount, insert lines
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
        v_fee_amount := round(v_base_amount * v_fee.value / 100, 2);
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

    -- Phase 2: Calculate VAT on (base + non-VAT fees), insert last
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
      v_vat_amount := round((v_base_amount + v_non_vat_fees) * v_vat_rate / 100, 2);
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
    set balance = balance + v_base_amount + v_total_fees,
        total_charges = total_charges + v_base_amount + v_total_fees,
        tax_total = tax_total + v_vat_amount,
        service_charge_total = service_charge_total + v_sc_total,
        updated_at = v_now
    where id = p_folio_id;
  end;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'folioId', p_folio_id,
    'baseAmount', v_base_amount,
    'feesTotal', v_total_fees,
    'taxAmount', v_vat_amount,
    'serviceChargeTotal', v_sc_total
  );
end;
$$;

-- Grant execute permission
grant execute on function post_folio_charge to authenticated;
