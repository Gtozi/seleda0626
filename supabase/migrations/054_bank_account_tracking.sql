-- ============================================================
-- Bank Account Tracking for Sales and Expenses
-- ============================================================
-- This migration adds comprehensive bank account tracking to track
-- which bank account receives payments (sales) and which bank account 
-- pays for expenses

-- 1. Create bank_accounts table to store structured bank account data
CREATE TABLE IF NOT EXISTS bank_accounts (
  id text PRIMARY KEY,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  account_number text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('Checking', 'Savings', 'Current', 'Business', 'Corporate')),
  currency text NOT NULL DEFAULT 'ETB',
  is_active boolean NOT NULL DEFAULT true,
  is_default_for_sales boolean NOT NULL DEFAULT false,
  is_default_for_expenses boolean NOT NULL DEFAULT false,
  swift_bic_code text,
  branch_name text,
  branch_address text,
  description text,
  opening_balance numeric NOT NULL DEFAULT 0.00,
  current_balance numeric NOT NULL DEFAULT 0.00,
  created_by text REFERENCES system_users(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(account_number, bank_name)
);

-- Create indexes for bank_accounts
CREATE INDEX IF NOT EXISTS idx_bank_accounts_is_active ON bank_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_type ON bank_accounts(account_type);
CREATE INDEX IF NOT EXISTS idx_bank_accounts_defaults ON bank_accounts(is_default_for_sales, is_default_for_expenses);

-- Enable RLS on bank_accounts
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;

-- Policy: authenticated users can read bank accounts
DROP POLICY IF EXISTS "bank_accounts_read" ON bank_accounts;
CREATE POLICY "bank_accounts_read" ON bank_accounts FOR SELECT TO authenticated USING (true);

-- Policy: only finance/admin users can insert/update/delete bank accounts
DROP POLICY IF EXISTS "bank_accounts_write" ON bank_accounts;
CREATE POLICY "bank_accounts_write" ON bank_accounts FOR ALL TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM system_users 
    WHERE system_users.id = auth.uid()::text 
    AND (system_users.role IN ('Admin', 'Finance Manager', 'General Manager') 
         OR system_users.department = 'Finance')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM system_users 
    WHERE system_users.id = auth.uid()::text 
    AND (system_users.role IN ('Admin', 'Finance Manager', 'General Manager') 
         OR system_users.department = 'Finance')
  )
);

-- 2. Add bank_account_id to folio_payments for sales tracking
ALTER TABLE folio_payments 
ADD COLUMN IF NOT EXISTS bank_account_id text REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Create index for bank_account_id in folio_payments
CREATE INDEX IF NOT EXISTS idx_folio_payments_bank_account ON folio_payments(bank_account_id);

-- 3. Add bank_account_id to expense_requests for expense tracking
ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS bank_account_id text REFERENCES bank_accounts(id) ON DELETE SET NULL;

-- Create index for bank_account_id in expense_requests
CREATE INDEX IF NOT EXISTS idx_expense_requests_bank_account ON expense_requests(bank_account_id);

-- Add payment_date to expense_requests if it doesn't exist (for tracking when expense was paid)
ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS payment_date date;

ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS payment_method text;

ALTER TABLE expense_requests 
ADD COLUMN IF NOT EXISTS payment_reference text;

-- 4. Update post_folio_payment function to accept bank_account_id
DROP FUNCTION IF EXISTS post_folio_payment(text, numeric, text, text, text, text, text);

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

  -- Validate bank_account_id if provided
  if p_bank_account_id is not null then
    if not exists (select 1 from bank_accounts where id = p_bank_account_id and is_active = true) then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Insert payment with receipt URL and bank account
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url, bank_account_id
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url, p_bank_account_id
  ) returning id into v_existing_idempotency.processed_payment_id;

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update bank account balance if bank_account_id provided (for sales/revenue)
  if p_bank_account_id is not null then
    update bank_accounts
    set current_balance = current_balance + p_amount,
        updated_at = v_now
    where id = p_bank_account_id;
  end if;

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
      'idempotencyKey', p_idempotency_key,
      'bankAccountId', p_bank_account_id
    )
  );

  return jsonb_build_object('success', true, 'folioId', p_folio_id, 'paymentId', v_existing_idempotency.processed_payment_id, 'newBalance', v_folio.balance - p_amount);
end;
$$;

-- 5. Create function to update expense payment with bank account tracking
CREATE OR REPLACE FUNCTION update_expense_payment(
  p_expense_id text,
  p_bank_account_id text,
  p_payment_method text,
  p_payment_reference text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_expense expense_requests%rowtype;
  v_now timestamp with time zone := now();
begin
  -- Lock and validate expense
  select * into v_expense
  from expense_requests
  where id = p_expense_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Expense request not found');
  end if;

  if v_expense.status != 'Approved' then
    return jsonb_build_object('success', false, 'error', 'Expense must be approved before payment');
  end if;

  -- Validate bank_account_id
  if p_bank_account_id is not null then
    if not exists (select 1 from bank_accounts where id = p_bank_account_id and is_active = true) then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Update expense with payment details
  update expense_requests
  set 
    bank_account_id = p_bank_account_id,
    payment_date = v_now::date,
    payment_method = p_payment_method,
    payment_reference = p_payment_reference,
    status = 'Paid'
  where id = p_expense_id;

  -- Update bank account balance (deduct for expenses)
  if p_bank_account_id is not null then
    update bank_accounts
    set current_balance = current_balance - v_expense.amount,
        updated_at = v_now
    where id = p_bank_account_id;
  end if;

  -- Audit
  insert into audit_events (id, user_id, action, entity_type, entity_id, module, details)
  values (
    gen_random_uuid()::text, p_user_id, 'expense.payment', 'expense_request', p_expense_id, 'finance',
    jsonb_build_object(
      'amount', v_expense.amount,
      'paymentMethod', p_payment_method,
      'paymentReference', p_payment_reference,
      'bankAccountId', p_bank_account_id
    )
  );

  return jsonb_build_object('success', true, 'expenseId', p_expense_id, 'status', 'Paid');
end;
$$;

-- 6. Create function to get bank account transaction summary
CREATE OR REPLACE FUNCTION get_bank_account_summary(p_bank_account_id text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_bank_account bank_accounts%rowtype;
  v_total_incoming numeric;
  v_total_outgoing numeric;
  v_transaction_count integer;
begin
  -- Get bank account details
  select * into v_bank_account
  from bank_accounts
  where id = p_bank_account_id;

  if not found then
    return jsonb_build_object('success', false, 'error', 'Bank account not found');
  end if;

  -- Calculate total incoming (sales/payments received)
  select coalesce(sum(amount), 0) into v_total_incoming
  from folio_payments
  where bank_account_id = p_bank_account_id and is_voided = false;

  -- Calculate total outgoing (expenses paid)
  select coalesce(sum(amount), 0) into v_total_outgoing
  from expense_requests
  where bank_account_id = p_bank_account_id and status = 'Paid';

  -- Count total transactions
  select 
    (select count(*) from folio_payments where bank_account_id = p_bank_account_id and is_voided = false) +
    (select count(*) from expense_requests where bank_account_id = p_bank_account_id and status = 'Paid')
  into v_transaction_count;

  return jsonb_build_object(
    'success', true,
    'bankAccount', jsonb_build_object(
      'id', v_bank_account.id,
      'accountName', v_bank_account.account_name,
      'bankName', v_bank_account.bank_name,
      'accountNumber', v_bank_account.account_number,
      'accountType', v_bank_account.account_type,
      'currency', v_bank_account.currency,
      'currentBalance', v_bank_account.current_balance,
      'isActive', v_bank_account.is_active
    ),
    'summary', jsonb_build_object(
      'totalIncoming', v_total_incoming,
      'totalOutgoing', v_total_outgoing,
      'netFlow', v_total_incoming - v_total_outgoing,
      'transactionCount', v_transaction_count
    )
  );
end;
$$;

-- 7. Grant execute permissions
GRANT EXECUTE ON FUNCTION post_folio_payment TO authenticated;
GRANT EXECUTE ON FUNCTION update_expense_payment TO authenticated;
GRANT EXECUTE ON FUNCTION get_bank_account_summary TO authenticated;

-- 8. Add helpful comment
COMMENT ON TABLE bank_accounts IS 'Stores bank account information for tracking sales receipts and expense payments';
COMMENT ON COLUMN folio_payments.bank_account_id IS 'References which bank account received this payment';
COMMENT ON COLUMN expense_requests.bank_account_id IS 'References which bank account was used to pay this expense';
