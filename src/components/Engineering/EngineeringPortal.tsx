
import React from 'react';
import EngineeringDashboard from './EngineeringDashboard';
import WorkOrderManagement from './WorkOrderManagement';
import PreventiveMaintenanceScheduler from './PreventiveMaintenanceScheduler';
import AssetManagement from './AssetManagement';
import UtilitiesManagement from './UtilitiesManagement';
import InventoryModule from './InventoryModule';
import StaffManagement from './StaffManagement';
import ComplianceModule from './ComplianceModule';
import RoomMaintenanceModule from './RoomMaintenanceModule';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';
import { StandardEngineeringReports } from './StandardEngineeringReports';
import WorkRequests from './WorkRequests';
import CorrectiveMaintenance from './CorrectiveMaintenance';
import PredictiveMaintenance from './PredictiveMaintenance';
import EquipmentRegistry from './EquipmentRegistry';
import BuildingMaintenance from './BuildingMaintenance';
import EnergyManagement from './EnergyManagement';
import SparePartsInterface from './SparePartsInterface';
import VendorContractorManagement from './VendorContractorManagement';
import Inspections from './Inspections';
import CalibrationManagement from './CalibrationManagement';
import ProjectsRenovations from './ProjectsRenovations';
import CommunicationCenter from './CommunicationCenter';
import Configuration from './Configuration';

const EngineeringPortal: React.FC<{ activeTab?: string }> = ({ activeTab = 'dashboard' }) => {

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-fade-in">
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && <EngineeringDashboard />}
        {activeTab === 'work-requests' && <WorkRequests />}
        {activeTab === 'workorders' && <WorkOrderManagement />}
        {activeTab === 'corrective-maintenance' && <CorrectiveMaintenance />}
        {activeTab === 'pm' && <PreventiveMaintenanceScheduler />}
        {activeTab === 'predictive-maintenance' && <PredictiveMaintenance />}
        {activeTab === 'equipment-registry' && <EquipmentRegistry />}
        {activeTab === 'building-maintenance' && <BuildingMaintenance />}
        {activeTab === 'energy-management' && <EnergyManagement />}
        {activeTab === 'spare-parts' && <SparePartsInterface />}
        {activeTab === 'vendor-contractor' && <VendorContractorManagement />}
        {activeTab === 'inspections' && <Inspections />}
        {activeTab === 'calibration' && <CalibrationManagement />}
        {activeTab === 'projects-renovations' && <ProjectsRenovations />}
        {activeTab === 'communication' && <CommunicationCenter />}
        {activeTab === 'configuration' && <Configuration />}
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
