
import React, { useState } from 'react';
import { 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ChevronRight, 
  User, 
  Box, 
  History,
  FileText,
  Filter,
  ArrowRight
} from 'lucide-react';
import { PMTask, PMFrequency } from '../../types/engineering';

const MaintenanceManagement: React.FC = () => {
  const [pmTasks, setPmTasks] = useState<PMTask[]>([
    {
      id: 'PMT-001',
      assetId: 'A-001',
      assetName: 'Backup Generator 500kVA',
      category: 'Power Systems',
      frequency: 'Monthly',
      nextDueDate: '2026-06-10',
      status: 'Scheduled',
      checklist: [
        { task: 'Check fuel levels and filters', completed: false },
        { task: 'Verify battery voltage and connections', completed: false },
        { task: 'Inspect for coolant leaks', completed: false },
        { task: 'Test automatic transfer switch (ATS)', completed: false }
      ]
    },
    {
      id: 'PMT-002',
      assetId: 'A-002',
      assetName: 'Central Chiller Unit',
      category: 'HVAC',
      frequency: 'Quarterly',
      nextDueDate: '2026-05-30',
      status: 'In Progress',
      assignedTechnicianId: 'T-03',
      checklist: [
        { task: 'Clean condenser coils', completed: true },
        { task: 'Check refrigerant charge levels', completed: true },
        { task: 'Lubricate fan motor bearings', completed: false },
        { task: 'Inspect control panel wiring', completed: false }
      ]
    },
    {
      id: 'PMT-003',
      assetId: 'A-004',
      assetName: 'Service Elevator Alpha',
      category: 'Vertical Transport',
      frequency: 'Monthly',
      nextDueDate: '2026-05-25',
      status: 'Overdue',
      checklist: [
        { task: 'Verify emergency brake operation', completed: false },
        { task: 'Check cable tension and wear', completed: false },
        { task: 'Inspect floor leveling accuracy', completed: false }
      ]
    }
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
           <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Preventive Maintenance (PM)</h2>
           <p className="text-xs text-slate-400 font-medium">Auto-generated maintenance cycles for core infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <Calendar size={16} />
              PM Calendar
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
              <Wrench size={16} />
              Generate PM Tasks
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {[
           { label: 'Upcoming PM', value: 12, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
           { label: 'In Progress', value: 4, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
           { label: 'Overdue PM', value: 1, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-950/20' },
         ].map((s, i) => (
           <div key={i} className={`p-4 rounded-3xl ${s.bg} border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors`}>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{s.label}</span>
              <span className={`text-2xl font-black ${s.color}`}>{s.value}</span>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         <div className="lg:col-span-8 space-y-4">
            <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white px-2">Active Task Queue</h3>
            {pmTasks.map((task) => (
              <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs hover:border-indigo-300 transition-all cursor-pointer">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                   <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                         <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{task.id}</span>
                         <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-[8px] font-black uppercase text-slate-500 tracking-tight">{task.frequency}</span>
                         <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${
                            task.status === 'Overdue' ? 'bg-rose-500 text-white' :
                            task.status === 'In Progress' ? 'bg-indigo-500 text-white' :
                            'bg-slate-100 text-slate-500'
                         }`}>
                            {task.status}
                         </span>
                      </div>
                      
                      <div>
                         <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{task.assetName}</h4>
                         <span className="text-[10px] font-bold text-slate-400 block mt-0.5 uppercase tracking-tighter">{task.category}</span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                         <div className="flex items-center gap-2">
                            <Calendar size={12} className="text-indigo-500" />
                            <div className="text-[10px] leading-tight">
                               <span className="block text-slate-400 font-bold uppercase tracking-tighter text-[8px]">Due Date</span>
                               <span className="block font-bold text-slate-700 dark:text-slate-300">{task.nextDueDate}</span>
                            </div>
                         </div>
                         {task.assignedTechnicianId && (
                           <div className="flex items-center gap-2">
                              <User size={12} className="text-amber-500" />
                              <div className="text-[10px] leading-tight">
                                 <span className="block text-slate-400 font-bold uppercase tracking-tighter text-[8px]">Technician</span>
                                 <span className="block font-bold text-slate-700 dark:text-slate-300">{task.assignedTechnicianId}</span>
                              </div>
                           </div>
                         )}
                      </div>
                   </div>

                   <div className="md:w-64 space-y-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                      <div className="flex justify-between items-center mb-1">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Digital Checklist</span>
                         <span className="text-[10px] font-bold text-indigo-500">
                            {task.checklist.filter(c => c.completed).length}/{task.checklist.length}
                         </span>
                      </div>
                      <div className="space-y-1">
                         {task.checklist.map((item, id) => (
                           <div key={id} className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded border flex items-center justify-center ${item.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-200 dark:border-slate-700'}`}>
                                 {item.completed && <CheckCircle2 size={10} className="text-white" />}
                              </div>
                              <span className={`text-[10px] font-medium leading-tight ${item.completed ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                                 {item.task}
                              </span>
                           </div>
                         ))}
                      </div>
                      <button className="w-full mt-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 hover:bg-indigo-100 transition">
                         Complete Maintenance <ArrowRight size={12} />
                      </button>
                   </div>
                </div>
              </div>
            ))}
         </div>

         <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-6">
               <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">PM Compliance Monitoring</h3>
               
               <div className="space-y-6">
                  {[
                    { label: 'HVAC Units', val: 95, color: 'bg-emerald-500' },
                    { label: 'Power Systems', val: 100, color: 'bg-blue-500' },
                    { label: 'Water Systems', val: 72, color: 'bg-amber-500' },
                    { label: 'Laundry Eq.', val: 85, color: 'bg-indigo-500' },
                  ].map((c, i) => (
                    <div key={i} className="space-y-1.5">
                       <div className="flex justify-between items-end">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.label}</span>
                          <span className="text-xs font-black text-slate-900 dark:text-white">{c.val}%</span>
                       </div>
                       <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.val}%` }} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-3xl space-y-3">
               <div className="flex items-center gap-2 text-amber-600 font-black uppercase text-[10px] tracking-widest">
                  <AlertTriangle size={14} />
                  Maintenance Alerts
               </div>
               <div className="space-y-4">
                  <div className="flex gap-3">
                     <span className="text-xs">⚠️</span>
                     <p className="text-xs text-amber-800 dark:text-amber-200 font-medium leading-tight pt-0.5">
                        <strong className="block">Generator 02 Service Overdue</strong>
                        Critical power redundancy system has missed its monthly PM cycle by 4 days.
                     </p>
                  </div>
                  <div className="flex gap-3 text-rose-500">
                     <span className="text-xs">🚨</span>
                     <p className="text-xs font-medium leading-tight pt-0.5">
                        <strong className="block">Boiler A High Pressure Warning</strong>
                        Sensor drift detected during PM check. Immediate recalibration required.
                     </p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default MaintenanceManagement;
