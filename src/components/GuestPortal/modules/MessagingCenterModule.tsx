/**
 * Messaging Center Module
 * Communicate with front desk, concierge, housekeeping, restaurant, spa, hotel operator
 */

import { useState } from 'react';
import {
  MessageSquare,
  Send,
  Phone,
  Users,
  UtensilsCrossed,
  Sparkles,
  Bell,
  Plus,
  Search,
  Clock,
  CheckCircle2
} from 'lucide-react';

interface MessagingCenterModuleProps {
  reservationId?: string;
}

interface Message {
  id: string;
  department: string;
  sender: 'Guest' | 'Hotel';
  content: string;
  timestamp: string;
  status: 'sent' | 'read';
}

interface Conversation {
  id: string;
  department: string;
  departmentIcon: any;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'active' | 'closed';
}

const MessagingCenterModule: React.FC<MessagingCenterModuleProps> = ({
  reservationId
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'CONV-001',
      department: 'Front Desk',
      departmentIcon: <Bell size={20} />,
      lastMessage: 'Your room is ready for early check-in',
      lastMessageTime: '2026-08-15T14:30:00',
      unreadCount: 1,
      status: 'active'
    },
    {
      id: 'CONV-002',
      department: 'Concierge',
      departmentIcon: <Users size={20} />,
      lastMessage: 'Your airport transfer has been confirmed',
      lastMessageTime: '2026-08-15T10:00:00',
      unreadCount: 0,
      status: 'active'
    }
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'MSG-001',
      department: 'Front Desk',
      sender: 'Hotel',
      content: 'Welcome to SELEDA Grand Hotel! Your room is ready for early check-in.',
      timestamp: '2026-08-15T14:30:00',
      status: 'read'
    },
    {
      id: 'MSG-002',
      department: 'Front Desk',
      sender: 'Guest',
      content: 'Thank you! I will be there around 3 PM.',
      timestamp: '2026-08-15T14:35:00',
      status: 'read'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [showNewConversationModal, setShowNewConversationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const departments = [
    { id: 'front-desk', name: 'Front Desk', icon: <Bell size={20} /> },
    { id: 'concierge', name: 'Concierge', icon: <Users size={20} /> },
    { id: 'housekeeping', name: 'Housekeeping', icon: <Sparkles size={20} /> },
    { id: 'restaurant', name: 'Restaurant', icon: <UtensilsCrossed size={20} /> },
    { id: 'spa', name: 'Spa', icon: <Sparkles size={20} /> },
    { id: 'operator', name: 'Hotel Operator', icon: <Phone size={20} /> }
  ];

  const filteredConversations = conversations.filter(conv => 
    conv.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: `MSG-${String(messages.length + 1).padStart(3, '0')}`,
      department: selectedConversation.department,
      sender: 'Guest',
      content: newMessage,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage('');
  };

  const handleStartConversation = (departmentId: string) => {
    const dept = departments.find(d => d.id === departmentId);
    if (!dept) return;

    const newConversation: Conversation = {
      id: `CONV-${String(conversations.length + 1).padStart(3, '0')}`,
      department: dept.name,
      departmentIcon: dept.icon,
      lastMessage: 'New conversation',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      status: 'active'
    };

    setConversations([...conversations, newConversation]);
    setSelectedConversation(newConversation);
    setShowNewConversationModal(false);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messaging Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Communicate with hotel departments
          </p>
        </div>
        <button
          onClick={() => setShowNewConversationModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Message
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-2">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setSelectedConversation(conversation)}
                className={`w-full p-3 rounded-lg text-left transition ${
                  selectedConversation?.id === conversation.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700/50'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/20 border border-transparent'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                    {conversation.departmentIcon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">{conversation.department}</h4>
                      {conversation.unreadCount > 0 && (
                        <div className="w-5 h-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{conversation.lastMessage}</p>
                    <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {new Date(conversation.lastMessageTime).toLocaleString()}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {selectedConversation.departmentIcon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{selectedConversation.department}</h3>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 size={12} />
                      <span>Online</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages
                  .filter(msg => msg.department === selectedConversation.department)
                  .map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'Guest' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      message.sender === 'Guest'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className={`flex items-center gap-1 mt-1 text-xs ${
                        message.sender === 'Guest' ? 'text-indigo-200' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        <Clock size={10} />
                        <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto text-slate-400 mb-4" />
                <p className="text-slate-600 dark:text-slate-400">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Start New Conversation</h3>
            <div className="grid grid-cols-2 gap-4">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => handleStartConversation(dept.id)}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-left"
                >
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                    {dept.icon}
                  </div>
                  <div className="font-medium text-slate-900 dark:text-white">{dept.name}</div>
                </button>
              ))}
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowNewConversationModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagingCenterModule;
