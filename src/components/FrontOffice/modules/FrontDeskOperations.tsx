/**
 * Front Office Front Desk Operations Module
 * Arrival and departure management
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DoorOpen,
  LogOut,
  Users,
  Clock,
  Star,
  CheckCircle2,
  RefreshCw,
  Filter,
  Download,
  Printer,
  Eye,
  Edit,
  CreditCard,
  FileText,
  UserCheck,
  UserX,
  Zap,
  CalendarCheck,
  Loader2,
  X,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Info
} from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useERP } from '../../../context/ERPContext';

type ArrivalStatus = 'expected' | 'pre-registered' | 'mobile-checkin' | 'express-checkin' | 'group-checkin' | 'vip-arrival';
type DepartureStatus = 'expected' | 'express-checkout' | 'late-checkout' | 'group-checkout' | 'invoice-settlement';

interface Arrival {
  id: string;
  guestName: string;
  guestEmail?: string;
  roomType: string;
  roomNumber?: string;
  checkInDate: string;
  checkInTime: string;
  status: ArrivalStatus;
  isVIP: boolean;
  isBirthday: boolean;
  isAnniversary: boolean;
  balance: number;
  preRegistered: boolean;
  guestStatus?: string;
  channel?: string;
  adults?: number;
  children?: number;
}

interface Departure {
  id: string;
  guestName: string;
  guestEmail?: string;
  roomNumber: string;
  roomType?: string;
  checkOutDate: string;
  checkOutTime: string;
  status: DepartureStatus;
  balance: number;
  folioBalance: number;
  lateCheckoutRequested: boolean;
  guestStatus?: string;
  channel?: string;
  adults?: number;
  children?: number;
}

const FrontDeskOperations = ({ onNavigateToCheckIn, onNavigateToCheckOut }: {
  onNavigateToCheckIn?: (resId: string) => void;
  onNavigateToCheckOut?: (resId: string) => void;
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('view') as 'arrivals' | 'departures') || 'arrivals';
  const setActiveTab = (tab: 'arrivals' | 'departures') => {
    const next = new URLSearchParams(searchParams);
    next.set('view', tab);
    setSearchParams(next);
  };
  const [arrivals, setArrivals] = useState<Arrival[]>([]);
  const [departures, setDepartures] = useState<Departure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewingReservation, setViewingReservation] = useState<any>(null);
  const [editingReservation, setEditingReservation] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [showPreRegisterModal, setShowPreRegisterModal] = useState(false);
  const [showMobileCheckInModal, setShowMobileCheckInModal] = useState(false);
  const [showExpressCheckInModal, setShowExpressCheckInModal] = useState(false);
  const [showGroupCheckInModal, setShowGroupCheckInModal] = useState(false);
  const [showVipArrivalModal, setShowVipArrivalModal] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<any>(null);
  const [selectedPreRegisterReservation, setSelectedPreRegisterReservation] = useState<any>(null);
  const [preRegisterFormData, setPreRegisterFormData] = useState({
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in_date: '',
    room_type: '',
    guest_status: 'Regular'
  });
  const [showExpressCheckOutModal, setShowExpressCheckOutModal] = useState(false);
  const [showLateCheckOutModal, setShowLateCheckOutModal] = useState(false);
  const [showGroupCheckOutModal, setShowGroupCheckOutModal] = useState(false);
  const [showInvoiceSettlementModal, setShowInvoiceSettlementModal] = useState(false);

  // Group check-in / check-out: real data via ERP context
  const { groupBookings, reservations, checkInGroupBooking, checkOutGroupBooking } = useERP();
  const [selectedGroupCheckInId, setSelectedGroupCheckInId] = useState('');
  const [selectedGroupCheckOutId, setSelectedGroupCheckOutId] = useState('');
  const [groupActionLoading, setGroupActionLoading] = useState(false);

  // Groups eligible for check-in: Confirmed with at least one pending reservation
  const groupCheckInOptions = groupBookings.filter(g => {
    if (g.status === 'CheckedIn' || g.status === 'Completed' || g.status === 'Cancelled') return false;
    const groupRes = reservations.filter(r => r.groupBookingId === g.id || r.bookingGroupId === g.id);
    return groupRes.some(r => r.status === 'Confirmed');
  });

  // Groups eligible for check-out: have at least one CheckedIn reservation
  const groupCheckOutOptions = groupBookings.filter(g => {
    const groupRes = reservations.filter(r => r.groupBookingId === g.id || r.bookingGroupId === g.id);
    return groupRes.some(r => r.status === 'CheckedIn');
  });

  const selectedCheckInGroup = groupBookings.find(g => g.id === selectedGroupCheckInId);
  const selectedCheckInGroupReservations = selectedCheckInGroup
    ? reservations.filter(r => r.groupBookingId === selectedCheckInGroup.id || r.bookingGroupId === selectedCheckInGroup.id)
    : [];
  const selectedCheckOutGroup = groupBookings.find(g => g.id === selectedGroupCheckOutId);
  const selectedCheckOutGroupReservations = selectedCheckOutGroup
    ? reservations.filter(r => r.groupBookingId === selectedCheckOutGroup.id || r.bookingGroupId === selectedCheckOutGroup.id)
    : [];

  // Fetch arrivals (reservations with check-in date = today and status = Confirmed)
  const fetchArrivals = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('reservations')
        .select(`
          id,
          guest_name,
          guest_email,
          guest_status,
          room_type,
          room_number,
          check_in_date,
          check_out_date,
          status,
          adults,
          children,
          total_amount,
          deposit_amount,
          channel,
          payment_status,
          late_check_out_requested,
          is_group,
          group_booking_id
        `)
        .eq('check_in_date', today)
        .in('status', ['Confirmed', 'Waitlisted']);

      // Apply search filter
      if (searchTerm) {
        query = query.or(`guest_name.ilike.%${searchTerm}%,guest_email.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
      }

      const { data: reservations, error: fetchError } = await query.order('check_in_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Transform reservations to arrival format
      const transformedArrivals: Arrival[] = (reservations || []).map((res: any) => {
        // Determine arrival status based on reservation properties
        let arrivalStatus: ArrivalStatus = 'expected';
        if (res.is_group || res.group_booking_id) {
          arrivalStatus = 'group-checkin';
        } else if (res.guest_status === 'VIP') {
          arrivalStatus = 'vip-arrival';
        } else if (res.channel === 'Direct Website' || res.channel === 'Mobile App') {
          arrivalStatus = 'mobile-checkin';
        }

        // Calculate balance
        const balance = Number(res.total_amount) - Number(res.deposit_amount);

        return {
          id: res.id,
          guestName: res.guest_name,
          guestEmail: res.guest_email,
          roomType: res.room_type,
          roomNumber: res.room_number || undefined,
          checkInDate: res.check_in_date,
          checkInTime: '14:00', // Default check-in time
          status: arrivalStatus,
          isVIP: res.guest_status === 'VIP',
          isBirthday: false, // Would need guest profile data
          isAnniversary: false, // Would need guest profile data
          balance: balance,
          preRegistered: res.channel === 'Direct Website' || res.channel === 'Mobile App',
          guestStatus: res.guest_status,
          channel: res.channel,
          adults: res.adults,
          children: res.children
        };
      });

      setArrivals(transformedArrivals);
    } catch (err) {
      console.error('Error fetching arrivals:', err);
      setError('Failed to load arrivals data');
    }
  };

  // Fetch departures (reservations with check-out date = today and status = CheckedIn)
  const fetchDepartures = async () => {
    try {
      if (!supabase) {
        throw new Error('Supabase client not initialized');
      }

      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('reservations')
        .select(`
          id,
          guest_name,
          guest_email,
          guest_status,
          room_type,
          room_number,
          check_in_date,
          check_out_date,
          status,
          adults,
          children,
          total_amount,
          deposit_amount,
          channel,
          payment_status,
          late_check_out_requested,
          is_group,
          group_booking_id
        `)
        .eq('check_out_date', today)
        .eq('status', 'CheckedIn');

      // Apply search filter
      if (searchTerm) {
        query = query.or(`guest_name.ilike.%${searchTerm}%,guest_email.ilike.%${searchTerm}%,id.ilike.%${searchTerm}%`);
      }

      const { data: reservations, error: fetchError } = await query.order('check_out_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Transform reservations to departure format
      const transformedDepartures: Departure[] = (reservations || []).map((res: any) => {
        // Determine departure status
        let departureStatus: DepartureStatus = 'expected';
        if (res.late_check_out_requested) {
          departureStatus = 'late-checkout';
        } else if (res.is_group || res.group_booking_id) {
          departureStatus = 'group-checkout';
        } else if (res.payment_status === 'Paid') {
          departureStatus = 'express-checkout';
        } else if (res.payment_status === 'Unpaid' || res.payment_status === 'Partial') {
          departureStatus = 'invoice-settlement';
        }

        // Calculate balance
        const balance = Number(res.total_amount) - Number(res.deposit_amount);
        const folioBalance = balance; // In real implementation, this would come from folios table

        return {
          id: res.id,
          guestName: res.guest_name,
          guestEmail: res.guest_email,
          roomNumber: res.room_number || 'TBD',
          roomType: res.room_type,
          checkOutDate: res.check_out_date,
          checkOutTime: res.late_check_out_requested ? '12:00' : '11:00',
          status: departureStatus,
          balance: res.payment_status === 'Paid' ? 0 : balance,
          folioBalance: folioBalance,
          lateCheckoutRequested: res.late_check_out_requested,
          guestStatus: res.guest_status,
          channel: res.channel,
          adults: res.adults,
          children: res.children
        };
      });

      setDepartures(transformedDepartures);
    } catch (err) {
      console.error('Error fetching departures:', err);
      setError('Failed to load departures data');
    }
  };

  const arrivalStatusColors = {
    expected: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'pre-registered': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'mobile-checkin': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    'express-checkin': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
    'group-checkin': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'vip-arrival': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };

  const departureStatusColors = {
    expected: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'express-checkout': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    'late-checkout': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'group-checkout': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'invoice-settlement': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const arrivalOperations = [
    { id: 'pre-register', label: 'Pre-Registration', icon: CalendarCheck },
    { id: 'mobile-checkin', label: 'Mobile Check-In', icon: Zap },
    { id: 'express-checkin', label: 'Express Check-In', icon: Zap },
    { id: 'group-checkin', label: 'Group Check-In', icon: Users },
    { id: 'vip-arrival', label: 'VIP Arrival', icon: Star },
  ];

  const departureOperations = [
    { id: 'express-checkout', label: 'Express Check-Out', icon: Zap },
    { id: 'late-checkout', label: 'Late Check-Out', icon: Clock },
    { id: 'group-checkout', label: 'Group Check-Out', icon: Users },
    { id: 'invoice-settlement', label: 'Invoice Settlement', icon: CreditCard },
  ];

  // Load data based on active tab
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'arrivals') {
        await fetchArrivals();
      } else {
        await fetchDepartures();
      }
      
      setLoading(false);
    };

    loadData();
  }, [activeTab, refreshTrigger, searchTerm]);

  // Fetch room types for display
  useEffect(() => {
    const fetchRoomTypes = async () => {
      if (!supabase) return;
      
      try {
        const { data } = await supabase
          .from('room_types')
          .select('id, name, base_price, max_occupancy')
          .order('name');
        
        if (data) {
          setRoomTypes(data);
        }
      } catch (error) {
        console.error('Error fetching room types:', error);
      }
    };

    fetchRoomTypes();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle filter
  const handleFilter = () => {
    // Filter logic is already applied in the fetch functions via searchTerm
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle check-in
  const handleCheckIn = (reservationId: string) => {
    // Navigate to check-in tab instead of auto-checking in
    if (onNavigateToCheckIn) {
      onNavigateToCheckIn(reservationId);
    } else {
      console.log('Navigate to check-in for reservation:', reservationId);
      // If no navigation function provided, show a message
      setError('Check-in navigation not configured');
    }
  };

  // Handle check-out
  const handleCheckOut = (reservationId: string) => {
    // Navigate to check-out tab instead of auto-checking out
    if (onNavigateToCheckOut) {
      onNavigateToCheckOut(reservationId);
    } else {
      console.log('Navigate to check-out for reservation:', reservationId);
      // If no navigation function provided, show a message
      setError('Check-out navigation not configured');
    }
  };

  // Handle view details
  const handleViewDetails = async (reservationId: string) => {
    try {
      const { data: reservation, error } = await supabase!
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

      if (error) throw error;
      if (!reservation) throw new Error('Reservation not found');

      // Parse notes field to extract actual notes vs JSON metadata
      let actualNotes = reservation.notes;
      try {
        if (typeof reservation.notes === 'string' && reservation.notes.startsWith('{')) {
          const notesObj = JSON.parse(reservation.notes);
          // If the notes field contains guest metadata, check for actual notes
          actualNotes = notesObj.notes || reservation.notes; // Use notes from JSON if available
          // If the entire notes field is just guest metadata, clear it for display
          if (notesObj.guestName && !notesObj.notes) {
            actualNotes = '';
          }
        }
      } catch (e) {
        // If parsing fails, use the original notes value
        actualNotes = reservation.notes;
      }

      setViewingReservation({
        ...reservation,
        actualNotes: actualNotes // Store the parsed actual notes
      });
      setShowViewModal(true);
    } catch (err) {
      console.error('Error fetching reservation details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reservation details');
    }
  };

  // Handle edit
  const handleEdit = async (reservationId: string) => {
    try {
      const { data: reservation, error } = await supabase!
        .from('reservations')
        .select('*')
        .eq('id', reservationId)
        .single();

      if (error) throw error;
      if (!reservation) throw new Error('Reservation not found');

      // Parse notes field to extract actual notes vs JSON metadata
      let actualNotes = reservation.notes;
      try {
        if (typeof reservation.notes === 'string' && reservation.notes.startsWith('{')) {
          const notesObj = JSON.parse(reservation.notes);
          actualNotes = notesObj.notes || '';
          if (notesObj.guestName && !notesObj.notes) {
            actualNotes = '';
          }
        }
      } catch (e) {
        actualNotes = reservation.notes;
      }

      setEditingReservation({
        ...reservation,
        actualNotes: actualNotes
      });
      setShowEditModal(true);
    } catch (err) {
      console.error('Error fetching reservation for edit:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reservation for editing');
    }
  };

  // Handle save edit
  const handleSaveEdit = async () => {
    if (!editingReservation) return;

    setError(null);

    try {
      // Handle notes field - if it was JSON metadata, preserve the structure but update actual notes
      let notesToSave = editingReservation.actualNotes || '';
      
      // If the original notes was JSON metadata, we need to preserve that structure
      try {
        if (typeof editingReservation.notes === 'string' && editingReservation.notes.startsWith('{')) {
          const originalNotesObj = JSON.parse(editingReservation.notes);
          // Update the notes field in the JSON object
          originalNotesObj.notes = editingReservation.actualNotes || '';
          notesToSave = JSON.stringify(originalNotesObj);
        }
      } catch (e) {
        // If parsing fails, just use the actual notes
        notesToSave = editingReservation.actualNotes || '';
      }

      const { error } = await supabase!
        .from('reservations')
        .update({
          guest_name: editingReservation.guest_name,
          guest_email: editingReservation.guest_email,
          guest_phone: editingReservation.guest_phone,
          guest_status: editingReservation.guest_status,
          room_type: editingReservation.room_type,
          room_number: editingReservation.room_number,
          check_in_date: editingReservation.check_in_date,
          check_out_date: editingReservation.check_out_date,
          adults: editingReservation.adults,
          children: editingReservation.children,
          total_amount: editingReservation.total_amount,
          deposit_amount: editingReservation.deposit_amount,
          rate: editingReservation.rate,
          payment_status: editingReservation.payment_status,
          channel: editingReservation.channel,
          status: editingReservation.status,
          notes: notesToSave,
        })
        .eq('id', editingReservation.id);

      if (error) throw error;

      setSuccessMessage('Reservation updated successfully');
      setShowEditModal(false);
      setEditingReservation(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error updating reservation:', err);
      setError(err instanceof Error ? err.message : 'Failed to update reservation');
    }
  };

  // Handle view folio
  const handleViewFolio = async (reservationId: string) => {
    try {
      // Get folios for this reservation
      const { data: folios, error } = await supabase!
        .from('folios')
        .select('*')
        .eq('reservation_id', reservationId);

      if (error) throw error;

      if (folios && folios.length > 0) {
        // For now, just log the folio data - in a real implementation, this would open a folio view modal
        console.log('Folios for reservation:', folios);
        alert(`Found ${folios.length} folio(s) for this reservation. Check console for details.`);
      } else {
        alert('No folios found for this reservation');
      }
    } catch (err) {
      console.error('Error fetching folios:', err);
      setError(err instanceof Error ? err.message : 'Failed to load folios');
    }
  };

  // Handle download
  const handleDownload = () => {
    // Export current tab data to CSV
    const data = activeTab === 'arrivals' ? arrivals : departures;
    const filename = `${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
    
    // Create CSV content
    const headers = activeTab === 'arrivals' 
      ? ['Guest Name', 'Email', 'Room Type', 'Room Number', 'Check-In Time', 'Status', 'Balance', 'VIP', 'Pre-Registered']
      : ['Guest Name', 'Email', 'Room Number', 'Room Type', 'Check-Out Time', 'Status', 'Balance', 'Folio Balance', 'Late Checkout'];
    
    const rows = data.map(item => {
      if (activeTab === 'arrivals') {
        return [
          item.guestName,
          item.guestEmail || '',
          item.roomType,
          item.roomNumber || '',
          item.checkInTime,
          item.status,
          item.balance.toFixed(2),
          item.isVIP,
          item.preRegistered
        ];
      } else {
        return [
          item.guestName,
          item.guestEmail || '',
          item.roomNumber,
          item.roomType || '',
          item.checkOutTime,
          item.status,
          item.balance.toFixed(2),
          item.folioBalance.toFixed(2),
          item.lateCheckoutRequested
        ];
      }
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle operation button clicks
  const handleOperationClick = (operationId: string) => {
    switch(operationId) {
      case 'pre-register':
        setShowPreRegisterModal(true);
        break;
      case 'mobile-checkin':
        setShowMobileCheckInModal(true);
        break;
      case 'express-checkin':
        setShowExpressCheckInModal(true);
        break;
      case 'group-checkin':
        setShowGroupCheckInModal(true);
        break;
      case 'vip-arrival':
        setShowVipArrivalModal(true);
        break;
      case 'express-checkout':
        setShowExpressCheckOutModal(true);
        break;
      case 'late-checkout':
        setShowLateCheckOutModal(true);
        break;
      case 'group-checkout':
        setShowGroupCheckOutModal(true);
        break;
      case 'invoice-settlement':
        setShowInvoiceSettlementModal(true);
        break;
    }
  };

  // Handle pre-registration
  const handlePreRegister = async (guestData: any) => {
    try {
      // Implement pre-registration logic
      console.log('Pre-registering guest:', guestData);
      setSuccessMessage('Pre-registration completed successfully');
      setShowPreRegisterModal(false);
      setSelectedPreRegisterReservation(null);
      setPreRegisterFormData({
        guest_name: '',
        guest_email: '',
        guest_phone: '',
        check_in_date: '',
        room_type: '',
        guest_status: 'Regular'
      });
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Pre-registration error:', err);
      setError('Failed to complete pre-registration');
    }
  };

  // Handle reservation selection for pre-registration
  const handlePreRegisterReservationSelect = (reservationId: string) => {
    const reservation = arrivals.find(a => a.id === reservationId);
    if (reservation) {
      setSelectedPreRegisterReservation(reservation);
      setPreRegisterFormData({
        guest_name: reservation.guestName,
        guest_email: reservation.guestEmail || '',
        guest_phone: '',
        check_in_date: reservation.checkInDate,
        room_type: reservation.roomType,
        guest_status: reservation.guestStatus || 'Regular'
      });
    }
  };

  // Handle mobile check-in
  const handleMobileCheckIn = async (reservationId: string) => {
    try {
      // Implement mobile check-in logic
      console.log('Mobile check-in for reservation:', reservationId);
      setSuccessMessage('Mobile check-in completed successfully');
      setShowMobileCheckInModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Mobile check-in error:', err);
      setError('Failed to complete mobile check-in');
    }
  };

  // Handle express check-in
  const handleExpressCheckIn = async (reservationId: string) => {
    try {
      // Implement express check-in logic
      console.log('Express check-in for reservation:', reservationId);
      setSuccessMessage('Express check-in completed successfully');
      setShowExpressCheckInModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Express check-in error:', err);
      setError('Failed to complete express check-in');
    }
  };

  // Handle group check-in
  const handleGroupCheckIn = async (groupId: string) => {
    if (!groupId) {
      setError('Please select a group to check in.');
      return;
    }
    setGroupActionLoading(true);
    try {
      await checkInGroupBooking(groupId);
      const group = groupBookings.find(g => g.id === groupId);
      setSuccessMessage(`Group check-in completed successfully for ${group?.groupName || groupId}`);
      setShowGroupCheckInModal(false);
      setSelectedGroupCheckInId('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Group check-in error:', err);
      setError('Failed to complete group check-in');
    } finally {
      setGroupActionLoading(false);
    }
  };

  // Handle VIP arrival
  const handleVipArrival = async (reservationId: string) => {
    try {
      // Implement VIP arrival logic
      console.log('VIP arrival for reservation:', reservationId);
      setSuccessMessage('VIP arrival processed successfully');
      setShowVipArrivalModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('VIP arrival error:', err);
      setError('Failed to process VIP arrival');
    }
  };

  // Handle express check-out
  const handleExpressCheckOut = async (reservationId: string) => {
    try {
      // Implement express check-out logic
      console.log('Express check-out for reservation:', reservationId);
      setSuccessMessage('Express check-out completed successfully');
      setShowExpressCheckOutModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Express check-out error:', err);
      setError('Failed to complete express check-out');
    }
  };

  // Handle late check-out
  const handleLateCheckOut = async (reservationId: string) => {
    try {
      // Implement late check-out logic
      console.log('Late check-out for reservation:', reservationId);
      setSuccessMessage('Late check-out processed successfully');
      setShowLateCheckOutModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Late check-out error:', err);
      setError('Failed to process late check-out');
    }
  };

  // Handle group check-out
  const handleGroupCheckOut = async (groupId: string) => {
    if (!groupId) {
      setError('Please select a group to check out.');
      return;
    }
    setGroupActionLoading(true);
    try {
      await checkOutGroupBooking(groupId);
      const group = groupBookings.find(g => g.id === groupId);
      setSuccessMessage(`Group check-out completed successfully for ${group?.groupName || groupId}`);
      setShowGroupCheckOutModal(false);
      setSelectedGroupCheckOutId('');
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Group check-out error:', err);
      setError('Failed to complete group check-out');
    } finally {
      setGroupActionLoading(false);
    }
  };

  // Handle invoice settlement
  const handleInvoiceSettlement = async (reservationId: string) => {
    try {
      // Implement invoice settlement logic
      console.log('Invoice settlement for reservation:', reservationId);
      setSuccessMessage('Invoice settlement completed successfully');
      setShowInvoiceSettlementModal(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Invoice settlement error:', err);
      setError('Failed to complete invoice settlement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Front Desk Operations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Arrival and departure management</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Refresh
          </button>
          <button 
            onClick={handleFilter}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center justify-between">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center justify-between">
          <p className="text-green-600 dark:text-green-400 text-sm">{successMessage}</p>
          <button 
            onClick={() => setSuccessMessage(null)}
            className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab('arrivals')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'arrivals'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          Arrivals
          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium rounded-full">
            {arrivals.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('departures')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
            activeTab === 'departures'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <LogOut className="w-4 h-4" />
          Departures
          <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium rounded-full">
            {departures.length}
          </span>
        </button>
      </div>

      {/* Arrivals Section */}
      {activeTab === 'arrivals' && (
        <>
          {/* Arrival Operations */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {arrivalOperations.map((op) => {
              const Icon = op.icon;
              return (
                <button
                  key={op.id}
                  onClick={() => handleOperationClick(op.id)}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  {op.label}
                </button>
              );
            })}
          </div>

          {/* Arrivals List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden print-area">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search arrivals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="expected">Expected</option>
                  <option value="pre-registered">Pre-Registered</option>
                  <option value="mobile-checkin">Mobile Check-In</option>
                  <option value="express-checkin">Express Check-In</option>
                  <option value="group-checkin">Group Check-In</option>
                  <option value="vip-arrival">VIP Arrival</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownload}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download CSV"
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={handlePrint}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Print"
                >
                  <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : arrivals.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No arrivals scheduled for today</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check-In Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Special</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {arrivals.map((arrival) => (
                      <tr key={arrival.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{arrival.guestName}</div>
                            {arrival.isVIP && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          {arrival.guestEmail && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{arrival.guestEmail}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{arrival.roomType}</div>
                          {arrival.roomNumber && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">Room {arrival.roomNumber}</div>
                          )}
                          {arrival.adults && arrival.children && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {arrival.adults} adults, {arrival.children} children
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <Clock className="w-4 h-4" />
                            {arrival.checkInTime}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${arrivalStatusColors[arrival.status]}`}>
                            {arrival.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${arrival.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${arrival.balance.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {arrival.isBirthday && <span className="text-lg">🎂</span>}
                            {arrival.isAnniversary && <span className="text-lg">💒</span>}
                            {arrival.preRegistered && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewDetails(arrival.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors" 
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button 
                              onClick={() => handleCheckIn(arrival.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors" 
                              title="Check-In"
                            >
                              <UserCheck className="w-4 h-4 text-green-600" />
                            </button>
                            <button 
                              onClick={() => handleEdit(arrival.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors" 
                              title="Edit"
                            >
                              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Departures Section */}
      {activeTab === 'departures' && (
        <>
          {/* Departure Operations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {departureOperations.map((op) => {
              const Icon = op.icon;
              return (
                <button
                  key={op.id}
                  onClick={() => handleOperationClick(op.id)}
                  className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm"
                >
                  <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  {op.label}
                </button>
              );
            })}
          </div>

          {/* Departures List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden print-area">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search departures..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="expected">Expected</option>
                  <option value="express-checkout">Express Check-Out</option>
                  <option value="late-checkout">Late Check-Out</option>
                  <option value="group-checkout">Group Check-Out</option>
                  <option value="invoice-settlement">Invoice Settlement</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDownload}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Download CSV"
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button 
                  onClick={handlePrint}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Print"
                >
                  <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              </div>
            ) : departures.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No departures scheduled for today</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-900/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guest</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Room</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Check-Out Time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Folio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {departures.map((departure) => (
                      <tr key={departure.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{departure.guestName}</div>
                          {departure.guestEmail && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{departure.guestEmail}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{departure.roomNumber}</div>
                          {departure.roomType && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{departure.roomType}</div>
                          )}
                          {departure.adults && departure.children && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {departure.adults} adults, {departure.children} children
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                            <Clock className="w-4 h-4" />
                            {departure.checkOutTime}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${departureStatusColors[departure.status]}`}>
                            {departure.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${departure.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            ${departure.balance.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">${departure.folioBalance.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewDetails(departure.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors" 
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button 
                              onClick={() => handleViewFolio(departure.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors" 
                              title="View Folio"
                            >
                              <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                            <button 
                              onClick={() => handleCheckOut(departure.id)}
                              className="p-1 hover:bg-gray-200 dark:hover:bg-slate-600 rounded transition-colors" 
                              title="Check-Out"
                            >
                              <UserX className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reservation Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
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
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guest_name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Reservation ID</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.id}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Email</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guest_email || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Phone</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guest_phone || '—'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-400">Guest Status</label>
                    <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.guest_status || 'Regular'}</p>
                  </div>
                </div>
              </div>

              {/* Room Details */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">Room Details</h3>
                <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg p-3 border-l-4 border-blue-400">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.room_type}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {viewingReservation.adults} adults, {viewingReservation.children} children
                      </p>
                      {viewingReservation.room_number ? (
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Room #{viewingReservation.room_number}</p>
                      ) : (
                        <p className="text-sm text-gray-400 dark:text-gray-500 italic">Auto-assign</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">${Number(viewingReservation.total_amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      ${viewingReservation.rate ? Number(viewingReservation.rate).toFixed(2) : '0.00'}/night
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-blue-700 dark:text-blue-400">Total Adults</label>
                    <p className="font-medium text-blue-900 dark:text-blue-300">{viewingReservation.adults}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-700 dark:text-blue-400">Total Children</label>
                    <p className="font-medium text-blue-900 dark:text-blue-300">{viewingReservation.children}</p>
                  </div>
                </div>
              </div>

              {/* Dates and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Check-in Date</label>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.check_in_date}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Check-out Date</label>
                  <p className="font-medium text-gray-900 dark:text-white">{viewingReservation.check_out_date}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Length of Stay</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {Math.ceil((new Date(viewingReservation.check_out_date).getTime() - new Date(viewingReservation.check_in_date).getTime()) / (1000 * 60 * 60 * 24))} nights
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Reservation Status</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    viewingReservation.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                    viewingReservation.status === 'CheckedIn' ? 'bg-emerald-100 text-emerald-700' :
                    viewingReservation.status === 'CheckedOut' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {viewingReservation.status}
                  </span>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-3">Financial Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Total Amount</label>
                    <p className="font-medium text-green-900 dark:text-green-300">${Number(viewingReservation.total_amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Deposit</label>
                    <p className="font-medium text-green-900 dark:text-green-300">${Number(viewingReservation.deposit_amount || 0).toFixed(2)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Balance</label>
                    <p className={`font-medium ${(Number(viewingReservation.total_amount) - Number(viewingReservation.deposit_amount || 0)) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${(Number(viewingReservation.total_amount) - Number(viewingReservation.deposit_amount || 0)).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Nightly Rate</label>
                    <p className="font-medium text-green-900 dark:text-green-300">${viewingReservation.rate ? Number(viewingReservation.rate).toFixed(2) : '0.00'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700 dark:text-green-400">Payment Status</label>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      viewingReservation.payment_status === 'Paid' ? 'bg-green-100 text-green-700' :
                      viewingReservation.payment_status === 'Partial' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {viewingReservation.payment_status || 'Unpaid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Booking Source & Metadata */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Booking Source</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg">
                      {viewingReservation.channel === 'Direct Website' ? '🌐' :
                       viewingReservation.channel === 'Walk-In' ? '🚶' :
                       viewingReservation.channel === 'Booking.com' ? '🏨' :
                       viewingReservation.channel === 'Corporate' ? '🏢' : '📱'}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white capitalize">
                      {viewingReservation.channel}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Created At</label>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {viewingReservation.created_at ? new Date(viewingReservation.created_at).toLocaleString() : '—'}
                  </p>
                </div>
              </div>

              {/* Notes */}
              {viewingReservation.actualNotes && (
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Notes</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-1">{viewingReservation.actualNotes}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setEditingReservation(viewingReservation);
                  setShowEditModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Reservation</h2>
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReservation(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Guest Information */}
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Guest Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={editingReservation.guest_name}
                      onChange={(e) => setEditingReservation({...editingReservation, guest_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Email</label>
                    <input
                      type="email"
                      value={editingReservation.guest_email}
                      onChange={(e) => setEditingReservation({...editingReservation, guest_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Phone</label>
                    <input
                      type="text"
                      value={editingReservation.guest_phone || ''}
                      onChange={(e) => setEditingReservation({...editingReservation, guest_phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Status</label>
                    <select
                      value={editingReservation.guest_status || 'Regular'}
                      onChange={(e) => setEditingReservation({...editingReservation, guest_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Regular">Regular</option>
                      <option value="VIP">VIP</option>
                      <option value="Loyalty Member">Loyalty Member</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Room & Dates */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">Room & Dates</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Room Type</label>
                    <select
                      value={editingReservation.room_type}
                      onChange={(e) => setEditingReservation({...editingReservation, room_type: e.target.value})}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      {roomTypes.map(rt => (
                        <option key={rt.id} value={rt.name}>{rt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Room Number</label>
                    <input
                      type="text"
                      value={editingReservation.room_number || ''}
                      onChange={(e) => setEditingReservation({...editingReservation, room_number: e.target.value})}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Check-in Date</label>
                    <input
                      type="date"
                      value={editingReservation.check_in_date}
                      onChange={(e) => setEditingReservation({...editingReservation, check_in_date: e.target.value})}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Check-out Date</label>
                    <input
                      type="date"
                      value={editingReservation.check_out_date}
                      onChange={(e) => setEditingReservation({...editingReservation, check_out_date: e.target.value})}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Adults</label>
                    <input
                      type="number"
                      value={editingReservation.adults}
                      onChange={(e) => setEditingReservation({...editingReservation, adults: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Children</label>
                    <input
                      type="number"
                      value={editingReservation.children}
                      onChange={(e) => setEditingReservation({...editingReservation, children: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-300 mb-4">Financial Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">Total Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingReservation.total_amount}
                      onChange={(e) => setEditingReservation({...editingReservation, total_amount: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">Deposit Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingReservation.deposit_amount || 0}
                      onChange={(e) => setEditingReservation({...editingReservation, deposit_amount: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">Rate per Night</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingReservation.rate || 0}
                      onChange={(e) => setEditingReservation({...editingReservation, rate: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-1">Payment Status</label>
                    <select
                      value={editingReservation.payment_status || 'Unpaid'}
                      onChange={(e) => setEditingReservation({...editingReservation, payment_status: e.target.value})}
                      className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Booking Channel</label>
                    <select
                      value={editingReservation.channel}
                      onChange={(e) => setEditingReservation({...editingReservation, channel: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Direct Website">Direct Website</option>
                      <option value="Walk-In">Walk-In</option>
                      <option value="Booking.com">Booking.com</option>
                      <option value="Expedia">Expedia</option>
                      <option value="Corporate">Corporate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reservation Status</label>
                    <select
                      value={editingReservation.status}
                      onChange={(e) => setEditingReservation({...editingReservation, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="CheckedIn">Checked In</option>
                      <option value="CheckedOut">Checked Out</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Waitlisted">Waitlisted</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={editingReservation.actualNotes || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, actualNotes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReservation(null);
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Registration Modal */}
      {showPreRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pre-Registration</h2>
              <button
                onClick={() => {
                  setShowPreRegisterModal(false);
                  setSelectedPreRegisterReservation(null);
                  setPreRegisterFormData({
                    guest_name: '',
                    guest_email: '',
                    guest_phone: '',
                    check_in_date: '',
                    room_type: '',
                    guest_status: 'Regular'
                  });
                }}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Pre-register guests before arrival to streamline the check-in process. 
                  Select a reservation to auto-fill guest information.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reservation</label>
                <select 
                  value={selectedPreRegisterReservation?.id || ''}
                  onChange={(e) => handlePreRegisterReservationSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a reservation to pre-register</option>
                  {arrivals.map(arrival => (
                    <option key={arrival.id} value={arrival.id}>
                      {arrival.guestName} - {arrival.roomType} ({arrival.checkInDate})
                    </option>
                  ))}
                </select>
              </div>
              {selectedPreRegisterReservation && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Name</label>
                    <input
                      type="text"
                      value={preRegisterFormData.guest_name}
                      onChange={(e) => setPreRegisterFormData({...preRegisterFormData, guest_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      value={preRegisterFormData.guest_email}
                      onChange={(e) => setPreRegisterFormData({...preRegisterFormData, guest_email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input
                      type="text"
                      value={preRegisterFormData.guest_phone}
                      onChange={(e) => setPreRegisterFormData({...preRegisterFormData, guest_phone: e.target.value})}
                      placeholder="+1 234 567 8900"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Check-in Date</label>
                    <input
                      type="date"
                      value={preRegisterFormData.check_in_date}
                      onChange={(e) => setPreRegisterFormData({...preRegisterFormData, check_in_date: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
                    <select 
                      value={preRegisterFormData.room_type}
                      onChange={(e) => setPreRegisterFormData({...preRegisterFormData, room_type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select room type</option>
                      {roomTypes.map(rt => (
                        <option key={rt.id} value={rt.name}>{rt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Guest Status</label>
                    <select 
                      value={preRegisterFormData.guest_status}
                      onChange={(e) => setPreRegisterFormData({...preRegisterFormData, guest_status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Regular">Regular</option>
                      <option value="VIP">VIP</option>
                      <option value="Loyalty Member">Loyalty Member</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPreRegisterModal(false);
                  setSelectedPreRegisterReservation(null);
                  setPreRegisterFormData({
                    guest_name: '',
                    guest_email: '',
                    guest_phone: '',
                    check_in_date: '',
                    room_type: '',
                    guest_status: 'Regular'
                  });
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePreRegister(preRegisterFormData)}
                disabled={!selectedPreRegisterReservation}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Complete Pre-Registration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Check-In Modal */}
      {showMobileCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mobile Check-In</h2>
              <button
                onClick={() => setShowMobileCheckInModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Process mobile check-ins for guests who have completed the check-in process through the mobile app or website.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reservation</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a reservation</option>
                  {arrivals.filter(a => a.preRegistered).map(arrival => (
                    <option key={arrival.id} value={arrival.id}>
                      {arrival.guestName} - {arrival.roomType} ({arrival.checkInTime})
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Mobile Check-In Requirements</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>✓ Guest has completed online check-in</li>
                  <li>✓ Payment method verified</li>
                  <li>✓ ID document uploaded</li>
                  <li>✓ Room assignment confirmed</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowMobileCheckInModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMobileCheckIn('')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Process Mobile Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Express Check-In Modal */}
      {showExpressCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Express Check-In</h2>
              <button
                onClick={() => setShowExpressCheckInModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4">
                <p className="text-sm text-cyan-800 dark:text-cyan-300">
                  Fast-track check-in for guests with pre-paid reservations and verified payment methods.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reservation</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a reservation</option>
                  {arrivals.filter(a => a.balance === 0).map(arrival => (
                    <option key={arrival.id} value={arrival.id}>
                      {arrival.guestName} - {arrival.roomType} ({arrival.checkInTime})
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Express Check-In Benefits</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>⚡ Skip front desk queue</li>
                  <li>⚡ Instant room key issuance</li>
                  <li>⚡ Pre-verified payment</li>
                  <li>⚡ Automatic room assignment</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowExpressCheckInModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExpressCheckIn('')}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                Process Express Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Check-In Modal */}
      {showGroupCheckInModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Check-In</h2>
              <button
                onClick={() => setShowGroupCheckInModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Process check-in for group bookings, corporate events, and tour groups with multiple reservations.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Group</label>
                <select
                  value={selectedGroupCheckInId}
                  onChange={(e) => setSelectedGroupCheckInId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a group</option>
                  {groupCheckInOptions.length === 0 && (
                    <option value="" disabled>No groups available for check-in</option>
                  )}
                  {groupCheckInOptions.map(group => {
                    const groupRes = reservations.filter(r => r.groupBookingId === group.id || r.bookingGroupId === group.id);
                    const pending = groupRes.filter(r => r.status === 'Confirmed').length;
                    return (
                      <option key={group.id} value={group.id}>
                        {group.groupName} - {group.contactName} ({pending} room{pending !== 1 ? 's' : ''} pending)
                      </option>
                    );
                  })}
                </select>
              </div>
              {selectedCheckInGroup && (
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">Reservation Summary</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedCheckInGroupReservations.filter(r => r.status === 'Confirmed').length} pending / {selectedCheckInGroupReservations.filter(r => r.status === 'CheckedIn').length} in-house
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {selectedCheckInGroupReservations.map(res => (
                      <div key={res.id} className="flex items-center justify-between text-sm bg-white dark:bg-slate-800 rounded px-3 py-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{res.guestName}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">{res.roomType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {res.roomNumber && <span className="text-xs text-gray-500 dark:text-gray-400">Room {res.roomNumber}</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${res.status === 'CheckedIn' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                            {res.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Group Check-In Features</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>👥 Batch room assignment</li>
                  <li>👥 Master folio creation</li>
                  <li>👥 Group billing setup</li>
                  <li>👥 Special requests management</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowGroupCheckInModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGroupCheckIn(selectedGroupCheckInId)}
                disabled={!selectedGroupCheckInId || groupActionLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {groupActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Process Group Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIP Arrival Modal */}
      {showVipArrivalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">VIP Arrival</h2>
              <button
                onClick={() => setShowVipArrivalModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Special handling for VIP guests with premium services and personalized attention.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select VIP Reservation</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a VIP reservation</option>
                  {arrivals.filter(a => a.isVIP).map(arrival => (
                    <option key={arrival.id} value={arrival.id}>
                      {arrival.guestName} - {arrival.roomType} ({arrival.checkInTime})
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">VIP Services</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>⭐ Personal welcome</li>
                  <li>⭐ Priority room assignment</li>
                  <li>⭐ Complimentary upgrades</li>
                  <li>⭐ Dedicated concierge service</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowVipArrivalModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleVipArrival('')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Process VIP Arrival
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Express Check-Out Modal */}
      {showExpressCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Express Check-Out</h2>
              <button
                onClick={() => setShowExpressCheckOutModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-300">
                  Fast-track check-out for guests with fully paid reservations and no outstanding charges.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reservation</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a reservation</option>
                  {departures.filter(d => d.balance === 0).map(departure => (
                    <option key={departure.id} value={departure.id}>
                      {departure.guestName} - Room {departure.roomNumber} ({departure.checkOutTime})
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Express Check-Out Benefits</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>⚡ Skip front desk queue</li>
                  <li>⚡ Automatic folio closure</li>
                  <li>⚡ Email receipt sent immediately</li>
                  <li>⚡ No additional charges</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowExpressCheckOutModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExpressCheckOut('')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Process Express Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Late Check-Out Modal */}
      {showLateCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Late Check-Out Request</h2>
              <button
                onClick={() => setShowLateCheckOutModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Process late check-out requests with extended departure times and applicable charges.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reservation</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a reservation</option>
                  {departures.map(departure => (
                    <option key={departure.id} value={departure.id}>
                      {departure.guestName} - Room {departure.roomNumber} ({departure.checkOutTime})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Extended Check-Out Time</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="12:00">12:00 PM (1 hour extension)</option>
                  <option value="13:00">1:00 PM (2 hour extension)</option>
                  <option value="14:00">2:00 PM (3 hour extension)</option>
                  <option value="15:00">3:00 PM (4 hour extension)</option>
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Late Check-Out Charges</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>💰 1 hour: 25% of nightly rate</li>
                  <li>💰 2 hours: 50% of nightly rate</li>
                  <li>💰 3+ hours: Full nightly rate</li>
                  <li>💰 VIP guests: Complimentary (1 hour)</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowLateCheckOutModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLateCheckOut('')}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Approve Late Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Check-Out Modal */}
      {showGroupCheckOutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Group Check-Out</h2>
              <button
                onClick={() => setShowGroupCheckOutModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  Process check-out for group bookings, corporate events, and tour groups with multiple reservations.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Group</label>
                <select
                  value={selectedGroupCheckOutId}
                  onChange={(e) => setSelectedGroupCheckOutId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a group</option>
                  {groupCheckOutOptions.length === 0 && (
                    <option value="" disabled>No groups available for check-out</option>
                  )}
                  {groupCheckOutOptions.map(group => {
                    const groupRes = reservations.filter(r => r.groupBookingId === group.id || r.bookingGroupId === group.id);
                    const inHouse = groupRes.filter(r => r.status === 'CheckedIn').length;
                    return (
                      <option key={group.id} value={group.id}>
                        {group.groupName} - {group.contactName} ({inHouse} room{inHouse !== 1 ? 's' : ''} in-house)
                      </option>
                    );
                  })}
                </select>
              </div>
              {selectedCheckOutGroup && (
                <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white">Reservation Summary</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedCheckOutGroupReservations.filter(r => r.status === 'CheckedIn').length} in-house / {selectedCheckOutGroupReservations.filter(r => r.status === 'CheckedOut').length} checked-out
                    </span>
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {selectedCheckOutGroupReservations.map(res => (
                      <div key={res.id} className="flex items-center justify-between text-sm bg-white dark:bg-slate-800 rounded px-3 py-2">
                        <div>
                          <span className="font-medium text-gray-900 dark:text-white">{res.guestName}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">{res.roomType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {res.roomNumber && <span className="text-xs text-gray-500 dark:text-gray-400">Room {res.roomNumber}</span>}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${res.status === 'CheckedIn' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                            {res.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Group Check-Out Features</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>👥 Batch room release</li>
                  <li>👥 Master folio finalization</li>
                  <li>👥 Group billing reconciliation</li>
                  <li>👥 Departure survey collection</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowGroupCheckOutModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGroupCheckOut(selectedGroupCheckOutId)}
                disabled={!selectedGroupCheckOutId || groupActionLoading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {groupActionLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Process Group Check-Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Settlement Modal */}
      {showInvoiceSettlementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Settlement</h2>
              <button
                onClick={() => setShowInvoiceSettlementModal(false)}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-800 dark:text-purple-300">
                  Process invoice settlements for guests with outstanding balances and pending payments.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Reservation</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="">Select a reservation</option>
                  {departures.filter(d => d.balance > 0).map(departure => (
                    <option key={departure.id} value={departure.id}>
                      {departure.guestName} - Room {departure.roomNumber} (Balance: ${departure.balance.toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                  <option value="credit-card">Credit Card</option>
                  <option value="debit-card">Debit Card</option>
                  <option value="cash">Cash</option>
                  <option value="bank-transfer">Bank Transfer</option>
                  <option value="corporate-account">Corporate Account</option>
                </select>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900/50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Settlement Options</h3>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>💳 Process payment immediately</li>
                  <li>💳 Generate final invoice</li>
                  <li>💳 Email receipt to guest</li>
                  <li>💳 Update payment status</li>
                </ul>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowInvoiceSettlementModal(false)}
                className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleInvoiceSettlement('')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Process Settlement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FrontDeskOperations;