import React from 'react';
import { Printer, X } from 'lucide-react';

interface GroupCheckInPrintModalProps {
  data: {
    groupName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    groupId: string;
    roomCount: number;
    checkInDate: string;
  };
  onClose: () => void;
}

export default function GroupCheckInPrintModal({ data, onClose }: GroupCheckInPrintModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col print:shadow-none print:max-w-none print:h-full">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 p-4 print:hidden">
          <h3 className="font-sans font-bold text-slate-800 flex items-center gap-2">
            <Printer size={16} /> Print Group Registration Card
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-8 space-y-6 flex-1 bg-white print:p-10 font-sans" id="printable-group-form-area">
          <div className="text-center space-y-1 mb-8 border-b-2 border-slate-900 pb-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">GRAND HOTEL ERP</h1>
            <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">Group Block Registration</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Company / Group Name</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.groupName || 'N/A'}</div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Group Block ID</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.groupId}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Contact Name</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.contactName || 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Contact Email</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.contactEmail || 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Total Rooms Checked In</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.roomCount} Rooms</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Check-In Date</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.checkInDate}</div>
            </div>
          </div>

          <div className="pt-10 space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono text-center block">Authorized Representatives (Optional)</label>
              <div className="border-b border-slate-300 h-6"></div>
              <div className="border-b border-slate-300 h-6"></div>
            </div>

            <div className="grid grid-cols-2 gap-8 items-end flex-1 pt-4 pb-4">
              <div className="space-y-1">
                <div className="border-b border-slate-300 h-10 w-full mb-1"></div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono block text-center">Group Representative Signature</label>
              </div>
              <div className="space-y-1">
                <div className="border-b border-slate-300 h-10 w-full mb-1"></div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono block text-center">Front Desk Clerk Agent</label>
              </div>
            </div>
            
            <p className="text-[8px] text-center text-slate-400 font-sans mt-4 max-w-lg mx-auto leading-relaxed">
              By signing this master registration card I acknowledge and accept responsibility for all group charges and incidentals incurred under this master folio block.
            </p>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end gap-3 print:hidden rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 font-sans font-bold text-xs rounded-lg transition cursor-pointer">
            Dismiss
          </button>
          <button onClick={handlePrint} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-sans font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-2 cursor-pointer">
            <Printer size={14} /> Send to Print Queue
          </button>
        </div>
      </div>
    </div>
  );
}
