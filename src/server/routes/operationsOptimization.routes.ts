import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── Advanced Staff Scheduling Optimization ────────────────────────────
// Generate optimized staff schedule
router.post('/scheduling/optimize', authenticate, requirePermission('ops:schedule:optimize'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    startDate,
    days,
    staffConstraints,
    demandForecast,
  } = req.body || {};
  
  if (!propertyId || !startDate) {
    return res.status(400).json({ error: 'propertyId and startDate are required' });
  }

  // Get staff availability
  const { data: staff } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  // Get existing schedules
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (days || 7));

  const { data: existingSchedules } = await supabaseAdmin
    .from('staff_schedules')
    .select('*')
    .eq('property_id', propertyId)
    .gte('shift_date', startDate)
    .lt('shift_date', endDate.toISOString());

  // Generate optimized schedule
  const optimizedSchedule = generateOptimizedSchedule(
    staff || [],
    existingSchedules || [],
    demandForecast || [],
    staffConstraints || {},
    startDate,
    days || 7
  );

  // Save optimized schedule
  const scheduleResults = await Promise.all(
    optimizedSchedule.shifts.map(async (shift: any) => {
      const { data, error } = await supabaseAdmin.from('staff_schedules').insert({
        property_id: propertyId,
        staff_id: shift.staffId,
        shift_date: shift.date,
        start_time: shift.startTime,
        end_time: shift.endTime,
        position: shift.position,
        section: shift.section,
        status: 'scheduled',
        optimization_score: shift.score,
        created_by: req.user?.id,
        created_at: new Date().toISOString(),
      }).select().single();

      return data;
    })
  );

  // Invalidate cache
  cacheService.invalidatePattern('ops-optimization:*');

  return res.status(201).json({
    success: true,
    schedule: scheduleResults,
    summary: optimizedSchedule.summary,
  });
});

function generateOptimizedSchedule(
  staff: any[],
  existingSchedules: any[],
  demandForecast: any[],
  constraints: any,
  startDate: string,
  days: number
) {
  const shifts = [];
  const currentDate = new Date(startDate);

  for (let day = 0; day < days; day++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    // Get demand for this day
    const dayDemand = demandForecast.find(d => d.date === dateStr) || { requiredStaff: 10 };

    // Assign staff based on demand and constraints
    let assignedCount = 0;
    const availableStaff = staff.filter(s => {
      // Check if staff already scheduled
      const existingShift = existingSchedules.find(
        es => es.staff_id === s.id && es.shift_date === dateStr
      );
      return !existingShift;
    });

    // Sort by skills and preferences
    const sortedStaff = availableStaff.sort((a, b) => {
      const aScore = (a.skills?.length || 0) + (a.preference_score || 0);
      const bScore = (b.skills?.length || 0) + (b.preference_score || 0);
      return bScore - aScore;
    });

    for (const staffMember of sortedStaff) {
      if (assignedCount >= dayDemand.requiredStaff) break;

      shifts.push({
        staffId: staffMember.id,
        date: dateStr,
        startTime: '08:00',
        endTime: '17:00',
        position: staffMember.position || 'general',
        section: staffMember.section || 'main',
        score: calculateShiftScore(staffMember, dayDemand),
      });
      assignedCount++;
    }
  }

  return {
    shifts,
    summary: {
      totalShifts: shifts.length,
      avgScore: shifts.reduce((sum, s) => sum + s.score, 0) / shifts.length,
      demandMet: shifts.length >= demandForecast.reduce((sum, d) => sum + d.requiredStaff, 0),
    },
  };
}

function calculateShiftScore(staff: any, demand: any): number {
  let score = 50;

  // Skills match
  if (demand.requiredSkills && staff.skills) {
    const matchingSkills = demand.requiredSkills.filter((s: string) => 
      staff.skills.includes(s)
    ).length;
    score += matchingSkills * 10;
  }

  // Preference
  score += staff.preference_score || 0;

  return Math.min(100, score);
}

