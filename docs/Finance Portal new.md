# Unified Finance & Accounting Portal Architecture

> **Version:** 1.0
> **Portal:** Finance & Accounting
> **Architecture Style:** Unified Hotel ERP Portal

---

# 1. Overview

The **Finance & Accounting Portal** is the financial backbone of the Hotel ERP. It records, validates, controls, and reports all financial transactions generated across every operational portal while maintaining compliance with accounting standards and internal controls.

This portal is responsible for the complete financial lifecycle—from transaction posting and general ledger management to accounts payable, accounts receivable, budgeting, treasury, fixed assets, financial reporting, taxation, and financial close.

All operational portals (PMS, POS, Housekeeping, Engineering, Procurement, HR, Sales, Revenue Management, etc.) generate operational transactions, while the **Finance Portal owns the accounting records**.

---

# 2. Financial Transaction Flow

```text id="finflow01"
Operational Transaction
          │
          ▼
Source Document
          │
          ▼
Financial Validation
          │
          ▼
Subledger Posting
          │
          ▼
General Ledger
          │
          ▼
Period Close
          │
          ▼
Financial Statements
```

---

# 3. Portal Modules

```text id="finmod01"
Finance & Accounting Portal
│
├── Executive Dashboard
├── General Ledger
├── Chart of Accounts
├── Accounts Receivable
├── Accounts Payable
├── Cash & Bank Management
├── Treasury Management
├── Revenue Accounting
├── Expense Management
├── Cost Center Accounting
├── Budgeting & Forecasting
├── Fixed Asset Management
├── Inventory Accounting
├── Intercompany Accounting
├── Tax Management
├── Financial Close
├── Financial Consolidation
├── Audit & Compliance
├── Document Management
├── Approval Workflow
├── Business Intelligence
├── Reports
└── Configuration
```

---

# 4. Executive Dashboard

## Financial KPIs

* Total Revenue
* Total Expenses
* Gross Profit
* Operating Profit
* Net Profit
* EBITDA
* Cash Position
* Bank Balance
* Accounts Receivable Aging
* Accounts Payable Aging
* Daily Cash Flow
* Budget vs Actual

## Alerts

* Overdue Receivables
* Overdue Payables
* Cash Shortage
* Budget Exceeded
* Bank Reconciliation Pending
* Tax Filing Due
* Period Close Pending
* Approval Queue
* Suspense Account Balance

---

# 5. Chart of Accounts

## Structure

* Assets
* Liabilities
* Equity
* Revenue
* Cost of Sales
* Operating Expenses
* Other Income
* Other Expenses

## Features

* Multi-Level COA
* Department Mapping
* Cost Center Mapping
* Profit Center Mapping
* Project Mapping
* Multi-Property Mapping

---

# 6. General Ledger

## Journal Types

* Automatic Journals
* Manual Journals
* Recurring Journals
* Reversing Journals
* Adjusting Journals
* Closing Journals

## Functions

* Journal Approval
* Trial Balance
* Ledger Inquiry
* Journal Audit Trail
* Period Lock
* Period Reopen (Authorized)

---

# 7. Accounts Receivable (AR)

## Customer Types

* Guest Ledger
* Corporate Accounts
* Travel Agents
* City Ledger
* Event Customers
* Long-term Contracts

## Functions

* Invoice Generation
* Credit Notes
* Debit Notes
* Payment Allocation
* Customer Statements
* Aging Analysis
* Collection Tracking
* Credit Limits

---

# 8. Accounts Payable (AP)

## Vendor Types

* Suppliers
* Contractors
* Utilities
* Service Providers
* Government Agencies

## Functions

* Vendor Invoices
* Three-Way Matching
* Payment Approval
* Payment Scheduling
* Vendor Statements
* Aging Analysis
* Credit Notes

---

# 9. Cash & Bank Management

## Cash Operations

* Cash Receipts
* Cash Payments
* Petty Cash
* Cash Float
* Cash Transfers

## Bank Operations

* Bank Accounts
* Bank Reconciliation
* Electronic Payments
* Bank Transfers
* Bank Charges
* Interest Income

---

# 10. Treasury Management

* Cash Forecasting
* Liquidity Planning
* Investment Tracking
* Loan Management
* Foreign Exchange
* Cash Pooling

---

# 11. Revenue Accounting

## Revenue Sources

* Room Revenue
* Food & Beverage
* Spa
* Laundry
* Transport
* Retail Shop
* Events
* Miscellaneous Income

## Functions

* Revenue Recognition
* Deferred Revenue
* Package Revenue Allocation
* Daily Revenue Posting

---

# 12. Expense Management

## Expense Categories

* Payroll
* Utilities
* Maintenance
* Marketing
* Insurance
* Office Supplies
* Food Cost
* Beverage Cost
* Laundry Cost

## Functions

* Expense Claims
* Expense Approval
* Expense Allocation
* Recurring Expenses

---

# 13. Cost Center Accounting

## Cost Centers

* Front Office
* Housekeeping
* Engineering
* Food & Beverage
* Kitchen
* Laundry
* Spa
* Sales & Marketing
* Administration
* Security
* IT

## Functions

* Department Expenses
* Revenue Allocation
* Profitability Analysis
* Department P&L

---

# 14. Budgeting & Forecasting

## Budget Types

* Operating Budget
* Capital Budget
* Payroll Budget
* Revenue Budget
* Cash Budget

## Functions

* Budget Preparation
* Budget Approval
* Budget Revision
* Variance Analysis
* Rolling Forecast

---

# 15. Fixed Asset Management

## Asset Categories

* Buildings
* Furniture
* Equipment
* Vehicles
* Computers
* Kitchen Equipment
* Laundry Equipment

## Functions

* Asset Registration
* Asset Transfers
* Asset Disposal
* Asset Revaluation
* Depreciation
* Asset Verification
* Warranty Tracking

---

# 16. Inventory Accounting

Integrated with Inventory Management Portal.

## Functions

* Inventory Valuation
* Cost of Goods Sold (COGS)
* Inventory Adjustments
* Stock Write-offs
* Stock Revaluation

---

# 17. Intercompany Accounting

* Intercompany Invoices
* Due To / Due From
* Elimination Entries
* Consolidated Reporting

---

# 18. Tax Management

## Tax Types

* VAT
* Sales Tax
* Withholding Tax
* Tourism Levy
* Service Charge
* Local Taxes

## Functions

* Tax Calculation
* Tax Filing
* Tax Reports
* Tax Adjustments
* Tax Audit Support

---

# 19. Financial Close

## Closing Activities

* Revenue Verification
* Expense Accruals
* Prepayments
* Depreciation
* Inventory Closing
* Bank Reconciliation
* Journal Review
* Trial Balance
* Financial Statements
* Year-End Closing

---

# 20. Financial Consolidation

* Multi-Property Consolidation
* Multi-Company Consolidation
* Currency Translation
* Elimination Entries
* Group Financial Statements

---

# 21. Audit & Compliance

* Audit Trail
* User Activity Logs
* Journal Approval History
* Segregation of Duties
* Compliance Monitoring
* External Audit Support

---

# 22. Document Management

* Invoices
* Receipts
* Payment Vouchers
* Journal Attachments
* Bank Statements
* Contracts
* Tax Documents

---

# 23. Approval Workflow

* Journal Approval
* Vendor Invoice Approval
* Payment Approval
* Budget Approval
* Expense Approval
* Asset Approval
* Multi-Level Authorization

---

# 24. Business Intelligence

## Financial Analytics

* Revenue Trends
* Expense Trends
* Profitability
* Cash Flow
* Liquidity Ratios
* Financial Ratios
* Cost Analysis
* Forecast Accuracy

---

# 25. Reports

## Financial Statements

* Balance Sheet
* Income Statement (Profit & Loss)
* Cash Flow Statement
* Statement of Changes in Equity
* Trial Balance

## General Ledger Reports

* General Ledger
* Journal Register
* Trial Balance
* Account Activity
* Audit Trail

## Accounts Receivable Reports

* AR Aging
* Customer Statement
* Outstanding Invoices
* Collection Report

## Accounts Payable Reports

* AP Aging
* Vendor Statement
* Payment Schedule
* Outstanding Bills

## Cash & Bank Reports

* Bank Reconciliation
* Cash Book
* Bank Book
* Cash Flow Forecast

## Budget Reports

* Budget vs Actual
* Variance Analysis
* Forecast Report

## Asset Reports

* Asset Register
* Depreciation Schedule
* Asset Movement
* Asset Disposal

## Tax Reports

* VAT Report
* Withholding Tax Report
* Tax Summary
* Tax Filing Report

## Department Reports

* Department Profit & Loss
* Cost Center Analysis
* Profit Center Analysis

---

# 26. Configuration

## Financial Setup

* Fiscal Years
* Accounting Periods
* Posting Rules
* Currency Setup
* Exchange Rates

## Ledger Setup

* Chart of Accounts
* Journal Types
* Posting Profiles
* Cost Centers
* Profit Centers

## Approval Setup

* Approval Levels
* Delegation Rules
* Spending Limits

## Tax Setup

* Tax Codes
* Tax Rates
* Tax Jurisdictions

---

# 27. Portal Integrations

| Portal                 | Integration                                      |
| ---------------------- | ------------------------------------------------ |
| Front Office (PMS)     | Guest Folios, Payments, Night Audit Journals     |
| Food & Beverage        | POS Revenue, Discounts, Payments, Cost of Sales  |
| Procurement            | Purchase Orders, Goods Receipts, Vendor Invoices |
| Inventory              | Inventory Valuation, Stock Movements, COGS       |
| Engineering            | Maintenance Costs, Capital Projects              |
| Human Resources        | Payroll Journals, Employee Expenses              |
| Sales, Marketing & CRM | Corporate Billing, Commissions                   |
| Revenue Management     | Revenue Analytics, Forecast Comparison           |
| Events & Banquets      | Event Billing, Deposits                          |
| Business Intelligence  | Executive Dashboards                             |
| System Administration  | Users, Roles, Audit Logs                         |

---

# 28. Ownership Boundaries

## Owned by Finance & Accounting

* General Ledger
* Chart of Accounts
* Accounts Receivable
* Accounts Payable
* Treasury
* Cash & Bank
* Budgeting
* Fixed Assets
* Tax Management
* Financial Reporting
* Financial Close
* Consolidation
* Audit & Compliance

## Integrated (Not Owned)

* Reservations
* Guest Operations
* POS Operations
* Inventory Operations
* Procurement Operations
* Engineering Operations
* Housekeeping Operations
* Payroll Processing
* User Administration

---

# 29. Design Principles

* Double-entry accounting
* Real-time financial posting
* Automated subledger integration
* Configurable approval workflows
* Multi-property support
* Multi-company support
* Multi-currency support
* Multi-fiscal calendar support
* IFRS/GAAP-ready architecture
* Department and project accounting
* Role-based access control (RBAC)
* Complete audit trail
* API-first integration
* Cloud-native deployment
* Scalable for hotel groups and international chains

---

# 30. Financial Posting Sources

| Source Portal      | Accounting Impact                                   |
| ------------------ | --------------------------------------------------- |
| Front Office (PMS) | Room revenue, guest payments, deposits, city ledger |
| Food & Beverage    | POS revenue, discounts, taxes, service charges      |
| Procurement        | Accounts payable, inventory receipts                |
| Inventory          | Inventory valuation, COGS, adjustments              |
| Engineering        | Maintenance expenses, asset capitalization          |
| Human Resources    | Payroll expenses, liabilities                       |
| Sales & CRM        | Corporate invoicing, commissions                    |
| Revenue Management | Forecast comparison and revenue analytics           |
| Events & Banquets  | Deposits, event billing, package revenue            |

---

**End of Document**
