import React, { useState } from 'react';
import { 
  DollarSign, 
  Shield, 
  Heart, 
  Home, 
  Utensils, 
  Car, 
  GraduationCap,
  Plus,
  Edit,
  Search,
  Filter,
  TrendingUp,
  Users,
  FileText,
  CheckCircle2
} from 'lucide-react';

const CompensationBenefits = () => {
  const [activeTab, setActiveTab] = useState<'salary' | 'benefits' | 'insurance' | 'allowances'>('salary');

  const salaryStructure = [
    { 
      id: 'GRD-001', 
      grade: 'Executive', 
      level: 'E1',
      minSalary: 120000, 
      maxSalary: 180000, 
      midpoint: 150000,
      positions: 5,
      employees: 5
    },
    { 
      id: 'GRD-002', 
      grade: 'Senior Management', 
      level: 'SM1',
      minSalary: 85000, 
      maxSalary: 120000, 
      midpoint: 102500,
      positions: 12,
      employees: 10
    },
    { 
      id: 'GRD-003', 
      grade: 'Management', 
      level: 'M1',
      minSalary: 65000, 
      maxSalary: 85000, 
      midpoint: 75000,
      positions: 25,
      employees: 22
    },
    { 
      id: 'GRD-004', 
      grade: 'Senior Staff', 
      level: 'SS1',
      minSalary: 45000, 
      maxSalary: 65000, 
      midpoint: 55000,
      positions: 45,
      employees: 40
    },
    { 
      id: 'GRD-005', 
      grade: 'Staff', 
      level: 'S1',
      minSalary: 32000, 
      maxSalary: 45000, 
      midpoint: 38500,
      positions: 161,
      employees: 151
    },
  ];

  const benefitPlans = [
    { 
      id: 'BP-001', 
      name: 'Medical Insurance', 
      type: 'Health',
      description: 'Comprehensive medical coverage for employees and dependents',
      coverage: 'Employee + Family',
      employerContribution: 80,
      employeeContribution: 20,
      enrolled: 198,
      eligible: 248,
      status: 'Active'
    },
    { 
      id: 'BP-002', 
      name: 'Life Insurance', 
      type: 'Life',
      description: 'Group life insurance with 3x annual salary coverage',
      coverage: '3x Salary',
      employerContribution: 100,
      employeeContribution: 0,
      enrolled: 248,
      eligible: 248,
      status: 'Active'
    },
    { 
      id: 'BP-003', 
      name: 'Retirement Plan', 
      type: 'Retirement',
      description: '401(k) with employer matching up to 5%',
      coverage: 'Voluntary',
      employerContribution: 5,
      employeeContribution: 5,
      enrolled: 185,
      eligible: 248,
      status: 'Active'
    },
  ];

  const allowances = [
    { 
      id: 'ALL-001', 
      name: 'Housing Allowance', 
      type: 'Monthly',
      amount: 500,
      eligibleEmployees: 45,
      description: 'Monthly housing stipend for eligible positions'
    },
    { 
      id: 'ALL-002', 
      name: 'Transportation Allowance', 
      type: 'Monthly',
      amount: 150,
      eligibleEmployees: 120,
      description: 'Transportation reimbursement for commuting'
    },
    { 
      id: 'ALL-003', 
      name: 'Meal Allowance', 
      type: 'Daily',
      amount: 25,
      eligibleEmployees: 200,
      description: 'Daily meal allowance for working shifts'
    },
    { 
      id: 'ALL-004', 
      name: 'Uniform Allowance', 
      type: 'Annual',
      amount: 300,
      eligibleEmployees: 248,
      description: 'Annual uniform replacement allowance'
    },
  ];

  const additionalBenefits = [
    { 
      id: 'AB-001', 
      name: 'Staff Accommodation', 
      type: 'Housing',
      available: 45,
      occupied: 42,
      waitingList: 18,
      status: 'Available'
    },
    { 
      id: 'AB-002', 
      name: 'Staff Meals', 
      type: 'Food',
      description: 'Complimentary meals during working hours',
      coverage: 'All Staff',
      status: 'Active'
    },
    { 
      id: 'AB-003', 
      name: 'Transportation Benefits', 
      type: 'Transport',
      description: 'Shuttle service for staff accommodation',
      coverage: 'Accommodation Residents',
      status: 'Active'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Compensation & Benefits</h2>
          <p className="text-sm text-slate-500 mt-1">Manage salary structures, benefit plans, and employee allowances</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            Add Benefit
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Payroll', value: '$842K', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Benefit Enrollment', value: '85%', icon: Shield, color: 'text-indigo-500' },
          { label: 'Avg. Salary', value: '$42.5K', icon: TrendingUp, color: 'text-purple-500' },
          { label: 'Benefits Cost', value: '$125K', icon: Heart, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-xs font-medium text-slate-500 leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'salary', label: 'Salary Structure', icon: DollarSign },
          { id: 'benefits', label: 'Benefit Plans', icon: Shield },
          { id: 'insurance', label: 'Insurance', icon: Heart },
          { id: 'allowances', label: 'Allowances', icon: FileText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Salary Structure Tab */}
      {activeTab === 'salary' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Salary Structure</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Add Grade
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Grade</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Level</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Min Salary</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Midpoint</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Max Salary</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Positions</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Employees</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {salaryStructure.map((grade) => (
                <tr key={grade.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{grade.grade}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                      {grade.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                    ${grade.minSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-white">
                    ${grade.midpoint.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-500">
                    ${grade.maxSalary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {grade.positions}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {grade.employees}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Benefit Plans Tab */}
      {activeTab === 'benefits' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Benefit Plans</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Add Plan
              </button>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {benefitPlans.map((plan) => (
              <div key={plan.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.type === 'Health' ? 'bg-rose-100 text-rose-600' :
                    plan.type === 'Life' ? 'bg-blue-100 text-blue-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    {plan.type === 'Health' && <Heart size={20} />}
                    {plan.type === 'Life' && <Shield size={20} />}
                    {plan.type === 'Retirement' && <GraduationCap size={20} />}
                  </div>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium uppercase">
                    {plan.status}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{plan.name}</h4>
                <p className="text-xs font-medium text-slate-400 mb-3">{plan.description}</p>
                
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Coverage</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{plan.coverage}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Employer</span>
                    <span className="font-semibold text-emerald-600">{plan.employerContribution}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-400">Employee</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{plan.employeeContribution}%</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-slate-400">Enrollment</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">
                      {plan.enrolled}/{plan.eligible}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-indigo-500" style={{ width: `${(plan.enrolled/plan.eligible)*100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Insurance Tab */}
      {activeTab === 'insurance' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-50 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Additional Benefits</h3>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {additionalBenefits.map((benefit) => (
                <div key={benefit.id} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      benefit.type === 'Housing' ? 'bg-blue-100 text-blue-600' :
                      benefit.type === 'Food' ? 'bg-amber-100 text-amber-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {benefit.type === 'Housing' && <Home size={20} />}
                      {benefit.type === 'Food' && <Utensils size={20} />}
                      {benefit.type === 'Transport' && <Car size={20} />}
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      benefit.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {benefit.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{benefit.name}</h4>
                  <p className="text-xs font-medium text-slate-400 mb-3">{benefit.description}</p>
                  
                  {benefit.type === 'Housing' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-400">Available</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{benefit.available}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-400">Occupied</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{benefit.occupied}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-400">Waiting List</span>
                        <span className="font-semibold text-amber-600">{benefit.waitingList}</span>
                      </div>
                    </div>
                  )}

                  {benefit.type !== 'Housing' && (
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-slate-400">Coverage</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{benefit.coverage}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Allowances Tab */}
      {activeTab === 'allowances' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Allowances</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Add Allowance
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Allowance</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-right">Amount</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Eligible Employees</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Description</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {allowances.map((allowance) => (
                <tr key={allowance.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <FileText className="text-indigo-600 dark:text-indigo-400" size={14} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{allowance.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {allowance.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-xs font-bold text-slate-900 dark:text-white">
                    ${allowance.amount}
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-slate-900 dark:text-white">
                    {allowance.eligibleEmployees}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-xs truncate">{allowance.description}</td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
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

export default CompensationBenefits;
