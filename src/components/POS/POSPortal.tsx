/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Utensils,
  Beer,
  Package,
  Sparkles,
  Coffee,
  LayoutGrid,
  Settings,
  BarChart3,
  Store,
  Lock,
  AlertCircle,
  LogOut
} from 'lucide-react';
import POSAnalytics from './POSAnalytics';
import POSSettings from './POSSettings';
import ModernPOSTerminal from './ModernPOSTerminal';

export interface POSOutlet {
  id: string;
  name: string;
  outlet_type: 'restaurant' | 'bar' | 'gift_shop' | 'spa' | 'reception' | 'cafe' | 'pool_bar' | 'room_service' | 'other';
  code: string;
  description?: string;
  location?: string;
  is_active: boolean;
  user_role?: 'manager' | 'supervisor' | 'cashier' | 'server' | 'bartender' | 'staff';
  is_primary?: boolean;
}

interface POSPortalProps {
  user: any;
  onLogout: () => void;
}

export default function POSPortal({ user, onLogout }: POSPortalProps) {
  const [activeTab, setActiveTab] = useState<'pos' | 'outlets' | 'analytics' | 'settings'>('pos');
  const [selectedOutlet, setSelectedOutlet] = useState<POSOutlet | null>(null);
  const [userOutlets, setUserOutlets] = useState<POSOutlet[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize user outlets from props
  useEffect(() => {
    if (user && user.outlets) {
      const formattedOutlets: POSOutlet[] = user.outlets.map((o: any) => ({
        id: o.outlet_id,
        name: o.outlet_name,
        outlet_type: o.outlet_type,
        code: o.outlet_code,
        user_role: o.user_role,
        is_primary: o.is_primary
      }));
      
      setUserOutlets(formattedOutlets);
      
      // Select primary outlet or first available
      const primary = formattedOutlets.find(o => o.is_primary);
      setSelectedOutlet(primary || formattedOutlets[0]);
      setLoading(false);
    }
  }, [user]);

  const getOutletIcon = (type: string) => {
    switch (type) {
      case 'restaurant': return Utensils;
      case 'bar':
      case 'pool_bar': return Beer;
      case 'gift_shop': return Package;
      case 'spa': return Sparkles;
      case 'cafe': return Coffee;
      default: return Store;
    }
  };

  const getOutletTypeLabel = (type: string) => {
    switch (type) {
      case 'restaurant': return 'Restaurant';
      case 'bar': return 'Bar';
      case 'pool_bar': return 'Pool Bar';
      case 'gift_shop': return 'Gift Shop';
      case 'spa': return 'Spa';
      case 'cafe': return 'Café';
      case 'reception': return 'Reception';
      case 'room_service': return 'Room Service';
      default: return 'Outlet';
    }
  };

  const renderPOSInterface = () => {
    if (!selectedOutlet) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Lock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Outlet Access</h3>
            <p className="text-slate-500 dark:text-slate-400">
              You don't have access to any POS outlets. Please contact your administrator.
            </p>
          </div>
        </div>
      );
    }

    return <ModernPOSTerminal outlet={selectedOutlet} />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Loading POS outlets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <ShoppingCart size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">POS Portal</h2>
            <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
              Point of Sale System
            </p>
          </div>
        </div>

        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'pos'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid size={14} /> POS Terminal
          </button>
          <button
            onClick={() => setActiveTab('outlets')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'outlets'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Store size={14} /> My Outlets
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 size={14} /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings size={14} /> Settings
          </button>
        </div>

        <div className="flex items-center gap-3 ml-4">
          <div className="text-right">
            <div className="text-xs font-bold text-white">{user?.name || 'POS User'}</div>
            <div className="text-[10px] text-slate-400">{user?.email}</div>
          </div>
          <button
            onClick={onLogout}
            className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-400 hover:text-rose-300 transition-all"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-[600px]">
        {activeTab === 'pos' && (
          <div className="flex gap-6 h-full">
            {/* Outlet Sidebar */}
            <div className="w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                My Outlets
              </h3>
              <div className="flex-1 space-y-2 overflow-y-auto">
                {userOutlets.map((outlet) => {
                  const Icon = getOutletIcon(outlet.outlet_type);
                  const isSelected = selectedOutlet?.id === outlet.id;
                  return (
                    <button
                      key={outlet.id}
                      onClick={() => setSelectedOutlet(outlet)}
                      className={`w-full p-3 rounded-xl text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{outlet.name}</div>
                        <div className="text-[10px] opacity-75 truncate">
                          {getOutletTypeLabel(outlet.outlet_type)}
                        </div>
                      </div>
                      {outlet.is_primary && (
                        <div className="w-2 h-2 rounded-full bg-amber-400" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {userOutlets.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No outlets assigned</p>
                  </div>
                </div>
              )}
            </div>

            {/* POS Interface */}
            <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              {selectedOutlet && (
                <div className="h-full flex flex-col">
                  {/* Outlet Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = getOutletIcon(selectedOutlet.outlet_type);
                        return <Icon className="w-6 h-6 text-indigo-600" />;
                      })()}
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {selectedOutlet.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            {selectedOutlet.code}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full font-bold uppercase">
                            {selectedOutlet.user_role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* POS Content */}
                  <div className="flex-1 overflow-hidden">
                    {renderPOSInterface()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'outlets' && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">My Assigned Outlets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userOutlets.map((outlet) => {
                const Icon = getOutletIcon(outlet.outlet_type);
                return (
                  <div
                    key={outlet.id}
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500 transition-all"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {outlet.name}
                        </h4>
                        <p className="text-xs text-slate-500">{getOutletTypeLabel(outlet.outlet_type)}</p>
                      </div>
                      {outlet.is_primary && (
                        <span className="text-[10px] px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full font-bold">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Code: {outlet.code}</span>
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg font-bold text-slate-700 dark:text-slate-300">
                        {outlet.user_role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            {userOutlets.length === 0 && (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  No Outlets Assigned
                </h4>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  You haven't been assigned to any POS outlets yet.
                </p>
                <p className="text-sm text-slate-400">
                  Contact your system administrator to get access to POS outlets.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <POSAnalytics outletId={selectedOutlet?.id} outletName={selectedOutlet?.name} />
        )}

        {activeTab === 'settings' && (
          <POSSettings outletId={selectedOutlet?.id} outletName={selectedOutlet?.name} />
        )}
      </div>
    </div>
  );
}
