import { Router } from 'express';
import { authenticate, requireActiveAccount } from '../middleware/auth';
import { getRequestUser, userCan, verifyTotp, generateMfaSecret } from '../authHelpers';
import { enrichUserWithDerivedPermissions, writeAuditEvent, hasSupabaseAdminConfig, supabaseAdmin, mapSystemUserFromDb } from '../services/sharedServices';
import {
  authenticateUser, createSession, revokeRequestSession, clearSessionCookie,
  fetchPasswordPolicy, IS_FALLBACK_MODE,
} from '../services/sessionService';
import { validatePassword } from '../../lib/passwordPolicy';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

// Login
router.post('/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const auth = await authenticateUser(email, password, req);

  if (!auth.user) return res.status(auth.status).json({ error: auth.error || 'Invalid credentials' });

  const enrichedUser = await enrichUserWithDerivedPermissions(auth.user);
  await createSession(enrichedUser, req, res);
  await writeAuditEvent({ req, user: enrichedUser, action: 'login.success', module: 'auth', details: { forcePasswordChange: auth.forcePasswordChange } });
  res.json({ user: enrichedUser, forcePasswordChange: auth.forcePasswordChange || false });
});

// Logout
router.post('/logout', authenticate, async (req, res) => {
  if (req.user) await writeAuditEvent({ req, user: req.user, action: 'logout.success', module: 'auth' });
  await revokeRequestSession(req);
  clearSessionCookie(res);
  res.json({ success: true });
});

// Refresh session
router.post('/refresh', authenticate, requireActiveAccount, async (req, res) => {

  // Validate user account status before refreshing session
  if (req.user!.status === 'Inactive' || req.user!.status === 'Pending' || req.user!.status === 'Suspended' || req.user!.status === 'Locked') {
    await revokeRequestSession(req);
    clearSessionCookie(res);
    return res.status(403).json({ error: `Account is ${req.user!.status}` });
  }

  // Fetch fresh user data from database to ensure no account switching
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: dbUser, error } = await supabaseAdmin
      .from('system_users')
      .select('*')
      .eq('id', req.user!.id)
      .maybeSingle();

    if (error || !dbUser || dbUser.id !== req.user!.id) {
      await revokeRequestSession(req);
      clearSessionCookie(res);
      return res.status(401).json({ error: 'Account not found or invalid' });
    }

    if (dbUser.status !== 'Active') {
      await revokeRequestSession(req);
      clearSessionCookie(res);
      return res.status(403).json({ error: `Account is ${dbUser.status}` });
    }
  }

  await revokeRequestSession(req);
  await createSession(req.user!, req, res);
  res.json({ success: true });
});

