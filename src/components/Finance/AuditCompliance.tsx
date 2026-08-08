import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address?: string;
}

interface ComplianceIssue {
  id: string;
  type: 'security' | 'performance' | 'data_quality' | 'regulatory';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediation_url?: string;
  status: 'open' | 'in_progress' | 'resolved';
  created_at: string;
  resolved_at?: string;
}

const AuditCompliance = () => {
  const [activeTab, setActiveTab] = useState<'audit_trail' | 'user_activity' | 'compliance' | 'sod' | 'journal_approval' | 'external_audit'>('audit_trail');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'audit_trail':
        await fetchAuditLogs();
        break;
      case 'compliance':
        await fetchComplianceIssues();
        break;
    }
    setLoading(false);
  };

  const fetchAuditLogs = async () => {
    const { data } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    setAuditLogs(data || []);
  };

  const fetchComplianceIssues = async () => {
    const { data } = await supabase
      .from('compliance_issues')
      .select('*')
      .order('created_at', { ascending: false });
    setComplianceIssues(data || []);
  };

  const tabs = [
    { id: 'audit_trail', label: 'Audit Trail' },
    { id: 'user_activity', label: 'User Activity' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'sod', label: 'Segregation of Duties' },
    { id: 'journal_approval', label: 'Journal Approval' },
    { id: 'external_audit', label: 'External Audit' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Audit & Compliance
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Audit trail, user activity logs, and compliance monitoring
        </p>
      </div>

      <div className="flex border-b border-slate-200 dark:border-slate-700 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {activeTab === 'audit_trail' && <AuditTrailView logs={auditLogs} />}
          {activeTab === 'user_activity' && <UserActivityView />}
          {activeTab === 'compliance' && <ComplianceView issues={complianceIssues} />}
          {activeTab === 'sod' && <SegregationOfDutiesView />}
          {activeTab === 'journal_approval' && <JournalApprovalView />}
          {activeTab === 'external_audit' && <ExternalAuditView />}
        </>
      )}
    </div>
  );
};

