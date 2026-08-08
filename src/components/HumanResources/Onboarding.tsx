import React, { useState } from 'react';
import { 
  UserPlus, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  ClipboardCheck,
  Shield,
  CreditCard,
  GraduationCap,
  Building2,
  ChevronRight
} from 'lucide-react';

const Onboarding = () => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'documents' | 'orientation' | 'tracking'>('checklist');

  const onboardingChecklists = [
    { 
      id: 'ONB-001', 
      employee: 'John Doe',
      position: 'Receptionist',
      department: 'Front Office',
      startDate: '2024-07-01',
      status: 'In Progress',
      progress: 65,
      assignedTo: 'Sarah Johnson',
      checklistItems: [
        { item: 'Employment Contract', completed: true },
        { item: 'ID Card Issued', completed: true },
        { item: 'Uniform Assigned', completed: true },
        { item: 'System Access', completed: true },
        { item: 'Orientation Completed', completed: false },
        { item: 'Department Training', completed: false },
      ]
    },
    { 
      id: 'ONB-002', 
      employee: 'Maria Garcia',
      position: 'Room Attendant',
      department: 'Housekeeping',
      startDate: '2024-07-05',
      status: 'Pending',
      progress: 0,
      assignedTo: 'James Chen',
      checklistItems: [
        { item: 'Employment Contract', completed: false },
        { item: 'ID Card Issued', completed: false },
        { item: 'Uniform Assigned', completed: false },
        { item: 'System Access', completed: false },
        { item: 'Orientation Completed', completed: false },
        { item: 'Department Training', completed: false },
      ]
    },
    { 
      id: 'ONB-003', 
      employee: 'Carlos Ray',
      position: 'Line Cook',
      department: 'F&B',
      startDate: '2024-06-28',
      status: 'Completed',
      progress: 100,
      assignedTo: 'Elena Martinez',
      checklistItems: [
        { item: 'Employment Contract', completed: true },
        { item: 'ID Card Issued', completed: true },
        { item: 'Uniform Assigned', completed: true },
        { item: 'System Access', completed: true },
        { item: 'Orientation Completed', completed: true },
        { item: 'Department Training', completed: true },
      ]
    },
  ];

  const documentCollection = [
    { 
      id: 'DOC-001', 
      employee: 'John Doe',
      document: 'Employment Contract',
      status: 'Received',
      receivedDate: '2024-06-25',
      verifiedBy: 'HR Manager'
    },
    { 
      id: 'DOC-002', 
      employee: 'John Doe',
      document: 'Passport Copy',
      status: 'Received',
      receivedDate: '2024-06-25',
      verifiedBy: 'HR Manager'
    },
    { 
      id: 'DOC-003', 
      employee: 'John Doe',
      document: 'Work Permit',
      status: 'Pending',
      receivedDate: null,
      verifiedBy: null
    },
    { 
      id: 'DOC-004', 
      employee: 'Maria Garcia',
      document: 'Employment Contract',
      status: 'Pending',
      receivedDate: null,
      verifiedBy: null
    },
  ];

  const orientationSchedule = [
    { 
      id: 'ORI-001', 
      title: 'Company Orientation',
      date: '2024-07-01',
      time: '09:00 - 12:00',
      location: 'Conference Room A',
      facilitator: 'HR Manager',
      attendees: 5,
      status: 'Scheduled'
    },
    { 
      id: 'ORI-002', 
      title: 'Safety Training',
      date: '2024-07-01',
      time: '14:00 - 16:00',
      location: 'Training Room',
      facilitator: 'Safety Officer',
      attendees: 5,
      status: 'Scheduled'
    },
    { 
      id: 'ORI-003', 
      title: 'Department Orientation - Front Office',
      date: '2024-07-02',
      time: '09:00 - 17:00',
      location: 'Front Office',
      facilitator: 'Sarah Johnson',
      attendees: 1,
      status: 'Scheduled'
    },
  ];

  const probationTracking = [
    { 
      id: 'PROB-001', 
      employee: 'John Doe',
      position: 'Receptionist',
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      status: 'Active',
      reviewDate: '2024-08-01',
      progress: 0,
      supervisor: 'Sarah Johnson'
    },
    { 
      id: 'PROB-002', 
      employee: 'Elena Smith',
      position: 'F&B Supervisor',
      startDate: '2024-05-01',
      endDate: '2024-07-31',
      status: 'Review Due',
      reviewDate: '2024-06-30',
      progress: 67,
      supervisor: 'Elena Martinez'
    },
    { 
      id: 'PROB-003', 
      employee: 'James Wilson',
      position: 'Maintenance Assistant',
      startDate: '2024-04-01',
      endDate: '2024-06-30',
      status: 'Completed',
      reviewDate: '2024-06-01',
      progress: 100,
      supervisor: 'Robert Wilson'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Onboarding</h2>
          <p className="text-sm text-slate-500 mt-1">Manage new employee onboarding, documents, and probation</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Start Onboarding
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Onboarding', value: '3', icon: UserPlus, color: 'text-indigo-500' },
          { label: 'Completed This Month', value: '5', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Pending Documents', value: '8', icon: FileText, color: 'text-amber-500' },
          { label: 'Probation Ending', value: '2', icon: Clock, color: 'text-rose-500' },
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
          { id: 'checklist', label: 'Checklist', icon: ClipboardCheck },
          { id: 'documents', label: 'Documents', icon: FileText },
          { id: 'orientation', label: 'Orientation', icon: GraduationCap },
          { id: 'tracking', label: 'Probation', icon: Clock },
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

      {/* Checklist Tab */}
      {activeTab === 'checklist' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Onboarding Checklists</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-4">
            {onboardingChecklists.map((checklist) => (
              <div key={checklist.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <UserPlus className="text-indigo-600 dark:text-indigo-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{checklist.employee}</h4>
                      <p className="text-xs font-medium text-slate-400">{checklist.position} • {checklist.department}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-400 uppercase">Progress</p>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{checklist.progress}%</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      checklist.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      checklist.status === 'In Progress' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {checklist.status}
                    </span>
                  </div>
                </div>
                
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-indigo-500" style={{ width: `${checklist.progress}%` }} />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {checklist.checklistItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs">
                      {item.completed ? (
                        <CheckCircle2 className="text-emerald-500" size={12} />
                      ) : (
                        <div className="w-3 h-3 rounded-full border-2 border-slate-300" />
                      )}
                      <span className={item.completed ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white font-bold'}>
                        {item.item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Collection</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Upload Document
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Document</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Received Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Verified By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {documentCollection.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{doc.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.document}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.receivedDate || '-'}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.verifiedBy || '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === 'Received' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {doc.status}
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

      {/* Orientation Tab */}
      {activeTab === 'orientation' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Orientation Schedule</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Schedule Orientation
            </button>
          </div>
          
          <div className="p-6 space-y-4">
            {orientationSchedule.map((session) => (
              <div key={session.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                      <GraduationCap className="text-indigo-600 dark:text-indigo-400" size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{session.title}</h4>
                      <p className="text-xs font-medium text-slate-400">Facilitator: {session.facilitator}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium uppercase">
                    {session.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-400">Date</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{session.date}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Time</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{session.time}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400">Location</span>
                    <p className="font-semibold text-slate-900 dark:text-white">{session.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                  <Users size={12} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-400">{session.attendees} attendees</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Probation Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Probation Tracking</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search..." 
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
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Start Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">End Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Review Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Progress</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {probationTracking.map((probation) => (
                <tr key={probation.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{probation.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{probation.position}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{probation.startDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{probation.endDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{probation.reviewDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${probation.progress}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{probation.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      probation.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 
                      probation.status === 'Review Due' ? 'bg-rose-50 text-rose-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {probation.status}
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

export default Onboarding;
