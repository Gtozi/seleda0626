import React, { useState } from 'react';
import {
  Plus, RefreshCw, Phone, Users, MapPin, CalendarClock,
  CheckSquare, Bell, ClipboardList,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const ACTIVITY_TYPES = ['Call', 'Meeting', 'Site Inspection', 'Client Visit', 'Follow-up', 'Task'];

interface Activity {
  id: string;
  type: string;
  title: string;
  relatedTo: string;
  assignedTo: string;
  dueDate: string;
  status: string;
  priority: string;
  notes: string;
}

const SalesActivities: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    type: 'Call', title: '', relatedTo: '', assignedTo: '',
    dueDate: '', priority: 'Medium', notes: '',
  });

  const columns: Column<Activity>[] = [
    { key: 'type', label: 'Type', align: 'center', render: (a) => {
      const icons: Record<string, React.ReactNode> = { Call: <Phone size={12} />, Meeting: <Users size={12} />, 'Site Inspection': <MapPin size={12} />, 'Client Visit': <MapPin size={12} />, 'Follow-up': <Bell size={12} />, Task: <CheckSquare size={12} /> };
      const colors: Record<string, string> = { Call: 'bg-blue-50 text-blue-600', Meeting: 'bg-indigo-50 text-indigo-600', 'Site Inspection': 'bg-purple-50 text-purple-600', 'Client Visit': 'bg-cyan-50 text-cyan-600', 'Follow-up': 'bg-amber-50 text-amber-600', Task: 'bg-emerald-50 text-emerald-600' };
      return <div className={`flex justify-center p-1.5 rounded-lg w-fit mx-auto ${colors[a.type] || colors['Task']}`}>{icons[a.type] || <ClipboardList size={12} />}</div>;
    } },
    { key: 'title', label: 'Title', render: (a) => <span className="text-xs font-black text-slate-900 dark:text-white">{a.title}</span> },
    { key: 'relatedTo', label: 'Related To', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.relatedTo || '—'}</span> },
    { key: 'assignedTo', label: 'Assigned', align: 'center', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.assignedTo || '—'}</span> },
    { key: 'dueDate', label: 'Due Date', align: 'center', render: (a) => <span className="text-[10px] font-bold text-slate-500">{a.dueDate || '—'}</span> },
    { key: 'priority', label: 'Priority', align: 'center', render: (a) => {
      const colors: Record<string, string> = { High: 'text-rose-600', Medium: 'text-amber-600', Low: 'text-slate-400' };
      return <span className={`text-[10px] font-black ${colors[a.priority] || colors['Medium']}`}>{a.priority}</span>;
    } },
    { key: 'status', label: 'Status', align: 'center', render: (a) => {
      const colors: Record<string, string> = { Pending: 'bg-amber-50 text-amber-600', Completed: 'bg-emerald-50 text-emerald-600', Overdue: 'bg-rose-50 text-rose-600', Cancelled: 'bg-slate-100 text-slate-500' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[a.status] || colors['Pending']}`}>{a.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Sales Activities</h2>
          <p className="text-xs text-slate-400 font-medium">Calls, meetings, site inspections, follow-ups, tasks, and calendar</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> New Activity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {ACTIVITY_TYPES.map(type => {
          const count = activities.filter(a => a.type === type).length;
          const icons: Record<string, React.ReactNode> = { Call: <Phone size={14} />, Meeting: <Users size={14} />, 'Site Inspection': <MapPin size={14} />, 'Client Visit': <MapPin size={14} />, 'Follow-up': <Bell size={14} />, Task: <CheckSquare size={14} /> };
          return (
            <div key={type} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-[24px] shadow-3xs">
              <div className="p-1.5 w-fit rounded-lg bg-indigo-50 text-indigo-600 mb-2">{icons[type]}</div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{type}</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white">{count}</h4>
            </div>
          );
        })}
      </div>

      <DataTable columns={columns} data={activities} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search activities..." filterKeys={['title', 'relatedTo', 'assignedTo', 'type']} emptyMessage="No sales activities scheduled." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Sales Activity" subtitle="Schedule a call, meeting, or task" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Activity Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                {ACTIVITY_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                <option>Low</option><option>Medium</option><option>High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g., Follow-up call with Ethiopian Airlines" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Related To</label>
              <input value={form.relatedTo} onChange={e => setForm({ ...form, relatedTo: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Lead or account name" />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Assigned To</label>
              <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Create Activity</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default SalesActivities;
