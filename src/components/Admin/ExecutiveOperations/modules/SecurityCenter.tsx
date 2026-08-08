/**
 * Security Center Module
 * Incident management, visitor logs, access logs, key control, emergency dashboard, fire safety
 */

import { useState } from 'react';
import {
  Shield,
  Users,
  FileText,
  Key,
  AlertTriangle,
  Flame
} from 'lucide-react';

const SecurityCenter = () => {
  const [selectedView, setSelectedView] = useState<'incidents' | 'visitors' | 'access' | 'keys' | 'emergency' | 'fire'>('incidents');

  const views = [
    { id: 'incidents', label: 'Incident Management', icon: Shield },
    { id: 'visitors', label: 'Visitor Logs', icon: Users },
    { id: 'access', label: 'Access Logs', icon: FileText },
    { id: 'keys', label: 'Key Control', icon: Key },
    { id: 'emergency', label: 'Emergency Dashboard', icon: AlertTriangle },
    { id: 'fire', label: 'Fire Safety', icon: Flame },
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
            Security and safety management tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default SecurityCenter;