// Change password
router.post('/change-password', authenticate, async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!newPassword) return res.status(400).json({ error: 'newPassword is required' });
  const policy = await fetchPasswordPolicy();
  const validation = validatePassword(newPassword, policy);
  if (!validation.valid) return res.status(400).json({ error: validation.errors.join('; ') });

  // Fallback mode: just validate password policy and return success
  if (IS_FALLBACK_MODE) {
    await writeAuditEvent({ req, user: req.user, action: 'password.change.success', module: 'auth', details: { mode: 'development-fallback' } });
    return res.json({ success: true });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: dbUser } = await supabaseAdmin.from('system_users').select('password_hash, force_password_change').eq('id', req.user!.id).maybeSingle();
    if (!dbUser?.password_hash) return res.status(500).json({ error: 'User record incomplete' });

    // Skip current password verification only on forced first-login change
    if (!dbUser.force_password_change) {
      if (!currentPassword) return res.status(400).json({ error: 'currentPassword is required' });
      const passwordOk = await bcrypt.compare(currentPassword, dbUser.password_hash);
      if (!passwordOk) {
        await writeAuditEvent({ req, user: req.user, action: 'password.change.failure', module: 'auth', outcome: 'failure', details: { reason: 'bad_current_password' } });
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await supabaseAdmin.from('system_users').update({ password_hash: newHash, password_updated_at: new Date().toISOString(), force_password_change: false }).eq('id', req.user!.id);
    await writeAuditEvent({ req, user: req.user, action: 'password.change.success', module: 'auth' });
    return res.json({ success: true });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Request password reset
router.post('/request-reset', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // Fallback mode: just return success message
  if (IS_FALLBACK_MODE) {
    await writeAuditEvent({ req, action: 'password.reset_requested', module: 'auth', details: { email, mode: 'development-fallback' } });
    return res.json({ success: true, message: 'If an account exists, a reset link has been generated.' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: dbUser } = await supabaseAdmin.from('system_users').select('id').eq('email', email).maybeSingle();
    if (dbUser) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60);
      await supabaseAdmin.from('system_users').update({ password_reset_token: token, password_reset_expires: expiresAt.toISOString() }).eq('id', dbUser.id);
    }
    await writeAuditEvent({ req, action: 'password.reset_requested', module: 'auth', details: { email } });
    return res.json({ success: true, message: 'If an account exists, a reset link has been generated.' });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Reset password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: 'token and newPassword are required' });
  const policy = await fetchPasswordPolicy();
  const validation = validatePassword(newPassword, policy);
  if (!validation.valid) return res.status(400).json({ error: validation.errors.join('; ') });

  // Fallback mode: just validate password policy and return success
  if (IS_FALLBACK_MODE) {
    await writeAuditEvent({ req, action: 'password.reset.success', module: 'auth', details: { mode: 'development-fallback' } });
    return res.json({ success: true });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: dbUser } = await supabaseAdmin.from('system_users').select('id, password_reset_expires').eq('password_reset_token', token).maybeSingle();
    if (!dbUser || !dbUser.password_reset_expires || new Date(dbUser.password_reset_expires).getTime() < Date.now()) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    await supabaseAdmin.from('system_users').update({ password_hash: newHash, password_updated_at: new Date().toISOString(), force_password_change: false, password_reset_token: null, password_reset_expires: null }).eq('id', dbUser.id);
    await writeAuditEvent({ req, action: 'password.reset.success', module: 'auth', details: { userId: dbUser.id } });
    return res.json({ success: true });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// MFA setup
router.post('/mfa-setup', authenticate, async (req, res) => {
  const targetUserId = String(req.body?.userId || req.user!.id);
  // Users can configure their own MFA; managing other users requires permission.
  if (targetUserId !== req.user!.id) {
    const allowed = await userCan(req.user ?? null, 'users:manage');
    if (!allowed) return res.status(403).json({ error: 'Insufficient privileges' });
  }
  const secret = generateMfaSecret();
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('system_users')
      .update({ mfa_secret: secret, mfa_enabled: true })
      .eq('id', targetUserId)
      .select('id, mfa_enabled')
      .single();
    if (error) return res.status(500).json({ error: error.message });
    await writeAuditEvent({ req, user: req.user, action: 'mfa.setup', module: 'auth', details: { targetUserId } });
    return res.json({ success: true, secret, userId: data.id });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Verify MFA
router.post('/verify-mfa', authenticate, async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'MFA code is required' });
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: dbUser } = await supabaseAdmin.from('system_users').select('mfa_enabled, mfa_secret, failed_mfa_count, mfa_locked_until').eq('id', req.user!.id).maybeSingle();
    if (!dbUser?.mfa_enabled) return res.json({ success: true, user: req.user });
    if (!dbUser?.mfa_secret) {
      return res.status(403).json({ error: 'MFA is enabled but no secret is configured. Set up MFA first.' });
    }

    // Check MFA lockout
    if (dbUser.mfa_locked_until && new Date(dbUser.mfa_locked_until).getTime() > Date.now()) {
      return res.status(423).json({ error: 'MFA locked due to too many failed attempts. Try again later.' });
    }

    if (!/^\d{6}$/.test(String(code))) return res.status(400).json({ error: 'Invalid MFA code format' });
    if (!verifyTotp(dbUser.mfa_secret, String(code))) {
      const newFailedCount = Number(dbUser.failed_mfa_count || 0) + 1;
      const lockoutUpdates: any = { failed_mfa_count: newFailedCount };
      if (newFailedCount >= 5) {
        lockoutUpdates.mfa_locked_until = new Date(Date.now() + 1000 * 60 * 30).toISOString();
      }
      await supabaseAdmin.from('system_users').update(lockoutUpdates).eq('id', req.user!.id);
      await writeAuditEvent({ req, user: req.user, action: 'mfa.verify.failure', module: 'auth', outcome: 'failure', details: { failedCount: newFailedCount, locked: newFailedCount >= 5 } });
      if (newFailedCount >= 5) {
        return res.status(423).json({ error: 'MFA locked due to too many failed attempts. Try again in 30 minutes.' });
      }
      return res.status(401).json({ error: 'Invalid MFA code' });
    }
    // Reset failed count on success
    await supabaseAdmin.from('system_users').update({ failed_mfa_count: 0, mfa_locked_until: null }).eq('id', req.user!.id);
    await writeAuditEvent({ req, user: req.user, action: 'mfa.verified', module: 'auth' });
    return res.json({ success: true, user: req.user });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Verify password
router.post('/verify-password', authenticate, async (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: 'Password is required' });
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: dbUser } = await supabaseAdmin.from('system_users').select('password_hash').eq('id', req.user!.id).maybeSingle();
    if (!dbUser?.password_hash) return res.status(500).json({ error: 'User record incomplete' });
    const passwordOk = await bcrypt.compare(password, dbUser.password_hash);
    if (!passwordOk) {
      await writeAuditEvent({ req, user: req.user, action: 'password.verify.failure', module: 'auth', outcome: 'failure', details: { reason: 'bad_password' } });
      return res.status(401).json({ error: 'Incorrect password' });
    }
    await writeAuditEvent({ req, user: req.user, action: 'password.verify.success', module: 'auth' });
    return res.json({ success: true });
  }
  // Development fallback: accept any non-empty password when database is not configured
  if (IS_FALLBACK_MODE && password.length > 0) {
    await writeAuditEvent({ req, user: req.user, action: 'password.verify.success', module: 'auth', details: { mode: 'development-fallback' } });
    return res.json({ success: true });
  }
  if (IS_FALLBACK_MODE) {
    return res.status(400).json({ error: 'Password is required' });
  }
});

export default router;
