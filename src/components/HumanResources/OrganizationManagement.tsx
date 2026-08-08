import { useState } from 'react';
import { 
  Building2, 
  Users, 
  GitBranch, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Briefcase,
  MapPin
} from 'lucide-react';

const OrganizationManagement = () => {
  const [activeTab, setActiveTab] = useState<'structure' | 'positions' | 'chart'>('structure');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['dept-1', 'dept-2']));

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const organizationTree = [
    {
      id: 'company-1',
      name: 'Master Hotel Group',
      type: 'company',
      children: [
        {
          id: 'hotel-1',
          name: 'Grand Hotel Downtown',
          type: 'hotel',
          location: 'New York, USA',
          children: [
            {
              id: 'dept-1',
              name: 'Front Office',
              type: 'department',
              head: 'Sarah Johnson',
              headcount: 45,
              children: [
                { id: 'team-1', name: 'Reception', type: 'team', headcount: 12 },
                { id: 'team-2', name: 'Concierge', type: 'team', headcount: 8 },
                { id: 'team-3', name: 'Bell Services', type: 'team', headcount: 6 },
              ]
            },
            {
              id: 'dept-2',
              name: 'Housekeeping',
              type: 'department',
              head: 'James Chen',
              headcount: 68,
              children: [
                { id: 'team-4', name: 'Room Attendants', type: 'team', headcount: 45 },
                { id: 'team-5', name: 'Public Areas', type: 'team', headcount: 15 },
                { id: 'team-6', name: 'Laundry', type: 'team', headcount: 8 },
              ]
            },
            {
              id: 'dept-3',
              name: 'Food & Beverage',
              type: 'department',
              head: 'Elena Martinez',
              headcount: 72,
              children: [
                { id: 'team-7', name: 'Kitchen', type: 'team', headcount: 25 },
                { id: 'team-8', name: 'Restaurant Service', type: 'team', headcount: 30 },
                { id: 'team-9', name: 'Room Service', type: 'team', headcount: 12 },
                { id: 'team-10', name: 'Bar', type: 'team', headcount: 5 },
              ]
            },
            {
              id: 'dept-4',
              name: 'Engineering',
              type: 'department',
              head: 'Robert Wilson',
              headcount: 24,
              children: [
                { id: 'team-11', name: 'Maintenance', type: 'team', headcount: 15 },
                { id: 'team-12', name: 'Electrical', type: 'team', headcount: 5 },
                { id: 'team-13', name: 'HVAC', type: 'team', headcount: 4 },
              ]
            }
          ]
        }
      ]
    }
  ];

  const positions = [
    { id: 'POS-001', title: 'General Manager', department: 'Executive', grade: 'Executive', reportsTo: 'Board', vacancies: 0, budget: 180000 },
    { id: 'POS-002', title: 'Front Office Manager', department: 'Front Office', grade: 'Senior Management', reportsTo: 'General Manager', vacancies: 0, budget: 85000 },
    { id: 'POS-003', title: 'Receptionist', department: 'Front Office', grade: 'Staff', reportsTo: 'Front Office Manager', vacancies: 3, budget: 38000 },
    { id: 'POS-004', title: 'Executive Chef', department: 'F&B', grade: 'Senior Management', reportsTo: 'General Manager', vacancies: 0, budget: 95000 },
    { id: 'POS-005', title: 'Line Cook', department: 'F&B', grade: 'Staff', reportsTo: 'Executive Chef', vacancies: 5, budget: 35000 },
    { id: 'POS-006', title: 'Chief Engineer', department: 'Engineering', grade: 'Senior Management', reportsTo: 'General Manager', vacancies: 0, budget: 78000 },
    { id: 'POS-007', title: 'Room Attendant', department: 'Housekeeping', grade: 'Staff', reportsTo: 'Executive Housekeeper', vacancies: 8, budget: 32000 },
  ];

  const renderTreeNode = (node: any, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;
    
    return (
      <div key={node.id} className="select-none">
        <div 
          className="flex items-center gap-2 py-2 px-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => hasChildren && toggleNode(node.id)}
        >
          {hasChildren && (
            <div className="w-4 h-4 flex items-center justify-center">
              {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            </div>
          )}
          {!hasChildren && <div className="w-4" />}
          
          <div className={`w-6 h-6 rounded flex items-center justify-center ${
            node.type === 'company' ? 'bg-indigo-100 text-indigo-600' :
            node.type === 'hotel' ? 'bg-emerald-100 text-emerald-600' :
            node.type === 'department' ? 'bg-blue-100 text-blue-600' :
            'bg-slate-100 text-slate-600'
          }`}>
            {node.type === 'company' && <Building2 size={14} />}
            {node.type === 'hotel' && <MapPin size={14} />}
            {node.type === 'department' && <Users size={14} />}
            {node.type === 'team' && <Briefcase size={14} />}
          </div>
          
          <span className="text-xs font-semibold text-slate-900 dark:text-white">{node.name}</span>

          {node.headcount && (
            <span className="text-xs font-medium text-slate-400 ml-auto">{node.headcount} staff</span>
          )}
          
          <button className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded opacity-0 group-hover:opacity-100 transition">
            <MoreVertical size={14} className="text-slate-400" />
          </button>
        </div>
        
        {isExpanded && hasChildren && (
          <div>
            {node.children.map((child: any) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organization Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage organizational structure, positions, and reporting lines</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium">
          <Plus size={16} />
          Add Unit
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Departments', value: '8', icon: Building2, color: 'text-indigo-600', bgClass: 'bg-indigo-100 dark:bg-indigo-500/20' },
          { label: 'Total Positions', value: '45', icon: Briefcase, color: 'text-emerald-600', bgClass: 'bg-emerald-100 dark:bg-emerald-500/20' },
          { label: 'Total Teams', value: '12', icon: Users, color: 'text-blue-600', bgClass: 'bg-blue-100 dark:bg-blue-500/20' },
          { label: 'Vacant Positions', value: '14', icon: MapPin, color: 'text-amber-600', bgClass: 'bg-amber-100 dark:bg-amber-500/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400 uppercase leading-none mb-1">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-fit">
        {[
          { id: 'structure', label: 'Structure', icon: GitBranch },
          { id: 'positions', label: 'Positions', icon: Briefcase },
          { id: 'chart', label: 'Org Chart', icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Structure Tab */}
      {activeTab === 'structure' && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Organization Tree */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Organization Hierarchy</h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search units..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-4 max-h-[500px] overflow-y-auto">
              {organizationTree.map((node) => renderTreeNode(node))}
            </div>
          </div>

          {/* Unit Details */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Unit Details</h3>
            
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600 dark:text-blue-400" size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Front Office</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 uppercase">Department</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">Department Head</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Sarah Johnson</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">Total Staff</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">45</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">Teams</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400">Cost Center</span>
                    <span className="text-xs font-bold text-indigo-600">CC-FO-001</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                  <Edit size={14} />
                  Edit
                </button>
                <button className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2">
                  <Users size={14} />
                  View Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Positions Tab */}
      {activeTab === 'positions' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Position Management</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search positions..."
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Add Position
              </button>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Position</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Department</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Grade</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase">Reports To</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase text-center">Vacancies</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase text-right">Budget</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-400 uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {positions.map((pos) => (
                <tr key={pos.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Briefcase className="text-indigo-600 dark:text-indigo-400" size={14} />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-900 dark:text-white block">{pos.title}</span>
                        <span className="text-xs font-medium text-slate-400">{pos.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{pos.department}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium uppercase">
                      {pos.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{pos.reportsTo}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${
                      pos.vacancies > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {pos.vacancies}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-900 dark:text-white">
                    ${pos.budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Edit size={14} className="text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition">
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Org Chart Tab */}
      {activeTab === 'chart' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Organization Chart</h3>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium uppercase">
                Expand All
              </button>
              <button className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-medium uppercase">
                Collapse All
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium uppercase">
                Export
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            {/* CEO Level */}
            <div className="bg-indigo-600 text-white p-4 rounded-xl text-center min-w-[200px]">
              <div className="w-12 h-12 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-semibold">
                GM
              </div>
              <h4 className="text-sm font-semibold">General Manager</h4>
              <p className="text-xs opacity-80">Executive</p>
            </div>

            {/* Department Heads */}
            <div className="flex gap-8 mt-8">
              {[
                { name: 'Front Office Manager', dept: 'Front Office', color: 'bg-blue-500' },
                { name: 'Executive Chef', dept: 'F&B', color: 'bg-emerald-500' },
                { name: 'Executive Housekeeper', dept: 'Housekeeping', color: 'bg-purple-500' },
                { name: 'Chief Engineer', dept: 'Engineering', color: 'bg-amber-500' },
              ].map((head, i) => (
                <div key={i} className={`${head.color} text-white p-3 rounded-xl text-center min-w-[160px]`}>
                  <div className="w-10 h-10 bg-white/20 rounded-full mx-auto mb-2 flex items-center justify-center text-sm font-semibold">
                    {head.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h5 className="text-xs font-semibold leading-tight">{head.name}</h5>
                  <p className="text-xs opacity-80">{head.dept}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizationManagement;
