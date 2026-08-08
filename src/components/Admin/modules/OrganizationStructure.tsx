import React, { useState } from 'react';
import { Building2, MapPin, Users, Briefcase, Plus, Edit, Trash2, Search, ChevronRight, ChevronDown } from 'lucide-react';

interface OrgNode {
  id: string;
  name: string;
  type: 'company' | 'region' | 'cluster' | 'property' | 'division' | 'department' | 'cost_center' | 'business_unit';
  parentId: string | null;
  children?: OrgNode[];
  headCount: number;
  budget: number;
}

const OrganizationStructure: React.FC = () => {
  const [orgData, setOrgData] = useState<OrgNode[]>([
    { id: '1', name: 'SELEDA Hospitality Group', type: 'company', parentId: null, headCount: 2500, budget: 50000000 },
    { id: '2', name: 'North America', type: 'region', parentId: '1', headCount: 1200, budget: 25000000 },
    { id: '3', name: 'Europe', type: 'region', parentId: '1', headCount: 800, budget: 18000000 },
    { id: '4', name: 'Asia Pacific', type: 'region', parentId: '1', headCount: 500, budget: 7000000 },
    { id: '5', name: 'West Coast Cluster', type: 'cluster', parentId: '2', headCount: 600, budget: 12000000 },
    { id: '6', name: 'East Coast Cluster', type: 'cluster', parentId: '2', headCount: 600, budget: 13000000 },
    { id: '7', name: 'Grand Hotel Paris', type: 'property', parentId: '3', headCount: 300, budget: 8000000 },
    { id: '8', name: 'Rooms Division', type: 'division', parentId: '7', headCount: 150, budget: 3000000 },
    { id: '9', name: 'Front Office', type: 'department', parentId: '8', headCount: 50, budget: 500000 },
    { id: '10', name: 'Housekeeping', type: 'department', parentId: '8', headCount: 80, budget: 2000000 },
    { id: '11', name: 'Room Operations Cost Center', type: 'cost_center', parentId: '8', headCount: 20, budget: 500000 },
  ]);

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1', '2', '3', '7', '8']));
  const [searchTerm, setSearchTerm] = useState('');

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const buildTree = (parentId: string | null = null): OrgNode[] => {
    return orgData
      .filter(node => node.parentId === parentId)
      .map(node => ({
        ...node,
        children: buildTree(node.id)
      }));
  };

  const treeData = buildTree();

  const renderNode = (node: OrgNode, level: number = 0) => {
    const hasChildren = orgData.some(n => n.parentId === node.id);
    const isExpanded = expandedNodes.has(node.id);
    const matchesSearch = searchTerm === '' || node.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch && searchTerm !== '') return null;

    const typeColors = {
      company: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400',
      region: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400',
      cluster: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400',
      property: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400',
      division: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400',
      department: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400',
      cost_center: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400',
      business_unit: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400',
    };

    return (
      <div key={node.id} className="ml-4">
        <div 
          className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${level === 0 ? 'bg-slate-50 dark:bg-slate-800' : ''}`}
          style={{ marginLeft: level * 16 }}
        >
          {hasChildren && (
            <button 
              onClick={() => toggleNode(node.id)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeColors[node.type]}`}>
            {node.type === 'company' && <Building2 size={16} />}
            {node.type === 'region' && <MapPin size={16} />}
            {node.type === 'property' && <Building2 size={16} />}
            {node.type === 'department' && <Users size={16} />}
            {node.type === 'division' && <Briefcase size={16} />}
            {node.type === 'cost_center' && <Briefcase size={16} />}
            {node.type === 'cluster' && <Building2 size={16} />}
            {node.type === 'business_unit' && <Briefcase size={16} />}
          </div>
          
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900 dark:text-white">{node.name}</div>
            <div className="text-xs text-slate-500 capitalize">{node.type.replace('_', ' ')}</div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1">
              <Users size={12} />
              {node.headCount}
            </div>
            <div className="flex items-center gap-1">
              <Briefcase size={12} />
              ${(node.budget / 1000000).toFixed(1)}M
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Edit size={14} className="text-slate-400" />
            </button>
            <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Plus size={14} className="text-emerald-400" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="mt-1">
            {orgData
              .filter(n => n.parentId === node.id)
              .map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const hierarchyLevels = [
    { level: 'Company', count: orgData.filter(n => n.type === 'company').length, color: 'bg-indigo-500' },
    { level: 'Region', count: orgData.filter(n => n.type === 'region').length, color: 'bg-purple-500' },
    { level: 'Cluster', count: orgData.filter(n => n.type === 'cluster').length, color: 'bg-blue-500' },
    { level: 'Property', count: orgData.filter(n => n.type === 'property').length, color: 'bg-emerald-500' },
    { level: 'Division', count: orgData.filter(n => n.type === 'division').length, color: 'bg-amber-500' },
    { level: 'Department', count: orgData.filter(n => n.type === 'department').length, color: 'bg-cyan-500' },
    { level: 'Cost Center', count: orgData.filter(n => n.type === 'cost_center').length, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Organization Structure</h1>
          <p className="text-xs text-slate-400">Configure company hierarchy: Company, Region, Cluster, Property, Division, Department, Cost Center, Business Unit</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Unit
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {hierarchyLevels.map((item, index) => (
          <div key={index} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-3xs">
            <div className={`w-8 h-8 rounded-lg ${item.color} flex items-center justify-center mb-2`}>
              <Building2 size={16} className="text-white" />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{item.count}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase">{item.level}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-3xl shadow-sm">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search organization units..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Organization Tree */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Organization Hierarchy</h3>
            <p className="text-xs text-slate-400">Multi-level organizational structure</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Expand All
            </button>
            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Collapse All
            </button>
          </div>
        </div>

        <div className="space-y-1">
          {treeData.map(node => renderNode(node))}
        </div>
      </div>

      {/* Hierarchy Legend */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Hierarchy Levels</h3>
        <div className="flex flex-wrap gap-3">
          {hierarchyLevels.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">{item.level}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrganizationStructure;