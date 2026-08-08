import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, RefreshCw, ChevronDown, ChevronUp,
  CalendarDays, FileText, CheckCircle2, AlertCircle,
  Package, ClipboardList, DollarSign, Percent, Edit2, Save, X
} from 'lucide-react';
import { DataTable, Column } from '../Shared/DataTable';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TourOperator {
  id: string;
  code: string;
  name: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  payment_terms: string;
  commission_model: 'net' | 'commissionable';
  credit_limit: number;
  is_active: boolean;
}

interface Allotment {
  id: string;
  operator_id: string;
  room_type_id: string;
  stay_date: string;
  blocked_qty: number;
  picked_up_qty: number;
  release_date: string;
  is_released: boolean;
  tour_operators?: { name: string };
  room_types?: { name: string };
}

interface Contract {
  id: string;
  operator_id: string;
  room_type_id: string;
  board_basis: string;
  rate_model: 'net' | 'commissionable';
  net_rate?: number;
  sell_rate?: number;
  commission_pct: number;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
  tour_operators?: { name: string };
  room_types?: { name: string };
}

interface Voucher {
  id: string;
  voucher_no: string;
  operator_id: string;
  valid_from: string;
  valid_to: string;
  nights?: number;
  board_basis: string;
  pax_count: number;
  net_value?: number;
  status: 'issued' | 'redeemed' | 'void' | 'expired';
  tour_operators?: { name: string };
  room_types?: { name: string };
}

type Tab = 'operators' | 'allotments' | 'contracts' | 'vouchers';

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Operator Form ────────────────────────────────────────────────────────────

const emptyOperator = (): Omit<TourOperator, 'id'> => ({
  code: '', name: '', contact_name: '', contact_email: '', contact_phone: '',
  payment_terms: 'Net 30', commission_model: 'net', credit_limit: 0, is_active: true,
});

// ─── Main Component ───────────────────────────────────────────────────────────

const B2BOperatorPortal: React.FC = () => {
  const [tab, setTab] = useState<Tab>('operators');

  // Data state
  const [operators, setOperators] = useState<TourOperator[]>([]);
  const [allotments, setAllotments] = useState<Allotment[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(false);

  // Operator form
  const [showOpForm, setShowOpForm] = useState(false);
  const [opForm, setOpForm] = useState(emptyOperator());
  const [editOpId, setEditOpId] = useState<string | null>(null);
  const [savingOp, setSavingOp] = useState(false);

  // Allotment form
  const [showAlForm, setShowAlForm] = useState(false);
  const [alForm, setAlForm] = useState({ operator_id: '', room_type_id: '', stay_date: '', blocked_qty: 1, release_date: '', release_mode: 'auto' });
  const [savingAl, setSavingAl] = useState(false);

  // Room types list
  const [roomTypes, setRoomTypes] = useState<{ id: string; name: string }[]>([]);

  // ── Fetch helpers ─────────────────────────────────────────────

  const fetchOperators = useCallback(async () => {
    const r = await fetch('/api/b2b/operators', { credentials: 'include' });
    if (r.ok) setOperators(await r.json());
  }, []);

  const fetchAllotments = useCallback(async () => {
    const r = await fetch('/api/b2b/allotments', { credentials: 'include' });
    if (r.ok) setAllotments(await r.json());
  }, []);

  const fetchContracts = useCallback(async () => {
    const r = await fetch('/api/b2b/contracts', { credentials: 'include' });
    if (r.ok) setContracts(await r.json());
  }, []);

  const fetchVouchers = useCallback(async () => {
    const r = await fetch('/api/b2b/vouchers', { credentials: 'include' });
    if (r.ok) setVouchers(await r.json());
  }, []);

  const fetchRoomTypes = useCallback(async () => {
    const r = await fetch('/api/room-types', { credentials: 'include' });
    if (r.ok) setRoomTypes(await r.json());
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOperators(), fetchAllotments(), fetchContracts(), fetchVouchers(), fetchRoomTypes()]);
    setLoading(false);
  }, [fetchOperators, fetchAllotments, fetchContracts, fetchVouchers, fetchRoomTypes]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Operator CRUD ──────────────────────────────────────────────

  const startEditOp = (op: TourOperator) => {
    setEditOpId(op.id);
    setOpForm({ code: op.code, name: op.name, contact_name: op.contact_name || '', contact_email: op.contact_email || '', contact_phone: op.contact_phone || '', payment_terms: op.payment_terms, commission_model: op.commission_model, credit_limit: op.credit_limit, is_active: op.is_active });
    setShowOpForm(true);
  };

  const saveOperator = async () => {
    setSavingOp(true);
    const url = editOpId ? `/api/b2b/operators/${editOpId}` : '/api/b2b/operators';
    const method = editOpId ? 'PUT' : 'POST';
    await fetch(url, { method, credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(opForm) });
    await fetchOperators();
    setShowOpForm(false);
    setEditOpId(null);
    setOpForm(emptyOperator());
    setSavingOp(false);
  };

  // ── Allotment CRUD ─────────────────────────────────────────────

  const saveAllotment = async () => {
    setSavingAl(true);
    await fetch('/api/b2b/allotments', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(alForm) });
    await fetchAllotments();
    setShowAlForm(false);
    setAlForm({ operator_id: '', room_type_id: '', stay_date: '', blocked_qty: 1, release_date: '', release_mode: 'auto' });
    setSavingAl(false);
  };

  const releaseExpired = async () => {
    await fetch('/api/b2b/allotments/release-expired', { method: 'POST', credentials: 'include' });
    await fetchAllotments();
  };

  // ── Voucher redeem ─────────────────────────────────────────────

  const [redeemNo, setRedeemNo] = useState('');
  const [redeemResId, setRedeemResId] = useState('');
  const [redeemMsg, setRedeemMsg] = useState('');

  const redeemVoucher = async () => {
    setRedeemMsg('');
    const r = await fetch('/api/b2b/vouchers/redeem', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voucher_no: redeemNo, reservation_id: redeemResId }),
    });
    const d = await r.json();
    if (r.ok) { setRedeemMsg('✓ Voucher redeemed successfully'); await fetchVouchers(); }
    else setRedeemMsg(`✗ ${d.error}`);
  };

  // ── Tab navigation ─────────────────────────────────────────────

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'operators',  label: 'Tour Operators',  icon: <Building2 size={14}/> },
    { key: 'allotments', label: 'Allotments',       icon: <CalendarDays size={14}/> },
    { key: 'contracts',  label: 'Rate Contracts',   icon: <DollarSign size={14}/> },
    { key: 'vouchers',   label: 'Vouchers',          icon: <ClipboardList size={14}/> },
  ];

  const today = new Date().toISOString().slice(0, 10);

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">B2B Operator Management</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Tour Operators · Allotments · Rate Contracts · Vouchers</p>
        </div>
        <button onClick={loadAll} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-400 hover:text-indigo-600 transition">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition ${
              tab === t.key ? 'bg-indigo-600 text-white' : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-indigo-600'
            }`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ── OPERATORS ── */}
      {tab === 'operators' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{operators.length} Operators</span>
            <button onClick={() => { setEditOpId(null); setOpForm(emptyOperator()); setShowOpForm(v => !v); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition">
              <Plus size={12}/> New Operator
            </button>
          </div>

          {showOpForm && (
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 grid grid-cols-2 md:grid-cols-3 gap-3">
              {[['code','Code *'],['name','Name *'],['contact_name','Contact Name'],['contact_email','Email'],['contact_phone','Phone']].map(([k,label]) => (
                <div key={k}>
                  <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">{label}</label>
                  <input value={(opForm as any)[k]} onChange={e => setOpForm(p => ({ ...p, [k]: e.target.value }))}
                    className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold focus:ring-2 focus:ring-indigo-500" />
                </div>
              ))}
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Payment Terms</label>
                <select value={opForm.payment_terms} onChange={e => setOpForm(p => ({ ...p, payment_terms: e.target.value }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold">
                  {['Net 30','Net 60','Net 90','Prepaid'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Rate Model</label>
                <select value={opForm.commission_model} onChange={e => setOpForm(p => ({ ...p, commission_model: e.target.value as any }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold">
                  <option value="net">Net Rate</option>
                  <option value="commissionable">Commissionable</option>
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Credit Limit (ETB)</label>
                <input type="number" value={opForm.credit_limit} onChange={e => setOpForm(p => ({ ...p, credit_limit: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold" />
              </div>
              <div className="col-span-full flex gap-2 justify-end">
                <button onClick={() => setShowOpForm(false)} className="p-2 text-slate-400 hover:text-slate-700"><X size={14}/></button>
                <button onClick={saveOperator} disabled={savingOp || !opForm.code || !opForm.name}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase rounded-lg disabled:opacity-50 transition">
                  <Save size={12}/>{savingOp ? 'Saving…' : editOpId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          )}

          <DataTable
            columns={[
              { key: 'code', label: 'Code', render: (op: TourOperator) => <span className="text-[10px] font-black text-indigo-600 font-mono">{op.code}</span> },
              { key: 'name', label: 'Name', render: (op: TourOperator) => <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{op.name}</span> },
              { key: 'contact_email', label: 'Contact', render: (op: TourOperator) => <span className="text-[10px] text-slate-500">{op.contact_email || '—'}</span> },
              { key: 'commission_model', label: 'Model', render: (op: TourOperator) => <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${op.commission_model === 'net' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{op.commission_model}</span> },
              { key: 'credit_limit', label: 'Credit Limit', render: (op: TourOperator) => <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">ETB {fmt(op.credit_limit)}</span> },
              { key: 'payment_terms', label: 'Terms', render: (op: TourOperator) => <span className="text-[10px] text-slate-500">{op.payment_terms}</span> },
              { key: 'is_active', label: 'Status', render: (op: TourOperator) => <span className={`text-[9px] font-black ${op.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>{op.is_active ? 'Active' : 'Inactive'}</span> },
              { key: 'actions', label: '', sortable: false, render: (op: TourOperator) => <button onClick={() => startEditOp(op)} className="p-1 text-slate-400 hover:text-indigo-600 transition"><Edit2 size={12}/></button> },
            ] as Column<TourOperator>[]}
            data={operators}
            rowKey={(op) => op.id}
            sortable
            filterable
            filterPlaceholder="Search operators..."
            filterKeys={['code', 'name', 'contact_email', 'commission_model', 'payment_terms']}
            containerClassName="rounded-[32px]"
            emptyMessage="No operators registered yet"
          />
        </div>
      )}

      {/* ── ALLOTMENTS ── */}
      {tab === 'allotments' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{allotments.length} Allotment Blocks</span>
            <div className="flex gap-2">
              <button onClick={releaseExpired} className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest rounded-lg transition">
                <RefreshCw size={11}/> Release Expired
              </button>
              <button onClick={() => setShowAlForm(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase rounded-lg transition">
                <Plus size={12}/> Block Allotment
              </button>
            </div>
          </div>

          {showAlForm && (
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/30 grid grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Operator *</label>
                <select value={alForm.operator_id} onChange={e => setAlForm(p => ({ ...p, operator_id: e.target.value }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold">
                  <option value="">— Select —</option>
                  {operators.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Room Type *</label>
                <select value={alForm.room_type_id} onChange={e => setAlForm(p => ({ ...p, room_type_id: e.target.value }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold">
                  <option value="">— Select —</option>
                  {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Stay Date *</label>
                <input type="date" value={alForm.stay_date} min={today} onChange={e => setAlForm(p => ({ ...p, stay_date: e.target.value }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Blocked Qty *</label>
                <input type="number" min={1} value={alForm.blocked_qty} onChange={e => setAlForm(p => ({ ...p, blocked_qty: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Cut-off (Release) Date *</label>
                <input type="date" value={alForm.release_date} onChange={e => setAlForm(p => ({ ...p, release_date: e.target.value }))}
                  className="mt-1 w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold" />
              </div>
              <div className="col-span-full flex justify-end gap-2">
                <button onClick={() => setShowAlForm(false)} className="p-2 text-slate-400 hover:text-slate-700"><X size={14}/></button>
                <button onClick={saveAllotment} disabled={savingAl || !alForm.operator_id || !alForm.room_type_id || !alForm.stay_date || !alForm.release_date}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 text-white text-[9px] font-black uppercase rounded-lg disabled:opacity-50 transition">
                  <Save size={12}/>{savingAl ? 'Saving…' : 'Create Block'}
                </button>
              </div>
            </div>
          )}

          <DataTable
            columns={[
              { key: 'operator', label: 'Operator', render: (a: Allotment) => <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{a.tour_operators?.name || '—'}</span> },
              { key: 'room_type', label: 'Room Type', render: (a: Allotment) => <span className="text-[10px] text-slate-600 dark:text-slate-300">{a.room_types?.name || a.room_type_id}</span> },
              { key: 'stay_date', label: 'Stay Date', render: (a: Allotment) => <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 font-mono">{a.stay_date}</span> },
              { key: 'blocked_qty', label: 'Blocked', render: (a: Allotment) => <span className="text-[10px] font-black text-slate-900 dark:text-white">{a.blocked_qty}</span> },
              { key: 'picked_up_qty', label: 'Picked Up', render: (a: Allotment) => <span className="text-[10px] font-bold text-indigo-600">{a.picked_up_qty}</span> },
              { key: 'available', label: 'Available', render: (a: Allotment) => { const avail = a.blocked_qty - a.picked_up_qty; return <span className={`text-[10px] font-black ${avail > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{avail}</span>; } },
              { key: 'release_date', label: 'Cut-off', render: (a: Allotment) => <span className={`text-[10px] font-bold ${a.release_date < today ? 'text-rose-500' : 'text-slate-500'}`}>{a.release_date}</span> },
              { key: 'status', label: 'Status', render: (a: Allotment) => { const released = a.is_released || a.release_date < today; return <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${released ? 'bg-slate-100 text-slate-400' : 'bg-emerald-50 text-emerald-600'}`}>{released ? 'Released' : 'Active'}</span>; } },
            ] as Column<Allotment>[]}
            data={allotments}
            rowKey={(a) => a.id}
            sortable
            filterable
            filterPlaceholder="Search allotments..."
            filterKeys={['stay_date', 'release_date']}
            containerClassName="rounded-[32px]"
            emptyMessage="No allotment blocks"
          />
        </div>
      )}

      {/* ── CONTRACTS ── */}
      {tab === 'contracts' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{contracts.length} Rate Contracts</span>
          </div>
          <DataTable
            columns={[
              { key: 'operator', label: 'Operator', render: (c: Contract) => <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{c.tour_operators?.name || '—'}</span> },
              { key: 'room_type', label: 'Room Type', render: (c: Contract) => <span className="text-[10px] text-slate-600 dark:text-slate-300">{c.room_types?.name || c.room_type_id}</span> },
              { key: 'board_basis', label: 'Board', render: (c: Contract) => <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded">{c.board_basis}</span> },
              { key: 'rate_model', label: 'Model', render: (c: Contract) => <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${c.rate_model === 'net' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>{c.rate_model}</span> },
              { key: 'net_rate', label: 'Net Rate', render: (c: Contract) => <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{c.net_rate != null ? `ETB ${fmt(c.net_rate)}` : '—'}</span> },
              { key: 'sell_rate', label: 'Sell Rate', render: (c: Contract) => <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{c.sell_rate != null ? `ETB ${fmt(c.sell_rate)}` : '—'}</span> },
              { key: 'commission_pct', label: 'Comm %', render: (c: Contract) => <span className="text-[10px] font-bold text-indigo-600">{c.commission_pct > 0 ? `${c.commission_pct}%` : '—'}</span> },
              { key: 'valid_from', label: 'Valid From', render: (c: Contract) => <span className="text-[10px] font-mono text-slate-500">{c.valid_from}</span> },
              { key: 'valid_to', label: 'Valid To', render: (c: Contract) => <span className="text-[10px] font-mono text-slate-500">{c.valid_to}</span> },
              { key: 'status', label: 'Status', render: (c: Contract) => <span className={`text-[9px] font-black ${c.is_active && c.valid_to >= today ? 'text-emerald-600' : 'text-slate-400'}`}>{c.is_active && c.valid_to >= today ? 'Active' : 'Inactive'}</span> },
            ] as Column<Contract>[]}
            data={contracts}
            rowKey={(c) => c.id}
            sortable
            filterable
            filterPlaceholder="Search contracts..."
            filterKeys={['valid_from', 'valid_to', 'board_basis', 'rate_model']}
            containerClassName="rounded-[32px]"
            emptyMessage="No rate contracts configured. Use POST /api/b2b/contracts to add."
          />
        </div>
      )}

      {/* ── VOUCHERS ── */}
      {tab === 'vouchers' && (
        <div className="space-y-4">
          {/* Redeem panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] p-5 shadow-3xs">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-3">Redeem Voucher</h3>
            <div className="flex gap-3 flex-wrap">
              <input value={redeemNo} onChange={e => setRedeemNo(e.target.value)}
                placeholder="Voucher No." className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold w-40" />
              <input value={redeemResId} onChange={e => setRedeemResId(e.target.value)}
                placeholder="Reservation ID" className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold w-44" />
              <button onClick={redeemVoucher} disabled={!redeemNo || !redeemResId}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg disabled:opacity-50 transition">
                Redeem
              </button>
              {redeemMsg && <span className={`text-[10px] font-bold self-center ${redeemMsg.startsWith('✓') ? 'text-emerald-600' : 'text-rose-600'}`}>{redeemMsg}</span>}
            </div>
          </div>

          {/* Voucher table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-3xs">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{vouchers.length} Vouchers</span>
            </div>
            <DataTable
              columns={[
                { key: 'voucher_no', label: 'Voucher No', render: (v: Voucher) => <span className="text-[10px] font-black text-indigo-600 font-mono">{v.voucher_no}</span> },
                { key: 'operator', label: 'Operator', render: (v: Voucher) => <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase">{v.tour_operators?.name || '—'}</span> },
                { key: 'room_type', label: 'Room Type', render: (v: Voucher) => <span className="text-[10px] text-slate-600 dark:text-slate-300">{v.room_types?.name || '—'}</span> },
                { key: 'board_basis', label: 'Board', render: (v: Voucher) => <span className="text-[9px] font-black bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-0.5 rounded">{v.board_basis}</span> },
                { key: 'pax_count', label: 'Pax', render: (v: Voucher) => <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{v.pax_count}</span> },
                { key: 'nights', label: 'Nights', render: (v: Voucher) => <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{v.nights ?? '—'}</span> },
                { key: 'net_value', label: 'Net Value', render: (v: Voucher) => <span className="text-[10px] font-bold text-slate-700 dark:text-white">{v.net_value != null ? `ETB ${fmt(v.net_value)}` : '—'}</span> },
                { key: 'valid_from', label: 'Valid From', render: (v: Voucher) => <span className="text-[10px] font-mono text-slate-500">{v.valid_from}</span> },
                { key: 'valid_to', label: 'Valid To', render: (v: Voucher) => <span className={`text-[10px] font-mono ${v.valid_to < today ? 'text-rose-500' : 'text-slate-500'}`}>{v.valid_to}</span> },
                { key: 'status', label: 'Status', render: (v: Voucher) => (
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                    v.status === 'issued'   ? 'bg-blue-50 text-blue-600' :
                    v.status === 'redeemed' ? 'bg-emerald-50 text-emerald-600' :
                    v.status === 'expired'  ? 'bg-slate-100 text-slate-400' :
                                              'bg-rose-50 text-rose-600'
                  }`}>{v.status}</span>
                ) },
              ] as Column<Voucher>[]}
              data={vouchers}
              rowKey={(v) => v.id}
              sortable
              filterable
              filterPlaceholder="Search vouchers..."
              filterKeys={['voucher_no', 'board_basis', 'status']}
              containerClassName="rounded-[32px]"
              emptyMessage="No vouchers issued yet"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default B2BOperatorPortal;
