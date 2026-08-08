/**
 * Restrictions Management Component
 * Manages MinLOS, MaxLOS, CTA, CTD, Stop Sell, Rate Restrictions, and Booking Windows
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  Clock,
  AlertTriangle,
  Settings,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';

const RestrictionsManagement = () => {
  const [selectedRestriction, setSelectedRestriction] = useState<string | null>(null);
  const [restrictionType, setRestrictionType] = useState<'los' | 'cta' | 'ctd' | 'stopsell' | 'rate' | 'booking'>('los');

  const losRestrictions = useMemo(() => [
    { id: '1', roomType: 'Deluxe Suite', minNights: 2, maxNights: 14, dates: '2024-12-15 to 2024-12-31', active: true },
    { id: '2', roomType: 'Standard Room', minNights: 1, maxNights: 30, dates: 'All dates', active: true },
    { id: '3', roomType: 'Ocean View', minNights: 3, maxNights: 7, dates: '2024-12-20 to 2024-12-26', active: true }
  ], []);

  const ctaRestrictions = useMemo(() => [
    { id: '1', roomType: 'Deluxe Suite', dates: '2024-12-24 to 2024-12-26', reason: 'Christmas', active: true },
    { id: '2', roomType: 'All Room Types', dates: '2024-12-31', reason: 'New Year\'s Eve', active: true }
  ], []);

  const ctdRestrictions = useMemo(() => [
    { id: '1', roomType: 'Family Suite', dates: '2024-12-25', reason: 'Christmas Day', active: true }
  ], []);

  const stopSellRestrictions = useMemo(() => [
    { id: '1', roomType: 'Ocean View', dates: '2024-12-20 to 2024-12-31', reason: 'Holiday period', active: true },
    { id: '2', roomType: 'Deluxe Suite', dates: '2024-12-24 to 2024-12-26', reason: 'Christmas', active: false }
  ], []);

  const rateRestrictions = useMemo(() => [
    { id: '1', roomType: 'Standard Room', minRate: 100, maxRate: 200, dates: 'All dates', active: true },
    { id: '2', roomType: 'Deluxe Suite', minRate: 150, maxRate: 300, dates: '2024-12-15 to 2024-12-31', active: true }
  ], []);

  const bookingWindows = useMemo(() => [
    { id: '1', roomType: 'All Room Types', minAdvance: 1, maxAdvance: 365, dates: 'All dates', active: true },
    { id: '2', roomType: 'Deluxe Suite', minAdvance: 7, maxAdvance: 180, dates: 'Peak season', active: true }
  ], []);

  const getRestrictions = () => {
    switch (restrictionType) {
      case 'los': return losRestrictions;
      case 'cta': return ctaRestrictions;
      case 'ctd': return ctdRestrictions;
      case 'stopsell': return stopSellRestrictions;
      case 'rate': return rateRestrictions;
      case 'booking': return bookingWindows;
      default: return losRestrictions;
    }
  };

  const restrictionLabels = {
    los: 'Length of Stay (MinLOS/MaxLOS)',
    cta: 'Closed to Arrival (CTA)',
    ctd: 'Closed to Departure (CTD)',
    stopsell: 'Stop Sell',
    rate: 'Rate Restrictions',
    booking: 'Booking Windows'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Restrictions Management</h2>
          <p className="text-slate-600 dark:text-slate-400">Manage stay restrictions and booking controls</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={restrictionType}
            onChange={(e) => setRestrictionType(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm"
          >
            <option value="los">Length of Stay</option>
            <option value="cta">Closed to Arrival</option>
            <option value="ctd">Closed to Departure</option>
            <option value="stopsell">Stop Sell</option>
            <option value="rate">Rate Restrictions</option>
            <option value="booking">Booking Windows</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Add Restriction
          </button>
        </div>
      </div>

      {/* Restriction Type Tabs */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex gap-2 overflow-x-auto">
          {Object.entries(restrictionLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setRestrictionType(key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                restrictionType === key
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Restrictions List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{restrictionLabels[restrictionType as keyof typeof restrictionLabels]}</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            View Calendar
          </button>
        </div>
        <div className="space-y-3">
          {getRestrictions().map((restriction) => (
            <RestrictionCard
              key={restriction.id}
              restriction={restriction}
              type={restrictionType}
              selected={selectedRestriction === restriction.id}
              onSelect={() => setSelectedRestriction(restriction.id)}
            />
          ))}
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Active Restriction Alerts</h3>
        <div className="space-y-3">
          <AlertCard
            type="warning"
            message="Stop Sell active for Ocean View during holiday period"
            date="2024-12-20 to 2024-12-31"
          />
          <AlertCard
            type="info"
            message="MinLOS of 3 nights required for Ocean View during Christmas"
            date="2024-12-20 to 2024-12-26"
          />
          <AlertCard
            type="error"
            message="CTA active for all room types on New Year's Eve"
            date="2024-12-31"
          />
        </div>
      </div>
    </div>
  );
};

interface RestrictionCardProps {
  restriction: any;
  type: string;
  selected: boolean;
  onSelect: () => void;
}

const RestrictionCard: React.FC<RestrictionCardProps> = ({ restriction, type, selected, onSelect }) => {
  const renderDetails = () => {
    switch (type) {
      case 'los':
        return (
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Min: {restriction.minNights} nights</span>
            <span>Max: {restriction.maxNights} nights</span>
          </div>
        );
      case 'cta':
      case 'ctd':
      case 'stopsell':
        return (
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Reason: {restriction.reason}
          </div>
        );
      case 'rate':
        return (
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Min: ${restriction.minRate}</span>
            <span>Max: ${restriction.maxRate}</span>
          </div>
        );
      case 'booking':
        return (
          <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span>Min: {restriction.minAdvance} days</span>
            <span>Max: {restriction.maxAdvance} days</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-slate-900 dark:text-white">{restriction.roomType}</h4>
            {restriction.active ? (
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">{restriction.dates}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors">
            <Edit className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
      {renderDetails()}
    </div>
  );
};

interface AlertCardProps {
  type: 'warning' | 'info' | 'error';
  message: string;
  date: string;
}

const AlertCard: React.FC<AlertCardProps> = ({ type, message, date }) => {
  const typeConfig = {
    warning: { icon: AlertTriangle, color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800', iconColor: 'text-amber-500' },
    info: { icon: Clock, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', iconColor: 'text-blue-500' },
    error: { icon: Lock, color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800', iconColor: 'text-red-500' }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg border ${config.color}`}>
      <Icon className={`w-5 h-5 ${config.iconColor}`} />
      <div className="flex-1">
        <p className="font-medium text-slate-900 dark:text-white">{message}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{date}</p>
      </div>
    </div>
  );
};

export default RestrictionsManagement;
