import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';
import { giftShopSaleSchema, giftShopIssueSchema } from '../../schemas/giftShopSchema';

const router = Router();

// ── Gift Shop Sales ────────────────────────────────────────────

router.post('/sales', authenticate, requirePermission('pos:operate'), async (req, res) => {
  const validation = giftShopSaleSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('gift_shop_sales').insert(validation.data).select('id').single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'gift_shop_sale.created', entityType: 'GiftShopSale', entityId: data?.id, module: 'gift_shop' });
  res.json({ success: true, id: data?.id });
});

router.patch('/sales/:id/status', authenticate, requirePermission('pos:operate'), async (req, res) => {
  const statusSchema = z.object({ status: z.enum(['Pending', 'Completed', 'Cancelled']) });
  const validation = statusSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('gift_shop_sales').update(validation.data).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'gift_shop_sale.status_changed', entityType: 'GiftShopSale', entityId: id, module: 'gift_shop', details: validation.data });
  res.json({ success: true });
});

// ── Gift Shop Issues ───────────────────────────────────────────

router.post('/issues', authenticate, requirePermission('pos:operate'), async (req, res) => {
  const validation = giftShopIssueSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { data, error } = await supabaseAdmin.from('gift_shop_issues').insert(validation.data).select('id').single();
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'gift_shop_issue.created', entityType: 'GiftShopIssue', entityId: data?.id, module: 'gift_shop' });
  res.json({ success: true, id: data?.id });
});

router.delete('/issues/:id', authenticate, requirePermission('pos:operate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('gift_shop_issues').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  await writeAuditEvent({ req, user: req.user!, action: 'gift_shop_issue.deleted', entityType: 'GiftShopIssue', entityId: id, module: 'gift_shop' });
  res.json({ success: true });
});

export default router;
