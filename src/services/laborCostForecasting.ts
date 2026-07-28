/**
 * Labor Cost Forecasting Service
 * Phase 2.1: AI-powered labor cost forecasting for operations
 */

export interface ForecastParameters {
  department: string;
  periodStart: string;
  periodEnd: string;
  historicalData?: HistoricalLaborData[];
  occupancyForecast?: number;
  seasonalityFactor?: number;
  specialEvents?: SpecialEvent[];
}

export interface HistoricalLaborData {
  period: string;
  laborCost: number;
  revenue: number;
  staffCount: number;
  hoursWorked: number;
  occupancy: number;
}

export interface SpecialEvent {
  date: string;
  name: string;
  type: 'conference' | 'wedding' | 'holiday' | 'seasonal' | 'other';
  expectedGuests: number;
  laborImpact: number; // Multiplier for labor needs
}

export interface LaborCostForecast {
  department: string;
  periodStart: string;
  periodEnd: string;
  projectedLaborCost: number;
  projectedStaffCount: number;
  projectedHours: number;
  budget: number;
  variance: number;
  variancePercent: number;
  confidenceLevel: number;
  drivers: ForecastDriver[];
  recommendations: string[];
}

export interface ForecastDriver {
  category: string;
  impact: number;
  description: string;
  weight: number;
}

/**
 * Main forecasting function
 * Generates labor cost forecast based on historical data and future projections
 */
export function generateLaborCostForecast(params: ForecastParameters): LaborCostForecast {
  const {
    department,
    periodStart,
    periodEnd,
    historicalData = [],
    occupancyForecast = 70,
    seasonalityFactor = 1.0,
    specialEvents = []
  } = params;

  // Calculate base forecast from historical data
  const baseForecast = calculateBaseForecast(historicalData);
  
  // Apply occupancy adjustment
  const occupancyAdjustment = calculateOccupancyAdjustment(
    baseForecast,
    occupancyForecast
  );
  
  // Apply seasonality factor
  const seasonalityAdjustment = occupancyAdjustment * seasonalityFactor;
  
  // Apply special event impacts
  const eventAdjustment = calculateEventImpact(
    seasonalityAdjustment,
    specialEvents,
    periodStart,
    periodEnd
  );
  
  const projectedLaborCost = eventAdjustment;
  
  // Calculate projected staff count and hours
  const projectedStaffCount = calculateProjectedStaffCount(
    projectedLaborCost,
    department
  );
  const projectedHours = calculateProjectedHours(projectedStaffCount);
  
  // Get budget (this would typically come from database)
  const budget = getBudgetForPeriod(department, periodStart, periodEnd);
  
  // Calculate variance
  const variance = projectedLaborCost - budget;
  const variancePercent = budget > 0 ? (variance / budget) * 100 : 0;
  
  // Calculate confidence level
  const confidenceLevel = calculateConfidenceLevel(
    historicalData.length,
    specialEvents.length
  );
  
  // Identify key drivers
  const drivers = identifyForecastDrivers({
    baseForecast,
    occupancyForecast,
    seasonalityFactor,
    specialEvents,
    projectedLaborCost
  });
  
  // Generate recommendations
  const recommendations = generateForecastRecommendations({
    variance,
    variancePercent,
    drivers,
    confidenceLevel
  });

  return {
    department,
    periodStart,
    periodEnd,
    projectedLaborCost,
    projectedStaffCount,
    projectedHours,
    budget,
    variance,
    variancePercent,
    confidenceLevel,
    drivers,
    recommendations
  };
}

/**
 * Calculate base forecast from historical data
 */
function calculateBaseForecast(historicalData: HistoricalLaborData[]): number {
  if (historicalData.length === 0) {
    // Default to $50,000 if no historical data
    return 50000;
  }

  // Calculate average labor cost from historical data
  const totalLaborCost = historicalData.reduce((sum, data) => sum + data.laborCost, 0);
  const averageLaborCost = totalLaborCost / historicalData.length;

  // Apply 5% growth trend
  return averageLaborCost * 1.05;
}

/**
 * Calculate occupancy adjustment factor
 */
function calculateOccupancyAdjustment(
  baseForecast: number,
  occupancyForecast: number
): number {
  // Base occupancy assumed to be 70%
  const baseOccupancy = 70;
  
  // Calculate adjustment factor
  // If occupancy is higher than base, increase labor cost proportionally
  const occupancyRatio = occupancyForecast / baseOccupancy;
  
  return baseForecast * occupancyRatio;
}

/**
 * Calculate special event impact
 */
function calculateEventImpact(
  currentForecast: number,
  specialEvents: SpecialEvent[],
  periodStart: string,
  periodEnd: string
): number {
  if (specialEvents.length === 0) {
    return currentForecast;
  }

  // Filter events within the forecast period
  const periodEvents = specialEvents.filter(event => {
    return event.date >= periodStart && event.date <= periodEnd;
  });

  if (periodEvents.length === 0) {
    return currentForecast;
  }

  // Calculate total labor impact
  const totalImpact = periodEvents.reduce((sum, event) => sum + event.laborImpact, 0);
  
  // Apply impact (average multiplier)
  const averageImpact = totalImpact / periodEvents.length;
  
  return currentForecast * averageImpact;
}

/**
 * Calculate projected staff count based on labor cost
 */
function calculateProjectedStaffCount(
  laborCost: number,
  department: string
): number {
  // Average hourly rate by department
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

  const hourlyRate = hourlyRates[department] || 18;
  
  // Assume 160 hours per month per staff member
  const hoursPerStaff = 160;
  
  const totalHours = laborCost / hourlyRate;
  const staffCount = Math.ceil(totalHours / hoursPerStaff);
  
  return staffCount;
}

/**
 * Calculate projected hours based on staff count
 */
function calculateProjectedHours(staffCount: number): number {
  return staffCount * 160; // 160 hours per month per staff
}

/**
 * Get budget for a specific period
 * This would typically come from the database
 */
function getBudgetForPeriod(
  department: string,
  periodStart: string,
  periodEnd: string
): number {
  // Default budgets by department per month
  const defaultBudgets: Record<string, number> = {
    'FrontOffice': 45000,
    'Housekeeping': 35000,
    'FandB': 40000,
    'Maintenance': 30000,
    'HR': 25000,
    'Procurement': 28000,
    'SalesEvents': 32000,
    'GuestPortal': 20000
  };

  return defaultBudgets[department] || 35000;
}

/**
 * Calculate confidence level based on data availability
 */
function calculateConfidenceLevel(
  historicalDataPoints: number,
  specialEventCount: number
): number {
  let confidence = 75; // Base confidence

  // More historical data increases confidence
  if (historicalDataPoints >= 12) {
    confidence += 15;
  } else if (historicalDataPoints >= 6) {
    confidence += 10;
  } else if (historicalDataPoints >= 3) {
    confidence += 5;
  }

  // More special events decrease confidence (harder to predict)
  confidence -= specialEventCount * 5;

  return Math.max(20, Math.min(95, confidence));
}

/**
 * Identify key drivers of the forecast
 */
function identifyForecastDrivers(params: {
  baseForecast: number;
  occupancyForecast: number;
  seasonalityFactor: number;
  specialEvents: SpecialEvent[];
  projectedLaborCost: number;
}): ForecastDriver[] {
  const {
    baseForecast,
    occupancyForecast,
    seasonalityFactor,
    specialEvents,
    projectedLaborCost
  } = params;

  const drivers: ForecastDriver[] = [];

  // Historical trend driver
  const historicalImpact = ((projectedLaborCost - baseForecast) / baseForecast) * 100;
  drivers.push({
    category: 'Historical Trend',
    impact: historicalImpact,
    description: `Based on historical labor cost patterns`,
    weight: 0.4
  });

  // Occupancy driver
  const occupancyImpact = (occupancyForecast - 70) * 0.5; // 0.5% impact per 1% occupancy change
  drivers.push({
    category: 'Occupancy Forecast',
    impact: occupancyImpact,
    description: `Projected occupancy at ${occupancyForecast}%`,
    weight: 0.3
  });

  // Seasonality driver
  if (seasonalityFactor !== 1.0) {
    const seasonalityImpact = (seasonalityFactor - 1) * 100;
    drivers.push({
      category: 'Seasonality',
      impact: seasonalityImpact,
      description: `Seasonal factor of ${seasonalityFactor}x`,
      weight: 0.2
    });
  }

  // Special events driver
  if (specialEvents.length > 0) {
    const eventImpact = specialEvents.reduce((sum, event) => sum + (event.laborImpact - 1) * 100, 0);
    drivers.push({
      category: 'Special Events',
      impact: eventImpact,
      description: `${specialEvents.length} special events scheduled`,
      weight: 0.1
    });
  }

  return drivers;
}

/**
 * Generate actionable recommendations based on forecast
 */
