/**
 * Per-department tab registry — single source of truth for the tabs each
 * department exposes, their display labels, and their `modId` (used by the
 * `hasModuleAccess` permission check in App.tsx).
 *
 * Phase 0 of the route-driven migration (see ROUTE_DRIVEN_MIGRATION_PLAN.md).
 * INTRODUCED in Phase 0, not yet wired into routing. Consumed in Phase 3 when
 * each tab becomes a route (`/erp/:department/:tab`).
 *
 * Source: extracted verbatim from the `subNavConfig` memo in App.tsx
 * (lines 696-1033). The `id`/`label`/`modId` values match exactly so that
 * access-control behavior is preserved when the registry replaces the memo.
 *
 * Dynamic departments:
 *   - `admin`: tabs come from `CORE_ADMIN_MODULES` (filtered by `moduleToggles`).
 *     Not listed here; resolved at runtime via `adminModules.ts`.
 *   - `executive` and `operations`: share a common tab set whose `modId` prefix
 *     differs (`exec_*` vs `ops_*`). The base tab ids/labels are listed here
 *     under `executive`/`operations`; the modId is resolved at runtime based on
 *     the active department. `operations` ALSO has a distinct sub-nav in
 *     App.tsx (lines 1009-1032) that overrides the shared one — see the note
 *     on the `operations` entry.
 */

export interface TabConfig {
  /** Tab identifier — becomes the `:tab` route segment. */
  id: string;
  /** Display label in the side nav. */
  label: string;
  /**
   * Module id used by `hasModuleAccess(modId)`. For `executive`/`operations`
   * the prefix depends on the active department and is resolved at runtime;
   * the value here is the `exec_*` form and `resolveModId` produces the `ops_*`
   * variant.
   */
  modId: string;
}

/**
 * Static tab sets per department. Departments with dynamic tabs (`admin`) are
 * omitted and resolved separately.
 */
