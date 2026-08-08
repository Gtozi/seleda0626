/**
 * Configuration Module
 * Concierge portal settings and configuration
 */

import { useState } from 'react';
import { Settings, SlidersHorizontal, Bell, Clock, Users, Save } from 'lucide-react';

const ConfigurationModule: React.FC = () => {
  const [settings, setSettings] = useState({
    autoAssignRequests: true,
    defaultPriority: 'Normal',
    responseTimeTarget: 15,
    enableNotifications: true,
    vendorRatingThreshold: 4.0,
    autoReplyToGuests: false,
    workingHours: { start: '06:00', end: '23:00' }
  });

  const handleSave = () => {
    // Save settings logic would go here
    console.log('Saving settings:', settings);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Configuration</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Concierge portal settings and preferences</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Management */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
              <SlidersHorizontal size={20} className="text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Request Management</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-assign Requests</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Automatically assign requests to available staff</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoAssignRequests}
                onChange={(e) => setSettings({ ...settings, autoAssignRequests: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Default Priority</label>
              <select
                value={settings.defaultPriority}
                onChange={(e) => setSettings({ ...settings, defaultPriority: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Response Time Target (minutes)</label>
              <input
                type="number"
                value={settings.responseTimeTarget}
                onChange={(e) => setSettings({ ...settings, responseTimeTarget: parseInt(e.target.value) })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Bell size={20} className="text-emerald-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Enable Notifications</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts for new requests and updates</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-reply to Guests</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">Send automatic confirmations for common requests</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoReplyToGuests}
                onChange={(e) => setSettings({ ...settings, autoReplyToGuests: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Working Hours */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Clock size={20} className="text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Working Hours</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Start Time</label>
              <input
                type="time"
                value={settings.workingHours.start}
                onChange={(e) => setSettings({ ...settings, workingHours: { ...settings.workingHours, start: e.target.value } })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">End Time</label>
              <input
                type="time"
                value={settings.workingHours.end}
                onChange={(e) => setSettings({ ...settings, workingHours: { ...settings.workingHours, end: e.target.value } })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Vendor Settings */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <Users size={20} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Vendor Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Vendor Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={settings.vendorRatingThreshold}
                onChange={(e) => setSettings({ ...settings, vendorRatingThreshold: parseFloat(e.target.value) })}
                className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Vendors below this rating will be flagged for review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationModule;