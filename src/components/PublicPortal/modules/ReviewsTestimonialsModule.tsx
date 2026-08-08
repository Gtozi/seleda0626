/**
 * Reviews & Testimonials Module
 * Display verified reviews, guest stories, awards, and ratings
 */

import { Star, MessageSquare, Award, ThumbsUp } from 'lucide-react';

const ReviewsTestimonialsModule: React.FC = () => {
  const reviews = [
    { id: '1', name: 'John Doe', rating: 5, date: '2026-07-15', comment: 'Amazing experience! The staff was incredibly helpful and the facilities were top-notch.' },
    { id: '2', name: 'Jane Smith', rating: 4, date: '2026-07-10', comment: 'Beautiful property with great views. Would definitely recommend to others.' },
    { id: '3', name: 'Michael Johnson', rating: 5, date: '2026-07-05', comment: 'Exceptional service and attention to detail. The spa treatments were wonderful.' }
  ];

  const awards = [
    { name: 'Best Hotel in Ethiopia 2025', year: '2025' },
    { name: 'Luxury Hotel Award', year: '2024' },
    { name: 'Customer Service Excellence', year: '2024' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Reviews & Testimonials</h1>
        <p className="text-lg opacity-90">See what our guests have to say about their experience</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-1 mb-3">
              {[...Array(review.rating)].map((_, idx) => (
                <Star key={idx} size={16} className="text-amber-500 fill-amber-500" />
              ))}
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-4">{review.comment}</p>
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span className="font-medium text-slate-900 dark:text-white">{review.name}</span>
              <span>{review.date}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4 text-amber-600">
          <Award size={24} />
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Awards & Recognition</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {awards.map((award, idx) => (
            <div key={idx} className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
              <div className="font-semibold text-amber-800 dark:text-amber-400">{award.name}</div>
              <div className="text-sm text-amber-600 dark:text-amber-500">{award.year}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsTestimonialsModule;