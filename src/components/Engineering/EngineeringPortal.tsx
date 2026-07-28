
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Wrench, 
  Box, 
  Zap, 
  Droplets, 
  Fuel, 
  Users, 
  ShieldCheck, 
  BarChart3,
  Search,
  Plus,
  Bell,
  Settings,
  Hammer
} from 'lucide-react';
import EngineeringDashboard from './EngineeringDashboard';
import WorkOrderManagement from './WorkOrderManagement';
import MaintenanceManagement from './MaintenanceManagement';
import PreventiveMaintenanceScheduler from './PreventiveMaintenanceScheduler';
import AssetManagement from './AssetManagement';
import UtilitiesManagement from './UtilitiesManagement';
import InventoryModule from './InventoryModule';
import StaffManagement from './StaffManagement';
import ComplianceModule from './ComplianceModule';
import RoomMaintenanceModule from './RoomMaintenanceModule';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';
import { StandardEngineeringReports } from './StandardEngineeringReports';

const EngineeringPortal: React.FC<{ activeTab?: string }> = ({ activeTab = 'dashboard' }) => {

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-fade-in">
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && <EngineeringDashboard />}
        {activeTab === 'workorders' && <WorkOrderManagement />}
        {activeTab === 'pm' && <PreventiveMaintenanceScheduler />}
        {activeTab === 'assets' && <AssetManagement />}
        {activeTab === 'rooms' && <RoomMaintenanceModule />}
        {activeTab === 'utilities' && <UtilitiesManagement />}
        {activeTab === 'inventory' && <InventoryModule />}
        {activeTab === 'staff' && <StaffManagement />}
        {activeTab === 'compliance' && <ComplianceModule />}
        {activeTab === 'standard-reports' && <StandardEngineeringReports />}
        {activeTab === 'reports' && <DepartmentReportsModule departmentName="Maintenance" />}
      </div>
    </div>
  );
};

export default EngineeringPortal;
