-- Migration 202: Cross-Outlet Transfers
-- Phase 3 Item 2: Unified requisition/transfer workflow from main store
-- to any kitchen/bar/outlet. Supports all inventory source types.

-- ── 1. Outlet Transfers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.outlet_transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id TEXT NOT NULL DEFAULT 'single-property',
  transfer_number TEXT NOT NULL,
  -- Source and destination outlets
  from_outlet_id UUID REFERENCES public.pos_outlets(id) ON DELETE SET NULL,
  to_outlet_id UUID NOT NULL REFERENCES public.pos_outlets(id) ON DELETE RESTRICT,
  -- Source/destination locations (nullable for main store)
  from_location_id TEXT,   -- can reference stock_locations (text) or kitchen/bar storage_locations (UUID cast to text)
  to_location_id TEXT,
  -- Item identification (polymorphic — supports core ingredients, kitchen items, bar items)
  item_source TEXT NOT NULL DEFAULT 'core' CHECK (item_source IN ('core','kitchen','bar')),
  item_id TEXT NOT NULL,    -- UUID cast to text for uniformity
  item_name TEXT NOT NULL,  -- denormalized
  -- Transfer details
  quantity NUMERIC(12,3) NOT NULL,
  unit TEXT NOT NULL,
  unit_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  total_cost NUMERIC(12,4) NOT NULL DEFAULT 0,
  -- Status workflow
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','in_transit','completed','cancelled','rejected')),
  -- Approval
  requested_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  received_by TEXT,
  received_at TIMESTAMPTZ,
  -- Metadata
  transfer_type TEXT NOT NULL DEFAULT 'requisition'
    CHECK (transfer_type IN ('requisition','transfer','return','adjustment')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, transfer_number)
);

CREATE INDEX IF NOT EXISTS idx_outlet_transfers_from_outlet ON public.outlet_transfers(from_outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_transfers_to_outlet ON public.outlet_transfers(to_outlet_id);
CREATE INDEX IF NOT EXISTS idx_outlet_transfers_status ON public.outlet_transfers(status);
CREATE INDEX IF NOT EXISTS idx_outlet_transfers_item ON public.outlet_transfers(item_id);
CREATE INDEX IF NOT EXISTS idx_outlet_transfers_date ON public.outlet_transfers(created_at);

ALTER TABLE public.outlet_transfers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role all outlet_transfers" ON public.outlet_transfers;
CREATE POLICY "service_role all outlet_transfers" ON public.outlet_transfers FOR ALL
    USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
DROP POLICY IF EXISTS "authenticated read outlet_transfers" ON public.outlet_transfers;
CREATE POLICY "authenticated read outlet_transfers" ON public.outlet_transfers FOR SELECT
    USING (auth.role() = 'authenticated');

DROP TRIGGER IF EXISTS update_outlet_transfers_updated_at ON public.outlet_transfers;
CREATE TRIGGER update_outlet_transfers_updated_at BEFORE UPDATE ON public.outlet_transfers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE public.outlet_transfers IS 'Cross-outlet inventory transfers — unified workflow for main store to any kitchen/bar/outlet';

-- ── 2. Unified Transfer History View ────────────────────────────────────
-- Combines outlet_transfers, kitchen_transfers, and bar_transfers for reporting
CREATE OR REPLACE VIEW public.unified_transfer_history AS
SELECT
  ot.id::text AS transfer_id,
  ot.transfer_number,
  ot.transfer_type,
  ot.from_outlet_id,
  ot.to_outlet_id,
  ot.item_source,
  ot.item_id,
  ot.item_name,
  ot.quantity,
  ot.unit,
  ot.unit_cost,
  ot.total_cost,
  ot.status,
  ot.priority,
  ot.requested_by,
  ot.approved_by,
  ot.approved_at,
  ot.received_by,
  ot.received_at,
  ot.notes,
  ot.created_at,
  'unified' AS source_table
FROM public.outlet_transfers ot

UNION ALL

SELECT
  kt.id::text AS transfer_id,
  kt.transfer_number,
  kt.transfer_type,
  NULL::UUID AS from_outlet_id,
  NULL::UUID AS to_outlet_id,
  'kitchen' AS item_source,
  kt.inventory_item_id::text AS item_id,
  COALESCE(ki.name, 'Unknown') AS item_name,
  kt.quantity,
  kt.unit,
  0::NUMERIC AS unit_cost,
  0::NUMERIC AS total_cost,
  kt.status,
  'normal'::TEXT AS priority,
  NULL::TEXT AS requested_by,
  kt.approved_by,
  kt.approved_at,
  kt.performed_by AS received_by,
  NULL::TIMESTAMPTZ AS received_at,
  kt.notes,
  kt.created_at,
  'kitchen' AS source_table
FROM public.kitchen_transfers kt
LEFT JOIN public.kitchen_inventory_items ki ON ki.id = kt.inventory_item_id
WHERE kt.is_deleted = false

UNION ALL

SELECT
  bt.id::text AS transfer_id,
  bt.transfer_number,
  bt.transfer_type,
  NULL::UUID AS from_outlet_id,
  NULL::UUID AS to_outlet_id,
  'bar' AS item_source,
  bt.inventory_item_id::text AS item_id,
  COALESCE(bi.name, 'Unknown') AS item_name,
  bt.quantity,
  bt.unit,
  0::NUMERIC AS unit_cost,
  0::NUMERIC AS total_cost,
  bt.status,
  'normal'::TEXT AS priority,
  NULL::TEXT AS requested_by,
  bt.approved_by,
  bt.approved_at,
  bt.performed_by AS received_by,
  NULL::TIMESTAMPTZ AS received_at,
  bt.notes,
  bt.created_at,
  'bar' AS source_table
FROM public.bar_transfers bt
LEFT JOIN public.bar_inventory_items bi ON bi.id = bt.inventory_item_id
WHERE bt.is_deleted = false;
