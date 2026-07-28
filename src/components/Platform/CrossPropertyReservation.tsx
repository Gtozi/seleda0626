/**
 * Cross-Property Reservation System
 * Manage reservations spanning multiple properties with consolidated folios
 */

import React, { useState } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  FileText,
  Plus,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Building2,
  CreditCard,
  Receipt,
  AlertCircle,
  X
} from 'lucide-react';

interface PropertySegment {
  propertyId: string;
  propertyName: string;
  checkIn: string;
  checkOut: string;
  roomType: string;
  roomNumber?: string;
  nights: number;
  rate: number;
  total: number;
  currency: string;
}

interface CrossPropertyReservation {
  reservationId: string;
  primaryProperty: string;
  guestName: string;
  guestEmail: string;
  status: 'confirmed' | 'pending' | 'checked_in' | 'checked_out' | 'cancelled';
  segments: PropertySegment[];
  consolidatedFolio: boolean;
  billingEntity: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
  createdBy: string;
}

interface FolioTransaction {
  transactionId: string;
  type: 'charge' | 'payment' | 'refund' | 'adjustment';
  description: string;
  amount: number;
  propertyId?: string;
  timestamp: string;
}

const mockReservations: CrossPropertyReservation[] = [
  {
    reservationId: 'CPR-001',
    primaryProperty: 'Grand Hotel Downtown',
    guestName: 'John Smith',
    guestEmail: 'john.smith@example.com',
    status: 'confirmed',
    segments: [
      {
        propertyId: 'PROP-001',
        propertyName: 'Grand Hotel Downtown',
        checkIn: '2026-06-25',
        checkOut: '2026-06-27',
        roomType: 'Deluxe Suite',
        roomNumber: '301',
        nights: 2,
        rate: 350,
        total: 700,
        currency: 'USD'
      },
      {
        propertyId: 'PROP-002',
        propertyName: 'Seaside Resort',
        checkIn: '2026-06-27',
        checkOut: '2026-06-30',
        roomType: 'Ocean View Room',
        roomNumber: '205',
        nights: 3,
        rate: 280,
        total: 840,
        currency: 'USD'
      }
    ],
    consolidatedFolio: true,
    billingEntity: 'Grand Hotel Downtown',
    totalAmount: 1540,
    currency: 'USD',
    createdAt: '2026-06-15',
    createdBy: 'Agent: Sarah'
  },
  {
    reservationId: 'CPR-002',
    primaryProperty: 'Mountain Lodge',
    guestName: 'Maria Garcia',
    guestEmail: 'maria.garcia@example.com',
    status: 'checked_in',
    segments: [
      {
        propertyId: 'PROP-003',
        propertyName: 'Mountain Lodge',
        checkIn: '2026-06-18',
        checkOut: '2026-06-20',
        roomType: 'Alpine Suite',
        roomNumber: '101',
        nights: 2,
        rate: 420,
        total: 840,
        currency: 'CHF'
      }
    ],
    consolidatedFolio: false,
    billingEntity: 'Mountain Lodge',
    totalAmount: 840,
    currency: 'CHF',
    createdAt: '2026-06-10',
    createdBy: 'Agent: John'
  }
];

const mockFolioTransactions: FolioTransaction[] = [
  {
    transactionId: 'TXN-001',
    type: 'charge',
    description: 'Room Charge - Grand Hotel Downtown',
    amount: 700,
    propertyId: 'PROP-001',
    timestamp: '2026-06-15T10:00:00Z'
  },
  {
    transactionId: 'TXN-002',
    type: 'charge',
    description: 'Room Charge - Seaside Resort',
    amount: 840,
    propertyId: 'PROP-002',
    timestamp: '2026-06-15T10:00:00Z'
  },
  {
    transactionId: 'TXN-003',
    type: 'payment',
    description: 'Credit Card Payment',
    amount: -1540,
    timestamp: '2026-06-15T10:30:00Z'
  }
];

export default function CrossPropertyReservation() {
  const [activeTab, setActiveTab] = useState<'reservations' | 'create'>('reservations');
  const [selectedReservation, setSelectedReservation] = useState<CrossPropertyReservation | null>(null);
  const [showFolio, setShowFolio] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'checked_in':
        return <CheckCircle size={14} className="text-emerald-500" />;
      case 'cancelled':
        return <XCircle size={14} className="text-rose-500" />;
      case 'pending':
        return <Clock size={14} className="text-amber-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400';
      case 'checked_in':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      case 'checked_out':
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
      case 'cancelled':
        return 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400';
      case 'pending':
        return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
      default:
        return 'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-400';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'charge':
        return 'text-rose-600 dark:text-rose-400';
      case 'payment':
        return 'text-emerald-600 dark:text-emerald-400';
      case 'refund':
        return 'text-amber-600 dark:text-amber-400';
      case 'adjustment':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="cross-property-reservation">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-[10px] font-mono font-black text-blue-500 uppercase tracking-widest">Platform</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Cross-Property Reservations</h2>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2">
          <Plus size={14} /> Create Multi-Property Booking
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Calendar size={20} className="text-blue-500" />
            <span className="text-xs font-bold text-emerald-500">Active</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {mockReservations.filter(r => r.status === 'confirmed' || r.status === 'checked_in').length}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Active Bookings</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <Building2 size={20} className="text-purple-500" />
            <span className="text-xs font-bold text-purple-500">3</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Properties</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">In Network</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <FileText size={20} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500">Yes</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Consolidated</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Folio Enabled</div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-3xs">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-500">$2,380</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">Total Value</div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">This Month</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-2xl shadow-3xs">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'reservations'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar size={14} /> Reservations
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 px-4 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Plus size={14} /> Create Booking
          </button>
        </div>
      </div>

      {/* Reservations Tab */}
      {activeTab === 'reservations' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xs overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Multi-Property Reservations</h3>
            <div className="space-y-4">
              {mockReservations.map((reservation) => (
                <div
                  key={reservation.reservationId}
                  className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar size={24} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{reservation.reservationId}</h4>
                          {getStatusIcon(reservation.status)}
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${getStatusBadge(reservation.status)}`}>
                            {reservation.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{reservation.guestName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {reservation.consolidatedFolio && (
                        <div className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <Receipt size={10} /> Consolidated
                        </div>
                      )}
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {reservation.currency} {reservation.totalAmount.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">{reservation.segments.length} properties</div>
                      </div>
                    </div>
                  </div>

                  {/* Property Segments */}
                  <div className="space-y-2 mb-4">
                    {reservation.segments.map((segment, index) => (
                      <div key={segment.propertyId} className="flex items-center gap-3">
                        <div className="flex-1 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-slate-500" />
                              <span className="text-xs font-bold text-slate-900 dark:text-white">{segment.propertyName}</span>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{segment.roomType}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                            <span>{segment.checkIn} → {segment.checkOut}</span>
                            <span>{segment.nights} nights</span>
                            <span>{segment.currency} {segment.rate}/night</span>
                          </div>
                        </div>
                        {index < reservation.segments.length - 1 && (
                          <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      Billing: {reservation.billingEntity} • Created: {reservation.createdAt}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setSelectedReservation(reservation); setShowFolio(true); }}
                        className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1"
                      >
                        <Receipt size={12} /> View Folio
                      </button>
                      <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold text-white flex items-center gap-1">
                        <Eye size={12} /> Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Booking Tab */}
      {activeTab === 'create' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-3xl p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Create Multi-Property Booking</h3>
          <div className="space-y-6">
            {/* Guest Information */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                Guest Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Guest Name</label>
                  <input
                    type="text"
                    placeholder="Enter guest name..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Email</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Property Segments */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Building2 size={16} className="text-purple-500" />
                Property Segments
              </h4>
              <div className="space-y-3">
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Property</label>
                      <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>Grand Hotel Downtown</option>
                        <option>Seaside Resort</option>
                        <option>Mountain Lodge</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Check-in</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Check-out</label>
                      <input
                        type="date"
                        className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Room Type</label>
                      <select className="w-full px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>Deluxe Suite</option>
                        <option>Ocean View</option>
                        <option>Alpine Suite</option>
                      </select>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1">
                    <X size={12} /> Remove Segment
                  </button>
                </div>
              </div>
              <button className="mt-3 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold flex items-center gap-2">
                <Plus size={14} /> Add Property Segment
              </button>
            </div>

            {/* Billing Options */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-500" />
                Billing Options
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Consolidated Folio</label>
                  <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option value="true">Yes - Single invoice across properties</option>
                    <option value="false">No - Separate invoices per property</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">Billing Entity</label>
                  <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500/20">
                    <option>Grand Hotel Downtown</option>
                    <option>Seaside Resort</option>
                    <option>Mountain Lodge</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button className="px-6 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400">
                Cancel
              </button>
              <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs text-white flex items-center gap-2">
                <CheckCircle size={14} /> Create Reservation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Folio Modal */}
      {showFolio && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-3xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Consolidated Folio</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{selectedReservation.reservationId}</span>
                </div>
                <button
                  onClick={() => setShowFolio(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  <X size={20} className="text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Summary */}
              <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Guest</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{selectedReservation.guestName}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Total Charges</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedReservation.currency} {selectedReservation.totalAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Balance Due</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedReservation.currency} 0.00
                  </span>
                </div>
              </div>

              {/* Transactions */}
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Transactions</h4>
              <div className="space-y-2">
                {mockFolioTransactions.map((transaction) => (
                  <div key={transaction.transactionId} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText size={14} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 dark:text-white">{transaction.description}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${getTransactionTypeColor(transaction.type)}`}>
                      {transaction.type === 'payment' || transaction.type === 'refund' ? '-' : ''}
                      {selectedReservation.currency} {Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <FileText size={12} /> Print Folio
              </button>
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold text-xs text-white flex items-center gap-1">
                <CreditCard size={12} /> Process Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
