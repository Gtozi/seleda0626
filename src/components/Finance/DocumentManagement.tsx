import React, { useState } from 'react';
import { FileText, Download, Search, Filter, Upload, Eye, Trash2, Calendar, User, Building2, CheckCircle, AlertCircle } from 'lucide-react';

const DocumentManagement = () => {
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Mock data for financial documents
  const documents = [
    {
      id: 'DOC-001',
      name: 'Invoice_2024_001.pdf',
      type: 'Invoice',
      category: 'Accounts Receivable',
      entity: 'Guest Ledger',
      uploadedBy: 'finance@erp.com',
      uploadDate: '2024-01-15',
      size: '245 KB',
      status: 'Processed'
    },
    {
      id: 'DOC-002',
      name: 'Vendor_Invoice_SUP_045.pdf',
      type: 'Vendor Invoice',
      category: 'Accounts Payable',
      entity: 'ABC Supplies Ltd',
      uploadedBy: 'finance@erp.com',
      uploadDate: '2024-01-18',
      size: '512 KB',
      status: 'Processed'
    },
    {
      id: 'DOC-003',
      name: 'Journal_Entry_JE_2024_015.pdf',
      type: 'Journal Attachment',
      category: 'General Ledger',
      entity: 'Adjustment Entry',
      uploadedBy: 'finance@erp.com',
      uploadDate: '2024-01-20',
      size: '128 KB',
      status: 'Processed'
    },
    {
      id: 'DOC-004',
      name: 'Bank_Statement_Jan_2024.pdf',
      type: 'Bank Statement',
      category: 'Cash & Bank',
      entity: 'CBE Account',
      uploadedBy: 'finance@erp.com',
      uploadDate: '2024-01-25',
      size: '1.2 MB',
      status: 'Processed'
    },
    {
      id: 'DOC-005',
      type: 'Contract',
      name: 'Service_Contract_2024.pdf',
      category: 'Treasury',
      entity: 'Corporate Office',
      uploadedBy: 'finance@erp.com',
      uploadDate: '2024-01-28',
      size: '2.5 MB',
      status: 'Pending Review'
    },
    {
      id: 'DOC-006',
      name: 'Tax_Report_Q4_2023.pdf',
      type: 'Tax Document',
      category: 'Tax Management',
      entity: 'ERCA Filing',
      uploadedBy: 'finance@erp.com',
      uploadDate: '2024-01-30',
      size: '890 KB',
      status: 'Processed'
    }
  ];

  const documentTypes = ['all', 'Invoice', 'Vendor Invoice', 'Journal Attachment', 'Bank Statement', 'Contract', 'Tax Document', 'Payment Voucher', 'Receipt'];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.entity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Document Management</h1>
          <p className="text-sm text-slate-500 mt-1">Centralized repository for invoices, receipts, payment vouchers, and financial documents</p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center gap-2">
          <Upload size={14} /> Upload Document
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-indigo-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Documents</span>
          </div>
          <span className="text-2xl font-black text-slate-900 dark:text-white">{documents.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle size={16} className="text-emerald-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processed</span>
          </div>
          <span className="text-2xl font-black text-emerald-600">{documents.filter(d => d.status === 'Processed').length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-amber-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</span>
          </div>
          <span className="text-2xl font-black text-amber-600">{documents.filter(d => d.status === 'Pending Review').length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Building2 size={16} className="text-rose-600" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Size</span>
          </div>
          <span className="text-2xl font-black text-rose-600">5.5 MB</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by name or entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {documentTypes.map(type => (
              <option key={type} value={type}>{type === 'all' ? 'All Types' : type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Financial Documents</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950/20 border-b border-slate-200 dark:border-slate-800">
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Name</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded By</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Size</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{doc.type}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{doc.category}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white">{doc.entity}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{doc.uploadedBy}</td>
                <td className="px-4 py-3 text-xs font-bold text-slate-600 dark:text-slate-400">{doc.uploadDate}</td>
                <td className="px-4 py-3 text-xs font-mono text-slate-600 dark:text-slate-400">{doc.size}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase ${
                    doc.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {doc.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => setSelectedDocument(doc)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition" title="View">
                      <Eye size={14} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition" title="Download">
                      <Download size={14} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <button className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/20 rounded-lg transition" title="Delete">
                      <Trash2 size={14} className="text-rose-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDocument(null)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{selectedDocument.name}</h3>
              <p className="text-sm text-slate-500 mt-1">Document Details</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Document Type</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDocument.type}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDocument.category}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Entity</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDocument.entity}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">File Size</span>
                  <span className="text-sm font-mono text-slate-600 dark:text-slate-400">{selectedDocument.size}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Uploaded By</span>
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDocument.uploadedBy}</span>
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Upload Date</span>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-slate-400" />
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedDocument.uploadDate}</span>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Processing Status</span>
                <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                  selectedDocument.status === 'Processed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedDocument.status}
                </span>
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setSelectedDocument(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-lg text-xs font-black uppercase tracking-widest transition">
                Close
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-black uppercase tracking-widest transition flex items-center gap-2">
                <Download size={14} /> Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;
