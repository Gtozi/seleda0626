/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import BanquetCatering from './BanquetCatering';
import ExecutiveDashboard from './ExecutiveDashboard';
import RoomServiceManagement from './RoomServiceManagement';
import MenuCatalogManagement from './MenuCatalogManagement';
import InventoryCostControl from './InventoryCostControl';
import ReportingBusinessIntelligence from './ReportingBusinessIntelligence';
import RecipeProductionManagement from './RecipeProductionManagement';
import OutletManagement from './OutletManagement';
import PurchasingSupplierManagement from './PurchasingSupplierManagement';
import GuestExperienceCRM from './GuestExperienceCRM';
import PromotionsPricing from './PromotionsPricing';
import FinancialControl from './FinancialControl';
import OperationsCompliance from './OperationsCompliance';
import Integrations from './Integrations';
import BeverageManagement from './BeverageManagement';

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
  return (
    <div className="space-y-6 animate-fade-in" id="modular-fb-suite">
      <div className="min-h-[600px]">
        {activeTab === 'executive-dashboard' && <ExecutiveDashboard />}
        {activeTab === 'outlet-management' && <OutletManagement />}
        {activeTab === 'menu-catalog' && <MenuCatalogManagement />}
        {activeTab === 'recipe-production' && <RecipeProductionManagement />}
        {activeTab === 'inventory-cost' && <InventoryCostControl />}
        {activeTab === 'beverage-management' && <BeverageManagement />}
        {activeTab === 'purchasing-suppliers' && <PurchasingSupplierManagement />}
        {activeTab === 'banquet-catering' && <BanquetCatering />}
        {activeTab === 'room-service' && <RoomServiceManagement />}
        {activeTab === 'guest-crm' && <GuestExperienceCRM />}
        {activeTab === 'promotions-pricing' && <PromotionsPricing />}
        {activeTab === 'financial-control' && <FinancialControl />}
        {activeTab === 'operations-compliance' && <OperationsCompliance />}
        {activeTab === 'reporting-bi' && <ReportingBusinessIntelligence />}
        {activeTab === 'integrations' && <Integrations />}
      </div>
    </div>
  );
}
