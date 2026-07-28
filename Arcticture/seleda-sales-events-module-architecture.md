# SELEDA ERP — Sales & Events Module
### Architecture Base Prompt

> Module: Revenue / Operations Core
> Portal type: Operational
> Companion modules: Front Office (Group Blocks), F&B (BEO), Finance & Accounting Portal, Executive Portal

---

### 1. Purpose & Scope
Manages the commercial sales pipeline — corporate accounts, group inquiries, and event bookings — from lead through contract to on-property execution, feeding room blocks to Front Office and banquet orders to F&B.

**In scope (Phase 1 base):**
- Lead/inquiry tracking (corporate, group, wedding/social event)
- Proposal and contract generation with rate agreement
- Group room block handoff to Front Office
- Event booking handoff to F&B (BEO)
- Corporate account management (rate agreements, credit terms)
- Sales pipeline/funnel reporting

**Explicitly out of scope for base (later phases):**
- Online booking widget for events/weddings — inquiries logged manually or via direct contact in Phase 1
- Marketing/CRM email campaign automation

---

### 2. Core Data Model
```
Lead
├── LeadID, ContactName, Company, Type (Corporate|Group|Wedding|SocialEvent), Source, Status (New|Contacted|ProposalSent|Won|Lost), EstimatedValue

Proposal
├── ProposalID, LeadID, RoomBlockDetails, EventDetails(nullable), RateAgreement, ValidUntil, Status (Draft|Sent|Accepted|Declined)

Contract
├── ContractID, LeadID, ProposalID, SignedDate, PaymentTerms, CancellationPolicy, Status (Active|Completed|Cancelled)

CorporateAccount
├── AccountID, CompanyName, TIN, NegotiatedRate, CreditTerms, CreditLimit (shared reference with Finance AR)

EventBooking
├── EventID, ContractID, EventDate, GuestCount, SpaceRequired, MenuPackage (link to F&B BEO), RoomBlock (link to Front Office)
```

---

### 3. Module Breakdown

**Lead & Pipeline Management**
- Inquiry capture with source tracking (referral, walk-in, phone, past guest)
- Pipeline stages with probability-weighted forecast value
- Follow-up task reminders per lead

**Proposal & Contract**
- Proposal builder referencing negotiated or standard rates, room block size, event space/menu if applicable
- Contract generation on acceptance; cancellation policy and deposit terms captured
- Contract status drives downstream handoff — nothing books into Front Office/F&B until contract is Active

**Group Room Block Handoff**
- Accepted contract with room requirements creates a Group Block in Front Office (rooms reserved against inventory, cutoff date set)

**Event Booking Handoff**
- Accepted contract with event/catering component creates a BEO in F&B (menu package, guest count, room setup)

**Corporate Account Management**
- Negotiated rate and credit terms stored once, referenced by Front Office (room rate) and Finance AR (credit limit/city ledger) — not duplicated

**Sales Reporting**
- Pipeline value by stage, win rate, average deal size, booked room-nights and event revenue by month

---

### 4. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Sales Coordinator | Lead entry, proposal drafting, follow-up tracking |
| Sales Manager | Contract approval, rate negotiation sign-off, corporate account setup |
| Director of Sales | Full pipeline visibility, forecast reporting, cancellation policy exceptions |
| Front Office / F&B (cross-module) | Receive room block / BEO handoff, no edit rights to contract terms |
| Finance (cross-module) | Read access to corporate account credit terms |

---

### 5. Integration Points

| System | Direction | Data |
|---|---|---|
| Front Office | Outbound | Group room block from accepted contract |
| F&B | Outbound | BEO from accepted event contract |
| Finance & Accounting Portal | Bidirectional | Corporate account credit terms/limit; deposit and event invoicing via AR |
| Executive Portal | Outbound | Pipeline value, booked group/event revenue, win rate |

---

### 6. Non-Functional Requirements
- **Auditability**: contract terms and rate negotiations logged, especially any deviation from standard rate card
- **Data consistency**: corporate account and rate agreement defined once, referenced (not duplicated) by Front Office and Finance
- **Localization**: proposals and contracts available in English; Amharic/Tigrinya for locally-facing event clients where needed

---

### 7. Suggested Build Sequence
1. Lead/inquiry capture + pipeline stages
2. Proposal builder
3. Contract generation + status workflow
4. Corporate account master (shared reference with Finance AR)
5. Group room block handoff to Front Office
6. Event booking handoff to F&B (BEO)
7. Sales pipeline/forecast reporting to Executive Portal

---

*Base architecture prompt — extend with actual rate card, standard contract terms, and event space inventory as confirmed.*
