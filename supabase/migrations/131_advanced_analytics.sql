-- Migration: Advanced Analytics & Business Intelligence
-- This migration adds tables and functions for advanced analytics, forecasting, and business intelligence
-- Phase 4.2: Advanced Analytics & Business Intelligence

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Sales Forecasts table: Predictive sales forecasting
CREATE TABLE IF NOT EXISTS fb_sales_forecasts (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  outlet_id TEXT NOT NULL,
  forecast_date DATE NOT NULL,
  meal_period TEXT CHECK (meal_period IN ('breakfast', 'lunch', 'dinner', 'all_day')),
  predicted_revenue NUMERIC(12, 2),
  predicted_orders INTEGER,
  confidence NUMERIC(3, 2),
  factor_historical NUMERIC(3, 2),
  factor_weather NUMERIC(3, 2),
  factor_events NUMERIC(3, 2),
  factor_seasonality NUMERIC(3, 2),
  actual_revenue NUMERIC(12, 2),
  actual_orders INTEGER,
  forecast_accuracy NUMERIC(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outlet_id, forecast_date, meal_period)
);

-- Menu Item Trends table: Menu item performance trend analysis
CREATE TABLE IF NOT EXISTS fb_menu_item_trends (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  menu_item_id TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  orders_count INTEGER DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0,
  average_rating NUMERIC(3, 2),
  popularity_rank INTEGER,
  trend_direction TEXT CHECK (trend_direction IN ('increasing', 'stable', 'decreasing')),
  trend_percent NUMERIC(5, 2),
  category TEXT,
  seasonality_index NUMERIC(3, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_item_id, outlet_id, period_start, period_end)
);

