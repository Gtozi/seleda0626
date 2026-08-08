/**
 * Thermal & Hydro Facilities Module
 * Manages sauna, steam room, jacuzzi, hydrotherapy pool, and thermal facilities
 */

import { useState } from 'react';
import {
  Droplets,
  Plus,
  Search,
  Edit,
  Trash2,
  Thermometer,
  Clock,
  Users,
  CheckCircle2,
  MoreVertical,
  Wrench,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

interface ThermalFacility {
  id: string;
  name: string;
  type: 'Sauna' | 'Steam Room' | 'Jacuzzi' | 'Hydrotherapy Pool' | 'Cold Plunge' | 'Relaxation Lounge';
  status: 'Available' | 'In Use' | 'Maintenance' | 'Cleaning';
  capacity: number;
  currentOccupancy: number;
  temperature: number;
  targetTemperature: number;
  lastCleaning: string;
  nextMaintenance: string;
  features: string[];
}

const ThermalHydroFacilitiesModule: React.FC = () => {
  const [facilities, setFacilities] = useState<ThermalFacility[]>([
    {
      id: 'THM-001',
      name: 'Finnish Sauna',
      type: 'Sauna',
      status: 'In Use',
      capacity: 8,
      currentOccupancy: 5,
      temperature: 85,
      targetTemperature: 85,
      lastCleaning: '2026-07-31T06:00:00',
      nextMaintenance: '2026-08-15',
      features: ['Wood Interior', 'Temperature Control', 'Aromatherapy', 'LED Lighting']
    },
    {
      id: 'THM-002',
      name: 'Steam Room',
      type: 'Steam Room',
      status: 'Available',
      capacity: 10,
      currentOccupancy: 0,
      temperature: 45,
      targetTemperature: 45,
      lastCleaning: '2026-07-31T07:00:00',
      nextMaintenance: '2026-08-10',
      features: ['Eucalyptus Scent', 'Humidity Control', 'Ambient Lighting', 'Music System']
    },
    {
      id: 'THM-003',
      name: 'Outdoor Jacuzzi',
      type: 'Jacuzzi',
      status: 'In Use',
      capacity: 12,
      currentOccupancy: 8,
      temperature: 38,
      targetTemperature: 39,
      lastCleaning: '2026-07-31T05:00:00',
      nextMaintenance: '2026-08-05',
      features: ['Jets', 'LED Lighting', 'Temperature Control', 'Privacy Screens']
    },
    {
      id: 'THM-004',
      name: 'Hydrotherapy Pool',
      type: 'Hydrotherapy Pool',
      status: 'Available',
      capacity: 6,
      currentOccupancy: 0,
      temperature: 34,
      targetTemperature: 34,
      lastCleaning: '2026-07-31T08:00:00',
      nextMaintenance: '2026-08-20',
      features: ['Massage Jets', 'Counter-Current', 'Temperature Zones', 'Accessibility Lift']
    },
    {
      id: 'THM-005',
      name: 'Cold Plunge Pool',
      type: 'Cold Plunge',
      status: 'Available',
      capacity: 4,
      currentOccupancy: 0,
      temperature: 10,
      targetTemperature: 10,
      lastCleaning: '2026-07-31T08:00:00',
      nextMaintenance: '2026-08-12',
      features: ['Temperature Control', 'Non-Slip Surface', 'Handrails']
    },
    {
      id: 'THM-006',
      name: 'Relaxation Lounge',
      type: 'Relaxation Lounge',
      status: 'Available',
      capacity: 20,
      currentOccupancy: 3,
      temperature: 22,
      targetTemperature: 22,
      lastCleaning: '2026-07-31T09:00:00',
      nextMaintenance: '2026-08-01',
      features: ['Comfortable Seating', 'Herbal Tea Station', 'Reading Materials', 'Ambient Music']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showNewFacilityModal, setShowNewFacilityModal] = useState(false);

  const facilityTypes = ['All', 'Sauna', 'Steam Room', 'Jacuzzi', 'Hydrotherapy Pool', 'Cold Plunge', 'Relaxation Lounge'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'In Use':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Maintenance':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Cleaning':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Sauna': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400',
      'Steam Room': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400',
      'Jacuzzi': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Hydrotherapy Pool': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400',
      'Cold Plunge': 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-900/20 dark:border-sky-700/50 dark:text-sky-400',
      'Relaxation Lounge': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || facility.status === statusFilter;
    const matchesType = typeFilter === 'All' || facility.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (facilityId: string, newStatus: ThermalFacility['status']) => {
    setFacilities(facilities.map(facility =>
      facility.id === facilityId ? { ...facility, status: newStatus } : facility
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Thermal & Hydro Facilities</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage thermal facilities, capacity, cleaning, and maintenance
          </p>
        </div>
        <button
          onClick={() => setShowNewFacilityModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Add Facility
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Available">Available</option>
            <option value="In Use">In Use</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Cleaning">Cleaning</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {facilityTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Facilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <Droplets size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{facility.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{facility.id}</p>
                </div>
              </div>
              <select
                value={facility.status}
                onChange={(e) => handleStatusChange(facility.id, e.target.value as ThermalFacility['status'])}
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(facility.status)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="Available">Available</option>
                <option value="In Use">In Use</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Cleaning">Cleaning</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(facility.type)}`}>
                {facility.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white">
                  <Thermometer size={14} />
                  <span className="font-semibold">{facility.temperature}°C</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Current</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="flex items-center justify-center gap-1 text-slate-900 dark:text-white">
                  <Users size={14} />
                  <span className="font-semibold">{facility.currentOccupancy}/{facility.capacity}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Occupancy</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Wrench size={14} />
                <span>Next maintenance: {new Date(facility.nextMaintenance).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock size={14} />
                <span>Last cleaned: {new Date(facility.lastCleaning).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-1">
                {facility.features.slice(0, 2).map((feature, index) => (
                  <span key={index} className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400 rounded text-xs">
                    {feature}
                  </span>
                ))}
                {facility.features.length > 2 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400 rounded text-xs">
                    +{facility.features.length - 2}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <TrendingUp size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Facility Modal Placeholder */}
      {showNewFacilityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Thermal Facility</h2>
              <button
                onClick={() => setShowNewFacilityModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Thermal facility creation form would be implemented here with facility type, capacity, temperature settings, and feature configuration.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewFacilityModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Add Facility
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThermalHydroFacilitiesModule;