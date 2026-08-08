import React, { useState } from 'react';
import { CreditCard, Plus, Edit, Search, Filter, CheckCircle, AlertTriangle, DollarSign, Lock, Zap } from 'lucide-react';

interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  type: 'credit_card' | 'debit_card' | 'digital_wallet' | 'bank_transfer' | 'crypto' | 'installment';
  status: 'active' | 'inactive' | 'testing';
  currencies: string[];
  feePercentage: number;
  dailyLimit: number;
  lastTransaction: string;
}

const PaymentGatewayConfiguration: React.FC = () => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([
    { id: '1', name: 'Stripe Credit Card', provider: 'Stripe', type: 'credit_card', status: 'active', currencies: ['USD', 'EUR', 'GBP'], feePercentage: 2.9, dailyLimit: 50000, lastTransaction: '2024-01-15 14:30' },
    { id: '2', name: 'PayPal', provider: 'PayPal', type: 'digital_wallet', status: 'active', currencies: ['USD', 'EUR'], feePercentage: 3.4, dailyLimit: 30000, lastTransaction: '2024-01-15 14:25' },
    { id: '3', name: 'Apple Pay', provider: 'Apple', type: 'digital_wallet', status: 'active', currencies: ['USD', 'EUR', 'GBP'], feePercentage: 2.5, dailyLimit: 40000, lastTransaction: '2024-01-15 14:20' },
    { id: '4', name: 'Google Pay', provider: 'Google', type: 'digital_wallet', status: 'active', currencies: ['USD', 'EUR'], feePercentage: 2.5, dailyLimit: 40000, lastTransaction: '2024-01-15 14:15' },
    { id: '5', name: 'Bank Transfer', provider: 'SWIFT', type: 'bank_transfer', status: 'active', currencies: ['USD', 'EUR', 'GBP'], feePercentage: 1.0, dailyLimit: 100000, lastTransaction: '2024-01-15 13:45' },
    { id: '6', name: 'Klarna Installments', provider: 'Klarna', type: 'installment', status: 'testing', currencies: ['USD', 'EUR'], feePercentage: 4.5, dailyLimit: 20000, lastTransaction: '2024-01-14 16:00' },
    { id: '7', name: 'Bitcoin', provider: 'BitPay', type: 'crypto', status: 'inactive', currencies: ['BTC', 'ETH'], feePercentage: 1.0, dailyLimit: 10000, lastTransaction: '2024-01-10 09:00' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredGateways = gateways.filter(gateway => {
    const matchesSearch = gateway.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         gateway.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || gateway.type === filterType;
    const matchesStatus = filterStatus === 'all' || gateway.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const gatewayTypes = [
    { id: 'credit_card', name: 'Credit Card', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'debit_card', name: 'Debit Card', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'digital_wallet', name: 'Digital Wallet', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'bank_transfer', name: 'Bank Transfer', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'crypto', name: 'Cryptocurrency', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'installment', name: 'Installment', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'testing': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Payment Gateway Configuration</h1>
          <p className="text-xs text-slate-400">Configure providers, currencies, settlement rules, refund rules, PCI settings, and fraud detection</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Gateway
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Gateways', value: gateways.length, icon: CreditCard, color: 'text-blue-600' },
          { label: 'Active', value: gateways.filter(g => g.status === 'active').length, icon: CheckCircle, color: 'text-emerald-600' },
          { label: 'Daily Volume', value: '$125K', icon: DollarSign, color: 'text-purple-600' },
          { label: 'Avg Fee', value: '2.8%', icon: Zap, color: 'text-amber-600' },
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
              placeholder="Search payment gateways..."
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
              {gatewayTypes.map(type => (
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

      {/* Payment Gateways Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Payment Gateways</h3>
            <p className="text-xs text-slate-400">Payment processing setup</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGateways.map((gateway) => {
            const type = gatewayTypes.find(t => t.id === gateway.type);
            return (
              <div key={gateway.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{gateway.name}</h4>
                      <span className="text-xs text-slate-500">{gateway.provider}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(gateway.status)}`}>
                    {gateway.status}
                  </span>
                </div>

                <div className="mb-4">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${type?.color}`}>
                    {type?.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <DollarSign size={12} />
                      Fee
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{gateway.feePercentage}%</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Lock size={12} />
                      Daily Limit
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">${gateway.dailyLimit.toLocaleString()}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Currencies</div>
                  <div className="flex flex-wrap gap-1">
                    {gateway.currencies.map((currency, index) => (
                      <span key={index} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] text-slate-600 dark:text-slate-400">
                        {currency}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Zap size={12} />
                    Last: {gateway.lastTransaction}
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

      {/* Payment Configuration Features */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Payment Configuration</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Providers', icon: CreditCard, color: 'text-blue-600' },
            { name: 'Currencies', icon: DollarSign, color: 'text-purple-600' },
            { name: 'Settlement Rules', icon: Lock, color: 'text-emerald-600' },
            { name: 'Refund Rules', icon: Zap, color: 'text-amber-600' },
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

export default PaymentGatewayConfiguration;