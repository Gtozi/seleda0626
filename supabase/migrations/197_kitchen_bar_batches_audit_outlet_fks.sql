-- Migration 197: Link kitchen/bar inventory batches and audit logs to the canonical outlet registry (pos_outlets)
-- Phase 2.1 of the F&B unification roadmap.

-- Kitchen inventory batches
ALTER TABLE public.kitchen_inventory_batches
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.kitchen_inventory_batches
  DROP CONSTRAINT IF EXISTS fk_kitchen_inventory_batches_outlet;

ALTER TABLE public.kitchen_inventory_batches
  ADD CONSTRAINT fk_kitchen_inventory_batches_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_batches_outlet_id
  ON public.kitchen_inventory_batches(outlet_id);

-- Bar inventory batches
ALTER TABLE public.bar_inventory_batches
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.bar_inventory_batches
  DROP CONSTRAINT IF EXISTS fk_bar_inventory_batches_outlet;

ALTER TABLE public.bar_inventory_batches
  ADD CONSTRAINT fk_bar_inventory_batches_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_inventory_batches_outlet_id
  ON public.bar_inventory_batches(outlet_id);

-- Kitchen audit log
ALTER TABLE public.kitchen_audit_log
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.kitchen_audit_log
  DROP CONSTRAINT IF EXISTS fk_kitchen_audit_log_outlet;

ALTER TABLE public.kitchen_audit_log
  ADD CONSTRAINT fk_kitchen_audit_log_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_audit_log_outlet_id
  ON public.kitchen_audit_log(outlet_id);

-- Bar audit log
ALTER TABLE public.bar_audit_log
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.bar_audit_log
  DROP CONSTRAINT IF EXISTS fk_bar_audit_log_outlet;

ALTER TABLE public.bar_audit_log
  ADD CONSTRAINT fk_bar_audit_log_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_audit_log_outlet_id
  ON public.bar_audit_log(outlet_id);
