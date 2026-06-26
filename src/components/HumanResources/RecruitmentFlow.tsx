import React from 'react';
import { Calendar, UserPlus, FileCheck, Search, Filter, Briefcase, GraduationCap, ArrowUpRight, BarChart3 } from 'lucide-react';

const RecruitmentFlow = () => {
  const vacancies = [
    { title: 'Assistant F&B Manager', dept: 'F&B', applicants: 24, interviews: 5, posted: '4 days ago', priority: 'High' },
    { title: 'Front Office Supervisor', dept: 'Front Office', applicants: 18, interviews: 3, posted: '1 week ago', priority: 'Medium' },
    { title: 'Senior Sous Chef', dept: 'Kitchen', applicants: 12, interviews: 2, posted: '2 days ago', priority: 'Emergency' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Openings', value: '14', icon: Briefcase, color: 'text-indigo-500' },
          { label: 'Total Applications', value: '142', icon: UserPlus, color: 'text-emerald-500' },
          { label: 'Interviews Today', value: '08', icon: Calendar, color: 'text-amber-500' },
          { label: 'Avg. Hire Cycle', value: '18 Days', icon: BarChart3, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
            <stat.icon className={`mb-3 ${stat.color}`} size={18} />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-tight">Active Recruitment Pipeline</h3>
               <button className="text-[10px] font-black text-indigo-600 uppercase">View All Positions</button>
            </div>
            {vacancies.map((v, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[28px] flex items-center justify-between group hover:border-indigo-200 transition-all">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400">
                       <Briefcase size={20} />
                    </div>
                    <div>
                       <div className="flex items-center gap-3">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{v.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            v.priority === 'Emergency' ? 'bg-rose-500 text-white' : 
                            v.priority === 'High' ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {v.priority}
                          </span>
                       </div>
                       <div className="flex items-center gap-3 mt-1.5 text-[9px] font-bold text-slate-500 uppercase">
                          <span>{v.dept}</span>
                          <span className="text-slate-200 dark:text-slate-700">•</span>
                          <span>Posted {v.posted}</span>
                       </div>
                    </div>
                 </div>
                 
                 <div className="flex items-center gap-12 text-right">
                    <div className="hidden sm:block">
                       <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Applications</span>
                       <span className="text-xs font-black text-slate-900 dark:text-white">{v.applicants}</span>
                    </div>
                    <div className="hidden sm:block">
                       <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">Interviews</span>
                       <span className="text-xs font-black text-indigo-600">{v.interviews}</span>
                    </div>
                    <button className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                       <ArrowUpRight size={18} />
                    </button>
                 </div>
              </div>
            ))}
         </div>

         <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-[40px] shadow-3xs">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Recently Shortlisted</h3>
            <div className="space-y-6">
               {[
                 { name: 'Marcus Aurelius', pos: 'Sous Chef', score: '94/100', status: 'Hiring' },
                 { name: 'Diana Prince', pos: 'FO Supervisor', score: '88/100', status: 'Interviewing' },
                 { name: 'Clark Kent', pos: 'HR Assistant', score: '92/100', status: 'Offer Sent' },
               ].map((c, i) => (
                 <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-[10px] font-black">
                          {c.name.split(' ').map(n => n[0]).join('')}
                       </div>
                       <div>
                          <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{c.name}</h5>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{c.pos}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[9px] font-black text-indigo-600 block">{c.score}</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{c.status}</span>
                    </div>
                 </div>
               ))}
               <button className="w-full mt-6 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase text-slate-500 tracking-widest hover:bg-slate-900 hover:text-white transition">
                  Talent Database
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default RecruitmentFlow;
