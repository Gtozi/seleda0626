/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Sensitive Fields Configuration
 * Defines sensitive fields per endpoint for field-level permission enforcement (Step 3.2)
 */

/**
 * Sensitive field definitions by endpoint
 * These fields require explicit field-level permissions to modify
 */
export const SENSITIVE_FIELDS: Record<string, string[]> = {
  // User management endpoints
  'POST:/api/admin/users': ['role', 'allowedTabs', 'allowedSettings', 'permissionMatrix', 'dataRestrictions'],
  'PATCH:/api/admin/users/:id': ['role', 'allowedTabs', 'allowedSettings', 'permissionMatrix', 'dataRestrictions', 'status'],
  
  // Settings endpoints
  'PATCH:/api/admin/settings': ['taxPercent', 'serviceChargePercent', 'paymentMethods', 'invoiceBankDetails'],
  
  // Reservation endpoints
  'POST:/api/reservations': ['rate', 'totalAmount', 'discountPercent'],
  'PATCH:/api/reservations/:id': ['rate', 'totalAmount', 'discountPercent', 'status'],
  
  // Folio charge endpoints
  'POST:/api/reservations/:id/charges': ['amount', 'description'],
  'PATCH:/api/reservations/:reservationId/charges/:chargeId': ['amount', 'description'],
  
  // Payment endpoints
  'POST:/api/reservations/:id/payments': ['amount', 'method'],
  
  // Room endpoints
  'POST:/api/rooms': ['rate', 'features'],
  'PATCH:/api/rooms/:id': ['rate', 'features'],
  
  // Rate plan endpoints
  'POST:/api/rate-plans': ['baseRate', 'minStay', 'maxStay'],
  'PATCH:/api/rate-plans/:id': ['baseRate', 'minStay', 'maxStay'],
};

/**
 * Check if a field is sensitive for a given endpoint
 */
export function isSensitiveField(endpoint: string, field: string): boolean {
  const sensitiveFields = SENSITIVE_FIELDS[endpoint];
  return sensitiveFields ? sensitiveFields.includes(field) : false;
}

/**
 * Get all sensitive fields for an endpoint
 */
export function getSensitiveFields(endpoint: string): string[] {
  return SENSITIVE_FIELDS[endpoint] || [];
}
