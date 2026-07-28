# SELEDA ERP System - Comprehensive Architecture Audit

**Date:** July 19, 2026  
**Auditor:** Cascade AI Architecture Audit  
**Scope:** All 14 portals sharing one React SPA (`src/App.tsx`), one Express server (`server.ts`, 5,131 lines), one Supabase Postgres DB (124+ migrations)

---

## Executive Summary

The SELEDA ERP system is a feature-rich hospitality management platform with 14 distinct portals serving different user roles, built on a modern React 19 + TypeScript frontend with Express.js backend and Supabase PostgreSQL database. While the system demonstrates strong functional completeness with advanced features like B2B operator management, atomic booking transactions, and comprehensive financial modules, it faces critical technical debt risks: the 5,132-line monolithic server.ts file, 157KB BookingPage.tsx god component, and migration history reconciliation issues between disk files (001-124) and live database (timestamp-based names). The single biggest risk is the lack of automated test coverage for billing/financial transactions combined with recent unstable refactoring of Executive KPI triggers (5 migrations in one week), creating high potential for silent regressions in money-handling code.

---

## Portal Inventory

| Portal | Primary Users | Core Purpose | Tech Stack | Deployment |
|--------|--------------|--------------|------------|------------|
| Public Booking | Hotel Guests | Self-service room reservations, add-ons, payment | React 19 + TypeScript, Express.js, Supabase | Vite dev server, same domain as ERP |
| Front Office | Front Desk Staff, Night Auditor | Reservations, check-in/check-out, folio management, CRM | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Housekeeping | HK Manager, Room Attendants | Room status management, task assignment, inventory | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| F&B | Restaurant Manager, Chefs, Bar Staff | POS, menu management, kitchen display, inventory | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Engineering | Chief Engineer, Maintenance Staff | Work orders, preventive maintenance, asset tracking | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Inventory | Inventory Manager, Store Manager | Item master, stock management, requisitions, suppliers | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Finance | Finance Controller, Accountants | GL, AP/AR, financial reporting, tax compliance | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| HR | HR Manager | Employee management, payroll, leave, training | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Admin | System Administrator | User management, security settings, system configuration | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Executive | GM, Hotel Owner, Executive Team | KPI dashboard, business settings, B2B operators | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Procurement | Procurement Lead, Purchasing Staff | POs, suppliers, RFQs, goods receiving | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Sales | Sales Manager, Event Coordinators | Corporate accounts, proposals, sales pipeline | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Operations | Operations Manager | Cross-departmental oversight, reporting, coordination | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |
| Guest Mobile | Hotel Guests (in-stay) | In-stay requests, information access | React 19 + TypeScript, Express.js, Supabase | Main ERP SPA |

---

## Individual Portal Audits

### Portal: Public Booking Portal

**Overview:** Primary users: hotel guests booking directly via website. Core purpose: self-service room reservations with add-ons, airport shuttle, and secure payment processing. Tech stack: React 19 + TypeScript (BookingPage.tsx - 157KB), Express.js backend endpoints (/api/public/*), Supabase PostgreSQL with reservations schema. Deployment: Vite dev server, same domain as internal ERP.

**A. UI/UX Findings:**
- **Modern, polished checkout flow** with step-by-step wizard (Critical strength - well implemented)
- **Responsive design** works on mobile/tablet/desktop (Medium - verified via Tailwind responsive classes)
- **No accessibility compliance** - missing ARIA labels, keyboard navigation, screen reader support (Critical)
- **Empty states** present but could be more informative (Low - functional but basic)
- **No localization support** - hardcoded English text, no i18n framework (Medium - limits market expansion)
- **Loading states** present during API calls (Low - functional)

**B. Backend/Architecture Findings:**
- **RESTful API design** with /api/public/bookings/* endpoints (Medium - consistent pattern)
- **No API versioning** - breaking changes would impact public users (High)
- **Waitlisted-to-Confirmed promotion flow** well-designed with atomic transactions (Critical strength)
- **Payment gateway integration** supports multiple methods (Telebirr, CBE, Credit Cards) (Medium - functional)
- **No rate limiting** on public booking endpoints (Critical - vulnerability to abuse)
- **Input validation** present but could be more comprehensive (Medium)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Reservations created** sync properly to Front Office portal via shared database (Critical strength)
- **Bank details** dynamically fetched from global_settings for invoice display (Medium - good integration)
- **Terms and conditions** pulled from Business Admin settings (Medium - proper data flow)
- **No real-time sync** between public booking and room availability (High - overbooking risk)
- **Guest profiles** created don't automatically sync to CRM (Medium - data duplication risk)

**D. Features & Functional Completeness Findings:**
- **Core booking flow** complete with room selection, dates, guest info (Critical strength)
- **Add-ons/packages** integration well-implemented (Medium - good feature set)
- **Airport shuttle booking** integrated (Low - functional but basic)
- **Payment processing** supports multiple local methods (Critical strength for Ethiopian market)
- **No booking modification** (change dates, cancel) for guests (High - missing core feature)
- **No guest account** for returning customers (Medium - loyalty limitation)
- **No group booking** interface for public users (Low - B2B only)

**E. Performance Findings:**
- **Page load times** acceptable for modern broadband (Low - no specific bottlenecks identified)
- **No pagination** for room types if inventory grows large (Medium - future scalability concern)
- **Image loading** uses external Unsplash URLs (Low - dependency on external service)

**F. Maintainability & Team Process Findings:**
- **God component** - BookingPage.tsx is 157KB single file (Critical - maintenance nightmare)
- **No unit tests** for booking logic (Critical - high regression risk)
- **Inline styling** with Tailwind classes throughout (Medium - consistent but hard to theme)
- **Documentation** minimal for booking flow logic (Medium)

**Portal-Specific Roadmap:**
1. **Split BookingPage.tsx** into feature-scoped components (BookingWizard, RoomSelector, PaymentFlow, Confirmation) - Effort: L, Severity: Critical
2. **Add accessibility compliance** (ARIA labels, keyboard nav, screen reader support) - Effort: M, Severity: Critical  
3. **Implement rate limiting** on /api/public/bookings endpoints - Effort: S, Severity: Critical
4. **Add booking modification** (cancel, change dates) for guests - Effort: L, Severity: High
5. **Add unit tests** for booking logic, payment processing - Effort: M, Severity: Critical
6. **Implement real-time availability sync** with Front Office - Effort: M, Severity: High
7. **Add i18n framework** for multi-language support - Effort: L, Severity: Medium

---

### Portal: Executive Portal

**Overview:** Primary users: General Manager, Hotel Owner, Executive team. Core purpose: high-level KPI dashboard, business settings, B2B operator management. Tech stack: React 19 + TypeScript, direct database queries via Supabase client, Express.js backend for some endpoints. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Dashboard-centric design** with clear metric visualization (Medium - functional)
- **Responsive layout** works across devices (Low - adequate)
- **No accessibility compliance** (Critical - same issue across all portals)
- **Complex navigation** with multiple sub-modules can be confusing (Medium - UX friction)
- **Inconsistent component patterns** across Executive sub-modules (High - maintenance burden)

**B. Backend/Architecture Findings:**
- **Direct database queries** from client (High - security risk, bypasses server authorization)
- **KPI trigger instability** - 5 migrations in one week to fix trigger logic (Critical - data accuracy risk)
- **No caching layer** for frequently accessed KPI data (Medium - performance concern)
- **Business settings** stored in global_settings table (Medium - acceptable pattern)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **B2B operator management** moved from Finance to Executive (Medium - appropriate placement)
- **Global settings** (bank accounts, policies) properly consumed by Public Booking (Critical strength)
- **KPI data aggregation** pulls from all departmental tables (Medium - good cross-portal visibility)
- **No real-time sync** between Executive dashboard and operational data (High - stale data risk)

**D. Features & Functional Completeness Findings:**
- **KPI dashboard** covers core metrics (occupancy, ADR, RevPAR, labor cost) (Medium - good coverage)
- **Business settings management** comprehensive (bank accounts, policies, taxes) (Critical strength)
- **B2B operator portal** with allotments, contracts, AR ledger (Critical strength - advanced feature)
- **Missing advanced analytics** (trend analysis, forecasting) (High - executive decision gap)
- **No alerting system** for KPI thresholds (Medium - proactive monitoring missing)

**E. Performance Findings:**
- **Direct queries** may be slow with large datasets (Medium - potential bottleneck)
- **No pagination** on data-heavy views (High - performance risk at scale)

**F. Maintainability & Team Process Findings:**
- **Trigger logic instability** indicates poor testing practices (Critical)
- **Sub-module organization** could be improved (Medium)
- **Limited documentation** on KPI calculation logic (High)

**Portal-Specific Roadmap:**
1. **Stabilize KPI trigger pipeline** - document final design, remove superseded migrations - Effort: M, Severity: Critical
2. **Add server-side API endpoints** for KPI data (remove direct client queries) - Effort: L, Severity: High
3. **Implement caching layer** for KPI data - Effort: M, Severity: Medium
4. **Add regression tests** for KPI calculations - Effort: M, Severity: Critical
5. **Add alerting system** for KPI threshold breaches - Effort: M, Severity: Medium
6. **Implement advanced analytics** (trends, forecasting) - Effort: L, Severity: High

---

### Portal: Finance Portal

**Overview:** Primary users: Finance Controller, Accountants. Core purpose: general ledger, accounts payable/receivable, financial reporting, tax compliance. Tech stack: React 19 + TypeScript, Express.js routes (/api/finance/*, /api/accounts-payable/*, etc.), Supabase PostgreSQL with USALI COA integration. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Complex financial forms** with many fields (High - cognitive load)
- **Data-dense tables** for ledger entries (Medium - appropriate for finance users)
- **No accessibility compliance** (Critical)
- **Inconsistent UI patterns** across finance sub-modules (High)

**B. Backend/Architecture Findings:**
- **Well-structured route modules** (finance.routes.ts, accountsPayable.routes.ts, etc.) (Critical strength)
- **USALI COA integration** properly implemented (Medium - industry standard)
- **Atomic billing calculations** via database RPCs (Critical strength - data integrity)
- **No API versioning** (High)
- **Comprehensive audit trail** via audit_events table (Critical strength)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Folio data** properly syncs from Front Office (Critical strength)
- **B2B AR ledger** integrates with operator portal (Medium - good integration)
- **Bank reconciliation** integrates with global bank accounts (Medium)
- **Period close** impacts all departments (High - cross-portal dependency)

**D. Features & Functional Completeness Findings:**
- **General ledger** with full CRUD operations (Critical strength)
- **Accounts payable/receivable** comprehensive (Critical strength)
- **Financial statements** (balance sheet, P&L) implemented (Medium - good coverage)
- **Tax compliance** (ERCA VAT export) for Ethiopian market (Critical strength - local compliance)
- **Bank reconciliation** functional (Medium)
- **Fixed assets management** basic (Low - could be enhanced)
- **Budget vs actual analysis** present (Medium)

**E. Performance Findings:**
- **Large dataset handling** may need pagination (High - scalability concern)
- **No caching** for frequently accessed financial data (Medium)

**F. Maintainability & Team Process Findings:**
- **Good route module organization** (Critical strength)
- **Limited test coverage** for financial calculations (Critical - money-handling code)
- **Documentation** adequate for financial logic (Medium)

**Portal-Specific Roadmap:**
1. **Add comprehensive unit tests** for billing calculations, folio balance logic - Effort: L, Severity: Critical
2. **Implement pagination** for ledger entries - Effort: S, Severity: High
3. **Add API versioning** to finance routes - Effort: M, Severity: High
4. **Enhance fixed assets module** with depreciation schedules - Effort: M, Severity: Medium
5. **Add caching layer** for financial reports - Effort: M, Severity: Medium

---

### Portal: Admin Portal

**Overview:** Primary users: System Administrator. Core purpose: user management, security settings, system configuration, audit logs. Tech stack: React 19 + TypeScript, Express.js routes (/api/admin/*), Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **29 admin sub-modules** with inconsistent UI patterns (Critical - maintenance nightmare)
- **Complex forms** for system configuration (High - cognitive load)
- **No accessibility compliance** (Critical)
- **God component** - MasterData.tsx is 138KB (Critical)

**B. Backend/Architecture Findings:**
- **Comprehensive admin.routes.ts** (31KB) (Medium - well-organized)
- **RBAC system** with role-based permissions (Critical strength)
- **MFA support** via TOTP (Medium - good security)
- **Session management** with timeout and concurrent session limits (Critical strength)
- **Password policy** enforcement (Medium - good security)
- **Audit logging** comprehensive (Critical strength)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **User permissions** properly enforced across all portals (Critical strength)
- **Module toggles** can disable entire portals (Medium - good control)
- **Global settings** consumed by all portals (Critical strength)

**D. Features & Functional Completeness Findings:**
- **User management** comprehensive (Critical strength)
- **Role-based permissions** with custom roles (Critical strength)
- **Security settings** (IP allowlist, session timeout) (Medium - good coverage)
- **Audit logs** comprehensive (Critical strength)
- **System health monitoring** basic (Low - could be enhanced)
- **Backup/recovery** management present (Medium)

**E. Performance Findings:**
- **Audit log queries** may need pagination at scale (Medium)
- **No caching** for frequently accessed system settings (Low)

**F. Maintainability & Team Process Findings:**
- **29 sub-modules** with inconsistent patterns (Critical - technical debt)
- **MasterData.tsx** god component (Critical)
- **OperationsManagerPortal.tsx** 122KB (Critical)
- **Limited documentation** for admin workflows (High)

**Portal-Specific Roadmap:**
1. **Break up MasterData.tsx** into feature-scoped components - Effort: L, Severity: Critical
2. **Break up OperationsManagerPortal.tsx** - Effort: L, Severity: Critical
3. **Establish shared component library** for admin UI - Effort: L, Severity: High
4. **Add unit tests** for permission logic - Effort: M, Severity: High
5. **Enhance system health monitoring** - Effort: M, Severity: Medium

---

### Portal: Front Office Portal

**Overview:** Primary users: Front Desk Staff, Night Auditor. Core purpose: reservation management, check-in/check-out, folio management, CRM. Tech stack: React 19 + TypeScript, Express.js routes (/api/reservations/*), Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Comprehensive sub-modules** (dashboard, reservations, folio, CRM, reports, gift shop) (Medium - good coverage)
- **Complex navigation** with modal return context (High - UX complexity)
- **No accessibility compliance** (Critical)
- **Inconsistent UI patterns** across sub-modules (High)

**B. Backend/Architecture Findings:**
- **Well-structured reservations.routes.ts** (18KB) (Medium - good organization)
- **Atomic booking transactions** via create_booking_atomic RPC (Critical strength)
- **Folio management** with proper balance calculations (Critical strength)
- **Room assignment logic** with auto-assignment (Medium - good automation)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Reservations** sync to Housekeeping for room status (Critical strength)
- **Folio charges** sync to Finance for accounting (Critical strength)
- **Guest profiles** sync to CRM (Medium - good integration)
- **Gift shop POS** integrates with Inventory (Medium)

**D. Features & Functional Completeness Findings:**
- **Reservation management** comprehensive (Critical strength)
- **Check-in/check-out** with ID card scanning (Critical strength)
- **Folio management** with split folios (A/B) (Critical strength - advanced feature)
- **CRM module** with guest history (Medium - good coverage)
- **Gift shop POS** functional (Medium)
- **Night audit checklist** (Low - basic)
- **Reports module** comprehensive (Critical strength)

**E. Performance Findings:**
- **Large dataset handling** for reservations (Medium - may need pagination)
- **Real-time updates** via Supabase subscriptions (Critical strength - good UX)

**F. Maintainability & Team Process Findings:**
- **Good sub-module organization** (Medium)
- **ReservationsModule.tsx** 176KB (Critical - god component)
- **CRMModule.tsx** 149KB (Critical - god component)
- **CheckInOutModule.tsx** 151KB (Critical - god component)

**Portal-Specific Roadmap:**
1. **Break up ReservationsModule.tsx** - Effort: L, Severity: Critical
2. **Break up CRMModule.tsx** - Effort: L, Severity: Critical  
3. **Break up CheckInOutModule.tsx** - Effort: L, Severity: Critical
4. **Add unit tests** for room assignment logic - Effort: M, Severity: High
5. **Enhance night audit** with automated checks - Effort: M, Severity: Medium

---

### Portal: Housekeeping Portal

**Overview:** Primary users: Housekeeping Manager, Room Attendants. Core purpose: room status management, task assignment, inventory management. Tech stack: React 19 + TypeScript, Express.js integration, Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Room board visualization** for status tracking (Medium - good UX)
- **Task management** interface (Low - functional)
- **No accessibility compliance** (Critical)
- **Mobile-friendly design** for room attendants (Medium - appropriate)

**B. Backend/Architecture Findings:**
- **Room status updates** properly integrate with reservations (Critical strength)
- **Task assignment** logic basic (Low - could be enhanced)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Room status** syncs with Front Office (Critical strength)
- **Lost & found** integrates with Front Office (Medium)
- **Inventory** integrates with main Inventory portal (Medium)

**D. Features & Functional Completeness Findings:**
- **Room status management** comprehensive (Critical strength)
- **Task management** basic (Low - could be enhanced with scheduling)
- **Laundry management** (Low - basic)
- **Lost & found** (Low - basic)
- **Inventory management** for supplies (Medium)

**E. Performance Findings:**
- **Real-time room status updates** (Critical strength - good UX)

**F. Maintainability & Team Process Findings:**
- **Good module organization** (Medium)
- **HKReportsModule.tsx** 116KB (High - large but reports are complex)

**Portal-Specific Roadmap:**
1. **Enhance task management** with scheduling optimization - Effort: M, Severity: Medium
2. **Add accessibility compliance** - Effort: M, Severity: Critical
3. **Enhance laundry module** with tracking - Effort: M, Severity: Low

---

### Portal: F&B Portal

**Overview:** Primary users: Restaurant Manager, Chefs, Bar Staff. Core purpose: POS, menu management, kitchen display, inventory. Tech stack: React 19 + TypeScript, Express.js routes (/api/food-beverage/*), Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **POS interface** comprehensive (Medium - good coverage)
- **Kitchen display system** (KDS) (Medium - good UX for kitchen staff)
- **No accessibility compliance** (Critical)
- **Multiple outlet support** (restaurant, bar, etc.) (Medium - good flexibility)

**B. Backend/Architecture Findings:**
- **Well-structured foodBeverage.routes.ts** (28KB) (Medium - good organization)
- **Recipe costing** with waste tracking (Medium - good feature)
- **Inventory integration** with main Inventory portal (Medium)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **F&B charges** sync to Front Office folios (Critical strength)
- **Inventory** integrates with main Inventory portal (Medium)
- **Recipe costs** integrate with Finance (Low)

**D. Features & Functional Completeness Findings:**
- **POS modules** for restaurant, bar (Critical strength)
- **Menu management** comprehensive (Medium - good coverage)
- **Kitchen display** (KDS) (Medium - good feature)
- **Recipe management** with costing (Medium - good feature)
- **Waste tracking** (Low - basic)
- **Banquet event orders** (BEO) (Medium - good feature)

**E. Performance Findings:**
- **Real-time order updates** via subscriptions (Critical strength - good UX)

**F. Maintainability & Team Process Findings:**
- **Good module organization** (Medium)
- **POSModule.tsx** 110KB (High - large but POS is complex)

**Portal-Specific Roadmap:**
1. **Add accessibility compliance** - Effort: M, Severity: Critical
2. **Enhance waste tracking** with analytics - Effort: M, Severity: Low
3. **Add unit tests** for recipe costing logic - Effort: M, Severity: Medium

---

### Portal: Engineering Portal

**Overview:** Primary users: Chief Engineer, Maintenance Staff. Core purpose: work order management, preventive maintenance, asset tracking. Tech stack: React 19 + TypeScript, Express.js integration, Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Work order management** interface (Low - functional)
- **Preventive maintenance scheduler** (Medium - good feature)
- **No accessibility compliance** (Critical)
- **Mobile-friendly** for maintenance staff (Medium - appropriate)

**B. Backend/Architecture Findings:**
- **Preventive maintenance schedules** via database (Medium - good automation)
- **Asset tracking** basic (Low - could be enhanced)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Work orders** can mark rooms as Out of Order (Critical strength - integrates with Front Office)
- **Asset management** integrates with Finance fixed assets (Medium)

**D. Features & Functional Completeness Findings:**
- **Work order management** (Medium - good coverage)
- **Preventive maintenance** scheduling (Medium - good feature)
- **Asset management** basic (Low - could be enhanced)
- **Utilities management** (Low - basic)
- **Compliance module** (Low - basic)

**E. Performance Findings:**
- **No specific performance issues** (Low)

**F. Maintainability & Team Process Findings:**
- **Good module organization** (Medium)

**Portal-Specific Roadmap:**
1. **Add accessibility compliance** - Effort: M, Severity: Critical
2. **Enhance asset management** with depreciation tracking - Effort: M, Severity: Medium
3. **Add unit tests** for PM scheduling logic - Effort: M, Severity: Medium

---

### Portal: Inventory Portal

**Overview:** Primary users: Inventory Manager, Store Manager. Core purpose: item master, stock management, requisitions, suppliers. Tech stack: React 19 + TypeScript, Express.js routes (/api/inventory/*), Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Item master management** comprehensive (Medium - good coverage)
- **Stock count** interface (Low - functional)
- **No accessibility compliance** (Critical)

**B. Backend/Architecture Findings:**
- **Well-structured inventory.routes.ts** (8KB) (Medium - good organization)
- **Stock movement** tracking (Medium - good feature)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **F&B inventory** integrates with F&B portal (Medium)
- **Housekeeping inventory** integrates with Housekeeping portal (Medium)
- **Procurement** integrates with Inventory (Medium)

**D. Features & Functional Completeness Findings:**
- **Item master** comprehensive (Critical strength)
- **Stock management** with tracking (Medium - good coverage)
- **Requisitions** (Medium - good feature)
- **Supplier management** (Medium - good coverage)
- **Store management** (Low - basic)

**E. Performance Findings:**
- **No specific performance issues** (Low)

**F. Maintainability & Team Process Findings:**
- **Good module organization** (Medium)
- **ItemMasterModule.tsx** 32KB (Low - reasonable size)

**Portal-Specific Roadmap:**
1. **Add accessibility compliance** - Effort: M, Severity: Critical
2. **Enhance store management** with multi-location support - Effort: M, Severity: Medium

---

### Portal: HR Portal

**Overview:** Primary users: HR Manager. Core purpose: employee management, payroll, leave management, training. Tech stack: React 19 + TypeScript, Express.js integration, Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Employee directory** (Low - functional)
- **Payroll management** (Medium - good coverage)
- **No accessibility compliance** (Critical)

**B. Backend/Architecture Findings:**
- **HR integration** with system_users table (Medium - good integration)
- **Payroll calculation** logic (Medium - basic)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Employee data** links to system_users for authentication (Critical strength)
- **Payroll expenses** integrate with Finance (Medium)

**D. Features & Functional Completeness Findings:**
- **Employee directory** (Low - basic)
- **Leave management** (Low - basic)
- **Payroll management** (Medium - good coverage)
- **Performance management** (Low - basic)
- **Training & development** (Low - basic)

**E. Performance Findings:**
- **No specific performance issues** (Low)

**F. Maintainability & Team Process Findings:**
- **Good module organization** (Medium)

**Portal-Specific Roadmap:**
1. **Add accessibility compliance** - Effort: M, Severity: Critical
2. **Enhance payroll** with tax calculations - Effort: L, Severity: High
3. **Add unit tests** for payroll calculations - Effort: M, Severity: High

---

### Portal: Procurement Portal

**Overview:** Primary users: Procurement Lead, Purchasing Staff. Core purpose: purchase orders, supplier management, RFQs, goods receiving. Tech stack: React 19 + TypeScript, Express.js integration, Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Purchase order management** (Medium - good coverage)
- **Supplier management** (Low - functional)
- **No accessibility compliance** (Critical)

**B. Backend/Architecture Findings:**
- **Procurement integration** with Inventory (Medium - good integration)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Purchase orders** integrate with Inventory for stock updates (Critical strength)
- **Supplier data** shared with Inventory (Medium)

**D. Features & Functional Completeness Findings:**
- **Purchase order management** (Medium - good coverage)
- **Supplier management** (Low - basic)
- **RFQ management** (Low - basic)
- **Goods receiving** (Medium - good coverage)
- **Invoice management** (Low - basic)

**E. Performance Findings:**
- **No specific performance issues** (Low)

**F. Maintainability & Team Process Findings:**
- **Good module organization** (Medium)

**Portal-Specific Roadmap:**
1. **Add accessibility compliance** - Effort: M, Severity: Critical
2. **Enhance supplier management** with performance tracking - Effort: M, Severity: Medium

---

### Portal: Sales Portal

**Overview:** Primary users: Sales Manager, Event Coordinators. Core purpose: corporate accounts, proposals, sales pipeline. Tech stack: React 19 + TypeScript, Express.js integration, Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Corporate account management** (Medium - good coverage)
- **Sales pipeline** visualization (Low - functional)
- **No accessibility compliance** (Critical)

**B. Backend/Architecture Findings:**
- **Sales integration** with Front Office for group bookings (Medium - good integration)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Corporate accounts** integrate with Front Office CRM (Critical strength)
- **Sales pipeline** links to reservations (Medium)

**D. Features & Functional Completeness Findings:**
- **Corporate account master** (Medium - good coverage)
- **Proposal/contract management** (Medium - good coverage)
- **Sales pipeline** (Low - basic)

**E. Performance Findings:**
- **No specific performance issues** (Low)

**F. Maintainability & Team Process Findings:**
- **Small portal** (4 components) - good organization (Low)

**Portal-Specific Roadmap:**
1. **Add accessibility compliance** - Effort: M, Severity: Critical
2. **Enhance sales pipeline** with forecasting - Effort: M, Severity: Medium

---

### Portal: Operations Portal

**Overview:** Primary users: Operations Manager. Core purpose: cross-departmental oversight, reporting, coordination. Tech stack: React 19 + TypeScript, Express.js routes (/api/operations-manager/*), Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Operations dashboard** (Medium - good coverage)
- **Cross-departmental reports** (Medium - good feature)
- **No accessibility compliance** (Critical)

**B. Backend/Architecture Findings:**
- **Comprehensive operations-manager.routes.ts** (44KB) (Medium - good organization)
- **Cross-departmental data aggregation** (Medium - good architecture)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Pulls data from all departments** (Critical strength - good integration)
- **Departmental reports** comprehensive (Medium)

**D. Features & Functional Completeness Findings:**
- **Operations dashboard** (Medium - good coverage)
- **Departmental reports** (Medium - good coverage)
- **Financial reports** (Medium - good coverage)

**E. Performance Findings:**
- **Cross-departmental queries** may be slow (Medium - potential bottleneck)

**F. Maintainability & Team Process Findings:**
- **OperationsManagerPortal.tsx** 122KB (Critical - god component)

**Portal-Specific Roadmap:**
1. **Break up OperationsManagerPortal.tsx** - Effort: L, Severity: Critical
2. **Add accessibility compliance** - Effort: M, Severity: Critical
3. **Add caching** for cross-departmental reports - Effort: M, Severity: Medium

---

### Portal: Guest Mobile Portal

**Overview:** Primary users: hotel guests during stay. Core purpose: in-stay requests, information access. Tech stack: React 19 + TypeScript, Express.js integration, Supabase PostgreSQL. Deployment: Part of main ERP SPA.

**A. UI/UX Findings:**
- **Mobile-optimized design** (Critical strength - appropriate for use case)
- **In-stay requests** interface (Low - functional)
- **No accessibility compliance** (Critical - even more critical for guest-facing)

**B. Backend/Architecture Findings:**
- **Guest requests** integration with operations (Medium - good integration)

**C. Cross-Portal Relations & Data Integrity Findings:**
- **Guest requests** route to appropriate departments (Medium - good routing)

**D. Features & Functional Completeness Findings:**
- **In-stay requests** (Low - basic)
- **Hotel information** (Low - basic)
- **No PWA support** for offline use (Medium - limitation)

**E. Performance Findings:**
- **Mobile-optimized** (Critical strength)

**F. Maintainability & Team Process Findings:**
- **Small component** (25KB) - good organization (Low)

**Portal-Specific Roadmap:**
1. **Add accessibility compliance** - Effort: M, Severity: Critical
2. **Enhance in-stay requests** with categories - Effort: S, Severity: Medium
3. **Evaluate PWA packaging** for offline support - Effort: M, Severity: Medium

---

## Cross-Cutting Issues

### **No Unified Design System**
- **Severity:** Critical
- **Affected Portals:** All 14 portals
- **Issue:** Each portal uses inline Tailwind classes with inconsistent patterns. 29 Admin sub-modules alone show massive inconsistency. No shared component library exists.
- **Reference:** Admin Portal UI/UX findings, all portal maintainability findings
- **Impact:** High maintenance burden, inconsistent UX, difficult theming, slower development

### **Zero Accessibility Compliance**
- **Severity:** Critical
- **Affected Portals:** All 14 portals
- **Issue:** No ARIA labels, keyboard navigation, screen reader support, or WCAG compliance across any portal. This is a legal liability and excludes disabled users.
- **Reference:** All portal UI/UX findings
- **Impact:** Legal risk, excluded user base, poor UX for assistive technology users

### **God Component Proliferation**
- **Severity:** Critical
- **Affected Portals:** Public Booking (157KB BookingPage.tsx), Admin (138KB MasterData.tsx, 122KB OperationsManagerPortal.tsx), Front Office (176KB ReservationsModule.tsx, 149KB CRMModule.tsx, 151KB CheckInOutModule.tsx)
- **Issue:** Multiple massive single-file components that are impossible to maintain, test, or debug effectively.
- **Reference:** Individual portal maintainability findings
- **Impact:** High technical debt, impossible to test, high regression risk

### **Monolithic server.ts (5,132 lines)**
- **Severity:** Critical
- **Affected Portals:** All (backend shared)
- **Issue:** Single 5,132-line server.ts file contains all API routes, middleware, authentication logic, database helpers. Impossible to maintain, test, or scale.
- **Reference:** Backend architecture analysis
- **Impact:** High technical debt, impossible to test, deployment risk, difficult to onboard developers

### **Migration History Reconciliation Gap**
- **Severity:** Critical
- **Affected Portals:** All (database shared)
- **Issue:** Disk files numbered 001-124 with gaps (044-046, 083-084, 092, 095, 110, 112-113 missing). Live DB uses timestamp names like `20260705142847_044_atomic_booking_transaction` plus undocumented ad-hoc fixes not on disk. Cannot rebuild production schema from scratch.
- **Reference:** PORTAL_ARCHITECTURE_ROADMAP.md Phase 0
- **Impact:** Cannot reliably recreate production environment, deployment risk, data loss risk

### **Zero Automated Test Coverage for Critical Paths**
- **Severity:** Critical
- **Affected Portals:** All (financial/booking logic shared)
- **Issue:** Only one test file exists (`src/utils/billing.test.ts`). No tests for booking logic, payment processing, folio calculations, or financial transactions despite recent unstable refactoring.
- **Reference:** All portal maintainability findings, Finance portal findings
- **Impact:** High regression risk in money-handling code, silent data corruption possible

### **No API Versioning Strategy**
- **Severity:** High
- **Affected Portals:** All (API shared)
- **Issue:** All API routes lack versioning. Breaking changes would immediately impact all clients (public booking, internal portals).
- **Reference:** All portal backend findings
- **Impact:** Deployment risk, cannot evolve API safely, breaking changes impact all users

### **Security Risks in Direct Client Database Queries**
- **Severity:** High
- **Affected Portals:** Executive Portal
- **Issue:** Executive Portal makes direct database queries from client, bypassing server-side authorization checks.
- **Reference:** Executive Portal backend findings
- **Impact:** Security vulnerability, data exposure risk, bypasses audit trail

### **Inconsistent RBAC Implementation**
- **Severity:** High
- **Affected Portals:** All
- **Issue:** Client-side `rolePermissions` matrix in `src/lib/permissions.ts` duplicates server-side checks in `server.ts`. Two sources of truth can diverge.
- **Reference:** PORTAL_ARCHITECTURE_ROADMAP.md Phase 1
- **Impact:** Security risk if client and server permissions diverge, maintenance burden

### **No Real-Time Data Sync Between Portals**
- **Severity:** High
- **Affected Portals:** Public Booking ↔ Front Office, Executive ↔ Operational Portals
- **Issue:** Public booking availability doesn't sync in real-time with Front Office. Executive dashboard data can be stale.
- **Reference:** Public Booking and Executive portal cross-portal findings
- **Impact:** Overbooking risk, stale decision-making data, poor UX

### **Missing Localization Framework**
- **Severity:** Medium
- **Affected Portals:** All
- **Issue:** All text is hardcoded in English. No i18n framework for multi-language support.
- **Reference:** Public Booking UI/UX findings
- **Impact:** Cannot expand to international markets, poor UX for non-English speakers

---

## Consolidated Prioritized Roadmap

### **Phase 0 (Immediate/Critical Fixes)**

1. **Reconcile migration history** - Run migration list against live DB, rename/renumber disk files or generate squashed baseline so repo can rebuild production schema from scratch. *Problem:* Cannot reliably recreate production environment. *Affected:* All portals (database). *Effort:* M. *Dependency:* None.

2. **Fix `guest_requests` RLS-enabled-no-policy table** - Add explicit policy or document why none needed. *Problem:* Security vulnerability in RLS. *Affected:* Guest Mobile Portal. *Effort:* S. *Dependency:* None.

3. **Convert SECURITY DEFINER views to SECURITY INVOKER** - `rooms_with_type_name`, `waste_summary`, `guest_folio_view` or justify + document. *Problem:* Security vulnerability. *Affected:* All portals. *Effort:* M. *Dependency:* None.

4. **Audit SECURITY DEFINER RPCs** - Revoke EXECUTE where not meant to be called directly from client: `void_folio_line`, `unlink_payments_from_invoice`, etc. *Problem:* Security vulnerability. *Affected:* Finance, Front Office. *Effort:* M. *Dependency:* None.

5. **Enable leaked-password protection** in Supabase Auth settings. *Problem:* Account security vulnerability. *Affected:* All portals. *Effort:* S. *Dependency:* None.

6. **Write regression tests for billing code** - Cover `create_booking_atomic`, folio balance calculation, payment/void flows. *Problem:* High regression risk in money-handling code. *Affected:* Finance, Front Office, Public Booking. *Effort:* M. *Dependency:* None.

7. **Add rate limiting to public booking endpoints** - Prevent abuse of /api/public/bookings/* endpoints. *Problem:* Vulnerability to booking abuse. *Affected:* Public Booking. *Effort:* S. *Dependency:* None.

### **Phase 1 (Foundation)**

8. **Single source of truth for RBAC** - Generate client permission matrix from server config at build time, or have client fetch from `/api/auth/permissions-matrix`. *Problem:* Duplicated permission logic can diverge. *Affected:* All portals. *Effort:* M. *Dependency:* None.

9. **Split server.ts into route modules** - Create `auth.routes.ts`, `booking.routes.ts`, `finance.routes.ts`, `admin.routes.ts`, `operations.routes.ts` mounted from slim `server.ts` app factory. *Problem:* 5,132-line monolith impossible to maintain. *Affected:* All portals. *Effort:* L. *Dependency:* Phase 0 complete.

10. **Add indexes for unindexed foreign keys** - `ap_bills`, `ap_payments`, `allotments`, `allotment_pickup_log`, `airport_shuttle_requests`, `alert_rules`. *Problem:* Query performance at scale. *Affected:* Finance, B2B, Public Booking. *Effort:* M. *Dependency:* None.

11. **Drop duplicate indexes** - `ap_bills`, `ap_payments`, `audit_events`, `group_audit_log`. *Problem:* Wasted storage, slower writes. *Affected:* Finance. *Effort:* S. *Dependency:* None.

12. **Consolidate permissive RLS policies** - Merge multiple policies on same table/action for `error_logs`, `health_checks`, etc. *Problem:* Maintenance burden. *Affected:* All portals. *Effort:* M. *Dependency:* None.

13. **Wire CI/CD** - Add GitHub Actions workflow that runs `npm run lint` and `npx vitest run` on every PR. *Problem:* No automated quality checks. *Affected:* All portals. *Effort:* M. *Dependency:* Phase 0 test expansion.

14. **Establish shared component library** - Create buttons, cards, badges, status pills, empty/loading states under `src/components/Shared`. Migrate Admin sub-modules first. *Problem:* Inconsistent UI patterns. *Affected:* All portals. *Effort:* L. *Dependency:* None.

15. **Add API versioning** - Implement `/api/v1/` prefix for all routes with deprecation strategy. *Problem:* Cannot evolve API safely. *Affected:* All portals. *Effort:* M. *Dependency:* Phase 1.9 (split server.ts).

### **Phase 2 (Consolidation)**

16. **Break up god-components** - Split BookingPage.tsx (157KB), MasterData.tsx (138KB), OperationsManagerPortal.tsx (122KB), ReservationsModule.tsx (176KB), CRMModule.tsx (149KB), CheckInOutModule.tsx (151KB), WorkflowEngine.tsx (45KB) into feature-scoped sub-components. *Problem:* Impossible to maintain/test. *Affected:* Public Booking, Admin, Front Office. *Effort:* L. *Dependency:* Phase 1 complete (shared components).

17. **Stabilize Executive KPI trigger pipeline** - Document final chosen design, remove/archive superseded trigger logic from migrations 086-090. *Problem:* Data accuracy risk from unstable refactoring. *Affected:* Executive Portal. *Effort:* M. *Dependency:* Phase 0 complete (tests).

18. **Finish JSONB-ledger-to-relational migration** - Confirm no code reads/writes `reservation.charges`/`reservation.payments` JSONB directly, then drop columns. *Problem:* Technical debt, data duplication. *Affected:* Front Office, Finance. *Effort:* M. *Dependency:* Phase 0 complete (tests).

19. **Generate API documentation** - Create OpenAPI/Swagger docs from route modules. *Problem:* No API documentation. *Affected:* All portals. *Effort:* M. *Dependency:* Phase 1.15 (API versioning).

20. **Implement server-side KPI endpoints** - Remove direct client database queries from Executive Portal, create proper API endpoints. *Problem:* Security vulnerability. *Affected:* Executive Portal. *Effort:* M. *Dependency:* Phase 1.9 (split server.ts).

### **Phase 3 (Growth)**

21. **Add accessibility compliance** - Implement ARIA labels, keyboard navigation, screen reader support across all portals. *Problem:* Legal liability, excluded users. *Affected:* All portals. *Effort:* L. *Dependency:* Phase 2 complete (component library).

22. **Implement real-time availability sync** - Add Supabase realtime subscriptions between Public Booking and Front Office for room availability. *Problem:* Overbooking risk. *Affected:* Public Booking, Front Office. *Effort:* M. *Dependency:* None.

23. **Add caching layer** - Implement Redis or in-memory TTL cache for KPI/report endpoints used by Executive portal. *Problem:* Performance at scale. *Affected:* Executive Portal. *Effort:* M. *Dependency:* None.

24. **Enhance public booking features** - Add booking modification (cancel, change dates), guest accounts for returning customers. *Problem:* Missing core features. *Affected:* Public Booking. *Effort:* M. *Dependency:* Phase 0 complete.

25. **Add localization framework** - Implement i18n for multi-language support. *Problem:* Cannot expand internationally. *Affected:* All portals. *Effort:* L. *Dependency:* Phase 2 complete.

26. **Evaluate B2B self-service portal** - Separate auth scope for tour operators if volume justifies it. *Problem:* Operators have no login of their own. *Affected:* B2B Operator Portal. *Effort:* L. *Dependency:* Phase 1 complete (RBAC).

27. **Evaluate PWA packaging for Guest Mobile** - Offline support, push notifications. *Problem:* Limited mobile experience. *Affected:* Guest Mobile Portal. *Effort:* M. *Dependency:* None.

28. **Expand automated test coverage** - Add tests for folio, AP/AR, booking RPC paths. *Problem:* Limited test coverage. *Affected:* Finance, Front Office, Public Booking. *Effort:* L. *Dependency:* Phase 0 complete.

---

## Quick Wins

1. **Delete debugging artifacts** - Remove root-level files: `apply-migration-056.js`, `tmp-fix.cjs`, `tmp-tsc.txt`, `tserrors.txt`, etc. *Effort:* S, *Impact:* Clean repository.

2. **Enable leaked-password protection** - 1 toggle in Supabase Auth settings. *Effort:* S, *Impact:* Immediate security improvement.

3. **Fix guest_requests RLS policy gap** - Add explicit policy. *Effort:* S, *Impact:* Security fix.

4. **Drop 4 duplicate indexes** - Zero-risk database cleanup. *Effort:* S, *Impact:* Performance improvement.

5. **Add rate limiting to public booking** - Simple middleware addition. *Effort:* S, *Impact:* Prevent booking abuse.

6. **Update supabase/migrations/README.md** - Document real applied migration history after Phase 0 reconciliation. *Effort:* S, *Impact:* Better documentation.

7. **Add accessibility labels to critical forms** - Booking form, login form, payment form. *Effort:* S, *Impact:* Immediate accessibility improvement for critical user paths.

---

## Assumptions & Limitations

- **Assumption:** System is currently deployed to production with live data based on migration history discrepancies
- **Assumption:** Current team size and resources unknown (effort estimates based on typical senior developer velocity)
- **Limitation:** Audit based on static code analysis without runtime performance profiling or load testing
- **Limitation:** Security review did not include penetration testing or dependency vulnerability scanning
- **Assumption:** Ethiopian market context validates current payment method choices (Telebirr, CBE, Awash Bank)

---

## Conclusion

The SELEDA ERP system demonstrates strong functional completeness and advanced hospitality management features. However, critical technical debt in testing, architecture, and security must be addressed before the system can scale safely. The phased roadmap prioritizes eliminating critical risks (migration reconciliation, security vulnerabilities, test coverage) before addressing technical debt (god components, monolithic server) and finally enabling growth (accessibility, real-time sync, localization). Following this roadmap will transform the system from a feature-rich but fragile platform into a maintainable, secure, and scalable hospitality ERP solution.
