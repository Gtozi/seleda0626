/**
 * Front Office Reservations Module
 * Complete reservation management system
 */

import { useState, useEffect, useMemo, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Calendar,
  Search,
  Plus,
  Edit,
  Users,
  XCircle,
  Split,
  RefreshCw,
  Filter,
  Download,
  Printer,
  Eye,
  CheckCircle2,
  TrendingUp,
  LogOut,
  UserX,
  User,
  Settings,
  X,
  ChevronDown,
  ChevronRight,
  Mail,
  Phone,
  Globe,
  BedDouble,
  MapPin,
  Sparkles,
  CalendarCheck,
  Building2,
  Users2,
  Tag,
  Clock,
  DollarSign,
  Star
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import CalendarMonthView from './CalendarMonthView';
import { findAvailableRoomForType } from '../../../services/allocationService';
import RecurringSeriesTab from '../../FrontDesk/RecurringSeriesTab';
import ForecastTab from '../ForecastTab';
import { FO_STAT_GRADIENTS } from '../brandTheme';

// Create a single Supabase client instance
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper to get the current user's name from the session
async function getCurrentUserName(): Promise<string> {
  try {
    const token = localStorage.getItem('hotel_erp_session') || localStorage.getItem('auth_token');
    if (!token) return 'System';
    const response = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      return data.user?.name || data.user?.username || data.user?.id || 'Unknown User';
    }
    return 'System';
  } catch {
    return 'System';
  }
}

type ReservationSource = 'website' | 'walk-in' | 'ota' | 'corporate' | 'travel-agent' | 'group' | 'call-center' | 'mobile-app';
type ReservationStatus = 'confirmed' | 'tentative' | 'waitlist' | 'cancelled' | 'no-show' | 'checked-in' | 'checked-out';

interface RoomReservation {
  roomType: string;
  roomNumber?: string;
  adults: number;
  children: number;
  amount: number;
}

interface RoomOccupancy {
  adults: number;
  children: number;
}

interface RoomTypeSelection {
  roomType: string;
  roomNumbers?: string[];
  quantity: number;
  adultsPerRoom: number;
  childrenPerRoom: number;
  amountPerRoom: number;
  occupancies?: RoomOccupancy[];
}

interface Reservation {
  id: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestStatus?: string;
  nationality?: string;
  rooms: RoomReservation[];
  checkIn: string;
  checkOut: string;
  nights: number;
  totalAdults: number;
  totalChildren: number;
  source: ReservationSource;
  status: ReservationStatus;
  totalAmount: number;
  deposit?: number;
  balance: number;
  groupName?: string;
  primaryContact?: string;
  travelAgency?: string;
  corporation?: string;
  paymentStatus?: string;
  rate?: number;
  createdAt?: string;
  createdBy?: string;
  guest_id?: string;
  booking_group_id?: string;
}

const Reservations = ({ onNavigateToCheckIn, onNavigateToCheckOut, onNavigateToGroupCheckIn, onNavigateToGroupCheckOut, onViewGuestProfile, onViewGroupProfile }: {
  onNavigateToCheckIn?: (resId: string) => void;
  onNavigateToCheckOut?: (resId: string) => void;
  onNavigateToGroupCheckIn?: (groupId: string, groupName: string) => void;
  onNavigateToGroupCheckOut?: (groupId: string, groupName: string) => void;
  onViewGuestProfile?: (guestId: string) => void;
  onViewGroupProfile?: (groupId: string) => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'list' | 'search' | 'calendar' | 'ota' | 'forecast' | 'series') || 'list';
  const setActiveTab = (tab: 'list' | 'search' | 'calendar' | 'ota' | 'forecast' | 'series') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showNewReservationModal, setShowNewReservationModal] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [viewingReservation, setViewingReservation] = useState<Reservation | null>(null);
  const [viewingReservationGuestId, setViewingReservationGuestId] = useState<string | null>(null);
  // Track which groups are expanded (collapsible group reservations)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Fetch guest ID by email when viewing a reservation that doesn't have guest_id
  useEffect(() => {
    const fetchGuestId = async () => {
      if (viewingReservation && !viewingReservation.guest_id && viewingReservation.guestEmail && supabase) {
        const { data: guest } = await supabase
          .from('guests')
          .select('id')
          .eq('email', viewingReservation.guestEmail)
          .maybeSingle();
        if (guest) {
          setViewingReservationGuestId(guest.id);
        } else {
          setViewingReservationGuestId(null);
        }
      } else if (viewingReservation?.guest_id) {
        setViewingReservationGuestId(viewingReservation.guest_id);
      } else {
        setViewingReservationGuestId(null);
      }
    };
    fetchGuestId();
  }, [viewingReservation]);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [perRoomOccupancyEnabled, setPerRoomOccupancyEnabled] = useState(false);
  const [managePerRoomOccupancyEnabled, setManagePerRoomOccupancyEnabled] = useState(false);
  const [newReservationRooms, setNewReservationRooms] = useState<RoomReservation[]>([
    { roomType: '', adults: 1, children: 0, amount: 0 }
  ]);
  const [newReservationRoomTypes, setNewReservationRoomTypes] = useState<RoomTypeSelection[]>([
    { roomType: '', quantity: 1, adultsPerRoom: 1, childrenPerRoom: 0, amountPerRoom: 0 }
  ]);
  const [newReservationForm, setNewReservationForm] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestStatus: 'Regular',
    nationality: '',
    checkInDate: '',
    checkOutDate: '',
    source: 'walk-in',
    groupName: '',
    primaryContact: '',
    travelAgency: '',
    corporation: '',
    depositAmount: 0,
    isDepositPaid: false,
    paymentStatus: 'Unpaid',
    notes: ''
  });
  // Explicit booking type toggle: 'individual' or 'group'
  const [bookingType, setBookingType] = useState<'individual' | 'group'>('individual');

  // Group auto-suggest: when the guest email matches an existing guest, look up
  // their active group memberships so the user can attach the reservation to a
  // known group (corporate account, tour operator, etc.) without re-keying it.
  const [matchedGuestId, setMatchedGuestId] = useState<string | null>(null);
  const [suggestedGroups, setSuggestedGroups] = useState<any[]>([]);
  const [suggestedGroupsLoading, setSuggestedGroupsLoading] = useState(false);
  const [selectedSuggestedGroupId, setSelectedSuggestedGroupId] = useState<string | null>(null);
  // Submit loading state
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Inline form validation errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showRoomManagementModal, setShowRoomManagementModal] = useState(false);
  const [managingReservationId, setManagingReservationId] = useState<string | null>(null);
  const [managingRoomTypes, setManagingRoomTypes] = useState<RoomTypeSelection[]>([]);
  const [managingGroupFields, setManagingGroupFields] = useState({
    groupName: '',
    primaryContact: '',
    travelAgency: '',
    corporation: ''
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // ── Group auto-suggest ─────────────────────────────────────────
  // When the guest email changes, look up whether it matches an existing guest
  // and, if so, fetch that guest's active group memberships. We debounce the
  // email lookup so we only hit the API once the user pauses typing.
  useEffect(() => {
    const email = (newReservationForm.guestEmail || '').trim().toLowerCase();
    setSuggestedGroups([]);
    setMatchedGuestId(null);
    setSelectedSuggestedGroupId(null);
    if (!email || bookingType === 'group') return;

    const timer = setTimeout(async () => {
      setSuggestedGroupsLoading(true);
      try {
        // Find an existing guest by email.
        const findRes = await fetch(`/api/front-office/guests?search=${encodeURIComponent(email)}&limit=5`, { credentials: 'include' });
        if (!findRes.ok) { setSuggestedGroupsLoading(false); return; }
        const findData = await findRes.json();
        const candidates: any[] = findData.guests || [];
        const match = candidates.find((c: any) => (c.email || '').toLowerCase() === email);
        if (!match) { setSuggestedGroupsLoading(false); return; }
        setMatchedGuestId(match.id);

        // Fetch that guest's active group memberships.
        const grpRes = await fetch(`/api/group-profiles/guest/${match.id}/groups`, { credentials: 'include' });
        if (grpRes.ok) {
          const grpData = await grpRes.json();
          setSuggestedGroups(grpData.groups || []);
        }
      } catch (e) {
        // ignore — auto-suggest is best-effort
      } finally {
        setSuggestedGroupsLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newReservationForm.guestEmail, bookingType]);

  // Calendar view state
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Room types and rooms from database
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [allRooms, setAllRooms] = useState<any[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');

  // Room numbers already booked (Confirmed/CheckedIn) for the selected stay
  // dates — fetched from the DB so the room picker never offers a room that
  // is already reserved for an overlapping period.
  const [bookedRoomNumbers, setBookedRoomNumbers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const ci = newReservationForm.checkInDate;
    const co = newReservationForm.checkOutDate;
    if (!ci || !co || !supabase) {
      setBookedRoomNumbers(new Set());
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('reservations')
        .select('id, room_number')
        .not('room_number', 'is', null)
        .in('status', ['Confirmed', 'CheckedIn'])
        .lt('check_in_date', co)
        .gt('check_out_date', ci);
      if (cancelled) return;
      if (error) {
        console.error('Error fetching booked rooms:', error);
        return;
      }
      const excludeId = isEditMode && editingReservation ? editingReservation.id : null;
      setBookedRoomNumbers(new Set(
        (data || [])
          .filter((r: any) => r.id !== excludeId)
          .map((r: any) => String(r.room_number))
      ));
    })();
    return () => { cancelled = true; };
  }, [newReservationForm.checkInDate, newReservationForm.checkOutDate, isEditMode, editingReservation]);

  // Availability search state
  const [searchCheckIn, setSearchCheckIn] = useState<string>('');
  const [searchCheckOut, setSearchCheckOut] = useState<string>('');
  const [searchGuests, setSearchGuests] = useState<number>(2);
  const [searchRoomType, setSearchRoomType] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    Array<{ roomTypeId: string; roomTypeName: string; availableCount: number; rate: number; maxOccupancy: number; sampleRoomNumbers: string[] }>
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Fetch room types and rooms from database
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!supabase) return;

      try {
        // Fetch room types
        const { data: roomTypesData, error: roomTypesError } = await supabase
          .from('room_types')
          .select('id, name, base_price, max_occupancy, bed_configuration, room_size_sqft, description, amenities')
          .order('name');

        if (roomTypesError) {
          console.error('Error fetching room types:', roomTypesError);
        } else {
          console.log('Room types fetched:', roomTypesData?.length || 0, 'types');
          setRoomTypes(roomTypesData || []);
        }

        // Fetch available rooms
        const { data: roomsData } = await supabase
          .from('rooms')
          .select('id, number, type, status, rate')
          .in('status', ['Vacant Clean', 'Vacant Dirty'])
          .order('number');

        if (roomsData) {
          setAvailableRooms(roomsData);
        }

        // Fetch ALL rooms (any status) for the calendar matrix view
        const { data: allRoomsData } = await supabase
          .from('rooms')
          .select('id, number, type, status, rate')
          .order('number');

        if (allRoomsData) {
          setAllRooms(allRoomsData);
        }
      } catch (error) {
        console.error('Error fetching room data:', error);
      }
    };

    fetchRoomData();
  }, []);

  // Search availability for a date range.
  // Computes sellable rooms (excluding Out of Order / Out of Service / Blocked)
  // minus rooms with overlapping active reservations, grouped by room type.
  const handleSearchAvailability = async () => {
    setSearchError(null);

    if (!searchCheckIn || !searchCheckOut) {
      setSearchError('Please select both check-in and check-out dates.');
      return;
    }
    if (new Date(searchCheckOut) <= new Date(searchCheckIn)) {
      setSearchError('Check-out date must be after the check-in date.');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      // 1. Sellable rooms: exclude rooms that cannot be sold at all.
      const nonSellableStatuses = ['Out of Order', 'Out of Service', 'Blocked'];
      let sellableRooms = allRooms.filter(r => !nonSellableStatuses.includes(r.status));

      // Re-fetch rooms in case statuses changed since initial load.
      const { data: freshRooms } = await supabase
        .from('rooms')
        .select('id, number, type, status, rate')
        .order('number');
      if (freshRooms && freshRooms.length > 0) {
        sellableRooms = freshRooms.filter(r => !nonSellableStatuses.includes(r.status));
      }

      // 2. Find active reservations overlapping the requested date range.
      // Overlap condition: existing check_in < requested check_out AND existing check_out > requested check_in
      const { data: overlappingReservations, error: resError } = await supabase
        .from('reservations')
        .select('id, room_number, status')
        .lt('check_in_date', searchCheckOut)
        .gt('check_out_date', searchCheckIn)
        .not('status', 'in', '("cancelled","no-show")');

      if (resError) throw resError;

      // Collect occupied room numbers from both the reservation row and its room rows.
      const occupiedRoomNumbers = new Set<string>();
      (overlappingReservations || []).forEach((res: any) => {
        if (res.room_number) occupiedRoomNumbers.add(String(res.room_number));
      });

      const overlappingIds = (overlappingReservations || []).map((r: any) => r.id);
      if (overlappingIds.length > 0) {
        const { data: resRooms } = await supabase
          .from('reservation_rooms')
          .select('room_number')
          .in('reservation_id', overlappingIds);
        (resRooms || []).forEach((rr: any) => {
          if (rr.room_number) occupiedRoomNumbers.add(String(rr.room_number));
        });
      }

      // 3. Available rooms = sellable rooms not occupied during the range.
      const available = sellableRooms.filter(r => !occupiedRoomNumbers.has(String(r.number)));

      // 4. Filter by selected room type and guest capacity, then group by room type.
      let filtered = available;
      if (searchRoomType) {
        const rtInfo = roomTypes.find(rt => rt.id === searchRoomType);
        filtered = available.filter(r => r.type === rtInfo?.name);
      }
      if (searchGuests && searchGuests > 0) {
        const allowedTypeNames = new Set(
          roomTypes.filter(rt => (rt.max_occupancy || 0) >= searchGuests).map(rt => rt.name)
        );
        filtered = filtered.filter(r => allowedTypeNames.has(r.type));
      }

      // Group by room type name.
      const groupedMap = new Map<string, { rooms: any[]; rate: number }>();
      filtered.forEach(room => {
        const key = room.type || 'Standard';
        if (!groupedMap.has(key)) {
          groupedMap.set(key, { rooms: [], rate: Number(room.rate) || 0 });
        }
        const entry = groupedMap.get(key)!;
        entry.rooms.push(room);
        // Prefer the highest rate as the displayed rate for the type.
        if (Number(room.rate) > entry.rate) entry.rate = Number(room.rate);
      });

      // Build results array aligned with room_types metadata.
      const results = Array.from(groupedMap.entries()).map(([typeName, { rooms, rate }]) => {
        const rt = roomTypes.find(r => r.name === typeName);
        return {
          roomTypeId: rt?.id || '',
          roomTypeName: typeName,
          availableCount: rooms.length,
          rate,
          maxOccupancy: rt?.max_occupancy || 0,
          sampleRoomNumbers: rooms.slice(0, 5).map(r => String(r.number)),
        };
      });

      // Sort by room type name for stable display.
      results.sort((a, b) => a.roomTypeName.localeCompare(b.roomTypeName));

      setSearchResults(results);
    } catch (err: any) {
      console.error('Availability search error:', err);
      setSearchError(err?.message || 'Failed to search availability. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Pre-fill the New Reservation modal from an availability search result and open it.
  const bookFromSearchResult = (result: { roomTypeId: string; rate: number }) => {
    setEditingReservation(null);
    setIsEditMode(false);
    setBookingType('individual');
    setFormErrors({});
    setNewReservationRoomTypes([
      {
        roomType: result.roomTypeId,
        quantity: 1,
        adultsPerRoom: searchGuests > 0 ? Math.min(searchGuests, 2) : 1,
        childrenPerRoom: 0,
        amountPerRoom: result.rate,
      },
    ]);
    setNewReservationForm({
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      guestStatus: 'Regular',
      nationality: '',
      checkInDate: searchCheckIn,
      checkOutDate: searchCheckOut,
      source: 'walk-in',
      groupName: '',
      primaryContact: '',
      travelAgency: '',
      corporation: '',
      depositAmount: 0,
      isDepositPaid: false,
      paymentStatus: 'Unpaid',
      notes: '',
    });
    setShowNewReservationModal(true);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        // Close all dropdowns
        document.querySelectorAll('[id^="edit-dropdown-"]').forEach(dropdown => {
          dropdown.classList.add('hidden');
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Fetch reservations from backend
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        if (!supabase) {
          throw new Error('Supabase client not initialized');
        }
        
        let query = supabase
          .from('reservations')
          .select(`
            id,
            guest_name,
            guest_email,
            guest_phone,
            guest_status,
            check_in_date,
            check_out_date,
            status,
            adults,
            children,
            total_amount,
            deposit_amount,
            channel,
            room_type,
            room_number,
            rate,
            payment_status,
            notes,
            group_booking_id,
            booking_group_id,
            corporate_account_id,
            is_group,
            created_at,
            created_by
          `);

        // Apply filters
        if (searchTerm) {
          query = query.or(`id.ilike.%${searchTerm}%,guest_name.ilike.%${searchTerm}%,guest_email.ilike.%${searchTerm}%,guest_phone.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`);
        }
        if (sourceFilter) {
          query = query.eq('channel', sourceFilter);
        }
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        const { data: reservations, error } = await query.order('check_in_date', { ascending: true });

        if (error) {
          console.error('Supabase query error:', error);
          throw new Error('Database query failed');
        }

        // Fetch all reservation rooms for these reservations
        const reservationIds = reservations?.map((r: any) => r.id) || [];
        let reservationRoomsMap: Record<string, any[]> = {};
        if (reservationIds.length > 0 && supabase) {
          const { data: roomsData, error: roomsError } = await supabase
            .from('reservation_rooms')
            .select('reservation_id, room_type, room_number, adults, children, amount')
            .in('reservation_id', reservationIds)
            .order('created_at', { ascending: true });
          
          if (!roomsError && roomsData) {
            roomsData.forEach((rr: any) => {
              if (!reservationRoomsMap[rr.reservation_id]) {
                reservationRoomsMap[rr.reservation_id] = [];
              }
              reservationRoomsMap[rr.reservation_id].push({
                roomType: rr.room_type || 'Standard',
                roomNumber: rr.room_number || undefined,
                adults: rr.adults || 1,
                children: rr.children || 0,
                amount: rr.amount || 0
              });
            });
          }
        }

        // Fetch group booking names so the Group column shows the name, not the ID
        const groupIds = Array.from(new Set(
          (reservations || [])
            .map((r: any) => r.booking_group_id || r.group_booking_id)
            .filter((id: any) => id && String(id).startsWith('GRP-'))
        )) as string[];
        let groupNameMap: Record<string, string> = {};
        if (groupIds.length > 0 && supabase) {
          const { data: groupData, error: groupError } = await supabase
            .from('group_bookings')
            .select('id, group_name')
            .in('id', groupIds);
          if (!groupError && groupData) {
            groupData.forEach((g: any) => {
              groupNameMap[g.id] = g.group_name;
            });
          }
        }

        // Transform data to match frontend interface
        const transformedReservations = reservations?.map((res: any) => {
          const nights = Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
          
          let groupName = null;
          let primaryContact = null;
          let travelAgency = null;
          let corporation = null;
          let guestName = 'Guest';
          
          try {
            const notesObj = typeof res.notes === 'string' ? JSON.parse(res.notes || '{}') : (res.notes || {});
            
            // Check if this is a group booking
            if (notesObj.groupName || res.group_booking_id || res.booking_group_id || res.is_group) {
              const gid = res.booking_group_id || res.group_booking_id;
              // groupName must always be the actual group name (from group_bookings table or notes),
              // NEVER the group reservation ID (e.g. GRP-XXXXXX).
              groupName = (gid && groupNameMap[gid]) || notesObj.groupName || null;
              primaryContact = notesObj.primaryContact;
              travelAgency = notesObj.travelAgency;
              corporation = notesObj.corporation || res.corporate_account_id;
              // For group bookings, show primary contact as guest name
              guestName = notesObj.primaryContact || notesObj.guestName || res.guest_name || 'Group Contact';
            } else {
              guestName = notesObj.guestName || res.guest_name || 'Guest';
            }
          } catch (e) {
            guestName = res.guest_name || 'Guest';
            if (res.group_booking_id || res.booking_group_id || res.is_group) {
              const gid = res.booking_group_id || res.group_booking_id;
              groupName = (gid && groupNameMap[gid]) || null;
            }
          }
          
          let guestEmail = '';
          let guestPhone = '';
          let guestStatus = 'Regular';
          let nationality = '';
          try {
            const notesObj2 = typeof res.notes === 'string' ? JSON.parse(res.notes || '{}') : (res.notes || {});
            guestEmail = notesObj2.guestEmail || res.guest_email || '';
            guestPhone = notesObj2.guestPhone || res.guest_phone || '';
            guestStatus = notesObj2.guestStatus || res.guest_status || 'Regular';
            nationality = notesObj2.nationality || '';
          } catch (e) {
            guestEmail = res.guest_email || '';
            guestPhone = res.guest_phone || '';
            guestStatus = res.guest_status || 'Regular';
          }

          // Use rooms from reservation_rooms table if available, otherwise fall back to reservation row
          const fetchedRooms = reservationRoomsMap[res.id];
          const rooms = fetchedRooms && fetchedRooms.length > 0
            ? fetchedRooms
            : [{
                roomType: res.room_type || 'Standard',
                roomNumber: res.room_number || undefined,
                adults: res.adults || 1,
                children: res.children || 0,
                amount: res.total_amount || 0
              }];
          
          return {
            id: res.id,
            guestName: guestName,
            guestEmail: guestEmail,
            guestPhone: guestPhone,
            guestStatus: guestStatus,
            nationality: nationality,
            rooms: rooms,
            checkIn: res.check_in_date,
            checkOut: res.check_out_date,
            nights: nights,
            totalAdults: res.adults || 1,
            totalChildren: res.children || 0,
            source: res.channel || 'walk-in',
            status: res.status.toLowerCase(),
            totalAmount: res.total_amount,
            deposit: res.deposit_amount,
            balance: res.total_amount - (res.deposit_amount || 0),
            groupName: groupName,
            primaryContact: primaryContact,
            travelAgency: travelAgency,
            corporation: corporation,
            paymentStatus: res.payment_status || 'Unpaid',
            rate: res.rate || 0,
            createdAt: res.created_at || '',
            createdBy: res.created_by || '',
            booking_group_id: res.booking_group_id || res.group_booking_id || undefined
          };
        }) || [];

        setReservations(transformedReservations);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        // Fallback to sample data for development
        console.log('Using fallback sample data');
        setReservations([
          {
            id: 'RES-001',
            guestName: 'John Smith',
            rooms: [{ roomType: 'Deluxe King', roomNumber: '301', adults: 2, children: 0, amount: 450 }],
            checkIn: '2026-08-05',
            checkOut: '2026-08-08',
            nights: 3,
            totalAdults: 2,
            totalChildren: 0,
            source: 'Direct Website',
            status: 'confirmed',
            totalAmount: 450,
            deposit: 100,
            balance: 350,
            groupName: null,
            primaryContact: null,
            travelAgency: null,
            corporation: null
          },
          {
            id: 'RES-002',
            guestName: 'Johnson Family',
            rooms: [{ roomType: 'Suite', roomNumber: '401', adults: 4, children: 2, amount: 1250 }],
            checkIn: '2026-08-10',
            checkOut: '2026-08-15',
            nights: 5,
            totalAdults: 4,
            totalChildren: 2,
            source: 'Direct Website',
            status: 'confirmed',
            totalAmount: 1250,
            deposit: 250,
            balance: 1000,
            groupName: 'Johnson Family Reunion',
            primaryContact: 'Mary Johnson - +251922345678',
            travelAgency: null,
            corporation: null
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [searchTerm, sourceFilter, statusFilter, refreshTrigger]);

  const statusColors: Record<string, string> = {
    confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    tentative: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    waitlist: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'no-show': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
    'checked-in': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'checked-out': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    // Database status mappings
    Confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    CheckedIn: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    CheckedOut: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Waitlisted: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  const sourceIcons = {
    website: '🌐',
    'walk-in': '🚶',
    ota: '🏨',
    corporate: '🏢',
    'travel-agent': '✈️',
    group: '👥',
    'call-center': '📞',
    'mobile-app': '📱',
  };

  const handleCheckIn = async (resId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'CheckedIn' })
        .eq('id', resId);
      if (error) throw error;
      setRefreshTrigger(prev => prev + 1);
      onNavigateToCheckIn?.(resId);
    } catch (err) {
      console.error('Check-in failed:', err);
      alert('Failed to check in reservation. Please try again.');
    }
  };

  const handleCheckOut = async (resId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'CheckedOut' })
        .eq('id', resId);
      if (error) throw error;
      setRefreshTrigger(prev => prev + 1);
      onNavigateToCheckOut?.(resId);
    } catch (err) {
      console.error('Check-out failed:', err);
      alert('Failed to check out reservation. Please try again.');
    }
  };

  const availableRoomTypes = [
    { id: 'deluxe', name: 'Deluxe King', baseRate: 150, maxOccupancy: 2 },
    { id: 'standard', name: 'Standard Twin', baseRate: 100, maxOccupancy: 2 },
    { id: 'suite', name: 'Suite', baseRate: 250, maxOccupancy: 4 },
    { id: 'family', name: 'Family Room', baseRate: 180, maxOccupancy: 4 },
    { id: 'single', name: 'Single Room', baseRate: 80, maxOccupancy: 1 },
  ];

  // Component to display room information
  const RoomDisplay = ({ rooms }: { rooms: RoomReservation[] }) => {
    if (rooms.length === 1) {
      const room = rooms[0];
      const roomTypeName = roomTypes.find(rt => rt.id === room.roomType)?.name || availableRoomTypes.find(rt => rt.id === room.roomType)?.name || room.roomType;
      return (
        <>
          <div className="text-sm font-medium">{roomTypeName}</div>
          {room.roomNumber ? (
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Room #{room.roomNumber}</div>
          ) : (
            <div className="text-xs text-gray-400 dark:text-gray-500">Auto-assign</div>
          )}
        </>
      );
    }

    const selections = convertToRoomTypeSelections(rooms);
    const roomsWithNumbers = rooms.filter(r => r.roomNumber);
    return (
      <div className="space-y-1">
        <div className="text-xs font-medium">{formatRoomsDisplay(rooms)}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {selections.map(sel => {
            const roomTypeName = roomTypes.find(rt => rt.id === sel.roomType)?.name || availableRoomTypes.find(rt => rt.id === sel.roomType)?.name || sel.roomType;
            return `${roomTypeName}: ${sel.quantity} × $${sel.amountPerRoom.toFixed(0)}`;
          }).join(' | ')}
        </div>
        {roomsWithNumbers.length > 0 && (
          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
            Rooms: {roomsWithNumbers.map(r => r.roomNumber).join(', ')}
          </div>
        )}
        <div className="text-xs text-purple-600 dark:text-purple-400 font-medium">
          {rooms.length} rooms total
        </div>
      </div>
    );
  };

  // Helper function to convert room type selections to individual room reservations
  const convertToRoomReservations = (selections: RoomTypeSelection[]): RoomReservation[] => {
    const rooms: RoomReservation[] = [];
    selections.forEach(selection => {
      const occs = selection.occupancies || [];
      for (let i = 0; i < selection.quantity; i++) {
        const occ = occs[i] || { adults: selection.adultsPerRoom, children: selection.childrenPerRoom };
        rooms.push({
          roomType: selection.roomType,
          roomNumber: selection.roomNumbers?.[i] || undefined,
          adults: occ.adults,
          children: occ.children,
          amount: selection.amountPerRoom
        });
      }
    });
    return rooms;
  };

  // Helper function to convert room reservations back to room type selections
  const convertToRoomTypeSelections = (rooms: RoomReservation[]): RoomTypeSelection[] => {
    const typeMap = new Map<string, RoomTypeSelection>();
    
    rooms.forEach(room => {
      const existing = typeMap.get(room.roomType);
      if (existing) {
        existing.quantity += 1;
        existing.occupancies = [...(existing.occupancies || []), { adults: room.adults, children: room.children }];
        if (room.roomNumber) {
          existing.roomNumbers = [...(existing.roomNumbers || []), room.roomNumber];
        }
      } else {
        typeMap.set(room.roomType, {
          roomType: room.roomType,
          roomNumbers: room.roomNumber ? [room.roomNumber] : [],
          quantity: 1,
          adultsPerRoom: room.adults,
          childrenPerRoom: room.children,
          amountPerRoom: room.amount,
          occupancies: [{ adults: room.adults, children: room.children }]
        });
      }
    });
    
    return Array.from(typeMap.values());
  };

  // Helper function to format room display
  const formatRoomsDisplay = (rooms: RoomReservation[]): string => {
    const selections = convertToRoomTypeSelections(rooms);
    return selections.map(sel => {
      const roomTypeName = roomTypes.find(rt => rt.id === sel.roomType)?.name || sel.roomType;
      return sel.quantity > 1 ? `${roomTypeName} x${sel.quantity}` : roomTypeName;
    }).join(', ');
  };

  // Helper function to get room breakdown for tooltip
  const getRoomBreakdown = (rooms: RoomReservation[]): string => {
    const selections = convertToRoomTypeSelections(rooms);
    return selections.map(sel => {
      const roomTypeName = roomTypes.find(rt => rt.id === sel.roomType)?.name || sel.roomType;
      const totalForType = sel.amountPerRoom * sel.quantity;
      const occs = sel.occupancies || [];
      const hasPerRoom = occs.length > 1 && occs.some(o => o.adults !== occs[0].adults || o.children !== occs[0].children);
      if (hasPerRoom) {
        const occStr = occs.map((o, i) => `R${i + 1}:${o.adults}A${o.children > 0 ? `${o.children}C` : ''}`).join(' ');
        return `${roomTypeName}: ${sel.quantity} room(s) [${occStr}] - $${totalForType.toFixed(2)}`;
      }
      const guestsPerRoom = sel.adultsPerRoom + sel.childrenPerRoom;
      return `${roomTypeName}: ${sel.quantity} room(s) × ${guestsPerRoom} guests/room - $${totalForType.toFixed(2)}`;
    }).join('\n');
  };

  const tabs = [
    { id: 'list', label: 'All Reservations', icon: Users },
    { id: 'search', label: 'Availability Search', icon: Search },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'ota', label: 'OTA Sync', icon: RefreshCw },
    { id: 'forecast', label: 'Forecast', icon: TrendingUp },
    { id: 'series', label: 'Recurring Series', icon: Split },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reservations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Complete reservation management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowNewReservationModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Reservation
          </button>
          <button 
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter Panel */}
      {showFilterPanel && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
              <div className="flex gap-2">
                <input 
                  type="date" 
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input 
                  type="date" 
                  className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Minimum Amount</label>
              <input 
                type="number" 
                min="0" 
                step="0.01"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maximum Amount</label>
              <input 
                type="number" 
                min="0" 
                step="0.01"
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0.00"
              />
            </div>
            <div className="flex items-end gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Apply Filters
              </button>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSourceFilter('');
                  setStatusFilter('');
                  setShowFilterPanel(false);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'list' && (
        <>
      {/* Reservations List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden print-area">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <input
              type="text"
              placeholder="Search by name, ID, phone, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="walk-in">Walk-In</option>
              <option value="ota">OTA</option>
              <option value="corporate">Corporate</option>
              <option value="travel-agent">Travel Agent</option>
              <option value="group">Group</option>
              <option value="call-center">Call Center</option>
              <option value="mobile-app">Mobile App</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="CheckedIn">Checked In</option>
              <option value="CheckedOut">Checked Out</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Waitlisted">Waitlisted</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                // Export to CSV
                const escapeCSV = (value: any) => {
                  const str = String(value || '');
                  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                  }
                  return str;
                };

                const csvContent = [
                  ['Reservation ID', 'Guest Name', 'Group Name', 'Room Type', 'Check-in', 'Check-out', 'Nights', 'Adults', 'Children', 'Source', 'Status', 'Total Amount', 'Deposit', 'Balance'],
                  ...reservations.map(res => [
                    res.id,
                    res.guestName,
                    res.groupName || '',
                    res.rooms.map(r => r.roomType).join('; '),
                    res.checkIn,
                    res.checkOut,
                    res.nights,
                    res.totalAdults,
                    res.totalChildren,
                    res.source,
                    res.status,
                    res.totalAmount,
                    res.deposit || 0,
                    res.balance
                  ].map(escapeCSV))
                ].map(row => row.join(',')).join('\n');

                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `reservations_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Download reservations"
            >
              <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={() => {
                // Simple print functionality
                window.print();
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Print reservations"
            >
              <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto" id="reservations-table-container">
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Loading reservations...
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reservation ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guest</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Group</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rooms</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dates</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guests</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No reservations found
                    </td>
                  </tr>
                ) : (
                  (() => {
                    // ── Group reservations by group identifier ──────────────────────
                    // Group reservations share the same booking_group_id or groupName.
                    // Individual reservations (no group) are rendered as standalone rows.
                    const groupKey = (r: Reservation) => r.booking_group_id || r.groupName || '';
                    const isGroupRes = (r: Reservation) => !!(r.groupName || r.booking_group_id);

                    // Build a map: groupKey → [reservations]
                    const groupedMap = new Map<string, Reservation[]>();
                    const standalone: Reservation[] = [];

                    for (const r of reservations) {
                      if (isGroupRes(r)) {
                        const key = groupKey(r);
                        if (!groupedMap.has(key)) groupedMap.set(key, []);
                        groupedMap.get(key)!.push(r);
                      } else {
                        standalone.push(r);
                      }
                    }

                    // Helper to toggle group expansion
                    const toggleGroup = (key: string) => {
                      setExpandedGroups(prev => {
                        const next = new Set(prev);
                        if (next.has(key)) next.delete(key);
                        else next.add(key);
                        return next;
                      });
                    };

                    // Render a single reservation row (shared by standalone and group children)
                    const renderReservationRow = (res: Reservation, isChild: boolean = false) => (
                      <tr key={res.id} className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${isChild ? 'bg-gray-50/50 dark:bg-slate-800/30' : ''}`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="font-medium text-gray-900 dark:text-white">{res.id}</span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {res.groupName ? (
                            <div className="text-sm">
                              <div className="font-medium text-gray-900 dark:text-white">{res.guestName}</div>
                              <div className="text-xs text-purple-600 dark:text-purple-400">👥 Group Booking</div>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{res.guestName}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {res.groupName ? (
                            <div className="text-sm">
                              <div className="font-medium text-purple-700 dark:text-purple-400">{res.groupName}</div>
                              {res.primaryContact && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">{res.primaryContact}</div>
                              )}
                              {res.travelAgency && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">🏢 {res.travelAgency}</div>
                              )}
                              {res.corporation && (
                                <div className="text-xs text-gray-500 dark:text-gray-400">🏛️ {res.corporation}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-400 dark:text-gray-500">-</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            <RoomDisplay rooms={res.rooms} />
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {new Date(res.checkIn).toLocaleDateString()} - {new Date(res.checkOut).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{res.nights} nights</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <Users className="w-4 h-4" />
                            {res.totalAdults} adults, {res.totalChildren} children
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{sourceIcons[res.source]}</span>
                            <span className="text-sm text-gray-900 dark:text-white capitalize">{res.source.replace('-', ' ')}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[res.status] || 'bg-gray-100 text-gray-700'}`}>
                            {res.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">${res.totalAmount}</div>
                          {res.deposit && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">${res.deposit} deposit</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${res.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${res.balance}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setViewingReservation(res);
                              }}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                              title="View details"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            {(res.status === 'confirmed') && (
                              <button
                                onClick={() => handleCheckIn(res.id)}
                                className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                                title="Check-In Guest"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Check-In
                              </button>
                            )}
                            {(res.status === 'checked-in' || (res.status as string) === 'checkedin') && (
                              <button
                                onClick={() => handleCheckOut(res.id)}
                                className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-medium rounded-md transition-colors flex items-center gap-1"
                                title="Check-Out Guest"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                Check-Out
                              </button>
                            )}
                            <div className="relative">
                              <button 
                                onClick={() => {
                                  // Toggle dropdown for quick operations
                                  const dropdown = document.getElementById(`edit-dropdown-${res.id}`);
                                  if (dropdown) {
                                    dropdown.classList.toggle('hidden');
                                  }
                                }}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors"
                                title="Edit & Quick Actions"
                              >
                                <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                              </button>
                              <div 
                                id={`edit-dropdown-${res.id}`}
                                className="hidden absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-10"
                              >
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      setEditingReservation(res);
                                      setIsEditMode(true);
                                      // Populate form with existing data
                                      setNewReservationRoomTypes(convertToRoomTypeSelections(res.rooms));
                                      setNewReservationForm({
                                        guestName: res.guestName,
                                        guestEmail: '',
                                        guestPhone: '',
                                        guestStatus: 'Regular',
                                        nationality: '',
                                        checkInDate: res.checkIn,
                                        checkOutDate: res.checkOut,
                                        source: res.source,
                                        groupName: res.groupName || '',
                                        primaryContact: res.primaryContact || '',
                                        travelAgency: res.travelAgency || '',
                                        corporation: res.corporation || '',
                                        depositAmount: res.deposit || 0,
                                        isDepositPaid: (res.deposit || 0) > 0,
                                        paymentStatus: res.paymentStatus || 'Unpaid',
                                        notes: ''
                                      });
                                      setBookingType(res.groupName ? 'group' : 'individual');
                                      setFormErrors({});
                                      setShowNewReservationModal(true);
                                      const dropdown = document.getElementById(`edit-dropdown-${res.id}`);
                                      if (dropdown) dropdown.classList.add('hidden');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit Reservation
                                  </button>
                                  <button
                                    onClick={() => {
                                      setManagingReservationId(res.id);
                                      setManagingRoomTypes(convertToRoomTypeSelections(res.rooms));
                                      setManagingGroupFields({
                                        groupName: res.groupName || '',
                                        primaryContact: res.primaryContact || '',
                                        travelAgency: res.travelAgency || '',
                                        corporation: res.corporation || ''
                                      });
                                      setShowRoomManagementModal(true);
                                      const dropdown = document.getElementById(`edit-dropdown-${res.id}`);
                                      if (dropdown) dropdown.classList.add('hidden');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <Settings className="w-4 h-4" />
                                    Manage Rooms
                                  </button>
                                  {res.status === 'confirmed' && (
                                  <button
                                    onClick={() => {
                                      handleCheckIn(res.id);
                                      const dropdown = document.getElementById(`edit-dropdown-${res.id}`);
                                      if (dropdown) dropdown.classList.add('hidden');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Check-In
                                  </button>
                                  )}
                                  {(res.status === 'checked-in' || (res.status as string) === 'checkedin') && (
                                  <button
                                    onClick={() => {
                                      handleCheckOut(res.id);
                                      const dropdown = document.getElementById(`edit-dropdown-${res.id}`);
                                      if (dropdown) dropdown.classList.add('hidden');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <LogOut className="w-4 h-4" />
                                    Check-Out
                                  </button>
                                  )}
                                  <button
                                    onClick={() => {
                                      // TODO: Implement cancel
                                      console.log('Cancel reservation:', res.id);
                                      const dropdown = document.getElementById(`edit-dropdown-${res.id}`);
                                      if (dropdown) dropdown.classList.add('hidden');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <XCircle className="w-4 h-4" />
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => {
                                      // TODO: Implement no-show
                                      console.log('No-show reservation:', res.id);
                                      const dropdown = document.getElementById(`edit-dropdown-${res.id}`);
                                      if (dropdown) dropdown.classList.add('hidden');
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 flex items-center gap-2"
                                  >
                                    <UserX className="w-4 h-4" />
                                    No-Show
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );

                    // Render a group header row (collapsible)
                    const renderGroupHeader = (key: string, groupReservations: Reservation[]) => {
                      const isExpanded = expandedGroups.has(key);
                      const first = groupReservations[0];
                      const totalAmount = groupReservations.reduce((sum, r) => sum + r.totalAmount, 0);
                      const totalBalance = groupReservations.reduce((sum, r) => sum + r.balance, 0);
                      const totalAdults = groupReservations.reduce((sum, r) => sum + r.totalAdults, 0);
                      const totalChildren = groupReservations.reduce((sum, r) => sum + r.totalChildren, 0);
                      const allRooms = groupReservations.flatMap(r => r.rooms);
                      const checkIn = first.checkIn;
                      const checkOut = first.checkOut;
                      const nights = first.nights;
                      // Aggregate statuses
                      const statuses = [...new Set(groupReservations.map(r => r.status))];

                      return (
                        <>
                          {/* Group header row - clickable to expand/collapse */}
                          <tr
                            key={`group-${key}`}
                            onClick={() => toggleGroup(key)}
                            className="cursor-pointer bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border-l-4 border-purple-500"
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                )}
                                <div className="flex flex-col">
                                  <span className="font-medium text-purple-700 dark:text-purple-300">
                                    {first.booking_group_id || key}
                                  </span>
                                  <span className="text-xs text-purple-500 dark:text-purple-400">
                                    {groupReservations.length} {groupReservations.length === 1 ? 'reservation' : 'reservations'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="font-semibold text-purple-800 dark:text-purple-300">
                                  👥 {first.groupName || 'Group Booking'}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {first.primaryContact || first.guestName}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm">
                                <div className="font-medium text-purple-700 dark:text-purple-400">{first.groupName || 'Group Booking'}</div>
                                {first.travelAgency && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">🏢 {first.travelAgency}</div>
                                )}
                                {first.corporation && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">🏛️ {first.corporation}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-700 dark:text-gray-300">
                                <RoomDisplay rooms={allRooms} />
                                <div className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                                  {allRooms.length} room(s)
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                {new Date(checkIn).toLocaleDateString()} - {new Date(checkOut).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{nights} nights</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                                <Users className="w-4 h-4" />
                                {totalAdults} adults, {totalChildren} children
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{sourceIcons[first.source]}</span>
                                <span className="text-sm text-gray-900 dark:text-white capitalize">{first.source.replace('-', ' ')}</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {statuses.length === 1 ? (
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[statuses[0]] || 'bg-gray-100 text-gray-700'}`}>
                                  {statuses[0].replace('-', ' ')}
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  Mixed ({statuses.length})
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{groupReservations.length} reservations</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                ${totalBalance.toFixed(2)}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {statuses.every(s => s === 'checked-in' || s === 'checkedin') ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const groupId = groupReservations[0].booking_group_id || key;
                                      const groupName = groupReservations[0].groupName || key;
                                      onNavigateToGroupCheckOut?.(groupId, groupName);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-1"
                                    title="Go to Check-Out module to process this group"
                                  >
                                    <LogOut className="w-3.5 h-3.5" />
                                    Group Check-Out
                                  </button>
                                ) : statuses.every(s => s === 'checked-out' || s === 'checkedout') ? (
                                  <span className="text-xs text-gray-400 italic">Checked Out</span>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const groupId = groupReservations[0].booking_group_id || key;
                                      const groupName = groupReservations[0].groupName || key;
                                      onNavigateToGroupCheckIn?.(groupId, groupName);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center gap-1"
                                    title="Go to Check-In module to process this group"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Group Check-In
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleGroup(key);
                                  }}
                                  className="px-3 py-1.5 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors flex items-center gap-1"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronDown className="w-3.5 h-3.5" />
                                      Collapse
                                    </>
                                  ) : (
                                    <>
                                      <ChevronRight className="w-3.5 h-3.5" />
                                      Expand
                                    </>
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                          {/* Child reservation rows - only visible when expanded */}
                          {isExpanded && groupReservations.map((res) => (
                            <Fragment key={res.id}>
                              {renderReservationRow(res, true)}
                            </Fragment>
                          ))}
                        </>
                      );
                    };

                    // Render all rows: standalone reservations + grouped reservations
                    return (
                      <>
                        {/* Standalone (individual) reservations */}
                        {standalone.map((res) => (
                          <Fragment key={res.id}>
                            {renderReservationRow(res, false)}
                          </Fragment>
                        ))}
                        {/* Grouped reservations with collapsible headers */}
                        {Array.from(groupedMap.entries()).map(([key, groupReservations]) => (
                          <Fragment key={key}>
                            {renderGroupHeader(key, groupReservations)}
                          </Fragment>
                        ))}
                      </>
                    );
                  })()
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
        </>
      )}

      {activeTab === 'search' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Availability Search</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in Date</label>
              <input
                type="date"
                value={searchCheckIn}
                onChange={(e) => setSearchCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-out Date</label>
              <input
                type="date"
                value={searchCheckOut}
                onChange={(e) => setSearchCheckOut(e.target.value)}
                min={searchCheckIn || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guests</label>
              <input
                type="number"
                min="1"
                value={searchGuests}
                onChange={(e) => setSearchGuests(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
              <select
                value={searchRoomType}
                onChange={(e) => setSearchRoomType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>{rt.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            onClick={handleSearchAvailability}
            disabled={isSearching}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {isSearching && <RefreshCw className="w-4 h-4 animate-spin" />}
            {isSearching ? 'Searching...' : 'Search Availability'}
          </button>

          {searchError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
              {searchError}
            </div>
          )}

          {hasSearched && !searchError && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Available Room Types
                {searchCheckIn && searchCheckOut && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    for {new Date(searchCheckIn).toLocaleDateString()} → {new Date(searchCheckOut).toLocaleDateString()}
                  </span>
                )}
              </h3>

              {searchResults.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-300">
                  No rooms available for the selected dates and criteria. Try adjusting your search.
                </div>
              ) : (
                <div className="overflow-hidden border border-gray-200 dark:border-slate-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                    <thead className="bg-gray-50 dark:bg-slate-900/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Room Type</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Max Occupancy</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Available Rooms</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Sample Room Numbers</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Rate / Night</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                      {searchResults.map((result) => (
                        <tr key={result.roomTypeId || result.roomTypeName}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{result.roomTypeName}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{result.maxOccupancy || '—'} guests</td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${result.availableCount > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'}`}>
                              {result.availableCount} available
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                            {result.sampleRoomNumbers.length > 0 ? result.sampleRoomNumbers.join(', ') + (result.availableCount > 5 ? '...' : '') : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">${result.rate.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => bookFromSearchResult(result)}
                              disabled={result.availableCount === 0}
                              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1"
                            >
                              <Plus className="w-4 h-4" />
                              Book
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'calendar' && (
        <CalendarMonthView
          reservations={reservations}
          rooms={allRooms}
          calendarMonth={calendarMonth}
          onMonthChange={setCalendarMonth}
          onReservationClick={(res) => {
            setViewingReservation(res);
            setIsEditMode(false);
          }}
        />
      )}

      {activeTab === 'ota' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">OTA Sync</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏨</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Booking.com</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Last sync: 5 minutes ago</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Sync Now
              </button>
            </div>
            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏨</span>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Expedia</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Last sync: 1 hour ago</div>
                </div>
              </div>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Sync Now
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <ForecastTab
          reservations={reservations}
          rooms={allRooms}
          currentSystemDate={new Date().toISOString().split('T')[0]}
          formatAmount={(amount: number) => `$${amount.toFixed(2)}`}
          triggerLiveSyncSimulation={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      {activeTab === 'series' && (
        <RecurringSeriesTab
          roomTypes={roomTypes}
          currentPropertyId={null}
          onRefresh={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      {/* View Reservation Modal */}
      {viewingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reservation Details</h2>
                <button
                  onClick={() => setViewingReservation(null)}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Guest Information */}
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Guest Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Guest Name</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guestName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Reservation ID</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guestEmail || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guestPhone || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Guest Status</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guestStatus || 'Regular'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Nationality</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.nationality || '—'}</p>
                  </div>
                </div>
                {(viewingReservationGuestId || viewingReservation.guestEmail) && onViewGuestProfile && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => {
                        if (viewingReservationGuestId) {
                          onViewGuestProfile(viewingReservationGuestId);
                        } else if (viewingReservation.guestEmail) {
                          // Navigate to guest profiles tab without specific ID
                          onViewGuestProfile(viewingReservation.guestEmail);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <User className="w-4 h-4" />
                      View Guest Profile
                    </button>
                  </div>
                )}
              </div>

              {/* Group Information */}
              {viewingReservation.groupName && (
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-300 mb-3">Group Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-purple-700 dark:text-purple-400">Group Name</label>
                      <p className="font-medium text-purple-900 dark:text-purple-300">{viewingReservation.groupName}</p>
                    </div>
                    {viewingReservation.primaryContact && (
                      <div>
                        <label className="text-sm text-purple-700 dark:text-purple-400">Primary Contact</label>
                        <p className="font-medium text-purple-900 dark:text-purple-300">{viewingReservation.primaryContact}</p>
                      </div>
                    )}
                    {viewingReservation.travelAgency && (
                      <div>
                        <label className="text-sm text-purple-700 dark:text-purple-400">Travel Agency</label>
                        <p className="font-medium text-purple-900 dark:text-purple-300">{viewingReservation.travelAgency}</p>
                      </div>
                    )}
                    {viewingReservation.corporation && (
                      <div>
                        <label className="text-sm text-purple-700 dark:text-purple-400">Corporation</label>
                        <p className="font-medium text-purple-900 dark:text-purple-300">{viewingReservation.corporation}</p>
                      </div>
                    )}
                  </div>
                  {viewingReservation.booking_group_id && onViewGroupProfile && (
                    <div className="mt-4 pt-4 border-t border-purple-200 dark:border-purple-700">
                      <button
                        onClick={() => onViewGroupProfile(viewingReservation.booking_group_id!)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        View Group Profile
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Room Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                  Room Details ({viewingReservation.rooms.length} {viewingReservation.rooms.length === 1 ? 'room' : 'rooms'})
                </h3>
                <div className="space-y-3">
                  {viewingReservation.rooms.map((room, index) => {
                    const roomTypeName = roomTypes.find(rt => rt.id === room.roomType)?.name || availableRoomTypes.find(rt => rt.id === room.roomType)?.name || room.roomType;
                    return (
                    <div key={index} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 border-l-4 border-blue-400">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{roomTypeName}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {room.adults} adults, {room.children} children
                          </p>
                          {room.roomNumber ? (
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Room #{room.roomNumber}</p>
                          ) : (
                            <p className="text-sm text-gray-400 dark:text-gray-500 italic">Auto-assign</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">${room.amount}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ${(room.amount / Math.max(viewingReservation.nights, 1)).toFixed(2)}/night
                        </p>
                      </div>
                    </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-blue-700 dark:text-blue-400">Total Adults</label>
                    <p className="font-medium text-blue-900 dark:text-blue-300">{viewingReservation.totalAdults}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-700 dark:text-blue-400">Total Children</label>
                    <p className="font-medium text-blue-900 dark:text-blue-300">{viewingReservation.totalChildren}</p>
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Check-in Date</label>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.checkIn}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Check-out Date</label>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.checkOut}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Length of Stay</label>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.nights} nights</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Reservation Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[viewingReservation.status] || 'bg-gray-100 text-gray-700'}`}>
                    {viewingReservation.status.replace('-', ' ')}
                  </span>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3">Financial Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Total Amount</label>
                    <p className="font-medium text-green-900 dark:text-green-300">${viewingReservation.totalAmount}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Deposit</label>
                    <p className="font-medium text-green-900 dark:text-green-300">${viewingReservation.deposit || 0}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Balance</label>
                    <p className={`font-medium ${viewingReservation.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${viewingReservation.balance}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Nightly Rate</label>
                    <p className="font-medium text-green-900 dark:text-green-300">${viewingReservation.rate || (viewingReservation.nights > 0 ? (viewingReservation.totalAmount / viewingReservation.nights).toFixed(2) : '0.00')}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Payment Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      viewingReservation.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                      viewingReservation.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {viewingReservation.paymentStatus || 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Source & Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Booking Source</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">{sourceIcons[viewingReservation.source]}</span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {viewingReservation.source.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Created By</label>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.createdBy || '—'}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Created At</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {viewingReservation.createdAt ? new Date(viewingReservation.createdAt).toLocaleString() : '—'}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Last Updated</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {viewingReservation.createdAt ? new Date(viewingReservation.createdAt).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setViewingReservation(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setViewingReservation(null);
                  setEditingReservation(viewingReservation);
                  setIsEditMode(true);
                  // Populate form with existing data
                  setNewReservationRoomTypes(convertToRoomTypeSelections(viewingReservation.rooms));
                  setNewReservationForm({
                    guestName: viewingReservation.guestName,
                    guestEmail: '',
                    guestPhone: '',
                    guestStatus: 'Regular',
                    nationality: '',
                    checkInDate: viewingReservation.checkIn,
                    checkOutDate: viewingReservation.checkOut,
                    source: viewingReservation.source,
                    groupName: viewingReservation.groupName || '',
                    primaryContact: viewingReservation.primaryContact || '',
                    travelAgency: viewingReservation.travelAgency || '',
                    corporation: viewingReservation.corporation || '',
                    depositAmount: viewingReservation.deposit || 0,
                    isDepositPaid: (viewingReservation.deposit || 0) > 0,
                    paymentStatus: viewingReservation.paymentStatus || 'Unpaid',
                    notes: ''
                  });
                  setBookingType(viewingReservation.groupName ? 'group' : 'individual');
                  setFormErrors({});
                  setShowNewReservationModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Management Modal */}
      {showRoomManagementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Rooms</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Add or remove rooms from reservation {managingReservationId}</p>
            </div>
            <div className="p-6">
              {/* Group Booking Fields - shown when multiple rooms */}
              {managingRoomTypes.reduce((sum, sel) => sum + sel.quantity, 0) > 1 && (
                <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h3 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-3">Group Booking Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
                      <input 
                        type="text" 
                        value={managingGroupFields.groupName}
                        onChange={(e) => setManagingGroupFields({...managingGroupFields, groupName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="e.g., Smith Family Reunion"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Contact</label>
                      <input 
                        type="text" 
                        value={managingGroupFields.primaryContact}
                        onChange={(e) => setManagingGroupFields({...managingGroupFields, primaryContact: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Name and phone/email"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Agency</label>
                      <input 
                        type="text" 
                        value={managingGroupFields.travelAgency}
                        onChange={(e) => setManagingGroupFields({...managingGroupFields, travelAgency: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Agency name (if applicable)"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Corporation</label>
                      <input 
                        type="text" 
                        value={managingGroupFields.corporation}
                        onChange={(e) => setManagingGroupFields({...managingGroupFields, corporation: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Company name (if applicable)"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Types & Quantities</label>
                  {managingRoomTypes.some(s => s.quantity > 1) && (
                    <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={managePerRoomOccupancyEnabled}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          setManagePerRoomOccupancyEnabled(enabled);
                          if (!enabled) {
                            setManagingRoomTypes(prev => prev.map(sel => ({
                              ...sel,
                              occupancies: Array.from({ length: sel.quantity }, () => ({ adults: sel.adultsPerRoom, children: sel.childrenPerRoom }))
                            })));
                          }
                        }}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      Set different occupancy per room
                    </label>
                  )}
                </div>
                <button
                  onClick={() => setManagingRoomTypes([...managingRoomTypes, { roomType: '', quantity: 1, adultsPerRoom: 1, childrenPerRoom: 0, amountPerRoom: 0, occupancies: [{ adults: 1, children: 0 }] }])}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Add Room Type
                </button>
              </div>
              
              <div className="space-y-3">
                {managingRoomTypes.map((selection, index) => (
                  <div key={index} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/50">
                    <div className="grid grid-cols-5 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
                        <select 
                          value={selection.roomType}
                          onChange={(e) => {
                            const updated = [...managingRoomTypes];
                            const roomType = e.target.value;
                            const roomTypeInfo = availableRoomTypes.find(rt => rt.id === roomType);
                            updated[index].roomType = roomType;
                            updated[index].amountPerRoom = roomTypeInfo?.baseRate || selection.amountPerRoom;
                            updated[index].adultsPerRoom = Math.min(selection.adultsPerRoom, roomTypeInfo?.maxOccupancy || 2);
                            setManagingRoomTypes(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="">Select type</option>
                          {availableRoomTypes.map(rt => (
                            <option key={rt.id} value={rt.id}>{rt.name} (${rt.baseRate}/night)</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                        <input 
                          type="number" 
                          min="1"
                          value={selection.quantity}
                          onChange={(e) => {
                            const updated = [...managingRoomTypes];
                            const newQty = Math.max(1, parseInt(e.target.value) || 1);
                            updated[index].quantity = newQty;
                            // Sync occupancies array
                            const curOccs = updated[index].occupancies || [];
                            updated[index].occupancies = Array.from({ length: newQty }, (_, i) =>
                              curOccs[i] || { adults: updated[index].adultsPerRoom, children: updated[index].childrenPerRoom }
                            );
                            setManagingRoomTypes(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Adults/Room</label>
                        <input 
                          type="number" 
                          min="1"
                          value={selection.adultsPerRoom}
                          onChange={(e) => {
                            const updated = [...managingRoomTypes];
                            updated[index].adultsPerRoom = parseInt(e.target.value) || 1;
                            setManagingRoomTypes(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Children/Room</label>
                        <input 
                          type="number" 
                          min="0"
                          value={selection.childrenPerRoom}
                          onChange={(e) => {
                            const updated = [...managingRoomTypes];
                            updated[index].childrenPerRoom = parseInt(e.target.value) || 0;
                            setManagingRoomTypes(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rate/Room</label>
                        <input 
                          type="number" 
                          min="0" 
                          step="0.01"
                          value={selection.amountPerRoom}
                          onChange={(e) => {
                            const updated = [...managingRoomTypes];
                            updated[index].amountPerRoom = parseFloat(e.target.value) || 0;
                            setManagingRoomTypes(updated);
                          }}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                    {/* Per-room occupancy editor (optional, shown when enabled and qty > 1) */}
                    {managePerRoomOccupancyEnabled && selection.quantity > 1 && selection.roomType && (
                      <div className="mt-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                          <Users size={12} /> Occupancy per room
                          <span className="text-gray-400 font-normal ml-1">(adjust individually if needed)</span>
                        </p>
                        <div className="space-y-1.5">
                          {(selection.occupancies || []).map((occ, occIdx) => {
                            const rtInfo = availableRoomTypes.find(rt => rt.id === selection.roomType);
                            const maxOcc = rtInfo?.maxOccupancy || 4;
                            return (
                              <div key={occIdx} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5">
                                <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 shrink-0 w-16">Room {occIdx + 1}</span>
                                <div className="flex items-center gap-4">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 w-7">Adults</span>
                                    <button type="button" onClick={() => { const u = [...managingRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], adults: Math.max(1, occ.adults - 1) }; u[index].occupancies = o; setManagingRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">−</button>
                                    <span className="w-6 text-center text-xs font-semibold text-gray-900 dark:text-white">{occ.adults}</span>
                                    <button type="button" onClick={() => { const u = [...managingRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], adults: Math.min(maxOcc, occ.adults + 1) }; u[index].occupancies = o; setManagingRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">+</button>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-gray-400 w-8">Children</span>
                                    <button type="button" onClick={() => { const u = [...managingRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], children: Math.max(0, occ.children - 1) }; u[index].occupancies = o; setManagingRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">−</button>
                                    <span className="w-6 text-center text-xs font-semibold text-gray-900 dark:text-white">{occ.children}</span>
                                    <button type="button" onClick={() => { const u = [...managingRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], children: Math.min(maxOcc, occ.children + 1) }; u[index].occupancies = o; setManagingRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">+</button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {managingRoomTypes.length > 1 && (
                      <button
                        onClick={() => {
                          const updated = managingRoomTypes.filter((_, i) => i !== index);
                          setManagingRoomTypes(updated);
                        }}
                        className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Remove Room Type
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">Total Rooms:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {managingRoomTypes.reduce((sum, sel) => sum + sel.quantity, 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-700 dark:text-gray-300">Total Adults:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {managingRoomTypes.reduce((sum, sel) => sum + (managePerRoomOccupancyEnabled ? (sel.occupancies || []).reduce((s, o) => s + o.adults, 0) : sel.adultsPerRoom * sel.quantity), 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-700 dark:text-gray-300">Total Children:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {managingRoomTypes.reduce((sum, sel) => sum + (managePerRoomOccupancyEnabled ? (sel.occupancies || []).reduce((s, o) => s + o.children, 0) : sel.childrenPerRoom * sel.quantity), 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-700 dark:text-gray-300">Total Amount:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${managingRoomTypes.reduce((sum, sel) => sum + (sel.amountPerRoom * sel.quantity), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowRoomManagementModal(false);
                  setManagingReservationId(null);
                  setManagingRooms([]);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={async () => {
                  try {
                    // Validate group fields if multiple rooms
                    const totalRooms = managingRoomTypes.reduce((sum, sel) => sum + sel.quantity, 0);
                    if (totalRooms > 1) {
                      if (!managingGroupFields.groupName) {
                        alert('Group name is required for multi-room reservations');
                        return;
                      }
                      if (!managingGroupFields.primaryContact) {
                        alert('Primary contact is required for multi-room reservations');
                        return;
                      }
                    }

                    // Convert room type selections to individual room reservations
                    const rooms = convertToRoomReservations(managingRoomTypes);

                    // Auto-assign rooms for any that don't have a specific room selected
                    const managingRes = reservations.find(r => r.id === managingReservationId);
                    if (managingRes) {
                      // Seed the exclusion set with rooms booked in the DB for the
                      // stay dates so stale in-memory state can't cause double-booking.
                      const autoAssigned = new Set<string>();
                      if (supabase) {
                        const { data: overlapping } = await supabase
                          .from('reservations')
                          .select('id, room_number')
                          .not('room_number', 'is', null)
                          .in('status', ['Confirmed', 'CheckedIn'])
                          .lt('check_in_date', managingRes.checkOut)
                          .gt('check_out_date', managingRes.checkIn);
                        for (const r of (overlapping || [])) {
                          if (r.id !== managingReservationId && r.room_number) autoAssigned.add(String(r.room_number));
                        }
                      }
                      const overlapReservations = reservations
                        .filter(r => r.id !== managingReservationId)
                        .map(r => ({
                          id: r.id,
                          roomType: roomTypes.find(rt => rt.id === r.rooms[0]?.roomType)?.name || r.rooms[0]?.roomType || '',
                          roomNumber: r.rooms[0]?.roomNumber,
                          checkInDate: r.checkIn,
                          checkOutDate: r.checkOut,
                          status: r.status === 'checked-in' ? 'CheckedIn' : r.status === 'confirmed' ? 'Confirmed' : 'Waitlisted',
                        })) as any;
                      for (const room of rooms) {
                        if (room.roomNumber && room.roomNumber.trim() !== '') {
                          autoAssigned.add(room.roomNumber);
                          continue;
                        }
                        const roomTypeName = roomTypes.find(rt => rt.id === room.roomType)?.name || room.roomType;
                        const assigned = findAvailableRoomForType(
                          roomTypeName,
                          managingRes.checkIn,
                          managingRes.checkOut,
                          allRooms,
                          overlapReservations,
                          autoAssigned
                        );
                        if (assigned) {
                          room.roomNumber = assigned;
                          autoAssigned.add(assigned);
                        }
                      }
                    }

                    const response = await fetch(`/api/front-office/reservations/${managingReservationId}/rooms`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ 
                        rooms: rooms,
                        groupFields: totalRooms > 1 ? managingGroupFields : null
                      })
                    });
                    
                    if (!response.ok) {
                      const errData = await response.json().catch(() => ({}));
                      throw new Error(errData.error || 'Failed to update rooms');
                    }
                    
                    // Refresh reservations
                    const params = new URLSearchParams();
                    if (searchTerm) params.append('search', searchTerm);
                    if (sourceFilter) params.append('source', sourceFilter);
                    if (statusFilter) params.append('status', statusFilter);

                    const reservationsResponse = await fetch(`/api/front-office/reservations?${params.toString()}`);
                    if (reservationsResponse.ok) {
                      const data = await reservationsResponse.json();
                      const transformedReservations = (data.reservations || []).map((res: any) => ({
                        ...res,
                        rooms: res.rooms || [{
                          roomType: res.roomType || 'Standard',
                          roomNumber: res.roomNumber,
                          adults: res.adults || 1,
                          children: res.children || 0,
                          amount: res.totalAmount || 0
                        }],
                        totalAdults: res.totalAdults || res.adults || 1,
                        totalChildren: res.totalChildren || res.children || 0,
                        booking_group_id: res.booking_group_id,
                        groupName: res.groupName,
                        primaryContact: res.primaryContact,
                        travelAgency: res.travelAgency,
                        corporation: res.corporation
                      }));
                      setReservations(transformedReservations);
                    }
                    
                    setShowRoomManagementModal(false);
                    setManagingReservationId(null);
                    setManagingRoomTypes([]);
                    setManagingGroupFields({
                      groupName: '',
                      primaryContact: '',
                      travelAgency: '',
                      corporation: ''
                    });
                  } catch (error: any) {
                    console.error('Error updating rooms:', error);
                    alert(error?.message || 'Failed to update rooms. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Rooms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Reservation Modal */}
      {showNewReservationModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto ring-1 ring-black/5">
            {/* Modal Header with gradient accent */}
            <div className="relative px-6 py-5 border-b border-gray-200 dark:border-slate-700">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-t-2xl" />
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30">
                  <CalendarCheck size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isEditMode ? 'Edit Reservation' : 'New Reservation'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {isEditMode ? `Editing ${editingReservation?.id}` : 'Create a new reservation'}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <form className="space-y-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:divide-x lg:divide-gray-200 dark:lg:divide-slate-700">
                {/* Left Column: Guest + Dates + Source */}
                <div className="space-y-5 lg:pr-6">
                {/* Conditional section: Group Info for group bookings, Guest Info for individual */}
                {newReservationRoomTypes.reduce((sum, sel) => sum + sel.quantity, 0) > 1 ? (
                  /* Group Booking Information */
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-3">
                      <Users2 size={16} className="text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-100">Group Booking Information</h3>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name *</label>
                        <input 
                          type="text" 
                          value={newReservationForm.groupName}
                          onChange={(e) => setNewReservationForm({...newReservationForm, groupName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                          placeholder="e.g., Smith Family Reunion" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Primary Contact Name *</label>
                          <input 
                            type="text" 
                            value={newReservationForm.primaryContact}
                            onChange={(e) => setNewReservationForm({...newReservationForm, primaryContact: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            placeholder="Contact person name" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                          <input 
                            type="tel" 
                            value={newReservationForm.guestPhone || ''}
                            onChange={(e) => setNewReservationForm({...newReservationForm, guestPhone: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            placeholder="+251911234567" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                          <input 
                            type="email" 
                            value={newReservationForm.guestEmail || ''}
                            onChange={(e) => setNewReservationForm({...newReservationForm, guestEmail: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            placeholder="group@example.com" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Agency</label>
                          <input 
                            type="text" 
                            value={newReservationForm.travelAgency}
                            onChange={(e) => setNewReservationForm({...newReservationForm, travelAgency: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                            placeholder="Agency name (if applicable)" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Corporation / Company</label>
                        <input 
                          type="text" 
                          value={newReservationForm.corporation}
                          onChange={(e) => setNewReservationForm({...newReservationForm, corporation: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500" 
                          placeholder="Company name (if applicable)" 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Individual Guest Information */
                  <>
                    {/* Section: Guest Details */}
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                      <User size={14} /> Guest Details
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Guest Name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input 
                          type="text" 
                          value={isEditMode && editingReservation ? editingReservation.guestName : newReservationForm.guestName}
                          onChange={(e) => setNewReservationForm({...newReservationForm, guestName: e.target.value})}
                          className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${formErrors.guestName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'}`} 
                          placeholder="Enter guest name" 
                        />
                      </div>
                      {formErrors.guestName && <p className="text-xs text-red-500 mt-1">{formErrors.guestName}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Guest Email</label>
                        <div className="relative">
                          <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input 
                            type="email" 
                            value={newReservationForm.guestEmail || ''}
                            onChange={(e) => setNewReservationForm({...newReservationForm, guestEmail: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all" 
                            placeholder="guest@example.com" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Guest Phone</label>
                        <div className="relative">
                          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <input 
                            type="tel" 
                            value={newReservationForm.guestPhone || ''}
                            onChange={(e) => setNewReservationForm({...newReservationForm, guestPhone: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all" 
                            placeholder="+251911234567" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Group auto-suggest: if the entered email matches an existing
                        guest with active group memberships, offer to attach this
                        reservation to one of those groups. */}
                    {bookingType === 'individual' && (newReservationForm.guestEmail || '').trim() && (
                      <div>
                        {suggestedGroupsLoading ? (
                          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                            Checking for known group affiliations…
                          </div>
                        ) : suggestedGroups.length > 0 ? (
                          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <div className="flex items-center gap-2 mb-2 text-sm font-medium text-blue-900 dark:text-blue-100">
                              <Sparkles size={14} className="text-blue-600" />
                              This guest is a member of {suggestedGroups.length} group{suggestedGroups.length === 1 ? '' : 's'}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {suggestedGroups.map((g: any) => (
                                <button
                                  type="button"
                                  key={g.group_id}
                                  onClick={() => setSelectedSuggestedGroupId(selectedSuggestedGroupId === g.group_id ? null : g.group_id)}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                                    selectedSuggestedGroupId === g.group_id
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                  }`}
                                >
                                  <Building2 size={12} />
                                  {g.group_name}
                                  {g.is_primary_contact && <Star size={10} className="ml-0.5" />}
                                </button>
                              ))}
                            </div>
                            {selectedSuggestedGroupId && (
                              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                                This reservation will be linked to the selected group on creation.
                              </p>
                            )}
                          </div>
                        ) : matchedGuestId ? (
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400">
                            <User size={14} />
                            Existing guest recognized — no active group memberships on file.
                          </div>
                        ) : null}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Guest Status</label>
                        <select 
                          value={newReservationForm.guestStatus || 'Regular'}
                          onChange={(e) => setNewReservationForm({...newReservationForm, guestStatus: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                        >
                          <option value="Regular">Regular</option>
                          <option value="VIP">VIP</option>
                          <option value="Loyalty Member">Loyalty Member</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nationality</label>
                        <div className="relative">
                          <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                          <select 
                            value={newReservationForm.nationality || ''}
                            onChange={(e) => setNewReservationForm({...newReservationForm, nationality: e.target.value})}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none"
                          >
                            <option value="">Select country...</option>
                            {['Ethiopia','Kenya','Djibouti','Sudan','Eritrea','Somalia','South Sudan','Rwanda','Uganda','Tanzania','Ghana','Nigeria','South Africa','Morocco','Egypt','United States','United Kingdom','Germany','France','Italy','Spain','Netherlands','China','India','Japan','South Korea','Singapore','Thailand','Indonesia','UAE','Saudi Arabia','Turkey','Russia','Brazil','Canada','Australia'].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {/* Section: Stay Dates */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-2">
                  <Calendar size={14} /> Stay Dates
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Check-in</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                      <input 
                        type="date" 
                        value={isEditMode && editingReservation ? editingReservation.checkIn : newReservationForm.checkInDate}
                        onChange={(e) => setNewReservationForm({...newReservationForm, checkInDate: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${formErrors.checkInDate ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'}`} 
                      />
                    </div>
                    {formErrors.checkInDate ? (
                      <p className="text-xs text-red-500 mt-1">{formErrors.checkInDate}</p>
                    ) : newReservationForm.checkInDate ? (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(newReservationForm.checkInDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Check-out</label>
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                      <input 
                        type="date" 
                        value={isEditMode && editingReservation ? editingReservation.checkOut : newReservationForm.checkOutDate}
                        onChange={(e) => setNewReservationForm({...newReservationForm, checkOutDate: e.target.value})}
                        className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all ${formErrors.checkOutDate ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'}`} 
                      />
                    </div>
                    {formErrors.checkOutDate ? (
                      <p className="text-xs text-red-500 mt-1">{formErrors.checkOutDate}</p>
                    ) : newReservationForm.checkOutDate ? (
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(newReservationForm.checkOutDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </p>
                    ) : null}
                  </div>
                </div>
                {/* Quick Date Presets */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-gray-400 flex items-center gap-1"><Clock size={12} /> Quick:</span>
                  {[
                    { label: 'Tonight', ci: new Date().toISOString().split('T')[0], co: (() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; })() },
                    { label: 'Weekend', ci: (() => { const d = new Date(); const diff = (5 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff); return d.toISOString().split('T')[0]; })(), co: (() => { const d = new Date(); const diff = (5 - d.getDay() + 7) % 7 || 7; d.setDate(d.getDate() + diff + 2); return d.toISOString().split('T')[0]; })() },
                    { label: '1 Week', ci: new Date().toISOString().split('T')[0], co: (() => { const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString().split('T')[0]; })() },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setNewReservationForm({...newReservationForm, checkInDate: preset.ci, checkOutDate: preset.co})}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition border border-transparent hover:border-blue-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                  {newReservationForm.checkInDate && newReservationForm.checkOutDate && (() => {
                    const n = Math.round((new Date(newReservationForm.checkOutDate + 'T00:00:00').getTime() - new Date(newReservationForm.checkInDate + 'T00:00:00').getTime()) / 86400000);
                    return n > 0 ? (
                      <span className="ml-auto px-2.5 py-1 text-xs font-bold rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                        {n} Night{n !== 1 ? 's' : ''}
                      </span>
                    ) : null;
                  })()}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Source</label>
                  <div className="relative">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                    <select 
                      value={newReservationForm.source}
                      onChange={(e) => setNewReservationForm({...newReservationForm, source: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all appearance-none"
                    >
                      <option value="website">Website</option>
                      <option value="walk-in">Walk-In</option>
                      <option value="ota">OTA</option>
                      <option value="corporate">Corporate</option>
                      <option value="travel-agent">Travel Agent</option>
                      <option value="group">Group</option>
                      <option value="call-center">Call Center</option>
                      <option value="mobile-app">Mobile App</option>
                    </select>
                  </div>
                </div>
                
                {/* Section: Payment & Notes */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-2">
                  <DollarSign size={14} /> Payment & Notes
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deposit Amount</label>
                    <div className="relative">
                      <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
                      <input 
                        type="number" 
                        min="0"
                        step="0.01"
                        value={newReservationForm.depositAmount || 0}
                        onChange={(e) => setNewReservationForm({...newReservationForm, depositAmount: parseFloat(e.target.value) || 0})}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Payment Status</label>
                    <select 
                      value={newReservationForm.paymentStatus || 'Unpaid'}
                      onChange={(e) => setNewReservationForm({...newReservationForm, paymentStatus: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={newReservationForm.isDepositPaid || false}
                      onChange={(e) => setNewReservationForm({...newReservationForm, isDepositPaid: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Deposit paid</span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                  <textarea 
                    value={newReservationForm.notes || ''}
                    onChange={(e) => setNewReservationForm({...newReservationForm, notes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                    placeholder="Special requests, dietary restrictions, or other notes..."
                  />
                </div>
                </div>
                {/* Right Column: Rooms + Totals */}
                <div className="space-y-5 lg:pl-6">
                {/* Section: Rooms */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 pt-2">
                  <BedDouble size={14} /> Room Selection
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Room Types & Quantities
                      <span className="ml-2 text-xs text-gray-400">
                        ({newReservationRoomTypes.reduce((s, sel) => s + sel.quantity, 0)} rooms selected)
                      </span>
                    </label>
                    {formErrors.roomTypes && <p className="text-xs text-red-500 mt-1">{formErrors.roomTypes}</p>}
                    <div className="flex items-center gap-3">
                      {newReservationRoomTypes.some(s => s.quantity > 1) && (
                        <label className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={perRoomOccupancyEnabled}
                            onChange={(e) => {
                            const enabled = e.target.checked;
                            setPerRoomOccupancyEnabled(enabled);
                            if (!enabled) {
                              setNewReservationRoomTypes(prev => prev.map(sel => ({
                                ...sel,
                                occupancies: Array.from({ length: sel.quantity }, () => ({ adults: sel.adultsPerRoom, children: sel.childrenPerRoom }))
                              })));
                            }
                          }}
                            className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          Set different occupancy per room
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={() => setNewReservationRoomTypes([...newReservationRoomTypes, { roomType: '', quantity: 1, adultsPerRoom: 1, childrenPerRoom: 0, amountPerRoom: 0, occupancies: [{ adults: 1, children: 0 }] }])}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Plus size={14} /> Add Room Type
                    </button>
                    </div>
                  </div>
                  {roomTypes.length === 0 && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-700 dark:text-amber-300">
                      ⚠ No room types loaded. Please check your database connection or add room types in the system.
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {newReservationRoomTypes.map((selection, index) => {
                      const roomTypeInfo = roomTypes.find(rt => rt.id === selection.roomType);
                      const availableForType = selection.roomType
                        ? availableRooms.filter(room =>
                            room.type === roomTypeInfo?.name &&
                            !bookedRoomNumbers.has(String(room.number))
                          )
                        : [];
                      const selectedRoomNumbers = selection.roomNumbers || [];
                      const selectedCount = selectedRoomNumbers.length;
                      const maxSelectable = selection.quantity;

                      return (
                      <div key={index} className="p-4 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-900/50 shadow-sm">
                        {/* Header row with room type selector and remove button */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                              {index + 1}
                            </span>
                            <select 
                              value={selection.roomType}
                              onChange={(e) => {
                                const updated = [...newReservationRoomTypes];
                                const roomType = e.target.value;
                                const rtInfo = roomTypes.find(rt => rt.id === roomType);
                                updated[index].roomType = roomType;
                                updated[index].amountPerRoom = parseFloat(rtInfo?.base_price) || 0;
                                updated[index].adultsPerRoom = Math.min(selection.adultsPerRoom, rtInfo?.max_occupancy || 2);
                                updated[index].roomNumbers = [];
                                setNewReservationRoomTypes(updated);
                              }}
                              className="px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            >
                              <option value="">Select room type</option>
                              {roomTypes.length === 0 ? (
                                <option value="" disabled>Loading room types...</option>
                              ) : (
                                roomTypes.map(rt => (
                                  <option key={rt.id} value={rt.id}>{rt.name} (${rt.base_price}/night, max {rt.max_occupancy})</option>
                                ))
                              )}
                            </select>
                          </div>
                          {newReservationRoomTypes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = newReservationRoomTypes.filter((_, i) => i !== index);
                                setNewReservationRoomTypes(updated);
                              }}
                              className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>

                        {/* Room type info badge */}
                        {selection.roomType && roomTypeInfo && (
                          <div className="mb-3 p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex flex-wrap gap-x-4 gap-y-1">
                            <span className="flex items-center gap-1"><DollarSign size={12} /> ${roomTypeInfo.base_price}/night</span>
                            <span className="flex items-center gap-1"><Users size={12} /> Max {roomTypeInfo.max_occupancy}</span>
                            <span className="flex items-center gap-1"><BedDouble size={12} /> {availableForType.length} available</span>
                            {roomTypeInfo.bed_configuration && (
                              <span className="flex items-center gap-1"><BedDouble size={12} /> {roomTypeInfo.bed_configuration}</span>
                            )}
                            {roomTypeInfo.room_size_sqft > 0 && (
                              <span className="flex items-center gap-1"><MapPin size={12} /> {roomTypeInfo.room_size_sqft}ft²</span>
                            )}
                          </div>
                        )}

                        {/* Quantity and guests in a clean 4-col grid */}
                        <div className="grid grid-cols-4 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Quantity</label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newReservationRoomTypes];
                                  const newQty = Math.max(1, selection.quantity - 1);
                                  updated[index].quantity = newQty;
                                  // Trim selected rooms if exceeding new quantity
                                  if ((updated[index].roomNumbers || []).length > newQty) {
                                    updated[index].roomNumbers = (updated[index].roomNumbers || []).slice(0, newQty);
                                  }
                                  // Sync occupancies array
                                  const curOccs = updated[index].occupancies || [];
                                  updated[index].occupancies = Array.from({ length: newQty }, (_, i) =>
                                    curOccs[i] || { adults: updated[index].adultsPerRoom, children: updated[index].childrenPerRoom }
                                  );
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-l-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                              >−</button>
                              <input 
                                type="number" 
                                min="1"
                                value={selection.quantity}
                                onChange={(e) => {
                                  const updated = [...newReservationRoomTypes];
                                  const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                  updated[index].quantity = newQty;
                                  if ((updated[index].roomNumbers || []).length > newQty) {
                                    updated[index].roomNumbers = (updated[index].roomNumbers || []).slice(0, newQty);
                                  }
                                  // Sync occupancies array
                                  const curOccs = updated[index].occupancies || [];
                                  updated[index].occupancies = Array.from({ length: newQty }, (_, i) =>
                                    curOccs[i] || { adults: updated[index].adultsPerRoom, children: updated[index].childrenPerRoom }
                                  );
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-12 text-center px-1 py-2 border-y border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newReservationRoomTypes];
                                  const newQty = selection.quantity + 1;
                                  updated[index].quantity = newQty;
                                  // Sync occupancies array
                                  const curOccs = updated[index].occupancies || [];
                                  updated[index].occupancies = Array.from({ length: newQty }, (_, i) =>
                                    curOccs[i] || { adults: updated[index].adultsPerRoom, children: updated[index].childrenPerRoom }
                                  );
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-r-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                              >+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Adults/Room</label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newReservationRoomTypes];
                                  updated[index].adultsPerRoom = Math.max(1, selection.adultsPerRoom - 1);
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-l-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                              >−</button>
                              <input 
                                type="number" 
                                min="1"
                                max={roomTypeInfo?.max_occupancy || 4}
                                value={selection.adultsPerRoom}
                                onChange={(e) => {
                                  const updated = [...newReservationRoomTypes];
                                  updated[index].adultsPerRoom = Math.max(1, parseInt(e.target.value) || 1);
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-12 text-center px-1 py-2 border-y border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newReservationRoomTypes];
                                  const maxOcc = roomTypeInfo?.max_occupancy || 4;
                                  updated[index].adultsPerRoom = Math.min(maxOcc, selection.adultsPerRoom + 1);
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-r-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                              >+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Children/Room</label>
                            <div className="flex items-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newReservationRoomTypes];
                                  updated[index].childrenPerRoom = Math.max(0, selection.childrenPerRoom - 1);
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-l-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                              >−</button>
                              <input 
                                type="number" 
                                min="0"
                                value={selection.childrenPerRoom}
                                onChange={(e) => {
                                  const updated = [...newReservationRoomTypes];
                                  updated[index].childrenPerRoom = Math.max(0, parseInt(e.target.value) || 0);
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-12 text-center px-1 py-2 border-y border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newReservationRoomTypes];
                                  updated[index].childrenPerRoom = selection.childrenPerRoom + 1;
                                  setNewReservationRoomTypes(updated);
                                }}
                                className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded-r-lg hover:bg-gray-300 dark:hover:bg-slate-600"
                              >+</button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Rate/Room ($)</label>
                            <input 
                              type="number" 
                              min="0" 
                              step="0.01"
                              value={selection.amountPerRoom}
                              onChange={(e) => {
                                const updated = [...newReservationRoomTypes];
                                updated[index].amountPerRoom = parseFloat(e.target.value) || 0;
                                setNewReservationRoomTypes(updated);
                              }}
                              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>

                        {/* Per-room occupancy editor (optional, shown when enabled and qty > 1) */}
                        {perRoomOccupancyEnabled && selection.quantity > 1 && selection.roomType && (
                          <div className="mb-3 p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center gap-1">
                              <Users size={12} /> Occupancy per room
                              <span className="text-gray-400 font-normal ml-1">(adjust individually if needed)</span>
                            </p>
                            <div className="space-y-1.5">
                              {(selection.occupancies || []).map((occ, occIdx) => {
                                const maxOcc = roomTypeInfo?.max_occupancy || 4;
                                return (
                                  <div key={occIdx} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-800 rounded-lg px-3 py-1.5">
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 shrink-0 w-16">Room {occIdx + 1}</span>
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-gray-400 w-7">Adults</span>
                                        <button type="button" onClick={() => { const u = [...newReservationRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], adults: Math.max(1, occ.adults - 1) }; u[index].occupancies = o; setNewReservationRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">−</button>
                                        <span className="w-6 text-center text-xs font-semibold text-gray-900 dark:text-white">{occ.adults}</span>
                                        <button type="button" onClick={() => { const u = [...newReservationRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], adults: Math.min(maxOcc, occ.adults + 1) }; u[index].occupancies = o; setNewReservationRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">+</button>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className="text-[10px] text-gray-400 w-8">Children</span>
                                        <button type="button" onClick={() => { const u = [...newReservationRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], children: Math.max(0, occ.children - 1) }; u[index].occupancies = o; setNewReservationRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">−</button>
                                        <span className="w-6 text-center text-xs font-semibold text-gray-900 dark:text-white">{occ.children}</span>
                                        <button type="button" onClick={() => { const u = [...newReservationRoomTypes]; const o = [...(u[index].occupancies || [])]; o[occIdx] = { ...o[occIdx], children: Math.min(maxOcc, occ.children + 1) }; u[index].occupancies = o; setNewReservationRoomTypes(u); }} className="w-6 h-6 flex items-center justify-center bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-slate-600 text-xs">+</button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Room selection - multi-select clickable chips for available rooms */}
                        {selection.roomType && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                                Select Rooms
                                <span className="ml-2 text-gray-400">
                                  {selectedCount} of {maxSelectable} selected
                                  {selectedCount < maxSelectable && maxSelectable > 0 && (
                                    <span className="text-amber-500"> (select {maxSelectable - selectedCount} more)</span>
                                  )}
                                </span>
                              </label>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...newReservationRoomTypes];
                                  updated[index].roomNumbers = [];
                                  setNewReservationRoomTypes(updated);
                                }}
                                className={`text-xs ${selectedCount > 0 ? 'text-gray-500 hover:text-gray-700 dark:text-gray-400' : 'text-blue-600 dark:text-blue-400'} font-medium`}
                              >
                                {selectedCount > 0 ? '✕ Clear all' : '🔄 Auto-assign all'}
                              </button>
                            </div>
                            {availableForType.length === 0 ? (
                              <div className="text-xs text-amber-600 dark:text-amber-400 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                No vacant rooms available for this type. Rooms will be auto-assigned.
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap gap-2">
                                  {availableForType.map(room => {
                                    const isSelected = selectedRoomNumbers.includes(room.number);
                                    const isUsedElsewhere = newReservationRoomTypes.some((s, i) => i !== index && (s.roomNumbers || []).includes(room.number));
                                    const atMaxLimit = !isSelected && selectedCount >= maxSelectable;
                                    return (
                                      <button
                                        key={room.id}
                                        type="button"
                                        disabled={isUsedElsewhere || atMaxLimit}
                                        onClick={() => {
                                          const updated = [...newReservationRoomTypes];
                                          if (isSelected) {
                                            // Remove room
                                            updated[index].roomNumbers = selectedRoomNumbers.filter(n => n !== room.number);
                                          } else {
                                            // Add room (up to maxSelectable)
                                            updated[index].roomNumbers = [...selectedRoomNumbers, room.number];
                                          }
                                          setNewReservationRoomTypes(updated);
                                        }}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                                          isSelected
                                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                            : isUsedElsewhere
                                            ? 'bg-gray-100 dark:bg-slate-800 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed line-through'
                                            : atMaxLimit
                                            ? 'bg-gray-50 dark:bg-slate-900 text-gray-300 dark:text-gray-600 border-gray-200 dark:border-slate-700 cursor-not-allowed opacity-50'
                                            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                        }`}
                                      >
                                        #{room.number}
                                        <span className="ml-1 opacity-60">({room.status})</span>
                                      </button>
                                    );
                                  })}
                                </div>
                                {availableForType.length < maxSelectable && (
                                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                                    ⚠ Only {availableForType.length} room(s) available, but {maxSelectable} needed. Remaining will be auto-assigned.
                                  </div>
                                )}
                              </>
                            )}
                            {selectedCount > 0 && (
                              <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                                ✓ Selected: {selectedRoomNumbers.map(n => `#${n}`).join(', ')}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Subtotal for this room type */}
                        {selection.roomType && (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Subtotal: {selection.quantity} × ${selection.amountPerRoom.toFixed(2)}
                            </span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                              ${(selection.quantity * selection.amountPerRoom).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                  
                  {/* Totals */}
                  <div className={`mt-4 p-4 ${FO_STAT_GRADIENTS.primary} rounded-xl`}>
                    {/* Selected Rooms Summary */}
                    <div className="mb-3 pb-3 border-b border-white/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90 mb-2">
                        <Sparkles size={12} /> Booking Summary
                      </div>
                      <div className="space-y-1.5">
                        {newReservationRoomTypes.filter(sel => sel.roomType).map((sel, idx) => {
                          const roomTypeName = roomTypes.find(rt => rt.id === sel.roomType)?.name || availableRoomTypes.find(rt => rt.id === sel.roomType)?.name || sel.roomType;
                          return (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="text-white/90">
                                {roomTypeName} × {sel.quantity}
                                {(sel.roomNumbers || []).length > 0 && (
                                  <span className="text-white font-medium">
                                    {' '}(Rooms: {(sel.roomNumbers || []).map(n => `#${n}`).join(', ')})
                                  </span>
                                )}
                              </span>
                              <span className="text-white/80 font-medium">${(sel.amountPerRoom * sel.quantity).toFixed(0)}</span>
                            </div>
                          );
                        })}
                        {newReservationRoomTypes.filter(sel => sel.roomType).length === 0 && (
                          <div className="text-xs text-gray-400 italic">No rooms selected yet</div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-white/60 dark:bg-slate-800/40 rounded-lg">
                        <p className="text-xs text-gray-400">Rooms</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{newReservationRoomTypes.reduce((sum, sel) => sum + sel.quantity, 0)}</p>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-slate-800/40 rounded-lg">
                        <p className="text-xs text-gray-400">Adults</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{newReservationRoomTypes.reduce((sum, sel) => sum + (perRoomOccupancyEnabled ? (sel.occupancies || []).reduce((s, o) => s + o.adults, 0) : sel.adultsPerRoom * sel.quantity), 0)}</p>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-slate-800/40 rounded-lg">
                        <p className="text-xs text-gray-400">Children</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{newReservationRoomTypes.reduce((sum, sel) => sum + (perRoomOccupancyEnabled ? (sel.occupancies || []).reduce((s, o) => s + o.children, 0) : sel.childrenPerRoom * sel.quantity), 0)}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 dark:text-gray-300">Rate / night:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ${newReservationRoomTypes.reduce((sum, sel) => sum + (sel.amountPerRoom * sel.quantity), 0).toFixed(2)}
                      </span>
                    </div>
                    {newReservationForm.checkInDate && newReservationForm.checkOutDate && (() => {
                      const nights = Math.round((new Date(newReservationForm.checkOutDate + 'T00:00:00').getTime() - new Date(newReservationForm.checkInDate + 'T00:00:00').getTime()) / 86400000);
                      const totalAmount = newReservationRoomTypes.reduce((sum, sel) => sum + (sel.amountPerRoom * sel.quantity), 0);
                      return nights > 0 && totalAmount > 0 ? (
                        <div className="flex justify-between text-sm mt-2 pt-2 border-t border-blue-200/60 dark:border-blue-800/50">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Estimate ({nights} night{nights !== 1 ? 's' : ''}):</span>
                          <span className="text-lg font-black text-blue-700 dark:text-blue-300">
                            ${(totalAmount * nights).toFixed(2)}
                          </span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
                </div>
                </div>
              </form>
            </div>
            {/* Sticky Live Total Bar */}
            {(() => {
              const totalAmount = newReservationRoomTypes.reduce((sum, sel) => sum + (sel.amountPerRoom * sel.quantity), 0);
              const totalRooms = newReservationRoomTypes.reduce((sum, sel) => sum + sel.quantity, 0);
              const nights = newReservationForm.checkInDate && newReservationForm.checkOutDate
                ? Math.round((new Date(newReservationForm.checkOutDate + 'T00:00:00').getTime() - new Date(newReservationForm.checkInDate + 'T00:00:00').getTime()) / 86400000)
                : 0;
              const estimate = totalAmount * nights;
              return totalAmount > 0 ? (
                <div className="sticky bottom-0 z-10 px-6 py-3 bg-gradient-to-r from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/10 border-t border-gray-200 dark:border-slate-700 shadow-[0_-4px_12px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-gray-400">Rate / night</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">${totalAmount.toFixed(2)}</p>
                      </div>
                      {nights > 0 && (
                        <>
                          <div className="h-8 w-px bg-gray-200 dark:bg-slate-600" />
                          <div>
                            <p className="text-xs text-gray-400">Nights</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{nights}</p>
                          </div>
                          <div className="h-8 w-px bg-gray-200 dark:bg-slate-600" />
                          <div>
                            <p className="text-xs text-gray-400">Rooms</p>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{totalRooms}</p>
                          </div>
                        </>
                      )}
                    </div>
                    {nights > 0 && (
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Live Estimate</p>
                        <p className="text-xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">${estimate.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : null;
            })()}
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button 
                onClick={() => setShowNewReservationModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    // Validate form
                    const totalRooms = newReservationRoomTypes.reduce((sum, sel) => sum + sel.quantity, 0);
                    const isGroupBooking = totalRooms > 1;
                    const errors: Record<string, string> = {};

                    if (isGroupBooking) {
                      // Group booking validation
                      if (!newReservationForm.groupName) errors.groupName = 'Group name is required';
                      if (!newReservationForm.primaryContact) errors.primaryContact = 'Primary contact is required';
                      if (!newReservationForm.checkInDate) errors.checkInDate = 'Check-in date is required';
                      if (!newReservationForm.checkOutDate) errors.checkOutDate = 'Check-out date is required';
                    } else {
                      // Individual reservation validation
                      if (!newReservationForm.guestName) errors.guestName = 'Guest name is required';
                      if (!newReservationForm.checkInDate) errors.checkInDate = 'Check-in date is required';
                      if (!newReservationForm.checkOutDate) errors.checkOutDate = 'Check-out date is required';
                    }

                    // Date validation
                    if (newReservationForm.checkInDate && newReservationForm.checkOutDate) {
                      if (new Date(newReservationForm.checkOutDate) <= new Date(newReservationForm.checkInDate)) {
                        errors.checkOutDate = 'Check-out must be after check-in';
                      }
                    }

                    // Validate room types
                    if (newReservationRoomTypes.length === 0 || newReservationRoomTypes.some(sel => !sel.roomType)) {
                      errors.roomTypes = 'Please select at least one room type';
                    }

                    if (Object.keys(errors).length > 0) {
                      setFormErrors(errors);
                      return;
                    }
                    setFormErrors({});

                    // Convert room type selections to individual room reservations
                    const rooms = convertToRoomReservations(newReservationRoomTypes);

                    // Auto-assign rooms for any selections that don't have a specific room chosen.
                    // This mirrors the behavior of create_booking_atomic in the DB, which this
                    // direct-insert path bypasses. Only confirmed reservations consume physical
                    // inventory, so we auto-assign for all FrontOffice bookings (which are set
                    // to 'Confirmed' status on creation).
                    // Fetch CURRENT booked room numbers directly from the DB so
                    // neither auto-assignment nor manual selection can double-book
                    // a room (in-memory lists can be stale or filtered).
                    let dbBookedRooms = new Set<string>();
                    if (supabase) {
                      const { data: overlapping, error: overlapError } = await supabase
                        .from('reservations')
                        .select('id, room_number, guest_name')
                        .not('room_number', 'is', null)
                        .in('status', ['Confirmed', 'CheckedIn'])
                        .lt('check_in_date', newReservationForm.checkOutDate)
                        .gt('check_out_date', newReservationForm.checkInDate);
                      if (overlapError) {
                        setFormErrors({ roomTypes: `Could not verify room availability: ${overlapError.message}` });
                        return;
                      }
                      const excludeId = isEditMode && editingReservation ? editingReservation.id : null;
                      dbBookedRooms = new Set(
                        (overlapping || [])
                          .filter((r: any) => r.id !== excludeId)
                          .map((r: any) => String(r.room_number))
                      );
                    }

                    // Reject manually selected rooms that are already booked in the DB
                    const conflictingManual = rooms.filter(r =>
                      r.roomNumber && r.roomNumber.trim() !== '' && dbBookedRooms.has(String(r.roomNumber))
                    );
                    if (conflictingManual.length > 0) {
                      setFormErrors({
                        roomTypes: `Room #${conflictingManual.map(r => r.roomNumber).join(', #')} is already booked for the selected dates. Please choose different room(s).`
                      });
                      return;
                    }

                    const autoAssignedRoomNumbers = new Set<string>(dbBookedRooms);
                    // Map local Reservation shape to the shape findAvailableRoomForType expects
                    const overlapReservations = reservations.map(r => ({
                      id: r.id,
                      roomType: roomTypes.find(rt => rt.id === r.rooms[0]?.roomType)?.name || r.rooms[0]?.roomType || '',
                      roomNumber: r.rooms[0]?.roomNumber,
                      checkInDate: r.checkIn,
                      checkOutDate: r.checkOut,
                      status: r.status === 'checked-in' ? 'CheckedIn' : r.status === 'confirmed' ? 'Confirmed' : 'Waitlisted',
                    })) as any;
                    for (const room of rooms) {
                      if (room.roomNumber && room.roomNumber.trim() !== '') {
                        autoAssignedRoomNumbers.add(room.roomNumber);
                        continue;
                      }
                      // Resolve room type name from room type ID (selections store IDs)
                      const roomTypeName = roomTypes.find(rt => rt.id === room.roomType)?.name || room.roomType;
                      const assigned = findAvailableRoomForType(
                        roomTypeName,
                        newReservationForm.checkInDate,
                        newReservationForm.checkOutDate,
                        allRooms,
                        overlapReservations,
                        autoAssignedRoomNumbers
                      );
                      if (assigned) {
                        room.roomNumber = assigned;
                        autoAssignedRoomNumbers.add(assigned);
                      }
                    }

                    // Calculate totals
                    const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
                    const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
                    const totalAmount = rooms.reduce((sum, room) => sum + room.amount, 0);

                    // Use direct Supabase calls instead of API
                    if (!supabase) {
                      throw new Error('Supabase client not initialized');
                    }

                    if (isEditMode && editingReservation) {
                      // Update existing reservation
                      const { error: updateError } = await supabase
                        .from('reservations')
                        .update({
                          guest_name: isGroupBooking ? newReservationForm.groupName : newReservationForm.guestName,
                          guest_email: newReservationForm.guestEmail || 'guest@example.com',
                          guest_phone: newReservationForm.guestPhone || '',
                          guest_status: newReservationForm.guestStatus || 'Regular',
                          check_in_date: newReservationForm.checkInDate,
                          check_out_date: newReservationForm.checkOutDate,
                          channel: newReservationForm.source === 'walk-in' ? 'Walk-In' : newReservationForm.source === 'ota' ? 'Booking.com' : newReservationForm.source === 'corporate' ? 'Corporate' : 'Direct Website',
                          adults: totalAdults,
                          children: totalChildren,
                          total_amount: totalAmount,
                          room_type: roomTypes.find(rt => rt.id === rooms[0]?.roomType)?.name || 'Standard',
                          room_number: rooms[0]?.roomNumber || null,
                          notes: JSON.stringify({
                            guestName: isGroupBooking ? newReservationForm.primaryContact : newReservationForm.guestName,
                            guestEmail: newReservationForm.guestEmail,
                            guestPhone: newReservationForm.guestPhone,
                            guestStatus: newReservationForm.guestStatus,
                            nationality: newReservationForm.nationality,
                            groupName: isGroupBooking ? newReservationForm.groupName : null,
                            primaryContact: isGroupBooking ? newReservationForm.primaryContact : null,
                            travelAgency: isGroupBooking ? newReservationForm.travelAgency : null,
                            corporation: isGroupBooking ? newReservationForm.corporation : null
                          })
                        })
                        .eq('id', editingReservation.id);

                      if (updateError) {
                        console.error('Supabase update error:', updateError);
                        throw new Error(`Failed to update reservation: ${updateError.message}`);
                      }
                    } else {
                      // Create new reservation(s)
                      const nights = Math.ceil((new Date(newReservationForm.checkOutDate).getTime() - new Date(newReservationForm.checkInDate).getTime()) / (1000 * 60 * 60 * 24)) || 1;

                      // Get current user for created_by field
                      const createdBy = await getCurrentUserName();

                      // ── Create guest / group profiles FIRST ──────────────────────────
                      // We create profiles before the reservation so we can include the
                      // guest_id and group links in the initial INSERT, avoiding a
                      // separate UPDATE that was triggering a created_at column error.
                      const guestEmail = newReservationForm.guestEmail || 'guest@example.com';
                      const guestPhone = newReservationForm.guestPhone || '';
                      const guestNationality = newReservationForm.nationality || '';
                      const primaryContactName = isGroupBooking
                        ? (newReservationForm.primaryContact || newReservationForm.guestName)
                        : newReservationForm.guestName;

                      let groupId: string | null = null;
                      // Array to hold per-room guest IDs (one guest profile per room)
                      const roomGuestIds: string[] = [];

                      try {
                        if (isGroupBooking) {
                          // 1. Create group_booking record
                          groupId = 'GRP-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                          const firstRoomTypeName = roomTypes.find(rt => rt.id === rooms[0]?.roomType)?.name || 'Standard';
                          await supabase
                            .from('group_bookings')
                            .insert({
                              id: groupId,
                              group_name: newReservationForm.groupName,
                              contact_name: primaryContactName,
                              contact_email: guestEmail,
                              contact_phone: guestPhone,
                              room_type_needed: firstRoomTypeName,
                              room_count: totalRooms,
                              check_in_date: newReservationForm.checkInDate,
                              check_out_date: newReservationForm.checkOutDate,
                              discount_percent: 0,
                              status: 'Confirmed'
                            });

                          // 2. Create group_profile record with all required fields
                          await supabase
                            .from('group_profiles')
                            .insert({
                              id: groupId,
                              code: groupId,
                              name: newReservationForm.groupName,
                              type: 'GroupReservation',
                              status: 'Active',
                              contact_name: primaryContactName,
                              contact_email: guestEmail,
                              contact_phone: guestPhone,
                              organization_name: newReservationForm.travelAgency || null,
                              billing_address: {},
                              credit_limit: 0,
                              current_balance: 0,
                              payment_terms: 'Net 30',
                              discount_percent: 0,
                              commission_percent: 0,
                              total_revenue: 0,
                              total_room_nights: 0,
                              total_stays: 0,
                              average_daily_rate: 0,
                              total_rooms_used: 0,
                              preferences: {},
                              notes: `Group booking created from FrontOffice — ${totalRooms} rooms`
                            });

                          // 3. Create ONE guest profile PER ROOM, each linked to the
                          // group via the guest_group_relationships table (M:N).
                          // Members are named with a room-number suffix (e.g. "S1",
                          // "S2", "S3") so they show as real individual members on
                          // the group profile — not blank placeholders.
                          for (let i = 0; i < rooms.length; i++) {
                            const memberName = `${primaryContactName}${i + 1}`;
                            const memberEmail = i === 0
                              ? guestEmail
                              : `${guestEmail.split('@')[0]}${i + 1}@${guestEmail.split('@')[1] || 'example.com'}`;
                            const guestId = 'GST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                            const isPrimary = i === 0;

                            // Check if guest with this email already exists
                            const { data: existingGuest } = await supabase
                              .from('guests')
                              .select('id')
                              .eq('email', memberEmail)
                              .maybeSingle();

                            const actualGuestId = existingGuest?.id || guestId;
                            roomGuestIds.push(actualGuestId);

                            if (!existingGuest) {
                              await supabase
                                .from('guests')
                                .insert({
                                  id: guestId,
                                  name: memberName,
                                  email: memberEmail,
                                  phone: guestPhone,
                                  nationality: guestNationality,
                                  status: 'Regular',
                                  loyalty_points: 0,
                                  special_requests: '',
                                  notes: `Group booking: ${newReservationForm.groupName} — Member ${i + 1}${isPrimary ? ' (Primary contact)' : ''}`,
                                  total_spend: 0,
                                  parent_group_id: groupId,
                                  is_primary_contact: isPrimary,
                                  preferences: {},
                                  identification_doc: {}
                                });
                            } else {
                              // Link existing guest to the group
                              await supabase
                                .from('guests')
                                .update({
                                  parent_group_id: groupId,
                                  is_primary_contact: isPrimary
                                })
                                .eq('id', existingGuest.id);
                            }

                            // Link this member to the group via the M:N relationship
                            // table using the RPC (keeps parent_group_id and
                            // guest_group_relationships in sync).
                            try {
                              await fetch(`/api/group-profiles/${groupId}/link-guest`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                credentials: 'include',
                                body: JSON.stringify({
                                  guestId: actualGuestId,
                                  relationshipType: 'GroupReservation',
                                  isPrimaryContact: isPrimary,
                                }),
                              });
                            } catch (linkErr) {
                              console.warn(`Member ${i + 1} group-link failed (non-fatal):`, linkErr);
                            }
                          }
                        } else {
                          // Individual booking → create or find one guest profile
                          const { data: existingGuest } = await supabase
                            .from('guests')
                            .select('id')
                            .eq('email', guestEmail)
                            .maybeSingle();

                          if (existingGuest) {
                            roomGuestIds.push(existingGuest.id);
                          } else {
                            const guestId = 'GST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                            await supabase
                              .from('guests')
                              .insert({
                                id: guestId,
                                name: primaryContactName,
                                email: guestEmail,
                                phone: guestPhone,
                                nationality: guestNationality,
                                status: 'Regular',
                                loyalty_points: 0,
                                special_requests: '',
                                notes: 'Individual booking created from FrontOffice',
                                total_spend: 0,
                                is_primary_contact: true,
                                preferences: {},
                                identification_doc: {}
                              });
                            roomGuestIds.push(guestId);
                          }
                        }
                      } catch (profileError) {
                        console.error('Guest/group profile creation error (non-fatal):', profileError);
                        // Continue — the reservation will still be created,
                        // just without the guest/group linkage.
                      }

                      // ── Create reservations WITH linkage included ──────────────────
                      // For GROUP bookings: create ONE RESERVATION PER ROOM, all linked
                      //   to the primary contact guest and to the group. Individual room
                      //   occupants can be linked later from the group profile detail.
                      // For INDIVIDUAL bookings: create a single reservation.
                      if (isGroupBooking && roomGuestIds.length > 0) {
                        // Create one reservation per room — each linked to its own
                        // member guest profile and to the group.
                        for (let i = 0; i < rooms.length; i++) {
                          const reservationId = Math.random().toString(36).substring(2, 10).toUpperCase();
                          const room = rooms[i];
                          const roomTypeName = roomTypes.find(rt => rt.id === room.roomType)?.name || 'Standard';
                          const roomRate = room.amount / nights;
                          const roomGuestId = roomGuestIds[i] || roomGuestIds[0];
                          const memberName = `${primaryContactName}${i + 1}`;
                          const memberEmail = i === 0
                            ? guestEmail
                            : `${guestEmail.split('@')[0]}${i + 1}@${guestEmail.split('@')[1] || 'example.com'}`;

                          const { error: insertError } = await supabase
                            .from('reservations')
                            .insert({
                              id: reservationId,
                              guest_name: memberName,
                              guest_email: memberEmail,
                              guest_phone: guestPhone,
                              guest_status: newReservationForm.guestStatus || 'Regular',
                              room_type: roomTypeName,
                              room_number: room.roomNumber || null,
                              check_in_date: newReservationForm.checkInDate,
                              check_out_date: newReservationForm.checkOutDate,
                              adults: room.adults || 1,
                              children: room.children || 0,
                              status: 'Confirmed',
                              rate: roomRate,
                              total_amount: room.amount,
                              channel: newReservationForm.source === 'walk-in' ? 'Walk-In' : newReservationForm.source === 'ota' ? 'Booking.com' : newReservationForm.source === 'corporate' ? 'Corporate' : 'Direct Website',
                              payment_status: 'Unpaid',
                              notes: JSON.stringify({
                                guestName: memberName,
                                guestEmail: memberEmail,
                                guestPhone: guestPhone,
                                guestStatus: newReservationForm.guestStatus,
                                nationality: guestNationality,
                                groupName: newReservationForm.groupName,
                                primaryContact: primaryContactName,
                                travelAgency: newReservationForm.travelAgency,
                                roomNumber: i + 1,
                                createdBy: createdBy || null
                              }),
                              charges: [{
                                description: 'Room charge',
                                amount: room.amount,
                                date: new Date().toISOString()
                              }],
                              payments: [],
                              deposit_amount: 0,
                              is_deposit_paid: false,
                              // ── Linkage included in initial INSERT (no UPDATE needed) ──
                              guest_id: roomGuestId,
                              booking_group_id: groupId,
                              group_booking_id: groupId,
                              is_group: true
                            });

                          if (insertError) {
                            console.error(`Supabase insert error for room ${i + 1}:`, insertError);
                            throw new Error(`Failed to create reservation for room ${i + 1}: ${insertError.message}`);
                          }

                          // Insert this room into reservation_rooms table
                          const { error: roomInsertError } = await supabase
                            .from('reservation_rooms')
                            .insert({
                              reservation_id: reservationId,
                              room_type: roomTypeName,
                              room_number: room.roomNumber || null,
                              adults: room.adults || 1,
                              children: room.children || 0,
                              amount: room.amount,
                              check_in_date: newReservationForm.checkInDate,
                              check_out_date: newReservationForm.checkOutDate
                            });

                          if (roomInsertError) {
                            console.error(`reservation_rooms insert error for room ${i + 1}:`, roomInsertError);
                          }
                        }
                      } else {
                        // Individual booking → single reservation
                        const reservationId = Math.random().toString(36).substring(2, 10).toUpperCase();
                        const rate = totalAmount / nights;
                        const primaryGuestId = roomGuestIds[0] || null;

                        const { error: insertError } = await supabase
                          .from('reservations')
                          .insert({
                            id: reservationId,
                            guest_name: newReservationForm.guestName,
                            guest_email: newReservationForm.guestEmail || 'guest@example.com',
                            guest_phone: newReservationForm.guestPhone || '',
                            guest_status: newReservationForm.guestStatus || 'Regular',
                            room_type: roomTypes.find(rt => rt.id === rooms[0]?.roomType)?.name || 'Standard',
                            room_number: rooms[0]?.roomNumber || null,
                            check_in_date: newReservationForm.checkInDate,
                            check_out_date: newReservationForm.checkOutDate,
                            adults: totalAdults,
                            children: totalChildren,
                            status: 'Confirmed',
                            rate: rate,
                            total_amount: totalAmount,
                            channel: newReservationForm.source === 'walk-in' ? 'Walk-In' : newReservationForm.source === 'ota' ? 'Booking.com' : newReservationForm.source === 'corporate' ? 'Corporate' : 'Direct Website',
                            payment_status: 'Unpaid',
                            notes: JSON.stringify({
                              guestName: newReservationForm.guestName,
                              guestEmail: newReservationForm.guestEmail,
                              guestPhone: newReservationForm.guestPhone,
                              guestStatus: newReservationForm.guestStatus,
                              nationality: newReservationForm.nationality,
                              createdBy: createdBy || null
                            }),
                            charges: [{
                              description: 'Room charge',
                              amount: totalAmount,
                              date: new Date().toISOString()
                            }],
                            payments: [],
                            deposit_amount: 0,
                            is_deposit_paid: false,
                            guest_id: primaryGuestId,
                            is_group: false
                          });

                        if (insertError) {
                          console.error('Supabase insert error:', insertError);
                          throw new Error(`Failed to create reservation: ${insertError.message}`);
                        }

                        // Insert rooms into reservation_rooms table
                        const roomInserts = rooms.map(room => ({
                          reservation_id: reservationId,
                          room_type: roomTypes.find(rt => rt.id === room.roomType)?.name || room.roomType,
                          room_number: room.roomNumber || null,
                          adults: room.adults,
                          children: room.children,
                          amount: room.amount,
                          check_in_date: newReservationForm.checkInDate,
                          check_out_date: newReservationForm.checkOutDate
                        }));

                        const { error: roomsInsertError } = await supabase
                          .from('reservation_rooms')
                          .insert(roomInserts);

                        if (roomsInsertError) {
                          console.error('Supabase reservation_rooms insert error:', roomsInsertError);
                        }

                        // ── Auto-link: if the user selected a suggested group,
                        //    link the guest to that group via the RPC so the
                        //    guest_group_relationships table (and parent_group_id)
                        //    stay in sync. Best-effort — failures are logged but
                        //    do not roll back the reservation.
                        if (selectedSuggestedGroupId && primaryGuestId) {
                          try {
                            await fetch(`/api/group-profiles/${selectedSuggestedGroupId}/link-guest`, {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({
                                guestId: primaryGuestId,
                                reservationId,
                                relationshipType: 'GroupReservation',
                                isPrimaryContact: false,
                              }),
                            });
                          } catch (linkErr) {
                            console.warn('Auto group-link failed (non-fatal):', linkErr);
                          }
                        }
                      }
                    }
                    
                    // Refresh reservations using shared Supabase client
                    const { data: refreshedReservations } = await supabase
                      .from('reservations')
                      .select(`
                        id,
                        guest_name,
                        guest_email,
                        guest_phone,
                        guest_status,
                        check_in_date,
                        check_out_date,
                        status,
                        adults,
                        children,
                        total_amount,
                        deposit_amount,
                        channel,
                        room_type,
                        room_number,
                        rate,
                        payment_status,
                        notes,
                        group_booking_id,
                        booking_group_id,
                        corporate_account_id,
                        is_group,
                        created_at,
                        created_by
                      `)
                      .order('check_in_date', { ascending: true });

                      // Fetch reservation rooms for refreshed data
                      const refreshedIds = refreshedReservations?.map((r: any) => r.id) || [];
                      let refreshedRoomsMap: Record<string, any[]> = {};
                      if (refreshedIds.length > 0 && supabase) {
                        const { data: refreshedRoomsData } = await supabase
                          .from('reservation_rooms')
                          .select('reservation_id, room_type, room_number, adults, children, amount')
                          .in('reservation_id', refreshedIds)
                          .order('created_at', { ascending: true });
                        
                        if (refreshedRoomsData) {
                          refreshedRoomsData.forEach((rr: any) => {
                            if (!refreshedRoomsMap[rr.reservation_id]) {
                              refreshedRoomsMap[rr.reservation_id] = [];
                            }
                            refreshedRoomsMap[rr.reservation_id].push({
                              roomType: rr.room_type || 'Standard',
                              roomNumber: rr.room_number || undefined,
                              adults: rr.adults || 1,
                              children: rr.children || 0,
                              amount: rr.amount || 0
                            });
                          });
                        }
                      }

                      // Fetch group booking names for refreshed data
                      const refreshedGroupIds = Array.from(new Set(
                        (refreshedReservations || [])
                          .map((r: any) => r.booking_group_id || r.group_booking_id)
                          .filter((id: any) => id && String(id).startsWith('GRP-'))
                      )) as string[];
                      let refreshedGroupNameMap: Record<string, string> = {};
                      if (refreshedGroupIds.length > 0 && supabase) {
                        const { data: refreshedGroupData } = await supabase
                          .from('group_bookings')
                          .select('id, group_name')
                          .in('id', refreshedGroupIds);
                        if (refreshedGroupData) {
                          refreshedGroupData.forEach((g: any) => {
                            refreshedGroupNameMap[g.id] = g.group_name;
                          });
                        }
                      }

                      const transformedReservations = refreshedReservations?.map((res: any) => {
                        const nights = Math.ceil((new Date(res.check_out_date).getTime() - new Date(res.check_in_date).getTime()) / (1000 * 60 * 60 * 24));
                        
                        let groupName = null;
                        let primaryContact = null;
                        let travelAgency = null;
                        let corporation = null;
                        let guestName = 'Guest';
                        
                        try {
                          const notesObj = typeof res.notes === 'string' ? JSON.parse(res.notes || '{}') : (res.notes || {});
                          
                          // Check if this is a group booking
                          if (notesObj.groupName || res.group_booking_id || res.booking_group_id || res.is_group) {
                            const gid = res.booking_group_id || res.group_booking_id;
                            // groupName must always be the actual group name, NEVER the group reservation ID.
                            groupName = (gid && refreshedGroupNameMap[gid]) || notesObj.groupName || null;
                            primaryContact = notesObj.primaryContact;
                            travelAgency = notesObj.travelAgency;
                            corporation = notesObj.corporation || res.corporate_account_id;
                            // For group bookings, show primary contact as guest name
                            guestName = notesObj.primaryContact || notesObj.guestName || res.guest_name || 'Group Contact';
                          } else {
                            guestName = notesObj.guestName || res.guest_name || 'Guest';
                          }
                        } catch (e) {
                          guestName = res.guest_name || 'Guest';
                          if (res.group_booking_id || res.booking_group_id || res.is_group) {
                            const gid = res.booking_group_id || res.group_booking_id;
                            groupName = (gid && refreshedGroupNameMap[gid]) || null;
                          }
                        }
                        
                        let guestEmail = '';
                        let guestPhone = '';
                        let guestStatus = 'Regular';
                        let nationality = '';
                        try {
                          const notesObj2 = typeof res.notes === 'string' ? JSON.parse(res.notes || '{}') : (res.notes || {});
                          guestEmail = notesObj2.guestEmail || res.guest_email || '';
                          guestPhone = notesObj2.guestPhone || res.guest_phone || '';
                          guestStatus = notesObj2.guestStatus || res.guest_status || 'Regular';
                          nationality = notesObj2.nationality || '';
                        } catch (e) {
                          guestEmail = res.guest_email || '';
                          guestPhone = res.guest_phone || '';
                          guestStatus = res.guest_status || 'Regular';
                        }

                        // Use rooms from reservation_rooms table if available, otherwise fall back to reservation row
                        const fetchedRooms = refreshedRoomsMap[res.id];
                        const rooms = fetchedRooms && fetchedRooms.length > 0
                          ? fetchedRooms
                          : [{
                              roomType: res.room_type || 'Standard',
                              roomNumber: res.room_number || undefined,
                              adults: res.adults || 1,
                              children: res.children || 0,
                              amount: res.total_amount || 0
                            }];
                        
                        return {
                          id: res.id,
                          guestName: guestName,
                          guestEmail: guestEmail,
                          guestPhone: guestPhone,
                          guestStatus: guestStatus,
                          nationality: nationality,
                          rooms: rooms,
                          checkIn: res.check_in_date,
                          checkOut: res.check_out_date,
                          nights: nights,
                          totalAdults: res.adults || 1,
                          totalChildren: res.children || 0,
                          source: res.channel || 'walk-in',
                          status: res.status.toLowerCase(),
                          totalAmount: res.total_amount,
                          deposit: res.deposit_amount,
                          balance: res.total_amount - (res.deposit_amount || 0),
                          groupName: groupName,
                          primaryContact: primaryContact,
                          travelAgency: travelAgency,
                          corporation: corporation,
                          paymentStatus: res.payment_status || 'Unpaid',
                          rate: res.rate || 0,
                          createdAt: res.created_at || '',
                          booking_group_id: res.booking_group_id || res.group_booking_id || undefined
                        };
                      }) || [];
                      
                      setReservations(transformedReservations);
                      
                      // Reset form and close modal
                      setNewReservationForm({
                        guestName: '',
                        guestEmail: '',
                        guestPhone: '',
                        guestStatus: 'Regular',
                        nationality: '',
                        checkInDate: '',
                        checkOutDate: '',
                        source: 'walk-in',
                        groupName: '',
                        primaryContact: '',
                        travelAgency: '',
                        corporation: '',
                        depositAmount: 0,
                        isDepositPaid: false,
                        paymentStatus: 'Unpaid',
                        notes: ''
                      });
                      setBookingType('individual');
                      setFormErrors({});
                      setNewReservationRoomTypes([{ roomType: '', quantity: 1, adultsPerRoom: 1, childrenPerRoom: 0, amountPerRoom: 0 }]);
                      setShowNewReservationModal(false);
                      setIsEditMode(false);
                      setEditingReservation(null);
                    } catch (error) {
                      console.error('Error creating reservation:', error);
                      alert('Failed to create reservation. Please try again.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20 ${isSubmitting ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/30'}`}
                >
                  {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Reservation' : 'Create Reservation')}
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
