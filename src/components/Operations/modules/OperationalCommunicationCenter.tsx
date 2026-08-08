/**
 * Operational Communication Center
 * Communication channels for operational coordination
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Megaphone,
  Mail,
  Phone,
  Send,
  Bell,
  Search,
  Filter,
  Plus,
  Users,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  type: 'chat' | 'broadcast' | 'department' | 'sms' | 'email' | 'push';
  from: string;
  to: string;
  subject?: string;
  content: string;
  timestamp: string;
  read: boolean;
}

const OperationalCommunicationCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'broadcast' | 'department' | 'history'>('chat');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'broadcast',
      from: 'General Manager',
      to: 'All Departments',
      subject: 'VIP Arrival Notice',
      content: 'VVIP guest arriving at 14:00. All departments to be on alert.',
      timestamp: '10:30',
      read: false
    },
    {
      id: '2',
      type: 'department',
      from: 'Housekeeping',
      to: 'Front Office',
      subject: 'Room Readiness',
      content: 'Presidential Suite ready for inspection.',
      timestamp: '10:15',
      read: true
    }
  ]);

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'chat':
        return MessageSquare;
      case 'broadcast':
        return Megaphone;
      case 'department':
        return Users;
      case 'history':
        return Clock;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <MessageSquare size={28} />
            Operational Communication Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Communication channels for operational coordination</p>
        </div>
      </div>

      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
        {(['chat', 'broadcast', 'department', 'history'] as const).map(tab => {
          const Icon = getTabIcon(tab);
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Icon size={16} />
              {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
            </button>
          );
        })}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="space-y-3">
          {messages.map(message => (
            <div key={message.id} className={`p-4 rounded-lg border ${message.read ? 'bg-slate-50 dark:bg-slate-900/50' : 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{message.from}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-500">→ {message.to}</span>
                    {message.subject && <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{message.subject}</span>}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{message.content}</p>
                  <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">{message.timestamp}</span>
                </div>
                {!message.read && <Bell size={16} className="text-amber-500" />}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OperationalCommunicationCenter;