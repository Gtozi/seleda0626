/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * FEFO (First Expired First Out) Inventory Tracking
 * Manages expiry tracking and ensures FIFO/FEFO inventory rotation
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
export interface ExpiryTracking {
  ingredientId: string;
  ingredientName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitOfMeasure: string;
  receivedDate: string;
  daysUntilExpiry: number;
  status: 'fresh' | 'approaching' | 'critical' | 'expired';
  recommendedAction: 'use_first' | 'discount' | 'dispose';
  location?: string;
  supplierId?: string;
}

export interface BatchInventory {
  ingredientId: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
  receivedDate: string;
  unitCost: number;
  location: string;
  status: 'available' | 'allocated' | 'expired' | 'disposed';
}

export interface ExpiryAlert {
  ingredientId: string;
  ingredientName: string;
  totalQuantity: number;
  expiringSoonQuantity: number;
  expiredQuantity: number;
  estimatedLoss: number;
  recommendedActions: Array<{
    action: string;
    quantity: number;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface InventoryRotation {
  ingredientId: string;
  currentBatch: string;
  nextBatch: string;
  rotationDate: string;
  quantityToRotate: number;
  reason: string;
}

// Expiry Tracking Operations
export async function fetchExpiryTracking(
  ingredientId?: string,
  status?: string,
  daysUntilExpiry?: number
): Promise<ExpiryTracking[]> {
  const params = new URLSearchParams();
  if (ingredientId) params.append('ingredientId', ingredientId);
  if (status) params.append('status', status);
  if (daysUntilExpiry) params.append('daysUntilExpiry', daysUntilExpiry.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<ExpiryTracking[]>(`/fefo/expiry-tracking${queryString}`);
}

export async function getExpiringSoon(days: number = 7): Promise<ExpiryTracking[]> {
  return apiRequest<ExpiryTracking[]>(`/fefo/expiring-soon?days=${days}`);
}

export async function getExpiredItems(): Promise<ExpiryTracking[]> {
  return apiRequest<ExpiryTracking[]>('/fefo/expired-items');
}

export async function recordBatchReceipt(
  ingredientId: string,
  batchNumber: string,
  quantity: number,
  expiryDate: string,
  unitCost: number,
  location: string,
  supplierId?: string
): Promise<BatchInventory> {
  return apiRequest<BatchInventory>('/fefo/batch-receipt', {
    method: 'POST',
    body: JSON.stringify({
      ingredientId,
      batchNumber,
      quantity,
      expiryDate,
      unitCost,
      location,
      supplierId,
    }),
  });
}

export async function updateBatchQuantity(
  batchId: string,
  quantity: number,
  reason: string
): Promise<BatchInventory> {
  return apiRequest<BatchInventory>(`/fefo/batches/${batchId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity, reason }),
  });
}

// FEFO Selection Operations
export async function selectBatchForConsumption(
  ingredientId: string,
  quantity: number
): Promise<{
  batches: Array<{ batchNumber: string; quantity: number; expiryDate: string }>;
  remainingQuantity: number;
}> {
  return apiRequest(`/fefo/select-batch/${ingredientId}`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  });
}

export async function recordConsumption(
  ingredientId: string,
  quantity: number,
  reason: string,
  orderId?: string
): Promise<void> {
  await apiRequest('/fefo/consume', {
    method: 'POST',
    body: JSON.stringify({ ingredientId, quantity, reason, orderId }),
  });
}

// Expiry Alerts Management
export async function getExpiryAlerts(): Promise<ExpiryAlert[]> {
  return apiRequest<ExpiryAlert[]>('/fefo/expiry-alerts');
}

export async function dismissExpiryAlert(
  ingredientId: string,
  batchNumber: string
): Promise<void> {
  await apiRequest(`/fefo/alerts/${ingredientId}/${batchNumber}`, {
    method: 'DELETE',
  });
}

// Inventory Rotation
export async function getRotationSchedule(): Promise<InventoryRotation[]> {
  return apiRequest<InventoryRotation[]>('/fefo/rotation-schedule');
}

export async function scheduleRotation(
  ingredientId: string,
  quantity: number,
  reason: string
): Promise<InventoryRotation> {
  return apiRequest<InventoryRotation>('/fefo/schedule-rotation', {
    method: 'POST',
    body: JSON.stringify({ ingredientId, quantity, reason }),
  });
}

// Disposal Management
export async function recordDisposal(
  ingredientId: string,
  batchNumber: string,
  quantity: number,
  reason: string,
  disposedBy: string
): Promise<void> {
  await apiRequest('/fefo/dispose', {
    method: 'POST',
    body: JSON.stringify({
      ingredientId,
      batchNumber,
      quantity,
      reason,
      disposedBy,
    }),
  });
}

export async function getDisposalHistory(
  startDate?: string,
  endDate?: string
): Promise<Array<{
  ingredientId: string;
  batchNumber: string;
  quantity: number;
  reason: string;
  disposedAt: string;
  estimatedLoss: number;
}>> {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest(`/fefo/disposal-history${queryString}`);
}

// FEFO Engine
export class FEFOEngine {
  /**
   * Calculate days until expiry
   */
  static calculateDaysUntilExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Determine expiry status
   */
  static determineExpiryStatus(daysUntilExpiry: number): 'fresh' | 'approaching' | 'critical' | 'expired' {
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 3) return 'critical';
    if (daysUntilExpiry <= 14) return 'approaching';
    return 'fresh';
  }

  /**
   * Determine recommended action
   */
  static determineRecommendedAction(
    daysUntilExpiry: number,
    quantity: number,
    averageDailyUsage: number = 1
  ): 'use_first' | 'discount' | 'dispose' {
    if (daysUntilExpiry < 0) return 'dispose';
    if (daysUntilExpiry <= 3) {
      // If quantity can be used before expiry, use it
      if (quantity <= daysUntilExpiry * averageDailyUsage) {
        return 'use_first';
      }
      return 'discount';
    }
    if (daysUntilExpiry <= 14) return 'use_first';
    return 'use_first';
  }

  /**
   * Select batches for consumption using FEFO
   */
  static selectBatchesFEFO(
    batches: BatchInventory[],
    requiredQuantity: number
  ): Array<{ batch: BatchInventory; quantity: number }> {
    // Sort by expiry date (earliest first)
    const sortedBatches = [...batches].sort(
      (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
    );

    const selectedBatches: Array<{ batch: BatchInventory; quantity: number }> = [];
    let remainingQuantity = requiredQuantity;

    for (const batch of sortedBatches) {
      if (remainingQuantity <= 0) break;
      if (batch.status !== 'available') continue;

      const quantityToTake = Math.min(batch.quantity, remainingQuantity);
      selectedBatches.push({ batch, quantity: quantityToTake });
      remainingQuantity -= quantityToTake;
    }

    return selectedBatches;
  }

  /**
   * Calculate estimated loss from expired items
   */
  static calculateEstimatedLoss(
    quantity: number,
    unitCost: number
  ): number {
    return quantity * unitCost;
  }

  /**
   * Calculate expiry alert priority
   */
  static calculateAlertPriority(daysUntilExpiry: number, quantity: number): 'high' | 'medium' | 'low' {
    if (daysUntilExpiry < 0) return 'high';
    if (daysUntilExpiry <= 3 && quantity > 10) return 'high';
    if (daysUntilExpiry <= 7) return 'medium';
    return 'low';
  }

  /**
   * Generate rotation recommendations
   */
  static generateRotationRecommendations(
    batches: BatchInventory[]
  ): InventoryRotation[] {
    const recommendations: InventoryRotation[] = [];
    const today = new Date();

    // Group by ingredient
    const byIngredient = new Map<string, BatchInventory[]>();
    for (const batch of batches) {
      if (!byIngredient.has(batch.ingredientId)) {
        byIngredient.set(batch.ingredientId, []);
      }
      byIngredient.get(batch.ingredientId)!.push(batch);
    }

    // Analyze each ingredient's batches
    for (const [ingredientId, ingredientBatches] of byIngredient.entries()) {
      const sortedBatches = ingredientBatches.sort(
        (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
      );

      // Check if older batches have more quantity than newer ones
      for (let i = 0; i < sortedBatches.length - 1; i++) {
        const currentBatch = sortedBatches[i];
        const nextBatch = sortedBatches[i + 1];

        if (currentBatch.quantity > nextBatch.quantity * 1.5) {
          const daysUntilExpiry = this.calculateDaysUntilExpiry(currentBatch.expiryDate);
          if (daysUntilExpiry > 0 && daysUntilExpiry <= 30) {
            recommendations.push({
              ingredientId,
              currentBatch: currentBatch.batchNumber,
              nextBatch: nextBatch.batchNumber,
              rotationDate: today.toISOString(),
              quantityToRotate: Math.floor((currentBatch.quantity - nextBatch.quantity) / 2),
              reason: 'Older batch has significantly more quantity than newer batch',
            });
          }
        }
      }
    }

    return recommendations;
  }

  /**
   * Calculate waste percentage
   */
  static calculateWastePercentage(
    disposedQuantity: number,
    totalReceivedQuantity: number
  ): number {
    if (totalReceivedQuantity === 0) return 0;
    return (disposedQuantity / totalReceivedQuantity) * 100;
  }

  /**
   * Analyze expiry patterns
   */
  static analyzeExpiryPatterns(
    disposalHistory: Array<{
      ingredientId: string;
      disposedAt: string;
      quantity: number;
    }>
  ): Map<string, { averageDaysBeforeExpiry: number; totalDisposed: number }> {
    const patterns = new Map<string, { sum: number; count: number; totalDisposed: number }>();

    for (const disposal of disposalHistory) {
      if (!patterns.has(disposal.ingredientId)) {
        patterns.set(disposal.ingredientId, { sum: 0, count: 0, totalDisposed: 0 });
      }
      const pattern = patterns.get(disposal.ingredientId)!;
      // This would need actual expiry data to calculate days before expiry
      pattern.totalDisposed += disposal.quantity;
    }

    const result = new Map<string, { averageDaysBeforeExpiry: number; totalDisposed: number }>();
    for (const [ingredientId, data] of patterns.entries()) {
      result.set(ingredientId, {
        averageDaysBeforeExpiry: data.count > 0 ? data.sum / data.count : 0,
        totalDisposed: data.totalDisposed,
      });
    }

    return result;
  }
}

// Export singleton instance
export const fefoEngine = FEFOEngine;
