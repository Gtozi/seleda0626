/**
 * VIP Guest Management
 * Manage VIP guests and their special requirements
 */

import React, { useState, useEffect } from 'react';
import {
  Star,
  Crown,
  Building2,
  Briefcase,
  Award,
  Heart,
  Search,
  Filter,
  Plus,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Utensils,
  Bed,
  Bell,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

interface VIPGuest {
  id: string;
  name: string;
  category: 'VIP' | 'VVIP' | 'Loyalty Elite' | 'Corporate Executive' | 'Government Official' | 'Celebrity';
  roomNumber?: string;
  checkInDate: string;
  checkOutDate: string;
  preferences: string[];
  specialRequests: string[];
  butlerAssigned?: string;
  status: 'arrived' | 'expected' | 'departed';
  notifications: boolean;
}

const VIPGuestManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'VIP' | 'VVIP' | 'Loyalty Elite' | 'Corporate Executive' | 'Government Official' | 'Celebrity'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'arrived' | 'expected' | 'departed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<VIPGuest | null>(null);
  const [guests, setGuests] = useState<VIPGuest[]>([]);

  const mockGuests: VIPGuest[] = [
    {
      id: '1',
      name: 'Dr. Michael Chen',
      category: 'VVIP',
      roomNumber: 'Presidential Suite',
      checkInDate: '2026-07-31',
      checkOutDate: '2026-08-05',
      preferences: ['Hypoallergenic bedding', 'Dietary restrictions: nut-free', 'Early check-in'],
      specialRequests: ['Private butler service', 'Private dining arrangements', 'Airport pickup'],
      butlerAssigned: 'James Wilson',
      status: 'expected',
      notifications: true
    },
    {
      id: '2',
      name: 'Ms. Sarah Johnson',
      category: 'VIP',
      roomNumber: 'Royal Suite 301',
      checkInDate: '2026-07-30',
      checkOutDate: '2026-08-02',
      preferences: ['High floor', 'Quiet room', 'Extra pillows'],
      specialRequests: ['Spa appointment', 'Late checkout'],
      butlerAssigned: 'Emily Brown',
      status: 'arrived',
      notifications: true
    },
    {
      id: '3',
      name: 'Ambassador Robert Williams',
      category: 'Government Official',
      roomNumber: 'Diplomatic Suite 405',
      checkInDate: '2026-08-10',
      checkOutDate: '2026-08-15',
      preferences: ['Enhanced security', 'Private entrance', 'Meeting room setup'],
      specialRequests: ['Protocol services', 'Government rate', 'VIP parking'],
      status: 'expected',
      notifications: true
    },
    {
      id: '4',
      name: 'Mr. John Smith',
      category: 'Corporate Executive',
      roomNumber: 'Executive Suite 205',
      checkInDate: '2026-07-28',
      checkOutDate: '2026-07-31',
      preferences: ['Business center access', 'High-speed internet', 'Meeting room'],
      specialRequests: ['Secretarial services', 'Transportation'],
      status: 'arrived',
      notifications: false
    },
    {
      id: '5',
      name: 'Celebrity Jane Doe',
      category: 'Celebrity',
      roomNumber: 'Penthouse Suite',
      checkInDate: '2026-08-20',
      checkOutDate: '2026-08-25',
      preferences: ['Maximum privacy', 'Private elevator', 'Security detail'],
      specialRequests: ['Paparazzi control', 'Private dining', 'Personal trainer'],
      status: 'expected',
      notifications: true
    }
  ];

  useEffect(() => {
    setGuests(mockGuests);
  }, []);

  const filteredGuests = guests.filter(guest => {
    const matchesCategory = selectedCategory === 'all' || guest.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || guest.status === selectedStatus;
    const matchesSearch = searchQuery === '' || 
      guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (guest.roomNumber && guest.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'VVIP':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'VIP':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'Loyalty Elite':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Corporate Executive':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      case 'Government Official':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'Celebrity':
        return 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'VVIP':
        return Crown;
      case 'VIP':
        return Star;
      case 'Loyalty Elite':
        return Award;
      case 'Corporate Executive':
        return Building2;
      case 'Government Official':
        return Briefcase;
      case 'Celebrity':
        return Heart;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'arrived':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'expected':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'departed':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Star size={28} />
            VIP Guest Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage VIP guests and their special requirements
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add VIP Guest
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search VIP guests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Categories</option>
          <option value="VVIP">VVIP</option>
          <option value="VIP">VIP</option>
          <option value="Loyalty Elite">Loyalty Elite</option>
          <option value="Corporate Executive">Corporate Executive</option>
          <option value="Government Official">Government Official</option>
          <option value="Celebrity">Celebrity</option>
        </select>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Status</option>
          <option value="arrived">Arrived</option>
          <option value="expected">Expected</option>
          <option value="departed">Departed</option>
        </select>
      </div>

      {/* VIP Guest Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <Star size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No VIP guests match your filters</p>
            </div>
          ) : (
            filteredGuests.map((guest) => {
              const CategoryIcon = getCategoryIcon(guest.category);
              return (
                <div
                  key={guest.id}
                  onClick={() => setSelectedGuest(guest)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedGuest?.id === guest.id
                      ? 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getCategoryColor(guest.category)}`}>
                      <CategoryIcon size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900 dark:text-white">
                            {guest.name}
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {guest.roomNumber || 'Room not assigned'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(guest.status)}`}>
                            {guest.status}
                          </span>
                          {guest.notifications && (
                            <Bell size={16} className="text-amber-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 dark:text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(guest.checkInDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(guest.checkOutDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Guest Details */}
        <div className="lg:col-span-1">
          {selectedGuest ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 sticky top-6">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Guest Details</h3>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>
              
              <div className="p-4 space-y-4">
                <div className={`p-3 rounded-lg ${getCategoryColor(selectedGuest.category)}`}>
                  <div className="flex items-center gap-2">
                    {React.createElement(getCategoryIcon(selectedGuest.category), { size: 18 })}
                    <span className="font-medium">{selectedGuest.category}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-lg">
                    {selectedGuest.name}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {selectedGuest.roomNumber || 'Room not assigned'}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Status</span>
                    <span className={`px-2 py-0.5 rounded ${getStatusColor(selectedGuest.status)}`}>
                      {selectedGuest.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Check In</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(selectedGuest.checkInDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Check Out</span>
                    <span className="text-slate-900 dark:text-white">
                      {new Date(selectedGuest.checkOutDate).toLocaleDateString()}
                    </span>
                  </div>
                  {selectedGuest.butlerAssigned && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Butler</span>
                      <span className="text-slate-900 dark:text-white">
                        {selectedGuest.butlerAssigned}
                      </span>
                    </div>
                  )}
                </div>

                {selectedGuest.preferences.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                      Preferences
                    </h5>
                    <div className="space-y-1">
                      {selectedGuest.preferences.map((pref, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          <span className="text-slate-700 dark:text-slate-300">{pref}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGuest.specialRequests.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">
                      Special Requests
                    </h5>
                    <div className="space-y-1">
                      {selectedGuest.specialRequests.map((request, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Bell size={14} className="text-amber-500" />
                          <span className="text-slate-700 dark:text-slate-300">{request}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button className="flex-1 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                    Edit Details
                  </button>
                  <button className="flex-1 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm">
                    Send Notification
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center sticky top-6">
              <Star size={48} className="text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                Select a VIP guest to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VIPGuestManagement;