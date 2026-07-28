# SELEDA ERP — Food & Beverage Portal: Full Architecture with Cross-Portal Integration

Grounded in the actual implemented system (`FB_PORTAL_AUDIT.md`) and the menu-type/POS-KDS plug-in improvement plan. This is the consolidated architecture: what F&B Portal is, what it owns, how its POS/KDS plug-in layer works, how menu types are modeled, and — new in this version — exactly how it connects to every other portal in the ERP.

---

## 1. Purpose & Ownership Boundary

F&B Portal is the **content, commercial, and operational management layer for food & beverage**. It authors what's sold and how, and reports on how it performs. It does not own physical infrastructure, execute transactions, or post accounting entries directly — those stay with the systems already responsible for them.

| Owned by F&B Portal | Owned elsewhere |
|---|---|
| Menu authoring (à la carte / table d'hôte / fixed course), courses, choice sets | Outlet, terminal, prep station records → **System Admin** |
| Menu ↔ Outlet assignment; menu ↔ KDS-instance routing granularity | Transaction execution, ticket lifecycle, inventory deduction, folio posting, GL/tax → **POS/KDS engine** |
| Recipe-to-menu assignment, pricing, 86/availability control | Recipe/BOM cost definitions, supplier/PO lifecycle → **Procurement & Stores** |
| Menu engineering & food-cost reporting | GL posting, AP, tax compliance → **Finance & Accounting** |
| Banquet/BEO content and per-head pricing | Event booking/sales pipeline → **Sales & Events** |
| Guest meal-plan entitlement rules | Folio balance, room charge posting → **Front Office** |

---

## 2. Core Data Model (real schema, not abstract)

### 2.1 Existing, unchanged

- `pos_outlets` — outlet master (System Admin owned)
- `prep_stations` — kitchen/bar/pastry stations, linked to outlets
- `pos_menu_items` — item master: price, `prep_station_id`, `recipe_id`, `item_type`, `requires_kds`
- `kds_instances`, `kds_pos_connections`, `kds_external_pos_systems` — standalone KDS plug-in framework
- `pos_transactions`, `order_lines`, `kds_orders` — canonical transaction and ticket pipeline
- `pos_tax_profiles`, `pos_gl_mappings`, `pos_terminals`, `pos_shifts` — outlet financial config

### 2.2 New — Menu-type model

```
pos_menus                 (menu_id, name, menu_type[a_la_carte|table_dhote|fixed_course],
                            base_price, day_part, status, valid_from/to)
pos_menu_courses           (course_id, menu_id, sequence_number, name, choice_count, fire_mode)
pos_menu_course_items      (menu_id, course_id[nullable], item_id → pos_menu_items,
                            price_override, is_supplement, supplement_price)
pos_menu_outlet_assignments (menu_id, outlet_id, is_primary, active_from/to)
```

### 2.3 New — Station-level POS↔KDS routing

```
kds_pos_connections.prep_station_id  -- nullable FK added to prep_stations
  NULL      = connection is the outlet-wide catch-all (today's behavior, unchanged)
  NOT NULL  = connection routes only that station's tickets to that KDS instance
```

Resolution order at ticket-creation: match `(outlet_id, prep_station_id)` first, fall back to `(outlet_id, station_id IS NULL)`. This is what lets a single outlet split Kitchen tickets to one standalone KDS box and Bar Prep tickets to another.

### 2.4 New — line-item context (additive fields, no new table)

`menu_id`, `course_id` added (nullable) to the line-item shape already flowing through `pos_transactions` / `order_lines` / `kds_orders`, alongside the existing `item_id` / `prep_station_id`. Routing still runs entirely off `prep_station_id` — the menu fields exist for course-fire logic and menu-margin reporting only.

---

## 3. POS/KDS Plug-In Architecture

- **Standalone KDS instances** connect to one or more POS outlets via `kds_pos_connections`, now station-scoped (§2.3). A property can run a dedicated Kitchen KDS and a dedicated Bar KDS off the same outlet, or one shared KDS across two outlets that feed the same central kitchen — both patterns already supported by the many-to-many shape.
- **External POS systems** register via `kds_external_pos_systems` and push orders through the existing API-key-authenticated webhook (`POST /external/:apiKey/orders`) — a third-party POS never needs direct database access; it only needs to emit the canonical transaction shape.
- **Menu resolution at checkout**: any POS terminal (native or external) calls the outlet's active-menus endpoint, which joins `pos_menu_outlet_assignments` → `pos_menu_course_items`, so a plugged-in external POS sees the same menu/course/pricing structure as the native terminal — no separate menu sync process to maintain.
- **KDS ticket splitting**: unchanged mechanism — one order fans out into per-`prep_station_id` tickets — now delivered to the *correct KDS instance* per station rather than only per outlet.

---

## 4. Menu Type Handling

| Menu Type | Course structure | Pricing | Fire behavior |
|---|---|---|---|
| À la carte | None (`course_id = null`) | Per item | Immediate fire on confirm |
| Table d'hôte | `pos_menu_courses` with `choice_count > 1` | `pos_menus.base_price`, cost tracked per actual item chosen | Course 1 fires immediately; later courses held until prior course served (existing fire-course endpoint) |
| Fixed full course | `pos_menu_courses` with `choice_count = 1` | Set price + optional supplements (`is_supplement`) | Same hold/fire mechanism, typically stricter pacing target |

This reuses the KDS course-grouping/auto-fire capability the audit already lists as a strength — it's now driven by structured `pos_menu_courses` data instead of ad hoc grouping.

---

## 5. Portal Structure (Screens)

Builds on the existing 16-tab F&B Portal rather than replacing it:

| Existing tab | Change |
|---|---|
| Menu Management | Add Menu Builder (menu type, courses, choice sets, item assignment, price overrides) and Outlet Assignment panel |
| Kitchen Display | No change to ticket UI; benefits from correct per-station instance routing automatically |
| Dashboard / Analytics / Standard Reports | Add menu-type-aware food cost and menu engineering views (§7) |

Admin-side (existing components, extended not replaced):

| Component | Change |
|---|---|
| `KDSInstanceManagement.tsx` | Add station-level connection picker; add "which instance serves which station" summary view |
| `POSOutletManagement.tsx` | Unchanged — still owns the outlet record itself |

---

## 6. Cross-Portal Integration

This is the layer that was previously implicit — made explicit here.

| Portal | Direction | Integration |
|---|---|---|
| **System Admin** | F&B reads | Outlet, PrepStation, Terminal, TaxProfile, GLMapping, RBAC roles — F&B never writes these directly |
| **Front Office (PMS/Folio)** | F&B writes, FO owns balance | Room-charge orders post to guest folio via the existing POS transaction pipeline; Guest Meal Validation module checks meal-plan entitlement (BB/HB/FB/Conference/Corporate/Group) against Front Office's reservation data before allowing a "no-charge" meal |
| **Procurement & Stores** | Bidirectional | F&B's recipe/BOM consumption drives stock deduction (Recipe/SKU strategy pattern) on every POS transaction; Procurement's supplier/PO/goods-receipt/invoice lifecycle and three-way matching feed ingredient cost back into recipe plate-cost, which in turn feeds F&B's food-cost and menu-engineering reporting |
| **Finance & Accounting** | F&B writes, Finance owns ledger | Every `pos_transaction` posts a GL entry via `pos_gl_mappings` (USALI-compliant revenue/COGS/tax accounts); F&B never posts directly to the GL — it only supplies correctly tagged transactions. Supplier invoices from Procurement flow to Finance AP. |
| **Sales & Events** | Bidirectional | Banquet/BEO content (menu, per-head pricing) is authored in F&B but the event booking, contract, and deposit lifecycle lives in Sales & Events; BEO generation pulls confirmed event data from there |
| **Executive Portal** | F&B → Executive | Revenue, food cost %, menu engineering matrix, void rate, wastage feed the cross-department KPI catalog and GOPPAR-level rollups already defined there |
| **Operations Manager Portal** | F&B → Ops Manager | Per-outlet status cards (health indicator, headline metric), daily ops summary, shift handover log, escalation queue entries (e.g. repeated 86 events, KDS station SLA breaches) |
| **Guest Portal / Online Ordering** | F&B → Guest-facing | Public menu display is the same `pos_menu_outlet_assignments` → `pos_menu_course_items` data, filtered to guest-visible outlets; online orders re-enter through the same canonical transaction pipeline as any other outlet |
| **HR & Payroll** | Reference only | F&B Staff Management schedules against HR's staff master; labor cost feeds F&B's cost reporting but shift/payroll processing itself stays in HR & Payroll |

**Principle carried through all of these:** F&B Portal is a producer of correctly-shaped data (transactions, GL-tagged revenue, KPI feeds, guest-facing menu content) into systems that own their own domain — it does not duplicate ledgers, guest master data, staff master data, or booking pipelines.

---

## 7. Reporting & Analytics

- **Menu engineering matrix** (Stars/Plowhorses/Puzzles/Dogs) — existing `menuAnalytics.routes.ts`, now menu-type-aware: table d'hôte/fixed-course items get realized cost computed from actual served item mix, not list price.
- **Course pacing report** — average time between course fires vs. `fire_mode` target, new with the course model.
- **86 frequency report** — which items get pulled most often, by outlet/reason.
- **Station-level KDS performance** — existing capability, now correctly attributable per KDS instance once station-level routing is in place.
- All roll up into Executive/Operations Manager Portal per §6.

---

## 8. Security & Compliance (carried from the audit, unchanged priority)

This architecture doesn't fix these, but nothing here should ship without them, since new tables extend the same surface:
- New menu tables (`pos_menus`, `pos_menu_courses`, `pos_menu_course_items`, `pos_menu_outlet_assignments`) ship with **RLS enabled from day one** — the audit's P2 gap on core F&B tables should not be repeated.
- Manager PIN (P1) and offline mode (P4) fixes are independent of this work and should proceed in parallel, not be blocked by it.

---

## 9. Rollout Sequence

1. Migration: new menu tables + `kds_pos_connections.prep_station_id`, additive/nullable only.
2. Backfill: every existing outlet gets one `a_la_carte` menu wrapping its current items — zero re-entry, zero downtime.
3. KDS routing logic: station-specific lookup with outlet-catch-all fallback.
4. Menu Builder + KDS station-routing UI ship as additive screens.
5. Cross-portal reporting feeds (§6/§7) wired to Executive/Operations Manager Portal.
6. New table d'hôte / fixed-course menus become buildable, opt-in per outlet.

---

