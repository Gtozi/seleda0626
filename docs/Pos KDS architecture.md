# SELEDA ERP — POS & KDS Architecture Prompt
### Extensible Outlet Framework with Kitchen Display System Integration

---

## 1. Purpose & Design Principles

This module defines a **single, reusable POS framework** that every current and future point-of-sale outlet (bar, restaurant, gift shop, spa retail, room service, minibar, laundry counter, etc.) plugs into as configuration — not as separately coded modules. It also defines a **Kitchen/Prep Display System (KDS)** that attaches automatically to any outlet whose items require preparation routing (kitchen, bar prep, pastry), and stays absent for outlets that don't need it (gift shop, spa retail).

**Core principles:**
- **Outlet = configuration, not code.** Adding a new POS type should never require touching the inventory, folio, tax, or GL engines.
- **Two inventory strategies only:** Recipe-based (BOM deduction) and SKU-based (direct stock deduction). Every outlet declares which one it uses; the engines branch on that flag, not on outlet identity.
- **KDS is conditional infrastructure, not a separate product.** It attaches to an outlet automatically when that outlet has "PrepRequired" items, using the same transaction stream as the POS — no duplicate order entry.
- **Offline-first.** Every terminal (POS or KDS) must queue and sync, given variable connectivity across East African properties.
- **One canonical transaction shape** flows from every outlet into folio, inventory, tax, and GL — regardless of outlet type.

---

## 2. Core Data Model

### 2.1 Outlet (the extensibility anchor)

| Field | Type | Purpose |
|---|---|---|
| OutletID | UUID | Primary key |
| OutletName | string | e.g. "Pool Bar", "Gift Shop", "Spa Retail" |
| OutletCategory | enum | `FoodBeverage`, `Retail`, `Service`, `Wellness`, `Other` — reporting grouping only |
| InventoryMode | enum | `Recipe` \| `SKU` |
| RequiresKDS | bool | Auto-derived (true if ≥1 catalog item has PrepRequired=true), but overridable |
| ChargeModes | array | `RoomFolio`, `Cash`, `Card`, `MobileMoney` |
| RequiresGuestLink | bool | true = guest-only (e.g. minibar); false = walk-ins allowed |
| TaxProfileID | FK → TaxProfile | VAT rate, service charge %, exemptions |
| GLMappingID | FK → GLMapping | Revenue/COGS/Tax account routing |
| ShiftReconciliationRequired | bool | Cash drawer close-out needed |
| Status | enum | `Active`, `Inactive`, `Suspended` |
| PropertyID | FK | Multi-property support (Phase 3) |

### 2.2 Catalog Item (per outlet)

| Field | Type | Purpose |
|---|---|---|
| ItemID | UUID | |
| OutletID | FK | Which outlet sells it |
| ItemName | string | |
| ItemType | enum | `Prepared` (needs KDS), `Retail` (no prep), `Service` (e.g. spa treatment) |
| PrepRequired | bool | Drives KDS routing |
| PrepStationID | FK → PrepStation (nullable) | Which station handles it (Kitchen, Bar Prep, Pastry) |
| RecipeID | FK (nullable) | If InventoryMode=Recipe |
| SKUID | FK (nullable) | If InventoryMode=SKU |
| Price | decimal | |
| TimeBasedPricingRuleID | FK (nullable) | Happy hour, seasonal, etc. |
| Modifiers | array | e.g. "no ice", "extra spicy" — passed through to KDS ticket |

### 2.3 Canonical POS Transaction (shared shape, every outlet)

```
TransactionID (UUID, idempotency key)
OutletID
DeviceID / TerminalID
StaffID
ShiftID
GuestID / RoomID (nullable — null = walk-in)
LineItems: [
  { ItemID, Qty, UnitPrice, Modifiers[], PrepRequired, PrepStationID }
]
Subtotal, TaxBreakdown[], ServiceCharge, Discounts[], Total
PaymentMethod, PaymentReference
Timestamp (client) / SyncedTimestamp (server)
Status: Draft → Confirmed → Posted → Voided/Comped (with ManagerOverrideID if so)
```

This is the single object every POS terminal type emits. A new POS type never invents its own transaction shape.

### 2.4 Prep Station & KDS Ticket (only relevant when RequiresKDS=true)

| Entity | Key Fields |
|---|---|
| **PrepStation** | StationID, StationName (Kitchen, Bar Prep, Pastry, Grill), OutletsServed[] (many-to-many — one station can serve multiple outlets, e.g. Bar Prep serves both Pool Bar and Restaurant Bar) |
| **KDSTicket** | TicketID, TransactionID (source), StationID, LineItems[] (only items routed to this station), CourseGrouping (starter/main/dessert), Status (`Fired`→`InProgress`→`Ready`→`Served`/`Recalled`), FireTime, TargetPrepTime, ActualCompleteTime, BumpedBy (StaffID) |

---

## 3. Transaction Pipeline (how any outlet, present or future, flows data)

```
[POS Terminal: any outlet type]
        │  emits Canonical Transaction (offline-queued if needed)
        ▼
[Transaction Bus] ── dedupes on TransactionID, validates against Outlet config
        │
        ├─→ IF LineItem.PrepRequired = true ──→ [KDS Router] ──→ routes to PrepStationID(s)
        │                                                         (splits ticket across stations
        │                                                          if one order spans e.g. Kitchen + Bar Prep)
        │
        ├─→ [Inventory Engine] — branches on Outlet.InventoryMode
        │        Recipe → deduct BOM components per LineItem
        │        SKU    → deduct stock directly per LineItem
        │
        ├─→ [Folio Engine] — only if GuestID/RoomID present and ChargeMode=RoomFolio
        │        Posts to Front Office folio in near-real-time (target <5 min lag)
        │
        ├─→ [Tax Engine] — applies TaxProfileID rules (VAT, service charge, exemptions)
        │
        └─→ [GL Posting Engine] — end-of-shift/day journal per GLMappingID
                 (Sales, Tax, Discounts, COGS, Payment Method breakdown)
```

Adding a new outlet means: register it in the Outlet table with the right InventoryMode/TaxProfile/GLMapping, add its catalog — it automatically flows through every one of these engines with zero new code.

---

## 4. KDS Subsystem — Detailed Design

### 4.1 When KDS attaches
KDS is not a standalone module — it's a display/workflow layer that activates automatically for any outlet with `RequiresKDS = true`. Gift shop, spa retail, laundry never see it. Restaurant, bar (cocktail prep), room service kitchen, and any future outlet with prepared items get it for free once their catalog items are flagged `PrepRequired`.

### 4.2 Ticket routing logic
- A single guest order can span multiple stations (e.g. a starter salad → Kitchen, a cocktail → Bar Prep). The KDS Router splits the parent Transaction into **one KDSTicket per PrepStationID**, all sharing the same TransactionID as a correlation key so stations can be "fired together" or staggered by course.
- **Course grouping**: tickets can be held and fired in sequence (starters fire immediately, mains fire when starters are bumped "Served") — configurable per outlet, not hardcoded.
- **Modifiers pass through verbatim** from POS to KDS ticket (no re-entry).

### 4.3 Ticket lifecycle & display behavior
`Fired` (new ticket appears, timer starts) → `InProgress` (station acknowledges) → `Ready` (bump button/bump bar) → `Served` (waiter/runner confirms delivery, closes loop back to POS for course-fire triggering) → optional `Recalled` (sent back, e.g. wrong item, with reason code).

- **Timer/SLA tracking**: TargetPrepTime per item/station feeds a color-coded aging display (green→yellow→red) — this is standard KDS behavior and should be configurable per station (grill tickets age faster than salad tickets).
- **Expo/pass-through view**: an optional aggregate screen showing all stations' tickets for a table, so an expediter can see when a full table's items are all `Ready` before sending servers out — valuable once you have >1 station.

### 4.4 KDS ↔ POS feedback loop
- Bumping a ticket to `Served` at KDS should update the parent Transaction's LineItem status, which Front-of-House POS can query (e.g. "mains for Table 4 are ready") — avoids servers walking to the kitchen to check.
- Void/86 (item unavailable) initiated from KDS should propagate back to POS in near-real-time so front-of-house doesn't keep selling an out-of-stock item.

### 4.5 Hardware/terminal notes
- KDS runs as a lightweight display client (tablet or dedicated screen) subscribing to the Transaction Bus filtered by StationID — same offline-first queuing as POS, since kitchens are often the worst-connectivity zone in a property.
- Physical bump bar support (single hardware button) should map to the same "bump ticket to next status" API as a touchscreen tap, so hardware choice doesn't affect the Ticket state machine.

---

## 5. Onboarding Workflow — Adding a New POS Type (the actual extensibility test)

From System Admin Portal, adding a brand-new outlet (e.g. a future "Poolside Snack Kiosk" or "Spa Treatment Room POS") should be:

1. Create Outlet record — name, category, InventoryMode, ChargeModes, TaxProfile (pick existing or create), GLMapping (pick existing or create), RequiresGuestLink.
2. Build its Catalog — items, each flagged Recipe/SKU and PrepRequired or not.
3. If any item is PrepRequired → assign PrepStationID (existing station, e.g. route poolside snacks to the Kitchen station rather than building a new one) — **KDS activates automatically, no config needed beyond this.**
4. Assign staff roles/RBAC permissions to operate the outlet.
5. Register terminal/DeviceID(s) against OutletID (many terminals can map to one outlet).
6. Go live.

No developer involvement, no schema migration, no new inventory/folio/tax/GL logic — this is the concrete test for whether the framework is genuinely extensible.

---

## 6. Integration Points Summary

| System | Integration |
|---|---|
| Front Office (Folio) | Real-time charge posting for any RoomFolio-enabled outlet |
| Procurement & Stores | Unified inventory ledger regardless of Recipe/SKU mode |
| Finance & Accounting | Standardized daily revenue journal per outlet, feeding P&L rollups already in Operations Manager Portal |
| Payment Gateway (Chapa/Flutterwave, Phase 1) | Single central payment service consumed by all outlets — no per-outlet gateway integration |
| Tax Engine (ERCA compliance, Phase 2) | TaxProfile-driven, supports differing VAT/service charge treatment across outlet categories |
| Executive/Operations Manager Portal | Per-outlet status cards and KPI rollup, using the same OutletID grouping |

---

## 7. Phasing Recommendation

- **Phase 1 (build now):** Outlet Registry, Canonical Transaction schema, Inventory strategy pattern (Recipe/SKU), basic Folio + GL posting, offline queue.
- **Phase 2:** Full KDS subsystem (ticket routing, station management, timer/aging), Tax Profile engine tied to ERCA compliance work, shift reconciliation reporting.
- **Phase 3:** Multi-station expo view, recall/86 propagation, multi-property outlet templates (clone an Outlet config across properties for Phase 3 multi-tenancy).

---

*This spec is designed to sit alongside your existing 7-section module architecture prompts (F&B, Front Office, etc.) as the shared Outlet/POS/KDS layer those modules integrate against, rather than duplicating POS logic inside each department module.*