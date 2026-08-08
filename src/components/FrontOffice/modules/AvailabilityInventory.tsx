/**
 * Front Office Availability & Inventory Module
 * Room inventory management and availability views
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Grid3x3,
  AlertTriangle,
  TrendingUp,
  Filter,
  Settings,
  Lock,
  Unlock,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { FO_STAT_GRADIENTS } from '../brandTheme';

type RoomStatus = 'available' | 'occupied' | 'house-use' | 'out-of-order' | 'out-of-service' | 'blocked';
type ViewType = 'daily' | 'weekly' | 'monthly' | 'occupancy' | 'forecast';

interface RoomType {
  id: string;
  name: string;
  totalRooms: number;
  available: number;
  occupied: number;
  houseUse: number;
  outOfOrder: number;
  baseRate: number;
  description?: string;
  maxOccupancy?: number;
}

interface PhysicalRoom {
  id: string;
  number: string;
  type: string;
  floor: number;
  status: string;
  rate?: number;
  features?: string[];
  currentGuest?: string;
  checkIn?: string;
  checkOut?: string;
}

const AvailabilityInventory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as ViewType) || 'daily';
  const setActiveView = (v: ViewType) => {
    const next = new URLSearchParams(searchParams);
    next.set('view', v);
    setSearchParams(next);
  };
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<PhysicalRoom[]>([]);
  const [allReservations, setAllReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Room selection state (multi-select for batch inventory actions)
  const [selectedRoomIds, setSelectedRoomIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Date-range block state
  const [useDateRange, setUseDateRange] = useState(false);
  const [blockStartDate, setBlockStartDate] = useState('');
  const [blockEndDate, setBlockEndDate] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [roomBlocks, setRoomBlocks] = useState<any[]>([]);
  const [showBlocksList, setShowBlocksList] = useState(false);

  // Filter state
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [filterRoomType, setFilterRoomType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterFloor, setFilterFloor] = useState<string>('all');

  // Settings state (persisted to global_settings via /api/settings)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);
  const [overbookingLimit, setOverbookingLimit] = useState(10);
  const [sellLimit, setSellLimit] = useState(95);
  const [groupBlockAllocation, setGroupBlockAllocation] = useState(20);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  
  // Weekly calendar state
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  });
  
  // Monthly calendar state
  const [monthStart, setMonthStart] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    firstDay.setHours(0, 0, 0, 0);
    return firstDay;
  });
  
  // Occupancy analytics state
  const [occupancyPeriod, setOccupancyPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  
  // Forecast state
  const [forecastPeriod, setForecastPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Fetch room types and calculate availability
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch room types
        const { data: roomTypesData, error: roomTypesError } = await supabase
          .from('room_types')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (roomTypesError) throw roomTypesError;

        // Fetch rooms
        const { data: roomsData, error: roomsError } = await supabase
          .from('rooms')
          .select('*')
          .order('floor', { ascending: true });

        if (roomsError) throw roomsError;

        // Fetch current reservations overlapping today for occupancy calculation.
        // Use AND logic: check_in_date <= today AND check_out_date > today
        // (the previous .or() was far too broad — it matched any reservation
        // that either started before today OR ended after today).
        const today = new Date().toISOString().split('T')[0];
        const { data: reservationsData, error: reservationsError } = await supabase
          .from('reservations')
          .select('id, room_type, room_type_id, room_number, guest_name, check_in_date, check_out_date, status')
          .in('status', ['Confirmed', 'CheckedIn'])
          .lte('check_in_date', today)
          .gt('check_out_date', today);

        if (reservationsError) throw reservationsError;

        // Fetch all active reservations for weekly calendar (Confirmed + CheckedIn)
        const { data: allReservationsData, error: allReservationsError } = await supabase
          .from('reservations')
          .select('id, room_type, room_type_id, room_number, guest_name, check_in_date, check_out_date, status')
          .in('status', ['Confirmed', 'CheckedIn']);

        if (allReservationsError) throw allReservationsError;

        // Fetch all room blocks (date-range status overrides)
        const { data: roomBlocksData, error: roomBlocksError } = await supabase
          .from('room_blocks')
          .select('*')
          .order('created_at', { ascending: false });

        if (roomBlocksError) throw roomBlocksError;
        setRoomBlocks(roomBlocksData || []);

        // Index current reservations by room_number for quick lookup
        const reservationByRoomNumber = new Map<string, any>();
        for (const r of reservationsData || []) {
          if (r.room_number) reservationByRoomNumber.set(r.room_number, r);
        }

        // Calculate availability for each room type.
        // Join via the canonical room_type_id foreign key (rooms.type is
        // deprecated per migration 106). Falls back to name matching only
        // for legacy rows that may still lack room_type_id.
        const roomTypesWithAvailability = (roomTypesData || []).map((rt: any) => {
          const typeRooms = roomsData?.filter((r: any) =>
            r.room_type_id === rt.id || r.type === rt.name
          ) || [];
          const totalRooms = typeRooms.length;

          // Count rooms that are physically occupied (DB status) OR have an
          // active reservation overlapping today (Confirmed/CheckedIn).
          const occupied = typeRooms.filter((r: any) => {
            if (r.status === 'Occupied Clean' || r.status === 'Occupied Dirty') return true;
            const res = reservationByRoomNumber.get(r.number);
            return !!res;
          }).length;
          const outOfOrder = typeRooms.filter((r: any) => r.status === 'Out of Order').length;
          const outOfService = typeRooms.filter((r: any) => r.status === 'Out of Service' || r.status === 'Maintenance').length;
          const houseUse = typeRooms.filter((r: any) => r.status === 'House Use').length || 0;
          const blocked = typeRooms.filter((r: any) => r.status === 'Blocked').length || 0;
          const available = totalRooms - occupied - outOfOrder - outOfService - houseUse - blocked;

          return {
            id: rt.id,
            name: rt.name,
            totalRooms,
            available: Math.max(0, available),
            occupied,
            houseUse,
            outOfOrder,
            baseRate: rt.base_price || 0,
            description: rt.description,
            maxOccupancy: rt.max_occupancy,
          };
        });

        // Map rooms with current guest information from reservations.
        // A room shows as "occupied" if either:
        //   (a) the DB status is Occupied Clean/Dirty, or
        //   (b) there is an active Confirmed/CheckedIn reservation overlapping
        //       today for that room number — even if the DB status is still
        //       "Vacant Clean" (housekeeping may not have flipped it yet).
        const roomsWithGuests = (roomsData || []).map((room: any) => {
          const currentReservation = reservationByRoomNumber.get(room.number);
          const dbStatus = mapRoomStatus(room.status);
          const hasActiveReservation = !!currentReservation;

          // Override to occupied if there's an active reservation, unless the
          // room is explicitly Out of Order / Out of Service / Blocked (those
          // physical statuses take precedence over a reservation).
          const isPhysicallyUnavailable =
            dbStatus === 'out-of-order' || dbStatus === 'out-of-service' || dbStatus === 'blocked';
          const effectiveStatus = hasActiveReservation && !isPhysicallyUnavailable
            ? 'occupied' as RoomStatus
            : dbStatus;

          return {
            id: room.id,
            number: room.number,
            type: room.type,
            floor: room.floor,
            status: effectiveStatus,
            rate: room.rate,
            features: room.features || [],
            currentGuest: currentReservation?.guest_name,
            checkIn: currentReservation?.check_in_date,
            checkOut: currentReservation?.check_out_date,
          };
        });

        setRoomTypes(roomTypesWithAvailability);
        setRooms(roomsWithGuests);
        setAllReservations(allReservationsData || []);
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load room data');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomData();
  }, []);

  // Map database room status to UI status
  const mapRoomStatus = (dbStatus: string): RoomStatus => {
    const statusMap: Record<string, RoomStatus> = {
      'Vacant Clean': 'available',
      'Vacant Dirty': 'available',
      'Occupied Clean': 'occupied',
      'Occupied Dirty': 'occupied',
      'Out of Order': 'out-of-order',
      'Out of Service': 'out-of-service',
      'Maintenance': 'out-of-service',
      'House Use': 'house-use',
      'Blocked': 'blocked',
    };
    return statusMap[dbStatus] || 'available';
  };

  // Map UI status back to database room status for persistence
  const uiStatusToDbStatus = (uiStatus: string): string => {
    const map: Record<string, string> = {
      'available': 'Vacant Clean',
      'occupied': 'Occupied Clean',
      'house-use': 'House Use',
      'out-of-order': 'Out of Order',
      'out-of-service': 'Out of Service',
      'blocked': 'Blocked',
    };
    return map[uiStatus] || 'Vacant Clean';
  };

  // Load inventory settings from the database
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/settings', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const s = data.settings;
          if (s) {
            // GET /api/settings returns snake_case keys (raw DB row);
            // PATCH /api/admin/settings returns camelCase. Handle both.
            const ob = s.overbookingLimit ?? s.overbooking_limit;
            const sl = s.sellLimit ?? s.sell_limit;
            const gba = s.groupBlockAllocation ?? s.group_block_allocation;
            if (ob != null) setOverbookingLimit(ob);
            if (sl != null) setSellLimit(sl);
            if (gba != null) setGroupBlockAllocation(gba);
          }
        }
      } catch (e) {
        console.error('Failed to load inventory settings:', e);
      }
    };
    loadSettings();
  }, []);

  // Save inventory settings to the database
  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          overbookingLimit,
          sellLimit,
          groupBlockAllocation,
        }),
      });
      if (res.ok) {
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save inventory settings:', e);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Toggle room selection for batch actions
  const handleRoomClick = (roomId: string) => {
    setSelectedRoomIds(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  // Apply an inventory action (block/unblock/ooo/oos/available) to all selected rooms.
  // If useDateRange is true and dates are set, creates room_blocks entries;
  // otherwise updates the room's point-in-time status directly.
  const handleInventoryAction = async (actionId: string) => {
    if (selectedRoomIds.size === 0) {
      setActionMessage('Select at least one room first.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const dbStatus = (() => {
      switch (actionId) {
        case 'block': return 'Blocked';
        case 'unblock': return 'Vacant Clean';
        case 'ooo': return 'Out of Order';
        case 'oos': return 'Out of Service';
        case 'available': return 'Vacant Clean';
        default: return null;
      }
    })();

    if (!dbStatus) return;

    // Date-range mode: only valid for blocking statuses (not unblock/available)
    const isBlockAction = actionId === 'block' || actionId === 'ooo' || actionId === 'oos';
    if (useDateRange && isBlockAction) {
      if (!blockStartDate || !blockEndDate) {
        setActionMessage('Please select both start and end dates.');
        setTimeout(() => setActionMessage(null), 3000);
        return;
      }
      if (blockEndDate < blockStartDate) {
        setActionMessage('End date must be on or after start date.');
        setTimeout(() => setActionMessage(null), 3000);
        return;
      }

      setActionLoading(true);
      setActionMessage(`Creating ${dbStatus} blocks for ${selectedRoomIds.size} room(s) from ${blockStartDate} to ${blockEndDate}...`);

      const selectedRooms = rooms.filter(r => selectedRoomIds.has(r.id));
      const results = await Promise.allSettled(
        selectedRooms.map(room =>
          fetch('/api/front-office/room-blocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              room_id: room.id,
              room_number: room.number,
              status: dbStatus,
              start_date: blockStartDate,
              end_date: blockEndDate,
              reason: blockReason || undefined,
            }),
          })
        )
      );

      const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
      const failed = results.length - succeeded;

      // Refresh room blocks from the server
      if (succeeded > 0) {
        try {
          const blocksRes = await fetch('/api/front-office/room-blocks', { credentials: 'include' });
          if (blocksRes.ok) {
            const blocksData = await blocksRes.json();
            setRoomBlocks(blocksData.blocks || []);
          }
        } catch (e) {
          console.error('Failed to refresh room blocks:', e);
        }
      }

      setActionMessage(
        failed === 0
          ? `Successfully created ${succeeded} room block(s) for ${blockStartDate} to ${blockEndDate}.`
          : `Created ${succeeded} block(s), ${failed} failed.`
      );
      setSelectedRoomIds(new Set());
      setTimeout(() => setActionMessage(null), 5000);
      setActionLoading(false);
      return;
    }

    // Point-in-time mode: update rooms.status directly
    setActionLoading(true);
    setActionMessage(`Updating ${selectedRoomIds.size} room(s) to "${dbStatus}"...`);

    const roomIds = Array.from(selectedRoomIds);
    const results = await Promise.allSettled(
      roomIds.map(id =>
        fetch(`/api/front-office/rooms/${id}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ status: dbStatus }),
        })
      )
    );

    const succeeded = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;
    const failed = results.length - succeeded;

    // Update local state so the UI reflects the change immediately
    if (succeeded > 0) {
      setRooms(prev => prev.map(r =>
        selectedRoomIds.has(r.id)
          ? { ...r, status: mapRoomStatus(dbStatus) }
          : r
      ));
    }

    setActionMessage(
      failed === 0
        ? `Successfully updated ${succeeded} room(s).`
        : `Updated ${succeeded} room(s), ${failed} failed.`
    );
    setSelectedRoomIds(new Set());
    setTimeout(() => setActionMessage(null), 4000);
    setActionLoading(false);
  };

  // Delete a room block
  const handleDeleteBlock = async (blockId: string) => {
    try {
      const res = await fetch(`/api/front-office/room-blocks/${blockId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.ok) {
        setRoomBlocks(prev => prev.filter(b => b.id !== blockId));
      }
    } catch (e) {
      console.error('Failed to delete room block:', e);
    }
  };

  // Filter rooms based on current filter criteria
  const filteredRooms = rooms.filter(room => {
    const matchesRoomType = filterRoomType === 'all' || room.type === filterRoomType;
    const matchesStatus = filterStatus === 'all' || room.status === filterStatus;
    const matchesFloor = filterFloor === 'all' || room.floor.toString() === filterFloor;
    return matchesRoomType && matchesStatus && matchesFloor;
  }).sort((a, b) => {
    // Sort by floor ascending, then by room number numerically so that
    // "01" < "02" < "10" < "100" instead of lexicographic "01" < "100" < "10".
    if (a.floor !== b.floor) return a.floor - b.floor;
    const aIsNum = /^\d+$/.test(a.number.trim());
    const bIsNum = /^\d+$/.test(b.number.trim());
    if (aIsNum && bIsNum) return parseInt(a.number, 10) - parseInt(b.number, 10);
    if (aIsNum) return -1;
    if (bIsNum) return 1;
    return a.number.localeCompare(b.number, undefined, { numeric: true });
  });

  // Get unique floors from rooms
  const availableFloors = Array.from(new Set(rooms.map(r => r.floor.toString()))).sort();

  // Calculate week dates
  const getWeekDates = (startDate: Date) => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates(weekStart);

  // Check room availability for a specific date
  const getRoomAvailabilityForDate = (room: PhysicalRoom, date: Date, allReservations: any[]) => {
    const dateStr = date.toISOString().split('T')[0];

    // 1. Check room_blocks (date-range overrides) — these take precedence
    const block = roomBlocks.find(
      (b: any) => b.room_number === room.number &&
      dateStr >= b.start_date &&
      dateStr <= b.end_date
    );
    if (block) {
      return mapRoomStatus(block.status);
    }

    // 2. Check if room has an active reservation for this date (Confirmed or CheckedIn)
    const hasReservation = allReservations.some(
      (res: any) => res.room_number === room.number &&
      (res.status === 'Confirmed' || res.status === 'CheckedIn') &&
      dateStr >= res.check_in_date &&
      dateStr < res.check_out_date
    );

    if (hasReservation) {
      return 'occupied';
    }

    // 3. Check current room physical status
    if (room.status === 'out-of-order') return 'out-of-order';
    if (room.status === 'out-of-service') return 'out-of-service';
    if (room.status === 'blocked') return 'blocked';
    if (room.status === 'house-use') return 'house-use';

    return 'available';
  };

  // Navigate weeks
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeekStart = new Date(weekStart);
    newWeekStart.setDate(newWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setWeekStart(newWeekStart);
  };

  // Calculate month dates
  const getMonthDates = (startDate: Date) => {
    const dates = [];
    const year = startDate.getFullYear();
    const month = startDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push(date);
    }
    return dates;
  };

  const monthDates = getMonthDates(monthStart);

  // Navigate months
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonthStart = new Date(monthStart);
    newMonthStart.setMonth(newMonthStart.getMonth() + (direction === 'next' ? 1 : -1));
    setMonthStart(newMonthStart);
  };

  // Calculate occupancy analytics
  const calculateOccupancyData = () => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    let labels: string[] = [];
    
    switch (occupancyPeriod) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        }
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 3);
        endDate = today;
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - (i * 7));
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
      case 'month':
      default:
        startDate = new Date(today);
        startDate.setMonth(today.getMonth() - 1);
        endDate = today;
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
    }

    // Calculate occupancy for each day
    const occupancyData = labels.map((label, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (labels.length - 1 - index));
      const dateStr = date.toISOString().split('T')[0];
      
      // Count occupied rooms for this date
      const occupiedCount = allReservations.filter((res: any) => 
        res.status === 'Confirmed' &&
        dateStr >= res.check_in_date && 
        dateStr < res.check_out_date
      ).length;
      
      const totalRooms = rooms.length;
      const occupancyRate = totalRooms > 0 ? (occupiedCount / totalRooms) * 100 : 0;
      
      return {
        label,
        occupied: occupiedCount,
        total: totalRooms,
        rate: occupancyRate
      };
    });

    // Calculate room type breakdown
    const roomTypeBreakdown = roomTypes.map(rt => ({
      name: rt.name,
      total: rt.totalRooms,
      occupied: rt.occupied,
      available: rt.available,
      occupancyRate: rt.totalRooms > 0 ? (rt.occupied / rt.totalRooms) * 100 : 0
    }));

    return {
      labels,
      occupancyData,
      roomTypeBreakdown,
      averageOccupancy: occupancyData.reduce((sum, day) => sum + day.rate, 0) / occupancyData.length,
      peakOccupancy: Math.max(...occupancyData.map(d => d.rate)),
      lowestOccupancy: Math.min(...occupancyData.map(d => d.rate))
    };
  };

  const occupancyAnalytics = calculateOccupancyData();

  // Calculate forecast data
  const calculateForecastData = () => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
    let labels: string[] = [];
    
    switch (forecastPeriod) {
      case 'week':
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setDate(today.getDate() + 7);
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
        }
        break;
      case 'quarter':
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 3);
        for (let i = 0; i < 12; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + (i * 7));
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
      case 'month':
      default:
        startDate = new Date(today);
        endDate = new Date(today);
        endDate.setMonth(today.getMonth() + 1);
        for (let i = 0; i < 30; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        break;
    }

    // Simple forecast based on historical patterns
    const forecastData = labels.map((label, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      // Base forecast on current occupancy with some variation
      const currentOccupancyRate = occupancyAnalytics.averageOccupancy;
      const dayOfWeek = date.getDay();
      
      // Weekend adjustment
      let weekendAdjustment = 0;
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendAdjustment = 10; // Higher occupancy on weekends
      }
      
      // Seasonal adjustment (simplified)
      const month = date.getMonth();
      let seasonalAdjustment = 0;
      if (month >= 5 && month <= 7) {
        seasonalAdjustment = 15; // Summer peak
      } else if (month >= 11 || month <= 1) {
        seasonalAdjustment = 10; // Holiday season
      }
      
      // Random variation for realism
      const randomVariation = (Math.random() - 0.5) * 10;
      
      const forecastRate = Math.min(100, Math.max(0, 
        currentOccupancyRate + weekendAdjustment + seasonalAdjustment + randomVariation
      ));
      
      const forecastOccupied = Math.round((forecastRate / 100) * rooms.length);
      const forecastRevenue = forecastOccupied * 150; // Average rate assumption
      
      return {
        label,
        date: dateStr,
        forecastRate,
        forecastOccupied,
        forecastRevenue,
        confidence: Math.max(70, 95 - (index * 2)) // Decreasing confidence over time
      };
    });

    // Calculate totals
    const totalForecastRevenue = forecastData.reduce((sum, day) => sum + day.forecastRevenue, 0);
    const averageForecastRate = forecastData.reduce((sum, day) => sum + day.forecastRate, 0) / forecastData.length;

    return {
      labels,
      forecastData,
      totalForecastRevenue,
      averageForecastRate,
      peakForecastDay: forecastData.reduce((max, day) => day.forecastRate > max.forecastRate ? day : max, forecastData[0]),
      lowForecastDay: forecastData.reduce((min, day) => day.forecastRate < min.forecastRate ? day : min, forecastData[0])
    };
  };

  const forecastAnalytics = calculateForecastData();

  // Refresh data function
  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Re-fetch all data (same logic as in useEffect)
      const { data: roomTypesData, error: roomTypesError } = await supabase
        .from('room_types')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (roomTypesError) throw roomTypesError;

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('floor', { ascending: true });

      if (roomsError) throw roomsError;

      const today = new Date().toISOString().split('T')[0];
      const { data: reservationsData, error: reservationsError } = await supabase
        .from('reservations')
        .select('room_type, room_number, guest_name, check_in_date, check_out_date, status')
        .in('status', ['Confirmed', 'CheckedIn'])
        .or(`check_in_date.lte.${today},check_out_date.gt.${today}`);

      if (reservationsError) throw reservationsError;

      const { data: allReservationsData, error: allReservationsError } = await supabase
        .from('reservations')
        .select('room_type, room_number, guest_name, check_in_date, check_out_date, status')
        .eq('status', 'Confirmed');

      if (allReservationsError) throw allReservationsError;

      const roomTypesWithAvailability = (roomTypesData || []).map((rt: any) => {
        const typeRooms = roomsData?.filter((r: any) =>
          r.room_type_id === rt.id || r.type === rt.name
        ) || [];
        const totalRooms = typeRooms.length;
        const occupied = typeRooms.filter((r: any) => r.status === 'Occupied Clean' || r.status === 'Occupied Dirty').length;
        const outOfOrder = typeRooms.filter((r: any) => r.status === 'Out of Order').length;
        const houseUse = typeRooms.filter((r: any) => r.status === 'House Use').length || 0;
        const available = totalRooms - occupied - outOfOrder - houseUse;

        return {
          id: rt.id,
          name: rt.name,
          totalRooms,
          available: Math.max(0, available),
          occupied,
          houseUse,
          outOfOrder,
          baseRate: rt.base_price || 0,
          description: rt.description,
          maxOccupancy: rt.max_occupancy,
        };
      });

      const roomsWithGuests = (roomsData || []).map((room: any) => {
        const currentReservation = reservationsData?.find(
          (r: any) => r.room_number === room.number && r.status === 'CheckedIn'
        );

        return {
          id: room.id,
          number: room.number,
          type: room.type,
          floor: room.floor,
          status: mapRoomStatus(room.status),
          rate: room.rate,
          features: room.features || [],
          currentGuest: currentReservation?.guest_name,
          checkIn: currentReservation?.check_in_date,
          checkOut: currentReservation?.check_out_date,
        };
      });

      setRoomTypes(roomTypesWithAvailability);
      setRooms(roomsWithGuests);
      setAllReservations(allReservationsData || []);
    } catch (err) {
      console.error('Error refreshing room data:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh room data');
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700',
    occupied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    'house-use': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700',
    'out-of-order': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
    'out-of-service': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    blocked: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300 dark:border-gray-700',
  };

  const views = [
    { id: 'daily', label: 'Daily Grid', icon: Grid3x3 },
    { id: 'weekly', label: 'Weekly Calendar', icon: Calendar },
    { id: 'monthly', label: 'Monthly Calendar', icon: Calendar },
    { id: 'occupancy', label: 'Occupancy Calendar', icon: TrendingUp },
    { id: 'forecast', label: 'Forecast Calendar', icon: TrendingUp },
  ];

  const inventoryActions = [
    { id: 'block', label: 'Block Room', icon: Lock },
    { id: 'unblock', label: 'Unblock Room', icon: Unlock },
    { id: 'ooo', label: 'Mark Out of Order', icon: XCircle },
    { id: 'oos', label: 'Mark Out of Service', icon: AlertTriangle },
    { id: 'available', label: 'Make Available', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Availability & Inventory</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Room inventory and availability management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilterPanel 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showSettingsPanel 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' 
                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
            onClick={() => setShowSettingsPanel(!showSettingsPanel)}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filter Rooms</h3>
            <button 
              onClick={() => setShowFilterPanel(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Room Type
              </label>
              <div className="relative">
                <select
                  value={filterRoomType}
                  onChange={(e) => setFilterRoomType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Room Types</option>
                  {roomTypes.map(rt => (
                    <option key={rt.id} value={rt.name}>{rt.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="out-of-order">Out of Order</option>
                  <option value="out-of-service">Out of Service</option>
                  <option value="house-use">House Use</option>
                  <option value="blocked">Blocked</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Floor
              </label>
              <div className="relative">
                <select
                  value={filterFloor}
                  onChange={(e) => setFilterFloor(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="all">All Floors</option>
                  {availableFloors.map(floor => (
                    <option key={floor} value={floor}>Floor {floor}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button 
              onClick={() => {
                setFilterRoomType('all');
                setFilterStatus('all');
                setFilterFloor('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Clear Filters
            </button>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </div>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettingsPanel && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inventory Settings</h3>
            <button 
              onClick={() => setShowSettingsPanel(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Overbooking Limit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={overbookingLimit}
                  onChange={(e) => setOverbookingLimit(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum overbooking allowed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sell Limit
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={sellLimit}
                  onChange={(e) => setSellLimit(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum occupancy for selling</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group Block Allocation
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={groupBlockAllocation}
                  onChange={(e) => setGroupBlockAllocation(parseInt(e.target.value) || 0)}
                  className="flex-1 px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Rooms reserved for groups</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => {
                setOverbookingLimit(10);
                setSellLimit(95);
                setGroupBlockAllocation(20);
              }}
              className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSaveSettings}
              disabled={settingsLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {settingsLoading ? 'Saving...' : settingsSaved ? 'Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading room inventory...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* View Tabs */}
          <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
        {views.map((view) => {
          const Icon = view.icon;
          return (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as ViewType)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeView === view.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {view.label}
            </button>
          );
        })}
        </div>

        {/* Room Type Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roomTypes.map((rt) => (
          <div key={rt.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">{rt.name}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">${rt.baseRate}/night</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Rooms</span>
                <span className="font-medium text-gray-900 dark:text-white">{rt.totalRooms}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Available</span>
                <span className="font-medium text-green-600">{rt.available}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Occupied</span>
                <span className="font-medium text-blue-600">{rt.occupied}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">House Use</span>
                <span className="font-medium text-purple-600">{rt.houseUse}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Out of Order</span>
                <span className="font-medium text-red-600">{rt.outOfOrder}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${rt.totalRooms > 0 ? (rt.occupied / rt.totalRooms) * 100 : 0}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {rt.totalRooms > 0 ? Math.round((rt.occupied / rt.totalRooms) * 100) : 0}% occupied
              </div>
            </div>
          </div>
        ))}
        </div>

        {/* Inventory Actions */}
        {/* Selection indicator + action feedback */}
        {(selectedRoomIds.size > 0 || actionMessage) && (
          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              {actionMessage || `${selectedRoomIds.size} room(s) selected`}
            </span>
            {selectedRoomIds.size > 0 && !actionMessage && (
              <button
                onClick={() => setSelectedRoomIds(new Set())}
                className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 underline"
              >
                Clear selection
              </button>
            )}
          </div>
        )}

        {/* Date range toggle + inputs */}
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useDateRange}
                onChange={(e) => setUseDateRange(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Apply for date range
            </label>
            <button
              onClick={() => setShowBlocksList(!showBlocksList)}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1"
            >
              {showBlocksList ? 'Hide' : 'Show'} active blocks ({roomBlocks.length})
            </button>
          </div>
          {useDateRange && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={blockStartDate}
                  onChange={(e) => setBlockStartDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={blockEndDate}
                  onChange={(e) => setBlockEndDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Reason (optional)</label>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Renovation, Group block..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
          {useDateRange && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Block / Out of Order / Out of Service actions will create date-range overrides.
              Unblock / Make Available apply to the room's current status only.
            </p>
          )}
        </div>

        {/* Active room blocks list */}
        {showBlocksList && roomBlocks.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Room Blocks</h3>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Room</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Start</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">End</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Reason</th>
                    <th className="p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {roomBlocks.map((block) => (
                    <tr key={block.id} className="border-t border-gray-100 dark:border-slate-700">
                      <td className="p-2 font-medium text-gray-900 dark:text-white">{block.room_number}</td>
                      <td className="p-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColors[mapRoomStatus(block.status) as keyof typeof statusColors] || ''}`}>
                          {block.status}
                        </span>
                      </td>
                      <td className="p-2 text-gray-600 dark:text-gray-400">{block.start_date}</td>
                      <td className="p-2 text-gray-600 dark:text-gray-400">{block.end_date}</td>
                      <td className="p-2 text-gray-600 dark:text-gray-400">{block.reason || '-'}</td>
                      <td className="p-2">
                        <button
                          onClick={() => handleDeleteBlock(block.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 text-xs"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {inventoryActions.map((action) => {
            const Icon = action.icon;
            const disabled = actionLoading || selectedRoomIds.size === 0;
            return (
              <button
                key={action.id}
                onClick={() => handleInventoryAction(action.id)}
                disabled={disabled}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-sm ${
                  disabled
                    ? 'bg-gray-100 dark:bg-slate-800/50 border-gray-200 dark:border-slate-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 cursor-pointer'
                }`}
              >
                <Icon className={`w-4 h-4 ${disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`} />
                {action.label}
              </button>
            );
          })}
        </div>

        {/* Room Grid - Daily View */}
        {activeView === 'daily' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Daily Room Grid</h2>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filteredRooms.map((room) => {
                const isSelected = selectedRoomIds.has(room.id);
                return (
                <div
                  key={room.id}
                  onClick={() => handleRoomClick(room.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${statusColors[room.status]} ${
                    isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-gray-900 dark:text-white">{room.number}</span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{room.floor}F</span>
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{room.type}</div>
                  {room.status === 'occupied' && room.currentGuest && (
                    <div className="text-xs text-gray-900 dark:text-white truncate">{room.currentGuest}</div>
                  )}
                  {room.status === 'occupied' && room.checkOut && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Until {new Date(room.checkOut).toLocaleDateString()}
                    </div>
                  )}
                </div>
                );
              })}
              </div>
            </div>
          </div>
        )}

        {/* Weekly Calendar View */}
        {activeView === 'weekly' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Calendar</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigateWeek('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[200px] text-center">
                    {weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - 
                    {new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => navigateWeek('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Calendar Header */}
            <div className="grid grid-cols-8 gap-2 mb-2">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2">Room</div>
              {weekDates.map((date, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredRooms.map((room) => (
                <div key={room.id} className="grid grid-cols-8 gap-2 items-center">
                  <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{room.number}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{room.type}</div>
                  </div>
                  {weekDates.map((date, index) => {
                    const availability = getRoomAvailabilityForDate(room, date, allReservations);
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={index}
                        className={`p-2 rounded-lg text-center text-xs font-medium border ${
                          isToday ? 'ring-2 ring-blue-500' : ''
                        } ${statusColors[availability as keyof typeof statusColors] || statusColors.available}`}
                      >
                        {availability === 'occupied' ? 'Occ' :
                         availability === 'out-of-order' ? 'OOO' :
                         availability === 'out-of-service' ? 'OOS' :
                         availability === 'blocked' ? 'Blk' :
                         availability === 'house-use' ? 'HU' : 'Avail'}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Out of Order</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Out of Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">House Use</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Blocked</span>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Calendar View */}
        {activeView === 'monthly' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Calendar</h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[150px] text-center">
                    {monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Calendar Header - Scrollable */}
            <div className="overflow-x-auto">
              <div className="grid gap-2 mb-2 min-w-max" style={{ gridTemplateColumns: `100px repeat(${monthDates.length}, minmax(40px, 1fr))` }}>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 p-2 sticky left-0 bg-white dark:bg-slate-800">Room</div>
                {monthDates.map((date, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {date.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Calendar Grid - Scrollable */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredRooms.map((room) => (
                  <div key={room.id} className="grid gap-2 items-center min-w-max" style={{ gridTemplateColumns: `100px repeat(${monthDates.length}, minmax(40px, 1fr))` }}>
                    <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg sticky left-0">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">{room.number}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{room.type}</div>
                    </div>
                    {monthDates.map((date, index) => {
                      const availability = getRoomAvailabilityForDate(room, date, allReservations);
                      const isToday = date.toDateString() === new Date().toDateString();
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                      
                      return (
                        <div
                          key={index}
                          className={`p-2 rounded-lg text-center text-xs font-medium border ${
                            isToday ? 'ring-2 ring-blue-500' : ''
                          } ${
                            isWeekend && availability === 'available' ? 'bg-gray-50 dark:bg-slate-700/50 border-gray-200 dark:border-slate-700' : ''
                          } ${statusColors[availability as keyof typeof statusColors] || statusColors.available}`}
                        >
                          {availability === 'occupied' ? '●' :
                           availability === 'out-of-order' ? '✕' :
                           availability === 'out-of-service' ? '!' :
                           availability === 'blocked' ? '■' :
                           availability === 'house-use' ? '★' : '○'}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Available</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Out of Order</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Out of Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">House Use</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 dark:bg-gray-900/30 border border-gray-300 dark:border-gray-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Blocked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded"></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">Weekend</span>
              </div>
            </div>
          </div>
        )}

        {/* Occupancy Calendar View */}
        {activeView === 'occupancy' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Occupancy Analytics</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOccupancyPeriod('week')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      occupancyPeriod === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setOccupancyPeriod('month')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      occupancyPeriod === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setOccupancyPeriod('quarter')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      occupancyPeriod === 'quarter'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Quarter
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`${FO_STAT_GRADIENTS.primary} rounded-xl p-4`}>
                <div className="text-sm text-white/80 mb-1">Average Occupancy</div>
                <div className="text-2xl font-bold text-white">
                  {occupancyAnalytics.averageOccupancy.toFixed(1)}%
                </div>
              </div>
              <div className={`${FO_STAT_GRADIENTS.rooms} rounded-xl p-4`}>
                <div className="text-sm text-white/80 mb-1">Peak Occupancy</div>
                <div className="text-2xl font-bold text-white">
                  {occupancyAnalytics.peakOccupancy.toFixed(1)}%
                </div>
              </div>
              <div className={`${FO_STAT_GRADIENTS.alert} rounded-xl p-4`}>
                <div className="text-sm text-white/80 mb-1">Lowest Occupancy</div>
                <div className="text-2xl font-bold text-white">
                  {occupancyAnalytics.lowestOccupancy.toFixed(1)}%
                </div>
              </div>
            </div>
            
            {/* Occupancy Chart */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Occupancy Trend</h3>
              <div className="flex items-end gap-1 h-40">
                {occupancyAnalytics.occupancyData.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-blue-500 dark:bg-blue-600 rounded-t transition-all hover:bg-blue-600 dark:hover:bg-blue-500"
                      style={{ height: `${Math.max(data.rate, 5)}%` }}
                      title={`${data.label}: ${data.rate.toFixed(1)}%`}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-left">
                      {index % Math.ceil(occupancyAnalytics.occupancyData.length / 10) === 0 ? data.label : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Room Type Breakdown */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Room Type Breakdown</h3>
              <div className="space-y-3">
                {occupancyAnalytics.roomTypeBreakdown.map((rt) => (
                  <div key={rt.name} className="flex items-center gap-4">
                    <div className="w-32 text-sm text-gray-600 dark:text-gray-400">{rt.name}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {rt.occupied} / {rt.total} rooms
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {rt.occupancyRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${rt.occupancyRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Forecast Calendar View */}
        {activeView === 'forecast' && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Demand Forecast</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setForecastPeriod('week')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      forecastPeriod === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Week
                  </button>
                  <button
                    onClick={() => setForecastPeriod('month')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      forecastPeriod === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => setForecastPeriod('quarter')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      forecastPeriod === 'quarter'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Quarter
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className={`${FO_STAT_GRADIENTS.revenue} rounded-xl p-4`}>
                <div className="text-sm text-white/80 mb-1">Forecast Revenue</div>
                <div className="text-2xl font-bold text-white">
                  ${forecastAnalytics.totalForecastRevenue.toLocaleString()}
                </div>
              </div>
              <div className={`${FO_STAT_GRADIENTS.primary} rounded-xl p-4`}>
                <div className="text-sm text-white/80 mb-1">Avg Forecast Rate</div>
                <div className="text-2xl font-bold text-white">
                  {forecastAnalytics.averageForecastRate.toFixed(1)}%
                </div>
              </div>
              <div className={`${FO_STAT_GRADIENTS.revenue} rounded-xl p-4`}>
                <div className="text-sm text-white/80 mb-1">Peak Day</div>
                <div className="text-lg font-bold text-white">
                  {forecastAnalytics.peakForecastDay.label}
                </div>
                <div className="text-sm text-white/80">
                  {forecastAnalytics.peakForecastDay.forecastRate.toFixed(1)}%
                </div>
              </div>
            </div>
            
            {/* Forecast Chart */}
            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Demand Forecast</h3>
              <div className="flex items-end gap-1 h-40">
                {forecastAnalytics.forecastData.map((data, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-gradient-to-t from-purple-500 to-purple-400 dark:from-purple-600 dark:to-purple-500 rounded-t transition-all hover:from-purple-600 hover:to-purple-500 dark:hover:from-purple-700 dark:hover:to-purple-600"
                      style={{ height: `${Math.max(data.forecastRate, 5)}%` }}
                      title={`${data.label}: ${data.forecastRate.toFixed(1)}% (${data.confidence.toFixed(0)}% confidence)`}
                    />
                    <div className="text-xs text-gray-500 dark:text-gray-400 transform -rotate-45 origin-left">
                      {index % Math.ceil(forecastAnalytics.forecastData.length / 10) === 0 ? data.label : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Forecast Details Table */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Forecast Details</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="text-left p-2 text-gray-600 dark:text-gray-400">Date</th>
                      <th className="text-right p-2 text-gray-600 dark:text-gray-400">Forecast Rate</th>
                      <th className="text-right p-2 text-gray-600 dark:text-gray-400">Expected Occupancy</th>
                      <th className="text-right p-2 text-gray-600 dark:text-gray-400">Revenue</th>
                      <th className="text-right p-2 text-gray-600 dark:text-gray-400">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecastAnalytics.forecastData.slice(0, 10).map((data, index) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-slate-800">
                        <td className="p-2 text-gray-900 dark:text-white">{data.label}</td>
                        <td className="p-2 text-right text-gray-900 dark:text-white">{data.forecastRate.toFixed(1)}%</td>
                        <td className="p-2 text-right text-gray-900 dark:text-white">{data.forecastOccupied} rooms</td>
                        <td className="p-2 text-right text-gray-900 dark:text-white">${data.forecastRevenue.toLocaleString()}</td>
                        <td className="p-2 text-right">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            data.confidence >= 80 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : data.confidence >= 60
                              ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}>
                            {data.confidence.toFixed(0)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {forecastAnalytics.forecastData.length > 10 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Showing first 10 of {forecastAnalytics.forecastData.length} days
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default AvailabilityInventory;
