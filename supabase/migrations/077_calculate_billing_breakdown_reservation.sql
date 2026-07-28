-- ============================================================
-- Phase 2 — Unify the Ledger & Data Model
-- Make calculate_billing_breakdown reservation-centric.
-- If no explicit base_amount is supplied, derive it from the
-- reservation's total_amount. This lets the frontend call a single
-- RPC for a reservation instead of computing a base amount itself.
-- ============================================================

create or replace function calculate_billing_breakdown(
  p_base_amount numeric default null,
  p_discount_percent numeric default 0.0,
  p_reservation_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_base_amount numeric;
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
  v_res_total numeric;
  v_reservation record;
begin
  -- Resolve reservation and base amount
  if p_reservation_id is not null then
    select id, total_amount, discount_percent
    into v_reservation
    from reservations
    where id = p_reservation_id;

    if v_reservation is null then
      return jsonb_build_object('success', false, 'error', 'Reservation not found');
    end if;

    v_res_total := coalesce(v_reservation.total_amount, 0.0);
  end if;

  -- Base amount precedence: explicit > reservation total > 0
  if p_base_amount is not null and p_base_amount > 0 then
    v_base_amount := p_base_amount;
  elsif v_res_total is not null and v_res_total > 0 then
    v_base_amount := v_res_total;
  else
    v_base_amount := 0.0;
  end if;

  -- Resolve effective discount: explicit > reservation > 0
  if p_discount_percent > 0 then
    v_effective_discount := p_discount_percent;
  elsif v_reservation.id is not null and coalesce(v_reservation.discount_percent, 0.0) > 0 then
    v_effective_discount := v_reservation.discount_percent;
  elsif p_reservation_id is not null then
    -- legacy path when reservation row had no discount column populated
    select coalesce(discount_percent, 0.0) into v_res_discount
    from reservations
    where id = p_reservation_id;
    v_effective_discount := v_res_discount;
  end if;

  -- Calculate discount
  if v_effective_discount > 0 then
    v_discount_amount := round(v_base_amount * v_effective_discount / 100, 2);
  end if;
  v_discounted_amount := v_base_amount - v_discount_amount;

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
    'success', true,
    'reservation_id', p_reservation_id,
    'base_amount', v_base_amount,
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

-- Re-grant execute on the updated signature
grant execute on function calculate_billing_breakdown(numeric, numeric, text) to authenticated;
grant execute on function calculate_billing_breakdown(numeric, numeric, text) to anon;
