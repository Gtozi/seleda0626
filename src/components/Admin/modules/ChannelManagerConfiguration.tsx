import React, { useState } from 'react';
import { Globe, Hotel, Link, Map, Lock, Search, Plus, Settings, Activity, CheckCircle, XCircle, AlertTriangle, RefreshCw, Calendar, DollarSign, Box, Filter, MoreVertical } from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  type: 'ota' | 'booking_engine' | 'crs' | 'direct';
  status: 'connected' | 'disconnected' | 'error';
  lastRefreshCw: string;
  apiStatus: 'active' | 'inactive' | 'maintenance';
  commissionRate: number;
  mappingStatus: 'complete' | 'partial' | 'none';
}

interface RateMapping {
  id: string;
  channel: string;
  roomType: string;
  ratePlan: string;
  channelRateCode: string;
  status: 'mapped' | 'unmapped' | 'error';
  lastRefreshCw: string;
}

interface InventoryMapping {
  id: string;
  channel: string;
  roomType: string;
  roomCount: number;
  syncStatus: 'synced' | 'pending' | 'error';
  lastRefreshCw: string;
}

interface Restriction {
  id: string;
  type: 'min_stay' | 'max_stay' | 'closed' | 'check_in' | 'check_out';
  channel: string;
  roomType: string;
  startDate: string;
  endDate: string;
  value: string;
  status: 'active' | 'expired' | 'scheduled';
}

