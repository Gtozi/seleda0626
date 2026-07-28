/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export interface RevenueManagementConfig {
  strategy: 'competitor_based' | 'demand_based' | 'mixed';
  enabled: boolean;
  weightCompetitor: number;
  weightDemand: number;
  weightSeasonality: number;
}

export interface PricingConstraints {
  minDiscountPercent: number;
  maxPremiumPercent: number;
  lastMinuteDiscountDays: number;
  lastMinuteDiscountPercent: number;
}

export interface CompetitorSettings {
  updateFrequencyHours: number;
  competitors: string[];
  rateParityThreshold: number;
}

export interface PricingHistory {
  id: string;
  roomTypeId: string;
  date: string;
  baseRate: number;
  effectiveRate: number;
  occupancyRate: number;
  demandScore?: number;
  competitorAvgRate?: number;
  seasonalityFactor?: number;
  eventsImpact?: number;
  pricingSource: string;
}

export interface Competitor {
  id: string;
  name: string;
  code: string;
  starRating?: number;
  proximityKm?: number;
  competitorType: string;
  websiteUrl?: string;
  active: boolean;
}

export interface CompetitorRate {
  id: string;
  competitorId: string;
  roomTypeId: string;
  date: string;
  rate: number;
  currency: string;
  availability?: boolean;
  collectedAt: string;
}

export interface DemandForecast {
  id: string;
  roomTypeId: string;
  forecastDate: string;
  targetDate: string;
  forecastDemand: number;
  forecastOccupancy: number;
  confidenceScore: number;
  modelVersion?: string;
  forecastHorizonDays: number;
  features?: any;
}

export interface PricingRecommendation {
  id: string;
  roomTypeId: string;
  date: string;
  recommendedRate: number;
  currentRate?: number;
  confidence: number;
  recommendationType: string;
  factors: PricingFactors;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  appliedBy?: string;
  appliedAt?: string;
  createdAt: string;
}

export interface PricingFactors {
  demandScore: number;
  competitorAvg: number;
  occupancyForecast: number;
  seasonality: number;
  eventsImpact: number;
  lengthOfStayFactor: number;
  corporateDemand: number;
}

export interface LOSPricingRule {
  id: string;
  roomTypeId: string;
  minNights: number;
  maxNights: number;
  adjustmentPercent: number;
  adjustmentType: 'percent' | 'fixed';
  active: boolean;
  priority: number;
}

export interface CorporateRateAgreement {
  id: string;
  corporateAccountId: string;
  roomTypeId: string;
  rateCode: string;
  negotiatedRate: number;
  discountPercent?: number;
  volumeCommitment?: number;
  effectiveDate: string;
  expiryDate?: string;
  blackoutDates?: string[];
  terms?: string;
  active: boolean;
}

export interface DemandEvent {
  id: string;
  name: string;
  eventType: string;
  startDate: string;
  endDate: string;
  impactScore: number;
  impactRadiusKm?: number;
  expectedAttendees?: number;
  roomDemandImpact: number;
  active: boolean;
}

// ============================================
// REVENUE MANAGEMENT ENGINE
// ============================================

export class RevenueManagementEngine {
  
  // ============================================
  // CONFIGURATION MANAGEMENT
  // ============================================
  
  static async getConfig(key: string): Promise<any> {
    const { data, error } = await supabase
      .from('rms_config')
      .select('config_value')
      .eq('config_key', key)
      .single();
    
    if (error) throw error;
    return data?.config_value;
  }
  
  static async updateConfig(key: string, value: any, userId: string): Promise<void> {
    const { error } = await supabase
      .from('rms_config')
      .update({ 
        config_value: value,
        updated_at: new Date().toISOString(),
        updated_by: userId
      })
      .eq('config_key', key);
    
    if (error) throw error;
  }
  
  // ============================================
  // PRICING HISTORY MANAGEMENT
  // ============================================
  
  static async recordPricingHistory(history: Omit<PricingHistory, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('pricing_history')
      .insert({
        room_type_id: history.roomTypeId,
        date: history.date,
        base_rate: history.baseRate,
        effective_rate: history.effectiveRate,
        occupancy_rate: history.occupancyRate,
        demand_score: history.demandScore,
        competitor_avg_rate: history.competitorAvgRate,
        seasonality_factor: history.seasonalityFactor,
        events_impact: history.eventsImpact,
        pricing_source: history.pricingSource
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async getPricingHistory(roomTypeId: string, startDate: string, endDate: string): Promise<PricingHistory[]> {
    const { data, error } = await supabase
      .from('pricing_history')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data.map(this.mapPricingHistory);
  }
  
  static async getCurrentPricing(roomTypeId: string, date: string): Promise<PricingHistory | null> {
    const { data, error } = await supabase
      .from('pricing_history')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .eq('date', date)
      .single();
    
    if (error || !data) return null;
    return this.mapPricingHistory(data);
  }
  
  private static mapPricingHistory(data: any): PricingHistory {
    return {
      id: data.id,
      roomTypeId: data.room_type_id,
      date: data.date,
      baseRate: data.base_rate,
      effectiveRate: data.effective_rate,
      occupancyRate: data.occupancy_rate,
      demandScore: data.demand_score,
      competitorAvgRate: data.competitor_avg_rate,
      seasonalityFactor: data.seasonality_factor,
      eventsImpact: data.events_impact,
      pricingSource: data.pricing_source
    };
  }
  
  // ============================================
  // COMPETITOR MANAGEMENT
  // ============================================
  
  static async addCompetitor(competitor: Omit<Competitor, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('competitors')
      .insert({
        name: competitor.name,
        code: competitor.code,
        star_rating: competitor.starRating,
        proximity_km: competitor.proximityKm,
        competitor_type: competitor.competitorType,
        website_url: competitor.websiteUrl,
        active: competitor.active
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async getCompetitors(): Promise<Competitor[]> {
    const { data, error } = await supabase
      .from('competitors')
      .select('*')
      .eq('active', true)
      .order('name');
    
    if (error) throw error;
    return data.map(this.mapCompetitor);
  }
  
  static async recordCompetitorRate(rate: Omit<CompetitorRate, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('competitor_rates')
      .insert({
        competitor_id: rate.competitorId,
        room_type_id: rate.roomTypeId,
        date: rate.date,
        rate: rate.rate,
        currency: rate.currency,
        availability: rate.availability,
        collected_at: rate.collectedAt
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async getCompetitorRates(roomTypeId: string, date: string): Promise<CompetitorRate[]> {
    const { data, error } = await supabase
      .from('competitor_rates')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .eq('date', date)
      .order('rate', { ascending: true });
    
    if (error) throw error;
    return data.map(this.mapCompetitorRate);
  }
  
  static async getAverageCompetitorRate(roomTypeId: string, date: string): Promise<number | null> {
    const rates = await this.getCompetitorRates(roomTypeId, date);
    if (rates.length === 0) return null;
    
    const sum = rates.reduce((acc, rate) => acc + rate.rate, 0);
    return sum / rates.length;
  }
  
  private static mapCompetitor(data: any): Competitor {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      starRating: data.star_rating,
      proximityKm: data.proximity_km,
      competitorType: data.competitor_type,
      websiteUrl: data.website_url,
      active: data.active
    };
  }
  
  private static mapCompetitorRate(data: any): CompetitorRate {
    return {
      id: data.id,
      competitorId: data.competitor_id,
      roomTypeId: data.room_type_id,
      date: data.date,
      rate: data.rate,
      currency: data.currency,
      availability: data.availability,
      collectedAt: data.collected_at
    };
  }
  
  // ============================================
  // DEMAND FORECASTING
  // ============================================
  
  static async createDemandForecast(forecast: Omit<DemandForecast, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('demand_forecasts')
      .insert({
        room_type_id: forecast.roomTypeId,
        forecast_date: forecast.forecastDate,
        target_date: forecast.targetDate,
        forecast_demand: forecast.forecastDemand,
        forecast_occupancy: forecast.forecastOccupancy,
        confidence_score: forecast.confidenceScore,
        model_version: forecast.modelVersion,
        forecast_horizon_days: forecast.forecastHorizonDays,
        features: forecast.features
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async getDemandForecast(roomTypeId: string, targetDate: string): Promise<DemandForecast | null> {
    const { data, error } = await supabase
      .from('demand_forecasts')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .eq('target_date', targetDate)
      .order('forecast_date', { ascending: false })
      .limit(1)
      .single();
    
    if (error || !data) return null;
    return this.mapDemandForecast(data);
  }
  
  static async getDemandForecasts(roomTypeId: string, startDate: string, endDate: string): Promise<DemandForecast[]> {
    const { data, error } = await supabase
      .from('demand_forecasts')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .gte('target_date', startDate)
      .lte('target_date', endDate)
      .order('target_date', { ascending: true });
    
    if (error) throw error;
    return data.map(this.mapDemandForecast);
  }
  
  private static mapDemandForecast(data: any): DemandForecast {
    return {
      id: data.id,
      roomTypeId: data.room_type_id,
      forecastDate: data.forecast_date,
      targetDate: data.target_date,
      forecastDemand: data.forecast_demand,
      forecastOccupancy: data.forecast_occupancy,
      confidenceScore: data.confidence_score,
      modelVersion: data.model_version,
      forecastHorizonDays: data.forecast_horizon_days,
      features: data.features
    };
  }
  
  // ============================================
  // PRICING RECOMMENDATIONS
  // ============================================
  
  static async generatePricingRecommendation(
    roomTypeId: string,
    date: string,
    currentRate?: number
  ): Promise<PricingRecommendation> {
    // Gather all the factors needed for pricing decision
    const [demandScore, competitorAvg, occupancyForecast, seasonality, eventsImpact] = await Promise.all([
      this.calculateDemandScore(roomTypeId, date),
      this.getAverageCompetitorRate(roomTypeId, date),
      this.getOccupancyForecast(roomTypeId, date),
      this.getSeasonalityFactor(roomTypeId, date),
      this.getEventsImpact(date)
    ]);
    
    const config = await this.getConfig('pricing_strategy') as RevenueManagementConfig;
    const constraints = await this.getConfig('rate_constraints') as PricingConstraints;
    
    // Calculate recommended rate based on strategy
    let recommendedRate: number;
    let confidence: number;
    
    if (config.strategy === 'competitor_based' || config.strategy === 'mixed') {
      // Competitor-based pricing
      const baseFromCompetitor = competitorAvg || currentRate || 0;
      const competitorAdjustment = this.calculateCompetitorAdjustment(baseFromCompetitor, demandScore, occupancyForecast);
      recommendedRate = baseFromCompetitor * (1 + competitorAdjustment);
      confidence = competitorAvg ? 0.8 : 0.5;
    } else {
      // Demand-based pricing
      const baseFromDemand = currentRate || 100;
      const demandAdjustment = this.calculateDemandAdjustment(demandScore, occupancyForecast, eventsImpact);
      recommendedRate = baseFromDemand * (1 + demandAdjustment);
      confidence = 0.7;
    }
    
    // Apply constraints
    if (currentRate) {
      const minRate = currentRate * (1 - constraints.minDiscountPercent / 100);
      const maxRate = currentRate * (1 + constraints.maxPremiumPercent / 100);
      recommendedRate = Math.max(minRate, Math.min(maxRate, recommendedRate));
    }
    
    // Apply last-minute discount if applicable
    const daysUntilDate = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (daysUntilDate <= constraints.lastMinuteDiscountDays && daysUntilDate > 0) {
      recommendedRate *= (1 - constraints.lastMinuteDiscountPercent / 100);
    }
    
    const factors: PricingFactors = {
      demandScore: demandScore || 0,
      competitorAvg: competitorAvg || 0,
      occupancyForecast: occupancyForecast || 0,
      seasonality: seasonality || 0,
      eventsImpact: eventsImpact || 0,
      lengthOfStayFactor: 0,
      corporateDemand: 0
    };
    
    // Store recommendation
    const { data, error } = await supabase
      .from('pricing_recommendations')
      .insert({
        room_type_id: roomTypeId,
        date: date,
        recommended_rate: recommendedRate,
        current_rate: currentRate,
        confidence: confidence,
        recommendation_type: config.strategy,
        factors: factors,
        status: 'pending'
      })
      .select('*')
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      roomTypeId: data.room_type_id,
      date: data.date,
      recommendedRate: data.recommended_rate,
      currentRate: data.current_rate,
      confidence: data.confidence,
      recommendationType: data.recommendation_type,
      factors: data.factors,
      status: data.status,
      appliedBy: data.applied_by,
      appliedAt: data.applied_at,
      createdAt: data.created_at
    };
  }
  
  static async getPricingRecommendations(roomTypeId: string, startDate: string, endDate: string): Promise<PricingRecommendation[]> {
    const { data, error } = await supabase
      .from('pricing_recommendations')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data.map(this.mapPricingRecommendation);
  }
  
  static async applyPricingRecommendation(recommendationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_recommendations')
      .update({
        status: 'applied',
        applied_by: userId,
        applied_at: new Date().toISOString()
      })
      .eq('id', recommendationId);
    
    if (error) throw error;
    
    // Also record in pricing history
    const recommendation = await this.getPricingRecommendationById(recommendationId);
    if (recommendation) {
      await this.recordPricingHistory({
        roomTypeId: recommendation.roomTypeId,
        date: recommendation.date,
        baseRate: recommendation.currentRate || recommendation.recommendedRate,
        effectiveRate: recommendation.recommendedRate,
        occupancyRate: recommendation.factors.occupancyForecast,
        demandScore: recommendation.factors.demandScore,
        competitorAvgRate: recommendation.factors.competitorAvg,
        seasonalityFactor: recommendation.factors.seasonality,
        eventsImpact: recommendation.factors.eventsImpact,
        pricingSource: 'rms_recommendation'
      });
    }
  }
  
  static async rejectPricingRecommendation(recommendationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('pricing_recommendations')
      .update({
        status: 'rejected',
        applied_by: userId,
        applied_at: new Date().toISOString()
      })
      .eq('id', recommendationId);
    
    if (error) throw error;
  }
  
  private static async getPricingRecommendationById(id: string): Promise<PricingRecommendation | null> {
    const { data, error } = await supabase
      .from('pricing_recommendations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return null;
    return this.mapPricingRecommendation(data);
  }
  
  private static mapPricingRecommendation(data: any): PricingRecommendation {
    return {
      id: data.id,
      roomTypeId: data.room_type_id,
      date: data.date,
      recommendedRate: data.recommended_rate,
      currentRate: data.current_rate,
      confidence: data.confidence,
      recommendationType: data.recommendation_type,
      factors: data.factors,
      status: data.status,
      appliedBy: data.applied_by,
      appliedAt: data.applied_at,
      createdAt: data.created_at
    };
  }
  
  // ============================================
  // HELPER METHODS
  // ============================================
  
  private static async calculateDemandScore(roomTypeId: string, date: string): Promise<number> {
    // Call the database function we created
    const { data, error } = await supabase
      .rpc('calculate_demand_score', {
        p_room_type_id: roomTypeId,
        p_date: date
      });
    
    if (error) return 50; // Default mid-range score
    return data || 50;
  }
  
  private static async getOccupancyForecast(roomTypeId: string, date: string): Promise<number> {
    const forecast = await this.getDemandForecast(roomTypeId, date);
    return forecast?.forecastOccupancy || 70; // Default 70% occupancy
  }
  
  private static async getSeasonalityFactor(roomTypeId: string, date: string): Promise<number> {
    // Simplified seasonality calculation
    const month = new Date(date).getMonth();
    // Peak season: Dec-Jan (month 11, 0), shoulder: Feb-May, Jun-Sep, low: Oct-Nov
    if ([11, 0].includes(month)) return 1.3; // Peak
    if ([1, 2, 3, 4].includes(month)) return 1.1; // High shoulder
    if ([5, 6, 7, 8].includes(month)) return 0.9; // Low shoulder
    return 0.8; // Low season
  }
  
  private static async getEventsImpact(date: string): Promise<number> {
    const { data, error } = await supabase
      .from('demand_events')
      .select('impact_score')
      .eq('active', true)
      .lte('start_date', date)
      .gte('end_date', date);
    
    if (error || !data || data.length === 0) return 0;
    
    // Return the highest impact score from active events
    return Math.max(...data.map((e: any) => e.impact_score || 0));
  }
  
  private static calculateCompetitorAdjustment(baseRate: number, demandScore: number, occupancyForecast: number): number {
    // If demand is high and occupancy is forecasted high, we can price above competitors
    if (demandScore > 70 && occupancyForecast > 80) {
      return 0.1; // 10% above competitors
    } else if (demandScore > 60 && occupancyForecast > 70) {
      return 0.05; // 5% above competitors
    } else if (demandScore < 40 && occupancyForecast < 50) {
      return -0.1; // 10% below competitors
    }
    return 0; // Match competitors
  }
  
  private static calculateDemandAdjustment(demandScore: number, occupancyForecast: number, eventsImpact: number): number {
    // Demand-based pricing adjustment
    let adjustment = 0;
    
    // Demand score impact (0-100)
    adjustment += (demandScore - 50) * 0.002; // -0.1 to +0.1
    
    // Occupancy forecast impact
    if (occupancyForecast > 90) adjustment += 0.15;
    else if (occupancyForecast > 80) adjustment += 0.1;
    else if (occupancyForecast > 70) adjustment += 0.05;
    else if (occupancyForecast < 50) adjustment -= 0.1;
    
    // Events impact
    adjustment += (eventsImpact / 100) * 0.1;
    
    return adjustment;
  }
  
  // ============================================
  // LENGTH OF STAY PRICING
  // ============================================
  
  static async addLOSPricingRule(rule: Omit<LOSPricingRule, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('los_pricing_rules')
      .insert({
        room_type_id: rule.roomTypeId,
        min_nights: rule.minNights,
        max_nights: rule.maxNights,
        adjustment_percent: rule.adjustmentPercent,
        adjustment_type: rule.adjustmentType,
        active: rule.active,
        priority: rule.priority
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async getLOSPricingRules(roomTypeId: string): Promise<LOSPricingRule[]> {
    const { data, error } = await supabase
      .from('los_pricing_rules')
      .select('*')
      .eq('room_type_id', roomTypeId)
      .eq('active', true)
      .order('priority', { ascending: false });
    
    if (error) throw error;
    return data.map(this.mapLOSPricingRule);
  }
  
  static async calculateLOSAdjustment(roomTypeId: string, nights: number, baseRate: number): Promise<number> {
    const rules = await this.getLOSPricingRules(roomTypeId);
    
    for (const rule of rules) {
      if (nights >= rule.minNights && nights <= rule.maxNights) {
        if (rule.adjustmentType === 'percent') {
          return baseRate * (rule.adjustmentPercent / 100);
        } else {
          return rule.adjustmentPercent;
        }
      }
    }
    
    return 0; // No adjustment
  }
  
  private static mapLOSPricingRule(data: any): LOSPricingRule {
    return {
      id: data.id,
      roomTypeId: data.room_type_id,
      minNights: data.min_nights,
      maxNights: data.max_nights,
      adjustmentPercent: data.adjustment_percent,
      adjustmentType: data.adjustment_type,
      active: data.active,
      priority: data.priority
    };
  }
  
  // ============================================
  // CORPORATE RATE MANAGEMENT
  // ============================================
  
  static async addCorporateRateAgreement(agreement: Omit<CorporateRateAgreement, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('corporate_rate_agreements')
      .insert({
        corporate_account_id: agreement.corporateAccountId,
        room_type_id: agreement.roomTypeId,
        rate_code: agreement.rateCode,
        negotiated_rate: agreement.negotiatedRate,
        discount_percent: agreement.discountPercent,
        volume_commitment: agreement.volumeCommitment,
        effective_date: agreement.effectiveDate,
        expiry_date: agreement.expiryDate,
        blackout_dates: agreement.blackoutDates,
        terms: agreement.terms,
        active: agreement.active
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async getCorporateRateAgreement(corporateAccountId: string, roomTypeId: string): Promise<CorporateRateAgreement | null> {
    const { data, error } = await supabase
      .from('corporate_rate_agreements')
      .select('*')
      .eq('corporate_account_id', corporateAccountId)
      .eq('room_type_id', roomTypeId)
      .eq('active', true)
      .lte('effective_date', new Date().toISOString().split('T')[0])
      .or('expiry_date.is.null,expiry_date.gte.' + new Date().toISOString().split('T')[0])
      .single();
    
    if (error || !data) return null;
    return this.mapCorporateRateAgreement(data);
  }
  
  private static mapCorporateRateAgreement(data: any): CorporateRateAgreement {
    return {
      id: data.id,
      corporateAccountId: data.corporate_account_id,
      roomTypeId: data.room_type_id,
      rateCode: data.rate_code,
      negotiatedRate: data.negotiated_rate,
      discountPercent: data.discount_percent,
      volumeCommitment: data.volume_commitment,
      effectiveDate: data.effective_date,
      expiryDate: data.expiry_date,
      blackoutDates: data.blackout_dates,
      terms: data.terms,
      active: data.active
    };
  }
  
  // ============================================
  // DEMAND EVENTS MANAGEMENT
  // ============================================
  
  static async addDemandEvent(event: Omit<DemandEvent, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('demand_events')
      .insert({
        name: event.name,
        event_type: event.eventType,
        start_date: event.startDate,
        end_date: event.endDate,
        impact_score: event.impactScore,
        impact_radius_km: event.impactRadiusKm,
        expected_attendees: event.expectedAttendees,
        room_demand_impact: event.roomDemandImpact,
        active: event.active
      })
      .select('id')
      .single();
    
    if (error) throw error;
    return data.id;
  }
  
  static async getActiveDemandEvents(startDate: string, endDate: string): Promise<DemandEvent[]> {
    const { data, error } = await supabase
      .from('demand_events')
      .select('*')
      .eq('active', true)
      .gte('end_date', startDate)
      .lte('start_date', endDate)
      .order('impact_score', { ascending: false });
    
    if (error) throw error;
    return data.map(this.mapDemandEvent);
  }
  
  private static mapDemandEvent(data: any): DemandEvent {
    return {
      id: data.id,
      name: data.name,
      eventType: data.event_type,
      startDate: data.start_date,
      endDate: data.end_date,
      impactScore: data.impact_score,
      impactRadiusKm: data.impact_radius_km,
      expectedAttendees: data.expected_attendees,
      roomDemandImpact: data.room_demand_impact,
      active: data.active
    };
  }
  
  // ============================================
  // BATCH OPERATIONS
  // ============================================
  
  static async generateDailyRecommendations(date: string): Promise<PricingRecommendation[]> {
    // Get all room types
    const { data: roomTypes, error: rtError } = await supabase
      .from('room_types')
      .select('id')
      .eq('active', true);
    
    if (rtError || !roomTypes) return [];
    
    const recommendations: PricingRecommendation[] = [];
    
    for (const roomType of roomTypes) {
      try {
        const recommendation = await this.generatePricingRecommendation(roomType.id, date);
        recommendations.push(recommendation);
      } catch (error) {
        console.error(`Failed to generate recommendation for room type ${roomType.id}:`, error);
      }
    }
    
    return recommendations;
  }
  
  static async batchApplyRecommendations(recommendationIds: string[], userId: string): Promise<void> {
    for (const id of recommendationIds) {
      try {
        await this.applyPricingRecommendation(id, userId);
      } catch (error) {
        console.error(`Failed to apply recommendation ${id}:`, error);
      }
    }
  }
}
