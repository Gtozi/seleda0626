/**
 * Inventory Controls Component
 * Manages room inventory allocation, sell limits, stop sell, and allotments
 */

import React, { useState, useMemo } from 'react';
import {
  Bed,
  AlertTriangle,
  Lock,
  Unlock,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Users
} from 'lucide-react';

const InventoryControls = () => {
  const [selectedRoomType, setSelectedRoomType] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('30');

  const roomTypes = useMemo(() => [
    { id: '1', name: 'Deluxe Suite', totalRooms: 50, available: 35, sold: 15, stopSell: false },
    { id: '2', name: 'Standard Room', totalRooms: 100, available: 60, sold: 40, stopSell: false },
    { id: '3', name: 'Ocean View', totalRooms: 30, available: 20, sold: 10, stopSell: true },
    { id: '4', name: 'Family Suite', totalRooms: 25, available: 18, sold: 7, stopSell: false }
  ], []);

  const sellLimits = useMemo(() => [
    { id: 1, roomType: 'Deluxe Suite', channel: 'All Channels', limit: 40, used: 35, remaining: 5 },
    { id: 2, roomType: 'Standard Room', channel: 'OTA', limit: 50, used: 45, remaining: 5 },
    { id: 3, roomType: 'Ocean View', channel: 'Direct', limit: 15, used: 12, remaining: 3 }
  ], []);

  const allotments = useMemo(() => [
    { id: 1, operator: 'Travel Corp X', roomType: 'Deluxe Suite', total: 20, released: 15, remaining: 5, expiry: '2024-12-31' },
    { id: 2, operator: 'Agency Y', roomType: 'Standard Room', total: 30, released: 25, remaining: 5, expiry: '2024-11-30' },
    { id: 3, operator: 'Tour Operator Z', roomType: 'Family Suite', total: 10, released: 8, remaining: 2, expiry: '2024-12-15' }
  ], []);

  const stopSellDates = useMemo(() => [
    { id: 1, roomType: 'Ocean View', startDate: '2024-12-20', endDate: '2024-12-31', reason: 'Holiday period' },
    { id: 2, roomType: 'Deluxe Suite', startDate: '2024-12-24', endDate: '2024-12-26', reason: 'Christmas' }
  ], []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Inventory Controls</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage room inventory, sell limits, and allotments</p>
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
            <Plus className="w-4 h-4" />
            Add Allotment
          </button>
        </div>
      </div>

      {/* Room Inventory */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Room Inventory</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Calendar
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roomTypes.map((room) => (
            <InventoryCard
              key={room.id}
              room={room}
              selected={selectedRoomType === room.id}
              onSelect={() => setSelectedRoomType(room.id)}
            />
          ))}
        </div>
      </div>

      {/* Sell Limits */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Sell Limits</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Limit
          </button>
        </div>
        <div className="space-y-3">
          {sellLimits.map((limit) => (
            <SellLimitCard key={limit.id} limit={limit} />
          ))}
        </div>
      </div>

      {/* Allotments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Allotments</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Allotment
          </button>
        </div>
        <div className="space-y-3">
          {allotments.map((allotment) => (
            <AllotmentCard key={allotment.id} allotment={allotment} />
          ))}
        </div>
      </div>

      {/* Stop Sell Dates */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Stop Sell Dates</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            + Add Stop Sell
          </button>
        </div>
        <div className="space-y-3">
          {stopSellDates.map((date) => (
            <StopSellCard key={date.id} date={date} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface InventoryCardProps {
  room: {
    id: string;
    name: string;
    totalRooms: number;
    available: number;
    sold: number;
    stopSell: boolean;
  };
  selected: boolean;
  onSelect: () => void;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ room, selected, onSelect }) => {
  const occupancyPercent = Math.round((room.sold / room.totalRooms) * 100);

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
        <div className="flex items-center gap-2">
          <Bed className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          <h4 className="font-semibold text-slate-900 dark:text-white">{room.name}</h4>
        </div>
        {room.stopSell ? (
          <Lock className="w-5 h-5 text-red-500" />
        ) : (
          <Unlock className="w-5 h-5 text-green-500" />
        )}
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Occupancy</span>
          <span className="font-medium text-slate-900 dark:text-white">{occupancyPercent}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${occupancyPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
          <span>Available: {room.available}</span>
          <span>Sold: {room.sold}</span>
        </div>
      </div>
      {room.stopSell && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">Stop Sell Active</p>
        </div>
      )}
    </div>
  );
};

interface SellLimitCardProps {
  limit: {
    id: number;
    roomType: string;
    channel: string;
    limit: number;
    used: number;
    remaining: number;
  };
}

const SellLimitCard: React.FC<SellLimitCardProps> = ({ limit }) => {
  const usagePercent = Math.round((limit.used / limit.limit) * 100);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-medium text-slate-900 dark:text-white">{limit.roomType}</h4>
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            {limit.channel}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>Limit: {limit.limit}</span>
          <span>Used: {limit.used}</span>
          <span className="font-medium text-slate-900 dark:text-white">Remaining: {limit.remaining}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{usagePercent}% used</p>
        </div>
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

interface AllotmentCardProps {
  allotment: {
    id: number;
    operator: string;
    roomType: string;
    total: number;
    released: number;
    remaining: number;
    expiry: string;
  };
}

const AllotmentCard: React.FC<AllotmentCardProps> = ({ allotment }) => {
  const releasePercent = Math.round((allotment.released / allotment.total) * 100);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <h4 className="font-medium text-slate-900 dark:text-white">{allotment.operator}</h4>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span>{allotment.roomType}</span>
          <span>Total: {allotment.total}</span>
          <span>Released: {allotment.released}</span>
          <span className="font-medium text-slate-900 dark:text-white">Remaining: {allotment.remaining}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-xs text-slate-600 dark:text-slate-400">Expires: {allotment.expiry}</p>
          <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${releasePercent}%` }}
            />
          </div>
        </div>
        <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
          <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>
    </div>
  );
};

interface StopSellCardProps {
  date: {
    id: number;
    roomType: string;
    startDate: string;
    endDate: string;
    reason: string;
  };
}

const StopSellCard: React.FC<StopSellCardProps> = ({ date }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-red-500" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{date.roomType}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {date.startDate} → {date.endDate}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{date.reason}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Edit
        </button>
        <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
          <Unlock className="w-4 h-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
};

export default InventoryControls;
