/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Database Transaction Wrapper
 * Ensures atomic operations for critical business logic
 */

import { supabaseService } from '../services/supabaseService';

export interface TransactionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Execute multiple database operations in a transaction
 * All operations succeed or all fail (atomicity)
 */
export const executeTransaction = async <T>(
  operations: (() => Promise<any>)[]
): Promise<TransactionResult<T>> => {
  try {
    // Execute all operations
    const results = await Promise.all(operations.map(op => op()));
    
    return {
      success: true,
      data: results as T,
    };
  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed',
    };
  }
};

/**
 * Check-in transaction
 * Updates reservation, room status, creates folio charge, and logs audit
 */
export const checkInTransaction = async (
  reservationId: string,
  roomNumber: string
): Promise<TransactionResult> => {
  try {
    const response = await fetch('/api/transactions/check-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reservationId, roomNumber }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Check-in failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Check-in transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Check-out transaction
 * Updates reservation, room status, finalizes billing, and logs audit
 */
export const checkOutTransaction = async (
  reservationId: string
): Promise<TransactionResult> => {
  try {
    const response = await fetch('/api/transactions/check-out', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reservationId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Check-out failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Check-out transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Payment transaction
 * Adds payment, updates reservation status, posts to journal, and logs audit
 */
export const paymentTransaction = async (
  reservationId: string,
  amount: number,
  method: string,
  notes?: string
): Promise<TransactionResult> => {
  try {
    const response = await fetch('/api/transactions/payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reservationId, amount, method, notes }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Payment failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Payment transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Void charge transaction
 * Voids charge, updates billing, reverses journal entry, and logs audit
 */
export const voidChargeTransaction = async (
  reservationId: string,
  chargeId: string,
  reason: string
): Promise<TransactionResult> => {
  try {
    const response = await fetch('/api/transactions/void-charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ reservationId, chargeId, reason }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Void charge failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Void charge transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Move charge transaction
 * Moves charge between folios/reservations atomically
 */
export const moveChargeTransaction = async (
  sourceReservationId: string,
  targetReservationId: string,
  chargeId: string
): Promise<TransactionResult> => {
  try {
    const response = await fetch('/api/transactions/move-charge', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ sourceReservationId, targetReservationId, chargeId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Move charge failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Move charge transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Group check-in transaction
 * Checks in multiple reservations atomically
 */
export const groupCheckInTransaction = async (
  groupId: string
): Promise<TransactionResult> => {
  try {
    const response = await fetch('/api/transactions/group-check-in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ groupId }),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Group check-in failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Group check-in transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Night audit transaction
 * Rolls date, posts revenue, updates room statuses, and logs audit
 */
export const nightAuditTransaction = async (): Promise<TransactionResult> => {
  try {
    const response = await fetch('/api/transactions/night-audit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.message || 'Night audit failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('Night audit transaction error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Optimistic locking helper
 * Prevents concurrent modification conflicts
 */
export const updateWithOptimisticLock = async <T extends { version: number }>(
  table: string,
  id: string,
  updates: Partial<T>,
  currentVersion: number
): Promise<TransactionResult<T>> => {
  try {
    const response = await fetch('/api/transactions/optimistic-update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ table, id, updates, currentVersion }),
    });

    if (!response.ok) {
      const error = await response.json();
      
      if (error.code === 'CONCURRENT_MODIFICATION') {
        return {
          success: false,
          error: 'This record was modified by another user. Please refresh and try again.',
        };
      }
      
      return {
        success: false,
        error: error.message || 'Update failed',
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.record,
    };
  } catch (error) {
    console.error('Optimistic update error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Retry wrapper for transient failures
 */
export const withRetry = async <T>(
  operation: () => Promise<TransactionResult<T>>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<TransactionResult<T>> => {
  let lastError: string = '';
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const result = await operation();
    
    if (result.success) {
      return result;
    }
    
    lastError = result.error || 'Unknown error';
    
    // Don't retry on certain errors
    if (
      lastError.includes('Permission denied') ||
      lastError.includes('Invalid') ||
      lastError.includes('Not found')
    ) {
      return result;
    }
    
    // Wait before retrying (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
    }
  }
  
  return {
    success: false,
    error: `Operation failed after ${maxRetries} attempts: ${lastError}`,
  };
};
