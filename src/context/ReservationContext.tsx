/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { 
  Room, Reservation, GroupBooking, CorporateAccount, 
  Promotion, RatePlan, Season, Package, ReservationStatus, 
  FolioCharge, FolioPayment, RoomStatus
} from '../types/erp';
import { calculateNights } from '../utils/billing';
import { toISODate } from '../utils/date';
import { 
  initialRooms, initialReservations, initialGroupBookings, 
  initialCorporateAccounts, initialPromotions, initialRatePlans, 
  initialSeasons, initialPackages 
} from './initialState';
import { useSystem } from './SystemContext';
import { useGuest } from './GuestContext';
import { supabaseService } from '../services/supabaseService';
import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { getTypeAvailability, TypeAvailability, rangesOverlap } from '../services/allocationService';
import { mapRoomFromDb, mapReservationFromDb, mapGroupBookingFromDb } from '../services/dataMapper';

export interface ReservationContextType {
  rooms: Room[];
  reservations: Reservation[];
  groupBookings: GroupBooking[];
  corporateAccounts: CorporateAccount[];
  promotions: Promotion[];
  ratePlans: RatePlan[];
  seasons: Season[];
  packages: Package[];
  
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<string>;
  updateReservation: (id: string, updates: Partial<Reservation>) => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  updateDepositStatus: (id: string, isPaid: boolean) => void;
  assignRoomToReservation: (id: string, roomNumber: string) => Promise<void>;
  changeRoom: (id: string, newRoomNumber: string) => Promise<void>;
  promoteFromWaitlist: (id: string) => void;
  
  addFolioCharge: (reservationId: string, charge: Omit<FolioCharge, 'id' | 'date'>) => Promise<void>;
  editFolioCharge: (reservationId: string, chargeId: string, updates: Partial<FolioCharge>) => void;
  voidFolioCharge: (reservationId: string, chargeId: string) => Promise<void>;
  moveFolioCharge: (sourceReservationId: string, targetReservationId: string, chargeId: string) => Promise<void>;
  addFolioPayment: (reservationId: string, payment: Omit<FolioPayment, 'id' | 'date'> | Array<Omit<FolioPayment, 'id' | 'date'>>) => Promise<any>;
  voidFolioPayment: (reservationId: string, paymentId: string) => Promise<void>;
  getFolioBalance: (reservationId: string, folioType?: 'consolidated' | 'folio-a' | 'folio-b') => Promise<number | null>;

  addGroupBooking: (group: Omit<GroupBooking, 'id'>) => Promise<GroupBooking | undefined>;
  updateGroupBookingStatus: (id: string, status: GroupBooking['status']) => void;
  addCorporateAccount: (account: Omit<CorporateAccount, 'id'>) => void;
  updateCorporateAccount: (id: string, updates: Partial<CorporateAccount>) => void;
  
  addPromotion: (promo: Omit<Promotion, 'id'>) => void;
  addRatePlan: (plan: Omit<RatePlan, 'id'>) => void;
  updateRatePlan: (id: string, updates: Partial<RatePlan>) => void;
  deleteRatePlan: (id: string) => void;
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  deletePackage: (id: string) => void;
  addSeason: (season: Omit<Season, 'id'>) => void;
  updateSeason: (id: string, updates: Partial<Season>) => void;
  deleteSeason: (id: string) => void;
  
  setRoomStatus: (roomNumber: string, status: RoomStatus) => void;
  addRoom: (roomData: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;

  getTypeAvailability: (roomType: string, checkInDate: string, checkOutDate: string, excludeReservationId?: string) => TypeAvailability;
  refreshData: () => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

export const useReservation = () => {
  const context = useContext(ReservationContext);
  if (!context) throw new Error('useReservation must be used within a ReservationProvider');
  return context;
};

export const ReservationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logAudit, addNotification, addDispatchedEmail, globalHotelSettings, currentPropertyId } = useSystem();
  const { addGuest, guests, setGuests } = useGuest();

  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>(initialGroupBookings);
  const [corporateAccounts, setCorporateAccounts] = useState<CorporateAccount[]>(initialCorporateAccounts);
  const [promotions, setPromotions] = useState<Promotion[]>(initialPromotions);
  const [ratePlans, setRatePlans] = useState<RatePlan[]>(initialRatePlans);
  const [seasons, setSeasons] = useState<Season[]>(initialSeasons);
  const [packages, setPackages] = useState<Package[]>(initialPackages);

