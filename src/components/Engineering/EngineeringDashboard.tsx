
import React from 'react';
import { 
  ClipboardList, 
  Wrench, 
  AlertTriangle, 
  Users, 
  Zap, 
  Droplets, 
  Activity, 
  TrendingUp, 
  BarChart3,
  CheckCircle2,
  Clock,
  DollarSign,
  Heart,
  Box
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const EngineeringDashboard: React.FC = () => {
  // Mock Data
  const stats = [
    { label: 'Open Work Orders', value: 14, sub: '4 Emergency', color: 'bg-indigo-500', icon: ClipboardList },
    { label: 'Completed Today', value: 8, sub: '+2 from yesterday', color: 'bg-emerald-500', icon: CheckCircle2 },
    { label: 'PM Due Today', value: 3, sub: '1 Overdue', color: 'bg-amber-500', icon: Wrench },
    { label: 'Emergency Requests', value: 4, sub: 'Critical Action', color: 'bg-rose-500', icon: AlertTriangle },
    { label: 'OOO Rooms', value: 2, sub: 'Out of Order', color: 'bg-rose-600', icon: AlertTriangle },
    { label: 'OOS Rooms', value: 5, sub: 'Out of Service', color: 'bg-slate-500', icon: AlertTriangle },
    { label: 'Asset Health', value: '94%', sub: 'Good', color: 'bg-blue-500', icon: Heart },
    { label: 'Active Techs', value: 6, sub: 'In field', color: 'bg-indigo-400', icon: Users },
    { label: 'Spare Parts Req.', value: 12, sub: 'Pending', color: 'bg-amber-600', icon: Box },
    { label: 'Utility Cost', value: '$1,240', sub: 'Today', color: 'bg-purple-500', icon: DollarSign },
    { label: 'Maintenance Cost', value: '$14,2k', sub: 'This Month', color: 'bg-emerald-600', icon: DollarSign },
    { label: 'Downtime Hours', value: '20.2h', sub: 'Across Assets', color: 'bg-rose-400', icon: Clock },
  ];

  const workOrderStatusData = [
    { name: 'Pending', value: 5, color: '#94a3b8' },
    { name: 'Assigned', value: 4, color: '#6366f1' },
    { name: 'In Progress', value: 3, color: '#3b82f6' },
    { name: 'Parts Req.', value: 2, color: '#f59e0b' },
  ];

  const productivityData = [
    { name: 'John D.', tasks: 12, quality: 95 },
    { name: 'Elena R.', tasks: 15, quality: 98 },
    { name: 'Carlos M.', tasks: 10, quality: 92 },
    { name: 'Sarah L.', tasks: 14, quality: 96 },
  ];

  const roomHeatMap = [
    { floor: 'Floor 1', issues: 12, pms: 5 },
    { floor: 'Floor 2', issues: 8, pms: 4 },
    { floor: 'Floor 3', issues: 15, pms: 6 },
    { floor: 'Floor 4', issues: 4, pms: 8 },
    { floor: 'Floor 5', issues: 10, pms: 3 },
  ];

  const utilityTrendData = [
    { time: '08:00', water: 120, electricity: 450, fuel: 10 },
    { time: '10:00', water: 340, electricity: 680, fuel: 15 },
    { time: '12:00', water: 450, electricity: 920, fuel: 20 },
    { time: '14:00', water: 380, electricity: 850, fuel: 18 },
    { time: '16:00', water: 410, electricity: 790, fuel: 12 },
    { time: '18:00', water: 520, electricity: 880, fuel: 22 },
  ];

  const downtimeAnalysis = [
    { name: 'Generator 01', hours: 4.5 },
    { name: 'Elevator A', hours: 12 },
    { name: 'Boiler 02', hours: 2.2 },
    { name: 'Cold Store', hours: 1.5 },
  ];

  const costTrendData = [
    { day: 'Mon', cost: 1200 },
    { day: 'Tue', cost: 1500 },
    { day: 'Wed', cost: 900 },
    { day: 'Thu', cost: 1800 },
    { day: 'Fri', cost: 2100 },
    { day: 'Sat', cost: 1400 },
    { day: 'Sun', cost: 1100 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 border border-slate-150 dark:border-slate-800 rounded-3xl shadow-3xs flex flex-col justify-between group hover:border-indigo-400 transition-all">
              <div className="flex justify-between items-center mb-2">
                <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:${stat.color.replace('bg-', 'text-')} transition-colors`}>
                  <Icon size={14} />
                </div>
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</span>
              </div>
              <div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                <p className="text-[8px] text-slate-500 font-medium">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Work Order Status & Cost Trend */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Maintenance Cost Trend</h3>
                  <p className="text-[10px] text-slate-400">Weekly operational expenditure in USD</p>
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded-lg">
                  <TrendingUp size={12} />
                  <span>+12.4%</span>
                </div>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={costTrendData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} vertical={false} />
                    <XAxis dataKey="day" stroke="#a0aec0" fontSize={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#a0aec0" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="cost" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40}>
                       {costTrendData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 4 ? '#4f46e5' : '#818cf8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
                <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white mb-4">Equipment Downtime Analysis</h3>
                <div className="h-56 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={downtimeAnalysis} layout="vertical">
                         <CartesianGrid strokeDasharray="2 2" stroke="#e2e8f0" opacity={0.3} horizontal={false} />
                         <XAxis type="number" stroke="#a0aec0" fontSize={8} axisLine={false} tickLine={false} />
                         <YAxis dataKey="name" type="category" stroke="#a0aec0" fontSize={8} axisLine={false} tickLine={false} width={70} />
                         <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                         <Bar dataKey="hours" fill="#f43f5e" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                   </ResponsiveContainer>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs text-center flex flex-col justify-center">
                <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white mb-6">Work Order Status Distribution</h3>
                <div className="h-48 w-full flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie
                           data={workOrderStatusData}
                           innerRadius={50}
                           outerRadius={70}
                           paddingAngle={5}
                           dataKey="value"
                         >
                           {workOrderStatusData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={entry.color} />
                           ))}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">14</span>
                      <span className="text-[8px] font-mono text-slate-400 uppercase font-black uppercase">Open</span>
                   </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                   {workOrderStatusData.map((d, i) => (
                     <div key={i} className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500 uppercase">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span>{d.name} ({d.value})</span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>

        {/* Utility Monitoring and Heat Map */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white">Live Utility Monitor</h3>
                  <p className="text-[10px] text-slate-400">Real-time consumption metrics</p>
                </div>
                <Activity size={16} className="text-indigo-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Electricity Consumption', value: '48.2 kWh', icon: Zap, color: 'text-amber-500', trend: '+5%' },
                   { label: 'Water Usage (Meters)', value: '1,240 L', icon: Droplets, color: 'text-blue-500', trend: '-2%' },
                   { label: 'Fuel Levels (Gen-01)', value: '82%', icon: Clock, color: 'text-indigo-500', trend: 'Steady' },
                 ].map((u, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl">
                      <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-xl bg-white dark:bg-slate-800 ${u.color}`}>
                            <u.icon size={14} />
                         </div>
                         <div>
                            <span className="text-[10px] font-bold text-slate-900 dark:text-white block">{u.value}</span>
                            <span className="text-[8px] text-slate-400 font-black uppercase tracking-tight">{u.label}</span>
                         </div>
                      </div>
                      <span className={`text-[8px] font-black ${u.trend === 'Steady' ? 'text-slate-400' : u.trend.startsWith('+') ? 'text-rose-500' : 'text-emerald-500'}`}>
                         {u.trend}
                      </span>
                   </div>
                 ))}
              </div>

              <div className="h-32 w-full mt-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={utilityTrendData}>
                       <Line type="monotone" dataKey="electricity" stroke="#f59e0b" strokeWidth={2} dot={false} />
                       <Line type="monotone" dataKey="water" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white mb-4">Maintenance & Room Health</h3>
              <div className="space-y-4">
                 <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">PM Compliance</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white leading-none">88%</span>
                 </div>
                 <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: '88%' }} />
                 </div>
                 
                 <div className="pt-4 space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Room Maintenance Heat Map</h4>
                    <div className="h-40 w-full mt-2">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={roomHeatMap}>
                             <XAxis dataKey="floor" stroke="#a0aec0" fontSize={8} axisLine={false} tickLine={false} />
                             <YAxis stroke="#a0aec0" fontSize={8} axisLine={false} tickLine={false} />
                             <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                             <Bar dataKey="issues" fill="#f43f5e" radius={[2, 2, 0, 0]} />
                             <Bar dataKey="pms" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 rounded-3xl shadow-3xs">
              <h3 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white mb-4">Technician Productivity</h3>
              <div className="space-y-4">
                 {productivityData.map((tech, i) => (
                   <div key={i} className="space-y-1.5 border-b border-slate-50 dark:border-slate-850 pb-2 last:border-0 last:pb-0">
                      <div className="flex justify-between items-center text-[9px] font-bold">
                         <span className="text-slate-700 dark:text-slate-300">{tech.name}</span>
                         <span className="text-slate-400">{tech.tasks} Tasks • {tech.quality}% Qual.</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                         <div className="h-full bg-emerald-500" style={{ width: `${tech.quality}%` }} />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default EngineeringDashboard;
