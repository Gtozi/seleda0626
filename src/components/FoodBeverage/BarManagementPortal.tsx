/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import {
  LayoutDashboard, Wine, FlaskConical, Factory, Package, Tag, ArrowRightLeft,
  Trash2, Clock, CalendarDays, Settings as SettingsIcon, ScrollText,
  TrendingUp, DollarSign, AlertTriangle, Activity, Layers,
} from 'lucide-react';
import {
  fetchBarDashboard,
  fetchPOSOutlets,
  fetchBarRecipes,
  createBarRecipe,
  updateBarRecipe,
  fetchBarRecipeCost,
  fetchBarProductionOrders,
  createBarProductionOrder,
  updateBarProductionOrderStatus,
  completeBarProductionOrder,
  fetchBarInventory,
  fetchBarBatches,
  fetchBarTransfers,
  createBarTransfer,
  approveBarTransfer,
  fetchBarWaste,
  createBarWaste,
  approveBarWaste,
  fetchBarExpiryAlerts,
  fetchBarProductionPlan,
  fetchBarStorageLocations,
  fetchBarSettings,
  updateBarSettings,
  fetchBarAuditLog,
  fetchPrepStations,
  type POSOutlet,
  type PrepStation,
  type BarDashboardSummary,
  type BarRecipe,
  type BarProductionOrder,
  type BarInventoryItem,
  type BarInventoryBatch,
  type BarTransfer,
  type BarWaste,
  type BarExpiryAlert,
  type BarProductionPlan,
  type BarStorageLocation,
  type BarSettings,
  type BarAuditLog,
} from '../../services/barService';
import { ModalSystem } from '../Shared/ModalSystem';
import { KpiGrid, type KpiTile } from '../Shared/DashboardTemplate';

type BarTab = 'dashboard' | 'recipes' | 'subrecipes' | 'production' | 'inventory' | 'batches' | 'transfers' | 'waste' | 'expiry' | 'planning' | 'settings' | 'audit';

const TABS: { id: BarTab; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'recipes', label: 'Drink Recipes', icon: Wine },
  { id: 'subrecipes', label: 'Sub-Recipes', icon: FlaskConical },
  { id: 'production', label: 'Batch Prep', icon: Factory },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'batches', label: 'Batches', icon: Tag },
  { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft },
  { id: 'waste', label: 'Spillage', icon: Trash2 },
  { id: 'expiry', label: 'Expiry', icon: Clock },
  { id: 'planning', label: 'Planning', icon: CalendarDays },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
  { id: 'audit', label: 'Audit Trail', icon: ScrollText },
];

const OutletContext = createContext<string>('');
function useOutlet() { return useContext(OutletContext); }

export default function BarManagementPortal() {
  const [activeTab, setActiveTab] = useState<BarTab>('dashboard');
  const [outlets, setOutlets] = useState<POSOutlet[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');

  useEffect(() => {
    fetchPOSOutlets()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setOutlets(list);
        if (list.length === 1) setSelectedOutletId(list[0].id);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 animate-fade-in" id="bar-management-portal">
      <div className="flex justify-center">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700 rounded-xl self-center text-xs font-sans font-medium select-none gap-0.5 transition-colors duration-300 card-shadow">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer smooth-transition text-[11px] ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 bg-white dark:bg-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end items-center gap-2">
        <label className="text-xs font-medium text-slate-500">Outlet</label>
        <select
          value={selectedOutletId}
          onChange={e => setSelectedOutletId(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 min-w-[180px]"
        >
          <option value="">All Outlets</option>
          {outlets.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>
      </div>

      <OutletContext.Provider value={selectedOutletId}>
        <div className="min-h-[500px]">
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'recipes' && <RecipesTab recipeType="drink_item" />}
          {activeTab === 'subrecipes' && <RecipesTab recipeType="sub_recipe" />}
          {activeTab === 'production' && <ProductionTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'batches' && <BatchesTab />}
          {activeTab === 'transfers' && <TransfersTab />}
          {activeTab === 'waste' && <WasteTab />}
          {activeTab === 'expiry' && <ExpiryTab />}
          {activeTab === 'planning' && <PlanningTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'audit' && <AuditTab />}
        </div>
      </OutletContext.Provider>
    </div>
  );
}

// ── Dashboard Tab ───────────────────────────────────────────────────────

function DashboardTab() {
  const selectedOutletId = useOutlet();
  const [summary, setSummary] = useState<BarDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarDashboard(selectedOutletId || undefined)
      .then(setSummary)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading dashboard...</div>;
  if (!summary) return <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl p-12 text-center text-rose-600 dark:text-rose-400 text-sm font-bold">Failed to load dashboard.</div>;

  const kpiTiles: KpiTile[] = [
    { label: "Today's Batch Prep", value: String(summary.today_production_count ?? 0), icon: Factory, colorClass: 'text-blue-600', bgClass: 'bg-blue-50 dark:bg-blue-900/20', sub: `${summary.pending_production_count ?? 0} pending` },
    { label: 'Inventory Value', value: `$${(summary.inventory_value ?? 0).toFixed(2)}`, icon: DollarSign, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20', sub: `${summary.low_stock_count ?? 0} low stock` },
    { label: 'Expiring Items', value: String(summary.expiring_items_count ?? 0), icon: AlertTriangle, colorClass: 'text-amber-600', bgClass: 'bg-amber-50 dark:bg-amber-900/20', sub: 'needs attention' },
    { label: 'Spillage Today', value: `$${(summary.waste_today_cost ?? 0).toFixed(2)}`, icon: Trash2, colorClass: 'text-rose-600', bgClass: 'bg-rose-50 dark:bg-rose-900/20', sub: `${summary.total_waste_count_today ?? 0} events` },
    { label: 'Avg Pour Cost %', value: `${(summary.avg_pour_cost_percent ?? 0).toFixed(1)}%`, icon: TrendingUp, colorClass: 'text-purple-600', bgClass: 'bg-purple-50 dark:bg-purple-900/20', sub: 'across recipes' },
    { label: 'Batch Efficiency', value: `${(summary.production_efficiency ?? 0).toFixed(1)}%`, icon: Activity, colorClass: 'text-teal-600', bgClass: 'bg-teal-50 dark:bg-teal-900/20', sub: 'avg yield' },
    { label: 'Active Batches', value: String(summary.total_batches_active ?? 0), icon: Layers, colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50 dark:bg-indigo-900/20', sub: 'in storage' },
  ];

  return (
    <div className="space-y-6">
      <KpiGrid tiles={kpiTiles} columns={7} />
    </div>
  );
}

// ── Recipes Tab (shared for drink recipes & sub-recipes) ────────────────

function RecipesTab({ recipeType }: { recipeType: 'drink_item' | 'sub_recipe' }) {
  const selectedOutletId = useOutlet();
  const [recipes, setRecipes] = useState<BarRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<BarRecipe | null>(null);
  const [costData, setCostData] = useState<any>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetchBarRecipes(recipeType, selectedOutletId || undefined)
      .then(data => setRecipes(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [recipeType, selectedOutletId]);

  useEffect(() => { load(); }, [load]);

  const handleViewRecipe = async (recipe: BarRecipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
    try {
      const cost = await fetchBarRecipeCost(recipe.id);
      setCostData(cost);
    } catch { setCostData(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {recipeType === 'drink_item' ? 'Drink Recipes' : 'Sub-Recipes (Syrups, Infusions, Pre-Mixes)'}
        </h3>
        <button
          onClick={() => { setSelectedRecipe(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-tight hover:bg-indigo-700 transition cursor-pointer"
        >
          + New {recipeType === 'sub_recipe' ? 'Sub-Recipe' : 'Drink Recipe'}
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>
      ) : recipes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No recipes found. Create one to get started.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Code</th>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-right px-6 py-4">Yield</th>
                <th className="text-right px-6 py-4">Cost/Portion</th>
                <th className="text-right px-6 py-4">Pour Cost %</th>
                <th className="text-center px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {recipes.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono text-slate-600">{r.recipe_code}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{r.name}</td>
                  <td className="px-6 py-4 text-slate-500">{r.category}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{r.yield_qty} {r.yield_unit}</td>
                  <td className="px-6 py-4 text-right text-slate-600">${r.cost_per_portion.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      r.pour_cost_percent <= 20 ? 'bg-green-100 text-green-700' :
                      r.pour_cost_percent <= 30 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.pour_cost_percent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      r.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>{r.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => handleViewRecipe(r)} className="text-indigo-600 hover:text-indigo-800 text-xs cursor-pointer">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <RecipeModal
          recipe={selectedRecipe}
          recipeType={recipeType}
          costData={costData}
          onClose={() => { setShowModal(false); setCostData(null); }}
          onSaved={() => { setShowModal(false); setCostData(null); load(); }}
        />
      )}
    </div>
  );
}

function RecipeModal({ recipe, recipeType, costData, onClose, onSaved }: {
  recipe: BarRecipe | null;
  recipeType: 'drink_item' | 'sub_recipe';
  costData: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const selectedOutletId = useOutlet();
  const [name, setName] = useState(recipe?.name || '');
  const [recipeCode, setRecipeCode] = useState(recipe?.recipe_code || '');
  const [category, setCategory] = useState(recipe?.category || 'cocktail');
  const [yieldQty, setYieldQty] = useState(recipe?.yield_qty?.toString() || '1');
  const [yieldUnit, setYieldUnit] = useState(recipe?.yield_unit || 'ml');
  const [sellingPrice, setSellingPrice] = useState(recipe?.selling_price?.toString() || '');
  const [abv, setAbv] = useState(recipe?.abv?.toString() || '');
  const [servingGlass, setServingGlass] = useState(recipe?.serving_glass || '');
  const [notes, setNotes] = useState(recipe?.notes || '');
  const [ingredients] = useState<any[]>(recipe?.bar_recipe_ingredients || []);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (recipe) {
        await updateBarRecipe(recipe.id, { name, category, yield_qty: Number(yieldQty), yield_unit: yieldUnit, selling_price: sellingPrice ? Number(sellingPrice) : undefined, abv: abv ? Number(abv) : undefined, serving_glass: servingGlass || undefined, notes });
      } else {
        await createBarRecipe({
          recipe_code: recipeCode, name, category, recipe_type: recipeType,
          outlet_id: selectedOutletId || undefined,
          yield_qty: Number(yieldQty), yield_unit: yieldUnit,
          selling_price: sellingPrice ? Number(sellingPrice) : undefined,
          abv: abv ? Number(abv) : undefined,
          serving_glass: servingGlass || undefined,
          notes,
          ingredients: ingredients.map(i => ({
            ingredient_type: i.ingredient_type, ingredient_id: i.ingredient_id,
            raw_ingredient_id: i.raw_ingredient_id, quantity: i.quantity, unit: i.unit,
            waste_percent: i.waste_percent || 0,
          })),
        });
      }
      onSaved();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalSystem
      isOpen={true}
      onClose={onClose}
      title={recipe ? `Edit: ${recipe.name}` : `New ${recipeType === 'sub_recipe' ? 'Sub-Recipe' : 'Drink Recipe'}`}
      size="lg"
      variant="form"
      confirmLabel={saving ? 'Saving...' : 'Save'}
      onConfirm={handleSave}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Recipe Code</label>
            <input value={recipeCode} onChange={e => setRecipeCode(e.target.value)} disabled={!!recipe}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
              <option value="cocktail">Cocktail</option>
              <option value="mocktail">Mocktail</option>
              <option value="spirit">Spirit</option>
              <option value="beer">Beer</option>
              <option value="wine">Wine</option>
              <option value="coffee_tea">Coffee / Tea</option>
              <option value="soft_drink">Soft Drink</option>
              <option value="syrup">Syrup</option>
              <option value="infusion">Infusion</option>
              <option value="prep_mix">Prep Mix</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Selling Price</label>
            <input value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} type="number" placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Yield Qty</label>
            <input value={yieldQty} onChange={e => setYieldQty(e.target.value)} type="number"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Yield Unit</label>
            <input value={yieldUnit} onChange={e => setYieldUnit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">ABV %</label>
            <input value={abv} onChange={e => setAbv(e.target.value)} type="number" placeholder="e.g. 12.5"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Serving Glass</label>
            <input value={servingGlass} onChange={e => setServingGlass(e.target.value)} placeholder="e.g. highball, martini"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
        </div>

        {costData && (
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 text-xs">
            <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Cost Analysis</div>
            <div className="grid grid-cols-3 gap-2 text-slate-600 dark:text-slate-300">
              <div>Total Cost: <strong>${costData.total_cost?.toFixed(2)}</strong></div>
              <div>Per Portion: <strong>${costData.cost_per_portion?.toFixed(2)}</strong></div>
              <div>Ingredients: <strong>{costData.ingredient_count}</strong></div>
            </div>
          </div>
        )}

        {recipe?.bar_recipe_ingredients && recipe.bar_recipe_ingredients.length > 0 && (
          <div>
            <label className="text-xs font-medium text-slate-500">Ingredients</label>
            <div className="mt-1 border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <tr>
                    <th className="text-left px-2 py-1">Type</th>
                    <th className="text-left px-2 py-1">Name</th>
                    <th className="text-right px-2 py-1">Qty</th>
                    <th className="text-left px-2 py-1">Unit</th>
                    <th className="text-right px-2 py-1">Waste %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {recipe.bar_recipe_ingredients.map((ing) => (
                    <tr key={ing.id}>
                      <td className="px-2 py-1">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          ing.ingredient_type === 'raw_material' ? 'bg-blue-100 text-blue-700' :
                          ing.ingredient_type === 'sub_recipe' ? 'bg-purple-100 text-purple-700' :
                          'bg-teal-100 text-teal-700'
                        }`}>{ing.ingredient_type}</span>
                      </td>
                      <td className="px-2 py-1 text-slate-700 dark:text-slate-200">
                        {ing.bar_recipes?.name || ing.ingredients?.name || '—'}
                      </td>
                      <td className="px-2 py-1 text-right">{ing.quantity}</td>
                      <td className="px-2 py-1">{ing.unit}</td>
                      <td className="px-2 py-1 text-right">{ing.waste_percent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-slate-500">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
        </div>
      </div>
    </ModalSystem>
  );
}

// ── Production Tab (Batch Prep) ─────────────────────────────────────────

function ProductionTab() {
  const selectedOutletId = useOutlet();
  const [orders, setOrders] = useState<BarProductionOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<BarRecipe[]>([]);
  const [prepStations, setPrepStations] = useState<PrepStation[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRecipeId, setSelectedRecipeId] = useState('');
  const [plannedQty, setPlannedQty] = useState('');
  const [selectedPrepStationId, setSelectedPrepStationId] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [actualQty, setActualQty] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchBarProductionOrders(undefined, selectedOutletId || undefined)
      .then(data => setOrders(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  useEffect(() => {
    load();
    fetchBarRecipes(undefined, selectedOutletId || undefined).then(data => setRecipes(Array.isArray(data) ? data : [])).catch(() => {});
    fetchPrepStations(selectedOutletId || undefined).then(data => setPrepStations(data)).catch(() => {});
  }, [load, selectedOutletId]);

  const handleCreate = async () => {
    if (!selectedRecipeId || !plannedQty) return;
    try {
      await createBarProductionOrder({
        recipe_id: selectedRecipeId,
        planned_qty: Number(plannedQty),
        outlet_id: selectedOutletId || undefined,
        prep_station_id: selectedPrepStationId || undefined,
        lines: [],
      });
      setShowCreate(false);
      setSelectedRecipeId('');
      setPlannedQty('');
      setSelectedPrepStationId('');
      load();
    } catch (e: any) { alert(e.message); }
  };

  const handleApprove = async (id: string) => {
    try {
      await updateBarProductionOrderStatus(id, 'approved', 'current_user');
      load();
    } catch (e: any) { alert(e.message); }
  };

  const handleComplete = async (id: string) => {
    if (!actualQty) return;
    try {
      await completeBarProductionOrder(id, Number(actualQty), 'current_user', 0);
      setCompletingId(null);
      setActualQty('');
      load();
    } catch (e: any) { alert(e.message); }
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    approved: 'bg-blue-100 text-blue-700',
    in_production: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    stored: 'bg-teal-100 text-teal-700',
    consumed: 'bg-indigo-100 text-indigo-700',
    closed: 'bg-slate-100 text-slate-500',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Batch Prep Orders</h3>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-tight hover:bg-indigo-700 transition cursor-pointer">
          + New Batch Prep
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No batch prep orders yet.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Batch #</th>
                <th className="text-left px-6 py-4">Recipe</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-right px-6 py-4">Planned</th>
                <th className="text-right px-6 py-4">Actual</th>
                <th className="text-right px-6 py-4">Cost/Unit</th>
                <th className="text-center px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono text-slate-600">{o.production_number}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{o.bar_recipes?.name || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">{o.production_date}</td>
                  <td className="px-6 py-4 text-right">{o.planned_qty}</td>
                  <td className="px-6 py-4 text-right">{o.actual_qty || '—'}</td>
                  <td className="px-6 py-4 text-right">${o.cost_per_unit?.toFixed(2) || '0.00'}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusColors[o.status] || 'bg-slate-100'}`}>{o.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center space-x-1">
                    {o.status === 'draft' && (
                      <button onClick={() => handleApprove(o.id)} className="text-blue-600 hover:text-blue-800 cursor-pointer">Approve</button>
                    )}
                    {o.status === 'approved' && (
                      <button onClick={() => { setCompletingId(o.id); setActualQty(o.planned_qty.toString()); }}
                        className="text-green-600 hover:text-green-800 cursor-pointer">Complete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <ModalSystem isOpen={true} onClose={() => setShowCreate(false)} title="New Batch Prep" size="md" variant="form"
          confirmLabel="Create" onConfirm={handleCreate}>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-slate-500">Recipe</label>
              <select value={selectedRecipeId} onChange={e => setSelectedRecipeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="">Select recipe...</option>
                {recipes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.recipe_code})</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Planned Quantity</label>
              <input value={plannedQty} onChange={e => setPlannedQty(e.target.value)} type="number"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Prep Station (KDS Routing)</label>
              <select value={selectedPrepStationId} onChange={e => setSelectedPrepStationId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="">No specific station</option>
                {prepStations.map(ps => <option key={ps.id} value={ps.id}>{ps.station_name} ({ps.station_type})</option>)}
              </select>
            </div>
          </div>
        </ModalSystem>
      )}

      {completingId && (
        <ModalSystem isOpen={true} onClose={() => setCompletingId(null)} title="Complete Batch Prep" size="sm" variant="form"
          confirmLabel="Complete" onConfirm={() => handleComplete(completingId)}>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-slate-500">Actual Quantity Produced</label>
              <input value={actualQty} onChange={e => setActualQty(e.target.value)} type="number" autoFocus
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
            <p className="text-[11px] text-slate-400">This will consume ingredients (FEFO), calculate costs, and create an inventory batch.</p>
          </div>
        </ModalSystem>
      )}
    </div>
  );
}

// ── Inventory Tab ───────────────────────────────────────────────────────

function InventoryTab() {
  const selectedOutletId = useOutlet();
  const [items, setItems] = useState<BarInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarInventory(undefined, selectedOutletId || undefined)
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bar Inventory</h3>
      {items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No inventory items. Batch prep will auto-create items.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Type</th>
                <th className="text-left px-6 py-4">Category</th>
                <th className="text-right px-6 py-4">On Hand</th>
                <th className="text-right px-6 py-4">Available</th>
                <th className="text-right px-6 py-4">Reorder Lvl</th>
                <th className="text-right px-6 py-4">Avg Cost</th>
                <th className="text-right px-6 py-4">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      item.item_type === 'raw_material' ? 'bg-blue-100 text-blue-700' :
                      item.item_type === 'semi_finished' ? 'bg-purple-100 text-purple-700' :
                      'bg-teal-100 text-teal-700'
                    }`}>{item.item_type}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{item.category}</td>
                  <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{item.on_hand_qty} {item.unit}</td>
                  <td className={`px-6 py-4 text-right ${item.available_qty <= 0 ? 'text-red-600 font-medium' : 'text-slate-600'}`}>
                    {item.available_qty} {item.unit}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500">{item.reorder_level}</td>
                  <td className="px-6 py-4 text-right text-slate-600">${item.avg_cost.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-700 dark:text-slate-300">
                    ${(item.on_hand_qty * item.avg_cost).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Batches Tab ─────────────────────────────────────────────────────────

function BatchesTab() {
  const selectedOutletId = useOutlet();
  const [batches, setBatches] = useState<BarInventoryBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchBarBatches(undefined, selectedOutletId || undefined)
      .then(data => setBatches(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;

  const filtered = filter ? batches.filter(b => b.status === filter) : batches;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Inventory Batches</h3>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="consumed">Consumed</option>
          <option value="expired">Expired</option>
          <option value="wasted">Wasted</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No batches found.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Batch #</th>
                <th className="text-left px-6 py-4">Item</th>
                <th className="text-left px-6 py-4">Prod Date</th>
                <th className="text-left px-6 py-4">Expiry</th>
                <th className="text-right px-6 py-4">Remaining</th>
                <th className="text-right px-6 py-4">Unit Cost</th>
                <th className="text-center px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map((b) => {
                const daysLeft = b.expiry_date ? Math.ceil((new Date(b.expiry_date).getTime() - Date.now()) / 86400000) : null;
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 font-mono text-slate-600">{b.batch_number}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{b.bar_inventory_items?.name || '—'}</td>
                    <td className="px-6 py-4 text-slate-500">{b.production_date}</td>
                    <td className="px-6 py-4">
                      {b.expiry_date ? (
                        <span className={daysLeft !== null && daysLeft <= 3 ? 'text-red-600 font-medium' : 'text-slate-600'}>
                          {b.expiry_date} {daysLeft !== null && `(${daysLeft}d)`}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-700 dark:text-slate-300">{b.remaining_qty}</td>
                    <td className="px-6 py-4 text-right text-slate-600">${b.unit_cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        b.status === 'active' ? 'bg-green-100 text-green-700' :
                        b.status === 'expired' ? 'bg-red-100 text-red-700' :
                        b.status === 'consumed' ? 'bg-slate-100 text-slate-500' :
                        'bg-amber-100 text-amber-700'
                      }`}>{b.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Transfers Tab ───────────────────────────────────────────────────────

function TransfersTab() {
  const selectedOutletId = useOutlet();
  const [transfers, setTransfers] = useState<BarTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<BarInventoryItem[]>([]);
  const [locations, setLocations] = useState<BarStorageLocation[]>([]);
  const [itemId, setItemId] = useState('');
  const [fromLoc, setFromLoc] = useState('');
  const [toLoc, setToLoc] = useState('');
  const [qty, setQty] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchBarTransfers(undefined, selectedOutletId || undefined)
      .then(data => setTransfers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  useEffect(() => {
    load();
    fetchBarInventory(undefined, selectedOutletId || undefined).then(data => setInventoryItems(Array.isArray(data) ? data : [])).catch(() => {});
    fetchBarStorageLocations(selectedOutletId || undefined).then(data => setLocations(Array.isArray(data) ? data : [])).catch(() => {});
  }, [load, selectedOutletId]);

  const handleCreate = async () => {
    if (!itemId || !toLoc || !qty) return;
    try {
      await createBarTransfer({
        inventory_item_id: itemId,
        outlet_id: selectedOutletId || undefined,
        from_location_id: fromLoc || undefined,
        to_location_id: toLoc,
        quantity: Number(qty),
        unit: inventoryItems.find(i => i.id === itemId)?.unit || 'ml',
      });
      setShowCreate(false);
      setItemId(''); setFromLoc(''); setToLoc(''); setQty('');
      load();
    } catch (e: any) { alert(e.message); }
  };

  const handleApprove = async (id: string) => {
    try { await approveBarTransfer(id, 'current_user'); load(); }
    catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bar Transfers</h3>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-tight hover:bg-indigo-700 transition cursor-pointer">
          + New Transfer
        </button>
      </div>
      {transfers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No transfers yet.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Transfer #</th>
                <th className="text-left px-6 py-4">Item</th>
                <th className="text-left px-6 py-4">From → To</th>
                <th className="text-right px-6 py-4">Qty</th>
                <th className="text-center px-6 py-4">Status</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {transfers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono text-slate-600">{t.transfer_number}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{t.bar_inventory_items?.name || '—'}</td>
                  <td className="px-6 py-4 text-slate-500">
                    {t.from_location?.name || '—'} → {t.to_location?.name || '—'}
                  </td>
                  <td className="px-6 py-4 text-right">{t.quantity} {t.unit}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      t.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      t.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      t.status === 'completed' ? 'bg-green-100 text-green-700' :
                      'bg-slate-100 text-slate-500'
                    }`}>{t.status}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {t.status === 'pending' && (
                      <button onClick={() => handleApprove(t.id)} className="text-blue-600 hover:text-blue-800 cursor-pointer">Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <ModalSystem isOpen={true} onClose={() => setShowCreate(false)} title="New Transfer" size="md" variant="form"
          confirmLabel="Create" onConfirm={handleCreate}>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-slate-500">Inventory Item</label>
              <select value={itemId} onChange={e => setItemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="">Select item...</option>
                {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500">From Location</label>
                <select value={fromLoc} onChange={e => setFromLoc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                  <option value="">—</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">To Location</label>
                <select value={toLoc} onChange={e => setToLoc(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                  <option value="">Select...</option>
                  {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Quantity</label>
              <input value={qty} onChange={e => setQty(e.target.value)} type="number"
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
          </div>
        </ModalSystem>
      )}
    </div>
  );
}

// ── Waste Tab (Spillage/Breakage) ───────────────────────────────────────

function WasteTab() {
  const selectedOutletId = useOutlet();
  const [waste, setWaste] = useState<BarWaste[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<BarInventoryItem[]>([]);
  const [itemId, setItemId] = useState('');
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('other');
  const [notes, setNotes] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    fetchBarWaste(undefined, selectedOutletId || undefined)
      .then(data => setWaste(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  useEffect(() => {
    load();
    fetchBarInventory(undefined, selectedOutletId || undefined).then(data => setInventoryItems(Array.isArray(data) ? data : [])).catch(() => {});
  }, [load, selectedOutletId]);

  const handleCreate = async () => {
    if (!itemId || !qty) return;
    try {
      await createBarWaste({
        inventory_item_id: itemId,
        outlet_id: selectedOutletId || undefined,
        quantity: Number(qty),
        unit: inventoryItems.find(i => i.id === itemId)?.unit || 'ml',
        reason, notes,
      });
      setShowCreate(false);
      setItemId(''); setQty(''); setReason('other'); setNotes('');
      load();
    } catch (e: any) { alert(e.message); }
  };

  const handleApprove = async (id: string) => {
    try { await approveBarWaste(id, 'current_user'); load(); }
    catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Spillage & Breakage</h3>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-tight hover:bg-indigo-700 transition cursor-pointer">
          + Log Spillage
        </button>
      </div>
      {waste.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No spillage records.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Item</th>
                <th className="text-right px-6 py-4">Qty</th>
                <th className="text-left px-6 py-4">Reason</th>
                <th className="text-right px-6 py-4">Cost</th>
                <th className="text-center px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Date</th>
                <th className="text-center px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {waste.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{w.bar_inventory_items?.name || '—'}</td>
                  <td className="px-6 py-4 text-right">{w.quantity} {w.unit}</td>
                  <td className="px-6 py-4 text-slate-500 capitalize">{w.reason.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4 text-right text-red-600">${w.cost_value.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      w.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      w.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>{w.status}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{new Date(w.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    {w.status === 'pending' && (
                      <button onClick={() => handleApprove(w.id)} className="text-green-600 hover:text-green-800 cursor-pointer">Approve</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <ModalSystem isOpen={true} onClose={() => setShowCreate(false)} title="Log Spillage / Breakage" size="md" variant="form"
          confirmLabel="Submit" onConfirm={handleCreate}>
          <div className="space-y-6">
            <div>
              <label className="text-xs font-medium text-slate-500">Inventory Item</label>
              <select value={itemId} onChange={e => setItemId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                <option value="">Select item...</option>
                {inventoryItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-500">Quantity</label>
                <input value={qty} onChange={e => setQty(e.target.value)} type="number"
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500">Reason</label>
                <select value={reason} onChange={e => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
                  <option value="breakage">Breakage</option>
                  <option value="spillage">Spillage</option>
                  <option value="over_pour">Over-Pour</option>
                  <option value="expired">Expired</option>
                  <option value="spoiled">Spoiled</option>
                  <option value="customer_return">Customer Return</option>
                  <option value="quality_issue">Quality Issue</option>
                  <option value="theft">Theft</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500">Notes</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
            </div>
          </div>
        </ModalSystem>
      )}
    </div>
  );
}

// ── Expiry Tab ──────────────────────────────────────────────────────────

function ExpiryTab() {
  const selectedOutletId = useOutlet();
  const [alerts, setAlerts] = useState<BarExpiryAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchBarExpiryAlerts(undefined, selectedOutletId || undefined)
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;

  const filtered = filter ? alerts.filter(a => a.expiry_status === filter) : alerts;

  const statusColors: Record<string, string> = {
    expired: 'bg-red-100 text-red-700',
    expiring_today: 'bg-orange-100 text-orange-700',
    expiring_soon: 'bg-amber-100 text-amber-700',
    fresh: 'bg-green-100 text-green-700',
    no_expiry: 'bg-slate-100 text-slate-500',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Expiry Management</h3>
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
          <option value="">All</option>
          <option value="expired">Expired</option>
          <option value="expiring_today">Expiring Today</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="fresh">Fresh</option>
        </select>
      </div>
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No expiry alerts.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Batch #</th>
                <th className="text-left px-6 py-4">Item</th>
                <th className="text-right px-6 py-4">Remaining</th>
                <th className="text-left px-6 py-4">Expiry Date</th>
                <th className="text-center px-6 py-4">Days Left</th>
                <th className="text-right px-6 py-4">Value at Risk</th>
                <th className="text-center px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filtered.map((a) => (
                <tr key={a.batch_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-mono text-slate-600">{a.batch_number}</td>
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{a.item_name}</td>
                  <td className="px-6 py-4 text-right">{a.remaining_qty}</td>
                  <td className="px-6 py-4 text-slate-500">{a.expiry_date || 'No expiry'}</td>
                  <td className="px-6 py-4 text-center">
                    {a.days_until_expiry !== null ? (
                      <span className={a.days_until_expiry <= 0 ? 'text-red-600 font-bold' : a.days_until_expiry <= 3 ? 'text-amber-600 font-medium' : 'text-slate-600'}>
                        {a.days_until_expiry}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">${a.total_value.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusColors[a.expiry_status]}`}>{a.expiry_status.replace(/_/g, ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Planning Tab ────────────────────────────────────────────────────────

function PlanningTab() {
  const selectedOutletId = useOutlet();
  const [plan, setPlan] = useState<BarProductionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarProductionPlan(selectedOutletId || undefined)
      .then(data => setPlan(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedOutletId]);

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Batch Prep Planning</h3>
      <p className="text-xs text-slate-500">Auto-generated suggestions based on occupancy, reservations, and stock levels.</p>
      {plan.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No suggestions. Add recipes and inventory to generate plans.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Recipe</th>
                <th className="text-right px-6 py-4">Current Stock</th>
                <th className="text-right px-6 py-4">Min Stock</th>
                <th className="text-right px-6 py-4">Forecast Demand</th>
                <th className="text-right px-6 py-4">Suggested Prep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {plan.map((p) => (
                <tr key={p.recipe_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{p.recipe_name}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{p.current_stock}</td>
                  <td className="px-6 py-4 text-right text-slate-500">{p.min_stock}</td>
                  <td className="px-6 py-4 text-right text-slate-600">{p.forecast_demand}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold ${p.suggested_qty > 0 ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {p.suggested_qty}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Settings Tab ────────────────────────────────────────────────────────

function SettingsTab() {
  const [settings, setSettings] = useState<BarSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBarSettings()
      .then(setSettings)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await updateBarSettings({
        consumption_method: settings.consumption_method,
        allow_negative_inventory: settings.allow_negative_inventory,
        enable_labor_costing: settings.enable_labor_costing,
        enable_auto_purchase_requests: settings.enable_auto_purchase_requests,
        expiry_alert_days: settings.expiry_alert_days,
        critical_expiry_days: settings.critical_expiry_days,
        over_pour_tolerance_ml: settings.over_pour_tolerance_ml,
      });
      alert('Settings saved.');
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;
  if (!settings) return <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-3xl p-12 text-center text-rose-600 dark:text-rose-400 text-sm font-bold">Failed to load settings.</div>;

  return (
    <div className="max-w-lg space-y-6">
      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Bar Settings</h3>
      <div className="space-y-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-3xl shadow-3xs">
        <div>
          <label className="text-xs font-medium text-slate-500">Consumption Method</label>
          <select value={settings.consumption_method} onChange={e => setSettings({ ...settings, consumption_method: e.target.value as any })}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
            <option value="fefo">FEFO (First Expired First Out)</option>
            <option value="fifo">FIFO (First In First Out)</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-500">Expiry Alert Days</label>
            <input type="number" value={settings.expiry_alert_days} onChange={e => setSettings({ ...settings, expiry_alert_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500">Critical Expiry Days</label>
            <input type="number" value={settings.critical_expiry_days} onChange={e => setSettings({ ...settings, critical_expiry_days: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">Over-Pour Tolerance (ml)</label>
          <input type="number" step="0.5" value={settings.over_pour_tolerance_ml} onChange={e => setSettings({ ...settings, over_pour_tolerance_ml: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
        </div>
        <div className="space-y-2">
          {[
            { key: 'allow_negative_inventory', label: 'Allow Negative Inventory' },
            { key: 'enable_labor_costing', label: 'Enable Labor Costing' },
            { key: 'enable_auto_purchase_requests', label: 'Auto-generate Purchase Requests' },
          ].map(opt => (
            <label key={opt.key} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={(settings as any)[opt.key]} onChange={e => setSettings({ ...settings, [opt.key]: e.target.checked } as any)}
                className="rounded" />
              {opt.label}
            </label>
          ))}
        </div>
        <button onClick={handleSave} disabled={saving}
          className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 cursor-pointer">
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

// ── Audit Tab ───────────────────────────────────────────────────────────

function AuditTab() {
  const selectedOutletId = useOutlet();
  const [logs, setLogs] = useState<BarAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchBarAuditLog(moduleFilter || undefined, 100, selectedOutletId || undefined)
      .then(data => setLogs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [moduleFilter, selectedOutletId]);

  if (loading) return <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm animate-pulse">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Audit Trail</h3>
        <select value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}
          className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
          <option value="">All Modules</option>
          <option value="recipes">Recipes</option>
          <option value="production">Production</option>
          <option value="inventory">Inventory</option>
          <option value="batches">Batches</option>
          <option value="transfers">Transfers</option>
          <option value="waste">Spillage</option>
        </select>
      </div>
      {logs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-400 text-sm">No audit entries.</div>
      ) : (
        <div className={"bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden shadow-3xs overflow-x-auto"}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="text-left px-6 py-4">Timestamp</th>
                <th className="text-left px-6 py-4">User</th>
                <th className="text-left px-6 py-4">Action</th>
                <th className="text-left px-6 py-4">Module</th>
                <th className="text-left px-6 py-4">Entity</th>
                <th className="text-left px-6 py-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">{log.user_id || 'system'}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-indigo-100 text-indigo-700">{log.action}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{log.module}</td>
                  <td className="px-6 py-4 font-mono text-slate-500">{log.entity_type}:{log.entity_id?.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-slate-400">{log.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
