import React, { useState } from 'react';
import {
  RefreshCw, Users, Building2, Plane, Briefcase,
  Crown, Target, Layers,
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';

const SEGMENTS = [
  { id: 'corporate', name: 'Corporate Clients', icon: Building2, color: 'bg-indigo-50 text-indigo-600', count: 0, revenue: 0, growth: '+12%' },
  { id: 'leisure', name: 'Leisure Travelers', icon: Users, color: 'bg-emerald-50 text-emerald-600', count: 0, revenue: 0, growth: '+8%' },
  { id: 'group', name: 'Group Bookings', icon: Layers, color: 'bg-amber-50 text-amber-600', count: 0, revenue: 0, growth: '+15%' },
  { id: 'travel-agent', name: 'Travel Agents', icon: Plane, color: 'bg-purple-50 text-purple-600', count: 0, revenue: 0, growth: '+5%' },
  { id: 'loyalty', name: 'Loyalty Members', icon: Crown, color: 'bg-rose-50 text-rose-600', count: 0, revenue: 0, growth: '+20%' },
  { id: 'event', name: 'Event Organizers', icon: Briefcase, color: 'bg-cyan-50 text-cyan-600', count: 0, revenue: 0, growth: '+10%' },
];

interface SegmentMember {
  id: string;
  name: string;
  segment: string;
  totalSpend: number;
  lastStay: string;
  frequency: string;
  value: string;
}

const CustomerSegmentation: React.FC = () => {
  const [members] = useState<SegmentMember[]>([]);
  const [activeSegment, setActiveSegment] = useState<string>('all');

  const filtered = members.filter(m => activeSegment === 'all' || m.segment === activeSegment);

  const columns: Column<SegmentMember>[] = [
    { key: 'name', label: 'Customer', render: (m) => <span className="text-xs font-black text-slate-900 dark:text-white">{m.name}</span> },
    { key: 'segment', label: 'Segment', align: 'center', render: (m) => <span className="text-[10px] font-bold text-slate-500">{m.segment}</span> },
    { key: 'totalSpend', label: 'Total Spend', align: 'right', render: (m) => <span className="text-xs font-black text-emerald-600">${m.totalSpend.toLocaleString()}</span> },
    { key: 'frequency', label: 'Frequency', align: 'center', render: (m) => <span className="text-[10px] font-bold text-slate-500">{m.frequency}</span> },
    { key: 'value', label: 'Value Tier', align: 'center', render: (m) => {
      const colors: Record<string, string> = { High: 'bg-emerald-50 text-emerald-600', Medium: 'bg-amber-50 text-amber-600', Low: 'bg-slate-100 text-slate-500' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[m.value] || colors['Medium']}`}>{m.value}</span>;
    } },
    { key: 'lastStay', label: 'Last Stay', align: 'center', render: (m) => <span className="text-[10px] font-bold text-slate-500">{m.lastStay}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Customer Segmentation</h2>
          <p className="text-xs text-slate-400 font-medium">Customer grouping, behavioral analysis, value tiers, and targeted marketing segments</p>
        </div>
        <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Segment Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {SEGMENTS.map(seg => {
          const Icon = seg.icon;
          return (
            <button key={seg.id} onClick={() => setActiveSegment(activeSegment === seg.id ? 'all' : seg.id)} className={`bg-white dark:bg-slate-900 border p-5 rounded-[28px] shadow-3xs text-left transition ${activeSegment === seg.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-150 dark:border-slate-800 hover:border-slate-300'}`}>
              <div className={`p-2 w-fit rounded-xl ${seg.color} mb-3`}><Icon size={16} /></div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{seg.name}</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">{seg.count}</h3>
              <p className="text-[10px] font-black text-emerald-600 mt-1">{seg.growth}</p>
            </button>
          );
        })}
      </div>

      {/* Value Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><Target size={14} /></div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">High Value</h3>
          </div>
          <p className="text-3xl font-black text-emerald-600">{members.filter(m => m.value === 'High').length}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Top 20% revenue contributors</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Target size={14} /></div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Medium Value</h3>
          </div>
          <p className="text-3xl font-black text-amber-600">{members.filter(m => m.value === 'Medium').length}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Growth potential customers</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] shadow-3xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500"><Target size={14} /></div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Low Value</h3>
          </div>
          <p className="text-3xl font-black text-slate-500">{members.filter(m => m.value === 'Low').length}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1">Re-engagement candidates</p>
        </div>
      </div>

      {activeSegment !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtered by:</span>
          <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{SEGMENTS.find(s => s.id === activeSegment)?.name}</span>
          <button onClick={() => setActiveSegment('all')} className="text-[10px] font-bold text-slate-400 hover:text-slate-600">Clear filter</button>
        </div>
      )}

      <DataTable columns={columns} data={filtered} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search customers..." filterKeys={['name', 'segment', 'value']} emptyMessage="No segmented customers found." />
    </div>
  );
};

export default CustomerSegmentation;
