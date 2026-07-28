import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Building2, DollarSign, CreditCard, FileText,
  Phone, Mail, AlertTriangle,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import { fetchCorporateAccounts, createCorporateAccount, updateCorporateAccount, type CorporateAccount } from '../../services/salesService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CorporateAccountMaster: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    companyName: '', contactPerson: '', contactEmail: '', contactPhone: '',
    discountPercent: 0, creditLimit: 0, creditTerms: 'Net 30',
    billingAddress: '', taxId: '', industry: '', notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setAccounts(await fetchCorporateAccounts()); }
    catch (err: any) { setError(err.message || 'Failed to load accounts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    try {
      await createCorporateAccount(form);
      setShowAddModal(false);
      setForm({ companyName: '', contactPerson: '', contactEmail: '', contactPhone: '', discountPercent: 0, creditLimit: 0, creditTerms: 'Net 30', billingAddress: '', taxId: '', industry: '', notes: '' });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create account'); }
  };

  const totalCreditLimit = accounts.reduce((s, a) => s + Number(a.credit_limit || 0), 0);
  const totalAR = accounts.reduce((s, a) => s + Number(a.unpaid_balance || 0), 0);
  const totalActiveBookings = accounts.reduce((s, a) => s + Number(a.active_bookings || 0), 0);

  const columns: Column<CorporateAccount>[] = [
    { key: 'company_name', label: 'Company', render: (a) => <span className="text-xs font-black text-slate-900 dark:text-white">{a.company_name}</span> },
    { key: 'contact_person', label: 'Contact', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.contact_person || '—'}</span> },
    { key: 'industry', label: 'Industry', align: 'center', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.industry || '—'}</span> },
    { key: 'discount_percent', label: 'Discount', align: 'right', render: (a) => <span className="text-[10px] font-black text-indigo-600">{a.discount_percent}%</span> },
    { key: 'credit_limit', label: 'Credit Limit', align: 'right', render: (a) => <span className="text-xs font-black text-slate-900 dark:text-white">${fmt(a.credit_limit)}</span> },
    { key: 'credit_terms', label: 'Terms', align: 'center', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.credit_terms}</span> },
    { key: 'unpaid_balance', label: 'AR Balance', align: 'right', render: (a) => {
      const overLimit = a.credit_limit > 0 && a.unpaid_balance > a.credit_limit;
      return <span className={`text-xs font-black ${overLimit ? 'text-rose-600' : 'text-emerald-600'}`}>${fmt(a.unpaid_balance)}</span>;
    } },
    { key: 'active_bookings', label: 'Bookings', align: 'center', render: (a) => <span className="text-[10px] font-black text-slate-500">{a.active_bookings}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Corporate Account Master</h2>
          <p className="text-xs text-slate-400 font-medium">Centralized corporate accounts with credit terms, AR balance, and booking history</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> Add Account
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-3"><CreditCard size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Credit Limit</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${fmt(totalCreditLimit)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 mb-3"><DollarSign size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total AR Balance</p>
          <h3 className="text-xl font-black text-amber-600">${fmt(totalAR)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 mb-3"><FileText size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Bookings</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{totalActiveBookings}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={accounts} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search accounts..." filterKeys={['company_name', 'contact_person', 'industry']} emptyMessage="No corporate accounts yet." />

      {/* Add Account Modal */}
      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Corporate Account" subtitle="Register a corporate account with credit terms" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Company Name</label>
              <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Ethiopian Airlines" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Industry</label>
              <select value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">— Select —</option>
                <option>Aviation</option><option>Government</option><option>NGO</option><option>Corporate</option><option>Travel Agency</option><option>Education</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Email</label>
              <input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Phone</label>
              <input value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Credit Limit ($)</label>
              <input type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Credit Terms</label>
              <select value={form.creditTerms} onChange={e => setForm({ ...form, creditTerms: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Prepaid</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Discount (%)</label>
              <input type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Billing Address</label>
              <input value={form.billingAddress} onChange={e => setForm({ ...form, billingAddress: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Tax ID</label>
              <input value={form.taxId} onChange={e => setForm({ ...form, taxId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleAdd} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Add Account</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default CorporateAccountMaster;
