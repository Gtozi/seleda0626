import React, { useState, useEffect, useCallback } from 'react';
import { Repeat, CalendarDays, Trash, Sparkles, AlertCircle, RefreshCw, BarChart3, X, Plus, Edit } from 'lucide-react';

interface SeriesRow {
  id: string;
  series_name: string;
  guest_name: string;
  room_type: string;
  frequency: string;
  interval_days: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

interface RoomTypeOption {
  id: string;
  name: string;
}

interface RecurringSeriesTabProps {
  roomTypes: RoomTypeOption[];
  currentPropertyId: string | null;
  onRefresh: () => Promise<void>;
}

interface SeriesException {
  id: string;
  exception_date: string;
  exception_type: string;
  override_room_type?: string;
  override_rate?: number;
  override_adults?: number;
  override_children?: number;
  reason?: string;
}

interface SeriesAnalytics {
  total_reservations: number;
  confirmed_reservations: number;
  cancelled_reservations: number;
  no_show_reservations: number;
  total_revenue: number;
  avg_rate: number;
  total_room_nights: number;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecurringSeriesTab({ roomTypes, currentPropertyId, onRefresh }: RecurringSeriesTabProps) {
  const [seriesList, setSeriesList] = useState<SeriesRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Enhanced series management state
  const [selectedSeries, setSelectedSeries] = useState<SeriesRow | null>(null);
  const [seriesExceptions, setSeriesExceptions] = useState<SeriesException[]>([]);
  const [seriesAnalytics, setSeriesAnalytics] = useState<SeriesAnalytics | null>(null);
  const [showExceptions, setShowExceptions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [addingException, setAddingException] = useState(false);

  // Exception form state
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionType, setExceptionType] = useState<'skip' | 'modify' | 'cancel'>('skip');
  const [overrideRoomType, setOverrideRoomType] = useState('');
  const [overrideRate, setOverrideRate] = useState<number>(0);
  const [overrideAdults, setOverrideAdults] = useState<number>(1);
  const [overrideChildren, setOverrideChildren] = useState<number>(0);
  const [exceptionReason, setExceptionReason] = useState('');

  // Form state
  const [seriesName, setSeriesName] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [roomType, setRoomType] = useState(roomTypes[0]?.name || 'Single');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [rate, setRate] = useState(150);
  const [nights, setNights] = useState(1);
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [intervalDays, setIntervalDays] = useState(1);
  const [weekdays, setWeekdays] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchSeries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reservation-series', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSeriesList(data.series || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeries();
  }, [fetchSeries]);

  const toggleWeekday = (day: number) => {
    setWeekdays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!seriesName || !guestName || !startDate || !endDate) {
      setError('Series name, guest name, start date, and end date are required.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.');
      return;
    }
    if (frequency === 'weekly' && weekdays.length === 0) {
      setError('Select at least one weekday for weekly frequency.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reservation-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          series_name: seriesName,
          guest_name: guestName,
          guest_email: guestEmail || null,
          guest_phone: guestPhone || null,
          room_type: roomType,
          adults,
          children,
          rate,
          check_in_offset: nights,
          frequency,
          interval_days: intervalDays,
          days_of_week: frequency === 'weekly' ? weekdays : null,
          start_date: startDate,
          end_date: endDate,
          notes: notes || null,
          property_id: currentPropertyId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create series');
      } else {
        setSuccess(`Series "${seriesName}" created with ${data.generatedCount} reservations.`);
        setSeriesName('');
        setGuestName('');
        setGuestEmail('');
        setGuestPhone('');
        setNotes('');
        setWeekdays([]);
        await fetchSeries();
        await onRefresh();
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (id: string, name: string) => {
    if (!confirm(`Cancel series "${name}" and all future reservations?`)) return;
    try {
      const res = await fetch(`/api/reservation-series/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setSuccess(`Series "${name}" cancelled.`);
        await fetchSeries();
        await onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to cancel series');
      }
    } catch {
      setError('Network error');
    }
  };

  const loadSeriesExceptions = async (seriesId: string) => {
    try {
      const res = await fetch(`/api/reservation-series/${seriesId}/exceptions`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSeriesExceptions(data.exceptions || []);
      }
    } catch (error) {
      console.error('Failed to load exceptions:', error);
    }
  };

  const loadSeriesAnalytics = async (seriesId: string) => {
    try {
      const res = await fetch(`/api/reservation-series/${seriesId}/analytics`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        const latest = data.analytics?.[0];
        if (latest) {
          setSeriesAnalytics({
            total_reservations: latest.total_reservations,
            confirmed_reservations: latest.confirmed_reservations,
            cancelled_reservations: latest.cancelled_reservations,
            no_show_reservations: latest.no_show_reservations,
            total_revenue: latest.total_revenue,
            avg_rate: latest.avg_rate,
            total_room_nights: latest.total_room_nights
          });
        }
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSeries || !exceptionDate) return;

    try {
      const res = await fetch(`/api/reservation-series/${selectedSeries.id}/exceptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          exception_date: exceptionDate,
          exception_type: exceptionType,
          override_room_type: exceptionType === 'modify' ? overrideRoomType : null,
          override_rate: exceptionType === 'modify' ? overrideRate : null,
          override_adults: exceptionType === 'modify' ? overrideAdults : null,
          override_children: exceptionType === 'modify' ? overrideChildren : null,
          reason: exceptionReason
        })
      });

      if (res.ok) {
        setSuccess('Exception added successfully');
        setExceptionDate('');
        setExceptionReason('');
        setAddingException(false);
        await loadSeriesExceptions(selectedSeries.id);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to add exception');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleRemoveException = async (exceptionId: string) => {
    if (!selectedSeries) return;
    try {
      const res = await fetch(`/api/reservation-series/${selectedSeries.id}/exceptions/${exceptionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (res.ok) {
        setSuccess('Exception removed');
        await loadSeriesExceptions(selectedSeries.id);
      } else {
        setError('Failed to remove exception');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleRegenerateSeries = async (seriesId: string) => {
    if (!confirm('Regenerate all future reservations for this series? This will replace existing future reservations.')) return;

    try {
      const res = await fetch(`/api/reservation-series/${seriesId}/regenerate`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(`Series regenerated with ${data.generatedCount} reservations`);
        await onRefresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Failed to regenerate series');
      }
    } catch (error) {
      setError('Network error');
    }
  };

  const handleSelectSeries = async (series: SeriesRow) => {
    setSelectedSeries(series);
    setShowExceptions(true);
    setShowAnalytics(true);
    await loadSeriesExceptions(series.id);
    await loadSeriesAnalytics(series.id);
  };

  if (!roomTypes || roomTypes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="text-center">
          <CalendarDays size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">No room types available</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Configure room types to create recurring series</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 sm:p-6 card-shadow space-y-5 animate-fade-in" id="series-view">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-orange-500 flex items-center justify-center shadow-md">
          <Repeat size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-sans font-black text-slate-900 dark:text-white tracking-tight">Recurring Reservation Series</h3>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-sans">Create repeating reservations with daily, weekly, or monthly patterns.</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 font-mono text-xs rounded-lg flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-mono text-xs rounded-lg flex items-center gap-2">
          <Sparkles size={14} /> {success}
        </div>
      )}

      {/* Series List with Actions */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 dark:text-white">Active Series</h4>
          <button
            onClick={fetchSeries}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <RefreshCw size={14} />
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[200px] overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-400 text-xs">Loading series...</div>
          ) : seriesList.length === 0 ? (
            <div className="p-4 text-center text-slate-400 text-xs">
              No active series found. Create one using the form above.
            </div>
          ) : (
            seriesList.map((series) => (
              <div
                key={series.id}
                className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 dark:text-white">{series.series_name}</span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleSelectSeries(series)}
                      className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                      title="View Details"
                    >
                      <BarChart3 size={12} />
                    </button>
                    <button
                      onClick={() => handleRegenerateSeries(series.id)}
                      className="p-1 text-slate-400 hover:text-green-600 transition-colors"
                      title="Regenerate"
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      onClick={() => handleCancel(series.id, series.series_name)}
                      className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      title="Cancel Series"
                    >
                      <Trash size={12} />
                    </button>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {series.guest_name} • {series.frequency} • {series.room_type}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Selected Series Details */}
      {selectedSeries && (
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-100">{selectedSeries.series_name}</h4>
            <button
              onClick={() => setSelectedSeries(null)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          </div>

          {/* Analytics Panel */}
          {showAnalytics && seriesAnalytics && (
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-400">Total</div>
                <div className="text-sm font-bold text-slate-800 dark:text-white">{seriesAnalytics.total_reservations}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-400">Confirmed</div>
                <div className="text-sm font-bold text-green-600">{seriesAnalytics.confirmed_reservations}</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-lg p-2 text-center">
                <div className="text-[10px] text-slate-400">Revenue</div>
                <div className="text-sm font-bold text-indigo-600">${seriesAnalytics.total_revenue.toFixed(0)}</div>
              </div>
            </div>
          )}

          {/* Exceptions Panel */}
          {showExceptions && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Exceptions</h5>
                <button
                  onClick={() => setAddingException(!addingException)}
                  className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                >
                  <Plus size={10} />
                  Add Exception
                </button>
              </div>

              {addingException && (
                <form onSubmit={handleAddException} className="bg-white dark:bg-slate-800 rounded-lg p-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] font-mono text-slate-400">Date</label>
                      <input
                        type="date"
                        value={exceptionDate}
                        onChange={(e) => setExceptionDate(e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-mono text-slate-400">Type</label>
                      <select
                        value={exceptionType}
                        onChange={(e) => setExceptionType(e.target.value as any)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                      >
                        <option value="skip">Skip</option>
                        <option value="modify">Modify</option>
                        <option value="cancel">Cancel</option>
                      </select>
                    </div>
                  </div>
                  {exceptionType === 'modify' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-400">Override Rate</label>
                        <input
                          type="number"
                          value={overrideRate}
                          onChange={(e) => setOverrideRate(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-mono text-slate-400">Adults</label>
                        <input
                          type="number"
                          value={overrideAdults}
                          onChange={(e) => setOverrideAdults(Number(e.target.value))}
                          className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-[9px] font-mono text-slate-400">Reason</label>
                    <input
                      type="text"
                      value={exceptionReason}
                      onChange={(e) => setExceptionReason(e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800"
                      placeholder="Optional reason"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                    >
                      Add Exception
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingException(false)}
                      className="px-2 py-1 bg-slate-200 text-slate-700 text-xs rounded hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-1 max-h-[100px] overflow-y-auto">
                {seriesExceptions.length === 0 ? (
                  <div className="text-[10px] text-slate-400 text-center py-2">No exceptions</div>
                ) : (
                  seriesExceptions.map((exc) => (
                    <div
                      key={exc.id}
                      className="flex items-center justify-between bg-white dark:bg-slate-800 rounded px-2 py-1 text-[10px]"
                    >
                      <span>
                        {exc.exception_date} • <span className="font-bold">{exc.exception_type}</span>
                      </span>
                      <button
                        onClick={() => handleRemoveException(exc.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Creation Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Series Name</label>
            <input value={seriesName} onChange={e => setSeriesName(e.target.value)} placeholder="e.g. Weekly Corporate Stay" className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Guest Name</label>
            <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="John Doe" className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Guest Email</label>
            <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="john@example.com" className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Guest Phone</label>
            <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+251..." className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Room Type</label>
            <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
              {roomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Nights per Stay</label>
            <input type="number" min={1} value={nights} onChange={e => setNights(parseInt(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Rate per Night</label>
            <input type="number" min={0} value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Adults</label>
            <input type="number" min={1} value={adults} onChange={e => setAdults(parseInt(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Children</label>
            <input type="number" min={0} value={children} onChange={e => setChildren(parseInt(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
          </div>
        </div>

        {/* Recurrence Pattern */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
          <h4 className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300">Recurrence Pattern</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Every (interval)</label>
              <input type="number" min={1} value={intervalDays} onChange={e => setIntervalDays(parseInt(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Start Date</label>
              <input type="date" value={startDate || todayStr} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30" />
            </div>
          </div>

          {frequency === 'weekly' && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Repeat on</label>
              <div className="flex gap-1.5 mt-1.5">
                {WEEKDAY_LABELS.map((label, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleWeekday(idx)}
                    className={`w-9 h-9 rounded-lg text-[10px] font-bold transition-all ${
                      weekdays.includes(idx)
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 resize-none" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-orange-500 text-white text-xs font-sans font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Repeat size={14} />
          {submitting ? 'Creating Series...' : 'Create Recurring Series'}
        </button>
      </form>
    </div>
  );
}
