import React, { useState } from 'react';
import {
  Plus, RefreshCw, Star, MessageSquare, AlertCircle,
  CheckCircle2, Clock, Utensils, Calendar,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const FEEDBACK_TYPES = ['Post-Stay Survey', 'In-Stay Survey', 'Event Feedback', 'Restaurant Feedback', 'Complaint'];

interface Feedback {
  id: string;
  type: string;
  guestName: string;
  rating: number;
  comments: string;
  status: string;
  resolution: string | null;
  date: string;
}

const GuestFeedback: React.FC = () => {
  const [feedback] = useState<Feedback[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    type: 'Post-Stay Survey', guestName: '', rating: 5, comments: '',
  });

  const columns: Column<Feedback>[] = [
    { key: 'type', label: 'Type', align: 'center', render: (f) => {
      const icons: Record<string, React.ReactNode> = { 'Post-Stay Survey': <Star size={12} />, 'In-Stay Survey': <MessageSquare size={12} />, 'Event Feedback': <Calendar size={12} />, 'Restaurant Feedback': <Utensils size={12} />, 'Complaint': <AlertCircle size={12} /> };
      const colors: Record<string, string> = { 'Post-Stay Survey': 'bg-blue-50 text-blue-600', 'In-Stay Survey': 'bg-indigo-50 text-indigo-600', 'Event Feedback': 'bg-purple-50 text-purple-600', 'Restaurant Feedback': 'bg-amber-50 text-amber-600', 'Complaint': 'bg-rose-50 text-rose-600' };
      return <div className={`flex justify-center p-1.5 rounded-lg w-fit mx-auto ${colors[f.type] || colors['Post-Stay Survey']}`}>{icons[f.type] || <MessageSquare size={12} />}</div>;
    } },
    { key: 'guestName', label: 'Guest', render: (f) => <span className="text-xs font-black text-slate-900 dark:text-white">{f.guestName}</span> },
    { key: 'rating', label: 'Rating', align: 'center', render: (f) => (
      <div className="flex items-center justify-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className={i <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}
      </div>
    ) },
    { key: 'comments', label: 'Comments', render: (f) => <span className="text-[10px] font-bold text-slate-600 truncate block max-w-xs">{f.comments}</span> },
    { key: 'date', label: 'Date', align: 'center', render: (f) => <span className="text-[10px] font-bold text-slate-500">{f.date}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (f) => {
      const colors: Record<string, string> = { Resolved: 'bg-emerald-50 text-emerald-600', Pending: 'bg-amber-50 text-amber-600', Escalated: 'bg-rose-50 text-rose-600', Closed: 'bg-slate-100 text-slate-500' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[f.status] || colors['Pending']}`}>{f.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Guest Feedback</h2>
          <p className="text-xs text-slate-400 font-medium">Post-stay surveys, in-stay surveys, event feedback, complaint management, and resolution tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-emerald-200">
            <Plus size={16} /> Log Feedback
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><Star size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Rating</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><CheckCircle2 size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Resolved</p>
          <h3 className="text-xl font-black text-emerald-600">{feedback.filter(f => f.status === 'Resolved').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><Clock size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending</p>
          <h3 className="text-xl font-black text-amber-600">{feedback.filter(f => f.status === 'Pending').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 mb-3"><AlertCircle size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Complaints</p>
          <h3 className="text-xl font-black text-rose-600">{feedback.filter(f => f.type === 'Complaint').length}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={feedback} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search feedback..." filterKeys={['guestName', 'type', 'status']} emptyMessage="No guest feedback collected yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Guest Feedback" subtitle="Record survey results or complaints" variant="form" size="md" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Feedback Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                {FEEDBACK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Rating (1-5)</label>
              <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500">
                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Guest Name</label>
            <input value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Comments</label>
            <textarea value={form.comments} onChange={e => setForm({ ...form, comments: e.target.value })} rows={4} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition">Log Feedback</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default GuestFeedback;
