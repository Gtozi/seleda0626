import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requirePermission } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { writeAuditEvent } from '../services/sharedServices';
import { reportEmailSchema, historicalStatsSchema } from '../../schemas/reportsSchema';

const router = Router();

// Dispatch a report to a distribution list. Records a "Sent" version and audit
// trail. Performs an actual SMTP send when SMTP_* env vars are configured;
// otherwise the message is queued/logged so the workflow stays functional.
router.post('/email', authenticate, requirePermission('reports:export'), async (req, res) => {
  const validation = reportEmailSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { reportName, recipients, fileSize, summary } = validation.data;
  const recipientList: string[] = Array.isArray(recipients) ? recipients : [recipients];

  const smtpConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
  let dispatched = false;
  let dispatchError: string | undefined;

  if (smtpConfigured) {
    try {
      const nodemailer = await import('nodemailer');
      const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
      await transport.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: recipientList.join(', '),
        subject: `[SELEDA Hotel ERP] ${reportName}`,
        text: summary || `Attached/summary for ${reportName}.`,
      });
      dispatched = true;
    } catch (err: any) {
      dispatchError = err?.message || 'SMTP dispatch failed';
    }
  }

  let version: unknown = null;
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('report_versions')
      .insert({
        report_name: reportName,
        file_size: fileSize || null,
        status: 'Sent',
        generated_by: req.user?.name || req.user?.id || null,
      })
      .select()
      .maybeSingle();
    version = data;
  }

  await writeAuditEvent({
    req,
    user: req.user,
    action: 'report.email_dispatched',
    entityType: 'Report',
    entityId: reportName,
    module: 'reports',
    outcome: dispatched || !smtpConfigured ? 'success' : 'failure',
    details: { recipients: recipientList, dispatched, queuedOnly: !smtpConfigured, dispatchError },
  });

  return res.json({
    success: true,
    dispatched,
    queuedOnly: !smtpConfigured,
    recipients: recipientList,
    version,
    message: dispatched
      ? 'Report emailed successfully.'
      : smtpConfigured
        ? `Dispatch failed: ${dispatchError}`
        : 'SMTP not configured; dispatch recorded and queued.',
  });
});

// Historical stats
router.get('/historical-stats', authenticate, requirePermission('reports:view'), async (req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('historical_stats')
      .select('*')
      .order('business_date', { ascending: false })
      .limit(60);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ stats: data || [] });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

router.post('/historical-stats', authenticate, requirePermission('reports:export'), async (req, res) => {
  const validation = historicalStatsSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ error: 'Validation failed', details: validation.error.flatten() });
  }

  const { businessDate, occupancy, roomRevenue, ancillaryRevenue, adr, revpar, guestSatisfaction } = validation.data;

  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from('historical_stats')
      .insert({
        business_date: businessDate,
        occupancy: occupancy ?? null,
        room_revenue: roomRevenue ?? null,
        ancillary_revenue: ancillaryRevenue ?? null,
        adr: adr ?? null,
        revpar: revpar ?? null,
        guest_satisfaction: guestSatisfaction ?? null
      })
      .select()
      .single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ success: true, stat: data });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
