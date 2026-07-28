/**
 * Overbooking Management System
 * Manages overbooking scenarios, walk guests, and compensation strategies
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Hotel,
  ArrowRight,
  AlertCircle,
  FileText,
  Phone,
  Mail,
  Car,
  Home,
  LucideIcon
} from 'lucide-react';

interface OverbookingAlert {
  id: string;
  date: string;
  roomType: string;
  totalRooms: number;
  confirmedBookings: number;
  overbookedBy: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  affectedReservations: string[];
  suggestedActions: string[];
  createdAt: Date;
  status: 'active' | 'resolved' | 'ignored';
}

interface WalkGuest {
  reservationId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  originalRoomType: string;
  originalCheckIn: string;
  originalCheckOut: string;
  alternativeProperty?: string;
  alternativeRoomType?: string;
  status: 'pending' | 'contacted' | 'accepted' | 'declined' | 'completed';
  compensationAmount: number;
  compensationType: 'cash' | 'voucher' | 'upgrade' | 'free_night';
  transferCost: number;
  notes: string;
  contactedAt?: Date;
  respondedAt?: Date;
}

interface CompensationOffer {
  type: 'cash' | 'voucher' | 'upgrade' | 'free_night';
  amount: number;
  description: string;
  terms: string;
}

interface OverbookingStats {
  totalAlerts: number;
  activeAlerts: number;
  criticalAlerts: number;
  totalWalks: number;
  pendingWalks: number;
  completedWalks: number;
  totalCompensationPaid: number;
  avgCompensationAmount: number;
  walkRate: number;
}

const OverbookingManagement = () => {
  const [alerts, setAlerts] = useState<OverbookingAlert[]>([]);
  const [walkGuests, setWalkGuests] = useState<WalkGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'alerts' | 'walks' | 'compensation' | 'analytics'>('alerts');
  const [selectedAlert, setSelectedAlert] = useState<OverbookingAlert | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/front-office/overbooking-alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const fetchWalkGuests = async () => {
    try {
      const res = await fetch('/api/front-office/walk-guests');
      if (res.ok) {
        const data = await res.json();
        setWalkGuests(data);
      }
    } catch (error) {
      console.error('Failed to fetch walk guests:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAlerts(), fetchWalkGuests()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert: OverbookingAlert) => {
      const matchesSearch = 
        alert.date.includes(searchQuery) ||
        alert.roomType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = selectedRisk === 'all' || alert.riskLevel === selectedRisk;
      const matchesStatus = selectedStatus === 'all' || alert.status === selectedStatus;
      return matchesSearch && matchesRisk && matchesStatus;
    });
  }, [alerts, searchQuery, selectedRisk, selectedStatus]);

  const stats = useMemo<OverbookingStats>(() => ({
    totalAlerts: alerts.length,
    activeAlerts: alerts.filter((a: OverbookingAlert) => a.status === 'active').length,
    criticalAlerts: alerts.filter((a: OverbookingAlert) => a.riskLevel === 'critical').length,
    totalWalks: walkGuests.length,
    pendingWalks: walkGuests.filter((w: WalkGuest) => w.status === 'pending').length,
    completedWalks: walkGuests.filter((w: WalkGuest) => w.status === 'completed').length,
    totalCompensationPaid: walkGuests.reduce((sum: number, w: WalkGuest) => sum + w.compensationAmount, 0),
    avgCompensationAmount: walkGuests.length > 0 
      ? walkGuests.reduce((sum: number, w: WalkGuest) => sum + w.compensationAmount, 0) / walkGuests.length 
      : 0,
    walkRate: 2.3 // percentage
  }), [alerts, walkGuests]);

  const handleResolveAlert = async (alertId: string, resolution: string) => {
    try {
      const res = await fetch(`/api/front-office/overbooking-alerts/${alertId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolution })
      });
      if (res.ok) {
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
    }
  };

  const handleContactGuest = async (walkGuestId: string) => {
    try {
      const res = await fetch(`/api/front-office/walk-guests/${walkGuestId}/contact`, {
        method: 'POST'
      });
      if (res.ok) {
        fetchWalkGuests();
      }
    } catch (error) {
      console.error('Failed to contact guest:', error);
    }
  };

  const handleUpdateWalkStatus = async (walkGuestId: string, status: string) => {
    try {
      const res = await fetch(`/api/front-office/walk-guests/${walkGuestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchWalkGuests();
      }
    } catch (error) {
      console.error('Failed to update walk status:', error);
    }
  };

  const getRiskColor = (risk: string) => {
    const colors = {
      low: 'bg-green-100 text-green-700',
      medium: 'bg-blue-100 text-blue-700',
      high: 'bg-amber-100 text-amber-700',
      critical: 'bg-red-100 text-red-700'
    };
    return colors[risk as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const getRiskIcon = (risk: string) => {
    const icons: Record<string, React.ReactNode> = {
      low: <CheckCircle2 size={16} />,
      medium: <AlertCircle size={16} />,
      high: <AlertTriangle size={16} />,
      critical: <AlertTriangle size={16} />
    };
    return icons[risk] || <AlertTriangle size={16} />;
  };

  const getIconWithColor = (iconName: string, color: string) => {
    return <span className={color}><AlertTriangle size={16} /></span>;
  };

  const getWalkStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-amber-100 text-amber-700',
      contacted: 'bg-blue-100 text-blue-700',
      accepted: 'bg-green-100 text-green-700',
      declined: 'bg-red-100 text-red-700',
      completed: 'bg-emerald-100 text-emerald-700'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Overbooking Management</h2>
          <p className="text-slate-600">Monitor and manage overbooking scenarios and walk guests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchAlerts();
              fetchWalkGuests();
            }}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Alerts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalAlerts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg text-amber-600">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Active Alerts</p>
              <p className="text-2xl font-bold text-slate-900">{stats.activeAlerts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Critical</p>
              <p className="text-2xl font-bold text-slate-900">{stats.criticalAlerts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Users size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Walks</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalWalks}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <DollarSign size={20} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total Paid</p>
              <p className="text-2xl font-bold text-slate-900">${stats.totalCompensationPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex bg-slate-100 rounded-lg p-1">
        <button
          onClick={() => setView('alerts')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'alerts' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setView('walks')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'walks' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Walk Guests
        </button>
        <button
          onClick={() => setView('compensation')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'compensation' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Compensation
        </button>
        <button
          onClick={() => setView('analytics')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            view === 'analytics' ? 'bg-white text-slate-900 shadow' : 'text-slate-600'
          }`}
        >
          Analytics
        </button>
      </div>

      {view === 'alerts' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  <Search size={16} />
                </div>
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-slate-500">
                  <Filter size={16} />
                </div>
                <select
                  value={selectedRisk}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedRisk(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="all">All Risk Levels</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <select
                value={selectedStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
                <option value="ignored">Ignored</option>
              </select>
            </div>
          </div>

          {/* Alerts List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                Loading...
              </div>
            ) : filteredAlerts.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                No overbooking alerts found
              </div>
            ) : (
              filteredAlerts.map(alert => (
                <div key={alert.id} className={`bg-white rounded-xl border ${
                  alert.riskLevel === 'critical' ? 'border-red-300' : 
                  alert.riskLevel === 'high' ? 'border-amber-300' : 
                  'border-slate-200'
                } p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        alert.riskLevel === 'critical' ? 'bg-red-100 text-red-600' : 
                        alert.riskLevel === 'high' ? 'bg-amber-100 text-amber-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-slate-900">{alert.date}</h3>
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(alert.riskLevel)}`}>
                            {getRiskIcon(alert.riskLevel)}
                            {alert.riskLevel.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">{alert.roomType}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.status === 'active' ? 'bg-blue-100 text-blue-700' : 
                        alert.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{alert.totalRooms}</p>
                      <p className="text-xs text-slate-600">Total Rooms</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-lg font-bold text-slate-900">{alert.confirmedBookings}</p>
                      <p className="text-xs text-slate-600">Confirmed</p>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <p className="text-lg font-bold text-red-600">+{alert.overbookedBy}</p>
                      <p className="text-xs text-slate-600">Overbooked</p>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <p className="text-lg font-bold text-amber-600">{alert.affectedReservations.length}</p>
                      <p className="text-xs text-slate-600">Affected</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Suggested Actions:</p>
                    <ul className="space-y-1">
                      {alert.suggestedActions.map((action, index) => (
                        <li key={index} className="text-sm text-slate-600 flex items-center gap-2">
                          <div className="text-slate-400">
                            <ArrowRight size={12} />
                          </div>
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {alert.status === 'active' && (
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                      <button
                        onClick={() => handleResolveAlert(alert.id, 'contacted_alternative')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Phone size={16} />
                        Contact Guests
                      </button>
                      <button
                        onClick={() => handleResolveAlert(alert.id, 'found_alternative')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Hotel size={16} />
                        Find Alternative
                      </button>
                      <button
                        onClick={() => handleResolveAlert(alert.id, 'ignored')}
                        className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors"
                      >
                        Ignore
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

      {view === 'walks' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Original Booking</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Alternative</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Compensation</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading...</td>
                </tr>
              ) : walkGuests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">No walk guests found</td>
                </tr>
              ) : (
                walkGuests.map(walk => (
                  <tr key={walk.reservationId} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{walk.guestName}</p>
                        <p className="text-sm text-slate-600">{walk.guestEmail}</p>
                        <p className="text-sm text-slate-600">{walk.guestPhone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600">
                        <p>{walk.originalRoomType}</p>
                        <p>{walk.originalCheckIn} - {walk.originalCheckOut}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {walk.alternativeProperty ? (
                        <div className="text-sm text-slate-900">
                          <p>{walk.alternativeProperty}</p>
                          <p>{walk.alternativeRoomType}</p>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-500">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">${walk.compensationAmount}</p>
                        <p className="text-sm text-slate-600 capitalize">{walk.compensationType.replace('_', ' ')}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWalkStatusColor(walk.status)}`}>
                        {walk.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {walk.status === 'pending' && (
                          <button
                            onClick={() => handleContactGuest(walk.reservationId)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                          >
                            Contact
                          </button>
                        )}
                        {walk.status === 'contacted' && (
                          <>
                            <button
                              onClick={() => handleUpdateWalkStatus(walk.reservationId, 'accepted')}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleUpdateWalkStatus(walk.reservationId, 'declined')}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {view === 'compensation' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Compensation Offers</h3>
          <p className="text-slate-600">Manage compensation offers for walk guests</p>
        </div>
      )}

      {view === 'analytics' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Overbooking Analytics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Walk Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.walkRate}%</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Avg Compensation</p>
              <p className="text-2xl font-bold text-slate-900">${stats.avgCompensationAmount.toFixed(0)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverbookingManagement;
