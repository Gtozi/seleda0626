/**
 * Treatment Catalog Module
 * Manages spa treatment categories, services, pricing, and duration
 */

import { useState } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Edit,
  Trash2,
  Clock,
  DollarSign,
  Star,
  Filter,
  Grid3x3,
  List,
  MoreVertical
} from 'lucide-react';

interface Treatment {
  id: string;
  name: string;
  category: 'Massage' | 'Facial Treatments' | 'Body Treatments' | 'Beauty Services' | 'Wellness';
  duration: number;
  price: number;
  description: string;
  popular: boolean;
  therapistQualifications: string[];
  roomType: string;
}

const TreatmentCatalogModule: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([
    {
      id: 'TRT-001',
      name: 'Swedish Massage',
      category: 'Massage',
      duration: 60,
      price: 120,
      description: 'Classic full-body massage using long, flowing strokes to promote relaxation',
      popular: true,
      therapistQualifications: ['Massage Therapy Certification'],
      roomType: 'Massage Room'
    },
    {
      id: 'TRT-002',
      name: 'Deep Tissue Massage',
      category: 'Massage',
      duration: 90,
      price: 150,
      description: 'Intensive massage targeting deeper muscle layers and chronic tension',
      popular: true,
      therapistQualifications: ['Advanced Massage Certification', '2 years experience'],
      roomType: 'Massage Room'
    },
    {
      id: 'TRT-003',
      name: 'Hot Stone Massage',
      category: 'Massage',
      duration: 75,
      price: 165,
      description: 'Therapeutic massage using heated stones to relax muscles deeply',
      popular: false,
      therapistQualifications: ['Hot Stone Therapy Certification'],
      roomType: 'Massage Room'
    },
    {
      id: 'TRT-004',
      name: 'Hydrating Facial',
      category: 'Facial Treatments',
      duration: 45,
      price: 95,
      description: 'Intensive moisture treatment for dry, dehydrated skin',
      popular: true,
      therapistQualifications: ['Esthetician License'],
      roomType: 'Facial Room'
    },
    {
      id: 'TRT-005',
      name: 'Anti-Aging Facial',
      category: 'Facial Treatments',
      duration: 60,
      price: 135,
      description: 'Advanced treatment targeting fine lines and wrinkles',
      popular: false,
      therapistQualifications: ['Advanced Esthetician License', 'Product Training'],
      roomType: 'Facial Room'
    },
    {
      id: 'TRT-006',
      name: 'Body Scrub',
      category: 'Body Treatments',
      duration: 30,
      price: 85,
      description: 'Exfoliating full-body treatment using natural sea salts',
      popular: false,
      therapistQualifications: ['Body Treatment Certification'],
      roomType: 'Massage Room'
    },
    {
      id: 'TRT-007',
      name: 'Haircut & Styling',
      category: 'Beauty Services',
      duration: 45,
      price: 75,
      description: 'Professional haircut and styling session',
      popular: true,
      therapistQualifications: ['Cosmetology License'],
      roomType: 'Salon Station'
    },
    {
      id: 'TRT-008',
      name: 'Yoga Session',
      category: 'Wellness',
      duration: 60,
      price: 45,
      description: 'Guided yoga practice for all skill levels',
      popular: false,
      therapistQualifications: ['Yoga Instructor Certification (RYT-200)'],
      roomType: 'Yoga Studio'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showNewTreatmentModal, setShowNewTreatmentModal] = useState(false);

  const categories = ['All', 'Massage', 'Facial Treatments', 'Body Treatments', 'Beauty Services', 'Wellness'];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Massage':
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400';
      case 'Facial Treatments':
        return 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400';
      case 'Body Treatments':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-700/50 dark:text-green-400';
      case 'Beauty Services':
        return 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:border-rose-700/50 dark:text-rose-400';
      case 'Wellness':
        return 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:border-cyan-700/50 dark:text-cyan-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || treatment.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Treatment Catalog</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage spa treatments, pricing, and service categories
          </p>
        </div>
        <button
          onClick={() => setShowNewTreatmentModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Add Treatment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  categoryFilter === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <Grid3x3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Treatments Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTreatments.map((treatment) => (
            <div key={treatment.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(treatment.category)}`}>
                  {treatment.category}
                </span>
                {treatment.popular && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-medium">Popular</span>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{treatment.name}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{treatment.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{treatment.duration} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <DollarSign size={14} />
                  <span>{treatment.price}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs text-slate-500 dark:text-slate-400">{treatment.roomType}</span>
                <div className="flex gap-2">
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
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Treatment
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredTreatments.map((treatment) => (
                <tr key={treatment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {treatment.popular && <Star size={16} className="text-amber-500 fill-amber-500" />}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{treatment.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{treatment.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(treatment.category)}`}>
                      {treatment.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                    {treatment.duration} min
                  </td>
                  <td className="px-4 py-4 font-medium text-slate-900 dark:text-white">
                    ${treatment.price}
                  </td>
                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                    {treatment.roomType}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                        <Edit size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Treatment Modal Placeholder */}
      {showNewTreatmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add New Treatment</h2>
              <button
                onClick={() => setShowNewTreatmentModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Treatment creation form would be implemented here with category selection, pricing, duration, and qualification requirements.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewTreatmentModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Add Treatment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentCatalogModule;