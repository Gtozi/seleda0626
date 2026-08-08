/**
 * Composed API router — single mount point for all route files.
 *
 * Phase 2 of the route-driven migration (see ROUTE_DRIVEN_MIGRATION_PLAN.md).
 *
 * All 200 inline handlers that were in server.ts have been extracted into
 * route files and are mounted here. server.ts now only contains the health
 * endpoint and the Vite SPA middleware — all API routing goes through this
 * composed router.
 *
 * Backward compatibility: every URL that resolved before the migration
 * continues to resolve identically because the same handler code runs at
 * the same effective paths. Only the module location changed.
 */

import { Router } from 'express';

import b2bRoutes from './b2b.routes';
import financeRoutes from './finance.routes';
import financeV1Routes from './v1/finance.routes';
import budgetingRoutes from './budgeting.routes';
import taxRoutes from './tax.routes';
import fpaRoutes from './fpa.routes';
import multipropertyRoutes from './multiproperty.routes';
import posRoutes from './pos.routes';
import kdsRoutes from './kds.routes';
import kitchenRoutes from './kitchen.routes';
import barRoutes from './bar.routes';
import unifiedInventoryRoutes from './unifiedInventory.routes';
import unifiedProductRoutes from './unifiedProduct.routes';
import productionPlanningRoutes from './productionPlanning.routes';
import outletTransferRoutes from './outletTransfer.routes';
import costVarianceRoutes from './costVariance.routes';
import posSyncRoutes from './posSync.routes';
import managerPinRoutes from './managerPin.routes';
import menuEnhancementsRoutes from './menuEnhancements.routes';
import hardwareRoutes from './hardware.routes';
import tableManagementRoutes from './tableManagement.routes';
import procurementRoutes from './procurement.routes';
import menuAnalyticsRoutes from './menuAnalytics.routes';
import guestStaffRoutes from './guestStaff.routes';
import onlineOrderingRoutes from './onlineOrdering.routes';
import operationsPortalRoutes from './operationsPortal.routes';
import operationsAIRoutes from './operationsAI.routes';
import operationsIoTRoutes from './operationsIoT.routes';
import operationsOptimizationRoutes from './operationsOptimization.routes';
import operationsAnalyticsRoutes from './operationsAnalytics.routes';
import operationsSupplyChainRoutes from './operationsSupplyChain.routes';
import operationsHousekeepingRoutes from './operationsHousekeeping.routes';
import operationsSafetyRoutes from './operationsSafety.routes';
import executiveRoutes from './executive.routes';
import housekeepingPortalRoutes from './housekeepingPortal.routes';
import engineeringPortalRoutes from './engineeringPortal.routes';
import inventoryPortalRoutes from './inventoryPortal.routes';
import hrPayrollPortalRoutes from './hrPayrollPortal.routes';
import procurementPortalRoutes from './procurementPortal.routes';
import salesEventsPortalRoutes from './salesEventsPortal.routes';
import guestMobilePortalRoutes from './guestMobilePortal.routes';
import accountsPayableRoutes from './accountsPayable.routes';
import bankReconciliationRoutes from './bankReconciliation.routes';
import fixedAssetsRoutes from './fixedAssets.routes';
import trialBalanceRoutes from './trialBalance.routes';
import financialStatementsRoutes from './financialStatements.routes';
import ercaVatRoutes from './ercaVat.routes';
import periodCloseRoutes from './periodClose.routes';
import foodBeverageRoutes from './foodBeverage.routes';
import operationsManagerRoutes from './operationsManager.routes';
import conciergeRoutes from './concierge.routes';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import reservationsRoutes from './reservations.routes';
import frontOfficeRoutes from './frontOffice.routes';
import inventoryRoutes from './inventory.routes';
import publicRoutes from './public.routes';
import reportsRoutes from './reports.routes';
import standardReportsRoutes from './standardReports.routes';
import giftShopRoutes from './giftShop.routes';
import groupProfilesRoutes from './groupProfiles.routes';
// Phase 2: new route files extracted from server.ts inline handlers
import auditRoutes from './audit.routes';
import settingsRoutes from './settings.routes';
import propertiesRoutes from './properties.routes';
import billingRoutes from './billing.routes';
import guestsRoutes from './guests.routes';
import preRegistrationsRoutes from './preRegistrations.routes';
import loyaltyRoutes from './loyalty.routes';
import reservationSeriesRoutes from './reservationSeries.routes';
import shareReservationsRoutes from './shareReservations.routes';
import foliosRoutes from './folios.routes';
import invoicesRoutes from './invoices.routes';
import nightAuditRoutes from './nightAudit.routes';
import forecastsRoutes from './forecasts.routes';
import ratesRoutes from './rates.routes';
import cashierShiftsRoutes from './cashierShifts.routes';
import channelsRoutes from './channels.routes';
import hrRoutes from './hr.routes';
import salesRoutes from './sales.routes';

const apiRouter = Router();

// ── B2B & Finance ────────────────────────────────────────────────────────
apiRouter.use('/b2b', b2bRoutes);
apiRouter.use('/finance', financeRoutes);
apiRouter.use('/v1/finance', financeV1Routes);
apiRouter.use('/finance/budgeting', budgetingRoutes);
apiRouter.use('/finance/tax', taxRoutes);
apiRouter.use('/finance/fpa', fpaRoutes);
apiRouter.use('/finance/multiproperty', multipropertyRoutes);

