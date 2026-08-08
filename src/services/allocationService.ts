/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Room, Reservation, Guest } from '../types/erp';

export interface AllocationRecommendation {
  score: number;
  matched: string[];
  warnings: string[];
  actions: string[];
  guestProfile?: Guest;
  pillowRequested: boolean;
  highFloorRequested: boolean;
  accessibleRequested: boolean;
}

/**
 * Calculates a predictive match score for a room against a reservation's needs and guest profile.
 */
export const getRoomAllocationRecommendation = (
  res: Reservation,
  room: Room,
  guests: Guest[]
): AllocationRecommendation => {
  let score = 55; // Base preference score
  const matched: string[] = ["Room Type Match"];
  const warnings: string[] = [];
  const actions: string[] = [];

  // Search CRM profiles
  const guest = guests.find(g => 
    g.name.toLowerCase() === res.guestName.toLowerCase() || 
    g.email === res.guestEmail
  );

  const specialRequestsStr = res.notes || "";
  const crmNotesStr = guest ? ((guest.specialRequests || "") + " " + (guest.notes || "")) : "";
  const fullText = (specialRequestsStr + " " + crmNotesStr).toLowerCase();

  // 1. High floor preferences
  const prefersHighFloor = fullText.includes('high floor') || fullText.includes('upper') || fullText.includes('top floor') || guest?.preferences?.roomTypePreference === 'Penthouse' || guest?.preferences?.roomTypePreference === 'Suite';
  if (prefersHighFloor) {
    if (room.floor >= 4 || room.features.includes('Top Floor View')) {
      score += 15;
      matched.push(`Floor: High floor matches preference (Floor ${room.floor})`);
    } else {
      score -= 10;
      warnings.push(`Floor: Client prefers high floor, room is on low level Floor ${room.floor}`);
    }
  }

  // 3. Accessibility matching
  const prefersAccessible = fullText.includes('accessible') || fullText.includes('wheelchair') || fullText.includes('accessible doors') || fullText.includes('ground floor') || fullText.includes('barrier-free') || fullText.includes('no stairs');
  if (prefersAccessible) {
    if (room.floor === 1 || room.features.includes('Accessible') || room.features.includes('Ground Floor')) {
      score += 15;
      matched.push("Accessibility: Seamless ground level / ADA compliance");
    } else {
      score -= 10;
      warnings.push(`Accessibility: Room floor ${room.floor} may pose stairs barrier for guest`);
    }
  }

  // 4. Pillow preferences
  const pillowPref = guest?.preferences?.pillowPreference;
  const requestsFeather = fullText.includes('feather');
  if (pillowPref === 'Feather' || requestsFeather) {
    score += 10;
    matched.push("Amenities: Feather pillow arrangement available");
    actions.push("Dispatch Feather Pillows from inventory setup");
  } else if (pillowPref) {
    score += 5;
    matched.push(`Amenities: ${pillowPref} Pillows configured in profile`);
  }

  // 5. Views and features
  if (fullText.includes('ocean') || fullText.includes('sea view') || fullText.includes('water view')) {
    if (room.features.includes('Ocean View')) {
      score += 15;
      matched.push("Amenities: Premium Ocean View");
    } else {
      score -= 5;
      warnings.push("Amenities: Lacks requested scenic ocean view");
    }
  }

  if (fullText.includes('balcony') || fullText.includes('terrace')) {
    if (room.features.includes('Balcony') || room.features.includes('Panoramic Terrace')) {
      score += 10;
      matched.push("Amenities: Private Balcony/Terrace");
    }
  }

  if (fullText.includes('desk') || fullText.includes('workspace') || fullText.includes('work')) {
    if (room.features.includes('Desk')) {
      score += 10;
      matched.push("Business: Dedicated work desk equipped");
    }
  }

  const finalScore = Math.max(0, Math.min(100, score));
  return {
    score: finalScore,
    matched,
    warnings,
    actions,
    guestProfile: guest,
    pillowRequested: pillowPref === 'Feather' || requestsFeather,
    highFloorRequested: prefersHighFloor,
    accessibleRequested: prefersAccessible
  };
};

/**
 * Calculates suggested allocations for a list of reservations and available rooms.
 */
export const calculateProposedAllocations = (
  arrivals: Reservation[],
  rooms: Room[],
  reservations: Reservation[],
  guests: Guest[]
): { reservationId: string; roomNumber: string; score: number; logs: string[] }[] => {
  const suggestions: { reservationId: string; roomNumber: string; score: number; logs: string[] }[] = [];
  const occupiedRoomNumbers = new Set(
    reservations.filter(r => r.status === 'CheckedIn').map(r => r.roomNumber)
  );
  const assignedRoomNumbersInThisTurn = new Set<string>();

  arrivals.forEach(res => {
    if (res.roomNumber) return; // Already assigned

    // Prefer roomTypeId matching (canonical after Step 2.4), fallback to type name
    const candidates = rooms.filter(r => 
      (res.roomTypeId && r.roomTypeId === res.roomTypeId) ||
      (!res.roomTypeId && r.type === res.roomType) ||
      (r.type === res.roomType) &&
      !occupiedRoomNumbers.has(r.number) && 
      !assignedRoomNumbersInThisTurn.has(r.number)
    );

    if (candidates.length === 0) return;

    const ratedCandidates = candidates.map(r => ({
      room: r,
      rec: getRoomAllocationRecommendation(res, r, guests)
    }));

    // Sort by highest score only (no room status consideration)
    ratedCandidates.sort((a, b) => b.rec.score - a.rec.score);

    const best = ratedCandidates[0];
    suggestions.push({
      reservationId: res.id,
      roomNumber: best.room.number,
      score: best.rec.score,
      logs: [`✓ Assigned Room ${best.room.number} to ${res.guestName} (${best.rec.score}% Match)`]
    });
    assignedRoomNumbersInThisTurn.add(best.room.number);
  });

  return suggestions;
};

export interface TypeAvailability {
  roomType: string;
  capacity: number;
  booked: number;
  available: number;
}

/**
 * Returns true if two date ranges [aIn, aOut) and [bIn, bOut) overlap.
 */
export const rangesOverlap = (aIn: string, aOut: string, bIn: string, bOut: string): boolean => {
  const aStart = new Date(aIn).getTime();
  const aEnd = new Date(aOut).getTime();
  const bStart = new Date(bIn).getTime();
  const bEnd = new Date(bOut).getTime();
  if ([aStart, aEnd, bStart, bEnd].some(t => isNaN(t))) return false;
  return aStart < bEnd && bStart < aEnd;
};

/**
 * Returns true if a reservation's room type matches the requested room type.
 * Prefers the canonical roomTypeId (foreign key to room_types) when both sides
 * have it, falling back to the display type name for legacy records.
 */
const reservationMatchesRoomType = (res: Reservation, roomType: string, rooms: Room[]): boolean => {
  // If any room of the requested type exposes a roomTypeId, use id-based matching
  const sampleRoom = rooms.find(r => r.type === roomType);
  if (sampleRoom?.roomTypeId && res.roomTypeId) {
    return res.roomTypeId === sampleRoom.roomTypeId;
  }
  return res.roomType === roomType;
};

/**
 * Calculates physical availability for a room type over a requested date range.
 * Only confirmed-consuming reservations (Confirmed / CheckedIn) count against
 * capacity; Waitlisted bookings are intentionally overflow-tolerant by design.
 */
export const getTypeAvailability = (
  roomType: string,
  checkInDate: string,
  checkOutDate: string,
  rooms: Room[],
  reservations: Reservation[],
  excludeReservationId?: string
): TypeAvailability => {
  // Sellable capacity excludes rooms that are physically unavailable.
  const capacity = rooms.filter(r => r.type === roomType && r.status !== 'Out of Order').length;
  const booked = reservations.filter(res =>
    res.id !== excludeReservationId &&
    reservationMatchesRoomType(res, roomType, rooms) &&
    (res.status === 'Confirmed' || res.status === 'CheckedIn') &&
    rangesOverlap(checkInDate, checkOutDate, res.checkInDate, res.checkOutDate)
  ).length;
  return { roomType, capacity, booked, available: Math.max(0, capacity - booked) };
};

export interface OverbookingRisk {
  roomType: string;
  capacity: number;
  activeBookings: number;
  excess: number;
}

/**
 * Detects overbooking risks for a given date.
 */
export const calculateOverbookingRisk = (
  rooms: Room[],
  reservations: Reservation[],
  date: string
): OverbookingRisk[] => {
  const risks: OverbookingRisk[] = [];
  const uniqueRoomTypes = Array.from(new Set<string>(rooms.map(r => r.type as string)));

  uniqueRoomTypes.forEach(type => {
    const capacityOfThisType = rooms.filter(r => r.type === type).length;
    // Count active bookings overlapping the target date.
    // A booking is "active" on `date` if its [checkInDate, checkOutDate) range
    // covers it — i.e. checkInDate <= date < checkOutDate. This catches multi-day
    // stays, not just same-day arrivals.
    const nextDay = (() => {
      const d = new Date(date);
      d.setDate(d.getDate() + 1);
      return d.toISOString().slice(0, 10);
    })();
    const activeOfThisType = reservations.filter(res =>
      reservationMatchesRoomType(res, type, rooms) &&
      (res.status === 'CheckedIn' || res.status === 'Confirmed') &&
      rangesOverlap(date, nextDay, res.checkInDate, res.checkOutDate)
    ).length;

    if (activeOfThisType > capacityOfThisType) {
      risks.push({
        roomType: type,
        capacity: capacityOfThisType,
        activeBookings: activeOfThisType,
        excess: activeOfThisType - capacityOfThisType
      });
    }
  });

  return risks;
};

/**
 * Finds an available room number for a given room type and date range.
 * Considers existing confirmed/checked-in reservations that overlap the
 * requested stay, plus any explicitly excluded room numbers (e.g. rooms
 * already assigned earlier in the same batch).
 *
 * Returns the best available room number, or null if none available.
 */
export const findAvailableRoomForType = (
  roomType: string,
  checkInDate: string,
  checkOutDate: string,
  rooms: Room[],
  reservations: Reservation[],
  excludeRoomNumbers: Set<string> = new Set()
): string | null => {
  if (!roomType || !checkInDate || !checkOutDate) return null;

  // Rooms already assigned for this type during the overlapping period.
  // Only confirmed-consuming reservations (Confirmed / CheckedIn) block
  // physical inventory; Waitlisted bookings are overflow-tolerant.
  const assignedNumbers = new Set(
    reservations
      .filter(r =>
        r.roomNumber &&
        reservationMatchesRoomType(r, roomType, rooms) &&
        (r.status === 'Confirmed' || r.status === 'CheckedIn') &&
        rangesOverlap(checkInDate, checkOutDate, r.checkInDate, r.checkOutDate)
      )
      .map(r => r.roomNumber as string)
  );

  const unavailableNumbers = new Set([...assignedNumbers, ...excludeRoomNumbers]);

  const candidates = rooms.filter(
    r =>
      r.type === roomType &&
      r.status !== 'Out of Order' &&
      !unavailableNumbers.has(r.number)
  );

  // Prefer Vacant Clean, then any available
  const best = candidates.find(r => r.status === 'Vacant Clean') || candidates[0];
  return best ? best.number : null;
};
