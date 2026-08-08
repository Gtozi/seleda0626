import React, { useState } from 'react';
import {
  Plus, RefreshCw, Tag, Percent, Calendar, DollarSign,
  TrendingUp, Clock,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const PROMO_TYPES = ['Promo Code', 'Package Promotion', 'Seasonal Discount', 'Corporate Discount', 'Early Booking Offer', 'Last Minute Offer', 'Weekend Package', 'Long Stay Promotion'];

interface Promotion {
  id: string;
  name: string;
  type: string;
  code: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
  uses: number;
  maxUses: number;
  revenue: number;
  status: string;
}

const PromotionsOffers: React.FC = () => {
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'Promo Code', code: '', discountPercent: 10,
    startDate: '', endDate: '', maxUses: 100,
  });

  const columns: Column<Promotion>[] = [
    { key: 'name', label: 'Promotion', render: (p) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><Tag size={12} /></div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{p.name}</span>
      </div>
    ) },
    { key: 'code', label: 'Code', align: 'center', render: (p) => <span className="text-[10px] font-mono font-black text-indigo-600 uppercase">{p.code || '—'}</span> },
    { key: 'type', label: 'Type', align: 'center', render: (p) => <span className="text-[10px] font-bold text-slate-500">{p.type}</span> },
    { key: 'discountPercent', label: 'Discount', align: 'right', render: (p) => <span className="text-[10px] font-black text-rose-600">{p.discountPercent}%</span> },
    { key: 'uses', label: 'Uses', align: 'center', render: (p) => <span className="text-[10px] font-black text-slate-600">{p.uses}/{p.maxUses}</span> },
    { key: 'revenue', label: 'Revenue', align: 'right', render: (p) => <span className="text-xs font-black text-emerald-600">${p.revenue.toLocaleString()}</span> },
    { key: 'endDate', label: 'Ends', align: 'center', render: (p) => <span className="text-[10px] font-bold text-slate-500">{p.endDate || '—'}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (p) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Scheduled: 'bg-blue-50 text-blue-600', Expired: 'bg-slate-100 text-slate-500', Paused: 'bg-amber-50 text-amber-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[p.status] || colors['Active']}`}>{p.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Promotions & Offers</h2>
          <p className="text-xs text-slate-400 font-medium">Promo codes, package promotions, seasonal discounts, and special offers</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-rose-200">
            <Plus size={16} /> New Promotion
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 mb-3"><Tag size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Promos</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{promos.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><TrendingUp size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active</p>
          <h3 className="text-xl font-black text-emerald-600">{promos.filter(p => p.status === 'Active').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><DollarSign size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Revenue</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${promos.reduce((s, p) => s + p.revenue, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-slate-100 text-slate-500 mb-3"><Clock size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Expiring Soon</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{promos.filter(p => p.endDate && new Date(p.endDate) < new Date(Date.now() + 7 * 86400000)).length}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={promos} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search promotions..." filterKeys={['name', 'code', 'type', 'status']} emptyMessage="No promotions created yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Promotion" subtitle="Create a promotional offer or discount code" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Promotion Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" placeholder="e.g., Summer Escape 20% Off" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Promotion Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500">
                {PROMO_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Promo Code</label>
              <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-black outline-none focus:ring-2 focus:ring-rose-500" placeholder="SUMMER20" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Discount (%)</label>
              <input type="number" value={form.discountPercent} onChange={e => setForm({ ...form, discountPercent: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Max Uses</label>
              <input type="number" value={form.maxUses} onChange={e => setForm({ ...form, maxUses: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition">Create Promotion</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default PromotionsOffers;
