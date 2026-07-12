/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { InventoryItem, Store, Requisition, RequisitionStatus, StockMovement, Supplier } from '../types/inventory';
import { useSystem } from './SystemContext';
import { supabaseService } from '../services/supabaseService';
import { initialInventoryItems, initialInventoryStores } from './initialState';

export interface InventoryContextType {
  inventoryItems: InventoryItem[];
  inventoryStores: Store[];
  inventoryRequisitions: Requisition[];
  stockMovements: StockMovement[];
  suppliers: Supplier[];

  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;
  addInventoryStore: (store: Omit<Store, 'id'>) => void;
  addInventoryRequisition: (req: Omit<Requisition, 'id' | 'number'>) => void;
  updateInventoryRequisitionStatus: (id: string, status: RequisitionStatus, itemsWithIssuedQty?: { itemId: string, issuedQty: number }[]) => void;
  recordStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  refreshData: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error('useInventory must be used within a InventoryProvider');
  return context;
};

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logAudit } = useSystem();
  
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hotel_erp_inventory_items_v2');
      if (saved) return JSON.parse(saved);
    }
    return supabaseService.isConfigured() ? [] : initialInventoryItems;
  });

  const [inventoryStores, setInventoryStores] = useState<Store[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hotel_erp_inventory_stores_v1');
      if (saved) return JSON.parse(saved);
    }
    return supabaseService.isConfigured() ? [] : initialInventoryStores;
  });

  const [inventoryRequisitions, setInventoryRequisitions] = useState<Requisition[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hotel_erp_inventory_requisitions_v1');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hotel_erp_stock_movements_v1');
      if (saved) return JSON.parse(saved);
    }
    return [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('hotel_erp_suppliers_v1');
      if (saved) return JSON.parse(saved);
    }
    return [
      { id: 'S-001', code: 'SUP-001', name: 'Global Foods Ltd', contactPerson: 'Account Manager', phone: '+1 234 567 890', email: 'sales@globalfoods.com', status: 'Active', rating: 4.8 },
      { id: 'S-002', code: 'SUP-002', name: 'Luxe Hospitality Supplies', contactPerson: 'Operations Lead', phone: '+1 987 654 321', email: 'orders@luxesupplies.pro', status: 'Active', rating: 4.5 },
      { id: 'S-003', code: 'SUP-003', name: 'Prime Meats & Poultry', contactPerson: 'Sales Representative', phone: '+1 555 123 456', email: 'sales@primemeats.com', status: 'Active', rating: 4.2 },
      { id: 'S-004', code: 'SUP-004', name: 'Metro Office Solutions', contactPerson: 'Client Services', phone: '+1 444 888 999', email: 'support@metro-office.com', status: 'Inactive', rating: 3.8 },
      { id: 'S-005', code: 'SUP-005', name: 'Technical Maintenance Parts', contactPerson: 'Fleet Supervisor', phone: '+1 222 333 444', email: 'service@techmaintenance.net', status: 'Active', rating: 4.9 }
    ];
  });

  const persistRequisitions = useCallback((reqs: Requisition[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotel_erp_inventory_requisitions_v1', JSON.stringify(reqs));
    }
  }, []);

  const persistStockMovements = useCallback((movements: StockMovement[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotel_erp_stock_movements_v1', JSON.stringify(movements));
    }
  }, []);

  const persistSuppliers = useCallback((sups: Supplier[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hotel_erp_suppliers_v1', JSON.stringify(sups));
    }
  }, []);

  const refreshData = useCallback(async () => {
    if (!supabaseService.isConfigured()) return;
    try {
      const [
        items, stores, reqs, movements, sups
      ] = await Promise.all([
        supabaseService.fetchInventoryItems(),
        supabaseService.fetchInventoryStores(),
        supabaseService.fetchInventoryRequisitions(),
        supabaseService.fetchStockMovements(),
        supabaseService.fetchInventorySuppliers()
      ]);
      setInventoryItems(items);
      localStorage.setItem('hotel_erp_inventory_items_v2', JSON.stringify(items));
      setInventoryStores(stores);
      if (stores.length > 0) {
        localStorage.setItem('hotel_erp_inventory_stores_v1', JSON.stringify(stores));
      }
      if (reqs.length > 0) {
        setInventoryRequisitions(reqs);
        persistRequisitions(reqs);
      }
      if (movements.length > 0) {
        setStockMovements(movements);
        persistStockMovements(movements);
      }
      if (sups.length > 0) {
        setSuppliers(sups);
        persistSuppliers(sups);
      }
    } catch (error) {
      console.error('Failed to fetch inventory Supabase state:', error);
    }
  }, [persistRequisitions, persistStockMovements, persistSuppliers]);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const recordStockMovement = useCallback((movementData: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = { ...movementData, id: `M-${Date.now()}-${Math.floor(Math.random() * 1000)}` };
    setStockMovements(prev => {
      const updated = [...prev, newMovement];
      persistStockMovements(updated);
      if (supabaseService.isConfigured()) supabaseService.upsertStockMovement(newMovement).catch(console.error);
      return updated;
    });
  }, [persistStockMovements]);

  const addInventoryItem = useCallback((itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = { ...itemData, id: `I-${Date.now()}` };
    setInventoryItems(prev => {
      const updated = [...prev, newItem];
      localStorage.setItem('hotel_erp_inventory_items_v2', JSON.stringify(updated));
      return updated;
    });
    if (supabaseService.isConfigured()) supabaseService.upsertInventoryItem(newItem).catch(console.error);
    logAudit(`Added inventory item: ${newItem.name}`);
  }, [logAudit]);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventoryItems(prev => {
      const updated = prev.map(item => item.id === id ? { ...item, ...updates } : item);
      const target = updated.find(item => item.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertInventoryItem(target).catch(console.error);
      localStorage.setItem('hotel_erp_inventory_items_v2', JSON.stringify(updated));
      return updated;
    });
    if (Object.keys(updates).length > 0) logAudit(`Updated inventory item ${id}`);
  }, [logAudit]);

  const deleteInventoryItem = useCallback((id: string) => {
    setInventoryItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('hotel_erp_inventory_items_v2', JSON.stringify(updated));
      return updated;
    });
    if (supabaseService.isConfigured()) supabaseService.deleteInventoryItem(id).catch(console.error);
    logAudit(`Deleted inventory item ${id}`);
  }, [logAudit]);

  const addInventoryStore = useCallback((storeData: Omit<Store, 'id'>) => {
    const newStore = { ...storeData, id: `ST-${Date.now()}` };
    setInventoryStores(prev => [...prev, newStore]);
    if (supabaseService.isConfigured()) supabaseService.upsertInventoryStore(newStore).catch(console.error);
  }, []);

  const addSupplier = useCallback((supplierData: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = { ...supplierData, id: `SUP-${Date.now()}` };
    setSuppliers(prev => {
      const updated = [...prev, newSupplier];
      persistSuppliers(updated);
      return updated;
    });
    if (supabaseService.isConfigured()) supabaseService.upsertInventorySupplier(newSupplier).catch(console.error);
    logAudit(`Added supplier: ${newSupplier.name}`);
  }, [logAudit, persistSuppliers]);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, ...updates } : s);
      const target = updated.find(s => s.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertInventorySupplier(target).catch(console.error);
      persistSuppliers(updated);
      return updated;
    });
    logAudit(`Updated supplier ${id}`);
  }, [logAudit, persistSuppliers]);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => {
      const updated = prev.filter(s => s.id !== id);
      persistSuppliers(updated);
      return updated;
    });
    if (supabaseService.isConfigured()) supabaseService.deleteInventorySupplier(id).catch(console.error);
    logAudit(`Deleted supplier ${id}`);
  }, [logAudit, persistSuppliers]);

  const addInventoryRequisition = useCallback((reqData: Omit<Requisition, 'id' | 'number'>) => {
    const reqId = `REQ-${Date.now()}`;
    setInventoryRequisitions(prev => {
      const counter = (Number(localStorage.getItem('hotel_erp_req_counter') || '0')) + 1;
      localStorage.setItem('hotel_erp_req_counter', String(counter));
      const newReq: Requisition = { ...reqData, id: reqId, number: `REQ-${String(counter).padStart(4, '0')}` };
      const updated = [...prev, newReq];
      persistRequisitions(updated);
      if (supabaseService.isConfigured()) supabaseService.upsertInventoryRequisition(newReq).catch(console.error);
      return updated;
    });
  }, [persistRequisitions]);

  const updateInventoryRequisitionStatus = useCallback((id: string, status: RequisitionStatus, itemsWithIssuedQty?: { itemId: string, issuedQty: number }[]) => {
    // Snapshot the requisition before async state updates
    const reqSnapshot = inventoryRequisitions.find(r => r.id === id);

    // Update requisition status first
    setInventoryRequisitions(prev => {
      const updated = prev.map(req => {
        if (req.id !== id) return req;
        const updatedReq = { ...req, status };
        if (status === 'Issued' && itemsWithIssuedQty && itemsWithIssuedQty.length > 0) {
          const issuedMap = new Map(itemsWithIssuedQty.map(i => [i.itemId, i.issuedQty]));
          updatedReq.items = req.items.map(item => ({
            ...item,
            issuedQty: issuedMap.get(item.itemId) ?? item.issuedQty
          }));
        }
        return updatedReq;
      });
      persistRequisitions(updated);
      // Sync updated requisition to Supabase
      const target = updated.find(r => r.id === id);
      if (target && supabaseService.isConfigured()) supabaseService.upsertInventoryRequisition(target).catch(console.error);
      return updated;
    });

    // When issuing, decrement stock and record movements
    if (status === 'Issued' && itemsWithIssuedQty && itemsWithIssuedQty.length > 0) {
      setInventoryItems(prevItems => {
        const updatedItems = prevItems.map(invItem => {
          const issuedQty = itemsWithIssuedQty.find(i => i.itemId === invItem.id || i.itemId === invItem.code)?.issuedQty;
          if (issuedQty !== undefined && issuedQty > 0) {
            return { ...invItem, currentStock: Math.max(0, invItem.currentStock - issuedQty) };
          }
          return invItem;
        });
        localStorage.setItem('hotel_erp_inventory_items_v2', JSON.stringify(updatedItems));

        // Sync affected items to Supabase
        if (supabaseService.isConfigured()) {
          itemsWithIssuedQty.forEach(({ itemId }) => {
            const item = updatedItems.find(i => i.id === itemId || i.code === itemId);
            if (item) supabaseService.upsertInventoryItem(item).catch(console.error);
          });
        }
        return updatedItems;
      });

      // Record stock movements using a snapshot lookup
      itemsWithIssuedQty.forEach(({ itemId, issuedQty }) => {
        if (issuedQty > 0) {
          const item = inventoryItems.find(i => i.id === itemId || i.code === itemId);
          if (item) {
            recordStockMovement({
              date: new Date().toISOString(),
              itemId: item.id,
              itemName: item.name,
              type: 'Issue',
              quantity: -issuedQty,
              cost: item.avgCost,
              reference: id,
              user: 'System',
              storeFrom: item.location
            });
          }
        }
      });

      logAudit(`Issued requisition ${id} for ${itemsWithIssuedQty.length} items`);
    }

    // When receiving, add stock to destination store and record transfer
    if (status === 'Received' && reqSnapshot) {
      const dept = reqSnapshot.department;
      // Map department name to destination store
      const destStore = inventoryStores.find(s =>
        s.name.toLowerCase() === dept.toLowerCase() ||
        dept.toLowerCase().includes(s.name.toLowerCase().split(' ')[0]) ||
        s.name.toLowerCase().includes(dept.toLowerCase().split(' ')[0])
      ) || inventoryStores.find(s =>
        (dept.toLowerCase().includes('gift') && s.id === 'ST-GIFT') ||
        (dept.toLowerCase().includes('office') && s.id === 'ST-OFC') ||
        (dept.toLowerCase().includes('bar') && s.id === 'ST-BAR') ||
        (dept.toLowerCase().includes('restaurant') && s.id === 'ST-REST') ||
        (dept.toLowerCase().includes('housekeeping') && s.id === 'ST-HK') ||
        (dept.toLowerCase().includes('engineering') && s.id === 'ST-ENG')
      );

      if (destStore) {
        setInventoryItems(prevItems => {
          let updatedItems = [...prevItems];

          reqSnapshot.items.forEach(reqItem => {
            const issuedQty = reqItem.issuedQty ?? reqItem.requestedQty;
            if (issuedQty <= 0) return;

            const sourceItem = prevItems.find(i => i.id === reqItem.itemId || i.code === reqItem.itemId);
            if (!sourceItem) return;

            // Look for existing item at destination with same name
            const destItemIndex = updatedItems.findIndex(i =>
              i.storeId === destStore.id &&
              i.name.toLowerCase() === sourceItem.name.toLowerCase()
            );

            if (destItemIndex >= 0) {
              // Increment existing destination item stock
              updatedItems[destItemIndex] = {
                ...updatedItems[destItemIndex],
                currentStock: updatedItems[destItemIndex].currentStock + issuedQty
              };
            } else {
              // Create new item record at destination
              const newItem: InventoryItem = {
                ...sourceItem,
                id: `${destStore.id}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                code: sourceItem.code,
                currentStock: issuedQty,
                location: destStore.name,
                storeId: destStore.id
              };
              updatedItems = [...updatedItems, newItem];
            }

            // Record transfer movement
            recordStockMovement({
              date: new Date().toISOString(),
              itemId: sourceItem.id,
              itemName: sourceItem.name,
              type: 'Transfer',
              quantity: issuedQty,
              cost: sourceItem.avgCost,
              reference: id,
              user: 'System',
              storeFrom: sourceItem.location,
              storeTo: destStore.name
            });
          });

          localStorage.setItem('hotel_erp_inventory_items_v2', JSON.stringify(updatedItems));

          // Sync new/updated items to Supabase
          if (supabaseService.isConfigured()) {
            updatedItems.forEach(item => {
              supabaseService.upsertInventoryItem(item).catch(console.error);
            });
          }

          return updatedItems;
        });

        logAudit(`Received requisition ${id} at ${destStore.name}`);
      }
    }
  }, [inventoryItems, inventoryRequisitions, inventoryStores, recordStockMovement, logAudit, persistRequisitions]);

  const value = {
    inventoryItems, inventoryStores, inventoryRequisitions, stockMovements, suppliers,
    addInventoryItem, updateInventoryItem, deleteInventoryItem,
    addInventoryStore, addInventoryRequisition, updateInventoryRequisitionStatus,
    recordStockMovement, addSupplier, updateSupplier, deleteSupplier,
    refreshData
  };

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
};
