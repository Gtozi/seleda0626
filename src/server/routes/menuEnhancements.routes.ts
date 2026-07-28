/**
 * Menu Enhancements Routes
 * Phase 4 Item 3: Modifier groups, allergens, nutrition, time-based pricing
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Modifier Groups ──────────────────────────────────────────────────────
router.get('/modifier-groups', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('pos_modifier_groups').select('*').order('sort_order', { ascending: true });
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/modifier-groups', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_modifier_groups').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/modifier-groups/:id', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_modifier_groups').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/modifier-groups/:id', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('pos_modifier_groups').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ── Modifier Options ─────────────────────────────────────────────────────
router.post('/modifier-options', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_modifier_options').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/modifier-options/:id', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_modifier_options').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/modifier-options/:id', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('pos_modifier_options').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ── Menu Item Modifiers ──────────────────────────────────────────────────
router.post('/menu-item-modifiers', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_menu_item_modifiers').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.delete('/menu-item-modifiers/:menuItemId/:modifierGroupId', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('pos_menu_item_modifiers')
    .delete().eq('menu_item_id', req.params.menuItemId).eq('modifier_group_id', req.params.modifierGroupId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ── Allergens ────────────────────────────────────────────────────────────
router.get('/allergens', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_allergens').select('*').eq('is_active', true).order('name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.get('/menu-items/:menuItemId/allergens', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('pos_menu_item_allergens')
    .select('*, allergen:pos_allergens(*)')
    .eq('menu_item_id', req.params.menuItemId);
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.put('/menu-items/:menuItemId/allergens', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { allergens } = req.body || {};
  const menuItemId = req.params.menuItemId;
  await supabaseAdmin.from('pos_menu_item_allergens').delete().eq('menu_item_id', menuItemId);
  if (allergens?.length > 0) {
    const rows = allergens.map((a: any) => ({ menu_item_id: menuItemId, allergen_id: a.allergen_id, contains: a.contains, may_contain: a.may_contain }));
    const { error } = await supabaseAdmin.from('pos_menu_item_allergens').insert(rows);
    if (error) return res.status(500).json({ error: error.message });
  }
  return res.json({ success: true });
});

// ── Nutrition ────────────────────────────────────────────────────────────
router.get('/menu-items/:menuItemId/nutrition', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_menu_item_nutrition').select('*').eq('menu_item_id', req.params.menuItemId).single();
  if (error && error.code !== 'PGRST116') return res.status(500).json({ error: error.message });
  return res.json(data || null);
});

router.put('/menu-items/:menuItemId/nutrition', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_menu_item_nutrition')
    .upsert({ ...req.body, menu_item_id: req.params.menuItemId }).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// ── Time-Based Pricing Rules ─────────────────────────────────────────────
router.get('/pricing-rules', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('pos_time_based_pricing_rules').select('*').order('created_at', { ascending: false });
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/pricing-rules', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_time_based_pricing_rules').insert(req.body).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

router.put('/pricing-rules/:id', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin.from('pos_time_based_pricing_rules').update(req.body).eq('id', req.params.id).select().single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.delete('/pricing-rules/:id', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { error } = await supabaseAdmin.from('pos_time_based_pricing_rules').delete().eq('id', req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

router.post('/pricing-rules/menu-items', authenticate, requirePermission('pos_settings:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { rule_id, menu_item_ids } = req.body || {};
  if (!rule_id || !menu_item_ids) return res.status(400).json({ error: 'rule_id and menu_item_ids are required' });
  const rows = menu_item_ids.map((id: string) => ({ pricing_rule_id: rule_id, menu_item_id: id }));
  const { error } = await supabaseAdmin.from('pos_time_pricing_menu_items').insert(rows);
  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// ── Resolve time-based price ─────────────────────────────────────────────
router.get('/resolve-price/:menuItemId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id } = req.query as Record<string, string>;
  const { data, error } = await supabaseAdmin.rpc('resolve_time_based_price', {
    p_menu_item_id: req.params.menuItemId,
    p_outlet_id: outlet_id,
    p_check_time: new Date().toISOString(),
  });
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

export default router;
