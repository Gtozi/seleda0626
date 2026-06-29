/**
 * Property & Asset Configuration
 * Consolidates room inventory management
 */

import React, { useState } from 'react';
import {
  Home,
  Plus,
  Trash2,
  Edit2,
  DollarSign,
  Users,
  Maximize,
  Bed
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Room, RoomTypeDetail } from '../../types/erp';

export default function PropertyAssetConfig() {
  return <RoomInventoryManagement />;
}

function RoomInventoryManagement() {
  const { rooms, roomTypes, addRoom, updateRoom, deleteRoom, updateRoomType, deleteRoomType, addRoomType, globalHotelSettings, updateGlobalHotelSettings, formatAmount } = useERP();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [showRoomTypeEdit, setShowRoomTypeEdit] = useState(false);
  const [showRoomTypeAdd, setShowRoomTypeAdd] = useState(false);
  const [editRoomType, setEditRoomType] = useState<RoomTypeDetail | null>(null);
  const [newRoomType, setNewRoomType] = useState<Partial<RoomTypeDetail>>({
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
  const firstActiveRoomType = roomTypes.find(rt => rt.isActive);
  const [newRoom, setNewRoom] = useState({
    number: '',
    type: firstActiveRoomType?.name || '',
    roomTypeId: firstActiveRoomType?.id || '',
    floor: 1,
    rate: firstActiveRoomType?.basePrice || 100,
    status: 'Vacant Clean' as any,
    features: [] as string[]
  });
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteRoomTypeTarget, setDeleteRoomTypeTarget] = useState<string | null>(null);
  const features = globalHotelSettings.roomFeatures || ['WiFi', 'TV', 'Desk', 'Mini-bar', 'AC', 'Ocean View', 'Safe'];

  const filteredRooms = rooms.filter(r =>
    r.number.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newRoom.number.trim()) return;
    addRoom({ number: newRoom.number, type: newRoom.type, roomTypeId: newRoom.roomTypeId || undefined, floor: Number(newRoom.floor) || 1, status: newRoom.status, rate: Number(newRoom.rate) || 100, features: newRoom.features });
    setShowAdd(false);
    setNewRoom({
      number: '',
      type: firstActiveRoomType?.name || '',
      roomTypeId: firstActiveRoomType?.id || '',
      floor: 1,
      rate: firstActiveRoomType?.basePrice || 100,
      status: 'Vacant Clean',
      features: []
    });
  };

  const handleEditSave = () => {
    if (!editRoom) return;
    updateRoom(editRoom.id, { number: editRoom.number, type: editRoom.type, roomTypeId: editRoom.roomTypeId || undefined, floor: Number(editRoom.floor) || 1, status: editRoom.status, rate: Number(editRoom.rate) || 100, features: editRoom.features });
    setShowEdit(false);
    setEditRoom(null);
  };

  const toggleFeature = (f: string, target: 'new' | 'edit') => {
    if (target === 'new') {
      setNewRoom(prev => ({ ...prev, features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f] }));
    } else if (editRoom) {
      setEditRoom(prev => prev ? { ...prev, features: prev.features.includes(f) ? prev.features.filter(x => x !== f) : [...prev.features, f] } : prev);
    }
  };

  const addAmenity = () => {
    const a = newAmenityInput.trim();
    if (!a || features.includes(a)) return;
    updateGlobalHotelSettings({ roomFeatures: [...features, a] });
    setNewAmenityInput('');
  };

  const removeAmenity = (a: string) => {
    updateGlobalHotelSettings({ roomFeatures: features.filter(x => x !== a) });
  };

  const openEdit = (room: Room) => {
    setEditRoom({ ...room });
    setShowEdit(true);
  };

  const openRoomTypeEdit = (roomType: RoomTypeDetail) => {
    setEditRoomType({ ...roomType });
    setShowRoomTypeEdit(true);
  };

  const handleRoomTypeEditSave = () => {
    if (!editRoomType) return;
    updateRoomType(editRoomType.id, editRoomType);
    setShowRoomTypeEdit(false);
    setEditRoomType(null);
  };

  const handleRoomTypeAdd = () => {
    if (!newRoomType.name || !newRoomType.name.trim()) return;
    const newId = `rt_${Date.now()}`;
    const roomTypeToAdd: RoomTypeDetail = {
      id: newId,
      name: newRoomType.name,
      description: newRoomType.description || '',
      basePrice: newRoomType.basePrice || 100,
      maxOccupancy: newRoomType.maxOccupancy || 2,
      bedConfiguration: newRoomType.bedConfiguration || '1 King Bed',
      roomSizeSqm: newRoomType.roomSizeSqm || 28,
      amenities: newRoomType.amenities || [],
      imageUrl1: newRoomType.imageUrl1 || '',
      imageUrl2: newRoomType.imageUrl2 || '',
      imageUrl3: newRoomType.imageUrl3 || '',
      isActive: true,
      displayOrder: roomTypes.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    addRoomType(roomTypeToAdd);
    setShowRoomTypeAdd(false);
    setNewRoomType({
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
  };

  const handleDeleteRoomType = (id: string) => {
    setDeleteRoomTypeTarget(id);
  };

  const confirmDeleteRoomType = () => {
    if (!deleteRoomTypeTarget) return;
    deleteRoomType(deleteRoomTypeTarget);
    setDeleteRoomTypeTarget(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-4">
          {[
            { label: 'Total Rooms', value: rooms.length },
            { label: 'Room Types', value: roomTypes.length },
            { label: 'Out of Order', value: rooms.filter(r => r.status === 'Out of Order').length },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{s.label}</span>
              <span className="text-xl font-black text-slate-900">{s.value}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none w-56" />
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700">
            <Plus size={14} /> Add Room
          </button>
        </div>
      </div>

      {/* Room Types Display */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Room Type Details</h3>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400">{roomTypes.filter(rt => rt.isActive).length} active</span>
            <button
              onClick={() => setShowRoomTypeAdd(true)}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-700"
            >
              <Plus size={10} /> Add Room Type
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roomTypes.filter(rt => rt.isActive).map((rt) => {
            const roomsOfType = rooms.filter(r => r.type === rt.name || r.roomTypeId === rt.id);
            return (
              <div key={rt.id} className="group relative overflow-hidden rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all">
                {rt.imageUrl1 && (
                  <div className="relative h-32 bg-slate-100">
                    <img src={rt.imageUrl1} alt={rt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{rt.name}</h4>
                      <p className="text-[10px] text-white/90 font-bold">{formatAmount(rt.basePrice)}/night</p>
                    </div>
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => openRoomTypeEdit(rt)}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition"
                      >
                        <Edit2 size={12} className="text-slate-700" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoomType(rt.id)}
                        className="p-1.5 bg-white/90 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Trash2 size={12} className="text-rose-600" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="p-3">
                  <p className="text-[9px] text-slate-500 line-clamp-2 mb-2">{rt.description}</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-[9px] text-slate-600">
                      <DollarSign size={10} className="text-emerald-500" />
                      <span className="font-bold">{formatAmount(rt.basePrice)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-600">
                      <Users size={10} className="text-indigo-500" />
                      <span className="font-bold">{rt.maxOccupancy}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-600">
                      <Maximize size={10} className="text-amber-500" />
                      <span className="font-bold">{rt.roomSizeSqm}sqm</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px]">
                    <span className="font-bold text-slate-500">{roomsOfType.length} rooms</span>
                    <span className="font-black text-slate-900">{formatAmount(rt.basePrice)}/night</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Room List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <th className="px-5 py-3">Room</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Floor</th>
              <th className="px-5 py-3">Base Rate</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Features</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRooms.map((room: Room) => {
              const roomTypeDetail = roomTypes.find(rt => rt.name === room.type || rt.id === room.roomTypeId);
              return (
                <tr key={room.id} className="hover:bg-slate-50 transition text-xs">
                  <td className="px-5 py-3 font-bold text-slate-900">{room.number}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {roomTypeDetail?.imageUrl1 && (
                        <img src={roomTypeDetail.imageUrl1} alt={room.type} className="w-8 h-8 rounded-lg object-cover" />
                      )}
                      <span className="text-slate-700">{room.type}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-slate-500 font-mono">Floor {room.floor}</td>
                  <td className="px-5 py-3 font-mono text-emerald-600">{formatAmount(room.rate)}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                      room.status.includes('Clean') ? 'bg-emerald-50 text-emerald-600' :
                      room.status.includes('Dirty') ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>{room.status}</span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {room.features?.slice(0, 2).map(f => (
                        <span key={f} className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] text-slate-500">{f}</span>
                      ))}
                      {room.features && room.features.length > 2 && (
                        <span className="text-[9px] text-slate-400">+{room.features.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openEdit(room)} className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(room.id)} className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredRooms.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-xs text-slate-400">No rooms found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Room Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add New Room</h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Room Number" value={newRoom.number} onChange={e => setNewRoom(f => ({ ...f, number: e.target.value }))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <select value={newRoom.type} onChange={e => {
                const selectedType = e.target.value;
                const selectedRoomType = roomTypes.find(rt => rt.name === selectedType);
                setNewRoom(f => ({
                  ...f,
                  type: selectedType,
                  roomTypeId: selectedRoomType?.id || '',
                  rate: selectedRoomType?.basePrice || f.rate
                }));
              }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                {roomTypes.filter(rt => rt.isActive).map(rt => (
                  <option key={rt.id} value={rt.name}>{rt.name} - {formatAmount(rt.basePrice)}/night</option>
                ))}
              </select>
              <input type="number" placeholder="Floor" value={newRoom.floor} onChange={e => setNewRoom(f => ({ ...f, floor: Number(e.target.value) }))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <input type="number" placeholder="Base Rate" value={newRoom.rate} onChange={e => setNewRoom(f => ({ ...f, rate: Number(e.target.value) }))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Features</label>
              <div className="flex flex-wrap gap-1.5">
                {features.map(f => (
                  <button key={f} onClick={() => toggleFeature(f, 'new')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      newRoom.features.includes(f) ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={handleAdd} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700">Add Room</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Modal */}
      {showEdit && editRoom && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Edit Room {editRoom.number}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Room Number" value={editRoom.number} onChange={e => setEditRoom(f => f ? { ...f, number: e.target.value } : f)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <select value={editRoom.type} onChange={e => {
                const selectedType = e.target.value;
                const selectedRoomType = roomTypes.find(rt => rt.name === selectedType);
                setEditRoom(f => f ? {
                  ...f,
                  type: selectedType,
                  roomTypeId: selectedRoomType?.id || '',
                  rate: selectedRoomType?.basePrice || f.rate
                } : f);
              }}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                {roomTypes.filter(rt => rt.isActive).map(rt => (
                  <option key={rt.id} value={rt.name}>{rt.name} - {formatAmount(rt.basePrice)}/night</option>
                ))}
              </select>
              <input type="number" placeholder="Floor" value={editRoom.floor} onChange={e => setEditRoom(f => f ? { ...f, floor: Number(e.target.value) } : f)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <input type="number" placeholder="Base Rate" value={editRoom.rate} onChange={e => setEditRoom(f => f ? { ...f, rate: Number(e.target.value) } : f)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Features</label>
              <div className="flex flex-wrap gap-1.5">
                {features.map(f => (
                  <button key={f} onClick={() => toggleFeature(f, 'edit')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      editRoom.features.includes(f) ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={handleEditSave} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Room Type Modal */}
      {showRoomTypeAdd && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add Room Type</h3>
            <div className="space-y-3">
              <input placeholder="Room Type Name" value={newRoomType.name} onChange={e => setNewRoomType(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <textarea placeholder="Description" rows={2} value={newRoomType.description} onChange={e => setNewRoomType(f => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none" />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Base Price" value={newRoomType.basePrice} onChange={e => setNewRoomType(f => ({ ...f, basePrice: Number(e.target.value) }))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                <input type="number" placeholder="Max Occupancy" value={newRoomType.maxOccupancy} onChange={e => setNewRoomType(f => ({ ...f, maxOccupancy: Number(e.target.value) }))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                <input type="number" placeholder="Room Size (sqm)" value={newRoomType.roomSizeSqm} onChange={e => setNewRoomType(f => ({ ...f, roomSizeSqm: Number(e.target.value) }))}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              </div>
              <input placeholder="Bed Configuration" value={newRoomType.bedConfiguration} onChange={e => setNewRoomType(f => ({ ...f, bedConfiguration: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <input placeholder="Image URL 1" value={newRoomType.imageUrl1} onChange={e => setNewRoomType(f => ({ ...f, imageUrl1: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowRoomTypeAdd(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={handleRoomTypeAdd} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700">Add Room Type</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Room Type Modal */}
      {showRoomTypeEdit && editRoomType && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Edit Room Type</h3>
            <div className="space-y-3">
              <input placeholder="Room Type Name" value={editRoomType.name} onChange={e => setEditRoomType(f => f ? { ...f, name: e.target.value } : f)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <textarea placeholder="Description" rows={2} value={editRoomType.description} onChange={e => setEditRoomType(f => f ? { ...f, description: e.target.value } : f)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none resize-none" />
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Base Price" value={editRoomType.basePrice} onChange={e => setEditRoomType(f => f ? { ...f, basePrice: Number(e.target.value) } : f)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                <input type="number" placeholder="Max Occupancy" value={editRoomType.maxOccupancy} onChange={e => setEditRoomType(f => f ? { ...f, maxOccupancy: Number(e.target.value) } : f)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
                <input type="number" placeholder="Room Size (sqm)" value={editRoomType.roomSizeSqm} onChange={e => setEditRoomType(f => f ? { ...f, roomSizeSqm: Number(e.target.value) } : f)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              </div>
              <input placeholder="Bed Configuration" value={editRoomType.bedConfiguration} onChange={e => setEditRoomType(f => f ? { ...f, bedConfiguration: e.target.value } : f)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <input placeholder="Image URL 1" value={editRoomType.imageUrl1} onChange={e => setEditRoomType(f => f ? { ...f, imageUrl1: e.target.value } : f)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowRoomTypeEdit(false)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={handleRoomTypeEditSave} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteRoomTypeTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Delete Room Type</h3>
            <p className="text-sm text-slate-600">Are you sure you want to delete this room type? This will affect all rooms associated with it.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteRoomTypeTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={confirmDeleteRoomType} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Delete Room</h3>
            <p className="text-sm text-slate-600">Are you sure you want to delete this room? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={() => {
                deleteRoom(deleteTarget);
                setDeleteTarget(null);
              }} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
