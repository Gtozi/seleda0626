/**
 * Promotions Analysis Component
 * Analyzes promotion performance, discount analysis, coupon performance, campaign revenue, incremental revenue, and ROI
 */

import React, { useState, useMemo } from 'react';
import {
  Tag,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Percent,
  Calendar,
  Users,
  Settings,
  Plus,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const PromotionsAnalysis = () => {
  const [selectedPromotion, setSelectedPromotion] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'active' | 'scheduled' | 'ended' | 'all'>('active');

  const promotions = useMemo(() => [
    { 
      id: '1', 
      name: 'Early Bird Summer', 
      code: 'EARLY24',
      type: 'discount',
      discount: 15,
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      bookings: 245,
      revenue: 36750,
      incrementalRevenue: 8500,
      roi: 180,
      targetSegment: 'leisure'
    },
    { 
      id: '2', 
      name: 'Corporate Weekend', 
      code: 'CORPWKND',
      type: 'discount',
      discount: 20,
      status: 'active',
      startDate: '2024-11-01',
      endDate: '2024-12-31',
      bookings: 85,
      revenue: 12750,
      incrementalRevenue: 3200,
      roi: 145,
      targetSegment: 'corporate'
    },
    { 
      id: '3', 
      name: 'Last Minute Flash Sale', 
      code: 'FLASH24',
      type: 'flash',
      discount: 25,
      status: 'scheduled',
      startDate: '2024-12-20',
      endDate: '2024-12-22',
      bookings: 0,
      revenue: 0,
      incrementalRevenue: 0,
      roi: 0,
      targetSegment: 'all'
    },
    { 
      id: '4', 
      name: 'Loyalty Member Bonus', 
      code: 'LOYALTY25',
      type: 'loyalty',
      discount: 10,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      bookings: 180,
      revenue: 24300,
      incrementalRevenue: 4200,
      roi: 165,
      targetSegment: 'loyalty'
    },
    { 
      id: '5', 
      name: 'Group Booking Special', 
      code: 'GROUP10',
      type: 'group',
      discount: 10,
      status: 'ended',
      startDate: '2024-09-01',
      endDate: '2024-10-31',
      bookings: 45,
      revenue: 6750,
      incrementalRevenue: 1500,
      roi: 120,
      targetSegment: 'group'
    }
  ], []);

  const filteredPromotions = useMemo(() => {
    if (viewMode === 'all') return promotions;
    return promotions.filter(p => p.status === viewMode);
  }, [promotions, viewMode]);

  const promotionMetrics = useMemo(() => {
    const active = promotions.filter(p => p.status === 'active');
    const totalRevenue = active.reduce((sum, p) => sum + p.revenue, 0);
    const totalIncremental = active.reduce((sum, p) => sum + p.incrementalRevenue, 0);
    const avgROI = Math.round(active.reduce((sum, p) => sum + p.roi, 0) / active.length);
    const totalBookings = active.reduce((sum, p) => sum + p.bookings, 0);

    return { totalRevenue, totalIncremental, avgROI, totalBookings };
  }, [promotions]);

  const couponPerformance = useMemo(() => [
    { id: 1, code: 'EARLY24', usage: 245, redemptions: 198, conversion: 81, avgDiscount: 22 },
    { id: 2, code: 'CORPWKND', usage: 85, redemptions: 72, conversion: 85, avgDiscount: 30 },
    { id: 3, code: 'LOYALTY25', usage: 180, redemptions: 162, conversion: 90, avgDiscount: 15 }
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Promotions Analysis</h2>
          <p className="text-slate-600 dark:text-slate-400">Analyze promotion performance and ROI</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="all">All Promotions</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="ended">Ended</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            New Promotion
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${promotionMetrics.totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Incremental Revenue"
          value={`$${promotionMetrics.totalIncremental.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Average ROI"
          value={`${promotionMetrics.avgROI}%`}
          icon={<Percent className="w-5 h-5" />}
          color="purple"
        />
        <MetricCard
          title="Total Bookings"
          value={promotionMetrics.totalBookings}
          icon={<Users className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Promotions List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Promotions</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPromotions.map((promotion) => (
            <PromotionCard
              key={promotion.id}
              promotion={promotion}
              selected={selectedPromotion === promotion.id}
              onSelect={() => setSelectedPromotion(promotion.id)}
            />
          ))}
        </div>
      </div>

      {/* Coupon Performance */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Coupon Performance</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Details
          </button>
        </div>
        <div className="space-y-3">
          {couponPerformance.map((coupon) => (
            <CouponPerformanceCard key={coupon.id} coupon={coupon} />
          ))}
        </div>
      </div>

      {/* Campaign Revenue */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Campaign Revenue Breakdown</h3>
        <div className="space-y-3">
          {promotions.filter(p => p.status === 'active').map((promo) => (
            <CampaignRevenueRow key={promo.id} promotion={promo} />
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

interface PromotionCardProps {
  promotion: {
    id: string;
    name: string;
    code: string;
    type: string;
    discount: number;
    status: string;
    startDate: string;
    endDate: string;
    bookings: number;
    revenue: number;
    incrementalRevenue: number;
    roi: number;
    targetSegment: string;
  };
  selected: boolean;
  onSelect: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, selected, onSelect }) => {
  const statusColors = {
    active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    scheduled: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    ended: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
  };

  const typeColors = {
    discount: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    flash: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    loyalty: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    group: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  };

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
            <h4 className="font-semibold text-slate-900 dark:text-white">{promotion.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[promotion.status as keyof typeof statusColors]}`}>
              {promotion.status}
            </span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-600 dark:text-slate-400">{promotion.code}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[promotion.type as keyof typeof typeColors]}`}>
              {promotion.type}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">{promotion.startDate} → {promotion.endDate}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Discount</p>
          <p className="font-medium text-slate-900 dark:text-white">{promotion.discount}%</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Bookings</p>
          <p className="font-medium text-slate-900 dark:text-white">{promotion.bookings}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Revenue</p>
          <p className="font-medium text-green-600 dark:text-green-400">${promotion.revenue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">ROI</p>
          <p className="font-medium text-blue-600 dark:text-blue-400">{promotion.roi}%</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="text-xs text-slate-600 dark:text-slate-400">
          Target: {promotion.targetSegment}
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <Eye className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface CouponPerformanceCardProps {
  coupon: {
    id: number;
    code: string;
    usage: number;
    redemptions: number;
    conversion: number;
    avgDiscount: number;
  };
}

const CouponPerformanceCard: React.FC<CouponPerformanceCardProps> = ({ coupon }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-3">
        <Tag className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{coupon.code}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Usage: {coupon.usage}</span>
            <span>Redemptions: {coupon.redemptions}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Conversion</p>
          <p className="text-lg font-semibold text-green-600 dark:text-green-400">{coupon.conversion}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg Discount</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">${coupon.avgDiscount}</p>
        </div>
      </div>
    </div>
  );
};

interface CampaignRevenueRowProps {
  promotion: {
    name: string;
    revenue: number;
    incrementalRevenue: number;
    bookings: number;
  };
}

const CampaignRevenueRow: React.FC<CampaignRevenueRowProps> = ({ promotion }) => {
  const incrementalPercent = Math.round((promotion.incrementalRevenue / promotion.revenue) * 100);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
      <div className="flex items-center gap-4">
        <BarChart3 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{promotion.name}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{promotion.bookings} bookings</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
          <p className="font-semibold text-slate-900 dark:text-white">${promotion.revenue.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Incremental</p>
          <p className="font-semibold text-green-600 dark:text-green-400">${promotion.incrementalRevenue.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Incremental %</p>
          <p className="font-semibold text-blue-600 dark:text-blue-400">{incrementalPercent}%</p>
        </div>
      </div>
    </div>
  );
};

export default PromotionsAnalysis;
