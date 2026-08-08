/**
 * Feedback & Reviews Module
 * Submit stay review, department ratings, service feedback, complaints, compliments, improvement suggestions
 */

import { useState } from 'react';
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Send,
  CheckCircle2,
  Building,
  Users,
  UtensilsCrossed,
  Sparkles,
  Bed,
  Car
} from 'lucide-react';

interface FeedbackReviewsModuleProps {
  reservationId?: string;
}

interface Review {
  id: string;
  type: 'Stay' | 'Room' | 'Staff' | 'Food' | 'Cleanliness' | 'Facilities';
  rating: number;
  comment: string;
  submittedAt: string;
}

const FeedbackReviewsModule: React.FC<FeedbackReviewsModuleProps> = ({
  reservationId
}) => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 'REV-001',
      type: 'Stay',
      rating: 5,
      comment: 'Excellent stay! The staff was very helpful and the room was beautiful.',
      submittedAt: '2026-07-20T10:00:00'
    }
  ]);

  const [showNewFeedbackModal, setShowNewFeedbackModal] = useState(false);
  const [selectedType, setSelectedType] = useState('Stay');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const feedbackTypes = [
    { id: 'Stay', name: 'Overall Stay', icon: <Star size={20} /> },
    { id: 'Room', name: 'Room', icon: <Bed size={20} /> },
    { id: 'Staff', name: 'Staff', icon: <Users size={20} /> },
    { id: 'Food', name: 'Food & Beverage', icon: <UtensilsCrossed size={20} /> },
    { id: 'Cleanliness', name: 'Cleanliness', icon: <Sparkles size={20} /> },
    { id: 'Facilities', name: 'Facilities', icon: <Building size={20} /> }
  ];

  const handleSubmitFeedback = () => {
    if (rating === 0 || !comment.trim()) return;

    const newReview: Review = {
      id: `REV-${String(reviews.length + 1).padStart(3, '0')}`,
      type: selectedType as any,
      rating,
      comment,
      submittedAt: new Date().toISOString()
    };

    setReviews([...reviews, newReview]);
    setShowNewFeedbackModal(false);
    setRating(0);
    setComment('');
    setSelectedType('Stay');
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`transition ${
              interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
            }`}
          >
            <Star
              size={20}
              className={star <= currentRating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Feedback & Reviews</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Share your experience and help us improve
          </p>
        </div>
        <button
          onClick={() => setShowNewFeedbackModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Send size={16} />
          Submit Feedback
        </button>
      </div>

      {/* Feedback Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {feedbackTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => {
              setSelectedType(type.id);
              setShowNewFeedbackModal(true);
            }}
            className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition text-center"
          >
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-2">
              {type.icon}
            </div>
            <h3 className="font-medium text-slate-900 dark:text-white text-sm">{type.name}</h3>
          </button>
        ))}
      </div>

      {/* My Reviews */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">My Reviews</h3>
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/20">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    {feedbackTypes.find(t => t.id === review.type)?.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">{review.type}</h4>
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <CheckCircle2 size={12} />
                      <span>Submitted: {new Date(review.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                {renderStars(review.rating)}
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Feedback */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Feedback</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ThumbsUp size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-900 dark:text-white">Compliment</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Share something you loved</div>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
              <MessageSquare size={20} />
            </div>
            <div className="text-left">
              <div className="font-medium text-slate-900 dark:text-white">Suggestion</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Help us improve</div>
            </div>
          </button>
        </div>
      </div>

      {/* New Feedback Modal */}
      {showNewFeedbackModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Submit Feedback</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Feedback Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {feedbackTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Rating
                </label>
                {renderStars(rating, true)}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Your Feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience..."
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewFeedbackModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={rating === 0 || !comment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackReviewsModule;
