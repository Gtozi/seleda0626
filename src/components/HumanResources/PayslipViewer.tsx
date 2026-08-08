import React from 'react';
import { Printer, X, DollarSign, TrendingDown, Wallet } from 'lucide-react';
import type { Payslip } from '../../services/payrollService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PayslipViewer = ({ payslip, onClose }: { payslip: Payslip; onClose: () => void }) => {
  const emp = payslip.employees;
  const run = payslip.payroll_runs;

  const handlePrint = () => {
    const printContent = document.getElementById('payslip-print-area');
    if (!printContent) return;
    const win = window.open('', '_blank', 'width=800,height=600');
    if (!win) return;
    win.document.write(`
      <html><head><title>Payslip - ${emp?.name || 'Employee'}</title>
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
        .payslip { max-width: 700px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; }
        .header p { font-size: 12px; color: #64748b; }
        .section { margin-bottom: 20px; }
        .section-title { font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f1f5f9; font-size: 12px; }
        .row span:first-child { color: #64748b; }
        .row span:last-child { font-weight: 700; }
        .total { display: flex; justify-content: space-between; padding: 12px 0; font-size: 14px; font-weight: 900; border-top: 2px solid #1e293b; margin-top: 10px; }
        .net { color: #059669; font-size: 18px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th { text-align: left; font-size: 9px; text-transform: uppercase; color: #94a3b8; padding: 8px; border-bottom: 2px solid #e2e8f0; }
        td { padding: 8px; font-size: 12px; border-bottom: 1px solid #f1f5f9; }
        .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #94a3b8; }
      </style></head><body>${printContent.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-slate-900 p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between z-10">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Payslip</h2>
            <p className="text-xs font-medium text-slate-400">{run?.period || payslip.period}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium uppercase hover:bg-indigo-700 transition flex items-center gap-2">
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition">
              <X size={18} />
            </button>
          </div>
        </div>

        <div id="payslip-print-area" className="p-6 space-y-6">
          {/* Employee Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{emp?.name || '—'}</h3>
            <p className="text-sm font-medium text-slate-400">{emp?.department} · {emp?.position}</p>
            {emp?.pension_number && <p className="text-xs font-mono text-slate-400 mt-1">Pension #: {emp.pension_number}</p>}
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={14} className="text-indigo-500" />
                <span className="text-xs font-medium text-indigo-400 uppercase">Gross</span>
              </div>
              <span className="text-lg font-semibold text-indigo-600">${fmt(Number(payslip.gross_pay) || 0)}</span>
            </div>
            <div className="bg-rose-50 dark:bg-rose-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={14} className="text-rose-500" />
                <span className="text-xs font-medium text-rose-400 uppercase">Deductions</span>
              </div>
              <span className="text-lg font-semibold text-rose-600">${fmt(Number(payslip.total_deductions) || 0)}</span>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={14} className="text-emerald-500" />
                <span className="text-xs font-medium text-emerald-400 uppercase">Net Pay</span>
              </div>
              <span className="text-lg font-semibold text-emerald-600">${fmt(Number(payslip.net_pay) || 0)}</span>
            </div>
          </div>

          {/* Earnings */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">Earnings</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-sm font-medium text-slate-500">Basic Salary</span>
                <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">${fmt(Number(payslip.basic_salary) || 0)}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-sm font-medium text-slate-500">Allowances</span>
                <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">${fmt(Number(payslip.allowances) || 0)}</span>
              </div>
              {Number(payslip.overtime) > 0 && (
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-sm font-medium text-slate-500">Overtime</span>
                  <span className="text-sm font-mono font-semibold text-slate-900 dark:text-white">${fmt(Number(payslip.overtime) || 0)}</span>
                </div>
              )}
              <div className="flex justify-between p-3 border-t-2 border-slate-200 dark:border-slate-700 rounded-xl">
                <span className="text-sm font-semibold text-slate-900 dark:text-white uppercase">Gross Pay</span>
                <span className="text-sm font-semibold font-mono text-indigo-600">${fmt(Number(payslip.gross_pay) || 0)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">Deductions</h4>
            <div className="space-y-2">
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-sm font-medium text-slate-500">Income Tax</span>
                <span className="text-sm font-mono font-semibold text-amber-600">${fmt(Number(payslip.income_tax) || 0)}</span>
              </div>
              <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <span className="text-sm font-medium text-slate-500">Pension (Employee)</span>
                <span className="text-sm font-mono font-semibold text-rose-600">${fmt(Number(payslip.pension_employee) || 0)}</span>
              </div>
              {Number(payslip.loan_deduction) > 0 && (
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-sm font-medium text-slate-500">Loan Deduction</span>
                  <span className="text-sm font-mono font-semibold text-rose-600">${fmt(Number(payslip.loan_deduction) || 0)}</span>
                </div>
              )}
              {Number(payslip.other_deductions) > 0 && (
                <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-sm font-medium text-slate-500">Other Deductions</span>
                  <span className="text-sm font-mono font-semibold text-rose-600">${fmt(Number(payslip.other_deductions) || 0)}</span>
                </div>
              )}
              <div className="flex justify-between p-3 border-t-2 border-slate-200 dark:border-slate-700 rounded-xl">
                <span className="text-sm font-semibold text-slate-900 dark:text-white uppercase">Total Deductions</span>
                <span className="text-sm font-semibold font-mono text-rose-600">${fmt(Number(payslip.total_deductions) || 0)}</span>
              </div>
            </div>
          </div>

          {/* Net Pay */}
          <div className="flex justify-between items-center p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
            <div>
              <span className="text-xs font-medium text-emerald-400 uppercase block">Net Pay</span>
              <span className="text-xs font-medium text-emerald-400/70">{run?.period || payslip.period}</span>
            </div>
            <span className="text-2xl font-semibold text-emerald-600">${fmt(Number(payslip.net_pay) || 0)}</span>
          </div>

          {/* Employer Contributions */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">Employer Contributions</h4>
            <div className="flex justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <span className="text-sm font-medium text-slate-500">Pension (Employer)</span>
              <span className="text-sm font-mono font-semibold text-slate-700 dark:text-slate-300">${fmt(Number(payslip.pension_employer) || 0)}</span>
            </div>
          </div>

          {/* YTD */}
          {(Number(payslip.ytd_gross) > 0 || Number(payslip.ytd_net) > 0) && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-3">Year-to-Date</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 uppercase block">YTD Gross</span>
                  <span className="text-sm font-semibold font-mono text-slate-900 dark:text-white">${fmt(Number(payslip.ytd_gross) || 0)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 uppercase block">YTD Tax</span>
                  <span className="text-sm font-semibold font-mono text-amber-600">${fmt(Number(payslip.ytd_tax) || 0)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 uppercase block">YTD Pension</span>
                  <span className="text-sm font-semibold font-mono text-rose-600">${fmt(Number(payslip.ytd_pension) || 0)}</span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                  <span className="text-xs font-medium text-slate-400 uppercase block">YTD Net</span>
                  <span className="text-sm font-semibold font-mono text-emerald-600">${fmt(Number(payslip.ytd_net) || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status */}
          <div className="flex justify-center">
            <span className={`px-4 py-1.5 rounded-xl text-xs font-medium uppercase ${
              payslip.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' :
              payslip.status === 'Approved' ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {payslip.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;
