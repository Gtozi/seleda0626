/**
 * Integration Builder
 * Visual workflow designer for building integrations
 */

import React, { useState } from 'react';
import {
  Workflow,
  Plus,
  Play,
  Save,
  Trash2,
  Settings,
  ArrowRight,
  Clock,
  Zap,
  Database,
  Globe,
  Mail,
  MessageSquare,
  Calendar,
  CreditCard,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  MoreVertical,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'delay';
  name: string;
  icon: React.ReactNode;
  config: Record<string, any>;
}

interface WorkflowConnection {
  from: string;
  to: string;
}

const nodeTypes = [
  { type: 'trigger', name: 'Trigger', icon: <Zap size={18} className="text-amber-500" />, color: 'bg-amber-100 dark:bg-amber-900/30' },
  { type: 'action', name: 'Action', icon: <Globe size={18} className="text-blue-500" />, color: 'bg-blue-100 dark:bg-blue-900/30' },
  { type: 'condition', name: 'Condition', icon: <CheckCircle size={18} className="text-emerald-500" />, color: 'bg-emerald-100 dark:bg-emerald-900/30' },
  { type: 'delay', name: 'Delay', icon: <Clock size={18} className="text-purple-500" />, color: 'bg-purple-100 dark:bg-purple-900/30' }
];

const triggerOptions = [
  { id: 'new-reservation', name: 'New Reservation Created', icon: <Calendar size={16} /> },
  { id: 'booking-confirmed', name: 'Booking Confirmed', icon: <CheckCircle size={16} /> },
  { id: 'payment-received', name: 'Payment Received', icon: <CreditCard size={16} /> },
  { id: 'guest-checkin', name: 'Guest Check-in', icon: <Users size={16} /> },
  { id: 'guest-checkout', name: 'Guest Check-out', icon: <Users size={16} /> },
  { id: 'review-submitted', name: 'Review Submitted', icon: <MessageSquare size={16} /> }
];

const actionOptions = [
  { id: 'send-email', name: 'Send Email', icon: <Mail size={16} /> },
  { id: 'send-sms', name: 'Send SMS', icon: <MessageSquare size={16} /> },
  { id: 'webhook', name: 'Webhook Call', icon: <Globe size={16} /> },
  { id: 'update-crm', name: 'Update CRM', icon: <Users size={16} /> },
  { id: 'create-invoice', name: 'Create Invoice', icon: <FileText size={16} /> },
  { id: 'update-database', name: 'Update Database', icon: <Database size={16} /> }
];

export default function IntegrationBuilder() {
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'node-1',
      type: 'trigger',
      name: 'New Reservation Created',
      icon: <Calendar size={18} className="text-blue-500" />,
      config: {}
    },
    {
      id: 'node-2',
      type: 'action',
      name: 'Send Email',
      icon: <Mail size={18} className="text-emerald-500" />,
      config: {}
    }
  ]);
  const [connections, setConnections] = useState<WorkflowConnection[]>([
    { from: 'node-1', to: 'node-2' }
  ]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [showNodePalette, setShowNodePalette] = useState(false);
  const [workflowName, setWorkflowName] = useState('Guest Welcome Automation');
  const [isRunning, setIsRunning] = useState(false);

  const addNode = (type: string, name: string, icon: React.ReactNode) => {
    const newNode: WorkflowNode = {
      id: `node-${nodes.length + 1}`,
      type: type as any,
      name,
      icon,
      config: {}
    };
    setNodes([...nodes, newNode]);
    setShowNodePalette(false);
  };

  const deleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    if (selectedNode?.id === nodeId) setSelectedNode(null);
  };

  const runWorkflow = () => {
    setIsRunning(true);
    setTimeout(() => setIsRunning(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="integration-builder">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-purple-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Integration Builder</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <Save size={14} /> Save Draft
          </button>
          <button
            onClick={runWorkflow}
            disabled={isRunning}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 rounded-xl font-bold text-xs text-white flex items-center gap-2"
          >
            <Play size={14} /> {isRunning ? 'Running...' : 'Test Workflow'}
          </button>
        </div>
      </div>

      {/* Workflow Name */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-4">
        <input
          type="text"
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="w-full text-lg font-bold text-slate-900 dark:text-white outline-none bg-transparent"
          placeholder="Enter workflow name..."
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Node Palette */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Workflow size={16} className="text-purple-500" />
            Components
          </h3>
          
          <div className="mb-4">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Triggers</div>
            <div className="space-y-2">
              {triggerOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => addNode('trigger', option.name, option.icon)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 hover:bg-amber-50 dark:hover:bg-amber-900/20 border border-slate-200 dark:border-slate-800 rounded-xl text-left flex items-center gap-3 transition-all"
                >
                  <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600 dark:text-amber-400">
                    {option.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Actions</div>
            <div className="space-y-2">
              {actionOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => addNode('action', option.name, option.icon)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-800 rounded-xl text-left flex items-center gap-3 transition-all"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    {option.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{option.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={() => addNode('condition', 'Condition', <CheckCircle size={18} className="text-emerald-500" />)}
              className="w-full p-3 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900 rounded-xl text-left flex items-center gap-3 transition-all"
            >
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle size={16} />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Add Condition</span>
            </button>
            <button
              onClick={() => addNode('delay', 'Delay', <Clock size={18} className="text-purple-500" />)}
              className="w-full p-3 mt-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-900 rounded-xl text-left flex items-center gap-3 transition-all"
            >
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Clock size={16} />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white">Add Delay</span>
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-6 min-h-[500px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Workflow Canvas</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <Eye size={16} className="text-slate-400" />
              </button>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                <EyeOff size={16} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Workflow Visualization */}
          <div className="relative space-y-6">
            {nodes.map((node, index) => (
              <div key={node.id} className="relative">
                <div
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        node.type === 'trigger' ? 'bg-amber-100 dark:bg-amber-900/30' :
                        node.type === 'action' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        node.type === 'condition' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                        'bg-purple-100 dark:bg-purple-900/30'
                      }`}>
                        {node.icon}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{node.type}</div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{node.name}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">
                        <Settings size={14} className="text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                      >
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Connection Arrow */}
                {index < nodes.length - 1 && (
                  <div className="flex justify-center py-2">
                    <div className="w-0.5 h-8 bg-slate-300 dark:bg-slate-700 relative">
                      <ArrowRight size={16} className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-slate-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {nodes.length === 0 && (
              <div className="text-center py-12">
                <Workflow size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Drag components from the palette to build your workflow</p>
              </div>
            )}
          </div>
        </div>

        {/* Node Configuration */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Settings size={16} className="text-purple-500" />
            Configuration
          </h3>

          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Node Type</label>
                <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs font-bold text-slate-900 dark:text-white uppercase">
                  {selectedNode.type}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Name</label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const updatedNodes = nodes.map(n =>
                      n.id === selectedNode.id ? { ...n, name: e.target.value } : n
                    );
                    setNodes(updatedNodes);
                    setSelectedNode({ ...selectedNode, name: e.target.value });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              {selectedNode.type === 'trigger' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Trigger Event</label>
                  <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20">
                    {triggerOptions.map(opt => (
                      <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedNode.type === 'action' && (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Action Type</label>
                    <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20">
                      {actionOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Parameters</label>
                    <textarea
                      placeholder="Add parameters in JSON format"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20 h-24 font-mono"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'condition' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Condition Logic</label>
                  <textarea
                    placeholder="Define condition logic"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20 h-24 font-mono"
                  />
                </div>
              )}

              {selectedNode.type === 'delay' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 block">Delay Duration</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="30"
                      className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                    <select className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/20">
                      <option>minutes</option>
                      <option>hours</option>
                      <option>days</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <button className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center justify-center gap-2">
                  <Copy size={14} /> Duplicate Node
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Settings size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Select a node to configure</p>
            </div>
          )}
        </div>
      </div>

      {/* Workflow Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
              <Workflow size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{nodes.length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Total Nodes</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Zap size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{nodes.filter(n => n.type === 'trigger').length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Triggers</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Globe size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{nodes.filter(n => n.type === 'action').length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Actions</div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 dark:text-white">{nodes.filter(n => n.type === 'condition').length}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Conditions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
