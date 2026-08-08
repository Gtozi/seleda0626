import FinanceDashboard from './FinanceDashboard';
import GeneralLedger from './GeneralLedger';
import AccountsReceivable from './AccountsReceivable';
import AccountsPayable from './AccountsPayable';
import BankReconciliation from './BankReconciliation';
import TreasuryManagement from './TreasuryManagement';
import RevenueAccounting from './RevenueAccounting';
import ExpenseManagement from './ExpenseManagement';
import CostCenterAccounting from './CostCenterAccounting';
import BudgetAnalysis from './BudgetAnalysis';
import FixedAssets from './FixedAssets';
import InventoryAccounting from './InventoryAccounting';
import IntercompanyAccounting from './IntercompanyAccounting';
import TaxCompliance from './TaxCompliance';
import PeriodClose from './PeriodClose';
import FinancialConsolidation from './FinancialConsolidation';
import AuditCompliance from './AuditCompliance';
import DocumentManagement from './DocumentManagement';
import ApprovalWorkflow from './ApprovalWorkflow';
import BusinessIntelligence from './BusinessIntelligence';
import FinancialReports from './FinancialReports';
import FinanceConfiguration from './FinanceConfiguration';
import ChartOfAccounts from './ChartOfAccounts';

const FinancePortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 px-1 text-slate-850 dark:text-slate-100">
        {activeModule === 'dashboard' && <FinanceDashboard />}
        {activeModule === 'gl' && <GeneralLedger />}
        {activeModule === 'coa' && <ChartOfAccounts />}
        {activeModule === 'ar' && <AccountsReceivable />}
        {activeModule === 'ap' && <AccountsPayable />}
        {activeModule === 'cash_bank' && <BankReconciliation />}
        {activeModule === 'treasury' && <TreasuryManagement />}
        {activeModule === 'revenue' && <RevenueAccounting />}
        {activeModule === 'expense' && <ExpenseManagement />}
        {activeModule === 'cost_center' && <CostCenterAccounting />}
        {activeModule === 'budgeting' && <BudgetAnalysis />}
        {activeModule === 'fixed_assets' && <FixedAssets />}
        {activeModule === 'inventory' && <InventoryAccounting />}
        {activeModule === 'intercompany' && <IntercompanyAccounting />}
        {activeModule === 'tax' && <TaxCompliance />}
        {activeModule === 'financial_close' && <PeriodClose />}
        {activeModule === 'consolidation' && <FinancialConsolidation />}
        {activeModule === 'audit_compliance' && <AuditCompliance />}
        {activeModule === 'documents' && <DocumentManagement />}
        {activeModule === 'approval' && <ApprovalWorkflow />}
        {activeModule === 'bi' && <BusinessIntelligence />}
        {activeModule === 'reports' && <FinancialReports />}
        {activeModule === 'config' && <FinanceConfiguration />}
      </div>
    </div>
  );
};


export default FinancePortal;
