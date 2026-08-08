/**
 * Front Office Keys & Access Module
 * Key encoding, key tracking, and access control management
 */

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Shield,
  Key,
  Lock,
  Unlock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  X,
  ChevronDown,
  History,
  Home,
  QrCode,
  User,
  Printer,
  ArrowRightLeft,
  Clock
} from 'lucide-react';
import {
  fetchKeys,
  fetchEncoders,
  fetchAccessLogs,
  fetchKeyStats,
  encodeKey,
  returnKey,
  updateKey,
  printKeyCard,
  type KeyRecord,
  type KeyEncoder,
  type AccessLogEntry,
  type KeyStatus,
  type AccessLevel,
  type KeyType,
  type EncoderStatus,
  type KeyStats,
} from '../../../services/keyService';
import StatCard from '../StatCard';

const KeysAccess = () => {
  // Tab and UI state
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'overview' | 'encode' | 'tracking' | 'master' | 'access-log') || 'overview';
  const setActiveTab = (tab: 'overview' | 'encode' | 'tracking' | 'master' | 'access-log') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [showEncodeModal, setShowEncodeModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<KeyRecord | null>(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState<KeyStatus | 'all'>('all');
  const [accessLevelFilter, setAccessLevelFilter] = useState<AccessLevel | 'all'>('all');

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Data state
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [encoders, setEncoders] = useState<KeyEncoder[]>([]);
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);
  const [stats, setStats] = useState<KeyStats>({
    activeKeys: 0,
    dueOutToday: 0,
    lostDamaged: 0,
    onlineEncoders: 0,
  });

  // Encode form state
  const [encodeForm, setEncodeForm] = useState({
    guestName: '',
    reservationId: '',
    roomNumber: '',
    keyType: 'physical' as KeyType,
    accessLevel: 'guest' as AccessLevel,
    expiry: '',
    notes: '',
    encoderId: '',
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    guestName: '',
    reservationId: '',
    roomNumber: '',
    keyType: 'physical' as KeyType,
    accessLevel: 'guest' as AccessLevel,
    expiry: '',
    notes: '',
  });

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [keysData, encodersData, accessLogData, statsData] = await Promise.all([
        fetchKeys(),
        fetchEncoders(),
        fetchAccessLogs({ limit: 50 }),
        fetchKeyStats(),
      ]);
      setKeys(keysData);
      setEncoders(encodersData);
      setAccessLog(accessLogData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showFilterDropdown && !(e.target as HTMLElement).closest('.relative')) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterDropdown]);

  // Filter keys based on search query and filters
  const filteredKeys = keys.filter(key => {
    // Search query filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const target = key.guestName || key.staffName || '';
      const matchesSearch =
        target.toLowerCase().includes(q) ||
        key.roomNumber?.toLowerCase().includes(q) ||
        key.keyCode.toLowerCase().includes(q) ||
        key.reservationId?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && key.status !== statusFilter) return false;

    // Access level filter
    if (accessLevelFilter !== 'all' && key.accessLevel !== accessLevelFilter) return false;

    return true;
  });

  // Computed stats from data
  const computedStats = {
    activeKeys: keys.filter(k => k.status === 'active').length,
    dueOutToday: keys.filter(k => {
      if (!k.expiresAt) return false;
      const expiryDate = new Date(k.expiresAt);
      const today = new Date();
      return expiryDate.toDateString() === today.toDateString() && k.status === 'active';
    }).length,
    lostDamaged: keys.filter(k => k.status === 'lost' || k.status === 'damaged').length,
    onlineEncoders: encoders.filter(e => e.status === 'online').length,
  };

  const getStatusBadge = (status: KeyStatus) => {
    const config: Record<KeyStatus, { bg: string; text: string; label: string }> = {
      active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Active' },
      lost: { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Lost' },
      damaged: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Damaged' },
      returned: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Returned' },
      master: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Master' },
    };
    const c = config[status];
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>{c.label}</span>;
  };

  const getAccessLevelBadge = (level: AccessLevel) => {
    const config: Record<AccessLevel, string> = {
      guest: 'bg-blue-100 text-blue-700',
      staff: 'bg-indigo-100 text-indigo-700',
      master: 'bg-purple-100 text-purple-700',
      service: 'bg-amber-100 text-amber-700',
      emergency: 'bg-rose-100 text-rose-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config[level]}`}>{level.replace('_', ' ').toUpperCase()}</span>;
  };

  const getEncoderStatusBadge = (status: EncoderStatus) => {
    const config: Record<EncoderStatus, string> = {
      online: 'bg-emerald-100 text-emerald-700',
      offline: 'bg-slate-100 text-slate-700',
      maintenance: 'bg-amber-100 text-amber-700',
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${config[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
  };

  const handleEncode = async () => {
    setActionLoading(true);
    try {
      await encodeKey({
        guestName: encodeForm.guestName || undefined,
        reservationId: encodeForm.reservationId || undefined,
        roomNumber: encodeForm.roomNumber || undefined,
        keyType: encodeForm.keyType,
        accessLevel: encodeForm.accessLevel,
        expiresAt: encodeForm.expiry,
        notes: encodeForm.notes || undefined,
        encoderId: encodeForm.encoderId || undefined,
      });
      setShowEncodeModal(false);
      setEncodeForm({
        guestName: '',
        reservationId: '',
        roomNumber: '',
        keyType: 'physical',
        accessLevel: 'guest',
        expiry: '',
        notes: '',
        encoderId: '',
      });
      await fetchAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to encode key');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedKey) return;
    setActionLoading(true);
    try {
      await returnKey(selectedKey.id);
      setShowReturnModal(false);
      setSelectedKey(null);
      await fetchAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to return key');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAllData();
  };

  const handlePrint = async (keyId: string) => {
    setActionLoading(true);
    try {
      await printKeyCard(keyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to print key card');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (key: KeyRecord) => {
    setSelectedKey(key);
    setEditForm({
      guestName: key.guestName || '',
      reservationId: key.reservationId || '',
      roomNumber: key.roomNumber || '',
      keyType: key.keyType,
      accessLevel: key.accessLevel,
      expiry: key.expiresAt,
      notes: key.notes,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedKey) return;
    setActionLoading(true);
    try {
      await updateKey(selectedKey.id, {
        guestName: editForm.guestName || undefined,
        reservationId: editForm.reservationId || undefined,
        roomNumber: editForm.roomNumber || undefined,
        keyType: editForm.keyType,
        accessLevel: editForm.accessLevel,
        expiresAt: editForm.expiry,
        notes: editForm.notes || undefined,
      });
      setShowEditModal(false);
      setSelectedKey(null);
      await fetchAllData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update key');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setSelectedKey(null);
    setEditForm({
      guestName: '',
      reservationId: '',
      roomNumber: '',
      keyType: 'physical',
      accessLevel: 'guest',
      expiry: '',
      notes: '',
    });
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
    <div className="space-y-6 animate-fade-in" id="keys-access">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Keys & Access</h2>
          <p className="text-sm text-slate-500 mt-1">Key encoding, tracking, and access control management</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEncodeModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Encode Key
          </button>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 flex items-start gap-2">
          <AlertTriangle size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-rose-700 font-medium">Error</p>
            <p className="text-sm text-rose-600 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-rose-400 hover:text-rose-600 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Loading display */}
      {loading && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
          <RefreshCw size={32} className="animate-spin text-indigo-600 mx-auto mb-2" />
          <p className="text-sm text-slate-600">Loading keys & access data...</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Keys" value={String(computedStats.activeKeys)} icon={Key} variant="primary" />
        <StatCard label="Due Out Today" value={String(computedStats.dueOutToday)} icon={Unlock} variant="alert" />
        <StatCard label="Lost/Damaged" value={String(computedStats.lostDamaged)} icon={AlertTriangle} variant="alert" />
        <StatCard label="Online Encoders" value={String(computedStats.onlineEncoders)} icon={QrCode} variant="rooms" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        <TabButton id="overview" label="Overview" icon={Home} />
        <TabButton id="encode" label="Encode Key" icon={Key} />
        <TabButton id="tracking" label="Key Tracking" icon={Shield} />
        <TabButton id="master" label="Master Keys" icon={Lock} />
        <TabButton id="access-log" label="Access Log" icon={History} />
      </div>

      {/* Search & Filter */}
      {(activeTab === 'overview' || activeTab === 'tracking' || activeTab === 'master') && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search guest, room, key code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm hover:bg-slate-50 cursor-pointer"
            >
              <Filter size={16} />
              Filter
              <ChevronDown size={14} />
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-slate-200 z-10 p-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as KeyStatus | 'all')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="lost">Lost</option>
                    <option value="damaged">Damaged</option>
                    <option value="returned">Returned</option>
                    <option value="master">Master</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Access Level</label>
                  <select
                    value={accessLevelFilter}
                    onChange={(e) => setAccessLevelFilter(e.target.value as AccessLevel | 'all')}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="all">All Levels</option>
                    <option value="guest">Guest</option>
                    <option value="staff">Staff</option>
                    <option value="service">Service</option>
                    <option value="emergency">Emergency</option>
                    <option value="master">Master</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      setStatusFilter('all');
                      setAccessLevelFilter('all');
                    }}
                    className="text-sm text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => setShowFilterDropdown(false)}
                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Key Registry</h3>
            <span className="text-xs text-slate-500">{filteredKeys.length} records found</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Key Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Guest/Staff</th>
                  <th className="px-4 py-3 text-left font-semibold">Room</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Access Level</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Expires</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">{key.keyCode}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{key.guestName || key.staffName}</div>
                      {key.reservationId && <div className="text-xs text-slate-500">{key.reservationId}</div>}
                      {key.staffRole && <div className="text-xs text-slate-500">{key.staffRole}</div>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{key.roomNumber || 'N/A'}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{key.keyType}</td>
                    <td className="px-4 py-3">{getAccessLevelBadge(key.accessLevel)}</td>
                    <td className="px-4 py-3">{getStatusBadge(key.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{key.expiresAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handlePrint(key.id)}
                          disabled={actionLoading}
                          className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer disabled:opacity-50"
                          title="Print key card"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => { setSelectedKey(key); setShowReturnModal(true); }}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                          title="Mark returned"
                        >
                          <ArrowRightLeft size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(key)}
                          disabled={actionLoading}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer disabled:opacity-50"
                          title="Edit"
                        >
                          <Edit size={16} />
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

      {/* Encode Tab */}
      {activeTab === 'encode' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Encode New Key</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Guest Name</label>
              <input
                type="text"
                value={encodeForm.guestName}
                onChange={(e) => setEncodeForm({ ...encodeForm, guestName: e.target.value })}
                placeholder="Search guest..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Reservation ID</label>
              <input
                type="text"
                value={encodeForm.reservationId}
                onChange={(e) => setEncodeForm({ ...encodeForm, reservationId: e.target.value })}
                placeholder="RES-XXX"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
              <input
                type="text"
                value={encodeForm.roomNumber}
                onChange={(e) => setEncodeForm({ ...encodeForm, roomNumber: e.target.value })}
                placeholder="Room number"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Key Type</label>
              <select
                value={encodeForm.keyType}
                onChange={(e) => setEncodeForm({ ...encodeForm, keyType: e.target.value as KeyType })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="physical">Physical Key Card</option>
                <option value="digital">Digital Key</option>
                <option value="nfc">NFC Key</option>
                <option value="mobile">Mobile Key</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Access Level</label>
              <select
                value={encodeForm.accessLevel}
                onChange={(e) => setEncodeForm({ ...encodeForm, accessLevel: e.target.value as AccessLevel })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="guest">Guest</option>
                <option value="staff">Staff</option>
                <option value="service">Service</option>
                <option value="emergency">Emergency</option>
                <option value="master">Master</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Expiry</label>
              <input
                type="datetime-local"
                value={encodeForm.expiry}
                onChange={(e) => setEncodeForm({ ...encodeForm, expiry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
              <textarea
                value={encodeForm.notes}
                onChange={(e) => setEncodeForm({ ...encodeForm, notes: e.target.value })}
                rows={3}
                placeholder="Add notes..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setEncodeForm({ guestName: '', reservationId: '', roomNumber: '', keyType: 'physical', accessLevel: 'guest', expiry: '', notes: '', encoderId: '' })}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleEncode}
              disabled={actionLoading || !encodeForm.roomNumber}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Key size={16} />
              {actionLoading ? 'Encoding...' : 'Encode Key'}
            </button>
          </div>
        </div>
      )}

      {/* Tracking Tab */}
      {activeTab === 'tracking' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Guest Key Tracking</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Key</th>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Room</th>
                  <th className="px-4 py-3 text-left font-semibold">Issued</th>
                  <th className="px-4 py-3 text-left font-semibold">Expires</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKeys.filter(k => k.accessLevel === 'guest').map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">{key.keyCode}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{key.guestName}</div>
                      <div className="text-xs text-slate-500">{key.reservationId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{key.roomNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{key.issuedAt}</td>
                    <td className="px-4 py-3 text-slate-600">{key.expiresAt}</td>
                    <td className="px-4 py-3">{getStatusBadge(key.status)}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setSelectedKey(key); setShowReturnModal(true); }}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium cursor-pointer"
                      >
                        Mark Returned
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Master Tab */}
      {activeTab === 'master' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Master & Service Keys</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Key Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Holder</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Access Level</th>
                  <th className="px-4 py-3 text-left font-semibold">Type</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Expires</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKeys.filter(k => k.accessLevel !== 'guest').map((key) => (
                  <tr key={key.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-600">{key.keyCode}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{key.staffName}</td>
                    <td className="px-4 py-3 text-slate-600">{key.staffRole}</td>
                    <td className="px-4 py-3">{getAccessLevelBadge(key.accessLevel)}</td>
                    <td className="px-4 py-3 text-slate-600 capitalize">{key.keyType}</td>
                    <td className="px-4 py-3">{getStatusBadge(key.status)}</td>
                    <td className="px-4 py-3 text-slate-600">{key.expiresAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Access Log Tab */}
      {activeTab === 'access-log' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Access Log</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Time</th>
                  <th className="px-4 py-3 text-left font-semibold">Room/Area</th>
                  <th className="px-4 py-3 text-left font-semibold">Key Code</th>
                  <th className="px-4 py-3 text-left font-semibold">Event</th>
                  <th className="px-4 py-3 text-left font-semibold">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accessLog.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-600 font-mono text-xs">{log.time}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{log.room}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono">{log.keyCode}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        log.event === 'access_denied' ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {log.event.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Encode Modal */}
      {showEncodeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Encode Key</h3>
              <button onClick={() => setShowEncodeModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle size={16} className="text-amber-600 mt-0.5" />
                <p className="text-sm text-amber-700">Please ensure the encoder is online and the room is ready before encoding a new key.</p>
              </div>
              <p className="text-sm text-slate-500">Use the Encode Key tab to enter full details.</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowEncodeModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button onClick={() => { setShowEncodeModal(false); setActiveTab('encode'); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer">Go to Encode Form</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && selectedKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Return Key</h3>
              <button onClick={() => setShowReturnModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 text-sm">
                <div className="font-medium text-slate-900">{selectedKey.guestName || selectedKey.staffName}</div>
                <div className="text-slate-500">{selectedKey.keyCode} · {selectedKey.roomNumber || 'N/A'}</div>
              </div>
              <p className="text-sm text-slate-500">Mark this key as returned and deactivate access?</p>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={() => setShowReturnModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button
                onClick={handleReturn}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                {actionLoading ? 'Returning...' : 'Confirm Return'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedKey && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Edit Key</h3>
              <button onClick={handleCancelEdit} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Key Code</label>
                <input
                  type="text"
                  value={selectedKey.keyCode}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Guest/Staff Name</label>
                <input
                  type="text"
                  value={editForm.guestName}
                  onChange={(e) => setEditForm({ ...editForm, guestName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Reservation ID</label>
                <input
                  type="text"
                  value={editForm.reservationId}
                  onChange={(e) => setEditForm({ ...editForm, reservationId: e.target.value })}
                  placeholder="RES-XXX"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Room Number</label>
                <input
                  type="text"
                  value={editForm.roomNumber}
                  onChange={(e) => setEditForm({ ...editForm, roomNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Key Type</label>
                <select
                  value={editForm.keyType}
                  onChange={(e) => setEditForm({ ...editForm, keyType: e.target.value as KeyType })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="physical">Physical Key Card</option>
                  <option value="digital">Digital Key</option>
                  <option value="nfc">NFC Key</option>
                  <option value="mobile">Mobile Key</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Access Level</label>
                <select
                  value={editForm.accessLevel}
                  onChange={(e) => setEditForm({ ...editForm, accessLevel: e.target.value as AccessLevel })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="guest">Guest</option>
                  <option value="staff">Staff</option>
                  <option value="service">Service</option>
                  <option value="emergency">Emergency</option>
                  <option value="master">Master</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Expiry</label>
                <input
                  type="datetime-local"
                  value={editForm.expiry}
                  onChange={(e) => setEditForm({ ...editForm, expiry: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Notes</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  rows={3}
                  placeholder="Add notes..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
              <button onClick={handleCancelEdit} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium cursor-pointer">Cancel</button>
              <button
                onClick={handleSaveEdit}
                disabled={actionLoading}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save size={16} />
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeysAccess;
