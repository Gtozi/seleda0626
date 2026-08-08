import React, { useState } from 'react';
import { 
  MessageSquare,
  Send,
  Search,
  Plus,
  Phone,
  Mail,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  User,
  Car
} from 'lucide-react';

const CommunicationCenter: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const messages = [
    {
      id: 'MSG-001',
      type: 'Driver Message',
      from: 'John D. (Driver)',
      to: 'Dispatch',
      subject: 'Traffic delay on route to JFK',
      content: 'Experiencing heavy traffic on Van Wyck Expressway. ETA extended by 15 minutes.',
      timestamp: '2026-07-30 14:25',
      status: 'Read',
      priority: 'Normal',
      relatedTrip: 'TR-001'
    },
    {
      id: 'MSG-002',
      type: 'Guest Notification',
      from: 'System',
      to: 'John Smith (Room 302)',
      subject: 'Your driver has arrived',
      content: 'Your driver John D. is waiting at JFK Airport Terminal 4, Arrivals area.',
      timestamp: '2026-07-30 14:20',
      status: 'Delivered',
      priority: 'Normal',
      relatedTrip: 'TR-001'
    },
    {
      id: 'MSG-003',
      type: 'Dispatch Notification',
      from: 'Dispatch',
      to: 'Carlos M. (Driver)',
      subject: 'New trip assignment',
      content: 'You have been assigned to trip TR-003. Please proceed to Hotel Main Entrance for pickup.',
      timestamp: '2026-07-30 14:15',
      status: 'Read',
      priority: 'High',
      relatedTrip: 'TR-003'
    },
    {
      id: 'MSG-004',
      type: 'Emergency Alert',
      from: 'System',
      to: 'All Drivers',
      subject: 'Vehicle breakdown - VH-005',
      content: 'Vehicle VH-005 has broken down on Highway 27. All drivers avoid this area.',
      timestamp: '2026-07-30 13:45',
      status: 'Read',
      priority: 'Critical',
      relatedTrip: null
    },
    {
      id: 'MSG-005',
      type: 'Driver Message',
      from: 'Elena R. (Driver)',
      to: 'Dispatch',
      subject: 'Completed trip TR-002',
      content: 'Trip completed successfully. Guest dropped off at Times Square. Vehicle returning to hotel.',
      timestamp: '2026-07-30 13:30',
      status: 'Read',
      priority: 'Normal',
      relatedTrip: 'TR-002'
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Driver Message': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Guest Notification': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'Dispatch Notification': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200';
      case 'Emergency Alert': return 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-orange-500 text-white';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.to.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || message.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Communication Center</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Driver messaging, dispatch notifications, and guest communications</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <Plus className="w-4 h-4" />
          New Message
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Messages</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{messages.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
              <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Notifications Sent</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{messages.filter(m => m.type === 'Guest Notification' || m.type === 'Dispatch Notification').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Emergency Alerts</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{messages.filter(m => m.type === 'Emergency Alert').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Delivered</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{messages.filter(m => m.status === 'Delivered' || m.status === 'Read').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900 dark:text-white">Call Driver</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Direct voice communication</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900 dark:text-white">Email Guest</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Send trip confirmation</p>
          </div>
        </button>
        <button className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition">
          <div className="p-2 bg-rose-100 dark:bg-rose-900 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-left">
            <p className="font-medium text-slate-900 dark:text-white">Emergency Alert</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Broadcast to all drivers</p>
          </div>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Driver Message">Driver Message</option>
            <option value="Guest Notification">Guest Notification</option>
            <option value="Dispatch Notification">Dispatch Notification</option>
            <option value="Emergency Alert">Emergency Alert</option>
          </select>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">From</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredMessages.map((message) => (
                <tr key={message.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(message.type)}`}>
                      {message.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{message.from}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">{message.to}</td>
                  <td className="px-6 py-4 text-sm text-slate-900 dark:text-white max-w-xs truncate">{message.subject}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(message.priority)}`}>
                      {message.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {message.timestamp.split(' ')[1]}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      message.status === 'Read' || message.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                    }`}>
                      {message.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;