/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Table Reservation Integration Service
 * Handles integration between table management and Front Office reservations
 * Provides automatic table assignment, reservation sync, and status updates
 */

import {
  fetchTableReservations,
  createTableReservation,
  updateTableReservation,
  autoAssignTableFromReservation,
  assignTableToOrder,
  releaseTableFromOrder,
  getAvailableTables,
  type Table,
  type TableReservation
} from './tableManagement';

// Types for reservation integration
export interface ReservationTableAssignment {
  reservationId: string;
  tableId?: string;
  tableNumber?: string;
  status: 'pending' | 'assigned' | 'seated' | 'completed';
  assignedAt?: string;
  seatedAt?: string;
}

export interface GuestCheckInInfo {
  reservationId: string;
  guestName: string;
  partySize: number;
  preferredTable?: string;
  specialRequests?: string;
}

class TableReservationIntegration {
  private API_BASE = '/api/food-beverage';

  /**
   * Sync reservation with table management system
   */
  async syncReservationWithTable(reservationId: string): Promise<ReservationTableAssignment> {
    try {
      // Check if table reservation already exists
      const existingReservations = await fetchTableReservations(undefined, reservationId);
      
      if (existingReservations.length > 0) {
        const existing = existingReservations[0];
        return {
          reservationId,
          tableId: existing.table_id,
          status: existing.status === 'confirmed' ? 'assigned' : existing.status as any,
          assignedAt: existing.confirmed_at,
          seatedAt: existing.seated_at,
        };
      }

      // Auto-assign table using database function
      const tableId = await autoAssignTableFromReservation(reservationId);
      
      return {
        reservationId,
        tableId,
        status: 'assigned',
        assignedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to sync reservation with table:', error);
      return {
        reservationId,
        status: 'pending',
      };
    }
  }

  /**
   * Get available tables for reservation
   */
  async getAvailableTablesForReservation(
    outletId: string,
    partySize: number,
    section?: string
  ): Promise<Table[]> {
    return await getAvailableTables(outletId, partySize, section);
  }

  /**
   * Assign specific table to reservation
   */
  async assignTableToReservation(
    reservationId: string,
    tableId: string,
    guestName: string,
    partySize: number,
    arrivalTime: string,
    duration: number = 120,
    specialRequests?: string
  ): Promise<TableReservation> {
    return await createTableReservation({
      table_id: tableId,
      reservation_id: reservationId,
      guest_name: guestName,
      party_size: partySize,
      arrival_time: arrivalTime,
      duration,
      status: 'confirmed',
      special_requests: specialRequests,
      confirmed_by: 'system',
      confirmed_at: new Date().toISOString(),
    });
  }

  /**
   * Handle guest check-in with table assignment
   */
  async handleGuestCheckIn(checkInInfo: GuestCheckInInfo): Promise<ReservationTableAssignment> {
    try {
      // First sync reservation with table system
      const assignment = await this.syncReservationWithTable(checkInInfo.reservationId);
      
      // If table was auto-assigned, update table status to reserved
      if (assignment.tableId && assignment.status === 'assigned') {
        await this.markTableAsReserved(assignment.tableId, checkInInfo.reservationId);
      }

      return assignment;
    } catch (error) {
      console.error('Failed to handle guest check-in:', error);
      throw error;
    }
  }

  /**
   * Mark table as reserved for specific reservation
   */
  private async markTableAsReserved(tableId: string, reservationId: string): Promise<void> {
    try {
      const response = await fetch(`${this.API_BASE}/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reserved' }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark table as reserved');
      }
    } catch (error) {
      console.error('Failed to mark table as reserved:', error);
      throw error;
    }
  }

  /**
   * Seat guest at table
   */
  async seatGuestAtTable(
    tableId: string,
    reservationId: string,
    orderId?: string
  ): Promise<void> {
    try {
      // Update table reservation status
      const reservations = await fetchTableReservations(tableId, reservationId);
      if (reservations.length > 0) {
        await updateTableReservation(reservations[0].id, {
          status: 'seated',
          seated_at: new Date().toISOString(),
        });
      }

      // If order is provided, assign table to order
      if (orderId) {
        await assignTableToOrder(tableId, orderId);
      } else {
        // Just mark table as occupied
        const response = await fetch(`${this.API_BASE}/tables/${tableId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'occupied' }),
        });

        if (!response.ok) {
          throw new Error('Failed to mark table as occupied');
        }
      }
    } catch (error) {
      console.error('Failed to seat guest at table:', error);
      throw error;
    }
  }

  /**
   * Complete guest dining and release table
   */
  async completeGuestDining(tableId: string, reservationId?: string): Promise<void> {
    try {
      // Release table from order
      await releaseTableFromOrder(tableId, false); // Don't mark as dirty initially

      // Update table reservation if exists
      if (reservationId) {
        const reservations = await fetchTableReservations(tableId, reservationId);
        if (reservations.length > 0) {
          await updateTableReservation(reservations[0].id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Failed to complete guest dining:', error);
      throw error;
    }
  }

  /**
   * Get table assignment for reservation
   */
  async getTableAssignment(reservationId: string): Promise<ReservationTableAssignment | null> {
    try {
      const reservations = await fetchTableReservations(undefined, reservationId);
      
      if (reservations.length === 0) {
        return null;
      }

      const reservation = reservations[0];
      return {
        reservationId,
        tableId: reservation.table_id,
        status: reservation.status === 'confirmed' ? 'assigned' : reservation.status as any,
        assignedAt: reservation.confirmed_at,
        seatedAt: reservation.seated_at,
      };
    } catch (error) {
      console.error('Failed to get table assignment:', error);
      return null;
    }
  }

  /**
   * Get all upcoming table reservations for outlet
   */
  async getUpcomingTableReservations(
    outletId: string,
    hoursAhead: number = 24
  ): Promise<TableReservation[]> {
    try {
      const now = new Date();
      const endTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

      // This would need to be implemented on the backend to filter by time range
      // For now, return all and filter client-side
      const allReservations = await fetchTableReservations();
      
      return allReservations.filter(res => {
        const arrivalTime = new Date(res.arrival_time);
        return arrivalTime >= now && arrivalTime <= endTime;
      });
    } catch (error) {
      console.error('Failed to get upcoming table reservations:', error);
      return [];
    }
  }

  /**
   * Check table availability for time slot
   */
  async checkTableAvailability(
    tableId: string,
    startTime: string,
    endTime: string
  ): Promise<boolean> {
    try {
      const reservations = await fetchTableReservations(tableId);
      
      // Check for overlapping reservations
      const hasOverlap = reservations.some(res => {
        if (res.status === 'completed' || res.status === 'cancelled' || res.status === 'no_show') {
          return false;
        }

        const resStart = new Date(res.arrival_time);
        const resEnd = new Date(resStart.getTime() + res.duration * 60 * 1000);
        const requestedStart = new Date(startTime);
        const requestedEnd = new Date(endTime);

        return (
          (requestedStart >= resStart && requestedStart < resEnd) ||
          (requestedEnd > resStart && requestedEnd <= resEnd) ||
          (requestedStart <= resStart && requestedEnd >= resEnd)
        );
      });

      return !hasOverlap;
    } catch (error) {
      console.error('Failed to check table availability:', error);
      return false;
    }
  }

  /**
   * Handle reservation modification (reassign table if needed)
   */
  async handleReservationModification(
    reservationId: string,
    newPartySize?: number,
    newTime?: string
  ): Promise<ReservationTableAssignment> {
    try {
      const currentAssignment = await this.getTableAssignment(reservationId);
      
      if (!currentAssignment || !currentAssignment.tableId) {
        // No current assignment, create new one
        return await this.syncReservationWithTable(reservationId);
      }

      // If party size changed, check if current table still suitable
      if (newPartySize) {
        // This would need table details to check capacity
        // For now, re-assign if party size increased significantly
        const currentReservation = await fetchTableReservations(currentAssignment.tableId, reservationId);
        if (currentReservation.length > 0) {
          const sizeDifference = Math.abs(newPartySize - currentReservation[0].party_size);
          if (sizeDifference > 2) {
            // Party size changed significantly, re-assign
            return await this.syncReservationWithTable(reservationId);
          }
        }
      }

      // If time changed, check availability
      if (newTime && currentAssignment.tableId) {
        const duration = 120; // Default 2 hours
        const endTime = new Date(new Date(newTime).getTime() + duration * 60 * 1000);
        const isAvailable = await this.checkTableAvailability(
          currentAssignment.tableId,
          newTime,
          endTime.toISOString()
        );

        if (!isAvailable) {
          // Current table not available at new time, re-assign
          return await this.syncReservationWithTable(reservationId);
        }

        // Update reservation time
        const reservations = await fetchTableReservations(currentAssignment.tableId, reservationId);
        if (reservations.length > 0) {
          await updateTableReservation(reservations[0].id, {
            arrival_time: newTime,
          });
        }
      }

      return currentAssignment;
    } catch (error) {
      console.error('Failed to handle reservation modification:', error);
      throw error;
    }
  }

  /**
   * Handle reservation cancellation
   */
  async handleReservationCancellation(reservationId: string): Promise<void> {
    try {
      const reservations = await fetchTableReservations(undefined, reservationId);
      
      for (const reservation of reservations) {
        await updateTableReservation(reservation.id, {
          status: 'cancelled',
        });

        // Release table if it was seated
        if (reservation.status === 'seated') {
          await releaseTableFromOrder(reservation.table_id, false);
        }
      }
    } catch (error) {
      console.error('Failed to handle reservation cancellation:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const tableReservationIntegration = new TableReservationIntegration();
