-- Add channel sync job to the scheduler
INSERT INTO scheduled_jobs (name, type, schedule_cron, config, enabled)
VALUES (
  'Channel Manager Auto-Sync',
  'channel_sync',
  '0 */4 * * *',
  '{}',
  true
)
ON CONFLICT DO NOTHING;
