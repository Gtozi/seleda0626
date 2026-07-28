/**
 * Webhook Manager
 * Manage webhook subscriptions, event tracking, and delivery monitoring
 */

import React, { useState } from 'react';
import {
  Webhook,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Settings,
  RefreshCw,
  Eye,
  Filter,
  ChevronRight,
  Play,
  Pause,
  X
} from 'lucide-react';

interface WebhookSubscription {
  subscriptionId: string;
  name: string;
  endpoint: string;
  events: string[];
  secret: string;
  active: boolean;
  lastTriggered?: string;
  lastSuccess?: string;
  lastFailure?: string;
  totalDeliveries: number;
  successRate: number;
  retryAttempts: number;
  createdAt: string;
}

interface WebhookEvent {
  eventId: string;
  subscriptionId: string;
  eventType: string;
  payload: any;
  status: 'success' | 'failed' | 'pending' | 'retrying';
  statusCode?: number;
  attempt: number;
  maxAttempts: number;
  timestamp: string;
  responseTime?: number;
}

const availableEvents = [
  'reservation.created',
  'reservation.updated',
  'reservation.cancelled',
  'reservation.checked_in',
  'reservation.checked_out',
  'guest.created',
  'guest.updated',
  'payment.completed',
  'payment.failed',
  'room.status_changed',
  'housekeeping.task_completed'
];

const mockSubscriptions: WebhookSubscription[] = [
  {
    subscriptionId: 'wh_001',
    name: 'CRM Integration',
    endpoint: 'https://crm.example.com/webhook',
    events: ['reservation.created', 'reservation.updated', 'guest.created'],
    secret: 'whsec_xxxxxxxxxxxx',
    active: true,
    lastTriggered: '2026-06-20T14:32:00Z',
    lastSuccess: '2026-06-20T14:32:00Z',
    lastFailure: '2026-06-18T09:15:00Z',
    totalDeliveries: 1524,
    successRate: 98.5,
    retryAttempts: 3,
    createdAt: '2026-01-10'
  },
  {
    subscriptionId: 'wh_002',
    name: 'Accounting System',
    endpoint: 'https://accounting.example.com/api/webhooks',
    events: ['payment.completed', 'payment.failed', 'reservation.checked_out'],
    secret: 'whsec_yyyyyyyyyyyy',
    active: true,
    lastTriggered: '2026-06-20T15:45:00Z',
    lastSuccess: '2026-06-20T15:45:00Z',
    totalDeliveries: 892,
    successRate: 99.2,
    retryAttempts: 5,
    createdAt: '2026-02-15'
  },
  {
    subscriptionId: 'wh_003',
    name: 'Analytics Pipeline',
    endpoint: 'https://analytics.example.com/ingest',
    events: ['reservation.created', 'reservation.updated', 'reservation.cancelled'],
    secret: 'whsec_zzzzzzzzzzzz',
    active: false,
    lastTriggered: '2026-06-15T10:20:00Z',
    totalDeliveries: 456,
    successRate: 95.0,
    retryAttempts: 3,
    createdAt: '2026-03-20'
  }
];

const mockEvents: WebhookEvent[] = [
  {
    eventId: 'evt_001',
    subscriptionId: 'wh_001',
    eventType: 'reservation.created',
    payload: { reservationId: 'RES-12345', guestId: 'GUEST-001', checkIn: '2026-06-25' },
    status: 'success',
    statusCode: 200,
    attempt: 1,
    maxAttempts: 3,
    timestamp: '2026-06-20T14:32:00Z',
    responseTime: 124
  },
  {
    eventId: 'evt_002',
    subscriptionId: 'wh_002',
    eventType: 'payment.completed',
    payload: { paymentId: 'PAY-67890', amount: 450.00, currency: 'USD' },
    status: 'success',
    statusCode: 200,
    attempt: 1,
    maxAttempts: 5,
    timestamp: '2026-06-20T15:45:00Z',
    responseTime: 89
  },
  {
    eventId: 'evt_003',
    subscriptionId: 'wh_001',
    eventType: 'guest.created',
    payload: { guestId: 'GUEST-002', name: 'John Smith', email: 'john@example.com' },
    status: 'failed',
    statusCode: 500,
    attempt: 3,
    maxAttempts: 3,
    timestamp: '2026-06-20T16:10:00Z',
    responseTime: 2340
  },
  {
    eventId: 'evt_004',
    subscriptionId: 'wh_002',
    eventType: 'reservation.checked_out',
    payload: { reservationId: 'RES-54321', folioTotal: 1250.00 },
    status: 'success',
    statusCode: 200,
    attempt: 1,
    maxAttempts: 5,
    timestamp: '2026-06-20T17:30:00Z',
    responseTime: 156
  }
];

