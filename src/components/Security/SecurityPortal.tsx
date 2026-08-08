import React from 'react';
import SecurityDashboard from './SecurityDashboard';
import SecurityOperationsCenter from './SecurityOperationsCenter';
import IncidentManagement from './IncidentManagement';
import Investigations from './Investigations';
import VisitorManagement from './VisitorManagement';
import AccessControl from './AccessControl';
import KeyKeycardManagement from './KeyKeycardManagement';
import CCTVManagement from './CCTVManagement';
import PatrolManagement from './PatrolManagement';
import LostFoundOversight from './LostFoundOversight';
import EmergencyManagement from './EmergencyManagement';
import FireLifeSafety from './FireLifeSafety';
import RiskManagement from './RiskManagement';
import BusinessContinuity from './BusinessContinuity';
import CrisisManagement from './CrisisManagement';
import HealthSafetyCoordination from './HealthSafetyCoordination';
import ComplianceManagement from './ComplianceManagement';
import AssetProtection from './AssetProtection';
import FraudPrevention from './FraudPrevention';
import EvidenceManagement from './EvidenceManagement';
import CommunicationCenter from './CommunicationCenter';
import SecurityReports from './SecurityReports';
import SecurityConfiguration from './SecurityConfiguration';

const SecurityPortal: React.FC<{ activeTab?: string }> = ({ activeTab = 'dashboard' }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-fade-in">
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && <SecurityDashboard />}
        {activeTab === 'soc' && <SecurityOperationsCenter />}
        {activeTab === 'incidents' && <IncidentManagement />}
        {activeTab === 'investigations' && <Investigations />}
        {activeTab === 'visitors' && <VisitorManagement />}
        {activeTab === 'access-control' && <AccessControl />}
        {activeTab === 'keys' && <KeyKeycardManagement />}
        {activeTab === 'cctv' && <CCTVManagement />}
        {activeTab === 'patrols' && <PatrolManagement />}
        {activeTab === 'lost-found' && <LostFoundOversight />}
        {activeTab === 'emergency' && <EmergencyManagement />}
        {activeTab === 'fire-safety' && <FireLifeSafety />}
        {activeTab === 'risk' && <RiskManagement />}
        {activeTab === 'business-continuity' && <BusinessContinuity />}
        {activeTab === 'crisis' && <CrisisManagement />}
        {activeTab === 'health-safety' && <HealthSafetyCoordination />}
        {activeTab === 'compliance' && <ComplianceManagement />}
        {activeTab === 'asset-protection' && <AssetProtection />}
        {activeTab === 'fraud-prevention' && <FraudPrevention />}
        {activeTab === 'evidence' && <EvidenceManagement />}
        {activeTab === 'communication' && <CommunicationCenter />}
        {activeTab === 'reports' && <SecurityReports />}
        {activeTab === 'configuration' && <SecurityConfiguration />}
      </div>
    </div>
  );
};

export default SecurityPortal;