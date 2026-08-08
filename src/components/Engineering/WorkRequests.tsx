import React, { useState } from 'react';
import {
  Search, Filter, Plus, MapPin, Clock, User, AlertTriangle,
  CheckCircle2, MoreVertical, ChevronRight, Building2, Utensils,
  Shield, Sparkles, Coffee, Car, Smartphone, Calendar,
  Wrench, Zap, Droplets, Hammer, Paintbrush, Armchair, Lock,
  Laptop, ChefHat, ArrowUpDown, Flame
} from 'lucide-react';

interface WorkRequest {
  id: string;
  number: string;
  requestDate: string;
  source: string;
  sourceType: string;
  location: string;
  roomNumber?: string;
  priority: 'Emergency' | 'High' | 'Normal' | 'Low';
  type: string;
  description: string;
  status: 'Pending' | 'Reviewed' | 'Approved' | 'Rejected' | 'Converted to WO';
  requestedBy: string;
  attachments?: number;
}

const WorkRequests: React.FC = () => {
  const [requests, setRequests] = useState<WorkRequest[]>([
    {
      id: 'WR-1001',
      number: 'WR-2026-001',
      requestDate: '2026-07-29 10:30',
      source: 'Front Office',
      sourceType: 'Front Office',
      location: 'Room 205',
      roomNumber: '205',
      priority: 'Emergency',
      type: 'Electrical',
      description: 'Power outage in guest room. Guest unable to use lights or AC.',
      status: 'Pending',
      requestedBy: 'Sarah Front Desk',
      attachments: 0,
    },
    {
      id: 'WR-1002',
      number: 'WR-2026-002',
      requestDate: '2026-07-29 09:15',
      source: 'Housekeeping',
      sourceType: 'Housekeeping',
      location: 'Room 112',
      roomNumber: '112',
      priority: 'High',
      type: 'Plumbing',
      description: 'Bathroom sink drain clogged. Water not draining properly.',
      status: 'Reviewed',
      requestedBy: 'Maria Housekeeping',
      attachments: 1,
    },
    {
      id: 'WR-1003',
      number: 'WR-2026-003',
      requestDate: '2026-07-29 08:45',
      source: 'Food & Beverage',
      sourceType: 'Food & Beverage',
      location: 'Main Kitchen',
      priority: 'High',
      type: 'Kitchen Equipment',
      description: 'Commercial refrigerator not cooling. Temperature rising above safe levels.',
      status: 'Approved',
      requestedBy: 'Chef Michael',
      attachments: 2,
    },
    {
      id: 'WR-1004',
      number: 'WR-2026-004',
      requestDate: '2026-07-29 07:30',
      source: 'IoT Sensors',
      sourceType: 'IoT Sensors',
      location: 'Boiler Room',
      priority: 'Normal',
      type: 'HVAC',
      description: 'Temperature sensor alert - Boiler operating outside normal parameters.',
      status: 'Pending',
      requestedBy: 'System Automated',
      attachments: 0,
    },
    {
      id: 'WR-1005',
      number: 'WR-2026-005',
      requestDate: '2026-07-28 16:20',
      source: 'Security',
      sourceType: 'Security',
      location: 'Lobby',
      priority: 'Normal',
      type: 'Lock & Door',
      description: 'Main entrance door lock mechanism sticking. Difficult to open/close.',
      status: 'Converted to WO',
      requestedBy: 'James Security',
      attachments: 0,
    },
    {
      id: 'WR-1006',
      number: 'WR-2026-006',
      requestDate: '2026-07-28 14:10',
      source: 'Spa',
      sourceType: 'Spa',
      location: 'Spa Pool Area',
      priority: 'Normal',
      type: 'Plumbing',
      description: 'Pool filter showing reduced flow rate. Backwash may be required.',
      status: 'Reviewed',
      requestedBy: 'Lisa Spa Manager',
      attachments: 1,
    },
    {
      id: 'WR-1007',
      number: 'WR-2026-007',
      requestDate: '2026-07-28 11:00',
      source: 'Scheduled Inspections',
      sourceType: 'Scheduled Inspections',
      location: 'All Guest Rooms',
      priority: 'Low',
      type: 'Fire & Life Safety',
      description: 'Monthly fire alarm system inspection - Room smoke detectors.',
      status: 'Approved',
      requestedBy: 'System Scheduled',
      attachments: 0,
    },
  ]);

  const [activeStatus, setActiveStatus] = useState<string>('All');
  const [activeSource, setActiveSource] = useState<string>('All');

  const requestSources = [
    'All', 'Front Office', 'Housekeeping', 'Food & Beverage', 'Security',
    'Spa', 'Laundry', 'Administration', 'IoT Sensors', 'Scheduled Inspections'
  ];

  const requestTypes = [
    'Electrical', 'Plumbing', 'HVAC', 'Carpentry', 'Painting',
    'Furniture', 'Lock & Door', 'IT Infrastructure', 'Kitchen Equipment',
    'Elevators', 'Fire & Life Safety'
  ];

  const statuses = ['All', 'Pending', 'Reviewed', 'Approved', 'Rejected', 'Converted to WO'];

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'Front Office': return Building2;
      case 'Housekeeping': return Sparkles;
      case 'Food & Beverage': return Utensils;
      case 'Security': return Shield;
      case 'Spa': return Coffee;
      case 'Laundry': return Car;
      case 'Administration': return User;
      case 'IoT Sensors': return Smartphone;
      case 'Scheduled Inspections': return Calendar;
      default: return Building2;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Electrical': return Zap;
      case 'Plumbing': return Droplets;
      case 'HVAC': return Thermometer;
      case 'Carpentry': return Hammer;
      case 'Painting': return Paintbrush;
      case 'Furniture': return Armchair;
      case 'Lock & Door': return Lock;
      case 'IT Infrastructure': return Laptop;
      case 'Kitchen Equipment': return ChefHat;
      case 'Elevators': return ArrowUpDown;
      case 'Fire & Life Safety': return Flame;
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
      case 'Pending': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'Reviewed': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'Converted to WO': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const filteredRequests = requests.filter(req => {
    if (activeStatus !== 'All' && req.status !== activeStatus) return false;
    if (activeSource !== 'All' && req.source !== activeSource) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Work Requests Management</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Incoming maintenance requests from all departments</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Filter size={16} />
            Filter
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            New Request
          </button>
        </div>
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

      {/* Source Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {requestSources.map((source) => {
          const Icon = getSourceIcon(source);
          return (
            <button
              key={source}
              onClick={() => setActiveSource(source)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter flex items-center gap-1.5 ${
                activeSource === source
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={12} />
              {source}
            </button>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400">
              <Clock size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{requests.filter(r => r.status === 'Pending').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pending Review</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{requests.filter(r => r.status === 'Approved').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Approved</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{requests.filter(r => r.priority === 'Emergency').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Emergency</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <Wrench size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{requests.filter(r => r.status === 'Converted to WO').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Converted to WO</span>
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-4">
          {filteredRequests.map((req) => {
            const SourceIcon = getSourceIcon(req.source);
            const TypeIcon = getTypeIcon(req.type);
            return (
              <div
                key={req.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer relative overflow-hidden"
              >
                {/* Priority Indicator Line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${getPriorityColor(req.priority).split(' ')[0]}`} />

                <div className="flex flex-col md:flex-row justify-between gap-4 ml-2">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{req.number}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getPriorityColor(req.priority)}`}>
                        {req.priority}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{req.description}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <MapPin size={10} className="text-indigo-500" />
                          {req.location}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <TypeIcon size={10} className="text-amber-500" />
                          {req.type}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <SourceIcon size={12} className="text-slate-400" />
                        <span className="text-[9px] font-black text-slate-500 uppercase">{req.source}</span>
                      </div>
                      {req.attachments && req.attachments > 0 && (
                        <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400">
                          <span>📎</span>
                          <span>{req.attachments} attachment{req.attachments > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Requested</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block font-mono">{req.requestDate.split(' ')[1]}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <User size={14} />
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
              <h3 className="text-sm font-sans font-extrabold leading-tight">Request Sources</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Department breakdown</p>
            </div>

            <div className="space-y-4">
              {requestSources.slice(1).map((source, i) => {
                const count = requests.filter(r => r.source === source).length;
                const Icon = getSourceIcon(source);
                return (
                  <div key={i} className="flex justify-between items-center border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Icon size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold">{source}</span>
                    </div>
                    <span className="text-[10px] font-black">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Request Types</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Category distribution</p>
            </div>

            <div className="space-y-3">
              {requestTypes.map((type, i) => {
                const count = requests.filter(r => r.type === type).length;
                const TypeIcon = getTypeIcon(type);
                return (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TypeIcon size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{type}</span>
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

export default WorkRequests;
