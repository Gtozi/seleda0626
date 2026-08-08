import React, { useState } from 'react';
import { 
  Shield, 
  AlertTriangle, 
  ClipboardCheck, 
  Heart, 
  HardHat, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';

const HealthSafety = () => {
  const [activeTab, setActiveTab] = useState<'incidents' | 'training' | 'examinations' | 'ppe'>('incidents');

  const incidents = [
    { 
      id: 'INC-001', 
      type: 'Slip and Fall', 
      severity: 'Minor',
      location: 'Kitchen',
      date: '2024-06-25',
      employee: 'John Doe',
      description: 'Slipped on wet floor near dishwashing area',
      status: 'Investigating',
      daysLost: 0
    },
    { 
      id: 'INC-002', 
      type: 'Equipment Injury', 
      severity: 'Moderate',
      location: 'Engineering',
      date: '2024-06-20',
      employee: 'Carlos Ray',
      description: 'Minor cut from improper tool handling',
      status: 'Closed',
      daysLost: 2
    },
    { 
      id: 'INC-003', 
      type: 'Chemical Exposure', 
      severity: 'Minor',
      location: 'Housekeeping',
      date: '2024-06-15',
      employee: 'Maria Garcia',
      description: 'Minor irritation from cleaning solution',
      status: 'Closed',
      daysLost: 0
    },
  ];

  const safetyTraining = [
    { 
      id: 'ST-001', 
      name: 'Workplace Safety Fundamentals', 
      type: 'Mandatory',
      category: 'General Safety',
      duration: '4 hours',
      frequency: 'Annual',
      lastCompleted: '2024-03-15',
      nextDue: '2025-03-15',
      completionRate: 95,
      totalEmployees: 248,
      status: 'Active'
    },
    { 
      id: 'ST-002', 
      name: 'Food Safety Level 2', 
      type: 'Mandatory',
      category: 'F&B Safety',
      duration: '8 hours',
      frequency: 'Biennial',
      lastCompleted: '2023-11-20',
      nextDue: '2025-11-20',
      completionRate: 88,
      totalEmployees: 72,
      status: 'Active'
    },
    { 
      id: 'ST-003', 
      name: 'Chemical Handling', 
      type: 'Role-Specific',
      category: 'Hazardous Materials',
      duration: '2 hours',
      frequency: 'Annual',
      lastCompleted: '2024-01-10',
      nextDue: '2025-01-10',
      completionRate: 100,
      totalEmployees: 45,
      status: 'Active'
    },
  ];

  const medicalExaminations = [
    { 
      id: 'ME-001', 
      employee: 'John Doe', 
      type: 'Pre-Employment',
      date: '2021-03-10',
      result: 'Fit for Duty',
      nextExam: '2026-03-10',
      status: 'Valid'
    },
    { 
      id: 'ME-002', 
      employee: 'Elena Smith', 
      type: 'Annual',
      date: '2024-01-15',
      result: 'Fit for Duty',
      nextExam: '2025-01-15',
      status: 'Valid'
    },
    { 
      id: 'ME-003', 
      employee: 'Carlos Ray', 
      type: 'Return to Work',
      date: '2024-06-22',
      result: 'Fit for Duty with Restrictions',
      nextExam: '2024-07-22',
      status: 'Review Required'
    },
  ];

  const ppeTracking = [
    { 
      id: 'PPE-001', 
      item: 'Safety Helmets', 
      category: 'Head Protection',
      totalIssued: 150,
      inUse: 142,
      needsReplacement: 8,
      lastInspection: '2024-06-01',
      status: 'Good'
    },
    { 
      id: 'PPE-002', 
      item: 'Safety Shoes', 
      category: 'Foot Protection',
      totalIssued: 200,
      inUse: 185,
      needsReplacement: 15,
      lastInspection: '2024-06-01',
      status: 'Good'
    },
    { 
      id: 'PPE-003', 
      item: 'Safety Gloves', 
      category: 'Hand Protection',
      totalIssued: 300,
      inUse: 280,
      needsReplacement: 20,
      lastInspection: '2024-06-01',
      status: 'Good'
    },
    { 
      id: 'PPE-004', 
      item: 'High-Visibility Vests', 
      category: 'Body Protection',
      totalIssued: 100,
      inUse: 95,
      needsReplacement: 5,
      lastInspection: '2024-06-01',
      status: 'Good'
    },
  ];

  const riskAssessments = [
    { 
      id: 'RA-001', 
      area: 'Kitchen', 
      hazardLevel: 'High',
      lastAssessment: '2024-05-15',
      nextAssessment: '2024-11-15',
      status: 'Review Required',
      controls: 8
    },
    { 
      id: 'RA-002', 
      area: 'Engineering Workshop', 
      hazardLevel: 'Medium',
      lastAssessment: '2024-04-20',
      nextAssessment: '2024-10-20',
      status: 'Valid',
      controls: 6
    },
    { 
      id: 'RA-003', 
      area: 'Housekeeping Storage', 
      hazardLevel: 'Low',
      lastAssessment: '2024-06-01',
      nextAssessment: '2024-12-01',
      status: 'Valid',
      controls: 4
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Health & Safety</h2>
          <p className="text-sm text-slate-500 mt-1">Manage incidents, training, examinations, and safety compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Report Incident
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Incidents (YTD)', value: '12', icon: AlertTriangle, color: 'text-rose-500' },
          { label: 'Days Lost', value: '8', icon: Calendar, color: 'text-amber-500' },
          { label: 'Training Compliance', value: '92%', icon: ClipboardCheck, color: 'text-emerald-500' },
          { label: 'Medical Valid', value: '245', icon: Heart, color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-xs font-medium text-slate-500 leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
          { id: 'training', label: 'Safety Training', icon: ClipboardCheck },
          { id: 'examinations', label: 'Medical Exams', icon: Heart },
          { id: 'ppe', label: 'PPE & Risk', icon: HardHat },
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

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Incident Reports</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search incidents..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Severity</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Location</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Days Lost</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {incidents.map((incident) => (
                <tr key={incident.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{incident.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.severity === 'Minor' ? 'bg-emerald-50 text-emerald-600' : 
                      incident.severity === 'Moderate' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {incident.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{incident.location}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{incident.employee}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{incident.date}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">{incident.daysLost}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      incident.status === 'Closed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {incident.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <FileText size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Safety Training Tab */}
      {activeTab === 'training' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Safety Training Programs</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Add Training
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {safetyTraining.map((training) => (
              <div key={training.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Shield className="text-emerald-600 dark:text-emerald-400" size={20} />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                    training.type === 'Mandatory' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {training.type}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{training.name}</h4>
                <p className="text-xs font-medium text-slate-400 mb-3">{training.category} • {training.duration}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Frequency</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{training.frequency}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Next Due</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{training.nextDue}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-slate-400">Completion</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {training.completionRate}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${training.completionRate}%` }} />
                  </div>
                  <p className="text-xs font-medium text-slate-400 mt-1">{training.totalEmployees} employees</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Examinations Tab */}
      {activeTab === 'examinations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Medical Examinations</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Schedule Exam
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Last Exam</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Next Exam</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Result</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {medicalExaminations.map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{exam.employee}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {exam.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{exam.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{exam.nextExam}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{exam.result}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      exam.status === 'Valid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <FileText size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PPE & Risk Tab */}
      {activeTab === 'ppe' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* PPE Tracking */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">PPE Tracking</h3>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Add PPE
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {ppeTracking.map((ppe) => (
                <div key={ppe.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <HardHat className="text-amber-600 dark:text-amber-400" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{ppe.item}</h4>
                        <p className="text-xs font-medium text-slate-400">{ppe.category}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium uppercase">
                      {ppe.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase">Issued</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{ppe.totalIssued}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase">In Use</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{ppe.inUse}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase">Replace</p>
                      <p className="text-xs font-semibold text-amber-600">{ppe.needsReplacement}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Assessments */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Risk Assessments</h3>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                New Assessment
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {riskAssessments.map((risk) => (
                <div key={risk.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        risk.hazardLevel === 'High' ? 'bg-rose-100 dark:bg-rose-500/20' :
                        risk.hazardLevel === 'Medium' ? 'bg-amber-100 dark:bg-amber-500/20' :
                        'bg-emerald-100 dark:bg-emerald-500/20'
                      }`}>
                        <AlertTriangle className={`${
                          risk.hazardLevel === 'High' ? 'text-rose-600 dark:text-rose-400' :
                          risk.hazardLevel === 'Medium' ? 'text-amber-600 dark:text-amber-400' :
                          'text-emerald-600 dark:text-emerald-400'
                        }`} size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{risk.area}</h4>
                        <p className="text-xs font-medium text-slate-400">{risk.controls} controls in place</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      risk.status === 'Valid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {risk.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Last Assessment</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{risk.lastAssessment}</span>
                  </div>
                  <div className="flex justify-between text-[10px] mt-1">
                    <span className="font-bold text-slate-400">Next Assessment</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{risk.nextAssessment}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthSafety;
