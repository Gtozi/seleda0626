import React, { useState } from 'react';
import { 
  BookOpen, 
  Target, 
  Award, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  GraduationCap,
  TrendingUp,
  Users,
  PlayCircle,
  FileText,
  ChevronRight,
  XCircle
} from 'lucide-react';

const LearningDevelopment = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'mandatory' | 'leadership' | 'history'>('plans');

  const learningPlans = [
    { 
      id: 'LP-001', 
      employee: 'John Doe',
      position: 'Receptionist',
      department: 'Front Office',
      planName: 'Front Office Excellence',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      status: 'In Progress',
      progress: 75,
      totalCourses: 8,
      completedCourses: 6,
      assignedBy: 'Sarah Johnson'
    },
    { 
      id: 'LP-002', 
      employee: 'Elena Smith',
      position: 'F&B Supervisor',
      department: 'F&B',
      planName: 'Leadership Development',
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      status: 'In Progress',
      progress: 45,
      totalCourses: 12,
      completedCourses: 5,
      assignedBy: 'HR Director'
    },
    { 
      id: 'LP-003', 
      employee: 'Carlos Ray',
      position: 'Line Cook',
      department: 'F&B',
      planName: 'Culinary Skills',
      startDate: '2024-02-01',
      endDate: '2024-05-31',
      status: 'Completed',
      progress: 100,
      totalCourses: 6,
      completedCourses: 6,
      assignedBy: 'Executive Chef'
    },
  ];

  const mandatoryTraining = [
    { 
      id: 'MT-001', 
      name: 'Workplace Safety Fundamentals',
      category: 'Safety',
      duration: '4 hours',
      frequency: 'Annual',
      dueDate: '2024-12-31',
      status: 'Active',
      completionRate: 95,
      totalEmployees: 248,
      completedEmployees: 236
    },
    { 
      id: 'MT-002', 
      name: 'Food Safety Level 2',
      category: 'F&B Safety',
      duration: '8 hours',
      frequency: 'Biennial',
      dueDate: '2025-11-20',
      status: 'Active',
      completionRate: 88,
      totalEmployees: 72,
      completedEmployees: 63
    },
    { 
      id: 'MT-003', 
      name: 'Anti-Harassment Training',
      category: 'Compliance',
      duration: '2 hours',
      frequency: 'Annual',
      dueDate: '2024-12-31',
      status: 'Active',
      completionRate: 92,
      totalEmployees: 248,
      completedEmployees: 228
    },
    { 
      id: 'MT-004', 
      name: 'Data Privacy & Security',
      category: 'Compliance',
      duration: '1 hour',
      frequency: 'Annual',
      dueDate: '2024-12-31',
      status: 'Active',
      completionRate: 85,
      totalEmployees: 248,
      completedEmployees: 211
    },
  ];

  const leadershipPrograms = [
    { 
      id: 'LD-001', 
      name: 'Emerging Leaders Program',
      description: 'Develop future leaders with essential management skills',
      duration: '6 months',
      participants: 12,
      status: 'Active',
      startDate: '2024-03-01',
      endDate: '2024-08-31',
      modules: 8
    },
    { 
      id: 'LD-002', 
      name: 'Executive Leadership Program',
      description: 'Advanced leadership training for senior managers',
      duration: '12 months',
      participants: 5,
      status: 'Active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      modules: 15
    },
    { 
      id: 'LD-003', 
      name: 'Team Leadership Essentials',
      description: 'Foundational leadership skills for new managers',
      duration: '3 months',
      participants: 18,
      status: 'Completed',
      startDate: '2023-09-01',
      endDate: '2023-11-30',
      modules: 6
    },
  ];

  const learningHistory = [
    { 
      id: 'LH-001', 
      employee: 'John Doe',
      course: 'Customer Service Excellence',
      category: 'Hospitality Skills',
      completionDate: '2024-05-15',
      status: 'Completed',
      score: 95,
      certificate: true
    },
    { 
      id: 'LH-002', 
      employee: 'Maria Garcia',
      course: 'Housekeeping Standards',
      category: 'Operations',
      completionDate: '2024-04-20',
      status: 'Completed',
      score: 88,
      certificate: true
    },
    { 
      id: 'LH-003', 
      employee: 'Robert Wilson',
      course: 'Electrical Safety',
      category: 'Safety',
      completionDate: '2024-03-10',
      status: 'Completed',
      score: 92,
      certificate: true
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Learning & Development</h2>
          <p className="text-sm text-slate-500 mt-1">Manage learning plans, mandatory training, and leadership development</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Create Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Plans', value: '45', icon: BookOpen, color: 'text-indigo-500' },
          { label: 'Mandatory Training', value: '12', icon: Target, color: 'text-rose-500' },
          { label: 'Leadership Programs', value: '3', icon: Award, color: 'text-amber-500' },
          { label: 'Completion Rate', value: '89%', icon: TrendingUp, color: 'text-emerald-500' },
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
          { id: 'plans', label: 'Learning Plans', icon: BookOpen },
          { id: 'mandatory', label: 'Mandatory Training', icon: Target },
          { id: 'leadership', label: 'Leadership Development', icon: Award },
          { id: 'history', label: 'Learning History', icon: Clock },
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

      {/* Learning Plans Tab */}
      {activeTab === 'plans' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Learning Plans</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search plans..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {learningPlans.map((plan) => (
              <div key={plan.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <BookOpen className="text-indigo-600 dark:text-indigo-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{plan.planName}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{plan.employee} • {plan.position}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                    plan.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-indigo-500" style={{ width: `${plan.progress}%` }} />
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-400">Progress</span>
                    <p className="font-black text-slate-900 dark:text-white">{plan.progress}%</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Courses</span>
                    <p className="font-black text-slate-900 dark:text-white">{plan.completedCourses}/{plan.totalCourses}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">End Date</span>
                    <p className="font-black text-slate-900 dark:text-white">{plan.endDate}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Assigned By</span>
                    <p className="font-black text-slate-900 dark:text-white">{plan.assignedBy}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandatory Training Tab */}
      {activeTab === 'mandatory' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mandatory Training</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Add Training
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {mandatoryTraining.map((training) => (
              <div key={training.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-xl flex items-center justify-center">
                      <Target className="text-rose-600 dark:text-rose-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{training.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{training.category} • {training.duration}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase">
                    {training.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-32 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${training.completionRate}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{training.completionRate}%</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400">{training.completedEmployees}/{training.totalEmployees} completed</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-400">Frequency</span>
                    <p className="font-black text-slate-900 dark:text-white">{training.frequency}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Due Date</span>
                    <p className="font-black text-slate-900 dark:text-white">{training.dueDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leadership Development Tab */}
      {activeTab === 'leadership' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Leadership Programs</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Create Program
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {leadershipPrograms.map((program) => (
              <div key={program.id} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <Award className="text-amber-600 dark:text-amber-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{program.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400">{program.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                    program.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {program.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <span className="font-bold text-slate-400">Duration</span>
                    <p className="font-black text-slate-900 dark:text-white">{program.duration}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Participants</span>
                    <p className="font-black text-slate-900 dark:text-white">{program.participants}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Modules</span>
                    <p className="font-black text-slate-900 dark:text-white">{program.modules}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">End Date</span>
                    <p className="font-black text-slate-900 dark:text-white">{program.endDate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Learning History</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search history..." 
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
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Course</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Completion Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Score</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Certificate</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {learningHistory.map((history) => (
                <tr key={history.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{history.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{history.course}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {history.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{history.completionDate}</td>
                  <td className="px-6 py-4 text-center text-sm font-semibold text-slate-900 dark:text-white">{history.score}%</td>
                  <td className="px-6 py-4 text-center">
                    {history.certificate ? (
                      <CheckCircle2 className="text-emerald-500 mx-auto" size={16} />
                    ) : (
                      <XCircle className="text-slate-300 mx-auto" size={16} />
                    )}
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

export default LearningDevelopment;
