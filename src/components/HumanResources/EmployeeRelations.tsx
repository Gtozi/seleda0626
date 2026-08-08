import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MessageSquare, 
  Award, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  Star,
  ThumbsUp
} from 'lucide-react';

const EmployeeRelations = () => {
  const [activeTab, setActiveTab] = useState<'disciplinary' | 'grievances' | 'recognition' | 'surveys'>('disciplinary');

  const disciplinaryActions = [
    { 
      id: 'DA-001', 
      employee: 'John Doe', 
      type: 'Written Warning',
      category: 'Attendance',
      date: '2024-06-20',
      issuedBy: 'Sarah Johnson',
      description: 'Repeated tardiness - 3 late arrivals in June',
      status: 'Active',
      expiryDate: '2024-12-20'
    },
    { 
      id: 'DA-002', 
      employee: 'Elena Smith', 
      type: 'Verbal Warning',
      category: 'Performance',
      date: '2024-06-15',
      issuedBy: 'Sarah Johnson',
      description: 'Below performance standards for guest satisfaction',
      status: 'Active',
      expiryDate: '2024-09-15'
    },
    { 
      id: 'DA-003', 
      employee: 'Carlos Ray', 
      type: 'Suspension',
      category: 'Conduct',
      date: '2024-05-10',
      issuedBy: 'Robert Wilson',
      description: 'Violation of safety protocols',
      status: 'Resolved',
      expiryDate: '2024-05-17'
    },
  ];

  const grievances = [
    { 
      id: 'GRV-001', 
      employee: 'Maria Garcia', 
      type: 'Working Conditions',
      category: 'Facilities',
      date: '2024-06-18',
      description: 'Inadequate break room facilities',
      status: 'Under Investigation',
      assignedTo: 'HR Department',
      priority: 'Medium'
    },
    { 
      id: 'GRV-002', 
      employee: 'James Wilson', 
      type: 'Harassment',
      category: 'Workplace Relations',
      date: '2024-06-10',
      description: 'Report of inappropriate behavior by supervisor',
      status: 'Investigation Complete',
      assignedTo: 'HR Director',
      priority: 'High'
    },
    { 
      id: 'GRV-003', 
      employee: 'Lisa Anderson', 
      type: 'Pay Dispute',
      category: 'Compensation',
      date: '2024-05-25',
      description: 'Discrepancy in overtime calculation',
      status: 'Resolved',
      assignedTo: 'Payroll Manager',
      priority: 'Low'
    },
  ];

  const recognitionPrograms = [
    { 
      id: 'RP-001', 
      name: 'Employee of the Month', 
      type: 'Monthly',
      description: 'Recognizes outstanding performance and dedication',
      currentWinner: 'Sarah Johnson',
      lastAwarded: '2024-06-01',
      nextNomination: '2024-07-01',
      status: 'Active'
    },
    { 
      id: 'RP-002', 
      name: 'Service Award', 
      type: 'Longevity',
      description: 'Celebrates years of service milestones',
      currentWinner: 'Multiple recipients',
      lastAwarded: '2024-06-15',
      nextNomination: 'Ongoing',
      status: 'Active'
    },
    { 
      id: 'RP-003', 
      name: 'Innovation Award', 
      type: 'Quarterly',
      description: 'Rewards creative solutions and process improvements',
      currentWinner: 'Engineering Team',
      lastAwarded: '2024-04-01',
      nextNomination: '2024-07-01',
      status: 'Active'
    },
  ];

  const recentRecognition = [
    { 
      id: 'REC-001', 
      employee: 'Sarah Johnson', 
      award: 'Employee of the Month',
      category: 'Performance',
      date: '2024-06-01',
      recognizedBy: 'General Manager',
      reason: 'Exceptional guest satisfaction scores and team leadership'
    },
    { 
      id: 'REC-002', 
      employee: 'Robert Wilson', 
      award: '5 Years Service',
      category: 'Longevity',
      date: '2024-05-20',
      recognizedBy: 'General Manager',
      reason: 'Dedicated service and commitment to excellence'
    },
    { 
      id: 'REC-003', 
      employee: 'Elena Martinez', 
      award: 'Innovation Award',
      category: 'Innovation',
      date: '2024-04-01',
      recognizedBy: 'Operations Director',
      reason: 'Developed new kitchen efficiency protocols'
    },
  ];

  const employeeSurveys = [
    { 
      id: 'ES-001', 
      name: 'Employee Satisfaction Survey', 
      type: 'Annual',
      date: '2024-03-15',
      responseRate: 78,
      participants: 193,
      status: 'Completed',
      overallScore: 4.2
    },
    { 
      id: 'ES-002', 
      name: 'Work Environment Feedback', 
      type: 'Quarterly',
      date: '2024-06-01',
      responseRate: 65,
      participants: 161,
      status: 'In Progress',
      overallScore: null
    },
    { 
      id: 'ES-003', 
      name: 'Training Needs Assessment', 
      type: 'Biennial',
      date: '2023-11-20',
      responseRate: 82,
      participants: 203,
      status: 'Completed',
      overallScore: 4.0
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Employee Relations</h2>
          <p className="text-sm text-slate-500 mt-1">Manage disciplinary actions, grievances, recognition, and feedback</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            New Action
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Disciplinary', value: '2', icon: AlertTriangle, color: 'text-rose-500' },
          { label: 'Open Grievances', value: '1', icon: MessageSquare, color: 'text-amber-500' },
          { label: 'Recognition Awards', value: '24', icon: Award, color: 'text-emerald-500' },
          { label: 'Survey Response', value: '78%', icon: TrendingUp, color: 'text-indigo-500' },
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
          { id: 'disciplinary', label: 'Disciplinary', icon: AlertTriangle },
          { id: 'grievances', label: 'Grievances', icon: MessageSquare },
          { id: 'recognition', label: 'Recognition', icon: Award },
          { id: 'surveys', label: 'Surveys', icon: FileText },
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

      {/* Disciplinary Tab */}
      {activeTab === 'disciplinary' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Disciplinary Actions</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Record Action
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Issued By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {disciplinaryActions.map((action) => (
                <tr key={action.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{action.employee}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      action.type === 'Written Warning' ? 'bg-amber-50 text-amber-600' : 
                      action.type === 'Suspension' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {action.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{action.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{action.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{action.issuedBy}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      action.status === 'Active' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {action.status}
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

      {/* Grievances Tab */}
      {activeTab === 'grievances' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Grievances</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                File Grievance
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Assigned To</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Priority</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {grievances.map((grievance) => (
                <tr key={grievance.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{grievance.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{grievance.type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{grievance.category}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{grievance.date}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{grievance.assignedTo}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      grievance.priority === 'High' ? 'bg-rose-50 text-rose-600' : 
                      grievance.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {grievance.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      grievance.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 
                      grievance.status === 'Investigation Complete' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {grievance.status}
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

      {/* Recognition Tab */}
      {activeTab === 'recognition' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recognition Programs */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recognition Programs</h3>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Add Program
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {recognitionPrograms.map((program) => (
                <div key={program.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center">
                        <Award className="text-amber-600 dark:text-amber-400" size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{program.name}</h4>
                        <p className="text-xs font-medium text-slate-400">{program.type}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium uppercase">
                      {program.status}
                    </span>
                  </div>
                  
                  <p className="text-xs font-medium text-slate-400 mb-2">{program.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-bold text-slate-400">Current Winner:</span>
                      <span className="font-semibold text-slate-900 dark:text-white ml-1">{program.currentWinner}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400">Next Nomination:</span>
                      <span className="font-semibold text-slate-900 dark:text-white ml-1">{program.nextNomination}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Recognition */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Recognition</h3>
            </div>
            
            <div className="p-6 space-y-4">
              {recentRecognition.map((recognition) => (
                <div key={recognition.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-500/20 rounded-lg flex items-center justify-center">
                      <Star className="text-amber-600 dark:text-amber-400" size={16} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{recognition.employee}</h4>
                      <p className="text-xs font-medium text-slate-400">{recognition.award}</p>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{recognition.date}</span>
                  </div>
                  <p className="text-xs font-medium text-slate-500">{recognition.reason}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ThumbsUp size={12} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-400">Recognized by {recognition.recognizedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Surveys Tab */}
      {activeTab === 'surveys' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employee Surveys</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Create Survey
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Survey Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Response Rate</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Participants</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Score</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {employeeSurveys.map((survey) => (
                <tr key={survey.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{survey.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {survey.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{survey.date}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">{survey.responseRate}%</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">{survey.participants}</td>
                  <td className="px-6 py-4 text-center">
                    {survey.overallScore ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="text-amber-400" size={12} fill="currentColor" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{survey.overallScore}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      survey.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {survey.status}
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
    </div>
  );
};

export default EmployeeRelations;
