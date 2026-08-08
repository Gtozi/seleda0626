import React, { useState } from 'react';
import { 
  Bus,
  MapPin,
  Clock,
  Users,
  Calendar,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Route,
  AlertCircle,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';

const ShuttleManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const shuttles = [
    {
      id: 'SH-001',
      name: 'Airport Express',
      type: 'Scheduled Route',
      route: 'Hotel ↔ JFK Airport',
      stops: ['Hotel Main Entrance', 'Times Square', 'JFK Terminal 4'],
      schedule: 'Every 2 hours',
      nextDeparture: '14:00',
      vehicle: 'VH-020',
      driver: 'James R.',
      capacity: 24,
      currentOccupancy: 18,
      status: 'Active',
      frequency: 'Fixed'
    },
    {
      id: 'SH-002',
      name: 'City Center Shuttle',
      type: 'Scheduled Route',
      route: 'Hotel ↔ Downtown',
      stops: ['Hotel Main Entrance', 'Central Park', 'Times Square', 'Empire State Building'],
      schedule: 'Every hour',
      nextDeparture: '14:30',
      vehicle: 'VH-021',
      driver: 'Maria S.',
      capacity: 20,
      currentOccupancy: 12,
      status: 'Active',
      frequency: 'Fixed'
    },
    {
      id: 'SH-003',
      name: 'Shopping Express',
      type: 'Scheduled Route',
      route: 'Hotel ↔ Shopping Mall',
      stops: ['Hotel Main Entrance', 'Fifth Avenue', 'Shopping Mall'],
      schedule: 'Every 3 hours',
      nextDeparture: '15:00',
      vehicle: 'VH-022',
      driver: 'David L.',
      capacity: 18,
      currentOccupancy: 8,
      status: 'Active',
      frequency: 'Fixed'
    },
    {
      id: 'SH-004',
      name: 'On-Demand Shuttle',
      type: 'Demand-Based',
      route: 'Flexible',
      stops: ['Variable based on requests'],
      schedule: 'On request',
      nextDeparture: 'N/A',
      vehicle: 'VH-023',
      driver: 'Available',
      capacity: 16,
      currentOccupancy: 0,
      status: 'Standby',
      frequency: 'On-Demand'
    },
    {
      id: 'SH-005',
      name: 'Conference Shuttle',
      type: 'Special Event',
      route: 'Hotel ↔ Convention Center',
      stops: ['Hotel Main Entrance', 'Convention Center'],
      schedule: 'Event schedule',
      nextDeparture: '18:00',
      vehicle: 'VH-024',
      driver: 'Robert K.',
      capacity: 30,
      currentOccupancy: 0,
      status: 'Scheduled',
      frequency: 'Event'
    },
  ];

  const boardingList = [
    { shuttleId: 'SH-001', guest: 'John Smith', room: '302', pickup: 'Hotel Main Entrance', destination: 'JFK Terminal 4', scheduled: '14:00', status: 'Checked In' },
    { shuttleId: 'SH-001', guest: 'Sarah Johnson', room: '415', pickup: 'Hotel Main Entrance', destination: 'JFK Terminal 4', scheduled: '14:00', status: 'Checked In' },
    { shuttleId: 'SH-002', guest: 'Michael Brown', room: '512', pickup: 'Hotel Main Entrance', destination: 'Times Square', scheduled: '14:30', status: 'Waiting' },
    { shuttleId: 'SH-002', guest: 'Emily Davis', room: '228', pickup: 'Hotel Main Entrance', destination: 'Central Park', scheduled: '14:30', status: 'Waiting' },
    { shuttleId: 'SH-002', guest: 'Robert Wilson', room: '318', pickup: 'Hotel Main Entrance', destination: 'Empire State Building', scheduled: '14:30', status: 'Confirmed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Standby': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Scheduled': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'In Transit': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Maintenance': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage >= 90) return 'bg-rose-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const filteredShuttles = shuttles.filter(shuttle => {
    const matchesSearch = shuttle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shuttle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shuttle.route.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || shuttle.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Shuttle Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Scheduled routes and shuttle operations</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Shuttle Route
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
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">On Schedule</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">95%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Passengers</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">38</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Next Departure</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">14:00</p>
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
                placeholder="Search by name, route, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Standby">Standby</option>
            <option value="Scheduled">Scheduled</option>
            <option value="In Transit">In Transit</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shuttle Routes */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Shuttle Routes</h3>
          <div className="space-y-4">
            {filteredShuttles.map((shuttle) => (
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
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{shuttle.nextDeparture}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Next departure</p>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Route className="w-4 h-4" />
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
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    {shuttle.schedule}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {shuttle.frequency}
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

        {/* Boarding List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Upcoming Boarding</h3>
          <div className="space-y-3">
            {boardingList.map((boarding, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900 dark:text-white">{boarding.guest}</p>
                      <span className="text-xs text-slate-500 dark:text-slate-400">Room {boarding.room}</span>
                    </div>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {boarding.pickup}
                      </div>
                      <div className="flex items-center gap-1">
                        <Route className="w-3 h-3" />
                        {boarding.destination}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {boarding.scheduled}
                      </div>
                      <div className="flex items-center gap-1">
                        <Bus className="w-3 h-3" />
                        {boarding.shuttleId}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    boarding.status === 'Checked In' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : boarding.status === 'Waiting'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  }`}>
                    {boarding.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShuttleManagement;