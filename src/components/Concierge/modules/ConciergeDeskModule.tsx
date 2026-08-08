/**
 * Concierge Desk Module
 * Daily operations for guest assistance and local information
 */

import { useState, useEffect } from 'react';
import { MapPin, Phone, Info, Plus, Search, RefreshCw, Clock, CheckCircle2 } from 'lucide-react';

interface ConciergeDeskModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
  onCreateRequest?: (requestId: string) => void;
}

interface QuickRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  requestType: string;
  priority: string;
  status: string;
  submittedAt: string;
}

const ConciergeDeskModule: React.FC<ConciergeDeskModuleProps> = ({ onViewGuestProfile, onCreateRequest }) => {
  const [quickRequests, setQuickRequests] = useState<QuickRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    guestName: '',
    roomNumber: '',
    requestType: 'Information Request',
    priority: 'Normal',
    description: ''
  });

  // Fetch recent concierge requests
  const fetchQuickRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/concierge/requests?department=Concierge&limit=10');
      if (response.ok) {
        const data = await response.json();
        setQuickRequests(data);
      }
    } catch (error) {
      console.error('Error fetching quick requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuickRequests();
  }, []);

  // Create new quick request
  const handleCreateRequest = async () => {
    try {
      const response = await fetch('/api/concierge/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: newRequest.guestName,
          room_number: newRequest.roomNumber,
          request_type: newRequest.requestType,
          description: newRequest.description,
          priority: newRequest.priority,
          assigned_department: 'Concierge'
        })
      });

      if (response.ok) {
        setShowNewRequestForm(false);
        setNewRequest({
          guestName: '',
          roomNumber: '',
          requestType: 'Information Request',
          priority: 'Normal',
          description: ''
        });
        fetchQuickRequests();
      }
    } catch (error) {
      console.error('Error creating request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Open': 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
      'Assigned': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'In Progress': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400'
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Concierge Desk</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daily operations and guest assistance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchQuickRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => setShowNewRequestForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            New Request
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickActionCard
          icon={<MapPin size={24} className="text-indigo-600" />}
          title="Local Information"
          description="Provide local directions and information"
          onClick={() => setNewRequest({ ...newRequest, requestType: 'Information Request' })}
        />
        <QuickActionCard
          icon={<Phone size={24} className="text-emerald-600" />}
          title="Restaurant Booking"
          description="Book restaurant reservations for guests"
          onClick={() => setNewRequest({ ...newRequest, requestType: 'Restaurant Booking' })}
        />
        <QuickActionCard
          icon={<Info size={24} className="text-amber-600" />}
          title="Transportation"
          description="Arrange transportation and transfers"
          onClick={() => setNewRequest({ ...newRequest, requestType: 'Transportation' })}
        />
      </div>

      {/* New Request Form */}
      {showNewRequestForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create New Request</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Guest Name</label>
              <input
                type="text"
                value={newRequest.guestName}
                onChange={(e) => setNewRequest({ ...newRequest, guestName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter guest name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
              <input
                type="text"
                value={newRequest.roomNumber}
                onChange={(e) => setNewRequest({ ...newRequest, roomNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter room number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Request Type</label>
              <select
                value={newRequest.requestType}
                onChange={(e) => setNewRequest({ ...newRequest, requestType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Information Request">Information Request</option>
                <option value="Transportation">Transportation</option>
                <option value="Restaurant Booking">Restaurant Booking</option>
                <option value="Tour Booking">Tour Booking</option>
                <option value="Shopping Assistance">Shopping Assistance</option>
                <option value="Medical Assistance">Medical Assistance</option>
                <option value="Business Services">Business Services</option>
                <option value="Special Celebration">Special Celebration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={newRequest.priority}
                onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Normal">Normal</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
              <textarea
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                rows={3}
                placeholder="Enter request details"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowNewRequestForm(false)}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRequest}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Create Request
            </button>
          </div>
        </div>
      )}

      {/* Recent Requests */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Requests</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Loading requests...
          </div>
        ) : quickRequests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No recent requests
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {quickRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
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
                    {new Date(request.submittedAt).toLocaleTimeString()}
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

interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition text-left"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

export default ConciergeDeskModule;