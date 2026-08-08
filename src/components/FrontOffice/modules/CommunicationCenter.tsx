/**
 * Front Office Communication Center Module
 * Messaging, notifications, and guest communication management
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import {
  MessageSquare,
  Send,
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
  Bell,
  Phone,
  Mail,
  Calendar,
  FileText,
  Users,
  Archive,
  Star
} from 'lucide-react';
import StatCard from '../StatCard';

type MessageType = 'message' | 'notification' | 'alert' | 'reminder';
type MessageStatus = 'unread' | 'read' | 'replied' | 'archived';
type Priority = 'low' | 'medium' | 'high' | 'urgent';
type Channel = 'in_room' | 'email' | 'sms' | 'app' | 'phone';

interface Communication {
  id: string;
  message_number?: string;
  type: string;
  from_name: string;
  from_type: string;
  to_name: string;
  to_type: string;
  subject?: string;
  content: string;
  channel: string;
  priority: string;
  status: string;
  sent_at: string;
  read_at?: string;
  replied_at?: string;
  room_number?: string;
  reservation_id?: string;
  guest_id?: string;
  reply?: string;
  created_at: string;
  updated_at: string;
}

interface CommunicationTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  channels: string[];
  subject_template?: string;
  content_template?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

interface CommunicationStats {
  unread: number;
  read: number;
  replied: number;
  messages: number;
  notifications: number;
  alerts: number;
  reminders: number;
  urgent: number;
  high: number;
}

const CommunicationCenter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'inbox' | 'compose' | 'sent' | 'templates' | 'notifications') || 'inbox';
  const setActiveTab = (tab: 'inbox' | 'compose' | 'sent' | 'templates' | 'notifications') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Communication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [composeForm, setComposeForm] = useState({
    to: '',
    toType: 'guest' as 'guest' | 'staff' | 'department',
    subject: '',
    content: '',
    channel: 'in_room' as Channel,
    priority: 'medium' as Priority,
    roomId: '',
    reservationId: ''
  });

  const [communications, setCommunications] = useState<Communication[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [stats, setStats] = useState<CommunicationStats>({
    unread: 0,
    read: 0,
    replied: 0,
    messages: 0,
    notifications: 0,
    alerts: 0,
    reminders: 0,
    urgent: 0,
    high: 0
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchCommunications();
    fetchTemplates();
    fetchStats();
  }, []);

  // Refresh data when search query changes
  useEffect(() => {
    if (searchQuery) {
      fetchCommunications(searchQuery);
    } else {
      fetchCommunications();
    }
  }, [searchQuery]);

  const fetchCommunications = async (search?: string) => {
    try {
      setLoading(true);
      setError(null);
      let url = '/api/front-office/communications';
      if (search) {
        url += `?search=${encodeURIComponent(search)}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch communications');
      const data = await response.json();
      setCommunications(data.communications || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load communications');
      console.error('Error fetching communications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/front-office/communications/templates');
      if (!response.ok) {
        console.warn('Templates endpoint returned:', response.status);
        setTemplates([]); // Set empty array on failure
        return;
      }
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.warn('Error fetching templates:', err);
      setTemplates([]); // Set empty array on failure
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/front-office/communications/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleRefresh = () => {
    fetchCommunications(searchQuery);
    fetchTemplates();
    fetchStats();
  };

  // Real-time subscription to communications changes
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('communications_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communications'
        },
        (payload) => {
          console.log('Real-time communication change received:', payload);
          fetchCommunications(searchQuery);
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [searchQuery]);

  const filteredCommunications = communications; // Search is now handled by the API

  const getStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    const config: Record<string, { bg: string; text: string; label: string }> = {
      unread: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Unread' },
      read: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Read' },
      replied: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Replied' },
      archived: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Archived' },
    };
    const c = config[normalizedStatus] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getPriorityBadge = (priority: string) => {
    const normalizedPriority = priority.toLowerCase();
    const config: Record<string, { bg: string; text: string; label: string }> = {
      low: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Low' },
      medium: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Medium' },
      high: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'High' },
      urgent: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Urgent' },
    };
    const c = config[normalizedPriority] || { bg: 'bg-slate-100', text: 'text-slate-700', label: priority };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getTypeIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'message': return <MessageSquare size={16} />;
      case 'notification': return <Bell size={16} />;
      case 'alert': return <AlertTriangle size={16} />;
      case 'reminder': return <Clock size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const getChannelIcon = (channel: string) => {
    const normalizedChannel = channel.toLowerCase();
    switch (normalizedChannel) {
      case 'in_room': return <Home size={16} />;
      case 'email': return <Mail size={16} />;
      case 'sms': return <Phone size={16} />;
      case 'app': return <MessageSquare size={16} />;
      case 'phone': return <Phone size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const handleCompose = async () => {
    try {
      const response = await fetch('/api/front-office/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: composeForm.to,
          toType: composeForm.to_type,
          subject: composeForm.subject,
          content: composeForm.content,
          channel: composeForm.channel,
          priority: composeForm.priority,
          roomId: composeForm.roomId,
          reservationId: composeForm.reservationId,
        }),
      });

      if (!response.ok) throw new Error('Failed to send communication');

      setShowComposeModal(false);
      setComposeForm({
        to: '',
        toType: 'guest',
        subject: '',
        content: '',
        channel: 'in_room',
        priority: 'medium',
        roomId: '',
        reservationId: ''
      });
      
      fetchCommunications();
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send communication');
      console.error('Error sending communication:', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/front-office/communications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      fetchCommunications(searchQuery);
      fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      console.error('Error updating status:', err);
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
    <div className="space-y-6 animate-fade-in" id="communication-center">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Communication Center</h2>
          <p className="text-sm text-slate-500 mt-1">Messaging, notifications, and guest communication</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowComposeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Send size={16} />
            Compose
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
        <StatCard label="Unread" value={stats.unread.toString()} icon={Bell} variant="alert" />
        <StatCard label="Pending Replies" value={stats.replied.toString()} icon={MessageSquare} variant="alert" />
        <StatCard label="Messages Today" value={stats.messages.toString()} icon={Send} variant="primary" />
        <StatCard label="Active Templates" value={templates.filter(t => t.active).length.toString()} icon={FileText} variant="primary" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="inbox" label="Inbox" icon={MessageSquare} />
        <TabButton id="compose" label="Compose" icon={Send} />
        <TabButton id="sent" label="Sent" icon={Archive} />
        <TabButton id="templates" label="Templates" icon={FileText} />
        <TabButton id="notifications" label="Notifications" icon={Bell} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'inbox' || activeTab === 'sent') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search messages..."
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

      {/* Inbox Tab */}
      {activeTab === 'inbox' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Inbox</h3>
            <span className="text-xs text-slate-500">{filteredCommunications.filter(m => m.to_type === 'department' || m.to_type === 'staff').length} messages</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">From</th>
                  <th className="px-4 py-3 text-left font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold">Channel</th>
                  <th className="px-4 py-3 text-left font-semibold">Priority</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Received</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCommunications.filter(m => m.to_type === 'department' || m.to_type === 'staff').map((msg) => (
                  <tr key={msg.id} className={`hover:bg-slate-50 transition-colors ${msg.status === 'unread' ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {msg.status === 'unread' && <div className="w-2 h-2 bg-indigo-600 rounded-full" />}
                        <div className="font-medium text-slate-900">{msg.from_name}</div>
                        <div className="text-xs text-slate-500">{msg.from_type}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(msg.type)}
                        <span className="text-slate-900">{msg.subject}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        {getChannelIcon(msg.channel)}
                        <span className="capitalize">{msg.channel.replace('_', ' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(msg.priority)}</td>
                    <td className="px-4 py-3">{getStatusBadge(msg.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{msg.sent_at}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedMessage(msg)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Reply">
                          <Send size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compose Tab */}
      {activeTab === 'compose' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Compose Message</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Recipient Type</label>
              <select
                value={composeForm.to_type}
                onChange={(e) => setComposeForm({ ...composeForm, toType: e.target.value as 'guest' | 'staff' | 'department' })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="guest">Guest</option>
                <option value="staff">Staff</option>
                <option value="department">Department</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Recipient</label>
              <input
                type="text"
                value={composeForm.to}
                onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                placeholder="Name or department"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
              <input
                type="text"
                value={composeForm.roomId}
                onChange={(e) => setComposeForm({ ...composeForm, roomId: e.target.value })}
                placeholder="Room number (if guest)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reservation ID</label>
              <input
                type="text"
                value={composeForm.reservationId}
                onChange={(e) => setComposeForm({ ...composeForm, reservationId: e.target.value })}
                placeholder="RES-XXX"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Channel</label>
              <select
                value={composeForm.channel}
                onChange={(e) => setComposeForm({ ...composeForm, channel: e.target.value as Channel })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="in_room">In-Room Message</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="app">App Notification</option>
                <option value="phone">Phone Call</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select
                value={composeForm.priority}
                onChange={(e) => setComposeForm({ ...composeForm, priority: e.target.value as Priority })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
              <input
                type="text"
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                placeholder="Message subject"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
              <textarea
                value={composeForm.content}
                onChange={(e) => setComposeForm({ ...composeForm, content: e.target.value })}
                rows={5}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setComposeForm({ to: '', toType: 'guest', subject: '', content: '', channel: 'in_room', priority: 'medium', roomId: '', reservationId: '' })}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleCompose}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Send size={16} />
              Send Message
            </button>
          </div>
        </div>
      )}

      {/* Sent Tab */}
      {activeTab === 'sent' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Sent Messages</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">To</th>
                  <th className="px-4 py-3 text-left font-semibold">Subject</th>
                  <th className="px-4 py-3 text-left font-semibold">Channel</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCommunications.filter(m => m.from_type === 'staff').map((msg) => (
                  <tr key={msg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{msg.to_name}</td>
                    <td className="px-4 py-3 text-slate-600">{msg.subject}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{msg.channel.replace('_', ' ')}</td>
                    <td className="px-4 py-3">{getStatusBadge(msg.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{msg.sent_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Notification Templates</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Template</th>
                  <th className="px-4 py-3 text-left font-semibold">Description</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Channels</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{tpl.name}</td>
                    <td className="px-4 py-3 text-slate-600">{tpl.description}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{tpl.category.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-600">{tpl.channels.join(', ')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${tpl.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {tpl.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">System Notifications</h3>
          <div className="space-y-3">
            {filteredCommunications.filter(m => m.type === 'notification' || m.type === 'alert' || m.type === 'reminder').map((msg) => (
              <div key={msg.id} className={`p-4 border rounded-lg ${msg.priority === 'urgent' ? 'border-rose-200 bg-rose-50' : 'border-slate-200'}`}>
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${msg.priority === 'urgent' ? 'bg-rose-100' : 'bg-slate-100'}`}>
                    {getTypeIcon(msg.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{msg.subject}</span>
                      <span className="text-xs text-slate-500">{msg.sent_at}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{msg.content}</p>
                    {msg.room_number && <p className="text-xs text-slate-500 mt-2">Room: {msg.room_number}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Compose Message</h3>
              <button onClick={() => setShowComposeModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Use the Compose tab to send messages to guests, staff, or departments.</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowComposeModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={() => { setShowComposeModal(false); setActiveTab('compose'); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">Go to Compose</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationCenter;
