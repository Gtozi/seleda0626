import React from 'react';
import ExecutiveDashboard from './ExecutiveDashboard';
import OperationsCenter from './OperationsCenter';
import ApprovalCenter from './ApprovalCenter';
import FinanceCommand from './FinanceCommand';
import OwnerDashboard from './OwnerDashboard';
import StrategicBI from './StrategicBI';
import BudgetPlanning from './BudgetPlanning';
import RiskCompliance from './RiskCompliance';
import OutletPerformanceReport from '../Shared/OutletPerformanceReport';
import Governance from '../Admin/Governance';
import FinancialRevenueControls from '../Admin/FinancialRevenueControls';
import OperationalPolicies from '../Admin/OperationalPolicies';
import LoyaltyProgram from '../Admin/LoyaltyProgram';
import RevenueMapping from '../Admin/RevenueMapping';
import POSSetup from '../Admin/POSSetup';
import PropertyConfigurationSetup from '../Admin/PropertyConfigurationSetup';

type ExecutiveModule =
  | 'dashboard' | 'operations' | 'finance' | 'fin_controls' | 'policies'
  | 'loyalty' | 'revenue_mapping' | 'pos_outlets' | 'property'
  | 'approvals' | 'analytics' | 'planning' | 'risk' | 'owner'
  | 'outlet_performance' | 'governance';

const ExecutivePortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {
  const currentModule = activeModule as ExecutiveModule;

  return (
    <div className="flex-1 min-w-0 px-6 py-4 h-full font-sans">
      {currentModule === 'dashboard' && <ExecutiveDashboard />}
      {currentModule === 'operations' && <OperationsCenter />}
      {currentModule === 'finance' && <FinanceCommand />}
      {currentModule === 'fin_controls' && <FinancialRevenueControls />}
      {currentModule === 'policies' && <OperationalPolicies />}
      {currentModule === 'loyalty' && <LoyaltyProgram />}
      {currentModule === 'revenue_mapping' && <RevenueMapping />}
      {currentModule === 'pos_outlets' && <POSSetup />}
      {currentModule === 'property' && <PropertyConfigurationSetup />}
      {currentModule === 'analytics' && <StrategicBI />}
      {currentModule === 'outlet_performance' && <OutletPerformanceReport />}
      {currentModule === 'approvals' && <ApprovalCenter />}
      {currentModule === 'planning' && <BudgetPlanning />}
      {currentModule === 'risk' && <RiskCompliance />}
      {currentModule === 'owner' && <OwnerDashboard />}
      {currentModule === 'governance' && <Governance />}
    </div>
  );
};

export default ExecutivePortal;
