/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import {
  Cake,
  Calendar,
  Utensils,
  Package,
  User,
  Clock,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Wine,
  X,
  FileText
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface BanquetEvent {
  id: string;
  event_name: string;
  event_date: string;
  client_name: string;
  guest_count: number;
  menu_package: string | null;
  room_setup: string | null;
  payment_terms: string | null;
  status: 'Draft' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled';
  estimated_revenue: number;
  actual_revenue: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function BanquetCatering() {
  const { formatAmount, addNotification } = useERP();
  const [activeTab, setActiveTab] = useState<'events' | 'planning' | 'costing'>('events');
  const [events, setEvents] = useState<BanquetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BanquetEvent | null>(null);
  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    client_name: '',
    guest_count: 0,
    menu_package: '',
    room_setup: '',
    payment_terms: '',
    status: 'Draft' as 'Draft' | 'Confirmed' | 'InProgress' | 'Completed' | 'Cancelled',
    estimated_revenue: 0,
    notes: ''
  });

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fb/banquet-events');
      if (!response.ok) throw new Error('Failed to fetch events');
      const data = await response.json();
      setEvents(data.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      addNotification('Failed to load banquet events', 'warning', 'F&B');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormData({
      event_name: '',
      event_date: '',
      client_name: '',
      guest_count: 0,
      menu_package: '',
      room_setup: '',
      payment_terms: '',
      status: 'Draft',
      estimated_revenue: 0,
      notes: ''
    });
    setShowModal(true);
  };

  const handleEditEvent = (event: BanquetEvent) => {
    setEditingEvent(event);
    setFormData({
      event_name: event.event_name,
      event_date: event.event_date,
      client_name: event.client_name,
      guest_count: event.guest_count,
      menu_package: event.menu_package || '',
      room_setup: event.room_setup || '',
      payment_terms: event.payment_terms || '',
      status: event.status,
      estimated_revenue: event.estimated_revenue,
      notes: event.notes || ''
    });
    setShowModal(true);
  };

  const handleSaveEvent = async () => {
    try {
      const url = editingEvent 
        ? `/api/fb/banquet-events/${editingEvent.id}`
        : '/api/fb/banquet-events';
      
      const method = editingEvent ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save event');

      addNotification(editingEvent ? 'Event updated successfully' : 'Event created successfully', 'success', 'F&B');
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      addNotification('Failed to save event', 'warning', 'F&B');
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const response = await fetch(`/api/fb/banquet-events/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete event');

      addNotification('Event deleted successfully', 'success', 'F&B');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      addNotification('Failed to delete event', 'warning', 'F&B');
    }
  };

  // Calculate KPIs from real data
  const activeEvents = events.filter(e => e.status === 'Confirmed' || e.status === 'InProgress').length;
  const upcomingEvents = events.filter(e => new Date(e.event_date) >= new Date() && e.status !== 'Completed' && e.status !== 'Cancelled').length;
  const totalRevenue = events.reduce((sum, e) => sum + (e.actual_revenue || 0), 0);
  const avgProfit = events.length > 0 ? ((events.reduce((sum, e) => sum + (e.actual_revenue || 0), 0) - events.reduce((sum, e) => sum + (e.estimated_revenue * 0.78 || 0), 0)) / events.length * 100) : 0;

  const tabs = [
    { id: 'events', label: 'Events', icon: Cake },
    { id: 'planning', label: 'Event Planning', icon: Calendar },
    { id: 'costing', label: 'Costing', icon: DollarSign },
  ];

  const eventPlanningItems = [
    { id: 'menu-packages', name: 'Menu Packages', icon: Utensils },
    { id: 'buffet', name: 'Buffet Planning', icon: Utensils },
    { id: 'beverage', name: 'Beverage Packages', icon: Wine },
    { id: 'equipment', name: 'Equipment', icon: Package },
    { id: 'staffing', name: 'Staffing', icon: User },
    { id: 'timeline', name: 'Timeline', icon: Clock },
    { id: 'function-sheet', name: 'Function Sheet', icon: FileText },
  ];

  const costingItems = [
    { id: 'estimated-cost', name: 'Estimated Cost', icon: DollarSign },
    { id: 'actual-cost', name: 'Actual Cost', icon: DollarSign },
    { id: 'revenue', name: 'Revenue', icon: TrendingUp },
    { id: 'gross-profit', name: 'Gross Profit', icon: TrendingUp },
    { id: 'profitability', name: 'Event Profitability', icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Banquet & Catering</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Event management and catering services</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchEvents} className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button onClick={handleCreateEvent} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span>New Event</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Active Events" value={String(activeEvents)} icon={Calendar} color="indigo" />
        <KPICard label="Upcoming" value={String(upcomingEvents)} icon={Clock} color="amber" />
        <KPICard label="Total Revenue" value={formatAmount(totalRevenue)} icon={DollarSign} color="green" />
        <KPICard label="Avg Event Profit" value={`${avgProfit.toFixed(0)}%`} icon={TrendingUp} color="purple" />
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'events' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Cake className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No events found</p>
                <p className="text-xs mt-1">Click "New Event" to create your first banquet event</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                          <Cake className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{event.event_name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{event.client_name} • {event.guest_count} guests • {new Date(event.event_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          event.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                          event.status === 'InProgress' ? 'bg-blue-100 text-blue-700' :
                          event.status === 'Completed' ? 'bg-slate-100 text-slate-700' :
                          event.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{event.status}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{formatAmount(event.actual_revenue || event.estimated_revenue)}</span>
                        <button onClick={() => handleEditEvent(event)} className="p-1 text-slate-400 hover:text-indigo-600">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteEvent(event.id)} className="p-1 text-slate-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'planning' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {eventPlanningItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                        <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Planning Item</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Event Planning module</p>
              <p className="text-xs mt-1">Menu packages, buffet planning, equipment, staffing, and timeline</p>
            </div>
          </div>
        )}

        {activeTab === 'costing' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {costingItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition cursor-pointer">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-2">
                        <Icon className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Costing</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Event Costing module</p>
              <p className="text-xs mt-1">Track estimated costs, actual costs, revenue, and profitability</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Panel */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-xl p-6 border border-pink-200 dark:border-pink-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Cake className="w-5 h-5 text-pink-600 dark:text-pink-400" />
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Create Event</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Book new banquet event</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Function Sheet</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Generate function sheet</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-slate-900 dark:text-white">Cost Analysis</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">View event profitability</p>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingEvent ? 'Edit Event' : 'New Event'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Name</label>
                <input
                  type="text"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Name</label>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Guest Count</label>
                <input
                  type="number"
                  value={formData.guest_count}
                  onChange={(e) => setFormData({ ...formData, guest_count: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Menu Package</label>
                <input
                  type="text"
                  value={formData.menu_package}
                  onChange={(e) => setFormData({ ...formData, menu_package: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Room Setup</label>
                <input
                  type="text"
                  value={formData.room_setup}
                  onChange={(e) => setFormData({ ...formData, room_setup: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Revenue</label>
                <input
                  type="number"
                  value={formData.estimated_revenue}
                  onChange={(e) => setFormData({ ...formData, estimated_revenue: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Draft">Draft</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="InProgress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveEvent}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper Components
function KPICard({ label, value, icon: Icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