const AuditTrailView = ({ logs }: { logs: AuditLog[] }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.entity_type.toLowerCase() === filter;
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const entityTypes = [...new Set(logs.map(l => l.entity_type))];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100"
          >
            <option value="all">All Entities</option>
            {entityTypes.map(type => (
              <option key={type} value={type.toLowerCase()}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Entity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Details</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">IP Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 text-sm">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="px-4 py-3 font-medium">{log.user_name}</td>
                <td className="px-4 py-3">{log.action}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {log.entity_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                  {JSON.stringify(log.details)}
                </td>
                <td className="px-4 py-3 text-sm font-mono">{log.ip_address || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UserActivityView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          User Activity Logs
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Track user login sessions, page views, and system interactions
        </div>
      </div>
    </div>
  );
};

const ComplianceView = ({ issues }: { issues: ComplianceIssue[] }) => {
  const openIssues = issues.filter(i => i.status === 'open');
  const criticalIssues = issues.filter(i => i.severity === 'critical' && i.status !== 'resolved');

  const severityColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const statusColors = {
    open: 'bg-red-100 text-red-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Open Issues</div>
          <div className="text-2xl font-bold text-red-600">
            {openIssues.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Critical</div>
          <div className="text-2xl font-bold text-red-600">
            {criticalIssues.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">
            {issues.filter(i => i.status === 'in_progress').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Resolved</div>
          <div className="text-2xl font-bold text-green-600">
            {issues.filter(i => i.status === 'resolved').length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Severity</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(issue => (
              <tr key={issue.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {issue.type}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${severityColors[issue.severity]}`}>
                    {issue.severity}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{issue.title}</td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                  {issue.description}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[issue.status]}`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{new Date(issue.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SegregationOfDutiesView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Segregation of Duties
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure and monitor segregation of duties policies and conflicts
        </div>
      </div>
    </div>
  );
};

const JournalApprovalView = () => {
  const mockApprovals = [
    { id: 'JNL-2024-089', journalNumber: 'JNL-2024-089', amount: 15000, submittedBy: 'John Doe', submittedDate: '2024-06-10', approvedBy: 'Jane Smith', approvedDate: '2024-06-11', status: 'Approved' },
    { id: 'JNL-2024-088', journalNumber: 'JNL-2024-088', amount: 8500, submittedBy: 'Mike Johnson', submittedDate: '2024-06-09', approvedBy: 'Sarah Wilson', approvedDate: '2024-06-10', status: 'Approved' },
    { id: 'JNL-2024-087', journalNumber: 'JNL-2024-087', amount: 25000, submittedBy: 'Emily Brown', submittedDate: '2024-06-08', approvedBy: null, approvedDate: null, status: 'Pending' },
    { id: 'JNL-2024-086', journalNumber: 'JNL-2024-086', amount: 12000, submittedBy: 'David Lee', submittedDate: '2024-06-07', approvedBy: 'Lisa Chen', approvedDate: '2024-06-08', status: 'Approved' },
    { id: 'JNL-2024-085', journalNumber: 'JNL-2024-085', amount: 45000, submittedBy: 'Robert Taylor', submittedDate: '2024-06-06', approvedBy: null, approvedDate: null, status: 'Rejected' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending</div>
          <div className="text-2xl font-bold text-yellow-600">
            {mockApprovals.filter(a => a.status === 'Pending').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {mockApprovals.filter(a => a.status === 'Approved').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Rejected</div>
          <div className="text-2xl font-bold text-red-600">
            {mockApprovals.filter(a => a.status === 'Rejected').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-blue-600">
            ${mockApprovals.reduce((sum, a) => sum + a.amount, 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Journal #</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Submitted By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Submitted Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Approved By</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Approved Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockApprovals.map(approval => (
              <tr key={approval.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-blue-600">{approval.journalNumber}</td>
                <td className="px-4 py-3 font-medium">${approval.amount.toLocaleString()}</td>
                <td className="px-4 py-3">{approval.submittedBy}</td>
                <td className="px-4 py-3 text-sm">{approval.submittedDate}</td>
                <td className="px-4 py-3">{approval.approvedBy || '-'}</td>
                <td className="px-4 py-3 text-sm">{approval.approvedDate || '-'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    approval.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    approval.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {approval.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ExternalAuditView = () => {
  const mockAudits = [
    { id: 'EXT-2024-001', firm: 'KPMG Ethiopia', type: 'Annual Financial Audit', startDate: '2024-03-01', endDate: '2024-03-31', status: 'Completed', findings: 3, rating: 'Excellent' },
    { id: 'EXT-2024-002', firm: 'PwC Ethiopia', type: 'Tax Compliance Review', startDate: '2024-04-15', endDate: '2024-04-30', status: 'Completed', findings: 1, rating: 'Good' },
    { id: 'EXT-2024-003', firm: 'Deloitte Ethiopia', type: 'Internal Controls Assessment', startDate: '2024-06-01', endDate: '2024-06-15', status: 'In Progress', findings: 0, rating: '-' },
    { id: 'EXT-2023-004', firm: 'KPMG Ethiopia', type: 'Annual Financial Audit', startDate: '2023-03-01', endDate: '2023-03-31', status: 'Completed', findings: 5, rating: 'Good' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Audits</div>
          <div className="text-2xl font-bold text-blue-600">
            {mockAudits.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">In Progress</div>
          <div className="text-2xl font-bold text-yellow-600">
            {mockAudits.filter(a => a.status === 'In Progress').length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Open Findings</div>
          <div className="text-2xl font-bold text-red-600">
            {mockAudits.reduce((sum, a) => sum + a.findings, 0)}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Rating</div>
          <div className="text-2xl font-bold text-green-600">
            Excellent
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Audit ID</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Firm</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Start Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">End Date</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Findings</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockAudits.map(audit => (
              <tr key={audit.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium text-blue-600">{audit.id}</td>
                <td className="px-4 py-3 font-medium">{audit.firm}</td>
                <td className="px-4 py-3">{audit.type}</td>
                <td className="px-4 py-3 text-sm">{audit.startDate}</td>
                <td className="px-4 py-3 text-sm">{audit.endDate}</td>
                <td className="px-4 py-3 font-medium">{audit.findings}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    audit.rating === 'Excellent' ? 'bg-green-100 text-green-800' :
                    audit.rating === 'Good' ? 'bg-blue-100 text-blue-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {audit.rating}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    audit.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {audit.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditCompliance;
