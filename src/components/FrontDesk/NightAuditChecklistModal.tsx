import React, { useState } from 'react';
import { Moon, AlertTriangle, CheckCircle2, X, ChevronRight, ChevronLeft, Loader2, Printer } from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExecute: (notes?: string) => { success: boolean; date: string; message: string; revenuePosted: number; roomsSold: number; arrivals: number; departures: number; foliosPosted: number; exceptions: any[] } | null;
  rooms: any[];
  reservations: any[];
  currentSystemDate: string;
  formatAmount: (val: number) => string;
  onLogExceptions?: (items: Array<{ id: number; text: string; owner: string }>) => void;
  onResolveFolio?: (reservationId: string) => void;
  onResolveRoomStatus?: (roomNumber: string) => void;
}

const checklistItems = [
  { id: 1, title: 'Pre-Close Checks', desc: 'Review arrivals, departures, in-house list, room status alignment, no-shows.' },
  { id: 2, title: 'Post Room Charges', desc: 'Ensure room charges, taxes, and packages are posted for all checked-in stays.' },
  { id: 3, title: 'Validate Folios', desc: 'Review high-balance folios, rate overrides, discounts, and approval codes.' },
  { id: 4, title: 'Reconcile Payments', desc: 'Confirm cash totals, card batches, paid-outs, and house account balances.' },
  { id: 5, title: 'Document Exceptions', desc: 'Log discrepancies with owners and next actions before rollover.' },
];

export function NightAuditChecklistModal({
  isOpen,
  onClose,
  onExecute,
  rooms,
  reservations,
  currentSystemDate,
  formatAmount,
  onLogExceptions,
  onResolveFolio,
  onResolveRoomStatus
}: Props) {
  const [step, setStep] = useState(0); // 0=list, 1=executing, 2=handover
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [exceptions, setExceptions] = useState<Array<{ id: number; text: string; owner: string }>>([]);
  const [excText, setExcText] = useState('');
  const [excOwner, setExcOwner] = useState('Front Office Manager');
  const [result, setResult] = useState<any>(null);
  const [highBalanceAck, setHighBalanceAck] = useState(false);
  const [auditNotes, setAuditNotes] = useState('');

  if (!isOpen) return null;

  const todayArr = reservations.filter(r => r.checkInDate === currentSystemDate);
  const arrPending = todayArr.filter(r => r.status === 'Confirmed').length;
  const todayDep = reservations.filter(r => r.checkOutDate === currentSystemDate);
  const depPending = todayDep.filter(r => r.status === 'CheckedIn').length;
  const inHouse = reservations.filter(r => r.status === 'CheckedIn');
  const discrepancies = rooms.filter(r => {
    const hasRes = reservations.some(res => res.roomNumber === r.number && res.status === 'CheckedIn');
    return (hasRes && !r.status.includes('Occupied')) || (!hasRes && r.status.includes('Occupied'));
  });
  const highBalance = reservations.filter(r => {
    const chg = (r.charges || []).reduce((s: number, c: any) => s + (c.isVoided ? 0 : c.amount), 0);
    const pay = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
    return r.status === 'CheckedIn' && (chg - pay) > 500;
  });
  const todayAdj = reservations.flatMap(r => [
    ...(r.charges || []).filter((c: any) => c.date === currentSystemDate && (c.isVoided || c.type === 'Discount')),
    ...(r.payments || []).filter((p: any) => p.date === currentSystemDate && p.isVoided),
  ]);

  const toggle = (id: number) => {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const addExc = () => {
    if (!excText.trim()) return;
    const updated = [...exceptions, { id: Date.now(), text: excText, owner: excOwner }];
    setExceptions(updated);
    onLogExceptions?.(updated);
    setExcText('');
  };

  const execute = async () => {
    setStep(1);
    await new Promise(r => setTimeout(r, 900));
    const res = onExecute(auditNotes);
    setResult(res);
    setStep(2);
    if (exceptions.length > 0) {
      onLogExceptions?.(exceptions);
    }
  };

  const hasHighBalance = highBalance.length > 0;
  const allDone = checklistItems.every(i => completed.has(i.id)) && (!hasHighBalance || highBalanceAck);

  const reset = () => {
    setStep(0); setCompleted(new Set()); setExceptions([]); setExcText(''); setResult(null); setHighBalanceAck(false); setAuditNotes(''); onClose();
  };

  if (step === 1) {
    return (
      <ModalSystem
        isOpen={true}
        onClose={() => {}}
        title="Executing Night Audit..."
        variant="async"
        size="sm"
        showFooter={false}
      >
          <Loader2 size={32} className="animate-spin text-indigo-500 mx-auto" />
          <p className="text-4xs text-slate-400 font-mono text-center">Posting charges • Reconciling ledgers • Rolling business date</p>
      </ModalSystem>
    );
  }

  if (step === 2 && result) {
    return (
      <ModalSystem
        isOpen={true}
        onClose={reset}
        title="Night Audit Complete"
        icon={<CheckCircle2 size={20} className="text-emerald-500" />}
        variant="info"
        size="md"
        showFooter={false}
      >
          <div className="p-3 bg-emerald-50/30 border border-emerald-200 dark:border-emerald-900/40 rounded-xl space-y-1 text-3xs font-mono print-area">
            <p><strong>Previous Date:</strong> {result.date}</p>
            <p><strong>New Date:</strong> {result.newDate || result.date}</p>
            <p><strong>Revenue Posted:</strong> {formatAmount(result.revenuePosted || 0)}</p>
            <p><strong>Rooms Sold:</strong> {result.roomsSold || 0}</p>
            <p><strong>Arrivals:</strong> {result.arrivals || 0}</p>
            <p><strong>Departures:</strong> {result.departures || 0}</p>
            <p><strong>Folios Posted to GL:</strong> {result.foliosPosted || 0}</p>
            <p><strong>Status:</strong> <span className="text-emerald-600 font-bold">{result.success ? 'Success' : 'Partial'}</span></p>
            <p><strong>Message:</strong> {result.message}</p>
          </div>
          {result.exceptions && result.exceptions.length > 0 && (
            <div className="space-y-1 print-area">
              <span className="text-4xs uppercase font-bold text-amber-600 tracking-widest">GL Posting Exceptions</span>
              <div className="border border-amber-200 rounded-xl overflow-hidden">
                <table className="w-full text-3xs text-left border-collapse">
                  <thead><tr className="bg-amber-50 uppercase text-[9px] text-amber-700 border-b border-amber-200"><th className="py-2 px-3">Folio ID</th><th className="py-2 px-3">Error</th></tr></thead>
                  <tbody className="divide-y divide-amber-100 bg-white">
                    {result.exceptions.map((e: any, i: number) => <tr key={i} className="hover:bg-amber-50/50"><td className="py-2 px-3 font-mono text-slate-400">{e.folioId}</td><td className="py-2 px-3 text-rose-600">{e.error}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {exceptions.length > 0 && (
            <div className="space-y-1 print-area">
              <span className="text-4xs uppercase font-bold text-slate-400 tracking-widest">Documented Exceptions</span>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-3xs text-left border-collapse">
                  <thead><tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200"><th className="py-2 px-3">#</th><th className="py-2 px-3">Issue</th><th className="py-2 px-3 text-right">Owner</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {exceptions.map((e, i) => <tr key={e.id} className="hover:bg-slate-50/50"><td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td><td className="py-2 px-3 text-slate-700 dark:text-slate-300">{e.text}</td><td className="py-2 px-3 text-right"><span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-4xs font-bold">{e.owner}</span></td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2 no-print">
            <button onClick={reset} className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-500 text-3xs font-black rounded-xl border border-transparent hover:bg-slate-100 transition">Close</button>
            <button onClick={() => window.print()} className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-3xs font-black rounded-xl transition flex items-center justify-center gap-1"><Printer size={11} /> Print Handover</button>
          </div>
      </ModalSystem>
    );
  }

  return (
    <ModalSystem
      isOpen={true}
      onClose={reset}
      title="Night Audit Checklist"
      subtitle={`Operating Date: ${currentSystemDate}`}
      icon={<Moon size={20} className="text-indigo-600" />}
      variant="form"
      size="xl"
      showFooter={false}
    >
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Step cards */}
          {checklistItems.map(item => {
            const done = completed.has(item.id);
            const issues: string[] = [];
            if (item.id === 1) { if (arrPending > 0) issues.push(`${arrPending} arrivals pending`); if (depPending > 0) issues.push(`${depPending} departures pending`); if (discrepancies.length > 0) issues.push(`${discrepancies.length} room discrepancies`); }
            if (item.id === 2) { if (inHouse.length > 0) issues.push(`${inHouse.length} rooms to charge`); }
            if (item.id === 3) { if (highBalance.length > 0) issues.push(`${highBalance.length} high-balance folios`); if (todayAdj.length > 0) issues.push(`${todayAdj.length} adjustments today`); }
            if (item.id === 4) { const cash = reservations.reduce((sum, r) => sum + (r.payments || []).filter((p: any) => !p.isVoided && p.method === 'Cash').reduce((s: number, p: any) => s + p.amount, 0), 0); issues.push(`Cash on hand: ${formatAmount(cash)}`); }

            return (
              <div key={item.id} className={`p-4 border rounded-xl transition ${done ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10' : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30'}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggle(item.id)} className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'}`}>
                    {done && <CheckCircle2 size={12} />}
                  </button>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-center">
                      <h4 className={`font-sans font-bold text-sm ${done ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{item.id}. {item.title}</h4>
                      {done && <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-4xs font-bold uppercase">Complete</span>}
                    </div>
                    <p className="text-3xs text-slate-500 leading-relaxed">{item.desc}</p>
                    {issues.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {issues.map((iss, i) => (
                          <span key={i} className={`px-1.5 py-0.5 rounded text-4xs font-mono font-bold border ${
                            iss.includes('pending') || iss.includes('discrepancies') || iss.includes('high-balance') ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                          }`}>
                            {iss}
                            {item.id === 1 && iss.includes('discrepancies') && (
                              <button
                                onClick={() => onResolveRoomStatus?.(discrepancies[0]?.number)}
                                className="ml-1 px-1 py-0.5 bg-amber-50 text-amber-700 rounded border border-amber-200"
                              >
                                Resolve
                              </button>
                            )}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* High Balance Folio Alert */}
          {hasHighBalance && (
            <div className="p-4 border border-rose-200 dark:border-rose-900/40 bg-rose-50/20 dark:bg-rose-950/10 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-rose-500" />
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">High-Balance Folio Validation</h4>
                <span className="ml-auto px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-4xs font-bold">{highBalance.length} flagged</span>
              </div>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-3xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200">
                      <th className="py-2 px-3">Room</th>
                      <th className="py-2 px-3">Guest</th>
                      <th className="py-2 px-2 text-center">Charges</th>
                      <th className="py-2 px-2 text-center">Payments</th>
                      <th className="py-2 px-3 text-right text-rose-500">Balance</th>
                      <th className="py-2 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {highBalance.map((r: any) => {
                      const chg = (r.charges || []).reduce((s: number, c: any) => s + (c.isVoided ? 0 : c.amount), 0);
                      const pay = (r.payments || []).reduce((s: number, p: any) => s + (p.isVoided ? 0 : p.amount), 0);
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">{r.roomNumber || '-'}</td>
                          <td className="py-2 px-3 font-sans font-bold">{r.guestName}</td>
                          <td className="py-2 px-2 text-center font-mono">{formatAmount(chg)}</td>
                          <td className="py-2 px-2 text-center font-mono">{formatAmount(pay)}</td>
                          <td className="py-2 px-3 text-right font-mono font-black text-rose-500">{formatAmount(chg - pay)}</td>
                          <td className="py-2 px-2 text-right">
                            <button
                              onClick={() => onResolveFolio?.(r.id)}
                              className="px-2 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded text-4xs font-bold border border-indigo-100 dark:border-indigo-900 hover:bg-indigo-100"
                            >
                              Open Folio
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={highBalanceAck} onChange={e => setHighBalanceAck(e.target.checked)} className="mt-0.5 w-4 h-4 rounded border-rose-300 text-rose-500 focus:ring-rose-500" />
                <span className="text-3xs text-slate-600 dark:text-slate-300 leading-normal">
                  I have reviewed the high-balance folios above. These balances are either authorized for extension, under corporate direct-billing agreement, or have been manually validated by a duty manager. Proceeding with night audit rollover is approved.
                </span>
              </label>
            </div>
          )}

          {/* Audit Notes */}
          <div className="p-4 border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/30 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-indigo-500" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Night Audit Notes</h4>
            </div>
            <textarea
              value={auditNotes}
              onChange={(e) => setAuditNotes(e.target.value)}
              placeholder="Add any notes about this night audit (e.g., system issues, special events, staffing notes)..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
          </div>

          {/* Exception log */}
          <div className="p-4 border border-amber-100 dark:border-amber-900/30 bg-amber-50/10 dark:bg-amber-950/10 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <h4 className="font-bold text-xs text-slate-900 dark:text-white">Exception Log</h4>
            </div>
            <div className="flex gap-2">
              <input value={excText} onChange={e => setExcText(e.target.value)} placeholder="Describe discrepancy..." className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-3xs outline-none focus:border-indigo-500" />
              <select value={excOwner} onChange={e => setExcOwner(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-3xs font-mono outline-none">
                <option>Front Office Manager</option><option>Night Auditor</option><option>Housekeeping Supervisor</option><option>Finance</option>
              </select>
              <button onClick={addExc} className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-3xs font-black rounded-xl transition">Log</button>
            </div>
            {exceptions.length > 0 && (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-3xs text-left border-collapse">
                  <thead><tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-200"><th className="py-2 px-3">#</th><th className="py-2 px-3">Description</th><th className="py-2 px-3 text-right">Owner</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                    {exceptions.map((e, i) => <tr key={e.id} className="hover:bg-slate-50/50"><td className="py-2 px-3 font-mono text-slate-400">{i + 1}</td><td className="py-2 px-3 text-slate-700 dark:text-slate-300">{e.text}</td><td className="py-2 px-3 text-right"><span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded text-4xs font-bold">{e.owner}</span></td></tr>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <div className="text-3xs text-slate-400 font-mono">
              {allDone ? <span className="text-emerald-500 font-bold">All checks complete — ready to roll</span> : (
                hasHighBalance && !highBalanceAck && checklistItems.every(i => completed.has(i.id))
                  ? <span className="text-rose-500 font-bold">High-balance folios require acknowledgment</span>
                  : <span>{checklistItems.length - completed.size} steps remaining</span>
              )}
            </div>
            <div className="flex gap-2">
              <button onClick={reset} className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 text-slate-500 text-3xs font-black rounded-xl border border-transparent hover:bg-slate-100 transition">Discard</button>
              <button onClick={execute} disabled={!allDone} className={`px-5 py-2.5 text-3xs font-black rounded-xl transition flex items-center gap-1.5 ${allDone ? 'bg-indigo-500 text-slate-950 hover:bg-indigo-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                <Moon size={12} fill="currentColor" /> Execute Night Audit Roll
              </button>
            </div>
          </div>
        </div>
    </ModalSystem>
  );
}
