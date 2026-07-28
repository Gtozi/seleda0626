import React from 'react';
import { 
  Printer, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  QrCode, 
  MapPin, 
  Building2, 
  Sparkles, 
  Leaf, 
  Layers, 
  FileCheck, 
  BookmarkCheck,
  DollarSign,
  CreditCard,
  Wallet,
  Landmark,
  Smartphone,
  History,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRightLeft
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { ModalSystem } from './ModalSystem';

const getPaymentIcon = (method: string) => {
  const m = method.toLowerCase();
  if (m.includes('cash')) return <Wallet size={12} className="text-emerald-500" />;
  if (m.includes('card') || m.includes('visa') || m.includes('mastercard')) return <CreditCard size={12} className="text-blue-500" />;
  if (m.includes('bank') || m.includes('transfer')) return <Landmark size={12} className="text-indigo-500" />;
  if (m.includes('mobile') || m.includes('mpesa')) return <Smartphone size={12} className="text-purple-500" />;
  if (m.includes('room') || m.includes('charge')) return <ArrowRightLeft size={12} className="text-amber-500" />;
  return <History size={12} className="text-slate-400" />;
};

export interface InvoiceItem {
  productName: string;
  quantity: number;
  price: number;
  code?: string;
}

export interface InvoiceFee {
  label: string;
  amount: number;
  isDiscount?: boolean;
}

export interface InvoicePayment {
  method: string;
  amount: number;
  date?: string;
}

interface UnifiedInvoiceTemplateProps {
  title?: string;
  invoiceNumber: string;
  date: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  roomNo?: string;
  customerTin?: string;
  customerVatNo?: string;
  customerVatDate?: string;
  stayDetails?: {
    checkIn?: string;
    checkOut?: string;
    nights?: number;
    roomType?: string;
    rate?: number;
  };
  items: InvoiceItem[];
  subtotal: number;
  fees?: InvoiceFee[];
  total: number;
  payments?: InvoicePayment[];
  balanceDue?: number;
  changeGiven?: number;
  footerMessage?: string;
  isPOSReceipt?: boolean;
  onClose: () => void;
}

export default function UnifiedInvoiceTemplate({
  title = 'OFFICIAL VAT INVOICE',
  invoiceNumber,
  date,
  customerName,
  customerEmail,
  customerPhone,
  roomNo,
  customerTin,
  customerVatNo,
  customerVatDate,
  stayDetails,
  items,
  subtotal,
  fees = [],
  total,
  payments = [],
  balanceDue = 0,
  changeGiven,
  footerMessage,
  isPOSReceipt = false,
  onClose
}: UnifiedInvoiceTemplateProps) {
  const { globalHotelSettings, updateGlobalHotelSettings, formatAmount } = useERP();
  
  // Active selected template: 'classic' | 'modern' | 'minimalist' | 'thermal'
  const activeTemplate = globalHotelSettings.invoiceTemplate || 'classic';

  const setTemplate = (tpl: 'classic' | 'modern' | 'minimalist' | 'thermal') => {
    updateGlobalHotelSettings({ invoiceTemplate: tpl });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <ModalSystem
      isOpen={true}
      onClose={onClose}
      title="Smart Digital Invoicing"
      variant="info"
      size="xl"
      showFooter={false}
    >
      {/* 1. TOP CONTROL BAR (HIDDEN DURING PRINT) */}
      <div className="w-full max-w-3xl bg-slate-900 text-white rounded-t-2xl px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl print:hidden border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-widest font-bold">SMART DIGITAL INVOICING</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-sans font-black tracking-tight uppercase">SELECT THEME OUTLINE:</span>
            </div>
          </div>
        </div>

        {/* Dynamic Theme Options Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-xl gap-1 border border-slate-700">
          <button 
            onClick={() => setTemplate('classic')}
            className={`px-3 py-1.5 text-[10px] font-sans font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTemplate === 'classic' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Classic Corporate
          </button>
          <button 
            onClick={() => setTemplate('modern')}
            className={`px-3 py-1.5 text-[10px] font-sans font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTemplate === 'modern' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Modern Luxury
          </button>
          <button 
            onClick={() => setTemplate('minimalist')}
            className={`px-3 py-1.5 text-[10px] font-sans font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTemplate === 'minimalist' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Eco Minimalist
          </button>
          <button 
            onClick={() => setTemplate('thermal')}
            className={`px-3 py-1.5 text-[10px] font-sans font-black uppercase tracking-wider rounded-lg transition-all ${
              activeTemplate === 'thermal' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Thermal Slip
          </button>
        </div>

        <button 
          onClick={handlePrint}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02] transform transition-all rounded-lg text-xs font-sans font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-indigo-900/30 font-bold"
        >
          <Printer size={13} />
          Print / PDF
        </button>
      </div>

      {/* 2. MAIN DOCUMENT WRAPPER */}
      <div className={`w-full max-w-3xl bg-white text-slate-850 p-8 md:p-12 shadow-2xl relative transition-all duration-300 print:shadow-none print:p-0 print:m-0 print:rounded-none ${
        activeTemplate === 'classic' ? 'rounded-b-2xl border-x border-b border-slate-200' :
        activeTemplate === 'modern' ? 'rounded-b-2xl border-x border-b border-indigo-150' :
        activeTemplate === 'minimalist' ? 'rounded-b-2xl border-x border-b border-stone-200 font-sans' :
        'max-w-md rounded-b-2xl border-x border-b border-amber-100 font-mono text-[10px]'
      }`}>

        {/* =========================================================================
           TEMPLATES 1: CLASSIC CORPORATE (DEFAULT)
           ========================================================================= */}
        {activeTemplate === 'classic' && (
          <div className="space-y-6">
            
            {/* Watermark for Paid */}
            {balanceDue <= 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-[0.03] pointer-events-none select-none">
                <div className="border-8 border-emerald-600 rounded-full p-20 flex items-center justify-center">
                  <span className="text-9xl font-black text-emerald-600 uppercase tracking-tighter italic">PAID</span>
                </div>
              </div>
            )}
            
            {/* Header Details */}
            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5">
              <div>
                <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900 uppercase">
                  {globalHotelSettings.customHotelName}
                </h1>
                <p className="text-xs text-slate-500 font-sans mt-1">
                  {globalHotelSettings.customHotelAddress}
                </p>
                <div className="text-[10px] text-slate-500 font-mono mt-2 space-x-2">
                  <span>TIN: <strong>{globalHotelSettings.hotelTin}</strong></span>
                  <span>|</span>
                  <span>VAT NO: <strong>{globalHotelSettings.hotelVatNo}</strong></span>
                  {globalHotelSettings.hotelVatDate && <span>({globalHotelSettings.hotelVatDate})</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-indigo-600 font-bold font-sans tracking-wider text-sm uppercase">{title}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">INVOICE NO:</div>
                <div className="font-mono text-xs font-bold text-slate-900">{invoiceNumber}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">ISSUED ON:</div>
                <div className="text-xs font-mono text-slate-650">{date}</div>
              </div>
            </div>

            {/* Billed To / Account info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <span className="text-[9px] uppercase tracking-wider text-slate-450 block font-bold font-sans">CLIENT RECIPIENT</span>
                <strong className="text-slate-800 font-sans text-sm">{customerName}</strong>
                {customerEmail && <div className="text-xs text-slate-500">{customerEmail}</div>}
                {customerPhone && <div className="text-xs text-slate-500">{customerPhone}</div>}
                {(customerTin || customerVatNo) && (
                  <div className="text-[9px] font-mono text-slate-500 mt-1 space-y-0.5 border-t border-slate-200/60 pt-1">
                    {customerTin && <div className="block">TIN: <strong>{customerTin}</strong></div>}
                    {customerVatNo && <div className="block">VAT: <strong>{customerVatNo}</strong> {customerVatDate && <span className="text-[8px] text-slate-400">({customerVatDate})</span>}</div>}
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {roomNo && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-450 block font-bold font-sans">ACCOMMODATION</span>
                    <strong className="text-slate-800">ROOM {roomNo}</strong>
                  </div>
                )}
                {stayDetails && (
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-450 block font-bold font-sans">STAY PERIOD</span>
                    <div className="text-[11px] text-slate-600">
                      {stayDetails.checkIn} to {stayDetails.checkOut}
                      <span className="block text-[9px] text-slate-400">({stayDetails.nights} nights)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stay Rates Context if applicable */}
            {stayDetails && (
              <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-dashed border-slate-150 text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">NIGHTLY RATE</span>
                  <strong className="text-slate-700">{formatAmount(stayDetails.rate || 0)}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">SUITE CLASS</span>
                  <strong className="text-slate-700">{stayDetails.roomType || 'Deluxe'}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">SYSTEM STATE</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-3xs font-mono font-bold">VERIFIED GUEST</span>
                </div>
              </div>
            )}

            {/* Particulars Table */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block font-bold">1. ITEMIZED PARTICULARS</span>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 text-[10px] uppercase text-slate-450 bg-slate-50 font-sans">
                    <th className="py-2.5 px-3">Description / Line Item</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate</th>
                    <th className="py-2.5 px-3 text-right">Total sum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-mono text-slate-700">
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{item.productName}</td>
                      <td className="py-2.5 px-3 text-center">x{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right">{formatAmount(item.price)}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-900">{formatAmount(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Ledger Payments */}
            {payments && payments.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block font-bold">2. CREDITS & PAYMENTS LOG</span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${balanceDue <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                    {balanceDue <= 0 ? <CheckCircle2 size={10} /> : <Clock size={10} />}
                    {balanceDue <= 0 ? 'Paid in Full' : 'Outstanding Balance'}
                  </div>
                </div>
                <div className="border border-slate-100 rounded-xl overflow-hidden shadow-3xs uppercase">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[9px] uppercase text-slate-450 bg-slate-50/50 font-sans">
                        <th className="py-2.5 px-4 font-black">Settlement Stamp</th>
                        <th className="py-2.5 px-4 font-black">Payment Source / Method</th>
                        <th className="py-2.5 px-4 text-right font-black">Credit Sum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs font-mono">
                      {payments.map((p, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50/20 transition-colors">
                          <td className="py-2.5 px-4 text-slate-450 italic">{p.date || date}</td>
                          <td className="py-2.5 px-4 text-slate-900 font-sans">
                            <div className="flex items-center gap-2">
                              <div className="p-1 bg-slate-50 rounded-md">
                                {getPaymentIcon(p.method)}
                              </div>
                              <span className="font-bold tracking-tight text-[11px] text-slate-800">
                                Settled via {p.method}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-4 text-right text-emerald-600 font-black tracking-tight">{formatAmount(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Computations Area */}
            <div className="flex justify-end pt-4 border-t border-slate-200">
              <div className="w-full max-w-sm space-y-1.5 text-xs text-slate-500 font-mono">
                <div className="flex justify-between">
                  <span>Charges Subtotal:</span>
                  <span>{formatAmount(subtotal)}</span>
                </div>
                {fees.map((fee, idx) => (
                  <div key={idx} className={`flex justify-between ${fee.isDiscount ? 'text-rose-600' : ''}`}>
                    <span>{fee.label}:</span>
                    <span>{fee.isDiscount ? '-' : '+'}{formatAmount(fee.amount)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between text-slate-900 font-sans font-black uppercase text-xs border-y border-dashed border-slate-200 py-2 mt-2">
                  <span>Grand total:</span>
                  <span className="text-sm font-mono">{formatAmount(total)}</span>
                </div>

                {changeGiven !== undefined && changeGiven > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Return Change Balance:</span>
                    <span>{formatAmount(changeGiven)}</span>
                  </div>
                )}

                {balanceDue !== undefined && (
                  <div className="flex justify-between text-slate-900 font-sans font-black text-sm pt-2">
                    <span>Net Balance Due:</span>
                    <span className={balanceDue > 0 ? 'text-amber-600 font-mono' : 'text-emerald-600 font-mono'}>
                      {formatAmount(balanceDue)} {balanceDue === 0 && '(Paid in Full)'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Standard signatures */}
            <div className="grid grid-cols-2 gap-8 pt-10 text-[9px] text-slate-400 font-sans uppercase tracking-widest text-center">
              <div className="space-y-4">
                <div className="h-0.5 bg-slate-250 w-3/4 mx-auto"></div>
                <div>Resident / Client Signature</div>
              </div>
              <div className="space-y-4">
                <div className="h-0.5 bg-slate-250 w-3/4 mx-auto"></div>
                <div>Authorized Officer Seal</div>
              </div>
            </div>

            {/* Legal terms footer */}
            <div className="flex flex-col gap-4 text-center text-[10px] text-slate-400 font-sans pt-6 border-t border-slate-100">
              {globalHotelSettings.invoiceBankDetails && (
                <div className="whitespace-pre-wrap font-mono text-[9px] text-slate-500">
                  {globalHotelSettings.invoiceBankDetails}
                </div>
              )}
              <div>
                {footerMessage || globalHotelSettings.invoiceFooterText || `Thank you for your business. For billing queries, support, or complaints, reach us on support@hotel-erp.com.`}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
           TEMPLATE 2: MODERN LUXURY (HIGH CONTRAST BOLD BRANDING)
           ========================================================================= */}
        {activeTemplate === 'modern' && (
          <div className="space-y-8 animate-fade-in relative">
            
            {/* Watermark for Paid */}
            {balanceDue <= 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-[0.02] pointer-events-none select-none">
                <div className="border-[12px] border-indigo-600 rounded-[60px] p-24 flex items-center justify-center">
                  <span className="text-9xl font-black text-indigo-600 uppercase tracking-tighter italic">SETTLED</span>
                </div>
              </div>
            )}
            
            {/* Visual Logo Banner */}
            <div className="bg-indigo-950 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-md relative overflow-hidden">
              <div className="absolute right-[-10px] top-[-10px] text-white/5 font-sans font-black text-5xl">HOTEL</div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/10 rounded-xl">
                  <Sparkles size={28} className="text-amber-400 animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-lg font-black font-sans tracking-tight uppercase">{globalHotelSettings.customHotelName}</h1>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-3xs font-mono font-bold tracking-widest uppercase mt-1">✓ Labeled Platinum Registry</span>
                </div>
              </div>
              
              <div className="text-left md:text-right font-sans shrink-0">
                <div className="text-2xs font-bold text-indigo-350 tracking-widest uppercase">{title}</div>
                <div className="text-base font-mono font-black mt-1 text-amber-300">{invoiceNumber}</div>
              </div>
            </div>

            {/* Meta & Addresses */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-sans">
              
              {/* Hotel Specs */}
              <div className="space-y-1.5 border-r border-slate-100 pr-4">
                <span className="text-[10px] font-black uppercase text-indigo-650 tracking-wider">Corporate Sender</span>
                <p className="font-medium text-slate-800">{globalHotelSettings.customHotelName}</p>
                <p className="text-[11px] text-slate-400 leading-tight">{globalHotelSettings.customHotelAddress}</p>
                <div className="text-[10px] text-slate-450 font-mono pt-1 leading-normal">
                  TIN: {globalHotelSettings.hotelTin}<br />
                  VAT: {globalHotelSettings.hotelVatNo}
                </div>
              </div>

              {/* Guest Specs */}
              <div className="space-y-1.5 border-r border-slate-100 pr-4">
                <span className="text-[10px] font-black uppercase text-indigo-650 tracking-wider">Recipient Guest</span>
                <p className="font-extrabold text-slate-900">{customerName}</p>
                {customerEmail && <p className="text-[11px] text-indigo-600 block">{customerEmail}</p>}
                {customerPhone && <p className="text-[11px] text-slate-500">{customerPhone}</p>}
                {(customerTin || customerVatNo) && (
                  <div className="text-[9px] font-mono text-slate-500 pt-1 border-t border-dashed border-slate-200 mt-1 space-y-0.5">
                    {customerTin && <div className="block">TIN: <strong>{customerTin}</strong></div>}
                    {customerVatNo && <div className="block">VAT: <strong>{customerVatNo}</strong></div>}
                  </div>
                )}
              </div>

              {/* Invoice Specs */}
              <div className="space-y-1 bg-indigo-50/40 p-3 rounded-xl">
                <span className="text-[10px] font-black uppercase text-indigo-650 tracking-wider">Stay & Voucher Data</span>
                {roomNo && <p className="text-slate-800"><strong>Assigned Base:</strong> Room {roomNo}</p>}
                {stayDetails && (
                  <>
                    <p className="text-slate-700"><strong>Suite Level:</strong> {stayDetails.roomType || 'Boutique'}</p>
                    <p className="text-slate-450 font-mono text-[10px]">{stayDetails.checkIn} &bull; {stayDetails.checkOut}</p>
                  </>
                )}
                <p className="text-[10px] text-slate-500 font-mono">Printed on: {date}</p>
              </div>

            </div>

            {/* Line Items Cards */}
            <div className="space-y-3">
              <span className="text-[10px] font-sans font-black uppercase text-indigo-650 tracking-wider block">Particulars Breakdown</span>
              
              <div className="border border-indigo-100/60 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase">
                      <th className="py-3 px-4">Line particulars</th>
                      <th className="py-3 px-4 text-center">Qty</th>
                      <th className="py-3 px-4 text-right">Price rate</th>
                      <th className="py-3 px-4 text-right">Sum total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-50/50">
                    {items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/10">
                        <td className="py-3 px-4 font-bold text-slate-800">{item.productName}</td>
                        <td className="py-3 px-4 text-center text-slate-500 font-mono">x{item.quantity}</td>
                        <td className="py-3 px-4 text-right text-slate-600 font-mono">{formatAmount(item.price)}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono">{formatAmount(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments List */}
            {payments && payments.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[10px] font-sans font-black uppercase text-indigo-650 tracking-wider block">Completed Credits Ledger</span>
                  <div className={`flex items-center gap-1 text-[10px] font-black uppercase ${balanceDue <= 0 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${balanceDue <= 0 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                    {balanceDue <= 0 ? 'Fully Settled' : 'Partial Payment'}
                  </div>
                </div>
                <div className="grid gap-3">
                  {payments.map((p, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex justify-between items-center group hover:border-indigo-200 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                          {getPaymentIcon(p.method)}
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Settled via {p.method}</p>
                          <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{p.date || date} • REF NO: {invoiceNumber}-{idx+1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-black text-emerald-600 font-mono">-{formatAmount(p.amount)}</span>
                        <div className="block text-[8px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Verified Fund</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invoice Calculations Box */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-lg">
              <div className="space-y-1 font-sans text-xs max-w-sm">
                <div className="flex gap-1.5 items-center text-amber-300">
                  <ShieldCheck size={14} />
                  <span className="font-extrabold uppercase text-[10px] tracking-widest">Financial Safety Certified</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-tight">These VAT values match parameters governed by the official regional Tourism tax codes.</p>
              </div>

              <div className="w-full md:w-64 space-y-1.5 text-xs font-mono text-slate-350">
                <div className="flex justify-between">
                  <span>Gross Cost:</span>
                  <span>{formatAmount(subtotal)}</span>
                </div>
                {fees.map((f, idx) => (
                  <div key={idx} className={`flex justify-between ${f.isDiscount ? 'text-rose-400' : ''}`}>
                    <span>{f.label}:</span>
                    <span>{f.isDiscount ? '-' : '+'}{formatAmount(f.amount)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between text-white font-sans font-black uppercase text-sm border-t border-slate-700 pt-2 mt-2">
                  <span>Grand Total:</span>
                  <span className="text-amber-300">{formatAmount(total)}</span>
                </div>

                {balanceDue !== undefined && (
                  <div className="flex justify-between text-slate-300 font-sans font-bold pt-1 text-xs">
                    <span>Outstanding Due:</span>
                    <span className={balanceDue > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {formatAmount(balanceDue)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Foot note */}
            <div className="pt-4 flex flex-col gap-3 text-center text-slate-400 text-[10px] font-sans">
              {globalHotelSettings.invoiceBankDetails && (
                <div className="whitespace-pre-wrap font-mono text-[9px] text-slate-500 text-right w-full flex justify-end">
                  <div className="text-left">{globalHotelSettings.invoiceBankDetails}</div>
                </div>
              )}
              <div>
                <p className="uppercase tracking-widest font-bold text-[9px] text-indigo-405 mb-1">★★★ Signature of Excellence ★★★</p>
                {footerMessage || globalHotelSettings.invoiceFooterText || "Premium Hospitality Services. Thanks for your visit."}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
           TEMPLATES 3: ECO-MINIMALIST (EARTHY SERENE SAGE ACENTS)
           ========================================================================= */}
        {activeTemplate === 'minimalist' && (
          <div className="space-y-6 font-serif select-none text-stone-850 animate-fade-in bg-stone-50/50 p-6 rounded-2xl border border-stone-200 relative">
            
            {/* Watermark for Paid */}
            {balanceDue <= 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 opacity-[0.03] pointer-events-none select-none">
                <div className="border-4 border-stone-800 rounded-full p-20 flex items-center justify-center">
                  <span className="text-8xl font-black text-stone-800 uppercase tracking-tighter italic">SOLVED</span>
                </div>
              </div>
            )}
            
            {/* Header Serif banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start border-b border-stone-300 pb-5 gap-4">
              <div>
                <div className="flex gap-2 items-center text-emerald-800">
                  <Leaf size={16} />
                  <span className="text-[10px] uppercase font-sans tracking-widest font-black">Earthy Sanctuary Lodge</span>
                </div>
                <h1 className="text-2xl font-black text-stone-900 italic mt-1 leading-none">{globalHotelSettings.customHotelName}</h1>
                <p className="text-xs text-stone-500 font-sans mt-1.5">{globalHotelSettings.customHotelAddress}</p>
                <p className="text-3xs text-stone-400 font-sans mt-0.5">TIN: {globalHotelSettings.hotelTin} | VAT: {globalHotelSettings.hotelVatNo}</p>
              </div>
              
              <div className="text-left sm:text-right font-sans">
                <span className="text-3xs font-extrabold uppercase text-emerald-800 tracking-wider">{title}</span>
                <p className="text-lg font-mono font-bold text-stone-800">{invoiceNumber}</p>
                <p className="text-[10px] text-stone-450 mt-1">Date: {date}</p>
              </div>
            </div>

            {/* Guest details */}
            <div className="bg-white p-5 rounded-xl border border-stone-200/60 text-xs font-sans space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-stone-400 text-[9px] uppercase tracking-widest font-bold block">GUEST FOLIO RECORD</span>
                  <strong className="text-stone-900 text-sm italic font-serif">{customerName}</strong>
                  {customerEmail && <div className="text-stone-500 text-[11px] mt-0.5">{customerEmail}</div>}
                  {(customerTin || customerVatNo) && (
                    <div className="text-[9px] font-mono text-stone-550 mt-1 border-t border-dashed border-stone-200 pt-1 space-y-0.5">
                      {customerTin && <div className="block">TIN: <span>{customerTin}</span></div>}
                      {customerVatNo && <div className="block">VAT: <span>{customerVatNo}</span></div>}
                    </div>
                  )}
                </div>
                
                {roomNo && (
                  <div className="text-right">
                    <span className="text-stone-400 text-[9px] uppercase tracking-widest font-bold block">SANCTUARY BASE</span>
                    <strong className="text-emerald-800 text-[13x]">ROOM {roomNo}</strong>
                  </div>
                )}
              </div>

              {stayDetails && (
                <div className="pt-2 border-t border-stone-100 flex justify-between text-[11px] text-stone-600 font-serif">
                  <span>Room Selection: <em>{stayDetails.roomType} Suite</em></span>
                  <span>Duration: {stayDetails.nights} Nights Stay</span>
                  <span>Base Rate: {formatAmount(stayDetails.rate || 0)}</span>
                </div>
              )}
            </div>

            {/* Simple Elegant Table */}
            <div className="pt-2">
              <table className="w-full text-left font-sans text-xs relative">
                <thead>
                  <tr className="border-b border-stone-300 text-[10px] uppercase font-bold text-emerald-800">
                    <th className="py-2.5">PARTICULAR DOCKET</th>
                    <th className="py-2.5 text-center">QTY</th>
                    <th className="py-2.5 text-right font-serif">PRICE</th>
                    <th className="py-2.5 text-right font-serif">SUM AMOUNT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-serif text-stone-800">
                  {items.map((it, i) => (
                    <tr key={i}>
                      <td className="py-3 font-semibold text-stone-903">
                        {it.productName}
                      </td>
                      <td className="py-3 text-center font-sans text-stone-500">x{it.quantity}</td>
                      <td className="py-3 text-right text-stone-600">{formatAmount(it.price)}</td>
                      <td className="py-3 text-right font-bold text-stone-900">{formatAmount(it.price * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Payments List */}
            {payments && payments.length > 0 && (
              <div className="pt-4 border-t border-stone-200">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-sans font-bold uppercase text-stone-400 tracking-widest block">Sanctuary Payment Ledger</span>
                  {balanceDue <= 0 && (
                    <span className="text-[10px] font-serif italic text-emerald-800 flex items-center gap-1.5">
                      <Leaf size={12} /> Balance Cleared
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {payments.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-start font-serif group">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 opacity-60 group-hover:opacity-100 transition-opacity">
                          {getPaymentIcon(p.method)}
                        </div>
                        <div>
                          <span className="text-xs text-stone-800 italic">Sanctuary Settlement via {p.method}</span>
                          <p className="text-[9px] font-sans text-stone-400 uppercase tracking-widest">{p.date || date}</p>
                        </div>
                      </div>
                      <strong className="text-emerald-800 text-sm">-{formatAmount(p.amount)}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calculation details */}
            <div className="flex justify-end pt-4 border-t border-stone-300 text-xs font-serif leading-loose">
              <div className="w-full max-w-xs space-y-1 text-stone-600">
                <div className="flex justify-between">
                  <span>Gross Cost:</span>
                  <span>{formatAmount(subtotal)}</span>
                </div>
                {fees.map((fee, i) => (
                  <div key={i} className="flex justify-between italic">
                    <span>{fee.label}:</span>
                    <span>{fee.isDiscount ? '-' : '+'}{formatAmount(fee.amount)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between text-stone-900 font-black uppercase text-xs border-y border-stone-300 py-2.5 mt-2 font-sans">
                  <span>ADJUSTED TOTAL SPEND:</span>
                  <span className="font-mono">{formatAmount(total)}</span>
                </div>

                {balanceDue !== undefined && (
                  <div className="flex justify-between text-stone-900 font-black uppercase text-xs pt-2 font-sans">
                    <span>REMAINING OUTSTANDING:</span>
                    <span className={balanceDue > 0 ? 'text-amber-700 font-mono' : 'text-emerald-700 font-mono'}>
                      {formatAmount(balanceDue)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Leafy simple footer */}
            <div className="flex flex-col gap-3 text-center text-[11px] font-sans text-stone-500 pt-6 border-t border-stone-200 italic">
              {globalHotelSettings.invoiceBankDetails && (
                <div className="whitespace-pre-wrap font-mono text-[9px] text-stone-400 not-italic">
                  {globalHotelSettings.invoiceBankDetails}
                </div>
              )}
              <div>
                {footerMessage || globalHotelSettings.invoiceFooterText || "🌿 Quality Hospitality Services. We appreciate your choice of stay."}
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
           TEMPLATES 4: THERMAL SLIP POS (HIGH GRAPHIC SIMULATOR)
           ========================================================================= */}
        {activeTemplate === 'thermal' && (
          <div className="mx-auto max-w-sm space-y-4 font-mono text-[10px] text-slate-800 py-4 bg-amber-50/15 p-5 border border-dashed border-amber-200 rounded-xl relative">
            {/* Center Header */}
            {balanceDue <= 0 && (
              <div className="text-center font-bold text-xs border-y-2 border-double border-slate-900 py-1 my-2">
                ======= PAID IN FULL =======
              </div>
            )}
            
            <div className="text-center space-y-1">
              <div className="font-bold text-center text-sm tracking-tighter">*** {globalHotelSettings.customHotelName} ***</div>
              <p className="text-[9px] uppercase leading-relaxed text-slate-500">
                {globalHotelSettings.customHotelAddress}<br />
                TIN: {globalHotelSettings.hotelTin} | VAT: {globalHotelSettings.hotelVatNo}<br />
                -------------------------------------
              </p>
              <div className="text-xs font-bold uppercase tracking-widest bg-slate-900 text-white py-0.5 my-1.5">{title}</div>
            </div>

            {/* Invoice parameters */}
            <div className="space-y-1 border-b border-dashed border-slate-350 pb-2">
              <div className="flex justify-between">
                <span>SLIP ID Ref:</span>
                <span className="font-bold">{invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>DOCKET TIME:</span>
                <span>{date}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENT ACC:</span>
                <span className="font-bold">{customerName.toUpperCase()}</span>
              </div>
              {customerTin && (
                <div className="flex justify-between">
                  <span>CLIENT TIN:</span>
                  <span className="font-bold">{customerTin}</span>
                </div>
              )}
              {customerVatNo && (
                <div className="flex justify-between">
                  <span>CLIENT VAT:</span>
                  <span className="font-bold">{customerVatNo}</span>
                </div>
              )}
              {roomNo && (
                <div className="flex justify-between font-bold text-indigo-700 text-[11px]">
                  <span>CHARGE TO ROOM:</span>
                  <span>ROOM {roomNo}</span>
                </div>
              )}
            </div>

            {/* Simple Dashed items */}
            <div className="space-y-2 border-b border-dashed border-slate-350 pb-2">
              <div className="flex justify-between font-bold text-[9px] text-slate-400">
                <span>PARTICULAR</span>
                <div className="flex gap-6">
                  <span>QTY</span>
                  <span>PRICE</span>
                </div>
              </div>

              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start leading-tight">
                  <span className="max-w-[180px] break-words">{item.productName.toUpperCase()}</span>
                  <div className="flex gap-6 check-sum shrink-0">
                    <span>x{item.quantity}</span>
                    <span className="font-bold">{formatAmount(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="space-y-1 border-b border-dashed border-slate-350 pb-2">
              <div className="flex justify-between">
                <span>RAW SUBTOTAL:</span>
                <span>{formatAmount(subtotal)}</span>
              </div>
              {fees.map((fee, i) => (
                <div key={i} className="flex justify-between">
                  <span>{fee.label.toUpperCase()}:</span>
                  <span>{fee.isDiscount ? '-' : '+'}{formatAmount(fee.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-xs pt-1.5 border-t border-dashed border-slate-200">
                <span>TOTAL CHARGE:</span>
                <span>{formatAmount(total)}</span>
              </div>

              {payments.map((p, idx) => (
                <div key={idx} className="flex justify-between text-emerald-600 font-bold border-l-2 border-emerald-500 pl-2">
                  <span>PAID [{p.method.toUpperCase()}]:</span>
                  <span>-{formatAmount(p.amount)}</span>
                </div>
              ))}

              {changeGiven !== undefined && changeGiven > 0 && (
                <div className="flex justify-between text-slate-700">
                  <span>CHANGE DISPATCH:</span>
                  <span>{formatAmount(changeGiven)}</span>
                </div>
              )}

              {balanceDue !== undefined && (
                <div className="flex justify-between text-xs font-bold pt-1 border-t border-double border-slate-450 mt-1">
                  <span>NET OUSTANDING:</span>
                  <span className={balanceDue > 0 ? "text-amber-700" : "text-emerald-700"}>
                    {formatAmount(balanceDue)}
                  </span>
                </div>
              )}
            </div>

            {/* Centralized QR Code box simulation */}
            <div className="flex flex-col items-center justify-center space-y-1.5 pt-2">
              <QrCode className="w-16 h-16 text-slate-650 opacity-90" />
              <p className="text-[8px] text-center text-slate-400">SIGN-OFF SCAN VALIDATION</p>
            </div>

            <div className="flex flex-col items-center gap-2 text-center text-[8px] leading-snug space-y-1 pt-2">
              <div>*** END OF VAT SLIP REF ***</div>
              {globalHotelSettings.invoiceBankDetails && (
                <div className="whitespace-pre-wrap font-mono text-[7px] text-slate-500">
                  {globalHotelSettings.invoiceBankDetails}
                </div>
              )}
              <div>{footerMessage || globalHotelSettings.invoiceFooterText || "THANK YOU FOR YOUR PATRONAGE"}</div>
              <div className="text-[7px] text-slate-400 italic mt-1 font-sans">System compiled secure log {date}</div>
            </div>

          </div>
        )}

      </div>
    </ModalSystem>
  );
}
