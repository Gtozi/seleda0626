/**
 * Guest Communication Hub
 * Omnichannel messaging system with WhatsApp, SMS, email, and in-app chat
 */

import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Smartphone,
  Globe,
  User,
  Paperclip,
  Smile,
  MoreVertical,
  Archive,
  Star,
  Reply,
  Forward
} from 'lucide-react';

interface CommunicationChannel {
  type: 'email' | 'sms' | 'whatsapp' | 'in_app';
  address: string;
  verified: boolean;
  preferred: boolean;
}

interface GuestMessage {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber?: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'in_app';
  subject?: string;
  message: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments?: string[];
  threadId?: string;
}

interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  roomNumber?: string;
  channels: CommunicationChannel[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'archived';
  priority: 'low' | 'normal' | 'high' | 'urgent';
}

const GuestCommunicationHub = () => {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState<'all' | 'email' | 'sms' | 'whatsapp' | 'in_app'>('all');
  const [newMessage, setNewMessage] = useState('');

  // Mock data
  const conversations: Conversation[] = useMemo(() => [
    {
      id: 'C1',
      guestId: 'G1',
      guestName: 'John Doe',
      roomNumber: '402',
      channels: [
        { type: 'whatsapp', address: '+251 911 123 456', verified: true, preferred: true },
        { type: 'email', address: 'john.doe@email.com', verified: true, preferred: false },
        { type: 'sms', address: '+251 911 123 456', verified: true, preferred: false },
      ],
      lastMessage: 'Thank you for the quick response!',
      lastMessageTime: '2026-07-19T14:30:00Z',
      unreadCount: 2,
      status: 'active',
      priority: 'high',
    },
    {
      id: 'C2',
      guestId: 'G2',
      guestName: 'Sarah Smith',
      roomNumber: '305',
      channels: [
        { type: 'email', address: 'sarah.smith@email.com', verified: true, preferred: true },
        { type: 'in_app', address: 'sarah.smith', verified: true, preferred: false },
      ],
      lastMessage: 'I would like to extend my stay by one night',
      lastMessageTime: '2026-07-19T12:15:00Z',
      unreadCount: 0,
      status: 'active',
      priority: 'normal',
    },
    {
      id: 'C3',
      guestId: 'G3',
      guestName: 'Mike Johnson',
      roomNumber: '201',
      channels: [
        { type: 'sms', address: '+251 911 345 678', verified: true, preferred: true },
        { type: 'whatsapp', address: '+251 911 345 678', verified: true, preferred: false },
      ],
      lastMessage: 'Could you send me the WiFi password?',
      lastMessageTime: '2026-07-19T10:45:00Z',
      unreadCount: 1,
      status: 'active',
      priority: 'urgent',
    },
  ], []);

  const messages: GuestMessage[] = useMemo(() => [
    {
      id: 'M1',
      guestId: 'G1',
      guestName: 'John Doe',
      roomNumber: '402',
      channel: 'whatsapp',
      message: 'Hello, I have a question about my reservation',
      direction: 'inbound',
      status: 'read',
      timestamp: '2026-07-19T14:00:00Z',
      priority: 'normal',
    },
    {
      id: 'M2',
      guestId: 'G1',
      guestName: 'John Doe',
      roomNumber: '402',
      channel: 'whatsapp',
      message: 'Of course! How can I help you?',
      direction: 'outbound',
      status: 'read',
      timestamp: '2026-07-19T14:15:00Z',
      priority: 'normal',
    },
    {
      id: 'M3',
      guestId: 'G1',
      guestName: 'John Doe',
      roomNumber: '402',
      channel: 'whatsapp',
      message: 'I need to request a late checkout',
      direction: 'inbound',
      status: 'read',
      timestamp: '2026-07-19T14:20:00Z',
      priority: 'high',
    },
    {
      id: 'M4',
      guestId: 'G1',
      guestName: 'John Doe',
      roomNumber: '402',
      channel: 'whatsapp',
      message: 'I can arrange that for you. Late checkout until 2 PM is available for a small fee.',
      direction: 'outbound',
      status: 'delivered',
      timestamp: '2026-07-19T14:25:00Z',
      priority: 'normal',
    },
    {
      id: 'M5',
      guestId: 'G1',
      guestName: 'John Doe',
      roomNumber: '402',
      channel: 'whatsapp',
      message: 'Thank you for the quick response!',
      direction: 'inbound',
      status: 'read',
      timestamp: '2026-07-19T14:30:00Z',
      priority: 'normal',
    },
  ], []);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = conv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           conv.roomNumber?.includes(searchQuery);
      const matchesChannel = filterChannel === 'all' ||
                              conv.channels.some(ch => ch.type === filterChannel);
      return matchesSearch && matchesChannel;
    });
  }, [conversations, searchQuery, filterChannel]);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp': return <Smartphone className="w-4 h-4 text-green-600" />;
      case 'sms': return <Phone className="w-4 h-4 text-blue-600" />;
      case 'email': return <Mail className="w-4 h-4 text-slate-600" />;
      case 'in_app': return <MessageSquare className="w-4 h-4 text-purple-600" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock className="w-3 h-3 text-slate-400" />;
      case 'delivered': return <CheckCircle2 className="w-3 h-3 text-blue-400" />;
      case 'read': return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case 'failed': return <AlertCircle className="w-3 h-3 text-red-400" />;
      default: return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400';
      case 'normal': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'low': return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedConversation) {
      setNewMessage('');
      // In real implementation, send message via API
    }
  };

  return (
    <div className="flex h-[calc(100vh-200px)] bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-96 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Messages</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="p-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
              <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        {/* Channel Filter */}
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto">
          {['all', 'whatsapp', 'sms', 'email', 'in_app'].map((channel) => (
            <button
              key={channel}
              onClick={() => setFilterChannel(channel as any)}
              className={`px-3 py-1 rounded-full text-xs font-medium capitalize whitespace-nowrap ${
                filterChannel === channel
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {channel === 'all' ? 'All' : channel.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedConversation(conversation)}
              className={`p-4 border-b border-slate-200 dark:border-slate-700 cursor-pointer transition-colors ${
                selectedConversation?.id === conversation.id
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-slate-900 dark:text-white truncate">{conversation.guestName}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(conversation.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {conversation.roomNumber && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Room {conversation.roomNumber}</p>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    {conversation.channels.slice(0, 2).map((channel) => (
                      <div key={channel.type} className="flex items-center gap-1">
                        {getChannelIcon(channel.type)}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{conversation.lastMessage}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getPriorityColor(conversation.priority)}`}>
                      {conversation.priority}
                    </span>
                    {conversation.unreadCount > 0 && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs font-medium">
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Message Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Conversation
          </button>
        </div>
      </div>

      {/* Message View */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{selectedConversation.guestName}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    {selectedConversation.roomNumber && <span>Room {selectedConversation.roomNumber}</span>}
                    {selectedConversation.channels.map((channel) => (
                      <div key={channel.type} className="flex items-center gap-1">
                        {getChannelIcon(channel.type)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <Star className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <Archive className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[70%] ${message.direction === 'outbound' ? 'order-2' : 'order-1'}`}>
                    <div
                      className={`rounded-lg p-3 ${
                        message.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 text-xs text-slate-500 dark:text-slate-400 ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {message.direction === 'outbound' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-end gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <Paperclip className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg resize-none bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                  <Smile className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 rounded-lg transition-colors"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 dark:text-slate-400">
                <span>Send via:</span>
                {selectedConversation.channels.map((channel) => (
                  <button
                    key={channel.type}
                    className={`flex items-center gap-1 px-2 py-1 rounded ${
                      channel.preferred
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {getChannelIcon(channel.type)}
                    <span className="capitalize">{channel.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuestCommunicationHub;
