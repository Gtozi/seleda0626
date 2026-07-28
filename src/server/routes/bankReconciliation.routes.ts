import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Bank Accounts ───────────────────────────────────────────────
router.get('/accounts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('bank_accounts')
    .select('*')
    .order('account_name');
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/accounts', authenticate, requirePermission('finance:bank:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { accountNumber, accountName, bankName, currency } = req.body || {};
  if (!accountNumber || !accountName || !bankName) {
    return res.status(400).json({ error: 'accountNumber, accountName and bankName are required' });
  }

  const { data, error } = await supabaseAdmin.from('bank_accounts').insert({
    account_number: accountNumber,
    account_name: accountName,
    bank_name: bankName,
    currency: currency || 'ETB',
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

// ── Statement Lines ──────────────────────────────────────────────
router.get('/statement-lines', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { bankAccountId, status } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('bank_statement_lines').select('*').order('statement_date', { ascending: false });
  if (bankAccountId) q = q.eq('bank_account_id', bankAccountId);
  if (status) q = q.eq('status', status);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/statement-lines/import', authenticate, requirePermission('finance:bank:import'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { bankAccountId, lines } = req.body || {};
  if (!bankAccountId || !Array.isArray(lines)) {
    return res.status(400).json({ error: 'bankAccountId and lines array are required' });
  }

  const { data, error } = await supabaseAdmin.rpc('import_bank_statement_lines', {
    p_bank_account_id: bankAccountId,
    p_lines: JSON.stringify(lines),
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || { success: true });
});

router.post('/statement-lines/:id/match', authenticate, requirePermission('finance:bank:match'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { journalLineId } = req.body || {};
  if (!journalLineId) {
    return res.status(400).json({ error: 'journalLineId is required' });
  }

  const { data, error } = await supabaseAdmin.rpc('match_statement_line', {
    p_statement_line_id: req.params.id,
    p_journal_line_id: journalLineId,
  });

  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || { success: true });
});

// ── Reconciliation Batches ───────────────────────────────────────
router.get('/batches', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { bankAccountId } = req.query as Record<string, string>;
  let q = supabaseAdmin.from('reconciliation_batches').select('*, bank_accounts(account_name, account_number)').order('period_start', { ascending: false });
  if (bankAccountId) q = q.eq('bank_account_id', bankAccountId);
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data || []);
});

router.post('/batches', authenticate, requirePermission('finance:bank:reconcile'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { bankAccountId, periodStart, periodEnd, openingBalance, closingBalance } = req.body || {};
  if (!bankAccountId || !periodStart || !periodEnd) {
    return res.status(400).json({ error: 'bankAccountId, periodStart and periodEnd are required' });
  }

  const { data, error } = await supabaseAdmin.from('reconciliation_batches').insert({
    bank_account_id: bankAccountId,
    period_start: periodStart,
    period_end: periodEnd,
    opening_balance: Number(openingBalance) || 0,
    closing_balance: Number(closingBalance) || 0,
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(201).json(data);
});

export default router;
