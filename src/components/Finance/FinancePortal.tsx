import React, { useState } from 'react';
import { 
  BarChart3, 
  FileSpreadsheet, 
  Users, 
  Truck, 
  Wallet, 
  PiggyBank, 
  Layers,
  FileText,
  ShieldCheck,
  ChevronRight,
  Search,
  Bell,
  Receipt,
  RefreshCw,
  Scale
} from 'lucide-react';
import FinanceDashboard from './FinanceDashboard';
import GeneralLedger from './GeneralLedger';
import AccountsReceivable from './AccountsReceivable';
import AccountsPayable from './AccountsPayable';
import CashManagement from './CashManagement';
import FinancialReports from './FinancialReports';
import BudgetAnalysis from './BudgetAnalysis';
import AssetManagement from './AssetManagement';
import ExpensePortal from './Expenses/ExpensePortal';
import SalesRegistry from './SalesRegistry';

const FinancePortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Main Content Area */}
      <div className="flex-1 min-w-0 px-1 text-slate-850 dark:text-slate-100">
        {activeModule === 'dashboard' && <FinanceDashboard />}
        {activeModule === 'sales' && <SalesRegistry />}
        {activeModule === 'gl' && <GeneralLedger />}
        {activeModule === 'ar' && <AccountsReceivable />}
        {activeModule === 'ap' && <AccountsPayable />}
        {activeModule === 'cash' && <CashManagement />}
        {activeModule === 'reports' && <FinancialReports />}
        {activeModule === 'budget' && <BudgetAnalysis />}
        {activeModule === 'assets' && <AssetManagement />}
        {activeModule === 'expenses' && <ExpensePortal />}
      </div>
    </div>
  );
};


export default FinancePortal;
