-- Fix split payment validation: Move over-balance check to API endpoint level
-- This allows split payments to be validated as a total rather than per-split

DROP FUNCTION IF EXISTS post_folio_payment(text, numeric, text, text, text, text, text, text);

CREATE OR REPLACE FUNCTION post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null,
  p_idempotency_key text default null,
  p_bank_account_id text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
  v_payment_id text;
  v_now timestamp with time zone := now();
  v_duplicate_ref boolean;
  v_existing_idempotency payment_idempotency%rowtype;
  v_outstanding_balance numeric;
begin
  -- Idempotency check: if this key was already processed, return the existing result
  if p_idempotency_key is not null then
    select * into v_existing_idempotency
    from payment_idempotency
    where idempotency_key = p_idempotency_key
      and folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and expires_at > now()
    for update;
    
    if found then
      if v_existing_idempotency.processed_payment_id is not null then
        -- Return the existing payment result
        return jsonb_build_object(
          'success', true,
          'folioId', p_folio_id,
          'paymentId', v_existing_idempotency.processed_payment_id,
          'idempotent', true,
          'message', 'Payment already processed (idempotent request)'
        );
      else
        -- Idempotency key exists but no payment processed - this shouldn't happen
        return jsonb_build_object('success', false, 'error', 'Idempotency key conflict');
      end if;
    end if;
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

  -- Calculate outstanding balance (total charges - total payments)
  -- Note: Over-balance validation is now handled at the API endpoint level
  -- to properly support split payments. Individual split amounts are not
  -- validated against the balance here since the total is validated upstream.
  select coalesce(sum(amount), 0) into v_outstanding_balance
  from folio_lines
  where folio_id = p_folio_id and is_voided = false;

  v_outstanding_balance := v_outstanding_balance - (
    select coalesce(sum(amount), 0)
    from folio_payments
    where folio_id = p_folio_id and is_voided = false
  );

  -- Safeguard 1: Prevent negative payments
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Payment amount must be positive');
  end if;

  -- Safeguard 2: Check for duplicate reference number within the same folio
  if p_reference is not null then
    select exists(
      select 1 from folio_payments
      where folio_id = p_folio_id
        and reference_number = p_reference
        and is_voided = false
    ) into v_duplicate_ref;
    
    if v_duplicate_ref then
      return jsonb_build_object(
        'success', false,
        'error', 'Duplicate reference number for this folio',
        'reference', p_reference
      );
    end if;
  end if;

  -- Safeguard 3: Prevent rapid duplicate payments (same amount and method within 30 seconds)
  if exists(
    select 1 from folio_payments
    where folio_id = p_folio_id
      and amount = p_amount
      and payment_method = p_payment_method
      and is_voided = false
      and created_at > v_now - interval '30 seconds'
  ) then
    return jsonb_build_object(
      'success', false,
      'error', 'Duplicate payment detected (same amount and method within 30 seconds)',
      'suggestion', 'Please wait before submitting another payment or verify if payment was already processed'
    );
  end if;

  -- Validate bank_account_id if provided
  if p_bank_account_id is not null then
    if not exists (select 1 from bank_accounts where id = p_bank_account_id and is_active = true) then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Insert the payment
  insert into folio_payments (
    id,
    folio_id,
    amount,
    payment_method,
    reference_number,
    user_id,
    receipt_url,
    bank_account_id,
    created_at
  ) values (
    gen_random_uuid()::text,
    p_folio_id,
    p_amount,
    p_payment_method,
    p_reference,
    p_user_id,
    p_receipt_url,
    p_bank_account_id,
    v_now
  ) returning id into v_payment_id;

  -- Store idempotency key if provided
  if p_idempotency_key is not null then
    insert into payment_idempotency (
      idempotency_key,
      folio_id,
      amount,
      payment_method,
      processed_payment_id,
      created_at,
      expires_at
    ) values (
      p_idempotency_key,
      p_folio_id,
      p_amount,
      p_payment_method,
      v_payment_id,
      v_now,
      v_now + interval '24 hours'
    );
  end if;

  -- Return success
  return jsonb_build_object(
    'success', true,
    'folioId', p_folio_id,
    'paymentId', v_payment_id,
    'amount', p_amount,
    'paymentMethod', p_payment_method
  );
end;
$$;

-- Grant execute permission to authenticated users
grant execute on function post_folio_payment to authenticated;
