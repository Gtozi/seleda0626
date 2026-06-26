/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Thin client-side API helpers for report versions, schedules and email dispatch.
 * All calls are best-effort: when the backend/DB is unavailable the callers
 * gracefully fall back to local persistence, so the UI never breaks in dev.
 */

export interface RecordVersionInput {
  reportName: string;
  fileSize?: string;
  status?: 'Draft' | 'Approved' | 'Sent';
}

export interface EmailReportInput {
  reportName: string;
  recipients: string[];
  fileSize?: string;
  summary?: string;
}

export interface EmailReportResult {
  success: boolean;
  dispatched: boolean;
  queuedOnly: boolean;
  recipients: string[];
  message: string;
}

const jsonHeaders = { 'Content-Type': 'application/json' };

/** Record a generated report version in the backend (audit trail). */
export async function recordReportVersion(input: RecordVersionInput): Promise<{ ok: boolean; version?: any }> {
  try {
    const res = await fetch('/api/report-versions', {
      method: 'POST',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, version: data?.version };
  } catch {
    return { ok: false };
  }
}

/** Dispatch a report to a distribution list via the backend. */
export async function emailReport(input: EmailReportInput): Promise<EmailReportResult> {
  try {
    const res = await fetch('/api/reports/email', {
      method: 'POST',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(input),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return {
        success: false,
        dispatched: false,
        queuedOnly: false,
        recipients: input.recipients,
        message: data?.error || 'Email dispatch failed.',
      };
    }
    return {
      success: Boolean(data?.success),
      dispatched: Boolean(data?.dispatched),
      queuedOnly: Boolean(data?.queuedOnly),
      recipients: data?.recipients || input.recipients,
      message: data?.message || 'Dispatch processed.',
    };
  } catch {
    return {
      success: false,
      dispatched: false,
      queuedOnly: true,
      recipients: input.recipients,
      message: 'Backend unreachable; dispatch recorded locally only.',
    };
  }
}

/** Persist a new distribution schedule in the backend. */
export async function createReportSchedule(input: {
  reportName: string;
  frequency: string;
  recipients: string[];
  status?: string;
  nextRun?: string;
}): Promise<{ ok: boolean; schedule?: any }> {
  try {
    const res = await fetch('/api/report-schedules', {
      method: 'POST',
      headers: jsonHeaders,
      credentials: 'include',
      body: JSON.stringify(input),
    });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: true, schedule: data?.schedule };
  } catch {
    return { ok: false };
  }
}
