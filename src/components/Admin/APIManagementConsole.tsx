import React, { useState, useEffect } from 'react';
import {
  Key,
  Shield,
  Clock,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  BarChart,
  Activity
} from 'lucide-react';

interface APIKey {
  id: string;
  key_name: string;
  key_prefix: string;
  key_type: 'publishable' | 'secret' | 'service';
  scopes: string[];
  is_active: boolean;
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
  rate_limit_per_minute: number;
}

interface APIUsage {
  date: string;
  requests: number;
  errors: number;
  avg_latency_ms: number;
}

interface APIEndpoint {
  path: string;
  method: string;
  requests_today: number;
  avg_latency_ms: number;
  error_rate: number;
  last_accessed: string;
}

export default function APIManagementConsole() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
  const [usageData, setUsageData] = useState<APIUsage[]>([]);
  const [endpoints, setEndpoints] = useState<APIEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false);
  const [newKey, setNewKey] = useState({
    key_name: '',
    key_type: 'publishable' as const,
    scopes: ['read'],
    rate_limit: 60,
    expires_days: 365
  });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const fetchAPIKeys = async () => {
    try {
      const res = await fetch('/api/admin/api-keys');
      if (res.ok) {
        const data = await res.json();
        setApiKeys(data);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const fetchUsageData = async () => {
    try {
      const res = await fetch('/api/admin/api-usage');
      if (res.ok) {
        const data = await res.json();
        setUsageData(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    }
  };

  const fetchEndpoints = async () => {
    try {
      const res = await fetch('/api/admin/api-endpoints');
      if (res.ok) {
        const data = await res.json();
        setEndpoints(data);
      }
    } catch (error) {
      console.error('Failed to fetch endpoints:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAPIKeys(), fetchUsageData(), fetchEndpoints()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const createAPIKey = async () => {
    try {
      const res = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedKey(data.api_key);
        setShowCreateKeyModal(false);
        setNewKey({
          key_name: '',
          key_type: 'publishable',
          scopes: ['read'],
          rate_limit: 60,
          expires_days: 365
        });
        fetchAPIKeys();
      }
    } catch (error) {
      console.error('Failed to create API key:', error);
    }
  };

  const deleteAPIKey = async (keyId: string) => {
    try {
      const res = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAPIKeys();
      }
    } catch (error) {
      console.error('Failed to delete API key:', error);
    }
  };

  const toggleKeyStatus = async (keyId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive })
      });
      if (res.ok) {
        fetchAPIKeys();
      }
    } catch (error) {
      console.error('Failed to toggle key status:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getKeyTypeColor = (type: string) => {
    switch (type) {
      case 'publishable':
        return 'bg-emerald-100 text-emerald-700';
      case 'secret':
        return 'bg-amber-100 text-amber-700';
      case 'service':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'bg-blue-100 text-blue-700';
      case 'POST':
        return 'bg-emerald-100 text-emerald-700';
      case 'PUT':
        return 'bg-amber-100 text-amber-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">API Management Console</h2>
          <p className="text-sm text-slate-500">Manage API keys, monitor usage, and track endpoint performance</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetchAPIKeys();
              fetchUsageData();
              fetchEndpoints();
            }}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition"
          >
            <RefreshCw className="w-4 h-4 inline mr-1" />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateKeyModal(true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            New API Key
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Keys</p>
              <p className="text-2xl font-bold text-slate-900">{apiKeys.filter(k => k.is_active).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Activity className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Requests Today</p>
              <p className="text-2xl font-bold text-slate-900">
                {usageData.length > 0 ? usageData[usageData.length - 1]?.requests || 0 : 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Latency</p>
              <p className="text-2xl font-bold text-slate-900">
                {usageData.length > 0 ? Math.round(usageData[usageData.length - 1]?.avg_latency_ms || 0) : 0}ms
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Error Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {usageData.length > 0 ? Math.round((usageData[usageData.length - 1]?.errors || 0) / (usageData[usageData.length - 1]?.requests || 1) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {apiKeys.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Key className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No API keys configured</p>
            </div>
          ) : (
            apiKeys.map(key => (
              <div key={key.id} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Key className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-900">{key.key_name}</h4>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getKeyTypeColor(key.key_type)}`}>
                          {key.key_type}
                        </span>
                        {!key.is_active && (
                          <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs font-medium">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2 font-mono">
                        {key.key_prefix}••••••••••••
                      </p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {key.scopes.map(scope => (
                          <span key={scope} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs">
                            {scope}
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span className="text-slate-600">
                            {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never used'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BarChart className="w-3 h-3" />
                          <span className="text-slate-600">
                            {key.rate_limit_per_minute} req/min
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => toggleKeyStatus(key.id, key.is_active)}
                      className={`p-2 rounded-lg transition ${
                        key.is_active
                          ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                      title={key.is_active ? 'Disable' : 'Enable'}
                    >
                      {key.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => deleteAPIKey(key.id)}
                      className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* API Endpoints */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Endpoint Performance
          </h3>
        </div>
        <div className="divide-y divide-slate-100">
          {endpoints.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No endpoint data available</p>
            </div>
          ) : (
            endpoints.map(endpoint => (
              <div key={`${endpoint.method}-${endpoint.path}`} className="px-6 py-4 hover:bg-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method.toUpperCase()}
                    </span>
                    <span className="font-mono text-sm text-slate-900">{endpoint.path}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Requests Today</p>
                      <p className="font-bold text-slate-900">{endpoint.requests_today}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Avg Latency</p>
                      <p className="font-bold text-slate-900">{endpoint.avg_latency_ms}ms</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Error Rate</p>
                      <p className={`font-bold ${endpoint.error_rate > 5 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {endpoint.error_rate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create New API Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKey.key_name}
                  onChange={(e) => setNewKey({ ...newKey, key_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g., Mobile App Integration"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Key Type
                </label>
                <select
                  value={newKey.key_type}
                  onChange={(e) => setNewKey({ ...newKey, key_type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="publishable">Publishable (Client-side)</option>
                  <option value="secret">Secret (Server-side)</option>
                  <option value="service">Service (Backend)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Scopes
                </label>
                <select
                  value={newKey.scopes[0]}
                  onChange={(e) => setNewKey({ ...newKey, scopes: [e.target.value] })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="read">Read Only</option>
                  <option value="write">Read & Write</option>
                  <option value="admin">Full Access</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Rate Limit (req/min)
                </label>
                <input
                  type="number"
                  value={newKey.rate_limit}
                  onChange={(e) => setNewKey({ ...newKey, rate_limit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  min="1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateKeyModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={createAPIKey}
                disabled={!newKey.key_name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generated Key Modal */}
      {generatedKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
              API Key Created
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Copy this key now. You won't be able to see it again.
            </p>
            <div className="bg-slate-100 p-4 rounded-lg mb-4">
              <code className="text-sm font-mono break-all">{generatedKey}</code>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                <Copy className="w-4 h-4 inline mr-1" />
                Copy to Clipboard
              </button>
              <button
                onClick={() => setGeneratedKey(null)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
