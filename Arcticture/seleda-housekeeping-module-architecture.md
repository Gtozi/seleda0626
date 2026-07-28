# SELEDA ERP — Housekeeping Module
### Architecture Base Prompt

> Module: Operations Core
> Portal type: Operational
> Companion modules: Front Office, Maintenance/Engineering, Executive Portal

---

### 1. Purpose & Scope
Manages room cleaning status, staff task assignment, linen/amenity stock at the floor level, and lost & found — keeping room availability accurate for Front Office in real time.

**In scope (Phase 1 base):**
- Room status board (Dirty/Clean/Inspected/OOO/OOS)
- Task assignment to housekeeping staff (room-based and turn-down/special requests)
- Linen and amenity par-level tracking per floor/store
- Lost & found log
- Maintenance issue flagging (handoff to Maintenance module)

**Explicitly out of scope for base (later phases):**
- Mobile push notification to staff devices — task list is pull/refresh in Phase 1
- Automated staff scheduling/roster optimization

---

### 2. Core Data Model
```
RoomStatus
├── RoomID, CleaningStatus (Dirty|InProgress|Clean|Inspected), OccupancyStatus (link from Front Office), LastUpdated, UpdatedBy

Task
├── TaskID, RoomID, Type (Daily|Turndown|SpecialRequest|DeepClean), AssignedTo, Status (Pending|InProgress|Done|Verified), Priority

StaffAssignment
├── StaffID, Shift, AssignedRooms[], FloorSection

LinenAmenityStock
├── ItemID, Name, Category (Linen|Amenity|Cleaning Supply), Location (FloorStore|MainStore), ParLevel, CurrentQty

LostFoundItem
├── ItemID, Description, RoomFound, DateFound, Status (Stored|ClaimedByGuest|Disposed), GuestContact(optional)

MaintenanceFlag
├── FlagID, RoomID, Description, RaisedBy, Status (Open|SentToMaintenance|Resolved)
```

---

### 3. Module Breakdown

**Room Status Board**
- Real-time grid view by floor: occupancy + cleaning status combined
- Status change triggers Front Office availability update immediately
- Inspection sign-off step before a room is bookable again (supervisor role)

**Task Assignment**
- Auto-generate daily task list from occupancy (stay-over, checkout, arrival prep)
- Manual task creation for turndown/special requests
- Task completion marks room "Clean" pending inspection

**Linen & Amenity Stock**
- Floor-store par levels with requisition from main store when below threshold
- Usage tracked against rooms cleaned (basic consumption estimate, not full costing — that lives in Finance/Stores if needed)

**Lost & Found**
- Log with photo reference (optional), status tracking through claim or disposal, retention period alert

**Maintenance Handoff**
- Any issue found during cleaning (broken fixture, AC fault) raised as a flag, routed to Maintenance module, room marked OOS if unit unusable

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Room Attendant | View assigned tasks, mark complete, log maintenance flag |
| Floor Supervisor | Inspect/verify rooms, reassign tasks, manage floor stock requisition |
| Executive Housekeeper | Full room status override, staff assignment, par-level config |
| Front Office (cross-module) | Read access to room status board |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Front Office | Bidirectional | Room occupancy status in / cleaning status out |
| Maintenance/Engineering | Outbound | Maintenance flags from rooms |
| Executive Portal | Outbound | Room turnaround time, OOO room count |
| System Admin Portal | Bidirectional | Staff/role config, floor/room mapping |

---

### 6. Non-Functional Requirements
- **Auditability**: status changes and inspections logged with actor and timestamp
- **Performance**: room status board must update in near real time across all viewing portals
- **Offline/connectivity**: task list should be viewable/updatable with brief connectivity gaps (floor-level Wi-Fi variability)
- **Localization**: staff-facing task labels in English + Amharic/Tigrinya

---

### 7. Suggested Build Sequence
1. Room status board + occupancy sync with Front Office
2. Daily task auto-generation + manual task creation
3. Inspection sign-off workflow
4. Linen/amenity par-level tracking + requisition
5. Lost & found log
6. Maintenance flag handoff
7. Staff assignment by floor/shift

---

*Base architecture prompt — extend with actual floor plan, staffing structure, and par-level quantities as confirmed.*
