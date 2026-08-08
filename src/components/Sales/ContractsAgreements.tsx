import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, FileSignature,
  DollarSign, CheckCircle2, XCircle,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import { fetchContracts, type Contract } from '../../services/salesService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CONTRACT_TYPES = ['Corporate Contract', 'Travel Agent Agreement', 'Group Contract', 'Event Agreement', 'Rate Agreement', 'Commission Agreement'];

const ContractsAgreements: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    title: '', contractType: 'Corporate Contract', startDate: '', endDate: '',
    totalValue: 0, depositAmount: 0, signedByClient: '', signedDate: '',
    terms: 'Contract terms per signed agreement.',
  });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setContracts(await fetchContracts()); }
    catch (err: any) { setError(err.message || 'Failed to load contracts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const columns: Column<Contract>[] = [
    { key: 'contract_number', label: 'Contract #', render: (c) => <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{c.contract_number || c.id.slice(0, 8)}</span> },
    { key: 'title', label: 'Title', render: (c) => <span className="text-xs font-black text-slate-900 dark:text-white">{c.title}</span> },
    { key: 'event_type', label: 'Type', align: 'center', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.event_type || '—'}</span> },
    { key: 'total_value', label: 'Value', align: 'right', render: (c) => <span className="text-xs font-black text-emerald-600">${fmt(c.total_value)}</span> },
    { key: 'start_date', label: 'Start', align: 'center', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.start_date || '—'}</span> },
    { key: 'end_date', label: 'End', align: 'center', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.end_date || '—'}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (c) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Completed: 'bg-slate-50 text-slate-600', Cancelled: 'bg-rose-50 text-rose-600', Pending: 'bg-amber-50 text-amber-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[c.status] || colors['Active']}`}>{c.status}</span>;
    } },
    { key: 'signed_by_client', label: 'Signed By', align: 'center', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.signed_by_client || '—'}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Contracts & Agreements</h2>
          <p className="text-xs text-slate-400 font-medium">Corporate contracts, travel agent agreements, group contracts, and digital signatures</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200">
            <Plus size={16} /> New Contract
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3"><FileSignature size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Contracts</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{contracts.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><CheckCircle2 size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active</p>
          <h3 className="text-xl font-black text-emerald-600">{contracts.filter(c => c.status === 'Active').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><DollarSign size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Value</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${fmt(contracts.reduce((s, c) => s + Number(c.total_value || 0), 0))}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 mb-3"><XCircle size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Expiring Soon</p>
          <h3 className="text-xl font-black text-rose-600">{contracts.filter(c => c.end_date && new Date(c.end_date) < new Date(Date.now() + 30 * 86400000)).length}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={contracts} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search contracts..." filterKeys={['title', 'event_type', 'status', 'signed_by_client']} emptyMessage="No contracts found." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Contract" subtitle="Create a contract or agreement" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contract Type</label>
              <select value={form.contractType} onChange={e => setForm({ ...form, contractType: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                {CONTRACT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Total Value ($)</label>
              <input type="number" value={form.totalValue} onChange={e => setForm({ ...form, totalValue: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Deposit ($)</label>
              <input type="number" value={form.depositAmount} onChange={e => setForm({ ...form, depositAmount: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Signed By</label>
              <input value={form.signedByClient} onChange={e => setForm({ ...form, signedByClient: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Signed Date</label>
              <input type="date" value={form.signedDate} onChange={e => setForm({ ...form, signedDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Terms & Conditions</label>
            <textarea value={form.terms} onChange={e => setForm({ ...form, terms: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Create Contract</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default ContractsAgreements;
