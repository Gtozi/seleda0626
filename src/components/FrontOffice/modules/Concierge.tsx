/**
 * Front Office Concierge Module
 * Tour booking, guest services, and local recommendations
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Edit,
  Save,
  X,
  ChevronDown,
  Calendar,
  Clock,
  Users,
  Star,
  Car,
  Plane,
  Utensils,
  Ticket,
  Coffee,
  ShoppingBag,
  Camera,
  Music,
  Heart
} from 'lucide-react';
import StatCard from '../StatCard';

type ServiceStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
type ServiceCategory = 'tour' | 'transport' | 'dining' | 'entertainment' | 'shopping' | 'other';
type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface ConciergeService {
  id: string;
  guestName: string;
  roomNumber: string;
  reservationId?: string;
  category: ServiceCategory;
  serviceName: string;
  description: string;
  provider?: string;
  scheduledDate: string;
  scheduledTime: string;
  priority: Priority;
  status: ServiceStatus;
  guests: number;
  notes: string;
  cost?: number;
  rating?: number;
  feedback?: string;
}

interface LocalRecommendation {
  id: string;
  name: string;
  category: ServiceCategory;
  rating: number;
  distance: string;
  description: string;
  address: string;
  phone?: string;
  website?: string;
  featured: boolean;
}

const Concierge = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'services' | 'recommendations' | 'bookings' | 'history') || 'services';
  const setActiveTab = (tab: 'services' | 'recommendations' | 'bookings' | 'history') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [selectedService, setSelectedService] = useState<ConciergeService | null>(null);

  const [serviceForm, setServiceForm] = useState({
    guestName: '',
    roomNumber: '',
    reservationId: '',
    category: 'tour' as ServiceCategory,
    serviceName: '',
    description: '',
    provider: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'medium' as Priority,
    guests: '1',
    notes: '',
    cost: ''
  });

  const [services] = useState<ConciergeService[]>([
    {
      id: 'CNC-001',
      guestName: 'John Smith',
      roomNumber: '301',
      reservationId: 'RES-001',
      category: 'tour',
      serviceName: 'City Tour',
      description: 'Guided city tour with historical sites',
      provider: 'City Tours Ltd',
      scheduledDate: '2026-07-30',
      scheduledTime: '09:00',
      priority: 'medium',
      status: 'confirmed',
      guests: 2,
      notes: 'Guest interested in historical sites',
      cost: 75,
    },
    {
      id: 'CNC-002',
      guestName: 'Sarah Johnson',
      roomNumber: '205',
      reservationId: 'RES-002',
      category: 'dining',
      serviceName: 'Restaurant Reservation',
      description: 'Table for 2 at The Grand Restaurant',
      provider: 'The Grand Restaurant',
      scheduledDate: '2026-07-29',
      scheduledTime: '19:30',
      priority: 'medium',
      status: 'completed',
      guests: 2,
      notes: 'Celebrating anniversary',
      cost: 0,
      rating: 5,
      feedback: 'Excellent service, great food!',
    },
    {
      id: 'CNC-003',
      guestName: 'Michael Chen',
      roomNumber: '412',
      reservationId: 'RES-003',
      category: 'transport',
      serviceName: 'Airport Transfer',
      description: 'Private transfer to international airport',
      provider: 'Hotel Transport',
      scheduledDate: '2026-07-31',
      scheduledTime: '08:00',
      priority: 'high',
      status: 'confirmed',
      guests: 1,
      notes: 'Flight at 10:30 AM',
      cost: 45,
    },
    {
      id: 'CNC-004',
      guestName: 'Emma Wilson',
      roomNumber: '118',
      reservationId: 'RES-004',
      category: 'entertainment',
      serviceName: 'Theater Tickets',
      description: '2 tickets for evening performance',
      provider: 'National Theater',
      scheduledDate: '2026-07-30',
      scheduledTime: '20:00',
      priority: 'low',
      status: 'pending',
      guests: 2,
      notes: 'Guest prefers front row seats',
      cost: 120,
    },
    {
      id: 'CNC-005',
      guestName: 'Robert Brown',
      roomNumber: '320',
      reservationId: 'RES-005',
      category: 'tour',
      serviceName: 'Spa Appointment',
      description: 'Full day spa package',
      provider: 'Hotel Spa',
      scheduledDate: '2026-07-29',
      scheduledTime: '10:00',
      priority: 'medium',
      status: 'in_progress',
      guests: 1,
      notes: 'Includes massage and facial',
      cost: 180,
    },
  ]);

  const [recommendations] = useState<LocalRecommendation[]>([
    {
      id: 'REC-001',
      name: 'The Grand Restaurant',
      category: 'dining',
      rating: 4.8,
      distance: '0.2 km',
      description: 'Fine dining with local and international cuisine',
      address: '45 Main Street',
      phone: '+251 11 234 5678',
      featured: true,
    },
    {
      id: 'REC-002',
      name: 'National Museum',
      category: 'tour',
      rating: 4.6,
      distance: '1.5 km',
      description: 'Ethiopian history and art exhibitions',
      address: '12 Museum Road',
      phone: '+251 11 345 6789',
      featured: true,
    },
    {
      id: 'REC-003',
      name: 'City Shopping Mall',
      category: 'shopping',
      rating: 4.4,
      distance: '0.8 km',
      description: 'Modern shopping center with international brands',
      address: '78 Commercial Ave',
      featured: false,
    },
    {
      id: 'REC-004',
      name: 'Jazz Club',
      category: 'entertainment',
      rating: 4.7,
      distance: '0.5 km',
      description: 'Live jazz music and cocktails',
      address: '23 Music Lane',
      phone: '+251 11 456 7890',
      featured: true,
    },
    {
      id: 'REC-005',
      name: 'Traditional Coffee House',
      category: 'dining',
      rating: 4.5,
      distance: '0.3 km',
      description: 'Auth Ethiopian coffee ceremony',
      address: '56 Coffee Street',
      featured: false,
    },
  ]);

  const filteredServices = services.filter(svc => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      svc.guestName.toLowerCase().includes(q) ||
      svc.roomNumber.toLowerCase().includes(q) ||
      svc.serviceName.toLowerCase().includes(q) ||
      svc.description.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: ServiceStatus) => {
    const config: Record<ServiceStatus, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Confirmed' },
      in_progress: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'In Progress' },
      completed: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Completed' },
      cancelled: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Cancelled' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getCategoryIcon = (category: ServiceCategory) => {
    switch (category) {
      case 'tour': return <MapPin size={16} />;
      case 'transport': return <Car size={16} />;
      case 'dining': return <Utensils size={16} />;
      case 'entertainment': return <Music size={16} />;
      case 'shopping': return <ShoppingBag size={16} />;
      default: return <Star size={16} />;
    }
  };

  const handleServiceSubmit = () => {
    setShowServiceModal(false);
    setServiceForm({
      guestName: '',
      roomNumber: '',
      reservationId: '',
      category: 'tour',
      serviceName: '',
      description: '',
      provider: '',
      scheduledDate: '',
      scheduledTime: '',
      priority: 'medium',
      guests: '1',
      notes: '',
      cost: ''
    });
  };

  const TabButton = ({ id, label, icon: Icon }: { id: typeof activeTab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
        activeTab === id
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in" id="concierge">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Concierge</h2>
          <p className="text-sm text-slate-500 mt-1">Tour booking, guest services, and local recommendations</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowServiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Service
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Services" value="3" icon={Calendar} variant="primary" />
        <StatCard label="Today's Bookings" value="2" icon={Clock} variant="rooms" />
        <StatCard label="Pending Requests" value="1" icon={AlertTriangle} variant="alert" />
        <StatCard label="Avg Rating" value="4.8/5" icon={Star} variant="guests" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="services" label="Services" icon={MapPin} />
        <TabButton id="recommendations" label="Recommendations" icon={Star} />
        <TabButton id="bookings" label="Bookings" icon={Ticket} />
        <TabButton id="history" label="History" icon={Calendar} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'services' || activeTab === 'history') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 cursor-pointer">
            <Filter size={16} />
            Filter
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Active Services</h3>
            <span className="text-xs text-slate-500">{filteredServices.filter(s => s.status !== 'completed' && s.status !== 'cancelled').length} active</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Provider</th>
                  <th className="px-4 py-3 text-left font-semibold">Scheduled</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.filter(s => s.status !== 'completed' && s.status !== 'cancelled').map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{svc.guestName}</div>
                      <div className="text-xs text-slate-500">Room {svc.roomNumber}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{svc.serviceName}</div>
                      <div className="text-xs text-slate-500">{svc.guests} guest(s)</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        {getCategoryIcon(svc.category)}
                        <span className="capitalize">{svc.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{svc.provider || '-'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{svc.scheduledDate}</div>
                      <div className="text-xs text-slate-500">{svc.scheduledTime}</div>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(svc.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedService(svc)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View details"
                        >
                          <Edit size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Local Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className={`p-4 border rounded-lg ${rec.featured ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200'}`}>
                {rec.featured && <div className="flex items-center gap-1 text-indigo-600 text-xs font-medium mb-2"><Star size={12} className="fill-indigo-600" /> Featured</div>}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(rec.category)}
                    <span className="font-medium text-slate-900">{rec.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-sm text-slate-600">{rec.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{rec.distance}</span>
                  <span>{rec.address}</span>
                </div>
                {rec.phone && <div className="text-xs text-slate-500 mt-1">{rec.phone}</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Service Bookings</h3>
          <div className="space-y-3">
            {services.filter(s => s.status === 'confirmed' || s.status === 'pending').map((svc) => (
              <div key={svc.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900">{svc.serviceName}</div>
                    <div className="text-sm text-slate-500">{svc.guestName} · Room {svc.roomNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-slate-600">{svc.scheduledDate} at {svc.scheduledTime}</div>
                    {svc.cost && <div className="text-sm font-medium text-slate-900">${svc.cost}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Service History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Service</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredServices.filter(s => s.status === 'completed' || s.status === 'cancelled').map((svc) => (
                  <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900">{svc.guestName}</td>
                    <td className="px-4 py-3 text-slate-600">{svc.serviceName}</td>
                    <td className="px-4 py-3 text-slate-600">{svc.scheduledDate}</td>
                    <td className="px-4 py-3">{getStatusBadge(svc.status)}</td>
                    <td className="px-4 py-3">
                      {svc.rating ? (
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-amber-500 fill-amber-500" />
                          <span className="text-slate-900">{svc.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Book Concierge Service</h3>
              <button onClick={() => setShowServiceModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Guest Name</label>
                  <input
                    type="text"
                    value={serviceForm.guestName}
                    onChange={(e) => setServiceForm({ ...serviceForm, guestName: e.target.value })}
                    placeholder="Enter guest name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
                  <input
                    type="text"
                    value={serviceForm.roomNumber}
                    onChange={(e) => setServiceForm({ ...serviceForm, roomNumber: e.target.value })}
                    placeholder="Room number"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={serviceForm.category}
                    onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as ServiceCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="tour">Tour</option>
                    <option value="transport">Transport</option>
                    <option value="dining">Dining</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="shopping">Shopping</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Service Name</label>
                  <input
                    type="text"
                    value={serviceForm.serviceName}
                    onChange={(e) => setServiceForm({ ...serviceForm, serviceName: e.target.value })}
                    placeholder="Service name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={serviceForm.scheduledDate}
                    onChange={(e) => setServiceForm({ ...serviceForm, scheduledDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time</label>
                  <input
                    type="time"
                    value={serviceForm.scheduledTime}
                    onChange={(e) => setServiceForm({ ...serviceForm, scheduledTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Guests</label>
                  <input
                    type="number"
                    value={serviceForm.guests}
                    onChange={(e) => setServiceForm({ ...serviceForm, guests: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Cost ($)</label>
                  <input
                    type="number"
                    value={serviceForm.cost}
                    onChange={(e) => setServiceForm({ ...serviceForm, cost: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  rows={2}
                  placeholder="Describe the service..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Provider (optional)</label>
                <input
                  type="text"
                  value={serviceForm.provider}
                  onChange={(e) => setServiceForm({ ...serviceForm, provider: e.target.value })}
                  placeholder="Service provider name"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={serviceForm.notes}
                  onChange={(e) => setServiceForm({ ...serviceForm, notes: e.target.value })}
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowServiceModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleServiceSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Save size={16} />
                Book Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Concierge;
