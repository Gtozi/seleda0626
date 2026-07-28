-- ============================================================
-- Add F&B permission category and map to fnb department
-- ============================================================
-- The fb:* permissions use module='fnb' but the
-- department_permission_categories table didn't have an 'fnb'
-- category, so filterPermissionsByDepartment() filtered them out
-- and they never appeared in the UI role editor.
-- ============================================================

-- Add 'fnb' as a permission category (if not exists)
INSERT INTO public.permission_categories (id, label, icon, actions, sort_order) VALUES
  ('fnb', 'Food & Beverage', '🍽️',
   '["kitchen:write","write","outlet:create","menu:create","menu:update","recipe:create","ingredient:create","ingredient:update","stock:create","requisition:create","requisition:approve","requisition:fulfill","order:create","order:update","order:void","banquet:create","banquet:update","wastage:create","stockcount:create","stockcount:approve","invoice:create","invoice:update","invoice:delete","invoice:pay","po:create","po:update","po:submit","po:approve","po:cancel","po:delete","receipt:create","receipt:update","reservation:create","reservation:update","reservation:auto_assign","section:create","section:update","section:delete","supplier:view","supplier:create","supplier:update","supplier:delete","table:create","table:update","table:delete","table:assign","table:release","table:clean","waitlist:create","waitlist:update","waitlist:cancel","waitlist:notify","waitlist:seat"]'::jsonb,
   19)
ON CONFLICT (id) DO UPDATE SET
  label = excluded.label,
  icon = excluded.icon,
  actions = excluded.actions,
  sort_order = excluded.sort_order;

-- Map 'fnb' category to the 'fnb' department
INSERT INTO public.department_permission_categories (department, category_id, sort_order) VALUES
  ('fnb', 'fnb', 0)
ON CONFLICT (department, category_id) DO NOTHING;
