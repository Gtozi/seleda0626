/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Standalone Front Desk Portal — all sub-modules visible without permission checks.
 */

import React, { useState } from 'react';
import { useModalReturn } from '../../context/ModalReturnContext';
import DashboardModule from './DashboardModule';
import ReservationsModule from './ReservationsModule';
import CheckInOutModule from './CheckInOutModule';
import CRMModule from './CRMModule';
import ReportsAuditModule from './ReportsAuditModule';
import GiftShopPOS from './GiftShopPOS';
import OfficeInventoryModule from './OfficeInventoryModule';
import FolioPaymentAudit from './FolioPaymentAudit';
import FolioPortal from './FolioPortal';
type FrontDeskTab = 'dashboard' | 'reservations' | 'folio' | 'crm' | 'reports' | 'giftshop' | 'inventory';
type ReservationsTab = 'form' | 'calendar' | 'ota' | 'revenue' | 'walkin' | 'forecast';

export default function FrontDeskPortal({
  currentUser,
  onPrintGuest,
  onPrintGroup,
  activeTab: externalActiveTab,
  onTabChange
}: {
  currentUser?: any;
  onPrintGuest?: (data: { guestName: string; guestEmail: string; guestPhone: string; reservationId: string; roomNumber: string; checkInDate: string }) => void;
  onPrintGroup?: (data: { groupName: string; contactName: string; contactEmail: string; contactPhone: string; groupId: string; roomCount: number; checkInDate: string }) => void;
  activeTab?: FrontDeskTab;
  onTabChange?: (tab: FrontDeskTab) => void;
}) {
  const [internalActiveTab, setInternalActiveTab] = useState<FrontDeskTab>('dashboard');
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: FrontDeskTab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalActiveTab(tab);
  };

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
  const { push, pop } = useModalReturn();

  const [viewGuestId, setViewGuestId] = useState<string | undefined>(undefined);
  const [viewGroupId, setViewGroupId] = useState<string | undefined>(undefined);
  const [reservationsActiveTab, setReservationsActiveTab] = useState<ReservationsTab>('form');
  const [selectedReservation, setSelectedReservation] = useState<any | null>(null);

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

  const handleViewGuestProfile = (guestId: string, restore?: () => void) => {
    const returnTab = activeTab;
    push({
      id: `frontdesk-tab-${returnTab}`,
      name: returnTab,
      restore: () => {
        setActiveTab(returnTab);
        restore?.();
      }
    });
    setViewGuestId(guestId);
    setActiveTab('crm');
  };

  const handleViewGroupProfile = (groupId: string, restore?: () => void) => {
    const returnTab = activeTab;
    push({
      id: `frontdesk-tab-${returnTab}`,
      name: returnTab,
      restore: () => {
        setActiveTab(returnTab);
        restore?.();
      }
    });
    setViewGroupId(groupId);
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

  return (
    <div className="flex flex-col h-full">
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
            onViewGroupProfile={handleViewGroupProfile}
            currentUser={currentUser}
            activeTab={reservationsActiveTab}
            onTabChange={setReservationsActiveTab}
            selectedCalendarRes={selectedReservation}
            onSelectedCalendarResChange={setSelectedReservation}
          />
        )}

        {activeTab === 'folio' && (
          <FolioPortal
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
            viewGroupId={viewGroupId}
            onClearViewGroupId={() => setViewGroupId(undefined)}
            onOnboardSuccess={(data) => onPrintGuest?.(data)}
            onGroupOnboardSuccess={(data) => onPrintGroup?.(data)}
          />
        )}

        {activeTab === 'reports' && <ReportsAuditModule />}
        {activeTab === 'giftshop' && <GiftShopPOS />}
        {activeTab === 'inventory' && <OfficeInventoryModule />}
      </div>
    </div>
  );
}
