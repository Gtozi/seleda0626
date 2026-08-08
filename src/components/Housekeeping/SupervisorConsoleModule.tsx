/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Monitor, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  User, 
  MapPin,
  Layers,
  TrendingUp,
  Zap,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  RotateCcw
} from 'lucide-react';

interface RoomStatus {
  number: string;
  status: string;
  floor: number;
  assignedTo?: string;
  priority?: 'High' | 'Medium' | 'Low';
  lastUpdate: string;
}

interface StaffPerformance {
  id: string;
  name: string;
  roomsCompleted: number;
  avgTime: string;
  inspectionScore: number;
  productivityScore: number;
  currentFloor: string;
  status: 'Active' | 'On Break' | 'End Shift';
}

export default function SupervisorConsoleModule() {
  const [rooms, setRooms] = useState<RoomStatus[]>([
    { number: '101', status: 'Vacant Clean', floor: 1, assignedTo: 'Staff A', priority: 'Low', lastUpdate: '09:00 AM' },
    { number: '102', status: 'Vacant Dirty', floor: 1, assignedTo: 'Staff B', priority: 'High', lastUpdate: '08:30 AM' },
    { number: '103', status: 'Occupied Clean', floor: 1, assignedTo: 'Staff A', priority: 'Low', lastUpdate: '09:15 AM' },
    { number: '201', status: 'Vacant Dirty', floor: 2, assignedTo: 'Staff C', priority: 'High', lastUpdate: '08:45 AM' },
    { number: '202', status: 'Inspected', floor: 2, assignedTo: 'Staff B', priority: 'Low', lastUpdate: '09:30 AM' },
    { number: '304', status: 'Vacant Dirty', floor: 3, assignedTo: 'Staff C', priority: 'Critical', lastUpdate: '07:00 AM' },
    { number: '401', status: 'Occupied Clean', floor: 4, assignedTo: 'Staff D', priority: 'Low', lastUpdate: '09:00 AM' },
    { number: '402', status: 'Out of Order', floor: 4, assignedTo: undefined, priority: 'Medium', lastUpdate: 'Yesterday' },
  ]);

  const [staff, setStaff] = useState<StaffPerformance[]>([
    { id: 'HK-01', name: 'Staff Member A', roomsCompleted: 8, avgTime: '22m', inspectionScore: 98, productivityScore: 95, currentFloor: 'Floor 1', status: 'Active' },
    { id: 'HK-02', name: 'Staff Member B', roomsCompleted: 6, avgTime: '28m', inspectionScore: 92, productivityScore: 88, currentFloor: 'Floor 2', status: 'Active' },
    { id: 'HK-03', name: 'Staff Member C', roomsCompleted: 5, avgTime: '25m', inspectionScore: 95, productivityScore: 90, currentFloor: 'Floor 3', status: 'On Break' },
    { id: 'HK-04', name: 'Staff Member D', roomsCompleted: 7, avgTime: '24m', inspectionScore: 94, productivityScore: 93, currentFloor: 'Floor 4', status: 'Active' },
  ]);

  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedStaff, setSelectedStaff] = useState<string | 'all'>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Vacant Clean': return 'bg-emerald-500';
      case 'Vacant Dirty': return 'bg-orange-500';
      case 'Occupied Clean': return 'bg-indigo-500';
      case 'Occupied Dirty': return 'bg-rose-500';
      case 'Inspected': return 'bg-purple-500';
      case 'Out of Order': return 'bg-slate-700';
      default: return 'bg-slate-200';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'High': return 'border-orange-500 bg-orange-50 dark:bg-orange-900/20';
      case 'Medium': return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'Low': return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20';
      default: return 'border-slate-300 bg-slate-50 dark:bg-slate-800';
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchFloor = selectedFloor === 'all' || room.floor === selectedFloor;
    const matchStaff = selectedStaff === 'all' || room.assignedTo === selectedStaff;
    return matchFloor && matchStaff;
  });

  const criticalRooms = rooms.filter(r => r.priority === 'Critical');
  const highPriorityRooms = rooms.filter(r => r.priority === 'High');
  const activeStaff = staff.filter(s => s.status === 'Active');

  const handleReassignTask = (roomNumber: string, newStaff: string) => {
    setRooms(prev => prev.map(r => 
      r.number === roomNumber ? { ...r, assignedTo: newStaff } : r
    ));
  };

  const handlePriorityOverride = (roomNumber: string, newPriority: 'High' | 'Medium' | 'Low' | 'Critical') => {
    setRooms(prev => prev.map(r => 
      r.number === roomNumber ? { ...r, priority: newPriority } : r
    ));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Supervisor Console</h2>
          <p className="text-xs text-slate-500 font-mono italic">Live room monitoring, task reassignment, and staff performance oversight.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Critical Rooms</span>
            <AlertTriangle size={14} className="text-red-500" />
          </div>
          <div className="text-2xl font-black text-red-500">{criticalRooms.length}</div>
          <div className="text-[9px] text-slate-500 mt-1">Immediate attention</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">High Priority</span>
            <Zap size={14} className="text-orange-500" />
          </div>
          <div className="text-2xl font-black text-orange-500">{highPriorityRooms.length}</div>
          <div className="text-[9px] text-slate-500 mt-1">Pending tasks</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Active Staff</span>
            <Users size={14} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-500">{activeStaff.length}</div>
          <div className="text-[9px] text-slate-500 mt-1">On duty now</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest">Avg Score</span>
            <Award size={14} className="text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-indigo-500">
            {Math.round(staff.reduce((acc, s) => acc + s.inspectionScore, 0) / staff.length)}%
          </div>
          <div className="text-[9px] text-slate-500 mt-1">Inspection quality</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center gap-4 shadow-3xs">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-slate-400" />
          <select 
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Floors</option>
            {[1, 2, 3, 4].map(f => <option key={f} value={f}>Floor {f}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <User size={14} className="text-slate-400" />
          <select 
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            className="bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-bold text-slate-600 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Staff</option>
            {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Room Monitor */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Monitor size={16} className="text-indigo-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Live Room Monitor</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredRooms.map(room => (
              <div 
                key={room.number} 
                className={`p-3 rounded-xl border-2 transition-all ${getPriorityColor(room.priority)} relative`}
              >
                <div className={`h-1 w-full ${getStatusColor(room.status)} absolute top-0 left-0 rounded-t-lg`} />
                <div className="pt-2 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black text-slate-900 dark:text-white">#{room.number}</span>
                    {room.priority === 'Critical' && <AlertTriangle size={10} className="text-red-500" />}
                  </div>
                  <div className="text-[8px] font-mono text-slate-600 dark:text-slate-400 uppercase">{room.status}</div>
                  <div className="flex items-center gap-1 text-[8px] text-slate-500">
                    <User size={8} />
                    <span className="truncate">{room.assignedTo || 'Unassigned'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] text-slate-400">
                    <Clock size={8} />
                    <span>{room.lastUpdate}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-emerald-500" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Staff Performance</h3>
          </div>

          <div className="space-y-3">
            {staff.map(member => (
              <div key={member.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-3xs">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{member.name}</h4>
                    <span className="text-[8px] font-mono text-slate-400">{member.id}</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                    member.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {member.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                    <div className="text-[8px] text-slate-400 uppercase font-mono">Completed</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white">{member.roomsCompleted}</div>
                  </div>
                  <div className="text-center p-2 bg-slate-50 dark:bg-slate-850 rounded-lg">
                    <div className="text-[8px] text-slate-400 uppercase font-mono">Avg Time</div>
                    <div className="text-sm font-black text-indigo-600">{member.avgTime}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[8px] font-mono">
                    <span className="text-slate-400">Inspection Score</span>
                    <span className="font-black text-emerald-500">{member.inspectionScore}%</span>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${member.inspectionScore}%` }} />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono">
                    <span className="text-slate-400">Productivity</span>
                    <span className="font-black text-indigo-500">{member.productivityScore}%</span>
                  </div>
                  <div className="h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${member.productivityScore}%` }} />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[8px] text-slate-500">
                    <MapPin size={10} />
                    <span>{member.currentFloor}</span>
                  </div>
                  <button className="text-[8px] font-black text-indigo-600 hover:text-indigo-800 uppercase">
                    Reassign
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escalations */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Escalations</h3>
        </div>
        <div className="space-y-3">
          {[
            { id: 'ESC-001', room: '304', issue: 'Cleaning exceeds SLA (45m elapsed)', priority: 'Critical' },
            { id: 'ESC-002', room: '102', issue: 'Guest complaint about bathroom cleanliness', priority: 'High' },
            { id: 'ESC-003', room: '402', issue: 'Maintenance blocking room release', priority: 'Medium' },
          ].map(escalation => (
            <div key={escalation.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                  escalation.priority === 'Critical' ? 'bg-red-500 text-white' : 
                  escalation.priority === 'High' ? 'bg-orange-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {escalation.priority}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 dark:text-white">Room {escalation.room}</div>
                  <div className="text-[10px] text-slate-500">{escalation.issue}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[9px] font-black uppercase text-slate-600 hover:border-indigo-500 transition">
                  View
                </button>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[9px] font-black uppercase hover:bg-indigo-700 transition">
                  Resolve
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
