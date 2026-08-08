import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Target, 
  Award, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight,
  MoreVertical,
  Star,
  Briefcase,
  GraduationCap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const CareerSuccession = () => {
  const [activeTab, setActiveTab] = useState<'paths' | 'talent' | 'succession' | 'mobility'>('paths');

  const careerPaths = [
    { 
      id: 'CP-001', 
      name: 'Front Office Career Path', 
      department: 'Front Office',
      levels: [
        { title: 'Receptionist', duration: '1-2 years', skills: ['Customer Service', 'Communication', 'PMS'] },
        { title: 'Senior Receptionist', duration: '2-3 years', skills: ['Team Leadership', 'Conflict Resolution', 'Operations'] },
        { title: 'Front Office Manager', duration: '3-5 years', skills: ['Strategic Planning', 'Budget Management', 'Staff Development'] },
        { title: 'Director of Front Office', duration: '5+ years', skills: ['Executive Leadership', 'Revenue Management', 'Guest Experience'] },
      ],
      activeEmployees: 45,
      totalPositions: 52
    },
    { 
      id: 'CP-002', 
      name: 'Culinary Career Path', 
      department: 'F&B',
      levels: [
        { title: 'Commis Chef', duration: '1-2 years', skills: ['Food Preparation', 'Kitchen Safety', 'Recipe Execution'] },
        { title: 'Chef de Partie', duration: '2-3 years', skills: ['Section Management', 'Menu Planning', 'Quality Control'] },
        { title: 'Sous Chef', duration: '3-4 years', skills: ['Kitchen Operations', 'Cost Control', 'Team Leadership'] },
        { title: 'Executive Chef', duration: '4+ years', skills: ['Culinary Vision', 'Financial Management', 'Strategic Planning'] },
      ],
      activeEmployees: 38,
      totalPositions: 45
    },
  ];

  const talentPool = [
    { 
      id: 'TP-001', 
      employee: 'John Doe', 
      currentPosition: 'Senior Receptionist',
      department: 'Front Office',
      potential: 'High',
      readiness: 'Ready Now',
      targetPosition: 'Front Office Manager',
      careerPath: 'Front Office Career Path',
      performanceRating: 4.5,
      lastReview: '2024-03-15'
    },
    { 
      id: 'TP-002', 
      employee: 'Elena Smith', 
      currentPosition: 'Chef de Partie',
      department: 'F&B',
      potential: 'High',
      readiness: 'Ready in 1-2 Years',
      targetPosition: 'Sous Chef',
      careerPath: 'Culinary Career Path',
      performanceRating: 4.3,
      lastReview: '2024-03-20'
    },
    { 
      id: 'TP-003', 
      employee: 'Maria Garcia', 
      currentPosition: 'Bell Services Supervisor',
      department: 'Front Office',
      potential: 'Medium',
      readiness: 'Ready in 2-3 Years',
      targetPosition: 'Front Office Manager',
      careerPath: 'Front Office Career Path',
      performanceRating: 4.0,
      lastReview: '2024-03-10'
    },
  ];

  const successionPlans = [
    { 
      id: 'SP-001', 
      position: 'General Manager', 
      incumbent: 'Robert Williams',
      department: 'Executive',
      successors: [
        { employee: 'Sarah Johnson', readiness: 'Ready Now', status: 'Primary' },
        { employee: 'Michael Chen', readiness: 'Ready in 1-2 Years', status: 'Backup' },
      ],
      riskLevel: 'Low',
      lastUpdated: '2024-06-01'
    },
    { 
      id: 'SP-002', 
      position: 'Executive Chef', 
      incumbent: 'Elena Martinez',
      department: 'F&B',
      successors: [
        { employee: 'Carlos Rodriguez', readiness: 'Ready Now', status: 'Primary' },
        { employee: 'Anna Kim', readiness: 'Ready in 1-2 Years', status: 'Backup' },
      ],
      riskLevel: 'Low',
      lastUpdated: '2024-05-15'
    },
    { 
      id: 'SP-003', 
      position: 'Front Office Manager', 
      incumbent: 'Sarah Johnson',
      department: 'Front Office',
      successors: [
        { employee: 'John Doe', readiness: 'Ready in 6-12 Months', status: 'Primary' },
        { employee: 'Emily Brown', readiness: 'Ready in 1-2 Years', status: 'Backup' },
      ],
      riskLevel: 'Medium',
      lastUpdated: '2024-06-10'
    },
  ];

  const internalMobility = [
    { 
      id: 'IM-001', 
      employee: 'James Wilson', 
      fromPosition: 'Housekeeping Supervisor',
      toPosition: 'Front Office Supervisor',
      department: 'Front Office',
      status: 'In Progress',
      initiatedDate: '2024-06-01',
      expectedCompletion: '2024-07-01'
    },
    { 
      id: 'IM-002', 
      employee: 'Lisa Anderson', 
      fromPosition: 'Restaurant Server',
      toPosition: 'Room Service Supervisor',
      department: 'F&B',
      status: 'Approved',
      initiatedDate: '2024-05-15',
      expectedCompletion: '2024-06-15'
    },
    { 
      id: 'IM-003', 
      employee: 'David Martinez', 
      fromPosition: 'Maintenance Technician',
      toPosition: 'Engineering Supervisor',
      department: 'Engineering',
      status: 'Completed',
      initiatedDate: '2024-04-01',
      expectedCompletion: '2024-05-01'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Career & Succession Planning</h2>
          <p className="text-sm text-slate-500 mt-1">Manage career paths, talent pool, and succession planning</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Add Plan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Career Paths', value: '12', icon: TrendingUp, color: 'text-indigo-500' },
          { label: 'Talent Pool', value: '45', icon: Users, color: 'text-emerald-500' },
          { label: 'Succession Plans', value: '28', icon: Target, color: 'text-purple-500' },
          { label: 'Internal Mobility', value: '8', icon: Briefcase, color: 'text-amber-500' },
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
          { id: 'paths', label: 'Career Paths', icon: TrendingUp },
          { id: 'talent', label: 'Talent Pool', icon: Users },
          { id: 'succession', label: 'Succession', icon: Target },
          { id: 'mobility', label: 'Mobility', icon: Briefcase },
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

      {/* Career Paths Tab */}
      {activeTab === 'paths' && (
        <div className="space-y-6">
          {careerPaths.map((path) => (
            <div key={path.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{path.name}</h3>
                  <p className="text-xs font-medium text-slate-400">{path.department} • {path.activeEmployees}/{path.totalPositions} Active</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                    <MoreVertical size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between">
                  {path.levels.map((level, index) => (
                    <div key={index} className="flex-1">
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{level.title}</h4>
                        </div>
                        <p className="text-xs font-medium text-slate-400 mb-2">{level.duration}</p>
                        <div className="flex flex-wrap gap-1">
                          {level.skills.slice(0, 2).map((skill) => (
                            <span key={skill} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium uppercase">
                              {skill}
                            </span>
                          ))}
                          {level.skills.length > 2 && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">
                              +{level.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                      {index < path.levels.length - 1 && (
                        <div className="flex justify-center my-2">
                          <ChevronRight size={16} className="text-slate-300" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Talent Pool Tab */}
      {activeTab === 'talent' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Talent Pool</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search talent..." 
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
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Current Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Potential</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Readiness</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Target Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Performance</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {talentPool.map((talent) => (
                <tr key={talent.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {talent.employee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{talent.employee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">{talent.currentPosition}</span>
                      <span className="text-xs font-medium text-slate-400">{talent.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      talent.potential === 'High' ? 'bg-emerald-50 text-emerald-600' : 
                      talent.potential === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {talent.potential}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      talent.readiness === 'Ready Now' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {talent.readiness}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{talent.targetPosition}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="text-amber-400" size={12} fill="currentColor" />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{talent.performanceRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <MoreVertical size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Succession Tab */}
      {activeTab === 'succession' && (
        <div className="space-y-6">
          {successionPlans.map((plan) => (
            <div key={plan.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="text-indigo-600 dark:text-indigo-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{plan.position}</h3>
                    <p className="text-xs font-medium text-slate-400">Incumbent: {plan.incumbent} • {plan.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-xs font-medium ${
                    plan.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-600' : 
                    plan.riskLevel === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {plan.riskLevel} Risk
                  </span>
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                    <MoreVertical size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-xs font-medium text-slate-500 mb-4">Successors</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {plan.successors.map((successor, index) => (
                    <div key={index} className={`p-4 rounded-xl border ${
                      successor.status === 'Primary' 
                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{successor.employee}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                          successor.status === 'Primary' ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {successor.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <GraduationCap size={12} className="text-slate-400" />
                        <span className="text-xs font-medium text-slate-500">{successor.readiness}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobility Tab */}
      {activeTab === 'mobility' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Internal Mobility</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Initiate Transfer
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">From Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">To Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Department</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Initiated</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500">Expected</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {internalMobility.map((mobility) => (
                <tr key={mobility.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{mobility.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{mobility.fromPosition}</td>
                  <td className="px-6 py-4 text-xs font-bold text-indigo-600">{mobility.toPosition}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{mobility.department}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{mobility.initiatedDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{mobility.expectedCompletion}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      mobility.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      mobility.status === 'Approved' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {mobility.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <MoreVertical size={14} className="text-slate-400" />
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

export default CareerSuccession;
