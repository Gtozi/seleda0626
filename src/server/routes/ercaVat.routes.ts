import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── ERCA VAT Export ───────────────────────────────────────────────
router.get('/export', authenticate, requirePermission('finance:report:export'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  const { periodStart, periodEnd } = req.query as Record<string, string>;

  if (!periodStart || !periodEnd) {
    return res.status(400).json({ error: 'periodStart and periodEnd are required' });
  }

  // Get VAT-relevant accounts (typically revenue accounts with VAT)
  const { data: accounts, error: accountsError } = await supabaseAdmin
    .from('chart_of_accounts')
    .select('*')
    .ilike('account_name', '%VAT%')
    .order('account_code');

  if (accountsError) return res.status(500).json({ error: accountsError.message });

  // Get journal lines for the period
  const { data: journalLines, error: journalError } = await supabaseAdmin
    .from('journal_lines')
    .select('*, journal_entries(posting_date, reference)')
    .gte('journal_entries.posting_date', periodStart)
    .lte('journal_entries.posting_date', periodEnd);

  if (journalError) return res.status(500).json({ error: journalError.message });

  // Calculate VAT totals
  const vatAccounts = (accounts || []).filter((a: any) => a.account_name.toLowerCase().includes('vat'));
  const vatBalances: Record<string, { debit: number; credit: number }> = {};

  (journalLines || []).forEach((line: any) => {
    if (vatAccounts.some((a: any) => a.id === line.account_id)) {
      if (!vatBalances[line.account_id]) {
        vatBalances[line.account_id] = { debit: 0, credit: 0 };
      }
      vatBalances[line.account_id].debit += Number(line.debit) || 0;
      vatBalances[line.account_id].credit += Number(line.credit) || 0;
    }
  });

  // Build ERCA VAT export format
  const vatExport = vatAccounts.map((account: any) => {
    const balance = vatBalances[account.id] || { debit: 0, credit: 0 };
    const netVat = balance.credit - balance.debit;

    return {
      account_code: account.account_code,
      account_name: account.account_name,
      vat_output: balance.credit,
      vat_input: balance.debit,
      net_vat: netVat,
    };
  });

  const totalVatOutput = vatExport.reduce((sum, a) => sum + a.vat_output, 0);
  const totalVatInput = vatExport.reduce((sum, a) => sum + a.vat_input, 0);
  const totalNetVat = totalVatOutput - totalVatInput;

  return res.json({
    period: {
      period_start: periodStart,
      period_end: periodEnd,
    },
    vat_accounts: vatExport,
    summary: {
      total_vat_output: totalVatOutput,
      total_vat_input: totalVatInput,
      total_net_vat: totalNetVat,
    },
  });
});

export default router;
