import React from 'react';
import ExecutiveDashboard from './ExecutiveDashboard';
import OperationsCenter from './OperationsCenter';
import ApprovalCenter from './ApprovalCenter';
import FinanceCommand from './FinanceCommand';
import BusinessAdmin from './BusinessAdmin';
import PropertyAssetConfig from './PropertyAssetConfig';
import OwnerDashboard from './OwnerDashboard';
import StrategicBI from './StrategicBI';
import BudgetPlanning from './BudgetPlanning';
import RiskCompliance from './RiskCompliance';
import OutletPerformanceReport from '../Shared/OutletPerformanceReport';
import PricingRevenueManagement from './PricingRevenueManagement';
import BusinessAdminAudit from './BusinessAdminAudit';

type ExecutiveModule =
  | 'dashboard' | 'operations' | 'finance' | 'business_admin' | 'property_config'
  | 'approvals' | 'analytics' | 'planning' | 'risk' | 'owner'
  | 'outlet_performance' | 'pricing_revenue' | 'governance';

const ExecutivePortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {
  const currentModule = activeModule as ExecutiveModule;

  return (
    <div className="flex-1 min-w-0 px-6 py-4 h-full font-sans">
      {currentModule === 'dashboard' && <ExecutiveDashboard />}
      {currentModule === 'operations' && <OperationsCenter />}
      {currentModule === 'finance' && <FinanceCommand />}
      {currentModule === 'business_admin' && <BusinessAdmin />}
      {currentModule === 'property_config' && <PropertyAssetConfig />}
      {currentModule === 'analytics' && <StrategicBI />}
      {currentModule === 'outlet_performance' && <OutletPerformanceReport />}
      {currentModule === 'approvals' && <ApprovalCenter />}
      {currentModule === 'planning' && <BudgetPlanning />}
      {currentModule === 'risk' && <RiskCompliance />}
      {currentModule === 'owner' && <OwnerDashboard />}
      {currentModule === 'pricing_revenue' && <PricingRevenueManagement />}
      {currentModule === 'governance' as ExecutiveModule && <BusinessAdminAudit />}
    </div>
  );
};

export default ExecutivePortal;
