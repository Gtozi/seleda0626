import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react';
import { fetchTrialBalance, type TrialBalanceResponse, type TrialBalanceAccount } from '../../services/trialBalanceService';
import { DataTable, Column } from '../Shared/DataTable';

const TrialBalance = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trialBalance, setTrialBalance] = useState<TrialBalanceResponse | null>(null);
  const [asOfDate, setAsOfDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrialBalance(
        asOfDate || undefined,
        periodStart || undefined,
        periodEnd || undefined
      );
      setTrialBalance(data);
    } catch (err: any) {
      console.error('Error loading trial balance:', err);
      setError(err.message || 'Failed to load trial balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [asOfDate, periodStart, periodEnd]);

  const debitAccounts = trialBalance?.trial_balance.filter(a => a.net_balance > 0) || [];
  const creditAccounts = trialBalance?.trial_balance.filter(a => a.net_balance < 0) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">As of Date</label>
            <input
              type="date"
              value={asOfDate}
              onChange={(e) => setAsOfDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
              placeholder="Start"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white"
              placeholder="End"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">
          Loading trial balance...
        </div>
      ) : trialBalance ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Debits', value: `$${trialBalance.totals.total_debit.toLocaleString()}`, sub: 'All accounts', icon: DollarSign, color: 'text-emerald-500' },
              { label: 'Total Credits', value: `$${trialBalance.totals.total_credit.toLocaleString()}`, sub: 'All accounts', icon: DollarSign, color: 'text-indigo-500' },
              {
                label: 'Balance Status',
                value: trialBalance.totals.is_balanced ? 'Balanced' : 'Unbalanced',
                sub: trialBalance.totals.is_balanced ? 'Debits = Credits' : `Difference: $${trialBalance.totals.difference.toFixed(2)}`,
                icon: trialBalance.totals.is_balanced ? CheckCircle2 : XCircle,
                color: trialBalance.totals.is_balanced ? 'text-emerald-500' : 'text-rose-500',
              },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Debit Balances</h3>
              <div className="space-y-3">
                {debitAccounts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No debit balances found.
                  </div>
                ) : (
                  debitAccounts.map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{account.account_code} - {account.account_name}</p>
                        <p className="text-[9px] text-slate-500 font-bold">{account.account_type}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-emerald-600">${account.net_balance.toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Credit Balances</h3>
              <div className="space-y-3">
                {creditAccounts.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs font-bold">
                    No credit balances found.
                  </div>
                ) : (
                  creditAccounts.map((account, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                      <div>
                        <p className="text-xs font-black text-slate-900 dark:text-white">{account.account_code} - {account.account_name}</p>
                        <p className="text-[9px] text-slate-500 font-bold">{account.account_type}</p>
                      </div>
                      <span className="text-xs font-mono font-black text-indigo-600">${Math.abs(account.net_balance).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Full Trial Balance</h3>
            </div>
            <DataTable
              columns={[
                {
                  key: 'account_code',
                  label: 'Account Code',
                  render: (a: TrialBalanceAccount) => <span className="text-[10px] font-mono text-slate-500">{a.account_code}</span>,
                },
                {
                  key: 'account_name',
                  label: 'Account Name',
                  render: (a: TrialBalanceAccount) => <span className="text-xs font-bold text-slate-900 dark:text-white">{a.account_name}</span>,
                },
                {
                  key: 'account_type',
                  label: 'Type',
                  render: (a: TrialBalanceAccount) => <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 rounded text-[9px] font-black text-slate-500 uppercase">{a.account_type}</span>,
                },
                {
                  key: 'debit',
                  label: 'Debit',
                  align: 'right',
                  render: (a: TrialBalanceAccount) => <span className="text-xs font-mono text-slate-900 dark:text-white">${a.debit.toFixed(2)}</span>,
                },
                {
                  key: 'credit',
                  label: 'Credit',
                  align: 'right',
                  render: (a: TrialBalanceAccount) => <span className="text-xs font-mono text-slate-900 dark:text-white">${a.credit.toFixed(2)}</span>,
                },
                {
                  key: 'net_balance',
                  label: 'Net Balance',
                  align: 'right',
                  render: (a: TrialBalanceAccount) => (
                    <span className={`text-xs font-mono font-black ${a.net_balance >= 0 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                      ${a.net_balance.toFixed(2)}
                    </span>
                  ),
                },
              ] as Column<TrialBalanceAccount>[]}
              data={trialBalance.trial_balance}
              rowKey={(a) => a.account_code}
              sortable
              filterable
              filterPlaceholder="Search accounts..."
              filterKeys={['account_code', 'account_name', 'account_type']}
              containerClassName="rounded-3xl border-0 shadow-none"
            />
          </div>
        </>
      ) : null}
    </div>
  );
};

export default TrialBalance;
