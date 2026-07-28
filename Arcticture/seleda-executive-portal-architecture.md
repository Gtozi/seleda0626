# SELEDA ERP — Executive Portal
### Architecture Base Prompt

> Module: Executive / Reporting
> Portal type: Executive
> Companion modules: every operational and Finance module (read-only aggregation), System Admin Portal

---

### 1. Purpose & Scope
A read-only, cross-department dashboard for ownership/management: consolidated KPIs, financial snapshots, and operational health — no transactional capability, purely aggregation and visualization of data owned by other modules.

**In scope (Phase 1 base):**
- Consolidated dashboard: occupancy, RevPAR/ADR/GOPPAR, F&B cost %, labor cost %, open work orders
- P&L snapshot and budget-vs-actual summary (pulled from Finance)
- Drill-down from a KPI tile to its source module's detail view
- Date range and department filtering
- Scheduled report export (PDF/email) for ownership

**Explicitly out of scope for base (later phases):**
- Multi-property comparison dashboards (Phase 3)
- Predictive/AI forecasting overlays (Phase 3 roadmap item)

---

### 2. Core Data Model
```
KPITile
├── TileID, Name, SourceModule, MetricType (Occupancy|RevPAR|ADR|GOPPAR|FoodCost%|LaborCost%|OpenWorkOrders|Custom), RefreshFrequency

DashboardView
├── ViewID, Name (e.g. "Owner Summary", "Department Health"), TileLayout[], DefaultDateRange

ReportSchedule
├── ScheduleID, RecipientEmail, Frequency (Daily|Weekly|Monthly), ReportContent (which tiles/sections), Format (PDF)

DrillDownLink
├── TileID, TargetModule, TargetView (e.g. Finance > Trial Balance, F&B > Cost Report)
```

---

### 3. Module Breakdown

**Consolidated Dashboard**
- Property-wide KPI tiles pulled from each department module's own reporting layer (this portal computes nothing new — it aggregates and displays)
- Standard tile set: occupancy/RevPAR/ADR/GOPPAR (Front Office), food/beverage cost % (F&B), labor cost % and headcount (HR), open work orders (Maintenance), pipeline value (Sales & Events)

**Financial Snapshot**
- P&L summary and Budget vs. Actual pulled directly from Finance & Accounting Portal — this portal does not maintain a parallel GL, it reads Finance's output

**Drill-Down Navigation**
- Every tile links back to its owning module's detail screen for a user with sufficient permission — Executive Portal itself has no edit capability

**Filtering**
- Date range (day/week/month/quarter/YTD) and department filter applied consistently across all tiles

**Scheduled Reporting**
- Recurring PDF/email digest to ownership/GM — configurable content and frequency

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Owner/Investor | Full dashboard read access, scheduled report subscription |
| General Manager | Full dashboard read access, drill-down to any module (subject to that module's own permission floor) |
| Department Manager | Dashboard view limited to own department's KPIs |
| System Admin (cross-module) | Configure tile set, dashboard layout, report schedules — no data edit rights (data lives in source modules) |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Finance & Accounting Portal | Inbound | P&L, budget vs. actual, KPI feeds |
| Front Office | Inbound | Occupancy, ADR, RevPAR |
| F&B | Inbound | Food/beverage cost %, cover count |
| HR & Payroll | Inbound | Headcount, labor cost % |
| Maintenance/Engineering | Inbound | Open work order count, OOO rooms |
| Sales & Events | Inbound | Pipeline value, booked group/event revenue |
| System Admin Portal | Bidirectional | Role/permission scoping for who sees what |

---

### 6. Non-Functional Requirements
- **Read-only by design**: this module must never be a write path back into source data — enforce at the architecture level, not just UI
- **Freshness**: KPI tiles should indicate their last-refreshed time so ownership isn't misled by stale data
- **Performance**: dashboard load should not depend on live recomputation across every module — aggregate from each module's own reporting layer
- **Access scoping**: department managers must not see other departments' KPIs unless explicitly granted

---

### 7. Suggested Build Sequence
1. KPI tile framework (generic, source-agnostic renderer)
2. Front Office + Finance feeds (occupancy, RevPAR/ADR, P&L) — the two most-requested views first
3. F&B and HR feeds (cost %, labor %)
4. Maintenance and Sales & Events feeds
5. Drill-down navigation to source modules
6. Date range / department filtering
7. Scheduled report export

---

*Base architecture prompt — extend with the actual KPI set ownership wants to see first and report distribution list as confirmed.*
