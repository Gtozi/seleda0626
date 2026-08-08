/**
 * Home Dashboard Module
 * Displays current reservation, upcoming stay, quick actions, and personalized information
 */

import { useState } from 'react';
import {
  Home,
  Calendar,
  Clock,
  CreditCard,
  Star,
  Sun,
  Bell,
  ArrowRight,
  LogIn,
  Key,
  UtensilsCrossed,
  MessageSquare,
  Bed,
  Car,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface HomeDashboardModuleProps {
  reservationId?: string;
  onViewModule?: (module: string) => void;
}

interface Reservation {
  id: string;
  confirmationNumber: string;
  checkInDate: string;
  checkOutDate: string;
  roomNumber?: string;
  status: 'Upcoming' | 'CheckedIn' | 'CheckedOut';
  balance: number;
  currency: string;
}

interface LoyaltyInfo {
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  points: number;
  nextTierPoints: number;
}

const HomeDashboardModule: React.FC<HomeDashboardModuleProps> = ({
  reservationId,
  onViewModule
}) => {
  const [reservation] = useState<Reservation>({
    id: 'RES-001',
    confirmationNumber: 'CONF-2026-001',
    checkInDate: '2026-08-15',
    checkOutDate: '2026-08-20',
    roomNumber: '305',
    status: 'Upcoming',
    balance: 450.00,
    currency: 'USD'
  });

  const [loyalty] = useState<LoyaltyInfo>({
    tier: 'Gold',
    points: 12500,
    nextTierPoints: 25000
  });

  const [weather] = useState({
    temperature: 28,
    condition: 'Sunny',
    icon: <Sun size={24} className="text-amber-500" />
  });

  const [announcements] = useState([
    {
      id: 1,
      title: 'Pool Maintenance',
      message: 'The main pool will be closed for maintenance on August 16th from 9 AM to 2 PM.',
      priority: 'high'
    },
    {
      id: 2,
      title: 'Special Dinner Event',
      message: 'Join us for our special seafood dinner this Friday at 7 PM in the main restaurant.',
      priority: 'normal'
    }
  ]);

  const quickActions = [
    { id: 'checkin', label: 'Check-in', icon: <LogIn size={20} />, module: 'checkin' },
    { id: 'key', label: 'Digital Key', icon: <Key size={20} />, module: 'digitalKey' },
    { id: 'roomService', label: 'Room Service', icon: <UtensilsCrossed size={20} />, module: 'roomService' },
    { id: 'chat', label: 'Chat with Hotel', icon: <MessageSquare size={20} />, module: 'messaging' },
    { id: 'housekeeping', label: 'Request Housekeeping', icon: <Bed size={20} />, module: 'housekeeping' },
    { id: 'restaurant', label: 'Book Restaurant', icon: <UtensilsCrossed size={20} />, module: 'restaurant' },
    { id: 'transport', label: 'Request Transportation', icon: <Car size={20} />, module: 'transportation' },
    { id: 'checkout', label: 'Check-out', icon: <LogOut size={20} />, module: 'checkout' }
  ];

  const getTierColor = (tier: string) => {
    const colors = {
      'Silver': 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600',
      'Gold': 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/50',
      'Platinum': 'bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-500',
      'Diamond': 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-700/50'
    };
    return colors[tier as keyof typeof colors] || colors['Silver'];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Upcoming': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'CheckedIn': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'CheckedOut': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400'
    };
    return colors[status as keyof typeof colors] || colors['Upcoming'];
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'high' 
      ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400'
      : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
  };

  const calculateDaysUntilCheckIn = () => {
    const checkIn = new Date(reservation.checkInDate);
    const today = new Date();
    const diffTime = checkIn.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilCheckIn = calculateDaysUntilCheckIn();

  const handleQuickAction = (module: string) => {
    if (onViewModule) {
      onViewModule(module);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Your home away from home
          </p>
        </div>
        <div className="flex items-center gap-3">
          {weather.icon}
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{weather.temperature}°C</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{weather.condition}</div>
          </div>
        </div>
      </div>

      {/* Current Reservation Card */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} />
              <span className="text-sm font-medium opacity-90">Current Reservation</span>
            </div>
            <h2 className="text-3xl font-bold mb-1">{reservation.confirmationNumber}</h2>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>{new Date(reservation.checkInDate).toLocaleDateString()}</span>
              <ArrowRight size={16} />
              <span>{new Date(reservation.checkOutDate).toLocaleDateString()}</span>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(reservation.status)}`}>
            {reservation.status}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} />
              <span className="text-xs opacity-75">Check-in</span>
            </div>
            <div className="text-lg font-bold">{daysUntilCheckIn} days</div>
          </div>
          {reservation.roomNumber && (
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
              <div className="flex items-center gap-2 mb-1">
                <Home size={16} />
                <span className="text-xs opacity-75">Room</span>
              </div>
              <div className="text-lg font-bold">{reservation.roomNumber}</div>
            </div>
          )}
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <CreditCard size={16} />
              <span className="text-xs opacity-75">Balance</span>
            </div>
            <div className="text-lg font-bold">{reservation.currency} {reservation.balance.toFixed(2)}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur">
            <div className="flex items-center gap-2 mb-1">
              <Star size={16} />
              <span className="text-xs opacity-75">Points</span>
            </div>
            <div className="text-lg font-bold">{loyalty.points.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Loyalty Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Loyalty Status</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getTierColor(loyalty.tier)}`}>
            {loyalty.tier} Member
          </div>
        </div>
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600 dark:text-slate-400">Progress to {loyalty.tier === 'Diamond' ? 'Max' : 'Next Tier'}</span>
            <span className="font-medium text-slate-900 dark:text-white">
              {loyalty.points.toLocaleString()} / {loyalty.nextTierPoints.toLocaleString()} points
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-400 to-amber-600 h-2 rounded-full transition-all"
              style={{ width: `${(loyalty.points / loyalty.nextTierPoints) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.module)}
              className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition group"
            >
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition">
                {action.icon}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hotel Announcements */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Hotel Announcements</h3>
          <Bell size={20} className="text-slate-400" />
        </div>
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-slate-900 dark:text-white">{announcement.title}</h4>
                <div className={`px-2 py-0.5 rounded text-xs font-medium border ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority}
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{announcement.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized Recommendations */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative rounded-lg overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-teal-400 to-emerald-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <ChevronRight size={24} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <h4 className="text-white font-medium text-sm">Spa Package</h4>
              <p className="text-white/80 text-xs">Relaxing massage treatment</p>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-orange-400 to-red-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <ChevronRight size={24} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <h4 className="text-white font-medium text-sm">Fine Dining</h4>
              <p className="text-white/80 text-xs">Special dinner experience</p>
            </div>
          </div>
          <div className="relative rounded-lg overflow-hidden group cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-blue-400 to-indigo-500" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <ChevronRight size={24} className="text-white" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
              <h4 className="text-white font-medium text-sm">Local Tour</h4>
              <p className="text-white/80 text-xs">Explore the city</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeDashboardModule;
