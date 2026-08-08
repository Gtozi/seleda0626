/**
 * Executive Meetings Module
 * Morning briefing, daily operations meeting, weekly review, monthly review, board meeting, decision log, action tracker
 */

import { useState } from 'react';
import {
  Calendar,
  Users,
  FileText,
  Briefcase,
  CheckCircle2
} from 'lucide-react';

const ExecutiveMeetings = () => {
  const [selectedView, setSelectedView] = useState<'morning' | 'daily' | 'weekly' | 'monthly' | 'board' | 'decisions' | 'actions'>('morning');

  const views = [
    { id: 'morning', label: 'Morning Briefing', icon: Calendar },
    { id: 'daily', label: 'Daily Operations Meeting', icon: Users },
    { id: 'weekly', label: 'Weekly Review', icon: Calendar },
    { id: 'monthly', label: 'Monthly Review', icon: Briefcase },
    { id: 'board', label: 'Board Meeting', icon: Users },
    { id: 'decisions', label: 'Decision Log', icon: FileText },
    { id: 'actions', label: 'Action Tracker', icon: CheckCircle2 },
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
            Meeting management and decision tracking
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveMeetings;
