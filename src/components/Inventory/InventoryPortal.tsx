
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Truck, 
  ClipboardCheck, 
  Users2, 
  BarChart3,
  Search,
  Plus,
  Box,
  Store,
  Tag
} from 'lucide-react';
import InventoryDashboard from './InventoryDashboard';
import ItemMasterModule from './ItemMasterModule';
import StoreManagement from './StoreManagement';
import RequisitionModule from './RequisitionModule';
import ReceivingModule from './ReceivingModule';
import StockCountModule from './StockCountModule';
import SupplierModule from './SupplierModule';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';
import { StandardInventoryReports } from './StandardInventoryReports';

const InventoryPortal: React.FC<{ activeTab?: string }> = ({ activeTab = 'dashboard' }) => {

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-fade-in">
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && <InventoryDashboard />}
        {activeTab === 'items' && <ItemMasterModule />}
        {activeTab === 'stores' && <StoreManagement />}
        {activeTab === 'requisitions' && <RequisitionModule />}
        {activeTab === 'receiving' && <ReceivingModule />}
        {activeTab === 'count' && <StockCountModule />}
        {activeTab === 'suppliers' && <SupplierModule />}
        {activeTab === 'standard-reports' && <StandardInventoryReports />}
        {activeTab === 'reports' && <DepartmentReportsModule departmentName="Inventory" />}
      </div>
    </div>
  );
};

export default InventoryPortal;
