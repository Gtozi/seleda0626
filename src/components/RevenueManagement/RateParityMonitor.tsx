/**
 * Rate Parity Monitor Component
 * Monitors rate parity across all connected OTA channels
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
  Calendar,
  DollarSign,
  Building2,
  BarChart3,
  Globe,
  Search,
  Download,
  Settings
} from 'lucide-react';

interface RateParityViolation {
  id: string;
  channel_id: string;
  channel_name: string;
  room_type_id: string;
  room_type_name: string;
  date: string;
  our_rate: number;
  channel_rate: number;
  difference_percent: number;
  parity_status: 'in_parity' | 'undercut' | 'overpriced';
  auto_correction_attempted: boolean;
  auto_correction_success: boolean;
  detected_at: string;
}

interface ParityStats {
  totalChecks: number;
  inParity: number;
  violations: number;
  undercut: number;
  overpriced: number;
  avgDifference: number;
}

const RateParityMonitor = () => {
  const [violations, setViolations] = useState<RateParityViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [autoCorrecting, setAutoCorrecting] = useState(false);

  const fetchParityData = async () => {
    try {
      const res = await fetch('/api/rms/rate-parity');
      if (res.ok) {
        const data = await res.json();
        setViolations(data);
      }
    } catch (error) {
      console.error('Failed to fetch parity data:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchParityData();
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const matchesSearch = 
        v.channel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.room_type_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesChannel = selectedChannel === 'all' || v.channel_id === selectedChannel;
      const matchesStatus = selectedStatus === 'all' || v.parity_status === selectedStatus;
      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [violations, searchQuery, selectedChannel, selectedStatus]);

  const stats = useMemo<ParityStats>(() => ({
    totalChecks: violations.length,
    inParity: violations.filter(v => v.parity_status === 'in_parity').length,
    violations: violations.filter(v => v.parity_status !== 'in_parity').length,
    undercut: violations.filter(v => v.parity_status === 'undercut').length,
    overpriced: violations.filter(v => v.parity_status === 'overpriced').length,
    avgDifference: violations.length > 0 
      ? violations.reduce((sum, v) => sum + v.difference_percent, 0) / violations.length 
      : 0
  }), [violations]);

  const handleAutoCorrect = async (violationId: string) => {
    try {
      setAutoCorrecting(true);
      const res = await fetch(`/api/rms/rate-parity/${violationId}/correct`, {
        method: 'POST'
      });
      if (res.ok) {
        await fetchParityData();
      }
    } catch (error) {
      console.error('Failed to auto-correct:', error);
    } finally {
      setAutoCorrecting(false);
    }
  };

  const handleBulkAutoCorrect = async () => {
    try {
      setAutoCorrecting(true);
      const res = await fetch('/api/rms/rate-parity/bulk-correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violationIds: filteredViolations.filter(v => v.parity_status !== 'in_parity').map(v => v.id)
        })
      });
      if (res.ok) {
        await fetchParityData();
      }
    } catch (error) {
      console.error('Failed to bulk auto-correct:', error);
    } finally {
      setAutoCorrecting(false);
    }
  };

  const getParityStatusColor = (status: string) => {
    const colors = {
      in_parity: 'bg-green-100 text-green-700',
      undercut: 'bg-red-100 text-red-700',
      overpriced: 'bg-amber-100 text-amber-700'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getParityStatusIcon = (status: string) => {
    const icons = {
      in_parity: <CheckCircle2 className="w-4 h-4" />,
      undercut: <TrendingDown className="w-4 h-4" />,
      overpriced: <TrendingUp className="w-4 h-4" />
    };
    return icons[status as keyof typeof icons] || <AlertTriangle className="w-4 h-4" />;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rate Parity Monitor</h2>
          <p className="text-slate-600">Monitor rate parity across all OTA channels</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchParityData}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={handleBulkAutoCorrect}
            disabled={autoCorrecting || stats.violations === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Settings className="w-4 h-4" />
            Auto-Correct All ({stats.violations})
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Checks</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalChecks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">In Parity</p>
              <p className="text-2xl font-bold text-slate-900">{stats.inParity}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Violations</p>
              <p className="text-2xl font-bold text-slate-900">{stats.violations}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Undercut</p>
              <p className="text-2xl font-bold text-slate-900">{stats.undercut}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Overpriced</p>
              <p className="text-2xl font-bold text-slate-900">{stats.overpriced}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by channel or room type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Channels</option>
              <option value="bookingcom">Booking.com</option>
              <option value="expedia">Expedia</option>
              <option value="airbnb">Airbnb</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Status</option>
              <option value="in_parity">In Parity</option>
              <option value="undercut">Undercut</option>
              <option value="overpriced">Overpriced</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Parity Violations Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Channel</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Room Type</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Our Rate</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Channel Rate</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Difference</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Auto-Correction</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredViolations.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                  No parity data found
                </td>
              </tr>
            ) : (
              filteredViolations.map(violation => (
                <tr key={violation.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">{violation.channel_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{violation.room_type_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-900">{new Date(violation.date).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="font-medium text-slate-900">${violation.our_rate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-900">${violation.channel_rate}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-medium ${
                      violation.difference_percent <= 5 ? 'text-green-600' : 
                      violation.difference_percent <= 10 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {violation.difference_percent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getParityStatusColor(violation.parity_status)}`}>
                      {getParityStatusIcon(violation.parity_status)}
                      {violation.parity_status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {violation.auto_correction_attempted ? (
                      violation.auto_correction_success ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-slate-500">Not attempted</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {violation.parity_status !== 'in_parity' && !violation.auto_correction_attempted && (
                      <button
                        onClick={() => handleAutoCorrect(violation.id)}
                        disabled={autoCorrecting}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        Auto-Correct
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-bold text-blue-900 text-sm mb-1">Rate Parity Guidelines</h4>
          <p className="text-sm text-blue-700">
            Rate parity violations occur when your rates differ significantly from OTA channels. 
            A difference of more than 5% is considered a violation. Use auto-correction to automatically 
            adjust your rates to match channel rates, or manually update them in the pricing module.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateParityMonitor;
