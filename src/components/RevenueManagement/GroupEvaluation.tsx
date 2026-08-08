/**
 * Group Evaluation Component
 * Analyzes group inquiries, revenue projection, profitability, space utilization, and acceptance recommendations
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  BarChart3,
  Bed,
  Settings,
  Eye
} from 'lucide-react';

const GroupEvaluation = () => {
  const [selectedInquiry, setSelectedInquiry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const groupInquiries = useMemo(() => [
    { 
      id: '1', 
      name: 'Tech Conference 2024', 
      company: 'TechCorp Inc',
      contact: 'John Smith',
      status: 'pending',
      rooms: 50,
      nights: 3,
      checkIn: '2024-12-15',
      checkOut: '2024-12-18',
      proposedRate: 145,
      projectedRevenue: 21750,
      profitability: 28,
      spaceUtilization: 75,
      recommendation: 'accept',
      confidence: 85,
      priority: 'high'
    },
    { 
      id: '2', 
      name: 'Annual Sales Meeting', 
      company: 'SalesForce Global',
      contact: 'Jane Doe',
      status: 'pending',
      rooms: 35,
      nights: 2,
      checkIn: '2024-11-20',
      checkOut: '2024-11-22',
      proposedRate: 130,
      projectedRevenue: 9100,
      profitability: 32,
      spaceUtilization: 52,
      recommendation: 'accept',
      confidence: 78,
      priority: 'medium'
    },
    { 
      id: '3', 
      name: 'Wedding Block', 
      company: 'Johnson Family',
      contact: 'Sarah Johnson',
      status: 'pending',
      rooms: 20,
      nights: 2,
      checkIn: '2024-10-10',
      checkOut: '2024-10-12',
      proposedRate: 160,
      projectedRevenue: 6400,
      profitability: 35,
      spaceUtilization: 30,
      recommendation: 'accept',
      confidence: 92,
      priority: 'low'
    },
    { 
      id: '4', 
      name: 'Sports Team Retreat', 
      company: 'City FC',
      contact: 'Mike Brown',
      status: 'pending',
      rooms: 45,
      nights: 4,
      checkIn: '2024-12-28',
      checkOut: '2025-01-01',
      proposedRate: 110,
      projectedRevenue: 19800,
      profitability: 18,
      spaceUtilization: 67,
      recommendation: 'reject',
      confidence: 72,
      priority: 'high'
    }
  ], []);

  const evaluationMetrics = useMemo(() => {
    const pending = groupInquiries.filter(g => g.status === 'pending');
    const totalProjectedRevenue = pending.reduce((sum, g) => sum + g.projectedRevenue, 0);
    const avgProfitability = Math.round(pending.reduce((sum, g) => sum + g.profitability, 0) / pending.length);
    const totalRooms = pending.reduce((sum, g) => sum + g.rooms, 0);

    return { pending, totalProjectedRevenue, avgProfitability, totalRooms };
  }, [groupInquiries]);

  const filteredInquiries = useMemo(() => {
    if (viewMode === 'all') return groupInquiries;
    return groupInquiries.filter(g => g.status === viewMode);
  }, [groupInquiries, viewMode]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Group Evaluation</h2>
          <p className="text-slate-600 dark:text-slate-400">Analyze group inquiries and acceptance recommendations</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="all">All Inquiries</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Users className="w-4 h-4" />
            New Inquiry
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Inquiries"
          value={evaluationMetrics.pending.length}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <MetricCard
          title="Projected Revenue"
          value={`$${evaluationMetrics.totalProjectedRevenue.toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="green"
        />
        <MetricCard
          title="Avg Profitability"
          value={`${evaluationMetrics.avgProfitability}%`}
          icon={<TrendingUp className="w-5 h-5" />}
          color="purple"
        />
        <MetricCard
          title="Total Rooms"
          value={evaluationMetrics.totalRooms}
          icon={<Bed className="w-5 h-5" />}
          color="orange"
        />
      </div>

      {/* Group Inquiries */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Group Inquiries</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {filteredInquiries.map((inquiry) => (
            <GroupInquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              selected={selectedInquiry === inquiry.id}
              onSelect={() => setSelectedInquiry(inquiry.id)}
            />
          ))}
        </div>
      </div>

      {/* Evaluation Criteria */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Evaluation Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <CriteriaCard
            title="Revenue Projection"
            description="Estimated total revenue from group booking"
            weight="30%"
            icon={<DollarSign className="w-5 h-5" />}
          />
          <CriteriaCard
            title="Profitability"
            description="Net profit margin after costs"
            weight="25%"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <CriteriaCard
            title="Space Utilization"
            description="Percentage of total inventory utilized"
            weight="25%"
            icon={<Bed className="w-5 h-5" />}
          />
          <CriteriaCard
            title="Date Strategic Value"
            description="Impact on high-demand periods"
            weight="20%"
            icon={<Calendar className="w-5 h-5" />}
          />
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

interface GroupInquiryCardProps {
  inquiry: {
    id: string;
    name: string;
    company: string;
    contact: string;
    status: string;
    rooms: number;
    nights: number;
    checkIn: string;
    checkOut: string;
    proposedRate: number;
    projectedRevenue: number;
    profitability: number;
    spaceUtilization: number;
    recommendation: string;
    confidence: number;
    priority: string;
  };
  selected: boolean;
  onSelect: () => void;
}

const GroupInquiryCard: React.FC<GroupInquiryCardProps> = ({ inquiry, selected, onSelect }) => {
  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  };

  const recommendationColors = {
    accept: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    reject: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    review: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
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
            <h4 className="font-semibold text-slate-900 dark:text-white">{inquiry.name}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${priorityColors[inquiry.priority as keyof typeof priorityColors]}`}>
              {inquiry.priority}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${recommendationColors[inquiry.recommendation as keyof typeof recommendationColors]}`}>
              {inquiry.recommendation}
            </span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{inquiry.company} • {inquiry.contact}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">Confidence</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">{inquiry.confidence}%</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Rooms</p>
          <p className="font-medium text-slate-900 dark:text-white">{inquiry.rooms}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Nights</p>
          <p className="font-medium text-slate-900 dark:text-white">{inquiry.nights}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Rate</p>
          <p className="font-medium text-slate-900 dark:text-white">${inquiry.proposedRate}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Revenue</p>
          <p className="font-medium text-green-600 dark:text-green-400">${inquiry.projectedRevenue.toLocaleString()}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>{inquiry.checkIn} → {inquiry.checkOut}</span>
          <span>Profit: {inquiry.profitability}%</span>
          <span>Space: {inquiry.spaceUtilization}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors" title="Accept">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          </button>
          <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Reject">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors" title="View Details">
            <Eye className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface CriteriaCardProps {
  title: string;
  description: string;
  weight: string;
  icon: React.ReactNode;
}

const CriteriaCard: React.FC<CriteriaCardProps> = ({ title, description, weight, icon }) => {
  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-600 dark:text-slate-400">Weight</span>
        <span className="font-semibold text-blue-600 dark:text-blue-400">{weight}</span>
      </div>
    </div>
  );
};

export default GroupEvaluation;
