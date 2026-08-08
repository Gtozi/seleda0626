/**
 * Digital Room Key Module
 * Mobile key activation, key sharing, access history, lost device recovery
 */

import { useState } from 'react';
import {
  Key,
  Smartphone,
  Share2,
  Clock,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Plus,
  Trash2,
  RefreshCw,
  User,
  Calendar
} from 'lucide-react';

interface DigitalRoomKeyModuleProps {
  reservationId?: string;
}

interface KeyAccess {
  id: string;
  deviceName: string;
  deviceType: 'iOS' | 'Android';
  status: 'Active' | 'Expired' | 'Revoked';
  activatedAt: string;
  expiresAt: string;
}

interface SharedKey {
  id: string;
  guestName: string;
  relationship: string;
  status: 'Active' | 'Expired' | 'Revoked';
  sharedAt: string;
  expiresAt: string;
}

const DigitalRoomKeyModule: React.FC<DigitalRoomKeyModuleProps> = ({
  reservationId
}) => {
  const [keys, setKeys] = useState<KeyAccess[]>([
    {
      id: 'KEY-001',
      deviceName: 'iPhone 14 Pro',
      deviceType: 'iOS',
      status: 'Active',
      activatedAt: '2026-08-15T14:30:00',
      expiresAt: '2026-08-20T11:00:00'
    }
  ]);

  const [sharedKeys, setSharedKeys] = useState<SharedKey[]>([
    {
      id: 'SHR-001',
      guestName: 'Jane Doe',
      relationship: 'Spouse',
      status: 'Active',
      sharedAt: '2026-08-15T15:00:00',
      expiresAt: '2026-08-20T11:00:00'
    }
  ]);

  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [showShareKeyModal, setShowShareKeyModal] = useState(false);
  const [activating, setActivating] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400',
      'Expired': 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400',
      'Revoked': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400'
    };
    return colors[status as keyof typeof colors] || colors['Active'];
  };

  const handleActivateKey = () => {
    setActivating(true);
    // Simulate key activation
    setTimeout(() => {
      setActivating(false);
      setKeys([
        ...keys,
        {
          id: `KEY-${String(keys.length + 1).padStart(3, '0')}`,
          deviceName: 'New Device',
          deviceType: 'iOS',
          status: 'Active',
          activatedAt: new Date().toISOString(),
          expiresAt: '2026-08-20T11:00:00'
        }
      ]);
      setShowAddKeyModal(false);
    }, 2000);
  };

  const handleRevokeKey = (keyId: string) => {
    if (confirm('Are you sure you want to revoke this key?')) {
      setKeys(keys.map(key => 
        key.id === keyId 
          ? { ...key, status: 'Revoked' as const }
          : key
      ));
    }
  };

  const handleRevokeSharedKey = (sharedKeyId: string) => {
    if (confirm('Are you sure you want to revoke access for this guest?')) {
      setSharedKeys(sharedKeys.map(key => 
        key.id === sharedKeyId 
          ? { ...key, status: 'Revoked' as const }
          : key
      ));
    }
  };

  const handleShareKey = (guestName: string, relationship: string) => {
    setSharedKeys([
      ...sharedKeys,
      {
        id: `SHR-${String(sharedKeys.length + 1).padStart(3, '0')}`,
        guestName,
        relationship,
        status: 'Active',
        sharedAt: new Date().toISOString(),
        expiresAt: '2026-08-20T11:00:00'
      }
    ]);
    setShowShareKeyModal(false);
  };

  const handleLostDevice = () => {
    if (confirm('This will revoke all active keys. Are you sure you want to continue?')) {
      setKeys(keys.map(key => ({ ...key, status: 'Revoked' as const })));
      setSharedKeys(sharedKeys.map(key => ({ ...key, status: 'Revoked' as const })));
    }
  };

  const activeKeys = keys.filter(key => key.status === 'Active');
  const activeSharedKeys = sharedKeys.filter(key => key.status === 'Active');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Digital Room Key</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your mobile room keys and share access with authorized guests
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleLostDevice}
            className="flex items-center gap-2 px-4 py-2 border border-red-200 dark:border-red-700/50 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm font-medium"
          >
            <AlertTriangle size={16} />
            Lost Device
          </button>
          <button
            onClick={() => setShowAddKeyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
          >
            <Plus size={16} />
            Add New Key
          </button>
        </div>
      </div>

      {/* Active Keys Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone size={24} />
            <span className="text-sm font-medium opacity-90">Active Keys</span>
          </div>
          <div className="text-3xl font-bold">{activeKeys.length}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Share2 size={24} />
            <span className="text-sm font-medium opacity-90">Shared Access</span>
          </div>
          <div className="text-3xl font-bold">{activeSharedKeys.length}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Shield size={24} />
            <span className="text-sm font-medium opacity-90">Security Status</span>
          </div>
          <div className="text-3xl font-bold">Secure</div>
        </div>
      </div>

      {/* My Keys */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">My Keys</h3>
          <button
            onClick={() => setShowAddKeyModal(true)}
            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <Plus size={16} />
            Add Key
          </button>
        </div>

        <div className="space-y-3">
          {keys.map((key) => (
            <div key={key.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    key.deviceType === 'iOS' ? 'bg-slate-800 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{key.deviceName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(key.status)}`}>
                        {key.status}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {key.deviceType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Activated: {new Date(key.activatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Expires: {new Date(key.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {key.status === 'Active' && (
                  <button
                    onClick={() => handleRevokeKey(key.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shared Keys */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Shared Access</h3>
          <button
            onClick={() => setShowShareKeyModal(true)}
            className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            <Share2 size={16} />
            Share Key
          </button>
        </div>

        <div className="space-y-3">
          {sharedKeys.map((sharedKey) => (
            <div key={sharedKey.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                    <User size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{sharedKey.guestName}</h4>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{sharedKey.relationship}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sharedKey.status)}`}>
                        {sharedKey.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>Shared: {new Date(sharedKey.sharedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        <span>Expires: {new Date(sharedKey.expiresAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                {sharedKey.status === 'Active' && (
                  <button
                    onClick={() => handleRevokeSharedKey(sharedKey.id)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Key Modal */}
      {showAddKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Add New Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Device Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., iPhone 15 Pro"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Device Type
                </label>
                <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="iOS">iOS</option>
                  <option value="Android">Android</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddKeyModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleActivateKey}
                disabled={activating}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {activating ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Activating...
                  </>
                ) : (
                  <>
                    <Key size={16} />
                    Activate Key
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Key Modal */}
      {showShareKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Share Key</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Guest Name
                </label>
                <input
                  type="text"
                  placeholder="Enter guest name"
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Relationship
                </label>
                <select className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="Spouse">Spouse</option>
                  <option value="Family Member">Family Member</option>
                  <option value="Friend">Friend</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowShareKeyModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleShareKey('Guest Name', 'Relationship')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
              >
                <Share2 size={16} />
                Share Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalRoomKeyModule;
