/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Send, 
  User, 
  Bell,
  Filter,
  XCircle,
  Users,
  Megaphone
} from 'lucide-react';

interface Message {
  id: string;
  from: string;
  to: string | 'All';
  subject: string;
  content: string;
  type: 'Chat' | 'Task Notification' | 'Escalation' | 'Shift Announcement' | 'Guest Service';
  timestamp: string;
  read: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'Low' | 'Medium' | 'High';
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

export default function CommunicationCenterModule() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'MSG-101', 
      from: 'Supervisor A', 
      to: 'All', 
      subject: 'VIP Arrival Priority', 
      content: 'Room 502 VIP guest arriving early, prioritize cleaning', 
      type: 'Task Notification', 
      timestamp: '2026-05-30 09:15', 
      read: false 
    },
    { 
      id: 'MSG-102', 
      from: 'Staff B', 
      to: 'Supervisor A', 
      subject: 'Linen Shortage Floor 3', 
      content: 'Running low on bath towels on Floor 3, need restock', 
      type: 'Escalation', 
      timestamp: '2026-05-30 08:45', 
      read: true 
    },
    { 
      id: 'MSG-103', 
      from: 'Front Office', 
      to: 'All', 
      subject: 'Guest Service Request', 
      content: 'Guest in 304 requesting extra pillows ASAP', 
      type: 'Guest Service', 
      timestamp: '2026-05-30 08:30', 
      read: true 
    },
    { 
      id: 'MSG-104', 
      from: 'Manager', 
      to: 'All', 
      subject: 'Shift Change', 
      content: 'Shift B taking over at 2 PM, handover briefing in break room', 
      type: 'Shift Announcement', 
      timestamp: '2026-05-30 07:00', 
      read: true 
    },
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { 
      id: 'ANN-001', 
      title: 'New Cleaning Protocols', 
      content: 'Updated cleaning standards effective from today. Please review the new checklist.', 
      priority: 'High', 
      createdBy: 'Management', 
      createdAt: '2026-05-30 06:00',
      expiresAt: '2026-06-30'
    },
    { 
      id: 'ANN-002', 
      title: 'Staff Meeting', 
      content: 'Monthly staff meeting scheduled for Friday at 3 PM in conference room.', 
      priority: 'Medium', 
      createdBy: 'HR', 
      createdAt: '2026-05-28 10:00',
      expiresAt: '2026-06-01'
    },
  ]);

  const [activeTab, setActiveTab] = useState<'messages' | 'announcements'>('messages');
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Chat' | 'Task Notification' | 'Escalation' | 'Shift Announcement' | 'Guest Service'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({
    to: 'All',
    subject: '',
    content: '',
    type: 'Chat' as 'Chat' | 'Task Notification' | 'Escalation' | 'Shift Announcement' | 'Guest Service'
  });

  const filteredMessages = messages.filter(message => {
    const matchesFilter = filter === 'All' || 
                         (filter === 'Unread' && !message.read) || 
                         message.type === filter;
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          message.from.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Escalation': return 'bg-red-500 text-white';
      case 'Task Notification': return 'bg-orange-500 text-white';
      case 'Guest Service': return 'bg-indigo-500 text-white';
      case 'Shift Announcement': return 'bg-purple-500 text-white';
      case 'Chat': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-500 text-white';
      case 'Medium': return 'bg-indigo-500 text-white';
      case 'Low': return 'bg-slate-500 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  const handleMarkAsRead = (messageId: string) => {
    setMessages(prev => prev.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    ));
  };

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) return;

    const message: Message = {
      id: `MSG-${Date.now()}`,
      from: 'Current User',
      to: newMessage.to,
      subject: newMessage.subject,
      content: newMessage.content,
      type: newMessage.type,
      timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      read: true
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({
      to: 'All',
      subject: '',
      content: '',
      type: 'Chat'
    });
    setIsComposing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Communication Center</h2>
          <p className="text-xs text-slate-500 font-mono italic">Internal chat, task notifications, escalations, and shift announcements.</p>
        </div>
        <button 
          onClick={() => setIsComposing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all"
        >
          <Send size={14} /> New Message
        </button>
      </div>

      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1 w-fit">
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
            activeTab === 'messages' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Messages
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${
            activeTab === 'announcements' 
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Announcements
        </button>
      </div>

      {isComposing && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase">Compose Message</h3>
              <p className="text-xs text-slate-500 font-mono mt-1">Send message to team or specific staff</p>
            </div>
            <button 
              onClick={() => setIsComposing(false)}
              className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              <XCircle size={16} className="text-slate-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">To</label>
                <select 
                  value={newMessage.to}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, to: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                >
                  <option value="All">All Staff</option>
                  <option value="Supervisor A">Supervisor A</option>
                  <option value="Supervisor B">Supervisor B</option>
                  <option value="Staff A">Staff A</option>
                  <option value="Staff B">Staff B</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                <select 
                  value={newMessage.type}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                >
                  <option value="Chat">Chat</option>
                  <option value="Task Notification">Task Notification</option>
                  <option value="Escalation">Escalation</option>
                  <option value="Shift Announcement">Shift Announcement</option>
                  <option value="Guest Service">Guest Service</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Subject</label>
              <input 
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Message subject..."
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Message</label>
              <textarea 
                value={newMessage.content}
                onChange={(e) => setNewMessage(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Type your message..."
                rows={4}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsComposing(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendMessage}
                disabled={!newMessage.subject || !newMessage.content}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send size={14} /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'messages' ? (
        <>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-3xs">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              {(['All', 'Unread', 'Chat', 'Task Notification', 'Escalation', 'Shift Announcement', 'Guest Service'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                    filter === f 
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search messages..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-850 border border-transparent dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {filteredMessages.map(message => (
              <div key={message.id} className={`bg-white dark:bg-slate-900 border ${message.read ? 'border-slate-200 dark:border-slate-800' : 'border-indigo-300 dark:border-indigo-700'} p-5 rounded-3xl shadow-3xs hover:border-indigo-400 transition-all`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {message.from.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{message.from}</span>
                        {!message.read && <span className="w-2 h-2 rounded-full bg-indigo-500" />}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>To: {message.to}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock size={10} />
                          <span className="font-mono">{message.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getTypeColor(message.type)}`}>
                    {message.type}
                  </span>
                </div>

                <div className="mb-3">
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase mb-1">{message.subject}</h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{message.content}</p>
                </div>

                {!message.read && (
                  <button 
                    onClick={() => handleMarkAsRead(message.id)}
                    className="text-[9px] font-black text-indigo-600 hover:text-indigo-800 uppercase"
                  >
                    Mark as Read
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div key={announcement.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                    <Megaphone size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">{announcement.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                      <span>By: {announcement.createdBy}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span className="font-mono">{announcement.createdAt}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </span>
              </div>

              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mb-4">{announcement.content}</p>

              {announcement.expiresAt && (
                <div className="text-[9px] text-slate-400 font-mono">
                  Expires: {announcement.expiresAt}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
