# Unified Public Booking Portal Architecture

> **Version:** 1.0
> **Portal:** Public Booking Portal (Website & Booking Engine)
> **Architecture Style:** Unified Hotel ERP Portal
> **Purpose:** Public-facing digital storefront for reservations, packages, events, dining, wellness, and guest acquisition.

---

# 1. Overview

The **Public Booking Portal** is the hotel's public-facing website and booking engine. It is designed for **prospective guests, corporate clients, travel agents, event organizers, restaurant customers, and spa customers**.

Unlike the **Guest Portal**, which is used by confirmed guests before, during, and after their stay, the **Public Booking Portal** is focused on **discovering the hotel, searching availability, making reservations, submitting inquiries, and converting visitors into customers.**

The portal is tightly integrated with Revenue Management, PMS, CRM, Banquet & Events, Spa, Concierge, and Transportation while remaining completely separate from internal hotel operations.

---

# 2. Customer Journey

```text
Visitor
    │
    ▼
Browse Website
    │
    ▼
Search Services
    │
    ▼
Compare Options
    │
    ▼
Reservation / Inquiry
    │
    ▼
Secure Payment
    │
    ▼
Confirmation
    │
    ▼
Guest Portal Activation
```

---

# 3. Portal Modules

```text
Public Booking Portal
│
├── Home
├── Property Directory
├── Room Booking Engine
├── Packages & Promotions
├── Meetings & Events
├── Wedding Booking
├── Restaurant Reservations
├── Spa & Wellness Booking
├── Experiences & Activities
├── Transportation Booking
├── Gift Cards
├── Loyalty Enrollment
├── Corporate & Travel Partners
├── Destination Guide
├── Gallery
├── Reviews & Testimonials
├── Special Offers
├── Guest Account
├── Secure Payments
├── Contact & Live Chat
├── Support Center
└── Content Management
```

---

# 4. Home

Display:

* Hero Banner
* Featured Offers
* Booking Widget
* Promotions
* Featured Rooms
* Restaurants
* Spa
* Meetings
* Weddings
* Experiences
* Testimonials
* Location Map

---

# 5. Property Directory

Support:

* Single Property
* Multi-property Group
* Resorts
* Apartments
* Villas

Information:

* Overview
* Facilities
* Amenities
* Awards
* Ratings
* Contact Details

---

# 6. Room Booking Engine

Search Criteria

* Destination
* Hotel
* Arrival
* Departure
* Adults
* Children
* Promo Code
* Corporate Code
* Group Code

Results

* Room Types
* Photos
* Amenities
* Occupancy
* Policies
* Dynamic Pricing
* Available Packages

Functions

* Compare Rooms
* Upgrade Suggestions
* Flexible Dates
* Rate Comparison

---

# 7. Packages & Promotions

Examples

* Bed & Breakfast
* Half Board
* Full Board
* Honeymoon
* Family Vacation
* Stay Longer Save More
* Weekend Escape
* Business Traveler
* Wellness Retreat
* Golf Package

---

# 8. Meetings & Events

Submit inquiries for

* Conferences
* Meetings
* Seminars
* Exhibitions
* Corporate Events

Display

* Venue Capacity
* Floor Plans
* Packages
* Catering Options
* Equipment
* Gallery

---

# 9. Wedding Booking

Features

* Wedding Packages
* Ceremony Venues
* Reception Venues
* Bridal Suite
* Sample Menus
* Decoration Packages
* Photo Gallery
* Wedding Inquiry Form

---

# 10. Restaurant Reservations

Browse

* Restaurants
* Menus
* Opening Hours
* Dress Code

Functions

* Reserve Table
* Special Requests
* Group Dining
* Private Dining
* Celebration Packages

---

# 11. Spa & Wellness Booking

Book

* Massage
* Facial
* Salon
* Gym Sessions
* Wellness Packages

Display

* Therapists
* Treatments
* Duration
* Pricing
* Availability

