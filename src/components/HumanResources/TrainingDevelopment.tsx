import React from 'react';
import { GraduationCap, BookOpen, Users, BarChart3, CheckCircle2, Calendar, Search, MoreVertical, Trophy } from 'lucide-react';

const TrainingDevelopment = () => {
  const sessions = [
    { title: 'Guest Service Excellence', type: 'Soft Skills', staff: 24, date: 'Jun 02', status: 'Upcoming' },
    { title: 'Food Safety Level 3', type: 'Compliance', staff: 18, date: 'Jun 04', status: 'Open' },
    { title: 'First Aid & CPR', type: 'Safety', staff: 12, date: 'Jun 08', status: 'Full' },
    { title: 'Advanced PMS Systems', type: 'Technical', staff: 8, date: 'May 28', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Courses Active', value: '08', sub: 'Last 30 Days', icon: BookOpen, color: 'text-indigo-500' },
          { label: 'Staff Certified', value: '184', sub: 'Total Growth', icon: GraduationCap, color: 'text-emerald-500' },
          { label: 'Certifications Due', value: '22', sub: 'Action Req.', icon: Calendar, color: 'text-rose-500' },
          { label: 'Skills Index', value: '4.2/5', sub: 'Benchmarked', icon: Trophy, color: 'text-amber-500' },
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
         <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm font-sans">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white">Enterprise Learning Calendar</h3>
               <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">Create Session</button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-xs font-medium text-slate-500">Training Subject</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Category</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Attendees</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Scheduled</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {sessions.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                       <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.title}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-xs font-medium text-slate-400 uppercase">{s.type}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-sm font-medium text-slate-900 dark:text-white">{s.staff} staff</span>
                    </td>
                    <td className="px-6 py-4 text-center font-mono">
                       <span className="text-xs font-bold text-slate-600">{s.date}</span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex justify-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                             s.status === 'Completed' ? 'bg-indigo-50 text-indigo-600' : 
                             s.status === 'Full' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            {s.status}
                          </span>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>

         <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-8 rounded-xl shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-8">Certification Compliance</h3>
            <div className="space-y-6">
               {[
                 { label: 'Food Handlers Permit', status: '98% COMPLIANT', color: 'text-emerald-500' },
                 { label: 'Active Fire Marshall', status: '4 PENDING', color: 'text-rose-500' },
                 { label: 'First Aid Level 2', status: '84% VALID', color: 'text-indigo-500' },
                 { label: 'Security SIA Logs', status: 'UP TO DATE', color: 'text-emerald-500' },
               ].map((c, i) => (
                 <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-2 rounded-xl transition-all">
                    <div>
                       <h5 className="text-xs font-medium text-slate-900 dark:text-white uppercase">{c.label}</h5>
                       <span className={`text-xs font-medium uppercase ${c.color}`}>{c.status}</span>
                    </div>
                    <CheckCircle2 size={16} className={c.color?.replace?.('text', 'text')?.includes('emerald') ? 'text-emerald-500' : 'text-slate-300'} />
                 </div>
               ))}
               <button className="w-full mt-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-lg text-sm font-medium hover:opacity-90 transition">
                  Learning Center Access
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TrainingDevelopment;
