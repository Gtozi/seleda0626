import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Users, Building2, Plane, Briefcase,
  Mail, Phone, Calendar, Star,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import { fetchLeads, fetchCorporateAccounts, type SalesLead, type CorporateAccount } from '../../services/salesService';

const CUSTOMER_TYPES = ['Individual Guest', 'Corporate Client', 'Travel Agency', 'Tour Operator', 'Government', 'Airlines', 'Event Organizer', 'Wedding Planner'];

interface CRMRecord {
  id: string;
  type: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  source: string;
  status: string;
  totalStays: number;
  totalRevenue: number;
  lastContact: string | null;
  notes: string | null;
}

const CRM: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [accounts, setAccounts] = useState<CorporateAccount[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    type: 'Individual Guest', name: '', company: '', email: '', phone: '',
    source: 'Direct', notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [l, c] = await Promise.all([
        fetchLeads().catch(() => []),
        fetchCorporateAccounts().catch(() => []),
      ]);
      setLeads(l); setAccounts(c);
    } catch (err: any) { setError(err.message || 'Failed to load CRM data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const crmRecords: CRMRecord[] = [
    ...leads.map(l => ({
      id: l.id, type: l.company ? 'Corporate Client' : 'Individual Guest',
      name: l.lead_name, company: l.company, email: l.contact_email, phone: l.contact_phone,
      source: l.source, status: l.stage, totalStays: 0, totalRevenue: Number(l.opportunity_value || 0),
      lastContact: l.updated_at, notes: l.notes,
    })),
    ...accounts.map(a => ({
      id: a.id, type: 'Corporate Client',
      name: a.company_name, company: a.company_name, email: a.contact_email, phone: a.contact_phone,
      source: 'Corporate', status: 'Active', totalStays: Number(a.active_bookings || 0),
      totalRevenue: Number(a.unpaid_balance || 0), lastContact: a.updated_at, notes: a.notes,
    })),
  ];

  const filtered = crmRecords.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (search && !r.name.toLowerCase().includes(search.toLowerCase()) &&
        !(r.company || '').toLowerCase().includes(search.toLowerCase()) &&
        !(r.email || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const columns: Column<CRMRecord>[] = [
    { key: 'name', label: 'Name', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
          {r.type === 'Corporate Client' ? <Building2 size={12} /> : r.type === 'Travel Agency' ? <Plane size={12} /> : <Users size={12} />}
        </div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{r.name}</span>
      </div>
    ) },
    { key: 'type', label: 'Type', align: 'center', render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.type}</span> },
    { key: 'company', label: 'Company', render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.company || '—'}</span> },
    { key: 'email', label: 'Email', render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.email || '—'}</span> },
    { key: 'phone', label: 'Phone', render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.phone || '—'}</span> },
    { key: 'source', label: 'Source', align: 'center', render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.source}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (r) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Won: 'bg-emerald-50 text-emerald-600', Prospect: 'bg-slate-100 text-slate-600', Qualified: 'bg-blue-50 text-blue-600', Proposal: 'bg-indigo-50 text-indigo-600', Negotiation: 'bg-amber-50 text-amber-600', Lost: 'bg-rose-50 text-rose-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[r.status] || colors['Prospect']}`}>{r.status}</span>;
    } },
    { key: 'totalRevenue', label: 'Revenue', align: 'right', render: (r) => <span className="text-xs font-black text-emerald-600">${r.totalRevenue.toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">CRM</h2>
          <p className="text-xs text-slate-400 font-medium">360° customer view across all customer types and lifecycle stages</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      {/* Customer Type Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={() => setFilterType('all')} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${filterType === 'all' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>All ({crmRecords.length})</button>
        {CUSTOMER_TYPES.map(type => {
          const count = crmRecords.filter(r => r.type === type).length;
          if (count === 0) return null;
          return (
            <button key={type} onClick={() => setFilterType(type)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${filterType === type ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>{type} ({count})</button>
          );
        })}
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers by name, company, or email..." className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />

      <DataTable columns={columns} data={filtered} rowKey={(row) => row.id} sortable filterable={false} emptyMessage="No CRM records found." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New CRM Customer" subtitle="Register a new customer in the CRM system" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Customer Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                {CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Source</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Direct</option><option>Website</option><option>Referral</option><option>Social Media</option><option>Trade Show</option><option>OTA</option><option>Walk-in</option><option>Telephone</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Name</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Full name or company name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Email</label>
              <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Company (optional)</label>
            <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Add Customer</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default CRM;
