import React from 'react';
import TransportationDashboard from './TransportationDashboard';
import TransportationRequests from './TransportationRequests';
import DispatchCenter from './DispatchCenter';
import TripManagement from './TripManagement';
import AirportTransfers from './AirportTransfers';
import ShuttleManagement from './ShuttleManagement';
import GuestTransportation from './GuestTransportation';
import CorporateTransportation from './CorporateTransportation';
import StaffTransportation from './StaffTransportation';
import FleetManagement from './FleetManagement';
import VehicleRegistry from './VehicleRegistry';
import DriverManagement from './DriverManagement';
import RouteManagement from './RouteManagement';
import SchedulingDispatch from './SchedulingDispatch';
import GPSTracking from './GPSTracking';
import FuelManagement from './FuelManagement';
import VehicleMaintenanceInterface from './VehicleMaintenanceInterface';
import ContractorTaxiManagement from './ContractorTaxiManagement';
import BillingCharges from './BillingCharges';
import CommunicationCenter from './CommunicationCenter';
import TransportationReports from './TransportationReports';
import TransportationConfiguration from './TransportationConfiguration';

const TransportationPortal: React.FC<{ activeTab?: string }> = ({ activeTab = 'dashboard' }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-fade-in">
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'dashboard' && <TransportationDashboard />}
        {activeTab === 'requests' && <TransportationRequests />}
        {activeTab === 'dispatch' && <DispatchCenter />}
        {activeTab === 'trips' && <TripManagement />}
        {activeTab === 'airport' && <AirportTransfers />}
        {activeTab === 'shuttle' && <ShuttleManagement />}
        {activeTab === 'guest' && <GuestTransportation />}
        {activeTab === 'corporate' && <CorporateTransportation />}
        {activeTab === 'staff' && <StaffTransportation />}
        {activeTab === 'fleet' && <FleetManagement />}
        {activeTab === 'vehicles' && <VehicleRegistry />}
        {activeTab === 'drivers' && <DriverManagement />}
        {activeTab === 'routes' && <RouteManagement />}
        {activeTab === 'scheduling' && <SchedulingDispatch />}
        {activeTab === 'gps' && <GPSTracking />}
        {activeTab === 'fuel' && <FuelManagement />}
        {activeTab === 'maintenance' && <VehicleMaintenanceInterface />}
        {activeTab === 'contractors' && <ContractorTaxiManagement />}
        {activeTab === 'billing' && <BillingCharges />}
        {activeTab === 'communication' && <CommunicationCenter />}
        {activeTab === 'reports' && <TransportationReports />}
        {activeTab === 'configuration' && <TransportationConfiguration />}
      </div>
    </div>
  );
};

export default TransportationPortal;