export default function WebhookManager() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'events'>('subscriptions');
  const [selectedSubscription, setSelectedSubscription] = useState<WebhookSubscription | null>(null);
  const [showEventDetails, setShowEventDetails] = useState<WebhookEvent | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'active':
        return <CheckCircle size={14} className="text-emerald-500" />;
      case 'failed':
      case 'inactive':
        return <XCircle size={14} className="text-rose-500" />;
      case 'pending':
      case 'retrying':
        return <Clock size={14} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'failed':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'retrying':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  const toggleSubscriptionStatus = (subscriptionId: string) => {
    console.log('Toggle subscription:', subscriptionId);
  };

  const testWebhook = (subscriptionId: string) => {
    console.log('Test webhook:', subscriptionId);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="webhook-manager">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Webhook Manager</h2>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
          <Plus size={14} /> New Subscription
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Webhook size={20} className="text-purple-500" />
            <span className="text-xs font-bold text-emerald-500">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {mockSubscriptions.filter(s => s.active).length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Subscriptions</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Activity size={20} className="text-blue-500" />
            <span className="text-xs font-bold text-emerald-500">Today</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">{mockEvents.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Events Delivered</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle size={20} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500">98.5%</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Success Rate</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Delivery</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Clock size={20} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-500">1</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Retrying</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Pending Events</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-3xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'subscriptions'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Webhook size={14} /> Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity size={14} /> Event Log
          </button>
        </div>
      </div>

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Webhook Subscriptions</h3>
            <div className="space-y-3">
              {mockSubscriptions.map((subscription) => (
                <div
                  key={subscription.subscriptionId}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Webhook size={20} className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{subscription.name}</h4>
                          {getStatusIcon(subscription.active ? 'active' : 'inactive')}
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{subscription.subscriptionId}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSubscriptionStatus(subscription.subscriptionId)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                      >
                        {subscription.active ? <Pause size={14} className="text-slate-500" /> : <Play size={14} className="text-slate-500" />}
                      </button>
                      <button
                        onClick={() => testWebhook(subscription.subscriptionId)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg"
                      >
                        <RefreshCw size={14} className="text-slate-500" />
                      </button>
                      <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
                        <Settings size={14} className="text-slate-500" />
                      </button>
                      <button className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-lg">
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-3">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Endpoint</span>
                      <div className="font-bold text-slate-900 dark:text-white truncate">{subscription.endpoint}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Success Rate</span>
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">{subscription.successRate}%</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Total Deliveries</span>
                      <div className="font-bold text-slate-900 dark:text-white">{subscription.totalDeliveries}</div>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Last Triggered</span>
                      <div className="font-bold text-slate-900 dark:text-white">{new Date(subscription.lastTriggered || '').toLocaleString()}</div>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 mb-2 block">Events</span>
                    <div className="flex flex-wrap gap-2">
                      {subscription.events.map((event) => (
                        <span key={event} className="px-2 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg text-[10px] font-mono text-slate-600 dark:text-slate-400">
                          {event}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Log</h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1">
                  <Filter size={12} /> Filter
                </button>
                <button className="px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {mockEvents.map((event) => (
                <div
                  key={event.eventId}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-purple-500 transition-all cursor-pointer"
                  onClick={() => setShowEventDetails(event)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(event.status)}
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{event.eventType}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(event.timestamp).toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">Attempt {event.attempt}/{event.maxAttempts}</div>
                        {event.responseTime && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{event.responseTime}ms</div>
                        )}
                      </div>
                      {event.statusCode && (
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${
                          event.statusCode >= 200 && event.statusCode < 300
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                        }`}>
                          {event.statusCode}
                        </span>
                      )}
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-3xs max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Details</h3>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Event ID</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{showEventDetails.eventId}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(showEventDetails.status)}
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${getStatusBadge(showEventDetails.status)}`}>
                        {showEventDetails.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Event Type</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">{showEventDetails.eventType}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Timestamp</span>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                      {new Date(showEventDetails.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mb-2">Payload</span>
                  <pre className="p-4 bg-slate-100 dark:bg-slate-950 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 overflow-x-auto">
                    {JSON.stringify(showEventDetails.payload, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
