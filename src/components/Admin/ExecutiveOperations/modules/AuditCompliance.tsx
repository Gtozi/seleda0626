/**
 * Audit & Compliance Module
 * Internal audit, financial audit, operational audit, night audit monitoring, compliance calendar, policy compliance, license tracking
 */

import { useState } from 'react';
import {
  FileSearch,
  DollarSign,
  Activity,
  Moon,
  Calendar,
  CheckCircle2,
  FileText
} from 'lucide-react';

const AuditCompliance = () => {
  const [selectedView, setSelectedView] = useState<'internal' | 'financial' | 'operational' | 'night' | 'compliance' | 'policy' | 'license'>('internal');

  const views = [
    { id: 'internal', label: 'Internal Audit', icon: FileSearch },
    { id: 'financial', label: 'Financial Audit', icon: DollarSign },
    { id: 'operational', label: 'Operational Audit', icon: Activity },
    { id: 'night', label: 'Night Audit Monitoring', icon: Moon },
    { id: 'compliance', label: 'Compliance Calendar', icon: Calendar },
    { id: 'policy', label: 'Policy Compliance', icon: CheckCircle2 },
    { id: 'license', label: 'License Tracking', icon: FileText },
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
            Audit and compliance management tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuditCompliance;
