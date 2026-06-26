import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  User, 
  ChevronRight, 
  AlertCircle,
  ShieldCheck,
  FileText,
  ShoppingCart,
  Receipt,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

const ApprovalCenter = () => {
  const pendingApprovals = [
    { id: 'APP-1002', type: 'Purchase Requisition', ref: 'PR-2024-042', amount: 14500.00, requester: 'Kitchen Dept', status: 'Pending Dept. Head', date: '2 hrs ago', priority: 'High' },
    { id: 'APP-1001', type: 'Purchase Order', ref: 'PO-2024-88', amount: 12420.00, requester: 'Procurement', status: 'Pending Finance', date: '5 hrs ago', priority: 'Normal' },
    { id: 'APP-1000', type: 'Supplier Invoice', ref: 'INV-VEN-400', amount: 12420.00, requester: 'Accounts Payable', status: 'Pending GM', date: 'Yesterday', priority: 'Urgent' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending My Action', value: '4', sub: 'Action required', icon: ShieldAlert, color: 'text-amber-600' },
          { label: 'Total In-workflow', value: '18', sub: 'Across 4 levels', icon: Clock, color: 'text-indigo-600' },
          { label: 'Avg. Decision Time', value: '1.2 Hrs', sub: 'Performance KPI', icon: ShieldCheck, color: 'text-emerald-600' },
          { label: 'Rejected (MTD)', value: '3', sub: 'Returned to requestor', icon: XCircle, color: 'text-rose-600' },
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

      <div className="grid lg:grid-cols-12 gap-6">
         {/* Live Approval Queue */}
         <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between mb-2 px-2">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Active Approval Queue</h3>
               <button className="text-[10px] font-black text-indigo-600 uppercase">Approval History</button>
            </div>
            <div className="space-y-3">
               {pendingApprovals.map((app, i) => (
                 <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs group hover:border-indigo-200 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-6">
                       <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                             app.type === 'Purchase Requisition' ? 'bg-blue-50 text-blue-600' : 
                             app.type === 'Purchase Order' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                             {app.type === 'Purchase Requisition' ? <FileText size={20} /> : 
                              app.type === 'Purchase Order' ? <ShoppingCart size={20} /> : <Receipt size={20} />}
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{app.type}</h4>
                             <span className="text-[10px] font-bold text-slate-400 font-mono italic">{app.ref}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white block tracking-tight">${app.amount.toLocaleString()}</span>
                          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total Value</span>
                       </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                       <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                             {[1, 2].map(n => (
                               <div key={n} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                  <User size={10} className="text-slate-400" />
                               </div>
                             ))}
                          </div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{app.status}</span>
                             <span className="text-[8px] font-bold text-slate-400 uppercase">Workflow Position</span>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-2">
                          <button className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-tight hover:bg-rose-100 transition">
                             Reject
                          </button>
                          <button className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-tight hover:opacity-90 transition shadow-lg shadow-slate-200 dark:shadow-none">
                             Approve
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         {/* Approval Metrics */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
               <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">System Hierarchy</h3>
               <div className="space-y-4">
                  {[
                    { level: 'Dept Manager', role: 'Purchase Requisition', limit: '< $5,000' },
                    { level: 'Finance Manager', role: 'Budget Validation', limit: '$5k - $25k' },
                    { level: 'General Manager', role: 'Strategic Approval', limit: '> $25,000' },
                    { level: 'Asset Board', role: 'Capital Expenditure', limit: 'CAPEX' },
                  ].map((level, i) => (
                    <div key={i} className="flex items-center gap-4 group cursor-pointer">
                       <div className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-500 transition-colors" />
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-0.5">
                             <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{level.level}</h4>
                             <span className="text-[9px] font-bold text-indigo-600 uppercase">{level.limit}</span>
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{level.role}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-600 p-8 rounded-[40px] text-white">
               <h3 className="text-sm font-black uppercase tracking-tight mb-4">Batch Approval</h3>
               <p className="text-[10px] text-indigo-100 font-medium mb-6 leading-relaxed">Approve all pending requisitions under $1,000 for your department instantly.</p>
               <button className="w-full py-4 bg-white text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-2xl transition flex items-center justify-center gap-2">
                  Initialize Batch Run
                  <ArrowRight size={14} />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ApprovalCenter;
