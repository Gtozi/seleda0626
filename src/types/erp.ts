/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomStatus = 
  | 'Vacant Clean' 
  | 'Vacant Dirty' 
  | 'Occupied Clean' 
  | 'Occupied Dirty' 
  | 'Out of Order';

export type RoomType = string; // Dynamic room types from room table

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: number;
  status: RoomStatus;
  rate: number;
  features: string[];
  roomTypeId?: string; // Foreign key to room_types table
}

export interface RoomTypeDetail {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  bedConfiguration: string;
  roomSizeSqm: number;
  amenities: string[];
  imageUrl1: string;
  imageUrl2?: string;
  imageUrl3?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type GuestStatus = 'VIP' | 'Regular' | 'Loyalty Member';

export interface StayHistory {
  id: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  roomType: RoomType;
  ratePaid: number;
}

export type BookingType = 'Individual' | 'Group' | 'Corporate';

export interface Guest {
  id: string;
  name: string;
  lastName?: string; // For profile match deduplication
  email: string;
  phone: string;
  status: GuestStatus;
  loyaltyPoints: number;
  specialRequests: string;
  notes: string;
  history: StayHistory[];
  totalSpend: number;
  nationality?: string;
  tin?: string;
  vatNo?: string;
  vatDate?: string;
  passportNumber?: string; // For strict profile match deduplication
  dateOfBirth?: string;
  preferences?: {
    roomTypePreference?: RoomType;
    pillowPreference?: 'Soft' | 'Firm' | 'Feather' | 'Orthopedic';
    dietaryRestrictions?: string;
    languagePreference?: string;
  };
  identificationDoc?: {
    type: string;
    number: string;
    expiryDate: string;
    issueDate?: string;
    issuingCountry?: string;
    frontImageUrl?: string;
    backImageUrl?: string;
    uploadedAt?: string;
    verifiedAt?: string;
    isUploaded: boolean;
  };
  // Hierarchical structure for group/corporate bookings
  parentGroupId?: string; // ID of the group booking this guest belongs to
  parentCorporateId?: string; // ID of the corporate account this guest belongs to
  isPrimaryContact?: boolean; // Whether this guest is the primary contact for the group/corporate
  // Billing routing for this specific guest (overrides defaults)
  billingRoutingProfileId?: string;
}

export type ReservationStatus = 
  | 'Confirmed' 
  | 'CheckedIn' 
  | 'CheckedOut' 
  | 'Cancelled'
  | 'Waitlisted';

export type BookingChannel = 
  | 'Booking.com' 
  | 'Expedia' 
  | 'Walk-In' 
  | 'Direct Website' 
  | 'Corporate';

export type PaymentStatus = 'Unpaid' | 'Paid' | 'Partial';

export interface FolioCharge {
  id: string;
  amount: number;
  description: string;
  date: string;
  isVoided?: boolean;
  type?: 'Room' | 'F&B' | 'Extra' | 'Minibar' | 'Laundry' | 'Tax' | 'Discount' | 'Transfer' | 'Other';
  targetFolio?: 'A' | 'B';
}

export interface FolioPayment {
  id: string;
  amount: number;
  method: string;
  date: string;
  notes?: string;
  isVoided?: boolean;
  targetFolio?: 'A' | 'B';
  receiptUrl?: string;
  bankAccountId?: string;
}

export interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestStatus: GuestStatus;
  roomType: RoomType;
  roomNumber?: string; // assigned room
  roomNights?: string[][]; // per-night room assignments (date index -> selected rooms)
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  status: ReservationStatus;
  rate: number; // Nightly rate at booking time
  totalAmount: number;
  channel: BookingChannel;
  paymentStatus: PaymentStatus;
  notes?: string;
  charges?: FolioCharge[]; // Itemized extra charges
  payments?: FolioPayment[]; // Itemized payment list
  earlyCheckOutRequested?: boolean;
  lateCheckOutRequested?: boolean;
  groupBookingId?: string; // Empty if individual
  groupId?: string; // References group_profiles table for automatic linking
  isGroup?: boolean;
  depositAmount?: number;
  isDepositPaid?: boolean;
  ratePlanId?: string;
  packageIds?: string[];
  guestServiceIds?: string[];
  additionalGuestIds?: string[];
  // B2B fields
  operator_id?: string;
  operatorId?: string;
  allotment_id?: string;
  voucherCode?: string;
  voucherDiscount?: number;
  discountPercent?: number;
  taxPercent?: number;
  serviceChargePercent?: number;
  customHotelName?: string;
  customHotelAddress?: string;
  hotelTin?: string;
  hotelVatNo?: string;
  hotelVatDate?: string;
  guestTin?: string;
  guestVatNo?: string;
  guestVatDate?: string;
  guestNationality?: string;
  guestId?: string; // Foreign key to Guest Profile (CRM)
  routingProfileId?: string;
  corporateAccountId?: string;
  bookingGroupId?: string; // Links multiple rooms booked together under one guest
  bookingType?: BookingType;
  // Dynamic folio routing for this reservation
  folioRoutingOverrides?: {
    chargeType: FolioCharge['type'];
    targetFolio: 'A' | 'B';
    reason?: string;
  }[];
}

export interface BillingRoutingRule {
  id: string;
  name: string;
  description: string;
  // Primary (A) folio = Guest Individual; Secondary (B) folio = Group/Corporate Master
  rules: {
    chargeType: FolioCharge['type'] | 'All';
    targetFolio: 'A' | 'B';
    description: string;
  }[];
  applicableTo: 'Individual' | 'Group' | 'Corporate' | 'All';
  isDefault?: boolean;
}

export interface DispatchedEmail {
  id: string;
  reservationId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  sentAt: string;
  linkUrl: string;
}

export interface GroupBooking {
  id: string;
  groupName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  roomTypeNeeded: RoomType; // Deprecated: use roomTypeBreakdown instead
  roomCount: number; // Deprecated: use roomTypeBreakdown instead
  roomTypeBreakdown?: {
    roomType: RoomType;
    count: number;
  }[];
  checkInDate: string;
  checkOutDate: string;
  discountPercent: number;
  status: 'Pending' | 'Confirmed' | 'CheckedIn' | 'Completed' | 'Cancelled';
  // Enhanced Group Profile (Parent-Child Cluster)
  organizerCompany?: string;
  cutOffDate?: string; // Date by which unsold rooms release
  masterPaymentMethod?: string; // e.g. 'Invoice', 'Credit Card', 'Wire Transfer'
  billingAddress?: string;
  groupTin?: string;
  groupVatNo?: string;
  creditLimit?: number;
  roomingList?: {
    guestId: string;
    roomNumber?: string;
    reservationId?: string;
    isCheckedIn: boolean;
    roomType?: RoomType;
  }[];
  // Billing routing: which charge types go to group master vs individual
  defaultRoutingProfileId?: string;
}

export interface CorporateAccount {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  discountPercent: number;
  activeBookings: number;
  unpaidBalance: number;
  // Enhanced Corporate Profile (Split Profile)
  corporateTaxId?: string;
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  creditLimit?: number;
  lifetimeValue?: number; // Total revenue from this corporate across all employees
  negotiatedRateCode?: string;
  paymentTerms?: string; // e.g. 'Net 30', 'Net 60'
  isActive?: boolean;
  // Which charge categories route to company vs employee by default
  defaultRoutingProfileId?: string;
}

// ================================================================================
// GROUP PROFILE TYPES
// ================================================================================

export type GroupProfileType = 
  | 'GroupReservation'
  | 'CorporateAccount'
  | 'TravelAgent'
  | 'TourOperator'
  | 'CrewBooking'
  | 'Conference'
  | 'Event'
  | 'LongTermContract';

export type GroupProfileStatus = 
  | 'Active'
  | 'Inactive'
  | 'Suspended'
  | 'Blacklisted'
  | 'Archived';

export type GroupPaymentMethod = 
  | 'Invoice'
  | 'Credit Card'
  | 'Wire Transfer'
  | 'Check'
  | 'Cash'
  | 'Other';

export interface GroupProfile {
  id: string;
  code: string; // Unique group code (e.g., CORP-001, GRP-2026-TECH)
  name: string; // Group name
  type: GroupProfileType;
  status: GroupProfileStatus;
  
  // Contact Information
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactTitle?: string;
  
  // Organization Details
  organizationName?: string;
  organizationAddress?: string;
  organizationCity?: string;
  organizationCountry?: string;
  organizationTaxId?: string;
  organizationVatNo?: string;
  
  // Billing Information
  billingAddress?: string;
  billingCity?: string;
  billingCountry?: string;
  billingTaxId?: string;
  billingVatNo?: string;
  paymentTerms?: string; // Default: 'Net 30'
  creditLimit?: number; // Default: 0
  currentBalance?: number; // Default: 0
  
  // Contract Details
  contractStartDate?: string;
  contractEndDate?: string;
  cutOffDate?: string; // Date by which unsold rooms release
  negotiatedRateCode?: string;
  discountPercent?: number; // Default: 0
  
  // Master Payment Settings
  masterPaymentMethod?: GroupPaymentMethod;
  
  // Room Requirements
  roomTypeBreakdown?: {
    roomType: RoomType;
    count: number;
  }[];
  totalRoomsAllocated?: number; // Default: 0
  totalRoomsUsed?: number; // Default: 0
  
  // Analytics
  totalRevenue?: number; // Default: 0
  totalRoomNights?: number; // Default: 0
  totalStays?: number; // Default: 0
  lifetimeValue?: number; // Default: 0
  averageDailyRate?: number; // Default: 0
  
  // Metadata
  notes?: string;
  preferences?: Record<string, any>;
  customFields?: Record<string, any>;
  
  // Default Folio Routing Profile
  defaultRoutingProfileId?: string;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ================================================================================
// GUEST GROUP RELATIONSHIP TYPES
// ================================================================================

export type RelationshipType = 
  | 'GroupReservation'
  | 'CorporateAccount'
  | 'TravelAgent'
  | 'TourOperator'
  | 'CrewBooking'
  | 'Conference'
  | 'Event'
  | 'LongTermContract';

export type RelationshipStatus = 
  | 'Active'
  | 'Inactive'
  | 'Terminated'
  | 'Expired'
  | 'Merged';

export interface GuestGroupRelationship {
  id: string;
  guestId: string;
  groupId: string;
  reservationId?: string;
  
  // Relationship Type
  relationshipType: RelationshipType;
  
  // Relationship Status
  status: RelationshipStatus;
  
  // Time Period
  startDate: string; // Default: current date
  endDate?: string; // Null means currently active
  
  // Role within Group
  isPrimaryContact: boolean; // Default: false
  roleTitle?: string; // e.g., 'Event Coordinator', 'Department Head'
  
  // Analytics (calculated from reservations)
  totalStays?: number; // Default: 0
  totalRoomNights?: number; // Default: 0
  totalRevenue?: number; // Default: 0
  averageDailyRate?: number; // Default: 0
  lastStayDate?: string;
  
  // Metadata
  notes?: string;
  customFields?: Record<string, any>;
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// ================================================================================
// GROUP AUDIT LOG TYPES
// ================================================================================

export type GroupAuditAction = 
  | 'group_profile_created'
  | 'group_profile_updated'
  | 'group_profile_deleted'
  | 'group_status_changed'
  | 'relationship_created'
  | 'relationship_updated'
  | 'relationship_terminated'
  | 'relationship_status_changed'
  | 'guest_linked_to_group'
  | 'guest_unlinked_from_group'
  | 'guest_merged'
  | 'group_assignment_changed'
  | 'automatic_linking_triggered'
  | 'bulk_linking_operation'
  | 'data_import_linking';

export type GroupAuditEntityType = 
  | 'GroupProfile'
  | 'GuestGroupRelationship'
  | 'Guest'
  | 'Reservation';

export type GroupAuditOutcome = 'success' | 'failure' | 'partial';

export interface GroupAuditEvent {
  id: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  
  // Action Details
  action: GroupAuditAction;
  
  // Entity References
  entityType?: GroupAuditEntityType;
  entityId?: string;
  
  // Group Context
  groupId?: string;
  guestId?: string;
  reservationId?: string;
  relationshipId?: string;
  
  // Change Details
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  reason?: string;
  
  // System Context
  ipAddress?: string;
  userAgent?: string;
  module?: string; // Default: 'group_management'
  
