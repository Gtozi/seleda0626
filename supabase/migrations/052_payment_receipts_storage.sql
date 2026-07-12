/*
  Storage bucket for guest folio payment receipt screenshots (Front Desk billing terminal).
  Public bucket so receipt images can be previewed directly via public URL.
*/

insert into storage.buckets (id, name, public)
values ('payment-receipts', 'payment-receipts', true)
on conflict (id) do nothing;

drop policy if exists "payment_receipts_public_read" on storage.objects;
create policy "payment_receipts_public_read"
  on storage.objects for select
  using (bucket_id = 'payment-receipts');

drop policy if exists "payment_receipts_public_write" on storage.objects;
create policy "payment_receipts_public_write"
  on storage.objects for insert
  with check (bucket_id = 'payment-receipts');

/*
  Add receipt_url column to folio_payments table for storing uploaded receipt screenshot URLs
*/

alter table folio_payments
add column if not exists receipt_url text;

/*
  Update post_folio_payment function to accept and store receipt_url
*/

create or replace function post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_now timestamp with time zone := now();
begin
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

  -- Insert payment with receipt URL
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url
  );

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update reservation payment status if folio balance is cleared
  if (v_folio.balance - p_amount) <= 0 then
    update reservations
    set payment_status = 'Paid'
    where id = v_folio.reservation_id;
  else
    update reservations
    set payment_status = 'Partial'
    where id = v_folio.reservation_id;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.payment.add', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object('amount', p_amount, 'method', p_payment_method, 'receiptUrl', p_receipt_url)
  );

  return jsonb_build_object('success', true, 'folioId', p_folio_id, 'newBalance', v_folio.balance - p_amount);
end;
$$;