const ChannelManagerConfiguration: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([
    { id: '1', name: 'Booking.com', type: 'ota', status: 'connected', lastRefreshCw: '5 minutes ago', apiStatus: 'active', commissionRate: 15, mappingStatus: 'complete' },
    { id: '2', name: 'Expedia', type: 'ota', status: 'connected', lastRefreshCw: '10 minutes ago', apiStatus: 'active', commissionRate: 12, mappingStatus: 'complete' },
    { id: '3', name: 'Airbnb', type: 'ota', status: 'connected', lastRefreshCw: '15 minutes ago', apiStatus: 'active', commissionRate: 3, mappingStatus: 'partial' },
    { id: '4', name: 'Direct Booking Engine', type: 'booking_engine', status: 'connected', lastRefreshCw: 'Real-time', apiStatus: 'active', commissionRate: 0, mappingStatus: 'complete' },
    { id: '5', name: 'Sabre CRS', type: 'crs', status: 'disconnected', lastRefreshCw: '2 hours ago', apiStatus: 'maintenance', commissionRate: 8, mappingStatus: 'none' },
    { id: '6', name: 'Agoda', type: 'ota', status: 'error', lastRefreshCw: '1 day ago', apiStatus: 'inactive', commissionRate: 10, mappingStatus: 'error' },
  ]);

  const [rateMappings, setRateMappings] = useState<RateMapping[]>([
    { id: '1', channel: 'Booking.com', roomType: 'Deluxe Room', ratePlan: 'Standard Rate', channelRateCode: 'STD_RATE_001', status: 'mapped', lastRefreshCw: '5 minutes ago' },
    { id: '2', channel: 'Expedia', roomType: 'Deluxe Room', ratePlan: 'Standard Rate', channelRateCode: 'EXP_STD_001', status: 'mapped', lastRefreshCw: '10 minutes ago' },
    { id: '3', channel: 'Airbnb', roomType: 'Suite', ratePlan: 'Weekly Rate', channelRateCode: 'AIRBNB_WEEKLY', status: 'unmapped', lastRefreshCw: '15 minutes ago' },
    { id: '4', channel: 'Direct Booking Engine', roomType: 'Deluxe Room', ratePlan: 'Standard Rate', channelRateCode: 'DIRECT_STD', status: 'mapped', lastRefreshCw: 'Real-time' },
  ]);

  const [inventoryMappings, setInventoryMappings] = useState<InventoryMapping[]>([
    { id: '1', channel: 'Booking.com', roomType: 'Deluxe Room', roomCount: 50, syncStatus: 'synced', lastRefreshCw: '5 minutes ago' },
    { id: '2', channel: 'Expedia', roomType: 'Deluxe Room', roomCount: 50, syncStatus: 'synced', lastRefreshCw: '10 minutes ago' },
    { id: '3', channel: 'Airbnb', roomType: 'Suite', roomCount: 20, syncStatus: 'pending', lastRefreshCw: '15 minutes ago' },
    { id: '4', channel: 'Direct Booking Engine', roomType: 'Deluxe Room', roomCount: 50, syncStatus: 'synced', lastRefreshCw: 'Real-time' },
  ]);

  const [restrictions, setRestrictions] = useState<Restriction[]>([
    { id: '1', type: 'min_stay', channel: 'Booking.com', roomType: 'Deluxe Room', startDate: '2024-01-20', endDate: '2024-01-25', value: '3 nights', status: 'active' },
    { id: '2', type: 'closed', channel: 'Expedia', roomType: 'Suite', startDate: '2024-01-15', endDate: '2024-01-16', value: 'Sold out', status: 'active' },
    { id: '3', type: 'check_in', channel: 'Airbnb', roomType: 'Deluxe Room', startDate: '2024-01-18', endDate: '2024-01-19', value: 'No check-in', status: 'scheduled' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'channels' | 'rate_mapping' | 'inventory_mapping' | 'restrictions'>('channels');

  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || channel.type === filterType;
    const matchesStatus = filterStatus === 'all' || channel.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const channelTypes = [
    { id: 'ota', name: 'OTA', icon: Globe, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'booking_engine', name: 'Booking Engine', icon: Hotel, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'crs', name: 'CRS', icon: Link, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'direct', name: 'Direct', icon: Settings, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': case 'mapped': case 'synced': case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'disconnected': case 'unmapped': case 'pending': case 'scheduled': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'error': case 'none': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getMappingStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'partial': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'none': case 'error': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const connectionStats = [
    { label: 'Total Channels', value: channels.length, icon: Globe, color: 'text-blue-600' },
    { label: 'Connected', value: channels.filter(c => c.status === 'connected').length, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Disconnected', value: channels.filter(c => c.status === 'disconnected').length, icon: XCircle, color: 'text-red-600' },
    { label: 'Errors', value: channels.filter(c => c.status === 'error').length, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Rate Mappings', value: rateMappings.filter(r => r.status === 'mapped').length, icon: DollarSign, color: 'text-purple-600' },
    { label: 'Inventory RefreshCw', value: inventoryMappings.filter(i => i.syncStatus === 'synced').length, icon: Box, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Channel Manager Configuration</h1>
          <p className="text-xs text-slate-400">Manage OTA connections, booking engine, CRS, rate mapping, inventory mapping, and restrictions</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Channel
        </button>
      </div>

      {/* Connection Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {connectionStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'channels'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Channels
        </button>
        <button
          onClick={() => setActiveTab('rate_mapping')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'rate_mapping'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Rate Mapping
        </button>
        <button
          onClick={() => setActiveTab('inventory_mapping')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'inventory_mapping'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Inventory Mapping
        </button>
        <button
          onClick={() => setActiveTab('restrictions')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'restrictions'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Restrictions
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels..."
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
              {channelTypes.map(type => (
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
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'channels' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">API Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Commission</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Mapping</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last RefreshCw</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredChannels.map((channel) => {
                  const type = channelTypes.find(t => t.id === channel.type);
                  const TypeIcon = type?.icon || Globe;
                  return (
                    <tr key={channel.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                            <TypeIcon size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{channel.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{type?.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(channel.status)}`}>
                          {channel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(channel.apiStatus)}`}>
                          {channel.apiStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{channel.commissionRate}%</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getMappingStatusColor(channel.mappingStatus)}`}>
                          {channel.mappingStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{channel.lastRefreshCw}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="RefreshCw now">
                            <RefreshCw size={14} className="text-indigo-600" />
                          </button>
                          <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Configure">
                            <Settings size={14} className="text-amber-600" />
                          </button>
                          <button className="p-1.5 hover:bg-slate-50 rounded-lg transition" title="More options">
                            <MoreVertical size={14} className="text-slate-600" />
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
      )}

      {activeTab === 'rate_mapping' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Room Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Rate Plan</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Channel Rate Code</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last RefreshCw</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {rateMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.channel}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.roomType}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.ratePlan}</td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">{mapping.channelRateCode}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(mapping.status)}`}>
                        {mapping.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.lastRefreshCw}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit mapping">
                          <Map size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="RefreshCw now">
                          <RefreshCw size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'inventory_mapping' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Room Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Room Count</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">RefreshCw Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last RefreshCw</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {inventoryMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.channel}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.roomType}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.roomCount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(mapping.syncStatus)}`}>
                        {mapping.syncStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{mapping.lastRefreshCw}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Force sync">
                          <RefreshCw size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Edit mapping">
                          <Map size={14} className="text-amber-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'restrictions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Channel</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Room Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Date Range</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {restrictions.map((restriction) => (
                  <tr key={restriction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {restriction.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{restriction.channel}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{restriction.roomType}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {restriction.startDate} → {restriction.endDate}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{restriction.value}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(restriction.status)}`}>
                        {restriction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit restriction">
                          <Lock size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-rose-50 rounded-lg transition" title="Remove restriction">
                          <XCircle size={14} className="text-rose-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Channel Alerts</h3>
            <p className="text-xs text-slate-400">Critical connection and sync issues</p>
          </div>
        </div>

        <div className="space-y-4">
          {channels.filter(c => c.status === 'error' || c.status === 'disconnected').map((channel) => {
            const type = channelTypes.find(t => t.id === channel.type);
            const TypeIcon = type?.icon || Globe;
            return (
              <div key={channel.id} className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/10 p-4 rounded-r-xl">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{channel.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(channel.status)}`}>
                        {channel.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {channel.status === 'error' ? 'API connection failed. Check credentials and endpoint configuration.' : 'Channel disconnected. Reconnect to resume synchronization.'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Last sync: {channel.lastRefreshCw}</span>
                      <span>API Status: {channel.apiStatus}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                      Reconnect
                    </button>
                    <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChannelManagerConfiguration;