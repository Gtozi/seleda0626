/**
 * Service Quality Management
 * Monitor service standards and quality metrics
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Star,
  Users,
  FileText
} from 'lucide-react';

interface QualityMetric {
  id: string;
  name: string;
  category: string;
  currentScore: number;
  targetScore: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface AuditResult {
  id: string;
  department: string;
  auditType: string;
  score: number;
  date: string;
  auditor: string;
  findings: string[];
}

const ServiceQualityManagement: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'FrontOffice' | 'Housekeeping' | 'FandB' | 'Engineering'>('all');
  const [metrics, setMetrics] = useState<QualityMetric[]>([]);
  const [audits, setAudits] = useState<AuditResult[]>([]);

  const mockMetrics: QualityMetric[] = [
    {
      id: '1',
      name: 'Guest Satisfaction Score',
      category: 'Guest Experience',
      currentScore: 4.6,
      targetScore: 4.8,
      trend: 'up',
      lastUpdated: '2026-07-31'
    },
    {
      id: '2',
      name: 'Service Response Time',
      category: 'Operations',
      currentScore: 92,
      targetScore: 95,
      trend: 'up',
      lastUpdated: '2026-07-31'
    },
    {
      id: '3',
      name: 'Room Cleanliness Score',
      category: 'Housekeeping',
      currentScore: 4.7,
      targetScore: 4.9,
      trend: 'stable',
      lastUpdated: '2026-07-30'
    },
    {
      id: '4',
      name: 'F&B Service Quality',
      category: 'Food & Beverage',
      currentScore: 4.4,
      targetScore: 4.7,
      trend: 'down',
      lastUpdated: '2026-07-31'
    },
    {
      id: '5',
      name: 'Check-in Efficiency',
      category: 'Front Office',
      currentScore: 88,
      targetScore: 90,
      trend: 'up',
      lastUpdated: '2026-07-31'
    },
    {
      id: '6',
      name: 'Maintenance Response Time',
      category: 'Engineering',
      currentScore: 85,
      targetScore: 90,
      trend: 'down',
      lastUpdated: '2026-07-30'
    }
  ];

  const mockAudits: AuditResult[] = [
    {
      id: '1',
      department: 'Housekeeping',
      auditType: 'Quality Standards',
      score: 92,
      date: '2026-07-28',
      auditor: 'Quality Manager',
      findings: ['Excellent room cleanliness', 'Minor issues with linen inventory', 'Staff training recommended']
    },
    {
      id: '2',
      department: 'Front Office',
      auditType: 'Service Standards',
      score: 88,
      date: '2026-07-25',
      auditor: 'Quality Manager',
      findings: ['Good check-in process', 'Need improvement in upselling', 'Phone etiquette needs attention']
    },
    {
      id: '3',
      department: 'F&B',
      auditType: 'Hygiene Standards',
      score: 95,
      date: '2026-07-30',
      auditor: 'Health Inspector',
      findings: ['Excellent hygiene practices', 'Proper food storage', 'Well maintained equipment']
    }
  ];

  useEffect(() => {
    setMetrics(mockMetrics);
    setAudits(mockAudits);
  }, []);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={16} className="text-emerald-600" />;
      case 'down':
        return <TrendingDown size={16} className="text-rose-600" />;
      case 'stable':
        return <div className="w-4 h-0.5 bg-slate-400" />;
    }
  };

  const getScoreColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'text-emerald-600';
    if (percentage >= 75) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Award size={28} />
            Service Quality Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor service standards and quality metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <FileText size={18} />
            Run Audit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map(metric => (
          <div key={metric.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-mono uppercase text-slate-500 font-bold">{metric.category}</p>
                <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{metric.name}</h4>
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="mt-3">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(metric.currentScore, metric.targetScore)}`}>
                  {metric.currentScore}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/ {metric.targetScore}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${metric.currentScore >= metric.targetScore * 0.9 ? 'bg-emerald-500' : metric.currentScore >= metric.targetScore * 0.75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${(metric.currentScore / metric.targetScore) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">Updated: {metric.lastUpdated}</p>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <FileText size={16} />
          Recent Audit Results
        </h3>
        <div className="space-y-3">
          {audits.map(audit => (
            <div key={audit.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{audit.department}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{audit.auditType}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Audited by {audit.auditor} on {audit.date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-2xl font-bold ${audit.score >= 90 ? 'text-emerald-600' : audit.score >= 75 ? 'text-amber-600' : 'text-rose-600'}`}>
                    {audit.score}%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Key Findings:</p>
                <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {audit.findings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServiceQualityManagement;