import React from 'react';
import { 
  Users, 
  Clock, 
  Star, 
  MapPin, 
  TrendingUp, 
  Zap, 
  Award, 
  Settings,
  MoreVertical,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { motion } from 'motion/react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'Active' | 'On Break' | 'End Shift';
  roomsCleaned: number;
  avgTime: string;
  rating: number;
  currentFloor: string;
  productivityScore: number;
  inspectionPassRate: number;
  tasksAssigned: number;
  tasksCompleted: number;
  efficiency: number;
}

const staff: StaffMember[] = [
  { id: 'HK-01', name: 'Staff Member A', role: 'Team Lead', status: 'Active', roomsCleaned: 12, avgTime: '24m', rating: 4.9, currentFloor: 'Floor 4', productivityScore: 95, inspectionPassRate: 98, tasksAssigned: 13, tasksCompleted: 12, efficiency: 92 },
  { id: 'HK-02', name: 'Staff Member B', role: 'Housekeeper', status: 'Active', roomsCleaned: 9, avgTime: '28m', rating: 4.7, currentFloor: 'Floor 2', productivityScore: 88, inspectionPassRate: 94, tasksAssigned: 10, tasksCompleted: 9, efficiency: 90 },
  { id: 'HK-03', name: 'Staff Member C', role: 'Housekeeper', status: 'On Break', roomsCleaned: 6, avgTime: '22m', rating: 4.8, currentFloor: 'Floor 3', productivityScore: 90, inspectionPassRate: 96, tasksAssigned: 7, tasksCompleted: 6, efficiency: 86 },
  { id: 'HK-04', name: 'Staff Member D', role: 'Housekeeper', status: 'Active', roomsCleaned: 10, avgTime: '30m', rating: 4.6, currentFloor: 'Floor 1', productivityScore: 85, inspectionPassRate: 92, tasksAssigned: 11, tasksCompleted: 10, efficiency: 91 },
];

export default function StaffManagementModule() {
  return (
    <div className="space-y-6 animate-fade-in" id="staff-management-suite">
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Workforce Command</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Staff Management & Smart Dispatch</h2>
        </div>
        <button className="px-4 py-2 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-black text-xs shadow-lg flex items-center gap-2 transition hover:scale-105 cursor-pointer font-sans">
          <UserPlus size={14} /> Add Staff to Shift
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff Performance Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4 hover:border-indigo-200 transition relative group">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white font-sans">{member.name}</h4>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{member.role} • {member.id}</span>
                  </div>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                  member.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {member.status}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 py-3 border-y border-slate-50 dark:border-slate-850">
                <div className="text-center">
                  <span className="text-[8px] text-slate-400 uppercase font-mono font-black block leading-none mb-1">CLEANED</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white leading-none font-sans">{member.roomsCleaned}</span>
                </div>
                <div className="text-center">
                  <span className="text-[8px] text-slate-400 uppercase font-mono font-black block leading-none mb-1">AVG TIME</span>
                  <span className="text-lg font-black text-indigo-600 leading-none font-sans">{member.avgTime}</span>
                </div>
                <div className="text-center">
                   <span className="text-[8px] text-slate-400 uppercase font-mono font-black block leading-none mb-1">SCORE</span>
                   <span className="text-lg font-black text-amber-500 leading-none flex items-center justify-center gap-0.5 font-sans">
                     {member.rating}<Star size={10} fill="currentColor" />
                   </span>
                </div>
                <div className="text-center">
                   <span className="text-[8px] text-slate-400 uppercase font-mono font-black block leading-none mb-1">PROD</span>
                   <span className="text-lg font-black text-emerald-600 leading-none font-sans">{member.productivityScore}%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2">
                <div className="text-center">
                  <span className="text-[8px] text-slate-400 uppercase font-mono font-black block leading-none mb-1">INSPECT</span>
                  <span className="text-sm font-black text-purple-600 leading-none font-sans">{member.inspectionPassRate}%</span>
                </div>
                <div className="text-center">
                  <span className="text-[8px] text-slate-400 uppercase font-mono font-black block leading-none mb-1">TASKS</span>
                  <span className="text-sm font-black text-slate-900 dark:text-white leading-none font-sans">{member.tasksCompleted}/{member.tasksAssigned}</span>
                </div>
                <div className="text-center">
                  <span className="text-[8px] text-slate-400 uppercase font-mono font-black block leading-none mb-1">EFF</span>
                  <span className="text-sm font-black text-blue-600 leading-none font-sans">{member.efficiency}%</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MapPin size={12} className="text-indigo-400 font-sans" /> {member.currentFloor}
                </div>
                <button className="flex items-center gap-1 text-slate-900 dark:text-white font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase font-sans">
                  Dispatch Task <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Command Center Stats */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-slate-950 p-6 rounded-3xl text-white space-y-6 shadow-xl relative overflow-hidden">
             <div className="absolute -right-8 -bottom-8 opacity-10">
                <Users size={160} />
             </div>
             
             <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-center">
                  <h3 className="font-black text-sm uppercase tracking-widest font-sans">Operational Load</h3>
                  <Zap size={16} className="text-amber-400 font-sans" />
                </div>
                
                <div className="space-y-3">
                   {[
                     { label: 'Active Roster', value: '12 / 15', pct: 80, color: 'bg-emerald-500' },
                     { label: 'Workforce Saturation', value: '92%', pct: 92, color: 'bg-indigo-500' },
                     { label: 'Queue Pressure', value: 'High', pct: 75, color: 'bg-amber-500' },
                   ].map((s, i) => (
                     <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold font-mono">
                          <span className="opacity-60">{s.label}</span>
                          <span>{s.value}</span>
                        </div>
                        <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                           <div className={`h-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                        </div>
                     </div>
                   ))}
                </div>
             </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-3xs">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-amber-500 font-sans" />
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest font-sans">Leaderboard (Shift A)</span>
              </div>
              <div className="space-y-4">
                 {staff.sort((a,b)=> b.roomsCleaned - a.roomsCleaned).slice(0,3).map((s, i) => (
                   <div key={i} className="flex justify-between items-center pb-2 border-b dark:border-slate-850">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-slate-400 font-mono">#0{i+1}</span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-sans">{s.name}</span>
                      </div>
                      <span className="text-xs font-black text-emerald-600 font-sans">+{s.roomsCleaned}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full py-2.5 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition font-sans">
                 Full Roster Performance
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
