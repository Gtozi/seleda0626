import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell, Bed, Wrench, UtensilsCrossed, ConciergeBell, Send,
  FileText, CheckCircle2, Clock, AlertCircle, Globe, ChevronRight,
  RefreshCw, Receipt,
} from 'lucide-react';

// =====================
// Locale / i18n
// =====================
type Locale = 'en' | 'am' | 'ti';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    title: 'Guest Portal',
    subtitle: 'In-stay services & folio',
    tabRequests: 'Requests',
    tabFolio: 'My Folio',
    newRequest: 'New Request',
    requestType: 'Request Type',
    housekeeping: 'Housekeeping',
    maintenance: 'Maintenance',
    roomService: 'Room Service',
    concierge: 'Concierge',
    description: 'Description',
    descriptionPlaceholder: 'Describe your request...',
    priority: 'Priority',
    normal: 'Normal',
    urgent: 'Urgent',
    submit: 'Submit Request',
    yourRequests: 'Your Requests',
    noRequests: 'No requests yet. Submit one above.',
    statusOpen: 'Open',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    folioBalance: 'Balance',
    folioCharges: 'Total Charges',
    folioPayments: 'Payments',
    folioTax: 'Tax',
    noFolio: 'No folio available for this reservation.',
    enterReservation: 'Enter your reservation ID',
    reservationId: 'Reservation ID',
    lookup: 'View My Stay',
    lineItem: 'Item',
    amount: 'Amount',
    date: 'Date',
  },
  am: {
    title: 'የእንግዳ ፖርታል',
    subtitle: 'የመኖሪያ አገልግሎቶች እና ሂሳብ',
    tabRequests: 'ጥያቄዎች',
    tabFolio: 'የእኔ ሂሳብ',
    newRequest: 'አዲስ ጥያቄ',
    requestType: 'የጥያቄ አይነት',
    housekeeping: 'የቤት ንጽህና',
    maintenance: 'ጥገና',
    roomService: 'የክፍል አገልግሎት',
    concierge: 'ኮንሲየርጅ',
    description: 'መግለጫ',
    descriptionPlaceholder: 'ጥያቄዎን ይግለጹ...',
    priority: 'ቅድሚያ',
    normal: 'መደበኛ',
    urgent: 'አስቸኳይ',
    submit: 'ጥያቄ ያስገቡ',
    yourRequests: 'የእርስዎ ጥያቄዎች',
    noRequests: 'ጥያቄ የለም። ከላይ አንዱን ያስገቡ።',
    statusOpen: 'ክፍት',
    statusInProgress: 'በሂደት ላይ',
    statusCompleted: 'ተጠናቅቋል',
    folioBalance: 'ቀሪ ሂሳብ',
    folioCharges: 'ጠቅላላ ክፍያ',
    folioPayments: 'ክፍያዎች',
    folioTax: 'ግብር',
    noFolio: 'ለዚህ ቀጠሮ ሂሳብ የለም።',
    enterReservation: 'የቀጠሮ መለያ ያስገቡ',
    reservationId: 'የቀጠሮ መለያ',
    lookup: 'የመኖሪያዬን ይመልከቱ',
    lineItem: 'ንጥል',
    amount: 'መጠን',
    date: 'ቀን',
  },
  ti: {
    title: 'ናይ እንጉዳኽ ፖርታል',
    subtitle: 'ናይ ምስራሕ ኣገልግሎትን ሒሳብን',
    tabRequests: 'ሕቶታት',
    tabFolio: 'ሒሳበይ',
    newRequest: 'ሓዱሽ ሕቶ',
    requestType: 'ናይ ሕቶ ዓይነት',
    housekeeping: 'ናይ ቤት ጽቡቕ',
    maintenance: 'ስራሕ',
    roomService: 'ናይ ክፍሊ ኣገልግሎት',
    concierge: 'ኮንሲየርጅ',
    description: 'ግልጺ',
    descriptionPlaceholder: 'ሕቶኻ ግለጽ...',
    priority: 'ቅድምነት',
    normal: 'መደበኛ',
    urgent: 'ኣግባብ',
    submit: 'ሕቶ ኣእቱ',
    yourRequests: 'ናይኻ ሕቶታት',
    noRequests: 'ሕቶ የለን። ካብ ላዕሊ ሓዱሽ ኣእቱ።',
    statusOpen: 'ክፍት',
    statusInProgress: 'ኣብ ምስራሕ',
    statusCompleted: 'ተወዲኡ',
    folioBalance: 'ዝቀረ ሒሳብ',
    folioCharges: 'ምሉእ ክፍያ',
    folioPayments: 'ክፍያታት',
    folioTax: 'ግብሪ',
    noFolio: 'ንዚ ምድላው ሒሳብ የለን።',
    enterReservation: 'ናይ ምድላው መለያ ኣእቱ',
    reservationId: 'ናይ ምድላው መለያ',
    lookup: 'ምስራሐይ ርአ',
    lineItem: 'እታ',
    amount: 'መጠን',
    date: 'ዕለት',
  },
};

