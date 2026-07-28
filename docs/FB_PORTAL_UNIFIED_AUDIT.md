# SELEDA F&B Portal — Unified Multi-Outlet Consistency Audit

> **Audit Date:** July 2026  
> **Scope:** Consistency of the F&B portal as a single, cohesive system for a modern hotel with multiple kitchens and bars, compared to modern ERP F&B portals.  
> **Benchmarks:** Oracle Hospitality OPERA Cloud F&B / Simphony, Infor HMS F&B, Mews POS, Apicbase, SAP Customer Checkout, Toast, Lightspeed.

---

## 1. Executive Summary

The SELEDA codebase now contains **three parallel F&B data stacks** rather than one unified portal:

1. **Legacy core F&B stack** (`foodBeverage.routes.ts`, migrations 082/127-129) — outlets, ingredients, menu_items, recipes, orders, inventory, procurement, banquets.
2. **Outlet Registry / POS stack** (`pos.routes.ts`, `kds.routes.ts`, migrations 143, 175-178) — pos_outlets, pos_menu_items, pos_transactions, pos_terminals, KDS, offline sync.
3. **New Kitchen & Bar production stacks** (`KitchenManagementPortal.tsx`, `BarManagementPortal.tsx`, migrations 181-186) — separate `kitchen_*` and `bar_*` tables, services, and UI.

This duplication means the system **does not currently behave as one solid F&B portal**. A guest order placed in the Restaurant POS does not see the same recipe/inventory as the Kitchen Management portal, and the Bar Management portal maintains its own independent inventory. The new Kitchen/Bar portals also appear **non-functional at runtime** because their service layers call routes (`/api/fb/kitchen`, `/api/fb/bar`) that are not mounted in `server.ts`.

**Overall Consistency Grade: 4.5 / 10**  
**Feature Coverage vs. Modern ERP F&B: 7.5 / 10**  
**Unified Architecture Readiness: 3.5 / 10**

---

## 2. What a Modern Unified F&B Portal Looks Like

Modern hotel/ERP F&B platforms are built around a **single source of truth**:

- **One outlet registry.** Every revenue center (restaurant, bar, room service, banquet, spa, gift shop, cloud kitchen) is an `outlet` row with type, tax profile, GL mapping, terminals, and KDS links.
- **One product/menu master.** A menu item has one recipe, one or more price levels, modifier groups, allergens, and outlet availability. The same recipe is used by POS, KDS, production planning, and inventory depletion.
- **One inventory model.** Ingredients/beverages live in a central item master with UOM conversions; stock is tracked by location (main store, kitchen, bar, outlet). Requisitions, transfers, wastage, and POS depletion all post to the same stock ledger.
- **One production/costing engine.** Recipe costing, batch prep, production orders, and yield variance are shared across hot kitchen, pastry, banqueting, and bar prep.
- **One POS transaction model.** All outlets post to a canonical transaction header with line items, taxes, payments, and GL references.
- **One reporting layer.** Food cost %, beverage cost %, theoretical vs. actual usage, and outlet P&L are derived from the same tables.

---

## 3. Consistency Findings

### 3.1 Data Model — Three Divergent Stacks

| Layer | Core F&B (`foodBeverage.routes.ts`) | POS/KDS (`pos.routes.ts`, `kds.routes.ts`) | Kitchen & Bar Portals (migrations 181-186) |
|-------|--------------------------------------|---------------------------------------------|--------------------------------------------|
| Outlets | `outlets` | `pos_outlets` | `kitchen_*` / `bar_*` assume one kitchen/bar per property |
| Menu items | `menu_items` | `pos_menu_items` | `kitchen_recipes`, `bar_recipes` (production recipes) |
| Recipes | `recipes` + `recipe_lines` | `recipe_id` FK on `pos_menu_items` | `kitchen_recipe_ingredients`, `bar_recipe_ingredients` |
| Inventory | `ingredients`, `stock_locations`, `stock_transactions` | `deduct_outlet_inventory()` uses POS outlet inventory | `kitchen_inventory_items`, `bar_inventory_items`, separate batches/locations |
| Orders | `orders` + `order_lines` | `pos_transactions` + `pos_transaction_line_items` | No order concept |
| Production | Banquet event orders only | None | `kitchen_production_orders`, `bar_production_orders` |
| Wastage | `wastage_logs` | POS void/comp reasons | `kitchen_waste`, `bar_waste` |
| Procure-ment | `fb_purchase_orders`, etc. | None | None |

