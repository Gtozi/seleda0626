import React from 'react';
import { Target, TrendingUp, Award, AlertCircle, Search, Filter, ShieldCheck, ChevronRight, Star } from 'lucide-react';

const PerformanceManagement = () => {
  const reviews = [
    { name: 'Sarah Johnson', dept: 'Front Office', score: '4.8/5', status: 'Completed', kpi: '92% Satisfaction' },
    { name: 'Robert Wilson', dept: 'Engineering', score: '---', status: 'Scheduled', kpi: 'PENDING' },
    { name: 'James Chen', dept: 'Housekeeping', score: '4.2/5', status: 'Reviewing', kpi: '88% Accuracy' },
    { name: 'Elena Martinez', dept: 'Kitchen', score: '4.9/5', status: 'Completed', kpi: '96% Efficiency' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Avg Hotel KPI', value: '88.4%', sub: 'Target: 90%', icon: Target, color: 'text-indigo-500' },
          { label: 'Reviews Due', value: '14', sub: 'This Month', icon: Award, color: 'text-emerald-500' },
          { label: 'Performance Warnings', value: '03', sub: 'Action Req.', icon: AlertCircle, color: 'text-rose-500' },
          { label: 'Skill Growth', value: '+12.4%', sub: 'Last Quarter', icon: TrendingUp, color: 'text-blue-500' },
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
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workforce Appraisal Hub</h3>
               <div className="flex gap-2">
                 <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium">Batch Export</button>
               </div>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">KPI Metric</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Review Score</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Profile</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {reviews.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white block leading-none mb-1">{r.name}</span>
                          <span className="text-xs font-medium text-slate-500 uppercase">{r.dept}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-medium text-indigo-600 uppercase">{r.kpi}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-sm font-medium text-slate-900 dark:text-white">{r.score}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                             r.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                             r.status === 'Scheduled' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {r.status}
                          </span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="text-slate-300 hover:text-slate-900 dark:hover:text-white transition"><ChevronRight size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-xl shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-8">Performance Leaderboard</h3>
            <div className="space-y-6">
               {[
                 { name: 'Elena Martinez', score: 98, dept: 'Kitchen' },
                 { name: 'Sarah Johnson', score: 94, dept: 'Front Office' },
                 { name: 'James Chen', score: 86, dept: 'Housekeeping' },
               ].map((l, i) => (
                 <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm font-medium tracking-tight">
                       <span className="text-slate-900 dark:text-white uppercase">{l.name}</span>
                       <div className="flex items-center gap-1">
                          <Star size={10} className="text-amber-500 fill-amber-500" />
                          <span className="text-slate-500">{l.score}%</span>
                       </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full bg-indigo-500" style={{ width: `${l.score}%` }} />
                    </div>
                    <p className="text-xs font-medium text-slate-400 uppercase">{l.dept} Star Performance</p>
                 </div>
               ))}
               <button className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition shadow-sm">
                  Appraisal Policy
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default PerformanceManagement;