const useLocale = () => {
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem('guest_locale') as Locale) || 'en');
  const t = (key: string) => translations[locale][key] || translations.en[key] || key;
  const changeLocale = (l: Locale) => { setLocale(l); localStorage.setItem('guest_locale', l); };
  return { locale, t, changeLocale };
};

// =====================
// Types
// =====================
interface GuestRequest {
  id: string;
  request_number: string | null;
  request_type: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_department: string | null;
  submitted_at: string;
  completed_at: string | null;
}

interface FolioLine {
  id: string;
  line_number: number;
  transaction_date: string;
  description: string;
  amount: number;
  quantity: number;
  unit_price: number;
  line_type: string;
  source_module: string | null;
}

interface Folio {
  id: string;
  status: string;
  balance: number;
  total_charges: number;
  total_payments: number;
  tax_total: number;
  service_charge_total: number;
  currency: string;
  opened_at: string;
  lines: FolioLine[];
}

const fmt = (n: number, currency: string = 'USD') => `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const REQUEST_TYPES = [
  { value: 'Housekeeping', icon: Bed, color: 'text-emerald-600 bg-emerald-50' },
  { value: 'Maintenance', icon: Wrench, color: 'text-amber-600 bg-amber-50' },
  { value: 'Room Service', icon: UtensilsCrossed, color: 'text-indigo-600 bg-indigo-50' },
  { value: 'Concierge', icon: ConciergeBell, color: 'text-rose-600 bg-rose-50' },
];

const STATUS_STYLES: Record<string, string> = {
  Open: 'bg-amber-50 text-amber-600',
  'In Progress': 'bg-indigo-50 text-indigo-600',
  Completed: 'bg-emerald-50 text-emerald-600',
};

// =====================
// Component
// =====================
const GuestMobilePortal: React.FC = () => {
  const { locale, t, changeLocale } = useLocale();
  const [reservationId, setReservationId] = useState('');
  const [activeReservation, setActiveReservation] = useState('');
  const [tab, setTab] = useState<'requests' | 'folio'>('requests');
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [folios, setFolios] = useState<Folio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ requestType: 'Housekeeping', description: '', priority: 'Normal' });

  const loadData = useCallback(async (resId: string) => {
    setLoading(true); setError(null);
    try {
      const [reqRes, folioRes] = await Promise.all([
        fetch(`/api/public/guest-requests/${resId}`).then(r => r.json()),
        fetch(`/api/public/guest-folio/${resId}`).then(r => r.json()),
      ]);
      setRequests(reqRes.requests || []);
      setFolios(folioRes.folios || []);
    } catch (err: any) { setError(err.message || 'Failed to load data'); }
    finally { setLoading(false); }
  }, []);

  const handleLookup = () => {
    if (!reservationId.trim()) return;
    setActiveReservation(reservationId.trim());
    loadData(reservationId.trim());
  };

  const handleSubmitRequest = async () => {
    if (!activeReservation || !form.requestType) return;
    setSubmitting(true); setError(null);
    try {
      await fetch('/api/public/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservationId: activeReservation, requestType: form.requestType, description: form.description, priority: form.priority }),
      });
      setShowForm(false);
      setForm({ requestType: 'Housekeeping', description: '', priority: 'Normal' });
      loadData(activeReservation);
    } catch (err: any) { setError(err.message || 'Failed to submit request'); }
    finally { setSubmitting(false); }
  };

  const totalBalance = folios.reduce((s, f) => s + Number(f.balance || 0), 0);
  const totalCharges = folios.reduce((s, f) => s + Number(f.total_charges || 0), 0);
  const totalPayments = folios.reduce((s, f) => s + Number(f.total_payments || 0), 0);
  const totalTax = folios.reduce((s, f) => s + Number(f.tax_total || 0), 0);

  // Reservation lookup screen
  if (!activeReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-6">
            <LocaleSwitcher locale={locale} onChange={changeLocale} />
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="text-center mb-8">
              <div className="inline-flex p-4 rounded-3xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 mb-4">
                <ConciergeBell size={32} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white">{t('title')}</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">{t('subtitle')}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">{t('reservationId')}</label>
                <input
                  value={reservationId}
                  onChange={e => setReservationId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={t('enterReservation')}
                />
              </div>
              <button
                onClick={handleLookup}
                disabled={!reservationId.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition shadow-md shadow-indigo-200"
              >
                {t('lookup')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-900 dark:text-white">{t('title')}</h1>
            <p className="text-[10px] text-slate-400 font-mono">Reservation: {activeReservation}</p>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} onChange={changeLocale} />
            <button onClick={() => { setActiveReservation(''); setReservationId(''); }} className="text-[10px] font-black text-slate-400 hover:text-rose-600 uppercase tracking-widest">Exit</button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-4 flex gap-1">
          <button onClick={() => setTab('requests')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition ${tab === 'requests' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
            <Bell size={14} className="inline mr-1" /> {t('tabRequests')}
          </button>
          <button onClick={() => setTab('folio')} className={`flex-1 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition ${tab === 'folio' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}>
            <Receipt size={14} className="inline mr-1" /> {t('tabFolio')}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">
        {error && <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 rounded-2xl"><p className="text-xs font-bold text-rose-600">{error}</p></div>}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <>
            {/* New Request Button */}
            {!showForm && (
              <button onClick={() => setShowForm(true)} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-2xl text-xs uppercase tracking-widest transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
                <Send size={14} /> {t('newRequest')}
              </button>
            )}

            {/* Request Form */}
            {showForm && (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">{t('requestType')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {REQUEST_TYPES.map(rt => {
                      const Icon = rt.icon;
                      return (
                        <button
                          key={rt.value}
                          onClick={() => setForm({ ...form, requestType: rt.value })}
                          className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition ${form.requestType === rt.value ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100 dark:border-slate-800'}`}
                        >
                          <div className={`p-2 rounded-xl ${rt.color}`}><Icon size={16} /></div>
                          <span className="text-xs font-black text-slate-700 dark:text-slate-300">{t(rt.value.toLowerCase().replace(/\s/g, ''))}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">{t('description')}</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder={t('descriptionPlaceholder')} />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 block mb-2">{t('priority')}</label>
                  <div className="flex gap-2">
                    {['Normal', 'Urgent'].map(p => (
                      <button key={p} onClick={() => setForm({ ...form, priority: p })} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition ${form.priority === p ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-slate-100 dark:border-slate-800 text-slate-400'}`}>
                        {t(p.toLowerCase())}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancel</button>
                  <button onClick={handleSubmitRequest} disabled={submitting} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">{t('submit')}</button>
                </div>
              </div>
            )}

            {/* Request List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('yourRequests')}</h3>
                <button onClick={() => loadData(activeReservation)} className="p-1.5 text-slate-400 hover:text-indigo-600 transition"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /></button>
              </div>
              {requests.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs font-bold">{t('noRequests')}</div>
              ) : (
                <div className="space-y-2">
                  {requests.map(req => {
                    const rt = REQUEST_TYPES.find(r => r.value === req.request_type) || REQUEST_TYPES[0];
                    const Icon = rt.icon;
                    return (
                      <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-xl ${rt.color}`}><Icon size={14} /></div>
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">{req.request_type}</p>
                              <p className="text-[9px] font-mono text-slate-400">{req.request_number || req.id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${STATUS_STYLES[req.status] || STATUS_STYLES['Open']}`}>
                            {t(`status${req.status.replace(/\s/g, '')}`)}
                          </span>
                        </div>
                        {req.description && <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">{req.description}</p>}
                        <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400">
                          <span className="flex items-center gap-1"><Clock size={9} /> {new Date(req.submitted_at).toLocaleString()}</span>
                          {req.priority === 'Urgent' && <span className="flex items-center gap-1 text-rose-600"><AlertCircle size={9} /> Urgent</span>}
                          {req.assigned_department && <span className="flex items-center gap-1"><ChevronRight size={9} /> {req.assigned_department}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Folio Tab */}
        {tab === 'folio' && (
          <>
            {folios.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs font-bold">{t('noFolio')}</div>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('folioCharges')}</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{fmt(totalCharges)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('folioPayments')}</p>
                    <p className="text-lg font-black text-emerald-600">{fmt(totalPayments)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('folioTax')}</p>
                    <p className="text-lg font-black text-amber-600">{fmt(totalTax)}</p>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t('folioBalance')}</p>
                    <p className={`text-lg font-black ${totalBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{fmt(totalBalance)}</p>
                  </div>
                </div>

                {/* Folio Details */}
                {folios.map(folio => (
                  <div key={folio.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500" />
                        <span className="text-xs font-black text-slate-900 dark:text-white">Folio #{folio.id.slice(0, 8)}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${folio.status === 'Open' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500'}`}>{folio.status}</span>
                    </div>
                    {folio.lines.length > 0 ? (
                      <div className="divide-y divide-slate-50 dark:divide-slate-800">
                        {folio.lines.map(line => (
                          <div key={line.id} className="p-3 flex items-start justify-between">
                            <div>
                              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{line.description}</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">
                                {line.transaction_date} · {line.line_type}
                                {line.source_module && ` · ${line.source_module}`}
                              </p>
                            </div>
                            <span className="text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">{fmt(Number(line.amount), folio.currency || 'USD')}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-[10px] font-bold text-slate-400">No charges posted.</div>
                    )}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance</span>
                      <span className={`text-sm font-black ${Number(folio.balance) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{fmt(Number(folio.balance), folio.currency || 'USD')}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// =====================
// Locale Switcher Component
// =====================
const LocaleSwitcher: React.FC<{ locale: Locale; onChange: (l: Locale) => void }> = ({ locale, onChange }) => {
  const [open, setOpen] = useState(false);
  const locales: { code: Locale; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'am', label: 'አማርኛ', flag: 'AM' },
    { code: 'ti', label: 'ትግርኛ', flag: 'TI' },
  ];
  const current = locales.find(l => l.code === locale) || locales[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
      >
        <Globe size={14} />
        <span>{current.flag}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg py-1 z-20 min-w-[120px]">
          {locales.map(l => (
            <button
              key={l.code}
              onClick={() => { onChange(l.code); setOpen(false); }}
              className={`w-full px-3 py-2 text-left text-xs font-bold transition flex items-center gap-2 ${locale === l.code ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              <span className="font-mono text-[9px] w-6">{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GuestMobilePortal;
