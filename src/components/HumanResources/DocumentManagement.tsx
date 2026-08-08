import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Search, 
  Filter, 
  FolderOpen,
  Shield,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit,
  Eye,
  MoreVertical,
  Plus
} from 'lucide-react';

const DocumentManagement = () => {
  const [activeTab, setActiveTab] = useState<'contracts' | 'personal' | 'certifications' | 'payroll'>('contracts');

  const employmentContracts = [
    { 
      id: 'DOC-001', 
      employee: 'Sarah Johnson', 
      type: 'Employment Contract',
      category: 'Contract',
      startDate: '2021-03-12',
      endDate: '2024-03-12',
      status: 'Active',
      version: '2.0',
      lastUpdated: '2023-03-12'
    },
    { 
      id: 'DOC-002', 
      employee: 'Robert Wilson', 
      type: 'Employment Contract',
      category: 'Contract',
      startDate: '2020-11-05',
      endDate: '2023-11-05',
      status: 'Renewed',
      version: '3.0',
      lastUpdated: '2023-11-05'
    },
    { 
      id: 'DOC-003', 
      employee: 'Elena Martinez', 
      type: 'Employment Contract',
      category: 'Contract',
      startDate: '2022-01-20',
      endDate: '2025-01-20',
      status: 'Active',
      version: '1.0',
      lastUpdated: '2022-01-20'
    },
  ];

  const personalDocuments = [
    { 
      id: 'DOC-004', 
      employee: 'John Doe', 
      type: 'Passport',
      category: 'Identification',
      documentNumber: 'A12345678',
      expiryDate: '2025-06-15',
      status: 'Valid',
      issuedDate: '2020-06-15'
    },
    { 
      id: 'DOC-005', 
      employee: 'Maria Garcia', 
      type: 'National ID',
      category: 'Identification',
      documentNumber: 'ID98765432',
      expiryDate: '2029-03-20',
      status: 'Valid',
      issuedDate: '2019-03-20'
    },
    { 
      id: 'DOC-006', 
      employee: 'Carlos Ray', 
      type: 'Work Permit',
      category: 'Legal',
      documentNumber: 'WP54321678',
      expiryDate: '2024-08-30',
      status: 'Expiring Soon',
      issuedDate: '2022-08-30'
    },
    { 
      id: 'DOC-007', 
      employee: 'Elena Smith', 
      type: 'Visa',
      category: 'Legal',
      documentNumber: 'VISA87654321',
      expiryDate: '2024-07-15',
      status: 'Expiring Soon',
      issuedDate: '2022-07-15'
    },
  ];

  const certifications = [
    { 
      id: 'CERT-001', 
      employee: 'Sarah Johnson', 
      name: 'Hotel Management Certification',
      issuingOrganization: 'American Hotel & Lodging Association',
      issueDate: '2020-08-15',
      expiryDate: '2025-08-15',
      status: 'Valid',
      category: 'Professional'
    },
    { 
      id: 'CERT-002', 
      employee: 'Elena Martinez', 
      name: 'Food Safety Manager Certification',
      issuingOrganization: 'ServSafe',
      issueDate: '2021-11-20',
      expiryDate: '2024-11-20',
      status: 'Expiring Soon',
      category: 'Safety'
    },
    { 
      id: 'CERT-003', 
      employee: 'Robert Wilson', 
      name: 'Electrical License',
      issuingOrganization: 'State Electrical Board',
      issueDate: '2018-03-10',
      expiryDate: '2024-03-10',
      status: 'Expired',
      category: 'Technical'
    },
    { 
      id: 'CERT-004', 
      employee: 'James Chen', 
      name: 'First Aid & CPR',
      issuingOrganization: 'Red Cross',
      issueDate: '2023-09-01',
      expiryDate: '2025-09-01',
      status: 'Valid',
      category: 'Safety'
    },
  ];

  const payrollDocuments = [
    { 
      id: 'PAY-001', 
      employee: 'All Employees', 
      type: 'Payroll Summary',
      period: 'June 2024',
      generatedDate: '2024-06-28',
      status: 'Available',
      category: 'Report'
    },
    { 
      id: 'PAY-002', 
      employee: 'All Employees', 
      type: 'Tax Summary',
      period: 'Q2 2024',
      generatedDate: '2024-06-30',
      status: 'Available',
      category: 'Tax'
    },
    { 
      id: 'PAY-003', 
      employee: 'All Employees', 
      type: 'Benefits Statement',
      period: '2024',
      generatedDate: '2024-01-15',
      status: 'Available',
      category: 'Benefits'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Document Management</h2>
          <p className="text-sm text-slate-500 mt-1">Manage contracts, personal documents, certifications, and payroll records</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-slate-50 transition shadow-sm">
            <Upload size={16} />
            Upload
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 text-sm transition shadow-sm">
            <Plus size={16} />
            New Document
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Documents', value: '1,248', icon: FileText, color: 'text-indigo-500' },
          { label: 'Expiring Soon', value: '12', icon: AlertCircle, color: 'text-amber-500' },
          { label: 'Expired', value: '5', icon: Shield, color: 'text-rose-500' },
          { label: 'This Month', value: '45', icon: Calendar, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 rounded-xl shadow-sm">
            <stat.icon className={`mb-3 ${stat.color}`} size={20} />
            <p className="text-xs font-medium text-slate-500 leading-none mb-1">{stat.label}</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'contracts', label: 'Contracts', icon: FileText },
          { id: 'personal', label: 'Personal Docs', icon: FolderOpen },
          { id: 'certifications', label: 'Certifications', icon: Shield },
          { id: 'payroll', label: 'Payroll Docs', icon: Calendar },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contracts Tab */}
      {activeTab === 'contracts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Employment Contracts</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search contracts..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Start Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">End Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Version</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {employmentContracts.map((contract) => (
                <tr key={contract.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{contract.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{contract.type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{contract.startDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{contract.endDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
                      {contract.version}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      contract.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {contract.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Eye size={14} className="text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Download size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Personal Documents Tab */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Personal Documents</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="text" 
                  placeholder="Search documents..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                <Filter size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Document Number</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Issue Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {personalDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{doc.employee}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.documentNumber}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.issuedDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.expiryDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.status === 'Valid' ? 'bg-emerald-50 text-emerald-600' : 
                      doc.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Eye size={14} className="text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Download size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Certifications Tab */}
      {activeTab === 'certifications' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Certifications</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Add Certification
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Certification</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Issuing Organization</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Issue Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Expiry Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {certifications.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{cert.employee}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white block">{cert.name}</span>
                      <span className="text-[9px] font-bold text-slate-400">{cert.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{cert.issuingOrganization}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{cert.issueDate}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{cert.expiryDate}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      cert.status === 'Valid' ? 'bg-emerald-50 text-emerald-600' : 
                      cert.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {cert.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Eye size={14} className="text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Download size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payroll Documents Tab */}
      {activeTab === 'payroll' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Payroll Documents</h3>
            <div className="flex items-center gap-2">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl flex items-center gap-2 text-xs transition">
                <Plus size={14} />
                Generate Report
              </button>
            </div>
          </div>
          
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/20">
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Employee</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Type</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Period</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Generated Date</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500">Category</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Status</th>
                <th className="px-6 py-4 text-xs font-medium text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {payrollDocuments.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{doc.employee}</span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-900 dark:text-white">{doc.type}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.period}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">{doc.generatedDate}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-xs font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-xs font-medium">
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Eye size={14} className="text-slate-400" />
                      </button>
                      <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                        <Download size={14} className="text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
