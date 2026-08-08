import React from 'react';
import { Radio, Plus, Search, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const CrisisManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Crisis Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Crisis team coordination and communication</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          <Radio className="w-4 h-4" />
          Activate Crisis
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center py-12">
          <Radio className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Crisis Management Module</h3>
          <p className="text-slate-600 dark:text-slate-400">Crisis team management, communication, and decision tracking</p>
        </div>
      </div>
    </div>
  );
};

export default CrisisManagement;