# Unified Spa & Wellness Portal Architecture

> **Version:** 1.0
> **Portal:** Spa & Wellness Management
> **Architecture Style:** Unified Hotel ERP Portal
> **Purpose:** Spa Operations, Wellness Services, Appointments, Therapists, Fitness, Memberships, Retail, and Guest Wellness Management

---

# 1. Overview

The **Unified Spa & Wellness Portal** manages the complete operation of hotel spas, wellness centers, fitness clubs, beauty salons, thermal facilities, and wellness programs.

The portal supports appointment scheduling, therapist management, treatment rooms, wellness packages, memberships, retail sales, inventory consumption, guest wellness profiles, billing, and performance analytics.

It integrates with the Front Office (PMS), Guest Portal, Food & Beverage, Concierge, Finance, Inventory, Human Resources, Sales & CRM, Hotel Operations, and Executive & Business Intelligence portals.

---

# 2. Wellness Service Lifecycle

```text id="spaflow01"
Reservation
      │
      ▼
Availability Check
      │
      ▼
Appointment Booking
      │
      ▼
Therapist Assignment
      │
      ▼
Treatment Preparation
      │
      ▼
Service Delivery
      │
      ▼
Retail Recommendation
      │
      ▼
Billing
      │
      ▼
Guest Feedback
```

---

# 3. Portal Modules

```text id="spamod01"
Spa & Wellness Portal
│
├── Executive Dashboard
├── Appointment Management
├── Treatment Catalog
├── Therapist Management
├── Treatment Rooms
├── Guest Wellness Profiles
├── Wellness Programs
├── Membership Management
├── Fitness Center
├── Beauty Salon
├── Thermal & Hydro Facilities
├── Wellness Packages
├── Retail Shop
├── Inventory Consumption
├── Gift Cards & Vouchers
├── Billing & Payments
├── Communication Center
├── Reports
└── Configuration
```

---

# 4. Executive Dashboard

## Operational KPIs

* Today's Appointments
* Active Treatments
* Therapist Utilization
* Treatment Room Occupancy
* Membership Count
* Retail Revenue
* Spa Revenue
* Guest Satisfaction
* Average Treatment Value
* Cancellation Rate

## Alerts

* Therapist Unavailable
* Appointment Conflict
* Low Inventory
* Membership Expiry
* Equipment Maintenance Due
* VIP Appointment
* Package Expiry

---

# 5. Appointment Management

## Appointment Sources

* Guest Portal
* Front Desk
* Concierge
* Reception
* Telephone
* Walk-in
* Corporate Booking

## Appointment Status

* Requested
* Confirmed
* Checked In
* In Treatment
* Completed
* Cancelled
* No Show
* Rescheduled

---

# 6. Treatment Catalog

## Categories

### Massage

* Swedish
* Deep Tissue
* Hot Stone
* Aromatherapy
* Sports Massage
* Thai Massage
* Reflexology

### Facial Treatments

* Hydrating Facial
* Anti-Aging
* Acne Treatment
* Brightening
* Men's Facial

### Body Treatments

* Body Scrub
* Body Wrap
* Detox Therapy
* Cellulite Treatment

### Beauty Services

* Haircut
* Hair Styling
* Hair Coloring
* Manicure
* Pedicure
* Makeup

### Wellness

* Yoga
* Meditation
* Breathing Sessions
* Wellness Coaching
* Nutrition Consultation

---

# 7. Therapist Management

## Therapist Profile

* Personal Information
* Certifications
* Licenses
* Skills
* Languages
* Employment Status

## Scheduling

* Working Hours
* Leave Calendar
* Daily Schedule
* Therapist Availability
* Utilization

## Performance

* Revenue Generated
* Guest Ratings
* Appointment Completion
* Productivity

---

# 8. Treatment Rooms

## Room Types

* Massage Room
* Couples Room
* Facial Room
* Hydrotherapy Room
* Salon Station
* Consultation Room
* Yoga Studio

Functions:

