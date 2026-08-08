import React, { useState } from 'react';
import {
  Hammer, Search, Filter, Plus, Calendar, Clock, CheckCircle2,
  AlertTriangle, FileText, MapPin, User, ChevronRight, DollarSign,
  TrendingUp, Building2, Paintbrush, Wrench, Zap, Droplets
} from 'lucide-react';

interface Project {
  id: string;
  number: string;
  name: string;
  type: 'Renovation' | 'Upgrade' | 'New Construction' | 'Refurbishment' | 'Expansion';
  category: 'Guest Rooms' | 'Public Areas' | 'Kitchen' | 'Exterior' | 'Infrastructure' | 'Energy Efficiency';
  location: string;
  description: string;
  status: 'Planning' | 'Approved' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  startDate: string;
  targetCompletionDate: string;
  actualCompletionDate?: string;
  projectManager?: string;
  budget: number;
  spent: number;
  progress: number;
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  phases?: { name: string; status: string; completedDate?: string }[];
}

const ProjectsRenovations: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'PRJ-001',
      number: 'PRJ-2026-001',
      name: 'Guest Room Renovation - Floor 3',
      type: 'Renovation',
      category: 'Guest Rooms',
      location: 'Floor 3',
      description: 'Complete renovation of 20 guest rooms including flooring, furniture, and bathroom upgrades.',
      status: 'In Progress',
      startDate: '2026-06-01',
      targetCompletionDate: '2026-09-30',
      projectManager: 'John Project Manager',
      budget: 250000,
      spent: 150000,
      progress: 60,
      priority: 'High',
      phases: [
        { name: 'Demolition', status: 'Completed', completedDate: '2026-06-15' },
        { name: 'Electrical', status: 'Completed', completedDate: '2026-07-01' },
        { name: 'Plumbing', status: 'In Progress' },
        { name: 'Finishing', status: 'Pending' },
      ],
    },
    {
      id: 'PRJ-002',
      number: 'PRJ-2026-002',
      name: 'Lobby Modernization',
      type: 'Upgrade',
      category: 'Public Areas',
      location: 'Main Lobby',
      description: 'Modernize main lobby with new reception desk, lighting, and seating areas.',
      status: 'Planning',
      startDate: '2026-09-01',
      targetCompletionDate: '2026-12-15',
      projectManager: 'Sarah Project Manager',
      budget: 180000,
      spent: 0,
      progress: 0,
      priority: 'Normal',
    },
    {
      id: 'PRJ-003',
      number: 'PRJ-2026-003',
      name: 'Kitchen Equipment Upgrade',
      type: 'Upgrade',
      category: 'Kitchen',
      location: 'Main Kitchen',
      description: 'Replace aging kitchen equipment with energy-efficient models.',
      status: 'Approved',
      startDate: '2026-08-15',
      targetCompletionDate: '2026-10-30',
      projectManager: 'Michael Project Manager',
      budget: 120000,
      spent: 0,
      progress: 0,
      priority: 'High',
    },
    {
      id: 'PRJ-004',
      number: 'PRJ-2026-004',
      name: 'Solar Panel Installation',
      type: 'New Construction',
      category: 'Energy Efficiency',
      location: 'Rooftop',
      description: 'Install 100kW solar panel array for renewable energy generation.',
      status: 'In Progress',
      startDate: '2026-05-01',
      targetCompletionDate: '2026-08-30',
      projectManager: 'David Project Manager',
      budget: 350000,
      spent: 280000,
      progress: 80,
      priority: 'Critical',
      phases: [
        { name: 'Structural Assessment', status: 'Completed', completedDate: '2026-05-15' },
        { name: 'Panel Installation', status: 'Completed', completedDate: '2026-07-15' },
        { name: 'Grid Connection', status: 'In Progress' },
        { name: 'Testing', status: 'Pending' },
      ],
    },
    {
      id: 'PRJ-005',
      number: 'PRJ-2026-005',
      name: 'Parking Lot Resurfacing',
      type: 'Refurbishment',
      category: 'Exterior',
      location: 'Main Parking Lot',
      description: 'Resurface parking lot and install new LED lighting.',
      status: 'Completed',
      startDate: '2026-04-01',
      targetCompletionDate: '2026-06-30',
      actualCompletionDate: '2026-06-25',
      projectManager: 'Lisa Project Manager',
      budget: 85000,
      spent: 82000,
      progress: 100,
      priority: 'Normal',
    },
  ]);

  const [activeType, setActiveType] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const types = ['All', 'Renovation', 'Upgrade', 'New Construction', 'Refurbishment', 'Expansion'];
  const statuses = ['All', 'Planning', 'Approved', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Renovation': return Paintbrush;
      case 'Upgrade': return TrendingUp;
      case 'New Construction': return Building2;
      case 'Refurbishment': return Wrench;
      case 'Expansion': return Building2;
      default: return Hammer;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Guest Rooms': return Building2;
      case 'Public Areas': return Building2;
      case 'Kitchen': return Wrench;
      case 'Exterior': return Building2;
      case 'Infrastructure': return Zap;
      case 'Energy Efficiency': return Droplets;
      default: return Hammer;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Approved': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'On Hold': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const filteredProjects = projects.filter(project => {
    if (activeType !== 'All' && project.type !== activeType) return false;
    if (activeStatus !== 'All' && project.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Projects & Renovations</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Capital projects, renovations, and construction management</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Search size={16} />
            Search
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            New Project
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {types.map((type) => {
          const Icon = getTypeIcon(type);
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter flex items-center gap-1.5 ${
                activeType === type
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={12} />
              {type}
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
              <Hammer size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{projects.length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Projects</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <Clock size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{projects.filter(p => p.status === 'In Progress').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Progress</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{projects.filter(p => p.status === 'Completed').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-500">
              <DollarSign size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">${(projects.reduce((acc, p) => acc + p.budget, 0) / 1000).toFixed(0)}k</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Budget</span>
        </div>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filteredProjects.map((project) => {
            const TypeIcon = getTypeIcon(project.type);
            const CategoryIcon = getCategoryIcon(project.category);
            return (
              <div
                key={project.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{project.number}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getStatusBadge(project.status)}`}>
                        {project.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getPriorityColor(project.priority)}`}>
                        {project.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                        {project.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{project.name}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <CategoryIcon size={10} className="text-indigo-500" />
                          {project.category}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <MapPin size={10} className="text-indigo-500" />
                          {project.location}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tight">Progress</span>
                        <span className="text-[10px] font-black text-slate-900 dark:text-white">{project.progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            project.progress === 100 ? 'bg-emerald-500' : project.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Budget</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">${project.budget.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Spent</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">${project.spent.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-tight block">Target</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{project.targetCompletionDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                    <div className="space-y-2">
                      {project.projectManager && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <User size={12} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{project.projectManager}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Start Date</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">{project.startDate}</span>
                      </div>
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
              <h3 className="text-sm font-sans font-extrabold leading-tight">Budget Overview</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Financial summary</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Budget</span>
                  <span className="block text-xl font-black">${projects.reduce((acc, p) => acc + p.budget, 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total Spent</span>
                  <span className="block text-xl font-black text-amber-400">${projects.reduce((acc, p) => acc + p.spent, 0).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Remaining</span>
                  <span className="block text-xl font-black text-emerald-400">${(projects.reduce((acc, p) => acc + p.budget, 0) - projects.reduce((acc, p) => acc + p.spent, 0)).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Project Categories</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">By type</p>
            </div>

            <div className="space-y-3">
              {['Guest Rooms', 'Public Areas', 'Kitchen', 'Exterior', 'Infrastructure', 'Energy Efficiency'].map((category, i) => {
                const count = projects.filter(p => p.category === category).length;
                const CategoryIcon = getCategoryIcon(category);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CategoryIcon size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{category}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectsRenovations;
