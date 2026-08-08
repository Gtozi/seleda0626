import React, { useState } from 'react';
import { Building, Users, Globe, Package, Zap, HardDrive, AlertTriangle, CheckCircle, XCircle, Search, Filter, Calendar, Settings, TrendingUp, TrendingDown, Minus, Key, CreditCard, BarChart3, Camera } from 'lucide-react';

interface License {
  id: string;
  name: string;
  type: 'property' | 'user' | 'portal' | 'module' | 'api' | 'storage';
  status: 'active' | 'expired' | 'expiring' | 'suspended';
  used: number;
  total: number;
  expiryDate: string;
  renewalDate?: string;
}

interface UsageMetric {
  id: string;
  name: string;
  current: number;
  limit: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

const Licensing: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([
    { id: '1', name: 'Licensed Properties', type: 'property', status: 'active', used: 12, total: 25, expiryDate: '2024-12-31' },
    { id: '2', name: 'Active Users', type: 'user', status: 'active', used: 145, total: 200, expiryDate: '2024-12-31' },
    { id: '3', name: 'Admin Portal', type: 'portal', status: 'active', used: 1, total: 5, expiryDate: '2024-12-31' },
    { id: '4', name: 'Front Desk Portal', type: 'portal', status: 'active', used: 3, total: 10, expiryDate: '2024-12-31' },
    { id: '5', name: 'Housekeeping Module', type: 'module', status: 'active', used: 1, total: 1, expiryDate: '2024-12-31' },
    { id: '6', name: 'F&B Module', type: 'module', status: 'active', used: 1, total: 1, expiryDate: '2024-12-31' },
    { id: '7', name: 'API Calls', type: 'api', status: 'expiring', used: 850000, total: 1000000, expiryDate: '2024-01-31' },
    { id: '8', name: 'Storage', type: 'storage', status: 'active', used: 450, total: 1000, expiryDate: '2024-12-31' },
  ]);

  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([
    { id: '1', name: 'API Calls (Monthly)', current: 850000, limit: 1000000, unit: 'calls', trend: 'up', period: 'This month' },
    { id: '2', name: 'Storage Used', current: 450, limit: 1000, unit: 'GB', trend: 'up', period: 'Current' },
    { id: '3', name: 'Active Sessions', current: 45, limit: 100, unit: 'sessions', trend: 'stable', period: 'Current' },
    { id: '4', name: 'Data Transfer', current: 120, limit: 500, unit: 'GB', trend: 'up', period: 'This month' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'properties' | 'users' | 'portals' | 'modules' | 'api' | 'storage'>('overview');

  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || license.type === filterType;
    const matchesStatus = filterStatus === 'all' || license.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const licenseTypes = [
    { id: 'property', name: 'Properties', icon: Building, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'user', name: 'Users', icon: Users, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'portal', name: 'Portals', icon: Globe, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'module', name: 'Modules', icon: Package, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'api', name: 'API', icon: Zap, color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'storage', name: 'Storage', icon: HardDrive, color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'expired': case 'suspended': return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400';
      case 'expiring': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.round((current / limit) * 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const licenseSummary = [
    { label: 'Total Licenses', value: licenses.length, icon: Key, color: 'text-blue-600' },
    { label: 'Active', value: licenses.filter(l => l.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Expiring', value: licenses.filter(l => l.status === 'expiring').length, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Expired', value: licenses.filter(l => l.status === 'expired').length, icon: XCircle, color: 'text-red-600' },
    { label: 'Utilization', value: '72%', icon: BarChart3, color: 'text-purple-600' },
    { label: 'Next Renewal', value: 'Jan 31', icon: Calendar, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Licensing</h1>
          <p className="text-xs text-slate-400">Manage licensed properties, active users, portal licenses, module licenses, API usage, and storage</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <CreditCard size={16} />
          Manage Subscription
        </button>
      </div>

      {/* License Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {licenseSummary.map((summary, index) => {
          const Icon = summary.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${summary.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{summary.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{summary.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'properties'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Properties
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('portals')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'portals'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Portals
        </button>
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'modules'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Modules
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'api'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          API Usage
        </button>
        <button
          onClick={() => setActiveTab('storage')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'storage'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Storage
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Usage Metrics */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Usage Metrics</h3>
                <p className="text-xs text-slate-400">Current resource utilization</p>
              </div>
            </div>

            <div className="space-y-4">
              {usageMetrics.map((metric) => {
                const percentage = getUsagePercentage(metric.current, metric.limit);
                return (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{metric.name}</span>
                        <span className="text-xs text-slate-400">({metric.period})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {metric.current.toLocaleString()} / {metric.limit.toLocaleString()} {metric.unit}
                        </span>
                        <div className="flex items-center gap-1">
                          {metric.trend === 'up' && <TrendingUp size={14} className="text-red-600" />}
                          {metric.trend === 'down' && <TrendingDown size={14} className="text-emerald-600" />}
                          {metric.trend === 'stable' && <Minus size={14} className="text-slate-400" />}
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getUsageColor(percentage)} transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-right text-xs text-slate-400">{percentage}% utilized</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* All Licenses */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">License</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Expiry</th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {licenses.map((license) => {
                    const type = licenseTypes.find(t => t.id === license.type);
                    const TypeIcon = type?.icon || Key;
                    const usagePercentage = getUsagePercentage(license.used, license.total);
                    return (
                      <tr key={license.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                              <TypeIcon size={20} />
                            </div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{license.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{type?.name}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${getUsageColor(usagePercentage)}`}
                                style={{ width: `${usagePercentage}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{license.used}/{license.total}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(license.status)}`}>
                            {license.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{license.expiryDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-1.5 hover-bg-indigo-50 rounded-lg transition" title="Upgrade license">
                              <TrendingUp size={14} className="text-indigo-600" />
                            </button>
                            <button className="p-1.5 hover-bg-slate-50 rounded-lg transition" title="Manage">
                              <Settings size={14} className="text-slate-600" />
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
        </>
      )}

      {/* License Alerts */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">License Alerts</h3>
            <p className="text-xs text-slate-400">Expiring licenses and usage warnings</p>
          </div>
        </div>

        <div className="space-y-4">
          {licenses.filter(l => l.status === 'expiring' || getUsagePercentage(l.used, l.total) >= 80).map((license) => {
            const type = licenseTypes.find(t => t.id === license.type);
            const TypeIcon = type?.icon || Key;
            const usagePercentage = getUsagePercentage(license.used, license.total);
            return (
              <div key={license.id} className={`border-l-4 ${
                license.status === 'expiring' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10' :
                usagePercentage >= 90 ? 'border-red-500 bg-red-50 dark:bg-red-900/10' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/10'
              } p-4 rounded-r-xl`}>
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{license.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusColor(license.status)}`}>
                        {license.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                      {license.status === 'expiring' ? `License expires on ${license.expiryDate}` : 
                       `Usage at ${usagePercentage}% of limit (${license.used}/${license.total})`}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span>Type: {type?.name}</span>
                      <span>Expiry: {license.expiryDate}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors">
                      Upgrade
                    </button>
                    <button className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                      Details
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

export default Licensing;