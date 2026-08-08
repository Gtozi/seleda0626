/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { RevenueManagementEngine } from '../../services/revenueManagementService';
import { ChannelManagerService } from '../../services/channelManagerService';
import { authenticate, requirePermission, requireRole } from '../middleware/auth';

const router = express.Router();

// ============================================
// REVENUE MANAGEMENT SYSTEM (RMS) ENDPOINTS
// ============================================

// ============================================
// NEW MODULE ROUTES - Enhanced RMS Architecture
// ============================================

// Dynamic Pricing Strategies
router.get('/dynamic-pricing/strategies', authenticate, async (req, res) => {
  try {
    const strategies = await RevenueManagementEngine.getDynamicPricingStrategies();
    res.json({ success: true, data: strategies });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/dynamic-pricing/strategies', authenticate, requirePermission('rms:pricing:manage'), async (req, res) => {
  try {
    const strategyId = await RevenueManagementEngine.createDynamicPricingStrategy(req.body);
    res.json({ success: true, id: strategyId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/dynamic-pricing/strategies/:id', authenticate, requirePermission('rms:pricing:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    await RevenueManagementEngine.updateDynamicPricingStrategy(id, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rate Management
router.get('/rate-plans', authenticate, async (req, res) => {
  try {
    const ratePlans = await RevenueManagementEngine.getRatePlans();
    res.json({ success: true, data: ratePlans });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/rate-plans', authenticate, requirePermission('rms:rates:manage'), async (req, res) => {
  try {
    const planId = await RevenueManagementEngine.createRatePlan(req.body);
    res.json({ success: true, id: planId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inventory Controls
router.get('/inventory/allocations', authenticate, async (req, res) => {
  try {
    const { roomTypeId, date } = req.query;
    const allocations = await RevenueManagementEngine.getInventoryAllocations(
      roomTypeId as string,
      date as string
    );
    res.json({ success: true, data: allocations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/inventory/allocations', authenticate, requirePermission('rms:inventory:manage'), async (req, res) => {
  try {
    await RevenueManagementEngine.updateInventoryAllocation(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Yield Management
router.get('/yield/scenarios', authenticate, async (req, res) => {
  try {
    const scenarios = await RevenueManagementEngine.getYieldScenarios();
    res.json({ success: true, data: scenarios });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/yield/optimize', authenticate, requirePermission('rms:yield:optimize'), async (req, res) => {
  try {
    const optimization = await RevenueManagementEngine.runYieldOptimization(req.body);
    res.json({ success: true, data: optimization });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Market Segmentation
router.get('/segments', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const segments = await RevenueManagementEngine.getMarketSegmentation(
      startDate as string,
      endDate as string
    );
    res.json({ success: true, data: segments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Channel Performance
router.get('/channels/performance', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const performance = await RevenueManagementEngine.getChannelPerformance(
      startDate as string,
      endDate as string
    );
    res.json({ success: true, data: performance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Distribution Management
router.get('/distribution/channels', authenticate, async (req, res) => {
  try {
    const channels = await RevenueManagementEngine.getDistributionChannels();
    res.json({ success: true, data: channels });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/distribution/sync', authenticate, requirePermission('rms:distribution:sync'), async (req, res) => {
  try {
    await RevenueManagementEngine.syncDistributionChannels(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Group Evaluation
router.get('/groups/evaluations', authenticate, async (req, res) => {
  try {
    const evaluations = await RevenueManagementEngine.getGroupEvaluations();
    res.json({ success: true, data: evaluations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/groups/evaluate', authenticate, requirePermission('rms:groups:evaluate'), async (req, res) => {
  try {
    const evaluation = await RevenueManagementEngine.evaluateGroupInquiry(req.body);
    res.json({ success: true, data: evaluation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Displacement Analysis
router.post('/displacement/analyze', authenticate, requirePermission('rms:displacement:analyze'), async (req, res) => {
  try {
    const analysis = await RevenueManagementEngine.runDisplacementAnalysis(req.body);
    res.json({ success: true, data: analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Overbooking Management
router.get('/overbooking/limits', authenticate, async (req, res) => {
  try {
    const limits = await RevenueManagementEngine.getOverbookingLimits();
    res.json({ success: true, data: limits });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/overbooking/limits', authenticate, requirePermission('rms:overbooking:manage'), async (req, res) => {
  try {
    await RevenueManagementEngine.updateOverbookingLimits(req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Restrictions Management
router.get('/restrictions', authenticate, async (req, res) => {
  try {
    const { roomTypeId, date } = req.query;
    const restrictions = await RevenueManagementEngine.getRestrictions(
      roomTypeId as string,
      date as string
    );
    res.json({ success: true, data: restrictions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/restrictions', authenticate, requirePermission('rms:restrictions:manage'), async (req, res) => {
  try {
    const restrictionId = await RevenueManagementEngine.createRestriction(req.body);
    res.json({ success: true, id: restrictionId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Package Pricing
router.get('/packages', authenticate, async (req, res) => {
  try {
    const packages = await RevenueManagementEngine.getPackages();
    res.json({ success: true, data: packages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/packages', authenticate, requirePermission('rms:packages:manage'), async (req, res) => {
  try {
    const packageId = await RevenueManagementEngine.createPackage(req.body);
    res.json({ success: true, id: packageId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Promotions Analysis
router.get('/promotions', authenticate, async (req, res) => {
  try {
    const promotions = await RevenueManagementEngine.getPromotions();
    res.json({ success: true, data: promotions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/promotions/analytics', authenticate, async (req, res) => {
  try {
    const { promotionId, startDate, endDate } = req.query;
    const analytics = await RevenueManagementEngine.getPromotionAnalytics(
      promotionId as string,
      startDate as string,
      endDate as string
    );
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Business Intelligence
router.get('/bi/analytics', authenticate, async (req, res) => {
  try {
    const { startDate, endDate, metrics } = req.query;
    const analytics = await RevenueManagementEngine.getBIAnalytics(
      startDate as string,
      endDate as string,
      metrics as string
    );
    res.json({ success: true, data: analytics });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/bi/trends', authenticate, async (req, res) => {
  try {
    const { metric, period } = req.query;
    const trends = await RevenueManagementEngine.getBITrends(
      metric as string,
      period as string
    );
    res.json({ success: true, data: trends });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// AI Recommendations
router.get('/ai/recommendations', authenticate, async (req, res) => {
  try {
    const { category, limit } = req.query;
    const recommendations = await RevenueManagementEngine.getAIRecommendations(
      category as string,
      limit as string
    );
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/ai/recommendations/generate', authenticate, requirePermission('rms:ai:generate'), async (req, res) => {
  try {
    const recommendations = await RevenueManagementEngine.generateAIRecommendations(req.body);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Scenario Planning
router.get('/scenarios', authenticate, async (req, res) => {
  try {
    const scenarios = await RevenueManagementEngine.getScenarios();
    res.json({ success: true, data: scenarios });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scenarios', authenticate, requirePermission('rms:scenarios:manage'), async (req, res) => {
  try {
    const scenarioId = await RevenueManagementEngine.createScenario(req.body);
    res.json({ success: true, id: scenarioId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/scenarios/compare', authenticate, async (req, res) => {
  try {
    const comparison = await RevenueManagementEngine.compareScenarios(req.body);
    res.json({ success: true, data: comparison });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reports
router.get('/reports', authenticate, async (req, res) => {
  try {
    const { category } = req.query;
    const reports = await RevenueManagementEngine.getReports(category as string);
    res.json({ success: true, data: reports });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/reports/generate', authenticate, requirePermission('rms:reports:generate'), async (req, res) => {
  try {
    const report = await RevenueManagementEngine.generateReport(req.body);
    res.json({ success: true, data: report });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Configuration Management (Enhanced)
router.get('/config/all', authenticate, async (req, res) => {
  try {
    const config = await RevenueManagementEngine.getAllConfig();
    res.json({ success: true, data: config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/config/batch', authenticate, requirePermission('rms:config:update'), async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    await RevenueManagementEngine.updateBatchConfig(req.body, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// END OF NEW MODULE ROUTES
// ============================================

// Configuration Management
router.get('/config', authenticate, async (req, res) => {
  try {
    const { key } = req.query;
    if (key && typeof key === 'string') {
      const config = await RevenueManagementEngine.getConfig(key);
      res.json({ success: true, config });
    } else {
      res.json({ success: false, error: 'Key parameter required' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/config', authenticate, requirePermission('rms:config:update'), async (req, res) => {
  try {
    const { key, value } = req.body;
    const userId = (req as any).user?.id;
    await RevenueManagementEngine.updateConfig(key, value, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pricing History
router.get('/pricing-history', authenticate, async (req, res) => {
  try {
    const { roomTypeId, startDate, endDate } = req.query;
    if (!roomTypeId || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const history = await RevenueManagementEngine.getPricingHistory(
      roomTypeId as string,
      startDate as string,
      endDate as string
    );
    res.json({ success: true, data: history });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/pricing-history/current', authenticate, async (req, res) => {
  try {
    const { roomTypeId, date } = req.query;
    if (!roomTypeId || !date) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const pricing = await RevenueManagementEngine.getCurrentPricing(
      roomTypeId as string,
      date as string
    );
    res.json({ success: true, data: pricing });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Competitor Management
router.get('/competitors', authenticate, async (req, res) => {
  try {
    const competitors = await RevenueManagementEngine.getCompetitors();
    res.json({ success: true, data: competitors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/competitors', authenticate, requirePermission('rms:competitors:manage'), async (req, res) => {
  try {
    const competitorId = await RevenueManagementEngine.addCompetitor(req.body);
    res.json({ success: true, id: competitorId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/competitors/rates', authenticate, async (req, res) => {
  try {
    const { roomTypeId, date } = req.query;
    if (!roomTypeId || !date) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const rates = await RevenueManagementEngine.getCompetitorRates(
      roomTypeId as string,
      date as string
    );
    res.json({ success: true, data: rates });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/competitors/average-rate', authenticate, async (req, res) => {
  try {
    const { roomTypeId, date } = req.query;
    if (!roomTypeId || !date) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const avgRate = await RevenueManagementEngine.getAverageCompetitorRate(
      roomTypeId as string,
      date as string
    );
    res.json({ success: true, data: avgRate });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Demand Forecasting
router.get('/forecasts', authenticate, async (req, res) => {
  try {
    const { roomTypeId, startDate, endDate } = req.query;
    if (!roomTypeId || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const forecasts = await RevenueManagementEngine.getDemandForecasts(
      roomTypeId as string,
      startDate as string,
      endDate as string
    );
    res.json({ success: true, data: forecasts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/forecasts/current', authenticate, async (req, res) => {
  try {
    const { roomTypeId, targetDate } = req.query;
    if (!roomTypeId || !targetDate) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const forecast = await RevenueManagementEngine.getDemandForecast(
      roomTypeId as string,
      targetDate as string
    );
    res.json({ success: true, data: forecast });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Pricing Recommendations
router.post('/recommendations/generate', authenticate, requirePermission('rms:recommendations:generate'), async (req, res) => {
  try {
    const { roomTypeId, date, currentRate } = req.body;
    if (!roomTypeId || !date) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const recommendation = await RevenueManagementEngine.generatePricingRecommendation(
      roomTypeId,
      date,
      currentRate
    );
    res.json({ success: true, data: recommendation });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const { roomTypeId, startDate, endDate } = req.query;
    if (!roomTypeId || !startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const recommendations = await RevenueManagementEngine.getPricingRecommendations(
      roomTypeId as string,
      startDate as string,
      endDate as string
    );
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/recommendations/:id/apply', authenticate, requirePermission('rms:recommendations:apply'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    await RevenueManagementEngine.applyPricingRecommendation(id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/recommendations/:id/reject', authenticate, requirePermission('rms:recommendations:apply'), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    await RevenueManagementEngine.rejectPricingRecommendation(id, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Length of Stay Pricing Rules
router.get('/los-rules', authenticate, async (req, res) => {
  try {
    const { roomTypeId } = req.query;
    if (!roomTypeId) {
      return res.status(400).json({ success: false, error: 'Missing roomTypeId parameter' });
    }
    const rules = await RevenueManagementEngine.getLOSPricingRules(roomTypeId as string);
    res.json({ success: true, data: rules });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/los-rules', authenticate, requirePermission('rms:los:manage'), async (req, res) => {
  try {
    const ruleId = await RevenueManagementEngine.addLOSPricingRule(req.body);
    res.json({ success: true, id: ruleId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/los-rules/calculate', authenticate, async (req, res) => {
  try {
    const { roomTypeId, nights, baseRate } = req.query;
    if (!roomTypeId || !nights || !baseRate) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const adjustment = await RevenueManagementEngine.calculateLOSAdjustment(
      roomTypeId as string,
      parseInt(nights as string),
      parseFloat(baseRate as string)
    );
    res.json({ success: true, data: adjustment });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Corporate Rate Agreements
router.get('/corporate-rates', authenticate, async (req, res) => {
  try {
    const { corporateAccountId, roomTypeId } = req.query;
    if (!corporateAccountId || !roomTypeId) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const agreement = await RevenueManagementEngine.getCorporateRateAgreement(
      corporateAccountId as string,
      roomTypeId as string
    );
    res.json({ success: true, data: agreement });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/corporate-rates', authenticate, requirePermission('rms:corporate:manage'), async (req, res) => {
  try {
    const agreementId = await RevenueManagementEngine.addCorporateRateAgreement(req.body);
    res.json({ success: true, id: agreementId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Demand Events
router.get('/events', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }
    const events = await RevenueManagementEngine.getActiveDemandEvents(
      startDate as string,
      endDate as string
    );
    res.json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/events', authenticate, requirePermission('rms:events:manage'), async (req, res) => {
  try {
    const eventId = await RevenueManagementEngine.addDemandEvent(req.body);
    res.json({ success: true, id: eventId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch Operations
router.post('/recommendations/generate-daily', authenticate, requirePermission('rms:recommendations:generate'), async (req, res) => {
  try {
    const { date } = req.body;
    const recommendations = await RevenueManagementEngine.generateDailyRecommendations(date);
    res.json({ success: true, data: recommendations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/recommendations/batch-apply', authenticate, requirePermission('rms:recommendations:apply'), async (req, res) => {
  try {
    const { recommendationIds } = req.body;
    const userId = (req as any).user?.id;
    await RevenueManagementEngine.batchApplyRecommendations(recommendationIds, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CHANNEL MANAGER ENDPOINTS
// ============================================

// Channel Connections
router.get('/channels', authenticate, async (req, res) => {
  try {
    const channels = await ChannelManagerService.getChannelConnections();
    res.json({ success: true, data: channels });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/channels/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const channel = await ChannelManagerService.getChannelConnection(id);
    if (!channel) {
      return res.status(404).json({ success: false, error: 'Channel not found' });
    }
    res.json({ success: true, data: channel });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/channels/:id/credentials', authenticate, requirePermission('channel:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const { credentials } = req.body;
    await ChannelManagerService.updateChannelCredentials(id, credentials);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/channels/:id/test', authenticate, requirePermission('channel:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ChannelManagerService.testChannelConnection(id);
    res.json({ success: true, connected: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Room Mappings
router.get('/channels/:channelId/mappings', authenticate, async (req, res) => {
  try {
    const { channelId } = req.params;
    const mappings = await ChannelManagerService.getChannelRoomMappings(channelId);
    res.json({ success: true, data: mappings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/channels/mappings', authenticate, requirePermission('channel:manage'), async (req, res) => {
  try {
    const mappingId = await ChannelManagerService.addChannelRoomMapping(req.body);
    res.json({ success: true, id: mappingId });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/channels/mappings/:id', authenticate, requirePermission('channel:manage'), async (req, res) => {
  try {
    const { id } = req.params;
    await ChannelManagerService.updateChannelRoomMapping(id, req.body);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Inventory Sync
router.post('/channels/:channelId/sync/inventory', authenticate, requirePermission('channel:sync'), async (req, res) => {
  try {
    const { channelId } = req.params;
    const { startDate, endDate } = req.body;
    const result = await ChannelManagerService.syncInventoryToChannel(
      channelId,
      startDate,
      endDate
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rate Sync
router.post('/channels/:channelId/sync/rates', authenticate, requirePermission('channel:sync'), async (req, res) => {
  try {
    const { channelId } = req.params;
    const { startDate, endDate } = req.body;
    const result = await ChannelManagerService.syncRatesToChannel(
      channelId,
      startDate,
      endDate
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Booking Sync
router.post('/channels/:channelId/sync/bookings', authenticate, requirePermission('channel:sync'), async (req, res) => {
  try {
    const { channelId } = req.params;
    const { startDate, endDate } = req.body;
    const result = await ChannelManagerService.fetchBookingsFromChannel(
      channelId,
      startDate,
      endDate
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Batch Sync
router.post('/channels/sync-all', authenticate, requirePermission('channel:sync'), async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const results = await ChannelManagerService.syncAllChannels(startDate, endDate);
    res.json({ success: true, data: results });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
