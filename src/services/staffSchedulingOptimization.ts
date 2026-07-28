/**
 * Skill-Based Assignment Algorithms for Staff Scheduling
 * Phase 2.1: AI-powered staff scheduling optimization
 */

export interface ShiftRequirement {
  shiftId: string;
  department: string;
  requiredSkills: string[];
  startTime: string;
  endTime: string;
  priority: 'urgent' | 'high' | 'normal' | 'low';
}

export interface StaffMember {
  staffId: string;
  name: string;
  skills: StaffSkill[];
  preferences: StaffPreference[];
  hourlyRate: number;
  maxHoursPerWeek: number;
  currentHoursThisWeek: number;
  availability: TimeSlot[];
}

export interface StaffSkill {
  skillName: string;
  category: 'technical' | 'service' | 'leadership' | 'language' | 'certification' | 'other';
  proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
  lastVerified: string;
}

export interface StaffPreference {
  preferenceType: 'shift_timing' | 'days_off' | 'department' | 'role' | 'partner';
  preferenceValue: any;
  priority: 'low' | 'normal' | 'high' | 'essential';
}

export interface TimeSlot {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface AssignmentResult {
  staffId: string;
  shiftId: string;
  matchScore: number;
  skillMatchScore: number;
  preferenceScore: number;
  costScore: number;
  availabilityScore: number;
  totalScore: number;
  reasons: string[];
}

/**
 * Main skill-based assignment algorithm
 * Matches staff to shifts based on skills, preferences, availability, and cost
 */
export function assignStaffToShifts(
  shifts: ShiftRequirement[],
  staff: StaffMember[]
): AssignmentResult[] {
  const results: AssignmentResult[] = [];

  for (const shift of shifts) {
    const eligibleStaff = staff.filter(s => isStaffEligibleForShift(s, shift));
    
    for (const staffMember of eligibleStaff) {
      const result = calculateAssignmentScore(staffMember, shift);
      if (result.totalScore > 0) {
        results.push(result);
      }
    }
  }

  // Sort by total score (descending) and return top assignments
  return results.sort((a, b) => b.totalScore - a.totalScore);
}

/**
 * Check if staff member is eligible for a shift
 * Basic availability and constraint checks
 */
function isStaffEligibleForShift(staff: StaffMember, shift: ShiftRequirement): boolean {
  // Check if staff has required skills
  const hasRequiredSkills = shift.requiredSkills.every(requiredSkill =>
    staff.skills.some(skill => skill.skillName === requiredSkill)
  );
  
  if (!hasRequiredSkills) {
    return false;
  }

  // Check weekly hour limits
  const shiftDuration = calculateShiftDuration(shift.startTime, shift.endTime);
  if (staff.currentHoursThisWeek + shiftDuration > staff.maxHoursPerWeek) {
    return false;
  }

  // Check availability (simplified - would need day-of-week matching)
  // This is a placeholder for more complex availability checking
  return true;
}

/**
 * Calculate comprehensive assignment score for a staff member to a shift
 * Scores range from 0-100, higher is better
 */
function calculateAssignmentScore(staff: StaffMember, shift: ShiftRequirement): AssignmentResult {
  const skillMatchScore = calculateSkillMatchScore(staff, shift);
  const preferenceScore = calculatePreferenceScore(staff, shift);
  const costScore = calculateCostScore(staff, shift);
  const availabilityScore = calculateAvailabilityScore(staff, shift);

  // Weighted average of all scores
  const weights = {
    skillMatch: 0.4,
    preference: 0.25,
    cost: 0.2,
    availability: 0.15
  };

  const totalScore = (
    skillMatchScore * weights.skillMatch +
    preferenceScore * weights.preference +
    costScore * weights.cost +
    availabilityScore * weights.availability
  );

  const reasons: string[] = [];
  if (skillMatchScore > 80) reasons.push('Excellent skill match');
  if (preferenceScore > 80) reasons.push('Matches staff preferences');
  if (costScore > 80) reasons.push('Cost-effective assignment');
  if (availabilityScore > 80) reasons.push('Optimal availability');

  return {
    staffId: staff.staffId,
    shiftId: shift.shiftId,
    matchScore: totalScore,
    skillMatchScore,
    preferenceScore,
    costScore,
    availabilityScore,
    totalScore,
    reasons
  };
}

/**
 * Calculate skill match score (0-100)
 * Based on skill coverage and proficiency levels
 */
function calculateSkillMatchScore(staff: StaffMember, shift: ShiftRequirement): number {
  if (shift.requiredSkills.length === 0) return 100;

  let totalScore = 0;
  let requiredSkillsCount = shift.requiredSkills.length;

  for (const requiredSkill of shift.requiredSkills) {
    const staffSkill = staff.skills.find(s => s.skillName === requiredSkill);
    
    if (!staffSkill) {
      // Missing required skill
      totalScore += 0;
    } else {
      // Score based on proficiency level
      const proficiencyScores = {
        'beginner': 25,
        'intermediate': 50,
        'advanced': 75,
        'expert': 100
      };
      
      let skillScore = proficiencyScores[staffSkill.proficiencyLevel];
      
      // Bonus for certification
      if (staffSkill.certified) {
        skillScore += 10;
      }
      
      // Cap at 100
      skillScore = Math.min(skillScore, 100);
      
      totalScore += skillScore;
    }
  }

  return (totalScore / requiredSkillsCount);
}

/**
 * Calculate preference match score (0-100)
 * Based on staff preferences for shift timing, days off, etc.
 */
function calculatePreferenceScore(staff: StaffMember, shift: ShiftRequirement): number {
  let preferenceScore = 50; // Base score

  for (const preference of staff.preferences) {
    switch (preference.preferenceType) {
      case 'shift_timing':
        // Check if shift timing matches preferred timing
        if (matchesPreferredTiming(shift.startTime, shift.endTime, preference.preferenceValue)) {
          const priorityBonus = getPriorityBonus(preference.priority);
          preferenceScore += priorityBonus;
        } else {
          const priorityPenalty = getPriorityPenalty(preference.priority);
          preferenceScore -= priorityPenalty;
        }
        break;
        
      case 'department':
        // Check if department matches preferred department
        if (shift.department === preference.preferenceValue) {
          const priorityBonus = getPriorityBonus(preference.priority);
          preferenceScore += priorityBonus;
        }
        break;
        
      case 'role':
        // Role preferences would be handled separately
        break;
    }
  }

  return Math.max(0, Math.min(100, preferenceScore));
}

/**
 * Calculate cost score (0-100)
 * Lower hourly rates get higher scores
 */
function calculateCostScore(staff: StaffMember, shift: ShiftRequirement): number {
  // This is a simplified calculation
  // In practice, you'd compare against budget and market rates
  const maxRate = 50; // Assumed maximum hourly rate
  const minRate = 15; // Assumed minimum hourly rate
  
  if (staff.hourlyRate <= minRate) return 100;
  if (staff.hourlyRate >= maxRate) return 0;
  
  // Linear interpolation
  return 100 - ((staff.hourlyRate - minRate) / (maxRate - minRate)) * 100;
}

/**
 * Calculate availability score (0-100)
 * Based on staff availability and current workload
 */
function calculateAvailabilityScore(staff: StaffMember, shift: ShiftRequirement): number {
  const shiftDuration = calculateShiftDuration(shift.startTime, shift.endTime);
  const utilizationRatio = staff.currentHoursThisWeek / staff.maxHoursPerWeek;
  
  // Penalize if staff is over-utilized
  if (utilizationRatio > 0.9) {
    return 10;
  } else if (utilizationRatio > 0.75) {
    return 30;
  } else if (utilizationRatio > 0.5) {
    return 60;
  } else {
    return 90;
  }
}

/**
 * Helper function to calculate shift duration in hours
 */
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

/**
 * Helper function to parse time string (HH:MM) to hours
 */
function parseTimeString(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours + minutes / 60;
}

/**
 * Check if shift timing matches preferred timing
 */
function matchesPreferredTiming(
  shiftStart: string,
  shiftEnd: string,
  preferredTiming: any
): boolean {
  // Simplified matching logic
  // In practice, this would be more sophisticated
  if (typeof preferredTiming !== 'object' || !preferredTiming) {
    return false;
  }
  
  const { preferredStart, preferredEnd } = preferredTiming;
  if (!preferredStart || !preferredEnd) {
    return false;
  }
  
  const shiftStartHour = parseTimeString(shiftStart);
  const preferredStartHour = parseTimeString(preferredStart);
  
  // Allow 1-hour flexibility
  return Math.abs(shiftStartHour - preferredStartHour) <= 1;
}

/**
 * Get bonus score based on preference priority
 */
function getPriorityBonus(priority: string): number {
  switch (priority) {
    case 'essential': return 30;
    case 'high': return 20;
    case 'normal': return 10;
    case 'low': return 5;
    default: return 0;
  }
}

/**
 * Get penalty score based on preference priority
 */
function getPriorityPenalty(priority: string): number {
  switch (priority) {
    case 'essential': return 40;
    case 'high': return 25;
    case 'normal': return 15;
    case 'low': return 5;
    default: return 0;
  }
}

/**
 * Optimize schedule for a given day
 * Takes all shifts and available staff, returns optimal assignments
 */
export function optimizeDailySchedule(
  shifts: ShiftRequirement[],
  availableStaff: StaffMember[]
): {
  assignments: AssignmentResult[];
  unassignedShifts: ShiftRequirement[];
  optimizationMetrics: {
    totalCoverage: number;
    averageMatchScore: number;
    totalLaborCost: number;
    skillGaps: string[];
  };
} {
  // Get all possible assignments
  const allAssignments = assignStaffToShifts(shifts, availableStaff);
  
  // Assign each shift to the best available staff
  const assignments: AssignmentResult[] = [];
  const assignedShiftIds = new Set<string>();
  const assignedStaffIds = new Set<string>();
  
  // Sort assignments by score and assign greedily
  for (const assignment of allAssignments.sort((a, b) => b.totalScore - a.totalScore)) {
    if (!assignedShiftIds.has(assignment.shiftId) && !assignedStaffIds.has(assignment.staffId)) {
      assignments.push(assignment);
      assignedShiftIds.add(assignment.shiftId);
      assignedStaffIds.add(assignment.staffId);
    }
  }
  
  // Find unassigned shifts
  const unassignedShifts = shifts.filter(shift => !assignedShiftIds.has(shift.shiftId));
  
  // Calculate metrics
  const totalCoverage = (assignedShiftIds.size / shifts.length) * 100;
  const averageMatchScore = assignments.length > 0 
    ? assignments.reduce((sum, a) => sum + a.totalScore, 0) / assignments.length 
    : 0;
  
  const assignedStaffMembers = availableStaff.filter(s => assignedStaffIds.has(s.staffId));
  const totalLaborCost = assignedStaffMembers.reduce((sum, s) => {
    const shift = shifts.find(shift => assignedShiftIds.has(shift.shiftId));
    if (!shift) return sum;
    const duration = calculateShiftDuration(shift.startTime, shift.endTime);
    return sum + (s.hourlyRate * duration);
  }, 0);
  
  // Identify skill gaps
  const skillGaps: string[] = [];
  for (const shift of unassignedShifts) {
    for (const skill of shift.requiredSkills) {
      const hasStaffWithSkill = availableStaff.some(s => 
        s.skills.some(staffSkill => staffSkill.skillName === skill)
      );
      if (!hasStaffWithSkill) {
        skillGaps.push(`No staff available with skill: ${skill} for shift ${shift.shiftId}`);
      }
    }
  }
  
  return {
    assignments,
    unassignedShifts,
    optimizationMetrics: {
      totalCoverage,
      averageMatchScore,
      totalLaborCost,
      skillGaps: [...new Set(skillGaps)] // Remove duplicates
    }
  };
}

/**
 * Generate scheduling recommendations
 * Provides actionable insights for schedule improvement
 */
export function generateSchedulingRecommendations(
  optimizationResult: {
    assignments: AssignmentResult[];
    unassignedShifts: ShiftRequirement[];
    optimizationMetrics: any;
  }
): string[] {
  const recommendations: string[] = [];
  const { assignments, unassignedShifts, optimizationMetrics } = optimizationResult;
  
  // Coverage recommendations
  if (optimizationMetrics.totalCoverage < 80) {
    recommendations.push(`Low coverage (${optimizationMetrics.totalCoverage.toFixed(1)}%). Consider hiring additional staff or adjusting shift requirements.`);
  }
  
  // Skill gap recommendations
  if (optimizationMetrics.skillGaps.length > 0) {
    recommendations.push('Critical skill gaps detected. Consider cross-training staff or hiring specialists.');
    optimizationMetrics.skillGaps.forEach((gap: string) => {
      recommendations.push(`- ${gap}`);
    });
  }
  
  // Match score recommendations
  if (optimizationMetrics.averageMatchScore < 60) {
    recommendations.push('Low average match scores. Consider reviewing staff preferences and skill requirements.');
  }
  
  // Cost recommendations
  if (optimizationMetrics.totalLaborCost > 0) {
    const costPerAssignment = optimizationMetrics.totalLaborCost / assignments.length;
    recommendations.push(`Average cost per assignment: $${costPerAssignment.toFixed(2)}. Review for cost optimization opportunities.`);
  }
  
  // Unassigned shift recommendations
  if (unassignedShifts.length > 0) {
    recommendations.push(`${unassignedShifts.length} shifts remain unassigned. Consider extending staff availability or adjusting shift times.`);
  }
  
  return recommendations;
}
