/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Zod schemas for runtime validation of Transportation Portal entities.
 * These validate the shape of data returned from the database.
 */

import { z } from 'zod';

// ============================================================================
// TRANSPORTATION REQUEST
// ============================================================================

export const transportationRequestSchema = z.object({
  id: z.string(),
  requestNumber: z.string(),
  guest: z.string(),
  room: z.string().optional(),
  type: z.enum(['Airport Pickup', 'Airport Drop-off', 'City Transfer', 'Hotel Shuttle', 'Sightseeing Tour', 'VIP Transport', 'Staff Shuttle', 'Courier Service']),
  source: z.enum(['Front Office', 'Concierge', 'Guest Mobile App', 'Website', 'Reservation System', 'Corporate Account', 'Events & Banquets', 'Staff Portal']),
  pickupLocation: z.string(),
  destination: z.string(),
  scheduledTime: z.string(),
  passengerCount: z.number().int().positive(),
  luggageCount: z.number().int().nonnegative(),
  status: z.enum(['Requested', 'Confirmed', 'Assigned', 'Driver En Route', 'Guest Picked Up', 'In Progress', 'Completed', 'Cancelled', 'No Show']),
  priority: z.enum(['Critical', 'High', 'Normal', 'Low']),
  specialInstructions: z.string().optional(),
  assignedVehicle: z.string().optional(),
  assignedDriver: z.string().optional(),
  estimatedDuration: z.string().optional(),
  estimatedDistance: z.number().optional(),
  actualDuration: z.string().optional(),
  actualDistance: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TransportationRequestEntity = z.infer<typeof transportationRequestSchema>;

// ============================================================================
// TRIP
// ============================================================================

export const tripSchema = z.object({
  id: z.string(),
  tripNumber: z.string(),
  guest: z.string(),
  room: z.string().optional(),
  type: z.enum(['Airport Pickup', 'Airport Drop-off', 'City Transfer', 'Hotel Shuttle', 'Sightseeing Tour', 'VIP Transport', 'Staff Shuttle', 'Courier Service']),
  vehicle: z.string(),
  driver: z.string(),
  pickupLocation: z.string(),
  destination: z.string(),
  scheduledStartTime: z.string(),
  actualStartTime: z.string().optional(),
  actualEndTime: z.string().optional(),
  estimatedDuration: z.string(),
  actualDuration: z.string().optional(),
  estimatedDistance: z.number(),
  actualDistance: z.number().optional(),
  passengerCount: z.number().int().positive(),
  luggageCount: z.number().int().nonnegative(),
  status: z.enum(['Requested', 'Confirmed', 'Assigned', 'Driver En Route', 'Guest Picked Up', 'In Progress', 'Completed', 'Cancelled', 'No Show']),
  amount: z.number().nonnegative(),
  paymentMethod: z.enum(['Guest Folio', 'Corporate Billing', 'Event Billing', 'Cash Payment', 'Credit Card', 'Complimentary', 'Internal Department Charge']),
  specialInstructions: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TripEntity = z.infer<typeof tripSchema>;

// ============================================================================
// AIRPORT TRANSFER
// ============================================================================

export const airportTransferSchema = z.object({
  id: z.string(),
  transferNumber: z.string(),
  guest: z.string(),
  room: z.string().optional(),
  type: z.enum(['Arrival Pickup', 'Departure Drop-off', 'Meet & Greet', 'VIP Pickup', 'Group Transfer', 'Executive Transfer']),
  service: z.enum(['Standard', 'VIP Meet & Greet', 'Group', 'Executive']),
  flightNumber: z.string(),
  airline: z.string(),
  terminal: z.string(),
  scheduledTime: z.string(),
  estimatedLanding: z.string().optional(),
  actualLanding: z.string().optional(),
  flightStatus: z.enum(['Scheduled', 'In Flight', 'Landed', 'Delayed', 'Cancelled', 'Diverted']),
  delay: z.string().optional(),
  driver: z.string().optional(),
  vehicle: z.string().optional(),
  pickupLocation: z.string(),
  destination: z.string(),
  status: z.enum(['Requested', 'Confirmed', 'Assigned', 'Driver En Route', 'Guest Picked Up', 'In Progress', 'Completed', 'Cancelled', 'No Show']),
  meetGreet: z.boolean(),
  passengerCount: z.number().int().positive(),
  luggageCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AirportTransferEntity = z.infer<typeof airportTransferSchema>;

// ============================================================================
// SHUTTLE
// ============================================================================

export const shuttleSchema = z.object({
  id: z.string(),
  shuttleNumber: z.string(),
  name: z.string(),
  type: z.enum(['Scheduled Route', 'Demand-Based', 'Special Event']),
  route: z.string(),
  stops: z.array(z.string()),
  schedule: z.string(),
  frequency: z.enum(['Fixed', 'On-Demand', 'Event']),
  vehicle: z.string(),
  driver: z.string(),
  capacity: z.number().int().positive(),
  currentOccupancy: z.number().int().nonnegative(),
  status: z.enum(['Active', 'Standby', 'In Transit', 'Scheduled', 'Maintenance']),
  department: z.string().optional(),
  nextDeparture: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ShuttleEntity = z.infer<typeof shuttleSchema>;

// ============================================================================
// VEHICLE
// ============================================================================

export const vehicleSchema = z.object({
  id: z.string(),
  vehicleNumber: z.string(),
  registrationNumber: z.string(),
  vin: z.string(),
  make: z.string(),
  model: z.string(),
  year: z.number().int(),
  color: z.string(),
  category: z.enum(['Sedan', 'SUV', 'Van', 'Minibus', 'Luxury', 'Shuttle Bus', 'Utility Vehicle', 'Motorcycle', 'Electric Vehicle']),
  capacity: z.number().int().positive(),
  fuelType: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  insuranceProvider: z.string(),
  insurancePolicy: z.string(),
  insuranceExpiry: z.string(),
  registrationExpiry: z.string(),
  status: z.enum(['Active', 'In Use', 'Maintenance', 'Out of Service', 'Retired', 'Sold']),
  purchaseDate: z.string(),
  purchasePrice: z.number().nonnegative(),
  currentValue: z.number().nonnegative(),
  mileage: z.number().nonnegative(),
  lastService: z.string(),
  nextService: z.string(),
  assignedDriver: z.string().optional(),
  currentLocation: z.string(),
  fuelLevel: z.number().int().min(0).max(100),
  utilization: z.number().int().min(0).max(100),
  condition: z.enum(['Excellent', 'Good', 'Fair', 'Service Required']),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type VehicleEntity = z.infer<typeof vehicleSchema>;

// ============================================================================
// DRIVER
// ============================================================================

export const driverSchema = z.object({
  id: z.string(),
  driverNumber: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  employeeId: z.string(),
  licenseNumber: z.string(),
  licenseCategory: z.enum(['Class C', 'Class B', 'Class A', 'Motorcycle', 'Commercial']),
  licenseExpiry: z.string(),
  certifications: z.array(z.string()),
  medicalCertificate: z.string(),
  employmentStatus: z.enum(['Active', 'On Leave', 'Suspended', 'Inactive']),
  assignedVehicle: z.string().optional(),
  shift: z.enum(['Morning', 'Afternoon', 'Night', 'Flexible', 'On Call']),
  phone: z.string(),
  email: z.string(),
  hireDate: z.string(),
  performance: z.number().int().min(0).max(100),
  incidents: z.number().int().nonnegative(),
  totalTrips: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type DriverEntity = z.infer<typeof driverSchema>;

// ============================================================================
// ROUTE
// ============================================================================

export const routeSchema = z.object({
  id: z.string(),
  routeNumber: z.string(),
  name: z.string(),
  type: z.enum(['Standard Route', 'Dynamic Route', 'Express Route']),
  category: z.enum(['Airport Transfer', 'City Transfer', 'Corporate Transfer', 'Tour Transportation', 'Staff Transportation']),
  startPoint: z.string(),
  endPoint: z.string(),
  distance: z.number().nonnegative(),
  estimatedTime: z.number().int().positive(),
  tollCost: z.number().nonnegative(),
  fuelCost: z.number().nonnegative(),
  status: z.enum(['Active', 'Inactive', 'Seasonal']),
  frequentStops: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type RouteEntity = z.infer<typeof routeSchema>;

// ============================================================================
// FUEL PURCHASE
// ============================================================================

export const fuelPurchaseSchema = z.object({
  id: z.string(),
  purchaseNumber: z.string(),
  date: z.string(),
  vehicle: z.string(),
  driver: z.string(),
  station: z.string(),
  fuelType: z.enum(['Gasoline', 'Diesel', 'Electric', 'Hybrid']),
  gallons: z.number().nonnegative(),
  pricePerGallon: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
  odometer: z.number().nonnegative(),
  fuelCard: z.string(),
  efficiency: z.number().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type FuelPurchaseEntity = z.infer<typeof fuelPurchaseSchema>;

// ============================================================================
// FUEL CARD
// ============================================================================

export const fuelCardSchema = z.object({
  id: z.string(),
  cardNumber: z.string(),
  type: z.string(),
  status: z.enum(['Active', 'Blocked', 'Expired', 'Lost']),
  limit: z.number().nonnegative(),
  balance: z.number().nonnegative(),
  assignedVehicle: z.string().optional(),
  expiryDate: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type FuelCardEntity = z.infer<typeof fuelCardSchema>;

// ============================================================================
// MAINTENANCE REQUEST
// ============================================================================

export const maintenanceRequestSchema = z.object({
  id: z.string(),
  requestNumber: z.string(),
  vehicle: z.string(),
  vehicleName: z.string(),
  type: z.enum(['Preventive Maintenance', 'Breakdown Repair', 'Inspection', 'Emergency Repair']),
  priority: z.enum(['High', 'Normal', 'Low']),
  description: z.string(),
  status: z.enum(['Pending', 'In Progress', 'Scheduled', 'Completed', 'Cancelled']),
  requestedDate: z.string(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
  estimatedCost: z.number().nonnegative(),
  actualCost: z.number().nonnegative().optional(),
  vendor: z.string(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type MaintenanceRequestEntity = z.infer<typeof maintenanceRequestSchema>;

// ============================================================================
// CONTRACTOR
// ============================================================================

export const contractorSchema = z.object({
  id: z.string(),
  contractorNumber: z.string(),
  name: z.string(),
  type: z.enum(['Taxi Company', 'Chauffeur Service', 'Bus Operator', 'Tour Operator']),
  contact: z.string(),
  phone: z.string(),
  email: z.string(),
  status: z.enum(['Active', 'Pending', 'Inactive']),
  contractStart: z.string(),
  contractEnd: z.string(),
  rateStructure: z.enum(['Per Mile', 'Hourly', 'Per Trip', 'Package']),
  baseRate: z.number().nonnegative(),
  perMileRate: z.number().nonnegative(),
  performance: z.number().int().min(0).max(5),
  totalTrips: z.number().int().nonnegative(),
  onTimeRate: z.number().int().min(0).max(100),
  rating: z.number().int().min(0).max(5),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ContractorEntity = z.infer<typeof contractorSchema>;

// ============================================================================
// BILLING CHARGE
// ============================================================================

export const billingChargeSchema = z.object({
  id: z.string(),
  chargeNumber: z.string(),
  tripId: z.string(),
  guest: z.string(),
  room: z.string().optional(),
  type: z.string(),
  billingType: z.enum(['Guest Folio', 'Corporate Account', 'Event Master Account', 'Internal Cost Center']),
  amount: z.number().nonnegative(),
  status: z.enum(['Pending', 'Posted', 'Failed', 'Refunded']),
  date: z.string(),
  paymentMethod: z.enum(['Room Charge', 'Credit Card', 'Cash', 'Corporate Credit', 'Internal Transfer']),
  reference: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type BillingChargeEntity = z.infer<typeof billingChargeSchema>;

// ============================================================================
// CORPORATE CONTRACT
// ============================================================================

export const corporateContractSchema = z.object({
  id: z.string(),
  contractNumber: z.string(),
  company: z.string(),
  contact: z.string(),
  email: z.string(),
  phone: z.string(),
  type: z.enum(['Executive Transfer', 'Business Meetings', 'Airport Transfers']),
  status: z.enum(['Active', 'Pending', 'Expired', 'Cancelled']),
  startDate: z.string(),
  endDate: z.string(),
  monthlyVolume: z.number().int().nonnegative(),
  rateType: z.enum(['Fixed Rate', 'Distance-Based', 'Time-Based', 'Package Rate']),
  standardRate: z.number().nonnegative(),
  billingCycle: z.enum(['Monthly', 'Weekly', 'Per Trip']),
  creditLimit: z.number().nonnegative(),
  currentBalance: z.number().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CorporateContractEntity = z.infer<typeof corporateContractSchema>;

// ============================================================================
// MESSAGE
// ============================================================================

export const messageSchema = z.object({
  id: z.string(),
  type: z.enum(['Driver Message', 'Guest Notification', 'Dispatch Notification', 'Emergency Alert']),
  from: z.string(),
  to: z.string(),
  subject: z.string(),
  content: z.string(),
  timestamp: z.string(),
  status: z.enum(['Pending', 'Sent', 'Delivered', 'Read', 'Failed']),
  priority: z.enum(['Critical', 'High', 'Normal', 'Low']),
  relatedTrip: z.string().optional(),
  createdAt: z.string(),
});

export type MessageEntity = z.infer<typeof messageSchema>;

// ============================================================================
// REPORT
// ============================================================================

export const reportSchema = z.object({
  id: z.string(),
  reportNumber: z.string(),
  name: z.string(),
  category: z.enum(['Operational', 'Fleet', 'Financial', 'Performance']),
  description: z.string(),
  lastGenerated: z.string(),
  generatedBy: z.string(),
  format: z.enum(['PDF', 'Excel', 'CSV']),
  size: z.string(),
  parameters: z.record(z.any()).optional(),
  createdAt: z.string(),
});

export type ReportEntity = z.infer<typeof reportSchema>;

// ============================================================================
// CONFIGURATION
// ============================================================================

export const transportationConfigSchema = z.object({
  id: z.string(),
  category: z.enum(['Transportation Type', 'Service Area', 'Vehicle Category', 'Fuel Type', 'Driver Group']),
  name: z.string(),
  description: z.string().optional(),
  baseRate: z.number().nonnegative().optional(),
  capacity: z.number().int().positive().optional(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TransportationConfigEntity = z.infer<typeof transportationConfigSchema>;