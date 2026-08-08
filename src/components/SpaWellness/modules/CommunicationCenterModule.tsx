/**
 * Communication Center Module
 * Manages guest communications via SMS, email, and push notifications
 */

import { useState } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Edit,
  Trash2,
  Send,
  Mail,
  Smartphone,
  Bell,
  CheckCircle2,
  MoreVertical,
  Clock,
  Users
} from 'lucide-react';

interface CommunicationCenterModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface Communication {
  id: string;
  type: 'SMS' | 'Email' | 'Push Notification';
  recipient: string;
  recipientId: string;
  subject?: string;
  message: string;
  category: 'Appointment Reminder' | 'Wellness Tips' | 'Promotional Campaign' | 'Membership Notice' | 'Service Update';
  status: 'Sent' | 'Delivered' | 'Opened' | 'Failed' | 'Scheduled';
  sentDate: string;
  scheduledDate?: string;
}

const CommunicationCenterModule: React.FC<CommunicationCenterModuleProps> = ({
  onViewGuestProfile
}) => {
  const [communications, setCommunications] = useState<Communication[]>([
    {
      id: 'COM-001',
      type: 'SMS',
      recipient: 'Sarah Johnson',
      recipientId: 'GST-001',
      message: 'Reminder: Your Swedish Massage appointment is tomorrow at 9:00 AM. Reply C to cancel.',
      category: 'Appointment Reminder',
      status: 'Delivered',
      sentDate: '2026-07-30T14:30:00'
    },
    {
      id: 'COM-002',
      type: 'Email',
      recipient: 'Michael Williams',
      recipientId: 'GST-002',
      subject: 'Your Spa Membership is Expiring Soon',
      message: 'Dear Michael, your monthly spa membership will expire on July 31st. Renew now to continue enjoying unlimited spa access.',
      category: 'Membership Notice',
      status: 'Opened',
      sentDate: '2026-07-29T10:00:00'
    },
    {
      id: 'COM-003',
      type: 'Push Notification',
      recipient: 'Emma Davis',
      recipientId: 'GST-003',
      message: 'Special Offer: 20% off all facials this weekend! Book now.',
      category: 'Promotional Campaign',
      status: 'Sent',
      sentDate: '2026-07-31T09:00:00'
    },
    {
      id: 'COM-004',
      type: 'Email',
      recipient: 'All Members',
      recipientId: 'ALL',
      subject: 'Summer Wellness Tips',
      message: 'Stay hydrated and protect your skin this summer with our summer wellness guide.',
      category: 'Wellness Tips',
      status: 'Sent',
      sentDate: '2026-07-28T16:00:00'
    },
    {
      id: 'COM-005',
      type: 'SMS',
      recipient: 'James Brown',
      recipientId: 'GST-004',
      message: 'Your Couples Retreat Package is confirmed for August 15th at 2:00 PM.',
      category: 'Appointment Reminder',
      status: 'Scheduled',
      sentDate: '2026-07-31T11:00:00',
      scheduledDate: '2026-08-14T10:00:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [showNewCommunicationModal, setShowNewCommunicationModal] = useState(false);

  const communicationTypes = ['All', 'SMS', 'Email', 'Push Notification'];
  const categories = ['All', 'Appointment Reminder', 'Wellness Tips', 'Promotional Campaign', 'Membership Notice', 'Service Update'];

  const getTypeColor = (type: string) => {
    const colors = {
      'SMS': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400',
      'Email': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Push Notification': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Sent':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Opened':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400';
      case 'Failed':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400';
      case 'Scheduled':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Appointment Reminder': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400',
      'Wellness Tips': 'bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:border-teal-700/50 dark:text-teal-400',
      'Promotional Campaign': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400',
      'Membership Notice': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Service Update': 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (comm.subject && comm.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || comm.status === statusFilter;
    const matchesType = typeFilter === 'All' || comm.type === typeFilter;
    const matchesCategory = categoryFilter === 'All' || comm.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesType && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SMS':
        return <Smartphone size={16} />;
      case 'Email':
        return <Mail size={16} />;
      case 'Push Notification':
        return <Bell size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Communication Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage guest communications via SMS, email, and push notifications
          </p>
        </div>
        <button
          onClick={() => setShowNewCommunicationModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Message
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Sent">Sent</option>
            <option value="Delivered">Delivered</option>
            <option value="Opened">Opened</option>
            <option value="Failed">Failed</option>
            <option value="Scheduled">Scheduled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {communicationTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Communications List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Communication
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Category
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Message
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredCommunications.map((comm) => (
              <tr key={comm.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(comm.type)}
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(comm.type)}`}>
                      {comm.type}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{comm.id}</div>
                </td>
                <td className="px-4 py-4">
                  <button
                    onClick={() => onViewGuestProfile?.(comm.recipientId)}
                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {comm.recipient}
                  </button>
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(comm.category)}`}>
                    {comm.category}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    {comm.subject && (
                      <div className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                    {comm.subject}
                  </div>
                )}
                    <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {comm.message}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                  <div>{new Date(comm.sentDate).toLocaleDateString()}</div>
                  {comm.scheduledDate && (
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      Scheduled: {new Date(comm.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(comm.status)}`}>
                    {comm.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                      <Edit size={16} />
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Communication Modal Placeholder */}
      {showNewCommunicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Communication</h2>
              <button
                onClick={() => setShowNewCommunicationModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Communication creation form would be implemented here with recipient selection, message type, content, and scheduling options.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewCommunicationModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenterModule;