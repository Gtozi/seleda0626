/**
 * Advanced Staff Scheduling & Optimization Interface
 * Phase 2.1: AI-powered staff scheduling with skill-based assignment, labor forecasting, and shift swapping
 */

import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Target,
  Settings,
  Plus,
  Edit,
  Trash2,
  ArrowRightLeft,
  BarChart3,
  RefreshCw,
  Zap,
  Award,
  Brain,
  ChevronRight,
  X,
  Shield,
  Wrench,
  GraduationCap,
  Heart,
  MessageSquare
} from 'lucide-react';

type Department = 'FrontOffice' | 'Housekeeping' | 'FandB' | 'Maintenance' | 'HR' | 'Procurement' | 'SalesEvents' | 'GuestPortal';
type SkillCategory = 'technical' | 'service' | 'leadership' | 'language' | 'certification' | 'other';
type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type PreferenceType = 'shift_timing' | 'days_off' | 'department' | 'role' | 'partner';
type Priority = 'low' | 'normal' | 'high' | 'essential';
type SwapStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

interface OptimizedSchedule {
  schedule_id: string;
  date: string;
  department: Department;
  total_labor_cost: number;
  budget_variance: number;
  coverage_score: number;
  optimization_version: string;
  created_at: string;
  updated_at: string;
}

interface StaffSkill {
  skill_id: string;
  staff_id: string;
  skill_name: string;
  skill_category: SkillCategory;
  proficiency_level: ProficiencyLevel;
  certified: boolean;
  certification_expiry: string | null;
  last_verified: string;
}

interface StaffPreference {
  preference_id: string;
  staff_id: string;
  preference_type: PreferenceType;
  preference_value: any;
  priority: Priority;
  is_active: boolean;
}

interface LaborForecast {
  forecast_id: string;
  department: Department;
  period_start: string;
  period_end: string;
  projected_labor_cost: number;
  budget: number;
  variance: number;
  variance_percent: number;
  forecast_confidence: number;
  drivers: any;
}

interface OvertimePrediction {
  prediction_id: string;
  staff_id: string;
  period_start: string;
  period_end: string;
  predicted_overtime_hours: number;
  predicted_overtime_cost: number;
  risk_level: RiskLevel;
  contributing_factors: any;
  recommendations: string[];
}

interface ShiftSwapRequest {
  swap_id: string;
  requester_staff_id: string;
  original_shift_id: string;
  proposed_staff_id: string;
  proposed_shift_id: string | null;
  reason: string;
  status: SwapStatus;
  requested_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

export default function StaffSchedulingOptimization() {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'preferences' | 'forecast' | 'overtime' | 'swaps' | 'budgets' | 'constraints'>('overview');
  const [, setLoading] = useState(false);
  const [saveToast, setSaveToast] = useState<{ show: boolean; msg: string; type: 'success' | 'error' }>({ show: false, msg: '', type: 'success' });

  // Data states
  const [schedules, setSchedules] = useState<OptimizedSchedule[]>([]);
  const [skills, setSkills] = useState<StaffSkill[]>([]);
  const [preferences, setPreferences] = useState<StaffPreference[]>([]);
  const [forecasts, setForecasts] = useState<LaborForecast[]>([]);
  const [overtimePredictions, setOvertimePredictions] = useState<OvertimePrediction[]>([]);
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);

  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<Department | 'all'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Modal states
  const [, setShowSkillModal] = useState(false);
  const [, setShowPreferenceModal] = useState(false);

  const triggerToast = (_msg: string, _type: 'success' | 'error' = 'success') => {
    setSaveToast((prev: { show: boolean; msg: string; type: 'success' | 'error' }) => ({ ...prev, show: false }));
    setTimeout(() => setSaveToast((prev: { show: boolean; msg: string; type: 'success' | 'error' }) => ({ ...prev, show: false })), 4000);
  };

