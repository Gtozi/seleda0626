/**
 * Automated Journey Builder
 * Create and manage automated guest communication journeys
 */

import React, { useState, useMemo } from 'react';
import {
  Mail,
  Smartphone,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  Settings,
  ArrowRight,
  User,
  Sparkles,
  Target,
  Filter,
  Copy,
  Save
} from 'lucide-react';

interface JourneyStep {
  id: string;
  order: number;
  triggerEvent: 'booking_confirmed' | 'pre_arrival' | 'check_in' | 'during_stay' | 'check_out' | 'post_stay';
  channel: 'email' | 'sms' | 'whatsapp' | 'in_app';
  delayHours: number;
  subject?: string;
  template: string;
  personalizationRules: PersonalizationRule[];
  active: boolean;
}

interface PersonalizationRule {
  field: string;
  type: 'guest_name' | 'room_number' | 'check_in_date' | 'check_out_date' | 'booking_id' | 'custom';
  defaultValue: string;
}

interface AutomatedJourney {
  id: string;
  name: string;
  description: string;
  segment: 'all' | 'first_time' | 'returning' | 'vip' | 'corporate';
  steps: JourneyStep[];
  active: boolean;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

const AutomatedJourneyBuilder = () => {
  const [journeys, setJourneys] = useState<AutomatedJourney[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<AutomatedJourney | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  // Mock data
  const journeyTemplates: AutomatedJourney[] = useMemo(() => [
    {
      id: 'J1',
      name: 'Pre-Arrival Welcome',
      description: 'Welcome guests before arrival with check-in information',
      segment: 'all',
      active: true,
      steps: [
        {
          id: 'S1',
          order: 1,
          triggerEvent: 'pre_arrival',
          channel: 'email',
          delayHours: 48,
          subject: 'Welcome to SELEDA - Your Stay Details',
          template: 'Dear {{guest_name}}, We look forward to welcoming you on {{check_in_date}}...',
          personalizationRules: [
            { field: 'guest_name', type: 'guest_name', defaultValue: 'Guest' },
            { field: 'check_in_date', type: 'check_in_date', defaultValue: 'your arrival date' },
          ],
          active: true,
        },
        {
          id: 'S2',
          order: 2,
          triggerEvent: 'pre_arrival',
          channel: 'whatsapp',
          delayHours: 24,
          template: 'Hi {{guest_name}}! Just a reminder that check-in is at {{check_in_time}}...',
          personalizationRules: [
            { field: 'guest_name', type: 'guest_name', defaultValue: 'Guest' },
            { field: 'check_in_time', type: 'custom', defaultValue: '3:00 PM' },
          ],
          active: true,
        },
      ],
      stats: { sent: 245, opened: 198, clicked: 87, converted: 45 },
    },
    {
      id: 'J2',
      name: 'Post-Stay Feedback',
      description: 'Request feedback after guest checkout',
      segment: 'all',
      active: true,
      steps: [
        {
          id: 'S3',
          order: 1,
          triggerEvent: 'post_stay',
          channel: 'email',
          delayHours: 24,
          subject: 'How was your stay at SELEDA?',
          template: 'Dear {{guest_name}}, Thank you for staying with us...',
          personalizationRules: [
            { field: 'guest_name', type: 'guest_name', defaultValue: 'Guest' },
          ],
          active: true,
        },
      ],
      stats: { sent: 189, opened: 156, clicked: 98, converted: 67 },
    },
    {
      id: 'J3',
      name: 'VIP Welcome',
      description: 'Special welcome for VIP guests',
      segment: 'vip',
      active: false,
      steps: [
        {
          id: 'S4',
          order: 1,
          triggerEvent: 'booking_confirmed',
          channel: 'email',
          delayHours: 0,
          subject: 'Exclusive Welcome - VIP Guest',
          template: 'Dear {{guest_name}}, As a valued VIP guest...',
          personalizationRules: [
            { field: 'guest_name', type: 'guest_name', defaultValue: 'VIP Guest' },
          ],
          active: true,
        },
      ],
      stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    },
  ], []);

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'in_app': return <MessageSquare className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getTriggerLabel = (trigger: string) => {
    switch (trigger) {
      case 'booking_confirmed': return 'Booking Confirmed';
      case 'pre_arrival': return 'Pre-Arrival';
      case 'check_in': return 'Check-In';
      case 'during_stay': return 'During Stay';
      case 'check_out': return 'Check-Out';
      case 'post_stay': return 'Post-Stay';
      default: return trigger;
    }
  };

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'vip': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'corporate': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'returning': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      case 'first_time': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400';
    }
  };

