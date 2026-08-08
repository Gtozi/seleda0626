/**
 * Operational Calendar
 * Central planning calendar for hotel operations
 */

import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  MapPin,
  Users,
  Star,
  Wrench,
  Flame,
  Award,
  Briefcase,
  Clock,
  Heart,
  X
} from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'conference' | 'wedding' | 'holiday' | 'vip' | 'maintenance' | 'promotion' | 'drill' | 'training' | 'audit';
  location?: string;
  attendees?: number;
  description?: string;
}

const OperationalCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'conference' | 'wedding' | 'holiday' | 'vip' | 'maintenance' | 'other'>('all');

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'TechCorp Annual Conference',
      date: '2026-08-15',
      type: 'conference',
      location: 'Grand Ballroom',
      attendees: 200,
      description: 'Annual technology conference with 200 attendees'
    },
    {
      id: '2',
      title: 'Johnson Wedding Reception',
      date: '2026-07-31',
      type: 'wedding',
      location: 'Garden Terrace',
      attendees: 150,
      description: 'Wedding reception for Johnson family'
    },
    {
      id: '3',
      title: 'Public Holiday - Independence Day',
      date: '2026-07-04',
      type: 'holiday',
      description: 'National holiday - expect high occupancy'
    },
    {
      id: '4',
      title: 'VVIP Visit - Ambassador',
      date: '2026-08-20',
      type: 'vip',
      location: 'Presidential Suite',
      description: 'Diplomatic visit requiring enhanced security'
    },
    {
      id: '5',
      title: 'Pool Maintenance Shutdown',
      date: '2026-08-01',
      type: 'maintenance',
      location: 'Pool Area',
      description: 'Annual pool maintenance and cleaning'
    },
    {
      id: '6',
      title: 'Summer Promotion Launch',
      date: '2026-08-10',
      type: 'promotion',
      description: 'Start of summer promotional campaign'
    },
    {
      id: '7',
      title: 'Fire Drill - All Staff',
      date: '2026-08-05',
      type: 'drill',
      description: 'Mandatory fire safety drill for all departments'
    },
    {
      id: '8',
      title: 'Customer Service Training',
      date: '2026-08-12',
      type: 'training',
      location: 'Conference Room B',
      description: 'Customer service excellence training for front desk staff'
    },
    {
      id: '9',
      title: 'Quality Audit - Housekeeping',
      date: '2026-08-18',
      type: 'audit',
      description: 'Quarterly quality audit of housekeeping standards'
    }
  ];

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'conference':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'wedding':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800';
      case 'holiday':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'vip':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'maintenance':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      case 'promotion':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'drill':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'training':
        return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
      case 'audit':
        return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'conference':
        return Users;
      case 'wedding':
        return Heart;
      case 'holiday':
        return Award;
      case 'vip':
        return Star;
      case 'maintenance':
        return Wrench;
      case 'promotion':
        return Briefcase;
      case 'drill':
        return Flame;
      case 'training':
        return Briefcase;
      case 'audit':
        return Award;
      default:
        return Calendar;
    }
  };

  const filteredEvents = mockEvents.filter(event => 
    selectedFilter === 'all' || event.type === selectedFilter
  );

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-slate-50 dark:bg-slate-900/50" />);
    }

    // Days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = filteredEvents.filter(event => event.date === dateStr);

      days.push(
        <div
          key={day}
          className="h-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-900 dark:text-white">{day}</span>
            {dayEvents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
            )}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map(event => {
              const Icon = getEventTypeIcon(event.type);
              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`text-xs p-1 rounded truncate flex items-center gap-1 ${getEventTypeColor(event.type)}`}
                >
                  <Icon size={10} />
                  {event.title}
                </div>
              );
            })}
            {dayEvents.length > 2 && (
              <div className="text-xs text-slate-500 dark:text-slate-500">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar size={28} />
            Operational Calendar
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Central planning calendar for hotel operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Plus size={18} />
            Add Event
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
            {(['month', 'week', 'day'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Events</option>
            <option value="conference">Conferences</option>
            <option value="wedding">Weddings</option>
            <option value="holiday">Holidays</option>
            <option value="vip">VIP Visits</option>
            <option value="maintenance">Maintenance</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {generateCalendarDays()}
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Event Details</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div className={`p-3 rounded-lg ${getEventTypeColor(selectedEvent.type)}`}>
                <div className="flex items-center gap-2">
                  {React.createElement(getEventTypeIcon(selectedEvent.type), { size: 18 })}
                  <span className="font-medium capitalize">{selectedEvent.type}</span>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                  {selectedEvent.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {selectedEvent.description}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-slate-500" />
                  <span className="text-slate-900 dark:text-white">
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin size={16} className="text-slate-500" />
                    <span className="text-slate-900 dark:text-white">
                      {selectedEvent.location}
                    </span>
                  </div>
                )}

                {selectedEvent.attendees && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users size={16} className="text-slate-500" />
                    <span className="text-slate-900 dark:text-white">
                      {selectedEvent.attendees} attendees
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Edit Event
                </button>
                <button className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationalCalendar;