# SELEDA Food & Beverage Portal — Architecture Audit

> **Audit Date:** July 2026  
> **Scope:** All F&B portal components, standalone POS portal, admin F&B components, all backend route files, database schema, migrations, and service layer

---

## 1. Executive Summary

The SELEDA F&B Portal is a comprehensive full-stack Food & Beverage management system covering POS operations (restaurant, bar, room service, spa, gift shop), menu engineering, kitchen display, inventory management, recipe costing, banquet/event management, wastage tracking, procurement (suppliers, POs, goods receipts, invoices, three-way matching), staff management, guest meal validation, online ordering, table floor plans, menu analytics, and analytics. It is built with React/TypeScript, Express.js, and Supabase/PostgreSQL.

The system spans **two frontend entry points**: (1) the F&B Portal embedded in the main ERP shell (`FoodBeveragePortal.tsx` with 16 sub-tabs) and (2) a **standalone POS Portal** (`POSPortal.tsx`) with its own login page, outlet selection, modern terminal, analytics, and settings. Admin management is handled through `POSOutletManagement.tsx` and `KDSInstanceManagement.tsx` in the Admin Portal.

**Overall Maturity Score: 7.5 / 10**

**Strong in:** POS core workflows (split/merge/transfer), table management, inventory, recipe costing, procurement lifecycle with three-way matching, guest meal validation, banquet management, UI/UX, ERP integration, outlet registry framework (config-driven outlet creation), unified transaction shape, standalone KDS with multi-POS connectivity, external POS webhook integration, tax profiles & GL mappings, terminal registration, shift reconciliation, menu versioning, offline sync queue with idempotency, inventory strategy pattern (recipe/SKU auto-deduction), KDS course grouping with auto-fire, KDS station performance analytics, KDS↔POS bidirectional feedback loop.

**Weak in:** Hardware integration, offline resilience (restaurant POS frontend), RLS on core F&B tables, manager auth security (hardcoded PIN), modifier groups, allergen/nutrition, time-based pricing engine (schema ready, no engine), multi-currency, KDS realtime (polling vs WebSocket), orphaned table migrations, code maintainability (large monolithic files).

---

## 2. Module Inventory

### 2.1 Frontend Components — F&B Portal (16 sub-tabs)

**Entry point:** `FoodBeveragePortal.tsx` — rendered when `activeDept === 'f&b'` in `App.tsx`. Sub-tab navigation driven by `fbDir` state with module access filtering via `hasModuleAccess()`.

| # | Tab ID | Component | File | Description |
|---|--------|-----------|------|-------------|
| 1 | `dashboard` | F&B Dashboard | `FBDashboard.tsx` | KPI overview, revenue charts, top items |
| 2 | `bar_store` | Bar Store Inventory | `InventoryModule.tsx` (forced) | Bar-specific stock management |
| 3 | `inventory` | Restaurant Store Inventory | `InventoryModule.tsx` (forced) | Restaurant stock management |
| 4 | `meals` | Guest Meal Validation | `GuestMealModule.tsx` | Meal plan entitlement engine |
| 5 | `kds` | Kitchen Display | `KitchenDisplayModule.tsx` | Real-time ticket display, expo view, performance |
| 6 | `menu` | Menu Management | `MenuManagementModule.tsx` | Menu item CRUD, categories, pricing |
| 7 | `banquets` | Banquet Module | `BanquetModule.tsx` | Event management, quoting |
| 8 | `recipes` | Recipe Manager | `RecipeManager.tsx` | Recipe CRUD, plate cost calculation |
| 9 | `beo` | BEO Builder | `BanquetEventOrder.tsx` | Banquet Event Order generation |
| 10 | `waste` | Waste Tracking | `WasteTracking.tsx` | Wastage logging with reason codes |
| 11 | `suppliers` | Supplier Management | `SupplierManagement.tsx` | Supplier CRUD, contacts, performance |
| 12 | `purchase_orders` | Purchase Orders | `PurchaseOrderManagement.tsx` | PO lifecycle, goods receipts, invoices |
| 13 | `staff` | Staff Management | `StaffManagement.tsx` | F&B staff scheduling and roles |
| 14 | `analytics` | Advanced Analytics | `AdvancedAnalytics.tsx` | Forecasting, BI dashboards |
| 15 | `reports` | Department Reports | `DepartmentReportsModule.tsx` (shared) | Custom report builder for F&B |
| 16 | `standard-reports` | Standard Reports | `StandardFBReports.tsx` | Pre-built F&B report templates |

**Additional F&B components not directly tabbed:**

| Component | File | Description |
|-----------|------|-------------|
| Restaurant POS | `POSModule.tsx` (2,370 lines) | Full POS terminal — tabs, cart, checkout, split payment, void/comp, shift management |
| Bar POS | `BarPOSModule.tsx` (2,300 lines) | Bar-specific POS with offline localStorage queue |
| Room Service | `RoomServiceModule.tsx` | Room service ordering with folio posting |
| Stock Count Modal | `StockCountModal.tsx` | Physical inventory count modal |
| Banquet Modals | `BanquetModals.tsx` | UI helper modals for banquet module |

