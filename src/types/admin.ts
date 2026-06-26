
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'On Hold';
export type ApprovalCategory = 'Procurement' | 'HR' | 'Inventory' | 'Finance' | 'Maintenance' | 'Capital';

export interface ApprovalRequest {
  id: string;
  category: ApprovalCategory;
  title: string;
  requestedBy: string;
  department: string;
  amount?: number;
  date: string;
  status: ApprovalStatus;
  priority: 'Low' | 'Normal' | 'High' | 'Emergency';
  description: string;
}

export interface OperationalSummary {
  frontOffice: {
    occupancy: number;
    arrivals: number;
    departures: number;
    vipCount: number;
  };
  housekeeping: {
    clean: number;
    dirty: number;
    maintenance: number;
  };
  fb: {
    revenue: number;
    covers: number;
    foodCostPct: number;
  };
  engineering: {
    openOrders: number;
    emergencies: number;
  };
}

export interface RiskItem {
  id: string;
  category: 'Contract' | 'License' | 'Tax' | 'Safety' | 'Financial';
  title: string;
  expiryDate: string;
  status: 'Critical' | 'Warning' | 'Good';
  description: string;
}

export interface ExecutiveInsight {
  id: string;
  type: 'Revenue' | 'Staffing' | 'Inventory' | 'Maintenance' | 'Guest';
  message: string;
  recommendation: string;
  impact: 'High' | 'Medium' | 'Low';
}
