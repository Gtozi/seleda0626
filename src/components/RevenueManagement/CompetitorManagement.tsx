/**
 * Competitor Management Component
 * Manages competitor properties and rate tracking
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  MapPin,
  Star,
  RefreshCw,
  MoreVertical,
  Building2,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  TrendingUp,
  Activity
} from 'lucide-react';

interface Competitor {
  id: string;
  name: string;
  starRating: number;
  proximity: string; // 'same_area', 'nearby', 'city_wide'
  distance: number; // in km
  contactEmail: string;
  contactPhone: string;
  website: string;
  active: boolean;
  roomMappings: CompetitorRoomMapping[];
  lastRateUpdate: string;
}

interface CompetitorRoomMapping {
  id: string;
  ourRoomType: string;
  theirRoomType: string;
  qualityScore: number;
}

interface CompetitorRate {
  id: string;
  competitorId: string;
  roomType: string;
  date: string;
  rate: number;
  currency: string;
  availability: boolean;
  collectedAt: string;
  source: 'api' | 'manual';
}

const CompetitorManagement = () => {
  const [view, setView] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRateHistory, setShowRateHistory] = useState(false);
  const [selectedCompetitorForRates, setSelectedCompetitorForRates] = useState<string | null>(null);

  // Mock data
  const competitors = useMemo<Competitor[]>(() => [
    {
      id: '1',
      name: 'Hotel A',
      starRating: 4,
      proximity: 'same_area',
      distance: 0.5,
      contactEmail: 'rates@hotela.com',
      contactPhone: '+251 911 123 456',
      website: 'https://hotela.com',
      active: true,
      roomMappings: [
        { id: '1', ourRoomType: 'Deluxe Suite', theirRoomType: 'Executive Suite', qualityScore: 0.9 },
        { id: '2', ourRoomType: 'Standard Room', theirRoomType: 'Standard Room', qualityScore: 1.0 },
      ],
      lastRateUpdate: '2026-07-19T10:00:00Z'
    },
    {
      id: '2',
      name: 'Hotel B',
      starRating: 3,
      proximity: 'nearby',
      distance: 1.2,
      contactEmail: 'reservations@hotelb.com',
      contactPhone: '+251 911 234 567',
      website: 'https://hotelb.com',
      active: true,
      roomMappings: [
        { id: '3', ourRoomType: 'Deluxe Suite', theirRoomType: 'Deluxe Room', qualityScore: 0.85 },
      ],
      lastRateUpdate: '2026-07-19T09:30:00Z'
    },
    {
      id: '3',
      name: 'Hotel C',
      starRating: 5,
      proximity: 'city_wide',
      distance: 3.5,
      contactEmail: 'sales@hotelc.com',
      contactPhone: '+251 911 345 678',
      website: 'https://hotelc.com',
      active: true,
      roomMappings: [
        { id: '4', ourRoomType: 'Ocean View', theirRoomType: 'Ocean Suite', qualityScore: 0.95 },
        { id: '5', ourRoomType: 'Family Suite', theirRoomType: 'Family Room', qualityScore: 0.88 },
      ],
      lastRateUpdate: '2026-07-19T08:00:00Z'
    }
  ], []);

  const competitorRates = useMemo<CompetitorRate[]>(() => [
    { id: '1', competitorId: '1', roomType: 'Deluxe Suite', date: '2026-07-19', rate: 155, currency: 'ETB', availability: true, collectedAt: '2026-07-19T10:00:00Z', source: 'api' },
    { id: '2', competitorId: '1', roomType: 'Standard Room', date: '2026-07-19', rate: 105, currency: 'ETB', availability: true, collectedAt: '2026-07-19T10:00:00Z', source: 'api' },
    { id: '3', competitorId: '2', roomType: 'Deluxe Suite', date: '2026-07-19', rate: 145, currency: 'ETB', availability: true, collectedAt: '2026-07-19T09:30:00Z', source: 'api' },
    { id: '4', competitorId: '3', roomType: 'Ocean View', date: '2026-07-19', rate: 195, currency: 'ETB', availability: false, collectedAt: '2026-07-19T08:00:00Z', source: 'api' },
  ], []);

  // New competitor analysis metrics
  const competitorAnalysis = useMemo(() => [
    { id: 1, competitor: 'Hotel A', marketShare: 22, ratePosition: 'premium', occupancy: 78, adr: 145, revpar: 113 },
    { id: 2, competitor: 'Hotel B', marketShare: 18, ratePosition: 'competitive', occupancy: 82, adr: 138, revpar: 113 },
    { id: 3, competitor: 'Hotel C', marketShare: 15, ratePosition: 'luxury', occupancy: 75, adr: 152, revpar: 114 },
  ], []);

  const parityAlerts = useMemo(() => [
    { id: 1, channel: 'Booking.com', competitor: 'Hotel A', ourRate: 150, competitorRate: 135, variance: -10, severity: 'high' },
    { id: 2, channel: 'Expedia', competitor: 'Hotel B', ourRate: 150, competitorRate: 145, variance: -3, severity: 'medium' },
  ], []);

  const filteredCompetitors = useMemo(() => {
    if (!searchQuery) return competitors;
    return competitors.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [competitors, searchQuery]);

  const handleAddCompetitor = () => {
    setSelectedCompetitor(null);
    setView('add');
  };

  const handleEditCompetitor = (competitor: Competitor) => {
    setSelectedCompetitor(competitor);
    setView('edit');
  };

  const handleDeleteCompetitor = (id: string) => {
    console.log('Delete competitor:', id);
  };

  const handleViewRateHistory = (competitorId: string) => {
    setSelectedCompetitorForRates(competitorId);
    setShowRateHistory(true);
  };

  const handleRefreshRates = async () => {
    console.log('Refreshing competitor rates');
  };

  const getProximityLabel = (proximity: string) => {
    const labels = {
      same_area: 'Same Area',
      nearby: 'Nearby',
      city_wide: 'City Wide'
    };
    return labels[proximity as keyof typeof labels] || proximity;
  };

  const getProximityColor = (proximity: string) => {
    const colors = {
      same_area: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      nearby: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      city_wide: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
    };
    return colors[proximity as keyof typeof colors] || 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300';
  };

  return (
    <div className="p-6 space-y-6">
      {view === 'list' && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Competitor Management</h2>
              <p className="text-slate-600 dark:text-slate-400">Track competitor rates and market positioning</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshRates}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Rates
              </button>
              <button
                onClick={handleAddCompetitor}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Competitor
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search competitors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400"
            />
          </div>

          {/* Competitor List */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Competitor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Proximity
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Room Mappings
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Last Update
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredCompetitors.map((competitor) => (
                  <CompetitorRow
                    key={competitor.id}
                    competitor={competitor}
                    rates={competitorRates.filter(r => r.competitorId === competitor.id)}
                    onEdit={() => handleEditCompetitor(competitor)}
                    onDelete={() => handleDeleteCompetitor(competitor.id)}
                    onViewRates={() => handleViewRateHistory(competitor.id)}
                    getProximityLabel={getProximityLabel}
                    getProximityColor={getProximityColor}
                  />
                ))}
              </tbody>
            </table>
            {filteredCompetitors.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">No competitors found</p>
              </div>
            )}
          </div>

          {/* Competitor Analysis */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Competitor Analysis</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View Detailed Analysis
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {competitorAnalysis.map((analysis) => (
                <CompetitorAnalysisCard key={analysis.id} analysis={analysis} />
              ))}
            </div>
          </div>

          {/* Rate Parity Alerts */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rate Parity Alerts</h3>
              <span className="text-sm text-slate-600 dark:text-slate-400">{parityAlerts.length} active alerts</span>
            </div>
            <div className="space-y-3">
              {parityAlerts.map((alert) => (
                <ParityAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          {/* Rate History Modal */}
          {showRateHistory && selectedCompetitorForRates && (
            <RateHistoryModal
              competitor={competitors.find(c => c.id === selectedCompetitorForRates)!}
              rates={competitorRates.filter(r => r.competitorId === selectedCompetitorForRates)}
              onClose={() => {
                setShowRateHistory(false);
                setSelectedCompetitorForRates(null);
              }}
            />
          )}
        </>
      )}

      {view === 'add' && (
        <CompetitorForm
          mode="add"
          onCancel={() => setView('list')}
          onSave={() => setView('list')}
        />
      )}

      {view === 'edit' && selectedCompetitor && (
        <CompetitorForm
          mode="edit"
          competitor={selectedCompetitor}
          onCancel={() => setView('list')}
          onSave={() => setView('list')}
        />
      )}
    </div>
  );
};

interface CompetitorRowProps {
  competitor: Competitor;
  rates: CompetitorRate[];
  onEdit: () => void;
  onDelete: () => void;
  onViewRates: () => void;
  getProximityLabel: (proximity: string) => string;
  getProximityColor: (proximity: string) => string;
}

const CompetitorRow: React.FC<CompetitorRowProps> = ({
  competitor,
  rates,
  onEdit,
  onDelete,
  onViewRates,
  getProximityLabel,
  getProximityColor
}) => {
  const avgRate = rates.length > 0
    ? Math.round(rates.reduce((sum, r) => sum + r.rate, 0) / rates.length)
    : 0;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{competitor.name}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{competitor.contactEmail}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < competitor.starRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
            />
          ))}
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProximityColor(competitor.proximity)}`}>
            {getProximityLabel(competitor.proximity)}
          </span>
          <span className="text-sm text-slate-600 dark:text-slate-400">{competitor.distance} km</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{competitor.roomMappings.length} rooms</p>
        <p className="text-sm text-slate-500 dark:text-slate-500">Avg rate: ${avgRate}</p>
      </td>
      <td className="px-4 py-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(competitor.lastRateUpdate).toLocaleString()}
        </p>
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          competitor.active
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}>
          {competitor.active ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              Active
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3" />
              Inactive
            </>
          )}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            onClick={onViewRates}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="View Rates"
          >
            <DollarSign className="w-5 h-5 text-slate-400" />
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
};

interface RateHistoryModalProps {
  competitor: Competitor;
  rates: CompetitorRate[];
  onClose: () => void;
}

const RateHistoryModal: React.FC<RateHistoryModalProps> = ({ competitor, rates, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{competitor.name} - Rate History</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">Competitor rate tracking</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
        <div className="p-6 overflow-auto max-h-[60vh]">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Room Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Availability
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Source
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {rates.map((rate) => (
                <tr key={rate.id}>
                  <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{rate.roomType}</td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">${rate.rate}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{new Date(rate.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      rate.availability
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    }`}>
                      {rate.availability ? 'Available' : 'Sold Out'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{rate.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rates.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">No rate history available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CompetitorFormProps {
  mode: 'add' | 'edit';
  competitor?: Competitor;
  onCancel: () => void;
  onSave: () => void;
}

const CompetitorForm: React.FC<CompetitorFormProps> = ({ mode, competitor, onCancel, onSave }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
          {mode === 'add' ? 'Add New Competitor' : 'Edit Competitor'}
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          {mode === 'add' ? 'Enter competitor details to add to tracking' : 'Update competitor information'}
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Competitor Name
          </label>
          <input
            type="text"
            defaultValue={competitor?.name}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Enter competitor name"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Star Rating
            </label>
            <select
              defaultValue={competitor?.starRating || 4}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>{rating} Stars</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Proximity
            </label>
            <select
              defaultValue={competitor?.proximity || 'nearby'}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            >
              <option value="same_area">Same Area</option>
              <option value="nearby">Nearby</option>
              <option value="city_wide">City Wide</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Distance (km)
          </label>
          <input
            type="number"
            step="0.1"
            defaultValue={competitor?.distance || 1}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="Enter distance"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Email
            </label>
            <input
              type="email"
              defaultValue={competitor?.contactEmail}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Contact Phone
            </label>
            <input
              type="tel"
              defaultValue={competitor?.contactPhone}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="+251 911 123 456"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Website
          </label>
          <input
            type="url"
            defaultValue={competitor?.website}
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {mode === 'add' ? 'Add Competitor' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

interface CompetitorAnalysisCardProps {
  analysis: {
    id: number;
    competitor: string;
    marketShare: number;
    ratePosition: string;
    occupancy: number;
    adr: number;
    revpar: number;
  };
}

const CompetitorAnalysisCard: React.FC<CompetitorAnalysisCardProps> = ({ analysis }) => {
  const positionColors = {
    premium: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    competitive: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    luxury: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
  };

  return (
    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-slate-900 dark:text-white">{analysis.competitor}</h4>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${positionColors[analysis.ratePosition as keyof typeof positionColors]}`}>
          {analysis.ratePosition}
        </span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Market Share</span>
          <span className="font-medium text-slate-900 dark:text-white">{analysis.marketShare}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">Occupancy</span>
          <span className="font-medium text-slate-900 dark:text-white">{analysis.occupancy}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">ADR</span>
          <span className="font-medium text-slate-900 dark:text-white">${analysis.adr}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600 dark:text-slate-400">RevPAR</span>
          <span className="font-medium text-slate-900 dark:text-white">${analysis.revpar}</span>
        </div>
      </div>
    </div>
  );
};

interface ParityAlertCardProps {
  alert: {
    id: number;
    channel: string;
    competitor: string;
    ourRate: number;
    competitorRate: number;
    variance: number;
    severity: string;
  };
}

const ParityAlertCard: React.FC<ParityAlertCardProps> = ({ alert }) => {
  const severityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    medium: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    low: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
  };

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${severityColors[alert.severity as keyof typeof severityColors]}`}>
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5" />
        <div>
          <h4 className="font-medium text-slate-900 dark:text-white">{alert.channel}</h4>
          <p className="text-sm text-slate-600 dark:text-slate-400">{alert.competitor}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm text-slate-600 dark:text-slate-400">Our: ${alert.ourRate} vs Their: ${alert.competitorRate}</p>
        <p className={`text-sm font-medium ${alert.variance < 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
          {alert.variance}% variance
        </p>
      </div>
    </div>
  );
};

export default CompetitorManagement;
