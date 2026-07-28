/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

/**
 * Role-based Task Assignment System
 * Task definition, assignment, and tracking for staff
 */

const API_BASE = '/api/food-beverage';

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Types
export interface StaffTask {
  id: string;
  taskName: string;
  description?: string;
  taskType: 'opening' | 'closing' | 'cleaning' | 'inventory' | 'maintenance' | 'training' | 'meeting' | 'other';
  role: string;
  section?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedDuration: number;
  requiredStaff: number;
  recurring: boolean;
  recurringPattern?: string;
  dueTime?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  staffId: string;
  outletId: string;
  assignedDate: string;
  dueDate?: string;
  dueTime?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped' | 'overdue';
  startTime?: string;
  completionTime?: string;
  actualDuration?: number;
  notes?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCompletionReport {
  period: { startDate: string; endDate: string };
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  skippedTasks: number;
  completionRate: number;
  averageCompletionTime: number;
  byStaff: Array<{
    staffId: string;
    staffName: string;
    assignedTasks: number;
    completedTasks: number;
    completionRate: number;
    averageTime: number;
  }>;
  byTaskType: Array<{
    taskType: string;
    totalTasks: number;
    completedTasks: number;
    averageTime: number;
  }>;
}

// Staff Task CRUD operations
export async function fetchStaffTasks(
  role?: string,
  taskType?: string,
  isActive?: boolean
): Promise<StaffTask[]> {
  const params = new URLSearchParams();
  if (role) params.append('role', role);
  if (taskType) params.append('taskType', taskType);
  if (isActive !== undefined) params.append('isActive', isActive.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<StaffTask[]>(`/staff-tasks${queryString}`);
}

export async function fetchStaffTaskById(id: string): Promise<StaffTask> {
  return apiRequest<StaffTask>(`/staff-tasks/${id}`);
}

export async function createStaffTask(task: Partial<StaffTask>): Promise<StaffTask> {
  return apiRequest<StaffTask>('/staff-tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  });
}

export async function updateStaffTask(id: string, task: Partial<StaffTask>): Promise<StaffTask> {
  return apiRequest<StaffTask>(`/staff-tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(task),
  });
}

export async function deleteStaffTask(id: string): Promise<void> {
  await apiRequest<void>(`/staff-tasks/${id}`, {
    method: 'DELETE',
  });
}

// Task Assignment CRUD operations
export async function fetchTaskAssignments(
  staffId?: string,
  outletId?: string,
  assignedDate?: string,
  status?: string
): Promise<TaskAssignment[]> {
  const params = new URLSearchParams();
  if (staffId) params.append('staffId', staffId);
  if (outletId) params.append('outletId', outletId);
  if (assignedDate) params.append('assignedDate', assignedDate);
  if (status) params.append('status', status);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<TaskAssignment[]>(`/task-assignments${queryString}`);
}

export async function fetchTaskAssignmentById(id: string): Promise<TaskAssignment> {
  return apiRequest<TaskAssignment>(`/task-assignments/${id}`);
}

export async function createTaskAssignment(assignment: Partial<TaskAssignment>): Promise<TaskAssignment> {
  return apiRequest<TaskAssignment>('/task-assignments', {
    method: 'POST',
    body: JSON.stringify(assignment),
  });
}

export async function updateTaskAssignment(id: string, assignment: Partial<TaskAssignment>): Promise<TaskAssignment> {
  return apiRequest<TaskAssignment>(`/task-assignments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(assignment),
  });
}

export async function deleteTaskAssignment(id: string): Promise<void> {
  await apiRequest<void>(`/task-assignments/${id}`, {
    method: 'DELETE',
  });
}

// Task workflow operations
export async function startTask(assignmentId: string): Promise<TaskAssignment> {
  return apiRequest<TaskAssignment>(`/task-assignments/${assignmentId}/start`, {
    method: 'POST',
  });
}

export async function completeTask(
  assignmentId: string,
  notes?: string
): Promise<TaskAssignment> {
  return apiRequest<TaskAssignment>(`/task-assignments/${assignmentId}/complete`, {
    method: 'POST',
    body: JSON.stringify({ notes }),
  });
}

export async function skipTask(
  assignmentId: string,
  reason: string
): Promise<TaskAssignment> {
  return apiRequest<TaskAssignment>(`/task-assignments/${assignmentId}/skip`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// Bulk task operations
export async function assignTasksForDate(
  outletId: string,
  date: string
): Promise<TaskAssignment[]> {
  return apiRequest<TaskAssignment[]>('/task-assignments/assign-for-date', {
    method: 'POST',
    body: JSON.stringify({ outletId, date }),
  });
}

export async function autoAssignTasks(
  outletId: string,
  date: string,
  options?: {
    considerWorkload?: boolean;
    considerSkills?: boolean;
  }
): Promise<TaskAssignment[]> {
  return apiRequest<TaskAssignment[]>('/task-assignments/auto-assign', {
    method: 'POST',
    body: JSON.stringify({ outletId, date, options }),
  });
}

// Task reporting
export async function generateTaskCompletionReport(
  outletId: string,
  startDate: string,
  endDate: string
): Promise<TaskCompletionReport> {
  const params = new URLSearchParams();
  params.append('outletId', outletId);
  params.append('startDate', startDate);
  params.append('endDate', endDate);

  return apiRequest<TaskCompletionReport>(`/task-assignments/report?${params.toString()}`);
}

export async function getStaffWorkload(
  staffId: string,
  date: string
): Promise<{
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  totalEstimatedDuration: number;
  actualDuration?: number;
  workloadPercent: number;
}> {
  return apiRequest(`/task-assignments/workload/${staffId}?date=${date}`);
}

// Task Assignment Engine
export class TaskAssignmentEngine {
  /**
   * Calculate task priority score
   */
  static calculatePriorityScore(
    priority: 'low' | 'medium' | 'high' | 'urgent',
    dueDate?: string,
    dueTime?: string
  ): number {
    const priorityScores = { low: 1, medium: 2, high: 3, urgent: 4 };
    let score = priorityScores[priority] * 10;
    
    if (dueDate && dueTime) {
      const due = new Date(`${dueDate}T${dueTime}`);
      const now = new Date();
      const hoursUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue < 0) {
        score += 20; // Overdue
      } else if (hoursUntilDue < 2) {
        score += 15; // Due within 2 hours
      } else if (hoursUntilDue < 8) {
        score += 10; // Due within 8 hours
      }
    }
    
    return score;
  }

  /**
   * Assign tasks based on staff availability and workload
   */
  static assignTasksToStaff(
    tasks: StaffTask[],
    staff: Array<{
      staffId: string;
      role: string;
      currentWorkload: number;
      maxWorkload: number;
    }>
  ): Array<{ taskId: string; staffId: string }> {
    const assignments: Array<{ taskId: string; staffId: string }> = [];
    
    // Sort tasks by priority
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    for (const task of sortedTasks) {
      // Find eligible staff (matching role)
      const eligibleStaff = staff.filter(s => 
        s.role === task.role && 
        s.currentWorkload + task.estimatedDuration <= s.maxWorkload
      );
      
      if (eligibleStaff.length > 0) {
        // Assign to staff with lowest current workload
        const selectedStaff = eligibleStaff.reduce((min, current) => 
          current.currentWorkload < min.currentWorkload ? current : min
        );
        
        assignments.push({
          taskId: task.id,
          staffId: selectedStaff.staffId,
        });
        
        // Update workload
        const staffIndex = staff.findIndex(s => s.staffId === selectedStaff.staffId);
        if (staffIndex >= 0) {
          staff[staffIndex].currentWorkload += task.estimatedDuration;
        }
      }
    }
    
    return assignments;
  }

  /**
   * Calculate completion rate
   */
  static calculateCompletionRate(
    completedTasks: number,
    totalTasks: number
  ): number {
    if (totalTasks === 0) return 100;
    return (completedTasks / totalTasks) * 100;
  }

  /**
   * Identify overdue tasks
   */
  static identifyOverdueTasks(assignments: TaskAssignment[]): TaskAssignment[] {
    const now = new Date();
    
    return assignments.filter(assignment => {
      if (assignment.status === 'completed' || assignment.status === 'skipped') {
        return false;
      }
      
      if (assignment.dueDate && assignment.dueTime) {
        const due = new Date(`${assignment.dueDate}T${assignment.dueTime}`);
        return due < now;
      }
      
      return false;
    });
  }

  /**
   * Calculate task efficiency
   */
  static calculateTaskEfficiency(
    estimatedDuration: number,
    actualDuration: number
  ): {
    efficiency: number;
    variance: number;
    variancePercent: number;
    isEfficient: boolean;
  } {
    const variance = actualDuration - estimatedDuration;
    const variancePercent = (variance / estimatedDuration) * 100;
    const efficiency = Math.max(0, 100 - Math.abs(variancePercent));
    const isEfficient = Math.abs(variancePercent) <= 20;
    
    return {
      efficiency,
      variance,
      variancePercent,
      isEfficient,
    };
  }

  /**
   * Generate task schedule for a day
   */
  static generateDailySchedule(
    tasks: StaffTask[],
    assignments: TaskAssignment[],
    date: string
  ): Array<{
    timeSlot: string;
    tasks: Array<{
      taskName: string;
      staffId: string;
      staffName: string;
      duration: number;
      priority: string;
    }>;
  }> {
    const schedule: Map<string, Array<{
      taskName: string;
      staffId: string;
      staffName: string;
      duration: number;
      priority: string;
    }>> = new Map();
    
    // Initialize time slots (every 30 minutes)
    for (let hour = 6; hour <= 22; hour++) {
      schedule.set(`${hour}:00`, []);
      schedule.set(`${hour}:30`, []);
    }
    
    // Assign tasks to time slots based on due time
    for (const assignment of assignments) {
      const task = tasks.find(t => t.id === assignment.taskId);
      if (!task) continue;
      
      const timeSlot = task.dueTime || '12:00';
      const existingTasks = schedule.get(timeSlot) || [];
      
      existingTasks.push({
        taskName: task.taskName,
        staffId: assignment.staffId,
        staffName: `Staff ${assignment.staffId}`, // This would come from staff data
        duration: task.estimatedDuration,
        priority: task.priority,
      });
      
      schedule.set(timeSlot, existingTasks);
    }
    
    // Convert to array
    return Array.from(schedule.entries()).map(([timeSlot, tasks]) => ({
      timeSlot,
      tasks,
    })).filter(slot => slot.tasks.length > 0);
  }

  /**
   * Generate task insights
   */
  static generateTaskInsights(
    report: TaskCompletionReport
  ): string[] {
    const insights: string[] = [];
    
    if (report.completionRate < 80) {
      insights.push(`Low completion rate (${report.completionRate.toFixed(1)}%) - investigate task barriers`);
    } else if (report.completionRate >= 95) {
      insights.push('Excellent task completion rate');
    }
    
    if (report.overdueTasks > report.totalTasks * 0.1) {
      insights.push('High overdue task rate - review task priorities and scheduling');
    }
    
    if (report.averageCompletionTime > 60) {
      insights.push('Tasks taking longer than expected - review task estimates');
    }
    
    const lowPerformers = report.byStaff.filter(s => s.completionRate < 70);
    if (lowPerformers.length > 0) {
      insights.push(`${lowPerformers.length} staff members below 70% completion rate`);
    }
    
    return insights;
  }

  /**
   * Optimize task assignment
   */
  static optimizeAssignment(
    tasks: StaffTask[],
    staff: Array<{
      staffId: string;
      role: string;
      skills: string[];
      hourlyRate: number;
    }>,
    assignments: TaskAssignment[]
  ): {
    optimizedAssignments: Array<{ taskId: string; staffId: string }>;
    estimatedCostSavings: number;
    efficiencyImprovement: number;
  } {
    // Current assignments
    const currentAssignments = assignments.length;
    const currentCost = assignments.reduce((sum, a) => {
      const task = tasks.find(t => t.id === a.taskId);
      const staffMember = staff.find(s => s.staffId === a.staffId);
      if (!task || !staffMember) return sum;
      return sum + (task.estimatedDuration / 60) * staffMember.hourlyRate;
    }, 0);
    
    // Optimized assignments (same logic for now, but could be enhanced)
    const optimizedAssignments = this.assignTasksToStaff(tasks, staff.map(s => ({
      ...s,
      currentWorkload: 0,
      maxWorkload: 480, // 8 hours in minutes
    })));
    
    const optimizedCost = optimizedAssignments.reduce((sum, a) => {
      const task = tasks.find(t => t.id === a.taskId);
      const staffMember = staff.find(s => s.staffId === a.staffId);
      if (!task || !staffMember) return sum;
      return sum + (task.estimatedDuration / 60) * staffMember.hourlyRate;
    }, 0);
    
    const costSavings = currentCost - optimizedCost;
    const efficiencyImprovement = currentAssignments > 0 
      ? ((optimizedAssignments.length - currentAssignments) / currentAssignments) * 100 
      : 0;
    
    return {
      optimizedAssignments,
      estimatedCostSavings: Math.max(0, costSavings),
      efficiencyImprovement,
    };
  }

  /**
   * Validate task assignment
   */
  static validateAssignment(
    assignment: Partial<TaskAssignment>,
    task?: StaffTask
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!assignment.taskId) {
      errors.push('Task ID is required');
    }
    if (!assignment.staffId) {
      errors.push('Staff ID is required');
    }
    if (!assignment.assignedDate) {
      errors.push('Assigned date is required');
    }
    
    if (task && assignment.dueDate && assignment.assignedDate) {
      const assigned = new Date(assignment.assignedDate);
      const due = new Date(assignment.dueDate);
      
      if (due < assigned) {
        errors.push('Due date cannot be before assigned date');
      }
      
      const daysDiff = (due.getTime() - assigned.getTime()) / (1000 * 60 * 60 * 24);
      if (daysDiff > 7) {
        warnings.push('Task due date is more than 7 days after assignment');
      }
    }
    
    if (task && task.priority === 'urgent' && !assignment.dueTime) {
      warnings.push('Urgent task should have a specific due time');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate task summary
   */
  static generateSummary(report: TaskCompletionReport): {
    totalTasks: number;
    completionRate: string;
    averageTime: string;
    status: 'excellent' | 'good' | 'fair' | 'poor';
    topPerformer: string;
    insights: string[];
  } {
    const totalTasks = report.totalTasks;
    const completionRate = `${report.completionRate.toFixed(1)}%`;
    const averageTime = `${report.averageCompletionTime.toFixed(1)} min`;
    
    let status: 'excellent' | 'good' | 'fair' | 'poor';
    if (report.completionRate >= 95) {
      status = 'excellent';
    } else if (report.completionRate >= 80) {
      status = 'good';
    } else if (report.completionRate >= 60) {
      status = 'fair';
    } else {
      status = 'poor';
    }
    
    const topPerformer = report.byStaff.reduce((best, current) => 
      current.completionRate > best.completionRate ? current : best
    );
    
    const insights = this.generateTaskInsights(report);
    
    return {
      totalTasks,
      completionRate,
      averageTime,
      status,
      topPerformer: topPerformer.staffName,
      insights,
    };
  }
}

// Export singleton instance
export const taskAssignmentEngine = TaskAssignmentEngine;
