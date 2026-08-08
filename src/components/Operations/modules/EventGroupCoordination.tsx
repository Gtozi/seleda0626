/**
 * Event & Group Coordination
 * Track conferences, weddings, and group events
 */

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Search,
  Filter,
  Plus,
  ChevronRight,
  MapPin,
  Clock,
  Utensils,
  CheckCircle2
} from 'lucide-react';

interface Event {
  id: string;
  name: string;
  type: 'conference' | 'wedding' | 'banquet' | 'group-checkin' | 'group-checkout';
  date: string;
  location: string;
  attendees: number;
  status: 'planning' | 'setup' | 'in-progress' | 'completed' | 'cleanup';
  departments: string[];
  coordinator: string;
}

const EventGroupCoordination: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'conference' | 'wedding' | 'banquet' | 'group'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<Event[]>([]);

  const mockEvents: Event[] = [
    {
      id: '1',
      name: 'TechCorp Annual Conference',
      type: 'conference',
      date: '2026-08-15',
      location: 'Grand Ballroom',
      attendees: 200,
      status: 'planning',
      departments: ['Front Office', 'F&B', 'Events', 'Engineering', 'IT', 'Security'],
      coordinator: 'Jessica Martinez'
    },
    {
      id: '2',
      name: 'Johnson Wedding Reception',
      type: 'wedding',
      date: '2026-07-31',
      location: 'Garden Terrace',
      attendees: 150,
      status: 'setup',
      departments: ['F&B', 'Events', 'Housekeeping', 'Engineering'],
      coordinator: 'Sarah Johnson'
    },
    {
      id: '3',
      name: 'ABC Company Annual Dinner',
      type: 'banquet',
      date: '2026-08-20',
      location: 'Restaurant',
      attendees: 80,
      status: 'planning',
      departments: ['F&B', 'Events'],
      coordinator: 'David Lee'
    },
    {
      id: '4',
      name: 'Tour Group Check-in - 45 rooms',
      type: 'group-checkin',
      date: '2026-08-10',
      location: 'Front Desk',
      attendees: 90,
      status: 'planning',
      departments: ['Front Office', 'Housekeeping', 'Bell Services'],
      coordinator: 'John Smith'
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'group' ? ['group-checkin', 'group-checkout'].includes(event.type) : event.type === selectedFilter);
    const matchesSearch = searchQuery === '' || 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'setup':
      case 'cleanup':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'planning':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar size={28} />
            Event & Group Coordination
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track conferences, weddings, and group events</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add Event
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Events</option>
          <option value="conference">Conferences</option>
          <option value="wedding">Weddings</option>
          <option value="banquet">Banquets</option>
          <option value="group">Group Check-in/out</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <h4 className="font-semibold text-slate-900 dark:text-white mt-2">{event.name}</h4>
                <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {event.location}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users size={14} />
                    {event.attendees} attendees
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={14} />
                    {event.coordinator}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Departments:</p>
              <div className="flex flex-wrap gap-1">
                {event.departments.map((dept, index) => (
                  <span key={index} className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventGroupCoordination;