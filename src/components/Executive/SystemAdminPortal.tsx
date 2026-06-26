import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  Lock, 
  AlertTriangle, 
  LayoutDashboard,
  Settings,
  Activity,
  FileText,
  Database,
  Server,
  ShieldAlert,
  Building2,
  CreditCard,
  Receipt
} from 'lucide-react';
import SystemAdmin from './SystemAdmin';
import AuditCompliance from '../Admin/AuditCompliance';
import SystemHealthDashboard from '../Admin/SystemHealthDashboard';
import BackupRecovery from '../Admin/BackupRecovery';
import PlatformControls from '../Admin/PlatformControls';
import IntegrationsCenter from '../Admin/IntegrationsCenter';
import BusinessAdmin from './BusinessAdmin';

type SystemAdminModule = 'dashboard' | 'users' | 'roles' | 'security' | 'emergency' | 'audit' | 'health' | 'backup' | 'platform' | 'integrations' | 'hotel_details' | 'billing' | 'invoice_settings';

const SystemAdminPortal = ({ activeModule = 'dashboard' }: { activeModule?: string }) => {
  const [currentModule, setCurrentModule] = useState<SystemAdminModule>(activeModule as SystemAdminModule);

  const modules = [
    { id: 'dashboard' as const, label: 'Security Dashboard', icon: LayoutDashboard },
    { id: 'users' as const, label: 'User Management', icon: Users },
    { id: 'roles' as const, label: 'Roles & Permissions', icon: Key },
    { id: 'security' as const, label: 'Security Protocols', icon: Lock },
    { id: 'emergency' as const, label: 'Emergency Controls', icon: AlertTriangle },
    { id: 'audit' as const, label: 'Audit Logs', icon: FileText },
    { id: 'health' as const, label: 'System Health', icon: Activity },
    { id: 'backup' as const, label: 'Backup & Recovery', icon: Database },
    { id: 'platform' as const, label: 'Platform Controls', icon: Server },
    { id: 'integrations' as const, label: 'Integrations', icon: Settings },
    { id: 'hotel_details' as const, label: 'Hotel Details', icon: Building2 },
    { id: 'billing' as const, label: 'Billing', icon: CreditCard },
    { id: 'invoice_settings' as const, label: 'Invoice Settings', icon: Receipt },
  ];

  return (
    <div className="flex flex-col h-full font-sans">
      {/* Module Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-3">
        <div className="flex items-center justify-center gap-2 overflow-x-auto bg-slate-100 p-0.5 border border-slate-200 rounded-xl">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => setCurrentModule(module.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-bold transition-all whitespace-nowrap ${
                  currentModule === module.id
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 bg-white'
                }`}
              >
                <Icon size={14} />
                {module.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 px-1 px-6">
        {currentModule === 'dashboard' && <SystemAdmin initialTab="dashboard" showNav={false} />}
        {currentModule === 'users' && <SystemAdmin initialTab="users" showNav={false} />}
        {currentModule === 'roles' && <SystemAdmin initialTab="roles" showNav={false} />}
        {currentModule === 'security' && <SystemAdmin initialTab="security" showNav={false} />}
        {currentModule === 'emergency' && <SystemAdmin initialTab="emergency" showNav={false} />}
        {currentModule === 'audit' && <AuditCompliance />}
        {currentModule === 'health' && <SystemHealthDashboard />}
        {currentModule === 'backup' && <BackupRecovery />}
        {currentModule === 'platform' && <PlatformControls />}
        {currentModule === 'integrations' && <IntegrationsCenter />}
        {currentModule === 'hotel_details' && <BusinessAdmin initialTab="details" showNav={false} />}
        {currentModule === 'billing' && <BusinessAdmin initialTab="billing" showNav={false} />}
        {currentModule === 'invoice_settings' && <BusinessAdmin initialTab="invoice_settings" showNav={false} />}
      </div>
    </div>
  );
};

export default SystemAdminPortal;
