import React from 'react';
import { MapPin, Plus, Search, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';

const PatrolManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Patrol Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Schedule and monitor security patrols</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          <Plus className="w-4 h-4" />
          New Patrol
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Patrol Management Module</h3>
          <p className="text-slate-600 dark:text-slate-400">Schedule and monitor security patrols with QR/NFC checkpoints</p>
        </div>
      </div>
    </div>
  );
};

export default PatrolManagement;