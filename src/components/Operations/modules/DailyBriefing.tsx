/**
 * Daily Briefing
 * Generate the hotel's operational briefing
 */

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Calendar,
  Users,
  Star,
  Cloud,
  Plane,
  Briefcase,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  Download,
  Share2,
  Clock,
  MapPin,
  Utensils,
  Wrench,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface BriefingData {
  date: string;
  occupancyForecast: {
    current: number;
    expected: number;
    pickup: number;
  };
  vipArrivals: Array<{
    name: string;
    room: string;
    time: string;
    notes: string;
  }>;
  groupArrivals: Array<{
    name: string;
    rooms: number;
    guests: number;
    time: string;
  }>;
  events: Array<{
    name: string;
    time: string;
    location: string;
    type: string;
    attendees: number;
  }>;
  maintenance: Array<{
    task: string;
    location: string;
    impact: string;
  }>;
  weather: {
    condition: string;
    temperature: string;
    forecast: string;
  };
  flightDelays: Array<{
    airline: string;
    flight: string;
    delay: string;
    affectedGuests: number;
  }>;
  staffing: {
    overall: string;
    departments: Array<{
      name: string;
      status: string;
      gap: number;
    }>;
  };
  revenue: {
    yesterday: number;
    forecast: number;
    variance: number;
  };
  outstandingIssues: Array<{
    issue: string;
    department: string;
    priority: string;
  }>;
}

const DailyBriefing: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const mockBriefingData: BriefingData = {
    date: selectedDate,
    occupancyForecast: {
      current: 78,
      expected: 82,
      pickup: 4
    },
    vipArrivals: [
      {
        name: 'Mr. John Smith',
        room: 'Presidential Suite',
        time: '14:00',
        notes: 'VVIP - Requires butler service and private dining'
      },
      {
        name: 'Ms. Sarah Johnson',
        room: 'Royal Suite 301',
        time: '16:00',
        notes: 'VIP - Allergy to nuts, special amenities required'
      },
      {
        name: 'Dr. Michael Chen',
        room: 'Executive Suite 205',
        time: '18:00',
        notes: 'VIP - Late check-in expected, key to be left at reception'
      }
    ],
    groupArrivals: [
      {
        name: 'TechCorp Annual Conference',
        rooms: 45,
        guests: 90,
        time: '12:00'
      },
      {
        name: 'Johnson Family Wedding',
        rooms: 12,
        guests: 35,
        time: '15:00'
      }
    ],
    events: [
      {
        name: 'TechCorp Annual Conference',
        time: '09:00 - 18:00',
        location: 'Grand Ballroom',
        type: 'Conference',
        attendees: 200
      },
      {
        name: 'Johnson Wedding Reception',
        time: '19:00 - 23:00',
        location: 'Garden Terrace',
        type: 'Wedding',
        attendees: 150
      }
    ],
    maintenance: [
      {
        task: 'HVAC System Repair',
        location: 'Floor 3',
        impact: '12 rooms affected, fans provided'
      },
      {
        task: 'Elevator Maintenance',
        location: 'North Wing',
        impact: 'Service elevator only, minimal impact'
      }
    ],
    weather: {
      condition: 'Partly Cloudy',
      temperature: '24°C',
      forecast: 'Clearing in the afternoon, high of 26°C'
    },
    flightDelays: [
      {
        airline: 'Ethiopian Airlines',
        flight: 'ET802',
        delay: '2 hours',
        affectedGuests: 8
      }
    ],
    staffing: {
      overall: '95%',
      departments: [
        { name: 'Front Office', status: 'Fully Staffed', gap: 0 },
        { name: 'Housekeeping', status: 'Gap', gap: 3 },
        { name: 'F&B', status: 'Fully Staffed', gap: 0 },
        { name: 'Engineering', status: 'Fully Staffed', gap: 0 }
      ]
    },
    revenue: {
      yesterday: 45230,
      forecast: 48500,
      variance: 3270
    },
    outstandingIssues: [
      {
        issue: 'Room 305 water leak',
        department: 'Engineering',
        priority: 'High'
      },
      {
        issue: 'Missing amenities in VIP suite',
        department: 'Housekeeping',
        priority: 'Medium'
      }
    ]
  };

  useEffect(() => {
    generateBriefing();
  }, [selectedDate]);

  const generateBriefing = async () => {
    setIsGenerating(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setBriefingData(mockBriefingData);
    setIsGenerating(false);
  };

  const handleDownload = () => {
    // Implement PDF download
    console.log('Downloading briefing as PDF');
  };

  const handleShare = () => {
    // Implement sharing functionality
    console.log('Sharing briefing');
  };

  if (!briefingData) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Generating daily briefing...</p>
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
            <FileText size={28} />
            Daily Briefing
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Hotel operational briefing for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
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
            onClick={generateBriefing}
            disabled={isGenerating}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={handleDownload}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Download size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
          <button
            onClick={handleShare}
            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Share2 size={20} className="text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Users size={18} className="text-indigo-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Occupancy</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {briefingData.occupancyForecast.current}%
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Expected: {briefingData.occupancyForecast.expected}% (+{briefingData.occupancyForecast.pickup}%)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Star size={18} className="text-amber-500" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">VIP Arrivals</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {briefingData.vipArrivals.length}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Special attention required
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={18} className="text-emerald-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            ${briefingData.revenue.forecast.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Forecast for today
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-2">
            <Briefcase size={18} className="text-blue-600" />
            <span className="text-xs font-mono uppercase text-slate-500 font-bold">Staffing</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {briefingData.staffing.overall}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Overall coverage
          </p>
        </div>
      </div>

      {/* VIP Arrivals */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Star size={18} className="text-amber-500" />
            VIP Arrivals
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {briefingData.vipArrivals.map((vip, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-white">{vip.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{vip.room}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {vip.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{vip.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Events and Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar size={18} className="text-indigo-600" />
              Events Today
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {briefingData.events.map((event, index) => (
              <div key={index} className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{event.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{event.type}</p>
                  </div>
                  <span className="text-xs font-mono bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded">
                    {event.attendees} guests
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {event.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {event.location}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Group Arrivals
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {briefingData.groupArrivals.map((group, index) => (
              <div key={index} className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="font-semibold text-slate-900 dark:text-white">{group.name}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>{group.rooms} rooms</span>
                  <span>{group.guests} guests</span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {group.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weather and Flight Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Cloud size={18} className="text-sky-600" />
              Weather
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold text-slate-900 dark:text-white">
                {briefingData.weather.temperature}
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {briefingData.weather.condition}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {briefingData.weather.forecast}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plane size={18} className="text-rose-600" />
              Flight Delays
            </h3>
          </div>
          <div className="p-4 space-y-2">
            {briefingData.flightDelays.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No flight delays reported</p>
            ) : (
              briefingData.flightDelays.map((flight, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-rose-50 dark:bg-rose-950/20 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {flight.airline} {flight.flight}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {flight.affectedGuests} guests affected
                    </p>
                  </div>
                  <span className="text-sm font-medium text-rose-600 dark:text-rose-400">
                    {flight.delay}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Outstanding Issues */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            Outstanding Issues
          </h3>
        </div>
        <div className="p-4 space-y-2">
          {briefingData.outstandingIssues.map((issue, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{issue.issue}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{issue.department}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                issue.priority === 'High' 
                  ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
              }`}>
                {issue.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DailyBriefing;