import React, { useState, useMemo } from 'react';
import {
  Bed, Image as ImageIcon, Plus, Edit2, Trash2, X, Check, ChevronRight,
  DollarSign, Users, Maximize, Wifi, Tv, Coffee, Shield, Clock, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useERP } from '../../context/ERPContext';
import { RoomTypeDetail, Room } from '../../types/erp';

const RoomInventoryModule = () => {
  const { roomTypes, rooms, addRoomType, updateRoomType, deleteRoomType, formatAmount } = useERP();
  
  const [selectedRoomType, setSelectedRoomType] = useState<RoomTypeDetail | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form state for adding/editing room types
  const [roomTypeForm, setRoomTypeForm] = useState({
    name: '',
    description: '',
    basePrice: 0,
    maxOccupancy: 2,
    bedConfiguration: '',
    roomSizeSqm: 0,
    amenities: [] as string[],
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    isActive: true,
    displayOrder: 0
  });

  // Available amenities options
  const availableAmenities = [
    'Free WiFi', 'Smart TV', 'Work Desk', 'Air Conditioning', 'Mini Bar',
    'Coffee Maker', 'Safe', 'Daily Housekeeping', 'City View', 'Ocean View',
    'Living Room', 'Dining Table', 'Bathtub', 'Robes', 'Premium Bath Products',
    'Turndown Service', 'Panoramic View', 'Private Terrace', 'Jacuzzi',
    'Steam Room', 'Butler Service', 'Private Check-in', 'Airport Transfer',
    'Multiple Smart TVs', 'Fully Stocked Mini Bar', 'Premium Coffee Maker'
  ];

  // Group rooms by room type
  const roomsByType = useMemo(() => {
    const grouped: Record<string, Room[]> = {};
    rooms.forEach(room => {
      const typeId = room.roomTypeId || room.type;
      if (!grouped[typeId]) {
        grouped[typeId] = [];
      }
      grouped[typeId].push(room);
    });
    return grouped;
  }, [rooms]);

  // Get room count for each type
  const getRoomCount = (roomTypeId: string) => {
    return roomsByType[roomTypeId]?.length || 0;
  };

  // Get available rooms count for each type
  const getAvailableCount = (roomTypeId: string) => {
    return roomsByType[roomTypeId]?.filter(r => r.status === 'Vacant Clean').length || 0;
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    addRoomType({
      ...roomTypeForm,
      displayOrder: roomTypes.length + 1
    });
    triggerSuccess(`Room type "${roomTypeForm.name}" created successfully.`);
    setRoomTypeForm({
      name: '',
      description: '',
      basePrice: 0,
      maxOccupancy: 2,
      bedConfiguration: '',
      roomSizeSqm: 0,
      amenities: [],
      imageUrl1: '',
      imageUrl2: '',
      imageUrl3: '',
      isActive: true,
      displayOrder: 0
    });
    setShowAddModal(false);
  };

  const handleUpdateRoomType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomType) return;
    updateRoomType(selectedRoomType.id, roomTypeForm);
    triggerSuccess(`Room type "${roomTypeForm.name}" updated successfully.`);
    setShowEditModal(false);
    setSelectedRoomType(null);
  };

  const handleDeleteRoomType = (id: string) => {
    if (confirm('Are you sure you want to delete this room type? This will affect all rooms associated with it.')) {
      deleteRoomType(id);
      triggerSuccess('Room type deleted successfully.');
    }
  };

  const openEditModal = (roomType: RoomTypeDetail) => {
    setSelectedRoomType(roomType);
    setRoomTypeForm({
      name: roomType.name,
      description: roomType.description,
      basePrice: roomType.basePrice,
      maxOccupancy: roomType.maxOccupancy,
      bedConfiguration: roomType.bedConfiguration,
      roomSizeSqm: roomType.roomSizeSqm,
      amenities: roomType.amenities,
      imageUrl1: roomType.imageUrl1,
      imageUrl2: roomType.imageUrl2 || '',
      imageUrl3: roomType.imageUrl3 || '',
      isActive: roomType.isActive,
      displayOrder: roomType.displayOrder
    });
    setShowEditModal(true);
  };

  const toggleAmenity = (amenity: string) => {
    setRoomTypeForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const sortedRoomTypes = [...roomTypes].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Toast */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-500 text-white px-6 py-4 rounded-3xl shadow-lg flex items-center justify-between text-xs font-bold"
          >
            <div className="flex items-center gap-2">
              <Check size={16} />
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="opacity-85 hover:opacity-100">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Bed className="text-indigo-600" size={24} />
            Room & Asset Inventory
          </h2>
          <p className="text-xs text-slate-400 mt-1">Manage room types, descriptions, amenities, and pricing</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition"
        >
          <Plus size={14} /> Add Room Type
        </button>
      </div>

      {/* Room Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedRoomTypes.map((roomType) => (
          <motion.div
            key={roomType.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Image Gallery */}
            <div className="relative h-48 bg-slate-100">
              {roomType.imageUrl1 && (
                <img
                  src={roomType.imageUrl1}
                  alt={roomType.name}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-3 right-3 flex gap-1">
                {roomType.imageUrl1 && (
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                )}
                {roomType.imageUrl2 && (
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                )}
                {roomType.imageUrl3 && (
                  <div className="w-2 h-2 rounded-full bg-white/80" />
                )}
              </div>
              <div className="absolute bottom-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg">
                <span className="text-white text-[10px] font-bold">{getRoomCount(roomType.id)} rooms</span>
              </div>
              {!roomType.isActive && (
                <div className="absolute top-3 left-3 px-2 py-1 bg-rose-500 rounded-lg">
                  <span className="text-white text-[10px] font-bold">Inactive</span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">{roomType.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(roomType)}
                    className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDeleteRoomType(roomType.id)}
                    className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{roomType.description}</p>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <DollarSign size={12} className="text-emerald-500" />
                  <span className="font-bold">{formatAmount(roomType.basePrice)}</span>
                  <span className="text-slate-400">/night</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Users size={12} className="text-indigo-500" />
                  <span className="font-bold">{roomType.maxOccupancy} guests</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Maximize size={12} className="text-amber-500" />
                  <span className="font-bold">{roomType.roomSizeSqm} sqm</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Bed size={12} className="text-rose-500" />
                  <span className="font-bold truncate">{roomType.bedConfiguration}</span>
                </div>
              </div>

              {/* Amenities Preview */}
              <div className="flex flex-wrap gap-1 mb-3">
                {roomType.amenities.slice(0, 4).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium"
                  >
                    {amenity}
                  </span>
                ))}
                {roomType.amenities.length > 4 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium">
                    +{roomType.amenities.length - 4} more
                  </span>
                )}
              </div>

              {/* Availability Status */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-500">Available</span>
                  <span className="text-[10px] font-black text-emerald-600">
                    {getAvailableCount(roomType.id)} / {getRoomCount(roomType.id)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${(getAvailableCount(roomType.id) / Math.max(getRoomCount(roomType.id), 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* View Details Button */}
              <button
                onClick={() => setSelectedRoomType(roomType)}
                className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition"
              >
                View Details <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Room Type Detail Modal */}
      <AnimatePresence>
        {selectedRoomType && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedRoomType(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                {/* Image Gallery */}
                <div className="relative h-64 bg-slate-100">
                  <img
                    src={selectedRoomType.imageUrl1}
                    alt={selectedRoomType.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setSelectedRoomType(null)}
                    className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition"
                  >
                    <X size={18} className="text-slate-600" />
                  </button>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">
                        {selectedRoomType.name}
                      </h2>
                      <p className="text-sm text-slate-500">{selectedRoomType.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-600">{formatAmount(selectedRoomType.basePrice)}</div>
                      <div className="text-[10px] text-slate-400">per night</div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <Users size={20} className="text-indigo-500 mb-2" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Max Occupancy</div>
                      <div className="text-lg font-black text-slate-900">{selectedRoomType.maxOccupancy} guests</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <Maximize size={20} className="text-amber-500 mb-2" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Room Size</div>
                      <div className="text-lg font-black text-slate-900">{selectedRoomType.roomSizeSqm} sqm</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <Bed size={20} className="text-rose-500 mb-2" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Bed Config</div>
                      <div className="text-sm font-black text-slate-900">{selectedRoomType.bedConfiguration}</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <Shield size={20} className="text-emerald-500 mb-2" />
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Available</div>
                      <div className="text-lg font-black text-slate-900">{getAvailableCount(selectedRoomType.id)} / {getRoomCount(selectedRoomType.id)}</div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="mb-6">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoomType.amenities.map((amenity, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-medium"
                        >
                          <Check size={12} />
                          {amenity}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rooms List */}
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Rooms ({getRoomCount(selectedRoomType.id)})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {roomsByType[selectedRoomType.id]?.map((room) => (
                        <div
                          key={room.id}
                          className={`p-3 rounded-xl text-center ${
                            room.status === 'Vacant Clean' ? 'bg-emerald-50 text-emerald-700' :
                            room.status === 'Occupied Clean' ? 'bg-blue-50 text-blue-700' :
                            room.status.includes('Dirty') ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}
                        >
                          <div className="text-sm font-black">{room.number}</div>
                          <div className="text-[10px] opacity-80">{room.status}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                    {showAddModal ? 'Add Room Type' : 'Edit Room Type'}
                  </h3>
                  <button
                    onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition"
                  >
                    <X size={18} className="text-slate-400" />
                  </button>
                </div>

                <form onSubmit={showAddModal ? handleAddRoomType : handleUpdateRoomType} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Name</label>
                      <input
                        type="text"
                        value={roomTypeForm.name}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Base Price</label>
                      <input
                        type="number"
                        value={roomTypeForm.basePrice}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, basePrice: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Description</label>
                    <textarea
                      value={roomTypeForm.description}
                      onChange={(e) => setRoomTypeForm({ ...roomTypeForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Max Occupancy</label>
                      <input
                        type="number"
                        value={roomTypeForm.maxOccupancy}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, maxOccupancy: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Room Size (sqm)</label>
                      <input
                        type="number"
                        value={roomTypeForm.roomSizeSqm}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, roomSizeSqm: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Bed Configuration</label>
                      <input
                        type="text"
                        value={roomTypeForm.bedConfiguration}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, bedConfiguration: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Image URL 1 (Primary)</label>
                    <input
                      type="url"
                      value={roomTypeForm.imageUrl1}
                      onChange={(e) => setRoomTypeForm({ ...roomTypeForm, imageUrl1: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Image URL 2</label>
                      <input
                        type="url"
                        value={roomTypeForm.imageUrl2}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, imageUrl2: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Image URL 3</label>
                      <input
                        type="url"
                        value={roomTypeForm.imageUrl3}
                        onChange={(e) => setRoomTypeForm({ ...roomTypeForm, imageUrl3: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-2">Amenities</label>
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-200 rounded-xl">
                      {availableAmenities.map((amenity) => (
                        <button
                          key={amenity}
                          type="button"
                          onClick={() => toggleAmenity(amenity)}
                          className={`px-2 py-1.5 rounded-lg text-[10px] font-medium transition ${
                            roomTypeForm.amenities.includes(amenity)
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {roomTypeForm.amenities.includes(amenity) && <Check size={10} className="inline mr-1" />}
                          {amenity}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={roomTypeForm.isActive}
                      onChange={(e) => setRoomTypeForm({ ...roomTypeForm, isActive: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="isActive" className="text-xs font-medium text-slate-700">Active</label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => { setShowAddModal(false); setShowEditModal(false); }}
                      className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition"
                    >
                      {showAddModal ? 'Create Room Type' : 'Update Room Type'}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoomInventoryModule;
