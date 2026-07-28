/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  Link2,
  Server,
  Monitor,
  Building2,
  Database,
  Users,
  BarChart3,
  Wallet,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Settings,
  Search,
  Filter,
  Plus,
  Activity,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function Integrations() {
  const { addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'pos' | 'kds' | 'pms' | 'inventory' | 'procurement' | 'finance' | 'crm' | 'bi'>('pos');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'pos', label: 'Standalone POS', icon: Monitor },
    { id: 'kds', label: 'Standalone KDS', icon: Server },
    { id: 'pms', label: 'Front Office PMS', icon: Building2 },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'procurement', label: 'Procurement', icon: ShoppingCart },
    { id: 'finance', label: 'Finance', icon: Wallet },
    { id: 'crm', label: 'CRM & Loyalty', icon: Users },
    { id: 'bi', label: 'Business Intelligence', icon: BarChart3 },
  ];

  const integrations = [
    { id: 'pos', name: 'Standalone POS', status: 'connected', lastSync: '2 min ago', icon: Monitor },
    { id: 'kds', name: 'Standalone KDS', status: 'connected', lastSync: '1 min ago', icon: Server },
    { id: 'pms', name: 'Front Office PMS', status: 'connected', lastSync: '5 min ago', icon: Building2 },
    { id: 'inventory', name: 'Inventory System', status: 'connected', lastSync: 'Real-time', icon: Database },
    { id: 'procurement', name: 'Procurement Portal', status: 'connected', lastSync: '10 min ago', icon: ShoppingCart },
    { id: 'finance', name: 'Finance Module', status: 'connected', lastSync: 'Real-time', icon: Wallet },
    { id: 'crm', name: 'CRM & Loyalty', status: 'connected', lastSync: '15 min ago', icon: Users },
    { id: 'bi', name: 'Business Intelligence', status: 'connected', lastSync: '30 min ago', icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Integrations</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Orchestrate information between operational systems and enterprise modules</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Sync All</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Settings className="w-4 h-4" />
            <span>Configure</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Connected Systems</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">8/8</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Sync Status</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">Healthy</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Data Flow</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">2.4K/h</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Errors (24h)</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">0</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Integration Architecture Diagram */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Integration Architecture
        </h3>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
          <pre className="whitespace-pre">
                  Hotel ERP
                       │
      ┌────────────────┼────────────────┐
      │                │                │
 Standalone POS   Standalone KDS   Front Office PMS
      │                │                │
      └────────────────┼────────────────┘
                       │
                Order & Sales Hub
                       │
     ┌─────────────────┼──────────────────┐
     │                 │                  │
 Inventory       Procurement        Finance
     │                 │                  │
 Production     Supplier Portal     General Ledger
     │
 CRM & Loyalty
     │
 Business Intelligence
          </pre>
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
        {activeTab === 'pos' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Standalone POS Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Order entry, payments, cashier operations, table management, service operations</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: 2 min ago</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'kds' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Standalone KDS Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Kitchen routing, preparation workflow, production status, station management</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: 1 min ago</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pms' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Front Office PMS Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Room charge posting, guest profile synchronization, package inclusions, occupancy</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: 5 min ago</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Inventory Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Stock control, transfers, consumption, valuation</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: Real-time</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'procurement' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Procurement Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Purchase requisitions, purchase orders, supplier management</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: 10 min ago</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Finance Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">General ledger, taxes, COGS, accounts payable, accounts receivable</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: Real-time</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                  CRM & Loyalty Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Guest history, rewards, marketing, personalized offers</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: 15 min ago</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'bi' && (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Business Intelligence Integration
                </h3>
                <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">Connected</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Dashboards, KPIs, forecasting, enterprise analytics</p>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>Last sync: 30 min ago</span>
                <span>Status: Healthy</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Integration Responsibilities Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Integration Responsibilities
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">System</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Responsibility</th>
                <th className="text-left py-3 px-4 text-slate-600 dark:text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((integration) => (
                <tr key={integration.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 text-slate-900 dark:text-white font-medium flex items-center gap-2">
                    <integration.icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    {integration.name}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {integration.id === 'pos' && 'Order entry, payments, cashier operations, table management, service operations'}
                    {integration.id === 'kds' && 'Kitchen routing, preparation workflow, production status, station management'}
                    {integration.id === 'pms' && 'Room charge posting, guest profile synchronization, package inclusions, occupancy'}
                    {integration.id === 'inventory' && 'Stock control, transfers, consumption, valuation'}
                    {integration.id === 'procurement' && 'Purchase requisitions, purchase orders, supplier management'}
                    {integration.id === 'finance' && 'General ledger, taxes, COGS, accounts payable, accounts receivable'}
                    {integration.id === 'crm' && 'Guest history, rewards, marketing, personalized offers'}
                    {integration.id === 'bi' && 'Dashboards, KPIs, forecasting, enterprise analytics'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      {integration.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
