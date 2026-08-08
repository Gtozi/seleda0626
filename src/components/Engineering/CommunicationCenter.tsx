import React, { useState } from 'react';
import {
  MessageSquare, Search, Filter, Plus, Bell, CheckCircle2,
  AlertTriangle, Clock, User, ChevronRight, Send, FileText,
  Users, Building2, Wrench, Zap, Droplets, Flame
} from 'lucide-react';

interface Message {
  id: string;
  type: 'Announcement' | 'Alert' | 'Request' | 'Update' | 'Reminder';
  category: 'General' | 'Safety' | 'Maintenance' | 'Emergency' | 'Compliance';
  title: string;
  content: string;
  sender: string;
  senderRole: string;
  recipients: string[];
  sentDate: string;
  status: 'Sent' | 'Read' | 'Archived';
  priority: 'Critical' | 'High' | 'Normal' | 'Low';
  attachments?: number;
}

interface Notification {
  id: string;
  type: 'System' | 'Work Order' | 'Alert' | 'Request';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

const CommunicationCenter: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      type: 'Alert',
      category: 'Emergency',
      title: 'Generator Maintenance Required',
      content: 'Backup generator requires immediate maintenance. Fuel levels below 20% and cooling system showing elevated temperatures.',
      sender: 'John Electrician',
      senderRole: 'Senior Electrician',
      recipients: ['Engineering Team', 'Management'],
      sentDate: '2026-07-29 10:30',
      status: 'Sent',
      priority: 'Critical',
    },
    {
      id: 'MSG-002',
      type: 'Announcement',
      category: 'General',
      title: 'Quarterly Maintenance Schedule Published',
      content: 'The Q3 2026 preventive maintenance schedule has been published. Please review your assigned tasks and confirm availability.',
      sender: 'Engineering Manager',
      senderRole: 'Department Head',
      recipients: ['All Engineering Staff'],
      sentDate: '2026-07-28 14:00',
      status: 'Read',
      priority: 'Normal',
    },
    {
      id: 'MSG-003',
      type: 'Request',
      category: 'Maintenance',
      title: 'Spare Parts Approval Request',
      content: 'Requesting approval for purchase of 5 HEPA filters for HVAC system. Estimated cost: $225.',
      sender: 'Maria HVAC',
      senderRole: 'HVAC Technician',
      recipients: ['Engineering Manager', 'Procurement'],
      sentDate: '2026-07-28 09:15',
      status: 'Sent',
      priority: 'High',
      attachments: 1,
    },
    {
      id: 'MSG-004',
      type: 'Update',
      category: 'Safety',
      title: 'Fire Drill Completed Successfully',
      content: 'Monthly fire drill completed on July 27. All systems operational. Minor issues identified in Zone B smoke detectors.',
      sender: 'Safety Officer',
      senderRole: 'Safety Compliance',
      recipients: ['Engineering Team', 'Security', 'Management'],
      sentDate: '2026-07-27 16:45',
      status: 'Read',
      priority: 'Normal',
    },
    {
      id: 'MSG-005',
      type: 'Reminder',
      category: 'Compliance',
      title: 'Elevator Inspection Due Next Week',
      content: 'Annual elevator inspection scheduled for August 5. Please ensure all documentation is prepared.',
      sender: 'Engineering Manager',
      senderRole: 'Department Head',
      recipients: ['Elevator Maintenance Team'],
      sentDate: '2026-07-27 11:00',
      status: 'Sent',
      priority: 'High',
    },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'NOT-001',
      type: 'Alert',
      title: 'High Temperature Alert',
      message: 'Boiler temperature exceeding normal range.',
      time: '10:45 AM',
      read: false,
    },
    {
      id: 'NOT-002',
      type: 'Work Order',
      title: 'WO-2026-002 Assigned',
      message: 'New work order assigned: Power outage in lobby.',
      time: '09:30 AM',
      read: false,
    },
    {
      id: 'NOT-003',
      type: 'Request',
      title: 'Spare Parts Request',
      message: 'New spare parts request pending approval.',
      time: '09:15 AM',
      read: true,
    },
    {
      id: 'NOT-004',
      type: 'System',
      title: 'PM Schedule Generated',
      message: 'Preventive maintenance schedule for August generated.',
      time: 'Yesterday',
      read: true,
    },
  ]);

  const [activeType, setActiveType] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  const types = ['All', 'Announcement', 'Alert', 'Request', 'Update', 'Reminder'];
  const statuses = ['All', 'Sent', 'Read', 'Archived'];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Announcement': return Bell;
      case 'Alert': return AlertTriangle;
      case 'Request': return MessageSquare;
      case 'Update': return FileText;
      case 'Reminder': return Clock;
      default: return MessageSquare;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General': return Users;
      case 'Safety': return Flame;
      case 'Maintenance': return Wrench;
      case 'Emergency': return AlertTriangle;
      case 'Compliance': return CheckCircle2;
      default: return MessageSquare;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Sent': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'Read': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'Archived': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-rose-500 text-white';
      case 'High': return 'bg-amber-500 text-white';
      case 'Normal': return 'bg-blue-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-100 text-slate-500';
    }
  };

  const filteredMessages = messages.filter(message => {
    if (activeType !== 'All' && message.type !== activeType) return false;
    if (activeStatus !== 'All' && message.status !== activeStatus) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-sans font-black text-slate-900 dark:text-white leading-tight">Communication Center</h2>
          <p className="text-xs text-slate-400 font-medium tracking-tight">Internal messaging, announcements, and notifications</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Search size={16} />
            Search
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} />
            New Message
          </button>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {types.map((type) => {
          const Icon = getTypeIcon(type);
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter flex items-center gap-1.5 ${
                activeType === type
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={12} />
              {type}
            </button>
          );
        })}
      </div>

      {/* Status Filter */}
      <div className="flex bg-white dark:bg-slate-900 p-1.5 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-x-auto no-scrollbar gap-1.5">
        {statuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveStatus(status)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap uppercase tracking-tighter ${
              activeStatus === status
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
              <MessageSquare size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{messages.length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Messages</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500">
              <AlertTriangle size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{messages.filter(m => m.priority === 'Critical').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Critical</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500">
              <Bell size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{notifications.filter(n => !n.read).length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unread</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-3xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 size={14} />
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">{messages.filter(m => m.status === 'Read').length}</span>
          </div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Read</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-8 space-y-4">
          {filteredMessages.map((message) => {
            const TypeIcon = getTypeIcon(message.type);
            const CategoryIcon = getCategoryIcon(message.category);
            return (
              <div
                key={message.id}
                className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-5 shadow-3xs group hover:border-indigo-300 transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-400 group-hover:text-indigo-500 transition-colors uppercase tracking-widest">{message.id}</span>
                      <span className={`px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tight ${getStatusBadge(message.status)}`}>
                        {message.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ${getPriorityColor(message.priority)}`}>
                        {message.priority}
                      </span>
                      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-[8px] font-black uppercase tracking-tight">
                        {message.type}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white leading-tight">{message.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <CategoryIcon size={10} className="text-indigo-500" />
                          {message.category}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                          <User size={10} className="text-indigo-500" />
                          {message.sender}
                        </div>
                        {message.attachments && message.attachments > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500">
                            <FileText size={10} className="text-indigo-500" />
                            {message.attachments} attachment{message.attachments > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">{message.content}</p>

                    <div className="flex flex-wrap gap-2">
                      {message.recipients.slice(0, 2).map((recipient, i) => (
                        <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-bold text-slate-600 dark:text-slate-400">
                          {recipient}
                        </span>
                      ))}
                      {message.recipients.length > 2 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[8px] font-bold text-slate-600 dark:text-slate-400">
                          +{message.recipients.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col justify-between items-end md:items-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-6 pt-3 md:pt-0">
                    <div className="space-y-2">
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Sent</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">{message.sentDate}</span>
                      </div>
                      <div>
                        <span className="text-[9px] font-black text-slate-400 uppercase block tracking-tighter leading-none">Role</span>
                        <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 block">{message.senderRole}</span>
                      </div>
                    </div>

                    <button className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar - Notifications */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-6">
            <div>
              <h3 className="text-sm font-sans font-extrabold leading-tight">Notifications</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">Recent alerts</p>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-xl border ${notification.read ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${notification.read ? 'bg-slate-500/20 text-slate-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
                      <Bell size={14} />
                    </div>
                    <div className="flex-1">
                      <span className="text-[10px] font-black text-white block">{notification.title}</span>
                      <p className="text-[8px] text-slate-400 mt-0.5">{notification.message}</p>
                      <span className="text-[8px] font-bold text-slate-500 mt-1">{notification.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl space-y-4">
            <div>
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Quick Actions</h3>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-0.5">Common communications</p>
            </div>

            <div className="space-y-3">
              <button className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Send size={16} className="text-indigo-500" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block">Send Announcement</span>
                  <span className="text-[8px] text-slate-500 font-medium">Broadcast to team</span>
                </div>
              </button>
              <button className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <AlertTriangle size={16} className="text-rose-500" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block">Send Alert</span>
                  <span className="text-[8px] text-slate-500 font-medium">Emergency notification</span>
                </div>
              </button>
              <button className="w-full p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                <Users size={16} className="text-emerald-500" />
                <div className="text-left">
                  <span className="text-[10px] font-black text-slate-900 dark:text-white block">Team Message</span>
                  <span className="text-[8px] text-slate-500 font-medium">Direct communication</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationCenter;
