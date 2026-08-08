import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  DollarSign, 
  FileText, 
  Clock, 
  GraduationCap, 
  FolderOpen,
  CreditCard,
  Bell,
  Settings,
  Edit,
  Download,
  Plus,
  Search,
  Filter,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const EmployeeSelfService = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'payslips' | 'leave' | 'attendance' | 'expenses' | 'training' | 'documents'>('profile');

  const employeeProfile = {
    id: 'EMP-001',
    employeeNumber: 'H-1024',
    fullName: 'Sarah Johnson',
    email: 's.johnson@masterhotel.com',
    phone: '+1 234 567 8901',
    department: 'Front Office',
    position: 'Front Office Manager',
    hireDate: '2021-03-12',
    status: 'Active',
    employmentType: 'Full-time',
    dateOfBirth: '1988-06-15',
    gender: 'Female',
    nationality: 'American',
    address: '123 Main Street, New York, NY 10001',
    emergencyContact: {
      name: 'Michael Johnson',
      relationship: 'Spouse',
      phone: '+1 234 567 8902'
    },
    bankDetails: {
      bankName: 'First National Bank',
      accountNumber: '****4567',
      routingNumber: '****9876'
    }
  };

  const payslips = [
    { id: 'PSL-001', period: 'June 2024', payDate: '2024-06-28', grossPay: 5850, netPay: 4200, status: 'Available' },
    { id: 'PSL-002', period: 'May 2024', payDate: '2024-05-28', grossPay: 5850, netPay: 4200, status: 'Available' },
    { id: 'PSL-003', period: 'April 2024', payDate: '2024-04-28', grossPay: 5850, netPay: 4200, status: 'Available' },
    { id: 'PSL-004', period: 'March 2024', payDate: '2024-03-28', grossPay: 5850, netPay: 4200, status: 'Available' },
  ];

  const leaveBalances = [
    { type: 'Annual Leave', total: 21, used: 7, remaining: 14, color: 'bg-indigo-500' },
    { type: 'Sick Leave', total: 10, used: 2, remaining: 8, color: 'bg-rose-500' },
    { type: 'Emergency Leave', total: 5, used: 1, remaining: 4, color: 'bg-amber-500' },
    { type: 'Compensatory', total: 0, used: 0, remaining: 0, color: 'bg-emerald-500' },
  ];

  const leaveRequests = [
    { id: 'LR-001', type: 'Annual', startDate: '2024-06-05', endDate: '2024-06-12', days: 7, status: 'Pending', reason: 'Family vacation' },
    { id: 'LR-002', type: 'Sick', startDate: '2024-05-15', endDate: '2024-05-15', days: 1, status: 'Approved', reason: 'Medical appointment' },
  ];

  const attendanceRecords = [
    { date: '2024-06-28', checkIn: '07:52 AM', checkOut: '04:15 PM', hours: 8.4, status: 'Present' },
    { date: '2024-06-27', checkIn: '07:48 AM', checkOut: '04:10 PM', hours: 8.4, status: 'Present' },
    { date: '2024-06-26', checkIn: '08:05 AM', checkOut: '04:20 PM', hours: 8.3, status: 'Late' },
    { date: '2024-06-25', checkIn: '---', checkOut: '---', hours: 0, status: 'Absent' },
  ];

  const expenseClaims = [
    { id: 'EXP-001', type: 'Travel', amount: 150, date: '2024-06-20', status: 'Approved', description: 'Client meeting travel' },
    { id: 'EXP-002', type: 'Meals', amount: 85, date: '2024-06-18', status: 'Pending', description: 'Business lunch with suppliers' },
  ];

  const trainingRequests = [
    { id: 'TR-001', course: 'Leadership Excellence', startDate: '2024-07-10', endDate: '2024-07-12', status: 'Approved' },
    { id: 'TR-002', course: 'Advanced Customer Service', startDate: '2024-08-05', endDate: '2024-08-05', status: 'Pending' },
  ];

  const documents = [
    { id: 'DOC-001', name: 'Employment Contract', type: 'Contract', date: '2021-03-12', status: 'Active' },
    { id: 'DOC-002', name: 'Employee Handbook 2024', type: 'Policy', date: '2024-01-01', status: 'Current' },
    { id: 'DOC-003', name: 'Non-Disclosure Agreement', type: 'NDA', date: '2021-03-12', status: 'Active' },
    { id: 'DOC-004', name: 'Safety Training Certificate', type: 'Certificate', date: '2023-11-20', status: 'Valid' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Self-Service</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage your profile, payslips, leave, and requests</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-sm font-medium">
            <Settings size={16} />
            Settings
          </button>
        </div>
      </div>

      {/* Employee Info Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <User className="text-indigo-600 dark:text-indigo-400" size={32} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{employeeProfile.fullName}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">{employeeProfile.position} • {employeeProfile.department}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Employee ID: {employeeProfile.employeeNumber}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-semibold uppercase">
              {employeeProfile.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'profile', label: 'Profile', icon: User },
          { id: 'payslips', label: 'Payslips', icon: DollarSign },
          { id: 'leave', label: 'Leave', icon: Calendar },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'expenses', label: 'Expenses', icon: CreditCard },
          { id: 'training', label: 'Training', icon: GraduationCap },
          { id: 'documents', label: 'Documents', icon: FolderOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <div className="text-center mb-6">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl mx-auto mb-4 flex items-center justify-center text-3xl font-semibold text-slate-400 ring-4 ring-slate-50/50 dark:ring-slate-800/30">
                {employeeProfile.fullName.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{employeeProfile.fullName}</h3>
              <p className="text-sm text-slate-500">{employeeProfile.position}</p>
              <div className="flex justify-center gap-2 mt-3">
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-medium">
                  {employeeProfile.status}
                </span>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-medium">
                  {employeeProfile.employmentType}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Employee ID</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.employeeNumber}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Department</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.department}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-xs font-medium text-slate-500 mb-1">Hire Date</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.hireDate}</p>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-indigo-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
              <Edit size={14} />
              Update Profile
            </button>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Email</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.phone}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Date of Birth</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.dateOfBirth}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Gender</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.gender}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Nationality</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.nationality}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Address</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.address}</p>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Emergency Contact</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Name</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.emergencyContact.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Relationship</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.emergencyContact.relationship}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Phone</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Bank Details</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Bank Name</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Account Number</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.bankDetails.accountNumber}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Routing Number</p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{employeeProfile.bankDetails.routingNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payslips Tab */}
      {activeTab === 'payslips' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payslips</h3>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm font-medium flex items-center gap-2">
                <Download size={14} />
                Tax Forms
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Period</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Pay Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Gross Pay</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Net Pay</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {payslips.map((payslip) => (
                <tr key={payslip.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{payslip.period}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{payslip.payDate}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    ${payslip.grossPay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-emerald-600">
                    ${payslip.netPay.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                      {payslip.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Leave Tab */}
      {activeTab === 'leave' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Leave Balances */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6">Leave Balances</h3>
              <div className="space-y-4">
                {leaveBalances.map((balance) => (
                  <div key={balance.type} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-500">{balance.type}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{balance.remaining} / {balance.total}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${balance.color}`} style={{ width: `${(balance.remaining/balance.total)*100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full py-3 bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-2 hover:bg-indigo-700 transition">
              <Plus size={14} />
              Request Leave
            </button>
          </div>

          {/* Leave Requests */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Leave Requests</h3>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Type</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Period</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Days</th>
                  <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {leaveRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.type}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {request.startDate} - {request.endDate}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                      {request.days}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        request.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 
                        request.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Attendance Records</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search by date..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Check-In</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Check-Out</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Hours</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {attendanceRecords.map((record) => (
                <tr key={record.date} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{record.date}</span>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {record.checkIn}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {record.checkOut}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {record.hours}h
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                      record.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Expense Claims</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              New Claim
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {expenseClaims.map((claim) => (
                <tr key={claim.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{claim.type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{claim.description}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{claim.date}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 dark:text-white">
                    ${claim.amount}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      claim.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {claim.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Training Tab */}
      {activeTab === 'training' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Training Requests</h3>
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
              <Plus size={14} />
              Request Training
            </button>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Course</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Start Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">End Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {trainingRequests.map((request) => (
                <tr key={request.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{request.course}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.startDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{request.endDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      request.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {request.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white uppercase tracking-tight">Company Documents</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Document Name</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 tracking-widest text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="text-indigo-600 dark:text-indigo-400" size={14} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.date}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition">
                        <Download size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeSelfService;
