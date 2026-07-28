import { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Link2,
  Unlink,
  Wifi,
  WifiOff,
  ChefHat,
  Utensils,
  ExternalLink,
  X,
  Settings,
  Save,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Clock,
  Eye,
  EyeOff,
  Columns,
  ArrowUpDown,
  Type,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface KDSInstance {
  id: string;
  name: string;
  description: string | null;
  instance_type: string;
  property_id: string | null;
  display_config: any;
  station_filter: any;
  is_active: boolean;
  last_seen_at: string | null;
  display_device_id: string | null;
  created_at: string;
  pos_connections?: any[];
  external_pos_systems?: any[];
}

interface POSOutlet {
  id: string;
  name: string;
  outlet_type: string;
  code: string;
  requires_kds: boolean;
}

export default function KDSInstanceManagement() {
  const { addNotification } = useERP();
  const [instances, setInstances] = useState<KDSInstance[]>([]);
  const [outlets, setOutlets] = useState<POSOutlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<KDSInstance | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showExternalModal, setShowExternalModal] = useState(false);
  const [editingInstance, setEditingInstance] = useState<KDSInstance | null>(null);
  const [displayConfig, setDisplayConfig] = useState<any>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instance_type: 'combined',
    display_device_id: '',
  });
  const [connectOutletId, setConnectOutletId] = useState('');
  const [connectStationId, setConnectStationId] = useState<string>('');
  const [prepStations, setPrepStations] = useState<any[]>([]);
  const [externalForm, setExternalForm] = useState({
    system_name: '',
    system_type: 'generic',
    webhook_url: '',
  });

  const fetchInstances = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/kds', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInstances(data.instances || []);
      }
    } catch (err) {
      console.error('Failed to fetch KDS instances:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOutlets = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/pos/outlets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOutlets(data.outlets || []);
      }
    } catch (err) {
      console.error('Failed to fetch outlets:', err);
    }
  }, []);

  useEffect(() => {
    fetchInstances();
    fetchOutlets();
  }, [fetchInstances, fetchOutlets]);

  const fetchPrepStations = useCallback(async (outletId?: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = outletId ? `/api/pos/prep-stations?outlet_id=${outletId}` : '/api/pos/prep-stations';
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPrepStations(data.stations || []);
      }
    } catch (err) {
      console.error('Failed to fetch prep stations:', err);
    }
  }, []);

  const fetchInstanceDetails = async (instanceId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${instanceId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedInstance(data);
        setDisplayConfig(data.display_config || {
          theme: 'dark',
          font_scale: 1.0,
          show_timers: true,
          show_customer_name: true,
          auto_bump_seconds: null,
          sound_enabled: true,
          columns: 4,
          sort_by: 'fired_at_asc',
        });
      }
    } catch (err) {
      console.error('Failed to fetch instance details:', err);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      addNotification('Name is required', 'warning', 'F&B');
      return;
    }
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/kds', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        addNotification('KDS instance created', 'success', 'F&B');
        setShowCreateModal(false);
        setFormData({ name: '', description: '', instance_type: 'combined', display_device_id: '' });
        fetchInstances();
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to create', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to create KDS instance', 'warning', 'F&B');
    }
  };

  const handleUpdate = async () => {
    if (!editingInstance) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${editingInstance.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          instance_type: formData.instance_type,
          display_device_id: formData.display_device_id,
        }),
      });
      if (res.ok) {
        addNotification('KDS instance updated', 'success', 'F&B');
        setEditingInstance(null);
        setShowCreateModal(false);
        fetchInstances();
      }
    } catch (err) {
      addNotification('Failed to update', 'warning', 'F&B');
    }
  };

  const handleDelete = async (instanceId: string) => {
    if (!confirm('Delete this KDS instance? All ticket references will be unlinked.')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${instanceId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('KDS instance deleted', 'success', 'F&B');
        if (selectedInstance?.id === instanceId) setSelectedInstance(null);
        fetchInstances();
      }
    } catch (err) {
      addNotification('Failed to delete', 'warning', 'F&B');
    }
  };

  const handleConnectOutlet = async () => {
    if (!selectedInstance || !connectOutletId) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${selectedInstance.id}/connections`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outlet_id: connectOutletId,
          prep_station_id: connectStationId || null,
        }),
      });
      if (res.ok) {
        addNotification('POS outlet connected', 'success', 'F&B');
        setShowConnectModal(false);
        setConnectOutletId('');
        setConnectStationId('');
        fetchInstanceDetails(selectedInstance.id);
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to connect', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to connect outlet', 'warning', 'F&B');
    }
  };

  const handleDisconnectOutlet = async (connectionId: string) => {
    if (!selectedInstance) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${selectedInstance.id}/connections/${connectionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('Outlet disconnected', 'success', 'F&B');
        fetchInstanceDetails(selectedInstance.id);
      }
    } catch (err) {
      addNotification('Failed to disconnect', 'warning', 'F&B');
    }
  };

  const handleAddExternal = async () => {
    if (!selectedInstance || !externalForm.system_name.trim()) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${selectedInstance.id}/external-pos`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(externalForm),
      });
      if (res.ok) {
        const data = await res.json();
        addNotification(`External POS registered. API key: ${data.api_key}`, 'success', 'F&B');
        setShowExternalModal(false);
        setExternalForm({ system_name: '', system_type: 'generic', webhook_url: '' });
        fetchInstanceDetails(selectedInstance.id);
      }
    } catch (err) {
      addNotification('Failed to register external POS', 'warning', 'F&B');
    }
  };

  const handleDeleteExternal = async (systemId: string) => {
    if (!selectedInstance) return;
    if (!confirm('Remove this external POS connection?')) return;
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${selectedInstance.id}/external-pos/${systemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        addNotification('External POS removed', 'success', 'F&B');
        fetchInstanceDetails(selectedInstance.id);
      }
    } catch (err) {
      addNotification('Failed to remove', 'warning', 'F&B');
    }
  };

  const handleSaveConfig = async () => {
    if (!selectedInstance || !displayConfig) return;
    setSavingConfig(true);
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch(`/api/kds/${selectedInstance.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_config: displayConfig }),
      });
      if (res.ok) {
        const updated = await res.json();
        addNotification('Display configuration saved', 'success', 'F&B');
        setSelectedInstance(updated);
        fetchInstances();
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to save config', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to save display config', 'warning', 'F&B');
    } finally {
      setSavingConfig(false);
    }
  };

  const getInstanceIcon = (type: string) => {
    switch (type) {
      case 'station': return ChefHat;
      case 'expo': return Monitor;
      default: return Utensils;
    }
  };

  const isOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return Date.now() - new Date(lastSeen).getTime() < 60000;
  };

  const openCreateModal = () => {
    setEditingInstance(null);
    setFormData({ name: '', description: '', instance_type: 'combined', display_device_id: '' });
    setShowCreateModal(true);
  };

  const openEditModal = (instance: KDSInstance) => {
    setEditingInstance(instance);
    setFormData({
      name: instance.name,
      description: instance.description || '',
      instance_type: instance.instance_type,
      display_device_id: instance.display_device_id || '',
    });
    setShowCreateModal(true);
  };

  const connectedOutletIds = selectedInstance?.pos_connections?.map((c: any) => c.outlet?.id).filter(Boolean) || [];
  const availableOutlets = outlets.filter(o => !connectedOutletIds.includes(o.id));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Monitor size={24} className="text-amber-500" />
            KDS Instances
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Standalone Kitchen Display System — connect to multiple POS outlets and external systems
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { fetchInstances(); fetchOutlets(); }}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} className="text-slate-500" />
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-bold transition-all"
          >
            <Plus size={16} /> New KDS Instance
          </button>
        </div>
      </div>

      {/* Instance Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : instances.length === 0 ? (
        <div className="text-center py-12">
          <Monitor className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500">No KDS instances yet</p>
          <p className="text-xs text-slate-400 mt-1">Create a KDS display to start receiving orders from POS</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {instances.map(inst => {
            const Icon = getInstanceIcon(inst.instance_type);
            const online = isOnline(inst.last_seen_at);
            return (
              <div
                key={inst.id}
                className={`bg-white dark:bg-slate-900 border-2 rounded-2xl p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedInstance?.id === inst.id
                    ? 'border-amber-500 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800'
                } ${!inst.is_active ? 'opacity-50' : ''}`}
                onClick={() => fetchInstanceDetails(inst.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      inst.instance_type === 'expo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                      inst.instance_type === 'station' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      <Icon size={18} className={inst.instance_type === 'expo' ? 'text-indigo-600' : inst.instance_type === 'station' ? 'text-amber-600' : 'text-emerald-600'} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">{inst.name}</h3>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">{inst.instance_type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {online ? (
                      <Wifi size={14} className="text-emerald-500" />
                    ) : (
                      <WifiOff size={14} className="text-slate-300" />
                    )}
                  </div>
                </div>

                {inst.description && (
                  <p className="text-xs text-slate-500 mb-3 line-clamp-2">{inst.description}</p>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Link2 size={10} /> {inst.pos_connections?.length || 0} POS
                    </span>
                    <span className="flex items-center gap-1">
                      <ExternalLink size={10} /> {inst.external_pos_systems?.length || 0} Ext
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); openEditModal(inst); }}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                    >
                      <Edit2 size={12} className="text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(inst.id); }}
                      className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded"
                    >
                      <Trash2 size={12} className="text-rose-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Routing Summary — cross-instance topology view */}
      {instances.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 mb-3">
            <ChefHat size={14} className="text-amber-500" /> Station Routing Topology
          </h4>
          <p className="text-[10px] text-slate-400 mb-4">How orders route from outlets to KDS displays — station-scoped connections take priority, outlet-wide connections are the catch-all fallback</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[9px] font-bold uppercase text-slate-400 border-b dark:border-slate-800">
                  <th className="text-left py-2 px-2">KDS Instance</th>
                  <th className="text-left py-2 px-2">Outlet</th>
                  <th className="text-left py-2 px-2">Scope</th>
                  <th className="text-left py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {instances.flatMap(inst => {
                  const conns = inst.pos_connections || [];
                  if (conns.length === 0) {
                    return [(
                      <tr key={inst.id} className="border-b dark:border-slate-800/50">
                        <td className="py-2 px-2 font-bold text-slate-700 dark:text-slate-300">{inst.name}</td>
                        <td className="py-2 px-2 text-slate-400 italic" colSpan={3}>No outlets connected</td>
                      </tr>
                    )];
                  }
                  return conns.map((conn: any, idx: number) => (
                    <tr key={`${inst.id}-${conn.id}`} className="border-b dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-2 font-bold text-slate-700 dark:text-slate-300">
                        {idx === 0 ? inst.name : ''}
                      </td>
                      <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                        {conn.outlet?.name || 'Unknown'}
                        <span className="text-[9px] text-slate-400 ml-1">{conn.outlet?.code}</span>
                      </td>
                      <td className="py-2 px-2">
                        {conn.prep_station_id ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                            Station-scoped
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            Outlet-wide (catch-all)
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          conn.is_active
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        }`}>
                          {conn.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Selected Instance Details */}
      {selectedInstance && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedInstance.name}</h3>
              <p className="text-xs text-slate-500">
                {selectedInstance.instance_type} · {selectedInstance.is_active ? 'Active' : 'Inactive'}
                {selectedInstance.last_seen_at && (
                  <span className="ml-2">· Last seen: {new Date(selectedInstance.last_seen_at).toLocaleString()}</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setSelectedInstance(null)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>

          {/* POS Connections */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Link2 size={14} /> Connected POS Outlets
              </h4>
              <button
                onClick={() => setShowConnectModal(true)}
                disabled={availableOutlets.length === 0}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
              >
                <Plus size={12} /> Connect Outlet
              </button>
            </div>
            {selectedInstance.pos_connections && selectedInstance.pos_connections.length > 0 ? (
              <div className="space-y-2">
                {selectedInstance.pos_connections.map((conn: any) => (
                  <div key={conn.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Utensils size={14} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          {conn.outlet?.name || 'Unknown'}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {conn.outlet?.outlet_type} · {conn.outlet?.code}
                          {conn.is_active ? ' · Active' : ' · Inactive'}
                          {conn.prep_station_id ? ' · Station-scoped' : ' · Outlet-wide'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDisconnectOutlet(conn.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                      title="Disconnect"
                    >
                      <Unlink size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No POS outlets connected</p>
            )}
          </div>

          {/* External POS Systems */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <ExternalLink size={14} /> External POS Systems
              </h4>
              <button
                onClick={() => setShowExternalModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
              >
                <Plus size={12} /> Add External POS
              </button>
            </div>
            {selectedInstance.external_pos_systems && selectedInstance.external_pos_systems.length > 0 ? (
              <div className="space-y-2">
                {selectedInstance.external_pos_systems.map((ext: any) => (
                  <div key={ext.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                        <ExternalLink size={14} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{ext.system_name}</p>
                        <p className="text-[10px] text-slate-400">
                          {ext.system_type} · {ext.total_orders_received || 0} orders
                          {ext.last_order_at && ` · Last: ${new Date(ext.last_order_at).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteExternal(ext.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">No external POS systems connected</p>
            )}
          </div>

          {/* Display Config */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Settings size={14} /> Display Configuration
              </h4>
              <button
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
              >
                <Save size={12} /> {savingConfig ? 'Saving...' : 'Save Config'}
              </button>
            </div>
            {displayConfig && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Theme */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                    {displayConfig.theme === 'dark' ? <Moon size={11} /> : <Sun size={11} />} Theme
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDisplayConfig({ ...displayConfig, theme: 'dark' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        displayConfig.theme === 'dark'
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-white dark:bg-slate-700 text-slate-500'
                      }`}
                    >Dark</button>
                    <button
                      onClick={() => setDisplayConfig({ ...displayConfig, theme: 'light' })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                        displayConfig.theme === 'light'
                          ? 'bg-amber-100 text-amber-900 shadow-md'
                          : 'bg-white dark:bg-slate-700 text-slate-500'
                      }`}
                    >Light</button>
                  </div>
                </div>

                {/* Columns */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <Columns size={11} /> Columns
                  </label>
                  <div className="flex gap-1">
                    {[2, 3, 4, 5, 6].map(n => (
                      <button
                        key={n}
                        onClick={() => setDisplayConfig({ ...displayConfig, columns: n })}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          displayConfig.columns === n
                            ? 'bg-amber-500 text-slate-950 shadow-md'
                            : 'bg-white dark:bg-slate-700 text-slate-500 hover:bg-slate-100'
                        }`}
                      >{n}</button>
                    ))}
                  </div>
                </div>

                {/* Font Scale */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <Type size={11} /> Font Scale: {displayConfig.font_scale?.toFixed(1)}x
                  </label>
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.1"
                    value={displayConfig.font_scale ?? 1.0}
                    onChange={e => setDisplayConfig({ ...displayConfig, font_scale: parseFloat(e.target.value) })}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                    <span>0.6x</span><span>1.0x</span><span>2.0x</span>
                  </div>
                </div>

                {/* Sort By */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <ArrowUpDown size={11} /> Sort Tickets By
                  </label>
                  <select
                    value={displayConfig.sort_by || 'fired_at_asc'}
                    onChange={e => setDisplayConfig({ ...displayConfig, sort_by: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 rounded-lg text-xs text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="fired_at_asc">Oldest First (FIFO)</option>
                    <option value="fired_at_desc">Newest First (LIFO)</option>
                    <option value="prep_time_desc">Longest Prep Time</option>
                    <option value="priority_desc">Highest Priority</option>
                    <option value="station_asc">By Station</option>
                  </select>
                </div>

                {/* Show Timers */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className={displayConfig.show_timers ? 'text-amber-500' : 'text-slate-300'} />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Show Timers</p>
                      <p className="text-[10px] text-slate-400">Display elapsed prep time</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDisplayConfig({ ...displayConfig, show_timers: !displayConfig.show_timers })}
                    className={`relative w-11 h-6 rounded-full transition-all ${
                      displayConfig.show_timers ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      displayConfig.show_timers ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>

                {/* Show Customer Name */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {displayConfig.show_customer_name ? <Eye size={16} className="text-amber-500" /> : <EyeOff size={16} className="text-slate-300" />}
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Show Customer Name</p>
                      <p className="text-[10px] text-slate-400">Display guest name on tickets</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDisplayConfig({ ...displayConfig, show_customer_name: !displayConfig.show_customer_name })}
                    className={`relative w-11 h-6 rounded-full transition-all ${
                      displayConfig.show_customer_name ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      displayConfig.show_customer_name ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>

                {/* Sound Enabled */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {displayConfig.sound_enabled ? <Volume2 size={16} className="text-amber-500" /> : <VolumeX size={16} className="text-slate-300" />}
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Sound Alerts</p>
                      <p className="text-[10px] text-slate-400">Play sound on new orders</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDisplayConfig({ ...displayConfig, sound_enabled: !displayConfig.sound_enabled })}
                    className={`relative w-11 h-6 rounded-full transition-all ${
                      displayConfig.sound_enabled ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                      displayConfig.sound_enabled ? 'translate-x-5' : ''
                    }`} />
                  </button>
                </div>

                {/* Auto Bump Seconds */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <Clock size={11} /> Auto-Bump After (seconds)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={displayConfig.auto_bump_seconds || ''}
                      onChange={e => setDisplayConfig({ ...displayConfig, auto_bump_seconds: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="Off"
                      className="flex-1 px-3 py-2 bg-white dark:bg-slate-700 rounded-lg text-xs text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-slate-400">0 = Off</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {editingInstance ? 'Edit KDS Instance' : 'New KDS Instance'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Main Kitchen Display"
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional description"
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Instance Type</label>
                <select
                  value={formData.instance_type}
                  onChange={e => setFormData({ ...formData, instance_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                >
                  <option value="combined">Combined (Station + Expo)</option>
                  <option value="station">Station (Single prep station)</option>
                  <option value="expo">Expo (Aggregate expediter view)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Display Device ID</label>
                <input
                  type="text"
                  value={formData.display_device_id}
                  onChange={e => setFormData({ ...formData, display_device_id: e.target.value })}
                  placeholder="Hardware serial (optional)"
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={editingInstance ? handleUpdate : handleCreate}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-sm font-black"
              >
                {editingInstance ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Outlet Modal */}
      {showConnectModal && selectedInstance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConnectModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Connect POS Outlet</h3>
            <p className="text-xs text-slate-500">Select a POS outlet and optionally a prep station for station-scoped routing</p>
            {availableOutlets.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">All outlets are already connected</p>
            ) : (
              <>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {availableOutlets.map(outlet => (
                    <button
                      key={outlet.id}
                      onClick={() => { setConnectOutletId(outlet.id); setConnectStationId(''); fetchPrepStations(outlet.id); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        connectOutletId === outlet.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Utensils size={16} />
                      <div className="text-left">
                        <p className="text-sm font-bold">{outlet.name}</p>
                        <p className={`text-[10px] ${connectOutletId === outlet.id ? 'text-slate-800' : 'text-slate-400'}`}>
                          {outlet.outlet_type} · {outlet.code}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                {connectOutletId && prepStations.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Prep Station (optional)</label>
                    <p className="text-[10px] text-slate-400 mb-1.5">Leave empty for outlet-wide catch-all routing</p>
                    <select
                      value={connectStationId}
                      onChange={e => setConnectStationId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Outlet-wide (all stations)</option>
                      {prepStations.map((st: any) => (
                        <option key={st.id} value={st.id}>{st.station_name} ({st.station_type})</option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowConnectModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConnectOutlet}
                disabled={!connectOutletId}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black disabled:opacity-50"
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External POS Modal */}
      {showExternalModal && selectedInstance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowExternalModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Add External POS System</h3>
            <p className="text-xs text-slate-500">Register a third-party POS to send orders to this KDS</p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">System Name</label>
                <input
                  type="text"
                  value={externalForm.system_name}
                  onChange={e => setExternalForm({ ...externalForm, system_name: e.target.value })}
                  placeholder="e.g. Toast POS"
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">System Type</label>
                <select
                  value={externalForm.system_type}
                  onChange={e => setExternalForm({ ...externalForm, system_type: e.target.value })}
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="generic">Generic</option>
                  <option value="toast">Toast</option>
                  <option value="square">Square</option>
                  <option value="lightspeed">Lightspeed</option>
                  <option value="clover">Clover</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Webhook URL (optional)</label>
                <input
                  type="text"
                  value={externalForm.webhook_url}
                  onChange={e => setExternalForm({ ...externalForm, webhook_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full mt-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm text-slate-900 dark:text-white border-0 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-xs text-indigo-600 dark:text-indigo-400">
              An API key will be generated. The external POS posts orders to:
              <br />
              <code className="text-[10px] font-mono">/api/kds/external/&#123;api_key&#125;/orders</code>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowExternalModal(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExternal}
                disabled={!externalForm.system_name.trim()}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-black disabled:opacity-50"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
