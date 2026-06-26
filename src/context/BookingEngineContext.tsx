import React, { createContext, useContext } from 'react';
import { useBookingEngine } from '../hooks/useBookingEngine';

type BookingEngineValue = ReturnType<typeof useBookingEngine>;

const BookingEngineContext = createContext<BookingEngineValue | null>(null);

export const BookingEngineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const engine = useBookingEngine();
  return <BookingEngineContext.Provider value={engine}>{children}</BookingEngineContext.Provider>;
};

export function useBookingEngineContext(): BookingEngineValue {
  const ctx = useContext(BookingEngineContext);
  if (!ctx) {
    throw new Error('useBookingEngineContext must be used within a BookingEngineProvider');
  }
  return ctx;
}

export function useOptionalBookingEngineContext(): BookingEngineValue | null {
  return useContext(BookingEngineContext);
}

export function useBookingEngineBlock(): BookingEngineValue {
  const ctx = useContext(BookingEngineContext);
  const fallback = useBookingEngine();
  return ctx || fallback;
}
