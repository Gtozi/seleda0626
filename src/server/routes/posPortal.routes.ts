import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── POS Outlet Management ─────────────────────────────────────────────

// Get all POS outlets (admin only)
router.get('/outlets', authenticate, requirePermission('manageRoles'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { data, error } = await supabaseAdmin
      .from('pos_outlets')
      .select('*')
      .order('name');

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, outlets: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get user's accessible POS outlets
router.get('/outlets/my', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { data, error } = await supabaseAdmin
      .rpc('get_user_pos_outlets', { p_user_id: user.id });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, outlets: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get user's primary POS outlet
router.get('/outlets/primary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { data, error } = await supabaseAdmin
      .rpc('get_user_primary_pos_outlet', { p_user_id: user.id });

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, primaryOutletId: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create new POS outlet (admin only)
router.post('/outlets', authenticate, requirePermission('manageRoles'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { name, outlet_type, code, description, location, store_location, default_tax_rate, default_service_charge, operating_hours } = req.body;

    if (!name || !outlet_type || !code) {
      return res.status(400).json({ error: 'name, outlet_type, and code are required' });
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { data, error } = await supabaseAdmin
      .from('pos_outlets')
      .insert({
        name,
        outlet_type,
        code,
        description,
        location,
        store_location: store_location || 'Main Store',
        default_tax_rate: default_tax_rate || 15.00,
        default_service_charge: default_service_charge || 10.00,
        operating_hours: operating_hours || {},
        created_by: user.id
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ success: true, outlet: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Update POS outlet (admin only)
router.put('/outlets/:id', authenticate, requirePermission('manageRoles'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabaseAdmin
      .from('pos_outlets')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, outlet: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Delete POS outlet (admin only)
router.delete('/outlets/:id', authenticate, requirePermission('manageRoles'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('pos_outlets')
      .update({ is_active: false })
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, message: 'Outlet deactivated successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── POS Outlet Role Management ─────────────────────────────────────────

// Assign user to POS outlet (admin only)
router.post('/outlets/:outletId/roles', authenticate, requirePermission('manageRoles'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { outletId } = req.params;
    const { user_id, role, is_primary } = req.body;

    if (!user_id || !role) {
      return res.status(400).json({ error: 'user_id and role are required' });
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    // If setting as primary, remove primary from other outlets for this user
    if (is_primary) {
      await supabaseAdmin
        .from('pos_outlet_roles')
        .update({ is_primary: false })
        .eq('user_id', user_id);
    }

    const { data, error } = await supabaseAdmin
      .from('pos_outlet_roles')
      .upsert({
        user_id,
        outlet_id: outletId,
        role,
        is_primary: is_primary || false,
        assigned_by: user.id
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ success: true, role: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Remove user from POS outlet (admin only)
router.delete('/outlets/:outletId/roles/:userId', authenticate, requirePermission('manageRoles'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { outletId, userId } = req.params;

    const { error } = await supabaseAdmin
      .from('pos_outlet_roles')
      .delete()
      .eq('outlet_id', outletId)
      .eq('user_id', userId);

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, message: 'User removed from outlet successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Get users assigned to a specific outlet
router.get('/outlets/:outletId/users', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { outletId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('pos_outlet_roles')
      .select(`
        *,
        user:auth.users(id, email, raw_user_meta_data)
      `)
      .eq('outlet_id', outletId);

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, users: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── POS Menu Categories ───────────────────────────────────────────────

// Get categories for an outlet
router.get('/outlets/:outletId/categories', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { outletId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('pos_outlet_categories')
      .select('*')
      .eq('outlet_id', outletId)
      .eq('is_active', true)
      .order('display_order');

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, categories: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create category for an outlet
router.post('/outlets/:outletId/categories', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { outletId } = req.params;
    const { name, display_order, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const { data, error } = await supabaseAdmin
      .from('pos_outlet_categories')
      .insert({
        outlet_id: outletId,
        name,
        display_order: display_order || 0,
        icon
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ success: true, category: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ── POS Menu Items ───────────────────────────────────────────────────

// Get menu items for an outlet
router.get('/outlets/:outletId/menu-items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { outletId } = req.params;
    const { category_id } = req.query;

    let query = supabaseAdmin
      .from('pos_menu_items')
      .select('*')
      .eq('outlet_id', outletId)
      .eq('is_active', true)
      .order('name');

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    const { data, error } = await query;

    if (error) return res.status(500).json({ error: error.message });

    return res.json({ success: true, items: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Create menu item for an outlet
router.post('/outlets/:outletId/menu-items', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);

  try {
    const { outletId } = req.params;
    const { 
      category_id, 
      name, 
      description, 
      sku, 
      barcode, 
      selling_price, 
      cost_price, 
      preparation_time,
      recipe,
      modifiers
    } = req.body;

    if (!name || !selling_price) {
      return res.status(400).json({ error: 'name and selling_price are required' });
    }

    const { data: { user } } = await supabaseAdmin.auth.getUser();
    if (!user) return res.status(401).json({ error: 'Not authenticated' });

    const { data, error } = await supabaseAdmin
      .from('pos_menu_items')
      .insert({
        outlet_id: outletId,
        category_id,
        name,
        description,
        sku,
        barcode,
        selling_price,
        cost_price,
        preparation_time,
        recipe: recipe || {},
        modifiers: modifiers || [],
        created_by: user.id
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    return res.status(201).json({ success: true, item: data });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;
