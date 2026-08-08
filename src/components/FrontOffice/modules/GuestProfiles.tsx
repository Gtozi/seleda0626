/**
 * Front Office Guest Profiles Module
 * Guest information, history, and preferences
 *
 * Overhauled: search debounce, pagination, sort, loyalty tier filter,
 * summary stats, inline toasts, complete form, delete/merge/export,
 * tabbed detail view (Profile / History / Notes / Activity).
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Edit,
  Eye,
  History,
  MessageSquare,
  Shield,
  Phone,
  Mail,
  MapPin,
  Building2,
  Heart,
  Utensils,
  FileText,
  BedDouble,
  Filter,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Users,
  User,
  Download,
  Trash2,
  GitMerge,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  Calendar,
  DollarSign,
  AlertTriangle,
  StickyNote,
  Activity,
  Crown,
  Upload,
  Camera,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '../../Shared/Toast';
import { supabase } from '../../../lib/supabase';
import { FO_AVATAR_GRADIENT, statusTone, type StatusTone } from '../brandTheme';

type LoyaltyTier = 'none' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

interface CompanyInfo {
  name: string;
  position: string;
  address: string;
}

interface GuestPreferences {
  language: string;
  roomType: string;
  pillowType: string;
  bedType: string;
  dietary: string;
  newspaper: string;
  amenities: string[];
}

interface GuestHistory {
  totalStays: number;
  totalRevenue: number;
  totalNights: number;
  lastStay: string | null;
  stayFrequency: string;
  loyaltyTier: LoyaltyTier;
  loyaltyPoints: number;
  complaints: number;
  compliments: number;
  blacklistStatus: boolean;
}

interface IdDocument {
  type?: string;          // Passport | National ID | Drivers License
  number?: string;
  expiryDate?: string;
  issueDate?: string;
  issuingCountry?: string;
  frontImageUrl?: string | null;
  backImageUrl?: string | null;
  uploadedAt?: string;
  isUploaded?: boolean;
  verifiedAt?: string | null;
}

interface GuestProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportNumber?: string;
  visaInfo?: string;
  idDocument?: IdDocument | null;
  emergencyContact: EmergencyContact | null;
  company: CompanyInfo | null;
  preferences: GuestPreferences;
  history: GuestHistory;
  parentGroupId?: string;
  parentCorporateId?: string;
  status: string;
  specialRequests?: string;
  notes?: string;
}

// ── Helpers ────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

const loyaltyTierTone: Record<LoyaltyTier, StatusTone> = {
  none: 'neutral',
  silver: 'neutral',
  gold: 'warning',
  platinum: 'info',
  diamond: 'accent',
};

const loyaltyTierColors: Record<LoyaltyTier, string> = {
  none: statusTone.neutral.soft,
  silver: statusTone.neutral.soft,
  gold: statusTone.warning.soft,
  platinum: statusTone.info.soft,
  diamond: statusTone.accent.soft,
};

const loyaltyTierBorderColors: Record<LoyaltyTier, string> = {
  none: statusTone.neutral.border,
  silver: statusTone.neutral.border,
  gold: statusTone.warning.border,
  platinum: statusTone.info.border,
  diamond: statusTone.accent.border,
};

const loyaltyTierTextColors: Record<LoyaltyTier, string> = {
  none: statusTone.neutral.text,
  silver: statusTone.neutral.text,
  gold: statusTone.warning.text,
  platinum: statusTone.info.text,
  diamond: statusTone.accent.text,
};

const loyaltyTierIcons: Record<LoyaltyTier, typeof Star> = {
  none: Star,
  silver: Star,
  gold: Star,
  platinum: Crown,
  diamond: Crown,
};

const ALL_AMENITIES = [
  'High Floor', 'Quiet Room', 'City View', 'Pool View',
  'Extra Pillows', 'Hypoallergenic', 'Baby Cot', 'Wheelchair Access',
  'Late Check-in', 'Early Check-in',
];

function getInitials(firstName: string, lastName: string): string {
  const f = (firstName || '').trim()[0] || '';
  const l = (lastName || '').trim()[0] || '';
  return (f + l).toUpperCase() || '?';
}

function formatDate(value: string | null | undefined): string {
  if (!value) return 'N/A';
  const d = new Date(value);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatCurrency(value: number | undefined | null): string {
  const n = typeof value === 'number' ? value : 0;
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function downloadCSV(filename: string, rows: Record<string, any>[]): void {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers.map((h) => {
        const val = row[h] ?? '';
        const s = String(val).replace(/"/g, '""');
        return `"${s}"`;
      }).join(',')
    ),
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Debounce hook
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Upload an ID document image file to the `id-cards` Supabase storage bucket.
// Returns the public URL on success, or null on failure.
async function uploadIdDocumentFile(file: File, guestId: string, side: 'front' | 'back'): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${guestId}_${side}_${Date.now()}.${fileExt}`;
    const filePath = `${guestId}/${fileName}`;

    const { error } = await supabase.storage
      .from('id-cards')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('id-cards')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading ID document:', error);
    return null;
  }
}

const ID_DOC_TYPES = ['Passport', 'National ID', "Driver's License", 'Residence Permit', 'Other'];

const GuestProfiles = ({ selectedGuestId, selectedGroupId }: { selectedGuestId?: string; selectedGroupId?: string }) => {
  // URL is the source of truth for which view is open.
  // ?guestId=XXX  → guest detail view
  // ?groupId=XXX  → group detail view
  // ?edit=XXX     → edit-guest form (existing guest)
  // ?new=1        → new-guest form
  // (none)        → list view
  const [searchParams, setSearchParams] = useSearchParams();
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 350);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterLoyaltyTier, setFilterLoyaltyTier] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<GuestProfile | null>(null);
  const [mergeMode, setMergeMode] = useState(false);
  const [mergeSource, setMergeSource] = useState<GuestProfile | null>(null);
  const [mergeTarget, setMergeTarget] = useState<GuestProfile | null>(null);
  const [merging, setMerging] = useState(false);
  const { success, error: toastError, info, ToastContainer } = useToast();
  const fetchAbortRef = useRef<AbortController | null>(null);

  const getAuthToken = () => localStorage.getItem('hotel_erp_session') || localStorage.getItem('auth_token');

  // Sync external navigation props (e.g. from Reservations) into the URL so
  // there is a single source of truth.
  useEffect(() => {
    if (selectedGuestId) {
      setSearchParams({ guestId: selectedGuestId }, { replace: true });
    } else if (selectedGroupId) {
      setSearchParams({ groupId: selectedGroupId }, { replace: true });
    }
  }, [selectedGuestId, selectedGroupId, setSearchParams]);

  // Derive view state from the URL
  const currentGuestId = searchParams.get('guestId');
  const currentGroupId = searchParams.get('groupId');
  const editId = searchParams.get('edit');
  const isNew = searchParams.get('new') === '1';
  const viewMode: 'list' | 'guest-detail' | 'group-detail' | 'new-guest' =
    editId ? 'new-guest' :
    isNew ? 'new-guest' :
    currentGuestId ? 'guest-detail' :
    currentGroupId ? 'group-detail' : 'list';

  // Resolve the guest being edited: prefer the in-memory list, otherwise fetch
  // from the API so deep links to ?edit=ID work even when the guest isn't on
  // the current list page.
  const [fetchedEditGuest, setFetchedEditGuest] = useState<GuestProfile | null>(null);
  const [editGuestLoading, setEditGuestLoading] = useState(false);
  const [editGuestError, setEditGuestError] = useState<string | null>(null);
  const editingGuest: GuestProfile | null = useMemo(() => {
    if (!editId) return null;
    return guests.find((g) => g.id === editId) || fetchedEditGuest;
  }, [editId, guests, fetchedEditGuest]);

  useEffect(() => {
    if (!editId) { setFetchedEditGuest(null); setEditGuestError(null); return; }
    // Already resolved from the list — no fetch needed
    if (guests.some((g) => g.id === editId)) { setFetchedEditGuest(null); setEditGuestError(null); return; }
    let cancelled = false;
    setEditGuestLoading(true);
    setEditGuestError(null);
    fetch(`/api/front-office/guests/${editId}`, {
      credentials: 'include',
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((t) => { throw new Error(`HTTP ${res.status}: ${t}`); });
        }
        return res.json();
      })
      .then((data) => { if (!cancelled) setFetchedEditGuest(data.guest as GuestProfile); })
      .catch((err) => {
        if (!cancelled) {
          console.error('Error loading edit guest:', err);
          setEditGuestError(err.message || 'Failed to load guest');
        }
      })
      .finally(() => { if (!cancelled) setEditGuestLoading(false); });
    return () => { cancelled = true; };
  }, [editId, guests]);

  // Navigate to a guest profile (updates the URL → shareable link)
  const handleViewGuest = (guestId: string) => {
    setSearchParams({ guestId });
  };

  // Navigate back to the list (clears the profile from the URL)
  const backToList = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  // Fetch guests from database (debounced search + filters + sort + pagination)
  const fetchGuests = useCallback(async (search: string, status: string, tier: string, sort: string, order: 'asc' | 'desc', off: number) => {
    // Abort previous in-flight request
    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (tier) params.append('loyaltyTier', tier);
      params.append('sortBy', sort);
      params.append('sortOrder', order);
      params.append('limit', String(PAGE_SIZE));
      params.append('offset', String(off));

      const response = await fetch(`/api/front-office/guests?${params.toString()}`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        signal: controller.signal,
      });

      if (!response.ok) throw new Error('Failed to fetch guests');

      const data = await response.json();
      setGuests(data.guests || []);
      setTotal(data.total ?? (data.guests || []).length);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching guests:', err);
        toastError('Failed to load guests. Please try again.');
      }
    } finally {
      // Only clear the loading state if this request is still the latest one.
      // An aborted request must not hide the spinner of its replacement.
      if (fetchAbortRef.current === controller) setLoading(false);
    }
  }, [toastError]);

  // Re-fetch when debounced search / filters / sort / pagination change
  useEffect(() => {
    fetchGuests(debouncedSearch, filterStatus, filterLoyaltyTier, sortBy, sortOrder, offset);
  }, [debouncedSearch, filterStatus, filterLoyaltyTier, sortBy, sortOrder, offset, fetchGuests]);

  // Reset offset when search/filter/sort changes
  useEffect(() => { setOffset(0); }, [debouncedSearch, filterStatus, filterLoyaltyTier, sortBy, sortOrder]);

  const handleRefresh = () => {
    fetchGuests(debouncedSearch, filterStatus, filterLoyaltyTier, sortBy, sortOrder, offset);
    info('Guest list refreshed');
  };

  const handleEditGuest = (guest: GuestProfile) => {
    setSearchParams({ edit: guest.id });
  };

  const handleCreateGuest = () => {
    setSearchParams({ new: '1' });
  };

  const handleSaveGuest = async (guestData: Partial<GuestProfile>, files?: { front?: File | null; back?: File | null }) => {
    try {
      const url = editingGuest
        ? `/api/front-office/guests/${editingGuest.id}`
        : '/api/front-office/guests';
      const method = editingGuest ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(guestData),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to save guest');
      }

      // Determine the guest ID (for new guests, parse it from the response)
      let guestId = editingGuest?.id;
      if (!guestId) {
        const saved = await response.json().catch(() => ({}));
        guestId = saved.id || saved.guest?.id;
      }

      // Upload ID document images if files were provided
      if (guestId && files && (files.front || files.back)) {
        let frontImageUrl: string | null = null;
        let backImageUrl: string | null = null;

        if (files.front) {
          frontImageUrl = await uploadIdDocumentFile(files.front, guestId, 'front');
        }
        if (files.back) {
          backImageUrl = await uploadIdDocumentFile(files.back, guestId, 'back');
        }

        // Persist the image URLs + metadata to the id-document endpoint
        const idDocRes = await fetch(`/api/front-office/guests/${guestId}/id-document`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
          body: JSON.stringify({
            docType: guestData.idDocument?.type || 'Passport',
            docNumber: guestData.idDocument?.number || guestData.passportNumber || '',
            expiryDate: guestData.idDocument?.expiryDate || '',
            issueDate: guestData.idDocument?.issueDate || '',
            issuingCountry: guestData.idDocument?.issuingCountry || '',
            frontImageUrl,
            backImageUrl,
          }),
        });

        if (!idDocRes.ok) {
          console.warn('ID document image upload partially failed — metadata was saved but images may need to be re-uploaded from the detail page.');
        }
      }

      await fetchGuests(debouncedSearch, filterStatus, filterLoyaltyTier, sortBy, sortOrder, offset);
      // After save, navigate to the guest's detail page (URL-driven)
      if (guestId) {
        setSearchParams({ guestId });
      } else {
        setSearchParams({});
      }
      success(editingGuest ? 'Guest updated successfully' : 'Guest created successfully');
    } catch (error: any) {
      console.error('Error saving guest:', error);
      toastError(error.message || 'Failed to save guest. Please try again.');
    }
  };

  const handleDeleteGuest = async (guest: GuestProfile) => {
    try {
      const response = await fetch(`/api/front-office/guests/${guest.id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to delete guest');
      }

      success(`Guest "${guest.firstName} ${guest.lastName}" deleted`);
      setConfirmDelete(null);
      await fetchGuests(debouncedSearch, filterStatus, filterLoyaltyTier, sortBy, sortOrder, offset);
    } catch (error: any) {
      console.error('Error deleting guest:', error);
      toastError(error.message || 'Failed to delete guest');
      setConfirmDelete(null);
    }
  };

  const handleMergeGuests = async () => {
    if (!mergeSource || !mergeTarget) return;
    setMerging(true);
    try {
      const response = await fetch('/api/front-office/guests/merge', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ sourceId: mergeSource.id, targetId: mergeTarget.id }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to merge guests');
      }

      success(`Merged "${mergeSource.firstName} ${mergeSource.lastName}" into "${mergeTarget.firstName} ${mergeTarget.lastName}"`);
      setMergeMode(false);
      setMergeSource(null);
      setMergeTarget(null);
      await fetchGuests(debouncedSearch, filterStatus, filterLoyaltyTier, sortBy, sortOrder, offset);
    } catch (error: any) {
      console.error('Error merging guests:', error);
      toastError(error.message || 'Failed to merge guests');
    } finally {
      setMerging(false);
    }
  };

  const handleExportCSV = () => {
    const rows = guests.map((g) => ({
      ID: g.id,
      FirstName: g.firstName,
      LastName: g.lastName,
      Email: g.email,
      Phone: g.phone,
      Nationality: g.nationality,
      Status: g.status,
      LoyaltyTier: g.history.loyaltyTier,
      LoyaltyPoints: g.history.loyaltyPoints,
      TotalStays: g.history.totalStays,
      TotalRevenue: g.history.totalRevenue,
      TotalNights: g.history.totalNights,
      LastStay: g.history.lastStay,
    }));
    downloadCSV(`guest-profiles-${new Date().toISOString().split('T')[0]}.csv`, rows);
    success(`Exported ${rows.length} guest(s) to CSV`);
  };

  const handleSortChange = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('asc');
    }
  };

  // Summary stats
  const stats = useMemo(() => {
    const totalGuests = total;
    const vipCount = guests.filter((g) => g.status === 'VIP').length;
    const loyaltyMembers = guests.filter((g) => g.history.loyaltyTier !== 'none').length;
    const totalLoyaltyPoints = guests.reduce((sum, g) => sum + (g.history.loyaltyPoints || 0), 0);
    return { totalGuests, vipCount, loyaltyMembers, totalLoyaltyPoints };
  }, [guests, total]);

  const SortIndicator = ({ col }: { col: string }) => (
    <span className="inline-flex flex-col">
      <ChevronUp className={`w-3 h-3 ${sortBy === col && sortOrder === 'asc' ? '{statusTone.accent.text}' : 'text-gray-300'}`} />
      <ChevronDown className={`w-3 h-3 -mt-1 ${sortBy === col && sortOrder === 'desc' ? '{statusTone.accent.text}' : 'text-gray-300'}`} />
    </span>
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Guest?</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{confirmDelete.firstName} {confirmDelete.lastName}</strong>?
              This action cannot be undone. Guests with active reservations cannot be deleted.
            </p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700" onClick={() => setConfirmDelete(null)}>
                Cancel
              </button>
              <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700" onClick={() => handleDeleteGuest(confirmDelete)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {mergeMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => { setMergeMode(false); setMergeSource(null); setMergeTarget(null); }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 ${statusTone.info.soft} rounded-lg`}>
                <GitMerge className="w-6 h-6 {statusTone.accent.text}" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Merge Duplicate Guests</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Select a <strong>source</strong> (will be deleted) and a <strong>target</strong> (will keep the profile).
              All reservations and loyalty points from the source will be transferred to the target.
            </p>
            <div className="space-y-3 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Source (to be deleted)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  value={mergeSource?.id || ''}
                  onChange={(e) => setMergeSource(guests.find((g) => g.id === e.target.value) || null)}
                >
                  <option value="">Select source guest...</option>
                  {guests.filter((g) => g.id !== mergeTarget?.id).map((g) => (
                    <option key={g.id} value={g.id}>{g.firstName} {g.lastName} — {g.email}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Target (to keep)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  value={mergeTarget?.id || ''}
                  onChange={(e) => setMergeTarget(guests.find((g) => g.id === e.target.value) || null)}
                >
                  <option value="">Select target guest...</option>
                  {guests.filter((g) => g.id !== mergeSource?.id).map((g) => (
                    <option key={g.id} value={g.id}>{g.firstName} {g.lastName} — {g.email}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700" onClick={() => { setMergeMode(false); setMergeSource(null); setMergeTarget(null); }}>
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!mergeSource || !mergeTarget || merging}
                onClick={handleMergeGuests}
              >
                {merging ? 'Merging...' : 'Merge Guests'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {viewMode !== 'list' && (
            <button
              onClick={backToList}
              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {viewMode === 'list' ? 'Guest Profiles' : viewMode === 'guest-detail' ? 'Guest Details' : viewMode === 'new-guest' ? (editingGuest ? 'Edit Guest' : 'New Guest') : 'Group Details'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {viewMode === 'list' ? 'Guest information, history, and preferences' : 'View detailed profile information'}
            </p>
          </div>
        </div>
        {viewMode === 'list' && (
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setMergeMode(true)}
              title="Merge duplicate guest profiles"
            >
              <GitMerge className="w-4 h-4" />
              Merge
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              onClick={handleExportCSV}
              disabled={guests.length === 0}
              title="Export current results to CSV"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              onClick={handleCreateGuest}
            >
              <Plus className="w-4 h-4" />
              New Guest
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        )}
      </div>

      {/* Detail View */}
      {viewMode === 'guest-detail' && currentGuestId && <GuestDetail guestId={currentGuestId} fallbackGuest={guests.find(g => g.id === currentGuestId)} onBack={backToList} onEdit={(g) => handleEditGuest(g)} onViewGroup={(groupId) => setSearchParams({ groupId })} />}
      {viewMode === 'group-detail' && currentGroupId && <GroupDetail groupId={currentGroupId} onBack={backToList} />}
      {viewMode === 'new-guest' && (isNew || editingGuest) && !editGuestLoading && <GuestForm guest={editingGuest} onSave={handleSaveGuest} onCancel={backToList} />}
      {viewMode === 'new-guest' && editId && editGuestLoading && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-4">Loading guest for editing...</p>
          </div>
        </div>
      )}
      {viewMode === 'new-guest' && editId && !editGuestLoading && !editingGuest && editGuestError && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load guest</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{editGuestError}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Guest ID: {editId}</p>
            <button onClick={backToList} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Back to Guest List</button>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 card-shadow smooth-transition relative overflow-hidden text-left w-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-accent-operations)]"></div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Total Guests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 tabular-nums">{stats.totalGuests}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">All profiles</p>
                  </div>
                  <div className="shrink-0 p-2.5 rounded-xl bg-[var(--color-accent-operations)]/10 text-[var(--color-accent-operations)]">
                    <Users className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 card-shadow smooth-transition relative overflow-hidden text-left w-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-warning)]"></div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">VIP Guests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 tabular-nums">{stats.vipCount}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">VIP tier</p>
                  </div>
                  <div className="shrink-0 p-2.5 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
                    <Crown className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 card-shadow smooth-transition relative overflow-hidden text-left w-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-info)]"></div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Loyalty Members</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 tabular-nums">{stats.loyaltyMembers}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">Enrolled</p>
                  </div>
                  <div className="shrink-0 p-2.5 rounded-xl bg-[var(--color-info)]/10 text-[var(--color-info)]">
                    <Star className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 card-shadow smooth-transition relative overflow-hidden text-left w-full">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--color-success)]"></div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">Loyalty Points (page)</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2 tabular-nums">{stats.totalLoyaltyPoints.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">Page total</p>
                  </div>
                  <div className="shrink-0 p-2.5 rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)]">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4 relative">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search guests by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Sort dropdown */}
            <div className="relative">
              <select
                className="appearance-none pl-4 pr-9 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white cursor-pointer"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
              >
                <option value="name">Sort: Name</option>
                <option value="email">Sort: Email</option>
                <option value="loyalty_points">Sort: Loyalty Points</option>
                <option value="total_spend">Sort: Total Spend</option>
                <option value="status">Sort: Status</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
              {filterLoyaltyTier && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
            </button>
            {showFilters && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg p-4 z-20">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      <option value="VIP">VIP</option>
                      <option value="Regular">Regular</option>
                      <option value="Loyalty Member">Loyalty Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Loyalty Tier</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      value={filterLoyaltyTier}
                      onChange={(e) => setFilterLoyaltyTier(e.target.value)}
                    >
                      <option value="">All Tiers</option>
                      <option value="silver">Silver (1000+)</option>
                      <option value="gold">Gold (2500+)</option>
                      <option value="platinum">Platinum (5000+)</option>
                      <option value="diamond">Diamond (10000+)</option>
                    </select>
                  </div>
                  {(filterStatus || filterLoyaltyTier) && (
                    <button
                      className="w-full px-3 py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-slate-700 rounded-lg"
                      onClick={() => { setFilterStatus(''); setFilterLoyaltyTier(''); }}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Guest Cards */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-4">Loading guests...</p>
            </div>
          ) : guests.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Guests Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {guests.map((guest) => {
                  const TierIcon = loyaltyTierIcons[guest.history.loyaltyTier] || Star;
                  return (
                    <div key={guest.id} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 ${FO_AVATAR_GRADIENT} rounded-lg flex items-center justify-center text-white font-semibold`}>
                            {getInitials(guest.firstName, guest.lastName)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                              {guest.firstName} {guest.lastName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${loyaltyTierBorderColors[guest.history.loyaltyTier]} ${loyaltyTierTextColors[guest.history.loyaltyTier]}`}>
                                <TierIcon className="w-3 h-3" />
                                {guest.history.loyaltyTier.charAt(0).toUpperCase() + guest.history.loyaltyTier.slice(1)}
                              </span>
                              {guest.status === 'VIP' && (
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${statusTone.accent.border} ${statusTone.accent.text}`}>
                                  VIP
                                </span>
                              )}
                              {guest.history.blacklistStatus && (
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${statusTone.danger.border} ${statusTone.danger.text}`}>
                                  <Shield className="w-3 h-3" />
                                  Blacklisted
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); handleViewGuest(guest.id); }} title="View Details">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); handleEditGuest(guest); }} title="Edit Guest">
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors" onClick={(e) => { e.stopPropagation(); setConfirmDelete(guest); }} title="Delete Guest">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Mail size={14} />
                          <span className="truncate">{guest.email}</span>
                        </div>
                        {guest.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Phone size={14} />
                            <span>{guest.phone}</span>
                          </div>
                        )}
                        {guest.nationality && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin size={14} />
                            <span>{guest.nationality}</span>
                          </div>
                        )}
                      </div>

                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-slate-700">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Stays</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {guest.history.totalStays || '0'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Nights</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {guest.history.totalNights || '0'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Total Spend</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {guest.history.totalSpend ? `$${guest.history.totalSpend.toLocaleString()}` : '$0'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-500">Avg Spend</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {guest.history.averageSpend ? `$${guest.history.averageSpend.toFixed(0)}` : '$0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {offset + 1}–{Math.min(offset + guests.length, total)} of {total} guests
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                    disabled={offset === 0}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <span className="text-sm text-gray-600 dark:text-gray-400 px-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                    onClick={() => setOffset(offset + PAGE_SIZE)}
                    disabled={offset + PAGE_SIZE >= total}
                  >
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

// ── ID Document Section ─────────────────────────────────────────────
// Displays existing ID document info (metadata + images) and lets staff
// upload new front/back images and edit metadata. Files are uploaded to
// the `id-cards` Supabase storage bucket; metadata + URLs are persisted
// via PUT /api/front-office/guests/:id/id-document.
const IdDocumentSection = ({ guestId, idDoc, onUpdated }: {
  guestId: string;
  idDoc: IdDocument | null;
  onUpdated: (doc: IdDocument) => void;
}) => {
  const { success, error: toastError, ToastContainer } = useToast();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(idDoc?.frontImageUrl || null);
  const [backPreview, setBackPreview] = useState<string | null>(idDoc?.backImageUrl || null);
  const [docType, setDocType] = useState(idDoc?.type || 'Passport');
  const [docNumber, setDocNumber] = useState(idDoc?.number || '');
  const [expiryDate, setExpiryDate] = useState(idDoc?.expiryDate || '');
  const [issueDate, setIssueDate] = useState(idDoc?.issueDate || '');
  const [issuingCountry, setIssuingCountry] = useState(idDoc?.issuingCountry || '');

  const getAuthToken = () => localStorage.getItem('hotel_erp_session') || localStorage.getItem('auth_token');

  const resetForm = () => {
    setEditing(false);
    setFrontFile(null);
    setBackFile(null);
    setFrontPreview(idDoc?.frontImageUrl || null);
    setBackPreview(idDoc?.backImageUrl || null);
    setDocType(idDoc?.type || 'Passport');
    setDocNumber(idDoc?.number || '');
    setExpiryDate(idDoc?.expiryDate || '');
    setIssueDate(idDoc?.issueDate || '');
    setIssuingCountry(idDoc?.issuingCountry || '');
  };

  const handleFileChange = (side: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Basic validation: images only, max 10MB
    if (!file.type.startsWith('image/')) {
      toastError('Please select an image file (JPG, PNG, etc.)');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toastError('File too large. Maximum size is 10MB.');
      return;
    }
    if (side === 'front') {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const clearFile = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontFile(null);
      setFrontPreview(idDoc?.frontImageUrl || null);
    } else {
      setBackFile(null);
      setBackPreview(idDoc?.backImageUrl || null);
    }
  };

  const handleSave = async () => {
    if (!docNumber.trim()) {
      toastError('Document number is required');
      return;
    }
    setSaving(true);
    setUploading(true);
    try {
      let frontImageUrl = idDoc?.frontImageUrl || null;
      let backImageUrl = idDoc?.backImageUrl || null;

      // Upload new files if selected
      if (frontFile) {
        const url = await uploadIdDocumentFile(frontFile, guestId, 'front');
        if (url) frontImageUrl = url;
        else throw new Error('Failed to upload front image');
      }
      if (backFile) {
        const url = await uploadIdDocumentFile(backFile, guestId, 'back');
        if (url) backImageUrl = url;
        else throw new Error('Failed to upload back image');
      }

      setUploading(false);

      // Persist metadata + URLs
      const response = await fetch(`/api/front-office/guests/${guestId}/id-document`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({
          docType,
          docNumber,
          expiryDate,
          issueDate,
          issuingCountry,
          frontImageUrl,
          backImageUrl,
        }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to save ID document');
      }

      const data = await response.json();
      const updatedDoc: IdDocument = data.identificationDoc;
      onUpdated(updatedDoc);
      setEditing(false);
      setFrontFile(null);
      setBackFile(null);
      success('ID document saved successfully');
    } catch (error: any) {
      console.error('Error saving ID document:', error);
      toastError(error.message || 'Failed to save ID document');
    } finally {
      setUploading(false);
      setSaving(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  const renderImageSlot = (side: 'front' | 'back', preview: string | null, label: string) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center">
        {preview ? (
          <div className="relative group">
            <img src={preview} alt={label} className="w-full h-32 object-cover rounded" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <a href={preview} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/90 rounded-lg text-gray-700 hover:bg-white">
                <ExternalLink className="w-4 h-4" />
              </a>
              {editing && (
                <button onClick={() => clearFile(side)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : editing ? (
          <div>
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <label className="cursor-pointer">
              <span className="text-sm {statusTone.accent.text} hover:text-blue-700">Choose file</span>
              <input type="file" accept="image/*" onChange={handleFileChange(side)} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</p>
          </div>
        ) : (
          <div className="text-gray-400 text-sm py-6">No image uploaded</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
      <ToastContainer />
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 {statusTone.accent.text}" />
          ID Document
        </h3>
        <div className="flex items-center gap-2">
          {idDoc?.isUploaded && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full {statusTone.success.soft}">
              <CheckCircle2 className="w-3 h-3" />
              Uploaded
            </span>
          )}
          {idDoc?.verifiedAt && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full {statusTone.info.soft}">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Edit className="w-3.5 h-3.5" />
              {idDoc?.isUploaded ? 'Edit' : 'Upload'}
            </button>
          ) : (
            <button onClick={resetForm} className="px-3 py-1.5 text-sm border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </button>
          )}
        </div>
      </div>

      {!editing ? (
        // Read-only view
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Document Type</label><p className="text-gray-900 dark:text-white">{idDoc?.type || 'N/A'}</p></div>
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Document Number</label><p className="text-gray-900 dark:text-white">{idDoc?.number || 'N/A'}</p></div>
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Expiry Date</label><p className="text-gray-900 dark:text-white">{formatDate(idDoc?.expiryDate)}</p></div>
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Issue Date</label><p className="text-gray-900 dark:text-white">{formatDate(idDoc?.issueDate)}</p></div>
            <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Issuing Country</label><p className="text-gray-900 dark:text-white">{idDoc?.issuingCountry || 'N/A'}</p></div>
            {idDoc?.uploadedAt && <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Uploaded At</label><p className="text-gray-900 dark:text-white">{formatDate(idDoc.uploadedAt)}</p></div>}
          </div>
          {(idDoc?.frontImageUrl || idDoc?.backImageUrl) && (
            <div className="grid grid-cols-2 gap-4">
              {idDoc?.frontImageUrl && renderImageSlot('front', idDoc.frontImageUrl, 'Front of Document')}
              {idDoc?.backImageUrl && renderImageSlot('back', idDoc.backImageUrl, 'Back of Document')}
            </div>
          )}
          {!idDoc?.isUploaded && (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">No ID document has been uploaded yet. Click "Upload" to add one.</p>
          )}
        </div>
      ) : (
        // Edit / upload form
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Document Type</label>
              <select className={inputClass} value={docType} onChange={(e) => setDocType(e.target.value)}>
                {ID_DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Document Number *</label>
              <input type="text" className={inputClass} value={docNumber} onChange={(e) => setDocNumber(e.target.value)} placeholder="Enter document number" />
            </div>
            <div>
              <label className={labelClass}>Expiry Date</label>
              <input type="date" className={inputClass} value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Issue Date</label>
              <input type="date" className={inputClass} value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Issuing Country</label>
              <input type="text" className={inputClass} value={issuingCountry} onChange={(e) => setIssuingCountry(e.target.value)} placeholder="e.g., US, UK, ET" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderImageSlot('front', frontPreview, 'Front of Document')}
            {renderImageSlot('back', backPreview, 'Back of Document')}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={resetForm} className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !docNumber.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Uploading...</> : saving ? 'Saving...' : <><Upload className="w-4 h-4" /> Save Document</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Guest Detail Component — Tabbed view (Profile / History / Notes / Activity)
const GuestDetail = ({ guestId, fallbackGuest, onBack, onEdit, onViewGroup }: { guestId: string; fallbackGuest?: GuestProfile | null; onBack: () => void; onEdit: (guest: GuestProfile) => void; onViewGroup?: (groupId: string) => void }) => {
  const [guest, setGuest] = useState<any>(null);
  const [reservations, setReservations] = useState<any[]>([]);
  const [groupProfile, setGroupProfile] = useState<any>(null);
  const [groupMemberships, setGroupMemberships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'notes' | 'activity'>('profile');

  // Group membership management
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  const [groupSearchResults, setGroupSearchResults] = useState<any[]>([]);
  const [searchingGroups, setSearchingGroups] = useState(false);
  const [linkingGroupId, setLinkingGroupId] = useState<string | null>(null);
  const [membershipActionLoading, setMembershipActionLoading] = useState(false);

  const getAuthToken = () => localStorage.getItem('hotel_erp_session') || localStorage.getItem('auth_token');

  const detailAbortRef = useRef<AbortController | null>(null);

  const fetchGuestDetail = useCallback(async () => {
    // Abort any previous in-flight detail request (e.g. rapid guest switching)
    if (detailAbortRef.current) detailAbortRef.current.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;

    setLoading(true);
    setFetchError(null);
    try {
      const response = await fetch(`/api/front-office/guests/${guestId}`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Failed to fetch guest detail (HTTP ${response.status})`);
      }

      const data = await response.json();
      setGuest(data.guest);
      setReservations(data.reservations || []);
      setGroupProfile(data.groupProfile || null);
      setGroupMemberships(data.groupMemberships || []);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      console.error('Error fetching guest detail:', error);
      setFetchError(error.message || 'Failed to load guest details');
    } finally {
      // Only clear the loading state if this request is still the latest one
      if (detailAbortRef.current === controller) setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    // Reset stale data when switching guests so the previous guest's
    // profile is never shown under the new guest's URL.
    setGuest(null);
    setReservations([]);
    setGroupProfile(null);
    setGroupMemberships([]);
    fetchGuestDetail();
    return () => { if (detailAbortRef.current) detailAbortRef.current.abort(); };
  }, [fetchGuestDetail]);

  // ── Group membership management ────────────────────────────────
  const refreshMemberships = useCallback(async () => {
    try {
      const response = await fetch(`/api/group-profiles/guest/${guestId}/groups`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });
      if (response.ok) {
        const data = await response.json();
        setGroupMemberships(data.groups || []);
      }
    } catch (e) {
      // ignore — memberships will refresh on next full detail fetch
    }
  }, [guestId]);

  const searchGroups = useCallback(async (query: string) => {
    if (!query.trim()) { setGroupSearchResults([]); return; }
    setSearchingGroups(true);
    try {
      const response = await fetch(`/api/group-profiles`, {
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` },
      });
      if (!response.ok) { setGroupSearchResults([]); return; }
      const data = await response.json();
      const all: any[] = data.groupProfiles || [];
      const q = query.toLowerCase();
      const filtered = all.filter((g: any) =>
        g.name?.toLowerCase().includes(q) ||
        g.code?.toLowerCase().includes(q) ||
        g.type?.toLowerCase().includes(q) ||
        g.organization_name?.toLowerCase().includes(q)
      );
      // Exclude groups the guest is already an active member of
      const activeGroupIds = new Set(groupMemberships.map((m: any) => m.group_id));
      setGroupSearchResults(filtered.filter((g: any) => !activeGroupIds.has(g.id)));
    } catch (e) {
      setGroupSearchResults([]);
    } finally {
      setSearchingGroups(false);
    }
  }, [groupMemberships]);

  useEffect(() => {
    const timer = setTimeout(() => searchGroups(groupSearchQuery), 300);
    return () => clearTimeout(timer);
  }, [groupSearchQuery, searchGroups]);

  const handleAddToGroup = async (groupId: string, groupType?: string) => {
    setLinkingGroupId(groupId);
    try {
      const response = await fetch(`/api/group-profiles/${groupId}/link-guest`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ guestId, relationshipType: groupType || 'GroupReservation', isPrimaryContact: false }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to link guest to group');
      }
      await refreshMemberships();
      setGroupSearchQuery('');
      setGroupSearchResults([]);
      setShowAddGroupModal(false);
    } catch (e: any) {
      alert(e.message || 'Failed to add guest to group');
    } finally {
      setLinkingGroupId(null);
    }
  };

  const handleRemoveFromGroup = async (groupId: string, groupName: string) => {
    if (!confirm(`Remove this guest from "${groupName}"?`)) return;
    setMembershipActionLoading(true);
    try {
      const response = await fetch(`/api/group-profiles/${groupId}/unlink-guest`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify({ guestId }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || 'Failed to remove guest from group');
      }
      await refreshMemberships();
    } catch (e: any) {
      alert(e.message || 'Failed to remove guest from group');
    } finally {
      setMembershipActionLoading(false);
    }
  };

  // Only block on the spinner when we have no data at all. If the guest is
  // already known from the list (fallbackGuest), render immediately and let
  // the detail fetch fill in reservations/memberships in the background.
  if (loading && !guest && !fallbackGuest) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading guest details...</p>
        </div>
      </div>
    );
  }

  // If the detail fetch failed but we have fallback data from the list, use it
  const effectiveGuest = guest || (fallbackGuest as any);

  if (!effectiveGuest) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
        </div>
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Guest Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Guest ID: {guestId}</p>
          {fetchError && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-2">{fetchError}</p>
          )}
          <button
            onClick={fetchGuestDetail}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // The backend now returns a transformed guest shape (firstName, lastName, etc.)
  // but also includes a rawGuest fallback for backward compatibility.
  const g: GuestProfile = effectiveGuest?.firstName
    ? effectiveGuest
    : {
        id: effectiveGuest?.id || guestId,
        firstName: (effectiveGuest?.name?.split(' ')[0]) || '',
        lastName: (effectiveGuest?.name?.split(' ').slice(1).join(' ')) || '',
        email: effectiveGuest?.email || '',
        phone: effectiveGuest?.phone || '',
        nationality: effectiveGuest?.nationality || '',
        passportNumber: effectiveGuest?.identification_doc?.number || '',
        visaInfo: effectiveGuest?.identification_doc?.visaInfo || '',
        idDocument: effectiveGuest?.identification_doc || effectiveGuest?.idDocument || null,
        emergencyContact: effectiveGuest?.preferences?.emergencyContact || null,
        company: effectiveGuest?.preferences?.company || null,
        preferences: {
          language: effectiveGuest?.preferences?.language || 'English',
          roomType: effectiveGuest?.preferences?.roomType || 'Standard',
          pillowType: effectiveGuest?.preferences?.pillowType || 'Medium',
          bedType: effectiveGuest?.preferences?.bedType || 'Queen',
          dietary: effectiveGuest?.preferences?.dietary || 'None',
          newspaper: effectiveGuest?.preferences?.newspaper || 'None',
          amenities: effectiveGuest?.preferences?.amenities || [],
        },
        history: {
          totalStays: reservations.length,
          totalRevenue: effectiveGuest?.total_spend || 0,
          totalNights: 0,
          lastStay: reservations[0]?.check_in_date || null,
          stayFrequency: reservations.length >= 10 ? 'Regular' : reservations.length >= 5 ? 'Frequent' : 'Occasional',
          loyaltyTier: (effectiveGuest?.history?.loyaltyTier as LoyaltyTier) || (effectiveGuest?.loyalty_points >= 10000 ? 'diamond' : effectiveGuest?.loyalty_points >= 5000 ? 'platinum' : effectiveGuest?.loyalty_points >= 2500 ? 'gold' : effectiveGuest?.loyalty_points >= 1000 ? 'silver' : 'none'),
          loyaltyPoints: effectiveGuest?.history?.loyaltyPoints ?? effectiveGuest?.loyalty_points ?? 0,
          complaints: 0,
          compliments: 0,
          blacklistStatus: effectiveGuest?.status === 'blacklisted',
        },
        status: effectiveGuest?.status || 'Regular',
        specialRequests: effectiveGuest?.special_requests,
        notes: effectiveGuest?.notes,
      };

  const TierIcon = loyaltyTierIcons[g.history.loyaltyTier] || Star;
  const tabs: { id: typeof activeTab; label: string; icon: typeof User }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'history', label: 'History', icon: History },
    { id: 'notes', label: 'Notes', icon: StickyNote },
    { id: 'activity', label: 'Activity', icon: Activity },
  ];

  const reservationStatusColors: Record<string, string> = {
    Confirmed: statusTone.success.soft,
    CheckedIn: statusTone.info.soft,
    CheckedOut: statusTone.neutral.soft,
    Cancelled: statusTone.danger.soft,
    Waitlisted: statusTone.warning.soft,
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      {/* Partial-data banner when detail fetch failed but fallback list data is shown */}
      {fetchError && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Showing limited profile from guest list. Full details could not be loaded: {fetchError}</span>
          </div>
          <button
            onClick={fetchGuestDetail}
            className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-xs font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Header with avatar, name, badges, actions */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft className="w-5 h-5" />
            Back to List
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${g.status === 'VIP' ? statusTone.accent.soft : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'}`}>
            {g.status}
          </span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center gap-1 ${loyaltyTierColors[g.history.loyaltyTier]}`}>
            <TierIcon className="w-3.5 h-3.5" />
            {g.history.loyaltyTier.charAt(0).toUpperCase() + g.history.loyaltyTier.slice(1)}
          </span>
          <button
            onClick={() => onEdit(g)}
            className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>
      </div>

      {/* Guest banner */}
      <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-slate-700">
        <div className="w-20 h-20 ${FO_AVATAR_GRADIENT} rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {getInitials(g.firstName, g.lastName)}
        </div>
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{g.firstName} {g.lastName}</h2>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {g.email}</span>
            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {g.phone || 'N/A'}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {g.nationality || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200 dark:border-slate-700">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 {statusTone.accent.text} dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Tab-specific content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <>
              {/* Personal Information */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">First Name</label><p className="text-gray-900 dark:text-white">{g.firstName || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Last Name</label><p className="text-gray-900 dark:text-white">{g.lastName || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label><p className="text-gray-900 dark:text-white">{g.email || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label><p className="text-gray-900 dark:text-white">{g.phone || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Nationality</label><p className="text-gray-900 dark:text-white">{g.nationality || 'N/A'}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Passport Number</label><p className="text-gray-900 dark:text-white">{g.passportNumber || 'N/A'}</p></div>
                  {g.visaInfo && <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Visa Info</label><p className="text-gray-900 dark:text-white">{g.visaInfo}</p></div>}
                </div>
              </div>

              {/* Preferences */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Language</label><p className="text-gray-900 dark:text-white">{g.preferences.language}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Room Type</label><p className="text-gray-900 dark:text-white">{g.preferences.roomType}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Bed Type</label><p className="text-gray-900 dark:text-white">{g.preferences.bedType}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Pillow Type</label><p className="text-gray-900 dark:text-white">{g.preferences.pillowType}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Dietary</label><p className="text-gray-900 dark:text-white">{g.preferences.dietary}</p></div>
                  <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Newspaper</label><p className="text-gray-900 dark:text-white">{g.preferences.newspaper}</p></div>
                </div>
                {g.preferences.amenities && g.preferences.amenities.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Amenities</label>
                    <div className="flex flex-wrap gap-2">
                      {g.preferences.amenities.map((amenity, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                          {amenity.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Emergency Contact */}
              {g.emergencyContact && g.emergencyContact.name && (
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
                  <div className="space-y-2">
                    <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label><p className="text-gray-900 dark:text-white">{g.emergencyContact.name}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label><p className="text-gray-900 dark:text-white">{g.emergencyContact.phone}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Relationship</label><p className="text-gray-900 dark:text-white">{g.emergencyContact.relationship || 'N/A'}</p></div>
                  </div>
                </div>
              )}

              {/* Company Info */}
              {g.company && g.company.name && (
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
                  <div className="space-y-2">
                    <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Company</label><p className="text-gray-900 dark:text-white">{g.company.name}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Position</label><p className="text-gray-900 dark:text-white">{g.company.position}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Address</label><p className="text-gray-900 dark:text-white">{g.company.address}</p></div>
                  </div>
                </div>
              )}

              {/* Group memberships (many-to-many via guest_group_relationships) */}
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 {statusTone.accent.text}" />
                    Group Memberships
                    {groupMemberships.length > 0 && (
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{groupMemberships.length}</span>
                    )}
                  </h3>
                  <button
                    onClick={() => { setGroupSearchQuery(''); setGroupSearchResults([]); setShowAddGroupModal(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Group
                  </button>
                </div>

                {groupMemberships.length > 0 ? (
                  <div className="space-y-2">
                    {groupMemberships.map((m: any) => (
                      <div key={m.group_id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-700">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{m.group_name}</p>
                            {m.is_primary_contact && (
                              <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                <Star className="w-3 h-3" /> Primary
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">{m.group_type || m.relationship_type || 'Group'}</span>
                            {m.total_stays > 0 && <span>{m.total_stays} stay{m.total_stays === 1 ? '' : 's'}</span>}
                            {Number(m.total_revenue) > 0 && <span>• {formatCurrency(Number(m.total_revenue))}</span>}
                            {m.start_date && <span>• since {formatDate(m.start_date)}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {onViewGroup && (
                            <button
                              onClick={() => onViewGroup(m.group_id)}
                              title="View group profile"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveFromGroup(m.group_id, m.group_name)}
                            disabled={membershipActionLoading}
                            title="Remove from group"
                            className="inline-flex items-center gap-1 px-2 py-1 text-xs {statusTone.danger.soft} rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                          >
                            <X className="w-3 h-3" />
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">This guest is not currently linked to any group.</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Use “Add to Group” to link them to a corporate account, tour operator, or group reservation.</p>
                  </div>
                )}
              </div>

              {/* ID Document upload */}
              <IdDocumentSection
                guestId={g.id}
                idDoc={g.idDocument || null}
                onUpdated={(updatedDoc) => {
                  setGuest((prev: any) => prev ? { ...prev, idDocument: updatedDoc, identification_doc: updatedDoc } : prev);
                }}
              />
            </>
          )}

          {activeTab === 'history' && (
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Reservation History</h3>
              {reservations.length > 0 ? (
                <div className="space-y-3">
                  {reservations.map((res: any) => (
                    <div key={res.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{res.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(res.check_in_date)} — {formatDate(res.check_out_date)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {res.adults || 1} adults, {res.children || 0} children
                          {res.room_number ? ` • Room ${res.room_number}` : ''}
                          {res.room_type ? ` • ${res.room_type}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(res.total_amount)}</p>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${reservationStatusColors[res.status] || 'bg-gray-100 text-gray-700'}`}>
                          {res.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No reservation history</p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes</h3>
                <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{g.notes || 'No notes'}</p>
              </div>
              {g.specialRequests && (
                <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Special Requests</h3>
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{g.specialRequests}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              {reservations.length > 0 ? (
                <div className="space-y-3">
                  {reservations.slice(0, 10).map((res: any) => (
                    <div key={res.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg shrink-0">
                        <Calendar className="w-4 h-4 {statusTone.accent.text}" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Reservation {res.id}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(res.check_in_date)} — {res.status}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full shrink-0 ${reservationStatusColors[res.status] || 'bg-gray-100 text-gray-700'}`}>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">No recent activity</p>
              )}
            </div>
          )}
        </div>

        {/* Right Column - Loyalty Stats Sidebar (always visible) */}
        <div className="space-y-6">
          <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Loyalty Stats</h3>
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{g.history.loyaltyPoints.toLocaleString()}</div>
                <div className="text-sm text-yellow-600 dark:text-yellow-500">Loyalty Points</div>
              </div>
              <div className="text-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(g.history.totalRevenue)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Total Spend</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{g.history.totalStays}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Stays</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{g.history.totalNights}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Nights</div>
                </div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{g.history.stayFrequency}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Stay Frequency</div>
              </div>
              <div className="text-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(g.history.lastStay)}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Last Stay</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Group Modal */}
      {showAddGroupModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => { setShowAddGroupModal(false); setGroupSearchQuery(''); setGroupSearchResults([]); }}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 {statusTone.accent.text}" />
                Add Guest to Group
              </h2>
              <button onClick={() => { setShowAddGroupModal(false); setGroupSearchQuery(''); setGroupSearchResults([]); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Search Groups</label>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search by name, code, type, or organization..."
                  value={groupSearchQuery}
                  onChange={(e) => setGroupSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/50 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {searchingGroups && (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              )}

              {!searchingGroups && groupSearchResults.length > 0 && (
                <div className="space-y-2">
                  {groupSearchResults.map((grp: any) => (
                    <div key={grp.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-100 dark:border-slate-700">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{grp.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{grp.code} • {grp.type}{grp.organization_name ? ` • ${grp.organization_name}` : ''}</p>
                      </div>
                      <button
                        onClick={() => handleAddToGroup(grp.id, grp.type)}
                        disabled={linkingGroupId === grp.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 shrink-0 ml-2"
                      >
                        {linkingGroupId === grp.id ? (
                          <><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white" /> Linking...</>
                        ) : (
                          <><Plus className="w-3.5 h-3.5" /> Link</>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {!searchingGroups && groupSearchQuery && groupSearchResults.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm">No groups found matching "{groupSearchQuery}"</p>
                </div>
              )}

              {!searchingGroups && !groupSearchQuery && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Search className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm">Start typing to search for a group to link this guest to.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Group Detail Component
const GroupDetail = ({ groupId, onBack }: { groupId: string; onBack: () => void }) => {
  const [group, setGroup] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('hotel_erp_session') || localStorage.getItem('auth_token');
  };

  useEffect(() => {
    let cancelled = false;
    const fetchGroupDetail = async () => {
      setLoading(true);
      setGroup(null);
      setMembers([]);
      setReservations([]);
      try {
        const response = await fetch(`/api/front-office/groups/${groupId}`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch group detail');
        
        const data = await response.json();
        if (cancelled) return;
        setGroup(data.group);
        setMembers(data.members || []);
        setReservations(data.reservations || []);
      } catch (error) {
        console.error('Error fetching group detail:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    
    fetchGroupDetail();
    return () => { cancelled = true; };
  }, [groupId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Loading group details...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Group Not Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Group ID: {groupId}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to List
        </button>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            group.type === 'corporate' ? statusTone.info.soft :
            group.type === 'tour_operator' ? statusTone.success.soft :
            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
          }`}>
            {group.type || 'Group'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group Information */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Information</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Group Name</label>
              <p className="text-gray-900 dark:text-white">{group.name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Type</label>
              <p className="text-gray-900 dark:text-white">{group.type || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Contact Person</label>
              <p className="text-gray-900 dark:text-white">{group.contact_person || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <p className="text-gray-900 dark:text-white">{group.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              <p className="text-gray-900 dark:text-white">{group.phone || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Group Statistics */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{members.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Members</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{reservations.length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Reservations</div>
            </div>
          </div>
        </div>

        {/* Group Members */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Members</h3>
          {members.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member: any) => {
                const nameParts = member.name?.split(' ') || ['', ''];
                return (
                  <div key={member.id} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                    <div className="w-12 h-12 ${FO_AVATAR_GRADIENT} rounded-full flex items-center justify-center text-white font-bold">
                      {nameParts[0]?.[0]}{nameParts[1]?.[0]}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No members in this group</p>
          )}
        </div>

        {/* Group Reservations */}
        <div className="lg:col-span-2 border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Group Reservations</h3>
          {reservations.length > 0 ? (
            <div className="space-y-3">
              {reservations.map((res: any) => (
                <div key={res.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{res.id}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {res.check_in_date} - {res.check_out_date} • {res.adults || 1} adults, {res.children || 0} children
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">${res.total_amount?.toFixed(2) || '0.00'}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      res.status === 'Confirmed' ? statusTone.success.soft :
                      res.status === 'CheckedIn' ? statusTone.info.soft :
                      res.status === 'CheckedOut' ? 'bg-gray-100 text-gray-700' :
                      statusTone.warning.soft
                    }`}>
                      {res.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No reservations for this group</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Guest Form Component (Create/Edit) — Complete with all fields
const GuestForm = ({ guest, onSave, onCancel }: { guest: GuestProfile | null; onSave: (data: Partial<GuestProfile>, files?: { front?: File | null; back?: File | null }) => void; onCancel: () => void }) => {
  const [formData, setFormData] = useState<Partial<GuestProfile> & { status?: string; loyaltyPoints?: number; notes?: string; specialRequests?: string }>(guest || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nationality: '',
    passportNumber: '',
    visaInfo: '',
    idDocument: { type: '', number: '', expiryDate: '', issueDate: '', issuingCountry: '' },
    status: 'Regular',
    loyaltyPoints: 0,
    notes: '',
    specialRequests: '',
    emergencyContact: { name: '', phone: '', relationship: '' },
    company: { name: '', position: '', address: '' },
    preferences: {
      language: 'English',
      roomType: 'Standard',
      pillowType: 'Medium',
      bedType: 'Queen',
      dietary: 'None',
      newspaper: 'None',
      amenities: []
    }
  });
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(guest?.idDocument?.frontImageUrl || null);
  const [backPreview, setBackPreview] = useState<string | null>(guest?.idDocument?.backImageUrl || null);
  const [roomTypes, setRoomTypes] = useState<{ id: string; name: string }[]>([]);

  // Fetch room types from the database (room_types table)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('room_types')
          .select('id, name')
          .eq('is_active', true)
          .order('display_order', { ascending: true })
          .order('name', { ascending: true });
        if (!cancelled && !error && data) {
          setRoomTypes(data as { id: string; name: string }[]);
        }
      } catch (e) {
        console.error('Error fetching room types:', e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Generic field updater — avoids repetitive preference object rebuilding
  const updateField = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updatePreference = (key: keyof GuestPreferences, value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...prev.preferences!, [key]: value } as GuestPreferences,
    }));
  };

  const updateEmergencyContact = (key: keyof EmergencyContact, value: string) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact!, [key]: value } as EmergencyContact,
    }));
  };

  const updateCompany = (key: keyof CompanyInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company!, [key]: value } as CompanyInfo,
    }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => {
      const current = prev.preferences?.amenities || [];
      const amenities = current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity];
      return { ...prev, preferences: { ...prev.preferences!, amenities } as GuestPreferences };
    });
  };

  const handleFileChange = (side: 'front' | 'back') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return; // basic validation
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit
    if (side === 'front') {
      setFrontFile(file);
      setFrontPreview(URL.createObjectURL(file));
    } else {
      setBackFile(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const clearFile = (side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontFile(null);
      setFrontPreview(guest?.idDocument?.frontImageUrl || null);
    } else {
      setBackFile(null);
      setBackPreview(guest?.idDocument?.backImageUrl || null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, { front: frontFile, back: backFile });
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1';

  const renderFileSlot = (side: 'front' | 'back', preview: string | null, label: string) => (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg p-4 text-center">
        {preview ? (
          <div className="relative group">
            <img src={preview} alt={label} className="w-full h-32 object-cover rounded" />
            <button
              type="button"
              onClick={() => clearFile(side)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
            <label className="cursor-pointer">
              <span className="text-sm {statusTone.accent.text} hover:text-blue-700">Choose file</span>
              <input type="file" accept="image/*" onChange={handleFileChange(side)} className="hidden" />
            </label>
            <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 10MB</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {guest ? 'Edit Guest' : 'New Guest'}
        </h2>
        <button onClick={onCancel} className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          <ArrowLeft className="w-5 h-5" />
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>First Name *</label>
              <input type="text" required className={inputClass} value={formData.firstName || ''} onChange={(e) => updateField('firstName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Last Name *</label>
              <input type="text" required className={inputClass} value={formData.lastName || ''} onChange={(e) => updateField('lastName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" required className={inputClass} value={formData.email || ''} onChange={(e) => updateField('email', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" className={inputClass} value={formData.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Nationality</label>
              <input type="text" className={inputClass} value={formData.nationality || ''} onChange={(e) => updateField('nationality', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Passport Number</label>
              <input type="text" className={inputClass} value={formData.passportNumber || ''} onChange={(e) => updateField('passportNumber', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Visa Info</label>
              <input type="text" className={inputClass} value={formData.visaInfo || ''} onChange={(e) => updateField('visaInfo', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={formData.status || 'Regular'} onChange={(e) => updateField('status', e.target.value)}>
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Loyalty Member">Loyalty Member</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Loyalty Points</label>
              <input type="number" min="0" className={inputClass} value={formData.loyaltyPoints ?? 0} onChange={(e) => updateField('loyaltyPoints', parseInt(e.target.value) || 0)} />
            </div>
          </div>
        </div>

        {/* ID Document Metadata + Upload */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 {statusTone.accent.text}" />
            ID Document
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Enter document details and upload scanned images of the ID (front and back).
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className={labelClass}>Document Type</label>
              <select
                className={inputClass}
                value={formData.idDocument?.type || (formData.passportNumber ? 'Passport' : '')}
                onChange={(e) => updateField('idDocument', { ...formData.idDocument, type: e.target.value } as IdDocument)}
              >
                <option value="">Select type...</option>
                {ID_DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Document Number</label>
              <input
                type="text"
                className={inputClass}
                value={formData.idDocument?.number || formData.passportNumber || ''}
                onChange={(e) => {
                  updateField('passportNumber', e.target.value);
                  updateField('idDocument', { ...formData.idDocument, number: e.target.value } as IdDocument);
                }}
                placeholder="Enter document number"
              />
            </div>
            <div>
              <label className={labelClass}>Expiry Date</label>
              <input
                type="date"
                className={inputClass}
                value={formData.idDocument?.expiryDate || ''}
                onChange={(e) => updateField('idDocument', { ...formData.idDocument, expiryDate: e.target.value } as IdDocument)}
              />
            </div>
            <div>
              <label className={labelClass}>Issue Date</label>
              <input
                type="date"
                className={inputClass}
                value={formData.idDocument?.issueDate || ''}
                onChange={(e) => updateField('idDocument', { ...formData.idDocument, issueDate: e.target.value } as IdDocument)}
              />
            </div>
            <div>
              <label className={labelClass}>Issuing Country</label>
              <input
                type="text"
                className={inputClass}
                value={formData.idDocument?.issuingCountry || ''}
                onChange={(e) => updateField('idDocument', { ...formData.idDocument, issuingCountry: e.target.value } as IdDocument)}
                placeholder="e.g., US, UK, ET"
              />
            </div>
            <div>
              <label className={labelClass}>Visa Info</label>
              <input type="text" className={inputClass} value={formData.visaInfo || ''} onChange={(e) => updateField('visaInfo', e.target.value)} placeholder="Visa type / number (optional)" />
            </div>
          </div>
          {/* File upload slots */}
          <div className="grid grid-cols-2 gap-4">
            {renderFileSlot('front', frontPreview, 'Front of Document')}
            {renderFileSlot('back', backPreview, 'Back of Document')}
          </div>
        </div>

        {/* Preferences */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preferences</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Language</label>
              <select className={inputClass} value={formData.preferences?.language || 'English'} onChange={(e) => updatePreference('language', e.target.value)}>
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
              <label className={labelClass}>Room Type</label>
              <select className={inputClass} value={formData.preferences?.roomType || ''} onChange={(e) => updatePreference('roomType', e.target.value)}>
                <option value="">Select room type...</option>
                {roomTypes.length > 0 ? (
                  roomTypes.map((rt) => <option key={rt.id} value={rt.name}>{rt.name}</option>)
                ) : (
                  // Fallback if DB isn't configured or table is empty
                  <option value="Standard">Standard</option>
                )}
              </select>
            </div>
            <div>
              <label className={labelClass}>Bed Type</label>
              <select className={inputClass} value={formData.preferences?.bedType || 'Queen'} onChange={(e) => updatePreference('bedType', e.target.value)}>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Queen">Queen</option>
                <option value="King">King</option>
                <option value="Twin">Twin</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Pillow Type</label>
              <select className={inputClass} value={formData.preferences?.pillowType || 'Medium'} onChange={(e) => updatePreference('pillowType', e.target.value)}>
                <option value="Soft">Soft</option>
                <option value="Medium">Medium</option>
                <option value="Firm">Firm</option>
                <option value="Hypoallergenic">Hypoallergenic</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Dietary</label>
              <select className={inputClass} value={formData.preferences?.dietary || 'None'} onChange={(e) => updatePreference('dietary', e.target.value)}>
                <option value="None">None</option>
                <option value="Vegetarian">Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
                <option value="Gluten-Free">Gluten-Free</option>
                <option value="Lactose-Free">Lactose-Free</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Newspaper</label>
              <select className={inputClass} value={formData.preferences?.newspaper || 'None'} onChange={(e) => updatePreference('newspaper', e.target.value)}>
                <option value="None">None</option>
                <option value="Local">Local</option>
                <option value="International">International</option>
                <option value="Financial Times">Financial Times</option>
                <option value="NY Times">NY Times</option>
              </select>
            </div>
          </div>
          {/* Amenities checkboxes */}
          <div className="mt-4">
            <label className={labelClass}>Amenities</label>
            <div className="flex flex-wrap gap-2">
              {ALL_AMENITIES.map((amenity) => {
                const selected = formData.preferences?.amenities?.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                      selected
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    {amenity}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Name</label>
              <input type="text" className={inputClass} value={formData.emergencyContact?.name || ''} onChange={(e) => updateEmergencyContact('name', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Phone</label>
              <input type="tel" className={inputClass} value={formData.emergencyContact?.phone || ''} onChange={(e) => updateEmergencyContact('phone', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Relationship</label>
              <input type="text" className={inputClass} value={formData.emergencyContact?.relationship || ''} onChange={(e) => updateEmergencyContact('relationship', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Company Name</label>
              <input type="text" className={inputClass} value={formData.company?.name || ''} onChange={(e) => updateCompany('name', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Position</label>
              <input type="text" className={inputClass} value={formData.company?.position || ''} onChange={(e) => updateCompany('position', e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Address</label>
              <input type="text" className={inputClass} value={formData.company?.address || ''} onChange={(e) => updateCompany('address', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Notes & Special Requests */}
        <div className="border border-gray-200 dark:border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes & Special Requests</h3>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Notes</label>
              <textarea rows={3} className={inputClass} value={formData.notes || ''} onChange={(e) => updateField('notes', e.target.value)} placeholder="Internal notes about the guest..." />
            </div>
            <div>
              <label className={labelClass}>Special Requests</label>
              <textarea rows={2} className={inputClass} value={formData.specialRequests || ''} onChange={(e) => updateField('specialRequests', e.target.value)} placeholder="Guest's special requests..." />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="px-6 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            {guest ? 'Update Guest' : 'Create Guest'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GuestProfiles;
