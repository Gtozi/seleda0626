import React from 'react';
import { 
  Users, 
  UserPlus, 
  Clock, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Briefcase,
  GraduationCap,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';

const HRDashboard = () => {
  const kpis = [
    { label: 'Total Employees', value: '248', sub: '12 New Hires', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
    { label: 'Absent Today', value: '8', sub: '3.2% Rate', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
    { label: 'Payroll Cost', value: '$84.2k', sub: 'This Month', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Open Positions', value: '14', sub: '5 Urgent', icon: Briefcase, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Overtime', value: '142h', sub: 'Reduced by 5%', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Trainings', value: '6', sub: 'Scheduled', icon: GraduationCap, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
  ];

  const deptDistribution = [
    { name: 'Front Office', value: 45, color: '#B5563C' },
    { name: 'Housekeeping', value: 68, color: '#5F7A4F' },
    { name: 'F&B', value: 72, color: '#C18A3B' },
    { name: 'Engineering', value: 24, color: '#9C4A36' },
    { name: 'Admin/Other', value: 39, color: '#6B5C4D' },
  ];

  const attendanceTrend = [
    { day: 'Mon', present: 240, absent: 8 },
    { day: 'Tue', present: 238, absent: 10 },
    { day: 'Wed', present: 242, absent: 6 },
    { day: 'Thu', present: 235, absent: 13 },
    { day: 'Fri', present: 241, absent: 7 },
    { day: 'Sat', present: 220, absent: 28 },
    { day: 'Sun', present: 215, absent: 33 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 p-4 rounded-3xl transition-all hover:shadow-sm dark:shadow-slate-900/20">
            <div className={`p-2 w-fit rounded-xl ${kpi.bg} ${kpi.color} mb-3`}>
              <kpi.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{kpi.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">{kpi.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Attendance Trend */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 p-6 rounded-3xl shadow-sm dark:shadow-slate-900/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Attendance Analysis</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Weekly Workforce Presence</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-[10px] font-bold text-slate-500">Present</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-slate-500">Absent</span>
               </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#6B5C4D' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={10} fontWeight={700} tick={{ fill: '#6B5C4D' }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', fontSize: '10px' }} />
                <Bar dataKey="present" fill="#B5563C" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="absent" fill="#9C4A36" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dept Distribution */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 p-6 rounded-3xl shadow-sm dark:shadow-slate-900/20">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-8">Staff by Dept.</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={deptDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {deptDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2.5 mt-4">
            {deptDistribution.map((dept, i) => (
              <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-slate-500">{dept.name}</span>
                </div>
                <span className="text-slate-900 dark:text-white font-black">{dept.value} staff</span>
              </div>
            ))}
          </div>
        </div>

        {/* Onboarding Pipeline */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900/30 border border-slate-200/80 dark:border-slate-700 p-6 rounded-3xl shadow-sm dark:shadow-slate-900/20">
           <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Recruitment Funnel</h3>
           <div className="space-y-5">
              {[
                { label: 'Applications', count: 142, color: 'bg-slate-100 dark:bg-slate-800' },
                { label: 'Shortlisted', count: 34, color: 'bg-indigo-100 dark:bg-indigo-500/20' },
                { label: 'Interviews', count: 12, color: 'bg-blue-100 dark:bg-blue-500/20' },
                { label: 'Offers Sent', count: 5, color: 'bg-emerald-100 dark:bg-emerald-500/20' },
              ].map((step, i) => (
                <div key={i} className="space-y-1.5">
                   <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{step.label}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{step.count}</span>
                   </div>
                   <div className="h-2 w-full bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden">
                      <div className={`h-full ${step.color?.includes('indigo') ? 'bg-indigo-500' : step.color?.includes('emerald') ? 'bg-emerald-500' : 'bg-slate-400'}`} style={{ width: `${(step.count/142)*100}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Upcoming Trainings & Leaves */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
           <div className="grid md:grid-cols-2 gap-8">
              <div>
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Training Schedule</h4>
                 <div className="space-y-3">
                    {[
                      { title: 'Guest Service Excellence', date: 'Jun 02', dept: 'Front Office', attendees: 24 },
                      { title: 'Food Safety Level 3', date: 'Jun 04', dept: 'Kitchen', attendees: 18 },
                      { title: 'First Aid & CPR', date: 'Jun 08', dept: 'General', attendees: 12 },
                    ].map((t, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                         <div>
                            <span className="text-[10px] font-black text-indigo-600 block leading-none mb-1">{t.date}</span>
                            <h5 className="text-xs font-bold text-slate-900 dark:text-white">{t.title}</h5>
                         </div>
                         <div className="text-right">
                            <span className="text-[9px] font-black text-slate-400 uppercase block">{t.dept}</span>
                            <span className="text-[9px] font-bold text-slate-500">{t.attendees} staff</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div>
                 <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Leave Approvals Pending</h4>
                 <div className="space-y-3">
                    {[
                      { name: 'John Doe', type: 'Annual', dates: 'Jun 05 - Jun 12', dept: 'F&B' },
                      { name: 'Elena Smith', type: 'Sick', dates: 'Today', dept: 'Housekeeping' },
                      { name: 'Carlos Ray', type: 'Emergency', dates: 'May 31', dept: 'Eng.' },
                    ].map((l, i) => (
                      <div key={i} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-150 dark:border-slate-800 flex justify-between items-center group cursor-pointer hover:border-indigo-200 transition-all">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[10px] font-black">
                               {l.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                               <h5 className="text-xs font-bold text-slate-900 dark:text-white">{l.name}</h5>
                               <span className="text-[9px] font-bold text-slate-500">{l.dates}</span>
                            </div>
                         </div>
                         <div className="text-right flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${l.type === 'Annual' ? 'bg-indigo-50 text-indigo-600' : 'bg-rose-50 text-rose-600'}`}>
                               {l.type}
                            </span>
                            <span className="text-[8px] font-black text-slate-400 uppercase">{l.dept}</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
