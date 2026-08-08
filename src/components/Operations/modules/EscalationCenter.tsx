/**
 * Escalation Center
 * Automatically escalates operational issues
 */

import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  TrendingUp,
  Search,
  Filter,
  Clock,
  CheckCircle2,
  ArrowUp,
  Users,
  Wrench,
  AlertCircle
} from 'lucide-react';

interface Escalation {
  id: string;
  type: 'sla-violation' | 'guest-complaint' | 'delayed-task' | 'equipment-failure' | 'staff-shortage' | 'high-risk-incident';
  severity: 'minor' | 'moderate' | 'major' | 'critical';
  description: string;
  source: string;
  escalatedTo: string;
  status: 'open' | 'acknowledged' | 'in-progress' | 'resolved';
  createdAt: string;
  dueBy: string;
}

const EscalationCenter: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'open' | 'acknowledged' | 'in-progress' | 'resolved'>('open');
  const [selectedType, setSelectedType] = useState<'all' | 'sla-violation' | 'guest-complaint' | 'delayed-task' | 'equipment-failure' | 'staff-shortage' | 'high-risk-incident'>('all');
  const [escalations, setEscalations] = useState<Escalation[]>([]);

  const mockEscalations: Escalation[] = [
    {
      id: '1',
      type: 'equipment-failure',
      severity: 'critical',
      description: 'HVAC system failure on Floor 3 affecting 12 rooms - SLA exceeded',
      source: 'Engineering',
      escalatedTo: 'General Manager',
      status: 'in-progress',
      createdAt: '2 hours ago',
      dueBy: '1 hour ago'
    },
    {
      id: '2',
      type: 'guest-complaint',
      severity: 'major',
      description: 'VIP guest complaint unresolved for 4 hours - requires immediate attention',
      source: 'Front Office',
      escalatedTo: 'Hotel Manager',
      status: 'open',
      createdAt: '4 hours ago',
      dueBy: '30 minutes ago'
    },
    {
      id: '3',
      type: 'staff-shortage',
      severity: 'moderate',
      description: 'Housekeeping 3 staff short for afternoon shift - affecting room readiness',
      source: 'Housekeeping',
      escalatedTo: 'Operations Manager',
      status: 'acknowledged',
      createdAt: '1 hour ago',
      dueBy: '2 hours ago'
    },
    {
      id: '4',
      type: 'sla-violation',
      severity: 'minor',
      description: 'Room cleaning time exceeded SLA by 15 minutes - 3 rooms affected',
      source: 'Housekeeping',
      escalatedTo: 'Rooms Division Manager',
      status: 'resolved',
      createdAt: '6 hours ago',
      dueBy: '5 hours ago'
    }
  ];

  useEffect(() => {
    setEscalations(mockEscalations);
  }, []);

  const filteredEscalations = escalations.filter(esc => {
    const matchesFilter = selectedFilter === 'all' || esc.status === selectedFilter;
    const matchesType = selectedType === 'all' || esc.type === selectedType;
    return matchesFilter && matchesType;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'major':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'moderate':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'minor':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'in-progress':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'acknowledged':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      case 'open':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sla-violation':
        return TrendingUp;
      case 'guest-complaint':
        return Users;
      case 'delayed-task':
        return Clock;
      case 'equipment-failure':
        return Wrench;
      case 'staff-shortage':
        return Users;
      case 'high-risk-incident':
        return AlertCircle;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <AlertTriangle size={28} />
            Escalation Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Automatically escalates operational issues</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in-progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Types</option>
          <option value="sla-violation">SLA Violations</option>
          <option value="guest-complaint">Guest Complaints</option>
          <option value="delayed-task">Delayed Tasks</option>
          <option value="equipment-failure">Equipment Failures</option>
          <option value="staff-shortage">Staff Shortages</option>
          <option value="high-risk-incident">High-Risk Incidents</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredEscalations.map(escalation => {
          const TypeIcon = getTypeIcon(escalation.type);
          return (
            <div key={escalation.id} className={`p-4 rounded-lg border ${getSeverityColor(escalation.severity)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/50">
                    <TypeIcon size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white capitalize">{escalation.type.replace('-', ' ')}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(escalation.status)}`}>
                        {escalation.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{escalation.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-500">
                      <span>From: {escalation.source}</span>
                      <span>→</span>
                      <span>To: {escalation.escalatedTo}</span>
                      <span>Created: {escalation.createdAt}</span>
                      <span className={new Date(escalation.dueBy) < new Date() ? 'text-rose-600 font-medium' : ''}>
                        Due: {escalation.dueBy}
                      </span>
                    </div>
                  </div>
                </div>
                {escalation.status !== 'resolved' && (
                  <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm">
                    Resolve
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscalationCenter;