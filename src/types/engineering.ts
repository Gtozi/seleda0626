
export type WorkOrderStatus = 'Logged' | 'Assigned' | 'In Progress' | 'On Hold' | 'Pending Parts' | 'Parts Received' | 'Work Completed' | 'Verification' | 'Quality Audit' | 'Signature' | 'Closed' | 'Pending' | 'Supervisor Review' | 'Technician Assigned';
export type WorkOrderPriority = 'Emergency' | 'Critical' | 'High' | 'Normal' | 'Low';
export type WorkOrderType = 'Electrical' | 'Plumbing' | 'HVAC' | 'Carpentry' | 'Furniture Repair' | 'Civil Works' | 'Painting' | 'Networking & IT' | 'Security Systems' | 'Landscaping' | 'Kitchen Equipment' | 'Laundry Equipment' | 'Swimming Pool' | 'Generator' | 'Water System';

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
