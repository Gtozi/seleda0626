/**
 * Help Center Module
 * FAQs, contact information, support resources, emergency contacts
 */

import { useState } from 'react';
import {
  HelpCircle,
  Search,
  Phone,
  Mail,
  MessageSquare,
  Book,
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface HelpCenterModuleProps {
  reservationId?: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const HelpCenterModule: React.FC<HelpCenterModuleProps> = ({
  reservationId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const faqs: FAQ[] = [
    {
      id: 'FAQ-001',
      question: 'What is the check-in and check-out time?',
      answer: 'Standard check-in time is 3:00 PM and check-out time is 11:00 AM. Early check-in and late check-out can be requested based on availability.',
      category: 'General'
    },
    {
      id: 'FAQ-002',
      question: 'How do I connect to the hotel Wi-Fi?',
      answer: 'Connect to the "SELEDA-Guest" network. The password is provided in your room welcome packet or can be obtained from the front desk.',
      category: 'Technology'
    },
    {
      id: 'FAQ-003',
      question: 'Is breakfast included in my reservation?',
      answer: 'Breakfast inclusion depends on your rate plan. Please check your reservation details or contact the front desk for clarification.',
      category: 'Dining'
    },
    {
      id: 'FAQ-004',
      question: 'How do I request housekeeping services?',
      answer: 'You can request housekeeping through the Guest Portal under "Housekeeping Requests" or by calling "0" from your room phone.',
      category: 'Services'
    },
    {
      id: 'FAQ-005',
      question: 'What payment methods are accepted?',
      answer: 'We accept major credit cards (Visa, MasterCard, American Express), mobile payments, and cash. Corporate accounts are also accepted with prior arrangement.',
      category: 'Payment'
    },
    {
      id: 'FAQ-006',
      question: 'Is there parking available?',
      answer: 'Yes, we offer complimentary parking for all guests. Valet parking is also available for an additional fee.',
      category: 'General'
    },
    {
      id: 'FAQ-007',
      question: 'How do I book spa services?',
      answer: 'Spa services can be booked through the Guest Portal under "Spa & Wellness" or by calling the spa directly at extension 5.',
      category: 'Services'
    },
    {
      id: 'FAQ-008',
      question: 'What is the hotel\'s cancellation policy?',
      answer: 'Our standard cancellation policy allows free cancellation up to 24 hours before check-in. Special rates may have different policies.',
      category: 'Policies'
    }
  ];

  const categories = ['All', 'General', 'Technology', 'Dining', 'Services', 'Payment', 'Policies'];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Help Center</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Find answers to common questions and get support
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search for help..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
            <Phone size={24} />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Front Desk</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Dial 0 from your room</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">+251 11 555 1234</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
            <MessageSquare size={24} />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Live Chat</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Available 24/7</p>
          <button className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">
            Start Chat
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 text-center">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto mb-3">
            <Mail size={24} />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">Email Support</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Response within 24 hours</p>
          <p className="text-sm text-slate-500 dark:text-slate-500">support@seledagrand.com</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h3>
        <div className="space-y-3">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <HelpCircle size={16} />
                  </div>
                  <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
                </div>
                {expandedFAQ === faq.id ? (
                  <ChevronUp size={20} className="text-slate-400" />
                ) : (
                  <ChevronDown size={20} className="text-slate-400" />
                )}
              </button>
              {expandedFAQ === faq.id && (
                <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400">{faq.answer}</p>
                  <div className="mt-2">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                      {faq.category}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Emergency Contacts</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Front Desk</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">24/7 Reception</div>
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">0</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Security</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Emergency Security</div>
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">2</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Medical</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Emergency Services</div>
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">911</div>
          </div>
          <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg">
            <div>
              <div className="font-medium text-slate-900 dark:text-white">Fire</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Fire Department</div>
            </div>
            <div className="text-lg font-bold text-red-600 dark:text-red-400">911</div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Book size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Guest Guide</span>
          </button>
          <button className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Book size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Hotel Map</span>
          </button>
          <button className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Book size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Area Guide</span>
          </button>
          <button className="flex items-center gap-2 p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900/20 transition">
            <Book size={18} className="text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Transport Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterModule;
