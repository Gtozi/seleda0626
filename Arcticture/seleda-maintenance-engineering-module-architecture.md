# SELEDA ERP — Maintenance & Engineering Module
### Architecture Base Prompt

> Module: Operations Core (Support)
> Portal type: Operational
> Companion modules: Housekeeping, Front Office, Finance & Accounting Portal

---

### 1. Purpose & Scope
Manages work orders for room and property equipment issues, preventive maintenance schedules, and asset/equipment tracking — keeping rooms bookable and infrastructure (generators, water systems, HVAC) reliable.

**In scope (Phase 1 base):**
- Work order creation, assignment, and resolution (reactive maintenance)
- Preventive maintenance (PM) scheduling by asset/equipment
- Equipment/asset register (property infrastructure, not guest-room furniture — that's Fixed Assets in Finance)
- Spare parts stock at basic level
- Room OOO/OOS status trigger and release

**Explicitly out of scope for base (later phases):**
- IoT sensor integration (generator fuel level, water tank sensors) — manual log entry in Phase 1
- Full parts inventory costing — basic quantity tracking only, costing lives in Finance if needed

---

### 2. Core Data Model
```
WorkOrder
├── WorkOrderID, Source (Housekeeping Flag|Guest Complaint|Staff Report|PM Trigger), Location (Room|CommonArea|BackOfHouse), Description, Priority, AssignedTo, Status (Open|InProgress|OnHold|Resolved|Verified)

Asset
├── AssetID, Name, Category (HVAC|Generator|WaterSystem|Elevator|Kitchen Equipment|Other), Location, InstallDate, Condition, Vendor/Warranty

PMSchedule
├── ScheduleID, AssetID, Frequency (Daily|Weekly|Monthly|Quarterly|Annual), LastPerformed, NextDue, ChecklistTemplate

PMLog
├── LogID, ScheduleID, PerformedBy, Date, Findings, ActionTaken, WorkOrderRaised(nullable)

SparePart
├── PartID, Name, LinkedAssetCategory, CurrentQty, ReorderPoint, Location

RoomStatusTrigger
├── RoomID, Status (OOO|OOS), LinkedWorkOrderID, SetBy, ReleasedBy
```

---

### 3. Module Breakdown

**Work Order Management**
- Intake from Housekeeping maintenance flags, guest complaints (via Front Office), or direct staff report
- Priority triage (Safety/Urgent > Guest-impacting > Routine)
- Assignment to technician, status tracking through resolution
- Verification step (supervisor confirms fix) before room OOO/OOS is released back to Front Office

**Preventive Maintenance (PM)**
- Recurring schedule per asset/equipment category with checklist template
- Auto-generates a task when due; overdue PM flagged to Engineering Manager
- Findings during PM that require repair auto-raise a work order

**Asset Register**
- Core infrastructure equipment log — not guest-room furniture (Finance Fixed Assets owns that)
- Condition tracking, warranty/vendor reference for service calls

**Spare Parts**
- Basic quantity tracking with reorder point; requisition/purchase handled via Finance AP linkage if formal procurement needed

**Room Status Integration**
- Work order affecting a guest room sets OOO/OOS in Front Office automatically; release requires verification sign-off

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Technician | View/update assigned work orders, log PM completion |
| Maintenance Supervisor | Assign/prioritize work orders, verify completion, release room status |
| Chief Engineer | PM schedule config, asset register management, spare parts reorder approval |
| Front Office / Housekeeping (cross-module) | Raise work orders, view status of rooms affecting availability |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Front Office | Bidirectional | Room OOO/OOS status set and released |
| Housekeeping | Inbound | Maintenance flags raised during cleaning |
| Finance & Accounting Portal | Outbound | Spare parts purchase requests (via AP), asset condition for capex planning |
| Executive Portal | Outbound | Open work order count, average resolution time, OOO room count |

---

### 6. Non-Functional Requirements
- **Auditability**: work order status changes and PM completions logged with actor and timestamp
- **Performance**: room OOO/OOS status change must reflect in Front Office immediately
- **Localization**: work order descriptions and checklists in English + Amharic/Tigrinya
- **Reliability context**: given generator/water system dependency common on Ethiopian properties, PM scheduling for these categories should be treated as high-priority defaults, not optional

---

### 7. Suggested Build Sequence
1. Work order creation, assignment, resolution, verification
2. Room OOO/OOS trigger and release tied to Front Office
3. Asset register
4. PM schedule + checklist + auto-task generation
5. Spare parts basic tracking
6. Reporting (open orders, resolution time) to Executive Portal

---

*Base architecture prompt — extend with actual equipment inventory, PM checklist content, and technician staffing as confirmed.*
