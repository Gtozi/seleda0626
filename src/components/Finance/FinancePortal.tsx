import FinanceDashboard from './FinanceDashboard';
import GeneralLedger from './GeneralLedger';
import AccountsReceivable from './AccountsReceivable';
import AccountsPayable from './AccountsPayable';
import FinancialReports from './FinancialReports';
import BudgetAnalysis from './BudgetAnalysis';
import SalesRegistry from './SalesRegistry';
import BankReconciliation from './BankReconciliation';
import FixedAssets from './FixedAssets';
import TaxCompliance from './TaxCompliance';
import PeriodClose from './PeriodClose';
import TrialBalance from './TrialBalance';
import FinancialStatements from './FinancialStatements';
import ErcaVatExport from './ErcaVatExport';
import { StandardFinanceReports } from './StandardFinanceReports';

const FinancePortal = ({ activeModule = 'gl' }: { activeModule?: string }) => {

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 px-1 text-slate-850 dark:text-slate-100">
        {activeModule === 'dashboard' && <FinanceDashboard />}
        {activeModule === 'gl' && <GeneralLedger />}
        {activeModule === 'ar' && <AccountsReceivable />}
        {activeModule === 'ap' && <AccountsPayable />}
        {activeModule === 'bank_recon' && <BankReconciliation />}
        {activeModule === 'reports' && <FinancialReports />}
        {activeModule === 'standard-reports' && <StandardFinanceReports />}
        {activeModule === 'budget' && <BudgetAnalysis />}
        {activeModule === 'tax_compliance' && <TaxCompliance />}
        {activeModule === 'period_close' && <PeriodClose />}
        {activeModule === 'assets' && <FixedAssets />}
        {activeModule === 'sales' && <SalesRegistry />}
        {activeModule === 'trial_balance' && <TrialBalance />}
        {activeModule === 'financial_statements' && <FinancialStatements />}
        {activeModule === 'erca_vat' && <ErcaVatExport />}
      </div>
    </div>
  );
};


export default FinancePortal;
