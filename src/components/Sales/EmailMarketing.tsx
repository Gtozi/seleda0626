import React, { useState } from 'react';
import {
  Plus, RefreshCw, Mail, Send, Eye, MousePointerClick,
  AlertCircle, UserX, FileText,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

interface EmailCampaign {
  id: string;
  subject: string;
  template: string;
  recipients: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  unsubscribeRate: number;
  status: string;
  sentDate: string;
}

const EmailMarketing: React.FC = () => {
  const [emails, setEmails] = useState<EmailCampaign[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    subject: '', template: 'Welcome', recipients: 0, body: '',
  });

  const columns: Column<EmailCampaign>[] = [
    { key: 'subject', label: 'Subject', render: (e) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600"><Mail size={12} /></div>
        <span className="text-xs font-black text-slate-900 dark:text-white">{e.subject}</span>
      </div>
    ) },
    { key: 'template', label: 'Template', align: 'center', render: (e) => <span className="text-[10px] font-bold text-slate-500">{e.template}</span> },
    { key: 'recipients', label: 'Recipients', align: 'center', render: (e) => <span className="text-[10px] font-black text-slate-600">{e.recipients.toLocaleString()}</span> },
    { key: 'openRate', label: 'Open Rate', align: 'center', render: (e) => (
      <div className="flex items-center justify-center gap-1">
        <Eye size={10} className="text-blue-500" />
        <span className="text-[10px] font-black text-blue-600">{e.openRate}%</span>
      </div>
    ) },
    { key: 'clickRate', label: 'Click Rate', align: 'center', render: (e) => (
      <div className="flex items-center justify-center gap-1">
        <MousePointerClick size={10} className="text-emerald-500" />
        <span className="text-[10px] font-black text-emerald-600">{e.clickRate}%</span>
      </div>
    ) },
    { key: 'bounceRate', label: 'Bounce', align: 'center', render: (e) => (
      <div className="flex items-center justify-center gap-1">
        <AlertCircle size={10} className="text-rose-500" />
        <span className="text-[10px] font-black text-rose-600">{e.bounceRate}%</span>
      </div>
    ) },
    { key: 'unsubscribeRate', label: 'Unsub', align: 'center', render: (e) => (
      <div className="flex items-center justify-center gap-1">
        <UserX size={10} className="text-slate-400" />
        <span className="text-[10px] font-black text-slate-500">{e.unsubscribeRate}%</span>
      </div>
    ) },
    { key: 'status', label: 'Status', align: 'center', render: (e) => {
      const colors: Record<string, string> = { Sent: 'bg-emerald-50 text-emerald-600', Scheduled: 'bg-blue-50 text-blue-600', Draft: 'bg-amber-50 text-amber-600', Failed: 'bg-rose-50 text-rose-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[e.status] || colors['Draft']}`}>{e.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Email Marketing</h2>
          <p className="text-xs text-slate-400 font-medium">Email templates, personalized campaigns, automation, open/click tracking, and unsubscribe management</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-blue-200">
            <Plus size={16} /> New Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-blue-50 text-blue-600 mb-3"><Mail size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Sent</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{emails.reduce((s, e) => s + e.recipients, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><Eye size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Open Rate</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{emails.length > 0 ? (emails.reduce((s, e) => s + e.openRate, 0) / emails.length).toFixed(1) : 0}%</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-purple-50 text-purple-600 mb-3"><MousePointerClick size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Click Rate</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{emails.length > 0 ? (emails.reduce((s, e) => s + e.clickRate, 0) / emails.length).toFixed(1) : 0}%</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 mb-3"><AlertCircle size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Avg Bounce</p>
          <h3 className="text-xl font-black text-rose-600">{emails.length > 0 ? (emails.reduce((s, e) => s + e.bounceRate, 0) / emails.length).toFixed(1) : 0}%</h3>
        </div>
      </div>

      <DataTable columns={columns} data={emails} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search emails..." filterKeys={['subject', 'template', 'status']} emptyMessage="No email campaigns sent yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Email Campaign" subtitle="Create and send a personalized email campaign" variant="form" size="lg" showFooter={false}>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Subject Line</label>
            <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., Exclusive Summer Offer Just for You" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Template</label>
              <select value={form.template} onChange={e => setForm({ ...form, template: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500">
                <option>Welcome</option><option>Promotion</option><option>Newsletter</option><option>Loyalty Update</option><option>Event Invitation</option><option>Follow-up</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Recipients</label>
              <input type="number" value={form.recipients} onChange={e => setForm({ ...form, recipients: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Email Body</label>
            <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} rows={5} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="Write your email content here..." />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition flex items-center gap-2"><Send size={14} /> Send Campaign</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default EmailMarketing;
