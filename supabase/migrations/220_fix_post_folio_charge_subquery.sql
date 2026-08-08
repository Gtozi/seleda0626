-- Migration 220: Fix post_folio_charge subquery issue
-- The function had a subquery that could return multiple rows for tax payable accounts
-- This fixes the ambiguous account selection by using more specific queries

-- Drop existing function and recreate with fixed subqueries
DROP FUNCTION IF EXISTS public.post_folio_charge(text, text, numeric, numeric, text, text, text, text, numeric);

CREATE OR REPLACE FUNCTION public.post_folio_charge(
  p_folio_id text,
  p_description text,
  p_amount numeric,
  p_quantity numeric,
  p_line_type text,
  p_revenue_account_code text,
  p_user_id text,
  p_source_reference text,
  p_discount_percent numeric DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
  v_misc_account text;
  v_tax_account text;
begin
  select business_date into v_business_date from business_dates where id = 'current';
  if v_business_date is null then v_business_date := current_date; end if;

  -- Get account codes upfront to avoid subquery issues
  select code into v_misc_account 
  from chart_of_accounts 
  where name ilike '%miscellaneous%' 
  limit 1;
  
  select code into v_tax_account 
  from chart_of_accounts 
  where name = 'Tax Payable'  -- Use exact match instead of ILIKE to avoid multiple results
  limit 1;
  
  -- Fallback to first tax payable if exact match not found
  if v_tax_account is null then
    select code into v_tax_account 
    from chart_of_accounts 
    where name ilike '%tax payable%' 
    order by code asc  -- Consistent ordering
    limit 1;
  end if;

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
      coalesce(v_fee.account_code, v_misc_account),
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
      coalesce(v_vat_account, v_tax_account),
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

GRANT EXECUTE ON FUNCTION public.post_folio_charge(text, text, numeric, numeric, text, text, text, text, numeric) TO anon;
GRANT EXECUTE ON FUNCTION public.post_folio_charge(text, text, numeric, numeric, text, text, text, text, numeric) TO authenticated;
