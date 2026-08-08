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
  Search,
  Building2,
  UserCheck,
  DollarSign,
  TrendingUp,
  Heart,
  MessageSquare,
  FolderOpen,
  FileText,
  Settings
} from 'lucide-react';
import HRDashboard from './HRDashboard';
import EmployeeDirectory from './EmployeeDirectory';
import AttendanceManagement from './AttendanceManagement';
import PayrollEngine from './PayrollEngine';
import LeaveManagement from './LeaveManagement';
import PerformanceManagement from './PerformanceManagement';
import TrainingDevelopment from './TrainingDevelopment';
import RecruitmentFlow from './RecruitmentFlow';
import OrganizationManagement from './OrganizationManagement';
import EmployeeSelfService from './EmployeeSelfService';
import ManagerSelfService from './ManagerSelfService';
import ShiftRostering from './ShiftRostering';
import TimeOvertime from './TimeOvertime';
import CompensationBenefits from './CompensationBenefits';
import CareerSuccession from './CareerSuccession';
import HealthSafety from './HealthSafety';
import EmployeeRelations from './EmployeeRelations';
import DocumentManagement from './DocumentManagement';
import WorkflowApprovals from './WorkflowApprovals';
import ReportsAnalytics from './ReportsAnalytics';
import HRConfiguration from './HRConfiguration';
import Onboarding from './Onboarding';
import ApplicantTracking from './ApplicantTracking';
import LearningDevelopment from './LearningDevelopment';

const HumanResourcesPortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {

  return (
    <div className="flex flex-col h-full font-sans">
      <div className="flex-1 min-w-0 px-1">
        {activeModule === 'dashboard' && <HRDashboard />}
        {activeModule === 'organization' && <OrganizationManagement />}
        {activeModule === 'employees' && <EmployeeDirectory />}
        {activeModule === 'recruitment' && <RecruitmentFlow />}
        {activeModule === 'ats' && <ApplicantTracking />}
        {activeModule === 'onboarding' && <Onboarding />}
        {activeModule === 'ess' && <EmployeeSelfService />}
        {activeModule === 'mss' && <ManagerSelfService />}
        {activeModule === 'attendance' && <AttendanceManagement />}
        {activeModule === 'shifts' && <ShiftRostering />}
        {activeModule === 'leave' && <LeaveManagement />}
        {activeModule === 'overtime' && <TimeOvertime />}
        {activeModule === 'payroll' && <PayrollEngine />}
        {activeModule === 'compensation' && <CompensationBenefits />}
        {activeModule === 'performance' && <PerformanceManagement />}
        {activeModule === 'learning' && <LearningDevelopment />}
        {activeModule === 'training' && <TrainingDevelopment />}
        {activeModule === 'career' && <CareerSuccession />}
        {activeModule === 'health' && <HealthSafety />}
        {activeModule === 'relations' && <EmployeeRelations />}
        {activeModule === 'documents' && <DocumentManagement />}
        {activeModule === 'workflow' && <WorkflowApprovals />}
        {activeModule === 'analytics' && <ReportsAnalytics />}
        {activeModule === 'configuration' && <HRConfiguration />}
      </div>
    </div>
  );
};

export default HumanResourcesPortal;
