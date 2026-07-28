import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Plus, Eye, Calculator, CheckCircle2, DollarSign, Users, TrendingDown, Printer } from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import PayslipViewer from './PayslipViewer';
import {
  fetchEmployees, fetchPayrollRuns, createPayrollRun, updatePayrollRunStatus, fetchPayslips,
  type Employee, type PayrollRun, type Payslip,
} from '../../services/payrollService';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PayrollEngine = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showNewRun, setShowNewRun] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRun | null>(null);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [payslipsLoading, setPayslipsLoading] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [activeTab, setActiveTab] = useState<'runs' | 'payslips'>('runs');

  const [newRun, setNewRun] = useState({
    period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    selectedEmployees: [] as string[],
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [runData, empData] = await Promise.all([fetchPayrollRuns(), fetchEmployees()]);
      setRuns(runData);
      setEmployees(empData.filter(e => e.status === 'Active'));
    } catch (err: any) {
      console.error('Error loading payroll data:', err);
      setError(err.message || 'Failed to load payroll data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleViewRun = async (run: PayrollRun) => {
    setSelectedRun(run);
    setActiveTab('payslips');
    setPayslipsLoading(true);
    try {
      const data = await fetchPayslips(run.id);
      setPayslips(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payslips');
    } finally {
      setPayslipsLoading(false);
    }
  };

  const handleCreateRun = async () => {
    try {
      await createPayrollRun(newRun.period, newRun.selectedEmployees.length > 0 ? newRun.selectedEmployees : undefined);
      setShowNewRun(false);
      setNewRun({ period: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`, selectedEmployees: [] });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create payroll run');
    }
  };

  const handleStatusUpdate = async (run: PayrollRun, status: string) => {
    try {
      await updatePayrollRunStatus(run.id, status);
      loadData();
      if (selectedRun?.id === run.id) {
        setSelectedRun({ ...run, status });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update run status');
    }
  };

  const toggleEmployee = (empId: string) => {
    setNewRun(prev => ({
      ...prev,
      selectedEmployees: prev.selectedEmployees.includes(empId)
        ? prev.selectedEmployees.filter(id => id !== empId)
        : [...prev.selectedEmployees, empId],
    }));
  };

  const runColumns: Column<PayrollRun>[] = [
    {
      key: 'period',
      label: 'Period',
      render: (r) => <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{r.period}</span>,
    },
    {
      key: 'employee_count',
      label: 'Employees',
      align: 'center',
      render: (r) => <span className="text-[10px] font-bold text-slate-500">{r.employee_count}</span>,
    },
    {
      key: 'total_gross',
      label: 'Gross',
      align: 'right',
      render: (r) => <span className="text-xs font-mono text-slate-900 dark:text-white">${fmt(Number(r.total_gross) || 0)}</span>,
    },
    {
      key: 'total_tax',
      label: 'Tax',
      align: 'right',
      render: (r) => <span className="text-xs font-mono text-amber-600">${fmt(Number(r.total_tax) || 0)}</span>,
    },
    {
      key: 'total_pension_employee',
      label: 'Pension (Emp)',
      align: 'right',
      render: (r) => <span className="text-xs font-mono text-rose-600">${fmt(Number(r.total_pension_employee) || 0)}</span>,
    },
    {
      key: 'total_net',
      label: 'Net Pay',
      align: 'right',
      render: (r) => <span className="text-xs font-black font-mono text-emerald-600">${fmt(Number(r.total_net) || 0)}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (r) => {
        const colors: Record<string, string> = {
          Draft: 'bg-slate-50 text-slate-600',
          Calculated: 'bg-amber-50 text-amber-600',
          Approved: 'bg-indigo-50 text-indigo-600',
          Posted: 'bg-emerald-50 text-emerald-600',
          Reversed: 'bg-rose-50 text-rose-600',
        };
        return (
          <div className="flex justify-center">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${colors[r.status] || colors['Draft']}`}>
              {r.status}
            </span>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (r) => (
        <div className="flex justify-center gap-1">
          <button onClick={() => handleViewRun(r)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View Payslips">
            <Eye size={14} />
          </button>
          {r.status === 'Calculated' && (
            <button onClick={() => handleStatusUpdate(r, 'Approved')} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="Approve">
              <CheckCircle2 size={14} />
            </button>
          )}
          {r.status === 'Approved' && (
            <button onClick={() => handleStatusUpdate(r, 'Posted')} className="p-1.5 text-slate-400 hover:text-emerald-600 transition" title="Post to GL">
              <DollarSign size={14} />
            </button>
          )}
        </div>
      ),
    },
  ];

  const payslipColumns: Column<Payslip>[] = [
    {
      key: 'employee_id',
      label: 'Employee',
      render: (p) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 dark:text-white">{p.employees?.name || '—'}</span>
          <span className="text-[9px] font-bold text-slate-400">{p.employees?.department || '—'} · {p.employees?.position || '—'}</span>
        </div>
      ),
    },
    {
      key: 'basic_salary',
      label: 'Basic',
      align: 'right',
      render: (p) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300">${fmt(Number(p.basic_salary) || 0)}</span>,
    },
    {
      key: 'allowances',
      label: 'Allowances',
      align: 'right',
      render: (p) => <span className="text-xs font-mono text-slate-700 dark:text-slate-300">${fmt(Number(p.allowances) || 0)}</span>,
    },
    {
      key: 'gross_pay',
      label: 'Gross',
      align: 'right',
      render: (p) => <span className="text-xs font-mono text-slate-900 dark:text-white">${fmt(Number(p.gross_pay) || 0)}</span>,
    },
    {
      key: 'income_tax',
      label: 'Tax',
      align: 'right',
      render: (p) => <span className="text-xs font-mono text-amber-600">${fmt(Number(p.income_tax) || 0)}</span>,
    },
    {
      key: 'pension_employee',
      label: 'Pension',
      align: 'right',
      render: (p) => <span className="text-xs font-mono text-rose-600">${fmt(Number(p.pension_employee) || 0)}</span>,
    },
    {
      key: 'net_pay',
      label: 'Net Pay',
      align: 'right',
      render: (p) => <span className="text-xs font-black font-mono text-emerald-600">${fmt(Number(p.net_pay) || 0)}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'center',
      sortable: false,
      render: (p) => (
        <div className="flex justify-center gap-1">
          <button onClick={() => setSelectedPayslip(p)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition" title="View Payslip">
            <Eye size={14} />
          </button>
        </div>
      ),
    },
  ];

  const inputClass = "w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500";
  const labelClass = "text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} /> Refresh
          </button>
          {selectedRun && (
            <button onClick={() => { setSelectedRun(null); setActiveTab('runs'); setPayslips([]); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
              ← Back to Runs
            </button>
          )}
        </div>
        {!selectedRun && (
          <button onClick={() => setShowNewRun(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs transition shadow-md shadow-indigo-200 dark:shadow-none">
            <Plus size={16} /> New Payroll Run
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {selectedRun && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Gross', value: fmt(Number(selectedRun.total_gross) || 0), icon: DollarSign, color: 'text-indigo-600' },
            { label: 'Total Tax', value: fmt(Number(selectedRun.total_tax) || 0), icon: TrendingDown, color: 'text-amber-600' },
            { label: 'Total Pension', value: fmt(Number(selectedRun.total_pension_employee) || 0), icon: Users, color: 'text-rose-600' },
            { label: 'Total Net', value: fmt(Number(selectedRun.total_net) || 0), icon: CheckCircle2, color: 'text-emerald-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-[32px] shadow-3xs">
              <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-950 ${stat.color} mb-3`}>
                <stat.icon size={18} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
              <h3 className={`text-xl font-black ${stat.color}`}>${stat.value}</h3>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">Loading payroll data...</div>
      ) : activeTab === 'runs' && !selectedRun ? (
        <DataTable
          columns={runColumns}
          data={runs}
          rowKey={(row) => row.id}
          sortable
          filterable
          filterPlaceholder="Search payroll runs..."
          filterKeys={['period', 'status']}
          emptyMessage="No payroll runs found. Click New Payroll Run to create one."
        />
      ) : activeTab === 'payslips' && selectedRun ? (
        payslipsLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">Loading payslips...</div>
        ) : (
          <DataTable
            columns={payslipColumns}
            data={payslips}
            rowKey={(row) => row.id}
            sortable
            filterable
            filterPlaceholder="Search payslips..."
            filterKeys={['employee_id', 'period', 'status']}
            emptyMessage="No payslips found for this run."
          />
        )
      ) : null}

      {/* New Payroll Run Modal */}
      <ModalSystem
        isOpen={showNewRun}
        onClose={() => setShowNewRun(false)}
        title="New Payroll Run"
        subtitle="Select period and employees to calculate payroll"
        variant="form"
        size="lg"
        showFooter={false}
      >
        <div className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Pay Period (YYYY-MM)</label>
            <input type="month" value={newRun.period} onChange={(e) => setNewRun({ ...newRun, period: e.target.value })} className={inputClass} />
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Select Employees</h4>
              <button onClick={() => setNewRun({ ...newRun, selectedEmployees: employees.map(e => e.id) })}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition">
                Select All
              </button>
              <button onClick={() => setNewRun({ ...newRun, selectedEmployees: [] })}
                className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition ml-2">
                Clear
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {employees.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-xs font-bold">No active employees found.</div>
              ) : employees.map(emp => (
                <label key={emp.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition">
                  <input type="checkbox" checked={newRun.selectedEmployees.includes(emp.id)} onChange={() => toggleEmployee(emp.id)}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-900 dark:text-white">{emp.name}</p>
                    <p className="text-[9px] font-bold text-slate-400">{emp.department} · {emp.position}</p>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-700 dark:text-slate-300">${fmt(Number(emp.basic_salary || emp.salary) || 0)}</span>
                </label>
              ))}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-2">
              {newRun.selectedEmployees.length === 0 ? 'All active employees will be included.' : `${newRun.selectedEmployees.length} employee(s) selected.`}
            </p>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50 dark:bg-slate-950">
          <button onClick={() => setShowNewRun(false)} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">Cancel</button>
          <button onClick={handleCreateRun} className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition flex items-center gap-2">
            <Calculator size={14} /> Calculate Payroll
          </button>
        </div>
      </ModalSystem>

      {/* Payslip Viewer Modal */}
      {selectedPayslip && (
        <PayslipViewer payslip={selectedPayslip} onClose={() => setSelectedPayslip(null)} />
      )}
    </div>
  );
};

export default PayrollEngine;
