-- Migration 181: Link Recipes to POS Menu Items
-- The recipes.menu_item_id had a FK to the old menu_items table.
-- Drop that FK so recipes can reference pos_menu_items.id (UUID) as well.
-- The pos_menu_items.recipe_id column (added in migration 176) links back.

-- 1. Drop the FK constraint on recipes.menu_item_id → menu_items(id)
ALTER TABLE public.recipes
  DROP CONSTRAINT IF EXISTS recipes_menu_item_id_fkey;

-- 2. Drop the UNIQUE constraint so we can have recipes for both menu_items and pos_menu_items
ALTER TABLE public.recipes
  DROP CONSTRAINT IF EXISTS recipes_menu_item_id_key;

-- 3. Add a new unique index to prevent duplicate recipes per menu item
CREATE UNIQUE INDEX IF NOT EXISTS idx_recipes_menu_item_unique
  ON public.recipes(menu_item_id);

-- 4. Add a comment clarifying the new behavior
COMMENT ON COLUMN public.recipes.menu_item_id IS
  'References either menu_items.id (legacy) or pos_menu_items.id (current POS system). Linked back via pos_menu_items.recipe_id.';