### 2.2 Frontend Components — Standalone POS Portal

**Entry point:** `POSPortal.tsx` — separate login via `POSLoginPage.tsx`, routed at `/pos` in `App.tsx`.

| Component | File | Description |
|-----------|------|-------------|
| POS Portal Shell | `POSPortal.tsx` (387 lines) | Outlet selection, tab navigation (pos/outlets/analytics/settings), modern POS toggle |
| POS Login | `POSLoginPage.tsx` | Dedicated POS authentication page |
| Modern POS Terminal | `ModernPOSTerminal.tsx` (44KB) | Alternative modern POS UI |
| Restaurant POS Wrapper | `RestaurantPOS.tsx` | Thin wrapper → `POSModule.tsx` |
| Bar POS Wrapper | `BarPOS.tsx` | Thin wrapper → `BarPOSModule.tsx` |
| Gift Shop POS | `GiftShopPOS.tsx` | Gift shop-specific POS terminal |
| Spa POS | `SpaPOS.tsx` | Spa outlet POS terminal |
| POS Analytics | `POSAnalytics.tsx` | Outlet-level sales analytics |
| POS Settings | `POSSettings.tsx` | Terminal and outlet configuration |

### 2.3 Frontend Components — Admin Portal (F&B Related)

| Component | File | Description |
|-----------|------|-------------|
| POS Outlet Management | `POSOutletManagement.tsx` (89KB) | Full outlet CRUD, user-outlet role assignment, outlet registry fields |
| KDS Instance Management | `KDSInstanceManagement.tsx` (42KB) | KDS instance CRUD, POS outlet connections, external POS registration |
| POS Setup | `POSSetup.tsx` | Outlet categories, printer config, terminal mapping |

### 2.4 Backend API Routes

#### `foodBeverage.routes.ts` (1,249 lines)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| Outlets | GET, POST | `fb:outlet:create` |
| Menu Items | GET, POST, PUT | `fb:menu:create`, `fb:menu:update` |
| Recipes + Plate Cost | GET, POST, GET plate-cost | `fb:recipe:create` |
| Ingredients | GET, POST, PUT, recalculate-cost | `fb:ingredient:create/update` |
| Stock Locations | GET | — |
| Stock Transactions | GET, POST | `fb:stock:create` |
| Requisitions | GET, POST, approve, fulfill | `fb:requisition:create/approve/fulfill` |
| Orders (POS) | GET, POST, PUT, void | `fb:order:create/update/void` |
| Banquet Events | GET, POST, PUT | `fb:banquet:create/update` |
| Wastage Logs | GET, POST | `fb:wastage:create` |
| Stock Counts | GET, POST, approve | `fb:stockcount:create/approve` |
| KPIs | GET aggregate, GET by-outlet | — |
| Tables | CRUD + assign/release/clean/available/summary | `fb:table:*` |
| Table Reservations | CRUD + auto-assign | `fb:reservation:*` |
| Waitlist | CRUD + seat-next/notify/cancel | `fb:waitlist:*` |
| Server Sections | CRUD | `fb:section:*` |
| Suppliers | CRUD + contacts/categories/performance/search/statistics | `fb:supplier:*` |
| Purchase Orders | CRUD + lines + submit/approve/cancel + calculate-total | `fb:po:*` |
| Goods Receipts | GET, POST, PUT | `fb:receipt:create/update` |
| Supplier Invoices | CRUD + paid | `fb:invoice:*` |

#### `pos.routes.ts` (2,961 lines)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| Offline Transaction Sync | POST sync/transactions, POST sync/conflicts/:id/resolve | `pos:sync:resolve` |
| Inventory Sync | GET inventory/sync, POST inventory/validate-offline | — |
| Hardware — Printers | GET, POST | `pos:hardware:manage` |
| Hardware — Payment Terminals | GET, POST | `pos:hardware:manage` |
| KDS Orders (legacy) | POST kds/orders, GET kds/orders, PUT kds/orders/:id/status | — |
| Barcode Scanner | GET products/barcode/:barcode | — |
| POS Outlets | GET, POST, PUT | `pos_settings:read/update` |
| POS Outlet Roles | GET, POST, DELETE (per outlet) | `pos_settings:read/update` |
| POS Tax Profiles | GET, POST, PUT, DELETE | `pos_settings:read/update` |
| POS GL Mappings | GET, POST, PUT, DELETE | `pos_settings:read/update` |
| POS Terminals | GET, POST, PUT, DELETE | `pos_settings:read/update` |
| POS Shifts | GET, POST (open/close), GET summary | `pos_settings:read/update` |
| POS Menu Versions | GET, POST | `pos_settings:read/update` |
| POS Transactions (unified) | POST (create with tax calc, inventory deduction, KDS routing, folio posting) | — |
| POS KDS Tickets | GET, PUT status, POST recall, POST fire-course | — |
| POS KDS Expo | GET aggregate expo view | — |
| POS KDS Station Performance | GET | — |
| POS Sync Queue | POST flush | — |
| Prep Stations | CRUD + outlet linking | `pos_settings:update` |

#### `kds.routes.ts` (696 lines)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| KDS Instances | GET, GET/:id, POST, PUT/:id, DELETE/:id | `pos_settings:update` (writes) |
| KDS Heartbeat | POST /:instanceId/heartbeat | — |
| KDS POS Connections | GET, POST, PUT, DELETE (per instance) | `pos_settings:update` |
| KDS External POS | GET, POST, DELETE (per instance) | `pos_settings:update` |
| External POS Webhook | POST /external/:apiKey/orders | — (API key auth) |
| KDS Tickets by Instance | GET /:instanceId/tickets | — |
| KDS Expo View | GET /:instanceId/expo | — |
| KDS Station Performance | GET /:instanceId/performance | — |
| KDS Ticket Status (standalone) | PUT /tickets/:ticketId/status | — |
| KDS Ticket Recall | POST /tickets/:ticketId/recall | — |
| KDS Fire Course | POST /orders/:orderId/fire-course | — |

#### `tableManagement.routes.ts` (546 lines)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| Floor Plans | POST, GET (by restaurant) | `fb:tables:manage` |
| Tables | CRUD, assign/release/clean/available, summary | `fb:table:*` |
| Table Reservations | CRUD + auto-assign | `fb:reservation:*` |
| Waitlist | CRUD + seat-next/notify/cancel | `fb:waitlist:*` |
| Server Sections | CRUD | `fb:section:*` |

#### `onlineOrdering.routes.ts` (697 lines)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| Online Orders | POST (create), GET (list), GET/:id, PUT status | — (public create) |
| Restaurants | GET list, GET/:id menu | — |
| Delivery Zones | GET | — |

#### `menuAnalytics.routes.ts` (534 lines)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| Menu Engineering Matrix | GET (Stars/Plowhorses/Puzzles/Dogs) | `authenticate` |
| Menu Item Sales | GET sales data per item | `authenticate` |
| Category Performance | GET aggregate by category | `authenticate` |
| Price Elasticity | GET analysis | `authenticate` |

#### `procurement.routes.ts` (separate file)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| Suppliers | CRUD + contacts/categories/performance | `fb:supplier:*` |
| Purchase Orders | CRUD + lines + submit/approve/cancel | `fb:po:*` |
| Goods Receipts | GET, POST, PUT | `fb:receipt:create/update` |
| Supplier Invoices | CRUD + paid | `fb:invoice:*` |
| Three-Way Matching | POST (PO ↔ Receipt ↔ Invoice) | `fb:procurement:match` |

#### `posPortal.routes.ts` (383 lines)

| Domain | Endpoints | Permission Guard |
|--------|-----------|-----------------|
| POS Outlets (admin) | GET all, GET my, GET primary | `manageRoles` / `authenticate` |
| POS Outlet CRUD | POST, PUT, DELETE | `manageRoles` |
| POS Outlet Users | GET, POST, DELETE | `manageRoles` |

### 2.5 Service Layer

| File | Description |
|------|-------------|
| `foodBeverageService.ts` (530 lines) | API abstraction for outlets, menu items, ingredients, recipes, stock, requisitions, orders, banquets, wastage, stock counts |
| `hardwareIntegration.ts` (489 lines) | HardwareIntegrationManager — printer, payment terminal, barcode scanner, customer display interfaces. **No actual hardware drivers implemented.** |
| `recipeCosting.ts` (449 lines) | Recipe costing engine — plate cost, yield adjustment, waste adjustment, cost variance, recipe variance analysis, price elasticity |
| `purchaseOrderManagement.ts` | PO service with three-way matching, goods receipts, supplier invoices |

### 2.6 Database Schema

**Core (Migration 082):** `outlets`, `ingredients`, `menu_items`, `recipes`, `recipe_lines`, `stock_locations`, `stock_transactions`, `requisitions`, `requisition_lines`, `orders`, `order_lines`, `banquet_events`, `wastage_logs`, `stock_counts`, `stock_count_lines`

**Extended:**
- **Migration 127:** `fb_sync_queue`, `fb_sync_conflicts`, `fb_offline_inventory_cache` (offline POS sync)
- **Migration 128:** `fb_tables`, `fb_table_reservations`, `fb_server_sections`, `fb_table_turn_history`, `fb_waitlist` (table management)
- **Migration 129:** `fb_suppliers`, `fb_supplier_contacts`, `fb_supplier_categories`, `fb_supplier_category_assignments`, `fb_supplier_performance`, `fb_purchase_orders`, `fb_purchase_order_lines`, `fb_goods_receipts`, `fb_supplier_invoices` (procurement)
- **Migration 143:** `pos_outlets`, `pos_outlet_roles`, `pos_outlet_categories`, `pos_menu_items` (POS outlet RBAC)
- **Migration 175:** `pos_tax_profiles`, `pos_gl_mappings`, `pos_terminals`, `pos_transactions`, `pos_shifts`, `pos_menu_versions` + `deduct_outlet_inventory()` function (Outlet Registry Framework)
- **Migration 176:** `requires_kds`, `outlet_category`, `time_based_pricing_rule_id`, `recipe_id`, `item_type` columns on `pos_outlets`/`pos_menu_items` + `auto_derive_outlet_kds()` trigger + `transaction_id` on `kds_orders` (POS/KDS schema enhancements)
- **Migration 177:** `pos_sync_queue` + `resolve_sync_conflict()` function (offline-first transaction queue)
- **Migration 178:** `kds_instances`, `kds_pos_connections`, `kds_external_pos_systems` + `kds_instance_id` on `kds_orders` (standalone KDS system)
- **Note:** `kds_orders` table exists in the database with RLS enabled but has no `CREATE TABLE` migration in the repository — likely created manually or via direct DB command. A backfill migration should be added for reproducibility.
- **Orphaned tables:** `online_orders`, `restaurant_floor_plans`, `menu_item_sales`, `three_way_matches` — referenced in route files but no `CREATE TABLE` migration found in the repository. These tables may exist in the DB but their schema is not version-controlled.

---

## 3. Feature Assessment

### 3.1 Point of Sale (POS)

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-outlet POS | ✅ Implemented | Outlet Registry Framework (migration 175) — any outlet type is a config row. Restaurant, Bar, Room Service, Banquet, Gift Shop, Spa, plus any future outlet |
| Unified transaction shape | ✅ Implemented | `pos_transactions` canonical schema for ALL outlets — single ingestion point with line_items JSONB, tax breakdown, GL references |
| Tax profiles | ✅ Implemented | `pos_tax_profiles` — reusable VAT/service charge/exemption rule sets per outlet (5 seeded profiles) |
| GL mapping | ✅ Implemented | `pos_gl_mappings` — revenue/COGS/tax GL account codes per outlet type, USALI-compliant (7 seeded mappings) |
| Terminal registration | ✅ Implemented | `pos_terminals` — device registration with outlet FK, terminal types (standard, kitchen_display, mobile, kiosk, self_service) |
| Shift reconciliation | ✅ Implemented | `pos_shifts` — till/cash-drawer with opening float, expected/counted cash, variance, sales breakdown by payment method |
| Menu versioning | ✅ Implemented | `pos_menu_versions` — seasonal/promotional menu snapshots per outlet with effective date ranges |
| Tab/ticket management | ✅ Implemented | Open tabs, quick-sale, table tabs |
| Table management | ✅ Implemented | DB-backed tables, assign/release/clean, server sections |
| Split bill | ✅ Implemented | Equal, custom, by-item split modes |
| Merge bill | ✅ Implemented | Merge tabs into target tab |
| Table transfer | ✅ Implemented | Transfer items between tabs |
| Void with manager approval | ⚠️ Partial | Void workflow + reason code + PIN — **but PIN is hardcoded `1234`** |
| Comp with manager approval | ⚠️ Partial | Comp workflow + reason code + PIN — **same hardcoded PIN** |
| Discount management | ⚠️ Partial | Percentage discounts per tab + `time_based_pricing_rule_id` field on menu items — **no pricing rules engine implemented** |
| Payment methods | ⚠️ Partial | Cash, Card, Mobile, RoomCharge + split tender — **no gift card, no house account** |
| Split tender | ✅ Implemented | PaymentSystem component with multi-tender splits |
| Offline mode (Bar) | ✅ Implemented | localStorage queue + auto-sync on reconnect with online/offline event listeners |
| Offline mode (Restaurant) | ⚠️ Partial | `pos_sync_queue` (migration 177) backend ready with idempotency + conflict resolution — **frontend `POSModule.tsx` lacks offline mode integration** |
| Receipt printing | ⚠️ Partial | `window.print()` via UnifiedInvoiceTemplate — **no hardware printer driver** |
| Payment terminal integration | ❌ Missing | No terminal integration despite `pos_terminals` table and `hardwareIntegration.ts` service |
| KDS integration | ✅ Implemented | Auto-routing from POS to KDS — items with `prep_required=true` auto-split by `prep_station_id` into `kds_orders` with `transaction_id` linkage. Bidirectional feedback loop. |
| Tax handling | ⚠️ Partial | Multi-tax profile support — **no tax-inclusive pricing mode** |
| Inventory deduction | ✅ Implemented | `deduct_outlet_inventory()` function — strategy pattern: recipe mode deducts BOM components, SKU mode deducts direct stock |
| Folio posting | ✅ Implemented | Auto-posts to guest folio when `payment_method=room_folio` and `reservation_id` present |
| Barcode scanner | ✅ Implemented | GET `/api/pos/products/barcode/:barcode` endpoint |
| Hardware registration API | ✅ Implemented | Printer and payment terminal CRUD endpoints — **but no actual hardware drivers** |

### 3.2 Menu Management

| Feature | Status | Notes |
|---------|--------|-------|
| Menu item CRUD | ✅ Implemented | Full CRUD via API + service layer |
| Categories | ✅ Implemented | `pos_outlet_categories` per outlet + category field per item |
| Menu engineering matrix | ✅ Implemented | Star/Plowhorse/Puzzle/Dog analysis via `menuAnalytics.routes.ts` |
| Availability tracking | ⚠️ Partial | `available` boolean — **no time-based availability** |
| Pricing | ⚠️ Partial | Single price per item + `time_based_pricing_rule_id` field (schema ready) — **no size/modifier pricing; no pricing rules engine** |
| Item type classification | ✅ Implemented | `item_type` enum: Prepared, Retail, Service — drives KDS routing and inventory mode |
| Recipe linkage | ✅ Implemented | `recipe_id` FK on `pos_menu_items` — links menu items to recipes for BOM deduction |
| Menu versioning | ✅ Implemented | `pos_menu_versions` seasonal/promotional snapshots per outlet |
| Allergen tracking | ❌ Missing | No allergen data on menu items |
| Nutritional information | ❌ Missing | No nutritional data on menu items |
| Modifier groups | ❌ Missing | No modifier groups, size-based pricing, or combo pricing |

### 3.3 Kitchen Display System (KDS)

| Feature | Status | Notes |
|---------|--------|-------|
| Order display | ✅ Implemented | Real DB-backed tickets via `/api/kds/:instanceId/tickets` and `/api/pos/kds/tickets` |
| Standalone KDS instances | ✅ Implemented | `kds_instances` table — multiple displays (station, expo, combined) with per-instance display config (theme, font scale, columns, sort, sound, auto-bump) |
| Multi-POS connectivity | ✅ Implemented | `kds_pos_connections` many-to-many — one KDS receives from multiple POS outlets, one outlet sends to multiple KDS displays |
| External POS integration | ✅ Implemented | `kds_external_pos_systems` — webhook endpoint `/api/kds/external/:apiKey/orders` supports Toast, Square, Lightspeed, Clover, generic |
| Status workflow | ✅ Implemented | Fired → InProgress → Ready → Served / Recalled / Voided with auto course-fire chaining |
| Course grouping | ✅ Implemented | Starter → Main → Dessert with held tickets auto-fired when previous course is served |
| Priority levels | ✅ Implemented | Normal, VIP, Rush |
| Timer/alerts | ⚠️ Partial | Elapsed time with color thresholds (green→yellow→red) + `sound_enabled` config flag — **no browser audio implementation** |
| Expo view | ✅ Implemented | `/api/kds/:instanceId/expo` — aggregates tickets by order_id across stations, shows `all_ready` status |
| Station performance | ✅ Implemented | `/api/kds/:instanceId/performance` — per-station metrics: avg prep time, on-time rate, recall rate, void rate |
| KDS ↔ POS feedback loop | ✅ Implemented | `transaction_id` on `kds_orders` — bumping to Served/Voided propagates to `pos_transactions.line_items[].kds_status` |
| Heartbeat | ✅ Implemented | POST `/api/kds/:instanceId/heartbeat` — display devices check in with `last_seen_at` |
| Real-time sync | ⚠️ Partial | **Polling at 15-second intervals** — no WebSocket/Supabase Realtime subscription |
| Prep station routing | ✅ Implemented | Items auto-split by `prep_station_id` — one POS order creates multiple KDS tickets |
| Auto-derive KDS requirement | ✅ Implemented | DB trigger auto-updates `requires_kds` on outlet when menu items' `prep_required` changes |

### 3.4 Inventory & Stock Management

| Feature | Status | Notes |
|---------|--------|-------|
| Stock transactions | ✅ Implemented | Receipt, Requisition, Transfer, WastageWriteoff, POSDepletion, StockCount |
| Weighted-average cost | ✅ Implemented | Recalculation on receipt |
| Stock locations | ✅ Implemented | Multiple locations (Restaurant Store, Bar Store) |
| Requisition workflow | ✅ Implemented | Create → Approve → Fulfill |
| Physical stock count | ✅ Implemented | Stock count + count lines + approval workflow |
| Min/max levels | ⚠️ Partial | `minLevel` on inventory items — **no auto-reorder trigger** |
| Expiry tracking | ⚠️ Partial | `expiryDate` field exists — **no batch-level expiry tracking or alerts** |

### 3.5 Recipe & Costing

| Feature | Status | Notes |
|---------|--------|-------|
| Recipe CRUD | ✅ Implemented | Full CRUD with recipe lines and ingredient linkage |
| Plate cost calculation | ✅ Implemented | Yield + portion adjustment via `recipeCosting.ts` |
| Cost variance tracking | ✅ Implemented | `calculateCostVariance()` and `calculateRecipeVariance()` in `recipeCosting.ts` |
| Recipe scaling | ❌ Missing | No scale-by-portion-count functionality |
| Yield-adjusted cost | ✅ Implemented | `calculateYieldAdjustedCost()` in `recipeCosting.ts` |
| Waste-adjusted cost | ✅ Implemented | `calculateWasteAdjustedCost()` in `recipeCosting.ts` |
| Price elasticity analysis | ✅ Implemented | `calculatePriceElasticity()` in `recipeCosting.ts` |

### 3.6 Banquet & Event Management

| Feature | Status | Notes |
|---------|--------|-------|
| Banquet event CRUD | ✅ Implemented | Full CRUD via API |
| BEO generation | ✅ Implemented | `BanquetEventOrder.tsx` component — **no digital signature capture** |
| Per-head pricing | ✅ Implemented | `price_per_head` field |
| Event status workflow | ✅ Implemented | Tentative → Confirmed → In Progress → Completed |
| Banquet charges to folio | ❌ Missing | No auto-charge to group folio |

### 3.7 Procurement & Supplier Management

| Feature | Status | Notes |
|---------|--------|-------|
| Supplier CRUD | ✅ Implemented | Full supplier master with contacts, categories |
| Supplier performance | ✅ Implemented | `fb_supplier_performance` table + calculate RPC |
| Purchase orders | ✅ Implemented | Full PO lifecycle: draft → submit → approve → receive → close |
| Goods receipts | ✅ Implemented | Create + link to PO |
| Supplier invoices | ✅ Implemented | CRUD + mark paid |
| Three-way matching | ✅ Implemented | PO ↔ Receipt ↔ Invoice matching in `procurement.routes.ts` and `procurementPortal.routes.ts` |
| EDI integration | ❌ Missing | `edi_enabled`, `edi_endpoint` fields exist — **no EDI engine implemented** |

### 3.8 Guest Meal & Room Service

| Feature | Status | Notes |
|---------|--------|-------|
| Meal plan validation | ✅ Implemented | BB, HB, FB, Conference, Corporate, Group |
| Per-period entitlement | ✅ Implemented | Breakfast/Lunch/Dinner checks |
| Served meal logging | ✅ Implemented | Timestamp + reservation ID |
| Extra meal charging | ✅ Implemented | Charge for meals beyond plan |
| Room service ordering | ✅ Implemented | `RoomServiceModule.tsx` with folio posting |

### 3.9 Online Ordering

| Feature | Status | Notes |
|---------|--------|-------|
| Online order creation | ✅ Implemented | POST `/api/online-ordering/orders` — pickup/delivery, scheduled time, special instructions |
| Order status management | ✅ Implemented | Status workflow via PUT endpoint |
| Delivery zones | ✅ Implemented | GET delivery zones endpoint |
| Tax calculation | ✅ Implemented | 15% VAT hardcoded — **should use `pos_tax_profiles` instead** |
| Payment integration | ⚠️ Partial | `paymentMethod` field — **no payment gateway integration** |

### 3.10 Table Management

| Feature | Status | Notes |
|---------|--------|-------|
| Floor plan management | ✅ Implemented | `restaurant_floor_plans` with layout data JSONB |
| Table CRUD | ✅ Implemented | Full table lifecycle with seat count and status |
| Table status workflow | ✅ Implemented | Available → Occupied → Dirty → Available |
| Table reservations | ✅ Implemented | CRUD + auto-assign |
| Waitlist | ✅ Implemented | CRUD + seat-next/notify/cancel |
| Server sections | ✅ Implemented | CRUD for server zone assignments |

### 3.11 Reporting & Analytics

| Feature | Status | Notes |
|---------|--------|-------|
| KPI dashboard | ✅ Implemented | Revenue, orders, void rate, wastage, food cost % |
| Outlet-level KPIs | ✅ Implemented | Per-outlet breakdown |
| Top selling items | ✅ Implemented | Dashboard display |
| Advanced analytics | ✅ Implemented | Forecasting, BI module in `AdvancedAnalytics.tsx` |
| Standard reports | ✅ Implemented | Pre-built report templates via `StandardFBReports.tsx` |
| Department reports | ✅ Implemented | `DepartmentReportsModule.tsx` (shared component) |
| Menu engineering analytics | ✅ Implemented | Dedicated `menuAnalytics.routes.ts` with matrix, sales, category performance, price elasticity |
| Export (PDF/Excel/CSV) | ✅ Implemented | `reportExportUtils.ts` |
| Custom report builder | ❌ Missing | No user-facing custom report builder |

---

## 4. Architecture & Technical Stack

| Aspect | Implementation |
|--------|---------------|
| Database | Postgres (Supabase) |
| Backend | Express.js + Supabase Admin client |
| Frontend | React + TypeScript + Tailwind CSS + Framer Motion |
| Auth | JWT-based with `authenticate` + `requirePermission` middleware |
| API pattern | RESTful with per-route permission guards |
| Multi-property | `property_id` on `pos_outlets`, `kds_instances` (migrations 143, 174, 178) — schema ready, **not fully integrated into F&B portal UI** |
| Multi-currency | `currency` field on POs (`ETB` default) — **no FX conversion** |
| Real-time | Supabase Realtime channels available — **KDS uses 15-second polling, not WebSocket** |
| Offline capability | Bar POS: localStorage queue; Restaurant POS: `pos_sync_queue` backend ready, **frontend not integrated**; KDS: polling-based |
| Hardware integration | `hardwareIntegration.ts` service + `pos_terminals` table + hardware CRUD endpoints — **no actual hardware drivers** |
| Error boundaries | `ErrorBoundary` wraps entire `App` — **no per-module boundaries; single component crash takes down portal** |
| Caching | `cacheService` used in POS, KDS, table management, menu analytics routes |

### RLS Coverage

| Table Group | RLS Status |
|-------------|------------|
| `pos_outlets` family (migration 143) | ✅ Enabled |
| All POS tables (migration 175) | ✅ Enabled |
| `pos_sync_queue` (migration 177) | ✅ Enabled |
| All KDS tables (migration 178) | ✅ Enabled |
| `system_users`, `custom_roles`, `global_settings`, `audit_events` | ✅ Enabled |
| `bank_accounts`, `payment_idempotency`, `vouchers`, `ar_ledger` | ✅ Enabled |
| Core F&B: `outlets`, `menu_items`, `ingredients`, `recipes`, `orders`, `order_lines`, `stock_transactions`, `wastage_logs`, `banquet_events`, `requisitions` | ❌ **Not enabled** |

---

## 5. Critical Issues (Priority-Ranked)

### P1 — Manager PIN is Hardcoded (Critical Security)

Void and comp workflows check `managerPin !== '1234'` — a hardcoded string in the frontend. Any user can void or comp orders by entering `1234`.

**Files:** `POSModule.tsx:520`, `POSModule.tsx:551`

### P2 — No RLS on Core F&B Tables (Critical Security)

Core F&B tables (`outlets`, `menu_items`, `ingredients`, `recipes`, `orders`, `order_lines`, `stock_transactions`, `wastage_logs`, `banquet_events`, `requisitions`) do not have RLS enabled. All data is accessible via the anon key if the Supabase URL and anon key are exposed.

**Files:** `supabase/migrations/082_fb_core.sql`

### P3 — No Hardware Integration (High)

No receipt printers (ESC/POS), kitchen printers, or payment terminals (Verifone, Ingenico). All receipts use `window.print()`. The `hardwareIntegration.ts` service defines interfaces and a manager class but has no actual device drivers. The `pos_terminals` table and hardware CRUD endpoints exist but are not connected to real hardware.

**Files:** All POS modules, `hardwareIntegration.ts`

### P4 — Restaurant POS Has No Offline Mode (High)

`BarPOSModule.tsx` has full offline localStorage queue with auto-sync. `POSModule.tsx` has no offline mode. Migration 177 created `pos_sync_queue` with idempotency keys, sync status tracking, and conflict resolution function. POS sync endpoint processes queued transactions on reconnect. **However, the frontend `POSModule.tsx` still lacks offline mode integration.**

**Files:** `POSModule.tsx`, `supabase/migrations/177_pos_offline_sync_queue.sql`

### P5 — No Modifier Groups / Size-Based Pricing (Medium)

Menu items have a single price. No modifier groups, size-based pricing, or combo pricing. This limits menu flexibility for items with variants (e.g., small/medium/large, add-ons).

**Files:** `MenuManagementModule.tsx`, `foodBeverageService.ts`

### P6 — No Allergen / Nutritional Information (Medium)

No allergen tracking or nutritional data on menu items. Increasingly required for regulatory compliance.

**Files:** `MenuManagementModule.tsx`, database schema

### P7 — No Time-Based Pricing / Happy Hour Engine (Medium)

Discounts are flat percentage per tab. Migration 176 added `time_based_pricing_rule_id` column to `pos_menu_items` but no pricing rules table or engine has been implemented.

**Files:** `POSModule.tsx` (discount logic), `pos_menu_items.time_based_pricing_rule_id`

### P8 — KDS Uses Polling Instead of Realtime (Medium)

KDS frontend polls every 15 seconds via `setInterval`. Supabase Realtime channels are available and used in other parts of the app (e.g., `ReservationContext.tsx`). Should use `.channel()` subscription on `kds_orders` for instant ticket updates.

**Files:** `KitchenDisplayModule.tsx:158-162`

### P9 — Orphaned Table Migrations (Medium)

`kds_orders`, `online_orders`, `restaurant_floor_plans`, `menu_item_sales`, `three_way_matches` — all referenced in route files but no `CREATE TABLE` migration exists in the repository. These tables likely exist in the DB but their schema is not version-controlled, creating reproducibility risk.

### P10 — No Error Boundaries on F&B Modules (Low)

A single `ErrorBoundary` wraps the entire `App`. If any F&B sub-component throws, the entire portal goes down. Per-module error boundaries would isolate failures.

**Files:** `App.tsx:1076`

---

## 6. Code Quality Observations

| Issue | Severity | Location |
|-------|----------|----------|
| `POSModule.tsx` is 2,370 lines in a single file | High | Monolithic component, hard to maintain |
| `BarPOSModule.tsx` is 2,300 lines | High | Should be split into sub-components |
| `ModernPOSTerminal.tsx` is 44KB | High | Should be split into sub-components |
| `MenuManagementModule.tsx` is 1,300 lines | Medium | Should be split by feature |
| `POSOutletManagement.tsx` is 89KB | High | Should be split into outlet CRUD, role assignment, config panels |
| Manager PIN hardcoded as `1234` | Critical | `POSModule.tsx:520,551` |
| `any` type used extensively | Low | Throughout F&B components and route files |
| No unit tests for F&B module | High | `tests/` only has executive KPI tests |
| No error boundaries on F&B modules | Medium | Single component crash takes down portal |
| `pos.routes.ts` is 2,961 lines | Medium | Should be split into sync, hardware, KDS, outlet, tax, GL, terminal, shift, transaction modules |
| `foodBeverage.routes.ts` is 1,249 lines | Medium | Should be split by domain (menu, inventory, procurement, tables, KDS) |
| `kds.routes.ts` is 696 lines | Low | Could be split into instance, connection, ticket, and performance route modules |
| Online ordering tax hardcoded at 15% | Medium | `onlineOrdering.routes.ts:36` — should use `pos_tax_profiles` |
| `kds_orders` table has no CREATE TABLE migration | Medium | Reproducibility risk |
| KDS uses 15-second polling instead of Supabase Realtime | Medium | `KitchenDisplayModule.tsx:158-162` |

---

## 7. Recommendations (Priority Order)

1. **P1 — DB-verified manager auth:** Replace hardcoded PIN with backend endpoint verifying user role + PIN hash. Store hashed PIN in `system_users` or a dedicated `manager_pins` table.
2. **P2 — Enable RLS on core F&B tables:** Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + authenticated policies for all core F&B tables.
3. **P3 — Hardware integration:** Add ESC/POS receipt printer support via WebUSB or network printing; integrate payment terminal SDK.
4. **P4 — Restaurant POS offline mode:** Integrate `pos_sync_queue` into `POSModule.tsx` frontend — queue transactions locally, flush on reconnect. Mirror the pattern already working in `BarPOSModule.tsx`.
5. **P5 — Modifier groups:** Add `menu_modifier_groups` and `menu_modifiers` tables; update `MenuManagementModule` and `POSModule`.
6. **P6 — Allergen/nutrition data:** Add `allergens` and `nutrition` JSONB columns to `menu_items`; display in menu and POS.
7. **P7 — Time-based pricing:** Create `pos_time_based_pricing_rules` table with time windows and rate adjustments; wire to `time_based_pricing_rule_id` on `pos_menu_items`; apply automatically in POS checkout.
8. **P8 — KDS Realtime:** Replace 15-second polling in `KitchenDisplayModule.tsx` with Supabase Realtime `.channel()` subscription on `kds_orders` table.
9. **P9 — Add missing CREATE TABLE migrations:** Backfill `kds_orders`, `online_orders`, `restaurant_floor_plans`, `menu_item_sales`, `three_way_matches` migrations for repo reproducibility.
10. **P10 — Per-module error boundaries:** Wrap each F&B sub-module in its own `ErrorBoundary` to isolate failures.
11. **Refactor large files:** Split `POSModule.tsx`, `BarPOSModule.tsx`, `ModernPOSTerminal.tsx`, `POSOutletManagement.tsx`, `pos.routes.ts`, and `foodBeverage.routes.ts` into smaller, focused modules.
12. **Online ordering tax fix:** Replace hardcoded 15% VAT in `onlineOrdering.routes.ts` with lookup from `pos_tax_profiles` tied to the restaurant's outlet.
13. **Add unit tests:** Create test suite for F&B module covering POS checkout flow, KDS ticket lifecycle, inventory deduction, recipe costing, and procurement three-way matching.

---

## 8. Summary

**Score: 7.5/10**

The SELEDA F&B Portal is a feature-rich, production-capable system with strong POS, KDS, inventory, procurement, and analytics foundations. The outlet registry framework, unified transaction shape, standalone KDS with external POS webhook support, and inventory strategy pattern are well-architected. The system covers 16 sub-modules in the F&B portal plus a standalone POS portal with 7 components and 3 admin management components, backed by 7 route files totaling over 6,000 lines of API endpoints.

The primary areas requiring attention are **security** (hardcoded manager PIN, missing RLS on core tables), **resilience** (restaurant POS offline mode, KDS realtime), **compliance** (allergen/nutrition tracking), and **code maintainability** (multiple 2,000+ line files). The orphaned table migrations pose a reproducibility risk that should be addressed.

The existing architecture (Postgres, React frontend, REST API with permission middleware, Supabase Admin client) is sound and extensible enough to support all recommended improvements.
