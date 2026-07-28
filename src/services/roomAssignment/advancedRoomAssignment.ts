/**
 * Advanced Room Assignment Algorithm
 * Intelligent room assignment based on guest preferences, operational efficiency, and revenue optimization
 */

interface GuestPreferences {
  roomType: string;
  bedConfiguration: 'king' | 'queen' | 'twin' | 'double';
  floorPreference?: number;
  viewPreference?: 'ocean' | 'city' | 'garden' | 'mountain';
  accessibility: boolean;
  smoking: boolean;
  connectingRooms: boolean;
  quietRoom: boolean;
  highFloor: boolean;
  nearElevator: boolean;
}

interface Room {
  id: string;
  roomNumber: string;
  roomType: string;
  floor: number;
  bedConfiguration: 'king' | 'queen' | 'twin' | 'double';
  view: 'ocean' | 'city' | 'garden' | 'mountain';
  accessibility: boolean;
  smoking: boolean;
  connectingRoomId?: string;
  quiet: boolean;
  nearElevator: boolean;
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
  housekeepingStatus: 'clean' | 'dirty' | 'in_progress';
  lastGuestRating: number;
  maintenanceScore: number;
}

interface AssignmentScore {
  room: Room;
  score: number;
  factors: {
    preferenceMatch: number;
    operationalEfficiency: number;
    guestSatisfaction: number;
    revenueOptimization: number;
  };
  reasons: string[];
}

interface AssignmentResult {
  assignedRoom: Room;
  alternativeRooms: Room[];
  confidence: number;
  reasons: string[];
}

class AdvancedRoomAssignment {
  private rooms: Room[];
  private weights = {
    preferenceMatch: 0.4,
    operationalEfficiency: 0.3,
    guestSatisfaction: 0.2,
    revenueOptimization: 0.1
  };

  constructor(rooms: Room[]) {
    this.rooms = rooms;
  }

  /**
   * Assign best room based on guest preferences and operational constraints
   */
  assignRoom(
    preferences: GuestPreferences,
    checkInDate: Date,
    checkOutDate: Date,
    excludeRoomIds: string[] = []
  ): AssignmentResult {
    const availableRooms = this.getAvailableRooms(checkInDate, checkOutDate, excludeRoomIds);
    const scoredRooms = this.scoreRooms(preferences, availableRooms);
    
    if (scoredRooms.length === 0) {
      throw new Error('No suitable rooms available for the given criteria');
    }

    const sortedRooms = scoredRooms.sort((a, b) => b.score - a.score);
    const bestMatch = sortedRooms[0];
    const alternatives = sortedRooms.slice(1, 4).map(s => s.room);

    return {
      assignedRoom: bestMatch.room,
      alternativeRooms: alternatives,
      confidence: this.calculateConfidence(bestMatch.score),
      reasons: bestMatch.reasons
    };
  }

  /**
   * Get available rooms for the given date range
   */
  private getAvailableRooms(
    checkInDate: Date,
    checkOutDate: Date,
    excludeRoomIds: string[]
  ): Room[] {
    return this.rooms.filter(room => {
      // Exclude specified rooms
      if (excludeRoomIds.includes(room.id)) return false;
      
      // Check room status
      if (room.status !== 'available') return false;
      
      // Check housekeeping status
      if (room.housekeepingStatus !== 'clean') return false;
      
      // Check for existing reservations (this would need to query the database)
      // For now, we'll assume all available rooms are actually available
      
      return true;
    });
  }

  /**
   * Score rooms based on multiple factors
   */
  private scoreRooms(preferences: GuestPreferences, rooms: Room[]): AssignmentScore[] {
    return rooms.map(room => {
      const preferenceMatch = this.calculatePreferenceMatch(preferences, room);
      const operationalEfficiency = this.calculateOperationalEfficiency(room);
      const guestSatisfaction = this.calculateGuestSatisfaction(room);
      const revenueOptimization = this.calculateRevenueOptimization(preferences, room);

      const score =
        preferenceMatch * this.weights.preferenceMatch +
        operationalEfficiency * this.weights.operationalEfficiency +
        guestSatisfaction * this.weights.guestSatisfaction +
        revenueOptimization * this.weights.revenueOptimization;

      const reasons = this.generateReasons(
        preferences,
        room,
        preferenceMatch,
        operationalEfficiency,
        guestSatisfaction,
        revenueOptimization
      );

      return {
        room,
        score,
        factors: {
          preferenceMatch,
          operationalEfficiency,
          guestSatisfaction,
          revenueOptimization
        },
        reasons
      };
    });
  }

  /**
   * Calculate how well the room matches guest preferences
   */
  private calculatePreferenceMatch(preferences: GuestPreferences, room: Room): number {
    let score = 0;
    let maxScore = 0;

    // Room type match
    maxScore += 25;
    if (room.roomType === preferences.roomType) {
      score += 25;
    }

    // Bed configuration match
    maxScore += 20;
    if (room.bedConfiguration === preferences.bedConfiguration) {
      score += 20;
    }

    // View preference
    maxScore += 15;
    if (preferences.viewPreference && room.view === preferences.viewPreference) {
      score += 15;
    } else if (!preferences.viewPreference) {
      score += 10; // Neutral if no preference
    }

    // Accessibility requirement
    maxScore += 15;
    if (preferences.accessibility && room.accessibility) {
      score += 15;
    } else if (!preferences.accessibility) {
      score += 15;
    } else {
      score += 0;
    }

    // Smoking preference
    maxScore += 10;
    if (preferences.smoking === room.smoking) {
      score += 10;
    }

    // Connecting rooms
    maxScore += 10;
    if (preferences.connectingRooms && room.connectingRoomId) {
      score += 10;
    } else if (!preferences.connectingRooms) {
      score += 10;
    }

    // Quiet room preference
    maxScore += 5;
    if (preferences.quietRoom && room.quiet) {
      score += 5;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Calculate operational efficiency score
   */
  private calculateOperationalEfficiency(room: Room): number {
    let score = 0;
    let maxScore = 0;

    // Floor efficiency (lower floors are easier for housekeeping)
    maxScore += 30;
    if (room.floor <= 3) {
      score += 30;
    } else if (room.floor <= 6) {
      score += 20;
    } else {
      score += 10;
    }

    // Near elevator efficiency
    maxScore += 20;
    if (room.nearElevator) {
      score += 20;
    }

    // Maintenance score (rooms with better maintenance scores are preferred)
    maxScore += 30;
    score += (room.maintenanceScore / 10) * 30;

    // Room status stability
    maxScore += 20;
    score += 20; // All available rooms are considered stable

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Calculate guest satisfaction potential
   */
  private calculateGuestSatisfaction(room: Room): number {
    let score = 0;
    let maxScore = 0;

    // Last guest rating
    maxScore += 50;
    score += (room.lastGuestRating / 5) * 50;

    // Room quality indicators
    maxScore += 30;
    if (room.quiet) score += 15;
    if (room.view === 'ocean' || room.view === 'mountain') score += 15;

    // Maintenance quality
    maxScore += 20;
    score += (room.maintenanceScore / 10) * 20;

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Calculate revenue optimization score
   */
  private calculateRevenueOptimization(preferences: GuestPreferences, room: Room): number {
    let score = 0;
    let maxScore = 0;

    // Premium room types should be prioritized for upselling
    maxScore += 40;
    const premiumRoomTypes = ['suite', 'deluxe', 'penthouse', 'ocean_view'];
    if (premiumRoomTypes.some(type => room.roomType.toLowerCase().includes(type))) {
      score += 40;
    } else {
      score += 20;
    }

    // View-based pricing
    maxScore += 30;
    if (room.view === 'ocean' || room.view === 'mountain') {
      score += 30;
    } else if (room.view === 'city') {
      score += 20;
    } else {
      score += 10;
    }

    // Floor-based pricing (higher floors often command premium)
    maxScore += 30;
    if (room.floor >= 5) {
      score += 30;
    } else if (room.floor >= 3) {
      score += 20;
    } else {
      score += 10;
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  /**
   * Generate human-readable reasons for the assignment
   */
  private generateReasons(
    preferences: GuestPreferences,
    room: Room,
    preferenceMatch: number,
    operationalEfficiency: number,
    guestSatisfaction: number,
    revenueOptimization: number
  ): string[] {
    const reasons: string[] = [];

    if (preferenceMatch > 0.8) {
      reasons.push('Excellent match to guest preferences');
    } else if (preferenceMatch > 0.6) {
      reasons.push('Good match to guest preferences');
    }

    if (operationalEfficiency > 0.8) {
      reasons.push('High operational efficiency');
    }

    if (guestSatisfaction > 0.8) {
      reasons.push('High guest satisfaction potential');
    }

    if (room.lastGuestRating >= 4.5) {
      reasons.push(`Excellent guest rating (${room.lastGuestRating}/5)`);
    }

    if (room.view === 'ocean') {
      reasons.push('Premium ocean view');
    }

    if (room.quiet) {
      reasons.push('Quiet location');
    }

    if (room.nearElevator) {
      reasons.push('Convenient elevator access');
    }

    if (preferences.accessibility && room.accessibility) {
      reasons.push('Meets accessibility requirements');
    }

    return reasons;
  }

  /**
   * Calculate confidence score for the assignment
   */
  private calculateConfidence(score: number): number {
    // Normalize score to 0-100 range
    return Math.min(100, Math.max(0, score * 100));
  }

  /**
   * Batch assign rooms for multiple guests
   */
  batchAssignRooms(
    assignments: Array<{
      preferences: GuestPreferences;
      checkInDate: Date;
      checkOutDate: Date;
    }>
  ): Array<{
    preferences: GuestPreferences;
    result: AssignmentResult;
  }> {
    const assignedRoomIds: string[] = [];
    const results: Array<{
      preferences: GuestPreferences;
      result: AssignmentResult;
    }> = [];

    // Sort by check-in date (earlier check-ins get priority)
    const sortedAssignments = [...assignments].sort((a, b) => 
      a.checkInDate.getTime() - b.checkInDate.getTime()
    );

    for (const assignment of sortedAssignments) {
      try {
        const result = this.assignRoom(
          assignment.preferences,
          assignment.checkInDate,
          assignment.checkOutDate,
          assignedRoomIds
        );
        assignedRoomIds.push(result.assignedRoom.id);
        results.push({
          preferences: assignment.preferences,
          result
        });
      } catch (error) {
        // Handle assignment failure
        console.error('Failed to assign room:', error);
        results.push({
          preferences: assignment.preferences,
          result: {
            assignedRoom: {} as Room,
            alternativeRooms: [],
            confidence: 0,
            reasons: ['No suitable room available']
          }
        });
      }
    }

    return results;
  }

  /**
   * Reassign room if better option becomes available
   */
  reassignRoom(
    currentRoomId: string,
    preferences: GuestPreferences,
    checkInDate: Date,
    checkOutDate: Date
  ): AssignmentResult {
    const excludeRoomIds = [currentRoomId];
    return this.assignRoom(preferences, checkInDate, checkOutDate, excludeRoomIds);
  }

  /**
   * Update weights for scoring algorithm
   */
  updateWeights(weights: Partial<typeof this.weights>): void {
    this.weights = { ...this.weights, ...weights };
  }

  /**
   * Get assignment statistics
   */
  getAssignmentStats(
    assignments: AssignmentResult[]
  ): {
    totalAssignments: number;
    avgConfidence: number;
    highConfidenceCount: number;
    preferenceSatisfactionRate: number;
  } {
    const totalAssignments = assignments.length;
    const avgConfidence = assignments.reduce((sum, a) => sum + a.confidence, 0) / totalAssignments;
    const highConfidenceCount = assignments.filter(a => a.confidence >= 80).length;
    const preferenceSatisfactionRate = assignments.filter(a => 
      a.reasons.some(r => r.includes('match to guest preferences'))
    ).length / totalAssignments;

    return {
      totalAssignments,
      avgConfidence,
      highConfidenceCount,
      preferenceSatisfactionRate
    };
  }
}

export default AdvancedRoomAssignment;
export type { GuestPreferences, Room, AssignmentResult, AssignmentScore };