function generateForecastRecommendations(params: {
  variance: number;
  variancePercent: number;
  drivers: ForecastDriver[];
  confidenceLevel: number;
}): string[] {
  const { variance, variancePercent, drivers, confidenceLevel } = params;
  const recommendations: string[] = [];

  // Budget variance recommendations
  if (variancePercent > 10) {
    recommendations.push(
      `Forecast exceeds budget by ${variancePercent.toFixed(1)}%. Consider adjusting staffing levels or requesting budget revision.`
    );
  } else if (variancePercent < -10) {
    recommendations.push(
      `Forecast is under budget by ${Math.abs(variancePercent).toFixed(1)}%. Opportunity to reallocate resources or improve service levels.`
    );
  }

  // Driver-specific recommendations
  const occupancyDriver = drivers.find(d => d.category === 'Occupancy Forecast');
  if (occupancyDriver && occupancyDriver.impact > 15) {
    recommendations.push(
      'High occupancy forecast driving labor costs up. Consider temporary staff or overtime authorization.'
    );
  }

  const seasonalityDriver = drivers.find(d => d.category === 'Seasonality');
  if (seasonalityDriver && seasonalityDriver.impact > 20) {
    recommendations.push(
      'Peak season conditions expected. Ensure adequate staffing and review service level agreements.'
    );
  }

  const eventsDriver = drivers.find(d => d.category === 'Special Events');
  if (eventsDriver && eventsDriver.impact > 10) {
    recommendations.push(
      'Special events will increase labor requirements. Plan for additional staffing and resource allocation.'
    );
  }

  // Confidence level recommendations
  if (confidenceLevel < 60) {
    recommendations.push(
      'Low forecast confidence due to limited historical data. Monitor actuals closely and update forecast frequently.'
    );
  }

  // General optimization recommendations
  recommendations.push(
    'Review staffing patterns and consider cross-training to improve flexibility.'
  );
  recommendations.push(
    'Monitor key performance indicators (KPIs) and adjust staffing based on real-time demand.'
  );

  return recommendations;
}

/**
 * Generate multi-period forecast
 * Useful for quarterly or annual planning
 */
export function generateMultiPeriodForecast(
  department: string,
  periods: Array<{ start: string; end: string }>,
  historicalData: HistoricalLaborData[],
  occupancyForecasts: number[],
  seasonalityFactors: number[]
): LaborCostForecast[] {
  return periods.map((period, index) => {
    return generateLaborCostForecast({
      department,
      periodStart: period.start,
      periodEnd: period.end,
      historicalData,
      occupancyForecast: occupancyForecasts[index] || 70,
      seasonalityFactor: seasonalityFactors[index] || 1.0
    });
  });
}

/**
 * Compare forecast vs actuals
 * Used for continuous improvement of forecasting accuracy
 */
export function compareForecastVsActuals(
  forecast: LaborCostForecast,
  actualLaborCost: number,
  actualStaffCount: number,
  actualHours: number
): {
  costVariance: number;
  costVariancePercent: number;
  staffVariance: number;
  staffVariancePercent: number;
  hoursVariance: number;
  accuracyScore: number;
  insights: string[];
} {
  const costVariance = actualLaborCost - forecast.projectedLaborCost;
  const costVariancePercent = (costVariance / forecast.projectedLaborCost) * 100;
  
  const staffVariance = actualStaffCount - forecast.projectedStaffCount;
  const staffVariancePercent = (staffVariance / forecast.projectedStaffCount) * 100;
  
  const hoursVariance = actualHours - forecast.projectedHours;
  
  // Calculate accuracy score (100 = perfect forecast)
  const accuracyScore = 100 - Math.abs(costVariancePercent);
  
  const insights: string[] = [];
  
  if (Math.abs(costVariancePercent) > 10) {
    insights.push(
      `Significant cost variance: ${costVariancePercent.toFixed(1)}%. Review forecast assumptions.`
    );
  }
  
  if (staffVariance > 2) {
    insights.push(
      `Staff count variance: ${staffVariance}. Review staffing efficiency and utilization.`
    );
  }
  
  if (hoursVariance > 50) {
    insights.push(
      `Hours variance: ${hoursVariance.toFixed(0)}h. Review scheduling practices and overtime usage.`
    );
  }
  
  if (accuracyScore > 90) {
    insights.push('Excellent forecast accuracy. Current forecasting model is performing well.');
  } else if (accuracyScore < 70) {
    insights.push('Forecast accuracy needs improvement. Consider adjusting forecasting parameters.');
  }

  return {
    costVariance,
    costVariancePercent,
    staffVariance,
    staffVariancePercent,
    hoursVariance,
    accuracyScore: Math.max(0, accuracyScore),
    insights
  };
}
