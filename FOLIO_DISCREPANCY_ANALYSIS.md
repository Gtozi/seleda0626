# Frontend/Backend Folio Balance Discrepancy Analysis

## Executive Summary

The system has **two parallel, disconnected billing engines** that calculate charges, discounts, fees, and tax independently. This architectural split causes persistent balance discrepancies between the frontend (React/TypeScript) and backend (PostgreSQL/Supabase), leading to blocked payments, incorrect overpayment warnings, and guest-facing errors.

## Root Cause: Dual Billing Engines

### Frontend Billing Engine
**Location**: `@/Users/.../src/utils/billing.ts:93-156` (`calculateFolioComponents`)
**Data Source**: `reservation.charges` (JSONB array on reservations table)
**Settings Source**: `globalHotelSettings.feeComponents` (React context, synced to DB)

**Calculation Order**:
1. `subtotal` = sum of all non-voided charges from `reservation.charges`
2. `discountAmt` = `subtotal` × `reservation.discountPercent` / 100
3. `taxableSubtotal` = `subtotal` - `discountAmt`
4. **Phase 1**: Iterate `feeComponents`, skip VAT/tax, calculate fees on `taxableSubtotal`
5. **Phase 2**: Calculate VAT on `(taxableSubtotal + non-VAT fees)`
6. `total` = `taxableSubtotal` + `non-VAT fees` + `VAT`

**Used By**:
- `CheckInOutModule.tsx` displays folio math
- `ReservationContext.tsx` syncs `totalAmount` back to DB
- Payment validation (overpayment guard)

### Backend Billing Engine
**Locations**:
- `check_in_reservation` RPC (`@/Users/.../supabase/schema.sql:692-848`)
- `post_folio_charge` RPC (`@/Users/.../supabase/schema.sql:920-1078`)
**Data Source**: `folio_lines` + `folio_payments` tables
**Settings Source**: `global_settings.fee_components` (database table)

**Calculation Order in `check_in_reservation`** (after migration 058):
1. `v_base_amount` = `reservation.total_amount` (pre-tax base)
2. Insert room charge line for `v_base_amount`
3. If `discount_percent > 0`: insert discount line (negative amount)
4. `v_discounted_base` = `v_base_amount` - `discount_amount`
5. **Phase 1**: Iterate `global_settings.fee_components`, skip VAT/tax, calculate fees on `v_discounted_base`
6. **Phase 2**: Calculate VAT on `(v_discounted_base + non-VAT fees)`
7. Update `folios.balance` = `v_discounted_base` + fees + VAT

**Calculation Order in `post_folio_charge`**:
1. `v_base_amount` = `p_amount` (parameter, **no discount applied**)
2. Insert base charge line for `v_base_amount`
3. **Phase 1**: Iterate `global_settings.fee_components`, skip VAT/tax, calculate fees on `v_base_amount`
4. **Phase 2**: Calculate VAT on `(v_base_amount + non-VAT fees)`
5. Update `folios.balance` incrementally

**Used By**:
- `/api/reservations/:id/charges` endpoint
- `/api/reservations/:id/payments` endpoint
- `/api/reservations/:id/folio-balance` endpoint (authoritative source for payment validation)

## Specific Discrepancy Sources

### 1. Discount Application Mismatch
**Frontend**: Discount applied in `calculateFolioComponents` to subtotal before fee/tax calculation
**Backend - `check_in_reservation`**: Discount applied (after migration 058) before fee/tax calculation
**Backend - `post_folio_charge`**: **No discount applied** - uses `p_amount` directly

**Impact**: Any charge added via `/charges` after check-in (e.g., room service, extras) will have fees and VAT calculated on the undiscounted amount, while the frontend assumes discount was applied. This causes permanent balance divergence for reservations with discounts.

### 2. Data Model Duality
**Frontend**: Uses `reservation.charges` (JSONB array) and `reservation.payments` (JSONB array)
**Backend**: Uses `folios`, `folio_lines`, `folio_payments` tables

**Impact**: These are **separate ledgers** that can diverge:
- Frontend may have charges not yet posted to `folio_lines`
- Backend may have `folio_lines` not reflected in frontend's `reservation.charges`
- No synchronization mechanism exists between the two systems

### 3. Settings Synchronization Gap
**Frontend**: Reads from `globalHotelSettings.feeComponents` (React context in `SystemContext.tsx`)
**Backend**: Reads from `global_settings.fee_components` (PostgreSQL table)

**Impact**: While `updateGlobalHotelSettings()` calls `supabaseService.updateGlobalSettings()` to sync to DB, there's no guarantee:
- Frontend state is always fresh from DB
- Both sides use the same fee component ordering
- Fee component structure matches exactly (e.g., `feeType` vs `fee_type`)

### 4. `reservation.total_amount` Semantics Conflict
**Frontend**: Writes tax-inclusive `adjustedTotal` to `reservation.total_amount` via sync effect in `CheckInOutModule.tsx:508-525`
**Backend**: Treats `reservation.total_amount` as pre-tax base in `check_in_reservation`

**Impact**: If the sync effect fires before check-in, `total_amount` becomes tax-inclusive. Then `check_in_reservation` applies fees and VAT on top of the already-taxed number, causing **double taxation** and permanent balance drift.

**Fix Applied**: Modified sync effect to write pre-tax `subtotal` only before check-in, and never after `CheckedIn`/`Completed` status.

### 5. Empty Folio Shell Bug
**Location**: `ensureFolio()` in `@/Users/.../server.ts:2818-2935`

**Bug**: When creating a folio before `check_in_reservation` runs (e.g., pre-arrival payment), the old code created an empty folio with zero `folio_lines`. Since balance is always computed from `folio_lines`, such folios always report `$0.00` outstanding, blocking any payment.

**Impact**: Frontend shows correct amount due from `reservation.charges`, but backend balance is `$0.00` → overpayment guard blocks legitimate payments.

**Fix Applied**: `ensureFolio()` now posts initial room charge via `post_folio_charge` RPC with discount applied, ensuring folio has real lines from creation. Migration 059 backfills existing empty folios.

### 6. Folio Duplication Race Condition
**Location**: `ensureFolio()` SELECT-then-INSERT pattern

**Bug**: Concurrent requests (double-click, retries) could create duplicate open folios for the same reservation. Each folio accumulated its own subset of charges/payments, causing inconsistent balances.

**Impact**: Balance queries might hit the wrong folio, showing incorrect amounts. Payments might post to the wrong folio.

**Fix Applied**:
- Partial unique index `uq_folios_open_reservation_target` on `(reservation_id, target_folio)` where `status='Open'` (migration 057)
- Race recovery: on unique violation, re-query and return the winning folio
- Migration 057 merges existing duplicate folios (re-parent lines/payments, close duplicates)

## Timing/Ordering Issues Causing State Drift

### Pre-Checkin Charge/Posting Flow
1. User enters reservation → `addReservation()` writes charges to `reservation.charges` (JSONB)
2. User attempts payment → `ensureFolio()` creates folio (now with initial charge after fix)
3. Payment posted via `/payments` → `folio_payments` row created
4. Frontend calculates balance from `reservation.charges` + `reservation.payments`
5. Backend calculates balance from `folio_lines` + `folio_payments`

**Drift Point**: If step 1 and step 2 use different charge amounts (e.g., discount applied differently), the two ledgers diverge immediately.

### Checkin Flow
1. User clicks "Check In" → calls `check_in_reservation` RPC
2. RPC creates `folios` row, posts room charge + discount + fees + VAT as `folio_lines`
3. Frontend sync effect in `CheckInOutModule` may fire, overwriting `total_amount`

**Drift Point**: If sync effect writes tax-inclusive total before/after checkin, double taxation occurs. Also, if `reservation.charges` still contain pre-checkin charges, they won't be reflected in new `folio_lines`.

### Post-Checkin Charge Flow
1. User adds extra charge (e.g., room service) → `/charges` endpoint
2. `post_folio_charge` RPC adds base + fees + VAT to `folio_lines`
3. Frontend may or may not update `reservation.charges`

**Drift Point**: No mechanism ensures `reservation.charges` is updated to match new `folio_lines`. Frontend balance calculation becomes stale.

## Architectural Recommendations

### Short-Term Fixes (Already Applied)
1. ✅ Fix discount application in `check_in_reservation` (migration 058)
2. ✅ Fix sync effect to write pre-tax subtotal only before checkin (CheckInOutModule.tsx)
3. ✅ Fix empty folio shell bug by seeding initial charge (server.ts)
4. ✅ Add unique index to prevent folio duplication (migration 057)
5. ✅ Backfill existing empty folios (migration 059)
6. ✅ Make payment/charge endpoints recompute and return authoritative balance (server.ts)

### Long-Term Architectural Changes Needed

#### 1. Single Source of Truth for Ledger
**Current**: Two parallel ledgers (`reservation.charges/payments` vs `folios/folio_lines/folio_payments`)
**Recommended**: Deprecate `reservation.charges` and `reservation.payments` JSONB columns. Use only `folio_lines`/`folio_payments` as the authoritative ledger. Frontend should query these tables directly via API.

#### 2. Unified Fee/Tax/Discount Calculation
**Current**: Frontend and backend have duplicate calculation logic
**Recommended**: Move all fee/tax/discount calculation to a single backend RPC (e.g., `calculate_billing_breakdown`). Frontend calls this RPC to get breakdown for display, ensuring perfect alignment.

#### 3. Settings Validation
**Current**: No validation that frontend and backend fee components match
**Recommended**: Add schema validation or checksum comparison on settings load. Add migration to ensure data consistency.

#### 4. Event-Driven Synchronization
**Current**: No sync between `reservation.charges` and `folio_lines`
**Recommended**: Use database triggers or CDC to maintain a materialized view or denormalized cache for frontend queries, or have frontend always query the authoritative ledger tables directly.

#### 5. Discount in `post_folio_charge`
**Current**: `post_folio_charge` doesn't apply discount
**Recommended**: Add optional `p_discount_percent` parameter to `post_folio_charge` so post-checkin charges can also be discounted, matching frontend expectations.

## Files Modified to Fix Immediate Issues

- `@/Users/.../supabase/migrations/057_fix_folio_duplication_and_balance.sql` - merge duplicates, add unique index
- `@/Users/.../supabase/migrations/058_checkin_discount_fix.sql` - fix discount application in checkin
- `@/Users/.../supabase/migrations/059_backfill_empty_folio_charges.sql` - fix empty folios
- `@/Users/.../server.ts` - fix `ensureFolio`, update `/charges`/`/payments` to recompute balance
- `@/Users/.../src/components/FrontDesk/CheckInOutModule.tsx` - fix sync effect to prevent double taxation

## Verification Steps

After applying migrations 057, 058, and 059:

1. Verify no duplicate open folios exist:
   ```sql
   select reservation_id, target_folio, count(*) 
   from folios 
   where status = 'Open' 
   group by reservation_id, target_folio 
   having count(*) > 1;
   ```

2. Verify folios with real reservations have lines:
   ```sql
   select f.id, f.reservation_id, r.total_amount, 
          (select count(*) from folio_lines where folio_id = f.id) as line_count,
          f.balance
   from folios f
   join reservations r on r.id = f.reservation_id
   where f.status = 'Open' and r.total_amount > 0
     and (select count(*) from folio_lines where folio_id = f.id) = 0;
   ```

3. Test a full flow: create reservation → check in → add charge → post payment → verify frontend and backend balances match
