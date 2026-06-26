/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { supabaseService } from '../../services/supabaseService';
import {
  ShoppingBag,
  Boxes,
  TrendingUp,
  AlertTriangle,
  FileText,
  DollarSign,
  User,
  Users,
  Percent,
  CheckCircle2,
  Package,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Printer,
  Download,
  Send,
  Zap,
  RotateCcw,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// --- STYLING UTILITIES ---
const formatCurrency = (amt: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amt);
};

// ============================================================================
// PART 1: FRONT OFFICE MANAGER EXECUTIVE DASHBOARD WIDGETS
// ============================================================================
export function GiftShopSuppliesDashboardWidgets() {
  const [drillDown, setDrillDown] = useState<'none' | 'gift' | 'supplies'>('none');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* WIDGET A: GIFT SHOP KPIs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 p-6 rounded-3xl shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-full -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-110" />
          
          <div className="flex justify-between items-start mb-4">
            <span className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-full text-4xs font-mono font-black uppercase tracking-wider">
              <ShoppingBag size={10} /> Gift Shop KPIs
            </span>
            <button
              onClick={() => setDrillDown(drillDown === 'gift' ? 'none' : 'gift')}
              className="text-4xs font-mono font-extrabold text-indigo-650 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {drillDown === 'gift' ? 'Collapse' : 'Drill-Down'} <ArrowUpRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Today's Sales</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">$1,420</strong>
              <span className="text-[8px] text-emerald-600 font-semibold flex items-center md:gap-0.5 mt-0.5"><TrendingUp size={9} /> +12.4%</span>
            </div>
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Month-to-Date</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">$34,920</strong>
              <span className="text-[8px] text-emerald-600 font-semibold flex items-center md:gap-0.5 mt-0.5"><TrendingUp size={9} /> +8.2%</span>
            </div>
            <div className="p-3 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20">
              <span className="text-[9px] font-mono font-medium text-indigo-400 uppercase tracking-wider block">Gross Profit</span>
              <strong className="text-lg font-sans font-black text-indigo-750 dark:text-indigo-400 mt-1 block">$22,042</strong>
              <span className="text-[8px] font-mono font-extrabold text-indigo-500">63.1% Margin</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Top Selling Product:</span>
              <strong className="text-slate-700 dark:text-slate-350">Hotel Branded Hoodie (14 sold)</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Total Catalog Value:</span>
              <strong className="text-slate-700 dark:text-slate-350">$42,850 (Current Stock)</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Low Stock Alerts:</span>
              <strong className="text-rose-500 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">3 Items Below Min</strong>
            </div>
          </div>
        </div>

        {/* WIDGET B: OFFICE SUPPLIES KPIs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 p-6 rounded-3xl shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-full -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-110" />

          <div className="flex justify-between items-start mb-4">
            <span className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full text-4xs font-mono font-black uppercase tracking-wider">
              <Boxes size={10} /> Office Supplies KPIs
            </span>
            <button
              onClick={() => setDrillDown(drillDown === 'supplies' ? 'none' : 'supplies')}
              className="text-4xs font-mono font-extrabold text-emerald-650 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {drillDown === 'supplies' ? 'Collapse' : 'Drill-Down'} <ArrowUpRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Monthly Cost</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">$4,920</strong>
              <span className="text-[8px] text-emerald-600 font-semibold flex items-center md:gap-0.5 mt-0.5"><TrendingDown size={9} /> -10.5% Favorable</span>
            </div>
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Budget Util.</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">89.5%</strong>
              <span className="text-[8px] text-slate-400 font-mono">Of $5,500 Limit</span>
            </div>
            <div className="p-3 bg-emerald-50/20 dark:bg-emerald-950/10 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/20">
              <span className="text-[9px] font-mono font-medium text-emerald-400 uppercase tracking-wider block">Variance</span>
              <strong className="text-lg font-sans font-black text-emerald-700 dark:text-emerald-400 mt-1 block">-$580</strong>
              <span className="text-[8px] font-mono font-extrabold text-emerald-600">Under Budget</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">High Consumption category:</span>
              <strong className="text-slate-700 dark:text-slate-350">Keycards & Custom Envelopes</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Pending Requisitions:</span>
              <strong className="text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded">2 Active Requests</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Supplies Low Stock:</span>
              <strong className="text-rose-500 bg-rose-50 dark:bg-rose-950 px-1.5 py-0.5 rounded">4 Items Below Min</strong>
            </div>
          </div>
        </div>

      </div>

      {/* --- DRILL DOWN SECTION PANELS --- */}
      {drillDown === 'gift' && (
        <div className="p-6 bg-indigo-50/10 dark:bg-indigo-950/5 border border-indigo-150/40 dark:border-indigo-900/40 rounded-3xl animate-fade-in space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-indigo-100 dark:border-indigo-950">
            <h5 className="text-xs font-black text-indigo-950 dark:text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <ShoppingBag size={12} /> Gift Shop Sales Performance Deep-Dive Review
            </h5>
            <span className="text-4xs font-mono font-bold text-slate-400">Real-Time POS Sync Active</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Product Category Performance Breakdown</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Apparel & Logo', Sales: 3450, Margin: 65 },
                    { name: 'Souvenirs/Local Art', Sales: 2800, Margin: 72 },
                    { name: 'Drinks & Snacks', Sales: 1240, Margin: 45 },
                    { name: 'Luxury Skincare', Sales: 1000, Margin: 60 }
                  ]} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Bar name="Sales Revenue ($)" dataKey="Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Product Stock Status Check</span>
              <div className="space-y-2 select-none">
                <div className="p-2 border border-rose-100 dark:border-rose-950/40 rounded-xl bg-rose-50/20 dark:bg-rose-950/10 text-3xs font-mono space-y-0.5 text-rose-700 dark:text-rose-400">
                  <div className="flex justify-between font-bold">
                    <span>• Elite Keycard Holders</span>
                    <span>12 units left</span>
                  </div>
                  <p className="text-[9px] text-rose-500">Min stock level: 30 units. Action: Order 50 units (Lead time 5 days).</p>
                </div>
                <div className="p-2 border border-rose-100 dark:border-rose-950/40 rounded-xl bg-rose-50/20 dark:bg-rose-950/10 text-3xs font-mono space-y-0.5 text-rose-700 dark:text-rose-400">
                  <div className="flex justify-between font-bold">
                    <span>• Hotel Water Bottles</span>
                    <span>4 units left</span>
                  </div>
                  <p className="text-[9px] text-rose-500">Min stock level: 10 units. Action: Reorder requested (PO-2026-092).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {drillDown === 'supplies' && (
        <div className="p-6 bg-emerald-50/10 dark:bg-emerald-950/5 border border-emerald-150/40 dark:border-emerald-900/40 rounded-3xl animate-fade-in space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-100/50 dark:border-emerald-950">
            <h5 className="text-xs font-black text-emerald-950 dark:text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Boxes size={12} /> Front Office supplies distribution breakdown
            </h5>
            <span className="text-4xs font-mono font-bold text-slate-400">Monthly budget: $5,500</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Department Supplies Consumption (MTD)</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Front Desk', Cost: 2100, Budget: 2200 },
                    { name: 'Concierge Office', Cost: 1020, Budget: 1300 },
                    { name: 'Administration', Cost: 1800, Budget: 2000 }
                  ]} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Bar name="Actual Cost ($)" dataKey="Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar name="Budget Limit ($)" dataKey="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Low Stock Supplies Alerts</span>
              <div className="space-y-2 select-none">
                <div className="p-2 border border-rose-100 dark:border-rose-950/40 rounded-xl bg-rose-50/20 dark:bg-rose-950/10 text-3xs font-mono space-y-0.5 text-rose-700 dark:text-rose-400">
                  <div className="flex justify-between font-bold">
                    <span>• High-Speed Thermal Rolls</span>
                    <span>15 rolls</span>
                  </div>
                  <p className="text-[9px] text-rose-500">Below minimun level (40 rolls). Est. days remaining: 4 days.</p>
                </div>
                <div className="p-2 border border-rose-100 dark:border-rose-950/40 rounded-xl bg-rose-50/20 dark:bg-rose-950/10 text-3xs font-mono space-y-0.5 text-rose-700 dark:text-rose-400">
                  <div className="flex justify-between font-bold">
                    <span>• Front Office A4 Letterheads</span>
                    <span>1 pack</span>
                  </div>
                  <p className="text-[9px] text-rose-500">Below minimun level (5 packs). Recommended reorder: 10 packs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ============================================================================
// PART 2: OPERATIONS MANAGER EXECUTIVE SUMMARY PANEL
// ============================================================================
export function OperationsManagerExecutiveSummarySection() {
  return (
    <div className="space-y-5 p-5 border border-slate-200/80 dark:border-slate-850 rounded-2xl bg-slate-50/10 dark:bg-slate-950/10 animate-fade-in">
      <div className="flex justify-between items-start border-b border-slate-150 dark:border-slate-850 pb-3">
        <div>
          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest font-mono">
            6. Gift Shop & Front Office Supplies Performance
          </h4>
          <p className="text-[9px] text-slate-450 mt-0.5 font-mono">Consolidated operational inventory and material metrics.</p>
        </div>
        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900 rounded text-[9px] font-mono font-bold">
          Favorable Variance
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block">Gift Shop Revenue</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$34,920</strong>
          <span className="text-[8px] font-mono text-emerald-600 font-bold block mt-0.5">+12.4% vs Baseline</span>
        </div>

        {/* Metric 2 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block">Retail Gross Profit</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$22,042</strong>
          <span className="text-[8px] font-mono text-indigo-600 font-bold block mt-0.5">63.1% Profit Margin</span>
        </div>

        {/* Metric 3 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block font-mono">Total Inventory Value</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$42,850</strong>
          <span className="text-[8px] font-mono text-slate-500 block mt-0.5">$34,800 Retail / $8,050 Supplies</span>
        </div>

        {/* Metric 4 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block">Supplies Cost (MTD)</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$4,920</strong>
          <span className="text-[8px] font-mono text-emerald-600 font-bold block mt-0.5">-10.5% Under Budget ($5,500)</span>
        </div>

      </div>

      <div className="p-4 border border-indigo-100/50 dark:border-indigo-950/40 rounded-xl bg-indigo-500/5 text-3xs font-mono space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="font-bold text-indigo-950 dark:text-indigo-400 block border-b pb-1">Supplies Consumed Summary</span>
            <ul className="space-y-1 text-slate-650 dark:text-slate-405 leading-relaxed">
              <li className="flex justify-between"><span>Total Units Issued:</span> <strong>125 items</strong></li>
              <li className="flex justify-between"><span>Top Dept Usage:</span> <strong>Front Desk (43%)</strong></li>
              <li className="flex justify-between"><span>High Consumption:</span> <strong className="text-indigo-650">Guest Keycards</strong></li>
            </ul>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-rose-700 block border-b pb-1">Low Stock Risks & Alerts</span>
            <ul className="space-y-1 text-rose-650 dark:text-rose-455 leading-relaxed">
              <li className="flex justify-between"><span>Items Below Min:</span> <strong className="text-rose-600">3 GS / 4 Supplies</strong></li>
              <li className="flex justify-between"><span>Critical Supplies:</span> <strong>A4 Custom Blankets</strong></li>
              <li className="flex justify-between"><span>Est Days Remaining:</span> <strong className="text-rose-750">3-4 days left</strong></li>
            </ul>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-emerald-800 dark:text-emerald-400 block border-b pb-1">Recommended Manager Actions</span>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-normal">
              1. Approve pending requisitions for 10 packs of Front Office custom letterheads.
              2. Consolidate thermal rolls purchase from local stationers to grab bulk 15% discount.
              3. Run promo push on "Local Art Mugs" to release $1,200 dead stock value.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PART 3: DETAILED OPERATIONAL REPORTS SPREADSHEEET RENDERER
// ============================================================================
interface ReportRendererProps {
  reportId: string;
  selectedDate: string;
}

export function GiftShopSuppliesDailyReportRenderer({ reportId, selectedDate }: ReportRendererProps) {
  const [shopIssues, setShopIssues] = useState<any[]>([]);
  const [shopSales, setShopSales] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const toDate = selectedDate ? new Date(new Date(selectedDate).getTime() + 86400000).toISOString() : undefined;
        const [sales, issues] = await Promise.all([
          supabaseService.fetchGiftShopSales(selectedDate || undefined, toDate),
          supabaseService.fetchGiftShopIssues()
        ]);
        setShopSales(sales);
        setShopIssues(issues.map((i: any) => ({
          ...i,
          productId: i.product_id,
          productName: i.product_name,
          itemCost: Number(i.item_cost)
        })));
      } catch (e) {
        console.error('Failed to load gift shop report data:', e);
      }
    };
    load();
  }, [selectedDate]);

  const getProductMovement = (productCode: string, productName: string, fallbackBaseStock: number) => {
    let currentVal = fallbackBaseStock;
    if (typeof window !== 'undefined') {
      const savedItems = localStorage.getItem('hotel_erp_inventory_items');
      if (savedItems) {
        try {
          const items = JSON.parse(savedItems);
          const found = items.find((i: any) => i.code === productCode);
          if (found) {
            currentVal = found.currentStock;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }

    let soldQty = 0;
    shopSales.forEach((s: any) => {
      s.items.forEach((it: any) => {
        if (it.productName.toLowerCase().includes(productName.toLowerCase()) || productName.toLowerCase().includes(it.productName.toLowerCase())) {
          soldQty += it.quantity;
        }
      });
    });

    let damagedQty = 0;
    let brokenQty = 0;
    let lostQty = 0;
    shopIssues.forEach((iss: any) => {
      if (iss.productId === productCode) {
        if (iss.type === 'Damaged') damagedQty += iss.quantity;
        if (iss.type === 'Broken') brokenQty += iss.quantity;
        if (iss.type === 'Lost') lostQty += iss.quantity;
      }
    });

    const totalDamaged = damagedQty + brokenQty;
    const openingStock = currentVal + soldQty + totalDamaged + lostQty;

    return {
      opening: openingStock,
      sold: soldQty,
      adjusted: lostQty > 0 ? `-${lostQty} lost` : '0',
      damaged: totalDamaged,
      closing: currentVal
    };
  };

  const cross = getProductMovement('GS-STONE-CROSS', 'Soapstone Cross', 6);
  const pot = getProductMovement('GS-CLAY-COFFEE', 'Clay Coffee Pot', 9);
  const scarf = getProductMovement('GS-COTTON-SCARF', 'Cotton Scarf', 12);
  const honey = getProductMovement('GS-WHITE-HONEY', 'White Honey', 18);
  const coffee = getProductMovement('GS-TEFF-COFFEE', 'Teff Coffee', 15);

  if (reportId === 'rep-gs-sales') {
    // -------------------------------------------------------------
    // REPORT 1: GIFT SHOP DAILY SALES REPORT
    // -------------------------------------------------------------
    return (
      <div className="space-y-5 text-xs">
        
        {/* Mini stats cards strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Total Daily Sales</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">$1,420</strong>
            <p className="text-[8px] text-indigo-650 font-mono mt-0.5">Target: $1,200 / day</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium font-mono">Transactions Volume</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">42 sales</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">Average checkout size</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Avg Transaction Val</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">$33.81</strong>
            <p className="text-[8px] text-emerald-600 font-mono mt-0.5">Up +4.2% from yesterday</p>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-indigo-400 block font-bold">Total Gross Margin</span>
            <strong className="text-base font-sans font-black text-indigo-950 dark:text-indigo-300 block mt-1">$894</strong>
            <p className="text-[8px] font-mono text-indigo-600">63.0% Net Profit Level</p>
          </div>
        </div>

        {/* Splits and Staff Lists columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
          
          <div className="p-4 border dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block">Payments Distribution</span>
            <div className="space-y-2 text-3xs font-mono">
              <div className="flex justify-between border-b pb-1">
                <span>Cash Payments Collect:</span>
                <strong>$280 (19.7%)</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Credit/Debit Cards:</span>
                <strong className="text-indigo-600">$840 (59.2%)</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Room Charges Posted:</span>
                <strong className="text-emerald-600">$300 (21.1%)</strong>
              </div>
              <div className="flex justify-between border-b pb-1 text-slate-400 select-none">
                <span>Discounts Granted:</span>
                <span>$45 (3 claims)</span>
              </div>
              <div className="flex justify-between text-rose-500 font-bold">
                <span>Refunds Processed:</span>
                <span>-$35 (1 voucher returned)</span>
              </div>
            </div>
          </div>

          <div className="p-4 border dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block">Sales Revenue by Staff On-Duty</span>
            <div className="space-y-2 text-3xs font-mono">
              <div className="flex justify-between border-b pb-1">
                <span className="flex items-center gap-1"><User size={10} className="text-slate-400" /> Elena B. (Front Desk)</span>
                <strong>$520 (15 trans)</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="flex items-center gap-1"><User size={10} className="text-slate-400" /> Dawit T. (Reception)</span>
                <strong>$480 (14 trans)</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="flex items-center gap-1"><User size={10} className="text-slate-400" /> Abel G. (Audit Duty)</span>
                <strong>$420 (13 trans)</strong>
              </div>
              <div className="flex justify-between text-slate-400 pt-1">
                <span>Total Register Crew:</span>
                <span>3 clerks active</span>
              </div>
            </div>
          </div>

        </div>

        {/* Selling products tables */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-indigo-650 block">Product Item Velocity Analysis</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top items */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[9px] font-mono font-bold text-slate-500 border-b border-slate-150 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Top Selling Items
              </div>
              <table className="w-full text-3xs font-mono leading-normal">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40"><td className="px-3 py-2">Hotel Branded Logo Hoodie</td><td className="px-3 py-2 text-center text-slate-450">14 sold</td><td className="px-3 py-2 text-right font-black">$490</td></tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40"><td className="px-3 py-2">Handmade Local Art Mug</td><td className="px-3 py-2 text-center text-slate-450">8 sold</td><td className="px-3 py-2 text-right font-black">$160</td></tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40"><td className="px-3 py-2">Premium Hotel Water Flask</td><td className="px-3 py-2 text-center text-slate-450">7 sold</td><td className="px-3 py-2 text-right font-black">$140</td></tr>
                </tbody>
              </table>
            </div>

            {/* Slow moving items */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[9px] font-mono font-bold text-slate-500 border-b border-slate-150 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Slow Moving Items (Action Needed)
              </div>
              <table className="w-full text-3xs font-mono leading-normal">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40"><td className="px-3 py-2">Custom Beaded Keyring</td><td className="px-3 py-2 text-center text-slate-450">1 sold / week</td><td className="px-3 py-2 text-right text-slate-500">Run bundle offer</td></tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40"><td className="px-3 py-2">Branded Leather Luggage Tag</td><td className="px-3 py-2 text-center text-slate-450">2 sold / mo</td><td className="px-3 py-2 text-right text-slate-500">Reposition in shelf</td></tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-850/40"><td className="px-3 py-2">Postcard Hotel Packs</td><td className="px-3 py-2 text-center text-slate-450">3 sold / mo</td><td className="px-3 py-2 text-right text-slate-500">Include in welcome packet</td></tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    );
  }

  if (reportId === 'rep-gs-recon') {
    // -------------------------------------------------------------
    // REPORT 2: GIFT SHOP CASH RECONCILIATION REPORT
    // -------------------------------------------------------------
    return (
      <div className="space-y-4 text-xs font-mono">
        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block border-b pb-1">Register Drawer Reconciliation Records</span>

        <table className="w-full text-3xs line-normal border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 text-[9px] uppercase border-b border-slate-150 dark:border-slate-800 text-slate-450">
              <th className="py-2 px-3 text-left">Cash Reconciliation Column</th>
              <th className="py-2 px-3 text-right">System Booked Value</th>
              <th className="py-2 px-3 text-right">Physical Counted Value</th>
              <th className="py-2 px-3 text-right">Variance Drift</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-350">1. Opening Cash Float (Drawer Base)</td>
              <td className="py-2.5 px-3 text-right text-slate-500">$250.00</td>
              <td className="py-2.5 px-3 text-right text-slate-500">$250.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-350">2. Recorded Cash Sales Received Today</td>
              <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">+$280.00</td>
              <td className="py-2.5 px-3 text-right text-emerald-600 font-bold">+$280.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-350">3. Deducted Cash Refunds Dispensed</td>
              <td className="py-2.5 px-3 text-right text-rose-500 font-bold">-$35.00</td>
              <td className="py-2.5 px-3 text-right text-rose-500 font-bold">-$35.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20 font-bold">
              <td className="py-2.5 px-3 text-slate-900 dark:text-white uppercase text-[9px] tracking-wider">4. Expected Cash Balance in Drawer</td>
              <td className="py-2.5 px-3 text-right">$495.00</td>
              <td className="py-2.5 px-3 text-right">$495.00</td>
              <td className="py-2.5 px-3 text-right text-emerald-600 font-black">$0.00 (Balanced)</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-350">5. Cash Deposited to Safe (Envelope Drop)</td>
              <td className="py-2.5 px-3 text-right text-indigo-500">-$245.00</td>
              <td className="py-2.5 px-3 text-right text-indigo-500">-$245.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr className="bg-indigo-50/20 dark:bg-indigo-950/20 font-bold text-indigo-900 dark:text-indigo-400">
              <td className="py-2.5 px-3 uppercase text-[9px] tracking-wider">6. Closing Cash Float Left in Drawer</td>
              <td className="py-2.5 px-3 text-right">$250.00</td>
              <td className="py-2.5 px-3 text-right">$250.00</td>
              <td className="py-2.5 px-3 text-right text-indigo-600 font-black">$0.00</td>
            </tr>
          </tbody>
        </table>

        <div className="p-3 border border-emerald-100 dark:border-emerald-900 bg-emerald-50/20 dark:bg-emerald-950/15 rounded-xl text-3xs text-emerald-700 dark:text-emerald-400 leading-normal">
          <strong>Daily Reconciliation Status: PERFECTLY RECONCILED.</strong> Cash audit confirms no physical variances. Clerk Abel G. signed at Shift-B handoff. Safe drop envelope number: ENV-GS-2026-31.
        </div>
      </div>
    );
  }

  if (reportId === 'rep-gs-inventory') {
    // -------------------------------------------------------------
    // REPORT 3: DAILY INVENTORY MOVEMENT REPORT
    // -------------------------------------------------------------
    return (
      <div className="space-y-4 text-xs font-mono">
        <div className="flex justify-between items-center border-b pb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Catalog Inventory Movements Today</span>
          <span className="text-4xs text-indigo-500 font-bold">Total SKUs: 18 Active</span>
        </div>

        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2 px-3">Product Description / SKU</th>
                <th className="py-2 px-2 text-center">Opening Stock</th>
                <th className="py-2 px-2 text-center">Received Stock</th>
                <th className="py-2 px-2 text-center text-indigo-600 font-bold">Stock Sold</th>
                <th className="py-2 px-2 text-center text-amber-600">Adjusted (+/-)</th>
                <th className="py-2 px-2 text-center text-rose-500 font-bold">Damaged Stock</th>
                <th className="py-2 px-3 text-right text-slate-900 dark:text-white font-bold">Closing Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900 select-none font-sans">
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">Soapstone Cross</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{cross.opening} units</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-mono">0 units</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-600">-{cross.sold} units</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{cross.adjusted}</td>
                <td className="py-2.5 px-2 text-center text-rose-500 font-mono font-bold">{cross.damaged > 0 ? `-${cross.damaged} units` : '0 units'}</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200 font-mono">{cross.closing} units</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">Traditional Clay Coffee Pot (Jebena)</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{pot.opening} units</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-mono">0 units</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-600">-{pot.sold} units</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{pot.adjusted}</td>
                <td className="py-2.5 px-2 text-center text-rose-500 font-mono font-bold">{pot.damaged > 0 ? `-${pot.damaged} units` : '0 units'}</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200 font-mono">{pot.closing} units</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">Pure Cotton Handwoven Scarf</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{scarf.opening} units</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-mono">0 units</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-600">-{scarf.sold} units</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{scarf.adjusted}</td>
                <td className="py-2.5 px-2 text-center text-rose-500 font-mono font-bold">{scarf.damaged > 0 ? `-${scarf.damaged} units` : '0 units'}</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200 font-mono">{scarf.closing} units</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">Organic White Honey Jar 500g</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{honey.opening} jars</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-mono">0 jars</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-600">-{honey.sold} jars</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{honey.adjusted}</td>
                <td className="py-2.5 px-2 text-center text-rose-500 font-mono font-bold">{honey.damaged > 0 ? `-${honey.damaged} jars` : '0 jars'}</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200 font-mono">{honey.closing} jars</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-bold text-slate-900 dark:text-white">Brewed Teff Bean Coffee (250g)</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{coffee.opening} bags</td>
                <td className="py-2.5 px-2 text-center text-slate-400 font-mono">0 bags</td>
                <td className="py-2.5 px-2 text-center font-mono font-bold text-indigo-600">-{coffee.sold} bags</td>
                <td className="py-2.5 px-2 text-center text-slate-500 font-mono">{coffee.adjusted}</td>
                <td className="py-2.5 px-2 text-center text-rose-500 font-mono font-bold">{coffee.damaged > 0 ? `-${coffee.damaged} bags` : '0 bags'}</td>
                <td className="py-2.5 px-3 text-right font-black text-slate-800 dark:text-slate-200 font-mono">{coffee.closing} bags</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[9px] text-slate-400 select-none">
          *Note: Damaged stock items are registered, quarantined for review, and written off under custom general ledger rules. Reclassification audit certified.
        </p>
      </div>
    );
  }

  if (reportId === 'rep-fo-supplies') {
    // -------------------------------------------------------------
    // REPORT 4: DAILY OFFICE SUPPLIES CONSUMPTION REPORT
    // -------------------------------------------------------------
    return (
      <div className="space-y-4 text-xs font-mono">
        <div className="flex justify-between items-center border-b pb-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Supplies Issued & Department Distribution Today</span>
          <span className="text-4xs text-emerald-600 font-bold">Total Daily Consumption Cost: $128.50</span>
        </div>

        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-801">
                <th className="py-2 px-3">Issued Item</th>
                <th className="py-2 px-3">Staff Member Receiving</th>
                <th className="py-2 px-2">Department</th>
                <th className="py-2 px-3 text-center">Qty Consumed</th>
                <th className="py-2 px-3 text-right">Cost Consumed</th>
                <th className="py-2 px-3 text-right">Remaining Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900 select-none">
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">Premium Guest Keycards</td>
                <td className="py-2 px-3">Elena B.</td>
                <td className="py-2 px-2">Front Desk Checkin</td>
                <td className="py-2 px-3 text-center">45 pieces</td>
                <td className="py-2 px-3 text-right font-black">$90.00</td>
                <td className="py-2 px-3 text-right text-slate-500">120 units</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">A4 Custom Office paper packs</td>
                <td className="py-2 px-3">Dawit T.</td>
                <td className="py-2 px-2">Back-Office Admin</td>
                <td className="py-2 px-3 text-center">2 packs</td>
                <td className="py-2 px-3 text-right font-black">$16.00</td>
                <td className="py-2 px-3 text-right text-rose-500">1 pack</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">High-Speed Thermal Rolls (80mm)</td>
                <td className="py-2 px-3">Elena B.</td>
                <td className="py-2 px-2">Front Desk POS</td>
                <td className="py-2 px-3 text-center">3 rolls</td>
                <td className="py-2 px-3 text-right font-black">$10.50</td>
                <td className="py-2 px-3 text-right text-rose-500">15 rolls</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-sans font-bold text-slate-900 dark:text-white">Branded Guest Pens</td>
                <td className="py-2 px-3">Abel G.</td>
                <td className="py-2 px-2">Concierge Desk</td>
                <td className="py-2 px-3 text-center">12 pieces</td>
                <td className="py-2 px-3 text-right font-black">$12.00</td>
                <td className="py-2 px-3 text-right text-rose-500">6 pieces</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 border border-indigo-100 dark:border-indigo-900 bg-indigo-50/20 dark:bg-indigo-950/15 rounded-xl text-3xs text-indigo-700 dark:text-indigo-400">
          <strong>Supplies Low Stock Alert:</strong> A4 Office paper packs and Branded Guest Pens are below the safe operational threshold of 5 units. Reorder dispatch is highly recommended.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-slate-400">
      Select a daily report from the menu to see operational ledger records.
    </div>
  );
}

// ============================================================================
// PART 4: WEEKLY / MONTHLY / QUARTERLY DEEP DIVE REVIEW COMPONENT
// ============================================================================
interface DeepDiveProps {
  timeframe: 'weekly' | 'monthly' | 'quarterly';
}

export function GiftShopSuppliesDeepDiveReview({ timeframe }: DeepDiveProps) {
  const [activeSegment, setActiveSegment] = useState<'retail' | 'supplies' | 'reorder' | 'statement'>(
    timeframe === 'quarterly' ? 'statement' : 'retail'
  );
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const triggerLocalExport = (type: string) => {
    setIsExporting(`Generating ${type} report export for Gift Shop & Supplies...`);
    setTimeout(() => {
      setIsExporting(null);
    }, 1800);
  };

  const getTitle = () => {
    if (timeframe === 'weekly') return 'Weekly Gift Shop & Supplies Performance';
    if (timeframe === 'monthly') return 'Monthly Retail & Supplies Financial Statement';
    return 'Quarterly Retail Business & Consumables Audit Review';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-6 rounded-3xl shadow-3xs space-y-5 animate-fade-in">
      
      {/* Header Block with Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-150 dark:border-slate-850 pb-4">
        <div>
          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">{timeframe} Segment Audit</span>
          <h4 className="text-base font-sans font-black text-slate-950 dark:text-white uppercase tracking-tight">{getTitle()}</h4>
          <p className="text-xs text-slate-400 mt-0.5">Aggregate margins, reordering schedules, and cost optimization opportunities.</p>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={() => triggerLocalExport('PDF')}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-100 transition"
          >
            <Download size={11} /> PDF Export
          </button>
          <button 
            onClick={() => triggerLocalExport('Excel')}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-white rounded-xl text-3xs font-mono font-bold flex items-center gap-1 cursor-pointer hover:bg-slate-100 transition"
          >
            <Layers size={11} className="text-emerald-500" /> Excel Sheet
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-3xs font-mono font-bold rounded-xl animate-pulse">
          {isExporting}
        </div>
      )}

      {/* Local Segment Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-0.5 rounded-xl border dark:border-slate-800 w-full md:w-max gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveSegment('retail')}
          className={`px-3 py-2 rounded-lg text-4xs font-mono font-black uppercase transition block shrink-0 ${
            activeSegment === 'retail'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-3xs'
              : 'text-slate-500 hover:text-slate-805'
          }`}
        >
          {timeframe === 'weekly' ? 'Weekly Retail Sales' : timeframe === 'monthly' ? 'Monthly Profitability Limit' : 'Retail Growth & Seasonality'}
        </button>
        <button
          onClick={() => setActiveSegment('supplies')}
          className={`px-3 py-2 rounded-lg text-4xs font-mono font-black uppercase transition block shrink-0 ${
            activeSegment === 'supplies'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-3xs'
              : 'text-slate-500 hover:text-slate-805'
          }`}
        >
          {timeframe === 'weekly' ? 'Supplies Usage Alerts' : timeframe === 'monthly' ? 'Supplies Cost vs Budget' : 'Consumables & Waste Analysis'}
        </button>
        <button
          onClick={() => setActiveSegment('reorder')}
          className={`px-3 py-2 rounded-lg text-4xs font-mono font-black uppercase transition block shrink-0 ${
            activeSegment === 'reorder'
              ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-3xs'
              : 'text-slate-500 hover:text-slate-805'
          }`}
        >
          {timeframe === 'weekly' ? 'Low Stock & Reorders' : timeframe === 'monthly' ? 'Inventory Valuations' : 'Cost Savings & Actions'}
        </button>
        {timeframe === 'quarterly' && (
          <button
            onClick={() => setActiveSegment('statement')}
            className={`px-3 py-2 rounded-lg text-4xs font-mono font-black uppercase transition block shrink-0 ${
              activeSegment === 'statement'
                ? 'bg-white dark:bg-slate-900 text-slate-950 dark:text-white shadow-3xs'
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Financial Statement
          </button>
        )}
      </div>

      {/* --- SEGMENT A: RETAIL BUSINESS (WEEKLY/MONTHLY/QUARTERLY) --- */}
      {activeSegment === 'retail' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            <div className="p-4 border dark:border-slate-850 rounded-2xl space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Financial Summary Metrics</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[9px] font-mono block">Total Revenue</span>
                  <strong className="text-xl font-sans font-black text-slate-900 dark:text-white">
                    {timeframe === 'weekly' ? '$8,490' : timeframe === 'monthly' ? '$35,420' : '$112,650'}
                  </strong>
                  <span className="text-[8px] text-emerald-600 block flex items-center md:gap-0.5 mt-0.5"><TrendingUp size={9} /> {timeframe === 'weekly' ? '+11.8%' : timeframe === 'monthly' ? '+8.2%' : '+15.4%'} Growth</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[9px] font-mono block">Gross Profit</span>
                  <strong className="text-xl font-sans font-black text-indigo-700 dark:text-indigo-400">
                    {timeframe === 'weekly' ? '$5,094' : timeframe === 'monthly' ? '$21,252' : '$67,590'}
                  </strong>
                  <span className="text-[8px] text-slate-450 block font-mono">Margin: {timeframe === 'weekly' ? '60.0%' : timeframe === 'monthly' ? '60.0%' : '60.0%'} Margin</span>
                </div>
              </div>
              
              <div className="pt-2 border-t text-3xs font-mono space-y-1 text-slate-550 select-none">
                <p>• Best Selling: <strong className="text-slate-800 dark:text-slate-200">Branded Hoodies & Bags</strong> ({timeframe === 'weekly' ? '82 sold' : '340 sold'})</p>
                <p>• Slowest Selling: <strong className="text-slate-850">Beaded Keyrings, Leather luggage tags</strong></p>
                <p>• Inventory Turnover Ratio: <strong>{timeframe === 'weekly' ? '0.6x / wk' : timeframe === 'monthly' ? '2.4x / mo' : '7.8x / qtr'}</strong></p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Financial Sales Trend</span>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={
                    timeframe === 'weekly' || timeframe === 'monthly' 
                      ? [
                          { name: 'Mon', Revenue: 1100, Margin: 660 },
                          { name: 'Tue', Revenue: 950, Margin: 570 },
                          { name: 'Wed', Revenue: 1300, Margin: 780 },
                          { name: 'Thu', Revenue: 1200, Margin: 720 },
                          { name: 'Fri', Revenue: 1500, Margin: 900 },
                          { name: 'Sat', Revenue: 1800, Margin: 1080 },
                          { name: 'Sun', Revenue: 1400, Margin: 840 }
                        ]
                      : [
                          { name: 'Month 1', Revenue: 34000, Margin: 20400 },
                          { name: 'Month 2', Revenue: 38000, Margin: 22800 },
                          { name: 'Month 3', Revenue: 40650, Margin: 24390 }
                        ]
                  } margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Line name="Gross Revenue ($)" type="monotone" dataKey="Revenue" stroke="#4f46e5" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SEGMENT B: SUPPLIES MANAGEMENT (WEEKLY/MONTHLY/QUARTERLY) --- */}
      {activeSegment === 'supplies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="p-4 border dark:border-slate-850 rounded-2xl bg-slate-50/20 dark:bg-slate-900/10 space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block border-b pb-1">Supplies Cost analysis</span>
              <div className="text-3xs font-mono space-y-2">
                <div className="flex justify-between border-b pb-1">
                  <span>Printing, Paper & Stationery:</span>
                  <strong>$1,850 ({timeframe === 'weekly' ? '$430/wk' : '$1,850/mo'})</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Guest Keycards & Envelopes:</span>
                  <strong>$1,560 ({timeframe === 'weekly' ? '$360/wk' : '$1,560/mo'})</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Register Roll & Stapler Staples:</span>
                  <strong>$920 ({timeframe === 'weekly' ? '$210/wk' : '$920/mo'})</strong>
                </div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                  <span>Total Supplies Cost:</span>
                  <span>{timeframe === 'weekly' ? '$1,240' : timeframe === 'monthly' ? '$4,923' : '$15,410'}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-rose-100/60 dark:border-rose-950/40 rounded-2xl bg-rose-500/5 space-y-3 leading-relaxed">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-600 block flex items-center gap-1"><AlertTriangle size={12} /> Abnormal Consumption & Waste Alerts</span>
              <div className="text-3xs font-mono space-y-2.5">
                <div className="p-2 border border-rose-100/60 rounded-xl bg-white dark:bg-slate-950">
                  <div className="flex justify-between font-bold text-rose-700">
                    <span>1. High Printing Prints Detected</span>
                    <span>Admin Back-Office</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-0.5">Concierge desk consumed 150 card envelopes within a 2-hour bracket on Wednesday checkout peak. Verify batch printing tasks.</p>
                </div>
                <div className="p-2 border border-rose-100/60 rounded-xl bg-white dark:bg-slate-950">
                  <div className="flex justify-between font-bold text-rose-700">
                    <span>2. Keycards Wastage Margin</span>
                    <span>Front Desk Check-in</span>
                  </div>
                  <p className="text-[9px] text-slate-500 mt-0.5">Physical card losses increased by 8% due to unreturned custom keycards during express checkout peak. Implement keycard recycling containers.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SEGMENT C: REORDER & INVENTORY VALUATION (WEEKLY/MONTHLY/QUARTERLY) --- */}
      {activeSegment === 'reorder' && (
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-650 block border-b pb-1">
            {timeframe === 'weekly' ? 'Weekly Low Stock Supplies & Recommended Purchases' : timeframe === 'monthly' ? 'Monthly Inventory Valuation Review' : 'Supplies Cost Reduction Opportunities'}
          </span>
          
          {timeframe === 'weekly' ? (
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden">
              <table className="w-full text-3xs font-mono leading-normal shadow-3xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800 text-[9px] uppercase border-b border-light font-bold text-slate-450">
                    <th className="py-2 px-3 text-left">Item Name</th>
                    <th className="py-2 px-3 text-center">Current Stock</th>
                    <th className="py-2 px-3 text-center">Minimum Stock</th>
                    <th className="py-2 px-3 text-center">Est Days Remaining</th>
                    <th className="py-2 px-3 text-right">Reorder Quantity</th>
                    <th className="py-2 px-3 text-right">Pending Req. Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900">
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">Front Office A4 Letterheads</td>
                    <td className="py-2 px-3 text-center text-rose-500 font-bold">1 pack</td>
                    <td className="py-2 px-3 text-center">5 packs</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">2 days</td>
                    <td className="py-2 px-3 text-right">10 packs</td>
                    <td className="py-2 px-3 text-right"><span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 font-bold rounded">PENDING APP (FO-09)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">High-Speed Thermal Rolls (80mm)</td>
                    <td className="py-2 px-3 text-center text-rose-500 font-bold">15 rolls</td>
                    <td className="py-2 px-3 text-center">40 rolls</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">4 days</td>
                    <td className="py-2 px-3 text-right">60 rolls</td>
                    <td className="py-2 px-3 text-right"><span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded">APPROVED (PO-142)</span></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-sans font-bold text-slate-900">Guest Ink Pens</td>
                    <td className="py-2 px-3 text-center text-rose-500 font-bold">6 pieces</td>
                    <td className="py-2 px-3 text-center">30 pieces</td>
                    <td className="py-2 px-3 text-center">5 days</td>
                    <td className="py-2 px-3 text-right">50 pieces</td>
                    <td className="py-2 px-3 text-right"><span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-bold rounded">REORDER NOW</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : timeframe === 'monthly' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Department Valuation Summary</span>
                <div className="text-3xs font-mono space-y-2">
                  <div className="flex justify-between border-b pb-1">
                    <span>Retail Gift Shop Inventory Value:</span>
                    <strong>$34,800</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Office Supplies Store Valuation:</span>
                    <strong>$8,050</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1 font-bold">
                    <span>Total Department Inventory:</span>
                    <strong className="text-indigo-650">$42,850</strong>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span>Damaged / Written-off Stock:</span>
                    <span>-$350</span>
                  </div>
                  <div className="flex justify-between text-yellow-600 font-medium">
                    <span>Slow-Moving Dead Stock:</span>
                    <span>$1,200 (Art items)</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-indigo-100 rounded-2xl bg-indigo-50/20 text-3xs space-y-2 leading-relaxed text-indigo-950">
                <span className="font-bold text-indigo-900 block border-b pb-1 uppercase tracking-wider">Turnover Multipliers</span>
                <p>• Retail inventory turnover registers at <strong>2.4x yearly</strong>, which represents healthy product movement velocity on apparel and food segments.</p>
                <p>• Stationery supplies turnover registers at <strong>4.8x per year</strong>; stock adjustments have successfully minimized dead printer ink waste levels down to near zero.</p>
                <p>• Dead stock actions: Relocate local beaded art keychains from safe shelf boxes onto the active register glass cash counters to trigger impulse checkouts.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-emerald-150 rounded-xl bg-emerald-50/10 text-3xs font-mono space-y-2 text-emerald-950 dark:text-emerald-400 leading-normal select-none">
              <strong className="text-emerald-800 dark:text-emerald-300 block uppercase border-b pb-1">Cost Saving & Material Optimizations Identified</strong>
              <p>• Sourcing high-durability digital RFID proximity keycards from vendor B in bulk packs (500 units) drops unit costs from $2.00 down to $1.35. Reserving this order for next quarter realizes savings of <strong>$325.00</strong>.</p>
              <p>• Shifting standard guest welcome card printing from outer offset printers onto our direct on-site thermal receipt printers lowers custom paper stock expenditures by <strong>18% month-on-month</strong>.</p>
              <p>• Transitioning front office stationery supplies requisitions onto a bi-weekly cycle rather than a loose daily shift drop saves approximately 5 work hours per clerk every month.</p>
            </div>
          )}

        </div>
      )}

      {/* --- SEGMENT D: FINANCIAL STATEMENT (QUARTERLY ONLY) --- */}
      {activeSegment === 'statement' && timeframe === 'quarterly' && (
        <div className="space-y-6 animate-fade-in text-slate-900 dark:text-slate-100">
          
          {/* Top Info Alert */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 text-3xs font-mono leading-relaxed space-y-1.5 flex flex-col md:flex-row justify-between md:items-center gap-3">
            <div>
              <span className="font-extrabold text-indigo-650 dark:text-indigo-400 uppercase tracking-widest block mb-0.5">Approved General Ledger Entry</span>
              <p className="text-[10px] text-slate-500">Document ref: <strong className="text-slate-800 dark:text-slate-200">GL-GS-Q3-2026</strong>. Audited and certified by Internal Audit team on May 31, 2026.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-150/50 dark:border-emerald-900/50 rounded-lg text-4xs font-bold uppercase tracking-wider block text-center">
                Net Margin: 50.99%
              </span>
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-405 border border-indigo-150/50 dark:border-indigo-900/50 rounded-lg text-4xs font-bold uppercase tracking-wider block text-center">
                Reconciled: OK
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* INCOME STATEMENT GRID */}
            <div className="lg:col-span-7 bg-slate-50/40 dark:bg-slate-950/20 p-5 rounded-2xl border dark:border-slate-800 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-150 dark:border-slate-800 pb-2">
                <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block">Q3 Retail & Supplies Income Statement</span>
                <span className="text-4xs text-slate-450 font-mono">Figures in USD ($)</span>
              </div>

              <div className="space-y-4 text-3xs font-mono">
                {/* REVENUE SECTION */}
                <div className="space-y-1">
                  <div className="flex justify-between font-extrabold text-slate-500 uppercase tracking-wider text-[9px] border-b border-dashed dark:border-slate-800 pb-1">
                    <span>1. Operating Revenues</span>
                    <span>Q3 2026</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Gift Shop Retail Sales</span>
                    <strong className="text-slate-800 dark:text-slate-200">$112,650</strong>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Custom Branding Orders & Surcharges</span>
                    <strong className="text-slate-800 dark:text-slate-200">$14,800</strong>
                  </div>
                  <div className="flex justify-between font-bold text-slate-950 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-1">
                    <span>Total Gross Revenue</span>
                    <strong className="text-indigo-650 dark:text-indigo-400">$127,450</strong>
                  </div>
                </div>

                {/* COGS SECTION */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between font-extrabold text-slate-500 uppercase tracking-wider text-[9px] border-b border-dashed dark:border-slate-800 pb-1">
                    <span>2. Cost of Goods Sold (COGS)</span>
                    <span>(Debit)</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Beginning Stock Value (Q3 Start)</span>
                    <span>$18,400</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Plus: Inventory Purchases & Freight In</span>
                    <span>$32,450</span>
                  </div>
                  <div className="flex justify-between pl-2 text-rose-500">
                    <span>Less: Ending Stock Value (Q3 End)</span>
                    <span>-$8,000</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-950 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-1">
                    <span>Total Cost of Goods Sold</span>
                    <strong className="text-indigo-650 dark:text-indigo-400">($42,850)</strong>
                  </div>
                </div>

                {/* GROSS PROFIT SECTION */}
                <div className="flex justify-between font-black text-slate-950 dark:text-white uppercase text-[9px] bg-slate-100/60 dark:bg-slate-900/60 p-2 rounded-lg border dark:border-slate-800">
                  <span>3. Retail Gross Profit</span>
                  <span className="text-emerald-600 dark:text-emerald-400">$84,600 (66.38% Margin)</span>
                </div>

                {/* OPERATING EXPENSES (OFFICE SUPPLIES ASSIGNED) */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between font-extrabold text-slate-500 uppercase tracking-wider text-[9px] border-b border-dashed dark:border-slate-800 pb-1">
                    <span>4. Departmental Consumables & Supplies Expenses</span>
                    <span>(Debit)</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Front Office Custom Keycards</span>
                    <span>$4,680</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Printing, Premium Letterheads & Folders</span>
                    <span>$5,550</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Terminals Receipt Thermal Paper Rolls</span>
                    <span>$2,140</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>General Stationery & Admin Materials</span>
                    <span>$3,040</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Direct Merchant Transaction Processing SLA fees</span>
                    <span>$4,200</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-950 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-1">
                    <span>Total Consumables & Supplies Expenses</span>
                    <strong className="text-indigo-650 dark:text-indigo-400">($19,610)</strong>
                  </div>
                </div>

                {/* NET INCOME */}
                <div className="flex justify-between font-black text-slate-950 dark:text-white uppercase text-xs bg-indigo-50 dark:bg-indigo-950/50 p-3 rounded-lg border border-indigo-150 dark:border-indigo-900/40 relative overflow-hidden">
                  <span className="z-10 flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-650" /> Net Operating Income</span>
                  <span className="text-indigo-750 dark:text-indigo-400 z-10 font-bold">$64,990 (50.99% Net Option)</span>
                  <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-500/5 rounded-full -mr-8 -mt-8 rotate-45" />
                </div>
              </div>
            </div>

            {/* SEGMENT VISUALS & METRIC CHARTS */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Asset Values & Balances */}
              <div className="p-4 border dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block border-b pb-1">Q3 Balance Sheet & Asset Values</span>
                <div className="text-3xs font-mono space-y-2 leading-relaxed">
                  <div className="flex justify-between">
                    <span>Current Inventory Assets:</span>
                    <strong className="text-slate-750 dark:text-slate-350">$8,000 (Physical Count)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplies Reserves on Shelf:</span>
                    <strong className="text-slate-755 dark:text-slate-350">$4,250 (Non-issued)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding Vendor Receivables:</span>
                    <strong className="text-slate-755 dark:text-slate-350">$2,400 (Custom pre-orders)</strong>
                  </div>
                  <div className="flex justify-between border-t border-dashed dark:border-slate-800 pt-1 text-slate-950 dark:text-white font-bold">
                    <span>Net Division Working Capital:</span>
                    <strong className="text-indigo-650 dark:text-indigo-400">$14,650</strong>
                  </div>
                </div>
              </div>

              {/* Graphical Allocation */}
              <div className="p-4 border dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Q3 Outlay Allocation Chart</span>
                <div className="h-40 w-full flex items-center justify-center pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'COGS', value: 42850 },
                          { name: 'Stationery', value: 5550 },
                          { name: 'Keycards', value: 4680 },
                          { name: 'Merchant SLA', value: 4200 },
                          { name: 'Receipts & Other', value: 5180 }
                        ]}
                        innerRadius={25}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          '#4f46e5',
                          '#10b981',
                          '#f59e0b',
                          '#6366f1',
                          '#ec4899'
                        ].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} formatter={(val: number) => `$${val.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Legend */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[8px] font-mono text-slate-450 uppercase select-none">
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600" /> COGS (Retail): $42.8k</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Paper & Custom: $5.5k</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Keycards RFID: $4.6k</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-pink-500" /> Receipt & Admin: $9.3k</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
