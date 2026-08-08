/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Key & Access Service
 * Client-side wrappers for the /api/keys endpoints.
 *
 * Handles key encoding, key tracking, encoder management, and access logs
 * for the front office Keys & Access portal.
 */

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export type KeyStatus = 'active' | 'lost' | 'damaged' | 'returned' | 'master';
export type AccessLevel = 'guest' | 'staff' | 'master' | 'service' | 'emergency';
export type KeyType = 'physical' | 'digital' | 'nfc' | 'mobile';
export type EncoderStatus = 'online' | 'offline' | 'maintenance';

export interface KeyRecord {
  id: string;
  guestName?: string | null;
  reservationId?: string | null;
  roomNumber?: string | null;
  staffName?: string | null;
  staffRole?: string | null;
  keyCode: string;
  keyType: KeyType;
  accessLevel: AccessLevel;
  status: KeyStatus;
  issuedAt: string;
  returnedAt?: string | null;
  expiresAt: string;
  issuedBy: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface KeyEncoder {
  id: string;
  name: string;
  location: string;
  status: EncoderStatus;
  lastUsed: string;
  encodingsToday: number;
  createdAt: string;
  updatedAt: string;
}

export interface AccessLogEntry {
  id: string;
  time: string;
  room: string;
  keyCode: string;
  event: 'access_granted' | 'access_denied' | 'elevator_access' | 'door_unlocked';
  device: string;
  createdAt: string;
}

export interface EncodeKeyPayload {
  guestName?: string;
  reservationId?: string;
  roomNumber?: string;
  keyType: KeyType;
  accessLevel: AccessLevel;
  expiresAt: string;
  notes?: string;
  encoderId?: string;
}

export interface ReturnKeyPayload {
  notes?: string;
}

export interface UpdateKeyPayload {
  guestName?: string;
  reservationId?: string;
  roomNumber?: string;
  keyType?: KeyType;
  accessLevel?: AccessLevel;
  expiresAt?: string;
  notes?: string;
}

export interface KeyStats {
  activeKeys: number;
  dueOutToday: number;
  lostDamaged: number;
  onlineEncoders: number;
}

// ----------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------

function authFetch(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
}

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
}

