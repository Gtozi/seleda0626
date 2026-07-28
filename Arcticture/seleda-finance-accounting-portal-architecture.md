# SELEDA ERP — Finance & Accounting Portal
## Architecture Base Prompt

> Module: Finance & Compliance
> Portal type: Operational + Executive hybrid (role-gated views)
> Companion modules: Operations Core, System Admin Portal, Executive Portal

---

## 1. Purpose & Scope

The Finance & Accounting Portal is the financial system of record for a single property (Phase 1) and, later, a multi-property group (Phase 3). It owns the General Ledger, manages AP/AR, produces statutory and management reporting, and reconciles cash and card settlement against Operations Core (Front Office, POS, Housekeeping cost centers).

**In scope (Phase 1 base):**
- General Ledger & Chart of Accounts (COA)
- Accounts Payable (vendor bills, purchase-to-pay)
- Accounts Receivable (guest folios handoff, city ledger, travel-agent commissions)
- Bank & cash reconciliation
- Fixed asset register & depreciation
- Ethiopian VAT / ERCA-compliant tax handling
- Core financial statements (P&L, Balance Sheet, Cash Flow, Trial Balance)
- Budget vs. Actual
- Audit trail & period close workflow

**Explicitly out of scope for base (later phases):**
- Live payment gateway settlement matching (Chapa/Flutterwave webhooks) — stub the interface only
- Multi-property consolidation/intercompany eliminations
- Payroll run engine (interface only — GL postings consumed, not calculated)

---

## 2. Chart of Accounts (COA)

Structure as a hierarchical, hospitality-standard COA aligned loosely with USALI (Uniform System of Accounts for the Lodging Industry), adapted for Ethiopian statutory reporting.

```
Account Number: [Class][Category][Sub-account] — e.g. 1-1000-001
Classes:
 1xxx — Assets
 2xxx — Liabilities
 3xxx — Equity
 4xxx — Revenue (Rooms, F&B, Other Operated Departments)
 5xxx — Departmental Expenses
 6xxx — Undistributed Operating Expenses
 7xxx — Fixed Charges (rent, insurance, depreciation)
 8xxx — Management Fees
 9xxx — Non-operating / Other
```

Requirements:
- COA is property-configurable but ships with a default USALI-aligned template
- Each account: number, name, type, normal balance, active flag, parent account (for rollups), department tag, currency
- Support **sub-ledger control accounts** (AP control, AR control) that must reconcile to sub-ledger detail before period close
- Multi-currency accounts flagged (ETB functional currency, USD/EUR common for OTA and international guest folios)

---

## 3. Core Data Model

```
Account (COA)
├── AccountID, Number, Name, Type, ParentID, Department, Currency, IsActive

JournalEntry
├── JournalID, Date, Period, Source (Manual|AP|AR|POS|PMS|Payroll|Bank), Reference
├── Status (Draft|Posted|Reversed), CreatedBy, ApprovedBy, PostedAt
└── JournalLine[]
    ├── LineID, AccountID, Debit, Credit, Currency, ExchangeRate, CostCenter, TaxCode, Memo

Vendor (AP)
├── VendorID, Name, TIN, PaymentTerms, BankDetails, Category, IsWithholdingAgent

Bill (AP)
├── BillID, VendorID, Date, DueDate, Lines[], Status (Draft|Approved|Paid|Overdue|Void)
├── PurchaseOrderID (nullable), ApprovalChain[]

Payment (AP/AR)
├── PaymentID, Direction (Out|In), Method (Cash|Bank|Mobile Money|Card), Amount, LinkedBill/Invoice, Status

Customer/CityLedger (AR)
├── AccountID, GuestOrCompanyName, CreditLimit, Terms, LinkedFolios[]

Invoice (AR)
├── InvoiceID, CustomerID, SourceFolioID (from PMS), Lines[], TaxLines[], Status

FixedAsset
├── AssetID, Category, AcquisitionDate, Cost, UsefulLife, DepreciationMethod, AccumulatedDepreciation, DisposalDate

TaxCode
├── Code, Rate, Type (VAT|Withholding|TOT|Excise), GLMappingIn, GLMappingOut

Budget
├── BudgetID, Period, AccountID, Department, Amount, Version (Draft|Approved)

PeriodClose
├── PeriodID, Status (Open|SoftClose|Locked), ClosedBy, ClosedAt, Checklist[]
```

---

## 4. Module Breakdown

### 4.1 General Ledger
- Manual journal entry with maker-checker approval (configurable threshold)
- Auto-posting adapters from: PMS/Front Office (room revenue, city ledger), POS (F&B revenue), Payroll (labor cost), Bank feed (fees, interest)
- Multi-currency revaluation at period-end (unrealized FX gain/loss)
- Recurring journal templates (rent, depreciation, prepaid amortization)
- Full audit trail: every posted entry immutable; corrections via reversing entry only, never edit-in-place

### 4.2 Accounts Payable
- Purchase requisition → PO → Goods Receipt → 3-way match → Bill → Payment
- Vendor withholding tax calculation (Ethiopian 2%/30% withholding rules by vendor category and TIN status)
- Aging report (Current, 30/60/90+)
- Batch payment run with bank file export

### 4.3 Accounts Receivable
- Auto-import guest folio balances at checkout from Operations Core (city ledger / direct billing accounts)
- Travel agent / OTA commission tracking and net-settlement reconciliation
- Statement generation and dunning workflow for corporate accounts
- Aging report mirrored to AP structure

### 4.4 Bank & Cash Reconciliation
- Manual statement import (CSV/Excel in Phase 1; live feed in later phase)
- Auto-match rules engine (amount + date + reference fuzzy match)
- Cash drawer reconciliation tied to Front Office shift close and POS end-of-day

### 4.5 Fixed Assets
- Asset register with category-based default useful life (Ethiopian tax depreciation schedules vs. book depreciation — dual tracking)
- Straight-line and declining-balance methods
- Auto-generate monthly depreciation journal

### 4.6 Tax & Compliance (ERCA)
- VAT (15%) output/input tracking with monthly VAT return summary export
- Turnover Tax (TOT) handling for applicable revenue lines
- Withholding tax certificates (vendor and, where applicable, guest/corporate)
- TIN validation field on Vendor/Customer records
- Exportable statutory report formats matching ERCA declaration structure (finance team files externally in Phase 1 — no direct e-filing integration yet)

### 4.7 Financial Reporting
- Trial Balance (any date, any period)
- P&L: consolidated and department-level (Rooms, F&B, Other Operated Depts, Undistributed, Fixed Charges) per USALI structure
- Balance Sheet
- Cash Flow Statement (indirect method)
- Budget vs. Actual with variance %, drillable to journal line
- Hospitality KPI overlay: RevPAR, ADR, GOPPAR, F&B cost %, labor cost % — pulled from Operations Core and blended with GL actuals

### 4.8 Period Close Workflow
- Checklist-driven soft close → hard lock
- Soft close: warns on out-of-balance sub-ledgers, unposted drafts, unreconciled bank lines
- Hard lock: prevents any posting to closed period; adjustments require period reopen (admin-gated, logged)

---

## 5. Roles & Permissions (RBAC)

| Role | Access |
|---|---|
| Finance Clerk | Create draft journals/bills/invoices; no posting rights |
| Accountant | Post journals, approve bills under threshold, run reconciliation |
| Finance Manager | Approve bills above threshold, period soft close, budget entry |
| Controller/CFO | Period hard close/lock, chart of accounts changes, financial statement sign-off |
| Auditor (read-only) | Full read access to ledger, journals, audit trail; no write |
| Executive Portal (cross-module) | Summary KPI/dashboard view only, no transactional access |

All role changes and permission overrides logged to the same audit trail as journal postings.

---

## 6. Integration Points

| System | Direction | Data |
|---|---|---|
| Operations Core (PMS) | Inbound | Room revenue, city ledger folios, guest checkout balances |
| POS | Inbound | F&B revenue, discounts, void/comp tracking |
| Payroll (interface stub) | Inbound | Labor cost journal batch |
| Bank statement import | Inbound | Transaction lines for reconciliation |
| Payment gateway (Chapa/Flutterwave — later phase) | Inbound | Settlement confirmation matched to AR |
| Executive Portal | Outbound | KPI summaries, P&L snapshot, budget variance |
| System Admin Portal | Bidirectional | User roles, COA config, tax code config |

---

## 7. Non-Functional Requirements

- **Auditability**: every financial record change is append-only with actor, timestamp, before/after state
- **Currency precision**: store amounts as integer minor units or fixed-decimal, never floating point
- **Localization**: Amharic/Tigrinya labels for printed statements and vendor-facing documents (English as system default)
- **Data retention**: statutory minimum retention for financial records per Ethiopian commercial code (plan for 10-year retention of posted journals)
- **Performance**: Trial Balance and P&L generation must run on-demand for any date range without pre-aggregation lag beyond a few seconds at single-property scale

---

## 8. Suggested Build Sequence

1. COA + GL core (manual journals, posting engine, period model)
2. AP (vendor, bill, payment, withholding tax)
3. AR (customer/city ledger, invoice, folio import stub)
4. Bank reconciliation
5. Financial statements (Trial Balance → P&L → Balance Sheet → Cash Flow)
6. Fixed assets + depreciation automation
7. Budget vs. Actual
8. Period close workflow + audit trail hardening
9. Tax/ERCA reporting exports
10. Executive Portal KPI feed integration

---

*This is a base architecture prompt — paste into a fresh module design session and extend with property-specific COA numbering, exact ERCA form layouts, and specific bank formats as they're confirmed.*
