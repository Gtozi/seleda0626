import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowUpRight, Search, CheckCircle2,
  AlertCircle, Clock, RefreshCw, Building2, FileText
} from 'lucide-react';

interface ArEntry {
  id: string;
  operator_id: string;
  tour_operators?: { name: string; code: string };
  folio_id?: string;
  voucher_id?: string;
  entry_type: 'invoice' | 'payment' | 'credit_note' | 'adjustment';
  description: string;
  debit_amount: number;
  credit_amount: number;
  balance_after?: number;
  due_date?: string;
  is_reconciled: boolean;
  reconciled_at?: string;
  reference_no?: string;
  posting_date: string;
  created_at: string;
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const AccountsReceivable = () => {
  const [entries, setEntries] = useState<ArEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterReconciled, setFilterReconciled] = useState<'all' | 'open' | 'reconciled'>('open');
  const [reconciling, setReconciling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = filterReconciled === 'all' ? '' :
        filterReconciled === 'open' ? '?reconciled=false' : '?reconciled=true';
      const res = await fetch(`/api/b2b/ar-ledger${params}`, { credentials: 'include' });
      if (res.ok) setEntries(await res.json());
    } catch { /* network */ }
    setLoading(false);
  }, [filterReconciled]);

  useEffect(() => { load(); }, [load]);

  const reconcile = async (id: string) => {
    setReconciling(id);
    await fetch(`/api/b2b/ar-ledger/reconcile/${id}`, { method: 'POST', credentials: 'include' });
    await load();
    setReconciling(null);
  };

  const today = new Date().toISOString().slice(0, 10);
  const visible = entries.filter(e => {
    const q = search.toLowerCase();
    return !q ||
      (e.tour_operators?.name || '').toLowerCase().includes(q) ||
      (e.reference_no || '').toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q);
  });

  const totalOutstanding = entries.filter(e => !e.is_reconciled).reduce((s, e) => s + e.debit_amount - e.credit_amount, 0);
  const overdue = entries.filter(e => !e.is_reconciled && e.due_date && e.due_date < today);
  const overdueAmt = overdue.reduce((s, e) => s + e.debit_amount - e.credit_amount, 0);
  const dueIn7 = entries.filter(e => !e.is_reconciled && e.due_date && e.due_date >= today && e.due_date <= new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const dueIn7Amt = dueIn7.reduce((s, e) => s + e.debit_amount - e.credit_amount, 0);
  const operatorCount = new Set(entries.filter(e => !e.is_reconciled).map(e => e.operator_id)).size;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: `ETB ${fmt(totalOutstanding)}`, sub: `${operatorCount} operator${operatorCount !== 1 ? 's' : ''}`, icon: ArrowUpRight, color: 'text-indigo-600' },
          { label: 'Overdue', value: `ETB ${fmt(overdueAmt)}`, sub: `${overdue.length} entr${overdue.length !== 1 ? 'ies' : 'y'} past due`, icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Due Within 7 Days', value: `ETB ${fmt(dueIn7Amt)}`, sub: `${dueIn7.length} upcoming`, icon: Clock, color: 'text-amber-600' },
          { label: 'Total Entries', value: entries.length.toString(), sub: `${entries.filter(e => e.is_reconciled).length} reconciled`, icon: FileText, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}><stat.icon size={18} /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Building2 size={16} className="text-indigo-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">A/R Ledger — Tour Operators</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Operator / ref..." className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 w-44" />
            </div>
            {(['all','open','reconciled'] as const).map(f => (
              <button key={f} onClick={() => setFilterReconciled(f)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition ${
                  filterReconciled === f ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-700'
                }`}>{f}</button>
            ))}
            <button onClick={load} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-indigo-600 transition">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">Loading ledger…</div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-bold">No entries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  {['Reference','Operator','Type','Description','Debit','Credit','Balance','Due Date','Status',''].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {visible.map(e => {
                  const isOverdue = !e.is_reconciled && e.due_date && e.due_date < today;
                  const net = e.debit_amount - e.credit_amount;
                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3"><span className="text-[10px] font-black text-indigo-600 font-mono">{e.reference_no || e.id.slice(0,8).toUpperCase()}</span></td>
                      <td className="px-4 py-3"><span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{e.tour_operators?.name || '—'}</span></td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          e.entry_type === 'invoice' ? 'bg-blue-50 text-blue-600' :
                          e.entry_type === 'payment' ? 'bg-emerald-50 text-emerald-600' :
                          e.entry_type === 'credit_note' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-500'
                        }`}>{e.entry_type.replace('_',' ')}</span>
                      </td>
                      <td className="px-4 py-3 max-w-[180px]"><span className="text-[10px] text-slate-600 dark:text-slate-300 truncate block">{e.description}</span></td>
                      <td className="px-4 py-3"><span className="text-[10px] font-bold text-slate-900 dark:text-white">{e.debit_amount > 0 ? fmt(e.debit_amount) : '—'}</span></td>
                      <td className="px-4 py-3"><span className="text-[10px] font-bold text-emerald-600">{e.credit_amount > 0 ? fmt(e.credit_amount) : '—'}</span></td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold ${net > 0 ? 'text-slate-900 dark:text-white' : 'text-emerald-600'}`}>{fmt(net)}</span></td>
                      <td className="px-4 py-3"><span className={`text-[10px] font-bold ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>{e.due_date || '—'}</span></td>
                      <td className="px-4 py-3">
                        {e.is_reconciled
                          ? <span className="flex items-center gap-1 text-[9px] font-black text-emerald-600"><CheckCircle2 size={11}/> Reconciled</span>
                          : isOverdue
                            ? <span className="flex items-center gap-1 text-[9px] font-black text-rose-600"><AlertCircle size={11}/> Overdue</span>
                            : <span className="text-[9px] font-black text-amber-500">Open</span>
                        }
                      </td>
                      <td className="px-4 py-3">
                        {!e.is_reconciled && (
                          <button onClick={() => reconcile(e.id)} disabled={reconciling === e.id}
                            className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-[8px] font-black uppercase tracking-widest rounded-lg transition disabled:opacity-50">
                            {reconciling === e.id ? '…' : 'Mark Paid'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/20 flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          {visible.length} of {entries.length} Entries
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivable;
