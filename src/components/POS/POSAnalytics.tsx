/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface POSAnalyticsProps {
  outletId?: string;
  outletName?: string;
}

interface MetricCard {
  label: string;
  value: string;
  change: number;
  icon: React.ElementType;
  trend: 'up' | 'down' | 'neutral';
}

interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}

interface HourlyData {
  hour: number;
  sales: number;
  orders: number;
}

export default function POSAnalytics({ outletId, outletName }: POSAnalyticsProps) {
  const { formatAmount, addNotification } = useERP();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('today');
  const [refreshing, setRefreshing] = useState(false);
  
  // Analytics data
  const [metrics, setMetrics] = useState<MetricCard[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<{ method: string; amount: number; percentage: number }[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // In production, this would fetch from actual analytics endpoints
      // For now, we'll simulate with realistic data
      
      // Simulate metrics based on date range
      const multiplier = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : 30;
      
      const simulatedMetrics: MetricCard[] = [
        {
          label: 'Total Revenue',
          value: formatAmount(15420 * multiplier),
          change: 12.5,
          icon: DollarSign,
          trend: 'up'
        },
        {
          label: 'Total Orders',
          value: (234 * multiplier).toString(),
          change: 8.3,
          icon: ShoppingCart,
          trend: 'up'
        },
        {
          label: 'Average Order Value',
          value: formatAmount(65.90),
          change: -2.1,
          icon: Target,
          trend: 'down'
        },
        {
          label: 'Customers Served',
          value: (312 * multiplier).toString(),
          change: 15.2,
          icon: Users,
          trend: 'up'
        },
        {
          label: 'Table Turnover',
          value: '4.2x',
          change: 5.8,
          icon: Clock,
          trend: 'up'
        },
        {
          label: 'Payment Success Rate',
          value: '98.5%',
          change: 0.3,
          icon: Award,
          trend: 'up'
        }
      ];

      const simulatedTopItems: TopItem[] = [
        { name: 'Grilled Salmon', quantity: 45, revenue: 3150 },
        { name: 'Beef Tenderloin', quantity: 38, revenue: 2850 },
        { name: 'Caesar Salad', quantity: 62, revenue: 1860 },
        { name: 'Chocolate Lava Cake', quantity: 55, revenue: 1650 },
        { name: 'House Red Wine', quantity: 48, revenue: 1440 }
      ];

      const simulatedHourlyData: HourlyData[] = Array.from({ length: 12 }, (_, i) => ({
        hour: i + 11,
        sales: Math.floor(Math.random() * 2000) + 500,
        orders: Math.floor(Math.random() * 30) + 10
      }));

      const simulatedPaymentMethods = [
        { method: 'Cash', amount: 6200 * multiplier, percentage: 40.2 },
        { method: 'Card', amount: 7150 * multiplier, percentage: 46.4 },
        { method: 'Mobile', amount: 1850 * multiplier, percentage: 12.0 },
        { method: 'Room Charge', amount: 220 * multiplier, percentage: 1.4 }
      ];

      const simulatedRecentTransactions = [
        { id: 'TXN-001', time: '2 min ago', amount: 85.50, method: 'Card', status: 'completed' },
        { id: 'TXN-002', time: '5 min ago', amount: 124.00, method: 'Cash', status: 'completed' },
        { id: 'TXN-003', time: '8 min ago', amount: 45.00, method: 'Mobile', status: 'completed' },
        { id: 'TXN-004', time: '12 min ago', amount: 215.00, method: 'Card', status: 'completed' },
        { id: 'TXN-005', time: '15 min ago', amount: 67.50, method: 'Cash', status: 'completed' }
      ];

      setMetrics(simulatedMetrics);
      setTopItems(simulatedTopItems);
      setHourlyData(simulatedHourlyData);
      setPaymentMethods(simulatedPaymentMethods);
      setRecentTransactions(simulatedRecentTransactions);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      addNotification('Failed to load analytics data', 'warning', 'F&B');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange, outletId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalyticsData();
  };

  const maxHourlySales = Math.max(...hourlyData.map(d => d.sales), 1);

  const MetricCard = ({ metric }: { metric: MetricCard }) => {
    const Icon = metric.icon;
    const TrendIcon = metric.trend === 'up' ? ArrowUpRight : metric.trend === 'down' ? ArrowDownRight : Activity;
    const trendColor = metric.trend === 'up' ? 'text-emerald-500' : metric.trend === 'down' ? 'text-rose-500' : 'text-slate-500';

    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon size={14} />
            <span className="text-xs font-bold">{metric.change > 0 ? '+' : ''}{metric.change}%</span>
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
          {metric.value}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
          {metric.label}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            POS Analytics
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {outletName || 'All Outlets'} • Performance Overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  dateRange === range
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600" />
                Hourly Sales
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Sales performance throughout the day
              </p>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {hourlyData.map((data) => (
              <div key={data.hour} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-t-lg relative group">
                  <div
                    className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 group-hover:from-indigo-500 group-hover:to-indigo-300"
                    style={{ height: `${(data.sales / maxHourlySales) * 100}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {formatAmount(data.sales)}
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  {data.hour}:00
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <PieChart size={20} className="text-indigo-600" />
                Payment Methods
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Revenue by payment type
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {paymentMethods.map((pm) => (
              <div key={pm.method} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {pm.method}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {pm.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${pm.percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {formatAmount(pm.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-indigo-600" />
                Top Selling Items
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Best performers by revenue
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {topItems.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500' :
                    index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                    'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {item.quantity} sold
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                  {formatAmount(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-indigo-600" />
                Recent Transactions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Latest sales activity
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((txn) => (
              <div
                key={txn.id}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {txn.id}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      {txn.time} • {txn.method}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatAmount(txn.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
