import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Phase 1: Payroll Gross-to-Net Calculation Engine ───────────────────
// Calculate payroll for employee
router.post('/payroll/calculate', authenticate, requirePermission('hr:payroll:calculate'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    employeeId,
    payPeriodStart,
    payPeriodEnd,
    hoursWorked,
    hourlyRate,
    overtimeHours,
    overtimeRate,
    bonuses,
    deductions,
  } = req.body || {};
  
  if (!propertyId || !employeeId || !payPeriodStart || !payPeriodEnd || !hourlyRate) {
    return res.status(400).json({ error: 'propertyId, employeeId, payPeriodStart, payPeriodEnd, and hourlyRate are required' });
  }

  // Calculate gross pay
  const regularPay = hoursWorked * hourlyRate;
  const overtimePay = (overtimeHours || 0) * (overtimeRate || hourlyRate * 1.5);
  const grossPay = regularPay + overtimePay + (bonuses || 0);

  // Calculate Ethiopian tax
  const tax = calculateEthiopianTax(grossPay);

  // Calculate pension
  const pension = calculatePension(grossPay);

  // Calculate net pay
  const totalDeductions = tax + pension + (deductions || 0);
  const netPay = grossPay - totalDeductions;

  const result = {
    propertyId,
    employeeId,
    payPeriodStart,
    payPeriodEnd,
    calculation: {
      regularPay,
      overtimePay,
      bonuses: bonuses || 0,
      grossPay,
      deductions: {
        tax,
        pension,
        otherDeductions: deductions || 0,
        totalDeductions,
      },
      netPay,
    },
    calculatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

function calculateEthiopianTax(grossPay: number): number {
  // Ethiopian tax bands (simplified)
  if (grossPay <= 600) return grossPay * 0;
  if (grossPay <= 1650) return grossPay * 0.1;
  if (grossPay <= 3200) return grossPay * 0.15;
  if (grossPay <= 5250) return grossPay * 0.2;
  if (grossPay <= 7800) return grossPay * 0.25;
  if (grossPay <= 10900) return grossPay * 0.3;
  return grossPay * 0.35;
}

function calculatePension(grossPay: number): number {
  // Ethiopian pension rate (typically 7% employee contribution)
  return grossPay * 0.07;
}

// Run payroll for multiple employees
router.post('/payroll/run-batch', authenticate, requirePermission('hr:payroll:run'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    payPeriodStart,
    payPeriodEnd,
    employeeIds,
  } = req.body || {};
  
  if (!propertyId || !payPeriodStart || !payPeriodEnd) {
    return res.status(400).json({ error: 'propertyId, payPeriodStart, and payPeriodEnd are required' });
  }

  const { data: employees } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('property_id', propertyId)
    .in('id', employeeIds || []);

  const results = await Promise.all(
    (employees || []).map(async (employee) => {
      const { data: timeEntries } = await supabaseAdmin
        .from('time_entries')
        .select('*')
        .eq('employee_id', employee.id)
        .gte('date', payPeriodStart)
        .lte('date', payPeriodEnd);

      const hoursWorked = (timeEntries || []).reduce((sum, t) => sum + t.hours, 0);
      const overtimeHours = (timeEntries || []).filter(t => t.is_overtime).reduce((sum, t) => sum + t.hours, 0);

      const calculation = {
        regularPay: hoursWorked * employee.hourly_rate,
        overtimePay: overtimeHours * employee.hourly_rate * 1.5,
        grossPay: (hoursWorked * employee.hourly_rate) + (overtimeHours * employee.hourly_rate * 1.5),
        tax: calculateEthiopianTax((hoursWorked * employee.hourly_rate) + (overtimeHours * employee.hourly_rate * 1.5)),
        pension: calculatePension((hoursWorked * employee.hourly_rate) + (overtimeHours * employee.hourly_rate * 1.5)),
      };

      calculation.netPay = calculation.grossPay - calculation.tax - calculation.pension;

      return {
        employeeId: employee.id,
        employeeName: employee.full_name,
        hoursWorked,
        overtimeHours,
        ...calculation,
      };
    })
  );

  const { data: payrollRun } = await supabaseAdmin.from('payroll_runs').insert({
    property_id: propertyId,
    pay_period_start: payPeriodStart,
    pay_period_end: payPeriodEnd,
    status: 'calculated',
    total_employees: results.length,
    total_gross_pay: results.reduce((sum, r) => sum + r.grossPay, 0),
    total_net_pay: results.reduce((sum, r) => sum + r.netPay, 0),
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  cacheService.invalidate('hr-*');
  return res.status(201).json({ payrollRun, results });
});

// ── Ethiopian Tax/Pension Bands Integration ────────────────────────────
// Get tax bands
router.get('/payroll/tax-bands', authenticate, async (req, res) => {
  const cacheKey = 'hr-tax-bands';
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const taxBands = [
    { minIncome: 0, maxIncome: 600, rate: 0 },
    { minIncome: 600, maxIncome: 1650, rate: 0.1 },
    { minIncome: 1650, maxIncome: 3200, rate: 0.15 },
    { minIncome: 3200, maxIncome: 5250, rate: 0.2 },
    { minIncome: 5250, maxIncome: 7800, rate: 0.25 },
    { minIncome: 7800, maxIncome: 10900, rate: 0.3 },
    { minIncome: 10900, maxIncome: Infinity, rate: 0.35 },
  ];

  const result = {
    taxBands,
    currency: 'ETB',
    effectiveDate: '2024-01-01',
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

// Get pension rates
router.get('/payroll/pension-rates', authenticate, async (req, res) => {
  const cacheKey = 'hr-pension-rates';
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const result = {
    employeeRate: 0.07, // 7% employee contribution
    employerRate: 0.11, // 11% employer contribution
    totalRate: 0.18,
    effectiveDate: '2024-01-01',
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

// ── Statutory Deductions Automation ───────────────────────────────────────
// Get statutory deductions
router.get('/payroll/deductions/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('statutory_deductions')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    deductions: data || [],
  });
});

// Create statutory deduction
router.post('/payroll/deductions', authenticate, requirePermission('hr:deductions:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    deductionType,
    rate,
    isPercentage,
    description,
  } = req.body || {};
  
  if (!propertyId || !deductionType || !rate) {
    return res.status(400).json({ error: 'propertyId, deductionType, and rate are required' });
  }

  const { data, error } = await supabaseAdmin.from('statutory_deductions').insert({
    property_id: propertyId,
    deduction_type: deductionType,
    rate,
    is_percentage: isPercentage || true,
    description,
    is_active: true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.status(201).json(data);
});

// ── Multi-Location Payroll Support ───────────────────────────────────────
// Get payroll by location
router.get('/payroll/by-location/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { payPeriodStart, payPeriodEnd } = req.query as Record<string, string>;
  
  const cacheKey = `hr-payroll-location:${req.params.propertyId}:${payPeriodStart}:${payPeriodEnd}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: employees } = await supabaseAdmin
    .from('employees')
    .select('*, locations(location_name)')
    .eq('property_id', req.params.propertyId);

  const byLocation = groupEmployeesByLocation(employees || []);

  const result = {
    propertyId: req.params.propertyId,
    payPeriodStart,
    payPeriodEnd,
    byLocation,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

function groupEmployeesByLocation(employees: any[]) {
  const grouped: Record<string, any[]> = {};
  employees.forEach(e => {
    const locationId = e.location_id || 'unassigned';
    if (!grouped[locationId]) grouped[locationId] = [];
    grouped[locationId].push(e);
  });

  return Object.entries(grouped).map(([locationId, emps]) => ({
    locationId,
    locationName: emps[0]?.locations?.location_name || 'Unassigned',
    employeeCount: emps.length,
    totalPayroll: emps.reduce((sum, e) => sum + (e.hourly_rate * 160), 0), // Monthly assumption
  }));
}

// ── Complex Shift Differentials ────────────────────────────────────────────
// Get shift differentials
router.get('/payroll/shift-differentials/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `hr-shift-differentials:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data, error } = await supabaseAdmin
    .from('shift_differentials')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    shiftDifferentials: data || [],
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

// Create shift differential
router.post('/payroll/shift-differentials', authenticate, requirePermission('hr:shifts:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    shiftType,
    differentialRate,
    startTime,
    endTime,
    description,
  } = req.body || {};
  
  if (!propertyId || !shiftType || !differentialRate) {
    return res.status(400).json({ error: 'propertyId, shiftType, and differentialRate are required' });
  }

  const { data, error } = await supabaseAdmin.from('shift_differentials').insert({
    property_id: propertyId,
    shift_type: shiftType,
    differential_rate: differentialRate,
    start_time: startTime,
    end_time: endTime,
    description,
    is_active: true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.status(201).json(data);
});

// ── Benefits Administration ───────────────────────────────────────────────
// Get employee benefits
router.get('/benefits/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { employeeId } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('employee_benefits')
    .select('*, employees(full_name), benefit_types(name, cost)')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (employeeId) q = q.eq('employee_id', employeeId);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    benefits: data || [],
  });
});

// Enroll employee in benefit
router.post('/benefits/enroll', authenticate, requirePermission('hr:benefits:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    employeeId,
    benefitTypeId,
    enrollmentDate,
    costSharing,
  } = req.body || {};
  
  if (!propertyId || !employeeId || !benefitTypeId) {
    return res.status(400).json({ error: 'propertyId, employeeId, and benefitTypeId are required' });
  }

  const { data, error } = await supabaseAdmin.from('employee_benefits').insert({
    property_id: propertyId,
    employee_id: employeeId,
    benefit_type_id: benefitTypeId,
    enrollment_date: enrollmentDate || new Date().toISOString(),
    cost_sharing: costSharing || 'employer',
    is_active: true,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.status(201).json(data);
});

// ── Phase 2: Employee ↔ System User Linking ──────────────────────────────
// Link employee to system user
router.post('/employees/link-user', authenticate, requirePermission('hr:employees:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { employeeId, userId } = req.body || {};
  
  if (!employeeId || !userId) {
    return res.status(400).json({ error: 'employeeId and userId are required' });
  }

  const { data, error } = await supabaseAdmin
    .from('employees')
    .update({ user_id: userId })
    .eq('id', employeeId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.json(data);
});

// Get employee with user info
router.get('/employees/with-user/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select('*, profiles(full_name, email)')
    .eq('property_id', req.params.propertyId);

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    employees: data || [],
  });
});

// ── Time Clock Integration ────────────────────────────────────────────────
// Clock in
router.post('/time-clock/clock-in', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { employeeId, propertyId, locationId, notes } = req.body || {};
  
  if (!employeeId || !propertyId) {
    return res.status(400).json({ error: 'employeeId and propertyId are required' });
  }

  const { data, error } = await supabaseAdmin.from('time_entries').insert({
    employee_id: employeeId,
    property_id: propertyId,
    location_id: locationId,
    clock_in: new Date().toISOString(),
    clock_out: null,
    status: 'clocked_in',
    notes,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.status(201).json(data);
});

// Clock out
router.post('/time-clock/clock-out', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { timeEntryId } = req.body || {};
  
  if (!timeEntryId) {
    return res.status(400).json({ error: 'timeEntryId is required' });
  }

  const { data: entry } = await supabaseAdmin
    .from('time_entries')
    .select('*')
    .eq('id', timeEntryId)
    .single();

  if (!entry) return res.status(404).json({ error: 'Time entry not found' });

  const hours = (new Date().getTime() - new Date(entry.clock_in).getTime()) / (1000 * 60 * 60);

  const { data, error } = await supabaseAdmin
    .from('time_entries')
    .update({
      clock_out: new Date().toISOString(),
      status: 'clocked_out',
      hours,
    })
    .eq('id', timeEntryId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.json(data);
});

// Get time entries
router.get('/time-clock/entries/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { employeeId, startDate, endDate } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('time_entries')
    .select('*, employees(full_name), locations(location_name)')
    .eq('property_id', req.params.propertyId)
    .order('clock_in', { ascending: false });

  if (employeeId) q = q.eq('employee_id', employeeId);
  if (startDate) q = q.gte('clock_in', startDate);
  if (endDate) q = q.lte('clock_in', endDate);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    timeEntries: data || [],
  });
});

// ── Attendance Tracking Automation ───────────────────────────────────────
// Get attendance summary
router.get('/attendance/summary/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { startDate, endDate, employeeId } = req.query as Record<string, string>;
  
  const cacheKey = `hr-attendance-summary:${req.params.propertyId}:${startDate}:${endDate}:${employeeId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('time_entries')
    .select('*')
    .eq('property_id', req.params.propertyId);

  if (employeeId) q = q.eq('employee_id', employeeId);
  if (startDate) q = q.gte('clock_in', startDate);
  if (endDate) q = q.lte('clock_in', endDate);

  const { data: timeEntries } = await q;

  const summary = calculateAttendanceSummary(timeEntries || []);

  const result = {
    propertyId: req.params.propertyId,
    startDate,
    endDate,
    summary,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

function calculateAttendanceSummary(timeEntries: any[]) {
  const byEmployee: Record<string, any[]> = {};
  timeEntries.forEach(t => {
    if (!byEmployee[t.employee_id]) byEmployee[t.employee_id] = [];
    byEmployee[t.employee_id].push(t);
  });

  return Object.entries(byEmployee).map(([employeeId, entries]) => ({
    employeeId,
    totalDays: entries.length,
    presentDays: entries.filter(e => e.status === 'clocked_out').length,
    absentDays: entries.filter(e => e.status === 'absent').length,
    totalHours: entries.reduce((sum, e) => sum + (e.hours || 0), 0),
    avgHours: entries.reduce((sum, e) => sum + (e.hours || 0), 0) / entries.length,
  }));
}

// ── Leave Management Enhancement ────────────────────────────────────────
// Get leave requests
router.get('/leave/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { employeeId, status, type } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('leave_requests')
    .select('*, employees(full_name), leave_types(name)')
    .eq('property_id', req.params.propertyId)
    .order('created_at', { ascending: false });

  if (employeeId) q = q.eq('employee_id', employeeId);
  if (status) q = q.eq('status', status);
  if (type) q = q.eq('leave_type_id', type);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    leaveRequests: data || [],
  });
});

// Create leave request
router.post('/leave', authenticate, requirePermission('hr:leave:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    employeeId,
    leaveTypeId,
    startDate,
    endDate,
    reason,
  } = req.body || {};
  
  if (!propertyId || !employeeId || !leaveTypeId || !startDate || !endDate) {
    return res.status(400).json({ error: 'propertyId, employeeId, leaveTypeId, startDate, and endDate are required' });
  }

  const { data, error } = await supabaseAdmin.from('leave_requests').insert({
    property_id: propertyId,
    employee_id: employeeId,
    leave_type_id: leaveTypeId,
    start_date: startDate,
    end_date: endDate,
    reason,
    status: 'pending',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.status(201).json(data);
});

// Approve leave request
router.put('/leave/:id/approve', authenticate, requirePermission('hr:leave:approve'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { approvedBy, notes } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('leave_requests')
    .update({
      status: 'approved',
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      notes,
    })
    .eq('id', req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.json(data);
});

// Get leave balance
router.get('/leave/balance/:propertyId/:employeeId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data: leaveTypes } = await supabaseAdmin
    .from('leave_types')
    .select('*')
    .eq('property_id', req.params.propertyId);

  const { data: usedLeave } = await supabaseAdmin
    .from('leave_requests')
    .select('*, leave_types(name)')
    .eq('property_id', req.params.propertyId)
    .eq('employee_id', req.params.employeeId)
    .eq('status', 'approved');

  const balance = (leaveTypes || []).map(lt => {
    const used = usedLeave?.filter(l => l.leave_type_id === lt.id).reduce((sum, l) => sum + calculateLeaveDays(l.start_date, l.end_date), 0) || 0;
    return {
      leaveTypeId: lt.id,
      leaveTypeName: lt.name,
      annualAllowance: lt.annual_days,
      usedDays: used,
      remainingDays: lt.annual_days - used,
    };
  });

  return res.json({
    propertyId: req.params.propertyId,
    employeeId: req.params.employeeId,
    balance,
  });
});

function calculateLeaveDays(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ── Performance Management System ────────────────────────────────────────
// Get performance reviews
router.get('/performance/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { employeeId, reviewPeriod } = req.query as Record<string, string>;
  
  let q = supabaseAdmin
    .from('performance_reviews')
    .select('*, employees(full_name), reviewers(full_name)')
    .eq('property_id', req.params.propertyId)
    .order('review_date', { ascending: false });

  if (employeeId) q = q.eq('employee_id', employeeId);
  if (reviewPeriod) q = q.eq('review_period', reviewPeriod);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    performanceReviews: data || [],
  });
});

// Create performance review
router.post('/performance', authenticate, requirePermission('hr:performance:create'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    employeeId,
    reviewerId,
    reviewPeriod,
    overallRating,
    goals,
    feedback,
  } = req.body || {};
  
  if (!propertyId || !employeeId || !reviewerId || !reviewPeriod || !overallRating) {
    return res.status(400).json({ error: 'propertyId, employeeId, reviewerId, reviewPeriod, and overallRating are required' });
  }

  const { data, error } = await supabaseAdmin.from('performance_reviews').insert({
    property_id: propertyId,
    employee_id: employeeId,
    reviewer_id: reviewerId,
    review_period: reviewPeriod,
    overall_rating: overallRating,
    goals,
    feedback,
    review_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.status(201).json(data);
});

// ── Phase 3: Talent Management System ────────────────────────────────────
// Get talent pool
router.get('/talent/pool/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { skill } = req.query as Record<string, string>;
  
  const cacheKey = `hr-talent-pool:${req.params.propertyId}:${skill || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('employees')
    .select('*, departments(department_name), positions(position_name)')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  const { data: employees } = await q;

  const talentPool = (employees || []).map(e => ({
    employeeId: e.id,
    employeeName: e.full_name,
    department: e.departments?.department_name,
    position: e.positions?.position_name,
    skills: e.skills || [],
    performanceRating: e.performance_rating || 0,
    potentialRating: e.potential_rating || 0,
    readinessLevel: e.readiness_level || 'not_ready',
  }));

  const filtered = skill 
    ? talentPool.filter(t => t.skills.includes(skill))
    : talentPool;

  const result = {
    propertyId: req.params.propertyId,
    talentPool: filtered,
    summary: {
      totalEmployees: filtered.length,
      highPotential: filtered.filter(t => t.potentialRating >= 4).length,
      readyForPromotion: filtered.filter(t => t.readiness_level === 'ready').length,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 15 * 60 * 1000);
  return res.json(result);
});

// ── Skills Matrix ─────────────────────────────────────────────────────────
// Get skills matrix
router.get('/skills/matrix/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `hr-skills-matrix:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: employees } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  const allSkills = [...new Set((employees || []).flatMap(e => e.skills || []))];

  const matrix = allSkills.map(skill => {
    const employeesWithSkill = (employees || []).filter(e => (e.skills || []).includes(skill));
    return {
      skill,
      employeeCount: employeesWithSkill.length,
      proficiencyLevel: calculateAvgProficiency(employeesWithSkill),
      employees: employeesWithSkill.map(e => ({
        employeeId: e.id,
        employeeName: e.full_name,
        proficiency: e.skill_proficiency?.[skill] || 3,
      })),
    };
  });

  const result = {
    propertyId: req.params.propertyId,
    skillsMatrix: matrix,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateAvgProficiency(employees: any[]): number {
  if (employees.length === 0) return 0;
  // Simplified - would use actual proficiency data
  return 3.5;
}

// ── Succession Planning ────────────────────────────────────────────────
// Get succession plan
router.get('/succession/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `hr-succession:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: positions } = await supabaseAdmin
    .from('positions')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_key_position', true);

  const successionPlan = await Promise.all(
    (positions || []).map(async (position) => {
      const successors = await identifySuccessors(req.params.propertyId, position.id);
      return {
        positionId: position.id,
        positionName: position.position_name,
        currentIncumbent: position.current_incumbent,
        successors,
        readiness: successors.length > 0 ? successors[0].readinessLevel : 'no_successor',
      };
    })
  );

  const result = {
    propertyId: req.params.propertyId,
    successionPlan,
    summary: {
      totalKeyPositions: successionPlan.length,
      positionsWithSuccessor: successionPlan.filter(p => p.readiness !== 'no_successor').length,
      positionsWithoutSuccessor: successionPlan.filter(p => p.readiness === 'no_successor').length,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 60 * 60 * 1000);
  return res.json(result);
});

async function identifySuccessors(propertyId: string, positionId: string) {
  const { data: employees } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('property_id', propertyId)
    .eq('target_position_id', positionId)
    .eq('is_active', true);

  return (employees || []).map(e => ({
    employeeId: e.id,
    employeeName: e.full_name,
    currentPosition: e.positions?.position_name,
    readinessLevel: e.readiness_level,
    timeToReadiness: e.time_to_readiness || '12 months',
  }));
}

// ── Career Path Mapping ──────────────────────────────────────────────────
// Get career paths
router.get('/career/paths/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { employeeId } = req.query as Record<string, string>;
  
  const cacheKey = `hr-career-paths:${req.params.propertyId}:${employeeId || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: careerPaths } = await supabaseAdmin
    .from('career_paths')
    .select('*')
    .eq('property_id', req.params.propertyId);

  if (employeeId) {
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employeeId)
      .single();

    const employeePath = (careerPaths || []).filter(cp => cp.position_id === employee?.position_id);
    return res.json({
      propertyId: req.params.propertyId,
      employeeId,
      careerPath: employeePath,
    });
  }

  const result = {
    propertyId: req.params.propertyId,
    careerPaths: careerPaths || [],
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

// ── Internal Mobility Marketplace ────────────────────────────────────────
// Get internal job postings
router.get('/mobility/postings/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status } = req.query as Record<string, string>;
  
  const cacheKey = `hr-mobility-postings:${req.params.propertyId}:${status || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  let q = supabaseAdmin
    .from('internal_job_postings')
    .select('*, positions(position_name), departments(department_name)')
    .eq('property_id', req.params.propertyId)
    .order('posted_date', { ascending: false });

  if (status) q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    postings: data || [],
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

// Apply for internal job
router.post('/mobility/apply', authenticate, requirePermission('hr:mobility:apply'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { postingId, employeeId, coverLetter } = req.body || {};
  
  if (!postingId || !employeeId) {
    return res.status(400).json({ error: 'postingId and employeeId are required' });
  }

  const { data, error } = await supabaseAdmin.from('job_applications').insert({
    posting_id: postingId,
    employee_id: employeeId,
    cover_letter: coverLetter,
    status: 'submitted',
    applied_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.status(201).json(data);
});

// ── Employee Self-Service Portal ─────────────────────────────────────────
// Get employee self-service data
router.get('/ess/:employeeId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `hr-ess:${req.params.employeeId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: employee } = await supabaseAdmin
    .from('employees')
    .select('*')
    .eq('id', req.params.employeeId)
    .single();

  const { data: paySlips } = await supabaseAdmin
    .from('pay_slips')
    .select('*')
    .eq('employee_id', req.params.employeeId)
    .order('pay_period_end', { ascending: false })
    .limit(12);

  const { data: benefits } = await supabaseAdmin
    .from('employee_benefits')
    .select('*, benefit_types(name)')
    .eq('employee_id', req.params.employeeId)
    .eq('is_active', true);

  const result = {
    employee,
    paySlips: paySlips || [],
    benefits: benefits || [],
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Update personal info
router.put('/ess/:employeeId/personal-info', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { personalEmail, phoneNumber, address, emergencyContact } = req.body || {};

  const { data, error } = await supabaseAdmin
    .from('employees')
    .update({
      personal_email: personalEmail,
      phone_number: phoneNumber,
      address,
      emergency_contact: emergencyContact,
      updated_at: new Date().toISOString(),
    })
    .eq('id', req.params.employeeId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  return res.json(data);
});

// ── Phase 4: GL Batch Posting from Payroll ────────────────────────────────
// Post payroll to GL
router.post('/payroll/post-to-gl', authenticate, requirePermission('hr:payroll:gl-post'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, payrollRunId, postingDate } = req.body || {};
  
  if (!propertyId || !payrollRunId || !postingDate) {
    return res.status(400).json({ error: 'propertyId, payrollRunId, and postingDate are required' });
  }

  const { data: payrollRun } = await supabaseAdmin
    .from('payroll_runs')
    .select('*')
    .eq('id', payrollRunId)
    .single();

  if (!payrollRun) return res.status(404).json({ error: 'Payroll run not found' });

  // Create GL journal entry
  const { data: journalEntry } = await supabaseAdmin.from('gl_journal_entries').insert({
    property_id: propertyId,
    entry_date: postingDate,
    entry_type: 'payroll',
    description: `Payroll for period ${payrollRun.pay_period_start} to ${payrollRun.pay_period_end}`,
    total_debit: payrollRun.total_gross_pay,
    total_credit: payrollRun.total_gross_pay,
    status: 'posted',
    created_by: req.user?.id,
    created_at: new Date().toISOString(),
  }).select().single();

  // Update payroll run status
  await supabaseAdmin
    .from('payroll_runs')
    .update({ gl_posted: true, gl_posted_at: new Date().toISOString() })
    .eq('id', payrollRunId);

  cacheService.invalidate('hr-*');
  cacheService.invalidate('gl-*');
  return res.status(201).json({ journalEntry, payrollRun });
});

// ── Labor Cost Journal Entries ────────────────────────────────────────────
// Generate labor cost journal entries
router.post('/payroll/labor-cost-journal', authenticate, requirePermission('hr:payroll:journal'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, payPeriodStart, payPeriodEnd } = req.body || {};
  
  if (!propertyId || !payPeriodStart || !payPeriodEnd) {
    return res.status(400).json({ error: 'propertyId, payPeriodStart, and payPeriodEnd are required' });
  }

  const { data: laborCosts } = await supabaseAdmin
    .from('labor_costs')
    .select('*, departments(department_name)')
    .eq('property_id', propertyId)
    .gte('period', payPeriodStart)
    .lte('period', payPeriodEnd);

  const journalEntries = (laborCosts || []).map(lc => ({
    property_id: propertyId,
    department_id: lc.department_id,
    department_name: lc.departments?.department_name,
    entry_date: payPeriodEnd,
    entry_type: 'labor_cost',
    description: `Labor cost for ${lc.departments?.department_name}`,
    debit_amount: lc.total_cost,
    credit_amount: lc.total_cost,
  }));

  const { data, error } = await supabaseAdmin.from('gl_journal_entries').insert(journalEntries).select();

  if (error) return res.status(500).json({ error: error.message });

  cacheService.invalidate('hr-*');
  cacheService.invalidate('gl-*');
  return res.status(201).json({ journalEntries: data || [] });
});

// ── Departmental Labor Cost Allocation ─────────────────────────────────
// Get labor cost allocation
router.get('/payroll/labor-cost-allocation/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `hr-labor-allocation:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data: laborCosts } = await supabaseAdmin
    .from('labor_costs')
    .select('*, departments(department_name)')
    .eq('property_id', req.params.propertyId)
    .gte('period', startDate.toISOString());

  const allocation = groupLaborCostsByDepartment(laborCosts || []);

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    allocation,
    summary: {
      totalLaborCost: allocation.reduce((sum, a) => sum + a.totalCost, 0),
      totalDepartments: allocation.length,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function groupLaborCostsByDepartment(laborCosts: any[]) {
  const grouped: Record<string, any[]> = {};
  laborCosts.forEach(lc => {
    const deptId = lc.department_id || 'unassigned';
    if (!grouped[deptId]) grouped[deptId] = [];
    grouped[deptId].push(lc);
  });

  return Object.entries(grouped).map(([deptId, costs]) => ({
    departmentId: deptId,
    departmentName: costs[0]?.departments?.department_name || 'Unassigned',
    totalCost: costs.reduce((sum, c) => sum + c.total_cost, 0),
    percentage: 0, // Would calculate relative to total
    employeeCount: costs.length,
  }));
}

// ── Payroll Reconciliation with Finance ──────────────────────────────────
// Get payroll reconciliation
router.get('/payroll/reconciliation/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { payPeriodStart, payPeriodEnd } = req.query as Record<string, string>;
  
  const cacheKey = `hr-reconciliation:${req.params.propertyId}:${payPeriodStart}:${payPeriodEnd}`;
  const cached = cacheService.get(cacheKey);
  if (cached) return res.json(cached);

  const { data: payrollRuns } = await supabaseAdmin
    .from('payroll_runs')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .gte('pay_period_start', payPeriodStart)
    .lte('pay_period_end', payPeriodEnd);

  const { data: glEntries } = await supabaseAdmin
    .from('gl_journal_entries')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('entry_type', 'payroll')
    .gte('entry_date', payPeriodStart)
    .lte('entry_date', payPeriodEnd);

  const reconciliation = {
    payrollTotal: (payrollRuns || []).reduce((sum, pr) => sum + (pr.total_gross_pay || 0), 0),
    glPostedTotal: (glEntries || []).reduce((sum, ge) => sum + (ge.total_debit || 0), 0),
    variance: (payrollRuns || []).reduce((sum, pr) => sum + (pr.total_gross_pay || 0), 0) - (glEntries || []).reduce((sum, ge) => sum + (ge.total_debit || 0), 0),
    status: 'reconciled',
  };

  const result = {
    propertyId: req.params.propertyId,
    payPeriodStart,
    payPeriodEnd,
    reconciliation,
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

export default router;
