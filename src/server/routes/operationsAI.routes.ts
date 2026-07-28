import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── AI-Driven Daily Briefing Prioritization ────────────────────────
// Generate AI-prioritized daily briefing
router.post('/ai/briefing', authenticate, requirePermission('ops:ai:briefing'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, date } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  const briefingDate = date || new Date().toISOString().split('T')[0];

  // Get pending tasks
  const { data: tasks } = await supabaseAdmin
    .from('operations_tasks')
    .select('*')
    .eq('property_id', propertyId)
    .in('status', ['pending', 'in_progress'])
    .order('due_date', { ascending: true });

  // Get active incidents
  const { data: incidents } = await supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('property_id', propertyId)
    .in('status', ['open', 'investigating'])
    .order('created_at', { ascending: false });

  // Get active work orders
  const { data: workOrders } = await supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', propertyId)
    .in('status', ['assigned', 'in_progress'])
    .order('due_date', { ascending: true });

  // Get today's reservations/occupancy
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .like('check_in_date', `${briefingDate}%`);

  // AI prioritization logic
  const prioritizedTasks = prioritizeTasks(tasks || []);
  const prioritizedIncidents = prioritizeIncidents(incidents || []);
  const prioritizedWorkOrders = prioritizeWorkOrders(workOrders || []);

  const briefing = {
    propertyId,
    date: briefingDate,
    generatedAt: new Date().toISOString(),
    summary: {
      totalActions: (tasks || []).length + (incidents || []).length + (workOrders || []).length,
      criticalItems: prioritizedTasks.filter(t => t.priority === 'critical').length +
                      prioritizedIncidents.filter(i => i.priority === 'critical').length +
                      prioritizedWorkOrders.filter(w => w.priority === 'critical').length,
      occupancy: (reservations || []).length,
    },
    prioritizedActions: [
      ...prioritizedTasks.map(t => ({ ...t, type: 'task' })),
      ...prioritizedIncidents.map(i => ({ ...i, type: 'incident' })),
      ...prioritizedWorkOrders.map(w => ({ ...w, type: 'workOrder' })),
    ].sort((a, b) => b.aiScore - a.aiScore),
    recommendations: generateBriefingRecommendations(tasks || [], incidents || [], workOrders || []),
  };

  // Save briefing
  const { data, error } = await supabaseAdmin.from('daily_briefings').insert({
    property_id: propertyId,
    briefing_date: briefingDate,
    briefing_data: briefing,
    generated_by: req.user?.id,
    generated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-ai:*');

  return res.status(201).json(briefing);
});

function prioritizeTasks(tasks: any[]) {
  return tasks.map(task => {
    let score = 50; // Base score

    // Priority weighting
    if (task.priority === 'high') score += 30;
    if (task.priority === 'medium') score += 15;

    // Due date weighting
    if (task.due_date) {
      const daysUntilDue = Math.floor((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 0) score += 40; // Overdue
      else if (daysUntilDue <= 1) score += 30; // Due today
      else if (daysUntilDue <= 3) score += 15; // Due within 3 days
    }

    // Age weighting
    const daysSinceCreated = Math.floor((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceCreated > 7) score += 10;

    return {
      ...task,
      aiScore: Math.min(100, score),
      priority: score >= 80 ? 'critical' : score >= 60 ? 'high' : task.priority,
    };
  });
}

function prioritizeIncidents(incidents: any[]) {
  return incidents.map(incident => {
    let score = 50;

    // Severity weighting
    if (incident.severity === 'critical') score += 40;
    if (incident.severity === 'high') score += 25;

    // Type weighting
    if (incident.type === 'safety') score += 20;
    if (incident.type === 'security') score += 15;

    // Age weighting
    const hoursSinceCreated = Math.floor((Date.now() - new Date(incident.created_at).getTime()) / (1000 * 60 * 60));
    if (hoursSinceCreated > 24) score += 15;

    return {
      ...incident,
      aiScore: Math.min(100, score),
      priority: score >= 80 ? 'critical' : score >= 60 ? 'high' : incident.severity,
    };
  });
}

function prioritizeWorkOrders(workOrders: any[]) {
  return workOrders.map(wo => {
    let score = 50;

    // Priority weighting
    if (wo.priority === 'high') score += 25;

    // Due date weighting
    if (wo.due_date) {
      const daysUntilDue = Math.floor((new Date(wo.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysUntilDue <= 0) score += 35;
      else if (daysUntilDue <= 2) score += 20;
    }

    // Asset criticality weighting (if asset is critical)
    if (wo.asset_id) {
      // Would check asset criticality in production
      score += 10;
    }

    return {
      ...wo,
      aiScore: Math.min(100, score),
      priority: score >= 80 ? 'critical' : score >= 60 ? 'high' : wo.priority,
    };
  });
}

function generateBriefingRecommendations(tasks: any[], incidents: any[], workOrders: any[]) {
  const recommendations = [];

  // Task recommendations
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date());
  if (overdueTasks.length > 0) {
    recommendations.push({
      type: 'task',
      priority: 'high',
      message: `${overdueTasks.length} tasks are overdue and require immediate attention`,
      count: overdueTasks.length,
    });
  }

  // Incident recommendations
  const criticalIncidents = incidents.filter(i => i.severity === 'critical');
  if (criticalIncidents.length > 0) {
    recommendations.push({
      type: 'incident',
      priority: 'critical',
      message: `${criticalIncidents.length} critical incidents require immediate resolution`,
      count: criticalIncidents.length,
    });
  }

  // Work order recommendations
  const urgentWorkOrders = workOrders.filter(w => w.priority === 'high' && w.status === 'assigned');
  if (urgentWorkOrders.length > 0) {
    recommendations.push({
      type: 'workOrder',
      priority: 'high',
      message: `${urgentWorkOrders.length} high-priority work orders are waiting assignment`,
      count: urgentWorkOrders.length,
    });
  }

  return recommendations;
}

// ── Predictive Staffing Recommendations ─────────────────────────────
// Generate staffing recommendations
router.post('/ai/staffing-recommendations', authenticate, requirePermission('ops:ai:staffing'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, date, daysAhead } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  const targetDate = date || new Date().toISOString().split('T')[0];

  // Get reservations for the date
  const { data: reservations } = await supabaseAdmin
    .from('reservations')
    .select('*')
    .eq('property_id', propertyId)
    .like('check_in_date', `${targetDate}%`);

  // Get historical staffing data
  const historicalStart = new Date(targetDate);
  historicalStart.setDate(historicalStart.getDate() - 30);

  const { data: historicalStaffing } = await supabaseAdmin
    .from('staff_schedules')
    .select('*')
    .eq('property_id', propertyId)
    .gte('shift_date', historicalStart.toISOString())
    .lt('shift_date', targetDate);

  // Get historical occupancy
  const { data: historicalOccupancy } = await supabaseAdmin
    .from('reservations')
    .select('check_in_date')
    .eq('property_id', propertyId)
    .gte('check_in_date', historicalStart.toISOString())
    .lt('check_in_date', targetDate);

  // Calculate predicted occupancy
  const predictedOccupancy = (reservations || []).length;
  const avgHistoricalOccupancy = (historicalOccupancy || []).length / 30;

  // Calculate staffing needs based on occupancy
  const baseStaffPerOccupancy = 0.15; // 1 staff per 6.7 guests
  const predictedStaffNeeded = Math.ceil(predictedOccupancy * baseStaffPerOccupancy);
  const minStaff = 5; // Minimum staff regardless of occupancy

  const recommendedStaff = Math.max(minStaff, predictedStaffNeeded);

  // Break down by department
  const recommendations = {
    propertyId,
    date: targetDate,
    predictedOccupancy,
    avgHistoricalOccupancy: Math.round(avgHistoricalOccupancy),
    totalStaffRecommended: recommendedStaff,
    breakdown: {
      frontDesk: Math.ceil(recommendedStaff * 0.25),
      housekeeping: Math.ceil(recommendedStaff * 0.35),
      maintenance: Math.ceil(recommendedStaff * 0.15),
      foodBeverage: Math.ceil(recommendedStaff * 0.15),
      security: Math.ceil(recommendedStaff * 0.10),
    },
    reasoning: generateStaffingReasoning(predictedOccupancy, avgHistoricalOccupancy),
    confidence: 0.85,
    generatedAt: new Date().toISOString(),
  };

  // Save recommendations
  const { data, error } = await supabaseAdmin.from('staffing_recommendations').insert({
    property_id: propertyId,
    recommendation_date: targetDate,
    recommendations,
    generated_by: req.user?.id,
    generated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-ai:*');

  return res.status(201).json(recommendations);
});

function generateStaffingReasoning(predictedOccupancy: number, avgHistoricalOccupancy: number) {
  const variance = ((predictedOccupancy - avgHistoricalOccupancy) / avgHistoricalOccupancy) * 100;

  if (variance > 20) {
    return `Occupancy is ${variance.toFixed(0)}% above average. Increase staffing by 15-20% to maintain service levels.`;
  } else if (variance < -20) {
    return `Occupancy is ${Math.abs(variance).toFixed(0)}% below average. Consider reducing staffing by 10-15% while maintaining minimum coverage.`;
  } else {
    return `Occupancy is within normal range. Standard staffing levels recommended.`;
  }
}

// ── Escalation Severity Prediction ─────────────────────────────────
// Predict severity of new incident
router.post('/ai/predict-severity', authenticate, requirePermission('ops:ai:predict'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    type,
    description,
    location,
    reportedBy,
  } = req.body || {};
  
  if (!propertyId || !type) {
    return res.status(400).json({ error: 'propertyId and type are required' });
  }

  // Get historical incidents for pattern analysis
  const { data: historicalIncidents } = await supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('property_id', propertyId)
    .eq('type', type)
    .order('created_at', { ascending: false })
    .limit(50);

  // Analyze patterns
  const severityDistribution = {
    critical: (historicalIncidents || []).filter(i => i.severity === 'critical').length,
    high: (historicalIncidents || []).filter(i => i.severity === 'high').length,
    medium: (historicalIncidents || []).filter(i => i.severity === 'medium').length,
    low: (historicalIncidents || []).filter(i => i.severity === 'low').length,
  };

  const totalHistorical = (historicalIncidents || []).length || 1;
  const criticalProbability = severityDistribution.critical / totalHistorical;
  const highProbability = severityDistribution.high / totalHistorical;

  // Base severity from type
  let baseSeverity = 'medium';
  if (type === 'safety' || type === 'security') baseSeverity = 'high';
  if (type === 'guest-complaint') baseSeverity = 'medium';

  // Adjust based on keywords in description
  const criticalKeywords = ['fire', 'flood', 'emergency', 'injury', 'medical', 'dangerous'];
  const highKeywords = ['damage', 'broken', 'malfunction', 'urgent', 'immediate'];
  
  let severityScore = 50;
  if (description) {
    const lowerDesc = description.toLowerCase();
    if (criticalKeywords.some(k => lowerDesc.includes(k))) {
      severityScore += 40;
      baseSeverity = 'critical';
    }
    if (highKeywords.some(k => lowerDesc.includes(k))) {
      severityScore += 25;
      if (baseSeverity !== 'critical') baseSeverity = 'high';
    }
  }

  // Location weighting
  if (location?.toLowerCase().includes('guest room')) {
    severityScore += 15; // Guest-facing areas are higher priority
  }

  const prediction = {
    propertyId,
    type,
    predictedSeverity: severityScore >= 80 ? 'critical' : severityScore >= 60 ? 'high' : baseSeverity,
    confidence: Math.min(0.95, 0.7 + (historicalIncidents?.length || 0) / 100),
    severityScore,
    probabilities: {
      critical: Math.round(criticalProbability * 100),
      high: Math.round(highProbability * 100),
    },
    factors: {
      typeBase: baseSeverity,
      keywordAnalysis: severityScore > 50,
      locationFactor: location?.toLowerCase().includes('guest room'),
      historicalPattern: (historicalIncidents?.length || 0) > 10,
    },
    recommendation: getSeverityRecommendation(severityScore, type),
    generatedAt: new Date().toISOString(),
  };

  return res.json(prediction);
});

function getSeverityRecommendation(score: number, type: string): string {
  if (score >= 80) {
    return 'CRITICAL: Immediate escalation to management required. Implement emergency response protocols.';
  }
  if (score >= 60) {
    return 'HIGH: Escalate to department head. Monitor closely and provide regular updates.';
  }
  if (type === 'safety' || type === 'security') {
    return 'MEDIUM-HIGH: Due to incident type, escalate to supervisor for review.';
  }
  return 'MEDIUM: Handle according to standard procedures. Document resolution.';
}

// ── Smart Action Item Assignment ───────────────────────────────────
// AI-powered task assignment
router.post('/ai/assign-task', authenticate, requirePermission('ops:ai:assign'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    taskId,
    requiredSkills,
    priority,
    location,
  } = req.body || {};
  
  if (!propertyId || !taskId) {
    return res.status(400).json({ error: 'propertyId and taskId are required' });
  }

  // Get available staff
  const { data: staff } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true);

  // Get current workload for each staff member
  const { data: currentTasks } = await supabaseAdmin
    .from('operations_tasks')
    .select('assigned_to, status')
    .eq('property_id', propertyId)
    .in('status', ['pending', 'in_progress']);

  const workloadByStaff: Record<string, number> = {};
  (currentTasks || []).forEach(task => {
    workloadByStaff[task.assigned_to] = (workloadByStaff[task.assigned_to] || 0) + 1;
  });

  // Score each staff member
  const scoredStaff = (staff || []).map((staffMember: any) => {
    let score = 50;

    // Workload penalty
    const currentWorkload = workloadByStaff[staffMember.id] || 0;
    if (currentWorkload >= 5) score -= 30;
    else if (currentWorkload >= 3) score -= 15;

    // Skills matching (simplified - would check actual skills in production)
    if (requiredSkills) {
      // Would match against staff skills
      score += 20;
    }

    // Location proximity (if location specified)
    if (location && staffMember.current_location) {
      // Would calculate actual distance
      score += 10;
    }

    // Priority consideration
    if (priority === 'high' || priority === 'critical') {
      // Prefer staff with higher efficiency or experience
      score += 10;
    }

    return {
      ...staffMember,
      assignmentScore: Math.max(0, Math.min(100, score)),
      currentWorkload,
    };
  });

  // Sort by score and get top recommendation
  scoredStaff.sort((a, b) => b.assignmentScore - a.assignmentScore);
  const recommendedStaff = scoredStaff[0];

  if (!recommendedStaff) {
    return res.status(404).json({ error: 'No available staff found for assignment' });
  }

  // Update task assignment
  const { data, error } = await supabaseAdmin
    .from('operations_tasks')
    .update({
      assigned_to: recommendedStaff.id,
      assigned_at: new Date().toISOString(),
      assignment_method: 'ai_suggested',
    })
    .eq('id', taskId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-ai:*');
  cacheService.invalidatePattern('ops-tasks:*');

  return res.json({
    success: true,
    task: data,
    recommendedStaff: {
      id: recommendedStaff.id,
      name: recommendedStaff.name,
      score: recommendedStaff.assignmentScore,
      currentWorkload: recommendedStaff.currentWorkload,
    },
    alternatives: scoredStaff.slice(1, 4).map(s => ({
      id: s.id,
      name: s.name,
      score: s.assignmentScore,
      currentWorkload: s.currentWorkload,
    })),
  });
});

// ── Predictive Maintenance Scheduling ─────────────────────────────
// Generate predictive maintenance schedule
router.post('/ai/predictive-maintenance', authenticate, requirePermission('ops:ai:maintenance'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, daysAhead } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  // Get assets
  const { data: assets } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('property_id', propertyId);

  // Get historical maintenance records
  const { data: maintenanceHistory } = await supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', propertyId)
    .eq('category', 'maintenance')
    .order('created_at', { ascending: false })
    .limit(100);

  // Get maintenance intervals by asset type
  const maintenanceIntervals: Record<string, number> = {
    'hvac': 90, // days
    'elevator': 30,
    'plumbing': 60,
    'electrical': 45,
    'kitchen_equipment': 30,
    'laundry_equipment': 45,
  };

  const predictions = [];

  for (const asset of assets || []) {
    if (!asset.last_maintenance_date) continue;

    const daysSinceLastMaintenance = Math.floor(
      (Date.now() - new Date(asset.last_maintenance_date).getTime()) / (1000 * 60 * 60 * 24)
    );

    const interval = maintenanceIntervals[asset.category] || 60;
    const daysUntilDue = interval - daysSinceLastMaintenance;

    let riskLevel = 'low';
    if (daysUntilDue <= 0) riskLevel = 'critical';
    else if (daysUntilDue <= 7) riskLevel = 'high';
    else if (daysUntilDue <= 14) riskLevel = 'medium';

    if (daysUntilDue <= 30) {
      predictions.push({
        assetId: asset.id,
        assetName: asset.name,
        category: asset.category,
        lastMaintenance: asset.last_maintenance_date,
        daysUntilDue,
        recommendedDate: new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        riskLevel,
        priority: riskLevel === 'critical' ? 'high' : 'medium',
      });
    }
  }

  // Sort by days until due
  predictions.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  const result = {
    propertyId,
    predictions,
    summary: {
      totalPredictions: predictions.length,
      critical: predictions.filter(p => p.riskLevel === 'critical').length,
      high: predictions.filter(p => p.riskLevel === 'high').length,
      medium: predictions.filter(p => p.riskLevel === 'medium').length,
    },
    generatedAt: new Date().toISOString(),
  };

  // Save predictions
  const { data, error } = await supabaseAdmin.from('maintenance_predictions').insert({
    property_id: propertyId,
    prediction_data: result,
    generated_by: req.user?.id,
    generated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-ai:*');

  return res.status(201).json(result);
});

// ── Anomaly Detection for Operations Metrics ────────────────────────
// Detect anomalies in operations metrics
router.post('/ai/detect-anomalies', authenticate, requirePermission('ops:ai:anomaly'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, metricType, period } = req.body || {};
  
  if (!propertyId || !metricType) {
    return res.status(400).json({ error: 'propertyId and metricType are required' });
  }

  const days = period || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get historical data based on metric type
  let historicalData: any[] = [];
  
  switch (metricType) {
    case 'task_completion_rate':
      const { data: tasks } = await supabaseAdmin
        .from('operations_tasks')
        .select('*')
        .eq('property_id', propertyId)
        .gte('created_at', startDate.toISOString());
      historicalData = tasks || [];
      break;
      
    case 'incident_count':
      const { data: incidents } = await supabaseAdmin
        .from('incidents')
        .select('*')
        .eq('property_id', propertyId)
        .gte('created_at', startDate.toISOString());
      historicalData = incidents || [];
      break;
      
    case 'work_order_resolution_time':
      const { data: workOrders } = await supabaseAdmin
        .from('work_orders')
        .select('*')
        .eq('property_id', propertyId)
        .gte('created_at', startDate.toISOString());
      historicalData = workOrders || [];
      break;
  }

  // Calculate statistics
  const anomalies = detectStatisticalAnomalies(historicalData, metricType);

  const result = {
    propertyId,
    metricType,
    period: days,
    dataPoints: historicalData.length,
    anomalies,
    summary: {
      totalAnomalies: anomalies.length,
      criticalAnomalies: anomalies.filter(a => a.severity === 'critical').length,
      warningAnomalies: anomalies.filter(a => a.severity === 'warning').length,
    },
    generatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

function detectStatisticalAnomalies(data: any[], metricType: string) {
  const anomalies = [];

  if (data.length < 5) return anomalies;

  // Calculate mean and standard deviation
  let values: number[] = [];
  
  switch (metricType) {
    case 'task_completion_rate':
      // Calculate daily completion rates
      const dailyTasks: Record<string, { completed: number; total: number }> = {};
      data.forEach((task: any) => {
        const date = task.created_at.split('T')[0];
        if (!dailyTasks[date]) dailyTasks[date] = { completed: 0, total: 0 };
        dailyTasks[date].total++;
        if (task.status === 'completed') dailyTasks[date].completed++;
      });
      values = Object.values(dailyTasks).map(d => (d.completed / d.total) * 100);
      break;
      
    case 'incident_count':
      const dailyIncidents: Record<string, number> = {};
      data.forEach((incident: any) => {
        const date = incident.created_at.split('T')[0];
        dailyIncidents[date] = (dailyIncidents[date] || 0) + 1;
      });
      values = Object.values(dailyIncidents);
      break;
      
    case 'work_order_resolution_time':
      const resolutionTimes = data
        .filter((wo: any) => wo.completed_at && wo.created_at)
        .map((wo: any) => {
          const completed = new Date(wo.completed_at).getTime();
          const created = new Date(wo.created_at).getTime();
          return (completed - created) / (1000 * 60 * 60); // hours
        });
      values = resolutionTimes;
      break;
  }

  if (values.length === 0) return anomalies;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Detect anomalies (values beyond 2 standard deviations)
  values.forEach((value, index) => {
    const zScore = Math.abs((value - mean) / stdDev);
    if (zScore > 2) {
      anomalies.push({
        index,
        value,
        mean: Math.round(mean * 100) / 100,
        stdDev: Math.round(stdDev * 100) / 100,
        zScore: Math.round(zScore * 100) / 100,
        severity: zScore > 3 ? 'critical' : 'warning',
        deviation: ((value - mean) / mean) * 100,
      });
    }
  });

  return anomalies;
}

// ── Resource Optimization Recommendations ───────────────────────────
// Generate resource optimization recommendations
router.post('/ai/optimize-resources', authenticate, requirePermission('ops:ai:optimize'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  const recommendations = [];

  // Analyze staff utilization
  const { data: staffSchedules } = await supabaseAdmin
    .from('staff_schedules')
    .select('*')
    .eq('property_id', propertyId)
    .gte('shift_date', new Date().toISOString().split('T')[0]);

  // Analyze asset utilization
  const { data: assets } = await supabaseAdmin
    .from('assets')
    .select('*')
    .eq('property_id', propertyId);

  // Staff optimization
  if (staffSchedules && staffSchedules.length > 0) {
    const shiftsByDay: Record<string, number> = {};
    staffSchedules.forEach(schedule => {
      const date = schedule.shift_date.split('T')[0];
      shiftsByDay[date] = (shiftsByDay[date] || 0) + 1;
    });

    const avgShiftsPerDay = Object.values(shiftsByDay).reduce((a, b) => a + b, 0) / Object.keys(shiftsByDay).length;
    
    if (avgShiftsPerDay > 15) {
      recommendations.push({
        type: 'staff',
        priority: 'medium',
        category: 'overstaffing',
        message: `Average of ${Math.round(avgShiftsPerDay)} shifts per day may indicate overstaffing. Consider optimizing schedules.`,
        potentialSavings: '10-15%',
      });
    }
  }

  // Asset optimization
  if (assets) {
    const underutilizedAssets = assets.filter(a => a.utilization_rate < 30 && a.utilization_rate !== null);
    if (underutilizedAssets.length > 0) {
      recommendations.push({
        type: 'asset',
        priority: 'low',
        category: 'underutilization',
        message: `${underutilizedAssets.length} assets have utilization below 30%. Consider reallocating or repurposing.`,
        affectedAssets: underutilizedAssets.length,
      });
    }

    const maintenanceOverdue = assets.filter(a => a.requires_maintenance);
    if (maintenanceOverdue.length > 0) {
      recommendations.push({
        type: 'asset',
        priority: 'high',
        category: 'maintenance',
        message: `${maintenanceOverdue.length} assets require maintenance. Schedule preventive maintenance to avoid downtime.`,
        affectedAssets: maintenanceOverdue.length,
      });
    }
  }

  const result = {
    propertyId,
    recommendations,
    summary: {
      totalRecommendations: recommendations.length,
      highPriority: recommendations.filter(r => r.priority === 'high').length,
      mediumPriority: recommendations.filter(r => r.priority === 'medium').length,
      lowPriority: recommendations.filter(r => r.priority === 'low').length,
    },
    generatedAt: new Date().toISOString(),
  };

  // Save recommendations
  const { data, error } = await supabaseAdmin.from('resource_optimizations').insert({
    property_id: propertyId,
    optimization_data: result,
    generated_by: req.user?.id,
    generated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-ai:*');

  return res.status(201).json(result);
});

// ── Natural Language Processing for Notes and Summaries ─────────────
// Generate AI summary from notes
router.post('/ai/summarize-notes', authenticate, requirePermission('ops:ai:nlp'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { notes, context, maxLength } = req.body || {};
  
  if (!notes || !Array.isArray(notes)) {
    return res.status(400).json({ error: 'notes array is required' });
  }

  // Simple NLP summarization (can be enhanced with actual NLP service)
  const summary = generateSummary(notes, context, maxLength || 200);

  // Extract key entities
  const entities = extractEntities(notes);

  // Determine sentiment
  const sentiment = analyzeNotesSentiment(notes);

  const result = {
    summary,
    entities,
    sentiment,
    noteCount: notes.length,
    context,
    generatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

function generateSummary(notes: string[], context?: string, maxLength: number = 200): string {
  // Combine notes
  const combinedNotes = notes.join(' ');
  
  // Simple extractive summarization
  const sentences = combinedNotes.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return '';
  
  // Take first few sentences up to max length
  let summary = '';
  for (const sentence of sentences) {
    if ((summary + sentence).length <= maxLength) {
      summary += sentence.trim() + '. ';
    } else {
      break;
    }
  }
  
  return summary.trim() || combinedNotes.substring(0, maxLength) + '...';
}

function extractEntities(notes: string[]): Array<{ type: string; value: string }> {
  const entities: Array<{ type: string; value: string }> = [];
  const combinedNotes = notes.join(' ').toLowerCase();
  
  // Room numbers
  const roomMatches = combinedNotes.match(/room\s*(\d+)/gi);
  roomMatches?.forEach(match => {
    const roomNum = match.match(/\d+/)?.[0];
    if (roomNum) entities.push({ type: 'room', value: roomNum });
  });
  
  // Time references
  const timeMatches = combinedNotes.match(/\d{1,2}:\d{2}/g);
  timeMatches?.forEach(match => {
    entities.push({ type: 'time', value: match });
  });
  
  // Priority keywords
  const priorityKeywords = ['urgent', 'critical', 'important', 'asap', 'immediate'];
  priorityKeywords.forEach(keyword => {
    if (combinedNotes.includes(keyword)) {
      entities.push({ type: 'priority', value: keyword });
    }
  });
  
  return entities;
}

function analyzeNotesSentiment(notes: string[]): { overall: string; score: number } {
  const positiveWords = ['good', 'fixed', 'resolved', 'completed', 'excellent', 'successful', 'done'];
  const negativeWords = ['broken', 'failed', 'error', 'problem', 'issue', 'urgent', 'critical', 'delayed'];
  
  const combinedNotes = notes.join(' ').toLowerCase();
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    positiveCount += (combinedNotes.match(new RegExp(word, 'g')) || []).length;
  });
  
  negativeWords.forEach(word => {
    negativeCount += (combinedNotes.match(new RegExp(word, 'g')) || []).length;
  });
  
  const total = positiveCount + negativeCount;
  let score = 0;
  let overall = 'neutral';
  
  if (total > 0) {
    score = (positiveCount - negativeCount) / total;
    if (score > 0.2) overall = 'positive';
    else if (score < -0.2) overall = 'negative';
  }
  
  return { overall, score: Math.round(score * 100) / 100 };
}

// Auto-generate task summary from description
router.post('/ai/generate-task-summary', authenticate, requirePermission('ops:ai:nlp'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { description } = req.body || {};
  
  if (!description) {
    return res.status(400).json({ error: 'description is required' });
  }

  // Generate summary
  const summary = generateSummary([description], undefined, 100);
  
  // Extract key points
  const keyPoints = extractKeyPoints(description);
  
  // Suggest priority
  const suggestedPriority = suggestPriorityFromDescription(description);

  const result = {
    summary,
    keyPoints,
    suggestedPriority,
    originalDescription: description,
    generatedAt: new Date().toISOString(),
  };

  return res.json(result);
});

function extractKeyPoints(text: string): string[] {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10);
  return sentences.slice(0, 3).map(s => s.trim());
}

function suggestPriorityFromDescription(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  const criticalKeywords = ['emergency', 'critical', 'dangerous', 'safety', 'fire', 'flood'];
  const highKeywords = ['urgent', 'important', 'asap', 'immediate', 'broken', 'failed'];
  
  if (criticalKeywords.some(k => lowerDesc.includes(k))) return 'critical';
  if (highKeywords.some(k => lowerDesc.includes(k))) return 'high';
  
  return 'medium';
}

// ── Pattern Recognition for Recurring Issues ────────────────────────
// Detect recurring issue patterns
router.post('/ai/detect-patterns', authenticate, requirePermission('ops:ai:patterns'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { propertyId, period, issueType } = req.body || {};
  
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' });
  }

  const days = period || 90;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get incidents
  let incidentQuery = supabaseAdmin
    .from('incidents')
    .select('*')
    .eq('property_id', propertyId)
    .gte('created_at', startDate.toISOString());
  
  if (issueType) incidentQuery = incidentQuery.eq('type', issueType);
  
  const { data: incidents } = await incidentQuery;

  // Get work orders
  let workOrderQuery = supabaseAdmin
    .from('work_orders')
    .select('*')
    .eq('property_id', propertyId)
    .gte('created_at', startDate.toISOString());
  
  if (issueType) workOrderQuery = workOrderQuery.eq('category', issueType);
  
  const { data: workOrders } = await workOrderQuery;

  // Analyze patterns
  const incidentPatterns = analyzePatterns(incidents || [], 'incident');
  const workOrderPatterns = analyzePatterns(workOrders || [], 'workOrder');

  // Identify correlations
  const correlations = findCorrelations(incidents || [], workOrders || []);

  const result = {
    propertyId,
    period: days,
    incidentPatterns,
    workOrderPatterns,
    correlations,
    summary: {
      totalIncidents: (incidents || []).length,
      totalWorkOrders: (workOrders || []).length,
      recurringIncidentTypes: incidentPatterns.filter(p => p.frequency > 3).length,
      recurringWorkOrderCategories: workOrderPatterns.filter(p => p.frequency > 3).length,
    },
    generatedAt: new Date().toISOString(),
  };

  // Save pattern analysis
  const { data, error } = await supabaseAdmin.from('pattern_analyses').insert({
    property_id: propertyId,
    analysis_data: result,
    generated_by: req.user?.id,
    generated_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-ai:*');

  return res.status(201).json(result);
});

function analyzePatterns(items: any[], itemType: string): Array<{
  pattern: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  lastOccurrence: string;
  recommendation: string;
}> {
  const patterns: Array<{
    pattern: string;
    frequency: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    lastOccurrence: string;
    recommendation: string;
  }> = [];

  // Group by type/category
  const groupedByType: Record<string, any[]> = {};
  items.forEach(item => {
    const key = itemType === 'incident' ? item.type : item.category;
    if (!groupedByType[key]) groupedByType[key] = [];
    groupedByType[key].push(item);
  });

  // Analyze each type
  Object.keys(groupedByType).forEach(type => {
    const typeItems = groupedByType[type];
    const frequency = typeItems.length;
    
    // Calculate trend
    const recentItems = typeItems.filter(item => {
      const daysSince = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    });
    
    const olderItems = typeItems.filter(item => {
      const daysSince = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 30 && daysSince <= 60;
    });
    
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (recentItems.length > olderItems.length * 1.2) trend = 'increasing';
    else if (recentItems.length < olderItems.length * 0.8) trend = 'decreasing';
    
    const lastOccurrence = typeItems[0]?.created_at || '';
    
    patterns.push({
      pattern: type,
      frequency,
      trend,
      lastOccurrence,
      recommendation: getPatternRecommendation(type, frequency, trend),
    });
  });

  return patterns.sort((a, b) => b.frequency - a.frequency);
}

function getPatternRecommendation(pattern: string, frequency: number, trend: string): string {
  if (frequency > 10 && trend === 'increasing') {
    return `CRITICAL: ${pattern} is occurring frequently and increasing. Root cause analysis required immediately.`;
  }
  if (frequency > 5 && trend === 'increasing') {
    return `HIGH: ${pattern} is increasing in frequency. Monitor closely and investigate root cause.`;
  }
  if (frequency > 3) {
    return `MEDIUM: ${pattern} is recurring. Consider preventive measures.`;
  }
  return `LOW: ${pattern} occurs occasionally. Monitor for changes.`;
}

function findCorrelations(incidents: any[], workOrders: any[]): Array<{
  correlation: string;
  strength: number;
  description: string;
}> {
  const correlations: Array<{
    correlation: string;
    strength: number;
    description: string;
  }> = [];

  // Check if incidents lead to work orders
  const incidentTypes = [...new Set(incidents.map(i => i.type))];
  
  incidentTypes.forEach(incidentType => {
    const typeIncidents = incidents.filter(i => i.type === incidentType);
    const relatedWorkOrders = workOrders.filter(wo => 
      wo.category === incidentType || 
      typeIncidents.some(inc => 
        inc.location && wo.location && inc.location === wo.location
      )
    );
    
    if (relatedWorkOrders.length > 2) {
      correlations.push({
        correlation: `${incidentType} incidents → work orders`,
        strength: Math.min(1, relatedWorkOrders.length / typeIncidents.length),
        description: `${typeIncidents.length} ${incidentType} incidents resulted in ${relatedWorkOrders.length} work orders`,
      });
    }
  });

  // Location-based correlations
  const locations = [...new Set([...incidents.map(i => i.location), ...workOrders.map(w => w.location)].filter(Boolean))];
  
  locations.forEach(location => {
    const locationIncidents = incidents.filter(i => i.location === location);
    const locationWorkOrders = workOrders.filter(w => w.location === location);
    
    if (locationIncidents.length > 2 && locationWorkOrders.length > 2) {
      correlations.push({
        correlation: `Location: ${location}`,
        strength: Math.min(1, (locationIncidents.length + locationWorkOrders.length) / 10),
        description: `High activity in ${location}: ${locationIncidents.length} incidents, ${locationWorkOrders.length} work orders`,
      });
    }
  });

  return correlations.sort((a, b) => b.strength - a.strength);
}

// Get pattern analysis history
router.get('/ai/patterns/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { limit } = req.query as Record<string, string>;
  
  const { data, error } = await supabaseAdmin
    .from('pattern_analyses')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .order('generated_at', { ascending: false })
    .limit(parseInt(limit) || 10);

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data || []);
});

export default router;
