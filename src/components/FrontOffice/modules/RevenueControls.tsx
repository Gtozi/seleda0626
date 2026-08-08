/**
 * Front Office Revenue Controls Module
 * Dynamic pricing, rate management, and revenue optimization
 */

import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  TrendingUp,
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
  DollarSign,
  BarChart3,
  Settings,
  Percent,
  Lock,
  Unlock,
  Zap,
  Target
} from 'lucide-react';
import StatCard from '../StatCard';

type PricingStatus = 'active' | 'inactive' | 'scheduled' | 'expired';
type PricingType = 'dynamic' | 'fixed' | 'seasonal' | 'promotional' | 'corporate';
type RestrictionType = 'min_stay' | 'max_stay' | 'closed_to_arrival' | 'closed_to_departure' | 'check_in_only' | 'check_out_only';

interface RatePlan {
  id: string;
  name: string;
  type: PricingType;
  status: PricingStatus;
  baseRate: number;
  currentRate: number;
  occupancyThreshold: number;
  markupPercent: number;
  roomTypes: string[];
  validFrom: string;
  validTo?: string;
  description: string;
}

interface Restriction {
  id: string;
  roomType: string;
  type: RestrictionType;
  value: number;
  startDate: string;
  endDate?: string;
  active: boolean;
  description: string;
}

interface PricingRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  value: number;
  active: boolean;
  priority: number;
}

const RevenueControls = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'rates' | 'restrictions' | 'rules' | 'analytics') || 'rates';
  const setActiveTab = (tab: 'rates' | 'restrictions' | 'rules' | 'analytics') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showRateModal, setShowRateModal] = useState(false);
  const [showRestrictionModal, setShowRestrictionModal] = useState(false);
  const [selectedRate, setSelectedRate] = useState<RatePlan | null>(null);

  const [rateForm, setRateForm] = useState({
    name: '',
    type: 'dynamic' as PricingType,
    baseRate: '',
    occupancyThreshold: '',
    markupPercent: '',
    validFrom: '',
    validTo: '',
    description: ''
  });

  const [ratePlans] = useState<RatePlan[]>([
    {
      id: 'RATE-001',
      name: 'Standard Dynamic Rate',
      type: 'dynamic',
      status: 'active',
      baseRate: 150,
      currentRate: 165,
      occupancyThreshold: 70,
      markupPercent: 10,
      roomTypes: ['Deluxe King', 'Standard Twin'],
      validFrom: '2026-01-01',
      description: 'Dynamic pricing based on occupancy',
    },
    {
      id: 'RATE-002',
      name: 'Summer Peak Season',
      type: 'seasonal',
      status: 'active',
      baseRate: 180,
      currentRate: 200,
      occupancyThreshold: 50,
      markupPercent: 11,
      roomTypes: ['All'],
      validFrom: '2026-06-01',
      validTo: '2026-08-31',
      description: 'Summer season premium pricing',
    },
    {
      id: 'RATE-003',
      name: 'Corporate Negotiated',
      type: 'corporate',
      status: 'active',
      baseRate: 130,
      currentRate: 130,
      occupancyThreshold: 0,
      markupPercent: 0,
      roomTypes: ['Deluxe King', 'Suite'],
      validFrom: '2026-01-01',
      description: 'Corporate contract rates',
    },
    {
      id: 'RATE-004',
      name: 'Early Bird Discount',
      type: 'promotional',
      status: 'active',
      baseRate: 150,
      currentRate: 135,
      occupancyThreshold: 0,
      markupPercent: -10,
      roomTypes: ['All'],
      validFrom: '2026-01-01',
      description: '10% discount for bookings 30+ days in advance',
    },
    {
      id: 'RATE-005',
      name: 'Holiday Weekend',
      type: 'seasonal',
      status: 'scheduled',
      baseRate: 200,
      currentRate: 220,
      occupancyThreshold: 40,
      markupPercent: 10,
      roomTypes: ['All'],
      validFrom: '2026-12-20',
      validTo: '2026-12-27',
      description: 'Holiday weekend premium',
    },
  ]);

  const [restrictions] = useState<Restriction[]>([
    {
      id: 'RES-001',
      roomType: 'Deluxe King',
      type: 'min_stay',
      value: 2,
      startDate: '2026-07-29',
      endDate: '2026-07-31',
      active: true,
      description: 'Minimum 2 nights for weekend',
    },
    {
      id: 'RES-002',
      roomType: 'Suite',
      type: 'closed_to_arrival',
      value: 0,
      startDate: '2026-07-30',
      active: true,
      description: 'No check-ins on Sunday',
    },
    {
      id: 'RES-003',
      roomType: 'Standard Twin',
      type: 'max_stay',
      value: 7,
      startDate: '2026-07-29',
      endDate: '2026-08-15',
      active: true,
      description: 'Maximum 7 nights during peak season',
    },
    {
      id: 'RES-004',
      roomType: 'All',
      type: 'closed_to_departure',
      value: 0,
      startDate: '2026-08-01',
      active: false,
      description: 'No check-outs on Monday (inactive)',
    },
  ]);

  const [pricingRules] = useState<PricingRule[]>([
    {
      id: 'RULE-001',
      name: 'High Occupancy Markup',
      condition: 'Occupancy > 80%',
      action: 'Increase rate by',
      value: 15,
      active: true,
      priority: 1,
    },
    {
      id: 'RULE-002',
      name: 'Last Minute Discount',
      condition: 'Check-in within 3 days AND Occupancy < 50%',
      action: 'Decrease rate by',
      value: 20,
      active: true,
      priority: 2,
    },
    {
      id: 'RULE-003',
      name: 'Weekend Premium',
      condition: 'Day is Friday or Saturday',
      action: 'Increase rate by',
      value: 10,
      active: true,
      priority: 3,
    },
    {
      id: 'RULE-004',
      name: 'Long Stay Discount',
      condition: 'Stay length >= 7 nights',
      action: 'Decrease rate by',
      value: 15,
      active: true,
      priority: 4,
    },
  ]);

  const filteredRates = ratePlans.filter(rate => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      rate.name.toLowerCase().includes(q) ||
      rate.type.toLowerCase().includes(q) ||
      rate.description.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: PricingStatus) => {
    const config: Record<PricingStatus, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
      inactive: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Inactive' },
      scheduled: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Scheduled' },
      expired: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Expired' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getTypeBadge = (type: PricingType) => {
    const config: Record<PricingType, { bg: string; text: string; label: string }> = {
      dynamic: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Dynamic' },
      fixed: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Fixed' },
      seasonal: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Seasonal' },
      promotional: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Promotional' },
      corporate: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Corporate' },
    };
    const c = config[type];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const handleRateSubmit = () => {
    setShowRateModal(false);
    setRateForm({
      name: '',
      type: 'dynamic',
      baseRate: '',
      occupancyThreshold: '',
      markupPercent: '',
      validFrom: '',
      validTo: '',
      description: ''
    });
  };

  const handleRestrictionSubmit = () => {
    setShowRestrictionModal(false);
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
    <div className="space-y-6 animate-fade-in" id="revenue-controls">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Revenue Controls</h2>
          <p className="text-sm text-slate-500 mt-1">Dynamic pricing, rate management, and revenue optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            New Rate Plan
          </button>
          <button className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Rate Plans" value="4" icon={DollarSign} variant="primary" />
        <StatCard label="Current ADR" value="$167" icon={TrendingUp} variant="revenue" />
        <StatCard label="Occupancy" value="72%" icon={Target} variant="revenue" />
        <StatCard label="RevPAR" value="$120" icon={BarChart3} variant="revenue" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="rates" label="Rate Plans" icon={DollarSign} />
        <TabButton id="restrictions" label="Restrictions" icon={Lock} />
        <TabButton id="rules" label="Pricing Rules" icon={Zap} />
        <TabButton id="analytics" label="Analytics" icon={BarChart3} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'rates' || activeTab === 'restrictions') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search rate plans or restrictions..."
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

      {/* Rates Tab */}
      {activeTab === 'rates' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Rate Plans</h3>
            <span className="text-xs text-slate-500">{filteredRates.length} plans</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Rate Plan</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Base Rate</th>
                  <th className="px-4 py-3 text-left font-semibold">Current Rate</th>
                  <th className="px-4 py-3 text-left font-semibold">Markup</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRates.map((rate) => (
                  <tr key={rate.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{rate.name}</div>
                      <div className="text-xs text-slate-500">{rate.description}</div>
                    </td>
                    <td className="px-4 py-3">{getTypeBadge(rate.type)}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">${rate.baseRate}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">${rate.currentRate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-medium ${rate.markupPercent >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {rate.markupPercent > 0 ? '+' : ''}{rate.markupPercent}%
                      </span>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(rate.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedRate(rate)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="View details"
                        >
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Toggle">
                          {rate.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
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

      {/* Restrictions Tab */}
      {activeTab === 'restrictions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Booking Restrictions</h3>
            <button
              onClick={() => setShowRestrictionModal(true)}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              + Add Restriction
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Room Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Value</th>
                  <th className="px-4 py-3 text-left font-semibold">Date Range</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {restrictions.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-900 font-medium">{res.roomType}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{res.type.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-slate-900">{res.value > 0 ? res.value : '-'}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {res.startDate}
                      {res.endDate && ` to ${res.endDate}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${res.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {res.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Toggle">
                          {res.active ? <Lock size={16} /> : <Unlock size={16} />}
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

      {/* Rules Tab */}
      {activeTab === 'rules' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Automated Pricing Rules</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pricingRules.map((rule) => (
              <div key={rule.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900">{rule.name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {rule.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">Priority: {rule.priority}</span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      <span className="font-medium">If:</span> {rule.condition}
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Then:</span> {rule.action} {rule.value}%
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Edit">
                      <Edit size={16} />
                    </button>
                    <button className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer" title="Toggle">
                      {rule.active ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-6">Revenue Performance Analytics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Average Daily Rate (ADR)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">$167</p>
              <p className="text-sm text-emerald-600">+8% from last month</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Revenue Per Available Room (RevPAR)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">$120</p>
              <p className="text-sm text-emerald-600">+12% from last month</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Occupancy Rate</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">72%</p>
              <p className="text-sm text-amber-600">-3% from last month</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Dynamic Pricing Impact</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">+$4,250</p>
              <p className="text-sm text-slate-500">Additional revenue this month</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Rate Plan Performance</p>
              <p className="text-lg font-bold text-slate-900 mt-1">Standard Dynamic</p>
              <p className="text-sm text-slate-500">Best performing plan</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Price Elasticity</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">-0.4</p>
              <p className="text-sm text-slate-500">Demand sensitivity to price</p>
            </div>
          </div>
        </div>
      )}

      {/* Rate Modal */}
      {showRateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Create Rate Plan</h3>
              <button onClick={() => setShowRateModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rate Plan Name</label>
                  <input
                    type="text"
                    value={rateForm.name}
                    onChange={(e) => setRateForm({ ...rateForm, name: e.target.value })}
                    placeholder="Enter rate plan name"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Type</label>
                  <select
                    value={rateForm.type}
                    onChange={(e) => setRateForm({ ...rateForm, type: e.target.value as PricingType })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="dynamic">Dynamic</option>
                    <option value="fixed">Fixed</option>
                    <option value="seasonal">Seasonal</option>
                    <option value="promotional">Promotional</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Base Rate ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      value={rateForm.baseRate}
                      onChange={(e) => setRateForm({ ...rateForm, baseRate: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Occupancy Threshold (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      value={rateForm.occupancyThreshold}
                      onChange={(e) => setRateForm({ ...rateForm, occupancyThreshold: e.target.value })}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Markup/Discount (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="number"
                      value={rateForm.markupPercent}
                      onChange={(e) => setRateForm({ ...rateForm, markupPercent: e.target.value })}
                      placeholder="0"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
                <div></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valid From</label>
                  <input
                    type="date"
                    value={rateForm.validFrom}
                    onChange={(e) => setRateForm({ ...rateForm, validFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Valid To (optional)</label>
                  <input
                    type="date"
                    value={rateForm.validTo}
                    onChange={(e) => setRateForm({ ...rateForm, validTo: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                <textarea
                  value={rateForm.description}
                  onChange={(e) => setRateForm({ ...rateForm, description: e.target.value })}
                  rows={3}
                  placeholder="Describe the rate plan..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowRateModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleRateSubmit} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">
                <Save size={16} />
                Create Rate Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restriction Modal */}
      {showRestrictionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Add Booking Restriction</h3>
              <button onClick={() => setShowRestrictionModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-500">Restriction creation form placeholder.</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowRestrictionModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={handleRestrictionSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">Add Restriction</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueControls;
