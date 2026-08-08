# Unified Front Office Portal (PMS) Architecture

> **Version:** 1.0
> **Portal:** Front Office / Property Management System (PMS)
> **Architecture Style:** Unified Hotel ERP Portal

---

# 1. Overview

The **Front Office Portal (Property Management System - PMS)** is the operational hub responsible for the complete guest journey, from reservation through post-stay follow-up. It centralizes guest-facing operations while integrating seamlessly with Finance, Housekeeping, Maintenance, Food & Beverage, CRM, Revenue Management, and other ERP portals.

The Front Office Portal owns all guest accommodation processes but does **not** duplicate functionality owned by other departmental portals.

---

# 2. Guest Journey

```text
Inquiry
    │
    ▼
Reservation
    │
    ▼
Pre-Arrival
    │
    ▼
Arrival
    │
    ▼
Check-In
    │
    ▼
In-House Stay
    │
    ▼
Guest Services
    │
    ▼
Check-Out
    │
    ▼
Night Audit
    │
    ▼
Post Stay
```

---

# 3. Portal Modules

```
Front Office Portal
│
├── Dashboard
├── Reservations
├── Availability & Inventory
├── Front Desk Operations
├── Room Assignment
├── Guest Profiles
├── Stay Management
├── Check-In
├── Check-Out
├── Folio & Billing Interface
├── Cashiering
├── Night Audit
├── Keys & Access
├── Concierge
├── Bell Desk
├── Transportation
├── Guest Requests
├── Lost & Found
├── Communication Center
├── Packages & Add-ons
├── Loyalty Interface
├── OTA Interface
├── Revenue Controls
├── Reports
└── Configuration
```

---

# 4. Dashboard

## Operational KPIs

* Occupancy %
* ADR
* RevPAR
* Today's Revenue
* Arrivals Today
* Departures Today
* Stayovers
* Expected Check-ins
* Expected Check-outs
* House Status
* Available Rooms
* Out of Order Rooms
* Out of Service Rooms

## Operational Alerts

* VIP Arrivals
* Birthday Guests
* Anniversary Guests
* Long Stay Guests
* No Shows
* Overbookings
* High Balance Guests
* Payment Authorization Failed
* Blacklisted Guests
* Pending Room Assignments

---

# 5. Reservations

## Reservation Sources

* Website
* Walk-in
* OTA
* Corporate
* Travel Agent
* Group
* Call Center
* Mobile App

## Reservation Operations

* Availability Search
* Rate Search
* Reservation Creation
* Reservation Modification
* Cancellation
* No Show
* Waitlist
* Overbooking Control
* Reservation Split
* Reservation Merge
* Stay Extension
* Early Departure
* Upgrade
* Downgrade

---

# 6. Availability & Inventory

## Inventory Management

* Room Types
* Physical Rooms
* Room Inventory
* House Inventory
* Group Blocks
* Overbooking Limits
* Sell Limits

## Availability Views

* Daily Grid
* Weekly Calendar
* Monthly Calendar
* Occupancy Calendar
* Forecast Calendar

---

# 7. Front Desk Operations

## Arrival Management

* Expected Arrivals
* Pre-registration
* Mobile Check-in
* Express Check-in
* Group Check-in
* VIP Arrival

## Departure Management

* Express Check-out
* Late Check-out
* Group Check-out
* Invoice Settlement

---

# 8. Room Assignment

* Auto Assignment
* Manual Assignment
* Room Blocking
* Room Lock
* Room Preference Matching
* Adjacent Rooms
* Connecting Rooms
* Accessible Rooms
* Smoking Preference
* Floor Preference
* Bed Preference
* View Preference

---

# 9. Guest Profiles

## Guest Information

* Personal Information
* Passport / National ID
* Visa Information
* Contact Details
* Emergency Contact
* Company Details

## Guest Preferences

* Language
* Room Preference
* Pillow Preference
* Bed Type
* Dietary Preference
* Newspaper
* Amenities

## Guest History

* Previous Stays
* Total Revenue
* Stay Frequency
* Loyalty Status
* Complaints
* Compliments
* Blacklist Status

---

# 10. Stay Management

* Room Move
* Room Swap
* Extend Stay
* Shorten Stay
* Split Stay
* Merge Stay
* Guest Transfer
* Share Reservation
* Wake-up Calls
* Do Not Disturb Status

---

# 11. Check-In

## Registration

* Identity Verification
* Passport Scanner
* Digital Registration Card
* Digital Signature
* Deposit Collection
* Payment Authorization

## Key Management

* Encode Key Card
* Mobile Key
* Duplicate Key
* Lost Key Replacement

---

# 12. Check-Out

* Express Check-out
* Invoice Review
* Settlement
* Refund Processing
* Feedback Collection
* Folio Closure

---

# 13. Folio & Billing Interface

## Charge Posting

* Room Charges
* Restaurant Charges
* Bar Charges
* Room Service
* Laundry
* Spa
* Telephone
* Transportation
* Gift Shop
* Miscellaneous Charges

## Folio Types

* Guest Folio
* Company Folio
* Group Folio
* Split Folio
* Master Folio

---

# 14. Cashiering

## Payment Methods

* Cash
* Credit Card
* Debit Card
* Bank Transfer
* Mobile Payment
* Voucher
* Foreign Currency

## Cashier Functions

* Deposits
* Refunds
* Advance Payments
* City Ledger Transfer
* Cash Float
* Cashier Shift
* Cashier Closure

---

# 15. Night Audit

## Automated Tasks

* Room Posting
* Tax Posting
* Package Posting
* Revenue Validation
* Missing Charges Detection
* Occupancy Validation
* Folio Balancing
* Cashier Closing
* Journal Generation
* Business Day Close
* Business Day Open

---

# 16. Keys & Access

* Key Encoding
* Mobile Key
* Master Key Requests
* Lost Keys
* Duplicate Keys
* Door Lock Interface
* Access Audit Trail

---

# 17. Concierge

* Tour Booking
* Restaurant Booking
* Local Information
* Courier Services
* Parcel Handling
* Ticket Booking
* Wake-up Calls

---

# 18. Bell Desk

* Luggage Collection
* Luggage Delivery
* Storage
* Porter Assignment
* Group Baggage Handling

---

# 19. Transportation

* Airport Pickup
* Airport Drop-off
* Shuttle Scheduling
* Driver Assignment
* Vehicle Allocation
* Transfer Tracking

---

# 20. Guest Requests

* Extra Bed
* Baby Cot
* Extra Towels
* Laundry Pickup
* Maintenance Request
* Housekeeping Request
* Special Amenities
* VIP Setup
* Room Service Request

---

# 21. Lost & Found

* Register Item
* Item Categorization
* Storage Location
* Owner Matching
* Return Workflow
* Disposal Workflow

---

# 22. Communication Center

* Internal Messaging
* Email
* SMS
* WhatsApp Integration
* Push Notifications
* Task Assignment
* Guest Chat

---

# 23. Packages & Add-ons

* Breakfast
* Half Board
* Full Board
* Airport Transfer
* Spa Package
* Conference Package
* Honeymoon Package
* Late Check-out
* Early Check-in

---

# 24. Loyalty Interface

* Membership
* Points
* Rewards
* Redemption
* Tier Upgrade
* Stay History

---

# 25. OTA Interface

* Reservation Sync
* Availability Sync
* Rate Sync
* Inventory Sync
* Restrictions
* Cancellation Sync
* Modification Sync

---

# 26. Revenue Controls

* Dynamic Pricing Interface
* Occupancy Forecast
* Yield Recommendations
* Length of Stay Rules
* Closed to Arrival
* Closed to Departure
* Stop Sell
* Overbooking Limits

---

# 27. Reports

## Daily Reports

* Arrival Report
* Departure Report
* In-House Guests
* VIP Guests
* House Status
* Occupancy Report
* Room Rack Report

## Reservation Reports

* Pickup Report
* Cancellation Report
* No Show Report
* Forecast Report
* Group Report

## Financial Reports

* Guest Ledger
* Deposit Ledger
* Cashier Summary
* Shift Report
* Folio Report

## Operational Reports

* Room Move Report
* Room Assignment Report
* Guest Balance Report
* Long Stay Report
* Blacklisted Guests
* Lost & Found Report
* Concierge Activity
* Transportation Report

---

# 28. Configuration

## Hotel Setup

* Property
* Building
* Wing
* Floor
* Room Type
* Room
* Amenities
* Features

## Reservation Setup

* Reservation Status
* Rate Codes
* Market Segments
* Sources
* Cancellation Policies
* Deposit Policies
* Guarantee Policies

## Front Office Setup

* Folio Types
* Payment Types
* Cashier Configuration
* Key System Configuration
* Registration Templates
* Invoice Templates

---

# 29. Portal Integrations

| Portal                | Integration                                   |
| --------------------- | --------------------------------------------- |
| Housekeeping          | Room Status, Cleaning Progress, Room Release  |
| Maintenance           | Maintenance Requests, Out of Order Rooms      |
| Food & Beverage       | POS Charge Posting, Meal Package Validation   |
| Finance               | Guest Ledger, Payments, Journals, Night Audit |
| CRM                   | Guest Profiles, Preferences, Loyalty          |
| Revenue Management    | Dynamic Pricing, Forecasting, Restrictions    |
| Sales & Events        | Group Reservations, Room Blocks               |
| Security              | Key Cards, Guest Access Logs                  |
| System Administration | Users, Roles, Audit Logs, Integrations        |

---

# 30. Ownership Boundaries

## Owned by Front Office

* Reservations
* Check-in
* Check-out
* Guest Stay
* Guest Profiles
* Room Assignment
* Guest Folios
* Cashiering
* Night Audit
* Concierge
* Bell Desk
* Transportation
* Guest Requests

## Integrated (Not Owned)

* Housekeeping Operations
* Engineering Operations
* Accounting
* Procurement
* Inventory
* Food Production
* POS Operations
* Human Resources
* Payroll
* Sales & Marketing
* Revenue Management Calculations
* System Administration

---

# 31. Design Principles

* Modular architecture
* Multi-property support
* Multi-currency support
* Multi-language support
* Real-time synchronization
* Offline-capable front desk operations
* Full audit trail
* Role-based access control (RBAC)
* API-first integration
* Cloud-native deployment
* Mobile-friendly interface
* High availability
* Business continuity support
* Scalable for hotel chains
* Compliance with hospitality best practices

---

**End of Document**
