/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Check, X, AlertTriangle, FileText, Camera, ShieldCheck, 
  Clock, User, Calendar, Eye, Download, Upload
} from 'lucide-react';

interface Document {
  id: string;
  documentType: 'ID Document' | 'Payment Receipt';
  fileName: string;
  uploadedAt: string;
  uploadedBy: string;
  verificationStatus: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  verificationNotes?: string;
  storagePath: string;
  ocrExtractedData?: Record<string, any>;
}

interface DocumentVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  onVerify: (documentId: string, status: 'Approved' | 'Rejected' | 'Flagged', notes?: string) => void;
  onViewDocument: (documentId: string) => void;
  currentUser: string;
}

export default function DocumentVerificationModal({
  isOpen,
  onClose,
  documents,
  onVerify,
  onViewDocument,
  currentUser
}: DocumentVerificationModalProps) {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [showOcrData, setShowOcrData] = useState(false);

  if (!isOpen) return null;

  const pendingDocs = documents.filter(d => d.verificationStatus === 'Pending');
  const processedDocs = documents.filter(d => d.verificationStatus !== 'Pending');

  const handleVerify = (status: 'Approved' | 'Rejected' | 'Flagged') => {
    if (!selectedDoc) return;
    onVerify(selectedDoc.id, status, verificationNotes);
    setSelectedDoc(null);
    setVerificationNotes('');
    setShowOcrData(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'Flagged': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <Check size={14} />;
      case 'Rejected': return <X size={14} />;
      case 'Flagged': return <AlertTriangle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <ShieldCheck size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Document Verification Queue</h2>
              <p className="text-xs text-slate-500">
                {pendingDocs.length} pending • {processedDocs.length} processed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document List */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                Documents
              </h3>

              {/* Pending Documents */}
              {pendingDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-slate-500 uppercase font-semibold">Pending Review</p>
                  {pendingDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        selectedDoc?.id === doc.id
                          ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {doc.documentType === 'ID Document' ? (
                            <Camera size={16} className="text-slate-400" />
                          ) : (
                            <FileText size={16} className="text-slate-400" />
                          )}
                          <span className="text-sm font-semibold text-slate-800">{doc.fileName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(doc.verificationStatus)}`}>
                          {doc.verificationStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {doc.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Processed Documents */}
              {processedDocs.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-mono text-slate-500 uppercase font-semibold">Processed</p>
                  {processedDocs.map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        selectedDoc?.id === doc.id
                          ? 'bg-indigo-50 border-indigo-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {doc.documentType === 'ID Document' ? (
                            <Camera size={16} className="text-slate-400" />
                          ) : (
                            <FileText size={16} className="text-slate-400" />
                          )}
                          <span className="text-sm font-semibold text-slate-800">{doc.fileName}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${getStatusColor(doc.verificationStatus)}`}>
                          {getStatusIcon(doc.verificationStatus)}
                          {doc.verificationStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User size={12} />
                          {doc.uploadedBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {documents.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No documents to verify</p>
                </div>
              )}
            </div>

            {/* Document Detail & Verification */}
            {selectedDoc ? (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Eye size={16} className="text-indigo-600" />
                  Document Details
                </h3>

                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">File Name</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedDoc.fileName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Type</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedDoc.documentType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${getStatusColor(selectedDoc.verificationStatus)}`}>
                      {getStatusIcon(selectedDoc.verificationStatus)}
                      {selectedDoc.verificationStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Uploaded By</span>
                    <span className="text-sm font-semibold text-slate-800">{selectedDoc.uploadedBy}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Uploaded At</span>
                    <span className="text-sm font-semibold text-slate-800">
                      {new Date(selectedDoc.uploadedAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* OCR Extracted Data */}
                {selectedDoc.ocrExtractedData && Object.keys(selectedDoc.ocrExtractedData).length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                    <button
                      onClick={() => setShowOcrData(!showOcrData)}
                      className="flex items-center justify-between w-full"
                    >
                      <span className="text-xs font-semibold text-amber-800 flex items-center gap-2">
                        <Camera size={14} />
                        OCR Extracted Data
                      </span>
                      <span className="text-xs text-amber-600">{showOcrData ? 'Hide' : 'Show'}</span>
                    </button>
                    {showOcrData && (
                      <div className="text-xs text-amber-900 space-y-1 font-mono">
                        {Object.entries(selectedDoc.ocrExtractedData).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="opacity-70">{key}:</span>
                            <span className="font-semibold">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Verification Actions */}
                {selectedDoc.verificationStatus === 'Pending' && (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-mono uppercase text-slate-500 font-semibold">
                        Verification Notes
                      </label>
                      <textarea
                        value={verificationNotes}
                        onChange={(e) => setVerificationNotes(e.target.value)}
                        placeholder="Add notes about this verification..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify('Approved')}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Check size={14} />
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify('Flagged')}
                        className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <AlertTriangle size={14} />
                        Flag
                      </button>
                      <button
                        onClick={() => handleVerify('Rejected')}
                        className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <X size={14} />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* View Document Button */}
                <button
                  onClick={() => onViewDocument(selectedDoc.id)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Eye size={14} />
                  View Document
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Select a document to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
