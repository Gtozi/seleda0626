import React from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  MoreVertical,
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  User,
  History
} from 'lucide-react';

const RequisitionManagement = () => {
  const requisitions = [
    { id: 'PR-2024-001', date: '2024-05-28', dept: 'Kitchen', requester: 'Chef Alex', priority: 'High', status: 'Approved', total: 2450.00, item: 'Kitchen Equipment' },
    { id: 'PR-2024-002', date: '2024-05-30', dept: 'Housekeeping', requester: 'Sara Miller', priority: 'Normal', status: 'Pending Approval', total: 1200.00, item: 'Toiletries Restock' },
    { id: 'PR-2024-003', date: '2024-05-30', dept: 'Engineering', requester: 'Tom Harris', priority: 'Urgent', status: 'Reviewing', total: 850.00, item: 'AC Spares' },
    { id: 'PR-2024-004', date: '2024-05-25', dept: 'Front Office', requester: 'Emma Wilson', priority: 'Low', status: 'PO Created', total: 320.00, item: 'Stationery' },
  ];

  return (
    <div className="space-y-6 text-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requisitions', value: '142', sub: 'Last 30 days', icon: FileText, color: 'text-indigo-600' },
          { label: 'Pending Approval', value: '18', sub: 'Next review: 2pm', icon: Clock, color: 'text-amber-600' },
          { label: 'Urgent Requests', value: '5', sub: 'High priority queue', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Conversion Rate', value: '94%', sub: 'Req to PO efficiency', icon: CheckCircle2, color: 'text-emerald-600' },
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
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Electronic Purchase Requisitions</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Inter-departmental request management</p>
           </div>
           <div className="flex gap-2">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Search requisitions..." 
                   className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-indigo-500 w-48"
                 />
              </div>
              <button className="p-2 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition">
                 <Filter size={16} />
              </button>
              <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight flex items-center gap-2 hover:opacity-90 transition">
                 <Plus size={14} />
                 Create PR
              </button>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Requisition</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department / Requester</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Value</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Priority</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {requisitions.map((req, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-indigo-600 font-mono tracking-tighter">{req.id}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">{req.item}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{req.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={14} />
                     </div>
                     <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{req.requester}</span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{req.dept}</span>
                     </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-black text-slate-900 dark:text-white">
                  ${req.total.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                      req.priority === 'Urgent' ? 'bg-rose-50 text-rose-600' : 
                      req.priority === 'High' ? 'bg-amber-50 text-amber-600' : 
                      req.priority === 'Normal' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-500'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-tight ${
                    req.status === 'Approved' ? 'text-emerald-500' : 
                    req.status === 'PO Created' ? 'text-indigo-500' : 
                    req.status === 'Urgent' ? 'text-rose-500' : 'text-slate-500'
                  }`}>
                    <div className={`w-1 h-1 rounded-full ${
                      req.status === 'Approved' ? 'bg-emerald-500' : 
                      req.status === 'PO Created' ? 'bg-indigo-500' : 'bg-slate-400'
                    }`} />
                    {req.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View Details">
                      <ArrowRight size={14} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                      <History size={14} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-4 bg-slate-50 dark:bg-slate-950/20 flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
           Page 1 of 4 | Showing 4 of 142 Requests
        </div>
      </div>
    </div>
  );
};

export default RequisitionManagement;
