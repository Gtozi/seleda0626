import React, { useState } from 'react';
import { 
  Route,
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Clock,
  Navigation,
  DollarSign,
  AlertTriangle
} from 'lucide-react';

const RouteManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const routes = [
    {
      id: 'RT-001',
      name: 'Hotel to JFK Airport',
      type: 'Standard Route',
      category: 'Airport Transfer',
      startPoint: 'Hotel Main Entrance',
      endPoint: 'JFK Airport - Terminal 4',
      distance: 25,
      estimatedTime: 45,
      tollCost: 15.00,
      fuelCost: 12.50,
      status: 'Active',
      frequentStops: ['Midtown Tunnel', 'Van Wyck Expressway']
    },
    {
      id: 'RT-002',
      name: 'Hotel to LGA Airport',
      type: 'Standard Route',
      category: 'Airport Transfer',
      startPoint: 'Hotel Main Entrance',
      endPoint: 'LGA Airport - Terminal B',
      distance: 18,
      estimatedTime: 35,
      tollCost: 8.50,
      fuelCost: 9.00,
      status: 'Active',
      frequentStops: ['Grand Central Parkway', 'LaGuardia Access Road']
    },
    {
      id: 'RT-003',
      name: 'Hotel to Times Square',
      type: 'Standard Route',
      category: 'City Transfer',
      startPoint: 'Hotel Main Entrance',
      endPoint: 'Times Square',
      distance: 5,
      estimatedTime: 20,
      tollCost: 0.00,
      fuelCost: 3.50,
      status: 'Active',
      frequentStops: ['5th Avenue', 'Rockefeller Center']
    },
    {
      id: 'RT-004',
      name: 'Hotel to Convention Center',
      type: 'Standard Route',
      category: 'Corporate Transfer',
      startPoint: 'Hotel Main Entrance',
      endPoint: 'Javits Convention Center',
      distance: 8,
      estimatedTime: 25,
      tollCost: 5.00,
      fuelCost: 5.50,
      status: 'Active',
      frequentStops: ['Hudson Yards', 'West Side Highway']
    },
    {
      id: 'RT-005',
      name: 'Shopping District Tour',
      type: 'Dynamic Route',
      category: 'Tour Transportation',
      startPoint: 'Hotel Main Entrance',
      endPoint: 'Hotel Main Entrance',
      distance: 15,
      estimatedTime: 120,
      tollCost: 0.00,
      fuelCost: 10.00,
      status: 'Active',
      frequentStops: ['Fifth Avenue', 'Madison Avenue', 'SoHo']
    },
    {
      id: 'RT-006',
      name: 'Hotel to Wall Street',
      type: 'Standard Route',
      category: 'Corporate Transfer',
      startPoint: 'Hotel VIP Entrance',
      endPoint: 'Wall Street',
      distance: 12,
      estimatedTime: 30,
      tollCost: 12.00,
      fuelCost: 7.50,
      status: 'Inactive',
      frequentStops: ['Brooklyn Bridge', 'Financial District']
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Inactive': return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
      case 'Seasonal': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.endPoint.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || route.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Route Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Standard routes, dynamic routing, and optimization</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Route
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Route className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Routes</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{routes.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <Navigation className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Routes</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{routes.filter(r => r.status === 'Active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Distance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{routes.reduce((sum, r) => sum + r.distance, 0)} km</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Toll Cost</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">${(routes.reduce((sum, r) => sum + r.tollCost, 0) / routes.length).toFixed(2)}</p>
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
                placeholder="Search by name, ID, or location..."
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
            <option value="Standard Route">Standard Route</option>
            <option value="Dynamic Route">Dynamic Route</option>
            <option value="Express Route">Express Route</option>
          </select>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Distance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Est. Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Toll Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fuel Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredRoutes.map((route) => (
                <tr key={route.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">{route.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{route.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{route.type} • {route.category}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {route.startPoint} → {route.endPoint}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{route.distance} km</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {route.estimatedTime} min
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">${route.tollCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">${route.fuelCost.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(route.status)}`}>
                      {route.status}
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

export default RouteManagement;