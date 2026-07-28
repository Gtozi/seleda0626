import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Calculator,
  TrendingDown,
  Building2,
  Truck,
  Laptop,
  Calendar,
  DollarSign,
  BarChart3,
  Edit,
  Trash2,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { ModalSystem } from '../Shared/ModalSystem';
import { DataTable, Column } from '../Shared/DataTable';
import {
  fetchFixedAssets,
  calculateDeprecation,
  disposeAsset,
  fetchDepreciationSchedule,
  createFixedAsset,
  type FixedAsset,
  type DepreciationSchedule,
} from '../../services/fixedAssetsService';

const FixedAssets = () => {
  const [activeTab, setActiveTab] = useState<'register' | 'depreciation' | 'disposal'>('register');
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [depreciationSchedule, setDepreciationSchedule] = useState<DepreciationSchedule[]>([]);

  const [showNewAsset, setShowNewAsset] = useState(false);
  const [newAssetForm, setNewAssetForm] = useState({
    assetCode: '',
    assetName: '',
    assetCategory: '',
    description: '',
    location: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 0,
    salvageValue: 0,
    usefulLifeYears: 5,
    depreciationMethod: 'Straight Line',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchFixedAssets();
      setAssets(data);
    } catch (err: any) {
      console.error('Error loading fixed assets:', err);
      setError(err.message || 'Failed to load fixed assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAsset = async () => {
    if (!newAssetForm.assetCode || !newAssetForm.assetName || !newAssetForm.assetCategory || !newAssetForm.purchaseDate || !newAssetForm.purchaseCost || !newAssetForm.usefulLifeYears) {
      setError('Asset code, name, category, purchase date, cost and useful life are required');
      return;
    }
    try {
      await createFixedAsset(newAssetForm);
      await loadData();
      setShowNewAsset(false);
      setNewAssetForm({
        assetCode: '',
        assetName: '',
        assetCategory: '',
        description: '',
        location: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchaseCost: 0,
        salvageValue: 0,
        usefulLifeYears: 5,
        depreciationMethod: 'Straight Line',
      });
    } catch (err: any) {
      console.error('Failed to create asset:', err);
      setError(err.message || 'Failed to create asset');
    }
  };

  const handleCalculateDepreciation = async (assetId: string, fiscalYear: number) => {
    try {
      await calculateDeprecation(assetId, fiscalYear);
      await loadData();
    } catch (err: any) {
      console.error('Failed to calculate depreciation:', err);
      setError(err.message || 'Failed to calculate depreciation');
    }
  };

  const handleDisposeAsset = async (assetId: string, disposalDate: string, disposalValue: number) => {
    try {
      await disposeAsset(assetId, disposalDate, disposalValue);
      await loadData();
    } catch (err: any) {
      console.error('Failed to dispose asset:', err);
      setError(err.message || 'Failed to dispose asset');
    }
  };

  const handleViewSchedule = async (assetId: string) => {
    try {
      const schedule = await fetchDepreciationSchedule(assetId);
      setDepreciationSchedule(schedule);
      setSelectedAsset(assetId);
    } catch (err: any) {
      console.error('Failed to fetch depreciation schedule:', err);
      setError(err.message || 'Failed to fetch depreciation schedule');
    }
  };

  const totalAssets = assets.reduce((sum, a) => sum + a.purchase_cost, 0);
  const totalAccumulatedDepreciation = assets.reduce((sum, a) => sum + a.accumulated_depreciation, 0);
  const totalNetBookValue = assets.reduce((sum, a) => sum + a.net_book_value, 0);

  const renderRegister = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input type="text" placeholder="Search assets..." className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold w-64" />
          </div>
          <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
            <Filter size={14} />
          </button>
        </div>
        <button
          onClick={() => setShowNewAsset(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition"
        >
          <Plus size={14} /> Add Asset
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assets', value: `$${totalAssets.toLocaleString()}`, sub: `${assets.length} registered`, icon: Building2, color: 'text-indigo-500' },
          { label: 'Accumulated Depreciation', value: `$${totalAccumulatedDepreciation.toLocaleString()}`, sub: 'YTD 2024', icon: TrendingDown, color: 'text-amber-500' },
          { label: 'Net Book Value', value: `$${totalNetBookValue.toLocaleString()}`, sub: 'Current value', icon: DollarSign, color: 'text-emerald-500' },
          { label: 'Depreciation Expense', value: '$0', sub: 'This month', icon: Calculator, color: 'text-rose-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
            <div className={`p-2 w-fit rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color} mb-3`}>
              <stat.icon size={18} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{stat.value}</h3>
            <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tight">{stat.sub}</p>
          </div>
        ))}
      </div>

      <DataTable
        columns={[
          {
            key: 'asset_code',
            label: 'Asset Code',
            render: (a: FixedAsset) => <span className="text-[10px] font-mono text-slate-500">{a.asset_code}</span>,
          },
          {
            key: 'asset_name',
            label: 'Name',
            render: (a: FixedAsset) => <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter block">{a.asset_name}</span>,
          },
          {
            key: 'asset_category',
            label: 'Category',
            render: (a: FixedAsset) => <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-950 rounded text-[9px] font-black text-slate-500 uppercase">{a.asset_category}</span>,
          },
          {
            key: 'purchase_date',
            label: 'Acquisition Date',
            render: (a: FixedAsset) => <span className="text-xs font-bold text-slate-500">{a.purchase_date}</span>,
          },
          {
            key: 'purchase_cost',
            label: 'Acquisition Cost',
            align: 'right',
            render: (a: FixedAsset) => <span className="text-xs font-mono text-slate-900 dark:text-white">${a.purchase_cost.toLocaleString()}</span>,
          },
          {
            key: 'net_book_value',
            label: 'Book Value',
            align: 'right',
            render: (a: FixedAsset) => <span className="text-xs font-mono text-slate-900 dark:text-white">${a.net_book_value.toLocaleString()}</span>,
          },
          {
            key: 'accumulated_depreciation',
            label: 'Accum. Depreciation',
            align: 'right',
            render: (a: FixedAsset) => <span className="text-xs font-mono text-amber-600">${a.accumulated_depreciation.toLocaleString()}</span>,
          },
          {
            key: 'status',
            label: 'Status',
            align: 'center',
            render: (a: FixedAsset) => (
              <div className="flex justify-center">
                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                  a.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                }`}>
                  {a.status}
                </span>
              </div>
            ),
          },
          {
            key: 'actions',
            label: 'Actions',
            align: 'center',
            sortable: false,
            render: (a: FixedAsset) => (
              <div className="flex justify-center gap-1">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 transition">
                  <Edit size={14} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-rose-600 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            ),
          },
        ] as Column<FixedAsset>[]}
        data={assets}
        rowKey={(a) => a.asset_code}
        sortable
        filterable
        filterPlaceholder="Search assets..."
        filterKeys={['asset_code', 'asset_name', 'asset_category', 'status']}
        emptyMessage="No assets registered. Click Add Asset to create one."
        containerClassName="rounded-3xl"
      />
    </div>
  );

  const renderDepreciation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold">
            <option>All Assets</option>
            <option>Real Estate</option>
            <option>Vehicles</option>
            <option>IT Equipment</option>
            <option>Furniture & Fixtures</option>
          </select>
          <select className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold">
            <option>2024</option>
            <option>2023</option>
            <option>2022</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition">
            <Calculator size={14} /> Run Depreciation
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-indigo-700 transition">
            <Download size={14} /> Export Schedule
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Depreciation Schedule</h3>
          {depreciationSchedule.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs font-bold">
              Select an asset to view its depreciation schedule.
            </div>
          ) : (
            <div className="space-y-4">
              {depreciationSchedule.map((item, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.fiscal_year}</span>
                    <span className="text-[10px] font-bold text-slate-500">${item.depreciation_amount.toLocaleString()} expense</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Beginning</span>
                      <span className="text-xs font-mono text-slate-900 dark:text-white">${(item.accumulated_depreciation - item.depreciation_amount).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Depreciation</span>
                      <span className="text-xs font-mono text-amber-600">${item.depreciation_amount.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-slate-400 uppercase block mb-1">Ending</span>
                      <span className="text-xs font-mono text-slate-900 dark:text-white">${item.net_book_value.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-indigo-600 p-6 rounded-3xl text-white space-y-4">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-80">Depreciation Summary</h3>
          <div className="space-y-4">
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Total Depreciation (YTD)</span>
              <p className="text-2xl font-black">${totalAccumulatedDepreciation.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Monthly Depreciation</span>
              <p className="text-2xl font-black">$0</p>
            </div>
            <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
              <span className="text-[9px] font-black uppercase tracking-widest block mb-1">Next Run Date</span>
              <p className="text-lg font-black">July 1, 2024</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDisposal = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-8 rounded-3xl shadow-3xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6">Asset Disposal</h3>

        {assets.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-bold">
            No assets available for disposal.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Asset to Dispose</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white">
                  {assets.map(asset => (
                    <option key={asset.id} value={asset.id}>{asset.asset_code} - {asset.asset_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Disposal Date</label>
                <input type="date" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Sale Proceeds</label>
                <input type="number" placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Disposal Costs</label>
                <input type="number" placeholder="0.00" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Reason for Disposal</label>
                <select className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white">
                  <option>Sold</option>
                  <option>Obsolete</option>
                  <option>Damaged</option>
                  <option>Lost</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-950/40 rounded-2xl mb-6">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Gain/Loss Calculation</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Current Book Value</span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white">$7,225,000.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Sale Proceeds</span>
                  <span className="text-xs font-mono text-emerald-600">$7,500,000.00</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500">Disposal Costs</span>
                  <span className="text-xs font-mono text-rose-600">$25,000.00</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-center">
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase">Net Gain/Loss</span>
                  <span className="text-sm font-mono font-black text-emerald-600">$250,000.00</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition">
                Process Disposal
              </button>
              <button className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition">
                Cancel
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">Recent Disposals</h3>
        {assets.filter(a => a.status === 'Disposed').length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-bold">
            No disposals recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {assets.filter(a => a.status === 'Disposed').map((asset, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950/40 rounded-2xl">
                <div>
                  <p className="text-xs font-black text-slate-900 dark:text-white">{asset.asset_name}</p>
                  <p className="text-[9px] text-slate-500 font-bold">{asset.disposal_date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-slate-500">${asset.disposal_value?.toLocaleString() || 0}</span>
                  <span className="text-xs font-mono font-black text-emerald-600">
                    ${(asset.disposal_value || 0) - asset.net_book_value >= 0 ? '+' : ''}${((asset.disposal_value || 0) - asset.net_book_value).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex bg-white dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('register')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Asset Register
          </button>
          <button 
            onClick={() => setActiveTab('depreciation')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'depreciation' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Depreciation
          </button>
          <button 
            onClick={() => setActiveTab('disposal')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition ${activeTab === 'disposal' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            Disposal
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold py-2.5 px-4 rounded-2xl flex items-center gap-2 text-xs hover:bg-slate-50 transition shadow-sm">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {activeTab === 'register' && renderRegister()}
      {activeTab === 'depreciation' && renderDepreciation()}
      {activeTab === 'disposal' && renderDisposal()}

      <ModalSystem
        isOpen={showNewAsset}
        onClose={() => setShowNewAsset(false)}
        title="New Fixed Asset"
        subtitle="Register a new asset for depreciation tracking"
        variant="form"
        size="lg"
        showFooter={false}
      >
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Asset Code *</label>
                  <input
                    type="text"
                    value={newAssetForm.assetCode}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, assetCode: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="FA-001"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Asset Name *</label>
                  <input
                    type="text"
                    value={newAssetForm.assetName}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, assetName: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Main Building"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Category *</label>
                  <select
                    value={newAssetForm.assetCategory}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, assetCategory: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select category</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="IT Equipment">IT Equipment</option>
                    <option value="Furniture & Fixtures">Furniture & Fixtures</option>
                    <option value="Machinery">Machinery</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Location</label>
                  <input
                    type="text"
                    value={newAssetForm.location}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Main Building, Floor 1"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Description</label>
                <textarea
                  value={newAssetForm.description}
                  onChange={(e) => setNewAssetForm({ ...newAssetForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={2}
                  placeholder="Asset description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Purchase Date *</label>
                  <input
                    type="date"
                    value={newAssetForm.purchaseDate}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, purchaseDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Purchase Cost *</label>
                  <input
                    type="number"
                    value={newAssetForm.purchaseCost}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, purchaseCost: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Salvage Value</label>
                  <input
                    type="number"
                    value={newAssetForm.salvageValue}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, salvageValue: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Useful Life (Years) *</label>
                  <input
                    type="number"
                    value={newAssetForm.usefulLifeYears}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, usefulLifeYears: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="5"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Depreciation Method</label>
                  <select
                    value={newAssetForm.depreciationMethod}
                    onChange={(e) => setNewAssetForm({ ...newAssetForm, depreciationMethod: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Straight Line">Straight Line</option>
                    <option value="Reducing Balance">Reducing Balance</option>
                    <option value="Units of Production">Units of Production</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/30 dark:bg-slate-950/20">
              <button
                onClick={() => setShowNewAsset(false)}
                className="px-6 py-2.5 border border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAsset}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition"
              >
                Create Asset
              </button>
            </div>
      </ModalSystem>
    </div>
  );
};

export default FixedAssets;
