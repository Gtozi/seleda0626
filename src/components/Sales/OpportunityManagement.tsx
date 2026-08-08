import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, Target, TrendingUp, DollarSign,
  Trophy,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import { fetchLeads, type SalesLead } from '../../services/salesService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const STAGES = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const WIN_PROBABILITY: Record<string, number> = {
  Prospect: 10, Qualified: 25, Proposal: 50, Negotiation: 75, Won: 100, Lost: 0,
};

const OpportunityManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    leadName: '', company: '', opportunityValue: 0, expectedCloseDate: '',
    stage: 'Prospect', competitor: '', assignedTo: '', notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try { setLeads(await fetchLeads()); }
    catch (err: any) { setError(err.message || 'Failed to load opportunities'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const opportunities = leads.filter(l => !['Lost'].includes(l.stage) || l.opportunity_value > 0);

  const columns: Column<SalesLead>[] = [
    { key: 'lead_name', label: 'Opportunity', render: (o) => <span className="text-xs font-black text-slate-900 dark:text-white">{o.lead_name}</span> },
    { key: 'company', label: 'Account', render: (o) => <span className="text-[10px] font-bold text-slate-500">{o.company || '—'}</span> },
    { key: 'stage', label: 'Stage', align: 'center', render: (o) => {
      const colors: Record<string, string> = { Prospect: 'bg-slate-100 text-slate-600', Qualified: 'bg-blue-50 text-blue-600', Proposal: 'bg-indigo-50 text-indigo-600', Negotiation: 'bg-amber-50 text-amber-600', Won: 'bg-emerald-50 text-emerald-600', Lost: 'bg-rose-50 text-rose-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[o.stage] || colors['Prospect']}`}>{o.stage}</span>;
    } },
    { key: 'winProbability', label: 'Win Prob', align: 'center', sortable: false, render: (o) => {
      const prob = WIN_PROBABILITY[o.stage] || 0;
      const color = prob >= 75 ? 'text-emerald-600' : prob >= 50 ? 'text-amber-600' : 'text-slate-500';
      return <span className={`text-[10px] font-black ${color}`}>{prob}%</span>;
    } },
    { key: 'opportunity_value', label: 'Value', align: 'right', render: (o) => <span className="text-xs font-black text-emerald-600">${fmt(o.opportunity_value)}</span> },
    { key: 'expected_close_date', label: 'Close Date', align: 'center', render: (o) => <span className="text-[10px] font-bold text-slate-500">{o.expected_close_date || '—'}</span> },
    { key: 'assigned_to', label: 'Owner', align: 'center', render: (o) => <span className="text-[10px] font-bold text-slate-500">{o.assigned_to || '—'}</span> },
  ];

  const totalValue = opportunities.reduce((s, o) => s + Number(o.opportunity_value || 0), 0);
  const weightedValue = opportunities.reduce((s, o) => s + Number(o.opportunity_value || 0) * (WIN_PROBABILITY[o.stage] || 0) / 100, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Opportunity Management</h2>
          <p className="text-xs text-slate-400 font-medium">Sales funnel, revenue forecast, win probability, and competitor tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> New Opportunity
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 text-indigo-600 mb-3"><Target size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Open Opportunities</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{opportunities.filter(o => !['Won', 'Lost'].includes(o.stage)).length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><DollarSign size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Pipeline</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${fmt(totalValue)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><TrendingUp size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Weighted Forecast</p>
          <h3 className="text-xl font-black text-amber-600">${fmt(weightedValue)}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3"><Trophy size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Won Deals</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{opportunities.filter(o => o.stage === 'Won').length}</h3>
        </div>
      </div>

      {/* Sales Funnel Visualization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Sales Funnel</h3>
        <div className="space-y-2">
          {STAGES.filter(s => s !== 'Lost').map(stage => {
            const stageOps = opportunities.filter(o => o.stage === stage);
            const stageValue = stageOps.reduce((s, o) => s + Number(o.opportunity_value || 0), 0);
            const maxWidth = totalValue > 0 ? (stageValue / totalValue) * 100 : 0;
            const colors: Record<string, string> = { Prospect: 'bg-slate-400', Qualified: 'bg-blue-500', Proposal: 'bg-indigo-500', Negotiation: 'bg-amber-500', Won: 'bg-emerald-500' };
            return (
              <div key={stage} className="flex items-center gap-4">
                <div className="w-24 text-right">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider">{stage}</span>
                </div>
                <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-xl h-8 relative overflow-hidden">
                  <div className={`h-full ${colors[stage]} rounded-xl flex items-center px-3 transition-all`} style={{ width: `${Math.max(maxWidth, 5)}%` }}>
                    <span className="text-[9px] font-black text-white">{stageOps.length} deals</span>
                  </div>
                </div>
                <div className="w-24 text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white">${fmt(stageValue)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <DataTable columns={columns} data={opportunities} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search opportunities..." filterKeys={['lead_name', 'company', 'stage', 'assigned_to']} emptyMessage="No opportunities found." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Opportunity" subtitle="Create a sales opportunity with forecast" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Opportunity Name</label>
              <input value={form.leadName} onChange={e => setForm({ ...form, leadName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Company / Account</label>
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Value ($)</label>
              <input type="number" value={form.opportunityValue} onChange={e => setForm({ ...form, opportunityValue: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Stage</label>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                {STAGES.filter(s => s !== 'Lost').map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Expected Close</label>
              <input type="date" value={form.expectedCloseDate} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Competitor</label>
              <input value={form.competitor} onChange={e => setForm({ ...form, competitor: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Competitor Hotel" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Assigned To</label>
              <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Create Opportunity</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default OpportunityManagement;
