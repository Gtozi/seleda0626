import './src/server/env';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
// Composed API router — single mount point for all route files.
// See ROUTE_DRIVEN_MIGRATION_PLAN.md for the full migration plan.
import apiRouter from './src/server/routes/index';
// Session/auth helpers (used for health endpoint + table initialization).
import {
  IS_FALLBACK_MODE,
  ensureAuditEventsTable,
  ensurePendingAdminChangesTable,
} from './src/server/services/sessionService';

if (typeof globalThis.DOMException === 'undefined') {
  // @ts-ignore
  import('node-domexception').then((mod) => {
    globalThis.DOMException = mod.default;
  }).catch(() => {});
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  // Production guard: refuse to start if Supabase env vars are missing
  if (IS_PRODUCTION && (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)) {
    console.error('[FATAL] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in production. Refusing to start.');
    process.exit(1);
  }

  await ensurePendingAdminChangesTable();
  await ensureAuditEventsTable();

  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'operational',
      system: 'Hotel Management ERP Global Node',
      authStore: IS_FALLBACK_MODE ? 'development-fallback' : 'database',
      timestamp: new Date().toISOString(),
    });
  });

  // ═══════════════════════════════════════════════════════════
  // COMPOSED API ROUTER (Phase 2 — route-driven migration)
  // ═══════════════════════════════════════════════════════════
  // All API routes are now mounted via the composed apiRouter.
  // Inline handlers have been extracted into route files in
  // src/server/routes/. See ROUTE_DRIVEN_MIGRATION_PLAN.md.
  app.use('/api', apiRouter);

  // Vite SPA middleware — registered AFTER all API routes so POST/PUT/DELETE
  // requests to /api/* are matched before Vite intercepts them.
  const isProduction = process.env.NODE_ENV === 'production' || process.argv[1]?.includes('dist/server.cjs') || process.argv[1]?.includes('dist\\server.cjs');
  const distPath = path.join(process.cwd(), 'dist');
  const distIndex = path.join(distPath, 'index.html');
  if (!isProduction && fs.existsSync(distIndex)) {
    try { fs.unlinkSync(distIndex); } catch { /* ignore */ }
  }
  const hasBuiltApp = fs.existsSync(distIndex);
  if (!isProduction && !hasBuiltApp) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa',
      root: process.cwd()
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(distIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ERP] Core running at http://localhost:${PORT}`);
    console.log(`[ERP] Auth store: database`);
    // Start scheduler
    import('./src/server/scheduler').then(({ loadAndStartJobs }) => {
      loadAndStartJobs().catch(err => console.error('[Scheduler] Failed to start:', err.message));
    });
  });
}

startServer();
