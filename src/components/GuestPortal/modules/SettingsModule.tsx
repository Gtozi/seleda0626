/**
 * Settings Module
 * Account settings, notifications preferences, privacy settings, language, theme, accessibility
 */

import { useState } from 'react';
import {
  Settings,
  Bell,
  Lock,
  Globe,
  Moon,
  Sun,
  Accessibility,
  Shield,
  LogOut,
  Save,
  Smartphone
} from 'lucide-react';

interface SettingsModuleProps {
  guestId?: string;
}

interface SettingsState {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    marketing: boolean;
  };
  language: 'en' | 'am' | 'ti';
  theme: 'light' | 'dark' | 'system';
  privacy: {
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reducedMotion: boolean;
  };
}

const SettingsModule: React.FC<SettingsModuleProps> = ({
  guestId
}) => {
  const [settings, setSettings] = useState<SettingsState>({
    notifications: {
      email: true,
      sms: true,
      push: true,
      marketing: false
    },
    language: 'en',
    theme: 'system',
    privacy: {
      profileVisibility: 'private',
      dataSharing: false
    },
    accessibility: {
      fontSize: 'medium',
      highContrast: false,
      reducedMotion: false
    }
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Simulate saving
    setTimeout(() => {
      setSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1000);
  };

  const handleNotificationChange = (key: keyof SettingsState['notifications']) => {
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: !settings.notifications[key]
      }
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your account preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <span className="text-sm font-medium">Settings saved</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Bell size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Email Notifications</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Receive updates via email</div>
            </div>
            <button
              onClick={() => handleNotificationChange('email')}
              className={`w-12 h-6 rounded-full transition ${
                settings.notifications.email ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                settings.notifications.email ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">SMS Notifications</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Receive text message updates</div>
            </div>
            <button
              onClick={() => handleNotificationChange('sms')}
              className={`w-12 h-6 rounded-full transition ${
                settings.notifications.sms ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                settings.notifications.sms ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Push Notifications</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Receive mobile app notifications</div>
            </div>
            <button
              onClick={() => handleNotificationChange('push')}
              className={`w-12 h-6 rounded-full transition ${
                settings.notifications.push ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                settings.notifications.push ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Marketing Communications</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Receive promotional offers</div>
            </div>
            <button
              onClick={() => handleNotificationChange('marketing')}
              className={`w-12 h-6 rounded-full transition ${
                settings.notifications.marketing ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                settings.notifications.marketing ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Language & Theme */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Globe size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Language & Appearance</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="en">English</option>
              <option value="am">Amharic</option>
              <option value="ti">Tigrinya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => setSettings({ ...settings, theme: e.target.value as any })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Shield size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Privacy & Security</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Profile Visibility
            </label>
            <select
              value={settings.privacy.profileVisibility}
              onChange={(e) => setSettings({
                ...settings,
                privacy: { ...settings.privacy, profileVisibility: e.target.value as any }
              })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Data Sharing</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Allow sharing of anonymous usage data</div>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                privacy: { ...settings.privacy, dataSharing: !settings.privacy.dataSharing }
              })}
              className={`w-12 h-6 rounded-full transition ${
                settings.privacy.dataSharing ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                settings.privacy.dataSharing ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Settings */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Accessibility size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Accessibility</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Font Size
            </label>
            <select
              value={settings.accessibility.fontSize}
              onChange={(e) => setSettings({
                ...settings,
                accessibility: { ...settings.accessibility, fontSize: e.target.value as any }
              })}
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">High Contrast</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Increase contrast for better visibility</div>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                accessibility: { ...settings.accessibility, highContrast: !settings.accessibility.highContrast }
              })}
              className={`w-12 h-6 rounded-full transition ${
                settings.accessibility.highContrast ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                settings.accessibility.highContrast ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Reduced Motion</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Minimize animations and transitions</div>
            </div>
            <button
              onClick={() => setSettings({
                ...settings,
                accessibility: { ...settings.accessibility, reducedMotion: !settings.accessibility.reducedMotion }
              })}
              className={`w-12 h-6 rounded-full transition ${
                settings.accessibility.reducedMotion ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition ${
                settings.accessibility.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
            <Settings size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Account Actions</h3>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Lock size={18} className="text-slate-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Change Password</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Smartphone size={18} className="text-slate-400" />
            <span className="font-medium text-slate-700 dark:text-slate-300">Manage Connected Devices</span>
          </button>
          <button className="w-full flex items-center gap-3 p-3 border border-red-200 dark:border-red-700/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-red-600 dark:text-red-400">
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
