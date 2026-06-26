
import React from 'react';
import { 
  Users, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Star, 
  Calendar, 
  TrendingUp,
  Award,
  BookOpen,
  Smartphone,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { EngineeringStaff } from '../../types/engineering';

const StaffManagement: React.FC = () => {
  const staff: EngineeringStaff[] = [
    { id: 'T-01', name: 'Technician A', role: 'Plumber', status: 'On Task', jobsCompletedToday: 5, avgResponseTimeMin: 14 },
    { id: 'T-02', name: 'Technician B', role: 'Electrician', status: 'Available', jobsCompletedToday: 3, avgResponseTimeMin: 18 },
    { id: 'T-03', name: 'Technician C', role: 'HVAC Technician', status: 'On Task', jobsCompletedToday: 4, avgResponseTimeMin: 22 },
    { id: 'T-04', name: 'Technician D', role: 'General Technician', status: 'Off Duty', jobsCompletedToday: 0, avgResponseTimeMin: 16 },
    { id: 'T-05', name: 'Supervisor', role: 'Supervisor', status: 'Available', jobsCompletedToday: 2, avgResponseTimeMin: 10 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Technician & Fleet Management</h2>
           <p className="text-xs text-slate-400 font-medium">Tracking {staff.length} specialists across active repair lines</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              <Calendar size={16} />
              Shift Schedule
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
              <BookOpen size={16} />
              Skills Matrix
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {staff.map((member) => (
                  <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs flex justify-between group hover:border-indigo-300 transition-all cursor-pointer">
                     <div className="flex gap-4">
                        <div className="relative">
                           <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-lg">
                              {member.name.split(' ').map(n => n[0]).join('')}
                           </div>
                           <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900 ${
                              member.status === 'Available' ? 'bg-emerald-500' :
                              member.status === 'On Task' ? 'bg-amber-500' :
                              'bg-slate-400'
                           }`} />
                        </div>
                        <div className="space-y-1">
                           <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">{member.name}</h4>
                           <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block">{member.role}</span>
                           <div className="flex items-center gap-3 pt-1">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                 <CheckCircle2 size={10} className="text-emerald-500" />
                                 {member.jobsCompletedToday} Jobs
                              </div>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                                 <Clock size={10} className="text-amber-500" />
                                 {member.avgResponseTimeMin}m Resp.
                              </div>
                           </div>
                        </div>
                     </div>
                     <div className="flex flex-col justify-between items-end">
                        <button className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-lg text-slate-300 group-hover:text-slate-600 transition">
                           <Smartphone size={16} />
                        </button>
                        <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition" size={16} />
                     </div>
                  </div>
               ))}
            </div>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
               <h3 className="text-sm font-sans font-extrabold flex items-center gap-2 underline decoration-amber-400 decoration-2 underline-offset-4 mb-4">
                  <Award size={16} className="text-amber-400" /> Performance KPIs
               </h3>
               
               <div className="space-y-6">
                  {[
                    { label: 'Fleet Productivity', val: 92, trend: '+4%' },
                    { label: 'PM Compliance (Team)', val: 88, trend: '+2%' },
                    { label: 'Guest Feedback', val: 4.8, max: 5, trend: '+0.1' },
                  ].map((k, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                          <span className="text-xs font-black text-emerald-400">{k.trend}</span>
                       </div>
                       <div className="flex items-end gap-2">
                          <span className="text-2xl font-black">{k.val}{k.max ? '' : '%'}</span>
                          {k.max && <span className="text-[10px] text-slate-500 font-bold mb-1.5">/ {k.max} Stars</span>}
                       </div>
                       {!k.max && (
                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-400 rounded-full" style={{ width: `${k.val}%` }} />
                        </div>
                       )}
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
               <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Live Dispatches</h3>
               <div className="space-y-3">
                  {[
                    { tech: 'Technician A', task: 'Fix Sink leak (Rm 101)', status: 'On Site' },
                    { tech: 'Technician C', task: 'AC Service (Rooftop)', status: 'Traversing' },
                  ].map((d, i) => (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl flex justify-between items-center group cursor-pointer border border-transparent hover:border-indigo-100 transition">
                       <div className="flex gap-3 items-center">
                          <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center font-black text-xs text-indigo-500 shadow-3xs">
                             {d.tech.split(' ')[0][0]}
                          </div>
                          <div>
                             <span className="block text-[10px] font-bold text-slate-900 dark:text-white leading-tight">{d.task}</span>
                             <span className="text-[8px] text-slate-400 uppercase font-black tracking-widest">{d.tech}</span>
                          </div>
                       </div>
                       <span className={`text-[8px] font-black uppercase tracking-widest ${d.status === 'On Site' ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`}>
                          {d.status}
                       </span>
                    </div>
                  ))}
               </div>
               <button className="w-full mt-2 flex items-center justify-center gap-2 text-indigo-600 font-black uppercase text-[10px] tracking-widest hover:underline">
                  <UserCheck size={14} /> View Map Tracking
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default StaffManagement;
