/**
 * Executive Checklists
 * Daily, weekly, and monthly executive checklists
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Calendar,
  MapPin,
  Building2,
  Shield,
  Search,
  Filter,
  Plus,
  Clock
} from 'lucide-react';

interface ChecklistItem {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  category: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo: string;
  dueBy: string;
  lastCompleted?: string;
}

const ExecutiveChecklists: React.FC = () => {
  const [selectedFrequency, setSelectedFrequency] = useState<'all' | 'daily' | 'weekly' | 'monthly'>('all');
  const [checklists, setChecklists] = useState<ChecklistItem[]>([
    {
      id: '1',
      title: 'Executive Walkthrough',
      frequency: 'daily',
      category: 'Daily',
      status: 'pending',
      assignedTo: 'General Manager',
      dueBy: 'Today 10:00'
    },
    {
      id: '2',
      title: 'Lobby Inspection',
      frequency: 'daily',
      category: 'Daily',
      status: 'completed',
      assignedTo: 'Resident Manager',
      dueBy: 'Today 09:00',
      lastCompleted: 'Today 09:15'
    },
    {
      id: '3',
      title: 'Public Area Inspection',
      frequency: 'daily',
      category: 'Daily',
      status: 'in-progress',
      assignedTo: 'Hotel Manager',
      dueBy: 'Today 11:00'
    },
    {
      id: '4',
      title: 'Department Review',
      frequency: 'weekly',
      category: 'Weekly',
      status: 'pending',
      assignedTo: 'General Manager',
      dueBy: 'Friday 16:00'
    },
    {
      id: '5',
      title: 'Safety Walk',
      frequency: 'weekly',
      category: 'Weekly',
      status: 'pending',
      assignedTo: 'Security Manager',
      dueBy: 'Friday 14:00'
    },
    {
      id: '6',
      title: 'Asset Inspection',
      frequency: 'weekly',
      category: 'Weekly',
      status: 'pending',
      assignedTo: 'Engineering Manager',
      dueBy: 'Friday 15:00'
    },
    {
      id: '7',
      title: 'Executive Audit',
      frequency: 'monthly',
      category: 'Monthly',
      status: 'pending',
      assignedTo: 'General Manager',
      dueBy: 'Month End'
    },
    {
      id: '8',
      title: 'Compliance Review',
      frequency: 'monthly',
      category: 'Monthly',
      status: 'pending',
      assignedTo: 'Hotel Manager',
      dueBy: 'Month End'
    },
    {
      id: '9',
      title: 'Risk Assessment',
      frequency: 'monthly',
      category: 'Monthly',
      status: 'pending',
      assignedTo: 'Operations Manager',
      dueBy: 'Month End'
    }
  ]);

  const filteredChecklists = checklists.filter(item => 
    selectedFrequency === 'all' || item.frequency === selectedFrequency
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'pending':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Daily':
        return MapPin;
      case 'Weekly':
        return Building2;
      case 'Monthly':
        return Shield;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CheckSquare size={28} />
            Executive Checklists
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Daily, weekly, and monthly executive checklists</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add Checklist
        </button>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {(['all', 'daily', 'weekly', 'monthly'] as const).map(frequency => (
          <button
            key={frequency}
            onClick={() => setSelectedFrequency(frequency)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedFrequency === frequency
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredChecklists.map(item => {
          const CategoryIcon = getCategoryIcon(item.category);
          return (
            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${getStatusColor(item.status)}`}>
                    <CategoryIcon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white">{item.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {item.frequency}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {item.dueBy}
                      </span>
                      <span>Assigned to: {item.assignedTo}</span>
                    </div>
                    {item.lastCompleted && (
                      <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                        Last completed: {item.lastCompleted}
                      </p>
                    )}
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                  {item.status === 'completed' ? 'View Details' : 'Mark Complete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExecutiveChecklists;