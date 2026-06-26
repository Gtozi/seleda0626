/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Plus, 
  User, 
  Calendar,
  Filter,
  CheckCircle
} from 'lucide-react';
import { HKTask, TaskStatus, TaskPriority } from './HousekeepingPortal';

export default function TaskManagementModule() {
  const [tasks, setTasks] = useState<HKTask[]>([
    { 
      id: 'TSK-101', 
      type: 'Deep Cleaning', 
      location: 'Penthouse 501', 
      assignedTo: 'Staff Member A', 
priority: 'High', 
dueDate: '2026-05-30', 
status: 'In Progress', 
progress: 65 
},
{ 
id: 'TSK-102', 
type: 'Public Area Cleaning', 
location: 'Main Lobby', 
assignedTo: 'Staff Member B', 
priority: 'Medium', 
dueDate: '2026-05-30', 
status: 'Pending', 
progress: 0 
},
{ 
id: 'TSK-103', 
type: 'Garden Cleaning', 
location: 'West Terrace', 
assignedTo: 'Staff Member C', 
priority: 'Low', 
dueDate: '2026-05-30', 
status: 'Completed', 
progress: 100 
},
    { 
      id: 'TSK-104', 
      type: 'Pest Control', 
      location: 'Kitchen Storage', 
      priority: 'Critical', 
      dueDate: '2026-05-30', 
      status: 'Pending', 
      progress: 0 
    },
  ]);

  const [filter, setFilter] = useState<TaskStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.status === filter;
    const matchesSearch = task.location.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case 'Critical': return 'bg-red-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Medium': return 'bg-indigo-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'Completed': return 'text-emerald-500';
      case 'In Progress': return 'text-indigo-500';
      case 'Verified': return 'text-purple-500';
      case 'Pending': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Housekeeping Task Engine</h2>
          <p className="text-xs text-slate-500 font-mono italic">Centralized coordination for all cleaning and specialized maintenance tasks.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all">
            <Plus size={14} /> Schedule New Task
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
          {(['All', 'Pending', 'In Progress', 'Completed', 'Verified'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                filter === f 
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search tasks, locations, cleaners..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredTasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xs group hover:border-indigo-400 transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">{task.id}</span>
            </div>

            <div className="space-y-1 mb-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">{task.type}</h3>
              <p className="text-[11px] text-slate-500 font-bold">{task.location}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-400 font-bold uppercase">Progress</span>
                <span className={`font-black ${task.progress === 100 ? 'text-emerald-500' : 'text-indigo-500'}`}>{task.progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assigned To</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[8px] font-black text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {task.assignedTo ? task.assignedTo.split(' ').map(n => n[0]).join('') : '?'}
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate">{task.assignedTo || 'Unassigned'}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Due Date</span>
                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Calendar size={12} className="text-slate-400" />
                  <span className="text-[10px] font-bold">{task.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors rounded-xl text-[9px] font-black uppercase tracking-tight">
                Reassign
              </button>
              {task.status !== 'Completed' && task.status !== 'Verified' ? (
                <button className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight">
                  Update
                </button>
              ) : task.status === 'Completed' ? (
                <button className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5">
                  <CheckCircle size={10} /> Verify
                </button>
              ) : (
                <div className="flex-1 py-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5">
                   <CheckCircle2 size={10} /> Verified
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
