import { Router } from 'express';
import crypto from 'crypto';
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

// ── Bank Accounts ───────────────────────────────────────────────
router.get('/bank-accounts', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('bank_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, bankAccounts: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/bank-accounts/:id', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('bank_accounts')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Bank account not found' });
    return res.json({ success: true, bankAccount: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/bank-accounts/:id/summary', authenticate, requirePermission('finance:read'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('get_bank_account_summary', {
      p_bank_account_id: req.params.id
    });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/bank-accounts', authenticate, requirePermission('finance:write'), async (req, res) => {
  const {
    accountName,
    bankName,
    accountNumber,
    accountType,
    currency,
    swiftBicCode,
    branchName,
    branchAddress,
    description,
    openingBalance,
    isDefaultForSales,
    isDefaultForExpenses
  } = req.body;

  if (!accountName || !bankName || !accountNumber || !accountType) {
    return res.status(400).json({ error: 'accountName, bankName, accountNumber, and accountType are required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const bankAccountId = crypto.randomUUID();
    const insertData: any = {
      id: bankAccountId,
      account_name: accountName,
      bank_name: bankName,
      account_number: accountNumber,
      account_type: accountType,
      currency: currency || 'ETB',
      swift_bic_code: swiftBicCode,
      branch_name: branchName,
      branch_address: branchAddress,
      description,
      opening_balance: openingBalance || 0,
      current_balance: openingBalance || 0,
      is_default_for_sales: isDefaultForSales || false,
      is_default_for_expenses: isDefaultForExpenses || false,
      created_by: req.user!.id
    };

    const { data, error } = await supabaseAdmin
      .from('bank_accounts')
      .insert(insertData)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, bankAccount: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.put('/bank-accounts/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
  const {
    accountName,
    bankName,
    accountNumber,
    accountType,
    currency,
    isActive,
    isDefaultForSales,
    isDefaultForExpenses,
    swiftBicCode,
    branchName,
    branchAddress,
    description
  } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (accountName !== undefined) updateData.account_name = accountName;
    if (bankName !== undefined) updateData.bank_name = bankName;
    if (accountNumber !== undefined) updateData.account_number = accountNumber;
    if (accountType !== undefined) updateData.account_type = accountType;
    if (currency !== undefined) updateData.currency = currency;
    if (isActive !== undefined) updateData.is_active = isActive;
    if (isDefaultForSales !== undefined) updateData.is_default_for_sales = isDefaultForSales;
    if (isDefaultForExpenses !== undefined) updateData.is_default_for_expenses = isDefaultForExpenses;
    if (swiftBicCode !== undefined) updateData.swift_bic_code = swiftBicCode;
    if (branchName !== undefined) updateData.branch_name = branchName;
    if (branchAddress !== undefined) updateData.branch_address = branchAddress;
    if (description !== undefined) updateData.description = description;

    const { data, error } = await supabaseAdmin
      .from('bank_accounts')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Bank account not found' });
    return res.json({ success: true, bankAccount: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.delete('/bank-accounts/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { error } = await supabaseAdmin
      .from('bank_accounts')
      .delete()
      .eq('id', req.params.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, message: 'Bank account deleted' });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Expense Payment ─────────────────────────────────────────────
// Expense payment with bank account tracking
router.post('/expenses/:id/payment', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { bankAccountId, paymentMethod, paymentReference } = req.body;

  if (!paymentMethod) {
    return res.status(400).json({ error: 'paymentMethod is required' });
  }

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.rpc('update_expense_payment', {
      p_expense_id: req.params.id,
      p_bank_account_id: bankAccountId || null,
      p_payment_method: paymentMethod,
      p_payment_reference: paymentReference || null,
      p_user_id: req.user!.id
    });

    if (error) return res.status(500).json({ error: error.message });
    if (!data?.success) return res.status(400).json({ error: data?.error || 'Payment failed' });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── General Ledger (journal-entries PUT) ────────────────────────
router.put('/journal-entries/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { status } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('journal_entries')
      .update({
        status,
        posted_at: status === 'Posted' ? new Date().toISOString() : null
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, entry: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Accounts Payable ────────────────────────────────────────────
router.get('/ap/vendors', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ap_vendors')
      .select('*')
      .order('name');

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/ap/vendors', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { name, contactEmail, contactPhone, address, taxId, withholdingTaxRate, paymentTerms } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ap_vendors')
      .insert({
        name,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        address,
        tax_id: taxId,
        withholding_tax_rate: withholdingTaxRate,
        payment_terms: paymentTerms,
        created_by: req.user!.id
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, vendor: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/ap/bills', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ap_bills')
      .select(`
        *,
        ap_vendors(name),
        ap_bill_lines(*)
      `)
      .order('invoice_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/ap/bills', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { vendorId, invoiceNumber, invoiceDate, dueDate, subtotal, taxAmount, withholdingAmount, totalAmount, lines } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data: bill, error: billError } = await supabaseAdmin
      .from('ap_bills')
      .insert({
        vendor_id: vendorId,
        invoice_number: invoiceNumber,
        invoice_date: invoiceDate,
        due_date: dueDate,
        subtotal,
        tax_amount: taxAmount,
        withholding_amount: withholdingAmount,
        total_amount: totalAmount,
        status: 'Open',
        created_by: req.user!.id
      })
      .select()
      .single();

    if (billError) return res.status(500).json({ error: billError.message });

    if (lines && Array.isArray(lines)) {
      const { error: linesError } = await supabaseAdmin
        .from('ap_bill_lines')
        .insert(lines.map((line: any) => ({
          bill_id: bill.id,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unitPrice,
          line_total: line.lineTotal
        })));

      if (linesError) return res.status(500).json({ error: linesError.message });
    }

    return res.json({ success: true, bill });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Accounts Receivable ─────────────────────────────────────────
router.get('/ar/customers', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ar_customers')
      .select('*')
      .order('name');

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/ar/customers', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { name, contactEmail, contactPhone, address, taxId, creditLimit, category } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ar_customers')
      .insert({
        name,
        email: contactEmail,
        phone: contactPhone,
        address,
        tin: taxId,
        credit_limit: creditLimit,
        customer_type: category,
        is_active: true,
        created_by: req.user!.id
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, customer: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/ar/invoices', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('ar_invoices')
      .select(`
        *,
        ar_customers(name),
        ar_invoice_lines(*)
      `)
      .order('invoice_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// Guest folios with aging buckets
router.get('/ar/folios', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('folios')
      .select(`
        id, reservation_id, status, balance, total_charges, total_payments,
        opened_at, closed_at, currency
      `)
      .order('opened_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Fetch reservation details for guest name / room
    const reservationIds = (data || []).map((f: any) => f.reservation_id).filter(Boolean);
    let reservationMap: Record<string, any> = {};
    if (reservationIds.length > 0) {
      const { data: reservations } = await supabaseAdmin
        .from('reservations')
        .select('id, guest_name, room_number, check_in_date, check_out_date, payment_status')
        .in('id', reservationIds);
      (reservations || []).forEach((r: any) => { reservationMap[r.id] = r; });
    }

    const now = new Date();
    const foliosWithAging = (data || []).map((f: any) => {
      const openedDate = f.opened_at ? new Date(f.opened_at) : now;
      const daysOutstanding = Math.floor((now.getTime() - openedDate.getTime()) / (1000 * 60 * 60 * 24));
      const balance = Number(f.balance) || 0;
      let agingBucket = '0-30';
      if (daysOutstanding > 90) agingBucket = '90+';
      else if (daysOutstanding > 60) agingBucket = '61-90';
      else if (daysOutstanding > 30) agingBucket = '31-60';

      const reservation = f.reservation_id ? reservationMap[f.reservation_id] : null;
      return {
        id: f.id,
        reservation_id: f.reservation_id,
        guest_name: reservation?.guest_name || 'Unknown',
        room_number: reservation?.room_number || null,
        check_in_date: reservation?.check_in_date || null,
        check_out_date: reservation?.check_out_date || null,
        status: f.status,
        balance,
        total_charges: Number(f.total_charges) || 0,
        total_payments: Number(f.total_payments) || 0,
        opened_at: f.opened_at,
        closed_at: f.closed_at,
        payment_status: reservation?.payment_status || null,
        days_outstanding: daysOutstanding,
        aging_bucket: agingBucket,
      };
    });

    return res.json(foliosWithAging);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Fixed Assets ────────────────────────────────────────────────
router.get('/fixed-assets', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('fixed_assets')
      .select('*')
      .order('acquisition_date', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/fixed-assets', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { assetCode, name, description, category, acquisitionDate, acquisitionCost, usefulLife, depreciationMethod, salvageValue } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('fixed_assets')
      .insert({
        asset_code: assetCode,
        name,
        description,
        category,
        acquisition_date: acquisitionDate,
        acquisition_cost: acquisitionCost,
        useful_life: usefulLife,
        depreciation_method: depreciationMethod,
        salvage_value: salvageValue,
        current_book_value: acquisitionCost,
        accumulated_depreciation: 0,
        status: 'Active',
        created_by: req.user!.id
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, asset: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Tax Codes ───────────────────────────────────────────────────
router.get('/tax-codes', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('tax_codes')
      .select('*')
      .order('code');

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Budget vs Actual ────────────────────────────────────────────
router.get('/budget-actual', authenticate, requirePermission('finance:read'), async (req, res) => {
  const { period, accountCode } = req.query;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    let query = supabaseAdmin.from('budgets').select('*');

    if (period) query = query.eq('period', period);
    if (accountCode) query = query.eq('account_code', accountCode);

    const { data, error } = await query.order('period', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/budget-actual', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { budgetName, period, accountCode, department, budgetedAmount } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('budgets')
      .insert({
        budget_name: budgetName,
        period,
        account_code: accountCode,
        department,
        budgeted_amount: budgetedAmount,
        actual_amount: 0,
        variance: 0,
        variance_percent: 0,
        version: 'Draft',
        created_by: req.user!.id,
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, budget: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

// ── Period Close ────────────────────────────────────────────────
router.get('/period-close', authenticate, requirePermission('finance:read'), async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('period_close_workflow')
      .select('*')
      .order('period', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/period-close', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { period, lockType, notes } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('period_close_workflow')
      .insert({
        period,
        lock_type: lockType,
        status: 'In Progress',
        notes,
        initiated_by: req.user!.id
      })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, workflow: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.put('/period-close/:id', authenticate, requirePermission('finance:write'), async (req, res) => {
  const { status, notes } = req.body;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('period_close_workflow')
      .update({
        status,
        notes,
        completed_at: status === 'Closed' ? new Date().toISOString() : null
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, workflow: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
