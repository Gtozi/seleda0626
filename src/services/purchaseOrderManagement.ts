/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Purchase Order Management Service
 * Handles purchase orders, goods receipts, and supplier invoices with three-way matching
 */

const API_BASE = '/api/food-beverage';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Types
export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  outletId?: string;
  status: 'draft' | 'submitted' | 'acknowledged' | 'partial' | 'received' | 'closed' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  currency?: string;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue';
  notes?: string;
  internalNotes?: string;
  submittedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderLine {
  id: string;
  poId: string;
  ingredientId: string;
  description?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal: number;
  expectedDate?: string;
  receivedDate?: string;
  qualityStatus: 'pending' | 'approved' | 'rejected' | 'partial';
  rejectionReason?: string;
  createdAt: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poId: string;
  supplierId: string;
  outletId?: string;
  receivedDate: string;
  receivedBy: string;
  deliveryNoteNumber?: string;
  deliveryNoteDate?: string;
  totalItemsReceived: number;
  totalQuantityReceived: number;
  totalQuantityRejected: number;
  notes?: string;
  createdAt: string;
}

export interface GoodsReceiptLine {
  id: string;
  receiptId: string;
  poLineId: string;
  ingredientId: string;
  quantityReceived: number;
  quantityRejected: number;
  unitOfMeasure: string;
  batchNumber?: string;
  expiryDate?: string;
  unitCost?: number;
  qualityStatus: 'approved' | 'rejected' | 'partial';
  rejectionReason?: string;
  storageLocation?: string;
  createdAt: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  poId?: string;
  receiptId?: string;
  supplierId: string;
  invoiceDate: string;
  dueDate?: string;
  invoiceAmount: number;
  taxAmount: number;
  totalAmount: number;
  currency?: string;
  status: 'pending' | 'matched' | 'disputed' | 'partial' | 'paid';
  paymentDate?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Purchase Order CRUD operations
export async function fetchPurchaseOrders(options?: {
  supplierId?: string;
  status?: string;
  outletId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<PurchaseOrder[]> {
  const params = new URLSearchParams();
  if (options?.supplierId) params.append('supplierId', options.supplierId);
  if (options?.status) params.append('status', options.status);
  if (options?.outletId) params.append('outletId', options.outletId);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<PurchaseOrder[]>(`/purchase-orders${queryString}`);
}

export async function fetchPurchaseOrderById(id: string): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}`);
}

export async function createPurchaseOrder(po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(po),
  });
}

export async function updatePurchaseOrder(id: string, po: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(po),
  });
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  await apiRequest<void>(`/purchase-orders/${id}`, {
    method: 'DELETE',
  });
}

// Purchase Order Lines operations
export async function fetchPurchaseOrderLines(poId: string): Promise<PurchaseOrderLine[]> {
  return apiRequest<PurchaseOrderLine[]>(`/purchase-orders/${poId}/lines`);
}

export async function createPurchaseOrderLine(
  poId: string,
  line: Partial<PurchaseOrderLine>
): Promise<PurchaseOrderLine> {
  return apiRequest<PurchaseOrderLine>(`/purchase-orders/${poId}/lines`, {
    method: 'POST',
    body: JSON.stringify(line),
  });
}

export async function updatePurchaseOrderLine(
  poId: string,
  lineId: string,
  line: Partial<PurchaseOrderLine>
): Promise<PurchaseOrderLine> {
  return apiRequest<PurchaseOrderLine>(`/purchase-orders/${poId}/lines/${lineId}`, {
    method: 'PUT',
    body: JSON.stringify(line),
  });
}

export async function deletePurchaseOrderLine(poId: string, lineId: string): Promise<void> {
  await apiRequest<void>(`/purchase-orders/${poId}/lines/${lineId}`, {
    method: 'DELETE',
  });
}

// Purchase Order workflow operations
export async function submitPurchaseOrder(id: string): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}/submit`, {
    method: 'POST',
  });
}

export async function acknowledgePurchaseOrder(id: string): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}/acknowledge`, {
    method: 'POST',
  });
}

export async function approvePurchaseOrder(id: string): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}/approve`, {
    method: 'POST',
  });
}

export async function cancelPurchaseOrder(id: string, reason: string): Promise<PurchaseOrder> {
  return apiRequest<PurchaseOrder>(`/purchase-orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function calculatePurchaseOrderTotal(id: string): Promise<{ total: number }> {
  return apiRequest<{ total: number }>(`/purchase-orders/${id}/calculate-total`);
}

// Goods Receipt operations
export async function fetchGoodsReceipts(options?: {
  poId?: string;
  supplierId?: string;
  outletId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<GoodsReceipt[]> {
  const params = new URLSearchParams();
  if (options?.poId) params.append('poId', options.poId);
  if (options?.supplierId) params.append('supplierId', options.supplierId);
  if (options?.outletId) params.append('outletId', options.outletId);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<GoodsReceipt[]>(`/goods-receipts${queryString}`);
}

export async function fetchGoodsReceiptById(id: string): Promise<GoodsReceipt> {
  return apiRequest<GoodsReceipt>(`/goods-receipts/${id}`);
}

export async function createGoodsReceipt(receipt: Partial<GoodsReceipt>): Promise<GoodsReceipt> {
  return apiRequest<GoodsReceipt>('/goods-receipts', {
    method: 'POST',
    body: JSON.stringify(receipt),
  });
}

export async function updateGoodsReceipt(id: string, receipt: Partial<GoodsReceipt>): Promise<GoodsReceipt> {
  return apiRequest<GoodsReceipt>(`/goods-receipts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(receipt),
  });
}

