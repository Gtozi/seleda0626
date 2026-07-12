import React from 'react';
import { Printer, X } from 'lucide-react';

interface CheckInPrintModalProps {
  data: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    reservationId: string;
    roomNumber: string;
    checkInDate: string;
  };
  onClose: () => void;
}

export default function CheckInPrintModal({ data, onClose }: CheckInPrintModalProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 print:bg-white print:p-0">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col print:shadow-none print:max-w-none print:h-full">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 p-4 print:hidden">
          <h3 className="font-sans font-bold text-slate-800 flex items-center gap-2">
            <Printer size={16} /> Print Registration Card
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Printable Area */}
        <div className="p-8 space-y-6 flex-1 bg-white print:p-10 font-sans" id="printable-form-area">
          <div className="text-center space-y-1 mb-8 border-b-2 border-slate-900 pb-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">Gheralta</h1>
            <p className="text-xs font-mono tracking-widest text-slate-500 uppercase">Guest Registration Card</p>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Guest Name</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.guestName || 'N/A'}</div>
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Folio / Res ID</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.reservationId}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Email Contact</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.guestEmail || 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Mobile Contact</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.guestPhone || 'N/A'}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Room Number</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.roomNumber}</div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono">Check-In Date</label>
              <div className="text-sm font-semibold border-b border-slate-300 pb-1 text-slate-900">{data.checkInDate}</div>
            </div>
          </div>

          <div className="pt-10 space-y-8">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono text-center block">Vehicle Make / License (Optional)</label>
              <div className="border-b border-slate-300 h-6"></div>
            </div>

            <div className="grid grid-cols-2 gap-8 items-end">
              <div className="space-y-1">
                <div className="border-b border-slate-300 h-10 w-full mb-1"></div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono block text-center">Guest Signature</label>
              </div>
              <div className="space-y-1">
                <div className="border-b border-slate-300 h-10 w-full mb-1"></div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold font-mono block text-center">Front Desk Clerk Agent</label>
              </div>
            </div>
            
            <p className="text-[8px] text-center text-slate-400 font-sans mt-4 max-w-lg mx-auto leading-relaxed">
              By signing this registration card I acknowledge and accept responsibility for all charges incurred. I agree that liability for this bill is not waived.
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
