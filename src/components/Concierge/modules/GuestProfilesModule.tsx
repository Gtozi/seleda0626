/**
 * Guest Profiles Module
 * Integrated with PMS and CRM for guest preferences and history
 */

import { useState, useEffect } from 'react';
import { User, Star, History, Heart, MapPin, Calendar, Clock, X, RefreshCw } from 'lucide-react';

interface GuestProfilesModuleProps {
  selectedGuestId?: string;
  onClearSelectedGuestId?: () => void;
}

interface GuestProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  roomNumber?: string;
  loyaltyStatus: string;
  preferences: string[];
  languages: string[];
  dietaryPreferences: string[];
  allergies: string[];
  favoriteActivities: string[];
  transportationPreferences: string;
  specialDates: string[];
  previousRequests: number;
}

const GuestProfilesModule: React.FC<GuestProfilesModuleProps> = ({
  selectedGuestId,
  onClearSelectedGuestId
}) => {
  const [guestProfile, setGuestProfile] = useState<GuestProfile | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch guest profile
  const fetchGuestProfile = async () => {
    if (!selectedGuestId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/concierge/guests/${selectedGuestId}`);
      if (response.ok) {
        const data = await response.json();
        
        // Transform database data to match frontend format
        const transformedProfile: GuestProfile = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone || '',
          roomNumber: data.current_reservation?.room_number,
          loyaltyStatus: data.loyalty_points > 1000 ? 'Platinum' : data.loyalty_points > 500 ? 'Gold' : data.loyalty_points > 100 ? 'Silver' : 'Standard',
          preferences: data.preferences?.room_preferences || [],
          languages: data.preferences?.languages || [],
          dietaryPreferences: data.preferences?.dietary || [],
          allergies: data.preferences?.allergies || [],
          favoriteActivities: data.preferences?.activities || [],
          transportationPreferences: data.preferences?.transportation || 'Standard',
          specialDates: data.preferences?.special_dates || [],
          previousRequests: data.previous_requests || 0
        };
        
        setGuestProfile(transformedProfile);
      }
    } catch (error) {
      console.error('Error fetching guest profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuestProfile();
  }, [selectedGuestId]);

  if (!guestProfile) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Guest Selected</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Select a guest from the Guest Service Center to view their profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            {guestProfile.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{guestProfile.name}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span>Room {guestProfile.roomNumber || 'Not assigned'}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Star size={14} className="text-amber-500" />
                {guestProfile.loyaltyStatus}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={fetchGuestProfile}
            disabled={loading}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin text-slate-600 dark:text-slate-400' : 'text-slate-600 dark:text-slate-400'} />
          </button>
          {onClearSelectedGuestId && (
            <button
              onClick={onClearSelectedGuestId}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
            >
              <X size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="Email" value={guestProfile.email} icon={<User size={16} />} />
          <InfoItem label="Phone" value={guestProfile.phone} icon={<User size={16} />} />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Heart size={20} className="text-rose-500" />
          Preferences
        </h2>
        <div className="space-y-4">
          <Section title="Room Preferences" items={guestProfile.preferences} />
          <Section title="Languages" items={guestProfile.languages} />
          <Section title="Dietary Preferences" items={guestProfile.dietaryPreferences} />
          <Section title="Allergies" items={guestProfile.allergies} />
          <Section title="Favorite Activities" items={guestProfile.favoriteActivities} />
          <InfoItem label="Transportation" value={guestProfile.transportationPreferences} icon={<MapPin size={16} />} />
        </div>
      </div>

      {/* Special Dates */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" />
          Special Dates
        </h2>
        <div className="space-y-2">
          {guestProfile.specialDates.map((date, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Star size={14} className="text-amber-500" />
              {date}
            </div>
          ))}
        </div>
      </div>

      {/* Stay History */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <History size={20} className="text-indigo-600" />
          Concierge History
        </h2>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{guestProfile.previousRequests}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Previous Requests</div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
        <div className="text-sm font-medium text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
};

interface SectionProps {
  title: string;
  items: string[];
}

const Section: React.FC<SectionProps> = ({ title, items }) => {
  if (items.length === 0) return null;
  return (
    <div>
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default GuestProfilesModule;