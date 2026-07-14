-- Migration 062: Fix Folio A/B identification showing 0.00 balance
--
-- Bug 1: sync_folio_lines_to_reservation_charges() (migration 060) rebuilt
--   reservations.charges without the `target_folio` column, so every trigger
--   sync wiped targetFolio from in-memory charge objects. getChargeFolio()
--   always fell through to 'B', leaving Folio A perpetually 0.00.
--   Fix: include target_folio (coalesced with the parent folio's target_folio
--   as fallback) and notes in the rebuilt JSONB.
--
-- Bug 2: /folio-balance filtered folio_lines.target_folio = 'A'/'B' but for a
--   single non-split folio all lines have target_folio = NULL (inherited from
--   folios.target_folio which is also NULL for a personal guest folio).
--   Fix: handled in server.ts — falls back to the folio's own target_folio.

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 1: Helper function (direct call, no trigger dependency)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function sync_folio_lines_to_reservation_charges_direct(p_folio_id text)
returns void
language plpgsql
security definer
as $$
declare
  v_reservation_id text;
  v_charges  jsonb := '[]'::jsonb;
  v_payments jsonb := '[]'::jsonb;
  v_line    record;
  v_payment record;
begin
  select reservation_id into v_reservation_id
  from folios where id = p_folio_id;

  if v_reservation_id is null then return; end if;

  for v_line in
    select
      fl.id, fl.line_number, fl.transaction_date, fl.description,
      fl.amount, fl.quantity, fl.unit_price, fl.line_type,
      fl.is_voided, fl.created_at,
      coalesce(fl.target_folio, f.target_folio) as effective_target_folio
    from folio_lines fl
    join folios f on f.id = fl.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fl.line_number
  loop
    v_charges := v_charges || jsonb_build_object(
      'id',          v_line.id,
      'lineNumber',  v_line.line_number,
      'date',        v_line.transaction_date,
      'description', v_line.description,
      'amount',      v_line.amount,
      'quantity',    v_line.quantity,
      'unitPrice',   v_line.unit_price,
      'type',        v_line.line_type,
      'isVoided',    v_line.is_voided,
      'createdAt',   v_line.created_at,
      'targetFolio', v_line.effective_target_folio
    );
  end loop;

  for v_payment in
    select
      fp.id, fp.payment_date, fp.amount, fp.payment_method,
      fp.reference_number, fp.is_voided, fp.created_at,
      fp.target_folio as payment_target_folio
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by f.id, fp.payment_date
  loop
    v_payments := v_payments || jsonb_build_object(
      'id',          v_payment.id,
      'date',        v_payment.payment_date,
      'amount',      v_payment.amount,
      'method',      v_payment.payment_method,
      'reference',   v_payment.reference_number,
      'isVoided',    v_payment.is_voided,
      'createdAt',   v_payment.created_at,
      'targetFolio', v_payment.payment_target_folio
    );
  end loop;

  update reservations
  set charges  = v_charges,
      payments = v_payments
  where id = v_reservation_id;
end;
$$;

grant execute on function sync_folio_lines_to_reservation_charges_direct(text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 2: Rebuild the trigger function to use the same logic
-- ─────────────────────────────────────────────────────────────────────────────
create or replace function sync_folio_lines_to_reservation_charges()
returns trigger
language plpgsql
security definer
as $$
declare
  v_folio_id text;
begin
  -- The trigger is attached to folios, folio_lines, and folio_payments.
  -- Only folio_lines/folio_payments have a folio_id column; folios uses its id.
  if tg_table_name = 'folios' then
    v_folio_id := coalesce(new.id, old.id);
  else
    v_folio_id := coalesce(new.folio_id, old.folio_id);
  end if;

  if v_folio_id is not null then
    perform sync_folio_lines_to_reservation_charges_direct(v_folio_id);
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Part 3: Backfill — inline logic (no function call) so this works regardless
--         of statement isolation in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────────────────────
do $$
declare
  v_folio_id      text;
  v_reservation_id text;
  v_charges       jsonb;
  v_payments      jsonb;
  v_line          record;
  v_payment       record;
begin
  for v_folio_id in
    select distinct folio_id from folio_lines
  loop
    select reservation_id into v_reservation_id
    from folios where id = v_folio_id;

    continue when v_reservation_id is null;

    v_charges  := '[]'::jsonb;
    v_payments := '[]'::jsonb;

    for v_line in
      select
        fl.id, fl.line_number, fl.transaction_date, fl.description,
        fl.amount, fl.quantity, fl.unit_price, fl.line_type,
        fl.is_voided, fl.created_at,
        coalesce(fl.target_folio, f.target_folio) as effective_target_folio
      from folio_lines fl
      join folios f on f.id = fl.folio_id
      where f.reservation_id = v_reservation_id
      order by f.id, fl.line_number
    loop
      v_charges := v_charges || jsonb_build_object(
        'id',          v_line.id,
        'lineNumber',  v_line.line_number,
        'date',        v_line.transaction_date,
        'description', v_line.description,
        'amount',      v_line.amount,
        'quantity',    v_line.quantity,
        'unitPrice',   v_line.unit_price,
        'type',        v_line.line_type,
        'isVoided',    v_line.is_voided,
        'createdAt',   v_line.created_at,
        'targetFolio', v_line.effective_target_folio
      );
    end loop;

    for v_payment in
      select
        fp.id, fp.payment_date, fp.amount, fp.payment_method,
        fp.reference_number, fp.is_voided, fp.created_at,
        fp.target_folio as payment_target_folio
      from folio_payments fp
      join folios f on f.id = fp.folio_id
      where f.reservation_id = v_reservation_id
      order by f.id, fp.payment_date
    loop
      v_payments := v_payments || jsonb_build_object(
        'id',          v_payment.id,
        'date',        v_payment.payment_date,
        'amount',      v_payment.amount,
        'method',      v_payment.payment_method,
        'reference',   v_payment.reference_number,
        'isVoided',    v_payment.is_voided,
        'createdAt',   v_payment.created_at,
        'targetFolio', v_payment.payment_target_folio
      );
    end loop;

    update reservations
    set charges  = v_charges,
        payments = v_payments
    where id = v_reservation_id;
  end loop;
end;
$$;
