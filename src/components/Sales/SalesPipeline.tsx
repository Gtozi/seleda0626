import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, RefreshCw, TrendingUp, DollarSign, Target, Award,
  ChevronRight, User, Building2, Calendar, AlertTriangle,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import { fetchLeads, createLead, updateLead, fetchSalesAnalytics, type SalesLead, type SalesAnalytics } from '../../services/salesService';

const STAGES = ['Prospect', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];
const STAGE_COLORS: Record<string, string> = {
  Prospect: 'bg-slate-100 text-slate-600',
  Qualified: 'bg-blue-50 text-blue-600',
  Proposal: 'bg-indigo-50 text-indigo-600',
  Negotiation: 'bg-amber-50 text-amber-600',
  Won: 'bg-emerald-50 text-emerald-600',
  Lost: 'bg-rose-50 text-rose-600',
};

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const SalesPipeline: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [analytics, setAnalytics] = useState<SalesAnalytics | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState<'kanban' | 'table'>('kanban');
  const [form, setForm] = useState({
    leadName: '', company: '', contactPerson: '', contactEmail: '', contactPhone: '',
    source: 'Direct', stage: 'Prospect', opportunityValue: 0, expectedCloseDate: '',
    assignedTo: '', priority: 'Medium', notes: '',
  });

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [l, a] = await Promise.all([fetchLeads(), fetchSalesAnalytics()]);
      setLeads(l);
      setAnalytics(a);
    } catch (err: any) { setError(err.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleAdd = async () => {
    try {
      await createLead(form);
      setShowAddModal(false);
      setForm({ leadName: '', company: '', contactPerson: '', contactEmail: '', contactPhone: '', source: 'Direct', stage: 'Prospect', opportunityValue: 0, expectedCloseDate: '', assignedTo: '', priority: 'Medium', notes: '' });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create lead'); }
  };

  const handleStageChange = async (lead: SalesLead, newStage: string) => {
    try {
      const updates: any = { stage: newStage };
      if (newStage === 'Won') updates.conversionDate = new Date().toISOString().split('T')[0];
      if (newStage === 'Lost') updates.lostReason = 'Marked as lost';
      await updateLead(lead.id, updates);
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to update lead'); }
  };

  const leadColumns: Column<SalesLead>[] = [
    { key: 'lead_number', label: 'Lead #', render: (l) => <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{l.lead_number || l.id.slice(0, 8)}</span> },
    { key: 'lead_name', label: 'Name', render: (l) => <span className="text-xs font-black text-slate-900 dark:text-white">{l.lead_name}</span> },
    { key: 'company', label: 'Company', render: (l) => <span className="text-[10px] font-bold text-slate-500">{l.company || '—'}</span> },
    { key: 'stage', label: 'Stage', align: 'center', render: (l) => (
      <select value={l.stage} onChange={e => handleStageChange(l, e.target.value)} className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border-none outline-none cursor-pointer ${STAGE_COLORS[l.stage] || STAGE_COLORS['Prospect']}`}>
        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    ) },
    { key: 'opportunity_value', label: 'Value', align: 'right', render: (l) => <span className="text-xs font-black text-emerald-600">${fmt(l.opportunity_value)}</span> },
    { key: 'expected_close_date', label: 'Close Date', align: 'center', render: (l) => <span className="text-[10px] font-bold text-slate-500">{l.expected_close_date || '—'}</span> },
    { key: 'assigned_to', label: 'Assigned', align: 'center', render: (l) => <span className="text-[10px] font-bold text-slate-500">{l.assigned_to || '—'}</span> },
    { key: 'priority', label: 'Priority', align: 'center', render: (l) => {
      const colors: Record<string, string> = { High: 'text-rose-600', Medium: 'text-amber-600', Low: 'text-slate-400' };
      return <span className={`text-[10px] font-black ${colors[l.priority] || colors['Medium']}`}>{l.priority}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Sales Pipeline</h2>
          <p className="text-xs text-slate-400 font-medium">Lead-to-contract CRM with stage tracking and conversion analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setView(view === 'kanban' ? 'table' : 'kanban')} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            {view === 'kanban' ? 'Table View' : 'Kanban View'}
          </button>
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> New Lead
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 mb-3"><Target size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Leads</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{analytics?.totalLeads ?? '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 mb-3"><Award size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Conversion Rate</p>
          <h3 className="text-xl font-black text-emerald-600">{analytics ? `${analytics.conversionRate.toFixed(1)}%` : '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 mb-3"><TrendingUp size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pipeline Value</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${analytics ? fmt(analytics.totalPipelineValue) : '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-3"><DollarSign size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Contract Value</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${analytics ? fmt(analytics.totalContractValue) : '—'}</h3>
        </div>
      </div>

      {/* Kanban View */}
      {view === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto">
          {STAGES.map(stage => {
            const stageLeads = leads.filter(l => l.stage === stage);
            const stageValue = stageLeads.reduce((s, l) => s + Number(l.opportunity_value || 0), 0);
            return (
              <div key={stage} className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-3 min-w-[200px]">
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${STAGE_COLORS[stage]}`}>{stage}</span>
                  <span className="text-[9px] font-black text-slate-400">{stageLeads.length}</span>
                </div>
                <p className="text-[9px] font-bold text-slate-400 mb-3">${fmt(stageValue)}</p>
                <div className="space-y-2">
                  {stageLeads.map(lead => (
                    <div key={lead.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl p-3 hover:border-emerald-300 transition cursor-pointer">
                      <p className="text-[10px] font-mono font-black text-slate-400 uppercase mb-1">{lead.lead_number || lead.id.slice(0, 8)}</p>
                      <p className="text-xs font-black text-slate-900 dark:text-white leading-tight mb-1">{lead.lead_name}</p>
                      {lead.company && <p className="text-[9px] font-bold text-slate-500 flex items-center gap-1"><Building2 size={9} /> {lead.company}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-black text-emerald-600">${fmt(lead.opportunity_value)}</span>
                        <span className={`text-[8px] font-black ${lead.priority === 'High' ? 'text-rose-600' : lead.priority === 'Medium' ? 'text-amber-600' : 'text-slate-400'}`}>{lead.priority}</span>
                      </div>
                      {lead.expected_close_date && <p className="text-[8px] font-bold text-slate-400 mt-1 flex items-center gap-1"><Calendar size={8} /> {lead.expected_close_date}</p>}
                      <select value={lead.stage} onChange={e => handleStageChange(lead, e.target.value)} className="w-full mt-2 text-[9px] font-bold bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-lg px-2 py-1 outline-none">
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  ))}
                  {stageLeads.length === 0 && <p className="text-[9px] text-slate-300 text-center py-4">No leads</p>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <DataTable columns={leadColumns} data={leads} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search leads..." filterKeys={['lead_name', 'company', 'stage', 'assigned_to']} emptyMessage="No leads found." />
      )}

      {/* Add Lead Modal */}
      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Sales Lead" subtitle="Create a new lead or opportunity in the pipeline" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Lead Name</label>
              <input value={form.leadName} onChange={e => setForm({ ...form, leadName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Corporate Retreat Inquiry" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Company</label>
              <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Ethiopian Airlines" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contact Person</label>
              <input value={form.contactPerson} onChange={e => setForm({ ...form, contactPerson: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Contact Email</label>
              <input value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Source</label>
              <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Direct</option><option>Website</option><option>Referral</option><option>Trade Show</option><option>Corporate</option><option>OTA</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Stage</label>
              <select value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                {STAGES.filter(s => s !== 'Lost').map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Opportunity Value ($)</label>
              <input type="number" value={form.opportunityValue} onChange={e => setForm({ ...form, opportunityValue: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Expected Close</label>
              <input type="date" value={form.expectedCloseDate} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Assigned To</label>
              <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleAdd} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Create Lead</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default SalesPipeline;
