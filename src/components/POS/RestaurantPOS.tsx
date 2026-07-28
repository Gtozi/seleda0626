/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import { POSOutlet } from './POSPortal';
import ModernPOSTerminal from './ModernPOSTerminal';

interface RestaurantPOSProps {
  outlet: POSOutlet;
}

export default function RestaurantPOS({ outlet }: RestaurantPOSProps) {
  return <ModernPOSTerminal outlet={outlet} />;
}
