import React, { useState } from 'react';
import { 
  Users, 
  BarChart3, 
  Clock, 
  Calendar, 
  CreditCard, 
  FileSpreadsheet, 
  GraduationCap, 
  Target, 
  ShieldAlert, 
  Briefcase,
  ChevronRight,
  Bell,
  Search
} from 'lucide-react';
import HRDashboard from './HRDashboard';
import EmployeeDirectory from './EmployeeDirectory';
import AttendanceManagement from './AttendanceManagement';
import PayrollManagement from './PayrollManagement';
import LeaveManagement from './LeaveManagement';
import PerformanceManagement from './PerformanceManagement';
import TrainingDevelopment from './TrainingDevelopment';
import RecruitmentFlow from './RecruitmentFlow';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';

const HumanResourcesPortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="flex-1 min-w-0 px-1">
        {activeModule === 'dashboard' && <HRDashboard />}
        {activeModule === 'employees' && <EmployeeDirectory />}
        {activeModule === 'attendance' && <AttendanceManagement />}
        {activeModule === 'payroll' && <PayrollManagement />}
        {activeModule === 'leave' && <LeaveManagement />}
        {activeModule === 'performance' && <PerformanceManagement />}
        {activeModule === 'training' && <TrainingDevelopment />}
        {activeModule === 'recruitment' && <RecruitmentFlow />}
        {activeModule === 'reports' && <DepartmentReportsModule departmentName="HR" />}
      </div>
    </div>
  );
};

export default HumanResourcesPortal;
