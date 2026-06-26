/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  BarChart3, 
  CreditCard, 
  TrendingDown, 
  TrendingUp, 
  FileText, 
  ArrowUpRight, 
  PieChart, 
  History,
  Download,
  Calendar,
  Filter,
  CheckCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell 
} from 'recharts';

const data = [
  { name: 'Jan', rev: 4000 },
  { name: 'Feb', rev: 3000 },
  { name: 'Mar', rev: 2000 },
  { name: 'Apr', rev: 2780 },
  { name: 'May', rev: 1890 },
  { name: 'Jun', rev: 2390 },
];

export default function FinanceAccounting() {
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'info' | 'error' }>({ show: false, msg: '', type: 'success' });

  const triggerToast = (msg: string, type: 'success' | 'info' | 'error' = 'success') => {
    setSaveToast({ show: true, msg, type });
    setTimeout(() => setSaveToast(prev => ({ ...prev, show: false })), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="finance-accounting-module">
      {saveToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border ${
          saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          saveToast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-100' : 'bg-indigo-50 text-indigo-800 border-indigo-100'
        }`}>
          <CheckCircle size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-indigo-600"} />
          <span>{saveToast.msg}</span>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-rose-500 uppercase tracking-widest">Fiscal Command</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Finance & Accounting Control</h2>
        </div>
        <div className="flex gap-2">
           <button onClick={() => triggerToast('Fiscal period selector opened.', 'info')} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50">
             <Calendar size={14} /> Fiscal Period
           </button>
           <button onClick={() => triggerToast('General ledger export downloaded.', 'info')} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
             <Download size={14} /> Export General Ledger
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Total Revenue', value: '$840,320', trend: '+12%', color: 'emerald' },
             { label: 'Operating Expenses', value: '$240,150', trend: '-2%', color: 'indigo' },
             { label: 'Net Profit Margin', value: '71.4%', trend: '+5%', color: 'purple' },
             { label: 'Outstanding Receivables', value: '$12,450', trend: 'Critical', color: 'rose' },
           ].map((kpi, i) => (
             <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</span>
                <div className="flex items-baseline justify-between">
                   <h3 className="text-2xl font-black text-slate-900 dark:text-white">{kpi.value}</h3>
                   <span className={`text-[10px] font-black text-${kpi.color}-600 bg-${kpi.color}-50 px-1.5 py-0.5 rounded`}>{kpi.trend}</span>
                </div>
             </div>
           ))}
        </div>

        <div className="lg:col-span-8 space-y-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                 <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Revenue Breakdown by Month</h3>
                    <p className="text-[10px] text-slate-400">YTD performance monitoring</p>
                 </div>
                 <BarChart3 size={18} className="text-slate-300" />
              </div>
              <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                       <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                       <YAxis fontSize={10} axisLine={false} tickLine={false} stroke="#94a3b8" />
                       <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                       <Bar dataKey="rev" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
                 <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Recent Transactions</h3>
                 <button onClick={() => triggerToast('Full general ledger view opened.', 'info')} className="text-[10px] font-black text-indigo-600 uppercase">View Ledger</button>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-850/50">
                          <th className="px-6 py-4">TXN ID</th>
                          <th className="px-6 py-4">DESCRIPTION</th>
                          <th className="px-6 py-4">METHOD</th>
                          <th className="px-6 py-4 text-right">AMOUNT ($)</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
                       {[
                         { id: 'TXN-9021', date: 'Today 14:42', desc: 'Corporate Booking (Google X)', method: 'Bank Transfer', amount: '+ 4,200.00' },
                         { id: 'TXN-9022', date: 'Today 13:10', desc: 'Utility Payment (Water/Power)', method: 'Direct Debit', amount: '- 1,240.00' },
                         { id: 'TXN-9023', date: 'Yesterday', desc: 'F&B Revenue (Main Bar)', method: 'POS Console', amount: '+ 850.50' },
                         { id: 'TXN-9024', date: 'Yesterday', desc: 'Petty Cash Replenishment', method: 'Cash', amount: '- 200.00' },
                         { id: 'TXN-9025', date: 'Yesterday', desc: 'Guest Refund (Late Check-out Issue)', method: 'Credit Card', amount: '- 150.00' },
                       ].map((txn, i) => (
                         <tr key={i} className="group text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-850 transition cursor-pointer">
                            <td className="px-6 py-4">
                               <div className="font-mono text-slate-400">{txn.id}</div>
                               <div className="text-[9px] text-slate-400 italic font-sans">{txn.date}</div>
                            </td>
                            <td className="px-6 py-4">
                               <div>{txn.desc}</div>
                               <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">COA: 4001-REVENUE</div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">{txn.method}</span>
                            </td>
                            <td className={`px-6 py-4 text-right font-mono font-black ${txn.amount.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                               {txn.amount}
                            </td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-950 p-6 rounded-3xl text-white shadow-xl space-y-6 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10"><DollarSign size={140} /></div>
              <h3 className="font-black text-sm uppercase tracking-widest relative z-10">Chart of Accounts</h3>
              <div className="space-y-3 relative z-10">
                 {[
                   { name: 'Revenue Accounts', balance: '$920k', color: 'indigo' },
                   { name: 'Operating Expense', balance: '$210k', color: 'rose' },
                   { name: 'Asset Accounts', balance: '$2.4M', color: 'emerald' },
                   { name: 'Payables Ledger', balance: '$12k', color: 'amber' },
                 ].map((acc, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-white/5 border border-white/10 rounded-2xl">
                       <span className="text-xs font-bold text-slate-300">{acc.name}</span>
                       <span className="text-xs font-black">{acc.balance}</span>
                    </div>
                 ))}
              </div>
              <button onClick={() => triggerToast('Full chart of accounts tree expanded.', 'info')} className="w-full py-2.5 bg-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Full Account Tree</button>
           </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
               <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <History size={16} className="text-slate-400" />
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax & Compliance Hub</span>
                  </div>
                  <button onClick={() => triggerToast('Advanced tax rules configuration opened.', 'info')} className="text-[9px] font-black text-indigo-600 uppercase border border-indigo-100 dark:border-indigo-900/50 px-2 py-0.5 rounded-lg hover:bg-indigo-50 transition">Advanced Rules</button>
               </div>
               <div className="space-y-3">
                  {[
                    { label: 'VAT Standard', rate: '15%', type: 'Global Service', status: 'Active' },
                    { label: 'Tourism Levy', rate: '2%', type: 'Per Room', status: 'Active' },
                    { label: 'Green Energy Fee', rate: '$5', type: 'Flat/Booking', status: 'Draft' },
                  ].map((tax, i) => (
                    <div key={i} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border dark:border-slate-800 group hover:border-indigo-400 transition-colors">
                       <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{tax.label}</div>
                          <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{tax.type}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-xs font-black text-indigo-600">{tax.rate}</div>
                          <span className={`text-[7px] font-black px-1 rounded uppercase ${tax.status === 'Active' ? 'text-emerald-500' : 'text-slate-500'}`}>{tax.status}</span>
                       </div>
                    </div>
                  ))}
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-between">
                     <div>
                         <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase block leading-none">Fiscal Period A</span>
                         <span className="text-xs font-black text-slate-900 dark:text-white mt-1 block">Reporting Ready</span>
                     </div>
                     <CheckCircle size={18} className="text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-slate-500 italic">Next Submission</span>
                        <span className="text-slate-900 dark:text-white">June 15, 2026</span>
                     </div>
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
}
