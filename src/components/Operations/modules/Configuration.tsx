/**
 * Configuration
 * Configure approval matrix and operational settings
 */

import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Users,
  Briefcase,
  Save,
  RefreshCw,
  ChevronRight,
  Plus
} from 'lucide-react';

interface ApprovalLevel {
  id: string;
  name: string;
  monetaryLimit: number;
  canEscalateTo: string[];
}

interface OperationalSetting {
  id: string;
  category: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select';
  options?: string[];
}

const Configuration: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'approval-matrix' | 'operations-setup'>('approval-matrix');
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([
    {
      id: '1',
      name: 'Department Manager',
      monetaryLimit: 5000,
      canEscalateTo: ['Hotel Manager', 'General Manager']
    },
    {
      id: '2',
      name: 'Hotel Manager',
      monetaryLimit: 25000,
      canEscalateTo: ['General Manager']
    },
    {
      id: '3',
      name: 'General Manager',
      monetaryLimit: 100000,
      canEscalateTo: []
    }
  ]);

  const [operationalSettings, setOperationalSettings] = useState<OperationalSetting[]>([
    {
      id: '1',
      category: 'Shift Types',
      name: 'Morning Shift Start',
      value: '07:00',
      type: 'text'
    },
    {
      id: '2',
      category: 'Shift Types',
      name: 'Afternoon Shift Start',
      value: '15:00',
      type: 'text'
    },
    {
      id: '3',
      category: 'Shift Types',
      name: 'Night Shift Start',
      value: '23:00',
      type: 'text'
    },
    {
      id: '4',
      category: 'Alert Thresholds',
      name: 'Critical Response Time (minutes)',
      value: 15,
      type: 'number'
    },
    {
      id: '5',
      category: 'Alert Thresholds',
      name: 'High Priority Response Time (minutes)',
      value: 30,
      type: 'number'
    },
    {
      id: '6',
      category: 'Alert Thresholds',
      name: 'Medium Priority Response Time (minutes)',
      value: 60,
      type: 'number'
    },
    {
      id: '7',
      category: 'Notification Rules',
      name: 'Enable SMS Notifications',
      value: true,
      type: 'boolean'
    },
    {
      id: '8',
      category: 'Notification Rules',
      name: 'Enable Email Notifications',
      value: true,
      type: 'boolean'
    },
    {
      id: '9',
      category: 'Notification Rules',
      name: 'Enable Push Notifications',
      value: true,
      type: 'boolean'
    }
  ]);

  const renderSettingInput = (setting: OperationalSetting) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={setting.value as boolean}
            onChange={(e) => {
              setOperationalSettings(prev => prev.map(s => 
                s.id === setting.id ? { ...s, value: e.target.checked } : s
              ));
            }}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={(e) => {
              setOperationalSettings(prev => prev.map(s => 
                s.id === setting.id ? { ...s, value: parseInt(e.target.value) || 0 } : s
              ));
            }}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-24"
          />
        );
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => {
              setOperationalSettings(prev => prev.map(s => 
                s.id === setting.id ? { ...s, value: e.target.value } : s
              ));
            }}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          >
            {setting.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => {
              setOperationalSettings(prev => prev.map(s => 
                s.id === setting.id ? { ...s, value: e.target.value } : s
              ));
            }}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-32"
          />
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Settings size={28} />
            Configuration
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Configure approval matrix and operational settings</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Save size={18} />
          Save Changes
        </button>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('approval-matrix')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'approval-matrix'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Shield size={16} />
          Approval Matrix
        </button>
        <button
          onClick={() => setActiveTab('operations-setup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'operations-setup'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Briefcase size={16} />
          Operations Setup
        </button>
      </div>

      {activeTab === 'approval-matrix' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">Approval Levels</h3>
          <div className="space-y-3">
            {approvalLevels.map(level => (
              <div key={level.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{level.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Monetary Limit: ${level.monetaryLimit.toLocaleString()}
                    </p>
                  </div>
                  <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors">
                    <ChevronRight size={16} className="text-slate-400" />
                  </button>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Can Escalate To:</p>
                  <div className="flex flex-wrap gap-1">
                    {level.canEscalateTo.map(target => (
                      <span key={target} className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded">
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm flex items-center gap-2">
            <Plus size={16} />
            Add Approval Level
          </button>
        </div>
      )}

      {activeTab === 'operations-setup' && (
        <div className="space-y-4">
          {['Shift Types', 'Alert Thresholds', 'Notification Rules'].map(category => (
            <div key={category} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">{category}</h3>
              <div className="space-y-3">
                {operationalSettings
                  .filter(setting => setting.category === category.toLowerCase().replace(' ', '-'))
                  .map(setting => (
                    <div key={setting.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{setting.name}</p>
                      </div>
                      {renderSettingInput(setting)}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Configuration;