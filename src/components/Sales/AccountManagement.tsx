import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw, Building2, DollarSign, TrendingUp,
  Crown, ArrowUpRight, Users,
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';
import { fetchCorporateAccounts, type CorporateAccount } from '../../services/salesService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const AccountManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setAccounts(await fetchCorporateAccounts()); }
    catch (err: any) { setError(err.message || 'Failed to load accounts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const keyAccounts = accounts.filter(a => Number(a.unpaid_balance || 0) > 0 || Number(a.active_bookings || 0) > 0);

  const columns: Column<CorporateAccount>[] = [
    { key: 'company_name', label: 'Key Account', render: (a) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600"><Building2 size={12} /></div>
        <div>
          <span className="text-xs font-black text-slate-900 dark:text-white">{a.company_name}</span>
          {a.industry && <p className="text-[9px] font-bold text-slate-400">{a.industry}</p>}
        </div>
      </div>
    ) },
    { key: 'contact_person', label: 'Account Manager', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.contact_person || '—'}</span> },
    { key: 'active_bookings', label: 'Bookings', align: 'center', render: (a) => <span className="text-[10px] font-black text-slate-600">{a.active_bookings}</span> },
    { key: 'unpaid_balance', label: 'Revenue', align: 'right', render: (a) => <span className="text-xs font-black text-emerald-600">${fmt(a.unpaid_balance)}</span> },
    { key: 'credit_limit', label: 'Credit Limit', align: 'right', render: (a) => <span className="text-[10px] font-bold text-slate-500">${fmt(a.credit_limit)}</span> },
    { key: 'discount_percent', label: 'Discount', align: 'center', render: (a) => <span className="text-[10px] font-black text-indigo-600">{a.discount_percent}%</span> },
    { key: 'upsell', label: 'Upsell', align: 'center', sortable: false, render: (a) => {
      const hasUpsell = Number(a.active_bookings) > 2;
      return hasUpsell ? <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[8px] font-black uppercase tracking-widest">Opportunity</span> : <span className="text-[10px] text-slate-300">—</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Account Management</h2>
          <p className="text-xs text-slate-400 font-medium">Key accounts, revenue tracking, production analysis, and upselling opportunities</p>
        </div>
        <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3"><Building2 size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Key Accounts</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{keyAccounts.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><DollarSign size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Revenue</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${fmt(accounts.reduce((s, a) => s + Number(a.unpaid_balance || 0), 0))}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><TrendingUp size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Bookings</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{accounts.reduce((s, a) => s + Number(a.active_bookings || 0), 0)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3"><Crown size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Upsell Targets</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{accounts.filter(a => Number(a.active_bookings) > 2).length}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={accounts} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search key accounts..." filterKeys={['company_name', 'contact_person', 'industry']} emptyMessage="No key accounts found." />
    </div>
  );
};

export default AccountManagement;
