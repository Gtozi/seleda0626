/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Standalone Front Desk Portal — all sub-modules visible without permission checks.
 */

import React, { useState } from 'react';
import DashboardModule from './DashboardModule';
import ReservationsModule from './ReservationsModule';
import CheckInOutModule from './CheckInOutModule';
import CRMModule from './CRMModule';
import ReportsAuditModule from './ReportsAuditModule';
import GiftShopPOS from './GiftShopPOS';
import OfficeInventoryModule from './OfficeInventoryModule';
import SalesMarketingModule from './SalesMarketingModule';
import {
  LayoutDashboard,
  Calendar,
  Coins,
  Users,
  FileBarChart,
  ShoppingCart,
  Package,
  Megaphone
} from 'lucide-react';

export default function FrontDeskPortal({
  currentUser,
  onPrintGuest,
  onPrintGroup
}: {
  currentUser?: any;
  onPrintGuest?: (data: { guestName: string; guestEmail: string; guestPhone: string; reservationId: string; roomNumber: string; checkInDate: string }) => void;
  onPrintGroup?: (data: { groupName: string; contactName: string; contactEmail: string; contactPhone: string; groupId: string; roomCount: number; checkInDate: string }) => void;
}) {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'reservations' | 'folio' | 'crm' | 'reports' | 'giftshop' | 'inventory' | 'sales'
  >('dashboard');

  // Internal routing state
  const [checkoutFolioId, setCheckoutFolioId] = useState<string | undefined>(undefined);
  const [crmInitialData, setCrmInitialData] = useState<
    | {
        name?: string;
        email?: string;
        phone?: string;
        resId?: string;
        rm?: string;
        date?: string;
        isGroup?: boolean;
        groupId?: string;
        groupName?: string;
        contactName?: string;
        roomCount?: number;
      }
    | undefined
  >(undefined);
  const [viewGuestId, setViewGuestId] = useState<string | undefined>(undefined);

  const handleNavigateToCRM = (resData: {
    id: string;
    roomNumber?: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    checkInDate: string;
  }) => {
    setCrmInitialData({
      name: resData.guestName,
      email: resData.guestEmail,
      phone: resData.guestPhone,
      resId: resData.id,
      rm: resData.roomNumber,
      date: resData.checkInDate
    });
    setActiveTab('crm');
  };

  const handleProcessCheckout = (resId: string) => {
    setCheckoutFolioId(resId);
    setActiveTab('folio');
  };

  const handleViewGuestProfile = (guestId: string) => {
    setViewGuestId(guestId);
    setActiveTab('crm');
  };

  const handleGroupCheckIn = (group: {
    id: string;
    groupName: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    roomCount: number;
    checkInDate: string;
  }) => {
    setCrmInitialData({
      name: group.contactName,
      email: group.contactEmail,
      phone: group.contactPhone,
      isGroup: true,
      groupId: group.id,
      groupName: group.groupName,
      contactName: group.contactName,
      roomCount: group.roomCount,
      date: group.checkInDate
    });
    setActiveTab('crm');
  };

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reservations' as const, label: 'Reservations', icon: Calendar },
    { id: 'folio' as const, label: 'Folio', icon: Coins },
    { id: 'crm' as const, label: 'CRM Board', icon: Users },
    { id: 'reports' as const, label: 'Reports & Audit', icon: FileBarChart },
    { id: 'giftshop' as const, label: 'Gift Shop', icon: ShoppingCart },
    { id: 'inventory' as const, label: 'Office Inventory', icon: Package },
    { id: 'sales' as const, label: 'Sales & Campaigns', icon: Megaphone },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-navigation bar */}
      <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-700 rounded-xl self-center text-xs font-sans font-medium select-none gap-1 transition-colors duration-300 card-shadow mb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer smooth-transition flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white font-bold shadow-md text-[11px]'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 text-[11px]'
              }`}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Module content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardModule
            onNavigateToCRM={handleNavigateToCRM}
            onProcessCheckout={handleProcessCheckout}
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsModule
            onNavigateToCRM={handleNavigateToCRM}
            onProcessCheckout={handleProcessCheckout}
            onGroupCheckIn={handleGroupCheckIn}
            onViewGuestProfile={handleViewGuestProfile}
            currentUser={currentUser}
          />
        )}

        {activeTab === 'folio' && (
          <CheckInOutModule
            initialFolioResId={checkoutFolioId}
            onClearFolioResId={() => setCheckoutFolioId(undefined)}
          />
        )}

        {activeTab === 'crm' && (
          <CRMModule
            initialGuestData={crmInitialData}
            onClearInitialData={() => setCrmInitialData(undefined)}
            viewGuestId={viewGuestId}
            onClearViewGuestId={() => setViewGuestId(undefined)}
            onOnboardSuccess={(data) => onPrintGuest?.(data)}
            onGroupOnboardSuccess={(data) => onPrintGroup?.(data)}
          />
        )}

        {activeTab === 'reports' && <ReportsAuditModule />}
        {activeTab === 'giftshop' && <GiftShopPOS />}
        {activeTab === 'inventory' && <OfficeInventoryModule />}
        {activeTab === 'sales' && <SalesMarketingModule />}
      </div>
    </div>
  );
}
