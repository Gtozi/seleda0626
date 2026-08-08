import React, { useState } from 'react';
import { 
  MapPin,
  Search,
  Filter,
  Calendar,
  Users,
  Car,
  Plus,
  Eye,
  Edit,
  Trash2,
  ShoppingBag,
  Utensils,
  Camera,
  Heart,
  Briefcase
} from 'lucide-react';

const GuestTransportation: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const transports = [
    {
      id: 'GT-001',
      guest: 'John Smith',
      room: '302',
      type: 'Local Transfer',
      subtype: 'Shopping Trip',
      pickup: 'Hotel Lobby',
      destination: 'Fifth Avenue Shopping District',
      scheduled: '2026-07-30 15:00',
      vehicle: 'VH-001',
      driver: 'Elena R.',
      passengers: 2,
      status: 'Confirmed',
      specialRequests: 'Multiple shopping stops',
      estimatedDuration: '3 hours',
      amount: 45.00
    },
    {
      id: 'GT-002',
      guest: 'Sarah Johnson',
      room: '415',
      type: 'Restaurant Transfer',
      subtype: 'Dinner Reservation',
      pickup: 'Hotel Lobby',
      destination: 'Le Bernardin Restaurant',
      scheduled: '2026-07-30 19:30',
      vehicle: null,
      driver: null,
      passengers: 4,
      status: 'Pending',
      specialRequests: 'Celebration dinner',
      estimatedDuration: '2 hours',
      amount: 35.00
    },
    {
      id: 'GT-003',
      guest: 'Michael Brown',
      room: '512',
      type: 'Tour Transportation',
      subtype: 'City Sightseeing',
      pickup: 'Hotel Lobby',
      destination: 'Multiple Tourist Attractions',
      scheduled: '2026-07-31 09:00',
      vehicle: 'VH-004',
      driver: 'Carlos M.',
      passengers: 3,
      status: 'Confirmed',
      specialRequests: 'Wheelchair accessible',
      estimatedDuration: '6 hours',
      amount: 180.00
    },
    {
      id: 'GT-004',
      guest: 'Emily Davis',
      room: '228',
      type: 'Medical Transportation',
      subtype: 'Hospital Visit',
      pickup: 'Hotel Lobby',
      destination: 'Mount Sinai Hospital',
      scheduled: '2026-07-30 14:00',
      vehicle: 'VH-002',
      driver: 'Mike T.',
      passengers: 1,
      status: 'In Progress',
      specialRequests: 'Patient needs assistance',
      estimatedDuration: '1 hour',
      amount: 40.00
    },
    {
      id: 'GT-005',
      guest: 'Robert Wilson',
      room: '318',
      type: 'Special Assistance',
      subtype: 'Accessibility Service',
      pickup: 'Hotel Lobby',
      destination: 'Broadway Theater',
      scheduled: '2026-07-30 20:00',
      vehicle: null,
      driver: null,
      passengers: 2,
      status: 'Requested',
      specialRequests: 'Wheelchair accessible vehicle',
      estimatedDuration: '3 hours',
      amount: 55.00
    },
  ];

  const getTypeIcon = (subtype: string) => {
    switch (subtype) {
      case 'Shopping Trip': return <ShoppingBag className="w-4 h-4" />;
      case 'Dinner Reservation': return <Utensils className="w-4 h-4" />;
      case 'City Sightseeing': return <Camera className="w-4 h-4" />;
      case 'Hospital Visit': return <Heart className="w-4 h-4" />;
      case 'Accessibility Service': return <Briefcase className="w-4 h-4" />;
      default: return <MapPin className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Pending': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'In Progress': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Requested': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const filteredTransports = transports.filter(transport => {
    const matchesSearch = transport.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || transport.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || transport.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Guest Transportation</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Local transfers and guest transportation services</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Transportation
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Requests</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{transports.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Passengers Today</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">12</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Shopping Trips</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">1</p>
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
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Local Transfer">Local Transfer</option>
            <option value="Restaurant Transfer">Restaurant Transfer</option>
            <option value="Tour Transportation">Tour Transportation</option>
            <option value="Medical Transportation">Medical Transportation</option>
            <option value="Special Assistance">Special Assistance</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="Requested">Requested</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Transportation Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Vehicle/Driver</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Passengers</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTransports.map((transport) => (
                <tr key={transport.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{transport.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{transport.guest}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Room {transport.room}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded">
                        {getTypeIcon(transport.subtype)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{transport.type}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{transport.subtype}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {transport.pickup} → {transport.destination}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {transport.scheduled.split(' ')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transport.vehicle ? (
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{transport.vehicle}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{transport.driver}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="w-3 h-3" />
                      {transport.passengers}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transport.status)}`}>
                      {transport.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                    ${transport.amount.toFixed(2)}
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

export default GuestTransportation;