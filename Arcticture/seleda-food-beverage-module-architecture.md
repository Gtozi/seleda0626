# SELEDA ERP — Food & Beverage Module
## Architecture Base Prompt

> Module: Operations Core (Revenue-generating sub-module)
> Portal type: Operational, with Executive Portal KPI feed and Finance & Accounting GL integration
> Companion modules: Finance & Accounting Portal, Operations Core (Front Office/Housekeeping), Executive Portal

---

## 1. Purpose & Scope

The Food & Beverage (F&B) module manages every outlet on property that sells food or drink — restaurant, bar, room service, banquet/events, minibar — from point of sale through to inventory depletion, recipe costing, and GL posting. It is the primary source of departmental revenue and cost data feeding the P&L's "Food & Beverage" department line in the Finance & Accounting Portal.

**In scope (Phase 1 base):**
- Point of Sale (POS) for multiple outlets (restaurant, bar, room service, banquet)
- Menu & recipe engineering (recipe cost, plate cost, menu pricing)
- Inventory & stores management (ingredients, beverages, par levels, requisitions)
- Purchasing tied to F&B (linked to AP in Finance module)
- Guest folio posting (room charge routing to PMS/Front Office)
- Banquet & event order (BEO) management
- Waste, comp, and void tracking with reason codes
- F&B cost reporting (food cost %, beverage cost %, contribution margin)

**Explicitly out of scope for base (later phases):**
- Live kitchen display system (KDS) hardware integration — stub the interface
- Supplier EDI/live price feed — manual price list update in Phase 1
- Multi-outlet central kitchen/commissary allocation across properties (Phase 3, multi-property)

---

## 2. Core Data Model

```
Outlet
├── OutletID, Name, Type (Restaurant|Bar|RoomService|Banquet|Minibar), OperatingHours, RevenueCenterCode (GL link)

MenuItem
├── ItemID, OutletID(s), Name, Category, SellingPrice, TaxCode, IsActive, POSButtonGroup

Recipe
├── RecipeID, MenuItemID, Yield, Portions
└── RecipeLine[]
    ├── IngredientID, Quantity, Unit, CostAtTimeOfCosting

Ingredient (Inventory Item)
├── ItemID, Name, Category, UnitOfMeasure, ParLevel, ReorderPoint, CurrentCost (weighted avg), Supplier(s)

StockLocation (Store/Cellar/Outlet stock)
├── LocationID, Name, Type (MainStore|OutletStore|Cellar|Minibar)

StockTransaction
├── TransactionID, ItemID, LocationID, Type (Receipt|Requisition|Transfer|WastageWriteoff|StockCount), Quantity, Date, ReferenceDoc

Requisition
├── RequisitionID, FromLocation, ToOutlet, Lines[], Status (Draft|Approved|Fulfilled), RequestedBy

Order (POS ticket / BEO)
├── OrderID, OutletID, TableOrRoomOrEventID, Lines[], Status (Open|Sent|Served|Paid|Void)
├── ServerID, GuestFolioID (nullable — for room charge routing)
└── OrderLine[]
    ├── MenuItemID, Quantity, UnitPrice, Discount, VoidReason(nullable), CompReason(nullable)

BanquetEventOrder (BEO)
├── BEOID, EventName, Date, Client, GuestCount, MenuPackage, RoomSetup, PaymentTerms, Status

WastageLog
├── LogID, ItemID, Quantity, Reason (Spoilage|Breakage|Overproduction|QualityReject), LoggedBy, Date

StockCount (Physical Inventory)
├── CountID, LocationID, Date, ExpectedQty, CountedQty, VarianceValue, ReconciledBy
```

---

## 3. Module Breakdown

### 3.1 Point of Sale (POS)
- Multi-outlet, table/tab-based ordering with course firing (starters/mains/dessert timing)
- Split bill, merge bill, transfer between tables/outlets
- Room charge posting: routes to guest folio in PMS with real-time balance check (credit limit/city ledger flag)
- Discount and comp workflow: reason code mandatory, manager PIN/approval above threshold
- Void workflow: pre-send void (no approval) vs. post-send void (manager approval + reason, logged to audit trail)
- Shift/session open-close with cash drawer reconciliation (ties into Finance bank/cash reconciliation)
- Offline mode consideration: local queue with sync-on-reconnect (Ethiopian connectivity reliability is a known constraint)

### 3.2 Menu & Recipe Engineering
- Recipe builder: ingredients, quantities, yield %, prep loss factor
- Auto-calculated theoretical plate cost from ingredient current cost
- Menu engineering matrix (popularity vs. profitability: Stars/Plowhorses/Puzzles/Dogs classification) for menu review
- Price change propagation: ingredient cost change flags affected recipes for review, does not auto-change selling price

### 3.3 Inventory & Stores
- Perpetual inventory: every requisition, transfer, receipt, and sale depletion updates stock in real time
- Weighted-average costing method (standard for hospitality F&B)
- Par level and reorder point alerts per outlet/store
- Requisition workflow: outlet requests from main store → approval → fulfillment → stock transaction posted
- Cellar/bar-specific handling for beverage (bottle-level tracking for high-value spirits, pour-cost tracking)
- Physical stock count workflow with variance report (theoretical vs. actual, valued at cost)

### 3.4 Purchasing (linked to Finance AP)
- Purchase requisition from Stores → PO → Goods Receipt (updates inventory + triggers AP bill draft)
- Supplier price list management (manual update in Phase 1)
- Goods receipt discrepancy handling (quantity/quality reject → returns to supplier, logged)

### 3.5 Banquet & Events (BEO)
- Event booking with menu package selection, guest count, room setup diagram reference
- BEO generates a forecasted requisition (kitchen prep planning) and links to AR invoice for the client
- Function sheet distribution to kitchen/service teams (print/PDF export)

### 3.6 Cost & Waste Control
- Wastage logging with reason codes, valued at current cost, posted to a waste/shrinkage GL account
- Comp/void reporting by server, outlet, and reason — flagged for management review above a threshold rate
- Theoretical vs. actual food cost variance report (from POS sales × recipe cost vs. actual stock depletion)

### 3.7 F&B Reporting & KPIs
- Food cost % and Beverage cost % (COGS / Revenue) by outlet and consolidated
- Average check / cover count by outlet, meal period
- Contribution margin by menu item and category
- Comp/void rate by server and outlet
- Feeds Executive Portal: F&B revenue, food cost %, and cover count as standard KPI tiles

---

## 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Server/Waiter | Create/send orders, apply pre-send void, no discount/comp rights |
| Cashier | Process payment, room charge posting, shift close |
| Outlet Supervisor | Post-send void approval, comp approval under threshold, requisition creation |
| F&B Manager | Recipe/menu edits, pricing changes, comp approval above threshold, wastage approval |
| Executive Chef | Recipe costing sign-off, menu engineering review |
| Stores/Inventory Clerk | Stock receipt, transfer, physical count entry |
| Finance (cross-module) | Read access to F&B cost reports; GL posting reconciliation |

---

## 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Finance & Accounting Portal | Outbound | F&B revenue by outlet, COGS, wastage write-offs, GL journal batch |
| Finance & Accounting Portal (AP) | Outbound | Goods receipt → bill draft for supplier payment |
| PMS / Front Office | Bidirectional | Room charge posting to guest folio; guest credit limit check |
| Operations Core (Housekeeping) | Outbound (minor) | Minibar consumption tied to room turnover |
| Executive Portal | Outbound | F&B KPI summary tiles |
| System Admin Portal | Bidirectional | Outlet config, role permissions, tax codes |

---

## 6. Non-Functional Requirements

- **Offline resilience**: POS must queue orders locally and sync on reconnect — do not block service during connectivity drops
- **Costing precision**: weighted-average cost recalculated on every receipt; store as fixed-decimal, not floating point
- **Auditability**: every void, comp, and discount logged with actor, reason, timestamp — same audit trail standard as Finance module
- **Speed**: POS order entry and firing must be near-instant (local-first UI, async sync to server)
- **Localization**: menu items and printed guest checks support Amharic/Tigrinya alongside English

---

## 7. Suggested Build Sequence

1. Outlet + Menu Item + basic POS order flow (no inventory depletion yet)
2. Recipe engineering + ingredient master + weighted-average costing
3. Inventory & stores (requisition, transfer, receipt) wired to POS depletion
4. Room charge routing to PMS folio
5. Purchasing → AP handoff
6. Wastage, comp/void reason-code tracking + approval workflow
7. Banquet/BEO module
8. Physical stock count + variance reporting
9. F&B KPI reporting + Executive Portal feed
10. Offline-mode hardening for POS

---

*This is a base architecture prompt — paste into a fresh module design session and extend with outlet-specific menu data, actual supplier price lists, and POS hardware/peripheral specifics as they're confirmed.*
