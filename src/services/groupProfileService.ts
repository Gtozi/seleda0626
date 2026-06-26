import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { GroupProfile, GroupProfileType, GroupProfileStatus } from '../types/erp';

// ============================================================================
// GROUP PROFILE SERVICE
// ============================================================================
// Comprehensive service for managing group profiles including CRUD operations,
// validation, and Supabase integration.
// ============================================================================

const isTableMissingError = (error: any): boolean => {
  if (!error) return false;
  const msg = (error.message || '').toLowerCase();
  return (
    msg.includes('could not find') ||
    msg.includes('does not exist') ||
    msg.includes('schema cache') ||
    msg.includes('not found') ||
    msg.includes('permission denied') ||
    msg.includes('insufficient_privilege') ||
    error.code === 'PGRST116' ||
    error.code === '42P01' ||
    error.code === '42501'
  );
};

const logMissingTableWarning = (tableName: string, error?: any) => {
  const msg = (error?.message || '').toLowerCase();
  const isPermission = msg.includes('permission denied') || error?.code === '42501';
  if (isPermission) {
    console.warn(
      `🔒 [GroupProfileService] Access or permission denied on 'public.${tableName}'. ` +
      `Row-Level Security (RLS) is enabled, or the API key constraints prevent accessing this table. ` +
      `Please ensure appropriate policies are deployed in your Supabase Dashboard.`
    );
  } else {
    console.warn(
      `💡 [GroupProfileService] The table 'public.${tableName}' is not found in your Supabase project schema yet. ` +
      `To provision this table, execute the migration script: /supabase/migrations/001_group_linking_system.sql`
    );
  }
};

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

const mapGroupProfileFromDb = (db: any): GroupProfile => ({
  id: db.id,
  code: db.code,
  name: db.name,
  type: db.type,
  status: db.status,
  contactName: db.contact_name || undefined,
  contactEmail: db.contact_email || undefined,
  contactPhone: db.contact_phone || undefined,
  contactTitle: db.contact_title || undefined,
  organizationName: db.organization_name || undefined,
  organizationAddress: db.organization_address || undefined,
  organizationCity: db.organization_city || undefined,
  organizationCountry: db.organization_country || undefined,
  organizationTaxId: db.organization_tax_id || undefined,
  organizationVatNo: db.organization_vat_no || undefined,
  billingAddress: db.billing_address || undefined,
  billingCity: db.billing_city || undefined,
  billingCountry: db.billing_country || undefined,
  billingTaxId: db.billing_tax_id || undefined,
  billingVatNo: db.billing_vat_no || undefined,
  paymentTerms: db.payment_terms || undefined,
  creditLimit: Number(db.credit_limit || 0),
  currentBalance: Number(db.current_balance || 0),
  contractStartDate: db.contract_start_date || undefined,
  contractEndDate: db.contract_end_date || undefined,
  cutOffDate: db.cut_off_date || undefined,
  negotiatedRateCode: db.negotiated_rate_code || undefined,
  discountPercent: Number(db.discount_percent || 0),
  masterPaymentMethod: db.master_payment_method || undefined,
  roomTypeBreakdown: db.room_type_breakdown || undefined,
  totalRoomsAllocated: Number(db.total_rooms_allocated || 0),
  totalRoomsUsed: Number(db.total_rooms_used || 0),
  totalRevenue: Number(db.total_revenue || 0),
  totalRoomNights: Number(db.total_room_nights || 0),
  totalStays: Number(db.total_stays || 0),
  lifetimeValue: Number(db.lifetime_value || 0),
  averageDailyRate: Number(db.average_daily_rate || 0),
  notes: db.notes || undefined,
  preferences: db.preferences || {},
  customFields: db.custom_fields || {},
  defaultRoutingProfileId: db.default_routing_profile_id || undefined,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
  createdBy: db.created_by,
  updatedBy: db.updated_by,
});

