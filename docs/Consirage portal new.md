# Unified Concierge Portal Architecture

> **Version:** 1.0
> **Portal:** Concierge Management
> **Architecture Style:** Unified Hotel ERP Portal
> **Purpose:** Guest Services, Personal Assistance, Local Experiences, Transportation Coordination, Activity Planning, and Personalized Guest Engagement

---

# 1. Overview

The **Unified Concierge Portal** is the guest service hub responsible for delivering personalized experiences before, during, and after a guest's stay. It manages guest requests, local recommendations, reservations, transportation coordination, ticketing, packages, luggage services, VIP services, and personalized itineraries.

The Concierge Portal acts as the primary liaison between guests and hotel departments while coordinating with external service providers.

Unlike the **Front Office (PMS)**, which manages reservations and guest stays, the Concierge Portal focuses on **enhancing the guest experience** through personalized services and activity coordination.

---

# 2. Concierge Service Lifecycle

```text id="conflow01"
Guest Request
      │
      ▼
Service Registration
      │
      ▼
Availability Check
      │
      ▼
Reservation / Booking
      │
      ▼
Department / Vendor Coordination
      │
      ▼
Service Delivery
      │
      ▼
Guest Confirmation
      │
      ▼
Billing & Feedback
```

---

# 3. Portal Modules

```text id="conmod01"
Concierge Portal
│
├── Executive Dashboard
├── Guest Service Center
├── Guest Profiles
├── Guest Requests
├── Concierge Desk
├── Experience & Activity Booking
├── Restaurant Reservations
├── Transportation Coordination
├── Tour & Excursion Management
├── Ticketing Services
├── Luggage Services
├── Parcel & Package Management
├── VIP & Butler Services
├── Personal Shopping
├── Local Recommendations
├── Itinerary Planner
├── Wake-up & Reminder Services
├── Guest Communication Center
├── External Vendor Management
├── Billing & Charges
├── Reports
└── Configuration
```

---

# 4. Executive Dashboard

## Guest Service KPIs

* Active Guest Requests
* VIP Guests In-House
* Open Concierge Tasks
* Transportation Requests
* Restaurant Reservations
* Tour Bookings
* Pending Deliveries
* Guest Satisfaction Score
* Average Response Time
* Service Completion Rate

## Alerts

* VIP Arrival
* Urgent Guest Request
* Transportation Delay
* Missed Reservation
* Package Arrival
* Special Occasion
* Flight Delay
* Vendor Cancellation

---

# 5. Guest Service Center

Central workspace for concierge staff.

Displays:

* Current In-House Guests
* VIP Guests
* Arrival Guests
* Departure Guests
* Open Requests
* Service Queue
* Upcoming Activities

---

# 6. Guest Profiles

Integrated with PMS and CRM.

Includes:

* Stay History
* Loyalty Status
* Preferences
* Languages
* Dietary Preferences
* Allergies
* Favorite Activities
* Transportation Preferences
* Special Dates
* Previous Concierge Requests

---

# 7. Guest Requests

## Categories

* Information Request
* Transportation
* Restaurant Booking
* Tour Booking
* Ticket Purchase
* Shopping Assistance
* Medical Assistance
* Childcare
* Business Services
* Courier Services
* Special Celebration
* Lost Property Assistance

## Workflow

* Requested
* Assigned
* In Progress
* Waiting
* Completed
* Cancelled

---

# 8. Concierge Desk

Daily operations include:

* Guest Assistance
* Local Information
* Reservation Management
* City Guidance
* Emergency Assistance
* Personalized Recommendations

---

# 9. Experience & Activity Booking

Manage reservations for:

* City Tours
* Museum Visits
* Cultural Experiences
* Adventure Activities
* Boat Cruises
* Safari Tours
* Wine Tastings
* Cooking Classes
* Spa Packages
* Golf
* Sports Activities

---

# 10. Restaurant Reservations

Reservations for:

