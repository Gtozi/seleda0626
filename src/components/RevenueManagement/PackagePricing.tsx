/**
 * Package Pricing Component
 * Manages room packages, dining packages, spa packages, conference packages, wedding packages, and seasonal packages
 */

import React, { useState, useMemo } from 'react';
import {
  Package,
  DollarSign,
  Calendar,
  Star,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users
} from 'lucide-react';

const PackagePricing = () => {
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [packageType, setPackageType] = useState<'room' | 'dining' | 'spa' | 'conference' | 'wedding' | 'seasonal'>('room');

  const packages = useMemo(() => [
    { 
      id: '1', 
      name: 'Romantic Getaway', 
      type: 'room',
      roomType: 'Deluxe Suite',
      baseRate: 200,
      packageRate: 280,
      includes: ['Champagne on arrival', 'Rose petals', 'Late checkout', 'Breakfast for two'],
      validity: '2024-12-01 to 2024-12-31',
      active: true,
      bookings: 45,
      revenue: 12600
    },
    { 
      id: '2', 
      name: 'Business Executive', 
      type: 'room',
      roomType: 'Standard Room',
      baseRate: 100,
      packageRate: 150,
      includes: ['High-speed WiFi', 'Workspace', 'Daily newspaper', 'Airport transfer'],
      validity: 'All year',
      active: true,
      bookings: 120,
      revenue: 18000
    },
    { 
      id: '3', 
      name: 'Fine Dining Experience', 
      type: 'dining',
      roomType: 'All Room Types',
      baseRate: 0,
      packageRate: 75,
      includes: ['3-course dinner', 'Wine pairing', 'Chef\'s special'],
      validity: 'Fri-Sun',
      active: true,
      bookings: 85,
      revenue: 6375
    },
    { 
      id: '4', 
      name: 'Spa Retreat', 
      type: 'spa',
      roomType: 'Deluxe Suite',
      baseRate: 200,
      packageRate: 350,
      includes: ['Daily spa treatment', 'Massage', 'Facial', 'Access to thermal pool'],
      validity: '2024-11-01 to 2025-03-31',
      active: true,
      bookings: 30,
      revenue: 10500
    },
    { 
      id: '5', 
      name: 'Conference Package', 
      type: 'conference',
      roomType: 'All Room Types',
      baseRate: 0,
      packageRate: 120,
      includes: ['Meeting room', 'Projector', 'Coffee breaks', 'Lunch'],
      validity: 'Mon-Fri',
      active: true,
      bookings: 25,
      revenue: 3000
    },
    { 
      id: '6', 
      name: 'Dream Wedding', 
      type: 'wedding',
      roomType: 'Ballroom',
      baseRate: 0,
      packageRate: 5000,
      includes: ['Venue decoration', 'Catering for 100', 'Wedding cake', 'Photography package'],
      validity: 'All year',
      active: true,
      bookings: 8,
      revenue: 40000
    },
    { 
      id: '7', 
      name: 'Summer Special', 
      type: 'seasonal',
      roomType: 'All Room Types',
      baseRate: 100,
      packageRate: 85,
      includes: ['Pool access', 'Daily breakfast', 'Kids club access'],
      validity: '2024-06-01 to 2024-08-31',
      active: false,
      bookings: 200,
      revenue: 17000
    }
  ], []);

  const filteredPackages = useMemo(() => {
    if (packageType === 'room') return packages.filter(p => p.type === 'room');
    return packages.filter(p => p.type === packageType);
  }, [packages, packageType]);

  const packageMetrics = useMemo(() => {
    const totalRevenue = packages.reduce((sum, p) => sum + p.revenue, 0);
    const totalBookings = packages.reduce((sum, p) => sum + p.bookings, 0);
    const avgUpsell = Math.round(packages.reduce((sum, p) => sum + (p.packageRate - p.baseRate), 0) / packages.length);
    const activePackages = packages.filter(p => p.active).length;

    return { totalRevenue, totalBookings, avgUpsell, activePackages };
  }, [packages]);

  const packageTypes = [
    { id: 'room', name: 'Room Packages', icon: Package },
    { id: 'dining', name: 'Dining Packages', icon: Star },
    { id: 'spa', name: 'Spa Packages', icon: Settings },
    { id: 'conference', name: 'Conference Packages', icon: Users },
    { id: 'wedding', name: 'Wedding Packages', icon: Star },
    { id: 'seasonal', name: 'Seasonal Packages', icon: Calendar }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Package Pricing</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage room, dining, spa, and event packages</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Package
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${packageMetrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Total Bookings"
          value={packageMetrics.totalBookings}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Avg Upsell"
          value={`$${packageMetrics.avgUpsell}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <MetricCard
          title="Active Packages"
          value={packageMetrics.activePackages}
          icon={<Package className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Package Type Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {packageTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => setPackageType(type.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  packageType === type.id
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {type.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Packages List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{packageTypes.find(t => t.id === packageType)?.name}</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              selected={selectedPackage === pkg.id}
              onSelect={() => setSelectedPackage(pkg.id)}
            />
          ))}
        </div>
      </div>

      {/* Top Performing Packages */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Performing Packages</h3>
        <div className="space-y-3">
          {[...packages].sort((a, b) => b.revenue - a.revenue).slice(0, 5).map((pkg, idx) => (
            <TopPackageRow key={pkg.id} package={pkg} rank={idx + 1} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800'
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]} border`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

interface PackageCardProps {
  package: {
    id: string;
    name: string;
    type: string;
    roomType: string;
    baseRate: number;
    packageRate: number;
    includes: string[];
    validity: string;
    active: boolean;
    bookings: number;
    revenue: number;
  };
  selected: boolean;
  onSelect: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({ package: pkg, selected, onSelect }) => {
  const upsell = pkg.packageRate - pkg.baseRate;
  const upsellPercent = pkg.baseRate > 0 ? Math.round((upsell / pkg.baseRate) * 100) : 0;

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-slate-900 dark:text-white">{pkg.name}</h4>
            {pkg.active ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{pkg.roomType}</p>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Base Rate</span>
          <span className="font-medium text-slate-900 dark:text-white">${pkg.baseRate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Package Rate</span>
          <span className="font-medium text-green-600 dark:text-green-400">${pkg.packageRate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Upsell</span>
          <span className={`font-medium ${upsell > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
            +${upsell} ({upsellPercent}%)
          </span>
        </div>
      </div>
      <div className="mb-3">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Includes:</p>
        <div className="flex flex-wrap gap-1">
          {pkg.includes.slice(0, 3).map((item, idx) => (
            <span key={idx} className="text-xs text-slate-700 dark:text-slate-300">• {item}</span>
          ))}
          {pkg.includes.length > 3 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">+{pkg.includes.length - 3} more</span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          {pkg.validity}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface TopPackageRowProps {
  package: {
    name: string;
    type: string;
    bookings: number;
    revenue: number;
  };
  rank: number;
}

const TopPackageRow: React.FC<TopPackageRowProps> = ({ package: pkg, rank }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold">
          {rank}
        </span>
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{pkg.name}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{pkg.type} • {pkg.bookings} bookings</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-600 dark:text-green-400">${pkg.revenue.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default PackagePricing;