  // Outcome
  outcome: GroupAuditOutcome;
}

// ================================================================================
// GROUP ANALYTICS TYPES
// ================================================================================

export interface GroupAnalytics {
  groupId: string;
  groupName: string;
  groupType: GroupProfileType;
  
  // Revenue Metrics
  totalRevenue: number;
  averageDailyRate: number;
  revenuePerRoomNight: number;
  
  // Volume Metrics
  totalRoomNights: number;
  totalStays: number;
  averageLengthOfStay: number;
  
  // Member Metrics
  totalMembers: number;
  activeMembers: number;
  topGuests: {
    guestId: string;
    guestName: string;
    totalRevenue: number;
    totalStays: number;
  }[];
  
  // Time Period
  periodStart: string;
  periodEnd: string;
}

export interface GuestGroupSummary {
  guestId: string;
  guestName: string;
  guestEmail: string;
  
  // Current Group
  currentGroup?: {
    groupId: string;
    groupName: string;
    groupType: GroupProfileType;
    relationshipType: RelationshipType;
    isPrimaryContact: boolean;
    startDate: string;
  };
  
  // Historical Groups
  previousGroups: {
    groupId: string;
    groupName: string;
    groupType: GroupProfileType;
    relationshipType: RelationshipType;
    startDate: string;
    endDate: string;
    totalStays: number;
    totalRevenue: number;
  }[];
  
