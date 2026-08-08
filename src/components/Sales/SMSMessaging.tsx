import React, { useState } from 'react';
import {
  Plus, RefreshCw, MessageSquare, Send, Smartphone,
  Bell, MessageCircle, Zap,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const MSG_TYPES = ['Promotional SMS', 'Reservation Notification', 'Loyalty Notification', 'WhatsApp Message', 'Push Notification'];

interface Message {
  id: string;
  type: string;
  content: string;
  recipients: number;
  delivered: number;
  failed: number;
  status: string;
  sentDate: string;
}

const SMSMessaging: React.FC = () => {
  const [messages] = useState<Message[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    type: 'Promotional SMS', content: '', recipients: 0,
  });

  const columns: Column<Message>[] = [
    { key: 'type', label: 'Type', align: 'center', render: (m) => {
      const icons: Record<string, React.ReactNode> = { 'Promotional SMS': <MessageSquare size={12} />, 'Reservation Notification': <Bell size={12} />, 'Loyalty Notification': <Zap size={12} />, 'WhatsApp Message': <MessageCircle size={12} />, 'Push Notification': <Smartphone size={12} /> };
      const colors: Record<string, string> = { 'Promotional SMS': 'bg-purple-50 text-purple-600', 'Reservation Notification': 'bg-blue-50 text-blue-600', 'Loyalty Notification': 'bg-amber-50 text-amber-600', 'WhatsApp Message': 'bg-emerald-50 text-emerald-600', 'Push Notification': 'bg-indigo-50 text-indigo-600' };
      return <div className={`flex justify-center p-1.5 rounded-lg w-fit mx-auto ${colors[m.type] || colors['Promotional SMS']}`}>{icons[m.type] || <MessageSquare size={12} />}</div>;
    } },
    { key: 'content', label: 'Content', render: (m) => <span className="text-[10px] font-bold text-slate-600 truncate block max-w-xs">{m.content}</span> },
    { key: 'recipients', label: 'Recipients', align: 'center', render: (m) => <span className="text-[10px] font-black text-slate-600">{m.recipients.toLocaleString()}</span> },
    { key: 'delivered', label: 'Delivered', align: 'center', render: (m) => <span className="text-[10px] font-black text-emerald-600">{m.delivered.toLocaleString()}</span> },
    { key: 'failed', label: 'Failed', align: 'center', render: (m) => <span className="text-[10px] font-black text-rose-600">{m.failed}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (m) => {
      const colors: Record<string, string> = { Sent: 'bg-emerald-50 text-emerald-600', Scheduled: 'bg-blue-50 text-blue-600', Draft: 'bg-amber-50 text-amber-600', Failed: 'bg-rose-50 text-rose-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[m.status] || colors['Draft']}`}>{m.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">SMS & Messaging</h2>
          <p className="text-xs text-slate-400 font-medium">Promotional SMS, reservation notifications, loyalty notifications, WhatsApp, and push notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-purple-200">
            <Plus size={16} /> New Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {MSG_TYPES.map(type => {
          const count = messages.filter(m => m.type === type).length;
          const icons: Record<string, React.ReactNode> = { 'Promotional SMS': <MessageSquare size={14} />, 'Reservation Notification': <Bell size={14} />, 'Loyalty Notification': <Zap size={14} />, 'WhatsApp Message': <MessageCircle size={14} />, 'Push Notification': <Smartphone size={14} /> };
          return (
            <div key={type} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-[24px] shadow-3xs">
              <div className="p-1.5 w-fit rounded-lg bg-purple-50 text-purple-600 mb-2">{icons[type]}</div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{type}</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white">{count}</h4>
            </div>
          );
        })}
      </div>

      <DataTable columns={columns} data={messages} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search messages..." filterKeys={['type', 'content', 'status']} emptyMessage="No messages sent yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Message" subtitle="Send SMS, WhatsApp, or push notification" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Message Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500">
              {MSG_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Message Content</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={4} maxLength={160} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" placeholder="Type your message (max 160 characters for SMS)..." />
            <p className="text-[9px] text-slate-400 mt-1">{form.content.length}/160 characters</p>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Number of Recipients</label>
            <input type="number" value={form.recipients} onChange={e => setForm({ ...form, recipients: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-purple-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-purple-700 transition flex items-center gap-2"><Send size={14} /> Send Message</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default SMSMessaging;
