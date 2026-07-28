/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChefHat,
  Clock,
  CheckCircle2,
  Timer,
  AlertCircle,
  Flame,
  TrendingDown,
  RefreshCw,
  RotateCcw,
  Utensils,
  Coffee,
  Cake,
  Flame as GrillIcon,
  Monitor,
  BarChart3,
  XCircle,
  Zap,
  Wifi,
  WifiOff,
  Link2,
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

interface KDSTicket {
  id: string;
  order_id: string;
  outlet_id: string | null;
  station_id: string | null;
  table_number: string | null;
  room_number: string | null;
  customer_name: string | null;
  order_type: string;
  items: { name: string; quantity: number; notes?: string; modifiers?: string[] }[];
  course_group: string;
  priority: string;
  status: string;
  fired_at: string | null;
  in_progress_at: string | null;
  ready_at: string | null;
  served_at: string | null;
  recalled_at: string | null;
  recalled_reason: string | null;
  bumped_by: string | null;
  target_prep_time_minutes: number;
  notes: string | null;
  created_at: string;
}

interface PrepStation {
  id: string;
  station_name: string;
  station_type: string;
  target_prep_time_minutes: number;
  is_active: boolean;
}

interface KDSInstance {
  id: string;
  name: string;
  instance_type: string;
  is_active: boolean;
  last_seen_at: string | null;
  display_device_id: string | null;
  pos_connections?: any[];
  external_pos_systems?: any[];
}

