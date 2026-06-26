/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Guest, GuestGroupRelationship, GuestGroupSummary } from '../types/erp';
import { initialGuests } from './initialState';
import { useSystem } from './SystemContext';
import { supabaseService } from '../services/supabaseService';
import { guestGroupRelationshipService } from '../services/guestGroupRelationshipService';

export interface GuestContextType {
  guests: Guest[];
  guestFeedbacks: any[];
  guestGroupRelationships: GuestGroupRelationship[];
  
  addGuest: (guestData: Omit<Guest, 'id'>) => string;
  updateGuest: (updatedGuest: Guest) => void;
  updateGuestData: (id: string, updates: Partial<Guest>) => void;
  addGuestFeedback: (feedback: { 
    reservationId: string; 
    guestName: string; 
    rating: number; 
    comment: string;
    date: string;
  }) => void;
  
  // Profile Match Engine (deduplication)
  findMatchingGuest: (criteria: { 
    lastName?: string; 
    email?: string; 
    passportNumber?: string;
    name?: string;
  }) => Guest | undefined;
  
  // Hierarchical guest management functions
  getGuestsByGroup: (groupId: string) => Guest[];
  getGuestsByCorporate: (corporateId: string) => Guest[];
  addGuestToGroup: (guestId: string, groupId: string, isPrimary?: boolean) => void;
  addGuestToCorporate: (guestId: string, corporateId: string, isPrimary?: boolean) => void;
  removeGuestFromGroup: (guestId: string) => void;
  removeGuestFromCorporate: (guestId: string) => void;
  
  // Billing routing helpers
  setGuestBillingRouting: (guestId: string, routingProfileId: string | undefined) => void;
  
  // Guest-group relationship functions
  fetchGuestGroupRelationships: (guestId: string) => Promise<GuestGroupRelationship[]>;
  getGuestGroupSummary: (guestId: string) => Promise<GuestGroupSummary | null>;
  linkGuestToGroup: (guestId: string, groupId: string, options?: {
    relationshipType?: string;
    isPrimaryContact?: boolean;
    reservationId?: string;
    roleTitle?: string;
  }) => Promise<GuestGroupRelationship | null>;
  unlinkGuestFromGroup: (guestId: string, groupId: string, reason?: string) => Promise<boolean>;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const useGuest = () => {
  const context = useContext(GuestContext);
  if (!context) throw new Error('useGuest must be used within a GuestProvider');
  return context;
};

export const GuestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logAudit, addNotification } = useSystem();
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [guestFeedbacks, setGuestFeedbacks] = useState<any[]>([]);
  const [guestGroupRelationships, setGuestGroupRelationships] = useState<GuestGroupRelationship[]>([]);

  React.useEffect(() => {
    if (supabaseService.isConfigured()) {
      supabaseService.fetchGuests()
        .then(data => {
          if (data && data.length > 0) setGuests(data);
        })
        .catch(console.error);
    }
  }, []);

  const addGuest = useCallback((guestData: Omit<Guest, 'id'>): string => {
    // Deduplication: prevent creating duplicate profiles
    // Also check parentGroupId to allow same email/name for different groups
    const match = findMatchingGuest({
      lastName: guestData.lastName,
      email: guestData.email,
      passportNumber: guestData.passportNumber,
      name: guestData.name
    });
    if (match && match.parentGroupId === guestData.parentGroupId) {
      logAudit(`Profile match found for ${guestData.name} — linked to existing guest ${match.id}.`);
      return match.id;
    }
    // Generate unique ID using timestamp + random to prevent duplicates
    const newId = `G-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newGuest = { ...guestData, id: newId };
    setGuests(prev => [...prev, newGuest]);
    if (supabaseService.isConfigured()) {
      supabaseService.upsertGuest(newGuest).catch(console.error);
    }
    logAudit(`New guest CRM profile created: ${guestData.name}.`);
    return newId;
  }, [logAudit, guests]);

  const updateGuest = useCallback((updatedGuest: Guest) => {
    setGuests(prev => prev.map(g => g.id === updatedGuest.id ? updatedGuest : g));
    if (supabaseService.isConfigured()) {
      supabaseService.upsertGuest(updatedGuest).catch(console.error);
    }
    logAudit(`Guest CRM profile updated for ${updatedGuest.name}.`);
  }, [logAudit]);

  const updateGuestData = useCallback((id: string, updates: Partial<Guest>) => {
    setGuests(prev => {
      const next = prev.map(g => g.id === id ? { ...g, ...updates } : g);
      if (supabaseService.isConfigured()) {
        const tgt = next.find(g => g.id === id);
        if (tgt) supabaseService.upsertGuest(tgt).catch(console.error);
      }
      return next;
    });
  }, []);

  const addGuestFeedback = useCallback((feedback: { 
    reservationId: string; 
    guestName: string; 
    rating: number; 
    comment: string;
    date: string;
  }) => {
    setGuestFeedbacks(prev => [...prev, { id: `FBK-${Date.now()}`, ...feedback }]);
    addNotification(`New ${feedback.rating}-star review from ${feedback.guestName}`, 'info', 'Guest Relations');
  }, [addNotification]);

  // Hierarchical guest management functions
  const findMatchingGuest = useCallback((criteria: { 
    lastName?: string; 
    email?: string; 
    passportNumber?: string;
    name?: string;
  }): Guest | undefined => {
    return guests.find(g => {
      const emailMatch = criteria.email && g.email.toLowerCase() === criteria.email.toLowerCase();
      const passportMatch = criteria.passportNumber && g.passportNumber && 
        g.passportNumber.toLowerCase() === criteria.passportNumber.toLowerCase();
      const lastNameMatch = criteria.lastName && g.lastName && 
        g.lastName.toLowerCase() === criteria.lastName.toLowerCase();
      const nameMatch = criteria.name && g.name.toLowerCase() === criteria.name.toLowerCase();
      // Strict dedup: Passport number exact match OR (Last Name + Email match)
      return passportMatch || (lastNameMatch && emailMatch) || nameMatch;
    });
  }, [guests]);

  const getGuestsByGroup = useCallback((groupId: string) => {
    return guests.filter(g => g.parentGroupId === groupId);
  }, [guests]);

  const getGuestsByCorporate = useCallback((corporateId: string) => {
    return guests.filter(g => g.parentCorporateId === corporateId);
  }, [guests]);

  const addGuestToGroup = useCallback((guestId: string, groupId: string, isPrimary: boolean = false) => {
    updateGuestData(guestId, { 
      parentGroupId: groupId, 
      parentCorporateId: undefined,
      isPrimaryContact: isPrimary 
    });
    logAudit(`Guest ${guestId} added to group ${groupId}${isPrimary ? ' as primary contact' : ''}.`);
  }, [updateGuestData, logAudit]);

  const addGuestToCorporate = useCallback((guestId: string, corporateId: string, isPrimary: boolean = false) => {
    updateGuestData(guestId, { 
      parentCorporateId: corporateId, 
      parentGroupId: undefined,
      isPrimaryContact: isPrimary 
    });
    logAudit(`Guest ${guestId} added to corporate account ${corporateId}${isPrimary ? ' as primary contact' : ''}.`);
  }, [updateGuestData, logAudit]);

  const removeGuestFromGroup = useCallback((guestId: string) => {
    updateGuestData(guestId, { 
      parentGroupId: undefined, 
      isPrimaryContact: false 
    });
    logAudit(`Guest ${guestId} removed from group.`);
  }, [updateGuestData, logAudit]);

  const removeGuestFromCorporate = useCallback((guestId: string) => {
    updateGuestData(guestId, { 
      parentCorporateId: undefined, 
      isPrimaryContact: false 
    });
    logAudit(`Guest ${guestId} removed from corporate account.`);
  }, [updateGuestData, logAudit]);

  const setGuestBillingRouting = useCallback((guestId: string, routingProfileId: string | undefined) => {
    updateGuestData(guestId, { billingRoutingProfileId: routingProfileId });
    logAudit(`Billing routing updated for guest ${guestId}.`);
  }, [updateGuestData, logAudit]);

  // Guest-group relationship functions
  const fetchGuestGroupRelationships = useCallback(async (guestId: string): Promise<GuestGroupRelationship[]> => {
    if (!guestGroupRelationshipService.isConfigured()) {
      return [];
    }
    
    try {
      const relationships = await guestGroupRelationshipService.fetchGuestRelationships(guestId);
      setGuestGroupRelationships(relationships);
      return relationships;
    } catch (error) {
      console.error('Error fetching guest group relationships:', error);
      return [];
    }
  }, []);

  const getGuestGroupSummary = useCallback(async (guestId: string): Promise<GuestGroupSummary | null> => {
    if (!guestGroupRelationshipService.isConfigured()) {
      return null;
    }
    
    try {
      const summary = await guestGroupRelationshipService.getGuestGroupSummary(guestId);
      if (summary) {
        const guest = guests.find(g => g.id === guestId);
        if (guest) {
          summary.guestName = guest.name;
          summary.guestEmail = guest.email;
        }
      }
      return summary;
    } catch (error) {
      console.error('Error getting guest group summary:', error);
      return null;
    }
  }, [guests]);

  const linkGuestToGroup = useCallback(async (
    guestId: string, 
    groupId: string, 
    options?: {
      relationshipType?: 'GroupReservation' | 'CorporateAccount' | 'TravelAgent' | 'TourOperator' | 'CrewBooking' | 'Conference' | 'Event' | 'LongTermContract';
      isPrimaryContact?: boolean;
      reservationId?: string;
      roleTitle?: string;
    }
  ): Promise<GuestGroupRelationship | null> => {
    if (!guestGroupRelationshipService.isConfigured()) {
      return null;
    }
    
    try {
      const relationship = await guestGroupRelationshipService.linkGuestToGroup(guestId, groupId, options);
      
      if (relationship) {
        // Update local state
        setGuestGroupRelationships(prev => [...prev, relationship]);
        
        // Update guest's parentGroupId for backward compatibility
        updateGuestData(guestId, { 
          parentGroupId: groupId, 
          isPrimaryContact: options?.isPrimaryContact || false 
        });
        
        logAudit(`Guest ${guestId} linked to group ${groupId} automatically.`);
        addNotification(`Guest linked to group successfully`, 'success', 'Group Management');
      }
      
      return relationship;
    } catch (error) {
      console.error('Error linking guest to group:', error);
      addNotification('Failed to link guest to group', 'error', 'Group Management');
      return null;
    }
  }, [updateGuestData, logAudit, addNotification]);

  const unlinkGuestFromGroup = useCallback(async (
    guestId: string, 
    groupId: string, 
    reason?: string
  ): Promise<boolean> => {
    if (!guestGroupRelationshipService.isConfigured()) {
      return false;
    }
    
    try {
      const success = await guestGroupRelationshipService.unlinkGuestFromGroup(guestId, groupId, { reason });
      
      if (success) {
        // Update local state
        setGuestGroupRelationships(prev => 
          prev.filter(r => !(r.guestId === guestId && r.groupId === groupId))
        );
        
        // Clear guest's parentGroupId if this was the primary group
        const guest = guests.find(g => g.id === guestId);
        if (guest && guest.parentGroupId === groupId) {
          updateGuestData(guestId, { 
            parentGroupId: undefined, 
            isPrimaryContact: false 
          });
        }
        
        logAudit(`Guest ${guestId} unlinked from group ${groupId}. Reason: ${reason || 'Not specified'}`);
        addNotification(`Guest unlinked from group successfully`, 'success', 'Group Management');
      }
      
      return success;
    } catch (error) {
      console.error('Error unlinking guest from group:', error);
      addNotification('Failed to unlink guest from group', 'error', 'Group Management');
      return false;
    }
  }, [guests, updateGuestData, logAudit, addNotification]);

  const value = {
    guests,
    guestFeedbacks,
    guestGroupRelationships,
    addGuest,
    updateGuest,
    updateGuestData,
    addGuestFeedback,
    getGuestsByGroup,
    getGuestsByCorporate,
    addGuestToGroup,
    addGuestToCorporate,
    removeGuestFromGroup,
    removeGuestFromCorporate,
    findMatchingGuest,
    setGuestBillingRouting,
    fetchGuestGroupRelationships,
    getGuestGroupSummary,
    linkGuestToGroup,
    unlinkGuestFromGroup
  };

  return (
    <GuestContext.Provider value={value}>
      {children}
    </GuestContext.Provider>
  );
};
