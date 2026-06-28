/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Returns the local date of a Date object as an ISO YYYY-MM-DD string.
 * Unlike `date.toISOString().split('T')[0]`, this is not affected by UTC
 * timezone shifts, so it always reflects the calendar date in the user's
 * local timezone.
 */
export function toISODate(date: Date = new Date(Date.now() - 86400000)): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Formats a date string or ISO timestamp as a relative time string (e.g., "10m ago", "1h ago").
 */
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
