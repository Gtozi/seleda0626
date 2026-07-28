-- Migration 195: Link kitchen/bar waste and transfers to the canonical outlet registry (pos_outlets)
-- Phase 2.1 of the F&B unification roadmap.

-- Kitchen transfers
ALTER TABLE public.kitchen_transfers
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.kitchen_transfers
  DROP CONSTRAINT IF EXISTS fk_kitchen_transfers_outlet;

ALTER TABLE public.kitchen_transfers
  ADD CONSTRAINT fk_kitchen_transfers_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_transfers_outlet_id
  ON public.kitchen_transfers(outlet_id);

-- Bar transfers
ALTER TABLE public.bar_transfers
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.bar_transfers
  DROP CONSTRAINT IF EXISTS fk_bar_transfers_outlet;

ALTER TABLE public.bar_transfers
  ADD CONSTRAINT fk_bar_transfers_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_transfers_outlet_id
  ON public.bar_transfers(outlet_id);

-- Kitchen waste
ALTER TABLE public.kitchen_waste
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.kitchen_waste
  DROP CONSTRAINT IF EXISTS fk_kitchen_waste_outlet;

ALTER TABLE public.kitchen_waste
  ADD CONSTRAINT fk_kitchen_waste_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_waste_outlet_id
  ON public.kitchen_waste(outlet_id);

-- Bar waste
ALTER TABLE public.bar_waste
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.bar_waste
  DROP CONSTRAINT IF EXISTS fk_bar_waste_outlet;

ALTER TABLE public.bar_waste
  ADD CONSTRAINT fk_bar_waste_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_waste_outlet_id
  ON public.bar_waste(outlet_id);
