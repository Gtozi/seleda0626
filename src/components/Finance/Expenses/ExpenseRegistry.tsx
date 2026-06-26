import React from 'react';
import { 
  FileText, 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  XCircle, 
  ChevronRight,
  Download,
  Eye,
  Paperclip,
  Building2,
  DollarSign
} from 'lucide-react';

import { useERP } from '../../../context/ERPContext';

const ExpenseRegistry = () => {
  const { expenseRequests: expenses, formatAmount } = useERP();

  const statusColors = {
    'Under Review': 'bg-amber-50 text-amber-600 border-amber-100',
    'Approved': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Paid': 'bg-emerald-50 text-emerald-600 border-emerald-100',
    'Rejected': 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Financial Expense Registry</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Audit log of all departmental expenditures</p>
           </div>
           <div className="flex gap-2">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Search expense ID or dept..." 
                   className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 w-64"
                 />
              </div>
              <button className="p-2 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition">
                 <Filter size={16} />
              </button>
           </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense ID / Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category / Use-case</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Value</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Approval Workflow</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {expenses.map((exp, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{exp.id}</span>
                        {exp.isGrn && (
                          <span className="bg-emerald-55 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-450 px-1 py-0.2 rounded text-[7px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900">
                            GRN
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase">{exp.date}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${exp.isGrn ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                           {exp.isGrn ? <FileText size={14} /> : <Building2 size={14} />}
                        </div>
                        <div className="flex flex-col">
                           <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">
                              {exp.isGrn ? `${exp.subcategory} (${exp.grnId})` : exp.subcategory}
                           </span>
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter block">
                              {exp.isGrn ? `Supplier: ${exp.supplierName}` : `${exp.category} • ${exp.department}`}
                           </span>
                           {exp.isGrn && (
                             <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 italic block mt-1 bg-slate-50 dark:bg-slate-950/25 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-800 max-w">
                               {exp.description}
                             </span>
                           )}
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{formatAmount(exp.amount)}</span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{exp.approver}</span>
                        <div className="flex items-center gap-1 mt-1">
                           <div className="w-1 h-1 rounded-full bg-emerald-500" />
                           <div className="w-1 h-1 rounded-full bg-emerald-500" />
                           <div className={`w-1 h-1 rounded-full ${exp.status === 'Paid' ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        </div>
                     </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${statusColors[exp.status as keyof typeof statusColors]}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><Eye size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"><Download size={14} /></button>
                      <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition"><MoreVertical size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseRegistry;
