/**
 * SOP & Compliance Monitoring
 * Track compliance for operational standards
 */

import React, { useState, useEffect } from 'react';
import {
  ListChecks,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Calendar,
  Shield,
  ClipboardCheck
} from 'lucide-react';

interface ComplianceItem {
  id: string;
  category: string;
  name: string;
  department: string;
  complianceScore: number;
  lastAudit: string;
  nextAudit: string;
  status: 'compliant' | 'non-compliant' | 'pending-audit';
  findings: string[];
}

const SOPComplianceMonitoring: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<'all' | 'FrontOffice' | 'Housekeeping' | 'FandB' | 'Engineering' | 'Security'>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'daily-checklist' | 'opening' | 'closing' | 'brand-standards' | 'safety' | 'hygiene' | 'operational'>('all');
  const [complianceItems, setComplianceItems] = useState<ComplianceItem[]>([]);

  const mockComplianceItems: ComplianceItem[] = [
    {
      id: '1',
      category: 'daily-checklist',
      name: 'Front Desk Opening Procedures',
      department: 'FrontOffice',
      complianceScore: 95,
      lastAudit: '2026-07-30',
      nextAudit: '2026-08-06',
      status: 'compliant',
      findings: ['All opening procedures followed correctly', 'Cash count accurate']
    },
    {
      id: '2',
      category: 'hygiene',
      name: 'Kitchen Hygiene Standards',
      department: 'FandB',
      complianceScore: 98,
      lastAudit: '2026-07-29',
      nextAudit: '2026-08-05',
      status: 'compliant',
      findings: ['Excellent hygiene practices', 'Proper food storage maintained']
    },
    {
      id: '3',
      category: 'safety',
      name: 'Fire Safety Compliance',
      department: 'Security',
      complianceScore: 88,
      lastAudit: '2026-07-28',
      nextAudit: '2026-08-04',
      status: 'non-compliant',
      findings: ['2 fire extinguishers expired', 'Emergency exit signage needs updating']
    },
    {
      id: '4',
      category: 'operational',
      name: 'Room Cleaning Standards',
      department: 'Housekeeping',
      complianceScore: 92,
      lastAudit: '2026-07-31',
      nextAudit: '2026-08-07',
      status: 'compliant',
      findings: ['Room cleanliness meets standards', 'Minor linen inventory issues']
    },
    {
      id: '5',
      category: 'brand-standards',
      name: 'Brand Service Standards',
      department: 'FrontOffice',
      complianceScore: 85,
      lastAudit: '2026-07-25',
      nextAudit: '2026-08-01',
      status: 'pending-audit',
      findings: ['Previous audit showed need for improvement in phone etiquette']
    }
  ];

  useEffect(() => {
    setComplianceItems(mockComplianceItems);
  }, []);

  const filteredItems = complianceItems.filter(item => {
    const matchesDepartment = selectedDepartment === 'all' || item.department === selectedDepartment;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesDepartment && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'non-compliant':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
      case 'pending-audit':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 75) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <ListChecks size={28} />
            SOP & Compliance Monitoring
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Track compliance for operational standards</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <ClipboardCheck size={18} />
          Run Audit
        </button>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Departments</option>
          <option value="FrontOffice">Front Office</option>
          <option value="Housekeeping">Housekeeping</option>
          <option value="FandB">Food & Beverage</option>
          <option value="Engineering">Engineering</option>
          <option value="Security">Security</option>
        </select>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Categories</option>
          <option value="daily-checklist">Daily Checklists</option>
          <option value="opening">Opening Procedures</option>
          <option value="closing">Closing Procedures</option>
          <option value="brand-standards">Brand Standards</option>
          <option value="safety">Safety Standards</option>
          <option value="hygiene">Hygiene Standards</option>
          <option value="operational">Operational Audits</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono uppercase text-slate-500 font-bold">{item.category.replace('-', ' ')}</span>
                <h4 className="font-semibold text-slate-900 dark:text-white mt-1">{item.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.department}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                {item.status.replace('-', ' ')}
              </span>
            </div>
            
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(item.complianceScore)}`}>
                  {item.complianceScore}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full transition-all ${item.complianceScore >= 90 ? 'bg-emerald-500' : item.complianceScore >= 75 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  style={{ width: `${item.complianceScore}%` }}
                />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Last Audit</span>
                <span className="text-slate-900 dark:text-white">{item.lastAudit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Next Audit</span>
                <span className="text-slate-900 dark:text-white">{item.nextAudit}</span>
              </div>
            </div>

            {item.findings.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Key Findings:</p>
                <ul className="text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                  {item.findings.slice(0, 2).map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SOPComplianceMonitoring;