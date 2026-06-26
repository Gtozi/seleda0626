import React from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

const AccountsReceivable = () => {
  const invoices = [
    { id: 'INV-2024-001', customer: 'Corporate Group', amount: 12450.00, date: '2024-05-28', due: '2024-06-12', status: 'Pending' },
    { id: 'INV-2024-002', customer: 'Global Travel Agency', amount: 8200.00, date: '2024-05-25', due: '2024-06-08', status: 'Partial', paid: 4000.00 },
    { id: 'INV-2024-003', customer: 'Hotel Rewards Elite', amount: 1540.00, date: '2024-05-30', due: '2024-06-14', status: 'Open' },
    { id: 'INV-2024-004', customer: 'Local Events Co.', amount: 4800.00, date: '2024-05-15', due: '2024-05-30', status: 'Overdue' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Outstanding', value: '$248,500', sub: 'Across 42 accounts', icon: ArrowUpRight, color: 'text-indigo-600' },
          { label: 'Average Days to Pay', value: '14.2 Days', sub: '-2.1 from last month', icon: Clock, color: 'text-emerald-600' },
          { label: 'Overdue Amount', value: '$12,480', sub: 'High Priority', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Projected Inflow', value: '$84,200', sub: 'Expect within 7 days', icon: Calendar, color: 'text-blue-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
               <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
           <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Accounts Receivable Ledger</h3>
           <div className="flex gap-2">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Search ledger..." 
                   className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 w-48"
                 />
              </div>
              <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                 <Filter size={16} />
              </button>
              <button className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                 <Download size={16} />
              </button>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Entity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Due Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sans">
            {invoices.map((inv, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-[10px] font-black text-indigo-600 font-mono">{inv.id}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{inv.customer}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white">${inv.amount.toLocaleString()}</span>
                    {inv.paid && <span className="text-[9px] font-bold text-emerald-500 uppercase">Paid: ${inv.paid}</span>}
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[10px] font-bold text-slate-500">{inv.due}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      inv.status === 'Open' ? 'bg-blue-50 text-blue-600' : 
                      inv.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 
                      inv.status === 'Overdue' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                    <MoreVertical size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
           Viewing 4 of 42 Records
        </div>
      </div>
    </div>
  );
};

export default AccountsReceivable;
