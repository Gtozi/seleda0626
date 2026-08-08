import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

router.get('/calculate-breakdown', authenticate, async (req, res) => {
  const { baseAmount, discountPercent, reservationId } = req.query;

  const hasBase = baseAmount !== undefined && baseAmount !== '' && !isNaN(Number(baseAmount));
  const hasReservation = reservationId !== undefined && reservationId !== '';

  if (!hasBase && !hasReservation) {
    return res.status(400).json({ error: 'Either baseAmount or reservationId is required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin.rpc('calculate_billing_breakdown', {
        p_base_amount: hasBase ? Number(baseAmount) : null,
        p_discount_percent: discountPercent ? Number(discountPercent) : 0,
        p_reservation_id: hasReservation ? String(reservationId) : null,
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
