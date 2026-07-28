-- Migration 204: Unified Offline POS Sync
-- Phase 3 Item 4: Extend pos_sync_queue to support all POS operation types
-- (transactions, voids, refunds, inventory adjustments) and add monitoring views.

-- ── 1. Extend pos_sync_queue with operation_type ────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pos_sync_queue' AND column_name = 'operation_type'
  ) THEN
    ALTER TABLE public.pos_sync_queue ADD COLUMN operation_type TEXT NOT NULL DEFAULT 'transaction';
    COMMENT ON COLUMN public.pos_sync_queue.operation_type IS 'transaction, void, refund, inventory_adjustment, shift_close';
  END IF;
END $$;

-- Update existing rows to have operation_type = 'transaction'
UPDATE public.pos_sync_queue SET operation_type = 'transaction' WHERE operation_type IS NULL OR operation_type = '';

-- Add index for operation_type queries
CREATE INDEX IF NOT EXISTS idx_pos_sync_queue_op_type ON public.pos_sync_queue(operation_type);

-- ── 2. Unified Sync Status View ─────────────────────────────────────────
-- Aggregates sync queue status by outlet for monitoring dashboard
CREATE OR REPLACE VIEW public.unified_sync_status AS
SELECT
  q.outlet_id,
  o.name AS outlet_name,
  o.outlet_type,
  q.operation_type,
  COUNT(*) FILTER (WHERE q.sync_status = 'pending') AS pending_count,
  COUNT(*) FILTER (WHERE q.sync_status = 'synced') AS synced_count,
  COUNT(*) FILTER (WHERE q.sync_status = 'failed') AS failed_count,
  COUNT(*) FILTER (WHERE q.sync_status = 'conflict') AS conflict_count,
  COUNT(*) AS total_count,
  MAX(q.client_created_at) AS last_queued_at,
  MAX(q.synced_at) AS last_synced_at,
  MAX(q.updated_at) AS last_updated_at
FROM public.pos_sync_queue q
LEFT JOIN public.pos_outlets o ON o.id = q.outlet_id
GROUP BY q.outlet_id, o.name, o.outlet_type, q.operation_type;

-- ── 3. Sync Health Summary View ─────────────────────────────────────────
-- One row per outlet with overall sync health
CREATE OR REPLACE VIEW public.sync_health_summary AS
SELECT
  q.outlet_id,
  o.name AS outlet_name,
  o.outlet_type,
  COUNT(*) FILTER (WHERE q.sync_status = 'pending') AS total_pending,
  COUNT(*) FILTER (WHERE q.sync_status = 'failed') AS total_failed,
  COUNT(*) FILTER (WHERE q.sync_status = 'conflict') AS total_conflicts,
  COUNT(*) AS total_operations,
  CASE
    WHEN COUNT(*) FILTER (WHERE q.sync_status = 'pending') > 0 THEN 'offline'
    WHEN COUNT(*) FILTER (WHERE q.sync_status = 'failed') > 0 THEN 'error'
    WHEN COUNT(*) FILTER (WHERE q.sync_status = 'conflict') > 0 THEN 'conflict'
    ELSE 'healthy'
  END AS health_status,
  MAX(q.client_created_at) AS last_activity,
  MAX(q.synced_at) AS last_sync
FROM public.pos_sync_queue q
LEFT JOIN public.pos_outlets o ON o.id = q.outlet_id
GROUP BY q.outlet_id, o.name, o.outlet_type;
