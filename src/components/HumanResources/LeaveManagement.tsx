import React from 'react';
import { Calendar, UserCheck, Clock, CheckCircle2, XCircle, Search, Filter, History, Target } from 'lucide-react';

const LeaveManagement = () => {
  const leaveRequests = [
    { name: 'Sarah Johnson', type: 'Annual', dates: 'Jun 05 - Jun 12', days: 7, status: 'Pending', balance: 14 },
    { name: 'Robert Wilson', type: 'Sick', dates: 'May 30', days: 1, status: 'Approved', balance: 8 },
    { name: 'Elena Martinez', type: 'Emergency', dates: 'May 31 - Jun 02', days: 3, status: 'Review', balance: 4 },
    { name: 'James Chen', type: 'Paternity', dates: 'Jul 10 - Jul 24', days: 14, status: 'Pending', balance: 21 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active on Leave', value: '12', sub: 'Today', icon: UserCheck, color: 'text-indigo-500' },
          { label: 'Pending Apps', value: '06', sub: 'Needs Review', icon: Clock, color: 'text-amber-500' },
          { label: 'Sick Leaves', value: '03', sub: 'Last 24h', icon: Calendar, color: 'text-rose-500' },
          { label: 'Leave Utilization', value: '42%', sub: 'Avg per Dept', icon: Target, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={18} />
            <p className="text-xs font-medium text-slate-500 leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</h3>
            <p className="text-xs font-medium text-slate-400 mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         {/* Active Requests */}
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personnel Leave Registry</h3>
               <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white"><Filter size={18} /></button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Leave Period</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Days</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {leaveRequests.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-medium">{r.name.split(' ').map(n => n[0]).join('')}</div>
                          <div>
                             <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-none mb-1">{r.name}</span>
                             <span className="text-xs font-medium text-slate-500">{r.type}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-600">{r.dates}</td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex flex-col items-center">
                          <span className="text-sm font-medium text-slate-900 dark:text-white">{r.days}</span>
                          <span className="text-xs font-medium text-slate-400">Bal: {r.balance}d</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                             r.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                             r.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            {r.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center gap-2">
                          <button className="p-1.5 bg-emerald-500 text-white rounded-lg hover:shadow-md transition"><CheckCircle2 size={14} /></button>
                          <button className="p-1.5 bg-rose-500 text-white rounded-lg hover:shadow-md transition"><XCircle size={14} /></button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         {/* Leave Calendar Mini */}
         <div className="lg:col-span-4 space-y-6">
            <div className="bg-indigo-600 p-8 rounded-xl text-white">
               <h4 className="text-sm font-medium mb-4 opacity-80">Quick Accrual Check</h4>
               <div className="space-y-4">
                  {[
                    { dept: 'Housekeeping', max: 68, current: 4 },
                    { dept: 'Front Office', max: 45, current: 2 },
                  ].map((d, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between text-sm font-medium uppercase">
                          <span>{d.dept}</span>
                          <span className="opacity-80">{d.current} / {d.max}</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white" style={{ width: `${(d.current/d.max)*100}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-xl shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-8">Leave History Audit</h3>
               <div className="space-y-5">
                  {[
                    { event: 'Sarah Johnson', date: '3h ago', type: 'Approved' },
                    { event: 'Elena Martinez', date: '6h ago', type: 'Rejected' },
                    { event: 'General Ledger', date: 'Yesterday', type: 'Synced' },
                  ].map((audit, i) => (
                    <div key={i} className="flex justify-between items-center group">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400">
                             <History size={14} />
                          </div>
                          <div>
                             <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-none mb-1">{audit.event}</span>
                             <span className="text-xs font-medium text-slate-400">{audit.date}</span>
                          </div>
                       </div>
                       <span className={`text-xs font-medium uppercase ${audit.type === 'Approved' ? 'text-emerald-500' : audit.type === 'Rejected' ? 'text-rose-500' : 'text-indigo-500'}`}>
                          {audit.type}
                       </span>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-8 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-900 hover:text-white transition">
                  Full Archive
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
