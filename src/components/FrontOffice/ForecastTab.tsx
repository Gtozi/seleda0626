/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Reservation, Room } from '../../types/erp';
import { toISODate } from '../../utils/date';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  RefreshCw,
  Activity,
  BarChart3,
  Database
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

interface ForecastTabProps {
  reservations: Reservation[];
  rooms: Room[];
  currentSystemDate: string;
  formatAmount: (amount: number) => string;
  triggerLiveSyncSimulation: () => void;
}

export default function ForecastTab({
  reservations,
  rooms,
  currentSystemDate,
  formatAmount,
  triggerLiveSyncSimulation
}: ForecastTabProps) {
  const [fHorizon, setFHorizon] = useState<'7' | '30'>('7');
  const [fDemandMultiplier, setFDemandMultiplier] = useState<number>(1.2);
  const [fStrategy, setFStrategy] = useState<'optimistic' | 'defensive' | 'yield_max'>('yield_max');
  const [fCompPricing, setFCompPricing] = useState<'undercut' | 'fair' | 'premium'>('premium');
  const [fPromoActive, setFPromoActive] = useState<boolean>(true);

  // Compile Forecast Data
  const forecastData = useMemo(() => {
    const horizonDays = fHorizon === '7' ? 7 : 30;
    const dateRange = [];
    const baseDate = new Date(currentSystemDate || new Date().toISOString().split('T')[0]);
    
    for (let i = 0; i < horizonDays; i++) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() + i);
      dateRange.push(toISODate(d));
    }
    
    return dateRange.map((dayStr, idx) => {
      const otbRes = reservations.filter(res => {
        const isConfirmed = res.status === 'Confirmed' || res.status === 'CheckedIn';
        if (!isConfirmed) return false;
        return res.checkInDate <= dayStr && res.checkOutDate > dayStr;
      });
      
      const baselineOccupied = otbRes.length;
      const capacity = rooms.length || 24;
      const baselineRevenue = otbRes.reduce((sum, r) => sum + (r.rate || 150), 0);
      const baselineADR = baselineOccupied > 0 ? Math.round(baselineRevenue / baselineOccupied) : 180;
      
      const dta = idx;
      const isWeekend = [0, 5, 6].includes(new Date(dayStr).getDay());
      const pickupBaseline = isWeekend ? 3.8 : 1.8;
      const pickupDecay = dta === 0 ? 0 : dta <= 3 ? 0.35 : dta <= 7 ? 0.65 : dta <= 14 ? 0.85 : 1.0;
      
      let compModifier = 1.0;
      if (fCompPricing === 'undercut') compModifier = 0.68;
      if (fCompPricing === 'premium') compModifier = 1.32;
      
      let promoModifier = fPromoActive ? 1.25 : 1.0;
      const vacantCount = Math.max(0, capacity - baselineOccupied);
      const projectedPickup = pickupBaseline * pickupDecay * fDemandMultiplier * compModifier * promoModifier;
      const simulatedOccupied = baselineOccupied + Math.min(vacantCount, Math.round(projectedPickup));
      const simulatedOccupancyRate = Math.min(100, Math.round((simulatedOccupied / capacity) * 100));
      
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
      
      const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dObj = new Date(dayStr);
      const label = `${weekdayNames[dObj.getDay()]} ${monthNames[dObj.getMonth()]} ${dObj.getDate()}`;
      
      return {
        date: dayStr,
        label,
        baselineOccupied,
        baselineOccupancyRate: Math.min(100, Math.round((baselineOccupied / capacity) * 100)),
        baselineRevenue,
        baselineADR,
        simulatedOccupied,
        simulatedOccupancyRate,
        simulatedRevenue,
        simulatedADR,
        directRevenue: Math.round(simulatedRevenue * (fPromoActive ? 0.45 : 0.35)),
        otaRevenue: Math.round(simulatedRevenue * (fPromoActive ? 0.35 : 0.45)),
        corporateRevenue: Math.round(simulatedRevenue * 0.20),
      };
    });
  }, [currentSystemDate, reservations, rooms.length, fHorizon, fDemandMultiplier, fCompPricing, fStrategy, fPromoActive]);

  const forecastAggregates = useMemo(() => {
    const len = forecastData.length;
    if (len === 0) return { avgOcc: 0, totalRev: 0, avgADR: 0, avgRevPAR: 0 };
    
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
    };
  }, [forecastData, rooms.length]);

  if (!reservations || reservations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
        <div className="text-center">
          <Calendar size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No reservation data available</p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Add reservations to enable forecasting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reservation Forecast</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Predictive occupancy and revenue analysis based on current bookings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setFDemandMultiplier(1.2);
                setFCompPricing('premium');
                setFStrategy('yield_max');
                setFPromoActive(true);
                setFHorizon('7');
              }}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
            >
              <RefreshCw size={16} className="inline mr-2" /> Reset
            </button>
            <button
              onClick={triggerLiveSyncSimulation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Activity size={16} className="inline mr-2" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Occupancy</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {forecastAggregates.simAvgOcc}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Base: {forecastAggregates.baseAvgOcc}%
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Projected Revenue</span>
            <DollarSign size={16} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(forecastAggregates.simTotalRev)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            OTB: {formatAmount(forecastAggregates.baseTotalRev)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Forecasted ADR</span>
            <TrendingUp size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(forecastAggregates.simAvgADR)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Base: {formatAmount(forecastAggregates.baseAvgADR)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Forecasted RevPAR</span>
            <BarChart3 size={16} className="text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatAmount(forecastAggregates.simAvgRevPAR)}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Base: {formatAmount(forecastAggregates.baseAvgRevPAR)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Parameters</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Forecast Horizon</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFHorizon('7')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      fHorizon === '7' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    7 Days
                  </button>
                  <button
                    onClick={() => setFHorizon('30')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition ${
                      fHorizon === '30' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    30 Days
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Market Demand: {Math.round(fDemandMultiplier * 100)}%</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={fDemandMultiplier}
                  onChange={(e) => setFDemandMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pricing Strategy</label>
                <select
                  value={fStrategy}
                  onChange={(e) => setFStrategy(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="yield_max">Yield Management</option>
                  <option value="optimistic">Optimistic (+15%)</option>
                  <option value="defensive">Defensive (-15%)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Competitor Pricing</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setFCompPricing('undercut')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition ${
                      fCompPricing === 'undercut' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Undercut
                  </button>
                  <button
                    onClick={() => setFCompPricing('fair')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition ${
                      fCompPricing === 'fair' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Fair
                  </button>
                  <button
                    onClick={() => setFCompPricing('premium')}
                    className={`py-2 px-2 rounded-lg text-xs font-medium transition ${
                      fCompPricing === 'premium' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    Premium
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Weekend Promo</span>
                <button
                  onClick={() => setFPromoActive(!fPromoActive)}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    fPromoActive ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    fPromoActive ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Occupancy Forecast</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" name="Simulated" dataKey="simulatedOccupancyRate" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorSim)" />
                  <Area type="monotone" name="Confirmed" dataKey="baselineOccupancyRate" stroke="#9ca3af" strokeDasharray="3 3" strokeWidth={2} fillOpacity={0.1} fill="#9ca3af" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forecast Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Daily Forecast</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-slate-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-gray-600 dark:text-gray-400 font-medium">Date</th>
                    <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-400 font-medium">Confirmed</th>
                    <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-400 font-medium">Simulated</th>
                    <th className="px-4 py-2 text-center text-gray-600 dark:text-gray-400 font-medium">Occupancy</th>
                    <th className="px-4 py-2 text-right text-gray-600 dark:text-gray-400 font-medium">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {forecastData.map((d, i) => (
                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                      <td className="px-4 py-2 text-gray-900 dark:text-white">{d.date}</td>
                      <td className="px-4 py-2 text-center text-gray-600 dark:text-gray-400">{d.baselineOccupied}</td>
                      <td className="px-4 py-2 text-center text-blue-600 font-medium">{d.simulatedOccupied}</td>
                      <td className="px-4 py-2 text-center text-gray-900 dark:text-white">{d.simulatedOccupancyRate}%</td>
                      <td className="px-4 py-2 text-right text-gray-900 dark:text-white font-medium">{formatAmount(d.simulatedRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
