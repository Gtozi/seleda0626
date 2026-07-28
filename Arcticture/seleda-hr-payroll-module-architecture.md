# SELEDA ERP — HR & Payroll Module
### Architecture Base Prompt

> Module: Support / Compliance
> Portal type: Operational + Executive summary feed
> Companion modules: Finance & Accounting Portal, System Admin Portal, Executive Portal

---

### 1. Purpose & Scope
Manages employee records, attendance/shift scheduling, leave, and payroll calculation compliant with Ethiopian labor law and tax withholding — with the payroll journal posting into the Finance GL as a labor cost batch.

**In scope (Phase 1 base):**
- Employee master record and department/role assignment
- Attendance and shift scheduling
- Leave management (annual, sick, maternity/paternity per Ethiopian labor law)
- Payroll calculation (basic salary, allowances, overtime, deductions, income tax, pension)
- Payslip generation
- GL posting of payroll batch to Finance

**Explicitly out of scope for base (later phases):**
- Biometric time clock hardware integration — manual/self-reported attendance in Phase 1
- Performance review / appraisal workflow
- Recruitment/applicant tracking

---

### 2. Core Data Model
```
Employee
├── EmployeeID, Name, Department, Role, HireDate, EmploymentType (Permanent|Contract|Casual), BankAccount, TIN, PensionNumber, Status (Active|OnLeave|Terminated)

ShiftSchedule
├── ScheduleID, EmployeeID, Date, ShiftType, Department, Status (Scheduled|Worked|Absent|Leave)

AttendanceRecord
├── RecordID, EmployeeID, Date, ClockIn, ClockOut, HoursWorked, OvertimeHours

LeaveRequest
├── RequestID, EmployeeID, Type (Annual|Sick|Maternity|Paternity|Unpaid), StartDate, EndDate, Status (Requested|Approved|Rejected), BalanceAtRequest

PayrollRun
├── RunID, Period, Status (Draft|Approved|Posted), Lines[]
└── PayrollLine
    ├── EmployeeID, BasicSalary, Allowances, OvertimePay, GrossPay, IncomeTaxWithheld, PensionContribution(Employee+Employer), OtherDeductions, NetPay

Payslip
├── PayslipID, EmployeeID, RunID, IssuedDate, Format (PDF)
```

---

### 3. Module Breakdown

**Employee Records**
- Master record with department/role, employment type, statutory IDs (TIN, pension number)
- Status lifecycle: Active → OnLeave → Terminated, with termination triggering final settlement calc

**Attendance & Scheduling**
- Shift schedule creation by department (ties to Front Office/F&B/Housekeeping staffing needs)
- Attendance capture (manual entry in Phase 1), overtime hour flagging above standard threshold

**Leave Management**
- Leave type balances accrue per Ethiopian labor law entitlements; request/approval workflow
- Leave balance visible to employee and department manager; blocks payroll deduction errors

**Payroll Calculation**
- Gross pay = basic + allowances + overtime
- Statutory deductions: progressive income tax bands, employee/employer pension contribution (7%/11% typical structure — configurable), other deductions (loans, advances)
- Draft → review → approve → post workflow, mirroring Finance period-close discipline
- Payroll batch posts as a single labor cost journal to Finance GL (module interfaces with Finance, does not own the GL)

**Payslip & Statutory Reporting**
- Payslip generation per employee per run
- Exportable pension and income tax withholding summary for statutory filing (filed externally, no direct e-filing integration in Phase 1)

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Department Manager | Approve leave for own team, view attendance/schedule |
| HR Officer | Employee record maintenance, leave balance admin, payroll data entry |
| HR/Payroll Manager | Approve payroll run, generate payslips, statutory report export |
| Finance (cross-module) | Receive posted payroll journal batch, no edit rights to HR records |
| Employee (self-service, later phase) | View own payslip/leave balance — stub only in base |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Finance & Accounting Portal | Outbound | Payroll journal batch (labor cost by department) |
| System Admin Portal | Bidirectional | Role/user account linkage, department config |
| Executive Portal | Outbound | Headcount, labor cost %, attendance/overtime summary |
| Department schedules (Front Office/F&B/Housekeeping) | Inbound | Staffing/shift needs feeding into scheduling |

---

### 6. Non-Functional Requirements
- **Compliance**: payroll tax bands and pension rates configurable, since Ethiopian statutory rates change periodically
- **Auditability**: payroll run approval chain and any post-approval adjustment logged
- **Data sensitivity**: employee salary and personal data access restricted to HR/Payroll and Finance roles only
- **Localization**: payslips and leave forms in English + Amharic/Tigrinya

---

### 7. Suggested Build Sequence
1. Employee master record
2. Attendance & shift scheduling
3. Leave management
4. Payroll calculation engine (gross-to-net with statutory deductions)
5. Payroll approval workflow + GL posting to Finance
6. Payslip generation
7. Statutory report export (tax/pension summaries)

---

*Base architecture prompt — extend with confirmed tax bands, pension rates, and actual department staffing structure.*
