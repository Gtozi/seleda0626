import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// Run night audit
router.post('/run', authenticate, requirePermission('night_audit:run'), async (req, res) => {

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('run_night_audit', {
      p_user_id: req.user!.id,
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(409).json({ error: data?.error || 'Night audit failed' });

    return res.json({ success: true, ...data });
  }

  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
