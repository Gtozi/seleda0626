/**
 * Meetings & Events Module
 * Submit inquiries for conferences, meetings, seminars, exhibitions, and corporate events
 */

import { useState } from 'react';
import { Building, Users, Calendar, MapPin, Send, Check } from 'lucide-react';

const MeetingsEventsModule: React.FC = () => {
  const [formData, setFormData] = useState({
    eventType: '',
    attendees: '',
    startDate: '',
    endDate: '',
    requirements: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    company: ''
  });

  const eventTypes = [
    { id: 'conference', label: 'Conference', icon: <Users size={24} /> },
    { id: 'meeting', label: 'Meeting', icon: <Building size={24} /> },
    { id: 'seminar', label: 'Seminar', icon: <Calendar size={24} /> },
    { id: 'exhibition', label: 'Exhibition', icon: <Building size={24} /> },
    { id: 'corporate', label: 'Corporate Event', icon: <Users size={24} /> }
  ];

  const venues = [
    { name: 'Grand Ballroom', capacity: 500, features: ['Projector', 'Sound System', 'Stage'] },
    { name: 'Conference Room A', capacity: 50, features: ['TV', 'Whiteboard', 'Video Conferencing'] },
    { name: 'Garden Pavilion', capacity: 200, features: ['Natural Light', 'Outdoor Space', 'Flexible Layout'] }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Meeting inquiry submitted:', formData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Meetings & Events</h1>
        <p className="text-lg opacity-90">Plan your perfect event with our versatile venues and professional services</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Type Selection */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Event Type</h2>
          <div className="grid grid-cols-2 gap-3">
            {eventTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setFormData({ ...formData, eventType: type.id })}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  formData.eventType === type.id
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-indigo-600">{type.icon}</div>
                  <span className="font-medium text-slate-900 dark:text-white">{type.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Venue Information */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Our Venues</h2>
          <div className="space-y-4">
            {venues.map((venue, idx) => (
              <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{venue.name}</h3>
                  <span className="text-sm text-slate-600 dark:text-slate-400">Up to {venue.capacity} guests</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {venue.features.map((feature, fIdx) => (
                    <span key={fIdx} className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Submit Inquiry</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company</label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Number of Attendees</label>
              <input
                type="number"
                value={formData.attendees}
                onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Preferred Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Special Requirements</label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
              placeholder="Tell us about your event requirements..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Submit Inquiry
          </button>
        </form>
      </div>
    </div>
  );
};

export default MeetingsEventsModule;