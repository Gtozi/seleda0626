/**
 * Guest Service Center Module
 * Central workspace for concierge staff with guest lists and service queue
 */

import { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Calendar,
  LogOut,
  ClipboardList,
  Clock,
  Search,
  Filter,
  ArrowRight,
  Star,
  MapPin,
  RefreshCw
} from 'lucide-react';

interface GuestServiceCenterModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
  onViewRequest?: (requestId: string) => void;
}

interface Guest {
  id: string;
  name: string;
  roomNumber: string;
  status: 'in-house' | 'arriving' | 'departing';
  isVIP: boolean;
  checkInDate: string;
  checkOutDate: string;
  loyaltyStatus: string;
  openRequests: number;
}

interface ServiceRequest {
  id: string;
  guestName: string;
  roomNumber: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed';
  requestedAt: string;
}

const GuestServiceCenterModule: React.FC<GuestServiceCenterModuleProps> = ({
  onViewGuestProfile,
  onViewRequest
}) => {
  const [activeTab, setActiveTab] = useState<'in-house' | 'arriving' | 'departing' | 'vip' | 'queue'>('in-house');
  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [serviceQueue, setServiceQueue] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch guests based on active tab
  const fetchGuests = async () => {
    try {
      setLoading(true);
      let endpoint = '/api/concierge/service-center/in-house';
      
      if (activeTab === 'arriving') {
        endpoint = '/api/concierge/service-center/arriving';
      } else if (activeTab === 'departing') {
        endpoint = '/api/concierge/service-center/departing';
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setGuests(data);
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch service queue
  const fetchServiceQueue = async () => {
    try {
      const response = await fetch('/api/concierge/service-center/queue');
      if (response.ok) {
        const data = await response.json();
        setServiceQueue(data);
      }
    } catch (error) {
      console.error('Error fetching service queue:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchServiceQueue();
    } else {
      fetchGuests();
    }
  }, [activeTab]);

  const handleRefresh = () => {
    if (activeTab === 'queue') {
      fetchServiceQueue();
    } else {
      fetchGuests();
    }
  };

  const filteredGuests = guests.filter(guest => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      guest.name.toLowerCase().includes(q) ||
      guest.roomNumber.toLowerCase().includes(q)
    );
  });

  const displayedGuests = filteredGuests.filter(guest => {
    switch (activeTab) {
      case 'in-house':
        return guest.status === 'in-house';
      case 'arriving':
        return guest.status === 'arriving';
      case 'departing':
        return guest.status === 'departing';
      case 'vip':
        return guest.isVIP;
      case 'queue':
        return guest.openRequests > 0;
      default:
        return true;
    }
  });

  const getStatusBadge = (status: string) => {
    const config = {
      'in-house': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400',
      'arriving': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      'departing': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config[status as keyof typeof config]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      low: 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400',
      medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
      high: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
      urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config[priority as keyof typeof config]}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Service Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Central workspace for concierge operations
          </p>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <TabButton
          active={activeTab === 'in-house'}
          onClick={() => setActiveTab('in-house')}
          icon={<Users size={16} />}
          label="In-House"
          count={guests.filter(g => g.status === 'in-house').length}
        />
        <TabButton
          active={activeTab === 'arriving'}
          onClick={() => setActiveTab('arriving')}
          icon={<Calendar size={16} />}
          label="Arriving"
          count={guests.filter(g => g.status === 'arriving').length}
        />
        <TabButton
          active={activeTab === 'departing'}
          onClick={() => setActiveTab('departing')}
          icon={<LogOut size={16} />}
          label="Departing"
          count={guests.filter(g => g.status === 'departing').length}
        />
        <TabButton
          active={activeTab === 'vip'}
          onClick={() => setActiveTab('vip')}
          icon={<Crown size={16} />}
          label="VIP Guests"
          count={guests.filter(g => g.isVIP).length}
        />
        <TabButton
          active={activeTab === 'queue'}
          onClick={() => setActiveTab('queue')}
          icon={<ClipboardList size={16} />}
          label="Service Queue"
          count={guests.filter(g => g.openRequests > 0).length}
        />
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search guests by name or room number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      {/* Guest List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
          <div className="col-span-3">Guest</div>
          <div className="col-span-2">Room</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Loyalty</div>
          <div className="col-span-2">Open Requests</div>
          <div className="col-span-1">Actions</div>
        </div>

        {displayedGuests.map((guest) => (
          <div
            key={guest.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
          >
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                {guest.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <div className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                  {guest.name}
                  {guest.isVIP && <Crown size={14} className="text-amber-500" />}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {guest.checkInDate} - {guest.checkOutDate}
                </div>
              </div>
            </div>
            <div className="col-span-2 flex items-center text-slate-900 dark:text-white font-medium">
              {guest.roomNumber}
            </div>
            <div className="col-span-2 flex items-center">
              {getStatusBadge(guest.status)}
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-slate-600 dark:text-slate-400">{guest.loyaltyStatus}</span>
            </div>
            <div className="col-span-2 flex items-center">
              {guest.openRequests > 0 ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  {guest.openRequests} Open
                </span>
              ) : (
                <span className="text-sm text-slate-400">None</span>
              )}
            </div>
            <div className="col-span-1 flex items-center">
              <button
                onClick={() => onViewGuestProfile?.(guest.id)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
              >
                <ArrowRight size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Service Queue */}
      {activeTab === 'queue' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" />
            Active Service Queue
          </h2>

          <div className="space-y-3">
            {serviceQueue.map((request) => (
              <div
                key={request.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:shadow-md transition cursor-pointer"
                onClick={() => onViewRequest?.(request.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                      {request.guestName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">
                        {request.guestName} - Room {request.roomNumber}
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {request.type}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getPriorityBadge(request.priority)}
                    <ArrowRight size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label, count }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition ${
        active
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
          : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
          {count}
        </span>
      )}
    </button>
  );
};

export default GuestServiceCenterModule;