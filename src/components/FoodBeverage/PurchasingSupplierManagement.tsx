/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  ShoppingCart,
  FileText,
  Truck,
  Building2,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Package,
  FileCheck,
  Zap,
  Clock
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function PurchasingSupplierManagement() {
  const { addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'requisitions' | 'orders' | 'rfq' | 'suppliers' | 'approvals' | 'receiving'>('requisitions');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'requisitions', label: 'Purchase Requisitions', icon: FileText },
    { id: 'orders', label: 'Purchase Orders', icon: ShoppingCart },
    { id: 'rfq', label: 'RFQs', icon: FileCheck },
    { id: 'suppliers', label: 'Supplier Master', icon: Building2 },
    { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
    { id: 'receiving', label: 'Goods Receiving', icon: Truck },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Purchasing & Supplier Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Procurement workflow, supplier management, and inventory purchasing</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
          <Plus className="w-4 h-4" />
          <span>New Requisition</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Open Requisitions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Orders</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Active Suppliers</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">24</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Approvals</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">5</p>
            </div>
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
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
        {activeTab === 'requisitions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search requisitions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm w-64"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm">Filter</span>
                </button>
              </div>
            </div>

            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Purchase Requisitions module</p>
              <p className="text-xs mt-1">Create and manage purchase requisitions with approval workflow</p>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Purchase Orders module</p>
              <p className="text-xs mt-1">Manage purchase orders and track supplier deliveries</p>
            </div>
          </div>
        )}

        {activeTab === 'rfq' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <FileCheck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Request for Quotation module</p>
              <p className="text-xs mt-1">Create RFQs and compare supplier quotations</p>
            </div>
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Supplier Master module</p>
              <p className="text-xs mt-1">Manage supplier profiles, contracts, price lists, and performance scorecards</p>
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Approval Workflow module</p>
              <p className="text-xs mt-1">Review and approve purchase requisitions and orders</p>
            </div>
          </div>
        )}

        {activeTab === 'receiving' && (
          <div className="space-y-4">
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Goods Receiving module</p>
              <p className="text-xs mt-1">Process goods receipts and match with purchase orders and invoices</p>
            </div>
          </div>
        )}
      </div>

      {/* Automatic Purchasing Panel */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Automatic Purchasing Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Minimum Stock</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Auto-generate orders when stock falls below minimum level</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Sales Forecast</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Predict demand based on historical sales patterns</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Production Plan</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Align purchasing with kitchen production schedules</p>
          </div>
        </div>
      </div>
    </div>
  );
}
