-- Migration 073: Fix duplicate payment keys in reservation.payments array
--
-- Bug: When a reservation has multiple folios (e.g., split A/B folios), the
-- sync_folio_lines_to_reservation_charges trigger (migration 060) can return
-- the same payment multiple times because the join between folio_payments and
-- folios doesn't deduplicate by payment ID. This causes React key duplication
-- errors in the frontend.
--
-- Fix: Add DISTINCT to the payment query in the trigger function to ensure
-- each payment appears only once in the reservation.payments array.

-- Drop and recreate the trigger function with DISTINCT
create or replace function sync_folio_lines_to_reservation_charges()
returns trigger as $$
declare
  v_folio_id text;
  v_reservation_id text;
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
  -- Use DISTINCT to prevent duplicate payment IDs when reservation has multiple folios
  for v_payment in
    select distinct
      fp.id, fp.payment_date, fp.amount, fp.payment_method, fp.reference_number, fp.is_voided, fp.created_at
    from folio_payments fp
    join folios f on f.id = fp.folio_id
    where f.reservation_id = v_reservation_id
    order by fp.payment_date
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
$$ language plpgsql;

-- Recreate triggers on folios, folio_lines, and folio_payments
drop trigger if exists trigger_sync_folio_lines_to_reservation_charges on folios;
create trigger trigger_sync_folio_lines_to_reservation_charges
after insert or update or delete on folios
for each row execute function sync_folio_lines_to_reservation_charges();

drop trigger if exists trigger_sync_folio_lines_to_reservation_charges on folio_lines;
create trigger trigger_sync_folio_lines_to_reservation_charges
after insert or update or delete on folio_lines
for each row execute function sync_folio_lines_to_reservation_charges();

drop trigger if exists trigger_sync_folio_lines_to_reservation_charges on folio_payments;
create trigger trigger_sync_folio_lines_to_reservation_charges
after insert or update or delete on folio_payments
for each row execute function sync_folio_lines_to_reservation_charges();

-- Clean up existing duplicate payment entries in reservation.payments arrays
-- This one-time fix removes duplicates that may have been created before this migration
do $$
declare
  res record;
  v_cleaned_payments jsonb;
  v_seen_ids text[] := array[]::text[];
  v_payment jsonb;
begin
  for res in select id, payments from reservations where payments is not null and jsonb_array_length(payments) > 0 loop
    v_cleaned_payments := '[]'::jsonb;
    v_seen_ids := array[]::text[];
    
    for i in 0..jsonb_array_length(res.payments) - 1 loop
      v_payment := res.payments -> i;
      if not (v_payment->>'id') = any(v_seen_ids) then
        v_cleaned_payments := v_cleaned_payments || v_payment;
        v_seen_ids := array_append(v_seen_ids, v_payment->>'id');
      end if;
    end loop;
    
    if jsonb_array_length(v_cleaned_payments) != jsonb_array_length(res.payments) then
      update reservations set payments = v_cleaned_payments where id = res.id;
    end if;
  end loop;
end $$;
