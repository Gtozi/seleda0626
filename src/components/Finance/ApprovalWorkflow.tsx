import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ApprovalRequest {
  id: string;
  type: 'journal' | 'vendor_invoice' | 'payment' | 'budget' | 'expense' | 'asset';
  title: string;
  description: string;
  amount?: number;
  requested_by: string;
  requested_by_name: string;
  current_level: number;
  total_levels: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_at: string;
  approvals: any[];
}

interface ApprovalLevel {
  id: string;
  name: string;
  level: number;
  requires_unanimous: boolean;
  approvers: string[];
  spending_limit?: number;
}

const ApprovalWorkflow = () => {
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'levels' | 'rules'>('pending');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    switch (activeTab) {
      case 'pending':
      case 'history':
        await fetchRequests();
        break;
      case 'levels':
        await fetchApprovalLevels();
        break;
    }
    setLoading(false);
  };

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('approval_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
  };

  const fetchApprovalLevels = async () => {
    const { data } = await supabase
      .from('approval_levels')
      .select('*')
      .order('level');
    setApprovalLevels(data || []);
  };

  const tabs = [
    { id: 'pending', label: 'Pending Approvals' },
    { id: 'history', label: 'Approval History' },
    { id: 'levels', label: 'Approval Levels' },
    { id: 'rules', label: 'Delegation Rules' },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Approval Workflow
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Multi-level authorization for journals, invoices, payments, and expenses
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
          {activeTab === 'pending' && <PendingApprovalsView requests={requests.filter(r => r.status === 'pending')} />}
          {activeTab === 'history' && <ApprovalHistoryView requests={requests} />}
          {activeTab === 'levels' && <ApprovalLevelsView levels={approvalLevels} />}
          {activeTab === 'rules' && <DelegationRulesView />}
        </>
      )}
    </div>
  );
};

const PendingApprovalsView = ({ requests }: { requests: ApprovalRequest[] }) => {
  const totalAmount = requests.reduce((sum, r) => sum + (r.amount || 0), 0);

  const typeIcons = {
    journal: '📒',
    vendor_invoice: '📄',
    payment: '💳',
    budget: '📊',
    expense: '💰',
    asset: '🏢',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Pending Requests</div>
          <div className="text-2xl font-bold text-yellow-600">
            {requests.length}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Amount</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            ${totalAmount.toLocaleString()}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Urgent</div>
          <div className="text-2xl font-bold text-red-600">
            {requests.filter(r => r.current_level === r.total_levels - 1).length}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Requested By</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Progress</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Created</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => {
              const progress = (request.current_level / request.total_levels) * 100;
              return (
                <tr key={request.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <td className="px-4 py-3 text-2xl">{typeIcons[request.type]}</td>
                  <td className="px-4 py-3 font-medium">{request.title}</td>
                  <td className="px-4 py-3">{request.requested_by_name}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {request.amount ? `$${request.amount.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 w-24">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {request.current_level}/{request.total_levels}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm">{new Date(request.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ApprovalHistoryView = ({ requests }: { requests: ApprovalRequest[] }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Title</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Requested By</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <tr key={request.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 capitalize">{request.type.replace('_', ' ')}</td>
                <td className="px-4 py-3 font-medium">{request.title}</td>
                <td className="px-4 py-3">{request.requested_by_name}</td>
                <td className="px-4 py-3 text-right">
                  {request.amount ? `$${request.amount.toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.status === 'approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{new Date(request.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ApprovalLevelsView = ({ levels }: { levels: ApprovalLevel[] }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Approval Levels
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            + Add Level
          </button>
        </div>
        <div className="space-y-4">
          {levels.map(level => (
            <div key={level.id} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-slate-900 dark:text-slate-100">
                    Level {level.level}: {level.name}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {level.approvers.length} approvers • {level.requires_unanimous ? 'Unanimous' : 'Majority'} required
                  </div>
                  {level.spending_limit && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Spending limit: ${level.spending_limit.toLocaleString()}
                    </div>
                  )}
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DelegationRulesView = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
          Delegation Rules
        </h3>
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">
          Configure approval delegation rules and temporary authorizations
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;
