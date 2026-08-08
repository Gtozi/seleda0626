/**
 * Front Office Guest Requests Module
 * Service request tracking, assignment, and fulfillment
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import {
  Bell,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Home,
  Edit,
  Save,
  X,
  ChevronDown,
  MessageSquare,
  Calendar,
  MapPin,
  Phone,
  Star,
  TrendingUp
} from 'lucide-react';
import StatCard from '../StatCard';

type RequestStatus = 'Open' | 'pending' | 'assigned' | 'In Progress' | 'in_progress' | 'Completed' | 'completed' | 'cancelled';
type RequestPriority = 'Normal' | 'low' | 'medium' | 'High' | 'high' | 'urgent';
type RequestCategory = 'Housekeeping' | 'housekeeping' | 'Maintenance' | 'maintenance' | 'Room Service' | 'room_service' | 'Concierge' | 'concierge' | 'Transport' | 'transport' | 'front_desk' | 'other';

interface GuestRequest {
  id: string;
  request_number?: string;
  guest_name: string;
  room_number?: string;
  reservation_id?: string;
  request_type: string;
  description: string;
  priority: string;
  status: string;
  submitted_at: string;
  acknowledged_at?: string;
  completed_at?: string;
  assigned_to?: string;
  assigned_department?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: string;
  available: boolean;
  activeRequests: number;
}

interface RequestStats {
  pending: number;
  inProgress: number;
  completedToday: number;
  avgResponseTime: string;
  totalToday: number;
  avgResolutionTime: string;
  satisfactionRate: string;
  topCategory: string;
  topCategoryPercent: string;
}

const GuestRequests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'overview' | 'new' | 'assigned' | 'history' | 'analytics') || 'overview';
  const setActiveTab = (tab: 'overview' | 'new' | 'assigned' | 'history' | 'analytics') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<GuestRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newRequestForm, setNewRequestForm] = useState({
    guestName: '',
    roomNumber: '',
    reservationId: '',
    category: 'Housekeeping' as RequestCategory,
    priority: 'Normal' as RequestPriority,
    description: '',
    estimatedCompletion: '',
    notes: ''
  });

  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [stats, setStats] = useState<RequestStats>({
    pending: 0,
    inProgress: 0,
    completedToday: 0,
    avgResponseTime: '0 min',
    totalToday: 0,
    avgResolutionTime: '0 min',
    satisfactionRate: '0/5',
    topCategory: 'None',
    topCategoryPercent: '0%'
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchRequests();
    fetchStaff();
    fetchStats();
  }, []);

  // Refresh data when search query changes
  useEffect(() => {
    if (searchQuery) {
      fetchRequests(searchQuery);
    } else {
      fetchRequests();
    }
  }, [searchQuery]);

  // Real-time subscription to guest_requests changes
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('guest_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'guest_requests'
        },
        (payload) => {
          console.log('Real-time change received:', payload);
          // Refresh data when any change occurs
          fetchRequests(searchQuery);
          fetchStats();
          fetchStaff();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery]);

  const fetchRequests = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/front-office/guest-requests';
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/front-office/guest-requests/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaff(data.staff || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/front-office/guest-requests/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRefresh = () => {
    fetchRequests(searchQuery);
    fetchStaff();
    fetchStats();
  };

  const handleUpdateRequest = async (id: string, updates: any) => {
    try {
      const response = await fetch(`/api/front-office/guest-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update request');

      setSelectedRequest(null);
      fetchRequests(searchQuery);
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request');
      console.error('Error updating request:', err);
    }
  };

  const handleAssignStaff = async (requestId: string, staffName: string, department: string) => {
    await handleUpdateRequest(requestId, {
      status: 'In Progress',
      assignedTo: staffName,
      assignedDepartment: department,
    });
  };

  const handleCompleteRequest = async (requestId: string, rating?: number, feedback?: string) => {
    await handleUpdateRequest(requestId, {
      status: 'Completed',
      rating,
      feedback,
    });
  };

  const filteredRequests = requests; // Search is now handled by the API

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase().replace(' ', '_');
    const config: Record<string, { bg: string; text: string; label: string }> = {
      open: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Open' },
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      assigned: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Assigned' },
      in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Cancelled' },
    };
    const c = config[normalizedStatus] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const normalizedPriority = priority.toLowerCase();
    const config: Record<string, { bg: string; text: string; label: string }> = {
      normal: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Normal' },
      low: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Low' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium' },
      high: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'High' },
      urgent: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Urgent' },
    };
    const c = config[normalizedPriority] || { bg: 'bg-slate-100', text: 'text-slate-700', label: priority };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getCategoryIcon = (category: string) => {
    const normalizedCategory = category.toLowerCase().replace(' ', '_');
    switch (normalizedCategory) {
      case 'housekeeping': return <MessageSquare size={16} />;
      case 'maintenance': return <AlertTriangle size={16} />;
      case 'room_service': return <Star size={16} />;
      case 'concierge': return <User size={16} />;
      case 'transport': return <Home size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const handleNewRequest = async () => {
    try {
      const response = await fetch('/api/front-office/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: newRequestForm.guestName,
          roomNumber: newRequestForm.roomNumber,
          reservationId: newRequestForm.reservationId,
          requestType: newRequestForm.category,
          description: newRequestForm.description,
          priority: newRequestForm.priority,
          notes: newRequestForm.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to create request');

      setShowNewRequestModal(false);
      setNewRequestForm({
        guestName: '',
        roomNumber: '',
        reservationId: '',
        category: 'Housekeeping',
        priority: 'Normal',
        description: '',
        estimatedCompletion: '',
        notes: ''
      });
      
      // Refresh data
      fetchRequests();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
      console.error('Error creating request:', err);
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        activeTab === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in" id="guest-requests">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Guest Requests</h2>
          <p className="text-sm text-slate-500 mt-1">Service request tracking, assignment, and fulfillment</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Request
          </button>
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending" value={stats.pending.toString()} icon={Clock} variant="alert" />
        <StatCard label="In Progress" value={stats.inProgress.toString()} icon={TrendingUp} variant="primary" />
        <StatCard label="Completed Today" value={stats.completedToday.toString()} icon={CheckCircle2} variant="rooms" />
        <StatCard label="Avg Response" value={stats.avgResponseTime} icon={Bell} variant="primary" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" label="Overview" icon={Home} />
        <TabButton id="new" label="New Request" icon={Plus} />
        <TabButton id="assigned" label="Assigned" icon={User} />
        <TabButton id="history" label="History" icon={Calendar} />
        <TabButton id="analytics" label="Analytics" icon={TrendingUp} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'overview' || activeTab === 'assigned' || activeTab === 'history') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search guest, room, request..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 cursor-pointer">
            <Filter size={16} />
            Filter
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Active Requests</h3>
            <span className="text-xs text-slate-500">
              {filteredRequests.filter(r => {
                const status = r.status.toLowerCase();
                return status !== 'completed' && status !== 'cancelled';
              }).length} active
            </span>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading requests...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Guest</th>
                    <th className="px-4 py-3 text-left font-semibold">Room</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Priority</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Assigned To</th>
                    <th className="px-4 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.filter(r => {
                    const status = r.status.toLowerCase();
                    return status !== 'completed' && status !== 'cancelled';
                  }).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-600">{req.request_number || req.id.substring(0, 8)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{req.guest_name}</div>
                        <div className="text-xs text-slate-500">{req.reservation_id || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{req.room_number || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-slate-600">
                          {getCategoryIcon(req.request_type)}
                          <span className="capitalize">{req.request_type.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{req.description}</td>
                      <td className="px-4 py-3">{getPriorityBadge(req.priority)}</td>
                      <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                      <td className="px-4 py-3 text-slate-600">{req.assigned_to || '-'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            title="View details"
                          >
                            <Edit size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.filter(r => {
                    const status = r.status.toLowerCase();
                    return status !== 'completed' && status !== 'cancelled';
                  }).length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        No active requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* New Request Tab */}
      {activeTab === 'new' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Create New Request</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Guest Name</label>
              <input
                type="text"
                value={newRequestForm.guestName}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, guestName: e.target.value })}
                placeholder="Search or enter guest name"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
              <input
                type="text"
                value={newRequestForm.roomNumber}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, roomNumber: e.target.value })}
                placeholder="Room number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reservation ID</label>
              <input
                type="text"
                value={newRequestForm.reservationId}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, reservationId: e.target.value })}
                placeholder="RES-XXX"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select
                value={newRequestForm.category}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, category: e.target.value as RequestCategory })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Housekeeping">Housekeeping</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Room Service">Room Service</option>
                <option value="Concierge">Concierge</option>
                <option value="Transport">Transportation</option>
                <option value="Front Desk">Front Desk</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                value={newRequestForm.priority}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, priority: e.target.value as RequestPriority })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Estimated Completion</label>
              <input
                type="datetime-local"
                value={newRequestForm.estimatedCompletion}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, estimatedCompletion: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                value={newRequestForm.description}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, description: e.target.value })}
                rows={3}
                placeholder="Describe the request..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                value={newRequestForm.notes}
                onChange={(e) => setNewRequestForm({ ...newRequestForm, notes: e.target.value })}
                rows={2}
                placeholder="Additional notes..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => {
                setNewRequestForm({ 
                  guestName: '', 
                  roomNumber: '', 
                  reservationId: '', 
                  category: 'Housekeeping', 
                  priority: 'Normal', 
                  description: '', 
                  estimatedCompletion: '', 
                  notes: '' 
                });
                setError(null);
              }}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleNewRequest}
              disabled={!newRequestForm.guestName || !newRequestForm.description}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              Create Request
            </button>
          </div>
        </div>
      )}

      {/* Assigned Tab */}
      {activeTab === 'assigned' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Staff Assignments</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading staff assignments...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Staff</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">Department</th>
                    <th className="px-4 py-3 text-left font-semibold">Availability</th>
                    <th className="px-4 py-3 text-right font-semibold">Active Requests</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staff.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900">{member.name}</td>
                      <td className="px-4 py-3 text-slate-600">{member.role}</td>
                      <td className="px-4 py-3 text-slate-600">{member.department}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${member.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                          {member.available ? 'Available' : 'Busy'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-900">{member.activeRequests}</td>
                    </tr>
                  ))}
                  {staff.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                        No staff members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Request History</h3>
          </div>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading history...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Guest</th>
                    <th className="px-4 py-3 text-left font-semibold">Room</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                    <th className="px-4 py-3 text-left font-semibold">Completed</th>
                    <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRequests.filter(r => {
                    const status = r.status.toLowerCase();
                    return status === 'completed' || status === 'cancelled';
                  }).map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-600">{req.request_number || req.id.substring(0, 8)}</td>
                      <td className="px-4 py-3 font-medium text-slate-900">{req.guest_name}</td>
                      <td className="px-4 py-3 text-slate-600">{req.room_number || '-'}</td>
                      <td className="px-4 py-3 text-slate-600 capitalize">{req.request_type.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{req.description}</td>
                      <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                      <td className="px-4 py-3 text-slate-600">{req.completed_at ? new Date(req.completed_at).toLocaleString() : '-'}</td>
                      <td className="px-4 py-3">
                        {req.rating ? (
                          <div className="flex items-center gap-1">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            <span className="text-slate-900">{req.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredRequests.filter(r => {
                    const status = r.status.toLowerCase();
                    return status === 'completed' || status === 'cancelled';
                  }).length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                        No completed requests found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Request Analytics</h3>
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading analytics...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Total Today</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalToday}</p>
                <p className="text-sm text-slate-500">Requests processed</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Response Time</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.avgResponseTime}</p>
                <p className="text-sm text-slate-500">From request to assignment</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.avgResolutionTime}</p>
                <p className="text-sm text-slate-500">From assignment to completion</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Satisfaction Rate</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.satisfactionRate}</p>
                <p className="text-sm text-slate-500">Average guest rating</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Top Category</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.topCategory}</p>
                <p className="text-sm text-slate-500">{stats.topCategoryPercent} of requests</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pending}</p>
                <p className="text-sm text-slate-500">Awaiting assignment</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">New Guest Request</h3>
              <button onClick={() => setShowNewRequestModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Use the New Request tab to enter full details.</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowNewRequestModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={() => { setShowNewRequestModal(false); setActiveTab('new'); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">Go to Form</button>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Request ID</p>
                  <p className="font-medium text-slate-900">{selectedRequest.request_number || selectedRequest.id.substring(0, 8)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Guest</p>
                  <p className="font-medium text-slate-900">{selectedRequest.guest_name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Room</p>
                  <p className="font-medium text-slate-900">{selectedRequest.room_number || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Category</p>
                  <p className="font-medium text-slate-900 capitalize">{selectedRequest.request_type.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Priority</p>
                  <div className="mt-1">{getPriorityBadge(selectedRequest.priority)}</div>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Description</p>
                  <p className="font-medium text-slate-900 mt-1">{selectedRequest.description}</p>
                </div>
                {selectedRequest.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Notes</p>
                    <p className="font-medium text-slate-900 mt-1">{selectedRequest.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Submitted</p>
                  <p className="font-medium text-slate-900">{new Date(selectedRequest.submitted_at).toLocaleString()}</p>
                </div>
                {selectedRequest.assigned_to && (
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Assigned To</p>
                    <p className="font-medium text-slate-900">{selectedRequest.assigned_to}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                {selectedRequest.status.toLowerCase() === 'open' || selectedRequest.status.toLowerCase() === 'pending' ? (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Assign Staff</p>
                    <div className="flex flex-wrap gap-2">
                      {staff.filter(s => s.available).map(member => (
                        <button
                          key={member.id}
                          onClick={() => handleAssignStaff(selectedRequest.id, member.name, member.department)}
                          className="px-3 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          {member.name} ({member.department})
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {(selectedRequest.status.toLowerCase() === 'in_progress' || selectedRequest.status.toLowerCase() === 'assigned') && (
                  <div>
                    <p className="text-sm font-medium text-slate-700 mb-2">Complete Request</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCompleteRequest(selectedRequest.id, 5)}
                        className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        ⭐ Excellent (5)
                      </button>
                      <button
                        onClick={() => handleCompleteRequest(selectedRequest.id, 4)}
                        className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        👍 Good (4)
                      </button>
                      <button
                        onClick={() => handleCompleteRequest(selectedRequest.id, 3)}
                        className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        OK (3)
                      </button>
                    </div>
                  </div>
                )}

                {selectedRequest.status.toLowerCase() !== 'completed' && selectedRequest.status.toLowerCase() !== 'cancelled' && (
                  <button
                    onClick={() => handleUpdateRequest(selectedRequest.id, { status: 'Cancelled' })}
                    className="w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100 transition-colors cursor-pointer"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestRequests;
