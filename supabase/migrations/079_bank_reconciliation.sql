-- ============================================================
-- Finance & Accounting - Bank Reconciliation
-- ============================================================

CREATE TABLE IF NOT EXISTS bank_accounts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  account_number text NOT NULL UNIQUE,
  account_name text NOT NULL,
  bank_name text NOT NULL,
  currency text DEFAULT 'ETB',
  balance numeric(18,2) NOT NULL DEFAULT 0,
  last_reconciled_date date,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Closed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'account_number') THEN
    ALTER TABLE bank_accounts ADD COLUMN account_number text NOT NULL UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'account_name') THEN
    ALTER TABLE bank_accounts ADD COLUMN account_name text NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'bank_name') THEN
    ALTER TABLE bank_accounts ADD COLUMN bank_name text NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'currency') THEN
    ALTER TABLE bank_accounts ADD COLUMN currency text DEFAULT 'ETB';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'balance') THEN
    ALTER TABLE bank_accounts ADD COLUMN balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'last_reconciled_date') THEN
    ALTER TABLE bank_accounts ADD COLUMN last_reconciled_date date;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'status') THEN
    ALTER TABLE bank_accounts ADD COLUMN status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Closed'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'created_at') THEN
    ALTER TABLE bank_accounts ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_accounts' AND column_name = 'updated_at') THEN
    ALTER TABLE bank_accounts ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bank_accounts_status ON bank_accounts(status);

CREATE TABLE IF NOT EXISTS bank_statement_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bank_account_id text NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  statement_date date NOT NULL,
  transaction_date date NOT NULL,
  description text,
  reference text,
  debit numeric(18,2) NOT NULL DEFAULT 0,
  credit numeric(18,2) NOT NULL DEFAULT 0,
  balance numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Unmatched' CHECK (status IN ('Unmatched', 'Matched', 'Partially Matched', 'Excluded')),
  matched_journal_line_id text,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'bank_account_id') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN bank_account_id text REFERENCES bank_accounts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'statement_date') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN statement_date date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'transaction_date') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN transaction_date date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'description') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN description text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'reference') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN reference text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'debit') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN debit numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'credit') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN credit numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'balance') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'status') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN status text NOT NULL DEFAULT 'Unmatched' CHECK (status IN ('Unmatched', 'Matched', 'Partially Matched', 'Excluded'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'matched_journal_line_id') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN matched_journal_line_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bank_statement_lines' AND column_name = 'created_at') THEN
    ALTER TABLE bank_statement_lines ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_account_id ON bank_statement_lines(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_status ON bank_statement_lines(status);
CREATE INDEX IF NOT EXISTS idx_bank_statement_lines_date ON bank_statement_lines(statement_date);

CREATE TABLE IF NOT EXISTS reconciliation_batches (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  bank_account_id text NOT NULL REFERENCES bank_accounts(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  opening_balance numeric(18,2) NOT NULL DEFAULT 0,
  closing_balance numeric(18,2) NOT NULL DEFAULT 0,
  total_debits numeric(18,2) NOT NULL DEFAULT 0,
  total_credits numeric(18,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Completed', 'Cancelled')),
  reconciled_by text,
  reconciled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Add missing columns if table already exists (for idempotency)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'bank_account_id') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN bank_account_id text REFERENCES bank_accounts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'period_start') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN period_start date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'period_end') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN period_end date NOT NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'opening_balance') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN opening_balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'closing_balance') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN closing_balance numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'total_debits') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN total_debits numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'total_credits') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN total_credits numeric(18,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'status') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Completed', 'Cancelled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'reconciled_by') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN reconciled_by text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'reconciled_at') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN reconciled_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reconciliation_batches' AND column_name = 'created_at') THEN
    ALTER TABLE reconciliation_batches ADD COLUMN created_at timestamptz DEFAULT now();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_reconciliation_batches_account_id ON reconciliation_batches(bank_account_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_batches_status ON reconciliation_batches(status);
CREATE INDEX IF NOT EXISTS idx_reconciliation_batches_period ON reconciliation_batches(period_start, period_end);

-- Function to import statement lines
CREATE OR REPLACE FUNCTION import_bank_statement_lines(
  p_bank_account_id text,
  p_lines jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_imported_count int := 0;
  v_line jsonb;
BEGIN
  FOREACH v_line IN ARRAY p_lines
  LOOP
    INSERT INTO bank_statement_lines (
      bank_account_id,
      statement_date,
      transaction_date,
      description,
      reference,
      debit,
      credit,
      balance
    ) VALUES (
      p_bank_account_id,
      (v_line->>'statement_date')::date,
      (v_line->>'transaction_date')::date,
      v_line->>'description',
      v_line->>'reference',
      COALESCE((v_line->>'debit')::numeric, 0),
      COALESCE((v_line->>'credit')::numeric, 0),
      COALESCE((v_line->>'balance')::numeric, 0)
    );
    v_imported_count := v_imported_count + 1;
  END LOOP;

  RETURN jsonb_build_object('imported_count', v_imported_count);
END;
$$;

-- Function to match statement line to journal line
CREATE OR REPLACE FUNCTION match_statement_line(
  p_statement_line_id text,
  p_journal_line_id text
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE bank_statement_lines
  SET status = 'Matched',
      matched_journal_line_id = p_journal_line_id
  WHERE id = p_statement_line_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