export default function KitchenDisplayModule() {
  const { addNotification } = useERP();

  const [tickets, setTickets] = useState<KDSTicket[]>([]);
  const [stations, setStations] = useState<PrepStation[]>([]);
  const [kdsInstances, setKdsInstances] = useState<KDSInstance[]>([]);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('all');
  const [selectedStationId, setSelectedStationId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'station' | 'expo' | 'performance'>('station');
  const [expoData, setExpoData] = useState<any[]>([]);
  const [perfData, setPerfData] = useState<any[]>([]);
  // Fetch KDS instances (with connections for health cards)
  useEffect(() => {
    const fetchInstances = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/kds?is_active=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setKdsInstances(data.instances || []);
        }
      } catch (err) {
        console.error('Failed to fetch KDS instances:', err);
      }
    };
    fetchInstances();
    const instInterval = setInterval(fetchInstances, 30000);
    return () => clearInterval(instInterval);
  }, []);

  // Fetch prep stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const res = await fetch('/api/pos/prep-stations?is_active=true', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStations(data.stations || []);
        }
      } catch (err) {
        console.error('Failed to fetch prep stations:', err);
      }
    };
    fetchStations();
  }, []);

  // Fetch KDS tickets — uses standalone KDS API if an instance is selected, falls back to POS API
  const fetchTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (selectedInstanceId !== 'all') {
        // Standalone KDS API — instance-scoped
        const params = new URLSearchParams();
        if (selectedStationId !== 'all') params.set('station_id', selectedStationId);
        const res = await fetch(`/api/kds/${selectedInstanceId}/tickets?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
        }
      } else {
        // Legacy POS API — all tickets across instances
        const params = new URLSearchParams();
        if (selectedStationId !== 'all') params.set('station_id', selectedStationId);
        const res = await fetch(`/api/pos/kds/tickets?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setTickets(data.tickets || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch KDS tickets:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedStationId, selectedInstanceId]);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  // Tick every second for timer updates
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  const updateTicketStatus = async (ticketId: string, status: string) => {
    setUpdatingId(ticketId);
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = selectedInstanceId !== 'all' ? '/api/kds' : '/api/pos/kds';
      const res = await fetch(`${baseUrl}/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
        if (status === 'ready') {
          addNotification('Order ready for pickup!', 'info', 'F&B');
        } else if (status === 'served') {
          addNotification('Order served successfully', 'success', 'F&B');
        }
      } else {
        const err = await res.json();
        addNotification(err.error || 'Failed to update ticket', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to update ticket status', 'warning', 'F&B');
    } finally {
      setUpdatingId(null);
    }
  };

  const recallTicket = async (ticketId: string) => {
    setUpdatingId(ticketId);
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = selectedInstanceId !== 'all' ? '/api/kds' : '/api/pos/kds';
      const res = await fetch(`${baseUrl}/tickets/${ticketId}/recall`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recalled_reason: 'Sent back from KDS' }),
      });
      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        addNotification('Ticket recalled to kitchen', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to recall ticket', 'warning', 'F&B');
    } finally {
      setUpdatingId(null);
    }
  };

  const voidTicket = async (ticketId: string) => {
    setUpdatingId(ticketId);
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = selectedInstanceId !== 'all' ? '/api/kds' : '/api/pos/kds';
      const res = await fetch(`${baseUrl}/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'voided' }),
      });
      if (res.ok) {
        setTickets(prev => prev.filter(t => t.id !== ticketId));
        addNotification('Ticket voided (86\'d) — POS notified', 'warning', 'F&B');
      }
    } catch (err) {
      addNotification('Failed to void ticket', 'warning', 'F&B');
    } finally {
      setUpdatingId(null);
    }
  };

  const fireCourse = async (orderId: string, courseGroup: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const baseUrl = selectedInstanceId !== 'all' ? '/api/kds' : '/api/pos/kds';
      const res = await fetch(`${baseUrl}/orders/${orderId}/fire-course`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ course_group: courseGroup }),
      });
      if (res.ok) {
        const data = await res.json();
        addNotification(`${data.fired} ${courseGroup} ticket(s) fired`, 'info', 'F&B');
        fetchTickets();
        if (viewMode === 'expo') fetchExpoData();
      }
    } catch (err) {
      addNotification('Failed to fire course', 'warning', 'F&B');
    }
  };

  const fetchExpoData = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = selectedInstanceId !== 'all'
        ? `/api/kds/${selectedInstanceId}/expo`
        : '/api/pos/kds/expo';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setExpoData(data.expo || []);
      }
    } catch (err) {
      console.error('Failed to fetch expo data:', err);
    }
  }, []);

  const fetchPerfData = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const url = selectedInstanceId !== 'all'
        ? `/api/kds/${selectedInstanceId}/performance?lookback=24`
        : '/api/pos/kds/station-performance?hours=24';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPerfData(data.performance || []);
      }
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
    }
  }, []);

  useEffect(() => {
    if (viewMode === 'expo') fetchExpoData();
    if (viewMode === 'performance') fetchPerfData();
  }, [viewMode, fetchExpoData, fetchPerfData, selectedInstanceId]);

  const getElapsedMinutes = (ticket: KDSTicket): number => {
    const startTime = ticket.fired_at || ticket.created_at;
    const endTime = ticket.served_at || ticket.ready_at ? new Date(ticket.served_at || ticket.ready_at || '').getTime() : now;
    return Math.floor((endTime - new Date(startTime).getTime()) / 60000);
  };

  const getTimerColor = (elapsed: number, target: number) => {
    if (elapsed > target * 1.5) return 'text-rose-500 font-black animate-pulse';
    if (elapsed > target) return 'text-amber-500 font-bold';
    return 'text-emerald-500 font-bold';
  };

  const getCardAgeBg = (status: string, elapsed: number, target: number): string => {
    if (status === 'ready' || status === 'served') return '';
    if (elapsed > target * 1.5) return 'bg-rose-50/60 dark:bg-rose-950/30';
    if (elapsed > target) return 'bg-amber-50/50 dark:bg-amber-950/20';
    return '';
  };

  const getElapsedString = (ticket: KDSTicket): string => {
    const startTime = ticket.fired_at || ticket.created_at;
    const endTime = ticket.served_at || ticket.ready_at ? new Date(ticket.served_at || ticket.ready_at || '').getTime() : now;
    const totalSec = Math.floor((endTime - new Date(startTime).getTime()) / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'vip': return 'bg-indigo-600 text-white';
      case 'urgent': return 'bg-rose-600 text-white';
      default: return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  const getStationIcon = (type: string) => {
    switch (type) {
      case 'bar_prep': return Coffee;
      case 'pastry': return Cake;
      case 'grill': return GrillIcon;
      case 'dessert': return Cake;
      default: return ChefHat;
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case 'fired': return 'border-rose-500';
      case 'in_progress': return 'border-amber-500';
      case 'ready': return 'border-emerald-500';
      case 'recalled': return 'border-purple-500';
      default: return 'border-slate-300 dark:border-slate-700';
    }
  };

  const getCourseColor = (course: string) => {
    switch (course) {
      case 'starter': return 'bg-sky-100 dark:bg-sky-900/30 text-sky-600';
      case 'main': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600';
      case 'dessert': return 'bg-pink-100 dark:bg-pink-900/30 text-pink-600';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500';
    }
  };

  const stats = useMemo(() => {
    const fired = tickets.filter(t => t.status === 'fired').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const ready = tickets.filter(t => t.status === 'ready').length;
    const late = tickets.filter(t => {
      const elapsed = getElapsedMinutes(t);
      return elapsed > t.target_prep_time_minutes && t.status !== 'ready' && t.status !== 'served';
    }).length;
    return { fired, inProgress, ready, late };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, now]);

  const isInstanceOnline = (lastSeen: string | null) => {
    if (!lastSeen) return false;
    return Date.now() - new Date(lastSeen).getTime() < 60000;
  };

  const getInstanceIcon = (type: string) => {
    switch (type) {
      case 'station': return ChefHat;
      case 'expo': return Monitor;
      default: return Utensils;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Fired', count: stats.fired, color: 'bg-rose-500', icon: Flame },
          { label: 'In Progress', count: stats.inProgress, color: 'bg-amber-500', icon: TrendingDown },
          { label: 'Ready', count: stats.ready, color: 'bg-emerald-500', icon: CheckCircle2 },
          { label: 'Late', count: stats.late, color: 'bg-red-600', icon: AlertCircle },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-3xl shadow-sm transition-all hover:border-indigo-400">
              <div className="flex justify-between items-start mb-2">
                <div className={'w-8 h-8 rounded-xl ' + item.color + ' flex items-center justify-center text-white shadow-lg'}>
                  <Icon size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</span>
              </div>
              <div>
                <p className="text-2xl font-black text-slate-850 dark:text-white leading-tight">{item.count}</p>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{item.label}</h4>
              </div>
            </div>
          );
        })}
      </div>

      {/* KDS Instance Health Cards */}
      {kdsInstances.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {kdsInstances.map(inst => {
            const online = isInstanceOnline(inst.last_seen_at);
            const InstIcon = getInstanceIcon(inst.instance_type);
            const instTickets = selectedInstanceId === 'all' || selectedInstanceId === inst.id
              ? tickets.filter(t => {
                  if (selectedInstanceId !== 'all') return true;
                  const conn = inst.pos_connections?.find((c: any) => c.outlet?.id === t.outlet_id);
                  return !!conn;
                })
              : [];
            const instFired = instTickets.filter(t => t.status === 'fired').length;
            const instInProgress = instTickets.filter(t => t.status === 'in_progress').length;
            const instReady = instTickets.filter(t => t.status === 'ready').length;
            const outletCount = inst.pos_connections?.length || 0;
            return (
              <button
                key={inst.id}
                onClick={() => { setSelectedInstanceId(selectedInstanceId === inst.id ? 'all' : inst.id); setLoading(true); }}
                className={`text-left bg-white dark:bg-slate-900 border-2 rounded-2xl p-3 transition-all hover:shadow-lg ${
                  selectedInstanceId === inst.id
                    ? 'border-amber-500 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800'
                } ${!inst.is_active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      inst.instance_type === 'expo' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                      inst.instance_type === 'station' ? 'bg-amber-100 dark:bg-amber-900/30' :
                      'bg-emerald-100 dark:bg-emerald-900/30'
                    }`}>
                      <InstIcon size={14} className={inst.instance_type === 'expo' ? 'text-indigo-600' : inst.instance_type === 'station' ? 'text-amber-600' : 'text-emerald-600'} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[100px]">{inst.name}</p>
                      <p className="text-[8px] text-slate-400 uppercase font-bold">{inst.instance_type}</p>
                    </div>
                  </div>
                  {online ? (
                    <Wifi size={12} className="text-emerald-500" />
                  ) : (
                    <WifiOff size={12} className="text-slate-300" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1 text-rose-500 font-bold">
                    <Flame size={8} /> {instFired}
                  </span>
                  <span className="flex items-center gap-1 text-amber-500 font-bold">
                    <TrendingDown size={8} /> {instInProgress}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500 font-bold">
                    <CheckCircle2 size={8} /> {instReady}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 ml-auto">
                    <Link2 size={8} /> {outletCount}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Header + View Toggle + Station Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-slate-950 rounded-2xl">
            <ChefHat size={24} />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-sm">KDS Operational Screen</h3>
            <p className="text-slate-400 text-xs font-mono">Real-time Kitchen Order Stream & Prep-time Monitor</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* KDS Instance Selector */}
          {kdsInstances.length > 0 && (
            <select
              value={selectedInstanceId}
              onChange={(e) => { setSelectedInstanceId(e.target.value); setLoading(true); }}
              className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All KDS Displays</option>
              {kdsInstances.map(inst => (
                <option key={inst.id} value={inst.id}>{inst.name}</option>
              ))}
            </select>
          )}
          {/* View Mode Toggle */}
          <div className="flex gap-1 bg-slate-800 rounded-xl p-1">
            {[
              { mode: 'station' as const, label: 'Station', icon: ChefHat },
              { mode: 'expo' as const, label: 'Expo', icon: Monitor },
              { mode: 'performance' as const, label: 'Metrics', icon: BarChart3 },
            ].map(v => {
              const VIcon = v.icon;
              return (
                <button
                  key={v.mode}
                  onClick={() => setViewMode(v.mode)}
                  className={'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ' + (
                    viewMode === v.mode
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <VIcon size={14} />
                  {v.label}
                </button>
              );
            })}
          </div>
          {viewMode === 'station' && (
            <select
              value={selectedStationId}
              onChange={(e) => { setSelectedStationId(e.target.value); setLoading(true); }}
              className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="all">All Stations</option>
              {stations.map(s => {
                const routedInstance = kdsInstances.find(inst =>
                  inst.pos_connections?.some((c: any) => c.prep_station_id === s.id)
                );
                const instanceLabel = routedInstance ? ` → ${routedInstance.name}` : '';
                return (
                  <option key={s.id} value={s.id}>{s.station_name}{instanceLabel}</option>
                );
              })}
            </select>
          )}
          <button
            onClick={() => {
              if (viewMode === 'station') { fetchTickets(); setNow(Date.now()); }
              else if (viewMode === 'expo') fetchExpoData();
              else fetchPerfData();
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && viewMode === 'station' ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        </div>
      ) : viewMode === 'expo' ? (
        /* ── Expo Aggregate View (§4.3) ── */
        expoData.length === 0 ? (
          <div className="text-center py-12">
            <Monitor className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">No active orders for expo view</p>
            <p className="text-xs text-slate-400 mt-1">Aggregate table view appears when orders span multiple stations</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {expoData.map((expo: any) => {
              const allReady = expo.all_ready;
              const stationName = (sid: string) => stations.find(s => s.id === sid)?.station_name || 'Unassigned';
              return (
                <div key={expo.order_id} className={'bg-white dark:bg-slate-900 border-t-4 rounded-b-3xl shadow-sm transition-all ' + (allReady ? 'border-emerald-500' : 'border-amber-500')}>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs border-b dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-slate-900 dark:text-white">
                        {expo.table_number || '—'}
                      </h4>
                      <span className={'px-2 py-0.5 rounded-full text-[8px] font-black uppercase ' + getCourseColor(expo.course_group)}>
                        {expo.course_group}
                      </span>
                    </div>
                    <div className={'px-2 py-0.5 rounded-full text-[8px] font-black uppercase ' + (allReady ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600')}>
                      {expo.ready_count}/{expo.station_count} Ready
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {expo.customer_name && (
                      <p className="text-[10px] text-slate-500 font-medium">Guest: {expo.customer_name}</p>
                    )}
                    {expo.tickets.map((t: any) => {
                      const stName = stationName(t.station_id);
                      const stIcon = getStationIcon(stations.find(s => s.id === t.station_id)?.station_type || '');
                      const StIcon = stIcon;
                      return (
                        <div key={t.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <StIcon size={14} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{stName}</span>
                          </div>
                          <span className={'px-2 py-0.5 rounded-full text-[8px] font-black uppercase ' + (
                            t.status === 'ready' ? 'bg-emerald-100 text-emerald-600' :
                            t.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                            'bg-rose-100 text-rose-600'
                          )}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                    {allReady && (
                      <div className="mt-2 text-center text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg py-1.5">
                        ALL STATIONS READY — BUMP TABLE
                      </div>
                    )}
                    {/* Fire next course button */}
                    <button
                      onClick={() => fireCourse(expo.order_id, expo.course_group === 'starter' ? 'main' : expo.course_group === 'main' ? 'dessert' : 'starter')}
                      className="mt-2 w-full py-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <Zap size={10} /> FIRE NEXT COURSE
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : viewMode === 'performance' ? (
        /* ── Station Performance View (§6.5) ── */
        perfData.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-sm text-slate-500">No performance data in the last 24 hours</p>
            <p className="text-xs text-slate-400 mt-1">Metrics appear once tickets have been served</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {perfData.map((p: any) => {
                const StIcon = getStationIcon(p.station_type);
                return (
                  <div key={p.station_id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <StIcon size={18} className="text-slate-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{p.station_name}</h4>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">{p.station_type}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Total Tickets</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{p.total_tickets}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Avg Prep Time</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{p.avg_prep_time_minutes}m</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">On-Time Rate</p>
                        <p className={'text-lg font-black ' + (p.on_time_rate >= 80 ? 'text-emerald-600' : p.on_time_rate >= 50 ? 'text-amber-600' : 'text-rose-600')}>{p.on_time_rate}%</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2">
                        <p className="text-[9px] text-slate-400 font-bold uppercase">Recall Rate</p>
                        <p className={'text-lg font-black ' + (p.recall_rate < 5 ? 'text-emerald-600' : p.recall_rate < 15 ? 'text-amber-600' : 'text-rose-600')}>{p.recall_rate}%</p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2 text-[10px] text-slate-500">
                      <span>Served: {p.served_tickets}</span>
                      <span>·</span>
                      <span>Voided: {p.voided_tickets}</span>
                      <span>·</span>
                      <span>Recalled: {p.recalled_tickets}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : tickets.length === 0 ? (
        <div className="text-center py-12">
          <ChefHat className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500">No active KDS tickets</p>
          <p className="text-xs text-slate-400 mt-1">Orders sent from POS will appear here automatically</p>
        </div>
      ) : (
        /* ── Station View (default) ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 content-start items-start">
          {tickets.map(ticket => {
            const elapsed = getElapsedMinutes(ticket);
            const station = stations.find(s => s.id === ticket.station_id);
            const StationIcon = station ? getStationIcon(station.station_type) : Utensils;
            return (
              <div key={ticket.id} className={'bg-white dark:bg-slate-900 border-t-4 ' + getBorderColor(ticket.status) + ' rounded-b-3xl shadow-sm flex flex-col min-h-[280px] animate-fade-in relative transition-all hover:shadow-xl ' + getCardAgeBg(ticket.status, elapsed, ticket.target_prep_time_minutes)}>
                {/* Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center text-xs border-b dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <StationIcon size={14} className="text-slate-400" />
                    <h4 className="font-black text-slate-900 dark:text-white">
                      {ticket.table_number || ticket.room_number || '—'}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-400">{ticket.order_id}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={'px-2 py-0.5 rounded-full text-[8px] font-black uppercase ' + getCourseColor(ticket.course_group)}>
                      {ticket.course_group}
                    </span>
                    <div className={'px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tight ' + getPriorityColor(ticket.priority)}>
                      {ticket.priority}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                      <Clock size={12} />
                      <span>{new Date(ticket.fired_at || ticket.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={'flex items-center gap-1 text-xs ' + getTimerColor(elapsed, ticket.target_prep_time_minutes)}>
                      <Timer size={14} />
                      <span className="tabular-nums">{getElapsedString(ticket)} / {ticket.target_prep_time_minutes}m</span>
                    </div>
                  </div>

                  {ticket.customer_name && (
                    <div className="text-[10px] text-slate-500 font-medium">
                      Guest: {ticket.customer_name}
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    {(ticket.items || []).map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-slate-900 dark:text-white">{item.quantity}x</span>
                          <span className="text-sm font-bold text-slate-850 dark:text-slate-200">{item.name}</span>
                        </div>
                        {item.notes && (
                          <div className="ml-7 flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 dark:bg-rose-900/20 px-1.5 py-0.5 rounded border border-rose-100 dark:border-rose-900/50 font-bold uppercase tracking-tighter">
                            <AlertCircle size={10} /> {item.notes}
                          </div>
                        )}
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="ml-7 text-[10px] text-slate-500">
                            {item.modifiers.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {ticket.notes && (
                    <div className="text-[10px] text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded font-medium">
                      Note: {ticket.notes}
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-b-3xl border-t dark:border-slate-800 space-y-2">
                  {ticket.status === 'fired' && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                      disabled={updatingId === ticket.id}
                      className="w-full py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-600 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <TrendingDown size={14} className="rotate-90" /> START PREP
                    </button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'ready')}
                      disabled={updatingId === ticket.id}
                      className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-black hover:bg-emerald-700 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> MARK READY
                    </button>
                  )}
                  {ticket.status === 'ready' && (
                    <button
                      onClick={() => updateTicketStatus(ticket.id, 'served')}
                      disabled={updatingId === ticket.id}
                      className="w-full py-2 bg-slate-700 text-white rounded-xl text-xs font-black hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={14} /> BUMP / SERVED
                    </button>
                  )}
                  {ticket.status === 'recalled' && (
                    <div className="text-center text-xs text-purple-600 font-bold py-1">
                      RECALLED: {ticket.recalled_reason}
                    </div>
                  )}
                  <div className="flex gap-2">
                    {/* Recall button for active tickets */}
                    {(ticket.status === 'in_progress' || ticket.status === 'ready') && (
                      <button
                        onClick={() => recallTicket(ticket.id)}
                        disabled={updatingId === ticket.id}
                        className="flex-1 py-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <RotateCcw size={10} /> RECALL
                      </button>
                    )}
                    {/* Void/86 button for fired/in_progress tickets */}
                    {(ticket.status === 'fired' || ticket.status === 'in_progress') && (
                      <button
                        onClick={() => voidTicket(ticket.id)}
                        disabled={updatingId === ticket.id}
                        className="flex-1 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <XCircle size={10} /> VOID/86
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
