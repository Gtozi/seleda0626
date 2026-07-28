# SELEDA Food & Beverage Portal Audit — Oracle Simphony Comparison

> **Audit Date:** July 2026 (updated with POS/KDS architecture overhaul — migrations 175-178)  
> **Scope:** All F&B portal components, backend routes, database schema, migrations, and service layer  
> **Benchmark:** Oracle Food & Beverage Cloud (Simphony POS) + Oracle OPERA PMS F&B integration

---

## 1. Executive Summary

The SELEDA F&B Portal is a comprehensive full-stack Food & Beverage management system covering POS operations (restaurant, bar, room service), menu engineering, kitchen display, inventory management, recipe costing, banquet/event management, wastage tracking, procurement (suppliers, POs, goods receipts, invoices), staff management, guest meal validation, and analytics. It is built with React/TypeScript, Express.js, and Supabase/PostgreSQL.

Compared to Oracle Simphony, SELEDA demonstrates **strong functional coverage** in core POS workflows, table management, inventory, and now includes a **standalone KDS system** with multi-POS connectivity, external POS webhook integration, an **outlet registry framework** with unified transactions, tax profiles, GL mappings, terminal registration, shift reconciliation, and an **offline-first sync queue**. Modern UX patterns rival Oracle's interface. However, significant gaps remain in **hardware integration, device-level offline resilience on restaurant POS frontend, multi-currency support, allergen/nutrition management, and regulatory compliance**.

**Overall Maturity Score: 7.5 / 10** (vs Oracle Simphony as 10/10 benchmark)  
**Oracle Simphony Feature Parity: ~72%**

---

## 2. Module Inventory

### 2.1 Frontend Components (20 modules)

| # | Component | File | Oracle Simphony Equivalent |
|---|-----------|------|---------------------------|
| 1 | F&B Portal Shell | `FoodBeveragePortal.tsx` | Simphony workstation selector |
| 2 | Dashboard | `FBDashboard.tsx` | Simphony Reporting Dashboard |
| 3 | Restaurant POS | `POSModule.tsx` | Simphony POS client |
| 4 | Bar POS | `BarPOSModule.tsx` | Simphony Bar workstation |
| 5 | Menu Management | `MenuManagementModule.tsx` | Simphony Menu Designer |
| 6 | Kitchen Display | `KitchenDisplayModule.tsx` | Oracle Kitchen Display System (KDS) |
| 7 | Room Service | `RoomServiceModule.tsx` | OPERA Room Service integration |
| 8 | Guest Meal | `GuestMealModule.tsx` | OPERA Meal Plan integration |
| 9 | Inventory | `InventoryModule.tsx` | Simphony Inventory module |
| 10 | Recipe Manager | `RecipeManager.tsx` | Simphony Recipe/Plate Cost |
| 11 | Banquet Module | `BanquetModule.tsx` | OPERA Catering/Banquet |
| 12 | Banquet Event Order | `BanquetEventOrder.tsx` | OPERA BEO generation |
| 13 | Waste Tracking | `WasteTracking.tsx` | Simphony Waste logging |
| 14 | Supplier Management | `SupplierManagement.tsx` | Simphony Supplier Mgmt |
| 15 | Purchase Orders | `PurchaseOrderManagement.tsx` | Simphony Purchasing |
| 16 | Staff Management | `StaffManagement.tsx` | Simphony Employee Mgmt |
| 17 | Advanced Analytics | `AdvancedAnalytics.tsx` | Simphony Analytics/BI |
| 18 | Standard Reports | `StandardFBReports.tsx` | Simphony Standard Reports |
| 19 | Stock Count Modal | `StockCountModal.tsx` | Simphony Physical Inventory |
| 20 | Banquet Modals | `BanquetModals.tsx` | N/A (UI helper) |

### 2.2 Backend API Routes (1,249 lines)

**File:** `src/server/routes/foodBeverage.routes.ts`

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
| **KDS Instances** | CRUD + heartbeat | `pos_settings:update` |
| **KDS POS Connections** | CRUD (connect/disconnect outlets) | `pos_settings:update` |
| **KDS External POS** | CRUD + webhook order ingestion | `pos_settings:update` |
| **KDS Tickets** | GET by instance, PUT status, POST recall, POST fire-course | — |
| **KDS Expo** | GET aggregate expo view | — |
| **KDS Performance** | GET station performance metrics | — |
| **POS Sync** | POST sync queue flush | — |
| **Prep Stations** | CRUD + outlet linking | `pos_settings:update` |

### 2.3 Database Schema

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
- **Note:** `kds_orders` table exists in the database with RLS enabled but has no `CREATE TABLE` migration in the repository — likely created manually or via direct DB command. A backfill migration should be added to the repository for reproducibility.

---

## 3. Feature-by-Feature Comparison

### 3.1 Point of Sale (POS)

| Feature | SELEDA | Oracle Simphony | Gap |
|---------|--------|-----------------|-----|
| Multi-outlet POS | **Outlet Registry Framework** (migration 175) — any outlet type is a config row, not code. Restaurant, Bar, Room Service, Banquet, Gift Shop, Spa, plus any future outlet | Unlimited revenue centers | None |
| Unified transaction shape | **`pos_transactions`** canonical schema for ALL outlets — single ingestion point with line_items JSONB, tax breakdown, GL references | Canonical transaction | None |
| Tax profiles | **`pos_tax_profiles`** — reusable VAT/service charge/exemption rule sets per outlet (5 seeded profiles: Standard F&B, Retail, Spa, Tax Exempt, Duty Free) | Multi-tax rate support | None |
| GL mapping | **`pos_gl_mappings`** — revenue/COGS/tax GL account codes per outlet type, USALI-compliant (7 seeded mappings) | Revenue center accounting | None |
| Terminal registration | **`pos_terminals`** — device registration with outlet FK, terminal types (standard, kitchen_display, mobile, kiosk, self_service) | Device management | None |
| Shift reconciliation | **`pos_shifts`** — till/cash-drawer with opening float, expected/counted cash, variance, sales breakdown by payment method | Full shift audit | Minor: no declared tip tracking |
| Menu versioning | **`pos_menu_versions`** — seasonal/promotional menu snapshots per outlet with effective date ranges | Menu engineering | None |
| Tab/ticket management | Open tabs, quick-sale, table tabs | Full tab management | None |
| Table management | DB-backed tables, assign/release/clean, server sections | Full table management | None |
| Split bill | Equal, custom, by-item split modes | Native split | None |
| Merge bill | Merge tabs into target tab | Native merge | None |
| Table transfer | Transfer items between tabs | Native transfer | None |
| Void with manager approval | Void workflow + reason code + PIN (hardcoded `1234`) | Manager override + audit PIN | **Gap: PIN is hardcoded, not DB-verified** |
| Comp with manager approval | Comp workflow + reason code + PIN | Manager comp + audit | **Gap: Same hardcoded PIN** |
| Discount management | Percentage discounts per tab + **`time_based_pricing_rule_id`** field on menu items (migration 176) | Tiered discounts, happy hours, time-based promotions | **Partial: Schema ready but no pricing rules engine implemented** |
| Payment methods | Cash, Card, Mobile, RoomCharge + split tender | Cash, CC, room charge, house account, gift card, split | **Gap: No gift card, no house account** |
| Split tender | PaymentSystem component with multi-tender splits | Full split tender | None |
| Shift/session management | **`pos_shifts`** table with full reconciliation (opening float, variance, sales breakdown) | Full shift audit, declared tips | **Gap: No declared tip tracking** |
| Offline mode (Bar) | localStorage queue + auto-sync on reconnect | Full offline-first with local SQLite | **Gap: localStorage only, no device-level DB** |
| Offline mode (Restaurant) | **`pos_sync_queue`** (migration 177) — offline-first transaction queue with idempotency key, sync status, conflict resolution function. POS sync endpoint processes queued transactions. | Full offline | **Partial: DB schema + sync endpoint ready, frontend POSModule still lacks offline mode** |
| Receipt printing | `window.print()` via UnifiedInvoiceTemplate | Hardware printer integration | **Gap: No hardware printer driver** |
| Payment terminal integration | None | Integrated payment terminals | **Gap: No terminal integration** |
| KDS integration | **Auto-routing from POS to KDS** — when `pos_transactions` are created, items with `prep_required=true` are automatically split by `prep_station_id` and inserted as `kds_orders` with `transaction_id` linkage. KDS↔POS feedback loop propagates served/voided status back to POS line items. | Native KDS push | None |
| Tax handling | **`pos_tax_profiles`** with VAT, service charge, additional tax rules (JSONB), tax-exempt flags + per-transaction tax fields | Multi-tax rates, tax exempt, tax inclusive | **Partial: Multi-tax profile support added; no tax-inclusive pricing mode** |
| Inventory deduction | **`deduct_outlet_inventory()`** function (migration 175) — strategy pattern: recipe mode deducts BOM components, SKU mode deducts direct stock | Full inventory integration | None |
| Folio posting | Auto-posts to guest folio when `payment_method=room_folio` and `reservation_id` present | Folio integration | None |