**Impact:** A single hotel with a main kitchen, a pastry kitchen, a lobby bar, a pool bar, and a restaurant cannot operate from one inventory or one recipe book. Purchasing records may be entered in procurement, but depletion happens in the POS stack, and production plans live in the kitchen/bar stack with no bridge between them.

### 3.2 New Kitchen & Bar Portals Are Not Wired to the Backend

- `src/services/kitchenService.ts` calls `/api/fb/kitchen/*`.
- `src/services/barService.ts` calls `/api/fb/bar/*`.
- `server.ts` mounts `/api/food-beverage`, `/api/pos`, `/api/kds`, `/api/fb/*` sub-routes, but **no `/api/fb/kitchen` or `/api/fb/bar` router**.
- No route file `src/server/routes/kitchen.routes.ts` or `bar.routes.ts` exists.

**Impact:** `KitchenManagementPortal.tsx` and `BarManagementPortal.tsx` render a UI but will 404 on every data fetch. They are currently non-functional shells.

### 3.3 Two POS User Experiences

- **F&B Portal POS:** `POSModule.tsx`, `BarPOSModule.tsx`, `RoomServiceModule.tsx` embedded inside `FoodBeveragePortal.tsx`.
- **Standalone POS Portal:** `POSPortal.tsx` → `ModernPOSTerminal.tsx` with its own login, outlet selection, analytics, and settings.

Both target the same `pos_transactions` table and `/api/pos/*` routes, which is good, but the UX is split. Staff may be trained on one screen while managers configure another. The standalone Modern POS is the more modern surface but is not reachable from the F&B portal tab switcher.

### 3.4 KDS Is Strong but Siloed from Kitchen Production

- KDS (`kds_orders`, `kds_instances`, `kds_pos_connections`) is well-architected and multi-outlet capable.
- Kitchen production orders (`kitchen_production_orders`) have no link to KDS tickets or to `pos_transactions`.
- There is no concept of a **prep list** generated from KDS/forecasted covers/BEOs.

### 3.5 Multiple Inventory Ledgers

- Core F&B inventory tracks `ingredients` → `stock_transactions`.
- POS outlet inventory is deducted via `deduct_outlet_inventory()`.
- Kitchen/Bar portals each have independent `*_inventory_items`, `*_batches`, `*_transfers`, `*_waste` tables.

A modern hotel needs **one stock ledger per location**, not per module. Food cost % and theoretical usage cannot be reliably calculated when consumption is recorded in parallel ledgers.

### 3.6 Menu Master Duplication

- `menu_items` (core F&B)
- `pos_menu_items` (POS registry)
- `kitchen_recipes` (production recipes)
- `bar_recipes` (drink recipes)

Modern ERPs use a single product master with attributes that differ by outlet/type. SELEDA currently requires maintaining the same dish in up to four places.

### 3.7 Reporting Fragmentation

- `FBDashboard.tsx` pulls aggregate KPIs from `/api/food-beverage/kpis`.
- POS analytics pull from `/api/pos/*`.
- Kitchen/Bar dashboards would pull from non-existent endpoints.
- No consolidated **theoretical vs. actual food cost** report spans all three stacks.

---

## 4. Comparison to Modern ERP F&B Portals

| Capability | SELEDA Today | Modern ERP (Oracle / Infor / Mews / Apicbase) | Gap |
|-----------|--------------|-------------------------------------------------|-----|
| Single outlet registry | Partial — `pos_outlets` is the strongest model, but legacy `outlets` and kitchen/bar portals still exist | One `outlet` table drives POS, KDS, production, purchasing, GL | **Medium** |
| Multi-kitchen / multi-bar support | Not unified — separate kitchen/bar tables with no outlet FK | Each kitchen/bar is an outlet with its own production plan, inventory location, and KDS station | **High** |
| Unified menu/product master | No — four overlapping tables | One menu master, recipes, modifiers, allergens, prices | **High** |
| Central inventory + outlet transfers | Partial in core F&B; duplicated in kitchen/bar | One stock ledger, transfers, requisitions, wastage | **High** |
| Recipe costing & production planning | Partial — recipe costing exists; production orders are siloed | Recipe → production plan → prep list → KDS → depletion | **High** |
| POS offline resilience | Bar POS uses localStorage; Restaurant POS lacks offline sync | SQLite/local-first POS with conflict resolution | **Medium** |
| Modifier groups / allergens / nutrition | Missing | Standard compliance features | **High** |
| Time-based pricing / happy hour | Schema field only, no engine | Built-in time/schedule pricing | **Medium** |
| Hardware integration | No printer/payment terminal drivers | Native peripherals | **High** |
| Banquet → folio posting | Missing | Auto post banquet charges to group folio | **Medium** |
| Manager PIN security | Hardcoded `1234` | DB-verified role + hashed PIN | **Critical** |
| Real-time KDS | 15-second polling | WebSocket / Supabase Realtime | **Medium** |
| Unified reporting | Fragmented | Single P&L, food/beverage cost %, theoretical usage | **High** |

---

## 5. Critical Issues for a Multi-Kitchen / Multi-Bar Hotel

1. **Kitchen/Bar portals cannot be used** until `/api/fb/kitchen` and `/api/fb/bar` routes are written and mounted.
2. **A hotel with two kitchens and two bars** cannot route orders, inventory, and production through one workflow.
3. **Food cost % will be wrong** if recipe depletion happens in one stack while wastage is logged in another.
4. **Purchasing cannot auto-suggest reorder quantities** because inventory is split across `ingredients`, `kitchen_inventory_items`, and `bar_inventory_items`.
5. **Staff will see different recipes** in POS vs. kitchen production vs. core menu builder.
6. **Audit/compliance risk** from hardcoded manager PIN and missing RLS on core F&B tables.

---

## 6. Recommended Unification Roadmap

### Phase 1 — Make the New Portals Functional (Immediate)
1. Create `src/server/routes/kitchen.routes.ts` and `bar.routes.ts` and mount them in `server.ts`.
2. OR deprecate the new portals and fold their functionality into the core F&B portal.

### Phase 2 — Converge on One Data Model (Short Term)
1. Treat `pos_outlets` as the canonical outlet registry (it already has type, tax, GL, terminal, KDS links).
2. Merge `menu_items`, `pos_menu_items`, `kitchen_recipes`, and `bar_recipes` into a single `menu_items`/`products` master with:
   - `outlet_id(s)` availability
   - `recipe_id` for BOM
   - `modifier_groups`
   - `allergens`, `nutrition`
   - `time_based_pricing_rule_id`
3. Replace `kitchen_inventory_items`/`bar_inventory_items` with the existing `ingredients`/`stock_locations`/`stock_transactions` model, adding:
   - `outlet_id` / `stock_location_id` per kitchen/bar
   - batch/expiry tracking
   - FEFO/FIFO pick strategy
4. Link production orders to `outlet_id`, `recipe_id`, and KDS `prep_station_id`.

### Phase 3 — Build the Unified Operations Layer (Medium Term)
1. **Central production planning:** Generate prep lists from reservations, BEOs, and forecasted covers; push tasks to KDS.
2. **Cross-outlet transfers:** One requisition/transfer workflow from main store to any kitchen/bar/outlet.
3. **Theoretical vs. actual cost:** Compute from POS sales × recipe cost vs. actual stock depletion.
4. **Unified offline POS:** Apply the existing `pos_sync_queue` pattern to all POS clients.

### Phase 4 — Compliance & Modern ERP Parity (Medium Term)
1. Replace hardcoded manager PIN with a backend-verified, hashed PIN per user/role.
2. Add RLS policies to all core F&B tables.
3. Implement modifier groups, allergens, nutrition, time-based pricing.
4. Add hardware printer/payment terminal integration.

---

## 7. Conclusion

SELEDA has **broad feature coverage** for a modern hotel F&B operation, but the recent introduction of separate Kitchen and Bar management portals has **increased architectural fragmentation** rather than reducing it. To become a single, solid F&B portal for a hotel with multiple kitchens and bars, the system must converge on:

- **One outlet registry**
- **One menu/product master**
- **One inventory ledger**
- **One recipe/production engine**
- **One POS transaction model**
- **One reporting layer**

Until this convergence is complete, the F&B module will feel like a collection of adjacent tools rather than one cohesive ERP F&B portal.
