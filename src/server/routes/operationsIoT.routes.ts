import { Router } from 'express';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { cacheService } from '../services/cacheService';

const router = Router();

function dbNotConfigured(res: any) {
  return res.status(503).json({ error: 'Database not configured' });
}

// ── IoT Sensor Integration Platform ───────────────────────────────────
// Register IoT sensor
router.post('/sensors/register', authenticate, requirePermission('ops:iot:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    sensorId,
    sensorType,
    location,
    manufacturer,
    model,
    capabilities,
  } = req.body || {};
  
  if (!propertyId || !sensorId || !sensorType) {
    return res.status(400).json({ error: 'propertyId, sensorId, and sensorType are required' });
  }

  const { data, error } = await supabaseAdmin.from('iot_sensors').insert({
    property_id: propertyId,
    sensor_id,
    sensor_type: sensorType,
    location,
    manufacturer,
    model,
    capabilities: capabilities || [],
    is_active: true,
    registered_at: new Date().toISOString(),
    last_heartbeat: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.status(201).json(data);
});

// Receive sensor data
router.post('/sensors/data', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    sensorId,
    readings,
    timestamp,
  } = req.body || {};
  
  if (!sensorId || !readings) {
    return res.status(400).json({ error: 'sensorId and readings are required' });
  }

  // Update sensor heartbeat
  await supabaseAdmin
    .from('iot_sensors')
    .update({
      last_heartbeat: new Date().toISOString(),
      last_reading: timestamp || new Date().toISOString(),
    })
    .eq('sensor_id', sensorId);

  // Store readings
  const { data, error } = await supabaseAdmin.from('sensor_readings').insert({
    sensor_id: sensorId,
    readings,
    timestamp: timestamp || new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Check for threshold violations and create alerts
  await checkSensorThresholds(sensorId, readings);

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.status(201).json({ success: true, reading: data });
});

// Get sensor data
router.get('/sensors/:sensorId/data', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { startDate, endDate, limit } = req.query as Record<string, string>;
  
  const cacheKey = `sensor-data:${req.params.sensorId}:${startDate || 'all'}:${endDate || 'all'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  let q = supabaseAdmin
    .from('sensor_readings')
    .select('*')
    .eq('sensor_id', req.params.sensorId)
    .order('timestamp', { ascending: false });
  
  if (startDate) q = q.gte('timestamp', startDate);
  if (endDate) q = q.lte('timestamp', endDate);
  if (limit) q = q.limit(parseInt(limit));
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  const result = {
    sensorId: req.params.sensorId,
    readings: data || [],
    count: (data || []).length,
  };

  cacheService.set(cacheKey, result, 30 * 1000);
  return res.json(result);
});

// Get all sensors for property
router.get('/sensors/property/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const cacheKey = `property-sensors:${req.params.propertyId}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const { data, error } = await supabaseAdmin
    .from('iot_sensors')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true)
    .order('registered_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    sensors: data || [],
    summary: {
      total: (data || []).length,
      byType: groupSensorsByType(data || []),
      online: (data || []).filter(s => {
        if (!s.last_heartbeat) return false;
        const minutesSinceHeartbeat = (Date.now() - new Date(s.last_heartbeat).getTime()) / (1000 * 60);
        return minutesSinceHeartbeat < 30; // Consider online if heartbeat within 30 minutes
      }).length,
    },
  };

  cacheService.set(cacheKey, result, 60 * 1000);
  return res.json(result);
});

async function checkSensorThresholds(sensorId: string, readings: any) {
  // Get sensor configuration
  const { data: sensor } = await supabaseAdmin
    .from('iot_sensors')
    .select('*')
    .eq('sensor_id', sensorId)
    .single();

  if (!sensor || !sensor.thresholds) return;

  // Check each reading against thresholds
  Object.keys(readings).forEach(key => {
    const threshold = sensor.thresholds[key];
    if (!threshold) return;

    const value = readings[key];
    let alertLevel = null;

    if (value >= threshold.critical) {
      alertLevel = 'critical';
    } else if (value >= threshold.warning) {
      alertLevel = 'warning';
    }

    if (alertLevel) {
      // Create alert
      supabaseAdmin.from('iot_alerts').insert({
        sensor_id: sensorId,
        alert_type: 'threshold_violation',
        level: alertLevel,
        metric: key,
        value,
        threshold: threshold[alertLevel],
        message: `${key} value ${value} exceeds ${alertLevel} threshold of ${threshold[alertLevel]}`,
        created_at: new Date().toISOString(),
      });
    }
  });
}

function groupSensorsByType(sensors: any[]) {
  const grouped: Record<string, number> = {};
  sensors.forEach(s => {
    grouped[s.sensor_type] = (grouped[s.sensor_type] || 0) + 1;
  });
  return grouped;
}

