
import React from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Calendar, 
  Search, 
  ArrowRight,
  ShieldAlert,
  Flame,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  ExternalLink,
  Star
} from 'lucide-react';

const ComplianceModule: React.FC = () => {
  const complianceItems = [
    { title: 'Fire Safety Audit', type: 'Certification', dueDate: '2026-07-15', status: 'Valid', dept: 'Civil Defense' },
    { title: 'Elevator Safety Check', type: 'Inspection', dueDate: '2026-05-25', status: 'Overdue', dept: 'Technical Authority' },
    { title: 'Water Potability Report', type: 'Testing', dueDate: '2026-06-05', status: 'Scheduled', dept: 'Health Dept' },
    { title: 'Electrical Load Balancing', type: 'Audit', dueDate: '2026-08-10', status: 'Valid', dept: 'Internal Ops' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Safety & Regulatory Compliance</h2>
           <p className="text-xs text-slate-400 font-medium">Tracking certifications, safety audits, and operational licenses</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
              <FileText size={16} />
              Compliance Log
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Flame size={14} className="text-rose-500" /> Fire Safety Systems
            </h3>
            <div className="space-y-3">
               {[
                 { label: 'Exits & Lights', status: 'Certified', date: 'Oct 2025' },
                 { label: 'Alarm System', status: 'Operational', date: 'Live' },
                 { label: 'Extinguishers', status: 'Checked', date: 'Jan 2026' },
               ].map((s, i) => (
                 <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{s.label}</span>
                    <div className="flex items-center gap-1.5">
                       <span className="text-emerald-500 font-black">{s.status}</span>
                       <span className="text-[8px] text-slate-400 font-bold">{s.date}</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-2 py-2 bg-slate-50 dark:bg-slate-850 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition">
               View Full Safety Matrix
            </button>
         </div>

         <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Zap size={14} className="text-amber-500" /> Electrical Compliance
            </h3>
            <div className="space-y-3">
               {[
                 { label: 'Earth Bonding', status: 'Pass', date: 'Annual' },
                 { label: 'DB Thermography', status: 'Pass', date: 'Monthly' },
                 { label: 'UPS Integrity', status: '98%', date: 'Weekly' },
               ].map((s, i) => (
                 <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{s.label}</span>
                    <div className="flex items-center gap-1.5 text-emerald-500 font-black">
                       {s.status}
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full mt-2 py-2 bg-slate-50 dark:bg-slate-850 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition">
               Relay Logs
            </button>
         </div>

         <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-3xl flex flex-col md:flex-row gap-6 relative overflow-hidden">
            <div className="absolute -top-4 -right-4 text-white/5 rotate-12">
               <ShieldCheck size={120} />
            </div>
            <div className="flex-1 space-y-4 z-10">
               <div>
                  <h3 className="text-base font-sans font-black flex items-center gap-2">
                     <ShieldAlert size={20} className="text-indigo-400" /> General Health Score
                  </h3>
                  <p className="text-xs text-white/60 font-medium">Lodge combined safety & building audit rating</p>
               </div>
               
               <div className="flex items-end gap-3">
                  <span className="text-5xl font-black tracking-tighter">9.2</span>
                  <div className="space-y-1 mb-2">
                     <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">EXCELLENT</span>
                     <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill={i < 5 ? '#fbbf24' : 'none'} className={i < 5 ? 'text-amber-400' : 'text-white/20'} />)}
                     </div>
                  </div>
               </div>
               
               <p className="text-[10px] text-white/50 leading-relaxed max-w-sm">
                  "The property maintains top-tier compliance across structural, electrical, and life-safety systems. Current primary focus is the overdue elevator calibration scheduled for next shift."
               </p>
            </div>
            <div className="w-48 bg-white/5 backdrop-blur-md rounded-2xl p-4 space-y-4 z-10 border border-white/10">
               <div className="space-y-1">
                  <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Next Major Audit</span>
                  <span className="block text-sm font-black">12 Days</span>
                  <span className="block text-[8px] text-white/50 font-bold uppercase tracking-tight">Municipal Safety</span>
               </div>
               <button className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-[9px] font-black uppercase tracking-widest transition">
                  Audit Readiness
               </button>
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs">
         <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-850/50">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Regulatory Certificate Tracker</h3>
            <div className="relative">
               <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={12} />
               <input type="text" placeholder="Search certificates..." className="pl-8 pr-3 py-1.5 bg-white dark:bg-slate-800 border-none rounded-lg text-[10px] outline-none w-48" />
            </div>
         </div>
         <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {complianceItems.map((item, i) => (
               <div key={i} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`p-2.5 rounded-xl ${
                        item.status === 'Overdue' ? 'bg-rose-50 text-rose-500' :
                        item.status === 'Valid' ? 'bg-emerald-50 text-emerald-500' :
                        'bg-slate-50 text-slate-400'
                     }`}>
                        <ShieldCheck size={18} />
                     </div>
                     <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">{item.title}</h4>
                        <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest">{item.dept}</span>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-12">
                     <div className="hidden md:block">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Type</span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{item.type}</span>
                     </div>
                     <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-1">Due Date</span>
                        <div className="flex items-center gap-1.5">
                           <Calendar size={12} className="text-slate-400" />
                           <span className={`text-[10px] font-bold ${item.status === 'Overdue' ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>
                              {item.dueDate}
                           </span>
                        </div>
                     </div>
                     <div className="w-24 text-right">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight ${
                           item.status === 'Valid' ? 'bg-emerald-100 text-emerald-700' :
                           item.status === 'Overdue' ? 'bg-rose-100 text-rose-700 font-black animate-pulse' :
                           'bg-slate-100 text-slate-600'
                        }`}>
                           {item.status}
                        </span>
                     </div>
                     <button className="p-2 text-slate-300 hover:text-indigo-500 transition">
                        <ExternalLink size={16} />
                     </button>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ComplianceModule;
