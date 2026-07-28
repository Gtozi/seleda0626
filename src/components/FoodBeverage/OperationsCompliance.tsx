/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState } from 'react';
import {
  ClipboardCheck,
  ShieldCheck,
  Thermometer,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Search,
  Filter,
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Package,
  Zap,
  Activity,
  RefreshCw,
  Download
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

export default function OperationsCompliance() {
  const { addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'daily-ops' | 'food-safety' | 'quality' | 'checklists' | 'audits'>('daily-ops');
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'daily-ops', label: 'Daily Operations', icon: ClipboardCheck },
    { id: 'food-safety', label: 'Food Safety', icon: ShieldCheck },
    { id: 'quality', label: 'Quality Assurance', icon: CheckCircle2 },
    { id: 'checklists', label: 'Checklists', icon: FileText },
    { id: 'audits', label: 'Audits', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Operations & Compliance</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Daily operations, food safety, and quality assurance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Sync</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Checklist</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Checklists Completed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">18/20</p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">HACCP Logs</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">12</p>
            </div>
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Thermometer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Compliance Score</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">94%</p>
            </div>
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pending Actions</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">3</p>
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
        {activeTab === 'daily-ops' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                  Outlet Opening Checklist
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Equipment inspection</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Temperature check</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Stock verification</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Staff briefing</li>
                </ul>
              </div>
              <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Outlet Closing Checklist
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Equipment shutdown</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Waste approval</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Stock count</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-green-500" /> Security check</li>
                </ul>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <ClipboardCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Daily Operations module</p>
              <p className="text-xs mt-1">Production review, waste approval, daily cost review, stock verification</p>
            </div>
          </div>
        )}

        {activeTab === 'food-safety' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-red-600 dark:text-red-400" />
                  Temperature Logs
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Monitor fridge, freezer, and hot-holding temperatures</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Cleaning Schedule
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track sanitization and cleaning procedures</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  Expiration Monitoring
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">Track ingredient expiry dates and recalls</p>
              </div>
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Food Safety module</p>
              <p className="text-xs mt-1">HACCP logs, temperature logs, cleaning schedule, sanitization checklist</p>
            </div>
          </div>
        )}

        {activeTab === 'quality' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Quality Assurance module</p>
              <p className="text-xs mt-1">Recipe compliance, portion audits, mystery guest results, corrective actions, internal inspections</p>
            </div>
          </div>
        )}

        {activeTab === 'checklists' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Checklists module</p>
              <p className="text-xs mt-1">Manage and assign operational checklists</p>
            </div>
          </div>
        )}

        {activeTab === 'audits' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Audits module</p>
              <p className="text-xs mt-1">Internal audits, compliance reviews, and inspection reports</p>
            </div>
          </div>
        )}
      </div>

      {/* Compliance Status Panel */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
          Compliance Dashboard
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">HACCP</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">98% compliant</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Thermometer className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Temperature</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">All within range</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Sanitization</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">On schedule</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Package className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Expiry</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">2 items expiring</p>
          </div>
        </div>
      </div>
    </div>
  );
}
