/**
 * Manager PIN Routes
 * Phase 4 Item 1: Backend-verified hashed PIN for POS void/discount approvals
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// POST /verify — verify a manager PIN
router.post('/verify', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { pin, outlet_id, context } = req.body || {};
  if (!pin) return res.status(400).json({ error: 'PIN is required' });

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { data, error } = await supabaseAdmin.rpc('verify_manager_pin', {
    p_user_id: userId,
    p_pin: pin,
    p_outlet_id: outlet_id || null,
    p_context: context || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// POST /set — set or change manager PIN
router.post('/set', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { pin } = req.body || {};
  if (!pin) return res.status(400).json({ error: 'PIN is required' });

  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { data, error } = await supabaseAdmin.rpc('set_manager_pin', {
    p_user_id: userId,
    p_pin: pin,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// POST /reset — reset a user's manager PIN (admin only)
router.post('/reset', authenticate, requirePermission('user_management:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { user_id } = req.body || {};
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  const adminId = req.user?.id;
  if (!adminId) return res.status(401).json({ error: 'Not authenticated' });

  const { data, error } = await supabaseAdmin.rpc('reset_manager_pin', {
    p_user_id: user_id,
    p_admin_user_id: adminId,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

// GET /status — check if current user has a PIN set
router.get('/status', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Not authenticated' });

  const { data, error } = await supabaseAdmin
    .from('system_users')
    .select('manager_pin_hash, manager_pin_set_at, manager_pin_attempts, manager_pin_locked_until')
    .eq('id', userId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    hasPin: !!data?.manager_pin_hash,
    pinSetAt: data?.manager_pin_set_at || null,
    isLocked: !!data?.manager_pin_locked_until && new Date(data.manager_pin_locked_until) > new Date(),
    lockedUntil: data?.manager_pin_locked_until || null,
    attempts: data?.manager_pin_attempts || 0,
  });
});

// GET /audit — get PIN audit log (admin only)
router.get('/audit', authenticate, requirePermission('user_management:read'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { limit = '50' } = req.query as Record<string, string>;

  const { data, error } = await supabaseAdmin
    .from('manager_pin_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(Number(limit));

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

export default router;
