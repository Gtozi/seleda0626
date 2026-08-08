import { Router } from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';
import { hasSupabaseAdminConfig, supabaseAdmin } from '../supabaseAdmin';
import { getGlobalSettings } from '../services/settingsService';
import { processApiIntegrationsOnRead } from '../services/sessionService';

const router = Router();

// Single settings read endpoint with a lightweight checksum for stale-context detection
router.get('/', authenticate, async (_req, res) => {
  if (hasSupabaseAdminConfig && supabaseAdmin) {
    const data = await getGlobalSettings();
    if (!data) return res.json({ settings: null, checksum: null });

    // Mask API keys on read — use encrypted_api_integrations if available, fall back to api_integrations
    const encryptedIntegrations = data.encrypted_api_integrations || data.api_integrations;
    data.api_integrations = processApiIntegrationsOnRead(encryptedIntegrations);
    if (data.encrypted_api_integrations) data.encrypted_api_integrations = undefined;

    // Return version and checksum in response headers (Step 2.5)
    if (data.settings_version) res.setHeader('X-Settings-Version', String(data.settings_version));
    if (data.settings_checksum) res.setHeader('X-Settings-Checksum', data.settings_checksum);

    const checksum = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    return res.json({
      settings: data,
      checksum,
      version: data.settings_version || data.updated_at || data.created_at || null,
    });
  }
  return res.status(503).json({ error: 'Database not configured' });
});

export default router;
