/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  LayoutGrid, 
  Users, 
  Waves, 
  Archive, 
  History,
  Activity,
  Package,
  CheckCircle2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

import HKDashboard from './HKDashboard';
import RoomBoardModule from './RoomBoardModule';
import StaffManagementModule from './StaffManagementModule';
import LaundryModule from './LaundryModule';
import LostAndFoundModule from './LostAndFoundModule';
import HousekeepingInventoryModule from './HousekeepingInventoryModule';
import GuestAmenitiesModule from './GuestAmenitiesModule';
import TaskManagementModule from './TaskManagementModule';
// import TaskOptimizationModule from './TaskOptimizationModule';
// import PerformanceAnalyticsModule from './PerformanceAnalyticsModule';
import DepartmentReportsModule from '../Shared/DepartmentReportsModule';
import { StandardHKReports } from './StandardHKReports';

export type HKTab =
  | 'dashboard'
  | 'rooms'
  | 'tasks'
  | 'optimization'
  | 'analytics'
  | 'laundry'
  | 'inventory'
  | 'amenities'
  | 'lostfound'
  | 'staff'
  | 'reports'
  | 'standard-reports';

export type RoomCleaningStatus = 
  | 'Vacant Clean' 
  | 'Vacant Dirty' 
  | 'Occupied Clean' 
  | 'Occupied Dirty' 
  | 'Inspected' 
  | 'Out of Order' 
  | 'Out of Service' 
  | 'Maintenance Required';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Verified';
export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface HKTask {
  id: string;
  type: 'Room Cleaning' | 'Deep Cleaning' | 'Public Area Cleaning' | 'Garden Cleaning' | 'Pool Cleaning' | 'Pest Control' | 'Maintenance Follow-up';
  location: string;
  assignedTo?: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  progress: number;
}

export interface LaundryItem {
  id: string;
  name: string;
  category: 'Guest' | 'Internal';
  serviceType?: 'Wash' | 'Dry Clean' | 'Iron' | 'Express Service';
  pieces: number;
  price?: number;
  status: 'Collected' | 'Washing' | 'Drying' | 'Ironing' | 'Ready' | 'Delivered';
  guestName?: string;
  roomNumber?: string;
  timestamp: string;
}

export default function HousekeepingPortal({ activeTab }: { activeTab: HKTab }) {

  // Shared state 
  const [priorityQueue, setPriorityQueue] = useState<string[]>(['102', '304']);
  const [housekeepers, setHousekeepers] = useState<any[]>([
    { id: 'HK-01', name: 'Staff Member A', avatar: 'SA', status: 'Active Duty', assignedRooms: ['102', '103', '402'], solvedToday: 3, qualityScore: 94 },
    { id: 'HK-02', name: 'Staff Member B', avatar: 'SB', status: 'Active Duty', assignedRooms: ['104', '203'], solvedToday: 5, qualityScore: 88 },
    { id: 'HK-03', name: 'Staff Member C', avatar: 'SC', status: 'On Break', assignedRooms: ['304'], solvedToday: 2, qualityScore: 97 },
    { id: 'HK-04', name: 'Staff Member D', avatar: 'SD', status: 'Active Duty', assignedRooms: [], solvedToday: 4, qualityScore: 91 },
  ]);

  return (
    <div className="space-y-6 animate-fade-in" id="modular-housekeeping-suite">
      <div className="min-h-[600px]">
        {activeTab === 'dashboard' && <HKDashboard />}
        {activeTab === 'rooms' && (
          <RoomBoardModule
            priorityQueue={priorityQueue}
            setPriorityQueue={setPriorityQueue}
            housekeepers={housekeepers}
            setHousekeepers={setHousekeepers}
          />
        )}
        {activeTab === 'tasks' && <TaskManagementModule />}
        {/* {activeTab === 'optimization' && <TaskOptimizationModule />} */}
        {/* {activeTab === 'analytics' && <PerformanceAnalyticsModule />} */}
        {activeTab === 'laundry' && <LaundryModule />}
        {activeTab === 'inventory' && <HousekeepingInventoryModule />}
        {activeTab === 'amenities' && <GuestAmenitiesModule />}
        {activeTab === 'lostfound' && <LostAndFoundModule />}
        {activeTab === 'staff' && (
          <StaffManagementModule
            housekeepers={housekeepers}
            setHousekeepers={setHousekeepers}
          />
        )}
        {activeTab === 'reports' && <DepartmentReportsModule departmentName="Housekeeping" />}
        {activeTab === 'standard-reports' && <StandardHKReports />}
      </div>
    </div>
  );
}
