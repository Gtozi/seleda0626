/**
 * API Management Dashboard
 * Manage API endpoints, keys, rate limits, and access control
 */

import React, { useState } from 'react';
import {
  Key,
  Shield,
  Activity,
  Globe,
  Clock,
  Copy,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface APIKey {
  keyId: string;
  name: string;
  keyType: 'publishable' | 'secret' | 'service';
  prefix: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  rateLimit: number;
  rateLimitRemaining: number;
  status: 'active' | 'revoked' | 'expired';
  scopes: string[];
}

interface APIEndpoint {
  endpointId: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  authentication: 'api_key' | 'oauth2' | 'jwt';
  rateLimit: number;
  scope: string[];
  status: 'active' | 'deprecated' | 'beta';
}

interface APIUsage {
  date: string;
  requests: number;
  errors: number;
  avgResponseTime: number;
}

const mockAPIKeys: APIKey[] = [
  {
    keyId: 'key_1234567890',
    name: 'Production Frontend',
    keyType: 'publishable',
    prefix: 'pk_live_',
    createdAt: '2026-01-15',
    lastUsed: '2026-06-20',
    rateLimit: 10000,
    rateLimitRemaining: 7850,
    status: 'active',
    scopes: ['read', 'write']
  },
  {
    keyId: 'key_0987654321',
    name: 'Backend Service',
    keyType: 'secret',
    prefix: 'sk_live_',
    createdAt: '2026-02-01',
    lastUsed: '2026-06-19',
    rateLimit: 50000,
    rateLimitRemaining: 42000,
    status: 'active',
    scopes: ['read', 'write', 'admin']
  },
  {
    keyId: 'key_5555555555',
    name: 'Test Integration',
    keyType: 'service',
    prefix: 'svc_test_',
    createdAt: '2026-05-10',
    lastUsed: '2026-06-18',
    rateLimit: 1000,
    rateLimitRemaining: 950,
    status: 'active',
    scopes: ['read']
  }
];

const mockEndpoints: APIEndpoint[] = [
  {
    endpointId: 'ep_001',
    path: '/api/v1/reservations',
    method: 'GET',
    description: 'Retrieve reservations list',
    authentication: 'api_key',
    rateLimit: 1000,
    scope: ['read'],
    status: 'active'
  },
  {
    endpointId: 'ep_002',
    path: '/api/v1/reservations',
    method: 'POST',
    description: 'Create new reservation',
    authentication: 'api_key',
    rateLimit: 500,
    scope: ['write'],
    status: 'active'
  },
  {
    endpointId: 'ep_003',
    path: '/api/v1/guests',
    method: 'GET',
    description: 'Retrieve guest information',
    authentication: 'oauth2',
    rateLimit: 2000,
    scope: ['read'],
    status: 'active'
  },
  {
    endpointId: 'ep_004',
    path: '/api/v1/rooms/availability',
    method: 'GET',
    description: 'Check room availability',
    authentication: 'api_key',
    rateLimit: 5000,
    scope: ['read'],
    status: 'active'
  }
];

const mockUsage: APIUsage[] = [
  { date: '2026-06-14', requests: 12500, errors: 12, avgResponseTime: 45 },
  { date: '2026-06-15', requests: 14200, errors: 8, avgResponseTime: 42 },
  { date: '2026-06-16', requests: 13800, errors: 15, avgResponseTime: 48 },
  { date: '2026-06-17', requests: 15100, errors: 10, avgResponseTime: 44 },
  { date: '2026-06-18', requests: 16300, errors: 6, avgResponseTime: 41 },
  { date: '2026-06-19', requests: 15800, errors: 9, avgResponseTime: 43 },
  { date: '2026-06-20', requests: 17200, errors: 7, avgResponseTime: 40 }
];

export default function APIManagementDashboard() {
  const [activeTab, setActiveTab] = useState<'keys' | 'endpoints' | 'usage'>('keys');
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [selectedKey, setSelectedKey] = useState<APIKey | null>(null);

  const toggleKeyVisibility = (keyId: string) => {
    setShowKey(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className="text-emerald-500" />;
      case 'revoked':
        return <XCircle size={14} className="text-rose-500" />;
      case 'expired':
        return <AlertCircle size={14} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'POST':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'PUT':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'DELETE':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
      case 'PATCH':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="api-management-dashboard">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">API Management</h2>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
          <Plus size={14} /> Create API Key
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Key size={20} className="text-blue-500" />
            <span className="text-xs font-bold text-emerald-500">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{mockAPIKeys.filter(k => k.status === 'active').length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">API Keys</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} className="text-purple-500" />
            <span className="text-xs font-bold text-emerald-500">+12%</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{mockUsage[mockUsage.length - 1].requests.toLocaleString()}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Requests Today</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Clock size={20} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500">-5ms</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{mockUsage[mockUsage.length - 1].avgResponseTime}ms</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Avg Response Time</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Shield size={20} className="text-rose-500" />
            <span className="text-xs font-bold text-rose-500">{mockUsage[mockUsage.length - 1].errors}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">0.04%</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Error Rate</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-3xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'keys'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Key size={14} /> API Keys
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'endpoints'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe size={14} /> Endpoints
          </button>
          <button
            onClick={() => setActiveTab('usage')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'usage'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity size={14} /> Usage
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'keys' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">API Keys</h3>
            <div className="space-y-3">
              {mockAPIKeys.map((key) => (
                <div
                  key={key.keyId}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{key.name}</h4>
                        {getStatusIcon(key.status)}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{key.keyId}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                        <Settings size={14} className="text-slate-400" />
                      </button>
                      <button className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg">
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Type</span>
                      <div className="font-bold text-slate-900 dark:text-white capitalize">{key.keyType}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Rate Limit</span>
                      <div className="font-bold text-slate-900 dark:text-white">{key.rateLimitRemaining}/{key.rateLimit}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Last Used</span>
                      <div className="font-bold text-slate-900 dark:text-white">{key.lastUsed || 'Never'}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Scopes</span>
                      <div className="font-bold text-slate-900 dark:text-white">{key.scopes.join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-slate-100 dark:bg-slate-900 rounded-lg font-mono text-xs text-slate-600 dark:text-slate-400">
                      {showKey[key.keyId] ? `${key.prefix}${'x'.repeat(20)}` : `${key.prefix}${'*'.repeat(20)}`}
                    </div>
                    <button
                      onClick={() => toggleKeyVisibility(key.keyId)}
                      className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                    >
                      {showKey[key.keyId] ? <EyeOff size={14} className="text-slate-500" /> : <Eye size={14} className="text-slate-500" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(`${key.prefix}${'x'.repeat(20)}`)}
                      className="p-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                    >
                      <Copy size={14} className="text-slate-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'endpoints' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">API Endpoints</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="text-left py-3 text-xs font-bold text-slate-600 dark:text-slate-400">Method</th>
                    <th className="text-left py-3 text-xs font-bold text-slate-600 dark:text-slate-400">Endpoint</th>
                    <th className="text-left py-3 text-xs font-bold text-slate-600 dark:text-slate-400">Description</th>
                    <th className="text-left py-3 text-xs font-bold text-slate-600 dark:text-slate-400">Auth</th>
                    <th className="text-right py-3 text-xs font-bold text-slate-600 dark:text-slate-400">Rate Limit</th>
                    <th className="text-center py-3 text-xs font-bold text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockEndpoints.map((endpoint) => (
                    <tr key={endpoint.endpointId} className="border-b border-slate-100 dark:border-slate-900">
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-xs text-slate-900 dark:text-white">{endpoint.path}</td>
                      <td className="py-3 text-xs text-slate-600 dark:text-slate-400">{endpoint.description}</td>
                      <td className="py-3 text-xs text-slate-600 dark:text-slate-400 capitalize">{endpoint.authentication}</td>
                      <td className="py-3 text-right text-xs text-slate-900 dark:text-white">{endpoint.rateLimit}/hr</td>
                      <td className="py-3 text-center">
                        {getStatusIcon(endpoint.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'usage' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">API Usage</h3>
            <button className="px-3 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg flex items-center gap-1">
              <RefreshCw size={12} /> Refresh
            </button>
          </div>
          <div className="space-y-4">
            {mockUsage.map((day) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-24 text-xs font-bold text-slate-600 dark:text-slate-400">{day.date}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 h-8 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all"
                        style={{ width: `${(day.requests / 20000) * 100}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-xs font-bold text-slate-900 dark:text-white">
                      {day.requests.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${(day.avgResponseTime / 60) * 100}%` }}
                      />
                    </div>
                    <div className="w-20 text-right text-[10px] text-slate-500 dark:text-slate-400">
                      {day.avgResponseTime}ms
                    </div>
                  </div>
                </div>
                <div className="w-16 text-center">
                  <span className={`text-xs font-bold ${day.errors > 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {day.errors}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
