/**
 * Guest Wellness Profiles Module
 * Manages guest wellness goals, medical notes, preferences, and treatment history
 */

import { useState } from 'react';
import {
  User,
  Plus,
  Search,
  Edit,
  Heart,
  AlertTriangle,
  Star,
  Calendar,
  FileText,
  Activity,
  Shield,
  Sparkles,
  MoreVertical,
  XCircle
} from 'lucide-react';

interface GuestWellnessProfilesModuleProps {
  selectedGuestId?: string;
  onClearSelectedGuestId?: () => void;
}

interface WellnessProfile {
  id: string;
  guestName: string;
  guestId: string;
  wellnessGoals: string[];
  medicalNotes: string;
  allergies: string[];
  skinType: 'Normal' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive';
  treatmentPreferences: string[];
  contraindications: string[];
  previousTreatments: { treatment: string; date: string; rating: number }[];
  favoriteTherapist: string;
  preferredPressure: 'Light' | 'Medium' | 'Firm' | 'Extra Firm';
  communicationPreference: 'Email' | 'SMS' | 'Phone' | 'In-Person';
  lastVisit: string;
  totalVisits: number;
  totalSpent: number;
}

const GuestWellnessProfilesModule: React.FC<GuestWellnessProfilesModuleProps> = ({
  selectedGuestId,
  onClearSelectedGuestId
}) => {
  const [profiles, setProfiles] = useState<WellnessProfile[]>([
    {
      id: 'WLP-001',
      guestName: 'Sarah Johnson',
      guestId: 'GST-001',
      wellnessGoals: ['Stress Relief', 'Muscle Tension Reduction', 'Better Sleep'],
      medicalNotes: 'History of lower back pain. Avoid deep pressure on lumbar region.',
      allergies: ['Lavender', 'Peanut Oil'],
      skinType: 'Sensitive',
      treatmentPreferences: ['Swedish Massage', 'Aromatherapy', 'Hot Stone'],
      contraindications: ['Deep Tissue on lower back', 'Heat therapy if inflammation present'],
      previousTreatments: [
        { treatment: 'Swedish Massage', date: '2026-07-15', rating: 5 },
        { treatment: 'Hot Stone Massage', date: '2026-06-20', rating: 4 },
        { treatment: 'Aromatherapy', date: '2026-05-10', rating: 5 }
      ],
      favoriteTherapist: 'Emily Chen',
      preferredPressure: 'Light',
      communicationPreference: 'Email',
      lastVisit: '2026-07-15',
      totalVisits: 12,
      totalSpent: 1440
    },
    {
      id: 'WLP-002',
      guestName: 'Michael Williams',
      guestId: 'GST-002',
      wellnessGoals: ['Pain Management', 'Sports Recovery', 'Flexibility Improvement'],
      medicalNotes: 'Former athlete with shoulder injuries. Focus on mobility work.',
      allergies: ['None known'],
      skinType: 'Normal',
      treatmentPreferences: ['Deep Tissue', 'Sports Massage', 'Reflexology'],
      contraindications: ['None'],
      previousTreatments: [
        { treatment: 'Deep Tissue Massage', date: '2026-07-10', rating: 5 },
        { treatment: 'Sports Massage', date: '2026-06-15', rating: 5 }
      ],
      favoriteTherapist: 'David Miller',
      preferredPressure: 'Firm',
      communicationPreference: 'SMS',
      lastVisit: '2026-07-10',
      totalVisits: 8,
      totalSpent: 1200
    },
    {
      id: 'WLP-003',
      guestName: 'Emma Davis',
      guestId: 'GST-003',
      wellnessGoals: ['Skin Hydration', 'Anti-Aging', 'Glow'],
      medicalNotes: 'No significant medical history. Focus on skincare.',
      allergies: ['Fragrances', 'Sulfates'],
      skinType: 'Dry',
      treatmentPreferences: ['Hydrating Facial', 'Anti-Aging Facial', 'Body Scrub'],
      contraindications: ['Products with fragrances', 'Harsh exfoliants'],
      previousTreatments: [
        { treatment: 'Hydrating Facial', date: '2026-07-20', rating: 5 },
        { treatment: 'Anti-Aging Facial', date: '2026-06-25', rating: 4 }
      ],
      favoriteTherapist: 'Lisa Park',
      preferredPressure: 'Medium',
      communicationPreference: 'Email',
      lastVisit: '2026-07-20',
      totalVisits: 6,
      totalSpent: 570
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [skinTypeFilter, setSkinTypeFilter] = useState<string>('All');
  const [showNewProfileModal, setShowNewProfileModal] = useState(false);

  const skinTypes = ['All', 'Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'];

  const getSkinTypeColor = (skinType: string) => {
    switch (skinType) {
      case 'Normal':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Dry':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      case 'Oily':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Combination':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400';
      case 'Sensitive':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profile.wellnessGoals.some(g => g.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSkinType = skinTypeFilter === 'All' || profile.skinType === skinTypeFilter;
    return matchesSearch && matchesSkinType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Guest Wellness Profiles</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage guest wellness goals, preferences, and treatment history
          </p>
        </div>
        <button
          onClick={() => setShowNewProfileModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          New Profile
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
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={skinTypeFilter}
            onChange={(e) => setSkinTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {skinTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredProfiles.map((profile) => (
          <div key={profile.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center">
                  <User size={24} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{profile.guestName}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.guestId}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getSkinTypeColor(profile.skinType)}`}>
                {profile.skinType}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">{profile.totalVisits}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Visits</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">${profile.totalSpent}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Total Spent</div>
              </div>
              <div className="text-center p-3 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">{profile.preferredPressure}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Pressure</div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <Heart size={14} className="text-rose-500" />
                  Wellness Goals
                </div>
                <div className="flex flex-wrap gap-1">
                  {profile.wellnessGoals.map((goal, index) => (
                    <span key={index} className="px-2 py-0.5 bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 rounded text-xs">
                      {goal}
                    </span>
                  ))}
                </div>
              </div>

              {profile.allergies.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    <AlertTriangle size={14} className="text-amber-500" />
                    Allergies
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {profile.allergies.map((allergy, index) => (
                      <span key={index} className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded text-xs">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <Star size={14} className="text-amber-500" />
                  Favorite Therapist
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{profile.favoriteTherapist}</div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Last visit: {new Date(profile.lastVisit).toLocaleDateString()}
              </span>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <FileText size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Profile Modal Placeholder */}
      {showNewProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create Wellness Profile</h2>
              <button
                onClick={() => setShowNewProfileModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <XCircle size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Wellness profile creation form would be implemented here with guest selection, wellness goals, medical notes, and preferences.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewProfileModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Create Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestWellnessProfilesModule;