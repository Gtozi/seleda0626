
export type InventoryCategory = 'Food & Beverage' | 'Housekeeping' | 'Engineering' | 'Office Supplies' | 'Operating Supplies' | 'Fixed Assets' | 'Gift Shop';
export type InventorySubCategory = 'Dry Foods' | 'Fresh Produce' | 'Meat & Poultry' | 'Dairy' | 'Bakery' | 'Beverages' | 'Guest Amenities' | 'Cleaning Chemicals' | 'Laundry Supplies' | 'Electrical' | 'Plumbing' | 'Mechanical' | 'HVAC' | 'Stationery' | 'Printing' | 'Consumables' | 'Packaging' | 'Furniture' | 'Equipment' | 'Appliances' | 'Tools' | 'Souvenirs';

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  category: InventoryCategory;
  subcategory: InventorySubCategory;
  unit: string;
  brand?: string;
  supplierId: string;
  minStock: number;
  maxStock: number;
  reorderLevel: number;
  lastCost: number;
  avgCost: number;
  currentStock: number;
  location: string;
  barcode?: string;
  storeId?: string;
  salePrice?: number;
  retailPrice?: number;
  guestPortalActive?: boolean;
  imageUrl?: string;
  dietaryTags?: string[];
}

export type RequisitionStatus = 'Pending' | 'Verified' | 'Approved' | 'Issued' | 'Received' | 'Cancelled';

export interface Requisition {
  id: string;
  number: string;
  department: string;
  requestedBy: string;
  requestDate: string;
  priority: 'Normal' | 'High' | 'Urgent';
  status: RequisitionStatus;
  items: { 
    itemId: string; 
    name: string; 
    requestedQty: number; 
    issuedQty?: number; 
    unit: string;
    cost?: number;
  }[];
}

export interface GRN {
  id: string;
  number: string;
  supplierId: string;
  supplierName: string;
  purchaseOrderId?: string;
  deliveryNote: string;
  invoiceNumber: string;
  receivedDate: string;
  receiver: string;
  items: {
    itemId: string;
    name: string;
    receivedQty: number;
    unitCost: number;
    batchNumber?: string;
    expiryDate?: string;
  }[];
  totalValue: number;
}

export interface Store {
  id: string;
  name: string;
  type: 'Main' | 'Departmental' | 'Virtual';
  manager: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  rating: number; // 1-5
}

export interface StockMovement {
  id: string;
  date: string;
  itemId: string;
  itemName: string;
  type: 'Purchase' | 'Issue' | 'Transfer' | 'Adjustment' | 'Damage' | 'Return';
  quantity: number;
  cost: number;
  reference: string;
  user: string;
  storeFrom?: string;
  storeTo?: string;
}
