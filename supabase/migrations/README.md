# Migration Order & Dependencies

## Overview

Migrations are numbered sequentially. Duplicate-numbered files have been renamed with a `b` suffix (e.g., `063_fix.sql` → `063b_fix.sql`) to prevent conflicts.

## Migration History

| # | File | Description | Dependencies |
|---|------|-------------|--------------|
| 001-043 | Various | Core schema (users, rooms, reservations, folios, GL, POS) | — |
| 044 | `044_atomic_booking_rpc.sql` | Atomic booking via `create_booking_atomic` RPC | reservations, rooms |
| 045 | `045_allotment_engine.sql` | Tour operators, allotments, pickup log, release function | reservations |
| 046 | `046_operator_contracts.sql` | Operator contracts, `resolve_operator_rate` function | tour_operators, rate_plans |
| 047 | `047_folios_vouchers_ar.sql` | Persistent folios extensions, vouchers, AR ledger | folios, reservations |
| 048-062 | Various | Bug fixes, feature additions, RLS policies | — |
| 063 | `063_fix_group_auto_link_checkin.sql` | Fix group auto-link on check-in | group_bookings |
| 063b | `063b_fix_ambiguous_id_references.sql` | Fix ambiguous ID references in joins | Multiple |
| 064 | `064_checkin_form_settings.sql` | Check-in form settings | global_settings |
| 064b | `064b_fix_all_ambiguous_id_references.sql` | Fix all remaining ambiguous ID refs | Multiple |
| 065-070 | Various | Features and fixes | — |
| 071 | `071_id_card_storage.sql` | ID card image storage | guests |
| 071b | `071b_link_payments_to_invoices.sql` | Link payments to invoices | invoices, payments |
| 072-084 | Various | Features and fixes | — |
| 085 | `085_executive_portal_schema.sql` | Executive portal schema | system_users |
| 085b | `085b_fix_trigger_function.sql` | Fix trigger function | audit_events |
| 086-108 | Various | Features, RLS, performance | — |
| 109 | `109_audit_triggers.sql` | Audit triggers for all tables | audit_events |
| 109b | `109b_performance_indexes.sql` | Performance indexes | Multiple |
| 110-114 | Various | RLS policies, maintenance PM, sales events | — |
| 115 | `115_sales_events_tables.sql` | Sales leads, proposals, contracts, group blocks | — |
| 116 | `116_enable_rls_remaining_tables.sql` | RLS on remaining unprotected tables | 112-115 |
| 117 | `117_guest_in_stay_requests.sql` | Guest in-stay requests, folio view | folios, folio_lines |
| 118 | `118_org_property_hierarchy.sql` | Organizations, properties, property_id columns | global_settings, rooms, system_users |
| 119 | `119_scheduler_tables.sql` | Scheduled jobs, job runs | — |
| 120 | `120_compliance_tables.sql` | Consent logs, retention policies, PII requests | guests |
| 121 | `121_health_monitoring.sql` | Health checks, error logs | — |
| 122 | `122_config_versioning.sql` | Config version tracking, triggers | global_settings, custom_roles |
| 123 | `123_api_management.sql` | API keys table | — |

## Renamed Duplicates (2026-07-19)

| Original | Renamed To |
|----------|-----------|
| `053_payment_safeguards.sql` | `053b_payment_safeguards.sql` |
| `063_fix_ambiguous_id_references.sql` | `063b_fix_ambiguous_id_references.sql` |
| `064_fix_all_ambiguous_id_references.sql` | `064b_fix_all_ambiguous_id_references.sql` |
| `071_link_payments_to_invoices.sql` | `071b_link_payments_to_invoices.sql` |
| `085_fix_trigger_function.sql` | `085b_fix_trigger_function.sql` |
| `109_performance_indexes.sql` | `109b_performance_indexes.sql` |

## Notes

- Migrations 001-043 were part of the initial schema baseline.
- All migrations use `IF NOT EXISTS` / `ON CONFLICT DO NOTHING` where possible to be idempotent.
- RLS policies are applied per-table and require `authenticated` role.
- Audit triggers on `global_settings`, `rooms`, `system_users`, `reservations`, `folios` require `audit_events.id` to be auto-generated (UUID default).
