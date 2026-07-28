-- Migration 208: Hardware Printer & Payment Terminal Integration
-- Phase 4 Item 4: Add hardware printer/payment terminal integration

-- ── 1. Printers table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_printers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'thermal' CHECK (type IN ('thermal', 'inkjet', 'laser', 'kitchen')),
  connection_type TEXT NOT NULL DEFAULT 'network' CHECK (connection_type IN ('network', 'usb', 'bluetooth', 'serial')),
  ip_address TEXT,
  port INTEGER DEFAULT 9100,
  usb_port TEXT,
  paper_width INTEGER NOT NULL DEFAULT 80,
  characters_per_line INTEGER NOT NULL DEFAULT 48,
  supports_graphics BOOLEAN NOT NULL DEFAULT false,
  station TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_printers_outlet ON public.pos_printers(outlet_id);
CREATE INDEX IF NOT EXISTS idx_printers_active ON public.pos_printers(is_active);
ALTER TABLE public.pos_printers ENABLE ROW LEVEL SECURITY;

-- ── 2. Payment terminals table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_payment_terminals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'card' CHECK (type IN ('card', 'mobile', 'hybrid')),
  model TEXT,
  serial_number TEXT,
  connection_type TEXT NOT NULL DEFAULT 'network' CHECK (connection_type IN ('network', 'usb', 'bluetooth', 'serial')),
  ip_address TEXT,
  port INTEGER DEFAULT 5000,
  supports_emv BOOLEAN NOT NULL DEFAULT true,
  supports_nfc BOOLEAN NOT NULL DEFAULT true,
  supports_contactless BOOLEAN NOT NULL DEFAULT true,
  merchant_id TEXT,
  terminal_id_external TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_connected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_terminals_outlet ON public.pos_payment_terminals(outlet_id);
CREATE INDEX IF NOT EXISTS idx_payment_terminals_active ON public.pos_payment_terminals(is_active);
ALTER TABLE public.pos_payment_terminals ENABLE ROW LEVEL SECURITY;

-- ── 3. Print jobs table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_print_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printer_id UUID NOT NULL REFERENCES public.pos_printers(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE SET NULL,
  job_type TEXT NOT NULL DEFAULT 'receipt' CHECK (job_type IN ('receipt', 'kitchen_ticket', 'report', 'order')),
  content TEXT NOT NULL,
  copies INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'printing', 'completed', 'failed')),
  error_message TEXT,
  transaction_id UUID,
  queued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_print_jobs_printer ON public.pos_print_jobs(printer_id);
CREATE INDEX IF NOT EXISTS idx_print_jobs_status ON public.pos_print_jobs(status);
CREATE INDEX IF NOT EXISTS idx_print_jobs_outlet ON public.pos_print_jobs(outlet_id);
ALTER TABLE public.pos_print_jobs ENABLE ROW LEVEL SECURITY;

-- ── 4. Payment terminal transactions log ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pos_payment_terminal_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  terminal_id UUID NOT NULL REFERENCES public.pos_payment_terminals(id) ON DELETE CASCADE,
  outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE SET NULL,
  pos_transaction_id UUID,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'ETB',
  payment_method TEXT NOT NULL CHECK (payment_method IN ('card', 'nfc', 'contactless', 'mobile')),
  card_type TEXT,
  masked_card_number TEXT,
  authorization_code TEXT,
  transaction_reference TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined', 'timeout', 'cancelled', 'refunded')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_txn_terminal ON public.pos_payment_terminal_transactions(terminal_id);
CREATE INDEX IF NOT EXISTS idx_payment_txn_status ON public.pos_payment_terminal_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_txn_outlet ON public.pos_payment_terminal_transactions(outlet_id);
ALTER TABLE public.pos_payment_terminal_transactions ENABLE ROW LEVEL SECURITY;

-- ── 5. RLS Policies ─────────────────────────────────────────────────────
DO $$
DECLARE t TEXT; tables TEXT[] := ARRAY[
  'pos_printers','pos_payment_terminals','pos_print_jobs','pos_payment_terminal_transactions'
];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    BEGIN
      EXECUTE format('CREATE POLICY "service_role all %s" ON public.%I FOR ALL USING (auth.role() = ''service_role'') WITH CHECK (auth.role() = ''service_role'')', t, t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
    BEGIN
      EXECUTE format('CREATE POLICY "authenticated read %s" ON public.%I FOR SELECT USING (auth.role() = ''authenticated'')', t, t);
    EXCEPTION WHEN duplicate_object THEN NULL; END;
  END LOOP;
END $$;
