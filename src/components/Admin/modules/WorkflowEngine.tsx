import React, { useState } from 'react';
import { GitBranch, Play, Pause, Plus, Edit, Search, Filter, Clock, Users, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface Workflow {
  id: string;
  name: string;
  type: 'purchase_request' | 'leave_approval' | 'refund' | 'rate_override' | 'complimentary_stay' | 'event_approval' | 'maintenance_approval' | 'recruitment' | 'capital_expenditure';
  description: string;
  status: 'active' | 'paused' | 'draft';
  steps: number;
  activeInstances: number;
  avgProcessingTime: string;
  slaCompliance: number;
}

const WorkflowEngine: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([
    { id: '1', name: 'Purchase Request Approval', type: 'purchase_request', description: 'Multi-level approval for procurement requests', status: 'active', steps: 4, activeInstances: 12, avgProcessingTime: '2.5 days', slaCompliance: 95 },
    { id: '2', name: 'Leave Request Approval', type: 'leave_approval', description: 'Employee leave approval process', status: 'active', steps: 3, activeInstances: 8, avgProcessingTime: '1.2 days', slaCompliance: 98 },
    { id: '3', name: 'Refund Authorization', type: 'refund', description: 'Guest refund approval workflow', status: 'active', steps: 2, activeInstances: 5, avgProcessingTime: '4 hours', slaCompliance: 92 },
    { id: '4', name: 'Rate Override Request', type: 'rate_override', description: 'Special rate pricing approval', status: 'active', steps: 3, activeInstances: 3, avgProcessingTime: '1 day', slaCompliance: 88 },
    { id: '5', name: 'Complimentary Stay Approval', type: 'complimentary_stay', description: 'Free stay authorization process', status: 'active', steps: 4, activeInstances: 2, avgProcessingTime: '3 days', slaCompliance: 90 },
    { id: '6', name: 'Event Booking Approval', type: 'event_approval', description: 'Banquet and event approval workflow', status: 'active', steps: 5, activeInstances: 7, avgProcessingTime: '5 days', slaCompliance: 85 },
    { id: '7', name: 'Maintenance Request Approval', type: 'maintenance_approval', description: 'Capital maintenance approval', status: 'paused', steps: 3, activeInstances: 0, avgProcessingTime: '2 days', slaCompliance: 100 },
    { id: '8', name: 'Recruitment Approval', type: 'recruitment', description: 'Hiring and onboarding approval', status: 'active', steps: 6, activeInstances: 4, avgProcessingTime: '14 days', slaCompliance: 82 },
    { id: '9', name: 'Capital Expenditure Approval', type: 'capital_expenditure', description: 'Large capital investment approval', status: 'draft', steps: 5, activeInstances: 0, avgProcessingTime: '21 days', slaCompliance: 0 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || workflow.type === filterType;
    const matchesStatus = filterStatus === 'all' || workflow.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleWorkflow = (id: string) => {
    setWorkflows(workflows.map(workflow => 
      workflow.id === id 
        ? { ...workflow, status: workflow.status === 'active' ? 'paused' : 'active' }
        : workflow
    ));
  };

  const workflowTypes = [
    { id: 'purchase_request', name: 'Purchase Request', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'leave_approval', name: 'Leave Approval', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'refund', name: 'Refund', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'rate_override', name: 'Rate Override', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'complimentary_stay', name: 'Complimentary Stay', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400' },
    { id: 'event_approval', name: 'Event Approval', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'maintenance_approval', name: 'Maintenance Approval', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'recruitment', name: 'Recruitment', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
    { id: 'capital_expenditure', name: 'Capital Expenditure', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'paused': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'draft': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Workflow Engine</h1>
          <p className="text-xs text-slate-400">Configure workflows for purchase requests, leave approval, refunds, rate override, complimentary stays, event approval, maintenance approval, recruitment, and capital expenditure</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Create Workflow
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Workflows', value: workflows.length, icon: GitBranch, color: 'text-blue-600' },
          { label: 'Active', value: workflows.filter(w => w.status === 'active').length, icon: Play, color: 'text-emerald-600' },
          { label: 'Active Instances', value: workflows.reduce((sum, w) => sum + w.activeInstances, 0), icon: Users, color: 'text-purple-600' },
          { label: 'Avg SLA Compliance', value: `${Math.round(workflows.filter(w => w.status === 'active').reduce((sum, w) => sum + w.slaCompliance, 0) / workflows.filter(w => w.status === 'active').length)}%`, icon: CheckCircle, color: 'text-amber-600' },
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

      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Types</option>
              {workflowTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="draft">Draft</option>
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Workflows Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Workflow Configuration</h3>
            <p className="text-xs text-slate-400">Business process automation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkflows.map((workflow) => {
            const type = workflowTypes.find(t => t.id === workflow.type);
            return (
              <div key={workflow.id} className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <GitBranch size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{workflow.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${type?.color}`}>
                        {type?.name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleWorkflow(workflow.id)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                  >
                    {workflow.status === 'active' ? (
                      <Pause size={20} className="text-amber-500" />
                    ) : (
                      <Play size={20} className="text-emerald-500" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 mb-4">{workflow.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-xs">
                    <ArrowRight size={12} className="text-slate-400" />
                    <span className="text-slate-500">Steps</span>
                    <span className="font-bold text-slate-900 dark:text-white">{workflow.steps}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Users size={12} className="text-slate-400" />
                    <span className="text-slate-500">Active</span>
                    <span className="font-bold text-slate-900 dark:text-white">{workflow.activeInstances}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock size={12} className="text-slate-400" />
                    <span className="text-slate-500">Avg Time</span>
                    <span className="font-bold text-slate-900 dark:text-white">{workflow.avgProcessingTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle size={12} className="text-slate-400" />
                    <span className="text-slate-500">SLA</span>
                    <span className="font-bold text-slate-900 dark:text-white">{workflow.slaCompliance}%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <Edit size={16} className="text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Workflow Features */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Workflow Features</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Conditional Logic', icon: GitBranch, color: 'text-blue-600' },
            { name: 'Parallel Approval', icon: Users, color: 'text-purple-600' },
            { name: 'Escalation', icon: AlertTriangle, color: 'text-amber-600' },
            { name: 'Delegation', icon: ArrowRight, color: 'text-emerald-600' },
            { name: 'SLA Timers', icon: Clock, color: 'text-cyan-600' },
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

export default WorkflowEngine;