import React, { useState } from 'react';
import {
  Plus, RefreshCw, Megaphone, Mail, MessageSquare, Calendar,
  DollarSign, BarChart3, Users, Zap,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const CAMPAIGN_TYPES = ['Email Campaign', 'SMS Campaign', 'Social Media Campaign', 'Seasonal Promotion', 'Holiday Promotion', 'Loyalty Campaign', 'Referral Campaign', 'Corporate Campaign'];

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  audience: string;
  budget: number;
  spent: number;
  leads: number;
  conversions: number;
  startDate: string;
  endDate: string;
}

const MarketingCampaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'Email Campaign', audience: '', budget: 0,
    startDate: '', endDate: '',
  });

  const columns: Column<Campaign>[] = [
    { key: 'name', label: 'Campaign', render: (c) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600"><Megaphone size={12} /></div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{c.name}</span>
      </div>
    ) },
    { key: 'type', label: 'Type', align: 'center', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.type}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (c) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Scheduled: 'bg-blue-50 text-blue-600', Completed: 'bg-slate-50 text-slate-600', Draft: 'bg-amber-50 text-amber-600', Paused: 'bg-rose-50 text-rose-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[c.status] || colors['Draft']}`}>{c.status}</span>;
    } },
    { key: 'audience', label: 'Audience', align: 'center', render: (c) => <span className="text-[10px] font-bold text-slate-500">{c.audience || '—'}</span> },
    { key: 'budget', label: 'Budget', align: 'right', render: (c) => <span className="text-[10px] font-bold text-slate-600">${c.budget.toLocaleString()}</span> },
    { key: 'spent', label: 'Spent', align: 'right', render: (c) => <span className="text-[10px] font-bold text-rose-600">${c.spent.toLocaleString()}</span> },
    { key: 'leads', label: 'Leads', align: 'center', render: (c) => <span className="text-[10px] font-black text-slate-600">{c.leads}</span> },
    { key: 'conversions', label: 'Conv.', align: 'center', render: (c) => <span className="text-[10px] font-black text-emerald-600">{c.conversions}</span> },
    { key: 'roi', label: 'ROI', align: 'center', sortable: false, render: (c) => {
      const roi = c.spent > 0 ? ((c.conversions * 500 - c.spent) / c.spent * 100).toFixed(0) : '0';
      return <span className={`text-[10px] font-black ${Number(roi) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{roi}%</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Marketing Campaigns</h2>
          <p className="text-xs text-slate-400 font-medium">Campaign types, audience selection, scheduling, automation, budget tracking, and performance analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-purple-200">
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3"><Megaphone size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Campaigns</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{campaigns.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><Zap size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active</p>
          <h3 className="text-xl font-black text-emerald-600">{campaigns.filter(c => c.status === 'Active').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><DollarSign size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Budget</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${campaigns.reduce((s, c) => s + c.budget, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3"><BarChart3 size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Leads</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{campaigns.reduce((s, c) => s + c.leads, 0)}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={campaigns} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search campaigns..." filterKeys={['name', 'type', 'status', 'audience']} emptyMessage="No marketing campaigns created yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Marketing Campaign" subtitle="Create a campaign with audience and budget" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Campaign Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., Summer Getaway Promotion" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Campaign Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500">
                {CAMPAIGN_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Target Audience</label>
            <input value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g., Past guests, Corporate clients" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Budget ($)</label>
            <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">End Date</label>
              <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition">Create Campaign</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default MarketingCampaigns;
