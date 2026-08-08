/**
 * Guest Requests Module
 * Manage and track guest service requests
 */

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Clock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface GuestRequestsModuleProps {
  selectedRequestId?: string;
  onClearSelectedRequestId?: () => void;
  onViewGuestProfile?: (guestId: string) => void;
}

type RequestStatus = 'Requested' | 'Assigned' | 'In Progress' | 'Waiting' | 'Completed' | 'Cancelled';
type RequestCategory = 'Information Request' | 'Transportation' | 'Restaurant Booking' | 'Tour Booking' | 'Ticket Purchase' | 'Shopping Assistance' | 'Medical Assistance' | 'Childcare' | 'Business Services' | 'Courier Services' | 'Special Celebration' | 'Lost Property Assistance';

interface GuestRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  requestType: string;
  description: string;
  status: string;
  priority: string;
  submittedAt: string;
  assignedTo?: string;
  assignedDepartment?: string;
  requestNumber?: string;
}

const GuestRequestsModule: React.FC<GuestRequestsModuleProps> = ({
  selectedRequestId,
  onClearSelectedRequestId,
  onViewGuestProfile
}) => {
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  // Fetch requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterPriority) params.append('priority', filterPriority);
      params.append('department', 'Concierge');
      
      const response = await fetch(`/api/concierge/requests?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterPriority]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
      'Assigned': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Cancelled': 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
    };
    return colors[status] || colors['Open'];
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'Urgent': 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400',
      'High': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      'Normal': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'Low': 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400'
    };
    return colors[priority] || colors['Normal'];
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Requests</h1>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            >
              <option value="">All Priority</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Normal">Normal</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Loading requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No requests found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Request #</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                    {request.requestNumber || request.id.substring(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {request.guestName}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {request.roomNumber || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {request.requestType}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(request.submittedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GuestRequestsModule;