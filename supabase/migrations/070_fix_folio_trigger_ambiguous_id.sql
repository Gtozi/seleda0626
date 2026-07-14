-- Migration 070: Fix ambiguous "id" column references in sync_folio_lines_to_reservation_charges
-- The trigger function joins folio_lines/folio_payments with folios and selects "id"
-- without qualifying it, causing a 42702 ambiguous-column error when the trigger fires.

create or replace function sync_folio_lines_to_reservation_charges()
returns trigger
language plpgsql
security definer
as $$
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
