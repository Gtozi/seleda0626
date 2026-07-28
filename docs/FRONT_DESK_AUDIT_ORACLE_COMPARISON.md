# SELEDA Front Desk Portal Audit — Oracle Opera (Cloud) Comparison

> **Audit Date:** July 2026  
> **Scope:** All front desk portal components, backend routes, database functions, and context providers  
> **Benchmark:** Oracle Hospitality Opera Cloud (PMS)

---

## 1. Executive Summary

The SELEDA Front Desk Portal is a substantially capable PMS front-of-house module built on React + Express + Supabase/Postgres. It covers the majority of core Oracle Opera front desk workflows, and in several areas (predictive room allocation, split-folio routing, waitlist management) it introduces innovations that Opera lacks natively. However, there are critical gaps in transactional integrity, multi-property support, group/reservation series management, and reporting depth that prevent it from being a true Opera equivalent.

**Overall Maturity Score: 6.5 / 10** (vs Oracle Opera as 10/10 benchmark)

---

## 2. Module Inventory

The front desk portal (`FrontDeskPortal.tsx`) exposes 7 top-level tabs:

| Tab | File | Lines | Oracle Opera Equivalent |
|---|---|---|---|
| Dashboard | `DashboardModule.tsx` | 1,437 | Quick Keys / Dashboard |
| Reservations | `ReservationsModule.tsx` | 3,088 | Reservations module |
| Folio Management | `FolioPortal.tsx` -> `CheckInOutModule.tsx` | 2,542 | Billing / Folio |
| CRM | `CRMModule.tsx` | 2,701 | Profiles / CRM |
| Reports | `ReportsAuditModule.tsx` | 3,675 | Reports module |
| Standard Reports | `StandardFrontDeskReports.tsx` | 14 | Opera Standard Reports |
| Inventory | `OfficeInventoryModule.tsx` | ~600 | N/A (unique to SELEDA) |

Supporting components: `ReservationForm.tsx`, `ModernCalendar.tsx`, `ReservationsForecasting.tsx`, `NightAuditChecklistModal.tsx`, `DocumentVerificationModal.tsx`, `GroupProfileModule.tsx`, `GiftShopPOS.tsx`, `FolioPaymentAudit.tsx`.

---

## 3. Feature-by-Feature Comparison

### 3.1 Reservations Management

| Feature | SELEDA | Oracle Opera | Gap |
|---|---|---|---|
| Create individual reservation | Full form with react-hook-form + zod | Full | None |
| Group bookings | groupBookings, GroupProfileModule | Advanced | Partial - no group block allotment management from front desk |
| Corporate bookings | Corporate accounts with split billing | Full | None |
| Waitlist management | promoteFromWaitlist, waitlisted default | Full | SELEDA exceeds Opera here |
| Walk-in check-in | Rapid walk-in form with immediate check-in | Full | None |
| Reservation calendar | ModernCalendar.tsx | Full | None |
| OTA/GDS integration | Tab exists but no real channel manager | Full 2-way sync | Major gap |
| Reservation series/recurring | Not implemented | Full | Gap |
| Share reservations (shared folio) | Not implemented | Full | Gap |
| Cancellation with penalty | Policy configured but no auto-charge on cancel | Auto-charge | Gap |
| No-show processing | Not found | Auto-charge + status | Gap |
| Overbooking management | calculateOverbookingRisk in dashboard | Manual | SELEDA exceeds |
| Rate plans / yield management | Rate plans, seasons, yield policies | Full RMS | Partial - no dynamic pricing engine |

### 3.2 Check-In / Check-Out

| Feature | SELEDA | Oracle Opera | Gap |
|---|---|---|---|
| Individual check-in | check_in_reservation RPC | Full | None |
| Group check-in | checkInGroupBooking batch loop | Full | None |
| Room assignment | Manual + auto-assign + predictive AI | Manual | SELEDA exceeds |
| Room change | change_room RPC | Full | None |
| Check-out | Folio close + invoice generation | Full | None |
| Express check-in/out | Mobile portal has it; front desk does not | Full | Minor gap |
| Pre-registration | Not implemented | Full | Gap |
| Key card integration | Not implemented | Hardware integration | Gap (expected for non-cloud) |
| ID document scanning | DocumentVerificationModal + upload | Full | None |
| Signature capture | Canvas-based signature pad | Full | None |
| Check-in registration form print | window.print() | Full | None |

### 3.3 Folio / Billing

| Feature | SELEDA | Oracle Opera | Gap |
|---|---|---|---|
| Single guest folio | folios table + API | Full | None |
| Split folio (A/B) | Corporate/group split with routing rules | Full | None |
| Folio routing profiles | splitFolioRules in global settings | Full | None |
| Charge posting | post_folio_charge via API | Full | None |
| Payment posting | Split payments, bank accounts, receipts | Full | None |
| Charge voiding | voidFolioCharge | Full | None |
| Payment voiding | voidFolioPayment | Full | None |
| Charge moving | moveFolioCharge between reservations | Full | None |
| Invoice generation | /api/folios/:id/generate-invoice | Full | None |
| Folio close with invoice | /api/folios/:id/close-with-invoice | Full | None |
| Tax/Service charge/Discount | Configurable per-reservation + global | Full | None |
| City ledger / AR posting | post_folio_to_ar function | Full | None |
| Voucher redemption | redeem_voucher function | Full | None |
| Deposit management | DepositSection.tsx | Full | None |
| Package charging | Daily/one-time packages | Full | None |

### 3.4 Guest CRM / Profiles

| Feature | SELEDA | Oracle Opera | Gap |
|---|---|---|---|
| Guest profile CRUD | Full | Full | None |
| Profile dedup / match | findMatchingGuest engine | Full | None |
| Guest preferences | Room type, pillow, dietary, language | Full | None |
| Stay history | history: StayHistory[] | Full | None |
| VIP handling | VIP status + dashboard alerts | Full | None |
| Loyalty points | Stored but no accrual engine | Full loyalty module | Gap |
| Guest notes | Append notes with date | Full | None |
| ID documents | Upload + verification modal | Full | None |
| Corporate accounts | Full CRUD + billing | Full | None |
| Group profiles | GroupProfileModule.tsx | Full | None |
| Guest communications | Message hub with reply | Full | None |
| Guest mobile portal | Separate route module | Full | None |
| Privacy/GDPR compliance | No data retention or purge | Full | Gap |

### 3.5 Night Audit

| Feature | SELEDA | Oracle Opera | Gap |
|---|---|---|---|
| Night audit checklist | 5-step modal | Full | None |
| Auto room charge posting | run_night_audit RPC | Full | None |
| Allotment release | release_expired_allotments | Full | None |
| Business date rollover | currentSystemDate | Full | None |
| Exception logging | In checklist modal | Full | None |
| High-balance folio review | In checklist | Full | None |
| Room status discrepancy check | In checklist | Full | None |
| Audit handover notes | In checklist | Full | None |
| Scheduled/automated audit | scheduler.ts job handler | Full | None |

### 3.6 Reporting

| Feature | SELEDA | Oracle Opera | Gap |
|---|---|---|---|
| Standard reports | StandardReportView component | 200+ reports | Major gap - unknown report count |
| Daily reports | ReportsAuditModule.tsx (3,675 lines) | Full | None |
| Custom report builder | Not found | Full | Gap |
| Report scheduling/emailing | Placeholder in scheduler | Full | Gap |
| Export (PDF/Excel/CSV) | reportExportUtils.ts | Full | None |
| Revenue analytics | Dashboard charts | Full | None |
| Forecasting | ReservationsForecasting.tsx | Full (Opera RMS) | None |
| Audit trail | writeAuditEvent + structured logs | Full | None |

### 3.7 Room Management

| Feature | SELEDA | Oracle Opera | Gap |
|---|---|---|---|
| Room status management | Vacant Clean/Dirty, Occupied, OOO, Maintenance | Full | None |
| Room type management | CRUD via API | Full | None |
| Room features/attributes | features field | Full | None |
| Housekeeping integration | Status sync + notifications | Full | None |
| Out-of-order management | Status + check-in guard | Full | None |
| Room rack / availability grid | ModernCalendar.tsx | Full | None |

---

## 4. Architecture & Technical Comparison

| Aspect | SELEDA | Oracle Opera |
|---|---|---|
| Database | Postgres (Supabase) | Oracle DB / any RDBMS |
| Backend | Express + Supabase Admin | Proprietary microservices |
| Frontend | React + Tailwind | Oracle ADF / Web |
| Multi-property | multiproperty.routes.ts exists but not integrated into front desk | Full multi-property |
| Real-time | Supabase Realtime channels | WebSockets |
| Atomicity | RPC-based check-in (check_in_reservation) | Full |
| API design | REST + ad-hoc | REST + SOAP |
| Authentication | JWT + Supabase Auth | OAuth / SAML / LDAP |
| Offline capability | None | Offline mode |
| Scalability | Single Supabase instance | Enterprise cluster |

---

## 5. Critical Gaps (Priority-Ranked)

### P1 - No-Show & Cancellation Auto-Charge
Cancellation policies are configured in settings (cancellationGraceHours, cancellationPenaltyPercent) but there is no backend function to auto-charge on no-show or cancellation. Opera automatically posts penalty charges when a reservation is cancelled past the grace period or marked no-show.

**Files affected:** `server.ts` (missing endpoint), `ERPContext.tsx` (cancel logic)

### P2 - No OTA/Channel Manager Integration
The Reservations module has an ota tab but it is a UI placeholder with no actual channel manager integration (no Booking.com, Expedia, Airbnb sync). Opera has full 2-way XML/API channel management.

**Files affected:** `ReservationsModule.tsx` (ota tab is empty)

### P3 - No Multi-Property Support in Front Desk
multiproperty.routes.ts exists but the front desk portal has no property selector. All data is single-property. Opera supports switching between properties seamlessly from the front desk.

**Files affected:** `FrontDeskPortal.tsx`, `ERPContext.tsx`

### P4 - No Reservation Series / Recurring Bookings
Cannot create recurring reservations (e.g., corporate client booking every Monday for 6 months). Opera supports reservation series with pattern templates.

### P5 - Loyalty Engine is Static
loyaltyPoints field exists on guest profiles but there is no automatic accrual on checkout. Points are only manually set during profile creation. Opera has a full loyalty module with tier management, automatic accrual, and redemption.

**Files affected:** `ERPContext.tsx` (checkout flow), `CRMModule.tsx`

### P6 - No Share Reservation / Shared Folio
Cannot split a single reservation's charges across multiple guests (e.g., shared room where each pays separately). Opera supports share reservations with up to 8 shares.

### P7 - No Pre-Registration
No pre-arrival registration flow where guests can fill in details online before arrival. Opera has a full pre-registration portal that feeds into the front desk check-in workflow.

### P8 - No Dynamic Pricing / RMS Engine
Rate plans and seasons exist but there is no automated dynamic pricing engine that adjusts rates based on demand, competitor pricing, or historical data. The forecasting module is read-only analytics, not a pricing engine.

---

## 6. Areas Where SELEDA Exceeds Opera

| Feature | SELEDA Advantage |
|---|---|
| Predictive Room Allocation | AI-based pre-assignment using CRM preferences (calculateProposedAllocations) - Opera requires manual assignment |
| Waitlist Management | Full waitlist to promotion to payment flow with public portal integration - Opera's waitlist is simpler |
| Split Folio Routing | Visual routing profile editor with per-charge-type A/B routing - Opera requires more manual configuration |
| Guest Communication Hub | In-dashboard messaging with reply - Opera requires separate integration |
| Document Verification | OCR-extracted data display + verification workflow - Opera requires third-party |
| Modern UI/UX | React + Tailwind with responsive design, dark mode, animations - Opera's UI is dated |
| Public Booking Portal | Full integrated booking engine with payment gateway - Opera requires Opera Booking Engine (separate product) |

---

## 7. Code Quality Observations

| Issue | Severity | Location |
|---|---|---|
| CheckInOutModule.tsx is 2,542 lines in a single file | High | Monolithic component, hard to maintain |
| ReservationsModule.tsx is 3,088 lines | High | Should be split into sub-modules |
| CRMModule.tsx is 2,701 lines | High | Should be split into individual/corporate/group components |
| ReportsAuditModule.tsx is 3,675 lines | High | Should be split by report category |
| Permission bypass: canEditGlobalSettings = true hardcoded | Medium | CheckInOutModule.tsx:87-90 |
| getChargeType function duplicated | Medium | Defined in both CheckInOutModule.tsx:199 and imported from folioRouting |
| No error boundaries on front desk modules | Medium | A single component crash takes down the whole portal |
| any type used extensively | Low | Throughout front desk components |
| No unit tests for front desk | High | tests/ only has executive KPI tests |

---

## 8. Recommendations (Priority Order)

1. **P1 - No-show & cancellation auto-charge:** Add `process_no_show` RPC + endpoint, wire to night audit
2. **P2 - Channel manager:** Integrate a channel manager API (e.g. SiteMinder, Staah) for OTA sync
3. **P3 - Multi-property selector:** Add property switcher in FrontDeskPortal.tsx, filter all queries by property_id
4. **P4 - Reservation series:** Add recurring pattern schema + batch creation endpoint
5. **P5 - Loyalty accrual:** Post points automatically on checkout in checkOutReservationCb
6. **P6 - Share reservations:** Add share_reservations table linking multiple guests to one reservation
7. **P7 - Pre-registration:** Add public pre-registration form feeding into CRM check-in flow
8. **P8 - Refactor large files:** Split CheckInOutModule, ReservationsModule, CRMModule, ReportsAuditModule into sub-components

---

## 9. Summary

**Score: 6.5/10 vs Oracle Opera**

**Strong in:** Folio/billing, check-in/out, CRM profiles, night audit, predictive allocation, waitlist management, UI/UX

**Weak in:** OTA integration, multi-property, no-show processing, loyalty engine, reservation series, dynamic pricing, reporting depth, code maintainability

The portal covers approximately 70% of Opera's front desk feature set. The remaining 30% represents enterprise-grade capabilities (channel management, multi-property, loyalty, RMS) that would require significant additional development. The existing architecture (Postgres RPCs, React frontend, REST API) is sound and extensible enough to support these additions.
