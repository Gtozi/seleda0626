-- Migration: Predictive Maintenance Integration
-- This migration adds tables and functions for IoT-driven predictive maintenance
-- Phase 2.2: Predictive Maintenance Integration

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- IoT Sensors table: Sensor devices installed throughout property
CREATE TABLE IF NOT EXISTS ops_iot_sensors (
  sensor_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sensor_name TEXT NOT NULL,
  sensor_type TEXT NOT NULL CHECK (sensor_type IN ('temperature', 'humidity', 'motion', 'vibration', 'energy', 'water', 'door', 'window', 'hvac', 'elevator', 'other')),
  location_id TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('room', 'corridor', 'lobby', 'restaurant', 'pool', 'gym', 'elevator', 'mechanical_room', 'other')),
  room_number TEXT,
  department TEXT NOT NULL CHECK (department IN ('FrontOffice', 'Housekeeping', 'FandB', 'Maintenance', 'HR', 'Procurement', 'SalesEvents', 'GuestPortal')),
  installation_date DATE NOT NULL,
  last_maintenance DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'retired')),
  calibration_date DATE,
  calibration_due_date DATE,
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT UNIQUE,
  firmware_version TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sensor Readings table: Time-series data from IoT sensors
CREATE TABLE IF NOT EXISTS ops_sensor_readings (
  reading_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sensor_id TEXT NOT NULL REFERENCES ops_iot_sensors(sensor_id) ON DELETE CASCADE,
  reading_value NUMERIC NOT NULL,
  reading_unit TEXT,
  reading_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_anomaly BOOLEAN DEFAULT FALSE,
  anomaly_score NUMERIC,
  quality_score NUMERIC DEFAULT 100,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Equipment Assets table: Property equipment being monitored
CREATE TABLE IF NOT EXISTS ops_equipment_assets (
  asset_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_name TEXT NOT NULL,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('hvac_unit', 'elevator', 'boiler', 'pump', 'generator', 'kitchen_equipment', 'laundry_equipment', 'pool_equipment', 'other')),
  location_id TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('room', 'corridor', 'lobby', 'restaurant', 'pool', 'gym', 'mechanical_room', 'other')),
  room_number TEXT,
  department TEXT NOT NULL CHECK (department IN ('FrontOffice', 'Housekeeping', 'FandB', 'Maintenance', 'HR', 'Procurement', 'SalesEvents', 'GuestPortal')),
  installation_date DATE NOT NULL,
  expected_lifespan_years INTEGER DEFAULT 10,
  manufacturer TEXT,
  model_number TEXT,
  serial_number TEXT UNIQUE,
  purchase_cost NUMERIC(12, 2),
  warranty_expiry DATE,
  last_maintenance DATE,
  next_maintenance_due DATE,
  status TEXT DEFAULT 'operational' CHECK (status IN ('operational', 'degraded', 'maintenance_required', 'out_of_service', 'retired')),
  linked_sensors TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Predictions table: AI-generated maintenance predictions
CREATE TABLE IF NOT EXISTS ops_maintenance_predictions (
  prediction_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL REFERENCES ops_equipment_assets(asset_id) ON DELETE CASCADE,
  prediction_type TEXT NOT NULL CHECK (prediction_type IN ('preventive', 'predictive', 'corrective', 'opportunity')),
  predicted_failure_date DATE NOT NULL,
  confidence_level NUMERIC(3, 2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  failure_probability NUMERIC(5, 2) NOT NULL,
  estimated_cost NUMERIC(10, 2),
  recommended_action TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  contributing_factors JSONB DEFAULT '{}',
  sensor_data_summary JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'scheduled', 'completed', 'dismissed')),
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Work Orders table: Generated from predictions or manual requests
CREATE TABLE IF NOT EXISTS ops_maintenance_work_orders (
  work_order_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  prediction_id TEXT REFERENCES ops_maintenance_predictions(prediction_id) ON DELETE SET NULL,
  asset_id TEXT NOT NULL REFERENCES ops_equipment_assets(asset_id) ON DELETE CASCADE,
  work_order_type TEXT NOT NULL CHECK (work_order_type IN ('preventive', 'predictive', 'corrective', 'emergency', 'inspection')),
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  assigned_to TEXT,
  department TEXT NOT NULL,
  location TEXT,
  scheduled_date DATE,
  estimated_duration_hours NUMERIC(4, 2),
  actual_duration_hours NUMERIC(4, 2),
  estimated_cost NUMERIC(10, 2),
  actual_cost NUMERIC(10, 2),
  parts_required TEXT[] DEFAULT '{}',
  parts_used TEXT[] DEFAULT '{}',
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Equipment Health Scores table: Real-time health monitoring
CREATE TABLE IF NOT EXISTS ops_equipment_health (
  health_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL REFERENCES ops_equipment_assets(asset_id) ON DELETE CASCADE,
  overall_health_score NUMERIC(3, 2) NOT NULL,
  performance_score NUMERIC(3, 2) DEFAULT 0,
  efficiency_score NUMERIC(3, 2) DEFAULT 0,
  reliability_score NUMERIC(3, 2) DEFAULT 0,
  safety_score NUMERIC(3, 2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  trend TEXT DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
  health_status TEXT DEFAULT 'good' CHECK (health_status IN ('excellent', 'good', 'fair', 'poor', 'critical')),
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance Alerts table: Real-time alerts from IoT sensors
CREATE TABLE IF NOT EXISTS ops_maintenance_alerts (
  alert_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  sensor_id TEXT NOT NULL REFERENCES ops_iot_sensors(sensor_id) ON DELETE CASCADE,
  asset_id TEXT REFERENCES ops_equipment_assets(asset_id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('threshold_exceeded', 'anomaly_detected', 'sensor_failure', 'communication_lost', 'trend_alert', 'other')),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical', 'emergency')),
  alert_message TEXT NOT NULL,
  alert_value NUMERIC,
  threshold_value NUMERIC,
  location TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preventive Maintenance Schedule table: Scheduled maintenance tasks
CREATE TABLE IF NOT EXISTS ops_preventive_maintenance_schedule (
  schedule_id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  asset_id TEXT NOT NULL REFERENCES ops_equipment_assets(asset_id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  task_description TEXT,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'semi_annual', 'annual', 'custom')),
  frequency_days INTEGER,
  last_completed_date DATE,
  next_due_date DATE NOT NULL,
  estimated_duration_hours NUMERIC(4, 2),
  required_skills TEXT[] DEFAULT '{}',
  parts_required TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_ops_iot_sensors_location ON ops_iot_sensors(location_id, location_type);
CREATE INDEX idx_ops_iot_sensors_type ON ops_iot_sensors(sensor_type);
CREATE INDEX idx_ops_iot_sensors_department ON ops_iot_sensors(department);
CREATE INDEX idx_ops_iot_sensors_status ON ops_iot_sensors(status);

CREATE INDEX idx_ops_sensor_readings_sensor ON ops_sensor_readings(sensor_id);
CREATE INDEX idx_ops_sensor_readings_timestamp ON ops_sensor_readings(reading_timestamp);
CREATE INDEX idx_ops_sensor_readings_anomaly ON ops_sensor_readings(is_anomaly);

CREATE INDEX idx_ops_equipment_assets_location ON ops_equipment_assets(location_id, location_type);
CREATE INDEX idx_ops_equipment_assets_type ON ops_equipment_assets(asset_type);
CREATE INDEX idx_ops_equipment_assets_department ON ops_equipment_assets(department);
CREATE INDEX idx_ops_equipment_assets_status ON ops_equipment_assets(status);

CREATE INDEX idx_ops_maintenance_predictions_asset ON ops_maintenance_predictions(asset_id);
CREATE INDEX idx_ops_maintenance_predictions_date ON ops_maintenance_predictions(predicted_failure_date);
CREATE INDEX idx_ops_maintenance_predictions_risk ON ops_maintenance_predictions(risk_level);
CREATE INDEX idx_ops_maintenance_predictions_status ON ops_maintenance_predictions(status);

CREATE INDEX idx_ops_maintenance_work_orders_asset ON ops_maintenance_work_orders(asset_id);
CREATE INDEX idx_ops_maintenance_work_orders_status ON ops_maintenance_work_orders(status);
CREATE INDEX idx_ops_maintenance_work_orders_priority ON ops_maintenance_work_orders(priority);
CREATE INDEX idx_ops_maintenance_work_orders_scheduled ON ops_maintenance_work_orders(scheduled_date);

CREATE INDEX idx_ops_equipment_health_asset ON ops_equipment_health(asset_id);
CREATE INDEX idx_ops_equipment_health_status ON ops_equipment_health(health_status);
CREATE INDEX idx_ops_equipment_health_trend ON ops_equipment_health(trend);

CREATE INDEX idx_ops_maintenance_alerts_sensor ON ops_maintenance_alerts(sensor_id);
CREATE INDEX idx_ops_maintenance_alerts_severity ON ops_maintenance_alerts(severity);
CREATE INDEX idx_ops_maintenance_alerts_acknowledged ON ops_maintenance_alerts(acknowledged);
CREATE INDEX idx_ops_maintenance_alerts_created ON ops_maintenance_alerts(created_at);

CREATE INDEX idx_ops_preventive_maintenance_schedule_asset ON ops_preventive_maintenance_schedule(asset_id);
CREATE INDEX idx_ops_preventive_maintenance_schedule_due ON ops_preventive_maintenance_schedule(next_due_date);
CREATE INDEX idx_ops_preventive_maintenance_schedule_active ON ops_preventive_maintenance_schedule(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_maintenance_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_ops_iot_sensors_updated_at
  BEFORE UPDATE ON ops_iot_sensors
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_timestamp();

CREATE TRIGGER trigger_ops_equipment_assets_updated_at
  BEFORE UPDATE ON ops_equipment_assets
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_timestamp();

CREATE TRIGGER trigger_ops_maintenance_predictions_updated_at
  BEFORE UPDATE ON ops_maintenance_predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_timestamp();

CREATE TRIGGER trigger_ops_maintenance_work_orders_updated_at
  BEFORE UPDATE ON ops_maintenance_work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_timestamp();

CREATE TRIGGER trigger_ops_preventive_maintenance_schedule_updated_at
  BEFORE UPDATE ON ops_preventive_maintenance_schedule
  FOR EACH ROW
  EXECUTE FUNCTION update_maintenance_timestamp();

-- Function to detect anomalies in sensor readings
CREATE OR REPLACE FUNCTION detect_sensor_anomaly(p_sensor_id TEXT, p_reading_value NUMERIC, p_reading_unit TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_avg_value NUMERIC;
  v_std_dev NUMERIC;
  v_threshold NUMERIC;
  v_is_anomaly BOOLEAN;
BEGIN
  -- Get average and standard deviation of recent readings (last 100)
  SELECT 
    AVG(reading_value),
    STDDEV(reading_value)
  INTO v_avg_value, v_std_dev
  FROM ops_sensor_readings
  WHERE sensor_id = p_sensor_id
    AND reading_timestamp > NOW() - INTERVAL '24 hours'
  ORDER BY reading_timestamp DESC
  LIMIT 100;
  
  -- If insufficient data, use default threshold
  IF v_std_dev IS NULL THEN
    v_std_dev := 10; -- Default standard deviation
    v_avg_value := p_reading_value;
  END IF;
  
  -- Anomaly if reading is more than 2 standard deviations from mean
  v_threshold := v_avg_value + (2 * v_std_dev);
  v_is_anomaly := ABS(p_reading_value - v_avg_value) > (2 * v_std_dev);
  
  RETURN v_is_anomaly;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate equipment health score
CREATE OR REPLACE FUNCTION calculate_equipment_health(p_asset_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_overall_score NUMERIC;
  v_health_status TEXT;
  v_trend TEXT;
  v_recommendations TEXT[] := ARRAY[]::TEXT[];
BEGIN
  -- Calculate overall health based on recent sensor readings and predictions
  -- This is a simplified calculation - in practice would use ML models
  
  -- Get recent health scores
  SELECT AVG(overall_health_score)
  INTO v_overall_score
  FROM ops_equipment_health
  WHERE asset_id = p_asset_id
    AND calculated_at > NOW() - INTERVAL '7 days';
  
  -- If no recent data, use default
  IF v_overall_score IS NULL THEN
    v_overall_score := 75;
  END IF;
  
  -- Determine health status
  IF v_overall_score >= 90 THEN
    v_health_status := 'excellent';
  ELSIF v_overall_score >= 75 THEN
    v_health_status := 'good';
  ELSIF v_overall_score >= 60 THEN
    v_health_status := 'fair';
  ELSIF v_overall_score >= 40 THEN
    v_health_status := 'poor';
  ELSE
    v_health_status := 'critical';
  END IF;
  
  -- Determine trend (simplified)
  v_trend := 'stable';
  
  -- Generate recommendations
  IF v_overall_score < 60 THEN
    v_recommendations := array_append(v_recommendations, 'Schedule immediate maintenance inspection');
  ELSIF v_overall_score < 75 THEN
    v_recommendations := array_append(v_recommendations, 'Monitor closely and plan preventive maintenance');
  END IF;
  
  -- Insert new health record
  INSERT INTO ops_equipment_health (
    asset_id,
    overall_health_score,
    health_status,
    trend,
    recommendations
  ) VALUES (
    p_asset_id,
    v_overall_score,
    v_health_status,
    v_trend,
    v_recommendations
  );
END;
$$ LANGUAGE plpgsql;

-- Function to generate maintenance prediction
CREATE OR REPLACE FUNCTION generate_maintenance_prediction(p_asset_id TEXT)
RETURNS VOID AS $$
DECLARE
  v_last_maintenance DATE;
  v_installation_date DATE;
  v_expected_lifespan_years INTEGER;
  v_days_since_installation INTEGER;
  v_days_since_maintenance INTEGER;
  v_failure_probability NUMERIC;
  v_predicted_failure_date DATE;
  v_risk_level TEXT;
  v_confidence_level NUMERIC;
BEGIN
  -- Get asset details
  SELECT 
    installation_date,
    expected_lifespan_years,
    last_maintenance
  INTO v_installation_date, v_expected_lifespan_years, v_last_maintenance
  FROM ops_equipment_assets
  WHERE asset_id = p_asset_id;
  
  -- Calculate days since installation and maintenance
  v_days_since_installation := (CURRENT_DATE - v_installation_date);
  v_days_since_maintenance := COALESCE((CURRENT_DATE - v_last_maintenance), v_days_since_installation);
  
  -- Calculate failure probability based on age and maintenance history
  -- This is a simplified model - in practice would use ML
  v_failure_probability := LEAST(
    (v_days_since_installation::NUMERIC / (v_expected_lifespan_years * 365.25)) * 100,
    95
  );
  
  -- Adjust for maintenance history
  IF v_days_since_maintenance > 365 THEN
    v_failure_probability := v_failure_probability + 15;
  ELSIF v_days_since_maintenance > 180 THEN
    v_failure_probability := v_failure_probability + 5;
  END IF;
  
  -- Predict failure date (simplified)
  IF v_failure_probability > 80 THEN
    v_predicted_failure_date := CURRENT_DATE + INTERVAL '30 days';
    v_risk_level := 'critical';
    v_confidence_level := 85;
  ELSIF v_failure_probability > 60 THEN
    v_predicted_failure_date := CURRENT_DATE + INTERVAL '90 days';
    v_risk_level := 'high';
    v_confidence_level := 75;
  ELSIF v_failure_probability > 40 THEN
    v_predicted_failure_date := CURRENT_DATE + INTERVAL '180 days';
    v_risk_level := 'medium';
    v_confidence_level := 65;
  ELSE
    v_predicted_failure_date := CURRENT_DATE + INTERVAL '365 days';
    v_risk_level := 'low';
    v_confidence_level := 55;
  END IF;
  
  -- Insert prediction
  INSERT INTO ops_maintenance_predictions (
    asset_id,
    prediction_type,
    predicted_failure_date,
    confidence_level,
    risk_level,
    failure_probability,
    recommended_action,
    priority
  ) VALUES (
    p_asset_id,
    'predictive',
    v_predicted_failure_date,
    v_confidence_level,
    v_risk_level,
    v_failure_probability,
    CASE 
      WHEN v_risk_level = 'critical' THEN 'Immediate maintenance required'
      WHEN v_risk_level = 'high' THEN 'Schedule maintenance within 30 days'
      WHEN v_risk_level = 'medium' THEN 'Plan maintenance within 90 days'
      ELSE 'Continue monitoring'
    END,
    CASE 
      WHEN v_risk_level = 'critical' THEN 'urgent'
      WHEN v_risk_level = 'high' THEN 'high'
      WHEN v_risk_level = 'medium' THEN 'normal'
      ELSE 'low'
    END
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create work order from prediction
CREATE OR REPLACE FUNCTION create_work_order_from_prediction(p_prediction_id TEXT, p_created_by TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prediction RECORD;
  v_work_order_id TEXT;
BEGIN
  -- Get prediction details
  SELECT * INTO v_prediction
  FROM ops_maintenance_predictions
  WHERE prediction_id = p_prediction_id;
  
  -- Create work order
  INSERT INTO ops_maintenance_work_orders (
    prediction_id,
    asset_id,
    work_order_type,
    title,
    description,
    priority,
    status,
    department,
    location,
    scheduled_date,
    created_by
  ) VALUES (
    p_prediction_id,
    v_prediction.asset_id,
    'predictive',
    'Predictive Maintenance: ' || (SELECT asset_name FROM ops_equipment_assets WHERE asset_id = v_prediction.asset_id),
    v_prediction.recommended_action,
    v_prediction.priority,
    'pending',
    (SELECT department FROM ops_equipment_assets WHERE asset_id = v_prediction.asset_id),
    (SELECT location_id FROM ops_equipment_assets WHERE asset_id = v_prediction.asset_id),
    v_prediction.predicted_failure_date - INTERVAL '7 days',
    p_created_by
  ) RETURNING work_order_id INTO v_work_order_id;
  
  -- Update prediction status
  UPDATE ops_maintenance_predictions
  SET status = 'scheduled'
  WHERE prediction_id = p_prediction_id;
  
  RETURN v_work_order_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_iot_sensors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_sensor_readings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_equipment_assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_maintenance_predictions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_maintenance_work_orders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_equipment_health TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_maintenance_alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ops_preventive_maintenance_schedule TO authenticated;

GRANT EXECUTE ON FUNCTION detect_sensor_anomaly(TEXT, NUMERIC, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_equipment_health(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_maintenance_prediction(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_work_order_from_prediction(TEXT, TEXT) TO authenticated;
