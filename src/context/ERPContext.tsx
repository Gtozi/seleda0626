/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Room, Guest, Reservation, GroupBooking, CorporateAccount,
  Promotion, MarketingCampaign, Notification, ERPStats, GuestCommunication, AirportShuttleRequest,
  RatePlan, Season, Package, User, DispatchedEmail, GlobalHotelSettings,
  RoomStatus, ReservationStatus, RoomTypeMetadata, YieldPolicy, PendingAdminChange, AdminChangeType, RiskCompliance
} from '../types/erp';
import { 
  JournalEntry, GlobalSaleTransaction, ChartOfAccount, ExpenseRequest 
} from '../types/finance';
import { InventoryItem, Store, Requisition, StockMovement, Supplier } from '../types/inventory';
import { SystemProvider, useSystem } from './SystemContext';
import { GuestProvider, useGuest } from './GuestContext';
import { toISODate } from '../utils/date';
import { ReservationProvider, useReservation } from './ReservationContext';
import { InventoryProvider, useInventory } from './InventoryContext';
import { FinanceProvider, useFinance } from './FinanceContext';
import { rangesOverlap } from '../services/allocationService';

export interface ERPContextType {
  platformView: 'erp' | 'direct' | 'mobile';
  setPlatformView: (view: 'erp' | 'direct' | 'mobile') => void;
  activeGuestPortalResId: string;
  setActiveGuestPortalResId: (id: string) => void;
  dispatchedEmails: DispatchedEmail[];
  addDispatchedEmail: (email: Omit<DispatchedEmail, 'id' | 'sentAt'>) => void;

  rooms: Room[];
  guests: Guest[];
  reservations: Reservation[];
  groupBookings: GroupBooking[];
  corporateAccounts: CorporateAccount[];
  promotions: Promotion[];
  campaigns: MarketingCampaign[];
  notifications: Notification[];
  guestCommunications: GuestCommunication[];
  airportShuttleRequests: AirportShuttleRequest[];
  journals: JournalEntry[];
  salesTransactions: GlobalSaleTransaction[];
  chartOfAccounts: ChartOfAccount[];
  ratePlans: RatePlan[];
  seasons: Season[];
  packages: Package[];
  expenseRequests: ExpenseRequest[];
  yieldPolicies: YieldPolicy[];
  riskCompliance: RiskCompliance[];
  stats: ERPStats;
  currentSystemDate: string;
  auditLogs: string[];
  structuredAuditLogs: import('../types/erp').SystemAuditLog[];
  customRoles: import('../types/erp').CustomRole[];
  
