-- Migration 192: Link kitchen/bar production orders to the canonical outlet registry (pos_outlets)
-- Phase 2.1 of the F&B unification roadmap.

-- Add explicit FK from kitchen production orders to pos_outlets.
-- The existing column `kitchen_id` was intended for this; formalize it.
ALTER TABLE public.kitchen_production_orders
  DROP CONSTRAINT IF EXISTS fk_kitchen_production_orders_outlet;

ALTER TABLE public.kitchen_production_orders
  ADD CONSTRAINT fk_kitchen_production_orders_outlet
    FOREIGN KEY (kitchen_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

-- Add explicit FK from bar production orders to pos_outlets.
ALTER TABLE public.bar_production_orders
  DROP CONSTRAINT IF EXISTS fk_bar_production_orders_outlet;

ALTER TABLE public.bar_production_orders
  ADD CONSTRAINT fk_bar_production_orders_outlet
    FOREIGN KEY (bar_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

-- Index the FK columns for efficient outlet-scoped queries.
CREATE INDEX IF NOT EXISTS idx_kitchen_production_orders_kitchen_id
  ON public.kitchen_production_orders(kitchen_id);

CREATE INDEX IF NOT EXISTS idx_bar_production_orders_bar_id
  ON public.bar_production_orders(bar_id);
