-- ============================================================
-- USALI COA Integration for Bank Account Tracking
-- ============================================================
-- This migration integrates the bank_accounts table with the Chart of Accounts
-- system following USALI (Uniform System of Accounts for the Lodging Industry) standards
-- and implements proper double-entry posting for bank transactions.

-- 1. Add coa_account_code field to bank_accounts to link with Chart of Accounts
ALTER TABLE bank_accounts 
ADD COLUMN IF NOT EXISTS coa_account_code text REFERENCES chart_of_accounts(code) ON DELETE SET NULL;

-- 2. Add department field for USALI departmental tagging
ALTER TABLE bank_accounts
ADD COLUMN IF NOT EXISTS department text DEFAULT 'Finance';

-- 3. Update Chart of Accounts table to support department field if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chart_of_accounts' 
    AND column_name = 'department'
  ) THEN
    ALTER TABLE chart_of_accounts ADD COLUMN department text;
  END IF;
END $$;

-- 4. Update bank_accounts to align with USALI asset account numbering (1000-1999 range)
-- Create a function to auto-assign COA account codes if not provided
CREATE OR REPLACE FUNCTION assign_coa_account_code()
RETURNS trigger AS $$
DECLARE
  v_account_type text;
BEGIN
  -- Only assign if coa_account_code is null
  IF NEW.coa_account_code IS NULL THEN
    -- Determine account type based on account_type
    CASE NEW.account_type
      WHEN 'Checking' THEN v_account_type := '1020';
      WHEN 'Savings' THEN v_account_type := '1030';
      WHEN 'Business' THEN v_account_type := '1040';
      WHEN 'Corporate' THEN v_account_type := '1050';
      WHEN 'Current' THEN v_account_type := '1060';
      ELSE v_account_type := '1010';
    END CASE;

    NEW.coa_account_code := v_account_type;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger to auto-assign COA account codes
DROP TRIGGER IF EXISTS assign_coa_code_trigger ON bank_accounts;
CREATE TRIGGER assign_coa_code_trigger
  BEFORE INSERT ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION assign_coa_account_code();

-- 6. Ensure Chart of Accounts has proper USALI structure for bank accounts
-- Insert standard bank account COA codes if they don't exist
INSERT INTO chart_of_accounts (id, code, name, category, sub_category, balance, currency, is_active)
VALUES 
  (gen_random_uuid()::text, '1010', 'Petty Cash', 'Asset', 'Cash', 0, 'ETB', true),
  (gen_random_uuid()::text, '1020', 'Bank - CBE', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1030', 'Bank - Awash', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1040', 'Bank - Business Checking', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1050', 'Bank - Corporate', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1060', 'Bank - Current Account', 'Asset', 'Bank', 0, 'ETB', true),
  (gen_random_uuid()::text, '1100', 'Accounts Receivable - Guests', 'Asset', 'Receivable', 0, 'ETB', true),
  (gen_random_uuid()::text, '1101', 'Accounts Receivable - Corporate', 'Asset', 'Receivable', 0, 'ETB', true),
  (gen_random_uuid()::text, '1200', 'VAT Receivable', 'Asset', 'Receivable', 0, 'ETB', true)
ON CONFLICT (code) DO NOTHING;

