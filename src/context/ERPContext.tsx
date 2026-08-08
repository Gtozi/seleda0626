/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import {
  Room, Guest, Reservation, GroupBooking, CorporateAccount,
  Promotion, MarketingCampaign, Notification, ERPStats,
  RatePlan, Season, Package, User, DispatchedEmail, GlobalHotelSettings,
  RoomStatus, ReservationStatus, RoomTypeMetadata, YieldPolicy, PendingAdminChange, AdminChangeType, RiskCompliance, RoomTypeDetail, GuestService
} from '../types/erp';
import type { GuestCommunication, AirportShuttleRequest } from '../types/erp';
import { 
  JournalEntry, GlobalSaleTransaction, ChartOfAccount, ExpenseRequest 
} from '../types/finance';
import { InventoryItem, Store, Requisition, StockMovement, Supplier } from '../types/inventory';
import { SystemProvider, useSystem, PropertyInfo, OrganizationInfo } from './SystemContext';
import { GuestProvider, useGuest } from './GuestContext';
import { toISODate } from '../utils/date';
import { ReservationProvider, useReservation } from './ReservationContext';
import { InventoryProvider, useInventory } from './InventoryContext';
import { FinanceProvider, useFinance } from './FinanceContext';
import { PricingProvider, usePricing, type PricingContextType } from './PricingContext';
import { OperationsProvider, useOperations, type OperationsContextType } from './OperationsContext';
import { rangesOverlap } from '../services/allocationService';

export interface ERPContextType {
  platformView: 'erp' | 'direct' | 'mobile';
  setPlatformView: (view: 'erp' | 'direct' | 'mobile') => void;
  activeGuestPortalResId: string;
  setActiveGuestPortalResId: (id: string) => void;
  dispatchedEmails: DispatchedEmail[];
  addDispatchedEmail: (email: Omit<DispatchedEmail, 'id' | 'sentAt'>) => void;

