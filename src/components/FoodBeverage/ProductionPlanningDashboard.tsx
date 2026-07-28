/**
 * Central Production Planning Dashboard
 * Phase 3 Item 1: Generate prep lists from forecast covers, save, approve, and push to KDS
 */
import { useState, useEffect, useCallback } from 'react';
import {
  fetchForecastCovers,
  generatePrepList,
  savePrepList,
  fetchPrepLists,
  approvePrepList,
  pushPrepListToKDS,
  type ForecastCover,
  type PrepListLine,
  type PrepList,
} from '../../services/productionPlanningService';
import { fetchPrepStations, type PrepStation } from '../../services/kitchenService';
import { CalendarDays, Users, Utensils, Wine, Send, CheckCircle, Loader2, ClipboardList } from 'lucide-react';

interface Props {
  outletId?: string | null;
}

export function ProductionPlanningDashboard({ outletId }: Props) {
  const [forecast, setForecast] = useState<ForecastCover[]>([]);
  const [prepLines, setPrepLines] = useState<PrepListLine[]>([]);
  const [savedLists, setSavedLists] = useState<PrepList[]>([]);
  const [prepStations, setPrepStations] = useState<PrepStation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [planningDate, setPlanningDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealPeriod, setMealPeriod] = useState('all');
  const [ppcKitchen, setPpcKitchen] = useState('0.5');
  const [ppcBar, setPpcBar] = useState('0.3');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [pushing, setPushing] = useState(false);

  const loadForecast = useCallback(async () => {
    if (!planningDate) return;
    try {
      const data = await fetchForecastCovers(planningDate, outletId || undefined);
      setForecast(data || []);
    } catch { /* ignore */ }
  }, [planningDate, outletId]);

  const loadLists = useCallback(async () => {
    try {
      const data = await fetchPrepLists(outletId || undefined, undefined, undefined);
      setSavedLists(data || []);
    } catch { /* ignore */ }
  }, [outletId]);

  const loadStations = useCallback(async () => {
    try {
      const data = await fetchPrepStations(outletId || undefined);
      setPrepStations(data || []);
    } catch { /* ignore */ }
  }, [outletId]);

  useEffect(() => {
    loadForecast();
    loadLists();
    loadStations();
  }, [loadForecast, loadLists, loadStations]);

  const handleGenerate = async () => {
    if (!outletId) { alert('Please select an outlet first'); return; }
    setGenerating(true);
    try {
      const data = await generatePrepList(
        outletId,
        planningDate,
        mealPeriod,
        parseFloat(ppcKitchen),
        parseFloat(ppcBar)
      );
      setPrepLines(data || []);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!outletId || prepLines.length === 0) return;
    setLoading(true);
    try {
      const forecastCovers = forecast.find(f => f.source === 'forecast')?.covers || 0;
      const resCovers = forecast.find(f => f.source === 'reservation')?.covers || 0;
      const banquetCovers = forecast.find(f => f.source === 'banquet')?.covers || 0;

      await savePrepList({
        outlet_id: outletId,
        prep_date: planningDate,
        meal_period: mealPeriod,
        source_type: 'forecast',
        forecast_covers: forecastCovers,
        reservation_covers: resCovers,
        banquet_covers: banquetCovers,
        total_demand: forecastCovers,
        created_by: 'current_user',
        lines: prepLines.map(l => ({
          recipe_id: l.recipe_id,
          recipe_source: l.recipe_source,
          recipe_name: l.recipe_name,
          yield_qty: l.yield_qty,
          yield_unit: l.yield_unit,
          covers: l.covers,
          portions_per_cover: l.portions_per_cover,
          forecast_qty: l.forecast_qty,
          current_stock_qty: l.current_stock_qty,
          suggested_production_qty: l.suggested_production_qty,
          prep_station_id: l.prep_station_id,
          cost_per_unit: l.cost_per_unit,
          estimated_total_cost: l.estimated_total_cost,
        })),
      });
      await loadLists();
      setPrepLines([]);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approvePrepList(id, 'current_user');
      await loadLists();
    } catch (e: any) { alert(e.message); }
  };

  const handlePushKDS = async (id: string) => {
    setPushing(true);
    try {
      const result = await pushPrepListToKDS(id);
      alert(`Pushed ${result.pushed} item(s) to KDS`);
      await loadLists();
    } catch (e: any) { alert(e.message); }
    finally { setPushing(false); }
  };

  const handleStationChange = (index: number, stationId: string) => {
    setPrepLines(prev => prev.map((l, i) =>
      i === index ? { ...l, prep_station_id: stationId || null } : l
    ));
  };

  const forecastCovers = forecast.find(f => f.source === 'forecast')?.covers || 0;
  const totalEstimatedCost = prepLines.reduce((sum, l) => sum + Number(l.estimated_total_cost), 0);

  const sourceIcon = (src: string) => src === 'kitchen' ? Utensils : Wine;
  const sourceBadge = (src: string) => src === 'kitchen' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700';

  const statusColors: Record<string, string> = {
    draft: 'bg-slate-100 text-slate-600',
    approved: 'bg-blue-100 text-blue-700',
    in_production: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Planning Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-5 h-5 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Central Production Planning</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Planning Date</label>
            <input type="date" value={planningDate} onChange={e => setPlanningDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Meal Period</label>
            <select value={mealPeriod} onChange={e => setMealPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900">
              <option value="all">All Day</option>
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="brunch">Brunch</option>
              <option value="tea_time">Tea Time</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Kitchen Portions/Cover</label>
            <input type="number" step="0.1" value={ppcKitchen} onChange={e => setPpcKitchen(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Bar Portions/Cover</label>
            <input type="number" step="0.1" value={ppcBar} onChange={e => setPpcBar(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold bg-white dark:bg-slate-900" />
          </div>
          <div className="flex items-end">
            <button onClick={handleGenerate} disabled={generating || !outletId}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-tight hover:bg-indigo-700 transition cursor-pointer disabled:opacity-50">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarDays className="w-4 h-4" />}
              Generate Prep List
            </button>
          </div>
        </div>

        {/* Forecast Summary */}
        {forecast.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {forecast.map(f => (
              <div key={f.source} className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">{f.source.replace('_', ' ')}</span>
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white">{f.covers}</p>
                <p className="text-[10px] text-slate-400">covers</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generated Prep List */}
      {prepLines.length > 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Generated Prep List</h4>
              <p className="text-[10px] text-slate-400">{prepLines.length} items • Est. cost: ${totalEstimatedCost.toFixed(2)}</p>
            </div>
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase hover:bg-green-700 transition cursor-pointer disabled:opacity-50">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Prep List
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="text-left px-3 py-2">Recipe</th>
                  <th className="text-center px-3 py-2">Source</th>
                  <th className="text-right px-3 py-2">Covers</th>
                  <th className="text-right px-3 py-2">Forecast</th>
                  <th className="text-right px-3 py-2">Stock</th>
                  <th className="text-right px-3 py-2">Suggested</th>
                  <th className="text-right px-3 py-2">Est. Cost</th>
                  <th className="text-center px-3 py-2">KDS Station</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {prepLines.map((line, i) => {
                  const Icon = sourceIcon(line.recipe_source);
                  return (
                    <tr key={`${line.recipe_source}-${line.recipe_id}`} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-3 h-3 text-slate-400" />
                          <span className="font-bold text-slate-900 dark:text-white">{line.recipe_name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 ml-5">{line.yield_qty} {line.yield_unit}</div>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${sourceBadge(line.recipe_source)}`}>{line.recipe_source}</span>
                      </td>
                      <td className="px-3 py-2 text-right">{line.covers}</td>
                      <td className="px-3 py-2 text-right">{line.forecast_qty.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right text-slate-500">{line.current_stock_qty.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right font-bold text-indigo-600">{line.suggested_production_qty.toFixed(1)}</td>
                      <td className="px-3 py-2 text-right">${Number(line.estimated_total_cost).toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <select value={line.prep_station_id || ''} onChange={e => handleStationChange(i, e.target.value)}
                          className="w-full px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] font-bold bg-white dark:bg-slate-900">
                          <option value="">—</option>
                          {prepStations.map(ps => <option key={ps.id} value={ps.id}>{ps.station_name}</option>)}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Saved Prep Lists */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Saved Prep Lists</h4>
        </div>
        {savedLists.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No saved prep lists yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50/50 dark:bg-slate-950/20 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="text-left px-3 py-2">Date</th>
                  <th className="text-left px-3 py-2">Meal</th>
                  <th className="text-right px-3 py-2">Forecast</th>
                  <th className="text-right px-3 py-2">Demand</th>
                  <th className="text-center px-3 py-2">Status</th>
                  <th className="text-center px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {savedLists.map(list => (
                  <tr key={list.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">{list.prep_date}</td>
                    <td className="px-6 py-3 text-slate-500">{list.meal_period}</td>
                    <td className="px-3 py-2 text-right">{list.forecast_covers}</td>
                    <td className="px-3 py-2 text-right">{list.total_demand}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${statusColors[list.status] || 'bg-slate-100'}`}>{list.status}</span>
                    </td>
                    <td className="px-3 py-2 text-center space-x-2">
                      {list.status === 'draft' && (
                        <button onClick={() => handleApprove(list.id)} className="text-blue-600 hover:text-blue-800 cursor-pointer text-[10px] font-bold">Approve</button>
                      )}
                      {list.status === 'approved' && (
                        <button onClick={() => handlePushKDS(list.id)} disabled={pushing}
                          className="text-indigo-600 hover:text-indigo-800 cursor-pointer text-[10px] font-bold inline-flex items-center gap-1">
                          <Send className="w-3 h-3" /> Push to KDS
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