const mapGroupProfileToDb = (group: GroupProfile) => ({
  id: group.id,
  code: group.code,
  name: group.name,
  type: group.type,
  status: group.status,
  contact_name: group.contactName || null,
  contact_email: group.contactEmail || null,
  contact_phone: group.contactPhone || null,
  contact_title: group.contactTitle || null,
  organization_name: group.organizationName || null,
  organization_address: group.organizationAddress || null,
  organization_city: group.organizationCity || null,
  organization_country: group.organizationCountry || null,
  organization_tax_id: group.organizationTaxId || null,
  organization_vat_no: group.organizationVatNo || null,
  billing_address: group.billingAddress || null,
  billing_city: group.billingCity || null,
  billing_country: group.billingCountry || null,
  billing_tax_id: group.billingTaxId || null,
  billing_vat_no: group.billingVatNo || null,
  payment_terms: group.paymentTerms || null,
  credit_limit: group.creditLimit || 0,
  current_balance: group.currentBalance || 0,
  contract_start_date: group.contractStartDate || null,
  contract_end_date: group.contractEndDate || null,
  cut_off_date: group.cutOffDate || null,
  negotiated_rate_code: group.negotiatedRateCode || null,
  discount_percent: group.discountPercent || 0,
  master_payment_method: group.masterPaymentMethod || null,
  room_type_breakdown: group.roomTypeBreakdown || null,
  total_rooms_allocated: group.totalRoomsAllocated || 0,
  total_rooms_used: group.totalRoomsUsed || 0,
  total_revenue: group.totalRevenue || 0,
  total_room_nights: group.totalRoomNights || 0,
  total_stays: group.totalStays || 0,
  lifetime_value: group.lifetimeValue || 0,
  average_daily_rate: group.averageDailyRate || 0,
  notes: group.notes || null,
  preferences: group.preferences || {},
  custom_fields: group.customFields || {},
  default_routing_profile_id: group.defaultRoutingProfileId || null,
  created_at: group.createdAt || new Date().toISOString(),
  updated_at: group.updatedAt || new Date().toISOString(),
  created_by: group.createdBy || null,
  updated_by: group.updatedBy || null,
});

// ============================================================================
// GROUP PROFILE SERVICE
// ============================================================================

export const groupProfileService = {
  isConfigured: () => hasSupabaseConfig,

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Fetch all group profiles
   */
  fetchGroupProfiles: async (): Promise<GroupProfile[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('group_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return [];
        }
        throw new Error(`Fetch group profiles failed: ${error.message}`);
      }

      return (data || []).map(mapGroupProfileFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return [];
      }
      console.error('Error fetching group profiles:', e);
      return [];
    }
  },

  /**
   * Fetch a single group profile by ID
   */
  fetchGroupProfileById: async (id: string): Promise<GroupProfile | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      const { data, error } = await supabase
        .from('group_profiles')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return null;
        }
        throw new Error(`Fetch group profile failed: ${error.message}`);
      }

      return data ? mapGroupProfileFromDb(data) : null;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return null;
      }
      console.error('Error fetching group profile:', e);
      return null;
    }
  },

  /**
   * Fetch a group profile by code
   */
  fetchGroupProfileByCode: async (code: string): Promise<GroupProfile | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      const { data, error } = await supabase
        .from('group_profiles')
        .select('*')
        .eq('code', code)
        .maybeSingle();

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return null;
        }
        throw new Error(`Fetch group profile by code failed: ${error.message}`);
      }

      return data ? mapGroupProfileFromDb(data) : null;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return null;
      }
      console.error('Error fetching group profile by code:', e);
      return null;
    }
  },

  /**
   * Fetch group profiles by type
   */
  fetchGroupProfilesByType: async (type: GroupProfileType): Promise<GroupProfile[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('group_profiles')
        .select('*')
        .eq('type', type)
        .order('name', { ascending: true });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return [];
        }
        throw new Error(`Fetch group profiles by type failed: ${error.message}`);
      }

      return (data || []).map(mapGroupProfileFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return [];
      }
      console.error('Error fetching group profiles by type:', e);
      return [];
    }
  },

  /**
   * Fetch active group profiles
   */
  fetchActiveGroupProfiles: async (): Promise<GroupProfile[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('group_profiles')
        .select('*')
        .eq('status', 'Active')
        .order('name', { ascending: true });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return [];
        }
        throw new Error(`Fetch active group profiles failed: ${error.message}`);
      }

      return (data || []).map(mapGroupProfileFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return [];
      }
      console.error('Error fetching active group profiles:', e);
      return [];
    }
  },

  /**
   * Create a new group profile
   */
  createGroupProfile: async (group: Omit<GroupProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<GroupProfile | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      // Check for duplicate code
      const existing = await groupProfileService.fetchGroupProfileByCode(group.code);
      if (existing) {
        console.warn(`Group profile with code '${group.code}' already exists`);
        return null;
      }

      const newGroup: GroupProfile = {
        ...group,
        id: `GP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('group_profiles')
        .insert(mapGroupProfileToDb(newGroup));

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return null;
        }
        throw new Error(`Create group profile failed: ${error.message}`);
      }

      return newGroup;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return null;
      }
      console.error('Error creating group profile:', e);
      return null;
    }
  },

  /**
   * Update an existing group profile
   */
  updateGroupProfile: async (id: string, updates: Partial<GroupProfile>): Promise<GroupProfile | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      const existing = await groupProfileService.fetchGroupProfileById(id);
      if (!existing) {
        console.warn(`Group profile with id '${id}' not found`);
        return null;
      }

      // If code is being updated, check for duplicates
      if (updates.code && updates.code !== existing.code) {
        const duplicate = await groupProfileService.fetchGroupProfileByCode(updates.code);
        if (duplicate) {
          console.warn(`Group profile with code '${updates.code}' already exists`);
          return null;
        }
      }

      const updatedGroup: GroupProfile = {
        ...existing,
        ...updates,
        id, // Ensure ID is preserved
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('group_profiles')
        .update(mapGroupProfileToDb(updatedGroup))
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return null;
        }
        throw new Error(`Update group profile failed: ${error.message}`);
      }

      return updatedGroup;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return null;
      }
      console.error('Error updating group profile:', e);
      return null;
    }
  },

  /**
   * Delete a group profile
   */
  deleteGroupProfile: async (id: string): Promise<boolean> => {
    if (!hasSupabaseConfig) return false;

    try {
      const { error } = await supabase
        .from('group_profiles')
        .delete()
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return false;
        }
        throw new Error(`Delete group profile failed: ${error.message}`);
      }

      return true;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return false;
      }
      console.error('Error deleting group profile:', e);
      return false;
    }
  },

  /**
   * Upsert a group profile (create or update)
   */
  upsertGroupProfile: async (group: GroupProfile): Promise<GroupProfile | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      const { error } = await supabase
        .from('group_profiles')
        .upsert(mapGroupProfileToDb(group), { onConflict: 'id' });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return null;
        }
        throw new Error(`Upsert group profile failed: ${error.message}`);
      }

      return group;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return null;
      }
      console.error('Error upserting group profile:', e);
      return null;
    }
  },

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  /**
   * Update group analytics (revenue, room nights, stays)
   */
  updateGroupAnalytics: async (
    id: string,
    analytics: {
      totalRevenue?: number;
      totalRoomNights?: number;
      totalStays?: number;
      averageDailyRate?: number;
    }
  ): Promise<boolean> => {
    if (!hasSupabaseConfig) return false;

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (analytics.totalRevenue !== undefined) {
        updates.total_revenue = analytics.totalRevenue;
      }
      if (analytics.totalRoomNights !== undefined) {
        updates.total_room_nights = analytics.totalRoomNights;
      }
      if (analytics.totalStays !== undefined) {
        updates.total_stays = analytics.totalStays;
      }
      if (analytics.averageDailyRate !== undefined) {
        updates.average_daily_rate = analytics.averageDailyRate;
      }

      const { error } = await supabase
        .from('group_profiles')
        .update(updates)
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return false;
        }
        throw new Error(`Update group analytics failed: ${error.message}`);
      }

      return true;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return false;
      }
      console.error('Error updating group analytics:', e);
      return false;
    }
  },

  /**
   * Increment group room usage
   */
  incrementRoomUsage: async (id: string, count: number = 1): Promise<boolean> => {
    if (!hasSupabaseConfig) return false;

    try {
      const { error } = await supabase.rpc('increment_group_room_usage', {
        p_group_id: id,
        p_count: count,
      });

      if (error) {
        // If RPC doesn't exist, fall back to direct update
        const existing = await groupProfileService.fetchGroupProfileById(id);
        if (existing) {
          return groupProfileService.updateGroupProfile(id, {
            totalRoomsUsed: (existing.totalRoomsUsed || 0) + count,
          }).then(() => true);
        }
        return false;
      }

      return true;
    } catch (e: any) {
      console.error('Error incrementing room usage:', e);
      return false;
    }
  },

  // ============================================================================
  // VALIDATION OPERATIONS
  // ============================================================================

  /**
   * Check if a group code already exists
   */
  codeExists: async (code: string, excludeId?: string): Promise<boolean> => {
    if (!hasSupabaseConfig) return false;

    try {
      let query = supabase
        .from('group_profiles')
        .select('id')
        .eq('code', code);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return false;
        }
        throw new Error(`Check code existence failed: ${error.message}`);
      }

      return data !== null;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return false;
      }
      console.error('Error checking code existence:', e);
      return false;
    }
  },

  /**
   * Validate group profile data
   */
  validateGroupProfile: (group: Partial<GroupProfile>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!group.code || group.code.trim().length === 0) {
      errors.push('Group code is required');
    }

    if (!group.name || group.name.trim().length === 0) {
      errors.push('Group name is required');
    }

    if (!group.type) {
      errors.push('Group type is required');
    }

    if (!group.status) {
      errors.push('Group status is required');
    }

    if (group.creditLimit !== undefined && group.creditLimit < 0) {
      errors.push('Credit limit cannot be negative');
    }

    if (group.discountPercent !== undefined && (group.discountPercent < 0 || group.discountPercent > 100)) {
      errors.push('Discount percent must be between 0 and 100');
    }

    if (group.totalRoomsAllocated !== undefined && group.totalRoomsAllocated < 0) {
      errors.push('Total rooms allocated cannot be negative');
    }

    if (group.totalRoomsUsed !== undefined && group.totalRoomsUsed < 0) {
      errors.push('Total rooms used cannot be negative');
    }

    // Validate contract dates
    if (group.contractStartDate && group.contractEndDate) {
      if (new Date(group.contractStartDate) > new Date(group.contractEndDate)) {
        errors.push('Contract start date must be before end date');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  // ============================================================================
  // SEARCH OPERATIONS
  // ============================================================================

  /**
   * Search group profiles by name or code
   */
  searchGroupProfiles: async (query: string): Promise<GroupProfile[]> => {
    if (!hasSupabaseConfig || !query) return [];

    try {
      const { data, error } = await supabase
        .from('group_profiles')
        .select('*')
        .or(`name.ilike.%${query}%,code.ilike.%${query}%,organization_name.ilike.%${query}%`)
        .order('name', { ascending: true });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('group_profiles', error);
          return [];
        }
        throw new Error(`Search group profiles failed: ${error.message}`);
      }

      return (data || []).map(mapGroupProfileFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('group_profiles', e);
        return [];
      }
      console.error('Error searching group profiles:', e);
      return [];
    }
  },
};