-- Channel Attribution table: Sales channel performance tracking
CREATE TABLE IF NOT EXISTS fb_channel_attribution (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  channel TEXT NOT NULL,
  outlet_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  orders_count INTEGER DEFAULT 0,
  revenue NUMERIC(12, 2) DEFAULT 0,
  average_check NUMERIC(8, 2),
  growth_rate NUMERIC(5, 2),
  market_share NUMERIC(5, 2),
  conversion_rate NUMERIC(5, 2),
  customer_acquisition_cost NUMERIC(8, 2),
  lifetime_value NUMERIC(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(channel, outlet_id, period_start, period_end)
);

-- Dashboard Configurations table: Custom dashboard configurations
CREATE TABLE IF NOT EXISTS fb_dashboard_configurations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  dashboard_name TEXT NOT NULL,
  description TEXT,
  layout JSONB DEFAULT '[]'::JSONB,
  widgets JSONB DEFAULT '[]'::JSONB,
  filters JSONB DEFAULT '{}'::JSONB,
  refresh_interval INTEGER DEFAULT 300, -- seconds
  is_default BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Templates table: Custom report templates
CREATE TABLE IF NOT EXISTS fb_report_templates (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  template_name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL CHECK (report_type IN ('sales', 'inventory', 'labor', 'financial', 'performance', 'custom')),
  data_sources JSONB DEFAULT '[]'::JSONB,
  metrics JSONB DEFAULT '[]'::JSONB,
  filters JSONB DEFAULT '{}'::JSONB,
  groupings JSONB DEFAULT '[]'::JSONB,
  chart_config JSONB DEFAULT '{}'::JSONB,
  schedule_config JSONB DEFAULT '{}'::JSONB,
  created_by TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report Executions table: Report execution history
CREATE TABLE IF NOT EXISTS fb_report_executions (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  template_id TEXT REFERENCES fb_report_templates(id) ON DELETE CASCADE,
  executed_by TEXT NOT NULL,
  execution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parameters JSONB DEFAULT '{}'::JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  result_data JSONB,
  file_url TEXT,
  file_format TEXT,
  row_count INTEGER,
  execution_time_ms INTEGER,
  error_message TEXT
);

-- Benchmarking Data table: Industry benchmarking data
CREATE TABLE IF NOT EXISTS fb_benchmarking_data (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  metric_name TEXT NOT NULL,
  metric_category TEXT NOT NULL,
  industry_average NUMERIC(12, 2),
  top_quartile NUMERIC(12, 2),
  bottom_quartile NUMERIC(12, 2),
  region TEXT,
  establishment_type TEXT,
  year INTEGER,
  quarter INTEGER,
  data_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Outlet Performance Benchmarks table: Outlet performance vs benchmarks
CREATE TABLE IF NOT EXISTS fb_outlet_benchmarks (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  outlet_id TEXT NOT NULL,
  benchmark_date DATE NOT NULL,
  metric_name TEXT NOT NULL,
  actual_value NUMERIC(12, 2),
  benchmark_value NUMERIC(12, 2),
  variance NUMERIC(12, 2),
  variance_percent NUMERIC(5, 2),
  percentile NUMERIC(3, 2),
  trend TEXT CHECK (trend IN ('above_average', 'average', 'below_average')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outlet_id, benchmark_date, metric_name)
);

-- Profit and Loss by Outlet table: Financial performance tracking
CREATE TABLE IF NOT EXISTS fb_profit_loss_by_outlet (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  outlet_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  revenue NUMERIC(12, 2) DEFAULT 0,
  cogs NUMERIC(12, 2) DEFAULT 0,
  labor_cost NUMERIC(12, 2) DEFAULT 0,
  overhead_cost NUMERIC(12, 2) DEFAULT 0,
  gross_profit NUMERIC(12, 2) DEFAULT 0,
  net_profit NUMERIC(12, 2) DEFAULT 0,
  profit_margin NUMERIC(5, 2) DEFAULT 0,
  food_cost_percent NUMERIC(5, 2) DEFAULT 0,
  labor_cost_percent NUMERIC(5, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(outlet_id, period_start, period_end)
);

-- Indexes for performance
CREATE INDEX idx_fb_sales_forecasts_outlet ON fb_sales_forecasts(outlet_id);
CREATE INDEX idx_fb_sales_forecasts_date ON fb_sales_forecasts(forecast_date);
CREATE INDEX idx_fb_sales_forecasts_meal_period ON fb_sales_forecasts(meal_period);

CREATE INDEX idx_fb_menu_item_trends_item ON fb_menu_item_trends(menu_item_id);
CREATE INDEX idx_fb_menu_item_trends_outlet ON fb_menu_item_trends(outlet_id);
CREATE INDEX idx_fb_menu_item_trends_period ON fb_menu_item_trends(period_start, period_end);

CREATE INDEX idx_fb_channel_attribution_channel ON fb_channel_attribution(channel);
CREATE INDEX idx_fb_channel_attribution_outlet ON fb_channel_attribution(outlet_id);
CREATE INDEX idx_fb_channel_attribution_period ON fb_channel_attribution(period_start, period_end);

CREATE INDEX idx_fb_dashboard_configurations_user ON fb_dashboard_configurations(user_id);
CREATE INDEX idx_fb_dashboard_configurations_default ON fb_dashboard_configurations(is_default);

CREATE INDEX idx_fb_report_templates_type ON fb_report_templates(report_type);
CREATE INDEX idx_fb_report_templates_created_by ON fb_report_templates(created_by);
CREATE INDEX idx_fb_report_templates_public ON fb_report_templates(is_public);

CREATE INDEX idx_fb_report_executions_template ON fb_report_executions(template_id);
CREATE INDEX idx_fb_report_executions_executed_by ON fb_report_executions(executed_by);
CREATE INDEX idx_fb_report_executions_date ON fb_report_executions(execution_date);

CREATE INDEX idx_fb_benchmarking_data_metric ON fb_benchmarking_data(metric_name);
CREATE INDEX idx_fb_benchmarking_data_category ON fb_benchmarking_data(metric_category);
CREATE INDEX idx_fb_benchmarking_data_year ON fb_benchmarking_data(year);

CREATE INDEX idx_fb_outlet_benchmarks_outlet ON fb_outlet_benchmarks(outlet_id);
CREATE INDEX idx_fb_outlet_benchmarks_date ON fb_outlet_benchmarks(benchmark_date);

CREATE INDEX idx_fb_profit_loss_by_outlet_outlet ON fb_profit_loss_by_outlet(outlet_id);
CREATE INDEX idx_fb_profit_loss_by_outlet_period ON fb_profit_loss_by_outlet(period_start, period_end);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_analytics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER trigger_fb_sales_forecasts_updated_at
  BEFORE UPDATE ON fb_sales_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER trigger_fb_dashboard_configurations_updated_at
  BEFORE UPDATE ON fb_dashboard_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

CREATE TRIGGER trigger_fb_report_templates_updated_at
  BEFORE UPDATE ON fb_report_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_analytics_timestamp();

-- Function to calculate forecast accuracy
CREATE OR REPLACE FUNCTION calculate_forecast_accuracy(
  p_predicted_revenue NUMERIC,
  p_actual_revenue NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_predicted_revenue = 0 THEN
    RETURN 0;
  END IF;
  RETURN (1 - ABS(p_predicted_revenue - p_actual_revenue) / p_predicted_revenue) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate trend direction
CREATE OR REPLACE FUNCTION calculate_trend_direction(
  p_current_value NUMERIC,
  p_previous_value NUMERIC
)
RETURNS TEXT AS $$
DECLARE
  v_change_percent NUMERIC;
BEGIN
  IF p_previous_value = 0 THEN
    RETURN 'stable';
  END IF;
  
  v_change_percent = ((p_current_value - p_previous_value) / p_previous_value) * 100;
  
  IF v_change_percent > 5 THEN
    RETURN 'increasing';
  ELSIF v_change_percent < -5 THEN
    RETURN 'decreasing';
  ELSE
    RETURN 'stable';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate growth rate
CREATE OR REPLACE FUNCTION calculate_growth_rate(
  p_current_value NUMERIC,
  p_previous_value NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_previous_value = 0 THEN
    RETURN 0;
  END IF;
  RETURN ((p_current_value - p_previous_value) / p_previous_value) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate profit margin
CREATE OR REPLACE FUNCTION calculate_profit_margin(
  p_revenue NUMERIC,
  p_net_profit NUMERIC
)
RETURNS NUMERIC AS $$
BEGIN
  IF p_revenue = 0 THEN
    RETURN 0;
  END IF;
  RETURN (p_net_profit / p_revenue) * 100;
END;
$$ LANGUAGE plpgsql;

-- Function to generate sales forecast
CREATE OR REPLACE FUNCTION generate_sales_forecast(
  p_outlet_id TEXT,
  p_forecast_date DATE,
  p_meal_period TEXT DEFAULT 'all_day'
)
RETURNS VOID AS $$
DECLARE
  v_day_of_week INTEGER;
  v_historical_avg_revenue NUMERIC;
  v_historical_avg_orders INTEGER;
  v_seasonality_factor NUMERIC;
  v_predicted_revenue NUMERIC;
  v_predicted_orders INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM p_forecast_date);
  
  -- Get historical average for this day of week
  SELECT 
    COALESCE(AVG(predicted_revenue), 0),
    COALESCE(AVG(predicted_orders), 0)
  INTO v_historical_avg_revenue, v_historical_avg_orders
  FROM fb_sales_forecasts
  WHERE outlet_id = p_outlet_id
    AND EXTRACT(DOW FROM forecast_date) = v_day_of_week
    AND meal_period = p_meal_period
    AND forecast_date >= CURRENT_DATE - INTERVAL '8 weeks';
  
  -- Calculate seasonality factor (simple version)
  v_seasonality_factor := 1.0;
  
  -- Generate forecast with confidence
  v_predicted_revenue := v_historical_avg_revenue * v_seasonality_factor;
  v_predicted_orders := v_historical_avg_orders;
  
  INSERT INTO fb_sales_forecasts (
    outlet_id,
    forecast_date,
    meal_period,
    predicted_revenue,
    predicted_orders,
    confidence,
    factor_historical,
    factor_seasonality
  ) VALUES (
    p_outlet_id,
    p_forecast_date,
    p_meal_period,
    v_predicted_revenue,
    v_predicted_orders,
    75.0,
    0.7,
    v_seasonality_factor
  )
  ON CONFLICT (outlet_id, forecast_date, meal_period)
  DO UPDATE SET
    predicted_revenue = EXCLUDED.predicted_revenue,
    predicted_orders = EXCLUDED.predicted_orders;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate outlet benchmark
CREATE OR REPLACE FUNCTION calculate_outlet_benchmark(
  p_outlet_id TEXT,
  p_benchmark_date DATE,
  p_metric_name TEXT
)
RETURNS VOID AS $$
DECLARE
  v_actual_value NUMERIC;
  v_benchmark_value NUMERIC;
  v_variance NUMERIC;
  v_variance_percent NUMERIC;
  v_percentile NUMERIC;
  v_trend TEXT;
BEGIN
  -- Get actual value from profit/loss table
  SELECT CASE 
    WHEN p_metric_name = 'revenue' THEN revenue
    WHEN p_metric_name = 'labor_cost' THEN labor_cost
    WHEN p_metric_name = 'profit_margin' THEN profit_margin
    ELSE 0
  END INTO v_actual_value
  FROM fb_profit_loss_by_outlet
  WHERE outlet_id = p_outlet_id
    AND period_end = p_benchmark_date;
  
  -- Get benchmark value
  SELECT industry_average INTO v_benchmark_value
  FROM fb_benchmarking_data
  WHERE metric_name = p_metric_name
    AND year = EXTRACT(YEAR FROM p_benchmark_date)
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Calculate variance
  IF v_benchmark_value > 0 THEN
    v_variance := v_actual_value - v_benchmark_value;
    v_variance_percent := (v_variance / v_benchmark_value) * 100;
  ELSE
    v_variance := 0;
    v_variance_percent := 0;
  END IF;
  
  -- Calculate percentile (simplified)
  v_percentile := 50;
  
  -- Determine trend
  IF v_variance_percent > 10 THEN
    v_trend := 'above_average';
  ELSIF v_variance_percent < -10 THEN
    v_trend := 'below_average';
  ELSE
    v_trend := 'average';
  END IF;
  
  -- Insert or update benchmark
  INSERT INTO fb_outlet_benchmarks (
    outlet_id,
    benchmark_date,
    metric_name,
    actual_value,
    benchmark_value,
    variance,
    variance_percent,
    percentile,
    trend
  ) VALUES (
    p_outlet_id,
    p_benchmark_date,
    p_metric_name,
    v_actual_value,
    v_benchmark_value,
    v_variance,
    v_variance_percent,
    v_percentile,
    v_trend
  )
  ON CONFLICT (outlet_id, benchmark_date, metric_name)
  DO UPDATE SET
    actual_value = EXCLUDED.actual_value,
    benchmark_value = EXCLUDED.benchmark_value,
    variance = EXCLUDED.variance,
    variance_percent = EXCLUDED.variance_percent,
    percentile = EXCLUDED.percentile,
    trend = EXCLUDED.trend;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_sales_forecasts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_menu_item_trends TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_channel_attribution TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_dashboard_configurations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_report_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_report_executions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_benchmarking_data TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_outlet_benchmarks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON fb_profit_loss_by_outlet TO authenticated;

GRANT EXECUTE ON FUNCTION calculate_forecast_accuracy(NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_trend_direction(NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_growth_rate(NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_profit_margin(NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION generate_sales_forecast(TEXT, DATE, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_outlet_benchmark(TEXT, DATE, TEXT) TO authenticated;
