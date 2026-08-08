/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Zod schemas for runtime validation of Security Portal entities.
 * These validate the shape of data returned from the database.
 */

import { z } from 'zod';

// ============================================================================
// INCIDENT
// ============================================================================

export const incidentSchema = z.object({
  id: z.string(),
  incidentNumber: z.string(),
  type: z.enum(['Theft', 'Assault', 'Vandalism', 'Unauthorized Access', 'Safety Hazard', 'Fire', 'Medical Emergency', 'Other']),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  status: z.enum(['Reported', 'Investigating', 'Resolved', 'Closed']),
  location: z.string(),
  description: z.string(),
  reportedBy: z.string(),
  reportedAt: z.string(),
  assignedTo: z.string().optional(),
  resolvedAt: z.string().optional(),
  actionsTaken: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
});

export type IncidentEntity = z.infer<typeof incidentSchema>;

// ============================================================================
// INVESTIGATION
// ============================================================================

export const investigationSchema = z.object({
  id: z.string(),
  caseNumber: z.string(),
  incidentId: z.string(),
  title: z.string(),
  status: z.enum(['Open', 'In Progress', 'On Hold', 'Closed']),
  priority: z.enum(['Low', 'Medium', 'High', 'Urgent']),
  leadInvestigator: z.string(),
  teamMembers: z.array(z.string()),
  startDate: z.string(),
  estimatedCompletion: z.string().optional(),
  actualCompletion: z.string().optional(),
  findings: z.string().optional(),
  recommendations: z.string().optional(),
  evidenceIds: z.array(z.string()).optional(),
});

export type InvestigationEntity = z.infer<typeof investigationSchema>;

// ============================================================================
// VISITOR
// ============================================================================

export const visitorSchema = z.object({
  id: z.string(),
  visitorNumber: z.string(),
  name: z.string(),
  company: z.string().optional(),
  purpose: z.string(),
  visitType: z.enum(['Business', 'Personal', 'Delivery', 'Contractor', 'Vendor']),
  host: z.string(),
  hostDepartment: z.string(),
  checkInTime: z.string(),
  checkOutTime: z.string().optional(),
  expectedDeparture: z.string(),
  badgeNumber: z.string(),
  accessLevel: z.enum(['Limited', 'Standard', 'Full']),
  status: z.enum(['Checked In', 'Checked Out', 'Overdue']),
  notes: z.string().optional(),
});

export type VisitorEntity = z.infer<typeof visitorSchema>;

// ============================================================================
// ACCESS CONTROL
// ============================================================================

export const accessControlSchema = z.object({
  id: z.string(),
  userId: z.string(),
  userName: z.string(),
  accessLevel: z.enum(['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']),
  areas: z.array(z.string()),
  status: z.enum(['Active', 'Inactive', 'Suspended', 'Revoked']),
  issuedAt: z.string(),
  expiresAt: z.string().optional(),
  lastUsed: z.string().optional(),
  issuedBy: z.string(),
  reason: z.string().optional(),
});

export type AccessControlEntity = z.infer<typeof accessControlSchema>;

// ============================================================================
// KEY / KEYCARD
// ============================================================================

export const keyKeycardSchema = z.object({
  id: z.string(),
  keyNumber: z.string(),
  type: z.enum(['Physical Key', 'Keycard', 'Mobile Key']),
  roomNumber: z.string().optional(),
  status: z.enum(['Available', 'Issued', 'Lost', 'Damaged', 'Inactive']),
  assignedTo: z.string().optional(),
  assignedAt: z.string().optional(),
  returnedAt: z.string().optional(),
  issuedBy: z.string(),
  notes: z.string().optional(),
});

export type KeyKeycardEntity = z.infer<typeof keyKeycardSchema>;

// ============================================================================
// CCTV CAMERA
// ============================================================================

export const cctvCameraSchema = z.object({
  id: z.string(),
  cameraId: z.string(),
  name: z.string(),
  location: z.string(),
  status: z.enum(['Online', 'Offline', 'Maintenance']),
  recordingStatus: z.enum(['Recording', 'Not Recording', 'Scheduled']),
  ipAddress: z.string().optional(),
  model: z.string().optional(),
  installationDate: z.string(),
  lastMaintenance: z.string().optional(),
  retentionDays: z.number().int(),
});

export type CCTVCameraEntity = z.infer<typeof cctvCameraSchema>;

// ============================================================================
// PATROL
// ============================================================================

export const patrolSchema = z.object({
  id: z.string(),
  patrolNumber: z.string(),
  type: z.enum(['Routine', 'Special', 'Emergency Response']),
  assignedTo: z.string(),
  startTime: z.string(),
  endTime: z.string().optional(),
  route: z.array(z.string()),
  checkpoints: z.array(z.object({
    location: z.string(),
    checkInTime: z.string(),
    notes: z.string().optional(),
  })),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Missed']),
  incidents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export type PatrolEntity = z.infer<typeof patrolSchema>;

// ============================================================================
// LOST & FOUND ITEM
// ============================================================================

export const lostFoundItemSchema = z.object({
  id: z.string(),
  itemNumber: z.string(),
  description: z.string(),
  category: z.enum(['Electronics', 'Clothing', 'Documents', 'Jewelry', 'Keys', 'Other']),
  locationFound: z.string(),
  dateFound: z.string(),
  foundBy: z.string(),
  status: z.enum(['Unclaimed', 'Claimed', 'Disposed', 'Returned to Owner']),
  claimedBy: z.string().optional(),
  claimedAt: z.string().optional(),
  storageLocation: z.string(),
  notes: z.string().optional(),
});

export type LostFoundItemEntity = z.infer<typeof lostFoundItemSchema>;

// ============================================================================
// EMERGENCY PLAN
// ============================================================================

export const emergencyPlanSchema = z.object({
  id: z.string(),
  planName: z.string(),
  type: z.enum(['Fire', 'Medical', 'Natural Disaster', 'Security Threat', 'Other']),
  status: z.enum(['Active', 'Draft', 'Archived']),
  lastUpdated: z.string(),
  updatedBy: z.string(),
  nextReview: z.string(),
  evacuationRoutes: z.array(z.string()),
  assemblyPoints: z.array(z.string()),
  contactList: z.array(z.object({
    name: z.string(),
    role: z.string(),
    phone: z.string(),
  })),
  notes: z.string().optional(),
});

export type EmergencyPlanEntity = z.infer<typeof emergencyPlanSchema>;

// ============================================================================
// FIRE & LIFE SAFETY EQUIPMENT
// ============================================================================

export const fireSafetyEquipmentSchema = z.object({
  id: z.string(),
  equipmentId: z.string(),
  type: z.enum(['Fire Extinguisher', 'Smoke Detector', 'Sprinkler', 'Fire Alarm', 'Emergency Exit', 'Other']),
  location: z.string(),
  status: z.enum(['Operational', 'Needs Service', 'Out of Service']),
  lastInspection: z.string(),
  nextInspection: z.string(),
  inspector: z.string(),
  notes: z.string().optional(),
});

export type FireSafetyEquipmentEntity = z.infer<typeof fireSafetyEquipmentSchema>;

// ============================================================================
// RISK ASSESSMENT
// ============================================================================

export const riskAssessmentSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  area: z.string(),
  riskType: z.enum(['Security', 'Safety', 'Operational', 'Financial', 'Reputation']),
  likelihood: z.enum(['Very Low', 'Low', 'Medium', 'High', 'Very High']),
  impact: z.enum(['Very Low', 'Low', 'Medium', 'High', 'Very High']),
  riskLevel: z.enum(['Low', 'Medium', 'High', 'Critical']),
  mitigation: z.string(),
  status: z.enum(['Identified', 'Mitigating', 'Mitigated', 'Monitoring']),
  lastAssessment: z.string(),
  nextAssessment: z.string(),
  assessedBy: z.string(),
  notes: z.string().optional(),
});

export type RiskAssessmentEntity = z.infer<typeof riskAssessmentSchema>;

// ============================================================================
// BUSINESS CONTINUITY PLAN
// ============================================================================

export const businessContinuityPlanSchema = z.object({
  id: z.string(),
  planId: z.string(),
  name: z.string(),
  scenario: z.string(),
  status: z.enum(['Active', 'Draft', 'Testing', 'Archived']),
  lastUpdated: z.string(),
  updatedBy: z.string(),
  recoveryTimeObjective: z.string(),
  recoveryPointObjective: z.string(),
  criticalFunctions: z.array(z.string()),
  backupSystems: z.array(z.string()),
  communicationPlan: z.string(),
  notes: z.string().optional(),
});

export type BusinessContinuityPlanEntity = z.infer<typeof businessContinuityPlanSchema>;

// ============================================================================
// CRISIS MANAGEMENT
// ============================================================================

export const crisisManagementSchema = z.object({
  id: z.string(),
  crisisId: z.string(),
  type: z.enum(['Natural Disaster', 'Security Incident', 'Health Emergency', 'Technical Failure', 'Other']),
  severity: z.enum(['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5']),
  status: z.enum(['Active', 'Resolved', 'Post-Review']),
  declaredAt: z.string(),
  declaredBy: z.string(),
  resolvedAt: z.string().optional(),
  responseTeam: z.array(z.string()),
  actionsTaken: z.string(),
  lessonsLearned: z.string().optional(),
  notes: z.string().optional(),
});

