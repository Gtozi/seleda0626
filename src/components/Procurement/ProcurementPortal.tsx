import React, { useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  ShoppingCart, 
  Users, 
  FileSearch, 
  Truck, 
  FileCheck, 
  ShieldCheck, 
  Receipt, 
  CheckCircle,
  Bell,
  Search,
  Plus
} from 'lucide-react';
import ProcurementDashboard from './ProcurementDashboard';
import RequisitionManagement from './RequisitionManagement';
import PurchaseOrderManagement from './PurchaseOrderManagement';
import SupplierManagement from './SupplierManagement';
import RFQManagement from './RFQManagement';
import GoodsReceiving from './GoodsReceiving';
import ContractManagement from './ContractManagement';
import BudgetControl from './BudgetControl';
import InvoiceManagement from './InvoiceManagement';
import ApprovalCenter from './ApprovalCenter';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';
import { StandardProcurementReports } from './StandardProcurementReports';

const ProcurementPortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="flex-1 min-w-0 px-1">
        {activeModule === 'dashboard' && <ProcurementDashboard />}
        {activeModule === 'requisitions' && <RequisitionManagement />}
        {activeModule === 'orders' && <PurchaseOrderManagement />}
        {activeModule === 'suppliers' && <SupplierManagement />}
        {activeModule === 'rfq' && <RFQManagement />}
        {activeModule === 'receiving' && <GoodsReceiving />}
        {activeModule === 'contracts' && <ContractManagement />}
        {activeModule === 'budget' && <BudgetControl />}
        {activeModule === 'invoices' && <InvoiceManagement />}
        {activeModule === 'approvals' && <ApprovalCenter />}
        {activeModule === 'reports' && <DepartmentReportsModule departmentName="Procurement" />}
        {activeModule === 'standard-reports' && <StandardProcurementReports />}
      </div>
    </div>
  );
};

export default ProcurementPortal;
