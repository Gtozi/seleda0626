import React, { useState } from 'react';
import { 
  Settings,
  Car,
  MapPin,
  Users,
  Fuel,
  Clock,
  Save,
  Plus,
  Edit,
  Trash2,
  CheckCircle2
} from 'lucide-react';

const TransportationConfiguration: React.FC = () => {
  const [activeTab, setActiveTab] = useState('transportation');

  const transportationTypes = [
    { id: 1, name: 'Airport Pickup', active: true, baseRate: 85.00 },
    { id: 2, name: 'Airport Drop-off', active: true, baseRate: 95.00 },
    { id: 3, name: 'City Transfer', active: true, baseRate: 45.00 },
    { id: 4, name: 'Hotel Shuttle', active: true, baseRate: 0.00 },
    { id: 5, name: 'Sightseeing Tour', active: true, baseRate: 180.00 },
    { id: 6, name: 'VIP Transport', active: true, baseRate: 350.00 },
    { id: 7, name: 'Staff Shuttle', active: true, baseRate: 0.00 },
    { id: 8, name: 'Courier Service', active: false, baseRate: 35.00 },
  ];

  const serviceAreas = [
    { id: 1, name: 'Manhattan', active: true, description: 'Primary service area' },
    { id: 2, name: 'Brooklyn', active: true, description: 'Secondary service area' },
    { id: 3, name: 'Queens', active: true, description: 'Airport service area' },
    { id: 4, name: 'Bronx', active: false, description: 'Limited service' },
    { id: 5, name: 'Staten Island', active: false, description: 'On-demand only' },
  ];

  const vehicleCategories = [
    { id: 1, name: 'Sedan', capacity: 4, active: true },
    { id: 2, name: 'SUV', capacity: 7, active: true },
    { id: 3, name: 'Van', capacity: 12, active: true },
    { id: 4, name: 'Minibus', capacity: 20, active: true },
    { id: 5, name: 'Luxury', capacity: 4, active: true },
    { id: 6, name: 'Electric', capacity: 5, active: true },
    { id: 7, name: 'Shuttle Bus', capacity: 30, active: true },
  ];

  const fuelTypes = [
    { id: 1, name: 'Gasoline', active: true },
    { id: 2, name: 'Diesel', active: true },
    { id: 3, name: 'Electric', active: true },
    { id: 4, name: 'Hybrid', active: true },
  ];

  const driverGroups = [
    { id: 1, name: 'Regular Drivers', active: true },
    { id: 2, name: 'VIP Drivers', active: true },
    { id: 3, name: 'Shuttle Drivers', active: true },
    { id: 4, name: 'Contract Drivers', active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transportation Configuration</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">System settings and transportation parameters</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('transportation')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'transportation'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Transportation Types
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'service'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Service Areas
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'fleet'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Fleet Setup
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'drivers'
                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Driver Setup
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'transportation' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Transportation Types</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus className="w-4 h-4" />
                  Add Type
                </button>
              </div>
              <div className="space-y-3">
                {transportationTypes.map((type) => (
                  <div key={type.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${type.active ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <Car className={`w-5 h-5 ${type.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{type.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Base Rate: ${type.baseRate.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${type.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                        {type.active ? 'Active' : 'Inactive'}
                      </span>
                      <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'service' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Service Areas</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus className="w-4 h-4" />
                  Add Area
                </button>
              </div>
              <div className="space-y-3">
                {serviceAreas.map((area) => (
                  <div key={area.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${area.active ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <MapPin className={`w-5 h-5 ${area.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{area.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{area.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${area.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                        {area.active ? 'Active' : 'Inactive'}
                      </span>
                      <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Vehicle Categories</h3>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>
                <div className="space-y-3">
                  {vehicleCategories.map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${category.active ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                          <Car className={`w-5 h-5 ${category.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{category.name}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Capacity: {category.capacity} passengers</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${category.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                          {category.active ? 'Active' : 'Inactive'}
                        </span>
                        <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Fuel Types</h3>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4" />
                    Add Type
                  </button>
                </div>
                <div className="space-y-3">
                  {fuelTypes.map((fuel) => (
                    <div key={fuel.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${fuel.active ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                          <Fuel className={`w-5 h-5 ${fuel.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                        </div>
                        <p className="font-medium text-slate-900 dark:text-white">{fuel.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${fuel.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                          {fuel.active ? 'Active' : 'Inactive'}
                        </span>
                        <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'drivers' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Driver Groups</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  <Plus className="w-4 h-4" />
                  Add Group
                </button>
              </div>
              <div className="space-y-3">
                {driverGroups.map((group) => (
                  <div key={group.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${group.active ? 'bg-emerald-100 dark:bg-emerald-900' : 'bg-slate-200 dark:bg-slate-600'}`}>
                        <Users className={`w-5 h-5 ${group.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                      </div>
                      <p className="font-medium text-slate-900 dark:text-white">{group.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${group.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200'}`}>
                        {group.active ? 'Active' : 'Inactive'}
                      </span>
                      <button className="p-1 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransportationConfiguration;