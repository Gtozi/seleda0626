import React from 'react';
import { resolveAdminModule } from './adminModules';

const AdminPortal = ({ activeModule = 'user_security' }: { activeModule?: string }) => {
  const config = resolveAdminModule(activeModule);
  const Component = config.component;
  return <Component />;
};

export default AdminPortal;
