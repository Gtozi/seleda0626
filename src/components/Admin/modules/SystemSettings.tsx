import React, { useState } from 'react';
import { Palette, Globe, DollarSign, Lock, Clock, Calendar, Database, HardDrive, Mail, MessageSquare, Settings, Save, Search, Filter, Bell, Shield, CheckCircle, XCircle, MoreVertical, Monitor, Smartphone, Moon, Sun, RefreshCw } from 'lucide-react';

interface SystemSetting {
  id: string;
  category: 'branding' | 'theme' | 'localization' | 'security' | 'session' | 'maintenance' | 'data_retention' | 'storage' | 'email' | 'sms';
  name: string;
  value: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'time';
  description: string;
  lastModified: string;
  modifiedBy: string;
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([
    // Global Branding
    { id: '1', category: 'branding', name: 'Company Name', value: 'SELEDA Hospitality', type: 'text', description: 'Company name displayed across the system', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '2', category: 'branding', name: 'Logo URL', value: '/assets/logo.png', type: 'text', description: 'Company logo file path', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '3', category: 'branding', name: 'Primary Color', value: '#4F46E5', type: 'text', description: 'Primary brand color (hex)', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '4', category: 'branding', name: 'Secondary Color', value: '#10B981', type: 'text', description: 'Secondary brand color (hex)', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // Themes
    { id: '5', category: 'theme', name: 'Default Theme', value: 'light', type: 'select', description: 'System default theme mode', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '6', category: 'theme', name: 'Allow Theme Toggle', value: 'true', type: 'boolean', description: 'Allow users to switch between light/dark mode', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // Localization
    { id: '7', category: 'localization', name: 'Default Language', value: 'en', type: 'select', description: 'System default language code', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '8', category: 'localization', name: 'Default Currency', value: 'USD', type: 'select', description: 'System default currency code', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '9', category: 'localization', name: 'Default Timezone', value: 'UTC', type: 'select', description: 'System default timezone', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // Security
    { id: '10', category: 'security', name: 'Password Min Length', value: '8', type: 'number', description: 'Minimum password length requirement', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '11', category: 'security', name: 'Password Complexity', value: 'true', type: 'boolean', description: 'Require complex passwords with special characters', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '12', category: 'security', name: 'MFA Required', value: 'true', type: 'boolean', description: 'Require multi-factor authentication for all users', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '13', category: 'security', name: 'Session Lockout', value: '5', type: 'number', description: 'Number of failed login attempts before lockout', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // Session
    { id: '14', category: 'session', name: 'Session Timeout', value: '30', type: 'number', description: 'Session timeout in minutes', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '15', category: 'session', name: 'Remember Me Duration', value: '7', type: 'number', description: 'Remember me token duration in days', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '16', category: 'session', name: 'Concurrent Sessions', value: '3', type: 'number', description: 'Maximum concurrent sessions per user', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // Maintenance
    { id: '17', category: 'maintenance', name: 'Maintenance Window Start', value: '02:00', type: 'time', description: 'Daily maintenance window start time', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '18', category: 'maintenance', name: 'Maintenance Window End', value: '04:00', type: 'time', description: 'Daily maintenance window end time', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '19', category: 'maintenance', name: 'Maintenance Mode', value: 'false', type: 'boolean', description: 'Enable maintenance mode for system updates', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // Data Retention
    { id: '20', category: 'data_retention', name: 'Audit Log Retention', value: '90', type: 'number', description: 'Audit log retention period in days', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '21', category: 'data_retention', name: 'User Data Retention', value: '365', type: 'number', description: 'User data retention period in days after account deletion', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '22', category: 'data_retention', name: 'Transaction Data Retention', value: '1825', type: 'number', description: 'Transaction data retention period in days (5 years)', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // File Storage
    { id: '23', category: 'storage', name: 'Max File Size', value: '10', type: 'number', description: 'Maximum file upload size in MB', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '24', category: 'storage', name: 'Allowed File Types', value: 'pdf,doc,docx,xls,xlsx,jpg,png', type: 'text', description: 'Comma-separated list of allowed file extensions', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '25', category: 'storage', name: 'Storage Location', value: '/var/uploads', type: 'text', description: 'File storage directory path', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // Email
    { id: '26', category: 'email', name: 'SMTP Server', value: 'smtp.example.com', type: 'text', description: 'SMTP server hostname', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '27', category: 'email', name: 'SMTP Port', value: '587', type: 'number', description: 'SMTP server port number', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '28', category: 'email', name: 'SMTP Username', value: 'noreply@seleda.com', type: 'text', description: 'SMTP authentication username', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '29', category: 'email', name: 'Email From Address', value: 'noreply@seleda.com', type: 'text', description: 'Default sender email address', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    
    // SMS
    { id: '30', category: 'sms', name: 'SMS Provider', value: 'twilio', type: 'select', description: 'SMS service provider', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '31', category: 'sms', name: 'API Key', value: 'sk_live_************', type: 'text', description: 'SMS provider API key', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
    { id: '32', category: 'sms', name: 'Default Sender ID', value: 'SELEDA', type: 'text', description: 'Default SMS sender ID', lastModified: '2024-01-10', modifiedBy: 'admin@erp.com' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'localization' | 'security' | 'session' | 'maintenance' | 'data_retention' | 'storage' | 'email' | 'sms'>('branding');

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || setting.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { id: 'branding', name: 'Global Branding', icon: Palette, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'theme', name: 'Themes', icon: Monitor, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'localization', name: 'Localization', icon: Globe, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'security', name: 'Security', icon: Shield, color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'session', name: 'Session', icon: Clock, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'maintenance', name: 'Maintenance', icon: Calendar, color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'data_retention', name: 'Data Retention', icon: Database, color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
    { id: 'storage', name: 'File Storage', icon: HardDrive, color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400' },
    { id: 'email', name: 'Email Servers', icon: Mail, color: 'bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400' },
    { id: 'sms', name: 'SMS Providers', icon: MessageSquare, color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400' },
  ];

  const settingsStats = [
    { label: 'Total Settings', value: settings.length, icon: Settings, color: 'text-blue-600' },
    { label: 'Categories', value: categories.length, icon: Filter, color: 'text-emerald-600' },
    { label: 'Security Settings', value: settings.filter(s => s.category === 'security').length, icon: Shield, color: 'text-rose-600' },
    { label: 'Recently Modified', value: settings.filter(s => s.lastModified === '2024-01-10').length, icon: Clock, color: 'text-amber-600' },
    { label: 'Boolean Settings', value: settings.filter(s => s.type === 'boolean').length, icon: CheckCircle, color: 'text-purple-600' },
    { label: 'Text Settings', value: settings.filter(s => s.type === 'text').length, icon: Database, color: 'text-cyan-600' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">System Settings</h1>
          <p className="text-xs text-slate-400">Configure global branding, themes, default language, default currency, password policy, session timeout, maintenance windows, data retention, file storage, email servers, and SMS providers</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      {/* Settings Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {settingsStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 flex gap-2 overflow-x-auto">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveTab(category.id as any)}
            className={`flex-1 px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === category.id
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Settings Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Setting</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Modified By</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredSettings
                .filter(setting => setting.category === activeTab)
                .map((setting) => {
                  const category = categories.find(c => c.id === setting.category);
                  const CategoryIcon = category?.icon || Settings;
                  return (
                    <tr key={setting.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl ${category?.color} flex items-center justify-center`}>
                            <CategoryIcon size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{setting.name}</div>
                            <div className="text-[10px] text-slate-400">{setting.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {setting.type === 'boolean' ? (
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${setting.value === 'true' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400'}`}>
                            {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-mono">{setting.value}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                          {setting.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{setting.lastModified}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{setting.modifiedBy}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="p-1.5 hover-bg-indigo-50 rounded-lg transition" title="Edit setting">
                            <Settings size={14} className="text-indigo-600" />
                          </button>
                          <button className="p-1.5 hover-bg-slate-50 rounded-lg transition" title="Reset to default">
                            <RefreshCw size={14} className="text-slate-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-slate-400">Common system configuration tasks</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 flex items-center justify-center">
              <Palette size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Update Branding</div>
              <div className="text-[10px] text-slate-400">Logo, colors, company name</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Security Policy</div>
              <div className="text-[10px] text-slate-400">Password, MFA, lockout rules</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400 flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Maintenance</div>
              <div className="text-[10px] text-slate-400">Windows, mode, notifications</div>
            </div>
          </button>

          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/20 text-teal-800 dark:text-teal-400 flex items-center justify-center">
              <Mail size={20} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-slate-900 dark:text-white">Email & SMS</div>
              <div className="text-[10px] text-slate-400">SMTP servers, SMS providers</div>
            </div>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">System Status</h3>
            <p className="text-xs text-slate-400">Current system configuration status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl">
            <CheckCircle size={24} className="text-emerald-600" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">All Settings Configured</div>
              <div className="text-[10px] text-slate-400">System is fully configured</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
            <Clock size={24} className="text-blue-600" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Last Updated</div>
              <div className="text-[10px] text-slate-400">2024-01-10 by admin@erp.com</div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl">
            <Bell size={24} className="text-amber-600" />
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Mode</div>
              <div className="text-[10px] text-slate-400">Currently disabled</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;