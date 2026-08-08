/**
 * Wake-up & Reminder Services Module
 * Manage wake-up calls and activity reminders
 */

import { useState, useEffect } from 'react';
import { Clock, Bell, Plus, RefreshCw } from 'lucide-react';

interface WakeUpReminderModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface ReminderRequest {
  id: string;
  guest_name: string;
  room_number: string;
  description: string;
  priority: string;
  status: string;
  submitted_at: string;
}

const WakeUpReminderModule: React.FC<WakeUpReminderModuleProps> = ({ onViewGuestProfile }) => {
  const [requests, setRequests] = useState<ReminderRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/concierge/requests?request_type=Wake Up Call&department=Concierge');
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wake-up & Reminder Services</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage wake-up calls and activity reminders</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRequests} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
            <Plus size={16} />
            New Reminder
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {loading ? (
          <div className="text-center text-slate-500 dark:text-slate-400">Loading reminders...</div>
        ) : requests.length === 0 ? (
          <div className="text-center text-slate-500 dark:text-slate-400">No reminders scheduled</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Room</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Details</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Scheduled</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{request.guest_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{request.room_number || '-'}</td>
                  <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300">{request.description}</td>
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

export default WakeUpReminderModule;