  addCustomRole: (role: Omit<import('../types/erp').CustomRole, 'id'>) => void;
  updateCustomRole: (id: string, updates: Partial<import('../types/erp').CustomRole>) => void;
  deleteCustomRole: (id: string) => void;
  addStructuredAuditLog: (log: Omit<import('../types/erp').SystemAuditLog, 'id' | 'timestamp'>) => void;
  addSaleTransaction: (transaction: Omit<GlobalSaleTransaction, 'id'>) => string;
  updateSaleTransactionStatus: (id: string, status: 'Completed' | 'Voided' | 'Pending') => void;
  addReservation: (reservation: Omit<Reservation, 'id'>) => string;
  updateReservation: (id: string, updates: Partial<Reservation>) => void;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  updateDepositStatus: (id: string, isPaid: boolean) => void;
  assignRoomToReservation: (id: string, roomNumber: string) => void;
  changeRoom: (id: string, newRoomNumber: string) => Promise<void>;
  promoteFromWaitlist: (id: string) => void;
  autoAssignRoom: (reservationId: string, excludeRoomNumbers?: Set<string>) => string | null;
  checkInReservation: (id: string, roomNumber?: string) => Promise<void>;
  checkInGroupBooking: (groupId: string) => Promise<void>;
  checkOutReservation: (id: string) => void;
  requestEarlyCheckOut: (id: string) => void;
  requestLateCheckOut: (id: string) => void;
  addFolioCharge: (reservationId: string, charge: Omit<import('../types/erp').FolioCharge, 'id' | 'date'>) => Promise<void>;
  editFolioCharge: (reservationId: string, chargeId: string, updates: Partial<import('../types/erp').FolioCharge>) => void;
  voidFolioCharge: (reservationId: string, chargeId: string) => Promise<void>;
  moveFolioCharge: (sourceReservationId: string, targetReservationId: string, chargeId: string) => void;
  addFolioPayment: (reservationId: string, payment: Omit<import('../types/erp').FolioPayment, 'id' | 'date'>) => Promise<void>;
  voidFolioPayment: (reservationId: string, paymentId: string) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => string;
  addAccount: (account: ChartOfAccount) => void;
  deleteAccount: (code: string) => void;
  postAutoJournal: (params: {
    reference: string;
    description: string;
    amount: number;
    debitAccount: string;
    creditAccount: string;
    department?: string;
  }) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => string;
  updateGuest: (guest: Guest) => void;
  updateGuestData: (id: string, updates: Partial<Guest>) => void;
  findMatchingGuest: (criteria: { lastName?: string; email?: string; passportNumber?: string; name?: string }) => Guest | undefined;
  setGuestBillingRouting: (guestId: string, routingProfileId: string | undefined) => void;
  setRoomStatus: (roomNumber: string, status: RoomStatus) => void;
  addRoom: (room: Omit<Room, 'id'>) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  deleteRoom: (id: string) => void;
  addNotification: (message: string, type: Notification['type'], department: Notification['department']) => void;
  markNotificationRead: (id: string) => void;
  clearNotification: (id: string) => void;
  addGuestCommunication: (comm: Omit<GuestCommunication, 'id' | 'createdAt'>) => string;
  updateGuestCommunication: (id: string, updates: Partial<GuestCommunication>) => void;
  deleteGuestCommunication: (id: string) => void;
  addAirportShuttleRequest: (request: Omit<AirportShuttleRequest, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAirportShuttleRequest: (id: string, updates: Partial<AirportShuttleRequest>) => void;
  deleteAirportShuttleRequest: (id: string) => void;
  addGroupBooking: (group: Omit<GroupBooking, 'id'>) => Promise<GroupBooking | undefined>;
  updateGroupBookingStatus: (id: string, status: GroupBooking['status']) => Promise<void>;
  addCorporateAccount: (account: Omit<CorporateAccount, 'id'>) => void;
  updateCorporateAccount: (id: string, updates: Partial<CorporateAccount>) => void;
  addPromotion: (promo: Omit<Promotion, 'id'>) => void;
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => void;
  addRatePlan: (plan: Omit<RatePlan, 'id'>) => void;
  updateRatePlan: (id: string, updates: Partial<RatePlan>) => void;
  deleteRatePlan: (id: string) => void;
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  addExpenseRequest: (request: Omit<ExpenseRequest, 'id'>) => string;
  updateExpenseRequestStatus: (id: string, status: ExpenseRequest['status']) => void;
  deletePackage: (id: string) => void;
  addSeason: (season: Omit<Season, 'id'>) => void;
  updateSeason: (id: string, updates: Partial<Season>) => void;
  deleteSeason: (id: string) => void;
  addYieldPolicy: (policy: Omit<YieldPolicy, 'id'>) => void;
  updateYieldPolicy: (id: string, updates: Partial<YieldPolicy>) => void;
  deleteYieldPolicy: (id: string) => void;
  runNightAudit: () => { success: boolean; date: string; message: string; revenuePosted: number };
  triggerLiveSyncSimulation: () => void;
  simulationActive: boolean;
  setSimulationActive: (active: boolean) => void;
  currency: 'USD' | 'ETB';
  setCurrency: (currency: 'USD' | 'ETB') => void;
  formatAmount: (amount: number) => string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userProfile: {
    name: string;
    email: string;
    role: string;
    avatar?: string;
    lastLogin: string;
  };
  setUserProfile: (profile: { name: string; email: string; role: string; avatar?: string; lastLogin: string }) => void;
  updateProfile: (data: Partial<{ name: string; email: string; avatar: string }>) => void;
  updatePassword: (old: string, newP: string) => Promise<boolean>;
  globalHotelSettings: GlobalHotelSettings;
  updateGlobalHotelSettings: (settings: Partial<GlobalHotelSettings>) => void;
  roomTypeMetadata: RoomTypeMetadata[];
  updateRoomTypeMetadata: (type: RoomTypeMetadata['type'], updates: Partial<RoomTypeMetadata>) => void;
  formatTaxesAndFees: (baseAmount: number) => { 
    baseAmount: number;
    taxAmount: number; 
    serviceChargeAmount: number; 
    addonTotal: number;
    addonDetails: { name: string; amount: number }[];
    totalWithTaxes: number;
  };
  systemUsers: User[];
  addSystemUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateSystemUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteSystemUser: (id: string) => void;
  inventoryItems: InventoryItem[];
  inventoryStores: Store[];
  inventoryRequisitions: Requisition[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addInventoryStore: (store: Omit<Store, 'id'>) => void;
  addInventoryRequisition: (req: Omit<Requisition, 'id' | 'number'>) => void;
  updateInventoryRequisitionStatus: (id: string, status: Requisition['status'], itemsWithIssuedQty?: { itemId: string, issuedQty: number }[]) => void;
  recordStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getTypeAvailability: (roomType: string, checkInDate: string, checkOutDate: string, excludeReservationId?: string) => import('../services/allocationService').TypeAvailability;

  pendingAdminChanges: PendingAdminChange[];
  submitAdminChange: (change: Omit<PendingAdminChange, 'id' | 'submittedAt' | 'status'>) => void;
  approveAdminChange: (id: string) => void;
  declineAdminChange: (id: string) => void;
  submitGlobalSettingsChange: (title: string, description: string, changeType: AdminChangeType, settings: Partial<GlobalHotelSettings>) => void;
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const ERPContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useSystem();
  const guest = useGuest();
  const reservation = useReservation();
  const inventory = useInventory();
  const finance = useFinance();

  // Yield policies state
  const [yieldPolicies, setYieldPolicies] = useState<YieldPolicy[]>([]);

  // Risk & Compliance state
  const [riskCompliance, setRiskCompliance] = useState<RiskCompliance[]>([]);

  const addYieldPolicy = useCallback((policy: Omit<YieldPolicy, 'id'>) => {
    const newId = `policy_${Date.now()}`;
    setYieldPolicies(prev => [...prev, { ...policy, id: newId }]);
  }, []);

  const updateYieldPolicy = useCallback((id: string, updates: Partial<YieldPolicy>) => {
    setYieldPolicies(prev => prev.map(policy => {
      if (policy.id === id) {
        return { ...policy, ...updates };
      }
      return policy;
    }));
  }, []);

  const deleteYieldPolicy = useCallback((id: string) => {
    setYieldPolicies(prev => prev.filter(policy => policy.id !== id));
  }, []);

  const runNightAudit = useCallback(() => {
    const revenuePosted = finance.stats.totalRevenue;
    const d = new Date(system.currentSystemDate);
    d.setDate(d.getDate() + 1);
    const nextDateStr = toISODate(d);
    
    system.setCurrentSystemDate(nextDateStr);
    system.logAudit(`NIGHT AUDIT COMPLETED. Date rolled to ${nextDateStr}.`);
    
    return {
      success: true,
      date: nextDateStr,
      message: `Night Audit complete.`,
      revenuePosted
    };
  }, [system, finance]);

  // Helper: Auto-assign a room for a reservation based on room type
  const autoAssignRoom = (reservationId: string, excludeRoomNumbers: Set<string> = new Set()): string | null => {
    const res = reservation.reservations.find(r => r.id === reservationId);
    if (!res) return null;

    const occupiedNumbers = new Set(
      reservation.reservations
        .filter(r => r.status === 'CheckedIn' && r.id !== reservationId)
        .map(r => r.roomNumber)
        .filter(Boolean) as string[]
    );

    // Also exclude rooms booked by Confirmed reservations with overlapping dates
    const bookedNumbers = new Set(
      reservation.reservations
        .filter(r =>
          r.id !== reservationId &&
          r.status === 'Confirmed' &&
          r.roomNumber &&
          r.roomType === res.roomType &&
          rangesOverlap(res.checkInDate, res.checkOutDate, r.checkInDate, r.checkOutDate)
        )
        .map(r => r.roomNumber)
    );

    // Merge occupied, booked, and excluded
    const unavailableNumbers = new Set([...occupiedNumbers, ...bookedNumbers, ...excludeRoomNumbers]);

    const candidates = reservation.rooms.filter(r =>
      r.type === res.roomType &&
      r.status !== 'Out of Order' &&
      !unavailableNumbers.has(r.number)
    );

    // Prefer Vacant Clean, then any available
    const best = candidates.find(r => r.status === 'Vacant Clean') || candidates[0];
    return best ? best.number : null;
  };

  // Guest Communications state
  const [guestCommunications, setGuestCommunications] = useState<GuestCommunication[]>([]);

  const addGuestCommunication = useCallback((comm: Omit<GuestCommunication, 'id' | 'createdAt'>) => {
    const newId = `comm_${Date.now()}`;
    const newComm: GuestCommunication = {
      ...comm,
      id: newId,
      createdAt: new Date().toISOString()
    };
    setGuestCommunications(prev => [...prev, newComm]);
    return newId;
  }, []);

  const updateGuestCommunication = useCallback((id: string, updates: Partial<GuestCommunication>) => {
    setGuestCommunications(prev => prev.map(comm => {
      if (comm.id === id) {
        return { ...comm, ...updates };
      }
      return comm;
    }));
  }, []);

  const deleteGuestCommunication = useCallback((id: string) => {
    setGuestCommunications(prev => prev.filter(comm => comm.id !== id));
  }, []);

  // Airport Shuttle Requests state
  const [airportShuttleRequests, setAirportShuttleRequests] = useState<AirportShuttleRequest[]>([]);

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
    return newId;
  }, []);

