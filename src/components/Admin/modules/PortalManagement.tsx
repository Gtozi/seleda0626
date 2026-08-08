import React, { useState } from 'react';
import { Globe, Layout, Settings, ToggleRight, ToggleLeft, Zap, AlertTriangle, CheckCircle, XCircle, Plus, Edit, Search, Filter } from 'lucide-react';

interface Portal {
  id: string;
  name: string;
  category: 'guest_services' | 'rooms_division' | 'commercial' | 'food_beverage' | 'wellness' | 'back_office' | 'operations' | 'executive' | 'platform';
  version: string;
  status: 'operational' | 'maintenance' | 'degraded' | 'offline';
  enabled: boolean;
  dependencies: string[];
  defaultLandingPage: string;
  lastUpdated: string;
}

const PortalManagement: React.FC = () => {
  const [portals, setPortals] = useState<Portal[]>([
    { id: '1', name: 'Front Office (PMS)', category: 'guest_services', version: '2.4.1', status: 'operational', enabled: true, dependencies: ['Master Data', 'User Management'], defaultLandingPage: 'Dashboard', lastUpdated: '2024-01-15' },
    { id: '2', name: 'Housekeeping', category: 'rooms_division', version: '1.8.3', status: 'operational', enabled: true, dependencies: ['Front Office'], defaultLandingPage: 'Task Board', lastUpdated: '2024-01-14' },
    { id: '3', name: 'Engineering & Maintenance', category: 'rooms_division', version: '1.5.2', status: 'operational', enabled: true, dependencies: ['Front Office'], defaultLandingPage: 'Work Orders', lastUpdated: '2024-01-13' },
    { id: '4', name: 'Food & Beverage', category: 'food_beverage', version: '2.1.0', status: 'operational', enabled: true, dependencies: ['Master Data', 'POS Management'], defaultLandingPage: 'Orders', lastUpdated: '2024-01-15' },
    { id: '5', name: 'Kitchen Management', category: 'food_beverage', version: '1.3.1', status: 'operational', enabled: true, dependencies: ['Food & Beverage'], defaultLandingPage: 'KDS', lastUpdated: '2024-01-12' },
    { id: '6', name: 'Concierge', category: 'guest_services', version: '1.9.0', status: 'operational', enabled: true, dependencies: ['Front Office'], defaultLandingPage: 'Services', lastUpdated: '2024-01-14' },
    { id: '7', name: 'Guest Portal', category: 'guest_services', version: '3.0.2', status: 'operational', enabled: true, dependencies: ['Front Office', 'Booking Engine'], defaultLandingPage: 'Home', lastUpdated: '2024-01-15' },
    { id: '8', name: 'Public Booking Portal', category: 'guest_services', version: '2.8.1', status: 'degraded', enabled: true, dependencies: ['Master Data', 'Channel Manager'], defaultLandingPage: 'Search', lastUpdated: '2024-01-10' },
    { id: '9', name: 'Spa & Wellness', category: 'wellness', version: '1.6.0', status: 'operational', enabled: true, dependencies: ['Front Office'], defaultLandingPage: 'Bookings', lastUpdated: '2024-01-11' },
    { id: '10', name: 'Sales & CRM', category: 'commercial', version: '2.2.3', status: 'operational', enabled: true, dependencies: ['Master Data'], defaultLandingPage: 'Dashboard', lastUpdated: '2024-01-13' },
    { id: '11', name: 'Banquet & Events', category: 'commercial', version: '1.7.2', status: 'operational', enabled: true, dependencies: ['Front Office', 'Sales CRM'], defaultLandingPage: 'Events', lastUpdated: '2024-01-12' },
    { id: '12', name: 'Transportation', category: 'operations', version: '1.4.1', status: 'operational', enabled: true, dependencies: ['Front Office'], defaultLandingPage: 'Fleet', lastUpdated: '2024-01-09' },
    { id: '13', name: 'Finance & Accounting', category: 'back_office', version: '2.5.0', status: 'operational', enabled: true, dependencies: ['Master Data', 'POS Management'], defaultLandingPage: 'Dashboard', lastUpdated: '2024-01-15' },
    { id: '14', name: 'Human Resources', category: 'back_office', version: '1.9.2', status: 'operational', enabled: true, dependencies: ['User Management'], defaultLandingPage: 'Employees', lastUpdated: '2024-01-14' },
    { id: '15', name: 'Security & Risk', category: 'operations', version: '1.3.0', status: 'maintenance', enabled: true, dependencies: ['Front Office'], defaultLandingPage: 'Incidents', lastUpdated: '2024-01-08' },
    { id: '16', name: 'Executive BI', category: 'executive', version: '3.1.0', status: 'operational', enabled: true, dependencies: ['All Portals'], defaultLandingPage: 'Dashboard', lastUpdated: '2024-01-15' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredPortals = portals.filter(portal => {
    const matchesSearch = portal.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || portal.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || portal.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const togglePortal = (id: string) => {
    setPortals(portals.map(portal => 
      portal.id === id 
        ? { ...portal, enabled: !portal.enabled }
        : portal
    ));
  };

  const categories = [
    { id: 'guest_services', name: 'Guest Services', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'rooms_division', name: 'Rooms Division', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'commercial', name: 'Commercial', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'food_beverage', name: 'Food & Beverage', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'wellness', name: 'Wellness', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400' },
    { id: 'back_office', name: 'Back Office', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'operations', name: 'Operations', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'executive', name: 'Executive', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
    { id: 'platform', name: 'Platform', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'maintenance': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'degraded': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400';
      case 'offline': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle size={16} />;
      case 'maintenance': return <AlertTriangle size={16} />;
      case 'degraded': return <Zap size={16} />;
      case 'offline': return <XCircle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Portal Management</h1>
          <p className="text-xs text-slate-400">Manage every ERP portal: Front Office, Housekeeping, Engineering, F&B, Concierge, Guest Portal, Public Booking, Spa, Sales CRM, Banquet, Transportation, Finance, HR, Security, Operations, Executive BI</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Portal
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Portals', value: portals.length, icon: Globe, color: 'text-blue-600' },
          { label: 'Operational', value: portals.filter(p => p.status === 'operational').length, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'In Maintenance', value: portals.filter(p => p.status === 'maintenance').length, icon: AlertTriangle, color: 'text-amber-600' },
          { label: 'Enabled', value: portals.filter(p => p.enabled).length, icon: Zap, color: 'text-purple-600' },
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
              placeholder="Search portals..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
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
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="operational">Operational</option>
              <option value="maintenance">Maintenance</option>
              <option value="degraded">Degraded</option>
              <option value="offline">Offline</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Portals Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Portal Configuration</h3>
            <p className="text-xs text-slate-400">Enable/Disable, Version, Dependencies, Maintenance Mode, Default Landing Page, Navigation Configuration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPortals.map((portal) => {
            const category = categories.find(c => c.id === portal.category);
            return (
              <div key={portal.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Globe size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{portal.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${category?.color}`}>
                        {category?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => togglePortal(portal.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {portal.enabled ? (
                      <ToggleRight size={20} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={20} className="text-slate-400" />
                    )}
                  </button>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Version</span>
                    <span className="font-bold text-slate-900 dark:text-white">{portal.version}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Status</span>
                    <span className={`flex items-center gap-1 font-bold ${getStatusColor(portal.status)}`}>
                      {getStatusIcon(portal.status)}
                      {portal.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Landing Page</span>
                    <span className="font-bold text-slate-900 dark:text-white">{portal.defaultLandingPage}</span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Dependencies</div>
                  <div className="flex flex-wrap gap-1">
                    {portal.dependencies.slice(0, 2).map((dep, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                        {dep}
                      </span>
                    ))}
                    {portal.dependencies.length > 2 && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                        +{portal.dependencies.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">Updated: {portal.lastUpdated}</span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Layout size={16} className="text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Settings size={16} className="text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Portal Categories Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Portal Categories</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {categories.map((category) => (
            <div key={category.id} className={`p-3 rounded-xl ${category.color} flex flex-col items-center justify-center`}>
              <Globe size={20} className="mb-2" />
              <span className="text-xs font-bold">{category.name}</span>
              <span className="text-[10px] opacity-75">{portals.filter(p => p.category === category.id).length} portals</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortalManagement;