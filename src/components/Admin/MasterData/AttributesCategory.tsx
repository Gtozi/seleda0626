/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sliders, Bed, Warehouse, MapPin, Database } from 'lucide-react';
import RoomTypeManager, { RoomTypeData } from './RoomTypeManager';
import AttributeManager from './AttributeManager';

interface AttributesCategoryProps {
  roomTypesDetailed: RoomTypeData[];
  roomFeatures: string[];
  guestStatuses: string[];
  inventoryCategories: string[];
  inventoryLocations: string[];
  inventoryUnits: string[];
  departments: string[];
  floors: string[];
  onGlobalSettingsChange: (name: string, description: string, type: string, changes: any) => void;
}

export default function AttributesCategory({
  roomTypesDetailed,
  roomFeatures,
  guestStatuses,
  inventoryCategories,
  inventoryLocations,
  inventoryUnits,
  departments,
  floors,
  onGlobalSettingsChange,
}: AttributesCategoryProps) {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-8 shadow-sm space-y-10">
        <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-6">
          <div>
            <h3 className="text-lg font-sans font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 mb-1">
              <Sliders size={20} className="text-amber-500" />
              Registry Attribute Definitions
            </h3>
            <p className="text-xs text-slate-400">Manage global categorizations, status mappings and unit definitions across the database.</p>
          </div>
        </div>

        {/* Room & Guest Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
              <Bed size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Room & Guest Configuration</h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="lg:col-span-2">
              <RoomTypeManager
                roomTypes={roomTypesDetailed || []}
                onUpdate={(items) => onGlobalSettingsChange('Room Types', `Update room types configuration`, 'global-setting', { roomTypesDetailed: items })}
              />
            </div>
            <AttributeManager
              title="Room Features"
              items={roomFeatures || []}
              onUpdate={(items) => onGlobalSettingsChange('Room Features', `Update room features: ${items.join(', ') || 'none'}`, 'global-setting', { roomFeatures: items })}
            />
            <AttributeManager
              title="Guest Statuses"
              items={guestStatuses || []}
              onUpdate={(items) => onGlobalSettingsChange('Guest Statuses', `Update guest statuses: ${items.join(', ') || 'none'}`, 'global-setting', { guestStatuses: items })}
            />
          </div>
        </div>

        {/* Inventory Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Warehouse size={16} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Inventory Management</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AttributeManager
              title="Inventory Categories"
              items={inventoryCategories || []}
              onUpdate={(items) => onGlobalSettingsChange('Inventory Categories', `Update inventory categories: ${items.join(', ') || 'none'}`, 'global-setting', { inventoryCategories: items })}
            />
            <AttributeManager
              title="Storage Locations"
              items={inventoryLocations || []}
              onUpdate={(items) => onGlobalSettingsChange('Storage Locations', `Update storage locations: ${items.join(', ') || 'none'}`, 'global-setting', { inventoryLocations: items })}
            />
            <AttributeManager
              title="Measurement Units"
              items={inventoryUnits || []}
              onUpdate={(items) => onGlobalSettingsChange('Measurement Units', `Update measurement units: ${items.join(', ') || 'none'}`, 'global-setting', { inventoryUnits: items })}
            />
          </div>
        </div>

        {/* Property Structure */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
              <MapPin size={16} className="text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">Property Structure</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AttributeManager
              title="Property Depts"
              items={departments || []}
              onUpdate={(items) => onGlobalSettingsChange('Property Departments', `Update departments: ${items.join(', ') || 'none'}`, 'global-setting', { departments: items })}
            />
            <AttributeManager
              title="Floor Labels"
              items={floors || []}
              onUpdate={(items) => onGlobalSettingsChange('Floor Labels', `Update floor labels: ${items.join(', ') || 'none'}`, 'global-setting', { floors: items })}
            />
          </div>
        </div>
      </div>

      <div className="p-8 bg-amber-500 rounded-[32px] text-slate-900 flex items-center justify-between shadow-2xl relative overflow-hidden">
        <div className="absolute left-0 top-0 p-8 opacity-10"><Database size={120} /></div>
        <div className="relative z-10 space-y-2">
          <h4 className="text-lg font-black uppercase tracking-widest">Metadata Governance</h4>
          <p className="text-sm opacity-75 max-w-lg leading-relaxed">Changes to these attributes propagate globally. Modification of critical status mappings may require administrative re-indexing.</p>
        </div>
        <button className="px-8 py-4 bg-slate-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition hover:scale-105 shadow-xl shadow-black/20 relative z-10 cursor-pointer">
          Registry Audit Logs
        </button>
      </div>
    </div>
  );
}