  const updateAirportShuttleRequest = useCallback((id: string, updates: Partial<AirportShuttleRequest>) => {
    setAirportShuttleRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, ...updates, updatedAt: new Date().toISOString() };
      }
      return req;
    }));
  }, []);

  const deleteAirportShuttleRequest = useCallback((id: string) => {
    setAirportShuttleRequests(prev => prev.filter(req => req.id !== id));
  }, []);

  const value: ERPContextType = {
    ...system,
    ...guest,
    ...reservation,
    ...inventory,
    ...finance,
    guestCommunications,
    addGuestCommunication,
    updateGuestCommunication,
    deleteGuestCommunication,
    airportShuttleRequests,
    addAirportShuttleRequest,
    updateAirportShuttleRequest,
    deleteAirportShuttleRequest,
    campaigns: [],
    addCampaign: () => {},
    yieldPolicies,
    addYieldPolicy,
    updateYieldPolicy,
    deleteYieldPolicy,
    riskCompliance,
    runNightAudit,
    triggerLiveSyncSimulation: () => {},
    simulationActive: true,
    setSimulationActive: () => {},
    toggleTheme: system.toggleTheme,
    approveAdminChange: (id: string) => {
      const change = system.pendingAdminChanges.find(c => c.id === id);
      if (change && change.status === 'Pending') {
        const { operation, args } = change.payload as any;
        if (operation === 'deleteRoom') {
          reservation.deleteRoom(args[0]);
        }
      }
      system.approveAdminChange(id);
    },
    formatAmount: (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: system.currency,
      }).format(system.currency === 'ETB' ? amount * system.globalHotelSettings.exchangeRate : amount);
    },
    formatTaxesAndFees: (baseAmount: number) => {
      const fees = system.globalHotelSettings.feeComponents || [];
      const enabledFees = fees.filter(f => f.isEnabled);

      // Phase 1: Calculate non-VAT fees on base amount
      let serviceChargeAmount = 0;
      let addonTotal = 0;
      const addonDetails: { name: string; amount: number }[] = [];

      for (const fee of enabledFees) {
        if (fee.name.toLowerCase().includes('vat') || fee.name.toLowerCase().includes('tax')) continue;

        const amount = fee.feeType === 'percentage'
          ? baseAmount * (fee.value / 100)
          : fee.value;

        if (fee.name.toLowerCase().includes('service charge')) {
          serviceChargeAmount += amount;
        } else {
          addonTotal += amount;
          addonDetails.push({ name: fee.name, amount });
        }
      }

      const subtotalBeforeVat = baseAmount + serviceChargeAmount + addonTotal;

      // Phase 2: Calculate VAT on subtotal (VAT is always last)
      let taxAmount = 0;
      const vatFee = enabledFees.find(f =>
        f.name.toLowerCase().includes('vat') || f.name.toLowerCase().includes('tax')
      );
      if (vatFee) {
        taxAmount = vatFee.feeType === 'percentage'
          ? subtotalBeforeVat * (vatFee.value / 100)
          : vatFee.value;
      }

      return {
        baseAmount,
        taxAmount,
        serviceChargeAmount,
        addonTotal,
        addonDetails,
        totalWithTaxes: subtotalBeforeVat + taxAmount
      };
    },
    autoAssignRoom,
    checkInReservation: async (id, roomNumber) => {
      const res = reservation.reservations.find(r => r.id === id);
      if (!res) {
        system.logAudit(`Check-in failed: reservation ${id} not found`);
        return;
      }

      // Auto-assign room if not provided
      if (!roomNumber) {
        roomNumber = autoAssignRoom(id);
        if (!roomNumber) {
          system.logAudit(`Check-in failed for reservation ${id}: no available room of type ${res.roomType}`);
          return;
        }
      }

      try {
        const response = await fetch(`/api/reservations/${id}/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ roomNumber }),
        });

        if (!response.ok) {
          const data = await response.json();
          system.logAudit(`Check-in failed for reservation ${id}: ${data.error || response.statusText}`);
          return;
        }

        reservation.updateReservationStatus(id, 'CheckedIn');
        reservation.updateReservation(id, { roomNumber });
        reservation.setRoomStatus(roomNumber, 'Occupied Clean');
      } catch (error) {
        system.logAudit(`Check-in network error for reservation ${id}: ${String(error)}`);
      }
    },
    checkInGroupBooking: async (groupId) => {
      const group = reservation.groupBookings.find(g => g.id === groupId);
      if (!group) return;

      reservation.updateGroupBookingStatus(groupId, 'CheckedIn');

      const groupReservations = reservation.reservations.filter(r => r.groupBookingId === groupId);
      const assignedInThisBatch = new Set<string>();

      for (const res of groupReservations) {
        if (res.status === 'CheckedIn' || res.status === 'CheckedOut') continue;

        let roomNumber = res.roomNumber;

        if (!roomNumber) {
          roomNumber = autoAssignRoom(res.id, assignedInThisBatch);
          if (roomNumber) {
            assignedInThisBatch.add(roomNumber);
          }
        }

        if (roomNumber) {
          const room = reservation.rooms.find(r => r.number === roomNumber);
          if (room && room.status === 'Out of Order') {
            system.logAudit(`Group check-in skipped for reservation ${res.id}: room ${roomNumber} is Out of Order.`);
            continue;
          }
          const alreadyOccupied = reservation.reservations.some(
            r => r.id !== res.id && r.status === 'CheckedIn' && r.roomNumber === roomNumber
          );
          if (alreadyOccupied) {
            system.logAudit(`Group check-in skipped for reservation ${res.id}: room ${roomNumber} already occupied.`);
            continue;
          }
        }

        // Call the API for each reservation
        try {
          const response = await fetch(`/api/reservations/${res.id}/check-in`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ roomNumber }),
          });

          if (!response.ok) {
            const data = await response.json();
            system.logAudit(`Group check-in failed for reservation ${res.id}: ${data.error || response.statusText}`);
            continue;
          }

          reservation.updateReservationStatus(res.id, 'CheckedIn');
          reservation.updateReservation(res.id, { roomNumber });
          reservation.setRoomStatus(roomNumber, 'Occupied Clean');
        } catch (error) {
          system.logAudit(`Group check-in network error for reservation ${res.id}: ${String(error)}`);
        }
      }

      system.logAudit(`Group booking ${groupId} (${group.groupName}) checked in. ${assignedInThisBatch.size} room(s) auto-assigned.`);
    },
    checkOutReservation: (id) => {
      const res = reservation.reservations.find(r => r.id === id);
      reservation.updateReservationStatus(id, 'CheckedOut');
      if (res?.roomNumber) {
        reservation.setRoomStatus(res.roomNumber, 'Vacant Dirty');
      }
    },
    requestEarlyCheckOut: (id) => {
      const res = reservation.reservations.find(r => r.id === id);
      if (!res || res.status !== 'CheckedIn') return;
      reservation.updateReservation(id, { earlyCheckOutRequested: true });
      system.logAudit(`Early checkout requested for reservation ${id} (${res.guestName}).`);
    },
    requestLateCheckOut: (id) => {
      const res = reservation.reservations.find(r => r.id === id);
      if (!res || res.status !== 'CheckedIn') return;
      reservation.updateReservation(id, { lateCheckOutRequested: true });
      system.logAudit(`Late checkout requested for reservation ${id} (${res.guestName}).`);
    },
  };

  return (
    <ERPContext.Provider value={value}>
      {children}
    </ERPContext.Provider>
  );
};

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SystemProvider>
      <GuestProvider>
        <ReservationProvider>
          <InventoryProvider>
            <FinanceProvider>
              <ERPContextWrapper>
                {children}
              </ERPContextWrapper>
            </FinanceProvider>
          </InventoryProvider>
        </ReservationProvider>
      </GuestProvider>
    </SystemProvider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (context === undefined) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};
