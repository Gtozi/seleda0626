import React, { useState, useEffect, useCallback } from 'react';
import { Repeat, CalendarDays, Trash, Sparkles, AlertCircle } from 'lucide-react';

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

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RecurringSeriesTab({ roomTypes, currentPropertyId, onRefresh }: RecurringSeriesTabProps) {
  const [seriesList, setSeriesList] = useState<SeriesRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  return (
    <div className="bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 card-shadow space-y-5 animate-fade-in" id="series-view">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
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

      {/* Creation Form */}
      <form onSubmit={handleSubmit} className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Series Name</label>
            <input value={seriesName} onChange={e => setSeriesName(e.target.value)} placeholder="e.g. Weekly Corporate Stay" className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Guest Name</label>
            <input value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="John Doe" className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Guest Email</label>
            <input value={guestEmail} onChange={e => setGuestEmail(e.target.value)} placeholder="john@example.com" className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Guest Phone</label>
            <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+251..." className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Room Type</label>
            <select value={roomType} onChange={e => setRoomType(e.target.value)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
              {roomTypes.map(rt => <option key={rt.id} value={rt.name}>{rt.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Nights per Stay</label>
            <input type="number" min={1} value={nights} onChange={e => setNights(parseInt(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Rate per Night</label>
            <input type="number" min={0} value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Adults</label>
            <input type="number" min={1} value={adults} onChange={e => setAdults(parseInt(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Children</label>
            <input type="number" min={0} value={children} onChange={e => setChildren(parseInt(e.target.value) || 0)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
          </div>
        </div>

        {/* Recurrence Pattern */}
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3">
          <h4 className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300">Recurrence Pattern</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Frequency</label>
              <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Every (interval)</label>
              <input type="number" min={1} value={intervalDays} onChange={e => setIntervalDays(parseInt(e.target.value) || 1)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Start Date</label>
              <input type="date" value={startDate || todayStr} onChange={e => setStartDate(e.target.value)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30" />
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
                        ? 'bg-amber-500 text-white shadow-md'
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
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes..." className="w-full mt-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-sans text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none" />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-sans font-bold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Repeat size={14} />
          {submitting ? 'Creating Series...' : 'Create Recurring Series'}
        </button>
      </form>

      {/* Existing Series List */}
      <div className="space-y-3">
        <h4 className="text-xs font-sans font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <CalendarDays size={14} className="text-amber-500" />
          Active Series ({seriesList.length})
        </h4>
        {loading ? (
          <div className="text-xs text-slate-400 text-center py-6">Loading...</div>
        ) : seriesList.length === 0 ? (
          <div className="text-xs text-slate-400 text-center py-6 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
            No recurring series yet. Create one above.
          </div>
        ) : (
          <div className="space-y-2">
            {seriesList.map(s => (
              <div key={s.id} className="flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:shadow-sm transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-sans font-bold text-slate-900 dark:text-white truncate">{s.series_name}</span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">{s.frequency}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {s.guest_name} · {s.room_type} · {s.start_date} → {s.end_date}
                  </div>
                </div>
                <button
                  onClick={() => handleCancel(s.id, s.series_name)}
                  className="ml-3 p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Cancel series"
                >
                  <Trash size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
