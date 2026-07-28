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
import PayrollEngine from './PayrollEngine';
import LeaveManagement from './LeaveManagement';
import PerformanceManagement from './PerformanceManagement';
import TrainingDevelopment from './TrainingDevelopment';
import RecruitmentFlow from './RecruitmentFlow';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';
import { StandardHRReports } from './StandardHRReports';

const HumanResourcesPortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="flex-1 min-w-0 px-1">
        {activeModule === 'dashboard' && <HRDashboard />}
        {activeModule === 'employees' && <EmployeeDirectory />}
        {activeModule === 'attendance' && <AttendanceManagement />}
        {activeModule === 'payroll' && <PayrollEngine />}
        {activeModule === 'leave' && <LeaveManagement />}
        {activeModule === 'performance' && <PerformanceManagement />}
        {activeModule === 'training' && <TrainingDevelopment />}
        {activeModule === 'recruitment' && <RecruitmentFlow />}
        {activeModule === 'reports' && <DepartmentReportsModule departmentName="HR" />}
        {activeModule === 'standard-reports' && <StandardHRReports />}
      </div>
    </div>
  );
};

export default HumanResourcesPortal;
