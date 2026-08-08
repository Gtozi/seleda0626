/**
 * Manager Approval Center
 * Centralized approval inbox for all departmental approvals
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Bed,
  Utensils,
  Wrench,
  ShoppingCart,
  FileText,
  Users,
  Shield,
  Filter,
  Search,
  ChevronRight,
  Eye,
  MoreVertical,
  CheckSquare,
  X,
  Calendar,
  CreditCard,
  Briefcase,
  Building2,
  Award,
  Tag
} from 'lucide-react';

interface ApprovalRequest {
  id: string;
  type: string;
  category: string;
  department: string;
  title: string;
  description: string;
  amount?: number;
  requestedBy: string;
  requestedAt: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  details?: Record<string, any>;
}

const ManagerApprovalCenter: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'escalated'>('pending');
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'FrontOffice' | 'Housekeeping' | 'FandB' | 'Procurement' | 'Engineering' | 'Finance' | 'HR' | 'Security'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);

  const departments = [
    { id: 'FrontOffice', name: 'Front Office', icon: Users },
    { id: 'Housekeeping', name: 'Housekeeping', icon: Bed },
    { id: 'FandB', name: 'Food & Beverage', icon: Utensils },
    { id: 'Procurement', name: 'Procurement', icon: ShoppingCart },
    { id: 'Engineering', name: 'Engineering', icon: Wrench },
    { id: 'Finance', name: 'Finance', icon: DollarSign },
    { id: 'HR', name: 'Human Resources', icon: Briefcase },
    { id: 'Security', name: 'Security', icon: Shield }
  ];

  const mockRequests: ApprovalRequest[] = [
    {
      id: '1',
      type: 'Rate Override',
      category: 'Front Office',
      department: 'FrontOffice',
      title: 'Room Rate Override - Room 305',
      description: 'Guest requesting 15% discount due to extended stay commitment',
      amount: 42.50,
      requestedBy: 'John Smith',
      requestedAt: '2 hours ago',
      urgency: 'medium',
      status: 'pending',
      details: {
        roomNumber: '305',
        guestName: 'Mr. Johnson',
        originalRate: 285,
        requestedRate: 242.50,
        reason: 'Extended stay - 7 nights'
      }
    },
    {
      id: '2',
      type: 'Complimentary Stay',
      category: 'Front Office',
      department: 'FrontOffice',
      title: 'Complimentary Night - VIP Guest',
      description: 'Request for complimentary night for VIP guest due to service recovery',
      amount: 285,
      requestedBy: 'Sarah Johnson',
      requestedAt: '3 hours ago',
      urgency: 'high',
      status: 'pending',
      details: {
        guestName: 'Dr. Michael Chen',
        roomNumber: 'Presidential Suite',
        reason: 'Service recovery for HVAC issue',
        nights: 1
      }
    },
    {
      id: '3',
      type: 'Emergency Purchase',
      category: 'Procurement',
      department: 'Procurement',
      title: 'Emergency HVAC Parts',
      description: 'Urgent purchase of HVAC replacement parts for Floor 3 repair',
      amount: 2500,
      requestedBy: 'Mike Wilson',
      requestedAt: '1 hour ago',
      urgency: 'critical',
      status: 'pending',
      details: {
        items: 'Compressor unit, control board, refrigerant',
        vendor: 'Climate Control Solutions',
        reason: 'Critical system failure affecting 12 rooms'
      }
    },
    {
      id: '4',
      type: 'Overtime Approval',
      category: 'Human Resources',
      department: 'HR',
      title: 'Housekeeping Overtime - Weekend',
      description: 'Request for overtime approval for housekeeping staff due to high occupancy',
      amount: 1200,
      requestedBy: 'Emily Brown',
      requestedAt: '4 hours ago',
      urgency: 'medium',
      status: 'pending',
      details: {
        staffCount: 5,
        hours: 8,
        reason: '82% occupancy, VIP arrivals'
      }
    },
    {
      id: '5',
      type: 'Refund Approval',
      category: 'Finance',
      department: 'Finance',
      title: 'Guest Refund - Room 402',
      description: 'Partial refund requested due to noise disturbance from construction',
      amount: 150,
      requestedBy: 'David Lee',
      requestedAt: '5 hours ago',
      urgency: 'low',
      status: 'pending',
      details: {
        guestName: 'Ms. Garcia',
        roomNumber: '402',
        reason: 'Noise disturbance from construction work',
        refundPercentage: 50
      }
    },
    {
      id: '6',
      type: 'Capital Repair',
      category: 'Engineering',
      department: 'Engineering',
      title: 'Elevator Modernization - North Wing',
      description: 'Capital expenditure approval for elevator system upgrade',
      amount: 45000,
      requestedBy: 'Robert Taylor',
      requestedAt: '1 day ago',
      urgency: 'low',
      status: 'escalated',
      details: {
        elevatorCount: 2,
        estimatedDuration: '4 weeks',
        vendor: 'Elevator Technologies Inc',
        justification: 'Equipment end-of-life, safety compliance'
      }
    }
  ];

  useEffect(() => {
    setRequests(mockRequests);
  }, []);

  const filteredRequests = requests.filter(request => {
    const matchesFilter = selectedFilter === 'all' || request.status === selectedFilter;
    const matchesDepartment = selectedDepartment === 'all' || request.department === selectedDepartment;
    const matchesSearch = searchQuery === '' || 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesDepartment && matchesSearch;
  });

  const handleApprove = (requestId: string) => {
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'approved' as const } : req
    ));
    setSelectedRequest(null);
  };

  const handleReject = (requestId: string) => {
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    ));
    setSelectedRequest(null);
  };

  const handleEscalate = (requestId: string) => {
    setRequests(prev => prev.map(req =>
      req.id === requestId ? { ...req, status: 'escalated' as const } : req
    ));
    setSelectedRequest(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'rejected':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'escalated':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'pending':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return 'bg-rose-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-amber-500 text-white';
      case 'low':
        return 'bg-slate-500 text-white';
    }
  };

  const getDepartmentIcon = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    return dept ? dept.icon : FileText;
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const criticalCount = requests.filter(r => r.urgency === 'critical' && r.status === 'pending').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CheckCircle2 size={28} />
            Manager Approval Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Centralized approval inbox for all departmental requests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {pendingCount} pending
            </span>
          </div>
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-medium text-rose-700 dark:text-rose-400">
                {criticalCount} critical
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search approvals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="escalated">Escalated</option>
        </select>
        
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Departments</option>
          {departments.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
      </div>

      {/* Approval Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <FileText size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No approval requests match your filters</p>
            </div>
          ) : (
            filteredRequests.map((request) => {
              const DeptIcon = getDepartmentIcon(request.department);
              return (
                <div
                  key={request.id}
                  onClick={() => setSelectedRequest(request)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedRequest?.id === request.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getUrgencyColor(request.urgency)}`}>
                      <DeptIcon size={18} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-xs font-mono uppercase text-slate-500 font-bold">
                            {request.category}
                          </span>
                          <h4 className="font-semibold text-slate-900 dark:text-white mt-1">
                            {request.title}
                          </h4>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                        {request.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-500">
                        <span>{request.requestedBy}</span>
                        <span>•</span>
                        <span>{request.requestedAt}</span>
                        {request.amount && (
                          <>
                            <span>•</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                              ${request.amount.toLocaleString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Request Details */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-6">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Request Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-500 font-bold">
                    {selectedRequest.category}
                  </span>
                  <h4 className="font-semibold text-slate-900 dark:text-white mt-1">
                    {selectedRequest.title}
                  </h4>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <span className={`px-2 py-0.5 rounded border text-xs ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Urgency</span>
                    <span className={`px-2 py-0.5 rounded text-xs text-white ${getUrgencyColor(selectedRequest.urgency)}`}>
                      {selectedRequest.urgency}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Requested by</span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {selectedRequest.requestedBy}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Requested at</span>
                    <span className="text-slate-900 dark:text-white">
                      {selectedRequest.requestedAt}
                    </span>
                  </div>
                  {selectedRequest.amount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Amount</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${selectedRequest.amount.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {selectedRequest.description}
                  </p>
                </div>

                {selectedRequest.details && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                      Additional Details
                    </h5>
                    {Object.entries(selectedRequest.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => handleApprove(selectedRequest.id)}
                      className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={18} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest.id)}
                      className="w-full py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <XCircle size={18} />
                      Reject
                    </button>
                    <button
                      onClick={() => handleEscalate(selectedRequest.id)}
                      className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertTriangle size={18} />
                      Escalate
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center sticky top-6">
              <FileText size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Select an approval request to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManagerApprovalCenter;