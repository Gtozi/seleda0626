import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  BarChart,
  DollarSign,
  Calendar,
  Percent
} from 'lucide-react';

interface MarketSegment {
  id: string;
  segment_code: string;
  segment_name: string;
  description: string | null;
  parent_segment_id: string | null;
  is_active: boolean;
  priority: number;
  revenue_weight: number;
  created_at: string;
  updated_at: string;
}

interface SegmentMetric {
  id: string;
  segment_id: string;
  metric_date: string;
  total_guests: number;
  total_bookings: number;
  total_rooms_sold: number;
  total_revenue: number;
  avg_rate: number;
  occupancy_rate: number;
  avg_length_of_stay: number;
}

interface GuestSegment {
  id: string;
  guest_id: string;
  segment_id: string;
  is_primary: boolean;
  confidence_score: number;
  assigned_at: string;
}

export default function MarketSegmentsManager() {
  const [segments, setSegments] = useState<MarketSegment[]>([]);
  const [metrics, setMetrics] = useState<SegmentMetric[]>([]);
  const [guestSegments, setGuestSegments] = useState<GuestSegment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<MarketSegment | null>(null);
  const [formData, setFormData] = useState({
    segment_code: '',
    segment_name: '',
    description: '',
    priority: 0,
    revenue_weight: 1.0
  });

  const fetchSegments = async () => {
    try {
      const res = await fetch('/api/admin/market-segments');
      if (res.ok) {
        const data = await res.json();
        setSegments(data);
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/admin/market-segments/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const fetchGuestSegments = async () => {
    try {
      const res = await fetch('/api/admin/market-segments/guest-assignments');
      if (res.ok) {
        const data = await res.json();
        setGuestSegments(data);
      }
    } catch (error) {
      console.error('Failed to fetch guest segments:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSegments(), fetchMetrics(), fetchGuestSegments()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateSegment = async () => {
    try {
      const res = await fetch('/api/admin/market-segments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setFormData({
          segment_code: '',
          segment_name: '',
          description: '',
          priority: 0,
          revenue_weight: 1.0
        });
        fetchSegments();
      }
    } catch (error) {
      console.error('Failed to create segment:', error);
    }
  };

  const handleUpdateSegment = async () => {
    if (!selectedSegment) return;
    try {
      const res = await fetch(`/api/admin/market-segments/${selectedSegment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowCreateModal(false);
        setSelectedSegment(null);
        setFormData({
          segment_code: '',
          segment_name: '',
          description: '',
          priority: 0,
          revenue_weight: 1.0
        });
        fetchSegments();
      }
    } catch (error) {
      console.error('Failed to update segment:', error);
    }
  };

  const handleDeleteSegment = async (segmentId: string) => {
    try {
      const res = await fetch(`/api/admin/market-segments/${segmentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchSegments();
      }
    } catch (error) {
      console.error('Failed to delete segment:', error);
    }
  };

  const openEditModal = (segment: MarketSegment) => {
    setSelectedSegment(segment);
    setFormData({
      segment_code: segment.segment_code,
      segment_name: segment.segment_name,
      description: segment.description || '',
      priority: segment.priority,
      revenue_weight: segment.revenue_weight
    });
    setShowCreateModal(true);
  };

  const filteredSegments = segments.filter(seg =>
    seg.segment_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seg.segment_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSegmentMetrics = (segmentId: string) => {
    return metrics.find(m => m.segment_id === segmentId);
  };

  const getGuestCount = (segmentId: string) => {
    return guestSegments.filter(gs => gs.segment_id === segmentId && gs.is_primary).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Market Segments</h2>
          <p className="text-sm text-slate-500">Manage guest segmentation and track segment performance</p>
        </div>
        <button
          onClick={() => {
            setSelectedSegment(null);
            setFormData({
              segment_code: '',
              segment_name: '',
              description: '',
              priority: 0,
              revenue_weight: 1.0
            });
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          New Segment
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Segments</p>
              <p className="text-2xl font-bold text-slate-900">{segments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <Users className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Segmented Guests</p>
              <p className="text-2xl font-bold text-slate-900">
                {guestSegments.filter(gs => gs.is_primary).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                ${metrics.reduce((sum, m) => sum + Number(m.total_revenue), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                ${metrics.length > 0 ? Math.round(metrics.reduce((sum, m) => sum + Number(m.avg_rate), 0) / metrics.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search segments by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* Segments List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading segments...</div>
          ) : filteredSegments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Target className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p>No segments found</p>
            </div>
          ) : (
            filteredSegments.map(segment => {
              const segmentMetrics = getSegmentMetrics(segment.id);
              const guestCount = getGuestCount(segment.id);
              return (
                <div key={segment.id} className="p-6 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`p-2 rounded-lg ${segment.is_active ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-slate-900">{segment.segment_name}</h4>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-mono">
                            {segment.segment_code}
                          </span>
                          {!segment.is_active && (
                            <span className="px-2 py-1 bg-slate-200 text-slate-600 rounded text-xs">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-3">{segment.description || 'No description'}</p>
                        
                        {/* Metrics */}
                        <div className="grid grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-slate-500">Guests</p>
                            <p className="font-bold text-slate-900">{guestCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Bookings</p>
                            <p className="font-bold text-slate-900">{segmentMetrics?.total_bookings || 0}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Revenue</p>
                            <p className="font-bold text-slate-900">
                              ${segmentMetrics?.total_revenue?.toLocaleString() || '0'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Avg Rate</p>
                            <p className="font-bold text-slate-900">
                              ${Math.round(segmentMetrics?.avg_rate || 0)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-slate-600">Priority: {segment.priority}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Percent className="w-3 h-3" />
                            <span className="text-slate-600">Revenue Weight: {segment.revenue_weight}x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => openEditModal(segment)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSegment(segment.id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              {selectedSegment ? 'Edit Segment' : 'Create New Segment'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Segment Code
                </label>
                <input
                  type="text"
                  value={formData.segment_code}
                  onChange={(e) => setFormData({ ...formData, segment_code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm uppercase"
                  placeholder="e.g., LEISURE"
                  disabled={!!selectedSegment}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Segment Name
                </label>
                <input
                  type="text"
                  value={formData.segment_name}
                  onChange={(e) => setFormData({ ...formData, segment_name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  placeholder="e.g., Leisure Travelers"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  rows={3}
                  placeholder="Describe this market segment..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                    Revenue Weight
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.revenue_weight}
                    onChange={(e) => setFormData({ ...formData, revenue_weight: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedSegment(null);
                  setFormData({
                    segment_code: '',
                    segment_name: '',
                    description: '',
                    priority: 0,
                    revenue_weight: 1.0
                  });
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={selectedSegment ? handleUpdateSegment : handleCreateSegment}
                disabled={!formData.segment_code || !formData.segment_name}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {selectedSegment ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
