/**
 * Front Office Packages & Add-ons Module
 * Experience packages, upsells, and guest service add-ons
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Package,
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
  Star,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Heart,
  Coffee,
  Car,
  Plane,
  Utensils,
  Sparkles
} from 'lucide-react';
import StatCard from '../StatCard';

type PackageStatus = 'active' | 'inactive' | 'seasonal' | 'limited';
type PackageCategory = 'dining' | 'wellness' | 'excursion' | 'romance' | 'family' | 'business' | 'transport' | 'other';
type AddonType = 'per_person' | 'per_room' | 'per_night' | 'flat_rate';

interface Package {
  id: string;
  name: string;
  description: string;
  category: PackageCategory;
  status: PackageStatus;
  price: number;
  priceType: 'flat' | 'per_night' | 'per_person';
  duration?: string;
  inclusions: string[];
  restrictions: string[];
  availability: {
    startDate: string;
    endDate?: string;
    minStay?: number;
    maxGuests?: number;
  };
  imageUrl?: string;
  featured: boolean;
  bookingCount: number;
  averageRating: number;
}

interface Addon {
  id: string;
  name: string;
  description: string;
  category: PackageCategory;
  price: number;
  priceType: AddonType;
  available: boolean;
  bookingCount: number;
}

const PackagesAddons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'packages' | 'addons' | 'bookings' | 'analytics') || 'packages';
  const setActiveTab = (tab: 'packages' | 'addons' | 'bookings' | 'analytics') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showAddonModal, setShowAddonModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);

  const [packageForm, setPackageForm] = useState({
    name: '',
    description: '',
    category: 'dining' as PackageCategory,
    price: '',
    priceType: 'flat' as 'flat' | 'per_night' | 'per_person',
    duration: '',
    inclusions: '',
    restrictions: '',
    featured: false
  });

  const [packages] = useState<Package[]>([
    {
      id: 'PKG-001',
      name: 'Romantic Getaway',
      description: 'A perfect romantic escape with champagne, rose petals, and a candlelit dinner',
      category: 'romance',
      status: 'active',
      price: 250,
      priceType: 'flat',
      duration: 'Per stay',
      inclusions: ['Champagne on arrival', 'Rose petal turndown', 'Candlelit dinner for 2', 'Late checkout (2 PM)', 'Com breakfast in bed'],
      restrictions: ['Minimum 2-night stay', 'Subject to availability'],
      availability: { startDate: '2026-01-01', minStay: 2, maxGuests: 2 },
      featured: true,
      bookingCount: 45,
      averageRating: 4.8,
    },
    {
      id: 'PKG-002',
      name: 'Spa Retreat',
      description: 'Rejuvenate with our luxury spa package including treatments and wellness activities',
      category: 'wellness',
      status: 'active',
      price: 180,
      priceType: 'per_person',
      duration: 'Per person',
      inclusions: ['60-minute massage', 'Facial treatment', 'Access to spa facilities', 'Healthy lunch', 'Yoga session'],
      restrictions: ['Age 18+ only'],
      availability: { startDate: '2026-01-01' },
      featured: true,
      bookingCount: 32,
      averageRating: 4.9,
    },
    {
      id: 'PKG-003',
      name: 'City Explorer',
      description: 'Discover the city with guided tours and exclusive local experiences',
      category: 'excursion',
      status: 'active',
      price: 120,
      priceType: 'per_person',
      duration: 'Per day',
      inclusions: ['Guided city tour', 'Museum tickets', 'Local lunch', 'Transportation', 'Local guide'],
      restrictions: ['Minimum 2 guests', 'Weather dependent'],
      availability: { startDate: '2026-01-01', maxGuests: 8 },
      featured: false,
      bookingCount: 18,
      averageRating: 4.6,
    },
    {
      id: 'PKG-004',
      name: 'Family Fun Package',
      description: 'Entertainment and activities for the whole family',
      category: 'family',
      status: 'seasonal',
      price: 300,
      priceType: 'flat',
      duration: 'Per stay',
      inclusions: ['Kids club access', 'Family dinner', 'Pool toys', 'Game room access', 'Welcome snacks'],
      restrictions: ['Summer season only', 'Maximum 2 adults, 3 children'],
      availability: { startDate: '2026-06-01', endDate: '2026-08-31' },
      featured: false,
      bookingCount: 12,
      averageRating: 4.5,
    },
    {
      id: 'PKG-005',
      name: 'Business Executive',
      description: 'Everything the business traveler needs for a productive stay',
      category: 'business',
      status: 'active',
      price: 150,
      priceType: 'flat',
      duration: 'Per stay',
      inclusions: ['High-speed internet upgrade', 'Meeting room access (2 hours)', 'Express check-in/out', 'Laundry service', 'Daily newspaper'],
      restrictions: ['Valid ID required'],
      availability: { startDate: '2026-01-01' },
      featured: false,
      bookingCount: 28,
      averageRating: 4.4,
    },
  ]);

  const [addons] = useState<Addon[]>([
    { id: 'ADD-001', name: 'Airport Transfer', description: 'Private airport transfer to/from hotel', category: 'transport', price: 45, priceType: 'flat', available: true, bookingCount: 67 },
    { id: 'ADD-002', name: 'Early Check-in', description: 'Check in from 10 AM instead of 3 PM', category: 'other', price: 30, priceType: 'flat', available: true, bookingCount: 45 },
    { id: 'ADD-003', name: 'Late Check-out', description: 'Check out at 2 PM instead of 11 AM', category: 'other', price: 35, priceType: 'flat', available: true, bookingCount: 52 },
    { id: 'ADD-004', name: 'Breakfast Buffet', description: 'Daily breakfast buffet for all guests', category: 'dining', price: 25, priceType: 'per_person', available: true, bookingCount: 89 },
    { id: 'ADD-005', name: 'Room Upgrade', description: 'Upgrade to superior room category', category: 'other', price: 75, priceType: 'per_night', available: true, bookingCount: 23 },
    { id: 'ADD-006', name: 'Parking', description: 'Secure on-site parking for duration of stay', category: 'transport', price: 15, priceType: 'per_night', available: true, bookingCount: 78 },
    { id: 'ADD-007', name: 'Pet Friendly', description: 'Allow pets in room (pet fee applies)', category: 'other', price: 50, priceType: 'flat', available: true, bookingCount: 15 },
    { id: 'ADD-008', name: 'Welcome Fruit Basket', description: 'Fresh fruit basket on arrival', category: 'dining', price: 20, priceType: 'flat', available: true, bookingCount: 34 },
  ]);

  const filteredPackages = packages.filter(pkg => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      pkg.name.toLowerCase().includes(q) ||
      pkg.description.toLowerCase().includes(q) ||
      pkg.category.toLowerCase().includes(q)
    );
  });

  const filteredAddons = addons.filter(addon => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      addon.name.toLowerCase().includes(q) ||
      addon.description.toLowerCase().includes(q) ||
      addon.category.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: PackageStatus) => {
    const config: Record<PackageStatus, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
      inactive: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Inactive' },
      seasonal: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Seasonal' },
      limited: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Limited' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getCategoryIcon = (category: PackageCategory) => {
    switch (category) {
      case 'dining': return <Utensils size={16} />;
      case 'wellness': return <Sparkles size={16} />;
      case 'excursion': return <Plane size={16} />;
      case 'romance': return <Heart size={16} />;
      case 'family': return <Users size={16} />;
      case 'business': return <TrendingUp size={16} />;
      case 'transport': return <Car size={16} />;
      default: return <Package size={16} />;
    }
  };

  const handlePackageSubmit = () => {
    setShowPackageModal(false);
    setPackageForm({
      name: '',
      description: '',
      category: 'dining',
      price: '',
      priceType: 'flat',
      duration: '',
      inclusions: '',
      restrictions: '',
      featured: false
    });
  };

  const handleAddonSubmit = () => {
    setShowAddonModal(false);
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
    <div className="space-y-6 animate-fade-in" id="packages-addons">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Packages & Add-ons</h2>
          <p className="text-sm text-slate-500 mt-1">Experience packages, upsells, and guest service add-ons</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPackageModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Package
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Packages" value="5" icon={Package} variant="primary" />
        <StatCard label="Available Add-ons" value="8" icon={Sparkles} variant="rooms" />
        <StatCard label="Bookings This Month" value="142" icon={Calendar} variant="revenue" />
        <StatCard label="Revenue" value="$8,450" icon={DollarSign} variant="revenue" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="packages" label="Packages" icon={Package} />
        <TabButton id="addons" label="Add-ons" icon={Sparkles} />
        <TabButton id="bookings" label="Bookings" icon={Calendar} />
        <TabButton id="analytics" label="Analytics" icon={TrendingUp} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'packages' || activeTab === 'addons') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search packages or add-ons..."
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

      {/* Packages Tab */}
      {activeTab === 'packages' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Experience Packages</h3>
            <span className="text-xs text-slate-500">{filteredPackages.length} packages</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Package</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Bookings</th>
                  <th className="px-4 py-3 text-left font-semibold">Rating</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPackages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {pkg.featured && <Star size={14} className="text-amber-500 fill-amber-500" />}
                        <div>
                          <div className="font-medium text-slate-900">{pkg.name}</div>
                          <div className="text-xs text-slate-500 max-w-xs truncate">{pkg.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-slate-600">
                        {getCategoryIcon(pkg.category)}
                        <span className="capitalize">{pkg.category}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-900 font-medium">
                      ${pkg.price}
                      <span className="text-xs text-slate-500">/{pkg.priceType.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(pkg.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{pkg.bookingCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-500 fill-amber-500" />
                        <span className="text-slate-900">{pkg.averageRating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedPackage(pkg)}
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

      {/* Add-ons Tab */}
      {activeTab === 'addons' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Service Add-ons</h3>
            <button
              onClick={() => setShowAddonModal(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              + Add New
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Add-on</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-left font-semibold">Price</th>
                  <th className="px-4 py-3 text-left font-semibold">Price Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Bookings</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAddons.map((addon) => (
                  <tr key={addon.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{addon.name}</div>
                      <div className="text-xs text-slate-500 max-w-xs truncate">{addon.description}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{addon.category}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">${addon.price}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{addon.priceType.replace('_', ' ')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${addon.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {addon.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{addon.bookingCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
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

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Package & Add-on Bookings</h3>
          <div className="space-y-3">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Romantic Getaway</div>
                  <div className="text-sm text-slate-500">John Smith · Room 301 · Jul 29, 2026</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">$250.00</div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Confirmed</span>
                </div>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Airport Transfer</div>
                  <div className="text-sm text-slate-500">Sarah Johnson · Room 205 · Jul 30, 2026</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">$45.00</div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded">Confirmed</span>
                </div>
              </div>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-slate-900">Spa Retreat</div>
                  <div className="text-sm text-slate-500">Michael Chen · Room 412 · Jul 29, 2026</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-slate-900">$360.00</div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded">Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Package & Add-on Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Top Package</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Romantic Getaway</p>
              <p className="text-sm text-slate-500">45 bookings · $11,250 revenue</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Top Add-on</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Breakfast Buffet</p>
              <p className="text-sm text-slate-500">89 bookings · $2,225 revenue</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Avg Package Rating</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">4.6/5</p>
              <p className="text-sm text-slate-500">Based on 127 reviews</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Monthly Revenue</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">$8,450</p>
              <p className="text-sm text-slate-500">+12% from last month</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">28%</p>
              <p className="text-sm text-slate-500">Guests who add packages</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Most Popular Category</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">Dining</p>
              <p className="text-sm text-slate-500">35% of all bookings</p>
            </div>
          </div>
        </div>
      )}

      {/* Package Modal */}
      {showPackageModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Create New Package</h3>
              <button onClick={() => setShowPackageModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Package Name</label>
                  <input
                    type="text"
                    value={packageForm.name}
                    onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                    placeholder="Enter package name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={packageForm.category}
                    onChange={(e) => setPackageForm({ ...packageForm, category: e.target.value as PackageCategory })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="dining">Dining</option>
                    <option value="wellness">Wellness</option>
                    <option value="excursion">Excursion</option>
                    <option value="romance">Romance</option>
                    <option value="family">Family</option>
                    <option value="business">Business</option>
                    <option value="transport">Transport</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Price Type</label>
                  <select
                    value={packageForm.priceType}
                    onChange={(e) => setPackageForm({ ...packageForm, priceType: e.target.value as 'flat' | 'per_night' | 'per_person' })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="flat">Flat Rate</option>
                    <option value="per_night">Per Night</option>
                    <option value="per_person">Per Person</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Duration</label>
                  <input
                    type="text"
                    value={packageForm.duration}
                    onChange={(e) => setPackageForm({ ...packageForm, duration: e.target.value })}
                    placeholder="e.g., Per stay, Per day"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={packageForm.featured}
                    onChange={(e) => setPackageForm({ ...packageForm, featured: e.target.checked })}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="featured" className="text-sm text-slate-700">Featured Package</label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={packageForm.description}
                  onChange={(e) => setPackageForm({ ...packageForm, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the package..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Inclusions (one per line)</label>
                <textarea
                  value={packageForm.inclusions}
                  onChange={(e) => setPackageForm({ ...packageForm, inclusions: e.target.value })}
                  rows={3}
                  placeholder="List what's included..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Restrictions (one per line)</label>
                <textarea
                  value={packageForm.restrictions}
                  onChange={(e) => setPackageForm({ ...packageForm, restrictions: e.target.value })}
                  rows={2}
                  placeholder="List any restrictions..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowPackageModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handlePackageSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Save size={16} />
                Create Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addon Modal */}
      {showAddonModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Add New Add-on</h3>
              <button onClick={() => setShowAddonModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Add-on creation form placeholder.</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowAddonModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleAddonSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">Create Add-on</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PackagesAddons;
