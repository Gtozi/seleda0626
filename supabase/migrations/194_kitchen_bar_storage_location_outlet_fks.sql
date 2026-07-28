-- Migration 194: Link kitchen/bar storage locations to the canonical outlet registry (pos_outlets)
-- Phase 2.1 of the F&B unification roadmap.

-- Kitchen storage locations
ALTER TABLE public.kitchen_storage_locations
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.kitchen_storage_locations
  DROP CONSTRAINT IF EXISTS fk_kitchen_storage_locations_outlet;

ALTER TABLE public.kitchen_storage_locations
  ADD CONSTRAINT fk_kitchen_storage_locations_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_storage_locations_outlet_id
  ON public.kitchen_storage_locations(outlet_id);

-- Bar storage locations
ALTER TABLE public.bar_storage_locations
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.bar_storage_locations
  DROP CONSTRAINT IF EXISTS fk_bar_storage_locations_outlet;

ALTER TABLE public.bar_storage_locations
  ADD CONSTRAINT fk_bar_storage_locations_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_storage_locations_outlet_id
  ON public.bar_storage_locations(outlet_id);
