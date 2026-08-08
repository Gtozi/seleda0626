import React from 'react';
import { 
  ShieldAlert,
  AlertTriangle,
  ClipboardList,
  Users,
  Camera,
  Key,
  MapPin,
  Flame,
  Radio,
  TrendingUp,
  CheckCircle2,
  Clock,
  Activity,
  Package,
  FileText,
  Bell,
  Eye,
  Lock,
  UserCheck,
  Building2
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

const SecurityDashboard: React.FC = () => {
  const stats = [
    { label: 'Active Incidents', value: 5, sub: '2 Emergency', color: 'bg-rose-500', icon: AlertTriangle },
    { label: 'Open Investigations', value: 3, sub: '1 High Priority', color: 'bg-amber-500', icon: ClipboardList },
    { label: 'Patrol Completion', value: '92%', sub: 'Today', color: 'bg-emerald-500', icon: MapPin },
    { label: 'Security Alerts', value: 8, sub: '4 Critical', color: 'bg-rose-600', icon: Bell },
    { label: 'Access Violations', value: 2, sub: 'Last 24h', color: 'bg-amber-600', icon: Lock },
    { label: 'Visitor Count', value: 24, sub: 'On Property', color: 'bg-blue-500', icon: Users },
    { label: 'Lost & Found Cases', value: 7, sub: '3 Pending', color: 'bg-indigo-500', icon: Package },
    { label: 'Fire Safety Status', value: 'Normal', sub: 'All Systems OK', color: 'bg-emerald-600', icon: Flame },
    { label: 'CCTV Status', value: '98%', sub: 'Online', color: 'bg-blue-600', icon: Camera },
    { label: 'Risk Level', value: 'Medium', sub: 'Property Wide', color: 'bg-amber-500', icon: ShieldAlert },
    { label: 'Staff on Duty', value: 12, sub: 'Security Officers', color: 'bg-indigo-600', icon: UserCheck },
    { label: 'Keycards Active', value: 156, sub: 'Total Issued', color: 'bg-purple-500', icon: Key },
  ];

  const incidentCategoryData = [
    { name: 'Theft', value: 2, color: '#ef4444' },
    { name: 'Medical Emergency', value: 1, color: '#f97316' },
    { name: 'Property Damage', value: 1, color: '#eab308' },
    { name: 'Security Breach', value: 1, color: '#22c55e' },
    { name: 'Guest Complaint', value: 3, color: '#3b82f6' },
    { name: 'Lost Property', value: 2, color: '#8b5cf6' },
  ];

  const alerts = [
    { type: 'Unauthorized Access', message: 'Rear entrance - Unknown person detected', time: '10:45 AM', icon: Lock, color: 'bg-rose-500' },
    { type: 'Fire Alarm', message: 'Kitchen area - Smoke detector activation', time: '09:30 AM', icon: Flame, color: 'bg-rose-600' },
    { type: 'Panic Alarm', message: 'Room 204 - Guest emergency button pressed', time: '08:15 AM', icon: Radio, color: 'bg-rose-500' },
    { type: 'Emergency Evacuation', message: 'Drill scheduled for 2:00 PM', time: '07:00 AM', icon: Activity, color: 'bg-amber-500' },
    { type: 'Suspicious Activity', message: 'Parking lot - Vehicle loitering', time: '06:30 AM', icon: Eye, color: 'bg-amber-600' },
    { type: 'Missing Master Key', message: 'Housekeeping master key not returned', time: 'Yesterday', icon: Key, color: 'bg-rose-500' },
    { type: 'Critical Risk Escalation', message: 'Fire safety equipment inspection overdue', time: 'Yesterday', icon: ShieldAlert, color: 'bg-amber-500' },
    { type: 'CCTV Offline', message: 'Camera 12 - Lobby entrance', time: '2 days ago', icon: Camera, color: 'bg-amber-600' },
    { type: 'Patrol Missed', message: 'Night shift - Floor 5 checkpoint not verified', time: '2 days ago', icon: MapPin, color: 'bg-rose-600' },
  ];

  const patrolActivityData = [
    { name: 'John D.', patrols: 8, completion: 100 },
    { name: 'Elena R.', patrols: 7, completion: 100 },
    { name: 'Carlos M.', patrols: 6, completion: 85 },
    { name: 'Sarah L.', patrols: 8, completion: 100 },
    { name: 'Mike T.', patrols: 5, completion: 75 },
  ];

  const riskByPropertyData = [
    { property: 'Main Building', risk: 75 },
    { property: 'Annex A', risk: 45 },
    { property: 'Parking', risk: 60 },
    { property: 'Garden Area', risk: 30 },
    { property: 'Pool Area', risk: 50 },
  ];

  const incidentTrendData = [
    { date: 'Mon', incidents: 3, resolved: 2 },
    { date: 'Tue', incidents: 5, resolved: 4 },
    { date: 'Wed', incidents: 2, resolved: 3 },
    { date: 'Thu', incidents: 4, resolved: 3 },
    { date: 'Fri', incidents: 6, resolved: 5 },
    { date: 'Sat', incidents: 7, resolved: 6 },
    { date: 'Sun', incidents: 4, resolved: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Executive Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Real-time security operations overview</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
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
        {/* Incident Categories */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Incidents by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={incidentCategoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {incidentCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Incident Trend */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Incident Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={incidentTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="incidents" stroke="#ef4444" strokeWidth={2} name="New Incidents" />
              <Line type="monotone" dataKey="resolved" stroke="#22c55e" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk by Property & Patrol Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk by Property */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Risk Level by Property</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskByPropertyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="property" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="risk" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Patrol Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Patrol Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={patrolActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patrols" fill="#3b82f6" name="Patrols Completed" />
              <Bar dataKey="completion" fill="#22c55e" name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Security Alerts</h3>
          <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">View All Alerts</button>
        </div>
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                <div className={`p-2 rounded-lg ${alert.color} mt-0.5`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-slate-900 dark:text-white">{alert.type}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{alert.time}</p>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SecurityDashboard;