### 3.2 Menu Management

| Feature | SELEDA | Oracle Simphony | Gap |
|---------|--------|-----------------|-----|
| Menu item CRUD | Full CRUD via API + service layer | Full menu designer | None |
| Categories | **`pos_outlet_categories`** per outlet + category field per item | Hierarchical categories | Minor gap |
| Menu engineering matrix | Star/Plowhorse/Puzzle/Dog analysis | Menu engineering report | None |
| Availability tracking | `available` boolean | Time-based availability | **Gap: No time-based availability** |
| Pricing | Single price per item + **`time_based_pricing_rule_id`** field (migration 176, schema ready) | Size-based pricing, modifier pricing | **Gap: No size/modifier pricing; time-based pricing schema ready but no engine** |
| Item type classification | **`item_type` enum: Prepared, Retail, Service** (migration 176) — drives KDS routing and inventory mode | Item type classification | None |
| Recipe linkage | **`recipe_id` FK** on `pos_menu_items` (migration 176) — links menu items to recipes for BOM deduction | Recipe linkage | None |
| Menu versioning | **`pos_menu_versions`** seasonal/promotional snapshots per outlet (migration 175) | Menu versioning | None |
| Allergen tracking | Not implemented | Full allergen matrix | **Gap** |
| Nutritional information | Not implemented | Full nutrition per item | **Gap** |
| Modifier groups | Not implemented | Full modifier groups (add-ons, no-charge) | **Gap** |

### 3.3 Kitchen Display System (KDS)

| Feature | SELEDA | Oracle KDS | Gap |
|---------|--------|-----------|-----|
| Order display | **Real DB-backed tickets** via `/api/kds/:instanceId/tickets` and `/api/pos/kds/tickets` | Real-time order feed from POS | None |
| Standalone KDS instances | **`kds_instances` table** — multiple displays (station, expo, combined) with per-instance display config (theme, font scale, columns, sort, sound, auto-bump) | Multi-display KDS | None |
| Multi-POS connectivity | **`kds_pos_connections`** many-to-many — one KDS can receive from multiple POS outlets, one outlet can send to multiple KDS displays | Multi-revenue-center KDS | None |
| External POS integration | **`kds_external_pos_systems`** — webhook endpoint `/api/kds/external/:apiKey/orders` supports Toast, Square, Lightspeed, Clover, generic | Oracle integrates with external POS via API | None |
| Status workflow | Fired → InProgress → Ready → Served / Recalled / Voided with auto course-fire chaining | Configurable status workflow | None |
| Course grouping | **Starter → Main → Dessert** with held tickets auto-fired when previous course is served | Course sequencing | None |
| Priority levels | Normal, VIP, Rush | Priority + expedite | None |
| Timer/alerts | Elapsed time with color thresholds (green→yellow→red) + configurable `sound_enabled` in display config | Timer + audio/visual alerts | Minor: audio alert is config flag, no browser audio implementation |
| Expo view | **`/api/kds/:instanceId/expo`** — aggregates tickets by order_id across stations, shows `all_ready` status | Expo/pass-through screen | None |
| Station performance | **`/api/kds/:instanceId/performance`** — per-station metrics: avg prep time, on-time rate, recall rate, void rate | KDS analytics | None |
| KDS ↔ POS feedback loop | **`transaction_id` on `kds_orders`** — bumping to Served/Voided propagates to `pos_transactions.line_items[].kds_status` | Bidirectional POS↔KDS sync | None |
| Heartbeat | **`POST /api/kds/:instanceId/heartbeat`** — display devices check in with `last_seen_at` | Device health monitoring | None |
| Real-time sync | Polling at 15-second intervals (frontend `setInterval`) | WebSocket real-time | **Gap: No WebSocket/Supabase Realtime subscription yet — polling only** |
| Prep station routing | Items auto-split by `prep_station_id` — one POS order creates multiple KDS tickets (one per station) | Multi-station ticket routing | None |
| Auto-derive KDS requirement | **Trigger on `pos_menu_items`** — `requires_kds` on outlet auto-updates when items' `prep_required` changes | Auto-detection | None |

### 3.4 Inventory & Stock Management

| Feature | SELEDA | Oracle Simphony | Gap |
|---------|--------|-----------------|-----|
| Stock transactions | Receipt, Requisition, Transfer, WastageWriteoff, POSDepletion, StockCount | Full inventory transactions | None |
| Weighted-average cost | Recalculation on receipt | Weighted average / FIFO / LIFO | None |
| Stock locations | Multiple locations (Restaurant Store, Bar Store) | Multiple locations | None |
| Requisition workflow | Create → Approve → Fulfill | Full requisition workflow | None |
| Physical stock count | Stock count + count lines + approval | Full physical inventory | None |
| Min/max levels | `minLevel` on inventory items | Par levels with auto-reorder | Minor: no auto-reorder |
| Expiry tracking | `expiryDate` field | Batch expiry tracking | Partial |

### 3.5 Recipe & Costing

| Feature | SELEDA | Oracle Simphony | Gap |
|---------|--------|-----------------|-----|
| Recipe CRUD | Full CRUD with recipe lines | Full recipe management | None |
| Plate cost calculation | Yield + portion adjustment | Plate cost with yield | None |
| Cost variance tracking | Not implemented | Actual vs theoretical cost | **Gap** |
| Recipe scaling | Not implemented | Scale by portion count | **Gap** |

### 3.6 Banquet & Event Management

| Feature | SELEDA | Oracle OPERA | Gap |
|---------|--------|-------------|-----|
| Banquet event CRUD | Full CRUD via API | Full event management | None |
| BEO generation | BanquetEventOrder component | Full BEO with signatures | Partial: no digital signature |
| Per-head pricing | `price_per_head` field | Per-head pricing | None |
| Event status workflow | Tentative → Confirmed → In Progress → Completed | Full event lifecycle | None |
| Banquet charges to folio | Not implemented | Auto-charge to group folio | **Gap** |

### 3.7 Procurement & Supplier Management

| Feature | SELEDA | Oracle Simphony | Gap |
|---------|--------|-----------------|-----|
| Supplier CRUD | Full supplier master with contacts, categories | Full supplier management | None |
| Supplier performance | `fb_supplier_performance` table + calculate RPC | Performance scoring | None |
| Purchase orders | Full PO lifecycle: draft → submit → approve → receive → close | Full PO workflow | None |
| Goods receipts | Create + link to PO | Full receiving | None |
| Supplier invoices | CRUD + mark paid | Full invoice management | None |
| EDI integration | `edi_enabled`, `edi_endpoint` fields | Full EDI ordering | **Gap: Fields exist but no EDI engine** |
| Three-way matching | Not implemented | PO ↔ Receipt ↔ Invoice matching | **Gap** |

### 3.8 Guest Meal & Room Service

| Feature | SELEDA | Oracle OPERA | Gap |
|---------|--------|-------------|-----|
| Meal plan validation | BB, HB, FB, Conference, Corporate, Group | Full meal plan validation | None |
| Per-period entitlement | Breakfast/Lunch/Dinner checks | Per-period checks | None |
| Served meal logging | Timestamp + reservation ID | Served meal log | None |
| Extra meal charging | Charge for meals beyond plan | Extra charge posting | None |
| Room service ordering | RoomServiceModule with folio posting | Room service integration | None |

### 3.9 Reporting & Analytics

| Feature | SELEDA | Oracle Simphony | Gap |
|---------|--------|-----------------|-----|
| KPI dashboard | Revenue, orders, void rate, wastage, food cost % | Full KPI dashboard | None |
| Outlet-level KPIs | Per-outlet breakdown | Per revenue center | None |
| Top selling items | Dashboard display | Sales mix report | None |
| Advanced analytics | Forecasting, BI module | Simphony Analytics | Partial |
| Custom report builder | Not found | Report builder | **Gap** |
| Export (PDF/Excel/CSV) | reportExportUtils.ts | Full export | None |

