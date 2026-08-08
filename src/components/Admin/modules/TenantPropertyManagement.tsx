import React, { useState } from 'react';
import { Building2, MapPin, DollarSign, Calendar, Globe, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  type: 'hotel' | 'resort' | 'villa' | 'apartment';
  group: string;
  brand: string;
  location: string;
  currency: string;
  timezone: string;
  status: 'active' | 'inactive' | 'maintenance';
}

const TenantPropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([
    { id: '1', name: 'Grand Hotel Paris', type: 'hotel', group: 'Luxury Hotels', brand: 'Grand Collection', location: 'Paris, France', currency: 'EUR', timezone: 'Europe/Paris', status: 'active' },
    { id: '2', name: 'Seaside Resort', type: 'resort', group: 'Beach Properties', brand: 'Coastal Resorts', location: 'Malibu, California', currency: 'USD', timezone: 'America/Los_Angeles', status: 'active' },
    { id: '3', name: 'Mountain Villa', type: 'villa', group: 'Mountain Retreats', brand: 'Alpine Properties', location: 'Aspen, Colorado', currency: 'USD', timezone: 'America/Denver', status: 'active' },
    { id: '4', name: 'City Apartments', type: 'apartment', group: 'Urban Living', brand: 'Metro Stays', location: 'New York, NY', currency: 'USD', timezone: 'America/New_York', status: 'maintenance' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || property.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const propertyTypes = ['hotel', 'resort', 'villa', 'apartment'];
  const groups = ['Luxury Hotels', 'Beach Properties', 'Mountain Retreats', 'Urban Living'];
  const brands = ['Grand Collection', 'Coastal Resorts', 'Alpine Properties', 'Metro Stays'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'maintenance': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Tenant & Property Management</h1>
          <p className="text-xs text-slate-400">Manage hotel groups, brands, properties, resorts, villas, and apartments</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          Add Property
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Properties', value: properties.length, icon: Building2, color: 'text-blue-600' },
          { label: 'Active Properties', value: properties.filter(p => p.status === 'active').length, icon: Building2, color: 'text-emerald-600' },
          { label: 'Hotel Groups', value: groups.length, icon: Building2, color: 'text-purple-600' },
          { label: 'Brands', value: brands.length, icon: Building2, color: 'text-amber-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center shrink-0`}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              {propertyTypes.map(type => (
                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Property</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Group/Brand</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Currency</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredProperties.map((property) => (
                <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{property.name}</div>
                        <div className="text-xs text-slate-500">{property.timezone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 capitalize">
                      {property.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 dark:text-white">{property.group}</div>
                    <div className="text-xs text-slate-500">{property.brand}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <MapPin size={14} />
                      {property.location}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <DollarSign size={14} />
                      {property.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(property.status)}`}>
                      {property.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Edit size={16} className="text-slate-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <Trash2 size={16} className="text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Hierarchy Visualization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Property Hierarchy</h3>
            <p className="text-xs text-slate-400">Multi-level property structure</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="px-6 py-4 bg-indigo-100 dark:bg-indigo-900/20 rounded-2xl">
            <div className="text-sm font-bold text-indigo-800 dark:text-indigo-400">Hotel Groups</div>
            <div className="text-xs text-indigo-600 dark:text-indigo-500 mt-1">{groups.length} Groups</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="px-6 py-4 bg-purple-100 dark:bg-purple-900/20 rounded-2xl">
            <div className="text-sm font-bold text-purple-800 dark:text-purple-400">Brands</div>
            <div className="text-xs text-purple-600 dark:text-purple-500 mt-1">{brands.length} Brands</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="px-6 py-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-2xl">
            <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">Properties</div>
            <div className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">{properties.length} Properties</div>
          </div>
          <div className="text-slate-400">→</div>
          <div className="px-6 py-4 bg-amber-100 dark:bg-amber-900/20 rounded-2xl">
            <div className="text-sm font-bold text-amber-800 dark:text-amber-400">Units</div>
            <div className="text-xs text-amber-600 dark:text-amber-500 mt-1">Resorts/Villas/Apartments</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TenantPropertyManagement;