import React, { useState, useEffect } from 'react';
import {
  Download,
  RefreshCw,
  FileText,
  Calendar,
  DollarSign,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { exportErcaVat, type ErcaVatExportResponse, type VatAccount } from '../../services/ercaVatService';
import { DataTable, Column } from '../Shared/DataTable';

const ErcaVatExport = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vatExport, setVatExport] = useState<ErcaVatExportResponse | null>(null);

  const [periodStart, setPeriodStart] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [periodEnd, setPeriodEnd] = useState(new Date().toISOString().split('T')[0]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await exportErcaVat(periodStart, periodEnd);
      setVatExport(data);
    } catch (err: any) {
      console.error('Error loading ERCA VAT export:', err);
      setError(err.message || 'Failed to load ERCA VAT export');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [periodStart, periodEnd]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</label>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-900 dark:text-white"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl">
          <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-500 text-xs font-bold">
          Loading ERCA VAT export...
        </div>
      ) : vatExport ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'VAT Output', value: `$${vatExport.summary.total_vat_output.toLocaleString()}`, sub: 'VAT collected on sales', icon: Receipt, color: 'text-emerald-500' },
              { label: 'VAT Input', value: `$${vatExport.summary.total_vat_input.toLocaleString()}`, sub: 'VAT paid on purchases', icon: Receipt, color: 'text-indigo-500' },
              { label: 'Net VAT Payable', value: `$${vatExport.summary.total_net_vat.toLocaleString()}`, sub: vatExport.summary.total_net_vat >= 0 ? 'Payable to ERCA' : 'Receivable from ERCA', icon: DollarSign, color: vatExport.summary.total_net_vat >= 0 ? 'text-rose-500' : 'text-emerald-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
                <div className={`p-2 w-fit rounded-lg bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
                  <stat.icon size={18} />
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
                <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">VAT Account Breakdown</h3>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <FileText size={14} />
                ERCA Format
              </div>
            </div>

            {vatExport.vat_accounts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-bold">
                No VAT accounts found. Ensure your chart of accounts includes VAT-related accounts.
              </div>
            ) : (
              <DataTable
                columns={[
                  {
                    key: 'account_code',
                    label: 'Account Code',
                    render: (a: VatAccount) => <span className="text-[10px] font-mono text-slate-500">{a.account_code}</span>,
                  },
                  {
                    key: 'account_name',
                    label: 'Account Name',
                    render: (a: VatAccount) => <span className="text-xs font-bold text-slate-900 dark:text-white">{a.account_name}</span>,
                  },
                  {
                    key: 'vat_output',
                    label: 'VAT Output',
                    align: 'right',
                    render: (a: VatAccount) => <span className="text-xs font-mono text-emerald-600">${a.vat_output.toFixed(2)}</span>,
                  },
                  {
                    key: 'vat_input',
                    label: 'VAT Input',
                    align: 'right',
                    render: (a: VatAccount) => <span className="text-xs font-mono text-indigo-600">${a.vat_input.toFixed(2)}</span>,
                  },
                  {
                    key: 'net_vat',
                    label: 'Net VAT',
                    align: 'right',
                    render: (a: VatAccount) => (
                      <span className={`text-xs font-mono font-black ${a.net_vat >= 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ${a.net_vat.toFixed(2)}
                      </span>
                    ),
                  },
                ] as Column<VatAccount>[]}
                data={vatExport.vat_accounts}
                rowKey={(a) => a.account_code}
                sortable
                filterable
                filterPlaceholder="Search VAT accounts..."
                filterKeys={['account_code', 'account_name']}
                containerClassName="rounded-3xl border-0 shadow-none"
              />
            )}
          </div>

          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-6 rounded-3xl">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 dark:text-amber-100 uppercase tracking-tight mb-2">ERCA Filing Instructions</h4>
                <ul className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                  <li>• Ensure all VAT accounts are properly configured in your chart of accounts</li>
                  <li>• Verify the period matches your tax filing period (monthly/quarterly)</li>
                  <li>• Export the CSV and submit to ERCA portal before the filing deadline</li>
                  <li>• Keep a copy of the exported file for your records</li>
                </ul>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default ErcaVatExport;
