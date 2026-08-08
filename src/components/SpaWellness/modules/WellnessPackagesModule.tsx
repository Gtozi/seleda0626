/**
 * Wellness Packages Module
 * Manages bundled spa packages with special pricing and validity periods
 */

import { useState } from 'react';
import {
  Gift,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Star,
  CheckCircle2,
  MoreVertical,
  Clock,
  Users
} from 'lucide-react';

interface WellnessPackagesModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface WellnessPackage {
  id: string;
  name: string;
  type: 'Couples Retreat' | 'Weekend Spa Package' | 'Honeymoon Package' | 'Bridal Package' | 'Executive Wellness' | 'Family Wellness';
  description: string;
  price: number;
  originalPrice: number;
  duration: number;
  sessions: number;
  validity: number;
  includedTreatments: string[];
  amenities: string[];
  isActive: boolean;
  purchasedBy: number;
}

const WellnessPackagesModule: React.FC<WellnessPackagesModuleProps> = ({
  onViewGuestProfile
}) => {
  const [packages, setPackages] = useState<WellnessPackage[]>([
    {
      id: 'PKG-001',
      name: 'Couples Retreat Package',
      type: 'Couples Retreat',
      description: 'Romantic spa experience for two including couples massage, champagne, and private relaxation time',
      price: 450,
      originalPrice: 550,
      duration: 180,
      sessions: 2,
      validity: 90,
      includedTreatments: ['Couples Massage (90 min)', 'Champagne Service', 'Chocolate Strawberries', 'Private Use of Thermal Facilities'],
      amenities: ['Private Couples Room', 'Robes & Slippers', 'Aromatherapy', 'Music Selection'],
      isActive: true,
      purchasedBy: 24
    },
    {
      id: 'PKG-002',
      name: 'Weekend Spa Escape',
      type: 'Weekend Spa Package',
      description: 'Full weekend of wellness with unlimited spa access, daily treatments, and healthy meals',
      price: 899,
      originalPrice: 1200,
      duration: 2880,
      sessions: 6,
      validity: 30,
      includedTreatments: ['3 Massages', '2 Facials', '1 Body Treatment', 'Unlimited Thermal Facilities', 'Healthy Meals'],
      amenities: ['Spa Access', 'Locker Room', 'Healthy Meals', 'Yoga Classes', 'Fitness Center Access'],
      isActive: true,
      purchasedBy: 18
    },
    {
      id: 'PKG-003',
      name: 'Honeymoon Bliss Package',
      type: 'Honeymoon Package',
      description: 'Luxurious honeymoon experience with romantic treatments and special amenities',
      price: 1299,
      originalPrice: 1600,
      duration: 480,
      sessions: 4,
      validity: 180,
      includedTreatments: ['Couples Massage', 'His & Hers Facials', 'Romantic Bath', 'Candlelight Dinner'],
      amenities: ['Private Suite', 'Rose Petals', 'Champagne', 'Photography Session', 'Late Checkout'],
      isActive: true,
      purchasedBy: 12
    },
    {
      id: 'PKG-004',
      name: 'Bridal Glow Package',
      type: 'Bridal Package',
      description: 'Complete bridal beauty preparation for the perfect wedding day look',
      price: 599,
      originalPrice: 750,
      duration: 240,
      sessions: 3,
      validity: 60,
      includedTreatments: ['Bridal Makeup Trial', 'Bridal Makeup Application', 'Hair Styling', 'Manicure & Pedicure'],
      amenities: ['Private Styling Area', 'Complimentary Touch-up Kit', 'Champagne', 'Light Refreshments'],
      isActive: true,
      purchasedBy: 15
    },
    {
      id: 'PKG-005',
      name: 'Executive Wellness Program',
      type: 'Executive Wellness',
      description: 'Stress relief and rejuvenation package designed for busy executives',
      price: 750,
      originalPrice: 950,
      duration: 300,
      sessions: 5,
      validity: 90,
      includedTreatments: ['Deep Tissue Massage', 'Stress Relief Facial', 'Reflexology', 'Meditation Session', 'Nutrition Consultation'],
      amenities: ['Executive Lounge Access', 'Priority Booking', 'Healthy Lunch', 'Workspace Available'],
      isActive: true,
      purchasedBy: 8
    },
    {
      id: 'PKG-006',
      name: 'Family Wellness Day',
      type: 'Family Wellness',
      description: 'Fun wellness activities for the whole family',
      price: 399,
      originalPrice: 500,
      duration: 240,
      sessions: 4,
      validity: 30,
      includedTreatments: ['Family Massage (2 adults)', 'Kids Mini Facial', 'Family Yoga Class', 'Healthy Snacks'],
      amenities: ['Family Changing Room', 'Kids Activity Area', 'Family Lockers', 'Photo Session'],
      isActive: false,
      purchasedBy: 6
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showNewPackageModal, setShowNewPackageModal] = useState(false);

  const packageTypes = ['All', 'Couples Retreat', 'Weekend Spa Package', 'Honeymoon Package', 'Bridal Package', 'Executive Wellness', 'Family Wellness'];

  const getTypeColor = (type: string) => {
    const colors = {
      'Couples Retreat': 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400',
      'Weekend Spa Package': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Honeymoon Package': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Bridal Package': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Executive Wellness': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400',
      'Family Wellness': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || pkg.type === typeFilter;
    const matchesStatus = statusFilter === 'All' || 
                         (statusFilter === 'Active' && pkg.isActive) ||
                         (statusFilter === 'Inactive' && !pkg.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleToggleActive = (packageId: string) => {
    setPackages(packages.map(pkg =>
      pkg.id === packageId ? { ...pkg, isActive: !pkg.isActive } : pkg
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wellness Packages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage bundled spa packages with special pricing
          </p>
        </div>
        <button
          onClick={() => setShowNewPackageModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Package
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search packages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {packageTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPackages.map((pkg) => (
          <div key={pkg.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <Gift size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{pkg.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{pkg.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pkg.isActive ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(pkg.type)}`}>
                {pkg.type}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{pkg.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">${pkg.price}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 line-through">${pkg.originalPrice}</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">{pkg.sessions}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Sessions</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Clock size={14} />
                <span>Valid for {pkg.validity} days</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users size={14} />
                <span>Purchased by {pkg.purchasedBy} guests</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleToggleActive(pkg.id)}
                className={`text-xs font-medium transition ${
                  pkg.isActive 
                    ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300' 
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                {pkg.isActive ? 'Active' : 'Activate'}
              </button>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Package Modal Placeholder */}
      {showNewPackageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Wellness Package</h2>
              <button
                onClick={() => setShowNewPackageModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Wellness package creation form would be implemented here with package type, treatments, pricing, and validity configuration.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewPackageModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessPackagesModule;