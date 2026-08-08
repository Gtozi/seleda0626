import React, { useState } from 'react';
import { 
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Play,
  Pause,
  MoreVertical,
  Navigation,
  DollarSign
} from 'lucide-react';

const TripManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');

  const trips = [
    { 
      id: 'TR-001', 
      guest: 'John Smith', 
      room: '302',
      type: 'Airport Pickup', 
      vehicle: 'VH-003',
      driver: 'John D.',
      pickup: 'JFK Airport - Terminal 4',
      destination: 'Hotel Main Entrance',
      scheduled: '2026-07-30 14:30',
      actualStart: '14:35',
      estimatedDuration: '45 min',
      actualDuration: '42 min',
      distance: '25 km',
      passengers: 2,
      luggage: 3,
      status: 'Completed',
      amount: 85.00,
      paymentMethod: 'Guest Folio'
    },
    { 
      id: 'TR-002', 
      guest: 'Sarah Johnson', 
      room: '415',
      type: 'City Transfer', 
      vehicle: 'VH-001',
      driver: 'Elena R.',
      pickup: 'Hotel Lobby',
      destination: 'Times Square',
      scheduled: '2026-07-30 16:00',
      actualStart: null,
      estimatedDuration: '30 min',
      actualDuration: null,
      distance: '12 km',
      passengers: 4,
      luggage: 2,
      status: 'Confirmed',
      amount: 45.00,
      paymentMethod: 'Guest Folio'
    },
    { 
      id: 'TR-003', 
      guest: 'Corporate Event', 
      room: 'N/A',
      type: 'Conference Shuttle', 
      vehicle: 'VH-007',
      driver: 'Carlos M.',
      pickup: 'Hotel Main Entrance',
      destination: 'Convention Center',
      scheduled: '2026-07-30 18:00',
      actualStart: '18:05',
      estimatedDuration: '35 min',
      actualDuration: null,
      distance: '18 km',
      passengers: 25,
      luggage: 0,
      status: 'In Progress',
      amount: 150.00,
      paymentMethod: 'Event Master Account'
    },
    { 
      id: 'TR-004', 
      guest: 'Michael Brown', 
      room: '512',
      type: 'Airport Drop-off', 
      vehicle: 'VH-002',
      driver: 'Mike T.',
      pickup: 'Hotel Lobby',
      destination: 'LGA Airport - Terminal B',
      scheduled: '2026-07-30 19:30',
      actualStart: '19:28',
      estimatedDuration: '55 min',
      actualDuration: '52 min',
      distance: '32 km',
      passengers: 1,
      luggage: 2,
      status: 'Completed',
      amount: 95.00,
      paymentMethod: 'Guest Folio'
    },
    { 
      id: 'TR-005', 
      guest: 'Emily Davis', 
      room: '228',
      type: 'Sightseeing Tour', 
      vehicle: null,
      driver: null,
      pickup: 'Hotel Lobby',
      destination: 'City Tour - Multiple Stops',
      scheduled: '2026-07-31 09:00',
      actualStart: null,
      estimatedDuration: '4 hours',
      actualDuration: null,
      distance: '80 km',
      passengers: 2,
      luggage: 1,
      status: 'Requested',
      amount: 200.00,
      paymentMethod: 'Guest Folio'
    },
    { 
      id: 'TR-006', 
      guest: 'VIP Guest', 
      room: 'Penthouse',
      type: 'VIP Transport', 
      vehicle: 'VH-012',
      driver: 'Sarah L.',
      pickup: 'Hotel VIP Entrance',
      destination: 'Private Airport',
      scheduled: '2026-07-31 06:00',
      actualStart: null,
      estimatedDuration: '1 hour',
      actualDuration: null,
      distance: '45 km',
      passengers: 3,
      luggage: 5,
      status: 'Confirmed',
      amount: 350.00,
      paymentMethod: 'Corporate Account'
    },
    { 
      id: 'TR-007', 
      guest: 'Robert Wilson', 
      room: '318',
      type: 'Airport Pickup', 
      vehicle: null,
      driver: null,
      pickup: 'JFK Airport - Terminal 1',
      destination: 'Hotel Main Entrance',
      scheduled: '2026-07-30 15:00',
      actualStart: null,
      estimatedDuration: '40 min',
      actualDuration: null,
      distance: '22 km',
      passengers: 1,
      luggage: 2,
      status: 'Cancelled',
      amount: 0.00,
      paymentMethod: 'N/A'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Assigned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Driver En Route': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'Guest Picked Up': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'In Progress': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      case 'No Show': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tripStats = {
    total: trips.length,
    requested: trips.filter(t => t.status === 'Requested').length,
    confirmed: trips.filter(t => t.status === 'Confirmed').length,
    inProgress: trips.filter(t => t.status === 'In Progress' || t.status === 'Driver En Route' || t.status === 'Guest Picked Up').length,
    completed: trips.filter(t => t.status === 'Completed').length,
    cancelled: trips.filter(t => t.status === 'Cancelled').length,
    totalRevenue: trips.filter(t => t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Trip Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Complete trip lifecycle management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Calendar className="w-4 h-4" />
          New Trip
        </button>
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Trips</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{tripStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{tripStats.completed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{tripStats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Today's Revenue</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">${tripStats.totalRevenue.toFixed(2)}</p>
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
                placeholder="Search by guest, room, or ID..."
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
            <option value="Requested">Requested</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Trip ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle/Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{trip.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{trip.guest}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Room {trip.room}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{trip.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {trip.vehicle ? (
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{trip.vehicle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{trip.driver}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {trip.pickup} → {trip.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {trip.scheduled.split(' ')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    {trip.actualDuration || trip.estimatedDuration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    ${trip.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded">
                        <MoreVertical className="w-4 h-4" />
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

export default TripManagement;