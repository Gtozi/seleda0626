/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  X,
  type LucideIcon
} from 'lucide-react';
import { User } from '../../types/erp';

export interface SubNavItem {
  id: string;
  label: string;
  modId?: string;
  icon?: LucideIcon;
}

interface SideNavigationProps {
  activeDept: string;
  activeDeptLabel?: string;
  currentUser: User | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
  subItems: SubNavItem[];
  activeSubItem: string;
  onSubItemClick: (id: string) => void;
  notifications?: any[];
  unreadNotifCount?: number;
  onToggleNotifications?: () => void;
  showNotifications?: boolean;
  onMarkNotificationRead?: (id: string) => void;
  onClearNotification?: (id: string) => void;
  /**
   * Optional accent class (e.g. `accent-operations`) applied to the `<aside>`
   * root so the side nav adopts the active department's accent color scheme
   * and stays visually consistent with the portal content area.
   */
  accentClass?: string;
}

export function SideNavigation({
  activeDept,
  activeDeptLabel,
  currentUser,
  collapsed,
  onToggleCollapse,
  subItems,
  activeSubItem,
  onSubItemClick,
  notifications = [],
  unreadNotifCount = 0,
  onToggleNotifications,
  showNotifications = false,
  onMarkNotificationRead,
  onClearNotification,
  accentClass,
}: SideNavigationProps) {
  return (
    <aside
      className={`${accentClass ?? ''} bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out h-screen sticky top-0 self-start ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header: Portal Title + Collapse Toggle */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
        {!collapsed && activeDeptLabel && (
          <h2 className="text-sm font-sans font-extrabold text-slate-900 dark:text-white tracking-tight uppercase truncate">
            {activeDeptLabel}
          </h2>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors flex-shrink-0"
          title={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Sub-navigation Items for the active portal */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {subItems.length === 0 && !collapsed && (
            <li className="px-3 py-2 text-xs text-slate-400 italic">No modules available</li>
          )}
          {subItems.map((subItem) => {
            const isActive = activeSubItem === subItem.id;
            const Icon = subItem.icon;
            return (
              <li key={subItem.id}>
                <button
                  onClick={() => onSubItemClick(subItem.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={collapsed ? subItem.label : undefined}
                >
                  {Icon ? (
                    <Icon size={18} className="flex-shrink-0" />
                  ) : !collapsed ? (
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isActive ? 'bg-white' : 'bg-slate-400 dark:bg-slate-600'}`} />
                  ) : null}
                  {!collapsed && (
                    <span className="font-medium text-sm truncate flex-1 text-left">{subItem.label}</span>
                  )}
                  {collapsed && !Icon && (
                    <span className="font-medium text-sm truncate flex-1 text-left">{subItem.label.charAt(0)}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Notifications Bell */}
      {!collapsed && onToggleNotifications && (
        <div className="px-2 py-2 border-t border-slate-200 dark:border-slate-800 relative">
          <button
            id="notif-bell-toggle-btn"
            onClick={onToggleNotifications}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors text-xs"
          >
            <Bell size={16} className={unreadNotifCount > 0 ? 'animate-bounce text-amber-500' : ''} />
            <span className="font-mono font-bold uppercase tracking-wider">Operational Alerts</span>
            {unreadNotifCount > 0 && (
              <span className="ml-auto w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-sans font-bold text-[9px]">
                {unreadNotifCount}
              </span>
            )}
          </button>

          {/* Notifications overlay */}
          {showNotifications && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-xl rounded-2xl w-64 z-40 p-4 space-y-3 animate-slide-in text-slate-600 dark:text-slate-300" id="alerts-ledger-panel">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-700 pb-1.5 text-xs text-slate-800 dark:text-slate-100 font-bold">
                <span>Real-time Alerts ({unreadNotifCount})</span>
                <button
                  onClick={onToggleNotifications}
                  className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-400"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-2xs font-mono text-slate-400 font-bold">
                    No active alerts
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2 rounded-lg text-xs flex flex-col gap-1 ${n.read ? 'bg-slate-50 dark:bg-slate-900/50 opacity-60' : 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100">{n.title}</span>
                        <div className="flex gap-1">
                          {!n.read && onMarkNotificationRead && (
                            <button
                              onClick={() => onMarkNotificationRead(n.id)}
                              className="text-[9px] text-slate-400 hover:text-slate-600"
                            >
                              Mark read
                            </button>
                          )}
                          {onClearNotification && (
                            <button
                              onClick={() => onClearNotification(n.id)}
                              className="text-rose-500 hover:underline text-[9px]"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                      {n.message && <span className="text-slate-500 dark:text-slate-400">{n.message}</span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Info at Bottom */}
      {currentUser && !collapsed && (
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              {currentUser.avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {currentUser.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {currentUser.roleDescription || currentUser.role}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
