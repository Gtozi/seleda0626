/**
 * Channel Manager Component
 * Manages OTA channel connections and synchronization
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  RefreshCw,
  Play,
  Pause,
  Settings,
  MoreVertical,
  Link,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Calendar,
  Globe,
  Building2,
  Activity,
  TrendingUp,
  TrendingDown,
  BarChart3
} from 'lucide-react';

interface ChannelConnection {
  id: string;
  channelName: string;
  channelCode: string;
  channelType: 'ota' | 'gds' | 'bedbank' | 'metasearch';
  apiEndpoint: string;
  apiVersion: string;
  syncIntervalMinutes: number;
  lastSyncAt: string;
  lastSyncStatus: 'success' | 'failed' | 'never';
  lastSyncError: string;
  rateParityEnabled: boolean;
  rateParityThreshold: number;
  inventorySyncEnabled: boolean;
  bookingSyncEnabled: boolean;
  active: boolean;
  testMode: boolean;
  roomMappings: ChannelRoomMapping[];
}

interface ChannelRoomMapping {
  id: string;
  ourRoomType: string;
  channelRoomCode: string;
  channelRoomName: string;
  qualityScore: number;
  rateMultiplier: number;
  inventoryMultiplier: number;
  active: boolean;
}

const ChannelManager = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit' | 'mappings' | 'sync-status'>('list');
  const [selectedChannel, setSelectedChannel] = useState<ChannelConnection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncing, setSyncing] = useState<Set<string>>(new Set());

  // Mock data
  const channels = useMemo<ChannelConnection[]>(() => [
    {
      id: '1',
      channelName: 'Booking.com',
      channelCode: 'BOOKINGCOM',
      channelType: 'ota',
      apiEndpoint: 'https://supply-xml.booking.com/hotel-v3',
      apiVersion: '3.0',
      syncIntervalMinutes: 30,
      lastSyncAt: '2026-07-19T11:00:00Z',
      lastSyncStatus: 'success',
      lastSyncError: '',
      rateParityEnabled: true,
      rateParityThreshold: 5.00,
      inventorySyncEnabled: true,
      bookingSyncEnabled: true,
      active: true,
      testMode: false,
      roomMappings: [
        { id: '1', ourRoomType: 'Deluxe Suite', channelRoomCode: 'DS001', channelRoomName: 'Deluxe Suite', qualityScore: 1.0, rateMultiplier: 1.0, inventoryMultiplier: 1.0, active: true },
        { id: '2', ourRoomType: 'Standard Room', channelRoomCode: 'SR001', channelRoomName: 'Standard Room', qualityScore: 1.0, rateMultiplier: 1.0, inventoryMultiplier: 1.0, active: true },
      ]
    },
    {
      id: '2',
      channelName: 'Expedia',
      channelCode: 'EXPEDIA',
      channelType: 'ota',
      apiEndpoint: 'https://services.expediapartnercentral.com',
      apiVersion: '2.0',
      syncIntervalMinutes: 60,
      lastSyncAt: '2026-07-19T10:30:00Z',
      lastSyncStatus: 'success',
      lastSyncError: '',
      rateParityEnabled: true,
      rateParityThreshold: 5.00,
      inventorySyncEnabled: true,
      bookingSyncEnabled: true,
      active: true,
      testMode: false,
      roomMappings: [
        { id: '3', ourRoomType: 'Deluxe Suite', channelRoomCode: 'DLX', channelRoomName: 'Deluxe', qualityScore: 0.95, rateMultiplier: 1.05, inventoryMultiplier: 1.0, active: true },
      ]
    },
    {
      id: '3',
      channelName: 'Airbnb',
      channelCode: 'AIRBNB',
      channelType: 'ota',
      apiEndpoint: 'https://api.airbnb.com/v2',
      apiVersion: '2.0',
      syncIntervalMinutes: 120,
      lastSyncAt: '2026-07-19T09:00:00Z',
      lastSyncStatus: 'failed',
      lastSyncError: 'API rate limit exceeded',
      rateParityEnabled: true,
      rateParityThreshold: 10.00,
      inventorySyncEnabled: true,
      bookingSyncEnabled: true,
      active: true,
      testMode: false,
      roomMappings: [
        { id: '4', ourRoomType: 'Ocean View', channelRoomCode: 'OV001', channelRoomName: 'Ocean View Suite', qualityScore: 0.9, rateMultiplier: 1.1, inventoryMultiplier: 0.95, active: true },
      ]
    },
    {
      id: '4',
      channelName: 'Amadeus',
      channelCode: 'AMADEUS',
      channelType: 'gds',
      apiEndpoint: 'https://webservices.amadeus.com',
      apiVersion: '1.0',
      syncIntervalMinutes: 180,
      lastSyncAt: '2026-07-19T08:00:00Z',
      lastSyncStatus: 'success',
      lastSyncError: '',
      rateParityEnabled: true,
      rateParityThreshold: 3.00,
      inventorySyncEnabled: true,
      bookingSyncEnabled: true,
      active: true,
      testMode: true,
      roomMappings: []
    }
  ], []);

  const filteredChannels = useMemo(() => {
    if (!searchQuery) return channels;
    return channels.filter(c => 
      c.channelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.channelCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  const handleAddChannel = () => {
    setSelectedChannel(null);
    setView('add');
  };

  const handleEditChannel = (channel: ChannelConnection) => {
    setSelectedChannel(channel);
    setView('edit');
  };

  const handleManageMappings = (channel: ChannelConnection) => {
    setSelectedChannel(channel);
    setView('mappings');
  };

  const handleDeleteChannel = (id: string) => {
    console.log('Delete channel:', id);
  };

  const handleSyncChannel = async (channelId: string) => {
    setSyncing(new Set([...syncing, channelId]));
    console.log('Syncing channel:', channelId);
    setTimeout(() => {
      setSyncing(new Set([...syncing].filter(id => id !== channelId)));
    }, 2000);
  };

  const handleToggleActive = (channelId: string) => {
    console.log('Toggle active:', channelId);
  };

  const getChannelTypeColor = (type: string) => {
    const colors = {
      ota: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      gds: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
      bedbank: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      metasearch: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  };

  const getSyncStatusIcon = (status: string) => {
    const icons = {
      success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
      failed: <XCircle className="w-5 h-5 text-red-500" />,
      never: <Clock className="w-5 h-5 text-slate-400" />
    };
    return icons[status as keyof typeof icons] || <Clock className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="p-6 space-y-6">
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Channel Manager</h2>
              <p className="text-slate-600 dark:text-slate-400">Manage OTA channel connections and synchronization</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView('sync-status')}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
              >
                <Activity className="w-4 h-4" />
                Sync Status
              </button>
              <button
                onClick={handleAddChannel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Channel
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Channel List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredChannels.map((channel) => (
              <ChannelCard
                key={channel.id}
                channel={channel}
                isSyncing={syncing.has(channel.id)}
                onEdit={() => handleEditChannel(channel)}
                onManageMappings={() => handleManageMappings(channel)}
                onDelete={() => handleDeleteChannel(channel.id)}
                onSync={() => handleSyncChannel(channel.id)}
                onToggleActive={() => handleToggleActive(channel.id)}
                getChannelTypeColor={getChannelTypeColor}
                getSyncStatusIcon={getSyncStatusIcon}
              />
            ))}
          </div>

          {filteredChannels.length === 0 && (
            <div className="text-center py-12">
              <Globe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">No channels found</p>
            </div>
          )}
        </>
      )}

      {view === 'add' && (
        <ChannelForm
          mode="add"
          onCancel={() => setView('list')}
          onSave={() => setView('list')}
        />
      )}

      {view === 'edit' && selectedChannel && (
        <ChannelForm
          mode="edit"
          channel={selectedChannel}
          onCancel={() => setView('list')}
          onSave={() => setView('list')}
        />
      )}

      {view === 'sync-status' && (
        <SyncStatusDashboard onClose={() => setView('list')} />
      )}

      {view === 'mappings' && selectedChannel && (
        <RoomMappings
          channel={selectedChannel}
          onClose={() => setView('list')}
        />
      )}
    </div>
  );
};

interface ChannelCardProps {
  channel: ChannelConnection;
  isSyncing: boolean;
  onEdit: () => void;
  onManageMappings: () => void;
  onDelete: () => void;
  onSync: () => void;
  onToggleActive: () => void;
  getChannelTypeColor: (type: string) => string;
  getSyncStatusIcon: (status: string) => React.ReactNode;
}

const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  isSyncing,
  onEdit,
  onManageMappings,
  onDelete,
  onSync,
  onToggleActive,
  getChannelTypeColor,
  getSyncStatusIcon
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900 dark:text-white">{channel.channelName}</h3>
              {channel.testMode && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  Test Mode
                </span>
              )}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">{channel.channelCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
            title="Sync Now"
          >
            {isSyncing ? (
              <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5 text-slate-400" />
            )}
          </button>
          <button
            onClick={onManageMappings}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Manage Mappings"
          >
            <Link className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getChannelTypeColor(channel.channelType)}`}>
            {channel.channelType.toUpperCase()}
          </span>
          <div className="flex items-center gap-2">
            {getSyncStatusIcon(channel.lastSyncStatus)}
            <span className="text-sm text-slate-600 dark:text-slate-400">
              {channel.lastSyncStatus === 'never' ? 'Never synced' : 
               new Date(channel.lastSyncAt).toLocaleString()}
            </span>
          </div>
        </div>

        {channel.lastSyncError && (
          <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{channel.lastSyncError}</p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">{channel.syncIntervalMinutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-400">{channel.roomMappings.length} rooms</span>
          </div>
          <div className="flex items-center gap-1">
            {channel.rateParityEnabled ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
            <span className="text-slate-600 dark:text-slate-400">Parity</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={channel.inventorySyncEnabled}
              onChange={onToggleActive}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Inventory</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={channel.bookingSyncEnabled}
              onChange={onToggleActive}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-600 dark:text-slate-400">Bookings</span>
          </label>
        </div>
        <button
          onClick={onToggleActive}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            channel.active
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}
        >
          {channel.active ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Active
            </>
          ) : (
            <>
              <Pause className="w-4 h-4" />
              Inactive
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface ChannelFormProps {
  mode: 'add' | 'edit';
  channel?: ChannelConnection;
  onCancel: () => void;
  onSave: () => void;
}

const ChannelForm: React.FC<ChannelFormProps> = ({ mode, channel, onCancel, onSave }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {mode === 'add' ? 'Add New Channel' : 'Edit Channel'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {mode === 'add' ? 'Configure a new OTA channel connection' : 'Update channel configuration'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Channel Name
            </label>
            <input
              type="text"
              defaultValue={channel?.channelName}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., Booking.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Channel Code
            </label>
            <input
              type="text"
              defaultValue={channel?.channelCode}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., BOOKINGCOM"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Channel Type
            </label>
            <select
              defaultValue={channel?.channelType || 'ota'}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="ota">OTA</option>
              <option value="gds">GDS</option>
              <option value="bedbank">Bed Bank</option>
              <option value="metasearch">Metasearch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              API Version
            </label>
            <input
              type="text"
              defaultValue={channel?.apiVersion || '1.0'}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="e.g., 3.0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            API Endpoint
          </label>
          <input
            type="url"
            defaultValue={channel?.apiEndpoint}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="https://api.example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Sync Interval (minutes)
            </label>
            <input
              type="number"
              defaultValue={channel?.syncIntervalMinutes || 30}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="30"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rate Parity Threshold (%)
            </label>
            <input
              type="number"
              step="0.01"
              defaultValue={channel?.rateParityThreshold || 5.00}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="5.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={channel?.rateParityEnabled ?? true}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Rate Parity</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={channel?.inventorySyncEnabled ?? true}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Inventory Sync</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={channel?.bookingSyncEnabled ?? true}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Booking Sync</span>
          </label>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked={channel?.testMode ?? false}
            className="rounded border-slate-300"
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">Test Mode (no live sync)</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {mode === 'add' ? 'Add Channel' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

interface RoomMappingsProps {
  channel: ChannelConnection;
  onClose: () => void;
}

const RoomMappings: React.FC<RoomMappingsProps> = ({ channel, onClose }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          Room Mappings - {channel.channelName}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">Configure room type mappings for this channel</p>
      </div>

      <div className="space-y-4">
        {channel.roomMappings.length === 0 ? (
          <div className="text-center py-8">
            <Link className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">No room mappings configured</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
              Add Mapping
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {channel.roomMappings.map((mapping) => (
              <div key={mapping.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{mapping.ourRoomType}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Our Room Type</p>
                    </div>
                  </div>
                  <div className="text-slate-400">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{mapping.channelRoomName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{mapping.channelRoomCode}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Rate: x{mapping.rateMultiplier}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Inv: x{mapping.inventoryMultiplier}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                      <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </button>
                    <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
        >
          Close
        </button>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
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

interface SyncStatusDashboardProps {
  onClose: () => void;
}

const SyncStatusDashboard: React.FC<SyncStatusDashboardProps> = ({ onClose }) => {
  // Mock sync history data
  const syncHistory = useMemo(() => [
    { id: '1', channel: 'Booking.com', type: 'inventory', status: 'success', duration: 2.3, timestamp: '2026-07-19T11:00:00Z', records: 45 },
    { id: '2', channel: 'Booking.com', type: 'rates', status: 'success', duration: 1.8, timestamp: '2026-07-19T11:00:00Z', records: 12 },
    { id: '3', channel: 'Expedia', type: 'inventory', status: 'success', duration: 3.1, timestamp: '2026-07-19T10:30:00Z', records: 38 },
    { id: '4', channel: 'Airbnb', type: 'inventory', status: 'failed', duration: 5.2, timestamp: '2026-07-19T09:00:00Z', records: 0, error: 'API rate limit exceeded' },
    { id: '5', channel: 'Booking.com', type: 'bookings', status: 'success', duration: 1.5, timestamp: '2026-07-19T08:30:00Z', records: 8 },
  ], []);

  const syncStats = useMemo(() => ({
    totalSyncs: syncHistory.length,
    successful: syncHistory.filter(s => s.status === 'success').length,
    failed: syncHistory.filter(s => s.status === 'failed').length,
    avgDuration: syncHistory.reduce((sum, s) => sum + s.duration, 0) / syncHistory.length
  }), [syncHistory]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sync Status Dashboard</h2>
          <p className="text-slate-600 dark:text-slate-400">Real-time synchronization monitoring</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
        >
          Back to Channels
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Syncs" value={syncStats.totalSyncs} icon={<Activity className="w-5 h-5" />} color="blue" />
        <StatCard title="Successful" value={syncStats.successful} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
        <StatCard title="Failed" value={syncStats.failed} icon={<XCircle className="w-5 h-5" />} color="red" />
        <StatCard title="Avg Duration" value={`${syncStats.avgDuration.toFixed(1)}s`} icon={<Clock className="w-5 h-5" />} color="purple" />
      </div>

      {/* Sync History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Sync Activity</h3>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Channel
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Records
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {syncHistory.map((sync) => (
              <tr key={sync.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">{sync.channel}</td>
                <td className="px-4 py-4">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 capitalize">
                    {sync.type}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {sync.status === 'success' ? (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4" />
                      Success
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-red-600 dark:text-red-400">
                      <XCircle className="w-4 h-4" />
                      Failed
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{sync.duration}s</td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">{sync.records}</td>
                <td className="px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {new Date(sync.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ChannelManager;
