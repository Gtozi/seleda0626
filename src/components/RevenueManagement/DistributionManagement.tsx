/**
 * Distribution Management Component
 * Manages channel availability, rate distribution, inventory distribution, channel restrictions, and rate parity
 */

import React, { useState, useMemo } from 'react';
import {
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  Sync,
  Calendar,
  DollarSign,
  Bed
} from 'lucide-react';

const DistributionManagement = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  const distributionChannels = useMemo(() => [
    { 
      id: 'booking', 
      name: 'Booking.com', 
      status: 'connected',
      lastSync: '10 min ago',
      availabilitySync: true,
      rateSync: true,
      bookingSync: true,
      parityStatus: 'ok'
    },
    { 
      id: 'expedia', 
      name: 'Expedia', 
      status: 'connected',
      lastSync: '15 min ago',
      availabilitySync: true,
      rateSync: true,
      bookingSync: true,
      parityStatus: 'violation'
    },
    { 
      id: 'airbnb', 
      name: 'Airbnb', 
      status: 'connected',
      lastSync: '20 min ago',
      availabilitySync: true,
      rateSync: true,
      bookingSync: false,
      parityStatus: 'ok'
    },
    { 
      id: 'agoda', 
      name: 'Agoda', 
      status: 'disconnected',
      lastSync: '2 hours ago',
      availabilitySync: false,
      rateSync: false,
      bookingSync: false,
      parityStatus: 'unknown'
    }
  ], []);

  const rateParityIssues = useMemo(() => [
    { id: 1, channel: 'Expedia', roomType: 'Deluxe Suite', ourRate: 165, channelRate: 155, diff: -10, status: 'violation' },
    { id: 2, channel: 'Booking.com', roomType: 'Standard Room', ourRate: 100, channelRate: 105, diff: +5, status: 'warning' },
    { id: 3, channel: 'Airbnb', roomType: 'Ocean View', ourRate: 200, channelRate: 210, diff: +10, status: 'warning' }
  ], []);

  const distributionRules = useMemo(() => [
    { id: 1, channel: 'All OTAs', roomType: 'Deluxe Suite', allocation: 30, restriction: 'Min 3 nights', active: true },
    { id: 2, channel: 'Booking.com', roomType: 'Standard Room', allocation: 50, restriction: 'None', active: true },
    { id: 3, channel: 'Expedia', roomType: 'Family Suite', allocation: 20, restriction: 'Min 2 nights', active: false }
  ], []);

  const syncSchedule = useMemo(() => [
    { id: 1, type: 'Availability', frequency: 'Real-time', lastRun: '10 min ago', nextRun: 'Continuous' },
    { id: 2, type: 'Rates', frequency: 'Hourly', lastRun: '15 min ago', nextRun: '45 min' },
    { id: 3, type: 'Bookings', frequency: 'Every 15 min', lastRun: '20 min ago', nextRun: '10 min' }
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Distribution Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage channel distribution, rate parity, and sync settings</p>
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
            <Sync className="w-4 h-4" />
            Sync All
          </button>
        </div>
      </div>

      {/* Channel Status */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Channel Connection Status</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Channel
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {distributionChannels.map((channel) => (
            <ChannelStatusCard
              key={channel.id}
              channel={channel}
              selected={selectedChannel === channel.id}
              onSelect={() => setSelectedChannel(channel.id)}
            />
          ))}
        </div>
      </div>

      {/* Rate Parity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rate Parity Monitoring</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">{rateParityIssues.filter(r => r.status === 'violation').length} violations</span>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Check Parity
            </button>
          </div>
        </div>
        <div className="space-y-3">
          {rateParityIssues.map((issue) => (
            <ParityIssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </div>

      {/* Distribution Rules */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Distribution Rules</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Rule
          </button>
        </div>
        <div className="space-y-3">
          {distributionRules.map((rule) => (
            <DistributionRuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      </div>

      {/* Sync Schedule */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sync Schedule</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Configure
          </button>
        </div>
        <div className="space-y-3">
          {syncSchedule.map((schedule) => (
            <SyncScheduleCard key={schedule.id} schedule={schedule} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface ChannelStatusCardProps {
  channel: {
    id: string;
    name: string;
    status: 'connected' | 'disconnected';
    lastSync: string;
    availabilitySync: boolean;
    rateSync: boolean;
    bookingSync: boolean;
    parityStatus: 'ok' | 'violation' | 'unknown';
  };
  selected: boolean;
  onSelect: () => void;
}

const ChannelStatusCard: React.FC<ChannelStatusCardProps> = ({ channel, selected, onSelect }) => {
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
          <Globe className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h4 className="font-semibold text-slate-900 dark:text-white">{channel.name}</h4>
        </div>
        {channel.status === 'connected' ? (
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        ) : (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Status</span>
          <span className={`font-medium ${channel.status === 'connected' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {channel.status}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 dark:text-slate-400">Last Sync</span>
          <span className="text-slate-900 dark:text-white">{channel.lastSync}</span>
        </div>
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
          {channel.availabilitySync ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-slate-600 dark:text-slate-400">Availability</span>
        </div>
        <div className="flex items-center gap-2">
          {channel.rateSync ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-slate-600 dark:text-slate-400">Rates</span>
        </div>
        <div className="flex items-center gap-2">
          {channel.bookingSync ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400" />
          )}
          <span className="text-slate-600 dark:text-slate-400">Bookings</span>
        </div>
      </div>
      {channel.parityStatus === 'violation' && (
        <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">Parity Violation</span>
          </div>
        </div>
      )}
    </div>
  );
};

interface ParityIssueCardProps {
  issue: {
    id: number;
    channel: string;
    roomType: string;
    ourRate: number;
    channelRate: number;
    diff: number;
    status: 'violation' | 'warning';
  };
}

const ParityIssueCard: React.FC<ParityIssueCardProps> = ({ issue }) => {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${
      issue.status === 'violation' 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
        : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
    }`}>
      <div className="flex items-center gap-3">
        {issue.status === 'violation' ? (
          <AlertTriangle className="w-5 h-5 text-red-500" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 dark:text-white">{issue.channel}</h4>
            <span className="text-sm text-slate-600 dark:text-slate-400">• {issue.roomType}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-600 dark:text-slate-400">Our rate: ${issue.ourRate}</span>
            <span className="text-slate-600 dark:text-slate-400">Channel: ${issue.channelRate}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className={`text-lg font-semibold ${issue.status === 'violation' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {issue.diff > 0 ? '+' : ''}{issue.diff}%
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">difference</p>
        </div>
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

interface DistributionRuleCardProps {
  rule: {
    id: number;
    channel: string;
    roomType: string;
    allocation: number;
    restriction: string;
    active: boolean;
  };
}

const DistributionRuleCard: React.FC<DistributionRuleCardProps> = ({ rule }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-3">
        {rule.active ? (
          <Unlock className="w-5 h-5 text-green-500" />
        ) : (
          <Lock className="w-5 h-5 text-slate-400" />
        )}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 dark:text-white">{rule.channel}</h4>
            <span className="text-sm text-slate-600 dark:text-slate-400">• {rule.roomType}</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Allocation: {rule.allocation}%</span>
            <span>Restriction: {rule.restriction}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
        <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
          <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
};

interface SyncScheduleCardProps {
  schedule: {
    id: number;
    type: string;
    frequency: string;
    lastRun: string;
    nextRun: string;
  };
}

const SyncScheduleCard: React.FC<SyncScheduleCardProps> = ({ schedule }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center gap-3">
        <Sync className="w-5 h-5 text-blue-500" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{schedule.type}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">Frequency: {schedule.frequency}</p>
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Last Run</p>
          <p className="font-medium text-slate-900 dark:text-white">{schedule.lastRun}</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Next Run</p>
          <p className="font-medium text-slate-900 dark:text-white">{schedule.nextRun}</p>
        </div>
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default DistributionManagement;
