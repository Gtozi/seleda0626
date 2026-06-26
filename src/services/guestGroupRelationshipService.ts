import { supabase, hasSupabaseConfig } from '../lib/supabase';
import { 
  GuestGroupRelationship, 
  RelationshipType, 
  RelationshipStatus,
  GuestGroupSummary,
  GroupAnalytics
} from '../types/erp';

// ============================================================================
// GUEST GROUP RELATIONSHIP SERVICE
// ============================================================================
// Service for managing guest-group relationships including CRUD operations,
// automatic linking, historical tracking, and analytics calculation.
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
      `🔒 [GuestGroupRelationshipService] Access or permission denied on 'public.${tableName}'. ` +
      `Row-Level Security (RLS) is enabled, or the API key constraints prevent accessing this table. ` +
      `Please ensure appropriate policies are deployed in your Supabase Dashboard.`
    );
  } else {
    console.warn(
      `💡 [GuestGroupRelationshipService] The table 'public.${tableName}' is not found in your Supabase project schema yet. ` +
      `To provision this table, execute the migration script: /supabase/migrations/001_group_linking_system.sql`
    );
  }
};

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

const mapGuestGroupRelationshipFromDb = (db: any): GuestGroupRelationship => ({
  id: db.id,
  guestId: db.guest_id,
  groupId: db.group_id,
  reservationId: db.reservation_id || undefined,
  relationshipType: db.relationship_type,
  status: db.status,
  startDate: db.start_date,
  endDate: db.end_date || undefined,
  isPrimaryContact: db.is_primary_contact,
  roleTitle: db.role_title || undefined,
  totalStays: Number(db.total_stays || 0),
  totalRoomNights: Number(db.total_room_nights || 0),
  totalRevenue: Number(db.total_revenue || 0),
  averageDailyRate: Number(db.average_daily_rate || 0),
  lastStayDate: db.last_stay_date || undefined,
  notes: db.notes || undefined,
  customFields: db.custom_fields || {},
  createdAt: db.created_at,
  updatedAt: db.updated_at,
  createdBy: db.created_by,
  updatedBy: db.updated_by,
});

const mapGuestGroupRelationshipToDb = (relationship: GuestGroupRelationship) => ({
  id: relationship.id,
  guest_id: relationship.guestId,
  group_id: relationship.groupId,
  reservation_id: relationship.reservationId || null,
  relationship_type: relationship.relationshipType,
  status: relationship.status,
  start_date: relationship.startDate,
  end_date: relationship.endDate || null,
  is_primary_contact: relationship.isPrimaryContact,
  role_title: relationship.roleTitle || null,
  total_stays: relationship.totalStays || 0,
  total_room_nights: relationship.totalRoomNights || 0,
  total_revenue: relationship.totalRevenue || 0,
  average_daily_rate: relationship.averageDailyRate || 0,
  last_stay_date: relationship.lastStayDate || null,
  notes: relationship.notes || null,
  custom_fields: relationship.customFields || {},
  created_at: relationship.createdAt || new Date().toISOString(),
  updated_at: relationship.updatedAt || new Date().toISOString(),
  created_by: relationship.createdBy || null,
  updated_by: relationship.updatedBy || null,
});

// ============================================================================
// GUEST GROUP RELATIONSHIP SERVICE
// ============================================================================

export const guestGroupRelationshipService = {
  isConfigured: () => hasSupabaseConfig,

  // ============================================================================
  // CRUD OPERATIONS
  // ============================================================================

  /**
   * Fetch all guest-group relationships
   */
  fetchRelationships: async (): Promise<GuestGroupRelationship[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('guest_group_relationships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return [];
        }
        throw new Error(`Fetch relationships failed: ${error.message}`);
      }

      return (data || []).map(mapGuestGroupRelationshipFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return [];
      }
      console.error('Error fetching relationships:', e);
      return [];
    }
  },

  /**
   * Fetch a single relationship by ID
   */
  fetchRelationshipById: async (id: string): Promise<GuestGroupRelationship | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      const { data, error } = await supabase
        .from('guest_group_relationships')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return null;
        }
        throw new Error(`Fetch relationship failed: ${error.message}`);
      }

      return data ? mapGuestGroupRelationshipFromDb(data) : null;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return null;
      }
      console.error('Error fetching relationship:', e);
      return null;
    }
  },

  /**
   * Fetch all relationships for a guest
   */
  fetchGuestRelationships: async (guestId: string): Promise<GuestGroupRelationship[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('guest_group_relationships')
        .select('*')
        .eq('guest_id', guestId)
        .order('start_date', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return [];
        }
        throw new Error(`Fetch guest relationships failed: ${error.message}`);
      }

      return (data || []).map(mapGuestGroupRelationshipFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return [];
      }
      console.error('Error fetching guest relationships:', e);
      return [];
    }
  },

  /**
   * Fetch active relationships for a guest
   */
  fetchGuestActiveRelationships: async (guestId: string): Promise<GuestGroupRelationship[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('guest_group_relationships')
        .select('*')
        .eq('guest_id', guestId)
        .eq('status', 'Active')
        .or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0])
        .order('start_date', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return [];
        }
        throw new Error(`Fetch guest active relationships failed: ${error.message}`);
      }

      return (data || []).map(mapGuestGroupRelationshipFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return [];
      }
      console.error('Error fetching guest active relationships:', e);
      return [];
    }
  },

  /**
   * Fetch all relationships for a group
   */
  fetchGroupRelationships: async (groupId: string): Promise<GuestGroupRelationship[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('guest_group_relationships')
        .select('*')
        .eq('group_id', groupId)
        .order('start_date', { ascending: false });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return [];
        }
        throw new Error(`Fetch group relationships failed: ${error.message}`);
      }

      return (data || []).map(mapGuestGroupRelationshipFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return [];
      }
      console.error('Error fetching group relationships:', e);
      return [];
    }
  },

  /**
   * Fetch active relationships for a group
   */
  fetchGroupActiveRelationships: async (groupId: string): Promise<GuestGroupRelationship[]> => {
    if (!hasSupabaseConfig) return [];

    try {
      const { data, error } = await supabase
        .from('guest_group_relationships')
        .select('*')
        .eq('group_id', groupId)
        .eq('status', 'Active')
        .or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0])
        .order('is_primary_contact', { ascending: false })
        .order('start_date', { ascending: true });

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return [];
        }
        throw new Error(`Fetch group active relationships failed: ${error.message}`);
      }

      return (data || []).map(mapGuestGroupRelationshipFromDb);
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return [];
      }
      console.error('Error fetching group active relationships:', e);
      return [];
    }
  },

  /**
   * Create a new guest-group relationship
   */
  createRelationship: async (
    relationship: Omit<GuestGroupRelationship, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GuestGroupRelationship | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      // Check for duplicate active relationship
      const existing = await guestGroupRelationshipService.fetchGuestActiveRelationships(relationship.guestId);
      const duplicate = existing.find(
        r => r.groupId === relationship.groupId && r.status === 'Active'
      );

      if (duplicate) {
        console.warn(`Active relationship already exists between guest ${relationship.guestId} and group ${relationship.groupId}`);
        return null;
      }

      const newRelationship: GuestGroupRelationship = {
        ...relationship,
        id: `GGR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('guest_group_relationships')
        .insert(mapGuestGroupRelationshipToDb(newRelationship));

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return null;
        }
        throw new Error(`Create relationship failed: ${error.message}`);
      }

      return newRelationship;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return null;
      }
      console.error('Error creating relationship:', e);
      return null;
    }
  },

  /**
   * Update an existing relationship
   */
  updateRelationship: async (
    id: string,
    updates: Partial<GuestGroupRelationship>
  ): Promise<GuestGroupRelationship | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      const existing = await guestGroupRelationshipService.fetchRelationshipById(id);
      if (!existing) {
        console.warn(`Relationship with id '${id}' not found`);
        return null;
      }

      const updatedRelationship: GuestGroupRelationship = {
        ...existing,
        ...updates,
        id, // Ensure ID is preserved
        updatedAt: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('guest_group_relationships')
        .update(mapGuestGroupRelationshipToDb(updatedRelationship))
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return null;
        }
        throw new Error(`Update relationship failed: ${error.message}`);
      }

      return updatedRelationship;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return null;
      }
      console.error('Error updating relationship:', e);
      return null;
    }
  },

  /**
   * Terminate a relationship (set end date and status to Terminated)
   */
  terminateRelationship: async (
    id: string,
    reason?: string
  ): Promise<GuestGroupRelationship | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      const existing = await guestGroupRelationshipService.fetchRelationshipById(id);
      if (!existing) {
        console.warn(`Relationship with id '${id}' not found`);
        return null;
      }

      const terminatedRelationship: GuestGroupRelationship = {
        ...existing,
        status: 'Terminated',
        endDate: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
        notes: reason ? `${existing.notes || ''} [Terminated: ${reason}]`.trim() : existing.notes,
      };

      const { error } = await supabase
        .from('guest_group_relationships')
        .update(mapGuestGroupRelationshipToDb(terminatedRelationship))
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return null;
        }
        throw new Error(`Terminate relationship failed: ${error.message}`);
      }

      return terminatedRelationship;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return null;
      }
      console.error('Error terminating relationship:', e);
      return null;
    }
  },

  /**
   * Delete a relationship
   */
  deleteRelationship: async (id: string): Promise<boolean> => {
    if (!hasSupabaseConfig) return false;

    try {
      const { error } = await supabase
        .from('guest_group_relationships')
        .delete()
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return false;
        }
        throw new Error(`Delete relationship failed: ${error.message}`);
      }

      return true;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return false;
      }
      console.error('Error deleting relationship:', e);
      return false;
    }
  },

  // ============================================================================
  // AUTOMATIC LINKING OPERATIONS
  // ============================================================================

  /**
   * Link a guest to a group (automatic or manual)
   */
  linkGuestToGroup: async (
    guestId: string,
    groupId: string,
    options: {
      relationshipType?: RelationshipType;
      isPrimaryContact?: boolean;
      reservationId?: string;
      roleTitle?: string;
      userId?: string;
    } = {}
  ): Promise<GuestGroupRelationship | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      // Try to use database function first
      const { data, error } = await supabase.rpc('link_guest_to_group', {
        p_guest_id: guestId,
        p_group_id: groupId,
        p_relationship_type: options.relationshipType,
        p_is_primary_contact: options.isPrimaryContact || false,
        p_reservation_id: options.reservationId || null,
        p_user_id: options.userId || null,
      });

      if (error) {
        // If RPC doesn't exist, fall back to manual implementation
        console.warn('RPC link_guest_to_group not available, using manual implementation');
        return guestGroupRelationshipService.createRelationship({
          guestId,
          groupId,
          reservationId: options.reservationId,
          relationshipType: options.relationshipType || 'GroupReservation',
          status: 'Active',
          startDate: new Date().toISOString().split('T')[0],
          isPrimaryContact: options.isPrimaryContact || false,
          roleTitle: options.roleTitle,
          createdBy: options.userId,
        });
      }

      if (data?.success) {
        // Fetch the created/updated relationship
        const relationshipId = data.relationshipId;
        return guestGroupRelationshipService.fetchRelationshipById(relationshipId);
      }

      return null;
    } catch (e: any) {
      console.error('Error linking guest to group:', e);
      return null;
    }
  },

  /**
   * Unlink a guest from a group
   */
  unlinkGuestFromGroup: async (
    guestId: string,
    groupId: string,
    options: {
      reason?: string;
      userId?: string;
    } = {}
  ): Promise<boolean> => {
    if (!hasSupabaseConfig) return false;

    try {
      // Try to use database function first
      const { data, error } = await supabase.rpc('unlink_guest_from_group', {
        p_guest_id: guestId,
        p_group_id: groupId,
        p_reason: options.reason || null,
        p_user_id: options.userId || null,
      });

      if (error) {
        // If RPC doesn't exist, fall back to manual implementation
        console.warn('RPC unlink_guest_from_group not available, using manual implementation');
        const activeRelationships = await guestGroupRelationshipService.fetchGuestActiveRelationships(guestId);
        const relationship = activeRelationships.find(r => r.groupId === groupId);
        
        if (relationship) {
          const terminated = await guestGroupRelationshipService.terminateRelationship(relationship.id, options.reason);
          return terminated !== null;
        }
        return false;
      }

      return data?.success || false;
    } catch (e: any) {
      console.error('Error unlinking guest from group:', e);
      return false;
    }
  },

  /**
   * Automatically link guest to group based on reservation
   */
  autoLinkFromReservation: async (
    guestId: string,
    reservationId: string,
    groupId: string,
    userId?: string
  ): Promise<GuestGroupRelationship | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      // Check if relationship already exists
      const existing = await guestGroupRelationshipService.fetchGuestActiveRelationships(guestId);
      const existingRelationship = existing.find(r => r.groupId === groupId);

      if (existingRelationship) {
        // Update existing relationship with new reservation
        return guestGroupRelationshipService.updateRelationship(existingRelationship.id, {
          reservationId,
          updatedBy: userId,
        });
      }

      // Create new relationship
      return guestGroupRelationshipService.createRelationship({
        guestId,
        groupId,
        reservationId,
        relationshipType: 'GroupReservation',
        status: 'Active',
        startDate: new Date().toISOString().split('T')[0],
        isPrimaryContact: false,
        createdBy: userId,
      });
    } catch (e: any) {
      console.error('Error auto-linking from reservation:', e);
      return null;
    }
  },

  // ============================================================================
  // ANALYTICS OPERATIONS
  // ============================================================================

  /**
   * Update relationship analytics after a stay
   */
  updateRelationshipAnalytics: async (
    id: string,
    analytics: {
      totalStays?: number;
      totalRoomNights?: number;
      totalRevenue?: number;
      averageDailyRate?: number;
      lastStayDate?: string;
    }
  ): Promise<boolean> => {
    if (!hasSupabaseConfig) return false;

    try {
      const updates: any = {
        updated_at: new Date().toISOString(),
      };

      if (analytics.totalStays !== undefined) {
        updates.total_stays = analytics.totalStays;
      }
      if (analytics.totalRoomNights !== undefined) {
        updates.total_room_nights = analytics.totalRoomNights;
      }
      if (analytics.totalRevenue !== undefined) {
        updates.total_revenue = analytics.totalRevenue;
      }
      if (analytics.averageDailyRate !== undefined) {
        updates.average_daily_rate = analytics.averageDailyRate;
      }
      if (analytics.lastStayDate !== undefined) {
        updates.last_stay_date = analytics.lastStayDate;
      }

      const { error } = await supabase
        .from('guest_group_relationships')
        .update(updates)
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logMissingTableWarning('guest_group_relationships', error);
          return false;
        }
        throw new Error(`Update relationship analytics failed: ${error.message}`);
      }

      return true;
    } catch (e: any) {
      if (isTableMissingError(e)) {
        logMissingTableWarning('guest_group_relationships', e);
        return false;
      }
      console.error('Error updating relationship analytics:', e);
      return false;
    }
  },

  /**
   * Get guest group summary (current group, historical groups, metrics)
   */
  getGuestGroupSummary: async (guestId: string): Promise<GuestGroupSummary | null> => {
    if (!hasSupabaseConfig) return null;

    try {
      // Fetch all relationships for the guest
      const relationships = await guestGroupRelationshipService.fetchGuestRelationships(guestId);
      
      // Fetch group profiles for each relationship
      const groupIds = relationships.map(r => r.groupId);
      const { data: groups, error: groupsError } = await supabase
        .from('group_profiles')
        .select('id, name, type')
        .in('id', groupIds);

      if (groupsError) {
        console.error('Error fetching group profiles:', groupsError);
        return null;
      }

      const groupMap = new Map(groups?.map(g => [g.id, g]) || []);

      // Separate current and previous relationships
      const today = new Date().toISOString().split('T')[0];
      const currentRelationship = relationships.find(
        r => r.status === 'Active' && (!r.endDate || r.endDate >= today)
      );
      const previousRelationships = relationships.filter(
        r => r !== currentRelationship
      );

      // Calculate total metrics
      const totalGroupStays = relationships.reduce((sum, r) => sum + (r.totalStays || 0), 0);
      const totalGroupRevenue = relationships.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
      const totalGroupRoomNights = relationships.reduce((sum, r) => sum + (r.totalRoomNights || 0), 0);

      // Build summary
      const summary: GuestGroupSummary = {
        guestId,
        guestName: '', // Will be filled by caller
        guestEmail: '', // Will be filled by caller
        totalGroupStays,
        totalGroupRevenue,
        totalGroupRoomNights,
        previousGroups: [], // Will be populated below
      };

      if (currentRelationship) {
        const group = groupMap.get(currentRelationship.groupId);
        summary.currentGroup = {
          groupId: currentRelationship.groupId,
          groupName: group?.name || 'Unknown',
          groupType: group?.type || 'GroupReservation',
          relationshipType: currentRelationship.relationshipType,
          isPrimaryContact: currentRelationship.isPrimaryContact,
          startDate: currentRelationship.startDate,
        };
      }

      summary.previousGroups = previousRelationships.map(r => {
        const group = groupMap.get(r.groupId);
        return {
          groupId: r.groupId,
          groupName: group?.name || 'Unknown',
          groupType: group?.type || 'GroupReservation',
          relationshipType: r.relationshipType,
          startDate: r.startDate,
          endDate: r.endDate || 'Unknown',
          totalStays: r.totalStays || 0,
          totalRevenue: r.totalRevenue || 0,
        };
      });

      return summary;
    } catch (e: any) {
      console.error('Error getting guest group summary:', e);
      return null;
    }
  },

  // ============================================================================
  // VALIDATION OPERATIONS
  // ============================================================================

  /**
   * Validate relationship data
   */
  validateRelationship: (relationship: Partial<GuestGroupRelationship>): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!relationship.guestId) {
      errors.push('Guest ID is required');
    }

    if (!relationship.groupId) {
      errors.push('Group ID is required');
    }

    if (!relationship.relationshipType) {
      errors.push('Relationship type is required');
    }

    if (!relationship.status) {
      errors.push('Relationship status is required');
    }

    if (!relationship.startDate) {
      errors.push('Start date is required');
    }

    if (relationship.endDate && relationship.startDate) {
      if (new Date(relationship.endDate) < new Date(relationship.startDate)) {
        errors.push('End date must be after start date');
      }
    }

    if (relationship.totalStays !== undefined && relationship.totalStays < 0) {
      errors.push('Total stays cannot be negative');
    }

    if (relationship.totalRoomNights !== undefined && relationship.totalRoomNights < 0) {
      errors.push('Total room nights cannot be negative');
    }

    if (relationship.totalRevenue !== undefined && relationship.totalRevenue < 0) {
      errors.push('Total revenue cannot be negative');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};
