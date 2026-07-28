/**
 * Manager PIN Service
 * Phase 4 Item 1: Backend-verified hashed PIN for POS void/discount approvals
 */

export interface PinVerifyResult {
  success: boolean;
  error?: string;
  attempts_remaining?: number;
}

export interface PinStatus {
  hasPin: boolean;
  pinSetAt: string | null;
  isLocked: boolean;
  lockedUntil: string | null;
  attempts: number;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api/fb/manager-pin${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export async function verifyManagerPin(pin: string, outletId?: string, context?: string): Promise<PinVerifyResult> {
  return apiRequest<PinVerifyResult>('/verify', {
    method: 'POST',
    body: JSON.stringify({ pin, outlet_id: outletId, context }),
  });
}

export async function setManagerPin(pin: string): Promise<PinVerifyResult> {
  return apiRequest<PinVerifyResult>('/set', {
    method: 'POST',
    body: JSON.stringify({ pin }),
  });
}

export async function resetManagerPin(userId: string): Promise<PinVerifyResult> {
  return apiRequest<PinVerifyResult>('/reset', {
    method: 'POST',
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function getPinStatus(): Promise<PinStatus> {
  return apiRequest<PinStatus>('/status');
}

export async function getPinAuditLog(limit?: number): Promise<any[]> {
  const qs = limit ? `?limit=${limit}` : '';
  return apiRequest<any[]>(`/audit${qs}`);
}
