/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Layers, 
  MapPin, 
  Clock, 
  Users, 
  Award,
  CheckCircle2,
  Plus,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';

interface Building {
  id: string;
  name: string;
  floors: number;
}

interface Floor {
  id: string;
  buildingId: string;
  number: number;
  name: string;
}

interface Zone {
  id: string;
  name: string;
  floors: number[];
}

interface PublicArea {
  id: string;
  name: string;
  category: string;
  cleaningFrequency: string;
}

interface RoomStatus {
  code: string;
  name: string;
  color: string;
  description: string;
}

interface TaskType {
  id: string;
  name: string;
  category: 'Automatic' | 'Manual';
  estimatedTime: number;
  priority: 'Low' | 'Medium' | 'High';
}

export default function ConfigurationModule() {
  const [activeSection, setActiveSection] = useState<'property' | 'status' | 'tasks' | 'staff'>('property');

  // Property Setup
  const [buildings, setBuildings] = useState<Building[]>([
    { id: 'BLD-001', name: 'Main Building', floors: 4 },
    { id: 'BLD-002', name: 'Annex', floors: 2 },
  ]);

  const [floors, setFloors] = useState<Floor[]>([
    { id: 'FLR-001', buildingId: 'BLD-001', number: 1, name: 'Ground Floor' },
    { id: 'FLR-002', buildingId: 'BLD-001', number: 2, name: 'First Floor' },
    { id: 'FLR-003', buildingId: 'BLD-001', number: 3, name: 'Second Floor' },
    { id: 'FLR-004', buildingId: 'BLD-001', number: 4, name: 'Third Floor' },
    { id: 'FLR-005', buildingId: 'BLD-002', number: 1, name: 'Annex Ground' },
    { id: 'FLR-006', buildingId: 'BLD-002', number: 2, name: 'Annex First' },
  ]);

  const [zones, setZones] = useState<Zone[]>([
    { id: 'ZN-001', name: 'West Wing', floors: [1, 2] },
    { id: 'ZN-002', name: 'East Wing', floors: [3, 4] },
  ]);

  const [publicAreas, setPublicAreas] = useState<PublicArea[]>([
    { id: 'PA-001', name: 'Main Lobby', category: 'Guest Area', cleaningFrequency: 'Hourly' },
    { id: 'PA-002', name: 'Reception', category: 'Guest Area', cleaningFrequency: 'Hourly' },
    { id: 'PA-003', name: 'Conference Room', category: 'Meeting Space', cleaningFrequency: 'Per Use' },
    { id: 'PA-004', name: 'Restaurant', category: 'F&B', cleaningFrequency: 'Daily' },
  ]);

  // Room Status Setup
  const [roomStatuses, setRoomStatuses] = useState<RoomStatus[]>([
    { code: 'VC', name: 'Vacant Clean', color: '#10b981', description: 'Room is vacant and cleaned' },
    { code: 'VD', name: 'Vacant Dirty', color: '#f59e0b', description: 'Room is vacant and needs cleaning' },
    { code: 'OC', name: 'Occupied Clean', color: '#6366f1', description: 'Room is occupied and cleaned' },
    { code: 'OD', name: 'Occupied Dirty', color: '#f43f5e', description: 'Room is occupied and needs cleaning' },
    { code: 'IN', name: 'Inspected', color: '#8b5cf6', description: 'Room has been inspected' },
    { code: 'OO', name: 'Out of Order', color: '#64748b', description: 'Room is out of order' },
    { code: 'OS', name: 'Out of Service', color: '#dc2626', description: 'Room is out of service' },
  ]);

  // Task Setup
  const [taskTypes, setTaskTypes] = useState<TaskType[]>([
    { id: 'TT-001', name: 'Checkout Cleaning', category: 'Automatic', estimatedTime: 30, priority: 'High' },
    { id: 'TT-002', name: 'Stayover Service', category: 'Automatic', estimatedTime: 15, priority: 'Medium' },
    { id: 'TT-003', name: 'VIP Preparation', category: 'Automatic', estimatedTime: 45, priority: 'High' },
    { id: 'TT-004', name: 'Turndown Service', category: 'Automatic', estimatedTime: 10, priority: 'Medium' },
    { id: 'TT-005', name: 'Special Cleaning', category: 'Manual', estimatedTime: 60, priority: 'Medium' },
    { id: 'TT-006', name: 'Emergency Cleaning', category: 'Manual', estimatedTime: 20, priority: 'Critical' },
  ]);

  // Staff Setup
  const [teams, setTeams] = useState([
    { id: 'TM-001', name: 'Team A', supervisor: 'Supervisor A', members: 4 },
    { id: 'TM-002', name: 'Team B', supervisor: 'Supervisor B', members: 3 },
  ]);

  const [shifts, setShifts] = useState([
    { id: 'SH-001', name: 'Morning Shift', startTime: '06:00', endTime: '14:00' },
    { id: 'SH-002', name: 'Afternoon Shift', startTime: '14:00', endTime: '22:00' },
    { id: 'SH-003', name: 'Night Shift', startTime: '22:00', endTime: '06:00' },
  ]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Configuration</h2>
          <p className="text-xs text-slate-500 font-mono italic">Configure property setup, room statuses, tasks, and staff management.</p>
        </div>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
        <button
          onClick={() => setActiveSection('property')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
            activeSection === 'property' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Property Setup
        </button>
        <button
          onClick={() => setActiveSection('status')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
            activeSection === 'status' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Room Status
        </button>
        <button
          onClick={() => setActiveSection('tasks')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
            activeSection === 'tasks' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Task Setup
        </button>
        <button
          onClick={() => setActiveSection('staff')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
            activeSection === 'staff' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Staff Setup
        </button>
      </div>

      {activeSection === 'property' && (
        <div className="space-y-6">
          {/* Buildings */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Buildings</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
                <Plus size={12} /> Add Building
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {buildings.map(building => (
                <div key={building.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{building.name}</h4>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Edit size={12} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Trash2 size={12} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500">{building.floors} floors</div>
                </div>
              ))}
            </div>
          </div>

          {/* Floors */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Floors</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
                <Plus size={12} /> Add Floor
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {floors.map(floor => (
                <div key={floor.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Floor {floor.number}</h4>
                      <div className="text-[10px] text-slate-500">{floor.name}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Edit size={12} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Trash2 size={12} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Zones */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Zones</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
                <Plus size={12} /> Add Zone
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {zones.map(zone => (
                <div key={zone.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{zone.name}</h4>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Edit size={12} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Trash2 size={12} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500">Floors: {zone.floors.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Public Areas */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Public Areas</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
                <Plus size={12} /> Add Area
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {publicAreas.map(area => (
                <div key={area.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{area.name}</h4>
                      <div className="text-[10px] text-slate-500">{area.category}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Edit size={12} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Trash2 size={12} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500">Frequency: {area.cleaningFrequency}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeSection === 'status' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Layers size={16} className="text-indigo-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Room Status Codes</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
              <Plus size={12} /> Add Status
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {roomStatuses.map(status => (
              <div key={status.code} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }} />
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{status.name}</h4>
                      <div className="text-[10px] text-slate-500 font-mono">{status.code}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                      <Edit size={12} className="text-slate-400" />
                    </button>
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                      <Trash2 size={12} className="text-rose-400" />
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">{status.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'tasks' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Task Types</h3>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
              <Plus size={12} /> Add Task Type
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {taskTypes.map(task => (
              <div key={task.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{task.name}</h4>
                    <div className={`text-[10px] font-mono ${task.category === 'Automatic' ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {task.category}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                      <Edit size={12} className="text-slate-400" />
                    </button>
                    <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                      <Trash2 size={12} className="text-rose-400" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>{task.estimatedTime} min</span>
                  <span className={`font-black ${
                    task.priority === 'Critical' ? 'text-red-500' : 
                    task.priority === 'High' ? 'text-orange-500' : 
                    task.priority === 'Medium' ? 'text-indigo-500' : 'text-slate-500'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'staff' && (
        <div className="space-y-6">
          {/* Teams */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Teams</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
                <Plus size={12} /> Add Team
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {teams.map(team => (
                <div key={team.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">{team.name}</h4>
                      <div className="text-[10px] text-slate-500">Supervisor: {team.supervisor}</div>
                    </div>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Edit size={12} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Trash2 size={12} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500">{team.members} members</div>
                </div>
              ))}
            </div>
          </div>

          {/* Shifts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Shifts</h3>
              </div>
              <button className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black uppercase">
                <Plus size={12} /> Add Shift
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {shifts.map(shift => (
                <div key={shift.id} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{shift.name}</h4>
                    <div className="flex gap-1">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Edit size={12} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded">
                        <Trash2 size={12} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">{shift.startTime} - {shift.endTime}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
