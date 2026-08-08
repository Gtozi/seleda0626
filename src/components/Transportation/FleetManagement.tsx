import React, { useState } from 'react';
import { 
  Car,
  Search,
  Filter,
  Gauge,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Fuel,
  Wrench,
  Plus,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';

const FleetManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fleet = [
    {
      id: 'VH-001',
      category: 'Sedan',
      make: 'Toyota',
      model: 'Camry',
      year: 2023,
      plate: 'ABC-1234',
      status: 'Active',
      location: 'Hotel Garage',
      driver: 'Elena R.',
      fuelLevel: 85,
      mileage: 45230,
      lastService: '2026-06-15',
      nextService: '2026-09-15',
      utilization: 78,
      condition: 'Good'
    },
    {
      id: 'VH-002',
      category: 'SUV',
      make: 'Ford',
      model: 'Explorer',
      year: 2022,
      plate: 'DEF-5678',
      status: 'Active',
      location: 'Hotel Garage',
      driver: 'Mike T.',
      fuelLevel: 92,
      mileage: 67890,
      lastService: '2026-06-20',
      nextService: '2026-09-20',
      utilization: 85,
      condition: 'Good'
    },
    {
      id: 'VH-003',
      category: 'Sedan',
      make: 'Honda',
      model: 'Accord',
      year: 2023,
      plate: 'GHI-9012',
      status: 'In Use',
      location: 'JFK Airport',
      driver: 'John D.',
      fuelLevel: 45,
      mileage: 38450,
      lastService: '2026-06-10',
      nextService: '2026-09-10',
      utilization: 92,
      condition: 'Good'
    },
    {
      id: 'VH-004',
      category: 'Van',
      make: 'Mercedes',
      model: 'Sprinter',
      year: 2021,
      plate: 'JKL-3456',
      status: 'Active',
      location: 'Hotel Garage',
      driver: 'Carlos M.',
      fuelLevel: 78,
      mileage: 89500,
      lastService: '2026-06-25',
      nextService: '2026-09-25',
      utilization: 70,
      condition: 'Fair'
    },
    {
      id: 'VH-005',
      category: 'Luxury',
      make: 'BMW',
      model: '7 Series',
      year: 2024,
      plate: 'MNO-7890',
      status: 'Maintenance',
      location: 'Service Center',
      driver: 'Unassigned',
      fuelLevel: 60,
      mileage: 12500,
      lastService: '2026-07-28',
      nextService: '2026-10-28',
      utilization: 0,
      condition: 'Service Required'
    },
    {
      id: 'VH-006',
      category: 'Electric',
      make: 'Tesla',
      model: 'Model S',
      year: 2023,
      plate: 'PQR-2345',
      status: 'Active',
      location: 'Hotel Garage',
      driver: 'Sarah L.',
      fuelLevel: 88,
      mileage: 28750,
      lastService: '2026-06-18',
      nextService: '2026-12-18',
      utilization: 82,
      condition: 'Excellent'
    },
    {
      id: 'VH-007',
      category: 'Minibus',
      make: 'Ford',
      model: 'Transit',
      year: 2022,
      plate: 'STU-6789',
      status: 'In Use',
      location: 'Convention Center',
      driver: 'David L.',
      fuelLevel: 35,
      mileage: 56780,
      lastService: '2026-06-22',
      nextService: '2026-09-22',
      utilization: 88,
      condition: 'Good'
    },
    {
      id: 'VH-008',
      category: 'Sedan',
      make: 'Chevrolet',
      model: 'Malibu',
      year: 2022,
      plate: 'VWX-0123',
      status: 'Active',
      location: 'Hotel Garage',
      driver: 'Available',
      fuelLevel: 45,
      mileage: 72340,
      lastService: '2026-06-12',
      nextService: '2026-09-12',
      utilization: 65,
      condition: 'Fair'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'In Use': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Maintenance': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'Out of Service': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Excellent': return 'bg-emerald-500 text-white';
      case 'Good': return 'bg-blue-500 text-white';
      case 'Fair': return 'bg-amber-500 text-white';
      case 'Service Required': return 'bg-rose-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getFuelColor = (level: number) => {
    if (level >= 50) return 'bg-emerald-500';
    if (level >= 25) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const filteredFleet = fleet.filter(vehicle => {
    const matchesSearch = vehicle.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || vehicle.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const fleetStats = {
    total: fleet.length,
    active: fleet.filter(v => v.status === 'Active').length,
    inUse: fleet.filter(v => v.status === 'In Use').length,
    maintenance: fleet.filter(v => v.status === 'Maintenance').length,
    avgUtilization: Math.round(fleet.reduce((sum, v) => sum + v.utilization, 0) / fleet.length),
    serviceDue: fleet.filter(v => new Date(v.nextService) <= new Date('2026-08-15')).length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fleet Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Complete fleet overview and vehicle status</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          Add Vehicle
        </button>
      </div>

      {/* Fleet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Car className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Fleet</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fleetStats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fleetStats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Gauge className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">In Use</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fleetStats.inUse}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Wrench className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Maintenance</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fleetStats.maintenance}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Gauge className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg Utilization</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fleetStats.avgUtilization}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Service Due</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{fleetStats.serviceDue}</p>
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
                placeholder="Search by ID, make, model, or plate..."
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
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Out of Service">Out of Service</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            <option value="Sedan">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="Van">Van</option>
            <option value="Luxury">Luxury</option>
            <option value="Electric">Electric</option>
            <option value="Minibus">Minibus</option>
          </select>
        </div>
      </div>

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredFleet.map((vehicle) => (
          <div key={vehicle.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 dark:text-white">{vehicle.id}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">{vehicle.make} {vehicle.model}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{vehicle.year} • {vehicle.category}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(vehicle.condition)}`}>
                {vehicle.condition}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Plate</span>
                <span className="font-medium text-slate-900 dark:text-white">{vehicle.plate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Driver</span>
                <span className="font-medium text-slate-900 dark:text-white">{vehicle.driver}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Location</span>
                <span className="font-medium text-slate-900 dark:text-white">{vehicle.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Mileage</span>
                <span className="font-medium text-slate-900 dark:text-white">{vehicle.mileage.toLocaleString()} km</span>
              </div>
            </div>

            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Fuel Level</span>
                <span className="font-medium text-slate-900 dark:text-white">{vehicle.fuelLevel}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getFuelColor(vehicle.fuelLevel)}`}
                  style={{ width: `${vehicle.fuelLevel}%` }}
                />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Gauge className="w-3 h-3" />
                Utilization: {vehicle.utilization}%
              </div>
              <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                Next: {vehicle.nextService.split('-')[1]}/{vehicle.nextService.split('-')[2]}
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                <Eye className="w-3 h-3" />
                View
              </button>
              <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                <Edit className="w-4 h-4" />
              </button>
              <button className="p-1 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded">
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FleetManagement;