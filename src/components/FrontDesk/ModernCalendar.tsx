/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Grid3x3,
  List,
  Clock,
  Filter,
  X,
  Users
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths, startOfWeek, startOfMonth, endOfWeek, endOfMonth, isSameDay, isWithinInterval } from 'date-fns';
import { Reservation, Room } from '../../types/erp';
import { toISODate } from '../../utils/date';

interface ModernCalendarProps {
  rooms: Room[];
  reservations: Reservation[];
  currentSystemDate: string;
  onReservationClick: (reservation: Reservation) => void;
  filterStatus?: string;
  selectedDate?: Date;
  onSelectedDateChange?: (date: Date) => void;
}

type ViewMode = 'day' | 'week' | 'month';

export default function ModernCalendar({
  rooms,
  reservations,
  currentSystemDate,
  onReservationClick,
  filterStatus: externalFilterStatus,
  selectedDate: externalSelectedDate,
  onSelectedDateChange,
}: ModernCalendarProps) {
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>('week');
  const [internalSelectedDate, setInternalSelectedDate] = useState(new Date(currentSystemDate));
  const [internalFilterStatus, setInternalFilterStatus] = useState<string>('all');

  const viewMode = internalViewMode;
  const selectedDate = externalSelectedDate ?? internalSelectedDate;
  const filterStatus = externalFilterStatus ?? internalFilterStatus;

  const setViewMode = setInternalViewMode;
  const setSelectedDate = (dateOrUpdater: Date | ((prev: Date) => Date)) => {
    if (typeof dateOrUpdater === 'function') {
      const updater = dateOrUpdater as (prev: Date) => Date;
      setInternalSelectedDate(prev => {
        const next = updater(prev);
        onSelectedDateChange?.(next);
        return next;
      });
    } else {
      setInternalSelectedDate(dateOrUpdater);
      onSelectedDateChange?.(dateOrUpdater);
    }
  };
  const setFilterStatus = (status: string) => {
    setInternalFilterStatus(status);
  };

  // Distribute unassigned reservations (group bookings without specific rooms) across
  // available rooms of the same type so they all appear in the calendar grid
  const unassignedRoomMap = useMemo(() => {
    const map = new Map<string, string>();
    const roomsByType = new Map<string, Room[]>();

    rooms.forEach(room => {
      if (!roomsByType.has(room.type)) roomsByType.set(room.type, []);
      roomsByType.get(room.type)!.push(room);
    });

    roomsByType.forEach((typeRooms, type) => {
      const unassigned = reservations.filter(res =>
        !res.roomNumber && res.roomType === type && res.status !== 'CheckedOut'
      );
      unassigned.forEach((res, idx) => {
        const room = typeRooms[idx % typeRooms.length];
        if (room) map.set(res.id, room.number);
      });
    });

    return map;
  }, [rooms, reservations]);

  // Generate date range based on view mode
  const dateRange = useMemo(() => {
    const dates: Date[] = [];
    
    if (viewMode === 'day') {
      dates.push(selectedDate);
    } else if (viewMode === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      for (let i = 0; i < 7; i++) {
        dates.push(addDays(start, i));
      }
    } else if (viewMode === 'month') {
      const start = startOfMonth(selectedDate);
      const end = endOfMonth(selectedDate);
      let current = startOfWeek(start, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(end, { weekStartsOn: 0 });
      
      while (current <= weekEnd) {
        dates.push(current);
        current = addDays(current, 1);
      }
    }
    
    return dates;
  }, [viewMode, selectedDate]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setSelectedDate(prev => 
        viewMode === 'day' ? addDays(prev, -1) :
        viewMode === 'week' ? addWeeks(prev, -1) :
        addMonths(prev, -1)
      );
    } else {
      setSelectedDate(prev => 
        viewMode === 'day' ? addDays(prev, 1) :
        viewMode === 'week' ? addWeeks(prev, 1) :
        addMonths(prev, 1)
      );
    }
  };

  const resetToToday = () => {
    setSelectedDate(new Date(currentSystemDate));
  };

  const getReservationForRoomAndDate = (room: Room, date: Date) => {
    const dateStr = toISODate(date);
    return reservations.find(res => {
      const effectiveRoomNumber = res.roomNumber || unassignedRoomMap.get(res.id);
      if (effectiveRoomNumber !== room.number) return false;
      if (res.status === 'CheckedOut') return false;
      if (filterStatus !== 'all' && res.status !== filterStatus) return false;
      return dateStr >= res.checkInDate && dateStr < res.checkOutDate;
    });
  };

  // Get merged cell information for a room - returns array of reservation blocks with their spans
  const getMergedReservationsForRoom = (room: Room) => {
    const mergedBlocks: Array<{
      reservation: Reservation;
      startIndex: number;
      span: number;
    }> = [];

    const roomReservations = reservations.filter(res => {
      const effectiveRoomNumber = res.roomNumber || unassignedRoomMap.get(res.id);
      if (effectiveRoomNumber !== room.number) return false;
      if (res.status === 'CheckedOut') return false;
      if (filterStatus !== 'all' && res.status !== filterStatus) return false;
      return true;
    });

    // For each reservation, find its coverage in the date range
    roomReservations.forEach(res => {
      // Find the start and end indices in the date range
      let startIndex = -1;
      let endIndex = -1;
      
      dateRange.forEach((date, idx) => {
        const dateStr = toISODate(date);
        if (dateStr >= res.checkInDate && dateStr < res.checkOutDate) {
          if (startIndex === -1) startIndex = idx;
          endIndex = idx;
        }
      });

      if (startIndex !== -1 && endIndex !== -1) {
        mergedBlocks.push({
          reservation: res,
          startIndex,
          span: endIndex - startIndex + 1
        });
      }
    });

    // Sort by start index
    return mergedBlocks.sort((a, b) => a.startIndex - b.startIndex);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CheckedIn':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-800';
      case 'Confirmed':
        return 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-300 text-sky-800';
      case 'Waitlisted':
        return 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-amber-800';
      case 'Cancelled':
        return 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-300 text-rose-800';
      default:
        return 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 text-slate-700';
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'CheckedIn':
        return 'bg-emerald-500';
      case 'Confirmed':
        return 'bg-sky-500';
      case 'Waitlisted':
        return 'bg-amber-500';
      case 'Cancelled':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  // Group booking visual identifier helpers
  const getGroupId = (res: Reservation): string | undefined => {
    return res.groupBookingId || res.bookingGroupId || res.groupId || undefined;
  };

  const groupColorPalette = [
    { border: 'border-l-indigo-400', text: 'text-indigo-700', bg: 'bg-indigo-50' },
    { border: 'border-l-violet-400', text: 'text-violet-700', bg: 'bg-violet-50' },
    { border: 'border-l-fuchsia-400', text: 'text-fuchsia-700', bg: 'bg-fuchsia-50' },
    { border: 'border-l-pink-400', text: 'text-pink-700', bg: 'bg-pink-50' },
    { border: 'border-l-rose-400', text: 'text-rose-700', bg: 'bg-rose-50' },
    { border: 'border-l-orange-400', text: 'text-orange-700', bg: 'bg-orange-50' },
    { border: 'border-l-teal-400', text: 'text-teal-700', bg: 'bg-teal-50' },
    { border: 'border-l-cyan-400', text: 'text-cyan-700', bg: 'bg-cyan-50' },
  ];

  const getGroupStyle = (groupId: string) => {
    let hash = 0;
    for (let i = 0; i < groupId.length; i++) {
      hash = ((hash << 5) - hash) + groupId.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % groupColorPalette.length;
    return groupColorPalette[idx];
  };

  const formatGroupLabel = (groupId: string) => {
    const parts = groupId.split('-');
    return parts.length > 1 ? parts.slice(1).join('-') : groupId.slice(0, 8);
  };

  const gridCols = viewMode === 'day' ? 'grid-cols-2' : viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-8';

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-lg space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-sans font-black text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarIcon className="text-amber-500" size={20} />
            Rooms Outlook Timeline
          </h3>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Visual matrix of room reservations across {viewMode} view
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Selector */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold font-sans transition-all duration-200 flex items-center gap-1.5 ${
                  viewMode === mode
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
              >
                {mode === 'day' && <Clock size={12} />}
                {mode === 'week' && <List size={12} />}
                {mode === 'month' && <Grid3x3 size={12} />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => navigateDate('prev')}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition"
              title="Previous"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={resetToToday}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 rounded-lg text-slate-800 font-bold text-xs transition shadow-sm"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-slate-900 transition"
              title="Next"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Date Display */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl px-4 py-2">
            <CalendarIcon size={14} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-900 font-sans">
              {format(selectedDate, viewMode === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-500 uppercase">Filter:</span>
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'CheckedIn', 'Confirmed', 'Waitlisted', 'Cancelled'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase transition-all duration-200 flex items-center gap-1.5 ${
                filterStatus === status
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${status === 'all' ? 'bg-slate-400' : getStatusDot(status)}`} />
              {status === 'all' ? 'All' : status.replace(/([A-Z])/g, ' $1').trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className={`grid ${gridCols} border-b-2 border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-2xl`}>
            <div className="py-3 px-4 font-bold text-xs font-mono uppercase text-slate-600 border-r border-slate-200">
              Room
            </div>
            {dateRange.map((date, idx) => {
              const isToday = isSameDay(date, new Date(currentSystemDate));
              const isCurrentMonth = viewMode === 'month' && date.getMonth() === selectedDate.getMonth();
              
              return (
                <div
                  key={idx}
                  className={`py-3 px-2 text-center border-r border-slate-200 last:border-r-0 ${
                    isToday ? 'bg-amber-100' : ''
                  } ${!isCurrentMonth && viewMode === 'month' ? 'opacity-50' : ''}`}
                >
                  <div className="text-xs font-bold font-sans text-slate-700">
                    {format(date, 'EEE')}
                  </div>
                  <div className={`text-sm font-black font-sans ${isToday ? 'text-amber-600' : 'text-slate-900'}`}>
                    {format(date, 'd')}
                  </div>
                  {viewMode === 'month' && (
                    <div className="text-[9px] text-slate-400 font-mono uppercase">
                      {format(date, 'MMM')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Room Rows */}
          <div className="divide-y divide-slate-100">
            {rooms.map((room) => {
              const mergedBlocks = getMergedReservationsForRoom(room);
              const coveredIndices = new Set<number>();
              
              mergedBlocks.forEach(block => {
                for (let i = block.startIndex; i < block.startIndex + block.span; i++) {
                  coveredIndices.add(i);
                }
              });

              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`grid ${gridCols} hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all duration-200`}
                >
                  {/* Room Info */}
                  <div className="py-3 px-4 border-r border-slate-200 bg-slate-50/50 flex flex-col justify-center">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 font-bold text-xs">
                        {room.number}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800 font-sans">{room.type}</div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase">{room.status}</div>
                      </div>
                    </div>
                  </div>

                  {/* Date Cells with Merged Support */}
                  {dateRange.map((date, idx) => {
                    // Skip if this index is covered by a merged block (but not the start)
                    if (coveredIndices.has(idx) && !mergedBlocks.some(b => b.startIndex === idx)) {
                      return null;
                    }

                    const isToday = isSameDay(date, new Date(currentSystemDate));
                    const mergedBlock = mergedBlocks.find(b => b.startIndex === idx);
                    
                    if (mergedBlock) {
                      // Render merged cell
                      const reservation = mergedBlock.reservation;
                      return (
                        <div
                          key={idx}
                          style={{ gridColumn: `span ${mergedBlock.span}` }}
                          className={`border-r border-slate-100 last:border-r-0 min-h-[60px] p-1.5 flex items-center justify-center ${
                            isToday ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onReservationClick(reservation)}
                            className={`w-full h-full border rounded-xl p-2 cursor-pointer shadow-sm transition-all duration-200 ${getStatusColor(reservation.status)} ${(() => {
                              const gid = getGroupId(reservation);
                              return gid ? `border-l-4 ${getGroupStyle(gid).border}` : '';
                            })()}`}
                            title={`${reservation.guestName} - ${reservation.status} (${mergedBlock.span} nights)`}
                          >
                            {(() => {
                              const gid = getGroupId(reservation);
                              const groupStyle = gid ? getGroupStyle(gid) : null;
                              return (
                                <>
                                  {gid && groupStyle && (
                                    <div className={`flex items-center gap-1 mb-1 px-1 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${groupStyle.bg} ${groupStyle.text} w-fit`}>
                                      <Users size={8} />
                                      <span>GRP-{formatGroupLabel(gid)}</span>
                                    </div>
                                  )}
                                  <div className="font-bold text-[11px] truncate font-sans leading-tight">
                                    {reservation.guestName}
                                  </div>
                                  <div className="text-[9px] font-mono uppercase tracking-wider opacity-80 mt-0.5">
                                    {reservation.status}
                                  </div>
                                  <div className="text-[9px] font-sans mt-1 opacity-70">
                                    {mergedBlock.span} night{mergedBlock.span > 1 ? 's' : ''}
                                  </div>
                                </>
                              );
                            })()}
                          </motion.div>
                        </div>
                      );
                    }

                    // Render vacant cell
                    return (
                      <div
                        key={idx}
                        className={`border-r border-slate-100 last:border-r-0 min-h-[60px] p-1.5 flex items-center justify-center ${
                          isToday ? 'bg-amber-50/30' : ''
                        }`}
                      >
                        <div className="w-full h-full border border-slate-100 rounded-lg bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 flex items-center justify-center">
                          <div className="text-[9px] font-mono text-emerald-400/60 uppercase tracking-wider">
                            Vacant
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">Status Legend:</span>
        {([
          { status: 'CheckedIn', color: 'bg-emerald-500', label: 'Checked In' },
          { status: 'Confirmed', color: 'bg-sky-500', label: 'Confirmed' },
          { status: 'Waitlisted', color: 'bg-amber-500', label: 'Waitlisted' },
          { status: 'Cancelled', color: 'bg-rose-500', label: 'Cancelled' },
        ]).map((item) => (
          <div key={item.status} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-[10px] font-mono text-slate-500 uppercase">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
