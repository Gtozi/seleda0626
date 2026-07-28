/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Operations context: guest-facing operational requests such as airport
 * shuttle bookings. Extracted from ERPContext to keep guest logistics
 * separate from pricing, reservations, and finance state.
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AirportShuttleRequest } from '../types/erp';
import { supabase, hasSupabaseConfig } from '../lib/supabase';

export interface OperationsContextType {
  airportShuttleRequests: AirportShuttleRequest[];
  addAirportShuttleRequest: (request: Omit<AirportShuttleRequest, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAirportShuttleRequest: (id: string, updates: Partial<AirportShuttleRequest>) => void;
  deleteAirportShuttleRequest: (id: string) => void;
  refreshData: () => Promise<void>;
}

const OperationsContext = createContext<OperationsContextType | undefined>(undefined);

export const OperationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [airportShuttleRequests, setAirportShuttleRequests] = useState<AirportShuttleRequest[]>([]);

  const refreshData = useCallback(async () => {
    if (!hasSupabaseConfig) return;
    try {
      const { data, error } = await supabase
        .from('airport_shuttle_requests')
        .select('*')
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) {
        console.error('Error fetching airport shuttle requests:', error);
        return;
      }

      if (data) {
        setAirportShuttleRequests(data.map((row: any) => ({
          id: row.id,
          guestId: row.guest_id,
          reservationId: row.reservation_id,
          roomNumber: row.room_number,
          scheduledDate: row.scheduled_date,
          scheduledTime: row.scheduled_time,
          shuttleType: row.shuttle_type,
          flightNumber: row.flight_number,
          flightTime: row.flight_time,
          status: row.status,
          notes: row.notes,
          quantity: row.quantity ?? 1,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })));
      }
    } catch (error) {
      console.error('Error fetching airport shuttle requests:', error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const addAirportShuttleRequest = useCallback((request: Omit<AirportShuttleRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `shuttle_${Date.now()}`;
    const now = new Date().toISOString();
    const newRequest: AirportShuttleRequest = {
      ...request,
      id: newId,
      createdAt: now,
      updatedAt: now
    };
    setAirportShuttleRequests(prev => [...prev, newRequest]);

    if (hasSupabaseConfig) {
      try {
        fetch('/api/airport-shuttle-requests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: newId,
            guest_id: request.guestId,
            reservation_id: request.reservationId,
            room_number: request.roomNumber,
            scheduled_date: request.scheduledDate,
            scheduled_time: request.scheduledTime,
            shuttle_type: request.shuttleType,
            flight_number: request.flightNumber,
            flight_time: request.flightTime,
            status: request.status,
            notes: request.notes,
            quantity: request.quantity ?? 1,
            created_at: now,
            updated_at: now
          })
        }).then(res => {
          if (!res.ok) console.error('Error adding airport shuttle request:', res.statusText);
        });
      } catch (error) {
        console.error('Error adding airport shuttle request:', error);
      }
    }

    return newId;
  }, []);

  const updateAirportShuttleRequest = useCallback((id: string, updates: Partial<AirportShuttleRequest>) => {
    const now = new Date().toISOString();
    setAirportShuttleRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, ...updates, updatedAt: now };
      }
      return req;
    }));

    if (hasSupabaseConfig) {
      try {
        const mappedUpdates: any = { updated_at: now };
        if (updates.guestId !== undefined) mappedUpdates.guest_id = updates.guestId;
        if (updates.reservationId !== undefined) mappedUpdates.reservation_id = updates.reservationId;
        if (updates.roomNumber !== undefined) mappedUpdates.room_number = updates.roomNumber;
        if (updates.scheduledDate !== undefined) mappedUpdates.scheduled_date = updates.scheduledDate;
        if (updates.scheduledTime !== undefined) mappedUpdates.scheduled_time = updates.scheduledTime;
        if (updates.shuttleType !== undefined) mappedUpdates.shuttle_type = updates.shuttleType;
        if (updates.flightNumber !== undefined) mappedUpdates.flight_number = updates.flightNumber;
        if (updates.flightTime !== undefined) mappedUpdates.flight_time = updates.flightTime;
        if (updates.status !== undefined) mappedUpdates.status = updates.status;
        if (updates.notes !== undefined) mappedUpdates.notes = updates.notes;
        if (updates.quantity !== undefined) mappedUpdates.quantity = updates.quantity;

        fetch(`/api/airport-shuttle-requests/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(mappedUpdates)
        }).then(res => {
          if (!res.ok) console.error('Error updating airport shuttle request:', res.statusText);
        });
      } catch (error) {
        console.error('Error updating airport shuttle request:', error);
      }
    }
  }, []);

  const deleteAirportShuttleRequest = useCallback((id: string) => {
    setAirportShuttleRequests(prev => prev.filter(req => req.id !== id));

    if (hasSupabaseConfig) {
      try {
        fetch(`/api/airport-shuttle-requests/${id}`, {
          method: 'DELETE',
          credentials: 'include'
        }).then(res => {
          if (!res.ok) console.error('Error deleting airport shuttle request:', res.statusText);
        });
      } catch (error) {
        console.error('Error deleting airport shuttle request:', error);
      }
    }
  }, []);

  const value: OperationsContextType = {
    airportShuttleRequests,
    addAirportShuttleRequest,
    updateAirportShuttleRequest,
    deleteAirportShuttleRequest,
    refreshData,
  };

  return (
    <OperationsContext.Provider value={value}>
      {children}
    </OperationsContext.Provider>
  );
};

export const useOperations = () => {
  const context = useContext(OperationsContext);
  if (context === undefined) {
    throw new Error('useOperations must be used within an OperationsProvider');
  }
  return context;
};
