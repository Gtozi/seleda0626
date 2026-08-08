/**
 * Therapist Management Module
 * Manages therapist profiles, scheduling, certifications, and performance
 */

import { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Star,
  Award,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  MoreVertical,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

interface TherapistManagementModuleProps {
  selectedTherapistId?: string;
  onClearSelectedTherapistId?: () => void;
}

interface Therapist {
  id: string;
  name: string;
  title: string;
  specializations: string[];
  certifications: string[];
  languages: string[];
  status: 'Active' | 'On Leave' | 'Inactive';
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  rating: number;
  totalAppointments: number;
  revenueGenerated: number;
  completionRate: number;
  email: string;
  phone: string;
  hireDate: string;
}

const TherapistManagementModule: React.FC<TherapistManagementModuleProps> = ({
  selectedTherapistId,
  onClearSelectedTherapistId
}) => {
  const [therapists, setTherapists] = useState<Therapist[]>([
    {
      id: 'THP-001',
      name: 'Emily Chen',
      title: 'Senior Massage Therapist',
      specializations: ['Swedish Massage', 'Deep Tissue', 'Hot Stone', 'Aromatherapy'],
      certifications: ['Licensed Massage Therapist (LMT)', 'Hot Stone Therapy Certified'],
      languages: ['English', 'Mandarin'],
      status: 'Active',
      employmentType: 'Full-time',
      rating: 4.9,
      totalAppointments: 1245,
      revenueGenerated: 149400,
      completionRate: 98,
      email: 'emily.chen@spahotel.com',
      phone: '+1-555-0101',
      hireDate: '2022-03-15'
    },
    {
      id: 'THP-002',
      name: 'David Miller',
      title: 'Massage Therapist',
      specializations: ['Swedish Massage', 'Sports Massage', 'Reflexology'],
      certifications: ['Licensed Massage Therapist (LMT)', 'Sports Massage Certified'],
      languages: ['English', 'Spanish'],
      status: 'Active',
      employmentType: 'Full-time',
      rating: 4.7,
      totalAppointments: 892,
      revenueGenerated: 107040,
      completionRate: 96,
      email: 'david.miller@spahotel.com',
      phone: '+1-555-0102',
      hireDate: '2023-01-10'
    },
    {
      id: 'THP-003',
      name: 'Lisa Park',
      title: 'Esthetician',
      specializations: ['Facials', 'Body Treatments', 'Skincare Consultation'],
      certifications: ['Licensed Esthetician', 'Advanced Skincare Certified'],
      languages: ['English', 'Korean'],
      status: 'Active',
      employmentType: 'Full-time',
      rating: 4.8,
      totalAppointments: 756,
      revenueGenerated: 71700,
      completionRate: 97,
      email: 'lisa.park@spahotel.com',
      phone: '+1-555-0103',
      hireDate: '2022-08-20'
    },
    {
      id: 'THP-004',
      name: 'Sarah Johnson',
      title: 'Beauty Therapist',
      specializations: ['Hair Styling', 'Makeup', 'Manicure', 'Pedicure'],
      certifications: ['Cosmetology License', 'Makeup Artist Certified'],
      languages: ['English'],
      status: 'On Leave',
      employmentType: 'Part-time',
      rating: 4.6,
      totalAppointments: 423,
      revenueGenerated: 31725,
      completionRate: 94,
      email: 'sarah.johnson@spahotel.com',
      phone: '+1-555-0104',
      hireDate: '2023-06-01'
    },
    {
      id: 'THP-005',
      name: 'Michael Brown',
      title: 'Personal Trainer',
      specializations: ['Fitness Training', 'Yoga', 'Nutrition Coaching'],
      certifications: ['NASM Certified Personal Trainer', 'Yoga Instructor (RYT-200)'],
      languages: ['English', 'French'],
      status: 'Active',
      employmentType: 'Full-time',
      rating: 4.9,
      totalAppointments: 567,
      revenueGenerated: 28350,
      completionRate: 99,
      email: 'michael.brown@spahotel.com',
      phone: '+1-555-0105',
      hireDate: '2022-11-15'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [specializationFilter, setSpecializationFilter] = useState<string>('All');
  const [showNewTherapistModal, setShowNewTherapistModal] = useState(false);

  const specializations = ['All', 'Massage', 'Facials', 'Body Treatments', 'Hair Styling', 'Fitness Training', 'Yoga'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'On Leave':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Inactive':
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const filteredTherapists = therapists.filter(therapist => {
    const matchesSearch = therapist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         therapist.specializations.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || therapist.status === statusFilter;
    const matchesSpecialization = specializationFilter === 'All' || 
                                  therapist.specializations.some(s => s.toLowerCase().includes(specializationFilter.toLowerCase()));
    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Therapist Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage therapist profiles, schedules, and performance
          </p>
        </div>
        <button
          onClick={() => setShowNewTherapistModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Add Therapist
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
                placeholder="Search therapists..."
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
            <option value="On Leave">On Leave</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {specializations.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Therapists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTherapists.map((therapist) => (
          <div key={therapist.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                  <User size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{therapist.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{therapist.title}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(therapist.status)}`}>
                {therapist.status}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Award size={14} />
                <span className="truncate">{therapist.specializations.slice(0, 2).join(', ')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Mail size={14} />
                <span className="truncate">{therapist.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Phone size={14} />
                <span>{therapist.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                  <Star size={14} fill="currentColor" />
                  <span className="font-semibold text-slate-900 dark:text-white">{therapist.rating}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Rating</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">{therapist.totalAppointments}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Appointments</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">${(therapist.revenueGenerated / 1000).toFixed(1)}k</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Revenue</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900 dark:text-white mb-1">{therapist.completionRate}%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Completion</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">{therapist.employmentType}</span>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Calendar size={16} />
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

      {/* New Therapist Modal Placeholder */}
      {showNewTherapistModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Therapist</h2>
              <button
                onClick={() => setShowNewTherapistModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Therapist creation form would be implemented here with personal information, certifications, specializations, and employment details.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewTherapistModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Add Therapist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistManagementModule;