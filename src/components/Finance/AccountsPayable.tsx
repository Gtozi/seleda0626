import React from 'react';
import { 
  Truck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

const AccountsPayable = () => {
  const vendors = [
    { id: 'VND-LX-42', name: 'Luxury Linen Services', amount: 4850.00, dueDate: '2024-06-05', status: 'Pending', category: 'Operations' },
    { id: 'VND-FB-99', name: 'Premium Beverage Co.', amount: 12420.00, dueDate: '2024-05-30', status: 'Overdue', category: 'F&B' },
    { id: 'VND-EN-21', name: 'Global Energy Corp', amount: 8200.00, dueDate: '2024-06-12', status: 'Review', category: 'Utilities' },
    { id: 'VND-MK-88', name: 'Digital Media Hub', amount: 2500.00, dueDate: '2024-06-15', status: 'Scheduled', category: 'Marketing' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payables', value: '$142,800', sub: 'Due within 30 days', icon: ArrowDownRight, color: 'text-amber-600' },
          { label: 'Critical Due', value: '$24,500', sub: 'Action required now', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Vendor Contracts', value: '18 Active', sub: '+2 this month', icon: Truck, color: 'text-blue-600' },
          { label: 'Cash Required', value: '$84,200', sub: 'For next pay run', icon: Calendar, color: 'text-indigo-600' },
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
           <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Accounts Payable Registry</h3>
           <div className="flex gap-2">
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2">
                 Generate Pay Run
              </button>
              <button className="p-2 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                 <Filter size={16} />
              </button>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Entity</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Due Date</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Portal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sans">
            {vendors.map((v, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{v.name}</span>
                    <span className="text-[9px] font-bold text-slate-400 font-mono">{v.id}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{v.category}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900 dark:text-white">${v.amount.toLocaleString()}</span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-[10px] font-bold text-slate-500">{v.dueDate}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      v.status === 'Overdue' ? 'bg-rose-50 text-rose-600' : 
                      v.status === 'Scheduled' ? 'bg-emerald-50 text-emerald-600' : 
                      v.status === 'Review' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {v.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition">
                    <ExternalLink size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsPayable;
