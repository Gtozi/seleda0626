import React, { useState } from 'react';
import {
  Building2, Home, Car, Trees, Droplets, Zap, Wrench,
  Search, Filter, Plus, MapPin, Calendar, AlertTriangle,
  CheckCircle2, Clock, User, ChevronRight, FileText
} from 'lucide-react';

interface BuildingTask {
  id: string;
  number: string;
  area: 'Guest Rooms' | 'Public Areas' | 'Roof' | 'Exterior' | 'Parking' | 'Landscaping' | 'Water Systems' | 'Electrical Systems' | 'Mechanical Systems';
  location: string;
  taskType: string;
  description: string;
  priority: 'Emergency' | 'High' | 'Normal' | 'Low';
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  assignedTo?: string;
  scheduledDate: string;
  estimatedCost?: number;
  actualCost?: number;
  completionDate?: string;
  notes?: string;
}

const BuildingMaintenance: React.FC = () => {
  const [tasks, setTasks] = useState<BuildingTask[]>([
    {
      id: 'BM-1001',
      number: 'BM-2026-001',
      area: 'Guest Rooms',
      location: 'Room 205-210',
      taskType: 'Painting',
      description: 'Repaint guest rooms 205-210 as part of quarterly refresh cycle.',
      priority: 'Normal',
      status: 'In Progress',
      assignedTo: 'Painting Team A',
      scheduledDate: '2026-07-25',
      estimatedCost: 2500,
    },
    {
      id: 'BM-1002',
      number: 'BM-2026-002',
      area: 'Public Areas',
      location: 'Lobby Floor',
      taskType: 'Flooring',
      description: 'Replace damaged marble tiles in main lobby entrance area.',
      priority: 'High',
      status: 'Scheduled',
      assignedTo: 'Flooring Specialist',
      scheduledDate: '2026-08-01',
      estimatedCost: 1800,
    },
    {
      id: 'BM-1003',
      number: 'BM-2026-003',
      area: 'Roof',
      location: 'Rooftop Main',
      taskType: 'Waterproofing',
      description: 'Apply waterproof coating to roof membrane. Annual maintenance.',
      priority: 'Normal',
      status: 'Scheduled',
      assignedTo: 'External Contractor',
      scheduledDate: '2026-08-15',
      estimatedCost: 3500,
    },
    {
      id: 'BM-1004',
      number: 'BM-2026-004',
      area: 'Exterior',
      location: 'Building Facade',
      taskType: 'Cleaning',
      description: 'Pressure wash and clean building exterior facade.',
      priority: 'Low',
      status: 'Completed',
      assignedTo: 'Cleaning Services',
      scheduledDate: '2026-07-20',
      estimatedCost: 800,
      actualCost: 750,
      completionDate: '2026-07-22',
      notes: 'Completed successfully. No issues found.',
    },
    {
      id: 'BM-1005',
      number: 'BM-2026-005',
      area: 'Parking',
      location: 'Main Parking Lot',
      taskType: 'Lighting',
      description: 'Replace damaged LED light poles in parking lot sections B and C.',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Electrical Team',
      scheduledDate: '2026-07-28',
      estimatedCost: 1200,
    },
    {
      id: 'BM-1006',
      number: 'BM-2026-006',
      area: 'Landscaping',
      location: 'Garden Areas',
      taskType: 'Irrigation',
      description: 'Repair broken sprinkler heads in main garden area.',
      priority: 'Normal',
      status: 'Completed',
      assignedTo: 'Landscaping Team',
      scheduledDate: '2026-07-18',
      estimatedCost: 400,
      actualCost: 380,
      completionDate: '2026-07-19',
    },
    {
      id: 'BM-1007',
      number: 'BM-2026-007',
      area: 'Water Systems',
      location: 'Main Water Tank',
      taskType: 'Inspection',
      description: 'Annual water tank inspection and cleaning.',
      priority: 'High',
      status: 'Scheduled',
      assignedTo: 'Plumbing Team',
      scheduledDate: '2026-08-05',
      estimatedCost: 600,
    },
    {
      id: 'BM-1008',
      number: 'BM-2026-008',
      area: 'Electrical Systems',
      location: 'Distribution Panels',
      taskType: 'Maintenance',
      description: 'Quarterly electrical panel inspection and thermal imaging.',
      priority: 'Normal',
      status: 'Scheduled',
      assignedTo: 'Electrical Team',
      scheduledDate: '2026-08-10',
      estimatedCost: 500,
    },
  ]);

  const [activeArea, setActiveArea] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const areas = ['All', 'Guest Rooms', 'Public Areas', 'Roof', 'Exterior', 'Parking', 'Landscaping', 'Water Systems', 'Electrical Systems', 'Mechanical Systems'];
  const statuses = ['All', 'Scheduled', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

  const getAreaIcon = (area: string) => {
    switch (area) {
      case 'Guest Rooms': return Home;
      case 'Public Areas': return Building2;
      case 'Roof': return Building2;
      case 'Exterior': return Building2;
      case 'Parking': return Car;
      case 'Landscaping': return Trees;
      case 'Water Systems': return Droplets;
      case 'Electrical Systems': return Zap;
      case 'Mechanical Systems': return Wrench;
      default: return Building2;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Emergency': return 'bg-rose-500 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'On Hold': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeArea !== 'All' && task.area !== activeArea) return false;
    if (activeStatus !== 'All' && task.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Building Maintenance</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Guest rooms, public areas, exterior, and infrastructure maintenance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Filter size={16} />
            Filter
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            New Maintenance Task
          </button>
        </div>
      </div>

      {/* Area Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {areas.map((area) => {
          const Icon = getAreaIcon(area);
          return (
            <button
              key={area}
              onClick={() => setActiveArea(area)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter flex items-center gap-1.5 ${
                activeArea === area
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={12} />
              {area}
            </button>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeStatus === status
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
              <Calendar size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'Scheduled').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <Wrench size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'In Progress').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Progress</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'Completed').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{tasks.filter(t => t.priority === 'High' || t.priority === 'Emergency').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">High Priority</span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filteredTasks.map((task) => {
            const AreaIcon = getAreaIcon(task.area);
            return (
              <div
                key={task.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Priority Indicator Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${getPriorityColor(task.priority).split(' ')[0]}`} />

                <div className="flex flex-col md:flex-row justify-between gap-4 ml-2">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{task.number}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getStatusBadge(task.status)}`}>
                        {task.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                        {task.area}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{task.description}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <MapPin size={10} className="text-indigo-500" />
                          {task.location}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <AreaIcon size={10} className="text-amber-500" />
                          {task.taskType}
                        </div>
                      </div>
                    </div>

                    {task.notes && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Notes</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{task.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                    <div className="space-y-2">
                      {task.assignedTo && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <User size={12} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{task.assignedTo}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Scheduled</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">{task.scheduledDate}</span>
                      </div>
                      {task.estimatedCost && (
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Est. Cost</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">${task.estimatedCost}</span>
                        </div>
                      )}
                    </div>

                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-sm font-sans font-extrabold leading-tight">Area Breakdown</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Maintenance by location</p>
            </div>

            <div className="space-y-4">
              {areas.slice(1).map((area, i) => {
                const count = tasks.filter(t => t.area === area).length;
                const Icon = getAreaIcon(area);
                return (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold">{area}</span>
                    </div>
                    <span className="text-[10px] font-black">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Cost Summary</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Budget tracking</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Estimated Total</span>
                <span className="text-[10px] font-black text-slate-900 dark:text-white">${tasks.reduce((acc, t) => acc + (t.estimatedCost || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Actual Spent</span>
                <span className="text-[10px] font-black text-emerald-600">${tasks.reduce((acc, t) => acc + (t.actualCost || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Remaining Budget</span>
                <span className="text-[10px] font-black text-amber-600">${(tasks.reduce((acc, t) => acc + (t.estimatedCost || 0), 0) - tasks.reduce((acc, t) => acc + (t.actualCost || 0), 0)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingMaintenance;
