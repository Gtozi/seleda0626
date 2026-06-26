# Automatic Guest-to-Group Profile Linking System - Gap Analysis

**Date:** June 12, 2026  
**Analysis Scope:** Complete Hotel PMS/ERP Application  
**Objective:** Implement production-ready automatic guest-to-group profile relationship system

---

## Executive Summary

The current system has basic group booking and corporate account functionality but lacks a comprehensive automatic guest-to-group profile linking system. The existing implementation relies on manual parent-child relationships in guest profiles without historical tracking, automation, or proper data integrity enforcement.

**Critical Gaps Identified:**
- No dedicated GroupProfile entity for unified group management
- No GuestGroupRelationship table for historical relationship tracking
- No automatic linking triggers on reservation operations
- No centralized group state management
- No enhanced UI for group relationship visualization
- No group analytics and reporting
- No audit logging for group operations
- No data integrity validation for group relationships

---

## Current State Analysis

### 1. Database Schema (supabase/schema.sql)

#### Existing Tables:
- **group_bookings**: Basic group booking information (id, group_name, contact_name, room_type_needed, room_count, dates, discount, status)
- **corporate_accounts**: Basic corporate account information (id, company_name, contact_person, discount, active_bookings, unpaid_balance)
- **reservations**: Has `group_booking_id` and `booking_group_id` fields for group association
- **guests**: Has NO group relationship fields in database schema (only in TypeScript types)

#### Missing Tables:
- **group_profiles**: No dedicated table for comprehensive group profile management
- **guest_group_relationships**: No table for tracking historical guest-group relationships with metadata
- **group_audit_log**: No dedicated audit table for group operations

#### Missing Indexes:
- No indexes on `group_booking_id` in reservations table (partial index exists)
- No indexes on guest-group relationship fields
- No composite indexes for group-related queries

#### Missing Constraints:
- No foreign key constraints between reservations and group_profiles
- No unique constraints to prevent duplicate group profiles
- No check constraints for group status transitions

---

### 2. Type Definitions (src/types/erp.ts)

#### Existing Types:
```typescript
interface Guest {
  parentGroupId?: string;        // Single parent group (current only)
  parentCorporateId?: string;   // Single parent corporate (current only)
  isPrimaryContact?: boolean;   // Primary contact flag
}

interface GroupBooking {
  id: string;
  groupName: string;
  contactName: string;
  // Basic fields only - missing enhanced profile fields
}

interface CorporateAccount {
  id: string;
  companyName: string;
  // Basic fields only - missing enhanced profile fields
}
```

#### Missing Types:
- **GroupProfile**: No comprehensive group profile type with enhanced fields
- **GuestGroupRelationship**: No type for historical relationship tracking
- **GroupRelationshipType**: No enum for relationship types (Group, Corporate, TravelAgent, TourOperator, Crew, Conference, Event, LongTermContract)
- **GroupAnalytics**: No type for group analytics data
- **GroupAuditEvent**: No type for group-specific audit events

---

### 3. Context & State Management

#### Existing Contexts:
- **GuestContext**: Has basic manual linking functions
  - `addGuestToGroup(guestId, groupId, isPrimary)`
  - `removeGuestFromGroup(guestId)`
  - `getGuestsByGroup(groupId)`
  - **Missing:** Automatic linking, historical tracking, relationship metadata

- **ReservationContext**: Has group booking creation
  - `addGroupBooking(group)`
  - `updateGroupBookingStatus(id, status)`
  - **Missing:** Automatic guest linking on group operations

#### Missing Contexts:
- **GroupContext**: No centralized group profile management context
- **GroupRelationshipContext**: No context for managing guest-group relationships
- **GroupAnalyticsContext**: No context for group analytics data

---

### 4. Frontend Components

#### Existing Components:
- **CRMModule**: Has manual group/corporate linking UI
  - Manual guest-to-group linking
  - Manual guest-to-corporate linking
  - **Missing:** Automatic linking display, relationship history, group profile view

- **ReservationsModule**: Has group booking creation
  - Creates group bookings
  - Links reservations to groups
  - **Missing:** Automatic guest profile creation and linking

#### Missing Components:
- **GroupProfileView**: No dedicated group profile management UI
- **GuestGroupRelationshipSection**: No UI section showing guest's group relationships
- **GroupAnalyticsDashboard**: No group analytics and reporting UI
- **GroupRelationshipTimeline**: No visual timeline of guest's group membership history
- **GroupMemberList**: No UI showing all members of a group with their relationship details

---

### 5. Backend Services

#### Existing Services (src/services/supabaseService.ts):
- Basic CRUD for `group_bookings`
- Basic CRUD for `corporate_accounts`
- **Missing:** Group profile service, guest-group relationship service, automation service

#### Missing Services:
- **groupProfileService**: No service for comprehensive group profile management
- **guestGroupRelationshipService**: No service for managing guest-group relationships
- **groupAutomationService**: No service for automatic linking logic
- **groupAnalyticsService**: No service for group analytics calculations
- **groupAuditService**: No service for group audit logging

---

### 6. API Endpoints (server.ts)

#### Existing Endpoints:
- `POST /api/group-bookings` - Create group booking
- `PATCH /api/group-bookings/:id` - Update group booking status
- **Missing:** Group profile CRUD, relationship management, automation triggers

#### Missing Endpoints:
- `POST /api/group-profiles` - Create group profile
- `GET /api/group-profiles/:id` - Get group profile
- `PATCH /api/group-profiles/:id` - Update group profile
- `DELETE /api/group-profiles/:id` - Delete group profile
- `GET /api/group-profiles/:id/members` - Get group members
- `GET /api/group-profiles/:id/analytics` - Get group analytics
- `POST /api/guest-group-relationships` - Create guest-group relationship
- `GET /api/guest-group-relationships/:guestId` - Get guest's group relationships
- `PATCH /api/guest-group-relationships/:id` - Update relationship
- `DELETE /api/guest-group-relationships/:id` - End relationship
- `POST /api/group-profiles/:id/link-guest` - Link guest to group (automatic)
- `POST /api/group-profiles/:id/unlink-guest` - Unlink guest from group
- `GET /api/group-profiles/:id/history` - Get group membership history

---

### 7. Automation Triggers

#### Existing Triggers:
- None - No automatic linking logic exists

#### Missing Triggers:
- **Reservation Creation**: Automatically link guest to group when reservation is created with group association
- **Reservation Modification**: Update guest-group relationship when reservation group changes
- **Group Assignment**: Automatically link all existing guests when group is assigned to reservation
- **Check-In**: Verify and create guest-group relationships at check-in
- **Check-Out**: Update relationship end date and calculate metrics
- **Guest Merge**: Consolidate group relationships when guest profiles are merged
- **Data Import**: Create relationships during bulk data import

---

### 8. Data Integrity & Validation

#### Existing Validation:
- Basic TypeScript type checking
- **Missing:** Database-level constraints, business rule validation, duplicate prevention

#### Missing Validation:
- No duplicate group profile prevention
- No duplicate guest-group relationship prevention
- No foreign key validation before saving
- No circular relationship detection
- No relationship overlap validation
- No status transition validation for groups

---

### 9. Audit Logging

#### Existing Audit:
- General audit_events table exists
- **Missing:** Group-specific audit logging, relationship change tracking

#### Missing Audit Events:
- Group assignment
- Group removal
- Group profile changes
- Guest-group relationship creation
- Guest-group relationship termination
- Group status changes
- Guest merge events affecting group relationships

---

### 10. Reporting & Analytics

#### Existing Reports:
- None specific to groups

#### Missing Reports:
- Group Production Report
- Corporate Production Report
- Revenue by Group Report
- Room Nights by Group Report
- Top Guests per Group Report
- Group Retention Analysis Report
- Repeat Guest Analysis by Group Report
- Group ADR Analysis
- Group Lifetime Value Analysis

---

## Required Implementation Components

### Phase 1: Database Schema (HIGH PRIORITY)

1. **Create group_profiles table**
   - Comprehensive group profile fields
   - Enhanced metadata (organizer, billing, credit limits, contracts)
   - Status management
   - Indexes for performance

2. **Create guest_group_relationships table**
   - Historical relationship tracking
   - Relationship metadata (start date, end date, type, status)
   - Reservation linkage
   - Analytics fields (revenue, room nights, stays count)
   - Composite indexes for queries

3. **Update reservations table**
   - Add proper foreign key to group_profiles
   - Add indexes for group-related queries
   - Add constraints for data integrity

4. **Create group_audit_log table**
   - Dedicated audit for group operations
   - Relationship change tracking
   - Performance indexes

### Phase 2: Backend Services (HIGH PRIORITY)

1. **groupProfileService**
   - CRUD operations for group profiles
   - Duplicate detection
   - Validation logic
   - Supabase integration

2. **guestGroupRelationshipService**
   - Relationship creation/management
   - Historical tracking
   - Automatic linking logic
   - Analytics calculation

3. **groupAutomationService**
   - Trigger-based automatic linking
   - Event handlers for reservation operations
   - Guest merge handling
   - Data import processing

4. **groupAnalyticsService**
   - Revenue calculation by group
   - Room night tracking
   - Guest retention metrics
   - ADR calculation

5. **groupAuditService**
   - Audit event logging
   - Relationship change tracking
   - Compliance reporting

### Phase 3: API Endpoints (MEDIUM PRIORITY)

1. **Group Profile Endpoints**
   - Full CRUD operations
   - Member listing
   - Analytics retrieval
   - History retrieval

2. **Guest-Group Relationship Endpoints**
   - Relationship management
   - Bulk operations
   - Historical queries
   - Automatic linking triggers

3. **Automation Endpoints**
   - Manual trigger for linking
   - Bulk re-linking operations
   - Data integrity checks

### Phase 4: Frontend Context (MEDIUM PRIORITY)

1. **GroupContext**
   - Centralized group state
   - Group profile operations
   - Member management
   - Analytics data

2. **GroupRelationshipContext**
   - Relationship state management
   - Historical data
   - Automatic linking triggers

3. **Enhanced GuestContext**
   - Add group relationship data
   - Add relationship history
   - Add group analytics

### Phase 5: UI Components (MEDIUM PRIORITY)

1. **GroupProfileView Component**
   - Comprehensive group profile display
   - Member list with relationship details
   - Analytics dashboard
   - Action buttons (link/unlink guests)

2. **GuestGroupRelationshipSection**
   - Display in guest profile
   - Current group
   - Previous groups
   - Relationship metrics
   - Timeline view

3. **GroupAnalyticsDashboard**
   - Revenue charts
   - Room night statistics
   - Top producing guests
   - Retention analysis

4. **Navigation Links**
   - Guest → Group profile
   - Group → Guest members
   - Reservation → Group profile
   - Group → Reservations

### Phase 6: Validation & Testing (MEDIUM PRIORITY)

1. **Validation Rules**
   - Duplicate prevention
   - Foreign key validation
   - Business rule enforcement
   - Data integrity checks

2. **Automated Tests**
   - Unit tests for services
   - Integration tests for API
   - E2E tests for automation
   - Performance tests for queries

### Phase 7: Reporting (LOW PRIORITY)

1. **Report Components**
   - Group Production Report
   - Corporate Production Report
   - Revenue by Group
   - Room Nights by Group
   - Top Guests per Group
   - Group Retention Analysis
   - Repeat Guest Analysis by Group

---

## Implementation Priority Matrix

| Component | Priority | Complexity | Dependencies |
|-----------|----------|------------|--------------|
| Database Schema (group_profiles) | HIGH | Medium | None |
| Database Schema (guest_group_relationships) | HIGH | Medium | None |
| Backend Services (groupProfileService) | HIGH | Medium | Database Schema |
| Backend Services (guestGroupRelationshipService) | HIGH | High | Database Schema |
| API Endpoints (Group Profile) | MEDIUM | Low | Backend Services |
| API Endpoints (Relationships) | MEDIUM | Medium | Backend Services |
| GroupContext | MEDIUM | Medium | API Endpoints |
| Enhanced GuestContext | MEDIUM | Low | GroupContext |
| GroupProfileView Component | MEDIUM | High | GroupContext |
| GuestGroupRelationshipSection | MEDIUM | Medium | Enhanced GuestContext |
| Validation Rules | MEDIUM | Medium | Backend Services |
| Automated Tests | LOW | High | All Components |
| GroupAnalyticsDashboard | LOW | High | GroupContext |
| Reporting Components | LOW | High | GroupContext |
| Audit Logging | LOW | Medium | Backend Services |

---

## Risk Assessment

### High Risks:
1. **Data Migration**: Existing guest-group relationships stored in guest.parentGroupId need migration to new guest_group_relationships table
2. **Performance**: Historical relationship queries could become slow without proper indexing
3. **Data Consistency**: Dual storage (guest.parentGroupId + guest_group_relationships) could lead to inconsistencies during transition

### Medium Risks:
1. **Automation Complexity**: Automatic linking triggers could have edge cases causing incorrect relationships
2. **UI Complexity**: New UI components could overwhelm users if not designed carefully
3. **API Breaking Changes**: New endpoints may require frontend refactoring

### Low Risks:
1. **Testing Coverage**: Comprehensive test suite needed to prevent regressions
2. **Documentation**: New features require updated documentation
3. **Training**: Staff may need training on new group management workflow

---

## Success Criteria

1. **Automatic Linking**: 100% of guests with group reservations are automatically linked to appropriate group profiles
2. **Historical Tracking**: All guest-group relationships are tracked with start/end dates and metadata
3. **Data Integrity**: No duplicate group profiles or relationships exist
4. **Performance**: Group-related queries complete within 200ms for typical datasets
5. **User Adoption**: Staff can manage group relationships without manual intervention
6. **Reporting Accuracy**: Group analytics reports match manual calculations within 1%
7. **Audit Compliance**: All group operations are logged with sufficient detail for audits

---

## Next Steps

1. **Immediate**: Begin database schema implementation (Phase 1)
2. **Week 1**: Complete backend services (Phase 2)
3. **Week 2**: Implement API endpoints (Phase 3)
4. **Week 3**: Build frontend context and UI components (Phase 4-5)
5. **Week 4**: Add validation, testing, and reporting (Phase 6-7)
6. **Week 5**: Data migration and deployment

---

**Document Status:** Complete  
**Prepared By:** Cascade AI System  
**Version:** 1.0
