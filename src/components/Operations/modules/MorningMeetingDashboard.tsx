/**
 * Morning Meeting Dashboard
 * Agenda items for daily morning meetings
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Star,
  AlertTriangle,
  Wrench,
  Bed,
  Utensils,
  Briefcase,
  DollarSign,
  CheckSquare,
  Clock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface AgendaItem {
  id: string;
  category: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  estimatedTime?: number;
  notes?: string;
}

interface MeetingData {
  date: string;
  previousDayPerformance: {
    occupancy: number;
    revenue: number;
    adr: number;
    satisfaction: number;
  };
  todaysOccupancy: {
    expected: number;
    arrivals: number;
    departures: number;
    vipArrivals: number;
  };
  agendaItems: AgendaItem[];
}

const MorningMeetingDashboard: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingData, setMeetingData] = useState<MeetingData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [newItem, setNewItem] = useState<Partial<AgendaItem>>({
    category: 'General',
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending'
  });

  const mockMeetingData: MeetingData = {
    date: selectedDate,
    previousDayPerformance: {
      occupancy: 78,
      revenue: 45230,
      adr: 285,
      satisfaction: 4.6
    },
    todaysOccupancy: {
      expected: 82,
      arrivals: 124,
      departures: 98,
      vipArrivals: 8
    },
    agendaItems: [
      {
        id: '1',
        category: 'Performance',
        title: 'Previous Day Performance Review',
        description: 'Review yesterday\'s occupancy, revenue, and guest satisfaction metrics',
        status: 'pending',
        priority: 'high',
        estimatedTime: 10
      },
      {
        id: '2',
        category: 'Operations',
        title: 'Today\'s Occupancy',
        description: 'Review expected occupancy, arrivals, and departures for today',
        status: 'pending',
        priority: 'high',
        estimatedTime: 5
      },
      {
        id: '3',
        category: 'VIP',
        title: 'VIP Guests',
        description: 'Review VIP arrivals and special requirements',
        status: 'pending',
        priority: 'high',
        estimatedTime: 5
      },
      {
        id: '4',
        category: 'Guest Experience',
        title: 'Guest Complaints',
        description: 'Review open complaints and resolution status',
        status: 'pending',
        priority: 'high',
        estimatedTime: 10
      },
      {
        id: '5',
        category: 'Maintenance',
        title: 'Maintenance Updates',
        description: 'Review ongoing maintenance issues and planned work',
        status: 'pending',
        priority: 'medium',
        estimatedTime: 5
      },
      {
        id: '6',
        category: 'Housekeeping',
        title: 'Housekeeping Status',
        description: 'Review cleaning progress and room readiness',
        status: 'pending',
        priority: 'medium',
        estimatedTime: 5
      },
      {
        id: '7',
        category: 'Events',
        title: 'Event Schedule',
        description: 'Review today\'s events and departmental responsibilities',
        status: 'pending',
        priority: 'medium',
        estimatedTime: 5
      },
      {
        id: '8',
        category: 'Staffing',
        title: 'Staffing Issues',
        description: 'Discuss any staffing gaps or coverage issues',
        status: 'pending',
        priority: 'medium',
        estimatedTime: 5
      },
      {
        id: '9',
        category: 'Revenue',
        title: 'Revenue Update',
        description: 'Review revenue performance against forecast',
        status: 'pending',
        priority: 'high',
        estimatedTime: 5
      },
      {
        id: '10',
        category: 'Action Items',
        title: 'Action Items',
        description: 'Review and assign action items from previous meeting',
        status: 'pending',
        priority: 'high',
        estimatedTime: 10
      }
    ]
  };

  useEffect(() => {
    loadMeetingData();
  }, [selectedDate]);

  const loadMeetingData = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setMeetingData(mockMeetingData);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const updateItemStatus = (itemId: string, status: AgendaItem['status']) => {
    if (!meetingData) return;
    setMeetingData({
      ...meetingData,
      agendaItems: meetingData.agendaItems.map(item =>
        item.id === itemId ? { ...item, status } : item
      )
    });
  };

  const deleteItem = (itemId: string) => {
    if (!meetingData) return;
    setMeetingData({
      ...meetingData,
      agendaItems: meetingData.agendaItems.filter(item => item.id !== itemId)
    });
  };

  const addNewItem = () => {
    if (!newItem.title || !meetingData) return;
    
    const item: AgendaItem = {
      id: Date.now().toString(),
      category: newItem.category || 'General',
      title: newItem.title,
      description: newItem.description || '',
      status: 'pending',
      priority: newItem.priority || 'medium',
      estimatedTime: newItem.estimatedTime
    };

    setMeetingData({
      ...meetingData,
      agendaItems: [...meetingData.agendaItems, item]
    });

    setNewItem({
      category: 'General',
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending'
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Performance':
        return TrendingUp;
      case 'Operations':
        return Briefcase;
      case 'VIP':
        return Star;
      case 'Guest Experience':
        return Users;
      case 'Maintenance':
        return Wrench;
      case 'Housekeeping':
        return Bed;
      case 'Events':
        return Calendar;
      case 'Staffing':
        return Users;
      case 'Revenue':
        return DollarSign;
      case 'Action Items':
        return CheckSquare;
      default:
        return Briefcase;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'medium':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'low':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'pending':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  if (!meetingData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <Clock size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading meeting data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Users size={28} />
            Morning Meeting Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Daily morning meeting agenda and notes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            {isEditing ? <Save size={18} /> : <Edit size={18} />}
            {isEditing ? 'Save Changes' : 'Edit Agenda'}
          </button>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={18} className="text-emerald-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Yesterday Occupancy</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {meetingData.previousDayPerformance.occupancy}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-emerald-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Yesterday Revenue</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${meetingData.previousDayPerformance.revenue.toLocaleString()}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-blue-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Today Expected</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {meetingData.todaysOccupancy.expected}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-amber-500" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">VIP Arrivals</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {meetingData.todaysOccupancy.vipArrivals}
          </p>
        </div>
      </div>

      {/* Agenda Items */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CheckSquare size={18} />
            Meeting Agenda
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {meetingData.agendaItems.filter(item => item.status === 'completed').length} / {meetingData.agendaItems.length} completed
            </span>
          </div>
        </div>
        
        <div className="p-4 space-y-2">
          {meetingData.agendaItems.map((item) => {
            const Icon = getCategoryIcon(item.category);
            const isExpanded = expandedItems.has(item.id);
            
            return (
              <div
                key={item.id}
                className={`border rounded-lg transition-all ${
                  item.status === 'completed' 
                    ? 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 opacity-60'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => updateItemStatus(item.id, item.status === 'completed' ? 'pending' : 'completed')}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        item.status === 'completed'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                      }`}
                    >
                      {item.status === 'completed' && <CheckSquare size={12} />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Icon size={16} className="text-slate-500" />
                          <span className="text-xs font-mono uppercase text-slate-500 font-bold">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                          {item.estimatedTime && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Clock size={12} />
                              {item.estimatedTime}m
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="font-semibold text-slate-900 dark:text-white mt-1">
                        {item.title}
                      </h4>
                      
                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {item.description}
                          </p>
                          {item.assignedTo && (
                            <p className="text-xs text-slate-500 dark:text-slate-500">
                              Assigned to: {item.assignedTo}
                            </p>
                          )}
                          {item.notes && (
                            <div className="p-2 bg-slate-50 dark:bg-slate-900/50 rounded text-xs text-slate-600 dark:text-slate-400">
                              <strong>Notes:</strong> {item.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      {isEditing && (
                        <button
                          onClick={() => deleteItem(item.id)}
                          className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded transition-colors text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Item */}
        {isEditing && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
            <h4 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Plus size={16} />
              Add Agenda Item
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <select
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="General">General</option>
                <option value="Performance">Performance</option>
                <option value="Operations">Operations</option>
                <option value="VIP">VIP</option>
                <option value="Guest Experience">Guest Experience</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Events">Events</option>
                <option value="Staffing">Staffing</option>
                <option value="Revenue">Revenue</option>
                <option value="Action Items">Action Items</option>
              </select>
              
              <select
                value={newItem.priority}
                onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as any })}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <input
                type="text"
                placeholder="Item title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              
              <input
                type="number"
                placeholder="Estimated time (minutes)"
                value={newItem.estimatedTime || ''}
                onChange={(e) => setNewItem({ ...newItem, estimatedTime: parseInt(e.target.value) || undefined })}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
              />
              
              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none md:col-span-2 resize-none"
                rows={2}
              />
              
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => setNewItem({
                    category: 'General',
                    title: '',
                    description: '',
                    priority: 'medium',
                    status: 'pending'
                  })}
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewItem}
                  disabled={!newItem.title}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MorningMeetingDashboard;