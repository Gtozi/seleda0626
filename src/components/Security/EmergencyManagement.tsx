import React from 'react';
import { AlertTriangle, Plus, Search, Clock, CheckCircle2, Radio } from 'lucide-react';

const EmergencyManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Emergency Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Coordinate emergency response and evacuation</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
          <Radio className="w-4 h-4" />
          Emergency Alert
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Emergency Management Module</h3>
          <p className="text-slate-600 dark:text-slate-400">Coordinate emergency response, evacuation, and incident command</p>
        </div>
      </div>
    </div>
  );
};

export default EmergencyManagement;