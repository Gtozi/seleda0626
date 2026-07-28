import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Profit & Loss Statement ───────────────────────────────────────
router.get('/profit-loss', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { periodStart, periodEnd } = req.query as Record<string, string>;

  if (!periodStart || !periodEnd) {
    return res.status(400).json({ error: 'periodStart and periodEnd are required' });
  }

  // Get all accounts
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('chart_of_accounts')
    .select('*')
    .order('account_code');

  if (accountsError) return res.status(500).json({ error: accountsError.message });

  // Get journal lines for the period
  const { data: journalLines, error: journalError } = await supabaseAdmin
    .from('journal_lines')
    .select('*, journal_entries(posting_date)')
    .gte('journal_entries.posting_date', periodStart)
    .lte('journal_entries.posting_date', periodEnd);

  if (journalError) return res.status(500).json({ error: journalError.message });

  // Calculate balances per account
  const balances: Record<string, { debit: number; credit: number }> = {};

  (journalLines || []).forEach((line: any) => {
    if (!balances[line.account_id]) {
      balances[line.account_id] = { debit: 0, credit: 0 };
    }
    balances[line.account_id].debit += Number(line.debit) || 0;
    balances[line.account_id].credit += Number(line.credit) || 0;
  });

  // Build P&L categories
  const revenueAccounts = (accounts || []).filter((a: any) => a.account_type === 'Revenue');
  const expenseAccounts = (accounts || []).filter((a: any) => a.account_type === 'Expense');

  const totalRevenue = revenueAccounts.reduce((sum, a) => {
    const balance = balances[a.id] || { debit: 0, credit: 0 };
    return sum + (balance.credit - balance.debit);
  }, 0);

  const totalExpenses = expenseAccounts.reduce((sum, a) => {
    const balance = balances[a.id] || { debit: 0, credit: 0 };
    return sum + (balance.debit - balance.credit);
  }, 0);

  const grossProfit = totalRevenue - totalExpenses;

  return res.json({
    period: { period_start: periodStart, period_end: periodEnd },
    revenue: revenueAccounts.map((a: any) => {
      const balance = balances[a.id] || { debit: 0, credit: 0 };
      return {
        account_id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        amount: balance.credit - balance.debit,
      };
    }),
    expenses: expenseAccounts.map((a: any) => {
      const balance = balances[a.id] || { debit: 0, credit: 0 };
      return {
        account_id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        amount: balance.debit - balance.credit,
      };
    }),
    summary: {
      total_revenue: totalRevenue,
      total_expenses: totalExpenses,
      gross_profit: grossProfit,
      net_profit: grossProfit,
    },
  });
});

// ── Balance Sheet ─────────────────────────────────────────────────
router.get('/balance-sheet', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { asOfDate } = req.query as Record<string, string>;

  if (!asOfDate) {
    return res.status(400).json({ error: 'asOfDate is required' });
  }

  // Get all accounts
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('chart_of_accounts')
    .select('*')
    .order('account_code');

  if (accountsError) return res.status(500).json({ error: accountsError.message });

  // Get journal lines up to the as-of date
  const { data: journalLines, error: journalError } = await supabaseAdmin
    .from('journal_lines')
    .select('*, journal_entries(posting_date)')
    .lte('journal_entries.posting_date', asOfDate);

  if (journalError) return res.status(500).json({ error: journalError.message });

  // Calculate balances per account
  const balances: Record<string, { debit: number; credit: number }> = {};

  (journalLines || []).forEach((line: any) => {
    if (!balances[line.account_id]) {
      balances[line.account_id] = { debit: 0, credit: 0 };
    }
    balances[line.account_id].debit += Number(line.debit) || 0;
    balances[line.account_id].credit += Number(line.credit) || 0;
  });

  // Build balance sheet categories
  const assetAccounts = (accounts || []).filter((a: any) => a.account_type === 'Asset');
  const liabilityAccounts = (accounts || []).filter((a: any) => a.account_type === 'Liability');
  const equityAccounts = (accounts || []).filter((a: any) => a.account_type === 'Equity');

  const totalAssets = assetAccounts.reduce((sum, a) => {
    const balance = balances[a.id] || { debit: 0, credit: 0 };
    return sum + (balance.debit - balance.credit);
  }, 0);

  const totalLiabilities = liabilityAccounts.reduce((sum, a) => {
    const balance = balances[a.id] || { debit: 0, credit: 0 };
    return sum + (balance.credit - balance.debit);
  }, 0);

  const totalEquity = equityAccounts.reduce((sum, a) => {
    const balance = balances[a.id] || { debit: 0, credit: 0 };
    return sum + (balance.credit - balance.debit);
  }, 0);

  const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01;

  return res.json({
    as_of_date: asOfDate,
    assets: assetAccounts.map((a: any) => {
      const balance = balances[a.id] || { debit: 0, credit: 0 };
      return {
        account_id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        amount: balance.debit - balance.credit,
      };
    }),
    liabilities: liabilityAccounts.map((a: any) => {
      const balance = balances[a.id] || { debit: 0, credit: 0 };
      return {
        account_id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        amount: balance.credit - balance.debit,
      };
    }),
    equity: equityAccounts.map((a: any) => {
      const balance = balances[a.id] || { debit: 0, credit: 0 };
      return {
        account_id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        amount: balance.credit - balance.debit,
      };
    }),
    summary: {
      total_assets: totalAssets,
      total_liabilities: totalLiabilities,
      total_equity: totalEquity,
      is_balanced: isBalanced,
      difference: totalAssets - (totalLiabilities + totalEquity),
    },
  });
});

