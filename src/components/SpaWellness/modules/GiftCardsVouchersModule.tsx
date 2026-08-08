/**
 * Gift Cards & Vouchers Module
 * Manages spa gift cards, treatment vouchers, and promotional coupons
 */

import { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle2,
  MoreVertical,
  Clock,
  Gift,
  Tag
} from 'lucide-react';

interface GiftCardsVouchersModuleProps {
  onViewGuestProfile?: (guestId: string) => void;
}

interface GiftCard {
  id: string;
  type: 'Spa Gift Card' | 'Treatment Voucher' | 'Promotional Coupon' | 'Membership Credit';
  code: string;
  value: number;
  status: 'Active' | 'Redeemed' | 'Expired' | 'Suspended';
  purchaserName: string;
  purchaserId: string;
  recipientName?: string;
  recipientId?: string;
  issueDate: string;
  expiryDate: string;
  applicableTreatments?: string[];
  notes: string;
}

const GiftCardsVouchersModule: React.FC<GiftCardsVouchersModuleProps> = ({
  onViewGuestProfile
}) => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([
    {
      id: 'GFT-001',
      type: 'Spa Gift Card',
      code: 'SPA-GIFT-2024-001',
      value: 200,
      status: 'Active',
      purchaserName: 'John Smith',
      purchaserId: 'GST-001',
      recipientName: 'Jane Smith',
      recipientId: 'GST-002',
      issueDate: '2026-06-15',
      expiryDate: '2027-06-15',
      applicableTreatments: ['All Services'],
      notes: 'Birthday gift'
    },
    {
      id: 'GFT-002',
      type: 'Treatment Voucher',
      code: 'TMT-VCHR-2024-002',
      value: 150,
      status: 'Active',
      purchaserName: 'Michael Johnson',
      purchaserId: 'GST-003',
      recipientName: 'Sarah Johnson',
      recipientId: 'GST-004',
      issueDate: '2026-07-01',
      expiryDate: '2026-12-31',
      applicableTreatments: ['Swedish Massage', 'Deep Tissue Massage', 'Hot Stone Massage'],
      notes: 'Anniversary gift'
    },
    {
      id: 'GFT-003',
      type: 'Promotional Coupon',
      code: 'PROMO-SUMMER-2024',
      value: 50,
      status: 'Active',
      purchaserName: 'Hotel Marketing',
      purchaserId: 'ORG-001',
      issueDate: '2026-07-01',
      expiryDate: '2026-08-31',
      applicableTreatments: ['All Services'],
      notes: 'Summer promotion'
    },
    {
      id: 'GFT-004',
      type: 'Membership Credit',
      code: 'MBR-CRDT-2024-004',
      value: 100,
      status: 'Redeemed',
      purchaserName: 'Emily Davis',
      purchaserId: 'GST-005',
      issueDate: '2026-05-15',
      expiryDate: '2026-11-15',
      applicableTreatments: ['All Services'],
      notes: 'Membership renewal credit'
    },
    {
      id: 'GFT-005',
      type: 'Spa Gift Card',
      code: 'SPA-GIFT-2024-005',
      value: 300,
      status: 'Expired',
      purchaserName: 'Robert Wilson',
      purchaserId: 'GST-006',
      issueDate: '2025-01-15',
      expiryDate: '2026-01-15',
      applicableTreatments: ['All Services'],
      notes: 'Christmas gift'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [showNewGiftCardModal, setShowNewGiftCardModal] = useState(false);

  const cardTypes = ['All', 'Spa Gift Card', 'Treatment Voucher', 'Promotional Coupon', 'Membership Credit'];

  const getTypeColor = (type: string) => {
    const colors = {
      'Spa Gift Card': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:border-purple-700/50 dark:text-purple-400',
      'Treatment Voucher': 'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-900/20 dark:border-pink-700/50 dark:text-pink-400',
      'Promotional Coupon': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400',
      'Membership Credit': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400'
    };
    return colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-700/50 dark:text-emerald-400';
      case 'Redeemed':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-700/50 dark:text-blue-400';
      case 'Expired':
        return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-700/50 dark:text-red-400';
      case 'Suspended':
        return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900/20 dark:border-slate-700/50 dark:text-slate-400';
    }
  };

  const filteredGiftCards = giftCards.filter(card => {
    const matchesSearch = card.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.purchaserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (card.recipientName && card.recipientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'All' || card.status === statusFilter;
    const matchesType = typeFilter === 'All' || card.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = (cardId: string, newStatus: GiftCard['status']) => {
    setGiftCards(giftCards.map(card =>
      card.id === cardId ? { ...card, status: newStatus } : card
    ));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Gift Cards & Vouchers</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage spa gift cards, treatment vouchers, and promotional coupons
          </p>
        </div>
        <button
          onClick={() => setShowNewGiftCardModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
        >
          <Plus size={16} />
          Issue Gift Card
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search gift cards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Redeemed">Redeemed</option>
            <option value="Expired">Expired</option>
            <option value="Suspended">Suspended</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {cardTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Gift Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGiftCards.map((card) => (
          <div key={card.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-lg transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                  <CreditCard size={20} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{card.code}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{card.id}</p>
                </div>
              </div>
              <select
                value={card.status}
                onChange={(e) => handleStatusChange(card.id, e.target.value as GiftCard['status'])}
                className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(card.status)} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                <option value="Active">Active</option>
                <option value="Redeemed">Redeemed</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(card.type)}`}>
                {card.type}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">${card.value}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Value</div>
              </div>
              <div className="text-center p-2 bg-slate-50 dark:bg-slate-900/20 rounded-lg">
                <div className="font-semibold text-slate-900 dark:text-white">
                  {new Date(card.expiryDate) < new Date() ? 'Expired' : `${Math.ceil((new Date(card.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Remaining</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Gift size={14} />
                <span>Purchaser: {card.purchaserName}</span>
              </div>
              {card.recipientName && (
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Tag size={14} />
                  <span>Recipient: {card.recipientName}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                <Calendar size={14} />
                <span>Expires: {new Date(card.expiryDate).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => onViewGuestProfile?.(card.purchaserId)}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                View Purchaser
              </button>
              <div className="flex gap-2">
                <button className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Gift Card Modal Placeholder */}
      {showNewGiftCardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Issue Gift Card</h2>
              <button
                onClick={() => setShowNewGiftCardModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <Trash2 size={24} />
              </button>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Gift card issuance form would be implemented here with type selection, value, purchaser/recipient details, and expiry configuration.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowNewGiftCardModal(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 transition"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Issue Gift Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftCardsVouchersModule;