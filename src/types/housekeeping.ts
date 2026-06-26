/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomCleaningStatus = 'Dirty' | 'Cleaning' | 'Inspected' | 'Out of Order' | 'VIP' | 'Maintenance Hold';

export interface InspectionChecklist {
  bedSetup: boolean;
  linenQuality: boolean;
  bathroomSanitation: boolean;
  dustCheck: boolean;
  trashRemoval: boolean;
  towelsVerification: boolean;
  toiletriesCount: boolean;
  waterBottles: boolean;
  guestAmenities: boolean;
  coffeeSetup: boolean;
  lighting: boolean;
  acFunctionality: boolean;
  tvFunctionality: boolean;
  internetAvailability: boolean;
  plumbingCheck: boolean;
  brandStandards: boolean;
  roomFragrance: boolean;
  furnitureArrangement: boolean;
  mirrorGlassQuality: boolean;
}

export interface InspectionRecord {
  id: string;
  roomNumber: string;
  inspectorName: string;
  checklist: InspectionChecklist;
  score: number; // 0-100
  status: 'Pass' | 'Fail' | 'Re-inspection';
  notes: string;
  photos: string[];
  voiceNoteUrl?: string;
  timestamp: string;
  supervisorSignature?: string;
}

export type MaintenanceCategory = 
  | 'Plumbing' | 'Electrical' | 'HVAC' | 'Internet/TV' 
  | 'Furniture damage' | 'Water leakage' | 'Door lock issues' 
  | 'Pest control' | 'Safety hazards';

export interface MaintenanceIssue {
  id: string;
  roomNumber: string;
  category: MaintenanceCategory;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  reportedBy: string;
  reportedAt: string;
  status: 'Reported' | 'Engineering Assigned' | 'Work In Progress' | 'Awaiting Verification' | 'Completed';
  technicianName?: string;
  eta?: string;
  photos: string[];
  repairHistory: string[];
  slaTimer?: number; // in minutes
}

export interface LaundryItem {
  id: string;
  guestName: string;
  roomNumber: string;
  itemType: string;
  serviceType: 'Regular' | 'Express';
  price: number;
  status: 'Pickup' | 'Tagging' | 'Processing' | 'Delivery' | 'Confirmed';
  pickupTime: string;
  deliveryEta: string;
  barcode: string;
}

export interface LinenStock {
  id: string;
  type: 'Bed sheets' | 'Pillow covers' | 'Towels' | 'Bath mats' | 'Bathrobes' | 'Curtains' | 'Table linen';
  totalInStock: number;
  inLaundry: number;
  onFloors: number;
  damaged: number;
  lifespanCount: number; // number of washes
  reorderLevel: number;
}

export interface LostAndFoundItem {
  id: string;
  roomNumber: string;
  category: string;
  description: string;
  foundBy: string;
  foundAt: string;
  storageLocation: string;
  guestName?: string;
  status: 'Registered' | 'Claim Initiated' | 'ID Verification' | 'Approval & Release' | 'Closed';
  photos: string[];
  claimDetails?: {
    claimantName: string;
    idVerified: boolean;
    releaseDate: string;
    approvedBy: string;
  };
}

export interface StaffPerformance {
  staffId: string;
  roomsCleaned: number;
  averageTime: number; // minutes
  inspectionPassRate: number; // percentage
  qualityScore: number;
  attendanceStatus: 'On Duty' | 'Off Duty' | 'Break';
  shiftHistory: { date: string; start: string; end: string }[];
}

export interface HousekeepingKPIs {
  dirtyRooms: number;
  vacantDirty: number;
  occupiedDirty: number;
  cleaningInProgress: number;
  inspectedRooms: number;
  outOfOrder: number;
  outOfService: number;
  vipPriority: number;
  earlyArrivalPending: number;
  lateCheckoutImpact: number;
  maintenancePending: number;
  staffActive: number;
  averageCleaningTime: number;
  floorReadiness: number[]; // % per floor
  operationalHealthScore: number;
  guestReadinessIndex: number;
  staffEfficiencyScore: number;
}
