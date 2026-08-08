import React, { useState } from 'react';
import {
  Settings, Search, Filter, Save, CheckCircle2, AlertTriangle,
  Users, Building2, Clock, FileText, ShieldCheck, Bell,
  MapPin, Wrench, Zap, Droplets, ChevronRight
} from 'lucide-react';

interface ConfigSection {
  id: string;
  name: string;
  icon: any;
  description: string;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  id: string;
  name: string;
  value: string | number | boolean;
  type: 'text' | 'number' | 'boolean' | 'select' | 'date';
  options?: string[];
  description?: string;
}

const Configuration: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('general');

  const [configSections, setConfigSections] = useState<ConfigSection[]>([
    {
      id: 'general',
      name: 'General Settings',
      icon: Settings,
      description: 'Basic engineering portal configuration',
      settings: [
        { id: 'site-name', name: 'Site Name', value: 'SELEDA Hotel', type: 'text', description: 'Hotel property name' },
        { id: 'timezone', name: 'Timezone', value: 'UTC+03:00', type: 'select', options: ['UTC+03:00', 'UTC+00:00', 'UTC-05:00'], description: 'Local timezone' },
        { id: 'date-format', name: 'Date Format', value: 'DD/MM/YYYY', type: 'select', options: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'], description: 'Date display format' },
        { id: 'time-format', name: 'Time Format', value: '24h', type: 'select', options: ['24h', '12h'], description: 'Time display format' },
        { id: 'auto-refresh', name: 'Auto Refresh Dashboard', value: true, type: 'boolean', description: 'Automatically refresh dashboard data' },
        { id: 'refresh-interval', name: 'Refresh Interval (minutes)', value: 5, type: 'number', description: 'Dashboard refresh frequency' },
      ],
    },
    {
      id: 'departments',
      name: 'Departments',
      icon: Building2,
      description: 'Engineering department structure',
      settings: [
        { id: 'dept-name', name: 'Department Name', value: 'Engineering & Maintenance', type: 'text', description: 'Official department name' },
        { id: 'dept-code', name: 'Department Code', value: 'ENG', type: 'text', description: 'Department identifier' },
        { id: 'head-of-dept', name: 'Head of Department', value: 'John Smith', type: 'text', description: 'Department head name' },
        { id: 'location', name: 'Department Location', value: 'Plant Room', type: 'text', description: 'Main office location' },
        { id: 'phone', name: 'Department Phone', value: '+251 911 123 4567', type: 'text', description: 'Contact number' },
        { id: 'email', name: 'Department Email', value: 'engineering@seleda.et', type: 'text', description: 'Contact email' },
      ],
    },
    {
      id: 'staff',
      name: 'Staff Management',
      icon: Users,
      description: 'Technician and staff configuration',
      settings: [
        { id: 'shift-pattern', name: 'Shift Pattern', value: '3-shift', type: 'select', options: ['3-shift', '2-shift', '24/7'], description: 'Working shift pattern' },
        { id: 'shift-duration', name: 'Shift Duration (hours)', value: 8, type: 'number', description: 'Hours per shift' },
        { id: 'overtime-rate', name: 'Overtime Rate (%)', value: 150, type: 'number', description: 'Overtime pay rate percentage' },
        { id: 'skill-req', name: 'Skill Requirements', value: true, type: 'boolean', description: 'Require skill certification for tasks' },
        { id: 'max-tasks', name: 'Max Tasks per Technician', value: 5, type: 'number', description: 'Maximum concurrent tasks' },
      ],
    },
    {
      id: 'work-orders',
      name: 'Work Orders',
      icon: Wrench,
      description: 'Work order settings and defaults',
      settings: [
        { id: 'auto-assign', name: 'Auto Assign Work Orders', value: false, type: 'boolean', description: 'Automatically assign based on skills' },
        { id: 'default-priority', name: 'Default Priority', value: 'Normal', type: 'select', options: ['Emergency', 'High', 'Normal', 'Low'], description: 'Default priority for new orders' },
        { id: 'sla-hours', name: 'SLA Response Time (hours)', value: 4, type: 'number', description: 'Standard response time SLA' },
        { id: 'require-photos', name: 'Require Before/After Photos', value: true, type: 'boolean', description: 'Mandatory photo documentation' },
        { id: 'allow-guest-requests', name: 'Allow Guest Requests', value: true, type: 'boolean', description: 'Guests can submit requests' },
      ],
    },
    {
      id: 'preventive-maintenance',
      name: 'Preventive Maintenance',
      icon: Clock,
      description: 'PM scheduling and configuration',
      settings: [
        { id: 'auto-schedule', name: 'Auto Schedule PM', value: true, type: 'boolean', description: 'Automatically generate PM schedules' },
        { id: 'pm-advance-days', name: 'PM Advance Notice (days)', value: 7, type: 'number', description: 'Days before PM due date' },
        { id: 'pm-frequency', name: 'Default PM Frequency', value: 'Monthly', type: 'select', options: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-Annual', 'Annual'], description: 'Default PM interval' },
        { id: 'require-checklist', name: 'Require PM Checklist', value: true, type: 'boolean', description: 'Mandatory checklist completion' },
        { id: 'pm-reminder', name: 'PM Reminder Email', value: true, type: 'boolean', description: 'Send email reminders' },
      ],
    },
    {
      id: 'alerts',
      name: 'Alerts & Notifications',
      icon: Bell,
      description: 'Alert thresholds and notifications',
      settings: [
        { id: 'email-alerts', name: 'Email Alerts', value: true, type: 'boolean', description: 'Enable email notifications' },
        { id: 'sms-alerts', name: 'SMS Alerts', value: false, type: 'boolean', description: 'Enable SMS notifications' },
        { id: 'critical-threshold', name: 'Critical Alert Threshold', value: 1, type: 'number', description: 'Hours before critical alert' },
        { id: 'alert-recipients', name: 'Alert Recipients', value: 'engineering@seleda.et', type: 'text', description: 'Comma-separated email list' },
        { id: 'downtime-alert', name: 'Downtime Alert', value: true, type: 'boolean', description: 'Alert on equipment downtime' },
      ],
    },
    {
      id: 'safety',
      name: 'Safety & Compliance',
      icon: ShieldCheck,
      description: 'Safety protocols and compliance settings',
      settings: [
        { id: 'safety-checklist', name: 'Safety Checklist Required', value: true, type: 'boolean', description: 'Mandatory safety check before work' },
        { id: 'ppe-req', name: 'PPE Requirements', value: true, type: 'boolean', description: 'Track PPE compliance' },
        { id: 'incident-reporting', name: 'Incident Reporting', value: true, type: 'boolean', description: 'Mandatory incident documentation' },
        { id: 'compliance-alerts', name: 'Compliance Alerts', value: true, type: 'boolean', description: 'Alert on compliance issues' },
        { id: 'inspection-frequency', name: 'Safety Inspection Frequency', value: 'Monthly', type: 'select', options: ['Weekly', 'Monthly', 'Quarterly'], description: 'Regular safety inspection interval' },
      ],
    },
    {
      id: 'locations',
      name: 'Locations',
      icon: MapPin,
      description: 'Building and area configuration',
      settings: [
        { id: 'floors', name: 'Number of Floors', value: 10, type: 'number', description: 'Total building floors' },
        { id: 'rooms', name: 'Total Rooms', value: 150, type: 'number', description: 'Total guest rooms' },
        { id: 'areas', name: 'Public Areas', value: 'Lobby, Restaurant, Pool, Gym', type: 'text', description: 'Public area names' },
        { id: 'back-of-house', name: 'Back of House Areas', value: 'Kitchen, Laundry, Storage, Plant Room', type: 'text', description: 'BOH area names' },
        { id: 'parking', name: 'Parking Capacity', value: 100, type: 'number', description: 'Total parking spaces' },
      ],
    },
    {
      id: 'utilities',
      name: 'Utilities',
      icon: Zap,
      description: 'Utility meter and consumption settings',
      settings: [
        { id: 'electricity-unit', name: 'Electricity Unit', value: 'kWh', type: 'select', options: ['kWh', 'MWh'], description: 'Electricity measurement unit' },
        { id: 'water-unit', name: 'Water Unit', value: 'Liters', type: 'select', options: ['Liters', 'Cubic Meters', 'Gallons'], description: 'Water measurement unit' },
        { id: 'gas-unit', name: 'Gas Unit', value: 'Cubic Meters', type: 'select', options: ['Cubic Meters', 'Liters'], description: 'Gas measurement unit' },
        { id: 'meter-reading-freq', name: 'Meter Reading Frequency', value: 'Daily', type: 'select', options: ['Daily', 'Weekly', 'Monthly'], description: 'Utility meter reading interval' },
        { id: 'consumption-alert', name: 'Consumption Alert Threshold', value: 10, type: 'number', description: 'Percentage above normal' },
      ],
    },
  ]);

  const [settings, setSettings] = useState<Record<string, any>>({});

  const handleSettingChange = (sectionId: string, settingId: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [`${sectionId}-${settingId}`]: value,
    }));
  };

  const currentSection = configSections.find(s => s.id === activeSection);
  const Icon = currentSection?.icon || Settings;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Configuration</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Engineering portal settings and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Search size={16} />
            Search Settings
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar - Sections */}
        <div className="lg:col-span-3 space-y-2">
          {configSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full p-4 rounded-2xl flex items-center gap-3 transition-all ${
                  activeSection === section.id
                    ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <SectionIcon size={16} />
                <div className="text-left">
                  <span className="text-[10px] font-black block">{section.name}</span>
                  <span className="text-[8px] font-medium opacity-70">{section.settings.length} settings</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9">
          {currentSection && (
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-3xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">{currentSection.name}</h3>
                  <p className="text-[10px] text-slate-400">{currentSection.description}</p>
                </div>
              </div>

              <div className="space-y-6">
                {currentSection.settings.map((setting) => {
                  const currentValue = settings[`${currentSection.id}-${setting.id}`] ?? setting.value;
                  return (
                    <div key={setting.id} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <label className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest block">
                            {setting.name}
                          </label>
                          {setting.description && (
                            <p className="text-[8px] text-slate-500 mt-0.5">{setting.description}</p>
                          )}
                        </div>
                      </div>

                      {setting.type === 'text' && (
                        <input
                          type="text"
                          value={currentValue as string}
                          onChange={(e) => handleSettingChange(currentSection.id, setting.id, e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}

                      {setting.type === 'number' && (
                        <input
                          type="number"
                          value={currentValue as number}
                          onChange={(e) => handleSettingChange(currentSection.id, setting.id, parseInt(e.target.value))}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}

                      {setting.type === 'boolean' && (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleSettingChange(currentSection.id, setting.id, !currentValue)}
                            className={`w-12 h-6 rounded-full transition-all ${
                              currentValue ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                            }`}
                          >
                            <div
                              className={`w-5 h-5 rounded-full bg-white transition-all ${
                                currentValue ? 'translate-x-6' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                            {currentValue ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      )}

                      {setting.type === 'select' && setting.options && (
                        <select
                          value={currentValue as string}
                          onChange={(e) => handleSettingChange(currentSection.id, setting.id, e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {setting.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}

                      {setting.type === 'date' && (
                        <input
                          type="date"
                          value={currentValue as string}
                          onChange={(e) => handleSettingChange(currentSection.id, setting.id, e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                  Reset to Defaults
                </button>
                <button className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-[10px] hover:bg-indigo-700 transition flex items-center gap-2">
                  <Save size={14} />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
