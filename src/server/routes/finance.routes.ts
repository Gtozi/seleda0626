import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';
import { currencyService } from '../services/currencyService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── API Version Header Middleware ─────────────────────────────────
router.use((req, res, next) => {
  res.setHeader('API-Version', '1.0');
  next();
});

// ── Chart of Accounts ─────────────────────────────────────────
router.get('/chart-of-accounts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = 'chart-of-accounts:all';
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  const { data, error } = await supabaseAdmin
    .from('usali_chart_of_accounts')
    .select('*')
    .order('code');
  if (error) return res.status(500).json({ error: error.message });
  
  const result = data || [];
  cacheService.set(cacheKey, result, 10 * 60 * 1000); // 10 minute TTL
  return res.json(result);
});

// ── Journal Entries ─────────────────────────────────────────────
router.get('/journal-entries', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { period, status, page = '1', limit = '50' } = req.query as Record<string, string>;
  
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 50;
  const offset = (pageNum - 1) * limitNum;
  
  let q = supabaseAdmin
    .from('journal_entries')
    .select('*, journal_lines(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limitNum - 1);
  
  if (period) q = q.eq('period', period);
  if (status) q = q.eq('status', status);
  
  const { data, error, count } = await q;
  if (error) return res.status(500).json({ error: error.message });
  
  return res.json({
    data: data || [],
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limitNum),
    },
  });
});

router.get('/journal-entries/:id', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data, error } = await supabaseAdmin
    .from('journal_entries')
    .select('*, journal_lines(*)')
    .eq('id', req.params.id)
    .single();
  if (error) return res.status(500).json({ error: error.message });
  return res.json(data);
});

router.post('/journal-entries', authenticate, requirePermission('finance:journal:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { date, period, source, reference, description, department, lines } = req.body || {};
  if (!date || !period || !description || !Array.isArray(lines) || lines.length < 2) {
    return res.status(400).json({ error: 'date, period, description and at least two lines are required' });
  }

  const totalDebit = lines.reduce((sum: number, l: any) => sum + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((sum: number, l: any) => sum + (Number(l.credit) || 0), 0);
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    return res.status(400).json({ error: 'Journal entry is out of balance', totalDebit, totalCredit });
  }

  const id = `je_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const userId = req.user?.id || null;

  const { data: entry, error: entryError } = await supabaseAdmin.from('journal_entries').insert({
    id,
    date,
    period,
    source: source || 'Manual',
    reference: reference || null,
    description,
    status: 'Draft',
    total_debit: totalDebit,
    total_credit: totalCredit,
    department: department || null,
    created_by: userId,
  }).select().single();

  if (entryError) return res.status(500).json({ error: entryError.message });

  const lineRows = lines.map((l: any, idx: number) => ({
    journal_id: id,
    account_code: l.accountCode || l.account_code,
    account_name: l.accountName || l.account_name || '',
    description: l.description || '',
    debit: Number(l.debit) || 0,
    credit: Number(l.credit) || 0,
    currency: l.currency || 'ETB',
    exchange_rate: l.exchangeRate || l.exchange_rate || 1.0,
    cost_center: l.costCenter || l.cost_center || null,
    tax_code: l.taxCode || l.tax_code || null,
    memo: l.memo || null,
    line_number: idx + 1,
  }));

  const { error: linesError } = await supabaseAdmin.from('journal_lines').insert(lineRows);
  if (linesError) return res.status(500).json({ error: linesError.message });

  // Invalidate journal entries cache
  cacheService.invalidatePattern('journal-entries:*');

  return res.status(201).json({ success: true, entry });
});

router.post('/journal-entries/:id/post', authenticate, requirePermission('finance:journal:post'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('journal_entries')
    .select('*, journal_lines(*)')
    .eq('id', req.params.id)
    .single();
  if (entryError || !entry) return res.status(404).json({ error: entryError?.message || 'Journal entry not found' });
  if (entry.status !== 'Draft') return res.status(409).json({ error: `Entry is already ${entry.status}` });

  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('usali_chart_of_accounts')
    .select('code, normal_balance, balance')
    .in('code', (entry.journal_lines as any[]).map(l => l.account_code));
  if (accountsError) return res.status(500).json({ error: accountsError.message });

  const balanceMap = new Map((accounts || []).map(a => [a.code, Number(a.balance) || 0]));
  const normalMap = new Map((accounts || []).map(a => [a.code, a.normal_balance]));

  for (const line of entry.journal_lines as any[]) {
    const normal = normalMap.get(line.account_code);
    let delta = Number(line.debit) - Number(line.credit);
    if (normal === 'Credit') delta = -delta;
    balanceMap.set(line.account_code, (balanceMap.get(line.account_code) || 0) + delta);
  }

  const updates = Array.from(balanceMap.entries()).map(([code, balance]) =>
    supabaseAdmin.from('usali_chart_of_accounts').update({ balance }).eq('code', code)
  );

  const { error: postError } = await supabaseAdmin.from('journal_entries').update({
    status: 'Posted',
    posted_at: new Date().toISOString(),
    approved_by: req.user?.id || null,
    updated_at: new Date().toISOString(),
  }).eq('id', req.params.id);
  if (postError) return res.status(500).json({ error: postError.message });

  await Promise.all(updates);

  // Invalidate chart of accounts cache since balances changed
  cacheService.invalidate('chart-of-accounts:all');
  cacheService.invalidatePattern('journal-entries:*');

  return res.json({ success: true, posted: true });
});

router.post('/journal-entries/:id/reverse', authenticate, requirePermission('finance:journal:post'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { data: entry, error: entryError } = await supabaseAdmin
    .from('journal_entries')
    .select('*, journal_lines(*)')
    .eq('id', req.params.id)
    .single();
  if (entryError || !entry) return res.status(404).json({ error: entryError?.message || 'Journal entry not found' });
  if (entry.status !== 'Posted') return res.status(409).json({ error: 'Only posted entries can be reversed' });

  const reverseId = `je_rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const { data: newEntry, error: createError } = await supabaseAdmin.from('journal_entries').insert({
    id: reverseId,
    date: new Date().toISOString().split('T')[0],
    period: entry.period,
    source: 'Manual',
    reference: `Reversal of ${entry.reference || entry.id}`,
    description: `Reversal: ${entry.description}`,
    status: 'Draft',
    total_debit: entry.total_credit,
    total_credit: entry.total_debit,
    department: entry.department,
    created_by: req.user?.id || null,
  }).select().single();
  if (createError) return res.status(500).json({ error: createError.message });

  const reverseLines = (entry.journal_lines as any[]).map((l: any, idx: number) => ({
    journal_id: reverseId,
    account_code: l.account_code,
    account_name: l.account_name,
    description: `Reversal: ${l.description || ''}`,
    debit: Number(l.credit) || 0,
    credit: Number(l.debit) || 0,
    currency: l.currency || 'ETB',
    exchange_rate: l.exchange_rate || 1.0,
    cost_center: l.cost_center || null,
    tax_code: l.tax_code || null,
    memo: l.memo || null,
    line_number: idx + 1,
  }));

  const { error: linesError } = await supabaseAdmin.from('journal_lines').insert(reverseLines);
  if (linesError) return res.status(500).json({ error: linesError.message });

  await supabaseAdmin.from('journal_entries').update({ status: 'Reversed', updated_at: new Date().toISOString() }).eq('id', req.params.id);

  // Optionally auto-post the reversing entry
  await supabaseAdmin.from('journal_entries').update({ status: 'Posted', posted_at: new Date().toISOString(), approved_by: req.user?.id || null }).eq('id', reverseId);

  // Invalidate caches
  cacheService.invalidate('chart-of-accounts:all');
  cacheService.invalidatePattern('journal-entries:*');

  return res.json({ success: true, reversedEntryId: reverseId, newEntry });
});

