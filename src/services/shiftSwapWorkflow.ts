/**
 * Shift Swap Workflow Service
 * Phase 2.1: Staff shift swapping with approval workflows
 */

export interface ShiftSwapRequest {
  swapId: string;
  requesterStaffId: string;
  originalShiftId: string;
  originalShift: ShiftDetails;
  proposedStaffId: string;
  proposedShiftId: string | null;
  proposedShift: ShiftDetails | null;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  requestedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  approvedBy: string | null;
  approvedAt: string | null;
}

export interface ShiftDetails {
  shiftId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  department: string;
  role: string;
  requiredSkills: string[];
}

export interface SwapValidationResult {
  isValid: boolean;
  canProceed: boolean;
  errors: string[];
  warnings: string[];
  requirements: string[];
}

export interface SwapImpactAnalysis {
  staffingImpact: {
    originalCoverage: number;
    newCoverage: number;
    coverageChange: number;
  };
  skillImpact: {
    originalSkillsCovered: string[];
    newSkillsCovered: string[];
    missingSkills: string[];
  };
  costImpact: {
    originalCost: number;
    newCost: number;
    costDifference: number;
  };
  complianceImpact: {
    violatesRestPeriod: boolean;
    violatesMaxHours: boolean;
    violatesConstraints: string[];
  };
  overallImpact: 'positive' | 'neutral' | 'negative';
}

/**
 * Create a new shift swap request
 */
export function createShiftSwapRequest(params: {
  requesterStaffId: string;
  originalShiftId: string;
  originalShift: ShiftDetails;
  proposedStaffId: string;
  proposedShiftId: string | null;
  proposedShift: ShiftDetails | null;
  reason: string;
}): ShiftSwapRequest {
  const swapId = `swap-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    swapId,
    requesterStaffId: params.requesterStaffId,
    originalShiftId: params.originalShiftId,
    originalShift: params.originalShift,
    proposedStaffId: params.proposedStaffId,
    proposedShiftId: params.proposedShiftId,
    proposedShift: params.proposedShift,
    reason: params.reason,
    status: 'pending',
    requestedAt: new Date().toISOString(),
    reviewedBy: null,
    reviewedAt: null,
    reviewNotes: null,
    approvedBy: null,
    approvedAt: null
  };
}

/**
 * Validate a shift swap request
 * Checks business rules and constraints before allowing swap
 */
export function validateShiftSwap(params: {
  originalShift: ShiftDetails;
  proposedShift: ShiftDetails | null;
  requesterStaffId: string;
  proposedStaffId: string;
  staffConstraints: StaffConstraints[];
}): SwapValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const requirements: string[] = [];
  
  // Check if proposed shift exists
  if (!params.proposedShift) {
    errors.push('Proposed shift not found');
    return {
      isValid: false,
      canProceed: false,
      errors,
      warnings,
      requirements
    };
  }
  
  // Check if staff are different
  if (params.requesterStaffId === params.proposedStaffId) {
    errors.push('Cannot swap with yourself');
    return {
      isValid: false,
      canProceed: false,
      errors,
      warnings,
      requirements
    };
  }
  
  // Check if shifts are on the same date
  if (params.originalShift.date !== params.proposedShift.date) {
    errors.push('Shifts must be on the same date for swapping');
    return {
      isValid: false,
      canProceed: false,
      errors,
      warnings,
      requirements
    };
  }
  
  // Check skill compatibility
  const skillCheck = checkSkillCompatibility(
    params.originalShift.requiredSkills,
    params.proposedShift
  );
  if (!skillCheck.compatible) {
    errors.push(`Skill mismatch: ${skillCheck.missingSkills.join(', ')}`);
    return {
      isValid: false,
      canProceed: false,
      errors,
      warnings,
      requirements
    };
  }
  
  // Check rest period constraints
  const restPeriodCheck = checkRestPeriodConstraint(
    params.proposedShift,
    params.requesterStaffId,
    params.staffConstraints
  );
  if (restPeriodCheck.violatesConstraint) {
    errors.push('Violates minimum rest period requirement');
    return {
      isValid: false,
      canProceed: false,
      errors,
      warnings,
      requirements
    };
  }
  
  // Check maximum hours constraints
  const maxHoursCheck = checkMaxHoursConstraint(
    params.proposedShift,
    params.requesterStaffId,
    params.staffConstraints
  );
  if (maxHoursCheck.violatesConstraint) {
    errors.push('Exceeds maximum weekly hours limit');
    return {
      isValid: false,
      canProceed: false,
      errors,
      warnings,
      requirements
    };
  }
  
  // Warnings (non-blocking)
  if (params.proposedShift.startTime !== params.originalShift.startTime) {
    warnings.push('Shift times are different - ensure adequate coverage');
  }
  
  if (params.proposedShift.department !== params.originalShift.department) {
    warnings.push('Cross-department swap - ensure proper training');
  }
  
  // Requirements for approval
  requirements.push('Manager approval required');
  if (params.proposedShift.department !== params.originalShift.department) {
    requirements.push('Department head approval required');
  }
  
  return {
    isValid: true,
    canProceed: true,
    errors,
    warnings,
    requirements
  };
}

/**
 * Analyze the impact of a shift swap
 */
export function analyzeSwapImpact(params: {
  originalShift: ShiftDetails;
  proposedShift: ShiftDetails;
  departmentCoverage: DepartmentCoverage;
}): SwapImpactAnalysis {
  // Staffing impact
  const staffingImpact = {
    originalCoverage: params.departmentCoverage.coveragePercentage,
    newCoverage: calculateNewCoverage(
      params.departmentCoverage,
      params.originalShift,
      params.proposedShift
    ),
    coverageChange: 0
  };
  staffingImpact.coverageChange = staffingImpact.newCoverage - staffingImpact.originalCoverage;
  
  // Skill impact
  const skillImpact = {
    originalSkillsCovered: params.originalShift.requiredSkills,
    newSkillsCovered: params.proposedShift.requiredSkills,
    missingSkills: params.originalShift.requiredSkills.filter(
      skill => !params.proposedShift.requiredSkills.includes(skill)
    )
  };
  
  // Cost impact (simplified calculation)
  const costImpact = {
    originalCost: calculateShiftCost(params.originalShift),
    newCost: calculateShiftCost(params.proposedShift),
    costDifference: 0
  };
  costImpact.costDifference = costImpact.newCost - costImpact.originalCost;
  
  // Compliance impact
  const complianceImpact = {
    violatesRestPeriod: false,
    violatesMaxHours: false,
    violatesConstraints: [] as string[]
  };
  
  // Determine overall impact
  let overallImpact: 'positive' | 'neutral' | 'negative' = 'neutral';
  if (staffingImpact.coverageChange > 0 && skillImpact.missingSkills.length === 0) {
    overallImpact = 'positive';
  } else if (staffingImpact.coverageChange < 0 || skillImpact.missingSkills.length > 0) {
    overallImpact = 'negative';
  }
  
  return {
    staffingImpact,
    skillImpact,
    costImpact,
    complianceImpact,
    overallImpact
  };
}

/**
 * Approve a shift swap request
 */
export function approveShiftSwap(
  swapRequest: ShiftSwapRequest,
  approverId: string,
  notes?: string
): ShiftSwapRequest {
  return {
    ...swapRequest,
    status: 'approved',
    reviewedBy: approverId,
    reviewedAt: new Date().toISOString(),
    reviewNotes: notes || null,
    approvedBy: approverId,
    approvedAt: new Date().toISOString()
  };
}

/**
 * Reject a shift swap request
 */
export function rejectShiftSwap(
  swapRequest: ShiftSwapRequest,
  reviewerId: string,
  reason: string
): ShiftSwapRequest {
  return {
    ...swapRequest,
    status: 'rejected',
    reviewedBy: reviewerId,
    reviewedAt: new Date().toISOString(),
    reviewNotes: reason
  };
}

/**
 * Cancel a shift swap request
 */
export function cancelShiftSwap(
  swapRequest: ShiftSwapRequest
): ShiftSwapRequest {
  return {
    ...swapRequest,
    status: 'cancelled'
  };
}

/**
 * Get swap recommendations
 * Suggest potential swap partners based on skills and preferences
 */
export function getSwapRecommendations(params: {
  staffId: string;
  shift: ShiftDetails;
  availableStaff: AvailableStaff[];
  maxRecommendations: number;
}): SwapRecommendation[] {
  const recommendations: SwapRecommendation[] = [];
  
  for (const availableStaff of params.availableStaff) {
    if (availableStaff.staffId === params.staffId) continue;
    
    const compatibilityScore = calculateSwapCompatibility(
      params.shift,
      availableStaff
    );
    
    if (compatibilityScore > 50) {
      recommendations.push({
        staffId: availableStaff.staffId,
        staffName: availableStaff.name,
        shiftId: availableStaff.shiftId,
        shiftDetails: availableStaff.shift,
        compatibilityScore,
        reasons: generateSwapReasons(compatibilityScore, availableStaff)
      });
    }
  }
  
  // Sort by compatibility score and return top recommendations
  return recommendations
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, params.maxRecommendations);
}

// Helper interfaces and functions

interface StaffConstraints {
  staffId: string;
  maxHoursPerWeek: number;
  minRestPeriodHours: number;
  currentHoursThisWeek: number;
  scheduledShifts: ShiftDetails[];
}

interface DepartmentCoverage {
  department: string;
  date: string;
  requiredStaff: number;
  scheduledStaff: number;
  coveragePercentage: number;
}

interface AvailableStaff {
  staffId: string;
  name: string;
  shiftId: string;
  shift: ShiftDetails;
  skills: string[];
  preferences: StaffPreference[];
}

interface StaffPreference {
  preferenceType: 'shift_timing' | 'days_off' | 'department' | 'role';
  preferenceValue: any;
  priority: 'low' | 'normal' | 'high' | 'essential';
}

interface SwapRecommendation {
  staffId: string;
  staffName: string;
  shiftId: string;
  shiftDetails: ShiftDetails;
  compatibilityScore: number;
  reasons: string[];
}

function checkSkillCompatibility(
  requiredSkills: string[],
  proposedShift: ShiftDetails
): { compatible: boolean; missingSkills: string[] } {
  const missingSkills = requiredSkills.filter(
    skill => !proposedShift.requiredSkills.includes(skill)
  );
  
  return {
    compatible: missingSkills.length === 0,
    missingSkills
  };
}

function checkRestPeriodConstraint(
  proposedShift: ShiftDetails,
  staffId: string,
  constraints: StaffConstraints[]
): { violatesConstraint: boolean } {
  const staffConstraint = constraints.find(c => c.staffId === staffId);
  if (!staffConstraint) return { violatesConstraint: false };
  
  const minRestHours = staffConstraint.minRestPeriodHours;
  
  // Check all scheduled shifts for this staff member
  for (const scheduledShift of staffConstraint.scheduledShifts) {
    if (scheduledShift.date === proposedShift.date) {
      // Calculate time difference between shifts
      const timeDiff = calculateTimeDifference(
        scheduledShift.endTime,
        proposedShift.startTime
      );
      
      if (timeDiff < minRestHours) {
        return { violatesConstraint: true };
      }
    }
  }
  
  return { violatesConstraint: false };
}

function checkMaxHoursConstraint(
  proposedShift: ShiftDetails,
  staffId: string,
  constraints: StaffConstraints[]
): { violatesConstraint: boolean } {
  const staffConstraint = constraints.find(c => c.staffId === staffId);
  if (!staffConstraint) return { violatesConstraint: false };
  
  const shiftDuration = calculateShiftDuration(proposedShift.startTime, proposedShift.endTime);
  const newTotalHours = staffConstraint.currentHoursThisWeek + shiftDuration;
  
  return {
    violatesConstraint: newTotalHours > staffConstraint.maxHoursPerWeek
  };
}

function calculateNewCoverage(
  departmentCoverage: DepartmentCoverage,
  originalShift: ShiftDetails,
  proposedShift: ShiftDetails
): number {
  // Simplified calculation - in practice would be more complex
  return departmentCoverage.coveragePercentage;
}

function calculateShiftCost(shift: ShiftDetails): number {
  const duration = calculateShiftDuration(shift.startTime, shift.endTime);
  const hourlyRates: Record<string, number> = {
    'FrontOffice': 18,
    'Housekeeping': 15,
    'FandB': 16,
    'Maintenance': 22,
    'HR': 25,
    'Procurement': 20,
    'SalesEvents': 19,
    'GuestPortal': 17
  };
  
  const hourlyRate = hourlyRates[shift.department] || 18;
  return duration * hourlyRate;
}

function calculateSwapCompatibility(
  shift: ShiftDetails,
  availableStaff: AvailableStaff
): number {
  let score = 0;
  
  // Skill match score (40% weight)
  const skillMatch = calculateSkillMatchScore(shift.requiredSkills, availableStaff.skills);
  score += skillMatch * 0.4;
  
  // Time preference score (30% weight)
  const timeScore = calculateTimePreferenceScore(shift, availableStaff.preferences);
  score += timeScore * 0.3;
  
  // Department preference score (20% weight)
  const deptScore = calculateDepartmentPreferenceScore(shift.department, availableStaff.preferences);
  score += deptScore * 0.2;
  
  // Overall fit score (10% weight)
  score += 0.1; // Base score
  
  return score * 100;
}

function calculateSkillMatchScore(requiredSkills: string[], staffSkills: string[]): number {
  if (requiredSkills.length === 0) return 1;
  
  const matchedSkills = requiredSkills.filter(skill => staffSkills.includes(skill));
  return matchedSkills.length / requiredSkills.length;
}

function calculateTimePreferenceScore(shift: ShiftDetails, preferences: StaffPreference[]): number {
  const timePreference = preferences.find(p => p.preferenceType === 'shift_timing');
  if (!timePreference) return 0.5;
  
  // Simplified time preference matching
  return 0.7; // Would be more sophisticated in practice
}

function calculateDepartmentPreferenceScore(department: string, preferences: StaffPreference[]): number {
  const deptPreference = preferences.find(p => p.preferenceType === 'department');
  if (!deptPreference) return 0.5;
  
  if (deptPreference.preferenceValue === department) {
    return 1.0;
  }
  
  return 0.3;
}

function generateSwapReasons(score: number, staff: AvailableStaff): string[] {
  const reasons: string[] = [];
  
  if (score > 80) {
    reasons.push('Excellent skill match');
  } else if (score > 60) {
    reasons.push('Good skill match');
  }
  
  if (staff.skills.length > 3) {
    reasons.push('Multi-skilled staff member');
  }
  
  return reasons;
}

function calculateTimeDifference(endTime: string, startTime: string): number {
  const end = parseTimeString(endTime);
  const start = parseTimeString(startTime);
  
  let diff = start - end;
  
  // Handle overnight
  if (diff < 0) {
    diff += 24;
  }
  
  return diff;
}

function calculateShiftDuration(startTime: string, endTime: string): number {
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);
  
  let duration = end - start;
  
  // Handle overnight shifts
  if (duration < 0) {
    duration += 24;
  }
  
  return duration;
}

function parseTimeString(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}
