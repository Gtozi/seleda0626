/**
 * ErpLayout — layout route element for the `/erp/*` subtree.
 *
 * Phase 3 of the route-driven migration (see ROUTE_DRIVEN_MIGRATION_PLAN.md).
 *
 * Owns the cross-department concerns that previously lived inside the
 * `/erp/*` catch-all `<Route>` element in App.tsx:
 *   - Session verification (`sessionChecked`)
 *   - Authentication redirect (`!currentUser` -> `<Navigate to="/login"/>`)
 *   - Forced password change screen (`mustChangePassword`)
 *   - Maintenance-mode banner
 *   - The content area chrome (main wrapper)
 *
 * Renders `<Outlet/>` for the matched department route (DepartmentRoute).
 */

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { getDefaultErpPath } from '../../config/departments';
import { ForcedPasswordChangeScreen } from './ForcedPasswordChangeScreen';
import type { User } from '../../types/erp';

export interface ErpLayoutProps {
  sessionChecked: boolean;
  currentUser: User | null;
  mustChangePassword: boolean;
  onPasswordChanged: () => void;
}

export function ErpLayout({ sessionChecked, currentUser, mustChangePassword, onPasswordChanged }: ErpLayoutProps) {
  const { globalHotelSettings } = useERP();

  // 1. Session not yet verified
  if (!sessionChecked) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-300 text-sm">
        Verifying secure session...
      </div>
    );
  }

  // 2. Not authenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // 3. Forced password change
  if (mustChangePassword) {
    return (
      <ForcedPasswordChangeScreen
        user={currentUser}
        onSuccess={onPasswordChanged}
      />
    );
  }

  // 4. Authenticated — render content area with maintenance banner + Outlet
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300 smooth-transition">
        <div className="p-6 flex-1 min-h-0">
          {globalHotelSettings.maintenanceMode && (
            <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800">
              <ShieldAlert size={18} className="shrink-0 text-amber-500" />
              <p className="text-xs font-bold leading-relaxed">
                {globalHotelSettings.maintenanceMessage || 'The system is undergoing scheduled maintenance. Some features may be temporarily unavailable.'}
              </p>
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/**
 * Index redirect — used as `<Route index element={<ErpIndexRedirect .../>} />`
 * inside the `/erp` layout route. Redirects to the user's default department.
 */
export function ErpIndexRedirect({ currentUser }: { currentUser: User | null }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDefaultErpPath(currentUser)} replace />;
}

export default ErpLayout;
