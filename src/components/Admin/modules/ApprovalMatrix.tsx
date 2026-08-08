import React, { useState } from 'react';
import { Layers, DollarSign, UserCheck, Clock, AlertTriangle, Plus, Edit, Search, Filter, Shield, ArrowUp } from 'lucide-react';

interface ApprovalLevel {
  id: string;
  name: string;
  level: number;
  monetaryLimit: number;
  requiresDelegation: boolean;
  autoEscalation: boolean;
  escalationHours: number;
  approvers: string[];
}

const ApprovalMatrix: React.FC = () => {
  const [approvalLevels, setApprovalLevels] = useState<ApprovalLevel[]>([
    { id: '1', name: 'Level 1 - Supervisor', level: 1, monetaryLimit: 1000, requiresDelegation: false, autoEscalation: true, escalationHours: 24, approvers: ['Department Supervisor'] },
    { id: '2', name: 'Level 2 - Manager', level: 2, monetaryLimit: 5000, requiresDelegation: false, autoEscalation: true, escalationHours: 48, approvers: ['Department Manager', 'Finance Manager'] },
    { id: '3', name: 'Level 3 - Director', level: 3, monetaryLimit: 25000, requiresDelegation: true, autoEscalation: true, escalationHours: 72, approvers: ['Department Director', 'Finance Director'] },
    { id: '4', name: 'Level 4 - VP', level: 4, monetaryLimit: 100000, requiresDelegation: true, autoEscalation: true, escalationHours: 120, approvers: ['VP Operations', 'VP Finance', 'CFO'] },
    { id: '5', name: 'Level 5 - Executive', level: 5, monetaryLimit: 500000, requiresDelegation: true, autoEscalation: false, escalationHours: 0, approvers: ['CEO', 'Board Approval'] },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredLevels = approvalLevels.filter(level => {
    return level.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Approval Matrix</h1>
          <p className="text-xs text-slate-400">Configure monetary limits, approval levels, delegation, temporary approval, and escalation rules</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Approval Level
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Approval Levels', value: approvalLevels.length, icon: Layers, color: 'text-blue-600' },
          { label: 'Max Limit', value: `$${(approvalLevels[approvalLevels.length - 1]?.monetaryLimit / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-emerald-600' },
          { label: 'Requires Delegation', value: approvalLevels.filter(l => l.requiresDelegation).length, icon: UserCheck, color: 'text-purple-600' },
          { label: 'Auto Escalation', value: approvalLevels.filter(l => l.autoEscalation).length, icon: ArrowUp, color: 'text-amber-600' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
              <div className={`w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} flex items-center justify-center mb-2`}>
                <Icon size={16} />
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search approval levels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Approval Levels */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Approval Configuration</h3>
            <p className="text-xs text-slate-400">Approval hierarchy setup</p>
          </div>
        </div>

        <div className="space-y-4">
          {filteredLevels.map((level) => (
            <div key={level.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    {level.level}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{level.name}</h4>
                    <span className="text-xs text-slate-500">Level {level.level}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Edit size={16} className="text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <DollarSign size={12} />
                    Monetary Limit
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">${level.monetaryLimit.toLocaleString()}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <UserCheck size={12} />
                    Delegation
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {level.requiresDelegation ? 'Required' : 'Not Required'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <ArrowUp size={12} />
                    Auto Escalation
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {level.autoEscalation ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <Clock size={12} />
                    Escalation Time
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {level.escalationHours > 0 ? `${level.escalationHours}h` : 'N/A'}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">Approvers</div>
                <div className="flex flex-wrap gap-2">
                  {level.approvers.map((approver, index) => (
                    <span key={index} className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400 rounded-full text-xs font-bold">
                      {approver}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Approval Features */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Approval Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Monetary Limits', icon: DollarSign, color: 'text-blue-600' },
            { name: 'Approval Levels', icon: Layers, color: 'text-purple-600' },
            { name: 'Delegation', icon: UserCheck, color: 'text-emerald-600' },
            { name: 'Temporary Approval', icon: Shield, color: 'text-amber-600' },
            { name: 'Escalation Rules', icon: AlertTriangle, color: 'text-cyan-600' },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className={`w-8 h-8 rounded-lg bg-white dark:bg-slate-900 ${feature.color} flex items-center justify-center`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{feature.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ApprovalMatrix;