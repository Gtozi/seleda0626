/**
 * Upselling Engine
 * Personalized upselling offers based on guest segments and behavior
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Target,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Play,
  Pause,
  Percent,
  Clock,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart3,
  Settings,
  Copy
} from 'lucide-react';

interface UpsellingOffer {
  offerId: string;
  name: string;
  description: string;
  guestSegment: 'all' | 'first_time' | 'returning' | 'vip' | 'corporate';
  offerType: 'room_upgrade' | 'late_checkout' | 'spa_package' | 'dining' | 'airport_transfer' | 'experience';
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  validityPeriod: {
    daysBeforeArrival: number;
    daysAfterArrival: number;
  };
  conditions: string[];
  conversionRate: number;
  active: boolean;
  imageUrl?: string;
}

interface UpsellingCampaign {
  id: string;
  name: string;
  description: string;
  offers: UpsellingOffer[];
  startDate: string;
  endDate: string;
  active: boolean;
  stats: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
  };
}

const UpsellingEngine = () => {
  const [campaigns, setCampaigns] = useState<UpsellingCampaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<UpsellingCampaign | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [viewMode, setViewMode] = useState<'campaigns' | 'offers'>('campaigns');

  // Mock data
  const offers: UpsellingOffer[] = useMemo(() => [
    {
      offerId: 'O1',
      name: 'Suite Upgrade',
      description: 'Upgrade to Deluxe Suite with ocean view',
      guestSegment: 'all',
      offerType: 'room_upgrade',
      originalPrice: 150,
      discountedPrice: 100,
      discountPercentage: 33,
      validityPeriod: { daysBeforeArrival: 7, daysAfterArrival: 0 },
      conditions: ['Subject to availability', 'Non-refundable'],
      conversionRate: 12.5,
      active: true,
    },
    {
      offerId: 'O2',
      name: 'Late Checkout',
      description: 'Extend your stay until 2 PM',
      guestSegment: 'all',
      offerType: 'late_checkout',
      originalPrice: 50,
      discountedPrice: 25,
      discountPercentage: 50,
      validityPeriod: { daysBeforeArrival: 2, daysAfterArrival: 1 },
      conditions: ['Subject to housekeeping availability'],
      conversionRate: 28.3,
      active: true,
    },
    {
      offerId: 'O3',
      name: 'Spa Package',
      description: '60-minute massage + access to spa facilities',
      guestSegment: 'vip',
      offerType: 'spa_package',
      originalPrice: 120,
      discountedPrice: 80,
      discountPercentage: 33,
      validityPeriod: { daysBeforeArrival: 14, daysAfterArrival: 2 },
      conditions: ['Booking required', 'Valid during stay only'],
      conversionRate: 18.7,
      active: true,
    },
    {
      offerId: 'O4',
      name: 'Fine Dining Experience',
      description: '3-course dinner at our signature restaurant',
      guestSegment: 'returning',
      offerType: 'dining',
      originalPrice: 80,
      discountedPrice: 60,
      discountPercentage: 25,
      validityPeriod: { daysBeforeArrival: 7, daysAfterArrival: 3 },
      conditions: ['Reservation required', 'Excludes beverages'],
      conversionRate: 15.2,
      active: false,
    },
    {
      offerId: 'O5',
      name: 'Airport Transfer',
      description: 'Premium airport pickup service',
      guestSegment: 'first_time',
      offerType: 'airport_transfer',
      originalPrice: 40,
      discountedPrice: 30,
      discountPercentage: 25,
      validityPeriod: { daysBeforeArrival: 3, daysAfterArrival: 0 },
      conditions: ['Flight details required'],
      conversionRate: 22.1,
      active: true,
    },
  ], []);

  const campaignTemplates: UpsellingCampaign[] = useMemo(() => [
    {
      id: 'C1',
      name: 'Summer Promotion',
      description: 'Special summer offers for all guests',
      offers: offers.slice(0, 3),
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      active: true,
      stats: { impressions: 1250, clicks: 340, conversions: 85, revenue: 12750 },
    },
    {
      id: 'C2',
      name: 'VIP Exclusive',
      description: 'Exclusive offers for VIP guests',
      offers: [offers[2]],
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      active: true,
      stats: { impressions: 180, clicks: 45, conversions: 12, revenue: 3600 },
    },
  ], []);

  const getOfferTypeIcon = (type: string) => {
    switch (type) {
      case 'room_upgrade': return <Users className="w-4 h-4" />;
      case 'late_checkout': return <Clock className="w-4 h-4" />;
      case 'spa_package': return <Sparkles className="w-4 h-4" />;
      case 'dining': return <Target className="w-4 h-4" />;
      case 'airport_transfer': return <Calendar className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'corporate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'returning': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'first_time': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const calculateCTR = (stats: { impressions: number; clicks: number }) => {
    return stats.impressions > 0 ? ((stats.clicks / stats.impressions) * 100).toFixed(1) : '0.0';
  };

  const calculateConversionRate = (stats: { impressions: number; conversions: number }) => {
    return stats.impressions > 0 ? ((stats.conversions / stats.impressions) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Upselling Engine</h2>
          <p className="text-slate-600 dark:text-slate-400">Personalized offers to increase revenue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('campaigns')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'campaigns'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setViewMode('offers')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'offers'
                  ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Offers
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            {viewMode === 'campaigns' ? 'Create Campaign' : 'Create Offer'}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">$16,350</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+12.5% from last month</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Conversions</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">97</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+8.3% from last month</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg Conversion Rate</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">19.4%</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+2.1% from last month</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg Order Value</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">$168</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">+5.2% from last month</p>
        </div>
      </div>

      {viewMode === 'campaigns' ? (
        /* Campaigns View */
        <div className="space-y-4">
          {campaignTemplates.map((campaign) => (
            <div key={campaign.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{campaign.name}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{campaign.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${campaign.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                  <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{campaign.stats.impressions}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Impressions</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{campaign.stats.clicks}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Clicks</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{campaign.stats.conversions}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Conversions</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">${campaign.stats.revenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Revenue</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-500">Campaign Period:</span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Offers View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.offerId} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      {getOfferTypeIcon(offer.offerType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{offer.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSegmentColor(offer.guestSegment)}`}>
                        {offer.guestSegment}
                      </span>
                    </div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${offer.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{offer.description}</p>

                <div className="flex items-center gap-3 mb-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-500 line-through">${offer.originalPrice}</p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">${offer.discountedPrice}</p>
                  </div>
                  <div className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg">
                    <span className="text-sm font-bold">{offer.discountPercentage}% OFF</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {offer.conditions.slice(0, 2).map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                      <CheckCircle2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                      <span>{condition}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{offer.conversionRate}%</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Conversion</p>
                  </div>
                  <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                    <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpsellingEngine;
