# Group Reservation Improvements - Documentation

## Overview

This migration significantly improves group reservation functionality by automatically creating guest profiles that match the number of rooms reserved and linking them to group profiles. This ensures proper CRM tracking and management of group bookings.

## What's New

### 1. Automatic Guest Profile Creation
- **Per-Room Guest Profiles**: Each room in a group booking now gets its own guest profile
- **Automatic Naming**: Guests are automatically named as "Guest Name (Room X)" for rooms beyond the first
- **Email Handling**: Email addresses are automatically adjusted as "guest+roomX@example.com" for uniqueness
- **Primary Contact**: The first room's guest is automatically marked as the primary contact

### 2. Group Profile Integration
- **Automatic Group Profile Creation**: When a group booking is created, a corresponding `group_profile` record is automatically created
- **CRM-Level Tracking**: Group profiles provide comprehensive CRM capabilities beyond operational `group_bookings`
- **Two-Way Linking**: Guest profiles are linked to group profiles via `parent_group_id`, and relationships are tracked in `guest_group_relationships`

### 3. Comprehensive Relationship Tracking
- **Guest-Group Relationships**: Each guest-group relationship is tracked in the `guest_group_relationships` table
- **Role Assignment**: Guests are assigned roles like "Primary Contact" or "Room X Guest"
- **Historical Tracking**: The system maintains complete history of guest-group relationships over time
- **Analytics Support**: Relationship data includes fields for revenue tracking, stay counts, and ADR calculations

### 4. Backward Compatibility
- **Data Migration**: Existing group bookings are automatically linked to group profiles
- **Trigger-Based Updates**: Changes to reservations automatically update guest-group relationships
- **Flexible Integration**: Works with both new and existing group booking workflows

## Database Schema Changes

### New/Updated Columns in `guests` Table
- `parent_group_id`: Links guest to their group profile
- `parent_corporate_id`: Links guest to corporate account (if applicable)
- `is_primary_contact`: Boolean flag for primary contact identification
- `billing_routing_profile_id`: Links to custom billing routing profile

### Tables Utilized
- `group_profiles`: CRM-level group management
- `guest_group_relationships`: Detailed relationship tracking
- `group_bookings`: Operational group booking management
- `guests`: Enhanced with group linking capabilities
- `reservations`: Existing table with group support

## API Changes

### Updated Function: `create_booking_atomic`

The main booking function now includes:

**New Return Fields:**
```json
{
  "success": true,
  "reservationIds": ["res1", "res2", "res3"],
  "guestIds": ["guest1", "guest2", "guest3"],
  "groupId": "GROUP123",
  "groupProfileId": "GP-GROUP123",
  "isGroup": true
}
```

**Behavior Changes:**
- Group bookings automatically create `group_profile` records
- Per-room guest profiles are created with proper `parent_group_id` linkage
- Guest-group relationships are automatically established
- Primary contact is automatically assigned to the first room

### New Function: `link_existing_group_guests_to_group_profile`

Links existing group bookings to group profiles for backward compatibility.

```sql
SELECT link_existing_group_guests_to_group_profile();
```

**Returns:**
```json
{
  "success": true,
  "message": "Existing group guests linked to group profiles"
}
```

### New Function: `get_group_profile_with_guests`

Retrieves comprehensive group profile data including all linked guests and reservations.

```sql
SELECT get_group_profile_with_guests('GP-GROUP123');
```

**Returns:**
```json
{
  "group_profile": { /* group profile details */ },
  "guests": [
    {
      "id": "guest1",
      "name": "John Doe",
      "email": "john@example.com",
      "is_primary_contact": true,
      "relationship": "Primary Contact"
    },
    {
      "id": "guest2", 
      "name": "John Doe (Room 2)",
      "email": "john+room2@example.com",
      "is_primary_contact": false,
      "relationship": "Room 2 Guest"
    }
  ],
  "reservations": [ /* reservation details */ ],
  "total_guests": 2,
  "total_reservations": 2
}
```

### New Trigger: `auto_link_guest_to_group_profile`

Automatically links guests to group profiles when reservations are created or updated.

**Fires on:**
- INSERT on reservations
- UPDATE of `group_booking_id`, `guest_id`, or `is_group` on reservations

## Usage Examples

### Creating a Group Booking

```typescript
// Example API call to create a group booking
const result = await supabase.rpc('create_booking_atomic', {
  p_idempotency_key: 'unique-booking-key',
  p_guest_name: 'John Doe',
  p_guest_email: 'john.doe@example.com',
  p_guest_phone: '+1234567890',
  p_guest_nationality: 'US',
  p_special_requests: 'High floor preference',
  p_check_in: '2026-08-15',
  p_check_out: '2026-08-18',
  p_items: JSON.stringify([
    { roomTypeName: 'Double', rate: 150.00, qty: 3 }
  ]),
  p_package_ids: [],
  p_guest_service_ids: [],
  p_package_total: 0,
  p_guest_svc_total: 0,
  p_tax_percent: 10,
  p_svc_charge_pct: 5,
  p_group_name: 'Acme Corporation Conference',
  p_tax_amount: 45.00,
  p_svc_amount: 22.50,
  p_addon_amount: 0,
  p_channel: 'Direct Website',
  p_status: 'Confirmed'
});

// Result will include:
// - 3 reservation IDs (one per room)
// - 3 guest IDs (one per room)
// - Group booking ID
// - Group profile ID
```

### Querying Group Profile with Guests

```typescript
// Get comprehensive group data
const groupData = await supabase.rpc('get_group_profile_with_guests', {
  p_group_profile_id: 'GP-GROUP123'
});

// Access the data
const { group_profile, guests, reservations, total_guests, total_reservations } = groupData;
```

### Finding Guest's Group Membership

```sql
-- Find all groups a guest belongs to
SELECT 
  gp.id as group_id,
  gp.name as group_name,
  gp.type as group_type,
  ggr.relationship_type,
  ggr.status as relationship_status,
  ggr.is_primary_contact,
  ggr.role_title
FROM guest_group_relationships ggr
JOIN group_profiles gp ON ggr.group_id = gp.id
WHERE ggr.guest_id = 'GUEST123'
  AND ggr.status = 'Active';
```

### Getting Group Members

```sql
-- Get all members of a group
SELECT 
  g.id as guest_id,
  g.name as guest_name,
  g.email as guest_email,
  g.is_primary_contact,
  ggr.role_title,
  ggr.status as relationship_status
FROM guests g
JOIN guest_group_relationships ggr ON g.id = ggr.guest_id
WHERE ggr.group_id = 'GP-GROUP123'
ORDER BY ggr.is_primary_contact DESC, g.name;
```

## Frontend Integration

### Updating Group Reservation UI Components

When displaying group reservations, you can now:

1. **Show Individual Guest Profiles**: Each room can have its own guest profile with individual ID uploads
2. **Display Primary Contact**: Clearly mark which guest is the primary contact
3. **Access Group CRM Data**: Use `get_group_profile_with_guests` for comprehensive group information
4. **Manage Guest Relationships**: Update guest-group relationships as needed

### Example React Component

```typescript
interface GroupReservationProps {
  groupId: string;
}

const GroupReservationDetails: React.FC<GroupReservationProps> = ({ groupId }) => {
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupData = async () => {
      const { data } = await supabase.rpc('get_group_profile_with_guests', {
        p_group_profile_id: groupId
      });
      setGroupData(data);
      setLoading(false);
    };
    fetchGroupData();
  }, [groupId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>{groupData.group_profile.name}</h2>
      <div className="guests-grid">
        {groupData.guests.map((guest) => (
          <GuestCard 
            key={guest.id}
            guest={guest}
            isPrimary={guest.is_primary_contact}
          />
        ))}
      </div>
    </div>
  );
};
```

## Migration and Testing

### Running the Migration

```bash
# Apply the migration to your Supabase project
supabase db push
```

Or run the SQL directly in your Supabase SQL Editor:
1. Open `supabase/migrations/110_improve_group_reservation_guest_profiles.sql`
2. Copy the entire contents
3. Paste in Supabase SQL Editor
4. Execute

### Testing the Implementation

Use the provided test script: `test_group_reservation_improvement.sql`

1. Run the test queries in order
2. Verify the expected results
3. Check that guest profiles are created correctly
4. Confirm group profile linking works
5. Validate guest-group relationships

### Verification Queries

```sql
-- Count group profiles created
SELECT COUNT(*) as total_group_profiles 
FROM group_profiles 
WHERE type = 'GroupReservation';

-- Count guests linked to groups
SELECT COUNT(*) as total_linked_guests 
FROM guests 
WHERE parent_group_id IS NOT NULL;

-- Count guest-group relationships
SELECT COUNT(*) as total_relationships 
FROM guest_group_relationships;

-- Check for orphaned guests (should return 0)
SELECT COUNT(*) as orphaned_guests
FROM guests g
JOIN reservations r ON g.id = r.guest_id
WHERE r.is_group = true 
  AND (g.parent_group_id IS NULL OR g.parent_group_id = '');
```

## Benefits

### 1. Improved CRM Capabilities
- Individual guest profiles for each room enable personalized service
- Group profiles provide centralized group management
- Historical tracking supports marketing and loyalty programs

### 2. Better Data Integrity
- Automatic linking reduces manual errors
- Primary contact identification ensures clear communication
- Relationship tracking provides audit trail

### 3. Enhanced Operations
- Per-room guest profiles support individual ID uploads
- Group-level billing and routing
- Comprehensive group analytics

### 4. Backward Compatibility
- Existing group bookings are automatically migrated
- No changes required to existing individual booking workflows
- Gradual adoption possible

## Troubleshooting

### Issue: Guest profiles not created for group bookings

**Solution:**
1. Check that the migration was applied successfully
2. Verify `create_booking_atomic` function is updated
3. Check for error logs in the reservation creation process

### Issue: Guests not linked to group profiles

**Solution:**
1. Run `SELECT link_existing_group_guests_to_group_profile();`
2. Check that the trigger `auto_link_guest_to_group_profile` exists
3. Verify `parent_group_id` column exists in guests table

### Issue: Primary contact not marked correctly

**Solution:**
1. Check that `is_primary_contact` column exists in guests table
2. Verify the logic in `create_booking_atomic` function
3. Ensure guest-group relationships are being created

## Future Enhancements

Potential improvements for future iterations:

1. **Bulk Guest Operations**: Support for bulk updating guest profiles within a group
2. **Group Communication**: Send communications to all group members or specific roles
3. **Advanced Analytics**: Revenue attribution per guest within groups
4. **Group Contracts**: Link group profiles to contract management
5. **Room Assignment**: Auto-assign specific rooms to group guests

## Support

For issues or questions about this migration:

1. Check the test script for expected behavior
2. Review the migration SQL for implementation details
3. Verify database schema changes were applied
4. Check Supabase logs for any error messages

---

**Migration Version**: 110  
**Date**: 2026-08-04  
**Compatibility**: Requires migration 001 (group_linking_system) and migration 049 (per_room_guest_profiles)