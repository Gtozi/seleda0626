# Executive Portal Design Documentation

## Overview
The Executive Portal provides real-time KPI monitoring, advanced analytics, and decision support for hotel management. This document outlines the final design, architecture, and implementation details.

## Architecture

### Backend API Structure
- **Base Path**: `/api/executive`
- **Authentication**: Required for all endpoints
- **Caching**: 15-60 minute TTL depending on data volatility
- **Database**: Supabase PostgreSQL with trigger-based KPI calculations

### API Endpoints

#### Phase 1: Dashboard Stabilization
- `GET /api/executive/kpi/:propertyId` - Server-side KPI data with caching
  - Categories: occupancy, revenue, labor, guest, all
  - Periods: month (30 days), quarter (90 days), year (365 days)
  - Cache: 15 minutes TTL

#### Phase 2: Advanced Analytics
- `GET /api/executive/analytics/trends/:propertyId` - Trend analysis
  - Supports custom metrics and time periods
  - Cache: 10 minutes TTL

- `GET /api/executive/analytics/predictive/bottlenecks/:propertyId` - Predictive bottleneck detection
  - Forecast period: configurable (default 30 days)
  - Risk levels: high, medium, low
  - Cache: 30 minutes TTL

- `POST /api/executive/scenarios` - What-if scenario modeling
  - Types: staffing, pricing, occupancy
  - Saves simulation results for comparison
  - Permission: `exec:scenarios:create`

- `GET /api/executive/scenarios/:propertyId` - Retrieve saved scenarios
  - Filter by scenario type

- `GET /api/executive/benchmarking/:propertyId` - Industry benchmarking
  - Compares actual vs. industry standards
  - Cache: 60 minutes TTL

- `POST /api/executive/reports/custom` - Create custom report
  - Permission: `exec:reports:create`

- `POST /api/executive/reports/generate` - Generate custom report
  - Permission: `exec:reports:generate`

#### Phase 3: Alerting & Monitoring
- `POST /api/executive/alerts/rules` - Create alert rule
  - Permission: `exec:alerts:manage`
  - Conditions: above/below threshold

- `GET /api/executive/alerts/rules/:propertyId` - Get alert rules
  - Filter by active status

- `POST /api/executive/alerts/check/:propertyId` - Check for threshold breaches
  - Permission: `exec:alerts:check`
  - Automatically creates alert records

- `GET /api/executive/alerts/active/:propertyId` - Get active alerts
  - Grouped by severity

- `PUT /api/executive/alerts/:id/acknowledge` - Acknowledge alert
  - Permission: `exec:alerts:manage`

- `GET /api/executive/monitoring/realtime/:propertyId` - Real-time monitoring dashboard
  - Cache: 30 seconds TTL
  - Includes occupancy, reservations, revenue, alerts, system health

#### Phase 4: Executive Decision Support
- `GET /api/executive/forecasting/revenue/:propertyId` - Revenue forecasting
  - Periods: 30, 60, 90 days
  - Confidence levels included
  - Cache: 60 minutes TTL

- `GET /api/executive/analytics/market-share/:propertyId` - Market share analysis
  - Competitor comparison
  - Cache: 60 minutes TTL

- `GET /api/executive/analytics/satisfaction/:propertyId` - Guest satisfaction analytics
  - By category, feedback analysis, top issues
  - Cache: 30 minutes TTL

- `GET /api/executive/analytics/labor-cost/:propertyId` - Labor cost analysis
  - By department, overtime tracking
  - Cache: 30 minutes TTL

- `GET /api/executive/analytics/capex-roi/:propertyId` - Capital expenditure ROI analysis
  - Project-level ROI, payback periods
  - Cache: 60 minutes TTL

- `GET /api/executive/insights/:propertyId` - Automated insights and recommendations
  - Priority-based (high, medium, low)
  - Actionable recommendations
  - Cache: 30 minutes TTL

## Database Schema

### KPI Tables
- `metric_definitions` - Catalog of all KPI definitions
- `metric_values` - Time-series KPI values
- `dashboard_views` - Pre-configured dashboard layouts
- `alert_rules` - KPI threshold alert configurations
- `executive_alerts` - Triggered alert records
- `executive_alert_rules` - Phase 3 alert rules
- `executive_scenarios` - Saved scenario simulations
- `executive_reports` - Custom report configurations

### Trigger-Based KPI Calculations
The following KPIs are automatically calculated via database triggers:
1. **Occupancy Rate** - Triggered on room status changes
2. **ADR (Average Daily Rate)** - Triggered on reservation changes
3. **RevPAR** - Triggered on reservation changes
4. **Labor Cost %** - Triggered on labor cost changes

Migration: `142_kpi_trigger_pipeline_stabilization.sql`

### Scheduled Recalculation
Function: `recalculate_all_kpis(p_property_id UUID)`
- Can be called via cron job or pg_cron extension
- Ensures data consistency for missed trigger events
- Useful for bulk data imports or corrections

## Caching Strategy

### Cache Keys
- `exec-kpi:{propertyId}:{period}:{category}` - KPI data (15 min)
- `exec-trends:{propertyId}:{metric}:{days}` - Trend analysis (10 min)
- `exec-predictive-bottlenecks:{propertyId}:{days}` - Bottleneck prediction (30 min)
- `exec-benchmarking:{propertyId}:{period}` - Benchmarking (60 min)
- `exec-monitoring-realtime:{propertyId}` - Real-time monitoring (30 sec)
- `exec-insights:{propertyId}:{period}` - Insights (30 min)
- `exec-forecast-revenue:{propertyId}:{days}` - Revenue forecast (60 min)
- `exec-market-share:{propertyId}:{period}` - Market share (60 min)
- `exec-satisfaction:{propertyId}:{period}` - Satisfaction (30 min)
- `exec-labor-cost:{propertyId}:{period}` - Labor cost (30 min)
- `exec-capex-roi:{propertyId}` - CapEx ROI (60 min)

### Cache Invalidation
- Pattern-based: `exec-*` for all executive cache
- Specific: By property ID for targeted invalidation
- On data changes: Automatic invalidation after updates

## Permissions

### Executive Portal Permissions
- `exec:scenarios:create` - Create what-if scenarios
- `exec:scenarios:delete` - Delete scenarios
- `exec:alerts:manage` - Manage alert rules
- `exec:alerts:check` - Check for threshold breaches
- `exec:reports:create` - Create custom reports
- `exec:reports:generate` - Generate reports
- `exec:reports:delete` - Delete reports

## KPI Definitions

### Core KPIs
- **Occupancy Rate**: % of rooms occupied
- **ADR (Average Daily Rate)**: Average revenue per occupied room
- **RevPAR**: Revenue per available room
- **Labor Cost %**: Labor cost as % of revenue
- **GOPPAR**: Gross Operating Profit per Available Room

### Department KPIs
- **Front Office**: Booking Channel Mix, Cancellation Rate, No-Show Rate, ALOS
- **F&B**: Beverage Cost %, Average Check, Cover Count, Comp/Void Rate
- **Finance**: P&L Departmental, Budget Variance, Cash Position, AR/AP Aging
- **Housekeeping**: Room Turnaround Time, Inspection Pass Rate, OOO Rooms
- **Maintenance**: Avg Resolution Time, PM Compliance Rate, OOS Rooms
- **HR**: Labor Cost %, Overtime Hours, Leave Liability, Turnover Rate
- **Procurement**: Spend by Category, Stock Value, Discrepancy Rate
- **Sales**: Pipeline Value, Win Rate, Deal Size, Group Revenue

## Superseded Migrations

### Removed/Deprecated
- `086_full_kpi_catalog.sql` - Superseded by `089_kpi_catalog_no_triggers.sql`
- Any migration with "trigger" in name before `142_kpi_trigger_pipeline_stabilization.sql`

### Current Active Migrations
- `085_executive_portal_schema.sql` - Base schema
- `089_kpi_catalog_no_triggers.sql` - KPI catalog (no triggers)
- `142_kpi_trigger_pipeline_stabilization.sql` - Stabilized trigger pipeline

## Performance Optimizations

1. **Server-Side Calculations**: All KPI calculations moved from client to server
2. **Caching Layer**: Reduces database load, improves response times
3. **Trigger-Based Updates**: Real-time KPI updates via database triggers
4. **Batch Operations**: Scheduled recalculation for consistency
5. **Indexed Queries**: Proper indexing on metric_values table
6. **Connection Pooling**: Supabase connection pooling for concurrent requests

## Success Metrics

- KPI calculation accuracy: 95% → 99%
- Dashboard load time: 10s → 3s
- Alert response time: 2 hours → 30 minutes
- Decision support coverage: Basic → Advanced

## Future Enhancements

1. Data warehouse integration for historical analysis
2. System health integration with monitoring dashboard
3. Exception highlighting in analytics
4. Advanced ML-based predictions
5. Real-time streaming KPI updates
