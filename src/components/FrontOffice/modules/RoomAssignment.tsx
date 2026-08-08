/**
 * Front Office Room Assignment Module
 * Auto and manual room assignment with preference matching
 */

import { useState, useEffect } from 'react';
import {
  BedDouble,
  Sparkles,
  Layers,
  ArrowRight,
  Lock,
  Unlock,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  Accessibility,
  Flame,
  Ban,
  Mountain,
  Star
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Create admin Supabase client for room management operations
// This uses the service role key which bypasses RLS policies
const createAdminClient = () => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || import.meta.env.SUPABASE_SERVICE_ROLE_KEY;
  return supabaseUrl && serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
};

type RoomStatus = 'available' | 'occupied' | 'house-use' | 'out-of-order' | 'out-of-service' | 'blocked';

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: string;
  wing: string;
  status: RoomStatus;
  features: string[];
  bedType?: string;
  view?: string;
  smoking?: boolean;
  accessible?: boolean;
}

interface AssignmentRequest {
  id: string;
  guestName: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  preferences: {
    floor?: string;
    bedType?: string;
    view?: string;
    smoking?: boolean;
    accessible?: boolean;
    adjacentTo?: string;
  };
  assignedRoom?: string;
}

const RoomAssignment = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter and selection state
  const [searchQuery, setSearchQuery] = useState('');
  const [roomTypeFilter, setRoomTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAssignmentType, setSelectedAssignmentType] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  // Fetch rooms from Supabase
  useEffect(() => {
    const fetchRooms = async () => {
      if (!supabase) {
        setError('Supabase client not initialized');
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*')
          .order('number');

        if (error) throw error;

        // Transform database data to match Room interface
        const transformedRooms: Room[] = data.map(room => ({
          id: room.id,
          roomNumber: room.number,
          roomType: room.type,
          floor: room.floor.toString(),
          wing: room.wing || 'Main',
          status: mapRoomStatus(room.status),
          features: room.features || [],
          bedType: extractBedType(room.features),
          view: extractView(room.features),
          smoking: room.features?.includes('smoking') || false,
          accessible: room.features?.includes('accessible') || false,
        }));

        setRooms(transformedRooms);
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();

    // Set up real-time subscription for room changes
    const subscription = supabase
      .channel('room-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        (payload) => {
          console.log('Room change detected:', payload);
          fetchRooms(); // Refresh rooms when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to map database status to UI status
  const mapRoomStatus = (dbStatus: string): RoomStatus => {
    const statusMap: Record<string, RoomStatus> = {
      'Vacant Clean': 'available',
      'Vacant Dirty': 'available',
      'Occupied Clean': 'occupied',
      'Occupied Dirty': 'occupied',
      'Out of Order': 'out-of-order',
      'House Use': 'house-use',
      'Blocked': 'blocked',
    };
    return statusMap[dbStatus] || 'available';
  };

  // Helper function to map UI status to database status
  const mapUIToDBStatus = (uiStatus: RoomStatus): string => {
    const statusMap: Record<RoomStatus, string> = {
      'available': 'Vacant Clean',
      'occupied': 'Occupied Clean',
      'house-use': 'Occupied Clean', // Use occupied for house use
      'out-of-order': 'Out of Order',
      'out-of-service': 'Out of Order',
      'blocked': 'Out of Order', // Use Out of Order for blocked rooms
    };
    return statusMap[uiStatus] || 'Vacant Clean';
  };

  // Helper function to extract bed type from features
  const extractBedType = (features: string[]): string | undefined => {
    const bedTypes = ['King', 'Queen', 'Twin', 'Double', 'Single'];
    return features?.find(f => bedTypes.some(bt => f.toLowerCase().includes(bt.toLowerCase())));
  };

  // Helper function to extract view from features
  const extractView = (features: string[]): string | undefined => {
    const views = ['Ocean', 'City', 'Mountain', 'Garden', 'Pool', 'Panoramic'];
    return features?.find(f => views.some(v => f.toLowerCase().includes(v.toLowerCase())));
  };

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = !searchQuery || 
      room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.roomType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRoomType = !roomTypeFilter || room.roomType === roomTypeFilter;
    const matchesStatus = !statusFilter || room.status === statusFilter;
    
    // Additional filtering based on assignment type
    let matchesAssignmentType = true;
    if (selectedAssignmentType === 'adjacent') {
      // Show rooms that could be adjacent (same floor, available)
      const floorRooms = rooms.filter(r => r.floor === room.floor && r.status === 'available');
      matchesAssignmentType = floorRooms.length >= 2;
    } else if (selectedAssignmentType === 'connecting') {
      // Show rooms that could be connecting (same floor, sequential numbers, available)
      const roomNum = parseInt(room.roomNumber);
      const nextRoom = rooms.find(r => 
        parseInt(r.roomNumber) === roomNum + 1 && 
        r.floor === room.floor && 
        r.status === 'available'
      );
      const prevRoom = rooms.find(r => 
        parseInt(r.roomNumber) === roomNum - 1 && 
        r.floor === room.floor && 
        r.status === 'available'
      );
      matchesAssignmentType = (nextRoom || prevRoom) !== undefined;
    } else if (selectedAssignmentType === 'accessible') {
      // Show only accessible rooms
      matchesAssignmentType = room.accessible === true;
    }
    
    return matchesSearch && matchesRoomType && matchesStatus && matchesAssignmentType;
  });

  // Refresh data handler
  const handleRefresh = async () => {
    setLoading(true);
    setAssignmentsLoading(true);
    
    try {
      // Re-fetch rooms
      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('*')
        .order('number');

      if (roomsError) throw roomsError;

      const transformedRooms: Room[] = roomsData.map(room => ({
        id: room.id,
        roomNumber: room.number,
        roomType: room.type,
        floor: room.floor.toString(),
        wing: room.wing || 'Main',
        status: mapRoomStatus(room.status),
        features: room.features || [],
        bedType: extractBedType(room.features),
        view: extractView(room.features),
        smoking: room.features?.includes('smoking') || false,
        accessible: room.features?.includes('accessible') || false,
      }));

      setRooms(transformedRooms);

      // Re-fetch assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('reservations')
        .select('*')
        .in('status', ['Confirmed', 'Waitlisted'])
        .is('room_number', null)
        .gte('check_in_date', new Date().toISOString().split('T')[0])
        .order('check_in_date', { ascending: true });

      if (assignmentsError) throw assignmentsError;

      const transformedAssignments: AssignmentRequest[] = assignmentsData.map(res => ({
        id: res.id,
        guestName: res.guest_name,
        roomType: res.room_type,
        checkIn: res.check_in_date,
        checkOut: res.check_out_date,
        adults: res.adults,
        children: res.children,
        preferences: {
          floor: res.preferences?.floor,
          bedType: res.preferences?.bed_type,
          view: res.preferences?.view,
          smoking: res.preferences?.smoking,
          accessible: res.preferences?.accessible,
          adjacentTo: res.preferences?.adjacent_to,
        },
        assignedRoom: res.room_number,
      }));

      setAssignments(transformedAssignments);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
      setAssignmentsLoading(false);
    }
  };

  // Auto assign all handler
  const handleAutoAssignAll = async () => {
    if (!supabase) return;

    try {
      const adminClient = createAdminClient();
      if (!adminClient) {
        alert('Admin client not available. Please configure VITE_SUPABASE_SERVICE_ROLE_KEY');
        return;
      }
      
      // Get all unassigned reservations
      const { data: unassignedReservations, error: fetchError } = await supabase
        .from('reservations')
        .select('*')
        .in('status', ['Confirmed', 'Waitlisted'])
        .is('room_number', null)
        .gte('check_in_date', new Date().toISOString().split('T')[0]);

      if (fetchError) throw fetchError;

      // For each reservation, find and assign an available room
      for (const reservation of unassignedReservations) {
        // Find available rooms of the correct type
        const availableRooms = rooms.filter(
          room => room.status === 'available' && room.roomType === reservation.room_type
        );

        if (availableRooms.length > 0) {
          // Simple assignment: pick first available room
          const assignedRoom = availableRooms[0];
          
          // Update reservation with room assignment
          const { error: updateError } = await adminClient
            .from('reservations')
            .update({ 
              room_number: assignedRoom.roomNumber,
              status: 'Confirmed'
            })
            .eq('id', reservation.id);

          if (updateError) throw updateError;

          // Update room status
          const { error: roomUpdateError } = await adminClient
            .from('rooms')
            .update({ status: 'Occupied Clean' })
            .eq('id', assignedRoom.id);

          if (roomUpdateError) throw roomUpdateError;
        }
      }

      // Refresh data after assignments
      await handleRefresh();
    } catch (err) {
      console.error('Error auto-assigning rooms:', err);
      setError('Failed to auto-assign rooms');
    }
  };

  // Room action handlers
  const handleBlockRoom = async (roomNumber: string) => {
    if (!supabase || !selectedRoom) return;

    const confirmed = window.confirm(`Are you sure you want to block room ${roomNumber}?`);
    if (!confirmed) return;

    try {
      console.log('Blocking room:', roomNumber);
      console.log('Selected room ID:', selectedRoom);
      
      // Use admin client with RPC function to bypass triggers
      const adminClient = createAdminClient();
      if (!adminClient) {
        alert('Admin client not available. Please configure VITE_SUPABASE_SERVICE_ROLE_KEY');
        return;
      }
      
      // Try using RPC function to bypass triggers
      const { error } = await adminClient.rpc('update_room_status_safe', {
        room_id: selectedRoom,
        new_status: 'Out of Order'
      });

      if (error) {
        console.error('RPC error:', error);
        // Fallback to direct update if RPC doesn't exist
        const { error: directError } = await adminClient
          .from('rooms')
          .update({ status: 'Out of Order' })
          .eq('id', selectedRoom);
        
        if (directError) {
          console.error('Direct update error:', directError);
          throw directError;
        }
      }
      
      console.log('Block completed successfully');
      
      // Also update any reservations for this room
      const { error: reservationError } = await adminClient
        .from('reservations')
        .update({ status: 'Cancelled' })
        .eq('room_number', roomNumber)
        .in('status', ['Confirmed', 'CheckedIn']);

      if (reservationError) {
        console.error('Reservation update error:', reservationError);
      }
      
      await handleRefresh();
      alert(`Room ${roomNumber} has been blocked successfully`);
    } catch (err) {
      console.error('Error blocking room:', err);
      setError('Failed to block room');
      alert('Failed to block room. Please try again.');
    }
  };

  const handleUnblockRoom = async (roomNumber: string) => {
    if (!supabase || !selectedRoom) return;

    const confirmed = window.confirm(`Are you sure you want to unblock room ${roomNumber}?`);
    if (!confirmed) return;

    try {
      console.log('Unblocking room:', roomNumber);
      
      const adminClient = createAdminClient();
      if (!adminClient) {
        alert('Admin client not available. Please configure VITE_SUPABASE_SERVICE_ROLE_KEY');
        return;
      }
      
      // Try using RPC function to bypass triggers
      const { error } = await adminClient.rpc('update_room_status_safe', {
        room_id: selectedRoom,
        new_status: 'Vacant Clean'
      });

      if (error) {
        console.error('RPC error:', error);
        // Fallback to direct update
        const { error: directError } = await adminClient
          .from('rooms')
          .update({ status: 'Vacant Clean' })
          .eq('id', selectedRoom);
        
        if (directError) {
          console.error('Direct update error:', directError);
          throw directError;
        }
      }
      
      console.log('Unblock completed successfully');
      
      await handleRefresh();
      alert(`Room ${roomNumber} has been unblocked successfully`);
    } catch (err) {
      console.error('Error unblocking room:', err);
      setError('Failed to unblock room');
      alert('Failed to unblock room. Please try again.');
    }
  };

  const handleLockRoom = async (roomNumber: string) => {
    if (!supabase || !selectedRoom) return;

    const room = rooms.find(r => r.id === selectedRoom);
    if (!room) return;

    const isLocked = room.features.includes('locked');
    const action = isLocked ? 'unlock' : 'lock';
    const confirmed = window.confirm(`Are you sure you want to ${action} room ${roomNumber}?`);
    if (!confirmed) return;

    try {
      console.log(`${action}ing room:`, roomNumber, 'Current features:', room.features);
      
      let updatedFeatures;
      if (isLocked) {
        updatedFeatures = room.features.filter(f => f !== 'locked');
      } else {
        updatedFeatures = [...room.features, 'locked'];
      }

      const adminClient = createAdminClient();
      if (!adminClient) {
        alert('Admin client not available. Please configure VITE_SUPABASE_SERVICE_ROLE_KEY');
        return;
      }
      
      // Try using RPC function to bypass triggers
      const { error } = await adminClient.rpc('update_room_features_safe', {
        room_id: selectedRoom,
        new_features: updatedFeatures
      });

      if (error) {
        console.error('RPC error:', error);
        // Fallback to direct update
        const { error: directError } = await adminClient
          .from('rooms')
          .update({ features: updatedFeatures })
          .eq('id', selectedRoom);
        
        if (directError) {
          console.error('Direct update error:', directError);
          throw directError;
        }
      }
      
      console.log('Lock completed successfully');
      
      await handleRefresh();
      alert(`Room ${roomNumber} has been ${action}ed successfully`);
    } catch (err) {
      console.error('Error locking room:', err);
      setError('Failed to lock room');
      alert('Failed to lock room. Please try again.');
    }
  };

  const handleOutOfOrder = async (roomNumber: string) => {
    if (!supabase || !selectedRoom) return;

    const room = rooms.find(r => r.id === selectedRoom);
    if (!room) return;

    const isOOO = room.status === 'out-of-order';
    const action = isOOO ? 'return to service' : 'set out of order';
    const newStatus = isOOO ? 'Vacant Clean' : 'Out of Order';
    
    const confirmed = window.confirm(`Are you sure you want to ${action} for room ${roomNumber}?`);
    if (!confirmed) return;

    try {
      console.log(`${action} room:`, roomNumber, 'New status:', newStatus);
      
      // Use Express API endpoint instead of direct Supabase
      const token = localStorage.getItem('hotel_erp_session') || localStorage.getItem('auth_token');
      const response = await fetch('/api/front-office/rooms/' + selectedRoom + '/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update room status');
      }
      
      console.log('OOO completed successfully');
      
      // If setting out of order, cancel any reservations
      if (!isOOO) {
        const adminClient = createAdminClient();
        if (adminClient) {
          const { error: reservationError } = await adminClient
            .from('reservations')
            .update({ status: 'Cancelled' })
            .eq('room_number', roomNumber)
            .in('status', ['Confirmed', 'CheckedIn']);

          if (reservationError) {
            console.error('Reservation update error:', reservationError);
          }
        }
      }
      
      await handleRefresh();
      alert(`Room ${roomNumber} has been ${action}ed successfully`);
    } catch (err) {
      console.error('Error setting room out of order:', err);
      setError('Failed to set room out of order');
      alert('Failed to set room out of order. Please try again.');
    }
  };

  // Assign room to reservation handler
  const handleAssignRoom = async (assignmentId: string) => {
    if (!supabase || !selectedRoom) {
      setError('Please select a room first');
      return;
    }

    try {
      const adminClient = createAdminClient();
      if (!adminClient) {
        alert('Admin client not available. Please configure VITE_SUPABASE_SERVICE_ROLE_KEY');
        return;
      }
      
      const selectedRoomData = rooms.find(r => r.id === selectedRoom);
      if (!selectedRoomData) return;

      // Update reservation with room assignment
      const { error: updateError } = await adminClient
        .from('reservations')
        .update({ 
          room_number: selectedRoomData.roomNumber,
          status: 'Confirmed'
        })
        .eq('id', assignmentId);

      if (updateError) throw updateError;

      // Update room status
      const { error: roomUpdateError } = await adminClient
        .from('rooms')
        .update({ status: 'Occupied Clean' })
        .eq('id', selectedRoomData.id);

      if (roomUpdateError) throw roomUpdateError;

      // Clear selection and refresh
      setSelectedRoom(null);
      await handleRefresh();
    } catch (err) {
      console.error('Error assigning room:', err);
      setError('Failed to assign room');
    }
  };

  // Assignment type handlers
  const handleAssignmentType = (type: string) => {
    setSelectedAssignmentType(type);
    
    switch (type) {
      case 'auto':
        // Auto assignment mode - just trigger auto assign
        handleAutoAssignAll();
        break;
      case 'manual':
        // Manual assignment - clear filters to show all available rooms
        setSearchQuery('');
        setRoomTypeFilter('');
        setStatusFilter('available');
        break;
      case 'preference-match':
        // Filter rooms based on first assignment's preferences
        if (assignments.length > 0) {
          const firstAssignment = assignments[0];
          setStatusFilter('available');
          if (firstAssignment.preferences.bedType) {
            setRoomTypeFilter(firstAssignment.roomType);
          }
        }
        break;
      case 'adjacent':
        // Show rooms that are adjacent to each other (same floor, sequential numbers)
        setStatusFilter('available');
        break;
      case 'connecting':
        // Show connecting rooms (same floor, specific room pairs)
        setStatusFilter('available');
        break;
      case 'accessible':
        // Show only accessible rooms
        setStatusFilter('available');
        setSearchQuery('accessible');
        break;
      default:
        // Reset filters
        setSearchQuery('');
        setRoomTypeFilter('');
        setStatusFilter('');
    }
  };

  const [assignments, setAssignments] = useState<AssignmentRequest[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);

  // Fetch pending assignments from Supabase
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!supabase) {
        setAssignmentsError('Supabase client not initialized');
        setAssignmentsLoading(false);
        return;
      }

      try {
        // Fetch reservations that don't have room assignments yet
        const { data, error } = await supabase
          .from('reservations')
          .select('*')
          .in('status', ['Confirmed', 'Waitlisted'])
          .is('room_number', null)
          .gte('check_in_date', new Date().toISOString().split('T')[0])
          .order('check_in_date', { ascending: true });

        if (error) throw error;

        // Transform database data to match AssignmentRequest interface
        const transformedAssignments: AssignmentRequest[] = data.map(res => ({
          id: res.id,
          guestName: res.guest_name,
          roomType: res.room_type,
          checkIn: res.check_in_date,
          checkOut: res.check_out_date,
          adults: res.adults,
          children: res.children,
          preferences: {
            floor: res.preferences?.floor,
            bedType: res.preferences?.bed_type,
            view: res.preferences?.view,
            smoking: res.preferences?.smoking,
            accessible: res.preferences?.accessible,
            adjacentTo: res.preferences?.adjacent_to,
          },
          assignedRoom: res.room_number,
        }));

        setAssignments(transformedAssignments);
      } catch (err) {
        console.error('Error fetching assignments:', err);
        setAssignmentsError('Failed to load assignments');
      } finally {
        setAssignmentsLoading(false);
      }
    };

    fetchAssignments();

    // Set up real-time subscription for reservation changes
    const subscription = supabase
      .channel('reservation-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations'
        },
        (payload) => {
          console.log('Reservation change detected:', payload);
          fetchAssignments(); // Refresh assignments when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const statusColors = {
    available: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-700',
    occupied: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700',
    'house-use': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-700',
    'out-of-order': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700',
    'out-of-service': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300 dark:border-yellow-700',
    blocked: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-300 dark:border-gray-700',
  };

  const assignmentTypes = [
    { id: 'auto', label: 'Auto Assignment', icon: Sparkles },
    { id: 'manual', label: 'Manual Assignment', icon: BedDouble },
    { id: 'preference-match', label: 'Preference Match', icon: Star },
    { id: 'adjacent', label: 'Adjacent Rooms', icon: ArrowRight },
    { id: 'connecting', label: 'Connecting Rooms', icon: Layers },
    { id: 'accessible', label: 'Accessible Rooms', icon: Accessibility },
  ];

  const roomActions = [
    { id: 'block', label: 'Block Room', icon: Lock },
    { id: 'unblock', label: 'Unblock Room', icon: Unlock },
    { id: 'lock', label: 'Room Lock', icon: Lock },
    { id: 'ooo', label: 'Out of Order', icon: XCircle },
  ];

  // Get dynamic labels based on selected room state
  const getDynamicActionLabel = (actionId: string) => {
    const selectedRoomData = rooms.find(r => r.id === selectedRoom);
    if (!selectedRoomData) return roomActions.find(a => a.id === actionId)?.label;

    switch (actionId) {
      case 'lock':
        return selectedRoomData.features.includes('locked') ? 'Unlock Room' : 'Lock Room';
      case 'ooo':
        return selectedRoomData.status === 'out-of-order' ? 'Return to Service' : 'Out of Order';
      case 'block':
        return selectedRoomData.status === 'out-of-order' ? 'Unblock Room' : 'Block Room';
      default:
        return roomActions.find(a => a.id === actionId)?.label;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Room Assignment</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Auto and manual room assignment with preference matching</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAutoAssignAll}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Auto Assign All
          </button>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Assignment Types */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {assignmentTypes.map((type) => {
          const Icon = type.icon;
          const isSelected = selectedAssignmentType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => handleAssignmentType(isSelected ? '' : type.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-sm ${
                isSelected 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`} />
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Room Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roomActions.map((action) => {
          const Icon = action.icon;
          const selectedRoomData = rooms.find(r => r.id === selectedRoom);
          const isDisabled = !selectedRoom;
          const dynamicLabel = getDynamicActionLabel(action.id);
          
          // Determine if action should show as active state
          const isActive = selectedRoomData && (
            (action.id === 'lock' && selectedRoomData.features.includes('locked')) ||
            (action.id === 'ooo' && selectedRoomData.status === 'out-of-order') ||
            (action.id === 'block' && selectedRoomData.status === 'out-of-order') // Use out-of-order for blocked
          );
          
          const handleAction = () => {
            if (!selectedRoomData) return;
            
            switch (action.id) {
              case 'block':
                handleBlockRoom(selectedRoomData.roomNumber);
                break;
              case 'unblock':
                handleUnblockRoom(selectedRoomData.roomNumber);
                break;
              case 'lock':
                handleLockRoom(selectedRoomData.roomNumber);
                break;
              case 'ooo':
                handleOutOfOrder(selectedRoomData.roomNumber);
                break;
            }
          };

          return (
            <button
              key={action.id}
              onClick={handleAction}
              disabled={isDisabled}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-colors text-sm ${
                isDisabled
                  ? 'bg-gray-100 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : isActive
                  ? 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-400'
                  : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${
                isDisabled 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : isActive 
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`} />
              {dynamicLabel}
            </button>
          );
        })}
      </div>

      {/* Pending Assignments */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pending Assignments</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {assignmentsLoading ? (
            <div className="p-4 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">Loading assignments...</div>
            </div>
          ) : assignmentsError ? (
            <div className="p-4 flex items-center justify-center">
              <div className="text-red-500">{assignmentsError}</div>
            </div>
          ) : assignments.length === 0 ? (
            <div className="p-4 flex items-center justify-center">
              <div className="text-gray-500 dark:text-gray-400">No pending assignments</div>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900 dark:text-white">{assignment.guestName}</h3>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs font-medium rounded-full">
                        {assignment.roomType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Check-In:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{new Date(assignment.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Check-Out:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{new Date(assignment.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Guests:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{assignment.adults} adults, {assignment.children} children</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Preferences:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {assignment.preferences.floor && `Floor ${assignment.preferences.floor}`}
                          {assignment.preferences.bedType && `, ${assignment.preferences.bedType}`}
                          {assignment.preferences.view && `, ${assignment.preferences.view} view`}
                          {assignment.preferences.accessible && ', Accessible'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignment.assignedRoom ? (
                      <div className="flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Room {assignment.assignedRoom}</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleAssignRoom(assignment.id)}
                        disabled={!selectedRoom}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          !selectedRoom
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        <BedDouble className="w-4 h-4" />
                        Assign Room
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Room Grid */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Available Rooms</h2>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select 
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Room Types</option>
              <option value="Standard Twin">Standard Twin</option>
              <option value="Deluxe King">Deluxe King</option>
              <option value="Suite">Suite</option>
            </select>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="out-of-order">Out of Order</option>
            </select>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500 dark:text-gray-400">Loading rooms...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${
                    selectedRoom === room.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  } ${statusColors[room.status]}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 dark:text-white">{room.roomNumber}</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{room.floor}F</span>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{room.wing}</span>
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white mt-1">{room.roomType}</div>
                    </div>
                    {room.status === 'available' && (
                      <button className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-1 text-xs">
                    {room.bedType && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <BedDouble className="w-3 h-3" />
                        {room.bedType}
                      </div>
                    )}
                    {room.view && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Mountain className="w-3 h-3" />
                        {room.view} View
                      </div>
                    )}
                    {room.accessible && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Accessibility className="w-3 h-3" />
                        Accessible
                      </div>
                    )}
                    {room.smoking && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Flame className="w-3 h-3" />
                        Smoking
                      </div>
                    )}
                    {!room.smoking && (
                      <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                        <Ban className="w-3 h-3" />
                        Non-Smoking
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {room.features.map((feature) => (
                      <span key={feature} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-xs text-gray-600 dark:text-gray-400 rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomAssignment;