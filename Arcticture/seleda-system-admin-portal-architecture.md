# SELEDA ERP — System Admin Portal
### Architecture Base Prompt

> Module: System Administration
> Portal type: Admin
> Companion modules: every module (cross-cutting) — Finance, Front Office, F&B, Housekeeping, Maintenance, HR, Procurement, Sales & Events, Executive Portal

---

### 1. Purpose & Scope
The control plane for the whole ERP: users, roles/permissions, property/department configuration, and system-wide reference data (tax codes, currencies, room types, GL mappings) that every other module depends on but doesn't own itself.

**In scope (Phase 1 base):**
- User account management and authentication
- Role & permission (RBAC) configuration across all modules
- Property/department/outlet structure setup
- Shared reference data: tax codes, currencies, units of measure, room types
- System-wide audit trail viewer
- Module-level feature toggles

**Explicitly out of scope for base (later phases):**
- Multi-property tenancy administration (Phase 3)
- SSO/enterprise identity provider integration — local auth in Phase 1

---

### 2. Core Data Model
```
User
├── UserID, Name, Email/Username, PasswordHash, Status (Active|Suspended|Terminated), LinkedEmployeeID(nullable, from HR)

Role
├── RoleID, Name, Module, PermissionSet[] (per-module CRUD + approval-threshold flags)

UserRoleAssignment
├── UserID, RoleID, Scope (Department|Outlet|Property-wide)

PropertyConfig
├── PropertyID, Name, Departments[], Outlets[], Currency, Timezone

ReferenceData
├── TaxCode, CurrencyList, UnitOfMeasure, RoomTypeList, GLAccountMappingDefaults

AuditLogEntry
├── EntryID, Actor, Module, Action, Before/AfterState, Timestamp
```

---

### 3. Module Breakdown

**User & Access Management**
- Account creation, password policy, suspension/termination (synced from HR employee status where linked)
- Session management, forced logout, login attempt lockout

**Role & Permission Configuration**
- Define roles per module (mirrors the RBAC tables in every other module's own doc) — this is where those roles are actually created and assigned, not redefined
- Scope roles to department/outlet/property-wide as needed (e.g. Floor Supervisor scoped to specific floors)

**Property & Department Structure**
- Define departments, outlets, floors/rooms structure that Front Office, Housekeeping, F&B, etc. all reference
- Single source of truth — other modules read this, none duplicate it

**Shared Reference Data**
- Tax codes (VAT, TOT, withholding), currency list, units of measure, default GL account mappings used by Finance and any revenue module
- Central room type list referenced by Front Office and F&B (room service, minibar tie-ins)

**Audit Trail Viewer**
- Cross-module log viewer (read-only) surfacing every logged action from every department module in one place
- Filter by module, actor, date range — supports the auditability requirement every other module's doc references

**Feature Toggles**
- Enable/disable modules or specific workflows per property (useful during phased rollout)

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| IT/Systems Admin | User account management, role assignment, feature toggles |
| General Manager | Full read access to audit trail, property config changes, role approval |
| Department Managers (cross-module) | Manage users/roles scoped to own department only |
| Auditor (read-only) | Full audit trail read access, no config changes |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| All operational modules | Outbound | Role definitions, permission sets, reference data (tax codes, room types, departments) |
| HR & Payroll | Bidirectional | Employee record link to user account, status sync on termination |
| Executive Portal | Outbound | System health/usage summary |
| Finance & Accounting Portal | Outbound | Tax code and GL account mapping defaults |

---

### 6. Non-Functional Requirements
- **Security**: password policy, session timeout, and login lockout are non-negotiable defaults, not optional config
- **Auditability**: every permission change and user status change logged — this module is the audit trail's own source of truth for access changes
- **Single source of truth**: department/outlet/room structure and reference data defined once here; every other module reads, none re-defines
- **Availability**: this module gates login for the whole system, so it needs to be the most reliable component on the platform

---

### 7. Suggested Build Sequence
1. User authentication + account management
2. Role/permission framework (generic, module-agnostic engine)
3. Property/department/outlet structure config
4. Shared reference data (tax codes, currencies, room types, UOM)
5. Per-module role definitions (populated as each department module ships)
6. Cross-module audit trail viewer
7. Feature toggles for phased rollout

---

*Base architecture prompt — extend with actual department/outlet structure, initial role list, and password/security policy as confirmed.*
