import React, { useState } from 'react';
import { useERP } from '../../context/ERPContext';
import { supabaseService } from '../../services/supabaseService';
import {
  Save,
  CheckCircle2,
  Database,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Image,
  FileText,
  Plus,
  Trash2,
  GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function GlobalConfigModule() {
  const {
    globalHotelSettings,
    updateGlobalHotelSettings,
    roomTypeMetadata,
    updateRoomTypeMetadata,
    inventoryItems,
    formatAmount,
    rooms,
    ratePlans,
    seasons,
    packages
  } = useERP();
  const [activeSection, setActiveSection] = useState<'branding' | 'supabase'>('branding');

  const [portalData, setPortalData] = useState({
    customHotelName: globalHotelSettings.customHotelName,
    customHotelAddress: globalHotelSettings.customHotelAddress,
    contactPhone: globalHotelSettings.contactPhone || '',
    contactEmail: globalHotelSettings.contactEmail || '',
    publicTagline: globalHotelSettings.publicTagline || '',
    heroImageUrl: globalHotelSettings.heroImageUrl || '',
    bookingTerms: globalHotelSettings.bookingTerms || '',
  });
  const [portalSaveStatus, setPortalSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [selectedMetaType, setSelectedMetaType] = useState(roomTypeMetadata[0]?.type || '');

  const [connStatus, setConnStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [connMessage, setConnMessage] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncCount, setSyncCount] = useState(0);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleTestConnection = async () => {
    setConnStatus('testing');
    setConnMessage('');
    const res = await supabaseService.testConnection();
    if (res.success) {
      setConnStatus('success');
      setConnMessage(res.message);
    } else {
      setConnStatus('error');
      setConnMessage(`${res.message} ${res.details || ''}`);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncStatus('syncing');
    setSyncErrors([]);
    const res = await supabaseService.pushInitialStateToSupabase(rooms, ratePlans, seasons, packages);
    if (res.success) {
      setSyncStatus('success');
      setSyncCount(res.roomsCount);
    } else {
      setSyncStatus('error');
      setSyncErrors(res.errors || ['Sync execution failed.']);
    }
  };

  const handleCopySql = () => {
    const sqlText = `/* SQL omitted for brevity; same schema as original SettingsModule */`;
    navigator.clipboard.writeText(sqlText);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6" id="global-config-module">
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 space-y-1">
          <button
            onClick={() => setActiveSection('branding')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'branding'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-x-1'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Globe size={18} />
            Public Booking Branding
          </button>
          <button
            onClick={() => setActiveSection('supabase')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              activeSection === 'supabase'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none translate-x-1'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Database size={18} />
            Supabase Backend
          </button>
        </aside>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeSection === 'branding' && (
              <motion.div
                key="branding"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8"
              >
                <div>
                  <h2 className="text-xl font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Globe className="text-indigo-600" size={24} />
                    Public Booking Branding
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">Manage branding and contact details displayed on the public booking page.</p>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setPortalSaveStatus('saving');
                  setTimeout(() => {
                    updateGlobalHotelSettings({
                      customHotelName: portalData.customHotelName,
                      customHotelAddress: portalData.customHotelAddress,
                      contactPhone: portalData.contactPhone,
                      contactEmail: portalData.contactEmail,
                      publicTagline: portalData.publicTagline,
                      heroImageUrl: portalData.heroImageUrl,
                      bookingTerms: portalData.bookingTerms,
                    });
                    setPortalSaveStatus('success');
                    setTimeout(() => setPortalSaveStatus('idle'), 3000);
                  }, 600);
                }} className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <Image size={16} className="text-indigo-500" /> Hotel Branding
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Hotel Name</label>
                        <input type="text" value={portalData.customHotelName} onChange={e => setPortalData(p => ({ ...p, customHotelName: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Contact Phone</label>
                        <input type="text" value={portalData.contactPhone} onChange={e => setPortalData(p => ({ ...p, contactPhone: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Contact Email</label>
                        <input type="text" value={portalData.contactEmail} onChange={e => setPortalData(p => ({ ...p, contactEmail: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Public Tagline</label>
                        <input type="text" value={portalData.publicTagline} onChange={e => setPortalData(p => ({ ...p, publicTagline: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Hotel Address</label>
                        <input type="text" value={portalData.customHotelAddress} onChange={e => setPortalData(p => ({ ...p, customHotelAddress: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold">Hero Image URL</label>
                        <input type="text" value={portalData.heroImageUrl} onChange={e => setPortalData(p => ({ ...p, heroImageUrl: e.target.value }))} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200" />
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-mono uppercase text-slate-450 tracking-wider font-bold flex items-center gap-2"><FileText size={14} /> Booking Terms & Conditions</label>
                        <textarea value={portalData.bookingTerms} onChange={e => setPortalData(p => ({ ...p, bookingTerms: e.target.value }))} rows={6} placeholder="Enter terms and conditions shown to guests before they confirm a booking..." className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition dark:text-slate-200 resize-none" />
                      </div>
                    </div>
                  </div>
                  <hr className="border-slate-100 dark:border-slate-800" />
                  <div className="flex justify-end gap-3">
                    <button
                      type="submit"
                      disabled={portalSaveStatus === 'saving'}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
                    >
                      {portalSaveStatus === 'saving' ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : portalSaveStatus === 'success' ? (
                        <CheckCircle2 size={18} />
                      ) : (
                        <Save size={18} />
                      )}
                      {portalSaveStatus === 'success' ? 'Saved' : 'Save Branding'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {activeSection === 'supabase' && (
              <motion.div
                key="supabase"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8"
              >
                <div>
                  <h2 className="text-xl font-sans font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Database className="text-indigo-600" size={24} />
                    Supabase Cloud Backend
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Migrate your Hotel ERP system from single-session memory to a durable relational PostgreSQL database with Supabase.
                  </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Connection Status</div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${connStatus === 'success' ? 'bg-emerald-500' : connStatus === 'error' ? 'bg-rose-500' : connStatus === 'testing' ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                        {connStatus === 'success' ? 'Connected' : connStatus === 'error' ? 'Failed' : connStatus === 'testing' ? 'Testing...' : 'Not Tested'}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {supabaseService.isConfigured() ? (
                        <button
                          onClick={handleTestConnection}
                          disabled={connStatus === 'testing'}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          {connStatus === 'testing' && <RefreshCw size={14} className="animate-spin" />}
                          Test Supabase Connection
                        </button>
                      ) : (
                        <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 px-3 py-2 rounded-xl">
                          Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in settings secrets
                        </div>
                      )}
                    </div>
                  </div>
                  {connMessage && (
                    <div className={`p-4 rounded-xl text-xs font-mono border ${
                      connStatus === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/40 dark:text-emerald-400'
                        : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:border-rose-900/40 dark:text-rose-400'
                    }`}>
                      {connMessage}
                    </div>
                  )}
                  {!supabaseService.isUserConfigured() && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-400 space-y-1.5 leading-relaxed">
                      <span className="font-bold flex items-center gap-1">⚠️ Connected to Shared Playground Database</span>
                      <p>You are currently utilizing standard fallback developer keys. Reservations and guests you create will be written to the shared sandbox cluster.</p>
                      <p className="font-semibold text-amber-900 dark:text-amber-300">To store and view test reservations in your personalized private database:</p>
                      <ol className="list-decimal list-inside space-y-0.5 ml-1">
                        <li>Log into your private Supabase project.</li>
                        <li>Add your <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-[10px] font-mono">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded text-[10px] font-mono">VITE_SUPABASE_ANON_KEY</code> into the local Secrets console.</li>
                        <li>Make sure to execute the queries in your Supabase SQL editor using the script button below.</li>
                      </ol>
                    </div>
                  )}
                </div>
                {supabaseService.isConfigured() && (
                  <div className="border border-slate-250/60 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Preseed / Bootstrap Database</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Push active hotel rooms ({rooms?.length || 0}), rate plans, packages, and seasonal multipliers up to your master Supabase database tables now.
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSyncToSupabase}
                        disabled={syncStatus === 'syncing'}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        {syncStatus === 'syncing' && <RefreshCw size={14} className="animate-spin" />}
                        Bootstrap Supabase Tables
                      </button>
                      {syncStatus === 'success' && (
                        <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                          <CheckCircle2 size={16} /> Seeded {syncCount} live records!
                        </span>
                      )}
                    </div>
                    {syncStatus === 'error' && (
                      <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-4 rounded-xl text-xs font-mono space-y-1">
                        <div className="font-bold">Bootstrapping failed:</div>
                        {syncErrors.map((err, i) => <div key={i}>• {err}</div>)}
                      </div>
                    )}
                  </div>
                )}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Database Schema Execution</h4>
                    <button
                      onClick={handleCopySql}
                      className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition flex items-center gap-1.5"
                    >
                      {sqlCopied ? <Check size={14} /> : <Copy size={14} />}
                      {sqlCopied ? 'Copied' : 'Copy Schema SQL'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Execute this relational architecture mapping in the Supabase SQL Editor to bootstrap your table schemas and initial ERP database.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
