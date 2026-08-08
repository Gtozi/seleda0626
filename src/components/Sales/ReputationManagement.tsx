import React, { useState } from 'react';
import {
  RefreshCw, Star, AlertTriangle,
  ThumbsUp, ThumbsDown, Meh,
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';

interface Review {
  id: string;
  source: string;
  guestName: string;
  rating: number;
  title: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  status: string;
  date: string;
  response: string | null;
}

const ReputationManagement: React.FC = () => {
  const [reviews] = useState<Review[]>([]);
  const [filterSentiment, setFilterSentiment] = useState<string>('all');

  const filtered = reviews.filter(r => {
    if (filterSentiment !== 'all' && r.sentiment !== filterSentiment) return false;
    return true;
  });

  const columns: Column<Review>[] = [
    { key: 'source', label: 'Source', align: 'center', render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.source}</span> },
    { key: 'guestName', label: 'Guest', render: (r) => <span className="text-xs font-black text-slate-900 dark:text-white">{r.guestName}</span> },
    { key: 'rating', label: 'Rating', align: 'center', render: (r) => (
      <div className="flex items-center justify-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} className={i <= r.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}
      </div>
    ) },
    { key: 'title', label: 'Review', render: (r) => <span className="text-[10px] font-bold text-slate-600 truncate block max-w-xs">{r.title}</span> },
    { key: 'sentiment', label: 'Sentiment', align: 'center', render: (r) => {
      const icons: Record<string, React.ReactNode> = { positive: <ThumbsUp size={12} />, neutral: <Meh size={12} />, negative: <ThumbsDown size={12} /> };
      const colors: Record<string, string> = { positive: 'bg-emerald-50 text-emerald-600', neutral: 'bg-amber-50 text-amber-600', negative: 'bg-rose-50 text-rose-600' };
      return <div className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest w-fit mx-auto ${colors[r.sentiment]}`}>{icons[r.sentiment]} {r.sentiment}</div>;
    } },
    { key: 'date', label: 'Date', align: 'center', render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.date}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (r) => {
      const colors: Record<string, string> = { Responded: 'bg-emerald-50 text-emerald-600', Pending: 'bg-amber-50 text-amber-600', Escalated: 'bg-rose-50 text-rose-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[r.status] || colors['Pending']}`}>{r.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Reputation Management</h2>
          <p className="text-xs text-slate-400 font-medium">Online review monitoring, sentiment analysis, complaint tracking, and review response workflow</p>
        </div>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><Star size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Rating</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '—'}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><ThumbsUp size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Positive</p>
          <h3 className="text-xl font-black text-emerald-600">{reviews.filter(r => r.sentiment === 'positive').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 mb-3"><ThumbsDown size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Negative</p>
          <h3 className="text-xl font-black text-rose-600">{reviews.filter(r => r.sentiment === 'negative').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><AlertTriangle size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Pending Response</p>
          <h3 className="text-xl font-black text-amber-600">{reviews.filter(r => r.status === 'Pending').length}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {['all', 'positive', 'neutral', 'negative'].map(s => (
          <button key={s} onClick={() => setFilterSentiment(s)} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition ${filterSentiment === s ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'}`}>{s}</button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search reviews..." filterKeys={['guestName', 'source', 'title']} emptyMessage="No reviews monitored yet." />
    </div>
  );
};

export default ReputationManagement;
