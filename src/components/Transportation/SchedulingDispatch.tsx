import React, { useState } from 'react';
import { 
  Calendar,
  Clock,
  Users,
  Car,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle2,
  Filter
} from 'lucide-react';

const SchedulingDispatch: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState('2026-07-30');
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('day');

  const scheduleItems = [
    {
      id: 'SCH-001',
      time: '06:00',
      duration: 60,
      driver: 'James R.',
      vehicle: 'VH-030',
      type: 'Staff Shuttle',
      route: 'Morning Shift Shuttle',
      status: 'Completed',
      passengers: 15
    },
    {
      id: 'SCH-002',
      time: '07:00',
      duration: 45,
      driver: 'John D.',
      vehicle: 'VH-003',
      type: 'Airport Pickup',
      route: 'Hotel to JFK Airport',
      status: 'In Progress',
      passengers: 2
    },
    {
      id: 'SCH-003',
      time: '08:00',
      duration: 30,
      driver: 'Elena R.',
      vehicle: 'VH-001',
      type: 'City Transfer',
      route: 'Hotel to Times Square',
      status: 'Scheduled',
      passengers: 4
    },
    {
      id: 'SCH-004',
      time: '09:00',
      duration: 120,
      driver: 'Carlos M.',
      vehicle: 'VH-004',
      type: 'Tour Transportation',
      route: 'City Sightseeing Tour',
      status: 'Scheduled',
      passengers: 3
    },
    {
      id: 'SCH-005',
      time: '10:00',
      duration: 45,
      driver: 'Sarah L.',
      vehicle: 'VH-012',
      type: 'VIP Transfer',
      route: 'Hotel to Private Airport',
      status: 'Scheduled',
      passengers: 3
    },
    {
      id: 'SCH-006',
      time: '11:00',
      duration: 35,
      driver: 'Mike T.',
      vehicle: 'VH-002',
      type: 'Corporate Transfer',
      route: 'Hotel to Wall Street',
      status: 'Scheduled',
      passengers: 1
    },
    {
      id: 'SCH-007',
      time: '12:00',
      duration: 60,
      driver: 'David L.',
      vehicle: 'VH-007',
      type: 'Conference Shuttle',
      route: 'Hotel to Convention Center',
      status: 'Scheduled',
      passengers: 25
    },
    {
      id: 'SCH-008',
      time: '14:00',
      duration: 40,
      driver: null,
      vehicle: null,
      type: 'Airport Pickup',
      route: 'JFK to Hotel',
      status: 'Unassigned',
      passengers: 2
    },
    {
      id: 'SCH-009',
      time: '15:00',
      duration: 30,
      driver: null,
      vehicle: null,
      type: 'Shopping Trip',
      route: 'Hotel to Fifth Avenue',
      status: 'Unassigned',
      passengers: 2
    },
    {
      id: 'SCH-010',
      time: '16:00',
      duration: 45,
      driver: 'James R.',
      vehicle: 'VH-030',
      type: 'Staff Shuttle',
      route: 'Afternoon Shift Shuttle',
      status: 'Scheduled',
      passengers: 12
    },
  ];

  const conflicts = [
    {
      id: 'CF-001',
      type: 'Driver Conflict',
      description: 'John D. double-booked at 08:00 and 08:30',
      severity: 'High',
      affected: 'SCH-002, SCH-003'
    },
    {
      id: 'CF-002',
      type: 'Vehicle Conflict',
      description: 'VH-001 assigned to two trips at 08:00',
      severity: 'High',
      affected: 'SCH-003, SCH-004'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Unassigned': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-rose-500 text-white';
      case 'Medium': return 'bg-amber-500 text-white';
      case 'Low': return 'bg-blue-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Scheduling & Dispatch</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Resource planning and trip scheduling</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <Plus className="w-4 h-4" />
            New Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <CheckCircle2 className="w-4 h-4" />
            Auto-Schedule
          </button>
        </div>
      </div>

      {/* Date and View Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('day')}
                className={`px-4 py-2 rounded-lg transition ${viewMode === 'day' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >
                Day
              </button>
              <button 
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg transition ${viewMode === 'week' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >
                Week
              </button>
              <button 
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg transition ${viewMode === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'}`}
              >
                Month
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Types</option>
              <option value="airport">Airport Transfers</option>
              <option value="city">City Transfers</option>
              <option value="corporate">Corporate</option>
              <option value="staff">Staff Shuttle</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-4 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h3 className="font-semibold text-rose-900 dark:text-rose-100">Scheduling Conflicts Detected</h3>
          </div>
          <div className="space-y-2">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(conflict.severity)}`}>
                      {conflict.severity}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">{conflict.type}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{conflict.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Affected: {conflict.affected}</p>
                </div>
                <button className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded hover:bg-rose-700 transition">
                  Resolve
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-32">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passengers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {scheduleItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.time}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.type}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{item.route}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {item.driver || <span className="text-amber-600">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {item.vehicle || <span className="text-amber-600">Unassigned</span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{item.duration} min</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="w-3 h-3" />
                      {item.passengers}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SchedulingDispatch;