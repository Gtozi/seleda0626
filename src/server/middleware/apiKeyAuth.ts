/**
 * API Key Authentication Middleware
 * For external integrations — separate from session-based auth.
 * Validates API keys against the api_keys table.
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { supabaseAdmin, hasSupabaseAdminConfig } from '../supabaseAdmin';

export async function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'API key required' });
  }

  const rawKey = authHeader.slice(7);
  if (!rawKey.startsWith('seleda_')) {
    return res.status(401).json({ error: 'Invalid API key format' });
  }

  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const keyPrefix = rawKey.slice(0, 12);

  if (!hasSupabaseAdminConfig || !supabaseAdmin) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const { data: apiKey, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('key_hash', keyHash)
    .eq('disabled', false)
    .single();

  if (error || !apiKey) {
    return res.status(401).json({ error: 'Invalid or revoked API key' });
  }

  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return res.status(401).json({ error: 'API key expired' });
  }

  // Update last_used
  await supabaseAdmin.from('api_keys').update({ last_used: new Date().toISOString() }).eq('id', apiKey.id);

  // Attach key info to request
  (req as any).apiKey = {
    id: apiKey.id,
    name: apiKey.name,
    scopes: apiKey.scopes || [],
    rateLimit: apiKey.rate_limit,
  };

  next();
}

export function requireScope(scope: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = (req as any).apiKey;
    if (!apiKey) return res.status(401).json({ error: 'API key required' });
    if (!apiKey.scopes.includes(scope) && !apiKey.scopes.includes('*')) {
      return res.status(403).json({ error: `Missing required scope: ${scope}` });
    }
    next();
  };
}
