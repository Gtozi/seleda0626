# SELEDA ERP — Guest Portal
### Architecture Base Prompt

> Module: Guest Experience
> Portal type: Public / Guest-facing
> Companion modules: Front Office, Public Page Editor, F&B, Finance & Accounting Portal, Sales & Events

---

### 1. Purpose & Scope
The guest-facing side of the system: browsing the property's public pages, booking a stay, managing an existing reservation, and — once checked in — a digital concierge touchpoint (requests, folio view, local info). This is where the published content from the Public Page Editor is rendered and where a booking becomes a Reservation in Front Office.

**In scope (Phase 1 base):**
- Public site rendering (pages from Public Page Editor: home, rooms, dining, offers, policies)
- Booking engine: search availability, select room/rate, guest details, deposit/payment, confirmation
- Manage-my-booking: view/modify/cancel an existing reservation (guest-authenticated by confirmation code + last name or similar)
- In-stay guest requests (housekeeping request, maintenance issue report, F&B room service order) — routes into the relevant operational module
- Digital folio view (read-only) for an in-house guest

**Explicitly out of scope for base (later phases):**
- Live OTA rate parity / channel manager sync — this booking engine is a direct-booking channel only in Phase 1
- Claude-powered multilingual concierge chat (Phase 3 roadmap item) — this base ships static/menu-driven request flows only
- Loyalty program / guest account with stored payment methods across stays

---

### 2. Core Data Model
```
PublicPageRender
├── PageID (from Public Page Editor), RenderedContent, Locale

BookingSession
├── SessionID, SearchCriteria (dates, guests, roomType), AvailabilityResult, SelectedRatePlan, Status (Browsing|DetailsEntered|PaymentPending|Confirmed|Abandoned)

GuestBooking (created in Front Office as Reservation, referenced here)
├── ConfirmationCode, ReservationID (link to Front Office), GuestContact, Status

ManageBookingAccess
├── ConfirmationCode, LastName/Email (auth pair), AccessLog[]

GuestRequest
├── RequestID, ReservationID, Type (Housekeeping|Maintenance|RoomService|Concierge/General), Details, Status (Submitted|Acknowledged|InProgress|Completed), RoutedToModule

FolioView (read-only projection)
├── ReservationID, Charges[], Balance, LastUpdated
```

---

### 3. Module Breakdown

**Public Site**
- Renders published pages from Public Page Editor (home, room types, dining, offers, policies) — this module does not author content, only displays it
- Locale switch (English/Amharic/Tigrinya) reflecting whatever the page editor published per language

**Booking Engine**
- Availability search against Front Office room inventory and rate plans (read + write on confirm)
- Guest detail capture, deposit/payment collection (interfaces with the Finance payment stub — Chapa/Flutterwave in a later phase), confirmation email/SMS
- Successful booking creates a Reservation in Front Office — the Guest Portal is a booking *channel*, not a duplicate reservation store

**Manage My Booking**
- Guest looks up an existing reservation via confirmation code + verification field
- Allowed modifications (date change, room type change, cancellation) respect the same policy rules Front Office enforces — no separate/looser rule set here

**In-Stay Guest Requests**
- Simple request forms (not open chat in Phase 1): request housekeeping service, report a maintenance issue, place a room-service order, general concierge ask
- Each request routes to its owning operational module (Housekeeping task, Maintenance work order, F&B order) rather than being handled inside the Guest Portal itself

**Folio View**
- Read-only running balance for an in-house guest, sourced from Front Office's Guest Folio — no ability to dispute or edit from this view in the base

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Anonymous Guest (public visitor) | Browse public pages, run availability search, make a booking |
| Authenticated Guest (via confirmation code) | View/modify/cancel own booking, submit in-stay requests, view own folio |
| Front Office (cross-module) | Receive bookings and modifications as standard Reservation records |
| Housekeeping / Maintenance / F&B (cross-module) | Receive routed guest requests as standard tasks/work orders/orders |
| Marketing (cross-module, via Public Page Editor) | Owns the content rendered here, no access to booking/guest data |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Public Page Editor | Inbound | Published page content for rendering |
| Front Office | Bidirectional | Availability/rate read; booking and modification write; folio read |
| Housekeeping | Outbound | In-stay housekeeping requests |
| Maintenance/Engineering | Outbound | Guest-reported maintenance issues |
| F&B | Outbound | Room service orders |
| Finance & Accounting Portal | Outbound | Booking deposit/payment (via payment gateway stub) |
| Sales & Events | Inbound | Offer/package content for the booking engine's upsell flow |

---

### 6. Non-Functional Requirements
- **No parallel data store**: bookings, folios, and requests are read/written through owning modules (Front Office, Housekeeping, etc.) — the Guest Portal must not maintain a separate source of truth that can drift out of sync
- **Public-facing security**: guest booking-management auth (confirmation code + verification field) must not expose other guests' data even under enumeration attempts
- **Performance**: availability search and page load must be fast — this is the property's public storefront
- **Localization**: full guest-facing flow (not just marketing pages) in English + Amharic/Tigrinya
- **Payment handling**: deposit/payment collection must go through the Finance payment gateway integration point — no separate payment logic living in this module

---

### 7. Suggested Build Sequence
1. Public site rendering from Public Page Editor
2. Availability search + booking engine (writes Reservation to Front Office)
3. Booking confirmation + deposit/payment stub
4. Manage-my-booking (view/modify/cancel)
5. Folio read-only view
6. In-stay guest request forms routed to Housekeeping/Maintenance/F&B
7. Locale switching across the full guest flow

---

*Base architecture prompt — extend with the actual booking policy rules, payment gateway confirmation flow, and guest request categories as confirmed.*
