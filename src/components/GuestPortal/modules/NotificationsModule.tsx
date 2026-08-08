/**
 * Notifications Module
 * Receive notifications for reservation, check-in, orders, transportation, reminders, promotions
 */

import { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  UtensilsCrossed,
  Car,
  Sparkles,
  AlertTriangle,
  Tag,
  Clock,
  Check,
  X
} from 'lucide-react';

interface NotificationsModuleProps {
  reservationId?: string;
}

interface Notification {
  id: string;
  type: 'Reservation' | 'CheckIn' | 'Order' | 'Transportation' | 'Restaurant' | 'Spa' | 'Checkout' | 'Promotion';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'normal' | 'high';
}

const NotificationsModule: React.FC<NotificationsModuleProps> = ({
  reservationId
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 'NOT-001',
      type: 'CheckIn',
      title: 'Check-in Ready',
      message: 'Your room is ready for check-in. Room 305 is waiting for you.',
      timestamp: '2026-08-15T14:30:00',
      read: false,
      priority: 'high'
    },
    {
      id: 'NOT-002',
      type: 'Reservation',
      title: 'Reservation Confirmed',
      message: 'Your reservation for August 15-20 has been confirmed.',
      timestamp: '2026-08-10T10:00:00',
      read: true,
      priority: 'normal'
    },
    {
      id: 'NOT-003',
      type: 'Promotion',
      title: 'Special Spa Offer',
      message: 'Get 20% off all spa treatments this weekend!',
      timestamp: '2026-08-14T09:00:00',
      read: false,
      priority: 'normal'
    },
    {
      id: 'NOT-004',
      type: 'Transportation',
      title: 'Airport Transfer Confirmed',
      message: 'Your airport transfer for August 15th at 2:00 PM has been confirmed.',
      timestamp: '2026-08-13T16:00:00',
      read: true,
      priority: 'normal'
    },
    {
      id: 'NOT-005',
      type: 'Restaurant',
      title: 'Restaurant Reminder',
      message: 'Reminder: Your table reservation at The Grand Restaurant is tomorrow at 7:00 PM.',
      timestamp: '2026-08-15T18:00:00',
      read: false,
      priority: 'high'
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'Reservation': return <Calendar size={20} />;
      case 'CheckIn': return <CheckCircle2 size={20} />;
      case 'Order': return <UtensilsCrossed size={20} />;
      case 'Transportation': return <Car size={20} />;
      case 'Restaurant': return <UtensilsCrossed size={20} />;
      case 'Spa': return <Sparkles size={20} />;
      case 'Checkout': return <AlertTriangle size={20} />;
      case 'Promotion': return <Tag size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'Reservation': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'CheckIn': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Order': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:border-orange-700/50 dark:text-orange-400',
      'Transportation': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Restaurant': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400',
      'Spa': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Checkout': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Promotion': 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-700/50 dark:text-indigo-400'
    };
    return colors[type as keyof typeof colors] || colors['Reservation'];
  };

  const getPriorityBorder = (priority: string) => {
    return priority === 'high'
      ? 'border-l-4 border-l-red-500'
      : 'border-l-4 border-l-transparent';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return filter === 'unread' ? !notification.read : notification.read;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications.filter(n => n.id !== notificationId));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay updated with your hotel notifications
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Mark all as read
            </button>
          )}
          <div className="relative">
            <Bell size={24} className="text-slate-400" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'unread'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            filter === 'read'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          Read
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 ${getPriorityBorder(notification.priority)} ${!notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(notification.type)}`}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-semibold text-slate-900 dark:text-white">{notification.title}</h4>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="p-1 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 rounded"
                      >
                        <Check size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteNotification(notification.id)}
                      className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{notification.message}</p>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Clock size={12} />
                  <span>{new Date(notification.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell size={48} className="mx-auto text-slate-400 mb-4" />
          <p className="text-slate-600 dark:text-slate-400">No notifications to display</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsModule;
