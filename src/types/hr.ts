
export type EmploymentStatus = 'Active' | 'Probation' | 'Contract' | 'Temporary' | 'Resigned' | 'Terminated' | 'Retired';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave' | 'Holiday' | 'Off Day';

export interface Employee {
  id: string;
  employeeNumber: string;
  fullName: string;
  photo?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  nationality: string;
  phone: string;
  email: string;
  department: string;
  position: string;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  hireDate: string;
  status: EmploymentStatus;
  reportingManagerId?: string;
  salaryGrade?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  status: AttendanceStatus;
  overtimeHours: number;
  lateMinutes: number;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Annual' | 'Sick' | 'Emergency' | 'Maternity' | 'Paternity' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  requestedAt: string;
  approvedBy?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  overtimeAmount: number;
  allowances: number;
  bonuses: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: 'Draft' | 'Processed' | 'Paid';
}

export interface TrainingSession {
  id: string;
  title: string;
  type: 'Orientation' | 'Customer Service' | 'Safety' | 'Technical' | 'Leadership';
  date: string;
  duration: string;
  location: string;
  trainer: string;
  attendeesCount: number;
  status: 'Scheduled' | 'Completed' | 'Cancelled';
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  reviewerId: string;
  date: string;
  score: number; // 1-5 or 1-100
  comments: string;
  kpis: {
    name: string;
    target: number;
    actual: number;
  }[];
}