function mapKeyRecord(row: any): KeyRecord {
  return {
    id: String(row.id ?? ''),
    guestName: row.guest_name ? String(row.guest_name) : null,
    reservationId: row.reservation_id ? String(row.reservation_id) : null,
    roomNumber: row.room_number ? String(row.room_number) : null,
    staffName: row.staff_name ? String(row.staff_name) : null,
    staffRole: row.staff_role ? String(row.staff_role) : null,
    keyCode: String(row.key_code ?? ''),
    keyType: String(row.key_type ?? 'physical') as KeyType,
    accessLevel: String(row.access_level ?? 'guest') as AccessLevel,
    status: String(row.status ?? 'active') as KeyStatus,
    issuedAt: String(row.issued_at ?? ''),
    returnedAt: row.returned_at ? String(row.returned_at) : null,
    expiresAt: String(row.expires_at ?? ''),
    issuedBy: String(row.issued_by ?? ''),
    notes: String(row.notes ?? ''),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function mapEncoder(row: any): KeyEncoder {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    location: String(row.location ?? ''),
    status: String(row.status ?? 'offline') as EncoderStatus,
    lastUsed: String(row.last_used ?? ''),
    encodingsToday: Number(row.encodings_today ?? 0),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function mapAccessLog(row: any): AccessLogEntry {
  return {
    id: String(row.id ?? ''),
    time: String(row.time ?? ''),
    room: String(row.room ?? ''),
    keyCode: String(row.key_code ?? ''),
    event: String(row.event ?? 'access_granted') as AccessLogEntry['event'],
    device: String(row.device ?? ''),
    createdAt: String(row.created_at ?? ''),
  };
}

// ----------------------------------------------------------------
// API wrappers
// ----------------------------------------------------------------

/**
 * Fetch key records, optionally filtered by status, access level, or search query.
 */
export async function fetchKeys(params?: {
  status?: KeyStatus;
  accessLevel?: AccessLevel;
  search?: string;
}): Promise<KeyRecord[]> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.accessLevel) queryParams.append('accessLevel', params.accessLevel);
  if (params?.search) queryParams.append('search', params.search);
  const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const response = await authFetch(`/api/front-office/keys${qs}`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch keys'));
  const data = await response.json();
  return (data.keys || []).map(mapKeyRecord);
}

/**
 * Fetch a single key record by ID.
 */
export async function fetchKeyById(keyId: string): Promise<KeyRecord> {
  const response = await authFetch(`/api/front-office/keys/${encodeURIComponent(keyId)}`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch key'));
  const data = await response.json();
  return mapKeyRecord(data.key);
}

/**
 * Encode and create a new key record.
 */
export async function encodeKey(payload: EncodeKeyPayload): Promise<KeyRecord> {
  const response = await authFetch('/api/front-office/keys', {
    method: 'POST',
    body: JSON.stringify({
      guestName: payload.guestName,
      reservationId: payload.reservationId,
      roomNumber: payload.roomNumber,
      keyType: payload.keyType,
      accessLevel: payload.accessLevel,
      expiresAt: payload.expiresAt,
      notes: payload.notes,
      encoderId: payload.encoderId,
    }),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to encode key'));
  const data = await response.json();
  return mapKeyRecord(data.key);
}

/**
 * Update an existing key record.
 */
export async function updateKey(keyId: string, payload: UpdateKeyPayload): Promise<KeyRecord> {
  const response = await authFetch(`/api/front-office/keys/${encodeURIComponent(keyId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to update key'));
  const data = await response.json();
  return mapKeyRecord(data.key);
}

/**
 * Mark a key as returned/deactivated.
 */
export async function returnKey(keyId: string, payload: ReturnKeyPayload = {}): Promise<KeyRecord> {
  const response = await authFetch(`/api/front-office/keys/${encodeURIComponent(keyId)}/return`, {
    method: 'PATCH',
    body: JSON.stringify({
      notes: payload.notes,
    }),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to return key'));
  const data = await response.json();
  return mapKeyRecord(data.key);
}

/**
 * Delete a key record (admin only).
 */
export async function deleteKey(keyId: string): Promise<void> {
  const response = await authFetch(`/api/front-office/keys/${encodeURIComponent(keyId)}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to delete key'));
}

/**
 * Fetch all key encoders.
 */
export async function fetchEncoders(): Promise<KeyEncoder[]> {
  const response = await authFetch('/api/front-office/keys/encoders');
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch encoders'));
  const data = await response.json();
  return (data.encoders || []).map(mapEncoder);
}

/**
 * Fetch access logs, optionally filtered by date range or key code.
 */
export async function fetchAccessLogs(params?: {
  startDate?: string;
  endDate?: string;
  keyCode?: string;
  limit?: number;
}): Promise<AccessLogEntry[]> {
  const queryParams = new URLSearchParams();
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.keyCode) queryParams.append('keyCode', params.keyCode);
  if (params?.limit) queryParams.append('limit', String(params.limit));
  const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

  const response = await authFetch(`/api/front-office/keys/access-logs${qs}`);
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch access logs'));
  const data = await response.json();
  return (data.logs || []).map(mapAccessLog);
}

/**
 * Fetch aggregated key statistics.
 */
export async function fetchKeyStats(): Promise<KeyStats> {
  const response = await authFetch('/api/front-office/keys/stats');
  if (!response.ok) throw new Error(await parseError(response, 'Failed to fetch key stats'));
  const data = await response.json();
  return {
    activeKeys: Number(data.activeKeys ?? 0),
    dueOutToday: Number(data.dueOutToday ?? 0),
    lostDamaged: Number(data.lostDamaged ?? 0),
    onlineEncoders: Number(data.onlineEncoders ?? 0),
  };
}

/**
 * Print a key card (generates print job).
 */
export async function printKeyCard(keyId: string): Promise<{ jobId: string }> {
  const response = await authFetch(`/api/front-office/keys/${encodeURIComponent(keyId)}/print`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to print key card'));
  return response.json();
}