export const DEPARTMENT_TABS: Readonly<Record<string, readonly TabConfig[]>> = {
  frontoffice: [
    { id: 'dashboard', label: 'Dashboard', modId: 'fo_dashboard' },
    { id: 'reservations', label: 'Reservations', modId: 'fo_reservations' },
    { id: 'availability-inventory', label: 'Availability', modId: 'fo_availability' },
    { id: 'front-desk-operations', label: 'Front Desk Ops', modId: 'fo_front_desk_ops' },
    { id: 'room-assignment', label: 'Room Assignment', modId: 'fo_room_assignment' },
    { id: 'guest-profiles', label: 'Guest Profiles', modId: 'fo_guest_profiles' },
    { id: 'group-profiles-management', label: 'Group Profiles', modId: 'fo_group_profiles' },
    { id: 'check-in', label: 'Check-In', modId: 'fo_check_in' },
    { id: 'check-out', label: 'Check-Out', modId: 'fo_check_out' },
    { id: 'folio-billing', label: 'Folio & Billing', modId: 'fo_folio' },
    { id: 'night-audit', label: 'Night Audit', modId: 'fo_night_audit' },
    { id: 'keys-access', label: 'Keys & Access', modId: 'fo_keys_access' },
    { id: 'concierge-portal', label: 'Concierge Portal', modId: 'fo_concierge_portal' },
    { id: 'guest-requests', label: 'Guest Requests', modId: 'fo_guest_requests' },
    { id: 'lost-found', label: 'Lost & Found', modId: 'fo_lost_found' },
    { id: 'communication-center', label: 'Comms', modId: 'fo_communication' },
    { id: 'reports', label: 'Reports', modId: 'fo_reports' },
    { id: 'configuration', label: 'Config', modId: 'fo_configuration' },
  ],
  housekeeping: [
    { id: 'dashboard', label: 'Command Center', modId: 'hk_dashboard' },
    { id: 'rooms', label: 'Room Board', modId: 'hk_rooms' },
    { id: 'tasks', label: 'Task Management', modId: 'hk_tasks' },
    { id: 'public-area', label: 'Public Areas', modId: 'hk_public_area' },
    { id: 'inspections', label: 'Inspections', modId: 'hk_inspections' },
    { id: 'supervisor', label: 'Supervisor', modId: 'hk_supervisor' },
    { id: 'minibar', label: 'Minibar', modId: 'hk_minibar' },
    { id: 'guest-requests', label: 'Guest Requests', modId: 'hk_guest_requests' },
    { id: 'deep-cleaning', label: 'Deep Clean', modId: 'hk_deep_cleaning' },
    { id: 'preventive-cleaning', label: 'Preventive', modId: 'hk_preventive' },
    { id: 'maintenance', label: 'Maintenance', modId: 'hk_maintenance' },
    { id: 'communication', label: 'Communication', modId: 'hk_communication' },
    { id: 'configuration', label: 'Configuration', modId: 'hk_configuration' },
    { id: 'laundry', label: 'Laundry & Valet', modId: 'hk_laundry' },
    { id: 'inventory', label: 'Supplies & Linen', modId: 'hk_inventory' },
    { id: 'amenities', label: 'Guest Amenities', modId: 'hk_amenities' },
    { id: 'lostfound', label: 'Lost & Found', modId: 'hk_lostfound' },
    { id: 'staff', label: 'Team', modId: 'hk_staff' },
    { id: 'reports', label: 'Intelligence', modId: 'hk_reports' },
    { id: 'standard-reports', label: 'Standard Reports', modId: 'hk_standard_reports' },
  ],
  'f&b': [
    { id: 'executive-dashboard', label: 'Executive Dashboard', modId: 'fb_executive_dashboard' },
    { id: 'outlet-management', label: 'Outlets', modId: 'fb_outlet_management' },
    { id: 'menu-catalog', label: 'Menu & Catalog', modId: 'fb_menu_catalog' },
    { id: 'recipe-production', label: 'Recipe & Production', modId: 'fb_recipe_production' },
    { id: 'inventory-cost', label: 'Inventory & Cost', modId: 'fb_inventory_cost' },
    { id: 'beverage-management', label: 'Beverage', modId: 'fb_beverage_management' },
    { id: 'purchasing-suppliers', label: 'Purchasing', modId: 'fb_purchasing_suppliers' },
    { id: 'banquet-catering', label: 'Banquets', modId: 'fb_banquet_catering' },
    { id: 'room-service', label: 'Room Service', modId: 'fb_room_service' },
    { id: 'guest-crm', label: 'Guest CRM', modId: 'fb_guest_crm' },
    { id: 'promotions-pricing', label: 'Promotions', modId: 'fb_promotions_pricing' },
    { id: 'financial-control', label: 'Financial Control', modId: 'fb_financial_control' },
    { id: 'operations-compliance', label: 'Operations', modId: 'fb_operations_compliance' },
    { id: 'reporting-bi', label: 'Reporting & BI', modId: 'fb_reporting_bi' },
    { id: 'integrations', label: 'Integrations', modId: 'fb_integrations' },
  ],
  maintenance: [
    { id: 'dashboard', label: 'Dashboard', modId: 'eng_dashboard' },
    { id: 'work-requests', label: 'Work Requests', modId: 'eng_work_requests' },
    { id: 'workorders', label: 'Work Orders', modId: 'eng_workorders' },
    { id: 'corrective-maintenance', label: 'Corrective Maint.', modId: 'eng_corrective_maintenance' },
    { id: 'pm', label: 'Preventive Maint.', modId: 'eng_pm' },
    { id: 'predictive-maintenance', label: 'Predictive Maint.', modId: 'eng_predictive_maintenance' },
    { id: 'equipment-registry', label: 'Equipment Registry', modId: 'eng_equipment_registry' },
    { id: 'building-maintenance', label: 'Building Maint.', modId: 'eng_building_maintenance' },
    { id: 'energy-management', label: 'Energy Management', modId: 'eng_energy_management' },
    { id: 'spare-parts', label: 'Spare Parts', modId: 'eng_spare_parts' },
    { id: 'vendor-contractor', label: 'Vendors & Contractors', modId: 'eng_vendor_contractor' },
    { id: 'inspections', label: 'Inspections', modId: 'eng_inspections' },
    { id: 'calibration', label: 'Calibration', modId: 'eng_calibration' },
    { id: 'projects-renovations', label: 'Projects & Renovations', modId: 'eng_projects' },
    { id: 'communication', label: 'Communication', modId: 'eng_communication' },
    { id: 'configuration', label: 'Configuration', modId: 'eng_configuration' },
    { id: 'assets', label: 'Asset Register', modId: 'eng_assets' },
    { id: 'rooms', label: 'Guest Rooms', modId: 'eng_rooms' },
    { id: 'utilities', label: 'Utilities & Plant', modId: 'eng_utilities' },
    { id: 'inventory', label: 'Spare Parts & Tools', modId: 'eng_inventory' },
    { id: 'staff', label: 'Technicians', modId: 'eng_staff' },
    { id: 'compliance', label: 'Safety & Compliance', modId: 'eng_compliance' },
    { id: 'reports', label: 'Reports', modId: 'eng_reports' },
    { id: 'standard-reports', label: 'Standard Reports', modId: 'eng_standard_reports' },
  ],
  inventory: [
    { id: 'dashboard', label: 'Dashboard', modId: 'inv_dashboard' },
    { id: 'items', label: 'Item Master', modId: 'inv_items' },
    { id: 'stores', label: 'Stores & Transfers', modId: 'inv_stores' },
    { id: 'requisition', label: 'Requisitions', modId: 'inv_requisitions' },
    { id: 'receiving', label: 'Goods Receiving', modId: 'inv_receiving' },
    { id: 'count', label: 'Stock Counting', modId: 'inv_count' },
    { id: 'suppliers', label: 'Suppliers', modId: 'inv_suppliers' },
    { id: 'standard-reports', label: 'Standard Reports', modId: 'inv_standard_reports' },
    { id: 'reports', label: 'Reports', modId: 'inv_reports' },
  ],
  finance: [
    { id: 'dashboard', label: 'Executive Dashboard', modId: 'fin_dashboard' },
    { id: 'gl', label: 'General Ledger', modId: 'fin_gl' },
    { id: 'coa', label: 'Chart of Accounts', modId: 'fin_coa' },
    { id: 'ar', label: 'Accounts Receivable', modId: 'fin_ar' },
    { id: 'ap', label: 'Accounts Payable', modId: 'fin_ap' },
    { id: 'cash_bank', label: 'Cash & Bank', modId: 'fin_cash_bank' },
    { id: 'treasury', label: 'Treasury', modId: 'fin_treasury' },
    { id: 'revenue', label: 'Revenue', modId: 'fin_revenue' },
    { id: 'expense', label: 'Expense', modId: 'fin_expense' },
    { id: 'cost_center', label: 'Cost Center', modId: 'fin_cost_center' },
    { id: 'budgeting', label: 'Budgeting', modId: 'fin_budgeting' },
    { id: 'fixed_assets', label: 'Fixed Assets', modId: 'fin_fixed_assets' },
    { id: 'inventory', label: 'Inventory', modId: 'fin_inventory' },
    { id: 'intercompany', label: 'Intercompany', modId: 'fin_intercompany' },
    { id: 'tax', label: 'Tax', modId: 'fin_tax' },
    { id: 'financial_close', label: 'Financial Close', modId: 'fin_financial_close' },
    { id: 'consolidation', label: 'Consolidation', modId: 'fin_consolidation' },
    { id: 'audit_compliance', label: 'Audit', modId: 'fin_audit_compliance' },
    { id: 'documents', label: 'Documents', modId: 'fin_documents' },
    { id: 'approval', label: 'Approvals', modId: 'fin_approval' },
    { id: 'bi', label: 'Business Intel', modId: 'fin_bi' },
    { id: 'reports', label: 'Reports', modId: 'fin_reports' },
    { id: 'config', label: 'Configuration', modId: 'fin_config' },
  ],
  hr: [
    { id: 'dashboard', label: 'Executive Dashboard', modId: 'hr_dashboard' },
    { id: 'organization', label: 'Organization Management', modId: 'hr_organization' },
    { id: 'employees', label: 'Employee Management', modId: 'hr_employees' },
    { id: 'recruitment', label: 'Recruitment', modId: 'hr_recruitment' },
    { id: 'ats', label: 'Applicant Tracking (ATS)', modId: 'hr_ats' },
    { id: 'onboarding', label: 'Onboarding', modId: 'hr_onboarding' },
    { id: 'ess', label: 'Employee Self-Service', modId: 'hr_ess' },
    { id: 'mss', label: 'Manager Self-Service', modId: 'hr_mss' },
    { id: 'attendance', label: 'Attendance Management', modId: 'hr_attendance' },
    { id: 'shifts', label: 'Shift & Rostering', modId: 'hr_shifts' },
    { id: 'leave', label: 'Leave Management', modId: 'hr_leave' },
    { id: 'overtime', label: 'Time & Overtime', modId: 'hr_overtime' },
    { id: 'payroll', label: 'Payroll Management', modId: 'hr_payroll' },
    { id: 'compensation', label: 'Compensation & Benefits', modId: 'hr_compensation' },
    { id: 'performance', label: 'Performance Management', modId: 'hr_performance' },
    { id: 'learning', label: 'Learning & Development', modId: 'hr_learning' },
    { id: 'training', label: 'Training Management', modId: 'hr_training' },
    { id: 'career', label: 'Career & Succession', modId: 'hr_career' },
    { id: 'health', label: 'Health & Safety', modId: 'hr_health' },
    { id: 'relations', label: 'Employee Relations', modId: 'hr_relations' },
    { id: 'documents', label: 'Document Management', modId: 'hr_documents' },
    { id: 'workflow', label: 'Workflow & Approvals', modId: 'hr_workflow' },
    { id: 'analytics', label: 'Reports & Analytics', modId: 'hr_analytics' },
    { id: 'configuration', label: 'Configuration', modId: 'hr_configuration' },
  ],
  security: [
    { id: 'dashboard', label: 'Executive Dashboard', modId: 'sec_dashboard' },
    { id: 'soc', label: 'Security Operations Center', modId: 'sec_soc' },
    { id: 'incidents', label: 'Incident Management', modId: 'sec_incidents' },
    { id: 'investigations', label: 'Investigations', modId: 'sec_investigations' },
    { id: 'visitors', label: 'Visitor Management', modId: 'sec_visitors' },
    { id: 'access-control', label: 'Access Control', modId: 'sec_access' },
    { id: 'keys', label: 'Key & Keycard Management', modId: 'sec_keys' },
    { id: 'cctv', label: 'CCTV Management', modId: 'sec_cctv' },
    { id: 'patrols', label: 'Patrol Management', modId: 'sec_patrols' },
    { id: 'lost-found', label: 'Lost & Found Oversight', modId: 'sec_lostfound' },
    { id: 'emergency', label: 'Emergency Management', modId: 'sec_emergency' },
    { id: 'fire-safety', label: 'Fire & Life Safety', modId: 'sec_firesafety' },
    { id: 'risk', label: 'Risk Management', modId: 'sec_risk' },
    { id: 'business-continuity', label: 'Business Continuity', modId: 'sec_businesscontinuity' },
    { id: 'crisis', label: 'Crisis Management', modId: 'sec_crisis' },
    { id: 'health-safety', label: 'Health & Safety Coordination', modId: 'sec_healthsafety' },
    { id: 'compliance', label: 'Compliance Management', modId: 'sec_compliance' },
    { id: 'asset-protection', label: 'Asset Protection', modId: 'sec_assetprotection' },
    { id: 'fraud-prevention', label: 'Fraud Prevention', modId: 'sec_fraudprevention' },
    { id: 'evidence', label: 'Evidence Management', modId: 'sec_evidence' },
    { id: 'communication', label: 'Communication Center', modId: 'sec_communication' },
    { id: 'reports', label: 'Reports', modId: 'sec_reports' },
    { id: 'configuration', label: 'Configuration', modId: 'sec_configuration' },
  ],
  transportation: [
    { id: 'dashboard', label: 'Dashboard', modId: 'trans_dashboard' },
    { id: 'requests', label: 'Requests', modId: 'trans_requests' },
    { id: 'dispatch', label: 'Dispatch Center', modId: 'trans_dispatch' },
    { id: 'trips', label: 'Trip Management', modId: 'trans_trips' },
    { id: 'airport', label: 'Airport Transfers', modId: 'trans_airport' },
    { id: 'shuttle', label: 'Shuttle Management', modId: 'trans_shuttle' },
    { id: 'guest', label: 'Guest Transportation', modId: 'trans_guest' },
    { id: 'corporate', label: 'Corporate Transportation', modId: 'trans_corporate' },
    { id: 'staff', label: 'Staff Transportation', modId: 'trans_staff' },
    { id: 'fleet', label: 'Fleet Management', modId: 'trans_fleet' },
    { id: 'vehicles', label: 'Vehicle Registry', modId: 'trans_vehicles' },
    { id: 'drivers', label: 'Driver Management', modId: 'trans_drivers' },
    { id: 'routes', label: 'Route Management', modId: 'trans_routes' },
    { id: 'scheduling', label: 'Scheduling & Dispatch', modId: 'trans_scheduling' },
    { id: 'gps', label: 'GPS Tracking', modId: 'trans_gps' },
    { id: 'fuel', label: 'Fuel Management', modId: 'trans_fuel' },
    { id: 'maintenance', label: 'Vehicle Maintenance', modId: 'trans_maintenance' },
    { id: 'contractors', label: 'Contractors', modId: 'trans_contractors' },
    { id: 'billing', label: 'Billing & Charges', modId: 'trans_billing' },
    { id: 'communication', label: 'Communication Center', modId: 'trans_communication' },
    { id: 'reports', label: 'Reports', modId: 'trans_reports' },
    { id: 'configuration', label: 'Configuration', modId: 'trans_configuration' },
  ],
  procurement: [
    { id: 'dashboard', label: 'Procurement Dashboard', modId: 'proc_dashboard' },
    { id: 'requisitions', label: 'Requisitions', modId: 'proc_requisitions' },
    { id: 'orders', label: 'Purchase Orders', modId: 'proc_orders' },
    { id: 'suppliers', label: 'Suppliers', modId: 'proc_suppliers' },
    { id: 'rfq', label: 'RFQ Management', modId: 'proc_rfq' },
    { id: 'receiving', label: 'Goods Receiving', modId: 'proc_receiving' },
    { id: 'contracts', label: 'Contracts', modId: 'proc_contracts' },
    { id: 'budget', label: 'Budget Control', modId: 'proc_budget' },
    { id: 'invoices', label: 'Supplier Invoices', modId: 'proc_invoices' },
    { id: 'approvals', label: 'Approval Center', modId: 'proc_approvals' },
    { id: 'reports', label: 'Reports', modId: 'proc_reports' },
    { id: 'standard-reports', label: 'Standard Reports', modId: 'proc_standard_reports' },
  ],
  sales: [
    { id: 'dashboard', label: 'Dashboard', modId: 'sales_dashboard' },
    { id: 'crm', label: 'CRM', modId: 'sales_crm' },
    { id: 'guest-profiles', label: 'Guest Profiles', modId: 'sales_guest_profiles' },
    { id: 'corporate-accounts', label: 'Corporate Accounts', modId: 'sales_corporate_accounts' },
    { id: 'travel-agents', label: 'Travel Agents', modId: 'sales_travel_agents' },
    { id: 'leads', label: 'Leads', modId: 'sales_leads' },
    { id: 'opportunities', label: 'Opportunities', modId: 'sales_opportunities' },
    { id: 'proposals', label: 'Proposals', modId: 'sales_proposals' },
    { id: 'contracts', label: 'Contracts', modId: 'sales_contracts' },
    { id: 'sales-activities', label: 'Activities', modId: 'sales_activities' },
    { id: 'account-management', label: 'Account Mgmt', modId: 'sales_account_management' },
    { id: 'campaigns', label: 'Campaigns', modId: 'sales_campaigns' },
    { id: 'email-marketing', label: 'Email', modId: 'sales_email_marketing' },
    { id: 'sms-messaging', label: 'SMS', modId: 'sales_sms_messaging' },
    { id: 'loyalty', label: 'Loyalty', modId: 'sales_loyalty' },
    { id: 'promotions', label: 'Promotions', modId: 'sales_promotions' },
    { id: 'gift-cards', label: 'Gift Cards', modId: 'sales_gift_cards' },
    { id: 'reputation', label: 'Reputation', modId: 'sales_reputation' },
    { id: 'guest-feedback', label: 'Feedback', modId: 'sales_guest_feedback' },
    { id: 'segmentation', label: 'Segmentation', modId: 'sales_segmentation' },
    { id: 'business-intelligence', label: 'BI', modId: 'sales_business_intelligence' },
    { id: 'communication', label: 'Communication', modId: 'sales_communication' },
    { id: 'reports', label: 'Reports', modId: 'sales_reports' },
    { id: 'configuration', label: 'Configuration', modId: 'sales_configuration' },
  ],
  concierge: [
    { id: 'dashboard', label: 'Executive Dashboard', modId: 'concierge_dashboard' },
    { id: 'service-center', label: 'Guest Service Center', modId: 'concierge_service_center' },
    { id: 'guest-profiles', label: 'Guest Profiles', modId: 'concierge_guest_profiles' },
    { id: 'guest-requests', label: 'Guest Requests', modId: 'concierge_guest_requests' },
    { id: 'concierge-desk', label: 'Concierge Desk', modId: 'concierge_desk' },
    { id: 'experience-booking', label: 'Experience Booking', modId: 'concierge_experience_booking' },
    { id: 'restaurant-reservations', label: 'Restaurant Reservations', modId: 'concierge_restaurant_reservations' },
    { id: 'transportation', label: 'Transportation', modId: 'concierge_transportation' },
    { id: 'tour-management', label: 'Tour Management', modId: 'concierge_tour_management' },
    { id: 'ticketing', label: 'Ticketing Services', modId: 'concierge_ticketing' },
    { id: 'luggage-services', label: 'Luggage Services', modId: 'concierge_luggage_services' },
    { id: 'parcel-management', label: 'Parcel Management', modId: 'concierge_parcel_management' },
    { id: 'vip-services', label: 'VIP & Butler Services', modId: 'concierge_vip_services' },
    { id: 'personal-shopping', label: 'Personal Shopping', modId: 'concierge_personal_shopping' },
    { id: 'local-recommendations', label: 'Local Recommendations', modId: 'concierge_local_recommendations' },
    { id: 'itinerary-planner', label: 'Itinerary Planner', modId: 'concierge_itinerary_planner' },
    { id: 'wake-up-reminder', label: 'Wake-up & Reminder', modId: 'concierge_wake_up_reminder' },
    { id: 'guest-communication', label: 'Guest Communication', modId: 'concierge_guest_communication' },
    { id: 'vendor-management', label: 'Vendor Management', modId: 'concierge_vendor_management' },
    { id: 'billing-charges', label: 'Billing & Charges', modId: 'concierge_billing_charges' },
    { id: 'reports', label: 'Reports', modId: 'concierge_reports' },
    { id: 'configuration', label: 'Configuration', modId: 'concierge_configuration' },
  ],
  /**
   * Spa & Wellness tabs.
   *
   * NOTE: the `subNavConfig['spa-wellness']` array in App.tsx (lines 945-977)
   * appends a block of `concierge_*` items after the spa items. This appears to
   * be a copy-paste anomaly — those concierge items do not correspond to the
   * SpaWellnessPortal component's actual tab set. The registry below captures
   * only the genuine spa-wellness tabs (App.tsx lines 946-964). The anomaly
   * will be reconciled when the registry is wired in Phase 3; until then this
   * file is not referenced by the running app.
   */
  'spa-wellness': [
    { id: 'dashboard', label: 'Executive Dashboard', modId: 'spa_dashboard' },
    { id: 'appointments', label: 'Appointment Management', modId: 'spa_appointments' },
    { id: 'treatment-catalog', label: 'Treatment Catalog', modId: 'spa_treatment_catalog' },
    { id: 'therapists', label: 'Therapist Management', modId: 'spa_therapists' },
    { id: 'treatment-rooms', label: 'Treatment Rooms', modId: 'spa_treatment_rooms' },
    { id: 'guest-wellness-profiles', label: 'Guest Wellness Profiles', modId: 'spa_guest_wellness_profiles' },
    { id: 'wellness-programs', label: 'Wellness Programs', modId: 'spa_wellness_programs' },
    { id: 'memberships', label: 'Membership Management', modId: 'spa_memberships' },
    { id: 'fitness-center', label: 'Fitness Center', modId: 'spa_fitness_center' },
    { id: 'beauty-salon', label: 'Beauty Salon', modId: 'spa_beauty_salon' },
    { id: 'thermal-hydro', label: 'Thermal & Hydro', modId: 'spa_thermal_hydro' },
    { id: 'wellness-packages', label: 'Wellness Packages', modId: 'spa_wellness_packages' },
    { id: 'retail-shop', label: 'Retail Shop', modId: 'spa_retail_shop' },
    { id: 'inventory-consumption', label: 'Inventory Consumption', modId: 'spa_inventory_consumption' },
    { id: 'gift-cards', label: 'Gift Cards & Vouchers', modId: 'spa_gift_cards' },
    { id: 'billing-payments', label: 'Billing & Payments', modId: 'spa_billing_payments' },
    { id: 'communication', label: 'Communication Center', modId: 'spa_communication' },
    { id: 'reports', label: 'Reports', modId: 'spa_reports' },
    { id: 'configuration', label: 'Configuration', modId: 'spa_configuration' },
  ],
  /**
   * Executive tabs — shared shape with `operations`. The `modId` prefix is
   * `exec_*` here; for `operations` the same tab ids use `ops_*` and are
   * produced by `resolveExecOpsModId`.
   */
  executive: [
    { id: 'executive-dashboard', label: 'Executive Dashboard', modId: 'exec_executive_dashboard' },
    { id: 'enterprise-kpi-center', label: 'Enterprise KPI Center', modId: 'exec_enterprise_kpi_center' },
    { id: 'operational-intelligence', label: 'Operational Intelligence', modId: 'exec_operational_intelligence' },
    { id: 'financial-intelligence', label: 'Financial Intelligence', modId: 'exec_financial_intelligence' },
    { id: 'revenue-intelligence', label: 'Revenue Intelligence', modId: 'exec_revenue_intelligence' },
    { id: 'guest-intelligence', label: 'Guest Intelligence', modId: 'exec_guest_intelligence' },
    { id: 'sales-marketing-intelligence', label: 'Sales & Marketing', modId: 'exec_sales_marketing_intelligence' },
    { id: 'food-beverage-intelligence', label: 'F&B Intelligence', modId: 'exec_food_beverage_intelligence' },
    { id: 'housekeeping-intelligence', label: 'Housekeeping', modId: 'exec_housekeeping_intelligence' },
    { id: 'engineering-intelligence', label: 'Engineering', modId: 'exec_engineering_intelligence' },
    { id: 'human-capital-intelligence', label: 'Human Capital', modId: 'exec_human_capital_intelligence' },
    { id: 'procurement-intelligence', label: 'Procurement', modId: 'exec_procurement_intelligence' },
    { id: 'inventory-intelligence', label: 'Inventory', modId: 'exec_inventory_intelligence' },
    { id: 'security-intelligence', label: 'Security', modId: 'exec_security_intelligence' },
    { id: 'sustainability-intelligence', label: 'Sustainability', modId: 'exec_sustainability_intelligence' },
    { id: 'benchmarking', label: 'Benchmarking', modId: 'exec_benchmarking' },
    { id: 'forecasting', label: 'Forecasting', modId: 'exec_forecasting' },
    { id: 'ai-decision-support', label: 'AI Decision Support', modId: 'exec_ai_decision_support' },
    { id: 'strategic-planning', label: 'Strategic Planning', modId: 'exec_strategic_planning' },
    { id: 'alerts-exceptions', label: 'Alerts & Exceptions', modId: 'exec_alerts_exceptions' },
    { id: 'reports-center', label: 'Reports Center', modId: 'exec_reports_center' },
    { id: 'enterprise-data-explorer', label: 'Data Explorer', modId: 'exec_enterprise_data_explorer' },
    { id: 'configuration', label: 'Configuration', modId: 'exec_configuration' },
  ],
  /**
   * Operations tabs — distinct from the shared exec/ops sub-nav. App.tsx
   * (lines 1009-1032) overrides the shared sub-nav for `operations` with this
   * set. The HotelOperationsPortal component currently uses its own internal
   * `activeView` state and ignores the `activeTab` prop (to be fixed in
   * Phase 4). These tab ids match the component's internal view ids.
   */
  operations: [
    { id: 'executive-dashboard', label: 'Executive Dashboard', modId: 'ops_executive_dashboard' },
    { id: 'command-center', label: 'Operations Command Center', modId: 'ops_command_center' },
    { id: 'daily-briefing', label: 'Daily Briefing', modId: 'ops_daily_briefing' },
    { id: 'morning-meeting', label: 'Morning Meeting', modId: 'ops_morning_meeting' },
    { id: 'approvals', label: 'Manager Approvals', modId: 'ops_approvals' },
    { id: 'cross-department-tasks', label: 'Cross-Department Tasks', modId: 'ops_cross_department_tasks' },
    { id: 'duty-manager', label: 'Duty Manager Workspace', modId: 'ops_duty_manager' },
    { id: 'calendar', label: 'Operational Calendar', modId: 'ops_calendar' },
    { id: 'vip-management', label: 'VIP Guest Management', modId: 'ops_vip_management' },
    { id: 'guest-recovery', label: 'Guest Recovery', modId: 'ops_guest_recovery' },
    { id: 'service-quality', label: 'Service Quality', modId: 'ops_service_quality' },
    { id: 'room-operations', label: 'Room Operations', modId: 'ops_room_operations' },
    { id: 'occupancy-forecast', label: 'Occupancy & Forecast', modId: 'ops_occupancy_forecast' },
    { id: 'event-coordination', label: 'Event & Group Coordination', modId: 'ops_event_coordination' },
    { id: 'emergency', label: 'Emergency Coordination', modId: 'ops_emergency' },
    { id: 'communication', label: 'Communication Center', modId: 'ops_communication' },
    { id: 'escalations', label: 'Escalation Center', modId: 'ops_escalations' },
    { id: 'sop-compliance', label: 'SOP & Compliance', modId: 'ops_sop_compliance' },
    { id: 'executive-checklists', label: 'Executive Checklists', modId: 'ops_executive_checklists' },
    { id: 'flash-reports', label: 'Daily Flash Reports', modId: 'ops_flash_reports' },
    { id: 'reports', label: 'Reports', modId: 'ops_reports' },
    { id: 'configuration', label: 'Configuration', modId: 'ops_configuration' },
  ],
  /**
   * `admin` and `settings` are dynamic / leaf:
   *  - `admin`: tabs resolved from `CORE_ADMIN_MODULES` at runtime.
   *  - `settings`: single-screen (AccountSettingsModule), no tab set.
   */
} as const;

/** Resolve the tab list for a department key. Returns an empty array for dynamic/leaf departments. */
export function getTabsForDepartment(deptKey: string): readonly TabConfig[] {
  return (DEPARTMENT_TABS as Record<string, readonly TabConfig[]>)[deptKey] ?? [];
}

/** Find a tab config by department key + tab id. */
export function findTab(deptKey: string, tabId: string): TabConfig | undefined {
  return getTabsForDepartment(deptKey).find((t) => t.id === tabId);
}

/**
 * For `executive`/`operations` shared sub-nav usage: given a tab id from the
 * shared set, return the modId with the correct prefix for the active dept.
 * `executive` -> `exec_*`, `operations` -> `ops_*`.
 */
export function resolveExecOpsModId(deptKey: string, tabId: string): string | undefined {
  const base = (DEPARTMENT_TABS.executive as readonly TabConfig[]).find((t) => t.id === tabId);
  if (!base) return undefined;
  const prefix = deptKey === 'operations' ? 'ops' : 'exec';
  return base.modId.replace(/^exec_/, `${prefix}_`);
}
