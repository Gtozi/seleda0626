/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Utensils,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  ShoppingCart,
  Heart,
  Shield,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  Bed,
  Calendar,
  Bell
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function RoomServiceManagement() {
  const { formatAmount } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const features = [
    { id: 'menu', name: 'Room Service Menu', icon: Utensils },
    { id: 'delivery', name: 'Scheduled Delivery', icon: Clock },
    { id: 'butler', name: 'Butler Assignment', icon: User },
    { id: 'tracking', name: 'Delivery Tracking', icon: MapPin },
    { id: 'tray', name: 'Tray Collection', icon: ShoppingCart },
    { id: 'preferences', name: 'Guest Preferences', icon: Heart },
    { id: 'validation', name: 'Room Charge Validation', icon: Shield },
    { id: 'performance', name: 'Delivery Performance', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Room Service Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Integrated with the PMS for seamless room service</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Orders" value="8" icon={Bell} color="indigo" />
        <KPICard label="Delivered Today" value="42" icon={CheckCircle2} color="green" />
        <KPICard label="Avg Delivery Time" value="18 min" icon={Clock} color="amber" />
        <KPICard label="Today's Revenue" value={formatAmount(3200)} icon={TrendingUp} color="purple" />
      </div>

      {/* Features Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Room Service Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{feature.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Feature</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          <Bed className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Room Service Management module</p>
          <p className="text-xs mt-1">Manage room service orders, delivery, and guest preferences</p>
        </div>
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Utensils className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Take Order</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Create new room service order</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Track Delivery</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">View delivery status</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Tray Collection</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Schedule tray pickup</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function KPICard({ label, value, icon: Icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
