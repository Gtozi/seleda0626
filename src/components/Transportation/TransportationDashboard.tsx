import React from 'react';
import { 
  Car,
  MapPin,
  Users,
  Clock,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plane,
  Calendar,
  DollarSign,
  Activity,
  Wrench,
  Gauge
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

const TransportationDashboard: React.FC = () => {
  const stats = [
    { label: 'Active Trips', value: 12, sub: '3 En Route', color: 'bg-blue-500', icon: Car },
    { label: 'Scheduled Trips', value: 28, sub: 'Today', color: 'bg-indigo-500', icon: Calendar },
    { label: 'Completed Trips', value: 45, sub: 'Today', color: 'bg-emerald-500', icon: CheckCircle2 },
    { label: 'Airport Pickups', value: 8, sub: 'Arrivals', color: 'bg-sky-500', icon: Plane },
    { label: 'Airport Drop-offs', value: 6, sub: 'Departures', color: 'bg-cyan-500', icon: Plane },
    { label: 'Fleet Utilization', value: '78%', sub: 'Active', color: 'bg-blue-600', icon: Gauge },
    { label: 'Vehicle Availability', value: 15, sub: 'Available', color: 'bg-emerald-600', icon: Car },
    { label: 'Driver Availability', value: 18, sub: 'On Duty', color: 'bg-indigo-600', icon: Users },
    { label: 'Avg Pickup Time', value: '8 min', sub: 'Response', color: 'bg-amber-500', icon: Clock },
    { label: 'On-Time Performance', value: '94%', sub: 'This Week', color: 'bg-emerald-500', icon: TrendingUp },
    { label: 'Fuel Consumption', value: '245 L', sub: 'Today', color: 'bg-orange-500', icon: Fuel },
    { label: 'Transport Revenue', value: '$4,250', sub: 'Today', color: 'bg-green-600', icon: DollarSign },
  ];

  const tripTypeData = [
    { name: 'Airport Transfer', value: 14, color: '#3b82f6' },
    { name: 'City Transfer', value: 8, color: '#8b5cf6' },
    { name: 'Hotel Shuttle', value: 12, color: '#22c55e' },
    { name: 'Corporate', value: 6, color: '#f97316' },
    { name: 'Staff Shuttle', value: 4, color: '#eab308' },
    { name: 'VIP Transport', value: 2, color: '#ec4899' },
  ];

  const alerts = [
    { type: 'Delayed Pickup', message: 'Guest Room 302 - Driver delayed by traffic', time: '10:45 AM', icon: Clock, color: 'bg-amber-500' },
    { type: 'Flight Delay', message: 'Flight BA247 - 2 hour delay impact on 3 pickups', time: '09:30 AM', icon: Plane, color: 'bg-amber-600' },
    { type: 'Vehicle Breakdown', message: 'Vehicle VH-005 - Engine issue, dispatching replacement', time: '08:15 AM', icon: Wrench, color: 'bg-rose-500' },
    { type: 'Driver Overtime', message: 'Driver John D. - Approaching overtime limit', time: '07:00 AM', icon: Users, color: 'bg-amber-500' },
    { type: 'Maintenance Due', message: 'Vehicle VH-012 - Scheduled maintenance overdue', time: '06:30 AM', icon: Wrench, color: 'bg-rose-600' },
    { type: 'Low Fuel', message: 'Vehicle VH-008 - Fuel level below 15%', time: 'Yesterday', icon: Fuel, color: 'bg-amber-500' },
    { type: 'GPS Offline', message: 'Vehicle VH-003 - GPS signal lost', time: 'Yesterday', icon: MapPin, color: 'bg-amber-600' },
    { type: 'License Expiry', message: 'Driver Mike T. - License expires in 7 days', time: '2 days ago', icon: AlertTriangle, color: 'bg-rose-500' },
  ];

  const vehicleUtilizationData = [
    { vehicle: 'VH-001', utilization: 85 },
    { vehicle: 'VH-002', utilization: 72 },
    { vehicle: 'VH-003', utilization: 90 },
    { vehicle: 'VH-004', utilization: 65 },
    { vehicle: 'VH-005', utilization: 78 },
    { vehicle: 'VH-006', utilization: 82 },
  ];

  const driverPerformanceData = [
    { name: 'John D.', trips: 12, onTime: 95 },
    { name: 'Elena R.', trips: 10, onTime: 98 },
    { name: 'Carlos M.', trips: 8, onTime: 92 },
    { name: 'Sarah L.', trips: 11, onTime: 96 },
    { name: 'Mike T.', trips: 9, onTime: 89 },
  ];

  const revenueTrendData = [
    { date: 'Mon', revenue: 3200, trips: 38 },
    { date: 'Tue', revenue: 3800, trips: 42 },
    { date: 'Wed', revenue: 3500, trips: 40 },
    { date: 'Thu', revenue: 4200, trips: 48 },
    { date: 'Fri', revenue: 4800, trips: 52 },
    { date: 'Sat', revenue: 5200, trips: 58 },
    { date: 'Sun', revenue: 4250, trips: 45 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transportation Executive Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time fleet and trip operations overview</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Generate Report
          </button>
          <button className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition">
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{stat.sub}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Types */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Trips by Type</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tripTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {tripTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} name="Revenue ($)" />
              <Line type="monotone" dataKey="trips" stroke="#22c55e" strokeWidth={2} name="Trips" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vehicle Utilization & Driver Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Utilization */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Vehicle Utilization</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleUtilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vehicle" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="utilization" fill="#3b82f6" name="Utilization %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Driver Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Driver Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="trips" fill="#8b5cf6" name="Trips" />
              <Bar dataKey="onTime" fill="#22c55e" name="On-Time %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`p-2 rounded-lg ${alert.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{alert.type}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500">{alert.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TransportationDashboard;