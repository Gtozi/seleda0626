import React, { useState, useEffect } from 'react';
import {
  Plus, RefreshCw, Plane, Percent, FileText,
  TrendingUp,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

interface TravelAgent {
  id: string;
  agencyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  commissionRate: number;
  contractStatus: string;
  totalBookings: number;
  totalRevenue: number;
  productionScore: number;
}

const TravelAgents: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [agents] = useState<TravelAgent[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    agencyName: '', contactPerson: '', email: '', phone: '',
    commissionRate: 10, contractStatus: 'Active',
  });

  useEffect(() => {
    setLoading(false);
  }, []);

  const columns: Column<TravelAgent>[] = [
    { key: 'agencyName', label: 'Agency', render: (a) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Plane size={12} /></div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{a.agencyName}</span>
      </div>
    ) },
    { key: 'contactPerson', label: 'Contact', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.contactPerson || '—'}</span> },
    { key: 'email', label: 'Email', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.email || '—'}</span> },
    { key: 'phone', label: 'Phone', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.phone || '—'}</span> },
    { key: 'commissionRate', label: 'Commission', align: 'right', render: (a) => <span className="text-[10px] font-black text-indigo-600">{a.commissionRate}%</span> },
    { key: 'contractStatus', label: 'Contract', align: 'center', render: (a) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Pending: 'bg-amber-50 text-amber-600', Expired: 'bg-rose-50 text-rose-600', Inactive: 'bg-slate-100 text-slate-500' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[a.contractStatus] || colors['Active']}`}>{a.contractStatus}</span>;
    } },
    { key: 'totalBookings', label: 'Bookings', align: 'center', render: (a) => <span className="text-[10px] font-black text-slate-600">{a.totalBookings}</span> },
    { key: 'totalRevenue', label: 'Revenue', align: 'right', render: (a) => <span className="text-xs font-black text-emerald-600">${fmt(a.totalRevenue)}</span> },
    { key: 'productionScore', label: 'Score', align: 'center', render: (a) => {
      const score = a.productionScore;
      const color = score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600';
      return <span className={`text-[10px] font-black ${color}`}>{score}/100</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Travel Agent Management</h2>
          <p className="text-xs text-slate-400 font-medium">Agency profiles, commission plans, contracts, and production reports</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> Add Agency
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-blue-50 text-blue-600 mb-3"><Plane size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Agencies</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{agents.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><FileText size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Contracts</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{agents.filter(a => a.contractStatus === 'Active').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3"><Percent size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Commission</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{agents.length > 0 ? (agents.reduce((s, a) => s + a.commissionRate, 0) / agents.length).toFixed(1) : 0}%</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3"><TrendingUp size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Revenue</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${fmt(agents.reduce((s, a) => s + a.totalRevenue, 0))}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={agents} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search agencies..." filterKeys={['agencyName', 'contactPerson', 'email']} emptyMessage="No travel agencies registered yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Travel Agency" subtitle="Register a travel agency with commission plan" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Agency Name</label>
              <input value={form.agencyName} onChange={e => setForm({ ...form, agencyName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Sunrise Travel" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Commission Rate (%)</label>
              <input type="number" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contract Status</label>
              <select value={form.contractStatus} onChange={e => setForm({ ...form, contractStatus: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Active</option><option>Pending</option><option>Expired</option><option>Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Add Agency</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default TravelAgents;
