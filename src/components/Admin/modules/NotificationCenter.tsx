import React, { useState } from 'react';
import { Mail, MessageSquare, Smartphone, Bell, Plus, Edit, Search, Filter, Send, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'whatsapp' | 'in_app';
  status: 'active' | 'inactive' | 'testing';
  provider: string;
  sentToday: number;
  successRate: number;
}

interface NotificationTemplate {
  id: string;
  name: string;
  category: 'reservation' | 'invoice' | 'check_in' | 'check_out' | 'appointment' | 'event' | 'reminder' | 'approval';
  channels: string[];
  status: 'active' | 'draft';
  lastUsed: string;
}

const NotificationCenter: React.FC = () => {
  const [channels, setChannels] = useState<NotificationChannel[]>([
    { id: '1', name: 'Email Notifications', type: 'email', status: 'active', provider: 'SendGrid', sentToday: 1250, successRate: 98.5 },
    { id: '2', name: 'SMS Notifications', type: 'sms', status: 'active', provider: 'Twilio', sentToday: 450, successRate: 95.2 },
    { id: '3', name: 'Push Notifications', type: 'push', status: 'active', provider: 'Firebase', sentToday: 890, successRate: 97.8 },
    { id: '4', name: 'WhatsApp', type: 'whatsapp', status: 'active', provider: 'Twilio API', sentToday: 120, successRate: 92.5 },
    { id: '5', name: 'In-App Notifications', type: 'in_app', status: 'active', provider: 'Internal', sentToday: 2100, successRate: 100 },
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    { id: '1', name: 'Reservation Confirmation', category: 'reservation', channels: ['email', 'sms', 'in_app'], status: 'active', lastUsed: '2024-01-15 14:30' },
    { id: '2', name: 'Invoice Generation', category: 'invoice', channels: ['email', 'in_app'], status: 'active', lastUsed: '2024-01-15 13:45' },
    { id: '3', name: 'Check-In Welcome', category: 'check_in', channels: ['email', 'sms', 'in_app'], status: 'active', lastUsed: '2024-01-15 12:15' },
    { id: '4', name: 'Check-Out Summary', category: 'check_out', channels: ['email', 'in_app'], status: 'active', lastUsed: '2024-01-15 10:30' },
    { id: '5', name: 'Appointment Reminder', category: 'appointment', channels: ['email', 'sms', 'push'], status: 'active', lastUsed: '2024-01-15 09:00' },
    { id: '6', name: 'Event Confirmation', category: 'event', channels: ['email', 'in_app'], status: 'active', lastUsed: '2024-01-14 16:45' },
    { id: '7', name: 'Payment Reminder', category: 'reminder', channels: ['email', 'sms', 'whatsapp'], status: 'active', lastUsed: '2024-01-14 14:20' },
    { id: '8', name: 'Approval Notification', category: 'approval', channels: ['email', 'in_app', 'push'], status: 'active', lastUsed: '2024-01-15 11:30' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredChannels = channels.filter(channel => {
    return channel.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredTemplates = templates.filter(template => {
    return template.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const channelTypes = [
    { id: 'email', name: 'Email', icon: Mail, color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'sms', name: 'SMS', icon: MessageSquare, color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'push', name: 'Push', icon: Smartphone, color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'whatsapp', name: 'WhatsApp', icon: MessageSquare, color: 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400' },
    { id: 'in_app', name: 'In-App', icon: Bell, color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'inactive': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      case 'testing': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Notification Center</h1>
          <p className="text-xs text-slate-400">Configure email, SMS, push notifications, WhatsApp, and in-app notifications</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
            <Send size={16} />
            Send Test
          </button>
          <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={16} />
            Add Template
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Channels', value: channels.length, icon: Bell, color: 'text-blue-600' },
          { label: 'Total Templates', value: templates.length, icon: Mail, color: 'text-emerald-600' },
          { label: 'Sent Today', value: channels.reduce((sum, c) => sum + c.sentToday, 0).toLocaleString(), icon: Send, color: 'text-purple-600' },
          { label: 'Avg Success Rate', value: `${Math.round(channels.reduce((sum, c) => sum + c.successRate, 0) / channels.length)}%`, icon: CheckCircle, color: 'text-amber-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search channels and templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Notification Channels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Notification Channels</h3>
            <p className="text-xs text-slate-400">Communication methods</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredChannels.map((channel) => {
            const type = channelTypes.find(t => t.id === channel.type);
            const Icon = type?.icon || Bell;
            return (
              <div key={channel.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${type?.color} flex items-center justify-center`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{channel.name}</h4>
                      <span className="text-xs text-slate-500">{channel.provider}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(channel.status)}`}>
                    {channel.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <Send size={12} />
                      Sent Today
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{channel.sentToday.toLocaleString()}</div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                      <CheckCircle size={12} />
                      Success Rate
                    </div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{channel.successRate}%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <button className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    Configure
                  </button>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notification Templates */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Template Types</h3>
            <p className="text-xs text-slate-400">Notification templates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <div key={template.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{template.name}</h4>
                    <span className="text-xs text-slate-500 capitalize">{template.category.replace('_', ' ')}</span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${template.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400'}`}>
                  {template.status}
                </span>
              </div>

              <div className="mb-4">
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Channels</div>
                <div className="flex flex-wrap gap-1">
                  {template.channels.map((channel, index) => {
                    const channelType = channelTypes.find(c => c.id === channel);
                    return (
                      <span key={index} className={`px-2 py-0.5 rounded text-[10px] font-bold ${channelType?.color}`}>
                        {channelType?.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Clock size={12} />
                  Last used: {template.lastUsed}
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Channel Types Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Available Channels</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {channelTypes.map((type) => (
            <div key={type.id} className={`p-3 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
              <type.icon size={20} className="mb-2" />
              <span className="text-xs font-bold">{type.name}</span>
              <span className="text-[10px] opacity-75">{channels.filter(c => c.type === type.id).length} active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;