// ── Currency Management ─────────────────────────────────────────
router.get('/currencies', authenticate, async (req, res) => {
  const currencies = currencyService.getCurrencies();
  return res.json(currencies);
});

router.get('/currencies/:code', authenticate, async (req, res) => {
  const currency = currencyService.getCurrency(req.params.code);
  if (!currency) {
    return res.status(404).json({ error: 'Currency not found' });
  }
  return res.json(currency);
});

router.get('/exchange-rates', authenticate, async (req, res) => {
  const rates = currencyService.getExchangeRates();
  return res.json(rates);
});

router.post('/exchange-rates', authenticate, requirePermission('finance:settings:update'), async (req, res) => {
  const { rates, effectiveDate } = req.body || {};
  if (!rates || typeof rates !== 'object') {
    return res.status(400).json({ error: 'rates object is required' });
  }

  currencyService.updateExchangeRates(rates, effectiveDate);

  // Invalidate any cached financial data that depends on exchange rates
  cacheService.invalidatePattern('chart-of-accounts:*');
  cacheService.invalidatePattern('journal-entries:*');

  return res.json({ 
    success: true, 
    rates: currencyService.getExchangeRates(),
    effectiveDate: effectiveDate || currencyService['effectiveDate'],
  });
});

router.post('/convert', authenticate, async (req, res) => {
  const { amount, fromCurrency, toCurrency } = req.body || {};
  if (!amount || !fromCurrency || !toCurrency) {
    return res.status(400).json({ error: 'amount, fromCurrency, and toCurrency are required' });
  }

  if (!currencyService.isCurrencySupported(fromCurrency)) {
    return res.status(400).json({ error: `Currency ${fromCurrency} is not supported` });
  }

  if (!currencyService.isCurrencySupported(toCurrency)) {
    return res.status(400).json({ error: `Currency ${toCurrency} is not supported` });
  }

  const converted = currencyService.convert(Number(amount), fromCurrency, toCurrency);
  const rate = currencyService.getExchangeRate(fromCurrency, toCurrency);

  return res.json({
    amount: Number(amount),
    fromCurrency,
    toCurrency,
    convertedAmount: converted,
    exchangeRate: rate,
    formattedOriginal: currencyService.format(Number(amount), fromCurrency),
    formattedConverted: currencyService.format(converted, toCurrency),
  });
});

export default router;
