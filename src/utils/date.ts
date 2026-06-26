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
