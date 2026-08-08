import React, { useState } from 'react';
import { FileText, Plus, Edit, Search, Filter, Download, Eye, Trash2, FolderOpen } from 'lucide-react';

interface DocumentTemplate {
  id: string;
  name: string;
  type: 'invoice' | 'registration_card' | 'contract' | 'beo' | 'report' | 'receipt' | 'certificate' | 'email' | 'sms';
  category: string;
  status: 'active' | 'draft' | 'archived';
  lastModified: string;
  modifiedBy: string;
  version: string;
}

const DocumentTemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<DocumentTemplate[]>([
    { id: '1', name: 'Standard Invoice Template', type: 'invoice', category: 'Finance', status: 'active', lastModified: '2024-01-15', modifiedBy: 'Finance Team', version: '2.1' },
    { id: '2', name: 'Guest Registration Card', type: 'registration_card', category: 'Front Office', status: 'active', lastModified: '2024-01-14', modifiedBy: 'Front Office Manager', version: '3.0' },
    { id: '3', name: 'Event Contract Template', type: 'contract', category: 'Banquet', status: 'active', lastModified: '2024-01-13', modifiedBy: 'Banquet Manager', version: '1.5' },
    { id: '4', name: 'BEO Template', type: 'beo', category: 'Banquet', status: 'active', lastModified: '2024-01-12', modifiedBy: 'Banquet Coordinator', version: '2.2' },
    { id: '5', name: 'Daily Revenue Report', type: 'report', category: 'Reports', status: 'active', lastModified: '2024-01-15', modifiedBy: 'Revenue Manager', version: '1.8' },
    { id: '6', name: 'Payment Receipt', type: 'receipt', category: 'Finance', status: 'active', lastModified: '2024-01-11', modifiedBy: 'Finance Team', version: '1.3' },
    { id: '7', name: 'Guest Certificate', type: 'certificate', category: 'Guest Services', status: 'draft', lastModified: '2024-01-10', modifiedBy: 'Guest Services', version: '1.0' },
    { id: '8', name: 'Welcome Email Template', type: 'email', category: 'Communication', status: 'active', lastModified: '2024-01-09', modifiedBy: 'Marketing', version: '2.5' },
    { id: '9', name: 'Booking Confirmation SMS', type: 'sms', category: 'Communication', status: 'active', lastModified: '2024-01-08', modifiedBy: 'Marketing', version: '1.2' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || template.type === filterType;
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    return matchesSearch && matchesType && matchesCategory;
  });

  const documentTypes = [
    { id: 'invoice', name: 'Invoice', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' },
    { id: 'registration_card', name: 'Registration Card', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400' },
    { id: 'contract', name: 'Contract', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400' },
    { id: 'beo', name: 'BEO', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400' },
    { id: 'report', name: 'Report', color: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-800 dark:text-cyan-400' },
    { id: 'receipt', name: 'Receipt', color: 'bg-rose-100 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400' },
    { id: 'certificate', name: 'Certificate', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-800 dark:text-pink-400' },
    { id: 'email', name: 'Email', color: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-400' },
    { id: 'sms', name: 'SMS', color: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400';
      case 'draft': return 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-400';
      case 'archived': return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Document & Template Management</h1>
          <p className="text-xs text-slate-400">Manage invoice templates, registration cards, contracts, BEO templates, reports, receipts, certificates, email templates, and SMS templates</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-colors flex items-center gap-2">
          <Plus size={16} />
          Add Template
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Templates', value: templates.length, icon: FileText, color: 'text-blue-600' },
          { label: 'Active', value: templates.filter(t => t.status === 'active').length, icon: Eye, color: 'text-emerald-600' },
          { label: 'Draft', value: templates.filter(t => t.status === 'draft').length, icon: FileText, color: 'text-amber-600' },
          { label: 'Categories', value: [...new Set(templates.map(t => t.category))].length, icon: FolderOpen, color: 'text-purple-600' },
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
              placeholder="Search templates..."
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
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {[...new Set(templates.map(t => t.category))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
              <Filter size={16} />
              More Filters
            </button>
          </div>
        </div>
      </div>

      {/* Templates Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-wider">Last Modified</th>
                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTemplates.map((template) => {
                const type = documentTypes.find(t => t.id === template.type);
                return (
                  <tr key={template.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{template.name}</div>
                          <div className="text-xs text-slate-500">{template.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${type?.color}`}>
                        {type?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{template.category}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{template.version}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(template.status)}`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{template.lastModified}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Eye size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Download size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Edit size={16} className="text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Types Overview */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white mb-4">Document Types</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {documentTypes.map((type) => (
            <div key={type.id} className={`p-3 rounded-xl ${type.color} flex flex-col items-center justify-center`}>
              <FileText size={20} className="mb-2" />
              <span className="text-xs font-bold">{type.name}</span>
              <span className="text-[10px] opacity-75">{templates.filter(t => t.type === type.id).length} templates</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentTemplateManagement;