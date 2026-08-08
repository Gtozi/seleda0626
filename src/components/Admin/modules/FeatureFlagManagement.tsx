import React, { useState } from 'react';
import { Flag, ToggleRight, ToggleLeft, Plus, Edit, Search, Filter, Zap, Users, Building2, Globe, TestTube, CheckCircle, XCircle } from 'lucide-react';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  scope: 'property' | 'brand' | 'user_group' | 'role' | 'environment' | 'country';
  enabled: boolean;
  rolloutPercentage: number;
  targetAudience: string[];
  status: 'active' | 'pending' | 'completed';
  createdAt: string;
  lastModified: string;
}

const FeatureFlagManagement: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([
    { id: '1', name: 'New Booking Flow', description: 'Redesigned booking interface with improved UX', scope: 'property', enabled: true, rolloutPercentage: 100, targetAudience: ['Grand Hotel Paris', 'Seaside Resort'], status: 'active', createdAt: '2024-01-10', lastModified: '2024-01-15' },
    { id: '2', name: 'Mobile Check-In', description: 'Guest mobile app check-in functionality', scope: 'property', enabled: true, rolloutPercentage: 75, targetAudience: ['Grand Hotel Paris'], status: 'active', createdAt: '2024-01-08', lastModified: '2024-01-14' },
    { id: '3', name: 'AI Pricing Recommendations', description: 'Dynamic pricing suggestions using ML', scope: 'brand', enabled: true, rolloutPercentage: 50, targetAudience: ['Luxury Hotels'], status: 'active', createdAt: '2024-01-05', lastModified: '2024-01-12' },
    { id: '4', name: 'Voice Commands', description: 'Voice-activated room controls', scope: 'property', enabled: false, rolloutPercentage: 0, targetAudience: ['All Properties'], status: 'pending', createdAt: '2024-01-12', lastModified: '2024-01-12' },
    { id: '5', name: 'Enhanced Housekeeping Dashboard', description: 'New visual housekeeping management interface', scope: 'role', enabled: true, rolloutPercentage: 100, targetAudience: ['Housekeeping Manager', 'Executive'], status: 'completed', createdAt: '2024-01-01', lastModified: '2024-01-10' },
    { id: '6', name: 'Multi-Language Support', description: 'Additional language support for guest portal', scope: 'country', enabled: true, rolloutPercentage: 100, targetAudience: ['France', 'Germany', 'Spain'], status: 'completed', createdAt: '2023-12-15', lastModified: '2024-01-08' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterScope, setFilterScope] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScope = filterScope === 'all' || flag.scope === filterScope;
    const matchesStatus = filterStatus === 'all' || flag.status === filterStatus;
    return matchesSearch && matchesScope && matchesStatus;
  });

  const toggleFlag = (id: string) => {
    setFeatureFlags(flags => flags.map(flag => 
      flag.id === id 
        ? { ...flag, enabled: !flag.enabled }
        : flag
    ));
  };

  const scopes = [
    { id: 'property', name: 'Property', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'brand', name: 'Brand', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'user_group', name: 'User Group', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'role', name: 'Role', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'environment', name: 'Environment', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'country', name: 'Country', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'pending': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'completed': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'property': return <Building2 size={16} />;
      case 'brand': return <Flag size={16} />;
      case 'user_group': return <Users size={16} />;
      case 'role': return <Users size={16} />;
      case 'environment': return <Globe size={16} />;
      case 'country': return <Globe size={16} />;
      default: return <Flag size={16} />;
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Feature Flag Management</h1>
          <p className="text-xs text-slate-400">Enable or disable features by property, brand, user group, role, environment, or country</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <TestTube size={16} />
            A/B Testing
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Add Feature Flag
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Flags', value: featureFlags.length, icon: Flag, color: 'text-blue-600' },
          { label: 'Active', value: featureFlags.filter(f => f.enabled).length, icon: Zap, color: 'text-emerald-600' },
          { label: 'In Rollout', value: featureFlags.filter(f => f.rolloutPercentage > 0 && f.rolloutPercentage < 100).length, icon: CheckCircle, color: 'text-purple-600' },
          { label: 'Completed', value: featureFlags.filter(f => f.status === 'completed').length, icon: CheckCircle, color: 'text-amber-600' },
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
              placeholder="Search feature flags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterScope}
              onChange={(e) => setFilterScope(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Scopes</option>
              {scopes.map(scope => (
                <option key={scope.id} value={scope.id}>{scope.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Feature Flags Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Feature Flags</h3>
            <p className="text-xs text-slate-400">Supports phased rollouts and A/B testing</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFlags.map((flag) => {
            const scope = scopes.find(s => s.id === flag.scope);
            return (
              <div key={flag.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Flag size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{flag.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${scope?.color}`}>
                        {scope?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFlag(flag.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {flag.enabled ? (
                      <ToggleRight size={20} className="text-emerald-500" />
                    ) : (
                      <ToggleLeft size={20} className="text-slate-400" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-4">{flag.description}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Rollout</span>
                    <span className="font-bold text-slate-900 dark:text-white">{flag.rolloutPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all" 
                      style={{ width: `${flag.rolloutPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Target Audience</div>
                  <div className="flex flex-wrap gap-1">
                    {flag.targetAudience.slice(0, 2).map((audience, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                        {audience}
                      </span>
                    ))}
                    {flag.targetAudience.length > 2 && (
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                        +{flag.targetAudience.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(flag.status)}`}>
                    {flag.status}
                  </span>
                  <div className="flex gap-2">
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

      {/* Scope Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Feature Flag Scopes</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {scopes.map((scope) => (
            <div key={scope.id} className={`p-3 rounded-xl ${scope.color} flex flex-col items-center justify-center`}>
              {getScopeIcon(scope.id)}
              <span className="text-xs font-bold mt-2">{scope.name}</span>
              <span className="text-[10px] opacity-75">{featureFlags.filter(f => f.scope === scope.id).length} flags</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeatureFlagManagement;