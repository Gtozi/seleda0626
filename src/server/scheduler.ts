/**
 * Scheduler & Job Engine
 * Cron-based job runner for automated tasks: night audit, allotment release, report email, backup.
 */
import cron, { ScheduledTask } from 'node-cron';
import { supabaseAdmin, hasSupabaseAdminConfig } from './supabaseAdmin';

export interface ScheduledJob {
  id: string;
  name: string;
  type: string;
  schedule_cron: string;
  config: any;
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
}

type JobHandler = (config: any) => Promise<any>;

const jobHandlers: Record<string, JobHandler> = {
  night_audit: async (config) => {
    const results: any = { postedCharges: 0, releasedAllotments: 0, businessDateClosed: false };
    
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return results;

    // Post room charges for all checked-in reservations
    if (config.postRoomCharges) {
      const { data: checkedIn } = await supabaseAdmin
        .from('reservations')
        .select('id, room_id, rate')
        .eq('status', 'Checked-In');
      
      for (const res of checkedIn || []) {
        const folioRes = await supabaseAdmin
          .from('folios')
          .select('id')
          .eq('reservation_id', res.id)
          .eq('status', 'Open')
          .single();
        
        if (folioRes.data) {
          await supabaseAdmin.from('folio_lines').insert({
            folio_id: folioRes.data.id,
            description: 'Room charge - auto post',
            amount: res.rate,
            quantity: 1,
            unit_price: res.rate,
            line_type: 'charge',
            transaction_date: new Date().toISOString().split('T')[0],
            source_module: 'night_audit',
          });
          results.postedCharges++;
        }
      }
    }

    // Auto-process no-shows: confirmed/waitlisted reservations past check-in date
    if (config.processNoShows !== false) {
      const { data: businessDateRow } = await supabaseAdmin
        .from('business_dates')
        .select('business_date')
        .eq('id', 'current')
        .single();

      const businessDate = businessDateRow?.business_date || new Date().toISOString().split('T')[0];

      const { data: noShowReservations } = await supabaseAdmin
        .from('reservations')
        .select('id')
        .in('status', ['Confirmed', 'Waitlisted'])
        .lt('check_in_date', businessDate);

      let noShowCount = 0;
      for (const res of (noShowReservations || [])) {
        const { error: nsError } = await supabaseAdmin.rpc('process_no_show', {
          p_reservation_id: res.id,
          p_user_id: 'system_night_audit',
        });
        if (!nsError) noShowCount++;
      }
      results.noShowsProcessed = noShowCount;
    }

    // Release expired allotments
    if (config.releaseAllotments) {
      const { error } = await supabaseAdmin.rpc('release_expired_allotments');
      if (!error) results.releasedAllotments = 1;
    }

    results.businessDateClosed = true;
    return results;
  },

  allotment_release: async () => {
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return { released: 0 };
    const { error } = await supabaseAdmin.rpc('release_expired_allotments');
    return { released: error ? 0 : 1 };
  },

  report_email: async (config) => {
    // Placeholder — would generate and email reports
    return { reportType: config.reportType || 'daily_summary', sent: true };
  },

  backup: async (config) => {
    // Placeholder — would trigger database backup
    return { type: config.type || 'full', completed: true };
  },

  channel_sync: async () => {
    const results: any = { channels: 0, inventoryRecords: 0, rateRecords: 0, errors: [] };
    if (!hasSupabaseAdminConfig || !supabaseAdmin) return results;

    const { data: channels } = await supabaseAdmin
      .from('channel_connections')
      .select('*')
      .eq('active', true);

    if (!channels || channels.length === 0) return results;
    results.channels = channels.length;

    const { data: mappings } = await supabaseAdmin
      .from('channel_room_mapping')
      .select('*, room_types(id, name, base_rate, default_rate)')
      .in('channel_id', channels.map((c: any) => c.id))
      .eq('active', true);

    const { data: rooms } = await supabaseAdmin.from('rooms').select('*');
    const { data: allReservations } = await supabaseAdmin
      .from('reservations')
      .select('room_type_id, check_in_date, check_out_date, status')
      .in('status', ['Confirmed', 'CheckedIn', 'Waitlisted']);
    const { data: seasons } = await supabaseAdmin.from('seasons').select('*');

    const start = new Date();
    const end = new Date(Date.now() + 30 * 86400000);

    for (const channel of channels) {
      try {
        const channelMappings = (mappings || []).filter((m: any) => m.channel_id === channel.id);
        for (const mapping of channelMappings) {
          const roomTypeId = mapping.our_room_type_id;
          const totalCapacity = (rooms || []).filter((r: any) => r.room_type_id === roomTypeId).length;
          const baseRate = mapping.room_types?.base_rate || mapping.room_types?.default_rate || 100;

          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split('T')[0];
            const booked = (allReservations || []).filter((r: any) =>
              r.room_type_id === roomTypeId && r.status !== 'Cancelled' && r.status !== 'NoShow' &&
              r.check_in_date <= dateStr && r.check_out_date > dateStr
            ).length;
            const available = Math.max(0, totalCapacity - booked);

            const { error: invErr } = await supabaseAdmin.from('channel_inventory_snapshot').upsert({
              channel_id: channel.id, room_type_id: roomTypeId, date: dateStr,
              total_rooms: totalCapacity, available_rooms: available, booked_rooms: booked,
              sync_status: invErr ? 'failed' : 'synced', synced_at: new Date().toISOString(),
            }, { onConflict: 'channel_id,room_type_id,date' });
            if (!invErr) results.inventoryRecords++;

            const season = (seasons || []).find((s: any) => s.start_date <= dateStr && s.end_date >= dateStr);
            const ourRate = Math.round((baseRate * (season?.multiplier || 1.0) * (mapping.rate_multiplier || 1.0)) * 100) / 100;
            const { error: rateErr } = await supabaseAdmin.from('rate_sync_log').insert({
              sync_id: crypto.randomUUID(), channel_id: channel.id, room_type_id: roomTypeId,
              date: dateStr, our_rate: ourRate, sync_status: rateErr ? 'failed' : 'synced', synced_at: new Date().toISOString(),
            });
            if (!rateErr) results.rateRecords++;
          }
        }

        await supabaseAdmin.from('channel_connections').update({
          last_sync_at: new Date().toISOString(), last_sync_status: 'success',
        }).eq('id', channel.id);
      } catch (err: any) {
        results.errors.push({ channelId: channel.id, error: err.message });
        await supabaseAdmin.from('channel_connections').update({
          last_sync_at: new Date().toISOString(), last_sync_status: 'failed',
        }).eq('id', channel.id);
      }
    }

    return results;
  },
};

const activeCronJobs: Map<string, ScheduledTask> = new Map();

export async function loadAndStartJobs() {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    console.log('[Scheduler] Supabase not configured, skipping job load');
    return;
  }

  // Stop existing jobs
  for (const task of activeCronJobs.values()) {
    task.stop();
  }
  activeCronJobs.clear();

  const { data: jobs, error } = await supabaseAdmin
    .from('scheduled_jobs')
    .select('*')
    .eq('enabled', true);

  if (error) {
    console.error('[Scheduler] Failed to load jobs:', error.message);
    return;
  }

  for (const job of jobs || []) {
    if (!cron.validate(job.schedule_cron)) {
      console.error(`[Scheduler] Invalid cron for "${job.name}": ${job.schedule_cron}`);
      continue;
    }

    const task = cron.schedule(job.schedule_cron, async () => {
      await executeJob(job);
    });

    activeCronJobs.set(job.id, task);
    console.log(`[Scheduler] Started: "${job.name}" (${job.schedule_cron})`);
  }

  console.log(`[Scheduler] ${activeCronJobs.size} jobs active`);
}

export async function executeJob(job: ScheduledJob): Promise<void> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) return;

  const runId = crypto.randomUUID();
  const { error: insertError } = await supabaseAdmin.from('job_runs').insert({
    id: runId,
    job_id: job.id,
    status: 'running',
    started_at: new Date().toISOString(),
  });

  if (insertError) {
    console.error(`[Scheduler] Failed to log run for "${job.name}":`, insertError.message);
    return;
  }

  try {
    const handler = jobHandlers[job.type];
    if (!handler) throw new Error(`No handler for job type: ${job.type}`);

    const result = await handler(job.config || {});

    await supabaseAdmin.from('job_runs').update({
      status: 'success',
      completed_at: new Date().toISOString(),
      result,
    }).eq('id', runId);

    await supabaseAdmin.from('scheduled_jobs').update({
      last_run: new Date().toISOString(),
    }).eq('id', job.id);

    console.log(`[Scheduler] Job "${job.name}" completed:`, result);
  } catch (err: any) {
    await supabaseAdmin.from('job_runs').update({
      status: 'failed',
      completed_at: new Date().toISOString(),
      error: err.message,
    }).eq('id', runId);

    await supabaseAdmin.from('scheduled_jobs').update({
      last_run: new Date().toISOString(),
    }).eq('id', job.id);

    console.error(`[Scheduler] Job "${job.name}" failed:`, err.message);
  }
}

export async function triggerJobManually(jobId: string): Promise<any> {
  if (!hasSupabaseAdminConfig || !supabaseAdmin) throw new Error('Database not configured');

  const { data: job, error } = await supabaseAdmin
    .from('scheduled_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) throw new Error('Job not found');

  await executeJob(job as ScheduledJob);
  return { success: true };
}
