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
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-slate-500/10 to-transparent rounded-full -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-110" />
          
          <div className="flex justify-between items-start mb-4">
            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 rounded-full text-4xs font-mono font-black uppercase tracking-wider">
              <ShoppingBag size={10} /> Gift Shop KPIs
            </span>
            <button
              onClick={() => setDrillDown(drillDown === 'gift' ? 'none' : 'gift')}
              className="text-4xs font-mono font-extrabold text-slate-650 dark:text-slate-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {drillDown === 'gift' ? 'Collapse' : 'Drill-Down'} <ArrowUpRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Today's Sales</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">$0</strong>
              <span className="text-[8px] text-slate-400 font-semibold flex items-center md:gap-0.5 mt-0.5">No data</span>
            </div>
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Month-to-Date</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">$0</strong>
              <span className="text-[8px] text-slate-400 font-semibold flex items-center md:gap-0.5 mt-0.5">No data</span>
            </div>
            <div className="p-3 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl border border-slate-100/50 dark:border-slate-900/20">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Gross Profit</span>
              <strong className="text-lg font-sans font-black text-slate-750 dark:text-slate-400 mt-1 block">$0</strong>
              <span className="text-[8px] font-mono font-extrabold text-slate-500">0% Margin</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Top Selling Product:</span>
              <strong className="text-slate-700 dark:text-slate-350">--</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Total Catalog Value:</span>
              <strong className="text-slate-700 dark:text-slate-350">$0 (Current Stock)</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Low Stock Alerts:</span>
              <strong className="text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded">0 Items Below Min</strong>
            </div>
          </div>
        </div>

        {/* WIDGET B: OFFICE SUPPLIES KPIs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-850 p-6 rounded-3xl shadow-3xs hover:shadow-2xs transition-all relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-bl from-slate-500/10 to-transparent rounded-full -mr-5 -mt-5 transition-transform duration-500 group-hover:scale-110" />

          <div className="flex justify-between items-start mb-4">
            <span className="flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 rounded-full text-4xs font-mono font-black uppercase tracking-wider">
              <Boxes size={10} /> Office Supplies KPIs
            </span>
            <button
              onClick={() => setDrillDown(drillDown === 'supplies' ? 'none' : 'supplies')}
              className="text-4xs font-mono font-extrabold text-slate-650 dark:text-slate-400 hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              {drillDown === 'supplies' ? 'Collapse' : 'Drill-Down'} <ArrowUpRight size={10} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Monthly Cost</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">$0</strong>
              <span className="text-[8px] text-slate-400 font-semibold flex items-center md:gap-0.5 mt-0.5">No data</span>
            </div>
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-850">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Budget Util.</span>
              <strong className="text-lg font-sans font-black text-slate-900 dark:text-white mt-1 block">0%</strong>
              <span className="text-[8px] text-slate-400 font-mono">No data</span>
            </div>
            <div className="p-3 bg-slate-50/20 dark:bg-slate-950/10 rounded-2xl border border-slate-100/50 dark:border-slate-900/20">
              <span className="text-[9px] font-mono font-medium text-slate-400 uppercase tracking-wider block">Variance</span>
              <strong className="text-lg font-sans font-black text-slate-700 dark:text-slate-400 mt-1 block">$0</strong>
              <span className="text-[8px] font-mono font-extrabold text-slate-600">No data</span>
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-850 pt-3 space-y-2">
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">High Consumption category:</span>
              <strong className="text-slate-700 dark:text-slate-350">--</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Pending Requisitions:</span>
              <strong className="text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded">0 Active Requests</strong>
            </div>
            <div className="flex justify-between text-3xs font-mono">
              <span className="text-slate-400">Supplies Low Stock:</span>
              <strong className="text-slate-500 bg-slate-50 dark:bg-slate-950 px-1.5 py-0.5 rounded">0 Items Below Min</strong>
            </div>
          </div>
        </div>

      </div>

      {/* --- DRILL DOWN SECTION PANELS --- */}
      {drillDown === 'gift' && (
        <div className="p-6 bg-slate-50/10 dark:bg-slate-950/5 border border-slate-150/40 dark:border-slate-900/40 rounded-3xl animate-fade-in space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-950">
            <h5 className="text-xs font-black text-slate-950 dark:text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <ShoppingBag size={12} /> Gift Shop Sales Performance Deep-Dive Review
            </h5>
            <span className="text-4xs font-mono font-bold text-slate-400">Real-Time POS Sync Active</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Product Category Performance Breakdown</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[]} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Bar name="Sales Revenue ($)" dataKey="Sales" fill="#64748b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Product Stock Status Check</span>
              <div className="space-y-2 select-none">
                <div className="p-2 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 text-3xs font-mono space-y-0.5 text-slate-600 dark:text-slate-400">
                  <p className="text-[9px] text-slate-500">No low stock alerts. Data will populate from inventory system.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {drillDown === 'supplies' && (
        <div className="p-6 bg-slate-50/10 dark:bg-slate-950/5 border border-slate-150/40 dark:border-slate-900/40 rounded-3xl animate-fade-in space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100/50 dark:border-slate-950">
            <h5 className="text-xs font-black text-slate-950 dark:text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
              <Boxes size={12} /> Front Office supplies distribution breakdown
            </h5>
            <span className="text-4xs font-mono font-bold text-slate-400">Monthly budget: $0</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-3">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Department Supplies Consumption (MTD)</span>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[]} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Bar name="Actual Cost ($)" dataKey="Cost" fill="#64748b" radius={[4, 4, 0, 0]} />
                    <Bar name="Budget Limit ($)" dataKey="Budget" fill="#94a3b8" radius={[4, 4, 0, 0]} opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">Low Stock Supplies Alerts</span>
              <div className="space-y-2 select-none">
                <div className="p-2 border border-slate-100 dark:border-slate-850 rounded-xl bg-slate-50/20 dark:bg-slate-950/10 text-3xs font-mono space-y-0.5 text-slate-600 dark:text-slate-400">
                  <p className="text-[9px] text-slate-500">No low stock alerts. Data will populate from inventory system.</p>
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
        <span className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border border-slate-100 dark:border-slate-900 rounded text-[9px] font-mono font-bold">
          No data
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block">Gift Shop Revenue</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$0</strong>
          <span className="text-[8px] font-mono text-slate-400 font-bold block mt-0.5">No data</span>
        </div>

        {/* Metric 2 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block">Retail Gross Profit</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$0</strong>
          <span className="text-[8px] font-mono text-slate-400 font-bold block mt-0.5">0% Profit Margin</span>
        </div>

        {/* Metric 3 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block font-mono">Total Inventory Value</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$0</strong>
          <span className="text-[8px] font-mono text-slate-500 block mt-0.5">$0 Retail / $0 Supplies</span>
        </div>

        {/* Metric 4 */}
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl">
          <span className="text-[9px] font-mono font-semibold text-slate-400 tracking-wider uppercase block">Supplies Cost (MTD)</span>
          <strong className="text-base font-sans font-black text-slate-950 dark:text-white block mt-1">$0</strong>
          <span className="text-[8px] font-mono text-slate-400 font-bold block mt-0.5">No data</span>
        </div>

      </div>

      <div className="p-4 border border-slate-100/50 dark:border-slate-950/40 rounded-xl bg-slate-500/5 text-3xs font-mono space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <span className="font-bold text-slate-950 dark:text-slate-400 block border-b pb-1">Supplies Consumed Summary</span>
            <ul className="space-y-1 text-slate-650 dark:text-slate-405 leading-relaxed">
              <li className="flex justify-between"><span>Total Units Issued:</span> <strong>0 items</strong></li>
              <li className="flex justify-between"><span>Top Dept Usage:</span> <strong>--</strong></li>
              <li className="flex justify-between"><span>High Consumption:</span> <strong className="text-slate-650">--</strong></li>
            </ul>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-700 block border-b pb-1">Low Stock Risks & Alerts</span>
            <ul className="space-y-1 text-slate-650 dark:text-slate-455 leading-relaxed">
              <li className="flex justify-between"><span>Items Below Min:</span> <strong className="text-slate-600">0 GS / 0 Supplies</strong></li>
              <li className="flex justify-between"><span>Critical Supplies:</span> <strong>--</strong></li>
              <li className="flex justify-between"><span>Est Days Remaining:</span> <strong className="text-slate-750">--</strong></li>
            </ul>
          </div>

          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-400 block border-b pb-1">Recommended Manager Actions</span>
            <p className="text-[9px] text-slate-600 dark:text-slate-400 leading-normal">
              No actions required. Data will populate from inventory system.
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

  const cross = getProductMovement('', 'No data', 0);
  const pot = getProductMovement('', 'No data', 0);
  const scarf = getProductMovement('', 'No data', 0);
  const honey = getProductMovement('', 'No data', 0);
  const coffee = getProductMovement('', 'No data', 0);

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
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">$0</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium font-mono">Transactions Volume</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">0 sales</strong>
            <p className="text-[8px] text-slate-450 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950 border dark:border-slate-800 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-medium">Avg Transaction Val</span>
            <strong className="text-base font-sans font-black text-slate-900 dark:text-white block mt-1">$0</strong>
            <p className="text-[8px] text-slate-400 font-mono mt-0.5">No data</p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-900 rounded-xl">
            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 block font-bold">Total Gross Margin</span>
            <strong className="text-base font-sans font-black text-slate-950 dark:text-slate-300 block mt-1">$0</strong>
            <p className="text-[8px] font-mono text-slate-600">0% Net Profit Level</p>
          </div>
        </div>

        {/* Splits and Staff Lists columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
          
          <div className="p-4 border dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block">Payments Distribution</span>
            <div className="space-y-2 text-3xs font-mono">
              <div className="flex justify-between border-b pb-1">
                <span>Cash Payments Collect:</span>
                <strong>$0 (0%)</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Credit/Debit Cards:</span>
                <strong className="text-slate-400">$0 (0%)</strong>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Room Charges Posted:</span>
                <strong className="text-slate-400">$0 (0%)</strong>
              </div>
              <div className="flex justify-between border-b pb-1 text-slate-400 select-none">
                <span>Discounts Granted:</span>
                <span>$0 (0 claims)</span>
              </div>
              <div className="flex justify-between text-slate-400 font-bold">
                <span>Refunds Processed:</span>
                <span>$0 (0 vouchers)</span>
              </div>
            </div>
          </div>

          <div className="p-4 border dark:border-slate-850 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
            <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 block">Sales Revenue by Staff On-Duty</span>
            <div className="space-y-2 text-3xs font-mono">
              <div className="flex justify-between text-slate-400 pt-1">
                <span>No staff data available</span>
                <span>--</span>
              </div>
            </div>
          </div>

        </div>

        {/* Selling products tables */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-650 block">Product Item Velocity Analysis</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top items */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[9px] font-mono font-bold text-slate-500 border-b border-slate-150 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Top Selling Items
              </div>
              <table className="w-full text-3xs font-mono leading-normal">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  <tr><td className="px-3 py-2 text-slate-400">No sales data available</td><td className="px-3 py-2 text-center text-slate-400">--</td><td className="px-3 py-2 text-right text-slate-400">--</td></tr>
                </tbody>
              </table>
            </div>

            {/* Slow moving items */}
            <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
              <div className="bg-slate-50 dark:bg-slate-800 px-3 py-2 text-[9px] font-mono font-bold text-slate-500 border-b border-slate-150 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Slow Moving Items (Action Needed)
              </div>
              <table className="w-full text-3xs font-mono leading-normal">
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  <tr><td className="px-3 py-2 text-slate-400">No inventory data available</td><td className="px-3 py-2 text-center text-slate-400">--</td><td className="px-3 py-2 text-right text-slate-400">--</td></tr>
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
              <td className="py-2.5 px-3 text-right text-slate-500">$0.00</td>
              <td className="py-2.5 px-3 text-right text-slate-500">$0.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-350">2. Recorded Cash Sales Received Today</td>
              <td className="py-2.5 px-3 text-right text-slate-400 font-bold">$0.00</td>
              <td className="py-2.5 px-3 text-right text-slate-400 font-bold">$0.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-350">3. Deducted Cash Refunds Dispensed</td>
              <td className="py-2.5 px-3 text-right text-slate-400 font-bold">$0.00</td>
              <td className="py-2.5 px-3 text-right text-slate-400 font-bold">$0.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr className="bg-slate-50/50 dark:bg-slate-950/20 font-bold">
              <td className="py-2.5 px-3 text-slate-900 dark:text-white uppercase text-[9px] tracking-wider">4. Expected Cash Balance in Drawer</td>
              <td className="py-2.5 px-3 text-right">$0.00</td>
              <td className="py-2.5 px-3 text-right">$0.00</td>
              <td className="py-2.5 px-3 text-right text-slate-400 font-black">$0.00 (No data)</td>
            </tr>
            <tr>
              <td className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-350">5. Cash Deposited to Safe (Envelope Drop)</td>
              <td className="py-2.5 px-3 text-right text-slate-400">$0.00</td>
              <td className="py-2.5 px-3 text-right text-slate-400">$0.00</td>
              <td className="py-2.5 px-3 text-right font-bold text-slate-300">$0.00</td>
            </tr>
            <tr className="bg-slate-50/20 dark:bg-slate-950/20 font-bold text-slate-900 dark:text-slate-400">
              <td className="py-2.5 px-3 uppercase text-[9px] tracking-wider">6. Closing Cash Float Left in Drawer</td>
              <td className="py-2.5 px-3 text-right">$0.00</td>
              <td className="py-2.5 px-3 text-right">$0.00</td>
              <td className="py-2.5 px-3 text-right text-slate-400 font-black">$0.00</td>
            </tr>
          </tbody>
        </table>

        <div className="p-3 border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/15 rounded-xl text-3xs text-slate-600 dark:text-slate-400 leading-normal">
          <strong>Daily Reconciliation Status: No data available.</strong> Data will populate from cash reconciliation system.
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
          <span className="text-4xs text-slate-400 font-bold">Total SKUs: 0 Active</span>
        </div>

        <div className="border border-slate-150 dark:border-slate-850 rounded-xl overflow-hidden shadow-3xs">
          <table className="w-full text-3xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 uppercase text-[9px] text-slate-450 border-b border-slate-150 dark:border-slate-805">
                <th className="py-2 px-3">Product Description / SKU</th>
                <th className="py-2 px-2 text-center">Opening Stock</th>
                <th className="py-2 px-2 text-center">Received Stock</th>
                <th className="py-2 px-2 text-center text-slate-600 font-bold">Stock Sold</th>
                <th className="py-2 px-2 text-center text-slate-600">Adjusted (+/-)</th>
                <th className="py-2 px-2 text-center text-slate-500 font-bold">Damaged Stock</th>
                <th className="py-2 px-3 text-right text-slate-900 dark:text-white font-bold">Closing Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-slate-900 select-none font-sans">
              <tr>
                <td className="py-2.5 px-3 text-slate-400" colSpan={7}>No inventory data available. Data will populate from inventory system.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-[9px] text-slate-400 select-none">
          *Note: Inventory movements will be tracked from the database once products are configured.
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
          <span className="text-4xs text-slate-400 font-bold">Total Daily Consumption Cost: $0.00</span>
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
                <td className="py-2.5 px-3 text-slate-400" colSpan={6}>No supplies consumption data available. Data will populate from inventory system.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3 border border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/15 rounded-xl text-3xs text-slate-600 dark:text-slate-400">
          <strong>Supplies Status:</strong> No consumption data available. Data will populate from inventory system.
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
            <Layers size={11} className="text-slate-500" /> Excel Sheet
          </button>
        </div>
      </div>

      {isExporting && (
        <div className="p-3 bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-400 text-3xs font-mono font-bold rounded-xl animate-pulse">
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
                    $0
                  </strong>
                  <span className="text-[8px] text-slate-400 block flex items-center md:gap-0.5 mt-0.5">No data</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-slate-400 text-[9px] font-mono block">Gross Profit</span>
                  <strong className="text-xl font-sans font-black text-slate-700 dark:text-slate-400">
                    $0
                  </strong>
                  <span className="text-[8px] text-slate-450 block font-mono">Margin: 0%</span>
                </div>
              </div>
              
              <div className="pt-2 border-t text-3xs font-mono space-y-1 text-slate-550 select-none">
                <p>• Best Selling: <strong className="text-slate-800 dark:text-slate-200">--</strong></p>
                <p>• Slowest Selling: <strong className="text-slate-850">--</strong></p>
                <p>• Inventory Turnover Ratio: <strong>--</strong></p>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">Financial Sales Trend</span>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ fontSize: '10px' }} />
                    <Line name="Gross Revenue ($)" type="monotone" dataKey="Revenue" stroke="#64748b" strokeWidth={2} />
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
                  <strong>$0</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Guest Keycards & Envelopes:</span>
                  <strong>$0</strong>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span>Register Roll & Stapler Staples:</span>
                  <strong>$0</strong>
                </div>
                <div className="flex justify-between font-bold text-slate-700 dark:text-slate-350">
                  <span>Total Supplies Cost:</span>
                  <span>$0</span>
                </div>
              </div>
            </div>

            <div className="p-4 border border-slate-100/60 dark:border-slate-850/40 rounded-2xl bg-slate-500/5 space-y-3 leading-relaxed">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 block flex items-center gap-1"><AlertTriangle size={12} /> Abnormal Consumption & Waste Alerts</span>
              <div className="text-3xs font-mono space-y-2.5">
                <div className="p-2 border border-slate-100/60 rounded-xl bg-white dark:bg-slate-950">
                  <p className="text-[9px] text-slate-500">No consumption alerts. Data will populate from inventory system.</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- SEGMENT C: REORDER & INVENTORY VALUATION (WEEKLY/MONTHLY/QUARTERLY) --- */}
      {activeSegment === 'reorder' && (
        <div className="space-y-4">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-650 block border-b pb-1">
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
                  <tr>
                    <td className="py-2 px-3 text-slate-400" colSpan={6}>No low stock items. Data will populate from inventory system.</td>
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
                    <strong>$0</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1">
                    <span>Office Supplies Store Valuation:</span>
                    <strong>$0</strong>
                  </div>
                  <div className="flex justify-between border-b pb-1 font-bold">
                    <span>Total Department Inventory:</span>
                    <strong className="text-slate-600">$0</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Damaged / Written-off Stock:</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-medium">
                    <span>Slow-Moving Dead Stock:</span>
                    <span>$0</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50/20 text-3xs space-y-2 leading-relaxed text-slate-600">
                <span className="font-bold text-slate-700 block border-b pb-1 uppercase tracking-wider">Turnover Multipliers</span>
                <p>• No turnover data available. Data will populate from inventory system.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-slate-150 rounded-xl bg-slate-50/10 text-3xs font-mono space-y-2 text-slate-600 dark:text-slate-400 leading-normal select-none">
              <strong className="text-slate-700 dark:text-slate-300 block uppercase border-b pb-1">Cost Saving & Material Optimizations Identified</strong>
              <p>• No optimization data available. Data will populate from inventory system.</p>
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
              <span className="font-extrabold text-slate-600 dark:text-slate-400 uppercase tracking-widest block mb-0.5">No Financial Data Available</span>
              <p className="text-[10px] text-slate-500">Financial statement data will populate from the accounting system once transactions are recorded.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg text-4xs font-bold uppercase tracking-wider block text-center">
                Net Margin: 0%
              </span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-lg text-4xs font-bold uppercase tracking-wider block text-center">
                No Data
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
                    <span>No Data</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Gift Shop Retail Sales</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Custom Branding Orders & Surcharges</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
                  </div>
                  <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1">
                    <span>Total Gross Revenue</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
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
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Plus: Inventory Purchases & Freight In</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pl-2 text-slate-400">
                    <span>Less: Ending Stock Value (Q3 End)</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1">
                    <span>Total Cost of Goods Sold</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
                  </div>
                </div>

                {/* GROSS PROFIT SECTION */}
                <div className="flex justify-between font-black text-slate-600 dark:text-slate-400 uppercase text-[9px] bg-slate-100/60 dark:bg-slate-900/60 p-2 rounded-lg border dark:border-slate-800">
                  <span>3. Retail Gross Profit</span>
                  <span className="text-slate-600 dark:text-slate-400">$0 (0% Margin)</span>
                </div>

                {/* OPERATING EXPENSES (OFFICE SUPPLIES ASSIGNED) */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between font-extrabold text-slate-500 uppercase tracking-wider text-[9px] border-b border-dashed dark:border-slate-800 pb-1">
                    <span>4. Departmental Consumables & Supplies Expenses</span>
                    <span>(Debit)</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Front Office Custom Keycards</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Printing, Premium Letterheads & Folders</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Terminals Receipt Thermal Paper Rolls</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>General Stationery & Admin Materials</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between pl-2">
                    <span>Direct Merchant Transaction Processing SLA fees</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1">
                    <span>Total Consumables & Supplies Expenses</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
                  </div>
                </div>

                {/* NET INCOME */}
                <div className="flex justify-between font-black text-slate-600 dark:text-slate-400 uppercase text-xs bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                  <span className="z-10 flex items-center gap-1"><CheckCircle2 size={12} className="text-slate-500" /> Net Operating Income</span>
                  <span className="text-slate-600 dark:text-slate-400 z-10 font-bold">$0 (0% Net Option)</span>
                  <div className="absolute right-0 top-0 w-20 h-20 bg-slate-500/5 rounded-full -mr-8 -mt-8 rotate-45" />
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
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Supplies Reserves on Shelf:</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Outstanding Vendor Receivables:</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
                  </div>
                  <div className="flex justify-between border-t border-dashed dark:border-slate-800 pt-1 text-slate-600 dark:text-slate-400 font-bold">
                    <span>Net Division Working Capital:</span>
                    <strong className="text-slate-600 dark:text-slate-400">$0</strong>
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
                        data={[]}
                        innerRadius={25}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {[
                          '#64748b',
                          '#64748b',
                          '#94a3b8',
                          '#94a3b8',
                          '#94a3b8'
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
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> COGS (Retail): $0</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Paper & Custom: $0</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Keycards RFID: $0</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-500" /> Receipt & Admin: $0</div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
