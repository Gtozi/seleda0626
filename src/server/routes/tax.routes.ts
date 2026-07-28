import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Tax Configuration ─────────────────────────────────────────────
// Define tax jurisdictions and their rates
router.post('/jurisdictions', authenticate, requirePermission('finance:tax:configure'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { jurisdiction, taxType, rate, effectiveDate, description } = req.body || {};
  
  if (!jurisdiction || !taxType || rate === undefined) {
    return res.status(400).json({ error: 'jurisdiction, taxType, and rate are required' });
  }

  const { data, error } = await supabaseAdmin.from('tax_jurisdictions').insert({
    jurisdiction,
    tax_type: taxType,
    rate: Number(rate),
    effective_date: effectiveDate || new Date().toISOString().split('T')[0],
    description,
    is_active: true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate tax cache
  cacheService.invalidatePattern('tax:*');

  return res.status(201).json(data);
});

// Get all tax jurisdictions
router.get('/jurisdictions', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { activeOnly } = req.query as Record<string, string>;
  
  let q = supabaseAdmin.from('tax_jurisdictions').select('*').order('effective_date', { ascending: false });
  if (activeOnly === 'true') q = q.eq('is_active', true);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

// Update tax rate for a jurisdiction
router.put('/jurisdictions/:id', authenticate, requirePermission('finance:tax:configure'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { rate, effectiveDate, isActive } = req.body || {};
  
  const updateData: any = {};
  if (rate !== undefined) updateData.rate = Number(rate);
  if (effectiveDate) updateData.effective_date = effectiveDate;
  if (isActive !== undefined) updateData.is_active = isActive;
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from('tax_jurisdictions')
    .update(updateData)
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate tax cache
  cacheService.invalidatePattern('tax:*');

  return res.json(data);
});

// ── VAT Reconciliation ────────────────────────────────────────────
// Reconcile VAT collected vs VAT payable
router.get('/vat/reconciliation', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, jurisdiction } = req.query as Record<string, string>;
  
  const cacheKey = `vat-reconciliation:${period || 'all'}:${jurisdiction || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get VAT collected (sales tax)
  let vatCollectedQuery = supabaseAdmin
    .from('tax_transactions')
    .select('*')
    .eq('tax_type', 'VAT')
    .eq('transaction_type', 'Collected');
  
  if (period) vatCollectedQuery = vatCollectedQuery.eq('period', period);
  if (jurisdiction) vatCollectedQuery = vatCollectedQuery.eq('jurisdiction', jurisdiction);
  
  const { data: vatCollected, error: collectedError } = await vatCollectedQuery;
  if (collectedError) return res.status(500).json({ error: collectedError.message });

  // Get VAT paid (input tax on purchases)
  let vatPaidQuery = supabaseAdmin
    .from('tax_transactions')
    .select('*')
    .eq('tax_type', 'VAT')
    .eq('transaction_type', 'Paid');
  
  if (period) vatPaidQuery = vatPaidQuery.eq('period', period);
  if (jurisdiction) vatPaidQuery = vatPaidQuery.eq('jurisdiction', jurisdiction);
  
  const { data: vatPaid, error: paidError } = await vatPaidQuery;
  if (paidError) return res.status(500).json({ error: paidError.message });

  const totalCollected = (vatCollected || []).reduce((sum, t) => sum + Number(t.amount), 0);
  const totalPaid = (vatPaid || []).reduce((sum, t) => sum + Number(t.amount), 0);
  const netVat = totalCollected - totalPaid;

  const result = {
    period: period || 'All Periods',
    jurisdiction: jurisdiction || 'All Jurisdictions',
    vatCollected: {
      total: totalCollected,
      transactions: vatCollected || [],
    },
    vatPaid: {
      total: totalPaid,
      transactions: vatPaid || [],
    },
    netVat,
    status: netVat > 0 ? 'Payable' : netVat < 0 ? 'Refundable' : 'Balanced',
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000); // 10 minute TTL
  return res.json(result);
});

// Record VAT transaction
router.post('/vat/transactions', authenticate, requirePermission('finance:tax:record'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    transactionId,
    transactionType, // 'Collected' or 'Paid'
    amount,
    period,
    jurisdiction,
    reference,
    description,
  } = req.body || {};
  
  if (!transactionId || !transactionType || amount === undefined || !period || !jurisdiction) {
    return res.status(400).json({ 
      error: 'transactionId, transactionType, amount, period, and jurisdiction are required' 
    });
  }

  const { data, error } = await supabaseAdmin.from('tax_transactions').insert({
    transaction_id: transactionId,
    tax_type: 'VAT',
    transaction_type: transactionType,
    amount: Number(amount),
    period,
    jurisdiction,
    reference,
    description,
    recorded_by: req.user?.id,
    recorded_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate VAT reconciliation cache
  cacheService.invalidatePattern('vat-reconciliation:*');

  return res.status(201).json(data);
});

// ── Multi-Tax Rate Support ────────────────────────────────────────
// Calculate tax with multiple rates
router.post('/calculate', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { amount, taxJurisdictions, date } = req.body || {};
  
  if (!amount || !taxJurisdictions || !Array.isArray(taxJurisdictions)) {
    return res.status(400).json({ error: 'amount and taxJurisdictions array are required' });
  }

  const effectiveDate = date || new Date().toISOString().split('T')[0];
  const taxCalculations = [];
  let totalTax = 0;

  for (const taxJurisdiction of taxJurisdictions) {
    const { data: rate, error: rateError } = await supabaseAdmin
      .from('tax_jurisdictions')
      .select('*')
      .eq('jurisdiction', taxJurisdiction)
      .eq('is_active', true)
      .lte('effective_date', effectiveDate)
      .order('effective_date', { ascending: false })
      .limit(1)
      .single();

    if (rateError || !rate) {
      return res.status(400).json({ 
        error: `No active tax rate found for jurisdiction: ${taxJurisdiction}` 
      });
    }

    const taxAmount = amount * (Number(rate.rate) / 100);
    totalTax += taxAmount;

    taxCalculations.push({
      jurisdiction: taxJurisdiction,
      rate: Number(rate.rate),
      taxAmount,
      taxType: rate.tax_type,
    });
  }

  return res.json({
    amount,
    effectiveDate,
    taxes: taxCalculations,
    totalTax,
    totalWithTax: amount + totalTax,
  });
});

// Get tax summary by jurisdiction
router.get('/summary', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `tax-summary:${period || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin.from('tax_transactions').select('*');
  if (period) q = q.eq('period', period);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  // Group by jurisdiction and tax type
  const summary = (data || []).reduce((acc: any, transaction: any) => {
    const key = `${transaction.jurisdiction}-${transaction.tax_type}`;
    if (!acc[key]) {
      acc[key] = {
        jurisdiction: transaction.jurisdiction,
        taxType: transaction.tax_type,
        collected: 0,
        paid: 0,
        net: 0,
        transactions: 0,
      };
    }
    
    if (transaction.transaction_type === 'Collected') {
      acc[key].collected += Number(transaction.amount);
    } else {
      acc[key].paid += Number(transaction.amount);
    }
    acc[key].net = acc[key].collected - acc[key].paid;
    acc[key].transactions += 1;
    
    return acc;
  }, {});

  const result = {
    period: period || 'All Periods',
    summary: Object.values(summary),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000); // 10 minute TTL
  return res.json(result);
});

export default router;
