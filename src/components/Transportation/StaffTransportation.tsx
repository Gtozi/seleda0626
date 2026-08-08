import React, { useState } from 'react';
import { 
  Users,
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Bus,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  UserCheck
} from 'lucide-react';

const StaffTransportation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const shuttles = [
    {
      id: 'ST-001',
      name: 'Morning Shift Shuttle',
      type: 'Staff Shuttle',
      route: 'Downtown ↔ Hotel',
      stops: ['Central Station', 'Business District', 'Hotel Employee Entrance'],
      schedule: '06:00, 07:00, 08:00',
      vehicle: 'VH-030',
      driver: 'James R.',
      capacity: 20,
      currentOccupancy: 15,
      status: 'Active',
      department: 'All Departments'
    },
    {
      id: 'ST-002',
      name: 'Evening Shift Shuttle',
      type: 'Staff Shuttle',
      route: 'Hotel ↔ Downtown',
      stops: ['Hotel Employee Entrance', 'Business District', 'Central Station'],
      schedule: '17:00, 18:00, 19:00',
      vehicle: 'VH-031',
      driver: 'Maria S.',
      capacity: 20,
      currentOccupancy: 0,
      status: 'Scheduled',
      department: 'All Departments'
    },
    {
      id: 'ST-003',
      name: 'Night Shift Transport',
      type: 'Shift Transportation',
      route: 'Hotel ↔ Residential Areas',
      stops: ['Hotel Employee Entrance', 'Residential Complex A', 'Residential Complex B'],
      schedule: '22:00, 23:00, 00:00',
      vehicle: 'VH-032',
      driver: 'David L.',
      capacity: 15,
      currentOccupancy: 0,
      status: 'Scheduled',
      department: 'Housekeeping, Engineering'
    },
  ];

  const trips = [
    {
      id: 'SPT-001',
      employee: 'John Smith',
      employeeId: 'EMP-001',
      department: 'Housekeeping',
      type: 'Staff Pickup',
      pickup: 'Central Station',
      destination: 'Hotel Employee Entrance',
      scheduled: '2026-07-30 07:00',
      actual: '07:05',
      vehicle: 'VH-030',
      driver: 'James R.',
      status: 'Completed',
      shift: 'Morning'
    },
    {
      id: 'SPT-002',
      employee: 'Sarah Johnson',
      employeeId: 'EMP-002',
      department: 'Front Office',
      type: 'Staff Pickup',
      pickup: 'Business District',
      destination: 'Hotel Employee Entrance',
      scheduled: '2026-07-30 08:00',
      actual: null,
      vehicle: 'VH-030',
      driver: 'James R.',
      status: 'Scheduled',
      shift: 'Morning'
    },
    {
      id: 'SPT-003',
      employee: 'Michael Brown',
      employeeId: 'EMP-003',
      department: 'Engineering',
      type: 'Staff Drop-off',
      pickup: 'Hotel Employee Entrance',
      destination: 'Residential Complex A',
      scheduled: '2026-07-30 18:00',
      actual: null,
      vehicle: 'VH-031',
      driver: 'Maria S.',
      status: 'Scheduled',
      shift: 'Evening'
    },
    {
      id: 'SPT-004',
      employee: 'Emily Davis',
      employeeId: 'EMP-004',
      department: 'Food & Beverage',
      type: 'Staff Pickup',
      pickup: 'Central Station',
      destination: 'Hotel Employee Entrance',
      scheduled: '2026-07-30 06:00',
      actual: '06:02',
      vehicle: 'VH-030',
      driver: 'James R.',
      status: 'Completed',
      shift: 'Morning'
    },
    {
      id: 'SPT-005',
      employee: 'Robert Wilson',
      employeeId: 'EMP-005',
      department: 'Security',
      type: 'Shift Transportation',
      pickup: 'Hotel Employee Entrance',
      destination: 'Residential Complex B',
      scheduled: '2026-07-30 23:00',
      actual: null,
      vehicle: 'VH-032',
      driver: 'David L.',
      status: 'Scheduled',
      shift: 'Night'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'In Progress': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || trip.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Staff Transportation</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Employee shuttle and shift transportation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Schedule
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Routes</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Staff Transported</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">15</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">On-Time Rate</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">98%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Departments Served</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">5</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by employee, ID, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Staff Pickup">Staff Pickup</option>
            <option value="Staff Drop-off">Staff Drop-off</option>
            <option value="Shift Transportation">Shift Transportation</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shuttle Routes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Staff Shuttle Routes</h3>
          <div className="space-y-4">
            {shuttles.map((shuttle) => (
              <div key={shuttle.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{shuttle.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(shuttle.status)}`}>
                        {shuttle.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{shuttle.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{shuttle.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{shuttle.schedule}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Schedule</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span>{shuttle.route}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Bus className="w-4 h-4" />
                    {shuttle.vehicle}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Users className="w-4 h-4" />
                    {shuttle.driver}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                    <UserCheck className="w-4 h-4" />
                    {shuttle.department}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 w-32">
                      <div 
                        className={`h-2 rounded-full ${getOccupancyColor(shuttle.currentOccupancy, shuttle.capacity)}`}
                        style={{ width: `${(shuttle.currentOccupancy / shuttle.capacity) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">
                      {shuttle.currentOccupancy}/{shuttle.capacity}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Trips */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Staff Trips</h3>
          <div className="space-y-3">
            {filteredTrips.map((trip) => (
              <div key={trip.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{trip.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{trip.employee}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.employeeId} - {trip.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{trip.shift}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{trip.type}</p>
                  </div>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {trip.pickup}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {trip.scheduled.split(' ')[1]}
                  </div>
                  <div className="flex items-center gap-1">
                    <Bus className="w-3 h-3" />
                    {trip.vehicle}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {trip.driver}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffTransportation;