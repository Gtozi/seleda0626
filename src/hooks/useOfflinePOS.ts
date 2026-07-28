/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Offline POS Hook
 * Provides offline functionality for POS modules
 * Handles offline detection, order queueing, and sync status
 */

import { useState, useEffect, useCallback } from 'react';
import { offlinePOSDatabase, OfflinePOSOrder } from '../services/offlinePOSDatabase';
import { offlineSyncManager, SyncResult } from '../services/offlineSyncManager';

interface UseOfflinePOSReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingOrdersCount: number;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime?: string;
  syncError?: string;
  
  // Actions
  syncNow: () => Promise<SyncResult>;
  storeOrderOffline: (order: any, lines: any[]) => Promise<string>;
  checkConnectivity: () => boolean;
  
  // Inventory
  cacheInventory: (ingredients: Array<{ id: string; quantity: number }>) => Promise<void>;
  getCachedInventory: (ingredientId: string) => Promise<number | null>;
  updateCachedInventory: (ingredientId: string, quantity: number) => Promise<void>;
}

export function useOfflinePOS(): UseOfflinePOSReturn {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | undefined>();
  const [syncError, setSyncError] = useState<string | undefined>();

  // Initialize offline database
  useEffect(() => {
    offlinePOSDatabase.initialize();
    offlineSyncManager.setupAutoSync();
    
    // Load initial sync status
    loadSyncStatus();
  }, []);

  // Monitor connectivity
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('idle');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Periodically update pending orders count
  useEffect(() => {
    const updatePendingCount = async () => {
      const count = await offlineSyncManager.getPendingOrdersCount();
      setPendingOrdersCount(count);
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadSyncStatus = async () => {
    try {
      const status = await offlineSyncManager.getSyncStatus();
      setLastSyncTime(status.lastSyncTime);
    } catch (error) {
      console.error('Failed to load sync status:', error);
    }
  };

  const syncNow = useCallback(async (): Promise<SyncResult> => {
    if (!isOnline) {
      setSyncError('Cannot sync while offline');
      setSyncStatus('error');
      return {
        success: false,
        processed: 0,
        failed: 0,
        conflicts: 0,
        errors: ['Cannot sync while offline'],
      };
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncError(undefined);

    try {
      const result = await offlineSyncManager.sync((progress) => {
        console.log(`Sync progress: ${progress.processed}/${progress.total} - ${progress.currentOperation}`);
      });

      if (result.success) {
        setSyncStatus('success');
        setLastSyncTime(new Date().toISOString());
        setPendingOrdersCount(0);
      } else {
        setSyncStatus('error');
        setSyncError(result.errors.join(', '));
      }

      // Update pending count
      const newCount = await offlineSyncManager.getPendingOrdersCount();
      setPendingOrdersCount(newCount);

      return result;
    } catch (error) {
      setSyncStatus('error');
      setSyncError(String(error));
      return {
        success: false,
        processed: 0,
        failed: 0,
        conflicts: 0,
        errors: [String(error)],
      };
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline]);

  const storeOrderOffline = useCallback(async (order: any, lines: any[]): Promise<string> => {
    try {
      const orderId = await offlinePOSDatabase.storeOfflineOrder(order, lines);
      
      // Update pending count
      const newCount = await offlineSyncManager.getPendingOrdersCount();
      setPendingOrdersCount(newCount);
      
      return orderId;
    } catch (error) {
      console.error('Failed to store order offline:', error);
      throw error;
    }
  }, []);

  const checkConnectivity = useCallback((): boolean => {
    return navigator.onLine;
  }, []);

  const cacheInventory = useCallback(async (ingredients: Array<{ id: string; quantity: number }>) => {
    try {
      await offlinePOSDatabase.cacheInventory(ingredients);
    } catch (error) {
      console.error('Failed to cache inventory:', error);
      throw error;
    }
  }, []);

  const getCachedInventory = useCallback(async (ingredientId: string): Promise<number | null> => {
    try {
      return await offlinePOSDatabase.getCachedInventory(ingredientId);
    } catch (error) {
      console.error('Failed to get cached inventory:', error);
      return null;
    }
  }, []);

  const updateCachedInventory = useCallback(async (ingredientId: string, quantity: number) => {
    try {
      await offlinePOSDatabase.updateCachedInventory(ingredientId, quantity);
    } catch (error) {
      console.error('Failed to update cached inventory:', error);
      throw error;
    }
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingOrdersCount,
    syncStatus,
    lastSyncTime,
    syncError,
    syncNow,
    storeOrderOffline,
    checkConnectivity,
    cacheInventory,
    getCachedInventory,
    updateCachedInventory,
  };
}
