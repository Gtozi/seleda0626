import React, { useState } from 'react';
import { 
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  Plane,
  Car,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

const TransportationRequests: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const requests = [
    { 
      id: 'TR-001', 
      guest: 'John Smith', 
      room: '302',
      type: 'Airport Pickup', 
      source: 'Front Office',
      pickup: 'JFK Airport - Terminal 4',
      destination: 'Hotel Main Entrance',
      scheduled: '2026-07-30 14:30',
      passengers: 2,
      luggage: 3,
      status: 'Confirmed',
      priority: 'High'
    },
    { 
      id: 'TR-002', 
      guest: 'Sarah Johnson', 
      room: '415',
      type: 'City Transfer', 
      source: 'Concierge',
      pickup: 'Hotel Lobby',
      destination: 'Times Square',
      scheduled: '2026-07-30 16:00',
      passengers: 4,
      luggage: 2,
      status: 'Pending',
      priority: 'Normal'
    },
    { 
      id: 'TR-003', 
      guest: 'Corporate Event', 
      room: 'N/A',
      type: 'Conference Shuttle', 
      source: 'Events & Banquets',
      pickup: 'Hotel Main Entrance',
      destination: 'Convention Center',
      scheduled: '2026-07-30 18:00',
      passengers: 25,
      luggage: 0,
      status: 'Assigned',
      priority: 'High'
    },
    { 
      id: 'TR-004', 
      guest: 'Michael Brown', 
      room: '512',
      type: 'Airport Drop-off', 
      source: 'Guest Mobile App',
      pickup: 'Hotel Lobby',
      destination: 'LGA Airport - Terminal B',
      scheduled: '2026-07-30 19:30',
      passengers: 1,
      luggage: 2,
      status: 'Completed',
      priority: 'Normal'
    },
    { 
      id: 'TR-005', 
      guest: 'Emily Davis', 
      room: '228',
      type: 'Sightseeing Tour', 
      source: 'Concierge',
      pickup: 'Hotel Lobby',
      destination: 'City Tour - Multiple Stops',
      scheduled: '2026-07-31 09:00',
      passengers: 2,
      luggage: 1,
      status: 'Pending',
      priority: 'Low'
    },
    { 
      id: 'TR-006', 
      guest: 'VIP Guest', 
      room: 'Penthouse',
      type: 'VIP Transport', 
      source: 'Reservation System',
      pickup: 'Hotel VIP Entrance',
      destination: 'Private Airport',
      scheduled: '2026-07-31 06:00',
      passengers: 3,
      luggage: 5,
      status: 'Confirmed',
      priority: 'Critical'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Assigned': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    if (type.includes('Airport')) return <Plane className="w-4 h-4" />;
    if (type.includes('Shuttle') || type.includes('Conference')) return <Car className="w-4 h-4" />;
    return <MapPin className="w-4 h-4" />;
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transportation Requests</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage incoming transportation requests</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Request
        </button>
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
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Assigned">Assigned</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Airport Pickup">Airport Pickup</option>
            <option value="Airport Drop-off">Airport Drop-off</option>
            <option value="City Transfer">City Transfer</option>
            <option value="Conference Shuttle">Conference Shuttle</option>
            <option value="Sightseeing Tour">Sightseeing Tour</option>
            <option value="VIP Transport">VIP Transport</option>
          </select>
        </div>
      </div>

      {/* Request Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Confirmed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Car className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Assigned</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">1</p>
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
              <p className="text-xl font-bold text-slate-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Request ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Pickup</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passengers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{request.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{request.guest}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Room {request.room}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                        {getTypeIcon(request.type)}
                      </div>
                      <span className="text-sm text-slate-900 dark:text-white">{request.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{request.source}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">{request.pickup}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {request.scheduled}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="w-3 h-3" />
                      {request.passengers}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                      {request.priority}
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

export default TransportationRequests;