/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Package as PackageIcon, Sparkles, Users, Search, CheckCircle2, Minus, Plus, UtensilsCrossed, Bus, Bath, Shirt, Headphones, Car, Bell } from 'lucide-react';
import { Package as PackageType, GuestService } from '../../types/erp';

interface AddOnsSectionProps {
  packageIds: string[];
  guestServiceIds: string[];
  packages: PackageType[];
  guestServices: GuestService[];
  onPackageIdsChange: (value: string[]) => void;
  onGuestServiceIdsChange: (value: string[]) => void;
  formatAmount: (amount: number) => string;
}

const serviceCategoryIcons: Record<GuestService['category'], React.ElementType> = {
  dining: UtensilsCrossed,
  transportation: Bus,
  spa: Bath,
  laundry: Shirt,
  room_service: Bell,
  concierge: Car,
};

const serviceCategoryLabels: Record<GuestService['category'], string> = {
  dining: 'Dining',
  transportation: 'Transportation',
  spa: 'Spa & Wellness',
  laundry: 'Laundry',
  room_service: 'Room Service',
  concierge: 'Concierge',
};

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: 'sm' | 'md';
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ value, min = 0, max = Infinity, onChange, size = 'sm' }) => {
  const buttonSize = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';
  const iconSize = size === 'sm' ? 12 : 14;
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${buttonSize} rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition active:scale-95 shadow-sm`}
      >
        <Minus size={iconSize} />
      </button>
      <span className={`w-5 text-center font-bold text-slate-900 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${buttonSize} rounded-full border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-40 transition active:scale-95 shadow-sm`}
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
};

const parseHighlights = (description?: string) => {
  if (!description) return [];
  return description
    .split(/\n|•|◦|-/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
};

export default function AddOnsSection({
  packageIds,
  guestServiceIds,
  packages,
  guestServices,
  onPackageIdsChange,
  onGuestServiceIdsChange,
  formatAmount,
}: AddOnsSectionProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<GuestService['category'] | 'all'>('all');

  const getPackageQuantity = (id: string) => packageIds.filter(pid => pid === id).length;
  const setPackageQuantity = (id: string, quantity: number) => {
    const current = getPackageQuantity(id);
    if (quantity === current) return;
    let newIds = [...packageIds];
    if (quantity > current) {
      for (let i = 0; i < quantity - current; i++) newIds.push(id);
    } else {
      let toRemove = current - quantity;
      newIds = newIds.filter(pid => {
        if (pid === id && toRemove > 0) {
          toRemove--;
          return false;
        }
        return true;
      });
    }
    onPackageIdsChange(newIds);
  };

  const getServiceQuantity = (id: string) => guestServiceIds.filter(sid => sid === id).length;
  const setServiceQuantity = (id: string, quantity: number) => {
    const current = getServiceQuantity(id);
    if (quantity === current) return;
    let newIds = [...guestServiceIds];
    if (quantity > current) {
      for (let i = 0; i < quantity - current; i++) newIds.push(id);
    } else {
      let toRemove = current - quantity;
      newIds = newIds.filter(sid => {
        if (sid === id && toRemove > 0) {
          toRemove--;
          return false;
        }
        return true;
      });
    }
    onGuestServiceIdsChange(newIds);
  };

  const availableServices = guestServices.filter(s => s.available);
  const uniqueCategories = Array.from(new Set(availableServices.map(s => s.category)));
  const filteredServices = availableServices
    .filter(s => selectedCategory === 'all' || s.category === selectedCategory)
    .filter(s => {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.35, ease: 'easeOut' }}
      className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-8"
    >
      <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
        <Sparkles size={18} className="text-indigo-500" /> Personalize Your Stay
      </h2>

      {/* Packages */}
      {packages.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
              <PackageIcon size={18} className="text-indigo-500" /> Exclusive Packages
            </h3>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">VIP Upgrades</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg, idx) => {
              const quantity = getPackageQuantity(pkg.id);
              const isSelected = quantity > 0;
              const highlights = parseHighlights(pkg.description);
              return (
                <div
                  key={pkg.id}
                  className={`flex flex-col justify-between p-5 rounded-xl border transition-all ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-50/10 ring-1 ring-indigo-400 shadow-md shadow-indigo-900/5'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">{pkg.name}</h3>
                      {idx === 0 && (
                        <span className="shrink-0 text-[8px] font-extrabold uppercase tracking-widest bg-indigo-500 text-slate-900 px-2 py-0.5 rounded-md">
                          Popular
                        </span>
                      )}
                    </div>

                    {highlights.length > 0 ? (
                      <ul className="mt-3 space-y-1.5">
                        {highlights.slice(0, 4).map((highlight, hIdx) => (
                          <li key={hIdx} className="flex items-start gap-1.5 text-xs text-slate-600 leading-relaxed">
                            <CheckCircle2 size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 mt-2 leading-relaxed">{pkg.description}</p>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upgrade Rate</p>
                      <p className="text-base font-black text-slate-900 leading-none mt-1">
                        {formatAmount(pkg.price)}
                        <span className="text-[10px] font-medium text-slate-400 uppercase ml-0.5">/{pkg.chargeFrequency}</span>
                      </p>
                    </div>

                    <QuantityStepper value={quantity} min={0} max={99} onChange={(value) => setPackageQuantity(pkg.id, value)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Guest Services */}
      {guestServices.length > 0 && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-lg">
                  <Users size={18} className="text-indigo-500" /> Guest Services
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Select optional resort extras and guest services</p>
              </div>

              <div className="relative w-full md:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search extras..."
                  className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400 transition"
                />
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none">
              {uniqueCategories.map(cat => {
                const Icon = serviceCategoryIcons[cat];
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    <Icon size={12} />
                    <span>{serviceCategoryLabels[cat]}</span>
                  </button>
                );
              })}
              {uniqueCategories.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  All
                </button>
              )}
            </div>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <PackageIcon size={28} className="mx-auto text-slate-300 mb-2" />
              <p className="text-slate-500 text-xs font-semibold">No extra services match your search</p>
              <button
                type="button"
                onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredServices.map(gs => {
                const quantity = getServiceQuantity(gs.id);
                const isSelected = quantity > 0;
                const SvcIcon = serviceCategoryIcons[gs.category] || PackageIcon;
                return (
                  <div
                    key={gs.id}
                    className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/10 ring-1 ring-indigo-400 shadow-md shadow-indigo-900/5'
                        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <SvcIcon size={18} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{gs.name}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{gs.description}</p>
                        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[8px] font-extrabold uppercase tracking-wider">
                          {gs.category?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Service Fee</p>
                        <p className="text-sm font-bold text-slate-900 mt-0.5">
                          {formatAmount(gs.price)}
                        </p>
                      </div>

                      <QuantityStepper value={quantity} min={0} max={99} onChange={(value) => setServiceQuantity(gs.id, value)} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
