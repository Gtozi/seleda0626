import React, { useState } from 'react';
import { Link, Plus, Edit, Search, Filter, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  type: 'payment_gateway' | 'door_lock' | 'pos' | 'channel_manager' | 'crs' | 'ota' | 'accounting' | 'government' | 'passport_scanner' | 'id_reader' | 'pbx' | 'iptv' | 'iot' | 'energy' | 'bms';
  provider: string;
  status: 'connected' | 'disconnected' | 'error' | 'maintenance';
  lastSync: string;
  dataFlow: 'bidirectional' | 'inbound' | 'outbound';
}

const IntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: '1', name: 'Stripe Payment Gateway', type: 'payment_gateway', provider: 'Stripe', status: 'connected', lastSync: '2024-01-15 14:30', dataFlow: 'bidirectional' },
    { id: '2', name: 'Door Lock System', type: 'door_lock', provider: 'Assa Abloy', status: 'connected', lastSync: '2024-01-15 14:28', dataFlow: 'bidirectional' },
    { id: '3', name: 'POS System', type: 'pos', provider: 'Micros', status: 'connected', lastSync: '2024-01-15 14:25', dataFlow: 'bidirectional' },
    { id: '4', name: 'Channel Manager', type: 'channel_manager', provider: 'SiteMinder', status: 'connected', lastSync: '2024-01-15 14:20', dataFlow: 'bidirectional' },
    { id: '5', name: 'CRS', type: 'crs', provider: 'Sabre', status: 'connected', lastSync: '2024-01-15 14:15', dataFlow: 'bidirectional' },
    { id: '6', name: 'Booking.com OTA', type: 'ota', provider: 'Booking.com', status: 'connected', lastSync: '2024-01-15 14:10', dataFlow: 'bidirectional' },
    { id: '7', name: 'Expedia OTA', type: 'ota', provider: 'Expedia', status: 'error', lastSync: '2024-01-15 13:45', dataFlow: 'bidirectional' },
    { id: '8', name: 'SAP Accounting', type: 'accounting', provider: 'SAP', status: 'connected', lastSync: '2024-01-15 14:00', dataFlow: 'bidirectional' },
    { id: '9', name: 'Government Tax System', type: 'government', provider: 'GovTax', status: 'maintenance', lastSync: '2024-01-14 16:00', dataFlow: 'outbound' },
    { id: '10', name: 'Passport Scanner', type: 'passport_scanner', provider: 'Thales', status: 'connected', lastSync: '2024-01-15 13:30', dataFlow: 'inbound' },
    { id: '11', name: 'ID Reader', type: 'id_reader', provider: 'HID', status: 'connected', lastSync: '2024-01-15 13:25', dataFlow: 'inbound' },
    { id: '12', name: 'PBX System', type: 'pbx', provider: 'Avaya', status: 'connected', lastSync: '2024-01-15 14:05', dataFlow: 'bidirectional' },
    { id: '13', name: 'IPTV System', type: 'iptv', provider: 'Samsung', status: 'connected', lastSync: '2024-01-15 14:02', dataFlow: 'outbound' },
    { id: '14', name: 'IoT Sensors', type: 'iot', provider: 'Cisco', status: 'connected', lastSync: '2024-01-15 14:35', dataFlow: 'inbound' },
    { id: '15', name: 'Energy Management', type: 'energy', provider: 'Schneider', status: 'connected', lastSync: '2024-01-15 14:32', dataFlow: 'bidirectional' },
    { id: '16', name: 'Building Management', type: 'bms', provider: 'Siemens', status: 'connected', lastSync: '2024-01-15 14:30', dataFlow: 'bidirectional' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || integration.type === filterType;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const integrationTypes = [
    { id: 'payment_gateway', name: 'Payment Gateway', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'door_lock', name: 'Door Lock', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'pos', name: 'POS', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'channel_manager', name: 'Channel Manager', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'crs', name: 'CRS', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'ota', name: 'OTA', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'accounting', name: 'Accounting', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
    { id: 'government', name: 'Government', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400' },
    { id: 'passport_scanner', name: 'Passport Scanner', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400' },
    { id: 'id_reader', name: 'ID Reader', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400' },
    { id: 'pbx', name: 'PBX', color: 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400' },
    { id: 'iptv', name: 'IPTV', color: 'bg-lime-100 dark:bg-lime-900/20 text-lime-800 dark:text-lime-400' },
    { id: 'iot', name: 'IoT', color: 'bg-violet-100 dark:bg-violet-900/20 text-violet-800 dark:text-violet-400' },
    { id: 'energy', name: 'Energy', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400' },
    { id: 'bms', name: 'BMS', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'disconnected': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'error': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'maintenance': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle size={16} />;
      case 'disconnected': return <XCircle size={16} />;
      case 'error': return <AlertTriangle size={16} />;
      case 'maintenance': return <AlertTriangle size={16} />;
      default: return <AlertTriangle size={16} />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Integration Hub</h1>
          <p className="text-xs text-slate-400">Configure integrations with payment gateways, door lock systems, POS systems, channel managers, CRS, OTA platforms, accounting systems, government systems, passport scanners, ID readers, PBX, IPTV, IoT devices, energy management, and building management systems</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Integration
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Integrations', value: integrations.length, icon: Link, color: 'text-blue-600' },
          { label: 'Connected', value: integrations.filter(i => i.status === 'connected').length, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Issues', value: integrations.filter(i => i.status === 'error').length, icon: AlertTriangle, color: 'text-red-600' },
          { label: 'In Maintenance', value: integrations.filter(i => i.status === 'maintenance').length, icon: RefreshCw, color: 'text-amber-600' },
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
              placeholder="Search integrations..."
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
              {integrationTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="connected">Connected</option>
              <option value="disconnected">Disconnected</option>
              <option value="error">Error</option>
              <option value="maintenance">Maintenance</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Integration Configuration</h3>
            <p className="text-xs text-slate-400">External system connections</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIntegrations.map((integration) => {
            const type = integrationTypes.find(t => t.id === integration.type);
            return (
              <div key={integration.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Link size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{integration.name}</h4>
                      <span className="text-xs text-slate-500">{integration.provider}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(integration.status)}`}>
                    {getStatusIcon(integration.status)}
                    {integration.status}
                  </div>
                </div>

                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${type?.color}`}>
                    {type?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <RefreshCw size={12} className="text-slate-400" />
                    <span className="text-slate-500">Last Sync</span>
                    <span className="font-bold text-slate-900 dark:text-white">{integration.lastSync}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Link size={12} className="text-slate-400" />
                    <span className="text-slate-500">Data Flow</span>
                    <span className="font-bold text-slate-900 dark:text-white capitalize">{integration.dataFlow.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    Configure
                  </button>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <RefreshCw size={16} className="text-slate-400" />
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

      {/* Integration Types Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Integration Categories</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {integrationTypes.map((type) => (
            <div key={type.id} className={`p-3 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
              <Link size={20} className="mb-2" />
              <span className="text-xs font-bold">{type.name}</span>
              <span className="text-[10px] opacity-75">{integrations.filter(i => i.type === type.id).length} active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IntegrationHub;