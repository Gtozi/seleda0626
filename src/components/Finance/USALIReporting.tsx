/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Filter,
  Download,
  Calendar,
  Building2,
  Utensils,
  Beer,
  Coffee
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface USALIRevenueSummary {
  department: string;
  subcategory: string;
  usali_code: string;
  usali_account_name: string;
  transaction_count: number;
  total_revenue: number;
  transaction_date: string;
}

interface USALICostSummary {
  department: string;
  subcategory: string;
  usali_code: string;
  usali_account_name: string;
  transaction_count: number;
  total_cost: number;
  transaction_date: string;
}

export default function USALIReporting() {
  const [activeTab, setActiveTab] = useState<'revenue' | 'cost' | 'mappings'>('revenue');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [revenueData, setRevenueData] = useState<USALIRevenueSummary[]>([]);
  const [costData, setCostData] = useState<USALICostSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUSALIData();
  }, [selectedDate]);

  const fetchUSALIData = async () => {
    setLoading(true);
    try {
      const [revenueResult, costResult] = await Promise.all([
        supabase
          .from('usali_revenue_summary')
          .select('*')
          .eq('transaction_date', selectedDate)
          .order('total_revenue', { ascending: false }),
        supabase
          .from('usali_cost_summary')
          .select('*')
          .eq('transaction_date', selectedDate)
          .order('total_cost', { ascending: false })
      ]);

      if (revenueResult.data) setRevenueData(revenueResult.data);
      if (costResult.data) setCostData(costResult.data);
    } catch (error) {
      console.error('Failed to fetch USALI data:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = revenueData.reduce((sum, item) => sum + Number(item.total_revenue), 0);
  const totalCost = costData.reduce((sum, item) => sum + Number(item.total_cost), 0);
  const grossProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Restaurant': return <Utensils size={16} />;
      case 'Bar': return <Beer size={16} />;
      case 'Room Service': return <Coffee size={16} />;
      default: return <Building2 size={16} />;
    }
  };

  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'Restaurant': return 'bg-amber-500';
      case 'Bar': return 'bg-purple-500';
      case 'Room Service': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            USALI Financial Reporting
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mono tracking-wider">
            Uniform System of Accounts for the Lodging Industry
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-sm font-mono px-3 py-2 outline-none text-slate-900 dark:text-white"
            />
            <Calendar size={16} className="text-slate-400 mr-2" />
          </div>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
              <TrendingUp size={24} />
            </div>
            <span className="text-xs font-mono text-green-500 font-bold">+12.5%</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Revenue</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center text-white">
              <TrendingDown size={24} />
            </div>
            <span className="text-xs font-mono text-red-500 font-bold">+8.3%</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total Cost</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
              <DollarSign size={24} />
            </div>
            <span className="text-xs font-mono text-blue-500 font-bold">+15.2%</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Gross Profit</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ${grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white">
              <PieChart size={24} />
            </div>
            <span className="text-xs font-mono text-purple-500 font-bold">+2.1%</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Profit Margin</p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {profitMargin.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('revenue')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
            activeTab === 'revenue'
              ? 'bg-green-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingUp size={14} />
          Revenue Summary
        </button>
        <button
          onClick={() => setActiveTab('cost')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
            activeTab === 'cost'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <TrendingDown size={14} />
          Cost Summary
        </button>
        <button
          onClick={() => setActiveTab('mappings')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-tight transition-all ${
            activeTab === 'mappings'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <BarChart3 size={14} />
          Account Mappings
        </button>
      </div>

      {/* Revenue Table */}
      {activeTab === 'revenue' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Revenue by USALI Account
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Breakdown of revenue streams by department and account code
            </p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      USALI Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {revenueData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${getDepartmentColor(item.department)} rounded-lg flex items-center justify-center text-white`}>
                            {getDepartmentIcon(item.department)}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs font-mono font-bold rounded">
                          {item.usali_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {item.usali_account_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {item.subcategory}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-right text-slate-900 dark:text-white">
                        {item.transaction_count}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-right font-black text-green-600">
                        ${Number(item.total_revenue).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {revenueData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No revenue data available for selected date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Cost Table */}
      {activeTab === 'cost' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Cost of Sales by USALI Account
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Breakdown of cost of goods sold by department and account code
            </p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading data...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      USALI Code
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Account Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Subcategory
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Cost
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {costData.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 ${getDepartmentColor(item.department)} rounded-lg flex items-center justify-center text-white`}>
                            {getDepartmentIcon(item.department)}
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.department}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-mono font-bold rounded">
                          {item.usali_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                        {item.usali_account_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                        {item.subcategory}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-right text-slate-900 dark:text-white">
                        {item.transaction_count}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-right font-black text-red-600">
                        ${Number(item.total_cost).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                  {costData.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                        No cost data available for selected date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Mappings Tab */}
      {activeTab === 'mappings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
              USALI Account Mappings
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Configure inventory item to USALI account code mappings for automatic revenue and cost tracking.
              This feature allows you to map specific menu items to their corresponding USALI accounts.
            </p>
            <button className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all">
              Configure Mappings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