export type CrisisManagementEntity = z.infer<typeof crisisManagementSchema>;

// ============================================================================
// HEALTH & SAFETY INCIDENT
// ============================================================================

export const healthSafetyIncidentSchema = z.object({
  id: z.string(),
  incidentNumber: z.string(),
  type: z.enum(['Injury', 'Illness', 'Near Miss', 'Property Damage', 'Environmental']),
  severity: z.enum(['Minor', 'Moderate', 'Major', 'Fatal']),
  status: z.enum(['Reported', 'Investigating', 'Closed']),
  location: z.string(),
  description: z.string(),
  involvedPersons: z.array(z.string()),
  reportedBy: z.string(),
  reportedAt: z.string(),
  rootCause: z.string().optional(),
  correctiveActions: z.string().optional(),
  notes: z.string().optional(),
});

export type HealthSafetyIncidentEntity = z.infer<typeof healthSafetyIncidentSchema>;

// ============================================================================
// COMPLIANCE RECORD
// ============================================================================

export const complianceRecordSchema = z.object({
  id: z.string(),
  recordId: z.string(),
  regulation: z.string(),
  category: z.enum(['Safety', 'Security', 'Environmental', 'Labor', 'Other']),
  status: z.enum(['Compliant', 'Non-Compliant', 'Pending Review', 'Under Appeal']),
  lastAudit: z.string(),
  nextAudit: z.string(),
  auditor: z.string(),
  findings: z.string(),
  correctiveActions: z.string().optional(),
  deadline: z.string().optional(),
  notes: z.string().optional(),
});

export type ComplianceRecordEntity = z.infer<typeof complianceRecordSchema>;

// ============================================================================
// ASSET PROTECTION
// ============================================================================

export const assetProtectionSchema = z.object({
  id: z.string(),
  assetId: z.string(),
  name: z.string(),
  category: z.enum(['Electronics', 'Furniture', 'Equipment', 'Vehicle', 'Other']),
  location: z.string(),
  status: z.enum(['Secure', 'At Risk', 'Compromised', 'Lost']),
  value: z.number(),
  protectionMeasures: z.array(z.string()),
  lastAssessment: z.string(),
  nextAssessment: z.string(),
  assignedTo: z.string(),
  notes: z.string().optional(),
});

export type AssetProtectionEntity = z.infer<typeof assetProtectionSchema>;

// ============================================================================
// FRAUD PREVENTION
// ============================================================================

export const fraudPreventionSchema = z.object({
  id: z.string(),
  caseId: z.string(),
  type: z.enum(['Financial', 'Identity', 'Procurement', 'Payroll', 'Other']),
  status: z.enum(['Suspected', 'Investigating', 'Confirmed', 'Resolved']),
  description: z.string(),
  suspectedAmount: z.number().optional(),
  reportedBy: z.string(),
  reportedAt: z.string(),
  assignedTo: z.string().optional(),
  findings: z.string().optional(),
  actionsTaken: z.string().optional(),
  notes: z.string().optional(),
});

export type FraudPreventionEntity = z.infer<typeof fraudPreventionSchema>;

// ============================================================================
// EVIDENCE
// ============================================================================

export const evidenceSchema = z.object({
  id: z.string(),
  evidenceId: z.string(),
  type: z.enum(['Photo', 'Video', 'Document', 'Physical', 'Digital', 'Audio']),
  relatedIncident: z.string(),
  description: z.string(),
  collectedBy: z.string(),
  collectedAt: z.string(),
  location: z.string(),
  status: z.enum(['In Storage', 'In Analysis', 'Returned', 'Destroyed']),
  chainOfCustody: z.array(z.object({
    handler: z.string(),
    action: z.string(),
    timestamp: z.string(),
  })),
  notes: z.string().optional(),
});

export type EvidenceEntity = z.infer<typeof evidenceSchema>;

// ============================================================================
// COMMUNICATION LOG
// ============================================================================

export const communicationLogSchema = z.object({
  id: z.string(),
  logId: z.string(),
  type: z.enum(['Radio', 'Phone', 'Email', 'Text', 'In-Person']),
  channel: z.string(),
  from: z.string(),
  to: z.string().optional(),
  subject: z.string(),
  message: z.string(),
  timestamp: z.string(),
  priority: z.enum(['Low', 'Normal', 'High', 'Urgent']),
  status: z.enum(['Sent', 'Received', 'Acknowledged']),
  relatedIncident: z.string().optional(),
  notes: z.string().optional(),
});

export type CommunicationLogEntity = z.infer<typeof communicationLogSchema>;
