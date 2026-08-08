/**
 * Executive Approvals Module
 * Unified approval workflow for reservations, rates, discounts, refunds, complimentary services, purchase requests, etc.
 */

import { useState } from 'react';
import {
  CheckCircle2,
  DollarSign,
  ShoppingCart,
  FileText,
  Users,
  Calendar,
  Star,
  Filter
} from 'lucide-react';

const ExecutiveApprovals = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'reservations' | 'rates' | 'discounts' | 'refunds' | 'complimentary' | 'purchases' | 'budget' | 'journal' | 'payments' | 'leave' | 'recruitment' | 'inventory' | 'recipes' | 'menus' | 'access'>('all');

  const categories = [
    { id: 'all', label: 'All Approvals', icon: CheckCircle2 },
    { id: 'reservations', label: 'Reservation Overrides', icon: Calendar },
    { id: 'rates', label: 'Rate Changes', icon: DollarSign },
    { id: 'discounts', label: 'Discounts', icon: DollarSign },
    { id: 'refunds', label: 'Refunds', icon: DollarSign },
    { id: 'complimentary', label: 'Complimentary Services', icon: Star },
    { id: 'purchases', label: 'Purchase Requests', icon: ShoppingCart },
    { id: 'budget', label: 'Budget Requests', icon: DollarSign },
    { id: 'journal', label: 'Journal Entries', icon: FileText },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'leave', label: 'Leave Requests', icon: Users },
    { id: 'recruitment', label: 'Recruitment', icon: Users },
    { id: 'inventory', label: 'Inventory Adjustments', icon: ShoppingCart },
    { id: 'recipes', label: 'Recipe Changes', icon: FileText },
    { id: 'menus', label: 'Menu Changes', icon: FileText },
    { id: 'access', label: 'User Access Requests', icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {categories.find(c => c.id === selectedCategory)?.label}
          </h3>
          <div className="flex gap-2">
            <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-2">
              <Filter size={14} /> Filters
            </button>
          </div>
        </div>
        <div className="text-center py-8">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approval queue and workflow management
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveApprovals;
