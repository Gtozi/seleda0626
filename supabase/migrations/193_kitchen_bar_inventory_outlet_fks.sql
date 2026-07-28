-- Migration 193: Link kitchen/bar inventory items to the canonical outlet registry (pos_outlets)
-- Phase 2.1 of the F&B unification roadmap.

-- Kitchen inventory items
ALTER TABLE public.kitchen_inventory_items
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.kitchen_inventory_items
  DROP CONSTRAINT IF EXISTS fk_kitchen_inventory_items_outlet;

ALTER TABLE public.kitchen_inventory_items
  ADD CONSTRAINT fk_kitchen_inventory_items_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_inventory_items_outlet_id
  ON public.kitchen_inventory_items(outlet_id);

-- Bar inventory items
ALTER TABLE public.bar_inventory_items
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.bar_inventory_items
  DROP CONSTRAINT IF EXISTS fk_bar_inventory_items_outlet;

ALTER TABLE public.bar_inventory_items
  ADD CONSTRAINT fk_bar_inventory_items_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_inventory_items_outlet_id
  ON public.bar_inventory_items(outlet_id);
