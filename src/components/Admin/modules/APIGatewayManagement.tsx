import React, { useState } from 'react';
import { Key, Plus, Edit, Search, Filter, Shield, Clock, Zap, Eye, Copy } from 'lucide-react';

interface APIKey {
  id: string;
  name: string;
  key: string;
  type: 'api_key' | 'oauth_client' | 'webhook';
  permissions: string[];
  rateLimit: number;
  lastUsed: string;
  status: 'active' | 'revoked' | 'expired';
  expiresAt: string;
}

const APIGatewayManagement: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    { id: '1', name: 'Mobile App API Key', key: 'sk_live_...xyz123', type: 'api_key', permissions: ['read', 'write'], rateLimit: 1000, lastUsed: '2024-01-15 14:30', status: 'active', expiresAt: '2024-12-31' },
    { id: '2', name: 'Webhook Integration', key: 'wh_...abc456', type: 'webhook', permissions: ['read'], rateLimit: 500, lastUsed: '2024-01-15 13:45', status: 'active', expiresAt: '2025-06-30' },
    { id: '3', name: 'OAuth Client - Partner', key: 'oauth_...def789', type: 'oauth_client', permissions: ['read', 'write', 'admin'], rateLimit: 2000, lastUsed: '2024-01-15 12:00', status: 'active', expiresAt: '2024-12-31' },
    { id: '4', name: 'Test API Key', key: 'sk_test_...ghi012', type: 'api_key', permissions: ['read'], rateLimit: 100, lastUsed: '2024-01-10 09:00', status: 'revoked', expiresAt: '2024-02-28' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || key.type === filterType;
    const matchesStatus = filterStatus === 'all' || key.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const keyTypes = [
    { id: 'api_key', name: 'API Key', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'oauth_client', name: 'OAuth Client', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'webhook', name: 'Webhook', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'revoked': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'expired': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">API Gateway Management</h1>
          <p className="text-xs text-slate-400">Manage API keys, OAuth clients, webhooks, rate limits, API monitoring, API documentation, and API versioning</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Generate API Key
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Keys', value: apiKeys.length, icon: Key, color: 'text-blue-600' },
          { label: 'Active', value: apiKeys.filter(k => k.status === 'active').length, icon: Shield, color: 'text-emerald-600' },
          { label: 'Total Requests', value: '1.2M', icon: Zap, color: 'text-purple-600' },
          { label: 'Avg Response', value: '45ms', icon: Clock, color: 'text-amber-600' },
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
              placeholder="Search API keys..."
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
              {keyTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="revoked">Revoked</option>
              <option value="expired">Expired</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">API Key</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Rate Limit</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Used</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredKeys.map((key) => {
                const type = keyTypes.find(t => t.id === key.type);
                return (
                  <tr key={key.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <Key size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{key.name}</div>
                          <div className="text-xs text-slate-500 font-mono">{key.key}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${type?.color}`}>
                        {type?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions.map((perm, index) => (
                          <span key={index} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                            {perm}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{key.rateLimit}/hr</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{key.lastUsed}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{key.expiresAt}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Eye size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Copy size={16} className="text-slate-400" />
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

      {/* API Management Features */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">API Management</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'API Keys', icon: Key, color: 'text-blue-600' },
            { name: 'OAuth Clients', icon: Shield, color: 'text-purple-600' },
            { name: 'Webhooks', icon: Zap, color: 'text-emerald-600' },
            { name: 'Rate Limits', icon: Clock, color: 'text-amber-600' },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className={`w-8 h-8 rounded-lg bg-white dark:bg-slate-900 ${feature.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{feature.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default APIGatewayManagement;