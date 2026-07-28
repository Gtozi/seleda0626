/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Wine,
  Coffee,
  Beer,
  Droplets,
  Package,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Clock,
  Star,
  Calculator,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function BeverageManagement() {
  const { formatAmount } = useERP();
  const [activeTab, setActiveTab] = useState<'inventory' | 'wine-cellar' | 'control'>('inventory');

  const tabs = [
    { id: 'inventory', label: 'Beverage Inventory', icon: Package },
    { id: 'wine-cellar', label: 'Wine Cellar', icon: Wine },
    { id: 'control', label: 'Beverage Control', icon: Calculator },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Beverage Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Beverage inventory, wine cellar, and cost control</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add Beverage</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Beverages</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">342</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Wine Collection</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">156</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <Wine className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Beverage Cost %</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">28.5%</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pour Cost</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">22.3%</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Droplets className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
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
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Wine className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Wine
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">156</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Beer className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Spirits
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">84</p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Beer className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  Beer
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">52</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Soft Drinks
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">50</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Coffee
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">28</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Tea
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">18</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Juice
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">24</p>
              </div>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 border border-cyan-200 dark:border-cyan-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  Water
                </h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">30</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Beverage Inventory module</p>
              <p className="text-xs mt-1">Manage all beverage inventory across categories</p>
            </div>
          </div>
        )}

        {activeTab === 'wine-cellar' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Vintage
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track vintage years and aging</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Region & Winery
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Manage winery and region data</p>
              </div>
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                  Grape Variety
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track grape types and characteristics</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Bin Location
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Physical storage bin management</p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Aging
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track aging periods and maturity</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Pairing Notes
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Food pairing recommendations</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Wine className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Wine Cellar module</p>
              <p className="text-xs mt-1">Manage wine collection with vintage, winery, region, and pairing data</p>
            </div>
          </div>
        )}

        {activeTab === 'control' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Bottle Tracking
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track individual bottles</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Open Bottle Register
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Register opened bottles</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Pour Cost
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Monitor pour cost metrics</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Bottle Yield
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track bottle yield efficiency</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Breakage
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track breakage incidents</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  Spillage
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Record spillage events</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Variance Analysis
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Analyze cost variances</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calculator className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Beverage Control module</p>
              <p className="text-xs mt-1">Bottle tracking, pour cost, variance analysis, and happy hour performance</p>
            </div>
          </div>
        )}
      </div>

      {/* Happy Hour Performance Panel */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          Happy Hour Performance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Revenue Lift</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">+35% during happy hours</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Pour Cost</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">18.2% (vs 22.3% normal)</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Margin</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Maintained at 65%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