  // API calls
  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/operations/scheduling/optimized-schedules?date=${selectedDate}${selectedDepartment !== 'all' ? `&department=${selectedDepartment}` : ''}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/operations/scheduling/staff-skills', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSkills(data);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/operations/scheduling/staff-preferences', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    }
  };

  const fetchForecasts = async () => {
    try {
      const response = await fetch('/api/operations/scheduling/labor-forecast', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setForecasts(data);
      }
    } catch (error) {
      console.error('Failed to fetch forecasts:', error);
    }
  };

  const fetchOvertimePredictions = async () => {
    try {
      const response = await fetch('/api/operations/scheduling/overtime-predictions', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOvertimePredictions(data);
      }
    } catch (error) {
      console.error('Failed to fetch overtime predictions:', error);
    }
  };

  const fetchSwapRequests = async () => {
    try {
      const response = await fetch('/api/operations/scheduling/shift-swaps', {
        headers: { Authorization: `Bearer ${localStorage.getItem('hotel_erp_session')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSwapRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch swap requests:', error);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchSchedules();
    fetchSkills();
    fetchPreferences();
    fetchForecasts();
    fetchOvertimePredictions();
    fetchSwapRequests();
  }, [selectedDate, selectedDepartment]);

  // Helper functions
  const getDepartmentLabel = (dept: Department | string) => {
    const labels: Record<string, string> = {
      'FrontOffice': 'Front Office',
      'Housekeeping': 'Housekeeping',
      'FandB': 'Food & Beverage',
      'Maintenance': 'Maintenance',
      'HR': 'HR',
      'Procurement': 'Procurement',
      'SalesEvents': 'Sales & Events',
      'GuestPortal': 'Guest Portal'
    };
    return labels[dept] || dept;
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case 'critical': return 'bg-rose-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-amber-500';
      case 'low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const getProficiencyColor = (level: ProficiencyLevel) => {
    switch (level) {
      case 'expert': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'advanced': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'intermediate': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'beginner': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getSkillIcon = (category: SkillCategory) => {
    switch (category) {
      case 'technical': return <Wrench className="w-4 h-4" />;
      case 'service': return <Heart className="w-4 h-4" />;
      case 'leadership': return <Shield className="w-4 h-4" />;
      case 'language': return <MessageSquare className="w-4 h-4" />;
      case 'certification': return <Award className="w-4 h-4" />;
      default: return <GraduationCap className="w-4 h-4" />;
    }
  };

  const getSwapStatusColor = (status: SwapStatus) => {
    switch (status) {
      case 'approved': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'pending': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'rejected': return 'text-rose-600 bg-rose-50 border-rose-200';
      case 'cancelled': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="staff-scheduling-optimization">
      {saveToast.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-sans font-bold border ${
          saveToast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' :
          'bg-rose-50 text-rose-800 border-rose-100'
        }`}>
          <CheckCircle size={16} className={saveToast.type === 'success' ? "text-emerald-600" : "text-rose-600"} />
          <span>{saveToast.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">Phase 2.1</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Advanced Staff Scheduling</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">AI-powered scheduling optimization with skill-based assignment</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => {
            switch(activeTab) {
              case 'overview': fetchSchedules(); break;
              case 'skills': fetchSkills(); break;
              case 'preferences': fetchPreferences(); break;
              case 'forecast': fetchForecasts(); break;
              case 'overtime': fetchOvertimePredictions(); break;
              case 'swaps': fetchSwapRequests(); break;
            }
            triggerToast('Data refreshed successfully');
          }} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-xs flex items-center gap-2 transition hover:bg-slate-50">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs shadow-lg flex items-center gap-2">
            <Brain size={14} /> AI Optimize
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <Users size={14} className="text-slate-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value as Department | 'all')}
              className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold"
            >
              <option value="all">All Departments</option>
              <option value="FrontOffice">Front Office</option>
              <option value="Housekeeping">Housekeeping</option>
              <option value="FandB">Food & Beverage</option>
              <option value="Maintenance">Maintenance</option>
              <option value="HR">HR</option>
              <option value="Procurement">Procurement</option>
              <option value="SalesEvents">Sales & Events</option>
              <option value="GuestPortal">Guest Portal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
            { id: 'skills' as const, label: 'Staff Skills', icon: Award },
            { id: 'preferences' as const, label: 'Preferences', icon: Heart },
            { id: 'forecast' as const, label: 'Labor Forecast', icon: TrendingUp },
            { id: 'overtime' as const, label: 'Overtime Risk', icon: AlertTriangle },
            { id: 'swaps' as const, label: 'Shift Swaps', icon: ArrowRightLeft },
            { id: 'budgets' as const, label: 'Budgets', icon: DollarSign },
            { id: 'constraints' as const, label: 'Constraints', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Key Metrics */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <Users className="w-8 h-8 opacity-80" />
                <span className="text-[10px] font-mono font-black bg-white/20 px-2 py-1 rounded">LIVE</span>
              </div>
              <div className="text-3xl font-black">{schedules.length}</div>
              <div className="text-[10px] opacity-80 font-bold uppercase tracking-wider">Optimized Schedules</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <Target className="w-8 h-8 text-emerald-600" />
                <div className={`w-2 h-2 rounded-full ${schedules.length > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {schedules.length > 0 ? Math.round(schedules.reduce((acc, s) => acc + s.coverage_score, 0) / schedules.length) : 0}%
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avg Coverage Score</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="w-8 h-8 text-amber-600" />
                <div className={`w-2 h-2 rounded-full ${forecasts.some(f => f.variance_percent < 0) ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                ${forecasts.reduce((acc, f) => acc + Math.abs(f.variance), 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Budget Variance</div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
                <div className={`w-2 h-2 rounded-full ${overtimePredictions.some(o => o.risk_level === 'critical' || o.risk_level === 'high') ? 'bg-rose-500' : 'bg-emerald-500'}`} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">
                {overtimePredictions.filter(o => o.risk_level === 'critical' || o.risk_level === 'high').length}
              </div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">High Risk Overtime</div>
            </div>

            {/* Recent Schedules */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Recent Optimized Schedules</h3>
              <div className="space-y-3">
                {schedules.slice(0, 5).map((schedule) => (
                  <div key={schedule.schedule_id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{schedule.date}</div>
                      <div className="text-[9px] text-slate-400 uppercase">{getDepartmentLabel(schedule.department)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-indigo-600">${schedule.total_labor_cost.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400">Coverage: {Math.round(schedule.coverage_score)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Swap Requests */}
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">Pending Swap Requests</h3>
              <div className="space-y-3">
                {swapRequests.filter(s => s.status === 'pending').slice(0, 5).map((swap) => (
                  <div key={swap.swap_id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">Shift #{swap.original_shift_id.slice(-4)}</div>
                      <div className="text-[9px] text-slate-400 uppercase">{swap.reason || 'No reason provided'}</div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-bold">Approve</button>
                      <button className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[9px] font-bold">Reject</button>
                    </div>
                  </div>
                ))}
                {swapRequests.filter(s => s.status === 'pending').length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">No pending swap requests</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Staff Skills Database</h3>
              <button onClick={() => setShowSkillModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                <Plus size={14} /> Add Skill
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Staff ID</th>
                    <th className="pb-3">Skill</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Proficiency</th>
                    <th className="pb-3">Certified</th>
                    <th className="pb-3">Last Verified</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {skills.map((skill) => (
                    <tr key={skill.skill_id} className="border-t border-slate-100 dark:border-slate-800">
                      <td className="py-3 text-xs font-bold text-slate-900 dark:text-white">{skill.staff_id}</td>
                      <td className="py-3 text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {getSkillIcon(skill.skill_category)}
                        {skill.skill_name}
                      </td>
                      <td className="py-3 text-xs text-slate-600 dark:text-slate-400 capitalize">{skill.skill_category}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${getProficiencyColor(skill.proficiency_level)}`}>
                          {skill.proficiency_level}
                        </span>
                      </td>
                      <td className="py-3">
                        {skill.certified ? (
                          <CheckCircle size={16} className="text-emerald-600" />
                        ) : (
                          <X size={16} className="text-slate-400" />
                        )}
                      </td>
                      <td className="py-3 text-xs text-slate-600 dark:text-slate-400">{skill.last_verified}</td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                            <Edit size={14} className="text-slate-400" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                            <Trash2 size={14} className="text-rose-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Staff Preferences</h3>
              <button onClick={() => setShowPreferenceModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                <Plus size={14} /> Add Preference
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {preferences.map((pref) => (
                <div key={pref.preference_id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-black text-slate-400 uppercase">{pref.staff_id}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                      pref.priority === 'essential' ? 'bg-rose-100 text-rose-700' :
                      pref.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                      pref.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {pref.priority}
                    </span>
                  </div>
                  <div className="text-xs font-black text-slate-900 dark:text-white capitalize mb-1">{pref.preference_type}</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-400">
                    {typeof pref.preference_value === 'string' ? pref.preference_value : JSON.stringify(pref.preference_value)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'forecast' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Labor Cost Forecast</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                <TrendingUp size={14} /> Generate Forecast
              </button>
            </div>
            
            <div className="space-y-4">
              {forecasts.map((forecast) => (
                <div key={forecast.forecast_id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{getDepartmentLabel(forecast.department)}</div>
                      <div className="text-[10px] text-slate-400">{forecast.period_start} to {forecast.period_end}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-[10px] font-bold ${
                      forecast.variance_percent < 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {forecast.variance_percent > 0 ? '+' : ''}{forecast.variance_percent.toFixed(1)}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Projected Cost</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">${forecast.projected_labor_cost.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Budget</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">${forecast.budget.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Confidence</div>
                      <div className="text-sm font-black text-indigo-600">{forecast.forecast_confidence}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'overtime' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Overtime Risk Predictions</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                <Zap size={14} /> Run Analysis
              </button>
            </div>
            
            <div className="space-y-4">
              {overtimePredictions.map((prediction) => (
                <div key={prediction.prediction_id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">{prediction.staff_id}</div>
                      <div className="text-[10px] text-slate-400">{prediction.period_start} to {prediction.period_end}</div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-bold text-white ${getRiskColor(prediction.risk_level)}`}>
                      <AlertTriangle size={12} />
                      {prediction.risk_level.toUpperCase()}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Predicted Hours</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">{prediction.predicted_overtime_hours.toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase">Predicted Cost</div>
                      <div className="text-sm font-black text-slate-900 dark:text-white">${prediction.predicted_overtime_cost.toLocaleString()}</div>
                    </div>
                  </div>
                  {prediction.recommendations.length > 0 && (
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase mb-2">Recommendations</div>
                      <ul className="space-y-1">
                        {prediction.recommendations.map((rec, idx) => (
                          <li key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                            <ChevronRight size={10} className="mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'swaps' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Shift Swap Requests</h3>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2">
                <Plus size={14} /> New Request
              </button>
            </div>
            
            <div className="space-y-4">
              {swapRequests.map((swap) => (
                <div key={swap.swap_id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-black text-slate-900 dark:text-white">Request #{swap.swap_id.slice(-6)}</div>
                      <div className="text-[10px] text-slate-400">{new Date(swap.requested_at).toLocaleString()}</div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold border ${getSwapStatusColor(swap.status)}`}>
                      {swap.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                    <span className="font-bold">From:</span> {swap.requester_staff_id} → <span className="font-bold">To:</span> {swap.proposed_staff_id}
                  </div>
                  {swap.reason && (
                    <div className="text-[10px] text-slate-500 italic">"{swap.reason}"</div>
                  )}
                  {swap.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">Approve</button>
                      <button className="px-3 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold">Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'budgets' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">Department Labor Budgets</h3>
            <div className="text-center py-12 text-slate-400 text-xs">
              Labor budget management interface coming soon
            </div>
          </div>
        )}

        {activeTab === 'constraints' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider mb-6">Scheduling Constraints</h3>
            <div className="text-center py-12 text-slate-400 text-xs">
              Scheduling constraints management interface coming soon
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
