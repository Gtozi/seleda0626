import React, { useState } from 'react';
import {
  AlertTriangle, Wrench, Zap, Droplets, Flame, Thermometer,
  Hammer, Paintbrush, Armchair, Lock, Laptop, ChefHat,
  ArrowUpDown, Search, Filter, Plus, MapPin, Clock, User,
  CheckCircle2, ChevronRight, Calendar, FileText
} from 'lucide-react';

interface CorrectiveTask {
  id: string;
  number: string;
  reportedDate: string;
  type: string;
  category: 'Reactive Repairs' | 'Emergency Repairs' | 'Guest Complaint Resolution' | 'Equipment Breakdown' | 'Infrastructure Repair' | 'Utility Failure Response';
  location: string;
  roomNumber?: string;
  priority: 'Emergency' | 'High' | 'Normal' | 'Low';
  description: string;
  status: 'Reported' | 'Diagnosed' | 'In Progress' | 'Parts Ordered' | 'Completed' | 'Verified';
  assignedTechnician?: string;
  estimatedCost?: number;
  actualCost?: number;
  downtime?: string;
  resolution?: string;
}

const CorrectiveMaintenance: React.FC = () => {
  const [tasks, setTasks] = useState<CorrectiveTask[]>([
    {
      id: 'CM-1001',
      number: 'CM-2026-001',
      reportedDate: '2026-07-29 10:15',
      type: 'Electrical',
      category: 'Emergency Repairs',
      location: 'Lobby',
      priority: 'Emergency',
      description: 'Main distribution panel tripped. Power outage affecting lobby and front desk.',
      status: 'In Progress',
      assignedTechnician: 'John Electrician',
      estimatedCost: 450,
      downtime: '2 hours',
    },
    {
      id: 'CM-1002',
      number: 'CM-2026-002',
      reportedDate: '2026-07-29 09:30',
      type: 'Plumbing',
      category: 'Guest Complaint Resolution',
      location: 'Room 312',
      roomNumber: '312',
      priority: 'High',
      description: 'Guest reported water leak from ceiling. Possible pipe burst in bathroom above.',
      status: 'Diagnosed',
      assignedTechnician: 'Carlos Plumber',
      estimatedCost: 280,
      downtime: '4 hours',
    },
    {
      id: 'CM-1003',
      number: 'CM-2026-003',
      reportedDate: '2026-07-29 08:00',
      type: 'HVAC',
      category: 'Equipment Breakdown',
      location: 'Kitchen',
      priority: 'High',
      description: 'Walk-in freezer compressor failure. Temperature rising above safe levels.',
      status: 'Parts Ordered',
      assignedTechnician: 'Maria HVAC',
      estimatedCost: 1200,
      actualCost: 1150,
      downtime: '24 hours',
    },
    {
      id: 'CM-1004',
      number: 'CM-2026-004',
      reportedDate: '2026-07-28 16:45',
      type: 'Fire & Life Safety',
      category: 'Infrastructure Repair',
      location: 'Fire Pump Room',
      priority: 'Emergency',
      description: 'Fire pump pressure switch malfunction. System not maintaining required pressure.',
      status: 'Completed',
      assignedTechnician: 'David Mechanic',
      estimatedCost: 350,
      actualCost: 340,
      downtime: '6 hours',
      resolution: 'Replaced pressure switch and calibrated system. Fire pump now operational.',
    },
    {
      id: 'CM-1005',
      number: 'CM-2026-005',
      reportedDate: '2026-07-28 14:20',
      type: 'Electrical',
      category: 'Utility Failure Response',
      location: 'Generator Room',
      priority: 'High',
      description: 'Backup generator fuel gauge sensor failure. Unable to monitor fuel levels.',
      status: 'Verified',
      assignedTechnician: 'John Electrician',
      estimatedCost: 180,
      actualCost: 175,
      downtime: '1 hour',
      resolution: 'Replaced fuel level sensor. System tested and verified.',
    },
    {
      id: 'CM-1006',
      number: 'CM-2026-006',
      reportedDate: '2026-07-28 11:00',
      type: 'Elevators',
      category: 'Reactive Repairs',
      location: 'Elevator B',
      priority: 'Normal',
      description: 'Elevator B door sensors not detecting obstacles. Safety concern.',
      status: 'Reported',
      assignedTechnician: undefined,
      estimatedCost: 250,
      downtime: '4 hours',
    },
  ]);

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const categories = ['All', 'Reactive Repairs', 'Emergency Repairs', 'Guest Complaint Resolution', 'Equipment Breakdown', 'Infrastructure Repair', 'Utility Failure Response'];
  const statuses = ['All', 'Reported', 'Diagnosed', 'In Progress', 'Parts Ordered', 'Completed', 'Verified'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Electrical': return Zap;
      case 'Plumbing': return Droplets;
      case 'HVAC': return Thermometer;
      case 'Fire & Life Safety': return Flame;
      case 'Carpentry': return Hammer;
      case 'Painting': return Paintbrush;
      case 'Furniture': return Armchair;
      case 'Lock & Door': return Lock;
      case 'IT Infrastructure': return Laptop;
      case 'Kitchen Equipment': return ChefHat;
      case 'Elevators': return ArrowUpDown;
      default: return Wrench;
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
      case 'Reported': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Diagnosed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Parts Ordered': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Verified': return 'bg-teal-50 text-teal-700 border-teal-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (activeCategory !== 'All' && task.category !== activeCategory) return false;
    if (activeStatus !== 'All' && task.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Corrective Maintenance</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Reactive repairs, emergency response, and equipment breakdown resolution</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Filter size={16} />
            Filter
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            New Corrective Task
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeCategory === category
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {category}
          </button>
        ))}
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
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{tasks.filter(t => t.priority === 'Emergency').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency</span>
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
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500">
              <Clock size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'Parts Ordered').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Awaiting Parts</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{tasks.filter(t => t.status === 'Completed' || t.status === 'Verified').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resolved</span>
        </div>
      </div>

      {/* Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filteredTasks.map((task) => {
            const TypeIcon = getTypeIcon(task.type);
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
                        {task.category}
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
                          <TypeIcon size={10} className="text-amber-500" />
                          {task.type}
                        </div>
                        {task.downtime && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500">
                            <Clock size={10} />
                            {task.downtime} downtime
                          </div>
                        )}
                      </div>
                    </div>

                    {task.resolution && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Resolution</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{task.resolution}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                    <div className="space-y-2">
                      {task.assignedTechnician && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <User size={12} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{task.assignedTechnician}</span>
                        </div>
                      )}
                      {task.estimatedCost && (
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Est. Cost</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">${task.estimatedCost}</span>
                        </div>
                      )}
                      {task.actualCost && (
                        <div className="text-right">
                          <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Actual Cost</span>
                          <span className="text-[10px] font-bold text-emerald-600 block">${task.actualCost}</span>
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
              <h3 className="text-sm font-sans font-extrabold leading-tight">Category Breakdown</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Corrective maintenance types</p>
            </div>

            <div className="space-y-4">
              {categories.slice(1).map((category, i) => {
                const count = tasks.filter(t => t.category === category).length;
                return (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[10px] font-bold">{category}</span>
                    <span className="text-[10px] font-black">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Common corrective tasks</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl flex items-center gap-3 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition">
                <AlertTriangle size={16} className="text-rose-500" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block">Report Emergency</span>
                  <span className="text-[8px] text-slate-500 font-medium">Critical equipment failure</span>
                </div>
              </button>
              <button className="w-full p-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-center gap-3 hover:bg-amber-100 dark:hover:bg-amber-500/20 transition">
                <Wrench size={16} className="text-amber-500" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block">Guest Complaint</span>
                  <span className="text-[8px] text-slate-500 font-medium">Room issue resolution</span>
                </div>
              </button>
              <button className="w-full p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-2xl flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition">
                <FileText size={16} className="text-blue-500" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block">Equipment Breakdown</span>
                  <span className="text-[8px] text-slate-500 font-medium">Asset failure report</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrectiveMaintenance;
