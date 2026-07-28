import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Trial Balance ───────────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { asOfDate, periodStart, periodEnd } = req.query as Record<string, string>;

  // Get all accounts
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('chart_of_accounts')
    .select('*')
    .order('account_code');

  if (accountsError) return res.status(500).json({ error: accountsError.message });

  // Get journal lines for the period
  let journalQuery = supabaseAdmin
    .from('journal_lines')
    .select('*, journal_entries(posting_date)');

  if (periodStart && periodEnd) {
    journalQuery = journalQuery.gte('journal_entries.posting_date', periodStart).lte('journal_entries.posting_date', periodEnd);
  } else if (asOfDate) {
    journalQuery = journalQuery.lte('journal_entries.posting_date', asOfDate);
  }

  const { data: journalLines, error: journalError } = await journalQuery;

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

  // Build trial balance
  const trialBalance = (accounts || []).map((account: any) => {
    const balance = balances[account.id] || { debit: 0, credit: 0 };
    const netBalance = balance.debit - balance.credit;

    return {
      account_id: account.id,
      account_code: account.account_code,
      account_name: account.account_name,
      account_type: account.account_type,
      debit: balance.debit,
      credit: balance.credit,
      net_balance: netBalance,
    };
  });

  // Calculate totals
  const totalDebit = trialBalance.reduce((sum, a) => sum + a.debit, 0);
  const totalCredit = trialBalance.reduce((sum, a) => sum + a.credit, 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

  return res.json({
    trial_balance: trialBalance,
    totals: {
      total_debit: totalDebit,
      total_credit: totalCredit,
      is_balanced: isBalanced,
      difference: totalDebit - totalCredit,
    },
    period: {
      as_of_date: asOfDate,
      period_start: periodStart,
      period_end: periodEnd,
    },
  });
});

export default router;
