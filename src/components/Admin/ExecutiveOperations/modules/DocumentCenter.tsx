/**
 * Document Center Module
 * SOP library, policies, contracts, licenses, permits, meeting minutes, audit reports, engineering manuals, training materials
 */

import { useState } from 'react';
import {
  FileText,
  FileCheck,
  Scale,
  Award,
  Calendar,
  FileSearch,
  Wrench,
  BookOpen
} from 'lucide-react';

const DocumentCenter = () => {
  const [selectedView, setSelectedView] = useState<'sop' | 'policies' | 'contracts' | 'licenses' | 'permits' | 'minutes' | 'audit' | 'manuals' | 'training'>('sop');

  const views = [
    { id: 'sop', label: 'SOP Library', icon: FileText },
    { id: 'policies', label: 'Policies', icon: FileCheck },
    { id: 'contracts', label: 'Contracts', icon: Scale },
    { id: 'licenses', label: 'Licenses', icon: Award },
    { id: 'permits', label: 'Permits', icon: Award },
    { id: 'minutes', label: 'Meeting Minutes', icon: Calendar },
    { id: 'audit', label: 'Audit Reports', icon: FileSearch },
    { id: 'manuals', label: 'Engineering Manuals', icon: Wrench },
    { id: 'training', label: 'Training Materials', icon: BookOpen },
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
            Document management and repository
          </p>
        </div>
      </div>
    </div>
  );
};

export default DocumentCenter;
