import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Clock, 
  DollarSign, 
  Target, 
  Users, 
  Plus, 
  Edit, 
  Save,
  Search,
  Filter,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const HRConfiguration = () => {
  const [activeTab, setActiveTab] = useState<'organization' | 'attendance' | 'payroll' | 'performance'>('organization');

  const organizationSettings = [
    { 
      id: 'ORG-001', 
      category: 'Organization Structure',
      settings: [
        { name: 'Company Name', value: 'Master Hotel Group', type: 'text' },
        { name: 'Default Department', value: 'Front Office', type: 'select' },
        { name: 'Default Location', value: 'New York, USA', type: 'text' },
      ]
    },
    { 
      id: 'ORG-002', 
      category: 'Departments',
      settings: [
        { name: 'Total Departments', value: '8', type: 'number' },
        { name: 'Auto-create Cost Centers', value: 'Yes', type: 'boolean' },
        { name: 'Department Head Required', value: 'Yes', type: 'boolean' },
      ]
    },
    { 
      id: 'ORG-003', 
      category: 'Positions',
      settings: [
        { name: 'Total Positions', value: '45', type: 'number' },
        { name: 'Position Grade Required', value: 'Yes', type: 'boolean' },
        { name: 'Default Employment Type', value: 'Full-time', type: 'select' },
      ]
    },
    { 
      id: 'ORG-004', 
      category: 'Job Grades',
      settings: [
        { name: 'Total Grades', value: '5', type: 'number' },
        { name: 'Grade Naming Convention', value: 'Executive, Senior Management, Management, Senior Staff, Staff', type: 'text' },
      ]
    },
  ];

  const attendanceSettings = [
    { 
      id: 'ATT-001', 
      category: 'Shift Templates',
      settings: [
        { name: 'Total Shift Templates', value: '6', type: 'number' },
        { name: 'Default Shift Duration', value: '8 hours', type: 'text' },
        { name: 'Break Time Included', value: 'Yes', type: 'boolean' },
      ]
    },
    { 
      id: 'ATT-002', 
      category: 'Attendance Rules',
      settings: [
        { name: 'Grace Period (minutes)', value: '15', type: 'number' },
        { name: 'Late Threshold (minutes)', value: '30', type: 'number' },
        { name: 'Half-day Threshold (hours)', value: '4', type: 'number' },
      ]
    },
    { 
      id: 'ATT-003', 
      category: 'Overtime Rules',
      settings: [
        { name: 'Daily Overtime Threshold (hours)', value: '8', type: 'number' },
        { name: 'Weekly Overtime Threshold (hours)', value: '40', type: 'number' },
        { name: 'Weekend Rate Multiplier', value: '1.5x', type: 'text' },
        { name: 'Holiday Rate Multiplier', value: '2.0x', type: 'text' },
      ]
    },
    { 
      id: 'ATT-004', 
      category: 'Holiday Calendar',
      settings: [
        { name: 'Total Holidays', value: '12', type: 'number' },
        { name: 'Auto-populate Public Holidays', value: 'Yes', type: 'boolean' },
        { name: 'Holiday Region', value: 'United States', type: 'select' },
      ]
    },
  ];

  const payrollSettings = [
    { 
      id: 'PAY-001', 
      category: 'Payroll Periods',
      settings: [
        { name: 'Payroll Frequency', value: 'Monthly', type: 'select' },
        { name: 'Pay Period Start Day', value: '1st', type: 'number' },
        { name: 'Pay Period End Day', value: 'Last Day', type: 'text' },
        { name: 'Pay Day', value: '28th', type: 'number' },
      ]
    },
    { 
      id: 'PAY-002', 
      category: 'Salary Components',
      settings: [
        { name: 'Total Earnings Components', value: '9', type: 'number' },
        { name: 'Total Deductions Components', value: '8', type: 'number' },
        { name: 'Currency', value: 'USD', type: 'select' },
      ]
    },
    { 
      id: 'PAY-003', 
      category: 'Tax Rules',
      settings: [
        { name: 'Tax Calculation Method', value: 'Progressive', type: 'select' },
        { name: 'Federal Tax Rate', value: 'Variable', type: 'text' },
        { name: 'State Tax Rate', value: 'Variable', type: 'text' },
        { name: 'Auto-calculate Taxes', value: 'Yes', type: 'boolean' },
      ]
    },
    { 
      id: 'PAY-004', 
      category: 'Pension Rules',
      settings: [
        { name: 'Pension Plan Type', value: '401(k)', type: 'select' },
        { name: 'Employer Match Rate', value: '5%', type: 'text' },
        { name: 'Employee Contribution Rate', value: 'Variable', type: 'text' },
        { name: 'Vesting Period (years)', value: '3', type: 'number' },
      ]
    },
    { 
      id: 'PAY-005', 
      category: 'Bank Formats',
      settings: [
        { name: 'Default Bank Format', value: 'ACH', type: 'select' },
        { name: 'File Format', value: 'NACHA', type: 'select' },
        { name: 'Batch Processing', value: 'Yes', type: 'boolean' },
      ]
    },
  ];

  const performanceSettings = [
    { 
      id: 'PERF-001', 
      category: 'Review Templates',
      settings: [
        { name: 'Total Templates', value: '4', type: 'number' },
        { name: 'Default Review Cycle', value: 'Annual', type: 'select' },
        { name: 'Self-assessment Required', value: 'Yes', type: 'boolean' },
      ]
    },
    { 
      id: 'PERF-002', 
      category: 'Rating Scales',
      settings: [
        { name: 'Rating Scale Type', value: '1-5 Scale', type: 'select' },
        { name: 'Total Rating Levels', value: '5', type: 'number' },
        { name: 'Rating Labels', value: 'Poor, Fair, Good, Very Good, Excellent', type: 'text' },
      ]
    },
    { 
      id: 'PERF-003', 
      category: 'Competency Models',
      settings: [
        { name: 'Total Competency Models', value: '3', type: 'number' },
        { name: 'Default Competency Framework', value: 'Hotel Industry Standard', type: 'select' },
        { name: 'Custom Competencies Allowed', value: 'Yes', type: 'boolean' },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">HR Configuration</h2>
          <p className="text-sm text-slate-500 mt-1">Configure HR settings, attendance rules, payroll parameters, and performance templates</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-slate-50 transition shadow-sm">
            <Save size={16} />
            Save All
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'organization', label: 'Organization', icon: Building2 },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'payroll', label: 'Payroll', icon: DollarSign },
          { id: 'performance', label: 'Performance', icon: Target },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Organization Tab */}
      {activeTab === 'organization' && (
        <div className="space-y-6">
          {organizationSettings.map((section) => (
            <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{section.category}</h3>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                  <MoreVertical size={16} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {section.settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{setting.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{setting.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {setting.type === 'boolean' ? (
                        <div className={`w-10 h-6 rounded-full transition-colors ${setting.value === 'Yes' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.value === 'Yes' ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="text" 
                            defaultValue={setting.value}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {attendanceSettings.map((section) => (
            <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{section.category}</h3>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                  <MoreVertical size={16} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {section.settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{setting.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{setting.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {setting.type === 'boolean' ? (
                        <div className={`w-10 h-6 rounded-full transition-colors ${setting.value === 'Yes' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.value === 'Yes' ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="text" 
                            defaultValue={setting.value}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Payroll Tab */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {payrollSettings.map((section) => (
            <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{section.category}</h3>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                  <MoreVertical size={16} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {section.settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{setting.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{setting.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {setting.type === 'boolean' ? (
                        <div className={`w-10 h-6 rounded-full transition-colors ${setting.value === 'Yes' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.value === 'Yes' ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="text" 
                            defaultValue={setting.value}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {performanceSettings.map((section) => (
            <div key={section.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{section.category}</h3>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                  <MoreVertical size={16} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                {section.settings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{setting.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{setting.type}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {setting.type === 'boolean' ? (
                        <div className={`w-10 h-6 rounded-full transition-colors ${setting.value === 'Yes' ? 'bg-indigo-500' : 'bg-slate-300'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${setting.value === 'Yes' ? 'translate-x-5' : 'translate-x-1'}`} />
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="text" 
                            defaultValue={setting.value}
                            className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-32 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      )}
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
                      </button>
                    </div>
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

export default HRConfiguration;
