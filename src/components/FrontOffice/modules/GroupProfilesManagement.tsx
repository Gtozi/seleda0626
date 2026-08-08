import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users,
  Building2,
  Mail,
  Phone,
  MapPin,
  Search,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Globe,
  Calendar,
  FileText,
  DollarSign,
  Activity,
  Filter,
  Download,
  Clock,
  ChevronRight,
  Star,
  Shield,
  ShieldCheck,
  Eye,
  CheckSquare,
} from 'lucide-react';
import { CardSkeleton, ContentLoader } from '../../Shared/LoadingStates';
import { ModalSystem } from '../../Shared/ModalSystem';
import { useToast } from '../../Shared/Toast';
import StatCard from '../StatCard';
import { FO_AVATAR_GRADIENT, FO_STAT_GRADIENTS, statusTone, type StatusTone } from '../brandTheme';

interface GroupProfile {
  id: string;
  code: string;
  name: string;
  type: string;
  status?: string;
  contactEmail?: string;
  contactPhone?: string;
  organizationAddress?: string;
  organizationCity?: string;
  organizationCountry?: string;
  notes?: string;
  updated_at?: string;
  totalRevenue?: number;
  totalRoomNights?: number;
  totalStays?: number;
}

const GroupProfilesManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentGroupId = searchParams.get('groupId');
  const editId = searchParams.get('edit');
  const isNew = searchParams.get('new') === '1';
  const viewMode: 'list' | 'detail' | 'create' | 'edit' =
    editId ? 'edit' : isNew ? 'create' : currentGroupId ? 'detail' : 'list';
  const [groups, setGroups] = useState<GroupProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingGroup, setEditingGroup] = useState<GroupProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<GroupProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter and sort groups based on search query, filters, and sorting
  const filteredGroups = useMemo(() => {
    let result = [...groups];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(group => 
        group.name.toLowerCase().includes(query) ||
        group.code.toLowerCase().includes(query) ||
        group.contactEmail?.toLowerCase().includes(query) ||
        group.organizationCity?.toLowerCase().includes(query) ||
        group.organizationCountry?.toLowerCase().includes(query) ||
        group.type?.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      result = result.filter(group => group.type === filterType);
    }
    
    // Apply status filter
    if (filterStatus !== 'all') {
      result = result.filter(group => group.status === filterStatus);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'type':
          comparison = (a.type || '').localeCompare(b.type || '');
          break;
        case 'updated':
          comparison = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [groups, searchQuery, filterType, filterStatus, sortBy, sortOrder]);
  
  // Calculate analytics
  const analytics = useMemo(() => {
    const activeGroups = groups.filter(g => g.status === 'Active').length;
    const totalMembers = groups.reduce((sum, g) => sum + (g.totalStays || 0), 0);
    const totalRevenue = groups.reduce((sum, g) => sum + (g.totalRevenue || 0), 0);
    const totalRoomNights = groups.reduce((sum, g) => sum + (g.totalRoomNights || 0), 0);
    
    return {
      totalGroups: groups.length,
      activeGroups,
      totalMembers,
      totalRevenue,
      totalRoomNights,
      averageRevenue: groups.length > 0 ? totalRevenue / groups.length : 0,
    };
  }, [groups]);

  // Fetch groups
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching groups (using cookie-based auth)');
      
      const response = await fetch('/api/group-profiles', {
        credentials: 'include', // Include cookies for authentication
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        throw new Error(`Failed to fetch groups: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      setGroups(data.groupProfiles || []);
    } catch (error: any) {
      console.error('Error fetching groups:', error);
      setError(error.message || 'Failed to fetch groups');
      setGroups([]); // Set empty array on error to prevent stuck loading
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, []); // Run once on mount

  const handleViewGroup = (groupId: string) => {
    setSearchParams({ groupId });
  };

  const handleEditGroup = (group: GroupProfile) => {
    setEditingGroup(group);
    setSearchParams({ edit: group.id });
  };

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setSearchParams({ new: '1' });
  };

  const handleDeleteClick = (group: GroupProfile) => {
    setDeleteTarget(group);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const response = await fetch(`/api/group-profiles/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete group');

      setDeleteTarget(null);
      await fetchGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert('Failed to delete group');
    }
  };

  const handleBack = () => {
    setSearchParams({});
    setEditingGroup(null);
  };

  const handleExportGroups = () => {
    const csvContent = [
      ['Code', 'Name', 'Type', 'Status', 'Email', 'Phone', 'City', 'Country'].join(','),
      ...filteredGroups.map(g => [
        g.code,
        g.name,
        g.type,
        g.status,
        g.contactEmail || '',
        g.contactPhone || '',
        g.organizationCity || '',
        g.organizationCountry || ''
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'group-profiles.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Map group type → semantic tone for consistent theming
  const groupTypeTone: Record<string, StatusTone> = {
    CorporateAccount: 'info',
    TravelAgent: 'success',
    TourOperator: 'neutral',
    Conference: 'warning',
    Event: 'warning',
    GroupReservation: 'accent',
  };

  // Get group type icon
  const getGroupTypeIcon = (type?: string) => {
    const tone = type ? (groupTypeTone[type] || 'neutral') : 'neutral';
    const toneColor = statusTone[tone]?.text || statusTone.neutral?.text || 'text-gray-600 dark:text-gray-400';
    switch (type) {
      case 'CorporateAccount':
        return <Building2 size={16} className={toneColor} />;
      case 'TravelAgent':
        return <Briefcase size={16} className={toneColor} />;
      case 'TourOperator':
        return <Globe size={16} className={toneColor} />;
      case 'Conference':
        return <Calendar size={16} className={toneColor} />;
      case 'Event':
        return <Calendar size={16} className={toneColor} />;
      case 'GroupReservation':
        return <Users size={16} className={toneColor} />;
      default:
        return <Users size={16} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  // Get group type color (soft badge style from semantic tone)
  const getGroupTypeColor = (type?: string) => {
    const tone = type ? (groupTypeTone[type] || 'neutral') : 'neutral';
    return statusTone[tone]?.soft || statusTone.neutral?.soft || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  };

  // List View
  if (viewMode === 'list') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Group Profiles</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your group profiles and contacts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <Filter size={18} />
              <span>Filters</span>
              {showFilters && <ChevronRight size={16} className="rotate-90" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportGroups}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <Download size={18} />
              <span>Export</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateGroup}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
            >
              <Plus size={18} />
              <span>New Group</span>
            </motion.button>
          </div>
        </div>
        
        {/* Analytics Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <StatCard label="Total Groups" value={analytics.totalGroups} icon={Users} tone="accent" caption={`Active: ${analytics.activeGroups}`} />
          <StatCard label="Total Revenue" value={`$${analytics.totalRevenue.toLocaleString()}`} icon={DollarSign} tone="success" caption={`Avg: $${analytics.averageRevenue.toFixed(0)}`} />
          <StatCard label="Room Nights" value={analytics.totalRoomNights.toLocaleString()} icon={Calendar} tone="info" caption={`Total stays: ${analytics.totalMembers}`} />
          <StatCard label="Corporate" value={groups.filter(g => g.type === 'CorporateAccount').length} icon={Building2} tone="warning" caption="Corporate" />
          <StatCard label="Travel Agents" value={groups.filter(g => g.type === 'TravelAgent').length} icon={Briefcase} tone="neutral" caption="Travel Agent" />
        </motion.div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="CorporateAccount">Corporate Account</option>
                    <option value="TravelAgent">Travel Agent</option>
                    <option value="TourOperator">Tour Operator</option>
                    <option value="Conference">Conference</option>
                    <option value="Event">Event</option>
                    <option value="GroupReservation">Group Reservation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Blacklisted">Blacklisted</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="name">Name</option>
                    <option value="code">Code</option>
                    <option value="type">Type</option>
                    <option value="updated">Last Updated</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Order</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search groups by name, code, email, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white transition shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
              <X size={18} />
            </button>
          )}
          <div className="absolute right-14 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
            {filteredGroups.length} {filteredGroups.length === 1 ? 'result' : 'results'}
          </div>
        </div>

        {/* Content */}
        <ContentLoader
          isLoading={loading}
          error={error}
          onRetry={fetchGroups}
          skeleton={<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>}
        >
          {filteredGroups.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Users size={32} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery ? 'No groups found' : 'No groups yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Create your first group profile to get started'
                }
              </p>
              {!searchQuery && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateGroup}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                  <span>Create Group</span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {filteredGroups.map((group) => (
                  <motion.div
                    key={group.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${FO_AVATAR_GRADIENT} rounded-lg flex items-center justify-center text-white font-semibold`}>
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                            {group.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            {group.type && (
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${getGroupTypeColor(group.type)}`}>
                                {getGroupTypeIcon(group.type)}
                                {group.type}
                              </span>
                            )}
                            {group.updated_at && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                {new Date(group.updated_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 mb-3">
                      {group.contactEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail size={14} />
                          <span className="truncate">{group.contactEmail}</span>
                        </div>
                      )}
                      {group.contactPhone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Phone size={14} />
                          <span>{group.contactPhone}</span>
                        </div>
                      )}
                      {(group.organizationCity || group.organizationCountry) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin size={14} />
                          <span>{[group.organizationCity, group.organizationCountry].filter(Boolean).join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 mb-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-500">Revenue</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {group.totalRevenue ? `$${group.totalRevenue.toLocaleString()}` : '$0'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-500">Room Nights</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {group.totalRoomNights?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-500">Stays</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {group.totalStays || '0'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500 dark:text-gray-500">Status</span>
                        <span className={`text-xs font-semibold ${
                          group.status === 'Active' ? 'text-[var(--color-success)]' :
                          group.status === 'Inactive' ? 'text-gray-500' :
                          group.status === 'Suspended' ? 'text-[var(--color-warning)]' :
                          'text-[var(--color-danger)]'
                        }`}>
                          {group.status || 'Active'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewGroup(group.id)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        <FileText size={14} />
                        <span>View</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditGroup(group)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteClick(group)}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </ContentLoader>

        {/* Delete Confirmation Modal */}
        <ModalSystem
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Group"
          subtitle={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
          variant="confirm"
          confirmColor="rose"
          confirmLabel="Delete"
        />
      </div>
    );
  }

  // Detail View
  if (viewMode === 'detail' && currentGroupId) {
    return <GroupDetail groupId={currentGroupId} onBack={handleBack} />;
  }

  // Create/Edit View
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <GroupForm
        group={editingGroup}
        onSave={async (data) => {
          const url = viewMode === 'create' 
            ? '/api/group-profiles'
            : `/api/group-profiles/${editId}`;
          const method = viewMode === 'create' ? 'POST' : 'PATCH';

          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data)
          });

          if (!response.ok) throw new Error('Failed to save group');

          await fetchGroups();
          handleBack();
        }}
        onCancel={handleBack}
      />
    );
  }
};

// Group Detail Component
const GroupDetail = ({ groupId, onBack }: { groupId: string; onBack: () => void }) => {
  const navigate = useNavigate();
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberFilterRole, setMemberFilterRole] = useState<string>('all');
  const [showMemberFilters, setShowMemberFilters] = useState(false);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [guestSearchQuery, setGuestSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [linking, setLinking] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMemberForRole, setSelectedMemberForRole] = useState<any>(null);
  const [showGuestProfileModal, setShowGuestProfileModal] = useState(false);
  const [selectedGuestProfile, setSelectedGuestProfile] = useState<any>(null);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);
  const [loadingGuestProfile, setLoadingGuestProfile] = useState(false);
  const [showEditGuestModal, setShowEditGuestModal] = useState(false);
  const [editingGuestData, setEditingGuestData] = useState<any>(null);

  const roleTone: Record<string, StatusTone> = {
    'Primary Contact': 'warning',
    'Coordinator': 'info',
    'Manager': 'neutral',
    'Member': 'neutral',
  };

  const getRoleIcon = (role: string) => {
    const tone = roleTone[role] || 'neutral';
    const toneColor = statusTone[tone].text;
    switch (role) {
      case 'Primary Contact': return <Star size={16} className={toneColor} />;
      case 'Coordinator': return <Shield size={16} className={toneColor} />;
      case 'Manager': return <Briefcase size={16} className={toneColor} />;
      default: return <Users size={16} className="text-gray-600 dark:text-gray-400" />;
    }
  };

  const filteredMembers = useMemo(() => {
    let result = [...members];
    if (memberSearchQuery) {
      const query = memberSearchQuery.toLowerCase();
      result = result.filter(member =>
        member.name?.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      );
    }
    if (memberFilterRole !== 'all') {
      result = result.filter(member => member.relationshipType === memberFilterRole);
    }
    return result;
  }, [members, memberSearchQuery, memberFilterRole]);

  const activityTimeline = useMemo(() => {
    if (!group) return [];
    const activities = [
      { id: '1', type: 'group_created', title: 'Group Profile Created', description: `Group "${group.name}" was created`, timestamp: group.updated_at || new Date().toISOString(), icon: <Users size={16} className={statusTone.accent.text} /> },
      { id: '2', type: 'member_added', title: 'Member Added', description: `${members.length} member(s) linked to group`, timestamp: new Date(Date.now() - 86400000).toISOString(), icon: <CheckCircle2 size={16} className={statusTone.success.text} /> },
      { id: '3', type: 'status_updated', title: 'Status Updated', description: `Status changed to ${group.status || 'Active'}`, timestamp: new Date(Date.now() - 172800000).toISOString(), icon: <Activity size={16} className={statusTone.info.text} /> },
    ];
    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [group, members]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const groupResponse = await fetch(`/api/group-profiles/${groupId}`, { credentials: 'include' });
        if (!groupResponse.ok) throw new Error('Failed to fetch group');
        const groupData = await groupResponse.json();
        setGroup(groupData.groupProfile);

        const membersResponse = await fetch(`/api/group-profiles/${groupId}/members`, { credentials: 'include' });
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setMembers(membersData.members || []);
        } else {
          setMembers([]);
        }
      } catch (error: any) {
        console.error('Error fetching group details:', error);
        setError(error.message || 'Failed to fetch group details');
      } finally {
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  const searchGuests = async (query: string) => {
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const response = await fetch(`/api/front-office/guests?search=${encodeURIComponent(query)}&limit=20`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to search guests');
      const data = await response.json();
      setSearchResults(data.guests || []);
    } catch (error) { console.error('Error searching guests:', error); } finally { setSearching(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => searchGuests(guestSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [guestSearchQuery]);

  const handleLinkGuest = async (guestId: string) => {
    setLinking(true);
    try {
      const response = await fetch(`/api/group-profiles/${groupId}/link-guest`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ guestId, relationshipType: 'Member', isPrimaryContact: false }),
      });
      if (!response.ok) throw new Error('Failed to link guest');
      const membersResponse = await fetch(`/api/group-profiles/${groupId}/members`, { credentials: 'include' });
      if (membersResponse.ok) { const membersData = await membersResponse.json(); setMembers(membersData.members || []); }
      setShowAddGuestModal(false); setGuestSearchQuery(''); setSearchResults([]); setLinking(false);
      alert('Guest linked successfully');
    } catch (error: any) { console.error('Error linking guest:', error); setLinking(false); alert('Failed to link guest'); }
  };

  const handleUnlinkGuest = async (guestId: string) => {
    if (!confirm('Are you sure you want to remove this guest from the group?')) return;
    try {
      const response = await fetch(`/api/group-profiles/${groupId}/unlink-guest`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ guestId }),
      });
      if (!response.ok) throw new Error('Failed to unlink guest');
      const membersResponse = await fetch(`/api/group-profiles/${groupId}/members`, { credentials: 'include' });
      if (membersResponse.ok) { const membersData = await membersResponse.json(); setMembers(membersData.members || []); }
    } catch (error: any) { console.error('Error unlinking guest:', error); alert('Failed to remove guest'); }
  };

  const handleBulkUnlink = async () => {
    if (selectedMembers.size === 0) return;
    if (!confirm(`Are you sure you want to remove ${selectedMembers.size} member(s) from the group?`)) return;
    try {
      for (const guestId of selectedMembers) {
        const response = await fetch(`/api/group-profiles/${groupId}/unlink-guest`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
          body: JSON.stringify({ guestId }),
        });
        if (!response.ok) throw new Error('Failed to unlink guest');
      }
      const membersResponse = await fetch(`/api/group-profiles/${groupId}/members`, { credentials: 'include' });
      if (membersResponse.ok) { const membersData = await membersResponse.json(); setMembers(membersData.members || []); }
      setSelectedMembers(new Set()); setBulkSelectMode(false);
      alert('Members removed successfully');
    } catch (error: any) { console.error('Error bulk unlinking guests:', error); alert('Failed to remove members'); }
  };

  const toggleMemberSelection = (guestId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(guestId)) { newSelection.delete(guestId); } else { newSelection.add(guestId); }
    setSelectedMembers(newSelection);
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/group-profiles/${groupId}/update-member-role`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ guestId: memberId, relationshipType: newRole }),
      });
      if (!response.ok) throw new Error('Failed to update member role');
      const membersResponse = await fetch(`/api/group-profiles/${groupId}/members`, { credentials: 'include' });
      if (membersResponse.ok) { const membersData = await membersResponse.json(); setMembers(membersData.members || []); }
      setShowRoleModal(false); setSelectedMemberForRole(null);
      alert('Member role updated successfully');
    } catch (error: any) { console.error('Error updating member role:', error); alert('Failed to update member role'); }
  };

  const handleViewGuestProfile = async (guestId: string) => {
    setLoadingGuestProfile(true);
    setSelectedGuestId(guestId);
    try {
      const response = await fetch(`/api/front-office/guests/${guestId}`, { credentials: 'include' });
      if (response.ok) {
        const guestData = await response.json();
        setSelectedGuestProfile(guestData.guest || guestData);
        setShowGuestProfileModal(true);
      } else {
        const member = members.find(m => m.id === guestId);
        if (member) { setSelectedGuestProfile(member); setShowGuestProfileModal(true); } else { alert('Failed to load guest profile'); }
      }
    } catch (error) {
      console.error('Error fetching guest profile:', error);
      const member = members.find(m => m.id === guestId);
      if (member) { setSelectedGuestProfile(member); setShowGuestProfileModal(true); } else { alert('Failed to load guest profile'); }
    } finally {
      setLoadingGuestProfile(false);
    }
  };

  const handleEditGuestFromCard = (member: any) => {
    // Navigate to Front Office guest profiles page with edit ID.
    // GuestProfiles.tsx reads the `edit` search param (searchParams.get('edit')),
    // so we use `edit=` here — not `editId=`.
    const guestId = member.id || member.guest_id;
    console.log('[GroupProfiles] Edit member clicked:', { memberId: member.id, guestId: member.guest_id, resolvedId: guestId, member });
    if (!guestId) {
      console.error('[GroupProfiles] No guest ID found on member object!', member);
      alert('Cannot edit guest: member ID is missing. Check console for details.');
      return;
    }
    navigate('/erp/frontoffice/guest-profiles?edit=' + guestId);
  };

  const handleEditGuestProfile = (guestId: string) => {
    // Open edit modal with the guest profile data
    setEditingGuestData(selectedGuestProfile);
    setShowEditGuestModal(true);
  };

  if (loading) return <div className="p-6"><CardSkeleton /></div>;
  if (!group) return (
    <div className="p-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <AlertCircle className="mx-auto text-red-600 dark:text-red-400 mb-2" size={32} />
        <p className="text-red-900 dark:text-red-100 font-medium">Group not found</p>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <motion.button whileHover={{ x: -4 }} onClick={onBack} className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <ArrowLeft size={18} />
        <span>Back to Groups</span>
      </motion.button>

      <div className={`${FO_STAT_GRADIENTS.primary} rounded-2xl p-6 text-white mb-6`}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{group.name}</h1>
            <p className="text-white/80">{group.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { alert('Edit functionality coming soon'); }} className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition flex items-center gap-2">
              <Edit size={18} />
              <span>Edit</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Mail size={18} className={statusTone.accent.text} />Contact Information</h3>
            <div className="space-y-2 pl-7">
              {group.contactEmail && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span className="text-sm font-medium">Email:</span><a href={`mailto:${group.contactEmail}`} className="{statusTone.accent.text} hover:underline">{group.contactEmail}</a></div>}
              {group.contactPhone && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span className="text-sm font-medium">Phone:</span><a href={`tel:${group.contactPhone}`} className="{statusTone.accent.text} hover:underline">{group.contactPhone}</a></div>}
              {group.address && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span className="text-sm font-medium">Address:</span><span>{group.address}</span></div>}
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Building2 size={18} className={statusTone.accent.text} />Organization Details</h3>
            <div className="space-y-2 pl-7">
              {group.organizationName && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span className="text-sm font-medium">Organization:</span><span>{group.organizationName}</span></div>}
              {group.taxId && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span className="text-sm font-medium">Tax ID:</span><span>{group.taxId}</span></div>}
              {group.vatId && <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span className="text-sm font-medium">VAT ID:</span><span>{group.vatId}</span></div>}
              {group.organizationCity && <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400"><MapPin size={14} /><span>{[group.organizationCity, group.organizationCountry].filter(Boolean).join(', ')}</span></div>}
            </div>
          </div>
        </div>

        {group.notes && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2"><FileText size={18} className={statusTone.accent.text} />Notes</h3>
            <p className="text-gray-600 dark:text-gray-400">{group.notes}</p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Users size={18} className={statusTone.accent.text} />Members ({members.length})</h3>
            <div className="flex items-center gap-2">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowMemberFilters(!showMemberFilters)} className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2"><Filter size={14} /><span>Filters</span></motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setBulkSelectMode(!bulkSelectMode)} className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center gap-2"><CheckSquare size={14} /><span>{bulkSelectMode ? 'Cancel' : 'Select'}</span></motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddGuestModal(true)} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"><Plus size={14} /><span>Add Member</span></motion.button>
            </div>
          </div>

          {showMemberFilters && (
            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Members</label><input type="text" placeholder="Search by name or email..." value={memberSearchQuery} onChange={(e) => setMemberSearchQuery(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Role</label><select value={memberFilterRole} onChange={(e) => setMemberFilterRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"><option value="all">All Roles</option><option value="Primary Contact">Primary Contact</option><option value="Coordinator">Coordinator</option><option value="Manager">Manager</option><option value="Member">Member</option></select></div>
              </div>
            </div>
          )}

          {bulkSelectMode && selectedMembers.size > 0 && (
            <div className="mb-4 p-4 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-900 dark:text-gray-100">{selectedMembers.size} member(s) selected</span>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleBulkUnlink} className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Remove Selected</motion.button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((member) => (
              <motion.div key={member.id} whileHover={{ y: -2 }} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {bulkSelectMode && <input type="checkbox" checked={selectedMembers.has(member.id)} onChange={() => toggleMemberSelection(member.id)} className="w-4 h-4 rounded border-gray-300 {statusTone.accent.text} focus:ring-blue-500" />}
                    <div className="w-10 h-10 {FO_AVATAR_GRADIENT} rounded-full flex items-center justify-center text-white font-bold">{member.name?.charAt(0).toUpperCase() || '?'}</div>
                    <div><p className="font-medium text-gray-900 dark:text-white">{member.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{member.email || 'No email'}</p></div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusTone[roleTone[member.relationshipType] || 'neutral'].soft}`}>{member.relationshipType || 'Member'}</span>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleViewGuestProfile(member.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition"><Eye size={12} /><span>View</span></motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleEditGuestFromCard(member)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition"><Edit size={12} /><span>Edit</span></motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedMemberForRole(member); setShowRoleModal(true); }} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"><Shield size={12} /><span>Role</span></motion.button>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleUnlinkGuest(member.id)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition"><X size={12} /><span>Remove</span></motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && <div className="text-center py-8 text-gray-500 dark:text-gray-400">No members found</div>}
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Clock size={18} className={statusTone.accent.text} />Recent Activity</h3>
          <div className="pl-7 space-y-3">
            {activityTimeline.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">{activity.icon}</div>
                  {index < activityTimeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <p className="font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ModalSystem isOpen={showAddGuestModal} onClose={() => { setShowAddGuestModal(false); setGuestSearchQuery(''); setSearchResults([]); }} title="Add Guest to Group">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Guests</label><input type="text" placeholder="Search by name or email..." value={guestSearchQuery} onChange={(e) => setGuestSearchQuery(e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white" /></div>
          {searching && <div className="flex items-center justify-center py-4"><Loader2 className="animate-spin {statusTone.accent.text}" size={24} /></div>}
          {searchResults.length > 0 && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchResults.map((guest) => (
                <div key={guest.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 {FO_AVATAR_GRADIENT} rounded-full flex items-center justify-center text-white font-bold">{guest.name?.charAt(0).toUpperCase() || '?'}</div>
                    <div><p className="font-medium text-gray-900 dark:text-white">{guest.name}</p><p className="text-xs text-gray-500 dark:text-gray-400">{guest.email || 'No email'}</p></div>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleLinkGuest(guest.id)} disabled={linking} className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50">{linking ? 'Adding...' : 'Add'}</motion.button>
                </div>
              ))}
            </div>
          )}
          {guestSearchQuery && searchResults.length === 0 && !searching && <div className="text-center py-4 text-gray-500 dark:text-gray-400">No guests found</div>}
        </div>
      </ModalSystem>

      <ModalSystem isOpen={showRoleModal} onClose={() => { setShowRoleModal(false); setSelectedMemberForRole(null); }} title="Change Member Role">
        {selectedMemberForRole && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
              <div className="w-12 h-12 {FO_AVATAR_GRADIENT} rounded-full flex items-center justify-center text-white font-bold text-xl">{selectedMemberForRole.name?.charAt(0).toUpperCase() || '?'}</div>
              <div><p className="font-semibold text-gray-900 dark:text-white">{selectedMemberForRole.name}</p><p className="text-sm text-gray-500 dark:text-gray-400">Current: {selectedMemberForRole.relationshipType || 'Member'}</p></div>
            </div>
            <div className="space-y-2">
              {['Primary Contact', 'Coordinator', 'Manager', 'Member'].map((role) => (
                <button key={role} onClick={() => handleUpdateMemberRole(selectedMemberForRole.id, role)} className={`w-full flex items-center gap-3 p-3 rounded-lg border transition ${selectedMemberForRole.relationshipType === role ? statusTone[roleTone[role] || 'neutral'].soft : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'}`}>
                  {getRoleIcon(role)}<span className="font-medium">{role}</span>{selectedMemberForRole.relationshipType === role && <CheckCircle2 size={16} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </ModalSystem>

      <AnimatePresence>
        {showGuestProfileModal && selectedGuestProfile && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => { setShowGuestProfileModal(false); setSelectedGuestId(null); }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {loadingGuestProfile ? <div className="p-12 flex items-center justify-center"><Loader2 size={32} className="animate-spin {statusTone.accent.text}" /></div> : (
                <>
                  <div className="{FO_STAT_GRADIENTS.primary} p-6 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl font-bold">{selectedGuestProfile.name?.charAt(0).toUpperCase() || '?'}</div>
                        <div><h2 className="text-2xl font-bold">{selectedGuestProfile.name}</h2><p className="text-white/80">Guest Profile</p></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setShowGuestProfileModal(false); setSelectedGuestId(null); }} className="p-2 hover:bg-white/20 rounded-lg transition"><X size={24} className="text-white" /></button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Mail size={18} className={statusTone.accent.text} />Contact Information</h3>
                        <div className="space-y-3">
                          {selectedGuestProfile.email && <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"><Mail size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500 dark:text-gray-400">Email</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selectedGuestProfile.email}</p></div></div>}
                          {selectedGuestProfile.phone && <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"><Phone size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500 dark:text-gray-400">Phone</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selectedGuestProfile.phone}</p></div></div>}
                          {selectedGuestProfile.address && <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"><MapPin size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500 dark:text-gray-400">Address</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selectedGuestProfile.address}</p></div></div>}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2"><Users size={18} className={statusTone.accent.text} />Group Information</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"><Building2 size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500 dark:text-gray-400">Group</p><p className="text-sm font-medium text-gray-900 dark:text-white">{group?.name}</p></div></div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg"><Shield size={16} className="text-gray-400" /><div><p className="text-xs text-gray-500 dark:text-gray-400">Role</p><p className="text-sm font-medium text-gray-900 dark:text-white">{selectedGuestProfile.relationshipType || 'Member'}</p></div></div>
                          {selectedGuestProfile.isPrimaryContact && <div className="flex items-center gap-3 p-3 {statusTone.warning.soft} rounded-lg border"><Star size={16} className="text-amber-600" /><div><p className="text-xs {statusTone.warning.text}">Primary Contact</p><p className="text-sm font-medium text-gray-900 dark:text-gray-100">This member is a primary contact</p></div></div>}
                        </div>
                      </div>
                    </div>
                    {selectedGuestProfile.notes && (
                      <div className="mt-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3"><FileText size={18} className={statusTone.accent.text} />Notes</h3>
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"><p className="text-sm text-gray-600 dark:text-gray-400">{selectedGuestProfile.notes}</p></div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 flex gap-3 p-6 pt-0">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowGuestProfileModal(false); setSelectedMemberForRole(selectedGuestProfile); setShowRoleModal(true); }} className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"><Shield size={18} />Change Role</motion.button>
                    {selectedGuestProfile.email && <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => window.location.href = `mailto:${selectedGuestProfile.email}`} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2"><Mail size={18} />Send Email</motion.button>}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Guest Profile Modal */}
      <ModalSystem
        isOpen={showEditGuestModal}
        onClose={() => setShowEditGuestModal(false)}
        title=""
      >
        {editingGuestData && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Guest</h2>
              <button 
                onClick={() => setShowEditGuestModal(false)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft size={20} />
                Cancel
              </button>
            </div>
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`/api/front-office/guests/${editingGuestData.id}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify(editingGuestData)
                });
                if (response.ok) {
                  alert('Guest profile updated successfully');
                  setShowEditGuestModal(false);
                  setShowGuestProfileModal(false);
                  const membersResponse = await fetch(`/api/group-profiles/${groupId}/members`, { credentials: 'include' });
                  if (membersResponse.ok) {
                    const membersData = await membersResponse.json();
                    setMembers(membersData.members || []);
                  }
                } else {
                  alert('Failed to update guest profile');
                }
              } catch (error) {
                console.error('Error updating guest profile:', error);
                alert('Failed to update guest profile');
              }
            }}>
              {/* Personal Information */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input 
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.firstName || editingGuestData.name?.split(' ')[0] || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input 
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.lastName || editingGuestData.name?.split(' ').slice(1).join(' ') || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, lastName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                    <input 
                      required
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="email" 
                      value={editingGuestData.email || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="tel" 
                      value={editingGuestData.phone || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nationality</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.nationality || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, nationality: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Passport Number</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.passportNumber || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, passportNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visa Info</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.visaInfo || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, visaInfo: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingGuestData.status || 'Regular'}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, status: e.target.value })}
                    >
                      <option value="Regular">Regular</option>
                      <option value="VIP">VIP</option>
                      <option value="Loyalty Member">Loyalty Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loyalty Points</label>
                    <input 
                      min="0"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="number" 
                      value={editingGuestData.loyaltyPoints || 0}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, loyaltyPoints: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>

              {/* ID Document */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                  <ShieldCheck size={20} className={statusTone.accent.text} />
                  ID Document
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Enter document details and upload scanned images of the ID (front and back).</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingGuestData.documentType || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, documentType: e.target.value })}
                    >
                      <option value="">Select type...</option>
                      <option value="Passport">Passport</option>
                      <option value="National ID">National ID</option>
                      <option value="Driver's License">Driver's License</option>
                      <option value="Residence Permit">Residence Permit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Document Number</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Enter document number"
                      type="text" 
                      value={editingGuestData.documentNumber || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, documentNumber: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Expiry Date</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="date" 
                      value={editingGuestData.documentExpiry || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, documentExpiry: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Date</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="date" 
                      value={editingGuestData.documentIssue || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, documentIssue: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issuing Country</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="e.g., US, UK, ET"
                      type="text" 
                      value={editingGuestData.issuingCountry || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, issuingCountry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingGuestData.language || 'English'}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, language: e.target.value })}
                    >
                      <option value="English">English</option>
                      <option value="Amharic">Amharic</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Spanish">Spanish</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Chinese">Chinese</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingGuestData.roomType || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, roomType: e.target.value })}
                    >
                      <option value="">Select room type...</option>
                      <option value="Single Room">Single Room</option>
                      <option value="Double Room">Double Room</option>
                      <option value="Suite">Suite</option>
                      <option value="Twin">Twin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bed Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingGuestData.bedType || 'Single'}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, bedType: e.target.value })}
                    >
                      <option value="Single">Single</option>
                      <option value="Double">Double</option>
                      <option value="Queen">Queen</option>
                      <option value="King">King</option>
                      <option value="Twin">Twin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pillow Type</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingGuestData.pillowType || 'Medium'}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, pillowType: e.target.value })}
                    >
                      <option value="Soft">Soft</option>
                      <option value="Medium">Medium</option>
                      <option value="Firm">Firm</option>
                      <option value="Hypoallergenic">Hypoallergenic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dietary</label>
                    <select 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editingGuestData.dietary || 'None'}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, dietary: e.target.value })}
                    >
                      <option value="None">None</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Vegan">Vegan</option>
                      <option value="Halal">Halal</option>
                      <option value="Kosher">Kosher</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Lactose-Free">Lactose-Free</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.emergencyContactName || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, emergencyContactName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="tel" 
                      value={editingGuestData.emergencyContactPhone || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, emergencyContactPhone: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Relationship</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.emergencyContactRelationship || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, emergencyContactRelationship: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.companyName || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, companyName: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.position || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, position: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                    <input 
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      type="text" 
                      value={editingGuestData.companyAddress || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, companyAddress: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Notes & Special Requests */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes & Special Requests</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                    <textarea 
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Internal notes about the guest..."
                      value={editingGuestData.notes || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, notes: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Requests</label>
                    <textarea 
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Guest's special requests..."
                      value={editingGuestData.specialRequests || ''}
                      onChange={(e) => setEditingGuestData({ ...editingGuestData, specialRequests: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditGuestModal(false)}
                  className="px-6 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Guest
                </button>
              </div>
            </form>
          </div>
        )}
      </ModalSystem>
    </div>
  );
};

// Group Form Component
const GroupForm = ({ group, onSave, onCancel }: {
  group: GroupProfile | null; 
  onSave: (data: any) => Promise<void>; 
  onCancel: () => void;
}) => {
  const [formData, setFormData] = useState({
    code: group?.code || '',
    name: group?.name || '',
    type: group?.type || 'CorporateAccount',
    status: group?.status || 'Active',
    contactEmail: group?.contactEmail || '',
    contactPhone: group?.contactPhone || '',
    organizationAddress: group?.organizationAddress || '',
    organizationCity: group?.organizationCity || '',
    organizationCountry: group?.organizationCountry || '',
    notes: group?.notes || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { success, error: toastError, ToastContainer } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Group code is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required';
    }
    if (!formData.type.trim()) {
      newErrors.type = 'Group type is required';
    }

    if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toastError('Please fix the form errors');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      success(group ? 'Group updated successfully' : 'Group created successfully');
    } catch (error: any) {
      console.error('Error saving group:', error);
      toastError(error.message || 'Failed to save group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="p-6">
      <ToastContainer />
      
      {/* Back Button */}
      <motion.button
        whileHover={{ x: -4 }}
        onClick={onCancel}
        className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <ArrowLeft size={18} />
        <span>Cancel</span>
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden"
      >
        {/* Header */}
        <div className="{FO_STAT_GRADIENTS.primary} p-6 text-white">
          <h2 className="text-2xl font-bold">
            {group ? 'Edit Group' : 'Create New Group'}
          </h2>
          <p className="text-white/80 mt-1">
            {group ? 'Update the group information below' : 'Fill in the details to create a new group'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={20} className={statusTone.accent.text} />
              Basic Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                  errors.code ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter unique group code"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.code}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                  errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Enter group name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                  errors.type ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="CorporateAccount">Corporate Account</option>
                <option value="TravelAgent">Travel Agent</option>
                <option value="TourOperator">Tour Operator</option>
                <option value="Conference">Conference</option>
                <option value="Event">Event</option>
                <option value="GroupReservation">Group Reservation</option>
              </select>
              {errors.type && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.type}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
                <option value="Blacklisted">Blacklisted</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Mail size={20} className={statusTone.accent.text} />
              Contact Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition ${
                  errors.contactEmail ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="email@example.com"
              />
              {errors.contactEmail && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.contactEmail}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <MapPin size={20} className={statusTone.accent.text} />
              Address
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.organizationAddress}
                onChange={(e) => handleChange('organizationAddress', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.organizationCity}
                  onChange={(e) => handleChange('organizationCity', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.organizationCountry}
                  onChange={(e) => handleChange('organizationCountry', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={20} className={statusTone.accent.text} />
              Additional Information
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition resize-none"
                placeholder="Add any additional notes about this group..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>{group ? 'Update Group' : 'Create Group'}</span>
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <X size={18} />
              <span>Cancel</span>
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default GroupProfilesManagement;
