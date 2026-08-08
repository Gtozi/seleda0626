import React, { useState } from 'react';
import { Zap, Plus, Edit, Search, Filter, Play, Pause, Clock, DollarSign, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

interface BusinessRule {
  id: string;
  name: string;
  type: 'minimum_stay' | 'dynamic_pricing' | 'cancellation_policy' | 'vip_upgrade' | 'housekeeping_priority' | 'overtime' | 'tax_calculation' | 'service_charge';
  description: string;
  status: 'active' | 'inactive' | 'testing';
  priority: 'high' | 'medium' | 'low';
  lastExecuted: string;
  executionCount: number;
}

const BusinessRulesEngine: React.FC = () => {
  const [rules, setRules] = useState<BusinessRule[]>([
    { id: '1', name: 'Minimum Stay Requirement', type: 'minimum_stay', description: 'Enforce minimum stay requirements based on season and room type', status: 'active', priority: 'high', lastExecuted: '2024-01-15 14:30', executionCount: 1520 },
    { id: '2', name: 'Dynamic Pricing Algorithm', type: 'dynamic_pricing', description: 'Automated pricing adjustments based on demand and competition', status: 'active', priority: 'high', lastExecuted: '2024-01-15 14:00', executionCount: 845 },
    { id: '3', name: 'Cancellation Policy Engine', type: 'cancellation_policy', description: 'Apply cancellation fees based on timing and guest type', status: 'active', priority: 'medium', lastExecuted: '2024-01-15 13:45', executionCount: 320 },
    { id: '4', name: 'VIP Upgrade Rules', type: 'vip_upgrade', description: 'Automatic room upgrades for VIP guests', status: 'active', priority: 'medium', lastExecuted: '2024-01-15 12:30', executionCount: 85 },
    { id: '5', name: 'Housekeeping Priority Logic', type: 'housekeeping_priority', description: 'Prioritize room cleaning based on check-in times', status: 'active', priority: 'high', lastExecuted: '2024-01-15 14:15', executionCount: 2100 },
    { id: '6', name: 'Overtime Calculation', type: 'overtime', description: 'Calculate overtime pay for staff based on labor laws', status: 'active', priority: 'medium', lastExecuted: '2024-01-15 08:00', executionCount: 45 },
    { id: '7', name: 'Tax Calculation Engine', type: 'tax_calculation', description: 'Compute taxes based on location and guest type', status: 'active', priority: 'high', lastExecuted: '2024-01-15 14:25', executionCount: 1850 },
    { id: '8', name: 'Service Charge Rules', type: 'service_charge', description: 'Apply service charges based on service type and amount', status: 'testing', priority: 'low', lastExecuted: '2024-01-14 16:00', executionCount: 120 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || rule.type === filterType;
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleRule = (id: string) => {
    setRules(rules.map(rule => 
      rule.id === id 
        ? { ...rule, status: rule.status === 'active' ? 'inactive' : 'active' }
        : rule
    ));
  };

  const ruleTypes = [
    { id: 'minimum_stay', name: 'Minimum Stay', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'dynamic_pricing', name: 'Dynamic Pricing', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'cancellation_policy', name: 'Cancellation Policy', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'vip_upgrade', name: 'VIP Upgrade', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'housekeeping_priority', name: 'Housekeeping Priority', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'overtime', name: 'Overtime', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'tax_calculation', name: 'Tax Calculation', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
    { id: 'service_charge', name: 'Service Charge', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'testing': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400';
      case 'medium': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'low': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Business Rules Engine</h1>
          <p className="text-xs text-slate-400">Configure business rules for automated decision-making</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Create Rule
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Rules', value: rules.length, icon: Zap, color: 'text-blue-600' },
          { label: 'Active', value: rules.filter(r => r.status === 'active').length, icon: Play, color: 'text-emerald-600' },
          { label: 'Total Executions', value: rules.reduce((sum, r) => sum + r.executionCount, 0).toLocaleString(), icon: CheckCircle, color: 'text-purple-600' },
          { label: 'High Priority', value: rules.filter(r => r.priority === 'high').length, icon: AlertTriangle, color: 'text-amber-600' },
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
              placeholder="Search business rules..."
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
              {ruleTypes.map(type => (
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
              <option value="inactive">Inactive</option>
              <option value="testing">Testing</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Business Rules Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Rule Configuration</h3>
            <p className="text-xs text-slate-400">Automated business logic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => {
            const type = ruleTypes.find(t => t.id === rule.type);
            return (
              <div key={rule.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{rule.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${type?.color}`}>
                        {type?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {rule.status === 'active' ? (
                      <Pause size={20} className="text-amber-500" />
                    ) : (
                      <Play size={20} className="text-emerald-500" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-4">{rule.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={12} className="text-slate-400" />
                    <span className="text-slate-500">Executions</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rule.executionCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-slate-500">Last Run</span>
                    <span className="font-bold text-slate-900 dark:text-white">{rule.lastExecuted.split(' ')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(rule.status)}`}>
                      {rule.status}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getPriorityColor(rule.priority)}`}>
                      {rule.priority}
                    </span>
                  </div>
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

      {/* Rule Types Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Rule Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ruleTypes.map((type) => (
            <div key={type.id} className={`p-3 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
              <Zap size={20} className="mb-2" />
              <span className="text-xs font-bold">{type.name}</span>
              <span className="text-[10px] opacity-75">{rules.filter(r => r.type === type.id).length} rules</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessRulesEngine;