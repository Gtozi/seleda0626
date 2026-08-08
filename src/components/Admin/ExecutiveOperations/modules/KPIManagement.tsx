/**
 * KPI Management Module
 * Enterprise KPIs, department KPIs, outlet KPIs, employee KPIs, balanced scorecard, benchmarking, variance analysis
 */

import { useState } from 'react';
import {
  Target,
  Building2,
  Store,
  Users,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

const KPIManagement = () => {
  const [selectedView, setSelectedView] = useState<'enterprise' | 'department' | 'outlet' | 'employee' | 'scorecard' | 'benchmark' | 'variance'>('enterprise');

  const views = [
    { id: 'enterprise', label: 'Enterprise KPIs', icon: Target },
    { id: 'department', label: 'Department KPIs', icon: Building2 },
    { id: 'outlet', label: 'Outlet KPIs', icon: Store },
    { id: 'employee', label: 'Employee KPIs', icon: Users },
    { id: 'scorecard', label: 'Balanced Scorecard', icon: BarChart3 },
    { id: 'benchmark', label: 'Benchmarking', icon: TrendingUp },
    { id: 'variance', label: 'Variance Analysis', icon: Activity },
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
            KPI management and analytics tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPIManagement;