---

## 4. Architecture & Technical Comparison

| Aspect | SELEDA | Oracle Simphony |
|--------|--------|-----------------|
| Database | Postgres (Supabase) | Oracle DB / SQL Server |
| Backend | Express + Supabase Admin | Proprietary microservices |
| Frontend | React + Tailwind + Motion | Oracle ADF / native client |
| Multi-property | `property_id` on `pos_outlets`, `kds_instances` (migrations 143, 174, 178) — schema ready, not fully integrated into F&B portal UI | Full multi-property |
| Multi-currency | `currency` field on POs (`ETB` default) but no FX conversion | Full multi-currency |
| Real-time | Supabase Realtime channels available; **KDS uses 15-second polling** (not WebSocket); POS sync queue supports offline reconnect | WebSocket real-time |
| Offline capability | Bar POS: localStorage; Restaurant POS: **`pos_sync_queue` (migration 177) with idempotency + conflict resolution** — backend ready, frontend not integrated; KDS: polling-based | Full offline-first with local DB |
| Hardware integration | None (no printer, terminal, scanner). **`pos_terminals` table** registers devices but no hardware drivers | Full hardware ecosystem |
| RLS | Enabled on `pos_outlets` family (migration 143), **all new POS tables (migration 175)**, **all KDS tables (migration 178)**, `pos_sync_queue` (migration 177). Core F&B tables (`outlets`, `menu_items`, `ingredients`, `recipes`, `orders`, `order_lines`, `stock_transactions`, `wastage_logs`, `banquet_events`, `requisitions`) still lack RLS | Full RLS |
| Scalability | Single Supabase instance | Enterprise cluster |

---

## 5. Critical Gaps (Priority-Ranked)

### P1 - KDS is Not Connected to POS (Critical) — ✅ RESOLVED
~~`KitchenDisplayModule.tsx` uses hardcoded mock data (3 static orders). No API call fetches real orders. No realtime subscription. POS "Send to Kitchen" button only shows a notification.~~

**Resolved by migrations 175-178 and `kds.routes.ts`:**
- `kds_orders` table with full ticket lifecycle (fired → in_progress → ready → served / recalled / voided)
- Auto-routing from `pos_transactions` → `kds_orders` (items split by `prep_station_id`)
- Standalone `kds_instances` with multi-POS connectivity via `kds_pos_connections`
- External POS webhook ingestion via `/api/kds/external/:apiKey/orders`
- `KitchenDisplayModule.tsx` now fetches real tickets from API, supports station/expo/performance views
- KDS↔POS feedback loop: served/voided status propagates to `pos_transactions.line_items[].kds_status`
- Course grouping with auto-fire next course
- **Remaining:** No Supabase Realtime subscription (uses 15-second polling)

### P2 - No Hardware Integration
No receipt printers (ESC/POS), kitchen printers, or payment terminals (Verifone, Ingenico). All receipts use `window.print()`.

**Files:** All POS modules

### P3 - Manager PIN is Hardcoded
Void and comp workflows check `managerPin !== '1234'` — a hardcoded string in the frontend. Security vulnerability.

**Files:** `POSModule.tsx:520`, `POSModule.tsx:551`

### P4 - No RLS on Core F&B Tables
Core F&B tables (`outlets`, `menu_items`, `ingredients`, `recipes`, `orders`, `order_lines`, `stock_transactions`, `wastage_logs`, `banquet_events`, `requisitions`) do not have RLS enabled. **All new POS tables (migration 175: `pos_tax_profiles`, `pos_gl_mappings`, `pos_terminals`, `pos_transactions`, `pos_shifts`, `pos_menu_versions`) and all KDS tables (migration 178: `kds_instances`, `kds_pos_connections`, `kds_external_pos_systems`) and `pos_sync_queue` (migration 177) do have RLS enabled.**

**Files:** `supabase/migrations/000_baseline.sql` (F&B section)

### P5 - Restaurant POS Has No Offline Mode — ⚠️ PARTIAL
`BarPOSModule.tsx` has full offline localStorage queue with auto-sync. `POSModule.tsx` has no offline mode. **Migration 177 created `pos_sync_queue`** with idempotency keys, sync status tracking, and conflict resolution function. POS sync endpoint processes queued transactions on reconnect. **However, the frontend `POSModule.tsx` still lacks offline mode integration.**

**Files:** `POSModule.tsx`, `supabase/migrations/177_pos_offline_sync_queue.sql`

### P6 - No Modifier Groups / Size-Based Pricing
Menu items have a single price. No modifier groups, size-based pricing, or combo pricing.

**Files:** `MenuManagementModule.tsx`, `foodBeverageService.ts`

### P7 - No Allergen / Nutritional Information
No allergen tracking or nutritional data on menu items.

**Files:** `MenuManagementModule.tsx`, database schema

### P8 - No Time-Based Pricing / Happy Hour Engine
Discounts are flat percentage per tab. **Migration 176 added `time_based_pricing_rule_id` column to `pos_menu_items`** but no pricing rules table or engine has been implemented yet.

**Files:** `POSModule.tsx` (discount logic), `pos_menu_items.time_based_pricing_rule_id`

---

## 6. Areas Where SELEDA Exceeds Oracle

| Feature | SELEDA Advantage |
|---------|-----------------|
| Guest Meal Validation | Full meal plan entitlement engine with per-period checks — Oracle requires OPERA integration |
| Banquet BEO Generation | Visual BEO component with menu assignment — Oracle requires separate Catering module |
| Menu Engineering Matrix | Built-in Star/Plowhorse/Puzzle/Dog analysis — Oracle requires Analytics module |
| Offline Sync Architecture | DB-level sync queue with conflict resolution (migration 127) — Oracle uses simpler local DB |
| POS Outlet RBAC | Per-user, per-outlet role assignment with time-limited validity |
| **Standalone KDS with External POS Webhook** | KDS decoupled from POS — supports third-party POS systems (Toast, Square, Lightspeed, Clover) via webhook ingestion. Oracle KDS is proprietary to Simphony only |
| **Outlet Registry Framework** | Any new POS outlet is a config row, not new code — adding a "Poolside Snack Kiosk" requires zero schema migration or new routing logic. Oracle requires module licensing |
| **Unified Transaction Shape** | Single canonical `pos_transactions` schema for ALL outlet types — one ingestion point for inventory, folio, tax, and GL. Oracle uses per-module transaction shapes |
| **Inventory Strategy Pattern** | `deduct_outlet_inventory()` function auto-branches on recipe vs SKU mode per outlet — no per-outlet inventory code |
| **Auto-derive KDS Requirement** | DB trigger auto-updates `requires_kds` on outlet when menu items' `prep_required` changes — zero manual config |
| **Course Grouping with Auto-fire** | KDS tickets held by course (starter/main/dessert) and auto-fired when previous course is bumped to Served |
| **Offline Sync Queue with Idempotency** | `pos_sync_queue` with transaction_id as idempotency key + conflict resolution function — prevents duplicate transactions on reconnect |
| Supplier Performance Scoring | DB function to calculate performance metrics |
| Modern UI/UX | React + Tailwind + Motion with dark mode, animations, responsive design |
| Unified Payment System | Shared PaymentSystem component with split tender, bank accounts, receipt upload |
| ERP Integration | Native folio posting, GL transaction registration, chart of accounts linkage |

---

## 7. Code Quality Observations

| Issue | Severity | Location |
|-------|----------|----------|
| `POSModule.tsx` is 2,370 lines in a single file | High | Monolithic component, hard to maintain |
| `BarPOSModule.tsx` is 2,300 lines | High | Should be split into sub-components |
| `MenuManagementModule.tsx` is 1,300 lines | Medium | Should be split by feature |
| Manager PIN hardcoded as `1234` | Critical | `POSModule.tsx:520,551` |
| KDS uses real DB-backed tickets via API | Resolved | `KitchenDisplayModule.tsx`, `kds.routes.ts` |
| `any` type used extensively | Low | Throughout F&B components |
| No unit tests for F&B module | High | `tests/` only has executive KPI tests |
| No error boundaries on F&B modules | Medium | Single component crash takes down portal |
| Migration 127 sync tables created but unused by frontend | Medium | `POSModule.tsx` lacks offline mode |
| `kds_orders` table has no `CREATE TABLE` migration in repo | Medium | Table exists in DB but no migration file creates it — reproducibility risk |
| KDS uses 15-second polling instead of Supabase Realtime | Medium | `KitchenDisplayModule.tsx` — should use `.channel()` subscription for instant updates |
| `kds.routes.ts` is 696 lines in a single file | Low | Could be split into instance, connection, ticket, and performance route modules |

---

## 8. Recommendations (Priority Order)

1. **~~P1 - Connect KDS to POS~~** ✅ Resolved — KDS is now DB-backed with auto-routing, standalone instances, external POS webhook, expo view, performance metrics, and course grouping. **Remaining:** Add Supabase Realtime subscription to replace 15-second polling
2. **P2 - Hardware integration:** Add ESC/POS receipt printer support via WebUSB or network printing; integrate payment terminal SDK
3. **P3 - DB-verified manager auth:** Replace hardcoded PIN with backend endpoint verifying user role + PIN hash
4. **P4 - Enable RLS on core F&B tables:** Add `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` + authenticated policies for all core F&B tables (`outlets`, `menu_items`, `ingredients`, `recipes`, `orders`, `order_lines`, `stock_transactions`, `wastage_logs`, `banquet_events`, `requisitions`)
5. **~~P5 - Restaurant POS offline mode~~** ⚠️ Partial — `pos_sync_queue` (migration 177) and sync endpoint ready. **Remaining:** Integrate offline mode into `POSModule.tsx` frontend (queue transactions locally, flush on reconnect)
6. **P6 - Modifier groups:** Add `menu_modifier_groups` and `menu_modifiers` tables; update MenuManagementModule and POSModule
7. **P7 - Allergen/nutrition data:** Add `allergens` and `nutrition` JSONB columns to `menu_items`; display in menu and POS
8. **P8 - Time-based pricing:** Create `pos_time_based_pricing_rules` table with time windows and rate adjustments; wire to `time_based_pricing_rule_id` on `pos_menu_items`; apply automatically in POS checkout
9. **Refactor large files:** Split POSModule and BarPOSModule into sub-components (cart, checkout, shift management, table management)
10. **Add `kds_orders` CREATE TABLE migration:** The table exists in the DB but has no migration file — add a backfill migration for repo reproducibility
11. **KDS Realtime:** Replace 15-second polling in `KitchenDisplayModule.tsx` with Supabase Realtime `.channel()` subscription on `kds_orders` table for instant ticket updates

---

## 9. Summary

**Score: 7.5/10 vs Oracle Simphony** (up from 6.5/10)

**Strong in:** POS core (split/merge/transfer), table management, inventory, recipe costing, procurement lifecycle, guest meal validation, banquet management, UI/UX, ERP integration, **outlet registry framework (config-driven outlet creation), unified transaction shape, standalone KDS with multi-POS connectivity, external POS webhook integration, tax profiles & GL mappings, terminal registration, shift reconciliation, menu versioning, offline sync queue with idempotency, inventory strategy pattern (recipe/SKU auto-deduction), KDS course grouping with auto-fire, KDS station performance analytics, KDS↔POS bidirectional feedback loop**

**Weak in:** Hardware integration, offline resilience (restaurant POS frontend), RLS on core F&B tables, manager auth security (hardcoded PIN), modifier groups, allergen/nutrition, time-based pricing engine (schema ready, no engine), multi-currency, KDS realtime (polling vs WebSocket), code maintainability (large monolithic files)

The portal covers approximately **72%** of Oracle Simphony's F&B feature set (up from ~60%). The POS/KDS architecture overhaul (migrations 175-178) closed the critical KDS gap, added enterprise-grade outlet registry/tax/GL/terminal/shift infrastructure, and introduced a standalone KDS that exceeds Oracle's proprietary-only KDS by supporting third-party POS systems. The remaining ~28% represents hardware ecosystem, frontend offline integration, allergen compliance, modifier matrix, time-based pricing engine, multi-currency, and realtime KDS updates. The existing architecture (Postgres, React frontend, REST API with permission middleware) is sound and extensible enough to support these additions.
