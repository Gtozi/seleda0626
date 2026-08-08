import React, { useState } from 'react';
import { 
  MapPin,
  Car,
  Users,
  Clock,
  Navigation,
  Radio,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Phone,
  MessageSquare
} from 'lucide-react';

const DispatchCenter: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const activeTrips = [
    {
      id: 'TR-001',
      guest: 'John Smith',
      room: '302',
      vehicle: 'VH-003',
      driver: 'John D.',
      status: 'Driver En Route',
      pickup: 'JFK Airport - Terminal 4',
      destination: 'Hotel Main Entrance',
      scheduled: '14:30',
      eta: '15 min',
      priority: 'High'
    },
    {
      id: 'TR-003',
      guest: 'Corporate Event',
      room: 'N/A',
      vehicle: 'VH-007',
      driver: 'Carlos M.',
      status: 'In Progress',
      pickup: 'Hotel Main Entrance',
      destination: 'Convention Center',
      scheduled: '18:00',
      eta: '25 min',
      priority: 'High'
    },
    {
      id: 'TR-006',
      guest: 'VIP Guest',
      room: 'Penthouse',
      vehicle: 'VH-012',
      driver: 'Sarah L.',
      status: 'Guest Picked Up',
      pickup: 'Hotel VIP Entrance',
      destination: 'Private Airport',
      scheduled: '06:00',
      eta: '45 min',
      priority: 'Critical'
    },
  ];

  const availableVehicles = [
    { id: 'VH-001', type: 'Sedan', driver: 'Elena R.', status: 'Available', location: 'Hotel Garage', fuel: 85 },
    { id: 'VH-002', type: 'SUV', driver: 'Mike T.', status: 'Available', location: 'Hotel Garage', fuel: 92 },
    { id: 'VH-004', type: 'Van', driver: 'Available', status: 'Available', location: 'Hotel Garage', fuel: 78 },
    { id: 'VH-008', type: 'Sedan', driver: 'Available', status: 'Available', location: 'Hotel Garage', fuel: 45 },
    { id: 'VH-009', type: 'Luxury', driver: 'Available', status: 'Available', location: 'Hotel Garage', fuel: 88 },
  ];

  const pendingAssignments = [
    {
      id: 'TR-002',
      guest: 'Sarah Johnson',
      room: '415',
      type: 'City Transfer',
      pickup: 'Hotel Lobby',
      destination: 'Times Square',
      scheduled: '16:00',
      passengers: 4,
      urgency: 'Normal'
    },
    {
      id: 'TR-005',
      guest: 'Emily Davis',
      room: '228',
      type: 'Sightseeing Tour',
      pickup: 'Hotel Lobby',
      destination: 'City Tour',
      scheduled: '09:00',
      passengers: 2,
      urgency: 'Low'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Driver En Route': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'In Progress': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Guest Picked Up': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Completed': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      case 'Delayed': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dispatch Center</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Live dispatch operations and vehicle assignment</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
            <Zap className="w-4 h-4" />
            Auto-Assign
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
            <Radio className="w-4 h-4" />
            Emergency Dispatch
          </button>
        </div>
      </div>

      {/* Dispatch Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Trips</p>
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Available Vehicles</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">5</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Assignments</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">2</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Drivers on Duty</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">4</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trips */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Trips</h3>
          <div className="space-y-4">
            {activeTrips.map((trip) => (
              <div key={trip.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{trip.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getUrgencyColor(trip.priority)}`}>
                        {trip.priority}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{trip.guest} - Room {trip.room}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(trip.status)}`}>
                    {trip.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Car className="w-4 h-4" />
                    {trip.vehicle} - {trip.driver}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    ETA: {trip.eta}
                  </div>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 col-span-2">
                    <MapPin className="w-4 h-4" />
                    {trip.pickup} → {trip.destination}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    <Navigation className="w-3 h-3" />
                    Track
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 transition">
                    <Phone className="w-3 h-3" />
                    Call Driver
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition">
                    <MessageSquare className="w-3 h-3" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Vehicles */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Available Vehicles</h3>
          <div className="space-y-3">
            {availableVehicles.map((vehicle) => (
              <div 
                key={vehicle.id}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  selectedVehicle === vehicle.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400' 
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{vehicle.id}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{vehicle.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{vehicle.driver}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.location}</p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2 w-24">
                      <div 
                        className={`h-2 rounded-full ${vehicle.fuel > 50 ? 'bg-emerald-500' : vehicle.fuel > 25 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${vehicle.fuel}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">{vehicle.fuel}%</span>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    Available
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Assignments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pending Assignments</h3>
        <div className="space-y-4">
          {pendingAssignments.map((assignment) => (
            <div key={assignment.id} className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">{assignment.id}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getUrgencyColor(assignment.urgency)}`}>
                      {assignment.urgency}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{assignment.guest} - Room {assignment.room}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{assignment.type}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Scheduled: {assignment.scheduled}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-4 h-4" />
                  {assignment.pickup}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Navigation className="w-4 h-4" />
                  {assignment.destination}
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Users className="w-4 h-4" />
                  {assignment.passengers} passengers
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                  <Car className="w-3 h-3" />
                  Assign Vehicle
                </button>
                <button className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-600 text-white rounded hover:bg-slate-700 transition">
                  <XCircle className="w-3 h-3" />
                  Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DispatchCenter;