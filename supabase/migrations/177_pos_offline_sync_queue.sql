-- Migration 177: POS Offline Sync Queue
-- §1 Design Principle: "Offline-first. Every terminal (POS or KDS) must queue and sync"
-- §3 Transaction Pipeline: "emits Canonical Transaction (offline-queued if needed)"
--
-- This table stores transactions queued on POS terminals while offline.
-- When connectivity returns, terminals POST to /api/pos/sync to flush the queue.
-- Dedup is handled via transaction_id as idempotency key.

CREATE TABLE IF NOT EXISTS public.pos_sync_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Idempotency: the client-generated transaction UUID
  transaction_id TEXT NOT NULL UNIQUE,
  -- Terminal identification
  outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE CASCADE,
  terminal_id UUID REFERENCES public.pos_terminals(id) ON DELETE SET NULL,
  device_id TEXT,
  -- The full canonical transaction payload (JSONB)
  payload JSONB NOT NULL,
  -- Sync state
  sync_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (sync_status IN ('pending', 'synced', 'failed', 'conflict')),
  sync_attempts INTEGER NOT NULL DEFAULT 0,
  last_sync_error TEXT,
  synced_at TIMESTAMPTZ,
  -- Client timestamps for ordering
  client_created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  client_updated_at TIMESTAMPTZ,
  -- Server audit
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient sync queries
CREATE INDEX IF NOT EXISTS idx_pos_sync_queue_status ON public.pos_sync_queue(sync_status);
CREATE INDEX IF NOT EXISTS idx_pos_sync_queue_outlet ON public.pos_sync_queue(outlet_id);
CREATE INDEX IF NOT EXISTS idx_pos_sync_queue_terminal ON public.pos_sync_queue(terminal_id);
CREATE INDEX IF NOT EXISTS idx_pos_sync_queue_transaction ON public.pos_sync_queue(transaction_id);
CREATE INDEX IF NOT EXISTS idx_pos_sync_queue_created ON public.pos_sync_queue(client_created_at DESC);

-- RLS
ALTER TABLE public.pos_sync_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role all pos_sync_queue" ON public.pos_sync_queue FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "authenticated read pos_sync_queue" ON public.pos_sync_queue FOR SELECT
    USING (auth.role() = 'authenticated');

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_pos_sync_queue_updated_at ON public.pos_sync_queue;
CREATE TRIGGER update_pos_sync_queue_updated_at BEFORE UPDATE ON public.pos_sync_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE public.pos_sync_queue IS
  'Offline-first transaction queue — POS terminals queue transactions here when offline, sync when connectivity returns. Dedup via transaction_id.';

-- ── Sync conflict resolution function ──
-- When a transaction_id already exists in pos_transactions, mark as conflict
CREATE OR REPLACE FUNCTION public.resolve_sync_conflict(p_transaction_id TEXT)
RETURNS TABLE(existing_id UUID, existing_status TEXT) AS $$
DECLARE
  v_existing RECORD;
BEGIN
  SELECT id, status INTO v_existing
    FROM public.pos_transactions
    WHERE id::text = p_transaction_id
    LIMIT 1;

  IF FOUND THEN
    RETURN QUERY SELECT v_existing.id, v_existing.status;
  ELSE
    RETURN QUERY SELECT NULL::UUID, NULL::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.resolve_sync_conflict IS
  'Checks if a transaction_id already exists in pos_transactions to detect sync conflicts/duplicates.';