  rooms: Room[];
  roomTypes: RoomTypeDetail[];
  guests: Guest[];
  guestsLoading: boolean;
  guestsError: string | null;
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
  guestServices: GuestService[];
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
  updateReservation: (id: string, updates: Partial<Reservation>) => Promise<void>;
  updateReservationStatus: (id: string, status: ReservationStatus) => void;
  updateDepositStatus: (id: string, isPaid: boolean) => void;
  assignRoomToReservation: (id: string, roomNumber: string) => Promise<void>;
  changeRoom: (id: string, newRoomNumber: string) => Promise<void>;
  promoteFromWaitlist: (id: string) => void;
  autoAssignRoom: (reservationId: string, excludeRoomNumbers?: Set<string>) => string | null;
  checkInReservation: (id: string, roomNumber?: string) => Promise<void>;
  checkInGroupBooking: (groupId: string) => Promise<void>;
  checkOutGroupBooking: (groupId: string) => Promise<void>;
  checkOutReservation: (id: string) => void;
  cancelReservation: (id: string, reason?: string) => Promise<void>;
  markNoShow: (id: string) => Promise<void>;
  requestEarlyCheckOut: (id: string) => void;
  requestLateCheckOut: (id: string) => void;
  addFolioCharge: (reservationId: string, charge: Omit<import('../types/erp').FolioCharge, 'id' | 'date'>) => Promise<void>;
  editFolioCharge: (reservationId: string, chargeId: string, updates: Partial<import('../types/erp').FolioCharge>) => void;
  voidFolioCharge: (reservationId: string, chargeId: string) => Promise<void>;
  moveFolioCharge: (sourceReservationId: string, targetReservationId: string, chargeId: string) => void;
  addFolioPayment: (reservationId: string, payment: Omit<import('../types/erp').FolioPayment, 'id' | 'date'> | Array<Omit<import('../types/erp').FolioPayment, 'id' | 'date'>>) => Promise<any>;
  voidFolioPayment: (reservationId: string, paymentId: string) => Promise<void>;
  addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => string;
  createJournalEntry: (entry: Omit<JournalEntry, 'id'>) => Promise<JournalEntry>;
  postJournalEntry: (id: string) => Promise<void>;
  reverseJournalEntry: (id: string) => Promise<JournalEntry>;
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
  addRoomType: (roomType: Omit<RoomTypeDetail, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRoomType: (id: string, updates: Partial<RoomTypeDetail>) => void;
  deleteRoomType: (id: string) => void;
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
  updatePromotion: (id: string, updates: Partial<Promotion>) => void;
  deletePromotion: (id: string) => void;
  addCampaign: (campaign: Omit<MarketingCampaign, 'id'>) => void;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => void;
  deleteCampaign: (id: string) => void;
  addRatePlan: (plan: Omit<RatePlan, 'id'>) => void;
  updateRatePlan: (id: string, updates: Partial<RatePlan>) => void;
  deleteRatePlan: (id: string) => void;
  addPackage: (pkg: Omit<Package, 'id'>) => void;
  updatePackage: (id: string, updates: Partial<Package>) => void;
  addExpenseRequest: (request: Omit<ExpenseRequest, 'id'>) => string;
  updateExpenseRequestStatus: (id: string, status: ExpenseRequest['status']) => void;
  deletePackage: (id: string) => void;
  addGuestService: (service: Omit<GuestService, 'id'>) => void;
  updateGuestService: (id: string, updates: Partial<GuestService>) => void;
  deleteGuestService: (id: string) => void;
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
    id: string;
    name: string;
    email: string;
    role: string;
    roleDescription?: string;
    avatar?: string;
    lastLogin: string;
    department?: string;
    employeeId?: string;
    mobileNumber?: string;
    username?: string;
    status?: string;
  };
  setUserProfile: (profile: { id: string; name: string; email: string; role: string; roleDescription?: string; avatar?: string; lastLogin: string; department?: string; employeeId?: string; mobileNumber?: string; username?: string; status?: string }) => void;
  updateProfile: (data: Partial<{ name: string; email: string; avatar: string; mobileNumber: string; username: string }>) => void;
  updatePassword: (old: string, newP: string) => Promise<boolean>;
  syncUserProfile: (profile: { id: string; name: string; email: string; role: string; roleDescription?: string; avatar?: string; lastLogin: string; department?: string; employeeId?: string; mobileNumber?: string; username?: string; status?: string }) => void;
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
  updateInventoryStore: (id: string, updates: Partial<Store>) => void;
  deleteInventoryStore: (id: string) => void;
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
  refreshAllData: () => Promise<void>;
  currentPropertyId: string | null;
  setCurrentPropertyId: (id: string | null) => void;
  properties: PropertyInfo[];
  organizations: OrganizationInfo[];
}

const ERPContext = createContext<ERPContextType | undefined>(undefined);

const ERPContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const system = useSystem();
  const guest = useGuest();
  const reservation = useReservation();
  const inventory = useInventory();
  const finance = useFinance();
  const pricing = usePricing();
  const operations = useOperations();

  // Risk & Compliance state
  const [riskCompliance, setRiskCompliance] = useState<RiskCompliance[]>([]);

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

    // Exclude any other reservation that already has a room assigned for this type
    // and whose stay overlaps. This covers Confirmed, CheckedIn and Waitlisted bookings.
    const assignedNumbers = new Set(
      reservation.reservations
        .filter(r =>
          r.id !== reservationId &&
          r.roomNumber &&
          r.roomType === res.roomType &&
          rangesOverlap(res.checkInDate, res.checkOutDate, r.checkInDate, r.checkOutDate)
        )
        .map(r => r.roomNumber)
    );

    // Merge assigned and explicitly excluded rooms
    const unavailableNumbers = new Set([...assignedNumbers, ...excludeRoomNumbers]);

    const candidates = reservation.rooms.filter(r =>
      r.type === res.roomType &&
      r.status !== 'Out of Order' &&
      !unavailableNumbers.has(r.number)
    );

    // Prefer Vacant Clean, then any available
    const best = candidates.find(r => r.status === 'Vacant Clean') || candidates[0];
    return best ? best.number : null;
  };

  const contextsRef = useRef({ system, guest, reservation, inventory, finance, pricing, operations });
  contextsRef.current = { system, guest, reservation, inventory, finance, pricing, operations };

  const refreshAllData = useCallback(async () => {
    const { system: sys, guest: gst, reservation: res, inventory: inv, finance: fin, pricing: prc, operations: ops } = contextsRef.current;
    await Promise.all([
      sys.refreshData(),
      gst.refreshData(),
      res.refreshData(),
      inv.refreshData(),
      fin.refreshData(),
      prc.refreshData(),
      ops.refreshData()
    ]);
    sys.logAudit('ERP auto-refreshed after 30 seconds of inactivity.');
  }, [pricing.refreshData, operations.refreshData]);

  // ── Memoized cross-context helpers ──────────────────────────────────────────

  const approveAdminChangeCb = useCallback((id: string) => {
    const change = system.pendingAdminChanges.find(c => c.id === id);
    if (change && change.status === 'Pending') {
      const { operation, args } = change.payload as any;
      if (operation === 'deleteRoom') {
        reservation.deleteRoom(args[0]);
      }
    }
    system.approveAdminChange(id);
  }, [system, reservation]);

  const formatAmountCb = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: system.currency,
    }).format(system.currency === 'ETB' ? amount * system.globalHotelSettings.exchangeRate : amount);
  }, [system.currency, system.globalHotelSettings.exchangeRate]);

  const formatTaxesAndFeesCb = useCallback((baseAmount: number) => {
    const fees = system.globalHotelSettings.feeComponents || [];
    const enabledFees = fees.filter(f => f.isEnabled);

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
  }, [system.globalHotelSettings.feeComponents]);

  const checkInReservationCb = useCallback(async (id: string, roomNumber?: string) => {
    const res = reservation.reservations.find(r => r.id === id);
    if (!res) {
      system.logAudit(`Check-in failed: reservation ${id} not found`);
      return;
    }
    if (!roomNumber) {
      roomNumber = autoAssignRoom(id);
      if (!roomNumber) {
        system.logAudit(`Check-in failed for reservation ${id}: no available room of type ${res.roomType}`);
        return;
      }
    }
    try {
      const response = await fetch(`/api/${id}/check-in`, {
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
      await reservation.updateReservation(id, { roomNumber });
      reservation.setRoomStatus(roomNumber, 'Occupied Clean');
    } catch (error) {
      system.logAudit(`Check-in network error for reservation ${id}: ${String(error)}`);
    }
  }, [system, reservation]);

  const checkInGroupBookingCb = useCallback(async (groupId: string) => {
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
        if (roomNumber) assignedInThisBatch.add(roomNumber);
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
      try {
        const response = await fetch(`/api/${res.id}/check-in`, {
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
        await reservation.updateReservation(res.id, { roomNumber });
        reservation.setRoomStatus(roomNumber, 'Occupied Clean');
      } catch (error) {
        system.logAudit(`Group check-in network error for reservation ${res.id}: ${String(error)}`);
      }
    }
    system.logAudit(`Group booking ${groupId} (${group.groupName}) checked in. ${assignedInThisBatch.size} room(s) auto-assigned.`);
  }, [system, reservation]);

  const checkOutReservationCb = useCallback(async (id: string) => {
    const res = reservation.reservations.find(r => r.id === id);
    try {
      const token = localStorage.getItem('auth_token');
      const foliosResponse = await fetch(`/api/folios?reservation_id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (foliosResponse.ok) {
        const foliosData = await foliosResponse.json();
        const folios = foliosData.folios || [];
        for (const folio of folios) {
          if (folio.status !== 'Closed') {
            await fetch(`/api/folios/${folio.id}/close-with-invoice`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error closing folios with invoice generation:', error);
    }
    reservation.updateReservationStatus(id, 'CheckedOut');
    if (res?.roomNumber) {
      reservation.setRoomStatus(res.roomNumber, 'Vacant Dirty');
    }

    // ── Automatic loyalty points accrual ──
    if (res?.guestId) {
      try {
        const pointsPerDollar = system.globalHotelSettings?.loyaltyPointsPerDollar || 1;
        const spend = res.totalAmount || (res.rate || 0) * Math.max(1, Math.ceil((new Date(res.checkOutDate).getTime() - new Date(res.checkInDate).getTime()) / 86400000));
        const pointsToAccrue = Math.floor(spend * pointsPerDollar);
        if (pointsToAccrue > 0) {
          const accrueRes = await fetch('/api/loyalty/accrue', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              guest_id: res.guestId,
              points: pointsToAccrue,
              reservation_id: id,
              description: `Loyalty accrual for reservation ${id} (${res.guestName})`,
              reference_type: 'checkout',
              reference_id: id,
            }),
          });
          if (accrueRes.ok) {
            const data = await accrueRes.json();
            // Update local guest state
            guest.updateGuestData(res.guestId, {
              loyaltyPoints: data.newBalance,
              totalSpend: (guest.guests.find(g => g.id === res.guestId)?.totalSpend || 0) + spend,
            });
            system.logAudit(`Loyalty: ${pointsToAccrue} points accrued for guest ${res.guestName} (reservation ${id}). New balance: ${data.newBalance}`);
          }
        }
      } catch (loyaltyErr) {
        console.error('Loyalty accrual failed (non-blocking):', loyaltyErr);
      }
    }
  }, [reservation, system, guest]);

  const checkOutGroupBookingCb = useCallback(async (groupId: string) => {
    const group = reservation.groupBookings.find(g => g.id === groupId);
    if (!group) return;
    const groupReservations = reservation.reservations.filter(
      r => (r.groupBookingId === groupId || r.bookingGroupId === groupId) && r.status === 'CheckedIn'
    );
    if (groupReservations.length === 0) {
      system.logAudit(`Group check-out skipped for ${groupId}: no checked-in reservations found.`);
      return;
    }
    let checkedOutCount = 0;
    for (const res of groupReservations) {
      try {
        await checkOutReservationCb(res.id);
        checkedOutCount++;
      } catch (error) {
        system.logAudit(`Group check-out failed for reservation ${res.id}: ${String(error)}`);
      }
    }
    await reservation.updateGroupBookingStatus(groupId, 'Completed');
    system.logAudit(`Group booking ${groupId} (${group.groupName}) checked out. ${checkedOutCount} of ${groupReservations.length} reservation(s) processed.`);
  }, [reservation, system, checkOutReservationCb]);

  const cancelReservationCb = useCallback(async (id: string, reason?: string) => {
    const res = reservation.reservations.find(r => r.id === id);
    if (!res) {
      system.logAudit(`Cancel failed: reservation ${id} not found`);
      return;
    }
    try {
      const response = await fetch(`/api/${id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reason || 'Cancelled by front desk' }),
      });
      if (!response.ok) {
        const data = await response.json();
        system.logAudit(`Cancel failed for reservation ${id}: ${data.error || response.statusText}`);
        return;
      }
      const data = await response.json();
      reservation.updateReservationStatus(id, 'Cancelled');
      if (res.roomNumber) {
        reservation.setRoomStatus(res.roomNumber, 'Vacant Clean');
      }
      if (data.penaltyAmount > 0) {
        system.logAudit(`Reservation ${id} (${res.guestName}) cancelled with penalty charge of ${data.penaltyAmount}. Outside grace period.`);
      } else {
        system.logAudit(`Reservation ${id} (${res.guestName}) cancelled. Within grace period - no penalty.`);
      }
    } catch (error) {
      system.logAudit(`Cancel network error for reservation ${id}: ${String(error)}`);
    }
  }, [system, reservation]);

  const markNoShowCb = useCallback(async (id: string) => {
    const res = reservation.reservations.find(r => r.id === id);
    if (!res) {
      system.logAudit(`No-show failed: reservation ${id} not found`);
      return;
    }
    try {
      const response = await fetch(`/api/${id}/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) {
        const data = await response.json();
        system.logAudit(`No-show failed for reservation ${id}: ${data.error || response.statusText}`);
        return;
      }
      const data = await response.json();
      reservation.updateReservationStatus(id, 'NoShow');
      if (res.roomNumber) {
        reservation.setRoomStatus(res.roomNumber, 'Vacant Clean');
      }
      if (data.penaltyAmount > 0) {
        system.logAudit(`Reservation ${id} (${res.guestName}) marked as No-Show with penalty charge of ${data.penaltyAmount}.`);
      } else {
        system.logAudit(`Reservation ${id} (${res.guestName}) marked as No-Show. No penalty configured.`);
      }
    } catch (error) {
      system.logAudit(`No-show network error for reservation ${id}: ${String(error)}`);
    }
  }, [system, reservation]);

  const requestEarlyCheckOutCb = useCallback((id: string) => {
    const res = reservation.reservations.find(r => r.id === id);
    if (!res || res.status !== 'CheckedIn') return;
    reservation.updateReservation(id, { earlyCheckOutRequested: true });
    system.logAudit(`Early checkout requested for reservation ${id} (${res.guestName}).`);
  }, [system, reservation]);

  const requestLateCheckOutCb = useCallback((id: string) => {
    const res = reservation.reservations.find(r => r.id === id);
    if (!res || res.status !== 'CheckedIn') return;
    reservation.updateReservation(id, { lateCheckOutRequested: true });
    system.logAudit(`Late checkout requested for reservation ${id} (${res.guestName}).`);
  }, [system, reservation]);

  const value = useMemo<ERPContextType>(() => ({
    ...system,
    ...guest,
    ...reservation,
    ...inventory,
    ...finance,
    ...pricing,
    ...operations,
    riskCompliance,
    runNightAudit,
    triggerLiveSyncSimulation: () => {},
    simulationActive: true,
    setSimulationActive: () => {},
    refreshAllData,
    toggleTheme: system.toggleTheme,
    approveAdminChange: approveAdminChangeCb,
    formatAmount: formatAmountCb,
    formatTaxesAndFees: formatTaxesAndFeesCb,
    autoAssignRoom,
    checkInReservation: checkInReservationCb,
    checkInGroupBooking: checkInGroupBookingCb,
    checkOutGroupBooking: checkOutGroupBookingCb,
    checkOutReservation: checkOutReservationCb,
    cancelReservation: cancelReservationCb,
    markNoShow: markNoShowCb,
    requestEarlyCheckOut: requestEarlyCheckOutCb,
    requestLateCheckOut: requestLateCheckOutCb,
  }), [
    system, guest, reservation, inventory, finance, pricing, operations,
    riskCompliance, runNightAudit, refreshAllData,
    approveAdminChangeCb, formatAmountCb, formatTaxesAndFeesCb,
    autoAssignRoom, checkInReservationCb, checkInGroupBookingCb,
    checkOutGroupBookingCb, checkOutReservationCb, cancelReservationCb, markNoShowCb, requestEarlyCheckOutCb, requestLateCheckOutCb,
  ]);

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
              <PricingProvider>
                <OperationsProvider>
                  <ERPContextWrapper>
                    {children}
                  </ERPContextWrapper>
                </OperationsProvider>
              </PricingProvider>
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
