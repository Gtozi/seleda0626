/**
 * Guest Experience Module
 * Satisfaction, reviews, complaints, recovery, loyalty, VIP management, preferences, online reputation, NPS
 */

import { useState } from 'react';
import {
  Star,
  MessageSquare,
  Heart,
  Award,
  TrendingUp,
  Users,
  Smile
} from 'lucide-react';

const GuestExperience = () => {
  const [selectedView, setSelectedView] = useState<'satisfaction' | 'reviews' | 'complaints' | 'recovery' | 'loyalty' | 'vip' | 'preferences' | 'reputation' | 'nps'>('satisfaction');

  const views = [
    { id: 'satisfaction', label: 'Satisfaction', icon: Smile },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'recovery', label: 'Recovery Cases', icon: TrendingUp },
    { id: 'loyalty', label: 'Loyalty', icon: Heart },
    { id: 'vip', label: 'VIP Management', icon: Award },
    { id: 'preferences', label: 'Preferences', icon: Users },
    { id: 'reputation', label: 'Online Reputation', icon: Star },
    { id: 'nps', label: 'NPS', icon: TrendingUp },
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
            Guest experience analytics and management tools
          </p>
        </div>
      </div>
    </div>
  );
};

export default GuestExperience;
