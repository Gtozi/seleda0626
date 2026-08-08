
export type WorkOrderStatus = 'Draft' | 'Submitted' | 'Approved' | 'Assigned' | 'In Progress' | 'Waiting for Parts' | 'Waiting for Vendor' | 'Completed' | 'Verified' | 'Closed' | 'Cancelled';
export type WorkOrderPriority = 'Emergency' | 'Critical' | 'High' | 'Normal' | 'Low';
export type WorkOrderType = 'Electrical' | 'Plumbing' | 'HVAC' | 'Carpentry' | 'Painting' | 'Furniture' | 'Lock & Door' | 'IT Infrastructure' | 'Kitchen Equipment' | 'Elevators' | 'Fire & Life Safety';

export interface WorkOrder {
  id: string;
  number: string;
  requestDate: string;
  requestingDept: string;
  location: string; // e.g. Room 101, Lobby, Kitchen
  roomNumber?: string;
  assetId?: string;
  priority: WorkOrderPriority;
  type: WorkOrderType;
  description: string;
  status: WorkOrderStatus;
  assignedTechnicianId?: string;
  estimatedCompletion?: string;
  actualCompletion?: string;
  laborHours?: number;
  partsUsed?: { partId: string; quantity: number; cost: number }[];
  totalCost?: number;
  // New fields per specification
  sla?: string; // Service Level Agreement
  asset?: string; // Asset name/description
  spareParts?: string[]; // List of spare parts names
  cost?: number; // Total cost
  attachments?: number; // Number of attachments
  photos?: number; // Number of photos
  completionNotes?: string; // Completion notes
}

export type AssetStatus = 'Operational' | 'Under Maintenance' | 'Out of Service' | 'Retired' | 'Replaced';

export interface Asset {
  id: string;
  code: string;
  name: string;
  category: string;
  location: string;
  purchaseDate: string;
  supplier: string;
  warrantyExpiry: string;
  cost: number;
  expectedLifeYears: number;
  status: AssetStatus;
  healthScore: number; // 0-100
  lastPMDate?: string;
  nextPMDate?: string;
}

export type PMFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual';

export interface PMTask {
  id: string;
  assetId: string;
  assetName: string;
  category: string;
  frequency: PMFrequency;
  lastCompleted?: string;
  nextDueDate: string;
  assignedTechnicianId?: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Overdue';
  checklist: { task: string; completed: boolean }[];
}

export interface UtilityReading {
  id: string;
  type: 'Electricity' | 'Water' | 'Generator Fuel' | 'LPG Gas' | 'Diesel' | 'Solar';
  date: string;
  reading: number;
  unit: string;
  cost: number;
}

export interface SparePart {
  id: string;
  name: string;
  category: 'Electrical' | 'Plumbing' | 'HVAC' | 'Generator' | 'Mechanical' | 'Hardware';
  unit: string;
  currentStock: number;
  minStock: number;
  reorderLevel: number;
  unitCost: number;
}

export interface EngineeringStaff {
  id: string;
  name: string;
  role: 'Electrician' | 'Plumber' | 'HVAC Technician' | 'Carpenter' | 'Painter' | 'General Technician' | 'Supervisor';
  status: 'Available' | 'On Task' | 'Off Duty' | 'Emergency';
  jobsCompletedToday: number;
  avgResponseTimeMin: number;
}