// ── Skill-Based Assignment Algorithms ────────────────────────────────
// Assign task based on staff skills
router.post('/assignment/skill-based', authenticate, requirePermission('ops:assign:skills'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    taskId,
    requiredSkills,
    priority,
  } = req.body || {};
  
  if (!propertyId || !taskId || !requiredSkills) {
    return res.status(400).json({ error: 'propertyId, taskId, and requiredSkills are required' });
  }

  // Get staff with matching skills
  const { data: staff } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  const scoredStaff = (staff || []).map((staffMember: any) => {
    let score = 0;
    const skills = staffMember.skills || [];

    // Skills matching
    const matchingSkills = requiredSkills.filter((s: string) => skills.includes(s)).length;
    score += matchingSkills * 30;

    // Skill level
    skills.forEach((skill: string) => {
      const skillLevel = staffMember.skill_levels?.[skill] || 1;
      score += skillLevel * 5;
    });

    // Experience
    score += (staffMember.experience_years || 0) * 2;

    // Current workload penalty
    // (Would fetch current workload in production)

    return {
      ...staffMember,
      assignmentScore: Math.min(100, score),
      matchingSkills,
    };
  });

  // Sort by score
  scoredStaff.sort((a, b) => b.assignmentScore - a.assignmentScore);

  const bestMatch = scoredStaff[0];

  if (!bestMatch) {
    return res.status(404).json({ error: 'No staff with required skills found' });
  }

  // Update task assignment
  const { data, error } = await supabaseAdmin
    .from('operations_tasks')
    .update({
      assigned_to: bestMatch.id,
      assigned_at: new Date().toISOString(),
      assignment_method: 'skill_based',
      skill_match_score: bestMatch.assignmentScore,
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-optimization:*');

  return res.json({
    success: true,
    task: data,
    assignedStaff: {
      id: bestMatch.id,
      name: bestMatch.name,
      score: bestMatch.assignmentScore,
      matchingSkills: bestMatch.matchingSkills,
    },
  });
});

// ── Labor Cost Forecasting ─────────────────────────────────────────────
// Generate labor cost forecast
router.post('/labor-cost-forecast', authenticate, requirePermission('ops:analytics:forecast'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    startDate,
    days,
    includeOvertime,
  } = req.body || {};
  
  if (!propertyId || !startDate) {
    return res.status(400).json({ error: 'propertyId and startDate are required' });
  }

  // Get historical labor costs
  const historicalStart = new Date(startDate);
  historicalStart.setDate(historicalStart.getDate() - 30);

  const { data: historicalCosts } = await supabaseAdmin
    .from('labor_costs')
    .select('*')
    .eq('property_id', propertyId)
    .gte('period', historicalStart.toISOString())
    .lt('period', startDate);

  // Get staffing forecasts
  const { data: staffingForecasts } = await supabaseAdmin
    .from('staffing_recommendations')
    .select('*')
    .eq('property_id', propertyId)
    .gte('recommendation_date', startDate);

  // Calculate forecast
  const avgDailyCost = (historicalCosts || []).reduce((sum, c) => sum + c.total_cost, 0) / ((historicalCosts || []).length || 1);
  
  const forecast = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < (days || 30); i++) {
    const forecastDate = new Date(currentDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const dateStr = forecastDate.toISOString().split('T')[0];

    const dayStaffing = staffingForecasts?.find(s => s.recommendation_date === dateStr);
    const staffCount = dayStaffing?.totalStaffRecommended || 10;
    const dailyCost = avgDailyCost * (staffCount / 10); // Adjust based on staffing level

    let overtimeCost = 0;
    if (includeOvertime) {
      // Estimate overtime (15% of regular time)
      overtimeCost = dailyCost * 0.15;
    }

    forecast.push({
      date: dateStr,
      regularCost: Math.round(dailyCost),
      overtimeCost: Math.round(overtimeCost),
      totalCost: Math.round(dailyCost + overtimeCost),
      staffCount,
    });
  }

  const result = {
    propertyId,
    startDate,
    days: days || 30,
    forecast,
    summary: {
      totalCost: forecast.reduce((sum, f) => sum + f.totalCost, 0),
      avgDailyCost: forecast.reduce((sum, f) => sum + f.totalCost, 0) / forecast.length,
      totalOvertimeCost: forecast.reduce((sum, f) => sum + f.overtimeCost, 0),
    },
    generatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

// ── Overtime Prediction and Prevention ───────────────────────────────
// Predict overtime risk
router.post('/overtime/predict', authenticate, requirePermission('ops:analytics:overtime'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    weekStartDate,
  } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  const startDate = weekStartDate || new Date().toISOString().split('T')[0];

  // Get current week schedules
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 7);

  const { data: schedules } = await supabaseAdmin
    .from('staff_schedules')
    .select('*')
    .eq('property_id', propertyId)
    .gte('shift_date', startDate)
    .lt('shift_date', endDate.toISOString());

  // Get historical overtime data
  const historicalStart = new Date(startDate);
  historicalStart.setDate(historicalStart.getDate() - 30);

  const { data: historicalOvertime } = await supabaseAdmin
    .from('labor_costs')
    .select('*')
    .eq('property_id', propertyId)
    .gte('period', historicalStart.toISOString())
    .lt('period', startDate);

  // Calculate overtime risk
  const riskAnalysis = calculateOvertimeRisk(
    schedules || [],
    historicalOvertime || []
  );

  const result = {
    propertyId,
    weekStartDate: startDate,
    riskAnalysis,
    recommendations: generateOvertimeRecommendations(riskAnalysis),
    generatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

function calculateOvertimeRisk(schedules: any[], historicalOvertime: any[]) {
  const riskAnalysis: any = {
    overallRisk: 'low',
    riskScore: 0,
    staffAtRisk: [],
    daysAtRisk: [],
  };

  // Calculate total scheduled hours per staff
  const hoursByStaff: Record<string, number> = {};
  schedules.forEach(schedule => {
    const start = new Date(`2000-01-01T${schedule.start_time}`);
    const end = new Date(`2000-01-01T${schedule.end_time}`);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    hoursByStaff[schedule.staff_id] = (hoursByStaff[schedule.staff_id] || 0) + hours;
  });

  // Identify staff at risk (>40 hours/week)
  Object.keys(hoursByStaff).forEach(staffId => {
    const hours = hoursByStaff[staffId];
    if (hours > 40) {
      riskAnalysis.staffAtRisk.push({
        staffId,
        hours,
        overtimeHours: hours - 40,
        riskLevel: hours > 50 ? 'critical' : 'high',
      });
      riskAnalysis.riskScore += (hours - 40) * 2;
    }
  });

  // Calculate overall risk
  if (riskAnalysis.riskScore > 50) {
    riskAnalysis.overallRisk = 'critical';
  } else if (riskAnalysis.riskScore > 20) {
    riskAnalysis.overallRisk = 'high';
  } else if (riskAnalysis.riskScore > 10) {
    riskAnalysis.overallRisk = 'medium';
  }

  return riskAnalysis;
}

function generateOvertimeRecommendations(riskAnalysis: any): string[] {
  const recommendations = [];

  if (riskAnalysis.overallRisk === 'critical') {
    recommendations.push('CRITICAL: Immediate schedule adjustments required to prevent excessive overtime');
  }

  riskAnalysis.staffAtRisk.forEach((staff: any) => {
    if (staff.riskLevel === 'critical') {
      recommendations.push(`Staff ${staff.staffId} at ${staff.hours.toFixed(1)} hours - reduce by ${staff.overtimeHours.toFixed(1)} hours`);
    }
  });

  if (riskAnalysis.staffAtRisk.length > 0) {
    recommendations.push('Consider adding temporary staff or redistributing workload');
  }

  return recommendations;
}

// ── Predictive Maintenance Integration ───────────────────────────────
// Get predictive maintenance insights
router.get('/predictive-maintenance/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `predictive-maintenance:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get assets
  const { data: assets } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('property_id', req.params.propertyId);

  // Get maintenance predictions
  const { data: predictions } = await supabaseAdmin
    .from('maintenance_predictions')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('generated_at', { ascending: false })
    .limit(1);

  // Get IoT sensor data for equipment health
  const { data: sensors } = await supabaseAdmin
    .from('iot_sensors')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('sensor_type', 'equipment_health');

  const result = {
    propertyId: req.params.propertyId,
    assets: assets || [],
    predictions: predictions?.[0]?.prediction_data?.predictions || [],
    equipmentHealth: sensors || [],
    summary: {
      totalAssets: (assets || []).length,
      requiringMaintenance: (assets || []).filter(a => a.requires_maintenance).length,
      criticalPredictions: predictions?.[0]?.prediction_data?.predictions?.filter((p: any) => p.riskLevel === 'critical').length || 0,
    },
    generatedAt: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 10 * 60 * 1000);
  return res.json(result);
});

// ── Equipment Health Monitoring ─────────────────────────────────────────
// Get equipment health status
router.get('/equipment-health/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `equipment-health:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  // Get equipment health sensors
  const { data: sensors } = await supabaseAdmin
    .from('iot_sensors')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('sensor_type', 'equipment_health');

  // Get recent readings
  const sensorIds = sensors?.map(s => s.sensor_id) || [];
  const hoursAgo = new Date();
  hoursAgo.setHours(hoursAgo.getHours() - 24);

  const { data: readings } = await supabaseAdmin
    .from('sensor_readings')
    .select('*')
    .in('sensor_id', sensorIds)
    .gte('timestamp', hoursAgo.toISOString())
    .order('timestamp', { ascending: false });

  // Aggregate health status
  const equipmentHealth = aggregateEquipmentHealth(sensors || [], readings || []);

  const result = {
    propertyId: req.params.propertyId,
    equipmentHealth,
    summary: {
      totalEquipment: equipmentHealth.length,
      healthy: equipmentHealth.filter(e => e.status === 'healthy').length,
      warning: equipmentHealth.filter(e => e.status === 'warning').length,
      critical: equipmentHealth.filter(e => e.status === 'critical').length,
    },
    timestamp: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

function aggregateEquipmentHealth(sensors: any[], readings: any[]) {
  const healthMap: Record<string, any> = {};

  sensors.forEach(sensor => {
    healthMap[sensor.sensor_id] = {
      sensorId: sensor.sensor_id,
      equipment: sensor.equipment_id,
      location: sensor.location,
      status: 'healthy',
      healthScore: 100,
      lastReading: null,
      alerts: [],
    };
  });

  readings.forEach(reading => {
    const sensorHealth = healthMap[reading.sensor_id];
    if (!sensorHealth) return;

    sensorHealth.lastReading = reading.timestamp;

    Object.keys(reading.readings).forEach(key => {
      const value = reading.readings[key];
      // Simplified health calculation
      if (key === 'vibration' && value > 10) {
        sensorHealth.healthScore -= 20;
        sensorHealth.alerts.push(`High vibration: ${value}`);
      }
      if (key === 'temperature' && value > 80) {
        sensorHealth.healthScore -= 15;
        sensorHealth.alerts.push(`High temperature: ${value}°C`);
      }
      if (key === 'pressure' && (value < 0.8 || value > 1.2)) {
        sensorHealth.healthScore -= 10;
        sensorHealth.alerts.push(`Abnormal pressure: ${value}`);
      }
    });
  });

  // Determine status
  Object.values(healthMap).forEach((health: any) => {
    if (health.healthScore < 50) {
      health.status = 'critical';
    } else if (health.healthScore < 80) {
      health.status = 'warning';
    }
  });

  return Object.values(healthMap);
}

// ── Automated Work Order Generation ───────────────────────────────────
// Generate work orders from predictive maintenance
router.post('/auto-work-orders', authenticate, requirePermission('ops:maintenance:auto'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, predictionId } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  // Get maintenance predictions
  let predictions;
  if (predictionId) {
    const { data } = await supabaseAdmin
      .from('maintenance_predictions')
      .select('*')
      .eq('id', predictionId)
      .single();
    predictions = data?.prediction_data?.predictions || [];
  } else {
    const { data } = await supabaseAdmin
      .from('maintenance_predictions')
      .select('*')
      .eq('property_id', propertyId)
      .order('generated_at', { ascending: false })
      .limit(1);
    predictions = data?.[0]?.prediction_data?.predictions || [];
  }

  // Generate work orders for critical/high risk items
  const workOrders = [];
  for (const prediction of predictions) {
    if (prediction.riskLevel === 'critical' || (prediction.riskLevel === 'high' && prediction.daysUntilDue <= 7)) {
      const { data, error } = await supabaseAdmin.from('work_orders').insert({
        property_id: propertyId,
        title: `Preventive Maintenance: ${prediction.assetName}`,
        description: `Automated work order based on predictive maintenance. ${prediction.recommendation}`,
        priority: prediction.riskLevel === 'critical' ? 'high' : 'medium',
        category: 'preventive_maintenance',
        asset_id: prediction.assetId,
        due_date: prediction.recommendedDate,
        status: 'assigned',
        generated_by: 'auto_predictive',
        created_at: new Date().toISOString(),
      }).select().single();

      if (!error && data) {
        workOrders.push(data);
      }
    }
  }

  // Invalidate cache
  cacheService.invalidatePattern('ops-optimization:*');

  return res.status(201).json({
    success: true,
    workOrdersGenerated: workOrders.length,
    workOrders,
  });
});

// ── Maintenance Vendor Performance Tracking ───────────────────────────
// Track vendor performance
router.get('/vendor-performance/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period } = req.query as Record<string, string>;
  
  const cacheKey = `vendor-performance:${req.params.propertyId}:${period || 'month'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'quarter' ? 90 : period === 'year' ? 365 : 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get work orders assigned to vendors
  const { data: workOrders } = await supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .not('vendor_id', 'is', null)
    .gte('created_at', startDate.toISOString());

  // Group by vendor
  const vendorPerformance: Record<string, any> = {};
  (workOrders || []).forEach(wo => {
    if (!vendorPerformance[wo.vendor_id]) {
      vendorPerformance[wo.vendor_id] = {
        vendorId: wo.vendor_id,
        totalWorkOrders: 0,
        completedOnTime: 0,
        completedLate: 0,
        avgResolutionTime: [],
        qualityScore: [],
      };
    }

    vendorPerformance[wo.vendor_id].totalWorkOrders += 1;

    if (wo.status === 'completed') {
      if (wo.completed_at && wo.due_date) {
        const completedOnTime = new Date(wo.completed_at) <= new Date(wo.due_date);
        if (completedOnTime) {
          vendorPerformance[wo.vendor_id].completedOnTime += 1;
        } else {
          vendorPerformance[wo.vendor_id].completedLate += 1;
        }
      }

      if (wo.created_at && wo.completed_at) {
        const resolutionHours = (new Date(wo.completed_at).getTime() - new Date(wo.created_at).getTime()) / (1000 * 60 * 60);
        vendorPerformance[wo.vendor_id].avgResolutionTime.push(resolutionHours);
      }

      if (wo.quality_score) {
        vendorPerformance[wo.vendor_id].qualityScore.push(wo.quality_score);
      }
    }
  });

  // Calculate metrics
  const performanceData = Object.values(vendorPerformance).map((vendor: any) => ({
    ...vendor,
    onTimeRate: vendor.totalWorkOrders > 0 ? (vendor.completedOnTime / vendor.totalWorkOrders) * 100 : 0,
    avgResolutionTime: vendor.avgResolutionTime.length > 0 
      ? vendor.avgResolutionTime.reduce((a, b) => a + b, 0) / vendor.avgResolutionTime.length 
      : 0,
    avgQualityScore: vendor.qualityScore.length > 0
      ? vendor.qualityScore.reduce((a, b) => a + b, 0) / vendor.qualityScore.length
      : 0,
    overallScore: calculateVendorOverallScore(vendor),
  }));

  const result = {
    propertyId: req.params.propertyId,
    period: days,
    vendorPerformance: performanceData,
    summary: {
      totalVendors: performanceData.length,
      avgOnTimeRate: performanceData.reduce((sum, v) => sum + v.onTimeRate, 0) / (performanceData.length || 1),
      topPerformer: performanceData.sort((a, b) => b.overallScore - a.overallScore)[0],
    },
  };

  cacheService.set(cacheKey, result, 30 * 60 * 1000);
  return res.json(result);
});

function calculateVendorOverallScore(vendor: any): number {
  const onTimeWeight = 0.4;
  const qualityWeight = 0.3;
  const speedWeight = 0.3;

  const onTimeScore = vendor.onTimeRate;
  const qualityScore = vendor.avgQualityScore || 80;
  const speedScore = Math.max(0, 100 - (vendor.avgResolutionTime || 0) * 2);

  return (onTimeScore * onTimeWeight) + (qualityScore * qualityWeight) + (speedScore * speedWeight);
}

export default router;
