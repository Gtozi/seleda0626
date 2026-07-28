/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Tag,
  Clock,
  Utensils,
  Wine,
  Users,
  Percent,
  DollarSign,
  Calendar,
  Sparkles,
  Search,
  Filter,
  Plus,
  Copy,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Building2,
  Store as StoreIcon
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function PromotionsPricing() {
  const { addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'happy-hour' | 'combo-meals' | 'set-menus' | 'seasonal' | 'corporate' | 'member' | 'coupons' | 'dynamic' | 'price-lists'>('happy-hour');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'happy-hour', label: 'Happy Hour', icon: Clock },
    { id: 'combo-meals', label: 'Combo Meals', icon: Utensils },
    { id: 'set-menus', label: 'Set Menus', icon: Utensils },
    { id: 'seasonal', label: 'Seasonal Promotions', icon: Sparkles },
    { id: 'corporate', label: 'Corporate Pricing', icon: Building2 },
    { id: 'member', label: 'Member Discounts', icon: Users },
    { id: 'coupons', label: 'Coupons', icon: Tag },
    { id: 'dynamic', label: 'Dynamic Pricing', icon: TrendingUp },
    { id: 'price-lists', label: 'Price Lists', icon: DollarSign },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Promotions & Pricing</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage promotions, discounts, and pricing strategies</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Promotion</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Promotions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">15</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Happy Hour Active</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Coupons Issued</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">247</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Price Lists</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'happy-hour' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Happy Hour module</p>
              <p className="text-xs mt-1">Configure time-based discounts for beverages and food items</p>
            </div>
          </div>
        )}

        {activeTab === 'combo-meals' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Combo Meals module</p>
              <p className="text-xs mt-1">Create bundled meal deals with special pricing</p>
            </div>
          </div>
        )}

        {activeTab === 'set-menus' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Utensils className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Set Menus module</p>
              <p className="text-xs mt-1">Define multi-course set menus for lunch, dinner, and special occasions</p>
            </div>
          </div>
        )}

        {activeTab === 'seasonal' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Seasonal Promotions module</p>
              <p className="text-xs mt-1">Create holiday, festival, and seasonal promotional campaigns</p>
            </div>
          </div>
        )}

        {activeTab === 'corporate' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Corporate Pricing module</p>
              <p className="text-xs mt-1">Configure special pricing for corporate clients and contracts</p>
            </div>
          </div>
        )}

        {activeTab === 'member' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Member Discounts module</p>
              <p className="text-xs mt-1">Manage loyalty member discount tiers and benefits</p>
            </div>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Coupons module</p>
              <p className="text-xs mt-1">Generate and track promotional coupons and vouchers</p>
            </div>
          </div>
        )}

        {activeTab === 'dynamic' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Dynamic Pricing module</p>
              <p className="text-xs mt-1">Configure demand-based and time-based dynamic pricing rules</p>
            </div>
          </div>
        )}

        {activeTab === 'price-lists' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Price Lists module</p>
              <p className="text-xs mt-1">Manage multiple price lists for different outlets and customer segments</p>
            </div>
          </div>
        )}
      </div>

      {/* Outlet-Specific Pricing Panel */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <StoreIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
          Outlet-Specific Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Percent className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Outlet Overrides</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Set custom prices per outlet for any menu item</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Time-Based Pricing</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Adjust prices based on meal periods and time of day</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Copy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Bulk Updates</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Apply price changes across multiple outlets at once</p>
          </div>
        </div>
      </div>
    </div>
  );
}
