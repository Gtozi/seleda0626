/**
 * Omnichannel Messaging Center Component
 * Centralized messaging hub for guest communications across all channels
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  Reply,
  Archive,
  Star,
  MoreVertical,
  RefreshCw,
  Paperclip,
  Smile,
  Video,
  Image as ImageIcon
} from 'lucide-react';

interface Message {
  id: string;
  conversationId: string;
  from: 'guest' | 'staff' | 'system';
  senderName: string;
  senderId: string;
  content: string;
  channel: 'email' | 'sms' | 'whatsapp' | 'app' | 'web';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  attachments?: MessageAttachment[];
}

interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
}

interface Conversation {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  reservationId?: string;
  roomNumber?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  status: 'active' | 'archived' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  lastMessageAt: Date;
  unreadCount: number;
  assignedTo?: string;
  tags: string[];
  channels: ('email' | 'sms' | 'whatsapp' | 'app' | 'web')[];
}

const OmnichannelMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/front-office/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const res = await fetch(`/api/front-office/conversations/${conversationId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    fetchConversations();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      const matchesSearch = 
        conv.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.guestEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = selectedChannel === 'all' || conv.channels.includes(selectedChannel as any);
      const matchesStatus = selectedStatus === 'all' || conv.status === selectedStatus;
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [conversations, searchQuery, selectedChannel, selectedStatus]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    try {
      setSending(true);
      const res = await fetch(`/api/front-office/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: messageText,
          channel: selectedConversation.channels[0]
        })
      });

      if (res.ok) {
        setMessageText('');
        await fetchMessages(selectedConversation.id);
        await fetchConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleMarkAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/front-office/conversations/${conversationId}/mark-read`, {
        method: 'POST'
      });
      await fetchConversations();
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleArchiveConversation = async (conversationId: string) => {
    try {
      await fetch(`/api/front-office/conversations/${conversationId}/archive`, {
        method: 'POST'
      });
      await fetchConversations();
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    } catch (error) {
      console.error('Failed to archive conversation:', error);
    }
  };

  const getChannelIcon = (channel: string) => {
    const icons = {
      email: <Mail className="w-4 h-4" />,
      sms: <MessageSquare className="w-4 h-4" />,
      whatsapp: <MessageSquare className="w-4 h-4" />,
      app: <MessageSquare className="w-4 h-4" />,
      web: <MessageSquare className="w-4 h-4" />
    };
    return icons[channel as keyof typeof icons] || <MessageSquare className="w-4 h-4" />;
  };

  const getChannelColor = (channel: string) => {
    const colors = {
      email: 'bg-blue-100 text-blue-600',
      sms: 'bg-green-100 text-green-600',
      whatsapp: 'bg-emerald-100 text-emerald-600',
      app: 'bg-purple-100 text-purple-600',
      web: 'bg-slate-100 text-slate-600'
    };
    return colors[channel as keyof typeof colors] || 'bg-slate-100 text-slate-600';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-amber-100 text-amber-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-slate-100 text-slate-600';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      sent: <Clock className="w-4 h-4 text-slate-400" />,
      delivered: <CheckCircle2 className="w-4 h-4 text-blue-500" />,
      read: <CheckCircle2 className="w-4 h-4 text-green-500" />,
      failed: <XCircle className="w-4 h-4 text-red-500" />
    };
    return icons[status as keyof typeof icons] || <Clock className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="h-[calc(100vh-200px)] flex">
      {/* Conversations List */}
      <div className="w-96 border-r border-slate-200 flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">Messages</h2>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Channels</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="app">App</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500">Loading...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-slate-500">No conversations found</div>
          ) : (
            filteredConversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => {
                  setSelectedConversation(conv);
                  if (conv.unreadCount > 0) {
                    handleMarkAsRead(conv.id);
                  }
                }}
                className={`p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{conv.guestName}</p>
                      <p className="text-xs text-slate-500">{conv.roomNumber || 'No room assigned'}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  {conv.channels.slice(0, 2).map(channel => (
                    <span key={channel} className={`px-2 py-0.5 rounded-full text-xs ${getChannelColor(channel)}`}>
                      {channel}
                    </span>
                  ))}
                  {conv.channels.length > 2 && (
                    <span className="text-xs text-slate-500">+{conv.channels.length - 2}</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getPriorityColor(conv.priority)}`}>
                    {conv.priority}
                  </span>
                </div>

                {conv.unreadCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 bg-blue-600 text-white rounded-full text-xs font-medium">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="bg-white border-b border-slate-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{selectedConversation.guestName}</h3>
                    <p className="text-sm text-slate-600">{selectedConversation.guestEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => handleArchiveConversation(selectedConversation.id)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Archive className="w-5 h-5 text-slate-600" />
                  </button>
                  <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-slate-600" />
                  </button>
                </div>
              </div>

              {selectedConversation.reservationId && (
                <div className="mt-4 flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedConversation.checkInDate ? new Date(selectedConversation.checkInDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{selectedConversation.checkOutDate ? new Date(selectedConversation.checkOutDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.from === 'guest' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-md ${message.from === 'guest' ? 'bg-white' : 'bg-blue-600 text-white'} rounded-lg p-3 shadow-sm`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-medium ${message.from === 'guest' ? 'text-slate-600' : 'text-blue-100'}`}>
                        {message.senderName}
                      </span>
                      <span className={`text-xs ${message.from === 'guest' ? 'text-slate-500' : 'text-blue-200'}`}>
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.from === 'staff' && getStatusIcon(message.status)}
                    </div>
                    <p className={`text-sm ${message.from === 'guest' ? 'text-slate-900' : 'text-white'}`}>
                      {message.content}
                    </p>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-2 flex gap-2">
                        {message.attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded">
                            <ImageIcon className="w-3 h-3" />
                            {attachment.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex items-end gap-3">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-slate-600" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <ImageIcon className="w-5 h-5 text-slate-600" />
                </button>
                <div className="flex-1 relative">
                  <textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={1}
                  />
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-slate-600" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sending}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Select a conversation to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OmnichannelMessaging;
