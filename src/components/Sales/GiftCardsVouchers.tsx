import React, { useState } from 'react';
import {
  Plus, RefreshCw, Gift, Ticket, DollarSign,
  CheckCircle2, XCircle, Clock,
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';

const VOUCHER_TYPES = ['Gift Card', 'Promotional Voucher', 'Discount Coupon', 'Corporate Voucher'];

interface Voucher {
  id: string;
  code: string;
  type: string;
  value: number;
  balance: number;
  recipient: string;
  issueDate: string;
  expiryDate: string;
  status: string;
}

const GiftCardsVouchers: React.FC = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    type: 'Gift Card', value: 100, recipient: '', expiryDate: '',
  });

  const columns: Column<Voucher>[] = [
    { key: 'code', label: 'Code', render: (v) => <span className="text-[10px] font-mono font-black text-indigo-600 uppercase">{v.code}</span> },
    { key: 'type', label: 'Type', align: 'center', render: (v) => {
      const icons: Record<string, React.ReactNode> = { 'Gift Card': <Gift size={12} />, 'Promotional Voucher': <Ticket size={12} />, 'Discount Coupon': <Ticket size={12} />, 'Corporate Voucher': <Ticket size={12} /> };
      const colors: Record<string, string> = { 'Gift Card': 'bg-rose-50 text-rose-600', 'Promotional Voucher': 'bg-purple-50 text-purple-600', 'Discount Coupon': 'bg-amber-50 text-amber-600', 'Corporate Voucher': 'bg-indigo-50 text-indigo-600' };
      return <div className={`flex items-center justify-center gap-1 p-1.5 rounded-lg w-fit mx-auto ${colors[v.type] || colors['Gift Card']}`}>{icons[v.type] || <Ticket size={12} />}</div>;
    } },
    { key: 'value', label: 'Value', align: 'right', render: (v) => <span className="text-xs font-black text-slate-900 dark:text-white">${v.value}</span> },
    { key: 'balance', label: 'Balance', align: 'right', render: (v) => <span className="text-xs font-black text-emerald-600">${v.balance}</span> },
    { key: 'recipient', label: 'Recipient', render: (v) => <span className="text-[10px] font-bold text-slate-500">{v.recipient || '—'}</span> },
    { key: 'expiryDate', label: 'Expires', align: 'center', render: (v) => <span className="text-[10px] font-bold text-slate-500">{v.expiryDate || '—'}</span> },
    { key: 'status', label: 'Status', align: 'center', render: (v) => {
      const colors: Record<string, string> = { Active: 'bg-emerald-50 text-emerald-600', Redeemed: 'bg-slate-100 text-slate-500', Expired: 'bg-rose-50 text-rose-600', Suspended: 'bg-amber-50 text-amber-600' };
      return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[v.status] || colors['Active']}`}>{v.status}</span>;
    } },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">Gift Cards & Vouchers</h2>
          <p className="text-xs text-slate-400 font-medium">Gift cards, promotional vouchers, discount coupons, redemption tracking, and expiration management</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          <button onClick={() => setShowAddModal(true)} className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-rose-200">
            <Plus size={16} /> New Voucher
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-rose-50 text-rose-600 mb-3"><Gift size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Vouchers</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{vouchers.length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-3"><CheckCircle2 size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active</p>
          <h3 className="text-xl font-black text-emerald-600">{vouchers.filter(v => v.status === 'Active').length}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-amber-50 text-amber-600 mb-3"><DollarSign size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Outstanding Balance</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">${vouchers.reduce((s, v) => s + v.balance, 0).toLocaleString()}</h3>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-[28px] shadow-3xs">
          <div className="p-2 w-fit rounded-xl bg-slate-100 text-slate-500 mb-3"><Clock size={16} /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Redeemed</p>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">{vouchers.filter(v => v.status === 'Redeemed').length}</h3>
        </div>
      </div>

      <DataTable columns={columns} data={vouchers} rowKey={(row) => row.id} sortable filterable filterPlaceholder="Search vouchers..." filterKeys={['code', 'type', 'recipient', 'status']} emptyMessage="No gift cards or vouchers issued yet." />

      <ModalSystem isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="New Gift Card / Voucher" subtitle="Issue a gift card, voucher, or coupon" variant="form" size="md" showFooter={false}>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500">
                {VOUCHER_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Value ($)</label>
              <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" />
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Recipient</label>
            <input value={form.recipient} onChange={e => setForm({ ...form, recipient: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" placeholder="Recipient name" />
          </div>
          <div>
            <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={e => setForm({ ...form, expiryDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-rose-500" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={() => setShowAddModal(false)} className="px-6 py-2.5 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition">Issue Voucher</button>
        </div>
      </ModalSystem>
    </div>
  );
};

export default GiftCardsVouchers;