// ── Cash Flow Statement (Indirect Method) ──────────────────────────
router.get('/cash-flow', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { periodStart, periodEnd } = req.query as Record<string, string>;

  if (!periodStart || !periodEnd) {
    return res.status(400).json({ error: 'periodStart and periodEnd are required' });
  }

  // Get all accounts
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('chart_of_accounts')
    .select('*')
    .order('account_code');

  if (accountsError) return res.status(500).json({ error: accountsError.message });

  // Get journal lines for the period
  const { data: journalLines, error: journalError } = await supabaseAdmin
    .from('journal_lines')
    .select('*, journal_entries(posting_date)')
    .gte('journal_entries.posting_date', periodStart)
    .lte('journal_entries.posting_date', periodEnd);

  if (journalError) return res.status(500).json({ error: journalError.message });

  // Calculate balances per account
  const balances: Record<string, { debit: number; credit: number }> = {};
  (journalLines || []).forEach((line: any) => {
    if (!balances[line.account_id]) {
      balances[line.account_id] = { debit: 0, credit: 0 };
    }
    balances[line.account_id].debit += Number(line.debit) || 0;
    balances[line.account_id].credit += Number(line.credit) || 0;
  });

  const getNetBalance = (a: any, normalDebit: boolean) => {
    const b = balances[a.id] || { debit: 0, credit: 0 };
    return normalDebit ? b.debit - b.credit : b.credit - b.debit;
  };

  // Categorize accounts
  const revenueAccounts = (accounts || []).filter((a: any) => a.account_type === 'Revenue');
  const expenseAccounts = (accounts || []).filter((a: any) => a.account_type === 'Expense');
  const assetAccounts = (accounts || []).filter((a: any) => a.account_type === 'Asset');
  const liabilityAccounts = (accounts || []).filter((a: any) => a.account_type === 'Liability');
  const equityAccounts = (accounts || []).filter((a: any) => a.account_type === 'Equity');

  // Operating activities: Net profit + changes in working capital
  const netProfit = revenueAccounts.reduce((s, a) => s + getNetBalance(a, false), 0)
    - expenseAccounts.reduce((s, a) => s + getNetBalance(a, true), 0);

  // Changes in current assets (excluding cash)
  const currentAssetChanges = assetAccounts
    .filter((a: any) => !a.account_code.toLowerCase().includes('cash') && !a.account_code.toLowerCase().includes('bank'))
    .map((a: any) => ({
      account_id: a.id,
      account_code: a.account_code,
      account_name: a.account_name,
      amount: -getNetBalance(a, true), // Increase in assets = cash outflow
    }));

  // Changes in current liabilities
  const currentLiabilityChanges = liabilityAccounts.map((a: any) => ({
    account_id: a.id,
    account_code: a.account_code,
    account_name: a.account_name,
    amount: getNetBalance(a, false), // Increase in liabilities = cash inflow
  }));

  const operatingTotal = netProfit
    + currentAssetChanges.reduce((s, a) => s + a.amount, 0)
    + currentLiabilityChanges.reduce((s, a) => s + a.amount, 0);

  // Investing activities: non-current asset changes
  const investingActivities = assetAccounts
    .filter((a: any) => a.account_code.toLowerCase().includes('fixed') || a.account_code.toLowerCase().includes('asset') || a.account_code.toLowerCase().includes('equipment'))
    .map((a: any) => ({
      account_id: a.id,
      account_code: a.account_code,
      account_name: a.account_name,
      amount: -getNetBalance(a, true),
    }));

  const investingTotal = investingActivities.reduce((s, a) => s + a.amount, 0);

  // Financing activities: equity and long-term liability changes
  const financingActivities = [
    ...equityAccounts.map((a: any) => ({
      account_id: a.id,
      account_code: a.account_code,
      account_name: a.account_name,
      amount: getNetBalance(a, false),
    })),
    ...liabilityAccounts
      .filter((a: any) => a.account_code.toLowerCase().includes('long') || a.account_code.toLowerCase().includes('loan') || a.account_code.toLowerCase().includes('note'))
      .map((a: any) => ({
        account_id: a.id,
        account_code: a.account_code,
        account_name: a.account_name,
        amount: getNetBalance(a, false),
      })),
  ];

  const financingTotal = financingActivities.reduce((s, a) => s + a.amount, 0);

  // Cash & cash equivalents change
  const cashAccounts = assetAccounts.filter((a: any) =>
    a.account_code.toLowerCase().includes('cash') || a.account_code.toLowerCase().includes('bank')
  );
  const netCashChange = cashAccounts.reduce((s, a) => s + getNetBalance(a, true), 0);

  return res.json({
    period: { period_start: periodStart, period_end: periodEnd },
    operating_activities: {
      net_profit: netProfit,
      working_capital_changes: [...currentAssetChanges, ...currentLiabilityChanges],
      total: operatingTotal,
    },
    investing_activities: {
      items: investingActivities,
      total: investingTotal,
    },
    financing_activities: {
      items: financingActivities,
      total: financingTotal,
    },
    summary: {
      net_cash_change: netCashChange,
      operating_total: operatingTotal,
      investing_total: investingTotal,
      financing_total: financingTotal,
    },
  });
});

export default router;
