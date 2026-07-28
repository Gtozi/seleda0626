-- ============================================================
-- Finance & Accounting - Accounts Payable
-- ============================================================

CREATE TABLE IF NOT EXISTS vendors (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name text NOT NULL,
  contact_name text,
  email text,
  phone text,
  address text,
  tax_id text,
  withholding_rate numeric(5,2) DEFAULT 0,
  category text DEFAULT 'Operations',
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Hold')),
  balance numeric(18,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);

CREATE TABLE IF NOT EXISTS ap_bills (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vendor_id text NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  invoice_number text NOT NULL,
  invoice_date date NOT NULL,
  due_date date NOT NULL,
  category text,
  amount numeric(18,2) NOT NULL DEFAULT 0,
  tax_amount numeric(18,2) NOT NULL DEFAULT 0,
  withholding_amount numeric(18,2) NOT NULL DEFAULT 0,
  net_payable numeric(18,2) NOT NULL DEFAULT 0,
  amount_due numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partially Paid', 'Paid', 'Overdue', 'Voided')),
  lines jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ap_bills_vendor_id ON ap_bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_ap_bills_status ON ap_bills(status);
CREATE INDEX IF NOT EXISTS idx_ap_bills_due_date ON ap_bills(due_date);

CREATE TABLE IF NOT EXISTS ap_payments (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bill_id text NOT NULL REFERENCES ap_bills(id) ON DELETE RESTRICT,
  vendor_id text NOT NULL REFERENCES vendors(id) ON DELETE RESTRICT,
  amount numeric(18,2) NOT NULL DEFAULT 0,
  payment_date date NOT NULL,
  payment_method text,
  reference text,
  status text NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Voided', 'Scheduled')),
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'bill_id') THEN
    ALTER TABLE ap_payments ADD COLUMN bill_id text REFERENCES ap_bills(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'vendor_id') THEN
    ALTER TABLE ap_payments ADD COLUMN vendor_id text REFERENCES vendors(id) ON DELETE RESTRICT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'amount') THEN
    ALTER TABLE ap_payments ADD COLUMN amount numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'payment_date') THEN
    ALTER TABLE ap_payments ADD COLUMN payment_date date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'payment_method') THEN
    ALTER TABLE ap_payments ADD COLUMN payment_method text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'reference') THEN
    ALTER TABLE ap_payments ADD COLUMN reference text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'status') THEN
    ALTER TABLE ap_payments ADD COLUMN status text NOT NULL DEFAULT 'Completed' CHECK (status IN ('Completed', 'Voided', 'Scheduled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ap_payments' AND column_name = 'created_at') THEN
    ALTER TABLE ap_payments ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ap_payments_bill_id ON ap_payments(bill_id);
CREATE INDEX IF NOT EXISTS idx_ap_payments_vendor_id ON ap_payments(vendor_id);

-- Trigger to update vendor balance and bill status when a payment is recorded
CREATE OR REPLACE FUNCTION record_ap_payment(
  p_bill_id text,
  p_amount numeric,
  p_payment_date date,
  p_payment_method text,
  p_reference text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_vendor_id text;
  v_amount_due numeric;
  v_new_status text;
  v_payment_id text;
BEGIN
  SELECT vendor_id, amount_due INTO v_vendor_id, v_amount_due
  FROM ap_bills WHERE id = p_bill_id FOR UPDATE;

  IF v_vendor_id IS NULL THEN
    RAISE EXCEPTION 'Bill not found';
  END IF;

  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Payment amount must be positive';
  END IF;

  IF p_amount > v_amount_due THEN
    RAISE EXCEPTION 'Payment amount exceeds amount due';
  END IF;

  v_payment_id := gen_random_uuid()::text;

  INSERT INTO ap_payments (id, bill_id, vendor_id, amount, payment_date, payment_method, reference)
  VALUES (v_payment_id, p_bill_id, v_vendor_id, p_amount, p_payment_date, p_payment_method, p_reference);

  UPDATE ap_bills
  SET amount_due = amount_due - p_amount,
      status = CASE
        WHEN amount_due - p_amount <= 0 THEN 'Paid'
        ELSE 'Partially Paid'
      END,
      updated_at = now()
  WHERE id = p_bill_id
  RETURNING status INTO v_new_status;

  UPDATE vendors
  SET balance = balance - p_amount,
      updated_at = now()
  WHERE id = v_vendor_id;

  RETURN jsonb_build_object('payment_id', v_payment_id, 'status', v_new_status);
END;
$$;

CREATE OR REPLACE FUNCTION increment_vendor_balance(
  p_vendor_id text,
  p_delta numeric
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE vendors
  SET balance = balance + p_delta,
      updated_at = now()
  WHERE id = p_vendor_id;
END;
$$;
