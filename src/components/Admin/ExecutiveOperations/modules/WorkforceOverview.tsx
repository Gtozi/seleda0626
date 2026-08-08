/**
 * Workforce Overview Module
 * Attendance, leave, overtime, payroll summary, staffing levels, productivity, performance reviews, recruitment, training
 */

import { useState } from 'react';
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Award,
  UserPlus,
  BookOpen
} from 'lucide-react';

const WorkforceOverview = () => {
  const [selectedView, setSelectedView] = useState<'attendance' | 'leave' | 'overtime' | 'payroll' | 'staffing' | 'productivity' | 'performance' | 'recruitment' | 'training'>('attendance');

  const views = [
    { id: 'attendance', label: 'Attendance', icon: Users },
    { id: 'leave', label: 'Leave', icon: Calendar },
    { id: 'overtime', label: 'Overtime', icon: Clock },
    { id: 'payroll', label: 'Payroll Summary', icon: DollarSign },
    { id: 'staffing', label: 'Staffing Levels', icon: Users },
    { id: 'productivity', label: 'Productivity', icon: TrendingUp },
    { id: 'performance', label: 'Performance Reviews', icon: Award },
    { id: 'recruitment', label: 'Recruitment', icon: UserPlus },
    { id: 'training', label: 'Training', icon: BookOpen },
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
            Workforce management and HR analytics
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkforceOverview;