  const refreshData = useCallback(async () => {
    if (!supabaseService.isConfigured()) return;
    try {
      const [
        fetchedRooms,
        fetchedReservations,
        fetchedGroupBookings,
        fetchedCorporateAccounts,
        fetchedRatePlans,
        fetchedSeasons,
        fetchedPackages
      ] = await Promise.all([
        supabaseService.fetchRooms(currentPropertyId),
        supabaseService.fetchReservations(currentPropertyId),
        supabaseService.fetchGroupBookings(),
        supabaseService.fetchCorporateAccounts(),
        supabaseService.fetchRatePlans(),
        supabaseService.fetchSeasons(),
        supabaseService.fetchPackages()
      ]);
      if (fetchedRooms.length > 0) setRooms(fetchedRooms);
      if (fetchedReservations.length > 0) setReservations(fetchedReservations);
      if (fetchedGroupBookings.length > 0) setGroupBookings(fetchedGroupBookings);
      if (fetchedCorporateAccounts.length > 0) setCorporateAccounts(fetchedCorporateAccounts);
      if (fetchedRatePlans.length > 0) setRatePlans(fetchedRatePlans);
      if (fetchedSeasons.length > 0) setSeasons(fetchedSeasons);
      if (fetchedPackages.length > 0) setPackages(fetchedPackages);
    } catch (error) {
      console.error("Failed to fetch Supabase state:", error);
    }
  }, [currentPropertyId]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  // ── Delta-based realtime subscriptions ─────────────────────────────────────
  // Instead of refetching entire tables on every postgres_changes event,
  // we apply the payload delta directly to state and only fall back to a
  // full refresh if the delta is ambiguous. A 500ms debounce batches
  // bursts of changes (e.g. bulk operations) into a single refresh.

  const pendingRefresh = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleFallbackRefresh = useCallback(() => {
    if (pendingRefresh.current) clearTimeout(pendingRefresh.current);
    pendingRefresh.current = setTimeout(() => {
      refreshData();
    }, 500);
  }, [refreshData]);

  React.useEffect(() => {
    if (!hasSupabaseConfig) return;

    let isCancelled = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let reconnectAttempts = 0;

    const setupChannel = () => {
      if (isCancelled) return;
      channel = supabase
      .channel('erp-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, (payload: any) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        try {
          if (eventType === 'INSERT' && newRow) {
            const mapped = mapReservationFromDb(newRow) as unknown as Reservation;
            setReservations(prev => prev.some(r => r.id === mapped.id) ? prev : [...prev, mapped]);
          } else if (eventType === 'UPDATE' && newRow) {
            const mapped = mapReservationFromDb(newRow) as unknown as Reservation;
            setReservations(prev => prev.map(r => r.id === mapped.id ? mapped : r));
          } else if (eventType === 'DELETE' && oldRow) {
            const oldId = String(oldRow.id ?? '');
            setReservations(prev => prev.filter(r => r.id !== oldId));
          } else {
            scheduleFallbackRefresh();
          }
        } catch (error) {
          console.error('Realtime: Failed to apply reservation delta, falling back:', error);
          scheduleFallbackRefresh();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, (payload: any) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        try {
          if (eventType === 'INSERT' && newRow) {
            const mapped = mapRoomFromDb(newRow) as unknown as Room;
            setRooms(prev => prev.some(r => r.id === mapped.id) ? prev : [...prev, mapped]);
          } else if (eventType === 'UPDATE' && newRow) {
            const mapped = mapRoomFromDb(newRow) as unknown as Room;
            setRooms(prev => prev.map(r => r.id === mapped.id ? mapped : r));
          } else if (eventType === 'DELETE' && oldRow) {
            const oldId = String(oldRow.id ?? '');
            setRooms(prev => prev.filter(r => r.id !== oldId));
          } else {
            scheduleFallbackRefresh();
          }
        } catch (error) {
          console.error('Realtime: Failed to apply room delta, falling back:', error);
          scheduleFallbackRefresh();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'group_bookings' }, (payload: any) => {
        const { eventType, new: newRow, old: oldRow } = payload;
        try {
          if (eventType === 'INSERT' && newRow) {
            const mapped = mapGroupBookingFromDb(newRow) as unknown as GroupBooking;
            setGroupBookings(prev => prev.some(g => g.id === mapped.id) ? prev : [...prev, mapped]);
          } else if (eventType === 'UPDATE' && newRow) {
            const mapped = mapGroupBookingFromDb(newRow) as unknown as GroupBooking;
            setGroupBookings(prev => prev.map(g => g.id === mapped.id ? mapped : g));
          } else if (eventType === 'DELETE' && oldRow) {
            const oldId = String(oldRow.id ?? '');
            setGroupBookings(prev => prev.filter(g => g.id !== oldId));
          } else {
            scheduleFallbackRefresh();
          }
        } catch (error) {
          console.error('Realtime: Failed to apply group_booking delta, falling back:', error);
          scheduleFallbackRefresh();
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          reconnectAttempts = 0;
          console.log('Realtime: Successfully subscribed to ERP tables');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.warn(`Realtime: Channel ${status}, will retry...`);
          if (channel && !isCancelled) {
            supabase.removeChannel(channel);
            channel = null;
          }
          if (!isCancelled) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            reconnectAttempts++;
            reconnectTimer = setTimeout(() => {
              console.log(`Realtime: Reconnecting (attempt ${reconnectAttempts})...`);
              setupChannel();
            }, delay);
          }
        }
      });
    };

    setupChannel();

    return () => {
      isCancelled = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (pendingRefresh.current) clearTimeout(pendingRefresh.current);
      if (channel) {
        try { supabase.removeChannel(channel); } catch (e) { /* HMR race — ignore */ }
      }
    };
  }, [scheduleFallbackRefresh]);

