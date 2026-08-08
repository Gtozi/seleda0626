/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Plus, 
  User, 
  Calendar,
  Filter,
  MapPin,
  XCircle
} from 'lucide-react';

interface DeepCleaningTask {
  id: string;
  roomNumber: string;
  taskType: string;
  description: string;
  schedule: 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo?: string;
  lastCompleted?: string;
  notes?: string;
}

const taskTypes = [
  'Carpet Shampoo', 'Curtain Cleaning', 'Mattress Rotation', 
  'Upholstery Cleaning', 'Wall Cleaning', 'Air Vent Cleaning'
];

const schedules = ['Weekly', 'Monthly', 'Quarterly', 'Annual'];

export default function DeepCleaningModule() {
  const [tasks, setTasks] = useState<DeepCleaningTask[]>([
    { 
      id: 'DC-101', 
      roomNumber: '101', 
      taskType: 'Carpet Shampoo', 
      description: 'Deep clean carpet using steam cleaner', 
      schedule: 'Monthly', 
      dueDate: '2026-05-30', 
      status: 'Pending', 
      assignedTo: undefined,
      lastCompleted: '2026-04-30'
    },
    { 
      id: 'DC-102', 
      roomNumber: '304', 
      taskType: 'Mattress Rotation', 
      description: 'Rotate and flip mattress for even wear', 
      schedule: 'Quarterly', 
      dueDate: '2026-05-30', 
      status: 'In Progress', 
      assignedTo: 'Staff A',
      lastCompleted: '2026-02-28'
    },
    { 
      id: 'DC-103', 
      roomNumber: '501', 
      taskType: 'Curtain Cleaning', 
      description: 'Remove and dry clean all curtains', 
      schedule: 'Annual', 
      dueDate: '2026-06-15', 
      status: 'Pending', 
      assignedTo: undefined,
      lastCompleted: '2025-06-15'
    },
    { 
      id: 'DC-104', 
      roomNumber: '202', 
      taskType: 'Air Vent Cleaning', 
      description: 'Clean and sanitize HVAC vents', 
      schedule: 'Monthly', 
      dueDate: '2026-05-28', 
      status: 'Completed', 
      assignedTo: 'Staff B',
      lastCompleted: '2026-05-28'
    },
  ]);

  const [filter, setFilter] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
  const [scheduleFilter, setScheduleFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    roomNumber: '',
    taskType: '',
    description: '',
    schedule: 'Monthly' as 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual',
    dueDate: ''
  });

  const filteredTasks = tasks.filter(task => {
    const matchesFilter = filter === 'All' || task.status === filter;
    const matchesSchedule = scheduleFilter === 'All' || task.schedule === scheduleFilter;
    const matchesSearch = task.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          task.taskType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSchedule && matchesSearch;
  });

  const getScheduleColor = (schedule: string) => {
    switch (schedule) {
      case 'Weekly': return 'bg-blue-500 text-white';
      case 'Monthly': return 'bg-indigo-500 text-white';
      case 'Quarterly': return 'bg-purple-500 text-white';
      case 'Annual': return 'bg-amber-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-500';
      case 'In Progress': return 'text-indigo-500';
      case 'Pending': return 'text-amber-500';
      default: return 'text-slate-400';
    }
  };

  const handleUpdateStatus = (taskId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { 
        ...t, 
        status: newStatus,
        lastCompleted: newStatus === 'Completed' ? new Date().toISOString().slice(0, 10) : t.lastCompleted
      } : t
    ));
  };

  const handleCreateTask = () => {
    if (!newTask.roomNumber || !newTask.taskType || !newTask.dueDate) return;

    const task: DeepCleaningTask = {
      id: `DC-${Date.now()}`,
      roomNumber: newTask.roomNumber,
      taskType: newTask.taskType,
      description: newTask.description,
      schedule: newTask.schedule,
      dueDate: newTask.dueDate,
      status: 'Pending'
    };

    setTasks(prev => [task, ...prev]);
    setNewTask({
      roomNumber: '',
      taskType: '',
      description: '',
      schedule: 'Monthly',
      dueDate: ''
    });
    setIsCreating(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Deep Cleaning</h2>
          <p className="text-xs text-slate-500 font-mono italic">Schedule and track deep cleaning tasks on weekly, monthly, quarterly, and annual cycles.</p>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
        >
          <Plus size={14} /> Schedule Task
        </button>
      </div>

      {isCreating ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Schedule Deep Cleaning</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Create new deep cleaning task</p>
            </div>
            <button 
              onClick={() => setIsCreating(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <XCircle size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Room Number</label>
                <input 
                  type="text"
                  value={newTask.roomNumber}
                  onChange={(e) => setNewTask(prev => ({ ...prev, roomNumber: e.target.value }))}
                  placeholder="Enter room number..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Due Date</label>
                <input 
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Task Type</label>
              <select 
                value={newTask.taskType}
                onChange={(e) => setNewTask(prev => ({ ...prev, taskType: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              >
                <option value="">Select task type...</option>
                {taskTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Schedule</label>
              <div className="flex gap-2">
                {schedules.map(schedule => (
                  <button
                    key={schedule}
                    onClick={() => setNewTask(prev => ({ ...prev, schedule: schedule as any }))}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
                      newTask.schedule === schedule
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {schedule}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Description</label>
              <textarea 
                value={newTask.description}
                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task details..."
                rows={3}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCreateTask}
                disabled={!newTask.roomNumber || !newTask.taskType || !newTask.dueDate}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> Schedule Task
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {(['All', 'Pending', 'In Progress', 'Completed'] as const).map(f => (
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

            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select 
                value={scheduleFilter}
                onChange={(e) => setScheduleFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-200 outline-none cursor-pointer"
              >
                <option value="All">All Schedules</option>
                {schedules.map(schedule => <option key={schedule} value={schedule}>{schedule}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search room, task type..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTasks.map(task => (
              <div key={task.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xs group hover:border-indigo-400 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getScheduleColor(task.schedule)}`}>
                    {task.schedule}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold">{task.id}</span>
                </div>

                <div className="space-y-1 mb-4">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-indigo-500" />
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase leading-tight">Room {task.roomNumber}</h3>
                  </div>
                  <div className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">{task.taskType}</div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed">{task.description}</p>
                </div>

                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className={`font-black ${getStatusColor(task.status)}`}>{task.status}</span>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Calendar size={10} />
                      <span className="font-mono">{task.dueDate}</span>
                    </div>
                  </div>

                  {task.lastCompleted && (
                    <div className="text-[9px] text-slate-400 font-mono">
                      Last completed: {task.lastCompleted}
                    </div>
                  )}

                  {task.status !== 'Completed' && (
                    <div className="flex gap-2">
                      {task.status === 'Pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                          className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight"
                        >
                          Start
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <button 
                          onClick={() => handleUpdateStatus(task.id, 'Completed')}
                          className="flex-1 py-2 bg-emerald-50 dark:bg-emerald-900 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all rounded-xl text-[9px] font-black uppercase tracking-tight flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 size={10} /> Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
