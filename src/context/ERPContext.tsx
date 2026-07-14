/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  Room, Guest, Reservation, GroupBooking, CorporateAccount,
  Promotion, MarketingCampaign, Notification, ERPStats, GuestCommunication, AirportShuttleRequest,
  RatePlan, Season, Package, User, DispatchedEmail, GlobalHotelSettings,
  RoomStatus, ReservationStatus, RoomTypeMetadata, YieldPolicy, PendingAdminChange, AdminChangeType, RiskCompliance, RoomTypeDetail, GuestService
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
import { supabase, hasSupabaseConfig } from '../lib/supabase';

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
  addFolioPayment: (reservationId: string, payment: Omit<import('../types/erp').FolioPayment, 'id' | 'date'> | Array<Omit<import('../types/erp').FolioPayment, 'id' | 'date'>>) => Promise<any>;
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
    name: string;
    email: string;
    role: string;
    avatar?: string;
    lastLogin: string;
  };
  setUserProfile: (profile: { name: string; email: string; role: string; avatar?: string; lastLogin: string }) => void;
  updateProfile: (data: Partial<{ name: string; email: string; avatar: string }>) => void;
  updatePassword: (old: string, newP: string) => Promise<boolean>;
  syncUserProfile: (profile: { name: string; email: string; role: string; avatar?: string; lastLogin: string }) => void;
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
  refreshAllData: () => Promise<void>;
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

  // Campaigns and Promotions state
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);

  // Guest Services state
  const [guestServices, setGuestServices] = useState<GuestService[]>([]);

  const refreshPricingData = useCallback(async () => {
    if (!hasSupabaseConfig) return;
    try {
      const { data: yieldData } = await supabase.from('yield_policies').select('*');
      if (yieldData) {
        setYieldPolicies(yieldData.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          multiplier: row.multiplier,
          isDefault: row.is_default
        })));
      }

      const { data: guestServicesData } = await supabase.from('guest_services').select('*');
      if (guestServicesData) {
        setGuestServices(guestServicesData.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          category: row.category,
          price: row.price,
          available: row.available
        })));
      }

      const { data: roomTypesData } = await supabase.from('room_types').select('*').order('display_order');
      if (roomTypesData && roomTypesData.length > 0) {
        setRoomTypes(roomTypesData.map((row: any) => ({
          id: row.id,
          name: row.name,
          description: row.description,
          basePrice: row.base_price,
          maxOccupancy: row.max_occupancy,
          bedConfiguration: row.bed_configuration,
          roomSizeSqm: row.room_size_sqm,
          amenities: row.amenities || [],
          imageUrl1: row.image_url_1,
          imageUrl2: row.image_url_2,
          imageUrl3: row.image_url_3,
          isActive: row.is_active,
          displayOrder: row.display_order,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })));
      }
    } catch (error) {
      console.error('Error fetching pricing data:', error);
    }
  }, []);

  // Fetch pricing data from database on mount
  useEffect(() => {
    refreshPricingData();
  }, [refreshPricingData]);

  const refreshAirportShuttleRequests = useCallback(async () => {
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

  // Fetch airport shuttle requests from Supabase on mount
  useEffect(() => {
    refreshAirportShuttleRequests();
  }, [refreshAirportShuttleRequests]);

  // Risk & Compliance state
  const [riskCompliance, setRiskCompliance] = useState<RiskCompliance[]>([]);

  // Room Types state
  const [roomTypes, setRoomTypes] = useState<RoomTypeDetail[]>([
    {
      id: 'rt_single',
      name: 'Single Room',
      description: 'Comfortable single room perfect for business travelers. Features a cozy workspace and modern amenities.',
      basePrice: 89.00,
      maxOccupancy: 1,
      bedConfiguration: '1 Queen Bed',
      roomSizeSqm: 26,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping'],
      imageUrl1: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_double',
      name: 'Double Room',
      description: 'Spacious double room ideal for couples or friends. Offers comfortable bedding and city views.',
      basePrice: 129.00,
      maxOccupancy: 2,
      bedConfiguration: '1 King Bed or 2 Queen Beds',
      roomSizeSqm: 33,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'City View'],
      imageUrl1: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_suite',
      name: 'Suite',
      description: 'Luxurious suite with separate living area. Perfect for extended stays and special occasions.',
      basePrice: 199.00,
      maxOccupancy: 3,
      bedConfiguration: '1 King Bed + Sofa Bed',
      roomSizeSqm: 51,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'City View', 'Living Room', 'Dining Table', 'Bathtub', 'Robes'],
      imageUrl1: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_deluxe',
      name: 'Deluxe Room',
      description: 'Premium deluxe room with enhanced amenities and stunning views. Features premium bedding and upgraded bath products.',
      basePrice: 159.00,
      maxOccupancy: 2,
      bedConfiguration: '1 King Bed',
      roomSizeSqm: 39,
      amenities: ['Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar', 'Coffee Maker', 'Safe', 'Daily Housekeeping', 'Ocean View', 'Premium Bath Products', 'Turndown Service'],
      imageUrl1: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'rt_penthouse',
      name: 'Penthouse',
      description: 'Exclusive penthouse suite with panoramic views, private terrace, and full luxury amenities. The ultimate accommodation experience.',
      basePrice: 499.00,
      maxOccupancy: 4,
      bedConfiguration: '1 King Bed + 2 Queen Beds',
      roomSizeSqm: 111,
      amenities: ['Free WiFi', 'Multiple Smart TVs', 'Work Desk', 'Air Conditioning', 'Fully Stocked Mini Bar', 'Premium Coffee Maker', 'Safe', 'Daily Housekeeping', 'Panoramic View', 'Living Room', 'Dining Room', 'Private Terrace', 'Jacuzzi', 'Steam Room', 'Butler Service', 'Private Check-in', 'Airport Transfer'],
      imageUrl1: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      imageUrl2: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop',
      imageUrl3: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      isActive: true,
      displayOrder: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]);

  const addRoomType = useCallback(async (roomType: Omit<RoomTypeDetail, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newId = `rt_${Date.now()}`;
    const now = new Date().toISOString();
    const newRoomType = { ...roomType, id: newId, createdAt: now, updatedAt: now };
    
    setRoomTypes(prev => [...prev, newRoomType]);
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('room_types').insert({
          id: newId,
          name: roomType.name,
          description: roomType.description,
          base_price: roomType.basePrice,
          max_occupancy: roomType.maxOccupancy,
          bed_configuration: roomType.bedConfiguration,
          room_size_sqm: roomType.roomSizeSqm,
          amenities: roomType.amenities,
          image_url_1: roomType.imageUrl1,
          image_url_2: roomType.imageUrl2,
          image_url_3: roomType.imageUrl3,
          is_active: roomType.isActive,
          display_order: roomType.displayOrder
        });
      } catch (error) {
        console.error('Error adding room type:', error);
      }
    }
  }, []);

  const updateRoomType = useCallback(async (id: string, updates: Partial<RoomTypeDetail>) => {
    setRoomTypes(prev => prev.map(rt => {
      if (rt.id === id) {
        return { ...rt, ...updates, updatedAt: new Date().toISOString() };
      }
      return rt;
    }));
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('room_types').update({
          name: updates.name,
          description: updates.description,
          base_price: updates.basePrice,
          max_occupancy: updates.maxOccupancy,
          bed_configuration: updates.bedConfiguration,
          room_size_sqm: updates.roomSizeSqm,
          amenities: updates.amenities,
          image_url_1: updates.imageUrl1,
          image_url_2: updates.imageUrl2,
          image_url_3: updates.imageUrl3,
          is_active: updates.isActive,
          display_order: updates.displayOrder,
          updated_at: new Date().toISOString()
        }).eq('id', id);
      } catch (error) {
        console.error('Error updating room type:', error);
      }
    }
  }, []);

  const deleteRoomType = useCallback(async (id: string) => {
    setRoomTypes(prev => prev.filter(rt => rt.id !== id));
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('room_types').delete().eq('id', id);
      } catch (error) {
        console.error('Error deleting room type:', error);
      }
    }
  }, []);

  const addYieldPolicy = useCallback(async (policy: Omit<YieldPolicy, 'id'>) => {
    const newId = `policy_${Date.now()}`;
    const newPolicy = { ...policy, id: newId };
    
    setYieldPolicies(prev => [...prev, newPolicy]);
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('yield_policies').insert({
          id: newId,
          name: policy.name,
          description: policy.description,
          multiplier: policy.multiplier,
          is_default: policy.isDefault
        });
      } catch (error) {
        console.error('Error adding yield policy:', error);
      }
    }
  }, []);

  const updateYieldPolicy = useCallback(async (id: string, updates: Partial<YieldPolicy>) => {
    setYieldPolicies(prev => prev.map(policy => {
      if (policy.id === id) {
        return { ...policy, ...updates };
      }
      return policy;
    }));
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('yield_policies').update({
          name: updates.name,
          description: updates.description,
          multiplier: updates.multiplier,
          is_default: updates.isDefault
        }).eq('id', id);
      } catch (error) {
        console.error('Error updating yield policy:', error);
      }
    }
  }, []);

  const deleteYieldPolicy = useCallback(async (id: string) => {
    setYieldPolicies(prev => prev.filter(policy => policy.id !== id));
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('yield_policies').delete().eq('id', id);
      } catch (error) {
        console.error('Error deleting yield policy:', error);
      }
    }
  }, []);

  const addCampaign = useCallback((campaign: Omit<MarketingCampaign, 'id'>) => {
    const newId = `camp_${Date.now()}`;
    setCampaigns(prev => [...prev, { ...campaign, id: newId }]);
  }, []);

  const updateCampaign = useCallback((id: string, updates: Partial<MarketingCampaign>) => {
    setCampaigns(prev => prev.map(camp => {
      if (camp.id === id) {
        return { ...camp, ...updates };
      }
      return camp;
    }));
  }, []);

  const deleteCampaign = useCallback((id: string) => {
    setCampaigns(prev => prev.filter(camp => camp.id !== id));
  }, []);

  const addGuestService = useCallback(async (service: Omit<GuestService, 'id'>) => {
    const newId = `gs_${Date.now()}`;
    const newService = { ...service, id: newId };
    
    setGuestServices(prev => [...prev, newService]);
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('guest_services').insert({
          id: newId,
          name: service.name,
          description: service.description,
          category: service.category,
          price: service.price,
          available: service.available
        });
      } catch (error) {
        console.error('Error adding guest service:', error);
      }
    }
  }, []);

  const updateGuestService = useCallback(async (id: string, updates: Partial<GuestService>) => {
    setGuestServices(prev => prev.map(service => {
      if (service.id === id) {
        return { ...service, ...updates };
      }
      return service;
    }));
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('guest_services').update({
          name: updates.name,
          description: updates.description,
          category: updates.category,
          price: updates.price,
          available: updates.available
        }).eq('id', id);
      } catch (error) {
        console.error('Error updating guest service:', error);
      }
    }
  }, []);

  const deleteGuestService = useCallback(async (id: string) => {
    setGuestServices(prev => prev.filter(service => service.id !== id));
    
    if (hasSupabaseConfig) {
      try {
        await supabase.from('guest_services').delete().eq('id', id);
      } catch (error) {
        console.error('Error deleting guest service:', error);
      }
    }
  }, []);

  const addPromotion = useCallback((promo: Omit<Promotion, 'id'>) => {
    const newId = `promo_${Date.now()}`;
    setPromotions(prev => [...prev, { ...promo, id: newId }]);
  }, []);

  const updatePromotion = useCallback((id: string, updates: Partial<Promotion>) => {
    setPromotions(prev => prev.map(promo => {
      if (promo.id === id) {
        return { ...promo, ...updates };
      }
      return promo;
    }));
  }, []);

  const deletePromotion = useCallback((id: string) => {
    setPromotions(prev => prev.filter(promo => promo.id !== id));
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

    if (hasSupabaseConfig) {
      try {
        supabase.from('airport_shuttle_requests').insert({
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
        }).then(({ error }) => {
          if (error) console.error('Error adding airport shuttle request:', error);
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

        supabase.from('airport_shuttle_requests').update(mappedUpdates).eq('id', id).then(({ error }) => {
          if (error) console.error('Error updating airport shuttle request:', error);
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
        supabase.from('airport_shuttle_requests').delete().eq('id', id).then(({ error }) => {
          if (error) console.error('Error deleting airport shuttle request:', error);
        });
      } catch (error) {
        console.error('Error deleting airport shuttle request:', error);
      }
    }
  }, []);

  const contextsRef = useRef({ system, guest, reservation, inventory, finance });
  contextsRef.current = { system, guest, reservation, inventory, finance };

  const refreshAllData = useCallback(async () => {
    const { system: sys, guest: gst, reservation: res, inventory: inv, finance: fin } = contextsRef.current;
    await Promise.all([
      sys.refreshData(),
      gst.refreshData(),
      res.refreshData(),
      inv.refreshData(),
      fin.refreshData(),
      refreshPricingData(),
      refreshAirportShuttleRequests()
    ]);
    sys.logAudit('ERP auto-refreshed after 30 seconds of inactivity.');
  }, [refreshPricingData, refreshAirportShuttleRequests]);

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
    campaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    promotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
    roomTypes,
    addRoomType,
    updateRoomType,
    deleteRoomType,
    yieldPolicies,
    addYieldPolicy,
    updateYieldPolicy,
    deleteYieldPolicy,
    guestServices,
    addGuestService,
    updateGuestService,
    deleteGuestService,
    riskCompliance,
    runNightAudit,
    triggerLiveSyncSimulation: () => {},
    simulationActive: true,
    setSimulationActive: () => {},
    refreshAllData,
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