  const calculateConversionRate = (stats: { sent: number; converted: number }) => {
    return stats.sent > 0 ? ((stats.converted / stats.sent) * 100).toFixed(1) : '0.0';
  };

  const handleCreateJourney = () => {
    setSelectedJourney({
      id: `J${Date.now()}`,
      name: 'New Journey',
      description: '',
      segment: 'all',
      active: false,
      steps: [],
      stats: { sent: 0, opened: 0, clicked: 0, converted: 0 },
    });
    setShowBuilder(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Automated Journeys</h2>
          <p className="text-slate-600 dark:text-slate-400">Create automated guest communication sequences</p>
        </div>
        <button
          onClick={handleCreateJourney}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Journey
        </button>
      </div>

      {/* Journey Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journeyTemplates.map((journey) => (
          <div
            key={journey.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedJourney(journey);
              setShowBuilder(true);
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{journey.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSegmentColor(journey.segment)}`}>
                    {journey.segment}
                  </span>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${journey.active ? 'bg-green-500' : 'bg-slate-300'}`} />
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{journey.description}</p>

            <div className="flex items-center gap-2 mb-4">
              {journey.steps.slice(0, 3).map((step) => (
                <div key={step.id} className="flex items-center gap-1">
                  {getChannelIcon(step.channel)}
                </div>
              ))}
              {journey.steps.length > 3 && (
                <span className="text-xs text-slate-500">+{journey.steps.length - 3}</span>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{journey.stats.sent}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Sent</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{journey.stats.opened}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Opened</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-slate-900 dark:text-white">{journey.stats.clicked}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Clicked</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{calculateConversionRate(journey.stats)}%</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Conv.</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Journey Builder Modal */}
      {showBuilder && selectedJourney && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Journey Builder</h3>
                <button
                  onClick={() => setShowBuilder(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <ArrowRight className="w-5 h-5 text-slate-600 dark:text-slate-400 rotate-45" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Journey Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Journey Name</label>
                  <input
                    type="text"
                    value={selectedJourney.name}
                    onChange={(e) => setSelectedJourney({ ...selectedJourney, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Segment</label>
                  <select
                    value={selectedJourney.segment}
                    onChange={(e) => setSelectedJourney({ ...selectedJourney, segment: e.target.value as any })}
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="all">All Guests</option>
                    <option value="first_time">First Time</option>
                    <option value="returning">Returning</option>
                    <option value="vip">VIP</option>
                    <option value="corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea
                  value={selectedJourney.description}
                  onChange={(e) => setSelectedJourney({ ...selectedJourney, description: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Journey Steps */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">Journey Steps</h4>
                  <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <Plus className="w-4 h-4" />
                    Add Step
                  </button>
                </div>

                {selectedJourney.steps.length === 0 ? (
                  <div className="text-center py-8 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                    <Target className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400">No steps added yet</p>
                    <p className="text-sm text-slate-500 dark:text-slate-500">Add your first communication step</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedJourney.steps.map((step, index) => (
                      <div key={step.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{index + 1}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                {getChannelIcon(step.channel)}
                                <span className="font-medium text-slate-900 dark:text-white capitalize">{step.channel}</span>
                              </div>
                              <span className="text-sm text-slate-600 dark:text-slate-400">
                                {getTriggerLabel(step.triggerEvent)} • {step.delayHours}h delay
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                              <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>

                        {step.subject && (
                          <div className="mb-2">
                            <p className="text-sm font-medium text-slate-900 dark:text-white">Subject: {step.subject}</p>
                          </div>
                        )}

                        <div className="bg-slate-50 dark:bg-slate-800 rounded p-3 mb-2">
                          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{step.template}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-500">Personalization:</span>
                          {step.personalizationRules.map((rule, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs">
                              {rule.field}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedJourney({ ...selectedJourney, active: !selectedJourney.active })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedJourney.active
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {selectedJourney.active ? (
                      <>
                        <Pause className="w-4 h-4" />
                        Pause Journey
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        Activate Journey
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBuilder(false)}
                    className="px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-medium transition-colors text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                    <Save className="w-4 h-4" />
                    Save Journey
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutomatedJourneyBuilder;
