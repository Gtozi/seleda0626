-- ============================================================
-- Finance & Accounting Portal - Core Architecture
-- ============================================================
-- This migration creates the complete finance system architecture
-- following USALI standards and Ethiopian statutory requirements

-- 1. Enhance existing usali_chart_of_accounts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'normal_balance') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN normal_balance text CHECK (normal_balance IN ('Debit', 'Credit'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'currency') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN currency text DEFAULT 'ETB';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'is_control_account') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN is_control_account boolean DEFAULT false;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'usali_chart_of_accounts' AND column_name = 'balance') THEN
    ALTER TABLE usali_chart_of_accounts ADD COLUMN balance numeric(18,2) DEFAULT 0;
  END IF;
END $$;

UPDATE usali_chart_of_accounts SET normal_balance = 'Debit' WHERE account_type IN ('Asset', 'Expense') AND normal_balance IS NULL;
UPDATE usali_chart_of_accounts SET normal_balance = 'Credit' WHERE account_type IN ('Liability', 'Equity', 'Revenue') AND normal_balance IS NULL;

-- 2. General Ledger - Journal Entries
CREATE TABLE IF NOT EXISTS journal_entries (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  date date NOT NULL,
  period text NOT NULL,
  source text NOT NULL CHECK (source IN ('Manual', 'AP', 'AR', 'POS', 'PMS', 'Payroll', 'Bank', 'System')),
  reference text,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Posted', 'Reversed')),
  total_debit numeric(18,2) NOT NULL DEFAULT 0,
  total_credit numeric(18,2) NOT NULL DEFAULT 0,
  department text,
  created_by text REFERENCES system_users(id) ON DELETE SET NULL,
  approved_by text REFERENCES system_users(id) ON DELETE SET NULL,
  posted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_entries_period ON journal_entries(period);
CREATE INDEX idx_journal_entries_status ON journal_entries(status);
CREATE INDEX idx_journal_entries_date ON journal_entries(date);

-- 3. General Ledger - Journal Lines
CREATE TABLE IF NOT EXISTS journal_lines (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  journal_id text NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_code text NOT NULL REFERENCES usali_chart_of_accounts(code),
  account_name text NOT NULL,
  description text,
  debit numeric(18,2) NOT NULL DEFAULT 0,
  credit numeric(18,2) NOT NULL DEFAULT 0,
  currency text DEFAULT 'ETB',
  exchange_rate numeric(12,6) DEFAULT 1.0,
  cost_center text,
  tax_code text,
  memo text,
  line_number integer,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_journal_lines_journal_id ON journal_lines(journal_id);
CREATE INDEX idx_journal_lines_account_code ON journal_lines(account_code);