  // BroadcastChannel listener for cross-tab booking notifications
  React.useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      broadcastChannel = new BroadcastChannel('seleda-booking-updates');
      broadcastChannel.onmessage = (event) => {
        console.log('Admin dashboard: Received booking notification from public page:', event.data);
        if (event.data.type === 'NEW_BOOKING') {
          // Refresh reservations immediately when a new booking is created
          refreshData();
        }
      };
    } catch (e) {
      console.log('BroadcastChannel not supported:', e);
    }

    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [refreshData]);

  const addReservation = useCallback(async (resData: Omit<Reservation, 'id'>): Promise<string> => {
    const newId = `R-${Math.floor(1000 + Math.random() * 9000)}`;
    const days = calculateNights(resData.checkInDate, resData.checkOutDate);
    const nights = days > 0 ? days : 1;
    const status: ReservationStatus = resData.channel === 'Walk-In' ? resData.status : 'Waitlisted';

    // ── Availability guard ──────────────────────────────────────────────
    // Prevent overbooking before the reservation enters local state and is
    // persisted to Supabase. Only confirmed-consuming statuses (Confirmed /
    // CheckedIn) consume physical inventory; Waitlisted bookings are
    // overflow-tolerant by design and are validated at promotion time.
    if (status === 'Confirmed' || status === 'CheckedIn') {
      const avail = getTypeAvailability(
        resData.roomType, resData.checkInDate, resData.checkOutDate,
        rooms, reservations
      );
      if (avail.available <= 0) {
        throw new Error(
          `No ${resData.roomType} rooms available for ${resData.checkInDate} to ${resData.checkOutDate} ` +
          `(${avail.booked} of ${avail.capacity} booked).`
        );
      }
    }

    // If a specific room number is assigned, verify it isn't already booked
    // by another confirmed-consuming reservation for overlapping dates.
    // Query the database directly to avoid stale in-memory state issues.
    if (resData.roomNumber && hasSupabaseConfig) {
      const { data: conflicts, error } = await supabase
        .from('reservations')
        .select('id, guest_name, check_in_date, check_out_date')
        .eq('room_number', resData.roomNumber)
        .in('status', ['Confirmed', 'CheckedIn'])
        .neq('id', newId)
        .lt('check_in_date', resData.checkOutDate)
        .gt('check_out_date', resData.checkInDate)
        .limit(1);
      
      if (error) {
        console.error('Error checking room conflicts:', error);
      }
      
      if (conflicts && conflicts.length > 0) {
        const conflict = conflicts[0];
        throw new Error(
          `Room ${resData.roomNumber} is already booked for the selected dates ` +
          `(by reservation ${conflict.id} - ${conflict.guest_name}).`
        );
      }
    } else if (resData.roomNumber) {
      // Fallback to in-memory check if Supabase is not configured
      const conflict = reservations.find(r =>
        r.id !== newId &&
        r.roomNumber === resData.roomNumber &&
        (r.status === 'Confirmed' || r.status === 'CheckedIn') &&
        rangesOverlap(resData.checkInDate, resData.checkOutDate, r.checkInDate, r.checkOutDate)
      );
      if (conflict) {
        throw new Error(
          `Room ${resData.roomNumber} is already booked for the selected dates ` +
          `(by reservation ${conflict.id}).`
        );
      }
    }

    // Itemize selected packages as separate pre-tax folio charges so package
    // revenue is preserved and visible on the folio.
    let packageTotal = 0;
    const packageCharges: FolioCharge[] = [];
    (resData.packageIds || []).forEach(pkgId => {
      const pkg = packages.find(p => p.id === pkgId);
      if (!pkg) return;
      const amount = pkg.chargeFrequency === 'daily' ? pkg.price * nights : pkg.price;
      packageTotal += amount;
      packageCharges.push({
        id: `PKG-${newId}-${pkgId}`,
        amount,
        description: `Package: ${pkg.name}`,
        date: resData.checkInDate,
        type: 'Extra'
      });
    });

    // The base room charge must reflect the caller's pre-tax room total
    // (which already includes seasonal + yield multipliers). Fall back to
    // rate * nights only when no richer total was provided.
    const providedTotal = resData.totalAmount || 0;
    const roomBase = providedTotal > packageTotal
      ? providedTotal - packageTotal
      : resData.rate * nights;

    const charges: FolioCharge[] = [
      {
        id: `BC-${newId}`,
        amount: roomBase,
        description: `Base Room Tariff block (${resData.roomType}): ${resData.checkInDate} to ${resData.checkOutDate}`,
        date: resData.checkInDate
      },
      ...packageCharges
    ];

    const newRes: Reservation = {
      ...resData,
      id: newId,
      status,
      totalAmount: 0, // Will be fetched from DB
      charges
    };
    
    setReservations(prev => [...prev, newRes]);
    if (supabaseService.isConfigured()) {
      supabaseService.upsertReservation(newRes).catch(console.error);
    }

    logAudit(`New reservation ${newId} created for ${resData.guestName} (${resData.channel}).`);
    return newId;
  }, [logAudit, packages, rooms, reservations]);

  const updateReservation = useCallback(async (id: string, updates: Partial<Reservation>): Promise<void> => {
    // Check for room conflicts when roomNumber is being changed.
    // Use the server-side assign_room RPC for DB-level conflict checking
    // to avoid stale in-memory state issues.
    if (updates.roomNumber !== undefined) {
      const res = reservations.find(r => r.id === id);
      if (res && updates.roomNumber !== res.roomNumber) {
        if (supabaseService.isConfigured()) {
          try {
            const response = await fetch(`/api/${id}/assign-room`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ roomNumber: updates.roomNumber }),
            });
            if (!response.ok) {
              const data = await response.json();
              addNotification(
                data.error || `Cannot assign Room ${updates.roomNumber}: conflict detected.`,
                'error', 'Front Office'
              );
              return;
            }
          } catch (error) {
            addNotification(
              `Network error assigning Room ${updates.roomNumber}: ${String(error)}`,
              'error', 'Front Office'
            );
            return;
          }
        } else {
          // Fallback to in-memory check if Supabase is not configured
          const newRoom = updates.roomNumber;
          const checkIn = updates.checkInDate || res.checkInDate;
          const checkOut = updates.checkOutDate || res.checkOutDate;
          const conflict = reservations.find(r =>
            r.id !== id &&
            r.roomNumber === newRoom &&
            (r.status === 'Confirmed' || r.status === 'CheckedIn') &&
            rangesOverlap(checkIn, checkOut, r.checkInDate, r.checkOutDate)
          );
          if (conflict) {
            addNotification(
              `Cannot assign Room ${newRoom}: already booked by reservation ${conflict.id} ` +
              `(${conflict.guestName}) for overlapping dates.`,
              'error', 'Front Office'
            );
            return;
          }
        }
      }
    }

    setReservations(prev => {
      const next = prev.map(r => {
        if (r.id === id) {
          const updatedRes = { ...r, ...updates };
          if (updates.checkInDate || updates.checkOutDate || updates.rate) {
            const days = calculateNights(updatedRes.checkInDate, updatedRes.checkOutDate);
            const newBaseAmount = updatedRes.rate * days;
            const updatedCharges = (updatedRes.charges || []).map(c => {
              if (c.id === `BC-${id}`) {
                return {
                  ...c,
                  amount: newBaseAmount,
                  description: `Base Room Tariff block (${updatedRes.roomType}): ${updatedRes.checkInDate} to ${updatedRes.checkOutDate}`,
                  date: updatedRes.checkInDate
                };
              }
              return c;
            });
            const finalRes = { ...updatedRes, charges: updatedCharges, totalAmount: 0 };
            if (supabaseService.isConfigured()) supabaseService.upsertReservation(finalRes).catch(console.error);
            // Fetch updated total from DB
            fetch(`/api/${id}/total`, { credentials: 'include' })
              .then(res => res.json())
              .then(data => {
                setReservations(prev => prev.map(r => r.id === id ? { ...r, totalAmount: data.totalAmount || 0 } : r));
              })
              .catch(console.error);
            return finalRes;
          }
          if (supabaseService.isConfigured()) supabaseService.upsertReservation(updatedRes).catch(console.error);
          return updatedRes;
        }
        return r;
      });
      return next;
    });
    logAudit(`Reservation ${id} updated.`);
  }, [logAudit, reservations, addNotification]);

  const updateReservationStatus = useCallback((id: string, status: ReservationStatus) => {
    // When promoting to a confirmed-consuming status, verify availability
    if (status === 'Confirmed' || status === 'CheckedIn') {
      const res = reservations.find(r => r.id === id);
      if (res && res.status !== 'Confirmed' && res.status !== 'CheckedIn') {
        const avail = getTypeAvailability(
          res.roomType, res.checkInDate, res.checkOutDate,
          rooms, reservations, id
        );
        if (avail.available <= 0) {
          addNotification(
            `Cannot set to ${status}: no ${res.roomType} rooms available ` +
            `for ${res.checkInDate} to ${res.checkOutDate} (${avail.booked} of ${avail.capacity} booked).`,
            'error', 'Front Office'
          );
          return;
        }
        // Also check room conflict if a room is assigned
        if (res.roomNumber) {
          const conflict = reservations.find(r =>
            r.id !== id &&
            r.roomNumber === res.roomNumber &&
            (r.status === 'Confirmed' || r.status === 'CheckedIn') &&
            rangesOverlap(res.checkInDate, res.checkOutDate, r.checkInDate, r.checkOutDate)
          );
          if (conflict) {
            addNotification(
              `Cannot set to ${status}: Room ${res.roomNumber} is already ` +
              `booked by reservation ${conflict.id} for these dates.`,
              'error', 'Front Office'
            );
            return;
          }
        }
      }
    }

    setReservations(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status } : r);
      if (supabaseService.isConfigured()) {
        const tgt = next.find(r => r.id === id);
        if (tgt) supabaseService.upsertReservation(tgt).catch(console.error);
      }
      return next;
    });
    logAudit(`Reservation ${id} status updated to ${status}.`);
  }, [logAudit, reservations, rooms, addNotification]);

  const updateDepositStatus = useCallback((id: string, isPaid: boolean) => {
    setReservations(prev => {
      const next = prev.map(r => r.id === id ? { ...r, isDepositPaid: isPaid } : r);
      if (supabaseService.isConfigured()) {
        const tgt = next.find(r => r.id === id);
        if (tgt) supabaseService.upsertReservation(tgt).catch(console.error);
      }
      return next;
    });
    logAudit(`Reservation ${id} deposit status updated to ${isPaid ? 'Paid' : 'Unpaid'}.`);
  }, [logAudit]);

  const assignRoomToReservation = useCallback(async (id: string, roomNumber: string): Promise<void> => {
    const res = reservations.find(r => r.id === id);
    if (!res) return;

    // Use the server-side assign_room RPC for DB-level conflict checking.
    // This prevents double-booking that the stale in-memory check would miss.
    if (supabaseService.isConfigured()) {
      try {
        const response = await fetch(`/api/${id}/assign-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ roomNumber }),
        });

        if (!response.ok) {
          const data = await response.json();
          addNotification(
            data.error || `Cannot assign Room ${roomNumber}: conflict detected.`,
            'error', 'Front Office'
          );
          return;
        }
      } catch (error) {
        addNotification(
          `Network error assigning Room ${roomNumber}: ${String(error)}`,
          'error', 'Front Office'
        );
        return;
      }
    } else {
      // Fallback to in-memory check if Supabase is not configured
      const conflict = reservations.find(r =>
        r.id !== id &&
        r.roomNumber === roomNumber &&
        (r.status === 'Confirmed' || r.status === 'CheckedIn') &&
        rangesOverlap(res.checkInDate, res.checkOutDate, r.checkInDate, r.checkOutDate)
      );
      if (conflict) {
        addNotification(
          `Cannot assign Room ${roomNumber}: already booked by reservation ${conflict.id} ` +
          `(${conflict.guestName}) for overlapping dates.`,
          'error', 'Front Office'
        );
        return;
      }
    }

    setReservations(prev => {
      const next = prev.map(r => {
        if (r.id === id) {
          const nights = Math.max(1, Math.round(
            (new Date(r.checkOutDate).getTime() - new Date(r.checkInDate).getTime()) / (1000 * 60 * 60 * 24)
          ));
          const roomNights = Array.from({ length: nights }, () => [roomNumber]);
          return { ...r, roomNumber, roomNights };
        }
        return r;
      });
      // Only upsert if Supabase is NOT configured (server-side RPC already
      // persisted the assignment when it is configured).
      if (!supabaseService.isConfigured()) {
        const tgt = next.find(r => r.id === id);
        if (tgt) supabaseService.upsertReservation(tgt).catch(console.error);
      }
      return next;
    });
    logAudit(`Assigned Room ${roomNumber} to Reservation ${id}.`);
  }, [logAudit, reservations, addNotification]);

  const changeRoom = useCallback(async (id: string, newRoomNumber: string) => {
    const res = reservations.find(r => r.id === id);
    const oldRoomNumber = res?.roomNumber;

    try {
      const response = await fetch(`/api/${id}/change-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roomNumber: newRoomNumber }),
      });

      if (!response.ok) {
        const data = await response.json();
        logAudit(`Room change failed for reservation ${id}: ${data.error || response.statusText}`);
        return;
      }

      // Update local state: reservation room + room statuses (for checked-in)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, roomNumber: newRoomNumber } : r));

      if (res?.status === 'CheckedIn') {
        setRooms(prev => prev.map(room => {
          if (oldRoomNumber && room.number === oldRoomNumber) return { ...room, status: 'Vacant Dirty' as RoomStatus };
          if (room.number === newRoomNumber) return { ...room, status: 'Occupied Clean' as RoomStatus };
          return room;
        }));
      }

      logAudit(`Reservation ${id} moved from Room ${oldRoomNumber || 'unassigned'} to Room ${newRoomNumber}.`);
    } catch (error) {
      logAudit(`Room change network error for reservation ${id}: ${String(error)}`);
    }
  }, [reservations, logAudit]);

  const promoteFromWaitlist = useCallback((id: string) => {
    const res = reservations.find(r => r.id === id);
    if (!res || res.status !== 'Waitlisted') return;

    // ── Availability guard at promotion time ────────────────────────────
    // Promoting from Waitlisted to Confirmed consumes physical inventory.
    // Verify the room type still has availability before committing.
    const avail = getTypeAvailability(
      res.roomType, res.checkInDate, res.checkOutDate,
      rooms, reservations, id
    );
    if (avail.available <= 0) {
      addNotification(
        `Cannot promote ${res.guestName}: no ${res.roomType} rooms available ` +
        `for ${res.checkInDate} to ${res.checkOutDate} (${avail.booked} of ${avail.capacity} booked).`,
        'error', 'Front Office'
      );
      return;
    }

    // If a room is already assigned, verify it isn't double-booked.
    if (res.roomNumber) {
      const conflict = reservations.find(r =>
        r.id !== id &&
        r.roomNumber === res.roomNumber &&
        (r.status === 'Confirmed' || r.status === 'CheckedIn') &&
        rangesOverlap(res.checkInDate, res.checkOutDate, r.checkInDate, r.checkOutDate)
      );
      if (conflict) {
        addNotification(
          `Cannot promote ${res.guestName}: Room ${res.roomNumber} is already ` +
          `booked by reservation ${conflict.id} for these dates.`,
          'error', 'Front Office'
        );
        return;
      }
    }

    setReservations(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status: 'Confirmed' } : r);
      if (supabaseService.isConfigured()) {
        const tgt = next.find(r => r.id === id);
        if (tgt) supabaseService.upsertReservation(tgt).catch(console.error);
      }
      return next;
    });
    addNotification(`Waitlist Promotion: ${res.guestName} has been promoted.`, 'success', 'Front Office');

    const hotelName = globalHotelSettings.customHotelName || 'Our Hotel';
    const hotelAddress = globalHotelSettings.customHotelAddress || '';
    const hotelPhone = globalHotelSettings.contactPhone || '';
    const tagline = globalHotelSettings.publicTagline || '';
    const bankDetails = globalHotelSettings.invoiceBankDetails || '';
    const graceHours = globalHotelSettings.cancellationGraceHours ?? 72;
    const penaltyPercent = globalHotelSettings.cancellationPenaltyPercent ?? 100;

    const checkIn = new Date(res.checkInDate);
    const checkOut = new Date(res.checkOutDate);
    const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const formatDate = (d: Date) => d.toLocaleDateString('en-ET', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' });

    const paymentDeadline = new Date(Date.now() + graceHours * 60 * 60 * 1000);
    const formatDeadline = (d: Date) => d.toLocaleDateString('en-ET', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    const emailBody = [
      `Dear ${res.guestName},`,
      ``,
      `Selam! We are delighted to confirm your reservation at ${hotelName}.`,
      ``,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `  BOOKING CONFIRMATION`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `  Reservation ID : ${res.id}`,
      `  Status         : ✅ CONFIRMED`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `  Room Type      : ${res.roomType}`,
      `  Check-In       : ${formatDate(checkIn)}`,
      `  Check-Out      : ${formatDate(checkOut)}`,
      `  Duration       : ${nights} Night${nights > 1 ? 's' : ''}`,
      `  Guests         : ${res.adults || 1} Adult${(res.adults || 1) > 1 ? 's' : ''}${res.children ? `, ${res.children} Child${res.children > 1 ? 'ren' : ''}` : ''}`,
      `  Nightly Rate   : ${res.rate} (excl. taxes)`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      ``,
      ...(res.notes ? [`📝 Special Requests: ${res.notes}`, ``] : []),
      ...(bankDetails ? [
        `═══════════════════════════════════`,
        `  💳 PAYMENT INSTRUCTIONS`,
        `═══════════════════════════════════`,
        `  Please transfer your deposit to:`,
        ``,
        ...bankDetails.split('\n').map(line => `  ${line}`),
        ``,
        `  Reference: Reservation ${res.id} / ${res.guestName}`,
        `═══════════════════════════════════`,
        ``,
      ] : []),
      `⚠️  IMPORTANT — PAYMENT DEADLINE`,
      `─────────────────────────────────`,
      `  Please complete your deposit payment`,
      `  by: ${formatDeadline(paymentDeadline)}`,
      ``,
      `  Failure to pay within ${graceHours} hours will`,
      `  result in automatic cancellation of your`,
      `  reservation (${penaltyPercent}% of the booking value).`,
      ``,
      `  Once payment is confirmed, your digital`,
      `  key and Guest Companion App access will`,
      `  be activated by our front office.`,
      `─────────────────────────────────`,
      ``,
      ...(hotelPhone ? [`📞 Direct Line : ${hotelPhone}`] : []),
      ...(hotelAddress ? [`📍 Address     : ${hotelAddress}`] : []),
      ``,
      ...(tagline ? [`"${tagline}"`, ``] : []),
      `Thank you for choosing ${hotelName}.`,
      `We look forward to welcoming you!`,
      ``,
      `Warm regards,`,
      `${hotelName} — Reservations Team`,
    ].join('\n');

    addDispatchedEmail({
      reservationId: id,
      recipientEmail: res.guestEmail,
      recipientName: res.guestName,
      subject: `✅ Booking Confirmed — ${hotelName} (Res #${id})`,
      body: emailBody,
      linkUrl: `/guest?resId=${id}`
    });
    logAudit(`Promoted Reservation ${id} from waitlist.`);
  }, [reservations, rooms, globalHotelSettings, addNotification, addDispatchedEmail, logAudit]);

  const addFolioCharge = useCallback(async (reservationId: string, charge: Omit<FolioCharge, 'id' | 'date'>) => {
    try {
      const response = await fetch(`/api/${reservationId}/charges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          description: charge.description,
          amount: charge.amount,
          quantity: 1,
          lineType: charge.type || 'Extra',
          targetFolio: charge.targetFolio ?? null,
          // USALI tracking fields
          usaliCode: charge.usaliCode,
          usaliRevenueCode: charge.usaliRevenueCode,
          usaliCostCode: charge.usaliCostCode,
          department: charge.department,
        }),
      });

      if (!response.ok) {
        console.error('Failed to add folio charge:', await response.json());
        return;
      }

      const result = await response.json();

      setReservations(prev => {
        const next = prev.map(r => {
          if (r.id === reservationId) {
            const newCharge = { ...charge, id: result.lineId || result.lineNumber?.toString() || `C-${Date.now()}`, date: toISODate() };
            const updatedCharges = [...(r.charges || []), newCharge];
            // Fetch updated total from DB
            fetch(`/api/${reservationId}/total`, { credentials: 'include' })
              .then(res => res.json())
              .then(data => {
                setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, totalAmount: data.totalAmount || 0 } : r));
              })
              .catch(console.error);
            return { ...r, charges: updatedCharges, totalAmount: 0 };
          }
          return r;
        });
        return next;
      });
    } catch (error) {
      console.error('Error adding folio charge:', error);
    }
  }, []);

  const editFolioCharge = useCallback((reservationId: string, chargeId: string, updates: Partial<FolioCharge>) => {
    // Optimistic local update
    setReservations(prev => {
      const next = prev.map(r => {
        if (r.id === reservationId) {
          const updatedCharges = (r.charges || []).map(c => c.id === chargeId ? { ...c, ...updates } : c);
          // Fetch updated total from DB
          fetch(`/api/${reservationId}/total`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
              setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, totalAmount: data.totalAmount || 0 } : r));
            })
            .catch(console.error);
          return { ...r, charges: updatedCharges, totalAmount: 0 };
        }
        return r;
      });
      return next;
    });

    // Persist persistable fields (targetFolio, amount) to the DB
    const persistable: Record<string, any> = {};
    if (updates.targetFolio !== undefined) persistable.targetFolio = updates.targetFolio;
    if (updates.amount !== undefined) persistable.amount = updates.amount;
    if (Object.keys(persistable).length > 0) {
      fetch(`/api/${reservationId}/charges/${chargeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(persistable),
      }).catch(err => console.error('Failed to persist charge update:', err));
    }
  }, []);

  const voidFolioCharge = useCallback(async (reservationId: string, chargeId: string) => {
    try {
      const response = await fetch(`/api/${reservationId}/charges/${chargeId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Voided by user' }),
      });

      if (!response.ok) {
        console.error('Failed to void folio charge:', await response.json());
        return;
      }

      setReservations(prev => {
        const next = prev.map(r => {
          if (r.id === reservationId) {
            const updatedCharges = (r.charges || []).map(c => c.id === chargeId ? { ...c, isVoided: true } : c);
            // Fetch updated total from DB
            fetch(`/api/${reservationId}/total`, { credentials: 'include' })
              .then(res => res.json())
              .then(data => {
                setReservations(prev => prev.map(r => r.id === reservationId ? { ...r, totalAmount: data.totalAmount || 0 } : r));
              })
              .catch(console.error);
            return { ...r, charges: updatedCharges, totalAmount: 0 };
          }
          return r;
        });
        return next;
      });
    } catch (error) {
      console.error('Error voiding folio charge:', error);
    }
  }, []);

  const moveFolioCharge = useCallback(async (sourceReservationId: string, targetReservationId: string, chargeId: string) => {
    // The chargeId here is a folio_line id in the database
    // We need to call the API to move it between folios
    // But the API expects a folio_line ID and a target folio ID
    // For now, we update local state and rely on the reservation sync to reflect DB state
    let chargeToMove: FolioCharge | undefined;
    setReservations(prev => {
      const source = prev.find(r => r.id === sourceReservationId);
      chargeToMove = source?.charges?.find(c => c.id === chargeId);
      if (!chargeToMove) return prev;

      const next = prev.map(r => {
        if (r.id === sourceReservationId) {
          const updatedCharges = (r.charges || []).filter(c => c.id !== chargeId);
          // Fetch updated total from DB
          fetch(`/api/${sourceReservationId}/total`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
              setReservations(prev => prev.map(r => r.id === sourceReservationId ? { ...r, totalAmount: data.totalAmount || 0 } : r));
            })
            .catch(console.error);
          return { ...r, charges: updatedCharges, totalAmount: 0 };
        }
        if (r.id === targetReservationId) {
          const updatedCharges = [...(r.charges || []), chargeToMove!];
          // Fetch updated total from DB
          fetch(`/api/${targetReservationId}/total`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
              setReservations(prev => prev.map(r => r.id === targetReservationId ? { ...r, totalAmount: data.totalAmount || 0 } : r));
            })
            .catch(console.error);
          return { ...r, charges: updatedCharges, totalAmount: 0 };
        }
        return r;
      });
      return next;
    });

    // Sync to DB: the chargeId IS the folio_line ID (returned from post_folio_charge RPC)
    try {
      const response = await fetch(`/api/${sourceReservationId}/charges/${chargeId}/move`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetReservationId }),
      });

      if (!response.ok) {
        console.error('Failed to move folio charge:', await response.json());
      }
    } catch (error) {
      console.error('Error moving folio charge:', error);
    }
  }, []);

  // Unified payment poster: accepts either a single payment or an array of payment
  // splits (multiple methods/bank accounts covering one folio settlement). Both
  // shapes are funneled through the SAME backend call (`paymentSplits`), so single
  // payments are just a one-element split under the hood - one system, one code path.
  const addFolioPayment = useCallback(async (
    reservationId: string,
    payment: Omit<FolioPayment, 'id' | 'date'> | Array<Omit<FolioPayment, 'id' | 'date'>>
  ) => {
    const splits = Array.isArray(payment) ? payment : [payment];

    if (splits.length === 0 || splits.some(p => !p.method || typeof p.amount !== 'number' || p.amount <= 0)) {
      console.error('Invalid payment split(s):', splits);
      return;
    }

    try {
      const response = await fetch(`/api/${reservationId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentSplits: splits.map(p => ({
            amount: p.amount,
            paymentMethod: p.method,
            reference: p.notes,
            receiptUrl: p.receiptUrl,
            bankAccountId: p.bankAccountId || null,
          })),
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        console.error('Failed to add folio payment:', err);
        if (err.error === 'Payment amount exceeds outstanding balance') {
          throw new Error(`Payment amount ($${err.requestedAmount?.toFixed(2)}) exceeds outstanding balance ($${err.outstandingBalance?.toFixed(2)}). Please adjust the payment amount.`);
        }
        throw new Error(err.error || 'Failed to post payment');
      }

      const data = await response.json();

      setReservations(prev => prev.map(r => {
        if (r.id !== reservationId) return r;
        const newPayments = splits.map((p, i) => ({
          ...p,
          id: data.paymentResults?.[i]?.paymentId || `P-${Date.now()}-${i}`,
          date: toISODate(),
        }));
        return { ...r, payments: [...(r.payments || []), ...newPayments] };
      }));

      return data;
    } catch (error) {
      console.error('Error adding folio payment:', error);
      throw error;
    }
  }, []);

  const voidFolioPayment = useCallback(async (reservationId: string, paymentId: string) => {
    try {
      const response = await fetch(`/api/${reservationId}/payments/${paymentId}/void`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'Voided by user' }),
      });

      if (!response.ok) {
        console.error('Failed to void folio payment:', await response.json());
        return;
      }

      setReservations(prev => {
        const next = prev.map(r => {
          if (r.id === reservationId) {
            const updatedPayments = (r.payments || []).map(p => p.id === paymentId ? { ...p, isVoided: true } : p);
            return { ...r, payments: updatedPayments };
          }
          return r;
        });
        return next;
      });
    } catch (error) {
      console.error('Error voiding folio payment:', error);
    }
  }, []);

  const getFolioBalance = useCallback(async (reservationId: string, folioType: 'consolidated' | 'folio-a' | 'folio-b' = 'consolidated') => {
    try {
      const response = await fetch(`/api/${reservationId}/folio-balance?folioType=${folioType}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch folio balance:', await response.json());
        return null;
      }

      const data = await response.json();
      return data.outstandingBalance || 0;
    } catch (error) {
      console.error('Error fetching folio balance:', error);
      return null;
    }
  }, []);

  const addGroupBooking = useCallback(async (group: Omit<GroupBooking, 'id'>): Promise<GroupBooking | undefined> => {
    try {
      const response = await fetch('/api/group-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(group),
      });

      if (!response.ok) {
        console.error('Failed to create group booking:', await response.json());
        return undefined;
      }

      const result = await response.json();
      const realGroupId = result.groupId;

      // Add group booking to local state with real DB ID
      const newGroup: GroupBooking = { ...group, id: realGroupId };
      setGroupBookings(prev => [...prev, newGroup]);
      return newGroup;
    } catch (error) {
      console.error('Error creating group booking:', error);
      return undefined;
    }
  }, []);

  const updateGroupBookingStatus = useCallback(async (id: string, status: GroupBooking['status']) => {
    setGroupBookings(prev => prev.map(g => g.id === id ? { ...g, status } : g));

    try {
      const response = await fetch(`/api/group-bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        console.error('Failed to update group booking status:', await response.json());
      }
    } catch (error) {
      console.error('Error updating group booking status:', error);
    }
  }, []);

  const addCorporateAccount = useCallback((account: Omit<CorporateAccount, 'id'>) => {
    const newAccount = { ...account, id: `CA-${Date.now()}` };
    setCorporateAccounts(prev => [...prev, newAccount]);
    if (supabaseService.isConfigured()) supabaseService.upsertCorporateAccount(newAccount).catch(console.error);
  }, []);

  const updateCorporateAccount = useCallback((id: string, updates: Partial<CorporateAccount>) => {
    setCorporateAccounts(prev => {
      const next = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      const target = next.find(a => a.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertCorporateAccount(target).catch(console.error);
      return next;
    });
  }, []);

  const addPromotion = useCallback((promo: Omit<Promotion, 'id'>) => {
    setPromotions(prev => [...prev, { ...promo, id: `P-${Date.now()}` }]);
  }, []);

  const addRatePlan = useCallback((plan: Omit<RatePlan, 'id'>) => {
    const newPlan = { ...plan, id: `RP-${Date.now()}` };
    setRatePlans(prev => [...prev, newPlan]);
    if (supabaseService.isConfigured()) supabaseService.upsertRatePlan(newPlan).catch(console.error);
  }, []);

  const updateRatePlan = useCallback((id: string, updates: Partial<RatePlan>) => {
    setRatePlans(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const target = next.find(p => p.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertRatePlan(target).catch(console.error);
      return next;
    });
  }, []);

  const deleteRatePlan = useCallback((id: string) => {
    setRatePlans(prev => prev.filter(p => p.id !== id));
    if (supabaseService.isConfigured()) supabaseService.deleteRatePlan(id).catch(console.error);
  }, []);

  const addPackage = useCallback((pkg: Omit<Package, 'id'>) => {
    const newPackage = { ...pkg, id: `PKG-${Date.now()}` };
    setPackages(prev => [...prev, newPackage]);
    if (supabaseService.isConfigured()) supabaseService.upsertPackage(newPackage).catch(console.error);
  }, []);

  const updatePackage = useCallback((id: string, updates: Partial<Package>) => {
    setPackages(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const target = next.find(p => p.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertPackage(target).catch(console.error);
      return next;
    });
  }, []);

  const deletePackage = useCallback((id: string) => {
    setPackages(prev => prev.filter(p => p.id !== id));
    if (supabaseService.isConfigured()) supabaseService.deletePackage(id).catch(console.error);
  }, []);

  const addSeason = useCallback((season: Omit<Season, 'id'>) => {
    const newSeason = { ...season, id: `S-${Date.now()}` };
    setSeasons(prev => [...prev, newSeason]);
    if (supabaseService.isConfigured()) supabaseService.upsertSeason(newSeason).catch(console.error);
  }, []);

  const updateSeason = useCallback((id: string, updates: Partial<Season>) => {
    setSeasons(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      const target = next.find(s => s.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertSeason(target).catch(console.error);
      return next;
    });
  }, []);

  const deleteSeason = useCallback((id: string) => {
    setSeasons(prev => prev.filter(s => s.id !== id));
    if (supabaseService.isConfigured()) supabaseService.deleteSeason(id).catch(console.error);
  }, []);

  const setRoomStatus = useCallback((roomNumber: string, status: RoomStatus) => {
    setRooms(prev => prev.map(r => r.number === roomNumber ? { ...r, status } : r));
    if (supabaseService.isConfigured()) supabaseService.updateRoomStatus(roomNumber, status).catch(console.error);
    logAudit(`Room ${roomNumber} status updated to ${status}.`);
  }, [logAudit]);

  const addRoom = useCallback((roomData: Omit<Room, 'id'>) => {
    const newRoom = { ...roomData, id: `RM-${Date.now()}` };
    setRooms(prev => [...prev, newRoom]);
    if (supabaseService.isConfigured()) supabaseService.upsertRooms([newRoom]).catch(console.error);
  }, []);

  const updateRoom = useCallback((id: string, updates: Partial<Room>) => {
    setRooms(prev => {
      const next = prev.map(r => r.id === id ? { ...r, ...updates } : r);
      const target = next.find(r => r.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertRooms([target]).catch(console.error);
      return next;
    });
  }, []);

  const deleteRoom = useCallback((id: string) => {
    setRooms(prev => prev.filter(r => r.id !== id));
    if (supabaseService.isConfigured()) supabaseService.deleteRoom(id).catch(console.error);
    logAudit(`Room ${id} deleted.`);
  }, [logAudit]);

  const getAvailability = useCallback((roomType: string, checkInDate: string, checkOutDate: string, excludeReservationId?: string): TypeAvailability => {
    return getTypeAvailability(roomType, checkInDate, checkOutDate, rooms, reservations, excludeReservationId);
  }, [rooms, reservations]);

  const value = {
    rooms, reservations, groupBookings, corporateAccounts, promotions,
    ratePlans, seasons, packages,
    addReservation, updateReservation, updateReservationStatus, updateDepositStatus,
    assignRoomToReservation, changeRoom, promoteFromWaitlist,
    addFolioCharge, editFolioCharge, voidFolioCharge, moveFolioCharge,
    addFolioPayment, voidFolioPayment, getFolioBalance,
    addGroupBooking, updateGroupBookingStatus, addCorporateAccount, updateCorporateAccount,
    addPromotion, addRatePlan, updateRatePlan, deleteRatePlan,
    addPackage, updatePackage, deletePackage, addSeason, updateSeason, deleteSeason,
    setRoomStatus, addRoom, updateRoom, deleteRoom,
    getTypeAvailability: getAvailability,
    refreshData
  };

  return (
    <ReservationContext.Provider value={value}>
      {children}
    </ReservationContext.Provider>
  );
};
