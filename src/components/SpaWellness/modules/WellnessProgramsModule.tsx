/**
 * Wellness Programs Module
 * Manages structured wellness programs with progress tracking and milestones
 */

import { useState } from 'react';
import {
  Target,
  Plus,
  Search,
  Edit,
  Trash2,
  Users,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  MoreVertical,
  Play,
  Pause
} from 'lucide-react';

interface WellnessProgramsModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface WellnessProgram {
  id: string;
  name: string;
  type: 'Weight Management' | 'Detox Program' | 'Stress Relief' | 'Fitness Transformation' | 'Corporate Wellness' | 'Holistic Wellness' | 'Senior Wellness';
  description: string;
  duration: number;
  sessions: number;
  price: number;
  enrolledGuests: number;
  capacity: number;
  status: 'Active' | 'Upcoming' | 'Completed' | 'Suspended';
  startDate: string;
  endDate: string;
  instructor: string;
  progressTracking: boolean;
  milestones: string[];
}

const WellnessProgramsModule: React.FC<WellnessProgramsModuleProps> = ({
  onViewGuestProfile
}) => {
  const [programs, setPrograms] = useState<WellnessProgram[]>([
    {
      id: 'PRG-001',
      name: '21-Day Detox Program',
      type: 'Detox Program',
      description: 'Comprehensive detox program with nutrition guidance, spa treatments, and lifestyle coaching',
      duration: 21,
      sessions: 12,
      price: 899,
      enrolledGuests: 8,
      capacity: 10,
      status: 'Active',
      startDate: '2026-07-10',
      endDate: '2026-07-31',
      instructor: 'Dr. Sarah Miller',
      progressTracking: true,
      milestones: ['Initial Assessment', 'Week 1 Check-in', 'Week 2 Check-in', 'Final Assessment']
    },
    {
      id: 'PRG-002',
      name: 'Stress Relief Retreat',
      type: 'Stress Relief',
      description: 'Weekend retreat focusing on meditation, yoga, and relaxation techniques',
      duration: 3,
      sessions: 6,
      price: 450,
      enrolledGuests: 12,
      capacity: 15,
      status: 'Active',
      startDate: '2026-07-28',
      endDate: '2026-07-30',
      instructor: 'Michael Brown',
      progressTracking: true,
      milestones: ['Arrival & Orientation', 'Day 1 Sessions', 'Day 2 Sessions', 'Departure']
    },
    {
      id: 'PRG-003',
      name: 'Corporate Wellness Challenge',
      type: 'Corporate Wellness',
      description: '8-week team-based wellness competition for corporate groups',
      duration: 56,
      sessions: 16,
      price: 2500,
      enrolledGuests: 24,
      capacity: 30,
      status: 'Active',
      startDate: '2026-07-01',
      endDate: '2026-08-26',
      instructor: 'Lisa Park',
      progressTracking: true,
      milestones: ['Kickoff', 'Week 2', 'Week 4', 'Week 6', 'Final Awards']
    },
    {
      id: 'PRG-004',
      name: 'Senior Wellness Program',
      type: 'Senior Wellness',
      description: 'Gentle fitness and wellness activities designed for seniors',
      duration: 30,
      sessions: 10,
      price: 299,
      enrolledGuests: 15,
      capacity: 20,
      status: 'Upcoming',
      startDate: '2026-08-05',
      endDate: '2026-09-04',
      instructor: 'Emily Chen',
      progressTracking: true,
      milestones: ['Initial Assessment', 'Week 2', 'Week 4', 'Week 6', 'Final Assessment']
    },
    {
      id: 'PRG-005',
      name: 'Fitness Transformation',
      type: 'Fitness Transformation',
      description: 'Intensive 6-week fitness program with personal training and nutrition planning',
      duration: 42,
      sessions: 24,
      price: 1299,
      enrolledGuests: 6,
      capacity: 8,
      status: 'Active',
      startDate: '2026-07-15',
      endDate: '2026-08-26',
      instructor: 'David Miller',
      progressTracking: true,
      milestones: ['Baseline Assessment', 'Week 2', 'Week 4', 'Week 6', 'Final Assessment']
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showNewProgramModal, setShowNewProgramModal] = useState(false);

  const programTypes = ['All', 'Weight Management', 'Detox Program', 'Stress Relief', 'Fitness Transformation', 'Corporate Wellness', 'Holistic Wellness', 'Senior Wellness'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Completed':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
      case 'Suspended':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || program.status === statusFilter;
    const matchesType = typeFilter === 'All' || program.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wellness Programs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage structured wellness programs with progress tracking
          </p>
        </div>
        <button
          onClick={() => setShowNewProgramModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Program
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search programs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {programTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrograms.map((program) => (
          <div key={program.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <Target size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{program.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{program.type}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(program.status)}`}>
                {program.status}
              </span>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{program.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">{program.duration} days</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Duration</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">{program.sessions}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Sessions</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">${program.price}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Price</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">{program.enrolledGuests}/{program.capacity}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Enrolled</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Users size={14} />
                <span className="truncate">Instructor: {program.instructor}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={14} />
                <span>{new Date(program.startDate).toLocaleDateString()} - {new Date(program.endDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1">
                {program.progressTracking && <CheckCircle2 size={14} className="text-emerald-500" />}
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {program.progressTracking ? 'Progress Tracking' : 'No Tracking'}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <TrendingUp size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Program Modal Placeholder */}
      {showNewProgramModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Wellness Program</h2>
              <button
                onClick={() => setShowNewProgramModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Wellness program creation form would be implemented here with program type, duration, sessions, pricing, and milestone configuration.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewProgramModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WellnessProgramsModule;