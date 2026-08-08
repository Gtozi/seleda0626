import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  Plus, 
  Download,
  LayoutGrid,
  List
} from 'lucide-react';
import { Employee } from '../../types/hr';

const EmployeeDirectory = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const employees: Employee[] = [
    { 
      id: 'EMP-001', 
      employeeNumber: 'H-1024', 
      fullName: 'Sarah Johnson', 
      department: 'Front Office', 
      position: 'Front Office Manager', 
      hireDate: '2021-03-12', 
      status: 'Active', 
      gender: 'Female', 
      nationality: 'American', 
      phone: '+1 234 567 8901', 
      email: 's.johnson@masterhotel.com',
      employmentType: 'Full-time',
      dateOfBirth: '1988-06-15'
    },
    { 
      id: 'EMP-002', 
      employeeNumber: 'H-1025', 
      fullName: 'Robert Wilson', 
      department: 'Engineering', 
      position: 'Chief Engineer', 
      hireDate: '2020-11-05', 
      status: 'Active', 
      gender: 'Male', 
      nationality: 'British', 
      phone: '+1 234 567 8902', 
      email: 'r.wilson@masterhotel.com',
      employmentType: 'Full-time',
      dateOfBirth: '1982-09-22'
    },
    { 
      id: 'EMP-003', 
      employeeNumber: 'H-1026', 
      fullName: 'Elena Martinez', 
      department: 'F&B', 
      position: 'Executive Chef', 
      hireDate: '2022-01-20', 
      status: 'Active', 
      gender: 'Female', 
      nationality: 'Spanish', 
      phone: '+1 234 567 8903', 
      email: 'e.martinez@masterhotel.com',
      employmentType: 'Full-time',
      dateOfBirth: '1990-02-14'
    },
    { 
      id: 'EMP-004', 
      employeeNumber: 'H-1027', 
      fullName: 'James Chen', 
      department: 'Housekeeping', 
      position: 'Executive Housekeeper', 
      hireDate: '2019-05-15', 
      status: 'Active', 
      gender: 'Male', 
      nationality: 'Chinese', 
      phone: '+1 234 567 8904', 
      email: 'j.chen@masterhotel.com',
      employmentType: 'Full-time',
      dateOfBirth: '1985-11-30'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Search by name, position, dept..." 
                className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs w-64 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
              />
           </div>
           <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"><Filter size={16} /></button>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-400'}`}
              >
                <List size={16} />
              </button>
           </div>
           <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-slate-50 transition shadow-sm">
              <Download size={16} />
              Export
           </button>
           <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
              <Plus size={16} />
              Add Employee
           </button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {employees.map((emp) => (
             <div key={emp.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm group hover:border-indigo-200 transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-800 text-xl font-semibold text-slate-400 ring-4 ring-slate-50/50 dark:ring-slate-800/30">
                      {emp.fullName.split(' ').map(n => n[0]).join('')}
                   </div>
                   <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white"><MoreVertical size={16} /></button>
                </div>
                
                <div>
                   <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase">{emp.department}</span>
                   <h4 className="text-lg font-semibold text-slate-900 dark:text-white mt-0.5 leading-tight">{emp.fullName}</h4>
                   <p className="text-sm font-medium text-slate-500 mt-1">{emp.position}</p>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                   <div className="flex items-center gap-3 text-slate-500">
                      <Mail size={14} className="text-slate-400" />
                      <span className="text-xs font-medium truncate">{emp.email}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                      <Phone size={14} className="text-slate-400" />
                      <span className="text-xs font-medium">{emp.phone}</span>
                   </div>
                   <div className="flex items-center gap-3 text-slate-500">
                      <ShieldCheck size={14} className="text-slate-400" />
                      <span className="text-xs font-medium uppercase text-indigo-600/70">{emp.id} • {emp.employeeNumber}</span>
                   </div>
                </div>

                <button className="w-full mt-6 py-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-lg text-xs font-medium uppercase text-slate-600 dark:text-slate-400 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-950 transition-all opacity-0 group-hover:opacity-100">
                  View Full Profile
                </button>
             </div>
           ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase">Employee</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase">Position</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase">Department</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase">Hire Date</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase text-center">Status</th>
                    <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase text-center">Actions</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                 {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-xs font-semibold">
                                {emp.fullName.split(' ').map(n => n[0]).join('')}
                             </div>
                             <div className="flex flex-col">
                                <span className="text-xs font-black text-slate-900 dark:text-white">{emp.fullName}</span>
                                <span className="text-[9px] font-bold text-slate-400">{emp.id}</span>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4 text-xs font-bold text-slate-500">{emp.position}</td>
                       <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 text-[9px] font-black uppercase tracking-tight">
                            {emp.department}
                          </span>
                       </td>
                       <td className="px-6 py-4 text-xs font-bold text-slate-400">{emp.hireDate}</td>
                       <td className="px-6 py-4">
                          <div className="flex justify-center items-center gap-1.5 text-emerald-500">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[9px] font-black uppercase">Active</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex justify-center">
                             <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"><MoreVertical size={14} /></button>
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

export default EmployeeDirectory;
