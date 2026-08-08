/**
 * Night Audit Service
 * Client-side wrappers for the front-office night-audit API.
 */

export interface AuditSummary {
  date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  startedAt?: string;
  completedAt?: string;
  totalRooms: number;
  occupiedRooms: number;
  expectedRevenue: number;
  postedRevenue: number;
  variance: number;
  transactions: number;
  checkedIn: number;
  checkedOut: number;
  noShows: number;
  walkIns: number;
}

export interface NightAuditResponse {
  summary: AuditSummary;
  history: AuditSummary[];
}

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const data = await response.json();
    return data?.error || data?.message || fallback;
  } catch {
    return fallback;
  }
}

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

export async function fetchNightAudit(): Promise<NightAuditResponse> {
  const response = await authFetch('/api/front-office/night-audit');
  if (!response.ok) throw new Error(await parseError(response, 'Failed to load night audit'));
  return response.json();
}

export async function runNightAudit(): Promise<AuditSummary> {
  const response = await authFetch('/api/front-office/night-audit/run', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  if (!response.ok) throw new Error(await parseError(response, 'Failed to run night audit'));
  const data = await response.json();
  return data.summary;
}
