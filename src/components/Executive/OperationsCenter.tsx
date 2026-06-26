import React, { useMemo, useState } from 'react';
import {
  Building2,
  Bed,
  Utensils,
  Wrench,
  Users,
  Box,
  ChevronRight,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  TrendingUp,
  Activity,
  FileText
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';

const OperationsCenter = () => {
  const { stats, rooms, reservations, salesTransactions, currentSystemDate } = useERP();

  // Modal state
  const [selectedDept, setSelectedDept] = useState<typeof departments[0] | null>(null);
  const [showReports, setShowReports] = useState(false);

  // Get department-specific deep dive data
  const getDeptDeepDiveData = (deptId: string) => {
    const dataMap: Record<string, {
      efficiency: string;
      activity: string;
      tickets: string;
      activities: Array<{ time: string; action: string; detail: string }>;
    }> = {
      'fo': {
        efficiency: '92%',
        activity: 'Very High',
        tickets: '5',
        activities: [
          { time: '10:45 AM', action: 'Check-in completed', detail: 'Guest #1284 checked into Room 201' },
          { time: '10:30 AM', action: 'VIP arrival', detail: 'Guest #1290 (VIP) checked in' },
          { time: '10:15 AM', action: 'Departure processed', detail: 'Guest #1275 checked out Room 105' },
          { time: '10:00 AM', action: 'Room change', detail: 'Guest #1278 moved to Room 302' },
        ]
      },
      'hk': {
        efficiency: '88%',
        activity: 'High',
        tickets: '12',
        activities: [
          { time: '10:45 AM', action: 'Room cleaned', detail: 'Room 304 marked as Vacant Clean' },
          { time: '10:30 AM', action: 'Inspection passed', detail: 'Room 215 inspection verified' },
          { time: '10:15 AM', action: 'Maintenance request', detail: 'Room 118 reported plumbing issue' },
          { time: '10:00 AM', action: 'Turndown service', detail: 'VIP rooms turndown completed' },
        ]
      },
      'fb': {
        efficiency: '85%',
        activity: 'Peak',
        tickets: '8',
        activities: [
          { time: '10:45 AM', action: 'Order completed', detail: 'Table 12 bill settled $145' },
          { time: '10:30 AM', action: 'Restock alert', detail: 'Bar inventory restocked' },
          { time: '10:15 AM', action: 'Large party seated', detail: 'Conference group of 20 seated' },
          { time: '10:00 AM', action: 'Kitchen prep', detail: 'Lunch service prep completed' },
        ]
      },
      'eng': {
        efficiency: '78%',
        activity: 'Moderate',
        tickets: '3',
        activities: [
          { time: '10:45 AM', action: 'Repair completed', detail: 'AC unit in Room 402 fixed' },
          { time: '10:30 AM', action: 'Scheduled maintenance', detail: 'Elevator 4 scheduled for 2 PM' },
          { time: '10:15 AM', action: 'Inspection logged', detail: 'Fire safety system checked' },
          { time: '10:00 AM', action: 'Work order created', detail: 'Room 118 plumbing ticket #452' },
        ]
      }
    };
    return dataMap[deptId] || dataMap['fo'];
  };

  const departments = useMemo(() => {
    // Front Office stats from reservations
    const checkInsToday = reservations.filter(r => r.checkInDate === currentSystemDate && r.status === 'Confirmed').length;
    const departuresToday = reservations.filter(r => r.checkOutDate === currentSystemDate && r.status === 'CheckedIn').length;
    const vips = reservations.filter(r => r.isVIP && (r.status === 'CheckedIn' || r.status === 'Confirmed')).length;

    // Housekeeping stats from rooms
    const cleanRooms = rooms.filter(r => r.status === 'Vacant Clean' || r.status === 'Occupied Clean').length;
    const dirtyRooms = rooms.filter(r => r.status === 'Vacant Dirty' || r.status === 'Occupied Dirty').length;
    const outOfOrder = rooms.filter(r => r.status === 'Out of Order').length;

    // F&B stats from salesTransactions
    const todaySales = salesTransactions.filter(t => t.date === currentSystemDate && t.status === 'Completed');
    const restaurantSales = todaySales.filter(t => t.module === 'F&B POS').reduce((sum, t) => sum + t.total, 0);
    const barSales = todaySales.filter(t => t.module === 'F&B POS' && t.items.some(i => i.productName.toLowerCase().includes('drink') || i.productName.toLowerCase().includes('cocktail') || i.productName.toLowerCase().includes('beer'))).reduce((sum, t) => sum + t.total, 0);
    const covers = todaySales.filter(t => t.module === 'F&B POS').reduce((sum, t) => sum + t.items.reduce((s, i) => s + i.quantity, 0), 0);

    // Calculate performance for each department
    const foPerformance = stats.occupancyRate > 80 ? 95 : stats.occupancyRate > 60 ? 85 : 70;
    const hkPerformance = rooms.length > 0 ? Math.round((cleanRooms / rooms.length) * 100) : 75;
    const fbPerformance = restaurantSales > 10000 ? 90 : restaurantSales > 5000 ? 75 : 60;
    const engPerformance = outOfOrder === 0 ? 95 : outOfOrder < 3 ? 80 : 65;

    return [
      {
        id: 'fo',
        name: 'Front Office',
        icon: Building2,
        color: 'text-indigo-500',
        bg: 'bg-indigo-50 dark:bg-indigo-500/10',
        performance: foPerformance,
        stats: [
          { label: 'Occupancy', value: `${stats.occupancyRate}%`, sub: `${stats.occupiedRoomsCount}/${rooms.length} rooms` },
          { label: 'Check-Ins', value: `${checkInsToday}`, sub: 'Expected Today' },
          { label: 'Departures', value: `${departuresToday}`, sub: 'Expected Today' },
          { label: 'VIPs', value: `${vips}`, sub: 'High Priority' },
        ]
      },
      {
        id: 'hk',
        name: 'Housekeeping',
        icon: Bed,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10',
        performance: hkPerformance,
        stats: [
          { label: 'Clean Rooms', value: `${cleanRooms}`, sub: 'Ready' },
          { label: 'Dirty Rooms', value: `${dirtyRooms}`, sub: 'In Progress' },
          { label: 'Inspected', value: `${cleanRooms - outOfOrder}`, sub: 'Verified' },
          { label: 'O-O-O', value: `${outOfOrder}`, sub: 'Maint. Req.' },
        ]
      },
      {
        id: 'fb',
        name: 'Food & Beverage',
        icon: Utensils,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-500/10',
        performance: fbPerformance,
        stats: [
          { label: 'Restaurant', value: `$${(restaurantSales / 1000).toFixed(1)}k`, sub: 'Sales Today' },
          { label: 'Bar Sales', value: `$${(barSales / 1000).toFixed(1)}k`, sub: 'Today' },
          { label: 'Covers', value: `${covers}`, sub: `Avg: $${covers > 0 ? (restaurantSales / covers).toFixed(0) : 0}` },
          { label: 'Transactions', value: `${todaySales.filter(t => t.module === 'F&B POS').length}`, sub: 'Today' },
        ]
      },
      {
        id: 'eng',
        name: 'Engineering',
        icon: Wrench,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-500/10',
        performance: engPerformance,
        stats: [
          { label: 'Out of Order', value: `${outOfOrder}`, sub: 'Rooms Affected' },
          { label: 'Dirty Rooms', value: `${dirtyRooms}`, sub: 'Need Cleaning' },
          { label: 'Total Rooms', value: `${rooms.length}`, sub: 'Property' },
          { label: 'Staffing', value: 'N/A', sub: 'HR Module' },
        ]
      }
    ];
  }, [stats, rooms, reservations, salesTransactions, currentSystemDate]);

  // Calculate workforce metrics from operational data
  const workforce = useMemo(() => {
    // Base staffing on occupancy (1 staff per 5 rooms)
    const baseStaff = Math.ceil(rooms.length / 5);
    const occupancyAdjustment = Math.ceil((stats.occupancyRate / 100) * baseStaff);
    const totalOnDuty = baseStaff + occupancyAdjustment;

    // Absent staff (estimated 5-10% of total)
    const absentToday = Math.ceil(totalOnDuty * 0.08);

    // Overtime based on high occupancy
    const overtimeHours = stats.occupancyRate > 80 ? 24 : stats.occupancyRate > 60 ? 12 : 6;

    // New hires (static for now - would need HR module)
    const newHires = 3;

    return [
      { label: 'Total on Duty', value: String(totalOnDuty), icon: UserCheck, color: 'text-indigo-500' },
      { label: 'Absent Today', value: String(absentToday).padStart(2, '0'), icon: UserX, color: 'text-rose-500' },
      { label: 'Overtime Hours', value: `${overtimeHours}h`, icon: Clock, color: 'text-amber-500' },
      { label: 'New Hires onboarding', value: String(newHires).padStart(2, '0'), icon: Users, color: 'text-emerald-500' },
    ];
  }, [stats, rooms]);

  return (
    <div className="space-y-6">
      {/* Workforce Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {workforce.map((w, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl flex items-center gap-4 transition-all hover:shadow-sm">
             <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${w.color}`}>
                <w.icon size={18} />
             </div>
             <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">{w.label}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{w.value}</span>
             </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <div key={dept.id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs group hover:border-indigo-200 transition-all duration-300">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
                <div className="flex items-center gap-3">
                   <div className={`p-2.5 rounded-2xl ${dept.bg} ${dept.color}`}>
                      <dept.icon size={20} />
                   </div>
                   <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{dept.name}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider font-sans">Operational Summary</p>
                   </div>
                </div>
                <button
                  onClick={() => setSelectedDept(dept)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-600 hover:gap-2 transition-all"
                >
                  Deep Dive
                  <ChevronRight size={14} />
                </button>
             </div>
             
             <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
                {dept.stats.map((s, i) => (
                  <div key={i} className="space-y-1">
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
                     <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-black text-slate-900 dark:text-white">{s.value}</span>
                     </div>
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tight truncate">{s.sub}</p>
                  </div>
                ))}
             </div>

             <div className="px-6 pb-6 pt-2 border-t border-slate-50 dark:border-slate-800/50 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                   <div className={`h-full opacity-80 ${dept.color.replace('text', 'bg')}`} style={{ width: `${dept.performance}%` }} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 rounded-full border border-slate-100 dark:border-slate-800">
                   <CheckCircle2 size={12} className={dept.performance >= 80 ? 'text-emerald-500' : dept.performance >= 60 ? 'text-amber-500' : 'text-rose-500'} />
                   <span className="text-[9px] font-black text-slate-500 uppercase">{dept.performance >= 80 ? 'Within Target' : dept.performance >= 60 ? 'Attention' : 'Critical'}</span>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Critical Operational Alerts */}
      <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 p-6 rounded-[32px]">
         <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-6 font-sans">
            <AlertCircle size={18} />
            <h3 className="text-sm font-black uppercase tracking-tight">Active Critical Issues</h3>
         </div>
         <div className="grid md:grid-cols-2 gap-4">
            {[
              { time: '08:42 AM', dept: 'Engineering', msg: 'Main chiller unit 2 reporting abnormal vibration levels. Service technician called.', priority: 'High' },
              { time: '09:15 AM', dept: 'Front Office', msg: 'Elevator 4 out of service due to sensor malfunction. Expected downtime 4 hours.', priority: 'Medium' },
            ].map((alert, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/40 border border-rose-100 dark:border-rose-500/10 p-4 rounded-2xl flex gap-4 shadow-sm shadow-rose-100/50">
                 <div className="p-2 h-fit bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-xl">
                    <AlertCircle size={16} />
                 </div>
                 <div className="space-y-1">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase">{alert.dept} • {alert.time}</span>
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${alert.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>{alert.priority}</span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{alert.msg}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Department Deep Dive Modal */}
      {selectedDept && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setSelectedDept(null)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedDept.bg} ${selectedDept.color}`}>
                  <selectedDept.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedDept.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Operational Deep Dive</p>
                </div>
              </div>
              <button onClick={() => setSelectedDept(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {selectedDept.stats.map((stat, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                    <p className="text-[9px] font-bold text-slate-500 mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Performance Analysis - Dynamic based on department */}
              {(() => {
                const deptData = getDeptDeepDiveData(selectedDept.id);
                return (
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={14} className="text-indigo-500" />
                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">Efficiency</p>
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{deptData.efficiency}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Above target</p>
                    </div>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity size={14} className="text-emerald-500" />
                        <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Activity</p>
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{deptData.activity}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Current level</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={14} className="text-amber-500" />
                        <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase">Tickets</p>
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">{deptData.tickets}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Open tasks</p>
                    </div>
                  </div>
                );
              })()}

              {/* Recent Activity - Dynamic based on department */}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Recent Activity</p>
                <div className="space-y-2">
                  {getDeptDeepDiveData(selectedDept.id).activities.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{activity.action}</span>
                          <span className="text-[9px] text-slate-400">{activity.time}</span>
                        </div>
                        <p className="text-[9px] text-slate-500 mt-0.5">{activity.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedDept(null)}
                  className="flex-1 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setSelectedDept(null);
                    setShowReports(true);
                  }}
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition"
                >
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports Modal */}
      {showReports && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowReports(false)}>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Department Reports</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Available Reports</p>
                </div>
              </div>
              <button onClick={() => setShowReports(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { name: 'Daily Operations Report', date: 'Today', status: 'Ready' },
                { name: 'Performance Analytics', date: 'Last 7 Days', status: 'Ready' },
                { name: 'Staff Utilization', date: 'This Week', status: 'Processing' },
                { name: 'Cost Analysis', date: 'This Month', status: 'Ready' },
              ].map((report, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{report.name}</p>
                      <p className="text-[9px] text-slate-500">{report.date}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                    report.status === 'Ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                  }`}>
                    {report.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowReports(false)}
              className="w-full mt-6 py-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition"
            >
              Close Reports
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperationsCenter;
