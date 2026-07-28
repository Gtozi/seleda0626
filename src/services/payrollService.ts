const API_BASE = '/api/hr';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Request failed: ${res.status}`);
  return data as T;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  status: string;
  hire_date: string;
  salary: number;
  basic_salary: number;
  allowance_amount: number;
  overtime_rate: number;
  bank_account: string;
  pension_number: string;
  linked_employee_id: string;
}

export interface TaxBand {
  id: string;
  band_order: number;
  min_income: number;
  max_income: number | null;
  rate: number;
  deduction: number;
  description: string;
}

export interface PensionRate {
  id: string;
  employee_rate: number;
  employer_rate: number;
  effective_date: string;
}

export interface PayrollRun {
  id: string;
  period: string;
  run_date: string;
  status: string;
  total_gross: number;
  total_tax: number;
  total_pension_employee: number;
  total_pension_employer: number;
  total_deductions: number;
  total_net: number;
  employee_count: number;
  approved_by: string;
  approved_at: string;
  posted_by: string;
  posted_at: string;
  created_at: string;
}

export interface Payslip {
  id: string;
  payroll_run_id: string;
  employee_id: string;
  period: string;
  basic_salary: number;
  allowances: number;
  overtime: number;
  gross_pay: number;
  income_tax: number;
  pension_employee: number;
  pension_employer: number;
  loan_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_pay: number;
  ytd_gross: number;
  ytd_tax: number;
  ytd_pension: number;
  ytd_net: number;
  status: string;
  paid_at: string;
  employees?: { name: string; email: string; phone: string; department: string; position: string; bank_account: string; pension_number: string };
  payroll_runs?: { period: string; status: string };
}

export async function fetchEmployees(): Promise<Employee[]> {
  return apiRequest<Employee[]>('/employees');
}

export async function fetchTaxBands(): Promise<TaxBand[]> {
  return apiRequest<TaxBand[]>('/tax-bands');
}

export async function fetchPensionRates(): Promise<PensionRate[]> {
  return apiRequest<PensionRate[]>('/pension-rates');
}

export async function fetchPayrollRuns(): Promise<PayrollRun[]> {
  return apiRequest<PayrollRun[]>('/payroll-runs');
}

export async function createPayrollRun(period: string, employeeIds?: string[]): Promise<{ success: boolean; runId: string; employeeCount: number; totalGross: number; totalNet: number }> {
  return apiRequest('/payroll-runs', { method: 'POST', body: JSON.stringify({ period, employeeIds }) });
}

export async function updatePayrollRunStatus(id: string, status: string): Promise<{ success: boolean; run: PayrollRun }> {
  return apiRequest(`/payroll-runs/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function fetchPayslips(runId: string): Promise<Payslip[]> {
  return apiRequest<Payslip[]>(`/payroll-runs/${runId}/payslips`);
}

export async function fetchPayslip(id: string): Promise<Payslip> {
  return apiRequest<Payslip>(`/payslips/${id}`);
}
