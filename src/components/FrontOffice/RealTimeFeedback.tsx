/**
 * Real-Time Feedback Collection Component
 * Collects and manages guest feedback in real-time across all touchpoints
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  BarChart3,
  RefreshCw,
  Download,
  Eye,
  Reply,
  Archive,
  Flag,
  CheckCircle2,
  XCircle,
  Clock,
  Smile,
  Meh,
  Frown
} from 'lucide-react';

interface Feedback {
  id: string;
  guestId: string;
  guestName: string;
  guestEmail: string;
  reservationId?: string;
  roomNumber?: string;
  category: 'room' | 'service' | 'food' | 'amenities' | 'check_in' | 'check_out' | 'overall';
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  comment: string;
  tags: string[];
  source: 'app' | 'web' | 'email' | 'in_person' | 'survey';
  status: 'new' | 'reviewed' | 'responded' | 'resolved' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  respondedAt?: Date;
  respondedBy?: string;
  response?: string;
  anonymous: boolean;
}

interface FeedbackStats {
  totalFeedback: number;
  averageRating: number;
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
  responseRate: number;
  avgResponseTime: number;
  topCategories: { category: string; count: number }[];
  trend: 'up' | 'down' | 'stable';
}

const RealTimeFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/front-office/feedback');
      if (res.ok) {
        const data = await res.json();
        setFeedback(data);
      }
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
    }
  };

  useEffect(() => {
    fetchFeedback();
    setLoading(false);

    // Set up real-time subscription
    const interval = setInterval(fetchFeedback, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const filteredFeedback = useMemo(() => {
    return feedback.filter(f => {
      const matchesSearch = 
        f.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.roomNumber?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || f.category === selectedCategory;
      const matchesSentiment = selectedSentiment === 'all' || f.sentiment === selectedSentiment;
      const matchesStatus = selectedStatus === 'all' || f.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesSentiment && matchesStatus;
    });
  }, [feedback, searchQuery, selectedCategory, selectedSentiment, selectedStatus]);

  const stats = useMemo<FeedbackStats>(() => ({
    totalFeedback: feedback.length,
    averageRating: feedback.length > 0 
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length 
      : 0,
    positiveCount: feedback.filter(f => f.sentiment === 'positive').length,
    neutralCount: feedback.filter(f => f.sentiment === 'neutral').length,
    negativeCount: feedback.filter(f => f.sentiment === 'negative').length,
    responseRate: feedback.length > 0 
      ? (feedback.filter(f => f.status === 'responded' || f.status === 'resolved').length / feedback.length) * 100 
      : 0,
    avgResponseTime: 2.4, // hours
    topCategories: Object.entries(
      feedback.reduce((acc, f) => {
        acc[f.category] = (acc[f.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    trend: 'up' as const
  }), [feedback]);

  const handleRespond = async () => {
    if (!selectedFeedback || !responseText.trim()) return;

    try {
      const res = await fetch(`/api/front-office/feedback/${selectedFeedback.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: responseText })
      });
      if (res.ok) {
        setShowResponseModal(false);
        setResponseText('');
        setSelectedFeedback(null);
        fetchFeedback();
      }
    } catch (error) {
      console.error('Failed to respond to feedback:', error);
    }
  };

  const handleUpdateStatus = async (feedbackId: string, status: string) => {
    try {
      const res = await fetch(`/api/front-office/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchFeedback();
      }
    } catch (error) {
      console.error('Failed to update feedback status:', error);
    }
  };

  const handleFlag = async (feedbackId: string, priority: string) => {
    try {
      const res = await fetch(`/api/front-office/feedback/${feedbackId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority })
      });
      if (res.ok) {
        fetchFeedback();
      }
    } catch (error) {
      console.error('Failed to flag feedback:', error);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    const icons = {
      positive: <Smile className="w-5 h-5 text-green-500" />,
      neutral: <Meh className="w-5 h-5 text-amber-500" />,
      negative: <Frown className="w-5 h-5 text-red-500" />
    };
    return icons[sentiment as keyof typeof icons] || <MessageSquare className="w-5 h-5 text-slate-500" />;
  };

  const getSentimentColor = (sentiment: string) => {
    const colors = {
      positive: 'bg-green-100 text-green-700',
      neutral: 'bg-amber-100 text-amber-700',
      negative: 'bg-red-100 text-red-700'
    };
    return colors[sentiment as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-slate-100 text-slate-600',
      medium: 'bg-blue-100 text-blue-600',
      high: 'bg-amber-100 text-amber-600',
      urgent: 'bg-red-100 text-red-600'
    };
    return colors[priority as keyof typeof colors] || 'bg-slate-100 text-slate-600';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-600',
      reviewed: 'bg-purple-100 text-purple-600',
      responded: 'bg-green-100 text-green-600',
      resolved: 'bg-emerald-100 text-emerald-600',
      archived: 'bg-slate-100 text-slate-600'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-600';
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Real-Time Feedback</h2>
          <p className="text-slate-600">Monitor and respond to guest feedback in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchFeedback}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Feedback</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalFeedback}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Star className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Rating</p>
              <p className="text-2xl font-bold text-slate-900">{stats.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <ThumbsUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Positive</p>
              <p className="text-2xl font-bold text-slate-900">{stats.positiveCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ThumbsDown className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Negative</p>
              <p className="text-2xl font-bold text-slate-900">{stats.negativeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Response Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.responseRate.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Clock className="w-5 h-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Response</p>
              <p className="text-2xl font-bold text-slate-900">{stats.avgResponseTime}h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Top Feedback Categories</h3>
        <div className="grid grid-cols-5 gap-4">
          {stats.topCategories.map((item, index) => (
            <div key={item.category} className="text-center">
              <div className="text-2xl font-bold text-slate-900">{item.count}</div>
              <div className="text-sm text-slate-600 capitalize">{item.category.replace('_', ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
            >
              <option value="all">All Categories</option>
              <option value="room">Room</option>
              <option value="service">Service</option>
              <option value="food">Food</option>
              <option value="amenities">Amenities</option>
              <option value="check_in">Check-in</option>
              <option value="check_out">Check-out</option>
              <option value="overall">Overall</option>
            </select>
          </div>
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="reviewed">Reviewed</option>
            <option value="responded">Responded</option>
            <option value="resolved">Resolved</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Guest</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Rating</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Sentiment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Comment</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Source</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">Loading...</td>
              </tr>
            ) : filteredFeedback.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-500">No feedback found</td>
              </tr>
            ) : (
              filteredFeedback.map(feedback => (
                <tr key={feedback.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-slate-500" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{feedback.anonymous ? 'Anonymous' : feedback.guestName}</p>
                        <p className="text-sm text-slate-600">{feedback.roomNumber || 'No room'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-slate-900">{feedback.category.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4">
                    {renderStars(feedback.rating)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(feedback.sentiment)}`}>
                      {getSentimentIcon(feedback.sentiment)}
                      {feedback.sentiment}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 max-w-xs truncate">{feedback.comment}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-sm text-slate-600">{feedback.source}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feedback.priority)}`}>
                      {feedback.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedFeedback(feedback);
                          setShowResponseModal(true);
                        }}
                        className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Respond"
                      >
                        <Reply className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleFlag(feedback.id, feedback.priority === 'urgent' ? 'medium' : 'urgent')}
                        className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Flag"
                      >
                        <Flag className="w-4 h-4 text-amber-600" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(feedback.id, 'archived')}
                        className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <Archive className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Respond to Feedback</h3>
            <div className="mb-4 p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">{selectedFeedback.anonymous ? 'Anonymous' : selectedFeedback.guestName}</span>
                <span className="text-sm text-slate-600">{new Date(selectedFeedback.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(selectedFeedback.rating)}
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(selectedFeedback.sentiment)}`}>
                  {selectedFeedback.sentiment}
                </span>
              </div>
              <p className="text-sm text-slate-900">{selectedFeedback.comment}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Response</label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                rows={4}
                placeholder="Type your response..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseText('');
                  setSelectedFeedback(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleRespond}
                disabled={!responseText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeFeedback;
