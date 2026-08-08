/**
 * Room Operations Overview
 * Combined operational view of room status
 */

import React, { useState, useEffect } from 'react';
import {
  Bed,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Users,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  XCircle
} from 'lucide-react';

interface RoomStatus {
  roomNumber: string;
  roomType: string;
  floor: number;
  status: 'occupied' | 'vacant' | 'dirty' | 'clean' | 'inspected' | 'out-of-order' | 'out-of-service' | 'maintenance';
  guestName?: string;
  lastUpdated: string;
}

const RoomOperationsOverview: React.FC = () => {
  const [selectedFloor, setSelectedFloor] = useState<'all' | '1' | '2' | '3' | '4' | '5'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'occupied' | 'vacant' | 'dirty' | 'clean' | 'inspected' | 'out-of-order' | 'out-of-service' | 'maintenance'>('all');
  const [rooms, setRooms] = useState<RoomStatus[]>([]);

  const mockRooms: RoomStatus[] = [
    { roomNumber: '101', roomType: 'Standard', floor: 1, status: 'occupied', guestName: 'Mr. Smith', lastUpdated: '10:30' },
    { roomNumber: '102', roomType: 'Standard', floor: 1, status: 'clean', lastUpdated: '09:45' },
    { roomNumber: '103', roomType: 'Deluxe', floor: 1, status: 'dirty', lastUpdated: '11:00' },
    { roomNumber: '104', roomType: 'Standard', floor: 1, status: 'occupied', guestName: 'Ms. Johnson', lastUpdated: '08:15' },
    { roomNumber: '201', roomType: 'Deluxe', floor: 2, status: 'inspected', lastUpdated: '10:00' },
    { roomNumber: '202', roomType: 'Suite', floor: 2, status: 'occupied', guestName: 'Dr. Brown', lastUpdated: '09:30' },
    { roomNumber: '203', roomType: 'Deluxe', floor: 2, status: 'out-of-order', lastUpdated: '08:00' },
    { roomNumber: '204', roomType: 'Standard', floor: 2, status: 'vacant', lastUpdated: '10:15' },
    { roomNumber: '301', roomType: 'Suite', floor: 3, status: 'maintenance', lastUpdated: '07:30' },
    { roomNumber: '302', roomType: 'Deluxe', floor: 3, status: 'occupied', guestName: 'Mr. Davis', lastUpdated: '09:00' },
    { roomNumber: '303', roomType: 'Standard', floor: 3, status: 'clean', lastUpdated: '09:45' },
    { roomNumber: '304', roomType: 'Standard', floor: 3, status: 'dirty', lastUpdated: '11:30' },
    { roomNumber: '401', roomType: 'Presidential', floor: 4, status: 'occupied', guestName: 'VVIP Guest', lastUpdated: '08:00' },
    { roomNumber: '402', roomType: 'Suite', floor: 4, status: 'vacant', lastUpdated: '10:00' },
    { roomNumber: '403', roomType: 'Deluxe', floor: 4, status: 'clean', lastUpdated: '09:30' },
    { roomNumber: '404', roomType: 'Standard', floor: 4, status: 'out-of-service', lastUpdated: '08:00' }
  ];

  useEffect(() => {
    setRooms(mockRooms);
  }, []);

  const filteredRooms = rooms.filter(room => {
    const matchesFloor = selectedFloor === 'all' || room.floor.toString() === selectedFloor;
    const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
    return matchesFloor && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'occupied':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'vacant':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800';
      case 'dirty':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      case 'clean':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'inspected':
        return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
      case 'out-of-order':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800';
      case 'out-of-service':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800';
      case 'maintenance':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'occupied':
        return Users;
      case 'vacant':
        return XCircle;
      case 'dirty':
        return AlertTriangle;
      case 'clean':
        return CheckCircle2;
      case 'inspected':
        return CheckCircle2;
      case 'out-of-order':
        return XCircle;
      case 'out-of-service':
        return XCircle;
      case 'maintenance':
        return Wrench;
    }
  };

  const statusCounts = rooms.reduce((acc, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Bed size={28} />
            Room Operations Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Combined operational view of room status</p>
        </div>
        <button className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <RefreshCw size={20} className="text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(statusCounts).map(([status, count]) => {
          const StatusIcon = getStatusIcon(status);
          return (
            <div key={status} className={`p-3 rounded-lg border ${getStatusColor(status)}`}>
              <div className="flex items-center gap-2">
                <StatusIcon size={16} />
                <span className="text-xs font-medium capitalize">{status.replace('-', ' ')}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <select
          value={selectedFloor}
          onChange={(e) => setSelectedFloor(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Floors</option>
          <option value="1">Floor 1</option>
          <option value="2">Floor 2</option>
          <option value="3">Floor 3</option>
          <option value="4">Floor 4</option>
          <option value="5">Floor 5</option>
        </select>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option value="all">All Status</option>
          <option value="occupied">Occupied</option>
          <option value="vacant">Vacant</option>
          <option value="dirty">Dirty</option>
          <option value="clean">Clean</option>
          <option value="inspected">Inspected</option>
          <option value="out-of-order">Out of Order</option>
          <option value="out-of-service">Out of Service</option>
          <option value="maintenance">Maintenance</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredRooms.map(room => {
          const StatusIcon = getStatusIcon(room.status);
          return (
            <div key={room.roomNumber} className={`p-3 rounded-lg border ${getStatusColor(room.status)}`}>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{room.roomNumber}</span>
                <StatusIcon size={16} />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{room.roomType}</p>
              {room.guestName && (
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 truncate">{room.guestName}</p>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Floor {room.floor}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoomOperationsOverview;