import React from 'react';
import { Clock, Calendar, UserCheck, UserX, MapPin, Search, Filter, MoreVertical, CheckCircle2 } from 'lucide-react';

const AttendanceManagement = () => {
  const attendanceData = [
    { name: 'Sarah Johnson', dept: 'Front Office', checkIn: '07:52 AM', checkOut: '04:15 PM', status: 'Present', ot: '0.2h' },
    { name: 'Robert Wilson', dept: 'Engineering', checkIn: '08:05 AM', checkOut: '---', status: 'Late', ot: '0.0h' },
    { name: 'James Chen', dept: 'Housekeeping', checkIn: '07:30 AM', checkOut: '03:45 PM', status: 'Present', ot: '0.5h' },
    { name: 'John Doe', dept: 'F&B', checkIn: '---', checkOut: '---', status: 'Absent', ot: '0.0h' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'On Duty', value: '142', icon: UserCheck, color: 'text-emerald-500' },
          { label: 'Absent', value: '08', icon: UserX, color: 'text-rose-500' },
          { label: 'Avg. Check-in', value: '08:04 AM', icon: Clock, color: 'text-indigo-500' },
          { label: 'Location Sync', value: 'Active', icon: MapPin, color: 'text-blue-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-xs font-medium text-slate-500 leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
           <h3 className="text-sm font-bold text-slate-900 dark:text-white">Today's Attendance Registry</h3>
           <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm font-medium flex items-center gap-2">
                 <Calendar size={14} />
                 May 30, 2024
              </button>
           </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20">
              <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500">Department</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Check-In</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Check-Out</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Overtime</th>
              <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {attendanceData.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{row.name}</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-500">{row.dept}</td>
                <td className="px-6 py-4 text-center text-sm font-medium text-slate-900 dark:text-white">{row.checkIn}</td>
                <td className="px-6 py-4 text-center text-sm font-medium text-slate-400 font-mono">{row.checkOut}</td>
                <td className="px-6 py-4 text-center">
                   <span className="text-xs font-medium text-indigo-500">{row.ot}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${
                      row.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                      row.status === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {row.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceManagement;
