import React, { useState } from 'react';
import { 
  Plane,
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Bell,
  Eye,
  Edit,
  Plus,
  ArrowUp,
  ArrowDown,
  Navigation,
  User
} from 'lucide-react';

const AirportTransfers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [transferType, setTransferType] = useState('all');

  const transfers = [
    { 
      id: 'AT-001', 
      guest: 'John Smith', 
      room: '302',
      type: 'Arrival Pickup', 
      service: 'Standard',
      flight: 'BA247',
      airline: 'British Airways',
      terminal: 'Terminal 4',
      scheduled: '2026-07-30 14:30',
      estimatedLanding: '14:15',
      actualLanding: '14:22',
      flightStatus: 'Landed',
      delay: '+7 min',
      driver: 'John D.',
      vehicle: 'VH-003',
      pickupLocation: 'JFK Airport - Terminal 4, Arrivals',
      destination: 'Hotel Main Entrance',
      status: 'Driver En Route',
      meetGreet: false,
      luggage: 3,
      passengers: 2
    },
    { 
      id: 'AT-002', 
      guest: 'Sarah Johnson', 
      room: '415',
      type: 'Departure Drop-off', 
      service: 'Standard',
      flight: 'DL892',
      airline: 'Delta Airlines',
      terminal: 'Terminal 3',
      scheduled: '2026-07-30 19:30',
      estimatedLanding: 'N/A',
      actualLanding: 'N/A',
      flightStatus: 'On Time',
      delay: 'On Time',
      driver: null,
      vehicle: null,
      pickupLocation: 'Hotel Lobby',
      destination: 'LGA Airport - Terminal 3',
      status: 'Confirmed',
      meetGreet: false,
      luggage: 2,
      passengers: 1
    },
    { 
      id: 'AT-003', 
      guest: 'VIP Guest', 
      room: 'Penthouse',
      type: 'Arrival Pickup', 
      service: 'VIP Meet & Greet',
      flight: 'LH456',
      airline: 'Lufthansa',
      terminal: 'Terminal 1',
      scheduled: '2026-07-31 06:00',
      estimatedLanding: '05:45',
      actualLanding: null,
      flightStatus: 'In Flight',
      delay: 'On Time',
      driver: 'Sarah L.',
      vehicle: 'VH-012',
      pickupLocation: 'JFK Airport - Terminal 1, VIP Lounge',
      destination: 'Hotel VIP Entrance',
      status: 'Confirmed',
      meetGreet: true,
      luggage: 5,
      passengers: 3
    },
    { 
      id: 'AT-004', 
      guest: 'Conference Group', 
      room: 'N/A',
      type: 'Group Transfer', 
      service: 'Group',
      flight: 'UA789',
      airline: 'United Airlines',
      terminal: 'Terminal 7',
      scheduled: '2026-07-31 10:00',
      estimatedLanding: '09:45',
      actualLanding: null,
      flightStatus: 'Scheduled',
      delay: 'On Time',
      driver: null,
      vehicle: null,
      pickupLocation: 'JFK Airport - Terminal 7, Bus Bay',
      destination: 'Hotel Main Entrance',
      status: 'Requested',
      meetGreet: true,
      luggage: 15,
      passengers: 20
    },
    { 
      id: 'AT-005', 
      guest: 'Michael Brown', 
      room: '512',
      type: 'Arrival Pickup', 
      service: 'Standard',
      flight: 'AF123',
      airline: 'Air France',
      terminal: 'Terminal 2',
      scheduled: '2026-07-30 16:00',
      estimatedLanding: '15:30',
      actualLanding: '17:45',
      flightStatus: 'Landed',
      delay: '+2h 15min',
      driver: 'Elena R.',
      vehicle: 'VH-001',
      pickupLocation: 'JFK Airport - Terminal 2, Arrivals',
      destination: 'Hotel Main Entrance',
      status: 'Completed',
      meetGreet: false,
      luggage: 2,
      passengers: 1
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Requested': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      case 'Confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Driver En Route': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200';
      case 'In Progress': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getFlightStatusColor = (status: string) => {
    switch (status) {
      case 'Landed': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'In Flight': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'On Time': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Delayed': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Cancelled': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getDelayColor = (delay: string) => {
    if (delay === 'On Time') return 'text-emerald-600 dark:text-emerald-400';
    if (delay.startsWith('+')) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-600 dark:text-slate-400';
  };

  const filteredTransfers = transfers.filter(transfer => {
    const matchesSearch = transfer.guest.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.flight.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transfer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter;
    const matchesType = transferType === 'all' || transfer.type === transferType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const flightAlerts = [
    { type: 'Flight Delay', message: 'Flight AF123 delayed by 2h 15min', time: '10 min ago', icon: AlertTriangle },
    { type: 'Early Landing', message: 'Flight BA247 landed 7min early', time: '15 min ago', icon: ArrowDown },
    { type: 'Gate Change', message: 'Flight LH456 gate changed to B12', time: '30 min ago', icon: Navigation },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Airport Transfers</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Flight tracking and airport transfer management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Transfer
        </button>
      </div>

      {/* Flight Alerts */}
      <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <h3 className="font-semibold text-amber-900 dark:text-amber-100">Flight Alerts</h3>
        </div>
        <div className="space-y-2">
          {flightAlerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className="flex items-center gap-3 text-sm">
                <Icon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-amber-800 dark:text-amber-200">{alert.message}</span>
                <span className="text-xs text-amber-600 dark:text-amber-400 ml-auto">{alert.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Plane className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Transfers</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{transfers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <ArrowDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Arrivals Today</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-lg">
              <ArrowUp className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Departures Today</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">1</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Delayed Flights</p>
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
                placeholder="Search by guest, flight, or ID..."
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
            <option value="Driver En Route">Driver En Route</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select
            value={transferType}
            onChange={(e) => setTransferType(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Arrival Pickup">Arrival Pickup</option>
            <option value="Departure Drop-off">Departure Drop-off</option>
            <option value="Group Transfer">Group Transfer</option>
          </select>
        </div>
      </div>

      {/* Transfers Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transfer ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Terminal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Flight Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Delay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Driver/Vehicle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTransfers.map((transfer) => (
                <tr key={transfer.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{transfer.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{transfer.guest}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Room {transfer.room}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-900 dark:text-white">{transfer.type}</span>
                      {transfer.meetGreet && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Meet & Greet
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{transfer.flight}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{transfer.airline}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{transfer.terminal}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {transfer.scheduled.split(' ')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFlightStatusColor(transfer.flightStatus)}`}>
                      {transfer.flightStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={getDelayColor(transfer.delay)}>{transfer.delay}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {transfer.driver ? (
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{transfer.driver}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{transfer.vehicle}</p>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>
                      {transfer.status}
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

export default AirportTransfers;