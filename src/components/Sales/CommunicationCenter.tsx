import React, { useState } from 'react';
import {
  Plus, RefreshCw, Mail, MessageSquare, Bell,
  Send, Phone, Users,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const CHANNELS = ['Email', 'SMS', 'WhatsApp', 'Push Notification', 'In-App Message'];

interface Communication {
  id: string;
  channel: string;
  subject: string;
  recipient: string;
  status: string;
  date: string;
  body: string;
}

const CommunicationCenter: React.FC = () => {
  const [messages, setMessages] = useState<Communication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    channel: 'Email', subject: '', recipient: '', body: '',
  });

  const columns: Column<Communication>[] = [
    { key: 'channel', label: 'Channel', align: 'center', render: (m) => {
      const icons: Record<string, React.ReactNode> = { Email: <Mail size={12} />, SMS: <MessageSquare size={12} />, WhatsApp: <MessageSquare size={12} />, 'Push Notification': <Bell size={12} />, 'In-App Message': <Bell size={12} /> };
      const colors: Record<string, string> = { Email: 'bg-blue-50 text-blue-600', SMS: 'bg-purple-50 text-purple-600', WhatsApp: 'bg-emerald-50 text-emerald-600', 'Push Notification': 'bg-indigo-50 text-indigo-600', 'In-App Message': 'bg-amber-50 text-amber-600' };
      return <div className={`flex justify-center p-1.5 rounded-lg w-fit mx-auto ${colors[m.channel] || colors['Email']}`}>{icons[m.channel] || <Mail size={12} />}</div>;
    } },
    { key: 'subject', label: 'Subject', render: (m) => <span className="text-xs font-black text-slate-900 dark:text-white">{m.subject}</span> },
    { key: 'recipient', label: 'Recipient', render: (m) => <span className="text-[10px] font-bold text-slate-500">{m.recipient}</span> },
    { key: 'date', label: 'Date', align: 'center', render: (m) => <span className="text-[10px] font-bold text-slate-500">{m.date}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (m) => {
      const colors: Record<string, string> = { Sent: 'bg-emerald-50 text-emerald-600', Delivered: 'bg-emerald-50 text-emerald-600', Failed: 'bg-rose-50 text-rose-600', Pending: 'bg-amber-50 text-amber-600', Read: 'bg-blue-50 text-blue-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[m.status] || colors['Pending']}`}>{m.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Communication Center</h2>
          <p className="text-xs text-slate-400 font-medium">Unified messaging across email, SMS, WhatsApp, push notifications, and in-app messages</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200">
            <Plus size={16} /> New Message
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {CHANNELS.map(ch => {
          const count = messages.filter(m => m.channel === ch).length;
          const icons: Record<string, React.ReactNode> = { Email: <Mail size={14} />, SMS: <MessageSquare size={14} />, WhatsApp: <MessageSquare size={14} />, 'Push Notification': <Bell size={14} />, 'In-App Message': <Bell size={14} /> };
          const colors: Record<string, string> = { Email: 'bg-blue-50 text-blue-600', SMS: 'bg-purple-50 text-purple-600', WhatsApp: 'bg-emerald-50 text-emerald-600', 'Push Notification': 'bg-indigo-50 text-indigo-600', 'In-App Message': 'bg-amber-50 text-amber-600' };
          return (
            <div key={ch} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-[24px] shadow-3xs">
              <div className={`p-1.5 w-fit rounded-lg ${colors[ch]} mb-2`}>{icons[ch]}</div>
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{ch}</p>
              <h4 className="text-base font-black text-slate-900 dark:text-white">{count}</h4>
            </div>
          );
        })}
      </div>

      <DataTable columns={columns} data={messages} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search messages..." filterKeys={['subject', 'recipient', 'channel', 'status']} emptyMessage="No messages sent yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Communication" subtitle="Send a message via any channel" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Channel</label>
              <select value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500">
                {CHANNELS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Recipient</label>
              <input value={form.recipient} onChange={e => setForm({ ...form, recipient: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Email or phone number" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Subject</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Message</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={5} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2"><Send size={14} /> Send</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default CommunicationCenter;