---

# 12. Experiences & Activities

Browse

* Tours
* Local Experiences
* Adventure Activities
* Cultural Tours
* Family Activities
* Sports
* Excursions

---

# 13. Transportation Booking

Book

* Airport Pickup
* Airport Drop-off
* Limousine
* Shuttle
* Chauffeur

Display

* Vehicle Types
* Pricing
* Capacity

---

# 14. Gift Cards

Purchase

* Hotel Stay
* Dining
* Spa
* Wellness
* Experience
* Monetary Gift Card

---

# 15. Loyalty Enrollment

Functions

* Join Loyalty Program
* Membership Benefits
* Reward Calculator
* Member Offers

---

# 16. Corporate & Travel Partners

Support

* Corporate Accounts
* Travel Agencies
* Tour Operators
* Event Planners
* Government Accounts

Functions

* Corporate Inquiry
* Contract Request
* Preferred Rates

---

# 17. Destination Guide

Information

* Attractions
* Restaurants
* Shopping
* Culture
* Museums
* Hospitals
* Transportation
* Weather
* Visa Information

---

# 18. Gallery

Display

* Rooms
* Restaurants
* Spa
* Pool
* Meeting Rooms
* Weddings
* Events
* Facilities
* 360° Tours
* Videos

---

# 19. Reviews & Testimonials

Display

* Verified Reviews
* Guest Stories
* Awards
* Ratings

---

# 20. Special Offers

Examples

* Flash Sales
* Early Bird
* Last Minute
* Seasonal Offers
* Loyalty Promotions

---

# 21. Guest Account

Functions

* Sign Up
* Login
* View Reservations
* Saved Searches
* Wishlist
* Payment Methods

After confirmation, guests are redirected to the **Guest Portal** for pre-arrival and in-stay services.

---

# 22. Secure Payments

Payment Methods

* Credit/Debit Cards
* Mobile Wallets
* Bank Transfer
* Gift Cards
* Loyalty Points

Functions

* Deposits
* Partial Payments
* Multi-Currency
* Refund Requests

---

# 23. Contact & Live Chat

Support

* Contact Form
* Live Chat
* AI Chatbot
* WhatsApp
* Email
* Telephone

---

# 24. Support Center

Includes

* FAQs
* Cancellation Policies
* Privacy Policy
* Terms & Conditions
* Accessibility Information

---

# 25. Content Management

Marketing team can manage

* Pages
* Images
* Videos
* Promotions
* News
* Blog
* SEO
* Landing Pages

---

# 26. Reports

## Booking Reports

* Website Reservations
* Conversion Rate
* Booking Abandonment
* Revenue by Channel
* Package Sales

## Marketing Reports

* Traffic
* Campaign Performance
* Lead Generation
* Source Analysis

## Event Reports

* Meeting Inquiries
* Wedding Leads
* Corporate Requests

## Restaurant Reports

* Reservation Trends
* Popular Time Slots

## Spa Reports

* Online Bookings
* Package Sales

---

# 27. Portal Integrations

| Portal                            | Integration                                                      |
| --------------------------------- | ---------------------------------------------------------------- |
| Front Office (PMS)                | Availability, Reservations, Room Inventory, Booking Confirmation |
| Revenue Management                | Dynamic Pricing, Restrictions, Availability, Promotions          |
| Sales, Marketing & CRM            | Lead Management, Customer Profiles, Campaigns, Loyalty           |
| Banquet & Events                  | Meeting and Wedding Inquiries, Venue Availability                |
| Food & Beverage                   | Restaurant Availability and Reservations                         |
| Spa & Wellness                    | Treatments, Therapist Availability, Online Booking               |
| Concierge                         | Tours, Experiences, Local Activities                             |
| Transportation & Fleet            | Airport Transfer Reservations                                    |
| Finance & Accounting              | Online Payments, Deposits, Refunds                               |
| Guest Portal                      | Guest Account Activation, Pre-arrival Services                   |
| Executive & Business Intelligence | Website Analytics, Booking KPIs                                  |
| System Administration             | Identity, Security, API Gateway, Audit Logs                      |

---

# 28. Ownership Boundaries

## Owned by Public Booking Portal

* Public Website
* Online Booking Engine
* Public Content
* Promotions Display
* Marketing Landing Pages
* Public Inquiries
* Online Payments
* Guest Account Registration
* Gift Card Sales

## Integrated (Not Owned)

* Reservation Management
* Room Inventory
* Revenue Optimization
* Guest Profiles
* Loyalty Administration
* Event Operations
* Restaurant Operations
* Spa Operations
* Financial Accounting

---

# 29. User Roles

## Public Users

* Anonymous Visitor
* Registered Customer
* Returning Guest
* Loyalty Member
* Corporate Client
* Event Organizer
* Wedding Planner
* Travel Agent

## Internal Users

* Marketing Team
* Revenue Team
* Reservations Team
* Sales Team
* Web Content Manager

---

# 30. Design Principles

* Mobile-first responsive design
* High-conversion booking experience
* Integrated booking engine
* Multi-property support
* Multi-language support
* Multi-currency support
* Dynamic pricing integration
* SEO-optimized content
* Accessibility (WCAG compliant)
* Secure online payments
* AI-powered search and recommendations
* Role-based access control (RBAC)
* API-first architecture
* Cloud-native deployment
* CDN-backed global performance

---

# 31. Booking Flow Matrix

| Service                   | Primary Portal        | Operational Owner                 |
| ------------------------- | --------------------- | --------------------------------- |
| Hotel Room Booking        | Public Booking Portal | Front Office (PMS)                |
| Package Booking           | Public Booking Portal | Front Office / Revenue Management |
| Restaurant Reservation    | Public Booking Portal | Food & Beverage                   |
| Spa Reservation           | Public Booking Portal | Spa & Wellness                    |
| Meeting Inquiry           | Public Booking Portal | Banquet & Events / Sales & CRM    |
| Wedding Inquiry           | Public Booking Portal | Banquet & Events / Sales & CRM    |
| Airport Transfer Booking  | Public Booking Portal | Transportation & Fleet            |
| Tour & Experience Booking | Public Booking Portal | Concierge                         |
| Gift Card Purchase        | Public Booking Portal | Finance & Accounting              |
| Loyalty Registration      | Public Booking Portal | Sales, Marketing & CRM            |

---

# 32. Public vs Guest Portal

| Feature                  | Public Booking Portal     | Guest Portal           |
| ------------------------ | ------------------------- | ---------------------- |
| Browse Hotel Information | ✓                         | Limited                |
| Search Availability      | ✓                         | ✓                      |
| Make New Reservation     | ✓                         | ✓                      |
| Promotional Offers       | ✓                         | Personalized           |
| Online Payment           | ✓                         | ✓                      |
| Digital Check-in         | ✗                         | ✓                      |
| Digital Room Key         | ✗                         | ✓                      |
| Room Service             | ✗                         | ✓                      |
| Housekeeping Requests    | ✗                         | ✓                      |
| Maintenance Requests     | ✗                         | ✓                      |
| Guest Messaging          | Limited                   | ✓                      |
| Folio & Billing          | Reservation Payments Only | Full Folio             |
| In-Stay Services         | ✗                         | ✓                      |
| Digital Check-out        | ✗                         | ✓                      |
| Loyalty Dashboard        | Enrollment                | Full Member Management |

---

# 33. Recommended Technology Components

```text
Public Website (CMS)
        │
        ▼
Booking Engine
        │
        ▼
API Gateway
        │
 ┌──────┼──────────────────────────┐
 ▼      ▼          ▼               ▼
PMS   Revenue   CRM        Payment Gateway
        │
        ▼
Guest Portal (Post-Booking)
```

---

**End of Document**
