import React, { useState, useEffect, useCallback } from 'react';
import {
  CalendarClock, Plus, RefreshCw, CheckCircle2, AlertTriangle,
  Wrench, Eye, Zap, Trash2, ChevronRight,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import {
  fetchPMSchedules, createPMSchedule, updatePMSchedule, generatePMWorkOrders,
  fetchWorkOrders, updateWorkOrder,
  type PMSchedule, type WorkOrder,
} from '../../services/engineeringService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PreventiveMaintenanceScheduler: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<PMSchedule[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showWODetail, setShowWODetail] = useState(false);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [genResult, setGenResult] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    scheduleName: '',
    assetId: '',
    frequency: 'Monthly',
    intervalDays: 30,
    nextDueDate: new Date().toISOString().split('T')[0],
    assignedTechnician: '',
    priority: 'Medium',
  });
  const [checklist, setChecklist] = useState<string[]>(['']);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [scheds, wos] = await Promise.all([fetchPMSchedules(), fetchWorkOrders()]);
      setSchedules(scheds);
      setWorkOrders(wos);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateSchedule = async () => {
    try {
      const checklistTemplate = checklist.filter(c => c.trim()).map((desc, i) => ({ id: `CL-${i + 1}`, description: desc }));
      await createPMSchedule({ ...form, checklistTemplate });
      setShowScheduleModal(false);
      setForm({ scheduleName: '', assetId: '', frequency: 'Monthly', intervalDays: 30, nextDueDate: new Date().toISOString().split('T')[0], assignedTechnician: '', priority: 'Medium' });
      setChecklist(['']);
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to create schedule'); }
  };

  const handleGenerate = async () => {
    try {
      setGenResult(null);
      const result = await generatePMWorkOrders();
      const generated = (result as any).generated || [];
      setGenResult(`Generated ${generated.length} work order(s)${generated.length > 0 ? ': ' + generated.map((g: any) => g.wo_number).join(', ') : ''}`);
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to generate work orders'); }
  };

  const handleCompleteWO = async (wo: WorkOrder) => {
    try {
      await updateWorkOrder(wo.id, { status: 'Completed', completedChecklist: wo.checklist || [] });
      loadData();
      if (selectedWO?.id === wo.id) { setSelectedWO(null); setShowWODetail(false); }
    } catch (err: any) { setError(err.message || 'Failed to complete work order'); }
  };

  const handleStartWO = async (wo: WorkOrder) => {
    try {
      await updateWorkOrder(wo.id, { status: 'In Progress', startedAt: new Date().toISOString() });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to start work order'); }
  };

  const handleDeactivateSchedule = async (sched: PMSchedule) => {
    try {
      await updatePMSchedule(sched.id, { status: 'Inactive' });
      loadData();
    } catch (err: any) { setError(err.message || 'Failed to deactivate schedule'); }
  };

  const overdueSchedules = schedules.filter(s => s.status === 'Active' && new Date(s.next_due_date) <= new Date());
  const openWOs = workOrders.filter(w => w.status === 'Open' || w.status === 'In Progress');

  const schedColumns: Column<PMSchedule>[] = [
    { key: 'schedule_name', label: 'Schedule', render: (s) => <span className="text-xs font-black text-slate-900 dark:text-white">{s.schedule_name}</span> },
    { key: 'asset', label: 'Asset', render: (s) => <span className="text-[10px] font-bold text-slate-500">{s.fixed_assets?.asset_name || '—'}</span> },
    { key: 'frequency', label: 'Frequency', align: 'center', render: (s) => <span className="text-[10px] font-bold text-slate-500">{s.frequency} ({s.interval_days}d)</span> },
    { key: 'next_due_date', label: 'Next Due', align: 'center', render: (s) => {
      const isOverdue = s.status === 'Active' && new Date(s.next_due_date) <= new Date();
      return <span className={`text-[10px] font-black ${isOverdue ? 'text-rose-600' : 'text-slate-500'}`}>{s.next_due_date}</span>;
    } },
    { key: 'assigned_technician', label: 'Technician', align: 'center', render: (s) => <span className="text-[10px] font-bold text-slate-500">{s.assigned_technician || '—'}</span> },
    { key: 'priority', label: 'Priority', align: 'center', render: (s) => {
      const colors: Record<string, string> = { High: 'text-rose-600', Medium: 'text-amber-600', Low: 'text-slate-400' };
      return <span className={`text-[10px] font-black ${colors[s.priority] || colors['Medium']}`}>{s.priority}</span>;
    } },
    { key: 'status', label: 'Status', align: 'center', render: (s) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Inactive: 'bg-slate-50 text-slate-500' };
      return <div className="flex justify-center"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[s.status] || colors['Active']}`}>{s.status}</span></div>;
    } },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false, render: (s) => (
      <div className="flex justify-center gap-1">
        {s.status === 'Active' && <button onClick={() => handleDeactivateSchedule(s)} className="p-1.5 text-slate-400 hover:text-rose-600 transition" title="Deactivate"><Trash2 size={14} /></button>}
      </div>
    ) },
  ];

  const woColumns: Column<WorkOrder>[] = [
    { key: 'wo_number', label: 'WO #', render: (w) => <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{w.wo_number || w.id.slice(0, 8)}</span> },
    { key: 'title', label: 'Title', render: (w) => <span className="text-xs font-black text-slate-900 dark:text-white">{w.title}</span> },
    { key: 'type', label: 'Type', align: 'center', render: (w) => <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${w.type === 'Preventive' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'}`}>{w.type}</span> },
    { key: 'priority', label: 'Priority', align: 'center', render: (w) => {
      const colors: Record<string, string> = { High: 'text-rose-600', Medium: 'text-amber-600', Low: 'text-slate-400' };
      return <span className={`text-[10px] font-black ${colors[w.priority] || colors['Medium']}`}>{w.priority}</span>;
    } },
    { key: 'scheduled_date', label: 'Scheduled', align: 'center', render: (w) => <span className="text-[10px] font-bold text-slate-500">{w.scheduled_date || '—'}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (w) => {
      const colors: Record<string, string> = { Open: 'bg-amber-50 text-amber-600', 'In Progress': 'bg-indigo-50 text-indigo-600', Completed: 'bg-emerald-50 text-emerald-600', Cancelled: 'bg-rose-50 text-rose-600' };
      return <div className="flex justify-center"><span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[w.status] || colors['Open']}`}>{w.status}</span></div>;
    } },
    { key: 'actions', label: 'Actions', align: 'center', sortable: false, render: (w) => (
      <div className="flex justify-center gap-1">
        <button onClick={() => { setSelectedWO(w); setShowWODetail(true); }} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View"><Eye size={14} /></button>
        {w.status === 'Open' && <button onClick={() => handleStartWO(w)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Start"><Zap size={14} /></button>}
        {w.status !== 'Completed' && <button onClick={() => handleCompleteWO(w)} className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Complete"><CheckCircle2 size={14} /></button>}
      </div>
    ) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Preventive Maintenance Scheduler</h2>
          <p className="text-xs text-slate-400 font-medium">Recurring PM schedules, checklist templates, auto-generated work orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={handleGenerate} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200">
            <Zap size={16} /> Generate PM WOs
          </button>
          <button onClick={() => setShowScheduleModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> New Schedule
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl"><p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p></div>}
      {genResult && <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl"><p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{genResult}</p></div>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-3"><CalendarClock size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Schedules</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{schedules.filter(s => s.status === 'Active').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 mb-3"><AlertTriangle size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Overdue</p>
          <h3 className="text-xl font-black text-rose-600">{overdueSchedules.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 mb-3"><Wrench size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Open WOs</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{openWOs.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 mb-3"><CheckCircle2 size={18} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Completed (All)</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{workOrders.filter(w => w.status === 'Completed').length}</h3>
        </div>
      </div>

      {/* PM Schedules Table */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
          <CalendarClock size={16} className="text-indigo-500" /> PM Schedules
        </h3>
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">Loading schedules...</div>
        ) : (
          <DataTable columns={schedColumns} data={schedules} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search schedules..." filterKeys={['schedule_name', 'status', 'frequency']} emptyMessage="No PM schedules. Click New Schedule to create one." />
        )}
      </div>

      {/* Work Orders Table */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3 flex items-center gap-2">
          <Wrench size={16} className="text-emerald-500" /> Work Orders
        </h3>
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">Loading work orders...</div>
        ) : (
          <DataTable columns={woColumns} data={workOrders} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search work orders..." filterKeys={['wo_number', 'title', 'status', 'type']} emptyMessage="No work orders found." />
        )}
      </div>

      {/* New Schedule Modal */}
      <ModalSystem isOpen={showScheduleModal} onClose={() => setShowScheduleModal(false)} title="New PM Schedule" subtitle="Create a recurring preventive maintenance schedule" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Schedule Name</label>
            <input value={form.scheduleName} onChange={e => setForm({ ...form, scheduleName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Monthly Generator Inspection" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Frequency</label>
              <select value={form.frequency} onChange={e => { const freq = e.target.value; const days = freq === 'Daily' ? 1 : freq === 'Weekly' ? 7 : freq === 'Monthly' ? 30 : freq === 'Quarterly' ? 90 : 365; setForm({ ...form, frequency: freq, intervalDays: days }); }} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annual">Annual</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Interval (days)</label>
              <input type="number" value={form.intervalDays} onChange={e => setForm({ ...form, intervalDays: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Next Due Date</label>
              <input type="date" value={form.nextDueDate} onChange={e => setForm({ ...form, nextDueDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Assigned Technician</label>
            <input value={form.assignedTechnician} onChange={e => setForm({ ...form, assignedTechnician: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Dawit Mechanic" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Checklist Template</label>
            <div className="space-y-2">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 w-6">{i + 1}.</span>
                  <input value={item} onChange={e => { const updated = [...checklist]; updated[i] = e.target.value; setChecklist(updated); }} className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-1 focus:ring-emerald-500" placeholder="Checklist item description" />
                  {checklist.length > 1 && <button onClick={() => setChecklist(checklist.filter((_, idx) => idx !== i))} className="p-1.5 text-slate-400 hover:text-rose-600 transition"><Trash2 size={14} /></button>}
                </div>
              ))}
              <button onClick={() => setChecklist([...checklist, ''])} className="text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                <Plus size={12} /> Add Item
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowScheduleModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleCreateSchedule} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Create Schedule</button>
        </div>
      </ModalSystem>

      {/* WO Detail Modal */}
      <ModalSystem isOpen={showWODetail && !!selectedWO} onClose={() => setShowWODetail(false)} title="Work Order Detail" subtitle={selectedWO?.wo_number || ''} variant="info" size="lg" showFooter={false}>
        {selectedWO && (
          <>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Title</span><span className="text-sm font-black text-slate-900 dark:text-white">{selectedWO.title}</span></div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Type</span><span className="text-sm font-black text-slate-900 dark:text-white">{selectedWO.type}</span></div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Priority</span><span className="text-sm font-black text-slate-900 dark:text-white">{selectedWO.priority}</span></div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Status</span><span className="text-sm font-black text-slate-900 dark:text-white">{selectedWO.status}</span></div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Assigned To</span><span className="text-sm font-black text-slate-900 dark:text-white">{selectedWO.assigned_to || '—'}</span></div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Scheduled</span><span className="text-sm font-black text-slate-900 dark:text-white">{selectedWO.scheduled_date || '—'}</span></div>
              </div>
              {selectedWO.description && <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</span><p className="text-xs font-bold text-slate-700 dark:text-slate-300">{selectedWO.description}</p></div>}
              {selectedWO.room_number && <div className="p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-center gap-2"><AlertTriangle size={14} className="text-amber-500" /><span className="text-xs font-bold text-amber-600">Room {selectedWO.room_number} — Auto-release OOO/OOS on completion</span></div>}
              {selectedWO.checklist && selectedWO.checklist.length > 0 && (
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Checklist ({selectedWO.checklist.length})</h4>
                  <div className="space-y-2">
                    {selectedWO.checklist.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl">
                        <CheckCircle2 size={14} className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.description || item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
              {selectedWO.status === 'Open' && <button onClick={() => { handleStartWO(selectedWO); setShowWODetail(false); }} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">Start</button>}
              {selectedWO.status !== 'Completed' && <button onClick={() => { handleCompleteWO(selectedWO); setShowWODetail(false); }} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Complete</button>}
              <button onClick={() => setShowWODetail(false)} className="px-6 py-2.5 bg-slate-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition">Close</button>
            </div>
          </>
        )}
      </ModalSystem>
    </div>
  );
};

export default PreventiveMaintenanceScheduler;
