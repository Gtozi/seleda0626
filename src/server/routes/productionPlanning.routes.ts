/**
 * Central Production Planning Routes
 * Phase 3 Item 1: Prep list generation, management, and KDS push
 */
import { Router } from 'express';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// GET /forecast-covers — compute forecast covers from reservations, banquets, POS history
router.get('/forecast-covers', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { date, outlet_id } = req.query as Record<string, string>;
  const planningDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin.rpc('compute_forecast_covers', {
    p_planning_date: planningDate,
    p_outlet_id: outlet_id || null,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /generate — generate a prep list with suggested production quantities
router.get('/generate', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, date, meal_period, ppc_kitchen, ppc_bar } = req.query as Record<string, string>;

  if (!outlet_id) return res.status(400).json({ error: 'outlet_id is required' });

  const planningDate = date || new Date().toISOString().split('T')[0];

  const { data, error } = await supabaseAdmin.rpc('generate_prep_list', {
    p_outlet_id: outlet_id,
    p_planning_date: planningDate,
    p_meal_period: meal_period || 'all',
    p_portions_per_cover_kitchen: ppc_kitchen ? parseFloat(ppc_kitchen) : 0.5,
    p_portions_per_cover_bar: ppc_bar ? parseFloat(ppc_bar) : 0.3,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /prep-lists — list saved prep lists
router.get('/prep-lists', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { outlet_id, date, status } = req.query as Record<string, string>;

  let q = supabaseAdmin
    .from('production_prep_lists')
    .select('*')
    .order('prep_date', { ascending: false })
    .limit(50);
  if (outlet_id) q = q.eq('outlet_id', outlet_id);
  if (date) q = q.eq('prep_date', date);
  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

// GET /prep-lists/:id — get a prep list with its lines
router.get('/prep-lists/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;

  const { data: prepList, error: plError } = await supabaseAdmin
    .from('production_prep_lists')
    .select('*')
    .eq('id', id)
    .single();
  if (plError) return res.status(404).json({ error: 'Prep list not found' });

  const { data: lines, error: linesError } = await supabaseAdmin
    .from('production_prep_list_lines')
    .select('*')
    .eq('prep_list_id', id)
    .order('recipe_source')
    .order('recipe_name');

  if (linesError) return res.status(500).json({ error: linesError.message });

  return res.json({ ...prepList, lines: lines || [] });
});

// POST /prep-lists — save a new prep list with lines
router.post('/prep-lists', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { lines, ...listFields } = req.body;

  const { data: prepList, error: plError } = await supabaseAdmin
    .from('production_prep_lists')
    .insert({
      ...listFields,
      total_demand: listFields.total_demand || (listFields.forecast_covers || 0),
      status: 'draft',
    })
    .select()
    .single();

  if (plError) return res.status(500).json({ error: plError.message });

  if (lines && lines.length > 0) {
    const lineRecords = lines.map((line: any) => ({
      ...line,
      prep_list_id: prepList.id,
      status: 'pending',
    }));
    const { error: linesError } = await supabaseAdmin
      .from('production_prep_list_lines')
      .insert(lineRecords);
    if (linesError) return res.status(500).json({ error: linesError.message });
  }

  return res.status(201).json({ id: prepList.id });
});

// PATCH /prep-lists/:id/approve — approve a prep list
router.patch('/prep-lists/:id/approve', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;
  const { approved_by } = req.body;

  const { error } = await supabaseAdmin
    .from('production_prep_lists')
    .update({
      status: 'approved',
      approved_by,
      approved_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });

  // Also approve all lines
  await supabaseAdmin
    .from('production_prep_list_lines')
    .update({ status: 'approved' })
    .eq('prep_list_id', id)
    .eq('status', 'pending');

  return res.json({ success: true });
});

// PATCH /prep-list-lines/:lineId — update a single line (status, prep_station_id, notes)
router.patch('/prep-list-lines/:lineId', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { lineId } = req.params;
  const updates: Record<string, any> = {};
  for (const f of ['status', 'prep_station_id', 'notes']) {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  }

  const { error } = await supabaseAdmin
    .from('production_prep_list_lines')
    .update(updates)
    .eq('id', lineId);

  if (error) return res.status(500).json({ error: error.message });
  return res.json({ success: true });
});

// POST /prep-lists/:id/push-kds — push approved prep list lines to KDS as orders
router.post('/prep-lists/:id/push-kds', authenticate, requirePermission('fb:kitchen:write'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { id } = req.params;

  // Get prep list with outlet
  const { data: prepList, error: plError } = await supabaseAdmin
    .from('production_prep_lists')
    .select('outlet_id, status')
    .eq('id', id)
    .single();
  if (plError || !prepList) return res.status(404).json({ error: 'Prep list not found' });
  if (prepList.status !== 'approved') return res.status(400).json({ error: 'Prep list must be approved first' });

  // Get approved lines with prep_station_id
  const { data: lines, error: linesError } = await supabaseAdmin
    .from('production_prep_list_lines')
    .select('*')
    .eq('prep_list_id', id)
    .eq('status', 'approved')
    .not('prep_station_id', 'is', null);

  if (linesError) return res.status(500).json({ error: linesError.message });

  let pushed = 0;
  for (const line of lines || []) {
    // Find KDS connection for this outlet + prep station
    const { data: kdsConn } = await supabaseAdmin
      .from('kds_pos_connections')
      .select('kds_instance_id')
      .eq('outlet_id', prepList.outlet_id)
      .eq('prep_station_id', line.prep_station_id)
      .eq('is_active', true)
      .maybeSingle();

    if (!kdsConn) continue;

    // Create a KDS order
    const { error: orderError } = await supabaseAdmin
      .from('kds_orders')
      .insert({
        kds_instance_id: kdsConn.kds_instance_id,
        outlet_id: prepList.outlet_id,
        order_id: `PREP-${id.substring(0, 8)}-${line.id.substring(0, 4)}`,
        order_type: 'prep_list',
        station_id: line.prep_station_id,
        items: [{
          name: line.recipe_name,
          qty: line.suggested_production_qty,
          unit: line.yield_unit,
          recipe_source: line.recipe_source,
        }],
        status: 'pending',
        prep_list_id: id,
        prep_list_line_id: line.id,
      });

    if (!orderError) {
      pushed++;
      // Mark line as in_production
      await supabaseAdmin
        .from('production_prep_list_lines')
        .update({ status: 'in_production' })
        .eq('id', line.id);
    }
  }

  // Update prep list status
  await supabaseAdmin
    .from('production_prep_lists')
    .update({ status: 'in_production' })
    .eq('id', id);

  return res.json({ success: true, pushed });
});

export default router;
