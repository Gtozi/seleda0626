import { useState } from 'react';
import { 
  Users, 
  AlertCircle, 
  DollarSign, 
  Briefcase, 
  Clock, 
  GraduationCap,
  TrendingUp,
  UserCheck,
  Calendar,
  Star,
  Bell,
  RefreshCw
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
} from 'recharts';
import { useERP } from '../../context/ERPContext';

interface KPICardProps {
  label: string;
  value: string;
  sub?: string;
  icon: any;
  colorClass: string;
  bgClass: string;
  trend?: string;
  isPositive?: boolean;
}

function KPICard({ label, value, sub, icon: Icon, colorClass, bgClass, trend, isPositive }: KPICardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${bgClass} flex items-center justify-center`}>
          <Icon className={colorClass} size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            <TrendingUp size={16} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{label}</p>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{value}</h3>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

const HRDashboard = () => {
  const { formatAmount } = useERP();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const kpis = [
    { label: 'Total Employees', value: '248', sub: '12 New Hires', icon: Users, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-100 dark:bg-indigo-500/20', trend: '+5.2%', isPositive: true },
    { label: 'Active Employees', value: '235', sub: '94.8% Active', icon: UserCheck, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 dark:bg-emerald-500/20', trend: '+2.1%', isPositive: true },
    { label: 'Vacant Positions', value: '14', sub: '5 Urgent', icon: Briefcase, colorClass: 'text-amber-600', bgClass: 'bg-amber-100 dark:bg-amber-500/20', trend: '-8.3%', isPositive: false },
    { label: 'Employee Turnover', value: '8.5%', sub: 'Last 12 months', icon: TrendingUp, colorClass: 'text-rose-600', bgClass: 'bg-rose-100 dark:bg-rose-500/20', trend: '-1.2%', isPositive: true },
    { label: 'Attendance Rate', value: '96.8%', sub: 'This Month', icon: Clock, colorClass: 'text-blue-600', bgClass: 'bg-blue-100 dark:bg-blue-500/20', trend: '+0.5%', isPositive: true },
    { label: 'Overtime Hours', value: '142h', sub: 'Reduced by 5%', icon: Clock, colorClass: 'text-purple-600', bgClass: 'bg-purple-100 dark:bg-purple-500/20', trend: '-5.0%', isPositive: true },
    { label: 'Leave Utilization', value: '42%', sub: 'Avg per Dept', icon: Calendar, colorClass: 'text-cyan-600', bgClass: 'bg-cyan-100 dark:bg-cyan-500/20', trend: '+3.2%', isPositive: true },
    { label: 'Training Completion', value: '92%', sub: 'YTD Average', icon: GraduationCap, colorClass: 'text-pink-600', bgClass: 'bg-pink-100 dark:bg-pink-500/20', trend: '+4.5%', isPositive: true },
    { label: 'Payroll Cost', value: formatAmount(84200), sub: 'This Month', icon: DollarSign, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-100 dark:bg-emerald-500/20', trend: '+2.8%', isPositive: true },
    { label: 'Employee Satisfaction', value: '4.2/5', sub: 'Latest Survey', icon: Star, colorClass: 'text-yellow-600', bgClass: 'bg-yellow-100 dark:bg-yellow-500/20', trend: '+0.3', isPositive: true },
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Executive Dashboard</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Centralized workforce management view</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* Alerts Section */}
      <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="text-rose-500" size={20} />
          <h3 className="text-sm font-bold text-rose-900 dark:text-rose-100 uppercase tracking-tight">HR Alerts</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: 'Probation Ending', count: 3, color: 'text-amber-600' },
            { label: 'Contract Expiry', count: 5, color: 'text-rose-600' },
            { label: 'Visa Expiry', count: 2, color: 'text-rose-600' },
            { label: 'Work Permit Expiry', count: 1, color: 'text-rose-600' },
            { label: 'Missing Attendance', count: 8, color: 'text-amber-600' },
            { label: 'Pending Leave Requests', count: 6, color: 'text-blue-600' },
            { label: 'Payroll Approval Pending', count: 2, color: 'text-amber-600' },
            { label: 'Training Expired', count: 4, color: 'text-rose-600' },
            { label: 'Certification Expiring', count: 7, color: 'text-amber-600' },
          ].map((alert, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-rose-100 dark:border-rose-500/20">
              <p className="text-[9px] font-bold text-slate-400 uppercase">{alert.label}</p>
              <p className={`text-lg font-bold ${alert.color}`}>{alert.count}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Attendance Analysis */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance Analysis</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Weekly Workforce Presence</p>
            </div>
            <div className="flex gap-4">
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Present</span>
               </div>
               <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-rose-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Absent</span>
               </div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceTrend}>
                <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} fontWeight={500} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} fontWeight={500} tick={{ fill: '#64748b' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                <Bar dataKey="present" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="absent" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff by Department */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Staff by Department</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Department distribution</p>
          </div>
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
              <div key={i} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-slate-600 dark:text-slate-400">{dept.name}</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">{dept.value} staff</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recruitment Funnel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recruitment Funnel</h3>
           <div className="space-y-5">
              {[
                { label: 'Applications', count: 142, color: 'bg-slate-200 dark:bg-slate-700' },
                { label: 'Shortlisted', count: 34, color: 'bg-indigo-500' },
                { label: 'Interviews', count: 12, color: 'bg-blue-500' },
                { label: 'Offers Sent', count: 5, color: 'bg-emerald-500' },
              ].map((step, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase">{step.label}</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{step.count}</span>
                   </div>
                   <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${step.color}`} style={{ width: `${(step.count/142)*100}%` }} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Upcoming Trainings & Leaves */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
           <div className="grid md:grid-cols-2 gap-8">
              <div>
                 <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Training Schedule</h4>
                 <div className="space-y-3">
                    {[
                      { title: 'Guest Service Excellence', date: 'Jun 02', dept: 'Front Office', attendees: 24 },
                      { title: 'Food Safety Level 3', date: 'Jun 04', dept: 'Kitchen', attendees: 18 },
                      { title: 'First Aid & CPR', date: 'Jun 08', dept: 'General', attendees: 12 },
                    ].map((t, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                         <div>
                            <span className="text-xs font-semibold text-indigo-600 block leading-none mb-1">{t.date}</span>
                            <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{t.title}</h5>
                         </div>
                         <div className="text-right">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase block">{t.dept}</span>
                            <span className="text-xs font-semibold text-slate-500">{t.attendees} staff</span>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div>
                 <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-4">Leave Approvals Pending</h4>
                 <div className="space-y-3">
                    {[
                      { name: 'John Doe', type: 'Annual', dates: 'Jun 05 - Jun 12', dept: 'F&B' },
                      { name: 'Elena Smith', type: 'Sick', dates: 'Today', dept: 'Housekeeping' },
                      { name: 'Carlos Ray', type: 'Emergency', dates: 'May 31', dept: 'Eng.' },
                    ].map((l, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex justify-between items-center group cursor-pointer hover:border-indigo-300 transition-all">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                               {l.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                               <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{l.name}</h5>
                               <span className="text-xs text-slate-500">{l.dates}</span>
                            </div>
                         </div>
                         <div className="text-right flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${l.type === 'Annual' ? 'bg-indigo-100 text-indigo-700' : 'bg-rose-100 text-rose-700'}`}>
                               {l.type}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 uppercase">{l.dept}</span>
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
