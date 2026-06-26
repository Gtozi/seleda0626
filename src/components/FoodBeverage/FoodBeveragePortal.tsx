/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useState } from 'react';
import { 
  Utensils, 
  LayoutGrid, 
  ClipboardList, 
  Receipt, 
  BookOpen, 
  CalendarDays, 
  ChefHat, 
  BarChart3,
  Search,
  Bell,
  Printer,
  X,
  CreditCard,
  Plus,
  Table as TableIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  ArrowRightLeft,
  Coffee,
  Warehouse
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

import POSModule from './POSModule';
import BarPOSModule from './BarPOSModule';
import RoomServiceModule from './RoomServiceModule';
import BanquetModule from './BanquetModule';
import KitchenDisplayModule from './KitchenDisplayModule';
import FBDashboard from './FBDashboard';
import GuestMealModule from './GuestMealModule';
import MenuManagementModule from './MenuManagementModule';
import InventoryModule from './InventoryModule';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';

// Types for F&B
export type MealPeriod = 'Breakfast' | 'Lunch' | 'Dinner' | 'Brunch' | 'Tea Time' | 'Morning Snack' | 'Afternoon Snack';
export type MealPlanType = 
  | 'Room Only'
  | 'Bed & Breakfast' 
  | 'Half Board' 
  | 'Full Board' 
  | 'Conference Package' 
  | 'Corporate Package' 
  | 'Group Package'
  | 'Custom Package';

export type CustomerType = 'In-House Guest' | 'Walk-In Guest' | 'Corporate Client' | 'Conference Group' | 'Tour Group';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
  mealPeriods: MealPeriod[];
  isFixedMenu: boolean;
  image?: string;
  recipe?: {
    ingredients: { itemId: string, name: string, quantity: number, unit: string }[];
    yield: number;
  };
}

export interface FBOrder {
  id: string;
  source: 'POS' | 'Room Service' | 'Event' | 'Fixed Meal';
  customerType: CustomerType;
  tableId?: string;
  roomNumber?: string;
  guestName: string;
  items: { menuItemId: string, quantity: number, name: string, price: number }[];
  status: 'Pending' | 'In Progress' | 'Ready' | 'Delivered' | 'Paid' | 'Delivered and Charged' | 'Cancelled';
  timestamp: string;
  total: number;
  reservationId?: string;
  isComplimentary?: boolean;
  mealPeriod?: MealPeriod;
}

export interface Table {
  id: string;
  seats: number;
  status: 'Available' | 'Occupied' | 'Reserved' | 'Dirty' | 'Closed';
  currentOrderId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Consumable' | 'Fixed Asset';
  stockCategory: 'Food' | 'Beverage' | 'Spice' | 'Cleaning' | 'Disposable' | 'Equipment' | 'Tableware';
  unit: string;
  quantity: number;
  minLevel: number;
  cost: number;
  expiryDate?: string;
  batchNumber?: string;
  serialNumber?: string; // For fixed assets
  condition?: 'Excellent' | 'Good' | 'Fair' | 'Poor'; // For fixed assets
  location: string;
}

export default function FoodBeveragePortal({ activeTab }: { activeTab: string }) {
  const { formatAmount, reservations, globalHotelSettings } = useERP();

  const fbOutlets = (globalHotelSettings.posOutlets || []).filter(o => 
    !o.toLowerCase().includes('gift') && 
    !o.toLowerCase().includes('boutique') && 
    !o.toLowerCase().includes('spa') &&
    !o.toLowerCase().includes('reception')
  );

  const dynamicOutletTabs = fbOutlets.map(outlet => {
    let icon = LayoutGrid;
    let type = 'restaurant';
    
    if (outlet.toLowerCase().includes('bar')) {
      icon = Coffee;
      type = 'bar';
    } else if (outlet.toLowerCase().includes('room service')) {
      icon = Utensils;
      type = 'roomservice';
    }
    
    return {
      id: `pos_${outlet}`,
      label: outlet,
      icon,
      outletName: outlet,
      type
    };
  });

  return (
    <div className="space-y-6 animate-fade-in" id="modular-fb-suite">
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <FBDashboard />}
        
        {dynamicOutletTabs.map(t => (
          activeTab === t.id && (
            <React.Fragment key={t.id}>
              {t.type === 'bar' && <BarPOSModule outletName={t.outletName} />}
              {t.type === 'roomservice' && <RoomServiceModule />}
              {t.type === 'restaurant' && <POSModule outletName={t.outletName} />}
            </React.Fragment>
          )
        ))}

        {activeTab === 'bar_store' && <InventoryModule forcedStore="Bar Store" />}
        {activeTab === 'meals' && <GuestMealModule />}
        {activeTab === 'kds' && <KitchenDisplayModule />}
        {activeTab === 'menu' && <MenuManagementModule />}
        {activeTab === 'inventory' && <InventoryModule forcedStore="Restaurant Store" />}
        {activeTab === 'banquets' && <BanquetModule />}
        {activeTab === 'reports' && <DepartmentReportsModule departmentName="F&B" />}
      </div>
    </div>
  );
}
