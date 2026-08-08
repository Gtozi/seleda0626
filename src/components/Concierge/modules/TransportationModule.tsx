/**
 * Transportation Coordination Module
 * Integrated with Transportation & Fleet Portal
 */

import { useState, useEffect } from 'react';
import { Car, Plus, RefreshCw, Plane, Clock, MapPin, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TransportationModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface ShuttleRequest {
  id: string;
  reservation_id?: string;
  guest_name: string;
  flight_number?: string;
  scheduled_time?: string;
  pickup_location?: string;
  dropoff_location?: string;
  quantity?: number;
  status: string;
  notes?: string;
  created_at: string;
}

const TransportationModule: React.FC<TransportationModuleProps> = ({ onViewGuestProfile }) => {
  const [shuttleRequests, setShuttleRequests] = useState<ShuttleRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    reservation_id: '',
    guest_name: '',
    flight_number: '',
    scheduled_time: '',
    pickup_location: '',
    dropoff_location: '',
    quantity: 1,
    notes: ''
  });

  // Fetch shuttle requests
  const fetchShuttleRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/concierge/transportation/shuttle-requests?${params}`);
      if (response.ok) {
        const data = await response.json();
        setShuttleRequests(data);
      }
    } catch (error) {
      console.error('Error fetching shuttle requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShuttleRequests();
  }, [filterStatus]);

  // Create new shuttle request
  const handleCreateRequest = async () => {
    try {
      const response = await fetch('/api/concierge/transportation/shuttle-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewRequest({
          reservation_id: '',
          guest_name: '',
          flight_number: '',
          scheduled_time: '',
          pickup_location: '',
          dropoff_location: '',
          quantity: 1,
          notes: ''
        });
        fetchShuttleRequests();
      }
    } catch (error) {
      console.error('Error creating shuttle request:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      'Confirmed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'In Progress': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
      'Completed': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Cancelled': 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
    };
    return colors[status] || colors['Pending'];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock size={16} className="text-amber-600" />;
      case 'Confirmed':
        return <CheckCircle2 size={16} className="text-blue-600" />;
      case 'In Progress':
        return <Car size={16} className="text-purple-600" />;
      case 'Completed':
        return <CheckCircle2 size={16} className="text-emerald-600" />;
      case 'Cancelled':
        return <AlertTriangle size={16} className="text-rose-600" />;
      default:
        return <Clock size={16} className="text-slate-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transportation Coordination</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Airport transfers and transportation arrangements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchShuttleRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            New Transfer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</label>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Add Transfer Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Schedule Airport Transfer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Guest Name *</label>
              <input
                type="text"
                value={newRequest.guest_name}
                onChange={(e) => setNewRequest({ ...newRequest, guest_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter guest name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Flight Number</label>
              <input
                type="text"
                value={newRequest.flight_number}
                onChange={(e) => setNewRequest({ ...newRequest, flight_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter flight number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Scheduled Time *</label>
              <input
                type="datetime-local"
                value={newRequest.scheduled_time}
                onChange={(e) => setNewRequest({ ...newRequest, scheduled_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Passengers</label>
              <input
                type="number"
                min="1"
                value={newRequest.quantity}
                onChange={(e) => setNewRequest({ ...newRequest, quantity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pickup Location *</label>
              <input
                type="text"
                value={newRequest.pickup_location}
                onChange={(e) => setNewRequest({ ...newRequest, pickup_location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Airport or hotel address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dropoff Location *</label>
              <input
                type="text"
                value={newRequest.dropoff_location}
                onChange={(e) => setNewRequest({ ...newRequest, dropoff_location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Hotel or destination address"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
              <textarea
                value={newRequest.notes}
                onChange={(e) => setNewRequest({ ...newRequest, notes: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                rows={2}
                placeholder="Additional notes or special requirements"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateRequest}
              disabled={!newRequest.guest_name || !newRequest.scheduled_time || !newRequest.pickup_location || !newRequest.dropoff_location}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Schedule Transfer
            </button>
          </div>
        </div>
      )}

      {/* Shuttle Requests List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Loading shuttle requests...
          </div>
        ) : shuttleRequests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No shuttle requests found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Flight</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Scheduled</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Route</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Passengers</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {shuttleRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Car size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">{request.guest_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {request.flight_number ? (
                      <div className="flex items-center gap-2">
                        <Plane size={14} className="text-slate-500" />
                        <span className="text-sm text-slate-700 dark:text-slate-300">{request.flight_number}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-500" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {request.scheduled_time ? new Date(request.scheduled_time).toLocaleString() : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-500" />
                        <span className="truncate max-w-xs">{request.pickup_location}</span>
                      </div>
                      <div className="text-slate-500 text-xs">↓</div>
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-500" />
                        <span className="truncate max-w-xs">{request.dropoff_location}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {request.quantity || 1}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
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

export default TransportationModule;