// Goods Receipt Lines operations
export async function fetchGoodsReceiptLines(receiptId: string): Promise<GoodsReceiptLine[]> {
  return apiRequest<GoodsReceiptLine[]>(`/goods-receipts/${receiptId}/lines`);
}

export async function createGoodsReceiptLine(
  receiptId: string,
  line: Partial<GoodsReceiptLine>
): Promise<GoodsReceiptLine> {
  return apiRequest<GoodsReceiptLine>(`/goods-receipts/${receiptId}/lines`, {
    method: 'POST',
    body: JSON.stringify(line),
  });
}

export async function updateGoodsReceiptLine(
  receiptId: string,
  lineId: string,
  line: Partial<GoodsReceiptLine>
): Promise<GoodsReceiptLine> {
  return apiRequest<GoodsReceiptLine>(`/goods-receipts/${receiptId}/lines/${lineId}`, {
    method: 'PUT',
    body: JSON.stringify(line),
  });
}

export async function deleteGoodsReceiptLine(receiptId: string, lineId: string): Promise<void> {
  await apiRequest<void>(`/goods-receipts/${receiptId}/lines/${lineId}`, {
    method: 'DELETE',
  });
}

// Supplier Invoice operations
export async function fetchSupplierInvoices(options?: {
  supplierId?: string;
  poId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<SupplierInvoice[]> {
  const params = new URLSearchParams();
  if (options?.supplierId) params.append('supplierId', options.supplierId);
  if (options?.poId) params.append('poId', options.poId);
  if (options?.status) params.append('status', options.status);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<SupplierInvoice[]>(`/supplier-invoices${queryString}`);
}

export async function fetchSupplierInvoiceById(id: string): Promise<SupplierInvoice> {
  return apiRequest<SupplierInvoice>(`/supplier-invoices/${id}`);
}

export async function createSupplierInvoice(invoice: Partial<SupplierInvoice>): Promise<SupplierInvoice> {
  return apiRequest<SupplierInvoice>('/supplier-invoices', {
    method: 'POST',
    body: JSON.stringify(invoice),
  });
}

export async function updateSupplierInvoice(id: string, invoice: Partial<SupplierInvoice>): Promise<SupplierInvoice> {
  return apiRequest<SupplierInvoice>(`/supplier-invoices/${id}`, {
    method: 'PUT',
    body: JSON.stringify(invoice),
  });
}

export async function deleteSupplierInvoice(id: string): Promise<void> {
  await apiRequest<void>(`/supplier-invoices/${id}`, {
    method: 'DELETE',
  });
}

// Invoice workflow operations
export async function matchInvoice(id: string, poId?: string, receiptId?: string): Promise<SupplierInvoice> {
  return apiRequest<SupplierInvoice>(`/supplier-invoices/${id}/match`, {
    method: 'POST',
    body: JSON.stringify({ poId, receiptId }),
  });
}

export async function disputeInvoice(id: string, reason: string): Promise<SupplierInvoice> {
  return apiRequest<SupplierInvoice>(`/supplier-invoices/${id}/dispute`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function markInvoicePaid(id: string, paymentReference: string): Promise<SupplierInvoice> {
  return apiRequest<SupplierInvoice>(`/supplier-invoices/${id}/paid`, {
    method: 'POST',
    body: JSON.stringify({ paymentReference }),
  });
}

// Three-way matching
export async function performThreeWayMatch(poId: string, receiptId: string, invoiceId: string): Promise<{
  matched: boolean;
  discrepancies: Array<{ field: string; poValue: number; receiptValue: number; invoiceValue: number }>;
}> {
  return apiRequest(`/purchase-orders/${poId}/three-way-match`, {
    method: 'POST',
    body: JSON.stringify({ receiptId, invoiceId }),
  });
}

// Analytics and reporting
export async function getPurchaseOrderStatistics(options?: {
  supplierId?: string;
  outletId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  totalOrders: number;
  totalValue: number;
  averageOrderValue: number;
  pendingOrders: number;
  overdueOrders: number;
  onTimeDeliveryRate: number;
}> {
  const params = new URLSearchParams();
  if (options?.supplierId) params.append('supplierId', options.supplierId);
  if (options?.outletId) params.append('outletId', options.outletId);
  if (options?.startDate) params.append('startDate', options.startDate);
  if (options?.endDate) params.append('endDate', options.endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/purchase-orders/statistics${queryString}`);
}

export async function getPendingApprovals(): Promise<PurchaseOrder[]> {
  return apiRequest<PurchaseOrder[]>('/purchase-orders/pending-approvals');
}

export async function getOverduePurchaseOrders(): Promise<PurchaseOrder[]> {
  return apiRequest<PurchaseOrder[]>('/purchase-orders/overdue');
}
