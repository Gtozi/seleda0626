import React, { useState } from 'react';
import { DollarSign, Percent, Globe, Calculator, RefreshCw, Search, Plus, Settings, Activity, CheckCircle, XCircle, AlertTriangle, TrendingUp, Filter, MoreVertical, Calendar, Coins } from 'lucide-react';

interface TaxRule {
  id: string;
  name: string;
  type: 'vat' | 'tourism_tax' | 'service_charge' | 'city_tax' | 'other';
  rate: number;
  applicability: 'all' | 'room_only' | 'food_beverage' | 'services';
  status: 'active' | 'inactive' | 'scheduled';
  effectiveDate: string;
  expiryDate?: string;
  description: string;
}

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  lastUpdated: string;
  source: 'manual' | 'api' | 'bank';
  status: 'current' | 'expired' | 'pending';
}

interface CurrencyRounding {
  id: string;
  currency: string;
  roundingMethod: 'nearest' | 'up' | 'down' | 'bankers';
  precision: number;
  minimumUnit: number;
}

const RateTaxConfiguration: React.FC = () => {
  const [taxRules, setTaxRules] = useState<TaxRule[]>([
    { id: '1', name: 'Standard VAT', type: 'vat', rate: 20, applicability: 'all', status: 'active', effectiveDate: '2024-01-01', description: 'Standard Value Added Tax for all services' },
    { id: '2', name: 'Tourism Tax', type: 'tourism_tax', rate: 2, applicability: 'room_only', status: 'active', effectiveDate: '2024-01-01', description: 'Mandatory tourism tax per night' },
    { id: '3', name: 'Service Charge', type: 'service_charge', rate: 10, applicability: 'all', status: 'active', effectiveDate: '2024-01-01', description: 'Service charge for hospitality services' },
    { id: '4', name: 'City Tax', type: 'city_tax', rate: 1.5, applicability: 'room_only', status: 'active', effectiveDate: '2024-01-01', description: 'Local city accommodation tax' },
    { id: '5', name: 'Reduced VAT', type: 'vat', rate: 10, applicability: 'food_beverage', status: 'scheduled', effectiveDate: '2024-02-01', description: 'Reduced VAT rate for food and beverage' },
  ]);

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([
    { id: '1', fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.92, lastUpdated: '2024-01-15 14:30', source: 'api', status: 'current' },
    { id: '2', fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.79, lastUpdated: '2024-01-15 14:30', source: 'api', status: 'current' },
    { id: '3', fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.09, lastUpdated: '2024-01-15 14:30', source: 'api', status: 'current' },
    { id: '4', fromCurrency: 'USD', toCurrency: 'ETB', rate: 56.5, lastUpdated: '2024-01-15 14:30', source: 'bank', status: 'current' },
    { id: '5', fromCurrency: 'USD', toCurrency: 'JPY', rate: 148.2, lastUpdated: '2024-01-14 09:00', source: 'api', status: 'expired' },
  ]);

  const [currencyRounding, setCurrencyRounding] = useState<CurrencyRounding[]>([
    { id: '1', currency: 'USD', roundingMethod: 'nearest', precision: 2, minimumUnit: 0.01 },
    { id: '2', currency: 'EUR', roundingMethod: 'nearest', precision: 2, minimumUnit: 0.01 },
    { id: '3', currency: 'GBP', roundingMethod: 'nearest', precision: 2, minimumUnit: 0.01 },
    { id: '4', currency: 'ETB', roundingMethod: 'nearest', precision: 2, minimumUnit: 0.01 },
    { id: '5', currency: 'JPY', roundingMethod: 'nearest', precision: 0, minimumUnit: 1 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'tax_rules' | 'vat' | 'tourism_tax' | 'service_charge' | 'exchange_rates' | 'currency_rounding'>('tax_rules');

  const filteredTaxRules = taxRules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || rule.type === filterType;
    const matchesStatus = filterStatus === 'all' || rule.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const taxTypes = [
    { id: 'vat', name: 'VAT', icon: Percent, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'tourism_tax', name: 'Tourism Tax', icon: Globe, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'service_charge', name: 'Service Charge', icon: DollarSign, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'city_tax', name: 'City Tax', icon: Calculator, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'other', name: 'Other', icon: Settings, color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': case 'current': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': case 'expired': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'scheduled': case 'pending': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const getApplicabilityColor = (applicability: string) => {
    switch (applicability) {
      case 'all': return 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400';
      case 'room_only': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'food_beverage': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'services': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  const taxStats = [
    { label: 'Total Tax Rules', value: taxRules.length, icon: Calculator, color: 'text-blue-600' },
    { label: 'Active Rules', value: taxRules.filter(t => t.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Scheduled', value: taxRules.filter(t => t.status === 'scheduled').length, icon: Calendar, color: 'text-amber-600' },
    { label: 'Exchange Rates', value: exchangeRates.filter(e => e.status === 'current').length, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Currencies', value: currencyRounding.length, icon: Coins, color: 'text-cyan-600' },
    { label: 'Avg Tax Rate', value: `${(taxRules.reduce((acc, t) => acc + t.rate, 0) / taxRules.length).toFixed(1)}%`, icon: Percent, color: 'text-rose-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Rate & Tax Configuration</h1>
          <p className="text-xs text-slate-400">Configure tax rules, VAT, tourism tax, service charge, exchange rates, and currency rounding</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Tax Rule
        </button>
      </div>

      {/* Tax Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {taxStats.map((stat, index) => {
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tax_rules')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'tax_rules'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tax Rules
        </button>
        <button
          onClick={() => setActiveTab('vat')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'vat'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          VAT
        </button>
        <button
          onClick={() => setActiveTab('tourism_tax')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'tourism_tax'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tourism Tax
        </button>
        <button
          onClick={() => setActiveTab('service_charge')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'service_charge'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Service Charge
        </button>
        <button
          onClick={() => setActiveTab('exchange_rates')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'exchange_rates'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Exchange Rates
        </button>
        <button
          onClick={() => setActiveTab('currency_rounding')}
          className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'currency_rounding'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Currency Rounding
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tax rules..."
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
              {taxTypes.map(type => (
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
              <option value="scheduled">Scheduled</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {(activeTab === 'tax_rules' || activeTab === 'vat' || activeTab === 'tourism_tax' || activeTab === 'service_charge') && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Tax Rule</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Applicability</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Effective Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {filteredTaxRules
                  .filter(rule => {
                    if (activeTab === 'tax_rules') return true;
                    if (activeTab === 'vat') return rule.type === 'vat';
                    if (activeTab === 'tourism_tax') return rule.type === 'tourism_tax';
                    if (activeTab === 'service_charge') return rule.type === 'service_charge';
                    return true;
                  })
                  .map((rule) => {
                    const type = taxTypes.find(t => t.id === rule.type);
                    const TypeIcon = type?.icon || Calculator;
                    return (
                      <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                              <TypeIcon size={20} />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-slate-900 dark:text-white">{rule.name}</div>
                              <div className="text-[10px] text-slate-400">{rule.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{type?.name}</td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{rule.rate}%</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getApplicabilityColor(rule.applicability)}`}>
                            {rule.applicability.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(rule.status)}`}>
                            {rule.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{rule.effectiveDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit rule">
                              <Settings size={14} className="text-indigo-600" />
                            </button>
                            <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Duplicate">
                              <Plus size={14} className="text-amber-600" />
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

      {activeTab === 'exchange_rates' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Exchange Rates</h3>
              <p className="text-xs text-slate-400">Manage currency conversion rates</p>
            </div>
            <button className="px-3 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
              <RefreshCw size={14} />
              Update All Rates
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">From</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">To</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Updated</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {exchangeRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{rate.fromCurrency}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{rate.toCurrency}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{rate.rate.toFixed(4)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase">
                        {rate.source}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{rate.lastUpdated}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(rate.status)}`}>
                        {rate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Update rate">
                          <RefreshCw size={14} className="text-indigo-600" />
                        </button>
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition" title="Edit rate">
                          <Settings size={14} className="text-amber-600" />
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

      {activeTab === 'currency_rounding' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">Currency Rounding Rules</h3>
              <p className="text-xs text-slate-400">Configure rounding methods and precision for each currency</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Currency</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Rounding Method</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Precision</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Minimum Unit</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {currencyRounding.map((rounding) => (
                  <tr key={rounding.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 flex items-center justify-center">
                          <Coins size={20} />
                        </div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{rounding.currency}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400 capitalize">
                        {rounding.roundingMethod.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{rounding.precision} decimal places</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{rounding.minimumUnit}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1.5 hover:bg-indigo-50 rounded-lg transition" title="Edit rounding">
                          <Settings size={14} className="text-indigo-600" />
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

      {/* Tax Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Tax Summary</h3>
            <p className="text-xs text-slate-400">Overview of applicable taxes and charges</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {taxRules.filter(t => t.status === 'active').map((rule) => {
            const type = taxTypes.find(t => t.id === rule.type);
            const TypeIcon = type?.icon || Calculator;
            return (
              <div key={rule.id} className="border border-slate-200 dark:border-slate-800 p-4 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                    <TypeIcon size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{rule.name}</div>
                    <div className="text-[10px] text-slate-400">{type?.name}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400">Rate</div>
                    <div className="text-lg font-black text-slate-900 dark:text-white">{rule.rate}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Applies To</div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 capitalize">{rule.applicability.replace('_', ' ')}</div>
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

export default RateTaxConfiguration;