-- 7. Add proper USALI revenue and expense accounts if they don't exist
INSERT INTO chart_of_accounts (id, code, name, category, sub_category, department, balance, currency, is_active)
VALUES 
  -- Revenue Accounts (4000-4999 range)
  (gen_random_uuid()::text, '4010', 'Room Revenue', 'Revenue', 'Rooms', 'Rooms', 0, 'ETB', true),
  (gen_random_uuid()::text, '4020', 'F&B Revenue - Restaurant', 'Revenue', 'Food & Beverage', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '4030', 'F&B Revenue - Bar', 'Revenue', 'Food & Beverage', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '4040', 'Other Operated Departments', 'Revenue', 'Other', 'Other', 0, 'ETB', true),
  (gen_random_uuid()::text, '4050', 'Miscellaneous Revenue', 'Revenue', 'Other', 'Other', 0, 'ETB', true),
  
  -- Expense Accounts (5000-5999 range)
  (gen_random_uuid()::text, '5010', 'Cost of Food & Beverage', 'Expense', 'Cost of Sales', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '5020', 'Payroll - Rooms Department', 'Expense', 'Payroll', 'Rooms', 0, 'ETB', true),
  (gen_random_uuid()::text, '5030', 'Payroll - F&B Department', 'Expense', 'Payroll', 'F&B', 0, 'ETB', true),
  (gen_random_uuid()::text, '5040', 'Utilities', 'Expense', 'Operating', 'General', 0, 'ETB', true),
  (gen_random_uuid()::text, '5050', 'Repairs & Maintenance', 'Expense', 'Operating', 'General', 0, 'ETB', true),
  (gen_random_uuid()::text, '5090', 'General & Administrative', 'Expense', 'Operating', 'General', 0, 'ETB', true),
  
  -- Liability Accounts (2000-2999 range)
  (gen_random_uuid()::text, '2010', 'Accounts Payable - Suppliers', 'Liability', 'Payable', 'Finance', 0, 'ETB', true),
  (gen_random_uuid()::text, '2020', 'VAT Payable', 'Liability', 'Tax', 'Finance', 0, 'ETB', true),
  (gen_random_uuid()::text, '2030', 'Guest Deposits & Advances', 'Liability', 'Deposit', 'Front Office', 0, 'ETB', true),
  (gen_random_uuid()::text, '2040', 'Payroll Payable', 'Liability', 'Payable', 'HR', 0, 'ETB', true),
  
  -- Equity Accounts (3000-3999 range)
  (gen_random_uuid()::text, '3010', 'Owner''s Equity', 'Equity', 'Equity', 'Finance', 0, 'ETB', true),
  (gen_random_uuid()::text, '3020', 'Retained Earnings', 'Equity', 'Equity', 'Finance', 0, 'ETB', true)
ON CONFLICT (code) DO NOTHING;

-- 8. Update existing bank accounts to link with appropriate COA codes
UPDATE bank_accounts
SET coa_account_code = 
  CASE 
    WHEN bank_name ILIKE '%CBE%' THEN '1020'
    WHEN bank_name ILIKE '%Awash%' THEN '1030'
    WHEN account_type = 'Business' THEN '1040'
    WHEN account_type = 'Corporate' THEN '1050'
    WHEN account_type = 'Current' THEN '1060'
    ELSE '1010'
  END
WHERE coa_account_code IS NULL;

-- 9. Add helpful comments
COMMENT ON COLUMN bank_accounts.coa_account_code IS 'Links to Chart of Accounts code for proper double-entry posting';
COMMENT ON COLUMN bank_accounts.department IS 'USALI departmental tagging for reporting';
COMMENT ON TABLE chart_of_accounts IS 'Chart of Accounts following USALI hospitality accounting standards';

-- 10. Create function to sync bank account balance with COA
CREATE OR REPLACE FUNCTION sync_bank_account_balance()
RETURNS trigger AS $$
BEGIN
  -- When bank account balance changes, update corresponding COA account
  IF NEW.coa_account_code IS NOT NULL THEN
    UPDATE chart_of_accounts
    SET balance = NEW.current_balance
    WHERE code = NEW.coa_account_code;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to sync balances
DROP TRIGGER IF EXISTS sync_bank_balance_trigger ON bank_accounts;
CREATE TRIGGER sync_bank_balance_trigger
  AFTER UPDATE OF current_balance ON bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION sync_bank_account_balance();

-- 12. Grant execute permissions
GRANT EXECUTE ON FUNCTION assign_coa_account_code TO authenticated;
GRANT EXECUTE ON FUNCTION sync_bank_account_balance TO authenticated;

-- 13. Update post_folio_payment to create proper journal entries following USALI standards
DROP FUNCTION IF EXISTS post_folio_payment_with_journal_entry;

CREATE OR REPLACE FUNCTION post_folio_payment_with_journal_entry(
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
  v_payment_id text;
  v_bank_account bank_accounts%rowtype;
  v_vat_amount numeric;
  v_vat_rate numeric;
  v_journal_entry_id text;
  v_revenue_account_code text;
  v_vat_account_code text;
begin
  -- Get VAT rate from global settings (default 15% for Ethiopia)
  SELECT COALESCE(tax_percent, 15.0) / 100.0 INTO v_vat_rate
  FROM global_settings
  WHERE id = 'main';

  -- Calculate VAT portion
  v_vat_amount := p_amount * v_vat_rate;
  
  -- Get revenue account code from settings (default 4010 for Room Revenue)
  SELECT COALESCE(revenue_mappings->'roomRevenueAccount', '4010') INTO v_revenue_account_code
  FROM global_settings
  WHERE id = 'main';
  
  -- Get VAT payable account code (default 2020)
  v_vat_account_code := '2020';

  -- Idempotency check
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
        return jsonb_build_object(
          'success', true,
          'folioId', p_folio_id,
          'paymentId', v_existing_idempotency.processed_payment_id,
          'idempotent', true,
          'message', 'Payment already processed (idempotent request)'
        );
      else
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

  -- Calculate outstanding balance
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

  -- Safeguard 3: Check for duplicate reference
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

  -- Safeguard 4: Prevent rapid duplicate payments
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
      'error', 'Duplicate payment detected (same amount and method within 30 seconds)'
    );
  end if;

  -- Validate bank_account_id if provided
  if p_bank_account_id is not null then
    select * into v_bank_account
    from bank_accounts
    where id = p_bank_account_id and is_active = true;
    
    if not found then
      return jsonb_build_object('success', false, 'error', 'Invalid or inactive bank account');
    end if;
  end if;

  -- Insert payment
  insert into folio_payments (
    id, folio_id, amount, payment_method, reference_number, cashier_id, created_by, receipt_url, bank_account_id
  ) values (
    gen_random_uuid()::text, p_folio_id, p_amount, p_payment_method, p_reference, p_user_id, p_user_id, p_receipt_url, p_bank_account_id
  ) returning id into v_payment_id;

  -- Update folio balance
  update folios
  set balance = balance - p_amount,
      total_payments = total_payments + p_amount,
      updated_at = v_now
  where id = p_folio_id;

  -- Update bank account balance if bank_account_id provided
  if p_bank_account_id is not null then
    update bank_accounts
    set current_balance = current_balance + p_amount,
        updated_at = v_now
    where id = p_bank_account_id;
  end if;

  -- Create journal entry following USALI double-entry standards
  -- Debit: Bank Account (if specified) or Accounts Receivable
  -- Credit: Revenue Account + VAT Payable
  v_journal_entry_id := gen_random_uuid()::text;
  
  insert into journal_entries (
    id, date, reference, description, status, created_by, amount, department
  ) values (
    v_journal_entry_id, 
    v_now::date, 
    'FOLIO-PAY-' || v_payment_id,
    'Folio Payment - Room ' || v_folio.reservation_id,
    'Posted',
    p_user_id,
    p_amount,
    'Rooms'
  );

  -- Debit leg: Bank account or Accounts Receivable
  insert into journal_lines (
    id, journal_id, account_id, account_name, description, debit, credit
  ) values (
    gen_random_uuid()::text,
    v_journal_entry_id,
    COALESCE(v_bank_account.coa_account_code, '1100'),
    COALESCE(v_bank_account.bank_name, 'Accounts Receivable'),
    'Payment received for folio ' || p_folio_id,
    p_amount,
    0
  );

  -- Credit leg: Revenue account (excluding VAT)
  insert into journal_lines (
    id, journal_id, account_id, account_name, description, debit, credit
  ) values (
    gen_random_uuid()::text,
    v_journal_entry_id,
    v_revenue_account_code,
    'Room Revenue',
    'Room revenue from folio ' || p_folio_id,
    0,
    p_amount - v_vat_amount
  );

  -- Credit leg: VAT Payable
  insert into journal_lines (
    id, journal_id, account_id, account_name, description, debit, credit
  ) values (
    gen_random_uuid()::text,
    v_journal_entry_id,
    v_vat_account_code,
    'VAT Payable',
    'VAT on folio payment ' || p_folio_id,
    0,
    v_vat_amount
  );

  -- Update Chart of Accounts balances
  -- Debit bank/AR increases balance, Credit revenue/VAT decreases balance
  update chart_of_accounts
  set balance = balance + p_amount
  where code = COALESCE(v_bank_account.coa_account_code, '1100');

  update chart_of_accounts
  set balance = balance - (p_amount - v_vat_amount)
  where code = v_revenue_account_code;

  update chart_of_accounts
  set balance = balance - v_vat_amount
  where code = v_vat_account_code;

  -- Update reservation payment status
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
      p_idempotency_key, p_folio_id, p_amount, p_payment_method, v_payment_id, p_user_id
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
      'bankAccountId', p_bank_account_id,
      'journalEntryId', v_journal_entry_id,
      'vatAmount', v_vat_amount,
      'coaAccountCode', v_bank_account.coa_account_code
    )
  );

  return jsonb_build_object(
    'success', true, 
    'folioId', p_folio_id, 
    'paymentId', v_payment_id,
    'journalEntryId', v_journal_entry_id,
    'newBalance', v_folio.balance - p_amount,
    'vatAmount', v_vat_amount
  );
end;
$$;

-- 14. Grant execute permission for the new function
GRANT EXECUTE ON FUNCTION post_folio_payment_with_journal_entry TO authenticated;
