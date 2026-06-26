/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Reservation, Room } from '../../types/erp';
import { toISODate } from '../../utils/date';
import { 
  Plus, 
  Calendar, 
  Globe, 
  DollarSign, 
  Users, 
  Search, 
  Check, 
  Tag, 
  AlertCircle, 
  Zap, 
  TrendingUp, 
  ArrowRight,
  Sparkles,
  RefreshCw,
  List,
  X,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Pencil,
  Activity,
  Sliders,
  Percent,
  TrendingDown,
  Target,
  Brain,
  Info,
  Layers,
  BarChart3,
  CalendarDays,
  Rocket
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface ForecastingProps {
  reservations: Reservation[];
  rooms: Room[];
  currentSystemDate: string;
  formatAmount: (amount: number) => string;
  triggerLiveSyncSimulation: () => void;
  setDemandTier: (tier: 'Standard' | 'High Occupancy' | 'Holiday Peak') => void;
  setSuccessMsg: (msg: string) => void;
  successMsg: string;
}

export default function ReservationsForecasting({
  reservations,
  rooms,
  currentSystemDate,
  formatAmount,
  triggerLiveSyncSimulation,
  setDemandTier,
  setSuccessMsg,
  successMsg
}: ForecastingProps) {
  // AI Forecasting and Scenario Simulator State
  const [fHorizon, setFHorizon] = useState<'7' | '30'>('7');
  const [fDemandMultiplier, setFDemandMultiplier] = useState<number>(1.2);
  const [fCompPricing, setFCompPricing] = useState<'undercut' | 'fair' | 'premium'>('premium');
  const [fStrategy, setFStrategy] = useState<'optimistic' | 'defensive' | 'yield_max'>('yield_max');
  const [fPromoActive, setFPromoActive] = useState<boolean>(true);
  const [forecastSubTab, setForecastSubTab] = useState<'occupancy' | 'revenue' | 'distribution'>('occupancy');
  const [aiSimulationLogs, setAiSimulationLogs] = useState<string[]>([
    'Ledger analytics scanned: 24 room-nights capacity mapped.',
    'Seasonal baseline multiplier detected: 1.0x (Standard spring shoulder).',
    'AI recommended optimization strategy: yield_max activated.'
  ]);

  // Compile Forecast Data Realtime!
  const forecastData = useMemo(() => {
    const horizonDays = fHorizon === '7' ? 7 : 30;
    const dateRange = [];
    const baseDate = new Date(currentSystemDate || new Date().toISOString().split('T')[0]);
    
    // Fill date range
    for (let i = 0; i < horizonDays; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dateRange.push(toISODate(d));
    }
    
    // Day-by-day stats
    return dateRange.map((dayStr, idx) => {
      // Find OTB reservations overlapping this day
      const otbRes = reservations.filter(res => {
        const isConfirmed = res.status === 'Confirmed' || res.status === 'CheckedIn';
        if (!isConfirmed) return false;
        return res.checkInDate <= dayStr && res.checkOutDate > dayStr;
      });
      
      const baselineOccupied = otbRes.length;
      const capacity = rooms.length || 24;
      
      const baselineRevenue = otbRes.reduce((sum, r) => sum + (r.rate || 150), 0);
      const baselineADR = baselineOccupied > 0 ? Math.round(baselineRevenue / baselineOccupied) : 180;
      
      // Calculate pick-up curve
      const dObj = new Date(dayStr);
      const dayOfWeek = dObj.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6;
      
      // Baseline decay/growth over horizon
      const dta = idx; // Days to arrival is index
      const pickupBaseline = isWeekend ? 3.8 : 1.8;
      const pickupDecay = dta === 0 ? 0 : dta <= 3 ? 0.35 : dta <= 7 ? 0.65 : dta <= 14 ? 0.85 : 1.0;
      
      let compModifier = 1.0;
      if (fCompPricing === 'undercut') compModifier = 0.68;
      if (fCompPricing === 'premium') compModifier = 1.32;
      
      let promoModifier = fPromoActive ? 1.25 : 1.0;
      
      // Remaining vacant count
      const vacantCount = Math.max(0, capacity - baselineOccupied);
      
      // Expected booking pickup projection
      const projectedPickup = pickupBaseline * pickupDecay * fDemandMultiplier * compModifier * promoModifier;
      
      const simulatedOccupied = baselineOccupied + Math.min(vacantCount, Math.round(projectedPickup));
      const simulatedOccupancyRate = Math.min(100, Math.round((simulatedOccupied / capacity) * 100));
      const baselineOccupancyRate = Math.min(100, Math.round((baselineOccupied / capacity) * 100));
      
      // Simulated ADR
      let simADRModifier = 1.0;
      if (fStrategy === 'optimistic') simADRModifier = 1.15;
      if (fStrategy === 'defensive') simADRModifier = 0.85;
      if (fStrategy === 'yield_max') {
        const estOcc = simulatedOccupied / capacity;
        if (estOcc >= 0.80) simADRModifier = 1.30;
        else if (estOcc >= 0.55) simADRModifier = 1.15;
        else if (estOcc <= 0.30) simADRModifier = 0.90;
      }
      
      const simulatedADR = Math.round(baselineADR * simADRModifier);
      const simulatedRevenue = simulatedOccupied * simulatedADR;
      
      // Formatting date labels
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${weekdayNames[dayOfWeek]} ${monthNames[dObj.getMonth()]} ${dObj.getDate()}`;
      
      // Booking channels distribution simulation (proportional)
      const directRevenue = Math.round(simulatedRevenue * (fPromoActive ? 0.45 : 0.35));
      const otaRevenue = Math.round(simulatedRevenue * (fPromoActive ? 0.35 : 0.45));
      const corporateRevenue = Math.round(simulatedRevenue * 0.20);
      
      // Room categories count distribution
      const singleOcc = Math.min(5, Math.round(simulatedOccupied * 0.25));
      const doubleOcc = Math.min(10, Math.round(simulatedOccupied * 0.45));
      const deluxeOcc = Math.min(5, Math.round(simulatedOccupied * 0.15));
      const suiteOcc = Math.min(3, Math.round(simulatedOccupied * 0.10));
      const penthouseOcc = Math.min(2, Math.round(simulatedOccupied * 0.05));
      
      return {
        date: dayStr,
        label,
        baselineOccupied,
        baselineOccupancyRate,
        baselineRevenue,
        baselineADR,
        simulatedOccupied,
        simulatedOccupancyRate,
        simulatedRevenue,
        simulatedADR,
        directRevenue,
        otaRevenue,
        corporateRevenue,
        singleOcc,
        doubleOcc,
        deluxeOcc,
        suiteOcc,
        penthouseOcc,
      };
    });
  }, [currentSystemDate, reservations, rooms.length, fHorizon, fDemandMultiplier, fCompPricing, fStrategy, fPromoActive]);

  const forecastAggregates = useMemo(() => {
    const len = forecastData.length;
    if (len === 0) return { avgOcc: 0, totalRev: 0, avgADR: 0, avgRevPAR: 0, baseAvgOcc: 0, baseTotalRev: 0, baseAvgADR: 0, baseAvgRevPAR: 0, roomNightsBaseline: 0, roomNightsSimulated: 0 };
    
    const baseTotalOccupied = forecastData.reduce((sum, d) => sum + d.baselineOccupied, 0);
    const simTotalOccupied = forecastData.reduce((sum, d) => sum + d.simulatedOccupied, 0);
    const capacity = rooms.length || 24;
    const totalAvailNights = capacity * len;
    
    const baseTotalRev = forecastData.reduce((sum, d) => sum + d.baselineRevenue, 0);
    const simTotalRev = forecastData.reduce((sum, d) => sum + d.simulatedRevenue, 0);
    
    return {
      baseAvgOcc: Math.round((baseTotalOccupied / totalAvailNights) * 100),
      simAvgOcc: Math.round((simTotalOccupied / totalAvailNights) * 100),
      
      baseTotalRev,
      simTotalRev,
      
      baseAvgADR: baseTotalOccupied > 0 ? Math.round(baseTotalRev / baseTotalOccupied) : 180,
      simAvgADR: simTotalOccupied > 0 ? Math.round(simTotalRev / simTotalOccupied) : 180,
      
      baseAvgRevPAR: Math.round(baseTotalRev / totalAvailNights),
      simAvgRevPAR: Math.round(simTotalRev / totalAvailNights),
      
      roomNightsBaseline: baseTotalOccupied,
      roomNightsSimulated: simTotalOccupied,
    };
  }, [forecastData, rooms.length]);

  const applyAiRecommendation = () => {
    // Determine recommended tier
    if (forecastAggregates.simAvgOcc >= 75) {
      setDemandTier('Holiday Peak');
      setAiSimulationLogs(prev => [
        `[${new Date().toISOString().slice(11, 16)}] Action: Peak pricing invoked dynamically. Global tier: Holiday Peak (+35% tariff modifier).`,
        ...prev
      ]);
    } else {
      setDemandTier('High Occupancy');
      setAiSimulationLogs(prev => [
        `[${new Date().toISOString().slice(11, 16)}] Action: High occupancy optimization invoked dynamically. Global tier: High Occupancy (+15% tariff modifier).`,
        ...prev
      ]);
    }
    triggerLiveSyncSimulation();
    setSuccessMsg("AI Yield Optimizer active! Hotel rate multipliers applied globally across all OTAs and Direct portfolios.");
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="ai-forecasting-view">
      {/* Dashboard Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6 border border-indigo-800/50">
        <div className="space-y-1.5">
          <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border border-indigo-500/30 inline-flex items-center gap-1">
            <Brain size={12} className="animate-pulse text-indigo-400" /> ADVANCED PREDICTIVE INTELLIGENCE
          </span>
          <h3 className="text-xl font-sans font-black tracking-tight flex items-center gap-2">
            Predictive Occupancy & Revenue Manager
          </h3>
          <p className="text-xs text-indigo-200/80 font-sans max-w-xl">
            Simulate pricing pressure, seasonal velocity, and competitor dynamics to generate optimized inventory forecasts for your property.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setFDemandMultiplier(1.2);
              setFCompPricing('premium');
              setFStrategy('yield_max');
              setFPromoActive(true);
              setFHorizon('7');
              setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Simulation triggers reset to default yield-max standards.`, ...prev]);
            }}
            className="px-3.5 py-2 bg-indigo-950 hover:bg-indigo-900 text-indigo-200 border border-indigo-800/60 rounded-xl text-xs font-sans font-bold flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw size={12} /> Reset Parameters
          </button>
          <button
            onClick={() => {
              triggerLiveSyncSimulation();
              setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Success: Real-time ledger scan completed. ${reservations.length} active booking vectors loaded.`, ...prev]);
            }}
            className="px-4 py-2 bg-white hover:bg-slate-150 text-indigo-900 rounded-xl text-xs font-sans font-extrabold flex items-center gap-2 transition cursor-pointer shadow-lg"
          >
            <Activity size={12} className="animate-spin-slow text-indigo-600" /> Scan Ledger
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono text-xs rounded-2xl flex items-center gap-2">
          <Check size={14} className="text-emerald-700 bg-emerald-100 p-0.5 rounded-full" />
          {successMsg}
        </div>
      )}

      {/* KPI Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 hover:shadow-xs transition">
          <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Avg Occupancy</span>
            <Percent size={12} className="text-indigo-500" />
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-sans font-black text-slate-900 tracking-tight leading-none">
              {forecastAggregates.simAvgOcc}%
            </span>
            <span className="text-2xs font-mono font-semibold text-slate-400">
              Base: {forecastAggregates.baseAvgOcc}%
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
              <div className="bg-slate-400 h-full" style={{ width: `${forecastAggregates.baseAvgOcc}%` }}></div>
              <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${Math.max(0, forecastAggregates.simAvgOcc - forecastAggregates.baseAvgOcc)}%` }}></div>
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>{forecastAggregates.roomNightsSimulated} of {rooms.length * (fHorizon === '7' ? 7 : 30)} Nights</span>
              <span className={forecastAggregates.simAvgOcc > forecastAggregates.baseAvgOcc ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                +{Math.max(0, forecastAggregates.simAvgOcc - forecastAggregates.baseAvgOcc)}% pickup
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 hover:shadow-xs transition">
          <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Projected Revenue</span>
            <DollarSign size={12} className="text-emerald-500" />
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-sans font-black text-slate-800 tracking-tight leading-none">
              {formatAmount(forecastAggregates.simTotalRev)}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-sans flex items-center gap-1.5 animate-pulse-subtle">
            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">OTB: {formatAmount(forecastAggregates.baseTotalRev)}</span>
            {forecastAggregates.simTotalRev > forecastAggregates.baseTotalRev && (
              <span className="text-emerald-600 font-mono font-bold">
                +{Math.round(((forecastAggregates.simTotalRev - forecastAggregates.baseTotalRev) / (forecastAggregates.baseTotalRev || 1)) * 100)}%
              </span>
            )}
          </div>
          <div className="text-[9px] font-mono text-slate-400">Estimated Rooms + Package yield</div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 hover:shadow-xs transition">
          <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Forecasted ADR</span>
            <Target size={12} className="text-indigo-500" />
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-sans font-black text-slate-900 tracking-tight leading-none">
              {formatAmount(forecastAggregates.simAvgADR)}
            </span>
            <span className="text-2xs font-mono text-slate-400">
              Base: {formatAmount(forecastAggregates.baseAvgADR)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">
            Average room tariff expected
          </p>
          <div className="text-[9px] font-mono text-slate-400">Strategy: {fStrategy === 'yield_max' ? 'AI Dynamic Max' : fStrategy === 'optimistic' ? 'Premium 1.15x' : 'Defensive 0.85x'}</div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 hover:shadow-xs transition">
          <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Forecasted RevPAR</span>
            <TrendingUp size={12} className="text-indigo-500" />
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-sans font-black text-indigo-700 tracking-tight leading-none">
              {formatAmount(forecastAggregates.simAvgRevPAR)}
            </span>
            <span className="text-2xs font-mono text-slate-400">
              Base: {formatAmount(forecastAggregates.baseAvgRevPAR)}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">
            Revenue Per Available Room
          </p>
          <div className="text-[9px] font-mono text-slate-400">Global Efficiency benchmark</div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-2 hover:shadow-xs transition">
          <p className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Waitlist Risk</span>
            <AlertCircle size={12} className="text-amber-500" />
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-sans font-black text-amber-700 tracking-tight leading-none">
              {reservations.filter(r => r.status === 'Waitlisted').length}
            </span>
            <span className="text-xs text-slate-400 font-bold ml-1">Guests</span>
          </div>
          <p className="text-[10px] text-slate-500 font-sans">
            Waitlist demand clearance:
          </p>
          <div className="text-[9px] font-mono font-bold text-amber-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            {forecastAggregates.simAvgOcc >= 85 ? 'High Risk - Sell Out Likely' : 'Normal Clearance'}
          </div>
        </div>
      </div>

      {/* MAIN COLUMN SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SCENARIO CONTROLLER (4 COLS) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders size={16} className="text-indigo-600" />
              <div>
                <h4 className="text-xs font-mono uppercase text-slate-400 font-extrabold tracking-wider">Predictive Parameters</h4>
                <p className="text-[10px] text-slate-400">Adjust dynamic sliders to run scenario simulators.</p>
              </div>
            </div>

            {/* HORIZON SELECTOR */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block">Forecast Horizon</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button
                  onClick={() => {
                    setFHorizon('7');
                    setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Scope: Changed horizon period to 7 Days (Close-In bookings).`, ...prev]);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-sans font-extrabold transition cursor-pointer text-center ${
                    fHorizon === '7' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  7 Days Outlook
                </button>
                <button
                  onClick={() => {
                    setFHorizon('30');
                    setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Scope: Changed horizon period to 30 Days (Extended-range portfolio).`, ...prev]);
                  }}
                  className={`py-1.5 rounded-lg text-xs font-sans font-extrabold transition cursor-pointer text-center ${
                    fHorizon === '30' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  30 Days Outlook
                </button>
              </div>
            </div>

            {/* DEMAND VELOCITY SLIDER */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="uppercase font-bold text-slate-500">Market Demand Scale</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  {Math.round(fDemandMultiplier * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={fDemandMultiplier}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFDemandMultiplier(val);
                  if (val > 1.4) {
                    setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Alert: Simulating extreme positive booking demand surge (${Math.round(val*100)}%).`, ...prev]);
                  }
                }}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-sans leading-none pl-1">
                <span>Off-Season (50%)</span>
                <span>Standard (100%)</span>
                <span>Peak Season Surge (200%)</span>
              </div>
            </div>

            {/* COMPETITOR DYNAMIC PRESSURE */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block">Competitor Tariff Level</label>
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100 text-center text-[10px] font-mono font-bold text-slate-500">
                <button
                  onClick={() => {
                    setFCompPricing('undercut');
                    setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Competitor: Simulating competitive undercutting. Standard pickup degrades -32%.`, ...prev]);
                  }}
                  className={`py-2 rounded-lg border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    fCompPricing === 'undercut' ? 'bg-rose-50 border-rose-300 text-rose-850' : 'bg-white border-transparent'
                  }`}
                >
                  <TrendingDown size={12} className="text-rose-500" />
                  <span>Cheaper Rates</span>
                </button>
                <button
                  onClick={() => {
                    setFCompPricing('fair');
                    setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Competitor: Neutral competitor rate pressure mapped.`, ...prev]);
                  }}
                  className={`py-2 rounded-lg border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    fCompPricing === 'fair' ? 'bg-slate-100 border-slate-350 text-slate-800' : 'bg-white border-transparent'
                  }`}
                >
                  <Layers size={12} className="text-slate-500" />
                  <span>Fair Parity</span>
                </button>
                <button
                  onClick={() => {
                    setFCompPricing('premium');
                    setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Competitor: Simulating rival premium rates. Direct spillover captures +32% pickup.`, ...prev]);
                  }}
                  className={`py-2 rounded-lg border transition cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                    fCompPricing === 'premium' ? 'bg-emerald-50 border-emerald-300 text-emerald-850' : 'bg-white border-transparent'
                  }`}
                >
                  <TrendingUp size={12} className="text-emerald-500" />
                  <span>Rival Premium</span>
                </button>
              </div>
            </div>

            {/* PROMOTION OVERLAY CAMPAIGN */}
            <div className="flex items-center justify-between p-3 bg-indigo-50/70 border border-indigo-150 rounded-2xl">
              <div className="space-y-0.5 max-w-[70%]">
                <span className="text-[11px] font-sans font-bold text-indigo-950 flex items-center gap-1">
                  <Sparkles size={12} className="text-indigo-600" /> Target Promo Overlay
                </span>
                <p className="text-[9px] text-indigo-700 leading-tight">Apply active 15-20% weekend coupons to boost direct channels bookings by +25%.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={fPromoActive} 
                  onChange={(e) => {
                    setFPromoActive(e.target.checked);
                    setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Promo: ${e.target.checked ? 'Enabled' : 'Disabled'} weekend targeted campaign multipliers.`, ...prev]);
                  }}
                  className="sr-only peer" 
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Dynamic AI Strategy selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase font-bold text-slate-500 block">Core AI Pricing Strategy</label>
              <select
                value={fStrategy}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setFStrategy(val);
                  setAiSimulationLogs(prev => [`[${new Date().toISOString().slice(11,16)}] Model: Switching optimizer algorithms to ${val.toUpperCase()}.`, ...prev]);
                }}
                className="w-full bg-slate-50 p-2.5 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:outline-none focus:border-indigo-400"
              >
                <option value="yield_max">AI Dynamic Yield Management (Best RevPAR)</option>
                <option value="optimistic">Optimistic Room High-Rate Modifier (+15% ADR)</option>
                <option value="defensive">Defensive Occupancy Drive Volume (-15% Rate, +15% Vol)</option>
              </select>
            </div>
          </div>

          {/* AI Yield Recommendation Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-150 rounded-3xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-1.5 text-indigo-900 font-sans font-bold text-xs">
              <Brain size={14} className="text-indigo-600 animate-bounce-short" />
              <span>AI Co-Pilot Live Assessment</span>
            </div>
            
            <p className="text-[11px] text-slate-600 leading-relaxed font-sans">
              {forecastAggregates.simAvgOcc >= 75 ? (
                `"Critical positive booking flow! Average ${fHorizon === '7' ? '7' : '30'}-day occupancy is projected to peak at ${forecastAggregates.simAvgOcc}%. High demand limits single room availability. Strongly recommend escalating to Peak Multipliers to unlock approximately ${formatAmount(forecastAggregates.simTotalRev - forecastAggregates.baseTotalRev)} in incremental RevPAR."`
              ) : forecastAggregates.simAvgOcc < 45 ? (
                `"Warning: Projected average occupancy is low at ${forecastAggregates.simAvgOcc}%. Off-season drop is active. Suggest enabling the target campaign promos and switching to Defensive protection strategy to stimulate volume pickup on OTAs."`
              ) : (
                `"Healthy booking stability. Projected occupancy is stable around ${forecastAggregates.simAvgOcc}%. Optimal action: Select AI Dynamic Yield mode to automatically adjust executive suite tariffs on high-demand calendar weekends."`
              )}
            </p>

            <button
              onClick={applyAiRecommendation}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-sans font-extrabold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border-none"
            >
              <Rocket size={14} />
              <span>Apply AI Rate recommendation</span>
            </button>
          </div>

          {/* Sim Console Logs */}
          <div className="bg-slate-900 text-slate-350 p-4 rounded-3xl space-y-2 border border-slate-800">
            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-extrabold block">Simulation Audit Output</span>
            <div className="font-mono text-[10px] space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {aiSimulationLogs.map((log, i) => (
                <div key={i} className="text-slate-400 hover:text-white leading-tight">
                  <span className="text-slate-600 font-bold mr-1">&gt;</span>{log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: RECHARTS & DAY TABLE (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* VISUALIZATION CONTAINER */}
          <div className="bg-white border border-slate-205 rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-indigo-600" size={16} />
                <span className="text-xs font-sans font-black text-slate-800">Operational Outlook Charts</span>
              </div>
              
              {/* CHART SUB TABS */}
              <div className="flex bg-slate-50 border p-1 rounded-lg text-[10px] font-mono font-bold text-slate-500 border-slate-150">
                <button
                  onClick={() => setForecastSubTab('occupancy')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${forecastSubTab === 'occupancy' ? 'bg-white text-slate-900 shadow-3xs border border-slate-200' : 'hover:text-slate-800'}`}
                >
                  Occupancy Curve
                </button>
                <button
                  onClick={() => setForecastSubTab('revenue')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${forecastSubTab === 'revenue' ? 'bg-white text-slate-900 shadow-3xs border border-slate-200' : 'hover:text-slate-800'}`}
                >
                  Revenue Segment Mix
                </button>
                <button
                  onClick={() => setForecastSubTab('distribution')}
                  className={`px-2.5 py-1 rounded transition cursor-pointer ${forecastSubTab === 'distribution' ? 'bg-white text-slate-900 shadow-3xs border border-slate-200' : 'hover:text-slate-800'}`}
                >
                  Room Class Demands
                </button>
              </div>
            </div>

            {/* RENDER ACTIVE CHART */}
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                {forecastSubTab === 'occupancy' ? (
                  <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} fontStyle="mono" />
                    <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={9} unit="%" />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px', fontStyle: 'sans-serif', marginTop: '5px' }} />
                    <Area type="monotone" name="Simulated Occupancy" dataKey="simulatedOccupancyRate" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorSim)" />
                    <Area type="monotone" name="Confirmed Books OTB" dataKey="baselineOccupancyRate" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={1.5} fillOpacity={1} fill="url(#colorBase)" />
                  </AreaChart>
                ) : forecastSubTab === 'revenue' ? (
                  <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} fontStyle="mono" />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }}
                      formatter={(value) => [`$${value}`, 'Revenue']}
                    />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar name="Direct Campaign Rev" dataKey="directRevenue" stackId="a" fill="#4f46e5" />
                    <Bar name="OTA Portfolios Rev" dataKey="otaRevenue" stackId="a" fill="#10b981" />
                    <Bar name="Corporate Portfolios" dataKey="corporateRevenue" stackId="a" fill="#f59e0b" />
                  </BarChart>
                ) : (
                  <BarChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={9} fontStyle="mono" />
                    <YAxis stroke="#94a3b8" fontSize={9} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px', fontFamily: 'monospace' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Bar name="Single Category" dataKey="singleOcc" stackId="occ" fill="#93c5fd" />
                    <Bar name="Double Category" dataKey="doubleOcc" stackId="occ" fill="#60a5fa" />
                    <Bar name="Deluxe Category" dataKey="deluxeOcc" stackId="occ" fill="#3b82f6" />
                    <Bar name="Suite Category" dataKey="suiteOcc" stackId="occ" fill="#2563eb" />
                    <Bar name="Penthouse Premium" dataKey="penthouseOcc" stackId="occ" fill="#1d4ed8" />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* DATE REGISTER DETAIL TABLE */}
          <div className="bg-white border border-slate-205 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <CalendarDays size={14} className="text-indigo-600" />
              <span className="text-xs font-sans font-black text-slate-800">Date-by-Date Smart Ledger Forecast</span>
            </div>
            
            <div className="max-h-[360px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-mono text-slate-400 uppercase font-bold sticky top-0 border-b border-slate-100">
                    <th className="py-2.5 px-4">Date / Day</th>
                    <th className="py-2.5 px-3 text-center">Confirmed OTB</th>
                    <th className="py-2.5 px-3 text-center">Simulated Pickup</th>
                    <th className="py-2.5 px-3 text-center">Occupancy Rate</th>
                    <th className="py-2.5 px-3 text-right">Proj ADR</th>
                    <th className="py-2.5 px-4 text-right">Proj Revenue</th>
                    <th className="py-2.5 px-4 text-center">YIELD ALERT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {forecastData.map((d, i) => {
                    const rateDiff = d.simulatedOccupancyRate;
                    let alertBadge = (
                      <span className="bg-emerald-50 text-emerald-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-emerald-100 inline-block">
                        Optimal Yield
                      </span>
                    );
                    if (rateDiff >= 85) {
                      alertBadge = (
                        <span className="bg-rose-50 text-rose-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-rose-150 inline-block">
                          ⚠️ Sell-out Risk
                        </span>
                      );
                    } else if (rateDiff <= 40) {
                      alertBadge = (
                        <span className="bg-amber-50 text-amber-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border border-amber-100 inline-block">
                          📉 Low Demand
                        </span>
                      );
                    }
                    
                    return (
                      <tr key={i} className="hover:bg-indigo-50/20 transition text-slate-700">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-slate-900">{d.date}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5 font-normal">({d.label.split(' ')[0]})</span>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{d.baselineOccupied} rooms</td>
                        <td className="py-3 px-3 text-center font-mono text-indigo-600 font-bold">+{Math.max(0, d.simulatedOccupied - d.baselineOccupied)} rooms</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`font-mono font-bold ${rateDiff >= 85 ? 'text-rose-600' : rateDiff <= 40 ? 'text-amber-600' : 'text-slate-800'}`}>
                            {rateDiff}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-900">{formatAmount(d.simulatedADR)}</td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-indigo-700">{formatAmount(d.simulatedRevenue)}</td>
                        <td className="py-3 px-4 text-center">{alertBadge}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
