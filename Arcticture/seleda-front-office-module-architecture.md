# SELEDA ERP — Front Office Module
### Architecture Base Prompt

> Module: Operations Core
> Portal type: Operational
> Companion modules: Finance & Accounting Portal, Housekeeping, F&B, Executive Portal

---

### 1. Purpose & Scope
Manages the guest stay lifecycle: reservation through checkout, room inventory/availability, rate management, and the guest folio that every other revenue module posts against.

**In scope (Phase 1 base):**
- Reservation booking, modification, cancellation
- Room inventory, availability, and rate plans
- Check-in / check-out workflow
- Guest folio (charges, payments, city ledger routing)
- Room assignment and status (linked to Housekeeping)
- Group/block bookings

**Explicitly out of scope for base (later phases):**
- OTA channel manager live sync — manual rate/availability update in Phase 1
- Dynamic/revenue-management pricing engine — manual rate entry only

---

### 2. Core Data Model
```
Reservation
├── ReservationID, GuestID, RoomType, ArrivalDate, DepartureDate, RatePlan, Status (Booked|Confirmed|CheckedIn|CheckedOut|NoShow|Cancelled), Source (Direct|OTA|Agent)

Room
├── RoomID, RoomNumber, RoomType, Floor, Status (Vacant|Occupied|OOO|OOS), HousekeepingStatus (link)

RatePlan
├── RatePlanID, RoomType, BaseRate, SeasonalOverrides[], MealPlanIncluded

GuestFolio
├── FolioID, ReservationID, Charges[], Payments[], Balance, RoutingRules (room charge splits), Status (Open|Closed|SentToCityLedger)

GroupBlock
├── BlockID, GroupName, RoomsAllocated[], RateAgreement, CutoffDate, Status
```

---

### 3. Module Breakdown

**Reservations**
- Availability check against room inventory and rate plan; overbooking rule (configurable %) with manager override
- Confirmation/deposit workflow; cancellation policy enforcement with penalty calc

**Check-in / Check-out**
- ID capture, room assignment (auto or manual), key issuance trigger
- Early check-in / late check-out flagged with rate impact
- Checkout triggers folio close and AR handoff (city ledger) or payment settlement

**Guest Folio**
- Charge posting from F&B, Spa, Minibar, Phone, Misc — all route here
- Split folio support (personal vs. company billing)
- Real-time balance and credit-limit check before further charge posting

**Room & Rate Management**
- Room status board (Vacant/Occupied/Dirty/Clean/OOO) synced with Housekeeping
- Rate plan configuration, seasonal overrides, meal plan linkage

**Group/Block Bookings**
- Block allocation against inventory, rooming list management, cutoff date auto-release

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Reservations Agent | Create/modify bookings, no rate override |
| Front Desk Agent | Check-in/out, folio charge posting, no discount override |
| Front Office Supervisor | Rate override, overbooking approval, folio adjustments |
| Front Office Manager | Rate plan config, group block setup, no-show/cancellation policy overrides |
| Finance (cross-module) | Read access to folios, city ledger export |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Finance & Accounting Portal | Outbound | Room revenue, city ledger folios at checkout |
| Housekeeping | Bidirectional | Room status (dirty/clean/inspected), OOO rooms |
| F&B / Spa | Inbound | Charge postings routed to guest folio |
| Executive Portal | Outbound | Occupancy, ADR, RevPAR |
| System Admin Portal | Bidirectional | Room/rate config, roles |

---

### 6. Non-Functional Requirements
- **Auditability**: rate overrides, folio adjustments, and cancellations logged with actor and reason
- **Offline/connectivity**: check-in/out and folio posting must queue and sync on reconnect
- **Localization**: guest-facing registration and folio documents in English + Amharic/Tigrinya
- **Performance**: room status board must reflect changes near-instantly across Front Office and Housekeeping views

---

### 7. Suggested Build Sequence
1. Room inventory + rate plan
2. Reservation creation/modification/cancellation
3. Check-in/out + room assignment
4. Guest folio + charge posting from other modules
5. Room status sync with Housekeeping
6. City ledger handoff to Finance AR
7. Group/block booking
8. Overbooking/rate override rules + audit trail

---

*Base architecture prompt — extend with property-specific rate structure, ID/visa capture rules, and cancellation policy as confirmed.*
