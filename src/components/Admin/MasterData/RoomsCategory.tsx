/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home, AlertTriangle, FileCheck, Plus, Edit2, Trash2 } from 'lucide-react';
import { Room } from '../../types/erp';

interface RoomsCategoryProps {
  rooms: Room[];
  filteredRooms: Room[];
  formatAmount: (amount: number) => string;
  onInspect: (room: Room) => void;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string) => void;
  onAddRoom: () => void;
}

export default function RoomsCategory({
  rooms,
  filteredRooms,
  formatAmount,
  onInspect,
  onEdit,
  onDelete,
  onAddRoom,
}: RoomsCategoryProps) {
  return (
    <div className="space-y-6">
      {/* Internal Dashboard metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Registered Rooms', count: rooms.length, desc: 'Database Records', icon: Home, accent: 'text-indigo-500' },
          { label: 'Out of Order Holds', count: rooms.filter(r => r.status === 'Out of Order').length, desc: 'Maintenance Holds', icon: AlertTriangle, accent: 'text-rose-500' },
          { label: 'Clean Vacant Ready', count: rooms.filter(r => r.status === 'Vacant Clean').length, desc: 'Housekeeping Confirmed', icon: FileCheck, accent: 'text-emerald-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-850 flex items-center justify-center rounded-xl">
                <s.icon size={20} className={s.accent} />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">{s.label}</span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{s.count}</h4>
              </div>
            </div>
            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-sm uppercase font-mono">{s.desc}</span>
          </div>
        ))}
      </div>

      {/* Properties List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-50 dark:border-slate-850 flex justify-between items-center">
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Registered Property Inventory ({filteredRooms.length})</h3>
          <button
            onClick={onAddRoom}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-1 cursor-pointer"
          >
            <Plus size={12} /> Map New Room
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-3">Room Unit</th>
                <th className="px-6 py-3">Room Type</th>
                <th className="px-6 py-3">Level / Floor</th>
                <th className="px-6 py-3">Base Tariff</th>
                <th className="px-6 py-3">Active Status</th>
                <th className="px-6 py-3 text-right">Mappers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-850">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-xs italic">
                    No physical room records matching query.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => (
                  <tr
                    key={room.id}
                    onClick={() => onInspect(room)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/20 text-orange-600 flex items-center justify-center font-black font-mono text-xs">{room.number}</div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-900 dark:text-white">Suite-{room.id}</span>
                          <span className="text-[8px] font-bold text-slate-400">UID: #{room.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-200">{room.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500 font-mono">Floor {room.floor}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-black text-emerald-600 font-mono">{formatAmount(room.rate)}/night</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                        room.status.includes('Clean') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' :
                        room.status.includes('Dirty') ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/10' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-900/10'
                      }`}>
                        {room.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(room);
                          }}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 transition rounded-lg"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(room.id);
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition rounded-lg"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
