import React, { useState } from 'react';
import { Database, Plus, Edit, Search, Filter, Globe, MapPin, DollarSign, Languages, Utensils, Users, Building, Car, Package } from 'lucide-react';

interface MasterDataCategory {
  id: string;
  name: string;
  icon: any;
  itemCount: number;
  description: string;
  lastUpdated: string;
}

const MasterDataManagement: React.FC = () => {
  const [categories, setCategories] = useState<MasterDataCategory[]>([
    { id: '1', name: 'Countries', icon: Globe, itemCount: 195, description: 'Country codes and information', lastUpdated: '2024-01-15' },
    { id: '2', name: 'Cities', icon: MapPin, itemCount: 1520, description: 'City and location data', lastUpdated: '2024-01-14' },
    { id: '3', name: 'Currencies', icon: DollarSign, itemCount: 180, description: 'Currency codes and exchange rates', lastUpdated: '2024-01-15' },
    { id: '4', name: 'Languages', icon: Languages, itemCount: 45, description: 'Language and locale data', lastUpdated: '2024-01-10' },
    { id: '5', name: 'Taxes', icon: DollarSign, itemCount: 120, description: 'Tax rates and configurations', lastUpdated: '2024-01-12' },
    { id: '6', name: 'Payment Methods', icon: DollarSign, itemCount: 25, description: 'Payment method configurations', lastUpdated: '2024-01-08' },
    { id: '7', name: 'Room Types', icon: Building, itemCount: 35, description: 'Room type definitions', lastUpdated: '2024-01-13' },
    { id: '8', name: 'Room Classes', icon: Building, itemCount: 12, description: 'Room class categories', lastUpdated: '2024-01-11' },
    { id: '9', name: 'Amenities', icon: Package, itemCount: 150, description: 'Property amenities', lastUpdated: '2024-01-09' },
    { id: '10', name: 'Meal Plans', icon: Utensils, itemCount: 18, description: 'Meal plan options', lastUpdated: '2024-01-07' },
    { id: '11', name: 'Market Segments', icon: Users, itemCount: 25, description: 'Market segment definitions', lastUpdated: '2024-01-06' },
    { id: '12', name: 'Source Codes', icon: Globe, itemCount: 45, description: 'Booking source codes', lastUpdated: '2024-01-05' },
    { id: '13', name: 'Nationalities', icon: Globe, itemCount: 180, description: 'Nationality information', lastUpdated: '2024-01-04' },
    { id: '14', name: 'Titles', icon: Users, itemCount: 15, description: 'Guest title options', lastUpdated: '2024-01-03' },
    { id: '15', name: 'Guest Types', icon: Users, itemCount: 20, description: 'Guest type classifications', lastUpdated: '2024-01-02' },
    { id: '16', name: 'Vehicle Types', icon: Car, itemCount: 12, description: 'Transportation vehicle types', lastUpdated: '2024-01-01' },
    { id: '17', name: 'Supplier Categories', icon: Package, itemCount: 30, description: 'Supplier classification', lastUpdated: '2023-12-28' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = categories.filter(category => {
    return category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           category.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Master Data Management</h1>
          <p className="text-xs text-slate-400">Centralize shared data across the entire ERP ecosystem</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Category
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Categories', value: categories.length, icon: Database, color: 'text-blue-600' },
          { label: 'Total Records', value: categories.reduce((sum, c) => sum + c.itemCount, 0).toLocaleString(), icon: Database, color: 'text-emerald-600' },
          { label: 'Recently Updated', value: categories.filter(c => new Date(c.lastUpdated) > new Date('2024-01-10')).length, icon: Edit, color: 'text-purple-600' },
          { label: 'Data Quality', value: '98.5%', icon: Database, color: 'text-amber-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search master data categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Master Data Categories */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Master Data Categories</h3>
            <p className="text-xs text-slate-400">Shared reference data</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <div key={category.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{category.name}</h4>
                      <span className="text-xs text-slate-500">{category.itemCount.toLocaleString()} items</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 mb-4">{category.description}</p>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Updated: {category.lastUpdated}</span>
                  <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    View Data
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Quality Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Data Quality Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Completeness', value: '99.2%', color: 'bg-emerald-500' },
            { label: 'Accuracy', value: '98.8%', color: 'bg-blue-500' },
            { label: 'Consistency', value: '97.5%', color: 'bg-purple-500' },
            { label: 'Timeliness', value: '95.3%', color: 'bg-amber-500' },
          ].map((metric, index) => (
            <div key={index} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">{metric.label}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className={`${metric.color} h-2 rounded-full`} 
                    style={{ width: metric.value }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{metric.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterDataManagement;