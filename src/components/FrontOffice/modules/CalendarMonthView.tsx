/**
 * Calendar Matrix View
 * Rooms as rows, dates as columns. Reservations render as merged blocks
 * spanning the nights they occupy on the assigned room's row.
 */
import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  List,
  Grid3x3,
} from 'lucide-react';
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  subWeeks,
  subMonths,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  isSameDay,
  parseISO,
  eachDayOfInterval,
} from 'date-fns';

interface CalendarReservation {
  id: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source?: string;
  rooms?: { roomType: string; roomNumber?: string }[];
  totalAmount?: number;
}

interface CalendarRoom {
  id?: string;
  number: string;
  type: string;
  status?: string;
  rate?: number;
}

interface CalendarMonthViewProps {
  reservations: CalendarReservation[];
  rooms: CalendarRoom[];
  calendarMonth: Date;
  onMonthChange: (date: Date) => void;
  onReservationClick: (reservation: CalendarReservation) => void;
}

type ViewMode = 'day' | 'week' | 'month';

interface MergedBlock {
  reservation: CalendarReservation;
  startIndex: number;
  span: number;
}

const allStatuses = [
  'confirmed',
  'checked-in',
  'checked-out',
  'tentative',
  'waitlist',
  'cancelled',
  // DB-style status values
  'Confirmed',
  'CheckedIn',
  'CheckedOut',
  'Cancelled',
  'Waitlisted',
];

// Solid background colors for reservation blocks (status-based)
const blockBg: Record<string, string> = {
  confirmed: 'bg-green-500',
  'checked-in': 'bg-emerald-500',
  'checked-out': 'bg-purple-500',
  tentative: 'bg-yellow-500',
  waitlist: 'bg-blue-500',
  cancelled: 'bg-red-500',
  Confirmed: 'bg-green-500',
  CheckedIn: 'bg-emerald-500',
  CheckedOut: 'bg-purple-500',
  Cancelled: 'bg-red-500',
  Waitlisted: 'bg-blue-500',
};

const blockText: Record<string, string> = {
  confirmed: 'text-white',
  'checked-in': 'text-white',
  'checked-out': 'text-white',
  tentative: 'text-yellow-950',
  waitlist: 'text-white',
  cancelled: 'text-white',
  Confirmed: 'text-white',
  CheckedIn: 'text-white',
  CheckedOut: 'text-white',
  Cancelled: 'text-white',
  Waitlisted: 'text-white',
};

