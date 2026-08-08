/**
 * Restaurant Reservations Module
 * Manage reservations for hotel and partner restaurants
 */

import { useState, useEffect } from 'react';
import { Utensils, Plus, RefreshCw, Clock, Users } from 'lucide-react';

interface RestaurantReservationsModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface RestaurantRequest {
  id: string;
  guest_name: string;
  room_number: string;
  description: string;
  priority: string;
  status: string;
  submitted_at: string;
  assigned_to?: string;
}

const RestaurantReservationsModule: React.FC<RestaurantReservationsModuleProps> = ({ onViewGuestProfile }) => {
  const [requests, setRequests] = useState<RestaurantRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReservation, setNewReservation] = useState({
    guest_name: '',
    room_number: '',
    restaurant_name: '',
    date_time: '',
    party_size: 2,
    special_requests: ''
  });

  // Fetch restaurant reservation requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/concierge/requests?request_type=Restaurant Booking&department=Concierge');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching restaurant reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Create new restaurant reservation request
  const handleCreateReservation = async () => {
    try {
      const response = await fetch('/api/concierge/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: newReservation.guest_name,
          room_number: newReservation.room_number,
          request_type: 'Restaurant Booking',
          description: `Restaurant: ${newReservation.restaurant_name}, Date: ${newReservation.date_time}, Party Size: ${newReservation.party_size}, Special Requests: ${newReservation.special_requests}`,
          priority: 'Normal',
          assigned_department: 'Concierge'
        })
      });

      if (response.ok) {
        setShowAddForm(false);
        setNewReservation({
          guest_name: '',
          room_number: '',
          restaurant_name: '',
          date_time: '',
          party_size: 2,
          special_requests: ''
        });
        fetchRequests();
      }
    } catch (error) {
      console.error('Error creating reservation:', error);
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Restaurant Reservations</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Book restaurant reservations for hotel and partner restaurants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchRequests}
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
            New Reservation
          </button>
        </div>
      </div>

      {/* Add Reservation Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Create Restaurant Reservation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Guest Name *</label>
              <input
                type="text"
                value={newReservation.guest_name}
                onChange={(e) => setNewReservation({ ...newReservation, guest_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter guest name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Number</label>
              <input
                type="text"
                value={newReservation.room_number}
                onChange={(e) => setNewReservation({ ...newReservation, room_number: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter room number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Restaurant Name *</label>
              <input
                type="text"
                value={newReservation.restaurant_name}
                onChange={(e) => setNewReservation({ ...newReservation, restaurant_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                placeholder="Enter restaurant name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date & Time *</label>
              <input
                type="datetime-local"
                value={newReservation.date_time}
                onChange={(e) => setNewReservation({ ...newReservation, date_time: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Party Size</label>
              <input
                type="number"
                min="1"
                value={newReservation.party_size}
                onChange={(e) => setNewReservation({ ...newReservation, party_size: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Special Requests</label>
              <textarea
                value={newReservation.special_requests}
                onChange={(e) => setNewReservation({ ...newReservation, special_requests: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                rows={2}
                placeholder="Dietary requirements, special occasions, etc."
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
              onClick={handleCreateReservation}
              disabled={!newReservation.guest_name || !newReservation.restaurant_name || !newReservation.date_time}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              Create Reservation
            </button>
          </div>
        </div>
      )}

      {/* Reservations List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Loading reservations...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No restaurant reservations found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Utensils size={16} className="text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="font-medium text-slate-900 dark:text-white">{request.guest_name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">
                    {request.room_number || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-md truncate">
                    {request.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                    {new Date(request.submitted_at).toLocaleString()}
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

export default RestaurantReservationsModule;