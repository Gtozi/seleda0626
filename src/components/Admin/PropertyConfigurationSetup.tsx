/**
 * Property & Configuration Setup
 * 1. Property Profile
 * 2. Room & Asset Inventory
 * 3. Outlet Management
 */

import React, { useState } from 'react';
import {
  Building2, Settings, Home, BedDouble, Layers,
  Save, CheckCircle2, Plus, Trash2, Search, ShoppingBag,
  Coffee, UtensilsCrossed, Wine, Sparkles, Gift, Printer, Clock,
  Edit2, X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Room } from '../../types/erp';

type ConfigTab = 'property_profile' | 'room_inventory';

const TAB_META: { id: ConfigTab; label: string; icon: React.ReactNode }[] = [
  { id: 'property_profile', label: 'Property Profile', icon: <Building2 size={14} /> },
  { id: 'room_inventory', label: 'Room & Asset Inventory', icon: <Home size={14} /> },
];

export default function PropertyConfigurationSetup() {
  const [activeTab, setActiveTab] = useState<ConfigTab>('property_profile');

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="px-6 pt-4 flex justify-center">
        <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl">
          {TAB_META.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 flex items-center justify-center gap-2 rounded-lg text-xs font-sans font-bold transition-all ${
                activeTab === t.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900 bg-white'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {activeTab === 'property_profile' && <PropertyProfileModule />}
        {activeTab === 'room_inventory' && <RoomInventoryModule />}
      </div>
    </div>
  );
}

function PropertyProfileModule() {
  const { globalHotelSettings, submitGlobalSettingsChange } = useERP();
  const [form, setForm] = useState({
    customHotelName: globalHotelSettings.customHotelName || '',
    customHotelAddress: globalHotelSettings.customHotelAddress || '',
    hotelTin: globalHotelSettings.hotelTin || '',
    hotelVatNo: globalHotelSettings.hotelVatNo || '',
    hotelVatDate: globalHotelSettings.hotelVatDate || '',
    contactPhone: globalHotelSettings.contactPhone || '',
    contactEmail: globalHotelSettings.contactEmail || '',
    publicTagline: globalHotelSettings.publicTagline || '',
    checkInTime: globalHotelSettings.checkInTime || '02:00 PM',
    checkOutTime: globalHotelSettings.checkOutTime || '11:00 AM',
    starRating: globalHotelSettings.starRating || '5',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success'>('idle');

  const handleSave = () => {
    submitGlobalSettingsChange(
      `Update Property: ${form.customHotelName || 'Hotel'}`,
      `Property profile update — name, address, TIN, VAT, contact info, check-in/out times, star rating.`,
      'property-config',
      {
        customHotelName: form.customHotelName,
        customHotelAddress: form.customHotelAddress,
        hotelTin: form.hotelTin,
        hotelVatNo: form.hotelVatNo,
        hotelVatDate: form.hotelVatDate,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        publicTagline: form.publicTagline,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        starRating: form.starRating,
      }
    );
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in pt-4 max-w-5xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h2 className="text-base font-sans font-black text-slate-900 tracking-tight flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-indigo-500" /> Core Property Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Property Name</label>
            <input value={form.customHotelName} onChange={e => setForm(f => ({ ...f, customHotelName: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Contact Phone</label>
            <input value={form.contactPhone} onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Contact Email</label>
            <input type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Star Rating</label>
            <select value={form.starRating} onChange={e => setForm(f => ({ ...f, starRating: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none">
              <option value="3">3 Star Boutique</option>
              <option value="4">4 Star Premium</option>
              <option value="5">5 Star Ultra Luxury Resort</option>
            </select>
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Address</label>
            <textarea rows={2} value={form.customHotelAddress} onChange={e => setForm(f => ({ ...f, customHotelAddress: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Tax ID (TIN)</label>
            <input value={form.hotelTin} onChange={e => setForm(f => ({ ...f, hotelTin: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">VAT Number</label>
            <input value={form.hotelVatNo} onChange={e => setForm(f => ({ ...f, hotelVatNo: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">VAT Activation Date</label>
            <input type="date" value={form.hotelVatDate} onChange={e => setForm(f => ({ ...f, hotelVatDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-mono uppercase text-slate-400 font-bold">Public Tagline</label>
            <input value={form.publicTagline} onChange={e => setForm(f => ({ ...f, publicTagline: e.target.value }))}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-sm font-sans font-black uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-4">
            <Clock size={16} className="text-indigo-600" />
            Service & Operator Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Standard Check-In Time</label>
              <input type="text" value={form.checkInTime} onChange={e => setForm(f => ({ ...f, checkInTime: e.target.value }))}
                placeholder="e.g. 02:00 PM"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase text-slate-400 font-bold">Standard Check-Out Time</label>
              <input type="text" value={form.checkOutTime} onChange={e => setForm(f => ({ ...f, checkOutTime: e.target.value }))}
                placeholder="e.g. 11:00 AM"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-1 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-sans font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
          {saveStatus === 'success' ? <CheckCircle2 size={16} /> : <Save size={16} />}
          {saveStatus === 'success' ? 'Saved' : 'Save Property Profile'}
        </button>
      </div>
    </div>
  );
}

function RoomInventoryModule() {
  const { rooms, addRoom, updateRoom, globalHotelSettings, updateGlobalHotelSettings, submitAdminChange, userProfile } = useERP();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [newRoom, setNewRoom] = useState({ number: '', type: 'Standard' as any, floor: 1, rate: 100, status: 'Vacant Clean' as any, features: [] as string[] });
  const [newRoomTypeInput, setNewRoomTypeInput] = useState('');
  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const features = globalHotelSettings.roomFeatures || ['WiFi', 'TV', 'Desk', 'Mini-bar', 'AC', 'Ocean View', 'Safe'];
  const roomTypes = globalHotelSettings.roomTypes || ['Standard', 'Deluxe', 'Suite', 'Twin'];

  const filteredRooms = rooms.filter(r =>
    r.number.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newRoom.number.trim()) return;
    addRoom({ number: newRoom.number, type: newRoom.type, floor: Number(newRoom.floor) || 1, status: newRoom.status, rate: Number(newRoom.rate) || 100, features: newRoom.features });
    setShowAdd(false);
    setNewRoom({ number: '', type: 'Standard', floor: 1, rate: 100, status: 'Vacant Clean', features: [] });
  };

  const handleEditSave = () => {
    if (!editRoom) return;
    updateRoom(editRoom.id, { number: editRoom.number, type: editRoom.type, floor: Number(editRoom.floor) || 1, status: editRoom.status, rate: Number(editRoom.rate) || 100, features: editRoom.features });
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

  const addRoomType = () => {
    const t = newRoomTypeInput.trim();
    if (!t || roomTypes.includes(t)) return;
    updateGlobalHotelSettings({ roomTypes: [...roomTypes, t] });
    setNewRoomTypeInput('');
  };

  const removeRoomType = (t: string) => {
    updateGlobalHotelSettings({ roomTypes: roomTypes.filter(x => x !== t) });
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
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search rooms..." value={search} onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none w-56" />
          </div>
          <button onClick={() => setShowAdd(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700">
            <Plus size={14} /> Add Room
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Room Types</h3>
            <span className="text-[10px] font-bold text-slate-400">{roomTypes.length} defined</span>
          </div>
          <div className="flex gap-2">
            <input value={newRoomTypeInput} onChange={e => setNewRoomTypeInput(e.target.value)} placeholder="New type name..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            <button onClick={addRoomType} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {roomTypes.map(t => (
              <span key={t} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700">
                {t}
                <button onClick={() => removeRoomType(t)} className="hover:text-rose-600"><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Amenities</h3>
            <span className="text-[10px] font-bold text-slate-400">{features.length} defined</span>
          </div>
          <div className="flex gap-2">
            <input value={newAmenityInput} onChange={e => setNewAmenityInput(e.target.value)} placeholder="New amenity..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            <button onClick={addAmenity} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700"><Plus size={14} /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map(a => (
              <span key={a} className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700">
                {a}
                <button onClick={() => removeAmenity(a)} className="hover:text-rose-600"><X size={12} /></button>
              </span>
            ))}
          </div>
        </div>
      </div>

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
            {filteredRooms.map((room: Room) => (
              <tr key={room.id} className="hover:bg-slate-50 transition text-xs">
                <td className="px-5 py-3 font-bold text-slate-900">{room.number}</td>
                <td className="px-5 py-3 text-slate-700">{room.type}</td>
                <td className="px-5 py-3 text-slate-500 font-mono">Floor {room.floor}</td>
                <td className="px-5 py-3 font-mono text-emerald-600">${room.rate}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                    room.status.includes('Clean') ? 'bg-emerald-50 text-emerald-600' :
                    room.status.includes('Dirty') ? 'bg-amber-50 text-amber-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>{room.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {room.features?.slice(0, 3).map(f => (
                      <span key={f} className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] text-slate-500">{f}</span>
                    ))}
                    {(room.features?.length || 0) > 3 && <span className="text-[9px] text-slate-400">+{(room.features!.length - 3)}</span>}
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
            ))}
            {filteredRooms.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-xs text-slate-400">No rooms found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Add New Room</h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Room Number" value={newRoom.number} onChange={e => setNewRoom(f => ({ ...f, number: e.target.value }))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <select value={newRoom.type} onChange={e => setNewRoom(f => ({ ...f, type: e.target.value }))}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
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

      {showEdit && editRoom && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Edit Room {editRoom.number}</h3>
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Room Number" value={editRoom.number} onChange={e => setEditRoom(f => f ? { ...f, number: e.target.value } : f)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <select value={editRoom.type} onChange={e => setEditRoom(f => f ? { ...f, type: e.target.value } : f)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                {roomTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" placeholder="Floor" value={editRoom.floor} onChange={e => setEditRoom(f => f ? { ...f, floor: Number(e.target.value) } : f)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
              <input type="number" placeholder="Base Rate" value={editRoom.rate} onChange={e => setEditRoom(f => f ? { ...f, rate: Number(e.target.value) } : f)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Status</label>
              <select value={editRoom.status} onChange={e => setEditRoom(f => f ? { ...f, status: e.target.value as any } : f)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none">
                {['Vacant Clean', 'Vacant Dirty', 'Occupied Clean', 'Occupied Dirty', 'Out of Order'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">Features</label>
              <div className="flex flex-wrap gap-1.5">
                {features.map(f => (
                  <button key={f} onClick={() => toggleFeature(f, 'edit')}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                      editRoom.features?.includes(f) ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-500 border border-slate-200'
                    }`}>{f}</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => { setShowEdit(false); setEditRoom(null); }} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={handleEditSave} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-900">Delete Room</h3>
            <p className="text-xs text-slate-500">Submit room deletion for Executive Governance approval. The room will be removed once approved.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 border hover:bg-slate-50">Cancel</button>
              <button onClick={() => {
                const targetRoom = rooms.find(r => r.id === deleteTarget);
                submitAdminChange({
                  title: `Delete Room ${targetRoom?.number || deleteTarget}`,
                  description: `Request to remove room ${targetRoom?.number || deleteTarget} (${targetRoom?.type || 'Unknown'}) from the property inventory.`,
                  changeType: 'property-config',
                  submittedBy: userProfile?.name || 'System Admin',
                  payload: { operation: 'deleteRoom', args: [deleteTarget] }
                });
                setDeleteTarget(null);
              }} className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700">Submit for Approval</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

