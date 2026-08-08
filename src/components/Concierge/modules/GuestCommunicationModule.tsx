/**
 * Guest Communication Center Module
 * Manage SMS, email, app notifications, and internal messaging
 */

import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Smartphone, RefreshCw, Send, CheckCircle2, Clock } from 'lucide-react';

interface GuestCommunicationModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface Communication {
  id: string;
  guest_id?: string;
  reservation_id?: string;
  room_number?: string;
  message: string;
  message_type: string;
  status: string;
  reply?: string;
  created_at: string;
  replied_at?: string;
  replied_by?: string;
}

const GuestCommunicationModule: React.FC<GuestCommunicationModuleProps> = ({ onViewGuestProfile }) => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [selectedCommunication, setSelectedCommunication] = useState<Communication | null>(null);
  const [replyText, setReplyText] = useState('');

  // Fetch communications
  const fetchCommunications = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await fetch(`/api/concierge/communications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCommunications(data);
      }
    } catch (error) {
      console.error('Error fetching communications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, [filterStatus]);

  // Send reply
  const handleReply = async () => {
    if (!selectedCommunication || !replyText.trim()) return;

    try {
      const response = await fetch(`/api/concierge/communications/${selectedCommunication.id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reply: replyText,
          replied_by: 'Concierge' // In real app, this would be the current user
        })
      });

      if (response.ok) {
        setReplyText('');
        setSelectedCommunication(null);
        fetchCommunications();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      'Replied': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Closed': 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400'
    };
    return colors[status] || colors['Pending'];
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'sms':
        return <Smartphone size={16} className="text-blue-600" />;
      case 'email':
        return <Mail size={16} className="text-emerald-600" />;
      default:
        return <MessageSquare size={16} className="text-indigo-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Communication Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage guest messages and communications
          </p>
        </div>
        <button 
          onClick={fetchCommunications}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
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
            <option value="Replied">Replied</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Communications List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Messages</h2>
          </div>
          {loading ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              Loading communications...
            </div>
          ) : communications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              No communications found
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-700 max-h-96 overflow-y-auto">
              {communications.map((comm) => (
                <div
                  key={comm.id}
                  onClick={() => setSelectedCommunication(comm)}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-900/20 cursor-pointer transition ${
                    selectedCommunication?.id === comm.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                        {getMessageTypeIcon(comm.message_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {comm.room_number || 'No Room'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(comm.status)}`}>
                            {comm.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {comm.message}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {new Date(comm.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Communication Detail */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {selectedCommunication ? 'Message Details' : 'Select a Message'}
            </h2>
          </div>
          {selectedCommunication ? (
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</label>
                <div className="flex items-center gap-2 mt-1">
                  {getMessageTypeIcon(selectedCommunication.message_type)}
                  <span className="text-sm text-slate-900 dark:text-white capitalize">
                    {selectedCommunication.message_type}
                  </span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room</label>
                <p className="text-sm text-slate-900 dark:text-white mt-1">
                  {selectedCommunication.room_number || 'Not specified'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Message</label>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                  {selectedCommunication.message}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Received</label>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {new Date(selectedCommunication.created_at).toLocaleString()}
                </p>
              </div>
              {selectedCommunication.reply && (
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Reply</label>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-lg">
                    {selectedCommunication.reply}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Replied by {selectedCommunication.replied_by} at {selectedCommunication.replied_at ? new Date(selectedCommunication.replied_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              )}
              {selectedCommunication.status === 'Pending' && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Your Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full mt-1 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
                    rows={3}
                    placeholder="Type your reply..."
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50"
                  >
                    <Send size={16} />
                    Send Reply
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-slate-500 dark:text-slate-400">
              Select a message to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestCommunicationModule;