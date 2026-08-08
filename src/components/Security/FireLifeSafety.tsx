import React from 'react';
import { Flame, Plus, Search, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const FireLifeSafety: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Fire & Life Safety</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor fire systems and safety equipment</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Plus className="w-4 h-4" />
          New Inspection
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center py-12">
          <Flame className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Fire & Life Safety Module</h3>
          <p className="text-slate-600 dark:text-slate-400">Monitor fire alarms, equipment inspections, and safety drills</p>
        </div>
      </div>
    </div>
  );
};

export default FireLifeSafety;