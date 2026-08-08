# Unified Guest Portal Architecture

> **Version:** 1.0
> **Portal:** Guest Portal (Guest Web Portal & Mobile App)
> **Architecture Style:** Unified Hotel ERP Portal
> **Purpose:** Digital Guest Journey, Self-Service, Communication, Reservations, In-Stay Services, Payments, Loyalty, and Post-Stay Engagement

---

# 1. Overview

The **Unified Guest Portal** is the digital self-service platform for hotel guests, available through a web portal and mobile application. It provides a seamless guest journey from discovery and booking through arrival, in-stay services, checkout, and post-stay engagement.

The Guest Portal **does not own operational hotel data**. Instead, it provides a secure interface to hotel services by consuming data and workflows from the hotel's ERP portals.

It integrates with the Front Office (PMS), Sales & CRM, Concierge, Food & Beverage, Spa, Housekeeping, Transportation, Banquet & Events, Finance, Loyalty, Revenue Management, and Hotel Operations portals.

---

# 2. Digital Guest Journey

```text id="guestflow01"
Discover Hotel
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
Digital Check-in
        │
        ▼
In-Stay Services
        │
        ▼
Payments
        │
        ▼
Digital Check-out
        │
        ▼
Feedback
        │
        ▼
Loyalty & Future Booking
```

---

# 3. Portal Modules

```text id="guestmod01"
Guest Portal
│
├── Home Dashboard
├── Profile & Preferences
├── Reservations
├── Digital Check-in
├── Digital Room Key
├── My Stay
├── Room Service
├── Restaurant Reservations
├── Spa & Wellness
├── Concierge Services
├── Transportation
├── Housekeeping Requests
├── Maintenance Requests
├── Event & Activity Booking
├── Meeting & Banquet Services
├── Loyalty Program
├── Wallet & Payments
├── Billing & Folio
├── Messaging Center
├── Notifications
├── Feedback & Reviews
├── Help Center
└── Settings
```

---

# 4. Home Dashboard

Displays:

* Current Reservation
* Upcoming Stay
* Check-in Countdown
* Room Number
* Stay Progress
* Outstanding Balance
* Loyalty Status
* Weather
* Hotel Announcements
* Personalized Recommendations

Quick Actions:

* Check-in
* Digital Key
* Room Service
* Chat with Hotel
* Request Housekeeping
* Book Restaurant
* Request Transportation
* Check-out

---

# 5. Profile & Preferences

## Personal Information

* Name
* Contact Information
* Nationality
* Preferred Language
* Preferred Currency

## Stay Preferences

* Bed Type
* Pillow Type
* Floor Preference
* Smoking Preference
* Room Temperature
* Dietary Preferences
* Allergies
* Accessibility Needs

---

# 6. Reservations

Functions:

* Search Availability
* Book Rooms
* Modify Reservation
* Cancel Reservation
* View Booking History
* Multi-Room Booking
* Package Selection
* Promotional Offers

Reservation Details:

* Confirmation Number
* Stay Dates
* Guests
* Rate Plan
* Package
* Payment Status

---

# 7. Digital Check-in

Features:

* Online Registration
* Identity Verification
* Passport Upload
* Signature Capture
* Estimated Arrival Time
* Room Preference
* Payment Verification
* Pre-Authorization

Status:

* Pending
* Approved
* Checked In

---

# 8. Digital Room Key

Functions:

* Mobile Key Activation
* Key Sharing (Authorized Guests)
* Room Access History
* Key Expiration
* Lost Device Recovery

---

# 9. My Stay

Displays:

* Room Details
* Current Charges
* Hotel Directory
* Hotel Map
* Daily Schedule
* Weather
* Local Time
* Emergency Contacts

---

# 10. Room Service

Integrated with the Food & Beverage Portal.

Functions:

* Browse Menu
* Custom Orders
* Dietary Filters
* Order Tracking
* Scheduled Delivery
* Order History
* Reorder Previous Meals

---

# 11. Restaurant Reservations

Features:

* Browse Restaurants
* View Menus
* Reserve Tables
* Modify Reservations
* Cancel Reservations
* Special Requests

---

# 12. Spa & Wellness

Book:

* Massage
* Facial
* Gym Sessions
* Sauna
* Steam Room
* Wellness Packages
* Personal Trainer

Features:

* Therapist Selection
* Time Availability
* Package Promotions

---

# 13. Concierge Services

Request:

* Airport Transfer
* Taxi
* Tours
* Restaurant Recommendations
* Tickets
* Shopping Assistance
* Medical Assistance
* Local Information

Track request progress in real time.

---

# 14. Transportation

Integrated with Transportation & Fleet.

Book:

* Airport Pickup
* Airport Drop-off
* Shuttle
* Limousine
* Car Rental
* Chauffeur

Track vehicle location and arrival status.

---

# 15. Housekeeping Requests

Submit requests for:

* Room Cleaning
* Extra Towels
* Extra Pillows
* Baby Cot
* Iron & Ironing Board
* Laundry Pickup
* Linen Change
* Turndown Service

Track request status.

---

# 16. Maintenance Requests

Report issues such as:

* Air Conditioning
* Television
* Lighting
* Plumbing
* Wi-Fi
* Safe
* Electrical Problems
* Furniture Damage

Receive status updates until completion.

---

# 17. Event & Activity Booking

Book:

* Hotel Activities
* Excursions
* Local Tours
* Cooking Classes
* Cultural Experiences
* Sports Activities
* Entertainment

---

# 18. Meeting & Banquet Services

For business and group guests:

* Meeting Room Booking
* Banquet Inquiry
* Conference Packages
* Equipment Requests
* Catering Requests

---

# 19. Loyalty Program

View:

* Membership Tier
* Points Balance
* Earned Points
* Redeemed Points
* Available Rewards
* Member Benefits
* Exclusive Offers

---

# 20. Wallet & Payments

Payment Methods:

* Credit/Debit Cards
* Mobile Wallets
* Bank Transfer
* Corporate Account
* Loyalty Points
* Gift Cards

Functions:

* Save Payment Methods
* Secure Payments
* Payment History

---

# 21. Billing & Folio

Displays:

* Current Folio
* Room Charges
* Restaurant Charges
* Spa Charges
* Transportation Charges
* Laundry Charges
* Taxes
* Service Charges

Functions:

* Download Invoice
* Split Bill
* Pay Outstanding Balance
* Request Billing Review

---

# 22. Messaging Center

Communication with:

* Front Desk
* Concierge
* Housekeeping
* Restaurant
* Spa
* Hotel Operator

Supports:

* Live Chat
* File Sharing
* Photos
* Automated Responses

---

# 23. Notifications

Receive notifications for:

* Reservation Confirmation
* Check-in Ready
* Room Ready
* Order Status
* Transportation Arrival
* Restaurant Reminder
* Spa Reminder
* Checkout Reminder
* Promotions

---

# 24. Feedback & Reviews

Submit:

* Stay Review
* Department Ratings
* Service Feedback
* Complaint
* Compliment
* Improvement Suggestions

Rate:

* Room
* Staff
* Food
* Cleanliness
* Facilities
* Overall Experience

---

# 25. Help Center

Includes:

* Frequently Asked Questions
* Hotel Policies
* Emergency Contacts
* Local Emergency Numbers
* User Guides
* Live Support

---

# 26. Settings

Manage:

* Language
* Currency
* Notification Preferences
* Privacy Settings
* Security
* Two-Factor Authentication
* Connected Devices

---

# 27. Portal Integrations

| Portal                            | Integration                                                     |
| --------------------------------- | --------------------------------------------------------------- |
| Front Office (PMS)                | Reservations, Check-in, Check-out, Room Assignment, Guest Folio |
| Sales, Marketing & CRM            | Guest Profiles, Loyalty, Offers, Marketing Campaigns            |
| Concierge                         | Guest Requests, Tours, Recommendations, Ticketing               |
| Food & Beverage                   | Room Service, Restaurant Reservations, Orders                   |
| Kitchen Management                | Order Status, Special Dietary Requests                          |
| Spa & Wellness                    | Appointments, Packages, Therapist Availability                  |
| Housekeeping                      | Service Requests, Room Status, Laundry                          |
| Engineering & Maintenance         | Maintenance Requests, Status Updates                            |
| Transportation & Fleet            | Airport Transfers, Vehicle Tracking                             |
| Banquet & Events                  | Meeting Rooms, Event Registration                               |
| Finance & Accounting              | Payments, Billing, Invoices                                     |
| Hotel Operations                  | Guest Recovery, Escalations, VIP Coordination                   |
| Revenue Management                | Dynamic Offers, Room Upgrades                                   |
| Executive & Business Intelligence | Guest Experience Analytics                                      |
| System Administration             | Authentication, User Accounts, Security, Audit Logs             |

---

# 28. Ownership Boundaries

## Owned by Guest Portal

* Guest Self-Service Interface
* Digital Guest Journey
* Guest Preferences
* Digital Communication
* Guest Notifications
* Mobile Wallet
* Self-Service Requests
* Feedback Collection

## Integrated (Not Owned)

* Reservations
* Check-in Processing
* Housekeeping Operations
* Food Production
* Financial Accounting
* Transportation Operations
* Event Management
* Loyalty Administration
* User Administration

---

# 29. User Roles

## Guest Users

* Individual Guest
* Family Guest
* Group Guest
* Corporate Guest
* VIP Guest
* Loyalty Member

## Hotel Users

* Guest Relations
* Concierge
* Front Desk
* Customer Support
* Hotel Operations

---

# 30. Design Principles

* Mobile-first experience
* End-to-end digital guest journey
* Self-service by default
* Personalized recommendations
* Real-time service tracking
* Secure online payments
* Digital identity verification
* Contactless check-in and check-out
* Mobile room key integration
* Multi-language support
* Multi-currency support
* Accessibility compliance
* API-first integration
* Cloud-native architecture
* Role-based access control (RBAC)

---

# 31. Guest Journey Responsibility Matrix

| Guest Journey Stage    | Primary Portal            | Supporting Portals                     |
| ---------------------- | ------------------------- | -------------------------------------- |
| Search & Booking       | Guest Portal              | Front Office (PMS), Revenue Management |
| Reservation Management | Front Office (PMS)        | Guest Portal                           |
| Pre-Arrival            | Guest Portal              | Concierge, Transportation              |
| Digital Check-in       | Front Office (PMS)        | Guest Portal                           |
| In-Stay Services       | Guest Portal              | Housekeeping, F&B, Concierge, Spa      |
| Maintenance Requests   | Engineering & Maintenance | Guest Portal                           |
| Dining                 | Food & Beverage           | Guest Portal                           |
| Activities & Tours     | Concierge                 | Guest Portal                           |
| Transportation         | Transportation & Fleet    | Guest Portal                           |
| Billing                | Finance & Accounting      | Front Office (PMS), Guest Portal       |
| Digital Check-out      | Front Office (PMS)        | Guest Portal                           |
| Loyalty & Future Stays | Sales, Marketing & CRM    | Guest Portal                           |

---

# 32. Future Enhancements

* AI-powered virtual concierge
* Voice assistant integration
* Smart room controls (lighting, curtains, HVAC)
* Digital passport verification
* Facial recognition (where legally permitted)
* Wearable device integration
* Smart TV synchronization
* Personalized AI recommendations
* In-app tipping
* Digital city guide with offline navigation

---

**End of Document**
