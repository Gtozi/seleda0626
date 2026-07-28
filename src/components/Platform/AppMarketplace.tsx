/**
 * Third-Party App Marketplace
 * Marketplace for third-party integrations with listings and ratings
 */

import React, { useState } from 'react';
import {
  Store,
  Search,
  Star,
  Download,
  Shield,
  Globe,
  Zap,
  CheckCircle,
  Info,
  Filter,
  Grid,
  List,
  TrendingUp,
  Users,
  Clock,
  ExternalLink,
  Heart,
  Eye
} from 'lucide-react';

interface AppListing {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  developer: string;
  rating: number;
  reviewCount: number;
  downloads: number;
  featured: boolean;
  verified: boolean;
  pricing: 'free' | 'paid' | 'freemium';
  price?: string;
  features: string[];
  screenshots: string[];
  lastUpdated: string;
}

const mockApps: AppListing[] = [
  {
    id: 'APP-001',
    name: 'Channel Manager Pro',
    description: 'Sync your inventory across 50+ OTAs and booking channels in real-time.',
    category: 'Distribution',
    icon: '📊',
    developer: 'Connectify',
    rating: 4.8,
    reviewCount: 234,
    downloads: 12500,
    featured: true,
    verified: true,
    pricing: 'paid',
    price: '$99/month',
    features: ['Real-time sync', '50+ OTAs', 'Rate parity', 'Analytics dashboard'],
    screenshots: [],
    lastUpdated: '2026-06-10'
  },
  {
    id: 'APP-002',
    name: 'Payment Gateway Plus',
    description: 'Accept payments from 100+ countries with multi-currency support.',
    category: 'Payments',
    icon: '💳',
    developer: 'PayGlobal',
    rating: 4.7,
    reviewCount: 189,
    downloads: 8900,
    featured: true,
    verified: true,
    pricing: 'freemium',
    price: 'Free + 2.9% per transaction',
    features: ['Multi-currency', 'Fraud protection', 'Recurring billing', 'Instant payouts'],
    screenshots: [],
    lastUpdated: '2026-06-08'
  },
  {
    id: 'APP-003',
    name: 'Guest Messaging Hub',
    description: 'AI-powered guest communication across WhatsApp, SMS, and email.',
    category: 'Communication',
    icon: '💬',
    developer: 'ChatBridge',
    rating: 4.9,
    reviewCount: 312,
    downloads: 15800,
    featured: true,
    verified: true,
    pricing: 'paid',
    price: '$79/month',
    features: ['AI auto-responses', 'Multi-channel', 'Templates', 'Analytics'],
    screenshots: [],
    lastUpdated: '2026-06-12'
  },
  {
    id: 'APP-004',
    name: 'Housekeeping Scheduler',
    description: 'Optimize room cleaning schedules with AI-based efficiency algorithms.',
    category: 'Operations',
    icon: '🧹',
    developer: 'CleanOps',
    rating: 4.5,
    reviewCount: 98,
    downloads: 4200,
    featured: false,
    verified: true,
    pricing: 'free',
    features: ['Auto-scheduling', 'Staff tracking', 'Inventory management'],
    screenshots: [],
    lastUpdated: '2026-05-28'
  },
  {
    id: 'APP-005',
    name: 'Revenue Analytics',
    description: 'Advanced revenue management with predictive pricing and demand forecasting.',
    category: 'Analytics',
    icon: '📈',
    developer: 'RevenueMax',
    rating: 4.6,
    reviewCount: 156,
    downloads: 6700,
    featured: false,
    verified: true,
    pricing: 'paid',
    price: '$149/month',
    features: ['Dynamic pricing', 'Demand forecasting', 'Competitor analysis', 'Reports'],
    screenshots: [],
    lastUpdated: '2026-06-05'
  },
  {
    id: 'APP-006',
    name: 'CRM Suite',
    description: 'Complete guest relationship management with loyalty programs.',
    category: 'CRM',
    icon: '👥',
    developer: 'GuestFirst',
    rating: 4.4,
    reviewCount: 87,
    downloads: 3100,
    featured: false,
    verified: false,
    pricing: 'freemium',
    price: 'Free tier available',
    features: ['Guest profiles', 'Loyalty points', 'Campaigns', 'Segmentation'],
    screenshots: [],
    lastUpdated: '2026-05-20'
  },
  {
    id: 'APP-007',
    name: 'Smart Access Control',
    description: 'Mobile keyless entry with smart lock integration.',
    category: 'Security',
    icon: '🔐',
    developer: 'SecureKey',
    rating: 4.8,
    reviewCount: 203,
    downloads: 9800,
    featured: true,
    verified: true,
    pricing: 'paid',
    price: '$129/month',
    features: ['Mobile keys', 'Smart locks', 'Access logs', 'Temporary codes'],
    screenshots: [],
    lastUpdated: '2026-06-14'
  },
  {
    id: 'APP-008',
    name: 'Review Monitor',
    description: 'Track and manage reviews across all review platforms automatically.',
    category: 'Marketing',
    icon: '⭐',
    developer: 'ReputationGuard',
    rating: 4.3,
    reviewCount: 64,
    downloads: 2800,
    featured: false,
    verified: true,
    pricing: 'paid',
    price: '$59/month',
    features: ['Review aggregation', 'Auto-responses', 'Sentiment analysis', 'Alerts'],
    screenshots: [],
    lastUpdated: '2026-05-15'
  }
];