const LEGEND = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'checked-in', label: 'Checked In' },
  { key: 'checked-out', label: 'Checked Out' },
  { key: 'tentative', label: 'Tentative' },
  { key: 'waitlist', label: 'Waitlist' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function CalendarMonthView({
  reservations,
  rooms,
  calendarMonth,
  onMonthChange,
  onReservationClick,
}: CalendarMonthViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([...allStatuses]);

  const selectedStatuses = useMemo(() => new Set(filterStatuses), [filterStatuses]);

  // Build the date range (columns) based on view mode, anchored to calendarMonth
  const dateRange = useMemo<Date[]>(() => {
    if (viewMode === 'day') {
      return [calendarMonth];
    }
    if (viewMode === 'week') {
      const start = startOfWeek(calendarMonth, { weekStartsOn: 0 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }
    // month: full calendar grid weeks covering the month
    const monthStart = startOfMonth(calendarMonth);
    const monthEnd = endOfMonth(calendarMonth);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMode, calendarMonth]);

  const navigate = (dir: 'prev' | 'next') => {
    if (dir === 'prev') {
      onMonthChange(
        viewMode === 'day'
          ? addDays(calendarMonth, -1)
          : viewMode === 'week'
          ? subWeeks(calendarMonth, 1)
          : subMonths(calendarMonth, 1)
      );
    } else {
      onMonthChange(
        viewMode === 'day'
          ? addDays(calendarMonth, 1)
          : viewMode === 'week'
          ? addWeeks(calendarMonth, 1)
          : addMonths(calendarMonth, 1)
      );
    }
  };

  const goToday = () => onMonthChange(new Date());

  const toggleStatus = (status: string) => {
    setFilterStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return Array.from(next);
    });
  };

  // Resolve all effective room numbers for a reservation.
  // A group booking may span multiple physical rooms; each assigned room
  // row should display the reservation block. Returns unique room numbers.
  const effectiveRoomNumbers = (res: CalendarReservation): string[] => {
    if (res.rooms && res.rooms.length > 0) {
      const numbers = res.rooms
        .map((r) => r.roomNumber)
        .filter((n): n is string => !!n && n.trim() !== '');
      return Array.from(new Set(numbers));
    }
    return [];
  };

  // Build merged blocks per room row
  const blocksByRoom = useMemo(() => {
    const map = new Map<string, MergedBlock[]>();
    if (rooms.length === 0) return map;

    for (const room of rooms) {
      map.set(room.number, []);
    }

    for (const res of reservations) {
      if (!res.checkIn || !res.checkOut) continue;
      const statusKey = (res.status || '').toLowerCase();
      const statusMatch =
        selectedStatuses.has(res.status) || selectedStatuses.has(statusKey);
      if (!statusMatch) continue;

      let checkIn: Date, checkOut: Date;
      try {
        checkIn = parseISO(res.checkIn);
        checkOut = parseISO(res.checkOut);
      } catch {
        continue;
      }

      const roomNumbers = effectiveRoomNumbers(res);
      if (roomNumbers.length === 0) continue; // skip unassigned reservations in matrix

      // Find contiguous index range within dateRange that falls in [checkIn, checkOut)
      let startIndex = -1;
      let endIndex = -1;
      dateRange.forEach((day, idx) => {
        const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
        const ci = new Date(checkIn.getFullYear(), checkIn.getMonth(), checkIn.getDate());
        const co = new Date(checkOut.getFullYear(), checkOut.getMonth(), checkOut.getDate());
        if (dayStart >= ci && dayStart < co) {
          if (startIndex === -1) startIndex = idx;
          endIndex = idx;
        }
      });

      if (startIndex !== -1 && endIndex !== -1) {
        // Place a block on every assigned room row (group bookings span multiple rooms)
        for (const roomNumber of roomNumbers) {
          if (!map.has(roomNumber)) continue;
          map.get(roomNumber)!.push({
            reservation: res,
            startIndex,
            span: endIndex - startIndex + 1,
          });
        }
      }
    }

    // Sort each room's blocks by start index
    map.forEach((blocks) => blocks.sort((a, b) => a.startIndex - b.startIndex));
    return map;
  }, [rooms, reservations, dateRange, selectedStatuses]);

  const today = new Date();
  const colCount = dateRange.length;
  // First column is the room label, then one column per date
  const gridTemplate = `minmax(120px, 1.2fr) repeat(${colCount}, minmax(44px, 1fr))`;

  const getBlockClasses = (status: string): string => {
    const bg = blockBg[status] || blockBg[status.toLowerCase()] || 'bg-slate-500';
    const txt = blockText[status] || blockText[status.toLowerCase()] || 'text-white';
    return `${bg} ${txt}`;
  };

  const rangeLabel = useMemo(() => {
    if (dateRange.length === 0) return '';
    const first = dateRange[0];
    const last = dateRange[dateRange.length - 1];
    if (viewMode === 'day') return format(first, 'EEE, MMM d, yyyy');
    if (isSameMonth(first, last)) return `${format(first, 'MMMM yyyy')}`;
    return `${format(first, 'MMM d')} – ${format(last, 'MMM d, yyyy')}`;
  }, [dateRange, viewMode]);

  function isSameMonth(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  const occupiedRoomCount = useMemo(
    () => Array.from(blocksByRoom.values()).filter((b) => b.length > 0).length,
    [blocksByRoom]
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{rangeLabel}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {rooms.length} rooms • {occupiedRoomCount} occupied in range
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View mode selector */}
          <div className="flex items-center bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-700 rounded-lg p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {mode === 'day' && <Clock className="w-3 h-3" />}
                {mode === 'week' && <List className="w-3 h-3" />}
                {mode === 'month' && <Grid3x3 className="w-3 h-3" />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={goToday}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Today
            </button>
            <div className="flex items-center bg-gray-100 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-700">
              <button
                onClick={() => navigate('prev')}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('next')}
                className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status filter legend (clickable toggles) */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {LEGEND.map((s) => {
          const active =
            selectedStatuses.has(s.key) || selectedStatuses.has(s.key.toLowerCase());
          return (
            <button
              key={s.key}
              onClick={() => toggleStatus(s.key)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border transition-all ${
                active
                  ? 'border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200'
                  : 'border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-500 opacity-60'
              }`}
            >
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${blockBg[s.key] || 'bg-gray-400'}`}
              />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Matrix */}
      {rooms.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <CalendarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p>No rooms found. Add rooms to display the calendar matrix.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
          <div className="min-w-full">
            {/* Date header row */}
            <div
              className="grid border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 sticky top-0 z-10"
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 border-r border-gray-200 dark:border-slate-700">
                Room
              </div>
              {dateRange.map((day) => {
                const isToday = isSameDay(day, today);
                const inMonth = isSameMonth(day, calendarMonth);
                return (
                  <div
                    key={day.toISOString()}
                    className={`px-1 py-2 text-center border-r border-gray-200 dark:border-slate-700 last:border-r-0 ${
                      !inMonth ? 'bg-gray-100 dark:bg-slate-900/60' : ''
                    }`}
                  >
                    <div
                      className={`text-[10px] font-semibold uppercase ${
                        isToday
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {format(day, 'EEE')}
                    </div>
                    <div
                      className={`text-sm font-bold ${
                        isToday
                          ? 'text-white bg-blue-600 rounded-full w-6 h-6 flex items-center justify-center mx-auto'
                          : inMonth
                          ? 'text-gray-800 dark:text-gray-100'
                          : 'text-gray-400 dark:text-gray-600'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Room rows */}
            <div className="max-h-[600px] overflow-y-auto">
              {rooms.map((room) => {
                const blocks = blocksByRoom.get(room.number) || [];
                // Build a per-index lookup so we can walk columns in order
                const blockAtStart = new Map<number, MergedBlock>();
                const coveredBy = new Map<number, MergedBlock>();
                blocks.forEach((b) => {
                  blockAtStart.set(b.startIndex, b);
                  for (let i = 0; i < b.span; i++) {
                    coveredBy.set(b.startIndex + i, b);
                  }
                });

                return (
                  <div
                    key={room.number}
                    className="grid border-b border-gray-100 dark:border-slate-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-700/30"
                    style={{ gridTemplateColumns: gridTemplate }}
                  >
                    {/* Room label */}
                    <div className="px-3 py-2 border-r border-gray-200 dark:border-slate-700 flex flex-col justify-center min-w-0">
                      <div className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {room.number}
                      </div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {room.type}
                      </div>
                    </div>

                    {/* Date columns: render either an empty cell or a spanning block */}
                    {dateRange.map((day, idx) => {
                      // Skip indices covered by a block that started earlier
                      if (coveredBy.has(idx) && !blockAtStart.has(idx)) {
                        return null;
                      }

                      const block = blockAtStart.get(idx);
                      const isToday = isSameDay(day, today);
                      const inMonth = isSameMonth(day, calendarMonth);

                      if (block) {
                        const span = block.span;
                        return (
                          <div
                            key={day.toISOString()}
                            className="relative min-h-[44px] p-0.5"
                            style={{ gridColumn: `span ${span}` }}
                          >
                            <button
                              onClick={() => onReservationClick(block.reservation)}
                              title={`${block.reservation.guestName} • ${block.reservation.status} • ${block.reservation.checkIn} → ${block.reservation.checkOut}`}
                              className={`w-full h-full flex items-center px-2 text-[11px] font-semibold leading-tight rounded-md shadow-sm hover:opacity-90 transition-opacity truncate ${getBlockClasses(
                                block.reservation.status
                              )}`}
                            >
                              <span className="truncate">{block.reservation.guestName}</span>
                            </button>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={day.toISOString()}
                          className={`border-r border-gray-100 dark:border-slate-700 last:border-r-0 min-h-[44px] ${
                            !inMonth ? 'bg-gray-50 dark:bg-slate-900/40' : ''
                          } ${isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Empty state for reservations */}
      {rooms.length > 0 && reservations.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
          No reservations to display in this range.
        </div>
      )}
    </div>
  );
}
