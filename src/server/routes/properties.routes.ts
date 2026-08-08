import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

router.get('/', authenticate, async (_req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const [propsResult, orgsResult] = await Promise.all([
    supabaseAdmin.from('properties').select('*').eq('is_active', true).order('property_name'),
    supabaseAdmin.from('organizations').select('*').order('org_name'),
  ]);
  if (propsResult.error) return res.status(500).json({ error: propsResult.error.message });
  if (orgsResult.error) return res.status(500).json({ error: orgsResult.error.message });
  res.json({ properties: propsResult.data || [], organizations: orgsResult.data || [] });
});

router.post('/', authenticate, requirePermission('settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { property_name, property_code, organization_id, currency_code, property_type } = req.body;
  if (!property_name) return res.status(400).json({ error: 'property_name is required' });
  if (!organization_id) return res.status(400).json({ error: 'organization_id is required' });
  const { data, error } = await supabaseAdmin
    .from('properties')
    .insert({ property_name, property_code: property_code || property_name.toUpperCase().replace(/\s/g, '-'), organization_id, currency_code: currency_code || 'ETB', property_type: property_type || 'hotel' })
    .select('*')
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ property: data });
});

router.patch('/:id', authenticate, requirePermission('settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const allowed = ['property_name', 'property_code', 'property_type', 'currency_code', 'organization_id', 'is_active', 'contact_email', 'contact_phone', 'star_rating', 'timezone'];
  const updates: Record<string, any> = {};
  for (const f of allowed) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
  const { data, error } = await supabaseAdmin.from('properties').update(updates).eq('id', id).select('*').single();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ property: data });
});

router.delete('/:id', authenticate, requirePermission('settings:update'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return res.status(503).json({ error: 'Database not configured' });
  const { id } = req.params;
  const { error } = await supabaseAdmin.from('properties').update({ is_active: false }).eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

export default router;
