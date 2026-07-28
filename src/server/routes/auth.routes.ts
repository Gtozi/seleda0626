import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getRequestUser, userCan } from '../authHelpers';
import { enrichUserWithDerivedPermissions, writeAuditEvent, hasSupabaseAdminConfig, supabaseAdmin, mapSystemUserFromDb } from '../services/sharedServices';

// Re-export for server.ts backward compatibility
export { enrichUserWithDerivedPermissions };

const router = Router();

// Verify session
router.get('/verify', async (req, res) => {
  const user = await getRequestUser(req);
  if (!user) return res.status(401).json({ error: 'Not authenticated' });
  const enriched = await enrichUserWithDerivedPermissions(user);
  res.json({ user: enriched });
});

// Validate permission
router.post('/validate-permission', authenticate, async (req, res) => {
  const action = String(req.body?.action || '');
  const allowed = await userCan(req.user ?? null, action);
  if (!allowed && req.user) {
    await writeAuditEvent({ req, user: req.user, action: 'permission.denied', module: 'auth', outcome: 'denied', details: { requestedAction: action } });
  }
  res.status(req.user ? 200 : 401).json({ allowed, reason: allowed ? undefined : req.user ? 'Insufficient privileges' : 'Not authenticated' });
});

// Get current user's full profile
router.get('/profile', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('system_users')
    .select('*')
    .eq('id', req.user!.id)
    .maybeSingle();
  if (error || !data) return res.status(404).json({ error: 'User not found' });
  res.json({ user: mapSystemUserFromDb(data) });
});

// Update current user's profile (self-service)
router.patch('/profile', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { name, email, mobileNumber, username } = req.body || {};
  const payload: Record<string, any> = {};
  if (name !== undefined) {
    payload.name = name;
    payload.avatar_initials = name?.slice(0, 2).toUpperCase() || 'U';
  }
  if (email !== undefined) payload.email = String(email).toLowerCase();
  if (mobileNumber !== undefined) payload.mobile_number = mobileNumber || null;
  if (username !== undefined) payload.username = username || null;

  if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });

  const { data, error } = await supabaseAdmin
    .from('system_users')
    .update(payload)
    .eq('id', req.user!.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await writeAuditEvent({ req, user: req.user!, action: 'profile.updated', module: 'auth', details: { fields: Object.keys(payload) } });
  res.json({ success: true, user: mapSystemUserFromDb(data) });
});

// Get current user's active sessions
router.get('/sessions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin
    .from('user_sessions')
    .select('id, created_at, expires_at, ip_address, user_agent, revoked_at')
    .eq('user_id', req.user!.id)
    .order('created_at', { ascending: false })
    .limit(20);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ sessions: data || [] });
});

// Revoke a session (self-service)
router.delete('/sessions/:sessionId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { sessionId } = req.params;
  const { error } = await supabaseAdmin
    .from('user_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', req.user!.id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'session.revoked', module: 'auth', details: { sessionId } });
  res.json({ success: true });
});

export default router;