* Hotel Restaurants
* Partner Restaurants
* Fine Dining
* Casual Dining
* Private Dining

Features:

* Availability Check
* Waitlist
* Dietary Requests
* Special Occasion Notes
* Confirmation Tracking

---

# 11. Transportation Coordination

Integrated with Transportation & Fleet Portal.

Services:

* Airport Transfers
* Limousine
* Taxi
* Shuttle
* Car Rental
* Chauffeur
* Private Driver
* Group Transportation

---

# 12. Tour & Excursion Management

Manage:

* Local Tours
* Multi-Day Tours
* Adventure Trips
* Historical Tours
* Wildlife Tours
* Cultural Tours

Functions:

* Booking
* Vendor Assignment
* Ticket Issuance
* Cancellation
* Refunds

---

# 13. Ticketing Services

Issue and manage tickets for:

* Flights
* Museums
* Concerts
* Sports Events
* Theme Parks
* Theaters
* Festivals
* Transportation

---

# 14. Luggage Services

Manage:

* Bell Desk Requests
* Luggage Storage
* Luggage Delivery
* Airport Luggage Assistance
* Luggage Tracking
* Group Luggage

---

# 15. Parcel & Package Management

Track:

* Incoming Packages
* Outgoing Shipments
* Courier Deliveries
* Guest Deliveries
* Lost Packages
* Storage

Workflow:

* Received
* Logged
* Stored
* Guest Notified
* Delivered
* Closed

---

# 16. VIP & Butler Services

Services include:

* VIP Arrival Preparation
* Personalized Welcome
* Butler Requests
* Amenity Coordination
* Executive Transportation
* Private Dining
* Personal Assistant Services

---

# 17. Personal Shopping

Assist guests with:

* Luxury Shopping
* Souvenirs
* Gift Purchases
* Grocery Requests
* Pharmacy Purchases
* Custom Orders

---

# 18. Local Recommendations

Knowledge base for:

* Restaurants
* Cafés
* Attractions
* Museums
* Shopping Centers
* Hospitals
* Banks
* Embassies
* Nightlife
* Religious Sites

---

# 19. Itinerary Planner

Create personalized itineraries.

Includes:

* Activities
* Transportation
* Meal Reservations
* Meeting Schedule
* Free Time
* Maps
* Contact Information

---

# 20. Wake-up & Reminder Services

Manage:

* Wake-up Calls
* Meeting Reminders
* Flight Reminders
* Activity Reminders
* Transportation Alerts

---

# 21. Guest Communication Center

Communication methods:

* SMS
* Email
* Mobile App
* WhatsApp (where supported)
* Push Notifications
* Internal Messaging

---

# 22. External Vendor Management

Manage:

* Tour Operators
* Restaurants
* Taxi Companies
* Airlines
* Car Rental Agencies
* Medical Providers
* Entertainment Providers

Functions:

* Contracts
* Contact Directory
* Pricing
* Availability
* Performance Ratings

---

# 23. Billing & Charges

Integrated with Finance and PMS.

Charge Types:

* Guest Folio
* Cash
* Credit Card
* Corporate Account
* Complimentary
* Third-Party Billing

Track:

* Deposits
* Vendor Charges
* Commission
* Service Fees
* Refunds

---

# 24. Reports

## Concierge Reports

* Daily Concierge Activity
* Guest Requests
* Service Completion
* VIP Services
* Wake-up Services

## Reservation Reports

* Restaurant Bookings
* Tour Bookings
* Transportation Bookings
* Ticket Sales

## Financial Reports

* Concierge Revenue
* Vendor Commission
* Guest Charges
* Complimentary Services

## Performance Reports

* Response Time
* Guest Satisfaction
* Staff Productivity
* Vendor Performance

---

# 25. Configuration

## Service Setup

* Service Categories
* Priority Levels
* SLA Rules
* Request Templates

## Vendor Setup

* Vendor Directory
* Pricing
* Service Areas
* Commission Rules

## Communication Setup

* Notification Templates
* Reminder Rules
* Guest Preferences

---

# 26. Portal Integrations

| Portal                            | Integration                                                        |
| --------------------------------- | ------------------------------------------------------------------ |
| Front Office (PMS)                | Guest Profiles, Reservations, In-House Guests, Guest Folio Posting |
| Sales, Marketing & CRM            | VIP Guests, Loyalty Information, Guest Preferences                 |
| Transportation & Fleet            | Airport Transfers, Vehicle Booking, Driver Assignment              |
| Banquet & Events                  | Event Guests, Meeting Attendees, VIP Coordination                  |
| Food & Beverage                   | Restaurant Reservations, Dining Preferences                        |
| Spa & Wellness                    | Spa Bookings, Wellness Packages                                    |
| Housekeeping                      | Special Room Requests, Amenities, Luggage Delivery                 |
| Security & Risk                   | VIP Protection, Lost Property, Emergency Assistance                |
| Finance & Accounting              | Billing, Payments, Vendor Settlements                              |
| Hotel Operations                  | Guest Escalations, Service Recovery, VIP Coordination              |
| Executive & Business Intelligence | Guest Service Analytics, Satisfaction KPIs                         |
| System Administration             | Users, Roles, Workflow Engine, Audit Logs                          |

---

# 27. Ownership Boundaries

## Owned by Concierge Portal

* Guest Requests
* Concierge Services
* Experience Booking
* Local Recommendations
* Restaurant Reservations
* Tour Coordination
* Ticketing
* Luggage Services
* Parcel Management
* VIP & Butler Coordination
* Itinerary Planning
* External Vendor Coordination

## Integrated (Not Owned)

* Reservations
* Guest Check-in/Check-out
* Transportation Operations
* Financial Accounting
* Event Operations
* Housekeeping Operations
* Security Operations
* User Administration

---

# 28. User Roles

## Concierge Team

* Chief Concierge
* Concierge
* Assistant Concierge
* Guest Relations Officer

## Bell Services

* Bell Captain
* Bell Attendant
* Porter

## Guest Services

* Butler
* VIP Services Coordinator
* Guest Experience Manager

## Management

* Front Office Manager
* Rooms Division Manager
* Hotel Operations Manager

---

# 29. Design Principles

* Guest-centric service management
* Personalized guest experiences
* Real-time request tracking
* Seamless department coordination
* Integrated external vendor management
* Mobile concierge capabilities
* Automated guest notifications
* Personalized itinerary generation
* Role-based access control (RBAC)
* Complete audit trail
* Multi-property support
* Multi-language support
* API-first integration
* Cloud-native architecture
* Scalable for hotels, resorts, and luxury hospitality brands

---

# 30. Concierge Service Responsibility Matrix

| Service                 | Primary Owner    | Supporting Portals             |
| ----------------------- | ---------------- | ------------------------------ |
| Guest Information       | Concierge        | Front Office                   |
| Restaurant Reservations | Concierge        | Food & Beverage                |
| Airport Transfers       | Concierge        | Transportation & Fleet         |
| Tour Reservations       | Concierge        | External Vendors               |
| Ticket Booking          | Concierge        | Finance                        |
| Luggage Services        | Concierge        | Front Office, Housekeeping     |
| Parcel Delivery         | Concierge        | Security, Front Office         |
| VIP Coordination        | Concierge        | Hotel Operations, Front Office |
| Butler Services         | Concierge        | Housekeeping, F&B              |
| Guest Billing           | PMS / Finance    | Concierge                      |
| Guest Service Recovery  | Hotel Operations | Concierge                      |

---

# 31. Future Enhancements

* AI-powered itinerary recommendations
* Digital concierge chatbot
* Mobile guest self-service portal
* QR code destination guides
* Real-time translation assistance
* Integration with airline and railway APIs
* Smart recommendation engine based on guest preferences
* Digital city guide with offline maps
* Voice assistant integration

---

**End of Document**