  // Total Metrics
  totalGroupStays: number;
  totalGroupRevenue: number;
  totalGroupRoomNights: number;
}

export interface RatePlan {
  id: string;
  name: string;
  description: string;
  baseModifier: number; // e.g. 1.0 for standard, 0.9 for non-refundable, 1.2 for breakfast included
  active: boolean;
}

export interface Season {
  id: string;
  name: string;
  startMonth: number; // 0-11
  startDay: number;
  endMonth: number;
  endDay: number;
  multiplier: number; // e.g. 1.5 for peak, 0.8 for low
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  chargeFrequency: 'once' | 'daily';
}

export interface GuestService {
  id: string;
  name: string;
  description: string;
  category: 'dining' | 'transportation' | 'laundry' | 'spa' | 'room_service' | 'concierge';
  price: number;
  available: boolean;
}

export interface Promotion {
  id: string;
  code: string;
  name: string;
  discountPercent: number;
  active: boolean;
  validFrom: string;
  validTo: string;
  appliesTo: RoomType[];
}

export interface MarketingCampaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  leadsCount: number;
  conversionsCount: number;
  roi: number; // percentage
  status: 'Prospecting' | 'Active' | 'Completed' | 'Paused';
}

export interface Notification {
  id: string;
  time: string; // ISO or local date string
  message: string;
  type: 'info' | 'warning' | 'success' | 'task';
  department: 'Front Office' | 'Housekeeping' | 'F&B' | 'Maintenance' | 'Finance' | 'Procurement' | 'HR' | 'Spa' | 'Executive';
  read: boolean;
}

export interface GuestCommunication {
  id: string;
  guestId: string;
  reservationId?: string;
  roomNumber?: string;
  message: string;
  messageType: 'Request' | 'Booking' | 'Inquiry' | 'Complaint' | 'Other';
  status: 'Pending' | 'Resolved' | 'In Progress';
  reply?: string;
  createdAt: string;
  repliedAt?: string;
  repliedBy?: string;
}

export interface AirportShuttleRequest {
  id: string;
  guestId: string;
  reservationId?: string;
  roomNumber?: string;
  scheduledDate: string;
  scheduledTime: string;
  shuttleType: 'Pickup' | 'Drop-off';
  flightNumber?: string;
  flightTime?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  notes?: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ERPStats {
  occupancyRate: number; // percentage
  adr: number; // average daily rate in USD
  revpar: number; // revenue per available room
  totalRevenue: number; // total since simulation started
  occupiedRoomsCount: number;
  dirtyRoomsCount: number;
  outOfOrderCount: number;
  arrivalsTodayCount: number;
  departuresTodayCount: number;
}

export type UserRole = 'frontoffice' | 'housekeeping' | 'f&b' | 'maintenance' | 'inventory' | 'finance' | 'hr' | 'executive' | 'procurement' | 'general_manager' | 'system_admin' | 'admin' | 'custom' | 'gm' | 'owner';

export interface PermissionMatrix {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
  export: boolean;
  print: boolean;
}

export interface CustomRole {
  id: string;
  name: string;
  description: string;
  department: string;
  modulePermissions: Record<string, PermissionMatrix>;
  tabPermissions: Record<string, string>;
  buttonPermissions: Record<string, string>;
  fieldPermissions: Record<string, string>;
  isSystem?: boolean;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  device: string;
  ipAddress: string;
  module: string;
  recordId?: string;
  action: string;
  details: string;
}

export interface RoomTypeMetadata {
  type: RoomType;
  title: string;
  description: string;
  shortDescription?: string;
  imgUrl: string;
  galleryUrls?: string[];
  amenities: string[];
  stars: number;
  maxOccupancy?: number;
  bedConfiguration?: string;
  viewType?: string;
  sqm?: number;
}

export interface FeeComponent {
  id: string;
  name: string;
  feeType: 'percentage' | 'fixed_amount';
  value: number;
  isEnabled: boolean;
  displayOrder: number;
  accountCode?: string;
}

export interface GlobalHotelSettings {
  customHotelName: string;
  customHotelAddress: string;
  hotelTin: string;
  hotelVatNo: string;
  hotelVatDate: string;
  taxPercent: number;
  serviceChargePercent: number;
  exchangeRate: number;
  heroImageUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  publicTagline?: string;
  socialLinks?: { platform: string; url: string }[];
  invoiceTemplate?: 'classic' | 'modern' | 'minimalist' | 'thermal';
  invoiceFooterText?: string;
  invoiceBankDetails?: string;
  paymentTypes?: string[];
  addonCharges?: { name: string; percent: number }[];
  feeComponents?: FeeComponent[];
  posCategories?: string[];
  posOutlets?: string[];
  posPrinters?: string[];
  posOutletCategories?: Record<string, string[]>;
  splitFolioRules?: {
    id: string;
    name: string;
    description: string;
    corporateBillingOnly: boolean;
    primaryTypes: string[];
    secondaryTypes: string[];
  }[];
  loyaltyPointsPerDollar?: number;
  loyaltyRedemptionRate?: number;
  cancellationGraceHours?: number;
  cancellationPenaltyPercent?: number;
  creditLimitDefault?: number;
  vipSpendThreshold?: number;
  autoNightAuditTime?: string;
  operatingHours?: {
    frontDesk: string;
    restaurant: string;
    bar: string;
    spa: string;
  };
  revenueMappings?: {
    roomRevenueAccount: string;
    fbRevenueAccount: string;
    barRevenueAccount: string;
    giftShopRevenueAccount: string;
    taxPayableAccount: string;
  };
  roomTypes?: string[];
  roomFeatures?: string[];
  guestStatuses?: string[];
  inventoryCategories?: string[];
  inventoryLocations?: string[];
  inventoryUnits?: string[];
  floors?: string[];
  departments?: string[];
  sessionTimeout?: number;
  passwordComplexity?: 'low' | 'medium' | 'high';
  forceMfa?: boolean;
  strictPasswordRotation?: boolean;
  biometricReauth?: boolean;
  maintenanceMode?: boolean;
  maintenanceMessage?: string;
  publicBookingEnabled?: boolean;
  moduleToggles?: Record<string, boolean>;
  allowedIps?: string[];
  backupFrequency?: 'daily' | 'weekly' | 'manual';
  systemLogLevel?: 'info' | 'detailed' | 'debug';
  apiIntegrations?: {
    serviceName: string;
    apiKey: string;
    status: 'active' | 'inactive';
  }[];
  termsAdventureLiability?: string;
  termsWaitlistProtocol?: string;
  termsConservationDevotion?: string;
  termsBillingCancellation?: string;
  termsWildernessEmergency?: string;
  bookingTerms?: string;
  policySections?: { id: string; title: string; content: string; }[];
  isolationPolicy?: {
    finance: boolean;
    hr: boolean;
    executive: boolean;
    dualSignature: boolean;
  };
  emailTemplates?: {
    id: string;
    name: string;
    subject: string;
    body: string;
    enabled: boolean;
    variables: string[];
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleDescription: string;
  avatarInitials: string;
  status?: 'Active' | 'Inactive' | 'Pending' | 'Suspended' | 'Locked';
  lastLogin?: string;

  // Expanded RBAC & HR Fields
  employeeId?: string;
  username?: string;
  mobileNumber?: string;
  department?: string;
  customRoleId?: string;
  
  // Security Settings
  securitySettings?: {
    twoFactorEnabled: boolean;
    sessionTimeoutMins: number;
    ipRestrictions: string;
    deviceRestrictions: string;
    forcePasswordChange: boolean;
  };
  
  // Data Boundaries
  dataRestrictions?: {
    allowAllDepartments: boolean;
    allowedDepartments: string[];
    propertyAccess: 'Single' | 'Multiple' | 'Corporate';
  };

  allowedTabs?: ('frontoffice' | 'housekeeping' | 'f&b' | 'maintenance' | 'inventory' | 'finance' | 'hr' | 'executive' | 'admin' | 'procurement' | 'settings')[];
  allowedSettings?: {
    editGlobalSettings?: boolean;
    adjustHotelTaxes?: boolean;
    bypassHousekeepingLock?: boolean;
    manageUserAccounts?: boolean;
    manageRoles?: boolean;

    // Detailed granular access permissions
    viewRatePlans?: boolean;
    editRatePlans?: boolean;
    viewRoomOutlook?: boolean;
    viewSalesCampaigns?: boolean;
    manageSalesCampaigns?: boolean;
  };
}

export function checkTabPermission(user: User | null, tab: string): boolean {
  if (!user) return false;
  if (user.allowedTabs) {
    return user.allowedTabs.includes(tab as any);
  }
  if (user.role === 'executive' || user.role === 'general_manager' || user.role === 'system_admin' || user.role === 'admin' || user.role === 'gm' || user.role === 'owner') return true;
  return user.role === tab;
}

export function checkSettingPermission(
  user: User | null,
  setting: keyof Exclude<User['allowedSettings'], undefined>
): boolean {
  if (!user) return false;
  if (user.allowedSettings && user.allowedSettings[setting] !== undefined) {
    return !!user.allowedSettings[setting];
  }
  // Fallback for admin roles if setting is not explicitly defined
  if (user.role === 'executive' || user.role === 'general_manager' || user.role === 'system_admin' || user.role === 'admin' || user.role === 'gm' || user.role === 'owner') {
    return true;
  }
  return false;
}

export interface YieldPolicy {
  id: string;
  name: string;
  description: string;
  multiplier: number;
  isDefault?: boolean;
}

export type AdminChangeType =
  | 'user-create'
  | 'user-update'
  | 'user-delete'
  | 'role-create'
  | 'role-update'
  | 'role-delete'
  | 'security-setting'
  | 'global-setting'
  | 'property-config'
  | 'pos-config'
  | 'loyalty-config'
  | 'revenue-mapping'
  | 'integration-config'
  | 'platform-control'
  | 'operational-policy'
  | 'backup-config'
  | 'audit-config';

export type AdminChangePayload =
  | { operation: 'addSystemUser'; args: [Omit<User, 'id'>] }
  | { operation: 'updateSystemUser'; args: [string, Partial<User>] }
  | { operation: 'deleteSystemUser'; args: [string] }
  | { operation: 'addCustomRole'; args: [Omit<CustomRole, 'id'>] }
  | { operation: 'updateCustomRole'; args: [string, Partial<CustomRole>] }
  | { operation: 'deleteCustomRole'; args: [string] }
  | { operation: 'updateGlobalHotelSettings'; args: [Partial<GlobalHotelSettings>] }
  | { operation: 'deleteRoom'; args: [string] };

export interface PendingAdminChange {
  id: string;
  title: string;
  description: string;
  changeType: AdminChangeType;
  submittedAt: string;
  submittedBy: string;
  payload?: AdminChangePayload;
  approvedBy?: string;
  approvedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface RiskCompliance {
  id: string;
  title: string;
  category: 'Compliance' | 'Legal' | 'Financial' | 'Safety' | 'Operational';
  status: 'Good' | 'Warning' | 'Critical' | 'Expired';
  expiryDate: string;
  owner: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

