# Unified Housekeeping Portal Architecture

> **Version:** 1.0
> **Portal:** Housekeeping
> **Architecture Style:** Unified Hotel ERP Portal

---

# 1. Overview

The **Housekeeping Portal** manages all room cleanliness, public area cleaning, linen operations, amenities replenishment, inspections, minibar servicing, and lost & found activities. It ensures rooms are guest-ready while coordinating closely with the Front Office (PMS), Engineering, Laundry, Inventory, and Food & Beverage portals.

The Housekeeping Portal owns all housekeeping operations but does **not** manage reservations, billing, inventory procurement, or maintenance work orders.

---

# 2. Operational Workflow

```text
Guest Checks Out
        │
        ▼
Room Becomes Dirty
        │
        ▼
Cleaning Task Assigned
        │
        ▼
Cleaning Performed
        │
        ▼
Inspection
        │
        ▼
Room Ready
        │
        ▼
Released to PMS
```

---

# 3. Portal Modules

```text
Housekeeping Portal
│
├── Dashboard
├── Room Status
├── Task Management
├── Room Cleaning
├── Public Area Cleaning
├── Room Inspections
├── Room Attendant Management
├── Supervisor Console
├── Linen Management Interface
├── Laundry Interface
├── Amenities Management
├── Minibar Operations
├── Lost & Found
├── Guest Requests
├── Deep Cleaning
├── Preventive Cleaning
├── Maintenance Coordination
├── Inventory Requests
├── Communication Center
├── Reports
└── Configuration
```

---

# 4. Dashboard

## Operational KPIs

* Rooms Ready
* Dirty Rooms
* Clean Rooms
* Inspected Rooms
* Occupied Rooms
* Vacant Rooms
* Out of Order Rooms
* Out of Service Rooms
* Cleaning Progress
* Average Cleaning Time
* Outstanding Guest Requests
* Open Maintenance Issues

## Alerts

* VIP Arrival Rooms Pending
* Early Arrival Priority
* Late Check-out Delay
* Failed Inspection
* Linen Shortage
* Minibar Pending
* Deep Cleaning Due
* Maintenance Awaiting Access

---

# 5. Room Status

## Room Conditions

* Vacant Clean (VC)
* Vacant Dirty (VD)
* Occupied Clean (OC)
* Occupied Dirty (OD)
* Inspected
* Ready
* Pickup
* Sleep-Out
* Do Not Disturb
* Out of Order
* Out of Service

## Controls

* Change Status
* Lock Room
* Release Room
* Mark Cleaning Started
* Mark Cleaning Completed

---

# 6. Task Management

## Automatic Tasks

* Checkout Cleaning
* Stayover Service
* VIP Preparation
* Turndown Service
* Early Arrival Preparation
* Deep Cleaning
* Preventive Cleaning
* Public Area Cleaning

## Manual Tasks

* Special Cleaning
* Emergency Cleaning
* Biohazard Cleaning
* Room Refresh
* Guest Complaint Follow-up

---

# 7. Room Cleaning

## Standard Cleaning

* Bed Making
* Bathroom Cleaning
* Vacuuming
* Dusting
* Trash Removal
* Surface Sanitization
* Amenity Refill
* Towel Replacement

## Service Types

* Full Service
* Stayover Service
* Express Service
* Eco Service
* Turndown Service

---

# 8. Public Area Cleaning

* Lobby
* Reception
* Corridors
* Elevators
* Restrooms
* Meeting Rooms
* Restaurants
* Bars
* Pool Area
* Spa
* Fitness Center
* Parking Areas
* Staff Areas
* Offices

---

# 9. Room Inspections

## Inspection Checklist

* Bed Quality
* Bathroom
* Floors
* Windows
* Furniture
* Lighting
* Air Conditioning
* Television
* Internet
* Amenities
* Safety Equipment
* Overall Presentation

## Results

* Pass
* Fail
* Rework Required

---

# 10. Room Attendant Management

## Staff Assignment

* Room Assignment
* Floor Assignment
* Zone Assignment
* Shift Assignment
* Workload Balancing

## Productivity

* Rooms Completed
* Cleaning Time
* Inspection Score
* Productivity Score

---

# 11. Supervisor Console

* Live Room Monitor
* Reassign Tasks
* Priority Override
* Inspection Approval
* Escalations
* Staff Performance
* Shift Summary

---

# 12. Linen Management Interface

## Linen Types

* Bed Sheets
* Pillowcases
* Duvet Covers
* Blankets
* Bath Towels
* Hand Towels
* Face Towels
* Bath Mats
* Robes
* Pool Towels

## Operations

* Issue Linen
* Return Linen
* Damaged Linen
* Lost Linen
* Linen Count

---

# 13. Laundry Interface

* Pickup Requests
* Delivery Status
* Guest Laundry Tracking
* Uniform Laundry
* Linen Laundry
* Laundry Exceptions

---

# 14. Amenities Management

## Guest Amenities

* Soap
* Shampoo
* Conditioner
* Body Wash
* Lotion
* Toothbrush Kit
* Shaving Kit
* Sewing Kit
* Slippers
* Water Bottles
* Tea & Coffee
* Stationery

## Functions

* Consumption Recording
* Replenishment
* Shortage Reporting

---

# 15. Minibar Operations

* Refill
* Consumption Recording
* Missing Items
* Stock Verification
* Charge Posting to PMS

---

# 16. Lost & Found

## Registration

* Item Description
* Category
* Location Found
* Date Found
* Finder
* Photo Attachment

## Lifecycle

* Store
* Match Owner
* Return
* Ship
* Dispose

---

# 17. Guest Requests

* Extra Towels
* Extra Pillows
* Extra Blanket
* Baby Cot
* Iron & Iron Board
* Laundry Pickup
* Cleaning Request
* Turndown Request
* Special Amenities

---

# 18. Deep Cleaning

## Schedule

* Weekly
* Monthly
* Quarterly
* Annual

## Tasks

* Carpet Shampoo
* Curtain Cleaning
* Mattress Rotation
* Upholstery Cleaning
* Wall Cleaning
* Air Vent Cleaning

---

# 19. Preventive Cleaning

* Air Filters
* Furniture Polish
* Tile Grout
* Window Cleaning
* Balcony Cleaning
* Ceiling Cleaning

---

# 20. Maintenance Coordination

## Issue Reporting

* Plumbing
* Electrical
* HVAC
* Furniture Damage
* Lock Problems
* Lighting
* TV
* Internet

## Workflow

* Report Issue
* Assign Engineering
* Track Status
* Verify Completion
* Release Room

---

# 21. Inventory Requests

Items requested from the Inventory Portal:

* Cleaning Chemicals
* Cleaning Equipment
* Guest Amenities
* Paper Products
* PPE
* Trash Bags
* Linen Replacements

---

# 22. Communication Center

* Internal Chat
* Task Notifications
* Escalations
* Shift Announcements
* Guest Service Notifications

---

# 23. Reports

## Operational Reports

* House Status Report
* Room Cleaning Report
* Room Readiness Report
* Occupancy vs Cleaning
* VIP Room Status
* Cleaning Productivity

## Staff Reports

* Attendant Performance
* Supervisor Performance
* Shift Report
* Overtime Report

## Inventory Reports

* Amenity Consumption
* Linen Usage
* Damaged Linen
* Lost Linen
* Chemical Consumption

## Quality Reports

* Inspection Report
* Failed Inspection Report
* Guest Complaint Report
* Rework Report

---

# 24. Configuration

## Property Setup

* Buildings
* Floors
* Zones
* Public Areas

## Room Status Setup

* Status Codes
* Cleaning Priorities
* Inspection Rules

## Task Setup

* Task Types
* Service Levels
* Cleaning Standards
* Estimated Times

## Staff Setup

* Teams
* Shifts
* Skills
* Certifications

---

# 25. Portal Integrations

| Portal                | Integration                                          |
| --------------------- | ---------------------------------------------------- |
| Front Office (PMS)    | Room Status, Check-out, Room Release, Guest Requests |
| Engineering           | Maintenance Requests, Room Out of Order              |
| Laundry               | Linen Collection and Return                          |
| Inventory             | Amenities, Chemicals, Linen Replenishment            |
| Food & Beverage       | Minibar Charge Posting                               |
| Security              | Lost & Found Verification                            |
| Human Resources       | Staff Scheduling and Attendance                      |
| System Administration | Users, Roles, Audit Logs                             |

---

# 26. Ownership Boundaries

## Owned by Housekeeping

* Room Cleaning
* Public Area Cleaning
* Room Inspection
* Linen Operations
* Amenities Replenishment
* Minibar Servicing
* Lost & Found
* Guest Housekeeping Requests
* Cleaning Schedules

## Integrated (Not Owned)

* Reservations
* Guest Billing
* Inventory Procurement
* Laundry Production
* Maintenance Repairs
* Payroll
* Financial Accounting
* System Administration

---

# 27. Design Principles

* Real-time room status synchronization
* Mobile-first attendant workflows
* QR code room/task support
* Offline-capable housekeeping app
* Supervisor approval workflow
* Digital inspection checklists
* Role-based access control (RBAC)
* Full audit trail
* Multi-property support
* Multi-language support
* KPI-driven productivity monitoring
* API-first integration architecture

---

**End of Document**
