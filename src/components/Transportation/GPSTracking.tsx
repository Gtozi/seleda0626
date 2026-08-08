import React, { useState } from 'react';
import { 
  MapPin,
  Navigation,
  Car,
  Search,
  Clock,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Eye,
  MoreVertical,
  Activity
} from 'lucide-react';

const GPSTracking: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  const vehicles = [
    {
      id: 'VH-003',
      driver: 'John D.',
      location: 'JFK Airport - Terminal 4',
      latitude: 40.6413,
      longitude: -73.7781,
      speed: 45,
      heading: 180,
      status: 'In Transit',
      lastUpdate: '2 min ago',
      destination: 'Hotel Main Entrance',
      eta: '15 min',
      tripId: 'TR-001',
      routeDeviation: false
    },
    {
      id: 'VH-007',
      driver: 'Carlos M.',
      location: 'Midtown Tunnel',
      latitude: 40.7580,
      longitude: -73.9754,
      speed: 35,
      heading: 90,
      status: 'In Transit',
      lastUpdate: '1 min ago',
      destination: 'Convention Center',
      eta: '25 min',
      tripId: 'TR-003',
      routeDeviation: false
    },
    {
      id: 'VH-012',
      driver: 'Sarah L.',
      location: 'Hotel VIP Entrance',
      latitude: 40.7589,
      longitude: -73.9851,
      speed: 0,
      heading: 0,
      status: 'Parked',
      lastUpdate: 'Just now',
      destination: 'N/A',
      eta: 'N/A',
      tripId: null,
      routeDeviation: false
    },
    {
      id: 'VH-001',
      driver: 'Elena R.',
      location: 'Times Square',
      latitude: 40.7580,
      longitude: -73.9855,
      speed: 0,
      heading: 0,
      status: 'Waiting',
      lastUpdate: '5 min ago',
      destination: 'Hotel Main Entrance',
      eta: '20 min',
      tripId: 'TR-002',
      routeDeviation: false
    },
    {
      id: 'VH-008',
      driver: 'Mike T.',
      location: 'Unknown',
      latitude: null,
      longitude: null,
      speed: 0,
      heading: 0,
      status: 'Offline',
      lastUpdate: '2 hours ago',
      destination: 'N/A',
      eta: 'N/A',
      tripId: null,
      routeDeviation: false
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Parked': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Waiting': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Offline': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">GPS Tracking</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time vehicle location and tracking</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <MapPin className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            <Activity className="w-4 h-4" />
            Trip Replay
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Tracked Vehicles</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{vehicles.filter(v => v.status !== 'Offline').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Transit</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{vehicles.filter(v => v.status === 'In Transit').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Offline</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{vehicles.filter(v => v.status === 'Offline').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Speed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{Math.round(vehicles.filter(v => v.speed > 0).reduce((sum, v) => sum + v.speed, 0) / vehicles.filter(v => v.speed > 0).length)} km/h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live Map</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                Full Screen
              </button>
              <button className="px-3 py-1.5 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition">
                Heatmap
              </button>
            </div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-700 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-400">Interactive map view</p>
              <p className="text-sm text-slate-500 dark:text-slate-500">Real-time vehicle positions</p>
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vehicle Status</h3>
          <div className="space-y-3">
            {vehicles.map((vehicle) => (
              <div 
                key={vehicle.id}
                className={`p-4 rounded-lg border cursor-pointer transition ${
                  selectedVehicle === vehicle.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500 dark:border-blue-400' 
                    : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-white">{vehicle.id}</span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                        {vehicle.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{vehicle.driver}</p>
                  </div>
                  {vehicle.routeDeviation && (
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  )}
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{vehicle.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Gauge className="w-4 h-4" />
                      <span>{vehicle.speed} km/h</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>{vehicle.lastUpdate}</span>
                    </div>
                  </div>
                  {vehicle.destination !== 'N/A' && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Navigation className="w-4 h-4" />
                      <span className="truncate">To: {vehicle.destination}</span>
                      <span className="text-xs text-slate-500">ETA: {vehicle.eta}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSTracking;