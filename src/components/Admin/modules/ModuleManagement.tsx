import React, { useState } from 'react';
import { Layout, ToggleRight, ToggleLeft, Plus, Edit, Search, Filter, Zap, Settings, Layers } from 'lucide-react';

interface Module {
  id: string;
  name: string;
  portal: string;
  category: 'operations' | 'management' | 'reporting' | 'integration' | 'configuration';
  description: string;
  enabled: boolean;
  required: boolean;
  dependencies: string[];
  version: string;
}

const ModuleManagement: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([
    { id: '1', name: 'Reservations', portal: 'Front Office', category: 'operations', description: 'Guest reservation management', enabled: true, required: true, dependencies: [], version: '2.4.1' },
    { id: '2', name: 'Check-In', portal: 'Front Office', category: 'operations', description: 'Guest check-in process', enabled: true, required: true, dependencies: ['Reservations'], version: '2.4.1' },
    { id: '3', name: 'Check-Out', portal: 'Front Office', category: 'operations', description: 'Guest check-out process', enabled: true, required: true, dependencies: ['Check-In'], version: '2.4.1' },
    { id: '4', name: 'Cashiering', portal: 'Front Office', category: 'operations', description: 'Payment processing and billing', enabled: true, required: true, dependencies: ['Check-In', 'Check-Out'], version: '2.4.1' },
    { id: '5', name: 'Room Management', portal: 'Housekeeping', category: 'operations', description: 'Room status and assignment', enabled: true, required: true, dependencies: [], version: '1.8.3' },
    { id: '6', name: 'Task Assignment', portal: 'Housekeeping', category: 'operations', description: 'Housekeeping task distribution', enabled: true, required: true, dependencies: ['Room Management'], version: '1.8.3' },
    { id: '7', name: 'Inventory Management', portal: 'Housekeeping', category: 'management', description: 'Supplies and linen tracking', enabled: true, required: false, dependencies: [], version: '1.8.3' },
    { id: '8', name: 'Work Orders', portal: 'Engineering', category: 'operations', description: 'Maintenance request management', enabled: true, required: true, dependencies: [], version: '1.5.2' },
    { id: '9', name: 'Preventive Maintenance', portal: 'Engineering', category: 'management', description: 'Scheduled maintenance planning', enabled: true, required: false, dependencies: ['Work Orders'], version: '1.5.2' },
    { id: '10', name: 'Order Management', portal: 'Food & Beverage', category: 'operations', description: 'Food and beverage orders', enabled: true, required: true, dependencies: [], version: '2.1.0' },
    { id: '11', name: 'Table Management', portal: 'Food & Beverage', category: 'operations', description: 'Restaurant table allocation', enabled: true, required: true, dependencies: ['Order Management'], version: '2.1.0' },
    { id: '12', name: 'Kitchen Display', portal: 'Kitchen Management', category: 'operations', description: 'Kitchen order display system', enabled: true, required: true, dependencies: ['Order Management'], version: '1.3.1' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPortal, setFilterPortal] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredModules = modules.filter(module => {
    const matchesSearch = module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPortal = filterPortal === 'all' || module.portal === filterPortal;
    const matchesCategory = filterCategory === 'all' || module.category === filterCategory;
    return matchesSearch && matchesPortal && matchesCategory;
  });

  const toggleModule = (id: string) => {
    setModules(modules.map(module => 
      module.id === id 
        ? { ...module, enabled: !module.enabled }
        : module
    ));
  };

  const portals = ['Front Office', 'Housekeeping', 'Engineering', 'Food & Beverage', 'Kitchen Management'];
  const categories = [
    { id: 'operations', name: 'Operations', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'management', name: 'Management', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'reporting', name: 'Reporting', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'integration', name: 'Integration', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'configuration', name: 'Configuration', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Module Management</h1>
          <p className="text-xs text-slate-400">Configure modules within each portal without changing code</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Module
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Modules', value: modules.length, icon: Layers, color: 'text-blue-600' },
          { label: 'Enabled', value: modules.filter(m => m.enabled).length, icon: Zap, color: 'text-emerald-600' },
          { label: 'Required', value: modules.filter(m => m.required).length, icon: Settings, color: 'text-purple-600' },
          { label: 'Portals', value: [...new Set(modules.map(m => m.portal))].length, icon: Layout, color: 'text-amber-600' },
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

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterPortal}
              onChange={(e) => setFilterPortal(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Portals</option>
              {portals.map(portal => (
                <option key={portal} value={portal}>{portal}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Modules Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Portal</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Dependencies</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Required</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredModules.map((module) => {
                const category = categories.find(c => c.id === module.category);
                return (
                  <tr key={module.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Layout size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{module.name}</div>
                          <div className="text-xs text-slate-500">{module.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{module.portal}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${category?.color}`}>
                        {category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{module.version}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {module.dependencies.length === 0 ? (
                          <span className="text-xs text-slate-400">None</span>
                        ) : (
                          module.dependencies.map((dep, index) => (
                            <span key={index} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                              {dep}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {module.required ? (
                        <span className="px-2 py-1 bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 rounded-full text-[10px] font-bold">
                          Required
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400 rounded-full text-[10px] font-bold">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => !module.required && toggleModule(module.id)}
                        disabled={module.required}
                        className={`p-2 rounded-lg transition-colors ${module.required ? 'cursor-not-allowed opacity-50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        {module.enabled ? (
                          <ToggleRight size={20} className="text-emerald-500" />
                        ) : (
                          <ToggleLeft size={20} className="text-slate-400" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Settings size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Edit size={16} className="text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module Categories Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Module Categories</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((category) => (
            <div key={category.id} className={`p-3 rounded-xl ${category.color} flex flex-col items-center justify-center`}>
              <Layout size={20} className="mb-2" />
              <span className="text-xs font-bold">{category.name}</span>
              <span className="text-[10px] opacity-75">{modules.filter(m => m.category === category.id).length} modules</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModuleManagement;