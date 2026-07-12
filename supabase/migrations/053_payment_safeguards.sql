-- ============================================================
-- Payment Safeguards: Prevent duplicate and extra payments on folios
-- ============================================================

-- 1. Add unique constraint on reference_number per folio to prevent duplicate references
-- Note: Allow NULL reference numbers (cash payments typically don't have references)
ALTER TABLE folio_payments
DROP CONSTRAINT IF EXISTS folio_payments_reference_folio_unique;

CREATE UNIQUE INDEX folio_payments_reference_folio_idx 
ON folio_payments(folio_id, reference_number) 
WHERE reference_number IS NOT NULL AND is_voided = false;

-- 2. Add idempotency tracking for payment operations
CREATE TABLE IF NOT EXISTS payment_idempotency (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL UNIQUE,
  folio_id text NOT NULL,
  amount numeric NOT NULL,
  payment_method text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '24 hours',
  processed_payment_id text,
  created_by text
);

CREATE INDEX idx_payment_idempotency_key ON payment_idempotency(idempotency_key);
CREATE INDEX idx_payment_idempotency_expires ON payment_idempotency(expires_at);

-- 3. Update post_folio_payment function with comprehensive safeguards
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN 
    SELECT oid FROM pg_proc WHERE proname = 'post_folio_payment'
  LOOP
    EXECUTE 'DROP FUNCTION ' || func_record.oid::regprocedure || ' CASCADE';
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION post_folio_payment(
  p_folio_id text,
  p_amount numeric,
  p_payment_method text,
  p_reference text,
  p_user_id text,
  p_receipt_url text default null,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_folio folios%rowtype;
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
  select coalesce(sum(amount), 0) into v_outstanding_balance
  from folio_lines
  where folio_id = p_folio_id and is_voided = false;

  v_outstanding_balance := v_outstanding_balance - (
    select coalesce(sum(amount), 0)
    from folio_payments
    where folio_id = p_folio_id and is_voided = false
  );

  -- Safeguard 1: Prevent overpayment
  if p_amount > v_outstanding_balance then
    return jsonb_build_object(
      'success', false,
      'error', 'Payment amount exceeds outstanding balance',
      'outstandingBalance', v_outstanding_balance,
      'requestedAmount', p_amount
    );
  end if;

  -- Safeguard 2: Prevent negative payments
  if p_amount <= 0 then
    return jsonb_build_object('success', false, 'error', 'Payment amount must be positive');
  end if;

  -- Safeguard 3: Check for duplicate reference number within the same folio
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

  -- Safeguard 4: Prevent rapid duplicate payments (same amount and method within 30 seconds)
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

  -- Insert payment with receipt URL
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url
  ) returning id into v_existing_idempotency.processed_payment_id;

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

  -- Record idempotency key if provided
  if p_idempotency_key is not null then
    insert into payment_idempotency (
      idempotency_key, folio_id, amount, payment_method, processed_payment_id, created_by
    ) values (
      p_idempotency_key, p_folio_id, p_amount, p_payment_method, v_existing_idempotency.processed_payment_id, p_user_id
    );
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'folio.payment.add', 'folio', p_folio_id, 'frontoffice',
    jsonb_build_object(
      'amount', p_amount, 
      'method', p_payment_method, 
      'receiptUrl', p_receipt_url,
      'reference', p_reference,
      'idempotencyKey', p_idempotency_key
    )
  );

  return jsonb_build_object('success', true, 'folioId', p_folio_id, 'paymentId', v_existing_idempotency.processed_payment_id, 'newBalance', v_folio.balance - p_amount);
end;
$$;

-- 4. Create function to clean up expired idempotency keys (run periodically)
DROP FUNCTION IF EXISTS cleanup_expired_idempotency();
CREATE OR REPLACE FUNCTION cleanup_expired_idempotency()
returns void
language plpgsql
as $$
begin
  delete from payment_idempotency
  where expires_at < now();
  
  -- Log cleanup
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, 'system', 'idempotency.cleanup', 'payment_idempotency', null, 'system',
    jsonb_build_object('timestamp', now())
  );
end;
$$;

-- 5. Enable RLS on payment_idempotency
ALTER TABLE payment_idempotency ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff_payment_idempotency" ON payment_idempotency;
CREATE POLICY "staff_payment_idempotency"
  ON payment_idempotency FOR ALL TO authenticated USING (TRUE) WITH CHECK (TRUE);

GRANT EXECUTE ON FUNCTION post_folio_payment TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_idempotency TO authenticated;
