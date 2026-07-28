/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ERPProvider } from './ERPContext';
import { GroupProvider } from './GroupContext';
import { ModalReturnProvider } from './ModalReturnContext';

/**
 * Single composed provider wrapper to reduce nesting depth in App.tsx.
 * ERPProvider internally composes System, Guest, Reservation, Inventory,
 * Finance, Pricing, and Operations providers.
 */
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ERPProvider>
      <GroupProvider>
        <ModalReturnProvider>
          {children}
        </ModalReturnProvider>
      </GroupProvider>
    </ERPProvider>
  );
};