// ── POS & F&B ────────────────────────────────────────────────────────────
apiRouter.use('/pos', posRoutes);
apiRouter.use('/kds', kdsRoutes);
apiRouter.use('/fb/kitchen', kitchenRoutes);
apiRouter.use('/fb/bar', barRoutes);
apiRouter.use('/fb/unified-inventory', unifiedInventoryRoutes);
apiRouter.use('/fb/unified-products', unifiedProductRoutes);
apiRouter.use('/fb/production-planning', productionPlanningRoutes);
apiRouter.use('/fb/outlet-transfers', outletTransferRoutes);
apiRouter.use('/fb/cost-variance', costVarianceRoutes);
apiRouter.use('/fb/pos-sync', posSyncRoutes);
apiRouter.use('/fb/manager-pin', managerPinRoutes);
apiRouter.use('/fb/menu-enhancements', menuEnhancementsRoutes);
apiRouter.use('/hardware', hardwareRoutes);
apiRouter.use('/fb/tables', tableManagementRoutes);
apiRouter.use('/fb/procurement', procurementRoutes);
apiRouter.use('/fb/menu-analytics', menuAnalyticsRoutes);
apiRouter.use('/fb/guest-staff', guestStaffRoutes);
apiRouter.use('/fb/online-ordering', onlineOrderingRoutes);

// ── Operations ───────────────────────────────────────────────────────────
apiRouter.use('/ops/portal', operationsPortalRoutes);
apiRouter.use('/ops/ai', operationsAIRoutes);
apiRouter.use('/ops/iot', operationsIoTRoutes);
apiRouter.use('/ops/optimization', operationsOptimizationRoutes);
apiRouter.use('/ops/analytics', operationsAnalyticsRoutes);
apiRouter.use('/ops/supply-chain', operationsSupplyChainRoutes);
apiRouter.use('/ops/housekeeping', operationsHousekeepingRoutes);
apiRouter.use('/ops/safety', operationsSafetyRoutes);

// ── Portals ──────────────────────────────────────────────────────────────
apiRouter.use('/executive', executiveRoutes);
apiRouter.use('/hk-portal', housekeepingPortalRoutes);
apiRouter.use('/eng-portal', engineeringPortalRoutes);
apiRouter.use('/inv-portal', inventoryPortalRoutes);
apiRouter.use('/hr-portal', hrPayrollPortalRoutes);
apiRouter.use('/proc-portal', procurementPortalRoutes);
apiRouter.use('/sales-events', salesEventsPortalRoutes);
apiRouter.use('/guest-portal', guestMobilePortalRoutes);

// ── Financial Accounting ─────────────────────────────────────────────────
apiRouter.use('/accounts-payable', accountsPayableRoutes);
apiRouter.use('/bank-reconciliation', bankReconciliationRoutes);
apiRouter.use('/fixed-assets', fixedAssetsRoutes);
apiRouter.use('/trial-balance', trialBalanceRoutes);
apiRouter.use('/financial-statements', financialStatementsRoutes);
apiRouter.use('/erca-vat', ercaVatRoutes);
apiRouter.use('/period-close', periodCloseRoutes);
apiRouter.use('/food-beverage', foodBeverageRoutes);
apiRouter.use('/operations', operationsManagerRoutes);

// ── Core ─────────────────────────────────────────────────────────────────
apiRouter.use('/concierge', conciergeRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/', reservationsRoutes); // root mount (was app.use('/api', reservationsRoutes))
apiRouter.use('/front-office', frontOfficeRoutes);
apiRouter.use('/inventory', inventoryRoutes);
apiRouter.use('/public', publicRoutes);
apiRouter.use('/reports', reportsRoutes);
apiRouter.use('/standard-reports', standardReportsRoutes);
apiRouter.use('/gift-shop', giftShopRoutes);
apiRouter.use('/', groupProfilesRoutes); // root mount (was app.use('/api', groupProfilesRoutes))
// rmsRoutes intentionally omitted — commented out in server.ts (TODO: backend not ready).

// ── Phase 2: routes extracted from server.ts inline handlers ─────────────
apiRouter.use('/audit', auditRoutes);
apiRouter.use('/settings', settingsRoutes);
apiRouter.use('/properties', propertiesRoutes);
apiRouter.use('/billing', billingRoutes);
apiRouter.use('/guests', guestsRoutes);
apiRouter.use('/pre-registrations', preRegistrationsRoutes);
apiRouter.use('/loyalty', loyaltyRoutes);
apiRouter.use('/reservation-series', reservationSeriesRoutes);
apiRouter.use('/share-reservations', shareReservationsRoutes);
apiRouter.use('/folios', foliosRoutes);
apiRouter.use('/invoices', invoicesRoutes);
apiRouter.use('/night-audit', nightAuditRoutes);
apiRouter.use('/forecasts', forecastsRoutes);
apiRouter.use('/rates', ratesRoutes);
apiRouter.use('/cashier-shifts', cashierShiftsRoutes);
apiRouter.use('/channels', channelsRoutes);
apiRouter.use('/hr', hrRoutes);
apiRouter.use('/sales', salesRoutes);

export default apiRouter;