const categories = ['All', 'Distribution', 'Payments', 'Communication', 'Operations', 'Analytics', 'CRM', 'Security', 'Marketing'];

export default function AppMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedApp, setSelectedApp] = useState<AppListing | null>(null);

  const filteredApps = mockApps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredApps = mockApps.filter(app => app.featured);

  return (
    <div className="space-y-6 animate-fade-in" id="app-marketplace">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">App Marketplace</h2>
        </div>
        <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xs text-white flex items-center gap-2">
          <Zap size={14} /> Submit Your App
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Store size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{mockApps.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Apps</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Download size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{mockApps.reduce((acc, app) => acc + app.downloads, 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Downloads</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{mockApps.filter(app => app.verified).length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Verified Apps</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">{mockApps.reduce((acc, app) => acc + app.reviewCount, 0)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Apps */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl p-6 text-white">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Star size={18} className="fill-current" /> Featured Apps
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredApps.slice(0, 3).map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-white/20 transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl">{app.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-bold">{app.name}</div>
                  <div className="text-xs text-white/70">{app.developer}</div>
                </div>
                {app.verified && <CheckCircle size={16} className="text-emerald-300" />}
              </div>
              <p className="text-xs text-white/80 mb-3 line-clamp-2">{app.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-yellow-300 text-yellow-300" />
                  {app.rating} ({app.reviewCount})
                </span>
                <span className="bg-white/20 px-2 py-1 rounded">{app.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search apps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-purple-500/20 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Filter size={14} /> Filters
            </button>
            <div className="flex bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}`}
              >
                <Grid size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-sm' : ''}`}
              >
                <List size={16} className="text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* App Listings */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-4 cursor-pointer hover:shadow-lg hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{app.icon}</div>
                {app.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                    <Shield size={10} /> Verified
                  </span>
                )}
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{app.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{app.developer}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{app.description}</p>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                  <Star size={12} className="fill-current" />
                  {app.rating} ({app.reviewCount})
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{app.downloads.toLocaleString()} downloads</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${
                  app.pricing === 'free' ? 'text-emerald-600 dark:text-emerald-400' :
                  app.pricing === 'paid' ? 'text-purple-600 dark:text-purple-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {app.pricing === 'free' ? 'Free' : app.price}
                </span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-1 rounded">
                  {app.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="p-4 border-b border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl">{app.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</h3>
                    {app.verified && <CheckCircle size={14} className="text-emerald-500" />}
                    {app.featured && <Star size={14} className="text-amber-500 fill-current" />}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{app.developer}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{app.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 justify-end mb-1">
                    <Star size={12} className="fill-current" />
                    {app.rating} ({app.reviewCount})
                  </div>
                  <span className={`text-xs font-bold block mb-1 ${
                    app.pricing === 'free' ? 'text-emerald-600 dark:text-emerald-400' :
                    app.pricing === 'paid' ? 'text-purple-600 dark:text-purple-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {app.pricing === 'free' ? 'Free' : app.price}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{app.downloads.toLocaleString()} downloads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* App Detail Modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedApp(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-3xs max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{selectedApp.icon}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedApp.name}</h3>
                      {selectedApp.verified && <CheckCircle size={18} className="text-emerald-500" />}
                      {selectedApp.featured && <Star size={18} className="text-amber-500 fill-current" />}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{selectedApp.developer}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <Eye size={20} className="text-slate-400" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{selectedApp.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                    <Star size={14} className="fill-current" />
                    <span className="text-lg font-bold">{selectedApp.rating}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{selectedApp.reviewCount} reviews</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3">
                  <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">{selectedApp.downloads.toLocaleString()}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Downloads</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3">
                  <div className={`text-lg font-bold mb-1 ${
                    selectedApp.pricing === 'free' ? 'text-emerald-600 dark:text-emerald-400' :
                    selectedApp.pricing === 'paid' ? 'text-purple-600 dark:text-purple-400' :
                    'text-blue-600 dark:text-blue-400'
                  }`}>
                    {selectedApp.pricing === 'free' ? 'Free' : selectedApp.price}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Pricing</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3">
                  <div className="text-lg font-bold text-slate-900 dark:text-white mb-1">{selectedApp.category}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Category</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Zap size={16} className="text-purple-500" /> Features
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedApp.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle size={12} className="text-emerald-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
                <Clock size={12} />
                Last updated: {selectedApp.lastUpdated}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2">
                  <Download size={14} /> Install App
                </button>
                <button className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                  <ExternalLink size={14} /> View Details
                </button>
                <button className="px-4 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl">
                  <Heart size={14} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
