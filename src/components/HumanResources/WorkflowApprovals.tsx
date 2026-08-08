import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Users, 
  DollarSign, 
  Briefcase, 
  TrendingUp, 
  Calendar,
  CreditCard,
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  AlertCircle,
  FileText,
  Plus
} from 'lucide-react';

const WorkflowApprovals = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'history'>('pending');

  const pendingApprovals = [
    { 
      id: 'APR-001', 
      type: 'Leave Request',
      category: 'Leave',
      employee: 'John Doe',
      department: 'Front Office',
      details: 'Annual Leave: Jun 05 - Jun 12 (7 days)',
      submittedDate: '2024-06-01',
      priority: 'Normal',
      currentApprover: 'Sarah Johnson',
      workflowStage: 'Manager Approval'
    },
    { 
      id: 'APR-002', 
      type: 'Overtime Request',
      category: 'Time',
      employee: 'Elena Smith',
      department: 'F&B',
      details: 'Weekend Work: 8 hours on Jun 08',
      submittedDate: '2024-06-02',
      priority: 'High',
      currentApprover: 'Robert Wilson',
      workflowStage: 'Department Head'
    },
    { 
      id: 'APR-003', 
      type: 'Expense Claim',
      category: 'Finance',
      employee: 'Carlos Ray',
      department: 'Engineering',
      details: 'Travel Expense: $150 for client meeting',
      submittedDate: '2024-06-03',
      priority: 'Normal',
      currentApprover: 'Finance Manager',
      workflowStage: 'Finance Review'
    },
    { 
      id: 'APR-004', 
      type: 'Salary Change',
      category: 'Compensation',
      employee: 'Maria Garcia',
      department: 'Housekeeping',
      details: 'Promotion: Room Attendant to Supervisor (+15%)',
      submittedDate: '2024-06-04',
      priority: 'High',
      currentApprover: 'HR Director',
      workflowStage: 'HR Review'
    },
    { 
      id: 'APR-005', 
      type: 'Recruitment Request',
      category: 'Recruitment',
      employee: 'Sarah Johnson',
      department: 'Front Office',
      details: 'New Position: Senior Receptionist',
      submittedDate: '2024-06-05',
      priority: 'Normal',
      currentApprover: 'General Manager',
      workflowStage: 'Executive Approval'
    },
  ];

  const approvedRequests = [
    { 
      id: 'APR-006', 
      type: 'Leave Request',
      category: 'Leave',
      employee: 'James Wilson',
      department: 'F&B',
      details: 'Sick Leave: May 30 (1 day)',
      submittedDate: '2024-05-29',
      approvedDate: '2024-05-30',
      approvedBy: 'Sarah Johnson',
      comments: 'Medical certificate provided'
    },
    { 
      id: 'APR-007', 
      type: 'Training Request',
      category: 'Learning',
      employee: 'Lisa Anderson',
      department: 'Front Office',
      details: 'Leadership Excellence Course',
      submittedDate: '2024-05-25',
      approvedDate: '2024-05-28',
      approvedBy: 'HR Director',
      comments: 'Approved within training budget'
    },
  ];

  const rejectedRequests = [
    { 
      id: 'APR-008', 
      type: 'Overtime Request',
      category: 'Time',
      employee: 'Michael Chen',
      department: 'Engineering',
      details: 'Weekend Work: 12 hours on May 20',
      submittedDate: '2024-05-18',
      rejectedDate: '2024-05-19',
      rejectedBy: 'Robert Wilson',
      reason: 'Exceeds monthly overtime budget'
    },
    { 
      id: 'APR-009', 
      type: 'Expense Claim',
      category: 'Finance',
      employee: 'Anna Kim',
      department: 'Housekeeping',
      details: 'Personal Equipment: $200',
      submittedDate: '2024-05-15',
      rejectedDate: '2024-05-16',
      rejectedBy: 'Finance Manager',
      reason: 'Not eligible for reimbursement'
    },
  ];

  const workflowTemplates = [
    { 
      id: 'WF-001', 
      name: 'Leave Approval Workflow',
      description: '3-stage approval: Manager → HR → Payroll',
      stages: ['Manager Approval', 'HR Review', 'Payroll Notification'],
      averageDuration: '2 days',
      isActive: true
    },
    { 
      id: 'WF-002', 
      name: 'Recruitment Approval Workflow',
      description: '4-stage approval: Manager → HR → Finance → Executive',
      stages: ['Manager Request', 'HR Review', 'Budget Approval', 'Executive Approval'],
      averageDuration: '5 days',
      isActive: true
    },
    { 
      id: 'WF-003', 
      name: 'Salary Change Workflow',
      description: '3-stage approval: Manager → HR → Finance',
      stages: ['Manager Recommendation', 'HR Review', 'Finance Approval'],
      averageDuration: '7 days',
      isActive: true
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Leave': return Calendar;
      case 'Time': return Clock;
      case 'Finance': return DollarSign;
      case 'Compensation': return TrendingUp;
      case 'Recruitment': return Briefcase;
      case 'Learning': return FileText;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Leave': return 'text-indigo-500';
      case 'Time': return 'text-amber-500';
      case 'Finance': return 'text-emerald-500';
      case 'Compensation': return 'text-purple-500';
      case 'Recruitment': return 'text-blue-500';
      case 'Learning': return 'text-rose-500';
      default: return 'text-slate-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workflow & Approvals</h2>
          <p className="text-sm text-slate-500 mt-1">Manage approval workflows and track request status</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Approvals', value: '12', icon: Clock, color: 'text-amber-500' },
          { label: 'Approved Today', value: '8', icon: CheckCircle2, color: 'text-emerald-500' },
          { label: 'Rejected Today', value: '2', icon: AlertCircle, color: 'text-rose-500' },
          { label: 'Avg. Approval Time', value: '2.3d', icon: TrendingUp, color: 'text-indigo-500' },
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
          { id: 'pending', label: 'Pending', icon: Clock },
          { id: 'approved', label: 'Approved', icon: CheckCircle2 },
          { id: 'rejected', label: 'Rejected', icon: AlertCircle },
          { id: 'history', label: 'Workflows', icon: FileText },
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

      {/* Pending Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Pending Approvals</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search approvals..." 
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
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Details</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Submitted</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Priority</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Current Stage</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {pendingApprovals.map((approval) => {
                const CategoryIcon = getCategoryIcon(approval.category);
                return (
                  <tr key={approval.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getCategoryColor(approval.category)}`}>
                          <CategoryIcon size={16} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{approval.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white block">{approval.employee}</span>
                        <span className="text-xs font-medium text-slate-400">{approval.department}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{approval.details}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{approval.submittedDate}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        approval.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {approval.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-white block">{approval.workflowStage}</span>
                        <span className="text-xs font-medium text-slate-400">{approval.currentApprover}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button className="p-1.5 bg-emerald-500 text-white rounded-lg hover:shadow-md transition">
                          <CheckCircle2 size={14} />
                        </button>
                        <button className="p-1.5 bg-rose-500 text-white rounded-lg hover:shadow-md transition">
                          <AlertCircle size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                          <MoreVertical size={14} className="text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Approved Tab */}
      {activeTab === 'approved' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Approved Requests</h3>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Details</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Approved Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Approved By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Comments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {approvedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">{request.employee}</span>
                      <span className="text-xs font-medium text-slate-400">{request.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{request.details}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.approvedDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.approvedBy}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{request.comments}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejected Tab */}
      {activeTab === 'rejected' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rejected Requests</h3>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Details</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Rejected Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Rejected By</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {rejectedRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">{request.employee}</span>
                      <span className="text-xs font-medium text-slate-400">{request.department}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{request.details}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.rejectedDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.rejectedBy}</td>
                  <td className="px-6 py-4 text-xs font-bold text-rose-600 max-w-xs truncate">{request.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Workflows Tab */}
      {activeTab === 'history' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Templates</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Create Workflow
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {workflowTemplates.map((workflow) => (
              <div key={workflow.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                    workflow.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
                  }`}>
                    {workflow.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{workflow.name}</h4>
                <p className="text-xs font-medium text-slate-400 mb-3">{workflow.description}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Avg. Duration</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{workflow.averageDuration}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-400 mb-2">Workflow Stages</p>
                  <div className="flex flex-wrap gap-1">
                    {workflow.stages.map((stage, index) => (
                      <span key={index} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium uppercase">
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowApprovals;
