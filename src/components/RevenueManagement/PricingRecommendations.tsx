/**
 * Pricing Recommendations Component
 * Displays AI-generated pricing recommendations with approval workflow
 */

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Filter,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  MoreVertical,
  Download
} from 'lucide-react';

type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'applied';
type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected' | 'applied';

interface PricingRecommendation {
  id: string;
  roomType: string;
  roomTypeId: string;
  date: string;
  currentRate: number;
  recommendedRate: number;
  confidence: number;
  reason: string;
  factors: {
    demandScore: number;
    competitorAvg: number;
    occupancyForecast: number;
    seasonality: number;
    eventsImpact: number;
  };
  status: RecommendationStatus;
  appliedBy?: string;
  appliedAt?: string;
  createdAt: string;
}

const PricingRecommendations = () => {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<'7days' | '14days' | '30days'>('7days');
  const [selectedRecommendations, setSelectedRecommendations] = useState<Set<string>>(new Set());

  // Mock data - would come from RMS API
  const recommendations = useMemo<PricingRecommendation[]>(() => [
    {
      id: '1',
      roomType: 'Deluxe Suite',
      roomTypeId: 'rt-1',
      date: '2026-07-20',
      currentRate: 150,
      recommendedRate: 165,
      confidence: 92,
      reason: 'High demand forecast due to local conference',
      factors: {
        demandScore: 85,
        competitorAvg: 158,
        occupancyForecast: 88,
        seasonality: 1.1,
        eventsImpact: 15
      },
      status: 'pending',
      createdAt: '2026-07-19T10:00:00Z'
    },
    {
      id: '2',
      roomType: 'Standard Room',
      roomTypeId: 'rt-2',
      date: '2026-07-20',
      currentRate: 100,
      recommendedRate: 105,
      confidence: 85,
      reason: 'Competitor rate increase detected',
      factors: {
        demandScore: 72,
        competitorAvg: 108,
        occupancyForecast: 75,
        seasonality: 1.0,
        eventsImpact: 0
      },
      status: 'pending',
      createdAt: '2026-07-19T10:00:00Z'
    },
    {
      id: '3',
      roomType: 'Ocean View',
      roomTypeId: 'rt-3',
      date: '2026-07-21',
      currentRate: 200,
      recommendedRate: 190,
      confidence: 78,
      reason: 'Low occupancy forecast - reduce to stimulate demand',
      factors: {
        demandScore: 55,
        competitorAvg: 195,
        occupancyForecast: 60,
        seasonality: 0.9,
        eventsImpact: -5
      },
      status: 'pending',
      createdAt: '2026-07-19T10:00:00Z'
    },
    {
      id: '4',
      roomType: 'Family Suite',
      roomTypeId: 'rt-4',
      date: '2026-07-22',
      currentRate: 250,
      recommendedRate: 275,
      confidence: 88,
      reason: 'Weekend demand surge expected',
      factors: {
        demandScore: 90,
        competitorAvg: 265,
        occupancyForecast: 92,
        seasonality: 1.15,
        eventsImpact: 10
      },
      status: 'pending',
      createdAt: '2026-07-19T10:00:00Z'
    },
    {
      id: '5',
      roomType: 'Deluxe Suite',
      roomTypeId: 'rt-1',
      date: '2026-07-19',
      currentRate: 145,
      recommendedRate: 160,
      confidence: 90,
      reason: 'High demand forecast',
      factors: {
        demandScore: 82,
        competitorAvg: 155,
        occupancyForecast: 85,
        seasonality: 1.05,
        eventsImpact: 8
      },
      status: 'approved',
      appliedBy: 'John Doe',
      appliedAt: '2026-07-19T09:30:00Z',
      createdAt: '2026-07-19T08:00:00Z'
    },
    {
      id: '6',
      roomType: 'Standard Room',
      roomTypeId: 'rt-2',
      date: '2026-07-18',
      currentRate: 95,
      recommendedRate: 110,
      confidence: 75,
      reason: 'Competitor rate increase',
      factors: {
        demandScore: 68,
        competitorAvg: 105,
        occupancyForecast: 70,
        seasonality: 1.0,
        eventsImpact: 0
      },
      status: 'rejected',
      appliedBy: 'Jane Smith',
      appliedAt: '2026-07-18T14:00:00Z',
      createdAt: '2026-07-18T10:00:00Z'
    }
  ], []);

  const filteredRecommendations = useMemo(() => {
    if (filterStatus === 'all') return recommendations;
    return recommendations.filter(r => r.status === filterStatus);
  }, [recommendations, filterStatus]);

  const stats = useMemo(() => ({
    pending: recommendations.filter(r => r.status === 'pending').length,
    approved: recommendations.filter(r => r.status === 'approved').length,
    rejected: recommendations.filter(r => r.status === 'rejected').length,
    applied: recommendations.filter(r => r.status === 'applied').length
  }), [recommendations]);

  const handleSelectAll = () => {
    if (selectedRecommendations.size === filteredRecommendations.length) {
      setSelectedRecommendations(new Set());
    } else {
      setSelectedRecommendations(new Set(filteredRecommendations.map(r => r.id)));
    }
  };

  const handleSelectRecommendation = (id: string) => {
    const newSelected = new Set(selectedRecommendations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRecommendations(newSelected);
  };

  const handleBatchApprove = async () => {
    // Would call RMS API to batch apply recommendations
    console.log('Batch approving:', Array.from(selectedRecommendations));
    setSelectedRecommendations(new Set());
  };

  const handleBatchReject = async () => {
    // Would call RMS API to batch reject recommendations
    console.log('Batch rejecting:', Array.from(selectedRecommendations));
    setSelectedRecommendations(new Set());
  };

  const handleRecommendationAction = async (id: string, action: 'approve' | 'reject') => {
    // Would call RMS API to apply/reject recommendation
    console.log(`${action} recommendation:`, id);
  };

  const handleGenerateNew = async () => {
    // Would call RMS API to generate new recommendations
    console.log('Generating new recommendations');
  };

  const getPercentChange = (current: number, recommended: number) => {
    return Math.round(((recommended - current) / current) * 100);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Recommendations</h2>
          <p className="text-slate-600 dark:text-slate-400">AI-generated rate adjustments with approval workflow</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Generate New
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="amber" />
        <StatCard title="Approved" value={stats.approved} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
        <StatCard title="Rejected" value={stats.rejected} icon={<XCircle className="w-5 h-5" />} color="red" />
        <StatCard title="Applied" value={stats.applied} icon={<TrendingUp className="w-5 h-5" />} color="blue" />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'rejected', 'applied'] as FilterStatus[]).map((status) => (
              <FilterButton
                key={status}
                label={status.charAt(0).toUpperCase() + status.slice(1)}
                active={filterStatus === status}
                onClick={() => setFilterStatus(status)}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-slate-500" />
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value as any)}
            className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            <option value="7days">Last 7 days</option>
            <option value="14days">Last 14 days</option>
            <option value="30days">Last 30 days</option>
          </select>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedRecommendations.size > 0 && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {selectedRecommendations.size} recommendation(s) selected
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleBatchApprove}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve All
            </button>
            <button
              onClick={handleBatchReject}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject All
            </button>
          </div>
        </div>
      )}

      {/* Recommendations Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRecommendations.size === filteredRecommendations.length && filteredRecommendations.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-slate-300"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Room Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Current Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Recommended Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Change
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Confidence
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Reason
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredRecommendations.map((rec) => (
              <RecommendationRow
                key={rec.id}
                recommendation={rec}
                selected={selectedRecommendations.has(rec.id)}
                onSelect={() => handleSelectRecommendation(rec.id)}
                onAction={(action) => handleRecommendationAction(rec.id, action)}
                getPercentChange={getPercentChange}
              />
            ))}
          </tbody>
        </table>
        {filteredRecommendations.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No recommendations found</p>
          </div>
        )}
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'amber' | 'green' | 'red' | 'blue';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${colorClasses[color]} border`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
};

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );
};

interface RecommendationRowProps {
  recommendation: PricingRecommendation;
  selected: boolean;
  onSelect: () => void;
  onAction: (action: 'approve' | 'reject') => void;
  getPercentChange: (current: number, recommended: number) => number;
}

const RecommendationRow: React.FC<RecommendationRowProps> = ({
  recommendation,
  selected,
  onSelect,
  onAction,
  getPercentChange
}) => {
  const percentChange = getPercentChange(recommendation.currentRate, recommendation.recommendedRate);
  const isPositive = percentChange > 0;

  const statusConfig = {
    pending: { icon: <Clock className="w-4 h-4" />, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20', label: 'Pending' },
    approved: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20', label: 'Approved' },
    rejected: { icon: <XCircle className="w-4 h-4" />, color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20', label: 'Rejected' },
    applied: { icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20', label: 'Applied' },
  };

  const status = statusConfig[recommendation.status];

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          disabled={recommendation.status !== 'pending'}
          className="rounded border-slate-300"
        />
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-900 dark:text-white">{recommendation.roomType}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(recommendation.date).toLocaleDateString()}
        </p>
      </td>
      <td className="px-4 py-4">
        <p className="font-medium text-slate-900 dark:text-white">${recommendation.currentRate}</p>
      </td>
      <td className="px-4 py-4">
        <p className="font-semibold text-slate-900 dark:text-white">${recommendation.recommendedRate}</p>
      </td>
      <td className="px-4 py-4">
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {Math.abs(percentChange)}%
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="w-16 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${recommendation.confidence}%` }}
            />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">{recommendation.confidence}%</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate" title={recommendation.reason}>
          {recommendation.reason}
        </p>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
          {status.icon}
          {status.label}
        </span>
      </td>
      <td className="px-4 py-4">
        {recommendation.status === 'pending' ? (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAction('approve')}
              className="p-1.5 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
              title="Approve"
            >
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </button>
            <button
              onClick={() => onAction('reject')}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
              title="Reject"
            >
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>
          </div>
        ) : (
          <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default PricingRecommendations;
