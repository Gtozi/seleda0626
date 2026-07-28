-- Migration 196: Link kitchen/bar recipes to the canonical outlet registry (pos_outlets)
-- Phase 2.1 of the F&B unification roadmap.
-- A nullable outlet_id represents the recipe's primary/owning outlet; NULL means shared.

-- Kitchen recipes
ALTER TABLE public.kitchen_recipes
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.kitchen_recipes
  DROP CONSTRAINT IF EXISTS fk_kitchen_recipes_outlet;

ALTER TABLE public.kitchen_recipes
  ADD CONSTRAINT fk_kitchen_recipes_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_kitchen_recipes_outlet_id
  ON public.kitchen_recipes(outlet_id);

-- Bar recipes
ALTER TABLE public.bar_recipes
  ADD COLUMN IF NOT EXISTS outlet_id UUID;

ALTER TABLE public.bar_recipes
  DROP CONSTRAINT IF EXISTS fk_bar_recipes_outlet;

ALTER TABLE public.bar_recipes
  ADD CONSTRAINT fk_bar_recipes_outlet
    FOREIGN KEY (outlet_id) REFERENCES public.pos_outlets(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bar_recipes_outlet_id
  ON public.bar_recipes(outlet_id);
