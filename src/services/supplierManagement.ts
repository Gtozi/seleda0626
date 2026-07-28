/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Supplier Management Service
 * Handles supplier management, contacts, categories, and performance tracking
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
export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  taxId?: string;
  paymentTerms?: number;
  rating?: number;
  isActive?: boolean;
  ediEnabled?: boolean;
  ediEndpoint?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SupplierContact {
  id: string;
  supplierId: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
  createdAt: string;
}

export interface SupplierCategory {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface SupplierPerformance {
  id: string;
  supplierId: string;
  periodStart: string;
  periodEnd: string;
  totalOrders: number;
  onTimeDeliveries: number;
  lateDeliveries: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
  orderAccuracyScore: number;
  averageLeadTime?: number;
  totalSpend: number;
  returnsCount: number;
  complaintsCount: number;
  createdAt: string;
}

// Supplier CRUD operations
export async function fetchSuppliers(options?: {
  isActive?: boolean;
  search?: string;
  category?: string;
}): Promise<Supplier[]> {
  const params = new URLSearchParams();
  if (options?.isActive !== undefined) params.append('isActive', options.isActive.toString());
  if (options?.search) params.append('search', options.search);
  if (options?.category) params.append('category', options.category);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<Supplier[]>(`/suppliers${queryString}`);
}

export async function fetchSupplierById(id: string): Promise<Supplier> {
  return apiRequest<Supplier>(`/suppliers/${id}`);
}

export async function createSupplier(supplier: Partial<Supplier>): Promise<Supplier> {
  return apiRequest<Supplier>('/suppliers', {
    method: 'POST',
    body: JSON.stringify(supplier),
  });
}

export async function updateSupplier(id: string, supplier: Partial<Supplier>): Promise<Supplier> {
  return apiRequest<Supplier>(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(supplier),
  });
}

export async function deleteSupplier(id: string): Promise<void> {
  await apiRequest<void>(`/suppliers/${id}`, {
    method: 'DELETE',
  });
}

// Supplier Contact operations
export async function fetchSupplierContacts(supplierId: string): Promise<SupplierContact[]> {
  return apiRequest<SupplierContact[]>(`/suppliers/${supplierId}/contacts`);
}

export async function createSupplierContact(
  supplierId: string,
  contact: Partial<SupplierContact>
): Promise<SupplierContact> {
  return apiRequest<SupplierContact>(`/suppliers/${supplierId}/contacts`, {
    method: 'POST',
    body: JSON.stringify(contact),
  });
}

export async function updateSupplierContact(
  supplierId: string,
  contactId: string,
  contact: Partial<SupplierContact>
): Promise<SupplierContact> {
  return apiRequest<SupplierContact>(`/suppliers/${supplierId}/contacts/${contactId}`, {
    method: 'PUT',
    body: JSON.stringify(contact),
  });
}

export async function deleteSupplierContact(supplierId: string, contactId: string): Promise<void> {
  await apiRequest<void>(`/suppliers/${supplierId}/contacts/${contactId}`, {
    method: 'DELETE',
  });
}

// Supplier Category operations
export async function fetchSupplierCategories(): Promise<SupplierCategory[]> {
  return apiRequest<SupplierCategory[]>('/supplier-categories');
}

export async function createSupplierCategory(
  category: Partial<SupplierCategory>
): Promise<SupplierCategory> {
  return apiRequest<SupplierCategory>('/supplier-categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

export async function updateSupplierCategory(
  id: string,
  category: Partial<SupplierCategory>
): Promise<SupplierCategory> {
  return apiRequest<SupplierCategory>(`/supplier-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(category),
  });
}

export async function deleteSupplierCategory(id: string): Promise<void> {
  await apiRequest<void>(`/supplier-categories/${id}`, {
    method: 'DELETE',
  });
}

export async function assignSupplierCategory(
  supplierId: string,
  categoryId: string
): Promise<void> {
  await apiRequest<void>(`/suppliers/${supplierId}/categories/${categoryId}`, {
    method: 'POST',
  });
}

export async function removeSupplierCategory(
  supplierId: string,
  categoryId: string
): Promise<void> {
  await apiRequest<void>(`/suppliers/${supplierId}/categories/${categoryId}`, {
    method: 'DELETE',
  });
}

// Supplier Performance operations
export async function fetchSupplierPerformance(
  supplierId: string,
  startDate?: string,
  endDate?: string
): Promise<SupplierPerformance[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<SupplierPerformance[]>(`/suppliers/${supplierId}/performance${queryString}`);
}

export async function calculateSupplierPerformance(
  supplierId: string,
  startDate: string,
  endDate: string
): Promise<SupplierPerformance> {
  return apiRequest<SupplierPerformance>(`/suppliers/${supplierId}/performance/calculate`, {
    method: 'POST',
    body: JSON.stringify({ startDate, endDate }),
  });
}

// Supplier search and filtering
export async function searchSuppliers(query: string): Promise<Supplier[]> {
  return apiRequest<Supplier[]>(`/suppliers/search?q=${encodeURIComponent(query)}`);
}

export async function getTopSuppliersBySpend(limit: number = 10): Promise<Supplier[]> {
  return apiRequest<Supplier[]>(`/suppliers/top-spend?limit=${limit}`);
}

export async function getSuppliersNeedingAttention(): Promise<Supplier[]> {
  return apiRequest<Supplier[]>('/suppliers/needs-attention');
}

// Supplier statistics
export async function getSupplierStatistics(supplierId: string): Promise<{
  totalOrders: number;
  totalSpend: number;
  averageOrderValue: number;
  onTimeDeliveryRate: number;
  qualityScore: number;
  lastOrderDate?: string;
}> {
  return apiRequest(`/suppliers/${supplierId}/statistics`);
}
