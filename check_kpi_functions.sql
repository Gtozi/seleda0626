-- Check the KPI trigger functions that fire on INSERT

-- Check calculate_adr_kpi function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'calculate_adr_kpi';

-- Check calculate_revpar_kpi function  
SELECT proname, prosrc FROM pg_proc WHERE proname = 'calculate_revpar_kpi';

-- Check trigger_update_analytics function
SELECT proname, prosrc FROM pg_proc WHERE proname = 'trigger_update_analytics';