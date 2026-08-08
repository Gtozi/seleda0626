/**
 * Overbooking Management Component
 * Manages overbooking limits, wash analysis, cancellation trends, no-show prediction, walk strategy, and risk assessment
 */

import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  XCircle,
  CheckCircle2,
  Settings,
  Shield,
  Activity,
  BarChart3,
  Bed
} from 'lucide-react';

const OverbookingManagement = () => {
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  const roomTypes = useMemo(() => [
    { id: '1', name: 'Deluxe Suite', totalRooms: 50, overbookLimit: 5, currentOverbook: 3, riskLevel: 'medium' },
    { id: '2', name: 'Standard Room', totalRooms: 100, overbookLimit: 10, currentOverbook: 8, riskLevel: 'high' },
    { id: '3', name: 'Ocean View', totalRooms: 30, overbookLimit: 3, currentOverbook: 1, riskLevel: 'low' },
    { id: '4', name: 'Family Suite', totalRooms: 25, overbookLimit: 4, currentOverbook: 2, riskLevel: 'medium' }
  ], []);

  const washAnalysis = useMemo(() => [
    { id: 1, period: 'Last 7 days', cancellations: 12, noShows: 5, washRate: 17, expectedWash: 15 },
    { id: 2, period: 'Last 30 days', cancellations: 45, noShows: 18, washRate: 16, expectedWash: 15 },
    { id: 3, period: 'Last 90 days', cancellations: 135, noShows: 52, washRate: 15.5, expectedWash: 15 }
  ], []);

  const cancellationTrends = useMemo(() => [
    { id: 1, segment: 'Leisure', rate: 12, trend: 'up', change: 2 },
    { id: 2, segment: 'Corporate', rate: 8, trend: 'down', change: -1 },
    { id: 3, segment: 'Group', rate: 5, trend: 'stable', change: 0 },
    { id: 4, segment: 'OTA', rate: 15, trend: 'up', change: 3 }
  ], []);

  const noShowPredictions = useMemo(() => [
    { id: 1, date: '2024-12-15', roomType: 'Deluxe Suite', bookings: 45, predictedNoShows: 4, confidence: 85 },
    { id: 2, date: '2024-12-16', roomType: 'Standard Room', bookings: 92, predictedNoShows: 9, confidence: 82 },
    { id: 3, date: '2024-12-17', roomType: 'Ocean View', bookings: 28, predictedNoShows: 2, confidence: 78 }
  ], []);

  const walkStrategy = useMemo(() => [
    { id: 1, partner: 'Hotel A (4-star)', distance: '0.5 km', rate: '$160', agreement: 'active' },
    { id: 2, partner: 'Hotel B (3-star)', distance: '1.2 km', rate: '$120', agreement: 'active' },
    { id: 3, partner: 'Hotel C (5-star)', distance: '2.0 km', rate: '$200', agreement: 'pending' }
  ], []);

  const riskAssessment = useMemo(() => [
    { id: 1, date: '2024-12-24', roomType: 'All', overbookCount: 12, riskLevel: 'high', factors: ['Holiday period', 'High demand', 'Low wash expected'] },
    { id: 2, date: '2024-12-25', roomType: 'All', overbookCount: 15, riskLevel: 'critical', factors: ['Christmas Day', 'Historically low no-show', 'Limited walk options'] },
    { id: 3, date: '2024-12-31', roomType: 'All', overbookCount: 8, riskLevel: 'medium', factors: ['New Year\'s Eve', 'Moderate demand', 'Good walk availability'] }
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Overbooking Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage overbooking limits, wash analysis, and walk strategy</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="7">Next 7 days</option>
            <option value="30">Next 30 days</option>
            <option value="90">Next 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" />
            Configure Limits
          </button>
        </div>
      </div>

      {/* Overbooking Limits */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Overbooking Limits by Room Type</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Adjust Limits
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roomTypes.map((room) => (
            <OverbookLimitCard
              key={room.id}
              room={room}
              selected={selectedRoomType === room.id}
              onSelect={() => setSelectedRoomType(room.id)}
            />
          ))}
        </div>
      </div>

      {/* Wash Analysis */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Wash Analysis (Cancellations + No-Shows)</h3>
        <div className="space-y-3">
          {washAnalysis.map((wash) => (
            <WashAnalysisCard key={wash.id} wash={wash} />
          ))}
        </div>
      </div>

      {/* Cancellation Trends */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Cancellation Trends by Segment</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {cancellationTrends.map((trend) => (
            <CancellationTrendCard key={trend.id} trend={trend} />
          ))}
        </div>
      </div>

      {/* No-Show Predictions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No-Show Predictions</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {noShowPredictions.map((prediction) => (
            <NoShowPredictionCard key={prediction.id} prediction={prediction} />
          ))}
        </div>
      </div>

      {/* Walk Strategy */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Walk Strategy Partners</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Partner
          </button>
        </div>
        <div className="space-y-3">
          {walkStrategy.map((partner) => (
            <WalkPartnerCard key={partner.id} partner={partner} />
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Assessment</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Calendar
          </button>
        </div>
        <div className="space-y-3">
          {riskAssessment.map((risk) => (
            <RiskAssessmentCard key={risk.id} risk={risk} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface OverbookLimitCardProps {
  room: {
    id: string;
    name: string;
    totalRooms: number;
    overbookLimit: number;
    currentOverbook: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  selected: boolean;
  onSelect: () => void;
}

const OverbookLimitCard: React.FC<OverbookLimitCardProps> = ({ room, selected, onSelect }) => {
  const riskColors = {
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
  };

  const usagePercent = Math.round((room.currentOverbook / room.overbookLimit) * 100);

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h4 className="font-semibold text-slate-900 dark:text-white">{room.name}</h4>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColors[room.riskLevel]} border`}>
          {room.riskLevel}
        </span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Limit</span>
          <span className="font-medium text-slate-900 dark:text-white">{room.overbookLimit} rooms</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Current</span>
          <span className="font-medium text-slate-900 dark:text-white">{room.currentOverbook} rooms</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              usagePercent >= 80 ? 'bg-red-500' : usagePercent >= 50 ? 'bg-amber-500' : 'bg-green-500'
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400">{usagePercent}% of limit used</p>
      </div>
    </div>
  );
};

interface WashAnalysisCardProps {
  wash: {
    id: number;
    period: string;
    cancellations: number;
    noShows: number;
    washRate: number;
    expectedWash: number;
  };
}

const WashAnalysisCard: React.FC<WashAnalysisCardProps> = ({ wash }) => {
  const variance = wash.washRate - wash.expectedWash;

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-4">
        <Activity className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{wash.period}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Cancellations: {wash.cancellations}</span>
            <span>No-Shows: {wash.noShows}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Wash Rate</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{wash.washRate}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Expected</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{wash.expectedWash}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Variance</p>
          <p className={`text-lg font-semibold ${variance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {variance >= 0 ? '+' : ''}{variance}%
          </p>
        </div>
      </div>
    </div>
  );
};

interface CancellationTrendCardProps {
  trend: {
    id: number;
    segment: string;
    rate: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
}

const CancellationTrendCard: React.FC<CancellationTrendCardProps> = ({ trend }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <h4 className="font-medium text-slate-900 dark:text-white mb-2">{trend.segment}</h4>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">Cancellation Rate</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{trend.rate}%</p>
        </div>
        <div className="flex items-center gap-2">
          {trend.trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-red-500" />
          ) : trend.trend === 'down' ? (
            <TrendingDown className="w-4 h-4 text-green-500" />
          ) : (
            <Activity className="w-4 h-4 text-slate-400" />
          )}
          <span className={`text-sm font-medium ${trend.change > 0 ? 'text-red-600 dark:text-red-400' : trend.change < 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-600 dark:text-slate-400'}`}>
            {trend.change > 0 ? '+' : ''}{trend.change}%
          </span>
        </div>
      </div>
    </div>
  );
};

interface NoShowPredictionCardProps {
  prediction: {
    id: number;
    date: string;
    roomType: string;
    bookings: number;
    predictedNoShows: number;
    confidence: number;
  };
}

const NoShowPredictionCard: React.FC<NoShowPredictionCardProps> = ({ prediction }) => {
  const noShowRate = Math.round((prediction.predictedNoShows / prediction.bookings) * 100);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-4">
        <Users className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 dark:text-white">{prediction.date}</h4>
            <span className="text-sm text-slate-600 dark:text-slate-400">• {prediction.roomType}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Bookings: {prediction.bookings}</span>
            <span>Predicted No-Shows: {prediction.predictedNoShows}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">No-Show Rate</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{noShowRate}%</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-600 dark:text-slate-400">Confidence</p>
          <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">{prediction.confidence}%</p>
        </div>
      </div>
    </div>
  );
};

interface WalkPartnerCardProps {
  partner: {
    id: number;
    partner: string;
    distance: string;
    rate: string;
    agreement: string;
  };
}

const WalkPartnerCard: React.FC<WalkPartnerCardProps> = ({ partner }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-3">
        <Shield className="w-5 h-5 text-blue-500" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{partner.partner}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Distance: {partner.distance}</span>
            <span>Rate: {partner.rate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          partner.agreement === 'active' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
        }`}>
          {partner.agreement}
        </span>
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

interface RiskAssessmentCardProps {
  risk: {
    id: number;
    date: string;
    roomType: string;
    overbookCount: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: string[];
  };
}

const RiskAssessmentCard: React.FC<RiskAssessmentCardProps> = ({ risk }) => {
  const riskColors = {
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    critical: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${
      risk.riskLevel === 'critical' 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
        : risk.riskLevel === 'high'
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
        : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <AlertTriangle className={`w-5 h-5 ${
            risk.riskLevel === 'critical' ? 'text-red-500' : 
            risk.riskLevel === 'high' ? 'text-orange-500' : 
            'text-amber-500'
          }`} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-slate-900 dark:text-white">{risk.date}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${riskColors[risk.riskLevel]} border`}>
                {risk.riskLevel}
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {risk.roomType} • {risk.overbookCount} overbooked
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-slate-600 dark:text-slate-400">Risk Factors:</p>
        {risk.factors.map((factor, idx) => (
          <p key={idx} className="text-sm text-slate-700 dark:text-slate-300">• {factor}</p>
        ))}
      </div>
    </div>
  );
};

export default OverbookingManagement;
