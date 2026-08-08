/**
 * Support Center Module
 * FAQs, cancellation policies, privacy policy, terms & conditions, and accessibility information
 */

import { useState } from 'react';
import { HelpCircle, FileText, Shield, Lock, ChevronDown, ChevronUp, Search } from 'lucide-react';

const SupportCenterModule: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: 'What is the cancellation policy?',
      answer: 'Free cancellation is available up to 24-72 hours before check-in, depending on the room type. Cancellations made within the grace period will receive a full refund.'
    },
    {
      id: 2,
      question: 'How do I modify my reservation?',
      answer: 'You can modify your reservation through your guest account or by contacting our reservations team. Modifications are subject to availability and rate changes.'
    },
    {
      id: 3,
      question: 'What payment methods do you accept?',
      answer: 'We accept credit/debit cards, mobile wallets, bank transfers, gift cards, and loyalty points. All payments are processed securely through our payment gateway.'
    },
    {
      id: 4,
      question: 'Is early check-in available?',
      answer: 'Early check-in is subject to availability. You can request early check-in during booking or contact the hotel directly. Additional charges may apply.'
    },
    {
      id: 5,
      question: 'Do you offer airport transfers?',
      answer: 'Yes, we offer airport pickup and drop-off services. You can book these services through our transportation module or by contacting the hotel.'
    }
  ];

  const sections = [
    { id: 'faq', label: 'FAQs', icon: <HelpCircle size={20} /> },
    { id: 'cancellation', label: 'Cancellation Policy', icon: <FileText size={20} /> },
    { id: 'privacy', label: 'Privacy Policy', icon: <Shield size={20} /> },
    { id: 'terms', label: 'Terms & Conditions', icon: <FileText size={20} /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Lock size={20} /> }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Support Center</h1>
        <p className="text-lg opacity-90">Find answers to common questions and important information</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeSection === section.id
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            {section.icon}
            {section.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        {activeSection === 'faq' && (
          <div>
            <div className="mb-6">
              <div className="relative">
                <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-700 dark:text-white"
                />
              </div>
            </div>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium text-slate-900 dark:text-white">{faq.question}</span>
                    {expandedFaq === faq.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-4 pb-4 text-slate-600 dark:text-slate-400">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSection === 'cancellation' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Cancellation Policy</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <h3 className="font-semibold text-green-800 dark:text-green-400 mb-2">Free Cancellation</h3>
                <p>Cancel up to 24-72 hours before check-in for a full refund, depending on room type.</p>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <h3 className="font-semibold text-amber-800 dark:text-amber-400 mb-2">Late Cancellations</h3>
                <p>Cancellations made within the grace period may incur a fee equal to one night's stay.</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2">No-Show</h3>
                <p>Failure to arrive without cancellation will result in charges for the entire reservation.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'privacy' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Privacy Policy</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <p>We are committed to protecting your privacy and personal information. This policy outlines how we collect, use, and safeguard your data.</p>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Information We Collect</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Personal contact information</li>
                  <li>Payment details</li>
                  <li>Reservation preferences</li>
                  <li>Communication records</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">How We Use Your Information</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Process reservations</li>
                  <li>Provide customer service</li>
                  <li>Send promotional offers (with consent)</li>
                  <li>Improve our services</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'terms' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Terms & Conditions</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <p>By booking with SELEDA Hotels, you agree to the following terms and conditions.</p>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Booking Terms</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>All reservations are subject to availability</li>
                  <li>Check-in time is 1:00 PM, check-out time is 10:00 AM</li>
                  <li>Valid government ID required at check-in</li>
                  <li>Minimum age for booking is 18 years</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Payment Terms</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Full payment or deposit required at booking</li>
                  <li>Prices are subject to change until confirmed</li>
                  <li>Additional charges may apply for special services</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'accessibility' && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Accessibility Information</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400">
              <p>SELEDA Hotels is committed to ensuring accessibility for all guests.</p>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Accessible Features</h3>
                <ul className="list-disc list-inside space-y-1">
                  <li>Wheelchair accessible rooms</li>
                  <li>Elevator access to all floors</li>
                  <li>Accessible parking spaces</li>
                  <li>Braille signage</li>
                  <li>Hearing impairment assistance</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Service Animals</h3>
                <p>Service animals are welcome in all areas of the hotel at no additional charge.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Special Assistance</h3>
                <p>Please contact us in advance if you require any special assistance during your stay.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportCenterModule;