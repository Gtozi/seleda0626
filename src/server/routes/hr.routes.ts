import { Router } from 'express';
import crypto from 'crypto';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';

const router = Router();

// =====================
// HR & Payroll API
// =====================
router.get('/employees', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('employees').select('*').order('name');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/tax-bands', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('tax_bands').select('*').eq('is_active', true).order('band_order');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/pension-rates', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('pension_rates').select('*').eq('is_active', true).order('effective_date', { ascending: false }).limit(1);
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/payroll-runs', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('payroll_runs').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/payroll-runs', authenticate, requirePermission('hr:write'), async (req, res) => {
  const { period, employeeIds } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    // Create payroll run
    const runId = crypto.randomUUID();
    const { error: runError } = await supabaseAdmin.from('payroll_runs')
      .insert({ id: runId, period, status: 'Draft', created_by: req.user!.id });
    if (runError) return res.status(500).json({ error: runError.message });

    // Fetch employees
    let empQuery = supabaseAdmin.from('employees').select('*').eq('status', 'Active');
    if (employeeIds && employeeIds.length > 0) {
      empQuery = empQuery.in('id', employeeIds);
    }
    const { data: employees, error: empError } = await empQuery;
    if (empError) return res.status(500).json({ error: empError.message });

    // Fetch pension rates
    const { data: pensionData } = await supabaseAdmin.from('pension_rates')
      .select('*').eq('is_active', true).order('effective_date', { ascending: false }).limit(1);
    const pension = pensionData?.[0] || null;

    const empRate = pension?.employee_rate || 7;
    const erRate = pension?.employer_rate || 11;

    let totalGross = 0, totalTax = 0, totalPensionEmp = 0, totalPensionEr = 0, totalNet = 0;

    // Calculate payslips for each employee
    for (const emp of employees || []) {
      const basic = Number(emp.basic_salary || emp.salary || 0);
      const allowances = Number(emp.allowance_amount || 0);
      const gross = basic + allowances;

      // Calculate income tax
      const { data: taxResult, error: taxError } = await supabaseAdmin.rpc('calculate_income_tax', { p_taxable_income: gross });
      const tax = taxError ? 0 : Number(taxResult || 0);

      // Calculate pension
      const pensionEmp = gross * empRate / 100;
      const pensionEr = gross * erRate / 100;

      const totalDeductions = tax + pensionEmp;
      const netPay = gross - totalDeductions;

      totalGross += gross;
      totalTax += tax;
      totalPensionEmp += pensionEmp;
      totalPensionEr += pensionEr;
      totalNet += netPay;

      await supabaseAdmin.from('payslips').insert({
        payroll_run_id: runId,
        employee_id: emp.id,
        period,
        basic_salary: basic,
        allowances,
        overtime: 0,
        gross_pay: gross,
        income_tax: tax,
        pension_employee: pensionEmp,
        pension_employer: pensionEr,
        total_deductions: totalDeductions,
        net_pay: netPay,
        status: 'Calculated',
      });
    }

    // Update run totals
    await supabaseAdmin.from('payroll_runs').update({
      total_gross: totalGross,
      total_tax: totalTax,
      total_pension_employee: totalPensionEmp,
      total_pension_employer: totalPensionEr,
      total_deductions: totalTax + totalPensionEmp,
      total_net: totalNet,
      employee_count: employees?.length || 0,
      status: 'Calculated',
    }).eq('id', runId);

    return res.json({ success: true, runId, employeeCount: employees?.length || 0, totalGross, totalNet });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.patch('/payroll-runs/:id', authenticate, requirePermission('hr:write'), async (req, res) => {
  const { status } = req.body;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const updateData: any = { status };
    if (status === 'Approved') { updateData.approved_by = req.user!.id; updateData.approved_at = new Date().toISOString(); }
    if (status === 'Posted') { updateData.posted_by = req.user!.id; updateData.posted_at = new Date().toISOString(); }

    const { data, error } = await supabaseAdmin.from('payroll_runs').update(updateData).eq('id', req.params.id).select().single();
    if (error) return res.status(500).json({ error: error.message });

    // If approved, mark payslips as approved too
    if (status === 'Approved') {
      await supabaseAdmin.from('payslips').update({ status: 'Approved' }).eq('payroll_run_id', req.params.id);
    }
    return res.json({ success: true, run: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/payroll-runs/:id/payslips', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('payslips')
      .select('*, employees(name, email, phone, department, position, bank_account, pension_number)')
      .eq('payroll_run_id', req.params.id)
      .order('employees(name)');
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.get('/payslips/:id', authenticate, async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from('payslips')
      .select('*, employees(name, email, phone, department, position, bank_account, pension_number), payroll_runs(period, status)')
      .eq('id', req.params.id).single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }
  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
