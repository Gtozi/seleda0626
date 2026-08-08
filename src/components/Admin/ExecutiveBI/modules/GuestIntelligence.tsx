/**
 * Guest Intelligence Module
 * 
 * Data sourced from PMS and CRM.
 * 
 * Analytics:
 * - Guest Demographics
 * - Loyalty Performance
 * - Guest Lifetime Value
 * - Stay Patterns
 * - Satisfaction
 * - Reviews
 * - Complaints
 * - Service Recovery
 * - Guest Segmentation
 */

import { useState } from 'react';
import {
  Users,
  Star,
  Heart,
  TrendingUp,
  TrendingDown,
  Award,
  MessageSquare,
  AlertTriangle,
  Target,
  Download,
  Filter,
  Calendar,
  PieChart,
  Smile,
  Frown,
  Meh,
  Shield,
  Building2,
  MapPin,
  CreditCard
} from 'lucide-react';

interface GuestMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: number;
  category: 'demographics' | 'loyalty' | 'lifetime' | 'patterns' | 'satisfaction' | 'segmentation';
}

const GUEST_ANALYTICS = [
  // Guest Demographics
  { id: 'total_guests', name: 'Total Guests', value: 12500, target: 12000, unit: '', trend: 4, category: 'demographics' },
  { id: 'domestic_guests', name: 'Domestic Guests', value: 8500, target: 8000, unit: '', trend: 6, category: 'demographics' },
  { id: 'international_guests', name: 'International Guests', value: 4000, target: 4000, unit: '', trend: 0, category: 'demographics' },
  { id: 'avg_age', name: 'Average Age', value: 42, target: 40, unit: 'years', trend: 5, category: 'demographics' },
  
  // Loyalty Performance
  { id: 'loyalty_members', name: 'Loyalty Members', value: 3200, target: 3000, unit: '', trend: 7, category: 'loyalty' },
  { id: 'loyalty_enrollment', name: 'New Enrollments', value: 450, target: 400, unit: '/month', trend: 12, category: 'loyalty' },
  { id: 'loyalty_retention', name: 'Loyalty Retention', value: 78, target: 75, unit: '%', trend: 4, category: 'loyalty' },
  { id: 'tier_distribution', name: 'Elite Members', value: 850, target: 800, unit: '', trend: 6, category: 'loyalty' },
  
  // Guest Lifetime Value
  { id: 'glv', name: 'Guest Lifetime Value', value: 2800, target: 2500, unit: '$', trend: 12, category: 'lifetime' },
  { id: 'annual_guest_value', name: 'Annual Guest Value', value: 850, target: 800, unit: '$', trend: 6, category: 'lifetime' },
  { id: 'repeat_guest_value', name: 'Repeat Guest Value', value: 1200, target: 1000, unit: '$', trend: 20, category: 'lifetime' },
  
  // Stay Patterns
  { id: 'avg_length_of_stay', name: 'Avg Length of Stay', value: 3.2, target: 3.0, unit: 'nights', trend: 7, category: 'patterns' },
  { id: 'peak_stay_duration', name: 'Peak Stay Duration', value: 5, target: 4, unit: 'nights', trend: 25, category: 'patterns' },
  { id: 'weekend_vs_weekday', name: 'Weekend vs Weekday', value: 1.4, target: 1.3, unit: 'x', trend: 8, category: 'patterns' },
  { id: 'seasonal_variation', name: 'Seasonal Variation', value: 35, target: 30, unit: '%', trend: 17, category: 'patterns' },
  
  // Satisfaction
  { id: 'guest_satisfaction', name: 'Guest Satisfaction', value: 4.2, target: 4.0, unit: '/5', trend: 5, category: 'satisfaction' },
  { id: 'nps', name: 'Net Promoter Score', value: 72, target: 70, unit: '', trend: 3, category: 'satisfaction' },
  { id: 'review_rating', name: 'Average Review Rating', value: 4.4, target: 4.2, unit: '/5', trend: 5, category: 'satisfaction' },
  { id: 'complaint_rate', name: 'Complaint Rate', value: 2.1, target: 2.5, unit: '%', trend: -16, category: 'satisfaction' },
  
  // Guest Segmentation
  { id: 'business_travelers', name: 'Business Travelers', value: 45, target: 40, unit: '%', trend: 12, category: 'segmentation' },
  { id: 'leisure_travelers', name: 'Leisure Travelers', value: 35, target: 40, unit: '%', trend: -12, category: 'segmentation' },
  { id: 'family_travelers', name: 'Family Travelers', value: 15, target: 15, unit: '%', trend: 0, category: 'segmentation' },
  { id: 'group_travelers', name: 'Group Travelers', value: 5, target: 5, unit: '%', trend: 0, category: 'segmentation' },
];

const GUEST_CATEGORIES = [
  { id: 'demographics', label: 'Demographics', icon: Users },
  { id: 'loyalty', label: 'Loyalty', icon: Heart },
  { id: 'lifetime', label: 'Lifetime Value', icon: CreditCard },
  { id: 'patterns', label: 'Stay Patterns', icon: Calendar },
  { id: 'satisfaction', label: 'Satisfaction', icon: Star },
  { id: 'segmentation', label: 'Segmentation', icon: PieChart },
];

const GuestIntelligence = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  const filteredMetrics = selectedCategory === 'all' 
    ? GUEST_ANALYTICS 
    : GUEST_ANALYTICS.filter(m => m.category === selectedCategory);

  const getStatusColor = (trend: number) => {
    if (trend > 0) return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30';
    if (trend < 0) return 'text-rose-600 bg-rose-50 dark:bg-rose-900/30';
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/30';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Guest Intelligence
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Guest demographics, loyalty, and satisfaction analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Guest Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-lg border transition-all ${
            selectedCategory === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
              : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
          }`}
        >
          <Users className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
          <p className="text-sm font-medium text-gray-900 dark:text-white text-center">All Analytics</p>
        </button>
        {GUEST_CATEGORIES.map(cat => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`p-4 rounded-lg border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 dark:border-indigo-400'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              <Icon className="w-6 h-6 mx-auto mb-2 text-indigo-600" />
              <p className="text-sm font-medium text-gray-900 dark:text-white text-center">{cat.label}</p>
            </button>
          );
        })}
      </div>

      {/* Guest Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMetrics.map(metric => (
          <div
            key={metric.id}
            className="bg-white dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {metric.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {metric.unit === '$' ? 'USD' : metric.unit}
                </p>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(metric.trend)}`}>
                {metric.trend >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{metric.trend >= 0 ? '+' : ''}{metric.trend}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {metric.unit === '$' ? '$' : ''}{metric.value.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : metric.unit === 'x' ? 'x' : metric.unit === 'years' ? ' years' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {metric.unit === '$' ? '$' : ''}{metric.target.toLocaleString()}{metric.unit === '%' ? '%' : metric.unit === '/5' ? '/5' : metric.unit === 'x' ? 'x' : metric.unit === 'years' ? ' years' : ''}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Target
                  </p>
                </div>
              </div>

              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    metric.value >= metric.target ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reviews and Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Reviews
          </h3>
          <div className="space-y-4">
            {[
              { rating: 5, comment: 'Excellent service and beautiful rooms', date: '2 days ago' },
              { rating: 4, comment: 'Great location, friendly staff', date: '5 days ago' },
              { rating: 5, comment: 'Outstanding experience, will return', date: '1 week ago' },
            ].map((review, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-white">{review.comment}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{review.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Complaints & Service Recovery
          </h3>
          <div className="space-y-4">
            {[
              { type: 'Room Cleanliness', status: 'Resolved', time: '2 hours' },
              { type: 'Noise Complaint', status: 'Resolved', time: '4 hours' },
              { type: 'Billing Issue', status: 'In Progress', time: '1 day' },
            ].map((complaint, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.type}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Response time: {complaint.time}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  complaint.status === 'Resolved' 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                }`}>
                  {complaint.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Guest Segmentation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Guest Segmentation
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Business Travelers', percentage: 45, avgStay: 2.5, avgSpend: 180 },
            { name: 'Leisure Travelers', percentage: 35, avgStay: 4.0, avgSpend: 150 },
            { name: 'Family Travelers', percentage: 15, avgStay: 5.0, avgSpend: 220 },
            { name: 'Group Travelers', percentage: 5, avgStay: 3.0, avgSpend: 160 },
          ].map(segment => (
            <div key={segment.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 dark:text-white">{segment.name}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{segment.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${segment.percentage}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Avg Stay: {segment.avgStay} nights</span>
                <span>Avg Spend: ${segment.avgSpend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GuestIntelligence;
