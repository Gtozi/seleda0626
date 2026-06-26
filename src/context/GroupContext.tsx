/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { GroupProfile, GroupProfileType, GroupProfileStatus } from '../types/erp';
import { useSystem } from './SystemContext';
import { groupProfileService } from '../services/groupProfileService';

export interface GroupContextType {
  groupProfiles: GroupProfile[];
  
  // CRUD operations
  fetchGroupProfiles: () => Promise<void>;
  fetchGroupProfileById: (id: string) => Promise<GroupProfile | null>;
  fetchGroupProfileByCode: (code: string) => Promise<GroupProfile | null>;
  fetchGroupProfilesByType: (type: GroupProfileType) => Promise<GroupProfile[]>;
  fetchActiveGroupProfiles: () => Promise<GroupProfile[]>;
  createGroupProfile: (group: Omit<GroupProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<GroupProfile | null>;
  updateGroupProfile: (id: string, updates: Partial<GroupProfile>) => Promise<GroupProfile | null>;
  deleteGroupProfile: (id: string) => Promise<boolean>;
  
  // Analytics operations
  updateGroupAnalytics: (id: string, analytics: {
    totalRevenue?: number;
    totalRoomNights?: number;
    totalStays?: number;
    averageDailyRate?: number;
  }) => Promise<boolean>;
  incrementRoomUsage: (id: string, count?: number) => Promise<boolean>;
  
  // Validation operations
  codeExists: (code: string, excludeId?: string) => Promise<boolean>;
  validateGroupProfile: (group: Partial<GroupProfile>) => { valid: boolean; errors: string[] };
  
  // Search operations
  searchGroupProfiles: (query: string) => Promise<GroupProfile[]>;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup must be used within a GroupProvider');
  return context;
};

export const GroupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logAudit, addNotification } = useSystem();
  const [groupProfiles, setGroupProfiles] = useState<GroupProfile[]>([]);

  React.useEffect(() => {
    if (groupProfileService.isConfigured()) {
      groupProfileService.fetchGroupProfiles()
        .then(data => {
          if (data && data.length > 0) setGroupProfiles(data);
        })
        .catch(console.error);
    }
  }, []);

  const fetchGroupProfiles = useCallback(async () => {
    if (!groupProfileService.isConfigured()) {
      return;
    }
    
    try {
      const profiles = await groupProfileService.fetchGroupProfiles();
      setGroupProfiles(profiles);
    } catch (error) {
      console.error('Error fetching group profiles:', error);
      addNotification('Failed to fetch group profiles', 'error', 'Group Management');
    }
  }, [addNotification]);

  const fetchGroupProfileById = useCallback(async (id: string): Promise<GroupProfile | null> => {
    if (!groupProfileService.isConfigured()) {
      return null;
    }
    
    try {
      return await groupProfileService.fetchGroupProfileById(id);
    } catch (error) {
      console.error('Error fetching group profile:', error);
      return null;
    }
  }, []);

  const fetchGroupProfileByCode = useCallback(async (code: string): Promise<GroupProfile | null> => {
    if (!groupProfileService.isConfigured()) {
      return null;
    }
    
    try {
      return await groupProfileService.fetchGroupProfileByCode(code);
    } catch (error) {
      console.error('Error fetching group profile by code:', error);
      return null;
    }
  }, []);

  const fetchGroupProfilesByType = useCallback(async (type: GroupProfileType): Promise<GroupProfile[]> => {
    if (!groupProfileService.isConfigured()) {
      return [];
    }
    
    try {
      return await groupProfileService.fetchGroupProfilesByType(type);
    } catch (error) {
      console.error('Error fetching group profiles by type:', error);
      return [];
    }
  }, []);

  const fetchActiveGroupProfiles = useCallback(async (): Promise<GroupProfile[]> => {
    if (!groupProfileService.isConfigured()) {
      return [];
    }
    
    try {
      return await groupProfileService.fetchActiveGroupProfiles();
    } catch (error) {
      console.error('Error fetching active group profiles:', error);
      return [];
    }
  }, []);

  const createGroupProfile = useCallback(async (
    group: Omit<GroupProfile, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<GroupProfile | null> => {
    if (!groupProfileService.isConfigured()) {
      return null;
    }
    
    try {
      // Validate
      const validation = groupProfileService.validateGroupProfile(group);
      if (!validation.valid) {
        addNotification(`Validation failed: ${validation.errors.join(', ')}`, 'error', 'Group Management');
        return null;
      }
      
      // Check for duplicate code
      const codeExists = await groupProfileService.codeExists(group.code);
      if (codeExists) {
        addNotification(`Group code '${group.code}' already exists`, 'error', 'Group Management');
        return null;
      }
      
      const newProfile = await groupProfileService.createGroupProfile(group);
      
      if (newProfile) {
        setGroupProfiles(prev => [...prev, newProfile]);
        logAudit(`Group profile created: ${newProfile.name} (${newProfile.code})`);
        addNotification(`Group profile created successfully`, 'success', 'Group Management');
      }
      
      return newProfile;
    } catch (error) {
      console.error('Error creating group profile:', error);
      addNotification('Failed to create group profile', 'error', 'Group Management');
      return null;
    }
  }, [logAudit, addNotification]);

  const updateGroupProfile = useCallback(async (
    id: string,
    updates: Partial<GroupProfile>
  ): Promise<GroupProfile | null> => {
    if (!groupProfileService.isConfigured()) {
      return null;
    }
    
    try {
      // Validate
      const validation = groupProfileService.validateGroupProfile(updates);
      if (!validation.valid) {
        addNotification(`Validation failed: ${validation.errors.join(', ')}`, 'error', 'Group Management');
        return null;
      }
      
      // Check for duplicate code if code is being updated
      if (updates.code) {
        const codeExists = await groupProfileService.codeExists(updates.code, id);
        if (codeExists) {
          addNotification(`Group code '${updates.code}' already exists`, 'error', 'Group Management');
          return null;
        }
      }
      
      const updatedProfile = await groupProfileService.updateGroupProfile(id, updates);
      
      if (updatedProfile) {
        setGroupProfiles(prev => prev.map(g => g.id === id ? updatedProfile : g));
        logAudit(`Group profile updated: ${updatedProfile.name} (${updatedProfile.code})`);
        addNotification(`Group profile updated successfully`, 'success', 'Group Management');
      }
      
      return updatedProfile;
    } catch (error) {
      console.error('Error updating group profile:', error);
      addNotification('Failed to update group profile', 'error', 'Group Management');
      return null;
    }
  }, [logAudit, addNotification]);

  const deleteGroupProfile = useCallback(async (id: string): Promise<boolean> => {
    if (!groupProfileService.isConfigured()) {
      return false;
    }
    
    try {
      const success = await groupProfileService.deleteGroupProfile(id);
      
      if (success) {
        const deleted = groupProfiles.find(g => g.id === id);
        setGroupProfiles(prev => prev.filter(g => g.id !== id));
        logAudit(`Group profile deleted: ${deleted?.name || id}`);
        addNotification(`Group profile deleted successfully`, 'success', 'Group Management');
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting group profile:', error);
      addNotification('Failed to delete group profile', 'error', 'Group Management');
      return false;
    }
  }, [groupProfiles, logAudit, addNotification]);

  const updateGroupAnalytics = useCallback(async (
    id: string,
    analytics: {
      totalRevenue?: number;
      totalRoomNights?: number;
      totalStays?: number;
      averageDailyRate?: number;
    }
  ): Promise<boolean> => {
    if (!groupProfileService.isConfigured()) {
      return false;
    }
    
    try {
      const success = await groupProfileService.updateGroupAnalytics(id, analytics);
      
      if (success) {
        setGroupProfiles(prev => prev.map(g => {
          if (g.id === id) {
            return {
              ...g,
              totalRevenue: analytics.totalRevenue !== undefined ? analytics.totalRevenue : g.totalRevenue,
              totalRoomNights: analytics.totalRoomNights !== undefined ? analytics.totalRoomNights : g.totalRoomNights,
              totalStays: analytics.totalStays !== undefined ? analytics.totalStays : g.totalStays,
              averageDailyRate: analytics.averageDailyRate !== undefined ? analytics.averageDailyRate : g.averageDailyRate,
            };
          }
          return g;
        }));
      }
      
      return success;
    } catch (error) {
      console.error('Error updating group analytics:', error);
      return false;
    }
  }, []);

  const incrementRoomUsage = useCallback(async (id: string, count: number = 1): Promise<boolean> => {
    if (!groupProfileService.isConfigured()) {
      return false;
    }
    
    try {
      const success = await groupProfileService.incrementRoomUsage(id, count);
      
      if (success) {
        setGroupProfiles(prev => prev.map(g => {
          if (g.id === id) {
            return {
              ...g,
              totalRoomsUsed: (g.totalRoomsUsed || 0) + count,
            };
          }
          return g;
        }));
      }
      
      return success;
    } catch (error) {
      console.error('Error incrementing room usage:', error);
      return false;
    }
  }, []);

  const codeExists = useCallback(async (code: string, excludeId?: string): Promise<boolean> => {
    if (!groupProfileService.isConfigured()) {
      return false;
    }
    
    try {
      return await groupProfileService.codeExists(code, excludeId);
    } catch (error) {
      console.error('Error checking code existence:', error);
      return false;
    }
  }, []);

  const validateGroupProfile = useCallback((group: Partial<GroupProfile>) => {
    return groupProfileService.validateGroupProfile(group);
  }, []);

  const searchGroupProfiles = useCallback(async (query: string): Promise<GroupProfile[]> => {
    if (!groupProfileService.isConfigured()) {
      return [];
    }
    
    try {
      return await groupProfileService.searchGroupProfiles(query);
    } catch (error) {
      console.error('Error searching group profiles:', error);
      return [];
    }
  }, []);

  const value: GroupContextType = {
    groupProfiles,
    fetchGroupProfiles,
    fetchGroupProfileById,
    fetchGroupProfileByCode,
    fetchGroupProfilesByType,
    fetchActiveGroupProfiles,
    createGroupProfile,
    updateGroupProfile,
    deleteGroupProfile,
    updateGroupAnalytics,
    incrementRoomUsage,
    codeExists,
    validateGroupProfile,
    searchGroupProfiles,
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};
