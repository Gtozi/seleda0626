import React, { useState } from 'react';
import { 
  Search,
  Plus,
  FileText,
  Clock,
  User,
  MapPin,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Tag,
  ClipboardList,
  Users,
  Camera,
  FolderOpen,
  History,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

const Investigations: React.FC = () => {
  const [showNewCase, setShowNewCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  const priorities = ['Low', 'Medium', 'High', 'Critical'];
  const statuses = ['Open', 'In Progress', 'Evidence Collection', 'Interviews', 'Analysis', 'Review', 'Closed'];

  const cases = [
    { 
      id: 'INV-001', 
      title: 'Guest Theft Investigation',
      incidentId: 'INC-001',
      description: 'Investigation into reported laptop theft from room 312',
      leadInvestigator: 'John D.',
      priority: 'High',
      status: 'In Progress',
      createdAt: '2024-01-15',
      targetDate: '2024-01-22',
      witnesses: 2,
      evidenceItems: 5
    },
    { 
      id: 'INV-002', 
      title: 'Security Breach Analysis',
      incidentId: 'INC-004',
      description: 'Analysis of unauthorized access attempt at rear entrance',
      leadInvestigator: 'Sarah L.',
      priority: 'High',
      status: 'Evidence Collection',
      createdAt: '2024-01-14',
      targetDate: '2024-01-21',
      witnesses: 1,
      evidenceItems: 8
    },
    { 
      id: 'INV-003', 
      title: 'Employee Misconduct Review',
      incidentId: 'INC-006',
      description: 'Review of reported misconduct by housekeeping staff',
      leadInvestigator: 'Elena R.',
      priority: 'Medium',
      status: 'Interviews',
      createdAt: '2024-01-13',
      targetDate: '2024-01-20',
      witnesses: 3,
      evidenceItems: 4
    },
    { 
      id: 'INV-004', 
      title: 'Property Damage Assessment',
      incidentId: 'INC-003',
      description: 'Assessment of lobby window damage and cause determination',
      leadInvestigator: 'Carlos M.',
      priority: 'Low',
      status: 'Closed',
      createdAt: '2024-01-10',
      targetDate: '2024-01-17',
      witnesses: 0,
      evidenceItems: 3
    },
  ];

  const filteredCases = cases.filter(investigation => {
    const statusMatch = filterStatus === 'all' || investigation.status === filterStatus;
    const priorityMatch = filterPriority === 'all' || investigation.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-100 text-rose-700';
      case 'High': return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700';
      case 'In Progress': return 'bg-amber-100 text-amber-700';
      case 'Evidence Collection': return 'bg-purple-100 text-purple-700';
      case 'Interviews': return 'bg-indigo-100 text-indigo-700';
      case 'Analysis': return 'bg-teal-100 text-teal-700';
      case 'Review': return 'bg-cyan-100 text-cyan-700';
      case 'Closed': return 'bg-green-100 text-green-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const NewCaseForm = () => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Register New Investigation Case</h2>
        <button 
          onClick={() => setShowNewCase(false)}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <XCircle className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Case Title</label>
          <input 
            type="text"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Enter case title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Related Incident ID</label>
          <input 
            type="text"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="e.g., INC-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea 
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Describe the investigation scope..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lead Investigator</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              <option value="">Select investigator...</option>
              <option value="John D.">John D.</option>
              <option value="Elena R.">Elena R.</option>
              <option value="Carlos M.">Carlos M.</option>
              <option value="Sarah L.">Sarah L.</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              {priorities.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
            <input 
              type="date"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
            <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Create Case
          </button>
          <button 
            onClick={() => setShowNewCase(false)}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const CaseDetail = ({ investigation }: { investigation: any }) => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <ClipboardList className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{investigation.id}</h2>
              <p className="text-slate-600 dark:text-slate-400">{investigation.title}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedCase(null)}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Priority</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(investigation.priority)}`}>
              {investigation.priority}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Status</p>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(investigation.status)}`}>
              {investigation.status}
            </span>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Lead Investigator</p>
            <p className="font-medium text-slate-900 dark:text-white">{investigation.leadInvestigator}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Related Incident</p>
            <p className="font-medium text-slate-900 dark:text-white">{investigation.incidentId}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Created</p>
            <p className="font-medium text-slate-900 dark:text-white">{investigation.createdAt}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Target Date</p>
            <p className="font-medium text-slate-900 dark:text-white">{investigation.targetDate}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Description</p>
          <p className="text-slate-900 dark:text-white">{investigation.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Witnesses</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{investigation.witnesses}</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-4 h-4 text-slate-500" />
              <p className="text-sm text-slate-600 dark:text-slate-400">Evidence Items</p>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{investigation.evidenceItems}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            <Edit className="w-4 h-4" />
            Update Status
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            <Users className="w-4 h-4" />
            Add Witness
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            <Camera className="w-4 h-4" />
            Add Evidence
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Case Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Case Timeline
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-600"></div>
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-slate-900 dark:text-white">Case Opened</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{investigation.createdAt} - Initial case registration</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-600"></div>
            </div>
            <div className="flex-1 pb-4">
              <p className="font-medium text-slate-900 dark:text-white">Evidence Collection Started</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{investigation.createdAt} - Collecting CCTV footage and witness statements</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <p className="font-medium text-slate-900 dark:text-white">Current Status: {investigation.status}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Investigation in progress</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Investigations</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage investigation cases and findings</p>
        </div>
        <button 
          onClick={() => setShowNewCase(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {showNewCase && <NewCaseForm />}

      {selectedCase ? (
        <CaseDetail investigation={selectedCase} />
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search investigations..."
                  className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Status</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-slate-400" />
                <select 
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Cases List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Case</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Incident</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Lead Investigator</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Target Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Evidence</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredCases.map((investigation) => (
                    <tr key={investigation.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                            <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{investigation.id}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate">{investigation.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{investigation.incidentId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{investigation.leadInvestigator}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(investigation.priority)}`}>
                          {investigation.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(investigation.status)}`}>
                          {investigation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{investigation.targetDate}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white">{investigation.evidenceItems} items</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedCase(investigation)}
                            className="p-1 text-slate-400 hover:text-indigo-600 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-indigo-600 transition">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-slate-400 hover:text-red-600 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Investigations;