* Availability
* Scheduling
* Maintenance Status
* Equipment Assignment

---

# 9. Guest Wellness Profiles

Store:

* Wellness Goals
* Medical Notes
* Allergies
* Skin Type
* Treatment Preferences
* Contraindications
* Previous Treatments
* Favorite Therapist

---

# 10. Wellness Programs

Programs include:

* Weight Management
* Detox Program
* Stress Relief
* Fitness Transformation
* Corporate Wellness
* Holistic Wellness
* Senior Wellness

Track:

* Progress
* Milestones
* Attendance
* Results

---

# 11. Membership Management

Membership Types

* Monthly
* Quarterly
* Annual
* Family
* Corporate
* VIP

Functions

* Membership Registration
* Renewal
* Freeze Membership
* Upgrade
* Attendance Tracking
* Benefit Management

---

# 12. Fitness Center

Manage:

* Gym Access
* Personal Trainers
* Group Classes
* Equipment Booking
* Fitness Assessments
* Workout Plans

Track:

* Attendance
* Equipment Usage
* Trainer Schedule

---

# 13. Beauty Salon

Services:

* Hair Services
* Nail Services
* Makeup
* Barber Services
* Bridal Packages

Functions:

* Appointment Booking
* Stylist Assignment
* Product Usage

---

# 14. Thermal & Hydro Facilities

Facilities:

* Sauna
* Steam Room
* Jacuzzi
* Hydrotherapy Pool
* Cold Plunge
* Relaxation Lounge

Track:

* Capacity
* Cleaning Schedule
* Maintenance
* Usage Statistics

---

# 15. Wellness Packages

Examples:

* Couples Retreat
* Weekend Spa Package
* Honeymoon Package
* Bridal Package
* Executive Wellness
* Family Wellness

Support:

* Bundled Pricing
* Validity Period
* Multi-Visit Packages

---

# 16. Retail Shop

Products:

* Skincare
* Haircare
* Massage Oils
* Supplements
* Wellness Products
* Gift Items

Functions:

* POS Integration
* Inventory
* Promotions
* Product Recommendations

---

# 17. Inventory Consumption

Integrated with Inventory Management.

Track:

* Massage Oils
* Towels
* Robes
* Beauty Products
* Consumables
* Cleaning Supplies

Automatically deduct inventory during service delivery.

---

# 18. Gift Cards & Vouchers

Support:

* Spa Gift Cards
* Treatment Vouchers
* Promotional Coupons
* Membership Credits

Functions:

* Issue
* Redemption
* Expiry Tracking

---

# 19. Billing & Payments

Integrated with Finance and PMS.

Payment Methods:

* Guest Folio
* Credit/Debit Card
* Mobile Wallet
* Cash
* Corporate Billing
* Gift Voucher
* Membership Credit

Track:

* Revenue
* Taxes
* Service Charges
* Tips

---

# 20. Communication Center

Communicate through:

* SMS
* Email
* Mobile Push Notifications
* Appointment Reminders
* Wellness Tips
* Promotional Campaigns

---

# 21. Reports

## Operational Reports

* Daily Appointment Report
* Therapist Schedule
* Room Utilization
* Attendance Report
* Cancellation Report

## Financial Reports

* Spa Revenue
* Retail Revenue
* Membership Revenue
* Package Revenue
* Product Sales

## Inventory Reports

* Product Consumption
* Low Stock
* Retail Stock
* Inventory Valuation

## Performance Reports

* Therapist Productivity
* Guest Satisfaction
* Popular Treatments
* Treatment Trends

## Executive Reports

* Monthly Performance
* Revenue by Service
* Occupancy
* Membership Growth
* Profitability Analysis

---

# 22. Configuration

## Treatment Setup

* Service Categories
* Treatment Duration
* Pricing
* Therapist Qualifications

## Membership Setup

* Membership Types
* Benefits
* Renewal Rules
* Pricing

## Facility Setup

* Treatment Rooms
* Fitness Areas
* Thermal Facilities
* Equipment

---

# 23. Portal Integrations

| Portal                            | Integration                                                |
| --------------------------------- | ---------------------------------------------------------- |
| Front Office (PMS)                | Guest Profiles, In-House Guests, Guest Folio Posting       |
| Guest Portal                      | Appointment Booking, Wellness Programs, Payments           |
| Concierge                         | Spa Reservations, Wellness Recommendations                 |
| Food & Beverage                   | Healthy Dining Packages, Wellness Menus                    |
| Sales, Marketing & CRM            | Membership Campaigns, Loyalty, Promotions                  |
| Finance & Accounting              | Billing, Payments, Revenue, Taxes                          |
| Inventory Management              | Retail Inventory, Product Consumption, Stock Replenishment |
| Procurement                       | Product Purchasing, Supplier Management                    |
| Human Resources & Payroll         | Therapist Records, Scheduling, Payroll                     |
| Engineering & Maintenance         | Equipment Maintenance, Facility Repairs                    |
| Hotel Operations                  | VIP Guests, Service Recovery, Operational Coordination     |
| Executive & Business Intelligence | Revenue Analytics, KPI Dashboards                          |
| System Administration             | Users, Roles, Workflow Engine, Audit Logs                  |

---

# 24. Ownership Boundaries

## Owned by Spa & Wellness Portal

* Appointment Scheduling
* Wellness Programs
* Therapist Management
* Treatment Rooms
* Memberships
* Fitness Operations
* Beauty Salon
* Thermal Facilities
* Retail Operations
* Gift Cards & Vouchers
* Wellness Guest Profiles

## Integrated (Not Owned)

* Guest Reservations
* Financial Accounting
* Inventory Control
* Procurement
* Payroll
* CRM
* User Administration

---

# 25. User Roles

## Spa Operations

* Spa Director
* Spa Manager
* Spa Receptionist
* Spa Coordinator

## Wellness Professionals

* Massage Therapist
* Beauty Therapist
* Esthetician
* Hair Stylist
* Barber
* Personal Trainer
* Yoga Instructor
* Nutrition Consultant

## Management

* Hotel Operations Manager
* Finance Manager
* Human Resources Manager

---

# 26. Design Principles

* Guest-centric wellness journey
* Integrated appointment scheduling
* Therapist skill-based assignment
* Real-time room availability
* Digital wellness profiles
* Automated inventory consumption
* Membership lifecycle management
* Retail and service integration
* Mobile booking support
* Role-based access control (RBAC)
* Complete audit trail
* Multi-property support
* Multi-language and multi-currency support
* API-first integration
* Cloud-native architecture

---

# 27. Wellness Responsibility Matrix

| Activity              | Primary Owner                     | Supporting Portals      |
| --------------------- | --------------------------------- | ----------------------- |
| Appointment Booking   | Spa & Wellness                    | Guest Portal, Concierge |
| Guest Check-in        | Spa & Wellness                    | Front Office (PMS)      |
| Treatment Delivery    | Spa & Wellness                    | -                       |
| Retail Sales          | Spa & Wellness                    | Finance, Inventory      |
| Product Consumption   | Inventory Management              | Spa & Wellness          |
| Membership Sales      | Spa & Wellness                    | Sales & CRM             |
| Wellness Packages     | Spa & Wellness                    | Sales & CRM             |
| Billing               | Finance & Accounting / PMS        | Spa & Wellness          |
| Equipment Maintenance | Engineering & Maintenance         | Spa & Wellness          |
| Executive Analytics   | Executive & Business Intelligence | Spa & Wellness          |

---

# 28. Future Enhancements

* AI-powered wellness recommendations
* Wearable fitness device integration
* Digital health questionnaire
* Personalized wellness dashboards
* Smart treatment room automation
* Online therapist consultation
* Virtual wellness coaching
* Nutrition tracking integration
* AI-based treatment recommendations
* Mobile self check-in for spa appointments

---

**End of Document**
