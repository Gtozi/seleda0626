import React, { useEffect, useState, useCallback } from 'react';
import { Activity, Server, Database, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';

interface HealthResponse {
  status: string;
  system: string;
  authStore: string;
  timestamp: string;
}

interface AuditEvent {
  id: string;
  action: string;
  module?: string;
  outcome?: string;
  timestamp?: string;
  user_name?: string;
}

export default function SystemHealthDashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const started = performance.now();
      const res = await fetch('/api/health');
      const elapsed = Math.round(performance.now() - started);
      if (!res.ok) throw new Error(`Health check failed (${res.status})`);
      const data: HealthResponse = await res.json();
      setHealth(data);
      setLatencyMs(elapsed);
      setLastChecked(new Date());
    } catch (err: any) {
      setHealth(null);
      setError(err?.message || 'Unable to reach the API node');
    }

    try {
      const res = await fetch('/api/audit/events', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEvents(Array.isArray(data?.events) ? data.events.slice(0, 12) : []);
      } else {
        setEvents([]);
      }
    } catch {
      setEvents([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, [load]);

  const apiUp = Boolean(health) && !error;
  const errorEvents = events.filter(e => {
    const a = (e.action || '').toLowerCase();
    return e.outcome === 'denied' || a.includes('fail') || a.includes('error') || a.includes('denied');
  });

  const cards = [
    {
      icon: <Server size={20} className={apiUp ? 'text-emerald-600' : 'text-rose-600'} />,
      label: 'API Status',
      value: apiUp ? (health?.status === 'operational' ? 'Operational' : health?.status || 'Up') : 'Down',
    },
    {
      icon: <Activity size={20} className={latencyMs != null && latencyMs < 500 ? 'text-emerald-600' : 'text-amber-600'} />,
      label: 'API Latency',
      value: latencyMs != null ? `${latencyMs}ms` : '--',
    },
    {
      icon: <Database size={20} className={health?.authStore === 'database' ? 'text-emerald-600' : 'text-amber-600'} />,
      label: 'Auth Store',
      value: health?.authStore === 'database' ? 'Database' : health?.authStore === 'development-fallback' ? 'Dev Fallback' : '--',
    },
    {
      icon: <AlertTriangle size={20} className={errorEvents.length === 0 ? 'text-emerald-600' : 'text-rose-600'} />,
      label: 'Recent Errors',
      value: errorEvents.length,
    },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 space-y-4">
      <div className="bg-white px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-sans font-black text-slate-900 tracking-tight leading-none">System Health</h1>
            <p className="text-xs text-slate-500 font-sans mt-1">Live API status, auth store, latency, and recent audit events</p>
          </div>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-sans font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-6">
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl px-5 py-3 flex items-center gap-2 text-sm text-rose-700 font-medium">
            <AlertTriangle size={16} /> {error}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4">
          {cards.map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-50 rounded-xl">{item.icon}</div>
              <div>
                <p className="text-3xs font-mono uppercase text-slate-500 font-bold">{item.label}</p>
                <h3 className="text-xl font-sans font-black text-slate-900">{item.value}</h3>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Wifi size={18} /> Node Information
            </h3>
            {lastChecked && (
              <span className="text-3xs font-mono text-slate-400">Last checked {lastChecked.toLocaleTimeString()}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between border-b border-slate-100 py-2">
              <span className="text-slate-500 font-medium">System</span>
              <span className="font-mono text-slate-900">{health?.system || '--'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 py-2">
              <span className="text-slate-500 font-medium">Server Time</span>
              <span className="font-mono text-slate-900">{health?.timestamp ? new Date(health.timestamp).toLocaleString() : '--'}</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-base font-sans font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
            <Activity size={18} /> Recent Audit Events
          </h3>
          {events.length === 0 ? (
            <div className="h-32 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-xs text-slate-400 font-mono">
              {loading ? 'Loading events...' : 'No audit events available (requires audit:view permission)'}
            </div>
          ) : (
            <div className="space-y-1">
              {events.map((e, i) => {
                const isError = errorEvents.includes(e);
                return (
                  <div key={e.id || i} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-xs">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <span className="font-mono text-slate-400 w-40 shrink-0">{e.timestamp ? new Date(e.timestamp).toLocaleString() : '--'}</span>
                    <span className="font-bold text-slate-700 w-44 shrink-0 truncate">{e.action}</span>
                    <span className="text-slate-500 truncate">{e.module || 'system'}{e.user_name ? ` · ${e.user_name}` : ''}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
