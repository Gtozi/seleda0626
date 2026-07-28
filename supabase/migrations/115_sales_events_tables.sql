-- Migration 115: Sales & Events — Corporate Accounts, Leads, Proposals, Contracts, Group Blocks
-- Step 5.6 — Sales & Events Completion

-- =============================================================
-- 1. Corporate Accounts table
--    Centralized corporate account master with credit terms
-- =============================================================

CREATE TABLE IF NOT EXISTS public.corporate_accounts (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  discount_percent numeric NOT NULL DEFAULT 0.00,
  active_bookings integer NOT NULL DEFAULT 0,
  unpaid_balance numeric NOT NULL DEFAULT 0.00,
  credit_limit numeric DEFAULT 0,
  credit_terms text DEFAULT 'Net 30',
  billing_address text,
  tax_id text,
  industry text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 2. Sales Leads table
--    Pipeline CRM: prospect -> qualified -> proposal -> negotiation -> won/lost
-- =============================================================

CREATE TABLE IF NOT EXISTS public.sales_leads (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  lead_number text,
  lead_name text NOT NULL,
  company text,
  contact_person text,
  contact_email text,
  contact_phone text,
  source text DEFAULT 'Direct',
  stage text DEFAULT 'Prospect',
  opportunity_value numeric DEFAULT 0,
  expected_close_date date,
  assigned_to text,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  priority text DEFAULT 'Medium',
  notes text,
  conversion_date date,
  lost_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 3. Sales Proposals table
--    Generated from leads, converted to contracts on acceptance
-- =============================================================

CREATE TABLE IF NOT EXISTS public.sales_proposals (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  proposal_number text,
  lead_id text REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_type text,
  event_dates text,
  guest_count integer DEFAULT 0,
  room_nights integer DEFAULT 0,
  proposed_revenue numeric DEFAULT 0,
  discount_percent numeric DEFAULT 0,
  terms_conditions text,
  status text DEFAULT 'Draft',
  valid_until date,
  sent_date date,
  accepted_date date,
  rejected_date date,
  contract_id text,
  notes text,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 4. Sales Contracts table
--    Created when a proposal is accepted; links to BEO and group block
-- =============================================================

CREATE TABLE IF NOT EXISTS public.sales_contracts (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  contract_number text,
  proposal_id text REFERENCES public.sales_proposals(id) ON DELETE SET NULL,
  lead_id text REFERENCES public.sales_leads(id) ON DELETE SET NULL,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  title text NOT NULL,
  event_type text,
  start_date date,
  end_date date,
  guest_count integer DEFAULT 0,
  room_nights integer DEFAULT 0,
  total_value numeric DEFAULT 0,
  deposit_amount numeric DEFAULT 0,
  deposit_paid boolean DEFAULT false,
  status text DEFAULT 'Active',
  group_block_id text,
  beo_id text REFERENCES public.banquet_events(id) ON DELETE SET NULL,
  terms text,
  signed_by_client text,
  signed_date date,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 5. Group Blocks table
--    Room inventory blocks tied to contracts
-- =============================================================

CREATE TABLE IF NOT EXISTS public.group_blocks (
  id text DEFAULT gen_random_uuid()::text PRIMARY KEY,
  block_name text NOT NULL,
  contract_id text REFERENCES public.sales_contracts(id) ON DELETE SET NULL,
  corporate_account_id text REFERENCES public.corporate_accounts(id) ON DELETE SET NULL,
  arrival_date date,
  departure_date date,
  total_rooms integer DEFAULT 0,
  blocked_rooms integer DEFAULT 0,
  picked_up_rooms integer DEFAULT 0,
  room_type text,
  rate numeric DEFAULT 0,
  status text DEFAULT 'Open',
  cutoff_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =============================================================
-- 6. Create group block from contract function
--    Auto-creates a group block when a contract is signed
-- =============================================================

CREATE OR REPLACE FUNCTION public.create_group_block_from_contract(p_contract_id text)
RETURNS TABLE(block_id text, block_name text) AS $$
DECLARE
  v_contract record;
  v_block_id text;
BEGIN
  SELECT * INTO v_contract FROM sales_contracts WHERE id = p_contract_id;
  IF NOT FOUND THEN RETURN; END IF;

  v_block_id := gen_random_uuid()::text;
  INSERT INTO group_blocks (id, block_name, contract_id, corporate_account_id,
    arrival_date, departure_date, total_rooms, blocked_rooms, room_type, rate, status)
  VALUES (
    v_block_id,
    v_contract.title || ' - Group Block',
    p_contract_id, v_contract.corporate_account_id,
    v_contract.start_date, v_contract.end_date,
    v_contract.room_nights, v_contract.room_nights,
    'Standard', v_contract.total_value / NULLIF(v_contract.room_nights, 0),
    'Open'
  );

  UPDATE sales_contracts SET group_block_id = v_block_id WHERE id = p_contract_id;

  RETURN QUERY SELECT v_block_id, v_contract.title || ' - Group Block';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================
-- 7. updated_at triggers
-- =============================================================

DROP TRIGGER IF EXISTS trg_corporate_accounts_updated_at ON public.corporate_accounts;
CREATE TRIGGER trg_corporate_accounts_updated_at
  BEFORE UPDATE ON public.corporate_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sales_leads_updated_at ON public.sales_leads;
CREATE TRIGGER trg_sales_leads_updated_at
  BEFORE UPDATE ON public.sales_leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sales_proposals_updated_at ON public.sales_proposals;
CREATE TRIGGER trg_sales_proposals_updated_at
  BEFORE UPDATE ON public.sales_proposals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_sales_contracts_updated_at ON public.sales_contracts;
CREATE TRIGGER trg_sales_contracts_updated_at
  BEFORE UPDATE ON public.sales_contracts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_group_blocks_updated_at ON public.group_blocks;
CREATE TRIGGER trg_group_blocks_updated_at
  BEFORE UPDATE ON public.group_blocks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================================
-- 8. Performance indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_corporate_accounts_company_name ON public.corporate_accounts(company_name);
CREATE INDEX IF NOT EXISTS idx_corporate_accounts_contact_email ON public.corporate_accounts(contact_email);

CREATE INDEX IF NOT EXISTS idx_sales_leads_corporate_account_id ON public.sales_leads(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_sales_leads_stage ON public.sales_leads(stage);
CREATE INDEX IF NOT EXISTS idx_sales_leads_assigned_to ON public.sales_leads(assigned_to);

CREATE INDEX IF NOT EXISTS idx_sales_proposals_lead_id ON public.sales_proposals(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_corporate_account_id ON public.sales_proposals(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_sales_proposals_status ON public.sales_proposals(status);

CREATE INDEX IF NOT EXISTS idx_sales_contracts_proposal_id ON public.sales_contracts(proposal_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_lead_id ON public.sales_contracts(lead_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_corporate_account_id ON public.sales_contracts(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_sales_contracts_status ON public.sales_contracts(status);

CREATE INDEX IF NOT EXISTS idx_group_blocks_contract_id ON public.group_blocks(contract_id);
CREATE INDEX IF NOT EXISTS idx_group_blocks_corporate_account_id ON public.group_blocks(corporate_account_id);
CREATE INDEX IF NOT EXISTS idx_group_blocks_status ON public.group_blocks(status);
