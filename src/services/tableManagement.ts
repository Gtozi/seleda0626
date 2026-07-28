/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Table Management Service
 * Handles restaurant table operations, reservations, and waitlist management
 */

const API_BASE = '/api/food-beverage';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return data as T;
}

// Types
export interface Table {
  id: string;
  table_number: string;
  seats: number;
  shape: 'round' | 'rectangular' | 'square' | 'oval';
  location_x: number;
  location_y: number;
  section: string;
  outlet_id: string;
  status: 'available' | 'occupied' | 'reserved' | 'dirty' | 'out_of_service';
  current_order_id?: string;
  assigned_server_id?: string;
  turn_start_time?: string;
  average_turn_time: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableReservation {
  id: string;
  table_id: string;
  reservation_id: string;
  guest_name: string;
  party_size: number;
  arrival_time: string;
  duration: number;
  status: 'confirmed' | 'seated' | 'completed' | 'no_show' | 'cancelled';
  special_requests?: string;
  confirmed_by?: string;
  confirmed_at: string;
  seated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WaitlistEntry {
  id: string;
  guest_name: string;
  party_size: number;
  contact_phone?: string;
  estimated_wait_time: number;
  queued_at: string;
  notified: boolean;
  notified_at?: string;
  seated: boolean;
  seated_at?: string;
  table_id?: string;
  cancelled: boolean;
  cancelled_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ServerSection {
  id: string;
  section_name: string;
  server_id: string;
  outlet_id: string;
  table_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableTurnHistory {
  id: string;
  table_id: string;
  order_id?: string;
  party_size?: number;
  turn_start_time: string;
  turn_end_time?: string;
  turn_duration?: number;
  server_id?: string;
  created_at: string;
}

export interface TableStatusSummary {
  status: string;
  count: number;
}

// Table operations
export async function fetchTables(outletId?: string, status?: string): Promise<Table[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outletId', outletId);
  if (status) params.set('status', status);
  return apiRequest<Table[]>(`/tables?${params.toString()}`);
}

export async function createTable(table: Omit<Table, 'id' | 'created_at' | 'updated_at'>): Promise<Table> {
  return apiRequest<Table>('/tables', {
    method: 'POST',
    body: JSON.stringify(table),
  });
}

export async function updateTable(id: string, table: Partial<Table>): Promise<Table> {
  return apiRequest<Table>(`/tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(table),
  });
}

export async function deleteTable(id: string): Promise<void> {
  return apiRequest<void>(`/tables/${id}`, {
    method: 'DELETE',
  });
}

export async function assignTableToOrder(
  tableId: string,
  orderId: string,
  serverId?: string
): Promise<boolean> {
  return apiRequest<boolean>('/tables/assign', {
    method: 'POST',
    body: JSON.stringify({ tableId, orderId, serverId }),
  });
}

export async function releaseTableFromOrder(tableId: string, markDirty: boolean = true): Promise<boolean> {
  return apiRequest<boolean>('/tables/release', {
    method: 'POST',
    body: JSON.stringify({ tableId, markDirty }),
  });
}

export async function markTableClean(tableId: string): Promise<boolean> {
  return apiRequest<boolean>(`/tables/${tableId}/clean`, {
    method: 'PUT',
  });
}

export async function getAvailableTables(
  outletId: string,
  partySize: number,
  section?: string
): Promise<Table[]> {
  const params = new URLSearchParams({ outletId, partySize: partySize.toString() });
  if (section) params.set('section', section);
  return apiRequest<Table[]>(`/tables/available?${params.toString()}`);
}

export async function getTableStatusSummary(outletId: string): Promise<TableStatusSummary[]> {
  return apiRequest<TableStatusSummary[]>(`/tables/summary?outletId=${outletId}`);
}

// Table reservation operations
export async function fetchTableReservations(
  tableId?: string,
  reservationId?: string,
  status?: string
): Promise<TableReservation[]> {
  const params = new URLSearchParams();
  if (tableId) params.set('tableId', tableId);
  if (reservationId) params.set('reservationId', reservationId);
  if (status) params.set('status', status);
  return apiRequest<TableReservation[]>(`/table-reservations?${params.toString()}`);
}

export async function createTableReservation(
  reservation: Omit<TableReservation, 'id' | 'created_at' | 'updated_at'>
): Promise<TableReservation> {
  return apiRequest<TableReservation>('/table-reservations', {
    method: 'POST',
    body: JSON.stringify(reservation),
  });
}

export async function updateTableReservation(
  id: string,
  reservation: Partial<TableReservation>
): Promise<TableReservation> {
  return apiRequest<TableReservation>(`/table-reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(reservation),
  });
}

export async function autoAssignTableFromReservation(reservationId: string): Promise<string> {
  return apiRequest<string>(`/table-reservations/auto-assign/${reservationId}`, {
    method: 'POST',
  });
}

// Waitlist operations
export async function fetchWaitlist(seated?: boolean, cancelled?: boolean): Promise<WaitlistEntry[]> {
  const params = new URLSearchParams();
  if (seated !== undefined) params.set('seated', seated.toString());
  if (cancelled !== undefined) params.set('cancelled', cancelled.toString());
  return apiRequest<WaitlistEntry[]>(`/waitlist?${params.toString()}`);
}

export async function addToWaitlist(
  guestName: string,
  partySize: number,
  contactPhone?: string,
  notes?: string
): Promise<string> {
  return apiRequest<string>('/waitlist', {
    method: 'POST',
    body: JSON.stringify({ guestName, partySize, contactPhone, notes }),
  });
}

export async function updateWaitlistEntry(
  id: string,
  entry: Partial<WaitlistEntry>
): Promise<WaitlistEntry> {
  return apiRequest<WaitlistEntry>(`/waitlist/${id}`, {
    method: 'PUT',
    body: JSON.stringify(entry),
  });
}

export async function seatNextWaitlistGuest(tableId: string, partySize: number): Promise<string | null> {
  return apiRequest<string | null>('/waitlist/seat-next', {
    method: 'POST',
    body: JSON.stringify({ tableId, partySize }),
  });
}

export async function notifyWaitlistGuest(id: string): Promise<boolean> {
  return apiRequest<boolean>(`/waitlist/${id}/notify`, {
    method: 'POST',
  });
}

export async function cancelWaitlistEntry(id: string): Promise<boolean> {
  return apiRequest<boolean>(`/waitlist/${id}/cancel`, {
    method: 'POST',
  });
}

// Server section operations
export async function fetchServerSections(outletId?: string, serverId?: string): Promise<ServerSection[]> {
  const params = new URLSearchParams();
  if (outletId) params.set('outletId', outletId);
  if (serverId) params.set('serverId', serverId);
  return apiRequest<ServerSection[]>(`/server-sections?${params.toString()}`);
}

export async function createServerSection(
  section: Omit<ServerSection, 'id' | 'created_at' | 'updated_at'>
): Promise<ServerSection> {
  return apiRequest<ServerSection>('/server-sections', {
    method: 'POST',
    body: JSON.stringify(section),
  });
}

export async function updateServerSection(
  id: string,
  section: Partial<ServerSection>
): Promise<ServerSection> {
  return apiRequest<ServerSection>(`/server-sections/${id}`, {
    method: 'PUT',
    body: JSON.stringify(section),
  });
}

export async function deleteServerSection(id: string): Promise<void> {
  return apiRequest<void>(`/server-sections/${id}`, {
    method: 'DELETE',
  });
}

// Table turn history operations
export async function fetchTableTurnHistory(
  tableId?: string,
  startDate?: string,
  endDate?: string
): Promise<TableTurnHistory[]> {
  const params = new URLSearchParams();
  if (tableId) params.set('tableId', tableId);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  return apiRequest<TableTurnHistory[]>(`/table-turn-history?${params.toString()}`);
}
