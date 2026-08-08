/**
 * Contact & Live Chat Module
 * Contact form, live chat, AI chatbot, WhatsApp, email, and telephone support
 */

import { useState } from 'react';
import { MessageSquare, Phone, Mail, Send, Clock } from 'lucide-react';

const ContactLiveChatModule: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isChatOpen, setIsChatOpen] = useState(false);

  const contactMethods = [
    { id: 'phone', icon: <Phone size={24} />, label: 'Phone', value: '+251 11 555 1234', description: '24/7 Support' },
    { id: 'email', icon: <Mail size={24} />, label: 'Email', value: 'reservations@seleda.com', description: 'Response within 24 hours' },
    { id: 'whatsapp', icon: <MessageSquare size={24} />, label: 'WhatsApp', value: '+251 9 1234 5678', description: 'Instant messaging' }
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-lg opacity-90">We're here to help you 24/7</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {contactMethods.map((method) => (
          <div key={method.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 text-teal-600">
              {method.icon}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{method.label}</h3>
            </div>
            <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{method.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{method.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Send us a Message</h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
            <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Message</label>
            <textarea rows={4} className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white" />
          </div>
          <button
            type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Send size={20} />
            Send Message
          </button>
        </form>
      </div>

      {/* Live Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-lg transition-colors"
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
          <div className="bg-teal-600 p-4 text-white">
            <h3 className="font-semibold">Live Chat</h3>
            <p className="text-sm opacity-90 flex items-center gap-1">
              <Clock size={14} />
              Available 24/7
            </p>
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mb-3">
              <p className="text-sm text-slate-700 dark:text-slate-300">Hello! How can I help you today?</p>
            </div>
          </div>
          <div className="p-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white text-sm"
              />
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-lg">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactLiveChatModule;