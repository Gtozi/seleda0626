/**
 * Risk Management Module
 * Financial risk, operational risk, security risk, food safety risk, compliance risk, IT risk, risk register, mitigation plans
 */

import { useState } from 'react';
import {
  DollarSign,
  Activity,
  Shield,
  AlertTriangle,
  FileCheck,
  Laptop,
  FileText,
  CheckCircle2
} from 'lucide-react';

const RiskManagement = () => {
  const [selectedView, setSelectedView] = useState<'financial' | 'operational' | 'security' | 'foodsafety' | 'compliance' | 'it' | 'register' | 'mitigation'>('financial');

  const views = [
    { id: 'financial', label: 'Financial Risk', icon: DollarSign },
    { id: 'operational', label: 'Operational Risk', icon: Activity },
    { id: 'security', label: 'Security Risk', icon: Shield },
    { id: 'foodsafety', label: 'Food Safety Risk', icon: AlertTriangle },
    { id: 'compliance', label: 'Compliance Risk', icon: FileCheck },
    { id: 'it', label: 'IT Risk', icon: Laptop },
    { id: 'register', label: 'Risk Register', icon: FileText },
    { id: 'mitigation', label: 'Mitigation Plans', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-wrap">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => setSelectedView(view.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedView === view.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <Icon size={14} />
                {view.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
          {views.find(v => v.id === selectedView)?.label}
        </h3>
        <div className="text-center py-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Risk management and mitigation tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default RiskManagement;
