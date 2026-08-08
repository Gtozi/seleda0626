import React, { useState } from 'react';
import {
  ShieldCheck, Search, Filter, Plus, Calendar, Clock, CheckCircle2,
  AlertTriangle, FileText, MapPin, User, ChevronRight, Flame,
  Droplets, Zap, Thermometer, Building2, Factory
} from 'lucide-react';

interface Inspection {
  id: string;
  number: string;
  type: 'Fire Safety' | 'Elevator' | 'Boiler' | 'Electrical' | 'Water System' | 'HVAC' | 'Structural' | 'Environmental';
  category: 'Compliance' | 'Safety' | 'Preventive' | 'Regulatory' | 'Insurance';
  location: string;
  description: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Failed' | 'Overdue';
  scheduledDate: string;
  completedDate?: string;
  inspector?: string;
  findings?: string;
  nextDueDate?: string;
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
}

const Inspections: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([
    {
      id: 'INS-001',
      number: 'INS-2026-001',
      type: 'Fire Safety',
      category: 'Compliance',
      location: 'All Floors',
      description: 'Annual fire alarm system inspection and testing',
      status: 'Completed',
      scheduledDate: '2026-07-15',
      completedDate: '2026-07-15',
      inspector: 'Fire Safety Inspector',
      findings: 'All systems operational. Minor repairs required on 2 smoke detectors.',
      nextDueDate: '2027-07-15',
      priority: 'Critical',
    },
    {
      id: 'INS-002',
      number: 'INS-2026-002',
      type: 'Elevator',
      category: 'Safety',
      location: 'Service Elevator Alpha',
      description: 'Quarterly elevator safety inspection and load testing',
      status: 'In Progress',
      scheduledDate: '2026-07-29',
      inspector: 'Elevator Inspector',
      priority: 'Critical',
    },
    {
      id: 'INS-003',
      number: 'INS-2026-003',
      type: 'Boiler',
      category: 'Regulatory',
      location: 'Boiler Room',
      description: 'Annual boiler pressure vessel inspection',
      status: 'Scheduled',
      scheduledDate: '2026-08-10',
      priority: 'Critical',
    },
    {
      id: 'INS-004',
      number: 'INS-2026-004',
      type: 'Electrical',
      category: 'Preventive',
      location: 'Main Distribution Panels',
      description: 'Thermal imaging of electrical panels',
      status: 'Scheduled',
      scheduledDate: '2026-08-15',
      priority: 'High',
    },
    {
      id: 'INS-005',
      number: 'INS-2026-005',
      type: 'Water System',
      category: 'Compliance',
      location: 'Water Tank Room',
      description: 'Water quality testing and tank inspection',
      status: 'Overdue',
      scheduledDate: '2026-07-20',
      inspector: 'Health Inspector',
      priority: 'High',
    },
    {
      id: 'INS-006',
      number: 'INS-2026-006',
      type: 'HVAC',
      category: 'Preventive',
      location: 'Rooftop Units',
      description: 'HVAC system performance inspection',
      status: 'Completed',
      scheduledDate: '2026-07-10',
      completedDate: '2026-07-10',
      inspector: 'HVAC Technician',
      findings: 'All units operating within normal parameters. Filter replacement recommended.',
      nextDueDate: '2026-10-10',
      priority: 'Normal',
    },
  ]);

  const [activeType, setActiveType] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const types = ['All', 'Fire Safety', 'Elevator', 'Boiler', 'Electrical', 'Water System', 'HVAC', 'Structural', 'Environmental'];
  const statuses = ['All', 'Scheduled', 'In Progress', 'Completed', 'Failed', 'Overdue'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Fire Safety': return Flame;
      case 'Elevator': return Building2;
      case 'Boiler': return Thermometer;
      case 'Electrical': return Zap;
      case 'Water System': return Droplets;
      case 'HVAC': return Thermometer;
      case 'Structural': return Building2;
      case 'Environmental': return Factory;
      default: return ShieldCheck;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'In Progress': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Failed': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Overdue': return 'bg-rose-100 text-rose-600 border-rose-200';
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

  const filteredInspections = inspections.filter(inspection => {
    if (activeType !== 'All' && inspection.type !== activeType) return false;
    if (activeStatus !== 'All' && inspection.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Inspections</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Compliance, safety, regulatory, and preventive inspections</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Search size={16} />
            Search
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            Schedule Inspection
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
              <Calendar size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{inspections.filter(i => i.status === 'Scheduled').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-500">
              <Clock size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{inspections.filter(i => i.status === 'In Progress').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">In Progress</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{inspections.filter(i => i.status === 'Overdue').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Overdue</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{inspections.filter(i => i.status === 'Completed').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
        </div>
      </div>

      {/* Inspections List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filteredInspections.map((inspection) => {
            const TypeIcon = getTypeIcon(inspection.type);
            return (
              <div
                key={inspection.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Priority Indicator Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${getPriorityColor(inspection.priority).split(' ')[0]}`} />

                <div className="flex flex-col md:flex-row justify-between gap-4 ml-2">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{inspection.number}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getStatusBadge(inspection.status)}`}>
                        {inspection.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getPriorityColor(inspection.priority)}`}>
                        {inspection.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                        {inspection.category}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{inspection.description}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <TypeIcon size={10} className="text-indigo-500" />
                          {inspection.type}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <MapPin size={10} className="text-indigo-500" />
                          {inspection.location}
                        </div>
                      </div>
                    </div>

                    {inspection.findings && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-1">
                          <FileText size={12} className="text-emerald-500" />
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Findings</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{inspection.findings}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                    <div className="space-y-2">
                      {inspection.inspector && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                            <User size={12} />
                          </div>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{inspection.inspector}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Scheduled</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">{inspection.scheduledDate}</span>
                      </div>
                      {inspection.nextDueDate && (
                        <div>
                          <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Next Due</span>
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">{inspection.nextDueDate}</span>
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
              <h3 className="text-sm font-sans font-extrabold leading-tight">Compliance Status</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Regulatory overview</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Fire Safety</span>
                  <span className="block text-xl font-black text-emerald-400">Compliant</span>
                </div>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Elevator</span>
                  <span className="block text-xl font-black text-amber-400">In Progress</span>
                </div>
                <Clock size={16} className="text-amber-400" />
              </div>
              <div className="flex justify-between items-end border-b border-white/5 pb-2">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Boiler</span>
                  <span className="block text-xl font-black text-blue-400">Scheduled</span>
                </div>
                <Calendar size={16} className="text-blue-400" />
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Water Quality</span>
                  <span className="block text-xl font-black text-rose-400">Overdue</span>
                </div>
                <AlertTriangle size={16} className="text-rose-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Upcoming Inspections</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Next 30 days</p>
            </div>

            <div className="space-y-3">
              {inspections
                .filter(i => i.status === 'Scheduled')
                .slice(0, 4)
                .map((inspection, i) => {
                  const TypeIcon = getTypeIcon(inspection.type);
                  return (
                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <TypeIcon size={12} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{inspection.type}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[8px] font-bold text-slate-500">{inspection.location}</span>
                        <span className="text-[9px] font-black text-slate-900 dark:text-white">{inspection.scheduledDate}</span>
                      </div>
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

export default Inspections;
