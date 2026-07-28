-- ============================================================
-- Add missing F&B (fb:*) permission codes and assign to role_fb
-- ============================================================
-- The permissions table was seeded with only core hotel permissions
-- (reservation, folio, room, inventory, etc.) but none of the fb:*
-- codes used by server.ts and foodBeverage.routes.ts.  This caused
-- 403 Forbidden for every non-superuser F&B user on F&B endpoints.
-- ============================================================

INSERT INTO permissions (id, code, module, description) VALUES
  ('perm_fb_kitchen_write',    'fb:kitchen:write',         'fnb', 'Write kitchen recipes, production orders, inventory, transfers, waste'),
  ('perm_fb_write',            'fb:write',                 'fnb', 'General F&B write access (banquet events, etc.)'),
  ('perm_fb_outlet_create',    'fb:outlet:create',         'fnb', 'Create F&B outlet'),
  ('perm_fb_menu_create',      'fb:menu:create',           'fnb', 'Create menu item'),
  ('perm_fb_menu_update',      'fb:menu:update',           'fnb', 'Update menu item'),
  ('perm_fb_recipe_create',    'fb:recipe:create',         'fnb', 'Create recipe'),
  ('perm_fb_ingredient_create','fb:ingredient:create',     'fnb', 'Create ingredient'),
  ('perm_fb_ingredient_update','fb:ingredient:update',     'fnb', 'Update ingredient / recalculate cost'),
  ('perm_fb_stock_create',     'fb:stock:create',          'fnb', 'Create stock transaction'),
  ('perm_fb_requisition_create','fb:requisition:create',   'fnb', 'Create F&B requisition'),
  ('perm_fb_requisition_approve','fb:requisition:approve', 'fnb', 'Approve F&B requisition'),
  ('perm_fb_requisition_fulfill','fb:requisition:fulfill', 'fnb', 'Fulfill F&B requisition'),
  ('perm_fb_order_create',     'fb:order:create',          'fnb', 'Create F&B order'),
  ('perm_fb_order_update',     'fb:order:update',          'fnb', 'Update F&B order'),
  ('perm_fb_order_void',       'fb:order:void',            'fnb', 'Void F&B order'),
  ('perm_fb_banquet_create',   'fb:banquet:create',        'fnb', 'Create banquet event'),
  ('perm_fb_banquet_update',   'fb:banquet:update',        'fnb', 'Update banquet event'),
  ('perm_fb_wastage_create',   'fb:wastage:create',        'fnb', 'Create wastage log'),
  ('perm_fb_stockcount_create','fb:stockcount:create',     'fnb', 'Create stock count'),
  ('perm_fb_stockcount_approve','fb:stockcount:approve',   'fnb', 'Approve stock count'),
  ('perm_fb_invoice_create',   'fb:invoice:create',        'fnb', 'Create F&B invoice'),
  ('perm_fb_invoice_update',   'fb:invoice:update',        'fnb', 'Update F&B invoice'),
  ('perm_fb_invoice_delete',   'fb:invoice:delete',        'fnb', 'Delete F&B invoice'),
  ('perm_fb_invoice_pay',      'fb:invoice:pay',           'fnb', 'Pay F&B invoice'),
  ('perm_fb_po_create',        'fb:po:create',             'fnb', 'Create F&B purchase order'),
  ('perm_fb_po_update',        'fb:po:update',             'fnb', 'Update F&B purchase order'),
  ('perm_fb_po_submit',        'fb:po:submit',             'fnb', 'Submit F&B purchase order'),
  ('perm_fb_po_approve',       'fb:po:approve',            'fnb', 'Approve F&B purchase order'),
  ('perm_fb_po_cancel',        'fb:po:cancel',             'fnb', 'Cancel F&B purchase order'),
  ('perm_fb_po_delete',        'fb:po:delete',             'fnb', 'Delete F&B purchase order'),
  ('perm_fb_receipt_create',   'fb:receipt:create',        'fnb', 'Create F&B receipt'),
  ('perm_fb_receipt_update',   'fb:receipt:update',        'fnb', 'Update F&B receipt'),
  ('perm_fb_reservation_create','fb:reservation:create',   'fnb', 'Create F&B reservation'),
  ('perm_fb_reservation_update','fb:reservation:update',   'fnb', 'Update F&B reservation'),
  ('perm_fb_reservation_auto_assign','fb:reservation:auto_assign','fnb','Auto-assign F&B reservation'),
  ('perm_fb_section_create',   'fb:section:create',        'fnb', 'Create F&B section'),
  ('perm_fb_section_update',   'fb:section:update',        'fnb', 'Update F&B section'),
  ('perm_fb_section_delete',   'fb:section:delete',        'fnb', 'Delete F&B section'),
  ('perm_fb_supplier_view',    'fb:supplier:view',         'fnb', 'View F&B suppliers'),
  ('perm_fb_supplier_create',  'fb:supplier:create',       'fnb', 'Create F&B supplier'),
  ('perm_fb_supplier_update',  'fb:supplier:update',       'fnb', 'Update F&B supplier'),
  ('perm_fb_supplier_delete',  'fb:supplier:delete',       'fnb', 'Delete F&B supplier'),
  ('perm_fb_table_create',     'fb:table:create',          'fnb', 'Create F&B table'),
  ('perm_fb_table_update',     'fb:table:update',          'fnb', 'Update F&B table'),
  ('perm_fb_table_delete',     'fb:table:delete',          'fnb', 'Delete F&B table'),
  ('perm_fb_table_assign',     'fb:table:assign',          'fnb', 'Assign F&B table'),
  ('perm_fb_table_release',    'fb:table:release',         'fnb', 'Release F&B table'),
  ('perm_fb_table_clean',      'fb:table:clean',           'fnb', 'Clean F&B table'),
  ('perm_fb_waitlist_create',  'fb:waitlist:create',       'fnb', 'Create waitlist entry'),
  ('perm_fb_waitlist_update',  'fb:waitlist:update',       'fnb', 'Update waitlist entry'),
  ('perm_fb_waitlist_cancel',  'fb:waitlist:cancel',       'fnb', 'Cancel waitlist entry'),
  ('perm_fb_waitlist_notify',  'fb:waitlist:notify',       'fnb', 'Notify waitlist entry'),
  ('perm_fb_waitlist_seat',    'fb:waitlist:seat',         'fnb', 'Seat waitlist entry')
ON CONFLICT (id) DO UPDATE SET
  code = excluded.code,
  module = excluded.module,
  description = excluded.description;

-- Assign all fb:* permissions to role_fb
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role_fb', id FROM permissions
WHERE code LIKE 'fb:%'
ON CONFLICT DO NOTHING;

-- Ensure role_admin and role_executive also get all fb:* permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role_admin', id FROM permissions
WHERE code LIKE 'fb:%'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'role_executive', id FROM permissions
WHERE code LIKE 'fb:%'
ON CONFLICT DO NOTHING;
