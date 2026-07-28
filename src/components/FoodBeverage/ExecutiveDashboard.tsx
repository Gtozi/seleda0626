/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Utensils,
  Package,
  AlertTriangle,
  CheckCircle2,
  Wifi,
  WifiOff,
  Printer,
  CreditCard,
  Activity,
  Clock,
  Star,
  ChefHat,
  ShoppingCart,
  BarChart3,
  RefreshCw,
  XCircle,
  AlertCircle,
  Coffee,
  Wine,
  Cake,
  Flame,
  Soup,
  Leaf,
  Building2,
  Calendar,
  TrendingDown
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function ExecutiveDashboard() {
  const { formatAmount } = useERP();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Centralized operational view across all F&B outlets</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Executive KPIs - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Today's Revenue"
          value={formatAmount(12500)}
          trend="+8.5%"
          isPositive
          icon={DollarSign}
          color="indigo"
        />
        <KPICard
          label="Covers Served"
          value="284"
          trend="+12.3%"
          isPositive
          icon={Users}
          color="emerald"
        />
        <KPICard
          label="Average Check"
          value={formatAmount(44)}
          trend="+5.1%"
          isPositive
          icon={TrendingUp}
          color="amber"
        />
        <KPICard
          label="Gross Margin"
          value="66.4%"
          trend="+1.2%"
          isPositive
          icon={BarChart3}
          color="purple"
        />
      </div>

      {/* Executive KPIs - Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Food Cost %"
          value="32.5%"
          trend="-1.2%"
          isPositive
          icon={Utensils}
          color="rose"
        />
        <KPICard
          label="Beverage Cost %"
          value="28.5%"
          trend="-0.8%"
          isPositive
          icon={Wine}
          color="blue"
        />
        <KPICard
          label="Inventory Value"
          value={formatAmount(45200)}
          trend="+2.3%"
          isPositive
          icon={Package}
          color="cyan"
        />
        <KPICard
          label="Waste Cost"
          value={formatAmount(450)}
          trend="-5.4%"
          isPositive
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Executive KPIs - Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Purchase Commitments"
          value={formatAmount(8200)}
          trend="+3.1%"
          isPositive={false}
          icon={ShoppingCart}
          color="slate"
        />
        <KPICard
          label="Banquet Revenue"
          value={formatAmount(3200)}
          trend="+15.2%"
          isPositive
          icon={Cake}
          color="pink"
        />
        <KPICard
          label="Room Service Revenue"
          value={formatAmount(1800)}
          trend="+7.8%"
          isPositive
          icon={Coffee}
          color="amber"
        />
        <KPICard
          label="Guest Satisfaction"
          value="4.6/5"
          trend="+0.2"
          isPositive
          icon={Star}
          color="yellow"
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue by Outlet</h3>
          <div className="space-y-3">
            <RevenueRow label="Main Restaurant" value={formatAmount(5200)} percentage="41.6%" />
            <RevenueRow label="Bar Lounge" value={formatAmount(2800)} percentage="22.4%" />
            <RevenueRow label="Room Service" value={formatAmount(1800)} percentage="14.4%" />
            <RevenueRow label="Pool Bar" value={formatAmount(1500)} percentage="12.0%" />
            <RevenueRow label="Coffee Shop" value={formatAmount(1200)} percentage="9.6%" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue by Meal Period</h3>
          <div className="space-y-3">
            <RevenueRow label="Breakfast" value={formatAmount(2200)} percentage="17.6%" />
            <RevenueRow label="Lunch" value={formatAmount(3800)} percentage="30.4%" />
            <RevenueRow label="Dinner" value={formatAmount(5200)} percentage="41.6%" />
            <RevenueRow label="Bar Service" value={formatAmount(1300)} percentage="10.4%" />
          </div>
        </div>
      </div>

      {/* Alerts & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Inventory Alerts</h3>
          <div className="space-y-3">
            <AlertRow label="Low Stock Items" count={12} icon={AlertTriangle} color="amber" />
            <AlertRow label="Expiring Inventory" count={8} icon={Clock} color="red" />
            <AlertRow label="Stockouts" count={3} icon={XCircle} color="red" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Production Status</h3>
          <div className="space-y-3">
            <StatusRow label="Pending Orders" count={8} icon={ChefHat} color="blue" />
            <StatusRow label="In Progress" count={12} icon={Flame} color="amber" />
            <StatusRow label="Ready" count={5} icon={CheckCircle2} color="green" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Staff Productivity</h3>
          <div className="space-y-3">
            <StatusRow label="Active Staff" count={24} icon={Users} color="green" />
            <StatusRow label="Orders per Staff" count="11.8" icon={Utensils} color="blue" />
            <StatusRow label="Avg Service Time" count="18 min" icon={Clock} color="amber" />
          </div>
        </div>
      </div>

      {/* Live Operations */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Live Operations
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <LiveStatus label="POS Status" status="online" icon={Wifi} />
          <LiveStatus label="Kitchen (KDS)" status="online" icon={ChefHat} />
          <LiveStatus label="Integration" status="online" icon={Activity} />
          <LiveStatus label="Payment Gateway" status="online" icon={CreditCard} />
          <LiveStatus label="Printers" status="warning" icon={Printer} />
          <LiveStatus label="Offline POS" count={0} icon={WifiOff} />
          <LiveStatus label="Outlet Status" status="online" icon={Building2} />
        </div>
      </div>

      {/* Top Selling & Slow Moving */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Selling Items</h3>
          <div className="space-y-3">
            <ItemRow name="Grilled Salmon" quantity={45} revenue={formatAmount(2250)} />
            <ItemRow name="Beef Tenderloin" quantity={38} revenue={formatAmount(2660)} />
            <ItemRow name="Caesar Salad" quantity={52} revenue={formatAmount(1560)} />
            <ItemRow name="Signature Cocktail" quantity={64} revenue={formatAmount(1920)} />
            <ItemRow name="Chocolate Lava Cake" quantity={41} revenue={formatAmount(1230)} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Slow Moving Items</h3>
          <div className="space-y-3">
            <ItemRow name="Lamb Shank" quantity={5} revenue={formatAmount(350)} />
            <ItemRow name="Seafood Platter" quantity={3} revenue={formatAmount(240)} />
            <ItemRow name="Vegetarian Curry" quantity={4} revenue={formatAmount(160)} />
            <ItemRow name="Premium Wine (2018)" quantity={2} revenue={formatAmount(180)} />
            <ItemRow name="Artisan Cheese Board" quantity={6} revenue={formatAmount(240)} />
          </div>
        </div>
      </div>

      {/* Daily Exceptions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Daily Exceptions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExceptionCard title="High Void Rate" value="3.2%" threshold="2.0%" status="warning" />
          <ExceptionCard title="Low Inventory" items="12" status="warning" />
          <ExceptionCard title="Service Delays" count={4} status="warning" />
        </div>
      </div>
    </div>
  );
}

// Helper Components
function KPICard({ label, value, trend, isPositive, icon: Icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    rose: 'bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
    orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    slate: 'bg-slate-100 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400',
    pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          <p className={`text-xs mt-1 ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {trend}
          </p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function RevenueRow({ label, value, percentage }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-slate-900 dark:text-white">{value}</span>
        <span className="text-xs text-slate-500">{percentage}</span>
      </div>
    </div>
  );
}

function AlertRow({ label, count, icon: Icon, color }: any) {
  const colorClasses = {
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${colorClasses[color as keyof typeof colorClasses]}`} />
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
    </div>
  );
}

function StatusRow({ label, count, icon: Icon, color }: any) {
  const colorClasses = {
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <div className="flex items-center gap-3">
        <Icon className={`w-4 h-4 ${colorClasses[color as keyof typeof colorClasses]}`} />
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
    </div>
  );
}

function LiveStatus({ label, status, count, icon: Icon }: any) {
  const statusColor = status === 'online' ? 'text-green-600 dark:text-green-400' : 
                      status === 'warning' ? 'text-amber-600 dark:text-amber-400' : 
                      'text-red-600 dark:text-red-400';

  return (
    <div className="flex flex-col items-center p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <Icon className={`w-5 h-5 ${statusColor} mb-2`} />
      <span className="text-xs text-slate-600 dark:text-slate-400 text-center">{label}</span>
      {count !== undefined ? (
        <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
      ) : (
        <span className={`text-xs font-bold ${statusColor}`}>{status}</span>
      )}
    </div>
  );
}

function ItemRow({ name, quantity, revenue }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
      <div>
        <p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p>
        <p className="text-xs text-slate-500">{quantity} sold</p>
      </div>
      <span className="text-sm font-bold text-slate-900 dark:text-white">{revenue}</span>
    </div>
  );
}

function ExceptionCard({ title, value, threshold, items, count, status }: any) {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
          {value || items || count}
        </span>
        {threshold && <span className="text-xs text-slate-500">/ {threshold}</span>}
      </div>
      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Action required</p>
    </div>
  );
}
