/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, DollarSign, Users, Maximize, X } from 'lucide-react';
import { ModalSystem } from '../../Shared/ModalSystem';

export interface RoomTypeData {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
  bedConfiguration: string;
  roomSizeSqm: number;
  amenities: string[];
  imageUrl1: string;
  imageUrl2?: string;
  imageUrl3?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

interface RoomTypeManagerProps {
  roomTypes: RoomTypeData[];
  onUpdate: (roomTypes: RoomTypeData[]) => void;
}

// --------------- ROOM TYPE MODAL ---------------
interface RoomTypeModalProps {
  roomType: RoomTypeData | null;
  onSave: (data: Partial<RoomTypeData>) => void;
  onClose: () => void;
}

function RoomTypeModal({ roomType, onSave, onClose }: RoomTypeModalProps) {
  const [form, setForm] = useState<Partial<RoomTypeData>>(roomType || {
    name: '',
    description: '',
    basePrice: 100,
    maxOccupancy: 2,
    bedConfiguration: '1 King Bed',
    roomSizeSqm: 28,
    amenities: [],
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    isActive: true,
    displayOrder: 0
  });
  const [amenityInput, setAmenityInput] = useState('');

  const handleAddAmenity = () => {
    if (amenityInput.trim() && !form.amenities?.includes(amenityInput.trim())) {
      setForm({ ...form, amenities: [...(form.amenities || []), amenityInput.trim()] });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setForm({ ...form, amenities: form.amenities?.filter(a => a !== amenity) || [] });
  };

  return (
    <ModalSystem
      isOpen={true}
      onClose={onClose}
      title={roomType ? 'Edit Room Type' : 'Add New Room Type'}
      variant="form"
      size="xl"
      showFooter={true}
      footer={
        <div className="flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20"
          >
            {roomType ? 'Save Changes' : 'Create Room Type'}
          </button>
        </div>
      }
    >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Room Type Name</label>
              <input 
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="e.g. Deluxe Suite"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Base Price (per night)</label>
              <input 
                type="number"
                value={form.basePrice}
                onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Description</label>
            <textarea 
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
              placeholder="Describe the room type features and amenities..."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Max Occupancy</label>
              <input 
                type="number"
                value={form.maxOccupancy}
                onChange={(e) => setForm({ ...form, maxOccupancy: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="2"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Room Size (sqm)</label>
              <input 
                type="number"
                value={form.roomSizeSqm}
                onChange={(e) => setForm({ ...form, roomSizeSqm: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="28"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Bed Configuration</label>
              <input 
                value={form.bedConfiguration}
                onChange={(e) => setForm({ ...form, bedConfiguration: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="1 King Bed"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Amenities</label>
            <div className="flex gap-2">
              <input 
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddAmenity()}
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Add amenity (e.g. WiFi, TV, AC)"
              />
              <button 
                onClick={handleAddAmenity}
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.amenities?.map((amenity, idx) => (
                <div key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg text-[10px] font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  {amenity}
                  <button 
                    onClick={() => handleRemoveAmenity(amenity)}
                    className="hover:text-rose-500 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Images</label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[8px] text-slate-400">Primary Image</label>
                <input 
                  value={form.imageUrl1}
                  onChange={(e) => setForm({ ...form, imageUrl1: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Image URL"
                />
                {form.imageUrl1 && (
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={form.imageUrl1} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-slate-400">Secondary Image</label>
                <input 
                  value={form.imageUrl2}
                  onChange={(e) => setForm({ ...form, imageUrl2: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Image URL"
                />
                {form.imageUrl2 && (
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={form.imageUrl2} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] text-slate-400">Tertiary Image</label>
                <input 
                  value={form.imageUrl3}
                  onChange={(e) => setForm({ ...form, imageUrl3: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Image URL"
                />
                {form.imageUrl3 && (
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={form.imageUrl3} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </ModalSystem>
  );
}

// --------------- ROOM TYPE MANAGER ---------------
export default function RoomTypeManager({ roomTypes, onUpdate }: RoomTypeManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomTypeData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRoomTypes = roomTypes.filter(rt => 
    rt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = (roomTypeData: Partial<RoomTypeData>) => {
    if (editingRoomType) {
      const updated = roomTypes.map(rt => 
        rt.id === editingRoomType.id 
          ? { ...rt, ...roomTypeData, updatedAt: new Date().toISOString() }
          : rt
      );
      onUpdate(updated);
      setEditingRoomType(null);
    } else {
      const newRoomType: RoomTypeData = {
        id: `rt_${Date.now()}`,
        name: roomTypeData.name || '',
        description: roomTypeData.description || '',
        basePrice: roomTypeData.basePrice || 100,
        maxOccupancy: roomTypeData.maxOccupancy || 2,
        bedConfiguration: roomTypeData.bedConfiguration || '1 King Bed',
        roomSizeSqm: roomTypeData.roomSizeSqm || 28,
        amenities: roomTypeData.amenities || [],
        imageUrl1: roomTypeData.imageUrl1 || '',
        imageUrl2: roomTypeData.imageUrl2 || '',
        imageUrl3: roomTypeData.imageUrl3 || '',
        isActive: true,
        displayOrder: roomTypes.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      onUpdate([...roomTypes, newRoomType]);
    }
    setShowAddModal(false);
  };

  const handleDelete = (id: string) => {
    const updated = roomTypes.filter(rt => rt.id !== id);
    onUpdate(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-mono font-black uppercase text-slate-700 dark:text-slate-300 tracking-widest">Room Types</h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full">{roomTypes.length}</span>
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search room types..."
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredRoomTypes.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs italic">
            No room types found
          </div>
        ) : (
          filteredRoomTypes.map((rt) => (
            <div key={rt.id} className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-indigo-300 transition-colors">
              <div className="flex gap-4">
                {rt.imageUrl1 && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                    <img src={rt.imageUrl1} alt={rt.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase">{rt.name}</h5>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{rt.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { setEditingRoomType(rt); setShowAddModal(true); }}
                        className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={() => handleDelete(rt.id)}
                        className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <DollarSign size={10} className="text-emerald-500" />
                      <span className="font-bold">{rt.basePrice}/night</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <Users size={10} className="text-indigo-500" />
                      <span className="font-bold">{rt.maxOccupancy} guests</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-600">
                      <Maximize size={10} className="text-amber-500" />
                      <span className="font-bold">{rt.roomSizeSqm}sqm</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <RoomTypeModal
          roomType={editingRoomType}
          onSave={handleSave}
          onClose={() => { setShowAddModal(false); setEditingRoomType(null); }}
        />
      )}
    </div>
  );
}
