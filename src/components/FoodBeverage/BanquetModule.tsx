/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  CalendarDays, 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  Clock, 
  FileText, 
  CheckCircle2, 
  UtensilsCrossed, 
  CreditCard,
  History,
  X,
  ChevronRight
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface BanquetEvent {
  id: string;
  name: string;
  type: 'Wedding' | 'Corporate' | 'Conference' | 'Birthday' | 'Other';
  date: string;
  time: string;
  venue: string;
  guests: number;
  status: 'Draft' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
  totalQuote: number;
  contactPerson: string;
  contactPhone: string;
}

export default function BanquetModule() {
  const { formatAmount, addNotification } = useERP();
  
  const [events, setEvents] = useState<BanquetEvent[]>([
    { 
      id: 'EV-3001', 
      name: 'Regional Business Conference', 
      type: 'Conference', 
      date: '2026-06-15', 
      time: '09:00 AM - 05:00 PM', 
      venue: 'Grand Ball Room A', 
      guests: 200, 
      status: 'Confirmed', 
      totalQuote: 12500, 
      contactPerson: 'Event Planner', 
      contactPhone: '+1 555-0000' 
    },
    { 
      id: 'EV-3002', 
      name: 'Miller & Smith Wedding', 
      type: 'Wedding', 
      date: '2026-06-20', 
      time: '04:00 PM - 11:30 PM', 
      venue: 'Sky Garden Terrace', 
      guests: 120, 
      status: 'Draft', 
      totalQuote: 8200, 
      contactPerson: 'Sarah Miller', 
      contactPhone: '+1 555-1234' 
    },
  ]);

  const [searchEvent, setSearchEvent] = useState('');
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({ name: '', type: 'Corporate' as BanquetEvent['type'], date: '', guests: 0 });

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: BanquetEvent = {
      id: `EV-${Math.floor(Math.random() * 900) + 3000}`,
      name: newEvent.name,
      type: newEvent.type,
      date: newEvent.date,
      time: '09:00 AM - 05:00 PM',
      venue: 'Grand Ball Room A',
      guests: newEvent.guests,
      status: 'Confirmed',
      totalQuote: newEvent.guests * 65,
      contactPerson: 'Guest User',
      contactPhone: '+1 555-0000'
    };
    setEvents([event, ...events]);
    addNotification(`Event ${event.name} booked successfully.`, 'success', 'Banquets');
    setShowEventForm(false);
  };

  const filteredEvents = events.filter(e => 
    e.name.toLowerCase().includes(searchEvent.toLowerCase()) || 
    e.contactPerson.toLowerCase().includes(searchEvent.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">Banquet & Event Management</h3>
          <p className="text-[10px] text-slate-400">Total Bookings: {events.length} | Upcoming Events (Next 30 Days): {events.filter(e => e.status !== 'Completed').length}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search event or contact..."
              value={searchEvent}
              onChange={(e) => setSearchEvent(e.target.value)}
              className="bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-2 pl-8 rounded-lg text-xs outline-none focus:ring-1 focus:ring-indigo-500 w-48"
            />
          </div>
          <button 
            onClick={() => setShowEventForm(true)}
            className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-3xs"
          >
            <Plus size={14} /> NEW BOOKING
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEvents.map(event => (
          <div key={event.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6 shadow-3xs hover:shadow-lg transition-all animate-fade-in group relative overflow-hidden">
             {/* Gradient Accent */}
             <div className={`absolute top-0 left-0 w-1.5 h-full ${
               event.status === 'Confirmed' ? 'bg-indigo-500' :
               event.status === 'Draft' ? 'bg-amber-500' :
               event.status === 'In Progress' ? 'bg-emerald-500' :
               'bg-slate-300'
             }`} />

             <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{event.id}</span>
                    <span className={`text-[9px] font-black font-mono uppercase tracking-tighter ${
                      event.status === 'Confirmed' ? 'text-indigo-600' :
                      event.status === 'Draft' ? 'text-amber-600' :
                      'text-slate-500'
                    }`}>{event.status}</span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">{event.name}</h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <CalendarDays size={12} />
                    <span>{event.date}</span>
                    <span className="mx-1">•</span>
                    <Clock size={12} />
                    <span>{event.time}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 dark:text-white block">{formatAmount(event.totalQuote)}</span>
                  <span className="text-[10px] text-slate-400 font-mono italic">Full Service Quote</span>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4 py-4 border-y dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                   <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-500">
                      <MapPin size={16} />
                   </div>
                   <div>
                      <span className="text-[8px] font-mono text-slate-400 uppercase block font-bold">Venue Location</span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-white">{event.venue}</span>
                   </div>
                </div>
                <div className="flex items-center gap-2.5">
                   <div className="p-2 bg-slate-50 dark:bg-slate-850 rounded-xl text-slate-500">
                      <Users size={16} />
                   </div>
                   <div>
                      <span className="text-[8px] font-mono text-slate-400 uppercase block font-bold">Guaranteed Guests</span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-white">{event.guests} Pax</span>
                   </div>
                </div>
             </div>

             <div className="pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {event.contactPerson.substring(0, 2).toUpperCase()}
                   </div>
                   <div>
                      <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 block">{event.contactPerson}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{event.contactPhone}</span>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button 
                    onClick={() => addNotification('Opening Function Sheet for ' + event.id, 'info', 'Banquets')}
                    className="p-2 bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-indigo-600 rounded-xl transition shadow-3xs" 
                    title="Event Function Sheet"
                   >
                      <FileText size={18} />
                   </button>
                   <button 
                    onClick={() => addNotification('Opening Menu Planner for ' + event.id, 'info', 'Banquets')}
                    className="p-2 bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-emerald-600 rounded-xl transition shadow-3xs" 
                    title="Menu Planner"
                   >
                      <UtensilsCrossed size={18} />
                   </button>
                   <button 
                    onClick={() => addNotification('Opening Billing & Deposits for ' + event.id, 'info', 'Banquets')}
                    className="p-2 bg-slate-50 dark:bg-slate-850 text-slate-400 hover:text-slate-600 rounded-xl transition shadow-3xs" 
                    title="Billing & Deposits"
                   >
                      <CreditCard size={18} />
                   </button>
                   <button 
                    onClick={() => addNotification('Navigating to event details: ' + event.id, 'info', 'Banquets')}
                    className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-slate-900 transition shadow-2xs"
                   >
                      <ChevronRight size={18} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>
      
      {/* Event Booking Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-fade-in shadow-2xl">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[40px] shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
               <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                  <CalendarDays size={32} />
               </div>
               <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Banquet Booking</h3>
               <p className="text-slate-400 text-xs">Event Intake Wizard for Banquets and Venue Rentals</p>
            </div>
            
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest pl-1">Event Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Annual Gala"
                  value={newEvent.name}
                  onChange={e => setNewEvent({...newEvent, name: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest pl-1">Event Type</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                    className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-bold"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Corporate">Corporate</option>
                    <option value="Conference">Conference</option>
                    <option value="Birthday">Birthday</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest pl-1">Guest Count</label>
                  <input
                    required
                    type="number"
                    value={newEvent.guests}
                    onChange={e => setNewEvent({...newEvent, guests: parseInt(e.target.value)})}
                    className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-bold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black font-mono text-slate-400 uppercase tracking-widest pl-1">Date</label>
                <input
                  required
                  type="date"
                  value={newEvent.date}
                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-850 border dark:border-slate-800 p-3 rounded-2xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-sans font-bold"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
