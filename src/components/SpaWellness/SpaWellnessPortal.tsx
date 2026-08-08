/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Unified Spa & Wellness Portal — spa operations, wellness services, appointments, 
 * therapists, fitness, memberships, retail, and guest wellness management
 */

import { useState } from 'react';
import { useModalReturn } from '../../context/ModalReturnContext';
import SpaWellnessDashboardModule from './modules/SpaWellnessDashboardModule';
import AppointmentManagementModule from './modules/AppointmentManagementModule';
import TreatmentCatalogModule from './modules/TreatmentCatalogModule';
import TherapistManagementModule from './modules/TherapistManagementModule';
import TreatmentRoomsModule from './modules/TreatmentRoomsModule';
import GuestWellnessProfilesModule from './modules/GuestWellnessProfilesModule';
import WellnessProgramsModule from './modules/WellnessProgramsModule';
import MembershipManagementModule from './modules/MembershipManagementModule';
import FitnessCenterModule from './modules/FitnessCenterModule';
import BeautySalonModule from './modules/BeautySalonModule';
import ThermalHydroFacilitiesModule from './modules/ThermalHydroFacilitiesModule';
import WellnessPackagesModule from './modules/WellnessPackagesModule';
import RetailShopModule from './modules/RetailShopModule';
import InventoryConsumptionModule from './modules/InventoryConsumptionModule';
import GiftCardsVouchersModule from './modules/GiftCardsVouchersModule';
import BillingPaymentsModule from './modules/BillingPaymentsModule';
import CommunicationCenterModule from './modules/CommunicationCenterModule';
import SpaWellnessReportsModule from './modules/SpaWellnessReportsModule';
import SpaWellnessConfigurationModule from './modules/SpaWellnessConfigurationModule';

type SpaWellnessTab = 
  | 'dashboard'
  | 'appointments'
  | 'treatment-catalog'
  | 'therapists'
  | 'treatment-rooms'
  | 'guest-wellness-profiles'
  | 'wellness-programs'
  | 'memberships'
  | 'fitness-center'
  | 'beauty-salon'
  | 'thermal-hydro'
  | 'wellness-packages'
  | 'retail-shop'
  | 'inventory-consumption'
  | 'gift-cards'
  | 'billing-payments'
  | 'communication'
  | 'reports'
  | 'configuration';

export default function SpaWellnessPortal({
  currentUser,
  activeTab: externalActiveTab,
  onTabChange
}: {
  currentUser?: any;
  activeTab?: SpaWellnessTab;
  onTabChange?: (tab: SpaWellnessTab) => void;
}) {
  const [internalActiveTab, setInternalActiveTab] = useState<SpaWellnessTab>('dashboard');
  const activeTab = externalActiveTab ?? internalActiveTab;
  const setActiveTab = (tab: SpaWellnessTab) => {
    if (onTabChange) onTabChange(tab);
    else setInternalActiveTab(tab);
  };

  // Internal routing state
  const [selectedGuestId, setSelectedGuestId] = useState<string | undefined>(undefined);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | undefined>(undefined);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string | undefined>(undefined);
  const { push } = useModalReturn();

  const handleViewGuestProfile = (guestId: string, restore?: () => void) => {
    const returnTab = activeTab;
    push({
      id: `spa-wellness-tab-${returnTab}`,
      name: returnTab,
      restore: () => {
        setActiveTab(returnTab);
        restore?.();
      }
    });
    setSelectedGuestId(guestId);
    setActiveTab('guest-wellness-profiles');
  };

  const handleViewAppointment = (appointmentId: string, restore?: () => void) => {
    const returnTab = activeTab;
    push({
      id: `spa-wellness-tab-${returnTab}`,
      name: returnTab,
      restore: () => {
        setActiveTab(returnTab);
        restore?.();
      }
    });
    setSelectedAppointmentId(appointmentId);
    setActiveTab('appointments');
  };

  const handleViewTherapist = (therapistId: string, restore?: () => void) => {
    const returnTab = activeTab;
    push({
      id: `spa-wellness-tab-${returnTab}`,
      name: returnTab,
      restore: () => {
        setActiveTab(returnTab);
        restore?.();
      }
    });
    setSelectedTherapistId(therapistId);
    setActiveTab('therapists');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Module content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <SpaWellnessDashboardModule
            onViewGuestProfile={handleViewGuestProfile}
            onViewAppointment={handleViewAppointment}
            onViewTherapist={handleViewTherapist}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentManagementModule
            selectedAppointmentId={selectedAppointmentId}
            onClearSelectedAppointmentId={() => setSelectedAppointmentId(undefined)}
            onViewGuestProfile={handleViewGuestProfile}
            onViewTherapist={handleViewTherapist}
          />
        )}

        {activeTab === 'treatment-catalog' && (
          <TreatmentCatalogModule />
        )}

        {activeTab === 'therapists' && (
          <TherapistManagementModule
            selectedTherapistId={selectedTherapistId}
            onClearSelectedTherapistId={() => setSelectedTherapistId(undefined)}
          />
        )}

        {activeTab === 'treatment-rooms' && (
          <TreatmentRoomsModule />
        )}

        {activeTab === 'guest-wellness-profiles' && (
          <GuestWellnessProfilesModule
            selectedGuestId={selectedGuestId}
            onClearSelectedGuestId={() => setSelectedGuestId(undefined)}
          />
        )}

        {activeTab === 'wellness-programs' && (
          <WellnessProgramsModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'memberships' && (
          <MembershipManagementModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'fitness-center' && (
          <FitnessCenterModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'beauty-salon' && (
          <BeautySalonModule
            onViewGuestProfile={handleViewGuestProfile}
            onViewAppointment={handleViewAppointment}
          />
        )}

        {activeTab === 'thermal-hydro' && (
          <ThermalHydroFacilitiesModule />
        )}

        {activeTab === 'wellness-packages' && (
          <WellnessPackagesModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'retail-shop' && (
          <RetailShopModule />
        )}

        {activeTab === 'inventory-consumption' && (
          <InventoryConsumptionModule />
        )}

        {activeTab === 'gift-cards' && (
          <GiftCardsVouchersModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'billing-payments' && (
          <BillingPaymentsModule
            onViewGuestProfile={handleViewGuestProfile}
            onViewAppointment={handleViewAppointment}
          />
        )}

        {activeTab === 'communication' && (
          <CommunicationCenterModule
            onViewGuestProfile={handleViewGuestProfile}
          />
        )}

        {activeTab === 'reports' && (
          <SpaWellnessReportsModule />
        )}

        {activeTab === 'configuration' && (
          <SpaWellnessConfigurationModule />
        )}
      </div>
    </div>
  );
}