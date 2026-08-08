/**
 * Spa & Wellness Configuration Module
 * Manages treatment setup, membership setup, and facility configuration
 */

import { useState } from 'react';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  Sparkles,
  Users,
  Home,
  Clock,
  DollarSign,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';

const SpaWellnessConfigurationModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'treatments' | 'memberships' | 'facilities'>('treatments');

  const configCategories = [
    { id: 'treatments', name: 'Treatment Setup', icon: <Sparkles size={20} /> },
    { id: 'memberships', name: 'Membership Setup', icon: <Users size={20} /> },
    { id: 'facilities', name: 'Facility Setup', icon: <Home size={20} /> }
  ];

  const treatmentSettings = [
    { id: 'service-categories', name: 'Service Categories', description: 'Manage massage, facial, body treatment categories', status: 'Configured' },
    { id: 'treatment-duration', name: 'Treatment Duration', description: 'Set default durations for each treatment type', status: 'Configured' },
    { id: 'pricing', name: 'Pricing Structure', description: 'Configure base pricing and seasonal rates', status: 'Configured' },
    { id: 'therapist-qualifications', name: 'Therapist Qualifications', description: 'Define required certifications per treatment', status: 'Configured' }
  ];

  const membershipSettings = [
    { id: 'membership-types', name: 'Membership Types', description: 'Monthly, quarterly, annual, family, corporate, VIP', status: 'Configured' },
    { id: 'benefits', name: 'Benefits Configuration', description: 'Define benefits for each membership tier', status: 'Configured' },
    { id: 'renewal-rules', name: 'Renewal Rules', description: 'Set renewal policies and grace periods', status: 'Configured' },
    { id: 'pricing', name: 'Membership Pricing', description: 'Configure pricing for all membership types', status: 'Configured' }
  ];

  const facilitySettings = [
    { id: 'treatment-rooms', name: 'Treatment Rooms', description: 'Configure room types and capacities', status: 'Configured' },
    { id: 'fitness-areas', name: 'Fitness Areas', description: 'Set up gym, yoga studio, and fitness spaces', status: 'Configured' },
    { id: 'thermal-facilities', name: 'Thermal Facilities', description: 'Configure sauna, steam room, jacuzzi settings', status: 'Configured' },
    { id: 'equipment', name: 'Equipment Management', description: 'Track and maintain spa equipment', status: 'Configured' }
  ];

  const getSettingsForTab = () => {
    switch (activeTab) {
      case 'treatments':
        return treatmentSettings;
      case 'memberships':
        return membershipSettings;
      case 'facilities':
        return facilitySettings;
      default:
        return [];
    }
  };

  const handleEditSetting = (settingId: string) => {
    console.log(`Editing setting: ${settingId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Spa & Wellness Configuration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure treatments, memberships, and facilities
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {/* Configuration Categories */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        {configCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition ${
              activeTab === category.id
                ? 'text-indigo-600 border-b-2 border-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
            }`}
          >
            {category.icon}
            {category.name}
          </button>
        ))}
      </div>

      {/* Settings List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {configCategories.find(c => c.id === activeTab)?.name}
          </h2>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {getSettingsForTab().map((setting) => (
            <div key={setting.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{setting.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{setting.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">{setting.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditSetting(setting.id)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
                  >
                    <Edit size={16} />
                    Configure
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">General Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Appointment Duration
            </label>
            <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>30 minutes</option>
              <option>45 minutes</option>
              <option selected>60 minutes</option>
              <option>90 minutes</option>
              <option>120 minutes</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Cancellation Policy
            </label>
            <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>24 hours notice</option>
              <option selected>12 hours notice</option>
              <option>6 hours notice</option>
              <option>No notice required</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Default Gratuity Rate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue="18"
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-slate-600 dark:text-slate-400">%</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tax Rate
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue="9"
                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="text-slate-600 dark:text-slate-400">%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Plus size={20} className="text-indigo-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Add Treatment</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Users size={20} className="text-emerald-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Add Membership</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Home size={20} className="text-blue-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Add Facility</span>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Clock size={20} className="text-amber-600" />
            <span className="text-sm font-medium text-slate-900 dark:text-white">Set Hours</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpaWellnessConfigurationModule;