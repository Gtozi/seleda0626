# Unified Transportation & Fleet Portal Architecture

> **Version:** 1.0
> **Portal:** Transportation & Fleet Management
> **Architecture Style:** Unified Hotel ERP Portal

---

# 1. Overview

The **Transportation & Fleet Portal** manages all hotel transportation operations, including airport transfers, guest transportation, shuttle services, company vehicles, limousine services, staff transportation, fleet maintenance coordination, driver management, trip scheduling, dispatching, fuel management, and vehicle utilization.

The portal provides complete visibility into transportation operations while integrating with the Front Office (PMS), Concierge, Engineering, Finance, Human Resources, Procurement, Security, and Events portals.

Transportation operations may be fully hotel-owned, outsourced, or a hybrid model.

---

# 2. Transportation Workflow

```text id="fleetflow01"
Transportation Request
          │
          ▼
Availability Check
          │
          ▼
Vehicle Assignment
          │
          ▼
Driver Assignment
          │
          ▼
Trip Dispatch
          │
          ▼
Trip Execution
          │
          ▼
Trip Completion
          │
          ▼
Billing & Analytics
```

---

# 3. Portal Modules

```text id="fleetmod01"
Transportation & Fleet Portal
│
├── Executive Dashboard
├── Transportation Requests
├── Dispatch Center
├── Trip Management
├── Airport Transfers
├── Shuttle Management
├── Guest Transportation
├── Corporate Transportation
├── Staff Transportation
├── Fleet Management
├── Vehicle Registry
├── Driver Management
├── Route Management
├── Scheduling & Dispatch
├── GPS Tracking
├── Fuel Management
├── Vehicle Maintenance Interface
├── Contractor & Taxi Management
├── Billing & Charges
├── Communication Center
├── Reports
└── Configuration
```

---

# 4. Executive Dashboard

## Transportation KPIs

* Active Trips
* Scheduled Trips
* Completed Trips
* Airport Pickups
* Airport Drop-offs
* Fleet Utilization
* Vehicle Availability
* Driver Availability
* Average Pickup Time
* On-Time Performance
* Fuel Consumption
* Transportation Revenue

## Alerts

* Delayed Pickup
* Flight Delay
* Vehicle Breakdown
* Driver Overtime
* Vehicle Maintenance Due
* Low Fuel
* GPS Offline
* Driver License Expiry

---

# 5. Transportation Requests

## Request Sources

* Front Office
* Concierge
* Guest Mobile App
* Website
* Reservation System
* Corporate Account
* Events & Banquets
* Staff Portal

## Request Types

* Airport Pickup
* Airport Drop-off
* City Transfer
* Hotel Shuttle
* Sightseeing Tour
* VIP Transport
* Staff Shuttle
* Courier Service

---

# 6. Dispatch Center

## Functions

* Live Dispatch Board
* Vehicle Assignment
* Driver Assignment
* Schedule Optimization
* Trip Monitoring
* Dispatch Overrides
* Emergency Dispatch

---

# 7. Trip Management

## Trip Lifecycle

* Requested
* Confirmed
* Assigned
* Driver En Route
* Guest Picked Up
* In Progress
* Completed
* Cancelled
* No Show

## Trip Information

* Pickup Location
* Destination
* Passenger Count
* Estimated Distance
* Estimated Duration
* Special Instructions
* Luggage Requirements

---

# 8. Airport Transfers

## Services

* Arrival Pickup
* Departure Drop-off
* Meet & Greet
* VIP Pickup
* Group Transfer
* Executive Transfer

## Features

* Flight Tracking
* Flight Delay Monitoring
* Terminal Information
* Driver Waiting Time
* Arrival Notifications

---

# 9. Shuttle Management

* Scheduled Routes
* Fixed Timetables
* Demand-Based Shuttle
* Occupancy Monitoring
* Boarding Lists
* Capacity Management

---

# 10. Guest Transportation

* Local Transfers
* Shopping Trips
* Restaurant Transfers
* Tour Transportation
* Medical Transportation
* Special Assistance

---

# 11. Corporate Transportation

* Corporate Contracts
* Executive Transfers
* Business Meetings
* Airport Transfers
* Monthly Billing
* Contract Rates

---

# 12. Staff Transportation

* Staff Shuttle
* Shift Transportation
* Staff Pickup
* Staff Drop-off
* Attendance Integration

---

# 13. Fleet Management

## Fleet Categories

* Sedans
* SUVs
* Vans
* Minibuses
* Luxury Vehicles
* Shuttle Buses
* Utility Vehicles
* Motorcycles
* Electric Vehicles

## Fleet Functions

* Fleet Status
* Utilization
* Vehicle Availability
* Vehicle Allocation
* Vehicle Retirement

---

# 14. Vehicle Registry

## Vehicle Information

* Vehicle Number
* Registration Number
* VIN
* Make
* Model
* Year
* Color
* Capacity
* Fuel Type
* Insurance
* Registration Expiry

---

# 15. Driver Management

## Driver Profile

* Driver Information
* License Details
* Certifications
* Medical Certificate
* Employment Status
* Assigned Vehicle

## Driver Operations

* Driver Scheduling
* Shift Assignment
* Availability
* Performance
* Incident History
* License Expiry Monitoring

---

# 16. Route Management

* Standard Routes
* Dynamic Routes
* Route Optimization
* Estimated Travel Time
* Distance Calculation
* Toll Management

---

# 17. Scheduling & Dispatch

* Calendar View
* Resource Planning
* Conflict Detection
* Auto Scheduling
* Manual Scheduling
* Dispatch Notifications

---

# 18. GPS Tracking

## Live Monitoring

* Vehicle Location
* Speed
* Route Deviation
* Idle Time
* Arrival Estimates
* Geofencing
* Trip Replay

---

# 19. Fuel Management

## Fuel Operations

* Fuel Purchases
* Fuel Consumption
* Fuel Cards
* Fuel Efficiency
* Fuel Cost Analysis
* Fuel Theft Detection

---

# 20. Vehicle Maintenance Interface

Integrated with the Engineering & Maintenance Portal.

## Functions

* Maintenance Requests
* Preventive Maintenance Schedule
* Service History
* Breakdown Reporting
* Vehicle Availability Status

---

# 21. Contractor & Taxi Management

## Partners

* Taxi Companies
* Chauffeur Services
* Bus Operators
* Tour Operators

## Functions

* Contract Management
* Rate Agreements
* Performance Evaluation
* Service Availability
* Invoice Verification

---

# 22. Billing & Charges

## Billing Types

* Guest Folio Posting
* Corporate Billing
* Event Billing
* Cash Payment
* Credit Card
* Complimentary
* Internal Department Charge

## Pricing

* Fixed Rates
* Distance-Based
* Time-Based
* Zone-Based
* Package Rates

---

# 23. Communication Center

* Driver Messaging
* Dispatch Notifications
* Guest Notifications
* SMS
* Email
* Mobile Push Notifications
* Emergency Alerts

---

# 24. Reports

## Operational Reports

* Daily Trip Report
* Vehicle Utilization
* Driver Utilization
* Airport Transfer Report
* Shuttle Performance
* No-show Report

## Fleet Reports

* Fleet Availability
* Vehicle Mileage
* Fuel Consumption
* Fuel Cost
* Maintenance Status
* Vehicle Downtime

## Financial Reports

* Transportation Revenue
* Transportation Expenses
* Contractor Payments
* Trip Profitability
* Cost per Kilometer

## Performance Reports

* Driver Performance
* On-Time Performance
* Customer Satisfaction
* Vehicle Efficiency

---

# 25. Configuration

## Transportation Setup

* Transportation Types
* Service Areas
* Pricing Rules
* Dispatch Rules

## Fleet Setup

* Vehicle Categories
* Fuel Types
* Maintenance Intervals
* GPS Providers

## Driver Setup

* Driver Groups
* Certifications
* Shift Templates
* License Categories

---

# 26. Portal Integrations

| Portal                    | Integration                                                            |
| ------------------------- | ---------------------------------------------------------------------- |
| Front Office (PMS)        | Guest Reservations, Arrival & Departure Schedules, Guest Folio Charges |
| Concierge                 | Guest Transportation Requests, Tours, Local Services                   |
| Sales, Marketing & CRM    | Corporate Accounts, VIP Guests, Contract Rates                         |
| Events & Banquets         | Group Transportation, Conference Shuttle Services                      |
| Engineering & Maintenance | Vehicle Maintenance, Breakdowns, Preventive Service                    |
| Human Resources & Payroll | Driver Records, Scheduling, Attendance, Overtime                       |
| Finance & Accounting      | Billing, Payments, Fuel Costs, Fleet Expenses                          |
| Procurement               | Fuel Purchasing, Vehicle Parts, Fleet Contracts                        |
| Security & Risk           | GPS Monitoring, Driver Safety, Vehicle Incidents                       |
| System Administration     | Users, Roles, Audit Logs, API Integrations                             |

---

# 27. Ownership Boundaries

## Owned by Transportation & Fleet

* Transportation Requests
* Dispatch Operations
* Trip Management
* Fleet Operations
* Vehicle Registry
* Driver Management
* GPS Tracking
* Fuel Management
* Transportation Billing
* Contractor Transportation Management
* Shuttle Operations
* Airport Transfers

## Integrated (Not Owned)

* Guest Reservations
* Vehicle Maintenance
* Financial Accounting
* Payroll
* Procurement
* Security Operations
* User Administration

---

# 28. Design Principles

* Centralized dispatch operations
* Real-time fleet visibility
* GPS-enabled vehicle tracking
* Mobile-first driver application
* Automated trip scheduling
* Flight tracking integration
* Multi-property support
* Multi-company fleet support
* Role-based access control (RBAC)
* Complete audit trail
* Offline driver capability
* API-first integration
* Cloud-native deployment
* Scalable for hotel groups and resorts

---

# 29. Transportation Service Matrix

| Service            | Typical Customer      | Billing Destination        |
| ------------------ | --------------------- | -------------------------- |
| Airport Pickup     | Guest                 | Guest Folio / Corporate    |
| Airport Drop-off   | Guest                 | Guest Folio / Corporate    |
| Hotel Shuttle      | Guest                 | Complimentary or Package   |
| City Transfer      | Guest                 | Guest Folio                |
| Sightseeing Tour   | Guest                 | Guest Folio / Tour Package |
| VIP Limousine      | VIP Guest / Executive | Corporate or Guest Folio   |
| Conference Shuttle | Event Attendees       | Event Master Account       |
| Staff Shuttle      | Employees             | Internal Cost Center       |
| Courier & Delivery | Hotel Departments     | Department Cost Center     |

---

# 30. Fleet KPIs

## Operational Metrics

* Fleet Availability %
* Vehicle Utilization %
* On-Time Pickup %
* Average Dispatch Time
* Average Waiting Time
* Trip Completion Rate

## Financial Metrics

* Revenue per Vehicle
* Cost per Kilometer
* Fuel Cost per Kilometer
* Maintenance Cost per Vehicle
* Fleet ROI

## Safety Metrics

* Driver Safety Score
* Vehicle Incident Rate
* Speeding Violations
* Breakdown Frequency
* Preventive Maintenance Compliance

---

**End of Document**
