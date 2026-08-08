/**
 * Tour & Excursion Management Module
 * Manage local tours, multi-day tours, and excursions
 */

import { useState, useEffect } from 'react';
import { MapPin, Plus, RefreshCw, Calendar, Users, DollarSign } from 'lucide-react';

interface TourManagementModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface TourRequest {
  id: string;
  guest_name: string;
  room_number: string;
  description: string;
  priority: string;
  status: string;
  submitted_at: string;
}

const TourManagementModule: React.FC<TourManagementModuleProps> = ({ onViewGuestProfile }) => {
  const [requests, setRequests] = useState<TourRequest[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch tour booking requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/concierge/requests?request_type=Tour Booking&department=Concierge');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching tour requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tour & Excursion Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage local tours, multi-day tours, and excursions
          </p>
        </div>
        <button 
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<MapPin size={20} className="text-indigo-600" />} label="Active Tours" value={requests.filter(r => r.status === 'In Progress').length} />
        <StatCard icon={<Users size={20} className="text-emerald-600" />} label="Total Bookings" value={requests.length} />
        <StatCard icon={<Calendar size={20} className="text-blue-600" />} label="Pending" value={requests.filter(r => r.status === 'Open').length} />
        <StatCard icon={<DollarSign size={20} className="text-amber-600" />} label="Completed" value={requests.filter(r => r.status === 'Completed').length} />
      </div>

      {/* Tour Requests */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tour Bookings</h2>
        </div>
        {loading ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            Loading tour bookings...
          </div>
        ) : requests.length === 0 ? (
          <div className="p-6 text-center text-slate-500 dark:text-slate-400">
            No tour bookings found
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Tour Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{request.guest_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{request.room_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 max-w-md truncate">{request.description}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
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

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
        </div>
      </div>
    </div>
  );
};

export default TourManagementModule;