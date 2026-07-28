/**
 * Automated Pre-Arrival Email System Component
 * Manages automated email campaigns for guest pre-arrival communications
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Eye,
  Copy,
  Play,
  Pause,
  Settings,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Target
} from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
  triggerDaysBeforeArrival: number;
  triggerTime: string;
  triggerCondition: 'all_guests' | 'first_time' | 'returning' | 'vip' | 'group';
  content: string;
  variables: string[];
  active: boolean;
  language: string;
  createdAt: Date;
  lastModified: Date;
  sentCount: number;
  openRate: number;
  clickRate: number;
}

interface EmailCampaign {
  id: string;
  templateId: string;
  templateName: string;
  scheduleDate: Date;
  status: 'scheduled' | 'sent' | 'paused' | 'failed';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  createdAt: Date;
}

interface EmailVariable {
  name: string;
  description: string;
  example: string;
}

const PreArrivalEmailSystem = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'templates' | 'campaigns' | 'create' | 'edit'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    triggerDaysBeforeArrival: 3,
    triggerTime: '09:00',
    triggerCondition: 'all_guests' as const,
    content: '',
    language: 'en',
    active: true
  });

  const availableVariables: EmailVariable[] = [
    { name: '{{guest_name}}', description: 'Guest full name', example: 'John Doe' },
    { name: '{{first_name}}', description: 'Guest first name', example: 'John' },
    { name: '{{check_in_date}}', description: 'Check-in date', example: '2024-07-25' },
    { name: '{{check_out_date}}', description: 'Check-out date', example: '2024-07-28' },
    { name: '{{room_type}}', description: 'Room type', example: 'Deluxe Suite' },
    { name: '{{room_number}}', description: 'Room number', example: '301' },
    { name: '{{confirmation_code}}', description: 'Booking confirmation code', example: 'ABC123' },
    { name: '{{property_name}}', description: 'Property name', example: 'Grand Hotel' },
    { name: '{{property_address}}', description: 'Property address', example: '123 Main St' },
    { name: '{{contact_phone}}', description: 'Property contact phone', example: '+1 234 567 890' },
    { name: '{{wifi_password}}', description: 'WiFi password', example: 'HotelGuest2024' },
    { name: '{{breakfast_hours}}', description: 'Breakfast hours', example: '7:00 AM - 10:00 AM' }
  ];

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/front-office/email-templates');
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      console.error('Failed to fetch email templates:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/front-office/email-campaigns');
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Failed to fetch email campaigns:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTemplates(), fetchCampaigns()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [templates, searchQuery]);

  const handleCreateTemplate = async () => {
    try {
      const res = await fetch('/api/front-office/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setView('templates');
        setFormData({
          name: '',
          subject: '',
          description: '',
          triggerDaysBeforeArrival: 3,
          triggerTime: '09:00',
          triggerCondition: 'all_guests',
          content: '',
          language: 'en',
          active: true
        });
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to create email template:', error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const res = await fetch(`/api/front-office/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setView('templates');
        setSelectedTemplate(null);
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to update email template:', error);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      const res = await fetch(`/api/front-office/email-templates/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete email template:', error);
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const res = await fetch(`/api/front-office/email-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...template, active: !template.active })
      });
      if (res.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to toggle template:', error);
    }
  };

  const handleSendTestEmail = async (templateId: string) => {
    try {
      const res = await fetch(`/api/front-office/email-templates/${templateId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient: 'test@example.com' })
      });
      if (res.ok) {
        alert('Test email sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send test email:', error);
    }
  };

  const handleOpenEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      description: template.description,
      triggerDaysBeforeArrival: template.triggerDaysBeforeArrival,
      triggerTime: template.triggerTime,
      triggerCondition: template.triggerCondition,
      content: template.content,
      language: template.language,
      active: template.active
    });
    setView('edit');
  };

  const stats = useMemo(() => ({
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.active).length,
    totalSent: templates.reduce((sum, t) => sum + t.sentCount, 0),
    avgOpenRate: templates.length > 0 
      ? templates.reduce((sum, t) => sum + t.openRate, 0) / templates.length 
      : 0
  }), [templates]);

  const getTriggerConditionLabel = (condition: string) => {
    const labels = {
      all_guests: 'All Guests',
      first_time: 'First Time Guests',
      returning: 'Returning Guests',
      vip: 'VIP Guests',
      group: 'Group Bookings'
    };
    return labels[condition as keyof typeof labels] || condition;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Pre-Arrival Email System</h2>
          <p className="text-slate-600">Automated email campaigns for guest communications</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView(view === 'templates' ? 'campaigns' : 'templates')}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            {view === 'templates' ? 'View Campaigns' : 'View Templates'}
          </button>
          {view === 'templates' && (
            <button
              onClick={() => {
                setSelectedTemplate(null);
                setFormData({
                  name: '',
                  subject: '',
                  description: '',
                  triggerDaysBeforeArrival: 3,
                  triggerTime: '09:00',
                  triggerCondition: 'all_guests',
                  content: '',
                  language: 'en',
                  active: true
                });
                setView('create');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Template
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Templates</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalTemplates}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Templates</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeTemplates}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <Send className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Emails Sent</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalSent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Eye className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Avg Open Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.avgOpenRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {view === 'templates' && (
        <>
          {/* Search and Filter */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-500" />
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Templates List */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Template</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Trigger</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Performance</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading...</td>
                  </tr>
                ) : filteredTemplates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No email templates found
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map(template => (
                    <tr key={template.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-slate-900">{template.name}</p>
                          <p className="text-sm text-slate-600">{template.subject}</p>
                          <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-900">
                            {template.triggerDaysBeforeArrival} days before
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{template.triggerTime}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          {getTriggerConditionLabel(template.triggerCondition)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          <p>Sent: {template.sentCount}</p>
                          <p>Open: {template.openRate.toFixed(1)}%</p>
                          <p>Click: {template.clickRate.toFixed(1)}%</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(template)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            template.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {template.active ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSendTestEmail(template.id)}
                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Send Test"
                          >
                            <Send className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(template)}
                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="p-1.5 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {(view === 'create' || view === 'edit') && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-slate-900">
              {view === 'create' ? 'Create Email Template' : 'Edit Email Template'}
            </h3>
            <p className="text-slate-600">
              {view === 'create' ? 'Create a new automated email template' : 'Update email template'}
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g., Pre-Arrival Welcome"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  placeholder="e.g., Welcome to {{property_name}}!"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                rows={2}
                placeholder="Brief description of this email template"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Days Before Arrival</label>
                <input
                  type="number"
                  value={formData.triggerDaysBeforeArrival}
                  onChange={(e) => setFormData({ ...formData, triggerDaysBeforeArrival: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Send Time</label>
                <input
                  type="time"
                  value={formData.triggerTime}
                  onChange={(e) => setFormData({ ...formData, triggerTime: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Trigger Condition</label>
                <select
                  value={formData.triggerCondition}
                  onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value as any })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                >
                  <option value="all_guests">All Guests</option>
                  <option value="first_time">First Time Guests</option>
                  <option value="returning">Returning Guests</option>
                  <option value="vip">VIP Guests</option>
                  <option value="group">Group Bookings</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Content</label>
              <div className="relative">
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg min-h-[300px]"
                  placeholder="Dear {{first_name}},&#10;&#10;We are excited to welcome you to {{property_name}}..."
                />
              </div>
            </div>

            {/* Available Variables */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h4 className="font-medium text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Available Variables
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {availableVariables.map(variable => (
                  <div key={variable.name} className="text-sm">
                    <code className="bg-white px-2 py-1 rounded border border-slate-200 text-blue-600">
                      {variable.name}
                    </code>
                    <p className="text-xs text-slate-500 mt-1">{variable.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 border-slate-300 rounded"
              />
              <label htmlFor="active" className="text-sm text-slate-700">Active</label>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-slate-200">
            <button
              onClick={() => setView('templates')}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition"
            >
              Cancel
            </button>
            <button
              onClick={view === 'create' ? handleCreateTemplate : handleUpdateTemplate}
              disabled={!formData.name || !formData.subject}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {view === 'create' ? 'Create Template' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      {view === 'campaigns' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Campaigns</h3>
          <p className="text-slate-600">View and manage scheduled and sent email campaigns</p>
        </div>
      )}
    </div>
  );
};

export default PreArrivalEmailSystem;
