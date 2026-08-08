import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// Get effective nightly rate from database (DB-only calculation)
router.get('/effective', authenticate, async (req, res) => {
  const { roomType, checkInDate, ratePlanId } = req.query;

  if (!roomType || !checkInDate) {
    return res.status(400).json({ error: 'roomType and checkInDate are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.rpc('get_effective_nightly_rate', {
        p_room_type: roomType,
        p_check_in_date: checkInDate,
        p_rate_plan_id: ratePlanId || null,
      });

      if (error) return res.status(500).json({ error: error.message });
      return res.json(data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