// ── Smart Lock Integration for Room Status ────────────────────────────
// Register smart lock
router.post('/smart-locks/register', authenticate, requirePermission('ops:iot:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    lockId,
    roomId,
    manufacturer,
    model,
  } = req.body || {};
  
  if (!propertyId || !lockId || !roomId) {
    return res.status(400).json({ error: 'propertyId, lockId, and roomId are required' });
  }

  const { data, error } = await supabaseAdmin.from('smart_locks').insert({
    property_id: propertyId,
    lock_id,
    room_id: roomId,
    manufacturer,
    model,
    is_active: true,
    registered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.status(201).json(data);
});

// Update lock status
router.post('/smart-locks/:lockId/status', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    status, // 'locked', 'unlocked', 'jammed'
    batteryLevel,
    lastAccessBy,
  } = req.body || {};
  
  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  // Update lock status
  const { data, error } = await supabaseAdmin
    .from('smart_locks')
    .update({
      status,
      battery_level: batteryLevel,
      last_access_by: lastAccessBy,
      last_status_update: new Date().toISOString(),
    })
    .eq('lock_id', req.params.lockId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Update room status based on lock
  if (status === 'unlocked') {
    await supabaseAdmin
      .from('rooms')
      .update({ status: 'occupied' })
      .eq('id', data?.room_id);
  }

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.json(data);
});

// Get lock status
router.get('/smart-locks/:lockId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('smart_locks')
    .select('*, rooms(number)')
    .eq('lock_id', req.params.lockId)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  return res.json(data);
});

// Get all locks for property
router.get('/smart-locks/property/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('smart_locks')
    .select('*, rooms(number)')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    locks: data || [],
    summary: {
      total: (data || []).length,
      locked: (data || []).filter(l => l.status === 'locked').length,
      unlocked: (data || []).filter(l => l.status === 'unlocked').length,
      jammed: (data || []).filter(l => l.status === 'jammed').length,
      lowBattery: (data || []).filter(l => l.battery_level && l.battery_level < 20).length,
    },
  };

  return res.json(result);
});

// ── Environmental Monitoring System ───────────────────────────────────
// Get environmental readings for property
router.get('/environmental/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { location, period } = req.query as Record<string, string>;
  
  const cacheKey = `environmental:${req.params.propertyId}:${location || 'all'}:${period || 'hour'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const minutes = period === 'day' ? 1440 : period === 'week' ? 10080 : 60;
  const startDate = new Date();
  startDate.setMinutes(startDate.getMinutes() - minutes);

  // Get environmental sensors
  let sensorQuery = supabaseAdmin
    .from('iot_sensors')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .in('sensor_type', ['temperature', 'humidity', 'air_quality', 'co2'])
    .eq('is_active', true);
  
  if (location) sensorQuery = sensorQuery.eq('location', location);
  
  const { data: sensors } = await sensorQuery;

  if (!sensors || sensors.length === 0) {
    return res.json({
      propertyId: req.params.propertyId,
      location,
      readings: [],
      summary: {},
    });
  }

  // Get readings for each sensor
  const sensorIds = sensors.map(s => s.sensor_id);
  const { data: readings } = await supabaseAdmin
    .from('sensor_readings')
    .select('*')
    .in('sensor_id', sensorIds)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  // Aggregate readings by sensor type
  const aggregatedByType: Record<string, any> = {};
  (readings || []).forEach(reading => {
    const sensor = sensors.find(s => s.sensor_id === reading.sensor_id);
    if (!sensor) return;

    const type = sensor.sensor_type;
    if (!aggregatedByType[type]) {
      aggregatedByType[type] = {
        type,
        values: [],
        avg: 0,
        min: Infinity,
        max: -Infinity,
      };
    }

    Object.keys(reading.readings).forEach(key => {
      const value = reading.readings[key];
      if (typeof value === 'number') {
        aggregatedByType[type].values.push(value);
        aggregatedByType[type].min = Math.min(aggregatedByType[type].min, value);
        aggregatedByType[type].max = Math.max(aggregatedByType[type].max, value);
      }
    });
  });

  // Calculate averages
  Object.keys(aggregatedByType).forEach(type => {
    const values = aggregatedByType[type].values;
    aggregatedByType[type].avg = values.length > 0 
      ? values.reduce((a, b) => a + b, 0) / values.length 
      : 0;
  });

  const result = {
    propertyId: req.params.propertyId,
    location,
    period,
    readings: Object.values(aggregatedByType),
    summary: {
      temperature: aggregatedByType.temperature?.avg,
      humidity: aggregatedByType.humidity?.avg,
      airQuality: aggregatedByType.air_quality?.avg,
      co2: aggregatedByType.co2?.avg,
    },
    timestamp: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 60 * 1000);
  return res.json(result);
});

// Get environmental alerts
router.get('/environmental/:propertyId/alerts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { hours } = req.query as Record<string, string>;
  
  const hoursAgo = parseInt(hours) || 24;
  const startDate = new Date();
  startDate.setHours(startDate.getHours() - hoursAgo);

  const { data, error } = await supabaseAdmin
    .from('iot_alerts')
    .select('*, iot_sensors(sensor_type, location)')
    .eq('property_id', req.params.propertyId)
    .in('alert_type', ['threshold_violation', 'environmental'])
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    alerts: data || [],
    summary: {
      total: (data || []).length,
      critical: (data || []).filter(a => a.level === 'critical').length,
      warning: (data || []).filter(a => a.level === 'warning').length,
    },
  });
});

// ── Energy Management Integration ─────────────────────────────────────
// Get energy consumption data
router.get('/energy/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { period, granularity } = req.query as Record<string, string>;
  
  const cacheKey = `energy:${req.params.propertyId}:${period || 'day'}:${granularity || 'hour'}`;
  const cached = cacheService.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }

  const days = period === 'week' ? 7 : period === 'month' ? 30 : 1;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Get energy readings from sensors
  const { data: sensors } = await supabaseAdmin
    .from('iot_sensors')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('sensor_type', 'energy_meter')
    .eq('is_active', true);

  if (!sensors || sensors.length === 0) {
    return res.json({
      propertyId: req.params.propertyId,
      consumption: [],
      totalConsumption: 0,
    });
  }

  const sensorIds = sensors.map(s => s.sensor_id);
  const { data: readings } = await supabaseAdmin
    .from('sensor_readings')
    .select('*')
    .in('sensor_id', sensorIds)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  // Aggregate consumption by time period
  const consumptionByTime: Record<string, number> = {};
  (readings || []).forEach(reading => {
    const timestamp = new Date(reading.timestamp);
    const key = granularity === 'hour' 
      ? timestamp.toISOString().slice(0, 13) + ':00'
      : timestamp.toISOString().slice(0, 10);
    
    const consumption = reading.readings?.consumption || 0;
    consumptionByTime[key] = (consumptionByTime[key] || 0) + consumption;
  });

  const consumptionData = Object.entries(consumptionByTime).map(([time, value]) => ({
    time,
    consumption: value,
  })).sort((a, b) => a.time.localeCompare(b.time));

  const totalConsumption = Object.values(consumptionByTime).reduce((a, b) => a + b, 0);

  const result = {
    propertyId: req.params.propertyId,
    period,
    granularity,
    consumption: consumptionData,
    totalConsumption,
    avgPerPeriod: consumptionData.length > 0 ? totalConsumption / consumptionData.length : 0,
    timestamp: new Date().toISOString(),
  };

  cacheService.set(cacheKey, result, 5 * 60 * 1000);
  return res.json(result);
});

// Get energy alerts
router.get('/energy/:propertyId/alerts', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { days } = req.query as Record<string, string>;
  
  const daysAgo = parseInt(days) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const { data, error } = await supabaseAdmin
    .from('iot_alerts')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .eq('alert_type', 'energy')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    alerts: data || [],
    summary: {
      total: (data || []).length,
      critical: (data || []).filter(a => a.level === 'critical').length,
    },
  });
});

// ── Real-Time Asset Tracking via RFID/Bluetooth ───────────────────────
// Register asset tracker
router.post('/asset-trackers/register', authenticate, requirePermission('ops:iot:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    propertyId,
    trackerId,
    assetId,
    trackerType, // 'rfid' or 'bluetooth'
    manufacturer,
    model,
  } = req.body || {};
  
  if (!propertyId || !trackerId || !assetId) {
    return res.status(400).json({ error: 'propertyId, trackerId, and assetId are required' });
  }

  const { data, error } = await supabaseAdmin.from('asset_trackers').insert({
    property_id: propertyId,
    tracker_id,
    asset_id,
    tracker_type: trackerType || 'bluetooth',
    manufacturer,
    model,
    is_active: true,
    registered_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.status(201).json(data);
});

// Update asset location
router.post('/asset-trackers/:trackerId/location', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    location,
    gpsCoordinates,
    signalStrength,
  } = req.body || {};
  
  if (!location) {
    return res.status(400).json({ error: 'location is required' });
  }

  // Update tracker location
  await supabaseAdmin
    .from('asset_trackers')
    .update({
      last_location: location,
      last_gps_coordinates: gpsCoordinates,
      signal_strength: signalStrength,
      last_location_update: new Date().toISOString(),
    })
    .eq('tracker_id', req.params.trackerId);

  // Get tracker to find asset
  const { data: tracker } = await supabaseAdmin
    .from('asset_trackers')
    .select('*')
    .eq('tracker_id', req.params.trackerId)
    .single();

  if (tracker?.asset_id) {
    // Update asset location
    await supabaseAdmin
      .from('assets')
      .update({
        location,
        gps_coordinates: gpsCoordinates,
        last_location_update: new Date().toISOString(),
      })
      .eq('id', tracker.asset_id);
  }

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.json({ success: true, location, timestamp: new Date().toISOString() });
});

// Get asset tracking data
router.get('/asset-trackers/property/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { data, error } = await supabaseAdmin
    .from('asset_trackers')
    .select('*, assets(name, category)')
    .eq('property_id', req.params.propertyId)
    .eq('is_active', true);

  if (error) return res.status(500).json({ error: error.message });

  const result = {
    propertyId: req.params.propertyId,
    trackers: data || [],
    summary: {
      total: (data || []).length,
      byType: {
        rfid: (data || []).filter(t => t.tracker_type === 'rfid').length,
        bluetooth: (data || []).filter(t => t.tracker_type === 'bluetooth').length,
      },
      recentlyActive: (data || []).filter(t => {
        if (!t.last_location_update) return false;
        const hoursSince = (Date.now() - new Date(t.last_location_update).getTime()) / (1000 * 60 * 60);
        return hoursSince < 24;
      }).length,
    },
  };

  return res.json(result);
});

// Get asset location history
router.get('/asset-trackers/:trackerId/history', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { days } = req.query as Record<string, string>;
  
  const daysAgo = parseInt(days) || 7;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  const { data, error } = await supabaseAdmin
    .from('asset_location_history')
    .select('*')
    .eq('tracker_id', req.params.trackerId)
    .gte('timestamp', startDate.toISOString())
    .order('timestamp', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    trackerId: req.params.trackerId,
    history: data || [],
    count: (data || []).length,
  });
});

// ── Automated Maintenance Alerts from Equipment Sensors ───────────────
// Create maintenance alert from sensor
router.post('/maintenance-alerts', async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const {
    sensorId,
    alertType,
    severity,
    message,
    equipmentId,
    readings,
  } = req.body || {};
  
  if (!sensorId || !alertType) {
    return res.status(400).json({ error: 'sensorId and alertType are required' });
  }

  // Get sensor to find property
  const { data: sensor } = await supabaseAdmin
    .from('iot_sensors')
    .select('*')
    .eq('sensor_id', sensorId)
    .single();

  // Create alert
  const { data, error } = await supabaseAdmin.from('iot_alerts').insert({
    sensor_id: sensorId,
    property_id: sensor?.property_id,
    alert_type: alertType,
    level: severity || 'warning',
    message,
    equipment_id: equipmentId,
    readings,
    created_at: new Date().toISOString(),
  }).select().single();

  if (error) return res.status(500).json({ error: error.message });

  // If severity is critical, auto-create work order
  if (severity === 'critical' && equipmentId) {
    await supabaseAdmin.from('work_orders').insert({
      property_id: sensor?.property_id,
      title: `Critical Maintenance Alert: ${alertType}`,
      description: message,
      priority: 'high',
      category: 'maintenance',
      asset_id: equipmentId,
      status: 'assigned',
      created_at: new Date().toISOString(),
    });
  }

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.status(201).json(data);
});

// Get maintenance alerts
router.get('/maintenance-alerts/:propertyId', authenticate, async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { status, severity, days } = req.query as Record<string, string>;
  
  const daysAgo = parseInt(days) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysAgo);

  let q = supabaseAdmin
    .from('iot_alerts')
    .select('*')
    .eq('property_id', req.params.propertyId)
    .in('alert_type', ['maintenance', 'equipment'])
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });
  
  if (status) q = q.eq('status', status);
  if (severity) q = q.eq('level', severity);
  
  const { data, error } = await q;
  if (error) return res.status(500).json({ error: error.message });

  return res.json({
    propertyId: req.params.propertyId,
    alerts: data || [],
    summary: {
      total: (data || []).length,
      critical: (data || []).filter(a => a.level === 'critical').length,
      warning: (data || []).filter(a => a.level === 'warning').length,
      open: (data || []).filter(a => a.status === 'open').length,
    },
  });
});

// Resolve maintenance alert
router.put('/maintenance-alerts/:alertId/resolve', authenticate, requirePermission('ops:iot:manage'), async (req, res) => {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return dbNotConfigured(res);
  
  const { resolution, resolvedBy } = req.body || {};
  
  const { data, error } = await supabaseAdmin
    .from('iot_alerts')
    .update({
      status: 'resolved',
      resolution,
      resolved_by: resolvedBy || req.user?.id,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', req.params.alertId)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  // Invalidate cache
  cacheService.invalidatePattern('ops-iot:*');

  return res.json(data);
});

export default router;
